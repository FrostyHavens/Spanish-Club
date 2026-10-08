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
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }
  // Round B (hearts.js): the first talk of the day starts with their greeting, answered by voice or a tap (+1 heart),
  // and any 3- or 5-heart surprise that's due
  function* hello(who) { if (G.hearts) { yield* G.hearts.greet(who); yield* G.hearts.milestones(who); } }
  // Round B (errands.js): the story errands, the tricks someone teaches Canelo, presents and the shops. EA(who): their
  // thought bubble from that (an errand step, a trick, a new errand, a present); ET(who, f): their part of a talk, true
  // when it said something
  const EA = who => (G.errands ? G.errands.alert(who) : false);
  function* ET(who, f) { return !!G.errands && (yield* G.errands.talk(who, f)); }
  const EU = who => (G.errands ? G.errands.urgent(who) : null); // an errand step that comes before Round A's lines
  function* first(who, f) { return !!EU(who) && (yield* ET(who, f)); }
  function* ask(who, prompt, en, choices, answer, learn, extra = {}) {
    return yield* G.ask(Object.assign({ prompt, en, choices, answer, learn, who, layout: 'list' }, extra));
  }
  const words = (...ids) => ids.map(id => ({ word: id }));
  function* newQuest(id) { S.startQuest(id); yield G.questCard(id); }
  function* finishQuest(id) {
    S.finishQuest(id); yield G.badge(id);
    const giver = G.data.quests[id] && G.data.quests[id].giver; // Round B: finishing someone's errand, +2 hearts
    if (G.hearts && giver && G.hearts.add(giver, 2, 'errand')) { yield 40; yield* G.hearts.milestones(giver); }
  }
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
    signs: [sign('casaDoor', 'casa'), sign('escuelaDoor', 'escuela'), sign('rosaDoor', 'casa'), sign('panaderiaDoor', 'panaderia'), sign('bibliotecaDoor', 'biblioteca'), sign('granjaDoor', 'granja')],
    pages: { [P('villa', 'fuente').join(',')]: 'numeros', '21,20': 'colores',
      // Round B pages (docs/ROUND_B_PLAN.md): a flower in the park, the barn door, a bench, out in the country
      '13,19': 'animales', '43,19': 'granja', [P('villa', 'granjaDoor').join(',')]: 'sonidos', [P('villa', 'banco1').join(',')]: 'cosas',
      '44,4': 'numeros2', '44,8': 'colores2' },
    ambient: { birds: 8, butterflies: 5, cat: [16, 17] }, // ambient.js: birds, butterflies, a cat on the park fence
    // Round B (animals.js): where the animals live (G.MAPDATA.villa.pos areas, made by tools/mapgen.py)
    animals: [
      { kind: 'pato', n: 3, area: 'estanque' },   // a duck and two ducklings on the farm pond
      { kind: 'gallina', n: 2, area: 'gallinero' }, // Abuela Rosa's hens, beside her house
      { kind: 'pez', at: 'fuentePez' },             // the goldfish in the plaza fountain
      { kind: 'rana', area: 'rana' },               // the frog on the park pond's lily pads
      { kind: 'conejo', area: 'conejo' },           // the rabbit on the park lawn
      { kind: 'caballo', area: 'corral' },          // the horse and the goat in the paddock
      { kind: 'cabra', area: 'corral' },
    ],
    // Round B (world.js): tap anything. Tile words come from G.world.TILES (trees, flowers, the fountain, benches,
    // windows, water, the barn door); a building's roof and walls say the building
    things: { areas: { escuelaArea: 'escuela', rosaArea: 'casa', casaArea: 'casa', panaderiaArea: 'panaderia', bibliotecaArea: 'biblioteca', granja: 'granja' } },
    npcs: [
      { id: 'pepe', npc: 'pepe', x: P('villa', 'pepe')[0], y: P('villa', 'pepe')[1], dir: 'down', fixed: true,
        alert: () => !F().pepeSiNo ? true : EU('pepe') || (S.active('mercado') && !F().compra ? [['manzana', 3], ['platano', 2]] : EA('pepe')),
        talk: function* (f) { yield* hello('pepe'); yield* pepeTalk(f); } },
      { id: 'rosa', npc: 'rosa', x: 7, y: 7, dir: 'down', wander: 1,
        alert: () => townOpen() && (EU('rosa') || !S.quest('mercado') ? EU('rosa') || true : F().compra && !S.done('mercado') ? [['manzana', 3], ['platano', 2]] : EA('rosa')),
        talk: function* (f) { yield* hello('rosa'); yield* rosaTalk(f); } },
      { id: 'tomas', npc: 'tomas', x: 20, y: 12, dir: 'down', // his mail round (ambient.js): the plaza, beside the bakery door, Rosa's
        route: [[20, 12, 'down', 150], [28, 7, 'up', 120], [4, 7, 'up', 120]],
        alert: () => townOpen() && (EU('tomas') || !S.quest('carta') ? EU('tomas') || 'carta' : F().cartaDada && !S.done('carta') ? true : S.active('carta') ? false : EA('tomas')),
        talk: function* (f) { yield* hello('tomas'); yield* tomasTalk(f); } }, // (tired, he sits by the plaza bench: errands.js)
      { id: 'gomez', npc: 'gomez', x: 8, y: 11, dir: 'right', wander: 1,
        alert: () => (S.active('saludos') && !F().sal_gomez && 'hola') || EA('gomez'), talk: function* (f) { yield* greet('gomez', f); } },
      { id: 'lucia', npc: 'lucia', x: 27, y: 12, dir: 'left', wander: 2,
        alert: () => (S.active('saludos') && !F().sal_lucia && 'hola') || EA('lucia'), talk: function* (f) { yield* greet('lucia', f); } },
      { id: 'nico', npc: 'nico', x: 15, y: 15, dir: 'down', wander: 2, follow: () => !!G.errands && G.errands.nicoFollows(), // (his sound game: he tags along)
        alert: () => (S.active('saludos') && !F().sal_nico && 'hola') || EA('nico'), talk: function* (f) { yield* greet('nico', f); } },
      { id: 'sofia', npc: 'sofia', x: P('villa', 'sofia')[0], y: P('villa', 'sofia')[1], dir: 'down',
        alert: () => townOpen() && (EU('sofia') || !S.quest('pelota') ? EU('sofia') || 'pelota' : F().pelotaRoja && !S.done('pelota') ? true : EA('sofia')),
        talk: function* (f) { yield* hello('sofia'); yield* sofiaTalk(f); } },
      { id: 'canelo', npc: 'canelo', x: 19, y: 9, dir: 'left', wander: 3, follow: () => F().canelo, // tags along once you've met
        cond: () => !(G.errands && G.errands.lost()), // (not while he's lost: errands.js)
        talk: function* (f, n) { yield* caneloTalk(f, n); } },
    ],
    searches: {
      [P('villa', 'arbusto1').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('azul'); }, emptyText: T('[pelota] [azul]', 'A blue ball.') },
      [P('villa', 'arbusto2').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('verde'); }, emptyText: T('[pelota] [verde]', 'A green ball.') },
      [P('villa', 'arbusto3').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('amarillo'); }, emptyText: T('[pelota] [amarillo:amarilla]', 'A yellow ball.') },
      [P('villa', 'arbusto4').join(',')]: { cond: () => S.quest('pelota'), run: function* () { yield* findBall('rojo'); }, emptyText: T('...', 'Nothing else here.') },
    },
  };

  // Canelo: before he's yours, a bark and his name; once Mamá gives him to you, the pet menu (pet.js)
  function* caneloTalk(f, n) {
    if (G.pet && G.pet.mine()) { yield* G.pet.menu(f, n); return; }
    // a friend already: a hop, a heart, a bark, and "el perro / ¡Guau, guau!" (Round B: the word bubble, the album)
    if (F().canelo && G.ambient) { G.ambient.happy(n, G.animals ? null : '¡Guau!'); if (G.animals) G.animals.tap('perro', n.x * G.TILE + 12, n.y * G.TILE - 6, { silent: true }); yield 20; return; }
    G.audio.sfx('select'); yield G.say(T('¡Guau, guau!', 'Woof, woof!'), { name: 'Canelo' }); F().canelo = true; if (G.ambient) G.ambient.happy(n);
    if (G.animals) G.animals.tap('perro', n.x * G.TILE + 12, n.y * G.TILE - 6, { silent: true });
  }

  // ---------- Errand 1: Saludos (recall: these words were met at home and at school) ----------
  function* greet(who, f) {
    if (!S.active('saludos') || F()['sal_' + who]) {
      yield* hello(who);
      if (yield* ET(who, f)) return;
      yield* say(who, { gomez: T('¡[hola], {name}!', 'Hi, {name}!'), lucia: T('¡[hola]! ¿[comoestas]?', 'Hi! How are you?'), nico: T('¡[hola]! ¡Al [parque]!', 'Hi! To the park!') }[who]);
      return;
    }
    if (who === 'gomez') {
      yield* ask('gomez', '¡[buenosdias], {name}!', 'Good morning, {name}!', words('adios', 'buenosdias', 'no'), 1, 'buenosdias');
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
  function* pepeTalk(f) {
    if (!F().pepeSiNo) {
      // Pepe teaches sí and no by holding up fruit
      yield* say('pepe', T('¡[hola]! ¡Fruta!', 'Hello! Fruit!'));
      yield* G.siNo('¿[manzana]?', true, { show: 'manzana', who: 'pepe', en: 'An apple?' });
      yield* G.siNo('¿[manzana]?', false, { show: 'naranja', who: 'pepe', en: 'An apple? (it\'s an orange)' });
      yield* say('pepe', T('¡No! [naranja]. ¡Muy bien!', 'No! An orange. Very good!'));
      F().pepeSiNo = true;
    }
    if (yield* first('pepe', f)) return;
    if (!S.active('mercado') || F().compra) {
      if (yield* ET('pepe', f)) return;
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
    yield* say('pepe', T('¡De nada, amig{o/a}! ¡Y [uvas] para ti! ¡[adios]!', 'You\'re welcome, friend! And grapes for you! Goodbye!'));
    F().compra = true;
  }
  function* rosaTalk(f) {
    if (!townOpen()) { yield* say('rosa', T('¡[hola]! Mi [casa].', 'Hello! My house.')); return; }
    if (yield* first('rosa', f)) return;
    if (!S.quest('mercado')) {
      yield* say('rosa', T('¡[hola], {name}! Mi [casa].', 'Hello, {name}! My house.'),
        T('[tres] [manzana:manzanas] y [dos] [platano:plátanos], ¿[porfavor]?', 'Three apples and two bananas, please?'));
      yield* newQuest('mercado');
      return;
    }
    if (S.done('mercado')) { if (yield* ET('rosa', f)) return; yield* say('rosa', T('¡Mmm! [manzana:Manzanas]. ¡[gracias]!', 'Mmm! Apples. Thank you!')); return; }
    if (!F().compra) { yield* say('rosa', T('[tres] [manzana:manzanas] y [dos] [platano:plátanos], ¿[porfavor]?', 'Three apples and two bananas, please?'), T('Don Pepe: ¡la fruta!', 'Don Pepe has the fruit!')); return; }
    yield* say('rosa', T('¡La fruta!', 'The fruit!'));
    const c = G.wordChoices('dos', G.data.numberWords, 3, { text: true });
    yield* G.ask({ prompt: '¿Cuántos [platano:plátanos]?', en: 'How many bananas?', show: 'platano', choices: c.choices, answer: c.answer, layout: 'list', learn: 'dos', who: 'rosa' });
    yield* say('rosa', T('¡[si]! [dos]. ¡Qué list{o/a}! ¡[gracias], {name}!', 'Yes! Two. How clever! Thank you, {name}!'));
    yield* finishQuest('mercado');
  }

  // ---------- Errand 3: La pelota roja (colors, through sí/no) ----------
  function* sofiaTalk(f) {
    if (!townOpen()) { yield* say('sofia', T('¡[hola]! ¿Eres nuev{o/a}?', 'Hi! Are you new?')); return; }
    if (yield* first('sofia', f)) return;
    if (!S.quest('pelota')) {
      yield* say('sofia', T('¡Ay! Mi [pelota]... Mi [pelota] [rojo:roja].', 'Oh no! My ball... My red ball.'));
      yield* newQuest('pelota');
      return;
    }
    if (!(F().pelotaRoja && !S.done('pelota')) && (yield* ET('sofia', f))) return; // Round B: dame la pata, salta, the dog show
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
  function* tomasTalk(f) {
    if (!townOpen()) { yield* say('tomas', T('¡[hola]! Soy Tomás.', 'Hi! I\'m Tomás.')); return; }
    if (yield* first('tomas', f)) return;
    if (!S.quest('carta')) {
      yield* say('tomas', T('¡[hola]! Una [carta]... para la [panaderia].', 'Hi! A letter... for the bakery.'), T('¿[porfavor]?', 'Please?'));
      yield* newQuest('carta');
      return;
    }
    if (S.done('carta')) { if (yield* ET('tomas', f)) return; yield* say('tomas', T('¡[gracias], {name}!', 'Thanks, {name}!')); return; }
    if (!F().cartaDada) { yield* say('tomas', T('La [carta]: ¡la [panaderia]!', 'The letter: the bakery!')); return; }
    const c = G.wordChoices('panaderia', ['panaderia', 'biblioteca', 'parque'], 3);
    yield* G.ask({ prompt: '¿La [carta]?', en: 'The letter? Where did it go?', show: 'carta', choices: c.choices, answer: c.answer, layout: 'cards', learn: ['panaderia', 'carta'], who: 'tomas' });
    yield* say('tomas', T('¡[si]! ¡Eres un{/a} gran carter{o/a}! ¡[gracias]!', 'Yes! You\'re a great mail carrier! Thank you!'));
    yield* finishQuest('carta');
  }

  // ================= INTERIORS =================
  const back = (tag) => { const [x, y] = P('villa', tag); return { to: 'villa', tx: x, ty: y + 1, dir: 'down' }; };
  const exitAt = (m, tag) => Object.assign({ x: P(m, 'door')[0], y: P(m, 'door')[1] }, back(tag));

  // ---------- Mi casa ----------
  G.maps.casa = {
    name: 'Mi casa', icon: 'casa', rows: MD.casa.rows, music: 'headquarters',
    things: { at: { '7,5': 'cama' } }, // world.js: the beds say "la cama" (yours, and Canelo's cushion); Mamá hands you the Mi perro page (pet.js)
    onEnter: function* (f) { if (G.day) yield* G.day.evening(f); }, // home after sunset: good night, Hoy, a new morning
    exits: [Object.assign(exitAt('casa', 'casaDoor'), {
      run: function* () {
        if (F().intro) return true;
        yield* say('mama', T('¡{name}!', '{name}!')); G.field.player.dir = 'up'; return false;
      } })],
    npcs: [
      { id: 'mama', npc: 'mama', x: P('casa', 'mama')[0], y: P('casa', 'mama')[1], dir: 'down', fixed: true,
        alert: () => !F().intro || !!(G.day && G.day.over()) || !!(G.pet && G.pet.startReady()) || EA('mama'),
        talk: function* (f) {
          if (!F().intro) { yield* G.story.mamaIntro(); return; }
          if (G.day && G.day.over()) { yield* G.day.evening(f); return; } // already home when the sun went down
          yield* hello('mama');
          if (G.pet && G.pet.startReady()) { yield* G.pet.start(f); return; } // Round B: "¡Canelo es tu perro!"
          if (yield* ET('mama', f)) return; // Round B: siéntate and ven; Canelo goes missing (errands.js)
          if (S.done('fiestab') || S.done('fiesta')) yield* say('mama', T('¡{name}! ¡Muy bien!', '{name}! Well done!'));
          else yield* say('mama', T('La [escuela]. ¡Vamos!', 'The school. Off you go!'));
        } },
      // Canelo lives here too once he's yours: he follows you in, and sleeps on his cushion at night (pet.js)
      { id: 'canelo', npc: 'canelo', x: 7, y: 5, dir: 'left', cond: () => !!(G.pet && G.pet.mine()) && !(G.errands && G.errands.lost()),
        alert: () => !!G.errands && G.errands.caneloAlert(), // his bowl is empty (a side job, errands.js)
        follow: () => !!F().canelo && !(G.pet && G.pet.sleeping()), talk: function* (f, n) { yield* caneloTalk(f, n); } },
    ],
  };

  // ---------- La escuela (club) ----------
  G.maps.escuela = {
    name: 'La escuela', icon: 'escuela', rows: MD.escuela.rows, music: 'church',
    things: {}, pages: { '3,1': 'sentir' },
    exits: [exitAt('escuela', 'escuelaDoor')],
    npcs: [
      { id: 'luna', npc: 'luna', x: P('escuela', 'luna')[0], y: P('escuela', 'luna')[1], dir: 'down', fixed: true,
        alert: () => !S.quest('saludos') || (S.active('saludos') && greeted() === 3) || EA('luna'),
        talk: function* (f) { if (S.done('saludos')) yield* hello('luna'); yield* lunaTalk(f); } },
      { id: 'kid1', npc: 'nico', x: 3, y: 5, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Fiesta!', 'Party!')] },
      { id: 'kid2', npc: 'lucia', x: 9, y: 5, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Muy bien, {name}!', 'Well done, {name}!')] },
      { id: 'kid3', npc: 'sofia', x: 9, y: 7, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Mi [pelota] [rojo:roja]!', 'My red ball!')] },
    ],
  };
  function* lunaTalk(f) {
    if (!S.quest('saludos')) {
      yield* say('luna', T('¡[hola]! Soy Luna. ¡Bienvenid{o/a} a la [escuela]!', 'Hello! I\'m Luna. Welcome to the school!'));
      yield* ask('luna', '¿[comoestas]?', 'How are you?', words('manzana', 'bien', 'adios'), 1, ['comoestas', 'bien']);
      yield* say('luna', T('¡[bien]!', 'Good!'));
      yield* ask('luna', '¡Para ti!', 'For you! (she gives you a gold star)', words('gracias', 'no', 'hola'), 0, 'gracias', { show: 'sol' });
      yield* say('luna', T('Di [hola]: [uno], [dos], [tres] amigos.', 'Say hello to one, two, three friends.'));
      yield* newQuest('saludos');
      return;
    }
    if (S.active('saludos')) {
      if (greeted() < 3) { yield* say('luna', T('[hola]: [uno], [dos], [tres] amigos.', 'Hello: one, two, three friends.')); return; }
      yield* say('luna', T('¡[tres]! ¡Muy bien! ¡Eres muy simpátic{o/a}!', 'Three! Very good! You\'re very friendly!'));
      yield* finishQuest('saludos');
      return;
    }
    if (yield* ET('luna', f)) return; // Round B: the animal count, the animal party (errands.js)
    if (!allBadges()) { yield* say('luna', T('¡Ayuda al pueblo!', 'Help the town!')); return; }
    // once the Round A errands are done: a replayable review that fills in the notebook (the party is errands.js's finale)
    const left = Object.keys(G.data.words).filter(id => !S.knows(id)).length;
    if (!left) { yield* say('luna', T('¡[hola], {name}! ¡Todo el cuaderno!', 'Hi, {name}! You learned the whole notebook!')); return; }
    yield* say('luna', T('¡[hola], {name}!', 'Hi, {name}!'));
    const r = yield G.choose({ prompt: '¿Repaso?', en: 'Review some words?', show: 'pagina', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], cancel: true });
    if (r.result !== 0) { yield* say('luna', T('¡[adios]!', 'Goodbye!')); return; }
    yield* G.story.review(5);
    yield* say('luna', T('¡Muy bien!', 'Very good!'));
  }

  // ---------- Casa de la abuela Rosa (a page on the shelf) ----------
  G.maps.rosa = {
    name: 'La casa de Rosa', icon: 'casa', rows: MD.rosa.rows, music: 'inn',
    exits: [exitAt('rosa', 'rosaDoor')],
    pages: { '1,1': 'comida' }, things: {},
    npcs: [],
  };

  // ---------- La panadería ----------
  G.maps.panaderia = {
    name: 'La panadería', icon: 'panaderia', rows: MD.panaderia.rows, music: 'inn',
    things: {}, pages: { '2,1': 'campo' },
    exits: [exitAt('panaderia', 'panaderiaDoor')],
    npcs: [
      { id: 'marta', npc: 'marta', x: P('panaderia', 'marta')[0], y: P('panaderia', 'marta')[1], dir: 'down', fixed: true,
        alert: () => (S.active('carta') && !F().cartaDada && 'carta') || EA('marta'),
        talk: function* (f) {
          yield* hello('marta');
          if (S.active('carta') && !F().cartaDada) {
            yield* say('marta', T('¿Una [carta]? ¡Para mí!', 'A letter? For me!'));
            const c = G.wordChoices('pan', ['pan', 'carta', 'casa'], 3, { text: true });
            yield* G.ask({ prompt: '¡Para ti! ¿Qué es?', en: 'For you! What is it?', show: 'pan', choices: c.choices, answer: c.answer, layout: 'list', learn: 'pan', who: 'marta' });
            yield* ask('marta', '¡Mmm! [pan].', 'Mmm! Bread.', words('hola', 'gracias', 'no'), 1, 'gracias');
            F().cartaDada = true;
            return;
          }
          if (yield* ET('marta', f)) return; // Round B: the picnic's bread, the shop (errands.js)
          yield* say('marta', T('¡[hola]! ¡[pan]!', 'Hello! Bread!'));
        } },
    ],
  };

  // ---------- La biblioteca (a page on the shelf) ----------
  G.maps.biblioteca = {
    name: 'La biblioteca', icon: 'biblioteca', rows: MD.biblioteca.rows, music: 'castle',
    exits: [exitAt('biblioteca', 'bibliotecaDoor')],
    pages: { '2,1': 'pueblo' }, things: {},
    npcs: [
      { id: 'ines', npc: 'ines', x: P('biblioteca', 'ines')[0], y: P('biblioteca', 'ines')[1], dir: 'down', fixed: true,
        alert: () => EA('ines'),
        talk: function* (f) {
          yield* hello('ines');
          if (S.active('carta') && !F().cartaDada) { yield* say('ines', T('Shhh... ¿Una [carta]? [no], [no]. La [biblioteca].', 'Shhh... A letter? No, no. This is the library.'), T('La [panaderia]: ¡[pan]!', 'The bakery has bread!')); return; }
          if (yield* ET('ines', f)) return; // Round B: Tomás's letter (errands.js)
          yield* say('ines', T('Shhh... La [biblioteca].', 'Shhh... The library.'));
        } },
    ],
  };
})();
