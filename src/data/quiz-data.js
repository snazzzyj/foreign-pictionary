/**
 * Games Night Quiz Data
 * Contains full question banks, options, meanings, and rules for Games Night rounds.
 */

export const GAMES_NIGHT_INFO = {
  title: "Games Night Championship",
  subtitle: "Foreign Languages, Idioms & Pictionary",
  teamRules: {
    playersPerTeam: 2,
    requirements: "Each team must have 2 players and choose a unique Team Name.",
    scoringMethod: "Players write answers on their provided physical answer sheets."
  },
  rounds: [
    {
      id: "round-1",
      number: 1,
      name: "Innuendo Lingo",
      icon: "🔞",
      tagline: "Innocent foreign words that sound suspiciously dirty in English!",
      type: "multichoice",
      questionCount: 8,
      formatDesc: "3-Option Multiple Choice (Write A, B, or C on your sheet)",
      pointsPerQuestion: 1
    },
    {
      id: "round-2",
      number: 2,
      name: "Phunny Phrases",
      icon: "🤪",
      tagline: "Bizarre idioms from around the world with outrageous literal translations!",
      type: "written-phrase",
      questionCount: 8,
      formatDesc: "Write what the phrase ACTUALLY means (based on the literal clue)",
      pointsPerQuestion: 1
    },
    {
      id: "round-3",
      number: 3,
      name: "Guesstination Unknown",
      icon: "🌍",
      tagline: "Test your geography and mystery destination detective skills!",
      type: "written-country",
      questionCount: 6,
      formatDesc: "Write the Country Name based on clues",
      pointsPerQuestion: 1
    },
    {
      id: "round-4",
      number: 4,
      name: "Foreign Pictionary",
      icon: "🎨",
      tagline: "Fast-paced 60s drawing game across 3 foreign languages!",
      type: "pictionary",
      questionCount: 12,
      formatDesc: "12 Rounds (4x Swedish, 4x Mandarin, 4x Indonesian)",
      pointsPerQuestion: "1 pt per correct word drawn"
    }
  ]
};

export const QUIZ_QUESTIONS = {
  "round-1": [
    {
      id: "r1-q1",
      number: 1,
      language: "Swedish",
      flag: "🇸🇪",
      word: "Böner",
      pronunciation: "buh-ner",
      sentence: "He must remember his böner before bed.",
      meaning: "Prayers",
      options: [
        { key: "A", text: "Prayers", isCorrect: true },
        { key: "B", text: "Green beans", isCorrect: false },
        { key: "C", text: "Bedtime slippers", isCorrect: false }
      ],
      funFact: "In Swedish, 'bönor' means beans and 'böner' means prayers."
    },
    {
      id: "r1-q2",
      number: 2,
      language: "Mandarin",
      flag: "🇨🇳",
      word: "买那个 (Mǎi nà ge)",
      pronunciation: "my-nah-ge",
      sentence: "She shouted to 买那个!",
      meaning: "Buy that one / Buy this one",
      options: [
        { key: "A", text: "Buy that one", isCorrect: true },
        { key: "B", text: "Move faster", isCorrect: false },
        { key: "C", text: "Stop shouting", isCorrect: false }
      ],
      funFact: "In Mandarin, 'nà ge' (那个) literally means 'that one' and is also the universal filler word (like 'um' or 'uh')."
    },
    {
      id: "r1-q3",
      number: 3,
      language: "Japanese",
      flag: "🇯🇵",
      word: "彫り (Hori)",
      pronunciation: "ho-ree",
      sentence: "The 彫り was beautiful.",
      meaning: "Carving / Engraving",
      options: [
        { key: "A", text: "Carving / Engraving", isCorrect: true },
        { key: "B", text: "Geisha dancer", isCorrect: false },
        { key: "C", text: "Sunset view", isCorrect: false }
      ],
      funFact: "'Hori' (彫り) means carving, engraving, or traditional Japanese tattooing (Horimono)."
    },
    {
      id: "r1-q4",
      number: 4,
      language: "Turkish",
      flag: "🇹🇷",
      word: "Seksen",
      pronunciation: "sek-sen",
      sentence: "Seksen skittles was too much.",
      meaning: "Eighty (80)",
      options: [
        { key: "A", text: "Eighty", isCorrect: true },
        { key: "B", text: "Sour", isCorrect: false },
        { key: "C", text: "The teacher's", isCorrect: false }
      ],
      funFact: "In Turkish, 'seksen' is simply the number 80. 'Sekiz' is 8, and 'seksen' is 80."
    },
    {
      id: "r1-q5",
      number: 5,
      language: "Dutch",
      flag: "🇳🇱",
      word: "Kok",
      pronunciation: "kok",
      sentence: "She said that he had a good kok.",
      meaning: "Chef",
      options: [
        { key: "A", text: "Chef", isCorrect: true },
        { key: "B", text: "Sense of humor", isCorrect: false },
        { key: "C", text: "Kitchen", isCorrect: false }
      ],
      funFact: "In Dutch, a male cook or chef is a 'kok' (from the verb 'koken' = to cook)."
    },
    {
      id: "r1-q6",
      number: 6,
      language: "Finnish",
      flag: "🇫🇮",
      word: "Jesus tape",
      pronunciation: "yay-soos-tay-pee",
      sentence: "Jesus tape fixes everything.",
      meaning: "Slang for Duct Tape (binds & fixes everything just like Jesus)",
      options: [
        { key: "A", text: "Duct tape", isCorrect: true },
        { key: "B", text: "Holy water spray", isCorrect: false },
        { key: "C", text: "Church hymn book", isCorrect: false }
      ],
      funFact: "In Finland, duct tape is colloquially called 'Jeesusteippi' (Jesus tape) because it miraculously holds the world together and fixes any disaster."
    },
    {
      id: "r1-q7",
      number: 7,
      language: "Russian",
      flag: "🇷🇺",
      word: "Хор",
      pronunciation: "hor",
      sentence: "He preached to the хор.",
      meaning: "Choir",
      options: [
        { key: "A", text: "Choir", isCorrect: true },
        { key: "B", text: "Village crowd", isCorrect: false },
        { key: "C", text: "Town drunk", isCorrect: false }
      ],
      funFact: "Russian 'Хор' directly means choir or chorus."
    },
    {
      id: "r1-q8",
      number: 8,
      language: "Hindi",
      flag: "🇮🇳",
      word: "बीच बीच में (Beech Beech Mein)",
      pronunciation: "beech beech meyn",
      sentence: "What is this song about?",
      meaning: "In between / In the middle / Intermittently",
      options: [
        { key: "A", text: "In the middle / In between", isCorrect: true },
        { key: "B", text: "On the sunny beach", isCorrect: false },
        { key: "C", text: "Dancing all night", isCorrect: false }
      ],
      funFact: "'Beech beech mein' translates to 'in between' or 'at intervals'."
    }
  ],

  "round-2": [
    {
      id: "r2-q1",
      number: 1,
      language: "Italian",
      flag: "🇮🇹",
      phrase: "Non rompermi le palle",
      pronunciation: "[non rom-PER-mee leh PAL-leh]",
      literalMeaning: "Don’t break my balls",
      actualMeaning: "Stop annoying me / Leave me alone",
      explanation: "A passionate Italian classic used when someone is getting severely on your nerves."
    },
    {
      id: "r2-q2",
      number: 2,
      language: "Spanish",
      flag: "🇪🇸",
      phrase: "Estoy pedo",
      pronunciation: "[es-TOY PEH-doh]",
      literalMeaning: "I am a fart",
      actualMeaning: "I am drunk / wasted",
      explanation: "In Spain and Latin America, 'llevar un pedo' or 'estar pedo' means you have had way too many drinks!"
    },
    {
      id: "r2-q3",
      number: 3,
      language: "German",
      flag: "🇩🇪",
      phrase: "Du gehst mir auf den Keks",
      pronunciation: "[doo gayst meer owf dayn kayks]",
      literalMeaning: "You are getting on my cookie",
      actualMeaning: "You are getting on my nerves",
      explanation: "In German slang, 'Keks' (cookie) represents the head or mind. Walking on someone's cookie means driving them crazy!"
    },
    {
      id: "r2-q4",
      number: 4,
      language: "Danish",
      flag: "🇩🇰",
      phrase: "Så er den ged barberet",
      pronunciation: "[so air den get bar-BEH-ret]",
      literalMeaning: "Now that the goat is shaved",
      actualMeaning: "Now that the decision is finalized / Job is completed",
      explanation: "Danish idiom meaning a tricky problem has finally been resolved and wrapped up."
    },
    {
      id: "r2-q5",
      number: 5,
      language: "French",
      flag: "🇫🇷",
      phrase: "Il a vraiment le cul bordé de nouilles",
      pronunciation: "[eel ah vreh-mahn luh kyoo bor-DAY duh nooy]",
      literalMeaning: "His ass is lined with noodles",
      actualMeaning: "He is extremely lucky / jammy",
      explanation: "A colorful French expression for someone who experiences absurdly good fortune."
    },
    {
      id: "r2-q6",
      number: 6,
      language: "Portuguese",
      flag: "🇧🇷",
      phrase: "É de cair o cu da bunda",
      pronunciation: "[eh jee kah-EER oo koo dah BOON-dah]",
      literalMeaning: "It is enough for your asshole to fall off your butt",
      actualMeaning: "That is fucking unbelievable / mind-blowing",
      explanation: "Brazilian Portuguese expression for when something is so astonishing or outrageous that you are left utterly speechless."
    },
    {
      id: "r2-q7",
      number: 7,
      language: "Korean",
      flag: "🇰🇷",
      phrase: "좆 좀 드세요 (Joj jom deuseyo)",
      pronunciation: "[joj jom deu-seh-yo]",
      literalMeaning: "Please eat some dick",
      actualMeaning: "Fuck off / Get lost",
      explanation: "A delightfully polite grammatical ending ('-seyo') attached to an exceptionally vulgar insult is said with irony."
    },
    {
      id: "r2-q8",
      number: 8,
      language: "Indonesian",
      flag: "🇮🇩",
      phrase: "Hangat-hangat tahi ayam",
      pronunciation: "[HAHNG-aht HAHNG-aht TAH-hee AH-yahm]",
      literalMeaning: "Warm chicken shit",
      actualMeaning: "To be excited about something and quickly lose interest (fleeting enthusiasm)",
      explanation: "Chicken droppings are only warm for a few seconds before cooling down — just like someone's brief craze or short-lived enthusiasm!"
    }
  ],

  "round-3": {
    name: "Guesstination Unknown",
    flag: "🌍",
    totalRounds: 6,
    rules: [
      "You will be shown a random Google Earth location.",
      "Write down the exact Country Name on your answer sheet.",
      "6 Rounds total (1 point per correct country)."
    ]
  },

  "round-4": {
    name: "Foreign Pictionary",
    flag: "🎨",
    totalRounds: 12,
    languages: ["🇸🇪 Swedish (Rounds 1-4)", "🇨🇳 Mandarin (Rounds 5-8)", "🇮🇩 Indonesian (Rounds 9-12)"],
    rules: [
      "60 seconds per round on the clock.",
      "Drawer sees the host screen English word and draws on paper/whiteboard.",
      "Guesser scans their physical 100-word sheet and shouts the Foreign Word!",
      "Score +1 point for each correct word within 60s."
    ]
  }
};

// Helper function to shuffle array elements in place using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Randomize options for each question in Round 1 (Innuendo Lingo)
if (QUIZ_QUESTIONS['round-1']) {
  QUIZ_QUESTIONS['round-1'].forEach(q => {
    if (q.options && Array.isArray(q.options)) {
      shuffleArray(q.options);
      const keys = ['A', 'B', 'C'];
      q.options.forEach((opt, idx) => {
        opt.key = keys[idx] || String.fromCharCode(65 + idx);
      });
    }
  });
}
