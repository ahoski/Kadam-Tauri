# Kadam - Language Learning Desktop App

Kadam is a desktop application for learning languages through interactive comic-based stories, quizzes, and vocabulary building. It uses offline AI (Gemma 3 1B) for translations, sentence generation, and learning assistance - no internet required for core features.

**Supported Languages:** Hindi, Telugu, Tamil, Spanish, French, German

## Features

- Interactive comic-based stories with vocabulary highlights
- Multiple quiz types: MCQ, sentence reordering, passage comprehension, free response
- Word vault for tracking learned vocabulary
- Flashcard review mode
- Fully offline AI-powered assistance

## Prerequisites

### macOS

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Install Node.js**
   ```bash
   brew install node
   ```

4. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

5. **Install CMake** (required for llama-cpp-2)
   ```bash
   brew install cmake
   ```

6. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

### Windows

1. **Install Node.js**
   - Download and install from [nodejs.org](https://nodejs.org/)

2. **Install Rust**
   - Download and run [rustup-init.exe](https://rustup.rs/)
   - Follow the prompts to install

3. **Install Visual Studio Build Tools**
   - Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install "Desktop development with C++" workload

4. **Install CMake**
   - Download and install from [cmake.org](https://cmake.org/download/)
   - Ensure CMake is added to PATH during installation

5. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

## Model Setup (Required)

The app requires the Gemma 3 1B GGUF model for AI features. Download it before running:

### Option 1: Using Hugging Face CLI

```bash
# Install huggingface-cli
# macOS:
brew install huggingface-cli

# Windows (using pip):
pip install huggingface_hub

# Create models directory
mkdir -p src-tauri/models

# Download the model (no authentication required for this repo)
huggingface-cli download bartowski/google_gemma-3-1b-it-GGUF \
  --include "google_gemma-3-1b-it-Q4_K_M.gguf" \
  --local-dir src-tauri/models

# Rename to expected filename
mv src-tauri/models/google_gemma-3-1b-it-Q4_K_M.gguf src-tauri/models/gemma-3-1b.gguf
```

### Option 2: Manual Download

1. Visit [bartowski/google_gemma-3-1b-it-GGUF](https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF)
2. Download `google_gemma-3-1b-it-Q4_K_M.gguf` (~806 MB)
3. Place it in `src-tauri/models/` and rename to `gemma-3-1b.gguf`

## Installation

```bash
# Clone the repository
git clone https://github.com/ahoski/Kadam-Tauri.git
cd Kadam-Tauri

# Install dependencies
npm install
```

## Running the App

### Development Mode

```bash
npm run tauri:dev
```

This starts the app with hot-reload enabled. Changes to source files will automatically rebuild.

### Production Build

```bash
npm run tauri:build
```

**Build output locations:**

| Platform | Output |
|----------|--------|
| macOS | `src-tauri/target/release/bundle/dmg/G3_1.0.0_aarch64.dmg` (Apple Silicon) |
| macOS | `src-tauri/target/release/bundle/dmg/G3_1.0.0_x64.dmg` (Intel) |
| Windows | `src-tauri/target/release/bundle/msi/G3_1.0.0_x64_en-US.msi` |
| Windows | `src-tauri/target/release/bundle/nsis/G3_1.0.0_x64-setup.exe` |

## Project Structure

```
Kadam-Tauri/
├── src/                    # Frontend (HTML/CSS/JavaScript)
│   ├── index.html         # Main dashboard
│   ├── js/
│   │   └── tauri-api.js   # Frontend-to-backend API bridge
│   ├── pages/             # App pages (story, quiz, wordVault, etc.)
│   └── stories/           # Story content files
├── src-tauri/             # Backend (Rust)
│   ├── src/main.rs        # Tauri commands and AI integration
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Tauri configuration
│   └── models/            # AI model directory (create this)
└── package.json           # Node.js configuration
```

## Troubleshooting

### Build fails with "cmake not found"

Install CMake:
- macOS: `brew install cmake`
- Windows: Download from [cmake.org](https://cmake.org/download/) and add to PATH

### Build fails with "llama-cpp-2" error

Ensure CMake is installed and accessible from the command line:
```bash
cmake --version
```

### Model not loading

Verify the model file exists and has the correct name:
```bash
ls -la src-tauri/models/gemma-3-1b.gguf
```

### App starts but AI features don't work

1. Check that the model file is in the correct location
2. Check the app logs for model loading errors
3. Ensure you have sufficient RAM (~2GB free for the model)

### Windows: Rust compilation errors

Ensure Visual Studio Build Tools are installed with the "Desktop development with C++" workload.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Backend:** Rust with Tauri 1.6
- **AI Engine:** llama-cpp-2 (Gemma 3 1B model)
- **Build:** Cargo + npm

## License

[Add your license here]
