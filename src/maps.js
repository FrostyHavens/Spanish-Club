// ===== Villa Sol: maps, townsfolk and errands (original content) =====
// Dialogue is short Spanish with [word] tokens: an unlearned word shows its picture, a learned one turns gold.
// T('Spanish', 'English') — the English is only shown with the parents' option on.
'use strict';
(function () {
  const MD = G.MAPDATA, F = () => G.state.flags, S = G.st;
  const P = (m, tag) => MD[m].pos[tag];
  const T = (t, en) => ({ t, en });
  const W = id => G.data.words[id];

  // ---------- helpers ----------
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who) }); }
  function* ask(who, prompt, en, choices, answer, learn, extra = {}) {
    return yield* G.ask(Object.assign({ prompt, en, choices, answer, learn, who, layout: 'list' }, extra));
  }
  const words = (...ids) => ids.map(id => ({ word: id }));
  function* newQuest(id) { S.startQuest(id); yield G.questCard(id); }
  function* finishQuest(id) { S.finishQuest(id); yield G.badge(id); }
  const ball = col => ({ icon: 'pelota', col: W(col).col });
  const townOpen = () => S.done('saludos');
  const allBadges = () => ['saludos', 'mercado', 'pelota', 'carta'].every(S.done);
  const greeted = () => ['gomez', 'lucia', 'nico'].filter(k => F()['sal_' + k]).length;

  // ================= VILLA SOL =================
  const v = MD.villa;
  const door = (tag, to, tx, ty) => { const [x, y] = P('villa', tag); return { x, y, to, tx, ty, dir: 'up' }; };
  const sign = (tag, icon) => { const [x, y] = P('villa', tag); return { x, y, icon }; };
  G.maps.villa = {
    name: 'Villa Sol', icon: 'sol', rows: v.rows, music: 'town',
    exits: [
      door('casaDoor', 'casa', 4, 5),
      door('escuelaDoor', 'escuela', 6, 8),
      door('rosaDoor', 'rosa', 4, 5),
      door('panaderiaDoor', 'panaderia', 5, 6),
      door('bibliotecaDoor', 'biblioteca', 5, 7),
    ],
    signs: [sign('casaDoor', 'casa'), sign('escuelaDoor', 'escuela'), sign('rosaDoor', 'casa'), sign('panaderiaDoor', 'panaderia'), sign('bibliotecaDoor', 'biblioteca')],
    pages: { [P('villa', 'fuente').join(',')]: 'numeros', '21,20': 'colores' },
    npcs: [
      { id: 'pepe', npc: 'pepe', x: P('villa', 'pepe')[0], y: P('villa', 'pepe')[1], dir: 'down', fixed: true,
        alert: () => !F().pepeSiNo ? true : S.active('mercado') && !F().compra ? [['manzana', 3], ['platano', 2]] : false,
        talk: function* () { yield* pepeTalk(); } },
      { id: 'rosa', npc: 'rosa', x: 7, y: 7, dir: 'down', wander: 1,
        alert: () => townOpen() && (!S.quest('mercado') ? true : F().compra && !S.done('mercado') ? [['manzana', 3], ['platano', 2]] : false),
        talk: function* () { yield* rosaTalk(); } },
      { id: 'tomas', npc: 'tomas', x: 20, y: 12, dir: 'down', wander: 2,
        alert: () => townOpen() && (!S.quest('carta') ? 'carta' : F().cartaDada && !S.done('carta') ? true : false),
        talk: function* () { yield* tomasTalk(); } },
      { id: 'gomez', npc: 'gomez', x: 8, y: 11, dir: 'right', wander: 1,
        alert: () => S.active('saludos') && !F().sal_gomez && 'hola', talk: function* () { yield* greet('gomez'); } },
      { id: 'lucia', npc: 'lucia', x: 27, y: 12, dir: 'left', wander: 2,
        alert: () => S.active('saludos') && !F().sal_lucia && 'hola', talk: function* () { yield* greet('lucia'); } },
      { id: 'nico', npc: 'nico', x: 15, y: 15, dir: 'down', wander: 2,
        alert: () => S.active('saludos') && !F().sal_nico && 'hola', talk: function* () { yield* greet('nico'); } },
      { id: 'sofia', npc: 'sofia', x: P('villa', 'sofia')[0], y: P('villa', 'sofia')[1], dir: 'down',
        alert: () => townOpen() && (!S.quest('pelota') ? 'pelota' : F().pelotaRoja && !S.done('pelota') ? true : false),
        talk: function* () { yield* sofiaTalk(); } },
      { id: 'canelo', npc: 'canelo', x: 19, y: 9, dir: 'left', wander: 3,
        talk: function* () { G.audio.sfx('select'); yield G.say(T('¡Guau, guau!', 'Woof, woof!'), { name: 'Canelo' }); } },
    ],
    searches: {
      [P('villa', 'arbusto1').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('azul'); }, emptyText: T('[pelota] [azul]', 'A blue ball.') },
      [P('villa', 'arbusto2').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('verde'); }, emptyText: T('[pelota] [verde]', 'A green ball.') },
      [P('villa', 'arbusto3').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('amarillo'); }, emptyText: T('[pelota] [amarillo:amarilla]', 'A yellow ball.') },
      [P('villa', 'arbusto4').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('rojo'); }, emptyText: T('...', 'Nothing else here.') },
    },
  };

  // ---------- Errand 1: Saludos (recall: these words were met at home and at school) ----------
  function* greet(who) {
    if (!S.active('saludos') || F()['sal_' + who]) {
      yield* say(who, { gomez: T('¡[hola], Alex!', 'Hi, Alex!'), lucia: T('¡[hola]! ¿[comoestas]?', 'Hi! How are you?'), nico: T('¡[hola]! ¡Al [parque]!', 'Hi! To the park!') }[who]);
      return;
    }
    if (who === 'gomez') {
      yield* ask('gomez', '¡[buenosdias], Alex!', 'Good morning, Alex!', words('adios', 'buenosdias', 'no'), 1, 'buenosdias');
    } else if (who === 'lucia') {
      yield* ask('lucia', '¡[hola]! ¿[comoestas]?', 'Hi! How are you?', words('bien', 'adios', 'gracias'), 0, ['comoestas', 'bien']);
      yield* say('lucia', T('¡[bien]!', 'Good!'));
    } else {
      yield* ask('nico', '. . .', 'Nico looks at you and smiles. Say hello!', words('gracias', 'no', 'hola'), 2, 'hola');
      yield* say('nico', T('¡[hola]! Soy Nico.', 'Hi! I\'m Nico.'));
    }
    F()['sal_' + who] = true;
    G.toast('¡Hola! ' + greeted() + '/3', 90);
  }

  // ---------- Errand 2: El mercado (sí/no, fruit, numbers, por favor) ----------
  function* pepeTalk() {
    if (!F().pepeSiNo) {
      // Pepe teaches sí and no by holding up fruit
      yield* say('pepe', T('¡[hola]! ¡Fruta!', 'Hello! Fruit!'));
      yield* G.siNo('¿[manzana]?', true, { show: 'manzana', who: 'pepe', en: 'An apple?' });
      yield* G.siNo('¿[manzana]?', false, { show: 'naranja', who: 'pepe', en: 'An apple? (it\'s an orange)' });
      yield* say('pepe', T('¡No! [naranja]. ¡Muy bien!', 'No! An orange. Very good!'));
      F().pepeSiNo = true;
    }
    if (!S.active('mercado') || F().compra) {
      yield* say('pepe', S.done('mercado') ? T('¡[hola]! ¡[manzana:Manzanas], [uvas]...!', 'Hello! Apples, grapes...!') : T('¡Fruta! [manzana] [platano] [naranja] [uvas]', 'Fruit!'));
      return;
    }
    yield* say('pepe', T('¿Qué quieres?', 'What would you like?'));
    const fruits = ['manzana', 'platano', 'naranja', 'uvas'];
    for (const [fruit, num, howMany] of [['manzana', 'tres', '¿Cuántas?'], ['platano', 'dos', '¿Cuántos?']]) {
      const c = G.wordChoices(fruit, fruits, 4);
      yield* G.ask({ prompt: '¿Qué quieres?', en: 'What would you like? (Grandma Rosa wants ' + W(fruit).en.replace('the ', '') + 's)', choices: c.choices, answer: c.answer, layout: 'cards', learn: fruit, who: 'pepe' });
      const d = G.wordChoices(num, G.data.numberWords, 4);
      yield* G.ask({ prompt: howMany, en: 'How many?', show: fruit, choices: d.choices, answer: d.answer, layout: 'cards', learn: num, who: 'pepe' });
    }
    yield* ask('pepe', 'Tú: [tres] [manzana:manzanas] y [dos] [platano:plátanos]...', 'You: three apples and two bananas...', words('no', 'porfavor', 'adios'), 1, 'porfavor');
    yield* ask('pepe', '¡Aquí tienes!', 'Here you go!', words('gracias', 'hola', 'no'), 0, 'gracias', { show: 'manzana' });
    yield* say('pepe', T('¡De nada! ¡Y [uvas] para ti! ¡[adios]!', 'You\'re welcome! And grapes for you! Goodbye!'));
    F().compra = true;
  }
  function* rosaTalk() {
    if (!townOpen()) { yield* say('rosa', T('¡[hola]! Mi [casa].', 'Hello! My house.')); return; }
    if (!S.quest('mercado')) {
      yield* say('rosa', T('¡[hola], Alex! Mi [casa].', 'Hello, Alex! My house.'),
        T('[tres] [manzana:manzanas] y [dos] [platano:plátanos], ¿[porfavor]?', 'Three apples and two bananas, please?'));
      yield* newQuest('mercado');
      return;
    }
    if (S.done('mercado')) { yield* say('rosa', T('¡Mmm! [manzana:Manzanas]. ¡[gracias]!', 'Mmm! Apples. Thank you!')); return; }
    if (!F().compra) { yield* say('rosa', T('[tres] [manzana:manzanas] y [dos] [platano:plátanos], ¿[porfavor]?', 'Three apples and two bananas, please?'), T('Don Pepe: ¡la fruta!', 'Don Pepe has the fruit!')); return; }
    yield* say('rosa', T('¡La fruta!', 'The fruit!'));
    const c = G.wordChoices('dos', G.data.numberWords, 3, { text: true });
    yield* G.ask({ prompt: '¿Cuántos [platano:plátanos]?', en: 'How many bananas?', show: 'platano', choices: c.choices, answer: c.answer, layout: 'list', learn: 'dos', who: 'rosa' });
    yield* say('rosa', T('¡[si]! [dos]. ¡[gracias], Alex!', 'Yes! Two. Thank you, Alex!'));
    yield* finishQuest('mercado');
  }

  // ---------- Errand 3: La pelota roja (colors, through sí/no) ----------
  function* sofiaTalk() {
    if (!townOpen()) { yield* say('sofia', T('¡[hola]!', 'Hi!')); return; }
    if (!S.quest('pelota')) {
      yield* say('sofia', T('¡Ay! Mi [pelota]... Mi [pelota] [rojo:roja].', 'Oh no! My ball... My red ball.'));
      yield* newQuest('pelota');
      return;
    }
    if (S.done('pelota')) { yield* say('sofia', T('¡Mi [pelota] [rojo:roja]! ¡[gracias]!', 'My red ball! Thanks!')); return; }
    if (!F().pelotaRoja) { yield* say('sofia', T('Mi [pelota] [rojo:roja]... ¿[porfavor]?', 'My red ball... please?')); return; }
    yield* say('sofia', T('¡Ah!', 'Oh!'));
    yield* G.ask({ prompt: 'Sofía: ¿Mi [pelota]?', en: 'Sofía: My ball? (give her the ball)', layout: 'cards', who: 'sofia',
      choices: [{ word: 'carta' }, { word: 'pelota' }, { word: 'manzana' }], answer: 1, learn: 'pelota' });
    yield* say('sofia', T('¡Mi [pelota] [rojo:roja]! ¡[gracias]!', 'My red ball! Thank you!'));
    const c = G.wordChoices('azul', ['azul', 'verde', 'amarillo'], 3, { text: true });
    yield* G.ask({ prompt: 'Sofía: ¿Y esta?', en: 'Sofía: And this one? (what color?)', show: ball('azul'), choices: c.choices, answer: c.answer, layout: 'list', learn: 'azul', who: 'sofia' });
    yield* finishQuest('pelota');
  }
  function* findBall(col) {
    G.audio.sfx('chest');
    yield G.say(T('¡Una [pelota]!', 'A ball!'));
    const red = col === 'rojo';
    yield* G.ask({ prompt: '¿[rojo:Roja]?', en: 'Is it red?', show: ball(col), layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], answer: red ? 0 : 1, learn: red ? ['si', 'rojo'] : ['no'] });
    if (red) { F().pelotaRoja = true; G.audio.jingle('item'); yield G.say(T('¡[si]! ¡[rojo:Roja]!', 'Yes! Red!')); }
    else yield G.say(T('[no]. [' + col + (col === 'amarillo' ? ':amarilla' : '') + '].', 'No. ' + W(col).en + '.'));
  }

  // ---------- Errand 4: La carta (places, by picture signs) ----------
  function* tomasTalk() {
    if (!townOpen()) { yield* say('tomas', T('¡[hola]! Soy Tomás.', 'Hi! I\'m Tomás.')); return; }
    if (!S.quest('carta')) {
      yield* say('tomas', T('¡[hola]! Una [carta]... para la [panaderia].', 'Hi! A letter... for the bakery.'), T('¿[porfavor]?', 'Please?'));
      yield* newQuest('carta');
      return;
    }
    if (S.done('carta')) { yield* say('tomas', T('¡[gracias], Alex!', 'Thanks, Alex!')); return; }
    if (!F().cartaDada) { yield* say('tomas', T('La [carta]: ¡la [panaderia]!', 'The letter: the bakery!')); return; }
    const c = G.wordChoices('panaderia', ['panaderia', 'biblioteca', 'parque'], 3);
    yield* G.ask({ prompt: '¿La [carta]?', en: 'The letter? Where did it go?', show: 'carta', choices: c.choices, answer: c.answer, layout: 'cards', learn: ['panaderia', 'carta'], who: 'tomas' });
    yield* say('tomas', T('¡[si]! ¡[gracias]!', 'Yes! Thank you!'));
    yield* finishQuest('carta');
  }

  // ================= INTERIORS =================
  const back = (tag) => { const [x, y] = P('villa', tag); return { to: 'villa', tx: x, ty: y + 1, dir: 'down' }; };
  const exitAt = (m, tag) => Object.assign({ x: P(m, 'door')[0], y: P(m, 'door')[1] }, back(tag));

  // ---------- Mi casa ----------
  G.maps.casa = {
    name: 'Mi casa', icon: 'casa', rows: MD.casa.rows, music: 'headquarters',
    exits: [Object.assign(exitAt('casa', 'casaDoor'), {
      run: function* () {
        if (F().intro) return true;
        yield* say('mama', T('¡Alex!', 'Alex!')); G.field.player.dir = 'up'; return false;
      } })],
    npcs: [
      { id: 'mama', npc: 'mama', x: P('casa', 'mama')[0], y: P('casa', 'mama')[1], dir: 'down', fixed: true,
        alert: () => !F().intro,
        talk: function* () {
          if (!F().intro) { yield* G.story.mamaIntro(); return; }
          if (S.done('fiesta')) yield* say('mama', T('¡Alex! ¡Muy bien!', 'Alex! Well done!'));
          else yield* say('mama', T('La [escuela]. ¡Vamos!', 'The school. Off you go!'));
        } },
    ],
  };

  // ---------- La escuela (club) ----------
  G.maps.escuela = {
    name: 'La escuela', icon: 'escuela', rows: MD.escuela.rows, music: 'church',
    exits: [exitAt('escuela', 'escuelaDoor')],
    npcs: [
      { id: 'luna', npc: 'luna', x: P('escuela', 'luna')[0], y: P('escuela', 'luna')[1], dir: 'down', fixed: true,
        alert: () => !S.quest('saludos') || (S.active('saludos') && greeted() === 3) || (allBadges() && !S.done('fiesta')),
        talk: function* () { yield* lunaTalk(); } },
      { id: 'kid1', npc: 'nico', x: 3, y: 5, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Fiesta!', 'Party!')] },
      { id: 'kid2', npc: 'lucia', x: 9, y: 5, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Muy bien, Alex!', 'Well done, Alex!')] },
      { id: 'kid3', npc: 'sofia', x: 9, y: 7, dir: 'up', cond: () => S.done('fiesta'), talk: [T('¡Mi [pelota] [rojo:roja]!', 'My red ball!')] },
    ],
  };
  function* lunaTalk() {
    if (!S.quest('saludos')) {
      yield* say('luna', T('¡[hola]! Soy Luna. ¡La [escuela]!', 'Hello! I\'m Luna. The school!'));
      yield* ask('luna', '¿[comoestas]?', 'How are you?', words('manzana', 'bien', 'adios'), 1, ['comoestas', 'bien']);
      yield* say('luna', T('¡[bien]!', 'Good!'));
      yield* ask('luna', '¡Para ti!', 'For you! (she gives you a gold star)', words('gracias', 'no', 'hola'), 0, 'gracias', { show: 'sol' });
      yield* say('luna', T('Di [hola]: [uno], [dos], [tres] amigos.', 'Say hello to one, two, three friends.'));
      yield* newQuest('saludos');
      return;
    }
    if (S.active('saludos')) {
      if (greeted() < 3) { yield* say('luna', T('[hola]: [uno], [dos], [tres] amigos.', 'Hello: one, two, three friends.')); return; }
      yield* say('luna', T('¡[tres]! ¡Muy bien!', 'Three! Very good!'));
      yield* finishQuest('saludos');
      return;
    }
    if (!allBadges()) { yield* say('luna', T('¡Ayuda al pueblo!', 'Help the town!')); return; }
    if (!S.done('fiesta')) { yield* G.story.fiesta(); return; }
    // after the party: a replayable review that fills in the notebook
    const left = Object.keys(G.data.words).filter(id => !S.knows(id)).length;
    if (!left) { yield* say('luna', T('¡[hola], Alex! ¡Todo el cuaderno!', 'Hi, Alex! You learned the whole notebook!')); return; }
    yield* say('luna', T('¡[hola], Alex!', 'Hi, Alex!'));
    const r = yield G.choose({ prompt: '¿Repaso?', en: 'Review some words?', show: 'pagina', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], cancel: true });
    if (r.result !== 0) { yield* say('luna', T('¡[adios]!', 'Goodbye!')); return; }
    yield* G.story.review(5);
    yield* say('luna', T('¡Muy bien!', 'Very good!'));
  }

  // ---------- Casa de la abuela Rosa (a page on the shelf) ----------
  G.maps.rosa = {
    name: 'La casa de Rosa', icon: 'casa', rows: MD.rosa.rows, music: 'inn',
    exits: [exitAt('rosa', 'rosaDoor')],
    pages: { '1,1': 'comida' },
    npcs: [],
  };

  // ---------- La panadería ----------
  G.maps.panaderia = {
    name: 'La panadería', icon: 'panaderia', rows: MD.panaderia.rows, music: 'inn',
    exits: [exitAt('panaderia', 'panaderiaDoor')],
    npcs: [
      { id: 'marta', npc: 'marta', x: P('panaderia', 'marta')[0], y: P('panaderia', 'marta')[1], dir: 'down', fixed: true,
        alert: () => S.active('carta') && !F().cartaDada && 'carta',
        talk: function* () {
          if (S.active('carta') && !F().cartaDada) {
            yield* say('marta', T('¿Una [carta]? ¡Para mí!', 'A letter? For me!'));
            const c = G.wordChoices('pan', ['pan', 'carta', 'casa'], 3, { text: true });
            yield* G.ask({ prompt: '¡Para ti! ¿Qué es?', en: 'For you! What is it?', show: 'pan', choices: c.choices, answer: c.answer, layout: 'list', learn: 'pan', who: 'marta' });
            yield* ask('marta', '¡Mmm! [pan].', 'Mmm! Bread.', words('hola', 'gracias', 'no'), 1, 'gracias');
            F().cartaDada = true;
            return;
          }
          yield* say('marta', T('¡[hola]! ¡[pan]!', 'Hello! Bread!'));
        } },
    ],
  };

  // ---------- La biblioteca (a page on the shelf) ----------
  G.maps.biblioteca = {
    name: 'La biblioteca', icon: 'biblioteca', rows: MD.biblioteca.rows, music: 'castle',
    exits: [exitAt('biblioteca', 'bibliotecaDoor')],
    pages: { '2,1': 'pueblo' },
    npcs: [
      { id: 'ines', npc: 'ines', x: P('biblioteca', 'ines')[0], y: P('biblioteca', 'ines')[1], dir: 'down', fixed: true,
        talk: function* () {
          if (S.active('carta') && !F().cartaDada) { yield* say('ines', T('Shhh... ¿Una [carta]? [no], [no]. La [biblioteca].', 'Shhh... A letter? No, no. This is the library.'), T('La [panaderia]: ¡[pan]!', 'The bakery has bread!')); return; }
          yield* say('ines', T('Shhh... La [biblioteca].', 'Shhh... The library.'));
        } },
    ],
  };
})();
