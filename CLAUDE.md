# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kadam (formerly G3) is a Tauri-based desktop language learning application that uses offline AI (Gemma 3 1B) for interactive comic-based stories, quizzes, and vocabulary learning. All AI processing happens locally - no internet required for core functionality.

**Supported Languages**: Hindi, Telugu, Tamil, Spanish, French, German

## Development Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run tauri:dev

# Production build (generates .dmg on macOS)
npm run tauri:build
```

**Build output**: `src-tauri/target/release/bundle/dmg/G3_1.0.0_aarch64.dmg`

## Prerequisites

- Rust (via rustup)
- Node.js
- Tauri CLI: `npm install -g @tauri-apps/cli`
- CMake: `brew install cmake` (required for llama-cpp-2)
- Xcode Command Line Tools (macOS): `xcode-select --install`

## Model Setup (Required)

The app requires the Gemma 3 1B GGUF model to function:

```bash
mkdir -p src-tauri/models
pip install huggingface_hub
huggingface-cli download google/gemma-3-1b-it-GGUF gemma-3-1b-it-q4_k_m.gguf --local-dir src-tauri/models
mv src-tauri/models/gemma-3-1b-it-q4_k_m.gguf src-tauri/models/gemma-3-1b.gguf
```

## Architecture

```
Frontend (HTML/CSS/JS)              Backend (Rust/Tauri)
       │                                    │
       └──── tauri-api.js ──────────────────┘
              (IPC bridge)                  │
                                            ▼
                                    llama-cpp-2
                                    (Gemma model)
```

- **Frontend** (`/src`): Vanilla HTML/CSS/JavaScript - no framework
- **Backend** (`/src-tauri`): Rust with Tauri framework
- **AI Bridge** (`src/js/tauri-api.js`): Central wrapper for all frontend-to-backend AI calls

### Key Source Files

| File | Purpose |
|------|---------|
| `src-tauri/src/main.rs` | Tauri commands: model loading, chat completion, text generation |
| `src/js/tauri-api.js` | Frontend API for AI (checkModelStatus, initModel, chatCompletion, translate) |
| `src/index.html` | Main dashboard with sidebar navigation |
| `src/js/stories.js` | Story database (34+ stories with metadata) |
| `src/pages/question.html` | Quiz rendering (MCQ, reorder, passage, free-response) |

### AI Features in App

- Translation for vocabulary learning
- Sentence generation for reorder questions
- Passage comprehension question generation
- Free response evaluation
- Hint/explanation generation

### Data Management

- **User progress**: localStorage (ready for Firebase sync)
- **Model state**: Rust `ModelState` struct with Mutex (thread-safe)
- **Stories**: Static JavaScript objects

## Build Configuration

**macOS deployment target**: 10.15 (configured in `src-tauri/.cargo/config.toml`)

**Release optimizations** (Cargo.toml):
- LTO enabled
- Single codegen unit
- Optimized for size (`opt-level = "z"`)
- Symbols stripped

## Troubleshooting

**llama-cpp-2 build fails**: Install CMake with `brew install cmake`

**Model not loading**: Verify file exists at `src-tauri/models/gemma-3-1b.gguf`
