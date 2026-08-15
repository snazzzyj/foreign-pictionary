/**
 * Real-time synchronization layer for multi-screen Foreigner Pictionary.
 * Uses BroadcastChannel API with LocalStorage fallback.
 */

const CHANNEL_NAME = 'foreigner_pictionary_sync';

export const SyncMessageTypes = {
  STATE_SYNC: 'STATE_SYNC',
  TIMER_TICK: 'TIMER_TICK',
  TIMER_START: 'TIMER_START',
  TIMER_PAUSE: 'TIMER_PAUSE',
  TIMER_RESET: 'TIMER_RESET',
  POINT_SCORED: 'POINT_SCORED',
  CARD_SKIPPED: 'CARD_SKIPPED',
  ROUND_CHANGED: 'ROUND_CHANGED',
  LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
  REQUEST_SYNC: 'REQUEST_SYNC'
};

export class GameSync {
  constructor(isHost = false) {
    this.isHost = isHost;
    this.listeners = new Map();
    this.channel = null;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => this.handleMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel failed, falling back to localStorage', e);
      }
    }

    // Fallback or auxiliary window storage listener
    window.addEventListener('storage', (event) => {
      if (event.key === CHANNEL_NAME && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.handleMessage(data);
        } catch (e) {
          // ignore parse errors
        }
      }
    });
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  broadcast(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      sender: this.isHost ? 'host' : 'display'
    };

    if (this.channel) {
      this.channel.postMessage(message);
    }

    // Also update localStorage so other windows receive storage event
    try {
      localStorage.setItem(CHANNEL_NAME, JSON.stringify(message));
    } catch (e) {
      // storage quota or private browsing safety
    }
  }

  handleMessage(message) {
    if (!message || !message.type) return;
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(message.payload, message));
    }
    const allCallbacks = this.listeners.get('*');
    if (allCallbacks) {
      allCallbacks.forEach(cb => cb(message));
    }
  }
}
