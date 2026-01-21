#![cfg_attr(
    all(not(debug_assertions), target_os = "macos"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::path::PathBuf;
use std::fs;
use tauri::State;

// Model state wrapper
struct ModelState {
    backend: Mutex<Option<llama_cpp_2::llama_backend::LlamaBackend>>,
    model_path: Mutex<Option<PathBuf>>,
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
    get_model_dir().join("gemma-3-1b.gguf")
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

// Download the model from Hugging Face
#[tauri::command]
async fn download_model(window: tauri::Window) -> Result<String, String> {
    use futures_util::StreamExt;

    let model_dir = get_model_dir();
    let model_path = get_model_path();

    // Create directory if it doesn't exist
    fs::create_dir_all(&model_dir)
        .map_err(|e| format!("Failed to create model directory: {}", e))?;

    // Hugging Face URL for Gemma 3 1B GGUF (Q2_K quantization - smaller ~350MB download)
    let url = "https://huggingface.co/bartowski/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q2_K.gguf";

    let client = reqwest::Client::new();
    let response = client.get(url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

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

        // Emit progress event
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

// Initialize the model backend
#[tauri::command]
async fn init_model(state: State<'_, ModelState>) -> Result<String, String> {
    let model_path = get_model_path();

    if !model_path.exists() {
        return Err("Model not found. Please download the model first.".to_string());
    }

    // Initialize llama backend
    let backend = llama_cpp_2::llama_backend::LlamaBackend::init()
        .map_err(|e| format!("Failed to initialize backend: {:?}", e))?;

    let mut backend_guard = state.backend.lock().map_err(|e| e.to_string())?;
    *backend_guard = Some(backend);

    let mut path_guard = state.model_path.lock().map_err(|e| e.to_string())?;
    *path_guard = Some(model_path);

    Ok("Model initialized successfully".to_string())
}

// Chat completion command
#[tauri::command]
async fn chat_completion(
    request: ChatRequest,
    state: State<'_, ModelState>,
) -> Result<ChatResponse, String> {
    let backend_guard = state.backend.lock().map_err(|e| e.to_string())?;
    let path_guard = state.model_path.lock().map_err(|e| e.to_string())?;

    let backend = backend_guard.as_ref()
        .ok_or("Model not initialized. Call init_model first.")?;
    let model_path = path_guard.as_ref()
        .ok_or("Model path not set")?;

    // Load model
    let model_params = llama_cpp_2::model::params::LlamaModelParams::default();
    let model = llama_cpp_2::model::LlamaModel::load_from_file(backend, model_path, &model_params)
        .map_err(|e| format!("Failed to load model: {:?}", e))?;

    // Create context
    let ctx_params = llama_cpp_2::context::params::LlamaContextParams::default()
        .with_n_ctx(std::num::NonZeroU32::new(2048));

    let mut ctx = model.new_context(backend, ctx_params)
        .map_err(|e| format!("Failed to create context: {:?}", e))?;

    // Format messages into prompt
    let prompt: String = request
        .messages
        .iter()
        .map(|m| {
            match m.role.as_str() {
                "user" => format!("<start_of_turn>user\n{}<end_of_turn>\n", m.content),
                "assistant" => format!("<start_of_turn>model\n{}<end_of_turn>\n", m.content),
                _ => format!("{}: {}\n", m.role, m.content),
            }
        })
        .collect::<String>() + "<start_of_turn>model\n";

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
    let output = output_tokens.iter()
        .filter_map(|t| model.token_to_str(*t, llama_cpp_2::model::Special::Tokenize).ok())
        .collect::<String>();

    Ok(ChatResponse { response: output })
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

fn main() {
    tauri::Builder::default()
        .manage(ModelState {
            backend: Mutex::new(None),
            model_path: Mutex::new(None),
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
