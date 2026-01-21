// free.js - Free Response Questions with AI Validation

// Get translation from word (supports both 'translation' and 'telugu' fields)
function getFreeTranslation(word) {
  return word.translation || word.telugu || '';
}

// Get language label for display
function getFreeLanguageLabel() {
  const lang = localStorage.getItem('appLanguage') || 'hindi';
  const labels = {
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil'
  };
  return labels[lang] || 'Translation';
}

// Generate free response questions
async function generateFreeQuestions(words) {
  const questions = [];

  for (const word of words) {
    const translation = getFreeTranslation(word);
    const question = {
      type: 'free_response',
      word: word.english,
      text: `Make a sentence using the word "${word.english}"`,
      translation: translation
    };
    questions.push(question);
  }

  return questions;
}

// Set up free response question in the UI
function setupFreeResponseQuestion(question, answerArea) {
  const container = document.createElement('div');
  container.style.width = '100%';

  // Show translation if available
  const translation = question.translation || question.telugu;
  if (translation) {
    const langLabel = getFreeLanguageLabel();
    const translationHint = document.createElement('div');
    translationHint.textContent = `${langLabel}: ${translation}`;
    translationHint.style.fontSize = '14px';
    translationHint.style.color = '#666';
    translationHint.style.marginBottom = '10px';
    container.appendChild(translationHint);
  }
  
  // Create textarea
  const textarea = document.createElement('textarea');
  textarea.id = 'freeResponseAnswer';
  textarea.className = 'text-input';
  textarea.placeholder = 'Type your sentence here...';
  textarea.rows = 3;
  textarea.style.width = '100%';
  textarea.style.minHeight = '80px';
  textarea.style.resize = 'vertical';
  
  container.appendChild(textarea);
  answerArea.appendChild(container);
  
  // Focus textarea
  setTimeout(() => textarea.focus(), 100);
}

// Check free response answer
async function checkFreeResponseAnswer(question) {
  const textarea = document.getElementById('freeResponseAnswer');
  const userSentence = textarea ? textarea.value.trim() : '';

  if (!userSentence) {
    isAnswerCorrect = false;
    return;
  }

  try {
    // Call AI to validate the sentence
    const validation = await validateSentenceWithAI(userSentence, question.word);

    if (validation.isCorrect) {
      isAnswerCorrect = true;
    } else {
      isAnswerCorrect = false;

      // Store data for hints page
      sessionStorage.setItem('hintsData', JSON.stringify({
        word: question.word,
        translation: question.translation || question.telugu,
        userSentence: userSentence,
        explanation: validation.explanation,
        examples: validation.examples
      }));

      // Add hints icon next to Next button and disable Next
      addHintsIconNextToButton();
      disableNextButton();
    }
  } catch (error) {
    console.error('Error checking sentence:', error);

    // Fallback validation
    const hasWord = userSentence.toLowerCase().includes(question.word.toLowerCase());

    if (hasWord && userSentence.split(' ').length >= 3) {
      isAnswerCorrect = true;
    } else {
      isAnswerCorrect = false;

      // Store data for hints page
      sessionStorage.setItem('hintsData', JSON.stringify({
        word: question.word,
        translation: question.translation || question.telugu,
        userSentence: userSentence,
        explanation: 'Make sure to include the word in a complete sentence.',
        examples: []
      }));

      // Add hints icon next to Next button and disable Next
      addHintsIconNextToButton();
      disableNextButton();
    }
  }
}

// Validate sentence with AI
async function validateSentenceWithAI(sentence, word) {
  try {
    const prompt = `You are evaluating a Grade 3 student's sentence. Be encouraging and lenient.
    
    Word to use: "${word}"
    Student's sentence: "${sentence}"

    You are a grammar checker. Your task is to decide if the input sentence is grammatically correct in standard English and whether the word "${word}" is used correctly. 

Rules:
- If the target word is NOT present in the sentence, mark isCorrect as false.  
- If the target word IS present, check if it is used correctly in grammar and meaning.  
- Do not consider style, tone, or naturalness.  
- The sentence must also have clear semantic meaning (nonsense sentences are incorrect even if grammatically formed).  

  
    Format your response as JSON:
    {
      "isCorrect": true/false,
      "explanation": "brief explanation only if incorrect",
      "examples": ["example1", "example2", "example3"]
    }`;
    
    const data = await TauriAPI.chatCompletion(
      [{ role: "user", content: prompt }],
      'gemma-2b'
    );
    const content = data?.response || '';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing
    const isCorrect = content.toLowerCase().includes('"iscorrect": true') || 
                     content.toLowerCase().includes('"iscorrect":true');
    
    return {
      isCorrect: isCorrect,
      explanation: isCorrect ? '' : 'The sentence needs improvement.',
      examples: []
    };
    
  } catch (error) {
    console.error('AI validation error:', error);
    throw error;
  }
}

// Show hints overlay
function showHintsOverlay() {
  const overlay = document.getElementById('hintsOverlay');
  if (!overlay) return;
  
  // Create iframe if not exists
  let iframe = overlay.querySelector('iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.src = 'hints.html';
    overlay.appendChild(iframe);
  } else {
    // Reload hints
    iframe.src = 'hints.html';
  }
  
  // Show overlay with animation
  overlay.style.display = 'block';
  setTimeout(() => {
    overlay.classList.add('show');
  }, 10);
  
  // Listen for messages from hints
  window.addEventListener('message', handleHintsMessage);
}

// Handle messages from hints iframe
function handleHintsMessage(event) {
  if (event.data && event.data.type === 'hintsComplete') {
    closeHintsOverlay(true);
  } else if (event.data && event.data.type === 'hintsFailed') {
    closeHintsOverlay(false);
  }
}

// Close hints overlay
function closeHintsOverlay(success) {
  const overlay = document.getElementById('hintsOverlay');
  if (!overlay) return;
  
  // Remove message listener
  window.removeEventListener('message', handleHintsMessage);
  
  // Hide overlay with animation
  overlay.classList.remove('show');
  
  setTimeout(() => {
    overlay.style.display = 'none';
    
    // Update UI based on result
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    
    if (success) {
      isAnswerCorrect = true;
      if (feedback) {
        feedback.textContent = '✓ Great job! You completed the hints exercise.';
        feedback.className = 'feedback correct';
      }
    } else {
      isAnswerCorrect = false;
      if (feedback) {
        feedback.textContent = '✗ This word has been marked as hard for more practice.';
        feedback.className = 'feedback incorrect';
      }
    }
    
    // Restore next button to normal state and enable it
    if (nextBtn) {
      nextBtn.textContent = 'Next Question';
      nextBtn.style.background = '';
      nextBtn.style.boxShadow = '';
      nextBtn.style.opacity = '';
      nextBtn.style.cursor = '';
      nextBtn.disabled = false;
      nextBtn.onclick = nextQuestion;
    }

    // Remove hints icon
    removeHintsIcon();
  }, 500);
}

// Add hints icon next to the Next button
function addHintsIconNextToButton() {
  // Remove existing icon if any
  removeHintsIcon();

  const nextBtn = document.getElementById('nextBtn');
  if (!nextBtn) return;

  const icon = document.createElement('img');
  icon.id = 'hintsIcon';
  icon.src = 'hints.png';
  icon.alt = 'Hints';
  icon.style.cssText = `
    width: 35px;
    height: 35px;
    cursor: pointer;
    margin-left: 10px;
    vertical-align: middle;
    transition: transform 0.2s ease;
  `;

  icon.onclick = () => {
    showHintsOverlay();
  };

  icon.onmouseover = () => {
    icon.style.transform = 'scale(1.15)';
  };

  icon.onmouseout = () => {
    icon.style.transform = 'scale(1)';
  };

  // Insert icon right after the Next button
  nextBtn.parentNode.insertBefore(icon, nextBtn.nextSibling);
}

// Remove hints icon
function removeHintsIcon() {
  const existingIcon = document.getElementById('hintsIcon');
  if (existingIcon) {
    existingIcon.remove();
  }
}

// Disable Next button (grey out)
function disableNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';
  }
}

// Enable Next button
function enableNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '';
    nextBtn.style.cursor = '';
  }
}