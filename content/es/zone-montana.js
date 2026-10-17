// ===== La montaña: the zone east of Villa Sol (docs/WORLD_PLAN.md) — the weather, snow and the cold =====
// Its path from Villa Sol (rolling hills, boulders, the peaks behind, a goat) and the mountain: a green meadow below
// (the bus stop, Mateo's weather station with its vane, Don Lucho's refuge under a snowy roof, the llamas' corral, a
// grove of tall firs full of monarch butterflies) and the snow above (snowy pines, the sledding slope with the sled at
// its top, the snowfield where the snowman stands, the marmots' rocks, the frozen pond you can skate on, the lookout
// on its crag with binoculars: the view over the clouds), snowy peaks all along the top. Inside the refuge: the
// fireplace and the pot of hot chocolate, a long table, bunk beds.
// The WEATHER changes here: it snows, the sun shines, clouds float over, the wind blows, it rains (G.montana.weather);
// at Mateo's weather station the child SAYS the weather she wants and it comes (after rain, the sun brings a rainbow).
// Up in the snow it's cold: without a gorro, a bufanda, guantes (or the grandparents' chamarra) you shiver ("¡Brrr!");
// what you put on is worn on every map (the grandparents' clothes, G.abuelos.wear: gorro, bufanda, guantes join it).
// Everything only uses universal words and the zone's own (each met here in a one-unknown puzzle, G.zones.meetW, and
// used again right away), so the mountain can be the very first place a child explores.
//   The album (8): la llama (the corral, the meadow), la marmota (pops out of its burrow, ducks in), el zorrillo (the
//     meadow; tapped, its tail goes up: a little green cloud), el pájaro carpintero (on the firs' trunks: toc, toc), la
//     mariposa monarca (the grove: lots of them), el puma (asleep on a sunny ledge), el águila (rare: only when the sun
//     shines, soaring over the lookout), el lobo (rare: at night on the lookout's crag, howling at the moon).
//     Tapping one whose word isn't met: Lola names it.
//   The story (its quest line, 'montana'): 1 ¡Qué frío! (lamontana, nieve, frio, gorro, bufanda, guantes: Don Lucho; up
//     in the snow you shiver; warm clothes from the refuge's basket), 2 El muñeco de nieve (muneco, chocolate: Mateo; roll
//     three snowballs, a carrot nose from Don Lucho (his llamas love carrots), a hat and a scarf, the dog steals the
//     nose; then hot chocolate in the refuge), 3 ¡El arcoíris! (viento, nube, lluvia, arcoiris: Mateo's weather
//     station: wind, clouds, rain... the child brings the sun: a rainbow).
//   Side quests (G.state.montana): the weather station (say the weather you want), Mateo's "¿Qué tiempo hace?", Don
//     Lucho's hot chocolate (pour the cups, count them; the dog gets a bone: no chocolate for dogs), a sled race with
//     the dog down the slope (he pulls you back up), skating on the frozen pond, animal tracks in the snow (the dog
//     follows them: who made them?), the lookout's view over the clouds, dressing the snowman. The dog rolls in the snow,
//     digs a snow tunnel, chases the marmots. Six hiding places, three page puzzles, favours.
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
  const inZone = f => !!f && (f.mapId === 'montana' || f.mapId === 'montana_refugio');
  const outside = f => !!f && f.mapId === 'montana';
  const indoors = f => !!f && f.mapId === 'montana_refugio';
  const MT = G.montana = {};
  const AB = G.abuelos; // (the clothes you wear: content/es/zone-abuelos.js, loaded before this file)
  const puff = (k, x, y, o) => CK.puff(k, x, y, o);
  const wait = function* (n) { for (let i = 0; i < n; i++) yield 1; };
  const OLC = '#1a1420';

  // ---------- the path from Villa Sol: rolling hills, boulders, the mountains behind, a goat on the slope ----------
  const IN = P('montana', 'in');
  G.maps.camino_montana = {
    name: 'El camino a la montaña', icon: 'montana', rows: MD.camino_montana.rows, music: 'field',
    exits: [Z.edge(0, 6, 'villa', 46, 10, 'left'), Z.edge(29, 6, 'montana', IN[0], IN[1], 'right')],
    posts: [{ at: P('camino_montana', 'postW'), zone: 'villa', dir: 'left' }, { at: P('camino_montana', 'postE'), zone: 'montana', dir: 'right' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'cabra', area: 'cabras' }],
    things: {},
    npcs: [K.canelo(2, 6)],
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
  const SNOW = 'ü', LAND = '.o,';
  AN.addKind('llama', { word: 'llama', cry: '¡Mmmm!', move: 'walk', speed: 0.25, shadow: 12, on: LAND + SNOW,
    sfx: () => { tone('sine', 420, 380, 0.5, 0.08, 0, { vib: 6, depth: 10 }); tone('sine', 380, 440, 0.3, 0.06, 0.45, { vib: 6, depth: 10 }); },
    spr: pad({ pal: { w: '#f0e4cc', d: '#d8c8a8', k: '#5a4030', e: '#101010', r: '#e04040', y: '#f8d030', g: '#38a858' },
      stand: ['..........k.k', '..........w.w', '..........r.g', '.........wwww', '.........wwew', '.........wwwkk', '.........www.', '.........www.', '.........wry.', 'ww.......www.', 'wwwwwwwwwwww.', '.wwddwwwwwww.', '.wwwwwwwwwww.', '..ww.w...ww.w', '..w..w...w..w', '..k..k...k..k'],
      walk: ['..........k.k', '..........w.w', '..........r.g', '.........wwww', '.........wwew', '.........wwwkk', '.........www.', '.........www.', '.........wry.', 'ww.......www.', 'wwwwwwwwwwww.', '.wwddwwwwwww.', '.wwwwwwwwwww.', '..w..ww.w..w.', '.w....w.w...w', '.k....k.k...k'],
      react: ['.........k.k.', '..........ww.', '..........rg.', '.........wwww', '.........wwek', '.........wwwkk', '.........www.', '.........www.', '.........wry.', 'ww.......www.', 'wwwwwwwwwwww.', '.wwddwwwwwww.', '.wwwwwwwwwww.', '..ww.w...ww.w', '..w..w...w..w', '..k..k...k..k'] }) }); // (tapped: ears back, a hum)
  AN.addKind('marmota', { word: 'marmota', cry: '¡Fiiiu!', move: 'peek', shadow: 8, on: SNOW + LAND,
    sfx: () => { tone('sine', 2400, 3000, 0.25, 0.05); },
    spr: pad({ pal: { b: '#a06a38', d: '#7a4a20', c: '#e0c098', e: '#101010', n: '#402018', h: '#3a2818', s: '#c8d8ea' },
      stand: ['..d..d..', '.bbbbbb.', '.bebbeb.', '.bbnnbb.', '..bccb..', '.dbccbd.', '.bbccbb.', '.bbccbb.', '.bbbbbb.', 'ssddddss'],
      alt: ['..d..d..', '.bbbbbb.', '.bebbeb.', '.bbnnbb.', '..bkkb..', 'dbbccbbd', 'd.bccb.d', '.bbccbb.', '.bbbbbb.', 'ssddddss'],
      peek: ['........', '........', '........', '........', '........', '..d..d..', '.bbbbbb.', '.bebbeb.', 'shhnnhhs', 'sshhhhss'],
      hole: ['........', '........', '........', '........', '........', '........', '........', '.ssssss.', 'sshhhhss', 'ssssssss'] }) });
  AN.addKind('zorrillo', { word: 'zorrillo', cry: '¡Fff!', move: 'walk', speed: 0.3, shadow: 10, on: LAND + SNOW,
    sfx: () => { noise(1800, 0.3, 0.05, 0, { filter: 'bandpass', ff: 2000, q: 2 }); },
    spr: pad({ pal: { k: '#282830', w: '#f4f4f4', e: '#ffffff', p: '#f090a0' },
      stand: ['.kkk.........', 'kkwkk........', 'kwwwk........', 'kkwkk...kwk..', '.kwk...kwwwkk', '..kwwwwwwwkek', '..kkkkkkkkkkp', '...k.k...k.k.'],
      walk: ['.kkk.........', 'kkwkk........', 'kwwwk........', 'kkwkk...kwk..', '.kwk...kwwwkk', '..kwwwwwwwkek', '..kkkkkkkkkkp', '..k...k.k...k'],
      react: ['..kkkk.......', '.kkwwkk......', '.kwwwwk......', '.kkwwkk.kwk..', '..kwwk.kwwwkk', '..kkwwwwwwkek', '..kkkkkkkkkkp', '...k.k...k.k.'] }) }); // (tapped: its tail up high)
  AN.addKind('carpintero', { word: 'carpintero', cry: '¡Toc, toc, toc!', move: 'cling', shadow: 0, high: 16, trees: ')',
    sfx: () => { for (const at of [0, 0.07, 0.14, 0.21]) noise(900, 0.03, 0.12, at, { filter: 'bandpass', ff: 1200, q: 4 }); },
    spr: pad({ pal: { k: '#202028', w: '#f4f4f4', r: '#e02828', g: '#808080', e: '#ffffff' },
      stand: ['.rr...', 'rkkg..', 'kekgg.', 'kwk...', 'kwkk..', 'kwwk..', 'kkwk..', '.kkk..', '.k.k..'],
      peck: ['......', '.rr...', 'rkkgg.', 'kek...', 'kwkk..', 'kwwk..', 'kkwk..', '.kkk..', '.k.k..'],
      fly: ['k.....', 'kk.rr.', 'kwkkkg', '.kkek.', '..kk..', '......', '......', '......', '......'],
      fly2: ['......', '...rr.', 'kkkkkg', 'kwkek.', 'k.kk..', '......', '......', '......', '......'] }) });
  AN.addKind('monarca', { word: 'monarca', cry: null, move: 'flit', speed: 0.3, shadow: 0, on: LAND,
    sfx: () => { tone('sine', 1800, 2400, 0.1, 0.03); },
    spr: pad({ pal: { o: '#f88010', k: '#202020', w: '#ffffff' },
      stand: ['kk.kk', 'ookoo', 'wokow', '.okn.', '..k..'].map(r => r.replace('n', 'o')),
      alt: ['.....', 'kkkkk', 'ookoo', '..k..', '.....'] }) });
  AN.addKind('puma', { word: 'puma', cry: '¡Grrrau...!', move: 'still', shadow: 16, on: SNOW + LAND,
    sfx: () => { tone('sawtooth', 220, 160, 0.5, 0.07, 0, { filter: 'lowpass', ff: 700 }); },
    spr: pad({ pal: { t: '#d09a60', d: '#b07840', w: '#f8f0e0', k: '#3a2410', e: '#101010', p: '#e07080' },
      stand: ['..................tt.', '................ttttt', '.dd.............tkkt.', 'd..tttttttttttttwwp.', 'd.tttttttttttttttww..', '.dttdddtttttddttt....', '..wwwwwwwwwwwwwww....'],
      alt: ['..................t.t', '................ttttt', '.dd.............teet.', 'd..tttttttttttttwkkw', 'd.tttttttttttttttwpw.', '.dttdddtttttddttt....', '..wwwwwwwwwwwwwww....'] }) }); // (asleep; its other frame: a big yawn)
  AN.addKind('aguila', { word: 'aguila', cry: '¡Kiiiaaa!', move: 'soar', shadow: 10, high: 60, on: SNOW + LAND,
    sfx: () => { tone('sawtooth', 2400, 1600, 0.5, 0.05, 0, { filter: 'bandpass', ff: 2200, q: 2 }); },
    spr: pad({ pal: { b: '#6a4020', d: '#3a2010', y: '#d8a040', k: '#f8d020', e: '#101010' },
      stand: ['d..............d', 'bb............bb', '.bbb...yy...bbb.', '..bbbbbyekbbbb..', '...bbbbbbbbbb...', '......bbbb......', '.....bb..bb.....'],
      alt: ['................', '................', '.......yy.......', 'dbbbbbbyekbbbbbd', '.bbbbbbbbbbbbbb.', '......bbbb......', '.....bb..bb.....'] }) });
  AN.addKind('lobo', { word: 'lobo', cry: '¡Auuuuu!', move: 'still', shadow: 14, on: SNOW + LAND,
    sfx: () => { tone('sine', 380, 620, 0.5, 0.09, 0, { vib: 5, depth: 12 }); tone('sine', 620, 520, 0.9, 0.08, 0.5, { vib: 5, depth: 14 }); },
    spr: pad({ pal: { g: '#7a7a88', d: '#5a5a68', w: '#e0dcd8', e: '#e8a020', k: '#101010' },
      stand: ['..........d.d..', '..........ggg..', '.........ggegk.', '.........gwwww.', '........ggww...', '..gg...gggw....', '.gggggggggg....', 'dd.ggggggg.....', '...g.g..gg.....', '...k.k..kk.....'],
      alt: ['.........d.d.kk', '.........gggww.', '.........geg...', '........ggww...', '........ggw....', '..gg...gggw....', '.gggggggggg....', 'dd.ggggggg.....', '...g.g..gg.....', '...k.k..kk.....'] }) }); // (its other frame: howling at the moon)
  const KINDS = ['llama', 'marmota', 'zorrillo', 'carpintero', 'monarca', 'puma', 'aguila', 'lobo'];
  const EN = { llama: 'A llama!', marmota: 'A marmot!', zorrillo: 'A skunk! (phew!)', carpintero: 'A woodpecker!', monarca: 'A monarch butterfly!', puma: 'A puma! (asleep in the sun)', aguila: 'An eagle!', lobo: 'A wolf! (howling at the moon)' };
  const CLASH = { monarca: ['mariposa'], carpintero: ['pajaro'], muneco: ['nieve'], nieve: ['muneco'] }; // (they sound alike: never on one question)
  MT.KINDS = KINDS;

  // =====================================================================
  //  Saved state: G.state.montana
  // =====================================================================
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.montana)) s.montana = {};
    const m = s.montana; for (const k of ['wx', 'choco', 'sled', 'skate', 'tracks', 'mateo', 'snowman']) if (!isObj(m[k])) m[k] = {};
    return m;
  }
  MT.state = () => (G.state ? st() : null);
  const daily = k => { const o = st()[k]; if (o.d !== day()) { for (const x in o) delete o[x]; o.d = day(); } return o; };
  const held = () => (G.carry ? G.carry.held() : null);
  const bag = () => G.errands.bag;
  const othersFor = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 4)).filter((k, i, a) => a.indexOf(k) === i && k !== id && !(CLASH[id] || []).includes(k)).slice(0, 2);
  const quiz = (who, prompt, en, answer, others, o) => ask(who, prompt, en, answer, others.filter(k => k !== answer && met(k) && !(CLASH[answer] || []).includes(k)).slice(0, 2), o || {});

  // =====================================================================
  //  CLOTHES for the cold: el gorro, la bufanda, los guantes (worn everywhere, with the grandparents' clothes)
  // =====================================================================
  const WARM = ['gorro', 'bufanda', 'guantes'];
  MT.WARM = WARM;
  for (const id of WARM) if (!AB.CLOTHES.includes(id)) AB.CLOTHES.push(id); // (the grandparents' trunk offers them too, once met)
  Object.assign(AB.FIRST, { gorro: '#3870d8', bufanda: '#e04040', guantes: '#8a50c8' });
  // the look: a knitted cap (head 'beanie': over the sombrero), a scarf, mittens (src/sprites.js)
  const wear0 = G.st.playerSpec; let memo = { k: null, v: null };
  G.st.playerSpec = function () {
    const base = wear0.apply(this, arguments), w = AB.wear();
    if (!w || !(w.gorro || w.bufanda || w.guantes)) return base;
    const k = JSON.stringify([G.state && G.state.look, w]); if (memo.k === k) return memo.v;
    const dress = s => { const o = Object.assign({}, s); if (w.gorro) { o.head = 'beanie'; o.headColor = w.gorro; } if (w.bufanda) o.scarf = w.bufanda; if (w.guantes) o.gloves = w.guantes; return o; };
    memo = { k, v: { map: dress(base.map), portrait: dress(base.portrait) } };
    return memo.v;
  };
  const putOn0 = AB.putOn;
  AB.putOn = function (f, id, col) { // (a cap or a hat: one or the other)
    const w = AB.wear(); if (id === 'gorro' && w.sombrero) delete w.sombrero; if (id === 'sombrero' && w.gorro) delete w.gorro;
    return putOn0.call(this, f, id, col);
  };
  const warm = () => { const w = AB.wear() || {}; return !!(w.gorro || w.bufanda || w.guantes || w.chamarra) || (MT.cocoa && G.frame < MT.cocoa); };
  MT.warm = warm;
  const pic = id => ({ icon: id, col: (AB.wear() || {})[id] || AB.FIRST[id] });

  // =====================================================================
  //  The WEATHER: it snows, the sun shines, clouds float by, the wind blows, it rains. Mateo's station changes it.
  // =====================================================================
  const WX = ['nieve', 'elsol', 'nube', 'viento', 'lluvia'];
  MT.WX = WX;
  const ROTA = ['nieve', 'elsol', 'nube', 'nieve', 'viento', 'elsol', 'lluvia'];
  MT.weather = function () {
    if (!G.state) return 'nieve';
    const w = st().wx;
    if (w.k && w.d === day()) return w.k;
    return CH.done('montana1') ? ROTA[day() % ROTA.length] : 'nieve'; // (it snows until the first chapter is done: wonder on arrival)
  };
  MT.trans = null;   // {from, to, f0}: the weather changing (a cross-fade)
  MT.rainbow = 0;    // the frame a rainbow came out (after rain, the sun)
  MT.setWeather = function (k, o = {}) {
    const from = MT.weather(); if (!WX.includes(k)) return;
    st().wx = { k, d: day() }; G.st.autosave();
    if (from === k && !o.force) return;
    MT.trans = { from, to: k, f0: G.frame };
    if (k === 'elsol' && (from === 'lluvia' || o.rainbow)) MT.rainbow = G.frame;
    else if (k !== 'elsol') MT.rainbow = 0;
    const f = G.field; if (f && outside(f) && AN.find && (k === 'elsol' || from === 'elsol')) f.zoo = null; // (the eagle comes out in the sun)
    G.audio.sfx(k === 'lluvia' ? 'swing' : k === 'elsol' ? 'chime' : k === 'viento' ? 'swing' : 'select');
  };
  MT.rainbowOn = () => !!MT.rainbow && MT.weather() === 'elsol' && G.frame - MT.rainbow < 60 * 60;
  const hsh = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  // the weather drawn over the map (screen space; u: how much of it, 0..1)
  function drawWx(ctx, k, u, f) {
    if (u <= 0) return;
    const t = G.frame, W = G.W, H = G.H, cx = f ? Math.round(f.cam.x) : 0, cy = f ? Math.round(f.cam.y) : 0;
    ctx.save(); ctx.globalAlpha = u;
    if (k === 'nieve') {
      ctx.fillStyle = 'rgba(232,240,255,0.10)'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 80; i++) {
        const sp = 0.4 + hsh(i, 1) * 0.7, x = ((hsh(i, 2) * (W + 40) + t * 0.25 * (hsh(i, 5) - 0.3) + Math.sin(t / 40 + i) * 8 - cx * 0.3) % (W + 40) + W + 40) % (W + 40) - 20, y = ((hsh(i, 3) * (H + 20) + t * sp - cy * 0.3) % (H + 20) + H + 20) % (H + 20) - 10;
        const s = hsh(i, 4) < 0.3 ? 2 : 1;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), s + 1, s + 1); if (s > 1) { ctx.fillStyle = '#c8dcf0'; ctx.fillRect(Math.round(x) + 2, Math.round(y) + 2, 1, 1); }
      }
    } else if (k === 'lluvia') {
      ctx.fillStyle = 'rgba(40,56,90,0.28)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(190,220,255,0.75)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 110; i++) {
        const x = ((hsh(i, 6) * (W + 40) - t * 1.6 - cx * 0.5) % (W + 40) + W + 40) % (W + 40) - 20, y = ((hsh(i, 7) * (H + 30) + t * (6 + hsh(i, 8) * 3) - cy * 0.5) % (H + 30) + H + 30) % (H + 30) - 15;
        ctx.moveTo(Math.round(x) + 0.5, Math.round(y)); ctx.lineTo(Math.round(x) - 1.5, Math.round(y) + 6);
      }
      ctx.stroke();
      for (let i = 0; i < 6; i++) { const ph = (t + i * 23) % 40, x = (hsh(i, t / 40 | 0) * W) | 0, y = (hsh(i + 9, t / 40 | 0) * H) | 0; if (ph < 14) { ctx.strokeStyle = 'rgba(220,240,255,' + (0.7 - ph / 20) + ')'; ctx.beginPath(); ctx.ellipse(x, y, 2 + ph / 3, 1 + ph / 7, 0, 0, Math.PI * 2); ctx.stroke(); } }
    } else if (k === 'nube') {
      ctx.fillStyle = 'rgba(70,80,100,0.16)'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) {
        const span = W + 220, x = ((hsh(i, 10) * span + t * (0.18 + hsh(i, 11) * 0.2) - cx * 0.6) % span + span) % span - 110, y = ((hsh(i, 12) * (H + 60) - cy * 0.6) % (H + 60) + H + 60) % (H + 60) - 30;
        ctx.fillStyle = 'rgba(30,40,60,0.12)'; ctx.beginPath(); ctx.ellipse(x + 10, y + 46, 60, 18, 0, 0, Math.PI * 2); ctx.fill(); // its shadow on the ground
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (const [dx, dy, r] of [[-34, 6, 18], [-12, -4, 24], [16, 0, 22], [38, 8, 16], [0, 12, 20]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (k === 'viento') {
      for (let i = 0; i < 26; i++) {
        const sp = 4 + hsh(i, 13) * 4, x = ((hsh(i, 14) * (W + 120) + t * sp) % (W + 120)) - 60, y = hsh(i, 15) * H + Math.sin(t / 12 + i) * 6, L = 16 + hsh(i, 16) * 26;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y - 4, x + L, y); ctx.stroke();
      }
      for (let i = 0; i < 10; i++) { const x = ((hsh(i, 17) * (W + 40) + t * (3 + hsh(i, 18) * 3)) % (W + 40)) - 20, y = hsh(i, 19) * H + Math.sin(t / 8 + i * 2) * 10; ctx.fillStyle = i & 1 ? '#58b040' : '#e8a030'; ctx.fillRect(Math.round(x), Math.round(y), 3, 2); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x * 0.7 + 40) % W, Math.round(y * 1.3 + 30) % H, 2, 2); }
    } else if (k === 'elsol') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(60,44,10,0.10)'; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W - 20, 10, 0, W - 20, 10, 120); g.addColorStop(0, 'rgba(255,240,180,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { const a = t / 300 + i * Math.PI / 3; ctx.strokeStyle = 'rgba(255,240,190,0.18)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(W - 20, 10); ctx.lineTo(W - 20 + Math.cos(a) * 160, 10 + Math.sin(a) * 160); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over';
      if (f) for (let i = 0; i < 8; i++) { const ph = (t + i * 17) % 50, x = (hsh(i, t / 50 | 0) * W) | 0, y = (hsh(i + 3, t / 50 | 0) * H) | 0, tx = Math.floor((x + cx) / TL), ty = Math.floor((y + cy) / TL); if (ph < 20 && f.map.get(tx, ty) === 'ü') { ctx.fillStyle = '#ffffff'; const s = ph < 10 ? ph / 4 : (20 - ph) / 4; ctx.fillRect(x - Math.round(s), y, Math.round(s) * 2 + 1, 1); ctx.fillRect(x, y - Math.round(s), 1, Math.round(s) * 2 + 1); } } // (the snow sparkles)
    }
    ctx.restore();
  }
  // the rainbow: a big soft arc across the sky (screen space)
  function drawRainbow(ctx, k, x0, y0, R, wb) {
    if (k <= 0) return;
    const C = ['#e83a30', '#f89020', '#f8d830', '#48b848', '#3a7ae0', '#8a50c8'];
    ctx.save(); ctx.globalAlpha = 0.42 * k; ctx.lineWidth = wb;
    C.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(x0, y0, R - i * wb, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke(); });
    ctx.restore();
  }
  MT.drawRainbow = drawRainbow;

  // =====================================================================
  //  The people of the mountain are drawn here while they do something (shiver, sled, skate, drink)
  // =====================================================================
  function arm(ctx, x0, y0, x1, y1, col) {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (const [c, s, d] of [[OLC, 4, -1], [col, 2, 0]]) { ctx.fillStyle = c; for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n) + d, Math.round(y0 + (y1 - y0) * i / n) + d, s, s); }
  }
  MT.start = function (e, k, len) { e.mt = { k, f0: G.frame, len: len || 60 }; return e.mt; };
  MT.act = function* (e, k, len) { const a = MT.start(e, k, len); while (e.mt === a && G.frame - a.f0 < a.len) yield 1; if (e.mt === a) e.mt = null; };
  const busy = e => !!(e.mt && G.frame - e.mt.f0 < e.mt.len);
  const handCol = e => { const s = e === (G.field && G.field.player) ? G.st.playerSpec().map : (e.spec || {}); return s.gloves || s.skin || '#f0c8a0'; };
  function drawMT(ctx, cx, cy) {
    const e = this, f = G.field; if (!f || !inZone(f)) return false;
    const sled = e.sled, skate = e.skate, act = busy(e) ? e.mt : null;
    if (!sled && !skate && !act) return false;
    let wx = e.x * TL + 12 + (e.ox || 0), wy = e.y * TL + 21 + (e.oy || 0), dir = e.dir || 'down', fr = 0, sx = 1, sy = 1, rot = 0, arms = null, dx = 0;
    const t = act ? G.frame - act.f0 : G.frame;
    if (sled) { wx = sled.x; wy = sled.y; dir = sled.up ? 'up' : 'down'; sy = 0.82; arms = [[-4, -10, -7, -6], [3, -10, 6, -6]]; }
    if (skate) { wx = skate.x; wy = skate.y; dir = skate.dir; rot = skate.lean || 0; fr = (G.frame >> 3) & 1; arms = [[-4, -12, -9, -12], [3, -12, 8, -12]]; }
    if (act && act.k === 'shiver') { dx = (t >> 1) & 1 ? 1 : -1; arms = [[-4, -12, 2, -11], [3, -12, -3, -11]]; if (t % 14 === 0) puff('steam', wx + 4, wy - 18, { life: 26, vy: -0.4, vx: 0.2 }); }
    if (act && act.k === 'drink') { arms = [[3, -12, 2, -15]]; if (t % 10 === 0) puff('steam', wx + 2, wy - 26, { life: 30, vy: -0.5 }); }
    if (act && act.k === 'throw') { arms = t < 12 ? [[3, -12, 8, -20]] : [[3, -12, 10, -12]]; }
    if (act && act.k === 'wave') { arms = [[3, -12, 8, (t >> 3) & 1 ? -21 : -18]]; }
    const x = Math.round(wx - cx + dx), y = Math.round(wy - cy);
    if (sled) { G.drawIcon16(ctx, 'trineo', x - 10, y - 10, 1.25); }
    else { ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(x - 7, y, 14, 2); }
    const img = G.unitSprite(e.spec, dir, fr);
    ctx.save(); ctx.translate(x, y - (sled ? 4 : 0)); if (rot) ctx.rotate(rot); ctx.scale(sx, sy);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -12, -24);
    if (arms) { const flip = dir === 'left' ? -1 : 1, col = handCol(e); for (const [a0, b0, a1, b1] of arms) arm(ctx, a0 * flip, b0, a1 * flip, b1, col); }
    if (act && act.k === 'drink') G.drawIcon16(ctx, 'chocolate', -1, -24, 0.5);
    ctx.restore();
    return true;
  }
  const hook = e => { if (e) e.drawSelf = drawMT; };
  MT.hook = hook;

  // up in the snow without warm clothes: you shiver ("¡Brrr!"); the dog shakes the snow off now and then
  const snowAt = (f, x, y) => { const c = f.map.get(x, y); return c === 'ü' || c === 'ö'; };
  let lastShiver = -9999;
  MT.cold = f => !!f && outside(f) && snowAt(f, f.player.x, f.player.y) && !warm();
  function shiverTick(f) {
    const p = f.player;
    if (!MT.cold(f) || f.locked || G.top() !== f || p.moving || busy(p) || G.frame - lastShiver < 420) return;
    lastShiver = G.frame; MT.start(p, 'shiver', 60); G.audio.sfx('cursor');
    puff('txt', p.x * TL + 12, p.y * TL - 10, { s: '¡Brrr!', life: 70 });
    st().shivers = (st().shivers | 0) + 1;
  }

  // =====================================================================
  //  Tapping an animal whose word isn't met yet: Lola calls out its name (a one-unknown puzzle)
  // =====================================================================
  const tapped0 = AN.tapped;
  AN.tapped = function (f, a) {
    const r = tapped0.call(this, f, a);
    if (f && Z.of(f.mapId) === 'montana' && KINDS.includes(a.kind) && a.kind === 'zorrillo') { for (let i = 0; i < 6; i++) puff('steam', a.x + (a.flip ? 8 : -8) + (Math.random() - 0.5) * 10, a.y - 10, { life: 40, vy: -0.3 }); MT.stink = { a, f0: G.frame }; } // (a little green cloud)
    if (f && Z.of(f.mapId) === 'montana' && KINDS.includes(a.kind) && !met(a.kind) && !f.locked && G.top() === f && !CH.running()) {
      CH.scene(f, (function* () {
        yield 30;
        if (met(a.kind)) return;
        CH.point(a.x, a.y - a.z - 14);
        try { yield* G.intro.show(a.kind, { who: 'lola', prompt: '¡Mira! ¡[' + a.kind + ']!', en: 'Look! ' + EN[a.kind], known: othersFor(a.kind, KINDS.concat(['perro', 'gato', 'pajaro', 'conejo'])) }); } finally { CH.point(null); }
      })());
    }
    return r;
  };

  // =====================================================================
  //  The people: Don Lucho, Mateo; Lola and Nico as everywhere
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
  function* luchoLine(f) {
    if (MT.cold(f) || (outside(f) && !warm() && met('frio'))) { yield* sayShow('lucho', 'frio', T('¡Hace [frio:frío]! ¡Abrígate!', 'It\'s cold! Wrap up warm! (a gorro, a bufanda, guantes)')); return; }
    if (met('llama')) yield* sayShow('lucho', 'llama', T('¡Mis [llama:llamas]! ¡Son muy buenas!', 'My llamas! They are very gentle.'));
    else yield* say('lucho', T('¡Hola, {name}!', 'Hello, {name}! I\'m Don Lucho. I look after the refuge and my llamas.'));
  }
  function* mateoLine(f) {
    const k = MT.weather();
    if (met(k)) yield* sayShow('mateo', k, T('¡Me encanta [' + k + ']!', 'I love this weather!'));
    else yield* say('mateo', T('¡Hola, {name}! ¡Soy Mateo!', 'Hi, {name}! I\'m Mateo. I love the weather!'));
  }

  // ---------- Don Lucho's hot chocolate (after chapter 2; every day): pour the cups, count them ----------
  const choco = () => daily('choco');
  const chocoOpen = () => CH.done('montana2');
  const chocoTime = () => { if (!G.state) return false; const c2 = CH.ctx('montana2'); return (CH.active('montana2') && c2.data && c2.data.cocoa) || !!choco().on; };
  MT.chocoTime = chocoTime;
  sideAlert.lucho = () => {
    if (chocoOpen() && !choco().done && !choco().on) return { icon: 'chocolate' };
    return null;
  };
  function* luchoSide(f) {
    const c = choco();
    if (chocoOpen() && !c.done && !c.on) {
      yield* sayShow('lucho', { icon: 'chocolate' }, T(met('chocolate') ? '¿Un [chocolate]? ¡Ven!' : '¿Chocolate? ¡Ven!', 'Some hot chocolate? Come into the refuge!'));
      c.on = true; c.n = 0; G.st.autosave();
      if (outside(f)) { const [dx, dy] = P('montana', 'door'); CH.point(dx * TL + 12, dy * TL - 6); try { yield 40; } finally { CH.point(null); } }
      return true;
    }
    if (c.on && indoors(f)) { yield* pourCups(f); return true; }
    return false;
  }
  const CUPS = 4; // (you, Lucho, Mateo, Lola: four cups)
  function* pourCups(f, o = {}) {
    const c = o.c || choco(), p = f.player, lu = npcAt(f, 'lucho');
    yield* sayShow('lucho', { icon: 'chocolate', count: CUPS }, T('¡Una taza para cada quien!', 'A cup for everyone: for you, for me, for Mateo and for Lola. Tap the pot!'));
    const pot = P('montana_refugio', 'pot');
    for (let k = (c.n | 0); k < CUPS; k++) {
      const r = yield G.choose({ prompt: '¡Sirve!', en: 'Pour a cup! (tap the pot)', choices: [{ icon: 'chocolate', label: met(['uno', 'dos', 'tres', 'cuatro'][k]) ? '¡' + G.baseForm(['uno', 'dos', 'tres', 'cuatro'][k]) + '!' : '¡Sirve!' }], layout: 'cards', who: null });
      if (r.result !== 0) break;
      c.n = k + 1; G.audio.sfx('pop'); for (let i = 0; i < 4; i++) puff('steam', pot[0] * TL + 12, pot[1] * TL - 4, { life: 34, vy: -0.6, vx: (Math.random() - 0.5) * 0.4 });
      const nw = ['uno', 'dos', 'tres', 'cuatro'][k]; if (met(nw)) { G.fx.say(G.baseForm(nw), pot[0] * TL + 12 - Math.round(f.cam.x), pot[1] * TL - 14 - Math.round(f.cam.y), '#ffffff', true); G.speak(G.baseForm(nw)); }
      yield 18;
    }
    if (met('cuatro')) yield* quiz('lucho', '¿Cuántas tazas?', 'How many cups of hot chocolate?', 'cuatro', ['tres', 'cinco', 'dos'], { show: { icon: 'chocolate', count: CUPS } });
    yield* MT.act(p, 'drink', 90);
    if (lu) MT.start(lu, 'drink', 80);
    MT.cocoa = G.frame + 60 * 60 * 3; // (warm inside for a while)
    yield* sayShow('lucho', 'chocolate', T(met('caliente') ? '¡Mmm! ¡Está [caliente]!' : '¡Mmm! ¡Qué rico!', 'Mmm! Nice and hot!'));
    const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
    if (dog) { // no chocolate for dogs: a bone for him
      G.pet.place(f, dog); yield 10; yield* G.pet.play('huh');
      yield* sayShow('lucho', { icon: 'hueso' }, T(met('hueso') ? '¡Para {dog}, no! ¡Un [hueso]!' : '¡Para {dog}, no!', 'Chocolate is bad for dogs! {dog} gets a bone instead.'));
      yield* G.pet.play('dance'); CK.heart(f, dog);
    }
    if (!o.c) { c.done = true; c.on = false; st().chocos = (st().chocos | 0) + 1; }
    CK.confetti(); G.audio.jingle('item'); G.st.autosave();
  }

  // ---------- Mateo: "¿Qué tiempo hace?" (after chapter 3; every day) ----------
  sideAlert.mateo = () => (CH.done('montana3') && !daily('mateo').done ? { icon: 'veleta' } : null);
  function* mateoSide(f) {
    if (!CH.done('montana3') || daily('mateo').done) return false;
    const k = MT.weather(), others = WX.filter(w => w !== k && met(w));
    yield* sayShow('mateo', { icon: 'veleta' }, T('¡Mira el cielo!', 'Look at the sky! (look around you)'));
    if (met(k)) yield* quiz('mateo', '¿Qué tiempo hace?', 'What is the weather like? (look around, then say it!)', k, others);
    if (met('frio') && met('caliente')) { const cold = snowAt(f, f.player.x, f.player.y) || k !== 'elsol'; yield* quiz('mateo', '¿Hace [frio:frío] o [caliente:calor]?', 'Is it cold or hot? (say it!)', cold ? 'frio' : 'caliente', [cold ? 'caliente' : 'frio']); }
    daily('mateo').done = true; st().forecasts = (st().forecasts | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
    yield* sayShow('mateo', 'veleta', T('¡Muy bien! ¡Cambia el tiempo en mi estación!', 'Well done! Change the weather at my weather station!'));
    return true;
  }
  // the weather station: say the weather you want and it comes (after chapter 3: any time)
  MT.weatherGame = function* (f, o = {}) {
    const now = MT.weather(), vs = WX.filter(w => met(w) && w !== now).slice(0, 4); if (!vs.length) return null; // (not the weather you have: four cards fit)
    const STN = P('montana', 'station'); f.wig = { x: STN[0], y: STN[1], t: 18 }; G.audio.sfx('select');
    const r = yield G.choose({ prompt: o.prompt || '¿Qué tiempo quieres?', en: o.en || 'What weather do you want? (say it, or tap it)', choices: vs.map(w => ({ word: w })), layout: 'cards', mic: true, cancel: !o.must, who: 'mateo' });
    const k = r.result; if (k == null || k < 0 || k >= vs.length) return null;
    if (G.cards) G.cards.grow(vs[k], 'tap');
    MT.setWeather(vs[k]); st().changes = (st().changes | 0) + 1;
    G.speak(G.baseForm(vs[k])); G.fx.say('¡' + G.baseForm(vs[k]) + '!', STN[0] * TL + 12 - Math.round(f.cam.x), STN[1] * TL - 20 - Math.round(f.cam.y), '#f8e060', true);
    yield 50;
    return vs[k];
  };

  // ---------- Lola: the dog's spot; the monarch butterflies (la mariposa monarca); Don Lucho ----------
  function* lolaHere(f) {
    const sp = (f.def.dogSpots || []).find(s => Z.dogReady(s));
    if (sp && G.pet && G.pet.mine()) { CH.point(sp.at[0] * TL + 12, sp.at[1] * TL); try { yield* sayShow('lola', { icon: 'huella' }, T('¡Mira, {dog}!', 'Look! {dog} can play up in the snow: tap the paw prints!')); } finally { CH.point(null); } }
    const m = AN.find('monarca', f);
    if (m && !met('monarca')) { CH.point(m.x, m.y - m.z - 12); try { yield* G.intro.show('monarca', { who: 'lola', prompt: '¡Mira! ¡Una [monarca:mariposa monarca]!', en: 'Look! A monarch butterfly! So many of them in the fir trees!', known: othersFor('monarca', ['perro', 'gato', 'pajaro', 'flor', 'arbol']) }); } finally { CH.point(null); } }
    const lu = npcAt(f, 'lucho');
    if (lu && !CH.done('montana1')) { CH.pointNpc(lu); try { yield* sayShow('lola', { icon: 'montana' }, T('¡Don Lucho! ¡Ven!', 'That\'s Don Lucho, who looks after the refuge. Go and say hello!')); } finally { CH.point(null); } }
  }

  // =====================================================================
  //  The sled: a race with the dog down the slope (he pulls you back up); skating; the tracks; the lookout
  // =====================================================================
  const SLED = P('montana', 'sled'), TOP = P('montana', 'slopeTop'), END = P('montana', 'slopeEnd');
  MT.sledRide = null; // {y (world px of the feet), done}
  function* sledRace(f) {
    const p = f.player, s = daily('sled'), dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
    if (!met('trineo')) yield* meetW('trineo', { who: 'lucho', prompt: '¡Mi [trineo]! ¡Súbete!', en: 'My sled! Hop on!', show: 'trineo', known: othersFor('trineo', ['casa', 'pelota', 'arbol', 'gorro']) });
    for (let ride = 0; ride < 3; ride++) {
      // on the sled at the top; the dog beside it
      hook(p); p.x = TOP[0]; p.y = TOP[1]; p.ox = 0; p.oy = 0; p.dir = 'down'; f.snapCam && f.snapCam();
      const y0 = SLED[1] * TL + 20, y1 = END[1] * TL + 20, x0 = SLED[0] * TL + 12;
      p.sled = { x: x0, y: y0 }; MT.sledRide = p.sled; p.hidden = false;
      if (dog) { CK.place(f, 'canelo', SLED[0] - 1, SLED[1] + 1, 'down'); dog.busy = true; }
      G.audio.sfx('select');
      const nums = ['tres', 'dos', 'uno'];
      for (let i = 0; i < 3; i++) { const w = nums[i], txt = met(w) ? '¡' + G.baseForm(w) + '!' : String(3 - i); G.fx.say(txt, x0 - Math.round(f.cam.x), y0 - 34 - Math.round(f.cam.y), '#f8e060', true); if (met(w)) G.speak(G.baseForm(w)); G.audio.sfx('cursor'); yield* wait(36); }
      G.audio.sfx('swing'); if (dog) G.pet.sound('bark');
      // who wins: the child the first time; then mostly, never always
      const youWin = !(st().races) || G.rand() < 0.7, dur = 120;
      for (let k = 0; k <= dur; k++) {
        const u = k / dur, e = u * u * (3 - 2 * u), y = y0 + (y1 - y0) * (0.15 * u + 0.85 * e);
        p.sled.y = y; p.y = Math.min(END[1], Math.max(TOP[1], Math.round((y - 20) / TL))); p.oy = (y - 20) - p.y * TL;
        if (k % 4 === 0) for (let i = 0; i < 2; i++) puff('flake', x0 + (Math.random() - 0.5) * 12, y - 2, { vy: -1 - Math.random(), vx: (Math.random() - 0.5) * 1.6, g: 0.08, life: 26 });
        if (dog) { const du = Math.min(1, u * (youWin ? 0.94 : 1.06)), de = du * du * (3 - 2 * du), dyw = y0 + (y1 - y0) * (0.15 * du + 0.85 * de), ty = Math.round((dyw - 20) / TL); dog.x = SLED[0] - 1; dog.y = Math.min(END[1], ty); dog.oy = (dyw - 20) - dog.y * TL; dog.ox = 0; dog.dir = 'down'; dog.moving = true; }
        if (k === 60 && met('rapido')) { G.fx.say('¡' + G.baseForm('rapido') + '!', x0 - Math.round(f.cam.x), y - 40 - Math.round(f.cam.y), '#ffffff', true); G.speak(G.baseForm('rapido')); }
        yield 1;
      }
      p.sled = null; MT.sledRide = null; p.y = END[1]; p.oy = 0; if (dog) { dog.moving = false; dog.oy = 0; dog.y = END[1]; dog.busy = false; }
      s.n = (s.n | 0) + 1; st().races = (st().races | 0) + 1; if (youWin) st().wins = (st().wins | 0) + 1; G.st.autosave();
      CK.confetti(); G.audio.jingle(youWin ? 'promote' : 'item');
      if (dog) { CK.bark(f, dog); CK.heart(f, dog); }
      yield* sayShow('lucho', youWin ? { icon: 'hola' } : { icon: 'perro' }, youWin ? T('¡Ganaste, {name}!', 'You won the race, {name}!') : T('¡Ganó {dog}!', '{dog} won this time!'));
      // again? the dog pulls you back up on the sled
      const again = yield G.choose({ prompt: '¿Otra vez?', en: 'Again? ({dog} pulls you back up)', choices: [{ icon: 'trineo', label: '¡Sí!' }, { icon: 'no', label: '¡Ya!' }], layout: 'cards', who: null });
      if (again.result !== 0) break;
      if (dog) {
        dog.busy = true; p.sled = { x: x0, y: y1, up: true };
        for (let k = 0; k <= 100; k++) {
          const y = y1 + (y0 - y1) * (k / 100); p.sled.y = y; p.y = Math.min(END[1], Math.max(TOP[1], Math.round((y - 20) / TL))); p.oy = (y - 20) - p.y * TL;
          const dyw = y - 30, ty = Math.round((dyw - 20) / TL); dog.x = SLED[0]; dog.y = Math.max(TOP[1] - 1, ty); dog.oy = (dyw - 20) - dog.y * TL; dog.dir = 'up'; dog.moving = true;
          if (k % 20 === 0) G.pet.sound('woof');
          yield 1;
        }
        dog.moving = false; dog.busy = false; dog.oy = 0; p.sled = null; p.oy = 0;
      }
    }
    p.x = END[0]; p.y = END[1]; p.oy = 0; p.dir = 'down';
  }
  // skating on the frozen pond: round and round, a spin at the end (¡gira!), the dog slides after you
  const ICE = P('montana', 'hielo');
  function* skate(f) {
    const p = f.player, dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
    if (!met('hielo')) yield* meetW('hielo', { who: 'mateo', prompt: '¡El [hielo]! ¡A patinar!', en: 'Ice! The pond is frozen: let\'s skate!', show: 'hielo', known: othersFor('hielo', ['agua', 'nieve', 'casa', 'pelota']) });
    hook(p); const cx = (ICE[0] + ICE[2] / 2) * TL, cy = (ICE[1] + ICE[3] / 2) * TL + 8, rx = ICE[2] * TL / 2 - 26, ry = ICE[3] * TL / 2 - 16;
    const sx = p.x, sy = p.y; p.skate = { x: cx + rx, y: cy, dir: 'up' }; G.audio.sfx('swing');
    if (dog) dog.busy = true;
    const N = 300;
    for (let k = 0; k <= N; k++) {
      const a = k / N * Math.PI * 4, x = cx + Math.cos(a) * rx, y = cy - Math.sin(a) * ry;
      const vx = -Math.sin(a), vy = -Math.cos(a);
      p.skate.x = x; p.skate.y = y; p.skate.lean = Math.sin(a * 2) * 0.12; p.skate.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : (vy < 0 ? 'up' : 'down');
      p.x = Math.floor(x / TL); p.y = Math.floor((y - 12) / TL); p.ox = x - 12 - p.x * TL; p.oy = y - 21 - p.y * TL;
      if (dog) { const b = a - 0.6, dxw = cx + Math.cos(b) * rx, dyw = cy - Math.sin(b) * ry; dog.x = Math.floor(dxw / TL); dog.y = Math.floor((dyw - 12) / TL); dog.ox = dxw - 12 - dog.x * TL; dog.oy = dyw - 21 - dog.y * TL; dog.dir = p.skate.dir; dog.moving = (k >> 3) & 1; }
      if (k % 24 === 0) G.audio.sfx('swing');
      yield 1;
    }
    // a spin to finish: ¡gira!
    for (let k = 0; k < 48; k++) { p.skate.dir = ['down', 'right', 'up', 'left'][(k >> 2) & 3]; p.skate.lean = 0; yield 1; }
    if (met('gira')) { G.fx.say('¡' + G.baseForm('gira') + '!', p.skate.x - Math.round(f.cam.x), p.skate.y - 34 - Math.round(f.cam.y), '#f8e060', true); G.speak(G.baseForm('gira')); }
    p.skate = null; p.x = Math.max(ICE[0], Math.min(ICE[0] + ICE[2] - 1, Math.floor((cx + rx) / TL))); p.y = Math.floor(cy / TL); p.ox = 0; p.oy = 0;
    if (f.blocked(p.x, p.y, p)) { p.x = sx; p.y = sy; }
    if (dog) { dog.ox = 0; dog.oy = 0; dog.moving = false; dog.busy = false; G.pet.place(f, dog); yield* G.pet.play('huh'); CK.bark(f, dog); }
    daily('skate').done = true; st().skates = (st().skates | 0) + 1; G.audio.jingle('item'); G.st.autosave();
    yield 20;
  }
  // tracks in the snow (after chapter 1; one trail a day): the dog sniffs along them; who made them?
  const TRACKS = [
    { kind: 'marmota', path: [[9, 12], [8, 10], [6, 9], [4, 9]], hide: [3, 8] },
    { kind: 'zorrillo', path: [[24, 13], [23, 12], [23, 11]], hide: [22, 10] },
    { kind: 'conejo', path: [[33, 13], [33, 12], [34, 11]], hide: [35, 11] },
  ];
  MT.TRACKS = TRACKS;
  const trackToday = () => TRACKS[day() % TRACKS.length];
  const tracksOpen = () => CH.done('montana1') && !daily('tracks').done;
  function* tracksRun(f) {
    const tr = trackToday(), dog = G.pet && G.pet.mine() ? CK.dog(f) : null, s = daily('tracks');
    yield* sayShow('lola', { icon: 'huella' }, T('¡Huellas! ¿De quién son?', 'Tracks in the snow! Who made them? Let\'s follow them!'));
    if (dog) { G.pet.place(f, dog); yield 6; for (const [x, y] of tr.path) { yield* G.pet.play('sniff'); yield* CK.walk(f, dog, x, y, 3); } CK.bark(f, dog); }
    s.found = G.frame; AN.cry(tr.kind); G.audio.sfx('pop');
    const [hx, hy] = tr.hide; CH.point(hx * TL + 12, hy * TL - 6);
    try {
      yield 30;
      if (!met(tr.kind)) yield* meetW(tr.kind, { who: 'lola', prompt: '¡Un[a] [' + tr.kind + ']!'.replace('Un[a] ', tr.kind === 'marmota' ? 'Una ' : 'Un '), en: 'It was ' + EN[tr.kind], known: othersFor(tr.kind, KINDS.concat(['conejo', 'gato', 'perro'])) });
      else yield* quiz('lola', '¿Quién es?', 'Who made the tracks? (say it!)', tr.kind, KINDS.concat(['conejo', 'gato', 'perro', 'llama']).filter(k => k !== tr.kind && met(k)).sort(() => G.rand() - 0.5), { show: { icon: 'huella' } });
    } finally { CH.point(null); }
    AN.meet(tr.kind); s.done = true; st().trails = (st().trails | 0) + 1; CK.confetti(); G.audio.jingle('promote'); G.st.autosave();
    if (dog) { CK.heart(f, dog); if (G.hearts) G.hearts.add('canelo', 1, 'care'); }
  }
  // the lookout: the view over the clouds (the peaks, the sun or the moon and stars, an eagle, the rainbow, the valley far below)
  class Mirador {
    constructor(w) { this.w = w; this.t = 0; this.transparent = false; this.k = MT.weather(); this.night = night(); this.rb = MT.rainbowOn(); this.eagle = this.k === 'elsol' || met('aguila'); }
    onEnter() { G.audio.sfx('ok'); }
    update() { this.t++; if (this.t === 40) { G.audio.jingle('item'); if (this.eagle) AN.cry('aguila'); } if (this.t > 240 || (this.t > 50 && (G.input.tap() || G.input.p('A') || G.input.p('B')))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const W = G.W, H = G.H, t = this.t, k = Math.min(1, t / 24);
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, r = 70 * k;
      ctx.fillStyle = '#202838'; ctx.beginPath(); ctx.arc(cx - 54, cy, r + 3, 0, Math.PI * 2); ctx.arc(cx + 54, cy, r + 3, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx - 54, cy, r, 0, Math.PI * 2); ctx.moveTo(cx + 54 + r, cy); ctx.arc(cx + 54, cy, r, 0, Math.PI * 2); ctx.clip();
      const sky = this.night ? ['#0a1030', '#1c2858'] : this.k === 'lluvia' ? ['#5a6880', '#8a98a8'] : this.k === 'nube' ? ['#7a98c0', '#b8c8dc'] : ['#2a70d8', '#9ad0f8'];
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (this.night) { for (let i = 0; i < 40; i++) { ctx.fillStyle = (t + i * 7) % 60 < 30 ? '#ffffff' : '#a8b8e8'; ctx.fillRect((hsh(i, 1) * W) | 0, (hsh(i, 2) * H * 0.6) | 0, 1, 1); } ctx.fillStyle = '#f8f0c8'; ctx.beginPath(); ctx.arc(W - 70, 44, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = sky[0]; ctx.beginPath(); ctx.arc(W - 64, 40, 11, 0, Math.PI * 2); ctx.fill(); }
      else if (this.k === 'elsol' || this.k === 'viento' || this.k === 'nieve') { ctx.fillStyle = '#fff4b0'; ctx.beginPath(); ctx.arc(W - 70, 40, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,240,180,0.25)'; ctx.beginPath(); ctx.arc(W - 70, 40, 24, 0, Math.PI * 2); ctx.fill(); }
      if (this.rb) drawRainbow(ctx, 1, W / 2, H * 0.78, 140, 6);
      // the valley far below, through a gap in the clouds: the places you've been, tiny
      const Y = cy + 34;
      ctx.fillStyle = '#5a9a40'; ctx.fillRect(0, Y, W, H - Y);
      const places = Z.ids().filter(id => id !== 'montana' && Z.visited(id)).slice(0, 5);
      places.forEach((id, i) => { const x = 40 + i * ((W - 80) / Math.max(1, places.length - 1 || 1)), bob = Math.round(Math.sin(t / 30 + i) * 1); G.drawIcon16(ctx, Z.def(id).icon, Math.round(x - 8), Y + 10 + bob); });
      // distant peaks poking through the sea of clouds
      for (const [x, h, w] of [[30, 70, 60], [110, 96, 80], [200, 80, 70], [280, 104, 76]]) { ctx.fillStyle = '#8a98b8'; ctx.beginPath(); ctx.moveTo(x - w, Y + 4); ctx.lineTo(x, Y - h + 30); ctx.lineTo(x + w, Y + 4); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - w * 0.32, Y - h + 30 + h * 0.32); ctx.lineTo(x, Y - h + 30); ctx.lineTo(x + w * 0.32, Y - h + 30 + h * 0.32); ctx.fill(); }
      for (let i = 0; i < 14; i++) { const x = ((i * 37 + t * 0.35) % (W + 60)) - 30, y = Y + 2 + (i % 3) * 6; ctx.fillStyle = i % 2 ? '#ffffff' : '#eef4fc'; ctx.beginPath(); ctx.arc(x, y, 14 + (i % 4) * 3, 0, Math.PI * 2); ctx.fill(); }
      if (this.eagle && !this.night) { const a = t / 50, ex = cx + Math.cos(a) * 80, ey = cy - 30 + Math.sin(a * 2) * 10; ctx.imageSmoothingEnabled = false; ctx.drawImage(G.icon('aguila'), Math.round(ex - 16), Math.round(ey - 16), 32, 32); }
      ctx.restore();
    }
  }
  MT.mirador = () => { const w = new G.Wait(); G.push(new Mirador(w)); return w; };
  function* lookout(f) {
    const V = P('montana', 'viewer'); f.wig = { x: V[0], y: V[1], t: 18 }; G.audio.sfx('select');
    yield MT.mirador();
    st().views = (st().views | 0) + 1; G.st.autosave();
    if (met('nube') && MT.weather() !== 'lluvia') yield* quiz('lola', '¿Qué hay abajo?', 'What is down there, under the mountain tops? (say it!)', 'nube', WX.filter(w => w !== 'nube'), { show: { icon: 'montana' } });
    else if (met('lamontana')) yield* sayShow('lola', 'montana', T('¡Qué alta es la [lamontana:montaña]!', 'What a high mountain! We\'re above the clouds!'));
  }
  // the snowman (after chapter 2): dress him up (¿Qué le pones?): a cap, a scarf, in another colour
  const SNOWMAN = P('montana', 'snowman');
  const snowman = () => { const c = CH.ctx('montana2'), d = (c && c.data) || {}; if (CH.done('montana2')) return Object.assign({ balls: 3, nose: true, gorro: '#3870d8', bufanda: '#e04040' }, st().snowman); return { balls: d.balls | 0, nose: d.nose && !d.stolen, gorro: d.gorro, bufanda: d.bufanda }; };
  MT.snowman = snowman;
  function* dressSnowman(f) {
    const vs = ['gorro', 'bufanda'].filter(met); if (!vs.length) return;
    const sm = st().snowman, cur = snowman();
    const ch = vs.map(w => ({ word: w, img: { icon: w, col: AB.COLS[(AB.COLS.indexOf(cur[w]) + 1) % AB.COLS.length] } }));
    const r = yield G.choose({ prompt: '¿Qué le pones?', en: 'What will you put on the snowman? (say it, or tap it)', choices: ch, layout: 'cards', mic: true, cancel: true, who: null });
    if (r.result == null || r.result < 0 || r.result >= ch.length) return;
    const id = ch[r.result].word; if (G.cards) G.cards.grow(id, 'tap');
    sm[id] = ch[r.result].img.col; G.audio.sfx('chime'); CK.sparkle(f, SNOWMAN[0], SNOWMAN[1], 5); G.speak(G.baseForm(id)); st().dressed = (st().dressed | 0) + 1; G.st.autosave();
    yield 20;
  }

  // =====================================================================
  //  The map's side places (zones.js hooks): the station, the sled, the binoculars, the ice, the tracks, the snowman, the pot
  // =====================================================================
  const STATION = P('montana', 'station'), VIEWER = P('montana', 'viewer'), DOOR = P('montana', 'door'), CDOOR = P('montana_refugio', 'door');
  const POT = P('montana_refugio', 'pot'), HEARTH = P('montana_refugio', 'hearth');
  const SIDE = [
    { id: 'station', map: 'montana', at: STATION, on: () => CH.done('montana3'), icon: () => null, run: f => (function* () { yield* MT.weatherGame(f); })() },
    { id: 'sled', map: 'montana', at: SLED, on: () => CH.done('montana1'), icon: () => (!(daily('sled').n) ? { icon: 'trineo' } : null), run: f => sledRace(f) },
    { id: 'viewer', map: 'montana', at: VIEWER, on: () => true, icon: () => (!(st().views) ? { icon: 'montana' } : null), run: f => lookout(f) },
    { id: 'tracks', map: 'montana', at: () => trackToday().path[0], on: () => tracksOpen() && !daily('tracks').found, icon: () => ({ icon: 'huella' }), run: f => tracksRun(f) },
    { id: 'snowman', map: 'montana', at: SNOWMAN, on: () => CH.done('montana2'), icon: () => null, run: f => dressSnowman(f) },
    { id: 'pot', map: 'montana_refugio', at: HEARTH, on: () => chocoOpen() && choco().on && !choco().done, icon: () => ({ icon: 'chocolate' }), run: f => pourCups(f) },
  ];
  MT.SIDE = SIDE;
  const atOf = s => (typeof s.at === 'function' ? s.at() : s.at);
  const sideAt = (f, x, y) => (f && G.state ? SIDE.find(s => s.map === f.mapId && atOf(s)[0] === x && atOf(s)[1] === y && s.on()) || null : null);
  MT.sideAt = sideAt;
  MT.atOf = atOf;
  // the dog's snow tunnel (a dog's spot of its own act, 'tunel'): he digs in, a mound moves under the snow, he pops out
  MT.tunnel = null; // {x, y (world px of the mound)}
  function* tunnelRun(f, sp) {
    const n = G.pet.npc(f); if (!n) return;
    const [ax, ay] = sp.at, [bx, by] = sp.to;
    G.pet.sound('bark'); puff('ex', n.x * TL + 12, n.y * TL - 4, { life: 30 });
    yield* CK.walk(f, n, ax, ay + 1, 4); n.dir = 'up';
    for (let k = 0; k < 3; k++) { for (let i = 0; i < 6; i++) puff('flake', ax * TL + 12 + (Math.random() - 0.5) * 10, ay * TL + 18, { vy: -1.5 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.12, life: 30 }); G.pet.sound('crunch'); yield 14; }
    n.hidden = true; n.busy = true;
    const x0 = ax * TL + 12, y0 = ay * TL + 16, x1 = bx * TL + 12, y1 = by * TL + 16;
    for (let k = 0; k <= 90; k++) { const u = k / 90; MT.tunnel = { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + Math.sin(u * Math.PI * 4) * 3 }; if (k % 15 === 0) G.pet.sound('crunch'); yield 1; }
    MT.tunnel = null; n.x = bx; n.y = by; n.ox = 0; n.oy = 0; n.hidden = false; n.busy = false;
    for (let i = 0; i < 14; i++) puff('flake', x1 + (Math.random() - 0.5) * 16, y1, { vy: -1.8 - Math.random(), vx: (Math.random() - 0.5) * 2.4, g: 0.12, life: 34 });
    G.pet.sound('bark'); yield* G.pet.play('spin');
    Z.state().dog[sp.id] = { d: day(), t: G.words ? G.words.now() : 0 };
    if (sp.gives && G.carry && G.carry.state) G.carry.state().ground.push({ id: sp.gives, col: null, map: f.mapId, x: bx, y: by });
    CK.heart(f, n); if (G.hearts) G.hearts.add('canelo', 1, 'care'); if (G.carry && G.carry.bump) G.carry.bump('dog');
    G.st.autosave(); yield 20;
  }
  // rolling in the snow ('roll' here): he flops, wriggles on his back, makes a snow angel, shakes the snow off
  MT.angels = [];
  function* snowRoll(f, sp) {
    const n = G.pet.npc(f); if (!n) return;
    const [sx, sy] = sp.at;
    G.pet.sound('bark'); puff('ex', n.x * TL + 12, n.y * TL - 4, { life: 30 });
    yield* CK.walk(f, n, sx, sy, 4);
    for (let k = 0; k < 2; k++) { yield* G.pet.play('spin'); for (let i = 0; i < 12; i++) puff('flake', sx * TL + 12 + (Math.random() - 0.5) * 18, sy * TL + 18, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.1, life: 34 }); }
    MT.angels.push({ x: sx, y: sy, f0: G.frame });
    yield* G.pet.play('dance'); for (let i = 0; i < 16; i++) puff('flake', n.x * TL + 12 + (Math.random() - 0.5) * 20, n.y * TL + 10, { vy: -1 - Math.random(), vx: (Math.random() - 0.5) * 3, g: 0.1, life: 30 });
    Z.state().dog[sp.id] = { d: day(), t: G.words ? G.words.now() : 0 };
    G.pet.sound('bark'); CK.heart(f, n); if (G.hearts) G.hearts.add('canelo', 1, 'care'); if (G.carry && G.carry.bump) G.carry.bump('dog');
    G.st.autosave(); yield 20;
  }
  const zSearch = Z.search, zSpecial = Z.special, zGoal = Z.goal, zUnder = Z.drawUnder, zTop = Z.drawTop, zTask = Z.task, zBlocks = Z.blocks;
  Z.search = (f, x, y) => {
    if (!inZone(f)) return zSearch(f, x, y);
    const s = sideAt(f, x, y); if (s) { const cs = CH.spotAt(f, x, y); return cs ? null : s.run(f); }
    if (CH.spotAt(f, x, y)) return null; // (a story place wins over the dog's spot and the ice on the same tile)
    const d = outside(f) ? Z.dogSpotAt(f, x, y) : null;
    if (d && d.act === 'tunel') return tunnelRun(f, d);
    if (d && d.act === 'roll') return snowRoll(f, d);
    if (outside(f) && f.map.get(x, y) === 'ö' && !f.player.skate) return skate(f);
    return zSearch(f, x, y);
  };
  Z.special = (f, x, y) => (inZone(f) && G.state && (!!sideAt(f, x, y) || !!CH.spotAt(f, x, y) || f.map.get(x, y) === 'ö')) || zSpecial(f, x, y);
  Z.blocks = (f, x, y) => zBlocks(f, x, y) || (outside(f) && G.state && ((x === SLED[0] && y === SLED[1]) || (x === SNOWMAN[0] && y === SNOWMAN[1] && snowman().balls > 0)));
  const pt = (at, lift, icon) => ({ x: at[0] * TL + 12, y: at[1] * TL + 12, lift, icon });
  Z.task = function (f) { // things going on: the tracks, the hot chocolate
    if (inZone(f) && G.state) {
      const c = choco();
      if (c.on && !c.done) { if (outside(f)) return { why: 'montana: hot chocolate (the refuge)', pts: [{ x: DOOR[0] * TL + 12, y: DOOR[1] * TL + 12, lift: 20, door: true }] }; return { why: 'montana: hot chocolate', pts: [pt(HEARTH, 20, 'chocolate')] }; }
    }
    return zTask(f);
  };
  Z.goal = function (f) { // suggestions: the tracks, the sled, skating, the lookout, the weather station
    const g = zGoal(f); if (g || !inZone(f) || !G.state || !outside(f)) return g;
    if (tracksOpen() && !daily('tracks').found) return { why: 'montana: the tracks', pts: [pt(trackToday().path[0], 22, 'huella')] };
    if (CH.done('montana1') && !daily('sled').n) return { why: 'montana: the sled', pts: [pt(SLED, 24, 'trineo')] };
    if (CH.done('montana1') && !daily('skate').done) return { why: 'montana: skating', pts: [pt([ICE[0] + 2, ICE[1] + 4], 20, 'hielo')] };
    if (!st().views) return { why: 'montana: the lookout', pts: [pt(VIEWER, 24, 'montana')] };
    return null;
  };
  // ---------- drawing: the vane, the sled, the snowman, the tracks, the tunnel, snow angels; the weather; night ----------
  function drawSnowman(ctx, cx, cy) {
    const sm = snowman(); if (!sm.balls) return;
    const x = SNOWMAN[0] * TL + 12 - cx, y = SNOWMAN[1] * TL + 22 - cy;
    ctx.fillStyle = 'rgba(80,100,140,0.3)'; ctx.beginPath(); ctx.ellipse(x + 2, y, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
    const balls = [[0, -7, 9], [0, -20, 7], [0, -31, 5.5]].slice(0, sm.balls);
    for (const [dx, dy, r] of balls) { ctx.fillStyle = OLC; ctx.beginPath(); ctx.arc(x + dx, y + dy, r + 1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fafcff'; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c8dcf0'; ctx.beginPath(); ctx.arc(x + dx + r * 0.3, y + dy + r * 0.3, r * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fafcff'; ctx.beginPath(); ctx.arc(x + dx - 1, y + dy - 1, r * 0.75, 0, Math.PI * 2); ctx.fill(); }
    if (sm.balls >= 2) { ctx.fillStyle = '#202028'; ctx.fillRect(x - 1, y - 22, 2, 2); ctx.fillRect(x - 1, y - 17, 2, 2); ctx.fillRect(x - 1, y - 9, 2, 2); ctx.strokeStyle = '#6a4220'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, y - 21); ctx.lineTo(x - 13, y - 26); ctx.moveTo(x + 6, y - 21); ctx.lineTo(x + 13, y - 27); ctx.stroke(); }
    if (sm.balls >= 3) {
      ctx.fillStyle = '#202028'; ctx.fillRect(x - 3, y - 33, 2, 2); ctx.fillRect(x + 1, y - 33, 2, 2);
      if (sm.nose) { ctx.fillStyle = '#f88020'; ctx.fillRect(x, y - 31, 6, 2); ctx.fillRect(x + 6, y - 31, 1, 1); }
      if (sm.bufanda) { ctx.fillStyle = sm.bufanda; ctx.fillRect(x - 6, y - 27, 12, 3); ctx.fillRect(x + 2, y - 25, 3, 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 2, y - 22, 3, 1); }
      if (sm.gorro) { ctx.fillStyle = OLC; ctx.fillRect(x - 6, y - 41, 12, 6); ctx.fillStyle = sm.gorro; ctx.fillRect(x - 5, y - 40, 10, 5); ctx.fillStyle = G.shade(sm.gorro, 1.3); ctx.fillRect(x - 5, y - 37, 10, 2); ctx.fillStyle = '#f8f8f8'; ctx.fillRect(x - 2, y - 44, 4, 3); }
    }
  }
  function drawVane(ctx, cx, cy) {
    const x = STATION[0] * TL + 12 - cx, y = STATION[1] * TL - 2 - cy, k = MT.weather();
    const ang = k === 'viento' ? G.frame / 4 : Math.sin(G.frame / 90) * 0.5 + (k === 'lluvia' ? 1.2 : 0.3);
    ctx.fillStyle = '#606878'; ctx.fillRect(x - 1, y - 14, 2, 14);
    const dx = Math.cos(ang) * 9, dy = Math.sin(ang) * 3;
    ctx.strokeStyle = OLC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - dx, y - 15 - dy); ctx.lineTo(x + dx, y - 15 + dy); ctx.stroke();
    ctx.strokeStyle = '#303840'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - dx, y - 15 - dy); ctx.lineTo(x + dx, y - 15 + dy); ctx.stroke();
    ctx.fillStyle = '#e04040'; ctx.beginPath(); ctx.arc(x + dx, y - 15 + dy, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8c830'; ctx.fillRect(x - 3, y - 21, 5, 4); ctx.fillStyle = '#e04040'; ctx.fillRect(x + 1, y - 23, 2, 2); // the little rooster on top
    // the windsock beside it: limp, or straight out in the wind
    const sx = x + 14, sy = y - 6, L = k === 'viento' ? 14 : 6;
    ctx.fillStyle = '#909098'; ctx.fillRect(sx, sy, 1, 12);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i & 1 ? '#ffffff' : '#f06030'; const wob = k === 'viento' ? Math.sin(G.frame / 3 + i) : 0; ctx.fillRect(sx + 1 + Math.round(i * L / 4), sy + (k === 'viento' ? Math.round(wob) : i * 2), Math.ceil(L / 4), 3 - (i >> 1)); }
  }
  function drawTracks(f, ctx, cx, cy) {
    if (!tracksOpen()) return;
    const tr = trackToday(), L = tr.path.concat([tr.hide]);
    for (let i = 0; i < L.length - 1; i++) {
      const [ax, ay] = L[i], [bx, by] = L[i + 1], n = 4;
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, x = (ax + (bx - ax) * u) * TL + 12 - cx + (k & 1 ? 3 : -3), y = (ay + (by - ay) * u) * TL + 14 - cy; ctx.fillStyle = '#7890b0'; ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 3); ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 1, 1); ctx.fillRect(Math.round(x), Math.round(y) - 3, 1, 1); ctx.fillRect(Math.round(x) + 2, Math.round(y) - 2, 1, 1); }
    }
    const s = daily('tracks');
    if (s.found) { const [hx, hy] = tr.hide, img = G.icon(tr.kind), up = Math.min(8, (G.frame - s.found) / 3); ctx.drawImage(img, hx * TL + 4 - cx, hy * TL - 4 - up - cy); }
  }
  Z.drawUnder = function (f, ctx) {
    zUnder(f, ctx);
    if (!G.state || !inZone(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (outside(f)) {
      for (const a of MT.angels) { const x = a.x * TL + 12 - cx, y = a.y * TL + 14 - cy; ctx.fillStyle = 'rgba(150,180,215,0.6)'; ctx.beginPath(); ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 12, y - 3, 4, 2); ctx.fillRect(x + 8, y - 3, 4, 2); }
      drawTracks(f, ctx, cx, cy);
      // the sled waiting at the top of the slope; little flags down the run
      if (!MT.sledRide) G.drawIcon16(ctx, 'trineo', SLED[0] * TL + 2 - cx, SLED[1] * TL + 6 - cy, 1.25);
      for (let y = TOP[1] + 1; y < END[1]; y += 3) for (const x of [16, 20]) { const X = x * TL + 12 - cx, Y = y * TL + 4 - cy, w = Math.round(Math.sin(G.frame / 10 + y) * 1); ctx.fillStyle = '#5a3a20'; ctx.fillRect(X, Y, 1, 12); ctx.fillStyle = y & 1 ? '#e04040' : '#3870d8'; ctx.fillRect(X + 1, Y + w, 5, 3); }
      if (MT.tunnel) { const x = MT.tunnel.x - cx, y = MT.tunnel.y - cy; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c8dcf0'; ctx.fillRect(x - 5, y + 2, 10, 2); }
    }
    if (indoors(f)) { // the pot of hot chocolate over the fire, the cups on the table
      const [hx, hy] = POT; G.drawIcon16(ctx, 'chocolate', hx * TL - 6 - cx, hy * TL - 26 - cy);
      if (G.frame % 40 === 0) puff('steam', hx * TL + 2, hy * TL - 22, { life: 40, vy: -0.4 });
      const n = choco().on || choco().done ? (choco().n | 0) : CH.active('montana2') ? (CH.ctx('montana2').data.n | 0) : 0;
      const [tx, ty] = P('montana_refugio', 'table'); for (let i = 0; i < n; i++) G.drawIcon16(ctx, 'chocolate', (tx + i) * TL + 4 - cx, ty * TL + 2 - cy, 0.75);
    }
  };
  Z.drawTop = function (f, ctx) {
    zTop(f, ctx);
    if (!G.state || !inZone(f)) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (outside(f)) {
      drawSnowman(ctx, cx, cy); drawVane(ctx, cx, cy);
      if (MT.stink && G.frame - MT.stink.f0 < 90) { const a = MT.stink.a, k = (G.frame - MT.stink.f0) / 90; ctx.save(); ctx.globalAlpha = 0.45 * (1 - k); ctx.fillStyle = '#a8d848'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(a.x - cx + (a.flip ? 10 : -10) + Math.sin(i * 2 + k * 6) * 6, a.y - 10 - cy - k * 16 - i * 4, 4 + k * 5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
      // the weather (a cross-fade when it changes), the rainbow
      const tr = MT.trans, u = tr ? Math.min(1, (G.frame - tr.f0) / 70) : 1;
      if (tr && u < 1) drawWx(ctx, tr.from, 1 - u, f); else MT.trans = null;
      drawWx(ctx, MT.weather(), u, f);
      if (MT.rainbowOn()) drawRainbow(ctx, Math.min(1, (G.frame - MT.rainbow) / 90), G.W / 2, G.H + 30, 210, 7);
      // night: a deep blue, the refuge's windows glow, the station's lamp
      const dark = (G.day ? G.day.glow() : 0) * 0.65;
      if (dark > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = dark; ctx.fillStyle = '#28346a'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const lights = [[f.player.x * TL + 12 + (f.player.ox || 0) - cx, f.player.y * TL + 12 + (f.player.oy || 0) - cy, 32], [STATION[0] * TL + 12 - cx, STATION[1] * TL - 10 - cy, 22]];
        for (let x = 22; x <= 28; x++) if (f.map.get(x, 17) === '[' && x !== 25) lights.push([x * TL + 12 - cx, 17 * TL + 10 - cy, 24]);
        for (const [x, y, r] of lights) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,224,150,' + (0.5 * dark) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
        ctx.restore();
      }
    }
    if (!f.locked && G.top() === f) for (const s of SIDE) { if (s.map !== f.mapId || !s.on()) continue; const ic = s.icon(); if (ic) { const a = atOf(s); G.drawAlert(ctx, ic, a[0] * TL - cx, a[1] * TL - cy + 4, f.t); } }
  };
  // a new ghost-hand demo: the first time a snowball is wanted, the hand taps a snow pile
  const PILES = [P('montana', 'pile1'), P('montana', 'pile2'), P('montana', 'pile3')];
  (Z.demos || (Z.demos = [])).push({ kind: 'snowball', find: f => { if (!outside(f) || !CH.active('montana2')) return null; const c = CH.ctx('montana2'); if (!c.data.roll || (c.data.balls | 0) >= 3) return null; return PILES.find((p, i) => !(c.data.got || {})[i]) || null; } });
  // the per-frame hook: this zone's people are drawn by drawMT; the cold
  const anUp0 = AN.update;
  AN.update = function (f) {
    anUp0.call(this, f);
    if (!inZone(f) || !G.state) return;
    hook(f.player);
    for (const id of ['lucho', 'mateo']) { const n = f.npc(id); if (n) hook(n); }
    if (outside(f)) shiverTick(f);
  };

  // =====================================================================
  //  The maps
  // =====================================================================
  const luchoIn = () => night() || chocoTime();
  G.maps.montana = {
    name: 'La montaña', icon: 'montana', rows: MD.montana.rows, music: 'field',
    exits: [Z.edge(0, IN[1], 'camino_montana', 28, 6, 'left'), { x: DOOR[0], y: DOOR[1], to: 'montana_refugio', tx: CDOOR[0], ty: CDOOR[1] - 1, dir: 'up' }],
    posts: [{ at: P('montana', 'post'), zone: 'montana' }],
    // the dog's things to do: roll in the snow (a snow angel), dig a snow tunnel, chase the marmots
    dogSpots: [
      { id: 'montana_nieve', at: P('montana', 'dog'), act: 'roll', every: 120 },
      { id: 'montana_tunel', at: P('montana', 'tunnel'), to: P('montana', 'tunnelOut'), act: 'tunel', gives: 'hueso', every: 'day' },
      { id: 'montana_marmotas', at: P('montana', 'marmotasDog'), act: 'chase', kind: 'marmota', every: 60 },
    ],
    pages: K.pages('montana'),
    ambient: { birds: 2, butterflies: 2 },
    animals: [
      { kind: 'llama', n: 4, area: 'llamas' }, { kind: 'llama', n: 2, area: 'llamas2' },
      { kind: 'marmota', n: 3, area: 'marmotas' }, { kind: 'marmota', n: 2, area: 'marmotas2' },
      { kind: 'zorrillo', n: 2, area: 'zorrillos' }, { kind: 'carpintero', n: 2, area: 'carpintero' },
      { kind: 'monarca', n: 9, area: 'monarcas' }, { kind: 'puma', n: 1, area: 'puma' },
      { kind: 'conejo', n: 2, area: 'conejos' },
      { kind: 'aguila', n: 1, area: 'cielo', when: () => MT.weather() === 'elsol' && !night() },   // rare: only when the sun shines
      { kind: 'lobo', n: 1, area: 'lobo', when: 'noche' },                                            // rare: at night on the crag
    ],
    things: { tiles: { 'ç': 'arbol', '(': 'arbol', ')': 'arbol', 'ü': null, 'ö': null, 'ï': null, 'ò': null, 'ù': null, O: null } },
    poke: (f, x, y) => { const c = f.map.get(x, y); if (c === 'ç') { G.audio.sfx('swing'); for (let i = 0; i < 8; i++) puff('flake', x * TL + 12 + (Math.random() - 0.5) * 16, y * TL + 4, { vy: -0.3, vx: (Math.random() - 0.5) * 1, g: 0.06, life: 40 }); return true; } return false; },
    npcs: [
      K.canelo(IN[0] + 1, IN[1] + 1), Z.lola(...P('montana', 'lola'), 'montana'), Z.nico(...P('montana', 'nico')),
      Object.assign(person('lucho', ...P('montana', 'lucho'), 'down', luchoSide, luchoLine, { fixed: true }), { cond: () => !luchoIn() }),
      person('mateo', ...P('montana', 'mateo'), 'down', mateoSide, mateoLine, { fixed: true }),
    ],
  };
  G.maps.montana_refugio = {
    name: 'El refugio', icon: 'montana', rows: MD.montana_refugio.rows, music: 'headquarters', indoor: true,
    exits: [{ x: CDOOR[0], y: CDOOR[1], to: 'montana', tx: DOOR[0], ty: DOOR[1] + 1, dir: 'down' }],
    animals: [],
    things: { tiles: { j: 'cama', t: null, v: null, n: null, k: null } },
    poke: (f, x, y) => { const c = f.map.get(x, y); if (c === 'v') { G.audio.sfx('select'); for (let i = 0; i < 3; i++) puff('steam', x * TL + 12, y * TL + 4, { vy: -0.6, life: 40 }); return true; } return false; },
    npcs: [
      K.canelo(CDOOR[0], CDOOR[1] - 2),
      Object.assign(person('lucho', ...P('montana_refugio', 'lucho'), 'down', luchoSide, luchoLine, { fixed: true }), { cond: () => luchoIn() }),
    ],
  };
  if (G.carry) Object.assign(G.carry.DOG, { bolanieve: 'eat' }); // (he chomps the snowball: it's gone!)

  // ---------- things to pick up: snowballs (after the snowman), sticks ----------
  G.carry.SOURCES.push(
    { id: 'palo_cmontana', map: 'camino_montana', at: P('camino_montana', 'palo'), item: 'palo', every: 90 },
    { id: 'palo_montana', map: 'montana', at: [20, 26], item: 'palo', every: 90 },
    ...PILES.map((at, i) => ({ id: 'bolanieve' + i, map: 'montana', at: [at[0], at[1] + 1], item: 'bolanieve', every: 60, when: () => CH.done('montana2') })),
  );
  // ---------- Nico's hiding places (seek.js) ----------
  G.seek.SPOTS.push(
    { id: 'montana1', map: 'montana', at: P('montana', 'hide1'), how: 'over', cut: 12, dx: 0, kinds: ['marmota', 'conejo', 'zorrillo'], place: 'arbol' },    // behind a snowy pine
    { id: 'montana2', map: 'montana', at: P('montana', 'hide2'), how: 'over', cut: 9, dx: 0, kinds: ['marmota', 'conejo', 'zorrillo'], place: 'nieve' },    // behind the marmots' rock
    { id: 'montana3', map: 'montana', at: P('montana', 'hide3'), how: 'over', cut: 9, dx: 0, kinds: ['zorrillo', 'conejo', 'gato'], place: 'montana' },   // behind the woodpile by the refuge
    { id: 'montana4', map: 'montana', at: P('montana', 'hide4'), how: 'over', cut: 10, dx: 0, kinds: ['conejo', 'gato', 'zorrillo'], place: 'veleta' },   // behind the weather station
    { id: 'montana5', map: 'montana', at: P('montana', 'hide5'), how: 'over', cut: 9, dx: 0, kinds: ['llama', 'conejo', 'cabra'], place: 'llama' },      // behind the llamas' hay
    { id: 'montana6', map: 'montana', at: P('montana', 'hide6'), how: 'over', cut: 9, dx: 0, kinds: ['marmota', 'conejo', 'zorrillo'], place: 'hielo' }, // behind a rock by the frozen pond
  );
  G.seek.KINDS.push('marmota', 'zorrillo', 'llama');
  Object.assign(G.seek.PEEK, { marmota: [3, 5], zorrillo: [3, 5], llama: [4, 8] });
  // ---------- favours (favores.js, from Villa Sol's chapter 7 on): Don Lucho and Mateo ask about the zone's words ----------
  const been = () => Z.visited('montana');
  G.favores.OFFERS.push(['lucho', 'thing', ['gorro', 'bufanda', 'guantes', 'chocolate', 'trineo', 'llama', 'muneco', 'lamontana'], been], ['mateo', 'thing', ['nieve', 'nube', 'lluvia', 'viento', 'arcoiris', 'frio', 'hielo'], been]);
  Object.assign(G.favores.THINGS, { lucho: ['gorro', 'bufanda', 'guantes', 'chocolate', 'trineo', 'llama', 'muneco', 'lamontana'], mateo: ['nieve', 'nube', 'lluvia', 'viento', 'arcoiris', 'frio', 'hielo'] });

  // =====================================================================
  //  The story: the mountain's quest line (G.chapters, line 'montana')
  // =====================================================================
  CH.add({ id: 'montana1', line: 'montana', title: '¡Qué frío!', en: 'So cold! Up in the snow you shiver: warm clothes from Don Lucho\'s refuge', giver: 'lucho', words: ['lamontana', 'nieve', 'frio', 'gorro', 'bufanda', 'guantes'], icon: 'gorro', col: '#3870d8', goal: [['gorro', 1], ['bufanda', 1], ['guantes', 1]] });
  CH.add({ id: 'montana2', line: 'montana', title: 'El muñeco de nieve', en: 'The snowman: roll three snowballs, a carrot nose, a hat and a scarf; then hot chocolate', giver: 'mateo', words: ['muneco', 'chocolate'], icon: 'muneco', col: '#58a8e8', goal: [['bolanieve', 3], ['muneco', 1], ['chocolate', 1]] });
  CH.add({ id: 'montana3', line: 'montana', title: '¡El arcoíris!', en: 'The rainbow: Mateo\'s weather station; wind, clouds, rain... then you bring the sun', giver: 'mateo', words: ['viento', 'nube', 'lluvia', 'arcoiris'], icon: 'arcoiris', col: '#e8a020', goal: [['veleta', 1], ['arcoiris', 1]] });

  const SNOWGATE = [9, 11], SNOWFIELD = [10, 9], BASKET = [24, 18];
  const wearIt = function* (f, id) { const col = AB.putOn(f, id, AB.FIRST[id]); yield 24; return col; };
  // ---------- 1 · ¡Qué frío!: la montaña, la nieve, frío, el gorro, la bufanda, los guantes ----------
  CH.script('montana1', [
    { who: 'lucho', run: function* (f, c) {
      const lu = npcAt(f, 'lucho'); if (lu) MT.start(lu, 'wave', 50);
      yield* meetW('lamontana', { who: 'lucho', prompt: '¡Bienvenid{o/a} a la [lamontana:montaña]!', en: 'Welcome to the mountain! I\'m Don Lucho.', show: 'montana', known: othersFor('lamontana', ['casa', 'arbol', 'agua', 'mar']) });
      if (MT.weather() !== 'nieve') MT.setWeather('nieve');
      CH.point(SNOWGATE[0] * TL + 12, (SNOWGATE[1] - 2) * TL);
      try { yield* meetW('nieve', { who: 'lucho', prompt: '¡Mira, arriba! ¡La [nieve]!', en: 'Look, up there! Snow! Go and touch it!', show: 'nieve', known: othersFor('nieve', ['agua', 'arena', 'flor', 'casa']) }); } finally { CH.point(null); }
      c.data.up = 1;
    } },
    { spot: { map: 'montana', at: SNOWGATE, icon: 'nieve' }, run: function* (f, c) { // in the snow: brrr!
      const p = f.player; G.audio.sfx('select');
      for (let i = 0; i < 10; i++) puff('flake', p.x * TL + 12 + (Math.random() - 0.5) * 20, p.y * TL + 18, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.1, life: 30 });
      yield* MT.act(p, 'shiver', 60);
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog) { G.pet.place(f, dog); yield 6; yield* G.pet.play('huh'); }
      yield* meetW('frio', { who: 'lucho', prompt: '¡Brrr! ¡Hace [frio:frío]!', en: 'Brrr! It\'s cold! (you\'re shivering)', show: 'frio', known: othersFor('frio', ['feliz', 'triste', 'cansado', 'bien', 'caliente']) });
      CH.point(BASKET[0] * TL + 12, BASKET[1] * TL);
      try { yield* sayShow('lucho', { icon: 'gorro', col: AB.FIRST.gorro }, T('¡Ropa para el [frio:frío]! ¡Ven!', 'Warm clothes for the cold! Come to the refuge: there\'s a basket by the door.')); } finally { CH.point(null); }
      c.data.cold = 1;
    } },
    { spot: { map: 'montana', at: BASKET, icon: { icon: 'gorro', col: AB.FIRST.gorro } }, run: function* (f, c) { // the basket of warm clothes by the refuge's door
      G.audio.sfx('door');
      yield* meetW('gorro', { who: 'lucho', prompt: '¡Un [gorro]! ¡Póntelo!', en: 'A woolly hat! Put it on!', show: pic('gorro'), known: othersFor('gorro', ['sombrero', 'camisa', 'pelota', 'casa']) });
      c.data.gorro = 1; yield* wearIt(f, 'gorro');
      yield* meetW('bufanda', { who: 'lucho', prompt: '¡Una [bufanda]!', en: 'A scarf! Round your neck.', show: pic('bufanda'), known: othersFor('bufanda', ['gorro', 'camisa', 'calcetines', 'casa']) });
      c.data.bufanda = 1; yield* wearIt(f, 'bufanda');
      yield* meetW('guantes', { who: 'lucho', prompt: '¡Y [guantes]!', en: 'And gloves (mittens) for your hands!', show: pic('guantes'), known: othersFor('guantes', ['gorro', 'bufanda', 'mano', 'zapatos']) });
      c.data.guantes = 1; yield* wearIt(f, 'guantes');
      yield AB.mirror();
      yield* quiz('lucho', '¿Qué es?', 'What is this, that you\'re wearing? (say it!)', 'gorro', ['bufanda', 'guantes'], { show: pic('gorro') });
      yield* quiz('lucho', '¿Y esto?', 'And this?', 'guantes', ['gorro', 'bufanda'], { show: pic('guantes') });
      CH.point(SNOWFIELD[0] * TL + 12, SNOWFIELD[1] * TL);
      try { yield* sayShow('lucho', 'nieve', T('¡Ahora sí! ¡A la [nieve]!', 'Now you\'re ready! Off you go into the snow!')); } finally { CH.point(null); }
    } },
    { spot: { map: 'montana', at: SNOWFIELD, icon: 'nieve' }, run: function* (f, c) { // warm in the snow: no more shivering; the dog plays
      const p = f.player; G.audio.sfx('chime');
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
      if (dog) { G.pet.place(f, dog); yield 8; yield* G.pet.play('spin'); for (let i = 0; i < 16; i++) puff('flake', dog.x * TL + 12 + (Math.random() - 0.5) * 20, dog.y * TL + 12, { vy: -1.4 - Math.random(), vx: (Math.random() - 0.5) * 2.6, g: 0.1, life: 34 }); CK.bark(f, dog); }
      for (let i = 0; i < 12; i++) puff('flake', p.x * TL + 12 + (Math.random() - 0.5) * 24, p.y * TL + 8, { vy: -1 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.08, life: 36 });
      if (met('no') && met('si')) yield* quiz('lucho', '¿Y ahora? ¿Tienes [frio:frío]?', 'And now? Are you cold? (no!)', 'no', ['si'], {});
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('lucho', { icon: 'gorro', col: (AB.wear() || {}).gorro || AB.FIRST.gorro }, T('¡Calientit{o/a}! ¡Qué bonit{o/a}!', 'Nice and warm! You look lovely. (Mateo, the weather boy, has an idea... and there\'s a sled at the top of the slope!)'));
    } },
  ], {
    stage(f, c) { if (!outside(f) || !CH.active('montana1')) return; const lu = npcAt(f, 'lucho'); if (lu && !lu.busy && c.data.up && (lu.x !== BASKET[0] + 1 || lu.y !== BASKET[1] + 1)) CK.place(f, 'lucho', BASKET[0] + 1, BASKET[1] + 1, 'up'); },
    drawTop(f, ctx, c) { if (!outside(f) || !CH.active('montana1') || !c.data.cold || c.data.guantes) return; const x = BASKET[0] * TL + 4 - Math.round(f.cam.x), y = BASKET[1] * TL + 6 - Math.round(f.cam.y); G.drawIcon16(ctx, 'canasta', x, y); },
  });

  // ---------- 2 · El muñeco de nieve: el muñeco de nieve, el chocolate (caliente) ----------
  CH.script('montana2', [
    { who: 'mateo', run: function* (f, c) {
      yield* say('mateo', T('¡Hola, {name}! ¡Soy Mateo!', 'Hi, {name}! I\'m Mateo. I love the weather... and the snow!'));
      yield* meetW('muneco', { who: 'mateo', prompt: '¿Hacemos un [muneco:muñeco de nieve]?', en: 'Shall we build a snowman?', show: 'muneco', known: othersFor('muneco', ['casa', 'arbol', 'perro', 'gato', 'pelota']) });
      CH.point(PILES[0][0] * TL + 12, PILES[0][1] * TL);
      try { yield* sayShow('mateo', { icon: 'bolanieve', count: 3 }, T(met('tres') ? '¡[tres:Tres] bolas de [nieve]!' : '¡Bolas de [nieve]!', 'Three big balls of snow! Roll them from the snow piles.')); } finally { CH.point(null); }
      c.data.roll = 1; c.data.balls = 0; c.data.got = {};
    } },
    { spots: PILES.map((at, i) => ({ map: 'montana', at, icon: { icon: 'bolanieve' }, off: c => !!(c.data.got || {})[i] })), run: function* (f, c, i) { // roll a snowball from a pile: it grows, it rolls to the snowman's place
      const got = c.data.got || (c.data.got = {}); if (got[i]) return false;
      got[i] = 1; G.audio.sfx('swing');
      const [x, y] = PILES[i]; for (let k = 0; k < 10; k++) puff('flake', x * TL + 12 + (Math.random() - 0.5) * 16, y * TL + 16, { vy: -1 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.1, life: 28 });
      yield 16;
      c.data.balls = (c.data.balls | 0) + 1; G.audio.sfx('pop'); CK.sparkle(f, SNOWMAN[0], SNOWMAN[1], 4);
      const nw = ['uno', 'dos', 'tres'][c.data.balls - 1]; if (met(nw)) { G.fx.say(G.baseForm(nw), SNOWMAN[0] * TL + 12 - Math.round(f.cam.x), SNOWMAN[1] * TL - 16 - Math.round(f.cam.y), '#ffffff', true); G.speak(G.baseForm(nw)); }
      if (c.data.balls === 1 && met('grande')) { yield 20; yield* quiz('mateo', '¿Cómo es?', 'How is this snowball? (big or small?)', 'grande', ['pequeno'], { show: { icon: 'bolanieve' } }); }
      if (c.data.balls === 3 && met('pequeno')) { yield 20; yield* quiz('mateo', '¿Y esta?', 'And this one, for the head?', 'pequeno', ['grande'], { show: { icon: 'bolanieve' } }); }
      if (c.data.balls < 3) return false;
      yield 20;
      const lu = npcAt(f, 'lucho');
      if (lu) CH.pointNpc(lu); else CH.point(DOOR[0] * TL + 12, DOOR[1] * TL);
      try { yield* sayShow('mateo', { icon: 'zanahoria' }, T('¿Y la nariz? ¡Don Lucho tiene!', 'And his nose? A carrot! Don Lucho has carrots for his llamas.')); } finally { CH.point(null); }
    } },
    { who: 'lucho', bubble: { icon: 'zanahoria' }, run: function* (f, c) { // a carrot (the llamas love them), an old cap and scarf
      yield* sayShow('lucho', { icon: 'zanahoria' }, T('¡Una zanahoria! ¡Tómala!', 'A carrot for the snowman\'s nose! (my llamas would love it too)'));
      const lla = AN.find('llama', f); if (lla) { AN.cry('llama'); lla.react = 40; }
      bag().add('zanahoria', { q: 'montana2' }); G.audio.jingle('item');
      if (met('gorro') && met('bufanda')) yield* sayShow('lucho', { list: [{ icon: 'gorro', col: '#f8c830' }, { icon: 'bufanda', col: '#38a858' }] }, T('¡Y un [gorro] y una [bufanda] viejos!', 'And an old woolly hat and scarf for him!'));
      CH.point(SNOWMAN[0] * TL + 12, SNOWMAN[1] * TL - 20);
      try { yield 30; } finally { CH.point(null); }
    } },
    { spot: { map: 'montana', at: [SNOWMAN[0], SNOWMAN[1] + 1], icon: { icon: 'zanahoria' } }, run: function* (f, c) { // the snowman's face; the dog steals the nose
      const p = f.player; p.dir = 'up';
      bag().take('zanahoria', { q: 'montana2' }); c.data.nose = 1; G.audio.sfx('pop'); CK.sparkle(f, SNOWMAN[0], SNOWMAN[1] - 1, 4);
      yield 20;
      for (const w of ['gorro', 'bufanda'].filter(met)) {
        const vs = ['gorro', 'bufanda'].filter(k => met(k) && !c.data[k]); if (!vs.length) break;
        const ch = vs.map(k => ({ word: k, img: { icon: k, col: k === 'gorro' ? '#f8c830' : '#38a858' } }));
        const r = yield G.choose({ prompt: '¿Qué le pones?', en: 'What will you put on him? (say it, or tap it)', choices: ch, layout: 'cards', mic: true, who: 'mateo' });
        const k = ch[Math.max(0, Math.min(ch.length - 1, r.result | 0))].word; if (G.cards) G.cards.grow(k, 'tap');
        c.data[k] = k === 'gorro' ? '#f8c830' : '#38a858'; G.audio.sfx('chime'); CK.sparkle(f, SNOWMAN[0], SNOWMAN[1] - 1, 4); G.speak(G.baseForm(k)); yield 24;
        void w;
      }
      if (!met('gorro')) c.data.gorro = '#f8c830'; if (!met('bufanda')) c.data.bufanda = '#38a858';
      const dog = G.pet && G.pet.mine() ? CK.dog(f) : null;
      if (dog) { // the dog leaps up and runs off with the carrot!
        G.pet.place(f, dog); yield 10; CK.bark(f, dog); yield* G.pet.play('jump');
        c.data.stolen = 1; MT.carrot = dog; G.audio.sfx('pop');
        for (const [x, y] of [[SNOWMAN[0] + 3, SNOWMAN[1] + 1], [SNOWMAN[0] + 2, SNOWMAN[1] + 3], [SNOWMAN[0] - 2, SNOWMAN[1] + 2]]) { G.pet.sound('bark'); yield* CK.walk(f, dog, x, y, 6); }
        dog.dir = 'right';
        yield* sayShow('mateo', { icon: 'perro' }, T('¡{dog}! ¡La nariz!', '{dog} ran off with the carrot nose!'));
        if (met('ven')) {
          yield* ask('mateo', '¿Qué le dices?', 'What do you tell {dog}? (say it!)', 'ven', ['sientate', 'salta', 'gira'].filter(met).slice(0, 2), {});
        } else yield G.choose({ prompt: '¡{dog}!', en: 'Call {dog}! (tap him)', choices: [{ icon: 'perro', label: '¡{dog}!' }], layout: 'cards', who: null });
        yield* CK.walk(f, dog, p.x - 1, p.y, 5); dog.dir = 'right'; CK.bark(f, dog); CK.heart(f, dog);
        MT.carrot = null; c.data.stolen = 0; G.audio.sfx('pop'); CK.sparkle(f, SNOWMAN[0], SNOWMAN[1] - 1, 4);
      }
      c.data.done = 1; CK.confetti(); G.audio.jingle('promote');
      yield* quiz('mateo', '¿Qué es?', 'What did you build? (say it!)', 'muneco', ['casa', 'arbol', 'perro', 'pelota'], { show: 'muneco' });
      CH.point(DOOR[0] * TL + 12, DOOR[1] * TL);
      try { yield* sayShow('mateo', { icon: 'chocolate' }, T('¡Brrr! ¡Al refugio!', 'Brrr! Let\'s warm up in the refuge: Don Lucho makes hot chocolate!')); } finally { CH.point(null); }
      c.data.cocoa = 1;
    } },
    { spot: { map: 'montana_refugio', at: HEARTH, icon: { icon: 'chocolate' } }, run: function* (f, c) { // hot chocolate by the fire
      yield* meetW('chocolate', { who: 'lucho', prompt: '¡[chocolate:Chocolate] para todos!', en: 'Hot chocolate for everyone!', show: 'chocolate', known: othersFor('chocolate', ['leche', 'agua', 'pan', 'manzana']) });
      if (!met('caliente')) yield* meetW('caliente', { who: 'lucho', prompt: '¡Cuidado! ¡Está [caliente]!', en: 'Careful! It\'s hot!', show: 'caliente', known: othersFor('caliente', ['frio', 'feliz', 'triste']) });
      else yield* quiz('lucho', '¿Cómo está?', 'How is the chocolate? (hot or cold?)', 'caliente', ['frio'], { show: 'chocolate' });
      yield* pourCups(f, { c: c.data });
    } },
  ], {
    stage(f, c) { if (!outside(f) || !CH.active('montana2')) return; const m = npcAt(f, 'mateo'); if (m && !m.busy && c.data.roll && !c.data.done && (m.x !== SNOWMAN[0] + 1 || m.y !== SNOWMAN[1] + 1)) CK.place(f, 'mateo', SNOWMAN[0] + 1, SNOWMAN[1] + 1, 'left'); if (m && !m.busy && c.data.done && (m.x !== P('montana', 'mateo')[0] || m.y !== P('montana', 'mateo')[1])) CK.place(f, 'mateo', ...P('montana', 'mateo'), 'down'); },
    drawTop(f, ctx, c) { if (!outside(f) || !MT.carrot) return; const n = MT.carrot; G.drawIcon16(ctx, 'zanahoria', n.x * TL + 10 + (n.ox || 0) - Math.round(f.cam.x), n.y * TL + 8 + (n.oy || 0) - Math.round(f.cam.y), 0.6); },
  });

  // ---------- 3 · ¡El arcoíris!: el viento, la nube, la lluvia, (el sol), el arcoíris ----------
  CH.script('montana3', [
    { who: 'mateo', run: function* (f, c) { // the weather station: the wind, the clouds, the rain
      CH.point(STATION[0] * TL + 12, STATION[1] * TL - 18);
      try {
        yield* sayShow('mateo', { icon: 'veleta' }, T('¡Mi estación del tiempo!', 'My weather station! The vane shows the wind. Watch!'));
        MT.setWeather('viento', { force: true }); yield 70;
        yield* meetW('viento', { who: 'mateo', prompt: '¡Uy! ¡El [viento]!', en: 'Whoa! The wind! (look at the vane spin)', show: 'viento', known: othersFor('viento', ['nieve', 'agua', 'arbol', 'hoja']) });
        MT.setWeather('nube', { force: true }); yield 70;
        yield* meetW('nube', { who: 'mateo', prompt: '¡Mira! ¡Las [nube:nubes]!', en: 'Look! Clouds are coming!', show: 'nube', known: othersFor('nube', ['viento', 'nieve', 'arbol', 'flor']) });
        MT.setWeather('lluvia', { force: true }); yield 70;
        const dog = G.pet && G.pet.mine() ? CK.dog(f) : null; if (dog) { G.pet.place(f, dog); yield 6; yield* G.pet.play('spin'); for (let i = 0; i < 10; i++) puff('drop', dog.x * TL + 12 + (Math.random() - 0.5) * 16, dog.y * TL + 10, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.12, life: 30 }); }
        yield* meetW('lluvia', { who: 'mateo', prompt: '¡Ay! ¡La [lluvia]!', en: 'Oh no! Rain! We\'re getting wet!', show: 'lluvia', known: othersFor('lluvia', ['nube', 'viento', 'agua', 'nieve']) });
        yield* sayShow('mateo', { icon: 'veleta' }, T('¡Tú! ¡Cambia el tiempo!', 'You do it! Tap my weather station and bring the sun!'));
      } finally { CH.point(null); }
      c.data.rain = 1;
    } },
    { spot: { map: 'montana', at: STATION, icon: 'elsol' }, run: function* (f, c) { // the child brings the sun: a rainbow
      if (!met('elsol')) yield* meetW('elsol', { who: 'mateo', prompt: '¡Pide el [elsol:sol]!', en: 'Ask for the sun!', show: 'elsol', known: othersFor('elsol', ['lluvia', 'nube', 'viento', 'nieve']) });
      for (let tries = 0; tries < 4; tries++) {
        const k = yield* MT.weatherGame(f, { prompt: '¿Qué tiempo quieres?', en: 'What weather do you want? (say it: the sun!)', must: true });
        if (k === 'elsol') break;
        yield* sayShow('mateo', 'elsol', T('¿Y el [elsol:sol]?', 'And the sun? Ask for the sun!'));
      }
      if (MT.weather() !== 'elsol') MT.setWeather('elsol', { rainbow: true });
      MT.rainbow = G.frame; yield 90;
      yield* meetW('arcoiris', { who: 'mateo', prompt: '¡Un [arcoiris:arcoíris]!', en: 'A rainbow! After the rain, the sun makes a rainbow!', show: 'arcoiris', known: othersFor('arcoiris', ['elsol', 'nube', 'lluvia', 'flor']) });
      const cols = ['rojo', 'amarillo', 'verde', 'azul', 'rosa'].filter(met);
      if (cols.length >= 2) {
        const r = yield G.choose({ prompt: '¿Qué colores ves?', en: 'What colours can you see? (say one!)', choices: cols.slice(0, 4).map(w => ({ word: w })), layout: 'cards', mic: true, who: 'mateo' });
        const w = cols[Math.max(0, Math.min(cols.length - 1, r.result | 0))]; if (G.cards) G.cards.grow(w, 'tap'); G.speak(G.baseForm(w)); G.audio.sfx('chime'); yield 20;
      }
      CK.confetti(); G.audio.jingle('promote');
      yield* sayShow('mateo', 'arcoiris', T('¡Qué bonito! ¡Ahora tú cambias el tiempo!', 'How beautiful! Now you can change the weather at my station whenever you like!'));
    } },
  ], {
    stage(f, c) { if (!outside(f) || !CH.active('montana3')) return; const m = npcAt(f, 'mateo'); if (m && !m.busy && (m.x !== P('montana', 'mateo')[0] || m.y !== P('montana', 'mateo')[1])) CK.place(f, 'mateo', ...P('montana', 'mateo'), 'down'); },
  });

  // =====================================================================
  //  The zone
  // =====================================================================
  const bus = P('montana', 'bus'), busIn = P('montana', 'busIn');
  Z.add({
    id: 'montana', name: 'La montaña', en: 'the mountain', icon: 'montana', music: 'field', pos: [264, 90],
    maps: ['montana', 'montana_refugio'], path: 'camino_montana',
    bus: { map: 'montana', at: bus }, entry: { map: 'montana', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: KINDS, // the album page, in order
    habitat: { llama: 'montana', marmota: 'nieve', zorrillo: 'flor', carpintero: 'arbol', monarca: 'arbol', puma: 'nieve', aguila: 'montana', lobo: 'nieve' },
    rare: { aguila: 'elsol', lobo: 'noche' },
    planned: 0,
    lola: lolaHere,
  });
})();
