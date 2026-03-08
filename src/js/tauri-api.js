// Tauri API Helper - Handles offline AI inference via Qwen3 1.7B
// Uses Qwen3-1.7B (Q5_K_M) for AI features and translation

const TauriAPI = {
  isInitialized: false,
  isTauri: false,
  modelReady: false,

  // Language names for prompts
  languageNames: {
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil',
    spanish: 'Spanish',
    french: 'French',
    german: 'German'
  },

  // Check if running in Tauri (lightweight)
  init: async function() {
    if (this.isInitialized) return;
    this.isTauri = window.__TAURI__ !== undefined;
    this.isInitialized = true;
  },

  // Initialize the AI model (call only when needed)
  initModel: async function() {
    if (this.modelReady) return true;
    if (!this.isTauri) return false;

    try {
      const status = await this.checkModelStatus();
      if (!status.installed) {
        console.log('Qwen3 1.7B model not found. User needs to download it.');
        return false;
      }
      await window.__TAURI__.invoke('init_model');
      console.log('Qwen3 1.7B loaded successfully');
      this.modelReady = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize model:', e);
      return false;
    }
  },

  // Check if model is installed
  checkModelStatus: async function() {
    if (window.__TAURI__ === undefined) {
      return { installed: false, path: '', size_mb: null };
    }
    try {
      return await window.__TAURI__.invoke('check_model_status');
    } catch (e) {
      console.error('Failed to check model status:', e);
      return { installed: false, path: '', size_mb: null };
    }
  },

  // Download Qwen3 1.7B model with progress callback
  downloadModel: async function(onProgress) {
    if (window.__TAURI__ === undefined) {
      throw new Error('Model download only available in Tauri app');
    }

    const unlisten = await window.__TAURI__.event.listen('download-progress', (event) => {
      if (onProgress) {
        onProgress(event.payload);
      }
    });

    try {
      const result = await window.__TAURI__.invoke('download_model');
      await window.__TAURI__.invoke('init_model');
      this.modelReady = true;
      return result;
    } finally {
      unlisten();
    }
  },

  // Chat completion
  chatCompletion: async function(messages, model) {
    await this.init();

    if (this.isTauri && await this.initModel()) {
      try {
        const response = await window.__TAURI__.invoke('chat_completion', {
          request: { messages, model }
        });
        return { response: response.response };
      } catch (e) {
        console.error('Tauri chat completion error:', e);
        throw e;
      }
    } else {
      return this.offlineFallback(messages);
    }
  },

  // Generate text directly
  generateText: async function(prompt, maxTokens = 256) {
    await this.init();

    if (this.isTauri && await this.initModel()) {
      try {
        return await window.__TAURI__.invoke('generate_text', {
          prompt,
          maxTokens
        });
      } catch (e) {
        console.error('Tauri generate text error:', e);
        throw e;
      }
    } else {
      return this.offlineTextFallback(prompt);
    }
  },

  // Translate using Qwen3 1.7B
  translate: async function(text, targetLanguage) {
    const langName = this.languageNames[targetLanguage] || targetLanguage;

    const prompt = `Translate the following English text to ${langName}. Only output the translation, nothing else.\n\n${text}`;

    try {
      const response = await this.generateText(prompt, 256);

      // Clean up the response - take first line, trim whitespace
      let translation = (response || text).trim();
      // Remove any prefix labels
      translation = translation.replace(/^(Translation|अनुवाद|అనువాదం|மொழிபெயர்ப்பு|###\s*Response:?):\s*/i, '');
      // Take first line only
      translation = translation.split('\n')[0].trim();
      return translation || text;
    } catch (e) {
      console.error('Translation error:', e);
      return text; // Return original on error
    }
  },

  // Check translation model status (now same as AI model)
  checkTranslationModelStatus: async function(language) {
    const status = await this.checkModelStatus();
    return {
      installed: status.installed,
      language,
      modelId: 'qwen3-1.7b'
    };
  },

  // Offline fallback for browser testing
  offlineFallback: function(messages) {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || '';

    if (content.includes('sentence') || content.includes('Sentence')) {
      return { response: this.generateSimpleSentence(content) };
    }

    if (content.includes('explain') || content.includes('Explain')) {
      return { response: this.generateExplanation(content) };
    }

    if (content.includes('hint') || content.includes('Hint')) {
      return { response: this.generateHint(content) };
    }

    if (content.includes('Translate')) {
      return { response: this.offlineTranslate(content) };
    }

    return { response: 'This is an offline response. Please download the Qwen3 1.7B AI model from Settings.' };
  },

  offlineTextFallback: function(prompt) {
    return 'Offline mode: ' + prompt.substring(0, 50) + '...';
  },

  offlineTranslate: function(prompt) {
    // Simple offline translations for common words
    const lang = localStorage.getItem('appLanguage') || 'hindi';
    const commonWords = {
      hindi: { hello: 'नमस्ते', yes: 'हाँ', no: 'नहीं', thank: 'धन्यवाद', water: 'पानी' },
      telugu: { hello: 'హలో', yes: 'అవును', no: 'లేదు', thank: 'ధన్యవాదాలు', water: 'నీళ్ళు' },
      tamil: { hello: 'வணக்கம்', yes: 'ஆம்', no: 'இல்லை', thank: 'நன்றி', water: 'தண்ணீர்' },
      spanish: { hello: 'Hola', yes: 'Sí', no: 'No', thank: 'Gracias', water: 'Agua' },
      french: { hello: 'Bonjour', yes: 'Oui', no: 'Non', thank: 'Merci', water: 'Eau' },
      german: { hello: 'Hallo', yes: 'Ja', no: 'Nein', thank: 'Danke', water: 'Wasser' }
    };

    const words = commonWords[lang] || commonWords.hindi;
    for (const [eng, translation] of Object.entries(words)) {
      if (prompt.toLowerCase().includes(eng)) {
        return translation;
      }
    }
    return '[Download Qwen3 1.7B model for translation]';
  },

  generateSimpleSentence: function(prompt) {
    const sentences = [
      'The cat sat on the mat.',
      'She reads books every day.',
      'They play in the garden.',
      'He walks to school.',
      'We eat dinner together.'
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  },

  generateExplanation: function(prompt) {
    const lang = localStorage.getItem('appLanguage') || 'hindi';
    const explanations = {
      hindi: 'यह उत्तर सही है क्योंकि यह व्याकरण के नियमों का पालन करता है।',
      telugu: 'ఈ సమాధానం సరైనది ఎందుకంటే ఇది వ్యాకరణ నియమాలను అనుసరిస్తుంది.',
      tamil: 'இந்த பதில் சரியானது ஏனெனில் இது இலக்கண விதிகளைப் பின்பற்றுகிறது.',
      spanish: 'Esta respuesta es correcta porque sigue las reglas gramaticales.',
      french: 'Cette réponse est correcte car elle suit les règles grammaticales.',
      german: 'Diese Antwort ist richtig, weil sie den grammatischen Regeln folgt.'
    };
    return explanations[lang] || explanations.hindi;
  },

  generateHint: function(prompt) {
    return 'Think about the meaning of the word and how it is used in context.';
  }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  TauriAPI.init();
});

// Export for use in other files
window.TauriAPI = TauriAPI;
