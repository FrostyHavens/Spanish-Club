// ===== Villa Sol: maps and townsfolk (original content) =====
// Who says what comes from the story's chapters first (src/chapters.js, content/es/story-*.js), then the older errands
// (src/errands.js: presents, the shops), then the day's review (src/favores.js), then each person's own line. Dialogue is short Spanish with [word] tokens (an unmet word shows
// only its picture, a met one picture + word, a remembered one the gold word).
// T('Spanish', 'English') — the English is only shown with the parents' option on.
'use strict';
(function () {
  const MD = G.MAPDATA, F = () => G.state.flags, S = G.st;
  const P = (m, tag) => MD[m].pos[tag];
  const T = (t, en) => ({ t, en });
  const W = id => G.data.words[id];

  // ---------- helpers ----------
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }
  // the first talk of the day starts with their greeting (hearts.js: from chapter 3 on), answered by voice or a tap
  // (+1 heart), and any 3- or 5-heart surprise that's due
  function* hello(who) { if (G.hearts) { yield* G.hearts.greet(who); yield* G.hearts.milestones(who); } }
  // the story (chapters.js) comes first: CA(who) their bubble from it, CT(who, f) their part of a talk (true if it
  // handled it); then errands.js (EA / ET: a present they'd like, the shops)
  const CA = who => (G.chapters ? G.chapters.alert(who) : null);
  function* CT(who, f) { return !!G.chapters && (yield* G.chapters.talk(who, f)); }
  const EA = who => (G.errands ? G.errands.alert(who) : false);
  function* ET(who, f) { return !!G.errands && (yield* G.errands.talk(who, f)); }
  // and the day's review in the world (favores.js): someone's small favour, Luna's palabra del día, Inés's pages
  const FA = who => (G.favores ? G.favores.alert(who) : null);
  const EF = who => EA(who) || FA(who);
  const CH = () => G.chapters;
  // a townsperson's whole talk: greeting, story, errands, then their own line
  function talker(who, line) {
    return function* (f) {
      yield* hello(who);
      if (yield* CT(who, f)) return;
      if (yield* ET(who, f)) return; // (a present, the day's favour, the shop: errands.js, favores.js)
      yield* (typeof line === 'function' ? line(f) : say(who, line));
    };
  }
  // a plain line that only uses words the child has met (an unmet one would be its picture: fine, but keep it short)
  const met = id => S.seen(id);

  // ================= VILLA SOL =================
  const v = MD.villa;
  const door = (tag, to, tx, ty) => { const [x, y] = P('villa', tag); return { x, y, to, tx, ty, dir: 'up' }; };
  const sign = (tag, icon) => { const [x, y] = P('villa', tag); return { x, y, icon }; };
  const PAGES = m => Object.assign({}, (G.data.pagePlaces || {})[m] || {});
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
    pages: PAGES('villa'), // the notebook's page puzzles (content/es/words.js pagePlaces)
    ambient: { birds: 8, butterflies: 5, cat: [16, 17] }, // ambient.js: birds, butterflies, a cat on the park fence
    // the animals (animals.js) and where they live (G.MAPDATA.villa.pos areas, made by tools/mapgen.py)
    animals: [
      { kind: 'pato', n: 3, area: 'estanque' },   // a duck and two ducklings on the farm pond
      { kind: 'gallina', n: 2, area: 'gallinero' }, // Abuela Rosa's hens, beside her house
      { kind: 'pez', at: 'fuentePez' },             // the goldfish in the plaza fountain
      { kind: 'rana', area: 'rana' },               // the frog on the park pond's lily pads
      { kind: 'conejo', area: 'conejo' },           // the rabbit on the park lawn
      { kind: 'caballo', area: 'corral' },          // the horse and the goat in the paddock
      { kind: 'cabra', area: 'corral' },
    ],
    // tap anything (world.js): tile words from G.world.TILES (trees, flowers, the fountain, benches, water); a
    // building's roof and walls say the building
    things: { areas: { escuelaArea: 'escuela', rosaArea: 'casa', casaArea: 'casa', panaderiaArea: 'panaderia', bibliotecaArea: 'biblioteca', granja: 'granja' } },
    npcs: [
      { id: 'pepe', npc: 'pepe', x: P('villa', 'pepe')[0], y: P('villa', 'pepe')[1], dir: 'down', fixed: true,
        alert: () => CA('pepe') || EF('pepe'),
        talk: talker('pepe', pepeTalk) },
      { id: 'rosa', npc: 'rosa', x: 7, y: 7, dir: 'down', wander: 1,
        alert: () => CA('rosa') || EF('rosa'),
        talk: talker('rosa', rosaTalk) },
      { id: 'tomas', npc: 'tomas', x: 20, y: 12, dir: 'down', // his mail round (ambient.js): the plaza, beside the bakery door, Rosa's
        route: [[20, 12, 'down', 150], [28, 7, 'up', 120], [4, 7, 'up', 120]],
        alert: () => CA('tomas') || EF('tomas'),
        talk: talker('tomas', () => say('tomas', met('carta') ? T('¡[hola], {name}! ¡Mis [carta:cartas]!', 'Hi, {name}! My letters!') : T('¡Hola! Soy Tomás.', 'Hi! I\'m Tomás, the mail carrier.'))) },
      { id: 'gomez', npc: 'gomez', x: 8, y: 11, dir: 'right', wander: 1,
        alert: () => CA('gomez') || EF('gomez'), talk: talker('gomez', () => say('gomez', T('¡[hola], {name}!', 'Hi, {name}!'))) },
      { id: 'lucia', npc: 'lucia', x: 27, y: 12, dir: 'left', wander: 2,
        alert: () => CA('lucia') || EF('lucia'), talk: talker('lucia', () => say('lucia', met('comoestas') ? T('¡[hola]! ¿[comoestas]?', 'Hi! How are you?') : T('¡[hola]!', 'Hi!'))) },
      { id: 'nico', npc: 'nico', x: 15, y: 15, dir: 'down', wander: 2, follow: () => !!G.errands && G.errands.nicoFollows(), // (his sound game: he tags along)
        alert: () => CA('nico') || EF('nico'), talk: talker('nico', () => say('nico', met('parque') ? T('¡[hola]! ¡Al [parque]!', 'Hi! To the park!') : T('¡[hola]! Soy Nico.', 'Hi! I\'m Nico.'))) },
      { id: 'sofia', npc: 'sofia', x: P('villa', 'sofia')[0], y: P('villa', 'sofia')[1], dir: 'down',
        alert: () => CA('sofia') || EF('sofia'),
        talk: talker('sofia', () => say('sofia', met('pelota') ? T('¡Mi [pelota]!', 'My ball!') : T('¡[hola]!', 'Hi!'))) },
      { id: 'canelo', npc: 'canelo', x: 19, y: 9, dir: 'left', wander: 3, follow: () => F().canelo, // tags along once you've met
        cond: () => !(G.errands && G.errands.lost()), // (not while he's lost)
        alert: () => CA('canelo'),
        talk: function* (f, n) { yield* caneloTalk(f, n); } },
    ],
  };

  // Canelo: a chapter's beat with him first; once he's yours, the pet menu (pet.js)
  function* caneloTalk(f, n) {
    if (yield* CT('canelo', f)) return;
    if (G.chapters && G.chapters.tapHook && G.chapters.tapHook('canelo', f)) { yield 20; return; }
    if (G.pet && G.pet.mine()) { yield* G.pet.menu(f, n); return; }
    // not yours yet: a hop, a heart, a bark (and his word bubble, world.js: "?" while el perro isn't met)
    if (G.ambient) G.ambient.happy(n);
    if (G.animals) G.animals.tap('perro', n.x * G.TILE + 12, n.y * G.TILE - 6, { silent: true });
    G.audio.sfx('select'); yield 20;
  }

  // ---------- Don Pepe's fruit stall; Abuela Rosa ----------
  function* pepeTalk() {
    if (met('manzana')) yield* say('pepe', T('¡Fruta! ¡[manzana:Manzanas]!', 'Fruit! Apples!'));
    else yield* say('pepe', T('¡Hola! ¡Fruta!', 'Hello! Fruit!'));
  }
  function* rosaTalk() {
    yield* say('rosa', met('casa') ? T('¡[hola], {name}! Mi [casa].', 'Hello, {name}! My house.') : T('¡[hola], {name}!', 'Hello, {name}!'));
  }

  // ================= INTERIORS =================
  const back = (tag) => { const [x, y] = P('villa', tag); return { to: 'villa', tx: x, ty: y + 1, dir: 'down' }; };
  const exitAt = (m, tag) => Object.assign({ x: P(m, 'door')[0], y: P(m, 'door')[1] }, back(tag));

  // ---------- Mi casa ----------
  G.maps.casa = {
    name: 'Mi casa', icon: 'casa', rows: MD.casa.rows, music: 'headquarters',
    things: { at: { '7,5': 'cama' } }, // world.js: the beds say "la cama" (yours, and Canelo's cushion)
    pages: PAGES('casa'),
    onEnter: function* (f) { if (G.day) yield* G.day.evening(f); }, // home after sunset: good night, Hoy, a new morning
    exits: [Object.assign(exitAt('casa', 'casaDoor'), {
      run: function* (f) {
        if (G.chapters && !(yield* G.chapters.door(f))) { f.player.y -= 1; return false; } // a chapter's moment at the door (chapters.js)
        if (F().intro || !G.chapters || G.chapters.done('c1')) return true;
        yield* say('mama', T('¡{name}!', '{name}! (stay a moment)')); const p = G.field.player; p.y -= 1; p.dir = 'up'; return false; // (back off the doorstep)
      } })],
    npcs: [
      { id: 'mama', npc: 'mama', x: P('casa', 'mama')[0], y: P('casa', 'mama')[1], dir: 'down', fixed: true,
        alert: () => CA('mama') || !!(G.day && G.day.over() && !(G.field && G.field.evening)) || EF('mama'), // (not while the evening is going on)
        talk: function* (f) {
          if (G.day && G.day.over()) { yield* G.day.evening(f); return; } // already home when the sun went down
          yield* hello('mama');
          if (yield* CT('mama', f)) return;
          if (yield* ET('mama', f)) return; // a present, a favour (errands.js, favores.js)
          if (S.done('fiestab') || S.done('c21')) yield* say('mama', T('¡{name}! ¡Muy bien!', '{name}! Well done!'));
          else if (G.pet && G.pet.mine()) yield* say('mama', T('¡Canelo y {name}! ¡A jugar!', 'Canelo and {name}! Off you go and play!'));
          else yield* say('mama', T('¡{name}!', '{name}!'));
        } },
      // Canelo lives here too once he's yours: he follows you in, and sleeps on his cushion at night (pet.js)
      { id: 'canelo', npc: 'canelo', x: 7, y: 5, dir: 'left', cond: () => !!(G.pet && G.pet.mine()) && !(G.errands && G.errands.lost()),
        alert: () => CA('canelo') || (!!G.errands && G.errands.caneloAlert()),
        follow: () => !!F().canelo && !(G.pet && G.pet.sleeping()), talk: function* (f, n) { yield* caneloTalk(f, n); } },
    ],
  };

  // ---------- La escuela (Profesora Luna) ----------
  G.maps.escuela = {
    name: 'La escuela', icon: 'escuela', rows: MD.escuela.rows, music: 'church',
    things: {}, pages: PAGES('escuela'),
    exits: [exitAt('escuela', 'escuelaDoor')],
    npcs: [
      { id: 'luna', npc: 'luna', x: P('escuela', 'luna')[0], y: P('escuela', 'luna')[1], dir: 'down', fixed: true,
        alert: () => CA('luna') || EF('luna'),
        talk: talker('luna', lunaTalk) },
      { id: 'kid1', npc: 'nico', x: 3, y: 5, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Fiesta!', 'Party!')] },
      { id: 'kid2', npc: 'lucia', x: 9, y: 5, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Muy bien, {name}!', 'Well done, {name}!')] },
      { id: 'kid3', npc: 'sofia', x: 9, y: 7, dir: 'up', cond: () => S.done('fiesta') || S.done('fiestab'), talk: [T('¡Mi [pelota] [rojo:roja]!', 'My red ball!')] },
    ],
  };
  // Luna: once the story has brought you to her school, a replayable review (the words that are due first)
  function* lunaTalk(f) {
    if (!met('escuela')) { yield* say('luna', T('¡[hola]! Soy Luna.', 'Hello! I\'m Profesora Luna.')); return; }
    if (!G.words.count(2)) { yield* say('luna', T('¡[hola], {name}!', 'Hi, {name}!')); return; }
    yield* say('luna', T('¡[hola], {name}!', 'Hi, {name}!'));
    const r = yield G.choose({ prompt: '¿Repaso?', en: 'Review some words?', show: 'pagina', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }].filter(c => met(c.word)), cancel: true });
    if (r.result !== 0) return;
    yield* G.story.review(5);
    yield* say('luna', T('¡Muy bien!', 'Very good!'));
  }

  // ---------- Casa de la abuela Rosa ----------
  G.maps.rosa = {
    name: 'La casa de Rosa', icon: 'casa', rows: MD.rosa.rows, music: 'inn',
    exits: [exitAt('rosa', 'rosaDoor')],
    pages: PAGES('rosa'), things: {},
    npcs: [],
  };

  // ---------- La panadería (Marta) ----------
  G.maps.panaderia = {
    name: 'La panadería', icon: 'panaderia', rows: MD.panaderia.rows, music: 'inn',
    things: {}, pages: PAGES('panaderia'),
    exits: [exitAt('panaderia', 'panaderiaDoor')],
    npcs: [
      { id: 'marta', npc: 'marta', x: P('panaderia', 'marta')[0], y: P('panaderia', 'marta')[1], dir: 'down', fixed: true,
        alert: () => CA('marta') || EF('marta'),
        talk: talker('marta', () => say('marta', met('pan') ? T('¡[hola]! ¡[pan]!', 'Hello! Bread!') : T('¡[hola]!', 'Hello!'))) },
    ],
  };

  // ---------- La biblioteca (Inés) ----------
  G.maps.biblioteca = {
    name: 'La biblioteca', icon: 'biblioteca', rows: MD.biblioteca.rows, music: 'castle',
    exits: [exitAt('biblioteca', 'bibliotecaDoor')],
    pages: PAGES('biblioteca'), things: {},
    npcs: [
      { id: 'ines', npc: 'ines', x: P('biblioteca', 'ines')[0], y: P('biblioteca', 'ines')[1], dir: 'down', fixed: true,
        alert: () => CA('ines') || EF('ines'),
        talk: talker('ines', () => say('ines', T('Shhh...', 'Shhh... (this is the library)'))) },
    ],
  };
})();
