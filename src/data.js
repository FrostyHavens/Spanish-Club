// ===== Game data: vocabulary, topics, characters (all original) =====
'use strict';
(function () {
  const D = G.data = {};

  // ---------- Vocabulary ----------
  // Each topic is taught by one errand. Nouns carry their article so kids learn el/la with the word.
  D.topics = {
    saludos: { name: 'Saludos', en: 'Greetings' },
    comida: { name: 'La comida', en: 'Food' },
    numeros: { name: 'Los números', en: 'Numbers' },
    colores: { name: 'Los colores', en: 'Colors' },
    pueblo: { name: 'El pueblo', en: 'Around town' },
  };
  D.topicOrder = ['saludos', 'numeros', 'comida', 'colores', 'pueblo'];

  // icon: picture drawn in icons.js. n: number value (for dice pictures). say: text for speech, if different.
  D.words = {
    hola: { es: 'hola', en: 'hello', topic: 'saludos', icon: 'hola' },
    adios: { es: 'adiós', en: 'goodbye', topic: 'saludos', icon: 'adios' },
    buenosdias: { es: 'buenos días', en: 'good morning', topic: 'saludos', icon: 'sol' },
    comoestas: { es: '¿cómo estás?', en: 'how are you?', topic: 'saludos', icon: 'pregunta' },
    bien: { es: 'bien', en: 'well / fine', topic: 'saludos', icon: 'bien' },
    gracias: { es: 'gracias', en: 'thank you', topic: 'saludos', icon: 'gracias' },
    porfavor: { es: 'por favor', en: 'please', topic: 'saludos', icon: 'porfavor' },

    uno: { es: 'uno', en: 'one', topic: 'numeros', icon: 'dado', n: 1 },
    dos: { es: 'dos', en: 'two', topic: 'numeros', icon: 'dado', n: 2 },
    tres: { es: 'tres', en: 'three', topic: 'numeros', icon: 'dado', n: 3 },
    cuatro: { es: 'cuatro', en: 'four', topic: 'numeros', icon: 'dado', n: 4 },
    cinco: { es: 'cinco', en: 'five', topic: 'numeros', icon: 'dado', n: 5 },

    manzana: { es: 'la manzana', en: 'the apple', topic: 'comida', icon: 'manzana', pl: 'manzanas' },
    platano: { es: 'el plátano', en: 'the banana', topic: 'comida', icon: 'platano', pl: 'plátanos' },
    naranja: { es: 'la naranja', en: 'the orange', topic: 'comida', icon: 'naranja', pl: 'naranjas' },
    uvas: { es: 'las uvas', en: 'the grapes', topic: 'comida', icon: 'uvas', pl: 'uvas' },
    pan: { es: 'el pan', en: 'the bread', topic: 'comida', icon: 'pan' },

    rojo: { es: 'rojo / roja', en: 'red', topic: 'colores', icon: 'color', col: '#e03028' },
    azul: { es: 'azul', en: 'blue', topic: 'colores', icon: 'color', col: '#3068e0' },
    verde: { es: 'verde', en: 'green', topic: 'colores', icon: 'color', col: '#38b040' },
    amarillo: { es: 'amarillo / amarilla', en: 'yellow', topic: 'colores', icon: 'color', col: '#f8d030' },

    casa: { es: 'la casa', en: 'the house', topic: 'pueblo', icon: 'casa' },
    escuela: { es: 'la escuela', en: 'the school', topic: 'pueblo', icon: 'escuela' },
    parque: { es: 'el parque', en: 'the park', topic: 'pueblo', icon: 'parque' },
    panaderia: { es: 'la panadería', en: 'the bakery', topic: 'pueblo', icon: 'panaderia' },
    biblioteca: { es: 'la biblioteca', en: 'the library', topic: 'pueblo', icon: 'biblioteca' },
    carta: { es: 'la carta', en: 'the letter', topic: 'pueblo', icon: 'carta' },
  };
  D.numberWords = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];

  // ---------- Errands (shown in the Misiones menu) ----------
  D.quests = {
    saludos: { name: 'Saludos', en: 'Greetings', giver: 'Profesora Luna',
      goal: 'Saluda a tres personas del pueblo.', goalEn: 'Greet three people in town.' },
    mercado: { name: 'El mercado', en: 'The market', giver: 'Abuela Rosa',
      goal: 'Compra tres manzanas y dos plátanos.', goalEn: 'Buy three apples and two bananas.' },
    pelota: { name: 'La pelota roja', en: 'The red ball', giver: 'Sofía',
      goal: 'Busca la pelota roja en el parque.', goalEn: 'Find the red ball in the park.' },
    carta: { name: 'La carta', en: 'The letter', giver: 'Tomás',
      goal: 'Lleva la carta a la panadería.', goalEn: 'Take the letter to the bakery.' },
    fiesta: { name: 'La fiesta', en: 'The party', giver: 'Profesora Luna',
      goal: 'Ve a la fiesta en la escuela.', goalEn: 'Go to the party at the school.' },
  };
  D.questOrder = ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'];

  // ---------- Player ----------
  D.player = {
    name: 'Alex',
    map: { body: 'halfling', skin: '#f0c8a0', hair: '#5a3418', hairStyle: 'short', outfit: '#e05a30', trim: '#f8e060', eyes: '#3a2a20' },
    portrait: { body: 'halfling', skin: '#f0c8a0', hair: '#5a3418', hairStyle: 'short', eyes: '#3a2a20', outfit: '#e05a30', trim: '#f8e060', age: 'young', face: 'round', bg: '#c06030' },
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
