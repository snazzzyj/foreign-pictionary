import { WORD_BANKS } from '../src/data/words.js';
import { DeckManager } from '../src/js/deck.js';
import { GameTimer } from '../src/js/timer.js';

function runTests() {
  console.log('--- TEST 1: Word Bank Counts ---');
  ['swedish', 'mandarin', 'indonesian'].forEach(lang => {
    const bank = WORD_BANKS[lang];
    if (!bank) throw new Error(`Missing bank: ${lang}`);
    if (bank.words.length !== 100) throw new Error(`${lang} words length is ${bank.words.length}, expected 100`);
    console.log(`✓ ${lang} has exactly 100 words`);
  });

  console.log('\n--- TEST 2: Deck Non-Repeating Draws ---');
  const deck = new DeckManager();
  ['swedish', 'mandarin', 'indonesian'].forEach(lang => {
    deck.setLanguage(lang);
    const seenIds = new Set();
    for (let i = 0; i < 100; i++) {
      const card = deck.drawCard();
      if (!card) throw new Error(`Draw ${i+1} returned null for ${lang}`);
      if (seenIds.has(card.id)) throw new Error(`Duplicate card ID ${card.id} drawn in ${lang}`);
      seenIds.add(card.id);
    }
    const emptyDraw = deck.drawCard();
    if (emptyDraw !== null) throw new Error(`Expected null after 100 draws, got card`);
    const stats = deck.getStats(lang);
    if (stats.remaining !== 0 || stats.used !== 100) throw new Error(`Stats mismatch: ${JSON.stringify(stats)}`);
    console.log(`✓ ${lang} drew 100 unique random cards without repetition`);
  });

  console.log('\n--- TEST 3: Deck Reshuffle ---');
  deck.setLanguage('swedish');
  deck.resetLanguageDeck('swedish');
  const cardAfterReset = deck.drawCard();
  if (!cardAfterReset) throw new Error('Failed to draw card after deck reset');
  console.log(`✓ Reset deck successful, drew: "${cardAfterReset.english}" (#${cardAfterReset.id})`);

  console.log('\n--- TEST 4: Timer Methods ---');
  const timer = new GameTimer(60);
  const state = timer.getState();
  if (state.timeLeft !== 60 || state.isRunning !== false) throw new Error(`Timer initial state error: ${JSON.stringify(state)}`);
  console.log('✓ Timer initialized to 60s idle state');

  console.log('\n🎉 ALL AUTOMATED UNIT TESTS PASSED!');
}

runTests();
