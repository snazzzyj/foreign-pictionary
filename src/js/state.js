/**
 * Central State Store for Foreigner Pictionary.
 */

import { DeckManager } from './deck.js';
import { GameTimer } from './timer.js';
import { GameSync, SyncMessageTypes } from './sync.js';
import { SoundFX } from './sound.js';
import { WORD_BANKS } from '../data/words.js';

export class GameState {
  constructor(isHost = true) {
    this.isHost = isHost;
    this.deck = new DeckManager();
    this.timer = new GameTimer(60);
    this.sync = new GameSync(isHost);
    this.sound = new SoundFX();

    this.state = {
      language: 'swedish',
      round: 1,
      roundScore: 0,
      totalScore: 0,
      status: 'ready', // 'ready' | 'running' | 'paused' | 'ended'
      drawerPair: 'Pair 1',
      guesserPair: 'Pair 1',
      roundHistory: []
    };

    this.listeners = [];
    this.initSyncHandlers();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getPublicState()));
  }

  getPublicState() {
    return {
      ...this.state,
      languageInfo: WORD_BANKS[this.state.language],
      timer: this.timer.getState(),
      stats: this.deck.getStats(this.state.language)
    };
  }

  initSyncHandlers() {
    if (this.isHost) {
      // Host listens for connection requests from Display
      this.sync.on(SyncMessageTypes.REQUEST_SYNC, () => {
        this.broadcastFullState();
      });

      // Connect timer events to sync
      this.timer.on('tick', ({ timeLeft, fraction }) => {
        this.sync.broadcast(SyncMessageTypes.TIMER_TICK, { timeLeft, fraction });
        if (timeLeft <= 5 && timeLeft > 0) {
          this.sound.playTick(true);
        } else if (timeLeft <= 10 && timeLeft > 5) {
          this.sound.playTick(false);
        }
      });

      this.timer.on('start', ({ timeLeft }) => {
        this.state.status = 'running';
        this.sync.broadcast(SyncMessageTypes.TIMER_START, { timeLeft });
        this.notify();
      });

      this.timer.on('pause', ({ timeLeft }) => {
        this.state.status = 'paused';
        this.sync.broadcast(SyncMessageTypes.TIMER_PAUSE, { timeLeft });
        this.notify();
      });

      this.timer.on('reset', ({ timeLeft }) => {
        this.state.status = 'ready';
        this.sync.broadcast(SyncMessageTypes.TIMER_RESET, { timeLeft });
        this.notify();
      });

      this.timer.on('complete', () => {
        this.state.status = 'ended';
        this.sound.playTimeUp();
        this.broadcastFullState();
        this.notify();
      });
    } else {
      // Crowd Display View sync handlers
      this.sync.on(SyncMessageTypes.STATE_SYNC, (data) => {
        this.state = { ...this.state, ...data.state };
        this.notify();
      });

      this.sync.on(SyncMessageTypes.TIMER_TICK, (payload) => {
        this.notify();
      });

      this.sync.on(SyncMessageTypes.TIMER_START, () => {
        this.state.status = 'running';
        this.notify();
      });

      this.sync.on(SyncMessageTypes.TIMER_PAUSE, () => {
        this.state.status = 'paused';
        this.notify();
      });

      this.sync.on(SyncMessageTypes.TIMER_RESET, () => {
        this.state.status = 'ready';
        this.notify();
      });

      this.sync.on(SyncMessageTypes.POINT_SCORED, (payload) => {
        this.state.roundScore = payload.roundScore;
        this.state.totalScore = payload.totalScore;
        this.sound.playCorrect();
        this.notify();
      });

      this.sync.on(SyncMessageTypes.ROUND_CHANGED, (payload) => {
        this.state.round = payload.round;
        this.state.language = payload.language;
        this.state.roundScore = 0;
        this.notify();
      });

      this.sync.on(SyncMessageTypes.LANGUAGE_CHANGED, (payload) => {
        this.state.language = payload.language;
        this.notify();
      });
    }
  }

  broadcastFullState() {
    this.sync.broadcast(SyncMessageTypes.STATE_SYNC, {
      state: this.state,
      timer: this.timer.getState(),
      stats: this.deck.getStats(this.state.language)
    });
  }

  // Host Action Methods
  setLanguage(langKey) {
    if (this.deck.setLanguage(langKey)) {
      this.state.language = langKey;
      this.deck.drawCard();
      this.sync.broadcast(SyncMessageTypes.LANGUAGE_CHANGED, { language: langKey });
      this.broadcastFullState();
      this.notify();
    }
  }

  setRound(roundNum) {
    this.state.round = Math.max(1, Math.min(12, roundNum));
    // Determine language based on 4-round block if desired:
    // Block 1 (Rounds 1-4): Swedish
    // Block 2 (Rounds 5-8): Mandarin
    // Block 3 (Rounds 9-12): Indonesian
    if (this.state.round <= 4) {
      this.state.language = 'swedish';
    } else if (this.state.round <= 8) {
      this.state.language = 'mandarin';
    } else {
      this.state.language = 'indonesian';
    }
    this.deck.setLanguage(this.state.language);
    this.state.roundScore = 0;
    this.timer.reset();
    this.deck.drawCard();
    this.sync.broadcast(SyncMessageTypes.ROUND_CHANGED, {
      round: this.state.round,
      language: this.state.language
    });
    this.broadcastFullState();
    this.notify();
  }

  nextRound() {
    this.setRound(this.state.round + 1);
  }

  prevRound() {
    this.setRound(this.state.round - 1);
  }

  scorePoint() {
    this.state.roundScore += 1;
    this.state.totalScore += 1;
    this.sound.playCorrect();
    this.sync.broadcast(SyncMessageTypes.POINT_SCORED, {
      roundScore: this.state.roundScore,
      totalScore: this.state.totalScore
    });
    const next = this.deck.drawCard();
    this.broadcastFullState();
    this.notify();
    return next;
  }

  skipCard() {
    this.sound.playSkip();
    this.sync.broadcast(SyncMessageTypes.CARD_SKIPPED, {});
    const next = this.deck.drawCard();
    this.broadcastFullState();
    this.notify();
    return next;
  }

  resetRound() {
    this.state.roundScore = 0;
    this.timer.reset();
    this.deck.drawCard();
    this.broadcastFullState();
    this.notify();
  }
}
