// ===== Villa Sol: maps, townsfolk and errands (original content) =====
// Dialogue is written as T('Spanish', 'English help'). Kids read the Spanish; holding C shows the English.
'use strict';
(function () {
  const MD = G.MAPDATA, F = () => G.state.flags, S = G.st;
  const P = (m, tag) => MD[m].pos[tag];
  const T = (t, en) => ({ t, en });
  const W = id => G.data.words[id];

  // ---------- helpers ----------
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who) }); }
  const opts = list => list.map(([label, en, icon]) => ({ label, en, icon }));
  function* ask(who, prompt, en, choices, answer, extra = {}) {
    return yield* G.ask(Object.assign({ prompt, en, choices: opts(choices), answer, who, layout: 'list' }, extra));
  }
  function* newQuest(id) {
    S.startQuest(id); G.audio.sfx('buff');
    const q = G.data.quests[id];
    yield G.say(T('Misión nueva: ' + q.name + '. ' + q.goal, 'New errand: ' + q.en + '. ' + q.goalEn), { noVoice: true });
  }
  function* finishQuest(id) { S.finishQuest(id); yield G.badge(id); }
  const ball = col => ({ icon: 'pelota', col: W(col).col });
  // after the greetings errand, the three town errands open up (any order)
  const townOpen = () => S.done('saludos');
  const allBadges = () => ['saludos', 'mercado', 'pelota', 'carta'].every(S.done);

  // ================= VILLA SOL =================
  const v = MD.villa;
  const door = (tag, to, tx, ty) => { const [x, y] = P('villa', tag); return { x, y, to, tx, ty, dir: 'up' }; };
  G.maps.villa = {
    name: 'Villa Sol', rows: v.rows, music: 'town',
    exits: [
      door('casaDoor', 'casa', 4, 5),
      door('escuelaDoor', 'escuela', 6, 8),
      door('rosaDoor', 'rosa', 4, 5),
      door('panaderiaDoor', 'panaderia', 5, 6),
      door('bibliotecaDoor', 'biblioteca', 5, 7),
    ],
    npcs: [
      // --- Don Pepe at the fruit stall (talk to him across the stall) ---
      { id: 'pepe', npc: 'pepe', x: P('villa', 'pepe')[0], y: P('villa', 'pepe')[1], dir: 'down', fixed: true,
        alert: () => S.active('mercado') && !F().compra,
        talk: function* () { yield* pepeTalk(); } },
      // --- Tomás the mail carrier, near the fountain ---
      { id: 'tomas', npc: 'tomas', x: 20, y: 12, dir: 'down', wander: 2,
        alert: () => townOpen() && (!S.quest('carta') || (F().cartaDada && !S.done('carta'))),
        talk: function* () { yield* tomasTalk(); } },
      // --- greeting practice: Señor Gómez, Lucía, Nico ---
      { id: 'gomez', npc: 'gomez', x: 8, y: 11, dir: 'right', wander: 1,
        alert: () => S.active('saludos') && !F().sal_gomez,
        talk: function* () { yield* greet('gomez'); } },
      { id: 'lucia', npc: 'lucia', x: 27, y: 12, dir: 'left', wander: 2,
        alert: () => S.active('saludos') && !F().sal_lucia,
        talk: function* () { yield* greet('lucia'); } },
      { id: 'nico', npc: 'nico', x: 15, y: 15, dir: 'down', wander: 2,
        alert: () => S.active('saludos') && !F().sal_nico,
        talk: function* () { yield* greet('nico'); } },
      // --- Sofía in the park ---
      { id: 'sofia', npc: 'sofia', x: P('villa', 'sofia')[0], y: P('villa', 'sofia')[1], dir: 'down',
        alert: () => townOpen() && (!S.quest('pelota') || (F().pelotaRoja && !S.done('pelota'))),
        talk: function* () { yield* sofiaTalk(); } },
      // --- Canelo the dog ---
      { id: 'canelo', npc: 'canelo', x: 19, y: 9, dir: 'left', wander: 3,
        talk: function* () { G.audio.sfx('select'); yield G.say(T('¡Guau, guau!', 'Woof, woof!'), { name: 'Canelo' }); yield G.say(T('Canelo es un perro muy simpático.', 'Canelo is a very friendly dog.')); } },
    ],
    searches: {
      [P('villa', 'fuente').join(',')]: { text: T('Es la fuente de la plaza. El agua está fresca.', 'It\'s the fountain in the square. The water is cool.') },
      [P('villa', 'arbusto1').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('azul'); }, emptyText: T('Aquí hay una pelota azul.', 'There is a blue ball here.') },
      [P('villa', 'arbusto2').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('verde'); }, emptyText: T('Aquí hay una pelota verde.', 'There is a green ball here.') },
      [P('villa', 'arbusto3').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('amarillo'); }, emptyText: T('Aquí hay una pelota amarilla.', 'There is a yellow ball here.') },
      [P('villa', 'arbusto4').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('rojo'); }, emptyText: T('Ya tienes la pelota roja.', 'You already have the red ball.') },
    },
  };

  // ---------- Errand 1: Saludos ----------
  function* greet(who) {
    if (!S.active('saludos') || F()['sal_' + who]) {
      const idle = {
        gomez: [T('¡Hola, Alex! Hace sol hoy.', 'Hello, Alex! It\'s sunny today.')],
        lucia: [T('Me gusta la plaza. ¡Es bonita!', 'I like the square. It\'s pretty!')],
        nico: [T('¿Vas al parque? ¡Yo también!', 'Are you going to the park? Me too!')],
      }[who];
      if (S.done('saludos') && !allBadges()) idle.push(T('¡Adiós!', 'Goodbye!'));
      yield* say(who, ...idle); return;
    }
    if (who === 'gomez') {
      yield* say('gomez', T('¡Buenos días, Alex!', 'Good morning, Alex!'));
      yield* ask('gomez', 'El Señor Gómez dice: «¡Buenos días!» ¿Qué dices tú?', 'Mr. Gómez says "Good morning!" What do you say?',
        [['¡Buenos días!', 'Good morning!'], ['¡Adiós!', 'Goodbye!'], ['Plátano.', 'Banana.']], 0, { word: 'buenosdias' });
      yield* say('gomez', T('¡Qué educado! ¡Muy bien!', 'How polite! Very good!'));
    } else if (who === 'lucia') {
      yield* say('lucia', T('¡Hola, Alex! ¿Cómo estás?', 'Hi, Alex! How are you?'));
      yield* ask('lucia', 'Lucía pregunta: «¿Cómo estás?»', 'Lucía asks "How are you?"',
        [['¡Adiós!', 'Goodbye!'], ['Bien, gracias.', 'Fine, thank you.'], ['Uno, dos, tres.', 'One, two, three.']], 1, { word: ['comoestas', 'bien'] });
      yield* say('lucia', T('¡Yo también estoy bien!', 'I\'m fine too!'));
    } else {
      yield G.say(T('Nico te mira y sonríe. ¿Qué dices?', 'Nico looks at you and smiles. What do you say?'));
      yield* ask('nico', 'Saluda a Nico.', 'Say hello to Nico.',
        [['¡Gracias!', 'Thank you!'], ['Por favor.', 'Please.'], ['¡Hola!', 'Hello!']], 2, { word: 'hola' });
      yield* say('nico', T('¡Hola! Me llamo Nico. ¡Encantado!', 'Hi! My name is Nico. Nice to meet you!'));
    }
    F()['sal_' + who] = true;
    const n = ['gomez', 'lucia', 'nico'].filter(k => F()['sal_' + k]).length;
    G.toast('Saludos: ' + n + '/3', 90);
    if (n === 3) yield G.say(T('¡Ya saludaste a tres personas! Vuelve con la Profesora Luna en la escuela.', 'You greeted three people! Go back to Profesora Luna at the school.'), { noVoice: true });
  }

  // ---------- Errand 2: El mercado ----------
  function* pepeTalk() {
    if (!F().pepeFrutas) {
      F().pepeFrutas = true;
      yield* say('pepe', T('¡Buenos días! Soy Don Pepe. ¡Tengo fruta muy rica!', 'Good morning! I\'m Don Pepe. I have very tasty fruit!'));
      yield* say('pepe', T('Mira: naranjas y uvas.', 'Look: oranges and grapes.'));
      yield G.teach(['manzana', 'platano', 'naranja', 'uvas']);
    }
    if (!S.active('mercado') || F().compra) {
      yield* say('pepe', S.done('mercado') ? T('¡Saludos a la abuela Rosa!', 'Say hi to Grandma Rosa for me!') : T('¡Fruta fresca! ¡Fruta rica!', 'Fresh fruit! Tasty fruit!'));
      return;
    }
    yield* say('pepe', T('¿Qué quieres?', 'What would you like?'));
    yield G.say(T('La lista de la abuela dice: «tres manzanas y dos plátanos».', 'Grandma\'s list says: "three apples and two bananas".'), { noVoice: true });
    const fruits = ['manzana', 'platano', 'naranja', 'uvas'];
    const buy = [['manzana', 'tres', 'manzanas', 'apples', '¿Cuántas?'], ['platano', 'dos', 'plátanos', 'bananas', '¿Cuántos?']];
    for (const [fruit, num, pl, plEn, howMany] of buy) {
      const c = G.wordChoices(fruit, fruits, 4, { noLabel: true });
      yield* G.ask({ prompt: '¿Cuál es ' + W(fruit).es + '?', en: 'Which one is ' + W(fruit).en + '?', choices: c.choices, answer: c.answer, layout: 'cards', word: fruit, who: 'pepe' });
      const d = G.wordChoices(num, G.data.numberWords, 4, { noLabel: true });
      yield* G.ask({ prompt: howMany + ' ¡' + W(num).es[0].toUpperCase() + W(num).es.slice(1) + ' ' + pl + '!', en: 'How many? ' + W(num).en[0].toUpperCase() + W(num).en.slice(1) + ' ' + plEn + '!', choices: d.choices, answer: d.answer, layout: 'cards', word: num, who: 'pepe' });
    }
    yield* say('pepe', T('Aquí tienes: tres manzanas y dos plátanos.', 'Here you go: three apples and two bananas.'));
    yield* ask('pepe', '¿Qué dices a Don Pepe?', 'What do you say to Don Pepe?',
      [['¡Hola!', 'Hello!'], ['Cuatro.', 'Four.'], ['¡Gracias!', 'Thank you!']], 2, { word: 'gracias' });
    yield* say('pepe', T('¡De nada! ¡Adiós!', 'You\'re welcome! Goodbye!'));
    F().compra = true;
    yield G.say(T('Lleva la fruta a la casa de la abuela Rosa.', 'Take the fruit to Grandma Rosa\'s house.'), { noVoice: true });
  }

  // ---------- Errand 3: La pelota roja ----------
  function* sofiaTalk() {
    if (!townOpen()) { yield* say('sofia', T('¡Hola! ¿Eres nuevo en el club? ¿O nueva?', 'Hi! Are you new to the club?')); return; }
    if (!S.quest('pelota')) {
      yield* say('sofia', T('¡Hola, Alex! Este es el parque.', 'Hi, Alex! This is the park.'));
      yield G.teach('parque');
      yield* say('sofia', T('Pero estoy triste... ¡No encuentro mi pelota roja!', 'But I\'m sad... I can\'t find my red ball!'),
        T('Hay muchas pelotas en el parque: rojas, azules, verdes y amarillas.', 'There are lots of balls in the park: red, blue, green and yellow.'));
      yield G.teach(['rojo', 'azul', 'verde', 'amarillo']);
      yield* say('sofia', T('Busca en los arbustos, por favor. ¡Mi pelota es roja!', 'Please look in the bushes. My ball is red!'));
      yield* newQuest('pelota');
      yield G.say(T('Párate frente a un arbusto y presiona A para buscar.', 'Stand in front of a bush and press A to search.'), { noVoice: true });
      return;
    }
    if (S.done('pelota')) { yield* say('sofia', T('¡Me encanta mi pelota roja! ¡Gracias, Alex!', 'I love my red ball! Thanks, Alex!')); return; }
    if (!F().pelotaRoja) { yield* say('sofia', T('¿La encontraste? Mi pelota es roja. Busca en los arbustos.', 'Did you find it? My ball is red. Look in the bushes.')); return; }
    yield* say('sofia', T('¡Mi pelota roja! ¡Muchas gracias!', 'My red ball! Thank you so much!'));
    yield* G.ask({ prompt: 'Sofía pregunta: «¿De qué color es la manzana?»', en: 'Sofía asks: "What color is the apple?"', show: W('manzana'),
      choices: opts([['azul', 'blue'], ['rojo', 'red'], ['verde', 'green']]), answer: 1, layout: 'list', word: 'rojo', who: 'sofia' });
    yield* say('sofia', T('¡Sí! La manzana es roja, como mi pelota.', 'Yes! The apple is red, like my ball.'));
    yield* finishQuest('pelota');
  }
  function* findBall(col) {
    G.audio.sfx('chest');
    yield G.say(T('¡Hay una pelota en el arbusto!', 'There\'s a ball in the bush!'));
    const others = ['rojo', 'azul', 'verde', 'amarillo'];
    const c = G.wordChoices(col, others, 4, { noIcon: true, label: id => W(id).es.split(' / ')[0] });
    yield* G.ask({ prompt: '¿De qué color es?', en: 'What color is it?', show: ball(col), choices: c.choices, answer: c.answer, layout: 'list', word: col });
    if (col === 'rojo') {
      F().pelotaRoja = true; G.audio.jingle('item');
      yield G.say(T('¡Es roja! ¡Es la pelota de Sofía!', 'It\'s red! It\'s Sofía\'s ball!'));
    } else {
      const name = { azul: 'azul', verde: 'verde', amarillo: 'amarilla' }[col];
      yield G.say(T('Es una pelota ' + name + '. No es roja.', 'It\'s a ' + W(col).en + ' ball. It isn\'t red.'));
    }
  }

  // ---------- Errand 4: La carta ----------
  function* tomasTalk() {
    if (!townOpen()) { yield* say('tomas', T('¡Hola! Soy Tomás, el cartero. ¡Mucho trabajo hoy!', 'Hi! I\'m Tomás, the mail carrier. Lots of work today!')); return; }
    if (!S.quest('carta')) {
      yield* say('tomas', T('¡Hola, Alex! Soy Tomás, el cartero.', 'Hi, Alex! I\'m Tomás, the mail carrier.'),
        T('Tengo una carta para la panadería, pero... ¡tengo muchas cartas!', 'I have a letter for the bakery, but... I have so many letters!'));
      yield G.teach(['carta', 'panaderia']);
      yield* say('tomas', T('¿Llevas la carta a la panadería, por favor?', 'Will you take the letter to the bakery, please?'),
        T('Mira el nombre de cada edificio cuando entras.', 'Look at the name of each building when you go in.'));
      yield* newQuest('carta');
      return;
    }
    if (S.done('carta')) { yield* say('tomas', T('¡Eres un gran cartero! ¡Gracias!', 'You make a great mail carrier! Thanks!')); return; }
    if (!F().cartaDada) { yield* say('tomas', T('La carta es para la panadería. ¡Tiene pan!', 'The letter is for the bakery. It has bread!')); return; }
    yield* say('tomas', T('¿Ya llevaste la carta?', 'Did you deliver the letter already?'));
    yield* G.ask({ prompt: 'Tomás pregunta: «¿Dónde está la carta ahora?»', en: 'Tomás asks: "Where is the letter now?"', show: W('carta'),
      choices: opts([['en la biblioteca', 'in the library', W('biblioteca')], ['en la panadería', 'in the bakery', W('panaderia')], ['en el parque', 'in the park', W('parque')]]),
      answer: 1, layout: 'list', word: 'panaderia', who: 'tomas' });
    yield* say('tomas', T('¡Perfecto! ¡Muchas gracias, Alex!', 'Perfect! Thank you very much, Alex!'));
    yield* finishQuest('carta');
  }

  // ================= INTERIORS =================
  const back = (tag) => { const [x, y] = P('villa', tag); return { to: 'villa', tx: x, ty: y + 1, dir: 'down' }; };
  const exitAt = (m, tag) => Object.assign({ x: P(m, 'door')[0], y: P(m, 'door')[1] }, back(tag));

  // ---------- Mi casa ----------
  G.maps.casa = {
    name: 'Mi casa', rows: MD.casa.rows, music: 'headquarters',
    exits: [Object.assign(exitAt('casa', 'casaDoor'), {
      run: function* () {
        if (F().intro) return true;
        yield* say('mama', T('¡Espera, Alex! Antes de salir...', 'Wait, Alex! Before you go...')); G.field.player.dir = 'up'; return false;
      } })],
    npcs: [
      { id: 'mama', npc: 'mama', x: P('casa', 'mama')[0], y: P('casa', 'mama')[1], dir: 'down', fixed: true,
        alert: () => !F().intro,
        talk: function* () {
          if (!F().intro) { yield* G.story.mamaIntro(); return; }
          if (allBadges() && !S.done('fiesta')) yield* say('mama', T('¿Hoy es la fiesta del club? ¡Qué bien!', 'The club party is today? How nice!'));
          else if (S.done('fiesta')) yield* say('mama', T('¡Estoy muy orgullosa de ti, Alex!', 'I\'m very proud of you, Alex!'));
          else yield* say('mama', T('¿Qué tal el club? ¡Habla con todos en español!', 'How is the club? Talk to everyone in Spanish!'));
        } },
    ],
  };

  // ---------- La escuela (club) ----------
  G.maps.escuela = {
    name: 'La escuela', rows: MD.escuela.rows, music: 'church',
    exits: [exitAt('escuela', 'escuelaDoor')],
    npcs: [
      { id: 'luna', npc: 'luna', x: P('escuela', 'luna')[0], y: P('escuela', 'luna')[1], dir: 'down', fixed: true,
        alert: () => !S.quest('saludos') || (S.active('saludos') && ['gomez', 'lucia', 'nico'].every(k => F()['sal_' + k])) || (allBadges() && !S.done('fiesta')),
        talk: function* () { yield* lunaTalk(); } },
      { id: 'kid1', npc: 'nico', x: 3, y: 5, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Qué fiesta tan divertida!', 'What a fun party!')] },
      { id: 'kid2', npc: 'lucia', x: 9, y: 5, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Felicidades, Alex!', 'Congratulations, Alex!')] },
      { id: 'kid3', npc: 'sofia', x: 9, y: 7, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Mira mi pelota roja!', 'Look at my red ball!')] },
    ],
  };
  function* lunaTalk() {
    if (!S.quest('saludos')) {
      yield* say('luna', T('¡Hola! Soy la Profesora Luna. ¡Te damos la bienvenida al Club de Español!', 'Hello! I\'m Profesora Luna. Welcome to the Spanish Club!'),
        T('Estamos en la escuela. Aquí aprendemos español.', 'We are at the school. Here we learn Spanish.'));
      yield G.teach('escuela');
      yield* say('luna', T('Primero, los saludos. Mira estas palabras.', 'First, greetings. Look at these words.'));
      yield G.teach(['hola', 'comoestas', 'bien', 'gracias']);
      yield* say('luna', T('Vamos a practicar. ¿Cómo estás, Alex?', 'Let\'s practice. How are you, Alex?'));
      yield* ask('luna', 'La profesora pregunta: «¿Cómo estás?»', 'The teacher asks "How are you?"',
        [['Bien, gracias.', 'Fine, thank you.'], ['¡Adiós!', 'Goodbye!'], ['Manzana.', 'Apple.']], 0, { word: ['comoestas', 'bien'] });
      yield* say('luna', T('¡Muy bien! Ahora, sal al pueblo y saluda a tres personas.', 'Very good! Now go out into town and greet three people.'),
        T('Busca a las personas con el signo «!».', 'Look for the people with the "!" sign.'));
      yield* newQuest('saludos');
      return;
    }
    if (S.active('saludos')) {
      if (!['gomez', 'lucia', 'nico'].every(k => F()['sal_' + k])) { yield* say('luna', T('Saluda a tres personas del pueblo. ¡Tú puedes!', 'Greet three people in town. You can do it!')); return; }
      yield* say('luna', T('¡Saludaste a tres personas! ¡Fantástico!', 'You greeted three people! Fantastic!'));
      yield* finishQuest('saludos');
      yield* say('luna', T('El pueblo necesita tu ayuda. La abuela Rosa, Sofía y Tomás te buscan.', 'The town needs your help. Grandma Rosa, Sofía and Tomás are looking for you.'),
        T('La casa de la abuela Rosa está al lado de la plaza. Sofía está en el parque, y Tomás, en la plaza.', 'Grandma Rosa\'s house is next to the square. Sofía is in the park, and Tomás is in the square.'));
      return;
    }
    if (!allBadges()) {
      const left = ['mercado', 'pelota', 'carta'].filter(q => !S.done(q)).length;
      const es = left === 1 ? 'una misión' : W(G.data.numberWords[left - 1]).es + ' misiones', en = left === 1 ? 'one errand' : W(G.data.numberWords[left - 1]).en + ' errands';
      yield* say('luna', T('Ayuda a la gente del pueblo. Te falta' + (left === 1 ? ' ' : 'n ') + es + '.', 'Help the people in town. You have ' + en + ' left.'));
      return;
    }
    if (!S.done('fiesta')) { yield* G.story.fiesta(); return; }
    yield* say('luna', T('¡Eres una estrella del Club de Español! Vuelve cuando quieras.', 'You\'re a Spanish Club star! Come back any time.'));
  }

  // ---------- Casa de la abuela Rosa ----------
  G.maps.rosa = {
    name: 'La casa de la abuela Rosa', rows: MD.rosa.rows, music: 'inn',
    exits: [exitAt('rosa', 'rosaDoor')],
    npcs: [
      { id: 'rosa', npc: 'rosa', x: P('rosa', 'rosa')[0], y: P('rosa', 'rosa')[1], dir: 'down', fixed: true,
        alert: () => townOpen() && (!S.quest('mercado') || (F().compra && !S.done('mercado'))),
        talk: function* () { yield* rosaTalk(); } },
    ],
  };
  function* rosaTalk() {
    if (!F().rosaCasa) { F().rosaCasa = true; yield* say('rosa', T('¡Hola, cariño! Esta es mi casa.', 'Hello, dear! This is my house.')); yield G.teach('casa'); }
    if (!townOpen()) { yield* say('rosa', T('Primero ve a la escuela con la Profesora Luna.', 'First go to the school to see Profesora Luna.')); return; }
    if (!S.quest('mercado')) {
      yield* say('rosa', T('Alex, ¿me ayudas, por favor?', 'Alex, will you help me, please?'));
      yield G.teach('porfavor');
      yield* say('rosa', T('Necesito fruta del mercado. Vamos a contar: uno, dos, tres, cuatro, cinco.', 'I need fruit from the market. Let\'s count: one, two, three, four, five.'));
      yield G.teach(['uno', 'dos', 'tres', 'cuatro', 'cinco']);
      yield* say('rosa', T('Necesito tres manzanas y dos plátanos. Don Pepe vende fruta en la plaza.', 'I need three apples and two bananas. Don Pepe sells fruit in the square.'));
      yield* newQuest('mercado');
      return;
    }
    if (S.done('mercado')) { yield* say('rosa', T('Las manzanas están muy ricas. ¡Gracias, cariño!', 'The apples are delicious. Thank you, dear!')); return; }
    if (!F().compra) { yield* say('rosa', T('Tres manzanas y dos plátanos, por favor. Don Pepe está en la plaza.', 'Three apples and two bananas, please. Don Pepe is in the square.')); return; }
    yield* say('rosa', T('¡Ay, qué bien! ¡La fruta!', 'Oh, wonderful! The fruit!'));
    const c = G.wordChoices('dos', G.data.numberWords, 3);
    c.choices.forEach(ch => { ch.icon = null; });
    yield* G.ask({ prompt: 'La abuela pregunta: «¿Cuántos plátanos hay?»', en: 'Grandma asks: "How many bananas are there?"', show: W('platano'), choices: c.choices, answer: c.answer, layout: 'list', word: 'dos', who: 'rosa' });
    yield* say('rosa', T('¡Sí, dos plátanos! Eres muy inteligente. ¡Muchas gracias!', 'Yes, two bananas! You\'re very clever. Thank you so much!'));
    yield* finishQuest('mercado');
  }

  // ---------- La panadería ----------
  G.maps.panaderia = {
    name: 'La panadería', rows: MD.panaderia.rows, music: 'inn',
    exits: [exitAt('panaderia', 'panaderiaDoor')],
    npcs: [
      { id: 'marta', npc: 'marta', x: P('panaderia', 'marta')[0], y: P('panaderia', 'marta')[1], dir: 'down', fixed: true,
        alert: () => S.active('carta') && !F().cartaDada,
        talk: function* () {
          if (!F().martaPan) { F().martaPan = true; yield* say('marta', T('¡Hola! Bienvenidos a la panadería. ¡Huele a pan!', 'Hello! Welcome to the bakery. It smells like bread!')); yield G.teach('pan'); }
          if (S.active('carta') && !F().cartaDada) {
            yield* say('marta', T('¿Una carta? ¿Para mí? ¡Qué sorpresa!', 'A letter? For me? What a surprise!'));
            yield* G.ask({ prompt: 'Marta te da algo. ¿Qué es?', en: 'Marta gives you something. What is it?', show: W('pan'),
              choices: opts([['la carta', 'the letter'], ['la casa', 'the house'], ['el pan', 'the bread']]), answer: 2, layout: 'list', word: 'pan', who: 'marta' });
            yield* say('marta', T('¡Sí! Es pan para ti. ¡Gracias por la carta!', 'Yes! It\'s bread for you. Thanks for the letter!'), T('Ahora, vuelve con Tomás.', 'Now go back to Tomás.'));
            F().cartaDada = true;
            return;
          }
          yield* say('marta', T('¿Quieres pan? ¡Está calentito!', 'Would you like some bread? It\'s nice and warm!'));
        } },
    ],
  };

  // ---------- La biblioteca ----------
  G.maps.biblioteca = {
    name: 'La biblioteca', rows: MD.biblioteca.rows, music: 'castle',
    exits: [exitAt('biblioteca', 'bibliotecaDoor')],
    npcs: [
      { id: 'ines', npc: 'ines', x: P('biblioteca', 'ines')[0], y: P('biblioteca', 'ines')[1], dir: 'down', fixed: true,
        talk: function* () {
          if (!F().inesLibros) { F().inesLibros = true; yield* say('ines', T('Shhh... ¡Hola! Esta es la biblioteca. Aquí hay muchos libros.', 'Shhh... Hello! This is the library. There are lots of books here.')); yield G.teach('biblioteca'); }
          if (S.active('carta') && !F().cartaDada) { yield* say('ines', T('¿Una carta para la panadería? Esta es la biblioteca, no la panadería.', 'A letter for the bakery? This is the library, not the bakery.'), T('La panadería está al norte, cerca de la escuela.', 'The bakery is to the north, near the school.')); return; }
          yield* say('ines', T('Me gustan los libros. ¿Y a ti?', 'I like books. Do you?'));
        } },
    ],
    searches: { '2,1': { text: T('Hay un libro: «El sol y la luna».', 'There\'s a book: "The Sun and the Moon".') } },
  };
})();
