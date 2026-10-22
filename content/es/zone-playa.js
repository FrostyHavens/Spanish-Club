// ===== La playa: the zone south of Villa Sol (docs/WORLD_PLAN.md) — sea animals, the sun and the water =====
// Its path from Villa Sol (grass turning to sand, a lagoon with ducks) and one big beach map: palms and dune grass along
// the top, the bus stop and Doña Nieves's ice-cream cart by the path, umbrellas, Marina the lifeguard on her tower,
// Tere building sandcastles, the turtles' nest, wet rocks with a tide pool (el charco), a wooden pier with Don Paco's
// boat, then the surf (the waves roll in), the clear shallows (wade in) and the deep sea.
// Everything here only uses universal words and the beach's own words, each met here in a one-unknown puzzle and used
// again soon after (meetW below: a word not met yet is introduced, a word met elsewhere comes back as a question), so
// the beach can be the very first place a child explores.
//   The album (7): el cangrejo, la gaviota, la estrella de mar, la tortuga, la medusa, el delfín (rare: in the morning,
//     leaping far out), el pulpo (rare: at night, in the tide pool). Tapping one whose word isn't met yet: Lola calls out
//     its name (a one-unknown puzzle), so every animal can be named by finding it.
//   The story (its quest line, 'playa'): 1 La red de Don Paco (mar, cangrejo, estrella de mar, concha), 2 ¡Qué calor!
//     (sol, caliente, helado: an ice cream for Marina), 3 Las tortuguitas (arena, tortuga, gaviota, nadar: the nest
//     hatches, the dog chases the gulls off, help the babies to the sea).
//   Side quests (G.state.playa): Lola's shells (five colours to collect, ¡todas!), Tere's sandcastle (la cubeta: fill it
//     at the water three times, then the flag; a new castle every day), the little crab with no shell (find its spiral
//     shell), an ice cream from Doña Nieves for whoever is hot today. The dog digs for shells, splashes in the waves and
//     chases the gulls. Nico's hide-and-seek has six beach hiding places. Two notebook page puzzles.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA, CH = G.chapters, CK = CH.K, T = CK.T, TL = G.TILE, AN = G.animals;
  const P = (m, tag) => MD[m].pos[tag];
  const W = id => G.data.words[id];
  const met = id => !!(G.words && G.words.met(id));
  const say = CK.say, sayShow = CK.sayShow, tell = CK.tell, ask = CK.ask;
  const tile = (x, y) => ({ x: x * TL + 12, y: y * TL });
  const day = () => (G.words ? G.words.day() : 0);

  // ---------- the path from Villa Sol: grass turning to sand, a lagoon with ducks ----------
  G.maps.camino_playa = {
    name: 'El camino a la playa', icon: 'playa', rows: MD.camino_playa.rows, music: 'field',
    exits: [Z.edge(6, 0, 'villa', 29, 26, 'up'), Z.edge(6, 23, 'playa', 10, 1, 'down')],
    posts: [{ at: P('camino_playa', 'postN'), zone: 'villa', dir: 'up' }, { at: P('camino_playa', 'postS'), zone: 'playa', dir: 'down' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'pato', n: 3, area: 'laguna' }],
    things: {},
    npcs: [K.canelo(6, 2)],
  };

  // =====================================================================
  //  The animals (src/animals.js addKind: a generic move each, pixel frames facing right, a cry)
  // =====================================================================
  const tone = (...a) => AN.tone(...a), noise = (...a) => AN.noise(...a);
  AN.addKind('cangrejo', { word: 'cangrejo', cry: '¡Clic, clic!', move: 'scuttle', on: 's&', speed: 0.7, shadow: 9,
    sfx: () => { for (const at of [0, 0.09, 0.18, 0.4, 0.49]) noise(3200, 0.03, 0.18, at); },
    spr: { pal: { r: '#e84830', d: '#b82818', l: '#c03020', w: '#ffffff', e: '#101010' },
      stand: ['rr.......rr', 'rrr.w.w.rrr', '.r..e.e..r.', '..rrrrrrr..', '.rrrrrrrrr.', 'l.rdddddr.l', '.l.l...l.l.'],
      walk: ['rr.......rr', 'rrr.w.w.rrr', '.r..e.e..r.', '..rrrrrrr..', '.rrrrrrrrr.', '.lrdddddrl.', 'l.l.....l.l'],
      snap: ['r.r.....r.r', 'rrr.w.w.rrr', '.r..e.e..r.', '..rrrrrrr..', '.rrrrrrrrr.', 'l.rdddddr.l', '.l.l...l.l.'] } });
  AN.addKind('gaviota', { word: 'gaviota', cry: '¡Kiaa, kiaa!', move: 'fly', on: 's&', speed: 0.35, shadow: 8,
    sfx: () => { for (const at of [0, 0.26]) tone('sawtooth', 1500, 950, 0.22, 0.06, at, { vib: 22, depth: 70, filter: 'bandpass', ff: 1600, q: 3 }); },
    spr: { pal: { w: '#ffffff', g: '#a8b0c0', d: '#707888', y: '#f8c830', o: '#f0a040', e: '#101010', r: '#e83030' },
      stand: ['.......www..', '......wwewyy', '......wwww.r', 'dgggggwwww..', '.ddggggwww..', '..wwwwwww...', '...wwwwww...', '.....o..o...', '.....o..o...'],
      walk: ['.......www..', '......wwewyy', '......wwww.r', 'dgggggwwww..', '.ddggggwww..', '..wwwwwww...', '...wwwwww...', '....o...o...', '...o....o...'],
      peck: ['............', '............', '.......www..', 'dggggwwwewyy', '.ddgggwwww.r', '..wwwwwww...', '...wwwwww...', '.....o..o...', '.....o..o...'],
      fly: ['..gg........', '..ggg.......', '...ggg.www..', '....ggwwewyy', 'wwwwwwwwww.r', '.ddwwwwww...', '............', '............', '............'],
      fly2: ['............', '............', '.......www..', '......wwewyy', 'wwwwwwwwww.r', '.ddggggww...', '...gggg.....', '....gg......', '............'] } });
  AN.addKind('estrellamar', { word: 'estrellamar', cry: null, move: 'still', on: '-', water: true,
    sfx: () => { tone('sine', 1200, 1900, 0.12, 0.06); tone('sine', 1600, 2400, 0.1, 0.04, 0.1); },
    spr: { pal: { o: '#f07840', d: '#d05828', p: '#ffc090' },
      stand: ['....o....', '....o....', '...opo...', 'ooooooooo', '.oopopoo.', '..ooooo..', '..od.do..', '.od...do.', '.o.....o.'],
      alt: ['.........', '....o....', '...opo...', '.ooooooo.', 'ooopopooo', '..ooooo..', '..od.do..', '.od...do.', '.........'] } });
  AN.addKind('tortuga', { word: 'tortuga', cry: null, move: 'crawl', on: 's9', speed: 0.14, shadow: 12,
    sfx: () => { tone('sine', 220, 160, 0.18, 0.1); tone('sine', 260, 200, 0.14, 0.06, 0.16); },
    spr: { pal: { s: '#3a8a40', l: '#68b050', k: '#2a6a30', f: '#78c058', e: '#101010' },
      walk: ['....kkkk.....', '..kksllskk...', '.kslssslsk.ff', 'ksslssslssfef', 'kssssssssskff', '.kkkkkkkkkk..', '.ff.....fff..', 'ff.......ff..'],
      walk2: ['....kkkk.....', '..kksllskk...', '.kslssslsk.ff', 'ksslssslssfef', 'kssssssssskff', '.kkkkkkkkkk..', '..ff...ff....', '...ff...ff...'],
      hide: ['.............', '....kkkk.....', '..kksllskk...', '.kslssslsk...', 'ksslssslssk..', 'kssssssssk...', '.kkkkkkkkk...', '.............'] } });
  AN.addKind('medusa', { word: 'medusa', cry: null, move: 'drift', on: 'w', water: true, speed: 0.12,
    sfx: () => { tone('sine', 500, 900, 0.16, 0.08); tone('sine', 700, 1100, 0.14, 0.05, 0.12); },
    spr: { pal: { p: '#f0a0e0', d: '#c070c0', w: '#ffe0f8', t: '#d070c8' },
      stand: ['..ppppp..', '.pwwpppp.', 'ppwppppdp', 'pppppppdd', 'ddddddddd', '.t.t.t.t.', '.t..t.t.t', 't.t.t..t.', '.t.t.t.t.', '..t...t..'],
      pulse: ['.........', '..ppppp..', '.pwwppppd', 'ppppppppd', 'ddddddddd', 't.t.t.t.t', '.t.t.t.t.', 't..t.t..t', '.t.t..t..', '.........'] } });
  AN.addKind('delfin', { word: 'delfin', cry: '¡Iii, iii!', move: 'leap', on: 'w', water: true, speed: 0.5,
    sfx: () => { for (const at of [0, 0.14, 0.28]) tone('sine', 1900, 2900, 0.1, 0.05, at); },
    spr: { pal: { b: '#6a8cc0', d: '#4a6ca0', w: '#dce8f4', e: '#101010' },
      fin: ['..................', '..................', '..................', '..................', '..................', '..................', '........d.........', '.......dd.........', '......bbbb........'],
      rise: ['...............b..', '.........d...bbbe.', '........dd.bbbbbb.', '......bbbbbbbbww..', '....bbbbbbbbww....', '..bbbbbbbww.......', '.bbbbwww..........', 'dbbww.............', 'dd................'],
      dive: ['dd................', 'dbb...............', '.bbbb.d...........', '..bbbbbdd.........', '....bbbbbbbb......', '......wwbbbbbbb...', '........wwwbbbbbb.', '...........wwbbbbe', '...............bb.'] } });
  AN.addKind('pulpo', { word: 'pulpo', cry: '¡Blub!', move: 'still', on: '-', water: true,
    sfx: () => { tone('sine', 300, 700, 0.1, 0.12); tone('sine', 380, 820, 0.08, 0.08, 0.12); },
    spr: { pal: { p: '#c858b0', d: '#983888', w: '#ffffff', e: '#101010', l: '#f0a0e0' },
      stand: ['...ppppp...', '..plpppppp.', '.ppwwpwwpp.', '.ppwepwepp.', '..ppppppd..', '.pdpdpdpdp.', 'p.p.p.p.p.p', 'p..p.p.p..p', '.p.......p.'],
      alt: ['...ppppp...', '..plpppppp.', '.ppwwpwwpp.', '.ppwepwepp.', '..ppppppd..', '.pdpdpdpdp.', '.p.p.p.p.p.', 'p..p...p..p', '.pp.....pp.'] } });
  const KINDS = ['cangrejo', 'gaviota', 'estrellamar', 'tortuga', 'medusa', 'delfin', 'pulpo'];

  // =====================================================================
  //  Saved state of the beach's side quests: G.state.playa
  // =====================================================================
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.playa)) s.playa = {};
    const p = s.playa; if (!isObj(p.shells)) p.shells = {}; if (!isObj(p.castle)) p.castle = {}; if (!isObj(p.hot)) p.hot = {};
    return p;
  }
  const PL = G.playa = { state: () => (G.state ? st() : null) };
  // Lola's five shells (the colours are colour words: the carried things' colours, src/errands.js bag)
  const SHELLS = ['rosa', 'blanco', 'azul', 'amarillo', 'rojo'];
  PL.SHELLS = SHELLS;
  const shellPic = col => ({ icon: 'concha', col: W(col).col });
  PL.shellsHave = () => SHELLS.filter(c => st().shells[c]);
  PL.shellsDone = () => SHELLS.every(c => st().shells[c]);
  const held = () => (G.carry ? G.carry.held() : null);
  const bag = () => G.errands.bag;

  // ---------- a word met here, or brought back if it was met elsewhere (any zone may be the first) ----------
  // not met: its one-unknown puzzle (G.intro.show: held up, then "which word is this?"); met: a question about it
  function* meetW(id, o = {}) {
    if (!met(id)) { yield* G.intro.show(id, Object.assign({ how: 'show' }, o)); return true; }
    yield* sayShow(o.who, o.showPic || id, T(o.prompt || G.requests.LINES.un(id), o.en || ''));
    yield* G.review.ask(id, { who: o.who });
    return false;
  }
  PL.meetW = meetW;
  // a known word's quick question, picture cards (the mic is on): [answer, ...others] among the ones met
  const quiz = (who, prompt, en, answer, others, o) => ask(who, prompt, en, answer, others.filter(k => k !== answer && met(k)).slice(0, 2), o || {});
  const othersFor = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== id).slice(0, 2);

  // =====================================================================
  //  Tapping an animal whose word isn't met yet: Lola calls out its name (a one-unknown puzzle)
  // =====================================================================
  const tapped0 = AN.tapped;
  AN.tapped = function (f, a) {
    const r = tapped0.call(this, f, a);
    if (f && Z.of(f.mapId) === 'playa' && KINDS.includes(a.kind) && !met(a.kind) && !f.locked && G.top() === f && !CH.running()) {
      CH.scene(f, (function* () {
        yield 30;
        if (met(a.kind)) return;
        const e = { cangrejo: 'A crab!', gaviota: 'A seagull!', estrellamar: 'A starfish!', tortuga: 'A turtle!', medusa: 'A jellyfish!', delfin: 'A dolphin!', pulpo: 'An octopus!' }[a.kind];
        CH.point(a.x, a.y - 14);
        try { yield* G.intro.show(a.kind, { who: 'lola', prompt: G.requests.LINES.mira(a.kind), en: 'Look! ' + e, known: othersFor(a.kind, KINDS) }); } finally { CH.point(null); }
      })());
    }
    return r;
  };

  // =====================================================================
  //  The people
  // =====================================================================
  const npcAt = (f, id) => f.npcs.find(n => n.id === id && !n.hidden) || null;
  // a beach person's talk: the story first, then their side quest, then the town's (presents, favours...), then a line
  // a favour waiting while their own bubble is down (nothing of theirs on offer, only a game to play again): the favour
  // runs (G.errands.talk), never a game in its way that leaves the bubble up and the guide sending her back
  const favFirst = id => !(sideAlert[id] && sideAlert[id]()) && !!(G.favores && G.favores.alert(id));
  function person(id, x, y, dir, side, line, o = {}) {
    return Object.assign({ id, npc: id, x, y, dir, fixed: !!o.fixed, wander: o.wander || 0,
      alert: () => CH.alert(id) || (G.state && sideAlert[id] ? sideAlert[id]() : null) || (G.favores && G.favores.alert(id)) || null,
      talk: function* (f) {
        if (yield* CH.talk(id, f)) return;
        if (side && !favFirst(id) && (yield* side(f))) return; // (the talk follows the bubble: a favour waiting goes before a game replayed, S2 review #9)
        if (G.errands && (yield* G.errands.talk(id, f))) return;
        yield* line(f);
      } }, o.extra || {});
  }
  const sideAlert = {};

  // ---------- Don Paco, the fisherman, on his pier ----------
  function* pacoLine() {
    if (CH.done('playa1')) yield* sayShow('paco', { icon: 'redpesca' }, T('¡Mi red! ¡[gracias:Gracias], {name}!', 'My net! Thank you, {name}!'));
    else yield* say('paco', T('¡Hola, {name}!', 'Hello, {name}!'));
  }
  // ---------- Marina the lifeguard, by her tower ----------
  function* marinaLine() {
    if (met('ola')) yield* sayShow('marina', 'ola', T('¡Cuidado con las [ola:olas]!', 'Careful with the waves!'));
    else yield* say('marina', T('¡Hola, {name}!', 'Hello, {name}!'));
  }
  // ---------- Doña Nieves and her ice-cream cart ----------
  function* nievesLine() { yield* sayShow('nieves', 'helado', T(met('helado') ? '¡[helado:Helados]! ¡Ricos [helado:helados]!' : '¡Mmm! ¡Ricos!', 'Ice cream! Yummy ice cream!')); }
  // ---------- Tere and her sandcastles ----------
  function* tereLine() { yield* sayShow('tere', 'castillo', T(met('castillo') ? '¡Mi [castillo]!' : '¡Mira!', 'My sandcastle!')); }

  // ---------- Lola (the friend who travels): her shells; her first talk here shows the waves and the dog ----------
  const lola = Z.lola(...P('playa', 'lola'), 'playa');
  const lolaTalk0 = lola.talk, lolaAlert0 = lola.alert;
  const shellHeld = () => { const h = held(); return h && h.id === 'concha' && SHELLS.includes(h.col) ? h : null; };
  lola.alert = () => {
    const a = CH.alert('lola'); if (a) return a;
    const h = shellHeld(); if (h && !st().shells[h.col]) return shellPic(h.col);
    return lolaAlert0();
  };
  lola.talk = function* (f) {
    if (G.state && !CH.alert('lola')) { const h = shellHeld(); if (h) { yield* shellIn(f, h); return; } }
    yield* lolaTalk0(f);
  };
  function* shellIn(f, h) {
    if (st().shells[h.col]) { // one she has already: another colour, please
      yield* sayShow('lola', { list: PL.shellsHave().map(shellPic) }, T('¡Ya la tengo! ¡Otra!', 'I have that one already! Find another colour.'));
      return;
    }
    bag().take('concha', { col: h.col, q: null }); st().shells[h.col] = 1; G.audio.jingle('item'); G.st.autosave();
    const n = PL.shellsHave().length, nums = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
    yield* sayShow('lola', { list: PL.shellsHave().map(shellPic) }, T('¡Una ' + G.requests.np({ thing: 'concha', col: h.col, def: false }).text + '! ¡[gracias:Gracias]!', 'A ' + G.data.words[h.col].en + ' shell! Thank you! (' + n + ' of 5 colours)')); // (its colour: each shell a different line, and colour practice)
    if (met(nums[n - 1])) yield* quiz('lola', '¿Cuántas?', 'How many shells has she got now?', nums[n - 1], nums.filter((k, i) => Math.abs(i - (n - 1)) === 1), { show: { icon: 'concha', count: n } });
    if (PL.shellsDone()) {
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('lola', { list: SHELLS.map(shellPic) }, T('¡Todas! ¡Qué bonitas!', 'All five colours! How pretty! Thank you, {name}!'));
      yield* sayShow('lola', 'caracola', T('¡Para ti!', 'For you! (a big spiral shell: show it to the little crab by the rocks)'));
    } else yield* sayShow('lola', { list: SHELLS.filter(c => !st().shells[c]).map(shellPic) }, T('¡Más, {name}!', 'More! Find the colours I don\'t have yet!'));
  }
  // Lola's extra lines here (zones.js calls them after her hello and the beach's picture)
  function* lolaHere(f) {
    const sp = (f.def.dogSpots || []).find(s => s.id === 'playa_olas');
    if (!met('ola')) { // the waves: her first talk here
      const at = P('playa', 'splash'); CH.point(at[0] * TL + 12, at[1] * TL);
      try { yield* G.intro.show('ola', { who: 'lola', prompt: '¡Mira! ¡Una [ola]!', en: 'Look! A wave!', known: othersFor('ola', ['mar', 'concha']) }); } finally { CH.point(null); }
    }
    if (sp && G.pet && G.pet.mine() && Z.dogReady(sp)) {
      CH.point(sp.at[0] * TL + 12, sp.at[1] * TL);
      try { yield* sayShow('lola', { icon: 'huella' }, T('¡{dog}! ¡A las [ola:olas]!', 'Look! {dog} wants to splash in the waves: tap the paw prints!')); } finally { CH.point(null); }
    }
    if (!PL.shellsDone()) { // her collection: five colours of shells
      if (!met('concha')) yield* G.intro.show('concha', { who: 'lola', prompt: '¡Mira! ¡Una [concha]!', en: 'Look! A seashell!', show: shellPic('rosa'), known: othersFor('concha', ['ola', 'mar']) });
      yield* sayShow('lola', { list: SHELLS.map(shellPic) }, T('¿Me ayudas? ¡[concha:Conchas]!', 'Will you help me? I collect shells: one of each colour! Pick them up and bring them to me.'));
      st().asked = day(); G.st.autosave();
    }
  }

  // =====================================================================
  //  Side quests: places on the map (the shore with the pail, the little crab and its shells, Tere's castle)
  // =====================================================================
  const AT = { fill: [17, 15], site: [17, 12], hermit: P('playa', 'hermit') };
  const HERMIT_SHELLS = [{ at: [21, 10], pic: shellPic('azul'), right: false }, { at: [24, 9], pic: 'caracola', right: true }, { at: [20, 12], pic: shellPic('rosa'), right: false }];
  // Tere's castle today: {d, n: pail-fulls poured (0..3), flag, built: castles so far}; the pail in your hands: {full}
  const castle = () => { const c = st().castle; if (c.d !== day()) { c.d = day(); c.n = 0; c.flag = false; c.on = false; } return c; };
  const pail = () => bag().list().find(it => it.id === 'cubetaarena' && it.q === 'castillo') || null;
  const hermitOn = () => CH.done('playa1') && !st().hermit;
  const SIDE = [
    { id: 'fill', at: AT.fill, on: () => !!pail() && !pail().full, icon: () => 'cubetaplaya', run: fillPail },
    { id: 'site', at: AT.site, on: () => !!pail() && pail().full, icon: () => null, run: function* (f) { yield* pour(f); } },
    { id: 'hermit', at: AT.hermit, on: () => hermitOn(), icon: () => (st().hermitOn ? null : 'caracola'), run: hermitTalk },
    ...HERMIT_SHELLS.map((s, i) => ({ id: 'hs' + i, at: s.at, on: () => hermitOn() && !!st().hermitOn, icon: () => null, run: f => hermitTry(f, i) })),
  ];
  PL.SIDE = SIDE; PL.AT = AT; PL.HERMIT_SHELLS = HERMIT_SHELLS;
  const sideAt = (f, x, y) => (f && f.mapId === 'playa' && G.state ? SIDE.find(s => s.at[0] === x && s.at[1] === y && s.on()) || null : null);
  PL.sideAt = sideAt;

  // ---------- Tere's sandcastle: la cubeta, fill it at the water three times, then the flag ----------
  sideAlert.tere = () => {
    const c = castle(), p = pail();
    if (p) return p.full ? { icon: 'arena' } : null;
    if (c.n >= 3 && !c.flag) return { icon: 'bandera' };
    if (!c.flag) return { icon: 'cubetaplaya' };
    return null;
  };
  function* tereSide(f) {
    const c = castle(), p = pail();
    if (p && p.full) { yield* pour(f); return true; }
    if (p) { yield* sayShow('tere', 'mar', T('¡Al [mar]! ¡[arena], [porfavor:por favor]!', 'To the water! Fill the pail with wet sand, please!')); return true; }
    if (c.flag) return false;
    if (c.n >= 3) { yield* flagOn(f); return true; }
    // the start: her castle, her pail
    yield* say('tere', T('¡Hola! Soy Tere.', 'Hi! I\'m Tere. I build sandcastles!'));
    if (!met('castillo')) yield* G.intro.show('castillo', { who: 'tere', prompt: '¡Mi [castillo]!', en: 'My sandcastle!', known: othersFor('castillo', ['concha', 'mar', 'ola']) });
    else yield* quiz('tere', '¿Qué es?', 'She points at her old castle: what is it?', 'castillo', ['concha', 'arena', 'helado', 'ola'], { point: tile(15, 12) });
    yield* sayShow('tere', 'castillo', T('¡Otro [castillo]! ¿Me ayudas?', 'Another castle! Will you help me?'));
    if (!met('cubetaarena')) yield* G.intro.show('cubetaarena', { who: 'tere', prompt: '¡Mi [cubetaarena]!', en: 'My pail!', known: othersFor('cubetaarena', ['castillo', 'concha', 'mar']) });
    else yield* sayShow('tere', 'cubetaarena', T('¡La [cubetaarena]!', 'The pail!'));
    const it = bag().add('cubetaarena', { q: 'castillo' }); it.full = false; c.on = true; G.st.autosave();
    const at = AT.fill; CH.point(at[0] * TL + 12, at[1] * TL);
    try { yield* sayShow('tere', met('mar') ? 'mar' : 'ola', T(met('mar') ? '¡Al [mar]!' : '¡Al agua!', 'To the water! Fill it with wet sand (tap the water\'s edge).')); } finally { CH.point(null); }
    return true;
  }
  function* fillPail(f) {
    const p = pail(); if (!p) return;
    const [x, y] = AT.fill, wx = x * TL + 12, wy = y * TL + 10;
    G.audio.sfx('swing'); for (let i = 0; i < 10; i++) CK.puff('drop', wx + (Math.random() - 0.5) * 16, wy, { vy: -1.4 - Math.random(), vx: (Math.random() - 0.5) * 1.4, g: 0.12, life: 34 });
    yield 20; p.full = true; G.audio.sfx('chime'); G.st.autosave();
    if (!met('arena') && castle().n === 0) yield* G.intro.show('arena', { who: 'tere', prompt: '¡[arena]! ¡Mucha [arena]!', en: 'Sand! Lots of wet sand!', known: othersFor('arena', ['cubetaarena', 'castillo', 'mar']) }); // (the day's first pail: on a busy day held up and named once, not at every pail, S2 review #5)
    else G.world.name('arena', f.player.x * TL + 12, f.player.y * TL - 14, { grow: 'carry' });
    yield 20;
  }
  function* pour(f) {
    const c = castle(), p = pail(); if (!p || !p.full) return;
    p.full = false; c.n = Math.min(3, c.n + 1); G.audio.sfx('pop'); G.st.autosave();
    const [x, y] = AT.site; for (let i = 0; i < 8; i++) CK.puff('crumb', x * TL + 12 + (Math.random() - 0.5) * 14, y * TL + 10, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.15, life: 30 });
    CK.sparkle(f, x, y, 4); yield 24;
    const nums = ['uno', 'dos', 'tres'];
    if (met(nums[c.n - 1])) yield* quiz('tere', '¿Cuántas?', 'How many pails of sand so far?', nums[c.n - 1], nums.filter((k, i) => i !== c.n - 1), { show: { icon: 'cubetaplaya', count: c.n } });
    if (c.n < 3) {
      p.full = false;
      CH.point(AT.fill[0] * TL + 12, AT.fill[1] * TL);
      try { yield* sayShow('tere', 'arena', T('¡Más [arena]!', 'More sand! Fill the pail again.')); } finally { CH.point(null); }
      return;
    }
    bag().take('cubetaarena', { q: 'castillo' }); G.st.autosave();
    yield* sayShow('tere', 'castillo', T('¡Mi [castillo]! ¡Y ahora...!', 'My castle! And now...'));
    yield* flagOn(f);
  }
  function* flagOn(f) {
    const c = castle();
    yield* sayShow('tere', { icon: 'bandera' }, T('¡Arriba!', 'The flag goes on top!'));
    c.flag = true; st().built = (st().built | 0) + 1; G.st.autosave();
    const [x, y] = AT.site; CK.sparkle(f, x, y, 8); G.audio.jingle('promote'); CK.confetti();
    yield 30;
    yield* quiz('tere', '¿Qué es?', 'What did you build together?', 'castillo', ['concha', 'cubetaarena', 'helado', 'arena'], { point: tile(x, y) });
    yield* sayShow('tere', 'castillo', T('¡[gracias:Gracias], {name}!', 'Thank you, {name}! Come build another one tomorrow!'));
  }

  // ---------- the little crab with no shell (after Don Paco's net: the crab and the shell are met) ----------
  function* hermitTalk(f) {
    const [x, y] = AT.hermit;
    G.audio.sfx('select'); for (const at of [0, 0.1]) noise(3000, 0.03, 0.15, at);
    if (!st().hermitOn) {
      st().hermitOn = true; G.st.autosave();
      yield* tell(T('¡Un [cangrejo]... sin [concha]!', 'A little crab with no shell! It is cold and shy.'));
      yield* sayShow('lola', 'caracola', T('¿Y su [concha]?', 'Where is its new shell? Find the one it wants (the big spiral one), and tap it!'));
    } else yield* tell(T('¿Y su [concha]?', 'Which shell does it want? (the big spiral one)'));
    void x; void y;
  }
  function* hermitTry(f, i) {
    const s = HERMIT_SHELLS[i];
    G.audio.sfx('select');
    PL.fly = { from: s.at, to: AT.hermit, t: 0, pic: s.pic, back: !s.right };
    for (let k = 0; k < 24; k++) { PL.fly.t = k / 24; yield 1; }
    if (!s.right) { G.audio.sfx('boop'); PL.wob = 30; yield 20; for (let k = 24; k >= 0; k--) { PL.fly.t = k / 24; yield 1; } PL.fly = null; yield* tell(T('¡No! ¡Muy pequeña!', 'No! Too small! Find the big spiral shell.')); return; }
    PL.fly = null; st().hermit = true; st().hermitOn = false; G.audio.jingle('item'); G.st.autosave();
    const [x, y] = AT.hermit; CK.sparkle(f, x, y, 8);
    for (let k = 0; k < 3; k++) CK.puff('heart', x * TL + 8 + k * 5, y * TL - 2, { life: 50, vy: -0.4 });
    yield 30;
    yield* sayShow('lola', 'caracola', T('¡Su [concha]! ¡Qué bonita!', 'Its new shell! How pretty! It is happy now.'));
    yield* quiz('lola', '¿Qué es?', 'And what is the little animal?', 'cangrejo', ['estrellamar', 'gaviota', 'tortuga'], { point: tile(x, y) });
  }

  // ---------- an ice cream for whoever is hot today (after chapter 2: el helado, caliente) ----------
  const HOT = ['paco', 'lola', 'tere', 'marina'];
  const hotWho = () => (CH.done('playa2') ? HOT[day() % HOT.length] : null);
  const hotDone = () => st().hot.d === day();
  PL.hotWho = hotWho;
  const iceHeld = () => { const h = held(); return h && h.id === 'helado' ? h : null; };
  sideAlert.nieves = () => (hotWho() && !hotDone() && !iceHeld() && !bag().has('helado') ? 'helado' : null);
  for (const w of HOT) {
    const a0 = sideAlert[w];
    sideAlert[w] = () => (hotWho() === w && !hotDone() ? (iceHeld() ? 'helado' : { icon: 'caliente' }) : null) || (a0 ? a0() : null);
  }
  function* nievesSide(f) {
    if (!hotWho() || hotDone()) return false;
    if (iceHeld() || bag().has('helado')) { yield* sayShow('nieves', { face: hotWho() }, T('¡Para ' + G.nameOf(hotWho()).replace(/^(Don|Doña) /, '') + '!', 'For ' + G.nameOf(hotWho()) + '! They are so hot.')); return true; }
    // Quiero un helado (src/phrases.js): say it to get it; else the question as before
    const ph = G.phrase ? yield* G.phrase.quiero('nieves', ['helado'], { onGet: function* () { bag().add('helado'); G.st.autosave(); yield* sayShow('nieves', 'helado', T('¡Un [helado]! ¡Aquí tienes!', 'An ice cream! Here you are!')); } }) : null;
    if (!ph) { yield* quiz('nieves', '¿Qué quieres?', 'What would you like? (an ice cream!)', 'helado', ['concha', 'elsol', 'arena', 'cubetaarena'], { show: 'helado' }); bag().add('helado'); G.st.autosave(); }
    yield* sayShow('nieves', { face: hotWho() }, T('¡Para ' + G.nameOf(hotWho()).replace(/^(Don|Doña) /, '') + '! ¡Tiene mucho [caliente:calor]!', 'Take it to ' + G.nameOf(hotWho()) + ': they are so hot!'));
    return true;
  }
  function* hotSide(who) {
    if (hotWho() !== who || hotDone()) return false;
    const h = iceHeld();
    if (!h) { yield* sayShow(who, { icon: 'caliente' }, T('¡Uf! ¡Qué [caliente:calor]!', 'Phew! So hot! (an ice cream from Doña Nieves would help)')); return true; }
    bag().take('helado', { q: null }); st().hot.d = day(); G.audio.jingle('item'); G.st.autosave();
    const f = G.field, n = f && npcAt(f, who); if (n) for (let k = 0; k < 3; k++) CK.puff('heart', n.x * TL + 8 + k * 5, n.y * TL - 6, { life: 50, vy: -0.4 });
    G.state.stars++; G.audio.sfx('star');
    yield* sayShow(who, 'helado', T('¡Mmm! ¡Un [helado]! ¡[gracias:Gracias]!', 'Mmm! An ice cream! Thank you!'));
    yield* quiz(who, '¿Y el [elsol]?', 'Where is the sun? (pick its picture)', 'elsol', ['helado', 'caliente', 'mar'], { pic: true });
    return true;
  }
  // the dog loves ice cream too (carry.js: given to him, he eats it)
  if (G.carry) G.carry.DOG.helado = 'eat';

  // ---------- the map's side places: taps, the guide, pictures (zones.js hooks, only on the beach) ----------
  const zSearch = Z.search, zSpecial = Z.special, zBlocks = Z.blocks, zGoal = Z.goal, zUnder = Z.drawUnder, zTop = Z.drawTop;
  Z.search = (f, x, y) => { const s = sideAt(f, x, y); return s ? s.run(f) : zSearch(f, x, y); };
  Z.special = (f, x, y) => !!sideAt(f, x, y) || zSpecial(f, x, y);
  Z.blocks = (f, x, y) => zBlocks(f, x, y) || (f.mapId === 'playa' && G.state && ((x === AT.hermit[0] && y === AT.hermit[1] && hermitOn()) || (x === AT.site[0] && y === AT.site[1] && castle().n > 0)));
  // the guide (guide.js zoneGoal): the pail to the water / back to Tere, the little crab, a shell Lola is missing
  const pt = (at, lift, icon) => ({ x: at[0] * TL + 12, y: at[1] * TL + 12, lift, icon });
  const zTask = Z.task;
  Z.task = function (f) { // things going on: the pail in your hands, the little crab waiting for its shell
    if (f && f.mapId === 'playa' && G.state) {
      const p = pail();
      if (p && !p.full) return { why: 'playa: fill the pail', pts: [pt(AT.fill, 30, 'cubetaplaya')] };
      if (p && p.full) { const n = npcAt(f, 'tere'); if (n) return { why: 'playa: the sand to Tere', pts: [{ x: n.x * TL + 12, y: n.y * TL + 12, lift: 44, npc: n }] }; }
      if (hermitOn() && st().hermitOn) return { why: 'playa: the crab\'s shell', choice: true, pts: HERMIT_SHELLS.map(s => pt(s.at, 18)) };
    }
    return zTask(f);
  };
  Z.goal = function (f) { // suggestions: the little crab, a shell Lola is missing
    if (f && f.mapId === 'playa' && G.state) {
      if (hermitOn() && !st().hermitOn) return { why: 'playa: the little crab', pts: [pt(AT.hermit, 40, 'caracola')] };
      if (st().asked === day() && !PL.shellsDone() && !held()) {
        const pl = f.player, srcs = G.carry.SOURCES.filter(s => s.map === 'playa' && s.item === 'concha' && !st().shells[s.col] && G.carry.avail(s.id))
          .sort((a, b) => Math.abs(a.at[0] - pl.x) + Math.abs(a.at[1] - pl.y) - Math.abs(b.at[0] - pl.x) - Math.abs(b.at[1] - pl.y));
        if (srcs.length) return { why: 'playa: a shell for Lola', pts: [pt(srcs[0].at, 20, shellPic(srcs[0].col))] };
      }
    }
    return zGoal(f);
  };
  // the little crab (shivering with no shell, or in its new spiral shell), its shells to choose from, a shell flying;
  // Tere's castle growing (a mound, bigger, the towers, then the flag)
  function hermitCrab(ctx, x, y, home, t) {
    const sh = home ? 0 : ((t >> 2) & 1), wob = PL.wob > 0 ? Math.round(Math.sin(PL.wob) * 2) : 0;
    if (home) G.drawIcon16(ctx, 'caracola', x + 2 + wob, y - 2);
    ctx.fillStyle = '#1a1420'; ctx.fillRect(x + sh + wob + 5, y + 7, 8, 6);
    ctx.fillStyle = home ? '#e84830' : '#f8a0a0'; ctx.fillRect(x + sh + wob + 6, y + 8, 6, 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + sh + wob + 6, y + 6, 2, 2); ctx.fillRect(x + sh + wob + 10, y + 6, 2, 2);
    ctx.fillStyle = '#101010'; ctx.fillRect(x + sh + wob + 7, y + 7, 1, 1); ctx.fillRect(x + sh + wob + 10, y + 7, 1, 1);
    ctx.fillStyle = home ? '#c03020' : '#e07070'; ctx.fillRect(x + sh + wob + 4, y + 12, 1, 2); ctx.fillRect(x + sh + wob + 13, y + 12, 1, 2);
  }
  function castleAt(ctx, x, y, n, flag) {
    if (n <= 0) return;
    const S1 = '#e8c880', S2 = '#c8a058', S0 = '#9a7040';
    ctx.fillStyle = 'rgba(16,28,8,0.25)'; ctx.fillRect(x + 1, y + 20, 22, 3);
    const box = (bx, by, w, h) => { ctx.fillStyle = S0; ctx.fillRect(bx - 1, by - 1, w + 2, h + 2); ctx.fillStyle = S1; ctx.fillRect(bx, by, w, h); ctx.fillStyle = S2; ctx.fillRect(bx + w - 2, by + 1, 2, h - 1); };
    if (n === 1) { box(4, 14, 16, 7); }
    else { box(3, 10, 18, 11); for (let i = 0; i < 4; i++) box(4 + i * 5, 8, 2, 2); }
    if (n >= 3) { box(0, 4, 6, 17); box(18, 4, 6, 17); ctx.fillStyle = S0; ctx.fillRect(10, 15, 4, 6); }
    if (flag) { ctx.fillStyle = '#6a4020'; ctx.fillRect(11, -6, 1, 16); ctx.fillStyle = '#e83a30'; ctx.fillRect(12, -6, 6, 4); ctx.fillStyle = '#ff8070'; ctx.fillRect(12, -6, 6, 1); }
    void y;
  }
  Z.drawUnder = function (f, ctx) {
    zUnder(f, ctx);
    if (f.mapId !== 'playa' || !G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), c = castle();
    ctx.save(); ctx.translate(AT.site[0] * TL - cx, AT.site[1] * TL - cy); castleAt(ctx, 0, 0, c.n, c.flag); ctx.restore();
    if (PL.wob > 0) PL.wob--;
    if (hermitOn() || st().hermit) {
      const [hx, hy] = AT.hermit; hermitCrab(ctx, hx * TL - cx, hy * TL - cy + 4, !hermitOn(), f.t);
      if (hermitOn() && st().hermitOn) HERMIT_SHELLS.forEach((s, i) => { if (PL.fly && PL.fly.pic === s.pic) return; const bob = Math.round(Math.sin((f.t + i * 20) / 14)); G.drawIcon16(ctx, s.pic, s.at[0] * TL - cx + 4, s.at[1] * TL - cy + 4 + bob); });
      const fl = PL.fly; if (fl) { const u = fl.t, x = fl.from[0] + (fl.to[0] - fl.from[0]) * u, y = fl.from[1] + (fl.to[1] - fl.from[1]) * u; G.drawIcon16(ctx, fl.pic, Math.round(x * TL - cx + 4), Math.round(y * TL - cy + 2 - Math.sin(u * Math.PI) * 16)); }
    }
  };
  Z.drawTop = function (f, ctx) {
    zTop(f, ctx);
    if (f.mapId !== 'playa' || !G.state || f.locked || G.top() !== f) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const s of SIDE) { if (!s.on()) continue; const ic = s.icon(); if (ic) G.drawAlert(ctx, ic, s.at[0] * TL - cx, s.at[1] * TL - cy + 4, f.t); }
  };
  // a new ghost-hand demo (src/demo.js): the first time you hold the empty pail, the hand taps the water's edge
  (Z.demos || (Z.demos = [])).push({ kind: 'fillpail', find: f => (f.mapId === 'playa' && pail() && !pail().full ? AT.fill : null) });

  // =====================================================================
  //  The map
  // =====================================================================
  const randShell = () => SHELLS[Math.floor(Math.random() * SHELLS.length)];
  G.maps.playa = {
    name: 'La playa', icon: 'playa', rows: MD.playa.rows, music: 'story',
    exits: [Z.edge(10, 0, 'camino_playa', 6, 22, 'up')],
    posts: [{ at: P('playa', 'post'), zone: 'playa' }],
    // the dog's things to do: dig in the sand (a shell of some colour), splash in the waves, chase the gulls
    dogSpots: [
      { id: 'playa_arena', at: P('playa', 'dog'), act: 'dig', gives: 'concha', get col() { return randShell(); }, every: 150 },
      { id: 'playa_olas', at: P('playa', 'splash'), act: 'splash', every: 90 },
      { id: 'playa_gaviotas', at: P('playa', 'dog2'), act: 'chase', kind: 'gaviota', every: 60 },
    ],
    pages: K.pages('playa'),
    ambient: { birds: 0, butterflies: 2 },
    animals: [
      { kind: 'cangrejo', n: 3, area: 'rocas' }, { kind: 'cangrejo', n: 1, area: 'arena' },
      { kind: 'gaviota', n: 3, area: 'arena' },
      { kind: 'estrellamar', n: 2, area: 'bajo' }, { kind: 'estrellamar', n: 1, area: 'charco' },
      { kind: 'tortuga', n: 1, area: 'orilla' },
      { kind: 'medusa', n: 2, area: 'agua' },
      { kind: 'delfin', area: 'mar', when: 'manana', chance: 0.75 },  // rare: in the morning, leaping far out
      { kind: 'pulpo', area: 'charco', when: 'noche' },               // rare: at night, in the tide pool
    ],
    // tap anything (world.js): the sea, the waves, the castle, the ice cream cart, the dune grass and palms (no word)
    things: { tiles: { w: 'mar', '-': 'mar', '~': 'mar', '9': 'ola', '3': 'castillo', '8': 'helado', '1': null, '&': null } },
    npcs: [
      K.canelo(10, 2), lola, Z.nico(...P('playa', 'nico')),
      person('paco', ...P('playa', 'paco'), 'down', null, pacoLine, { fixed: true }),
      person('marina', ...P('playa', 'marina'), 'down', () => hotSide('marina'), marinaLine),
      person('nieves', ...P('playa', 'nieves'), 'down', nievesSide, nievesLine, { fixed: true }),
      person('tere', ...P('playa', 'tere'), 'left', function* (f) { return (yield* hotSide('tere')) || (yield* tereSide(f)); }, tereLine),
    ],
  };
  // Don Paco and Lola can be hot too (their talk: the ice cream first)
  { const p = G.maps.playa.npcs.find(n => n.id === 'paco'), t0 = p.talk; p.talk = function* (f) { if (!CH.alert('paco') && (yield* hotSide('paco'))) return; yield* t0(f); }; }
  { const t0 = lola.talk; lola.talk = function* (f) { if (G.state && !CH.alert('lola') && !shellHeld() && (yield* hotSide('lola'))) return; yield* t0(f); }; const a0 = lola.alert; lola.alert = () => a0() || (G.state && sideAlert.lola ? sideAlert.lola() : null); }

  // ---------- things to pick up: Lola's five shells, a stick ----------
  G.carry.SOURCES.push(
    { id: 'palo_cplaya', map: 'camino_playa', at: P('camino_playa', 'palo'), item: 'palo', every: 90 },
    { id: 'palo_playa', map: 'playa', at: [3, 6], item: 'palo', every: 90 },
    { id: 'concha_rosa', map: 'playa', at: [4, 12], item: 'concha', col: 'rosa', every: 200 },
    { id: 'concha_blanco', map: 'playa', at: [13, 14], item: 'concha', col: 'blanco', every: 200 },
    { id: 'concha_azul', map: 'playa', at: [21, 9], item: 'concha', col: 'azul', every: 200 },
    { id: 'concha_amarillo', map: 'playa', at: [30, 9], item: 'concha', col: 'amarillo', every: 200 },
    { id: 'concha_rojo', map: 'playa', at: [8, 7], item: 'concha', col: 'rojo', every: 200 },
  );
  // ---------- Nico's hiding places on the beach (seek.js) ----------
  G.seek.SPOTS.push(
    { id: 'playa1', map: 'playa', at: P('playa', 'hide1'), how: 'over', cut: 9, dx: 0, kinds: ['cangrejo', 'gaviota', 'gato', 'conejo'], place: 'playa' },     // behind an umbrella
    { id: 'playa2', map: 'playa', at: P('playa', 'hide2'), how: 'over', cut: 10, dx: 0, kinds: ['cangrejo', 'tortuga', 'gato', 'conejo'], place: 'castillo' }, // behind the sandcastle
    { id: 'playa3', map: 'playa', at: P('playa', 'hide3'), how: 'over', cut: 9, dx: 0, kinds: ['cangrejo', 'estrellamar', 'rana', 'gato'], place: 'rocas' },  // behind the rocks
    { id: 'playa4', map: 'playa', at: P('playa', 'hide4'), how: 'over', cut: 14, dx: 0, kinds: ['gaviota', 'gato', 'conejo'], place: 'playa' },              // behind a palm
    { id: 'playa5', map: 'playa', at: P('playa', 'hide5'), how: 'over', cut: 11, dx: -10, kinds: ['gaviota', 'gato', 'cangrejo', 'estrellamar'], place: 'redpesca' }, // in Don Paco's boat
    { id: 'playa6', map: 'playa', at: P('playa', 'hide6'), how: 'over', cut: 9, dx: 0, kinds: ['tortuga', 'gato', 'conejo', 'gallina'], place: 'playa' },     // behind another umbrella
  );
  G.seek.KINDS.push('cangrejo', 'gaviota', 'tortuga', 'estrellamar');
  Object.assign(G.seek.PEEK, { cangrejo: [3, 4], gaviota: [3, 5], tortuga: [3, 5], estrellamar: [3, 5] });
  // ---------- favours (favores.js, from Villa Sol's chapter 7 on): the beach's people ask about its words ----------
  const been = () => Z.visited('playa');
  G.favores.OFFERS.push(['paco', 'thing', ['concha', 'cangrejo', 'estrellamar', 'mar'], been], ['nieves', 'thing', ['helado', 'elsol'], been], ['marina', 'thing', ['ola', 'elsol', 'tortuga', 'gaviota'], been]);
  Object.assign(G.favores.THINGS, { paco: ['concha', 'cangrejo', 'estrellamar', 'mar'], nieves: ['helado', 'elsol'], marina: ['ola', 'elsol', 'tortuga', 'gaviota'] });

  // =====================================================================
  //  The story: the beach's quest line (G.chapters, line 'playa')
  // =====================================================================
  CH.add({ id: 'playa1', line: 'playa', title: 'La red de Don Paco', en: 'Don Paco\'s net: what is tangled in it?', giver: 'paco', words: ['mar', 'cangrejo', 'estrellamar', 'concha'], icon: 'redpesca', col: '#3878d0', goal: [['redpesca', 1]] });
  CH.add({ id: 'playa2', line: 'playa', title: '¡Qué calor!', en: 'So hot! An ice cream for Marina the lifeguard', giver: 'marina', words: ['elsol', 'caliente', 'helado'], icon: 'helado', col: '#e870a8', goal: [['helado', 1]] });
  CH.add({ id: 'playa3', line: 'playa', title: 'Las tortuguitas', en: 'The baby turtles: chase off the gulls, help them to the sea', giver: 'marina', words: ['arena', 'tortuga', 'gaviota', 'nadar'], icon: 'tortuga', col: '#3a9a50', goal: [['tortuga', 3]] });

  // ---------- 1 · La red de Don Paco (the pier): el mar, el cangrejo, la estrella de mar, la concha ----------
  const NET = P('playa', 'net');
  // the things in the net, drawn on the pier: [word, dx]
  const IN_NET = [['cangrejo', -10], ['estrellamar', 2], ['concha', 14]];
  CH.script('playa1', [
    { who: 'paco', run: function* (f, c) { // ¡Mi red!
      yield* say('paco', T('¡Hola, {name}! Soy Don Paco.', 'Hi, {name}! I\'m Don Paco, the fisherman.'));
      yield* meetW('mar', { who: 'paco', prompt: '¡Mira! ¡El [mar]!', en: 'Look! The sea!', known: othersFor('mar', ['ola', 'concha']) });
      c.data.net = 1;
      CH.point(NET[0] * TL + 12, NET[1] * TL);
      try { yield* sayShow('paco', { icon: 'redpesca' }, T('¡Ay! Mi red... ¡en el [mar]!', 'Oh no! My net fell in the sea, at the end of the pier. Can you pull it up?')); } finally { CH.point(null); }
    } },
    { spot: { map: 'playa', at: NET, icon: 'redpesca' }, run: function* (f, c) { // pull it up: what's tangled in it?
      G.audio.sfx('swing'); G.fx.shake = 8; yield 20; G.audio.sfx('swing'); G.fx.shake = 8; yield 16;
      c.data.net = 2; G.audio.jingle('item'); CK.sparkle(f, NET[0], NET[1], 6);
      yield* tell(T('¡La red! ¡Uf!', 'The net is up! Something is tangled in it...'));
      AN.cry('cangrejo'); c.data.wiggle = 'cangrejo';
      yield* meetW('cangrejo', { who: 'paco', prompt: '¡Clic, clic! ¡Un [cangrejo]!', en: 'Click, click! A crab!', known: othersFor('cangrejo', ['mar', 'ola', 'concha']) });
      c.data.wiggle = 'estrellamar';
      yield* meetW('estrellamar', { who: 'paco', prompt: '¡Y una [estrellamar]!', en: 'And a starfish!', known: othersFor('estrellamar', ['cangrejo', 'mar']) });
      c.data.wiggle = 'concha';
      yield* meetW('concha', { who: 'paco', prompt: '¡Y una [concha]!', en: 'And a seashell!', known: othersFor('concha', ['cangrejo', 'estrellamar']), show: shellPic('blanco') });
      c.data.wiggle = null;
      // back to the sea: hear it, pick its picture
      yield* ask('paco', '¿Y el [cangrejo]? ¡Al [mar]!', 'Back to the sea! Which one is the crab?', 'cangrejo', ['estrellamar', 'concha'], { pic: true });
      c.data.gone = { cangrejo: G.frame }; G.audio.sfx('swing'); yield 30;
      yield* ask('paco', '¿Y la [estrellamar]?', 'And the starfish? Which one?', 'estrellamar', ['concha', 'cangrejo'], { pic: true });
      c.data.gone.estrellamar = G.frame; G.audio.sfx('swing'); yield 30;
      c.data.net = 3;
      bag().add('concha', { col: 'blanco' });
      yield* sayShow('paco', shellPic('blanco'), T('La [concha]... ¡para ti!', 'And the shell... is for you! (Lola collects them)'));
    } },
    { who: 'paco', run: function* (f) { // thank you; the sea, said
      yield* say('paco', T('¡Mi red! ¡[gracias:Gracias], {name}!', 'My net! Thank you, {name}!'));
      yield* quiz('paco', '¿Qué es?', 'He waves at the water: what is it?', 'mar', ['concha', 'cangrejo', 'ola'], { show: 'mar' });
    } },
  ], {
    stage(f) { if (f.mapId === 'playa') { const n = npcAt(f, 'paco'); if (n && !n.busy) CK.place(f, 'paco', ...P('playa', 'paco'), 'down'); } },
    draw(f, ctx, c) { // the net at the end of the pier: in the water, then up on the planks with its catch
      if (f.mapId !== 'playa' || !c.data.net || c.data.net > 2 || CH.done('playa1')) return;
      const x = NET[0] * TL + 12 - Math.round(f.cam.x), y = NET[1] * TL + 12 - Math.round(f.cam.y);
      if (c.data.net === 1) { const b = Math.round(Math.sin(f.t / 12)); G.drawIcon16(ctx, { icon: 'redpesca' }, x - 8, y + 6 + b); return; }
      G.drawIcon16(ctx, { icon: 'redpesca' }, x - 16, y - 12, 2);
      for (const [id, dx] of IN_NET) {
        const g = c.data.gone && c.data.gone[id]; if (g && G.frame - g > 40) continue;
        const k = g ? (G.frame - g) / 40 : 0, w = c.data.wiggle === id ? Math.round(Math.sin(G.frame / 3) * 2) : 0;
        G.drawIcon16(ctx, id === 'concha' ? shellPic('blanco') : id, x - 8 + dx + w + Math.round(k * 40), y - 6 - Math.round(Math.sin(k * Math.PI) * 30));
      }
    },
  });

  // ---------- 2 · ¡Qué calor! (Marina's tower, Doña Nieves's cart): el sol, caliente, el helado ----------
  function* hotHop(f) { // Marina hops on the hot sand, fanning herself; little steam puffs
    const n = npcAt(f, 'marina'); if (!n) return;
    for (let k = 0; k < 4; k++) { n.dir = k & 1 ? 'left' : 'right'; CK.puff('dust', n.x * TL + 12 + (k & 1 ? -6 : 6), n.y * TL + 20, { vy: -0.6, life: 30 }); G.audio.sfx('select'); yield 10; }
    n.dir = 'down';
  }
  CH.script('playa2', [
    { who: 'marina', run: function* (f, c) {
      yield* say('marina', T('¡Hola, {name}! Soy Marina.', 'Hi, {name}! I\'m Marina, the lifeguard.'));
      c.data.hot = 1;
      yield* meetW('elsol', { who: 'marina', prompt: '¡Uf! ¡El [elsol]!', en: 'Phew! The sun!', known: othersFor('elsol', ['mar', 'ola', 'concha']) });
      yield* G.intro.watch('caliente', { who: 'marina', prompt: '¡Ay, ay! ¡[caliente]!', en: 'Ouch, ouch! The sand is hot!', act: () => hotHop(f), ask: '¡Ay! ¿Cómo está la arena?', askEn: 'Ouch! How is the sand? (say it, or tap it)', known: othersFor('caliente', ['elsol', 'mar']) });
      const n = npcAt(f, 'nieves'); if (n) CH.pointNpc(n);
      try { yield* sayShow('marina', 'helado', T('¿Un [helado]? ¡[porfavor:Por favor]!', 'An ice cream? Please! (Doña Nieves has the ice-cream cart)')); } finally { CH.point(null); }
    } },
    { who: 'nieves', bubble: { icon: 'helado' }, run: function* (f, c) {
      yield* say('nieves', T('¡Hola! ¡Soy Doña Nieves!', 'Hello! I\'m Doña Nieves, the ice-cream lady.'));
      yield* meetW('helado', { who: 'nieves', prompt: '¡Un [helado]! ¡Para Marina!', en: 'An ice cream! For Marina!', known: othersFor('helado', ['elsol', 'caliente', 'concha']) });
      bag().add('helado', { q: 'playa2' }); c.data.ice = 1;
    } },
    { who: 'marina', bubble: { icon: 'helado' }, run: function* (f, c) {
      bag().take('helado', { q: 'playa2' }); c.data.ice = 2; c.data.hot = 0; G.audio.jingle('item');
      const n = npcAt(f, 'marina'); if (n) for (let k = 0; k < 3; k++) CK.puff('heart', n.x * TL + 8 + k * 5, n.y * TL - 6, { life: 50, vy: -0.4 });
      yield* say('marina', T('¡Mmm! ¡[helado]! ¡[gracias:Gracias]!', 'Mmm! Ice cream! Thank you!'));
      yield* quiz('marina', '¿Qué es?', 'What is she eating?', 'helado', ['elsol', 'caliente', 'concha'], { show: 'helado' });
      yield* quiz('marina', '¿Y el [elsol]? ¿Cómo está?', 'And the sun? How is it?', 'caliente', ['helado', 'mar', 'ola']);
      yield* sayShow('marina', 'elsol', T('¡El [elsol]! ¡[caliente]!', 'The sun is hot! (later, when someone is hot, bring them an ice cream)'));
    } },
  ], {
    stage(f) { if (f.mapId === 'playa') for (const id of ['marina', 'nieves']) { const n = npcAt(f, id); if (n && !n.busy) CK.place(f, id, ...P('playa', id), 'down'); } },
    drawTop(f, ctx, c) { // Marina sweating under the sun
      if (f.mapId !== 'playa' || !c.data.hot || CH.done('playa2')) return;
      const n = npcAt(f, 'marina'); if (!n) return;
      const x = n.x * TL + 12 - Math.round(f.cam.x), y = n.y * TL - 6 - Math.round(f.cam.y), k = (f.t >> 2) % 12;
      ctx.fillStyle = '#68c0ff'; ctx.fillRect(x + 7, y + k, 2, 3); ctx.fillRect(x - 9, y + ((k + 6) % 12), 2, 3);
    },
  });

  // ---------- 3 · Las tortuguitas (the nest): la arena, la tortuga, la gaviota, nadar ----------
  const NEST = P('playa', 'nest');
  const BABIES = [[NEST[0] - 1, NEST[1]], [NEST[0], NEST[1] + 1], [NEST[0] + 1, NEST[1]]];
  // where a baby is drawn: in the nest, crawling down to the water (t: frames since it was helped), out at sea
  const babyPos = (c, i) => {
    const [bx, by] = BABIES[i], g = (c.data.go || {})[i];
    let x = bx * TL + 12, y = by * TL + 16;
    if (g != null) { const k = Math.min(1, (G.frame - g) / 150); y += k * ((16 - by) * TL); x += Math.sin(k * 12) * 2; }
    if (c.data.swim) { const k = Math.min(1, (G.frame - c.data.swim) / 240); y += k * 3 * TL; x += (i - 1) * k * 30; }
    return [x, y];
  };
  function baby(ctx, x, y, t, swim) { // a tiny green turtle (from above): a shell, a head, flippers paddling
    const p = (t >> 3) & 1;
    ctx.fillStyle = '#1a1420'; ctx.fillRect(x - 4, y - 4, 9, 8); ctx.fillRect(x - 2, y - 7, 5, 4);
    ctx.fillStyle = '#3a8a40'; ctx.fillRect(x - 3, y - 3, 7, 6); ctx.fillStyle = '#68b050'; ctx.fillRect(x - 1, y - 2, 3, 3);
    ctx.fillStyle = '#78c058'; ctx.fillRect(x - 1, y - 6, 3, 3); ctx.fillRect(x - 5 + p, y - 3, 2, 2); ctx.fillRect(x + 4 - p, y - 3, 2, 2); ctx.fillRect(x - 4, y + 2 - p, 2, 2); ctx.fillRect(x + 3, y + 2 - p, 2, 2);
    if (swim) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(x + 0.5, y + 4.5, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  function gull(ctx, x, y, t) { // a gull circling: a white body, grey wings flapping
    const up = (t >> 3) & 1;
    ctx.fillStyle = '#1a1420'; ctx.fillRect(x - 6, y - 2, 13, 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, y - 1, 7, 3); ctx.fillStyle = '#f8c830'; ctx.fillRect(x + 4, y, 2, 1);
    ctx.fillStyle = '#a8b0c0'; if (up) { ctx.fillRect(x - 6, y - 4, 5, 2); ctx.fillRect(x + 2, y - 4, 5, 2); } else { ctx.fillRect(x - 6, y + 1, 5, 2); ctx.fillRect(x + 2, y + 1, 5, 2); }
  }
  const allGone = c => BABIES.every((b, i) => (c.data.go || {})[i] != null);
  const allIn = c => allGone(c) && BABIES.every((b, i) => G.frame - c.data.go[i] > 150);
  CH.script('playa3', [
    { who: 'marina', bubble: { icon: 'nidoarena' }, run: function* (f, c) { // a nest in the sand
      CH.point(NEST[0] * TL + 12, NEST[1] * TL);
      try {
        yield* sayShow('marina', { icon: 'nidoarena' }, T('¡{name}! ¡Mira! ¡Un nido!', '{name}! Look! A nest... turtle eggs!'));
        yield* meetW('arena', { who: 'marina', prompt: 'En la [arena]...', en: 'In the sand...', known: othersFor('arena', ['mar', 'elsol', 'concha', 'helado']) });
      } finally { CH.point(null); }
      c.data.nest = 1;
    } },
    { spot: { map: 'playa', at: NEST, icon: 'nidoarena' }, run: function* (f, c) { // they hatch! the gulls come
      for (let k = 0; k < 3; k++) { G.audio.sfx('pop'); CK.sparkle(f, NEST[0], NEST[1], 3); c.data.crack = k + 1; yield 22; }
      c.data.hatched = 1; G.audio.jingle('item');
      yield* meetW('tortuga', { who: 'marina', prompt: '¡[tortuga:Tortuguitas]!', en: 'Baby turtles!', known: othersFor('tortuga', ['cangrejo', 'estrellamar', 'concha', 'arena']) });
      c.data.gulls = G.frame; AN.cry('gaviota'); yield 30; AN.cry('gaviota');
      yield* G.intro.listen('gaviota', { who: 'marina', prompt: '¡Kiaa, kiaa! ¡[gaviota:Gaviotas]!', en: 'Kiaa, kiaa! Seagulls! Which one is a seagull?', sound: () => AN.cry('gaviota'), known: othersFor('gaviota', ['tortuga', 'cangrejo', 'estrellamar']) });
      yield* sayShow('marina', { icon: 'perro' }, T('¡{dog}! ¡Las [gaviota:gaviotas]!', 'Quick! Tap {dog}: he will chase the seagulls away!'));
    } },
    { who: 'canelo', bubble: { icon: 'gaviota' }, run: function* (f, c) { // the dog chases the gulls off
      const n = CK.dog(f); CK.bark(f, n);
      yield* CK.walk(f, n, NEST[0], NEST[1] - 1, 5); n.dir = 'up'; CK.bark(f, n); yield* G.pet.play('jump'); CK.bark(f, n);
      c.data.gulls = 0; c.data.shoo = G.frame; AN.cry('gaviota');
      for (const a of (f.zoo ? f.zoo.list : []).filter(a => a.kind === 'gaviota')) AN.takeOff(a);
      yield 40; CK.heart(f, n);
      yield* quiz('marina', '¿Qué es?', 'What did {dog} chase away?', 'gaviota', ['tortuga', 'cangrejo', 'arena'], { pic: true });
      yield* sayShow('marina', 'mar', T('¡Al [mar], [tortuga:tortuguitas]!', 'To the sea, little turtles! Help them: tap each one.'));
    } },
    { spots: BABIES.map((at, i) => ({ map: 'playa', at, quiet: true, off: c => (c.data.go || {})[i] != null })), hint: (f, c) => BABIES.filter((b, i) => !(c.data.go || {})[i]).map(([x, y]) => ({ x: x * TL + 12, y: y * TL + 12, spot: 'baby' })),
      run: function* (f, c, i) { // help each one down to the water
        const go = c.data.go || (c.data.go = {});
        if (go[i] != null) return false;
        go[i] = G.frame; G.audio.sfx('select'); CK.sparkle(f, BABIES[i][0], BABIES[i][1], 3);
        const n = Object.keys(go).length;
        if (n === 1) yield* quiz('marina', '¡...!', 'Cheer it on! What is it?', 'tortuga', ['gaviota', 'cangrejo', 'arena']);
        else yield 20;
        return n >= BABIES.length ? undefined : false;
      } },
    { auto: 'playa', when: c => allIn(c), run: function* (f, c) { // they swim away
      c.data.swim = G.frame;
      yield* G.intro.watch('nadar', { who: 'marina', prompt: '¡A [nadar]!', en: 'Off they swim!', act: function* () { G.audio.sfx('swing'); yield 50; },
        ask: 'Las [tortuga:tortuguitas]... ¡...!', askEn: 'The baby turtles... what are they doing?', known: othersFor('nadar', ['caliente', 'arena', 'mar']) });
      const sp = (f.def.dogSpots || []).find(s => s.id === 'playa_olas'), n = CK.dog(f);
      if (sp && n) { yield* CK.walk(f, n, sp.at[0], sp.at[1], 5); n.dir = 'down'; yield* G.pet.play('jump'); for (let i = 0; i < 10; i++) CK.puff('drop', n.x * TL + 12 + (Math.random() - 0.5) * 14, n.y * TL + 10, { vy: -1.5 - Math.random(), vx: (Math.random() - 0.5) * 1.6, g: 0.12, life: 36 }); G.audio.sfx('swing'); }
      yield* quiz('marina', '¿Y {dog}?', 'And {dog}? What is he doing?', 'nadar', ['caliente', 'arena', 'elsol']);
      yield* sayShow('marina', 'mar', T('¡[adios:Adiós], [tortuga:tortuguitas]!', 'Bye, little turtles! They are safe in the sea.'));
      CK.confetti();
    } },
  ], {
    stage(f) { if (f.mapId === 'playa') { const n = npcAt(f, 'marina'); if (n && !n.busy) CK.place(f, 'marina', ...P('playa', 'marina'), 'down'); } },
    draw(f, ctx, c) {
      if (f.mapId !== 'playa' || !c.data.nest || CH.done('playa3')) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), [nx, ny] = NEST;
      if (!c.data.hatched) { // the nest: a ring of sticks, eggs peeking, cracking
        const x = nx * TL - cx, y = ny * TL - cy;
        ctx.fillStyle = '#c8a058'; ctx.fillRect(x + 3, y + 12, 18, 8); ctx.fillStyle = '#8a5a2c'; for (const [dx, dy] of [[2, 10], [20, 10], [2, 19], [20, 19], [11, 8]]) ctx.fillRect(x + dx, y + dy, 2, 4);
        for (const [dx, dy] of [[6, 12], [11, 11], [15, 13]]) { const w = c.data.crack && (G.frame >> 2) & 1 ? 1 : 0; ctx.fillStyle = '#1a1420'; ctx.fillRect(x + dx - 1 + w, y + dy - 1, 6, 7); ctx.fillStyle = '#fffaf0'; ctx.fillRect(x + dx + w, y + dy, 4, 5); if (c.data.crack) { ctx.fillStyle = '#5a4030'; ctx.fillRect(x + dx + 1 + w, y + dy + 1, 1, 2); ctx.fillRect(x + dx + 2 + w, y + dy + 2, 1, 1); } }
        return;
      }
      BABIES.forEach((b, i) => { const [x, y] = babyPos(c, i); if (y - cy > G.H + 10) return; baby(ctx, Math.round(x - cx), Math.round(y - cy), f.t + i * 5, !!c.data.swim || (y > 15.5 * TL)); });
    },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'playa' || CH.done('playa3')) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), [nx, ny] = NEST;
      if (c.data.gulls) for (let i = 0; i < 2; i++) { const a = G.frame / 30 + i * Math.PI; gull(ctx, Math.round(nx * TL + 12 + Math.cos(a) * 26 - cx), Math.round(ny * TL - 22 + Math.sin(a) * 8 - cy), G.frame + i * 4); }
      if (c.data.shoo && G.frame - c.data.shoo < 90) { const k = (G.frame - c.data.shoo) / 90; for (let i = 0; i < 2; i++) gull(ctx, Math.round(nx * TL + 12 + (i ? 1 : -1) * k * 160 - cx), Math.round(ny * TL - 22 - k * 120 - cy), G.frame + i * 4); }
      if (c.data.hatched && !allGone(c)) BABIES.forEach((b, i) => { if ((c.data.go || {})[i] == null && G.top() === f && !f.locked) { const [x, y] = babyPos(c, i); G.drawAlert(ctx, 'mar', Math.round(x - 12 - cx), Math.round(y - 10 - cy), f.t + i * 7); } });
    },
  });

  // =====================================================================
  //  The zone
  // =====================================================================
  const bus = P('playa', 'bus'), busIn = P('playa', 'busIn');
  Z.add({
    id: 'playa', name: 'La playa', en: 'the beach', icon: 'playa', music: 'story', pos: [214, 184],
    maps: ['playa'], path: 'camino_playa',
    bus: { map: 'playa', at: bus }, entry: { map: 'playa', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: KINDS, // the album page, in order
    habitat: { cangrejo: 'rocas', gaviota: 'arena', estrellamar: 'ola', tortuga: 'nidoarena', medusa: 'mar', delfin: 'mar', pulpo: 'rocas' },
    rare: { delfin: 'manana', pulpo: 'noche' },
    planned: 0,
    lola: lolaHere,
  });
})();
