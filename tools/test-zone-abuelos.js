// La casa de los abuelos (content/es/zone-abuelos.js, docs/WORLD_PLAN.md): walking in from Villa Sol, every place
// reachable outside and in the cottage, the bus, Lola (la vaca), going in through the front door; the animals (a tap
// meets an unmet one through Lola's puzzle, the rare rooster and possum, the album page, every new word's picture);
// the story by taps (¡A vestirse!, ¡A lavarse!, ¡La foto de la familia!); the clothes you wear (the trunk, the
// mirror, worn on every map, kept in the save), the body (tap yourself: "¿Qué toco?", Simón dice), Abuelo's jacket
// at night; the side quests (Abuela's cookies, Abuelo's garden: la zanahoria, el elote, el jitomate met one a day in
// it, picked, counted and given; the vegetables by the beds to carry to Abuela; his listen-and-do board); the dog (dig:
// the carrot is the word, the sock, the turkeys); hide-and-seek, page puzzles (La huerta's three), save and load.
// NODE_PATH=$(npm root -g) node tools/test-zone-abuelos.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked;
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (!o.demo) G.demo.skip();
  if (o.visit !== false) { G.zones.visit('villa'); G.zones.visit('abuelos'); }
  for (const w of o.words || []) G.words.meet(w, 't');
  for (const q of o.done || []) G.state.quests[q] = 'done';
  G.goto(o.map || 'abuelos', o.x == null ? 19 : o.x, o.y == null ? 12 : o.y, 'down');
}, o);
const idle = (g, map = 'abuelos') => g.fieldIdle(map);
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
  await g.ev(([x, y, sx, sy]) => { const p = G.field.player; p.x = sx == null ? x : sx; p.y = sy == null ? y - 1 : sy; G.field.snapCam(); }, [x, y, sx, sy]);
  await g.frames(4);
  await g.tapTile(x, y);
}
const goto = async (g, map, x, y) => { await g.ev(([m, x, y]) => G.goto(m, x, y, 'down'), [map, x, y]); await idle(g, map); };
const step = id => `free() && G.chapters.state().step.${id}`;

// ---------- walking in from Villa Sol, every place reachable, the bus, Lola, the front door ----------
async function walkIn(browser) {
  const { ctx, g } = await open(browser, 'abuelos-walk', true);
  try {
    await fresh(g, { visit: false, map: 'villa', x: 5, y: 26 });
    await idle(g, 'villa');
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'camino_abuelos', null, 'the path'); await g.page.keyboard.up('ArrowDown');
    await g.fieldIdle('camino_abuelos');
    await g.ev(() => { const p = G.field.player; p.x = 6; p.y = 22; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'abuelos', null, 'the grandparents\''); await g.page.keyboard.up('ArrowDown');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await drv(g, () => G.top() === G.field && !G.field.locked && G.field.mapId === 'abuelos', 'the new place card');
    check('walk: from Villa Sol along the path to the grandparents\': "¡Nuevo lugar!", visited', await g.ev(() => G.zones.visited('abuelos') && G.field.player.y <= 3));
    await g.frames(30); await g.shot('arrival');
    const r = await g.ev(() => ({ kinds: [...new Set(G.animals.here().map(a => a.kind))], ppl: ['lola', 'nico', 'abuelo'].filter(id => G.field.npc(id)), aOut: !!G.field.npc('abuela') }));
    check('walk: the farm animals are out by day (cows, a donkey, sheep, pigs, turkeys, hens; no possum)', ['vaca', 'burro', 'oveja', 'cerdo', 'pavo', 'gallina'].every(k => r.kinds.includes(k)) && !r.kinds.includes('tlacuache'), JSON.stringify(r.kinds));
    check('walk: Lola, Nico and Abuelo are outside (Abuela is in her kitchen)', r.ppl.length === 3 && !r.aOut, JSON.stringify(r));
    const reach = await g.ev(() => {
      const bfs = (f, s) => { const key = (a, b) => a + ',' + b, q = [s], vis = new Set([key(...s)]); for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || na < 0 || nb < 0 || na >= f.w || nb >= f.h) continue; const t = G.TERRAIN[f.get(na, nb)]; if (t.block || t.wall) continue; vis.add(key(na, nb)); q.push([na, nb]); } } return vis; };
      const map = id => { const rows = G.MAPDATA[id].rows; return { w: rows[0].length, h: rows.length, get: (x, y) => rows[y] && rows[y][x] }; };
      const out = [], O = bfs(map('abuelos'), G.MAPDATA.abuelos.pos.in), I = bfs(map('abuelos_casa'), G.MAPDATA.abuelos_casa.pos.door);
      const nb = (V, [x, y]) => [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(t => V.has(t.join(',')));
      const P = G.MAPDATA.abuelos.pos, Q = G.MAPDATA.abuelos_casa.pos;
      for (const [k, at] of Object.entries({ lola: P.lola, nico: P.nico, abuelo: P.abuelo, abuela: P.abuela, bus: P.busIn, door: P.porch, pump: P.pump, swing: P.swing, dog: P.dog, sock: P.sock, pavos: P.pavosDog, line: [19, 16], baby: [19, 21], sockAt: [21, 19] })) if (!nb(O, at)) out.push(k);
      for (const [k, at] of Object.entries({ abuelaIn: Q.abuela, bebe: Q.bebe, trunk: Q.trunk, wardrobe: Q.wardrobe })) if (!nb(I, at)) out.push(k);
      for (const s of G.abuelos.SIDE) if (!nb(s.map === 'abuelos' ? O : I, s.at)) out.push(s.id);
      for (const s of G.carry.SOURCES.filter(s => s.map === 'abuelos')) if (!O.has(s.at.join(','))) out.push(s.id);
      for (const s of G.seek.SPOTS.filter(s => s.map === 'abuelos')) if (!nb(O, s.at)) out.push(s.id);
      for (const k in G.maps.abuelos.pages) if (!O.has(k)) out.push('page ' + k);
      for (const k in G.maps.abuelos_casa.pages) if (!I.has(k)) out.push('page in ' + k);
      return out;
    });
    check('walk: everyone, the cottage door, the trunk, the pump, the line, the swing, the dog\'s spots, things, hiding places and pages are all reachable', !reach.length, reach.join(','));
    // the bus back to Villa Sol and back
    await g.ev(() => G.zones.visit('villa'));
    const b = await g.ev(() => G.zones.def('abuelos').bus.at);
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
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'abuelos')));
    await g.until(() => G.field.mapId === 'abuelos' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus back', 30000);
    check('walk: the bus takes you to the grandparents\' stop (and back)', await g.ev(() => { const e = G.zones.def('abuelos').entry, p = G.field.player; return p.x === e.x && p.y === e.y; }));
    // Lola: the dog's spot, la vaca, the cottage
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.zones.lolaTalked('abuelos'), 'Lola');
    check('walk: Lola says hello and meets la vaca (the cow over the fence)', await g.ev(() => G.words.met('vaca') && G.animals.met('vaca')));
    // in through the front door
    const d = await g.ev(() => G.MAPDATA.abuelos.pos.door);
    await g.ev(d => { const p = G.field.player; p.x = d[0]; p.y = d[1] + 2; G.field.snapCam(); }, d);
    await g.tapTile(d[0], d[1]);
    await g.until(() => G.field.mapId === 'abuelos_casa', null, 'inside the cottage', 30000);
    await idle(g, 'abuelos_casa');
    check('walk: the front door opens: inside the cottage (Abuela in the kitchen, the baby on the rug, a mouse)', await g.ev(() => !!G.field.npc('abuela') && !!G.field.npc('bebe') && G.animals.here().some(a => a.kind === 'raton')));
    await g.frames(20); await g.shot('inside');
    await g.ev(() => { const p = G.field.player; p.x = 4; p.y = 5; G.field.snapCam(); }); await g.frames(10); await g.shot('living_room');
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the animals: Lola names one; the rare ones; the album page; every word's picture ----------
async function animals(browser) {
  const { ctx, g } = await open(browser, 'abuelos-animals', true);
  try {
    await fresh(g, { x: 26, y: 23 });
    await idle(g);
    await g.ev(() => { const a = G.animals.find('oveja'); a.x = 27 * 24 + 12; a.y = 24 * 24 + 18; a.st = 'idle'; a.t = 999; });
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('oveja'))));
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Lola naming the sheep');
    await g.frames(10); await g.shot('lola_names_sheep');
    await drv(g, () => free() && G.words.met('oveja'), 'Lola\'s puzzle');
    check('animals: tapping an unmet animal: Lola names it; la oveja is met and in the album', await g.ev(() => G.words.met('oveja') && G.animals.met('oveja')));
    await g.ev(() => { const p = G.field.player; p.x = 34; p.y = 21; G.field.snapCam(); }); await g.frames(20); await g.shot('pigs');
    const kinds = await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = () => true; G.field.zoo = null; const k = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; return k; });
    check('animals: at dawn a rooster by the henhouse; at night a possum and fireflies in the orchard', kinds.includes('gallo') && kinds.includes('tlacuache') && kinds.includes('luciernaga'), JSON.stringify(kinds));
    const dead = await g.ev(() => { G.words.meet('tlacuache', 't'); const a = G.animals.find('tlacuache'), f = G.field; G.animals.tapped(f, a); return a.react > 0; });
    await g.until(() => free(), null, 'the possum named');
    check('animals: the possum plays dead when tapped (its react frame)', dead);
    await g.ev(() => { G.debug.sunsetAt = 0; G.field.zoo = null; const p = G.field.player; p.x = 19; p.y = 11; G.field.snapCam(); });
    await g.frames(240); await g.shot('night');
    await g.ev(() => { const p = G.field.player; p.x = 12; p.y = 5; G.field.snapCam(); }); await g.frames(20); await g.shot('night_orchard');
    await g.ev(() => { G.debug.sunsetAt = null; G.field.zoo = null; });
    check('album: the page has its 8 animals, numbered after the park\'s; rare ones and habitats marked', await g.ev(() => { const z = G.zones.def('abuelos'); return z.animals.length === 8 && G.album.entries('abuelos').length === 8 && z.rare.gallo === 'manana' && z.rare.tlacuache === 'noche' && Object.values(z.habitat).every(G.iconDrawn) && G.album.number('vaca') === G.album.zoneStart('abuelos') + 1 && G.album.zoneStart('abuelos') > G.album.zoneStart('juegos'); }));
    const ws = await g.ev(() => Object.keys(G.data.words).filter(k => ['familia', 'cuerpo', 'ropa', 'rancho'].includes(G.data.words[k].topic)));
    check('words: 25 new words, every one with its own picture (4 notebook pages)', ws.length === 25 && await g.ev(ws => ws.every(G.iconDrawn) && ['familia', 'cuerpo', 'ropa', 'rancho'].every(p => G.data.pages[p]), ws), ws.join(','));
    check('words: La huerta: la zanahoria, el elote, el jitomate (plurals for listen-and-do; the page placed by the garden beds)', await g.ev(() => { const W = G.data.words, R = G.requests; return G.data.pages.huerta.words.join() === 'zanahoria,elote,jitomate' && ['zanahoria', 'elote', 'jitomate'].every(G.iconDrawn) && R.noun('zanahoria').g === 'f' && R.noun('zanahoria').pl === 'zanahorias' && R.noun('elote').g === 'm' && R.noun('elote').pl === 'elotes' && R.noun('jitomate').pl === 'jitomates' && Object.values(G.maps.abuelos.pages).includes('huerta') && W.zanahoria.icon === 'zanahoria'; }));
    // a sheet of every new picture, big (render check)
    await g.ev(ws => {
      const extra = ['camara', 'foto', 'espejo', 'zanahoria', 'elote', 'jitomate', { icon: 'elote', col: G.data.words.blanco.col }, { icon: 'jitomate', col: G.data.words.verde.col }, 'canastaverduras', 'galletas', { icon: 'camisa', col: '#3870d8' }, { icon: 'vestido', col: '#f8c830' }, { icon: 'sombrero', col: '#e04040' }];
      const L = ws.concat(extra), cv = document.createElement('canvas'), s = 4, cols = 9; cv.width = cols * 18 * s; cv.height = Math.ceil(L.length / cols) * 18 * s;
      const c = cv.getContext('2d'); c.fillStyle = '#f4ecd8'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
      L.forEach((w, i) => c.drawImage(G.icon(w), (i % cols) * 18 * s + s, Math.floor(i / cols) * 18 * s + s, 16 * s, 16 * s));
      Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', zIndex: 99, width: cv.width / 2 + 'px' }); cv.id = 'sheet'; document.body.appendChild(cv);
    }, ws);
    await g.shot('icons'); await g.ev(() => document.getElementById('sheet').remove());
    await g.ev(() => G.album('abuelos')); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(12); await g.shot('album_abuelos');
    await g.ev(() => { G.pop(); });
    check('animals: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story, by taps ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'abuelos-story', true);
  try {
    await fresh(g, { map: 'abuelos_casa', x: 11, y: 5 });
    await idle(g, 'abuelos_casa');
    check('story: Abuela has the chapter in her bubble (the zone\'s quest line)', await g.ev(() => G.chapters.next('abuelos') === 'abuelos1' && !G.chapters.gate('abuelos1') && !!G.field.npc('abuela').alert()));
    // 1 · ¡A vestirse!
    await tapNpc(g, 'abuela', 1, 0);
    await drv(g, () => free() && G.chapters.state().step.abuelos1 === 1, 'Abuela: la abuela');
    check('story 1: la abuela met; the guide points outside to the clothesline', await g.ev(() => G.words.met('abuela') && /abuelos1/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await goto(g, 'abuelos', 19, 14);
    await g.frames(10); await g.shot('clothesline');
    await tapAt(g, 19, 16, 19, 15);
    await drv(g, () => free() && G.chapters.state().step.abuelos1 === 2, 'the clothesline');
    check('story 1: la camisa, el pantalón, el vestido met; you wear the shirt and the trousers (your pick); the dog ran off with the socks', await g.ev(() => ['camisa', 'pantalon', 'vestido'].every(G.words.met) && G.abuelos.wear().camisa && G.abuelos.wear().pantalon && G.field.player.spec.outfit === G.abuelos.wear().camisa));
    await g.frames(10); await g.shot('dog_has_socks');
    await tapAt(g, 21, 19, 21, 18);
    await drv(g, () => free() && G.chapters.state().step.abuelos1 === 3, 'the tug of war');
    check('story 1: los calcetines met and on', await g.ev(() => G.words.met('calcetines') && G.abuelos.wear().calcetines));
    await goto(g, 'abuelos_casa', 15, 3);
    await tapAt(g, 14, 1, 14, 2);
    await drv(g, () => free() && G.chapters.done('abuelos1'), 'the mirror');
    check('story 1 done: the mirror; chapter 2 opens (Abuelo\'s bubble)', await g.ev(() => G.chapters.done('abuelos1') && G.chapters.next('abuelos') === 'abuelos2'));
    // 2 · ¡A lavarse!
    await goto(g, 'abuelos', 11, 15);
    check('story 2: Abuelo has it in his bubble', await g.ev(() => !!G.field.npc('abuelo').alert()));
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => !!G.abuelos.mud(), 'the dog in the mud');
    await g.frames(20); await g.shot('muddy');
    await drv(g, () => free() && G.chapters.state().step.abuelos2 === 1, 'Abuelo: el abuelo, el cerdo');
    check('story 2: el abuelo and el cerdo met; mud on your hands, feet and nose', await g.ev(() => G.words.met('abuelo') && G.words.met('cerdo') && G.abuelos.mud().mano && G.abuelos.mud().nariz));
    const pump = await g.ev(() => G.MAPDATA.abuelos.pos.pump);
    await tapAt(g, pump[0], pump[1], pump[0] + 1, pump[1]);
    await drv(g, () => G.field.player.ab && G.field.player.ab.wash, 'washing');
    await g.frames(16); await g.shot('washing');
    await drv(g, () => free() && G.chapters.done('abuelos2'), 'wash: mano, pie, nariz');
    check('story 2 done: la mano, el pie, la nariz met (washed); clean', await g.ev(() => ['mano', 'pie', 'nariz'].every(G.words.met) && G.chapters.done('abuelos2') && !G.abuelos.mud()));
    // 3 · ¡La foto de la familia!
    await goto(g, 'abuelos_casa', 11, 5);
    await tapNpc(g, 'abuela', 1, 0);
    await drv(g, () => free() && G.chapters.state().step.abuelos3 === 1, 'Abuela: la familia');
    const tr = await g.ev(() => G.MAPDATA.abuelos_casa.pos.trunk);
    await tapAt(g, tr[0], tr[1], tr[0], tr[1] - 1);
    await drv(g, () => free() && G.chapters.state().step.abuelos3 === 2, 'the trunk: zapatos, sombrero; the baby is gone');
    check('story 3: la familia, los zapatos, el sombrero, el bebé met; shoes and a hat on (the hat shows on your character); the baby is gone', await g.ev(() => ['familia', 'zapatos', 'sombrero', 'bebe'].every(G.words.met) && G.field.player.spec.head === 'hat' && G.field.npc('bebe').hidden));
    await goto(g, 'abuelos', 19, 18);
    await g.frames(10); await g.shot('baby_trail');
    await tapAt(g, 19, 21, 19, 20);
    await drv(g, () => free() && G.chapters.state().step.abuelos3 === 3, 'the baby by the ducks');
    await g.ev(() => { const p = G.field.player; p.x = 19; p.y = 14; G.field.snapCam(); }); await g.frames(40); await g.shot('baby_follows');
    check('story 3: Abuela waits on the porch', await g.ev(() => !!G.field.npc('abuela')));
    await tapAt(g, 19, 11, 19, 12);
    await drv(g, () => G.top().constructor.name === 'FamilyPhoto' && G.top().t > 60, 'the photo');
    await g.shot('family_photo');
    await drv(g, () => free() && G.chapters.done('abuelos3'), 'the family photo');
    check('story 3 done: the family photo', await g.ev(() => G.chapters.done('abuelos3')));
    await goto(g, 'abuelos_casa', 4, 3);
    check('story 3: the photo hangs on the wall; the baby is back on the rug; Abuela has the photo wall in her bubble', await g.ev(() => !!G.field.npc('bebe') && !G.field.npc('bebe').hidden && G.field.npc('abuela').alert() && G.field.npc('abuela').alert().icon === 'galletas'));
    await g.frames(10); await g.shot('photo_wall');
    check('story: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- clothes and the body: the trunk, tap yourself, Simón dice, the jacket at night; worn everywhere ----------
async function dress(browser) {
  const { ctx, g } = await open(browser, 'abuelos-dress', true);
  try {
    await fresh(g, { map: 'abuelos_casa', x: 17, y: 5, words: ['camisa', 'pantalon', 'vestido', 'calcetines', 'mano', 'pie', 'nariz', 'abuelo'], done: ['abuelos1', 'abuelos2'] });
    await idle(g, 'abuelos_casa');
    check('dress: after chapter 1 the trunk has a bubble (a fashion show today) and the guide shows it', await g.ev(() => /trunk/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    const tr = await g.ev(() => G.MAPDATA.abuelos_casa.pos.trunk);
    await tapAt(g, tr[0], tr[1], tr[0], tr[1] - 1);
    await g.until(() => G.top().constructor.name === 'Choice', null, '"¿Qué te pones?"');
    await g.frames(10); await g.shot('que_te_pones');
    check('dress: "¿Qué te pones?" offers the clothes you know, in colour (mic on)', await g.ev(() => { const s = G.top(); return s.ch.length === 4 && s.ch.every(c => c.img && c.img.col) && s.o.mic; }));
    await drv(g, () => G.top().constructor.name === 'Mirror', 'dressing up');
    await g.frames(40); await g.shot('mirror');
    await drv(g, () => free() && G.abuelos.state().show.done, 'the fashion show');
    check('dress: you wear it (the sprite changes) and the family claps: a fashion show today', await g.ev(() => G.abuelos.state().shows === 1 && G.field.player.spec.outfit === G.abuelos.wear().camisa));
    // worn on every map
    await goto(g, 'villa', 5, 20);
    check('dress: the clothes stay on in Villa Sol too (a cosmetic)', await g.ev(() => G.field.player.spec.outfit === G.abuelos.wear().camisa && G.st.playerSpec().portrait.outfit === G.abuelos.wear().camisa));
    await g.frames(10); await g.shot('dressed_in_town');
    // tap yourself: "¿Qué toco?"
    await goto(g, 'abuelos', 19, 12);
    await g.ev(() => { const d = G.pet.npc(G.field); if (d) { d.x = 23; d.y = 12; } });
    await g.frames(4); await g.tapTile(19, 12);
    await g.until(() => G.top().constructor.name === 'Choice', null, '"¿Qué toco?"');
    check('body: tapping yourself here asks "¿Qué toco?" with body words', await g.ev(() => G.top().ch.every(c => ['mano', 'pie', 'nariz'].includes(c.word))));
    const k = await g.ev(() => G.top().ch.findIndex(c => c.word === 'nariz'));
    await g.tapRect(await g.ev(k => G.top().rects()[k], k));
    await g.until(() => G.field.player.ab && G.field.player.ab.k === 'nariz' && G.frame - G.field.player.ab.f0 > 14, null, 'touching your nose');
    await g.shot('toca_nariz');
    await g.until(() => free(), null, 'done');
    // Simón dice with Abuelo (after the garden: do it first)
    await g.ev(() => { G.abuelos.state().garden.d = G.words.day(); G.abuelos.state().garden.done = true; });
    check('body: Abuelo has Simón dice in his bubble', await g.ev(() => { const a = G.field.npc('abuelo').alert(); return a && a.icon === 'cabeza'; }));
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => { const n = G.field.npc('abuelo'); return n.ab && G.frame - n.ab.f0 > 14; }, 'Abuelo shows');
    await g.shot('abuelo_shows');
    await drv(g, () => free() && G.abuelos.state().simon.done, 'Simón dice');
    check('body: Simón dice: los ojos, la boca, la cabeza met; then you were Simón', await g.ev(() => ['ojos', 'boca', 'cabeza'].every(G.words.met) && G.abuelos.state().simons === 1));
    // the jacket at night
    await g.ev(() => { G.debug.sunsetAt = 0; });
    await g.until(() => G.day.over(), null, 'night');
    check('night: Abuelo has his jacket in his bubble', await g.ev(() => { const a = G.field.npc('abuelo').alert(); return a && a.icon === 'chamarra'; }));
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => free() && G.words.met('chamarra'), 'the jacket');
    check('night: la chamarra met and on (green, over your shirt)', await g.ev(() => G.abuelos.wear().chamarra && G.field.player.spec.outfit === G.abuelos.wear().chamarra));
    await g.frames(20); await g.shot('jacket_night');
    await g.ev(() => { G.debug.sunsetAt = null; });
    check('dress: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- side quests: Abuela's cookies, Abuelo's garden ----------
async function side(browser) {
  const { ctx, g } = await open(browser, 'abuelos-side', true);
  try {
    await fresh(g, { map: 'abuelos_casa', x: 11, y: 5, words: ['abuela', 'camisa', 'mano', 'pie', 'tres', 'cuatro', 'abuelo'], done: ['abuelos1', 'abuelos2', 'abuelos3'] });
    await idle(g, 'abuelos_casa');
    check('side: Abuela has cookies in her bubble', await g.ev(() => { const a = G.field.npc('abuela').alert(); return a && a.icon === 'galletas'; }));
    await tapNpc(g, 'abuela', 1, 0);
    await drv(g, () => free() && G.abuelos.state().cookies.on, 'Abuela: cookies');
    check('side: the guide sends you out for the eggs', await g.ev(() => /eggs/.test((G.guide.goal(G.field) || {}).why || '')));
    await goto(g, 'abuelos', 6, 12);
    await g.frames(10); await g.shot('eggs');
    for (const [x, y] of await g.ev(() => G.abuelos.EGGS)) { await tapAt(g, x, y, x + 1 === 9 ? x - 1 : x + 1, y); await drv(g, () => free(), 'an egg'); }
    check('side: three eggs picked in the hens\' run', await g.ev(() => G.abuelos.state().cookies.n === 3));
    await goto(g, 'abuelos_casa', 11, 5);
    await tapNpc(g, 'abuela', 1, 0);
    await drv(g, () => free() && G.abuelos.state().cookies.baked, 'baking');
    check('side: tres, wash your hands, cookies baked: one in your hands', await g.ev(() => G.abuelos.state().cookiesN === 1 && G.carry.held() && G.carry.held().id === 'galleta'));
    await g.frames(10); await g.shot('cookies');
    await g.ev(() => G.errands.bag.take('galleta'));
    // Abuelo's garden
    await goto(g, 'abuelos', 11, 15);
    check('side: Abuelo has his basket in his bubble', await g.ev(() => { const a = G.field.npc('abuelo').alert(); return a && a.icon === 'canastaverduras'; }));
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => free() && !!G.errands.bag.has('canastaverduras', { q: 'huerto' }), 'the basket and la zanahoria');
    check('garden: la zanahoria met in Abuelo\'s garden (a one-unknown puzzle): today he wants four carrots', await g.ev(() => G.words.met('zanahoria') && G.abuelos.state().garden.v === 'zanahoria' && !G.words.met('elote')));
    const picks = async v => {
      const beds = await g.ev(v => G.abuelos.BEDS.filter(b => b[2] === v), v);
      check('garden: only the day\'s beds can be picked (' + v + ': ' + beds.length + ' beds; the guide points at one)', beds.length >= 4 && await g.ev(v => G.abuelos.SIDE.filter(s => /^bed/.test(s.id) && s.on()).length === G.abuelos.BEDS.filter(b => b[2] === v).length && (G.zones.task(G.field) || {}).pts[0].icon.icon === v, v));
      for (const [x, y] of beds.slice(0, 4)) { await tapAt(g, x, y, x, y === 14 ? 13 : y + 1); await drv(g, () => free(), 'a vegetable'); } // (from above the top row: Abuelo stands below it)
    };
    await picks('zanahoria');
    await g.shot('vegetables');
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => free() && G.abuelos.state().garden.done, 'the basket to Abuelo');
    check('side: four carrots picked and brought (¿Cuántas zanahorias?); a carrot for you', await g.ev(() => G.abuelos.state().gardens === 1 && G.carry.held() && G.carry.held().id === 'zanahoria'));
    check('garden: the carrot in your hands is the word (its name in the corner); the guide takes it to Abuela', await g.ev(() => G.carry.label('zanahoria') === 'la zanahoria' && (G.carry.plan(G.field) || {}).who === 'abuela'));
    // the next day: el elote (a new one each day until all three are met)
    await g.ev(() => { G.errands.bag.take('zanahoria'); G.abuelos.state().garden.d = -1; }); // (a new day for the garden)
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => free() && !!G.errands.bag.has('canastaverduras', { q: 'huerto' }), 'the basket and el elote');
    check('garden: the next day el elote is met there, and he wants four of them', await g.ev(() => G.words.met('elote') && G.abuelos.state().garden.v === 'elote' && !G.words.met('jitomate')));
    await picks('elote');
    await tapNpc(g, 'abuelo', 1, 0);
    await drv(g, () => free() && G.abuelos.state().garden.done, 'the corn to Abuelo');
    check('garden: four ears of corn; one for you', await g.ev(() => G.abuelos.state().gardens === 2 && G.carry.held() && G.carry.held().id === 'elote'));
    // give a vegetable to Abuela: for the soup
    await goto(g, 'abuelos_casa', 11, 5);
    const h0 = await g.ev(() => { Object.assign(G.abuelos.state().photos, { d: G.words.day(), done: true }); return G.hearts.get('abuela'); }); // (the photo wall done today: her talk is the corn)
    await tapNpc(g, 'abuela', 1, 0);
    await drv(g, () => free() && !G.carry.held(), 'the corn for Abuela');
    check('carry: Abuela takes the corn for her soup (a heart)', await g.ev(h0 => G.abuelos.state().vegs === 1 && G.hearts.get('abuela') > h0, h0));
    // the vegetables by the beds: carried once met, and they grow back
    await goto(g, 'abuelos', 3, 15);
    const src = await g.ev(() => G.carry.SOURCES.filter(s => s.map === 'abuelos' && G.abuelos.VEGS.includes(s.item)).map(s => ({ id: s.id, item: s.item, at: s.at, on: G.carry.avail(s.id) })));
    check('carry: a carrot and a corn by the garden beds (met); the tomato not yet', src.length === 3 && src.filter(s => s.on).map(s => s.item).sort().join() === 'elote,zanahoria', JSON.stringify(src));
    await g.frames(10); await g.shot('garden_things');
    const zs = src.find(s => s.item === 'zanahoria');
    await tapAt(g, zs.at[0], zs.at[1], zs.at[0] + 1, zs.at[1]);
    await g.until(() => G.carry.held() && G.carry.held().id === 'zanahoria', null, 'picking up the carrot');
    check('carry: picked up (the word\'s name); it grows back a while later', await g.ev(id => { const now = G.words.now, t = now(), was = G.carry.avail(id); G.words.now = () => t + 200; const back = G.carry.avail(id); G.words.now = now; return !was && back; }, zs.id));
    // the swing
    await g.ev(() => G.errands.bag.take('zanahoria'));
    const sw = await g.ev(() => G.MAPDATA.abuelos.pos.swing);
    await tapAt(g, sw[0], sw[1], sw[0], sw[1] + 1);
    await g.until(() => !!G.field.player.swing, null, 'swinging'); await g.frames(50); await g.shot('swing');
    await g.until(() => free() && !G.field.player.swing, null, 'the swing done');
    check('side: the swing in the orchard', await g.ev(() => G.abuelos.state().swings === 1));
    check('side: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog: dig in the garden, the sock on the line (a tug of war), chase the turkeys ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'abuelos-dog', true);
  try {
    await fresh(g, { x: 6, y: 12, done: ['abuelos1'] }); // (the socks on the line are chapter 1's until it's done)
    await idle(g);
    const spot = async (id, sx, sy) => { const sp = await g.ev(id => G.field.def.dogSpots.find(s => s.id === id).at, id); await tapAt(g, sp[0], sp[1], sx, sy); await g.until(id => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === id)), id, 'the dog at ' + id, 60000); await g.until(() => free(), null, 'done'); };
    await spot('abuelos_huerto', 6, 12);
    check('dog: he digs in the garden and finds a carrot', await g.ev(() => G.carry.state().ground.some(it => it.map === 'abuelos' && it.id === 'zanahoria')));
    const sk = await g.ev(() => G.MAPDATA.abuelos.pos.sock);
    await tapAt(g, sk[0], sk[1], sk[0], sk[1] + 1);
    await g.until(() => G.top().constructor.name === 'Choice', null, 'the tug of war', 60000);
    await g.frames(10); await g.shot('tug');
    await drv(g, () => free() && !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'abuelos_calcetin')), 'the tug of war');
    check('dog: he snatches a sock off the line; a tug of war; the sock in your hands', await g.ev(() => G.carry.held() && G.carry.held().id === 'calcetines'));
    const pd = await g.ev(() => G.MAPDATA.abuelos.pos.pavosDog);
    await spot('abuelos_pavos', pd[0], pd[1] + 1);
    check('dog: he chases the turkeys', await g.ev(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'abuelos_pavos'))));
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hide-and-seek; a page puzzle; save and load ----------
async function seek(browser) {
  const { ctx, g } = await open(browser, 'abuelos-seek', true);
  try {
    await fresh(g, { x: 11, y: 22, words: ['gallina', 'conejo', 'gato', 'oveja', 'cerdo', 'pavo'] });
    await idle(g);
    check('seek: Nico has a game here', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await tapNpc(g, 'nico', 1, 0);
    await drv(g, () => free() && G.seek.active(), 'Nico');
    const L = await g.ev(() => G.seek.list().map(h => ({ k: h.kind, s: h.spot, m: G.seek.SPOTS.find(s => s.id === h.spot).map })));
    check('seek: animals hide in the grandparents\' places', L.length >= 2 && L.every(h => h.m === 'abuelos'), JSON.stringify(L));
    const h = await g.ev(() => { const h = G.seek.list()[0], sp = G.seek.SPOTS.find(s => s.id === h.spot), p = G.field.player; p.x = sp.at[0]; p.y = Math.min(27, sp.at[1] + 2); if (G.field.blocked(p.x, p.y, p)) p.x++; G.field.snapCam(); return h.spot; });
    await g.frames(200); await g.shot('seek_peek');
    const r = await g.ev(spot => { const x = G.seek.list().find(h => h.spot === spot); return G.seek.where(x, G.field); }, h);
    await g.tap(r.x + r.w / 2, r.y + 4);
    await g.ev(h => { window.__h = h; }, h);
    await drv(g, () => free() && G.seek.list().find(x => x.spot === window.__h).found, 'finding it');
    check('seek: found one peeking', await g.ev(spot => G.seek.list().find(h => h.spot === spot).found, h));
    // a page puzzle (the body page, by the pump)
    await g.ev(() => { for (const w of ['mano', 'pie', 'nariz', 'ojos', 'boca']) { G.words.meet(w, 't'); G.state.words[w] = { learned: true }; } });
    const pg = await g.ev(() => Object.keys(G.maps.abuelos.pages).find(k => G.maps.abuelos.pages[k] === 'cuerpo').split(',').map(Number));
    check('page: the body page\'s sparkle is ready', await g.ev(() => G.pages.ready('cuerpo')));
    await tapAt(g, pg[0], pg[1], pg[0], pg[1] + 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    await g.frames(10); await g.shot('page_cuerpo');
    await drv(g, () => free(), 'the page puzzle');
    check('page: solved', await g.ev(() => !G.pages.ready('cuerpo')));
    // La huerta's page (three words: three to match), by the garden beds
    await g.ev(() => { for (const w of ['zanahoria', 'elote', 'jitomate']) { G.words.meet(w, 't'); G.state.words[w] = { learned: true }; } });
    const ph = await g.ev(() => Object.keys(G.maps.abuelos.pages).find(k => G.maps.abuelos.pages[k] === 'huerta').split(',').map(Number));
    check('page: La huerta\'s sparkle is ready with its three words', await g.ev(() => G.pages.ready('huerta') && G.pages.words('huerta').length === 3));
    await tapAt(g, ph[0], ph[1], ph[0], ph[1] + 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'La huerta\'s puzzle');
    await g.frames(10); await g.shot('page_huerta');
    check('page: three pictures, centred', await g.ev(() => { const s = G.top(), a = s.picRect(0), b = s.picRect(2); return s.pics.length === 3 && Math.abs((a.x + b.x + b.w) / 2 - G.W / 2) <= 8; }));
    await drv(g, () => free(), 'La huerta\'s puzzle');
    check('page: La huerta solved', await g.ev(() => !G.pages.ready('huerta') && G.pages.solvedDay('huerta') != null));
    // save and load: the clothes you wear, the side quests, the chapters
    await g.ev(() => { G.abuelos.putOn(G.field, 'vestido', '#3870d8'); G.abuelos.putOn(G.field, 'sombrero', '#e04040'); const s = G.abuelos.state(); s.cookiesN = 2; G.state.quests.abuelos1 = 'done'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'abuelos', null, 'back at the grandparents\'');
    const s = await g.ev(() => ({ c: G.abuelos.state().cookiesN, q: G.chapters.done('abuelos1'), w: G.words.met('oveja'), v: G.zones.visited('abuelos'), robe: G.field.player.spec.robe, out: G.field.player.spec.outfit, hat: G.field.player.spec.headColor }));
    check('save: the clothes you wear (a blue dress, a red hat), the cookies, chapters, words and visit are kept', s.c === 2 && s.q && s.w && s.v && s.robe && s.out === '#3870d8' && s.hat === '#e04040', JSON.stringify(s));
    check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY; // (run one section: ONLY=side)
run('La casa de los abuelos', [['walking in, every place, the bus, Lola, the front door', walkIn], ['the animals and the album', animals], ['the story by taps', story], ['clothes and the body', dress], ['side quests', side], ['the dog', dog], ['hide-and-seek, a page, save and load', seek]].filter(([n, f]) => !ONLY || f.name === ONLY));
