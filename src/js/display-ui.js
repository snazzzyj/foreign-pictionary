/**
 * Spectator, Guesser & Crowd Display UI Controller.
 */

import { GameSync, SyncMessageTypes } from './sync.js';
import { WORD_BANKS } from '../data/words.js';

export class DisplayUI {
  constructor() {
    this.sync = new GameSync(false);
    this.totalDuration = 60;
    this.timeLeft = 60;
    this.score = 0;
    this.round = 1;
    this.language = 'swedish';
    this.status = 'ready';

    this.initDOM();
    this.bindSync();
    this.bindKeyboard();

    // Request initial state from host
    this.sync.broadcast(SyncMessageTypes.REQUEST_SYNC, {});
    this.render();
  }

  initDOM() {
    this.elLangBadge = document.getElementById('crowd-lang-badge');
    this.elRoundPill = document.getElementById('crowd-round-pill');
    this.elTimerDigits = document.getElementById('crowd-timer-digits');
    this.elTimerCircle = document.getElementById('timer-circle-progress');
    this.elScoreNumber = document.getElementById('crowd-score-number');
    this.elStatusRibbon = document.getElementById('crowd-status-text');
    this.btnFullscreen = document.getElementById('btn-fullscreen');

    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }
  }

  bindSync() {
    this.sync.on(SyncMessageTypes.STATE_SYNC, (data) => {
      if (!data) return;
      const { state, timer } = data;
      if (state) {
        this.score = state.roundScore || 0;
        this.round = state.round || 1;
        this.language = state.language || 'swedish';
        this.status = state.status || 'ready';
      }
      if (timer) {
        this.timeLeft = timer.timeLeft !== undefined ? timer.timeLeft : 60;
        this.totalDuration = timer.defaultDuration || 60;
      }
      this.render();
    });

    this.sync.on(SyncMessageTypes.TIMER_TICK, (payload) => {
      this.timeLeft = payload.timeLeft;
      this.renderTimer();
    });

    this.sync.on(SyncMessageTypes.TIMER_START, () => {
      this.status = 'running';
      this.renderStatus();
    });

    this.sync.on(SyncMessageTypes.TIMER_PAUSE, () => {
      this.status = 'paused';
      this.renderStatus();
    });

    this.sync.on(SyncMessageTypes.TIMER_RESET, ({ timeLeft }) => {
      this.timeLeft = timeLeft || 60;
      this.status = 'ready';
      this.render();
    });

    this.sync.on(SyncMessageTypes.POINT_SCORED, (payload) => {
      this.score = payload.roundScore;
      this.triggerScoreCelebration();
      this.renderScore();
    });

    this.sync.on(SyncMessageTypes.LANGUAGE_CHANGED, (payload) => {
      this.language = payload.language;
      this.render();
    });

    this.sync.on(SyncMessageTypes.ROUND_CHANGED, (payload) => {
      this.round = payload.round;
      this.language = payload.language;
      this.score = 0;
      this.render();
    });
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen().catch(err => console.log(err));
    }
  }

  triggerScoreCelebration() {
    // Bump animation on score number
    if (this.elScoreNumber) {
      this.elScoreNumber.classList.remove('bump');
      void this.elScoreNumber.offsetWidth; // trigger reflow
      this.elScoreNumber.classList.add('bump');
    }
  }

  renderTimer() {
    if (this.elTimerDigits) {
      this.elTimerDigits.textContent = this.timeLeft;
      
      this.elTimerDigits.classList.toggle('warning', this.timeLeft <= 15 && this.timeLeft > 5);
      this.elTimerDigits.classList.toggle('danger', this.timeLeft <= 5);
    }

    if (this.elTimerCircle) {
      const circumference = 880; // 2 * PI * 140
      const fraction = Math.max(0, Math.min(1, this.timeLeft / this.totalDuration));
      const offset = circumference * (1 - fraction);
      this.elTimerCircle.style.strokeDashoffset = offset;

      this.elTimerCircle.classList.toggle('warning', this.timeLeft <= 15 && this.timeLeft > 5);
      this.elTimerCircle.classList.toggle('danger', this.timeLeft <= 5);
    }

    this.renderStatus();
  }

  renderScore() {
    if (this.elScoreNumber) {
      this.elScoreNumber.textContent = this.score;
    }
  }

  renderStatus() {
    if (!this.elStatusRibbon) return;

    if (this.timeLeft <= 0) {
      this.elStatusRibbon.innerHTML = '<span class="status-dot danger"></span> 🛑 TIME\'S UP! Round Over';
    } else if (this.status === 'running') {
      this.elStatusRibbon.innerHTML = '<span class="status-dot active"></span> ⏱️ Round in Progress — Draw & Guess!';
    } else if (this.status === 'paused') {
      this.elStatusRibbon.innerHTML = '<span class="status-dot"></span> ⏸️ Round Paused';
    } else {
      this.elStatusRibbon.innerHTML = '<span class="status-dot"></span> 🎯 Ready for Round Start';
    }
  }

  render() {
    document.documentElement.setAttribute('data-lang', this.language);

    const langInfo = WORD_BANKS[this.language] || { name: this.language, flag: '🌐' };
    if (this.elLangBadge) {
      this.elLangBadge.innerHTML = `<span>${langInfo.flag}</span> <span>${langInfo.name}</span>`;
    }

    if (this.elRoundPill) {
      this.elRoundPill.textContent = `Round ${this.round} of 12`;
    }

    this.renderTimer();
    this.renderScore();
    this.renderStatus();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.displayApp = new DisplayUI();
});
