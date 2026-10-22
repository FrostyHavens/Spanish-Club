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
//   thing  Pepe / Marta / Rosa / Mamá: they hold up one of their things: "¿Qué es?"; or a word that's due from
//          anywhere (another place's word, polish plan 2.5): they show a photo of it, asked as picture cards (G.review.ask)
//          (FV.dueWord below: the word a moment reviews, used by the greetings, Lola, the letters and the dog too)
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
  // the lines built from the word: its article from the word (G.requests.the), never "la [parque]" or "el [cabra]"
  const RQ = G.requests, the = (id, o) => RQ.the(id, o), L = RQ.LINES;
  L['fav.tomas'] = id => '¡{name}! Una [carta]... ¡para ' + the(id) + '! ¿[porfavor]?';   // ¡para el [parque]!
  L['fav.gomez'] = id => '¡{name}! ¿Me ayudas? ¡' + the(id, { pre: 'a', cap: 1 }) + '!';   // ¡Al [parque]! ¡A la [fuente]!
  L['fav.find'] = id => '¡Un juego! ¿Y ' + the(id) + '? ¡Búsca' + RQ.lo(id) + '!';           // ¿Y la [cabra]? ¡Búscala!
  L['fav.count'] = id => '¿Cuánt' + RQ.o(id, true) + '?';                                    // (manzanas) ¿Cuántas?
  L['fav.remindTomas'] = id => '¿La [carta]? ¡Para ' + the(id) + '!';
  L['fav.remindGomez'] = id => '¡Vamos ' + the(id, { pre: 'a' }) + '!';
  L['fav.remindFind'] = id => '¿Y ' + the(id) + '?';
  FV.ready = () => !!G.state && ch('c7') && !!G.pet && G.pet.mine();

  // ---------- what each person can ask about ----------
  const PLACES = { // where a place word is: a building (walk in) or a tile on the map (walk up to it)
    escuela: { map: 'escuela' }, panaderia: { map: 'panaderia' }, biblioteca: { map: 'biblioteca' }, casa: { map: 'rosa' },
    parque: { at: [17, 18] }, fuente: { at: [18, 11] }, granja: { at: [41, 6], map: 'granja' }, banco: { at: [13, 9] }, arbol: { at: [23, 18] },
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
  // Data-driven per map (the open world, docs/WORLD_PLAN.md): a zone file adds its own offers and places, e.g.
  //   G.favores.OFFERS.push(['lola', 'find', ['cangrejo', 'estrella_mar'], () => G.zones.visited('playa')]);
  //   G.favores.PLACES.faro = { at: [12, 3], on: 'playa' };  (a tile on that map: walk up to it) or { map: 'playa_cueva' }
  //   G.favores.ANIMALS.push('cangrejo'); G.favores.THINGS.lola = ['concha', 'elsol']; G.favores.COUNT_OF.lola = 'concha';
  // An offer's 4th entry is an optional condition (the zone was visited). Words must be known (stage 2+) to be asked.
  // A new KIND of favour (src/listen.js adds 'listen' and 'carry') plugs in with: FV.KIND[kind] = function* (v, f) (its
  // talk), FV.BUBBLE[kind] (the offer's bubble, else "?"), FV.ON[kind](v) (the bubble while it's going on), FV.REMIND[kind]
  // (v, f) (a talk while it's going on), FV.TARGETS[kind](f, v) (where the guide points), FV.PICK[kind](who, pool) (the
  // day's word, else a due known word of the pool), FV.OFF[kind]() (not offered now), FV.GROUP[kind] + FV.CAP[group] (at
  // most that many of a group a day: not spammy).
  Object.assign(FV, { OFFERS, PLACES, ANIMALS, THINGS, COUNT_OF });
  Object.assign(FV, { BUBBLE: {}, ON: {}, REMIND: {}, TARGETS: {}, PICK: {}, OFF: {}, GROUP: {}, CAP: {} });

  // ---------- the word a moment reviews: any met word that's due, wherever she met it (AUDIT C6, polish plan 2.5) ----------
  // Once she leaves a place its words used to be hardly reviewed (a design rule kept each place to its own words). Now
  // the greetings, the favours, Lola, Tomás's letters and the dog's cards ask about any word she has met that is due
  // (G.review.due's order: just-met follow-ups, then misses, then the most overdue), always in a form that fits where
  // she is: its picture held up and picture cards (G.review.ask), never "bring me" a thing that isn't here. Only when
  // nothing is due, the place's own words (o.pool): the one used longest ago, never one already used today.
  //   FV.dueWord(o) -> a word id or null. o: {pool (the person's / the place's words: the fallback), filter(id),
  //   minStage (1), exclude ([ids]), prefer(id) (first among the first few due: another place's words), onlyPool (the
  //   pool only, due ones first), noFallback (nothing when nothing is due)}
  FV.dueWord = function (o = {}) {
    if (!G.state || !G.review || !G.words) return null;
    const pool = o.pool || [], ex = o.exclude || [], min = o.minStage || 1;
    const ok = id => !!W(id) && G.iconDrawn(id) && !ex.includes(id) && (!o.onlyPool || pool.includes(id)) && G.review.fresh(id) && (!o.filter || o.filter(id)); // (never a word asked a moment ago: words.js G.review.REASK)
    const due = G.review.due(1e9, { minStage: min, filter: ok });
    if (due.length) { const p = o.prefer ? due.slice(0, 6).find(o.prefer) : null; return p || due[0]; }
    if (o.noFallback) return null;
    const today = G.words.dayNum(), last = id => { const d = G.words.lastDay(id); return d == null ? -1e9 : d; };
    const L = pool.filter(id => G.words.stage(id) >= min && ok(id) && last(id) < today).sort((a, b) => last(a) - last(b));
    return L[0] || null;
  };
  // a word that isn't one of this person's things (a word from another place, a thing that isn't here): it's asked
  // with its picture, never as the thing in their hands
  const NOT_THINGS = ['saludos', 'numeros', 'colores', 'sentir', 'sonidos']; // (those have favours of their own: count, colour, feel, sound)
  FV.PICK.thing = (who, pool, ok) => FV.dueWord({ pool, minStage: 2, filter: id => ok(id) && (pool.includes(id) || !NOT_THINGS.includes(W(id).topic)) });
  const st = () => { const s = G.state; if (!s.fav || typeof s.fav !== 'object') s.fav = { day: -1, list: [], pal: -1 }; if (!Array.isArray(s.fav.list)) s.fav.list = []; return s.fav; };
  // today's favours: made the first time they're asked for on a new day
  FV.today = function () {
    if (!FV.ready()) return [];
    const s = st(), d = G.words.day();
    if (s.day !== d) {
      s.day = d; s.list = [];
      const used = new Set(), whoUsed = new Set(), groups = {};
      const off = kind => { try { return !!(FV.OFF[kind] && FV.OFF[kind]()); } catch (e) { return true; } };
      const offers = OFFERS.filter(o => !off(o[1])).sort(() => G.rand() - 0.5); // (a kind that's off isn't drawn at all: the day's favours are what they'd be without it)
      for (const [who, kind, pool, cond] of offers) {
        if (s.list.length >= 3 || whoUsed.has(who) || (cond && !cond())) continue;
        const grp = FV.GROUP[kind]; if (grp && (groups[grp] | 0) >= (FV.CAP[grp] || 1)) continue;
        const ok = id => known(id) && !used.has(id);
        let word = null;
        try { word = FV.PICK[kind] ? FV.PICK[kind](who, pool, ok) : G.review.next({ minStage: 2, filter: id => pool.includes(id) && ok(id) }) || null; } catch (e) { console.error(e); word = null; }
        if (!word) continue;
        used.add(word); whoUsed.add(who); if (grp) groups[grp] = (groups[grp] | 0) + 1;
        s.list.push({ who, kind, word, done: false, on: false });
      }
      G.st.autosave();
    }
    return s.list;
  };
  const mine = who => FV.today().find(v => v.who === who && !v.done) || null;
  FV.pending = who => !!mine(who); // (seek.js: Nico's favour comes before his hide-and-seek)
  const onNow = () => FV.today().find(v => v.on && !v.done) || null;
  // the story first: no favour while that person has something for the chapter (or the story waits for them today)
  const storyHas = who => !!G.chapters && !!G.chapters.alert(who);

  // ---------- the bubble and the talk (maps.js) ----------
  FV.alert = function (who) {
    if (!G.state) return null;
    if (who === 'luna' && FV.palabraReady()) return { icon: 'estrella' };
    if (who === 'ines' && FV.pageReady()) return { icon: 'pagina' };
    const v = mine(who); if (!v || storyHas(who)) return null;
    if (v.on) { try { return FV.ON[v.kind] ? FV.ON[v.kind](v) || null : null; } catch (e) { return null; } }
    return FV.BUBBLE[v.kind] || 'pregunta';
  };
  FV.talk = function* (who, f) {
    if (!G.state) return false;
    if (who === 'luna' && FV.palabraReady()) { yield* palabra(); return true; }
    if (who === 'ines' && FV.pageReady()) { yield* pages(); return true; }
    const v = mine(who); if (!v || storyHas(who)) return false;
    if (v.on) { if (FV.REMIND[v.kind]) yield* FV.REMIND[v.kind](v, f); else yield* remind(v); return true; }
    if (!KIND[v.kind]) return false;
    yield* KIND[v.kind](v, f);
    return true;
  };
  FV.mine = mine; FV.storyHas = storyHas;
  FV.reward = v => reward(v);
  function reward(v) {
    v.done = true; v.on = false;
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star');
    if (G.hearts) G.hearts.add(v.who, 1, 'care');
    G.st.autosave();
  }
  // (a word from another place: they show a photo, and it's asked with its picture: lines that vary, never the same talk)
  const PHOTO = ['¡{name}! ¡Mira mi foto!', '¡Mira, {name}! ¡Una foto!', '¡{name}! ¿Y en esta foto?'];
  const PHOTO_EN = ['{name}! Look at my photo! (what is it?)', 'Look, {name}! A photo! (what is it?)', '{name}! And in this photo? (what is it?)'];
  const ask = (who, prompt, en, answer, others, o = {}) => G.chapters.ask(who, prompt, en, answer, others.filter(k => k !== answer && G.words.met(k)).slice(0, 2), Object.assign({ review: true }, o));
  const others = (id, pool) => pool.filter(k => k !== id && G.words.met(k) && G.baseForm(k) !== G.baseForm(id)).sort(() => G.rand() - 0.5);
  const KIND = FV.KIND = {
    *go(v) {
      const p = PLACES[v.word];
      yield say(v.who, v.who === 'tomas' ? TT(L['fav.tomas'](v.word), 'A letter... for this place! Take it there, please? (the word only: remember where it is)')
        : TT(L['fav.gomez'](v.word), 'Can you help me? Go to this place! (remember where it is)'));
      v.on = true; G.st.autosave();
      if (v.who === 'tomas') G.errands.bag.add('carta', { q: 'fav' });
      void p;
    },
    *find(v) {
      yield say(v.who, TT(L['fav.find'](v.word), 'A game! Where is this animal? Find it and tap it!'));
      v.on = true; G.st.autosave();
    },
    *count(v) {
      const n = NUMS.indexOf(v.word) + 1, thing = COUNT_OF[v.who] || 'manzana';
      yield say(v.who, TT('¡{name}! ¿Me ayudas a contar?', 'Can you help me count?'));
      yield* ask(v.who, L['fav.count'](thing), 'How many are there? (count them)', v.word, others(v.word, NUMS).filter(k => !(v.word === 'tres' && k === 'seis') && !(v.word === 'seis' && k === 'tres')), { show: { icon: W(thing) ? W(thing).icon : thing, count: n } });
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
      // (its word was fixed in the morning: reviewed since by the dog or a greeting, it's not due any more: another one
      // that is, else one of their own things not used today; nothing else fits: the same word. S2 review #14)
      if ((!G.words.due(v.word) && G.words.lastDay(v.word) === G.words.dayNum()) || !G.review.fresh(v.word)) { const w = FV.PICK.thing(v.who, THINGS[v.who] || [], id => known(id) && id !== v.word && !FV.today().some(o => o !== v && o.word === id)); if (w) { v.word = w; G.st.autosave(); } }
      if (!(THINGS[v.who] || []).includes(v.word)) { // a word from anywhere (not one of their things here): a photo of it
        const k = G.r(PHOTO.length);
        yield sayShow(v.who, { icon: 'foto' }, TT(PHOTO[k], PHOTO_EN[k]));
        yield* G.review.ask(v.word, { who: v.who }); G.review.mark(v.who);
        const T3 = [['¡[gracias], {name}!', 'Thank you, {name}!'], ['¡Muy bien!', 'Very good!'], ['¡Eso es! ¡[gracias]!', 'That\'s it! Thank you!']][G.r(3)];
        reward(v); yield say(v.who, TT(T3[0], T3[1]));
        return;
      }
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
    if (v.kind === 'go') yield say(v.who, v.who === 'tomas' ? TT(L['fav.remindTomas'](v.word), 'The letter? To this place!') : TT(L['fav.remindGomez'](v.word), 'Let\'s go to this place! (remember where it is)'));
    else yield say(v.who, TT(L['fav.remindFind'](v.word), 'Where is it? Find it and tap it!'));
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
    const here = (p.map && f.mapId === p.map) || (!!p.at && f.mapId === (p.on || 'villa') && Math.abs(pl.x - p.at[0]) + Math.abs(pl.y - p.at[1]) <= 2); // (the farm: its front, or inside the barn)
    if (!here) return;
    G.chapters.scene(f, arrived(f, v));
  };
  FV.targets = function (f) {
    const v = onNow(); if (!v || !f) return [];
    if (FV.TARGETS[v.kind]) { try { return FV.TARGETS[v.kind](f, v) || []; } catch (e) { return []; } }
    if (v.kind === 'go') { const p = PLACES[v.word]; if (p.at && f.mapId === (p.on || 'villa')) return [{ x: p.at[0] * T + 12, y: p.at[1] * T + 12, spot: 'fav:' + v.word }]; return []; }
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
    G.errands.waitsIn = (m, o) => ew(m, o) || FV.waitsIn(m);
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
    yield* G.ask({ prompt: '¡La palabra del día!', en: 'The word of the day: what is it? Say it!', show: id, choices: c.choices, answer: c.answer, layout: 'cards', display: 'text', who: 'luna', review: true });
    st().pal = G.words.day(); G.st.autosave();
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star');
    if (G.hearts) G.hearts.add('luna', 1, 'care');
    yield sayShow('luna', { icon: 'manana' }, TT('¡Muy bien! ¡Hasta mañana!', 'Very good! A new word tomorrow!')); // (the sun coming up: tomorrow)
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
