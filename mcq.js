// mcq.js - MCQ Translation Questions (Translation to English and English to Translation)

// Get translation from word (supports both 'translation' and 'telugu' fields)
function getTranslation(word) {
  return word.translation || word.telugu || '';
}

// Get language label for display
function getLanguageLabel() {
  const lang = localStorage.getItem('appLanguage') || 'hindi';
  const labels = {
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil'
  };
  return labels[lang] || 'Translation';
}

// Get default wrong options based on language
function getDefaultWrongOptions(lang) {
  const defaults = {
    hindi: ['किताब', 'पानी', 'पेड़', 'सूरज', 'चाँद', 'तारा', 'दोस्त'],
    telugu: ['పుస్తకం', 'నీరు', 'చెట్టు', 'సూర్యుడు', 'చంద్రుడు', 'నక్షత్రం', 'స్నేహితుడు'],
    tamil: ['புத்தகம்', 'தண்ணீர்', 'மரம்', 'சூரியன்', 'நிலா', 'நட்சத்திரம்', 'நண்பன்']
  };
  return defaults[lang] || defaults.hindi;
}

// Generate MCQ questions
async function generateMCQQuestions(words) {
  const questions = [];

  // Create MCQ questions for each word
  for (const word of words) {
    const translation = getTranslation(word);
    if (translation && translation.trim() !== '') {
      // Randomly decide translation direction
      const isTranslationToEnglish = Math.random() < 0.5;

      const question = createMCQQuestion(
        word.english,
        translation,
        isTranslationToEnglish,
        words
      );
      questions.push(question);
    }
  }

  return questions;
}

// Create a single MCQ question
function createMCQQuestion(english, translation, isTranslationToEnglish, allWords) {
  let questionText, correctAnswer, wrongOptions;
  const langLabel = getLanguageLabel();
  const currentLang = localStorage.getItem('appLanguage') || 'hindi';

  if (isTranslationToEnglish) {
    // Translation to English
    questionText = `What is the English translation of "${translation}"?`;
    correctAnswer = english;

    // Get wrong English options
    wrongOptions = allWords
      .filter(w => w.english !== english && w.english)
      .map(w => w.english)
      .slice(0, 3);

    // Add default options if needed
    if (wrongOptions.length < 3) {
      const defaults = ['book', 'water', 'tree', 'sun', 'moon', 'star', 'friend'];
      for (const defaultWord of defaults) {
        if (!wrongOptions.includes(defaultWord) && defaultWord !== english) {
          wrongOptions.push(defaultWord);
          if (wrongOptions.length === 3) break;
        }
      }
    }
  } else {
    // English to Translation
    questionText = `What is the ${langLabel} translation of "${english}"?`;
    correctAnswer = translation;

    // Get wrong translation options
    wrongOptions = allWords
      .filter(w => getTranslation(w) !== translation && getTranslation(w))
      .map(w => getTranslation(w))
      .slice(0, 3);

    // Add default translation options if needed
    if (wrongOptions.length < 3) {
      const defaults = getDefaultWrongOptions(currentLang);
      for (const defaultWord of defaults) {
        if (!wrongOptions.includes(defaultWord) && defaultWord !== translation) {
          wrongOptions.push(defaultWord);
          if (wrongOptions.length === 3) break;
        }
      }
    }
  }

  // Shuffle wrong options and take 3
  wrongOptions = shuffleArray(wrongOptions).slice(0, 3);

  // Create all options with correct answer in random position
  const allOptions = [...wrongOptions];
  const correctPosition = Math.floor(Math.random() * 4);
  allOptions.splice(correctPosition, 0, correctAnswer);

  return {
    type: 'mcq',
    word: english,
    text: questionText,
    options: allOptions,
    correctAnswer: correctAnswer,
    translation: translation,
    isTranslationToEnglish: isTranslationToEnglish
  };
}

// Set up MCQ question in the UI
function setupMCQQuestion(question, answerArea) {
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';
  
  question.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option';
    optionElement.textContent = option;
    optionElement.setAttribute('data-option', option);
    optionElement.addEventListener('click', () => selectOption(optionElement, option));
    optionsContainer.appendChild(optionElement);
  });
  
  answerArea.appendChild(optionsContainer);
}

// Select an option
function selectOption(element, value) {
  // Clear previous selection
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Select new option
  element.classList.add('selected');
  selectedOption = value;
}

// Check MCQ answer
async function checkMCQAnswer(question) {
  if (!selectedOption) {
    isAnswerCorrect = false;
    return;
  }

  isAnswerCorrect = (selectedOption === question.correctAnswer);

  // Show correct/wrong styling on options
  document.querySelectorAll('.option').forEach(opt => {
    if (opt.getAttribute('data-option') === question.correctAnswer) {
      opt.classList.add('correct');
    } else if (opt.getAttribute('data-option') === selectedOption && !isAnswerCorrect) {
      opt.classList.add('wrong');
    }
  });
}

// Utility function to shuffle array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.generateMCQQuestions = generateMCQQuestions;
  window.setupMCQQuestion = setupMCQQuestion;
  window.checkMCQAnswer = checkMCQAnswer;
  window.selectOption = selectOption;
  window.shuffleArray = shuffleArray;
}