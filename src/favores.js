// ===== Review in the world: favores (small daily requests) and Luna's palabra del día (docs/LEARNING_DESIGN.md) =====
// From chapter 7 on, up to three townsfolk a day have a small favour to ask ("?" bubble over them), each about ONE word
// the child already knows (stage 2+) that is due for review (G.review.due), asked the way that person's life shows it:
//   go     Tomás / Señor Gómez: "¡Una carta para la [panadería]!" (the word only, no picture): walk there; arriving
//          asks the place's name (the banner). (escuela, panadería, biblioteca: walk in; the park, the fountain, the
//          farm, Rosa's house, a bench, a tree: walk up to it)
//   find   Nico: "¿Y el [conejo]?": find that animal in town and tap it, then say what it is
//   count  Don Pepe / Marta / Rosa / Luna: a heap of their things to count (never the number's own picture)
//   colour Lucía / Sofía: a flower or a ribbon: "¿De qué color?"
//   sound  Nico: an animal: "¿Qué dice?" (its sound word)
//   feel   Mamá / Lucía: a face: "¿Cómo está?"
//   thing  Pepe / Marta / Rosa / Mamá: they hold up one of their things: "¿Qué es?"
// Done: a star and a heart (one favour per person a day). Favours are never needed to go on: the story never waits.
// Palabra del día (from chapter 8): once a day Profesora Luna holds up a picture of a word the child knows that is due:
// say it (the mic) or pick its word from four. A star.
// From chapter 16, Inés's library holds the notebook's page puzzles: she offers one that is ready, once a day.
// Hooks: maps.js asks G.favores.alert(who) / talk(who, f) after the story and the older errands; field.js frames come
// through G.errands.update, the hint hand's places through G.errands.targets, taps on animals through G.animals.tapped.
// API: G.favores.today() (today's favours: [{who, kind, word, done, on}]), .palabraDone(), .ready() (they have started).
// Saved: G.state.fav = {day, list, pal (the day of the last palabra del día)}.
'use strict';
(function () {
  const FV = G.favores = {}, T = G.TILE;
  const TT = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const say = (who, ...pages) => G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who });
  const sayShow = (who, show, ...pages) => G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who, show });
  const known = id => !!W(id) && G.words.stage(id) >= 2;
  const ch = id => !!G.chapters && G.chapters.done(id);
  FV.ready = () => !!G.state && ch('c7') && !!G.pet && G.pet.mine();

  // ---------- what each person can ask about ----------
  const PLACES = { // where a place word is: a building (walk in) or a tile on the map (walk up to it)
    escuela: { map: 'escuela' }, panaderia: { map: 'panaderia' }, biblioteca: { map: 'biblioteca' }, casa: { map: 'rosa' },
    parque: { at: [17, 18] }, fuente: { at: [18, 11] }, granja: { at: [41, 6] }, banco: { at: [13, 9] }, arbol: { at: [23, 18] },
  };
  const ANIMALS = ['cabra', 'caballo', 'conejo', 'rana', 'gallina']; // (ones you can walk up to and tap: not the cat on the fence or the ducks out on the pond)
  const THINGS = { pepe: ['manzana', 'platano', 'naranja', 'queso'], marta: ['pan', 'galleta', 'leche'], rosa: ['huevo', 'flor', 'manzana'], mama: ['hueso', 'pelota', 'agua', 'cama', 'carta'] };
  const COUNT_OF = { pepe: 'manzana', marta: 'pan', rosa: 'huevo', luna: 'estrella' };
  const NUMS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  const COLOURS = ['rojo', 'blanco', 'azul', 'rosa', 'amarillo', 'verde'];
  const FEEL = ['bien', 'cansado', 'feliz', 'triste'];
  const SOUND = { guau: 'perro', miau: 'gato', cuac: 'pato', croac: 'rana' };
  // [who, kind, words (the pool for the due word)]
  const OFFERS = [
    ['tomas', 'go', ['escuela', 'panaderia', 'biblioteca', 'casa', 'parque', 'fuente', 'granja']],
    ['gomez', 'go', ['parque', 'banco', 'arbol', 'fuente']],
    ['nico', 'find', ANIMALS], ['nico', 'sound', Object.keys(SOUND)],
    ['pepe', 'count', NUMS], ['marta', 'count', NUMS.slice(0, 6)], ['rosa', 'count', NUMS.slice(0, 6)], ['luna', 'count', NUMS],
    ['lucia', 'colour', COLOURS], ['sofia', 'colour', COLOURS],
    ['mama', 'feel', FEEL], ['lucia', 'feel', FEEL],
    ['pepe', 'thing', THINGS.pepe], ['marta', 'thing', THINGS.marta], ['rosa', 'thing', THINGS.rosa], ['mama', 'thing', THINGS.mama],
  ];
  const st = () => { const s = G.state; if (!s.fav || typeof s.fav !== 'object') s.fav = { day: -1, list: [], pal: -1 }; if (!Array.isArray(s.fav.list)) s.fav.list = []; return s.fav; };
  // today's favours: made the first time they're asked for on a new day
  FV.today = function () {
    if (!FV.ready()) return [];
    const s = st(), d = G.words.day();
    if (s.day !== d) {
      s.day = d; s.list = [];
      const used = new Set(), whoUsed = new Set();
      const offers = OFFERS.slice().sort(() => G.rand() - 0.5);
      for (const [who, kind, pool] of offers) {
        if (s.list.length >= 3 || whoUsed.has(who)) continue;
        const ok = id => known(id) && !used.has(id);
        const word = G.review.next({ minStage: 2, filter: id => pool.includes(id) && ok(id) }) || null;
        if (!word) continue;
        used.add(word); whoUsed.add(who);
        s.list.push({ who, kind, word, done: false, on: false });
      }
      G.st.autosave();
    }
    return s.list;
  };
  const mine = who => FV.today().find(v => v.who === who && !v.done) || null;
  const onNow = () => FV.today().find(v => v.on && !v.done) || null;
  // the story first: no favour while that person has something for the chapter (or the story waits for them today)
  const storyHas = who => !!G.chapters && !!G.chapters.alert(who);

  // ---------- the bubble and the talk (maps.js) ----------
  FV.alert = function (who) {
    if (!G.state) return null;
    if (who === 'luna' && FV.palabraReady()) return { icon: 'estrella' };
    if (who === 'ines' && FV.pageReady()) return { icon: 'pagina' };
    const v = mine(who); if (!v || storyHas(who)) return null;
    return v.on ? null : 'pregunta';
  };
  FV.talk = function* (who, f) {
    if (!G.state) return false;
    if (who === 'luna' && FV.palabraReady()) { yield* palabra(); return true; }
    if (who === 'ines' && FV.pageReady()) { yield* pages(); return true; }
    const v = mine(who); if (!v || storyHas(who)) return false;
    if (v.on) { yield* remind(v); return true; }
    yield* KIND[v.kind](v, f);
    return true;
  };
  function reward(v) {
    v.done = true; v.on = false;
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star');
    if (G.hearts) G.hearts.add(v.who, 1, 'care');
    G.st.autosave();
  }
  const ask = (who, prompt, en, answer, others, o = {}) => G.chapters.ask(who, prompt, en, answer, others.filter(k => k !== answer && G.words.met(k)).slice(0, 2), Object.assign({ review: true }, o));
  const others = (id, pool) => pool.filter(k => k !== id && G.words.met(k) && G.baseForm(k) !== G.baseForm(id)).sort(() => G.rand() - 0.5);
  const KIND = {
    *go(v) {
      const p = PLACES[v.word];
      yield say(v.who, v.who === 'tomas' ? TT('¡{name}! Una [carta]... ¡para la [' + v.word + ']! ¿[porfavor]?', 'A letter... for this place! Take it there, please? (the word only: remember where it is)')
        : TT('¡{name}! ¿Me ayudas? ¡Al [' + v.word + ']!', 'Can you help me? Go to this place! (remember where it is)'));
      v.on = true; G.st.autosave();
      if (v.who === 'tomas') G.errands.bag.add('carta', { q: 'fav' });
      void p;
    },
    *find(v) {
      yield say(v.who, TT('¡Un juego! ¿Y el [' + v.word + ']? ¡Búscalo!', 'A game! Where is this animal? Find it and tap it!'));
      v.on = true; G.st.autosave();
    },
    *count(v) {
      const n = NUMS.indexOf(v.word) + 1, thing = COUNT_OF[v.who] || 'manzana';
      yield say(v.who, TT('¡{name}! ¿Me ayudas a contar?', 'Can you help me count?'));
      yield* ask(v.who, '¿Cuántos?', 'How many are there? (count them)', v.word, others(v.word, NUMS).filter(k => !(v.word === 'tres' && k === 'seis') && !(v.word === 'seis' && k === 'tres')), { show: { icon: W(thing) ? W(thing).icon : thing, count: n } });
      reward(v); yield say(v.who, TT('¡[gracias], {name}!', 'Thank you, {name}!'));
    },
    *colour(v) {
      const pic = v.who === 'sofia' ? { icon: 'cinta', col: W(v.word).col } : { icon: 'flor', col: W(v.word).col };
      yield say(v.who, TT('¡Mira! ¡Qué bonita!', 'Look! Isn\'t it pretty?'));
      yield* ask(v.who, '¿De qué color?', 'What colour is it?', v.word, others(v.word, COLOURS).filter(k => !(v.word === 'rosa' && k === 'rojo') && !(v.word === 'rojo' && k === 'rosa')), { show: pic });
      reward(v); yield say(v.who, TT('¡Sí! ¡[gracias]!', 'Yes! Thank you!'));
    },
    *sound(v) {
      yield say(v.who, TT('¡Un juego! ¡Escucha!', 'A game! Listen...'));
      yield* ask(v.who, '¿Qué dice?', 'What does this animal say?', v.word, others(v.word, Object.keys(SOUND)).filter(k => !(v.word === 'cuac' && k === 'croac') && !(v.word === 'croac' && k === 'cuac')), { show: SOUND[v.word] });
      reward(v); yield say(v.who, TT('¡Ja, ja! ¡Sí!', 'Ha ha! Yes!'));
    },
    *feel(v) {
      yield say(v.who, TT('¡{name}! Mira esta cara...', '{name}! Look at this face...'));
      yield* ask(v.who, '¿Cómo está?', 'How is this face feeling?', v.word, others(v.word, FEEL), { show: v.word, display: 'text' });
      reward(v); yield say(v.who, TT('¡Muy bien!', 'Very good!'));
    },
    *thing(v) {
      yield say(v.who, TT('¡{name}! ¿Y esto?', '{name}! And this?'));
      yield* ask(v.who, '¿Qué es?', 'What is it?', v.word, others(v.word, THINGS[v.who] || []).concat(others(v.word, G.words.list(2).filter(k => W(k).topic === W(v.word).topic))), { show: v.word, display: 'text' });
      reward(v);
      if (G.errands && !G.errands.bag.full() && ['manzana', 'platano', 'naranja', 'queso', 'pan', 'galleta', 'huevo', 'flor'].includes(v.word) && !G.errands.bag.has(v.word, { q: null })) {
        G.errands.bag.add(v.word, v.word === 'flor' ? { col: 'rosa' } : {});
        yield say(v.who, TT('¡Para ti!', 'For you! (give it to a friend who likes it)'));
      } else yield say(v.who, TT('¡[gracias], {name}!', 'Thank you, {name}!'));
    },
  };
  function* remind(v) {
    if (v.kind === 'go') yield say(v.who, TT('¿La [carta]? ¡La [' + v.word + ']!', 'The letter? To this place!'));
    else yield say(v.who, TT('¿Y el [' + v.word + ']?', 'Where is it? Find it and tap it!'));
  }

  // ---------- going there, finding it (every frame, taps on animals) ----------
  function* arrived(f, v) {
    G.audio.sfx('chime');
    if (G.errands) G.errands.bag.take('carta', { q: 'fav' });
    const pool = Object.keys(PLACES).filter(k => k !== v.word && G.words.met(k) && !(v.word === 'casa' && k === 'cama')).sort(() => G.rand() - 0.5).slice(0, 2);
    yield* G.chapters.banner(v.word, pool, { review: true });
    reward(v);
    yield G.say([TT('¡Muy bien! ¡Un favor!', 'Well done! A favour done for ' + G.nameOf(v.who) + '.')]);
  }
  FV.update = function (f) {
    if (!G.state || !f || f.locked || G.top() !== f || f.player.moving) return;
    const v = onNow(); if (!v || v.kind !== 'go') return;
    const p = PLACES[v.word], pl = f.player;
    const here = p.map ? f.mapId === p.map : f.mapId === 'villa' && Math.abs(pl.x - p.at[0]) + Math.abs(pl.y - p.at[1]) <= 2;
    if (!here) return;
    G.chapters.scene(f, arrived(f, v));
  };
  FV.targets = function (f) {
    const v = onNow(); if (!v || !f) return [];
    if (v.kind === 'go') { const p = PLACES[v.word]; if (p.at && f.mapId === 'villa') return [{ x: p.at[0] * T + 12, y: p.at[1] * T + 12, spot: 'fav:' + v.word }]; return []; }
    if (v.kind === 'find' && G.animals) { const a = G.animals.find(v.word, f); if (a) return [{ x: Math.round(a.x), y: Math.round(a.y - 6), animal: v.word }]; }
    return [];
  };
  FV.waitsIn = m => { const v = onNow(); return !!v && v.kind === 'go' && PLACES[v.word].map === m; };
  function* foundIt(f, v) {
    yield* ask(v.who, '¡Sí! ¿Qué es?', 'You found it! What is it?', v.word, others(v.word, ANIMALS));
    reward(v);
    yield G.say([TT('¡Muy bien! ¡Un favor!', 'Well done! A favour done for ' + G.nameOf(v.who) + '.')]);
  }
  if (G.animals) {
    const orig = G.animals.tapped;
    G.animals.tapped = function (f, a) {
      const v = onNow(), L = G.chapters && G.chapters.live();
      if (v && v.kind === 'find' && v.word === a.kind && !f.locked && !(L && L.b && L.b.tap === a.kind)) {
        G.animals.react(f, a); G.animals.cry(a.kind);
        G.chapters.scene(f, foundIt(f, v));
        return { x: Math.floor(a.x / T), y: Math.floor(a.y / T), animal: a.kind };
      }
      return orig(f, a);
    };
  }
  if (G.errands) {
    const eu = G.errands.update, et = G.errands.targets, ew = G.errands.waitsIn;
    G.errands.update = function (f) { eu(f); FV.update(f); };
    G.errands.targets = function (f) { return et(f).concat(FV.targets(f)); };
    G.errands.waitsIn = m => ew(m) || FV.waitsIn(m);
  }

  // ---------- Luna's palabra del día ----------
  FV.palabraDone = () => !!G.state && st().pal === G.words.day();
  FV.palabraWord = () => G.review.next({ minStage: 2 }) || G.words.list(2).sort((a, b) => (G.words.rec(a).last || 0) - (G.words.rec(b).last || 0))[0] || null;
  FV.palabraReady = () => !!G.state && ch('c8') && !FV.palabraDone() && !storyHas('luna') && !!FV.palabraWord();
  function* palabra() {
    const id = FV.palabraWord(); if (!id) return;
    yield sayShow('luna', { icon: 'estrella' }, TT('¡{name}! ¡La palabra del día!', '{name}! The word of the day! Look at the picture: say it out loud (or tap its word).'));
    const pool = G.words.list(1).filter(k => k !== id && G.baseForm(k) !== G.baseForm(id) && G.iconDrawn(k));
    const c = G.wordChoices(id, [id].concat(pool.sort(() => G.rand() - 0.5)), Math.min(4, pool.length + 1));
    yield* G.ask({ prompt: '\u0005 ¡La palabra del día! \u0005', en: 'The word of the day: what is it? Say it!', show: id, choices: c.choices, answer: c.answer, layout: 'cards', display: 'text', who: 'luna', review: true });
    st().pal = G.words.day(); G.st.autosave();
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star');
    if (G.hearts) G.hearts.add('luna', 1, 'care');
    yield say('luna', TT('¡Muy bien! ¡Hasta mañana!', 'Very good! A new word tomorrow!'));
  }

  // ---------- Inés's library: the notebook's page puzzles ----------
  FV.pageReady = () => !!G.state && ch('c16') && st().pageDay !== G.words.day() && !storyHas('ines') && !!G.data.pageOrder.find(p => G.pages.ready(p) && G.pages.words(p).length >= 4);
  function* pages() {
    const pg = G.data.pageOrder.find(p => G.pages.ready(p) && G.pages.words(p).length >= 4); if (!pg) return;
    st().pageDay = G.words.day(); G.st.autosave(); // (one a day: she keeps the rest for tomorrow)
    yield sayShow('ines', { icon: 'pagina' }, TT('Shhh... ¡Una página! ¿Jugamos?', 'Shhh... a notebook page to play with! Match each picture with its word.'));
    yield* G.pages.run(pg);
  }
})();
