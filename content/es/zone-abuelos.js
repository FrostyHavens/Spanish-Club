// ===== La casa de los abuelos: the zone south-west of Villa Sol (docs/WORLD_PLAN.md) — family, the body, clothes =====
// Its path from Villa Sol (wheat fields, a fence, hens, an apple tree) and the grandparents' countryside home: the
// cottage in the middle (its front door opens: inside, the living room with the family photos, the fireplace and the
// baby cousin on the rug, the kitchen where Abuela bakes (a mouse lives there), the bedroom with the wardrobe, the
// mirror and the dressing-up trunk), the orchard behind it (tall fruit trees, a swing hanging from one), the henhouse,
// the vegetable garden and the water pump, the clothesline with the washing drying in the wind, the duck pond, the
// paddock (the cow, the donkey), the turkeys' yard, the sheep's meadow and the pigs' muddy pen. At night the windows
// glow, fireflies come out in the orchard and a possum climbs down; at dawn the rooster crows on the henhouse.
// Everything only uses universal words and the zone's own (each met here in a one-unknown puzzle, G.zones.meetW, and
// used again right away), so the grandparents' can be the very first place a child explores.
//   What you WEAR shows: the clothes you put on (from the clothesline, the trunk, Abuelo's jacket) are worn by your
//     character on every map (G.abuelos.wear: a cosmetic over the creator's look, saved), and the mirror shows them.
//   The body is DONE: "¡Toca tu nariz!" and your character (Abuelo, the baby) touches it (G.abuelos.act).
//   The album (8): la vaca and el burro (the paddock), el cerdo (in the mud), la oveja (the meadow), el pavo (the
//     turkeys' yard; they flap off), el ratón (in the kitchen), el gallo (rare: at dawn, on the henhouse), el
//     tlacuache (rare: at night in the orchard; tapped, it plays dead). Tapping one whose word isn't met: Lola names it.
//   The story (its quest line, 'abuelos'): 1 ¡A vestirse! (abuela, camisa, pantalón, vestido, calcetines: Abuela says
//     it's the family photo today; your clothes are on the line; the dog runs off with a sock), 2 ¡A lavarse! (abuelo,
//     cerdo, mano, pie, nariz: the dog rolls in the pigs' mud and jumps on you; wash at the pump), 3 ¡La foto de la
//     familia! (familia, zapatos, sombrero, bebé: shoes and a hat from the trunk, the baby has crawled off to the
//     ducks, everyone on the porch: ¡whisky!).
//   Side quests (G.state.abuelos): Abuela's cookies (eggs from the henhouse, wash your hands, count them), Abuelo's
//     garden (four vegetables in his basket), Simón dice with Abuelo (ojos, boca, cabeza: touch them; then you are
//     Simón), the dressing-up trunk (any time: put on what you like; the first time each day, a fashion show), Abuelo's
//     jacket at night (la chamarra), the photo wall (who's who). The swing in the orchard. The dog digs in the garden,
//     steals a sock from the line (a tug of war), chases the turkeys. Six hiding places, four page puzzles, favours.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA, CH = G.chapters, CK = CH.K, T = CK.T, TL = G.TILE, AN = G.animals;
  const P = (m, tag) => MD[m].pos[tag];
  const met = id => !!(G.words && G.words.met(id));
  const say = CK.say, sayShow = CK.sayShow, ask = CK.ask;
  const day = () => (G.words ? G.words.day() : 0);
  const meetW = (id, o) => Z.meetW(id, o);
  const night = () => !!(G.day && G.day.over && G.day.over());
  const npcAt = (f, id) => (f ? f.npcs.find(n => n.id === id && !n.hidden) || null : null);
  const inZone = f => !!f && (f.mapId === 'abuelos' || f.mapId === 'abuelos_casa');
  const outside = f => !!f && f.mapId === 'abuelos';
  const indoors = f => !!f && f.mapId === 'abuelos_casa';
  const AB = G.abuelos = {};
  const puff = (k, x, y, o) => CK.puff(k, x, y, o);
  const wait = function* (n) { for (let i = 0; i < n; i++) yield 1; };

  // ---------- the path from Villa Sol: wheat fields, a fence, hens, an apple tree ----------
  const IN = P('abuelos', 'in');
  G.maps.camino_abuelos = {
    name: 'El camino a la casa de los abuelos', icon: 'abuelos', rows: MD.camino_abuelos.rows, music: 'field',
    exits: [Z.edge(6, 0, 'villa', 5, 26, 'up'), Z.edge(6, 23, 'abuelos', IN[0], IN[1], 'down')],
    posts: [{ at: P('camino_abuelos', 'postN'), zone: 'villa', dir: 'up' }, { at: P('camino_abuelos', 'postS'), zone: 'abuelos', dir: 'down' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'gallina', n: 2, area: 'gallinas' }],
    things: {},
    npcs: [K.canelo(6, 2)],
  };

  // =====================================================================
  //  The animals (src/animals.js addKind: a generic move each, pixel frames facing right, a cry)
  // =====================================================================
  const tone = (...a) => AN.tone(...a), noise = (...a) => AN.noise(...a);
  const pad = spr => {
    const ks = Object.keys(spr).filter(k => k !== 'pal'), w = Math.max(...ks.map(k => Math.max(...spr[k].map(r => r.length)))), h = Math.max(...ks.map(k => spr[k].length));
    for (const k of ks) spr[k] = Array(h - spr[k].length).fill('.'.repeat(w)).concat(spr[k].map(r => r.padEnd(w, '.')));
    return spr;
  };
  AN.addKind('vaca', { word: 'vaca', cry: '¡Muuu!', move: 'walk', speed: 0.22, shadow: 16,
    sfx: () => { tone('sawtooth', 150, 120, 0.9, 0.09, 0, { filter: 'lowpass', ff: 700, vib: 4, depth: 6 }); },
    spr: pad({ pal: { w: '#f8f8f4', k: '#202028', p: '#f8a8b8', h: '#e8dcc0', e: '#101010', d: '#c8c8cc' },
      stand: ['.................h.h..', '................kwwwk.', '................wekwww', '..wwkkkwwwwwwwwwwwwppp', '.wwkkkwwwwwkkkwwwwwppp', 'wwwwwwwwwwwkkkwwwwww..', 'k.wwwwwwwwwwwwwwwww...', 'k.wwwwwwwwwwwwkkwwd...', '..wdww.ppp....wwkd....', '..w.ww........w.w.....', '..w.ww........w.w.....', '..k.kk........k.k.....'],
      walk: ['.................h.h..', '................kwwwk.', '................wekwww', '..wwkkkwwwwwwwwwwwwppp', '.wwkkkwwwwwkkkwwwwwppp', 'wwwwwwwwwwwkkkwwwwww..', 'k.wwwwwwwwwwwwwwwww...', 'k.wwwwwwwwwwwwkkwwd...', '..wdww.ppp....wwkd....', '..w..w.......w...w....', '.w....w.....w.....w...', '.k....k.....k.....k...'],
      react: ['.................h.h..', '................kwwwk.', '................wekwww', '..wwkkkwwwwwwwwwwwwppp', '.wwkkkwwwwwkkkwwwwwpkp', 'wwwwwwwwwwwkkkwwwwwppp', 'k.wwwwwwwwwwwwwwwww...', 'k.wwwwwwwwwwwwkkwwd...', '..wdww.ppp....wwkd....', '..w.ww........w.w.....', '..w.ww........w.w.....', '..k.kk........k.k.....'] }) });
  AN.addKind('cerdo', { word: 'cerdo', cry: '¡Oinc, oinc!', move: 'walk', speed: 0.3, shadow: 12, on: 'í.o',
    sfx: () => { noise(500, 0.12, 0.08, 0, { filter: 'bandpass', ff: 600, q: 2 }); noise(450, 0.14, 0.08, 0.18, { filter: 'bandpass', ff: 550, q: 2 }); },
    spr: pad({ pal: { p: '#f8a8b8', d: '#e08898', n: '#f87890', k: '#802838', e: '#101010', m: '#7a5030' },
      stand: ['.p.........dd..', 'p.pppppppppdpd.', '.pppppppppppep.', 'pppmmpppppppnnn', 'ppppppmmpppnkkn', '.ppppppppppppp.', '..dd.dd..dd.dd.', '..dd.dd..dd.dd.'],
      walk: ['.p.........dd..', 'p.pppppppppdpd.', '.pppppppppppep.', 'pppmmpppppppnnn', 'ppppppmmpppnkkn', '.ppppppppppppp.', '.dd..dd.dd..dd.', 'dd....dd.....dd'],
      react: ['...............', '.p.........dd..', 'p.pppppppppdpd.', '.pppppppppppep.', 'pppmmpppppppnnn', 'pppppmmmmppnkkn', 'mmmmmmmmmmmmmmm', '.mmmmmmmmmmmmm.'] }) });
  AN.addKind('oveja', { word: 'oveja', cry: '¡Beee!', move: 'walk', speed: 0.2, shadow: 12,
    sfx: () => { tone('sawtooth', 520, 500, 0.5, 0.06, 0, { vib: 22, depth: 30, filter: 'lowpass', ff: 1600 }); },
    spr: pad({ pal: { w: '#f8f8f0', s: '#d8d8d0', k: '#302830', e: '#ffffff' },
      stand: ['...ww.ww.ww.....', '.wwwwwwwwwwwkk..', 'wwswwwwswwwkkkkk', 'wwwwwswwwwwkekk.', 'wswwwwwwswwwkk..', '.wwwwwwwwwwww...', '..k.k....k.k....', '..k.k....k.k....'],
      walk: ['...ww.ww.ww.....', '.wwwwwwwwwwwkk..', 'wwswwwwswwwkkkkk', 'wwwwwswwwwwkekk.', 'wswwwwwwswwwkk..', '.wwwwwwwwwwww...', '.k...k..k...k...', 'k.....kk.....k..'],
      react: ['...ww.ww.ww.....', '.wwwwwwwwwwwkk..', 'wwswwwwswwwkkkkk', 'wwwwwswwwwwkkkk.', 'wswwwwwwswwkkkk.', '.wwwwwwwwwwwkk..', '..k.k....k.k....', '..k.k....k.k....'] }) });
  AN.addKind('burro', { word: 'burro', cry: '¡Iii-aaa!', move: 'walk', speed: 0.25, shadow: 14,
    sfx: () => { tone('sawtooth', 900, 500, 0.35, 0.06, 0, { filter: 'lowpass', ff: 1800 }); tone('sawtooth', 300, 260, 0.45, 0.08, 0.38, { filter: 'lowpass', ff: 900 }); },
    spr: pad({ pal: { g: '#9a98a8', d: '#6a6878', w: '#e8e4e0', k: '#404050', e: '#101010' },
      stand: ['..............g.g', '..............g.g', '.............kggg', '.............ggeg', '............kgggw', '.ggggggggggkggww.', 'd.gggggggggggg...', 'd.ggwwwwwwgggg...', '..gg.g....g.gg...', '..g..g....g..g...', '..k..k....k..k...'],
      walk: ['..............g.g', '..............g.g', '.............kggg', '.............ggeg', '............kgggw', '.ggggggggggkggww.', 'd.gggggggggggg...', 'd.ggwwwwwwgggg...', '..gg.g....g.gg...', '.g...g...g....g..', '.k....k.k.....k..'],
      react: ['...............g.g', '..............g.g.', '.............kggg.', '.............ggegw', '............kggwww', '.ggggggggggkgg.ww.', 'd.gggggggggggg....', 'd.ggwwwwwwgggg....', '..gg.g....g.gg....', '..g..g....g..g....', '..k..k....k..k....'] }) });
  AN.addKind('pavo', { word: 'pavo', cry: '¡Gluglú!', move: 'fly', speed: 0.3, shadow: 10,
    sfx: () => { for (const at of [0, 0.08, 0.16, 0.24]) tone('square', 700, 520, 0.06, 0.04, at, { filter: 'lowpass', ff: 1400 }); },
    spr: pad({ pal: { b: '#5a3418', o: '#e08830', r: '#8a4a20', h: '#c8b0a0', w: '#e02828', e: '#101010', l: '#f8a020' },
      stand: ['rr.......', 'rorr.....', 'rboor..h.', 'rbbbor.he', '.bbbbb.hw', '.bbbbbbbw', '..bbbbb..', '...l.l...', '..ll.ll..'],
      walk: ['rr.......', 'rorr.....', 'rboor..h.', 'rbbbor.he', '.bbbbb.hw', '.bbbbbbbw', '..bbbbb..', '..l...l..', '.ll...ll.'],
      peck: ['.........', '.........', 'rr.......', 'rorr.....', 'rboor....', 'rbbbbbbh.', '.bbbbbbhe', '..bbbbb.w', '..l.l....'],
      fly: ['.r.....r.', 'rrr...rrr', 'rbbr.rbbr', '.rbbbbbh.', '..bbbbbhe', '..bbbbb.w', '...l.l...', '.........', '.........'],
      fly2: ['.........', '.........', '.........', 'rrrbbbbh.', 'rbbbbbbhe', '.rrbbbb.w', '..rr.l...', '.........', '.........'] }) });
  AN.addKind('raton', { word: 'raton', cry: '¡Ii, ii!', move: 'scuttle', speed: 0.6, shadow: 6, on: 'iq',
    sfx: () => { tone('sine', 3200, 3600, 0.06, 0.04); tone('sine', 3400, 3800, 0.06, 0.04, 0.09); },
    spr: pad({ pal: { g: '#a8a8b8', d: '#787888', p: '#f8a8b8', e: '#101010', n: '#f87890' },
      stand: ['.......pp..', '......pddg.', 'p...ggggegn', '.pggggggggg', '..g..g.g...'],
      walk: ['.......pp..', '......pddg.', 'p...ggggegn', '.pggggggggg', '.g...g...g.'],
      snap: ['......pp...', '.....pddg..', '....ggggegn', 'p.ggggggg..', '.pg.g.g.g..'] }) });
  AN.addKind('gallo', { word: 'gallo', cry: '¡Kikirikí!', move: 'walk', speed: 0.3, shadow: 9,
    sfx: () => { tone('sawtooth', 700, 1100, 0.18, 0.06, 0, { filter: 'bandpass', ff: 1400, q: 2 }); tone('sawtooth', 1100, 1300, 0.2, 0.06, 0.2, { filter: 'bandpass', ff: 1500, q: 2 }); tone('sawtooth', 1300, 800, 0.4, 0.06, 0.42, { filter: 'bandpass', ff: 1300, q: 2 }); },
    spr: pad({ pal: { b: '#c86a28', y: '#f0b040', r: '#e02828', g: '#287048', k: '#202028', e: '#101010', l: '#f8a020' },
      stand: ['.........rr.', 'g.......rrr.', 'gg......yye.', 'ggk.....yyyl', '.ggkbbbbyyr.', '.gkbbbbbbbr.', '..kbbbbbbb..', '...bbbbbb...', '....l..l....', '...ll.ll....'],
      walk: ['.........rr.', 'g.......rrr.', 'gg......yye.', 'ggk.....yyyl', '.ggkbbbbyyr.', '.gkbbbbbbbr.', '..kbbbbbbb..', '...bbbbbb...', '...l....l...', '..ll....ll..'],
      react: ['..........rr', 'g........rrr', 'gg.......yye', 'ggk......yyl', '.ggkbbbbyyyl', '.gkbbbbbbbr.', '..kbbbbbbb..', '...bbbbbb...', '....l..l....', '...ll.ll....'] }) });
  AN.addKind('tlacuache', { word: 'tlacuache', cry: '¡Jjj!', move: 'walk', speed: 0.3, shadow: 10,
    sfx: () => { noise(2200, 0.25, 0.05, 0, { filter: 'bandpass', ff: 2400, q: 3 }); },
    spr: pad({ pal: { g: '#8a8a98', d: '#5a5a68', w: '#f0f0f0', k: '#303038', p: '#f0a0b0', n: '#f87890', e: '#101010' },
      stand: ['..........k.', '.........kwk', 'p...gggggwew', 'p.gggggggwwwn', '.pggdggggww..', '..g.g...g.g..', '..p.p...p.p..'],
      walk: ['..........k.', '.........kwk', 'p...gggggwew', 'p.gggggggwwwn', '.pggdggggww..', '.g...g.g...g.', '.p...p.p...p.'],
      react: ['.............', '.............', '.............', '..p.p...p.p..', 'p.gggggggwwk.', 'ppggdgggwwwen', '..gggggggww..'] }) }); // (tapped: it plays dead, feet up)
  const KINDS = ['vaca', 'cerdo', 'oveja', 'burro', 'pavo', 'raton', 'gallo', 'tlacuache'];
  const EN = { vaca: 'A cow!', cerdo: 'A pig!', oveja: 'A sheep!', burro: 'A donkey!', pavo: 'A turkey!', raton: 'A mouse!', gallo: 'A rooster!', tlacuache: 'A possum! (it\'s playing dead)' };
  AB.KINDS = KINDS;

  // =====================================================================
  //  Saved state: G.state.abuelos
  // =====================================================================
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.abuelos)) s.abuelos = {};
    const a = s.abuelos; for (const k of ['wear', 'show', 'cookies', 'garden', 'simon', 'photos', 'swing']) if (!isObj(a[k])) a[k] = {};
    return a;
  }
  AB.state = () => (G.state ? st() : null);
  const daily = k => { const o = st()[k]; if (o.d !== day()) { for (const x in o) delete o[x]; o.d = day(); } return o; };
  const held = () => (G.carry ? G.carry.held() : null);
  const bag = () => G.errands.bag;
  const othersFor = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== id).slice(0, 2);
  const quiz = (who, prompt, en, answer, others, o) => ask(who, prompt, en, answer, others.filter(k => k !== answer && met(k)).slice(0, 2), o || {});

  // =====================================================================
  //  CLOTHES: what you wear shows on your character (a cosmetic over the creator's look, on every map)
  // =====================================================================
  AB.CLOTHES = ['camisa', 'pantalon', 'vestido', 'calcetines', 'zapatos', 'sombrero', 'chamarra'];
  AB.COLS = ['#e04040', '#3870d8', '#38a858', '#f8c830', '#e060a0', '#8a50c8', '#f08828', '#f8f8f0', '#40a0e0'];
  AB.FIRST = { camisa: '#e04040', pantalon: '#3870d8', vestido: '#e060a0', calcetines: '#f8c830', zapatos: '#c03030', sombrero: '#e8c870', chamarra: '#38a858' }; // (the line's, the trunk's, Abuelo's)
  AB.wear = () => (G.state ? st().wear : {});
  AB.pic = id => ({ icon: id, col: AB.wear()[id] || AB.FIRST[id] });
  // a look dressed: the dress makes a long robe, a jacket goes over the shirt (its collar shows), socks show when no shoes
  function dress(spec, w) {
    const s = Object.assign({}, spec);
    if (w.vestido) { s.robe = true; s.outfit = w.vestido; }
    else if (w.camisa) s.outfit = w.camisa;
    if (w.chamarra) { s.trim = s.outfit; s.outfit = w.chamarra; }
    if (w.pantalon && !w.vestido) s.pants = w.pantalon;
    if (w.zapatos) s.boots = w.zapatos; else if (w.calcetines) s.boots = w.calcetines;
    if (w.sombrero) { s.head = 'hat'; s.headColor = w.sombrero; }
    return s;
  }
  const ps0 = G.st.playerSpec; let memo = { k: null, v: null };
  G.st.playerSpec = function () {
    const base = ps0.apply(this, arguments), w = G.state && isObj(G.state.abuelos) && isObj(G.state.abuelos.wear) ? G.state.abuelos.wear : null;
    if (!w || !Object.keys(w).some(k => w[k])) return base;
    const k = JSON.stringify([G.state.look, w]); if (memo.k === k) return memo.v;
    memo = { k, v: { map: dress(base.map, w), portrait: dress(base.portrait, w) } };
    return memo.v;
  };
  // put something on (col: its colour; none: the next colour) -> the sprite changes at once, with a sparkle
  AB.putOn = function (f, id, col) {
    const w = st().wear;
    if (!col) { const i = AB.COLS.indexOf(w[id]); col = w[id] ? AB.COLS[(i + 1) % AB.COLS.length] : AB.FIRST[id]; }
    w[id] = col;
    if (id === 'vestido' && w.pantalon) delete w.pantalon; // (a dress or trousers: one or the other)
    if (id === 'pantalon' && w.vestido) delete w.vestido;
    st().wardrobe = Object.assign(st().wardrobe || {}, { [id]: true });
    AB.refresh(f); G.st.autosave();
    if (f && f.player) { G.audio.sfx('chime'); for (let i = 0; i < 6; i++) puff('spark', f.player.x * TL + 12 + (Math.random() - 0.5) * 20, f.player.y * TL - 4 + (Math.random() - 0.5) * 18, { life: 24, vy: -0.5 }); }
    return col;
  };
  AB.takeOff = function (f, id) { delete st().wear[id]; AB.refresh(f); G.st.autosave(); };
  AB.refresh = function (f) { f = f || G.field; if (f && f.player) f.player.spec = G.st.playerSpec().map; };
  AB.has = id => !!(G.state && (st().wardrobe || {})[id]); // (once worn: it's in the trunk)

  // the mirror: you, big, in a gold-framed oval, wearing it all (closes by itself or with a tap)
  class Mirror {
    constructor(w) { this.w = w; this.t = 0; this.transparent = true; }
    onEnter() { G.audio.sfx('ok'); }
    closeXY() { return [G.W - 28, 6]; }
    update() { this.t++; if (this.t === 24) { G.audio.jingle('item'); G.fx.confetti(G.W / 2 - 50, 120, -1, 10); G.fx.confetti(G.W / 2 + 50, 120, 1, 10); } if (this.t > 170 || (this.t > 30 && (G.input.tap() || G.input.p('A') || G.input.p('B')))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      ctx.fillStyle = 'rgba(16,16,42,0.55)'; ctx.fillRect(0, 0, G.W, G.H);
      const k = Math.min(1, this.t / 16), cx = G.W / 2, cy = 110, rx = 62 * k, ry = 86 * k;
      ctx.fillStyle = '#5a3a10'; ctx.beginPath(); ctx.ellipse(cx, cy, rx + 9, ry + 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8b030'; ctx.beginPath(); ctx.ellipse(cx, cy, rx + 7, ry + 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8e8f8'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      if (k < 1) return;
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#a8d8f0'; ctx.fillRect(0, cy + 40, G.W, 80);
      const img = G.unitSprite(G.st.playerSpec().map, ['down', 'right', 'down', 'left'][(this.t >> 5) & 3], (this.t >> 4) & 1);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(img, cx - 60, cy - 66, 120, 120);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - 40, cy - 60, 6, 40); ctx.fillRect(cx - 32, cy - 70, 4, 14);
      ctx.restore();
      for (let i = 0; i < 5; i++) { const a = this.t / 20 + i * 1.26; ctx.fillStyle = i & 1 ? '#fff8c0' : '#ffffff'; ctx.fillRect(Math.round(cx + Math.cos(a) * (rx + 20)), Math.round(cy + Math.sin(a) * (ry + 12)), 3, 3); }
      G.closeBtn(ctx, ...this.closeXY());
    }
  }
  AB.mirror = () => { const w = new G.Wait(); G.push(new Mirror(w)); return w; };

  // =====================================================================
  //  The BODY: someone touches (or washes) a part of their body; claps; shivers; tugs (G.abuelos.act)
  // =====================================================================
  AB.BODY = ['mano', 'pie', 'nariz', 'ojos', 'boca', 'cabeza'];
  const OLC = '#1a1420';
  const skinOf = e => (e === (G.field && G.field.player) ? (G.st.playerSpec().map || {}).skin : (e.spec || {}).skin) || '#f0c8a0';
  function arm(ctx, x0, y0, x1, y1, col) {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (const [c, s, d] of [[OLC, 4, -1], [col, 2, 0]]) { ctx.fillStyle = c; for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n) + d, Math.round(y0 + (y1 - y0) * i / n) + d, s, s); }
  }
  // where the hands go (shoulder -> hand, px from the feet, facing you); t: frames into it
  const TOUCH = {
    cabeza: () => [[-4, -12, -4, -22], [3, -12, 3, -22]],
    ojos: () => [[-4, -12, -3, -15], [3, -12, 2, -15]],
    nariz: t => [[3, -12, 0 + ((t >> 3) & 1), -13]],
    boca: () => [[3, -12, 0, -11]],
    mano: t => ((t >> 3) & 1 ? [[-4, -12, -1, -9], [3, -12, 0, -9]] : [[-4, -12, -7, -10], [3, -12, 6, -10]]),
    pie: () => [[-4, -12, -4, -2], [3, -12, 3, -2]],
    aplaude: t => ((t >> 3) & 1 ? [[-4, -12, -1, -14], [3, -12, 0, -14]] : [[-4, -12, -7, -15], [3, -12, 6, -15]]),
    jala: () => [[-4, -12, 2, -9], [3, -12, 8, -9]],
    saluda: t => [[3, -12, 8, (t >> 3) & 1 ? -21 : -18]],
  };
  const SPOT = { cabeza: [0, -21], ojos: [0, -15], nariz: [0, -13], boca: [0, -11], mano: [0, -9], pie: [0, -1] };
  const LEN = { aplaude: 70, jala: 40, saluda: 60, tiembla: 60 };
  AB.start = function (f, e, k, o = {}) { const a = { k, f0: G.frame, len: o.len || LEN[k] || (o.wash ? 70 : 56), wash: !!o.wash, ev: {} }; e.ab = a; hook(e); return a; };
  AB.act = function* (f, e, k, o) { if (!e) return; const a = AB.start(f, e, k, o); while (e.ab === a && G.frame - a.f0 < a.len) yield 1; if (e.ab === a) e.ab = null; };
  const busyNow = e => !!(e.ab && G.frame - e.ab.f0 < e.ab.len);
  function pose(e, a, t) {
    const o = { dx: 0, dy: 0, z: 0, sx: 1, sy: 1, rot: 0, dir: 'down', fr: 0, arms: null };
    const wx = e.x * TL + 12 + (e.ox || 0), wy = e.y * TL + 21 + (e.oy || 0);
    if (a.k === 'pie') { const q = t < 10 ? t / 10 : t > a.len - 10 ? (a.len - t) / 10 : 1; o.sy = 1 - 0.18 * q; o.sx = 1 + 0.08 * q; }
    if (a.k === 'tiembla') { o.dx = ((t >> 1) & 1) ? 1 : -1; o.arms = [[-4, -12, 2, -11], [3, -12, -3, -11]]; if (t % 12 === 0) puff('dust', wx + 6, wy - 16, { life: 20, vy: -0.4, vx: 0.3 }); return o; }
    if (a.k === 'jala') { o.rot = -0.18; o.dx = -2; }
    if (a.k === 'aplaude' && t % 16 === 8) G.audio.sfx('select');
    o.arms = TOUCH[a.k] ? TOUCH[a.k](t) : null;
    if (a.wash && SPOT[a.k] && t % 6 === 0) { const [sx, sy] = SPOT[a.k]; puff('drop', wx + sx + (Math.random() - 0.5) * 8, wy + sy * o.sy, { vy: -0.8 - Math.random(), vx: (Math.random() - 0.5) * 1.4, g: 0.12, life: 26 }); if (t % 18 === 0) G.audio.sfx('swing'); }
    if (a.wash && o.arms) o.arms = o.arms.map(([a0, b0, a1, b1]) => [a0, b0, a1 + ((t >> 2) & 1 ? 1 : -1), b1]);
    if (!a.ev.s && SPOT[a.k] && t > 8) { a.ev.s = 1; if (!a.wash) { G.audio.sfx('cursor'); puff('spark', wx + SPOT[a.k][0], wy + SPOT[a.k][1] * o.sy - 2, { life: 20 }); } }
    return o;
  }
  // the swing in the orchard: you ride it (e.swing = {f0, amp})
  const SWING = P('abuelos', 'swing');
  const swingAng = r => (r ? (r.amp || 0.3) * Math.sin((G.frame - r.f0) / 18) : 0.05 * Math.sin(G.frame / 50));
  const swingSeat = r => { const th = swingAng(r), px = SWING[0] * TL + 12, top = (SWING[1] - 2) * TL + 10, L = 34; return { x: px + Math.sin(th) * L, y: top + Math.cos(th) * L, th, px, top }; };
  // the people of this zone (you, Abuelo, Abuela, the baby) are drawn here while they do something (the baby: always, small)
  function drawAB(ctx, cx, cy) {
    const e = this, f = G.field; if (!f || !inZone(f)) return false;
    let o = null;
    if (busyNow(e)) o = Object.assign(pose(e, e.ab, G.frame - e.ab.f0), {});
    else if (e === f.player && e.swing) { const s = swingSeat(e.swing); o = { wx: s.x, wy: s.y + 10, z: 0, sx: 1, sy: 0.9, dir: 'down', fr: 0, arms: [[-4, -12, -6, -20], [3, -12, 5, -20]], noShadow: true }; }
    const small = e.small;
    if (!o && !small && !(e === f.player && AB.mud())) return false;
    o = o || { dx: 0, dy: 0, z: 0, sx: 1, sy: 1, rot: 0, dir: e.dir, fr: (e.moving || e.ox || e.oy) ? Math.floor(f.t / 6) % 2 : Math.floor((f.t + (e.x || 0) * 13) / 24) % 2 };
    const wx = o.wx != null ? o.wx : e.x * TL + 12 + (e.ox || 0) + (o.dx || 0), wy = o.wy != null ? o.wy : e.y * TL + 21 + (e.oy || 0) + (o.dy || 0);
    const x = Math.round(wx - cx), y = Math.round(wy - cy), k = small ? 0.68 : 1;
    if (!o.noShadow) { ctx.fillStyle = 'rgba(16,28,8,0.3)'; const sw = Math.round(14 * k); ctx.fillRect(Math.round(x - sw / 2), y, sw, 2); }
    const img = G.unitSprite(e.spec, o.dir || e.dir || 'down', o.fr || 0);
    ctx.save(); ctx.translate(x, y - Math.round(o.z || 0) - (small && e.moving ? ((f.t >> 2) & 1) : 0)); if (o.rot) ctx.rotate(o.rot); ctx.scale((o.sx || 1) * k, (o.sy || 1) * k);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -12, -24);
    if (o.arms) { const flip = o.dir === 'left' ? -1 : 1, sk = skinOf(e); for (const [a0, b0, a1, b1] of o.arms) arm(ctx, a0 * flip, b0, a1 * flip, b1, sk); }
    if (e === f.player) drawMud(ctx);
    ctx.restore();
    return true;
  }
  function hook(e) { if (e && !e.drawSelf) e.drawSelf = drawAB; }
  AB.hook = hook;
  // mud on you (chapter 2): brown splotches on your hands, feet and nose until they're washed
  AB.mud = () => { const c = CH.ctx('abuelos2'); return c && c.data && c.data.mud && CH.active('abuelos2') ? c.data.mud : null; };
  function drawMud(ctx) {
    const m = AB.mud(); if (!m) return;
    ctx.fillStyle = '#6a4220';
    if (m.mano) { ctx.fillRect(-9, -11, 3, 3); ctx.fillRect(6, -11, 3, 3); }
    if (m.pie) { ctx.fillRect(-5, -4, 4, 3); ctx.fillRect(1, -4, 4, 3); }
    if (m.nariz) { ctx.fillRect(-1, -14, 3, 2); ctx.fillRect(2, -18, 2, 2); }
  }
  // everyone here does it: you, Abuelo and the baby near you (the dog: his trick) -> the word is said
  AB.all = function* (f, k, o = {}) {
    const p = f.player, near = n => Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 8;
    const who = [p].concat((o.me ? [] : ['abuelo', 'abuela', 'bebe'].map(id => npcAt(f, id))).filter(n => n && near(n) && !n.busy && !n.moving));
    const acts = who.map(e => [e, AB.start(f, e, k, o)]);
    const dog = G.pet && G.pet.mine() ? G.pet.npc(f) : null;
    if (dog && !dog.hidden && near(dog) && !dog.moving) G.pet.anim(dog, { cabeza: 'spin', ojos: 'huh', nariz: 'sniff', boca: 'eat', mano: 'paw', pie: 'jump' }[k] || 'dance');
    if (met(k) && !o.quiet) { G.fx.say('¡' + G.baseForm(k)[0].toUpperCase() + G.baseForm(k).slice(1) + '!', p.x * TL + 12 - Math.round(f.cam.x), p.y * TL - 22 - Math.round(f.cam.y), '#f8e060', true); G.speak(G.baseForm(k)); }
    while (acts.some(([e, a]) => e.ab === a && G.frame - a.f0 < a.len)) yield 1;
    for (const [e, a] of acts) if (e.ab === a) e.ab = null;
  };
  AB.bodyFor = (id, n = 2) => AB.BODY.filter(k => k !== id && met(k)).sort(() => G.rand() - 0.5).slice(0, n);

  // =====================================================================
  //  Tapping an animal whose word isn't met yet: Lola calls out its name (a one-unknown puzzle)
  // =====================================================================
  const tapped0 = AN.tapped;
  AN.tapped = function (f, a) {
    const r = tapped0.call(this, f, a);
    if (f && Z.of(f.mapId) === 'abuelos' && KINDS.includes(a.kind) && !met(a.kind) && !f.locked && G.top() === f && !CH.running()) {
      CH.scene(f, (function* () {
        yield 30;
        if (met(a.kind)) return;
        CH.point(a.x, a.y - 14);
        try { yield* G.intro.show(a.kind, { who: 'lola', prompt: '¡Mira! ¡[' + a.kind + ']!', en: 'Look! ' + EN[a.kind], known: othersFor(a.kind, KINDS) }); } finally { CH.point(null); }
      })());
    }
    return r;
  };

  // =====================================================================
  //  The people: Abuela, Abuelo, the baby; Lola and Nico as everywhere
  // =====================================================================
  const sideAlert = {};
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
  function* abuelaLine(f) {
    if (met('abuela')) yield* sayShow('abuela', 'abuela', T('¡Mi niñ{o/a}! Te quiero mucho.', 'My darling! I love you very much. (a big hug)'));
    else yield* say('abuela', T('¡Hola, {name}!', 'Hello, {name}! I\'m your grandma.'));
    const n = npcAt(f, 'abuela'); if (n) for (let k = 0; k < 3; k++) puff('heart', n.x * TL + 8 + k * 5, n.y * TL - 2, { life: 50, vy: -0.4 });
  }
  function* abueloLine(f) {
    if (met('abuelo')) yield* sayShow('abuelo', 'abuelo', T('¡Ven, {name}! ¡Mira mis animales!', 'Come, {name}! Look at my animals!'));
    else yield* say('abuelo', T('¡Hola, {name}!', 'Hello, {name}! I\'m your grandpa.'));
  }
  function* bebeLine(f) { // the baby: a giggle; she claps; "¡Ba-ba!"
    const n = npcAt(f, 'bebe'); if (n) { AB.start(f, n, 'aplaude'); for (let k = 0; k < 2; k++) puff('heart', n.x * TL + 10 + k * 5, n.y * TL + 4, { life: 40, vy: -0.4 }); }
    G.audio.sfx('select');
    yield* sayShow('bebe', met('bebe') ? 'bebe' : null, T('¡Ba-ba! ¡Ji, ji!', '(the baby giggles and claps)'));
  }

  // ---------- Abuela's cookies (after chapter 1): eggs from the henhouse, wash your hands, bake, count ----------
  const EGGS = [[4, 10], [6, 9], [8, 10]];
  const cookies = () => daily('cookies');
  const cookiesOpen = () => CH.done('abuelos1');
  sideAlert.abuela = () => {
    const c = cookies();
    if (cookiesOpen() && c.on && (c.n | 0) >= 3) return { icon: 'huevo', count: 3 };
    if (cookiesOpen() && !c.on && !c.baked) return { icon: 'galletas' };
    if (CH.done('abuelos3') && !daily('photos').done) return { icon: 'foto' };
    return null;
  };
  function* abuelaSide(f) {
    const c = cookies();
    if (cookiesOpen() && c.on && (c.n | 0) < 3) { yield* sayShow('abuela', { icon: 'huevo', count: 3 }, T('¡Tres [huevo:huevos], por favor!', 'Three eggs, please! The hens lay them in their run.')); return true; }
    if (cookiesOpen() && c.on) { yield* bake(f); return true; }
    if (cookiesOpen() && !c.baked) {
      yield* sayShow('abuela', { icon: 'galletas' }, T('¡Galletas! ¿Me ayudas?', 'Cookies! Will you help me bake?'));
      c.on = true; c.n = 0; G.st.autosave();
      yield* sayShow('abuela', { icon: 'huevo', count: 3 }, T('¡Tres [huevo:huevos]!', 'Three eggs from the hens, please! (they are in the hens\' run, by the henhouse)'));
      return true;
    }
    if (CH.done('abuelos3') && !daily('photos').done) { yield* photoWall(f); return true; }
    return false;
  }
  function* pickEgg(f, i) {
    const c = cookies(); if (!c.on || (c.got || (c.got = {}))[i] || (c.n | 0) >= 3) return;
    const [x, y] = EGGS[i]; c.got[i] = true; c.n = (c.n | 0) + 1; G.st.autosave();
    G.audio.sfx('pop'); CK.sparkle(f, x, y, 3); AN.cry('gallina');
    yield 12;
    G.world.name('huevo', x * TL + 12, y * TL - 6, { grow: 'carry' });
    if (c.n >= 3) yield* sayShow('abuela', { icon: 'huevo', count: 3 }, T(met('tres') ? '¡[tres:Tres]! ¡A la cocina!' : '¡Ya! ¡A la cocina!', 'Three eggs! Take them to Abuela in the kitchen.'));
  }
  function* bake(f) {
    const c = cookies(), p = f.player;
    yield* sayShow('abuela', { icon: 'huevo', count: 3 }, T('¡[huevo:Huevos]! ¡[gracias:Gracias]!', 'Eggs! Thank you!'));
    if (met('tres')) yield* quiz('abuela', '¿Cuántos?', 'How many eggs did you bring?', 'tres', ['dos', 'cuatro', 'uno'], { show: { icon: 'huevo', count: 3 } });
    if (met('mano')) { // first, clean hands
      yield* sayShow('abuela', 'mano', T('¡Primero, las [mano:manos]!', 'First, wash your hands!'));
      yield* quiz('abuela', '¿Qué lavo?', 'What do I wash before baking? (say it!)', 'mano', AB.bodyFor('mano'));
      yield* AB.act(f, p, 'mano', { wash: true });
    }
    const n = npcAt(f, 'abuela');
    for (let k = 0; k < 3; k++) { G.audio.sfx('select'); for (let i = 0; i < 3; i++) puff('dust', 10 * TL + 12 + (Math.random() - 0.5) * 20, TL + 4, { vy: -0.6, life: 40 }); if (n) AB.start(f, n, 'aplaude', { len: 24 }); yield 22; }
    c.baked = true; c.on = false; st().cookiesN = (st().cookiesN | 0) + 1; G.audio.jingle('promote'); CK.confetti(); G.st.autosave();
    yield* sayShow('abuela', { icon: 'galletas' }, T('¡Galletas! ¡Para ti!', 'Cookies! One for you (and one for {dog}).'));
    if (met('seis')) yield* quiz('abuela', '¿Cuántas?', 'How many cookies are on the plate?', 'seis', ['cinco', 'siete', 'cuatro'], { show: { icon: 'galleta', count: 6 } });
    if (!held()) bag().add('galleta'); G.st.autosave();
  }
  // ---------- the photo wall (after chapter 3): who's who ----------
  function* photoWall(f) {
    const [px, py] = P('abuelos_casa', 'photos');
    if (indoors(f)) CH.point(px * TL + 36, py * TL + 6);
    try {
      yield* sayShow('abuela', { icon: 'foto' }, T('¡Mira las fotos!', 'Look at the photos! Who is who?'));
      for (const id of ['abuelo', 'abuela', 'bebe', 'familia'].filter(met).slice(0, 3)) yield* quiz('abuela', '¿Quién es?', 'Who is this, in the photo?', id, ['abuelo', 'abuela', 'bebe', 'familia', 'perro'], { show: id === 'familia' ? { icon: 'foto' } : id });
    } finally { CH.point(null); }
    daily('photos').done = true; st().photosN = (st().photosN | 0) + 1; G.st.autosave();
    yield* sayShow('abuela', 'familia', T(met('familia') ? '¡Mi [familia]!' : '¡Muy bien!', 'My family! I love you all.'));
  }

  // ---------- Abuelo: his garden (after chapter 2), Simón dice (after chapter 2), his jacket at night ----------
  const BEDS = [[4, 14], [8, 14], [5, 16], [9, 16], [3, 18], [7, 18], [10, 18]];
  const garden = () => daily('garden');
  const basket = () => bag().list().find(it => it.id === 'canastaverduras' && it.q === 'huerto') || null;
  const gardenOpen = () => CH.done('abuelos2');
  const simonOpen = () => CH.done('abuelos2');
  const jacketAsk = () => night() && !AB.has('chamarra');
  sideAlert.abuelo = () => {
    if (jacketAsk()) return { icon: 'chamarra', col: AB.FIRST.chamarra };
    const g = garden(), b = basket();
    if (b) return (g.n | 0) >= 4 ? { icon: 'canastaverduras' } : null;
    if (gardenOpen() && !g.done) return { icon: 'canastaverduras' };
    if (simonOpen() && !daily('simon').done) return { icon: 'cabeza' };
    return null;
  };
  function* abueloSide(f) {
    if (jacketAsk()) { yield* jacket(f); return true; }
    const g = garden(), b = basket();
    if (b && (g.n | 0) >= 4) { yield* gardenDone(f); return true; }
    if (b) { yield* sayShow('abuelo', { icon: 'zanahoria' }, T('¡Más! ¡Cuatro!', 'More vegetables! Tap four of the garden beds.')); return true; }
    if (gardenOpen() && !g.done) {
      yield* sayShow('abuelo', { icon: 'canastaverduras' }, T('¡Mi huerto! ¿Me ayudas?', 'My vegetable garden! Will you help me pick?'));
      bag().add('canastaverduras', { q: 'huerto' }); g.n = 0; g.got = {}; G.st.autosave();
      const at = BEDS[0]; CH.point(at[0] * TL + 12, at[1] * TL);
      try { yield* sayShow('abuelo', { icon: 'zanahoria', count: 4 }, T(met('cuatro') ? '¡[cuatro:Cuatro], {name}!' : '¡Ándale, {name}!', 'Four, please! Tap the garden beds.')); } finally { CH.point(null); }
      return true;
    }
    if (simonOpen() && !daily('simon').done) { yield* simonGame(f); return true; }
    return false;
  }
  const VEG = ['zanahoria', { icon: 'zanahoria' }];
  function* pickVeg(f, i) {
    const g = garden(); if (!basket() || (g.got || (g.got = {}))[i] || (g.n | 0) >= 4) return;
    const [x, y] = BEDS[i]; g.got[i] = G.frame; g.n = (g.n | 0) + 1; G.st.autosave();
    G.audio.sfx('pop'); for (let k = 0; k < 6; k++) puff('crumb', x * TL + 12 + (Math.random() - 0.5) * 14, y * TL + 8, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.15, life: 26 });
    CK.sparkle(f, x, y, 3);
    yield 16;
    const nums = ['uno', 'dos', 'tres', 'cuatro'];
    if (met(nums[g.n - 1])) { G.fx.say(G.baseForm(nums[g.n - 1]), x * TL + 12 - Math.round(f.cam.x), y * TL - 10 - Math.round(f.cam.y), '#ffffff', true); G.speak(G.baseForm(nums[g.n - 1])); }
    if (g.n >= 4) { const n = npcAt(f, 'abuelo'); if (n) CH.pointNpc(n); try { yield* sayShow('abuelo', { icon: 'canastaverduras' }, T('¡Ya! ¡Tráela!', 'That\'s four! Bring the basket to Abuelo.')); } finally { CH.point(null); } }
    void VEG;
  }
  function* gardenDone(f) {
    const g = garden();
    bag().take('canastaverduras', { q: 'huerto' }); G.audio.jingle('item');
    yield* sayShow('abuelo', { icon: 'canastaverduras' }, T('¡Qué bien! ¡[gracias:Gracias]!', 'How lovely! Thank you!'));
    if (met('cuatro')) yield* quiz('abuelo', '¿Cuántas?', 'How many vegetables did you pick?', 'cuatro', ['tres', 'cinco'], { show: { icon: 'zanahoria', count: 4 } });
    g.done = true; st().gardens = (st().gardens | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
    yield* sayShow('abuelo', { icon: 'zanahoria' }, T('¡Una para ti!', 'A carrot for you! (the donkey loves carrots... and so does {dog})'));
    if (!held()) bag().add('zanahoria');
  }
  // Simón dice: Abuelo touches his nose, his head... you do it too; then you are Simón
  function* simonGame(f) {
    const ab = npcAt(f, 'abuelo'), p = f.player;
    yield* sayShow('abuelo', { icon: 'cabeza' }, T('¡Simón dice!', 'Simon says! Watch me, then you do it.'));
    // the body words not met yet: one at a time, Abuelo shows it, then you (one unknown each)
    for (const id of ['ojos', 'boca', 'cabeza'].filter(k => !met(k))) {
      let k = 0;
      yield* G.intro.watch(id, { who: 'abuelo', prompt: '¡Toca tus [' + id + ']!'.replace('tus [cabeza]', 'tu [cabeza]').replace('tus [boca]', 'tu [boca]'), en: { ojos: 'Touch your eyes!', boca: 'Touch your mouth!', cabeza: 'Touch your head!' }[id], known: othersFor(id, AB.BODY),
        act: function* () { k++; if (k === 1) { if (ab) yield* AB.act(f, ab, id); else yield 20; } else yield* AB.all(f, id); } });
      if (k < 2) yield* AB.all(f, id);
    }
    // listen: "¡Simón dice: toca tu nariz!" -> pick its picture -> you do it
    const vs = AB.BODY.filter(met).sort(() => G.rand() - 0.5).slice(0, 3);
    for (const w of vs) {
      yield* ask('abuelo', '¡Simón dice: toca tu [' + w + ']!', 'Simon says: touch your...! Which one? (listen)', w, AB.bodyFor(w), { pic: true });
      yield* AB.all(f, w);
    }
    // and now you are Simón: say a part, Abuelo (and the dog) do it
    yield* sayShow('abuelo', null, T('¡Ahora tú eres Simón!', 'Now YOU are Simón! Tell me what to touch.'));
    for (let r = 0; r < 2; r++) { const v = yield* chooseBody(f, { prompt: '¡Simón dice: toca tu...!', en: 'Simon says: touch your...! (say a body part, or tap one)', who: 'abuelo' }); if (!v) break; }
    daily('simon').done = true; st().simons = (st().simons | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
    yield* sayShow('abuelo', null, T('¡Qué divertido, {name}!', 'What fun, {name}! Again tomorrow?'));
    void p;
  }
  // a free choice of met body words (the mic is on: say one!); everyone does it -> its id
  function* chooseBody(f, o = {}) {
    const vs = AB.BODY.filter(met).sort(() => G.rand() - 0.5).slice(0, 4); if (!vs.length) return null;
    const r = yield G.choose({ prompt: o.prompt || '¿Qué toco?', en: o.en || 'What shall I touch? (say a body part, or tap one)', choices: vs.map(w => ({ word: w })), layout: 'cards', mic: true, cancel: !!o.cancel, who: o.who || null });
    const k = r.result; if (k == null || k < 0 || k >= vs.length) return null;
    if (G.cards) G.cards.grow(vs[k], 'tap');
    yield* AB.all(f, vs[k], { me: !!o.me });
    return vs[k];
  }
  AB.chooseBody = chooseBody;
  // at night: "¡Hace frío!" Abuelo gives you his old green jacket (la chamarra)
  function* jacket(f) {
    const p = f.player;
    yield* AB.act(f, p, 'tiembla');
    yield* sayShow('abuelo', { icon: 'chamarra', col: AB.FIRST.chamarra }, T('¡Brrr! ¡Hace frío!', 'Brrr! It\'s cold tonight!'));
    yield* meetW('chamarra', { who: 'abuelo', prompt: '¡Mi [chamarra]! ¡Para ti!', en: 'My jacket! For you!', show: { icon: 'chamarra', col: AB.FIRST.chamarra }, known: othersFor('chamarra', AB.CLOTHES) });
    AB.putOn(f, 'chamarra', AB.FIRST.chamarra);
    yield 30;
    yield* sayShow('abuelo', 'abuelo', T('¡Calientit{o/a}!', 'Nice and warm! (it\'s yours now: it\'s in the trunk too)'));
  }

  // ---------- Lola: the dog's spot; a cow over the fence (la vaca); the cottage ----------
  function* lolaHere(f) {
    const sp = (f.def.dogSpots || []).find(s => Z.dogReady(s));
    if (sp && G.pet && G.pet.mine()) { CH.point(sp.at[0] * TL + 12, sp.at[1] * TL); try { yield* sayShow('lola', { icon: 'huella' }, T('¡Mira, {dog}!', 'Look! {dog} can play over there: tap the paw prints!')); } finally { CH.point(null); } }
    const cow = AN.find('vaca', f);
    if (cow && !met('vaca')) { CH.point(cow.x, cow.y - 20); try { yield* G.intro.show('vaca', { who: 'lola', prompt: '¡Mira! ¡Una [vaca]!', en: 'Look! A cow!', known: othersFor('vaca', ['caballo', 'cabra', 'gallina', 'perro', 'gato']) }); } finally { CH.point(null); } }
    const [dx, dy] = P('abuelos', 'door'); CH.point(dx * TL + 12, dy * TL - 8);
    try { yield* sayShow('lola', 'abuelos', T('¡Tus abuelos! ¡Entra!', 'Your grandparents\' house! Go in: the door is open!')); } finally { CH.point(null); }
  }

  // =====================================================================
  //  Tap yourself here: "¿Qué toco?" — say a body part and you touch it (from two met body words)
  // =====================================================================
  const tapSelf0 = G.carry.tapSelf;
  G.carry.tapSelf = function (f, tap) {
    if (tapSelf0.call(this, f, tap)) return true;
    if (!f || !inZone(f) || f.locked || !tap || !G.state || f.player.swing) return false;
    const p = f.player, wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y);
    if (!(wx >= p.x * TL + p.ox && wx < p.x * TL + p.ox + TL && wy >= p.y * TL + p.oy - 6 && wy < p.y * TL + p.oy + TL) || p.moving) return false;
    if (AB.BODY.filter(met).length < 2) return false;
    CH.scene(f, (function* () { st().metouch = (st().metouch | 0) + 1; yield* chooseBody(f, { prompt: '¿Qué toco?', en: 'What shall I touch? (say a body part, or tap one)', me: true, cancel: true }); })());
    return true;
  };

  // =====================================================================
  //  The trunk: dressing up (any time after chapter 1; the first time each day, a fashion show)
  // =====================================================================
  const TRUNK = P('abuelos_casa', 'trunk'), WARDROBE = P('abuelos_casa', 'wardrobe');
  AB.dressUp = function* (f, o = {}) {
    const can = AB.CLOTHES.filter(k => met(k));
    if (!can.length) { yield* sayShow('abuela', { icon: 'camisa' }, T('¡Ropa!', 'Clothes for dressing up! (Abuela will show you)')); return; }
    G.audio.sfx('door'); f.wig = { x: TRUNK[0], y: TRUNK[1], t: 18 };
    for (let r = 0; r < (o.rounds || 3); r++) {
      const ch = can.slice(0, 6).map(w => ({ word: w, img: { icon: w, col: st().wear[w] ? AB.COLS[(AB.COLS.indexOf(st().wear[w]) + 1) % AB.COLS.length] : AB.FIRST[w] } }));
      const c = yield G.choose({ prompt: '¿Qué te pones?', en: 'What will you put on? (say it, or tap it; again for another colour)', choices: ch, layout: 'cards', mic: true, cancel: true, who: o.who || null });
      if (c.result == null || c.result < 0 || c.result >= ch.length) break;
      const id = ch[c.result].word; if (G.cards) G.cards.grow(id, 'tap');
      AB.putOn(f, id, ch[c.result].img.col);
      G.speak(G.baseForm(id)); G.fx.say(G.baseForm(id), f.player.x * TL + 12 - Math.round(f.cam.x), f.player.y * TL - 24 - Math.round(f.cam.y), '#f8e060', true);
      yield 30;
    }
    yield AB.mirror();
    const s = daily('show');
    if (!s.done) { // the fashion show: the family claps
      s.done = true; st().shows = (st().shows | 0) + 1; G.st.autosave();
      for (const id of ['abuela', 'bebe']) { const n = npcAt(f, id); if (n) AB.start(f, n, 'aplaude'); }
      yield* AB.act(f, f.player, 'saluda');
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('abuela', 'abuela', T('¡Qué guap{o/a}, {name}!', 'How lovely you look, {name}! What a fashion show!'));
    }
  };

  // =====================================================================
  //  The map's side places (zones.js hooks): eggs, garden beds, the trunk, the mirror, the swing, the sock
  // =====================================================================
  const SOCK = P('abuelos', 'sock');
  const sockDog = () => (G.state && Z.state() ? (Z.state().dog || {}) : {});
  const SIDE = [
    ...EGGS.map((at, i) => ({ id: 'egg' + i, map: 'abuelos', at, on: () => cookiesOpen() && cookies().on && !(cookies().got || {})[i] && (cookies().n | 0) < 3, icon: () => null, run: f => pickEgg(f, i) })),
    ...BEDS.map((at, i) => ({ id: 'bed' + i, map: 'abuelos', at, on: () => !!basket() && !(garden().got || {})[i] && (garden().n | 0) < 4, icon: () => null, run: f => pickVeg(f, i) })),
    { id: 'trunk', map: 'abuelos_casa', at: TRUNK, on: () => CH.done('abuelos1') && !CH.running(), icon: () => (!daily('show').done ? { icon: 'vestido', col: AB.FIRST.vestido } : null), run: f => AB.dressUp(f) },
    { id: 'wardrobe', map: 'abuelos_casa', at: WARDROBE, on: () => CH.done('abuelos1'), icon: () => null, run: f => (function* () { yield AB.mirror(); })() },
    { id: 'swing', map: 'abuelos', at: SWING, on: () => true, icon: () => null, run: f => swingRide(f) },
  ];
  AB.SIDE = SIDE; AB.EGGS = EGGS; AB.BEDS = BEDS;
  const sideAt = (f, x, y) => (f && G.state ? SIDE.find(s => s.map === f.mapId && s.at[0] === x && s.at[1] === y && s.on()) || null : null);
  AB.sideAt = sideAt;
  function* swingRide(f) {
    const p = f.player; hook(p);
    p.swing = { f0: G.frame, amp: 0.3 };
    for (let k = 0; k < 4; k++) { G.audio.sfx('swing'); p.swing.amp = Math.min(0.9, p.swing.amp + 0.16); yield* wait(36); }
    if (met('columpio')) { G.world.name('columpio', SWING[0] * TL + 12, (SWING[1] - 1) * TL); }
    yield* wait(30); p.swing = null; st().swings = (st().swings | 0) + 1; G.st.autosave();
  }
  // the dog's sock (a dog's spot of its own act, 'tug'): he snatches a sock off the line and runs; a tug of war
  AB.tug = null; // {x, y (world px of the sock), dog}
  function* sockRun(f, sp) {
    const n = G.pet.npc(f), p = f.player; if (!n) return;
    G.pet.sound('bark'); puff('ex', n.x * TL + 12, n.y * TL - 4, { life: 30 });
    yield* CK.walk(f, n, SOCK[0], SOCK[1], 4); G.pet.anim(n, 'jump'); yield 20;
    AB.sockGone = G.frame; G.audio.sfx('pop');
    AB.tug = { dog: n };
    const away = [[SOCK[0] + 3, SOCK[1] + 2], [SOCK[0] - 2, SOCK[1] + 3], [SOCK[0] + 1, SOCK[1] + 1]];
    for (const [x, y] of away) { G.pet.sound('bark'); yield* CK.walk(f, n, x, y, 5); }
    yield* CK.walk(f, n, p.x + (p.x > 2 ? -1 : 1), p.y, 4); n.dir = n.x < p.x ? 'right' : 'left'; p.dir = n.x < p.x ? 'left' : 'right';
    for (let k = 0; k < 3; k++) {
      const c = yield G.choose({ prompt: '¡{dog}!', en: 'Pull! (tap the sock)', choices: [{ icon: 'calcetines', label: '¡Jala!' }], layout: 'cards', who: null });
      if (c.result !== 0) break;
      AB.start(f, p, 'jala'); G.pet.anim(n, 'paw'); G.audio.sfx('swing'); yield 30;
    }
    AB.tug = null; G.pet.sound('bark'); CK.heart(f, n); G.audio.jingle('item');
    Z.state().dog[sp.id] = { d: day(), t: G.words ? G.words.now() : 0 };
    if (G.hearts) G.hearts.add('canelo', 1, 'care'); if (G.carry && G.carry.bump) G.carry.bump('dog');
    if (!held()) bag().add('calcetines', { col: 'amarillo' });
    if (met('calcetines')) G.world.name('calcetines', p.x * TL + 12, p.y * TL - 6);
    G.st.autosave(); void sockDog;
  }
  const dogReady0 = Z.dogReady; Z.dogReady = sp => (sp && sp.act === 'tug' && G.state && !CH.done('abuelos1') ? false : dogReady0(sp)); // (the socks on the line are the story's until chapter 1 is done)
  const zSearch = Z.search, zSpecial = Z.special, zGoal = Z.goal, zUnder = Z.drawUnder, zTop = Z.drawTop, zTask = Z.task;
  Z.search = (f, x, y) => {
    const s = sideAt(f, x, y); if (s) { const cs = CH.spotAt(f, x, y); return cs ? null : s.run(f); }
    if (outside(f) && CH.spotAt(f, x, y)) return null; // (a story place wins over the dog's spot on the same tile)
    const d = outside(f) ? Z.dogSpotAt(f, x, y) : null; if (d && d.act === 'tug') return sockRun(f, d);
    return zSearch(f, x, y);
  };
  Z.special = (f, x, y) => !!sideAt(f, x, y) || (inZone(f) && G.state && !!CH.spotAt(f, x, y)) || zSpecial(f, x, y); // (a story place under the dog: the place, not his menu)
  const pt = (at, lift, icon) => ({ x: at[0] * TL + 12, y: at[1] * TL + 12, lift, icon });
  Z.task = function (f) { // things going on: eggs for Abuela, vegetables for Abuelo
    if (inZone(f) && G.state) {
      const c = cookies();
      if (cookiesOpen() && c.on && (c.n | 0) < 3) { if (outside(f)) { const i = EGGS.findIndex((e, i) => !(c.got || {})[i]); if (i >= 0) return { why: 'abuelos: eggs', pts: [pt(EGGS[i], 22, 'huevo')] }; } else return { why: 'abuelos: eggs (outside)', pts: [{ x: P('abuelos_casa', 'door')[0] * TL + 12, y: P('abuelos_casa', 'door')[1] * TL + 12, lift: 20, door: true }] }; }
      if (cookiesOpen() && c.on && (c.n | 0) >= 3) { const n = npcAt(f, 'abuela'); if (n) return { why: 'abuelos: eggs to Abuela', pts: [{ x: n.x * TL + 12, y: n.y * TL + 12, lift: 44, npc: n }] }; }
      const b = basket(), g = garden();
      if (b && (g.n | 0) < 4 && outside(f)) { const i = BEDS.findIndex((e, i) => !(g.got || {})[i]); if (i >= 0) return { why: 'abuelos: vegetables', pts: [pt(BEDS[i], 22, 'zanahoria')] }; }
      if (b && (g.n | 0) >= 4) { const n = npcAt(f, 'abuelo'); if (n) return { why: 'abuelos: the basket to Abuelo', pts: [{ x: n.x * TL + 12, y: n.y * TL + 12, lift: 44, npc: n }] }; }
    }
    return zTask(f);
  };
  Z.goal = function (f) { // suggestions: the trunk (a fashion show today), the swing
    const g = zGoal(f); if (g || !inZone(f) || !G.state) return g;
    if (indoors(f) && CH.done('abuelos1') && !daily('show').done) return { why: 'abuelos: the trunk', pts: [pt(TRUNK, 20, { icon: 'vestido', col: AB.FIRST.vestido })] };
    if (outside(f) && !(st().swings)) return { why: 'abuelos: the swing', pts: [pt(SWING, 30, 'abuelos')] };
    return null;
  };
  // ---------- drawing: the clothesline, the swing, the eggs, the photos and the mirror, night ----------
  const LINE = [P('abuelos', 'lineL'), P('abuelos', 'lineR')];
  const ON_LINE = () => { // what's drying on the line: the story's clothes until they're taken, then a towel and a sheet
    const c1 = CH.ctx('abuelos1'), d = (c1 && c1.data) || {}, done1 = CH.done('abuelos1');
    const L = [];
    if (!done1 && !d.camisa) L.push(['camisa', AB.FIRST.camisa]);
    if (!done1 && !d.pantalon) L.push(['pantalon', AB.FIRST.pantalon]);
    if (!done1 && !d.vestido) L.push(['vestido', AB.FIRST.vestido]);
    if (!done1 && !d.sock) L.push(['calcetines', AB.FIRST.calcetines]);
    if (done1) { L.push(['toalla', '#68c0e8'], ['camisa', '#f8f8f0'], ['sabana', '#f8d0e0']); if (Z.dogReady((G.maps.abuelos.dogSpots || []).find(s => s.act === 'tug') || {}) && !AB.tug) L.push(['calcetines', '#f8c830']); }
    return L;
  };
  function drawLine(f, ctx, cx, cy) {
    const x0 = LINE[0][0] * TL + 12 - cx, x1 = LINE[1][0] * TL + 12 - cx, y = LINE[0][1] * TL + 4 - cy, t = G.frame;
    ctx.strokeStyle = '#e8e8f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 6, x1, y); ctx.stroke();
    const L = ON_LINE(), n = L.length;
    L.forEach(([k, col], i) => {
      const u = (i + 1) / (n + 1), x = Math.round(x0 + (x1 - x0) * u), sag = Math.round(Math.sin(u * Math.PI) * 6), sw = Math.round(Math.sin(t / 24 + i * 1.7) * 1.5);
      ctx.fillStyle = '#c08040'; ctx.fillRect(x - 5, y + sag - 1, 2, 3); ctx.fillRect(x + 3, y + sag - 1, 2, 3); // pegs
      if (k === 'toalla' || k === 'sabana') { ctx.fillStyle = OLC; ctx.fillRect(x - 8 + sw, y + sag, 16, k === 'sabana' ? 18 : 13); ctx.fillStyle = col; ctx.fillRect(x - 7 + sw, y + sag + 1, 14, k === 'sabana' ? 16 : 11); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 7 + sw, y + sag + 8, 14, 1); return; }
      ctx.save(); ctx.translate(x - 8 + sw, y + sag - 1); G.drawIcon16(ctx, { icon: k, col }, 0, 0); ctx.restore();
    });
  }
  function drawSwing(f, ctx, cx, cy) {
    const r = f.player.swing, s = swingSeat(r);
    ctx.fillStyle = '#6a4220'; ctx.fillRect(s.px - 18 - cx, s.top - 3 - cy, 26, 4); // the branch
    ctx.strokeStyle = '#d8c8a0'; ctx.lineWidth = 1;
    for (const dx of [-6, 6]) { ctx.beginPath(); ctx.moveTo(s.px + dx - cx, s.top - cy); ctx.lineTo(s.x + dx - cx, s.y - cy); ctx.stroke(); }
    ctx.fillStyle = OLC; ctx.fillRect(Math.round(s.x - 9 - cx), Math.round(s.y - 1 - cy), 18, 4); ctx.fillStyle = '#c0823a'; ctx.fillRect(Math.round(s.x - 8 - cx), Math.round(s.y - cy), 16, 2);
  }
  Z.drawUnder = function (f, ctx) {
    zUnder(f, ctx);
    if (!G.state || !inZone(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (outside(f)) {
      drawLine(f, ctx, cx, cy); drawSwing(f, ctx, cx, cy); // (under the people: you walk in front of the washing, you sit on the swing)
      const c = cookies();
      if (cookiesOpen() && c.on) EGGS.forEach(([x, y], i) => { if (!(c.got || {})[i]) G.drawIcon16(ctx, 'huevo', x * TL + 4 - cx, y * TL + 8 - cy, 0.75); });
      const g = garden();
      for (const i in g.got || {}) { const at = BEDS[i], k = (G.frame - g.got[i]) / 30; if (at && k < 1) G.drawIcon16(ctx, 'zanahoria', at[0] * TL + 4 - cx, at[1] * TL - 4 - k * 20 - cy); }
    }
    if (indoors(f)) { // the photos on the living room's wall (the family photo joins them), the mirror in the bedroom, a mouse hole
      const [px, py] = P('abuelos_casa', 'photos'), photos = [['abuelo', '#c8e0f0'], ['abuela', '#f8d8e0'], ['bebe', '#f8f0c0']];
      if (CH.done('abuelos3')) photos.push(['foto', '#a8e0f8']);
      photos.forEach(([k, bg], i) => { const x = (px + i) * TL + 4 - cx, y = py * TL + 4 - cy; ctx.fillStyle = '#5a3418'; ctx.fillRect(x - 1, y - 1, 18, 18); ctx.fillStyle = '#c08a48'; ctx.fillRect(x, y, 16, 16); ctx.fillStyle = bg; ctx.fillRect(x + 2, y + 2, 12, 12); if (k === 'foto') G.drawIcon16(ctx, 'foto', x, y); else G.drawIcon16(ctx, k, x + 2, y + 2, 0.75); });
      const [mx, my] = P('abuelos_casa', 'mirror'), X = mx * TL + 4 - cx, Y = my * TL + 3 - cy;
      ctx.fillStyle = '#e8b030'; ctx.beginPath(); ctx.ellipse(X + 8, Y + 9, 8, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c8e8f8'; ctx.beginPath(); ctx.ellipse(X + 8, Y + 9, 6, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 4, Y + 5, 1, 5);
      const [hx, hy] = P('abuelos_casa', 'hole'); ctx.fillStyle = '#100808'; ctx.fillRect(hx * TL + 16 - cx, (hy + 1) * TL - 7 - cy, 6, 7); ctx.fillRect(hx * TL + 17 - cx, (hy + 1) * TL - 8 - cy, 4, 1);
      if (cookies().baked) { const [tx, ty] = P('abuelos_casa', 'table'); G.drawIcon16(ctx, 'galletas', tx * TL + 16 - cx, ty * TL + 2 - cy); }
    }
  };
  Z.drawTop = function (f, ctx) {
    zTop(f, ctx);
    if (!G.state || !inZone(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (outside(f)) {
      if (AB.tug && AB.tug.dog) { const n = AB.tug.dog; G.drawIcon16(ctx, { icon: 'calcetines', col: '#f8c830' }, n.x * TL + 10 + (n.ox || 0) - cx, n.y * TL + 6 + (n.oy || 0) - cy, 0.6); }
      // night: a blue dusk, the cottage's windows glow
      const dark = (G.day ? G.day.glow() : 0) * 0.6;
      if (dark > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = dark; ctx.fillStyle = '#2c3868'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const lights = [[f.player.x * TL + 12 + (f.player.ox || 0) - cx, f.player.y * TL + 12 + (f.player.oy || 0) - cy, 30]];
        for (let x = 13; x <= 25; x++) if (f.map.get(x, 9) === 'N') lights.push([x * TL + 12 - cx, 9 * TL + 10 - cy, 26]);
        for (const a of (f.zoo ? f.zoo.list : []).filter(a => (AN.KINDS[a.kind] || {}).glow)) lights.push([a.x - cx, a.y - a.z - 3 - cy, 20]);
        for (const [x, y, r] of lights) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,224,150,' + (0.5 * dark) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
        ctx.restore();
      }
    }
    if (!f.locked && G.top() === f) for (const s of SIDE) { if (s.map !== f.mapId || !s.on()) continue; const ic = s.icon(); if (ic) G.drawAlert(ctx, ic, s.at[0] * TL - cx, s.at[1] * TL - cy + 4, f.t); }
  };
  // a new ghost-hand demo: the first time eggs are wanted, the hand taps one
  (Z.demos || (Z.demos = [])).push({ kind: 'pickegg', find: f => (outside(f) && cookiesOpen() && cookies().on && (cookies().n | 0) < 3 ? EGGS.find((e, i) => !(cookies().got || {})[i]) || null : null) });
  // the per-frame hook: this zone's people are drawn by drawAB; the baby is small; who's inside or out
  const anUp0 = AN.update;
  AN.update = function (f) {
    anUp0.call(this, f);
    if (!inZone(f) || !G.state) return;
    hook(f.player);
    for (const id of ['abuelo', 'abuela', 'bebe']) { const n = f.npc(id); if (n) { hook(n); if (id === 'bebe') n.small = true; } }
  };

  // =====================================================================
  //  The maps
  // =====================================================================
  const DOOR = P('abuelos', 'door'), CDOOR = P('abuelos_casa', 'door');
  // Abuela is in her kitchen; for the photo (chapter 3, once you've found the baby) she waits on the porch
  const photoTime = () => { const c = CH.ctx('abuelos3'); return CH.active('abuelos3') && c && c.data && c.data.gone; };
  G.maps.abuelos = {
    name: 'La casa de los abuelos', icon: 'abuelos', rows: MD.abuelos.rows, music: 'inn',
    exits: [Z.edge(IN[0], 0, 'camino_abuelos', 6, 22, 'up'), { x: DOOR[0], y: DOOR[1], to: 'abuelos_casa', tx: CDOOR[0], ty: CDOOR[1] - 1, dir: 'up' }],
    posts: [{ at: P('abuelos', 'post'), zone: 'abuelos' }],
    // the dog's things to do: dig in the garden (a carrot), snatch a sock off the line (a tug of war), chase the turkeys
    dogSpots: [
      { id: 'abuelos_huerto', at: P('abuelos', 'dog'), act: 'dig', gives: 'zanahoria', every: 120 },
      { id: 'abuelos_calcetin', at: [SOCK[0], SOCK[1]], act: 'tug', every: 'day' },
      { id: 'abuelos_pavos', at: P('abuelos', 'pavosDog'), act: 'chase', kind: 'pavo', every: 60 },
    ],
    pages: K.pages('abuelos'),
    ambient: { birds: 3, butterflies: 4 },
    animals: [
      { kind: 'vaca', n: 2, area: 'vacas' }, { kind: 'burro', n: 1, area: 'burros', on: '.,o' }, { kind: 'oveja', n: 4, area: 'ovejas' },
      { kind: 'cerdo', n: 3, area: 'cerdos', on: 'í.' }, { kind: 'pavo', n: 3, area: 'pavos' }, { kind: 'gallina', n: 3, area: 'gallinero' },
      { kind: 'pato', n: 3, area: 'estanque' }, { kind: 'rana', area: 'rana' }, { kind: 'conejo', n: 2, area: 'conejos' },
      { kind: 'gallo', n: 1, area: 'gallo', when: 'manana' },                 // rare: at dawn, by the henhouse
      { kind: 'tlacuache', n: 1, area: 'huerta', when: 'noche' },             // rare: at night in the orchard
      { kind: 'luciernaga', n: 6, area: 'huerta', when: 'noche' },            // fireflies over the orchard at night
    ],
    things: { tiles: { 'ñ': null, 'á': 'gallina', 'é': 'agua', 'í': null, '(': 'arbol', ')': 'arbol', O: null } },
    poke: (f, x, y) => { const c = f.map.get(x, y); if (c === 'í') { G.audio.sfx('swing'); for (let i = 0; i < 4; i++) puff('crumb', x * TL + 12, y * TL + 12, { vy: -1, vx: (Math.random() - 0.5) * 2, g: 0.15, life: 20 }); return true; } if (c === 'ñ') { G.audio.sfx('select'); return true; } return false; },
    npcs: [
      K.canelo(IN[0], 3), Z.lola(...P('abuelos', 'lola'), 'abuelos'), Z.nico(...P('abuelos', 'nico')),
      person('abuelo', ...P('abuelos', 'abuelo'), 'down', abueloSide, abueloLine, { fixed: true }),
      Object.assign(person('abuela', ...P('abuelos', 'abuela'), 'down', abuelaSide, abuelaLine, { fixed: true }), { cond: () => !!photoTime() }),
    ],
  };
  G.maps.abuelos_casa = {
    name: 'La casa de los abuelos', icon: 'abuelos', rows: MD.abuelos_casa.rows, music: 'headquarters', indoor: true,
    exits: [{ x: CDOOR[0], y: CDOOR[1], to: 'abuelos', tx: DOOR[0], ty: DOOR[1] + 1, dir: 'down' }],
    pages: K.pages('abuelos_casa'),
    animals: [{ kind: 'raton', n: 1, area: 'cocina', on: 'i' }],
    things: { tiles: { j: 'cama', t: null, 'ó': null, 'ú': null, u: null, v: null } },
    poke: (f, x, y) => { const c = f.map.get(x, y); if (c === 'v') { G.audio.sfx('select'); puff('dust', x * TL + 12, y * TL, { vy: -0.6, life: 40 }); return true; } return false; },
    npcs: [
      K.canelo(CDOOR[0], CDOOR[1] - 2),
      Object.assign(person('abuela', ...P('abuelos_casa', 'abuela'), 'down', abuelaSide, abuelaLine, { fixed: true }), { cond: () => !photoTime() }),
      Object.assign(person('bebe', ...P('abuelos_casa', 'bebe'), 'down', null, bebeLine, { wander: 1 }), { cond: () => { const c = CH.ctx('abuelos3'); return !(CH.active('abuelos3') && c && c.data && c.data.gone); } }),
    ],
  };
  if (G.carry) Object.assign(G.carry.DOG, { zanahoria: 'eat', galleta: 'eat', calcetines: 'fetch' });

  // ---------- things to pick up: an apple in the orchard, sticks ----------
  G.carry.SOURCES.push(
    { id: 'manzana_cabuelos', map: 'camino_abuelos', at: P('camino_abuelos', 'manzana'), item: 'manzana', every: 150, tree: [10, 15] },
    { id: 'manzana_abuelos', map: 'abuelos', at: [11, 4], item: 'manzana', every: 150, tree: [11, 2] },
    { id: 'manzana_abuelos2', map: 'abuelos', at: [19, 4], item: 'manzana', every: 150, tree: [19, 2] },
    { id: 'palo_abuelos', map: 'abuelos', at: [36, 11], item: 'palo', every: 90 },
  );
  // ---------- Nico's hiding places (seek.js) ----------
  G.seek.SPOTS.push(
    { id: 'abuelos1', map: 'abuelos', at: P('abuelos', 'hide1'), how: 'over', cut: 9, dx: 0, kinds: ['gallina', 'conejo', 'gato', 'pavo'], place: 'gallina' },     // behind the hay bale in the hens' run
    { id: 'abuelos2', map: 'abuelos', at: P('abuelos', 'hide2'), how: 'over', cut: 8, dx: 0, kinds: ['gallina', 'conejo', 'gato'], place: 'gallina' },              // behind the henhouse
    { id: 'abuelos3', map: 'abuelos', at: P('abuelos', 'hide3'), how: 'over', cut: 9, dx: 0, kinds: ['oveja', 'cerdo', 'conejo', 'gato'], place: 'vaca' },          // behind the hay in the paddock
    { id: 'abuelos4', map: 'abuelos', at: P('abuelos', 'hide4'), how: 'over', cut: 10, dx: 0, kinds: ['conejo', 'gato', 'pavo'], place: 'agua' },                   // behind the water pump
    { id: 'abuelos5', map: 'abuelos', at: P('abuelos', 'hide5'), how: 'over', cut: 16, dx: 0, kinds: ['gato', 'conejo', 'pavo'], place: 'arbol' },                  // behind the swing tree
    { id: 'abuelos6', map: 'abuelos', at: P('abuelos', 'hide6'), how: 'over', cut: 10, dx: 0, kinds: ['cerdo', 'oveja', 'conejo'], place: 'agua' },                 // behind a rock by the pond
  );
  G.seek.KINDS.push('oveja', 'cerdo', 'pavo');
  Object.assign(G.seek.PEEK, { oveja: [3, 6], cerdo: [3, 5], pavo: [3, 6] });
  // ---------- favours (favores.js, from Villa Sol's chapter 7 on): the grandparents ask about the zone's words ----------
  const been = () => Z.visited('abuelos');
  G.favores.OFFERS.push(['abuela', 'thing', ['camisa', 'pantalon', 'vestido', 'calcetines', 'zapatos', 'sombrero', 'chamarra', 'bebe'], been], ['abuelo', 'thing', ['vaca', 'cerdo', 'oveja', 'burro', 'pavo', 'gallo', 'mano', 'pie', 'nariz'], been]);
  Object.assign(G.favores.THINGS, { abuela: ['camisa', 'pantalon', 'vestido', 'calcetines', 'zapatos', 'sombrero', 'chamarra', 'bebe'], abuelo: ['vaca', 'cerdo', 'oveja', 'burro', 'pavo', 'gallo', 'mano', 'pie', 'nariz'] });

  // =====================================================================
  //  The story: the grandparents' quest line (G.chapters, line 'abuelos')
  // =====================================================================
  CH.add({ id: 'abuelos1', line: 'abuelos', title: '¡A vestirse!', en: 'Getting dressed: your clothes are drying on the line (and the dog runs off with a sock)', giver: 'abuela', words: ['abuela', 'camisa', 'pantalon', 'vestido', 'calcetines'], icon: 'camisa', col: '#e04040', goal: [['camisa', 1], ['calcetines', 1]] });
  CH.add({ id: 'abuelos2', line: 'abuelos', title: '¡A lavarse!', en: 'Washing up: the dog rolls in the pigs\' mud and jumps on you; wash at the pump', giver: 'abuelo', words: ['abuelo', 'cerdo', 'mano', 'pie', 'nariz'], icon: 'mano', col: '#3a8ad0', goal: [['mano', 1], ['pie', 1], ['nariz', 1]] });
  CH.add({ id: 'abuelos3', line: 'abuelos', title: '¡La foto de la familia!', en: 'The family photo: shoes and a hat from the trunk, find the baby, everyone on the porch', giver: 'abuela', words: ['familia', 'zapatos', 'sombrero', 'bebe'], icon: 'foto', col: '#d05080', goal: [['familia', 1]] });
  AB.photoTime = photoTime;

  const LINE_AT = [Math.round((LINE[0][0] + LINE[1][0]) / 2), LINE[0][1]];
  const SOCK_AT = [LINE_AT[0] + 2, LINE_AT[1] + 3];
  const wearIt = function* (f, id) { const col = AB.putOn(f, id, AB.FIRST[id]); yield 24; return col; };
  // ---------- 1 · ¡A vestirse!: la abuela, la camisa, el pantalón, el vestido, los calcetines ----------
  CH.script('abuelos1', [
    { who: 'abuela', run: function* (f, c) {
      const n = npcAt(f, 'abuela'); if (n) for (let k = 0; k < 3; k++) puff('heart', n.x * TL + 8 + k * 5, n.y * TL - 2, { life: 50, vy: -0.4 });
      yield* meetW('abuela', { who: 'abuela', prompt: '¡{name}! ¡Soy tu [abuela]!', en: '{name}! It\'s me, your grandma! What a big hug!', known: othersFor('abuela', ['hola', 'casa', 'perro', 'gato']) });
      yield* sayShow('abuela', { icon: 'camara' }, T('¡Hoy hay foto!', 'Today we take the family photo! You need to get dressed.'));
      CH.point(DOOR[0] * TL + 12, DOOR[1] * TL);
      try { yield* sayShow('abuela', { icon: 'camisa', col: AB.FIRST.camisa }, T('¡Tu ropa está afuera!', 'Your clothes are drying outside, on the clothesline!')); } finally { CH.point(null); }
      c.data.out = 1;
    } },
    { spot: { map: 'abuelos', at: LINE_AT, icon: { icon: 'camisa', col: AB.FIRST.camisa } }, run: function* (f, c) {
      G.audio.sfx('select');
      yield* meetW('camisa', { who: 'abuela', prompt: '¡Tu [camisa]!', en: 'Your shirt! Put it on!', show: { icon: 'camisa', col: AB.FIRST.camisa }, known: othersFor('camisa', ['casa', 'pelota', 'flor', 'manzana']) });
      c.data.camisa = 1; yield* wearIt(f, 'camisa');
      yield* meetW('pantalon', { who: 'abuela', prompt: '¡Tu [pantalon:pantalón]!', en: 'Your trousers!', show: { icon: 'pantalon', col: AB.FIRST.pantalon }, known: othersFor('pantalon', ['camisa', 'casa', 'pelota']) });
      c.data.pantalon = 1;
      yield* meetW('vestido', { who: 'abuela', prompt: '¡Y tu [vestido]!', en: 'And your dress!', show: { icon: 'vestido', col: AB.FIRST.vestido }, known: othersFor('vestido', ['camisa', 'pantalon', 'casa']) });
      c.data.vestido = 1;
      // a free choice: trousers or the dress (the mic is on)
      const ch = [{ word: 'pantalon', img: { icon: 'pantalon', col: AB.FIRST.pantalon } }, { word: 'vestido', img: { icon: 'vestido', col: AB.FIRST.vestido } }];
      const r = yield G.choose({ prompt: '¿[pantalon:Pantalón] o [vestido]?', en: 'Trousers or the dress? You choose! (say it, or tap it)', choices: ch, layout: 'cards', mic: true, who: 'abuela' });
      const pick = r.result === 1 ? 'vestido' : 'pantalon'; if (G.cards) G.cards.grow(pick, 'tap');
      yield* wearIt(f, pick);
      // the socks: the dog snatches them off the line and runs!
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
      if (dog) {
        G.pet.place(f, dog); yield 10; CK.bark(f, dog);
        yield* CK.walk(f, dog, LINE_AT[0] + 1, LINE_AT[1] + 1, 5); G.pet.anim(dog, 'jump'); yield 16;
        c.data.sock = 1; G.audio.sfx('pop'); AB.tug = { dog };
        for (const [x, y] of [[SOCK_AT[0] + 2, SOCK_AT[1] - 1], [SOCK_AT[0] - 1, SOCK_AT[1] + 1], SOCK_AT]) { G.pet.sound('bark'); yield* CK.walk(f, dog, x, y, 6); }
        dog.dir = 'left';
        yield* sayShow('abuela', { icon: 'perro' }, T('¡Ay, {dog}!', 'Oh, {dog}! He ran off with your socks!'));
      } else { c.data.sock = 1; yield* sayShow('abuela', { icon: 'calcetines', col: AB.FIRST.calcetines }, T('¡Ay! ¡El viento!', 'Oh! The wind blew your socks off the line!')); }
    } },
    { spot: { map: 'abuelos', at: SOCK_AT, icon: { icon: 'calcetines', col: AB.FIRST.calcetines } }, run: function* (f, c) {
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null, p = f.player;
      if (dog) { // a tug of war for them
        AB.tug = { dog }; p.dir = dog.x < p.x ? 'left' : dog.x > p.x ? 'right' : dog.y < p.y ? 'up' : 'down';
        for (let k = 0; k < 3; k++) {
          const r = yield G.choose({ prompt: '¡{dog}!', en: 'Pull! (tap the socks)', choices: [{ icon: 'calcetines', label: '¡Jala!' }], layout: 'cards', who: null });
          if (r.result !== 0) break;
          AB.start(f, p, 'jala'); G.pet.anim(dog, 'paw'); G.audio.sfx('swing'); yield 30;
        }
        AB.tug = null; CK.bark(f, dog); CK.heart(f, dog);
      }
      yield* meetW('calcetines', { who: 'abuela', prompt: '¡Tus [calcetines]!', en: 'Your socks!', show: { icon: 'calcetines', col: AB.FIRST.calcetines }, known: othersFor('calcetines', ['camisa', 'pantalon', 'vestido', 'pelota']) });
      c.data.socks = 1; yield* wearIt(f, 'calcetines');
      CH.point(DOOR[0] * TL + 12, DOOR[1] * TL);
      try { yield* sayShow('abuela', { icon: 'espejo' }, T('¡Al espejo!', 'Come and look in the mirror! (in the bedroom)')); } finally { CH.point(null); }
    } },
    { spot: { map: 'abuelos_casa', at: WARDROBE, icon: { icon: 'espejo' } }, run: function* (f, c) {
      yield AB.mirror();
      yield* quiz('abuela', '¿Qué es?', 'What is this, that you\'re wearing?', 'camisa', ['pantalon', 'vestido', 'calcetines'].filter(k => k !== 'vestido' || !AB.wear().pantalon), { show: AB.pic('camisa') });
      yield* quiz('abuela', '¿Y esto?', 'And these?', 'calcetines', ['camisa', AB.wear().vestido ? 'vestido' : 'pantalon'], { show: AB.pic('calcetines') });
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('abuela', 'abuela', T('¡Qué guap{o/a}, {name}!', 'Don\'t you look lovely, {name}! (the trunk by the bed has more clothes: dress up any time)'));
    } },
  ], {
    stage(f, c) { if (!outside(f) || !CH.active('abuelos1')) return; const dog = c.data.sock && !c.data.socks && G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog && !dog.busy && (dog.x !== SOCK_AT[0] || dog.y !== SOCK_AT[1] - 0)) { CK.place(f, 'canelo', SOCK_AT[0], SOCK_AT[1], 'left'); AB.tug = { dog }; } },
    drawTop(f, ctx, c) { if (!outside(f) || !c.data.sock || c.data.socks || (G.pet && G.pet.mine())) return; G.drawIcon16(ctx, { icon: 'calcetines', col: AB.FIRST.calcetines }, SOCK_AT[0] * TL + 4 - Math.round(f.cam.x), SOCK_AT[1] * TL + 6 - Math.round(f.cam.y), 0.75); },
  });

  // ---------- 2 · ¡A lavarse!: el abuelo, el cerdo, la mano, el pie, la nariz ----------
  const PUMP = P('abuelos', 'pump'), PUMP_AT = P('abuelos', 'pumpAt'), PEN = [34, 23];
  CH.script('abuelos2', [
    { who: 'abuelo', run: function* (f, c) {
      const ab = npcAt(f, 'abuelo'); if (ab) AB.start(f, ab, 'saluda');
      yield* meetW('abuelo', { who: 'abuelo', prompt: '¡{name}! ¡Soy tu [abuelo]!', en: '{name}! It\'s me, your grandpa! Come and see my animals!', known: othersFor('abuelo', ['abuela', 'hola', 'casa', 'perro']) });
      CH.point(PEN[0] * TL + 12, PEN[1] * TL);
      try { yield* meetW('cerdo', { who: 'abuelo', prompt: '¡Mira! ¡Los [cerdo:cerdos]!', en: 'Look! The pigs! They love the mud.', known: othersFor('cerdo', ['vaca', 'caballo', 'gallina', 'perro']) }); } finally { CH.point(null); }
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null, p = f.player;
      if (dog) { // he races off into the mud, rolls, and jumps all over you
        G.pet.place(f, dog); CK.bark(f, dog);
        yield* CK.walk(f, dog, PEN[0], PEN[1] + 1, 6); G.audio.sfx('swing');
        for (let k = 0; k < 10; k++) puff('crumb', dog.x * TL + 12 + (Math.random() - 0.5) * 18, dog.y * TL + 12, { vy: -1.4 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.15, life: 30 });
        yield* G.pet.play('spin'); AN.cry('cerdo');
        yield* CK.walk(f, dog, p.x + 1, p.y, 6); G.pet.anim(dog, 'jump');
      }
      c.data.mud = { mano: 1, pie: 1, nariz: 1 }; G.audio.sfx('boop'); for (let k = 0; k < 8; k++) puff('crumb', p.x * TL + 12 + (Math.random() - 0.5) * 16, p.y * TL + 4, { vy: -1, vx: (Math.random() - 0.5) * 2, g: 0.15, life: 26 });
      yield 20;
      yield* sayShow('abuelo', null, T('¡Ay, ay, ay! ¡Lodo!', 'Oh dear! Mud all over you!'));
      CH.point(PUMP[0] * TL + 12, PUMP[1] * TL);
      try { yield* sayShow('abuelo', { icon: 'agua' }, T('¡Al agua! ¡Ven!', 'To the water pump! Come on!')); } finally { CH.point(null); }
      c.data.pump = 1;
      if (ab) yield* CK.walk(f, ab, PUMP_AT[0], PUMP_AT[1] - 1, 4);
    } },
    { spot: { map: 'abuelos', at: PUMP, icon: { icon: 'agua' } }, run: function* (f, c) {
      const ab = npcAt(f, 'abuelo'), p = f.player;
      G.audio.sfx('swing'); f.wig = { x: PUMP[0], y: PUMP[1], t: 24 };
      const parts = [['mano', '¡Lávate las [mano:manos]!', 'Wash your hands!'], ['pie', '¡Ahora los [pie:pies]!', 'Now your feet!'], ['nariz', '¡Y la [nariz]!', 'And your nose!']];
      for (const [id, prompt, en] of parts) {
        let k = 0;
        const wash = function* () { yield* AB.act(f, p, id, { wash: true }); delete c.data.mud[id]; G.audio.sfx('chime'); };
        if (!met(id)) {
          yield* G.intro.watch(id, { who: 'abuelo', prompt, en, known: othersFor(id, AB.BODY.concat(['agua', 'casa'])),
            act: function* () { k++; if (k === 1) { if (ab) yield* AB.act(f, ab, id, { wash: true }); else yield 20; } else yield* wash(); } });
          if (k < 2) yield* wash();
        } else {
          if (ab) yield* AB.act(f, ab, id, { wash: true });
          yield* ask('abuelo', '¿Qué lavo?', 'What do I wash now? (say it!)', id, AB.bodyFor(id), { show: { icon: 'agua' } });
          yield* wash();
        }
      }
      c.data.mud = null;
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
      if (dog) { G.pet.place(f, dog); yield 10; yield* G.pet.play('spin'); for (let i = 0; i < 10; i++) puff('drop', dog.x * TL + 12 + (Math.random() - 0.5) * 16, dog.y * TL + 10, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.12, life: 30 }); CK.bark(f, dog); }
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('abuelo', 'abuelo', T('¡Limpi{o/a}! ¡Muy bien, {name}!', 'All clean! Well done, {name}! (come and play Simón dice with me tomorrow... or now!)'));
      if (ab) yield* CK.walk(f, ab, ...P('abuelos', 'abuelo'), 4);
    } },
  ], {
    stage(f, c) { if (!outside(f) || !CH.active('abuelos2')) return; const ab = npcAt(f, 'abuelo'); if (ab && !ab.busy && c.data.pump && (ab.x !== PUMP_AT[0] || ab.y !== PUMP_AT[1] - 1)) CK.place(f, 'abuelo', PUMP_AT[0], PUMP_AT[1] - 1, 'down'); },
  });

  // ---------- 3 · ¡La foto de la familia!: la familia, los zapatos, el sombrero, el bebé ----------
  const PORCH = P('abuelos', 'porch'), BABY_AT = [19, 21];
  const BABY_PAL = null; void BABY_PAL;
  const trailPt = (f, k) => { const tr = (f.zoo && f.zoo.trail) || []; return tr[Math.max(0, tr.length - 1 - k)] || [f.player.x * TL + 12, f.player.y * TL + 20]; };
  CH.script('abuelos3', [
    { who: 'abuela', run: function* (f, c) {
      yield* sayShow('abuela', { icon: 'camara' }, T('¡{name}! ¡La foto!', '{name}! It\'s time for the photo!'));
      yield* meetW('familia', { who: 'abuela', prompt: '¡La foto de la [familia]!', en: 'The family photo! All of us together!', show: 'familia', known: othersFor('familia', ['abuela', 'abuelo', 'casa', 'perro']) });
      CH.point(TRUNK[0] * TL + 12, TRUNK[1] * TL);
      try { yield* sayShow('abuela', { icon: 'zapatos', col: AB.FIRST.zapatos }, T('¿Y tus zapatos? ¡El baúl!', 'And your shoes? Look in the trunk by the bed!')); } finally { CH.point(null); }
    } },
    { spot: { map: 'abuelos_casa', at: TRUNK, icon: { icon: 'zapatos', col: AB.FIRST.zapatos } }, run: function* (f, c) {
      G.audio.sfx('door'); f.wig = { x: TRUNK[0], y: TRUNK[1], t: 18 };
      yield* meetW('zapatos', { who: 'abuela', prompt: '¡Tus [zapatos]!', en: 'Your shoes!', show: { icon: 'zapatos', col: AB.FIRST.zapatos }, known: othersFor('zapatos', ['calcetines', 'camisa', 'pantalon', 'casa']) });
      yield* wearIt(f, 'zapatos');
      yield* meetW('sombrero', { who: 'abuela', prompt: '¡Y un [sombrero]!', en: 'And a hat! For the sun.', show: { icon: 'sombrero', col: AB.FIRST.sombrero }, known: othersFor('sombrero', ['zapatos', 'camisa', 'calcetines', 'casa']) });
      yield* wearIt(f, 'sombrero');
      if (met('cabeza')) yield* quiz('abuela', '¿Dónde va el [sombrero]?', 'Where does the hat go? (on your...)', 'cabeza', AB.bodyFor('cabeza'));
      yield AB.mirror();
      // the baby isn't on the rug!
      c.data.gone = 1; const bb = f.npc('bebe'); if (bb) bb.hidden = true;
      AN.tone('sine', 700, 900, 0.2, 0.05); AN.tone('sine', 800, 1000, 0.2, 0.05, 0.25);
      yield* meetW('bebe', { who: 'abuela', prompt: '¿Y el [bebe:bebé]?', en: 'And where is the baby? She was on the rug a moment ago!', show: 'bebe', known: othersFor('bebe', ['abuela', 'abuelo', 'familia', 'perro']) });
      yield* sayShow('abuela', { icon: 'huella' }, T('¡Búscalo, {name}!', 'Find her, {name}! She crawled outside... (follow the little hand prints)'));
    } },
    { spot: { map: 'abuelos', at: BABY_AT, icon: 'bebe' }, run: function* (f, c) { // by the pond with the ducks, giggling
      G.audio.sfx('select'); AN.cry('pato');
      c.data.found = 1;
      yield* sayShow('bebe', 'bebe', T('¡Ba-ba! ¡Cuac!', '(the baby is watching the ducks, giggling)'));
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog) { G.pet.place(f, dog); yield 10; yield* G.pet.play('dance'); CK.bark(f, dog); }
      c.data.follow = 1; // she crawls after you
      CH.point(PORCH[0] * TL + 12, PORCH[1] * TL);
      try { yield* sayShow('abuela', { icon: 'camara' }, T('¡El [bebe:bebé]! ¡A la foto!', 'You found the baby! Now everyone to the porch for the photo!')); } finally { CH.point(null); }
      const ab = npcAt(f, 'abuelo'); if (ab) yield* CK.walk(f, ab, PORCH[0] + 2, PORCH[1] + 1, 4);
    } },
    { spot: { map: 'abuelos', at: [PORCH[0], PORCH[1] + 1], icon: { icon: 'camara' } }, run: function* (f, c) { // everyone on the porch: ¡whisky!
      c.data.follow = 2; const p = f.player;
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog) { CK.place(f, 'canelo', PORCH[0] - 1, PORCH[1] + 1, 'down'); }
      const ab = npcAt(f, 'abuelo'); if (ab) { CK.place(f, 'abuelo', PORCH[0] + 1, PORCH[1] + 1, 'down'); }
      const aa = npcAt(f, 'abuela'); if (aa) CK.place(f, 'abuela', PORCH[0] + 1, PORCH[1] + 2, 'down');
      p.dir = 'down'; c.data.tripod = 1; yield 20;
      if (met('cinco')) yield* quiz('abuela', '¿Cuántos somos?', 'How many of us are in the photo? (you, Abuela, Abuelo, the baby and {dog})', 'cinco', ['cuatro', 'seis', 'tres'], { show: { list: ['abuelo', 'abuela', 'bebe', 'perro', { icon: 'hola' }] } });
      yield* sayShow('abuela', { icon: 'camara' }, T('¡Digan "whisky"!', 'Everybody say "cheese"! (in Mexico: "whisky"!)'));
      yield AB.photo();
      c.data.flash = G.frame;
      CK.confetti(); G.audio.jingle('promote');
      yield* quiz('abuela', '¿Qué es?', 'Who is in the photo?', 'familia', ['bebe', 'abuelo', 'abuela'], { show: { icon: 'foto' } });
      yield* sayShow('abuela', { icon: 'foto' }, T('¡Mi [familia]! ¡La pongo en la pared!', 'My family! I\'ll hang it on the wall with the others. Come and see it inside!'));
      c.data.done = 1;
    } },
  ], {
    stage(f, c) {
      if (!CH.active('abuelos3')) return;
      if (indoors(f) && c.data.gone) { const bb = f.npc('bebe'); if (bb) bb.hidden = true; }
    },
    draw(f, ctx, c) { // the baby crawling by the pond, then after you (drawn by the chapter), the camera on its tripod
      if (!outside(f) || !CH.active('abuelos3') || !c.data.gone) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
      if (!c.data.found) for (const [x, y, i] of [[19, 13, 0], [19, 15, 1], [20, 17, 0], [19, 19, 1]]) { ctx.globalAlpha = 0.5; G.drawIcon16(ctx, 'mano', x * TL + (i ? 10 : 2) - cx, y * TL + 8 - cy, 0.45); ctx.globalAlpha = 1; }
      let x, y, moving = false;
      if (!c.data.follow) { x = BABY_AT[0] * TL + 12; y = BABY_AT[1] * TL + 18; }
      else if (c.data.follow === 1) { const q = trailPt(f, 16); x = q[0]; y = q[1]; moving = true; c.data.at = [x, y]; }
      else { x = (PORCH[0] - 0) * TL + 30; y = (PORCH[1] + 2) * TL + 18; }
      const spec = G.data.npcs.bebe.map, img = G.unitSprite(spec, moving ? (x > f.player.x * TL + 12 ? 'left' : 'right') : 'down', (t >> 4) & 1), k = 0.68;
      ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(Math.round(x - 5 - cx), Math.round(y - cy), 10, 2);
      ctx.drawImage(img, Math.round(x - 12 * k - cx), Math.round(y - 27 * k - cy - (moving ? ((t >> 3) & 1) : 0)), Math.round(24 * k), Math.round(24 * k));
      if (!c.data.follow && (t >> 5) & 1) G.text(ctx, '♪', Math.round(x - cx) + 6, Math.round(y - 26 - cy), '#ffffff', '#203048');
    },
    drawTop(f, ctx, c) {
      if (!outside(f) || !c.data.tripod || CH.done('abuelos3')) return;
      const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), x = PORCH[0] * TL + 12 - cx, y = (PORCH[1] + 4) * TL + 14 - cy;
      ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1; for (const d of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + d, y); ctx.stroke(); }
      G.drawIcon16(ctx, 'camara', x - 8, y - 28);
      if (c.data.flash && G.frame - c.data.flash < 12) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - (G.frame - c.data.flash) / 12) + ')'; ctx.fillRect(0, 0, G.W, G.H); }
    },
  });
  // the photo itself: the cottage behind, everyone in a row (Abuelo, Abuela, you dressed up, the baby, the dog), a flash
  class FamilyPhoto {
    constructor(w) { this.w = w; this.t = 0; this.transparent = false; }
    onEnter() { G.audio.sfx('ok'); }
    update() { this.t++; if (this.t === 40) { G.audio.sfx('star'); if (G.speak) G.speak('¡Whisky!'); } if (this.t > 260 || (this.t > 70 && (G.input.tap() || G.input.p('A')))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      ctx.fillStyle = '#201810'; ctx.fillRect(0, 0, G.W, G.H);
      const fx = 34, fy = 18, fw = G.W - 68, fh = G.H - 52;
      ctx.fillStyle = '#8a5428'; ctx.fillRect(fx - 8, fy - 8, fw + 16, fh + 16); ctx.fillStyle = '#c08a48'; ctx.fillRect(fx - 5, fy - 5, fw + 10, fh + 10);
      ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
      ctx.fillStyle = '#a8e0f8'; ctx.fillRect(fx, fy, fw, fh);
      ctx.fillStyle = '#c04030'; ctx.beginPath(); ctx.moveTo(fx + 20, fy + 64); ctx.lineTo(fx + fw / 2, fy + 14); ctx.lineTo(fx + fw - 20, fy + 64); ctx.fill();
      ctx.fillStyle = '#f0e0c0'; ctx.fillRect(fx + 30, fy + 64, fw - 60, 70); ctx.fillStyle = '#88d0f8'; ctx.fillRect(fx + 44, fy + 80, 22, 20); ctx.fillRect(fx + fw - 66, fy + 80, 22, 20);
      ctx.fillStyle = '#8a5428'; ctx.fillRect(fx + fw / 2 - 12, fy + 84, 24, 50);
      ctx.fillStyle = '#6cb83c'; ctx.fillRect(fx, fy + 128, fw, fh - 128);
      ctx.imageSmoothingEnabled = false;
      const row = [[G.data.npcs.abuelo.map, 3, 0], [G.data.npcs.abuela.map, 3, 0], [G.st.playerSpec().map, 3, 0], [G.data.npcs.bebe.map, 2, 10], [G.data.npcs.canelo.map, 2.4, 6]];
      const gap = (fw - 20) / row.length;
      row.forEach(([spec, s, dy], i) => { const img = G.unitSprite(spec, 'down', 0), w = 24 * s, x = fx + 10 + gap * i + gap / 2 - w / 2, y = fy + fh - 12 - w + dy - (this.t > 40 && this.t < 70 && i === 4 ? 6 : 0); ctx.drawImage(img, Math.round(x), Math.round(y), w, w); });
      ctx.restore();
      if (this.t > 30 && this.t < 52) { ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, 1 - Math.abs(this.t - 40) / 12) + ')'; ctx.fillRect(0, 0, G.W, G.H); }
      if (this.t > 52) G.bigText(ctx, '¡Whisky!', G.W / 2, G.H - 24, 2, '#fff070', '#401010');
    }
  }
  AB.photo = () => { const w = new G.Wait(); G.push(new FamilyPhoto(w)); return w; };

  // =====================================================================
  //  The zone
  // =====================================================================
  const bus = P('abuelos', 'bus'), busIn = P('abuelos', 'busIn');
  Z.add({
    id: 'abuelos', name: 'La casa de los abuelos', en: 'the grandparents\' house', icon: 'abuelos', music: 'inn', pos: [78, 176],
    maps: ['abuelos', 'abuelos_casa'], path: 'camino_abuelos',
    bus: { map: 'abuelos', at: bus }, entry: { map: 'abuelos', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: KINDS, // the album page, in order
    habitat: { vaca: 'hoja', cerdo: 'agua', oveja: 'flor', burro: 'manzana', pavo: 'huevo', raton: 'queso', gallo: 'huevo', tlacuache: 'arbol' },
    rare: { gallo: 'manana', tlacuache: 'noche' },
    planned: 0,
    lola: lolaHere,
  });
})();
