// El bosque (content/es/zone-bosque.js, docs/WORLD_PLAN.md): walking in from Villa Sol and the bus, every place
// reachable, the cave and the cabin, the forest's animals (a tap meets an unmet one through Lola's puzzle, the squirrel
// runs up a tree, the deer bounds away, the album page, the rare ones), the story by taps (the lost bear cub, the
// squirrel's acorns, Elena's binoculars), the side quests (Doña Lupe's blackberry pie with the basket, Elena's big or
// small mushrooms, Lola's leaves, fireflies at night), the dog's things to do (sniff the log, a trail of prints, swim
// for a stick), hide-and-seek in the forest, a page puzzle, save and load.
// NODE_PATH=$(npm root -g) node tools/test-zone-bosque.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

// a game already going (the opener done, "go explore"), wherever o.map says
const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked; // (free walking: used in the page-side conditions below)
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (!o.demo) G.demo.skip();
  if (o.visit !== false) { G.zones.visit('villa'); G.zones.visit('bosque'); }
  const y = new Date(G.now() - 864e5), ago = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate(); // (words she knows came on an earlier day: today's new words, the pacing's, count only today's)
  for (const w of o.words || []) { G.words.meet(w, 't'); Object.assign(G.words.rec(w), { mdate: ago, mdn: G.words.dayNum() - 1 }); }
  G.goto(o.map || 'bosque', o.x == null ? 18 : o.x, o.y == null ? 24 : o.y, 'down');
}, o);
const idle = (g, map = 'bosque') => g.fieldIdle(map);
async function drv(g, done, what, o) {
  try { await g.drive(done, what, o); } catch (e) {
    await g.shot('stuck');
    console.log('    (stuck: ' + await g.ev(() => JSON.stringify({ top: G.top().constructor.name, locked: G.field && G.field.locked, p: G.field && [G.field.player.x, G.field.player.y], held: G.carry.held(), route: G.field && G.field.route, why: (G.guide.goal(G.field) || {}).why })) + ')');
    throw e;
  }
}
async function tapNpc(g, id, dx = 1, dy = 0) {
  await g.ev(([id, dx, dy]) => { const n = G.field.npc(id), p = G.field.player; p.x = n.x + dx; p.y = n.y + dy; p.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down'; G.field.snapCam(); }, [id, dx, dy]);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
async function tapAt(g, x, y, sx, sy) {
  await g.ev(([x, y, sx, sy]) => { const p = G.field.player; p.x = sx == null ? x : sx; p.y = sy == null ? y - 1 : sy; G.field.snapCam(); }, [x, y, sx, sy]);
  await g.frames(4);
  await g.tapTile(x, y);
}

// ---------- walking in from Villa Sol, every place reachable, the cave and the cabin, the bus ----------
async function walkIn(browser) {
  const { ctx, g } = await open(browser, 'bosque-walk', true);
  try {
    await fresh(g, { visit: false, map: 'villa', x: 10, y: 2 });
    await idle(g, 'villa');
    await g.page.keyboard.down('ArrowUp'); await g.until(() => G.field.mapId === 'camino_bosque', null, 'the path to the forest'); await g.page.keyboard.up('ArrowUp');
    await g.fieldIdle('camino_bosque');
    await g.ev(() => { const p = G.field.player; p.x = 6; p.y = 2; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowUp'); await g.until(() => G.field.mapId === 'bosque', null, 'the forest'); await g.page.keyboard.up('ArrowUp');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await drv(g, () => G.top() === G.field && !G.field.locked && G.field.mapId === 'bosque', 'the new place card');
    check('walk: from Villa Sol along the path into the forest: "¡Nuevo lugar!", visited', await g.ev(() => G.zones.visited('bosque') && G.field.player.y >= 26));
    await g.frames(30); await g.shot('forest_arrival');
    const r = await g.ev(() => ({ kinds: [...new Set(G.animals.here().map(a => a.kind))], ppl: ['lola', 'nico', 'elena', 'lupe'].filter(id => G.field.npc(id)), why: (G.guide.goal(G.field) || {}).why || '' }));
    check('walk: the forest has its animals by day (squirrels, deer, a fox, a raccoon, hedgehogs; no owl, no fireflies)', ['ardilla', 'venado', 'zorro', 'mapache', 'erizo'].every(k => r.kinds.includes(k)) && !r.kinds.includes('buho') && !r.kinds.includes('luciernaga'), JSON.stringify(r.kinds));
    check('walk: its people are there (Lola, Nico, Elena, Doña Lupe)', r.ppl.length === 4, JSON.stringify(r.ppl));
    check('walk: the guide suggests something here (Lola first)', /lola/.test(r.why), r.why);
    const reach = await g.ev(() => {
      const f = G.field, key = (a, b) => a + ',' + b, q = [[18, 28]], vis = new Set([key(18, 28)]);
      for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || na < 0 || nb < 0 || na >= f.map.w || nb >= f.map.h) continue; const t = G.TERRAIN[f.map.get(na, nb)]; if (t.block || t.wall) continue; vis.add(key(na, nb)); q.push([na, nb]); } }
      const P = G.MAPDATA.bosque.pos, nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(t => vis.has(key(...t)));
      const need = { caveFront: P.caveFront, cub: P.cub, elena: P.elena, lupe: P.lupe, lola: P.lola, nico: P.nico, bus: P.busIn, rio: P.rio, rioFar: P.rioFar, rastro: P.rastro, sorter: P.sorter, stones: [31, 10] };
      const out = Object.keys(need).filter(k => !vis.has(key(...need[k])));
      G.bosque.BUSHES.forEach((b, i) => { if (!nb(b)) out.push('bush' + i); }); if (!nb(P.log)) out.push('log'); if (!nb(P.cabinDoor)) out.push('cabin');
      for (const s of G.carry.SOURCES.filter(s => s.map === 'bosque')) if (!vis.has(key(...s.at))) out.push(s.id);
      for (const s of G.seek.SPOTS.filter(s => s.map === 'bosque')) if (!nb(s.at)) out.push(s.id);
      return out;
    });
    check('walk: the cave, the cub, everyone, the dog\'s spots, the bushes, the log, the cabin, the stepping stones, things to pick up and hiding places are all reachable', !reach.length, reach.join(','));
    // the cave and the cabin open
    const cave = await g.ev(() => G.MAPDATA.bosque.pos.cave);
    await g.ev(c => { const p = G.field.player; p.x = c[0]; p.y = c[1] + 1; G.field.snapCam(); }, cave);
    await g.page.keyboard.down('ArrowUp'); await g.until(() => G.field.mapId === 'bosque_cueva', null, 'into the cave'); await g.page.keyboard.up('ArrowUp');
    await g.fieldIdle('bosque_cueva'); await g.frames(60); await g.shot('cave_inside');
    check('walk: the cave opens: inside, mama bear asleep and fireflies glowing', await g.ev(() => { const k = G.animals.here().map(a => a.kind); return k.includes('oso') && k.includes('luciernaga'); }));
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'bosque', null, 'out of the cave'); await g.page.keyboard.up('ArrowDown');
    await idle(g);
    const cab = await g.ev(() => G.MAPDATA.bosque.pos.cabinDoor);
    await g.ev(c => { const p = G.field.player; p.x = c[0]; p.y = c[1] + 1; G.field.snapCam(); }, cab);
    await g.page.keyboard.down('ArrowUp'); await g.until(() => G.field.mapId === 'bosque_cabana', null, 'into the cabin'); await g.page.keyboard.up('ArrowUp');
    await g.fieldIdle('bosque_cabana'); await g.frames(20); await g.shot('cabin_inside');
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'bosque', null, 'out of the cabin'); await g.page.keyboard.up('ArrowDown');
    await idle(g);
    check('walk: Doña Lupe\'s cabin opens too, and back out', await g.ev(() => G.field.player.y > G.MAPDATA.bosque.pos.cabinDoor[1] && G.field.player.y <= G.MAPDATA.bosque.pos.cabinDoor[1] + 2), await g.ev(() => JSON.stringify([G.field.player.x, G.field.player.y])));
    // the bus back to Villa Sol and back to the forest
    await g.ev(() => G.zones.visit('villa'));
    const b = await g.ev(() => G.zones.def('bosque').bus.at);
    await g.ev(b => { const p = G.field.player; p.x = b[0] + 1; p.y = b[1]; G.field.snapCam(); }, b);
    await g.tapTile(b[0], b[1]);
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(10);
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'villa')));
    await g.until(() => G.field.mapId === 'villa' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to Villa Sol', 30000);
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    await g.tapRect(await g.ev(() => G.top().rect('map')));
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map from the menu');
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'bosque')));
    await g.until(() => G.field.mapId === 'bosque' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to the forest', 30000);
    check('walk: the bus takes you to the forest\'s stop (and back)', await g.ev(() => { const e = G.zones.def('bosque').entry, p = G.field.player; return p.x === e.x && p.y === e.y; }));
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the animals: Lola names one you tap; moves; the album page; the rare ones; night ----------
async function animals(browser) {
  const { ctx, g } = await open(browser, 'bosque-animals', true);
  try {
    await fresh(g, { x: 30, y: 23 });
    await idle(g);
    await g.ev(() => { const a = G.animals.find('zorro'); a.x = 30 * 24 + 12; a.y = 25 * 24 + 18; a.st = 'idle'; a.t = 999; a.ground = [[30, 25]]; });
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('zorro'))));
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Lola naming the fox');
    await g.frames(10); await g.shot('lola_names_fox');
    await drv(g, () => free() && G.words.met('zorro'), 'Lola\'s puzzle');
    check('animals: tapping an unmet forest animal: Lola names it; el zorro is met and in the album', await g.ev(() => G.words.met('zorro') && G.animals.met('zorro')));
    // the squirrel runs up a tree when you come close; the deer bounds away
    const sq = await g.ev(() => { const a = G.animals.find('ardilla'), p = G.field.player; p.x = Math.floor(a.x / 24); p.y = Math.floor(a.y / 24); a.react = 0; for (let i = 0; i < 160; i++) G.frame++, G.animals.update(G.field); return { st: a.st, z: a.z, trees: (a.trees || []).length }; });
    check('animals: the squirrel races up a tree when you come close', (sq.st === 'up' || sq.st === 'climb') && sq.z > 10, JSON.stringify(sq));
    await g.frames(4); await g.ev(() => { G.field.snapCam(); }); await g.frames(2); await g.shot('squirrel_up');
    const dr = await g.ev(() => { const a = G.animals.find('venado'), p = G.field.player; p.x = Math.floor(a.x / 24) + 1; p.y = Math.floor(a.y / 24); const x0 = a.x, y0 = a.y; let jumped = false; for (let i = 0; i < 60; i++) { G.frame++; G.animals.update(G.field); if (a.z > 3) jumped = true; } return { st: a.st, jumped, moved: Math.hypot(a.x - x0, a.y - y0) }; });
    check('animals: the deer bounds away when you come close', dr.jumped && dr.moved > 20, JSON.stringify(dr));
    // the rare ones: the owl at night, the bear only in the cave; fireflies at night in the clearing
    const nightK = await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = () => true; G.field.zoo = null; const k = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; return k; });
    check('animals: at night an owl and fireflies come out', nightK.includes('buho') && nightK.filter(k => k === 'luciernaga').length >= 5, JSON.stringify(nightK));
    await g.ev(() => { G.debug.sunsetAt = 0; G.field.zoo = null; const p = G.field.player; p.x = 18; p.y = 18; G.field.snapCam(); });
    await g.frames(240); await g.shot('forest_night');
    await g.ev(() => { G.debug.sunsetAt = null; G.field.zoo = null; });
    check('album: the forest\'s page has its 8 animals, numbered after the beach\'s; rare and habitats marked', await g.ev(() => { const z = G.zones.def('bosque'); return z.animals.length === 8 && G.album.entries('bosque').length === 8 && z.rare.oso === 'cueva' && z.rare.buho === 'noche' && Object.values(z.habitat).every(G.iconDrawn) && G.album.number('ardilla') === G.album.zoneStart('bosque') + 1; }));
    await g.ev(() => G.album('bosque')); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(12); await g.shot('album_bosque');
    await g.ev(() => { G.pop(); });
    check('animals: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story, by taps ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'bosque-story', true);
  try {
    await fresh(g, { x: 20, y: 15 });
    await idle(g);
    check('story: Elena has the bear in her bubble (the forest\'s quest line)', await g.ev(() => G.chapters.next('bosque') === 'bosque1' && !G.chapters.gate('bosque1') && G.field.npc('elena').alert() && G.field.npc('elena').alert().icon === 'oso'));
    await tapNpc(g, 'elena', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.bosque1 === 1, 'Elena: el oso, pequeño');
    check('story 1: el oso and pequeño met; the guide points at the cub', await g.ev(() => G.words.met('oso') && G.words.met('pequeno') && /bosque1/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await g.shot('cub_crying');
    const cub = await g.ev(() => G.MAPDATA.bosque.pos.cub);
    await tapAt(g, cub[0], cub[1], cub[0] + 1, cub[1]);
    await drv(g, () => free() && G.chapters.state().step.bosque1 === 2, 'the cub, the prints, the dog');
    await g.frames(20); await g.shot('cub_follows');
    const cf = await g.ev(() => G.MAPDATA.bosque.pos.caveFront);
    await tapAt(g, cf[0], cf[1], cf[0], cf[1] + 1);
    await g.until(() => G.top().constructor.name !== 'Field', null, 'the cave');
    await g.until(() => G.chapters.ctx('bosque1').data.mama, null, 'mama bear', 30000).catch(() => {});
    await drv(g, () => G.chapters.ctx('bosque1').data.mama && G.frame - G.chapters.ctx('bosque1').data.mama > 40, 'la cueva');
    await g.shot('mama_bear');
    await drv(g, () => free() && G.chapters.done('bosque1'), 'grande, home');
    check('story 1 done: la cueva and grande met; the bear in the album; chapter 2 opens (Lupe\'s bubble)', await g.ev(() => G.chapters.done('bosque1') && G.words.met('cueva') && G.words.met('grande') && G.animals.met('oso') && G.chapters.next('bosque') === 'bosque2' && !!G.field.npc('lupe').alert()));
    // 2 · the squirrel's acorns
    await tapNpc(g, 'lupe', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.bosque2 === 1, 'Lupe: la ardilla, la bellota');
    check('story 2: la ardilla and la bellota met; the leaf piles are a choice for the guide', await g.ev(() => G.words.met('ardilla') && G.words.met('bellota') && !!G.guide.goal(G.field)));
    await g.frames(10); await g.shot('leaf_piles');
    for (let i = 0; i < 5; i++) {
      if (await g.ev(() => G.chapters.state().step.bosque2 !== 1)) break;
      const at = await g.ev(i => [[15, 17], [17, 21], [21, 17], [11, 16], [22, 21]][i], i);
      await tapAt(g, at[0], at[1], at[0], at[1] - 1);
      await g.ev(i => { window.__i = i; }, i);
      await g.until(() => (G.chapters.ctx('bosque2').data.done || {})[window.__i] || G.chapters.state().step.bosque2 !== 1, null, 'pile ' + i);
      await drv(g, () => free() || G.chapters.done('bosque2'), 'after pile ' + i);
    }
    await drv(g, () => free() && G.chapters.done('bosque2'), 'the squirrel happy');
    check('story 2 done: la hoja and el erizo met on the way; an acorn in your hands', await g.ev(() => G.chapters.done('bosque2') && G.words.met('hoja') && G.words.met('erizo') && G.carry.held() && G.carry.held().id === 'bellota'));
    // 3 · Elena's binoculars
    await tapNpc(g, 'elena', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.bosque3 === 1, 'Elena: her binoculars');
    const log = await g.ev(() => G.MAPDATA.bosque.pos.log);
    await tapAt(g, log[0], log[1], log[0] - 1, log[1]);
    await g.until(() => G.top().constructor.name !== 'Field', null, 'the log');
    await drv(g, () => free() && G.chapters.state().step.bosque3 === 2, 'el tronco, el mapache');
    check('story 3: el tronco, el mapache met; the binoculars in your hands', await g.ev(() => G.words.met('tronco') && G.words.met('mapache') && G.errands.bag.has('binoculares', { q: 'bosque3' })));
    await tapNpc(g, 'elena', 0, 1);
    await drv(g, () => G.top().constructor.name === 'Binoculars', 'looking through the binoculars');
    await g.frames(50); await g.shot('binoculars');
    await drv(g, () => free() && G.chapters.done('bosque3'), 'el venado, el zorro');
    check('story 3 done: el venado and el zorro met', await g.ev(() => G.chapters.done('bosque3') && G.words.met('venado') && G.words.met('zorro')));
    check('story: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- side quests: Lupe's pie, Elena's mushrooms, Lola's leaves, fireflies at night ----------
async function side(browser) {
  const { ctx, g } = await open(browser, 'bosque-side', true);
  try {
    await fresh(g, { x: 9, y: 18, demo: true });
    await g.ev(() => { const d = G.state.flags.demo || (G.state.flags.demo = {}); for (const k of G.demo.KINDS) d[k] = 1; });
    await idle(g);
    check('side: Doña Lupe has a pie in her bubble', await g.ev(() => { const a = G.field.npc('lupe').alert(); return a && a.icon === 'pay'; }), await g.ev(() => JSON.stringify(G.field.npc('lupe').alert())));
    // (her story chapter waits: start the pie first)
    await g.ev(() => { G.state.quests.bosque1 = 'done'; G.state.quests.bosque2 = 'done'; G.state.quests.bosque3 = 'done'; });
    await tapNpc(g, 'lupe', 0, 1);
    await drv(g, () => free() && !!G.errands.bag.list().find(it => it.id === 'canastamoras'), 'Lupe: la mora, the basket');
    check('side: la mora met; the basket in your hands; the guide points at a bush', await g.ev(() => G.words.met('mora') && /pick blackberries/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await g.until(() => G.demo.shown('pickberry'), null, 'the ghost hand at a bush', 30000);
    await g.frames(10); await g.shot('demo_pickberry');
    for (let k = 0; k < 4; k++) {
      const b = await g.ev(() => G.bosque.BUSHES.find((b, i) => !G.bosque.pie().got[i]));
      const side = await g.ev(b => [[b[0] + 1, b[1]], [b[0] - 1, b[1]], [b[0], b[1] + 1], [b[0], b[1] - 1]].find(([x, y]) => !G.field.blocked(x, y, G.field.player)), b);
      await tapAt(g, b[0], b[1], side[0], side[1]);
      await g.ev(k => { window.__k = k; }, k);
      await drv(g, () => free() && G.bosque.pie().n === window.__k + 1, 'picking bush ' + k);
    }
    await tapNpc(g, 'lupe', 0, 1);
    await drv(g, () => free() && G.bosque.pie().baked, 'the pie');
    await g.frames(10); await g.shot('pie');
    check('side: four bushes, then the pie, in your hands', await g.ev(() => G.bosque.pie().baked && G.carry.held() && G.carry.held().id === 'pay' && !G.errands.bag.has('canastamoras')));
    // the dog eats the pie
    await g.ev(() => { const n = G.pet.npc(G.field), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.home = [n.x, n.y]; });
    await g.frames(4);
    await g.tapTile(...await g.ev(() => { const n = G.pet.npc(G.field); return [n.x, n.y]; }));
    await g.until(() => !G.carry.held(), null, 'the dog eating the pie', 30000);
    await drv(g, () => free(), 'pie eaten');
    // Elena's big or small mushrooms
    check('side: after chapter 1, Elena has a mushroom game', await g.ev(() => { const a = G.field.npc('elena').alert(); return a && a.icon === 'hongo'; }));
    await tapNpc(g, 'elena', 0, 1);
    await drv(g, () => free() && G.bosque.sort().on, 'Elena: el hongo');
    await g.frames(10); await g.shot('mushrooms');
    check('side: el hongo met; the mushrooms are a choice for the guide', await g.ev(() => { const gl = G.guide.goal(G.field); return G.words.met('hongo') && gl && gl.choice; }));
    const wrong = await g.ev(() => G.bosque.SHROOMS.findIndex(m => !m.big)), wat = await g.ev(k => G.bosque.SHROOMS[k].at, wrong);
    await tapAt(g, wat[0], wat[1], wat[0], wat[1] - 1);
    await drv(g, () => free(), 'a small one when a big one was asked');
    check('side: the wrong size: "¡No!", the game goes on', await g.ev(() => G.bosque.sort().round === 0));
    for (let r = 0; r < 4; r++) {
      const at = await g.ev(() => { const s = G.bosque.sort(), want = [true, false, false, true][s.round]; return G.bosque.SHROOMS.find((m, i) => m.big === want && !s.gone[i]).at; });
      await tapAt(g, at[0], at[1], at[0], at[1] - 1);
      await g.ev(r => { window.__r = r; }, r);
      await drv(g, () => free() && (G.bosque.sort().round > window.__r || G.bosque.sort().done), 'mushroom round ' + r);
    }
    check('side: four rounds of big and small: done for today', await g.ev(() => G.bosque.sort().done && G.bosque.state().sorted === 1));
    // Lola's leaves
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.zones.lolaTalked('bosque'), 'Lola: el bosque, her leaves');
    check('side: Lola meets el bosque and asks for leaves; the guide points at one', await g.ev(() => G.words.met('elbosque') && /leaf for Lola/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    const lf = await g.ev(() => G.carry.SOURCES.find(s => s.id === 'hoja_rojo').at);
    await tapAt(g, lf[0], lf[1], lf[0] + 1, lf[1]);
    await g.until(() => G.carry.held() && G.carry.held().id === 'hoja', null, 'the red leaf in your hands');
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.bosque.leavesHave().length === 1, 'the leaf for Lola');
    await g.ev(() => { G.bosque.state().leaves.verde = 1; G.errands.bag.add('hoja', { col: 'amarillo' }); });
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.bosque.leavesDone(), 'all three leaves');
    check('side: all three colours of leaves: ¡Todas!', await g.ev(() => G.bosque.leavesDone()));
    // fireflies at night: Lola's jar
    await g.ev(() => { G.debug.sunsetAt = 0; G.field.zoo = null; G.animals.here(); });
    await g.frames(4);
    check('side: at night Lola has a jar for the fireflies', await g.ev(() => { const a = G.field.npc('lola').alert(); return a && a.icon === 'frasco'; }));
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.bosque.jar().on, 'Lola: la luciérnaga, the jar');
    for (let k = 0; k < 5; k++) {
      await g.ev(() => { const a = G.animals.find('luciernaga'), p = G.field.player; a.x = (p.x + 2) * 24 + 12; a.y = p.y * 24 + 18; a.st = 'idle'; a.t = 999; a.ground = [[p.x + 2, p.y]]; });
      await g.frames(2);
      await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('luciernaga'))));
      await g.ev(k => { window.__k = k; }, k);
      await g.until(() => G.bosque.jar().n > window.__k, null, 'firefly ' + k);
      await drv(g, () => free(), 'after firefly ' + k);
    }
    await g.frames(10); await g.shot('jar');
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.bosque.jar().done, 'letting them go');
    check('side: five fireflies in the jar, counted, let go', await g.ev(() => G.bosque.jar().done && G.words.met('luciernaga')));
    await g.ev(() => { G.debug.sunsetAt = null; });
    check('side: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog: sniff the log, follow a trail, swim for a stick ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'bosque-dog', true);
  try {
    await fresh(g, { x: 28, y: 20 });
    await idle(g);
    const spot = async (id, dx = 1, dy = -1) => { const sp = await g.ev(id => G.field.def.dogSpots.find(s => s.id === id).at, id); await tapAt(g, sp[0], sp[1], sp[0] + dx, sp[1] + dy); await g.until(id => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === id)), id, 'the dog at ' + id, 40000); await g.until(() => free(), null, 'done'); };
    await spot('bosque_tronco', -1, 0);
    check('dog: he sniffs the hollow log and finds a stick', await g.ev(() => G.carry.state().ground.some(it => it.map === 'bosque' && it.id === 'palo')));
    await spot('bosque_rastro', 0, 1);
    check('dog: he follows the trail of prints and finds an acorn at its end', await g.ev(() => G.carry.state().ground.some(it => it.map === 'bosque' && it.id === 'bellota')));
    const rio = await g.ev(() => G.field.def.dogSpots.find(s => s.id === 'bosque_rio').at);
    await tapAt(g, rio[0], rio[1], rio[0] + 1, rio[1]);
    await g.until(() => !!G.zones.stick, null, 'the stick flying over the river', 30000);
    await g.frames(4); await g.shot('stick_over_river');
    await g.until(() => G.pet.npc(G.field).y < G.MAPDATA.bosque.pos.rio[1] - 1, null, 'the dog swimming across', 30000);
    await g.frames(4); await g.shot('dog_swims');
    await g.until(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'bosque_rio')) && free(), null, 'back with the stick', 40000);
    check('dog: he swims across the river for the stick and brings it back', await g.ev(() => { const r = G.MAPDATA.bosque.pos.rio; return G.carry.state().ground.some(it => it.map === 'bosque' && it.id === 'palo' && it.x === r[0] && it.y === r[1]); }));
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hide-and-seek in the forest; a page puzzle; save and load ----------
async function seek(browser) {
  const { ctx, g } = await open(browser, 'bosque-seek', true);
  try {
    await fresh(g, { x: 24, y: 22, words: ['ardilla', 'zorro', 'mapache', 'erizo', 'venado'] });
    await idle(g);
    check('seek: Nico has a game in the forest', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await tapNpc(g, 'nico', 1, 0);
    await drv(g, () => free() && G.seek.active(), 'Nico');
    const L = await g.ev(() => G.seek.list().map(h => ({ k: h.kind, s: h.spot, m: G.seek.SPOTS.find(s => s.id === h.spot).map })));
    check('seek: forest animals hide in the forest\'s places', L.length >= 2 && L.every(h => h.m === 'bosque'), JSON.stringify(L));
    const h = await g.ev(() => { const h = G.seek.list()[0], sp = G.seek.SPOTS.find(s => s.id === h.spot), p = G.field.player; p.x = sp.at[0]; p.y = Math.min(27, sp.at[1] + 2); if (G.field.blocked(p.x, p.y, p)) p.x++; G.field.snapCam(); return h.spot; });
    await g.frames(200); await g.shot('seek_peek');
    const r = await g.ev(spot => { const x = G.seek.list().find(h => h.spot === spot); return G.seek.where(x, G.field); }, h);
    await g.tap(r.x + r.w / 2, r.y + 4);
    await g.ev(h => { window.__h = h; }, h);
    await drv(g, () => free() && G.seek.list().find(x => x.spot === window.__h).found, 'finding it');
    check('seek: found one peeking', await g.ev(spot => G.seek.list().find(h => h.spot === spot).found, h));
    // a page puzzle in the forest (four known words of the animals page)
    await g.ev(() => { for (const w of ['ardilla', 'zorro', 'mapache', 'erizo', 'venado']) G.state.words[w] = { learned: true }; });
    const pg = await g.ev(() => Object.keys(G.maps.bosque.pages).find(k => G.maps.bosque.pages[k] === 'fauna').split(',').map(Number));
    check('page: the forest animals page\'s sparkle is ready', await g.ev(() => G.pages.ready('fauna')));
    await tapAt(g, pg[0], pg[1], pg[0], pg[1] + 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    await drv(g, () => free(), 'the page puzzle');
    check('page: the forest\'s page puzzle is solved', await g.ev(() => !G.pages.ready('fauna')));
    // save and load
    await g.ev(() => { const s = G.bosque.state(); s.leaves.rojo = 1; s.pies = 2; G.state.quests.bosque1 = 'done'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'bosque', null, 'back in the forest');
    const s = await g.ev(() => ({ l: G.bosque.leavesHave(), p: G.bosque.state().pies, q: G.chapters.done('bosque1'), w: G.words.met('ardilla'), v: G.zones.visited('bosque') }));
    check('save: the forest\'s leaves, pies, chapters, words and visit are all kept', s.l.join() === 'rojo' && s.p === 2 && s.q && s.w && s.v, JSON.stringify(s));
    check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY; // (run one section: ONLY=side)
run('El bosque', [['walking in, every place, the cave, the cabin, the bus', walkIn], ['the animals and the album', animals], ['the story by taps', story], ['side quests', side], ['the dog', dog], ['hide-and-seek, a page, save and load', seek]].filter(([n, f]) => !ONLY || f.name === ONLY));
