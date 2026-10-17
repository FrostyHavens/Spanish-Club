// La playa (content/es/zone-playa.js, docs/WORLD_PLAN.md): walking in from Villa Sol and the bus, the beach's animals
// (a tap meets an unmet one through Lola's puzzle, the album page, the rare ones), the story by taps (Don Paco's net,
// an ice cream for Marina, the baby turtles), the side quests (Tere's sandcastle with the pail, Lola's shells, the
// little crab's shell, an ice cream for whoever is hot), the dog's things to do (dig, splash, chase the gulls),
// carrying, hide-and-seek on the beach, save and load.
// NODE_PATH=$(npm root -g) node tools/test-zone-playa.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

// a game already going (the opener done, "go explore"), wherever o.map says
const fresh = (g, o = {}) => g.ev(o => {
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (!o.demo) G.demo.skip();
  if (o.visit !== false) { G.zones.visit('villa'); G.zones.visit('playa'); }
  for (const w of o.words || []) G.words.meet(w, 't');
  G.goto(o.map || 'playa', o.x == null ? 10 : o.x, o.y == null ? 4 : o.y, 'down');
}, o);
const idle = (g, map = 'playa') => g.fieldIdle(map);
// stand next to someone (on the given side) and tap them
async function tapNpc(g, id, dx = 1, dy = 0) {
  await g.ev(([id, dx, dy]) => { const n = G.field.npc(id), p = G.field.player; p.x = n.x + dx; p.y = n.y + dy; p.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down'; G.field.snapCam(); }, [id, dx, dy]);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
// stand near a tile and tap it
async function tapAt(g, x, y, sx, sy) {
  await g.ev(([x, y, sx, sy]) => { const p = G.field.player; p.x = sx == null ? x : sx; p.y = sy == null ? y - 1 : sy; G.field.snapCam(); }, [x, y, sx, sy]);
  await g.frames(4);
  await g.tapTile(x, y);
}
const free = () => G.top() === G.field && !G.field.locked;

// ---------- walking in from Villa Sol, the bus ----------
async function walkIn(browser) {
  const { ctx, g } = await open(browser, 'playa-walk', true);
  try {
    await fresh(g, { visit: false, map: 'villa', x: 29, y: 25 });
    await idle(g, 'villa');
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'camino_playa', null, 'the path to the beach'); await g.page.keyboard.up('ArrowDown');
    await g.fieldIdle('camino_playa');
    await g.ev(() => { const p = G.field.player; p.x = 6; p.y = 22; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowDown'); await g.until(() => G.field.mapId === 'playa', null, 'the beach'); await g.page.keyboard.up('ArrowDown');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await g.frames(60); await g.shot('nuevo_lugar');
    await g.drive(() => G.top() === G.field && !G.field.locked && G.field.mapId === 'playa', 'the new place card');
    check('walk: from Villa Sol along the path onto the beach: "¡Nuevo lugar!", visited', await g.ev(() => G.zones.visited('playa') && G.field.player.y <= 2));
    await g.frames(20); await g.shot('beach_arrival');
    const r = await g.ev(() => ({ kinds: [...new Set(G.animals.here().map(a => a.kind))], ppl: ['lola', 'nico', 'paco', 'marina', 'nieves', 'tere'].filter(id => G.field.npc(id)), why: (G.guide.goal(G.field) || {}).why || '' }));
    check('walk: the beach has its animals (crabs, gulls, starfish, a turtle, jellyfish)', ['cangrejo', 'gaviota', 'estrellamar', 'tortuga', 'medusa'].every(k => r.kinds.includes(k)), JSON.stringify(r.kinds));
    check('walk: its people are there (Lola, Nico, Don Paco, Marina, Doña Nieves, Tere)', r.ppl.length === 6, JSON.stringify(r.ppl));
    check('walk: the guide suggests something here (Lola first)', /lola/.test(r.why), r.why);
    // every part of the beach is reachable from the path's end (people's places, the pier's end, the rocks' pool)
    const reach = await g.ev(() => {
      const f = G.field, key = (a, b) => a + ',' + b, q = [[10, 1]], vis = new Set([key(10, 1)]);
      for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || na < 0 || nb < 0 || na >= f.map.w || nb >= f.map.h) continue; const t = G.TERRAIN[f.map.get(na, nb)]; if (t.block || t.wall) continue; vis.add(key(na, nb)); q.push([na, nb]); } }
      const P = G.MAPDATA.playa.pos, need = { net: P.net, nest: P.nest, fill: G.playa.AT.fill, pool: [27, 13], bus: P.busIn, splash: P.splash, dog: P.dog, dog2: P.dog2 };
      return Object.keys(need).filter(k => !vis.has(key(...need[k])));
    });
    check('walk: the pier\'s end, the nest, the water\'s edge, the tide pool, the dog\'s spots are all reachable', !reach.length, reach.join(','));
    // the bus back to Villa Sol and back to the beach
    await g.ev(() => G.zones.visit('villa'));
    const b = await g.ev(() => G.zones.def('playa').bus.at);
    await g.ev(b => { const p = G.field.player; p.x = b[0] + 1; p.y = b[1] + 1; G.field.snapCam(); }, b);
    await g.tapTile(b[0], b[1]);
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(10);
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'villa')));
    await g.until(() => G.field.mapId === 'villa' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to Villa Sol', 30000);
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    await g.tapRect(await g.ev(() => G.top().rect('map')));
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map from the menu');
    await g.frames(10); await g.shot('worldmap');
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'playa')));
    await g.until(() => G.field.mapId === 'playa' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to the beach', 30000);
    check('walk: the bus takes you to the beach\'s stop (and back)', await g.ev(() => { const e = G.zones.def('playa').entry, p = G.field.player; return p.x === e.x && p.y === e.y; }));
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the animals: Lola names one you tap; the album page; the rare ones ----------
async function animals(browser) {
  const { ctx, g } = await open(browser, 'playa-animals', true);
  try {
    await fresh(g, { x: 26, y: 8 });
    await idle(g);
    await g.ev(() => { const c = G.animals.find('cangrejo'); c.x = 24 * 24 + 12; c.y = 9 * 24 + 18; c.st = 'idle'; c.t = 999; c.ground = [[24, 9]]; });
    const cr = await g.ev(() => { const a = G.animals.find('cangrejo'); return G.animals.screen(a); });
    await g.tap(cr[0], cr[1]);
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Lola naming the crab');
    await g.frames(10); await g.shot('lola_names_crab');
    check('animals: tapping an unmet beach animal: Lola names it in a one-unknown puzzle', await g.ev(() => { const s = G.top(); return s.constructor.name === 'TextBox' ? s.opts.who === 'lola' : true; }));
    await g.drive(() => free() && G.words.met('cangrejo'), 'Lola\'s puzzle');
    check('animals: el cangrejo is met, and in the album', await g.ev(() => G.words.met('cangrejo') && G.animals.met('cangrejo')));
    await g.until(() => !G.album.discovering() || G.album.discovering().id === 'cangrejo', null, '"¡Nuevo animal!"');
    await g.frames(30); await g.shot('nuevo_animal');
    // a crab scuttles sideways, a gull takes off when you come close
    const side = await g.ev(() => { const a = G.animals.find('cangrejo'); a.st = 'idle'; a.t = 1; const y0 = a.y; for (let i = 0; i < 60; i++) G.frame++, G.animals.update(G.field); return { dy: Math.abs(a.y - y0), st: a.st }; });
    check('animals: the crab moves sideways only', side.dy === 0, JSON.stringify(side));
    const fly = await g.ev(() => { const a = G.animals.find('gaviota'), p = G.field.player; a.x = p.x * 24 + 20; a.y = p.y * 24 + 18; a.st = 'idle'; for (let i = 0; i < 40; i++) G.frame++, G.animals.update(G.field); return { st: a.st, z: a.z }; });
    check('animals: a gull takes off when you come close (and flies up)', fly.st === 'fly' && fly.z > 10, JSON.stringify(fly));
    // the rare ones: the dolphin in the morning (far out), the octopus at night in the tide pool
    const rare = await g.ev(() => {
      const ok = G.zones.timeOk; G.zones.timeOk = () => true; const r0 = Math.random; Math.random = () => 0.1;
      G.field.zoo = null; const here = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; Math.random = r0;
      const def = G.maps.playa.animals; return { here, d: def.find(a => a.kind === 'delfin'), p: def.find(a => a.kind === 'pulpo') };
    });
    check('animals: the dolphin is rare (the morning, not always) and the octopus comes out at night', rare.here.includes('delfin') && rare.here.includes('pulpo') && rare.d.when === 'manana' && rare.d.chance < 1 && rare.p.when === 'noche', JSON.stringify(rare));
    const day = await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = w => w !== 'noche'; G.field.zoo = null; const k = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; return k; });
    check('animals: by day there is no octopus', !day.includes('pulpo'));
    // the dolphin leaps: tap it then, Lola names it
    await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = () => true; const r0 = Math.random; Math.random = () => 0.1; G.field.zoo = null; G.animals.here(); G.zones.timeOk = ok; Math.random = r0; const p = G.field.player; p.x = 22; p.y = 17; G.field.snapCam(); const d = G.animals.find('delfin'); d.x = 22 * 24; d.y = 20 * 24 + 12; d.flip = false; G.animals.leap(d, G.field); d.ground = [[22, 20], [24, 20], [20, 20], [23, 20], [21, 20]]; });
    await g.until(() => { const d = G.animals.find('delfin'); return d && d.z > 20; }, null, 'the dolphin in the air');
    await g.shot('dolphin_leaps');
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('delfin'))));
    await g.drive(() => free() && G.words.met('delfin'), 'Lola naming the dolphin');
    check('animals: the leaping dolphin, tapped: named and in the album', await g.ev(() => G.animals.met('delfin')));
    // the album's beach page
    await g.ev(() => G.album('playa')); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(12); await g.shot('album_playa');
    const al = await g.ev(() => ({ ids: G.top().ids(), c: G.album.zoneCount('playa'), n: G.album.number('cangrejo'), z: G.top().zone }));
    check('album: the beach\'s page has its 7 animals (2 met), numbered after Villa Sol\'s', al.z === 'playa' && al.ids.length === 7 && al.ids.every(Boolean) && al.c.met === 2 && al.c.of === 7 && al.n === 12, JSON.stringify(al));
    check('album: rare ones and habitats are marked', await g.ev(() => { const z = G.zones.def('playa'); return z.rare.delfin === 'manana' && z.rare.pulpo === 'noche' && Object.keys(z.habitat).length === 7 && Object.values(z.habitat).every(G.iconDrawn); }));
    check('animals: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story, by taps: Don Paco's net, ¡Qué calor!, the baby turtles ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'playa-story', true);
  try {
    await fresh(g, { x: 6, y: 16 });
    await idle(g);
    check('story: Don Paco has the net\'s picture in his bubble (the beach\'s quest line, beside Villa Sol\'s)', await g.ev(() => G.chapters.next('playa') === 'playa1' && !G.chapters.gate('playa1') && G.field.npc('paco').alert() && G.field.npc('paco').alert().icon === 'redpesca'));
    await tapNpc(g, 'paco', 0, -1);
    await g.drive(() => free() && G.chapters.active('playa1') && G.chapters.state().step.playa1 === 1, 'Don Paco: el mar, his net');
    check('story 1: el mar met; the net\'s place is next', await g.ev(() => G.words.met('mar') && G.chapters.lineHere() === 'playa' && /playa1/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await g.shot('net_in_water');
    const net = await g.ev(() => G.MAPDATA.playa.pos.net);
    await tapAt(g, net[0], net[1], net[0] + 1, net[1]);
    await g.until(() => G.chapters.state().step.playa1 === 2 || G.top().constructor.name !== 'Field', null, 'the net');
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'the catch'); await g.frames(30); await g.shot('net_up');
    await g.drive(() => free() && G.chapters.state().step.playa1 === 2, 'what was in the net');
    check('story 1: el cangrejo, la estrella de mar, la concha met one at a time; the shell is in your hands', await g.ev(() => ['cangrejo', 'estrellamar', 'concha'].every(G.words.met) && G.carry.held() && G.carry.held().id === 'concha'));
    await tapNpc(g, 'paco', 0, -1);
    await g.drive(() => free() && G.chapters.done('playa1'), 'Don Paco\'s thanks');
    check('story 1 done: its badge; chapter 2 opens right away (Marina\'s bubble)', await g.ev(() => G.chapters.done('playa1') && G.chapters.next('playa') === 'playa2' && !!G.field.npc('marina').alert()));
    // 2 · ¡Qué calor!
    await tapNpc(g, 'marina', 1, 0);
    await g.drive(() => free() && G.chapters.state().step.playa2 === 1, 'Marina: el sol, caliente');
    check('story 2: el sol and caliente met; Doña Nieves has the ice cream in her bubble', await g.ev(() => G.words.met('sol') && G.words.met('caliente') && !!G.field.npc('nieves').alert()));
    await tapNpc(g, 'nieves', 0, 1);
    await g.drive(() => free() && G.chapters.state().step.playa2 === 2, 'Doña Nieves: el helado');
    check('story 2: el helado met, held up over your head for Marina', await g.ev(() => G.words.met('helado') && G.errands.bag.has('helado', { q: 'playa2' })));
    await g.shot('ice_cream');
    await tapNpc(g, 'marina', 1, 0);
    await g.drive(() => free() && G.chapters.done('playa2'), 'the ice cream for Marina');
    check('story 2 done', await g.ev(() => G.chapters.done('playa2') && !G.errands.bag.has('helado')));
    // 3 · Las tortuguitas
    await tapNpc(g, 'marina', 1, 0);
    await g.drive(() => free() && G.chapters.state().step.playa3 === 1, 'Marina: the nest, la arena');
    const nest = await g.ev(() => G.MAPDATA.playa.pos.nest);
    await tapAt(g, nest[0], nest[1], nest[0], nest[1] - 1);
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'the eggs hatching');
    await g.drive(() => free() && G.chapters.state().step.playa3 === 2, 'the babies; the gulls');
    await g.frames(20); await g.shot('gulls');
    check('story 3: la arena, la tortuga, la gaviota met; the dog has the gull in his bubble', await g.ev(() => ['arena', 'tortuga', 'gaviota'].every(G.words.met) && G.pet.npc(G.field).alert() && G.pet.npc(G.field).alert().icon === 'gaviota'));
    await g.ev(() => { const n = G.pet.npc(G.field), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.home = [n.x, n.y]; });
    await g.frames(4);
    await g.tapTile(...await g.ev(() => { const n = G.pet.npc(G.field); return [n.x, n.y]; }));
    await g.drive(() => free() && G.chapters.state().step.playa3 === 3, 'the dog chasing the gulls');
    for (let i = 0; i < 3; i++) {
      const b = await g.ev(i => { const N = G.MAPDATA.playa.pos.nest; return [[N[0] - 1, N[1]], [N[0], N[1] + 1], [N[0] + 1, N[1]]][i]; }, i);
      await tapAt(g, b[0], b[1], b[0], b[1] - 1);
      await g.until(i => (G.chapters.ctx('playa3').data.go || {})[i] != null, i, 'baby ' + i + ' going');
      await g.drive(() => free(), 'after a baby');
    }
    await g.frames(30); await g.shot('babies_crawl');
    await g.drive(() => free() && G.chapters.done('playa3'), 'they swim away');
    check('story 3 done: nadar met; the turtle is in the album', await g.ev(() => G.chapters.done('playa3') && G.words.met('nadar') && G.animals.met('tortuga')));
    check('story: every new word was met in its own puzzle (one unknown at a time)', await g.ev(() => ['mar', 'cangrejo', 'estrellamar', 'concha', 'sol', 'caliente', 'helado', 'arena', 'tortuga', 'gaviota', 'nadar'].every(id => G.words.met(id))));
    check('story: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- side quests: Tere's sandcastle, Lola's shells, the little crab, an ice cream for someone hot ----------
async function side(browser) {
  const { ctx, g } = await open(browser, 'playa-side', true);
  try {
    await fresh(g, { x: 16, y: 10, demo: true });
    await g.ev(() => { for (const k of G.demo.KINDS) G.state.flags.demo[k] = 1; }); // (the town's demos seen; the beach's own not yet)
    await idle(g);
    // Tere: her castle, la cubeta
    check('side: Tere has the pail in her bubble', await g.ev(() => { const a = G.field.npc('tere').alert(); return a && a.icon === 'cubetaplaya'; }));
    await tapNpc(g, 'tere', 0, -1);
    await g.drive(() => free() && !!G.errands.bag.list().find(it => it.id === 'cubeta'), 'Tere: el castillo, la cubeta');
    check('side: el castillo and la cubeta met; the pail is in your hands; the guide points at the water', await g.ev(() => G.words.met('castillo') && G.words.met('cubeta') && /fill the pail/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await g.until(() => G.demo.shown('fillpail'), null, 'the ghost hand at the water', 30000);
    await g.frames(10); await g.shot('demo_fillpail');
    check('side: a ghost hand shows the new action (tap the water with the pail), once', await g.ev(() => G.demo.shown('fillpail')));
    for (let k = 1; k <= 3; k++) {
      const at = await g.ev(() => G.playa.AT.fill);
      await tapAt(g, at[0], at[1], at[0], at[1] - 1);
      await g.drive(() => free() && G.errands.bag.list().some(it => it.id === 'cubeta' && it.full), 'filling the pail');
      await tapNpc(g, 'tere', 0, -1);
      await g.drive(() => free() && G.playa.state().castle.n === k, 'pouring the sand');
      if (k === 2) { await g.frames(10); await g.shot('castle_growing'); }
    }
    await g.drive(() => free() && G.playa.state().castle.flag, 'the flag on top');
    await g.frames(10); await g.shot('castle_done');
    check('side: three pails of sand, then the flag: the castle is built (la arena met on the way)', await g.ev(() => G.playa.state().castle.flag && G.playa.state().built === 1 && G.words.met('arena') && !G.errands.bag.has('cubeta')));
    // Lola's shells: pick one up, bring it to her
    await tapNpc(g, 'lola', 1, 0);
    await g.drive(() => free() && G.zones.lolaTalked('playa'), 'Lola: la ola, her shells');
    check('side: Lola shows the waves (la ola) and asks for shells of every colour', await g.ev(() => G.words.met('ola') && G.words.met('concha') && G.playa.state().asked === G.words.day()));
    check('side: the guide points at a shell to pick up', await g.ev(() => /shell for Lola/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    const sh = await g.ev(() => G.carry.SOURCES.find(s => s.id === 'concha_rosa').at);
    await tapAt(g, sh[0], sh[1], sh[0] + 1, sh[1]);
    await g.until(() => G.carry.held() && G.carry.held().id === 'concha', null, 'the pink shell in your hands');
    check('side: Lola\'s bubble shows the shell you hold', await g.ev(() => { const a = G.field.npc('lola').alert(); return a && a.icon === 'concha'; }));
    await tapNpc(g, 'lola', 1, 0);
    await g.drive(() => free() && G.playa.shellsHave().length === 1, 'the shell for Lola');
    await g.ev(() => { for (const c of ['blanco', 'azul', 'amarillo']) G.playa.state().shells[c] = 1; G.errands.bag.add('concha', { col: 'rojo' }); });
    await tapNpc(g, 'lola', 1, 0);
    await g.until(() => G.top().constructor.name === 'TextBox' && G.playa.shellsDone(), null, 'the last shell');
    await g.frames(20); await g.shot('shells_all');
    await g.drive(() => free(), 'all five');
    check('side: all five colours: ¡Todas!', await g.ev(() => G.playa.shellsDone()));
    // the little crab with no shell (after Don Paco's net)
    await g.ev(() => { G.state.quests.playa1 = 'done'; });
    const hc = await g.ev(() => G.playa.AT.hermit);
    await tapAt(g, hc[0], hc[1], hc[0] - 1, hc[1]);
    await g.drive(() => free() && G.playa.state().hermitOn, 'the little crab');
    await g.frames(10); await g.shot('hermit');
    check('side: the little crab\'s three shells are a choice for the guide', await g.ev(() => { const gl = G.guide.goal(G.field); return gl && gl.choice && gl.pts.length === 3; }));
    const wrong = await g.ev(() => G.playa.HERMIT_SHELLS.findIndex(s => !s.right)), right = await g.ev(() => G.playa.HERMIT_SHELLS.findIndex(s => s.right));
    let at = await g.ev(k => G.playa.HERMIT_SHELLS[k].at, wrong);
    await tapAt(g, at[0], at[1], at[0], at[1] - 1);
    await g.drive(() => free(), 'a shell too small');
    check('side: a small shell: "¡No!", the crab still waits', await g.ev(() => G.playa.state().hermitOn && !G.playa.state().hermit));
    at = await g.ev(k => G.playa.HERMIT_SHELLS[k].at, right);
    await tapAt(g, at[0], at[1], at[0], at[1] - 1);
    await g.drive(() => free() && !!G.playa.state().hermit, 'the spiral shell');
    check('side: the spiral shell: the little crab moves in', await g.ev(() => !!G.playa.state().hermit));
    // an ice cream for whoever is hot today
    await g.ev(() => { G.state.quests.playa2 = 'done'; for (const w of ['helado', 'sol', 'caliente']) G.words.meet(w, 't'); });
    const hot = await g.ev(() => G.playa.hotWho());
    check('side: someone is hot today (their bubble), and Doña Nieves has ice cream', await g.ev(w => { const a = G.field.npc(w).alert(); return a && a.icon === 'caliente' && G.field.npc('nieves').alert() === 'helado'; }, hot), hot);
    await tapNpc(g, 'nieves', 0, 1);
    await g.drive(() => free() && G.carry.held() && G.carry.held().id === 'helado', 'an ice cream from Doña Nieves');
    await tapNpc(g, hot, hot === 'paco' ? 0 : 1, hot === 'paco' ? -1 : 0);
    await g.drive(() => free() && G.playa.state().hot.d === G.words.day(), 'the ice cream for ' + hot);
    check('side: the ice cream cools them down (a star)', await g.ev(() => !G.carry.held()));
    check('side: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog: dig for a shell, splash in the waves, chase the gulls; carrying things ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'playa-dog', true);
  try {
    await fresh(g, { x: 11, y: 11 });
    await idle(g);
    const spot = async id => { const sp = await g.ev(id => G.field.def.dogSpots.find(s => s.id === id).at, id); await tapAt(g, sp[0], sp[1], sp[0] + 1, sp[1] - 1); await g.until(id => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === id)), id, 'the dog at ' + id, 30000); await g.until(() => free(), null, 'done'); };
    await spot('playa_arena');
    await g.shot('dug_shell');
    check('dog: he digs in the sand and finds a shell to pick up', await g.ev(() => G.carry.state().ground.some(it => it.map === 'playa' && it.id === 'concha' && G.playa.SHELLS.includes(it.col))));
    await spot('playa_olas');
    check('dog: he splashes in the waves', await g.ev(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'playa_olas'))));
    await g.ev(() => { const a = G.animals.find('gaviota'); a.st = 'idle'; a.x = 25 * 24 + 12; a.y = 7 * 24 + 18; a.ground = [[25, 7], [26, 7], [24, 7], [25, 8]]; a.t = 999; });
    const sp = await g.ev(() => G.field.def.dogSpots.find(s => s.id === 'playa_gaviotas').at);
    await tapAt(g, sp[0], sp[1], sp[0] + 1, sp[1] - 1);
    await g.until(() => G.animals.here().some(a => a.kind === 'gaviota' && a.st === 'fly'), null, 'a gull flying off', 30000);
    await g.frames(10); await g.shot('chase_gulls');
    await g.until(() => free(), null, 'the chase done');
    check('dog: he chases the gulls and they fly off', await g.ev(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'playa_gaviotas'))));
    // carry: the shell he dug up, then put it down by tapping yourself
    const it = await g.ev(() => { const it = G.carry.state().ground.find(it => it.map === 'playa' && it.id === 'concha'); return [it.x, it.y]; });
    await tapAt(g, it[0], it[1], it[0] + 1, it[1]);
    await g.until(() => G.carry.held() && G.carry.held().id === 'concha', null, 'the shell in your hands');
    check('carry: the shell is held up, its picture in its colour', await g.ev(() => G.carry.held().col && G.carry.label('concha') === '?'));
    await g.tap(...await g.ev(() => { const p = G.field.player, T = G.TILE; return [p.x * T + 12 - Math.round(G.field.cam.x), p.y * T + 12 - Math.round(G.field.cam.y)]; }));
    await g.until(() => !G.carry.held(), null, 'putting it down');
    check('carry: tap yourself: put down on the sand (saved)', await g.ev(() => G.carry.state().ground.some(it => it.map === 'playa' && it.id === 'concha')));
    // an ice cream for the dog: he eats it
    await g.ev(() => { G.words.meet('helado', 't'); G.errands.bag.add('helado'); const n = G.pet.npc(G.field), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.home = [n.x, n.y]; });
    await g.frames(4);
    await g.tapTile(...await g.ev(() => { const n = G.pet.npc(G.field); return [n.x, n.y]; }));
    await g.until(() => !G.carry.held(), null, 'the dog eating the ice cream', 30000);
    check('carry: give the dog an ice cream: he eats it', true);
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hide-and-seek on the beach; a page puzzle; save and load ----------
async function seek(browser) {
  const { ctx, g } = await open(browser, 'playa-seek', true);
  try {
    await fresh(g, { x: 20, y: 7, words: ['cangrejo', 'gaviota', 'tortuga', 'estrellamar'] });
    await idle(g);
    check('seek: Nico has a game on the beach', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await tapNpc(g, 'nico', 1, 0);
    await g.drive(() => free() && G.seek.active(), 'Nico');
    const L = await g.ev(() => G.seek.list().map(h => ({ k: h.kind, s: h.spot, m: G.seek.SPOTS.find(s => s.id === h.spot).map })));
    check('seek: beach animals hide in the beach\'s places', L.length >= 2 && L.every(h => h.m === 'playa'), JSON.stringify(L));
    const h = await g.ev(() => { const h = G.seek.list()[0], sp = G.seek.SPOTS.find(s => s.id === h.spot), p = G.field.player; p.x = sp.at[0]; p.y = Math.max(4, sp.at[1] - 2); G.field.snapCam(); return h.spot; });
    await g.frames(200); await g.shot('seek_peek');
    const r = await g.ev(spot => { const x = G.seek.list().find(h => h.spot === spot); return G.seek.where(x, G.field); }, h);
    await g.tap(r.x + r.w / 2, r.y + 4);
    await g.drive(() => free() && G.seek.list().find(x => x.spot === h).found, 'finding it');
    check('seek: found one peeking', await g.ev(spot => G.seek.list().find(h => h.spot === spot).found, h));
    // a page puzzle on the beach (four met words of the sea page)
    await g.ev(() => { G.words.meet('pulpo', 't'); });
    const pg = await g.ev(() => Object.keys(G.maps.playa.pages).find(k => G.maps.playa.pages[k] === 'mar').split(',').map(Number));
    check('page: the sea page\'s sparkle is ready on the beach', await g.ev(() => G.pages.ready('mar')));
    await tapAt(g, pg[0], pg[1], pg[0], pg[1] - 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    await g.drive(() => free(), 'the page puzzle');
    check('page: the beach\'s page puzzle is solved', await g.ev(() => !G.pages.ready('mar')));
    // save and load
    await g.ev(() => { const s = G.playa.state(); s.shells.rosa = 1; s.built = 2; G.state.quests.playa1 = 'done'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'playa', null, 'back on the beach');
    const s = await g.ev(() => ({ sh: G.playa.shellsHave(), b: G.playa.state().built, q: G.chapters.done('playa1'), w: G.words.met('cangrejo'), v: G.zones.visited('playa'), al: G.animals.met('cangrejo') }));
    check('save: the beach\'s shells, castles, chapters, words and visit are all kept', s.sh.join() === 'rosa' && s.b === 2 && s.q && s.w && s.v, JSON.stringify(s));
    check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('La playa', [['walking in, the bus', walkIn], ['the animals and the album', animals], ['the story by taps', story], ['side quests', side], ['the dog and carrying', dog], ['hide-and-seek, a page, save and load', seek]]);
