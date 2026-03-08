// reorder.js - Sentence Reordering Questions

// Shuffle array utility
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Test API connection (now uses local Tauri API)
async function testAPIConnection() {
  try {
    console.log('Testing local API connection...');
    const data = await TauriAPI.chatCompletion(
      [{ role: "user", content: "Say hello" }],
      'qwen3-1.7b'
    );
    console.log('API Test - Success:', data);
    return true;
  } catch (error) {
    console.error('API Test - Failed:', error);
    return false;
  }
}

// Generate reorder questions
async function generateReorderQuestions(words) {
  const questions = [];
  
  for (const word of words) {
    const question = await createReorderQuestion(word);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

// Create a single reorder question
async function createReorderQuestion(word) {
  try {
    // Generate a simple sentence using API
    const sentence = await generateSimpleSentence(word.english);
    
    if (!sentence) {
      // Fallback to template
      return createTemplateReorderQuestion(word);
    }
    
    // Split and clean sentence
    const cleanSentence = sentence.replace(/[.!?]$/, ''); // Remove punctuation
    const words = cleanSentence.split(' ').filter(w => w.length > 0);
    
    // Shuffle words
    const shuffledWords = shuffleArray([...words]);
    
    return {
      type: 'reorder',
      word: word.english,
      text: `Arrange the words to form a correct sentence:`,
      shuffledWords: shuffledWords,
      correctOrder: words,
      correctSentence: cleanSentence,
      telugu: word.telugu || ''
    };
  } catch (error) {
    console.error('Error creating reorder question:', error);
    return createTemplateReorderQuestion(word);
  }
}

// Generate simple sentence using local AI
async function generateSimpleSentence(word) {
  try {
    console.log('Generating sentence for word:', word);

    // Improved prompt for simpler, more predictable sentences
    const prompt = `Write ONE simple correct sentence with "${word}".
Use only simple words. Make it easy for children.
4-6 words only. No punctuation.

Examples:
"apple" = I eat an apple
"car" = The car is red
"cat" = I have a cat
"big" = The house is big
"water" = I drink water

"${word}" =`;

    console.log('Sending request to local AI...');
    const data = await TauriAPI.chatCompletion(
      [{ role: "user", content: prompt }],
      'qwen3-1.7b'
    );

    console.log('AI response:', data);

    // Extract sentence from response
    let sentence = '';
    if (data?.response) {
      sentence = data.response.trim();
    } else {
      console.error('Unexpected response format:', data);
      return null;
    }

    console.log('Extracted sentence:', sentence);

    // Clean the sentence more thoroughly
    // Remove quotes, punctuation, and extra whitespace
    sentence = sentence.replace(/^["'`]|["'`]$/g, ''); // Remove quotes
    sentence = sentence.replace(/[.!?,;:]+$/g, ''); // Remove ending punctuation
    sentence = sentence.replace(/^\w+:\s*/i, ''); // Remove "word:" prefix if present
    sentence = sentence.replace(/^-\s*/, ''); // Remove leading dash
    sentence = sentence.trim();

    // If the response contains multiple sentences or examples, try to extract just one
    if (sentence.includes('\n')) {
      const lines = sentence.split('\n').filter(l => l.trim().length > 0);
      // Look for a line that contains the word
      for (const line of lines) {
        if (line.toLowerCase().includes(word.toLowerCase()) && !line.includes(':')) {
          sentence = line.trim();
          break;
        }
      }
    }

    // Clean again after extraction
    sentence = sentence.replace(/^["'`]|["'`]$/g, '');
    sentence = sentence.replace(/[.!?,;:]+$/g, '');
    sentence = sentence.trim();

    // Validate sentence
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    console.log('Word count:', wordCount, 'Words:', words);

    // More flexible word count (3-6 words preferred)
    if (wordCount < 3 || wordCount > 6) {
      console.log('Sentence rejected - word count out of range (need 3-6 words)');
      return null;
    }

    // Check if word is in sentence (case-insensitive)
    if (!sentence.toLowerCase().includes(word.toLowerCase())) {
      console.log('Sentence rejected - word not found in sentence');
      return null;
    }

    // Final validation - ensure it's not too complex
    const complexWords = words.filter(w => w.length > 10);
    if (complexWords.length > 1) {
      console.log('Sentence rejected - too many complex words');
      return null;
    }

    console.log('Successfully generated sentence:', sentence);
    return sentence;
  } catch (error) {
    console.error('Error generating sentence:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return null; // Return null to use fallback instead of crashing
  }
}

// Create template-based reorder question
function createTemplateReorderQuestion(word) {
  const templates = [
    `I see a ${word.english}`,
    `The ${word.english} is good`,
    `I like the ${word.english}`,
    `My ${word.english} is nice`,
    `The ${word.english} is big`,
    `I have a ${word.english}`
  ];
  
  const sentence = templates[Math.floor(Math.random() * templates.length)];
  const words = sentence.split(' ');
  const shuffledWords = shuffleArray([...words]);
  
  return {
    type: 'reorder',
    word: word.english,
    text: `Arrange the words to form a correct sentence:`,
    shuffledWords: shuffledWords,
    correctOrder: words,
    correctSentence: sentence,
    telugu: word.telugu || ''
  };
}

// Set up reorder question in the UI
function setupReorderQuestion(question, answerArea) {
  // Create containers
  const reorderContainer = document.createElement('div');
  reorderContainer.className = 'reorder-container';
  reorderContainer.id = 'reorderContainer';
  
  const answerContainer = document.createElement('div');
  answerContainer.className = 'reorder-answer';
  answerContainer.id = 'reorderAnswer';
  answerContainer.innerHTML = '<span style="color: #999;">Click words to build your sentence...</span>';
  
  // Add shuffled words
  question.shuffledWords.forEach((word, index) => {
    const wordElement = document.createElement('div');
    wordElement.className = 'reorder-item';
    wordElement.textContent = word;
    wordElement.setAttribute('data-word', word);
    wordElement.setAttribute('data-index', index);
    
    // Add click event
    wordElement.addEventListener('click', () => handleWordClick(wordElement));
    
    reorderContainer.appendChild(wordElement);
  });
  
  // Add to answer area
  answerArea.appendChild(reorderContainer);
  answerArea.appendChild(answerContainer);

  // Add reset button (will be moved next to submit button after render)
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset';
  resetButton.id = 'resetBtn';
  resetButton.className = 'btn reset-btn';
  resetButton.addEventListener('click', () => resetReorder());

  // Wait for DOM to update, then move reset button next to submit
  setTimeout(() => {
    const buttonsContainer = document.querySelector('.buttons');
    const submitBtn = document.getElementById('submitBtn');
    if (buttonsContainer && submitBtn) {
      buttonsContainer.insertBefore(resetButton, submitBtn.nextSibling);
    } else {
      answerArea.appendChild(resetButton);
    }
  }, 10);
}

// Handle word click
function handleWordClick(wordElement) {
  const answerContainer = document.getElementById('reorderAnswer');
  const reorderContainer = document.getElementById('reorderContainer');
  
  if (wordElement.parentElement === reorderContainer) {
    // Move to answer
    if (answerContainer.querySelector('span')) {
      answerContainer.innerHTML = ''; // Clear placeholder
    }
    answerContainer.appendChild(wordElement);
  } else {
    // Move back to options
    reorderContainer.appendChild(wordElement);
    
    // Check if answer is empty
    if (answerContainer.children.length === 0) {
      answerContainer.innerHTML = '<span style="color: #999;">Click words to build your sentence...</span>';
    }
  }
}

// Reset reorder
function resetReorder() {
  const answerContainer = document.getElementById('reorderAnswer');
  const reorderContainer = document.getElementById('reorderContainer');
  
  // Move all words back
  Array.from(answerContainer.querySelectorAll('.reorder-item')).forEach(item => {
    reorderContainer.appendChild(item);
  });
  
  answerContainer.innerHTML = '<span style="color: #999;">Click words to build your sentence...</span>';
}

// Check reorder answer
async function checkReorderAnswer(question) {
  const answerContainer = document.getElementById('reorderAnswer');

  // Get user's word order
  const userWords = Array.from(answerContainer.querySelectorAll('.reorder-item'))
    .map(el => el.textContent);

  if (userWords.length === 0 || userWords.length !== question.correctOrder.length) {
    isAnswerCorrect = false;
    return;
  }

  // Compare with correct order
  const userSentence = userWords.join(' ');
  const correctSentence = question.correctSentence;

  isAnswerCorrect = userSentence === correctSentence;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.generateReorderQuestions = generateReorderQuestions;
  window.setupReorderQuestion = setupReorderQuestion;
  window.checkReorderAnswer = checkReorderAnswer;
  window.testAPIConnection = testAPIConnection;
}