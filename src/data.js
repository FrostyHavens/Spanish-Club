// ===== Game data: the content (content/es/words.js), errands, characters (all original) =====
'use strict';
(function () {
  const D = G.data = {};

  // ---------- Vocabulary, notebook pages and chapters: content/es/words.js (loaded first) ----------
  // G.content.es holds the Spanish content; everything in it is copied here, so code keeps reading G.data.words,
  // G.data.topics, G.data.pages, G.data.chapters...
  const ES = (G.content && G.content.es) || {};
  Object.assign(D, ES);

  // ---------- Errands ----------
  // goal: what the Misiones screen pictures — [word, count] pairs, '>' draws an arrow ("take this there").
  // The story is the 21 chapters (content/es/words.js, src/chapters.js); each chapter is also a quest here (c1..c21:
  // active / done in G.state.quests, a badge when it's done). The errands below are the older ones the chapters
  // replaced (docs/CURRICULUM.md 7.2): they never start now and only show in older games that have them done.
  D.quests = {
    saludos: { name: 'Saludos', en: 'Greetings: say hello to three people', giver: 'luna', goal: [['hola', 3]] },
    mercado: { name: 'El mercado', en: 'The market: three apples and two bananas', giver: 'rosa', goal: [['manzana', 3], ['platano', 2]] },
    pelota: { name: 'La pelota roja', en: 'The red ball: find Sofía\'s ball', giver: 'sofia', goal: [['pelota', 1]] },
    carta: { name: 'La carta', en: 'The letter: take it to the bakery', giver: 'tomas', goal: [['carta', 1], '>', ['panaderia', 1]] },
    fiesta: { name: 'La fiesta', en: 'The party at the school (older games)', giver: 'luna', goal: [['escuela', 1]] },
    canelo: { name: '¿Dónde está Canelo?', en: 'Where is Canelo? Follow the clues and find him', giver: 'mama', goal: [['perro', 1], ['pregunta', 1]] },
    picnic: { name: 'El día de campo', en: 'Grandma Rosa\'s picnic: five foods from around town', giver: 'rosa', goal: [['pan', 1], ['queso', 1], ['huevo', 1], ['leche', 1], ['agua', 1]] },
    show: { name: 'El show de perros', en: 'Sofía\'s dog show: teach Canelo three tricks, then show them', giver: 'sofia', goal: [['sientate', 1], ['pata', 1], ['salta', 1]] },
    cuenta: { name: '¿Cuántos animales?', en: 'Count the animals of Villa Sol for Profesora Luna', giver: 'luna', goal: [['pato', 1], ['gallina', 1], ['caballo', 1], ['cabra', 1], ['conejo', 1], ['rana', 1], ['pez', 1]] },
    sonidos: { name: '¿Qué dicen?', en: 'Nico\'s sound game: find the animal that makes each sound', giver: 'nico', goal: [['cuac', 1], ['croac', 1], ['cabra', 1], ['miau', 1], ['guau', 1]] },
    flores: { name: 'Las flores de Lucía', en: 'Lucía\'s flowers: a pink, a white and a yellow one for her mom', giver: 'lucia', goal: [[{ icon: 'flor', col: '#f878b8' }, 1], [{ icon: 'flor', col: '#f8f8f4' }, 1], [{ icon: 'flor', col: '#f8d030' }, 1]] },
    cansado: { name: 'Tomás está cansado', en: 'Tomás is tired: deliver his three letters', giver: 'tomas', goal: [['carta', 1], '>', ['casa', 1], ['granja', 1], ['biblioteca', 1]] },
    fiestab: { name: 'La fiesta de los animales', en: 'The animal party at the farm (the finale)', giver: 'luna', goal: [['hola', 5], '>', ['granja', 1]] },
  };
  for (const c of D.chapters || []) D.quests[c.id] = { name: c.title, en: c.en, giver: c.giver, goal: c.goal, chapter: c.n, icon: c.icon, col: c.col };
  // older errands that would run after the chapters written so far (src/errands.js): none, all 21 chapters are written
  D.tailOrder = [];
  // Misiones and the badge rows: the chapters; the legacy errands only show in older games that have them
  D.legacyQuests = ['saludos', 'mercado', 'pelota', 'carta', 'canelo', 'cansado', 'picnic', 'show', 'flores', 'sonidos', 'cuenta', 'fiesta', 'fiestab'];
  D.questOrder = (D.chapters || []).map(c => c.id).concat(D.tailOrder, D.legacyQuests);
  D.badgeOrder = (D.chapters || []).map(c => c.id).concat(D.tailOrder);

  // ---------- Player (chosen in the character creator at the start of a new game) ----------
  D.player = { name: 'Alex' };
  D.looks = {
    genders: ['nino', 'nina'],
    skins: ['#f8d8c0', '#f0c8a0', '#d8a078', '#a87050', '#7a4a30'],
    styles: ['short', 'spiky', 'curly', 'long', 'ponytail', 'braid'],
    hairs: ['#201010', '#5a3418', '#a05a28', '#e0b050', '#c84020'],
    outfits: ['#e05a30', '#3a7ad0', '#40a848', '#e060a0', '#8a50c8', '#f0c020'],
  };
  D.defaultLook = g => g === 'nina'
    ? { gender: 'nina', skin: '#f0c8a0', style: 'ponytail', hair: '#5a3418', outfit: '#e060a0' }
    : { gender: 'nino', skin: '#f0c8a0', style: 'short', hair: '#5a3418', outfit: '#e05a30' };
  // map sprite + portrait specs for a look
  D.playerSpec = function (look) {
    look = look || D.defaultLook('nino');
    const girl = look.gender === 'nina';
    const base = { body: 'halfling', skin: look.skin, hair: look.hair, hairStyle: look.style, outfit: look.outfit, trim: '#f8f0d0', eyes: '#3a2a20' };
    return {
      map: base,
      portrait: Object.assign({}, base, { age: 'young', face: 'round', lashes: girl, bg: '#' + [1, 3, 5].map(i => Math.round(parseInt(look.outfit.substr(i, 2), 16) * 0.55).toString(16).padStart(2, '0')).join('') }),
    };
  };

  // ---------- Townsfolk (map sprite + dialogue portrait) ----------
  D.npcs = {
    luna: { name: 'Profesora Luna',
      portrait: { body: 'human', skin: '#e8b890', hair: '#2a1a30', hairStyle: 'long', eyes: '#3a2a50', outfit: '#3a7ad0', trim: '#f8f0d0', age: 'adult', face: 'soft', lashes: true, bg: '#2c6a8a' },
      map: { body: 'human', skin: '#e8b890', hair: '#2a1a30', hairStyle: 'long', outfit: '#3a7ad0', trim: '#f8f0d0', robe: true, eyes: '#3a2a50' } },
    mama: { name: 'Mamá',
      portrait: { body: 'human', skin: '#f0c8a0', hair: '#5a3418', hairStyle: 'ponytail', eyes: '#3a2a20', outfit: '#50a070', trim: '#f0e8c0', age: 'adult', face: 'soft', lashes: true, bg: '#4a7a40' },
      map: { body: 'human', skin: '#f0c8a0', hair: '#5a3418', hairStyle: 'ponytail', outfit: '#50a070', trim: '#f0e8c0', robe: true, eyes: '#3a2a20' } },
    rosa: { name: 'Abuela Rosa',
      portrait: { body: 'human', skin: '#e8c0a0', hair: '#d0d0d8', hairStyle: 'braid', eyes: '#504060', outfit: '#c04870', trim: '#f8d8e8', age: 'old', face: 'soft', bg: '#8a3a5a' },
      map: { body: 'human', skin: '#e8c0a0', hair: '#d0d0d8', hairStyle: 'braid', outfit: '#c04870', trim: '#f8d8e8', robe: true, eyes: '#504060' } },
    pepe: { name: 'Don Pepe',
      portrait: { body: 'human', skin: '#d8a078', hair: '#302018', hairStyle: 'short', beard: '#302018', eyes: '#302010', outfit: '#3a9050', trim: '#f0f0e0', age: 'adult', face: 'round', bg: '#6a8a30' },
      map: { body: 'human', skin: '#d8a078', hair: '#302018', hairStyle: 'short', beard: '#302018', outfit: '#3a9050', trim: '#f0f0e0', eyes: '#302010' } },
    sofia: { name: 'Sofía',
      portrait: { body: 'halfling', skin: '#c89070', hair: '#201010', hairStyle: 'braid', eyes: '#302010', outfit: '#f070a0', trim: '#fff0f8', age: 'young', face: 'round', lashes: true, bg: '#a04a80' },
      map: { body: 'halfling', skin: '#c89070', hair: '#201010', hairStyle: 'braid', outfit: '#f070a0', trim: '#fff0f8', eyes: '#302010' } },
    tomas: { name: 'Tomás el cartero',
      portrait: { body: 'human', skin: '#e0b088', hair: '#603818', hairStyle: 'short', eyes: '#304050', head: 'bandana', headColor: '#2a50b0', outfit: '#3a60c0', trim: '#f8d040', age: 'adult', face: 'sharp', bg: '#30508a' },
      map: { body: 'human', skin: '#e0b088', hair: '#603818', hairStyle: 'short', outfit: '#3a60c0', trim: '#f8d040', head: 'bandana', headColor: '#2a50b0', eyes: '#304050' } },
    marta: { name: 'Marta la panadera',
      portrait: { body: 'human', skin: '#f0c8a0', hair: '#c05030', hairStyle: 'ponytail', eyes: '#305020', outfit: '#f0f0f0', trim: '#c08040', age: 'adult', face: 'round', lashes: true, bg: '#a07030' },
      map: { body: 'human', skin: '#f0c8a0', hair: '#c05030', hairStyle: 'ponytail', outfit: '#f0f0f0', trim: '#c08040', eyes: '#305020' } },
    ines: { name: 'Inés',
      portrait: { body: 'human', skin: '#a87050', hair: '#181010', hairStyle: 'curly', eyes: '#201008', outfit: '#806040', trim: '#e0c890', age: 'adult', face: 'soft', lashes: true, bg: '#5a4a7a' },
      map: { body: 'human', skin: '#a87050', hair: '#181010', hairStyle: 'curly', outfit: '#806040', trim: '#e0c890', robe: true, eyes: '#201008' } },
    gomez: { name: 'Señor Gómez',
      portrait: { body: 'human', skin: '#e8b890', hair: '#b0b0b0', hairStyle: 'bald', beard: '#c8c8c8', eyes: '#403020', outfit: '#a07040', trim: '#604020', age: 'old', face: 'round', bg: '#7a5a3a' },
      map: { body: 'human', skin: '#e8b890', hair: '#b0b0b0', hairStyle: 'bald', beard: '#c8c8c8', outfit: '#a07040', trim: '#604020', eyes: '#403020' } },
    lucia: { name: 'Lucía',
      portrait: { body: 'human', skin: '#f8d0b0', hair: '#e0a040', hairStyle: 'long', eyes: '#305080', outfit: '#8050c0', trim: '#f0e0ff', age: 'young', face: 'soft', lashes: true, bg: '#5a3a8a' },
      map: { body: 'human', skin: '#f8d0b0', hair: '#e0a040', hairStyle: 'long', outfit: '#8050c0', trim: '#f0e0ff', eyes: '#305080' } },
    nico: { name: 'Nico',
      portrait: { body: 'halfling', skin: '#e8b890', hair: '#e0c060', hairStyle: 'spiky', eyes: '#306030', outfit: '#40a0e0', trim: '#f0f0f0', age: 'young', face: 'round', bg: '#307090' },
      map: { body: 'halfling', skin: '#e8b890', hair: '#e0c060', hairStyle: 'spiky', outfit: '#40a0e0', trim: '#f0f0f0', eyes: '#306030' } },
    canelo: { name: 'Canelo',
      map: { body: 'wolf', outfit: '#b87038', trim: '#f0d8b0', eyes: '#201008' } },
  };
})();
