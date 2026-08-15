import { GAMES_NIGHT_INFO, QUIZ_QUESTIONS } from '../src/data/quiz-data.js';

function runQuizTests() {
  console.log('=== TEST 1: Games Night Info Structure ===');
  if (!GAMES_NIGHT_INFO.title) throw new Error('Missing title');
  if (GAMES_NIGHT_INFO.rounds.length !== 4) throw new Error(`Expected 4 rounds, found ${GAMES_NIGHT_INFO.rounds.length}`);
  console.log(`✓ 4 rounds metadata verified: ${GAMES_NIGHT_INFO.rounds.map(r => r.name).join(', ')}`);

  console.log('\n=== TEST 2: Round 1 Innuendo Lingo Questions ===');
  const r1 = QUIZ_QUESTIONS['round-1'];
  if (!Array.isArray(r1) || r1.length !== 8) throw new Error(`Expected 8 questions in Round 1, got ${r1?.length}`);
  r1.forEach((q, idx) => {
    if (!q.word || !q.pronunciation || !q.sentence || !q.meaning || !q.flag || !q.language) {
      throw new Error(`Round 1 Question #${idx + 1} is missing required fields`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 3) {
      throw new Error(`Round 1 Question #${idx + 1} does not have exactly 3 options`);
    }
    const correctOptions = q.options.filter(o => o.isCorrect);
    if (correctOptions.length !== 1) {
      throw new Error(`Round 1 Question #${idx + 1} has ${correctOptions.length} correct options (expected 1)`);
    }
    console.log(`✓ Q${q.number} [${q.language} ${q.flag}] "${q.word}" — Options: ${q.options.map(o => o.key).join('/')}, Correct: ${correctOptions[0].key} ("${correctOptions[0].text}")`);
  });

  console.log('\n=== TEST 3: Round 2 Phunny Phrases Questions ===');
  const r2 = QUIZ_QUESTIONS['round-2'];
  if (!Array.isArray(r2) || r2.length !== 8) throw new Error(`Expected 8 questions in Round 2, got ${r2?.length}`);
  r2.forEach((q, idx) => {
    if (!q.phrase || !q.pronunciation || !q.literalMeaning || !q.actualMeaning || !q.flag || !q.language) {
      throw new Error(`Round 2 Question #${idx + 1} is missing required fields`);
    }
    console.log(`✓ Q${q.number} [${q.language} ${q.flag}] "${q.phrase}" — Literal: "${q.literalMeaning}" ➔ Actual: "${q.actualMeaning}"`);
  });

  console.log('\n=== TEST 4: Round 3 and Round 4 Info ===');
  if (!QUIZ_QUESTIONS['round-3'] || QUIZ_QUESTIONS['round-3'].totalRounds !== 6) throw new Error('Round 3 metadata invalid');
  if (!QUIZ_QUESTIONS['round-4'] || QUIZ_QUESTIONS['round-4'].totalRounds !== 12) throw new Error('Round 4 metadata invalid');
  console.log('✓ Round 3 & Round 4 data verified');

  console.log('\n🎉 ALL QUIZ ENGINE DATA TESTS PASSED!');
}

runQuizTests();
