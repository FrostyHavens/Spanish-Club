// ===== Round B: the animals of Villa Sol (ducks, hens, a fish, a frog, a rabbit, a horse, a goat) and the album =====
// Animals live on a map from its definition (maps.js):
//   animals: [{ kind: 'pato', n: 3, area: 'estanque' }, { kind: 'pez', at: 'fuentePez' }, ...]
//   area: a G.MAPDATA[map].pos tag holding [x, y, w, h] in tiles (at: a tag holding [x, y])
// Like the critters in ambient.js they are decoration: never in field.npcs, never block anyone, animate from G.frame
// (so they keep moving under a dialogue box), and use Math.random (the game's seedable dice stay untouched).
// Behaviour: ducks swim on the water of their area (the mother first, ducklings in a line behind), hens walk and peck,
// the rabbit hops about and nibbles, the horse and the goat graze in the paddock and swish their tails, the frog sits
// on a lily pad and croaks (now and then it hops to the other pad), the fish swims in the fountain and jumps out.
// A tap on one (field.js asks G.animals.hit first; people and doors still win): it reacts (a hop, a flap, the horse
// rears up, the fish jumps) with its own little sound, then the game names it: a word bubble with its picture,
// "el gato" and its sound "¡Miau!", spoken; the word and its sound word are marked seen, the album records it, and
// with the mic on a say-it-back bubble asks the child to say the name (src/world.js). The tap also walks you toward it.
// The town's other animals use the same naming: birds (pájaro), butterflies (mariposa) and the cat (gato) in
// ambient.js, and Canelo (perro) in maps.js, all through G.animals.tap(kind, ...).
//
// API (for the album screen, errands and tests):
//   G.animals.KINDS[id]       {word, sound (a word id or null), cry ('¡Miau!'), order} for the 11 animals
//   G.animals.list()          the animal ids in album order
//   G.animals.met(id)         true once the child has tapped / met it
//   G.animals.meet(id)        record it in the album (true the first time); G.state.album[id] =
//                             {first: ms timestamp, map: 'villa', n: times tapped, said: true once its name was said}
//   G.animals.tap(id, wx, wy, o)  the shared reaction for any animal at world px wx, wy (o.silent: no cry sound,
//                             o.noWalk) -> names it (G.world.name) and records the album. Returns the album record.
//   G.animals.here(f?)        the live animals on the current map: [{kind, x, y (world px, feet), st}]
//   G.animals.find(kind, f?)  the first live one of a kind, or null
//   G.animals.cry(kind)       play its sound (procedural, through the sound-effects volume)
//   G.animals.screen(a, f?)   where an animal is on screen [x, y] (game px), for tests and hints
'use strict';
(function () {
  const T = G.TILE, AN = G.animals = {};
  const rnd = n => Math.random() * n, ri = n => Math.floor(Math.random() * n);
  const OL = '#1a1420';

  // ---------- the animals ----------
  AN.KINDS = {
    perro: { word: 'perro', sound: 'guau', cry: '¡Guau, guau!' },
    gato: { word: 'gato', sound: 'miau', cry: '¡Miau!' },
    pajaro: { word: 'pajaro', sound: 'pio', cry: '¡Pío, pío!' },
    mariposa: { word: 'mariposa', sound: null, cry: null },
    pez: { word: 'pez', sound: null, cry: '¡Glu, glu!' },
    conejo: { word: 'conejo', sound: null, cry: null },
    pato: { word: 'pato', sound: 'cuac', cry: '¡Cuac, cuac!' },
    rana: { word: 'rana', sound: 'croac', cry: '¡Croac!' },
    gallina: { word: 'gallina', sound: null, cry: '¡Coc, coc!' },
    caballo: { word: 'caballo', sound: null, cry: '¡Iiijii!' },
    cabra: { word: 'cabra', sound: 'bee', cry: '¡Beee!' },
  };
  const ORDER = Object.keys(AN.KINDS);
  ORDER.forEach((k, i) => { AN.KINDS[k].order = i; });
  AN.list = () => ORDER.slice();
  const album = () => (G.state.album || (G.state.album = {}));
  AN.met = id => !!(G.state && G.state.album && G.state.album[id]);
  AN.meet = function (id) {
    if (!AN.KINDS[id] || !G.state) return false;
    const a = album(), first = !a[id];
    if (first) a[id] = { first: Date.now(), map: G.field ? G.field.mapId : null, n: 0, said: false };
    a[id].n++;
    G.st.autosave();
    return first;
  };

  // ---------- pictures: rows of letters -> palette, outlined, cached (facing right; flip for left) ----------
  function pix(id, rs, pal, flip) {
    const w = Math.max(...rs.map(r => r.length)), h = rs.length;
    rs = rs.map(r => r.padEnd(w, '.'));
    return G.cached('ani|' + id + (flip ? '|f' : ''), w + 2, h + 2, ctx => {
      const at = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return null; const c = rs[y][flip ? w - 1 - x : x]; return c === '.' ? null : c; };
      ctx.fillStyle = OL;
      for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) if (!at(x, y) && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) ctx.fillRect(x + 1, y + 1, 1, 1);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = at(x, y); if (c && pal[c]) { ctx.fillStyle = pal[c]; ctx.fillRect(x + 1, y + 1, 1, 1); } }
    });
  }
  // feet at the bottom row; every frame of a kind has the same size
  const SPR = {
    pato: { pal: { w: '#ffffff', g: '#d4d8e8', k: '#f89020', e: '#101010' },
      swim: ['......ww...', '.....wwwekk', '.....www...', 'w....wwww..', 'wwwwwwwgww.', '.wwggggww..', '..wwwwww...'],
      dip: ['...........', '...........', '...........', 'w..........', 'ww...ww....', '.wwwwwggwkk', '..wwwwwww..'],
      flap: ['g.....ww...', 'gg...wwwekk', '.gg..www...', 'w.gggwwww..', 'wwwwwwwgww.', '.wwggggww..', '..wwwwww...'] },
    patito: { pal: { y: '#f8d838', d: '#e0b020', k: '#f89020', e: '#101010' },
      swim: ['...yy..', '...yyek', 'y.yyy..', 'yyyyyy.', '.yddy..'],
      dip: ['.......', '.......', 'y......', 'yyyyyek', '.yddy..'],
      flap: ['d..yy..', 'dd.yyek', 'yddyy..', 'yyyyyy.', '.yddy..'] },
    gallina: { pal: { b: '#c87838', d: '#8a4820', c: '#e0a060', r: '#e83030', k: '#f0b040', e: '#101010', l: '#f0a030' },
      stand: ['.......rr..', '.......bbr.', '......bbek.', 'd.....bbbkk', 'dd...bbbr..', 'ddbbbbbbb..', '.dbbddbbc..', '..bbdddcc..', '...bbbbb...', '....l..l...', '...ll.ll...'],
      peck: ['...........', '...........', 'd..........', 'dd.........', 'ddbbbbb.rr.', '.dbbddbbbbr', '..bbdddcbek', '...bbbbbbrk', '....bbbbb..', '....l..l...', '...ll.ll...'],
      flap: ['.......rr..', 'd......bbr.', 'dd....bbek.', 'ddd.d.bbbkk', '.dddddbbr..', '..ddddbbb..', '.dbbddbbc..', '..bbbbbcc..', '...bbbbb...', '....l..l...', '...ll.ll...'] },
    conejo: { pal: { w: '#f4f0f6', s: '#c8c0d4', p: '#f8a0b8', k: '#201828', n: '#f070a0', t: '#ffffff' },
      sit: ['......wp...', '.....wpw.wp', '.....wpwwpw', '......wwwpw', '.....wwwww.', '....wwwwkwn', '.swwwwwwwww', 'twwwwwwwww.', 'tswwwwwww..', '.sswwswww..', '..ss..ww...'],
      hop: ['...........', '......wp.wp', '.....wpwwpw', '......wwwpw', '.....wwwwkn', '.swwwwwwwww', 'twwwwwwwww.', 'tswwwwwww..', '.ss....ww..', 'ss......ww.', '...........'],
      eat: ['...........', '...........', '......wp.wp', '.....wpwwpw', '......wwwpw', '....wwwwwww', '.swwwwwwwkw', 'twwwwwwwwwn', 'tswwwwwww..', '.sswwswww..', '..ss..ww...'] },
    caballo: { pal: { b: '#a0602c', d: '#844a20', m: '#3a2010', w: '#f0e0c8', e: '#101010', h: '#4a3020' },
      stand: ['................mm..', '...............mbb..', '..............mbbeb.', '..............mbbbbb', '.............mbbb.wb', '............mbbb....', '.mbbbbbbbbbbbbbb....', 'mmbbbbbbbbbbbbbd....', 'm.bbbbbbbbbbbbbd....', 'm.dbbbbbbbbbbbd.....', '..db.db....bd.db....', '..db.db....bd.db....', '..db.db....bd.db....', '..hh.hh....hh.hh....'],
      graze: ['....................', '....................', '....................', '....................', '....................', '.mbbbbbbbbbbbbb.....', 'mmbbbbbbbbbbbbbbm...', 'm.bbbbbbbbbbbbbbbm..', 'm.dbbbbbbbbbbbd.bbm.', '..db.db....bd.db.bbb', '..db.db....bd.db.bebb', '..db.db....bd.db..bwb', '..db.db....bd.db.....', '..hh.hh....hh.hh.....'],
      rear: ['..............mm....', '.............mbb....', '............mbbeb...', '............mbbbbb..', '...........mbbb.wb..', '..........mbbbb.....', '........bbbbbbbd....', '......bbbbbbbbbbdb..', '....mbbbbbbbbbb..db.', '...mmbbbbbbbbdb..hh.', '..m.bbbbbbdd...db...', '..m.db.db......hh...', '....db.db...........', '....hh.hh...........'] },
    cabra: { pal: { w: '#ece8e0', s: '#c8c2b6', h: '#8a7a60', e: '#201008', y: '#f0c040', p: '#d8a8a8', k: '#4a4038' },
      stand: ['.........h.h.', '..........hh.', '.........wwww', '..ww....wwwye', '.wwwwwwwwwwwp', 'wwwwwwwwwwsww', '.wwwwwwwwws.w', '.swwwwwwwss..', '..w.w...w.w..', '..w.w...w.w..', '..k.k...k.k..'],
      graze: ['.............', '.............', '.............', '..ww.........', '.wwwwwwwwwh.h', 'wwwwwwwwwwwhh', '.wwwwwwwwwwww', '.swwwwwwwswye', '..w.w...w.wwp', '..w.w...w.w.w', '..k.k...k.k..'],
      hop: ['.........h.h.', '..........hh.', '.........wwww', '..ww....wwwye', '.wwwwwwwwwwwp', 'wwwwwwwwwwsww', '.wwwwwwwwws.w', '.swwwwwwwss..', '.w..w...w..w.', 'w....w.w....w', 'k....k.k....k'] },
    rana: { pal: { g: '#58b840', d: '#3a9030', W: '#ffffff', e: '#101010', b: '#b8e890', m: '#1a5a18', p: '#f8e0a0' },
      sit: ['.gg..gg.', 'gWeggeWg', 'gggggggg', 'gmmmmmmg', 'dgbbbbgd', 'dd....dd'],
      croak: ['.gg..gg.', 'gWeggeWg', 'gggggggg', 'gmmmmmmg', 'dpppppgd', 'dppppppd', '.dd..dd.'],
      hop: ['.gg..gg.', 'gWeggeWg', 'gggggggg', 'gmmmmmmg', '.gbbbbg.', 'd.d..d.d'] },
    pez: { pal: { o: '#f88828', l: '#f8b860', e: '#101010', d: '#d06010' },
      swim: ['l..oo..', 'llooooe', 'l.dooo.'],
      jump: ['..l..', '.lol.', '.ooo.', '.ooo.', '.oeo.', '..o..'] },
  };
  const lily = ['..gggg..', '.gggggg.', 'ggggg.gg', '.gggggg.', '..gggg..'];
  const LILY_PAL = { g: '#3a9a48' };

  // ---------- little sounds (the synth's own effects are private to audio.js) ----------
  function au() { const a = G.audio; return a && a.ctx && a.sfxGain ? a : null; }
  function tone(type, f0, f1, len, vol, at = 0, o = {}) {
    const a = au(); if (!a) return;
    const ac = a.ctx, t = ac.currentTime + 0.01 + at, osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f0, t); osc.frequency.exponentialRampToValueAtTime(f1, t + len);
    let out = osc;
    if (o.filter) { const fl = ac.createBiquadFilter(); fl.type = o.filter; fl.frequency.value = o.ff || 1200; fl.Q.value = o.q || 1; osc.connect(fl); out = fl; }
    if (o.vib) { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = o.vib; lg.gain.value = o.depth || 20; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + len + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.att || 0.012));
    if (o.hold) g.gain.setValueAtTime(vol, t + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    out.connect(g); g.connect(a.sfxGain); osc.start(t); osc.stop(t + len + 0.05);
  }
  function noise(freq, len, vol, at = 0) {
    const a = au(); if (!a || !a.noise) return;
    const ac = a.ctx, t = ac.currentTime + 0.01 + at, n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    n.buffer = a.noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(f); f.connect(g); g.connect(a.sfxGain); n.start(t); n.stop(t + len + 0.05);
  }
  const CRY = {
    pato() { for (const at of [0, 0.2]) tone('sawtooth', 520, 330, 0.13, 0.12, at, { filter: 'bandpass', ff: 1300, q: 4 }); },
    gallina() { [0, 0.11, 0.22].forEach((at, i) => tone('square', 760 - i * 40, 520, 0.07, 0.05, at, { filter: 'lowpass', ff: 1800 })); },
    rana() { for (const at of [0, 0.32]) tone('sawtooth', 150, 110, 0.24, 0.12, at, { vib: 34, depth: 60, filter: 'lowpass', ff: 700 }); },
    caballo() { tone('sawtooth', 980, 520, 0.7, 0.07, 0, { vib: 16, depth: 90, filter: 'bandpass', ff: 1500, q: 2, hold: 0.4 }); },
    cabra() { tone('sawtooth', 440, 400, 0.6, 0.08, 0, { vib: 8, depth: 30, filter: 'bandpass', ff: 1000, q: 3, hold: 0.35 }); },
    conejo() { tone('sine', 380, 900, 0.12, 0.14); tone('sine', 500, 1100, 0.1, 0.08, 0.13); },
    pez() { tone('sine', 300, 1100, 0.09, 0.16); noise(1800, 0.25, 0.12, 0.05); },
    pajaro() { tone('sine', 2900, 3800, 0.06, 0.05); tone('sine', 3100, 4100, 0.06, 0.05, 0.12); },
    mariposa() { tone('sine', 1800, 2600, 0.1, 0.04); tone('sine', 2400, 3200, 0.1, 0.03, 0.08); },
    gato() { if (G.ambient && G.ambient.sfx) G.ambient.sfx.meow(); },
    perro() { if (G.ambient && G.ambient.sfx) G.ambient.sfx.yip(); },
  };
  AN.cry = kind => { try { (CRY[kind] || (() => { }))(); } catch (e) { } };

  // ---------- the shared reaction: name it, record it ----------
  AN.tap = function (kind, wx, wy, o = {}) {
    const K = AN.KINDS[kind]; if (!K) return null;
    if (!o.silent) AN.cry(kind);
    AN.meet(kind);
    if (K.sound) { if (G.vocabLog) G.vlog('tapped-object', K.sound, { via: 'animal-sound' }); G.st.see(K.sound); } // (the dev-only log, vocablog.js)
    if (G.world) G.world.name(K.word, wx, wy, { cry: K.cry, animal: kind, delay: o.silent ? 0 : 22 });
    return album()[kind];
  };

  // ---------- setting up a map ----------
  const area = (f, tag) => { const p = G.MAPDATA[f.mapId] && G.MAPDATA[f.mapId].pos[tag]; return p && p.length === 4 ? p : p ? [p[0], p[1], 1, 1] : null; };
  const LAND = '.o,=py';
  function tilesIn(f, r, ok) { const out = []; if (!r) return out; for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = r[0]; x < r[0] + r[2]; x++) if (ok(f.map.get(x, y), x, y)) out.push([x, y]); return out; }
  function setup(f) {
    const z = f.zoo = { f: G.frame, list: [], fx: [] };
    for (const c of f.def.animals || []) {
      const r = area(f, c.area || c.at); if (!r) continue;
      if (c.kind === 'pato') {
        const water = tilesIn(f, r, ch => ch === 'w'); if (!water.length) continue;
        const [x, y] = water[ri(water.length)];
        const mom = add(z, 'pato', x * T + 12, y * T + 16, { water, ducklings: [] });
        for (let i = 1; i < (c.n || 1); i++) mom.ducklings.push(add(z, 'pato', mom.x - 10 * i, mom.y, { baby: true, mom, trail: i }));
      } else if (c.kind === 'rana') {
        const water = tilesIn(f, r, ch => ch === 'w'); if (!water.length) continue;
        const pads = [water[0], water[water.length - 1]].map(([x, y], i) => [x * T + 8 + i * 8, y * T + 10 + i * 4]);
        add(z, 'rana', pads[0][0], pads[0][1], { pads, pad: 0 });
      } else if (c.kind === 'pez') {
        add(z, 'pez', r[0] * T + 12, r[1] * T + 16, { cx: r[0] * T + 12, cy: r[1] * T + 16, ang: rnd(6), next: 120 + ri(200) });
      } else {
        const ground = tilesIn(f, r, (ch, x, y) => LAND.includes(ch) && !f.exitAt(x, y));
        if (!ground.length) continue;
        for (let i = 0; i < (c.n || 1); i++) {
          const [x, y] = ground[ri(ground.length)];
          add(z, c.kind, x * T + 4 + rnd(16), y * T + 12 + rnd(10), { ground, tint: i });
        }
      }
    }
  }
  function add(z, kind, x, y, extra) {
    const a = Object.assign({ kind, x, y, z: 0, flip: ri(2) === 1, st: 'idle', t: 30 + ri(120), age: ri(100), react: 0, tx: x, ty: y, sp: 0 }, extra);
    z.list.push(a); return a;
  }
  const onTile = (a) => [Math.floor(a.x / T), Math.floor(a.y / T)];

  // ---------- one tick per game frame ----------
  function sync(f) {
    const z = f.zoo; if (!z) return;
    let n = G.frame - z.f; if (n <= 0) return;
    z.f = G.frame; if (n > 4) n = 4;
    while (n--) for (const a of z.list) tick(f, a);
    z.fx = z.fx.filter(e => ++e.t < e.life);
  }
  function goToward(a, sp) {
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
    if (d < sp) { a.x = a.tx; a.y = a.ty; return true; }
    a.x += dx / d * sp; a.y += dy / d * sp; if (Math.abs(dx) > 0.5) a.flip = dx < 0;
    return false;
  }
  function pickGround(a) { const [x, y] = a.ground[ri(a.ground.length)]; return [x * T + 4 + rnd(16), y * T + 12 + rnd(10)]; }
  function tick(f, a) {
    a.age++;
    if (a.react > 0) a.react--;
    const zf = f.zoo.fx;
    switch (a.kind) {
      case 'pato': {
        if (a.baby) { // follow the one in front, a little behind
          const lead = a.trail === 1 ? a.mom : a.mom.ducklings[a.trail - 2];
          const bx = lead.x + (lead.flip ? 11 : -11), by = lead.y + 1, d = Math.hypot(bx - a.x, by - a.y);
          if (d > 1.5) { a.tx = bx; a.ty = by; goToward(a, Math.min(0.6, d * 0.05 + 0.15)); }
          a.st = a.react ? 'flap' : a.mom.st === 'dip' && a.age % 200 < 30 ? 'dip' : 'swim';
          break;
        }
        if (a.st === 'dip') { if (--a.t <= 0) { a.st = 'idle'; a.t = 60 + ri(120); zf.push({ k: 'ring', x: a.x, y: a.y, t: 0, life: 30 }); } break; }
        if (a.st === 'swim') {
          if (goToward(a, 0.22)) { a.st = 'idle'; a.t = 40 + ri(160); }
          if (a.age % 40 === 0) zf.push({ k: 'ring', x: a.x - (a.flip ? -6 : 6), y: a.y + 1, t: 0, life: 36 });
          break;
        }
        if (--a.t <= 0) {
          if (ri(4) === 0) { a.st = 'dip'; a.t = 50; zf.push({ k: 'ring', x: a.x, y: a.y, t: 0, life: 30 }); }
          else { const [x, y] = a.water[ri(a.water.length)]; a.tx = x * T + 6 + rnd(12); a.ty = y * T + 13 + rnd(8); a.st = 'swim'; }
        }
        break;
      }
      case 'gallina': {
        if (a.st === 'walk') { if (goToward(a, 0.45)) { a.st = 'idle'; a.t = 20 + ri(60); } break; }
        if (a.st === 'peck') { if (--a.t <= 0) { a.st = 'idle'; a.t = 20 + ri(40); } break; }
        if (--a.t <= 0) {
          const r = Math.random();
          if (r < 0.5) { a.st = 'peck'; a.t = 24 + 16 * ri(3); }
          else if (r < 0.85) { [a.tx, a.ty] = pickGround(a); a.st = 'walk'; }
          else { a.flip = !a.flip; a.t = 30; }
        }
        break;
      }
      case 'conejo': {
        if (a.st === 'hop') {
          const s = ++a.h / 14; a.x = a.hx0 + (a.tx - a.hx0) * Math.min(1, s); a.y = a.hy0 + (a.ty - a.hy0) * Math.min(1, s); a.z = Math.sin(Math.min(1, s) * Math.PI) * 5;
          if (s >= 1) { a.z = 0; a.hops--; if (a.hops > 0) startHop(a, 10 + rnd(8)); else { a.st = 'idle'; a.t = 60 + ri(160); } }
          break;
        }
        if (a.st === 'eat') { if (--a.t <= 0) { a.st = 'idle'; a.t = 40 + ri(80); } break; }
        // keep away from you a little (a hop or two away when you come very close)
        const p = f.player, px = p.x * T + 12, py = p.y * T + 18;
        if (Math.hypot(px - a.x, py - a.y) < 26 && !a.react) { a.flip = px > a.x; a.hops = 2; startHop(a, 14, a.flip ? -1 : 1); break; }
        if (--a.t <= 0) { if (ri(2)) { a.st = 'eat'; a.t = 60 + ri(90); } else { a.hops = 1 + ri(3); startHop(a, 10 + rnd(8)); } }
        break;
      }
      case 'caballo': case 'cabra': {
        if (a.st === 'walk') { if (goToward(a, a.kind === 'cabra' ? 0.3 : 0.25)) { a.st = 'graze'; a.t = 120 + ri(240); } break; }
        if (--a.t <= 0) {
          if (a.st === 'graze' && ri(3)) { a.st = 'idle'; a.t = 60 + ri(120); }
          else if (ri(2)) { [a.tx, a.ty] = pickGround(a); a.st = 'walk'; }
          else { a.st = 'graze'; a.t = 120 + ri(200); }
        }
        if (a.kind === 'cabra' && a.react) a.z = Math.abs(Math.sin(a.react / 10 * Math.PI)) * 4;
        else a.z = 0;
        break;
      }
      case 'rana': {
        if (a.st === 'hop') {
          const s = ++a.h / 24, [tx, ty] = a.pads[a.pad];
          a.x = a.hx0 + (tx - a.hx0) * s; a.y = a.hy0 + (ty - a.hy0) * s; a.z = Math.sin(s * Math.PI) * 12;
          if (s >= 1) { a.z = 0; a.st = 'idle'; a.t = 90 + ri(200); zf.push({ k: 'ring', x: a.x, y: a.y + 2, t: 0, life: 30 }); }
          break;
        }
        if (a.st === 'croak') { if (--a.t <= 0) { a.st = 'idle'; a.t = 120 + ri(240); } break; }
        if (--a.t <= 0) {
          if (ri(3) === 0) { a.pad = (a.pad + 1) % a.pads.length; a.hx0 = a.x; a.hy0 = a.y; a.h = 0; a.st = 'hop'; a.flip = a.pads[a.pad][0] < a.x; }
          else { a.st = 'croak'; a.t = 40; if (visible(f, a)) CRY.rana(); }
        }
        break;
      }
      case 'pez': {
        if (a.st === 'jump') {
          const s = ++a.h / 40; a.z = Math.sin(Math.min(1, s) * Math.PI) * 18; a.x = a.cx + (s - 0.5) * 8 * (a.flip ? -1 : 1);
          if (s >= 1) { a.st = 'idle'; a.z = 0; a.next = (near(f, a, 4) ? 150 : 300) + ri(240); zf.push({ k: 'splash', x: a.x, y: a.cy - 3, t: 0, life: 24 }); zf.push({ k: 'ring', x: a.x, y: a.cy - 3, t: 0, life: 30 }); }
          break;
        }
        a.ang += 0.03; a.x = a.cx + Math.cos(a.ang) * 5.5; a.y = a.cy + Math.sin(a.ang) * 1.5; a.flip = Math.sin(a.ang) > 0;
        if (--a.next <= 0) AN.jump(a, f);
        break;
      }
    }
  }
  function startHop(a, dist, dir) {
    const d = dir || (ri(2) ? 1 : -1), dy = rnd(8) - 4;
    let tx = a.x + d * dist, ty = a.y + dy;
    const t = a.ground.some(([x, y]) => x === Math.floor(tx / T) && y === Math.floor(ty / T));
    if (!t) { tx = a.x - d * dist; ty = a.y - dy; if (!a.ground.some(([x, y]) => x === Math.floor(tx / T) && y === Math.floor(ty / T))) { [tx, ty] = pickGround(a); } }
    a.flip = tx < a.x; a.hx0 = a.x; a.hy0 = a.y; a.tx = tx; a.ty = ty; a.h = 0; a.st = 'hop';
  }
  AN.jump = function (a, f) { if (a.st === 'jump') return; a.st = 'jump'; a.h = 0; a.cx = a.x; a.flip = ri(2) === 1; (f || G.field).zoo.fx.push({ k: 'splash', x: a.x, y: a.cy - 3, t: 0, life: 20 }); if (visible(f || G.field, a)) CRY.pez(); };
  const near = (f, a, tiles) => Math.abs(f.player.x * T + 12 - a.x) + Math.abs(f.player.y * T + 12 - a.y) < tiles * T;
  function visible(f, a) { const x = a.x - f.cam.x, y = a.y - f.cam.y; return x > -16 && x < G.W + 16 && y > -16 && y < G.H + 16; }

  // ---------- reacting to a tap ----------
  function react(f, a) {
    const p = f.player;
    a.react = 40;
    if (a.kind !== 'pez' && a.kind !== 'rana') a.flip = p.x * T + 12 < a.x;
    if (a.kind === 'pez') AN.jump(a, f);
    else if (a.kind === 'rana') { a.pad = (a.pad + 1) % a.pads.length; a.hx0 = a.x; a.hy0 = a.y; a.h = 0; a.st = 'hop'; }
    else if (a.kind === 'conejo') { a.hops = 1; a.st = 'idle'; startHop(a, 4, a.flip ? -1 : 1); a.tx = a.x; a.ty = a.y; }
    else if (a.kind === 'caballo') { a.st = 'idle'; a.t = 70; a.react = 60; }
    else if (a.kind === 'gallina' || a.kind === 'pato') { if (a.st !== 'swim') a.st = 'idle'; a.t = Math.max(a.t, 40); }
    f.zoo.fx.push({ k: 'heart', x: a.x + (a.flip ? -8 : 8), y: a.y - frameOf(a).height + 4, t: 0, life: 50 });
  }
  // the animal under a tap (world px), nearest first; generous areas for small fingers
  AN.hit = function (f, tap) {
    if (!f.zoo) return null;
    const wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y);
    let best = null, bd = 1e9;
    for (const a of f.zoo.list) {
      if (a.kind === 'pez' && a.st !== 'jump') continue; // the fish only while it jumps (the fountain names itself)
      const img = frameOf(a), w = Math.max(20, img.width + 6), h = Math.max(20, img.height + 6), cy = a.y - a.z - img.height / 2;
      const dx = Math.abs(wx - a.x), dy = Math.abs(wy - cy);
      if (dx <= w / 2 && dy <= h / 2 && dx + dy < bd) { best = a; bd = dx + dy; }
    }
    return best;
  };
  // field.js: a tap landed on an animal -> its reaction and its name; the tap walks you toward it
  AN.tapped = function (f, a) {
    react(f, a);
    AN.tap(a.kind, a.x, a.y - a.z - frameOf(a).height, {});
    const [x, y] = onTile(a);
    return { x, y, animal: a.kind };
  };

  // ---------- drawing ----------
  function frameOf(a) {
    const S = SPR[a.baby ? 'patito' : a.kind], R = a.react > 0;
    let fr;
    switch (a.kind) {
      case 'pato': fr = R && (a.react >> 3) & 1 ? 'flap' : a.st === 'dip' ? 'dip' : 'swim'; break;
      case 'gallina': fr = R ? ((a.react >> 2) & 1 ? 'flap' : 'stand') : a.st === 'peck' && (a.t >> 3) & 1 ? 'peck' : 'stand'; break;
      case 'conejo': fr = a.st === 'hop' ? 'hop' : a.st === 'eat' && (a.t >> 4) & 1 ? 'eat' : 'sit'; break;
      case 'caballo': fr = R ? 'rear' : a.st === 'graze' ? 'graze' : 'stand'; break;
      case 'cabra': fr = R ? 'hop' : a.st === 'graze' ? 'graze' : 'stand'; break;
      case 'rana': fr = a.st === 'hop' ? 'hop' : a.st === 'croak' && (a.t >> 3) & 1 ? 'croak' : 'sit'; break;
      case 'pez': fr = a.st === 'jump' ? 'jump' : 'swim'; break;
    }
    const pal = a.kind === 'gallina' && a.tint ? Object.assign({}, S.pal, { b: '#f4f0e8', c: '#ffffff', d: '#d0c8c0' }) : S.pal;
    return pix((a.baby ? 'patito' : a.kind) + fr + (a.tint && a.kind === 'gallina' ? 'w' : ''), S[fr], pal, a.flip);
  }
  function drawOne(ctx, a, cx, cy) {
    const img = frameOf(a), x = Math.round(a.x - img.width / 2 - cx), y = Math.round(a.y - img.height - a.z - cy);
    if (a.kind === 'caballo' || a.kind === 'cabra') { // a swishing tail: one pixel that moves
      const sw = (a.age >> 4) & 1;
      ctx.drawImage(img, x, y);
      if (a.st !== 'idle' || sw) { ctx.fillStyle = a.kind === 'caballo' ? '#3a2010' : '#ece8e0'; const tx = a.flip ? x + img.width - 2 : x + 1; ctx.fillRect(tx + (sw ? (a.flip ? 1 : -1) : 0), y + Math.round(img.height * 0.55), 1, 3); }
      return;
    }
    ctx.drawImage(img, x, y);
  }
  // field.js: everything drawn on the ground / water (before people), and land animals sorted in with the people
  AN.draw = function (f, ctx, layer) {
    const z = f.zoo; if (!z) return;
    sync(f);
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (layer !== 'ground') return;
    for (const a of z.list) { // shadows; lily pads; ripples; swimmers and the fountain's fish
      if (a.kind === 'rana') for (const [px, py] of a.pads) ctx.drawImage(pix('lily', lily, LILY_PAL), Math.round(px - 5 - cx), Math.round(py - 4 - cy));
    }
    for (const e of z.fx) if (e.k === 'ring') {
      const k = e.t / e.life, r = 3 + k * 7;
      ctx.globalAlpha = (1 - k) * 0.8; ctx.strokeStyle = '#d8f0ff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(Math.round(e.x - cx) + 0.5, Math.round(e.y - cy) + 0.5, r, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    for (const a of z.list) {
      if (a.kind === 'pato' || a.kind === 'rana' || (a.kind === 'pez' && a.st !== 'jump')) {
        if (a.kind === 'pez') { ctx.globalAlpha = 0.85; drawOne(ctx, a, cx, cy); ctx.globalAlpha = 1; } else drawOne(ctx, a, cx, cy);
      } else if (a.kind !== 'pez') { // a soft shadow under land animals
        const w = a.kind === 'caballo' ? 16 : a.kind === 'cabra' ? 10 : 7;
        ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(Math.round(a.x - w / 2 - cx), Math.round(a.y - cy) - 1, w, 2);
      }
    }
  };
  // land animals and the jumping fish, for field.js to draw in order with the people: [{sy, draw(ctx, cx, cy)}]
  AN.ents = function (f) {
    const z = f.zoo; if (!z) return [];
    return z.list.filter(a => a.kind !== 'pato' && a.kind !== 'rana' && (a.kind !== 'pez' || a.st === 'jump'))
      .map(a => ({ sy: a.kind === 'pez' ? a.y + 8 : a.y - 21, draw: (ctx, cx, cy) => drawOne(ctx, a, cx, cy) }));
  };
  // hearts and splashes above everything on the map
  AN.drawTop = function (f, ctx) {
    const z = f.zoo; if (!z) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const e of z.fx) {
      const k = e.t / e.life, x = Math.round(e.x - cx), y = Math.round(e.y - cy);
      if (e.k === 'heart') { ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; G.text(ctx, '\u0003', x - 2, y - Math.round(e.t * 0.35), '#f04878', '#401020'); ctx.globalAlpha = 1; }
      else if (e.k === 'splash') {
        ctx.fillStyle = '#e8f8ff';
        for (let i = 0; i < 5; i++) { const ang = Math.PI * (0.15 + i * 0.175), r = k * 9; ctx.fillRect(Math.round(x + Math.cos(ang) * r), Math.round(y - Math.sin(ang) * r * 1.4 + k * k * 8), 1, 1); }
      }
    }
  };

  // ---------- hooks and lookups ----------
  AN.update = function (f) { if (!f.zoo) setup(f); sync(f); };
  AN.here = function (f) { f = f || G.field; if (!f) return []; if (!f.zoo) setup(f); return f.zoo.list.map(a => ({ kind: a.kind, x: a.x, y: a.y, st: a.st, baby: !!a.baby })); };
  AN.find = function (kind, f) { f = f || G.field; if (!f) return null; if (!f.zoo) setup(f); return f.zoo.list.find(a => a.kind === kind && !a.baby) || null; };
  AN.screen = function (a, f) { f = f || G.field; const img = frameOf(a); return [a.x - Math.round(f.cam.x), a.y - a.z - img.height / 2 - Math.round(f.cam.y)]; };
  AN.sheet = SPR; // the pictures, for tools
  AN.react = react; // its reaction to a tap, without the naming (errands.js: counting, the sound game)
  AN.frame = frameOf;
})();
