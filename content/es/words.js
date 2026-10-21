// ===== Spanish content: the words (180: 73 for the 21 chapters, the rest for the zones), their notebook pages, the phrases, and the 21 chapters (docs/CURRICULUM.md) =====
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
    mascota: { name: 'Mi perro {dog}', en: 'My dog {dog}' },
    animales: { name: 'Los animales', en: 'Animals' },
    sonidos: { name: '¿Qué dicen?', en: 'What do they say?' },
    comida: { name: 'La comida', en: 'Food' },
    colores: { name: 'Los colores', en: 'Colors' },
    granja: { name: 'La granja', en: 'The farm' },
    pueblo: { name: 'El pueblo', en: 'Around town' },
    cosas: { name: 'En la plaza y el parque', en: 'In the plaza and the park' },
    sentir: { name: 'Así me siento', en: 'Feelings' },
    numeros: { name: 'Los números', en: 'Numbers' },
    // the open world's zones (docs/WORLD_PLAN.md): each zone's own pages
    playa: { name: 'La playa', en: 'The beach' },
    mar: { name: 'En el mar', en: 'In the sea' },
    bosque: { name: 'El bosque', en: 'The forest' },
    fauna: { name: 'Animales del bosque', en: 'Forest animals' },
    acciones: { name: '¡A jugar!', en: 'Let\'s play! (action words)' },
    juegosparque: { name: 'El parque de juegos', en: 'The playground' },
    bichos: { name: 'Bichos del parque', en: 'Park critters' },
    familia: { name: 'La familia', en: 'The family' },
    cuerpo: { name: 'Mi cuerpo', en: 'My body' },
    ropa: { name: 'La ropa', en: 'Clothes' },
    rancho: { name: 'En casa de los abuelos', en: 'At the grandparents\' (their animals)' },
    huerta: { name: 'La huerta', en: 'Abuelo\'s vegetable garden' },
    tiempo: { name: '¿Qué tiempo hace?', en: 'The weather' },
    montana: { name: 'La montaña', en: 'The mountain (snow and cold)' },
    faunamontana: { name: 'Animales de la montaña', en: 'Mountain animals' },
  };
  // the notebook's page order: roughly the order the pages appear in the story
  C.topicOrder = ['saludos', 'mascota', 'animales', 'sonidos', 'comida', 'colores', 'granja', 'pueblo', 'cosas', 'sentir', 'numeros', 'playa', 'mar', 'bosque', 'fauna', 'acciones', 'juegosparque', 'bichos', 'familia', 'cuerpo', 'ropa', 'rancho', 'huerta', 'tiempo', 'montana', 'faunamontana'];

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
    salta: { es: 'salta', en: 'jump!', topic: 'mascota', icon: 'salta', alt: 'brinca' },
    busca: { es: 'busca', en: 'find it! (sniff)', topic: 'mascota', icon: 'busca', alt: 'búscalo / búscala / busca busca' },
    gira: { es: 'gira', en: 'spin!', topic: 'mascota', icon: 'gira', alt: 'gira gira / da la vuelta / vuelta' },
    // ---- Los animales ----
    perro: { es: 'el perro', en: 'the dog', topic: 'animales', icon: 'perro', pl: 'perros', alt: 'perrito / perrita' },
    gato: { es: 'el gato', en: 'the cat', topic: 'animales', icon: 'gato', pl: 'gatos', alt: 'gatito / gatita / la gata' },
    mariposa: { es: 'la mariposa', en: 'the butterfly', topic: 'animales', icon: 'mariposa', pl: 'mariposas' },
    conejo: { es: 'el conejo', en: 'the rabbit', topic: 'animales', icon: 'conejo', pl: 'conejos', alt: 'conejito' },
    rana: { es: 'la rana', en: 'the frog', topic: 'animales', icon: 'rana', pl: 'ranas', alt: 'ranita' },
    pajaro: { es: 'el pájaro', en: 'the bird', topic: 'animales', icon: 'pajaro', pl: 'pájaros', alt: 'pajarito' },
    pez: { es: 'el pez', en: 'the fish', topic: 'animales', icon: 'pez', pl: 'peces', alt: 'pescado / pescadito / pececito' },
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
    uno: { es: 'uno', en: 'one', topic: 'numeros', icon: 'dado', n: 1, alt: 'una' }, // (una: "¿Cuántas conchas?" "Una.", src/listen.js)
    dos: { es: 'dos', en: 'two', topic: 'numeros', icon: 'dado', n: 2 },
    tres: { es: 'tres', en: 'three', topic: 'numeros', icon: 'dado', n: 3 },
    cuatro: { es: 'cuatro', en: 'four', topic: 'numeros', icon: 'dado', n: 4 },
    cinco: { es: 'cinco', en: 'five', topic: 'numeros', icon: 'dado', n: 5 },
    seis: { es: 'seis', en: 'six', topic: 'numeros', icon: 'dado', n: 6 },
    siete: { es: 'siete', en: 'seven', topic: 'numeros', icon: 'diez', n: 7 },
    ocho: { es: 'ocho', en: 'eight', topic: 'numeros', icon: 'diez', n: 8 },
    nueve: { es: 'nueve', en: 'nine', topic: 'numeros', icon: 'diez', n: 9 },
    diez: { es: 'diez', en: 'ten', topic: 'numeros', icon: 'diez', n: 10 },
    // ---- La playa (content/es/zone-playa.js): the sun, the sand and the sea; Mexican Spanish ----
    mar: { es: 'el mar', en: 'the sea', topic: 'playa', icon: 'mar' },
    arena: { es: 'la arena', en: 'the sand', topic: 'playa', icon: 'arena' }, // (shared with El parque de juegos: met in whichever comes first)
    ola: { es: 'la ola', en: 'the wave', topic: 'playa', icon: 'ola', pl: 'olas', alt: 'olita / las olas' },
    elsol: { es: 'el sol', en: 'the sun', topic: 'playa', icon: 'solgafas', alt: 'sol / solecito' }, // (its own picture: a sun in sunglasses; buenos días is the plain sun)
    concha: { es: 'la concha', en: 'the seashell', topic: 'playa', icon: 'concha', pl: 'conchas', alt: 'conchita / caracola' },
    cubetaarena: { es: 'la cubeta', en: 'the pail', topic: 'playa', icon: 'cubetaplaya', alt: 'cubetita / balde / cubo' },
    castillo: { es: 'el castillo', en: 'the sandcastle', topic: 'playa', icon: 'castillo', alt: 'castillo de arena / castillito' },
    helado: { es: 'el helado', en: 'the ice cream', topic: 'playa', icon: 'helado', pl: 'helados', alt: 'heladito / helados' },
    caliente: { es: 'caliente', en: 'hot', topic: 'playa', icon: 'caliente', alt: 'calor / hace calor / tengo calor / qué calor' },
    // ---- En el mar: the beach's animals (the album) and swimming ----
    cangrejo: { es: 'el cangrejo', en: 'the crab', topic: 'mar', icon: 'cangrejo', pl: 'cangrejos', alt: 'cangrejito' },
    estrellamar: { es: 'la estrella de mar', en: 'the starfish', topic: 'mar', icon: 'estrellamar', pl: 'estrellas de mar', alt: 'estrella / estrellita de mar / estrellita' },
    tortuga: { es: 'la tortuga', en: 'the turtle', topic: 'mar', icon: 'tortuga', pl: 'tortugas', alt: 'tortuguita / tortuguitas' },
    gaviota: { es: 'la gaviota', en: 'the seagull', topic: 'mar', icon: 'gaviota', pl: 'gaviotas' },
    nadar: { es: 'nadar', en: 'to swim', topic: 'mar', icon: 'nadar', alt: 'nada / nadan / a nadar / nadando' },
    medusa: { es: 'la medusa', en: 'the jellyfish', topic: 'mar', icon: 'medusa', pl: 'medusas', alt: 'aguamala' },
    delfin: { es: 'el delfín', en: 'the dolphin', topic: 'mar', icon: 'delfin', pl: 'delfines' },
    pulpo: { es: 'el pulpo', en: 'the octopus', topic: 'mar', icon: 'pulpo', pl: 'pulpos', alt: 'pulpito' },
    // ---- El bosque (content/es/zone-bosque.js): the woods, big and small; Mexican Spanish ----
    elbosque: { es: 'el bosque', en: 'the forest', topic: 'bosque', icon: 'bosque', alt: 'bosque / bosquecito' }, // (id: the zone's picture is called bosque)
    hoja: { es: 'la hoja', en: 'the leaf', topic: 'bosque', icon: 'hoja', pl: 'hojas', alt: 'hojita / hojitas' },
    hongo: { es: 'el hongo', en: 'the mushroom', topic: 'bosque', icon: 'hongo', pl: 'hongos', alt: 'honguito / champiñón' },
    tronco: { es: 'el tronco', en: 'the log', topic: 'bosque', icon: 'tronco', pl: 'troncos', alt: 'tronquito' },
    bellota: { es: 'la bellota', en: 'the acorn', topic: 'bosque', icon: 'bellota', pl: 'bellotas', alt: 'bellotita' },
    mora: { es: 'la mora', en: 'the blackberry', topic: 'bosque', icon: 'mora', pl: 'moras', alt: 'zarzamora / moritas / zarzamoras' },
    cueva: { es: 'la cueva', en: 'the cave', topic: 'bosque', icon: 'cueva', pl: 'cuevas' },
    grande: { es: 'grande', en: 'big', topic: 'bosque', icon: 'grande', alt: 'grandote / grandota / muy grande' },
    pequeno: { es: 'pequeño / pequeña', en: 'small', topic: 'bosque', icon: 'pequeno', alt: 'chiquito / chiquita / chico / chica / pequeñito' },
    // ---- Animales del bosque: the forest's animals (the album) ----
    oso: { es: 'el oso', en: 'the bear', topic: 'fauna', icon: 'oso', pl: 'osos', alt: 'osito / osa / osita' },
    ardilla: { es: 'la ardilla', en: 'the squirrel', topic: 'fauna', icon: 'ardilla', pl: 'ardillas', alt: 'ardillita' },
    mapache: { es: 'el mapache', en: 'the raccoon', topic: 'fauna', icon: 'mapache', pl: 'mapaches', alt: 'mapachito' },
    venado: { es: 'el venado', en: 'the deer', topic: 'fauna', icon: 'venado', pl: 'venados', alt: 'venadito / ciervo' },
    zorro: { es: 'el zorro', en: 'the fox', topic: 'fauna', icon: 'zorro', pl: 'zorros', alt: 'zorrito' },
    erizo: { es: 'el erizo', en: 'the hedgehog', topic: 'fauna', icon: 'erizo', pl: 'erizos', alt: 'ericito' },
    buho: { es: 'el búho', en: 'the owl', topic: 'fauna', icon: 'buho', pl: 'búhos', alt: 'tecolote / buhíto' },
    luciernaga: { es: 'la luciérnaga', en: 'the firefly', topic: 'fauna', icon: 'luciernaga', pl: 'luciérnagas', alt: 'luciernaguita' },
    // ---- ¡A jugar! (content/es/zone-juegos.js): action words, said to make someone DO it; Mexican Spanish ----
    // (salta and gira are the dog's tricks, met in Villa Sol or here: the park meets whichever isn't met yet)
    corre: { es: 'corre', en: 'run!', topic: 'acciones', icon: 'corre', alt: 'corran / córrele / correr / a correr' },
    sube: { es: 'sube', en: 'go up! / climb!', topic: 'acciones', icon: 'sube', alt: 'súbete / sube sube / subir / arriba' },
    baja: { es: 'baja', en: 'come down!', topic: 'acciones', icon: 'baja', alt: 'bájate / baja baja / bajar / abajo' },
    empuja: { es: 'empuja', en: 'push!', topic: 'acciones', icon: 'empuja', alt: 'empújalo / empújame / empujar / dale' },
    lanza: { es: 'lanza', en: 'throw!', topic: 'acciones', icon: 'lanza', alt: 'avienta / aviéntala / lánzala / tira / tírala' },
    atrapa: { es: 'atrapa', en: 'catch!', topic: 'acciones', icon: 'atrapa', alt: 'atrápala / atrápalas / cáchala / agarra' },
    baila: { es: 'baila', en: 'dance!', topic: 'acciones', icon: 'baila', alt: 'bailen / a bailar / bailar / bailando' },
    rapido: { es: 'rápido', en: 'fast', topic: 'acciones', icon: 'rapido', alt: 'rápida / rapidito / muy rápido / más rápido' },
    despacio: { es: 'despacio', en: 'slowly', topic: 'acciones', icon: 'despacio', alt: 'despacito / lento / lenta / lentito' },
    // ---- El parque de juegos: the playground's things ----
    columpio: { es: 'el columpio', en: 'the swing', topic: 'juegosparque', icon: 'columpio', pl: 'columpios', alt: 'columpios / columpiarse' },
    resbaladilla: { es: 'la resbaladilla', en: 'the slide', topic: 'juegosparque', icon: 'resbaladilla', pl: 'resbaladillas', alt: 'resbaladero / tobogán / resbaladilla' },
    subibaja: { es: 'el subibaja', en: 'the seesaw', topic: 'juegosparque', icon: 'subibaja', alt: 'sube y baja' },
    papalote: { es: 'el papalote', en: 'the kite', topic: 'juegosparque', icon: 'papalote', pl: 'papalotes', alt: 'papalotes / cometa' },
    burbujas: { es: 'las burbujas', en: 'the bubbles', topic: 'juegosparque', icon: 'burbujas', alt: 'burbuja / pompas / burbujitas' },
    cuerda: { es: 'la cuerda', en: 'the jump rope', topic: 'juegosparque', icon: 'cuerda', alt: 'cuerda de saltar / reata / la cuerdita' },
    // ---- Bichos del parque: the park's animals (the album) ----
    paloma: { es: 'la paloma', en: 'the pigeon', topic: 'bichos', icon: 'paloma', pl: 'palomas', alt: 'palomita / palomas' },
    catarina: { es: 'la catarina', en: 'the ladybug', topic: 'bichos', icon: 'catarina', pl: 'catarinas', alt: 'catarinita / mariquita' },
    hormiga: { es: 'la hormiga', en: 'the ant', topic: 'bichos', icon: 'hormiga', pl: 'hormigas', alt: 'hormiguita / hormigas' },
    abeja: { es: 'la abeja', en: 'the bee', topic: 'bichos', icon: 'abeja', pl: 'abejas', alt: 'abejita / abejas' },
    lagartija: { es: 'la lagartija', en: 'the lizard', topic: 'bichos', icon: 'lagartija', pl: 'lagartijas', alt: 'lagartijita / lagarto' },
    lombriz: { es: 'la lombriz', en: 'the worm', topic: 'bichos', icon: 'lombriz', pl: 'lombrices', alt: 'lombricita / gusano' },
    grillo: { es: 'el grillo', en: 'the cricket', topic: 'bichos', icon: 'grillo', pl: 'grillos', alt: 'grillito' },
    colibri: { es: 'el colibrí', en: 'the hummingbird', topic: 'bichos', icon: 'colibri', pl: 'colibríes', alt: 'colibríes / chuparrosa' },
    // ---- La familia (content/es/zone-abuelos.js): the child's own grandparents, the baby cousin; Mexican Spanish ----
    abuela: { es: 'la abuela', en: 'grandma', topic: 'familia', icon: 'abuela', alt: 'abuelita / mi abuela / nana' },
    abuelo: { es: 'el abuelo', en: 'grandpa', topic: 'familia', icon: 'abuelo', alt: 'abuelito / mi abuelo / tata' },
    bebe: { es: 'el bebé', en: 'the baby', topic: 'familia', icon: 'bebe', alt: 'la bebé / bebito / bebita / nene / beba' },
    familia: { es: 'la familia', en: 'the family', topic: 'familia', icon: 'familia', alt: 'mi familia / familia' },
    // ---- Mi cuerpo: touched, washed and said in Simón dice ----
    cabeza: { es: 'la cabeza', en: 'the head', topic: 'cuerpo', icon: 'cabeza', alt: 'cabecita / mi cabeza' },
    ojos: { es: 'los ojos', en: 'the eyes', topic: 'cuerpo', icon: 'ojos', alt: 'ojo / ojitos / mis ojos / el ojo' },
    nariz: { es: 'la nariz', en: 'the nose', topic: 'cuerpo', icon: 'nariz', alt: 'naricita / mi nariz / narices' },
    boca: { es: 'la boca', en: 'the mouth', topic: 'cuerpo', icon: 'boca', alt: 'boquita / mi boca' },
    mano: { es: 'la mano', en: 'the hand', topic: 'cuerpo', icon: 'mano', pl: 'manos', alt: 'manos / manita / manitas / mis manos' },
    pie: { es: 'el pie', en: 'the foot', topic: 'cuerpo', icon: 'pie', pl: 'pies', alt: 'pies / piecito / piecitos / mis pies' },
    // ---- La ropa: put on in the dressing-up trunk (and worn everywhere after) ----
    camisa: { es: 'la camisa', en: 'the shirt', topic: 'ropa', icon: 'camisa', pl: 'camisas', alt: 'playera / camiseta / blusa / camisita' },
    pantalon: { es: 'el pantalón', en: 'the trousers', topic: 'ropa', icon: 'pantalon', pl: 'pantalones', alt: 'pantalones / pants' },
    calcetines: { es: 'los calcetines', en: 'the socks', topic: 'ropa', icon: 'calcetines', alt: 'calcetín / el calcetín / calcetas / calcetitas' },
    vestido: { es: 'el vestido', en: 'the dress', topic: 'ropa', icon: 'vestido', pl: 'vestidos', alt: 'vestidito' },
    zapatos: { es: 'los zapatos', en: 'the shoes', topic: 'ropa', icon: 'zapatos', alt: 'zapato / el zapato / zapatitos / tenis' },
    sombrero: { es: 'el sombrero', en: 'the hat', topic: 'ropa', icon: 'sombrero', pl: 'sombreros', alt: 'sombrerito / sombreros' },
    chamarra: { es: 'la chamarra', en: 'the jacket', topic: 'ropa', icon: 'chamarra', alt: 'chaqueta / chamarrita / suéter' },
    // ---- En casa de los abuelos: their animals (the album) ----
    vaca: { es: 'la vaca', en: 'the cow', topic: 'rancho', icon: 'vaca', pl: 'vacas', alt: 'vaquita / vacas' },
    cerdo: { es: 'el cerdo', en: 'the pig', topic: 'rancho', icon: 'cerdo', pl: 'cerdos', alt: 'puerco / cochino / marrano / cochinito / cerdito / puerquito' },
    oveja: { es: 'la oveja', en: 'the sheep', topic: 'rancho', icon: 'oveja', pl: 'ovejas', alt: 'borrego / borrega / borreguito / ovejita' },
    burro: { es: 'el burro', en: 'the donkey', topic: 'rancho', icon: 'burro', pl: 'burros', alt: 'burrito / burra' },
    pavo: { es: 'el pavo', en: 'the turkey', topic: 'rancho', icon: 'pavo', pl: 'pavos', alt: 'guajolote / guajolota / pavito' },
    raton: { es: 'el ratón', en: 'the mouse', topic: 'rancho', icon: 'raton', pl: 'ratones', alt: 'ratoncito / ratones / ratita' },
    gallo: { es: 'el gallo', en: 'the rooster', topic: 'rancho', icon: 'gallo', pl: 'gallos', alt: 'gallito' },
    tlacuache: { es: 'el tlacuache', en: 'the possum', topic: 'rancho', icon: 'tlacuache', pl: 'tlacuaches', alt: 'tlacuachito / zarigüeya / tacuache' },
    // ---- La huerta: Abuelo's vegetable garden (picked for his basket, carried, asked for on his listen-and-do board).
    //      id zanahoria = the carrot picture's own name (same picture): the dog's carrot, Abuelo's and Don Lucho's are this word ----
    zanahoria: { es: 'la zanahoria', en: 'the carrot', topic: 'huerta', icon: 'zanahoria', pl: 'zanahorias', alt: 'zanahorias / zanahorita / zanahoritas' },
    elote: { es: 'el elote', en: 'the corn (on the cob)', topic: 'huerta', icon: 'elote', pl: 'elotes', alt: 'elotes / elotito / mazorca / el maíz / maíz' },
    jitomate: { es: 'el jitomate', en: 'the tomato', topic: 'huerta', icon: 'jitomate', pl: 'jitomates', alt: 'jitomates / tomate / tomates / jitomatito / el tomate' },
    // ---- ¿Qué tiempo hace? (content/es/zone-montana.js): the weather, changed at Mateo's weather station; Mexican Spanish.
    //      el sol (elsol) and caliente are the beach's words: the mountain meets them if they aren't met yet ----
    nieve: { es: 'la nieve', en: 'the snow', topic: 'tiempo', icon: 'nieve', alt: 'nieve / nevando / está nevando / la nevada' },
    frio: { es: 'frío / fría', en: 'cold', topic: 'tiempo', icon: 'frio', alt: 'hace frío / tengo frío / qué frío / el frío / friolento' },
    nube: { es: 'la nube', en: 'the cloud', topic: 'tiempo', icon: 'nube', pl: 'nubes', alt: 'nubes / nubecita / nublado / las nubes' },
    viento: { es: 'el viento', en: 'the wind', topic: 'tiempo', icon: 'viento', alt: 'hace viento / ventarrón / el aire / vientito' },
    lluvia: { es: 'la lluvia', en: 'the rain', topic: 'tiempo', icon: 'lluvia', alt: 'llueve / está lloviendo / lluvia / lloviendo' },
    arcoiris: { es: 'el arcoíris', en: 'the rainbow', topic: 'tiempo', icon: 'arcoiris', alt: 'arco iris / arcoiris / el arco iris' },
    // ---- La montaña: snow, the cold, what you wear for it (put on and worn everywhere, like the grandparents' clothes) ----
    lamontana: { es: 'la montaña', en: 'the mountain', topic: 'montana', icon: 'montana', pl: 'montañas', alt: 'montaña / montañas / el cerro / la sierra' },
    gorro: { es: 'el gorro', en: 'the winter hat', topic: 'montana', icon: 'gorro', pl: 'gorros', alt: 'gorrito / gorro de lana' },
    bufanda: { es: 'la bufanda', en: 'the scarf', topic: 'montana', icon: 'bufanda', pl: 'bufandas', alt: 'bufandita' },
    guantes: { es: 'los guantes', en: 'the gloves', topic: 'montana', icon: 'guantes', alt: 'guante / el guante / guantitos' },
    muneco: { es: 'el muñeco de nieve', en: 'the snowman', topic: 'montana', icon: 'muneco', alt: 'muñeco / mono de nieve / muñequito de nieve / el muñeco' },
    chocolate: { es: 'el chocolate', en: 'the hot chocolate', topic: 'montana', icon: 'chocolate', alt: 'chocolate caliente / chocolatito / un chocolate' },
    trineo: { es: 'el trineo', en: 'the sled', topic: 'montana', icon: 'trineo', pl: 'trineos', alt: 'trineos / el trineíto' },
    hielo: { es: 'el hielo', en: 'the ice', topic: 'montana', icon: 'hielo', alt: 'hielito / el hielo' },
    // ---- Animales de la montaña (the album) ----
    llama: { es: 'la llama', en: 'the llama', topic: 'faunamontana', icon: 'llama', pl: 'llamas', alt: 'llamas / llamita' },
    marmota: { es: 'la marmota', en: 'the marmot', topic: 'faunamontana', icon: 'marmota', pl: 'marmotas', alt: 'marmotas / marmotita' },
    zorrillo: { es: 'el zorrillo', en: 'the skunk', topic: 'faunamontana', icon: 'zorrillo', pl: 'zorrillos', alt: 'zorrillito / mofeta' },
    carpintero: { es: 'el pájaro carpintero', en: 'the woodpecker', topic: 'faunamontana', icon: 'carpintero', pl: 'pájaros carpinteros', alt: 'carpintero / el carpintero' },
    monarca: { es: 'la mariposa monarca', en: 'the monarch butterfly', topic: 'faunamontana', icon: 'monarca', pl: 'mariposas monarca', alt: 'monarca / la monarca / monarcas / mariposas monarca' },
    puma: { es: 'el puma', en: 'the puma', topic: 'faunamontana', icon: 'puma', pl: 'pumas', alt: 'pumita / león de montaña' },
    aguila: { es: 'el águila', en: 'the eagle', topic: 'faunamontana', icon: 'aguila', pl: 'águilas', alt: 'águila / aguilita / las águilas' },
    lobo: { es: 'el lobo', en: 'the wolf', topic: 'faunamontana', icon: 'lobo', pl: 'lobos', alt: 'lobito / lobos' },
  };
  // ---------- Phrases (docs/LEARNING_PLAN_2.md, Phase 2: "say it to get it"; src/phrases.js) ----------
  // A phrase is a FRAME with a SLOT for a word she knows: "Quiero ___" + el helado -> "Quiero un helado". Phrases are
  // learnable items like words (the same stages, boxes and history: src/words.js keeps their records apart, in
  // G.state.phrases), with their own cards (a speech bubble on the card). A phrase:
  //   es       the frame as written, ___ for the slot ('¿Dónde está ___?')
  //   en       for the grown-ups
  //   say      the frame's spoken forms the mic accepts, ' / '-separated, no slot (src/speech.js matchPhrase: fuzzy,
  //            articles / accents / ¿¡ ignored, any word order; "por favor" anywhere is the polite bonus)
  //   art      the slot's article: 'un' (Quiero un helado, Tengo una carta; a mass noun in C.mass goes bare: Quiero pan),
  //            'el' (¿Dónde está el gato? Me gusta el oso), '' (a name: Me llamo Luz)
  //   plural   the frame before a plural slot ('¿Dónde están ___?', 'Me gustan ___')
  //   prompt   what someone asks to get it said ('¿Qué quieres?')
  //   reply    what the one who hears it says in its introduction (src/phrases.js models it twice: Lola and Nico)
  //   icon     the card's slot picture until the phrase is used with a word (then the last word it was said with)
  //   anySlot  a name: the frame alone is the whole phrase (a name is often mis-heard), polite: this one IS "por favor"
  C.phrases = {
    f_llamo: { es: 'Me llamo ___', en: 'My name is ___', say: 'me llamo / mi nombre es / yo me llamo', art: '', prompt: '¿Y tú?', reply: '¡Hola!', icon: 'hola', anySlot: true },
    f_quiero: { es: 'Quiero ___', en: 'I want ___', say: 'quiero / yo quiero / quisiera / me das', art: 'un', prompt: '¿Qué quieres?', reply: '¡Aquí tienes!', icon: 'pan' },
    f_porfavor: { es: '___, por favor', en: '___, please', say: 'por favor', art: 'un', prompt: '¿Qué quieres?', reply: '¡Qué amable!', icon: 'porfavor', polite: true },
    f_donde: { es: '¿Dónde está ___?', en: 'Where is ___?', say: 'donde esta / donde estan / adonde esta / en donde esta', art: 'el', plural: '¿Dónde están ___?', prompt: '¿Qué buscas?', reply: '¡Ahí!', icon: 'lupa' },
    f_gusta: { es: 'Me gusta ___', en: 'I like ___', say: 'me gusta / me gustan / me encanta / me encantan', art: 'el', plural: 'Me gustan ___', prompt: '¿Qué te gusta?', reply: '¡A mí también!', icon: 'gracias' },
    f_tengo: { es: 'Tengo ___', en: 'I have ___', say: 'tengo / yo tengo / aquí tengo / te traigo', art: 'un', prompt: '¿Qué tienes?', reply: '¡Gracias!', icon: 'mano' },
  };
  C.phraseOrder = ['f_llamo', 'f_quiero', 'f_porfavor', 'f_donde', 'f_gusta', 'f_tengo']; // (the notebook's, the deck's and the grown-ups' order)
  C.mass = ['pan', 'agua', 'leche', 'queso', 'chocolate', 'arena', 'nieve', 'hielo']; // (said bare after quiero / tengo: Quiero pan)

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
    playa: { topic: 'playa', words: ['mar', 'concha', 'elsol', 'caliente', 'helado', 'arena', 'cubetaarena', 'castillo', 'ola'] },
    mar: { topic: 'mar', words: ['cangrejo', 'estrellamar', 'tortuga', 'gaviota', 'nadar', 'medusa', 'delfin', 'pulpo'] },
    bosque: { topic: 'bosque', words: ['elbosque', 'pequeno', 'grande', 'cueva', 'bellota', 'hoja', 'tronco', 'mora', 'hongo'] },
    fauna: { topic: 'fauna', words: ['oso', 'ardilla', 'mapache', 'venado', 'zorro', 'erizo', 'buho', 'luciernaga'] },
    acciones: { topic: 'acciones', words: ['corre', 'baila', 'sube', 'baja', 'rapido', 'despacio', 'empuja', 'lanza', 'atrapa'] },
    juegosparque: { topic: 'juegosparque', words: ['columpio', 'papalote', 'resbaladilla', 'subibaja', 'burbujas', 'cuerda'] },
    bichos: { topic: 'bichos', words: ['paloma', 'catarina', 'hormiga', 'abeja', 'lagartija', 'lombriz', 'grillo', 'colibri'] },
    familia: { topic: 'familia', words: ['abuela', 'familia', 'abuelo', 'bebe'] },
    cuerpo: { topic: 'cuerpo', words: ['mano', 'pie', 'nariz', 'ojos', 'boca', 'cabeza'] },
    ropa: { topic: 'ropa', words: ['camisa', 'pantalon', 'calcetines', 'vestido', 'zapatos', 'sombrero', 'chamarra'] },
    rancho: { topic: 'rancho', words: ['vaca', 'cerdo', 'oveja', 'burro', 'pavo', 'raton', 'gallo', 'tlacuache'] },
    huerta: { topic: 'huerta', words: ['zanahoria', 'elote', 'jitomate'] }, // (three words: its puzzle matches three, src/intro.js)
    tiempo: { topic: 'tiempo', words: ['nieve', 'frio', 'nube', 'viento', 'lluvia', 'arcoiris'] },
    montana: { topic: 'montana', words: ['lamontana', 'gorro', 'bufanda', 'guantes', 'muneco', 'chocolate', 'trineo', 'hielo'] },
    faunamontana: { topic: 'faunamontana', words: ['llama', 'marmota', 'zorrillo', 'carpintero', 'monarca', 'puma', 'aguila', 'lobo'] },
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
    playa: { '21,7': 'playa', '12,10': 'mar' }, // (La playa: by the lifeguard's tower, and in the middle of the beach)
    bosque: { '16,15': 'bosque', '22,6': 'fauna' }, // (El bosque: in the clearing, and in the meadow by the cave path)
    juegos: { '20,8': 'acciones', '27,4': 'juegosparque', '35,17': 'bichos' }, // (El parque de juegos: the playground, under the kite tree, the garden)
    abuelos: { '14,14': 'cuerpo', '29,13': 'rancho', '11,18': 'huerta' }, // (La casa de los abuelos: by the pump, by the paddock, by the garden beds)
    abuelos_casa: { '5,5': 'familia', '15,5': 'ropa' }, // (inside: under the family photos, in the bedroom)
    montana: { '10,19': 'tiempo', '13,10': 'montana', '29,19': 'faunamontana' }, // (La montaña: by the weather station, on the snowfield, by the llamas' corral)
  };

  // ---------- the 21 chapters, in order (docs/CURRICULUM.md section 4) ----------
  C.chapters = [
    { id: 'c1', title: '¡Un perro!', en: 'A dog! A puppy bursts in: {dog} becomes yours', giver: 'mama', session: 1, words: ['hola', 'perro', 'guau', 'ven'], icon: 'perro', col: '#b87038', goal: [['perro', 1]] },
    { id: 'c2', title: 'El gato de la cerca', en: 'The cat on the fence: Nico\'s sound game', giver: 'nico', session: 1, words: ['gato', 'miau'], icon: 'gato', col: '#e8902c', goal: [['gato', 1]] },
    { id: 'c3', title: '¡Buenos días, {dog}!', en: 'Good morning, {dog}! A bone for sitting', giver: 'mama', session: 2, words: ['buenosdias', 'hueso', 'sientate'], icon: 'sol', col: '#e8b820', when: 'morning', goal: [['hueso', 1], ['sientate', 1]] },
    { id: 'c4', title: 'El juego de Don Pepe', en: 'Don Pepe\'s yes-or-no game, and an apple', giver: 'pepe', session: 2, words: ['si', 'no', 'manzana'], icon: 'manzana', col: '#d83838', goal: [['si', 1], ['no', 1], ['manzana', 1]] },
    { id: 'c5', title: 'La pelota roja', en: 'The red ball: find Sofía\'s ball', giver: 'sofia', session: 3, words: ['pelota', 'rojo'], icon: 'pelota', col: '#3a78e0', goal: [['pelota', 1]] },
    { id: 'c6', title: 'Pan para los patos', en: 'Bread for the ducks: the bakery, then the farm pond', giver: 'marta', session: 3, words: ['pan', 'gracias', 'pato', 'cuac'], icon: 'pan', col: '#c88838', goal: [['pan', 1], '>', ['pato', 1]] },
    { id: 'c7', title: '¿Dónde está {dog}?', en: 'Where is {dog}? Four clues, four places', giver: 'mama', session: 4, words: ['parque', 'banco', 'fuente', 'granja', 'cabra'], icon: 'huella', col: '#8a5a2c', when: 'morning', goal: [['perro', 1], ['pregunta', 1]] },
    { id: 'c8', title: 'La escuela de Luna', en: 'Profesora Luna\'s school: ask three friends how they are', giver: 'mama', session: 5, words: ['escuela', 'bien', 'comoestas'], icon: 'escuela', col: '#3a7ad0', when: 'morning', goal: [['escuela', 1], ['pregunta', 3]] },
    { id: 'c9', title: '¡Buenas noches, {dog}!', en: 'Good night, {dog}! The first evening at home', giver: 'mama', session: 5, words: ['agua', 'cama', 'buenasnoches'], icon: 'noche', col: '#3a3a9a', when: 'evening', goal: [['agua', 1], ['cama', 1]] },
    { id: 'c10', title: 'Tomás está cansado', en: 'Tired Tomás: three letters, and a horse who eats one', giver: 'tomas', session: 6, words: ['cansado', 'carta', 'casa', 'caballo', 'adios'], icon: 'carta', col: '#2a9a9a', goal: [['carta', 3]] },
    { id: 'c11', title: 'Los huevos de Rosa', en: 'Grandma Rosa\'s hens and eggs', giver: 'rosa', session: 7, words: ['gallina', 'huevo', 'uno', 'dos', 'blanco'], icon: 'huevo', col: '#d8c8a0', goal: [['huevo', 2]] },
    { id: 'c12', title: 'El mercado de Mamá', en: 'Mom\'s shopping list at Don Pepe\'s', giver: 'mama', session: 8, words: ['platano', 'naranja', 'porfavor', 'tres', 'cuatro'], icon: 'platano', col: '#e8a030', goal: [['platano', 3], ['naranja', 4]] },
    { id: 'c13', title: 'El día de campo', en: 'Grandma Rosa\'s picnic', giver: 'rosa', session: 9, words: ['panaderia', 'queso', 'leche', 'cinco', 'seis'], icon: 'canasta', col: '#e05a30', goal: [['canasta', 1]] },
    { id: 'c14', title: 'El show de perros', en: 'Sofía\'s dog show', giver: 'sofia', session: 10, words: ['pata', 'salta', 'galleta', 'azul', 'feliz'], icon: 'cinta', col: '#3a56c8', goal: [['pata', 1], ['salta', 1], ['cinta', 1]] },
    { id: 'c15', title: 'Las flores de Lucía', en: 'Lucía\'s flowers', giver: 'lucia', session: 11, words: ['triste', 'flor', 'rosa', 'amarillo', 'mariposa'], icon: 'flor', col: '#e060a0', goal: [['flor', 3]] },
    { id: 'c16', title: 'Las páginas perdidas', en: 'The lost notebook pages: {dog} learns ¡busca!', giver: 'gomez', session: 12, words: ['biblioteca', 'busca', 'arbol', 'conejo'], icon: 'pagina', col: '#7a5a3a', goal: [['pagina', 3]] },
    { id: 'c17', title: '¿Qué dicen?', en: 'Nico\'s sound game around town', giver: 'nico', session: 13, words: ['rana', 'croac', 'verde', 'pajaro', 'gira'], icon: 'nota', col: '#e0a020', goal: [['nota', 1]] },
    { id: 'c18', title: '¿Cuántos animales?', en: 'Count the animals of Villa Sol with Profesora Luna', giver: 'luna', session: 14, words: ['pez', 'siete', 'ocho'], icon: 'pez', col: '#8a50c8', goal: [['pez', 1], ['pregunta', 1]] },
    { id: 'c19', title: '¡Todos a la granja!', en: 'Call every animal to the farm', giver: 'luna', session: 15, words: ['nueve', 'diez'], icon: 'diez', col: '#5a9a30', when: 'morning', goal: [['granja', 1]] },
    { id: 'c20', title: 'Preparamos la fiesta', en: 'Getting the party ready', giver: 'luna', session: 16, words: [], icon: 'estrella', col: '#c03030', goal: [['carta', 5]] },
    { id: 'c21', title: 'La fiesta de los animales', en: 'The animal party', giver: 'luna', session: 17, words: [], icon: 'estrella', col: '#f0a020', when: 'morning', goal: [['estrella', 1]] },
  ];
  C.chapters.forEach((c, i) => { c.n = i + 1; });
})();
