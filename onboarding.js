// Onboarding Tour System

class OnboardingTour {
  constructor() {
    this.language = 'english';
    this.currentStep = 0;
    this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    this.tourActive = false;
    this.hasSeenTour = localStorage.getItem('hasSeenOnboarding') === 'true';
    
    // Tour content in both languages
    this.translations = {
      english: {
        welcome: "Welcome to G3!",
        chooseLanguage: "Choose your preferred language",
        startTour: "Start Tour",
        skip: "Skip",
        next: "Next",
        done: "Done",
        gotIt: "Got it!",
        
        // Index page tour
        indexTour: [
          {
            element: '.comic-book:first-child',
            title: "Start Reading!",
            content: "Click on any comic book to start learning Telugu. Each story is designed for different levels.",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Vault"], .bottom-nav img[alt="Vault"]',
            title: "Your Word Vault",
            content: "Click here to see all the words you've learned. You can organize them with tags!",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Builder"], .bottom-nav img[alt="Builder"]',
            title: "Take Quizzes",
            content: "Test your knowledge with custom quizzes. You can choose different question types.",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Settings"], .bottom-nav img[alt="Settings"]',
            title: "Settings",
            content: "Filter comics by your proficiency level here.",
            position: 'right',
            pointer: 'left'
          }
        ],
        
        // Comic page tour
        comicTour: [
          {
            element: '#startbtn',
            title: "Open the Book",
            content: "Click here to start reading the story!",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.word',
            title: "Interactive Words",
            content: "Click any underlined word to see its Telugu translation.",
            position: 'top',
            pointer: 'down',
            miniTip: "Tip: The translation will appear in a popup!"
          },
          {
            element: '#nextBtn',
            title: "Navigate Pages",
            content: "Use these arrows to move between pages.",
            position: 'top',
            pointer: 'down'
          }
        ],
        
        // Word Vault tour
        vaultTour: [
          {
            element: '.add-btn',
            title: "Add New Words",
            content: "Click here to manually add words to your vault.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.filter-btn:nth-child(2)',
            title: "Filter by Difficulty",
            content: "Click these buttons to see only Easy, Medium, or Hard words.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.add-tag-btn',
            title: "Create Tags",
            content: "Organize your words with custom tags like 'Food' or 'Animals'.",
            position: 'left',
            pointer: 'right'
          },
          {
            element: '.word-cell.has-note',
            title: "View Notes",
            content: "Words with dots have notes. Click to read them!",
            position: 'right',
            pointer: 'left',
            optional: true
          }
        ],
        
        // Quiz page tour
        quizTour: [
          {
            element: '.start-btn',
            title: "Quick Start",
            content: "Click here for a default quiz with mixed questions.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.customize-btn',
            title: "Customize Quiz",
            content: "Create your own quiz by choosing question types and word groups.",
            position: 'top',
            pointer: 'down'
          },
          {
            element: '.template-btn',
            title: "Save Templates",
            content: "Save your favorite quiz configurations for quick access.",
            position: 'top',
            pointer: 'down'
          }
        ],
        
        // Context tips
        tips: {
          wordClick: "Click any underlined word to see its meaning!",
          addToVault: "Great! This word is now in your vault.",
          firstQuiz: "Pro tip: Start with 5-10 questions for your first quiz!",
          tagCreated: "Perfect! Now you can organize words with this tag.",
          quizComplete: "Well done! Incorrect answers are automatically marked as 'Hard' for more practice."
        }
      },
      
      telugu: {
        welcome: "G3కి స్వాగతం!",
        chooseLanguage: "మీ భాషను ఎంచుకోండి",
        startTour: "టూర్ ప్రారంభించండి",
        skip: "దాటవేయి",
        next: "తదుపరి",
        done: "పూర్తయింది",
        gotIt: "అర్థమైంది!",
        
        // Index page tour
        indexTour: [
          {
            element: '.comic-book:first-child',
            title: "చదవడం ప్రారంభించండి!",
            content: "తెలుగు నేర్చుకోవడానికి ఏదైనా కామిక్ పుస్తకంపై క్లిక్ చేయండి. ప్రతి కథ వేర్వేరు స్థాయిలకు రూపొందించబడింది.",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Vault"], .bottom-nav img[alt="Vault"]',
            title: "మీ పద భాండాగారం",
            content: "మీరు నేర్చుకున్న అన్ని పదాలను చూడటానికి ఇక్కడ క్లిక్ చేయండి. వాటిని ట్యాగ్‌లతో నిర్వహించవచ్చు!",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Builder"], .bottom-nav img[alt="Builder"]',
            title: "క్విజ్‌లు తీసుకోండి",
            content: "కస్టమ్ క్విజ్‌లతో మీ జ్ఞానాన్ని పరీక్షించుకోండి. వివిధ ప్రశ్న రకాలను ఎంచుకోవచ్చు.",
            position: 'right',
            pointer: 'left'
          },
          {
            element: '.sidebar img[alt="Settings"], .bottom-nav img[alt="Settings"]',
            title: "సెట్టింగ్‌లు",
            content: "మీ నైపుణ్య స్థాయి ప్రకారం కామిక్స్‌ను ఫిల్టర్ చేయండి.",
            position: 'right',
            pointer: 'left'
          }
        ],
        
        // Comic page tour
        comicTour: [
          {
            element: '#startbtn',
            title: "పుస్తకం తెరవండి",
            content: "కథ చదవడం ప్రారంభించడానికి ఇక్కడ క్లిక్ చేయండి!",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.word',
            title: "ఇంటరాక్టివ్ పదాలు",
            content: "తెలుగు అనువాదం చూడటానికి ఏదైనా అండర్‌లైన్ చేసిన పదంపై క్లిక్ చేయండి.",
            position: 'top',
            pointer: 'down',
            miniTip: "చిట్కా: అనువాదం పాప్అప్‌లో కనిపిస్తుంది!"
          },
          {
            element: '#nextBtn',
            title: "పేజీలను నావిగేట్ చేయండి",
            content: "పేజీల మధ్య తరలించడానికి ఈ బాణాలను ఉపయోగించండి.",
            position: 'top',
            pointer: 'down'
          }
        ],
        
        // Word Vault tour
        vaultTour: [
          {
            element: '.add-btn',
            title: "కొత్త పదాలు జోడించండి",
            content: "మీ భాండాగారానికి పదాలను మాన్యువల్‌గా జోడించడానికి ఇక్కడ క్లిక్ చేయండి.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.filter-btn:nth-child(2)',
            title: "కష్టం ద్వారా ఫిల్టర్ చేయండి",
            content: "సులభం, మధ్యస్థం లేదా కష్టమైన పదాలను మాత్రమే చూడటానికి ఈ బటన్‌లను క్లిక్ చేయండి.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.add-tag-btn',
            title: "ట్యాగ్‌లు సృష్టించండి",
            content: "'ఆహారం' లేదా 'జంతువులు' వంటి కస్టమ్ ట్యాగ్‌లతో మీ పదాలను నిర్వహించండి.",
            position: 'left',
            pointer: 'right'
          },
          {
            element: '.word-cell.has-note',
            title: "గమనికలు చూడండి",
            content: "చుక్కలు ఉన్న పదాలకు గమనికలు ఉంటాయి. వాటిని చదవడానికి క్లిక్ చేయండి!",
            position: 'right',
            pointer: 'left',
            optional: true
          }
        ],
        
        // Quiz page tour
        quizTour: [
          {
            element: '.start-btn',
            title: "త్వరిత ప్రారంభం",
            content: "మిశ్రమ ప్రశ్నలతో డిఫాల్ట్ క్విజ్ కోసం ఇక్కడ క్లిక్ చేయండి.",
            position: 'bottom',
            pointer: 'up'
          },
          {
            element: '.customize-btn',
            title: "క్విజ్‌ను అనుకూలీకరించండి",
            content: "ప్రశ్న రకాలు మరియు పద సమూహాలను ఎంచుకోవడం ద్వారా మీ స్వంత క్విజ్‌ను సృష్టించండి.",
            position: 'top',
            pointer: 'down'
          },
          {
            element: '.template-btn',
            title: "టెంప్లేట్‌లను సేవ్ చేయండి",
            content: "త్వరిత యాక్సెస్ కోసం మీకు ఇష్టమైన క్విజ్ కాన్ఫిగరేషన్‌లను సేవ్ చేయండి.",
            position: 'top',
            pointer: 'down'
          }
        ],
        
        // Context tips
        tips: {
          wordClick: "దాని అర్థం చూడటానికి ఏదైనా అండర్‌లైన్ చేసిన పదంపై క్లిక్ చేయండి!",
          addToVault: "అద్భుతం! ఈ పదం ఇప్పుడు మీ భాండాగారంలో ఉంది.",
          firstQuiz: "ప్రో చిట్కా: మీ మొదటి క్విజ్ కోసం 5-10 ప్రశ్నలతో ప్రారంభించండి!",
          tagCreated: "పరిపూర్ణం! ఇప్పుడు మీరు ఈ ట్యాగ్‌తో పదాలను నిర్వహించవచ్చు.",
          quizComplete: "బాగా చేసారు! తప్పు సమాధానాలు ఎక్కువ అభ్యాసం కోసం స్వయంచాలకంగా 'కష్టం'గా గుర్తించబడతాయి."
        }
      }
    };
  }
  
  init() {
    // Check if user has seen onboarding
    if (!this.hasSeenTour) {
      this.showLanguageSelection();
    }
    
    // Add onboarding CSS
    if (!document.querySelector('link[href="onboarding.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'onboarding.css';
      document.head.appendChild(link);
    }
  }
  
  showLanguageSelection() {
    const modal = document.createElement('div');
    modal.className = 'onboarding-language-modal';
    modal.innerHTML = `
      <div class="language-selection-box">
        <h2>Welcome to G3! • G3కి స్వాగతం!</h2>
        <p>Choose your preferred language<br>మీ భాషను ఎంచుకోండి</p>
        <div class="language-buttons">
          <button class="language-btn english" onclick="onboarding.selectLanguage('english')">
            English
          </button>
          <button class="language-btn telugu" onclick="onboarding.selectLanguage('telugu')">
            తెలుగు
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  selectLanguage(lang) {
    this.language = lang;
    localStorage.setItem('preferredLanguage', lang);
    document.querySelector('.onboarding-language-modal').remove();
    this.startTour();
  }
  
  startTour() {
    this.tourActive = true;
    this.currentStep = 0;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);
    
    // Create progress indicator
    this.createProgressIndicator();
    
    // Start page-specific tour
    this.showCurrentStep();
  }
  
  createProgressIndicator() {
    const steps = this.getCurrentTourSteps();
    const progress = document.createElement('div');
    progress.className = 'tour-progress';
    progress.style.display = 'block';
    progress.innerHTML = `
      <div class="progress-dots">
        ${steps.map((_, i) => `<div class="progress-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
      </div>
    `;
    document.body.appendChild(progress);
  }
  
  getCurrentTourSteps() {
    const tours = this.translations[this.language];
    
    if (this.currentPage === 'index.html') return tours.indexTour;
    if (this.currentPage.includes('hen') || this.currentPage.includes('joe') || this.currentPage.includes('cow')) return tours.comicTour;
    if (this.currentPage === 'wordVault.html') return tours.vaultTour;
    if (this.currentPage === 'question.html') return tours.quizTour;
    
    return [];
  }
  
  showCurrentStep() {
    const steps = this.getCurrentTourSteps();
    if (this.currentStep >= steps.length) {
      this.completeTour();
      return;
    }
    
    const step = steps[this.currentStep];
    
    // Update progress dots
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
      dot.classList.remove('active');
      if (i < this.currentStep) dot.classList.add('completed');
      if (i === this.currentStep) dot.classList.add('active');
    });
    
    // Wait for element to be available
    this.waitForElement(step.element, () => {
      this.highlightElement(step);
      this.showTooltip(step);
      if (step.miniTip) {
        setTimeout(() => this.showMiniTip(step), 1500);
      }
    });
  }
  
  waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
      callback();
    } else {
      setTimeout(() => this.waitForElement(selector, callback), 100);
    }
  }
  
  highlightElement(step) {
    // Remove previous spotlight
    const oldSpotlight = document.querySelector('.spotlight');
    if (oldSpotlight) oldSpotlight.remove();
    
    const element = document.querySelector(step.element);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    spotlight.style.left = rect.left - 5 + 'px';
    spotlight.style.top = rect.top - 5 + 'px';
    spotlight.style.width = rect.width + 10 + 'px';
    spotlight.style.height = rect.height + 10 + 'px';
    document.body.appendChild(spotlight);
  }
  
  showTooltip(step) {
    // Remove previous tooltip
    const oldTooltip = document.querySelector('.onboarding-tooltip');
    if (oldTooltip) oldTooltip.remove();
    
    const element = document.querySelector(step.element);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    
    const t = this.translations[this.language];
    tooltip.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #2D5A5A;">${step.title}</h3>
      <div class="tooltip-content">${step.content}</div>
      <div class="tooltip-buttons">
        <button class="tooltip-btn skip" onclick="onboarding.skipTour()">${t.skip}</button>
        <button class="tooltip-btn next" onclick="onboarding.nextStep()">
          ${this.currentStep === this.getCurrentTourSteps().length - 1 ? t.done : t.next}
        </button>
      </div>
    `;
    
    // Position tooltip
    document.body.appendChild(tooltip);
    this.positionTooltip(tooltip, rect, step.position);
    
    // Add pointer
    if (step.pointer) {
      this.addPointer(rect, step.pointer);
    }
  }
  
  positionTooltip(tooltip, elementRect, position) {
    const tooltipRect = tooltip.getBoundingClientRect();
    let top, left;
    
    switch (position) {
      case 'top':
        top = elementRect.top - tooltipRect.height - 20;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = elementRect.bottom + 20;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + 20;
        break;
    }
    
    // Keep tooltip in viewport
    top = Math.max(20, Math.min(window.innerHeight - tooltipRect.height - 20, top));
    left = Math.max(20, Math.min(window.innerWidth - tooltipRect.width - 20, left));
    
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }
  
  addPointer(rect, direction) {
    const oldPointer = document.querySelector('.pointer');
    if (oldPointer) oldPointer.remove();
    
    const pointer = document.createElement('div');
    pointer.className = `pointer ${direction}`;
    
    switch (direction) {
      case 'up':
        pointer.style.top = rect.bottom + 10 + 'px';
        pointer.style.left = rect.left + rect.width / 2 - 15 + 'px';
        break;
      case 'down':
        pointer.style.top = rect.top - 40 + 'px';
        pointer.style.left = rect.left + rect.width / 2 - 15 + 'px';
        break;
      case 'left':
        pointer.style.top = rect.top + rect.height / 2 - 15 + 'px';
        pointer.style.left = rect.right + 10 + 'px';
        break;
      case 'right':
        pointer.style.top = rect.top + rect.height / 2 - 15 + 'px';
        pointer.style.left = rect.left - 40 + 'px';
        break;
    }
    
    document.body.appendChild(pointer);
  }
  
  showMiniTip(step) {
    if (!this.tourActive) return;
    
    const miniTip = document.createElement('div');
    miniTip.className = 'mini-tip';
    miniTip.textContent = step.miniTip;
    
    const element = document.querySelector(step.element);
    if (element) {
      const rect = element.getBoundingClientRect();
      miniTip.style.left = rect.left + rect.width / 2 - 100 + 'px';
      miniTip.style.top = rect.bottom + 10 + 'px';
      document.body.appendChild(miniTip);
      
      setTimeout(() => miniTip.remove(), 3000);
    }
  }
  
  nextStep() {
    this.currentStep++;
    this.showCurrentStep();
  }
  
  skipTour() {
    this.completeTour();
  }
  
  completeTour() {
    this.tourActive = false;
    localStorage.setItem('hasSeenOnboarding', 'true');
    
    // Clean up
    document.querySelector('.onboarding-overlay')?.remove();
    document.querySelector('.tour-progress')?.remove();
    document.querySelector('.spotlight')?.remove();
    document.querySelector('.onboarding-tooltip')?.remove();
    document.querySelector('.pointer')?.remove();
    
    // Show completion message
    this.showCompletionMessage();
  }
  
  showCompletionMessage() {
    const t = this.translations[this.language];
    const message = document.createElement('div');
    message.className = 'mini-tip';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '18px';
    message.style.padding = '20px 30px';
    message.textContent = this.language === 'english' ? 
      "You're all set! Enjoy learning Telugu! 🎉" : 
      "మీరు సిద్ధంగా ఉన్నారు! తెలుగు నేర్చుకోవడం ఆనందించండి! 🎉";
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  }
  
  // Context-aware tips
  showContextTip(tipKey) {
    if (this.tourActive) return;
    
    const tips = this.translations[this.language].tips;
    if (!tips[tipKey]) return;
    
    const tip = document.createElement('div');
    tip.className = 'mini-tip';
    tip.textContent = tips[tipKey];
    tip.style.position = 'fixed';
    tip.style.bottom = '20px';
    tip.style.left = '50%';
    tip.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 4000);
  }
}

// Initialize onboarding
const onboarding = new OnboardingTour();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => onboarding.init());
} else {
  onboarding.init();
}

// Export for use in other files
window.onboarding = onboarding;