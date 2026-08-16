/**
 * Games Night Quiz Screen Controller
 * Handles Round 1 (Innuendo Lingo), Round 2 (Phunny Phrases), 
 * Team Scoreboard, Presentation navigation, and Audio FX.
 */

import { GAMES_NIGHT_INFO, QUIZ_QUESTIONS } from '../data/quiz-data.js';
import { SoundFX } from './sound.js';

// Language codes mapping for browser Web Speech Synthesis
const LANG_SPEECH_CODES = {
  'Swedish': 'sv-SE',
  'Mandarin': 'zh-CN',
  'Japanese': 'ja-JP',
  'Turkish': 'tr-TR',
  'Dutch': 'nl-NL',
  'Finnish': 'fi-FI',
  'Russian': 'ru-RU',
  'Hindi': 'hi-IN',
  'Italian': 'it-IT',
  'Spanish': 'es-ES',
  'German': 'de-DE',
  'Danish': 'da-DK',
  'French': 'fr-FR',
  'Portuguese': 'pt-BR',
  'Korean': 'ko-KR',
  'Indonesian': 'id-ID',
  'Polish': 'pl-PL',
  'Hungarian': 'hu-HU',
  'Greek': 'el-GR',
  'Arabic': 'ar-SA'
};

class QuizApp {
  constructor() {
    this.sound = new SoundFX();
    this.currentTab = 'intro'; // 'intro' | 'round-1' | 'round-2' | 'round-3' | 'round-4'
    this.questionIndex = 0;
    this.revealedQuestions = new Set(); // Set of question keys e.g. "r1-q1"
    this.viewMode = 'single'; // 'single' | 'grid'
    this.showAnswersInGrid = false;

    // Team Scoreboard Data from localStorage
    this.teams = this.loadTeams();

    this.dom = {
      // Tabs
      tabs: document.querySelectorAll('.quiz-tab'),
      // Containers
      introSection: document.getElementById('quiz-intro-section'),
      stageSection: document.getElementById('quiz-stage-section'),
      allQSection: document.getElementById('quiz-all-q-section'),
      round3Section: document.getElementById('quiz-round3-section'),
      round4Section: document.getElementById('quiz-round4-section'),

      // Question Stage Elements
      stageRoundTag: document.getElementById('stage-round-tag'),
      stageLangBadge: document.getElementById('stage-lang-badge'),
      stageFlag: document.getElementById('stage-flag'),
      stageLangName: document.getElementById('stage-lang-name'),
      stageQNumberPill: document.getElementById('stage-q-number-pill'),
      navPillsContainer: document.getElementById('question-nav-pills'),
      promptForeignText: document.getElementById('prompt-foreign-text'),
      promptPronunciation: document.getElementById('prompt-pronunciation'),
      btnSpeakStage: document.getElementById('btn-speak-stage'),
      stageDynamicContent: document.getElementById('stage-dynamic-content'),

      // Controls
      btnPrevQ: document.getElementById('btn-prev-q'),
      btnNextQ: document.getElementById('btn-next-q'),
      btnRevealAnswer: document.getElementById('btn-reveal-answer'),
      btnToggleGrid: document.getElementById('btn-toggle-grid'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnMute: document.getElementById('btn-mute'),
      btnScoresModal: document.getElementById('btn-scores-modal'),
      btnAnswerKeyModal: document.getElementById('btn-answer-key-modal'),

      // Modals
      scoresModal: document.getElementById('scores-modal'),
      btnCloseScores: document.getElementById('btn-close-scores'),
      btnAddTeam: document.getElementById('btn-add-team'),
      teamsTableBody: document.getElementById('teams-table-body'),
      answerKeyModal: document.getElementById('answer-key-modal'),
      btnCloseAnswerKey: document.getElementById('btn-close-answer-key'),
      answerKeyContent: document.getElementById('answer-key-content'),

      // Winner Celebration Modal & Intro Duolingo Elements
      btnTreasureChest: document.getElementById('btn-treasure-chest'),
      winnerModal: document.getElementById('winner-modal'),
      btnCloseWinner: document.getElementById('btn-close-winner'),
      winnerModalContent: document.getElementById('winner-modal-content'),
      btnWinnerScoreboard: document.getElementById('btn-winner-scoreboard'),
      btnWinnerConfettiReplay: document.getElementById('btn-winner-confetti-replay'),
      confettiCanvas: document.getElementById('confetti-canvas'),
      btnIntroScoresShortcut: document.getElementById('btn-intro-scores-shortcut'),

      // Grid view
      allQGridTitle: document.getElementById('all-q-grid-title'),
      allQGridContainer: document.getElementById('all-q-grid-container'),
      btnGridBackToSingle: document.getElementById('btn-grid-back-to-single'),
      btnGridToggleAnswers: document.getElementById('btn-grid-toggle-answers')
    };

    this.confettiAnimationId = null;
    this.confettiParticles = [];

    this.init();
  }

  init() {
    // Warm up speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      }
    }
    this.bindEvents();
    this.renderActiveTab();
    this.renderTeamsTable();
  }

  loadTeams() {
    const saved = localStorage.getItem('games_night_teams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 1, name: 'Team Alpha', player1: 'Player 1', player2: 'Player 2', r1: 0, r2: 0, r3: 0, r4: 0 },
      { id: 2, name: 'Team Beta', player1: 'Player 3', player2: 'Player 4', r1: 0, r2: 0, r3: 0, r4: 0 }
    ];
  }

  saveTeams() {
    try {
      localStorage.setItem('games_night_teams', JSON.stringify(this.teams));
    } catch (e) {
      console.warn('Failed to save teams to localStorage');
    }
  }

  bindEvents() {
    // Navigation Tabs
    this.dom.tabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        this.switchTab(target);
      });
    });

    // Stage Next / Prev
    this.dom.btnPrevQ?.addEventListener('click', () => this.prevQuestion());
    this.dom.btnNextQ?.addEventListener('click', () => this.nextQuestion());

    // Reveal Answer
    this.dom.btnRevealAnswer?.addEventListener('click', () => this.toggleRevealCurrentQuestion());

    // Grid View Toggles (if present)
    this.dom.btnToggleGrid?.addEventListener('click', () => this.toggleGridView());
    this.dom.btnGridBackToSingle?.addEventListener('click', () => this.toggleGridView(false));
    this.dom.btnGridToggleAnswers?.addEventListener('click', () => {
      this.showAnswersInGrid = !this.showAnswersInGrid;
      if (this.dom.btnGridToggleAnswers) {
        this.dom.btnGridToggleAnswers.textContent = this.showAnswersInGrid ? 'Hide Answers' : 'Show Answer Keys';
      }
      this.renderAllQuestionsGrid();
    });

    // Audio Mute Toggle
    this.dom.btnMute?.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      if (this.dom.btnMute) {
        this.dom.btnMute.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound FX';
      }
    });

    // Fullscreen Toggle
    this.dom.btnFullscreen?.addEventListener('click', () => this.toggleFullscreen());

    // Scores Modal
    this.dom.btnScoresModal?.addEventListener('click', () => {
      this.renderTeamsTable();
      this.dom.scoresModal?.classList.add('active');
    });
    this.dom.btnCloseScores?.addEventListener('click', () => this.dom.scoresModal?.classList.remove('active'));
    this.dom.btnAddTeam?.addEventListener('click', () => this.addNewTeam());

    // Answer Key Modal
    this.dom.btnAnswerKeyModal?.addEventListener('click', () => {
      this.renderAnswerKeyModal();
      this.dom.answerKeyModal?.classList.add('active');
    });
    this.dom.btnCloseAnswerKey?.addEventListener('click', () => this.dom.answerKeyModal?.classList.remove('active'));

    // Speech Pronunciation button on Stage
    this.dom.btnSpeakStage?.addEventListener('click', () => this.speakCurrentQuestion());

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        this.nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        this.prevQuestion();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggleRevealCurrentQuestion();
      } else if (e.key.toLowerCase() === 'g') {
        this.toggleGridView();
      } else if (e.key.toLowerCase() === 'f') {
        this.toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        const isMuted = this.sound.toggleMute();
        if (this.dom.btnMute) {
          this.dom.btnMute.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound FX';
        }
      } else if (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'l') {
        this.speakCurrentQuestion();
      } else if (e.key >= '1' && e.key <= '8') {
        const qNum = parseInt(e.key, 10) - 1;
        this.goToQuestion(qNum);
      } else if (e.key === 'Escape') {
        this.dom.scoresModal?.classList.remove('active');
        this.dom.answerKeyModal?.classList.remove('active');
        this.closeWinnerModal();
      }
    });

    // Modal background click to close
    [this.dom.scoresModal, this.dom.answerKeyModal, this.dom.winnerModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          if (modal === this.dom.winnerModal) {
            this.closeWinnerModal();
          }
        }
      });
    });

    // Treasure chest winner reveal click
    this.dom.btnTreasureChest?.addEventListener('click', () => this.revealWinner());
    this.dom.btnCloseWinner?.addEventListener('click', () => this.closeWinnerModal());
    this.dom.btnWinnerScoreboard?.addEventListener('click', () => {
      this.closeWinnerModal();
      this.renderTeamsTable();
      this.dom.scoresModal?.classList.add('active');
    });
    this.dom.btnWinnerConfettiReplay?.addEventListener('click', () => {
      this.sound.playVictoryFanfare();
      this.launchConfetti();
    });

    // Shortcut button on Duolingo unit banner to open scoreboard
    this.dom.btnIntroScoresShortcut?.addEventListener('click', () => {
      this.renderTeamsTable();
      this.dom.scoresModal?.classList.add('active');
    });

    // Interactive round showcase buttons on intro screen
    document.querySelectorAll('.btn-launch-round').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetRound = btn.dataset.round;
        this.switchTab(targetRound);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    this.questionIndex = 0;
    this.viewMode = 'single';
    this.showAnswersInGrid = false;
    this.dom.btnGridToggleAnswers.textContent = '👁️ Show Answer Keys';

    this.dom.tabs.forEach(tab => {
      if (tab.dataset.target === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.sound.playTick(false);
    this.renderActiveTab();
  }

  renderActiveTab() {
    // Hide all sections first
    this.dom.introSection.style.display = 'none';
    this.dom.stageSection.style.display = 'none';
    this.dom.allQSection.style.display = 'none';
    this.dom.round3Section.style.display = 'none';
    this.dom.round4Section.style.display = 'none';

    if (this.currentTab === 'intro') {
      this.dom.introSection.style.display = 'flex';
    } else if (this.currentTab === 'round-1' || this.currentTab === 'round-2') {
      if (this.viewMode === 'grid') {
        this.dom.allQSection.style.display = 'flex';
        this.renderAllQuestionsGrid();
      } else {
        this.dom.stageSection.style.display = 'flex';
        this.renderQuestionStage();
      }
    } else if (this.currentTab === 'round-3') {
      this.dom.round3Section.style.display = 'flex';
    } else if (this.currentTab === 'round-4') {
      this.dom.round4Section.style.display = 'flex';
    }
  }

  getCurrentQuestionsList() {
    return QUIZ_QUESTIONS[this.currentTab] || [];
  }

  getCurrentQuestion() {
    const list = this.getCurrentQuestionsList();
    return list[this.questionIndex] || null;
  }

  renderQuestionStage() {
    const questions = this.getCurrentQuestionsList();
    if (!questions || questions.length === 0) return;

    const q = questions[this.questionIndex];
    const qKey = `${this.currentTab}-${q.id}`;
    const isRevealed = this.revealedQuestions.has(qKey);

    // Flag & Language Badge
    this.dom.stageFlag.textContent = q.flag;
    this.dom.stageLangName.textContent = q.language;
    this.dom.stageQNumberPill.textContent = `Question ${q.number} of ${questions.length}`;

    // Foreign Text & Pronunciation
    this.dom.promptForeignText.textContent = q.word || q.phrase;
    this.dom.promptPronunciation.textContent = q.pronunciation;

    // Render Navigation Pills (1 to 8)
    this.dom.navPillsContainer.innerHTML = '';
    questions.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = `q-nav-btn ${idx === this.questionIndex ? 'active' : ''}`;
      const itemKey = `${this.currentTab}-${item.id}`;
      if (this.revealedQuestions.has(itemKey)) {
        btn.classList.add('revealed');
      }
      btn.textContent = item.number;
      btn.title = `Go to Question ${item.number} (${item.language})`;
      btn.addEventListener('click', () => this.goToQuestion(idx));
      this.dom.navPillsContainer.appendChild(btn);
    });

    // Render Dynamic Question Content based on Round
    this.dom.stageDynamicContent.innerHTML = '';

    if (this.currentTab === 'round-1') {
      // Context Sentence
      const sentenceEl = document.createElement('div');
      sentenceEl.className = 'context-sentence-box';

      // Highlight word in sentence
      let sentenceHtml = q.sentence;
      const cleanWord = q.word.split(' ')[0].replace(/[()]/g, '');
      const regex = new RegExp(`(${cleanWord})`, 'gi');
      sentenceHtml = sentenceHtml.replace(regex, '<mark>$1</mark>');

      sentenceEl.innerHTML = `
        <div class="context-sentence-label">Sentence Context</div>
        <div class="context-sentence-text">"${sentenceHtml}"</div>
      `;
      this.dom.stageDynamicContent.appendChild(sentenceEl);

      // Options Grid
      const optionsGrid = document.createElement('div');
      optionsGrid.className = 'options-grid';

      q.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        if (isRevealed) {
          if (opt.isCorrect) {
            card.classList.add('correct-revealed');
          } else {
            card.classList.add('incorrect-dimmed');
          }
        }

        card.innerHTML = `
          <div class="option-key">${opt.key}</div>
          <div class="option-text">${opt.text}</div>
        `;

        optionsGrid.appendChild(card);
      });

      this.dom.stageDynamicContent.appendChild(optionsGrid);

      // If revealed, show the Fun Fact / Innuendo explanation
      if (isRevealed) {
        const factBox = document.createElement('div');
        factBox.className = 'actual-meaning-revealed';
        factBox.innerHTML = `
          <div class="actual-meaning-title">CORRECT ANSWER</div>
          <div class="actual-answer-text">${q.options.find(o => o.isCorrect)?.key}) ${q.meaning}</div>
          <div class="actual-meaning-explanation">${q.funFact}</div>
        `;
        this.dom.stageDynamicContent.appendChild(factBox);
      }

    } else if (this.currentTab === 'round-2') {
      // Literal Meaning Box
      const literalBox = document.createElement('div');
      literalBox.className = 'literal-meaning-box';
      literalBox.innerHTML = `
        <div class="literal-label">
          <span>Literal Translation</span>
        </div>
        <div class="literal-text">"${q.literalMeaning}"</div>
      `;
      this.dom.stageDynamicContent.appendChild(literalBox);

      // If revealed, show the Actual Meaning with animation
      if (isRevealed) {
        const revealedBox = document.createElement('div');
        revealedBox.className = 'actual-meaning-revealed';
        revealedBox.innerHTML = `
          <div class="actual-meaning-title">True Meaning</div>
          <div class="actual-answer-text">"${q.actualMeaning}"</div>
          <div class="actual-meaning-explanation">${q.explanation}</div>
        `;
        this.dom.stageDynamicContent.appendChild(revealedBox);
      }
    }

    // Update Reveal Button UI
    if (isRevealed) {
      this.dom.btnRevealAnswer.innerHTML = `<span>Hide Answer</span>`;
      this.dom.btnRevealAnswer.classList.add('is-revealed');
    } else {
      this.dom.btnRevealAnswer.innerHTML = `<span>Reveal Answer</span>`;
      this.dom.btnRevealAnswer.classList.remove('is-revealed');
    }

    // Update Prev / Next button states
    this.dom.btnPrevQ.disabled = this.questionIndex === 0;
    this.dom.btnNextQ.disabled = this.questionIndex === questions.length - 1;
  }

  toggleRevealCurrentQuestion() {
    const q = this.getCurrentQuestion();
    if (!q) return;
    const qKey = `${this.currentTab}-${q.id}`;

    if (this.revealedQuestions.has(qKey)) {
      this.revealedQuestions.delete(qKey);
      this.sound.playTick(false);
    } else {
      this.revealedQuestions.add(qKey);
      this.sound.playCorrect();
    }
    this.renderQuestionStage();
  }

  nextQuestion() {
    const questions = this.getCurrentQuestionsList();
    if (this.questionIndex < questions.length - 1) {
      this.questionIndex++;
      this.sound.playTick(false);
      this.renderQuestionStage();
    }
  }

  prevQuestion() {
    if (this.questionIndex > 0) {
      this.questionIndex--;
      this.sound.playTick(false);
      this.renderQuestionStage();
    }
  }

  goToQuestion(index) {
    const questions = this.getCurrentQuestionsList();
    if (index >= 0 && index < questions.length) {
      this.questionIndex = index;
      this.sound.playTick(false);
      this.renderQuestionStage();
    }
  }

  toggleGridView(forceGrid = null) {
    if (forceGrid !== null) {
      this.viewMode = forceGrid ? 'grid' : 'single';
    } else {
      this.viewMode = this.viewMode === 'single' ? 'grid' : 'single';
    }
    this.renderActiveTab();
  }

  cleanSpeechText(rawText) {
    if (!rawText) return '';
    // Strip parenthetical English transliterations e.g. "좆 좀 드세요 (Joj jom deuseyo)" -> "좆 좀 드세요"
    return rawText.replace(/\s*\([a-zA-Z0-9\s\-',.]+\)/g, '').trim();
  }

  getBestVoice(targetLocale) {
    if (!('speechSynthesis' in window)) return null;
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }
    if (!voices || voices.length === 0) return null;

    const targetLang = targetLocale.toLowerCase().replace('_', '-');
    const langPrefix = targetLang.split('-')[0];

    // Filter voices matching exact locale or language prefix
    const matchingVoices = voices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang === targetLang || vLang.startsWith(langPrefix);
    });

    if (matchingVoices.length === 0) return null;

    // Score voices: prioritize Google, Enhanced, Premium, Natural, exact locale; deprioritize robotic Compact voices
    matchingVoices.sort((a, b) => {
      const scoreVoice = (v) => {
        let score = 0;
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        if (vLang === targetLang) score += 10;
        const name = (v.name || '').toLowerCase();
        if (name.includes('google')) score += 25;
        if (name.includes('enhanced') || name.includes('premium') || name.includes('natural') || name.includes('siri')) score += 20;
        if (name.includes('compact')) score -= 15;
        if (v.default) score += 2;
        return score;
      };
      return scoreVoice(b) - scoreVoice(a);
    });

    return matchingVoices[0];
  }

  speakWithSpeechSynthesis(rawText, language, buttonEl = null) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    const textToSpeak = this.cleanSpeechText(rawText);
    if (!textToSpeak) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel(); // Stop previous utterance immediately

    const targetLocale = LANG_SPEECH_CODES[language] || 'en-US';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLocale;
    utterance.rate = 0.95;

    // Retain a persistent reference to prevent Chrome garbage collection of active utterance
    this.activeUtterance = utterance;
    window._quizActiveUtterance = utterance;

    const clearButton = () => {
      if (buttonEl) buttonEl.classList.remove('playing');
      if (this.activeUtterance === utterance) {
        this.activeUtterance = null;
        window._quizActiveUtterance = null;
      }
    };

    if (buttonEl) {
      buttonEl.classList.add('playing');
    }

    utterance.onend = clearButton;
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      clearButton();
    };

    // Select the best quality voice (Google/Enhanced/Natural/System)
    const bestVoice = this.getBestVoice(targetLocale);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Defer speak slightly to allow browser audio engine to cleanly process cancel()
    setTimeout(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    }, 20);
  }

  speakWord(rawText, language, buttonEl = null, audioUrl = null) {
    if (audioUrl) {
      if (buttonEl) buttonEl.classList.add('playing');
      const audio = new Audio(audioUrl);
      const resetBtn = () => { if (buttonEl) buttonEl.classList.remove('playing'); };
      audio.onended = resetBtn;
      audio.onerror = () => {
        resetBtn();
        this.speakWithSpeechSynthesis(rawText, language, buttonEl);
      };
      audio.play().catch(() => {
        resetBtn();
        this.speakWithSpeechSynthesis(rawText, language, buttonEl);
      });
      return;
    }

    this.speakWithSpeechSynthesis(rawText, language, buttonEl);
  }

  speakCurrentQuestion() {
    const q = this.getCurrentQuestion();
    if (!q) return;
    const text = q.word || q.phrase;
    this.speakWord(text, q.language, this.dom.btnSpeakStage, q.audioUrl || q.audio);
  }

  renderAllQuestionsGrid() {
    const questions = this.getCurrentQuestionsList();
    this.dom.allQGridTitle.textContent = `${this.currentTab === 'round-1' ? '🔞 Round 1: Innuendo Lingo' : '🤪 Round 2: Phunny Phrases'} — All 8 Questions Overview`;
    this.dom.allQGridContainer.innerHTML = '';

    questions.forEach(q => {
      const card = document.createElement('div');
      card.className = 'all-q-card';
      const wordText = q.word || q.phrase;

      if (this.currentTab === 'round-1') {
        const correctOpt = q.options.find(o => o.isCorrect);
        let optionsHtml = '';
        q.options.forEach(o => {
          const isCorrect = this.showAnswersInGrid && o.isCorrect;
          optionsHtml += `
            <div class="all-q-opt-item ${isCorrect ? 'correct' : ''}">
              <strong>${o.key})</strong> ${o.text} ${isCorrect ? '✓' : ''}
            </div>
          `;
        });

        card.innerHTML = `
          <div class="all-q-top">
            <span>${q.flag} ${q.language}</span>
            <span class="round-number-pill">Q#${q.number}</span>
          </div>
          <div class="all-q-word">
            <span>${q.word}</span>
            <button class="btn-speak-inline" data-lang="${q.language}" data-text="${q.word}" title="Pronounce (Web Speech)">🔊</button>
          </div>
          <div style="font-size: 0.85rem; color: #93c5fd;">${q.pronunciation}</div>
          <div style="font-size: 0.9rem; color: #fde68a; font-style: italic;">"${q.sentence}"</div>
          <div class="all-q-options">${optionsHtml}</div>
          ${this.showAnswersInGrid ? `<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.4rem;">${q.funFact}</div>` : ''}
        `;
      } else {
        card.innerHTML = `
          <div class="all-q-top">
            <span>${q.flag} ${q.language}</span>
            <span class="round-number-pill">Q#${q.number}</span>
          </div>
          <div class="all-q-word">
            <span>${q.phrase}</span>
            <button class="btn-speak-inline" data-lang="${q.language}" data-text="${q.phrase}" title="Pronounce (Web Speech)">🔊</button>
          </div>
          <div style="font-size: 0.85rem; color: #93c5fd;">${q.pronunciation}</div>
          <div style="background: rgba(16, 185, 129, 0.1); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.9rem;">
            <strong style="color: #34d399;">Literal:</strong> "${q.literalMeaning}"
          </div>
          ${this.showAnswersInGrid ? `
            <div style="background: rgba(59, 130, 246, 0.15); padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.95rem; border: 1px solid #3b82f6;">
              <strong style="color: #60a5fa;">Actual Meaning:</strong> "${q.actualMeaning}"
              <p style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.25rem;">${q.explanation}</p>
            </div>
          ` : `
            <div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
              ✍️ Write the real meaning on your sheet
            </div>
          `}
        `;
      }

      // Bind speak button inside this card
      const speakBtn = card.querySelector('.btn-speak-inline');
      if (speakBtn) {
        speakBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lang = speakBtn.dataset.lang;
          const text = speakBtn.dataset.text;
          this.speakWord(text, lang, speakBtn, q.audioUrl || q.audio);
        });
      }

      this.dom.allQGridContainer.appendChild(card);
    });
  }

  renderTeamsTable() {
    this.dom.teamsTableBody.innerHTML = '';

    this.teams.forEach((team, index) => {
      const total = (Number(team.r1) || 0) + (Number(team.r2) || 0) + (Number(team.r3) || 0) + (Number(team.r4) || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted);">#${index + 1}</td>
        <td>
          <input type="text" class="team-score-input" style="width: 140px; text-align: left;" value="${team.name}" data-field="name" data-index="${index}">
        </td>
        <td>
          <input type="text" class="team-score-input" style="width: 130px; text-align: left;" value="${team.player1}" data-field="player1" data-index="${index}"> & 
          <input type="text" class="team-score-input" style="width: 130px; text-align: left;" value="${team.player2}" data-field="player2" data-index="${index}">
        </td>
        <td><input type="number" min="0" max="8" class="team-score-input" value="${team.r1 || 0}" data-field="r1" data-index="${index}"></td>
        <td><input type="number" min="0" max="8" class="team-score-input" value="${team.r2 || 0}" data-field="r2" data-index="${index}"></td>
        <td><input type="number" min="0" max="6" class="team-score-input" value="${team.r3 || 0}" data-field="r3" data-index="${index}"></td>
        <td><input type="number" min="0" max="100" class="team-score-input" value="${team.r4 || 0}" data-field="r4" data-index="${index}"></td>
        <td style="font-size: 1rem; font-weight: 500; color: var(--color-info);">${total}</td>
        <td>
          <button class="btn btn-glass btn-delete-team" data-index="${index}" style="padding: 0.25rem 0.5rem; color: #f87171;" title="Delete Team">✕</button>
        </td>
      `;
      this.dom.teamsTableBody.appendChild(tr);
    });

    // Bind inputs
    this.dom.teamsTableBody.querySelectorAll('.team-score-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const field = e.target.dataset.field;
        this.teams[idx][field] = e.target.value;
        this.saveTeams();
        this.renderTeamsTable();
      });
    });

    // Bind delete buttons
    this.dom.teamsTableBody.querySelectorAll('.btn-delete-team').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        this.teams.splice(idx, 1);
        this.saveTeams();
        this.renderTeamsTable();
      });
    });
  }

  addNewTeam() {
    const num = this.teams.length + 1;
    this.teams.push({
      id: Date.now(),
      name: `Team ${num}`,
      player1: `Player ${num * 2 - 1}`,
      player2: `Player ${num * 2}`,
      r1: 0,
      r2: 0,
      r3: 0,
      r4: 0
    });
    this.saveTeams();
    this.renderTeamsTable();
  }

  renderAnswerKeyModal() {
    let html = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 0.75rem; font-size: 1.15rem;">🔞 Round 1: Innuendo Lingo — Master Answers</h4>
          <div class="answer-key-row header">
            <span>#</span>
            <span>Language</span>
            <span>Foreign Word & Context</span>
            <span>Correct Answer</span>
            <span style="display: block;">(Meaning)</span>
          </div>
    `;

    QUIZ_QUESTIONS['round-1'].forEach(q => {
      const correctOpt = q.options.find(o => o.isCorrect);
      html += `
        <div class="answer-key-row">
          <strong>${q.number}</strong>
          <span>${q.flag} ${q.language}</span>
          <div>
            <strong>${q.word}</strong> <span style="color: var(--color-info); font-size:0.85rem;">(${q.pronunciation})</span>
            <div style="color: var(--text-muted); font-size:0.85rem; font-style:italic;">"${q.sentence}"</div>
          </div>
          <div style="color: var(--color-green); font-weight:700;">
            ${correctOpt.key}) ${correctOpt.text}
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div>
          <h4 style="color: var(--text-primary); margin-bottom: 0.75rem; font-size: 1.15rem;">🤪 Round 2: Phunny Phrases — Master Answers</h4>
          <div class="answer-key-row header">
            <span>#</span>
            <span>Language</span>
            <span>Phrase & Literal Meaning</span>
            <span>Actual Idiomatic Meaning</span>
          </div>
    `;

    QUIZ_QUESTIONS['round-2'].forEach(q => {
      html += `
        <div class="answer-key-row">
          <strong>${q.number}</strong>
          <span>${q.flag} ${q.language}</span>
          <div>
            <strong>${q.phrase}</strong>
            <div style="color: var(--text-muted); font-size:0.85rem;">Literal: "${q.literalMeaning}"</div>
          </div>
          <div style="color: var(--color-info); font-weight:700;">
            "${q.actualMeaning}"
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.dom.answerKeyContent.innerHTML = html;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
      this.dom.btnFullscreen.textContent = '🗗 Exit Fullscreen';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.dom.btnFullscreen.textContent = '⛶ Fullscreen';
      }
    }
  }

  /* --------------------------------------------------------------------------
     Duolingo Winner Reveal & Confetti Engine
     -------------------------------------------------------------------------- */
  calculateStandings() {
    // Reload fresh data from localStorage
    this.teams = this.loadTeams();

    const standings = this.teams.map(team => {
      const r1 = Number(team.r1) || 0;
      const r2 = Number(team.r2) || 0;
      const r3 = Number(team.r3) || 0;
      const r4 = Number(team.r4) || 0;
      const total = r1 + r2 + r3 + r4;
      return {
        ...team,
        r1,
        r2,
        r3,
        r4,
        total
      };
    });

    // Sort descending by total score
    standings.sort((a, b) => b.total - a.total);
    return standings;
  }

  revealWinner() {
    const standings = this.calculateStandings();

    // Sound fanfare
    this.sound.playVictoryFanfare();

    if (!standings || standings.length === 0) {
      this.dom.winnerModalContent.innerHTML = `
        <div class="duo-winner-champion-card">
          <div class="champion-team-name">No Teams Registered</div>
          <p class="champion-players">Add teams and enter scores via the Team Scoreboard first!</p>
        </div>
      `;
    } else {
      const topScore = standings[0].total;
      const winners = standings.filter(t => t.total === topScore && topScore > 0);
      const isTie = winners.length > 1;

      let html = '';

      if (topScore === 0) {
        // All scores are 0
        html += `
          <div class="duo-winner-champion-card">
            <div class="champion-rank-pill">Scores Pending</div>
            <div class="champion-team-name">Ready for the Grand Finale?</div>
            <p class="champion-players">Scores are currently at 0. Enter points in the Scoreboard to announce the official champion!</p>
            <div class="champion-score-banner">Total: 0 pts</div>
          </div>
        `;
      } else if (isTie) {
        // Tie for 1st place
        const winnerNames = winners.map(w => w.name).join(' & ');
        const allPlayers = winners.map(w => `${w.player1} & ${w.player2}`).join(' vs ');
        html += `
          <div class="duo-winner-champion-card">
            <div class="champion-rank-pill">🤝 TIE FOR 1ST PLACE!</div>
            <div class="champion-team-name">${winnerNames}</div>
            <div class="champion-players">Co-Champions: ${allPlayers}</div>
            <div class="champion-score-banner">🏆 Tied at ${topScore} Points!</div>
          </div>
        `;
      } else {
        // Single Winner
        const champ = winners[0];
        html += `
          <div class="duo-winner-champion-card">
            <div class="champion-rank-pill">🥇 1ST PLACE </div>
            <div class="champion-team-name">${champ.name}</div>
            <div class="champion-players">${champ.player1} & ${champ.player2}</div>
            <div class="champion-score-banner"> ${champ.total} Points!</div>
            <div style="font-size: 0.82rem; color: #78350f; margin-top: 0.35rem; font-weight: 700;">
              R1: ${champ.r1} • R2: ${champ.r2} • R3: ${champ.r3} • R4: ${champ.r4}
            </div>
          </div>
        `;
      }

      // Standings leaderboard list for all teams
      html += `
        <div style="text-align: left; margin-top: 0.5rem;">
          <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 0.4rem; letter-spacing: 0.06em;">
            Tournament Leaderboard
          </div>
          <div class="duo-winner-standings">
      `;

      standings.forEach((team, idx) => {
        const rankIcon = idx === 0 && team.total > 0 ? '🥇' : (idx === 1 && team.total > 0 ? '🥈' : (idx === 2 && team.total > 0 ? '🥉' : `#${idx + 1}`));
        html += `
          <div class="duo-standing-row">
            <div class="duo-standing-left">
              <span class="duo-standing-rank">${rankIcon}</span>
              <div>
                <span class="duo-standing-name">${team.name}</span>
                <span style="font-size: 0.76rem; color: #64748b; margin-left: 0.35rem;">(${team.player1} & ${team.player2})</span>
              </div>
            </div>
            <div class="duo-standing-score">${team.total} pts</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;

      this.dom.winnerModalContent.innerHTML = html;
    }

    // Show modal & trigger confetti
    this.dom.winnerModal.classList.add('active');
    this.launchConfetti();
  }

  closeWinnerModal() {
    this.dom.winnerModal.classList.remove('active');
    if (this.confettiAnimationId) {
      cancelAnimationFrame(this.confettiAnimationId);
      this.confettiAnimationId = null;
    }
    const canvas = this.dom.confettiCanvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  launchConfetti() {
    const canvas = this.dom.confettiCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cancel existing animation loop if running
    if (this.confettiAnimationId) {
      cancelAnimationFrame(this.confettiAnimationId);
    }

    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#58CC02', // Duolingo green
      '#1cb0f6', // Duolingo blue
      '#ff9600', // Duolingo orange
      '#ff4b4b', // Duolingo red
      '#ffd900', // Gold yellow
      '#a855f7', // Purple
      '#ec4899', // Pink
      '#10b981'  // Emerald
    ];

    const particleCount = 160;
    this.confettiParticles = [];

    for (let i = 0; i < particleCount; i++) {
      this.confettiParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.4),
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 80,
        w: Math.random() * 12 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() * -18) - 4,
        gravity: 0.45 + Math.random() * 0.25,
        drag: 0.96,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        opacity: 1,
        fadeSpeed: 0.003 + Math.random() * 0.004,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      for (let i = 0; i < this.confettiParticles.length; i++) {
        const p = this.confettiParticles[i];

        if (p.opacity <= 0 || p.y > canvas.height + 40) continue;

        activeParticles++;

        // Update physics
        p.vx *= p.drag;
        p.vy = (p.vy * p.drag) + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.fadeSpeed;

        // Render particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      if (activeParticles > 0) {
        this.confettiAnimationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.confettiAnimationId = null;
      }
    };

    this.confettiAnimationId = requestAnimationFrame(render);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
