# G3 App - Build Instructions for macOS (.dmg)

## Prerequisites

1. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **Install Node.js** (for Tauri CLI)
   ```bash
   # Using Homebrew
   brew install node
   ```

3. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

4. **Install Xcode Command Line Tools** (required for macOS builds)
   ```bash
   xcode-select --install
   ```

## Download Gemma 3 1B Model

Before building, download the Gemma 3 1B GGUF model:

```bash
# Create models directory
mkdir -p src-tauri/models

# Download Gemma 3 1B (quantized version for smaller size)
# Option 1: Using Hugging Face CLI
pip install huggingface_hub
huggingface-cli download google/gemma-3-1b-it-GGUF gemma-3-1b-it-q4_k_m.gguf --local-dir src-tauri/models

# Option 2: Manual download from Hugging Face
# Visit: https://huggingface.co/google/gemma-3-1b-it-GGUF
# Download: gemma-3-1b-it-q4_k_m.gguf
# Place in: src-tauri/models/
```

Rename the downloaded file:
```bash
mv src-tauri/models/gemma-3-1b-it-q4_k_m.gguf src-tauri/models/gemma-3-1b.gguf
```

## Build the App

### Development Mode
```bash
cd /Users/gayathripolisetty/Desktop/g3
npm run tauri dev
```

### Production Build (.dmg)
```bash
cd /Users/gayathripolisetty/Desktop/g3
npm run tauri build
```

The .dmg file will be created at:
```
src-tauri/target/release/bundle/dmg/G3_1.0.0_aarch64.dmg
```
(or `x64.dmg` for Intel Macs)

## Project Structure

```
g3/
├── src-tauri/           # Tauri/Rust backend
│   ├── Cargo.toml       # Rust dependencies
│   ├── tauri.conf.json  # Tauri configuration
│   ├── src/
│   │   └── main.rs      # Rust backend with Gemma integration
│   ├── icons/
│   │   ├── icon.icns    # macOS app icon
│   │   └── icon.png     # PNG icon
│   └── models/
│       └── gemma-3-1b.gguf  # AI model (download separately)
├── tauri-api.js         # Frontend API helper
├── index.html           # Main app entry
├── question.html        # Quiz page
├── flashlight.html      # Review page
├── story.html           # Story reader
└── ... other HTML/JS files
```

## Offline Functionality

All AI features work completely offline using the local Gemma 3 1B model:
- Translation generation
- Sentence generation for reorder questions
- Passage comprehension questions
- Free response evaluation
- Study note generation

## Troubleshooting

### Build fails with "llama-cpp-2" error
Make sure you have the required system libraries:
```bash
brew install cmake
```

### Model not loading
Ensure the model file is at the correct path:
```bash
ls -la src-tauri/models/gemma-3-1b.gguf
```

### Icon not showing
Regenerate the icon:
```bash
cd src-tauri/icons
sips -z 512 512 icon.png --out icon_512.png
iconutil -c icns icon.iconset -o icon.icns
```
