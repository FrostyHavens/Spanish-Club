// El parque de juegos (content/es/zone-juegos.js, docs/WORLD_PLAN.md): walking in from Villa Sol and the bus, every
// place reachable, the park's animals (a tap meets an unmet one through Lola's puzzle, the ants march in a line, the
// cricket at night, the album page), the actions (tap yourself: "¿Qué hago?" and you do it), the playground's rides
// (swings, slide, climbing frame, seesaw, merry-go-round), the story by taps (Simón dice, Pablo's kite, the
// playground), the side quests (Ana's jump rope and Simón dice, Pablo's ball, Don Chuy's bubbles and the wand), the
// dog's things to do (dig a ball, the jumping course, chase the pigeons), hide-and-seek, a page puzzle, save and load.
// NODE_PATH=$(npm root -g) node tools/test-zone-juegos.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked;
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); if (!o.demo) G.demo.skip();
  if (o.visit !== false) { G.zones.visit('villa'); G.zones.visit('juegos'); }
  for (const w of o.words || []) G.words.meet(w, 't');
  G.goto(o.map || 'juegos', o.x == null ? 20 : o.x, o.y == null ? 9 : o.y, 'down');
}, o);
const idle = (g, map = 'juegos') => g.fieldIdle(map);
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
const VERBS = ['corre', 'salta', 'gira', 'baila'];

// ---------- walking in from Villa Sol, every place reachable, the bus ----------
async function walkIn(browser) {
  const { ctx, g } = await open(browser, 'juegos-walk', true);
  try {
    await fresh(g, { visit: false, map: 'villa', x: 1, y: 14 });
    await idle(g, 'villa');
    await g.page.keyboard.down('ArrowLeft'); await g.until(() => G.field.mapId === 'camino_juegos', null, 'the path to the park'); await g.page.keyboard.up('ArrowLeft');
    await g.fieldIdle('camino_juegos');
    await g.ev(() => { const p = G.field.player; p.x = 1; p.y = 6; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowLeft'); await g.until(() => G.field.mapId === 'juegos', null, 'the park'); await g.page.keyboard.up('ArrowLeft');
    await g.until(() => G.top().constructor.name === 'NewPlace', null, '"¡Nuevo lugar!"');
    await drv(g, () => G.top() === G.field && !G.field.locked && G.field.mapId === 'juegos', 'the new place card');
    check('walk: from Villa Sol along the path into the park: "¡Nuevo lugar!", visited', await g.ev(() => G.zones.visited('juegos') && G.field.player.x >= 36));
    await g.frames(30); await g.shot('park_arrival');
    const r = await g.ev(() => ({ kinds: [...new Set(G.animals.here().map(a => a.kind))], ppl: ['lola', 'nico', 'ana', 'pablo', 'chuy'].filter(id => G.field.npc(id)), why: (G.guide.goal(G.field) || {}).why || '' }));
    check('walk: the park has its animals by day (pigeons, ladybugs, ants, bees, lizards, worms; no cricket)', ['paloma', 'catarina', 'hormiga', 'abeja', 'lagartija', 'lombriz'].every(k => r.kinds.includes(k)) && !r.kinds.includes('grillo'), JSON.stringify(r.kinds));
    check('walk: its people are there (Lola, Nico, Ana, Pablo, Don Chuy)', r.ppl.length === 5, JSON.stringify(r.ppl));
    check('walk: the guide suggests something here (Lola first)', /lola/.test(r.why), r.why);
    const reach = await g.ev(() => {
      const f = G.field, key = (a, b) => a + ',' + b, q = [[38, 13]], vis = new Set([key(38, 13)]);
      for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + dx, nb = b + dy; if (vis.has(key(na, nb)) || na < 0 || nb < 0 || na >= f.map.w || nb >= f.map.h) continue; const t = G.TERRAIN[f.map.get(na, nb)]; if (t.block || t.wall) continue; vis.add(key(na, nb)); q.push([na, nb]); } }
      const P = G.MAPDATA.juegos.pos, nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].some(t => vis.has(key(...t)));
      const need = { ana: P.ana, pablo: P.pablo, chuy: P.chuy, lola: P.lola, nico: P.nico, bus: P.busIn, hill: P.hill, land: P.land, dog: P.dog, agility: P.agility, agilityEnd: P.agilityEnd, palomas: P.palomasDog };
      const out = Object.keys(need).filter(k => !vis.has(key(...need[k])));
      for (const s of G.juegos.RIDE_AT) if (!nb(s.at)) out.push(s.id);
      for (const s of G.carry.SOURCES.filter(s => s.map === 'juegos')) if (!vis.has(key(...s.at))) out.push(s.id);
      for (const s of G.seek.SPOTS.filter(s => s.map === 'juegos')) if (!nb(s.at)) out.push(s.id);
      for (const k in G.maps.juegos.pages) if (!vis.has(k)) out.push('page ' + k);
      return out;
    });
    check('walk: everyone, the rides, the hill, the dog\'s spots, things to pick up, hiding places and pages are all reachable', !reach.length, reach.join(','));
    // the bus back to Villa Sol and back to the park
    await g.ev(() => G.zones.visit('villa'));
    const b = await g.ev(() => G.zones.def('juegos').bus.at);
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
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'juegos')));
    await g.until(() => G.field.mapId === 'juegos' && !G.field.locked && G.fade.a === 0 && !G.zones.bus, null, 'the bus to the park', 30000);
    check('walk: the bus takes you to the park\'s stop (and back)', await g.ev(() => { const e = G.zones.def('juegos').entry, p = G.field.player; return p.x === e.x && p.y === e.y; }));
    // Lola: el columpio, and the playground
    await tapNpc(g, 'lola', 1, 0);
    await drv(g, () => free() && G.zones.lolaTalked('juegos'), 'Lola');
    check('walk: Lola says hello, shows the dog\'s spot and meets el columpio', await g.ev(() => G.words.met('columpio')));
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the animals: Lola names one you tap; the ants march; the cricket at night; the album page ----------
async function animals(browser) {
  const { ctx, g } = await open(browser, 'juegos-animals', true);
  try {
    await fresh(g, { x: 34, y: 16 });
    await idle(g);
    await g.ev(() => { const a = G.animals.find('paloma'); a.x = 34 * 24 + 12; a.y = 18 * 24 + 18; a.st = 'idle'; a.t = 999; a.react = 50; });
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('paloma'))));
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Lola naming the pigeon');
    await g.frames(10); await g.shot('lola_names_pigeon');
    await drv(g, () => free() && G.words.met('paloma'), 'Lola\'s puzzle');
    check('animals: tapping an unmet park animal: Lola names it; la paloma is met and in the album', await g.ev(() => G.words.met('paloma') && G.animals.met('paloma')));
    const ants = await g.ev(() => { const f = G.field; for (let i = 0; i < 600; i++) { G.frame++; G.animals.update(f); } const L = f.zoo.list.filter(a => a.kind === 'hormiga'); let gap = 0; for (let i = 1; i < L.length; i++) gap = Math.max(gap, Math.hypot(L[i].x - L[i - 1].x, L[i].y - L[i - 1].y)); return { n: L.length, gap }; });
    check('animals: the ants march in a line (each close behind the one before)', ants.n >= 5 && ants.gap < 16, JSON.stringify(ants));
    await g.ev(() => { const a = G.animals.find('hormiga'), p = G.field.player; p.x = Math.floor(a.x / 24); p.y = Math.floor(a.y / 24) + 2; G.field.snapCam(); });
    await g.frames(6); await g.shot('ants');
    const nightK = await g.ev(() => { const ok = G.zones.timeOk; G.zones.timeOk = () => true; G.field.zoo = null; const k = G.animals.here().map(a => a.kind); G.zones.timeOk = ok; return k; });
    check('animals: at night crickets come out on the hill; in the morning a hummingbird at the flowers', nightK.filter(k => k === 'grillo').length >= 2 && nightK.includes('colibri'), JSON.stringify(nightK));
    const hop = await g.ev(() => { const a = G.animals.find('grillo'); let hopped = false; for (let i = 0; i < 3000 && !hopped; i++) { G.frame++; G.animals.update(G.field); if (a.z > 2) hopped = true; } return hopped; });
    check('animals: the cricket hops', hop);
    await g.ev(() => { G.debug.sunsetAt = 0; G.field.zoo = null; const p = G.field.player; p.x = 22; p.y = 12; G.field.snapCam(); });
    await g.frames(240); await g.shot('park_night');
    await g.ev(() => { G.debug.sunsetAt = null; G.field.zoo = null; });
    check('album: the park\'s page has its 8 animals, numbered after the forest\'s; rare and habitats marked', await g.ev(() => { const z = G.zones.def('juegos'); return z.animals.length === 8 && G.album.entries('juegos').length === 8 && z.rare.grillo === 'noche' && z.rare.colibri === 'manana' && Object.values(z.habitat).every(G.iconDrawn) && G.album.number('paloma') === G.album.zoneStart('juegos') + 1 && G.album.zoneStart('juegos') > G.album.zoneStart('bosque'); }));
    check('words: every park word has its own picture', await g.ev(() => Object.keys(G.data.words).filter(k => ['acciones', 'juegosparque', 'bichos'].includes(G.data.words[k].topic)).every(G.iconDrawn)));
    await g.ev(() => G.album('juegos')); await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(12); await g.shot('album_juegos');
    await g.ev(() => { G.pop(); });
    check('animals: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the actions (tap yourself) and the playground's rides ----------
async function rides(browser) {
  const { ctx, g } = await open(browser, 'juegos-rides', true);
  try {
    await fresh(g, { x: 20, y: 9, demo: true, words: VERBS.concat(['columpio', 'resbaladilla', 'subibaja', 'sube', 'baja']) });
    await g.ev(() => { const d = G.state.flags.demo || (G.state.flags.demo = {}); for (const k of G.demo.KINDS) if (k !== 'meact') d[k] = 1; });
    await idle(g);
    await g.until(() => G.demo.shown('meact'), null, 'the ghost hand tapping you', 30000);
    await g.frames(10); await g.shot('demo_meact');
    await g.until(() => !G.demo.cur, null, 'the demo over');
    // tap yourself: "¿Qué hago?" -> pick one -> you do it (the dog too)
    await g.tapTile(...await g.ev(() => [G.field.player.x, G.field.player.y]));
    await g.until(() => G.top().constructor.name === 'Choice', null, '"¿Qué hago?"');
    await g.frames(10); await g.shot('que_hago');
    const pick = await g.ev(() => { const s = G.top(); return { rects: s.rects(), words: s.ch.map(c => c.word) }; });
    check('act: tapping yourself asks "¿Qué hago?" with action words (the mic is on for them)', pick.words.length >= 3 && pick.words.every(w => ['corre', 'salta', 'gira', 'baila', 'sube', 'baja'].includes(w)), JSON.stringify(pick.words));
    const k = pick.words.indexOf('salta') >= 0 ? pick.words.indexOf('salta') : 0;
    await g.tapRect(pick.rects[k]);
    await g.until(() => G.field.player.act && G.frame - G.field.player.act.f0 > 18, null, 'you doing it');
    await g.shot('you_do_it');
    check('act: you do the action you picked (and the others near you)', await g.ev(w => G.field.player.act.k === w, pick.words[k]));
    await g.until(() => free(), null, 'done');
    // corre, a run: out and back, on the same tile at the end
    const back = await g.ev(() => { const p = G.field.player, x = p.x, y = p.y; const a = G.juegos.start(G.field, p, 'corre'); return { D: a.D, x, y }; });
    await g.frames(30); await g.shot('corre');
    await g.until(() => !G.field.player.act || G.frame - G.field.player.act.f0 >= G.field.player.act.len, null, 'the run over');
    check('act: ¡corre! runs out and back', back.D >= 24 && await g.ev(b => G.field.player.x === b.x && G.field.player.y === b.y, back));
    // the rides: tap each one
    const ride = async (id, sx, sy, kind, label) => {
      const at = await g.ev(id => G.juegos.RIDE_AT.find(s => s.id === id).at, id);
      await tapAt(g, at[0], at[1], sx, sy);
      await g.ev(kind => { window.__kind = kind; }, kind);
      await g.until(() => G.field.player.ride && G.field.player.ride.kind === window.__kind, null, 'riding ' + kind, 20000);
      await g.frames(40); await g.shot(label);
      await drv(g, () => free() && !G.field.player.ride, 'the ride ' + kind);
    };
    await ride('swing0', 16, 4, 'swing', 'swing');
    await ride('slide', 20, 3, 'slide', 'slide');
    check('rides: the slide lands you at its end', await g.ev(() => { const L = G.MAPDATA.juegos.pos.land, p = G.field.player; return p.x === L[0] && (p.y === L[1] || p.y === L[1] + 1); }));
    await ride('frame', 25, 4, 'frame', 'climbing_frame');
    await ride('saw0', 15, 7, 'seesaw', 'seesaw');
    await ride('mgr2', 22, 7, 'mgr', 'merry_go_round');
    check('rides: each ride counted today (swing, slide, frame, seesaw, merry-go-round)', await g.ev(() => { const r = G.juegos.ridesToday(); return ['swing', 'slide', 'frame', 'seesaw', 'mgr'].every(k => r[k] >= 1); }));
    check('rides: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story, by taps ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'juegos-story', true);
  try {
    await fresh(g, { x: 20, y: 9 });
    await idle(g);
    check('story: Ana has the chapter in her bubble (the park\'s quest line)', await g.ev(() => G.chapters.next('juegos') === 'juegos1' && !G.chapters.gate('juegos1') && !!G.field.npc('ana').alert()));
    await g.shot('ana_waits');
    await tapNpc(g, 'ana', 0, 1);
    await drv(g, () => G.field.npc('ana').act && G.field.npc('ana').act.k === 'corre' && G.frame - G.field.npc('ana').act.f0 > 12, 'Ana running');
    await g.frames(20); await g.shot('ana_runs');
    await g.until(() => G.field.player.act && G.field.player.act.k === 'corre' || free(), null, 'everyone runs', 60000).catch(() => {});
    await drv(g, () => free() && G.chapters.state().step.juegos1 === 1, 'Ana: corre, salta');
    check('story 1: corre and salta met (Ana shows them, then everyone does it); Pablo next', await g.ev(() => G.words.met('corre') && G.words.met('salta') && /juegos1/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    await tapNpc(g, 'pablo', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.juegos1 === 2, 'Pablo: gira, baila');
    check('story 1: gira and baila met', await g.ev(() => G.words.met('gira') && G.words.met('baila')));
    await tapNpc(g, 'ana', 0, 1);
    await drv(g, () => G.top().constructor.name === 'Choice' && /Simón dice/.test(G.top().o.prompt || ''), 'Simón dice');
    await g.frames(10); await g.shot('simon_dice');
    await drv(g, () => free() && G.chapters.done('juegos1'), 'Simón dice');
    check('story 1 done: you were Simón; chapter 2 opens (Pablo\'s bubble)', await g.ev(() => G.chapters.done('juegos1') && G.chapters.next('juegos') === 'juegos2' && !!G.field.npc('pablo').alert()));
    // 2 · Pablo's kite
    await g.shot('kite_in_tree');
    await tapNpc(g, 'pablo', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.juegos2 === 1, 'Pablo: el papalote');
    check('story 2: el papalote met; Pablo waits by the climbing frame', await g.ev(() => { const pb = G.field.npc('pablo'), F = G.MAPDATA.juegos.pos.frame; return G.words.met('papalote') && pb.x === F[0] - 1 && pb.y === F[1] + 1; }));
    const fr = await g.ev(() => G.MAPDATA.juegos.pos.frame);
    await tapAt(g, fr[0] + 1, fr[1], fr[0] + 1, fr[1] + 1);
    await g.until(() => G.chapters.ctx('juegos2').data.got, null, 'up the frame: the kite', 60000).catch(() => {});
    await drv(g, () => G.chapters.ctx('juegos2').data.got, 'sube');
    await g.frames(10); await g.shot('kite_got');
    await drv(g, () => free() && G.chapters.state().step.juegos2 === 2, 'baja');
    check('story 2: sube and baja met; the kite in your hands', await g.ev(() => G.words.met('sube') && G.words.met('baja') && G.errands.bag.has('papalote', { q: 'juegos2' })));
    await tapNpc(g, 'pablo', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.juegos2 === 3, 'to the hill');
    const hill = await g.ev(() => G.MAPDATA.juegos.pos.hill);
    await tapAt(g, hill[0], hill[1], hill[0], hill[1] + 1);
    await g.until(() => !!G.juegos.kite, null, 'the kite flying', 60000).catch(() => {});
    await drv(g, () => G.chapters.ctx('juegos2').data.flew, 'corre, rápido');
    await g.frames(10); await g.shot('kite_flies');
    await drv(g, () => free() && G.chapters.done('juegos2'), 'despacio');
    check('story 2 done: rápido and despacio met; Pablo flies his kite on the hill', await g.ev(() => G.chapters.done('juegos2') && G.words.met('rapido') && G.words.met('despacio') && !G.errands.bag.has('papalote')));
    await g.frames(20); await g.shot('pablo_kite_hill');
    // 3 · the playground
    await tapNpc(g, 'ana', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.juegos3 === 1, 'Ana: la resbaladilla');
    const sl = await g.ev(() => G.MAPDATA.juegos.pos.slide);
    await tapAt(g, sl[0], sl[1], sl[0] - 1, sl[1]);
    await drv(g, () => free() && G.chapters.state().step.juegos3 === 2, 'the slide: sube, baja');
    check('story 3: la resbaladilla, el columpio met; you slid down', await g.ev(() => G.words.met('resbaladilla') && G.words.met('columpio')));
    await tapAt(g, 17, 3, 17, 2);
    await g.until(() => G.field.npc('pablo').ride && G.field.npc('pablo').ride.amp > 0.3, null, 'pushing Pablo', 60000).catch(() => {});
    await drv(g, () => G.field.npc('pablo').ride && G.field.npc('pablo').ride.amp > 0.3, 'empuja');
    await g.frames(20); await g.shot('push_pablo');
    await drv(g, () => free() && G.chapters.state().step.juegos3 === 3, 'the swing: empuja');
    check('story 3: empuja and el subibaja met', await g.ev(() => G.words.met('empuja') && G.words.met('subibaja')));
    await tapAt(g, 16, 7, 15, 7);
    await g.until(() => G.field.player.ride && G.field.player.ride.kind === 'seesaw', null, 'the seesaw', 30000);
    await g.frames(30); await g.shot('seesaw_ana');
    await drv(g, () => free() && G.chapters.done('juegos3'), 'the seesaw: sube, baja');
    check('story 3 done: the whole playground', await g.ev(() => G.chapters.done('juegos3')));
    check('story: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- side quests: Ana's rope and Simón dice, Pablo's ball, Don Chuy's bubbles ----------
async function side(browser) {
  const { ctx, g } = await open(browser, 'juegos-side', true);
  try {
    await fresh(g, { x: 20, y: 9, words: VERBS });
    await g.ev(() => { G.state.quests.juegos1 = 'done'; });
    await idle(g);
    check('side: after chapter 1, Ana has her jump rope in her bubble', await g.ev(() => { const a = G.field.npc('ana').alert(); return a && a.icon === 'cuerda'; }), await g.ev(() => JSON.stringify(G.field.npc('ana').alert())));
    await g.frames(30); await g.shot('ana_rope');
    await tapNpc(g, 'ana', 0, 1);
    await drv(g, () => free() && G.juegos.state().rope.done, 'the jump rope');
    check('side: la cuerda met; five jumps: done for today', await g.ev(() => G.words.met('cuerda') && G.juegos.state().rope.n === 5 && G.juegos.state().ropes === 1));
    check('side: then Ana offers Simón dice', await g.ev(() => { const a = G.field.npc('ana').alert(); return a && a.icon === 'corre'; }));
    await tapNpc(g, 'ana', 0, 1);
    await drv(g, () => free() && G.juegos.state().simon.done, 'Simón dice');
    check('side: Simón dice played', await g.ev(() => G.juegos.state().simons === 1));
    // Pablo's ball (his chapters done: his bubble is the ball)
    await g.ev(() => { G.state.quests.juegos2 = 'done'; G.state.quests.juegos3 = 'done'; });
    check('side: Pablo has a ball in his bubble', await g.ev(() => { const a = G.field.npc('pablo').alert(); return a && a.icon === 'pelota'; }));
    await tapNpc(g, 'pablo', 0, 2);
    await g.until(() => !!G.juegos.ball, null, 'the ball flying', 60000).catch(() => {});
    await drv(g, () => !!G.juegos.ball, 'lanza');
    await g.shot('ball_flies');
    await drv(g, () => free() && G.juegos.state().ball.done, 'the ball game');
    check('side: lanza, atrapa (and la pelota) met; the ball game done', await g.ev(() => G.words.met('lanza') && G.words.met('atrapa') && G.words.met('pelota') && G.juegos.state().balls === 1));
    // Don Chuy's bubbles
    check('side: Don Chuy has bubbles in his bubble', await g.ev(() => { const a = G.field.npc('chuy').alert(); return a && a.icon === 'burbujas'; }));
    await tapNpc(g, 'chuy', 0, 1);
    await drv(g, () => free() && !!G.juegos.bub, 'Don Chuy: las burbujas');
    check('side: las burbujas met; the bubbles float; the guide points at one', await g.ev(() => G.words.met('burbujas') && /bubbles/.test((G.guide.goal(G.field) || {}).why || '')));
    await g.frames(30); await g.shot('bubbles');
    for (let k = 0; k < 12 && await g.ev(() => !!G.juegos.bub && G.juegos.bub.n < 6); k++) {
      const pt = await g.ev(() => { const o = G.juegos.bub.list.find(o => !o.pop && o.t > 10), f = G.field; return o ? [o.x - Math.round(f.cam.x), o.y - 14 - Math.round(f.cam.y)] : null; });
      if (pt) await g.tap(pt[0], pt[1]); else await g.frames(30);
    }
    await drv(g, () => free() && G.juegos.state().bub.done, 'the bubbles caught');
    check('side: six bubbles caught; a bubble wand in your hands', await g.ev(() => G.juegos.state().bubbles === 1 && G.carry.held() && G.carry.held().id === 'burbujas'));
    await g.ev(() => { const p = G.field.player; p.x = 26; p.y = 13; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowLeft'); await g.frames(50); await g.page.keyboard.up('ArrowLeft');
    await g.frames(10); await g.shot('wand_trail');
    check('side: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog: dig in the sandbox, the jumping course, chase the pigeons ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'juegos-dog', true);
  try {
    await fresh(g, { x: 27, y: 9 });
    await idle(g);
    const spot = async (id, sx, sy) => { const sp = await g.ev(id => G.field.def.dogSpots.find(s => s.id === id).at, id); await tapAt(g, sp[0], sp[1], sx, sy); await g.until(id => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === id)), id, 'the dog at ' + id, 60000); await g.until(() => free(), null, 'done'); };
    const dg = await g.ev(() => G.MAPDATA.juegos.pos.dog);
    await spot('juegos_arena', dg[0], dg[1] + 1);
    check('dog: he digs in the sandbox and finds a ball', await g.ev(() => G.carry.state().ground.some(it => it.map === 'juegos' && it.id === 'pelota')));
    const ag = await g.ev(() => G.MAPDATA.juegos.pos.agility);
    await g.ev(ag => { const p = G.field.player; p.x = ag[0]; p.y = ag[1] - 1; G.field.snapCam(); }, ag);
    await g.frames(4); await g.tapTile(ag[0], ag[1]);
    await g.until(() => !!G.zones.hurdle, null, 'the dog at a hurdle', 60000);
    await g.frames(16); await g.shot('dog_hurdle');
    await g.until(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'juegos_brincos')) && free(), null, 'the course run', 60000);
    check('dog: he runs his jumping course (leaping each hurdle) and finds a stick at its end', await g.ev(() => { const e = G.MAPDATA.juegos.pos.agilityEnd; return G.carry.state().ground.some(it => it.map === 'juegos' && it.id === 'palo' && it.x === e[0]); }));
    const pd = await g.ev(() => G.MAPDATA.juegos.pos.palomasDog);
    await spot('juegos_palomas', pd[0], pd[1] - 1);
    check('dog: he chases the pigeons', await g.ev(() => !G.zones.dogReady(G.field.def.dogSpots.find(s => s.id === 'juegos_palomas'))));
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hide-and-seek in the park; a page puzzle; save and load ----------
async function seek(browser) {
  const { ctx, g } = await open(browser, 'juegos-seek', true);
  try {
    await fresh(g, { x: 24, y: 13, words: ['paloma', 'lagartija', 'conejo', 'gato'] });
    await idle(g);
    check('seek: Nico has a game in the park', await g.ev(() => { const a = G.seek.alert('nico'); return !!a && a.icon === 'lupa'; }));
    await tapNpc(g, 'nico', 1, 0);
    await drv(g, () => free() && G.seek.active(), 'Nico');
    const L = await g.ev(() => G.seek.list().map(h => ({ k: h.kind, s: h.spot, m: G.seek.SPOTS.find(s => s.id === h.spot).map })));
    check('seek: animals hide in the park\'s places', L.length >= 2 && L.every(h => h.m === 'juegos'), JSON.stringify(L));
    const h = await g.ev(() => { const h = G.seek.list()[0], sp = G.seek.SPOTS.find(s => s.id === h.spot), p = G.field.player; p.x = sp.at[0]; p.y = Math.min(25, sp.at[1] + 2); if (G.field.blocked(p.x, p.y, p)) p.x++; G.field.snapCam(); return h.spot; });
    await g.frames(200); await g.shot('seek_peek');
    const r = await g.ev(spot => { const x = G.seek.list().find(h => h.spot === spot); return G.seek.where(x, G.field); }, h);
    await g.tap(r.x + r.w / 2, r.y + 4);
    await g.ev(h => { window.__h = h; }, h);
    await drv(g, () => free() && G.seek.list().find(x => x.spot === window.__h).found, 'finding it');
    check('seek: found one peeking', await g.ev(spot => G.seek.list().find(h => h.spot === spot).found, h));
    // a page puzzle in the park (four known words of the actions page)
    await g.ev(() => { for (const w of ['corre', 'salta', 'baila', 'sube', 'baja']) { G.words.meet(w, 't'); G.state.words[w] = { learned: true }; } });
    const pg = await g.ev(() => Object.keys(G.maps.juegos.pages).find(k => G.maps.juegos.pages[k] === 'acciones').split(',').map(Number));
    check('page: the actions page\'s sparkle is ready', await g.ev(() => G.pages.ready('acciones')));
    await tapAt(g, pg[0], pg[1], pg[0], pg[1] + 1);
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    await g.frames(10); await g.shot('page_acciones');
    await drv(g, () => free(), 'the page puzzle');
    check('page: the park\'s page puzzle is solved', await g.ev(() => !G.pages.ready('acciones')));
    // save and load
    await g.ev(() => { const s = G.juegos.state(); s.ropes = 2; s.bubbles = 1; G.state.quests.juegos1 = 'done'; G.st.begin(1); G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.continueGame(1); });
    await g.until(() => G.field && G.field.mapId === 'juegos', null, 'back in the park');
    const s = await g.ev(() => ({ r: G.juegos.state().ropes, b: G.juegos.state().bubbles, q: G.chapters.done('juegos1'), w: G.words.met('paloma'), v: G.zones.visited('juegos') }));
    check('save: the park\'s games, chapters, words and visit are all kept', s.r === 2 && s.b === 1 && s.q && s.w && s.v, JSON.stringify(s));
    check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY; // (run one section: ONLY=side)
run('El parque de juegos', [['walking in, every place, the bus, Lola', walkIn], ['the animals and the album', animals], ['the actions and the rides', rides], ['the story by taps', story], ['side quests', side], ['the dog', dog], ['hide-and-seek, a page, save and load', seek]].filter(([n, f]) => !ONLY || f.name === ONLY));
