// Interactive Onboarding Tutorial System

class InteractiveOnboarding {
  constructor() {
    this.language = localStorage.getItem('appLanguage') || null;
    this.tutorialProgress = this.loadProgress();
    this.currentStep = null;
    this.isActive = false;
    this.wantsTutorial = localStorage.getItem('wantsTutorial') === 'true';
    this.tutorialLanguageMode = localStorage.getItem('tutorialLanguageMode') || 'native'; // 'english' or 'native'

    // Tutorial checkpoints
    this.checkpoints = {
      languageSelected: false,
      tutorialChoiceMade: false,
      comicOpened: false,
      wordClicked: false,
      navigationShown: false,
      storyCompleted: false,
      wordsAddedToVault: false,
      returnedHome: false,
      vaultVisited: false,
      difficultyExplained: false,
      addWordShown: false,
      deleteWordShown: false,
      tagCreated: false,
      quizStarted: false,
      customizeShown: false,
      templateInfoShown: false,
      startQuizInfoShown: false,
      flashlightExplained: false,
      quizCompleted: false,
      templateCreated: false
    };

    // Merge saved progress
    Object.assign(this.checkpoints, this.tutorialProgress);

    // Tutorial content - ALL IN ENGLISH (this is an English learning app)
    this.englishSteps = {
      selectComic: {
        title: "Step 1: Choose a Story",
        content: "Click on 'The Little Red Hen' to start reading your first story.",
        action: "Click the comic book to continue"
      },
      openBook: {
        title: "Open the Book",
        content: "Great! Now click 'Open Book' to start reading.",
        action: "Click to begin reading"
      },
      clickWord: {
        title: "Learn New Words",
        content: "Click on an underlined word to see its meaning. You don't need to understand every word.",
        action: "Click any underlined word"
      },
      navigateStory: {
        title: "Navigate the Story",
        content: "Click the arrow button to go to the next page.",
        action: "Click the next button to continue"
      },
      addToVault: {
        title: "Save Your Words",
        content: "Excellent! Now click 'Add words to Word Vault' to save what you've learned.",
        action: "Add words to continue"
      },
      returnHome: {
        title: "Return to Home",
        content: "Click the logo on the left side to go back to the home page.",
        action: "Click the logo to continue"
      },
      goToVault: {
        title: "Visit Word Vault",
        content: "Click the Vault icon to see your saved words.",
        action: "Open Word Vault"
      },
      explainDifficulty: {
        title: "Understanding Difficulty Levels",
        content: "Easy, Medium, and Hard show how well you know each word. Words from comics start as 'Hard'. To make them 'Easy' or 'Medium', you need to do quizzes!",
        action: "Click Next to continue"
      },
      addNewWord: {
        title: "Add Your Own Words",
        content: "You can add new words to your vault using the 'Add New Word' button. Try it out or click Next to skip.",
        action: "Add a word or click Next"
      },
      deleteWord: {
        title: "Remove Words",
        content: "Click the trash icon next to any word to delete it from your vault. Try it or click Next to skip.",
        action: "Delete a word or click Next"
      },
      createTag: {
        title: "Organize with Tags",
        content: "You can use the + button to create custom tags for organizing your words. Tags help you group related words together!",
        action: "Click the + button to continue (or press Escape to skip)"
      },
      startQuiz: {
        title: "Test Your Knowledge",
        content: "Click the Questions icon to create a quiz.",
        action: "Go to quiz section"
      },
      customizeQuiz: {
        title: "Customize Your Quiz",
        content: "Click the pencil icon to customize your quiz settings.",
        action: "Open quiz settings"
      },
      templateInfo: {
        title: "Save Templates",
        content: "You can save your quiz settings as templates here for quick access later.",
        action: "Click Next to continue"
      },
      startQuizInfo: {
        title: "Start Your Quiz",
        content: "Click 'Start Quiz' to begin testing your knowledge!",
        action: "Start quiz or click Next to skip"
      },
      saveTemplate: {
        title: "Save as Template",
        content: "Check 'Save as template' and give it a name for quick access later.",
        action: "Create and start quiz"
      },
      completeQuiz: {
        title: "Complete the Quiz",
        content: "Answer all questions to finish the tutorial!",
        action: "Finish your quiz"
      },
      explainFlashlight: {
        title: "Review with Flashlight",
        content: "Use Flashlight to review your mistakes and learn from them. It helps you practice words you found difficult!",
        action: "Click Next to continue"
      },
      tutorialComplete: {
        title: "Congratulations!",
        content: "You've mastered all G3 features! Enjoy learning English!",
        action: "Start exploring on your own"
      }
    };

    // Translations for tutorial steps (shown below English in italic)
    this.translations = {
      hindi: {
        welcome: "Welcome to G3 Tutorial!",
        welcomeTranslation: "G3 ट्यूटोरियल में आपका स्वागत है!",
        letsStart: "Let's learn how to use G3 step by step",
        letsStartTranslation: "चलिए G3 का उपयोग करना सीखते हैं",
        next: "Next",
        nextTranslation: "अगला",
        skip: "Skip",
        skipTranslation: "छोड़ें",
        letsStartBtn: "Let's Start!",
        letsStartBtnTranslation: "शुरू करें!",
        startLearning: "Start Learning!",
        startLearningTranslation: "सीखना शुरू करें!",

        steps: {
          selectComic: { title: "चरण 1: कहानी चुनें", content: "अपनी पहली कहानी पढ़ना शुरू करने के लिए 'The Little Red Hen' पर क्लिक करें।" },
          openBook: { title: "किताब खोलें", content: "बढ़िया! अब पढ़ना शुरू करने के लिए 'Open Book' पर क्लिक करें।" },
          clickWord: { title: "नए शब्द सीखें", content: "अर्थ देखने के लिए रेखांकित शब्द पर क्लिक करें।" },
          navigateStory: { title: "कहानी में नेविगेट करें", content: "अगले पृष्ठ पर जाने के लिए तीर बटन पर क्लिक करें।" },
          addToVault: { title: "अपने शब्द सेव करें", content: "जो सीखा उसे सेव करने के लिए 'Add words to Word Vault' पर क्लिक करें।" },
          returnHome: { title: "होम पर वापस जाएं", content: "होम पेज पर वापस जाने के लिए लोगो पर क्लिक करें।" },
          goToVault: { title: "वर्ड वॉल्ट देखें", content: "अपने सेव किए गए शब्द देखने के लिए Vault आइकन पर क्लिक करें।" },
          explainDifficulty: { title: "कठिनाई स्तर समझें", content: "Easy, Medium, और Hard दिखाते हैं कि आप शब्द को कितना जानते हैं।" },
          addNewWord: { title: "अपने शब्द जोड़ें", content: "'Add New Word' बटन से नए शब्द जोड़ सकते हैं।" },
          deleteWord: { title: "शब्द हटाएं", content: "शब्द हटाने के लिए ट्रैश आइकन पर क्लिक करें।" },
          createTag: { title: "टैग के साथ व्यवस्थित करें", content: "+ बटन से कस्टम टैग बना सकते हैं।" },
          startQuiz: { title: "अपना ज्ञान परखें", content: "क्विज़ बनाने के लिए Questions आइकन पर क्लिक करें।" },
          customizeQuiz: { title: "अपनी क्विज़ कस्टमाइज़ करें", content: "सेटिंग्स के लिए पेंसिल आइकन पर क्लिक करें।" },
          templateInfo: { title: "टेम्प्लेट्स सेव करें", content: "क्विज़ सेटिंग्स को टेम्प्लेट्स के रूप में सेव कर सकते हैं।" },
          startQuizInfo: { title: "क्विज़ शुरू करें", content: "'Start Quiz' पर क्लिक करें!" },
          saveTemplate: { title: "टेम्प्लेट सेव करें", content: "'Save as template' चेक करें।" },
          completeQuiz: { title: "क्विज़ पूरी करें", content: "सभी प्रश्नों के उत्तर दें!" },
          explainFlashlight: { title: "Flashlight से रिव्यू करें", content: "अपनी गलतियों से सीखने के लिए Flashlight का उपयोग करें। यह कठिन शब्दों का अभ्यास करने में मदद करता है!" },
          tutorialComplete: { title: "बधाई हो! 🎉", content: "आपने सभी G3 फीचर्स सीख लिए हैं!" }
        }
      },

      telugu: {
        welcome: "Welcome to G3 Tutorial!",
        welcomeTranslation: "G3 ట్యుటోరియల్‌కు స్వాగతం!",
        letsStart: "Let's learn how to use G3 step by step",
        letsStartTranslation: "G3ని దశలవారీగా ఎలా ఉపయోగించాలో నేర్చుకుందాం",
        next: "Next",
        nextTranslation: "తదుపరి",
        skip: "Skip",
        skipTranslation: "దాటవేయి",
        letsStartBtn: "Let's Start!",
        letsStartBtnTranslation: "ప్రారంభిద్దాం!",
        startLearning: "Start Learning!",
        startLearningTranslation: "నేర్చుకోవడం ప్రారంభించండి!",

        steps: {
          selectComic: { title: "దశ 1: కథను ఎంచుకోండి", content: "మీ మొదటి కథ చదవడానికి 'The Little Red Hen'పై క్లిక్ చేయండి." },
          openBook: { title: "పుస్తకం తెరవండి", content: "చదవడం ప్రారంభించడానికి 'Open Book' క్లిక్ చేయండి." },
          clickWord: { title: "కొత్త పదాలు నేర్చుకోండి", content: "అర్థం చూడటానికి అండర్‌లైన్ చేసిన పదంపై క్లిక్ చేయండి." },
          navigateStory: { title: "కథను నావిగేట్ చేయండి", content: "తదుపరి పేజీకి వెళ్ళడానికి బాణం బటన్‌పై క్లిక్ చేయండి." },
          addToVault: { title: "మీ పదాలను సేవ్ చేయండి", content: "నేర్చుకున్న వాటిని సేవ్ చేయడానికి 'Add words to Word Vault' క్లిక్ చేయండి." },
          returnHome: { title: "హోమ్‌కు తిరిగి వెళ్ళండి", content: "హోమ్ పేజీకి వెళ్ళడానికి లోగోపై క్లిక్ చేయండి." },
          goToVault: { title: "వర్డ్ వాల్ట్‌ను సందర్శించండి", content: "సేవ్ చేసిన పదాలను చూడటానికి Vault చిహ్నంపై క్లిక్ చేయండి." },
          explainDifficulty: { title: "కష్ట స్థాయిలను అర్థం చేసుకోండి", content: "Easy, Medium, Hard అంటే మీకు పదం ఎంత బాగా తెలుసో చూపిస్తాయి." },
          addNewWord: { title: "మీ పదాలను జోడించండి", content: "'Add New Word' బటన్ ఉపయోగించి కొత్త పదాలను జోడించవచ్చు." },
          deleteWord: { title: "పదాలను తొలగించండి", content: "పదాన్ని తొలగించడానికి ట్రాష్ చిహ్నంపై క్లిక్ చేయండి." },
          createTag: { title: "ట్యాగ్‌లతో నిర్వహించండి", content: "+ బటన్‌ను ఉపయోగించి కస్టమ్ ట్యాగ్‌లను సృష్టించవచ్చు." },
          startQuiz: { title: "మీ జ్ఞానాన్ని పరీక్షించుకోండి", content: "క్విజ్ సృష్టించడానికి Questions చిహ్నంపై క్లిక్ చేయండి." },
          customizeQuiz: { title: "మీ క్విజ్‌ను అనుకూలీకరించండి", content: "సెట్టింగ్‌లకు పెన్సిల్ చిహ్నంపై క్లిక్ చేయండి." },
          templateInfo: { title: "టెంప్లేట్‌లను సేవ్ చేయండి", content: "క్విజ్ సెట్టింగ్‌లను టెంప్లేట్‌లుగా సేవ్ చేయవచ్చు." },
          startQuizInfo: { title: "మీ క్విజ్ ప్రారంభించండి", content: "'Start Quiz' క్లిక్ చేయండి!" },
          saveTemplate: { title: "టెంప్లేట్‌గా సేవ్ చేయండి", content: "'Save as template' చెక్ చేయండి." },
          completeQuiz: { title: "క్విజ్ పూర్తి చేయండి", content: "అన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి!" },
          explainFlashlight: { title: "Flashlightతో రివ్యూ చేయండి", content: "మీ తప్పుల నుండి నేర్చుకోవడానికి Flashlight ఉపయోగించండి. కష్టమైన పదాలను ప్రాక్టీస్ చేయడంలో సహాయపడుతుంది!" },
          tutorialComplete: { title: "అభినందనలు! 🎉", content: "మీరు అన్ని G3 ఫీచర్లను నేర్చుకున్నారు!" }
        }
      },

      tamil: {
        welcome: "Welcome to G3 Tutorial!",
        welcomeTranslation: "G3 பயிற்சிக்கு வரவேற்கிறோம்!",
        letsStart: "Let's learn how to use G3 step by step",
        letsStartTranslation: "G3 பயன்படுத்த படிப்படியாக கற்றுக்கொள்வோம்",
        next: "Next",
        nextTranslation: "அடுத்து",
        skip: "Skip",
        skipTranslation: "தவிர்",
        letsStartBtn: "Let's Start!",
        letsStartBtnTranslation: "தொடங்குவோம்!",
        startLearning: "Start Learning!",
        startLearningTranslation: "கற்றலைத் தொடங்குங்கள்!",

        steps: {
          selectComic: { title: "படி 1: கதையைத் தேர்ந்தெடுங்கள்", content: "முதல் கதையைப் படிக்க 'The Little Red Hen' மீது கிளிக் செய்யுங்கள்." },
          openBook: { title: "புத்தகத்தைத் திறங்கள்", content: "படிக்க 'Open Book' கிளிக் செய்யுங்கள்." },
          clickWord: { title: "புதிய சொற்கள் கற்றுக்கொள்ளுங்கள்", content: "அர்த்தம் பார்க்க அடிக்கோடிட்ட சொல்லை கிளிக் செய்யுங்கள்." },
          navigateStory: { title: "கதையில் செல்லுங்கள்", content: "அடுத்த பக்கத்திற்கு அம்பு பொத்தானை கிளிக் செய்யுங்கள்." },
          addToVault: { title: "சொற்களை சேமியுங்கள்", content: "கற்றவற்றை சேமிக்க 'Add words to Word Vault' கிளிக் செய்யுங்கள்." },
          returnHome: { title: "முகப்புக்குத் திரும்புங்கள்", content: "முகப்பு பக்கத்திற்கு லோகோவை கிளிக் செய்யுங்கள்." },
          goToVault: { title: "சொல் பெட்டகத்தைப் பாருங்கள்", content: "சேமித்த சொற்களைப் பார்க்க Vault ஐகானை கிளிக் செய்யுங்கள்." },
          explainDifficulty: { title: "கடினத்தன்மை நிலைகள்", content: "Easy, Medium, Hard என்பது சொல்லை எவ்வளவு தெரியும் என்று காட்டுகிறது." },
          addNewWord: { title: "சொற்களை சேர்க்கவும்", content: "'Add New Word' பொத்தான் மூலம் சொற்களை சேர்க்கலாம்." },
          deleteWord: { title: "சொற்களை நீக்குங்கள்", content: "சொல்லை நீக்க குப்பை ஐகானை கிளிக் செய்யுங்கள்." },
          createTag: { title: "குறிச்சொற்களால் ஒழுங்கமைக்கவும்", content: "+ பொத்தான் மூலம் குறிச்சொற்களை உருவாக்கலாம்." },
          startQuiz: { title: "அறிவைச் சோதிக்கவும்", content: "வினாடி வினா உருவாக்க Questions ஐகானை கிளிக் செய்யுங்கள்." },
          customizeQuiz: { title: "வினாடி வினாவை தனிப்பயனாக்குங்கள்", content: "அமைப்புகளுக்கு பென்சில் ஐகானை கிளிக் செய்யுங்கள்." },
          templateInfo: { title: "வார்ப்புருக்களை சேமியுங்கள்", content: "வினாடி வினா அமைப்புகளை வார்ப்புருக்களாக சேமிக்கலாம்." },
          startQuizInfo: { title: "வினாடி வினாவைத் தொடங்குங்கள்", content: "'Start Quiz' கிளிக் செய்யுங்கள்!" },
          saveTemplate: { title: "வார்ப்புருவாக சேமியுங்கள்", content: "'Save as template' சரிபார்க்கவும்." },
          completeQuiz: { title: "வினாடி வினா முடிக்கவும்", content: "அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும்!" },
          explainFlashlight: { title: "Flashlight மூலம் மதிப்பாய்வு செய்யுங்கள்", content: "உங்கள் தவறுகளிலிருந்து கற்றுக்கொள்ள Flashlight பயன்படுத்துங்கள். கடினமான சொற்களை பயிற்சி செய்ய உதவுகிறது!" },
          tutorialComplete: { title: "வாழ்த்துக்கள்! 🎉", content: "அனைத்து G3 அம்சங்களையும் கற்றுக்கொண்டீர்கள்!" }
        }
      }
    };
  }

  // Get UI translation for current language
  getUIText(key) {
    if (this.language && this.uiTranslations[this.language]) {
      return this.uiTranslations[this.language][key] || key;
    }
    return key;
  }
  
  init() {
    // Add CSS if not present
    if (!document.querySelector('link[href="onboarding.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'onboarding.css';
      document.head.appendChild(link);
    }

    // Check if language has been selected
    const savedLanguage = localStorage.getItem('appLanguage');
    if (!savedLanguage) {
      this.showLanguageSelection();
      return;
    }

    this.language = savedLanguage;

    // Check if tutorial choice has been made
    const tutorialChoiceMade = localStorage.getItem('tutorialChoiceMade') === 'true';
    if (!tutorialChoiceMade) {
      this.showTutorialChoice();
      return;
    }

    // Check if user wants tutorial and it's not completed
    const wantsTutorial = localStorage.getItem('wantsTutorial') === 'true';
    if (wantsTutorial && !this.checkpoints.tutorialComplete) {
      this.wantsTutorial = true;
      this.resumeTutorial();
    }
  }

  showLanguageSelection() {
    const modal = document.createElement('div');
    modal.className = 'language-selection-fullscreen';
    modal.innerHTML = `
      <div class="language-selection-content">
        <h1 class="language-title">Choose Your Language</h1>
        <h2 class="language-subtitle">भाषा चुनें • భాష ఎంచుకోండి • மொழியைத் தேர்ந்தெடுங்கள்</h2>
        <div class="language-buttons-vertical">
          <button class="language-btn-large hindi" onclick="tutorialGuide.selectLanguage('hindi')">
            हिंदी
          </button>
          <button class="language-btn-large telugu" onclick="tutorialGuide.selectLanguage('telugu')">
            తెలుగు
          </button>
          <button class="language-btn-large tamil" onclick="tutorialGuide.selectLanguage('tamil')">
            தமிழ்
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showTutorialChoice() {
    const tutorialTexts = {
      hindi: {
        title: "क्या आप ट्यूटोरियल चाहते हैं?",
        yes: "हां, ट्यूटोरियल दिखाएं",
        no: "नहीं, मैं खुद एक्सप्लोर करूंगा"
      },
      telugu: {
        title: "మీకు ట్యుటోరియల్ కావాలా?",
        yes: "అవును, ట్యుటోరియల్ చూపించు",
        no: "వద్దు, నేనే అన్వేషిస్తాను"
      },
      tamil: {
        title: "பயிற்சி வேண்டுமா?",
        yes: "ஆம், பயிற்சி காட்டுங்கள்",
        no: "வேண்டாம், நானே ஆராய்வேன்"
      }
    };

    const texts = tutorialTexts[this.language] || tutorialTexts.hindi;

    const modal = document.createElement('div');
    modal.className = 'language-selection-fullscreen';
    modal.innerHTML = `
      <div class="language-selection-content">
        <h1 class="language-title">Would you like a tutorial?</h1>
        <h2 class="language-subtitle">${texts.title}</h2>
        <div class="tutorial-choice-buttons">
          <button class="tutorial-choice-btn yes" onclick="tutorialGuide.chooseTutorial(true)">
            Yes, show me the tutorial
          </button>
          <button class="tutorial-choice-btn no" onclick="tutorialGuide.chooseTutorial(false)">
            No, I'll explore on my own
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  selectLanguage(lang) {
    this.language = lang;
    localStorage.setItem('appLanguage', lang);

    // Remove language selection modal
    const modal = document.querySelector('.language-selection-fullscreen');
    if (modal) modal.remove();

    // Show tutorial choice
    this.showTutorialChoice();
  }

  chooseTutorial(wantsTutorial) {
    this.wantsTutorial = wantsTutorial;
    localStorage.setItem('wantsTutorial', wantsTutorial.toString());
    localStorage.setItem('tutorialChoiceMade', 'true');
    this.checkpoints.tutorialChoiceMade = true;
    this.checkpoints.languageSelected = true;
    this.saveProgress();

    // Remove tutorial choice modal
    const modal = document.querySelector('.language-selection-fullscreen');
    if (modal) modal.remove();

    if (wantsTutorial) {
      // Show tutorial language choice
      this.showTutorialLanguageChoice();
    }
    // If no tutorial, just let the app continue normally
  }

  showTutorialLanguageChoice() {
    const nativeLanguageNames = {
      hindi: 'हिंदी',
      telugu: 'తెలుగు',
      tamil: 'தமிழ்'
    };

    const subtitles = {
      hindi: 'ट्यूटोरियल किस भाषा में चाहिए?',
      telugu: 'ట్యుటోరియల్ ఏ భాషలో కావాలి?',
      tamil: 'பயிற்சி எந்த மொழியில் வேண்டும்?'
    };

    const nativeName = nativeLanguageNames[this.language] || 'Native';
    const subtitle = subtitles[this.language] || '';

    const modal = document.createElement('div');
    modal.className = 'language-selection-fullscreen';
    modal.innerHTML = `
      <div class="language-selection-content">
        <h1 class="language-title">Tutorial Language</h1>
        <h2 class="language-subtitle">${subtitle}</h2>
        <div class="tutorial-choice-buttons">
          <button class="tutorial-choice-btn yes" onclick="tutorialGuide.chooseTutorialLanguage('english')">
            English
          </button>
          <button class="tutorial-choice-btn no" onclick="tutorialGuide.chooseTutorialLanguage('native')">
            ${nativeName}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  chooseTutorialLanguage(choice) {
    // 'english' = English only, 'native' = English + translations
    this.tutorialLanguageMode = choice;
    localStorage.setItem('tutorialLanguageMode', choice);

    // Remove modal
    const modal = document.querySelector('.language-selection-fullscreen');
    if (modal) modal.remove();

    this.startTutorial();
  }
  
  startTutorial() {
    this.isActive = true;

    // Show welcome message (method handles English + translation internally)
    this.showMessage(null, null, () => {
      this.showNextStep();
    });
  }
  
  resumeTutorial() {
    this.language = localStorage.getItem('appLanguage') || 'hindi';
    this.tutorialLanguageMode = localStorage.getItem('tutorialLanguageMode') || 'native';
    this.isActive = true;
    // Small delay to ensure page elements are rendered
    setTimeout(() => {
      this.showNextStep();
    }, 300);
  }
  
  showNextStep() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Safety check - make sure translations exist for the language
    if (!this.translations[this.language]) {
      console.error('Tutorial: No translations for language:', this.language);
      return;
    }

    console.log('Tutorial showNextStep - Page:', currentPage, 'Checkpoints:', this.checkpoints);

    // Determine next step based on progress
    if (!this.checkpoints.comicOpened && currentPage === 'index.html') {
      this.showStep('selectComic');
    } else if (this.checkpoints.comicOpened && !this.checkpoints.wordClicked && currentPage === 'index.html') {
      // Comic was just opened but we're still on index page - don't show anything
      return;
    } else if (currentPage.includes('hen') || currentPage.includes('little_red')) {
      // We're on the Little Red Hen page
      const hasTextBox = document.querySelector('.text-box');
      const hasStartButton = document.querySelector('#startbtn');

      console.log('Tutorial on hen page - hasTextBox:', !!hasTextBox, 'hasStartButton:', !!hasStartButton);

      if (hasStartButton && !hasTextBox) {
        // We're on the cover page - show open book instruction
        this.showStep('openBook');
      } else if (hasTextBox && !this.checkpoints.wordClicked) {
        // First page of story after opening - show click word instruction
        this.showStep('clickWord');
      } else if (hasTextBox && this.checkpoints.wordClicked && !this.checkpoints.navigationShown) {
        // After clicking word, show navigation instruction
        this.showStep('navigateStory');
      } else if (this.checkpoints.storyCompleted && !this.checkpoints.wordsAddedToVault) {
        // Story completed, show add to vault
        this.showStep('addToVault');
      } else if (!this.checkpoints.returnedHome && this.checkpoints.wordsAddedToVault) {
        // After adding to vault, show return home
        this.showStep('returnHome');
      }
    } else if (!this.checkpoints.returnedHome && this.checkpoints.wordsAddedToVault && (currentPage.includes('hen') || currentPage.includes('little_red'))) {
      this.showStep('returnHome');
    } else if (!this.checkpoints.vaultVisited) {
      if (currentPage === 'index.html' && this.checkpoints.returnedHome) {
        this.showStep('goToVault');
      } else if (currentPage === 'wordVault.html') {
        this.checkpoints.vaultVisited = true;
        this.saveProgress();
        // Show difficulty explanation first
        this.showStep('explainDifficulty');
      }
    } else if (currentPage === 'wordVault.html' && this.checkpoints.vaultVisited) {
      // Show word vault tutorial steps in order
      if (!this.checkpoints.difficultyExplained) {
        this.showStep('explainDifficulty');
      } else if (!this.checkpoints.addWordShown) {
        this.showStep('addNewWord');
      } else if (!this.checkpoints.deleteWordShown) {
        this.showStep('deleteWord');
      } else if (!this.checkpoints.tagCreated) {
        this.showStep('createTag');
      }
    } else if (!this.checkpoints.quizStarted) {
      if (currentPage === 'index.html' || currentPage === 'wordVault.html') {
        this.showStep('startQuiz');
      } else if (currentPage === 'question.html') {
        this.checkpoints.quizStarted = true;
        this.saveProgress();
        this.showStep('customizeQuiz');
      }
    } else if (currentPage === 'question.html' && this.checkpoints.quizStarted) {
      if (!this.checkpoints.customizeShown) {
        this.showStep('customizeQuiz');
      } else if (!this.checkpoints.templateInfoShown) {
        this.showStep('templateInfo');
      } else if (!this.checkpoints.startQuizInfoShown) {
        this.showStep('startQuizInfo');
      } else if (!this.checkpoints.quizCompleted) {
        // Don't show anything - let user interact with quiz
        return;
      }
    } else if (this.checkpoints.startQuizInfoShown && !this.checkpoints.flashlightExplained && currentPage === 'index.html') {
      // After startQuizInfo, show flashlight explanation on home page
      this.showStep('explainFlashlight');
    } else if (this.checkpoints.flashlightExplained && !this.checkpoints.tutorialComplete) {
      this.completeTutorial();
    } else if (this.checkpoints.quizCompleted && !this.checkpoints.tutorialComplete) {
      this.completeTutorial();
    }
  }
  
  showStep(stepKey) {
    // Check if we have English content for this step
    if (!this.englishSteps[stepKey]) return;

    this.currentStep = stepKey;

    // Create overlay
    this.createOverlay();

    // Show tooltip with step key (method will fetch English + translation)
    this.showTooltip(stepKey);
    
    // Highlight relevant element
    this.highlightElement(stepKey);
    
    // Add escape key handler for skippable steps
    if (stepKey === 'createTag') {
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escapeHandler);
          this.handleStepCompletion();
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  }
  
  createOverlay() {
    // Remove existing overlay sections
    document.querySelectorAll('.overlay-top, .overlay-bottom, .overlay-left, .overlay-right').forEach(el => el.remove());
    
    // Create container
    if (!document.querySelector('.onboarding-overlay')) {
      const container = document.createElement('div');
      container.className = 'onboarding-overlay';
      container.style.display = 'block';
      document.body.appendChild(container);
    }
  }
  
  createCutoutOverlay(element) {
    // Get element position and size
    const rect = element.getBoundingClientRect();
    const padding = 10; // Extra space around element
    
    // Create four overlay sections around the element
    const overlayTop = document.createElement('div');
    overlayTop.className = 'overlay-top';
    overlayTop.style.top = '0';
    overlayTop.style.left = '0';
    overlayTop.style.right = '0';
    overlayTop.style.height = Math.max(0, rect.top - padding) + 'px';
    
    const overlayBottom = document.createElement('div');
    overlayBottom.className = 'overlay-bottom';
    overlayBottom.style.bottom = '0';
    overlayBottom.style.left = '0';
    overlayBottom.style.right = '0';
    overlayBottom.style.top = (rect.bottom + padding) + 'px';
    
    const overlayLeft = document.createElement('div');
    overlayLeft.className = 'overlay-left';
    overlayLeft.style.top = Math.max(0, rect.top - padding) + 'px';
    overlayLeft.style.left = '0';
    overlayLeft.style.width = Math.max(0, rect.left - padding) + 'px';
    overlayLeft.style.height = (rect.height + padding * 2) + 'px';
    
    const overlayRight = document.createElement('div');
    overlayRight.className = 'overlay-right';
    overlayRight.style.top = Math.max(0, rect.top - padding) + 'px';
    overlayRight.style.right = '0';
    overlayRight.style.left = (rect.right + padding) + 'px';
    overlayRight.style.height = (rect.height + padding * 2) + 'px';
    
    // Add all sections
    document.body.appendChild(overlayTop);
    document.body.appendChild(overlayBottom);
    document.body.appendChild(overlayLeft);
    document.body.appendChild(overlayRight);
  }
  
  showTooltip(stepKey) {
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.onboarding-tooltip');
    if (existingTooltip) existingTooltip.remove();

    // Get English text and translation
    const englishStep = this.englishSteps[stepKey];
    const translatedStep = this.translations[this.language]?.steps[stepKey];
    const t = this.translations[this.language];
    const useNativeLanguage = this.tutorialLanguageMode === 'native';

    if (!englishStep) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';

    // Check if this step needs a Next button
    const hasNextButton = ['explainDifficulty', 'addNewWord', 'deleteWord', 'templateInfo', 'startQuizInfo', 'explainFlashlight'].includes(this.currentStep);

    // Show EITHER English OR native language (not both)
    let titleText, contentText;
    if (useNativeLanguage && translatedStep) {
      titleText = translatedStep.title || englishStep.title;
      contentText = translatedStep.content || englishStep.content;
    } else {
      titleText = englishStep.title;
      contentText = englishStep.content;
    }

    // Button text - show in selected language only
    const nextBtnText = useNativeLanguage ? t.next : 'Next';

    if (hasNextButton) {
      tooltip.innerHTML = `
        <h4 style="margin: 0 0 8px 0; color: #2D5A5A; font-size: 16px;">${titleText}</h4>
        <div class="tooltip-content">${contentText}</div>
        <div style="margin-top: 15px; text-align: right;">
          <button class="tooltip-btn next" onclick="tutorialGuide.handleNextClick()">
            ${nextBtnText}
          </button>
        </div>
      `;
    } else {
      tooltip.innerHTML = `
        <h4 style="margin: 0 0 8px 0; color: #2D5A5A; font-size: 16px;">${titleText}</h4>
        <div class="tooltip-content">${contentText}</div>
      `;
    }

    document.body.appendChild(tooltip);
    
    // Get the target element for positioning
    if (this.currentStep === 'selectComic') {
      // Special handling for Little Red Hen comic
      const checkForComic = () => {
        const littleRedHen = this.findLittleRedHenComic();
        if (littleRedHen) {
          this.positionTooltip(tooltip, littleRedHen);
        } else {
          setTimeout(checkForComic, 100);
        }
      };
      checkForComic();
    } else {
      const targetSelector = this.getTargetSelector(this.currentStep);
      if (targetSelector) {
        this.waitForElement(targetSelector, (element) => {
          this.positionTooltip(tooltip, element);
        });
      } else {
        this.positionTooltip(tooltip);
      }
    }
  }
  
  getTargetSelector(stepKey) {
    switch (stepKey) {
      case 'selectComic': return null; // Special handling for Little Red Hen
      case 'openBook': return '#startbtn';
      case 'clickWord': return '.text-box';
      case 'navigateStory': return '#nextBtn';
      case 'addToVault': return 'button[onclick*="addRedHenWords"]';
      case 'returnHome': return '.logo';
      case 'goToVault': return window.innerWidth > 768 ? '.sidebar img[alt="Vault"]' : '.bottom-nav img[alt="Vault"]';
      case 'explainDifficulty': return '.filters'; // The filters container with difficulty buttons
      case 'addNewWord': return '.add-btn'; // The actual class name in HTML
      case 'deleteWord': return '.delete-icon'; // Will need to check this
      case 'createTag': return '.add-tag-btn';
      case 'startQuiz': return window.innerWidth > 768 ? '.sidebar img[alt="Builder"]' : '.bottom-nav img[alt="Builder"]';
      case 'customizeQuiz': return '.customize-btn';
      case 'templateInfo': return '.template-btn';
      case 'startQuizInfo': return '.start-btn';
      case 'saveTemplate': return '#saveAsTemplate';
      case 'explainFlashlight': return window.innerWidth > 768 ? '.sidebar img[alt="Flashlight"]' : '.bottom-nav img[alt="Flashlight"]';
      default: return null;
    }
  }
  
  highlightElement(stepKey) {
    // Remove existing highlights
    document.querySelectorAll('.spotlight').forEach(el => el.remove());
    
    let selector = null;
    
    switch (stepKey) {
      case 'selectComic':
        // Special handling - find Little Red Hen comic
        const littleRedHen = this.findLittleRedHenComic();
        if (littleRedHen) {
          this.addSpotlight(littleRedHen);
          // Add click handler for comic selection
          const comicClickHandler = () => {
            littleRedHen.removeEventListener('click', comicClickHandler);
            this.clearTutorialElements();
          };
          littleRedHen.addEventListener('click', comicClickHandler);
        }
        return; // Exit early since we handled it
      case 'openBook':
        selector = '#startbtn';
        // Add special tracking for Open Book button
        this.waitForElement('#startbtn', (btn) => {
          const openBookHandler = () => {
            btn.removeEventListener('click', openBookHandler);
            this.clearTutorialElements();
            // The trackBookOpened will be called by startBook()
          };
          btn.addEventListener('click', openBookHandler);
        });
        break;
      case 'clickWord':
        selector = '.text-box';  // Highlight the entire text area
        break;
      case 'navigateStory':
        selector = '#nextBtn';
        // Mark navigation as shown
        this.checkpoints.navigationShown = true;
        this.saveProgress();
        // Add click tracking for next button
        this.waitForElement('#nextBtn', (btn) => {
          const nextHandler = () => {
            btn.removeEventListener('click', nextHandler);
            this.clearTutorialElements();
            // Story continues
          };
          btn.addEventListener('click', nextHandler);
        });
        break;
      case 'addToVault':
        selector = 'button[onclick*="addRedHenWords"]';
        break;
      case 'returnHome':
        selector = '.logo';
        break;
      case 'goToVault':
        selector = window.innerWidth > 768 ? '.sidebar img[alt="Vault"]' : '.bottom-nav img[alt="Vault"]';
        break;
      case 'explainDifficulty':
        // Highlight the filters but don't make them clickable
        this.waitForElement('.filters', (element) => {
          this.addSpotlight(element);
        });
        return;
      case 'addNewWord':
        selector = '.add-btn';
        break;
      case 'deleteWord':
        // Find first delete icon
        selector = '.delete-icon';
        break;
      case 'createTag':
        selector = '.add-tag-btn';
        break;
      case 'startQuiz':
        selector = window.innerWidth > 768 ? '.sidebar img[alt="Builder"]' : '.bottom-nav img[alt="Builder"]';
        break;
      case 'customizeQuiz':
        selector = '.customize-btn';
        break;
      case 'templateInfo':
        selector = '.template-btn';
        break;
      case 'startQuizInfo':
        selector = '.start-btn';
        break;
      case 'saveTemplate':
        selector = '#saveAsTemplate';
        break;
      case 'explainFlashlight':
        // Highlight the flashlight icon but don't make it clickable (use Next button)
        selector = window.innerWidth > 768 ? '.sidebar img[alt="Flashlight"]' : '.bottom-nav img[alt="Flashlight"]';
        this.waitForElement(selector, (element) => {
          this.addSpotlight(element);
        });
        return;
    }

    if (selector) {
      this.waitForElement(selector, (element) => {
        this.addSpotlight(element);
      });
    }
  }
  
  waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
    } else {
      setTimeout(() => this.waitForElement(selector, callback), 100);
    }
  }
  
  findLittleRedHenComic() {
    // Find the Little Red Hen comic by looking for its text content
    const comics = document.querySelectorAll('.comic-book');
    for (let comic of comics) {
      const titleElement = comic.querySelector('.comic-title');
      if (titleElement && titleElement.textContent.includes('Little Red Hen')) {
        return comic;
      }
    }
    return null;
  }
  
  addSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    spotlight.style.left = (rect.left - 5) + 'px';
    spotlight.style.top = (rect.top - 5) + 'px';
    spotlight.style.width = (rect.width + 10) + 'px';
    spotlight.style.height = (rect.height + 10) + 'px';
    document.body.appendChild(spotlight);
    
    // Create cutout overlay around this element
    this.createCutoutOverlay(element);
    
    // Add click listener to the element to advance tutorial
    // Skip for certain steps that have special handling or use Next button instead
    const skipClickHandler = ['openBook', 'selectComic', 'explainDifficulty', 'explainFlashlight'].includes(this.currentStep);
    if (!skipClickHandler) {
      const clickHandler = () => {
        element.removeEventListener('click', clickHandler);
        this.handleStepCompletion();
      };
      element.addEventListener('click', clickHandler);
    }
  }
  
  
  positionTooltip(tooltip, targetElement) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (targetElement) {
      // Position relative to the highlighted element
      const targetRect = targetElement.getBoundingClientRect();
      let left, top;
      
      // Increase spacing from target element
      const spacing = 50; // Increased from 30
      
      // Try to position above the element first
      if (targetRect.top - tooltipRect.height - spacing > 20) {
        // Position above
        top = targetRect.top - tooltipRect.height - spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      } 
      // If not enough space above, try below
      else if (targetRect.bottom + tooltipRect.height + spacing < viewportHeight - 20) {
        // Position below
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      }
      // If not enough space above or below, position to the side
      else if (targetRect.left - tooltipRect.width - spacing > 20) {
        // Position to the left
        left = targetRect.left - tooltipRect.width - spacing;
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      } else {
        // Position to the right
        left = targetRect.right + spacing;
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      }
      
      // Keep within viewport
      left = Math.max(20, Math.min(viewportWidth - tooltipRect.width - 20, left));
      top = Math.max(20, Math.min(viewportHeight - tooltipRect.height - 20, top));
      
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    } else {
      // Default center positioning if no target element
      const left = (viewportWidth - tooltipRect.width) / 2;
      const top = (viewportHeight - tooltipRect.height) / 2;
      
      tooltip.style.left = Math.max(20, Math.min(viewportWidth - tooltipRect.width - 20, left)) + 'px';
      tooltip.style.top = Math.max(20, Math.min(viewportHeight - tooltipRect.height - 20, top)) + 'px';
    }
  }
  
  showMessage(title, content, callback) {
    const t = this.translations[this.language];
    const useNativeLanguage = this.tutorialLanguageMode === 'native';
    const messageBox = document.createElement('div');
    messageBox.className = 'onboarding-tooltip';
    messageBox.style.textAlign = 'center';

    // Show EITHER English OR native language (not both)
    const welcomeText = useNativeLanguage ? t.welcomeTranslation : 'Welcome to G3 Tutorial!';
    const letsStartText = useNativeLanguage ? t.letsStartTranslation : "Let's learn how to use G3 step by step";
    const btnText = useNativeLanguage ? t.letsStartBtnTranslation : "Let's Start!";

    messageBox.innerHTML = `
      <h2 style="color: #2D5A5A; margin-bottom: 15px;">
        ${welcomeText}
      </h2>
      <p style="font-size: 18px; margin-bottom: 20px;">
        ${letsStartText}
      </p>
      <button class="tooltip-btn next" onclick="tutorialGuide.dismissMessage()">
        ${btnText}
      </button>
    `;

    document.body.appendChild(messageBox);
    // Position the welcome message at the top of the screen
    messageBox.style.position = 'fixed';
    messageBox.style.top = '50px';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translateX(-50%)';

    this.messageCallback = callback;
  }
  
  dismissMessage() {
    document.querySelector('.onboarding-tooltip').remove();
    if (this.messageCallback) {
      this.messageCallback();
      this.messageCallback = null;
    }
  }
  
  handleNextClick() {
    // Handle Next button clicks for skippable steps
    this.clearTutorialElements();

    switch (this.currentStep) {
      case 'explainDifficulty':
        this.checkpoints.difficultyExplained = true;
        break;
      case 'addNewWord':
        this.checkpoints.addWordShown = true;
        break;
      case 'deleteWord':
        this.checkpoints.deleteWordShown = true;
        break;
      case 'templateInfo':
        this.checkpoints.templateInfoShown = true;
        break;
      case 'startQuizInfo':
        this.checkpoints.startQuizInfoShown = true;
        this.saveProgress();
        // Redirect to home page to show flashlight explanation
        window.location.href = 'index.html';
        return;
      case 'explainFlashlight':
        this.checkpoints.flashlightExplained = true;
        this.saveProgress();
        this.completeTutorial();
        return;
    }

    this.saveProgress();
    this.showNextStep();
  }
  
  handleStepCompletion() {
    // Clear tutorial elements
    this.clearTutorialElements();
    
    // Handle specific step completions
    switch (this.currentStep) {
      case 'returnHome':
        this.checkpoints.returnedHome = true;
        this.saveProgress();
        // Will show goToVault when index page loads
        break;
      case 'goToVault':
        this.checkpoints.vaultVisited = true;
        this.saveProgress();
        // Will show explainDifficulty when vault page loads
        break;
      case 'addNewWord':
        this.checkpoints.addWordShown = true;
        this.saveProgress();
        // Show next step after a short delay
        setTimeout(() => this.showNextStep(), 500);
        break;
      case 'deleteWord':
        this.checkpoints.deleteWordShown = true;
        this.saveProgress();
        // Show next step after a short delay
        setTimeout(() => this.showNextStep(), 500);
        break;
      case 'createTag':
        this.checkpoints.tagCreated = true;
        this.saveProgress();
        setTimeout(() => this.showNextStep(), 500);
        break;
      case 'startQuiz':
        // Navigation will handle the rest
        break;
      case 'customizeQuiz':
        this.checkpoints.customizeShown = true;
        this.saveProgress();
        // Will show templateInfo after customize modal closes
        break;
      default:
        // For other steps, just clear and wait for page-specific handlers
        break;
    }
  }
  
  // Track progress methods
  trackComicOpened() {
    if (this.isActive && !this.checkpoints.comicOpened) {
      this.checkpoints.comicOpened = true;
      this.saveProgress();
      this.clearTutorialElements();
      // Don't show next step here - let the comic page handle it when it loads
    }
  }
  
  trackBookOpened() {
    if (this.isActive) {
      this.clearTutorialElements();
      // Wait for page to render before showing next step
      setTimeout(() => {
        this.showNextStep();
      }, 300);
    }
  }
  
  trackWordClicked() {
    if (this.isActive && !this.checkpoints.wordClicked) {
      this.checkpoints.wordClicked = true;
      this.saveProgress();
      this.clearTutorialElements();
      // Don't show next step yet - wait for popup to close
    }
  }
  
  trackPopupClosed() {
    if (this.isActive && this.checkpoints.wordClicked && !this.checkpoints.navigationShown) {
      // Now show the navigation instruction
      setTimeout(() => {
        this.showNextStep();
      }, 300);
    }
  }
  
  trackStoryCompleted() {
    if (this.isActive && !this.checkpoints.storyCompleted) {
      this.checkpoints.storyCompleted = true;
      this.saveProgress();
      this.showNextStep();
    }
  }
  
  trackWordsAddedToVault() {
    if (this.isActive && !this.checkpoints.wordsAddedToVault) {
      this.checkpoints.wordsAddedToVault = true;
      this.saveProgress();
      this.clearTutorialElements();
      // Show the return home step instead of auto-redirecting
      setTimeout(() => {
        this.showNextStep();
      }, 500);
    }
  }
  
  trackTagCreated() {
    if (this.isActive && !this.checkpoints.tagCreated) {
      this.checkpoints.tagCreated = true;
      this.saveProgress();
      setTimeout(() => {
        this.showNextStep();
      }, 1000);
    }
  }
  
  
  trackTemplateCreated() {
    if (this.isActive && !this.checkpoints.templateCreated) {
      this.checkpoints.templateCreated = true;
      this.saveProgress();
      this.clearTutorialElements();
    }
  }
  
  trackQuizCompleted() {
    if (this.isActive && !this.checkpoints.quizCompleted) {
      this.checkpoints.quizCompleted = true;
      this.saveProgress();
      setTimeout(() => {
        this.completeTutorial();
      }, 2000);
    }
  }
  
  completeTutorial() {
    this.checkpoints.tutorialComplete = true;
    this.saveProgress();

    const englishStep = this.englishSteps.tutorialComplete;
    const translatedStep = this.translations[this.language]?.steps.tutorialComplete;
    const t = this.translations[this.language];
    const useNativeLanguage = this.tutorialLanguageMode === 'native';
    this.clearTutorialElements();

    // Show EITHER English OR native language (not both)
    const titleText = useNativeLanguage && translatedStep?.title ? translatedStep.title : englishStep.title;
    const contentText = useNativeLanguage && translatedStep?.content ? translatedStep.content : englishStep.content;
    const btnText = useNativeLanguage ? t.startLearningTranslation : 'Start Learning!';

    const completionBox = document.createElement('div');
    completionBox.className = 'onboarding-tooltip';
    completionBox.style.textAlign = 'center';
    completionBox.innerHTML = `
      <h2 style="color: #2D5A5A; margin-bottom: 15px; font-size: 28px;">
        ${titleText}
      </h2>
      <p style="font-size: 18px; margin-bottom: 25px;">
        ${contentText}
      </p>
      <button class="tooltip-btn next" style="font-size: 18px; padding: 12px 30px;"
              onclick="tutorialGuide.finishTutorial()">
        ${btnText}
      </button>
    `;

    document.body.appendChild(completionBox);
    this.positionTooltip(completionBox);
  }
  
  finishTutorial() {
    this.isActive = false;
    this.clearTutorialElements();
    window.location.href = 'index.html';
  }
  
  clearTutorialElements() {
    // Remove all tutorial elements
    document.querySelectorAll('.onboarding-overlay').forEach(el => el.remove());
    document.querySelectorAll('.onboarding-tooltip').forEach(el => el.remove());
    document.querySelectorAll('.spotlight').forEach(el => el.remove());
    document.querySelectorAll('.overlay-top, .overlay-bottom, .overlay-left, .overlay-right').forEach(el => el.remove());
  }
  
  saveProgress() {
    localStorage.setItem('tutorialProgress', JSON.stringify(this.checkpoints));
  }
  
  loadProgress() {
    const saved = localStorage.getItem('tutorialProgress');
    return saved ? JSON.parse(saved) : {};
  }
  
  resetTutorial() {
    localStorage.removeItem('tutorialProgress');
    localStorage.removeItem('tutorialLanguage');
    this.checkpoints = {
      languageSelected: false,
      tutorialChoiceMade: false,
      comicOpened: false,
      wordClicked: false,
      navigationShown: false,
      storyCompleted: false,
      wordsAddedToVault: false,
      returnedHome: false,
      vaultVisited: false,
      difficultyExplained: false,
      addWordShown: false,
      deleteWordShown: false,
      tagCreated: false,
      quizStarted: false,
      customizeShown: false,
      templateInfoShown: false,
      startQuizInfoShown: false,
      flashlightExplained: false,
      quizCompleted: false,
      templateCreated: false,
      tutorialComplete: false
    };
    window.location.reload();
  }
}

// Initialize tutorial guide
const tutorialGuide = new InteractiveOnboarding();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tutorialGuide.init());
} else {
  tutorialGuide.init();
}

// Export for use in other files
window.tutorialGuide = tutorialGuide;