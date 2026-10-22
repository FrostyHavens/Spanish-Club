// ===== El parque de juegos: the zone west of Villa Sol (docs/WORLD_PLAN.md) — action words =====
// Its path from Villa Sol (a meadow, a bench, rabbits) and one big park: the fenced playground (swings, a slide, a
// climbing frame by a tall tree, a seesaw, a merry-go-round, a sandbox with a little sandcastle), the kite hill, the
// little soccer field, a pond with ducks and rocks where lizards sun, the dog's jumping course, a garden with a
// fountain, benches and flower beds, Don Chuy's bubble cart by the path. At night the lamps glow and crickets sing.
// The heart of it is Total Physical Response: the child SAYS (or taps) an action word and someone DOES it: her own
// character, the kids, the dog (G.juegos.act / .all / .tpr). Tap yourself here: "¿Qué hago?", and you do it.
// Everything only uses universal words and the park's own (each met here in a one-unknown puzzle, G.zones.meetW and
// G.intro.watch, and used again right away), so the park can be the very first place a child explores.
//   The album (8): la paloma (by the fountain; flies off), la catarina (on the flowers; opens its wings), la hormiga (a
//     line of ants marching by the benches), la abeja (buzzing at the flowers), la lagartija (on the rocks by the
//     pond; dashes), la lombriz (pops out of the sandbox), el grillo (rare: at night on the kite hill), el colibrí
//     (rare: in the morning, at the flowers). Tapping one whose word isn't met yet: Lola calls out its name.
//   The story (its quest line, 'juegos'): 1 ¡Simón dice! (corre, salta, gira, baila: Ana and Pablo show each action,
//     then everyone does it; then YOU are Simón), 2 El papalote de Pablo (papalote, sube, baja, rápido, despacio: the
//     kite is stuck in the tall tree: climb the frame for it; then on the hill run fast and it flies), 3 ¡A los juegos!
//     (resbaladilla, columpio, empuja, subibaja: the slide, push Pablo on the swing, the seesaw with Ana).
//   Side quests (G.state.juegos): Ana's jump rope (la cuerda: say ¡salta! and count the jumps), Simón dice again,
//     Pablo's ball (lanza, atrapa: throw it, catch it, then the dog leaps for it), Don Chuy's bubbles (las burbujas:
//     catch six; then a bubble wand of your own: bubbles trail from it wherever you go). The playground is to play on:
//     tap the swings, the slide, the frame, the seesaw, the merry-go-round. The dog digs in the sandbox (a ball), runs
//     his jumping course, chases the pigeons. Nico's hide-and-seek has six park hiding places. Three page puzzles.
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
  const here = f => !!f && f.mapId === 'juegos';
  const JG = G.juegos = {};

  // ---------- the path from Villa Sol: a meadow with flowers, a bench, rabbits and sticks to throw ----------
  G.maps.camino_juegos = {
    name: 'El camino al parque de juegos', icon: 'juegos', rows: MD.camino_juegos.rows, music: 'field',
    exits: [Z.edge(29, 6, 'villa', 1, 14, 'right'), Z.edge(0, 6, 'juegos', 38, 13, 'left')],
    posts: [{ at: P('camino_juegos', 'postE'), zone: 'villa', dir: 'right' }, { at: P('camino_juegos', 'postW'), zone: 'juegos', dir: 'left' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'conejo', n: 2, area: 'conejos' }],
    things: {},
    npcs: [K.canelo(27, 6)],
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
  AN.addKind('paloma', { word: 'paloma', cry: '¡Currucucú!', move: 'fly', speed: 0.35, shadow: 9,
    sfx: () => { tone('sine', 420, 360, 0.22, 0.09, 0, { vib: 9, depth: 25 }); tone('sine', 400, 330, 0.3, 0.08, 0.26, { vib: 9, depth: 25 }); },
    spr: pad({ pal: { g: '#a8acc0', d: '#6a6e84', n: '#58a088', p: '#8868b0', e: '#101010', w: '#e8dcd0', f: '#f08090', l: '#c8ccdc' },
      stand: ['.........ggg..', '........ggeww.', '........gnn...', '...gggggnpg...', 'ddglllgggggg..', '.ddgdddgggg...', '...ggggggg....', '.....f..f.....', '....ff.ff.....'],
      walk: ['.........ggg..', '........ggeww.', '........gnn...', '...gggggnpg...', 'ddglllgggggg..', '.ddgdddgggg...', '...ggggggg....', '....f....f....', '...ff....ff...'],
      peck: ['..............', '..............', '..............', '...ggggg......', 'ddglllggggg...', '.ddgdddggnngg.', '...gggggggpgew', '.....f..f..gg.', '....ff.ff.....'],
      fly: ['.....dd.......', '....ddd.......', '...dddgg..gg..', '..ddgggg.geww.', 'ddgggggggnn...', '.ddgggggggp...', '...ggggggg....', '..............', '..............'],
      fly2: ['..............', '..............', '..........gg..', '.........geww.', 'ddgggggggnn...', '.ddgggggggp...', '...gdddggg....', '....ddd.......', '.....d........'] }) });
  AN.addKind('catarina', { word: 'catarina', cry: null, move: 'crawl', speed: 0.1, shadow: 5,
    sfx: () => { tone('sine', 1800, 2400, 0.08, 0.04); tone('sine', 2200, 2800, 0.08, 0.03, 0.09); },
    spr: pad({ pal: { r: '#e02828', k: '#202020', w: '#e8f4ff', h: '#f87070' },
      walk: ['..rrrr...', '.rkhrkr..', 'rrrrrrrkk', 'rkrrrkrkk', '.k.k.k...'],
      walk2: ['..rrrr...', '.rkhrkr..', 'rrrrrrrkk', 'rkrrrkrkk', '..k.k.k..'],
      hide: ['w......w.', 'ww.rr.ww.', '.wrkrrkw.', '.rrrrrrkk', '..k.k.k..'] }) });
  AN.addKind('hormiga', { word: 'hormiga', cry: null, move: 'march', speed: 0.32, shadow: 4,
    sfx: () => { for (const at of [0, 0.05, 0.1]) tone('square', 3000, 2600, 0.025, 0.02, at); },
    spr: pad({ pal: { k: '#4a2418', h: '#a86048' },
      stand: ['.....k', 'hk.kkh', '.k.k.k'],
      walk: ['.....k', 'hk.kkh', 'k.k.k.'] }) });
  AN.addKind('abeja', { word: 'abeja', cry: '¡Bzzz!', move: 'flit', speed: 0.35, shadow: 0,
    sfx: () => { tone('sawtooth', 220, 240, 0.45, 0.05, 0, { vib: 40, depth: 30, filter: 'lowpass', ff: 900 }); },
    spr: pad({ pal: { y: '#f8c820', b: '#302020', w: '#e0f4ff' },
      stand: ['..ww.ww.', '..wwwww.', '.ybyybbb', 'ybbyybyb', '.ybbyyb.'],
      alt: ['...w..w.', '.wwwwww.', '.ybyybbb', 'ybbyybyb', '.ybbyyb.'] }) });
  AN.addKind('lagartija', { word: 'lagartija', cry: null, move: 'scuttle', speed: 0.8, shadow: 10,
    sfx: () => { noise(4200, 0.06, 0.05); noise(3600, 0.05, 0.04, 0.08); },
    spr: pad({ pal: { g: '#78b040', d: '#4a8028', e: '#101010', l: '#a8d870' },
      stand: ['..........ggg.', 'gdddgglllgegg.', '....g.g..g.g..'],
      walk: ['..........ggg.', 'gdddgglllgegg.', '...g...g.g...g'],
      snap: ['...........gg.', '..........gegg', 'gdddgglllgg...', '....g.g..g.g..'] }) });
  AN.addKind('lombriz', { word: 'lombriz', cry: null, move: 'still', shadow: 0,
    sfx: () => { tone('sine', 300, 600, 0.15, 0.06); },
    spr: pad({ pal: { p: '#f08898', d: '#7a4a20', k: '#101010', s: '#d06878' },
      stand: ['..p..', '.pk..', '.pp..', '..ps.', '..pp.', '.psp.', 'ddddd'],
      alt: ['.....', '..p..', '..kp.', '.ps..', '.pp..', '.ppp.', 'ddddd'] }) });
  AN.addKind('grillo', { word: 'grillo', cry: '¡Cri, cri!', move: 'hop', speed: 0.3, shadow: 6,
    sfx: () => { for (const at of [0, 0.09, 0.18, 0.5, 0.59, 0.68]) tone('square', 4300, 4100, 0.05, 0.025, at, { filter: 'bandpass', ff: 4200, q: 6 }); },
    spr: pad({ pal: { g: '#58a038', l: '#3a7a28', e: '#101010', a: '#3a7a28', w: '#c8e8a8' },
      stand: ['..ll.....a.', '.l..l...a..', 'gggggggge..', '.ggggggg...', 'l.l...l.l..'],
      hop: ['.........a.', '........a..', '.gggggggge.', 'lggggggg...', 'l.......l..'],
      chirp: ['..ll.....a.', '.lwwl...a..', 'gwwwggggge.', '.ggggggg...', 'l.l...l.l..'] }) });
  AN.addKind('colibri', { word: 'colibri', cry: '¡Pi, pi!', move: 'flit', speed: 0.5, shadow: 0,
    sfx: () => { tone('sine', 3200, 3600, 0.05, 0.04); tone('sine', 3400, 3800, 0.05, 0.04, 0.08); noise(800, 0.3, 0.03, 0.1); },
    spr: pad({ pal: { g: '#38b068', r: '#e02848', e: '#101010', k: '#302020', w: '#d8f4ff' },
      stand: ['..ww.......', '.wwww......', '..wgggg....', '...ggegkkkk', '...ggrg....', '..ggg......', '.gg........'],
      alt: ['...........', '...........', '...gggg....', '..wggegkkkk', '.wwwgrg....', '..wgg......', '.gg........'] }) });
  const KINDS = ['paloma', 'catarina', 'hormiga', 'abeja', 'lagartija', 'lombriz', 'grillo', 'colibri'];
  const EN = { paloma: 'A pigeon!', catarina: 'A ladybug!', hormiga: 'Ants!', abeja: 'A bee!', lagartija: 'A lizard!', lombriz: 'A worm!', grillo: 'A cricket!', colibri: 'A hummingbird!' };
  JG.KINDS = KINDS;

  // =====================================================================
  //  Saved state of the park's side quests: G.state.juegos
  // =====================================================================
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.juegos)) s.juegos = {};
    const j = s.juegos; for (const k of ['rope', 'simon', 'ball', 'bub', 'rides']) if (!isObj(j[k])) j[k] = {};
    return j;
  }
  JG.state = () => (G.state ? st() : null);
  const daily = k => { const o = st()[k]; if (o.d !== day()) { for (const x in o) delete o[x]; o.d = day(); } return o; };
  const held = () => (G.carry ? G.carry.held() : null);
  const bag = () => G.errands.bag;
  const othersFor = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== id).slice(0, 2);
  const quiz = (who, prompt, en, answer, others, o) => ask(who, prompt, en, answer, others.filter(k => k !== answer && met(k)).slice(0, 2), o || {});

  // =====================================================================
  //  ACTIONS: someone does an action word (the player, a kid, the dog) — the park's core (Total Physical Response)
  // =====================================================================
  // e.act = {k, f0, len, sp (speed: rápido 0.6, despacio 1.8), D, sx, sy (corre: how far, which way)}; drawn by
  // drawPerson (each person here gets it as drawSelf) as offsets, squash, arms and a ball, from G.frame.
  JG.VERBS = ['corre', 'salta', 'gira', 'baila', 'sube', 'baja', 'empuja', 'lanza', 'atrapa'];
  const CLASH = { baja: ['baila'], baila: ['baja'] }; // (sounding alike: never on the same question)
  const LEN = { corre: 92, salta: 56, gira: 62, baila: 84, sube: 50, baja: 44, empuja: 48, lanza: 48, atrapa: 58 };
  const DOGK = { corre: 'come', salta: 'jump', gira: 'spin', baila: 'dance', sube: 'jump', baja: 'sit', empuja: 'paw', lanza: 'paw', atrapa: 'jump' };
  const ease = u => 1 - (1 - u) * (1 - u);
  const puff = (k, x, y, o) => CK.puff(k, x, y, o);
  function room(f, e, dx, dy, max) { let k = 0; while (k < max) { const x = e.x + dx * (k + 1), y = e.y + dy * (k + 1); const t = G.TERRAIN[f.map.get(x, y)] || G.TERRAIN['.']; if (x < 1 || y < 1 || x >= f.map.w - 1 || y >= f.map.h - 1 || t.block || t.wall) break; k++; } return k; }
  JG.start = function (f, e, k, o = {}) {
    const sp = o.speed === 'rapido' ? 0.55 : o.speed === 'despacio' ? 1.9 : 1;
    const a = { k, f0: G.frame, len: Math.round((LEN[k] || 50) * (k === 'corre' ? sp : 1)), sp, ev: {}, o };
    if (k === 'corre') {
      let dx = room(f, e, 1, 0, 3) >= room(f, e, -1, 0, 3) ? 1 : -1, dy = 0, r = room(f, e, dx, 0, 3);
      if (r < 1) { dx = 0; dy = room(f, e, 0, 1, 3) >= room(f, e, 0, -1, 3) ? 1 : -1; r = room(f, e, 0, dy, 3); }
      a.sx = dx; a.sy = dy; a.D = Math.max(0.5, Math.min(o.speed === 'despacio' ? 1.5 : 3, r)) * TL;
    }
    if (k === 'lanza' || k === 'atrapa') { const d = G.DIRS[e.dir] || [1, 0]; a.bx = d[0] * TL * 3; a.by = d[1] * TL * 3; }
    e.act = a; hook(e); return a;
  };
  JG.act = function* (f, e, k, o) { const a = JG.start(f, e, k, o); while (e.act === a && G.frame - a.f0 < a.len) yield 1; if (e.act === a) e.act = null; };
  const busyNow = e => !!(e.act && G.frame - e.act.f0 < e.act.len);
  // the pose of a person at frame t of an action: world-px offsets from where they stand, height, squash, arms
  function pose(e, a, t) {
    const o = { dx: 0, dy: 0, z: 0, sx: 1, sy: 1, rot: 0, dir: e.dir, fr: (G.frame >> 4) & 1, arms: null, ball: null };
    const ev = (at, fn) => { if (t >= at && !a.ev[at]) { a.ev[at] = 1; fn(); } };
    const wx = e.x * TL + 12 + (e.ox || 0), wy = e.y * TL + 21 + (e.oy || 0), L = a.len;
    switch (a.k) {
      case 'corre': { // off along the roomier side and back, legs going, dust
        const D = a.D, out = L * 0.42, back = L * 0.88, side = a.sx ? (a.sx > 0 ? 'right' : 'left') : (a.sy > 0 ? 'down' : 'up'), opp = { right: 'left', left: 'right', up: 'down', down: 'up' }[side];
        const fast = a.sp < 1, slow = a.sp > 1;
        if (t < out) { const u = ease(t / out); o.dx = a.sx * D * u; o.dy = a.sy * D * u; o.dir = side; }
        else if (t < back) { const u = (t - out) / (back - out); o.dx = a.sx * D * (1 - u); o.dy = a.sy * D * (1 - u); o.dir = opp; }
        else o.dir = 'down';
        if (t < back) { o.fr = slow ? (t >> 4) & 1 : fast ? (t >> 1) & 1 : (t >> 2) & 1; o.z = slow ? 0 : Math.abs(Math.sin(t / (fast ? 2 : 3))) * (fast ? 3 : 2); o.rot = slow ? 0 : (o.dir === 'right' ? 0.12 : o.dir === 'left' ? -0.12 : 0) * (fast ? 1.6 : 1); }
        if (t < back && t % (fast ? 3 : slow ? 14 : 6) === 0) puff('dust', wx + o.dx, wy + o.dy, { life: 18, vy: -0.2, vx: -a.sx * 0.4 });
        break;
      }
      case 'salta': { // crouch, a big jump, land
        if (t < 10) { o.sy = 1 - 0.2 * (t / 10); o.sx = 1 + 0.1 * (t / 10); }
        else if (t < 40) { const u = (t - 10) / 30; o.z = Math.sin(u * Math.PI) * 22; o.sy = 1.08; o.sx = 0.94; o.arms = 'up'; }
        else if (t < 52) { const u = (t - 40) / 12; o.sy = 1 - 0.18 * Math.sin(u * Math.PI); o.sx = 1 + 0.1 * Math.sin(u * Math.PI); }
        o.dir = 'down';
        ev(10, () => G.audio.sfx('swing')); ev(40, () => { G.audio.sfx('bounce'); for (let i = 0; i < 4; i++) puff('dust', wx + (i - 1.5) * 5, wy, { life: 20, vx: (i - 1.5) * 0.4, vy: -0.25 }); });
        break;
      }
      case 'gira': { // round and round, sparkles
        const DIRS = ['down', 'right', 'up', 'left'];
        if (t < 52) { o.dir = DIRS[Math.floor(t / 4) % 4]; o.z = Math.abs(Math.sin(t / 4 * Math.PI)) * 2; o.arms = 'out'; if (t % 6 === 0) puff('spark', wx + Math.cos(t / 3) * 14, wy - 10 + Math.sin(t / 3) * 5, { life: 18 }); }
        else o.dir = 'down';
        break;
      }
      case 'baila': { // hop from foot to foot, arms waving, music notes
        o.dir = (t >> 3) & 1 ? 'left' : 'right'; if (t > L - 14) o.dir = 'down';
        o.z = Math.abs(Math.sin(t / 8 * Math.PI)) * 4; o.rot = Math.sin(t / 8 * Math.PI) * 0.12; o.arms = (t >> 3) & 1 ? 'up' : 'wave';
        if (t % 16 === 0) { puff('spark', wx + (Math.random() - 0.5) * 22, wy - 24, { life: 22, vy: -0.6 }); G.audio.sfx('select'); }
        break;
      }
      case 'sube': { // stretch up tall, arms up, onto tiptoes (on the playground: climbing, see the rides)
        const q = t < 14 ? t / 14 : t < L - 10 ? 1 : (L - t) / 10;
        o.sy = 1 + 0.16 * q; o.sx = 1 - 0.06 * q; o.z = 4 * q; o.arms = 'up'; o.dir = 'down';
        ev(2, () => G.audio.sfx('cursor'));
        break;
      }
      case 'baja': { // crouch down low
        const q = t < 10 ? t / 10 : t < L - 10 ? 1 : (L - t) / 10;
        o.sy = 1 - 0.3 * q; o.sx = 1 + 0.14 * q; o.dir = 'down';
        ev(2, () => G.audio.sfx('boop'));
        break;
      }
      case 'empuja': { // lean in and push, twice
        const q = Math.abs(Math.sin(t / L * Math.PI * 2));
        const d = G.DIRS[e.dir] || [0, 1]; o.dx = d[0] * 4 * q; o.dy = d[1] * 3 * q; o.rot = d[0] * 0.22 * q; o.arms = 'push';
        if (t === Math.round(L / 4) || t === Math.round(L * 3 / 4)) { G.audio.sfx('swing'); puff('dust', wx + d[0] * 10, wy, { life: 16, vy: -0.3 }); }
        break;
      }
      case 'lanza': { // wind up, throw: the ball flies off in an arc
        o.arms = t < 14 ? 'wind' : 'throw';
        if (t >= 14) { const u = Math.min(1, (t - 14) / (L - 14)); o.ball = [a.bx * u, a.by * u - 8, 14 + Math.sin(u * Math.PI) * 26 - u * 14]; }
        else o.ball = [-4, -6, 16];
        ev(14, () => G.audio.sfx('swing'));
        break;
      }
      case 'atrapa': { // arms up: a ball drops in from above, caught
        o.arms = 'up'; o.dir = 'down';
        const u = Math.min(1, t / 36); o.ball = [0, 0, 60 * (1 - u) + 24]; if (t >= 36) { o.ball = [0, 0, 22]; o.sy = t < 44 ? 0.9 : 1; }
        ev(36, () => { G.audio.sfx('chime'); puff('spark', wx, wy - 26, { life: 20 }); });
        break;
      }
    }
    if (a.o && a.o.noBall) o.ball = null; // (a ball flying of its own: JG.ball)
    return o;
  }
  // a person riding the playground (e.ride, see RIDES below) or idling there (e.idle()): an absolute pose
  // {wx, wy (feet, world px), z, sx, sy, rot, dir, fr, arms, noShadow}
  const skinOf = e => (e === (G.field && G.field.player) ? (G.st.playerSpec().map || {}).skin : (e.spec || {}).skin) || '#f0c8a0';
  const OLC = '#1a1420';
  function arm(ctx, x0, y0, x1, y1, col) {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (const [c, s, d] of [[OLC, 4, -1], [col, 2, 0]]) { ctx.fillStyle = c; for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n) + d, Math.round(y0 + (y1 - y0) * i / n) + d, s, s); }
  }
  const ARMS = { // shoulder -> hand, relative to the feet (x: the person's right is +x)
    up: [[-4, -12, -8, -21], [3, -12, 7, -21]], out: [[-4, -12, -11, -12], [3, -12, 10, -12]], wave: [[-4, -12, -9, -8], [3, -12, 8, -20]],
    push: [[-4, -12, -9, -11], [3, -12, 9, -11]], rope: [[-4, -12, -9, -8], [3, -12, 8, -8]], wind: [[3, -12, 8, -18]], throw: [[3, -12, 9, -20]], hold: [[-4, -12, -6, -19], [3, -12, 5, -19]],
  };
  function drawPerson(ctx, cx, cy) {
    const e = this, f = G.field; if (!f) return false;
    let o = null;
    const a = busyNow(e) ? e.act : null;
    if (a) { const r = pose(e, a, G.frame - a.f0); o = Object.assign(r, { wx: e.x * TL + 12 + (e.ox || 0) + r.dx, wy: e.y * TL + 21 + (e.oy || 0) + r.dy }); }
    else if (e.ride) o = ridePose(f, e, e.ride);
    else if (e.idle) o = e.idle(f, e);
    if (!o) return false;
    const x = Math.round(o.wx - cx), y = Math.round(o.wy - cy);
    if (!o.noShadow) { ctx.fillStyle = 'rgba(16,28,8,0.3)'; const sw = Math.max(6, 14 - (o.z || 0) / 2); ctx.fillRect(Math.round(x - sw / 2), y, Math.round(sw), 2); }
    const img = G.unitSprite(e.spec, o.dir || 'down', o.fr || 0);
    ctx.save(); ctx.translate(x, y - Math.round(o.z || 0)); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.sx || 1, o.sy || 1);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -12, -24);
    if (o.arms && ARMS[o.arms]) { const flip = o.dir === 'left' ? -1 : 1, sk = skinOf(e); for (const [a0, b0, a1, b1] of ARMS[o.arms]) arm(ctx, a0 * flip, b0, a1 * flip, b1, sk); }
    ctx.restore();
    if (o.ball) { const [bx, by, bz] = o.ball; drawBall(ctx, x + bx, y + by - bz, bz > 2 ? [x + bx, y + by] : null); }
    if (o.after) o.after(ctx, x, y);
    return true;
  }
  function drawBall(ctx, x, y, shadow, col) {
    x = Math.round(x); y = Math.round(y);
    if (shadow) { ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(shadow[0] - 2, shadow[1] - 1, 5, 2); }
    ctx.fillStyle = OLC; ctx.fillRect(x - 3, y - 2, 7, 5); ctx.fillRect(x - 2, y - 3, 5, 7);
    ctx.fillStyle = col || '#f8d040'; ctx.fillRect(x - 2, y - 2, 5, 5); ctx.fillRect(x - 3, y - 1, 7, 3);
    ctx.fillStyle = '#e04040'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 2, 1, 1);
  }
  JG.drawBall = drawBall;
  function hook(e) { if (e && !e.drawSelf) e.drawSelf = drawPerson; }
  // everyone here does it at once: you, the kids near you, the dog -> waits until it's over; the word is said
  const KIDS = ['ana', 'pablo', 'nico', 'lola'];
  JG.all = function* (f, k, o = {}) {
    const p = f.player, near = n => Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 8;
    const who = [p].concat(o.me ? [] : KIDS.map(id => npcAt(f, id)).filter(n => n && near(n) && !n.ride && !n.busy && !n.moving));
    const acts = who.map(e => [e, JG.start(f, e, k, o)]);
    const dog = G.pet && G.pet.mine() ? G.pet.npc(f) : null;
    if (dog && !dog.hidden && near(dog) && DOGK[k] && !dog.moving) G.pet.anim(dog, DOGK[k]);
    if (met(k)) { G.fx.say('¡' + G.baseForm(k)[0].toUpperCase() + G.baseForm(k).slice(1) + '!', p.x * TL + 12 - Math.round(f.cam.x), p.y * TL - 22 - Math.round(f.cam.y), '#f8e060', true); G.speak('¡' + G.baseForm(k) + '!'); }
    while (acts.some(([e, a]) => e.act === a && G.frame - a.f0 < a.len)) yield 1;
    for (const [e, a] of acts) if (e.act === a) e.act = null;
    if (dog && dog.pa) while (dog.pa && G.frame - dog.pa.f0 < dog.pa.len) yield 1;
  };
  // the other action words for a question about id: met ones, never two that sound alike
  JG.verbsFor = function (id, n = 2) { const L = JG.VERBS.filter(k => k !== id && met(k) && !(CLASH[id] || []).includes(k)).sort(() => G.rand() - 0.5); return L.slice(0, n); };
  // ONE action word, TPR: the child says it (or taps it) and then it HAPPENS. o: who (talking), prompt, en, demo
  // (generator: someone shows it first, while the word is new; default: the speaker does it where they stand), act
  // (generator: what happens after the child said it; default: you do it), ask / askEn (the question once it's met),
  // show (a picture over that question: the situation), known (the other cards while it's new)
  JG.tpr = function* (id, o = {}) {
    const f = G.field;
    const act = o.act || (function* () { yield* JG.all(f, id, { me: true }); });
    const demo = o.demo || (function* () { const n = npcAt(f, o.who); if (n) yield* JG.act(f, n, id); else yield 20; });
    if (!met(id)) {
      let k = 0;
      yield* G.intro.watch(id, { who: o.who, prompt: o.prompt || G.requests.LINES.un(id), en: o.en || 'Watch!', known: o.known || othersFor(id, ['pelota', 'columpio', 'papalote', 'arbol', 'flor', 'perro']),
        act: function* () { k++; if (k === 1) yield* demo(); else yield* act(); } });
      if (k < 2) yield* act();
      return true;
    }
    yield* ask(o.who, o.ask || '¿Qué hago?', o.askEn || 'What do I do? (say it, or tap it)', id, JG.verbsFor(id), o.show ? { show: o.show } : {});
    yield* act();
    return false;
  };
  // "¿Qué hacemos?": a free choice of action words (the mic is on: say one!); everyone does the one picked. -> its id
  JG.choose = function* (f, o = {}) {
    let vs = (o.verbs || JG.VERBS).filter(met);
    if (!vs.length) return null;
    vs = vs.sort(() => G.rand() - 0.5);
    const pick = []; for (const v of vs) if (pick.length < 4 && !pick.some(w => (CLASH[w] || []).includes(v))) pick.push(v);
    const r = yield G.choose({ prompt: o.prompt || '¿Qué hacemos?', en: o.en || 'What shall we do? (say an action, or tap one)', choices: pick.map(w => ({ word: w })), layout: 'cards', mic: true, cancel: !!o.cancel, who: o.who || null });
    const k = r.result; if (k == null || k < 0 || k >= pick.length) return null;
    if (G.cards) G.cards.grow(pick[k], 'tap');
    yield* JG.all(f, pick[k], { me: !!o.me });
    return pick[k];
  };

  // =====================================================================
  //  The playground's rides: the swings, the slide, the climbing frame, the seesaw, the merry-go-round
  // =====================================================================
  const SWINGS = [16, 17, 18].map(x => [x, 3]), SLIDE = P('juegos', 'slide'), LAND = P('juegos', 'land'), FRAME = P('juegos', 'frame'), MGR = P('juegos', 'mgr');
  const SAW = [[16, 7], [17, 7], [18, 7]];
  const MGR_C = [(MGR[0] + 1) * TL, (MGR[1] + 1) * TL]; // the wheel's centre: the corner its four tiles share
  // the swing angle of seat i: whoever rides it (amp grows with each push), else a breeze
  JG.swingAng = function (f, i) {
    const r = f && [f.player].concat(f.npcs).find(e => e.ride && e.ride.kind === 'swing' && e.ride.i === i);
    if (r) return (r.ride.amp || 0.2) * Math.sin((G.frame - r.ride.f0) / 19);
    return 0.06 * Math.sin(G.frame / 47 + i * 2);
  };
  const seat = (f, i) => { const th = JG.swingAng(f, i), x = SWINGS[i][0] * TL + 12, top = SWINGS[i][1] * TL + 5; return { x, y: top + 13 * Math.cos(th) + 9 * Math.sin(th), th, top }; };
  JG.sawAng = function (f) { const r = f && [f.player].concat(f.npcs).find(e => e.ride && e.ride.kind === 'seesaw'); return r ? (r.ride.ang != null ? r.ride.ang : 0.32 * Math.sin((G.frame - r.ride.f0) / 26)) : 0.2; };
  const sawEnd = (f, side) => { const a = JG.sawAng(f), cx = SAW[1][0] * TL + 12, cy = SAW[1][1] * TL + 13; return { x: cx + side * 30, y: cy + side * Math.sin(a) * 30 * 0.8 }; };
  JG.mgrAng = function (f) { const r = f && [f.player].concat(f.npcs).find(e => e.ride && e.ride.kind === 'mgr'); return r ? (G.frame - r.ride.f0) / 14 + (r.ride.a0 || 0) : G.frame / 120; };
  function ridePose(f, e, r) {
    const t = G.frame - r.f0;
    switch (r.kind) {
      case 'swing': { const s = seat(f, r.i); return { wx: s.x, wy: s.y + 4, z: 0, sy: 0.86, dir: s.th > 0.05 ? 'down' : 'down', fr: 0, arms: 'hold', noShadow: true, sx: 1 + Math.sin(s.th) * 0.08 }; }
      case 'slide': { // climb the ladder, along the top, whoosh down the chute to the landing
        const x0 = r.from[0] * TL + 12, y0 = r.from[1] * TL + 21, lx = SLIDE[0] * TL + 8, ly = SLIDE[1] * TL + 21, ex = LAND[0] * TL + 12, ey = LAND[1] * TL + 21;
        if (r.part === 'up') { const u = Math.min(1, t / 34); if (u < 0.3) { const v = u / 0.3; return { wx: x0 + (lx - x0) * v, wy: y0 + (ly - y0) * v, z: 0, dir: 'up', fr: (t >> 3) & 1 }; } const v = (u - 0.3) / 0.7; return { wx: lx + v * 6, wy: ly, z: v * 17, dir: 'up', fr: (t >> 2) & 1, arms: 'up' }; }
        if (r.part === 'top') return { wx: lx + 6, wy: ly, z: 17, dir: 'right', fr: 0, arms: (t >> 4) & 1 ? 'up' : 'wave' };
        const u = Math.min(1, t / 26); return { wx: lx + 6 + (ex - lx - 6) * u, wy: ly + (ey - ly) * u, z: 17 * (1 - u) * (1 - u * 0.2), dir: 'right', fr: 0, arms: 'up', sy: 0.88, rot: 0.25 * (1 - u) };
      }
      case 'frame': { // up the climbing frame, a wave from the top, back down
        const x0 = r.from[0] * TL + 12, y0 = r.from[1] * TL + 21, fx = FRAME[0] * TL + 24, fy = FRAME[1] * TL + 21;
        const u = r.part === 'down' ? 1 - Math.min(1, t / 30) : r.part === 'up' ? Math.min(1, t / 34) : 1;
        return { wx: x0 + (fx - x0) * Math.min(1, u * 2), wy: y0 + (fy - y0) * Math.min(1, u * 2), z: Math.max(0, u * 2 - 1) * 20, dir: u >= 1 ? 'down' : 'up', fr: u > 0 && u < 1 ? (t >> 2) & 1 : 0, arms: u >= 1 ? ((t >> 4) & 1 ? 'up' : 'wave') : u > 0.5 ? 'up' : null };
      }
      case 'seesaw': { const s = sawEnd(f, r.side); return { wx: s.x, wy: SAW[1][1] * TL + 21, z: SAW[1][1] * TL + 21 - s.y - 8, dir: 'down', fr: 0, sy: 0.88, arms: 'hold', noShadow: true }; }
      case 'mgr': { const a = JG.mgrAng(f) + (r.off || 0); return { wx: MGR_C[0] + Math.cos(a) * 15, wy: MGR_C[1] + Math.sin(a) * 11 + 6, z: 3, dir: ['right', 'down', 'left', 'up'][Math.floor(((a + Math.PI / 4) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2)) % 4], fr: 0, arms: 'hold', noShadow: true }; }
      case 'kite': { // running with the kite on the hill: off and back, the kite (drawn by the zone) up in the sky
        const L = r.len || 80, D = r.D || 3 * TL, u = t < L / 2 ? ease(t / (L / 2)) : 1 - (t - L / 2) / (L / 2), x0 = e.x * TL + 12, y0 = e.y * TL + 21;
        return { wx: x0 + D * Math.max(0, u), wy: y0, z: r.fast ? Math.abs(Math.sin(t / 2)) * 3 : 0, dir: t < L / 2 ? 'right' : 'left', fr: r.fast ? (t >> 1) & 1 : (t >> 4) & 1, arms: 'hold' };
      }
    }
    return null;
  }
  JG.ridePose = ridePose;
  const wait = function* (n) { for (let i = 0; i < n; i++) yield 1; };
  // the player plays on them (a tap on the thing): the word of the thing, then the ride, the verbs said as it goes
  const sayVerb = (f, id, wx, wy) => { if (!met(id)) return; G.speak('¡' + G.baseForm(id) + '!'); G.fx.say('¡' + G.baseForm(id)[0].toUpperCase() + G.baseForm(id).slice(1) + '!', Math.round(wx - f.cam.x), Math.round(wy - f.cam.y), '#f8e060', true); if (G.cards) G.cards.grow(id, 'tap', { x: Math.round(wx - f.cam.x), y: Math.round(wy - f.cam.y) }); };
  const ridesToday = () => { const r = st().rides; if (r.d !== day()) { for (const k in r) delete r[k]; r.d = day(); } return r; };
  const rideCount = k => { const r = ridesToday(); r[k] = (r[k] | 0) + 1; st().rideAll = (st().rideAll | 0) + 1; G.st.autosave(); };
  JG.ridesToday = ridesToday;
  function* nameIt(f, id, who, x, y) { // the thing's word, the first time: met here (Ana or Pablo names it)
    if (!met(id)) { CH.point(x * TL + 12, y * TL); try { yield* meetW(id, { who, prompt: '¡' + G.requests.the(id, { cap: 1 }) + '!', en: { columpio: 'The swing!', resbaladilla: 'The slide!', subibaja: 'The seesaw!' }[id] || '', known: othersFor(id, ['pelota', 'arbol', 'flor', 'banco']) }); } finally { CH.point(null); } }
  }
  const named = (id, x, y) => { if (G.world && met(id)) G.world.name(id, x * TL + 12, y * TL - 4); }; // (after the ride: its word, and the say-it-back mic)
  JG.playSwing = function* (f, i) {
    yield* nameIt(f, 'columpio', 'pablo', ...SWINGS[i]);
    const p = f.player; p.ride = { kind: 'swing', i, f0: G.frame, amp: 0.35 }; hook(p);
    for (let k = 0; k < 4; k++) { G.audio.sfx('swing'); p.ride.amp = Math.min(0.95, p.ride.amp + 0.18); yield* wait(42); }
    if (G.world && met('columpio')) G.world.name('columpio', SWINGS[i][0] * TL + 12, SWINGS[i][1] * TL - 4);
    yield* wait(40); p.ride = null; rideCount('swing');
  };
  JG.slideRide = function* (f, part) { const p = f.player; hook(p); p.ride = Object.assign(p.ride && p.ride.kind === 'slide' ? p.ride : { kind: 'slide', from: [p.x, p.y] }, { part, f0: G.frame }); yield* wait(part === 'up' ? 36 : part === 'down' ? 28 : 1); if (part === 'down') { G.audio.sfx('bounce'); const [x, y] = f.blocked(LAND[0], LAND[1], p) ? [LAND[0], LAND[1] + 1] : LAND; p.x = x; p.y = y; p.ox = p.oy = 0; p.dir = 'down'; p.ride = null; puff('dust', x * TL + 12, y * TL + 21, { life: 20 }); } };
  JG.playSlide = function* (f) {
    yield* nameIt(f, 'resbaladilla', 'ana', ...SLIDE);
    G.audio.sfx('step'); yield* JG.slideRide(f, 'up'); sayVerb(f, 'sube', SLIDE[0] * TL + 12, SLIDE[1] * TL - 20);
    yield* JG.slideRide(f, 'top'); yield* wait(20);
    G.audio.sfx('swing'); yield* JG.slideRide(f, 'down'); sayVerb(f, 'baja', LAND[0] * TL + 12, LAND[1] * TL - 10);
    yield* wait(16); named('resbaladilla', ...SLIDE); rideCount('slide');
  };
  JG.frameRide = function* (f, part) { const p = f.player; hook(p); p.ride = Object.assign(p.ride && p.ride.kind === 'frame' ? p.ride : { kind: 'frame', from: [p.x, p.y] }, { part, f0: G.frame }); yield* wait(part === 'up' ? 36 : part === 'down' ? 32 : 1); if (part === 'down') p.ride = null; };
  JG.playFrame = function* (f) {
    G.audio.sfx('step'); yield* JG.frameRide(f, 'up'); sayVerb(f, 'sube', FRAME[0] * TL + 24, FRAME[1] * TL - 24);
    yield* JG.frameRide(f, 'top'); yield* wait(50);
    yield* JG.frameRide(f, 'down'); sayVerb(f, 'baja', f.player.x * TL + 12, f.player.y * TL - 16); yield* wait(10); rideCount('frame');
  };
  JG.playSeesaw = function* (f, rounds = 3) {
    yield* nameIt(f, 'subibaja', 'ana', ...SAW[1]);
    const p = f.player, ana = npcAt(f, 'ana'); hook(p);
    p.ride = { kind: 'seesaw', side: -1, f0: G.frame }; if (ana) { hook(ana); ana.ride = { kind: 'seesaw', side: 1, f0: G.frame }; }
    for (let k = 0; k < rounds * 2; k++) { const up = k % 2 === 0; G.audio.sfx(up ? 'cursor' : 'boop'); p.ride.ang = null; yield* wait(40); sayVerb(f, up ? 'sube' : 'baja', SAW[0][0] * TL + 12, SAW[0][1] * TL - 16); }
    p.ride = null; if (ana) ana.ride = null; named('subibaja', ...SAW[1]); rideCount('seesaw');
  };
  JG.playMgr = function* (f) {
    const p = f.player; hook(p); G.audio.sfx('swing');
    p.ride = { kind: 'mgr', f0: G.frame, a0: Math.atan2(p.y * TL + 12 - MGR_C[1], p.x * TL + 12 - MGR_C[0]) };
    for (let k = 0; k < 4; k++) { yield* wait(30); G.audio.sfx('swing'); if (k === 1) sayVerb(f, 'gira', MGR_C[0], MGR_C[1] - 26); }
    p.ride = null; rideCount('mgr');
  };
  // (main: the ride's tile a story place sits on: a tap anywhere on the ride goes to the story while it waits there)
  const RIDE_AT = [
    ...SWINGS.map((at, i) => ({ id: 'swing' + i, at, main: SWINGS[1], run: f => JG.playSwing(f, i) })),
    { id: 'slide', at: SLIDE, main: SLIDE, run: f => JG.playSlide(f) }, { id: 'slide2', at: [SLIDE[0] + 1, SLIDE[1]], main: SLIDE, run: f => JG.playSlide(f) },
    { id: 'frame', at: FRAME, main: FRAME, run: f => JG.playFrame(f) }, { id: 'frame2', at: [FRAME[0] + 1, FRAME[1]], main: FRAME, run: f => JG.playFrame(f) },
    ...SAW.map((at, i) => ({ id: 'saw' + i, at, main: SAW[0], run: f => JG.playSeesaw(f) })),
    ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([dx, dy], i) => ({ id: 'mgr' + i, at: [MGR[0] + dx, MGR[1] + dy], main: MGR, run: f => JG.playMgr(f) })),
  ];
  JG.RIDE_AT = RIDE_AT;

  // =====================================================================
  //  Tapping an animal whose word isn't met yet: Lola calls out its name (a one-unknown puzzle)
  // =====================================================================
  const tapped0 = AN.tapped;
  AN.tapped = function (f, a) {
    const r = tapped0.call(this, f, a);
    if (f && Z.of(f.mapId) === 'juegos' && KINDS.includes(a.kind) && !met(a.kind) && !f.locked && G.top() === f && !CH.running()) {
      CH.scene(f, (function* () {
        yield 30;
        if (met(a.kind)) return;
        CH.point(a.x, a.y - 14);
        try { yield* G.intro.show(a.kind, { who: 'lola', prompt: G.requests.LINES.mira(a.kind), en: 'Look! ' + EN[a.kind], known: othersFor(a.kind, KINDS) }); } finally { CH.point(null); }
      })());
    }
    return r;
  };

  // =====================================================================
  //  The people: Ana, Pablo, Don Chuy; Lola and Nico as everywhere
  // =====================================================================
  const sideAlert = {};
  // a favour waiting while their own bubble is down (nothing of theirs on offer, only a game to play again): the favour
  // runs (G.errands.talk), never a game in its way that leaves the bubble up and the guide sending her back
  const favFirst = id => !(sideAlert[id] && !(id !== 'chuy' && CH.current('juegos')) && sideAlert[id]()) && !!(G.favores && G.favores.alert(id)); // (as the bubble: the kids' games wait while their story goes on)
  function person(id, x, y, dir, side, line, o = {}) {
    return Object.assign({ id, npc: id, x, y, dir, fixed: !!o.fixed, wander: o.wander || 0,
      alert: () => CH.alert(id) || (G.state && sideAlert[id] && !(id !== 'chuy' && CH.current('juegos')) ? sideAlert[id]() : null) || (G.favores && G.favores.alert(id)) || null, // (the kids' games wait while their story goes on)
      talk: function* (f) {
        const n = npcAt(f, id); if (n) { n.ride = null; n.talking = true; }
        try {
          if (yield* CH.talk(id, f)) return;
          if (side && !favFirst(id) && (yield* side(f))) return; // (the talk follows the bubble: a favour waiting goes before a game replayed, S2 review #9)
          if (G.errands && (yield* G.errands.talk(id, f))) return;
          yield* line(f);
        } finally { if (n) n.talking = false; }
      } }, o.extra || {});
  }
  // the kids' idle play: Ana skips her rope; Pablo swings (or flies his kite on the hill, once he has it back)
  const home = (n, at) => n.x === at[0] && n.y === at[1] && !n.moving && !n.busy && !n.talking;
  const ANA_AT = P('juegos', 'ana'), PABLO_AT = P('juegos', 'pablo'), HILL = P('juegos', 'hill'), PABLO_HILL = [HILL[0] + 1, HILL[1] + 1];
  JG.anaIdle = function (f, n) {
    if (!home(n, ANA_AT) || ropeOn) return null;
    const t = G.frame, ph = (t % 44) / 44, a = ph * Math.PI * 2, z = Math.max(0, -Math.cos(a)) * 8;
    return { wx: n.x * TL + 12, wy: n.y * TL + 21, z, dir: 'down', fr: 0, arms: 'rope', sy: z > 1 ? 1.04 : 0.97, after: (ctx, x, y) => drawRope(ctx, x, y - Math.round(z), a) };
  };
  function drawRope(ctx, x, y, a) { // the jump rope swinging round her: over her head, then under her feet (she hops over it)
    const hy = y - 8, c = Math.cos(a), cy = hy - c * (c > 0 ? 44 : 22) + (c > 0 ? 0 : Math.round(-c * 8));
    ctx.strokeStyle = OLC; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 10, hy); ctx.quadraticCurveTo(x, cy, x + 10, hy); ctx.stroke();
    ctx.strokeStyle = '#f8c030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 10, hy); ctx.quadraticCurveTo(x, cy, x + 10, hy); ctx.stroke();
    ctx.fillStyle = OLC; ctx.fillRect(x - 12, hy - 2, 4, 5); ctx.fillRect(x + 8, hy - 2, 4, 5); ctx.fillStyle = '#e04040'; ctx.fillRect(x - 11, hy - 1, 2, 3); ctx.fillRect(x + 9, hy - 1, 2, 3);
  }
  JG.pabloIdle = function (f, n) {
    if (home(n, PABLO_AT)) { n.ride0 = n.ride0 || { kind: 'swing', i: 1, f0: G.frame, amp: 0.45 }; return ridePose(f, n, n.ride0); }
    n.ride0 = null;
    if (home(n, PABLO_HILL) && CH.done('juegos2')) return { wx: n.x * TL + 12, wy: n.y * TL + 21, z: 0, dir: 'up', fr: 0, arms: 'throw' };
    return null;
  };
  // Pablo's swing: drawn as his ride while he idles there (JG.swingAng reads e.ride: give it his)
  const swingAng0 = JG.swingAng;
  JG.swingAng = function (f, i) { const pb = f && npcAt(f, 'pablo'); if (pb && !pb.ride && pb.ride0 && pb.ride0.i === i && home(pb, PABLO_AT)) return pb.ride0.amp * Math.sin((G.frame - pb.ride0.f0) / 19); return swingAng0(f, i); };
  function* anaLine() { yield* sayShow('ana', met('corre') ? 'corre' : null, T(met('corre') ? '¡A [corre:correr]!' : '¡Hola, {name}!', 'Let\'s run!')); }
  function* pabloLine() { if (CH.done('juegos2') && met('papalote')) yield* sayShow('pablo', 'papalote', T('¡Mi [papalote]!', 'My kite! Look how high!')); else yield* say('pablo', T('¡Hola, {name}!', 'Hi, {name}!')); }
  function* chuyLine() { if (met('burbujas')) yield* sayShow('chuy', 'burbujas', T('¡[burbujas:Burbujas]!', 'Bubbles! Come back tomorrow for more.')); else yield* say('chuy', T('¡Hola, {name}!', 'Hello, {name}!')); }

  // ---------- Ana's jump rope (after chapter 1): la cuerda; say ¡salta! and she jumps, count the jumps ----------
  let ropeOn = false;
  const ropeOpen = () => CH.done('juegos1');
  sideAlert.ana = () => { if (!ropeOpen()) return null; if (!daily('rope').done) return { icon: 'cuerda' }; if (!daily('simon').done) return { icon: 'corre' }; return null; };
  function* anaSide(f) {
    if (!ropeOpen()) return false;
    if (!daily('rope').done) { yield* ropeGame(f); return true; }
    yield* simonGame(f, daily('simon').done ? 2 : 3); return true;
  }
  function* ropeGame(f) {
    const n = npcAt(f, 'ana'), r = daily('rope');
    yield* sayShow('ana', 'cuerda', T('¡Mi [cuerda]! ¿Jugamos?', 'My jump rope! Shall we play?'));
    if (!met('cuerda')) yield* G.intro.show('cuerda', { who: 'ana', prompt: '¡La [cuerda]!', en: 'The jump rope!', known: othersFor('cuerda', ['pelota', 'columpio', 'papalote', 'flor']) });
    ropeOn = true;
    try {
      const nums = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
      const jump = function* () { if (n) JG.start(f, n, 'salta'); yield* JG.act(f, f.player, 'salta'); };
      for (let k = 0; k < 5; k++) {
        if (!k) yield* JG.tpr('salta', { who: 'ana', prompt: '¡[salta:Salta]!', en: 'Jump!', ask: '¡La [cuerda]! ¿Qué hago?', askEn: 'The jump rope! What do I do?', act: jump });
        else {
          const c = yield G.choose({ prompt: '¡Otra vez!', en: 'Again! (say it, or tap it)', choices: [{ word: 'salta' }], layout: 'cards', mic: true, who: 'ana' });
          if (c.result !== 0) break;
          if (G.cards) G.cards.grow('salta', 'tap');
          yield* jump();
        }
        r.n = k + 1; G.st.autosave();
        if (met(nums[k])) { G.fx.say(G.baseForm(nums[k]), f.player.x * TL + 12 - Math.round(f.cam.x), f.player.y * TL - 26 - Math.round(f.cam.y), '#ffffff', true); G.speak(G.baseForm(nums[k])); }
      }
    } finally { ropeOn = false; }
    if ((r.n | 0) >= 5) {
      r.done = true; st().ropes = (st().ropes | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
      if (met('cinco')) yield* quiz('ana', '¿Cuántos?', 'How many jumps?', 'cinco', ['cuatro', 'tres', 'seis'], { show: { icon: 'salta', count: 5 } });
      yield* sayShow('ana', 'cuerda', T('¡Muy bien, {name}!', 'Great jumping! Again tomorrow?'));
    }
  }
  // ---------- Simón dice: you say what everyone does (Ana, after chapter 1; and chapter 1's end) ----------
  function* simonGame(f, rounds = 3) {
    yield* sayShow('ana', 'corre', T('¡Simón dice! ¡Tú eres Simón!', 'Simon says! You are Simón: say what we all do!'));
    for (let r = 0; r < rounds; r++) { const v = yield* JG.choose(f, { prompt: '¡Simón dice...!', en: 'Simon says...! (say an action, or tap one: everyone does it)', who: 'ana' }); if (!v) break; }
    // and now Ana is Simón: hear it, pick its picture, do it
    const vs = JG.VERBS.filter(met); if (vs.length >= 2) {
      const w = vs[G.r(vs.length)];
      yield* ask('ana', '¡Simón dice: [' + w + ']!', 'Simon says...! Which one? (listen)', w, JG.verbsFor(w), { pic: true });
      yield* JG.all(f, w);
    }
    daily('simon').done = true; st().simons = (st().simons | 0) + 1; G.st.autosave();
    yield* sayShow('ana', null, T('¡Qué divertido!', 'What fun!'));
  }

  // ---------- Pablo's ball (after chapter 1): lanza, atrapa; then the dog leaps and catches it ----------
  const ballOpen = () => CH.done('juegos1');
  const BALLPIC = { icon: 'pelota', col: '#f8c830' }; // (a picture's col is a colour: the yellow ball)
  sideAlert.pablo = () => (ballOpen() && !daily('ball').done ? BALLPIC : null);
  JG.ball = null; // a ball flying: {from: [wx, wy], to: [wx, wy], f0, len, h}
  function* fly(from, to, len = 30, h = 26) { JG.ball = { from, to, f0: G.frame, len, h }; G.audio.sfx('swing'); yield* wait(len); JG.ball = null; G.audio.sfx('bounce'); }
  const handOf = e => [e.x * TL + 12 + (e.ox || 0), e.y * TL + 6 + (e.oy || 0)];
  function* pabloSide(f) {
    if (!ballOpen() || daily('ball').done) return false;
    const pb = npcAt(f, 'pablo'), p = f.player; if (!pb) return false;
    yield* sayShow('pablo', BALLPIC, T('¿Jugamos a la [pelota]?', 'Shall we play ball?'));
    if (!met('pelota')) yield* G.intro.show('pelota', { who: 'pablo', prompt: '¡Mi [pelota]!', en: 'My ball!', known: othersFor('pelota', ['columpio', 'papalote', 'cuerda', 'flor']) });
    const throwToPablo = function* () { p.dir = pb.x < p.x ? 'left' : pb.x > p.x ? 'right' : pb.y < p.y ? 'up' : 'down'; JG.start(f, p, 'lanza', { noBall: true }); yield* wait(14); JG.start(f, pb, 'atrapa', { noBall: true }); yield* fly(handOf(p), handOf(pb)); G.audio.sfx('chime'); yield* wait(20); };
    const throwToYou = function* () { JG.start(f, pb, 'lanza', { noBall: true }); yield* wait(14); JG.start(f, p, 'atrapa', { noBall: true }); yield* fly(handOf(pb), handOf(p), 30, 30); G.audio.sfx('chime'); yield* wait(24); };
    yield* JG.tpr('lanza', { who: 'pablo', prompt: '¡[lanza:Lánzala]!', en: 'Throw it to me!', demo: function* () { yield* JG.act(f, pb, 'lanza'); }, act: throwToPablo, show: BALLPIC });
    yield* JG.tpr('atrapa', { who: 'pablo', prompt: '¡[atrapa:Atrápala]!', en: 'Catch it!', demo: function* () { yield* JG.act(f, pb, 'atrapa'); }, act: throwToYou, show: BALLPIC });
    const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
    if (dog) { // the dog: you throw it high, he leaps and catches it
      G.pet.place(f, dog); yield 20;
      yield* sayShow('pablo', { icon: 'perro' }, T('¡{dog}! ¡[atrapa:Atrápala]!', '{dog}! Catch it! (throw it to him)'));
      const c = yield G.choose({ prompt: '¡[lanza]!', en: 'Throw! (say it, or tap it)', choices: [{ word: 'lanza' }], layout: 'cards', mic: true, who: 'pablo' });
      if (c.result === 0) {
        if (G.cards) G.cards.grow('lanza', 'tap');
        JG.start(f, p, 'lanza', { noBall: true }); yield* wait(14);
        const tx = dog.x * TL + 12, ty = dog.y * TL + 4; G.pet.anim(dog, 'jump'); yield* fly(handOf(p), [tx, ty - 10], 26, 34);
        CK.bark(f, dog); CK.heart(f, dog); G.audio.sfx('chime'); if (G.hearts) G.hearts.add('canelo', 1, 'care'); yield 30;
      }
    }
    daily('ball').done = true; st().balls = (st().balls | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
    yield* sayShow('pablo', BALLPIC, T('¡Muy bien, {name}!', 'Well played, {name}!'));
    return true;
  }

  // ---------- Don Chuy's bubbles (any day): las burbujas; catch six; then a bubble wand of your own ----------
  const CART = P('juegos', 'cart');
  sideAlert.chuy = () => (!daily('bub').done && !JG.bub ? { icon: 'burbujas' } : JG.bub && JG.bub.n >= JG.bub.want ? true : null);
  JG.bub = null; // the game going on: {list: [{x, y, vx, vy, r, t, pop}], n, want, made}
  function bubSpawn(f) {
    const b = JG.bub, p = f.player, a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 50;
    b.list.push({ x: p.x * TL + 12 + Math.cos(a) * d, y: p.y * TL + Math.sin(a) * d * 0.6 + 4, vx: (Math.random() - 0.5) * 0.3, vy: -0.08 - Math.random() * 0.12, r: 6 + Math.random() * 3, t: 0, ph: Math.random() * 6 });
    b.made++;
  }
  JG.update = function (f) {
    const b = JG.bub; if (!b || !here(f)) return;
    if (G.frame === b.last) return; b.last = G.frame;
    if (b.n < b.want && b.list.filter(o => !o.pop).length < 5 && G.frame % 24 === 0) bubSpawn(f);
    for (const o of b.list) { if (o.pop) { o.pop++; continue; } o.t++; o.x += o.vx + Math.sin(o.t / 20 + o.ph) * 0.25; o.y += o.vy; if (o.t > 520) o.pop = 1; }
    b.list = b.list.filter(o => !o.pop || o.pop < 14);
    // the dog leaps at one now and then (his don't count: just for fun)
    const dog = G.pet && G.pet.mine() ? G.pet.npc(f) : null;
    if (dog && !dog.hidden && !dog.pa && G.frame % 150 === 75) { const o = b.list.find(o => !o.pop && Math.hypot(o.x - dog.x * TL - 12, o.y - dog.y * TL) < 50); if (o) { G.pet.anim(dog, 'jump'); o.pop = 1; G.audio.sfx('pop'); } }
    if (b.n >= b.want && !b.end && !f.locked && G.top() === f) { b.end = true; CH.scene(f, bubDone(f)); }
  };
  function bubTap(f, tap) {
    const b = JG.bub; if (!b || f.locked) return false;
    const wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y);
    let best = null, bd = 1e9; for (const o of b.list) { if (o.pop) continue; const d = Math.hypot(o.x - wx, o.y - 14 - wy); if (d < o.r + 12 && d < bd) { bd = d; best = o; } }
    if (!best) return false;
    best.pop = 1; b.n++; G.audio.sfx('pop'); puff('spark', best.x, best.y - 14, { life: 18 });
    G.fx.say(String(b.n), tap.x, tap.y - 14, '#a8f0ff', false);
    if (b.n === 1 || b.n === 4) { if (met('atrapa')) { G.speak('¡' + G.baseForm('atrapa') + '!'); if (G.cards) G.cards.grow('atrapa', 'tap', { x: tap.x, y: tap.y }); } }
    G.st.autosave();
    return true;
  }
  const sk0 = G.seek.tap;
  G.seek.tap = function (f, tap) { if (f && here(f) && JG.bub && bubTap(f, tap)) return true; return sk0.call(this, f, tap); };
  function* chuySide(f) {
    if (JG.bub) { yield* sayShow('chuy', 'burbujas', T('¡[atrapa:Atrápalas]!', 'Catch them! Tap the bubbles.')); return true; }
    if (daily('bub').done) return false;
    const first = !st().metChuy; st().metChuy = true;
    if (first) yield* say('chuy', T('¡Hola, {name}! Soy Don Chuy.', 'Hello, {name}! I\'m Don Chuy. I sell bubble wands!'));
    // once she knows them, she asks for them: "¿Qué quieres?" "Quiero burbujas, por favor." (a daily routine with a
    // phrase, polish plan 2.10: src/phrases.js; the old question when phrases are off or Quiero can't come yet)
    const ph = G.phrase && G.words.stage('burbujas') >= 2 ? yield* G.phrase.quiero('chuy', ['burbujas'], { onGet: function* () { yield* sayShow('chuy', 'burbujas', T('¡[burbujas:Burbujas]! ¡Aquí tienes!', 'Bubbles! Here you are!')); } }) : null;
    if (!ph || ph.cancel) yield* meetW('burbujas', { who: 'chuy', prompt: '¡Mira! ¡[burbujas:Burbujas]!', en: 'Look! Bubbles!', known: othersFor('burbujas', ['pelota', 'papalote', 'agua', 'flor']) });
    JG.bub = { list: [], n: 0, want: 6, made: 0 }; for (let k = 0; k < 4; k++) bubSpawn(f);
    G.audio.sfx('chime');
    yield* JG.tpr('atrapa', { who: 'chuy', prompt: '¡[atrapa:Atrápalas]!', en: 'Catch them!', ask: '¡Las [burbujas]! ¿Qué hago?', askEn: 'The bubbles! What do I do?',
      demo: function* () { const dog = G.pet && G.pet.mine() ? G.pet.npc(f) : null; if (dog) { G.pet.anim(dog, 'jump'); yield 30; const o = JG.bub.list.find(o => !o.pop); if (o) { o.pop = 1; G.audio.sfx('pop'); } } yield 20; },
      act: function* () { yield* JG.act(f, f.player, 'atrapa', { noBall: true }); } });
    yield* sayShow('chuy', { icon: 'burbujas', count: 6 }, T('¡Seis! ¡[atrapa:Atrápalas]!', 'Catch six! Tap the bubbles.'));
    return true;
  }
  function* bubDone(f) {
    const b = JG.bub; JG.bub = null; daily('bub').done = true; st().bubbles = (st().bubbles | 0) + 1;
    CK.confetti(); G.audio.jingle('promote');
    const n = npcAt(f, 'chuy'); if (n) CH.pointNpc(n);
    try {
      if (met('seis')) yield* quiz('chuy', '¿Cuántas?', 'How many bubbles did you catch?', 'seis', ['cinco', 'siete', 'cuatro'], { show: { icon: 'burbujas', count: 6 } });
      yield* sayShow('chuy', 'burbujas', T('¡Muy bien! ¡Para ti!', 'Well done! A bubble wand for you! (bubbles come out of it as you walk)'));
    } finally { CH.point(null); }
    if (!bag().has('burbujas')) bag().add('burbujas');
    G.st.autosave(); void b;
  }
  if (G.carry) Object.assign(G.carry.DOG, { burbujas: 'sniff' });
  // a bubble wand in your hands: bubbles drift up behind you wherever you walk (any map)
  const trail = [];
  function wandTrail(f, ctx) {
    const h = held(); const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (h && h.id === 'burbujas' && !f.player.hidden && G.frame % 14 === 0) trail.push({ m: f.mapId, x: f.player.x * TL + 12 + (f.player.ox || 0) + (Math.random() - 0.5) * 10, y: f.player.y * TL - 6 + (f.player.oy || 0), t: 0, r: 2 + Math.random() * 2.5, ph: Math.random() * 6 });
    for (let i = trail.length - 1; i >= 0; i--) { const o = trail[i]; if (o.m !== f.mapId || ++o.t > 90) { trail.splice(i, 1); continue; } bubble(ctx, o.x + Math.sin(o.t / 9 + o.ph) * 3 - cx, o.y - o.t * 0.35 - cy, o.r, o.t > 80 ? (90 - o.t) / 10 : 1); }
  }
  function bubble(ctx, x, y, r, a = 1) {
    x = Math.round(x); y = Math.round(y);
    ctx.globalAlpha = 0.5 * a; ctx.strokeStyle = '#203048'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r + 1, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.9 * a; ctx.strokeStyle = '#d8f4ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#f8b8e8'; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r, 0.3, 1.2); ctx.stroke();
    ctx.fillStyle = 'rgba(224,246,255,0.25)'; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r - 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - Math.round(r * 0.5), y - Math.round(r * 0.5), 1, 1); ctx.globalAlpha = 1;
  }

  // ---------- Lola: her hello here meets el columpio and shows the dog's spots and the playground ----------
  const lola = Z.lola(...P('juegos', 'lola'), 'juegos');
  function* lolaHere(f) {
    const sp = (f.def.dogSpots || []).find(s => Z.dogReady(s));
    if (sp && G.pet && G.pet.mine()) { CH.point(sp.at[0] * TL + 12, sp.at[1] * TL); try { yield* sayShow('lola', { icon: 'huella' }, T('¡Mira, {dog}!', 'Look! {dog} can play over there: tap the paw prints!')); } finally { CH.point(null); } }
    CH.point(SWINGS[0][0] * TL + 36, SWINGS[0][1] * TL);
    try {
      if (!met('columpio')) yield* G.intro.show('columpio', { who: 'lola', prompt: '¡Mira! ¡El [columpio]!', en: 'Look! The swings!', known: othersFor('columpio', ['arbol', 'flor', 'banco', 'pelota']) });
      yield* sayShow('lola', 'juegos', T('¡A jugar, {name}!', 'Let\'s play! Tap the swings, the slide, everything!'));
    } finally { CH.point(null); }
  }

  // =====================================================================
  //  Tap yourself in the park: "¿Qué hago?" — say an action and you do it (with the dog)
  // =====================================================================
  const tapSelf0 = G.carry.tapSelf;
  G.carry.tapSelf = function (f, tap) {
    if (tapSelf0.call(this, f, tap)) return true;
    if (!f || Z.of(f.mapId) !== 'juegos' || f.locked || !tap || !G.state || JG.bub) return false;
    const p = f.player, wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y);
    if (!(wx >= p.x * TL + p.ox && wx < p.x * TL + p.ox + TL && wy >= p.y * TL + p.oy - 6 && wy < p.y * TL + p.oy + TL) || p.moving) return false;
    if (JG.VERBS.filter(met).length < 1) return false;
    CH.scene(f, (function* () { st().meact = (st().meact | 0) + 1; yield* JG.choose(f, { prompt: '¿Qué hago?', en: 'What shall I do? (say an action, or tap one)', me: false, cancel: true }); })());
    return true;
  };
  (Z.demos || (Z.demos = [])).push({ kind: 'meact', find: f => (here(f) && JG.VERBS.filter(met).length >= 2 && !held() && !(st().meact) ? [f.player.x, f.player.y] : null) });

  // =====================================================================
  //  The map's side places (zones.js hooks, only in the park): the rides, the bubbles, the guide, the drawing
  // =====================================================================
  const rideAt = (f, x, y) => (here(f) && G.state ? RIDE_AT.find(s => s.at[0] === x && s.at[1] === y) || null : null);
  const zSearch = Z.search, zSpecial = Z.special, zGoal = Z.goal, zUnder = Z.drawUnder, zTop = Z.drawTop, zTask = Z.task;
  Z.search = (f, x, y) => { // (a story place wins over a ride on the same tile, or anywhere on the same ride)
    if (here(f) && CH.spotAt(f, x, y)) return null;
    const s = rideAt(f, x, y); if (s) { const cs = CH.spotAt(f, ...s.main); return cs ? CH.runSpot(f, cs) : s.run(f); }
    return zSearch(f, x, y);
  };
  Z.special = (f, x, y) => !!rideAt(f, x, y) || zSpecial(f, x, y);
  const pt = (x, y, lift, icon) => ({ x, y, lift, icon });
  Z.task = function (f) { // the bubbles going on: point at one
    if (here(f) && G.state && JG.bub) { const o = JG.bub.list.find(o => !o.pop); if (o) return { why: 'juegos: bubbles', pts: [pt(o.x, o.y - 10, 16, 'burbujas')] }; }
    return zTask(f);
  };
  Z.goal = function (f) { // a suggestion: a ride you haven't been on today (after the zone's people and the dog)
    const g = zGoal(f); if (g || !here(f) || !G.state) return g;
    const r = ridesToday();
    const next = [['swing', SWINGS[0]], ['slide', SLIDE], ['seesaw', SAW[1]], ['mgr', MGR], ['frame', FRAME]].find(([k]) => !r[k]);
    return next ? { why: 'juegos: ride ' + next[0], pts: [pt(next[1][0] * TL + 12, next[1][1] * TL + 12, 26, { swing: 'columpio', slide: 'resbaladilla', seesaw: 'subibaja', mgr: 'gira', frame: 'sube' }[next[0]])] } : null;
  };
  // the playground's moving parts (drawn flat, under the people): the swings' seats, the seesaw's plank, the wheel
  function drawRides(f, ctx, cx, cy) {
    for (let i = 0; i < SWINGS.length; i++) { // chains and seats
      const s = seat(f, i), x = s.x - cx, top = s.top - cy, y = Math.round(s.y - cy);
      ctx.fillStyle = '#686878'; for (const dx of [-5, 4]) { const n = Math.max(1, y - top); for (let k = 0; k < n; k += 2) ctx.fillRect(Math.round(x + dx + Math.sin(s.th) * 0), top + k, 1, 1); }
      ctx.fillStyle = OLC; ctx.fillRect(x - 7, y - 1, 14, 4); ctx.fillStyle = '#3870d8'; ctx.fillRect(x - 6, y, 12, 2); ctx.fillStyle = '#78a8f0'; ctx.fillRect(x - 6, y, 12, 1);
    }
    { // the seesaw's plank
      const l = sawEnd(f, -1), r = sawEnd(f, 1);
      ctx.strokeStyle = OLC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(l.x - cx, l.y - cy); ctx.lineTo(r.x - cx, r.y - cy); ctx.stroke();
      ctx.strokeStyle = '#f8c830'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(l.x - cx, l.y - cy); ctx.lineTo(r.x - cx, r.y - cy); ctx.stroke(); ctx.lineWidth = 1;
      for (const e of [l, r]) { ctx.fillStyle = OLC; ctx.fillRect(Math.round(e.x - cx) - 2, Math.round(e.y - cy) - 7, 4, 6); ctx.fillStyle = '#3870d8'; ctx.fillRect(Math.round(e.x - cx) - 1, Math.round(e.y - cy) - 6, 2, 5); }
    }
    { // the merry-go-round's wheel: four coloured quarters turning, a rail in the middle
      const a0 = JG.mgrAng(f), x = MGR_C[0] - cx, y = MGR_C[1] - cy + 2;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.72);
      ctx.fillStyle = OLC; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      ['#e04040', '#f8c830', '#3870d8', '#38a858'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 19, a0 + i * Math.PI / 2, a0 + (i + 1) * Math.PI / 2); ctx.fill(); });
      ctx.fillStyle = '#fafaf4'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = OLC; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 14, 4, 14); ctx.fillStyle = '#a0a0b0'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 13, 2, 13);
      for (let i = 0; i < 4; i++) { const a = a0 + i * Math.PI / 2 + Math.PI / 4, hx = Math.round(x + Math.cos(a) * 11), hy = Math.round(y + Math.sin(a) * 8); ctx.fillStyle = '#a0a0b0'; ctx.fillRect(Math.min(hx, Math.round(x)), hy - 10, Math.abs(hx - Math.round(x)) || 1, 1); ctx.fillRect(hx, hy - 10, 1, 6); }
    }
  }
  const HURDLES = () => { const sp = (G.maps.juegos.dogSpots || []).find(s => s.id === 'juegos_brincos'); return sp ? sp.path.filter(p => p[2]) : []; };
  Z.drawUnder = function (f, ctx) {
    zUnder(f, ctx);
    if (!G.state || !here(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    { // the kite hill: a soft green rise
      const x = HILL[0] * TL + 12 - cx, y = HILL[1] * TL + 18 - cy;
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#e8ffb0'; ctx.beginPath(); ctx.ellipse(x, y, 104, 62, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.14; ctx.beginPath(); ctx.ellipse(x, y - 8, 70, 40, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.12; ctx.fillStyle = '#18401a'; ctx.beginPath(); ctx.ellipse(x, y + 52, 100, 14, 0, 0, Math.PI); ctx.fill(); ctx.restore();
    }
    { // the soccer field's white lines
      const [x0, y0, w, h] = P('juegos', 'cancha'), X = x0 * TL - cx, Y = y0 * TL - cy, W = w * TL, H = h * TL;
      ctx.strokeStyle = 'rgba(250,250,244,0.8)'; ctx.lineWidth = 1; ctx.strokeRect(X + 0.5, Y + 0.5, W, H);
      ctx.beginPath(); ctx.moveTo(X + W / 2 + 0.5, Y); ctx.lineTo(X + W / 2 + 0.5, Y + H); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(X + W / 2 + 0.5, Y + H / 2, 20, 14, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(X + 0.5, Y + H / 2 - 24, 30, 48); ctx.strokeRect(X + W - 29.5, Y + H / 2 - 24, 30, 48);
    }
    for (const [x, y] of HURDLES()) { // the dog's jumping course: little striped hurdles
      const X = x * TL - cx, Y = y * TL - cy, up = Z.hurdle && Z.hurdle.x === x && Z.hurdle.y === y ? 0 : 0;
      ctx.fillStyle = OLC; ctx.fillRect(X + 3, Y + 9 - up, 3, 12); ctx.fillRect(X + 18, Y + 9 - up, 3, 12); ctx.fillRect(X + 3, Y + 11, 18, 4);
      ctx.fillStyle = '#fafaf4'; ctx.fillRect(X + 4, Y + 10, 1, 10); ctx.fillRect(X + 19, Y + 10, 1, 10);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i & 1 ? '#fafaf4' : '#e04040'; ctx.fillRect(X + 4 + i * 4, Y + 12, 4, 2); }
    }
    drawRides(f, ctx, cx, cy);
  };
  // the kite: stuck in the tall tree, then flying high over the hill (on its string)
  function drawKite(ctx, x, y, t, hold) {
    x = Math.round(x); y = Math.round(y);
    if (hold) { ctx.strokeStyle = 'rgba(250,250,240,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hold[0], hold[1]); ctx.quadraticCurveTo((hold[0] + x) / 2 + 10, (hold[1] + y) / 2 + 14, x, y + 6); ctx.stroke(); }
    for (let i = 0; i < 5; i++) { const tx = x - 4 - i * 4 + Math.sin(t / 8 + i) * 2, ty = y + 10 + i * 5; ctx.fillStyle = i & 1 ? '#f8c830' : '#e04040'; ctx.fillRect(Math.round(tx) - 1, Math.round(ty), 3, 2); }
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t / 20) * 0.15); G.drawIcon16(ctx, 'papalote', -8, -8, 1); ctx.restore();
  }
  JG.kite = null; // flying in the story: {x, y (world px), hold: e (who holds the string)}
  Z.drawTop = function (f, ctx) {
    zTop(f, ctx);
    if (!G.state) return;
    wandTrail(f, ctx);
    if (!here(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), t = G.frame;
    // the kite: stuck in the tree (before chapter 2's climb), flying in the story, then Pablo's over the hill
    const c2 = CH.ctx('juegos2'), got = c2 && c2.data && c2.data.got;
    if (!CH.done('juegos2') && !got) { const [kx, ky] = P('juegos', 'kite'); drawKite(ctx, kx * TL + 14 - cx, ky * TL + 6 - cy, 0, null); }
    if (JG.kite) { const h = JG.kite.hold, hp = h ? [Math.round(h.x * TL + 12 + (h.ox || 0) - cx + (JG.kite.dx || 0)), Math.round(h.y * TL + 4 + (h.oy || 0) - cy)] : null; drawKite(ctx, JG.kite.x - cx, JG.kite.y - cy, t, hp); }
    else if (CH.done('juegos2')) { const pb = npcAt(f, 'pablo'); if (pb && pb.x === PABLO_HILL[0] && pb.y === PABLO_HILL[1]) drawKite(ctx, pb.x * TL + 30 + Math.sin(t / 50) * 10 - cx, pb.y * TL - 70 + Math.sin(t / 33) * 6 - cy, t, [pb.x * TL + 18 - cx, pb.y * TL + 2 - cy]); }
    // the ball in the air
    const b = JG.ball; if (b) { const u = Math.min(1, (t - b.f0) / b.len), x = b.from[0] + (b.to[0] - b.from[0]) * u, y = b.from[1] + (b.to[1] - b.from[1]) * u, z = Math.sin(u * Math.PI) * b.h; drawBall(ctx, x - cx, y - z - cy, [Math.round(x - cx), Math.round(y + 14 - cy)]); }
    // Don Chuy's bubbles
    if (JG.bub) for (const o of JG.bub.list) { if (o.pop) { const k = o.pop / 14; ctx.fillStyle = '#e0f6ff'; for (let i = 0; i < 6; i++) { const a = i * 1.05; ctx.fillRect(Math.round(o.x + Math.cos(a) * (o.r + k * 6) - cx), Math.round(o.y - 14 + Math.sin(a) * (o.r + k * 6) - cy), 1, 1); } } else bubble(ctx, o.x - cx, o.y - 14 - cy, o.r); }
    if (JG.bub && G.top() === f) { const n = npcAt(f, 'chuy'); G.drawIcon16(ctx, 'burbujas', 8, G.H - 28); G.text(ctx, JG.bub.n + '/' + JG.bub.want, 28, G.H - 24, '#ffffff', '#203048'); void n; }
    // night in the park: a blue dusk, the lamps glow
    const dark = (G.day ? G.day.glow() : 0) * 0.55;
    if (dark > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = dark; ctx.fillStyle = '#304070'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const lights = [[f.player.x * TL + 12 + (f.player.ox || 0) - cx, f.player.y * TL + 12 + (f.player.oy || 0) - cy, 30]];
      const x0 = Math.floor(cx / TL) - 2, y0 = Math.floor(cy / TL) - 2;
      for (let y = y0; y < y0 + 14; y++) for (let x = x0; x < x0 + 18; x++) if (f.map.get(x, y) === 'L') lights.push([x * TL + 12 - cx, y * TL + 4 - cy, 40]);
      for (const [x, y, r] of lights) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,230,160,' + (0.5 * dark) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
      ctx.restore();
    }
  };
  // the held kite or bubble wand: shifted with you while you do an action or ride (carry.js draws it at your tile)
  const drawHeld0 = G.carry.drawHeld;
  G.carry.drawHeld = function (f, ctx) {
    const p = f.player; let o = null;
    if (here(f) && G.state) { const a = busyNow(p) ? p.act : null; if (a) { const r = pose(p, a, G.frame - a.f0); o = { dx: r.dx, dy: r.dy - r.z }; } else if (p.ride) { const r = ridePose(f, p, p.ride); if (r) o = { dx: r.wx - (p.x * TL + 12), dy: r.wy - (r.z || 0) - (p.y * TL + 21) }; } }
    if (JG.kite && JG.kite.hold === p) return; // (the kite is up in the sky on its string)
    if (!o) return drawHeld0.call(this, f, ctx);
    const ox = p.ox, oy = p.oy; p.ox += Math.round(o.dx); p.oy += Math.round(o.dy);
    try { return drawHeld0.call(this, f, ctx); } finally { p.ox = ox; p.oy = oy; }
  };
  // the animals' update: the bubbles' game ticks with it (one tick per frame)
  const anUp0 = AN.update;
  AN.update = function (f) { anUp0.call(this, f); if (here(f)) { JG.update(f); for (const id of ['ana', 'pablo']) { const n = f.npc(id); if (n) { hook(n); n.idle = id === 'ana' ? JG.anaIdle : JG.pabloIdle; } } hook(f.player); } };

  // =====================================================================
  //  The map
  // =====================================================================
  const AGI = P('juegos', 'agility');
  G.maps.juegos = {
    name: 'El parque de juegos', icon: 'juegos', rows: MD.juegos.rows, music: 'title',
    exits: [Z.edge(39, 13, 'camino_juegos', 1, 6, 'right')],
    posts: [{ at: P('juegos', 'post'), zone: 'juegos' }],
    // the dog's things to do: dig in the sandbox (a ball), run his jumping course, chase the pigeons
    dogSpots: [
      { id: 'juegos_arena', at: P('juegos', 'dog'), act: 'dig', gives: 'pelota', col: 'verde', every: 150 },
      { id: 'juegos_brincos', at: AGI, act: 'course', path: [[AGI[0] + 2, AGI[1], 1], [AGI[0] + 4, AGI[1], 1], [AGI[0] + 6, AGI[1], 1], [AGI[0] + 7, AGI[1], 0]], gives: 'palo', every: 90 },
      { id: 'juegos_palomas', at: P('juegos', 'palomasDog'), act: 'chase', kind: 'paloma', every: 60 },
    ],
    pages: K.pages('juegos'),
    ambient: { birds: 3, butterflies: 4 },
    animals: [
      { kind: 'paloma', n: 4, area: 'palomas' }, { kind: 'paloma', n: 2, area: 'hormigas' },
      { kind: 'catarina', n: 3, area: 'flores', on: 'o' }, { kind: 'abeja', n: 3, area: 'flores', on: 'o.' },
      { kind: 'hormiga', n: 6, area: 'hormigas', on: '.,o' }, { kind: 'lagartija', n: 2, area: 'rocas', on: '.,' },
      { kind: 'lombriz', n: 2, area: 'arenero', on: 's' },
      { kind: 'pato', n: 3, area: 'estanque' }, { kind: 'conejo', n: 2, area: 'conejos' },
      { kind: 'grillo', n: 3, area: 'pasto', when: 'noche' },                  // rare: at night on the kite hill
      { kind: 'colibri', n: 1, area: 'flores', on: 'o', when: 'manana' },     // rare: in the morning, at the flowers
    ],
    // tap anything (world.js): the swings, the slide, the seesaw, the trees, the flowers, the fountain, the water
    things: { tiles: { '!': 'columpio', '<': 'resbaladilla', '>': 'resbaladilla', '?': 'subibaja', '(': 'arbol', ')': 'arbol', '$': null, '^': null, '/': null, ';': null } },
    poke: (f, x, y) => { const c = f.map.get(x, y); if (c === '$') { G.audio.sfx('select'); for (let i = 0; i < 4; i++) trail.push({ m: f.mapId, x: x * TL + 12 + (Math.random() - 0.5) * 16, y: y * TL, t: 0, r: 2 + Math.random() * 2, ph: Math.random() * 6 }); return true; } if (c === ';') { G.audio.sfx('bounce'); return true; } return false; },
    onEnter: function* (f) { stagePeople(f); yield 1; },
    npcs: [
      K.canelo(36, 14), lola, Z.nico(...P('juegos', 'nico')),
      person('ana', ...ANA_AT, 'down', anaSide, anaLine, { fixed: true }),
      person('pablo', ...PABLO_AT, 'down', pabloSide, pabloLine, { fixed: true }),
      person('chuy', ...P('juegos', 'chuy'), 'down', chuySide, chuyLine, { fixed: true }),
    ],
  };
  // where the kids are: Pablo on the swings, or on the hill with his kite once he has it back (not during chapter 3)
  function stagePeople(f) {
    if (!here(f)) return;
    const pb = npcAt(f, 'pablo'); if (!pb || pb.busy || pb.moving) return;
    const onHill = CH.done('juegos2') && !CH.active('juegos3');
    const at = onHill ? PABLO_HILL : PABLO_AT;
    if (pb.x !== at[0] || pb.y !== at[1]) CK.place(f, 'pablo', at[0], at[1], onHill ? 'up' : 'down');
  }
  JG.stage = stagePeople;

  // ---------- things to pick up: sticks, the yellow ball on the soccer field ----------
  G.carry.SOURCES.push(
    { id: 'palo_cjuegos', map: 'camino_juegos', at: P('camino_juegos', 'palo'), item: 'palo', every: 90 },
    { id: 'palo_juegos', map: 'juegos', at: [11, 14], item: 'palo', every: 90 },
    { id: 'pelota_juegos', map: 'juegos', at: [20, 20], item: 'pelota', col: 'amarillo', every: 60, unique: true },
  );
  // ---------- Nico's hiding places in the park (seek.js) ----------
  G.seek.SPOTS.push(
    { id: 'juegos1', map: 'juegos', at: P('juegos', 'hide1'), how: 'over', cut: 10, dx: 0, kinds: ['paloma', 'conejo', 'gato'], place: 'burbujas' },     // behind Don Chuy's cart
    { id: 'juegos2', map: 'juegos', at: P('juegos', 'hide2'), how: 'over', cut: 9, dx: 0, kinds: ['paloma', 'lagartija', 'conejo'], place: 'resbaladilla' }, // behind the slide
    { id: 'juegos3', map: 'juegos', at: P('juegos', 'hide3'), how: 'over', cut: 9, dx: 0, kinds: ['lagartija', 'conejo', 'gato'], place: 'arena' },       // behind the sandcastle
    { id: 'juegos4', map: 'juegos', at: P('juegos', 'hide4'), how: 'over', cut: 12, dx: 0, kinds: ['paloma', 'gato', 'conejo'], place: 'banco' },       // behind a bench in the garden
    { id: 'juegos5', map: 'juegos', at: P('juegos', 'hide5'), how: 'over', cut: 8, dx: 0, kinds: ['conejo', 'lagartija', 'gato'], place: 'flor' },       // in a bush by the pond
    { id: 'juegos6', map: 'juegos', at: P('juegos', 'hide6'), how: 'over', cut: 16, dx: 0, kinds: ['paloma', 'gato', 'conejo'], place: 'arbol' },       // behind a tall tree
  );
  G.seek.KINDS.push('paloma', 'lagartija');
  Object.assign(G.seek.PEEK, { paloma: [3, 5], lagartija: [2, 3] });
  // ---------- favours (favores.js, from Villa Sol's chapter 7 on): the park's people ask about its words ----------
  const been = () => Z.visited('juegos');
  G.favores.OFFERS.push(['ana', 'thing', ['cuerda', 'pelota', 'columpio', 'resbaladilla', 'subibaja'], been], ['pablo', 'thing', ['papalote', 'pelota', 'columpio'], been], ['chuy', 'thing', ['burbujas', 'paloma', 'abeja', 'catarina', 'colibri'], been]);
  Object.assign(G.favores.THINGS, { ana: ['cuerda', 'pelota', 'columpio', 'resbaladilla', 'subibaja'], pablo: ['papalote', 'pelota', 'columpio'], chuy: ['burbujas', 'paloma', 'abeja', 'catarina', 'colibri'] });

  // =====================================================================
  //  The story: the park's quest line (G.chapters, line 'juegos')
  // =====================================================================
  CH.add({ id: 'juegos1', line: 'juegos', title: '¡Simón dice!', en: 'Simon says: Ana and Pablo show you four actions; then you are Simón', giver: 'ana', words: ['corre', 'salta', 'gira', 'baila'], icon: 'corre', col: '#e04040', goal: [['corre', 1], ['baila', 1]] });
  CH.add({ id: 'juegos2', line: 'juegos', title: 'El papalote de Pablo', en: 'Pablo\'s kite: climb up for it, then run fast on the hill to fly it', giver: 'pablo', words: ['papalote', 'sube', 'baja', 'rapido', 'despacio'], icon: 'papalote', col: '#3878d8', goal: [['papalote', 1]] });
  CH.add({ id: 'juegos3', line: 'juegos', title: '¡A los juegos!', en: 'The playground: the slide, push Pablo on the swing, the seesaw with Ana', giver: 'ana', words: ['resbaladilla', 'columpio', 'empuja', 'subibaja'], icon: 'resbaladilla', col: '#f8a020', goal: [['resbaladilla', 1], ['columpio', 1], ['subibaja', 1]] });

  // a kid shows an action word, you say it, everyone does it (new: a one-unknown puzzle; met: "¿Qué hace?")
  function* showVerb(f, id, who, en) {
    const n = npcAt(f, who);
    if (!met(id)) {
      let k = 0;
      yield* G.intro.watch(id, { who, prompt: '¡[' + id + ']!', en, known: othersFor(id, JG.VERBS.concat(['columpio', 'pelota', 'arbol', 'flor'])),
        act: function* () { k++; if (k === 1) { if (n) yield* JG.act(f, n, id); } else yield* JG.all(f, id); } });
      if (k < 2) yield* JG.all(f, id);
      return;
    }
    if (n) yield* JG.act(f, n, id);
    yield* ask(who, '¿Qué hace?', 'What is ' + G.nameOf(who) + ' doing? (say it!)', id, JG.verbsFor(id));
    yield* JG.all(f, id);
  }
  // ---------- 1 · ¡Simón dice!: corre, salta (Ana), gira, baila (Pablo); then you are Simón ----------
  CH.script('juegos1', [
    { who: 'ana', run: function* (f, c) {
      yield* say('ana', T('¡Hola, {name}! Soy Ana.', 'Hi, {name}! I\'m Ana. I love to run and jump!'));
      yield* sayShow('ana', 'juegos', T('¡Vamos a jugar!', 'Let\'s play! Watch me, then you do it.'));
      yield* showVerb(f, 'corre', 'ana', 'Run!');
      yield* showVerb(f, 'salta', 'ana', 'Jump!');
      const pb = npcAt(f, 'pablo'); if (pb) CH.pointNpc(pb);
      try { yield* sayShow('ana', null, T('¡Y Pablo!', 'And Pablo! Go and play with him.')); } finally { CH.point(null); }
      c.data.pablo = 1;
    } },
    { who: 'pablo', run: function* (f, c) {
      yield* say('pablo', T('¡Hola! Soy Pablo.', 'Hi! I\'m Pablo. Watch this!'));
      yield* showVerb(f, 'gira', 'pablo', 'Spin!');
      yield* showVerb(f, 'baila', 'pablo', 'Dance!');
      const pb = npcAt(f, 'pablo'); if (pb) { pb.ride0 = null; yield* CK.walk(f, pb, ANA_AT[0] - 1, ANA_AT[1] + 1, 4); }
      c.data.simon = 1;
      yield* sayShow('pablo', null, T('¡Con Ana!', 'Come on, to Ana! Let\'s play Simon says!'));
    } },
    { who: 'ana', run: function* (f, c) {
      yield* sayShow('ana', 'corre', T('¡Simón dice! ¡Tú eres Simón!', 'Simon says! You are Simón: say what we all do!'));
      for (let r = 0; r < 3; r++) { const v = yield* JG.choose(f, { prompt: '¡Simón dice...!', en: 'Simon says...! (say an action, or tap one: everyone does it)', who: 'ana', verbs: ['corre', 'salta', 'gira', 'baila'] }); if (!v) break; }
      const w = ['corre', 'salta', 'gira', 'baila'][G.r(4)];
      yield* sayShow('ana', null, T('¡Ahora yo!', 'Now me! Listen...'));
      yield* ask('ana', '¡Simón dice: [' + w + ']!', 'Simon says...! Which one? (listen)', w, JG.verbsFor(w), { pic: true });
      yield* JG.all(f, w);
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('ana', 'corre', T('¡Muy bien, Simón!', 'Well done, Simón! Come and play again tomorrow!'));
      const pb = npcAt(f, 'pablo'); if (pb) yield* CK.walk(f, pb, PABLO_AT[0], PABLO_AT[1], 4);
    } },
  ], {
    stage(f, c) { if (!here(f)) return; if (c.data.simon) { const pb = npcAt(f, 'pablo'); if (pb && !pb.busy && (pb.x !== ANA_AT[0] - 1 || pb.y !== ANA_AT[1] + 1)) CK.place(f, 'pablo', ANA_AT[0] - 1, ANA_AT[1] + 1, 'right'); } },
  });

  // ---------- 2 · El papalote de Pablo: el papalote, sube, baja, rápido, despacio ----------
  const KITE = P('juegos', 'kite');
  CH.script('juegos2', [
    { who: 'pablo', run: function* (f, c) {
      yield* sayShow('pablo', null, T('¡Ay, {name}!', 'Oh no, {name}!'));
      CH.point(KITE[0] * TL + 14, KITE[1] * TL);
      try {
        yield* meetW('papalote', { who: 'pablo', prompt: '¡Mi [papalote]!', en: 'My kite! It\'s stuck up in the tree!', known: othersFor('papalote', ['arbol', 'pelota', 'columpio', 'flor']) });
        yield* sayShow('pablo', { icon: 'papalote' }, T('¡Allá arriba!', 'Up there! Climb the frame and get it!'));
      } finally { CH.point(null); }
      c.data.asked = 1;
      const pb = npcAt(f, 'pablo'); if (pb) { pb.ride0 = null; yield* CK.walk(f, pb, FRAME[0] - 1, FRAME[1] + 1, 4); }
    } },
    { spot: { map: 'juegos', at: FRAME, icon: { icon: 'papalote' } }, run: function* (f, c) {
      const pb = npcAt(f, 'pablo');
      yield* JG.tpr('sube', { who: 'pablo', prompt: '¡[sube:Sube]!', en: 'Climb up!', ask: '¿Y el [papalote]? ¿Qué hago?', askEn: 'The kite is up there! What do I do?',
        demo: function* () { if (pb) yield* JG.act(f, pb, 'sube'); }, act: function* () { yield* JG.frameRide(f, 'up'); yield* JG.frameRide(f, 'top'); } });
      c.data.got = 1; G.audio.jingle('item'); CK.sparkle(f, KITE[0], KITE[1], 5);
      bag().add('papalote', { q: 'juegos2' });
      yield 30;
      yield* JG.tpr('baja', { who: 'pablo', prompt: '¡Ahora [baja]!', en: 'Now come down!', ask: '¡Ya! ¿Y ahora?', askEn: 'Got it! And now? (up or down?)',
        demo: function* () { if (pb) yield* JG.act(f, pb, 'baja'); }, act: function* () { yield* JG.frameRide(f, 'down'); } });
      if (f.player.ride) f.player.ride = null;
    } },
    { who: 'pablo', bubble: { icon: 'papalote' }, run: function* (f, c) {
      yield* sayShow('pablo', 'papalote', T('¡Mi [papalote]! ¡[gracias:Gracias]!', 'My kite! Thank you!'));
      CH.point(HILL[0] * TL + 12, HILL[1] * TL);
      try { yield* sayShow('pablo', { icon: 'papalote' }, T('¡Al cerro! ¡Vamos!', 'To the hill! Let\'s fly it! (bring it up the hill)')); } finally { CH.point(null); }
      c.data.hill = 1;
      const pb = npcAt(f, 'pablo'); if (pb) yield* CK.walk(f, pb, PABLO_HILL[0], PABLO_HILL[1], 5);
    } },
    { spot: { map: 'juegos', at: HILL, icon: { icon: 'papalote' } }, run: function* (f, c) {
      const p = f.player, pb = npcAt(f, 'pablo'); hook(p);
      const room = Math.max(1, Math.min(3, (() => { let k = 0; while (k < 3 && !f.blocked(p.x + k + 1, p.y, p)) k++; return k; })()));
      // a run with the kite: off and back; fast: it climbs high; slowly: it sinks
      const run = function* (fast, slow) {
        const L = fast ? 70 : slow ? 150 : 100; p.ride = { kind: 'kite', f0: G.frame, len: L, D: room * TL, fast };
        JG.kite = { x: p.x * TL + 12, y: p.y * TL - 10, hold: p };
        for (let t = 0; t < L; t++) {
          const r = ridePose(f, p, p.ride), hi = fast ? Math.min(1, t / 40) : slow ? Math.max(0, 0.5 - t / L) : Math.min(0.45, t / 60) * (t < L * 0.7 ? 1 : (L - t) / (L * 0.3));
          JG.kite.dx = r.wx - (p.x * TL + 12); JG.kite.x = r.wx - 30 + Math.sin(t / 9) * 4; JG.kite.y = p.y * TL + 4 - hi * 78 - 10;
          if (t % (fast ? 4 : 10) === 0) puff('dust', r.wx, r.wy, { life: 16, vy: -0.2 });
          yield 1;
        }
        p.ride = null;
      };
      yield* JG.tpr('corre', { who: 'pablo', prompt: '¡[corre:Corre]!', en: 'Run! The wind will lift it!', ask: '¡El [papalote]! ¿Qué hago?', askEn: 'The kite! What do I do to make it fly?', show: 'papalote',
        demo: function* () { if (pb) yield* JG.act(f, pb, 'corre'); }, act: function* () { yield* run(false, false); } });
      yield* sayShow('pablo', { icon: 'papalote' }, T('¡Más!', 'Not high enough... faster!'));
      yield* JG.tpr('rapido', { who: 'pablo', prompt: '¡Más [rapido:rápido]!', en: 'Faster!', ask: '¿Cómo corro?', askEn: 'How do I run? (fast or slowly?)', show: { icon: 'papalote' },
        demo: function* () { if (pb) yield* JG.act(f, pb, 'corre', { speed: 'rapido' }); }, act: function* () { yield* run(true, false); } });
      c.data.flew = 1; G.audio.jingle('promote'); CK.confetti();
      JG.kite = { x: p.x * TL - 18, y: p.y * TL - 74, hold: p };
      yield* sayShow('pablo', { icon: 'papalote' }, T('¡Sí! ¡Mira!', 'Yes! Look how high it flies!'));
      yield* JG.tpr('despacio', { who: 'pablo', prompt: '¿Y [despacio]?', en: 'And slowly?', ask: '¿Y ahora? ¿Cómo?', askEn: 'And now? How?', known: othersFor('despacio', ['rapido', 'papalote', 'columpio']),
        demo: function* () { if (pb) yield* JG.act(f, pb, 'corre', { speed: 'despacio' }); }, act: function* () { yield* run(false, true); } });
      yield* sayShow('pablo', { icon: 'papalote' }, T('¡Se cae!', 'It\'s falling! Slowly doesn\'t work!'));
      yield* quiz('pablo', '¿Cómo vuela?', 'How do you run to make it fly?', 'rapido', ['despacio'], { show: { icon: 'papalote' } });
      yield* run(true, false);
      JG.kite = null; bag().take('papalote', { q: 'juegos2' });
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('pablo', 'papalote', T('¡[gracias:Gracias], {name}!', 'Thank you, {name}! I\'ll fly it up here every day. Come and see!'));
    } },
  ], {
    stage(f, c) {
      if (!here(f)) return; const pb = npcAt(f, 'pablo'); if (!pb || pb.busy) return;
      const at = c.data.hill ? PABLO_HILL : c.data.asked ? [FRAME[0] - 1, FRAME[1] + 1] : null;
      if (at && (pb.x !== at[0] || pb.y !== at[1])) CK.place(f, 'pablo', at[0], at[1], c.data.hill ? 'up' : 'down');
    },
  });

  // ---------- 3 · ¡A los juegos!: la resbaladilla, el columpio (empuja), el subibaja ----------
  CH.script('juegos3', [
    { who: 'ana', run: function* (f, c) {
      yield* sayShow('ana', 'juegos', T('¡{name}! ¡A los juegos!', '{name}! Let\'s play on everything!'));
      CH.point(SLIDE[0] * TL + 24, SLIDE[1] * TL);
      try { yield* meetW('resbaladilla', { who: 'ana', prompt: '¡La [resbaladilla]!', en: 'The slide! First the slide!', show: 'resbaladilla', known: othersFor('resbaladilla', ['columpio', 'arbol', 'pelota', 'flor']) }); } finally { CH.point(null); }
      c.data.go = 1;
    } },
    { spot: { map: 'juegos', at: SLIDE, icon: 'resbaladilla' }, run: function* (f, c) {
      yield* JG.tpr('sube', { who: 'ana', prompt: '¡[sube:Sube]!', en: 'Climb up!', ask: '¡La [resbaladilla]! ¿Qué hago?', askEn: 'The slide! What do I do first?', act: function* () { yield* JG.slideRide(f, 'up'); yield* JG.slideRide(f, 'top'); } });
      yield 10;
      yield* JG.tpr('baja', { who: 'ana', prompt: '¡[baja:Baja]!', en: 'Go down!', ask: '¿Y ahora?', askEn: 'And now?', act: function* () { G.audio.sfx('swing'); yield* JG.slideRide(f, 'down'); } });
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog) { G.pet.place(f, dog); yield 10; CK.bark(f, dog); yield* G.pet.play('jump'); }
      CH.point(SWINGS[1][0] * TL + 12, SWINGS[1][1] * TL);
      try { yield* meetW('columpio', { who: 'ana', prompt: '¡Ahora, el [columpio]!', en: 'Now the swing! Pablo is waiting.', known: othersFor('columpio', ['resbaladilla', 'arbol', 'pelota']) }); } finally { CH.point(null); }
      c.data.swing = 1;
    } },
    { spot: { map: 'juegos', at: SWINGS[1], icon: 'columpio' }, run: function* (f, c) {
      const pb = npcAt(f, 'pablo'), ana = npcAt(f, 'ana'), p = f.player;
      if (pb) { hook(pb); pb.ride0 = null; pb.ride = { kind: 'swing', i: 1, f0: G.frame, amp: 0.08 }; }
      yield* sayShow('pablo', 'columpio', T('¡{name}! ¡Más!', '{name}! Give me a push!'));
      const push = function* () { p.dir = p.y < SWINGS[1][1] ? 'down' : p.x < SWINGS[1][0] ? 'right' : p.x > SWINGS[1][0] ? 'left' : 'up'; yield* JG.act(f, p, 'empuja'); if (pb && pb.ride) { pb.ride.amp = Math.min(0.95, pb.ride.amp + 0.3); pb.ride.f0 = G.frame - 30; } G.audio.sfx('swing'); yield 20; };
      yield* JG.tpr('empuja', { who: 'pablo', prompt: '¡[empuja:Empújame]!', en: 'Push me!', ask: '¿Qué hago?', askEn: 'What do I do? (Pablo wants to go higher)', show: 'columpio',
        demo: function* () { if (ana) yield* JG.act(f, ana, 'empuja'); }, act: push });
      for (let k = 0; k < 2; k++) {
        const r = yield G.choose({ prompt: '¡Más!', en: 'More! (say it, or tap it)', choices: [{ word: 'empuja' }], layout: 'cards', mic: true, who: 'pablo' });
        if (r.result !== 0) break; if (G.cards) G.cards.grow('empuja', 'tap'); yield* push();
      }
      yield* sayShow('pablo', 'columpio', T('¡Wiii! ¡[gracias:Gracias]!', 'Wheee! So high! Thank you!'));
      if (pb) pb.ride = null;
      CH.point(SAW[1][0] * TL + 12, SAW[1][1] * TL);
      try { yield* meetW('subibaja', { who: 'ana', prompt: '¡Y el [subibaja]!', en: 'And the seesaw! With me!', known: othersFor('subibaja', ['columpio', 'resbaladilla', 'pelota']) }); } finally { CH.point(null); }
      c.data.saw = 1;
      if (ana) yield* CK.walk(f, ana, SAW[2][0] + 1, SAW[2][1], 4);
    } },
    { spot: { map: 'juegos', at: SAW[0], icon: 'subibaja' }, run: function* (f, c) {
      const p = f.player, ana = npcAt(f, 'ana'); hook(p);
      p.ride = { kind: 'seesaw', side: -1, f0: G.frame, ang: 0.3 }; if (ana) { hook(ana); ana.ride = { kind: 'seesaw', side: 1, f0: G.frame }; }
      const tilt = function* (to) { const from = p.ride.ang; for (let k = 0; k <= 24; k++) { p.ride.ang = from + (to - from) * k / 24; yield 1; } G.audio.sfx(to < 0 ? 'cursor' : 'boop'); };
      yield* tilt(-0.32); // you go up
      yield* quiz('ana', '¿Y tú?', 'And you? Are you going up or down?', 'sube', ['baja']);
      yield* tilt(0.32);  // you go down
      yield* quiz('ana', '¿Y ahora?', 'And now?', 'baja', ['sube']);
      for (let k = 0; k < 4; k++) { const up = k % 2 === 0; yield* tilt(up ? -0.32 : 0.32); sayVerb(f, up ? 'sube' : 'baja', SAW[0][0] * TL + 12, SAW[0][1] * TL - 20); yield 10; }
      p.ride = null; if (ana) ana.ride = null;
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('ana', 'juegos', T('¡Qué divertido, {name}!', 'What fun, {name}! The whole playground!'));
      if (met('baila')) yield* JG.all(f, 'baila');
      if (ana) yield* CK.walk(f, ana, ANA_AT[0], ANA_AT[1], 4);
    } },
  ], {
    stage(f, c) {
      if (!here(f) || !CH.active('juegos3')) return;
      const pb = npcAt(f, 'pablo'); if (pb && !pb.busy && (pb.x !== PABLO_AT[0] || pb.y !== PABLO_AT[1])) CK.place(f, 'pablo', PABLO_AT[0], PABLO_AT[1], 'down');
      const ana = npcAt(f, 'ana'), at = c.data.saw ? [SAW[2][0] + 1, SAW[2][1]] : ANA_AT; if (ana && !ana.busy && (ana.x !== at[0] || ana.y !== at[1])) CK.place(f, 'ana', at[0], at[1], 'down');
    },
  });

  // =====================================================================
  //  The zone
  // =====================================================================
  const bus = P('juegos', 'bus'), busIn = P('juegos', 'busIn');
  Z.add({
    id: 'juegos', name: 'El parque de juegos', en: 'the playground', icon: 'juegos', music: 'title', pos: [54, 100],
    maps: ['juegos'], path: 'camino_juegos',
    bus: { map: 'juegos', at: bus }, entry: { map: 'juegos', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: KINDS, // the album page, in order
    habitat: { paloma: 'fuente', catarina: 'hoja', hormiga: 'banco', abeja: 'flor', lagartija: 'rocas', lombriz: 'arena', grillo: 'papalote', colibri: 'flor' },
    rare: { grillo: 'noche', colibri: 'manana' },
    planned: 0,
    lola: lolaHere,
  });
})();
