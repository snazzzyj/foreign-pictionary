/**
 * Deck Manager for Foreigner Pictionary.
 * Manages non-repeating random card selection per language session.
 */

import { WORD_BANKS } from '../data/words.js';

export class DeckManager {
  constructor() {
    this.currentLanguage = 'swedish';
    // Map of language key -> Array of available word indices
    this.remainingPool = {};
    // Map of language key -> Array of drawn words in history
    this.drawnHistory = {};
    this.currentCard = null;

    this.initPools();
  }

  initPools() {
    Object.keys(WORD_BANKS).forEach(lang => {
      const total = WORD_BANKS[lang].words.length;
      this.remainingPool[lang] = Array.from({ length: total }, (_, i) => i);
      this.shuffleArray(this.remainingPool[lang]);
      this.drawnHistory[lang] = [];
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  setLanguage(langKey) {
    if (!WORD_BANKS[langKey]) return false;
    this.currentLanguage = langKey;
    if (!this.remainingPool[langKey] || this.remainingPool[langKey].length === 0) {
      this.resetLanguageDeck(langKey);
    }
    return true;
  }

  resetLanguageDeck(langKey = this.currentLanguage) {
    const total = WORD_BANKS[langKey].words.length;
    this.remainingPool[langKey] = Array.from({ length: total }, (_, i) => i);
    this.shuffleArray(this.remainingPool[langKey]);
    this.drawnHistory[langKey] = [];
  }

  drawCard() {
    const pool = this.remainingPool[this.currentLanguage];
    const words = WORD_BANKS[this.currentLanguage].words;

    if (!pool || pool.length === 0) {
      this.currentCard = null;
      return null;
    }

    const wordIndex = pool.pop();
    const wordItem = words[wordIndex];
    this.currentCard = {
      ...wordItem,
      language: this.currentLanguage,
      drawnAt: Date.now()
    };

    this.drawnHistory[this.currentLanguage].push(this.currentCard);
    return this.currentCard;
  }

  getCurrentCard() {
    return this.currentCard;
  }

  getStats(langKey = this.currentLanguage) {
    const total = WORD_BANKS[langKey] ? WORD_BANKS[langKey].words.length : 100;
    const remaining = this.remainingPool[langKey] ? this.remainingPool[langKey].length : 0;
    const used = total - remaining;
    return { total, remaining, used };
  }
}
