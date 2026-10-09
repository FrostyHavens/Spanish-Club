// ===== Spanish content: the 73 words, their notebook pages, and the 21 chapters (docs/CURRICULUM.md) =====
// Loaded by index.html BEFORE src/data.js, which copies everything here into G.data (G.data.words, .topics, .pages,
// .chapters...), so the code reads G.data as before. Pictures live in src/icons.js (`icon`), the chapters' scripts in
// content/es/story-*.js (G.chapters.script), the chapter engine in src/chapters.js.
//
// A word: { es, en, topic, icon, n (a number's value, for dice), col (a colour's colour), pl (plural, for [id:form]),
//           alt (other forms the mic accepts, ' / '-separated) }. Nouns carry their article; adjectives that change
//           form show both ('rojo / roja'); speech and cards use the part before the '/'.
// A page: { topic, words } in the order the words are met (CURRICULUM.md section 5); a topic: { name, en }.
// A chapter: { id, n, title, en (for grown-ups), giver, session (the planned day), words (new, in order), icon, col
//   (its badge), goal (Misiones pictures), when ('morning': only as the first chapter of a session; 'evening': it
//   plays in the evening at home) }.
'use strict';
(function () {
  const C = (window.G.content = window.G.content || {}).es = {};

  C.topics = {
    saludos: { name: 'Saludos', en: 'Greetings' },
    mascota: { name: 'Mi perro Canelo', en: 'My dog Canelo' },
    animales: { name: 'Los animales', en: 'Animals' },
    sonidos: { name: '¿Qué dicen?', en: 'What do they say?' },
    comida: { name: 'La comida', en: 'Food' },
    colores: { name: 'Los colores', en: 'Colors' },
    granja: { name: 'La granja', en: 'The farm' },
    pueblo: { name: 'El pueblo', en: 'Around town' },
    cosas: { name: 'En la plaza y el parque', en: 'In the plaza and the park' },
    sentir: { name: 'Así me siento', en: 'Feelings' },
    numeros: { name: 'Los números', en: 'Numbers' },
  };
  // the notebook's page order: roughly the order the pages appear in the story
  C.topicOrder = ['saludos', 'mascota', 'animales', 'sonidos', 'comida', 'colores', 'granja', 'pueblo', 'cosas', 'sentir', 'numeros'];

  C.words = {
    // ---- Saludos ----
    hola: { es: 'hola', en: 'hello', topic: 'saludos', icon: 'hola' },
    buenosdias: { es: 'buenos días', en: 'good morning', topic: 'saludos', icon: 'sol' },
    si: { es: 'sí', en: 'yes', topic: 'saludos', icon: 'si' },
    no: { es: 'no', en: 'no', topic: 'saludos', icon: 'no' },
    gracias: { es: 'gracias', en: 'thank you', topic: 'saludos', icon: 'gracias' },
    comoestas: { es: '¿cómo estás?', en: 'how are you?', topic: 'saludos', icon: 'pregunta' },
    buenasnoches: { es: 'buenas noches', en: 'good night', topic: 'saludos', icon: 'noche' },
    adios: { es: 'adiós', en: 'goodbye', topic: 'saludos', icon: 'adios' },
    porfavor: { es: 'por favor', en: 'please', topic: 'saludos', icon: 'porfavor' },
    // ---- Mi perro Canelo: his commands and his things ----
    ven: { es: 'ven', en: 'come!', topic: 'mascota', icon: 'ven', alt: 'ven acá / ven aquí / vente' },
    hueso: { es: 'el hueso', en: 'the bone', topic: 'mascota', icon: 'hueso', pl: 'huesos' },
    sientate: { es: 'siéntate', en: 'sit!', topic: 'mascota', icon: 'sientate', alt: 'sentado / siéntese / sienta' },
    pelota: { es: 'la pelota', en: 'the ball', topic: 'mascota', icon: 'pelota', col: '#e03028' },
    cama: { es: 'la cama', en: 'the bed', topic: 'mascota', icon: 'cama' },
    pata: { es: 'dame la pata', en: 'shake! (give me your paw)', topic: 'mascota', icon: 'pata', alt: 'la pata / pata / dame la patita' },
    salta: { es: 'salta', en: 'jump!', topic: 'mascota', icon: 'salta', alt: 'brinca / salte' },
    busca: { es: 'busca', en: 'find it! (sniff)', topic: 'mascota', icon: 'busca', alt: 'búscalo / búscala / busca busca' },
    gira: { es: 'gira', en: 'spin!', topic: 'mascota', icon: 'gira', alt: 'gira gira / da la vuelta / vuelta' },
    // ---- Los animales ----
    perro: { es: 'el perro', en: 'the dog', topic: 'animales', icon: 'perro', pl: 'perros', alt: 'perrito / perrita' },
    gato: { es: 'el gato', en: 'the cat', topic: 'animales', icon: 'gato', pl: 'gatos', alt: 'gatito / gatita / la gata' },
    mariposa: { es: 'la mariposa', en: 'the butterfly', topic: 'animales', icon: 'mariposa', pl: 'mariposas' },
    conejo: { es: 'el conejo', en: 'the rabbit', topic: 'animales', icon: 'conejo', pl: 'conejos', alt: 'conejito' },
    rana: { es: 'la rana', en: 'the frog', topic: 'animales', icon: 'rana', pl: 'ranas', alt: 'ranita' },
    pajaro: { es: 'el pájaro', en: 'the bird', topic: 'animales', icon: 'pajaro', pl: 'pájaros', alt: 'pajarito' },
    pez: { es: 'el pez', en: 'the fish', topic: 'animales', icon: 'pez', pl: 'peces', alt: 'pescado / pescadito / pecesito' },
    // ---- ¿Qué dicen? (the cries of the bird and the goat, pío and bee, are sounds, not words) ----
    guau: { es: 'guau', en: 'woof', topic: 'sonidos', icon: 'guau', alt: 'guau guau / wow / guao' },
    miau: { es: 'miau', en: 'meow', topic: 'sonidos', icon: 'miau', alt: 'miau miau / meow' },
    cuac: { es: 'cuac', en: 'quack', topic: 'sonidos', icon: 'cuac', alt: 'cuac cuac / quack / cuak' },
    croac: { es: 'croac', en: 'ribbit', topic: 'sonidos', icon: 'croac', alt: 'croac croac / croak' },
    // ---- La comida ----
    manzana: { es: 'la manzana', en: 'the apple', topic: 'comida', icon: 'manzana', pl: 'manzanas' },
    pan: { es: 'el pan', en: 'the bread', topic: 'comida', icon: 'pan', pl: 'panes' },
    agua: { es: 'el agua', en: 'the water', topic: 'comida', icon: 'agua' },
    huevo: { es: 'el huevo', en: 'the egg', topic: 'comida', icon: 'huevo', pl: 'huevos' },
    platano: { es: 'el plátano', en: 'the banana', topic: 'comida', icon: 'platano', pl: 'plátanos' },
    naranja: { es: 'la naranja', en: 'the orange', topic: 'comida', icon: 'naranja', pl: 'naranjas' },
    queso: { es: 'el queso', en: 'the cheese', topic: 'comida', icon: 'queso' },
    leche: { es: 'la leche', en: 'the milk', topic: 'comida', icon: 'leche' },
    galleta: { es: 'la galleta', en: 'the cookie', topic: 'comida', icon: 'galleta', pl: 'galletas' },
    // ---- Los colores ----
    rojo: { es: 'rojo / roja', en: 'red', topic: 'colores', icon: 'color', col: '#e03028' },
    blanco: { es: 'blanco / blanca', en: 'white', topic: 'colores', icon: 'color', col: '#f8f8f4' },
    azul: { es: 'azul', en: 'blue', topic: 'colores', icon: 'color', col: '#3068e0' },
    rosa: { es: 'rosado / rosada', en: 'pink', topic: 'colores', icon: 'color', col: '#f878b8', alt: 'rosa' }, // (id rosa: older saves)
    amarillo: { es: 'amarillo / amarilla', en: 'yellow', topic: 'colores', icon: 'color', col: '#f8d030' },
    verde: { es: 'verde', en: 'green', topic: 'colores', icon: 'color', col: '#38b040' },
    // ---- La granja ----
    pato: { es: 'el pato', en: 'the duck', topic: 'granja', icon: 'pato', pl: 'patos', alt: 'patito' },
    cabra: { es: 'la cabra', en: 'the goat', topic: 'granja', icon: 'cabra', pl: 'cabras', alt: 'chiva / chivo' },
    caballo: { es: 'el caballo', en: 'the horse', topic: 'granja', icon: 'caballo', pl: 'caballos' },
    gallina: { es: 'la gallina', en: 'the hen', topic: 'granja', icon: 'gallina', pl: 'gallinas' },
    // ---- El pueblo ----
    parque: { es: 'el parque', en: 'the park', topic: 'pueblo', icon: 'parque' },
    granja: { es: 'la granja', en: 'the farm', topic: 'pueblo', icon: 'granja' },
    escuela: { es: 'la escuela', en: 'the school', topic: 'pueblo', icon: 'escuela' },
    carta: { es: 'la carta', en: 'the letter', topic: 'pueblo', icon: 'carta', pl: 'cartas' },
    casa: { es: 'la casa', en: 'the house', topic: 'pueblo', icon: 'casa' },
    panaderia: { es: 'la panadería', en: 'the bakery', topic: 'pueblo', icon: 'panaderia' },
    biblioteca: { es: 'la biblioteca', en: 'the library', topic: 'pueblo', icon: 'biblioteca' },
    // ---- En la plaza y el parque ----
    banco: { es: 'el banco', en: 'the bench', topic: 'cosas', icon: 'banco' },
    fuente: { es: 'la fuente', en: 'the fountain', topic: 'cosas', icon: 'fuente' },
    flor: { es: 'la flor', en: 'the flower', topic: 'cosas', icon: 'flor', pl: 'flores' },
    arbol: { es: 'el árbol', en: 'the tree', topic: 'cosas', icon: 'arbol', pl: 'árboles' },
    // ---- Así me siento ----
    bien: { es: 'bien', en: 'well / fine', topic: 'sentir', icon: 'bien' },
    cansado: { es: 'cansado / cansada', en: 'tired', topic: 'sentir', icon: 'cansado' },
    feliz: { es: 'feliz', en: 'happy', topic: 'sentir', icon: 'feliz', alt: 'contento / contenta' },
    triste: { es: 'triste', en: 'sad', topic: 'sentir', icon: 'triste' },
    // ---- Los números ----
    uno: { es: 'uno', en: 'one', topic: 'numeros', icon: 'dado', n: 1 },
    dos: { es: 'dos', en: 'two', topic: 'numeros', icon: 'dado', n: 2 },
    tres: { es: 'tres', en: 'three', topic: 'numeros', icon: 'dado', n: 3 },
    cuatro: { es: 'cuatro', en: 'four', topic: 'numeros', icon: 'dado', n: 4 },
    cinco: { es: 'cinco', en: 'five', topic: 'numeros', icon: 'dado', n: 5 },
    seis: { es: 'seis', en: 'six', topic: 'numeros', icon: 'dado', n: 6 },
    siete: { es: 'siete', en: 'seven', topic: 'numeros', icon: 'diez', n: 7 },
    ocho: { es: 'ocho', en: 'eight', topic: 'numeros', icon: 'diez', n: 8 },
    nueve: { es: 'nueve', en: 'nine', topic: 'numeros', icon: 'diez', n: 9 },
    diez: { es: 'diez', en: 'ten', topic: 'numeros', icon: 'diez', n: 10 },
  };
  C.numberWords = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
  C.numberWords10 = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

  // ---------- the notebook: one page per topic, the words in the order they are met ----------
  C.pages = {
    saludos: { topic: 'saludos', words: ['hola', 'buenosdias', 'si', 'no', 'gracias', 'comoestas', 'buenasnoches', 'adios', 'porfavor'] },
    mascota: { topic: 'mascota', words: ['ven', 'hueso', 'sientate', 'pelota', 'cama', 'pata', 'salta', 'busca', 'gira'] },
    animales: { topic: 'animales', words: ['perro', 'gato', 'mariposa', 'conejo', 'rana', 'pajaro', 'pez'] },
    sonidos: { topic: 'sonidos', words: ['guau', 'miau', 'cuac', 'croac'] },
    comida: { topic: 'comida', words: ['manzana', 'pan', 'agua', 'huevo', 'platano', 'naranja', 'queso', 'leche', 'galleta'] },
    colores: { topic: 'colores', words: ['rojo', 'blanco', 'azul', 'rosa', 'amarillo', 'verde'] },
    granja: { topic: 'granja', words: ['pato', 'cabra', 'caballo', 'gallina'] },
    pueblo: { topic: 'pueblo', words: ['parque', 'granja', 'escuela', 'carta', 'casa', 'panaderia', 'biblioteca'] },
    cosas: { topic: 'cosas', words: ['banco', 'fuente', 'flor', 'arbol'] },
    sentir: { topic: 'sentir', words: ['bien', 'cansado', 'feliz', 'triste'] },
    numeros: { topic: 'numeros', words: ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'] },
  };
  C.pageOrder = C.topicOrder.slice();
  // where each page's puzzle sparkle sits (maps.js reads this): map -> 'x,y' -> page
  C.pagePlaces = {
    villa: { '15,9': 'saludos', '13,19': 'animales', '43,19': 'granja', '18,11': 'numeros', '21,20': 'colores', '13,9': 'cosas' },
    casa: { '7,5': 'mascota' },
    rosa: { '1,1': 'comida' },
    biblioteca: { '2,1': 'pueblo' },
    escuela: { '3,1': 'sentir' },
    granja: { '6,2': 'sonidos' }, // (inside the barn: what do the animals say?)
  };

  // ---------- the 21 chapters, in order (docs/CURRICULUM.md section 4) ----------
  C.chapters = [
    { id: 'c1', title: '¡Un perro!', en: 'A dog! A puppy bursts in: Canelo becomes yours', giver: 'mama', session: 1, words: ['hola', 'perro', 'guau', 'ven'], icon: 'perro', col: '#b87038', goal: [['perro', 1]] },
    { id: 'c2', title: 'El gato de la cerca', en: 'The cat on the fence: Nico\'s sound game', giver: 'nico', session: 1, words: ['gato', 'miau'], icon: 'gato', col: '#e8902c', goal: [['gato', 1]] },
    { id: 'c3', title: '¡Buenos días, Canelo!', en: 'Good morning, Canelo! A bone for sitting', giver: 'mama', session: 2, words: ['buenosdias', 'hueso', 'sientate'], icon: 'sol', col: '#e8b820', when: 'morning', goal: [['hueso', 1], ['sientate', 1]] },
    { id: 'c4', title: 'El juego de Don Pepe', en: 'Don Pepe\'s yes-or-no game, and an apple', giver: 'pepe', session: 2, words: ['si', 'no', 'manzana'], icon: 'manzana', col: '#d83838', goal: [['si', 1], ['no', 1], ['manzana', 1]] },
    { id: 'c5', title: 'La pelota roja', en: 'The red ball: find Sofía\'s ball', giver: 'sofia', session: 3, words: ['pelota', 'rojo'], icon: 'pelota', col: '#3a78e0', goal: [['pelota', 1]] },
    { id: 'c6', title: 'Pan para los patos', en: 'Bread for the ducks: the bakery, then the farm pond', giver: 'marta', session: 3, words: ['pan', 'gracias', 'pato', 'cuac'], icon: 'pan', col: '#c88838', goal: [['pan', 1], '>', ['pato', 1]] },
    { id: 'c7', title: '¿Dónde está Canelo?', en: 'Where is Canelo? Four clues, four places', giver: 'mama', session: 4, words: ['parque', 'banco', 'fuente', 'granja', 'cabra'], icon: 'huella', col: '#8a5a2c', when: 'morning', goal: [['perro', 1], ['pregunta', 1]] },
    { id: 'c8', title: 'La escuela de Luna', en: 'Profesora Luna\'s school: ask three friends how they are', giver: 'mama', session: 5, words: ['escuela', 'bien', 'comoestas'], icon: 'escuela', col: '#3a7ad0', when: 'morning', goal: [['escuela', 1], ['pregunta', 3]] },
    { id: 'c9', title: '¡Buenas noches, Canelo!', en: 'Good night, Canelo! The first evening at home', giver: 'mama', session: 5, words: ['agua', 'cama', 'buenasnoches'], icon: 'noche', col: '#3a3a9a', when: 'evening', goal: [['agua', 1], ['cama', 1]] },
    { id: 'c10', title: 'Tomás está cansado', en: 'Tired Tomás: three letters, and a horse who eats one', giver: 'tomas', session: 6, words: ['cansado', 'carta', 'casa', 'caballo', 'adios'], icon: 'carta', col: '#2a9a9a', goal: [['carta', 3]] },
    { id: 'c11', title: 'Los huevos de Rosa', en: 'Grandma Rosa\'s hens and eggs', giver: 'rosa', session: 7, words: ['gallina', 'huevo', 'uno', 'dos', 'blanco'], icon: 'huevo', col: '#d8c8a0', goal: [['huevo', 2]] },
    { id: 'c12', title: 'El mercado de Mamá', en: 'Mom\'s shopping list at Don Pepe\'s', giver: 'mama', session: 8, words: ['platano', 'naranja', 'porfavor', 'tres', 'cuatro'], icon: 'platano', col: '#e8a030', goal: [['platano', 3], ['naranja', 4]] },
    { id: 'c13', title: 'El día de campo', en: 'Grandma Rosa\'s picnic', giver: 'rosa', session: 9, words: ['panaderia', 'queso', 'leche', 'cinco', 'seis'], icon: 'canasta', col: '#e05a30', goal: [['canasta', 1]] },
    { id: 'c14', title: 'El show de perros', en: 'Sofía\'s dog show', giver: 'sofia', session: 10, words: ['pata', 'salta', 'galleta', 'azul', 'feliz'], icon: 'cinta', col: '#3a56c8', goal: [['pata', 1], ['salta', 1], ['cinta', 1]] },
    { id: 'c15', title: 'Las flores de Lucía', en: 'Lucía\'s flowers', giver: 'lucia', session: 11, words: ['triste', 'flor', 'rosa', 'amarillo', 'mariposa'], icon: 'flor', col: '#e060a0', goal: [['flor', 3]] },
    { id: 'c16', title: 'Las páginas perdidas', en: 'The lost notebook pages: Canelo learns ¡busca!', giver: 'gomez', session: 12, words: ['biblioteca', 'busca', 'arbol', 'conejo'], icon: 'pagina', col: '#7a5a3a', goal: [['pagina', 3]] },
    { id: 'c17', title: '¿Qué dicen?', en: 'Nico\'s sound game around town', giver: 'nico', session: 13, words: ['rana', 'croac', 'verde', 'pajaro', 'gira'], icon: 'nota', col: '#e0a020', goal: [['nota', 1]] },
    { id: 'c18', title: '¿Cuántos animales?', en: 'Count the animals of Villa Sol with Profesora Luna', giver: 'luna', session: 14, words: ['pez', 'siete', 'ocho'], icon: 'pez', col: '#8a50c8', goal: [['pez', 1], ['pregunta', 1]] },
    { id: 'c19', title: '¡Todos a la granja!', en: 'Call every animal to the farm', giver: 'luna', session: 15, words: ['nueve', 'diez'], icon: 'diez', col: '#5a9a30', when: 'morning', goal: [['granja', 1]] },
    { id: 'c20', title: 'Preparamos la fiesta', en: 'Getting the party ready', giver: 'luna', session: 16, words: [], icon: 'estrella', col: '#c03030', goal: [['carta', 5]] },
    { id: 'c21', title: 'La fiesta de los animales', en: 'The animal party', giver: 'luna', session: 17, words: [], icon: 'estrella', col: '#f0a020', when: 'morning', goal: [['estrella', 1]] },
  ];
  C.chapters.forEach((c, i) => { c.n = i + 1; });
})();
