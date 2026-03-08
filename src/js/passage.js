// passage.js - Passage-based Questions with MCQ

// Generate passage questions
async function generatePassageQuestions(words) {
  const questions = [];
  
  for (const word of words) {
    const question = await createPassageQuestion(word);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

// Create a single passage question
async function createPassageQuestion(word) {
  try {
    // Generate passage with MCQ using AI
    const passageData = await generatePassageWithMCQ(word);
    
    if (!passageData) {
      // Fallback to template
      return createTemplatePassageQuestion(word);
    }
    
    // Ensure correct answer is in random position
    const { passage, question, correctAnswer, wrongOptions } = passageData;
    const allOptions = [...wrongOptions];
    const correctPosition = Math.floor(Math.random() * 4);
    allOptions.splice(correctPosition, 0, correctAnswer);
    
    return {
      type: 'passage',
      word: word.english,
      passage: passage,
      text: question,
      options: allOptions,
      correctAnswer: correctAnswer,
      telugu: word.telugu || ''
    };
  } catch (error) {
    console.error('Error creating passage question:', error);
    return createTemplatePassageQuestion(word);
  }
}

// Generate passage with MCQ using AI
async function generatePassageWithMCQ(word) {
  try {
    const prompt = `Create a short, simple, and interesting passage for grade 3 students that uses the word "${word.english}".

    Then create ONE simple multiple choice question about the passage.

    Format your response EXACTLY as:
    PASSAGE: [3-4 sentence passage here]
    QUESTION: [Simple comprehension question]
    CORRECT: [Correct answer]
    WRONG1: [Plausible wrong answer]
    WRONG2: [Plausible wrong answer]
    WRONG3: [Plausible wrong answer]
    
    Requirements:
    - Passage should be engaging and age-appropriate
    - Use simple vocabulary
    - Question should test basic comprehension
    - All options should be believable`;
    
    const data = await TauriAPI.chatCompletion(
      [{ role: "user", content: prompt }],
      'qwen3-1.7b'
    );
    const content = data?.response || '';
    
    // Parse the response
    const passageMatch = content.match(/PASSAGE:\s*(.+?)(?=QUESTION:|$)/s);
    const questionMatch = content.match(/QUESTION:\s*(.+?)(?=CORRECT:|$)/s);
    const correctMatch = content.match(/CORRECT:\s*(.+?)(?=WRONG1:|$)/s);
    const wrong1Match = content.match(/WRONG1:\s*(.+?)(?=WRONG2:|$)/s);
    const wrong2Match = content.match(/WRONG2:\s*(.+?)(?=WRONG3:|$)/s);
    const wrong3Match = content.match(/WRONG3:\s*(.+?)(?=$)/s);
    
    if (!passageMatch || !questionMatch || !correctMatch || 
        !wrong1Match || !wrong2Match || !wrong3Match) {
      return null;
    }
    
    return {
      passage: passageMatch[1].trim(),
      question: questionMatch[1].trim(),
      correctAnswer: correctMatch[1].trim(),
      wrongOptions: [
        wrong1Match[1].trim(),
        wrong2Match[1].trim(),
        wrong3Match[1].trim()
      ]
    };
  } catch (error) {
    console.error('Error generating passage:', error);
    return null;
  }
}

// Create template-based passage question
function createTemplatePassageQuestion(word) {
  const templates = [
    {
      passage: `Emma had a new ${word.english}. She was very excited about it. She showed the ${word.english} to all her friends at school. Everyone thought the ${word.english} was wonderful.`,
      question: `What did Emma show to her friends?`,
      correct: `${word.english}`,
      wrong: ['book', 'toy', 'picture']
    },
    {
      passage: `Tom went to the park with his ${word.english}. They played games together. The ${word.english} helped Tom climb the big tree. It was a fun day at the park.`,
      question: `Where did Tom go with his ${word.english}?`,
      correct: 'park',
      wrong: ['school', 'home', 'store']
    },
    {
      passage: `The ${word.english} was sitting in the garden. A butterfly came and landed on it. The ${word.english} looked very beautiful in the sunshine. Many people stopped to look at the ${word.english}.`,
      question: `What landed on the ${word.english}?`,
      correct: 'butterfly',
      wrong: ['bird', 'bee', 'flower']
    },
    {
      passage: `Sarah found a ${word.english} on her way home. She picked it up carefully. The ${word.english} was very special. She decided to keep the ${word.english} as her treasure.`,
      question: `What did Sarah decide to do with the ${word.english}?`,
      correct: 'keep it as her treasure',
      wrong: ['throw it away', 'give it to her friend', 'sell it']
    }
  ];
  
  // Select random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Remove duplicates from wrong options
  const wrongOptions = template.wrong.filter(opt => 
    opt.toLowerCase() !== word.english.toLowerCase()
  );
  
  // Ensure we have 3 wrong options
  while (wrongOptions.length < 3) {
    const extras = ['pencil', 'bag', 'shoe', 'hat', 'ball'];
    for (const extra of extras) {
      if (!wrongOptions.includes(extra) && 
          extra !== word.english.toLowerCase() && 
          extra !== template.correct.toLowerCase()) {
        wrongOptions.push(extra);
        if (wrongOptions.length === 3) break;
      }
    }
  }
  
  // Create options with correct answer in random position
  const allOptions = [...wrongOptions.slice(0, 3)];
  const correctPosition = Math.floor(Math.random() * 4);
  allOptions.splice(correctPosition, 0, template.correct);
  
  return {
    type: 'passage',
    word: word.english,
    passage: template.passage,
    text: template.question,
    options: allOptions,
    correctAnswer: template.correct,
    telugu: word.telugu || ''
  };
}

// Set up passage question in the UI
function setupPassageQuestion(question, answerArea) {
  // Create passage container
  const passageContainer = document.createElement('div');
  passageContainer.className = 'paragraph-text';
  passageContainer.textContent = question.passage;
  
  // Create options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';
  optionsContainer.style.marginTop = '20px';
  
  // Add options
  question.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option';
    optionElement.textContent = option;
    optionElement.setAttribute('data-option', option);
    
    // Add click handler
    optionElement.addEventListener('click', () => selectOption(optionElement, option));
    
    optionsContainer.appendChild(optionElement);
  });
  
  // Add to answer area
  answerArea.appendChild(passageContainer);
  answerArea.appendChild(optionsContainer);
}

// Check passage answer
async function checkPassageAnswer(question) {
  const feedback = document.getElementById('feedback');
  
  if (!selectedOption) {
    feedback.textContent = 'Please select an answer';
    feedback.className = 'feedback incorrect';
    isAnswerCorrect = false;
    return;
  }
  
  isAnswerCorrect = (selectedOption === question.correctAnswer);
  
  if (isAnswerCorrect) {
    feedback.textContent = '✓ Correct! Great reading!';
    feedback.className = 'feedback correct';
  } else {
    feedback.textContent = `✗ Incorrect. The correct answer is: ${question.correctAnswer}`;
    feedback.className = 'feedback incorrect';
    
    // Highlight correct answer
    document.querySelectorAll('.option').forEach(opt => {
      if (opt.getAttribute('data-option') === question.correctAnswer) {
        opt.classList.add('correct');
      } else if (opt.getAttribute('data-option') === selectedOption) {
        opt.classList.add('wrong');
      }
    });
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.generatePassageQuestions = generatePassageQuestions;
  window.setupPassageQuestion = setupPassageQuestion;
  window.checkPassageAnswer = checkPassageAnswer;
}