// ===== El bosque: the zone north of Villa Sol (docs/WORLD_PLAN.md) — woodland animals, big and small =====
// Its path from Villa Sol (the trees get thicker, a pond with a frog, rabbits) and one big forest map: a rock cliff
// along the top with a waterfall into a pond, a meadow (deer, rabbits), the bears' cave in a rock outcrop, a river
// across the middle with a little bridge and stepping stones, then the south woods: a clearing ringed by tall trees,
// Doña Lupe's log cabin with her blackberry bushes, a hollow log, groves to wander in. Two more maps: the cave inside
// (dark, glowing mushrooms, fireflies, mama bear asleep) and Lupe's cabin inside. At night the forest goes dark blue,
// fireflies come out in the clearing and an owl sits in a tall tree.
// Everything here only uses universal words and the forest's own words, each met here in a one-unknown puzzle and used
// again soon after (G.zones.meetW: a word not met yet is introduced, a word met elsewhere comes back as a question), so
// the forest can be the very first place a child explores.
//   The album (8): la ardilla (runs up the trees), el venado (bounds away), el zorro, el mapache, el erizo, el oso
//     (rare: asleep in the cave), el búho (rare: at night), la luciérnaga (in the cave; at night in the clearing).
//     Tapping one whose word isn't met yet: Lola calls out its name (a one-unknown puzzle).
//   The story (its quest line, 'bosque'): 1 El osito perdido (oso, pequeño, grande, cueva: a lost bear cub, the dog
//     follows the paw prints to the cave, mama bear comes out), 2 Las bellotas de la ardilla (ardilla, bellota, hoja:
//     find the squirrel's acorns under the leaf piles; a hedgehog pops out of one), 3 Los binoculares de Elena (tronco,
//     mapache, venado, zorro: a raccoon took them into the hollow log; then look far through them).
//   Side quests (G.state.bosque): Lola's leaves (three colours, ¡todas!), Doña Lupe's blackberry pie (la canasta: pick
//     four bushes, then the pie; every day), ¿grande o pequeño? (Elena's mushroom game, after chapter 1), fireflies in
//     Lola's jar at night. The dog sniffs the hollow log, follows a trail of paw prints, and swims across the river for
//     a stick. Nico's hide-and-seek has six forest hiding places. Two notebook page puzzles.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA, CH = G.chapters, CK = CH.K, T = CK.T, TL = G.TILE, AN = G.animals;
  const P = (m, tag) => MD[m].pos[tag];
  const W = id => G.data.words[id];
  const met = id => !!(G.words && G.words.met(id));
  const say = CK.say, sayShow = CK.sayShow, tell = CK.tell, ask = CK.ask;
  const tile = (x, y) => ({ x: x * TL + 12, y: y * TL });
  const day = () => (G.words ? G.words.day() : 0);
  const meetW = (id, o) => Z.meetW(id, o);
  const night = () => !!(G.day && G.day.over && G.day.over());

  // ---------- the path from Villa Sol: the trees get thicker, a pond with a frog, rabbits, a fallen branch ----------
  G.maps.camino_bosque = {
    name: 'El camino al bosque', icon: 'bosque', rows: MD.camino_bosque.rows, music: 'field',
    exits: [Z.edge(6, 25, 'villa', 10, 1, 'down'), Z.edge(6, 0, 'bosque', 18, 28, 'up')],
    posts: [{ at: P('camino_bosque', 'postS'), zone: 'villa', dir: 'down' }, { at: P('camino_bosque', 'postN'), zone: 'bosque', dir: 'up' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'rana', area: 'rana' }, { kind: 'conejo', area: 'conejos' }],
    things: {},
    npcs: [K.canelo(6, 23)],
  };

  // =====================================================================
  //  The animals (src/animals.js addKind: a generic move each, pixel frames facing right, a cry)
  // =====================================================================
  const tone = (...a) => AN.tone(...a), noise = (...a) => AN.noise(...a);
  // frames of one kind, padded to one size (feet on the bottom row)
  const pad = spr => {
    const ks = Object.keys(spr).filter(k => k !== 'pal'), w = Math.max(...ks.map(k => Math.max(...spr[k].map(r => r.length)))), h = Math.max(...ks.map(k => spr[k].length));
    for (const k of ks) spr[k] = Array(h - spr[k].length).fill('.'.repeat(w)).concat(spr[k].map(r => r.padEnd(w, '.')));
    return spr;
  };
  AN.addKind('ardilla', { word: 'ardilla', cry: '¡Chic, chic!', move: 'climb', speed: 0.9, shadow: 6, high: 26,
    sfx: () => { for (const at of [0, 0.08, 0.16, 0.34, 0.42]) tone('square', 2400, 1900, 0.04, 0.03, at, { filter: 'bandpass', ff: 2600, q: 3 }); },
    spr: pad({ pal: { o: '#c0662a', l: '#e08a40', c: '#f8e0b8', e: '#101010', d: '#7a3a14' },
      stand: ['..lll.......', '.llll....o.o', 'lll.l....ooo', 'll...l..oeoo', 'll...l.ooooc', '.l...looooo.', '..l.loocco..', '...lloocco..', '....looooo..', '.....d..dd..'],
      walk: ['............', '........o.o.', 'llll....ooo.', 'lllll..oeooo', '.lllloooooc.', '...looooooo.', '...oooccoo..', '...oo....oo.', '..d.......d.', '............'],
      climb: ['....o.o.....', '....ooo.....', '....oeo.....', '...ooooo....', '..doooood...', '...ooooo....', '...ooooo....', '..dlooood...', '..ll........', '.ll.........'],
      climb2: ['....o.o.....', '....ooo.....', '....oeo.....', '..dooooo....', '...oooood...', '...ooooo....', '...ooooo....', '...looooo...', '..ll..d.....', '.ll.........'] }) });
  AN.addKind('venado', { word: 'venado', cry: null, move: 'shy', speed: 0.3, shadow: 12,
    sfx: () => { tone('sine', 900, 1300, 0.12, 0.06); tone('sine', 1100, 700, 0.18, 0.05, 0.14); },
    spr: pad({ pal: { b: '#b87838', l: '#d89858', w: '#f8e8c8', k: '#4a2a10', a: '#7a5028', e: '#101010' },
      stand: ['..........a.a..', '...........a...', '.........wbbb..', '.........bbebk.', '..........bbb..', '.........bb....', '.w.bbbbbbbb....', 'wwbbwbbwbbb....', '..bbbbbbbbl....', '..b.b....b.b...', '..b.b....b.b...', '..k.k....k.k...'],
      walk: ['..........a.a..', '...........a...', '.........wbbb..', '.........bbebk.', '..........bbb..', '.........bb....', '.w.bbbbbbbb....', 'wwbbwbbwbbb....', '..bbbbbbbbl....', '..b..b..b..b...', '.b...b..b...b..', '.k...k..k...k..'],
      graze: ['...............', '...............', '...............', '...............', '...............', '...............', '.w.bbbbbbbb....', 'wwbbwbbwbbbb.a.', '..bbbbbbbbbbbaa', '..b.b....b.bbeb', '..b.b....b.b.bk', '..k.k....k.k...'],
      jump: ['...........a.a.', '............a..', '..........wbbb.', '..........bbebk', '.w........bbb..', 'ww.bbbbbbbbb...', '..bbwbbwbbbb...', '..bbbbbbbbl....', '.bb.......bb...', 'bk.........bb..', '............k..', '...............'] }) });
  AN.addKind('zorro', { word: 'zorro', cry: '¡Auuu!', move: 'walk', speed: 0.55, shadow: 10,
    sfx: () => { tone('sawtooth', 700, 1100, 0.2, 0.05, 0, { filter: 'bandpass', ff: 1200, q: 3 }); tone('sawtooth', 1100, 800, 0.25, 0.04, 0.2, { filter: 'bandpass', ff: 1200, q: 3 }); },
    spr: pad({ pal: { o: '#e06a20', w: '#fff4e8', k: '#302018', e: '#101010', t: '#ffffff' },
      stand: ['...........o.o.', '...........ooo.', '..ooo.....ooeok', '.tooooooooooww.', 'ttoooooooooow..', '..oowwwwooo....', '...k.k...k.k...', '...k.k...k.k...'],
      walk: ['...........o.o.', '...........ooo.', '..ooo.....ooeok', '.tooooooooooww.', 'ttoooooooooow..', '..oowwwwooo....', '..k...k.k...k..', '.k.....k.....k.'],
      react: ['.........o.o...', '.........ooo...', '........ooeok..', '........ooww...', '.......ooow....', '..tt..ooooo....', '.ttooooooow....', '..ooooooook....'] }) });
  AN.addKind('mapache', { word: 'mapache', cry: '¡Chirr!', move: 'walk', speed: 0.45, shadow: 10,
    sfx: () => { for (const at of [0, 0.1, 0.2]) tone('square', 1500, 1200, 0.06, 0.03, at, { filter: 'lowpass', ff: 2000 }); },
    spr: pad({ pal: { g: '#8a8a92', d: '#5a5a62', k: '#202028', w: '#f4f0ea', e: '#ffffff' },
      stand: ['..........d.d.', '..........ggg.', '.........gkekk', 'kgkgk...gwwggw', 'gkgkggggggggk.', '.gggggggggg...', '..dd.d...d.dd.'],
      walk: ['..........d.d.', '..........ggg.', '.........gkekk', 'kgkgk...gwwggw', 'gkgkggggggggk.', '.gggggggggg...', '.d..d.....d..d'],
      react: ['......d.d.....', '......ggg.....', '.....kekkg....', '......wwg.....', '.....ggggg.w..', '...kggggggww..', '..kgkgggg.....', '.kgk.gggg.....', '.....d..d.....'] }) });
  AN.addKind('erizo', { word: 'erizo', cry: null, move: 'crawl', speed: 0.18, shadow: 9,
    sfx: () => { for (const at of [0, 0.07, 0.14]) noise(5200, 0.03, 0.08, at); },
    spr: pad({ pal: { s: '#6a4826', d: '#4a3018', l: '#c8a070', f: '#e8c8a0', e: '#101010' },
      walk: ['...ddd.....', '.ddsdsd....', 'dsdsdsdsf..', 'dsssssssffe', 'sssssssfff.', '.f..f..f...'],
      walk2: ['...ddd.....', '.ddsdsd....', 'dsdsdsdsf..', 'dsssssssffe', 'sssssssfff.', '..f..f...f.'],
      hide: ['...........', '..ddd......', '.dsdsd.....', 'dsdsdsd....', 'dsssssd....', '.ddddd.....'] }) });
  AN.addKind('oso', { word: 'oso', cry: '¡Grrr... zzz!', move: 'still', shadow: 40, scale: 2,
    sfx: () => { tone('sawtooth', 110, 80, 0.5, 0.12, 0, { filter: 'lowpass', ff: 500 }); },
    spr: pad({ pal: { b: '#8a5428', d: '#5a3418', l: '#b07840', m: '#e8c8a0', k: '#101010' },
      stand: ['...dd.dd...............', '..dbbbbbd..............', '.dbbbbbbbd.bbbbbbb.....', 'dbkbbbbbbbbbbbbbbbbbb..', 'bmmbbbbbbbbbbbbbbbbbbb.', 'bmkmbbbbbbblbbbbbbbbbbb', '.mmbbbbbbblllbbbbbbbbbb', '..bbbbbbbbllbbbbbbbbbbd', '...dbbd...bbbbbbbbbbbd.', '..........dd.....dd....'],
      alt: ['...dd.dd...............', '..dbbbbbd..bbbbbb......', '.dbbbbbbbdbbbbbbbbb....', 'dbkbbbbbbbbbbbbbbbbbbb.', 'bmmbbbbbbbbbbbbbbbbbbbb', 'bmkmbbbbbbblbbbbbbbbbbb', '.mmbbbbbbblllbbbbbbbbbb', '..bbbbbbbbllbbbbbbbbbbd', '...dbbd...bbbbbbbbbbbd.', '..........dd.....dd....'] }) });
  AN.addKind('buho', { word: 'buho', cry: '¡Uh, uh!', move: 'still', shadow: 0,
    sfx: () => { tone('sine', 380, 340, 0.3, 0.12, 0); tone('sine', 380, 330, 0.4, 0.12, 0.42); },
    spr: pad({ pal: { b: '#9a6a38', d: '#6a4420', c: '#e8d0a0', w: '#fff4d0', y: '#f8b020', e: '#101010', o: '#e89020' },
      stand: ['d.....d', 'dbbbbbd', 'wybbbyw', 'yebobey', 'wbbobbw', 'bcccccb', 'bcbcbcb', '.ccccc.', '..o.o..'],
      alt: ['d.....d', 'dbbbbbd', 'bdbbbdb', 'bbbobbb', 'bbbobbb', 'bcccccb', 'bcbcbcb', '.ccccc.', '..o.o..'] }) });
  AN.addKind('luciernaga', { word: 'luciernaga', cry: null, move: 'flit', speed: 0.25, shadow: 0, glow: 'rgba(250,245,140,0.9)',
    sfx: () => { tone('sine', 2200, 3200, 0.12, 0.04); tone('sine', 2800, 3600, 0.1, 0.03, 0.1); },
    spr: pad({ pal: { k: '#302830', w: '#d8f0ff', y: '#f8f080', Y: '#fffcd0' },
      stand: ['w.w..', '.kk..', 'wkkw.', '.yY..', '.yy..'],
      alt: ['.....', 'wkkw.', '.kk..', '.yY..', '.Yy..'] }) });
  const KINDS = ['ardilla', 'venado', 'zorro', 'mapache', 'erizo', 'oso', 'buho', 'luciernaga'];
  const EN = { ardilla: 'A squirrel!', venado: 'A deer!', zorro: 'A fox!', mapache: 'A raccoon!', erizo: 'A hedgehog!', oso: 'A bear!', buho: 'An owl!', luciernaga: 'A firefly!' };

  // =====================================================================
  //  Saved state of the forest's side quests: G.state.bosque
  // =====================================================================
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.bosque)) s.bosque = {};
    const b = s.bosque; if (!isObj(b.leaves)) b.leaves = {}; if (!isObj(b.pie)) b.pie = {}; if (!isObj(b.sort)) b.sort = {}; if (!isObj(b.jar)) b.jar = {};
    return b;
  }
  const BQ = G.bosque = { state: () => (G.state ? st() : null) };
  const held = () => (G.carry ? G.carry.held() : null);
  const bag = () => G.errands.bag;
  const othersFor = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== id).slice(0, 2);
  // a known word's quick question, picture cards (the mic is on): [answer, ...others] among the ones met
  const quiz = (who, prompt, en, answer, others, o) => ask(who, prompt, en, answer, others.filter(k => k !== answer && met(k)).slice(0, 2), o || {});
  const npcAt = (f, id) => f.npcs.find(n => n.id === id && !n.hidden) || null;
  const cub = { icon: 'oso', n: 's' };
  BQ.KINDS = KINDS;

  // =====================================================================
  //  Tapping an animal whose word isn't met yet: Lola calls out its name (a one-unknown puzzle)
  // =====================================================================
  const tapped0 = AN.tapped;
  AN.tapped = function (f, a) {
    const r = tapped0.call(this, f, a);
    if (f && Z.of(f.mapId) === 'bosque' && KINDS.includes(a.kind) && !met(a.kind) && !f.locked && G.top() === f && !CH.running()) {
      CH.scene(f, (function* () {
        yield 30;
        if (met(a.kind)) return;
        CH.point(a.x, a.y - 14);
        try { yield* G.intro.show(a.kind, { who: 'lola', prompt: '¡Mira! ¡[' + a.kind + ']!', en: 'Look! ' + EN[a.kind], known: othersFor(a.kind, KINDS) }); } finally { CH.point(null); }
      })());
    }
    if (f && Z.of(f.mapId) === 'bosque' && a.kind === 'luciernaga' && jarOn()) jarCatch(f, a);
    return r;
  };

  // =====================================================================
  //  The people: Elena the ranger, Doña Lupe; Lola and Nico as everywhere
  // =====================================================================
  const sideAlert = {};
  // a forest person's talk: the story first, then their side quest, then the town's (presents, favours...), then a line
  function person(id, x, y, dir, side, line, o = {}) {
    return Object.assign({ id, npc: id, x, y, dir, fixed: !!o.fixed, wander: o.wander || 0,
      alert: () => CH.alert(id) || (G.state && sideAlert[id] ? sideAlert[id]() : null) || (G.favores && G.favores.alert(id)) || null,
      talk: function* (f) {
        if (yield* CH.talk(id, f)) return;
        if (side && (yield* side(f))) return;
        if (G.errands && (yield* G.errands.talk(id, f))) return;
        yield* line(f);
      } }, o.extra || {});
  }
  function* elenaLine() {
    if (CH.done('bosque3')) yield* sayShow('elena', { icon: 'binoculares' }, T('¡Mis binoculares! ¡[gracias:Gracias], {name}!', 'My binoculars! Thank you, {name}!'));
    else if (met('elbosque')) yield* sayShow('elena', 'elbosque', T('¡Mi [elbosque]!', 'My forest! I look after it.'));
    else yield* say('elena', T('¡Hola, {name}!', 'Hello, {name}!'));
  }
  function* lupeLine() {
    if (met('mora')) yield* sayShow('lupe', 'mora', T('¡Mmm! ¡[mora:Moras]!', 'Mmm! Blackberries!'));
    else yield* say('lupe', T('¡Hola, {name}!', 'Hello, {name}!'));
  }

  // ---------- Lola: her leaves (three colours); her first talk here meets el bosque and shows the dog's spot ----------
  const LEAVES = ['verde', 'amarillo', 'rojo'];
  const leafPic = col => ({ icon: 'hoja', col: W(col).col });
  BQ.LEAVES = LEAVES;
  BQ.leavesHave = () => LEAVES.filter(c => st().leaves[c]);
  BQ.leavesDone = () => LEAVES.every(c => st().leaves[c]);
  const lola = Z.lola(...P('bosque', 'lola'), 'bosque');
  const lolaTalk0 = lola.talk, lolaAlert0 = lola.alert;
  const leafHeld = () => { const h = held(); return h && h.id === 'hoja' && LEAVES.includes(h.col) ? h : null; };
  lola.alert = () => {
    const a = CH.alert('lola'); if (a) return a;
    if (jarAsk()) return { icon: 'frasco' };
    if (jarOn() && jarFull()) return { icon: 'frasco' };
    const h = leafHeld(); if (h && !st().leaves[h.col]) return leafPic(h.col);
    return lolaAlert0();
  };
  lola.talk = function* (f) {
    if (G.state && !CH.alert('lola')) {
      const h = leafHeld(); if (h) { yield* leafIn(f, h); return; }
      if (jarAsk() || (jarOn() && jarFull())) { yield* jarTalk(f); return; }
    }
    yield* lolaTalk0(f);
  };
  function* leafIn(f, h) {
    if (st().leaves[h.col]) { yield* sayShow('lola', { list: BQ.leavesHave().map(leafPic) }, T('¡Ya la tengo! ¡Otra!', 'I have that one already! Find another colour.')); return; }
    bag().take('hoja', { col: h.col, q: null }); st().leaves[h.col] = 1; G.audio.jingle('item'); G.st.autosave();
    const n = BQ.leavesHave().length, nums = ['uno', 'dos', 'tres'];
    yield* sayShow('lola', { list: BQ.leavesHave().map(leafPic) }, T('¡Una [hoja]! ¡[gracias:Gracias]!', 'A leaf! Thank you! (' + n + ' of 3 colours)'));
    if (met(nums[n - 1])) yield* quiz('lola', '¿Cuántas?', 'How many leaves has she got now?', nums[n - 1], nums.filter((k, i) => i !== n - 1), { show: { icon: 'hoja', count: n } });
    if (BQ.leavesDone()) {
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('lola', { list: LEAVES.map(leafPic) }, T('¡Todas! ¡Qué bonitas!', 'All three colours! How pretty! Thank you, {name}!'));
      yield* quiz('lola', '¿Qué es?', 'And what are they?', 'hoja', ['mora', 'hongo', 'bellota']);
    } else yield* sayShow('lola', { list: LEAVES.filter(c => !st().leaves[c]).map(leafPic) }, T('¡Más, {name}!', 'More! Find the colours I don\'t have yet!'));
  }
  // Lola's extra lines here (zones.js calls them after her hello and the forest's picture)
  function* lolaHere(f) {
    if (!met('elbosque')) yield* G.intro.show('elbosque', { who: 'lola', prompt: '¡El [elbosque]!', en: 'The forest!', known: othersFor('elbosque', ['arbol', 'flor', 'agua']) });
    const sp = (f.def.dogSpots || []).find(s => Z.dogReady(s));
    if (sp && G.pet && G.pet.mine()) {
      CH.point(sp.at[0] * TL + 12, sp.at[1] * TL);
      try { yield* sayShow('lola', { icon: 'huella' }, T('¡Mira, {dog}!', 'Look! {dog} can play over there: tap the paw prints!')); } finally { CH.point(null); }
    }
    if (!BQ.leavesDone()) { // her collection: leaves of three colours
      if (!met('hoja')) yield* G.intro.show('hoja', { who: 'lola', prompt: '¡Mira! ¡Una [hoja]!', en: 'Look! A leaf!', show: leafPic('rojo'), known: othersFor('hoja', ['elbosque', 'arbol', 'flor']) });
      yield* sayShow('lola', { list: LEAVES.map(leafPic) }, T('¿Me ayudas? ¡[hoja:Hojas]!', 'Will you help me? I collect leaves: one of each colour! Pick them up and bring them to me.'));
      st().asked = { d: day() }; G.st.autosave();
    }
  }

  // ---------- fireflies at night: Lola's jar (catch five, count them, let them go) ----------
  const jar = () => { const j = st().jar; if (j.d !== day()) { j.d = day(); j.n = 0; j.on = false; j.done = false; } return j; };
  const jarAsk = () => night() && !jar().on && !jar().done;
  const jarOn = () => !!G.state && night() && jar().on && !jar().done;
  const jarFull = () => jar().n >= 5;
  BQ.jar = jar;
  function* jarTalk(f) {
    const j = jar();
    if (!j.on) {
      yield* sayShow('lola', { icon: 'frasco' }, T('¡Shhh! ¡Mira!', 'Shhh! Look! The fireflies are out!'));
      yield* meetW('luciernaga', { who: 'lola', prompt: '¡[luciernaga:Luciérnagas]!', en: 'Fireflies!', known: othersFor('luciernaga', KINDS) });
      j.on = true; j.n = 0; G.st.autosave();
      yield* sayShow('lola', { icon: 'frasco' }, T('¡Cinco, {name}!', 'Catch five! Tap the fireflies and they fly into my jar.'));
      return;
    }
    // full: count them, let them go
    if (met('cinco')) yield* quiz('lola', '¿Cuántas?', 'How many fireflies are in the jar?', 'cinco', ['cuatro', 'seis', 'tres'], { show: { icon: 'luciernaga', count: 5 } });
    yield* sayShow('lola', { icon: 'frasco' }, T('¡[adios:Adiós], [luciernaga:luciérnagas]!', 'Off you go, fireflies! (she opens the jar)'));
    j.done = true; j.on = false; BQ.freed = G.frame; G.audio.jingle('promote'); CK.confetti(); G.st.autosave();
  }
  function jarCatch(f, a) {
    const j = jar(); if (j.n >= 5) return;
    j.n++; G.audio.sfx('chime'); G.st.autosave();
    BQ.fly = { x: a.x, y: a.y - a.z - 4, t: G.frame };
    const [hx, hy] = P('bosque', 'lola'); void hx; void hy;
    const i = f.zoo.list.indexOf(a); if (i >= 0 && f.zoo.list.filter(b => b.kind === 'luciernaga').length > 1) f.zoo.list.splice(i, 1);
  }

  // =====================================================================
  //  Side quests: places on the map (Lupe's blackberry bushes, Elena's mushrooms)
  // =====================================================================
  const BUSHES = [[2, 19], [4, 20], [7, 21], [10, 20], [3, 23]];
  const SORT_AT = P('bosque', 'sorter');
  // Elena's mushroom game: four mushrooms by her basket, two big and two little ones
  const SHROOMS = [{ at: [SORT_AT[0] - 1, SORT_AT[1]], big: true }, { at: [SORT_AT[0] + 1, SORT_AT[1]], big: false }, { at: [SORT_AT[0], SORT_AT[1] + 1], big: false }, { at: [SORT_AT[0] + 2, SORT_AT[1] + 1], big: true }];
  // Lupe's pie today: {d, n: bushes picked (0..4), got: {i: true}, baked}; the basket in your hands
  const pie = () => { const p = st().pie; if (p.d !== day()) { p.d = day(); p.n = 0; p.got = {}; p.baked = false; p.on = false; } return p; };
  const basket = () => bag().list().find(it => it.id === 'canastamoras' && it.q === 'pay') || null;
  const sort = () => { const s = st().sort; if (s.d !== day()) { s.d = day(); s.round = 0; s.on = false; s.done = false; s.gone = {}; } return s; };
  const sortOpen = () => CH.done('bosque1');
  const SIDE = [
    ...BUSHES.map((at, i) => ({ id: 'bush' + i, at, on: () => !!basket() && !pie().got[i] && pie().n < 4, icon: () => 'mora', run: f => pickBush(f, i) })),
    ...SHROOMS.map((m, i) => ({ id: 'shroom' + i, at: m.at, on: () => sortOpen() && sort().on && !sort().gone[i], icon: () => null, run: f => shroomTry(f, i) })),
  ];
  BQ.SIDE = SIDE; BQ.BUSHES = BUSHES; BQ.SHROOMS = SHROOMS; BQ.pie = pie; BQ.sort = sort;
  const sideAt = (f, x, y) => (f && f.mapId === 'bosque' && G.state ? SIDE.find(s => s.at[0] === x && s.at[1] === y && s.on()) || null : null);
  BQ.sideAt = sideAt;

  // ---------- Doña Lupe's blackberry pie: la canasta, pick four bushes, then she bakes it ----------
  sideAlert.lupe = () => {
    const p = pie(), b = basket();
    if (b) return p.n >= 4 ? { icon: 'canastamoras' } : null;
    if (!p.baked) return { icon: 'pay' };
    return null;
  };
  function* lupeSide(f) {
    const p = pie(), b = basket();
    if (b && p.n >= 4) { yield* bake(f); return true; }
    if (b) { yield* sayShow('lupe', 'mora', T('¡Más [mora:moras]!', 'More blackberries, please! (tap the bushes)')); return true; }
    if (p.baked) return false;
    yield* say('lupe', T('¡Hola, {name}! Soy Doña Lupe.', 'Hello, {name}! I\'m Doña Lupe. I bake pies!'));
    yield* sayShow('lupe', { icon: 'pay' }, T('¡Un pay! ¿Me ayudas?', 'A pie! Will you help me?'));
    if (!met('mora')) yield* G.intro.show('mora', { who: 'lupe', prompt: '¡Con [mora:moras]!', en: 'With blackberries!', known: othersFor('mora', ['bellota', 'hoja', 'hongo', 'manzana']) });
    else yield* quiz('lupe', '¿Qué es?', 'What goes in the pie?', 'mora', ['bellota', 'hongo', 'hoja', 'manzana'], { show: 'mora' });
    bag().add('canastamoras', { q: 'pay' }); p.on = true; G.st.autosave();
    const at = BUSHES.find((b, i) => !p.got[i]); if (at) CH.point(at[0] * TL + 12, at[1] * TL);
    try { yield* sayShow('lupe', { icon: 'mora', count: 4 }, T('¡[mora:Moras], [porfavor:por favor]!', 'Blackberries, please! Four bushes: tap them.')); } finally { CH.point(null); }
    return true;
  }
  function* pickBush(f, i) {
    const p = pie(); if (p.got[i] || p.n >= 4) return;
    const [x, y] = BUSHES[i];
    G.audio.sfx('pop'); for (let k = 0; k < 6; k++) CK.puff('crumb', x * TL + 12 + (Math.random() - 0.5) * 14, y * TL + 8, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.15, life: 26 });
    CK.sparkle(f, x, y, 3); p.got[i] = true; p.n++; G.st.autosave();
    yield 16;
    G.world.name('mora', x * TL + 12, y * TL - 6, { grow: 'carry' });
    const nums = ['uno', 'dos', 'tres', 'cuatro'];
    if (p.n === 2 && met('dos')) yield* quiz('lupe', '¿Cuántas?', 'How many bushes have you picked?', 'dos', ['tres', 'uno'], { show: { icon: 'mora', count: 2 } });
    if (p.n >= 4) {
      const n = npcAt(f, 'lupe'); if (n) CH.pointNpc(n);
      try { yield* sayShow('lupe', { icon: 'canastamoras' }, T('¡' + (met('cuatro') ? '[cuatro:Cuatro]' : 'Cuatro') + '! ¡Al pay!', 'Four! Now bring the basket to Doña Lupe.')); } finally { CH.point(null); }
    }
    void nums;
  }
  function* bake(f) {
    const p = pie();
    bag().take('canastamoras', { q: 'pay' }); G.st.autosave();
    yield* sayShow('lupe', { icon: 'canastamoras' }, T('¡Mmm! ¡[mora:Moras]! ¡[gracias:Gracias]!', 'Mmm! Blackberries! Thank you!'));
    if (met('cuatro')) yield* quiz('lupe', '¿Cuántas?', 'How many bushes did you pick?', 'cuatro', ['tres', 'cinco'], { show: { icon: 'mora', count: 4 } });
    const [dx, dy] = P('bosque', 'cabinDoor');
    for (let k = 0; k < 3; k++) { G.audio.sfx('select'); for (let i = 0; i < 4; i++) CK.puff('dust', dx * TL + 12 + (Math.random() - 0.5) * 30, dy * TL - 20, { vy: -0.6, life: 40 }); yield 20; }
    p.baked = true; st().pies = (st().pies | 0) + 1; G.audio.jingle('promote'); CK.confetti();
    bag().add('pay');
    yield* sayShow('lupe', { icon: 'pay' }, T('¡Un pay! ¡Para ti!', 'A blackberry pie! For you! (share it: {dog} loves pie)'));
    G.st.autosave();
  }
  if (G.carry) Object.assign(G.carry.DOG, { pay: 'eat', mora: 'eat', bellota: 'sniff' });

  // ---------- ¿grande o pequeño? Elena's mushroom game (after chapter 1: grande, pequeño) ----------
  const ROUNDS = [true, false, false, true]; // big, small, small, big
  sideAlert.elena = () => {
    if (!sortOpen()) return null;
    const s = sort(); if (s.done) return null;
    return s.on ? null : { icon: 'hongo' };
  };
  function* elenaSide(f) {
    if (!sortOpen()) return false;
    const s = sort(); if (s.done) return false;
    if (s.on) { yield* sayShow('elena', { icon: 'hongo', n: ROUNDS[s.round] ? 'b' : 's' }, T(ROUNDS[s.round] ? '¡El [hongo] [grande]!' : '¡El [hongo] [pequeno:pequeño]!', ROUNDS[s.round] ? 'The big mushroom! Tap it.' : 'The little mushroom! Tap it.')); return true; }
    yield* sayShow('elena', { icon: 'hongo' }, T('¡{name}! ¡Un juego!', '{name}! A game! Mushrooms, big and small.'));
    if (!met('hongo')) yield* G.intro.show('hongo', { who: 'elena', prompt: '¡Un [hongo]!', en: 'A mushroom!', known: othersFor('hongo', ['oso', 'cueva', 'arbol', 'flor']) });
    s.on = true; s.round = 0; s.gone = {}; G.st.autosave();
    CH.point(SORT_AT[0] * TL + 24, SORT_AT[1] * TL + 12);
    try { yield* sayShow('elena', { icon: 'hongo', n: 'b' }, T('¡El [hongo] [grande]!', 'The big mushroom! Tap it.')); } finally { CH.point(null); }
    return true;
  }
  function* shroomTry(f, i) {
    const s = sort(), m = SHROOMS[i], want = ROUNDS[s.round];
    G.audio.sfx('select');
    if (m.big !== want) { BQ.wob = { i, t: 24 }; G.audio.sfx('boop'); yield 10; yield* sayShow('elena', { icon: 'hongo', n: want ? 'b' : 's' }, T(want ? '¡No! ¡El [grande]!' : '¡No! ¡El [pequeno:pequeño]!', want ? 'No! The BIG one!' : 'No! The LITTLE one!')); return; }
    s.gone[i] = G.frame; CK.sparkle(f, m.at[0], m.at[1], 4); G.audio.sfx('chime'); G.st.autosave();
    yield 14;
    yield* quiz('elena', '¿Cómo es?', 'Is it big or small? (say it!)', want ? 'grande' : 'pequeno', [want ? 'pequeno' : 'grande'], { show: { icon: 'hongo', n: want ? 'b' : 's' } });
    s.round++;
    if (s.round >= ROUNDS.length) {
      s.done = true; s.on = false; st().sorted = (st().sorted | 0) + 1; G.audio.jingle('promote'); CK.confetti(); G.st.autosave();
      yield* sayShow('elena', { list: [{ icon: 'hongo', n: 'b' }, { icon: 'hongo', n: 's' }, { icon: 'hongo', n: 's' }, { icon: 'hongo', n: 'b' }] }, T('¡Muy bien, {name}!', 'Well done, {name}! Big and small. Come and play again tomorrow!'));
      return;
    }
    yield* sayShow('elena', { icon: 'hongo', n: ROUNDS[s.round] ? 'b' : 's' }, T(ROUNDS[s.round] ? '¡Ahora el [grande]!' : '¡Ahora el [pequeno:pequeño]!', ROUNDS[s.round] ? 'Now the big one!' : 'Now the little one!'));
  }

  // ---------- the map's side places: taps, the guide, pictures (zones.js hooks, only in the forest) ----------
  const zSearch = Z.search, zSpecial = Z.special, zBlocks = Z.blocks, zGoal = Z.goal, zUnder = Z.drawUnder, zTop = Z.drawTop, zTask = Z.task;
  Z.search = (f, x, y) => { const s = sideAt(f, x, y); if (s) return s.run(f); if (f && f.mapId === 'bosque' && CH.spotAt(f, x, y)) return null; return zSearch(f, x, y); }; // (a story place wins over the dog's spot on the same tile: the hollow log)
  Z.special = (f, x, y) => !!sideAt(f, x, y) || zSpecial(f, x, y);
  Z.blocks = (f, x, y) => zBlocks(f, x, y) || (f.mapId === 'bosque' && G.state && sortOpen() && sort().on && SHROOMS.some((m, i) => m.at[0] === x && m.at[1] === y && !sort().gone[i]));
  const pt = (at, lift, icon) => ({ x: at[0] * TL + 12, y: at[1] * TL + 12, lift, icon });
  Z.task = function (f) { // things going on: the basket in your hands, Elena's mushrooms, the fireflies for the jar
    if (f && f.mapId === 'bosque' && G.state) {
      const b = basket(), p = pie();
      if (b && p.n < 4) { const near = BUSHES.map((at, i) => ({ at, i })).filter(o => !p.got[o.i]); if (near.length) return { why: 'bosque: pick blackberries', pts: [pt(near[0].at, 30, 'mora')] }; }
      if (b && p.n >= 4) { const n = npcAt(f, 'lupe'); if (n) return { why: 'bosque: the basket to Lupe', pts: [{ x: n.x * TL + 12, y: n.y * TL + 12, lift: 44, npc: n }] }; }
      if (sortOpen() && sort().on) return { why: 'bosque: big or small', choice: true, pts: SHROOMS.filter((m, i) => !sort().gone[i]).map(m => pt(m.at, 18)) };
      if (jarOn() && !jarFull()) { const a = AN.find('luciernaga', f); if (a) return { why: 'bosque: fireflies', pts: [{ x: a.x, y: a.y - 10, lift: 24, icon: 'frasco' }] }; }
      if (jarOn() && jarFull()) { const n = npcAt(f, 'lola'); if (n) return { why: 'bosque: the jar to Lola', pts: [{ x: n.x * TL + 12, y: n.y * TL + 12, lift: 44, npc: n }] }; }
    }
    return zTask(f);
  };
  Z.goal = function (f) { // suggestions: a leaf Lola is missing
    if (f && f.mapId === 'bosque' && G.state) {
      if (st().asked && st().asked.d === day() && !BQ.leavesDone() && !held()) {
        const pl = f.player, srcs = G.carry.SOURCES.filter(s => s.map === 'bosque' && s.item === 'hoja' && !st().leaves[s.col] && G.carry.avail(s.id))
          .sort((a, b) => Math.abs(a.at[0] - pl.x) + Math.abs(a.at[1] - pl.y) - Math.abs(b.at[0] - pl.x) - Math.abs(b.at[1] - pl.y));
        if (srcs.length) return { why: 'bosque: a leaf for Lola', pts: [pt(srcs[0].at, 20, leafPic(srcs[0].col))] };
      }
    }
    return zGoal(f);
  };
  // little sprites drawn by the zone (the bear cub, the squirrel on its oak, leaf piles...): rows of letters, cached
  const OL = '#1a1420';
  function spr(id, rs, pal, flip) {
    const w = Math.max(...rs.map(r => r.length)), h = rs.length;
    return G.cached('bq|' + id + (flip ? '|f' : ''), w + 2, h + 2, ctx => {
      const at = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return null; const c = (rs[y][flip ? w - 1 - x : x] || '.'); return c === '.' ? null : c; };
      ctx.fillStyle = OL;
      for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) if (!at(x, y) && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) ctx.fillRect(x + 1, y + 1, 1, 1);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = at(x, y); if (c && pal[c]) { ctx.fillStyle = pal[c]; ctx.fillRect(x + 1, y + 1, 1, 1); } }
    });
  }
  const CUB_PAL = { b: '#b87838', d: '#7a4a20', m: '#f0d8b0', k: '#101010', t: '#68c0ff' };
  const CUB = { sit: ['.d..d...', '.bbbb...', 'bkbbkb..', 'bbmmbb..', '.bkkb...', 'bbbbbb..', 'bbbbbbb.', '.dd.dd..'],
    cry: ['.d..d...', '.bbbb...', 'bkbbkb..', 'tbmmbt..', '.bkkb...', 'bbbbbb..', 'bbbbbbb.', '.dd.dd..'],
    walk: ['........', '..d..d..', '..bbbb..', '.bbkbbk.', 'bbbbbmm.', 'bbbbbbk.', '.d.d.d..', 'd.....d.'] };
  const LEAFPILE = ['....l..o....', '..ooolly.o..', '.lyoorrooll.', 'ooylloyrrool', 'lrrooolloyyo', '.oollrrooo..'];
  const LEAF_PAL = { o: '#e08a30', l: '#c86020', y: '#f0c040', r: '#c83a28' };
  function shroomAt(ctx, x, y, big, wob) {
    G.drawIcon16(ctx, { icon: 'hongo', n: big ? 'b' : 's' }, x + 4 + wob, y + 6 - (big ? 4 : 0), big ? 1.25 : 1);
  }
  Z.drawUnder = function (f, ctx) {
    zUnder(f, ctx);
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (f.mapId === 'bosque') {
      // Elena's mushrooms
      if (sortOpen() && sort().on) {
        const w = BQ.wob; if (w && w.t > 0) w.t--;
        SHROOMS.forEach((m, i) => { const g = sort().gone[i]; if (g && G.frame - g > 20) return; const k = g ? (G.frame - g) / 20 : 0; shroomAt(ctx, m.at[0] * TL - cx, m.at[1] * TL - cy - Math.round(k * 20), m.big, w && w.i === i && w.t > 0 ? Math.round(Math.sin(w.t) * 2) : 0); });
      }
      // the dog's trail: paw prints to sniff along
      const tr = (f.def.dogSpots || []).find(s => s.id === 'bosque_rastro');
      if (tr && Z.dogReady(tr)) for (const [x, y] of [tr.at, ...tr.path]) { ctx.globalAlpha = 0.6; G.drawIcon16(ctx, 'huella', x * TL - cx + 6, y * TL - cy + 8, 0.75); ctx.globalAlpha = 1; }
    }
    if (f.mapId === 'bosque_cueva' && CH.done('bosque1')) { // the cub asleep beside its mother
      const [ox, oy] = P('bosque_cueva', 'osa'), img = spr('cubsit', CUB.sit, CUB_PAL);
      ctx.drawImage(img, ox * TL + 60 - cx, oy * TL + 34 - cy);
      if ((G.frame >> 5) % 3 === 0) G.text(ctx, 'z', ox * TL + 70 - cx, oy * TL + 18 - cy - ((G.frame >> 2) & 7), '#c8d8ff', null);
    }
  };
  Z.drawTop = function (f, ctx) {
    zTop(f, ctx);
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    // night in the forest: a deep blue dusk over everything (the fireflies glow through it); the cave is always dark
    const dark = f.mapId === 'bosque_cueva' ? 0.62 : f.mapId === 'bosque' ? (G.day ? G.day.glow() : 0) * 0.55 : 0;
    if (dark > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = dark; ctx.fillStyle = f.mapId === 'bosque_cueva' ? '#302848' : '#283868'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const lights = (f.zoo ? f.zoo.list : []).filter(a => (AN.KINDS[a.kind] || {}).glow).map(a => [a.x - cx, a.y - a.z - 3 - cy, 24]);
      lights.push([f.player.x * TL + 12 + (f.player.ox || 0) - cx, f.player.y * TL + 12 + (f.player.oy || 0) - cy, 34]);
      if (f.mapId === 'bosque_cueva') for (let y = 0; y < f.map.h; y++) for (let x = 0; x < f.map.w; x++) if (f.map.get(x, y) === '%') lights.push([x * TL + 12 - cx, y * TL + 14 - cy, 22]);
      for (const [x, y, r] of lights) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,240,170,' + (0.45 * dark) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
      ctx.restore();
    }
    if (f.mapId === 'bosque') {
      // a firefly flying into Lola's jar; the jar's lights let go
      const fl = BQ.fly; if (fl && G.frame - fl.t < 30) { const n = npcAt(f, 'lola'); if (n) { const k = (G.frame - fl.t) / 30, x = fl.x + (n.x * TL + 12 - fl.x) * k, y = fl.y + (n.y * TL - 4 - fl.y) * k - Math.sin(k * Math.PI) * 20; ctx.fillStyle = '#fffcb0'; ctx.fillRect(Math.round(x - cx) - 1, Math.round(y - cy) - 1, 3, 3); } }
      if (BQ.freed && G.frame - BQ.freed < 150) { const n = npcAt(f, 'lola'); if (n) for (let i = 0; i < 5; i++) { const k = (G.frame - BQ.freed) / 150, a = i * 1.26 + k * 3; ctx.fillStyle = (G.frame + i * 3) & 4 ? '#fffcb0' : '#f8f080'; ctx.fillRect(Math.round(n.x * TL + 12 + Math.cos(a) * k * 50 - cx), Math.round(n.y * TL - 10 - k * 70 + Math.sin(a) * 8 - cy), 2, 2); } }
      if (jarOn() && G.top() === f) { const n = npcAt(f, 'lola'); if (n) { G.drawIcon16(ctx, 'frasco', n.x * TL + 18 - cx, n.y * TL - 2 - cy); G.text(ctx, String(jar().n), n.x * TL + 34 - cx, n.y * TL - cy, '#fffcb0', '#203048'); } }
      if (!f.locked && G.top() === f) for (const s of SIDE) { if (!s.on()) continue; const ic = s.icon(); if (ic) G.drawAlert(ctx, ic, s.at[0] * TL - cx, s.at[1] * TL - cy + 4, f.t); }
    }
  };
  // a new ghost-hand demo (src/demo.js): the first time you hold Lupe's empty basket, the hand taps a bush
  (Z.demos || (Z.demos = [])).push({ kind: 'pickberry', find: f => (f.mapId === 'bosque' && basket() && pie().n < 4 ? BUSHES.find((b, i) => !pie().got[i]) || null : null) });

  // =====================================================================
  //  The maps
  // =====================================================================
  const CAVE = P('bosque', 'cave'), CAVE_FRONT = P('bosque', 'caveFront'), CABIN = P('bosque', 'cabinDoor');
  const RASTRO = P('bosque', 'rastro');
  G.maps.bosque = {
    name: 'El bosque', icon: 'bosque', rows: MD.bosque.rows, music: 'castle',
    exits: [
      Z.edge(18, 29, 'camino_bosque', 6, 1, 'down'),
      { x: CAVE[0], y: CAVE[1], to: 'bosque_cueva', tx: P('bosque_cueva', 'door')[0], ty: P('bosque_cueva', 'door')[1] - 1, dir: 'up', sfx: 'step' },
      { x: CABIN[0], y: CABIN[1], to: 'bosque_cabana', tx: P('bosque_cabana', 'door')[0], ty: P('bosque_cabana', 'door')[1] - 1, dir: 'up' },
    ],
    posts: [{ at: P('bosque', 'post'), zone: 'bosque' }],
    // the dog's things to do: sniff the hollow log, follow a trail of paw prints, swim across the river for a stick
    dogSpots: [
      { id: 'bosque_tronco', at: P('bosque', 'log'), act: 'sniff', gives: 'palo', every: 120 },
      { id: 'bosque_rastro', at: RASTRO, act: 'trail', path: [[RASTRO[0] + 1, RASTRO[1] - 1], [RASTRO[0] + 2, RASTRO[1] - 1], [RASTRO[0] + 3, RASTRO[1] - 2], [RASTRO[0] + 5, RASTRO[1] - 2]], gives: 'bellota', every: 150 },
      { id: 'bosque_rio', at: P('bosque', 'rio'), to: P('bosque', 'rioFar'), act: 'swim', gives: 'palo', every: 90 },
    ],
    pages: K.pages('bosque'),
    ambient: { birds: 4, butterflies: 3 },
    animals: [
      { kind: 'ardilla', n: 2, area: 'claro' }, { kind: 'ardilla', n: 1, area: 'zorros' },
      { kind: 'venado', n: 2, area: 'prados' }, { kind: 'conejo', n: 2, area: 'conejos' }, { kind: 'rana', area: 'rana' },
      { kind: 'zorro', n: 1, area: 'zorros' },
      { kind: 'mapache', n: 1, area: 'orilla' },
      { kind: 'erizo', n: 2, area: 'moras' },
      { kind: 'buho', area: 'owl', perch: 1, when: 'noche' },                 // rare: at night, up in a tall tree
      { kind: 'luciernaga', n: 7, area: 'claro', when: 'noche' },            // at night the clearing fills with fireflies
    ],
    // tap anything (world.js): the trees, mushrooms, the blackberry bushes, the log, the cave, the cabin, the water
    things: { tiles: { '(': 'arbol', ')': 'arbol', '%': 'hongo', '*': 'mora', '_': 'tronco', '@': 'cueva', '|': 'agua', '[': 'casa', ']': null, '#': null, ':': null } },
    npcs: [
      K.canelo(18, 26), lola, Z.nico(...P('bosque', 'nico')),
      person('elena', ...P('bosque', 'elena'), 'down', elenaSide, elenaLine, { fixed: true }),
      person('lupe', ...P('bosque', 'lupe'), 'down', lupeSide, lupeLine, { wander: 1 }),
    ],
  };
  G.maps.bosque_cueva = {
    name: 'La cueva', icon: 'cueva', rows: MD.bosque_cueva.rows, music: 'castle',
    exits: [{ x: P('bosque_cueva', 'door')[0], y: P('bosque_cueva', 'door')[1], to: 'bosque', tx: CAVE_FRONT[0], ty: CAVE_FRONT[1], dir: 'down', sfx: 'step' }],
    animals: [{ kind: 'oso', area: 'osa', on: '{' }, { kind: 'luciernaga', n: 4, area: 'luces', on: '{%' }],
    things: { tiles: { '%': 'hongo', '}': 'cueva', w: 'agua' } },
    npcs: [K.canelo(8, 7)],
  };
  G.maps.bosque_cabana = {
    name: 'La casa de Doña Lupe', icon: 'casa', rows: MD.bosque_cabana.rows, music: 'headquarters',
    exits: [{ x: P('bosque_cabana', 'door')[0], y: P('bosque_cabana', 'door')[1], to: 'bosque', tx: CABIN[0], ty: CABIN[1] + 1, dir: 'down' }],
    things: { tiles: { j: 'cama', t: null } },
    poke: (f, x, y) => { if (f.map.get(x, y) !== 'v') return false; G.audio.sfx('select'); CK.puff('dust', x * TL + 12, y * TL, { vy: -0.6, life: 40 }); return true; }, // her oven: warm
    npcs: [K.canelo(4, 4)],
  };
  // the pie cooling on Lupe's table once it's baked today
  { const u0 = Z.drawUnder; Z.drawUnder = function (f, ctx) { u0(f, ctx); if (f.mapId === 'bosque_cabana' && G.state && pie().baked) { const [x, y] = P('bosque_cabana', 'table'); G.drawIcon16(ctx, 'pay', x * TL + 16 - Math.round(f.cam.x), y * TL + 2 - Math.round(f.cam.y)); } }; }

  // ---------- things to pick up: Lola's leaves, acorns under the oak, sticks ----------
  G.carry.SOURCES.push(
    { id: 'palo_cbosque', map: 'camino_bosque', at: P('camino_bosque', 'palo'), item: 'palo', every: 90 },
    { id: 'palo_bosque', map: 'bosque', at: [21, 26], item: 'palo', every: 90 },
    { id: 'hoja_verde', map: 'bosque', at: [11, 6], item: 'hoja', col: 'verde', every: 200 },
    { id: 'hoja_amarillo', map: 'bosque', at: [27, 17], item: 'hoja', col: 'amarillo', every: 200 },
    { id: 'hoja_rojo', map: 'bosque', at: [9, 24], item: 'hoja', col: 'rojo', every: 200 },
    { id: 'bellota_roble', map: 'bosque', at: [14, 16], item: 'bellota', every: 150, when: () => CH.done('bosque2') },
  );
  // ---------- Nico's hiding places in the forest (seek.js) ----------
  G.seek.SPOTS.push(
    { id: 'bosque1', map: 'bosque', at: P('bosque', 'hide1'), how: 'over', cut: 16, dx: 0, kinds: ['ardilla', 'conejo', 'zorro'], place: 'arbol' },     // behind the squirrel's oak
    { id: 'bosque2', map: 'bosque', at: P('bosque', 'hide2'), how: 'over', cut: 9, dx: 0, kinds: ['mapache', 'erizo', 'conejo'], place: 'tronco' },     // behind the hollow log
    { id: 'bosque3', map: 'bosque', at: P('bosque', 'hide3'), how: 'over', cut: 10, dx: 0, kinds: ['erizo', 'conejo', 'ardilla'], place: 'mora' },      // in a blackberry bush
    { id: 'bosque4', map: 'bosque', at: P('bosque', 'hide4'), how: 'over', cut: 10, dx: 0, kinds: ['zorro', 'mapache', 'conejo'], place: 'cueva' },     // behind a boulder by the cave
    { id: 'bosque5', map: 'bosque', at: P('bosque', 'hide5'), how: 'over', cut: 16, dx: 0, kinds: ['ardilla', 'venado', 'zorro'], place: 'arbol' },     // behind a tall tree
    { id: 'bosque6', map: 'bosque', at: P('bosque', 'hide6'), how: 'over', cut: 10, dx: 0, kinds: ['erizo', 'conejo', 'mapache'], place: 'mora' },      // in another blackberry bush
  );
  G.seek.KINDS.push('ardilla', 'zorro', 'mapache', 'erizo', 'venado');
  Object.assign(G.seek.PEEK, { ardilla: [3, 5], zorro: [3, 5], mapache: [3, 5], erizo: [3, 4], venado: [4, 7] });
  // ---------- favours (favores.js, from Villa Sol's chapter 7 on): the forest's people ask about its words ----------
  const been = () => Z.visited('bosque');
  G.favores.OFFERS.push(['elena', 'thing', ['oso', 'ardilla', 'venado', 'zorro', 'mapache', 'cueva'], been], ['lupe', 'thing', ['mora', 'hongo', 'bellota', 'hoja'], been]);
  Object.assign(G.favores.THINGS, { elena: ['oso', 'ardilla', 'venado', 'zorro', 'mapache', 'cueva'], lupe: ['mora', 'hongo', 'bellota', 'hoja'] });

  // =====================================================================
  //  The story: the forest's quest line (G.chapters, line 'bosque')
  // =====================================================================
  CH.add({ id: 'bosque1', line: 'bosque', title: 'El osito perdido', en: 'The lost bear cub: follow the paw prints home', giver: 'elena', words: ['oso', 'pequeno', 'cueva', 'grande'], icon: 'oso', col: '#8a5428', goal: [['oso', 2]] });
  CH.add({ id: 'bosque2', line: 'bosque', title: 'Las bellotas de la ardilla', en: 'The squirrel\'s acorns: look under the leaves', giver: 'lupe', words: ['ardilla', 'bellota', 'hoja', 'erizo'], icon: 'bellota', col: '#c0662a', goal: [['bellota', 3]] });
  CH.add({ id: 'bosque3', line: 'bosque', title: 'Los binoculares de Elena', en: 'Elena\'s binoculars: a raccoon took them; then look far away', giver: 'elena', words: ['tronco', 'mapache', 'venado', 'zorro'], icon: 'binoculares', col: '#4a7a38', goal: [['binoculares', 1]] });

  // the cub (drawn by the chapter): crying in the clearing, then following you (your trail), then home at the cave
  const CUB_AT = P('bosque', 'cub');
  const trailPt = (f, k) => { const tr = (f.zoo && f.zoo.trail) || []; return tr[Math.max(0, tr.length - 1 - k)] || [f.player.x * TL + 12, f.player.y * TL + 20]; };
  // ---------- 1 · El osito perdido: el oso, pequeño, la cueva, grande ----------
  CH.script('bosque1', [
    { who: 'elena', run: function* (f, c) { // a little bear, crying: where is its mother?
      yield* say('elena', T('¡Hola, {name}! Soy Elena.', 'Hi, {name}! I\'m Elena, the forest ranger.'));
      c.data.cub = 1; AN.tone('sine', 700, 500, 0.3, 0.06); AN.tone('sine', 650, 450, 0.3, 0.05, 0.4);
      CH.point(CUB_AT[0] * TL + 12, CUB_AT[1] * TL);
      try {
        yield* sayShow('elena', null, T('¡Shhh! ¿Oyes?', 'Shhh! Do you hear that? Someone is crying...'));
        yield* meetW('oso', { who: 'elena', prompt: '¡Mira! ¡Un [oso]!', en: 'Look! A bear!', show: cub, known: othersFor('oso', ['arbol', 'flor', 'perro', 'gato']) });
        yield* meetW('pequeno', { who: 'elena', prompt: 'Un [oso] [pequeno:pequeño]...', en: 'A small bear... a little cub!', show: 'pequeno', known: othersFor('pequeno', ['oso', 'arbol', 'feliz']) });
      } finally { CH.point(null); }
      yield* sayShow('elena', cub, T('¿Y su mamá?', 'Where is its mother? Go and see the little bear.'));
    } },
    { spot: { map: 'bosque', at: CUB_AT, icon: cub }, run: function* (f, c) { // it hugs you; big paw prints to the cave
      c.data.cub = 2; G.audio.sfx('select'); for (let k = 0; k < 3; k++) CK.puff('heart', CUB_AT[0] * TL + 8 + k * 5, CUB_AT[1] * TL, { life: 50, vy: -0.4 });
      yield 30;
      c.data.tracks = 1; G.audio.sfx('chime');
      yield* sayShow('elena', { icon: 'huella' }, T('¡Huellas! ¡Grandes!', 'Paw prints! Big ones! They go over the bridge...'));
      const n = G.pet && G.pet.mine() ? CK.dog(f) : null;
      if (n) { // the dog sniffs the trail and runs ahead to the cave
        CK.bark(f, n); yield* G.pet.play('sniff');
        yield* sayShow('elena', { icon: 'perro' }, T('¡{dog}! ¡[busca:Busca]!', '{dog}! Find them! (he follows the prints)'));
        yield* CK.walk(f, n, CAVE_FRONT[0] + 1, CAVE_FRONT[1], 5); n.dir = 'up'; CK.bark(f, n);
      }
      c.data.cub = 3; // (it follows you now)
      const e = npcAt(f, 'elena'); if (e) yield* CK.walk(f, e, CAVE_FRONT[0] - 2, CAVE_FRONT[1], 4);
    } },
    { spot: { map: 'bosque', at: CAVE_FRONT, icon: 'huella' }, run: function* (f, c) { // the cave; mama bear comes out
      c.data.cub = 4; c.data.tracks = 0;
      yield* meetW('cueva', { who: 'elena', prompt: '¡Una [cueva]!', en: 'A cave! The prints go in...', show: 'cueva', known: othersFor('cueva', ['oso', 'pequeno', 'arbol', 'casa']) });
      AN.cry('oso'); G.fx.shake = 6; yield 20;
      c.data.mama = G.frame; AN.cry('oso');
      yield 50;
      yield* G.intro.watch('grande', { who: 'elena', prompt: '¡Mamá [oso]! ¡[grande]!', en: 'Mama bear! She is BIG!', act: function* () { c.data.tall = G.frame; AN.cry('oso'); G.fx.shake = 8; yield 50; c.data.tall = 0; },
        ask: 'Mamá [oso] es...', askEn: 'Mama bear is... (big or small?)', known: othersFor('grande', ['pequeno', 'oso', 'feliz']) });
      c.data.hug = G.frame; G.audio.jingle('item');
      yield 50;
      yield* quiz('elena', '¿Y el osito?', 'And the little cub? How is it?', 'pequeno', ['grande', 'oso'], { show: cub });
      yield* quiz('elena', '¿Y su mamá?', 'And its mother?', 'grande', ['pequeno', 'oso'], { show: 'oso' });
      c.data.home = G.frame; yield 60;
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('elena', 'cueva', T('¡A su [cueva]! ¡[gracias:Gracias], {name}!', 'Home to their cave! Thank you, {name}! (they sleep in there: tiptoe in and see)'));
    } },
  ], {
    stage(f, c) { if (f.mapId === 'bosque' && (c.data.cub | 0) < 3) { const n = npcAt(f, 'elena'); if (n && !n.busy) CK.place(f, 'elena', ...P('bosque', 'elena'), 'down'); } },
    draw(f, ctx, c) {
      if (f.mapId !== 'bosque' || CH.done('bosque1') || !c.data.cub) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
      if (c.data.tracks) { const pts = [[18, 15], [18, 13], [18, 11], [18, 9], [18, 7], [20, 5], [23, 5], [26, 5], [29, 5], [32, 5]]; pts.forEach(([x, y], i) => G.drawIcon16(ctx, 'huella', x * TL + (i & 1 ? 10 : 2) - cx, y * TL + 6 - cy, 0.75)); }
      // mama bear at the cave's mouth: she comes out, stands up tall, hugs the cub, then they go in
      if (c.data.mama) {
        const k = Math.min(1, (t - c.data.mama) / 40), out = c.data.home ? Math.max(0, 1 - (t - c.data.home) / 50) : k;
        const tall = c.data.tall ? Math.min(1, (t - c.data.tall) / 12) : 0, sc = 2 + tall * 0.6;
        const img = AN.frame({ kind: 'oso', st: 'idle', react: 0, flip: false, age: t, t: 0 }), w = img.width * sc, h = img.height * sc;
        ctx.globalAlpha = out; ctx.drawImage(img, Math.round(CAVE[0] * TL + 12 - w / 2 - cx), Math.round(CAVE[1] * TL + 4 + out * 22 - h - cy), w, h); ctx.globalAlpha = 1;
      }
      // the cub
      let x, y, fr = 'sit', flip = false;
      if (c.data.cub <= 2) { x = CUB_AT[0] * TL + 12; y = CUB_AT[1] * TL + 20; fr = c.data.cub === 1 && (t >> 4) & 1 ? 'cry' : 'sit'; }
      else if (c.data.cub === 3) { const p = trailPt(f, 18); x = p[0]; y = p[1]; fr = (t >> 3) & 1 ? 'walk' : 'sit'; flip = x > f.player.x * TL + 12; c.data.at = [x, y]; }
      else { const p0 = c.data.at || [CAVE_FRONT[0] * TL + 12, CAVE_FRONT[1] * TL + 20], k = c.data.hug ? Math.min(1, (t - c.data.hug) / 40) : 0, out = c.data.home ? Math.max(0, 1 - (t - c.data.home) / 50) : 1; x = p0[0] + (CAVE[0] * TL + 20 - p0[0]) * k; y = p0[1] + (CAVE[1] * TL + 26 - p0[1]) * k; fr = 'walk'; ctx.globalAlpha = out; }
      const img = spr('cub' + fr, CUB[fr], CUB_PAL, flip);
      ctx.drawImage(img, Math.round(x - img.width / 2 - cx), Math.round(y - img.height - cy)); ctx.globalAlpha = 1;
      if (c.data.cub === 1 && (t >> 5) & 1) G.text(ctx, '?', Math.round(x - cx) + 4, Math.round(y - 22 - cy), '#ffffff', '#203048');
    },
  });

  // ---------- 2 · Las bellotas de la ardilla: la ardilla, la bellota, la hoja (and a hedgehog in a leaf pile) ----------
  const OAK = P('bosque', 'oak');
  const PILES = [[15, 17], [17, 21], [21, 17], [11, 16], [22, 21]];
  const PILE_HAS = ['bellota', 'erizo', 'bellota', 'nada', 'bellota'];
  const sqPos = c => { const up = c.data.down ? Math.max(0, 1 - (G.frame - c.data.down) / 30) : 1; return [OAK[0] * TL + 12, OAK[1] * TL + 20 - 26 * up]; };
  CH.script('bosque2', [
    { who: 'lupe', run: function* (f, c) { // the squirrel's acorns are lost
      yield* say('lupe', T('¡Hola, {name}! Soy Doña Lupe.', 'Hello, {name}! I\'m Doña Lupe. I live in the log cabin.'));
      c.data.sq = 1; AN.cry('ardilla');
      CH.point(OAK[0] * TL + 12, OAK[1] * TL - 10);
      try {
        yield* meetW('ardilla', { who: 'lupe', prompt: '¡Mira! ¡La [ardilla]!', en: 'Look! The squirrel! It is upset...', known: othersFor('ardilla', ['oso', 'pequeno', 'arbol', 'conejo']) });
        yield* meetW('bellota', { who: 'lupe', prompt: '¿Y sus [bellota:bellotas]?', en: 'Where are its acorns? They are lost!', show: 'bellota', known: othersFor('bellota', ['ardilla', 'arbol', 'manzana', 'flor']) });
      } finally { CH.point(null); }
      c.data.piles = 1;
      yield* sayShow('lupe', { icon: 'bellota', count: 3 }, T('¡Tres! ¡Bajo las... !', 'Three acorns! Look under the piles of leaves in the clearing.'));
    } },
    { spots: PILES.map((at, i) => ({ map: 'bosque', at, quiet: true, off: c => !!(c.data.done || {})[i] })), hint: (f, c) => PILES.filter((p, i) => !(c.data.done || {})[i]).map(([x, y]) => ({ x: x * TL + 12, y: y * TL + 12, spot: 'pile' })),
      run: function* (f, c, i) {
        const dn = c.data.done || (c.data.done = {}); if (dn[i]) return false;
        dn[i] = G.frame; const [x, y] = PILES[i];
        G.audio.sfx('swing'); for (let k = 0; k < 10; k++) CK.puff('crumb', x * TL + 12 + (Math.random() - 0.5) * 18, y * TL + 12, { vy: -1.4 - Math.random(), vx: (Math.random() - 0.5) * 2.4, g: 0.1, life: 36 });
        yield 14;
        if (!c.data.hoja) { c.data.hoja = 1; yield* meetW('hoja', { who: 'lupe', prompt: '¡[hoja:Hojas]!', en: 'Leaves! Lots of leaves!', show: leafPic('rojo'), known: othersFor('hoja', ['bellota', 'ardilla', 'arbol', 'flor']) }); }
        const what = PILE_HAS[i];
        if (what === 'bellota') {
          c.data.found = (c.data.found | 0) + 1; c.data.fly = { from: [x, y], t: G.frame }; G.audio.jingle('item'); CK.sparkle(f, x, y, 4);
          yield 30;
          const nums = ['uno', 'dos', 'tres'], n = c.data.found;
          if (met(nums[n - 1])) yield* quiz('lupe', '¿Cuántas?', 'How many acorns has the squirrel got back?', nums[n - 1], nums.filter((k, j) => j !== n - 1), { show: { icon: 'bellota', count: n } });
          else yield* sayShow('lupe', { icon: 'bellota', count: n }, T('¡Una [bellota]!', 'An acorn! The squirrel catches it.'));
        } else if (what === 'erizo') {
          c.data.hog = { at: [x, y], t: G.frame }; AN.cry('erizo');
          yield* meetW('erizo', { who: 'lupe', prompt: '¡Ay! ¡Un [erizo]!', en: 'Oh! A hedgehog! It was sleeping in the leaves.', known: othersFor('erizo', ['ardilla', 'oso', 'conejo', 'hoja']) });
        } else yield* sayShow('lupe', leafPic('amarillo'), T('¡Nada! ¡[hoja:Hojas]!', 'Nothing! Only leaves. Try another pile.'));
        return (c.data.found | 0) >= 3 ? undefined : false;
      } },
    { auto: 'bosque', run: function* (f, c) { // the squirrel comes down, happy, and gives you one
      c.data.down = G.frame; AN.cry('ardilla'); yield 40;
      for (let k = 0; k < 3; k++) CK.puff('heart', OAK[0] * TL + 8 + k * 5, OAK[1] * TL, { life: 50, vy: -0.4 });
      yield* quiz('lupe', '¿Qué es?', 'Who got its acorns back?', 'ardilla', ['erizo', 'oso', 'conejo']);
      bag().add('bellota'); G.audio.sfx('chime');
      yield* sayShow('lupe', 'bellota', T('¡Una [bellota]... ¡para ti!', 'And one acorn... for you! Thank you, {name}!'));
      c.data.up = G.frame; CK.confetti();
    } },
  ], {
    stage(f) { if (f.mapId === 'bosque') { const n = npcAt(f, 'lupe'); if (n && !n.busy) CK.place(f, 'lupe', ...P('bosque', 'lupe'), 'down'); } },
    draw(f, ctx, c) {
      if (f.mapId !== 'bosque' || CH.done('bosque2')) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
      if (c.data.piles) PILES.forEach(([x, y], i) => { const d = (c.data.done || {})[i]; if (d && t - d > 20) return; const img = spr('pile', LEAFPILE, LEAF_PAL); ctx.globalAlpha = d ? 1 - (t - d) / 20 : 1; ctx.drawImage(img, x * TL + 5 - cx, y * TL + 14 - cy); ctx.globalAlpha = 1; });
      const h = c.data.hog; if (h && t - h.t < 160) { const img = AN.frame({ kind: 'erizo', st: t - h.t < 60 ? 'hide' : 'walk', react: 0, flip: false, age: t, t: 0 }); ctx.drawImage(img, Math.round(h.at[0] * TL + 6 + Math.max(0, t - h.t - 60) * 0.4 - cx), h.at[1] * TL + 12 - cy); }
    },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'bosque' || CH.done('bosque2') || !c.data.sq) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
      const [sx, sy] = sqPos(c), img = AN.frame({ kind: 'ardilla', st: c.data.down ? 'walk' : 'up', react: 0, flip: false, age: t, t: 0, z: 0 });
      ctx.drawImage(img, Math.round(sx - img.width / 2 - cx + ((t >> 3) & 1 && !c.data.down ? 1 : 0)), Math.round(sy - img.height - cy));
      const fl = c.data.fly; if (fl && t - fl.t < 30) { const k = (t - fl.t) / 30, x = fl.from[0] * TL + 12 + (sx - fl.from[0] * TL - 12) * k, y = fl.from[1] * TL + 8 + (sy - 10 - fl.from[1] * TL - 8) * k - Math.sin(k * Math.PI) * 30; G.drawIcon16(ctx, 'bellota', Math.round(x - 8 - cx), Math.round(y - 8 - cy)); }
    },
  });

  // ---------- 3 · Los binoculares de Elena: el tronco, el mapache, el venado, el zorro ----------
  const LOG = P('bosque', 'log');
  // looking through the binoculars: two round windows on black, something far away in them (its picture), bobbing
  class Binoculars {
    constructor(w, pic, bg) { this.w = w; this.pic = pic; this.bg = bg; this.t = 0; this.transparent = false; }
    onEnter() { G.audio.sfx('ok'); }
    update() { this.t++; if (this.t === 30 && AN.KINDS[this.pic]) AN.cry(this.pic); if (this.t > 150 || (this.t > 40 && G.input.tap())) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, G.W, G.H);
      const r = 62, cx = G.W / 2, cy = G.H / 2, k = Math.min(1, this.t / 20);
      ctx.save(); ctx.beginPath(); ctx.arc(cx - 48, cy, r * k, 0, Math.PI * 2); ctx.arc(cx + 48, cy, r * k, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#a8e0f8'; ctx.fillRect(0, 0, G.W, G.H); ctx.fillStyle = this.bg; ctx.fillRect(0, cy + 6, G.W, G.H);
      ctx.fillStyle = '#2b6a26'; for (let i = 0; i < 9; i++) { const x = i * 40 - 10; ctx.beginPath(); ctx.moveTo(x, cy + 8); ctx.lineTo(x + 18, cy - 40); ctx.lineTo(x + 36, cy + 8); ctx.fill(); }
      const bob = Math.round(Math.sin(this.t / 10) * 3), sway = Math.round(Math.sin(this.t / 23) * 6);
      G.drawIcon16(ctx, this.pic, cx - 40 + sway, cy - 36 + bob, 5);
      ctx.restore();
      ctx.strokeStyle = '#202028'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx - 48, cy, r * k, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 48, cy, r * k, 0, Math.PI * 2); ctx.stroke();
    }
  }
  BQ.binoculars = (pic, bg) => { const w = new G.Wait(); G.push(new Binoculars(w, pic, bg || '#6cb83c')); return w; };
  CH.script('bosque3', [
    { who: 'elena', run: function* (f, c) { // ¿y mis binoculares?
      yield* sayShow('elena', { icon: 'binoculares' }, T('¡Ay! ¿Y mis binoculares?', 'Oh no! Where are my binoculars? I left them here...'));
      c.data.prints = 1;
      CH.point(LOG[0] * TL + 12, LOG[1] * TL);
      try { yield* sayShow('elena', { icon: 'huella' }, T('¡Huellas! ¡Mira!', 'Little paw prints... they go to the hollow log!')); } finally { CH.point(null); }
    } },
    { spot: { map: 'bosque', at: LOG, icon: { icon: 'binoculares' } }, run: function* (f, c) { // the hollow log: a raccoon with the binoculars
      G.audio.sfx('select'); f.wig = { x: LOG[0], y: LOG[1], t: 18 };
      yield* meetW('tronco', { who: 'elena', prompt: '¡Un [tronco]!', en: 'A hollow log! Something is in there...', show: 'tronco', known: othersFor('tronco', ['arbol', 'cueva', 'hoja', 'bellota']) });
      c.data.peek = G.frame; AN.cry('mapache'); yield 30;
      yield* meetW('mapache', { who: 'elena', prompt: '¡Un [mapache]!', en: 'A raccoon! It has my binoculars!', known: othersFor('mapache', ['ardilla', 'oso', 'erizo', 'gato']) });
      const n = G.pet && G.pet.mine() ? CK.dog(f) : null; if (n) { CK.bark(f, n); yield* G.pet.play('jump'); CK.bark(f, n); }
      c.data.run = G.frame; AN.cry('mapache'); yield 40;
      c.data.prints = 0; bag().add('binoculares', { q: 'bosque3' }); G.audio.jingle('item');
      yield* sayShow('elena', { icon: 'binoculares' }, T('¡Mis binoculares!', 'The raccoon dropped them and ran off! Bring them to Elena.'));
    } },
    { who: 'elena', bubble: { icon: 'binoculares' }, run: function* (f, c) { // look far away: a deer, a fox
      bag().take('binoculares', { q: 'bosque3' }); G.audio.jingle('item');
      yield* say('elena', T('¡[gracias:Gracias], {name}! ¡Mira!', 'Thank you, {name}! Here, have a look!'));
      yield BQ.binoculars('venado', '#6cb83c');
      yield* meetW('venado', { who: 'elena', prompt: '¡Un [venado]!', en: 'A deer! Far away in the meadow.', known: othersFor('venado', ['mapache', 'ardilla', 'oso', 'caballo']) });
      yield BQ.binoculars('zorro', '#4f9c30');
      yield* meetW('zorro', { who: 'elena', prompt: '¡Y un [zorro]!', en: 'And a fox! By the river.', known: othersFor('zorro', ['venado', 'mapache', 'ardilla', 'perro']) });
      yield* ask('elena', '¿Y el [venado]?', 'Which one was the deer?', 'venado', ['zorro', 'mapache'].filter(met), { pic: true });
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('elena', 'elbosque', T(met('elbosque') ? '¡Mi [elbosque]! ¡Muy bien!' : '¡Muy bien, {name}!', 'Well done! Go and find them all: the deer in the meadow, the fox by the log.'));
    } },
  ], {
    stage(f) { if (f.mapId === 'bosque') { const n = npcAt(f, 'elena'); if (n && !n.busy) CK.place(f, 'elena', ...P('bosque', 'elena'), 'down'); } },
    draw(f, ctx, c) {
      if (f.mapId !== 'bosque' || CH.done('bosque3')) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
      if (c.data.prints) for (const [x, y, i] of [[20, 14, 0], [22, 16, 1], [24, 18, 0], [27, 19, 1]]) G.drawIcon16(ctx, 'huella', x * TL + (i ? 10 : 2) - cx, y * TL + 8 - cy, 0.6);
      if (c.data.peek && !(c.data.run && t - c.data.run > 60)) {
        const run = c.data.run ? (t - c.data.run) * 1.6 : 0, img = AN.frame({ kind: 'mapache', st: c.data.run ? 'walk' : 'idle', react: c.data.run ? 0 : 1, flip: false, age: t, t: 0 });
        ctx.drawImage(img, Math.round(LOG[0] * TL + 16 + run - cx), Math.round(LOG[1] * TL + 20 - img.height - cy));
        if (!c.data.run) G.drawIcon16(ctx, 'binoculares', LOG[0] * TL + 26 - cx, LOG[1] * TL - 6 - cy, 0.75);
      }
    },
  });

  // =====================================================================
  //  The zone
  // =====================================================================
  const bus = P('bosque', 'bus'), busIn = P('bosque', 'busIn');
  Z.add({
    id: 'bosque', name: 'El bosque', en: 'the forest', icon: 'bosque', music: 'castle', pos: [160, 34],
    maps: ['bosque', 'bosque_cueva', 'bosque_cabana'], path: 'camino_bosque',
    bus: { map: 'bosque', at: bus }, entry: { map: 'bosque', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: KINDS, // the album page, in order
    habitat: { ardilla: 'arbol', venado: 'flor', zorro: 'tronco', mapache: 'agua', erizo: 'hoja', oso: 'cueva', buho: 'arbol', luciernaga: 'cueva' },
    rare: { oso: 'cueva', buho: 'noche' },
    planned: 0,
    lola: lolaHere,
  });
})();
