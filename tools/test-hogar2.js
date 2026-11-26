// En casa, chapters 3 and 4 (content/es/hogar-story2.js, docs/UNIT_EN_CASA.md): Los tacos de Papá and Agua de limón, played
// by taps from a game where chapters 1 and 2 are done and their ten words are met. Each new word is unmet before its puzzle
// and met one at a time, in order; a save reloaded in the middle of every beat goes on; nothing of a chapter stays in the
// bag after it; the real Mamá is still in her room at the end. Besides, after each beat the game is opened again from every
// copy of the save taken inside that beat (tools/hogar-util.js: after each heart, word met or thing put down) and played on by
// the arrow to the end of the beat; the last copy to the end of the chapter (a beat must never shut itself for good).
//   NODE_PATH=$(npm root -g) node tools/test-hogar2.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');
const { install, branches } = require('./hogar-util');

const TEN = ['elpapa', 'cocina', 'hambre', 'sopa', 'rico', 'mesa', 'silla', 'plato', 'vaso', 'cuchara'];

// a game with chapters 1 and 2 of the home line done and their ten words met (on an earlier day), standing in a map
const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0;
  window.__order = []; // every word as it is met, in order
  const meet0 = G.words.meet; G.words.meet = function (id) { const r = meet0.apply(this, arguments); if (r && !window.__order.includes(id)) window.__order.push(id); return r; };
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); G.demo.skip();
  G.zones.visit('villa');
  const y = new Date(G.now() - 864e5), ago = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  for (const w of o.words) { G.st.learn(w); Object.assign(G.words.rec(w), { mdate: ago, mdn: G.words.dayNum() - 1 }); }
  Object.assign(G.state.quests, { c1: 'done', hogar1: 'done', hogar2: 'done' }, o.quests || {});
  window.__order = [];
  G.st.begin(1);
  G.goto(o.map, o.x, o.y, 'down');
}, o);
const idle = (g, map) => g.fieldIdle(map);
async function drv(g, done, what, o) {
  try { await g.drive(done, what, o); } catch (e) {
    await g.shot('stuck');
    console.log('    (stuck: ' + await g.ev(() => JSON.stringify({ top: G.top().constructor.name, locked: G.field && G.field.locked, map: G.field && G.field.mapId, p: G.field && [G.field.player.x, G.field.player.y], step: G.chapters.state().step, goal: (G.guide.goal(G.field) || {}).why })) + ')');
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
// through a door by a tap on it, like a child (the exit tile, from a few tiles away)
async function through(g, from, to, ex, ey, sx, sy) {
  await g.ev(([sx, sy]) => { const p = G.field.player; p.x = sx; p.y = sy; G.field.snapCam(); }, [sx, sy]);
  await g.frames(4);
  await g.tapTile(ex, ey);
  await g.until(m => G.field && G.field.mapId === m && !G.field.locked && G.fade.a === 0, to, 'the door to ' + to);
  await idle(g, to);
}
// save, reload the page and continue the game: a save in the middle of a beat
async function reload(g, map) {
  g.all = (g.all || []).concat(await g.ev(() => window.__order));
  await g.ev(() => { G.st.begin(1); G.st.saveNow(); });
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.ev(() => { window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0; G.continueGame(1); });
  await g.until(m => G.field && G.field.mapId === m, map, 'back in ' + map);
  await idle(g, map);
  await install(g);
  await g.ev(() => { window.__order = []; const meet0 = G.words.meet; G.words.meet = function (id) { const r = meet0.apply(this, arguments); if (r && !window.__order.includes(id)) window.__order.push(id); return r; }; });
}
// a save made by the page itself the moment cond() is true (the middle of a beat: the beat's state, not its end)
const saveWhen = (cond) => `(() => { if (!(${cond})()) return false; G.st.begin(1); G.st.saveNow(); return true; })()`;
const goal = g => g.ev(() => { const x = G.guide.goal(G.field); return x ? { why: x.why, map: x.map || null, npc: x.pts && x.pts[0] && x.pts[0].npc ? x.pts[0].npc.id : null } : null; });
const met = (g, ids) => g.ev(ids => ids.map(id => G.words.met(id)), ids);
const order = async g => (g.all || []).concat(await g.ev(() => window.__order)).filter((w, i, a) => a.indexOf(w) === i).join();
const heldQ = g => g.ev(() => G.errands.bag.list().filter(it => it.q).map(it => it.id + ':' + it.q));

// ---------- 3 · Los tacos de Papá ----------
async function tacos(browser) {
  const { ctx, g } = await open(browser, 'hogar-tacos', true, { openPacing: true });
  try {
    await fresh(g, { words: TEN, map: 'patio', x: 4, y: 4 }); await install(g);
    await idle(g, 'patio');
    check('3: Leo has the taco in his bubble and the chapter may open', await g.ev(() => G.chapters.next('hogar') === 'hogar3' && !G.chapters.gate('hogar3') && G.field.npc('leo').alert() && G.field.npc('leo').alert().icon === 'taco'));
    check('3: none of its five words is met yet', (await met(g, ['hermano', 'tortilla', 'frijoles', 'taco', 'come'])).every(m => !m));
    await tapNpc(g, 'leo', 1, 0);
    // beat 0: "¡Tengo hambre!", hermano (one puzzle), he runs to the kitchen; saved in the middle (hermano met, Leo still here)
    await drv(g, saveWhen(`() => G.words.met('hermano') && G.chapters.state().step.hogar3 === 0`), 'Leo: hermano');
    check('3 beat 1: hermano is met, and only hermano', await order(g) === 'hermano', await order(g));
    await reload(g, 'patio');
    check('3 beat 1: a save in the middle: Leo is still in the yard with his bubble, hermano still met', await g.ev(() => G.words.met('hermano') && G.chapters.state().step.hogar3 === 0 && !!G.field.npc('leo') && !G.field.npc('leo').hidden && !!G.field.npc('leo').alert()));
    await tapNpc(g, 'leo', 1, 0);
    await drv(g, () => free() && G.chapters.state().step.hogar3 === 1, 'Leo runs ahead');
    check('3 beat 1 done: Leo is not in the yard now; the arrow goes to Papá in the kitchen; the five words: only hermano', await g.ev(() => !!G.field.npc('leo').hidden) && (await goal(g)).map === 'cocina' && JSON.stringify(await met(g, ['hermano', 'tortilla', 'frijoles', 'taco', 'come'])) === '[true,false,false,false,false]', JSON.stringify(await goal(g)));
    await g.shot('patio_leo_gone');
    await branches(g, 'hogar3', 0);
    await reload(g, 'patio');
    check('3: after a reload Leo is still in the kitchen, not in the yard', await g.ev(() => !!G.field.npc('leo').hidden));
    await through(g, 'patio', 'cocina', 3, 2, 3, 3);
    check('3: in the kitchen: Leo waits by the table (a guest), Papá has the bubble and the arrow', await g.ev(() => !!G.field.npc('leo_g') && !!G.field.npc('papa').alert()) && (await goal(g)).npc === 'papa', JSON.stringify(await goal(g)));
    await g.shot('kitchen_leo_waits');
    // beat 2: the tortilla (Papá flips it); saved the moment it is met
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, saveWhen(`() => G.words.met('tortilla') && G.chapters.state().step.hogar3 === 1`), 'Papá: tortilla');
    await g.shot('tortilla_flips');
    await reload(g, 'cocina');
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.hogar3 === 2, 'Papá: the tortilla in her hands');
    check('3 beat 2 done: tortilla met (and nothing else new); she holds the tortilla for the table; the arrow is on the table', await order(g) === 'hermano,tortilla' && JSON.stringify(await heldQ(g)) === '["tortilla:hogar3"]' && (await goal(g)).why.indexOf('hogar3:2') === 0, JSON.stringify(await goal(g)) + ' ' + await order(g));
    await branches(g, 'hogar3', 1);
    // beat 3: the tortilla on the table, the beans, the fold; saved when the beans are met
    const T = await g.ev(() => G.MAPDATA.cocina.pos.table);
    await tapAt(g, T[0] + 1, T[1], T[0] + 1, T[1] + 1);
    await drv(g, saveWhen(`() => G.words.met('frijoles') && G.chapters.state().step.hogar3 === 2`), 'the beans');
    await reload(g, 'cocina');
    check('3 beat 3: a save in the middle: the tortilla and the beans are on the table (state kept), taco not met yet', await g.ev(() => { const d = G.chapters.ctx('hogar3').data; return d.tort === 1 && !G.words.met('taco') && !G.errands.bag.has('tortilla'); }));
    await tapAt(g, T[0] + 1, T[1], T[0] + 1, T[1] + 1);
    await drv(g, () => free() && G.chapters.state().step.hogar3 === 3, 'the taco');
    await g.shot('taco_on_table');
    check('3 beat 3 done: frijoles then taco, one at a time; the taco is folded on the table; bag empty of the chapter\'s things', await order(g) === 'hermano,tortilla,frijoles,taco' && (await g.ev(() => G.chapters.ctx('hogar3').data.fold === 1)) && !(await heldQ(g)).length, await order(g));
    await branches(g, 'hogar3', 2);
    // beat 4: she tells Leo to eat; saved the moment come is met (the taco is still there)
    await tapAt(g, T[0] + 1, T[1], T[0] + 1, T[1] + 1);
    await drv(g, saveWhen(`() => G.words.met('come') && G.chapters.state().step.hogar3 === 3`), 'come, Leo');
    await g.shot('leo_eats');
    await reload(g, 'cocina');
    check('3 beat 4: a save in the middle: come is met; the taco is still on the table', await g.ev(() => G.words.met('come') && G.chapters.ctx('hogar3').data.fold === 1));
    await tapAt(g, T[0] + 1, T[1], T[0] + 1, T[1] + 1);
    await drv(g, () => free() && G.chapters.state().step.hogar3 === 4, 'Leo eats');
    check('3 beat 4 done: come is the last of the five, in order; the dog has the bubble', await order(g) === 'hermano,tortilla,frijoles,taco,come' && !!(await g.ev(() => G.pet.npc(G.field).alert())), await order(g));
    await branches(g, 'hogar3', 3);
    // beat 5: the dog
    await tapNpc(g, 'canelo', 1, 0).catch(async () => { await g.ev(() => { const n = G.pet.npc(G.field), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.home = [n.x, n.y]; }); await g.frames(4); await g.tapTile(...await g.ev(() => { const n = G.pet.npc(G.field); return [n.x, n.y]; })); });
    await drv(g, saveWhen(`() => G.chapters.ctx('hogar3').data.leoOut === 1 && !G.chapters.done('hogar3')`), 'the dog eats');
    await g.shot('dog_eats');
    await reload(g, 'cocina');
    const mid = await g.ev(() => ({ leoG: !!G.field.npc('leo_g'), done: G.chapters.done('hogar3') }));
    check('3 beat 5: a save in the middle: Leo is not a guest any more', !mid.leoG, JSON.stringify(mid));
    if (!mid.done) { await g.ev(() => { const n = G.pet.npc(G.field), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.home = [n.x, n.y]; }); await g.frames(4); await g.tapTile(...await g.ev(() => { const n = G.pet.npc(G.field); return [n.x, n.y]; })); }
    await drv(g, () => free() && G.chapters.done('hogar3'), 'the chapter\'s end');
    check('3 done: the five words in order, nothing of it in the bag, Papá back at the stove, the yard has Leo again', await order(g) === 'hermano,tortilla,frijoles,taco,come' && !(await heldQ(g)).length && await g.ev(() => { const p = G.field.npc('papa'); return p.x === 4 && p.y === 2; }));
    await branches(g, 'hogar3', 4);
    await through(g, 'cocina', 'patio', 11, 5, 10, 5);
    check('3: back in the yard Leo is there again', await g.ev(() => !!G.field.npc('leo') && !G.field.npc('leo').hidden));
    check('3: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- 4 · Agua de limón ----------
const FIVE = ['hermano', 'tortilla', 'frijoles', 'taco', 'come'];
async function limonada(browser) {
  const { ctx, g } = await open(browser, 'hogar-limon', true, { openPacing: true });
  try {
    await fresh(g, { words: TEN.concat(FIVE), map: 'casa', x: 4, y: 4, quests: { hogar3: 'done' } }); await install(g);
    await idle(g, 'casa');
    check('4: Mamá has the bubble (the lime) and the chapter may open; none of its five words is met', await g.ev(() => G.chapters.next('hogar') === 'hogar4' && !G.chapters.gate('hogar4') && G.field.npc('mama').alert() && G.field.npc('mama').alert().icon === 'limon') && (await met(g, ['lamama', 'sed', 'limon', 'aguacate', 'arroz'])).every(m => !m));
    // beat 1: lamama, then sed; saved when lamama is met
    await tapNpc(g, 'mama', 0, 1);
    await drv(g, saveWhen(`() => G.words.met('lamama') && G.chapters.state().step.hogar4 === 0`), 'Mamá: lamama');
    check('4 beat 1: lamama is met, alone', await order(g) === 'lamama', await order(g));
    await reload(g, 'casa');
    await tapNpc(g, 'mama', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.hogar4 === 1, 'Mamá: sed');
    check('4 beat 1 done: sed met after lamama; limon not yet', await order(g) === 'lamama,sed' && !(await met(g, ['limon']))[0], await order(g));
    await branches(g, 'hogar4', 0);
    // beat 2: the lime tree (in the yard)
    await g.ev(() => G.goto('patio', 8, 5, 'up')); await idle(g, 'patio');
    check('4: in the yard the arrow is on the lime tree', (await goal(g)).why.indexOf('hogar4:1') === 0, JSON.stringify(await goal(g)));
    await g.shot('lime_tree_bubble');
    await tapAt(g, 8, 3, 8, 4);
    await drv(g, `(() => G.top().constructor.name === 'Choice' && G.chapters.state().step.hogar4 === 1)()`, 'the lime puzzle');
    await g.frames(10); await g.shot('lime_puzzle');
    await drv(g, saveWhen(`() => G.words.met('limon') && G.chapters.state().step.hogar4 === 1`), 'the lime');
    await reload(g, 'patio');
    await tapAt(g, 8, 3, 8, 4);
    await drv(g, () => free() && G.chapters.state().step.hogar4 === 2, 'the lime in her hands');
    check('4 beat 2 done: limon met; she holds a lime for Papá', await order(g) === 'lamama,sed,limon' && JSON.stringify(await heldQ(g)) === '["limon:hogar4"]', await order(g));
    await branches(g, 'hogar4', 1);
    // beat 3: Papá, agua de limón
    await g.ev(() => G.goto('cocina', 10, 5, 'left')); await idle(g, 'cocina');
    check('4: in the kitchen Papá has the lime in his bubble and the arrow', (await goal(g)).npc === 'papa', JSON.stringify(await goal(g)));
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, saveWhen(`() => G.chapters.ctx('hogar4').data.juice === 1 && G.chapters.state().step.hogar4 === 2`), 'Papá squeezes it');
    await reload(g, 'cocina');
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.hogar4 === 3, 'agua de limón');
    check('4 beat 3 done: the glass is for Mamá (in her hands), the lime is gone', JSON.stringify(await heldQ(g)) === '["vaso:hogar4"]');
    await branches(g, 'hogar4', 2);
    // beat 4: Mamá drinks (her room)
    await g.ev(() => G.goto('casa', 7, 4, 'left')); await idle(g, 'casa');
    check('4: Mamá has the glass in her bubble', await g.ev(() => { return !!G.field.npc('mama').alert(); }));
    await tapNpc(g, 'mama', 0, 1);
    await drv(g, () => free() && G.chapters.state().step.hogar4 === 4, 'Mamá drinks');
    check('4 beat 4 done: nothing in the bag; Mamá is still at her place', !(await heldQ(g)).length && await g.ev(() => { const m = G.field.npc('mama'); return m.x === 3 && m.y === 2; }));
    await branches(g, 'hogar4', 3);
    // beat 5: the avocado
    await g.ev(() => G.goto('patio', 12, 5, 'up')); await idle(g, 'patio');
    check('4: in the yard the arrow is on the avocado tree', (await goal(g)).why.indexOf('hogar4:4') === 0, JSON.stringify(await goal(g)));
    await tapAt(g, 12, 3, 12, 4);
    await drv(g, saveWhen(`() => G.words.met('aguacate') && G.chapters.state().step.hogar4 === 4`), 'the avocado');
    await reload(g, 'patio');
    await tapAt(g, 12, 3, 12, 4);
    await drv(g, () => free() && G.chapters.state().step.hogar4 === 5, 'the avocado in her hands');
    check('4 beat 5 done: aguacate met, held for Papá; arroz not yet', await order(g) === 'lamama,sed,limon,aguacate' && JSON.stringify(await heldQ(g)) === '["aguacate:hogar4"]', await order(g));
    await branches(g, 'hogar4', 4);
    // beat 6: rice, then the family at the table
    await g.ev(() => G.goto('cocina', 10, 5, 'left')); await idle(g, 'cocina');
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, saveWhen(`() => G.words.met('arroz') && G.chapters.state().step.hogar4 === 5`), 'rice');
    await reload(g, 'cocina');
    await tapNpc(g, 'papa', 0, 1);
    await drv(g, () => { const f = G.field, m = f.npc('mama_g'), l = f.npc('leo_g'), p = f.npc('papa'); return G.top().constructor.name === 'TextBox' && !!m && !!l && m.x === 5 && m.y === 4 && !m.busy && !l.busy && l.x === 7 && l.y === 6 && p.x === 7 && p.y === 4 && f.player.x === 5 && f.player.y === 6 && !f.player.moving; }, 'the family sits down');
    await g.frames(10); await g.shot('family_at_table');
    await drv(g, () => free() && G.chapters.done('hogar4'), 'the end');
    check('4 done: the five words in order; nothing of it in the bag; no guests left; Papá at the stove', await order(g) === 'lamama,sed,limon,aguacate,arroz' && !(await heldQ(g)).length && await g.ev(() => { const p = G.field.npc('papa'); return !G.field.npc('mama_g') && !G.field.npc('leo_g') && p.x === 4 && p.y === 2; }), await order(g));
    await branches(g, 'hogar4', 5);
    await branches(g, 'hogar4', 6);
    await g.ev(() => G.goto('casa', 4, 4, 'down')); await idle(g, 'casa');
    check('4: the real Mamá is still at (3,2) in her room', await g.ev(() => { const m = G.field.npc('mama'); return m.x === 3 && m.y === 2 && !m.hidden; }));
    check('4: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY;
run('En casa 3 and 4', [['chapter 3, los tacos de Papá', tacos], ['chapter 4, agua de limón', limonada]].filter(([n, f]) => !ONLY || f.name === ONLY));
