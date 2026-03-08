#![cfg_attr(
    all(not(debug_assertions), target_os = "macos"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::path::PathBuf;
use std::fs;
use tauri::State;

// Channel-based inference commands
enum InferenceCommand {
    Init {
        resp_tx: tokio::sync::oneshot::Sender<Result<String, String>>,
    },
    ChatCompletion {
        request: ChatRequest,
        resp_tx: tokio::sync::oneshot::Sender<Result<ChatResponse, String>>,
    },
}

// Model state - holds sender to the dedicated inference thread
struct ModelState {
    cmd_tx: Mutex<std::sync::mpsc::Sender<InferenceCommand>>,
}

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct ChatRequest {
    messages: Vec<ChatMessage>,
    model: Option<String>,
}

#[derive(Serialize)]
struct ChatResponse {
    response: String,
}

#[derive(Serialize)]
struct ModelStatus {
    installed: bool,
    path: String,
    size_mb: Option<u64>,
}

// Get the model directory path
fn get_model_dir() -> PathBuf {
    let app_support = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."));
    app_support.join("G3").join("models")
}

// Get the full model path
fn get_model_path() -> PathBuf {
    get_model_dir().join("qwen3-1.7b-q5_k_m.gguf")
}

// Check if model is installed
#[tauri::command]
async fn check_model_status() -> Result<ModelStatus, String> {
    let model_path = get_model_path();
    let installed = model_path.exists();

    let size_mb = if installed {
        fs::metadata(&model_path)
            .map(|m| m.len() / (1024 * 1024))
            .ok()
    } else {
        None
    };

    Ok(ModelStatus {
        installed,
        path: model_path.to_string_lossy().to_string(),
        size_mb,
    })
}

// Get HuggingFace token from ~/.cache/huggingface/token
fn get_hf_token() -> Option<String> {
    let home = dirs::home_dir()?;
    let token_path = home.join(".cache").join("huggingface").join("token");
    fs::read_to_string(token_path).ok().map(|s| s.trim().to_string())
}

// Download the model from Hugging Face
#[tauri::command]
async fn download_model(window: tauri::Window) -> Result<String, String> {
    use futures_util::StreamExt;

    let model_dir = get_model_dir();
    let model_path = get_model_path();

    // Create directory if it doesn't exist
    fs::create_dir_all(&model_dir)
        .map_err(|e| format!("Failed to create model directory: {}", e))?;

    // Qwen3-1.7B Q5_K_M GGUF (from unsloth, ~1.26 GB)
    let url = "https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q5_K_M.gguf";

    let hf_token = get_hf_token();

    let client = reqwest::Client::new();
    let mut request = client.get(url);

    if let Some(token) = &hf_token {
        request = request.header("Authorization", format!("Bearer {}", token));
    }

    let response = request
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    if response.status() == reqwest::StatusCode::UNAUTHORIZED {
        return Err("Authentication required. Please run 'huggingface-cli login' in your terminal first.".to_string());
    }

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    let total_size = response.content_length().unwrap_or(0);

    let mut file = fs::File::create(&model_path)
        .map_err(|e| format!("Failed to create model file: {}", e))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    use std::io::Write;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Download error: {}", e))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Failed to write to file: {}", e))?;

        downloaded += chunk.len() as u64;

        let progress = if total_size > 0 {
            (downloaded as f64 / total_size as f64 * 100.0) as u32
        } else {
            0
        };

        let _ = window.emit("download-progress", serde_json::json!({
            "downloaded": downloaded,
            "total": total_size,
            "progress": progress
        }));
    }

    Ok(format!("Model downloaded to: {}", model_path.display()))
}

// Initialize the model backend (idempotent — safe to call multiple times)
#[tauri::command]
async fn init_model(state: State<'_, ModelState>) -> Result<String, String> {
    let (resp_tx, resp_rx) = tokio::sync::oneshot::channel();
    {
        let cmd_tx = state.cmd_tx.lock().map_err(|e| e.to_string())?;
        cmd_tx.send(InferenceCommand::Init { resp_tx })
            .map_err(|e| format!("Failed to send init command: {}", e))?;
    }
    resp_rx.await
        .map_err(|e| format!("Inference thread dropped: {}", e))?
}

// Chat completion command
#[tauri::command]
async fn chat_completion(
    request: ChatRequest,
    state: State<'_, ModelState>,
) -> Result<ChatResponse, String> {
    let (resp_tx, resp_rx) = tokio::sync::oneshot::channel();
    {
        let cmd_tx = state.cmd_tx.lock().map_err(|e| e.to_string())?;
        cmd_tx.send(InferenceCommand::ChatCompletion { request, resp_tx })
            .map_err(|e| format!("Failed to send chat command: {}", e))?;
    }
    resp_rx.await
        .map_err(|e| format!("Inference thread dropped: {}", e))?
}

// Simple text generation
#[tauri::command]
async fn generate_text(
    prompt: String,
    _max_tokens: Option<u32>,
    state: State<'_, ModelState>,
) -> Result<String, String> {
    let request = ChatRequest {
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: prompt,
        }],
        model: None,
    };

    let response = chat_completion(request, state).await?;
    Ok(response.response)
}

// Run inference using the already-loaded model (called on the inference thread)
fn run_inference(
    backend: &llama_cpp_2::llama_backend::LlamaBackend,
    model: &llama_cpp_2::model::LlamaModel,
    request: ChatRequest,
) -> Result<ChatResponse, String> {
    // Create context
    let ctx_params = llama_cpp_2::context::params::LlamaContextParams::default()
        .with_n_ctx(std::num::NonZeroU32::new(2048));

    let mut ctx = model.new_context(backend, ctx_params)
        .map_err(|e| format!("Failed to create context: {:?}", e))?;

    // Format messages into Qwen3 ChatML template
    let mut prompt = String::new();

    // Add system message if not present in request
    let has_system = request.messages.iter().any(|m| m.role == "system");
    if !has_system {
        prompt.push_str("<|im_start|>system\nYou are a helpful language learning assistant. Provide clear, concise responses. Respond directly without thinking.<|im_end|>\n");
    }

    for msg in &request.messages {
        prompt.push_str(&format!(
            "<|im_start|>{}\n{}<|im_end|>\n",
            msg.role, msg.content
        ));
    }

    // Prompt the assistant to respond
    prompt.push_str("<|im_start|>assistant\n");

    // Tokenize
    let tokens = model.str_to_token(&prompt, llama_cpp_2::model::AddBos::Always)
        .map_err(|e| format!("Tokenization error: {:?}", e))?;

    // Create batch and decode
    let mut batch = llama_cpp_2::llama_batch::LlamaBatch::new(512, 1);

    for (i, token) in tokens.iter().enumerate() {
        batch.add(*token, i as i32, &[0], i == tokens.len() - 1)
            .map_err(|e| format!("Batch add error: {:?}", e))?;
    }

    ctx.decode(&mut batch)
        .map_err(|e| format!("Decode error: {:?}", e))?;

    let mut output_tokens = Vec::new();
    let mut n_cur = tokens.len();

    // Generate tokens
    for _ in 0..512 {
        let candidates = ctx.candidates_ith(batch.n_tokens() - 1);
        let new_token_id = llama_cpp_2::token::data_array::LlamaTokenDataArray::from_iter(candidates, false)
            .sample_token_greedy();

        if model.is_eog_token(new_token_id) {
            break;
        }

        output_tokens.push(new_token_id);

        batch.clear();
        batch.add(new_token_id, n_cur as i32, &[0], true)
            .map_err(|e| format!("Batch add error: {:?}", e))?;

        n_cur += 1;

        ctx.decode(&mut batch)
            .map_err(|e| format!("Decode error: {:?}", e))?;
    }

    // Convert tokens to string
    let mut output = output_tokens.iter()
        .filter_map(|t| model.token_to_str(*t, llama_cpp_2::model::Special::Tokenize).ok())
        .collect::<String>();

    // Strip any trailing <|im_end|> token text
    if let Some(idx) = output.find("<|im_end|>") {
        output.truncate(idx);
    }

    // Strip <think>...</think> blocks if present (Qwen3 thinking mode output)
    if let Some(think_start) = output.find("<think>") {
        if let Some(think_end) = output.find("</think>") {
            let after_think = &output[think_end + 8..];
            output = after_think.trim().to_string();
        }
    }

    Ok(ChatResponse { response: output.trim().to_string() })
}

// Dedicated inference thread — model stays loaded for the lifetime of the app
fn inference_thread(cmd_rx: std::sync::mpsc::Receiver<InferenceCommand>) {
    loop {
        let cmd = match cmd_rx.recv() {
            Ok(cmd) => cmd,
            Err(_) => return, // Channel closed, app shutting down
        };

        match cmd {
            InferenceCommand::Init { resp_tx } => {
                let model_path = get_model_path();
                if !model_path.exists() {
                    let _ = resp_tx.send(Err(
                        "Model not found. Please download the model first.".to_string()
                    ));
                    continue;
                }

                let backend = match llama_cpp_2::llama_backend::LlamaBackend::init() {
                    Ok(b) => b,
                    Err(e) => {
                        let _ = resp_tx.send(Err(
                            format!("Failed to initialize backend: {:?}", e)
                        ));
                        continue;
                    }
                };

                let model_params = llama_cpp_2::model::params::LlamaModelParams::default();
                let model = match llama_cpp_2::model::LlamaModel::load_from_file(
                    &backend, &model_path, &model_params
                ) {
                    Ok(m) => m,
                    Err(e) => {
                        let _ = resp_tx.send(Err(
                            format!("Failed to load model: {:?}", e)
                        ));
                        continue;
                    }
                };

                let _ = resp_tx.send(Ok("Model initialized successfully".to_string()));

                // Model is loaded — process all subsequent requests with it cached
                while let Ok(cmd) = cmd_rx.recv() {
                    match cmd {
                        InferenceCommand::Init { resp_tx } => {
                            let _ = resp_tx.send(Ok(
                                "Model already initialized".to_string()
                            ));
                        }
                        InferenceCommand::ChatCompletion { request, resp_tx } => {
                            let result = run_inference(&backend, &model, request);
                            let _ = resp_tx.send(result);
                        }
                    }
                }
                return; // Channel closed
            }
            InferenceCommand::ChatCompletion { resp_tx, .. } => {
                let _ = resp_tx.send(Err(
                    "Model not initialized. Call init_model first.".to_string()
                ));
            }
        }
    }
}

fn main() {
    let (cmd_tx, cmd_rx) = std::sync::mpsc::channel();

    std::thread::spawn(move || {
        inference_thread(cmd_rx);
    });

    tauri::Builder::default()
        .manage(ModelState {
            cmd_tx: Mutex::new(cmd_tx),
        })
        .invoke_handler(tauri::generate_handler![
            check_model_status,
            download_model,
            init_model,
            chat_completion,
            generate_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
