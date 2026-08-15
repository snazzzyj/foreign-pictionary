/**
 * Host & Drawer View UI Controller.
 */

import { GameState } from './state.js';
import { WORD_BANKS } from '../data/words.js';

export class HostUI {
  constructor() {
    this.game = new GameState(true);
    this.crowdWindow = null;
    this.initDOM();
    this.bindEvents();
    this.bindKeyboard();

    // Initial card draw & render
    this.game.deck.drawCard();
    this.render();
    this.game.subscribe(() => this.render());
  }

  initDOM() {
    // Top bar & buttons
    this.btnOpenCrowd = document.getElementById('btn-open-crowd');
    this.btnMute = document.getElementById('btn-mute');
    this.btnRules = document.getElementById('btn-rules');
    this.rulesModal = document.getElementById('rules-modal');
    this.btnCloseRules = document.getElementById('btn-close-rules');

    // Language tabs
    this.langTabs = document.querySelectorAll('.lang-tab');

    // Status elements
    this.elRound = document.getElementById('status-round');
    this.elScore = document.getElementById('status-score');
    this.elTimer = document.getElementById('status-timer');
    this.elRemaining = document.getElementById('status-remaining');

    // Card elements
    this.cardContainer = document.getElementById('drawer-card');
    this.cardEmpty = document.getElementById('card-empty');
    this.cardSecretLabel = document.getElementById('card-secret-label');
    this.cardWordIndex = document.getElementById('card-word-index');
    this.cardEnglish = document.getElementById('card-english');
    this.cardForeign = document.getElementById('card-foreign');
    this.cardPronunciation = document.getElementById('card-pronunciation');
    this.btnResetDeck = document.getElementById('btn-reset-deck');

    // Action buttons
    this.btnCorrect = document.getElementById('btn-correct');
    this.btnSkip = document.getElementById('btn-skip');
    this.btnTimerToggle = document.getElementById('btn-timer-toggle');
    this.btnTimerReset = document.getElementById('btn-timer-reset');
    this.btnNextRound = document.getElementById('btn-next-round');
    this.btnPrevRound = document.getElementById('btn-prev-round');
  }

  bindEvents() {
    // Open Crowd Display in new popup window
    this.btnOpenCrowd.addEventListener('click', () => {
      if (this.crowdWindow && !this.crowdWindow.closed) {
        this.crowdWindow.focus();
      } else {
        const width = 1200;
        const height = 800;
        const left = window.screen.availWidth ? window.screen.availWidth / 4 : 100;
        const top = 100;
        this.crowdWindow = window.open(
          'display.html',
          'PictionaryCrowdDisplay',
          `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
      }
    });

    // Mute toggle
    this.btnMute.addEventListener('click', () => {
      const isMuted = this.game.sound.toggleMute();
      this.btnMute.textContent = isMuted ? '🔇 Unmute' : '🔊 Sound FX';
      this.btnMute.classList.toggle('active', isMuted);
    });

    // Rules modal
    this.btnRules.addEventListener('click', () => {
      this.rulesModal.classList.add('active');
    });
    this.btnCloseRules.addEventListener('click', () => {
      this.rulesModal.classList.remove('active');
    });
    this.rulesModal.addEventListener('click', (e) => {
      if (e.target === this.rulesModal) {
        this.rulesModal.classList.remove('active');
      }
    });

    // Language selection
    this.langTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const lang = tab.dataset.lang;
        this.game.setLanguage(lang);
      });
    });

    // Game Actions
    this.btnCorrect.addEventListener('click', () => {
      this.triggerCardFeedback('correct');
      this.game.scorePoint();
    });

    this.btnSkip.addEventListener('click', () => {
      this.triggerCardFeedback('skip');
      this.game.skipCard();
    });

    this.btnTimerToggle.addEventListener('click', () => {
      this.game.timer.toggle();
    });

    this.btnTimerReset.addEventListener('click', () => {
      this.game.timer.reset();
    });

    this.btnNextRound.addEventListener('click', () => {
      this.game.nextRound();
    });

    this.btnPrevRound.addEventListener('click', () => {
      this.game.prevRound();
    });

    this.btnResetDeck.addEventListener('click', () => {
      this.game.deck.resetLanguageDeck();
      this.game.deck.drawCard();
      this.render();
    });
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Avoid shortcuts if typing in input/modal
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        this.triggerCardFeedback('correct');
        this.game.scorePoint();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.triggerCardFeedback('skip');
        this.game.skipCard();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.game.timer.toggle();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.game.timer.reset();
      } else if (e.key === 'Escape') {
        this.rulesModal.classList.remove('active');
      }
    });
  }

  triggerCardFeedback(type) {
    if (!this.cardContainer) return;
    this.cardContainer.classList.remove('enter-anim');
    void this.cardContainer.offsetWidth; // trigger reflow
    this.cardContainer.classList.add('enter-anim');
  }

  render() {
    const state = this.game.getPublicState();
    const currentLang = state.language;

    // Update document theme attribute
    document.documentElement.setAttribute('data-lang', currentLang);

    // Update Language Tabs
    this.langTabs.forEach(tab => {
      const lang = tab.dataset.lang;
      const isActive = lang === currentLang;
      tab.classList.toggle('active', isActive);

      const countBadge = tab.querySelector('.lang-count');
      if (countBadge) {
        const stats = this.game.deck.getStats(lang);
        countBadge.textContent = `${stats.remaining}/${stats.total}`;
      }
    });

    // Update Status Cards
    if (this.elRound) this.elRound.textContent = `Round ${state.round}/12`;
    if (this.elScore) this.elScore.textContent = `${state.roundScore} pts`;
    
    // Update Timer Button & Label
    const timerState = state.timer;
    if (this.elTimer) {
      this.elTimer.textContent = `${timerState.timeLeft}s`;
      this.elTimer.classList.toggle('low-time', timerState.timeLeft <= 10 && timerState.timeLeft > 0);
    }

    if (this.btnTimerToggle) {
      if (timerState.isRunning) {
        this.btnTimerToggle.textContent = '⏸ Pause';
        this.btnTimerToggle.className = 'btn btn-glass';
      } else {
        this.btnTimerToggle.textContent = timerState.timeLeft === 60 ? '▶ Start 60s' : '▶ Resume';
        this.btnTimerToggle.className = 'btn btn-primary';
      }
    }

    // Update Card Contents
    const currentCard = this.game.deck.getCurrentCard();
    if (currentCard) {
      this.cardContainer.style.display = 'flex';
      this.cardEmpty.style.display = 'none';

      this.cardWordIndex.textContent = `Card #${currentCard.id}`;
      this.cardEnglish.textContent = currentCard.english;
      this.cardForeign.textContent = currentCard.foreign;
      this.cardPronunciation.textContent = currentCard.pronunciation ? `"${currentCard.pronunciation}"` : '';
    } else {
      // Deck exhausted
      this.cardContainer.style.display = 'none';
      this.cardEmpty.style.display = 'flex';
    }

    const stats = this.game.deck.getStats(currentLang);
    if (this.elRemaining) {
      this.elRemaining.textContent = `${stats.remaining} left`;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.hostApp = new HostUI();
});
