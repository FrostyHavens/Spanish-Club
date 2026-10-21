// The open world (docs/WORLD_PLAN.md, src/zones.js): naming the dog and the {dog} fill, the skip path (go explore),
// no word budget, every path walkable from Villa Sol to each zone's first map, the bus and the world map (fast travel,
// "?" places), the dog's spots, hide-and-seek in a zone, the album by zone (the Pokédex), save and load.
// NODE_PATH=$(npm root -g) node tools/test-world.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

// a new game through the creator, up to the opener's end; o.explore picks "go explore", o.dog types a name
async function newGame(g, o = {}) {
  await g.toCreator();
  await g.tapRect(await g.ev(() => G.top().optRects(5)[1]));
  await g.until(() => G.top().constructor.name === 'NameEntry', null, 'the name entry');
  await g.ev(() => { G.top().name = 'Luz'; });
  await g.tapRect(await g.ev(() => G.top().cellRect(3, 6)));
  await g.until(() => G.field && G.field.mapId === 'casa', null, 'home');
  g.explore = !!o.explore; g.dogName = o.dog == null ? null : o.dog;
}
const ZONES = ['playa', 'bosque', 'juegos', 'abuelos', 'montana'];
// a child who only follows the guide's arrow for up to `sec` seconds of play (or until done() in the page): taps where
// it points, plays whatever comes up -> the maps she went through (the one she started on first)
async function followArrow(g, sec, done) {
  const maps = [await g.ev(() => G.field.mapId)], f0 = await g.ev(() => G.frame);
  while ((await g.ev(() => G.frame)) - f0 < sec * 60 && !(await g.ev(done))) {
    await g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0, 'a scene on the way');
    const m = await g.ev(() => G.field.mapId); if (m !== maps[maps.length - 1]) maps.push(m);
    if (await g.ev(done)) break;
    const a = await g.ev(() => { const a = G.guide.at; return a && !a.hidden ? { x: a.edge ? a.x : a.tx, y: a.edge ? a.y : a.ty } : null; });
    if (!a) { await g.frames(30); continue; }
    await g.tap(a.x, a.y);
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
    await g.frames(6); // (through a door: the fade has begun)
    await g.until(() => G.fade.a === 0 || G.top() !== G.field, null, 'the next map', 10000);
    const m2 = await g.ev(() => G.field.mapId); if (m2 !== maps[maps.length - 1]) maps.push(m2);
  }
  return maps;
}

async function naming(browser) {
  const { ctx, g } = await open(browser, 'world-name', true);
  try {
    await newGame(g, { dog: 'Chispa' });
    const lines = [];
    g.beforeAct = async s => { if (s.name === 'TextBox') { const t = await g.ev(() => { const b = G.top(); return b.pages && b.pages[b.pi] ? b.pages[b.pi].t : ''; }); if (t && lines[lines.length - 1] !== t) lines.push(t); } if (s.name === 'NameEntry' && s.t > 8) { check('name: the puppy\'s name screen comes up with "Canelo" already typed', await g.ev(() => G.top().dog && G.top().name === 'Canelo')); } return false; };
    await g.drive(() => G.chapters.openerDone() && G.chapters.current() === 'c1' && G.intro.seeking('mama'), 'the opener, then chapter 1 to the puppy hiding');
    g.beforeAct = null;
    check('name: the child named the puppy (saved)', await g.ev(() => G.state.dogName === 'Chispa' && G.dogName() === 'Chispa'));
    check('name: {dog} fills in everywhere (dialogue, names, the notebook page)', await g.ev(() => G.fill('¡Hola, {dog}!') === '¡Hola, Chispa!' && G.nameOf('canelo') === 'Chispa' && G.fill(G.data.topics.mascota.name) === 'Mi perro Chispa'));
    check('name: Mamá says his name in a line', lines.some(l => /Chispa/.test(l)), lines.slice(-4).join(' | '));
    check('name: "play" starts the puppy\'s game (chapter 1) right away', await g.ev(() => G.chapters.current() === 'c1' && !G.state.flags.dogSkip));
    check('name: no hard-coded "Canelo" left in what was said', !lines.some(l => /Canelo/.test(l)), lines.filter(l => /Canelo/.test(l)).join(' | '));
    check('name: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function skip(browser) {
  const { ctx, g } = await open(browser, 'world-skip', true);
  try {
    await newGame(g, { explore: true });
    await g.drive(() => G.chapters.openerDone() && G.top() === G.field && !G.field.locked, 'the opener');
    await g.shot('after_explore');
    const s = await g.ev(() => ({ skip: !!G.state.flags.dogSkip, mine: G.pet.mine(), follows: !!G.state.flags.canelo, cur: G.chapters.current(), next: G.chapters.next(), mama: G.field.npc('mama').alert(), dog: G.dogName(), hola: G.words.met('hola') }));
    check('skip: "go explore": the dog is yours and comes along, chapter 1 is not going on', s.skip && s.mine && s.follows && !s.cur && s.next === 'c1', JSON.stringify(s));
    check('skip: the default name is kept (Canelo); hola was met in the opener', s.dog === 'Canelo' && s.hola);
    check('skip: Mamá has the puppy\'s picture in her bubble (his games, for later)', s.mama === 'perro' || (s.mama && s.mama.icon === 'perro'), JSON.stringify(s.mama));
    check('skip: the guide does not pull you to Mamá', await g.ev(() => { const w = (G.guide.goal(G.field) || {}).why || ''; return !/mama|c1:/.test(w); }), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    // out of the door freely
    await g.ev(() => { const p = G.field.player; p.x = 4; p.y = 5; p.dir = 'down'; });
    await g.page.keyboard.down('ArrowDown');
    await g.until(() => G.field.mapId === 'villa' && G.fade.a === 0, null, 'out in town');
    await g.page.keyboard.up('ArrowDown');
    check('skip: the door opens: out in Villa Sol, the dog following', await g.ev(() => !!G.pet.npc(G.field)));
    check('skip: in town the guide suggests exploring (a road out), never the puppy tutorial nor back in the house', await g.ev(() => /^explore /.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    // and a child who follows it gets out of town: never in and out of the front door (docs/AUDIT_2026-10.md C1: "job in
    // casa" for the puppy's game nobody started, 49 door trips a minute)
    const walked = await followArrow(g, 40, () => /^camino_/.test(G.field.mapId));
    check('skip: following the arrow leads out of town onto a path, through no door twice (' + walked.join(' > ') + ')', /^camino_/.test(walked[walked.length - 1] || '') && new Set(walked).size === walked.length && walked.length <= 3, walked.join(' > '));
    // later, at home: Mamá's puppy game is still there
    await g.ev(() => G.goto('casa', 4, 4, 'up')); await g.fieldIdle('casa');
    await g.tapTile(3, 2);
    await g.drive(() => G.chapters.current() === 'c1' && !!G.intro.seeking('mama') && G.top() === G.field, 'Mamá\'s puppy game');
    check('skip: tapping Mamá later starts the puppy\'s hide-and-seek (chapter 1)', await g.ev(() => G.chapters.active('c1')));
    check('skip: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// a game already going (the opener done, explore chosen), in town
const fresh = (g, o = {}) => g.ev(o => {
  G.st.newGame(); G.state.name = 'Luz'; G.state.dogName = o.dog || null;
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (o.demo !== true) G.demo.skip(); G.goto(o.map || 'villa', o.x || 18, o.y || 14, 'down');
}, o);

async function budget(browser) {
  const { ctx, g } = await open(browser, 'world-budget', true);
  try {
    await fresh(g);
    await g.fieldIdle('villa');
    const r = await g.ev(() => {
      G.state.quests.c1 = 'done';
      for (const id of ['perro', 'guau', 'ven', 'gato', 'miau', 'buenosdias', 'hueso', 'sientate', 'si', 'no', 'manzana']) G.words.meet(id, 't'); // (11 met today, all only met)
      return { c2: G.chapters.gate('c2'), today: G.chapters.newToday(), s1: G.chapters.stage1(), can: G.budget.canIntro(20), canHard: G.budget.canIntro(50, { hard: true }) };
    });
    check('budget: 11 new words today, 10+ only met: the next chapter still opens (no "budget", "busy", "soon")', r.c2 === null && r.today >= 11 && r.s1 >= 10, JSON.stringify(r));
    check('budget: G.budget.canIntro is always true (no daily word limit)', r.can && r.canHard);
    check('budget: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function paths(browser) {
  const { ctx, g } = await open(browser, 'world-paths', true);
  try {
    await fresh(g);
    await g.fieldIdle('villa');
    // every zone: Villa Sol's edge -> the path map -> the zone's first map, each leg walkable (a breadth-first walk over
    // the field's own blocked() from where you arrive to the next exit), and back
    for (const z of ZONES) {
      const r = await g.ev(z => {
        const def = G.zones.def(z), legs = [], seen = new Set();
        const walk = (m, x, y, to) => { // arrive on m at x, y: can you reach the exit to `to`?
          const f = G.goto(m, x, y, 'down'); const ex = (f.def.exits || []).find(e => e.to === to); if (!ex) return { m, to, ok: false, why: 'no exit' };
          const key = (a, b) => a + ',' + b, q = [[x, y]], vis = new Set([key(x, y)]);
          for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; if (a === ex.x && b === ex.y) return { m, to, ok: true, ex }; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || f.blocked(na, nb, f.player)) continue; vis.add(key(na, nb)); q.push([na, nb]); } }
          return { m, to, ok: false, why: 'blocked', x, y, ex: [ex.x, ex.y] };
        };
        const a = walk('villa', 18, 14, def.path); legs.push(a); if (!a.ok) return legs;
        const b = walk(def.path, a.ex.tx, a.ex.ty, z); legs.push(b); if (!b.ok) return legs;
        const c = walk(z, b.ex.tx, b.ex.ty, def.path); legs.push(c); if (!c.ok) return legs;
        const d = walk(def.path, c.ex.tx, c.ex.ty, 'villa'); legs.push(d);
        void seen; return legs;
      }, z);
      check('paths: ' + z + ': Villa Sol -> its path -> its first map, and back, all walkable', r.length === 4 && r.every(l => l.ok), JSON.stringify(r.filter(l => !l.ok)));
    }
    // and one really walked, with the keys: out of town to the west, along the path, into the playground
    await g.ev(() => { delete G.state.world.visited.juegos; G.goto('villa', 1, 14, 'left'); }); await g.fieldIdle('villa');
    await g.page.keyboard.down('ArrowLeft'); await g.until(() => G.field.mapId === 'camino_juegos', null, 'the path'); await g.page.keyboard.up('ArrowLeft');
    await g.fieldIdle('camino_juegos'); await g.shot('path');
    check('paths: the path has things to meet (animals, something to pick up, a signpost)', await g.ev(() => G.animals.here().length > 0 && G.carry.SOURCES.some(s => s.map === 'camino_juegos') && (G.field.def.posts || []).length === 2));
    await g.ev(() => { const p = G.field.player; p.x = 1; p.y = 6; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowLeft'); await g.until(() => G.field.mapId === 'juegos', null, 'the playground'); await g.page.keyboard.up('ArrowLeft');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await g.frames(80); await g.shot('new_place');
    check('paths: arriving in a new zone: "¡Nuevo lugar!", and it is visited (saved)', await g.ev(() => G.zones.visited('juegos')));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the new place card');
    check('paths: in the zone, the guide suggests something near (Lola, the dog\'s spot)', await g.ev(() => /lola|dog spot/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    check('paths: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function bus(browser) {
  const { ctx, g } = await open(browser, 'world-bus', true);
  try {
    await fresh(g, { map: 'juegos', x: 33, y: 13, demo: true }); // (near the park's bus stop)
    await g.drive(() => G.top() === G.field && !G.field.locked && G.field.mapId === 'juegos', 'arriving');
    check('bus: arriving made the zone a bus destination; a place not walked to is not', await g.ev(() => !G.zones.visited('playa') && G.zones.visited('juegos')));
    await g.ev(() => G.zones.visit('villa'));
    // the ghost hand shows the bus stop once two places are visited
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'bus' || G.demo.shown('bus'), null, 'the bus stop demo', 30000);
    check('bus: a ghost hand taps the bus stop the first time (two places visited)', await g.ev(() => G.demo.shown('bus')));
    const b = await g.ev(() => G.zones.def('juegos').bus.at);
    await g.tapTile(b[0], b[1]);
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(30); await g.shot('worldmap');
    check('bus: the world map: visited places in colour, the others "?"', await g.ev(() => G.top().rects().length === 6 && G.zones.visitedIds().join() === 'villa,juegos'));
    // a "?" place: footprints, then the guide suggests the way on foot
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'playa')));
    await g.frames(20); await g.shot('worldmap_walk');
    await g.until(() => G.top() === G.field, null, 'back on the map');
    check('bus: a "?" place is asked for (not travelled to), and the guide shows the way on foot', await g.ev(() => G.zones.want() === 'playa' && G.field.mapId === 'juegos' && /explore playa/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    // a visited place: the bus takes you
    await g.until(() => G.top() === G.field && !G.field.locked, null, 'free');
    await g.tapTile(b[0], b[1]);
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map again');
    await g.frames(10);
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'villa')));
    await g.until(() => !!G.zones.bus, null, 'the bus'); await g.frames(20); await g.shot('bus');
    await g.until(() => G.field.mapId === 'villa' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'arrived by bus', 30000);
    await g.shot('arrived');
    check('bus: the bus takes you to Villa Sol\'s bus stop, the dog with you', await g.ev(() => { const e = G.zones.def('villa').entry, p = G.field.player; return p.x === e.x && p.y === e.y && !p.hidden && !!G.pet.npc(G.field); }));
    // from the kid menu: the bus comes to you
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    check('bus: the kid menu has the world map', await g.ev(() => G.top().tiles().includes('map')));
    await g.tapRect(await g.ev(() => G.top().rect('map')));
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map from the menu');
    await g.frames(10);
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'juegos')));
    await g.until(() => G.field.mapId === 'juegos' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'to the playground by bus', 30000);
    check('bus: from the menu, the bus comes to you and takes you there', true);
    check('bus: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function zone(browser) {
  const { ctx, g } = await open(browser, 'world-zone', true);
  try {
    await fresh(g, { map: 'juegos', x: 11, y: 7 });
    await g.ev(() => { G.zones.visit('juegos'); G.zones.visit('villa'); for (const k of ['gato', 'conejo', 'gallina', 'pato']) G.words.meet(k, 't'); });
    await g.fieldIdle('juegos');
    // the dog's spot: tap it, he digs, something to pick up
    const sp = await g.ev(() => G.field.def.dogSpots[0].at);
    check('zone: the dog\'s spot has its paw-print bubble', await g.ev(() => G.zones.dogReady(G.field.def.dogSpots[0]) && !!G.zones.dogSpotAt(G.field, ...G.field.def.dogSpots[0].at)));
    // (under load the first tap can come before the map is ready for it: tap the spot again, up to three times)
    for (let k = 0; k < 3 && await g.ev(() => G.zones.dogReady(G.field.def.dogSpots[0])); k++) {
      await g.until(() => G.top() === G.field && !G.field.locked && !G.field.player.moving && G.fade.a === 0, null, 'free to tap the spot', 20000);
      await g.ev(sp => { const p = G.field.player; p.x = sp[0] - 1; p.y = sp[1] + 2; G.field.route = null; G.field.snapCam(); }, sp);
      await g.frames(4);
      await g.tapTile(sp[0], sp[1]);
      await g.until(() => !G.zones.dogReady(G.field.def.dogSpots[0]), null, 'the dog digging', 15000).catch(() => {});
    }
    await g.until(() => !G.zones.dogReady(G.field.def.dogSpots[0]), null, 'the dog digging', 15000);
    await g.until(() => !G.field.locked, null, 'done digging', 40000);
    await g.shot('dug');
    check('zone: the dog dug there and left something to pick up', await g.ev(() => G.carry.state().ground.some(it => it.map === 'juegos' && (it.id === 'palo' || it.id === 'pelota'))));
    // Lola
    await g.ev(() => { const n = G.field.npc('lola'), p = G.field.player; p.x = n.x - 2; p.y = n.y; G.field.snapCam(); });
    await g.frames(4);
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('lola'); return [n.x, n.y]; }));
    await g.drive(() => G.top() === G.field && !G.field.locked && G.zones.lolaTalked('juegos'), 'Lola');
    check('zone: Lola says hello and shows the place', await g.ev(() => G.zones.lolaTalked('juegos') && !G.field.npc('lola').alert()));
    // Nico's hide-and-seek here: hiding places in this zone
    check('zone: Nico has a hide-and-seek game in this zone', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await g.ev(() => { const n = G.field.npc('nico'), p = G.field.player; p.x = n.x + 2; p.y = n.y; G.field.snapCam(); });
    await g.frames(4);
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('nico'); return [n.x, n.y]; }));
    await g.drive(() => G.top() === G.field && !G.field.locked && G.seek.active(), 'Nico');
    check('zone: they hide in this zone\'s places, not in town', await g.ev(() => G.seek.list().length >= 2 && G.seek.list().every(h => G.zones.of(G.seek.SPOTS.find(s => s.id === h.spot).map) === 'juegos')));
    check('zone: Villa Sol\'s game is untouched', await g.ev(() => !G.state.seek.on));
    await g.frames(30); await g.shot('seek');
    // a zone's own quest line never waits for Villa Sol's chapter going on (La montaña's line, its own chapters done:
    // a test chapter added after them; every zone is built now, so no zone is left without a story)
    await g.ev(() => { G.seek.stop && G.seek.stop(); G.zones.visit('montana'); G.goto('montana', 5, 25, 'right'); });
    await g.fieldIdle('montana');
    await g.ev(() => {
      for (const id of G.chapters.ids()) if (G.chapters.lineOf(id) === 'montana') G.state.quests[id] = 'done';
      G.state.quests.c1 = 'done'; G.chapters.start('c2'); // (a Villa Sol chapter going on)
      G.chapters.add({ id: 'tmontana1', line: 'montana', title: 'Prueba', en: 'test', giver: 'lola', words: [], icon: 'montana', col: '#e04040' });
      G.chapters.script('tmontana1', [{ who: 'lola', run: function* () { yield 10; } }, { who: 'lola', run: function* () { yield 10; } }]);
    });
    check('zone: a zone\'s chapter (its own line) is offered while a Villa Sol chapter is going on', await g.ev(() => G.chapters.current() === 'c2' && G.chapters.next('montana') === 'tmontana1' && !G.chapters.gate('tmontana1') && !!G.field.npc('lola').alert()));
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('lola'); return [n.x, n.y]; }));
    await g.drive(() => G.chapters.active('tmontana1') || G.chapters.done('tmontana1'), 'the zone chapter (after Lola\'s greeting of the day)');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'its first beat');
    check('zone: both lines go on at once (Villa Sol\'s and the zone\'s)', await g.ev(() => G.chapters.current() === 'c2' && G.chapters.current('montana') === 'tmontana1' && G.chapters.lineHere() === 'montana'));
    check('zone: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function album(browser) {
  const { ctx, g } = await open(browser, 'world-album', true);
  try {
    await fresh(g);
    await g.fieldIdle('villa');
    await g.ev(() => G.animals.meet('conejo'));
    await g.until(() => G.album.discovering() && G.album.discovering().id === 'conejo', null, '"¡Nuevo animal!"');
    await g.frames(40); await g.shot('nuevo_animal');
    check('album: the first time an animal is met, "¡Nuevo animal!" pops in (never blocking the map)', await g.ev(() => G.top() === G.field));
    const r = await g.ev(() => ({ v: G.album.zoneCount('villa'), p: G.album.zoneCount('playa'), n: G.album.number('perro'), n2: G.album.number('cabra'), z: G.album.zoneOf('conejo') }));
    check('album: Pokédex counts per zone (Villa Sol 1/11, a zone still to come 0/7), numbers in world order', r.v.met === 1 && r.v.of === 11 && r.p.met === 0 && r.p.of === 7 && r.n === 1 && r.n2 === 11 && r.z === 'villa', JSON.stringify(r));
    await g.ev(() => G.album()); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(10); await g.shot('album_villa');
    check('album: a tab per zone (and Amigos)', await g.ev(() => G.top().tabs().join() === 'villa,playa,bosque,juegos,abuelos,montana,amigos'));
    await g.tapRect(await g.ev(() => G.top().tabRect(5)));
    check('album: La montaña\'s tab (the last zone built): its 8 animals as silhouettes', await g.ev(() => G.top().zone === 'montana' && G.top().ids().length === 8 && G.top().ids().every(Boolean)));
    await g.frames(6); await g.shot('album_montana');
    // a zone with animals still to come shows numbered "?" entries (every zone is built now: a planned page, pretended)
    check('album: a zone\'s planned animals are numbered "?" entries', await g.ev(() => { const z = G.zones.def('montana'), a = z.animals, p = z.planned; z.animals = a.slice(0, 2); z.planned = 5; const ids = G.album.entries('montana'), c = G.album.zoneCount('montana'); z.animals = a; z.planned = p; return ids.length === 7 && ids.slice(2).every(id => id === null) && ids.slice(0, 2).every(Boolean) && c.of === 7; }));
    await g.tapRect(await g.ev(() => G.top().tabRect(1)));
    check('album: a built zone\'s tab (La playa): its animals as silhouettes with a hint', await g.ev(() => G.top().zone === 'playa' && G.top().ids().length === 7 && G.top().ids().every(Boolean)));
    // a zone complete: "¡Completo!"
    await g.tapRect(await g.ev(() => G.top().tabRect(0)));
    await g.ev(() => { G.animals.list().forEach(id => G.animals.meet(id)); G.top().checkZone(); });
    check('album: Villa Sol complete: "¡Completo!" and a celebration, once', await g.ev(() => G.top().done > 0 && G.state.flags.dexDone.villa === 1));
    await g.frames(30); await g.shot('album_complete');
    // every zone built: no "?" left anywhere; meet them all and every tab is complete (Villa Sol and the five zones)
    check('album: all five zones are built (no planned "?" entries left)', await g.ev(() => G.zones.ids().filter(id => id !== 'villa').length === 5 && G.zones.ids().every(id => !G.zones.def(id).planned && G.album.entries(id).length > 0 && G.album.entries(id).every(Boolean))));
    for (let k = 1; k <= 5; k++) { await g.tapRect(await g.ev(k => G.top().tabRect(k), k)); await g.ev(() => G.top().checkZone()); await g.frames(4); }
    const done = await g.ev(() => G.zones.ids().map(id => [id, G.album.zoneCount(id), (G.state.flags.dexDone || {})[id]]));
    check('album: every tab complete: Villa Sol and the five zones, each with "¡Completo!"', done.length === 6 && done.every(([id, c, d]) => c.of > 0 && c.met === c.of && d === 1), JSON.stringify(done));
    await g.frames(20); await g.shot('album_all_complete');
    check('album: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// nothing the arrow points at hides under a corner button (docs/AUDIT_2026-10.md H10: the grandparents' bus stop under the
// deck of cards, a tap where the arrow pointed opened the menu). Every map's ways out, bus stops, the dog's spots,
// people, side jobs, hiding places, things to pick up and the story's places, seen from every tile she can stand on
// with it on screen: wherever it falls under a corner button, the arrow is drawn clear of the button and a tap on the
// target goes to the target (guide.js wins); and no bus stop is under one while she walks along its row
async function corners(browser) {
  const { ctx, g } = await open(browser, 'world-corners', true);
  try {
    await fresh(g); await g.fieldIdle('villa');
    const r = await g.ev(() => {
      const T = G.TILE, targets = {}, add = (m, at, kind) => { if (G.maps[m] && Array.isArray(at)) (targets[m] = targets[m] || []).push({ x: at[0], y: at[1], kind }); };
      for (const m in G.maps) {
        const d = G.maps[m];
        for (const e of d.exits || []) if (e.to) add(m, [e.x, e.y], 'the way to ' + e.to);
        for (const sp of d.dogSpots || []) add(m, sp.at, 'dog spot ' + sp.id);
        for (const n of d.npcs || []) if (n.id !== 'canelo') add(m, [n.x, n.y], n.id);
      }
      for (const z of G.zones.LIST) if (z.bus) add(z.bus.map, z.bus.at, 'bus stop');
      for (const sp of G.errands.SPOTS) add(sp.map, sp.at, 'job ' + sp.id);
      for (const sp of G.seek.SPOTS) add(sp.map, sp.at, 'hiding place ' + sp.id);
      for (const s of G.carry.SOURCES) add(s.map, s.at, 'thing ' + s.id);
      for (const id of G.chapters.ids()) { const sc = G.chapters.scriptOf(id); if (sc) for (const b of sc.beats) for (const sp of b.spots || (b.spot ? [b.spot] : [])) add(sp.map, sp.at, 'story ' + id); }
      const out = { n: 0, maps: 0, under: 0, row: [], bad: [] }, hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      for (const m in targets) {
        const f = G.goto(m, 1, 1, 'down'); G.fade.a = 0; G.fade.target = 0; out.maps++;
        const walk = (x, y) => { if (y < 0 || y >= f.map.h || x < 0 || x >= f.map.w) return false; const t = G.TERRAIN[f.map.get(x, y)] || G.TERRAIN['.']; return !(t.block || t.wall); };
        const R = f.corners();
        for (const t of targets[m]) {
          out.n++;
          for (let py = t.y - 9; py <= t.y + 9; py++) for (let px = t.x - 14; px <= t.x + 14; px++) {
            if (!walk(px, py)) continue;
            Object.assign(f.player, { x: px, y: py }); f.snapCam();
            const sx = t.x * T + 12 - Math.round(f.cam.x), sy = t.y * T + 12 - Math.round(f.cam.y);
            const box = { x: sx - 12, y: sy - 32, w: 24, h: 44 }, c = R.find(q => hit(box, q)); // (its spot: the tile and the sign or head over it)
            if (!c || sx < 0 || sx >= G.W || sy < 0 || sy >= G.H) continue;
            out.under++;
            if (t.kind === 'bus stop' && Math.abs(py - t.y) <= 1) out.row.push(m + ' (' + t.x + ',' + t.y + ') from ' + px + ',' + py);
            const a = G.guide.at = G.guide.place(f, { why: 'test', pts: [{ x: t.x * T + 12, y: t.y * T + 12, lift: 24 }] });
            const tap = { x: Math.round((Math.max(box.x, c.x) + Math.min(box.x + box.w, c.x + c.w)) / 2), y: Math.round((Math.max(box.y, c.y) + Math.min(box.y + box.h, c.y + c.h)) / 2) };
            const drawn = a.edge ? null : { x: a.x - 8, y: a.up ? a.y : a.y - 20, w: 16, h: 20 };
            if (a.edge && sy >= 6) out.bad.push(m + ' ' + t.kind + ' from ' + px + ',' + py + ': an edge arrow for a target on screen');
            else if (drawn && R.some(q => hit(drawn, q))) out.bad.push(m + ' ' + t.kind + ' from ' + px + ',' + py + ': the arrow on a corner button');
            else if (!a.edge && !G.guide.wins(f, tap)) out.bad.push(m + ' ' + t.kind + ' from ' + px + ',' + py + ': a tap at ' + tap.x + ',' + tap.y + ' goes to the button');
          }
        }
      }
      G.guide.at = null;
      return out;
    });
    console.log('    ' + r.n + ' places on ' + r.maps + ' maps; under a corner button from ' + r.under + ' spots');
    check('corners: no bus stop sits under a corner button while she walks along its row (the grandparents\' stop moved down)', !r.row.length, r.row.join('; '));
    check('corners: wherever a place falls under a corner button, the arrow is drawn clear of it and a tap on the place goes to the place', !r.bad.length, r.bad.slice(0, 8).join('; '));
    // for real: the way out at the top of the grandparents' place (under the deck when she's a few steps to its left),
    // the arrow on it (the beach asked for on the world map): a tap there walks out, the menu stays shut
    await g.ev(() => { delete G.state.world.visited.playa; G.zones.visit('abuelos'); G.state.world.want = 'playa'; G.goto('abuelos', 24, 1, 'right'); });
    await g.fieldIdle('abuelos'); await g.frames(10);
    const a = await g.ev(() => { const a = G.guide.at, r = G.field.corners()[0]; return a && { why: a.why, tx: a.tx, ty: a.ty, x: a.x, y: a.y, up: a.up, under: a.tx >= r.x && a.tx < r.x + r.w && a.ty >= r.y && a.ty < r.y + r.h }; });
    check('corners: the arrow points at the way out, under the deck of cards', !!a && /explore playa/.test(a.why) && a.under && a.up && a.y > 30, JSON.stringify(a));
    await g.shot('exit_under_deck');
    await g.tap(a.tx, a.ty);
    await g.until(() => G.top().constructor.name === 'FieldMenu' || G.field.mapId === 'camino_abuelos', null, 'the tap on the way out', 20000);
    check('corners: the tap went to the way out (not the menu)', await g.ev(() => G.field.mapId === 'camino_abuelos' && G.top().constructor.name !== 'FieldMenu'));
    check('corners: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function saves(browser) {
  const { ctx, g } = await open(browser, 'world-save', true);
  try {
    await g.ev(() => { localStorage.clear(); });
    await fresh(g, { dog: 'Coco', map: 'bosque', x: 18, y: 20 });
    await g.drive(() => G.top() === G.field && !G.field.locked && G.field.mapId === 'bosque', 'arriving');
    await g.ev(() => { G.zones.visit('villa'); G.state.world.want = 'montana'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'bosque', null, 'back in the forest');
    const r = await g.ev(() => ({ dog: G.dogName(), v: G.zones.visitedIds(), want: G.zones.want(), map: G.field.mapId }));
    check('save: the dog\'s name, the places visited, the place asked for and where you were are all kept', r.dog === 'Coco' && r.v.join() === 'villa,bosque' && r.want === 'montana' && r.map === 'bosque', JSON.stringify(r));
    check('save: an older save (no world, no dog name) loads: Villa Sol, "Canelo"', await g.ev(() => { const s = G.st.read(1); delete s.world; delete s.dogName; G.store.set(G.st.slotKey(2), s); const t = G.st.read(2); return t.dogName === null && typeof t.world === 'object'; }));
    check('save: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); // (ONLY=corners,skip: some sections)
run('the open world', [['naming the dog', naming], ['skip: go explore', skip], ['no word budget', budget], ['paths to every zone', paths], ['bus and world map', bus], ['nothing under the corner buttons', corners], ['in a zone', zone], ['the album by zone', album], ['save and load', saves]].filter(([n]) => !ONLY.length || ONLY.some(o => n.includes(o))));
