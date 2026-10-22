// La montaña (content/es/zone-montana.js, docs/WORLD_PLAN.md): walking in from Villa Sol, every place reachable
// outside and in the refuge, the bus, Lola (la mariposa monarca), going into the refuge; the animals (a tap meets an
// unmet one through Lola's puzzle, the rare eagle and wolf, the marmots ducking in, the woodpecker up a trunk, the album
// page, every new word's picture); the story by taps (¡Qué frío!, El muñeco de nieve, ¡El arcoíris!); the cold (you
// shiver in the snow without a gorro, a bufanda or guantes; worn everywhere after), the weather (Mateo's station: say
// it and it comes; his "¿Qué tiempo hace?"); the side quests (the sled race, skating, the tracks, hot chocolate, the
// lookout, the snowman); the dog (rolls in the snow, a snow tunnel, the marmots); hide-and-seek, a page puzzle, save
// and load.
// NODE_PATH=$(npm root -g) node tools/test-zone-montana.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked;
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (!o.demo) G.demo.skip();
  if (o.visit !== false) { G.zones.visit('villa'); G.zones.visit('montana'); }
  const y = new Date(G.now() - 864e5), ago = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate(); // (words she knows came on an earlier day: today's new words, the pacing's, count only today's)
  for (const w of o.words || []) { G.words.meet(w, 't'); Object.assign(G.words.rec(w), { mdate: ago, mdn: G.words.dayNum() - 1 }); }
  for (const q of o.done || []) G.state.quests[q] = 'done';
  if (o.lola !== false) G.state.world.lola = { met: true, montana: G.words.day() }; // (Lola said hello today: her bubble is done)
  G.goto(o.map || 'montana', o.x == null ? 12 : o.x, o.y == null ? 23 : o.y, 'down');
}, o);
const idle = (g, map = 'montana') => g.fieldIdle(map);
async function drv(g, done, what, o) {
  try { await g.drive(done, what, o); } catch (e) {
    await g.shot('stuck');
    console.log('    (stuck: ' + await g.ev(() => JSON.stringify({ top: G.top().constructor.name, locked: G.field && G.field.locked, map: G.field && G.field.mapId, p: G.field && [G.field.player.x, G.field.player.y], held: G.carry.held(), why: (G.guide.goal(G.field) || {}).why })) + ')');
    throw e;
  }
}
async function tapNpc(g, id, dx = 1, dy = 0) {
  await g.ev(([id, dx, dy]) => { const n = G.field.npc(id), p = G.field.player; n.home = [n.x, n.y]; p.x = n.x + dx; p.y = n.y + dy; p.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down'; G.field.snapCam(); }, [id, dx, dy]);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
async function tapAt(g, x, y, sx, sy) {
  await g.ev(([x, y, sx, sy]) => { const p = G.field.player; p.x = sx == null ? x : sx; p.y = sy == null ? y + 1 : sy; G.field.snapCam(); }, [x, y, sx, sy]);
  await g.frames(4);
  await g.tapTile(x, y);
}
const goto = async (g, map, x, y) => { await g.ev(([m, x, y]) => G.goto(m, x, y, 'down'), [map, x, y]); await idle(g, map); };
const step = id => `free() && G.chapters.state().step.${id}`;
void step;

// ---------- walking in from Villa Sol, every place reachable, the bus, Lola, the refuge ----------
async function walkIn(browser) {
  const { ctx, g } = await open(browser, 'montana-walk', true);
  try {
    await fresh(g, { visit: false, lola: false, map: 'villa', x: 46, y: 10 });
    await idle(g, 'villa');
    await g.page.keyboard.down('ArrowRight'); await g.until(() => G.field.mapId === 'camino_montana', null, 'the path'); await g.page.keyboard.up('ArrowRight');
    await g.fieldIdle('camino_montana');
    await g.ev(() => { const p = G.field.player; p.x = 28; p.y = 6; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowRight'); await g.until(() => G.field.mapId === 'montana', null, 'the mountain'); await g.page.keyboard.up('ArrowRight');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await drv(g, () => G.top() === G.field && !G.field.locked && G.field.mapId === 'montana', 'the new place card');
    check('walk: from Villa Sol along the path to the mountain: "¡Nuevo lugar!", visited', await g.ev(() => G.zones.visited('montana') && G.field.player.x <= 2));
    await g.frames(30); await g.shot('arrival');
    const r = await g.ev(() => ({ kinds: [...new Set(G.animals.here().map(a => a.kind))], ppl: ['lola', 'nico', 'lucho', 'mateo'].filter(id => G.field.npc(id)), wx: G.montana.weather() }));
    check('walk: llamas, marmots, skunks, a woodpecker, monarchs and a puma are out by day (no wolf); it is snowing', ['llama', 'marmota', 'zorrillo', 'carpintero', 'monarca', 'puma'].every(k => r.kinds.includes(k)) && !r.kinds.includes('lobo') && r.wx === 'nieve', JSON.stringify(r));
    check('walk: Lola, Nico, Don Lucho and Mateo are here', r.ppl.length === 4, JSON.stringify(r));
    const reach = await g.ev(() => {
      const bfs = (f, s) => { const key = (a, b) => a + ',' + b, q = [s], vis = new Set([key(...s)]); for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || na < 0 || nb < 0 || na >= f.w || nb >= f.h) continue; const t = G.TERRAIN[f.get(na, nb)]; if (!t || t.block || t.wall) continue; vis.add(key(na, nb)); q.push([na, nb]); } } return vis; };
      const map = id => { const rows = G.MAPDATA[id].rows; return { w: rows[0].length, h: rows.length, get: (x, y) => rows[y] && rows[y][x] }; };
      const out = [], O = bfs(map('montana'), G.MAPDATA.montana.pos.in), I = bfs(map('montana_refugio'), G.MAPDATA.montana_refugio.pos.door);
      const nb = (V, [x, y]) => [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(t => V.has(t.join(',')));
      const P = G.MAPDATA.montana.pos, Q = G.MAPDATA.montana_refugio.pos;
      for (const [k, at] of Object.entries({ lola: P.lola, nico: P.nico, lucho: P.lucho, mateo: P.mateo, bus: P.busIn, door: [P.door[0], P.door[1] + 1], station: P.station, sled: P.sled, slopeEnd: P.slopeEnd, viewer: P.viewer, snowman: P.snowman, pile1: P.pile1, pile2: P.pile2, pile3: P.pile3, dog: P.dog, tunnel: P.tunnel, tunnelOut: P.tunnelOut, marmotas: P.marmotasDog, basket: [24, 18], gate: [9, 11], field: [10, 9], ice: [30, 6] })) if (!nb(O, at)) out.push(k);
      for (const [k, at] of Object.entries({ hearth: Q.hearth, luchoIn: Q.lucho })) if (!nb(I, at)) out.push(k);
      for (const s of G.montana.SIDE) if (!nb(s.map === 'montana' ? O : I, G.montana.atOf(s))) out.push(s.id);
      for (const t of G.montana.TRACKS) { for (const p of t.path) if (!O.has(p.join(','))) out.push('track ' + t.kind); if (!nb(O, t.hide)) out.push('track end ' + t.kind); }
      for (const s of G.carry.SOURCES.filter(s => s.map === 'montana')) if (!O.has(s.at.join(','))) out.push(s.id);
      for (const s of G.seek.SPOTS.filter(s => s.map === 'montana')) if (!nb(O, s.at)) out.push(s.id);
      for (const k in G.maps.montana.pages) if (!O.has(k)) out.push('page ' + k);
      return out;
    });
    check('walk: everyone, the refuge door, the station, the sled, the binoculars, the snowman, the ice, the dog\'s spots, the tracks, things, hiding places and pages are all reachable', !reach.length, reach.join(','));
    // the bus back to Villa Sol and back
    const b = await g.ev(() => G.zones.def('montana').bus.at);
    await g.ev(b => { const p = G.field.player; p.x = b[0] - 1; p.y = b[1]; G.field.snapCam(); }, b);
    await g.tapTile(b[0], b[1]);
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(10);
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'villa')));
    await g.until(() => G.field.mapId === 'villa' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to Villa Sol', 30000);
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    await g.tapRect(await g.ev(() => G.top().rect('map')));
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map from the menu');
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'montana')));
    await g.until(() => G.field.mapId === 'montana' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus back', 30000);
    check('walk: the bus takes you to the mountain\'s stop (and back)', await g.ev(() => { const e = G.zones.def('montana').entry, p = G.field.player; return p.x === e.x && p.y === e.y; }));
    // Lola: the dog's spot, la mariposa monarca, Don Lucho
    await g.ev(() => { const m = G.animals.find('monarca'); m.x = 8 * 24 + 12; m.y = 24 * 24 + 18; m.st = 'idle'; m.t = 999; });
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.zones.lolaTalked('montana'), 'Lola');
    check('walk: Lola says hello and meets la mariposa monarca (the firs are full of them)', await g.ev(() => G.words.met('monarca') && G.animals.met('monarca')));
    // into the refuge
    const d = await g.ev(() => G.MAPDATA.montana.pos.door);
    await g.ev(d => { const p = G.field.player; p.x = d[0]; p.y = d[1] + 2; G.field.snapCam(); }, d);
    await g.tapTile(d[0], d[1]);
    await g.until(() => G.field.mapId === 'montana_refugio', null, 'inside the refuge', 30000);
    await idle(g, 'montana_refugio');
    await g.frames(20); await g.shot('refuge_inside');
    check('walk: the refuge\'s door opens: inside, the fire and the pot of hot chocolate', await g.ev(() => G.field.map.get(2, 1) === 'v'));
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the animals: Lola names one; the rare ones; marmots, the woodpecker; the album; every word's picture ----------
async function animals(browser) {
  const { ctx, g } = await open(browser, 'montana-animals', true);
  try {
    await fresh(g, { x: 30, y: 23 });
    await idle(g);
    await g.ev(() => { const a = G.animals.find('llama'); a.x = 31 * 24 + 12; a.y = 25 * 24 + 18; a.st = 'idle'; a.t = 999; });
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('llama'))));
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Lola naming the llama');
    await g.frames(10); await g.shot('lola_names_llama');
    await drv(g, () => free() && G.words.met('llama'), 'Lola\'s puzzle');
    check('animals: tapping an unmet animal: Lola names it; la llama is met and in the album', await g.ev(() => G.words.met('llama') && G.animals.met('llama')));
    // the marmots duck into their holes when the dog comes near; the woodpecker clings up a trunk
    const mm = await g.ev(() => { const a = G.animals.find('marmota'); return [a.x, a.y]; });
    await g.ev(() => { const p = G.field.player; p.x = 25; p.y = 12; G.field.snapCam(); }); await g.frames(30); await g.shot('marmots');
    const ducked = await g.ev(mm => { const d = G.pet.npc(G.field), a = G.animals.find('marmota'); d.x = Math.floor(a.x / 24); d.y = Math.floor(a.y / 24); d.ox = 0; d.oy = 0; return true; }, mm);
    await g.frames(10);
    check('animals: a marmot ducks into its hole when the dog comes near', ducked && await g.ev(() => G.animals.here().filter(a => a.kind === 'marmota').some(a => a.st === 'hole')));
    await g.ev(() => { const p = G.field.player; p.x = 6; p.y = 20; G.field.snapCam(); }); await g.frames(60); await g.shot('grove');
    check('animals: the woodpecker clings up a fir\'s trunk; monarchs flutter in the grove', await g.ev(() => { const w = G.animals.find('carpintero'); return w.z > 8 && G.field.map.get(...[Math.floor(w.x / 24), Math.floor((w.y - 1) / 24)]) === ')' || w.st === 'fly'; }));
    // the rare ones: the eagle in the sun, the wolf at night
    const kinds = await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = () => true; G.montana.setWeather('elsol'); G.field.zoo = null; const k = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; return k; });
    check('animals: when the sun shines an eagle soars over the lookout; at night a wolf on the crag', kinds.includes('aguila') && kinds.includes('lobo'), JSON.stringify(kinds));
    await g.ev(() => { const p = G.field.player; p.x = 8; p.y = 6; G.field.snapCam(); }); await g.frames(60); await g.shot('eagle');
    check('animals: the eagle soars high (its shadow on the snow)', await g.ev(() => { const a = G.animals.find('aguila'); return !!a && a.z > 30; }), await g.ev(() => JSON.stringify(G.animals.here().filter(a => a.kind === 'aguila').map(a => [a.x, a.y, a.z, a.st]))));
    await g.ev(() => { G.montana.setWeather('nieve'); G.debug.sunsetAt = 0; G.field.zoo = null; const p = G.field.player; p.x = 5; p.y = 6; G.field.snapCam(); });
    await g.frames(240); await g.shot('night_wolf');
    await g.ev(() => { const p = G.field.player; p.x = 25; p.y = 19; G.field.snapCam(); }); await g.frames(20); await g.shot('night_refuge');
    await g.ev(() => { G.debug.sunsetAt = null; G.field.zoo = null; });
    check('album: the page has its 8 animals, numbered after the grandparents\'; rare ones and habitats marked', await g.ev(() => { const z = G.zones.def('montana'); return z.animals.length === 8 && z.planned === 0 && G.album.entries('montana').length === 8 && G.album.entries('montana').every(Boolean) && z.rare.aguila === 'elsol' && z.rare.lobo === 'noche' && Object.values(z.habitat).every(G.iconDrawn) && G.album.number('llama') === G.album.zoneStart('montana') + 1 && G.album.zoneStart('montana') > G.album.zoneStart('abuelos'); }));
    const ws = await g.ev(() => Object.keys(G.data.words).filter(k => ['tiempo', 'montana', 'faunamontana'].includes(G.data.words[k].topic)));
    check('words: 22 new words, every one with its own picture (3 notebook pages)', ws.length === 22 && await g.ev(ws => ws.every(G.iconDrawn) && ['tiempo', 'montana', 'faunamontana'].every(p => G.data.pages[p]), ws), ws.join(','));
    check('words: no word id shadows an animal or another word; sound-alikes never share a picture', await g.ev(() => ['lamontana', 'nieve', 'frio', 'nube', 'viento', 'lluvia', 'arcoiris', 'gorro', 'bufanda', 'guantes', 'muneco', 'chocolate', 'trineo', 'hielo'].every(w => G.data.words[w].icon !== 'sombrero') && !/nieve/.test(G.data.words.helado.alt) && !/gorro/.test(G.data.words.sombrero.alt)));
    await g.ev(ws => {
      const extra = ['bolanieve', 'veleta', 'zanahoria', { icon: 'gorro', col: '#e04040' }, { icon: 'bufanda', col: '#3870d8' }, { icon: 'guantes', col: '#38a858' }];
      const L = ws.concat(extra), cv = document.createElement('canvas'), s = 4, cols = 7; cv.width = cols * 18 * s; cv.height = Math.ceil(L.length / cols) * 18 * s;
      const c = cv.getContext('2d'); c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
      L.forEach((w, i) => c.drawImage(G.icon(w), (i % cols) * 18 * s + s, Math.floor(i / cols) * 18 * s + s, 16 * s, 16 * s));
      Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', zIndex: 99, width: cv.width / 2 + 'px' }); cv.id = 'sheet'; document.body.appendChild(cv);
    }, ws);
    await g.shot('icons'); await g.ev(() => document.getElementById('sheet').remove());
    await g.ev(() => G.album('montana')); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(12); await g.shot('album_montana');
    await g.ev(() => { G.pop(); });
    check('animals: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story, by taps ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'montana-story', true, { openPacing: true }); // (the chapters' content back to back in one day: story pacing, src/chapters.js, would hold the second; it's tested in test-memory.js)
  try {
    await fresh(g, { x: 28, y: 23, words: ['uno', 'dos', 'tres', 'cuatro', 'ven', 'rojo', 'amarillo', 'verde', 'azul', 'si', 'no'] });
    await idle(g);
    check('story: Don Lucho has the chapter in his bubble (the zone\'s quest line)', await g.ev(() => G.chapters.next('montana') === 'montana1' && !G.chapters.gate('montana1') && !!G.field.npc('lucho').alert()));
    // 1 · ¡Qué frío!
    await tapNpc(g, 'lucho', -1, 0);
    await drv(g, () => free() && G.chapters.state().step.montana1 === 1, 'Lucho: la montaña, la nieve');
    check('story 1: la montaña and la nieve met; it snows; the guide points up to the snow', await g.ev(() => G.words.met('lamontana') && G.words.met('nieve') && G.montana.weather() === 'nieve' && /montana1/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => JSON.stringify([(G.guide.goal(G.field) || {}).why, G.chapters.live(), G.chapters.targets(G.field), G.chapters.lineHere(), G.state.quests.montana1])) + g.errors.join(" | "));
    await tapAt(g, 9, 11, 9, 12);
    await drv(g, () => G.field.player.mt && G.field.player.mt.k === 'shiver', 'shivering');
    await g.frames(16); await g.shot('shiver');
    await drv(g, () => free() && G.chapters.state().step.montana1 === 2, 'brrr: frío');
    check('story 1: frío met (you shivered in the snow)', await g.ev(() => G.words.met('frio')));
    await tapAt(g, 24, 18, 24, 19);
    await drv(g, () => G.top().constructor.name === 'Mirror', 'the basket: gorro, bufanda, guantes');
    await g.frames(40); await g.shot('mirror_warm');
    await drv(g, () => free() && G.chapters.state().step.montana1 === 3, 'the basket');
    check('story 1: el gorro, la bufanda, los guantes met and worn (a knitted cap, a scarf, mittens on your character)', await g.ev(() => ['gorro', 'bufanda', 'guantes'].every(G.words.met) && G.field.player.spec.head === 'beanie' && !!G.field.player.spec.scarf && !!G.field.player.spec.gloves));
    await tapAt(g, 10, 9, 10, 10);
    await drv(g, () => free() && G.chapters.done('montana1'), 'warm in the snow');
    check('story 1 done: warm now; chapter 2 opens (Mateo\'s bubble)', await g.ev(() => G.chapters.done('montana1') && G.chapters.next('montana') === 'montana2' && !G.montana.cold(G.field)));
    // 2 · El muñeco de nieve
    await goto(g, 'montana', 13, 20);
    check('story 2: Mateo has it in his bubble', await g.ev(() => !!G.field.npc('mateo').alert()));
    await tapNpc(g, 'mateo', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.montana2 === 1, 'Mateo: el muñeco de nieve');
    check('story 2: el muñeco de nieve met; three snow piles to roll', await g.ev(() => G.words.met('muneco')));
    for (const tag of ['pile1', 'pile2', 'pile3']) { const p = await g.ev(t => G.MAPDATA.montana.pos[t], tag); await tapAt(g, p[0], p[1], p[0], p[1] + 1); await drv(g, () => free(), 'a snowball'); }
    await g.ev(() => { const p = G.field.player; p.x = 10; p.y = 9; G.field.snapCam(); }); await g.frames(10); await g.shot('three_balls');
    check('story 2: three snowballs stacked', await g.ev(() => G.montana.snowman().balls === 3 && G.chapters.state().step.montana2 === 2));
    await goto(g, 'montana', 28, 22);
    await tapNpc(g, 'lucho', -1, 0);
    await drv(g, () => free() && G.chapters.state().step.montana2 === 3, 'Lucho: a carrot');
    check('story 2: a carrot from Don Lucho', await g.ev(() => !!G.errands.bag.has('zanahoria', { q: 'montana2' })));
    await tapAt(g, 10, 8, 10, 9);
    await drv(g, () => G.chapters.ctx('montana2').data.stolen === 1 && G.top().constructor.name === 'TextBox', 'the dog steals the nose');
    await g.frames(10); await g.shot('dog_steals_nose');
    await drv(g, () => free() && G.chapters.state().step.montana2 === 4, 'the snowman');
    check('story 2: the snowman has his nose, a cap and a scarf; the guide points to the refuge', await g.ev(() => { const s = G.montana.snowman(); return s.nose && s.gorro && s.bufanda && /montana2/.test((G.guide.goal(G.field) || {}).why || ''); }), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await g.ev(() => { const p = G.field.player; p.x = 10; p.y = 9; G.field.snapCam(); }); await g.frames(10); await g.shot('snowman');
    await goto(g, 'montana_refugio', 2, 3);
    check('story 2: Don Lucho is in the refuge for the hot chocolate', await g.ev(() => !!G.field.npc('lucho')));
    await tapAt(g, 2, 1, 2, 2);
    await drv(g, () => free() && G.chapters.done('montana2'), 'hot chocolate');
    check('story 2 done: el chocolate (and caliente) met; four cups poured and counted', await g.ev(() => G.words.met('chocolate') && G.words.met('caliente') && G.chapters.done('montana2') && (G.chapters.ctx('montana2').data.n | 0) === 4));
    await g.frames(10); await g.shot('cups');
    // 3 · ¡El arcoíris!
    await goto(g, 'montana', 13, 20);
    await tapNpc(g, 'mateo', 0, 1);
    await drv(g, () => G.montana.weather() === 'lluvia' && free() || (G.montana.weather() === 'lluvia' && G.top().constructor.name === 'TextBox' && G.top().t > 30), 'the rain');
    await g.shot('rain');
    await drv(g, () => free() && G.chapters.state().step.montana3 === 1, 'Mateo: viento, nube, lluvia');
    check('story 3: el viento, la nube, la lluvia met (the weather changed each time); it is raining', await g.ev(() => ['viento', 'nube', 'lluvia'].every(G.words.met) && G.montana.weather() === 'lluvia'));
    const st = await g.ev(() => G.MAPDATA.montana.pos.station);
    await tapAt(g, st[0], st[1], st[0], st[1] + 1);
    g.beforeAct = async s => { // the child asks for the sun (picks its card)
      if (s.name !== 'Choice' || s.t <= 8) return false;
      const k = await g.ev(() => (/tiempo quieres/.test(G.top().o.prompt) ? G.top().ch.findIndex(c => c.word === 'elsol') : -1)); if (k < 0) return false;
      await g.tapRect(s.rects[k]); return true;
    };
    await drv(g, () => G.words.met('arcoiris') && G.montana.rainbowOn(), 'the sun and the rainbow');
    g.beforeAct = null;
    await g.frames(30); await g.shot('rainbow');
    await drv(g, () => free() && G.chapters.done('montana3'), 'the rainbow');
    check('story 3 done: el sol brought by the child, el arcoíris met; the weather station is hers now', await g.ev(() => G.words.met('elsol') && G.chapters.done('montana3') && G.montana.weather() === 'elsol'));
    check('story: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the cold and the weather: shivering, warm clothes worn everywhere, the station, Mateo's question ----------
async function weather(browser) {
  const { ctx, g } = await open(browser, 'montana-weather', true);
  try {
    await fresh(g, { x: 10, y: 9, words: ['nieve', 'nube', 'lluvia', 'viento', 'elsol', 'frio', 'caliente'], done: ['montana1', 'montana2', 'montana3'] });
    await idle(g);
    await g.until(() => G.field.player.mt && G.field.player.mt.k === 'shiver', null, 'shivering in the snow', 15000);
    check('cold: in the snow with nothing warm on, you shiver ("¡Brrr!")', await g.ev(() => G.montana.cold(G.field) && G.montana.state().shivers >= 1));
    await g.frames(10); await g.shot('brrr');
    await g.ev(() => { G.words.meet('gorro', 't'); G.abuelos.putOn(G.field, 'gorro'); });
    check('cold: a gorro on: warm (no more shivering)', await g.ev(() => !G.montana.cold(G.field) && G.field.player.spec.head === 'beanie'));
    await g.ev(() => { G.abuelos.putOn(G.field, 'bufanda'); G.abuelos.putOn(G.field, 'guantes'); });
    await goto(g, 'villa', 5, 20);
    check('cold: the gorro, the bufanda and the guantes stay on in Villa Sol too (and in the portrait)', await g.ev(() => { const s = G.field.player.spec, pt = G.st.playerSpec().portrait; return s.head === 'beanie' && s.scarf && s.gloves && pt.head === 'beanie' && pt.scarf; }));
    await g.frames(10); await g.shot('warm_in_town');
    check('cold: a sombrero takes the place of the gorro (one hat at a time)', await g.ev(() => { G.abuelos.putOn(G.field, 'sombrero'); const ok = G.field.player.spec.head === 'hat' && !G.abuelos.wear().gorro; G.abuelos.putOn(G.field, 'gorro'); return ok && G.field.player.spec.head === 'beanie'; }));
    // the weather station: say the weather you want
    await goto(g, 'montana', 12, 19);
    const st = await g.ev(() => G.MAPDATA.montana.pos.station);
    await tapAt(g, st[0], st[1], st[0], st[1] + 1);
    await g.until(() => G.top().constructor.name === 'Choice', null, '"¿Qué tiempo quieres?"');
    await g.frames(10); await g.shot('que_tiempo_quieres');
    check('station: "¿Qué tiempo quieres?" offers the weather words you know (mic on)', await g.ev(() => { const s = G.top(); return s.ch.length === 4 && s.o.mic && s.ch.some(c => c.word === 'lluvia') && !s.ch.some(c => c.word === G.montana.weather()); }));
    const k = await g.ev(() => G.top().ch.findIndex(c => c.word === 'viento'));
    await g.tapRect(await g.ev(k => G.top().rects()[k], k));
    await g.until(() => free(), null, 'the wind');
    await g.frames(40); await g.shot('wind');
    check('station: the wind blows (the vane spins)', await g.ev(() => G.montana.weather() === 'viento' && G.montana.state().changes === 1));
    // Mateo: "¿Qué tiempo hace?"
    check('Mateo has his weather question in his bubble', await g.ev(() => { const a = G.field.npc('mateo').alert(); return a && a.icon === 'veleta'; }));
    await tapNpc(g, 'mateo', 0, 1);
    await drv(g, () => G.top().constructor.name === 'Choice' && /tiempo/.test(G.top().o.prompt || ''), '"¿Qué tiempo hace?" (after his greeting of the day)');
    check('Mateo: "¿Qué tiempo hace?" (the answer is the weather you see: viento)', await g.ev(() => G.top().o.answer != null && G.top().ch[G.top().o.answer].word === 'viento'));
    await drv(g, () => free() && G.montana.state().forecasts === 1, 'Mateo\'s question');
    check('weather: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- side quests: the sled race, skating, the tracks, hot chocolate, the lookout, the snowman ----------
async function side(browser) {
  const { ctx, g } = await open(browser, 'montana-side', true);
  try {
    await fresh(g, { x: 18, y: 5, words: ['gorro', 'bufanda', 'uno', 'dos', 'tres', 'cuatro', 'caliente', 'chocolate', 'nube', 'marmota', 'zorrillo', 'conejo', 'llama'], done: ['montana1', 'montana2', 'montana3'] });
    await idle(g);
    await g.ev(() => { G.abuelos.putOn(G.field, 'gorro'); });
    check('side: the sled and today\'s tracks have picture bubbles', await g.ev(() => ['sled', 'tracks'].every(id => { const s = G.montana.SIDE.find(s => s.id === id); return s.on() && s.icon(); })));
    // "Salta dos veces" from the dog's card up here (src/listen.js L.doIt): her character jumps, the mountain's own drawing
    // set aside meanwhile (S2 review #15: it put itself back every frame, and she stood still)
    const mt = await g.ev(() => { const d = {}; G.montana.hook(d); window.__drawMT = d.drawSelf; window.__acts = []; G.field.tasks.add((function* () { yield* G.listen.doIt({ verb: 'act', thing: 'salta', n: 2 }); window.__doneAct = true; })()); return true; });
    await g.until(() => !!G.field.player.act && G.frame - G.field.player.act.f0 > 6, null, 'the jump', 8000);
    const mt1 = await g.ev(() => ({ k: G.field.player.act.k, mine: G.field.player.drawSelf === window.__drawMT }));
    await g.until(() => window.__doneAct, null, 'the jumps done', 8000);
    await g.frames(4);
    check('side: "Salta dos veces" on the mountain: she jumps (the park\'s move draws her, not the mountain\'s pose); then the mountain\'s again', mt && mt1.k === 'salta' && !mt1.mine && await g.ev(() => G.field.player.drawSelf === window.__drawMT), JSON.stringify(mt1));
    const sl = await g.ev(() => G.MAPDATA.montana.pos.sled);
    await tapAt(g, sl[0], sl[1], sl[0], sl[1] + 1);
    await drv(g, () => !!G.field.player.sled && G.field.player.sled.y > 7 * 24, 'el trineo, then sledding down');
    await g.shot('sledding');
    await drv(g, () => G.top().constructor.name === 'Choice' && /Otra/.test(G.top().o.prompt), 'the race');
    check('side: el trineo met; a race down the slope with the dog: you won the first one', await g.ev(() => G.words.met('trineo') && G.montana.state().races === 1 && G.montana.state().wins === 1 && G.field.player.y === G.MAPDATA.montana.pos.slopeEnd[1]));
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.until(() => !!G.field.player.sled && G.field.player.sled.up, null, 'the dog pulls you back up');
    await g.frames(40); await g.shot('dog_pulls_sled');
    await g.until(() => G.top().constructor.name === 'TextBox' || (G.top().constructor.name === 'Choice' && /Otra/.test(G.top().o.prompt)), null, 'the second race', 30000);
    await g.until(() => G.top().constructor.name === 'Choice' && /Otra/.test(G.top().o.prompt), null, 'again?', 30000).catch(() => {});
    await drv(g, () => G.top().constructor.name === 'Choice' && /Otra/.test(G.top().o.prompt), 'again?');
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.until(() => free(), null, 'done sledding');
    check('side: two races, then "¡Ya!"', await g.ev(() => G.montana.state().races === 2));
    // skating on the frozen pond
    await tapAt(g, 30, 8, 30, 9);
    await drv(g, () => !!G.field.player.skate, 'el hielo, then skating');
    await g.frames(80); await g.shot('skating');
    await drv(g, () => free() && G.montana.state().skates === 1, 'skating');
    check('side: el hielo met; you skate round the frozen pond (the dog slides after you)', await g.ev(() => G.words.met('hielo') && !G.field.player.skate));
    // the tracks in the snow
    const tr = await g.ev(() => G.montana.TRACKS[G.words.day() % 3].path[0]);
    await g.ev(() => { const p = G.field.player; p.x = 12; p.y = 16; G.field.snapCam(); });
    await g.frames(10); await g.shot('tracks');
    await tapAt(g, tr[0], tr[1], tr[0], tr[1] + 1);
    await drv(g, () => free() && G.montana.state().trails === 1, 'the tracks');
    check('side: the dog follows the tracks in the snow; who made them? (picked)', await g.ev(() => G.montana.state().tracks.done));
    // the lookout: the view over the clouds
    const v = await g.ev(() => G.MAPDATA.montana.pos.viewer);
    await tapAt(g, v[0], v[1], v[0], v[1] + 1);
    await g.until(() => G.top().constructor.name === 'Mirador' && G.top().t > 60, null, 'the view');
    await g.shot('mirador');
    await drv(g, () => free() && G.montana.state().views === 1, 'the lookout');
    check('side: the lookout: the view over the clouds, then "¿Qué hay abajo?"', await g.ev(() => G.montana.state().views === 1));
    // dress the snowman
    await tapAt(g, 10, 7, 10, 8);
    await g.until(() => G.top().constructor.name === 'Choice', null, '"¿Qué le pones?"');
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.until(() => free(), null, 'dressed');
    check('side: the snowman gets a cap or a scarf in another colour', await g.ev(() => G.montana.state().dressed === 1));
    // a snowball to pick up: the dog chomps it
    check('side: snow piles give snowballs after the snowman', await g.ev(() => G.carry.SOURCES.filter(s => s.item === 'bolanieve').every(s => G.carry.avail(s.id))));
    // hot chocolate
    await goto(g, 'montana', 28, 22);
    check('side: Don Lucho has hot chocolate in his bubble', await g.ev(() => { const a = G.field.npc('lucho').alert(); return a && a.icon === 'chocolate'; }));
    await tapNpc(g, 'lucho', -1, 0);
    await drv(g, () => free() && G.montana.state().choco.on, 'Lucho: chocolate?');
    check('side: the guide sends you into the refuge', await g.ev(() => /chocolate/.test((G.zones.task(G.field) || {}).why || '')));
    await goto(g, 'montana_refugio', 2, 3);
    await tapAt(g, 2, 1, 2, 2);
    await drv(g, () => free() && G.montana.state().choco.done, 'pouring');
    check('side: four cups poured and counted; hot chocolate drunk (warm for a while)', await g.ev(() => G.montana.state().chocos === 1 && G.montana.state().choco.n === 4));
    check('side: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog: rolls in the snow, a snow tunnel, chases the marmots ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'montana-dog', true);
  try {
    await fresh(g, { x: 10, y: 12 });
    await idle(g);
    await g.ev(() => { G.abuelos.putOn(G.field, 'gorro'); });
    const spot = async (id, sx, sy) => { const sp = await g.ev(id => G.field.def.dogSpots.find(s => s.id === id).at, id); await tapAt(g, sp[0], sp[1], sx, sy); await g.until(id => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === id)), id, 'the dog at ' + id, 60000); await g.until(() => free(), null, 'done'); };
    await spot('montana_nieve', 10, 12);
    check('dog: he rolls in the snow (a snow angel)', await g.ev(() => G.montana.angels.length === 1));
    await g.frames(10); await g.shot('snow_angel');
    const tn = await g.ev(() => G.MAPDATA.montana.pos.tunnel);
    await tapAt(g, tn[0], tn[1], tn[0], tn[1] + 1);
    await g.until(() => !!G.montana.tunnel, null, 'the tunnel', 60000);
    await g.frames(30); await g.shot('tunnel');
    await g.until(() => free() && !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'montana_tunel')), null, 'out of the tunnel', 60000);
    check('dog: he digs a snow tunnel and pops out over there with a bone', await g.ev(() => { const o = G.MAPDATA.montana.pos.tunnelOut; return G.carry.state().ground.some(it => it.map === 'montana' && it.id === 'hueso' && it.x === o[0] && it.y === o[1]); }));
    const md = await g.ev(() => G.MAPDATA.montana.pos.marmotasDog);
    await spot('montana_marmotas', md[0], md[1] + 1);
    check('dog: he chases the marmots (they duck in)', await g.ev(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'montana_marmotas'))));
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hide-and-seek; a page puzzle; save and load ----------
async function seek(browser) {
  const { ctx, g } = await open(browser, 'montana-seek', true);
  try {
    await fresh(g, { x: 16, y: 24, words: ['marmota', 'conejo', 'zorrillo', 'gato', 'llama', 'cabra'] });
    await idle(g);
    check('seek: Nico has a game here', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await tapNpc(g, 'nico', 1, 0);
    await drv(g, () => free() && G.seek.active(), 'Nico');
    const L = await g.ev(() => G.seek.list().map(h => ({ k: h.kind, s: h.spot, m: G.seek.SPOTS.find(s => s.id === h.spot).map })));
    check('seek: animals hide in the mountain\'s places', L.length >= 2 && L.every(h => h.m === 'montana'), JSON.stringify(L));
    const h = await g.ev(() => { const h = G.seek.list()[0], sp = G.seek.SPOTS.find(s => s.id === h.spot), p = G.field.player; p.x = sp.at[0]; p.y = Math.min(30, sp.at[1] + 2); if (G.field.blocked(p.x, p.y, p)) p.x++; G.field.snapCam(); return h.spot; });
    await g.frames(200); await g.shot('seek_peek');
    const r = await g.ev(spot => { const x = G.seek.list().find(h => h.spot === spot); return G.seek.where(x, G.field); }, h);
    await g.tap(r.x + r.w / 2, r.y + 4);
    await g.ev(h => { window.__h = h; }, h);
    await drv(g, () => free() && G.seek.list().find(x => x.spot === window.__h).found, 'finding it');
    check('seek: found one peeking', await g.ev(spot => G.seek.list().find(h => h.spot === spot).found, h));
    // a page puzzle (the weather page, by the station)
    await g.ev(() => { for (const w of ['nieve', 'frio', 'nube', 'viento', 'lluvia']) { G.words.meet(w, 't'); G.state.words[w] = { learned: true }; } });
    const pg = await g.ev(() => Object.keys(G.maps.montana.pages).find(k => G.maps.montana.pages[k] === 'tiempo').split(',').map(Number));
    check('page: the weather page\'s sparkle is ready', await g.ev(() => G.pages.ready('tiempo')));
    await tapAt(g, pg[0], pg[1], pg[0], pg[1] + 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    await g.frames(10); await g.shot('page_tiempo');
    await drv(g, () => free(), 'the page puzzle');
    check('page: solved', await g.ev(() => !G.pages.ready('tiempo')));
    // save and load: the clothes, the weather, the sled, the chapters
    await g.ev(() => { G.abuelos.putOn(G.field, 'gorro', '#e04040'); G.abuelos.putOn(G.field, 'bufanda', '#3870d8'); G.montana.setWeather('lluvia'); const s = G.montana.state(); s.races = 3; G.state.quests.montana1 = 'done'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'montana', null, 'back on the mountain');
    const s = await g.ev(() => ({ r: G.montana.state().races, q: G.chapters.done('montana1'), w: G.words.met('marmota'), v: G.zones.visited('montana'), wx: G.montana.state().wx.k, head: G.field.player.spec.head, hc: G.field.player.spec.headColor, scarf: G.field.player.spec.scarf }));
    check('save: the gorro and the bufanda you wear, the weather, the races, chapters, words and visit are kept', s.r === 3 && s.q && s.w && s.v && s.wx === 'lluvia' && s.head === 'beanie' && s.hc === '#e04040' && s.scarf === '#3870d8', JSON.stringify(s));
    check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY; // (run one section: ONLY=side)
run('La montaña', [['walking in, every place, the bus, Lola, the refuge', walkIn], ['the animals and the album', animals], ['the story by taps', story], ['the cold and the weather', weather], ['side quests', side], ['the dog', dog], ['hide-and-seek, a page, save and load', seek]].filter(([n, f]) => !ONLY || f.name === ONLY));
