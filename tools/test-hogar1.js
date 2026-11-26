// En casa, chapters 1 and 2 (content/es/hogar-story1.js, docs/UNIT_EN_CASA.md), by taps and the guide's arrow alone:
// the doorway shut before the puppy is found and no home bubble; the picture bubble at the doorway and the arrow to it
// (the town's story wins when it has a live beat); a new game that has only done chapter 1 walks into the kitchen, hogar1
// opens by itself that day whatever the review backlog (¡Tengo hambre!: el papá, la cocina, tengo hambre, la sopa,
// ¡qué rico!); hogar2 waits for room, then Pon la mesa (la mesa, el plato, el vaso, la cuchara, la silla): three trips
// with a thing in her hands; each new word met alone, unmet before its puzzle; a save reloaded in the middle of every beat
// goes on; the arrow follows the home chapter between her room, the kitchen and the yard (and a chapter going on leads her home
// from town when the town has nothing live, never one that has not started); at sunset it leads to bed. After each beat the
// game is opened again from every copy of the save taken inside it (tools/hogar-util.js) and played on by the arrow.
// NODE_PATH=$(npm root -g) node tools/test-hogar1.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');
const { settle } = require('./playflow');
const { install, branches } = require('./hogar-util');


// a game that has only done chapter 1 (the puppy), standing in her room; saved in slot 1 (so it can be reloaded)
const fresh = (g, o = {}) => g.ev(o => {
  o.words = o.words || ['hola', 'perro', 'guau', 'ven']; // (chapter 1 of the town: what she knows)
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving; // (free walking: used in the page-side conditions)
  window.__met = []; // (the order the words are met, and who answered them)
  const meet = G.words.meet; G.words.meet = function (id) { const was = G.words.met(id), r = meet.apply(this, arguments); if (!was && G.words.met(id)) window.__met.push(id); return r; };
  G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.st.begin(1);
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.state.quests.c1 = 'done';
  G.demo.skip(); G.zones.visit('villa');
  const y = new Date(G.now() - 864e5), ago = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  for (const w of o.words) { G.words.meet(w, 't'); Object.assign(G.words.rec(w), { mdate: ago, mdn: G.words.dayNum() - 1 }); }
  G.words.wm().d0 = G.words.dayNum() - 3; // (a save from days ago: the first-play-day rule of the pacing is not what opens things)
  window.__met = [];
  G.goto(o.map || 'casa', o.x == null ? 4 : o.x, o.y == null ? 4 : o.y, 'down');
}, o);

// the arrow, followed by taps alone: tap what it points at (the target on screen, the arrow itself at the edge) until done()
async function follow(g, done, what, arg, max = 150) {
  for (let i = 0; i < max; i++) {
    await settle(g, what);
    if (await g.ev(done, arg)) return;
    const a = await g.ev(() => { const a = G.guide.at; return a && !a.hidden && !a.choice ? { x: a.edge ? a.x : a.tx, y: a.edge ? a.y : a.ty, why: a.why } : null; });
    if (!a) { await g.frames(20); continue; }
    await g.tap(a.x, a.y);
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
    await g.frames(2);
  }
  throw new Error('the arrow never led to: ' + what + ' (' + JSON.stringify(await g.ev(() => ({ map: G.field.mapId, why: G.guide.at && G.guide.at.why, step: G.chapters.state().step }))) + ')');
}
const goal = g => g.ev(() => { const gl = G.guide.goal(G.field); return gl ? { why: gl.why, map: gl.map || null, via: gl.via || null, pts: (gl.pts || []).map(p => [Math.floor(p.x / 24), Math.floor(p.y / 24)]) } : null; });
const step = (g, id) => g.ev(id => G.chapters.state().step[id] | 0, id);
const metNow = g => g.ev(() => window.__met.slice());

// tap what the arrow points at until a scene has begun (the beat's first line)
async function startBeat(g, what) {
  for (let i = 0; i < 60; i++) {
    if (await g.ev(() => G.top() !== G.field || G.field.locked)) return;
    const a = await g.ev(() => { const a = G.guide.at; return a && !a.hidden && !a.choice ? { x: a.edge ? a.x : a.tx, y: a.edge ? a.y : a.ty } : null; });
    if (!a) { await g.frames(15); continue; }
    await g.tap(a.x, a.y);
    await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
  }
  throw new Error('the arrow never began ' + what);
}
// a save closed and opened again, as a child coming back (the same day)
async function reload(g) {
  await g.ev(() => { G.st.saveNow(); G.toTitle(); });
  await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.tap(160, 180);
  await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
  await g.ev(() => { if (!window.__met) window.__met = []; });
}
// the next calendar day, as playflow does
async function nextDay(g) {
  await g.ev(() => { G.st.saveNow(); G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.toTitle(); });
  await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.tap(160, 180);
  await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
}
// play the scene that has begun until its first line or question is up, then shut the game and open it again (a save in
// the middle of the beat): the chapter must be on the same beat, and the beat plays again
async function reloadMidBeat(g, id, k, what) {
  await g.until(() => G.top() !== G.field && G.top().constructor.name !== 'Fade', null, what + ' to start', 30000);
  await g.until(() => ['TextBox', 'Choice'].includes(G.top().constructor.name) && G.top().t > 10, null, what + ' first line', 30000);
  await g.frames(8);
  await reload(g);
  const s = await g.ev(([id]) => ({ step: G.chapters.state().step[id] | 0, active: G.chapters.active(id), map: G.field.mapId, bag: G.errands.bag.list().map(i => i.id + ':' + i.q) }), [id]);
  check('reload in the middle of ' + what + ': ' + id + ' is still on beat ' + k + ' (active), in ' + s.map, s.active && s.step === k, JSON.stringify(s));
  return s;
}

// ---------- the doorway shut, the bubble at the doorway, the arrow to it, the town first ----------
async function doorway(browser) {
  const { ctx, g } = await open(browser, 'hogar-door', true);
  try {
    await fresh(g);
    // before the puppy is found (chapter 1 of the town not done): the doorway is Mamá's "wait", no home bubble, no arrow
    await g.ev(() => { G.state.quests.c1 = 'active'; G.chapters.state().step.c1 = 1; });
    await g.fieldIdle('casa'); await g.frames(10);
    const pre = await g.ev(() => { const CH = G.chapters; return { gate: CH.gate('hogar1'), live: !!CH.live({}, 'hogar'), papa: CH.alert('papa'), why: (G.guide.goal(G.field) || {}).why || '' }; });
    check('before the puppy: hogar1 is shut ("after"), no live home chapter, no bubble over Papá, the arrow is not about the kitchen', pre.gate === 'after' && !pre.live && !pre.papa && !/hogar/.test(pre.why), JSON.stringify(pre));
    await g.ev(() => { window.__al = []; const a = G.drawAlert; G.drawAlert = function (ctx, al, ex, ey, t) { window.__al.push([al && (al.icon || al), ex, ey]); return a.apply(this, arguments); }; });
    await g.frames(6);
    check('before the puppy: no picture bubble at the kitchen doorway', await g.ev(() => !window.__al.some(([ic, ex]) => ic === 'sopa')));
    await g.tapTile(8, 4);
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá at the doorway');
    check('before the puppy: the doorway is Mamá\'s "wait" (she stays in her room)', await g.ev(() => G.field.mapId === 'casa' && G.top().opts.who === 'mama'));
    await g.drive(() => free(), 'Mamá\'s wait');
    // the puppy found: the doorway opens; a town chapter going on leads first, the home bubble shows all the same
    await g.ev(() => { G.state.quests.c1 = 'done'; delete G.chapters.state().step.c1; G.chapters.start('c2'); G.chapters.state().step.c2 = 0; window.__al.length = 0; });
    await g.frames(20);
    const town = await g.ev(() => ({ gate: G.chapters.gate('hogar1'), why: (G.guide.goal(G.field) || {}).why || '', al: window.__al.filter(([ic]) => ic === 'sopa').length }));
    check('with a town chapter going on: the home chapter could start (gate null), the bubble shows, the arrow is the town\'s (' + town.why + ')', town.gate === null && town.al > 0 && /^c2:/.test(town.why), JSON.stringify(town));
    await g.ev(() => { G.state.quests.c2 = 'done'; G.chapters.state().lastDoneSess = G.words.sess(); G.chapters.flush(); });
    await g.frames(10);
    const none = await g.ev(() => ({ town: G.chapters.live() && G.chapters.live().id, c3: G.chapters.gate('c3') }));
    check('with nothing live in the town (the next chapter waits for the morning)', !none.town && none.c3 === 'morning', JSON.stringify(none));
    const gl = await goal(g);
    check('the arrow leads to the kitchen doorway (' + (gl && gl.why) + ')', !!gl && gl.map === 'cocina' && gl.via === 'door' && gl.pts.length === 1 && gl.pts[0][0] === 8 && gl.pts[0][1] === 4, JSON.stringify(gl));
    await g.shot('doorway_bubble');
    // out in town: a home chapter that has NOT started never pulls her home (the bubble at the doorway is the only offer)
    await g.ev(() => G.goto('villa', G.MAPDATA.villa.pos.casaDoor[0], G.MAPDATA.villa.pos.casaDoor[1] + 2, 'down')); await g.fieldIdle('villa'); await g.frames(10);
    const town0 = await g.ev(() => ({ why: (G.guide.goal(G.field) || {}).why || '', live: (G.chapters.live({}, 'hogar') || {}).started || false }));
    check('in town, a home chapter not started: the arrow is not about the kitchen (' + town0.why + ')', !town0.live && !/hogar/.test(town0.why), JSON.stringify(town0));
    await g.ev(() => G.goto('casa', 4, 4, 'down')); await g.fieldIdle('casa'); await g.frames(10);
    // the arrow is on the screen over the doorway; the hint hand comes to the same place
    const at = await g.ev(() => Object.assign({ want: 8 * 24 + 12 - Math.round(G.field.cam.x) }, G.guide.at));
    check('...drawn over the doorway (on screen, a door)', !!at && !at.edge && !!at.door && Math.abs(at.tx - at.want) <= 2, JSON.stringify(at));
    await g.until(() => !!G.hint.at, null, 'the hint hand', 15000);
    check('...and the hint hand taps there too', await g.ev(() => Math.abs(G.hint.at.x - G.guide.at.tx) < 20), JSON.stringify(await g.ev(() => [G.hint.at, G.guide.at.tx])));
    // a home chapter going on: the arrow follows it from her room (the doorway) and from the yard (the way back to the kitchen)
    await g.ev(() => { G.chapters.start('hogar1'); G.chapters.state().step.hogar1 = 1; G.chapters.flush(); });
    await g.frames(10);
    const act = await goal(g);
    check('a home chapter going on: from her room the arrow leads through the kitchen doorway (' + (act && act.why) + ')', !!act && /^hogar1:1/.test(act.why) && act.map === 'cocina' && act.via === 'door' && act.pts[0].join() === '8,4', JSON.stringify(act));
    // ...and out in town, with the town having nothing live: it leads home (the front door of her house), the town's story first
    await g.ev(() => G.goto('villa', G.MAPDATA.villa.pos.casaDoor[0], G.MAPDATA.villa.pos.casaDoor[1] + 2, 'down')); await g.fieldIdle('villa'); await g.frames(10);
    const town1 = await goal(g), casaDoor = await g.ev(() => G.MAPDATA.villa.pos.casaDoor);
    check('a home chapter going on, from town (nothing live there): the arrow leads home to her front door (' + (town1 && town1.why) + ')', !!town1 && /^hogar1:1/.test(town1.why) && town1.map === 'cocina' && town1.via === 'door' && town1.pts[0].join() === casaDoor.join(), JSON.stringify([town1, casaDoor]));
    await g.shot('town_arrow_home');
    await g.ev(() => { G.chapters.start('c3'); G.chapters.state().step.c3 = 0; G.chapters.flush(); }); await g.frames(10);
    const town2 = await goal(g);
    check('...but a town chapter going on leads first (' + (town2 && town2.why) + ')', !!town2 && /^c3:/.test(town2.why), JSON.stringify(town2));
    await g.ev(() => { delete G.state.quests.c3; delete G.chapters.state().step.c3; G.chapters.flush(); }); await g.frames(10);
    check('...and with it gone, home again', await g.ev(() => /^hogar1:1/.test((G.guide.goal(G.field) || {}).why || '')));
    await g.ev(() => G.goto('patio', 3, 4, 'down')); await g.fieldIdle('patio'); await g.frames(10);
    const yard = await goal(g);
    check('...from the yard it leads back to the kitchen door (' + (yard && yard.why) + ')', !!yard && /^hogar1:1/.test(yard.why) && yard.via === 'door' && yard.pts[0].join() === '3,2', JSON.stringify(yard));
    await g.ev(() => G.goto('cocina', 3, 4, 'down')); await g.fieldIdle('cocina'); await g.frames(10);
    check('...and in the kitchen it is Papá', await g.ev(() => { const gl = G.guide.goal(G.field); return !!gl && /^hogar1:1/.test(gl.why) && gl.pts[0].npc && gl.pts[0].npc.id === 'papa'; }));
    await g.ev(() => G.goto('casa', 4, 4, 'down')); await g.fieldIdle('casa');
    // sunset: the bubble goes, the arrow leads to the bed
    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over(), null, 'sunset', 20000);
    await g.frames(10);
    const dusk = await g.ev(() => { window.__al.length = 0; return (G.guide.goal(G.field) || {}).why; });
    await g.frames(6);
    check('at sunset in her room: the arrow leads to the bed, no home bubble (' + dusk + ')', /bed/.test(dusk || '') && await g.ev(() => !window.__al.some(([ic]) => ic === 'sopa')), dusk);
    await g.ev(() => G.goto('villa', G.MAPDATA.villa.pos.casaDoor[0], G.MAPDATA.villa.pos.casaDoor[1] + 2, 'down')); await g.fieldIdle('villa'); await g.frames(10);
    check('at sunset in town: the way home leads, not the home chapter', await g.ev(() => /home \(sunset\)/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => (G.guide.goal(G.field) || {}).why));
    check('doorway: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- chapter 1 (¡Tengo hambre!), then chapter 2 the next day (Pon la mesa) ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'hogar', true); // (the review pacing is ON: hogar1 opens on the day she first walks in, whatever the backlog)
  try {
    await fresh(g); await install(g);
    // a full review backlog: nothing new may open (CH.room is false) -- but the first day in the kitchen is the exception
    await g.ev(() => { G.chapters.__room = G.chapters.room; G.chapters.room = () => false; G.chapters.flush(); });
    await g.fieldIdle('casa'); await g.frames(20);
    check('a full backlog: hogar1 waits for room (no bubble at the doorway, no arrow to it)', await g.ev(() => G.chapters.gate('hogar1') === 'room' && !G.chapters.live({}, 'hogar') && !/hogar/.test((G.guide.goal(G.field) || {}).why || '')));
    // she walks into the kitchen (a child, or her parent, who tries the doorway)
    await g.tapTile(8, 4);
    await g.until(() => G.field.mapId === 'cocina', null, 'the kitchen');
    check('the day she first walks in: hogar1 opens whatever the backlog', await g.ev(() => G.chapters.gate('hogar1') === null || G.chapters.active('hogar1')), await g.ev(() => G.chapters.gate('hogar1')));
    // every question is shot once
    await g.ev(() => { window.__chosen = {}; });
    g.beforeAct = async s => {
      if (s.name !== 'Choice' || s.t < 12) return false;
      const k = await g.ev(() => { const r = G.chapters.running(), q = G.top(); const key = (r ? r.id + '_' + r.k : 'free') + '_' + ((q.o && q.o.answer != null && q.ch[q.o.answer] && q.ch[q.o.answer].word) || 'x'); if (window.__chosen[key]) return null; window.__chosen[key] = 1; return key; });
      if (k) { await g.frames(6); await g.shot('ask_' + k); }
      return false;
    };
    await g.until(() => G.top() !== G.field, null, 'Papá coming to meet her', 30000);
    await g.frames(40); await g.shot('papa_greets');
    await settle(g, 'hogar1 beat 0');
    check('beat 0: el papá and la cocina met, one after the other, nothing else', JSON.stringify(await metNow(g)) === JSON.stringify(['elpapa', 'cocina']), JSON.stringify(await metNow(g)));
    await branches(g, 'hogar1', 0);
    check('beat 0: Papá is back at the stove; his bubble is the hungry face; the arrow leads to him', await g.ev(() => { const n = G.field.npc('papa'), a = n.alert(); return n.x === 4 && n.y === 2 && !!a && (a === 'hambre' || a.icon === 'hambre') && /hogar1:1/.test((G.guide.goal(G.field) || {}).why || ''); }), JSON.stringify(await g.ev(() => [G.field.npc('papa').alert(), (G.guide.goal(G.field) || {}).why])));
    await g.shot('papa_at_stove');
    // beat 1, reloaded in the middle of it, then played
    await startBeat(g, 'tengo hambre');
    await reloadMidBeat(g, 'hogar1', 1, 'tengo hambre');
    check('reload in beat 1: nothing met out of turn', JSON.stringify(await g.ev(() => ['hambre', 'sopa', 'rico'].filter(G.words.met))).length <= 12);
    await follow(g, () => (G.chapters.state().step.hogar1 | 0) >= 2, 'tengo hambre');
    check('beat 1: tengo hambre met (her own line), the soup is on the table, the arrow is on it', await g.ev(() => G.words.met('hambre') && !G.words.met('sopa') && G.chapters.ctx('hogar1').data.bowl === 1 && /hogar1:2/.test((G.guide.goal(G.field) || {}).why || '')));
    await branches(g, 'hogar1', 1);
    await g.shot('soup_on_table');
    await startBeat(g, 'the soup');
    await reloadMidBeat(g, 'hogar1', 2, 'the soup');
    check('reload in beat 2: the soup is on the table still', await g.ev(() => G.chapters.ctx('hogar1').data.bowl === 1));
    await follow(g, () => G.chapters.done('hogar1'), 'the soup');
    const m1 = await metNow(g);
    check('chapter 1 done: the words met in the chapter\'s order, each once (' + m1.join(' ') + ')', m1.join() === 'elpapa,cocina,hambre,sopa,rico' || /^(.*,)?elpapa,cocina,hambre,sopa,rico$/.test(m1.join()) || (['elpapa', 'cocina', 'hambre', 'sopa', 'rico'].every((w, i) => m1.indexOf(w) >= 0 && (i === 0 || m1.indexOf(w) > m1.indexOf(['elpapa', 'cocina', 'hambre', 'sopa', 'rico'][i - 1])))));
    await branches(g, 'hogar1', 2);
    await g.shot('hogar1_done');
    await g.ev(() => { G.chapters.room = G.chapters.__room; G.chapters.flush(); });
    const g2 = await g.ev(() => ({ gate: G.chapters.gate('hogar2'), papa: (G.field.npc('papa').alert() || {}).icon || null }));
    check('hogar2 waits for room the same day (5 new words today): no chapter bubble over Papá (the pot of the day\'s meal may be there: its own picture, the kitchen)', g2.gate === 'room' && (!g2.papa || g2.papa === 'cocina'), JSON.stringify(g2));
    check('hogar1: no console errors', !g.errors.length, g.errors.join('\n'));

    // ----- the next day: Pon la mesa -----
    await nextDay(g);
    await g.ev(() => { window.__met = []; window.__chosen = {}; G.warmup.done = () => true; G.chapters.flush(); }); // (the dog's warm-up has had its cards: the real rule lets one chapter in with 15 due)
    await g.fieldIdle(await g.ev(() => G.field.mapId));
    const d2 = await g.ev(() => ({ gate: G.chapters.gate('hogar2'), map: G.field.mapId }));
    check('the next day: hogar2 may open (' + d2.map + ')', d2.gate === null, JSON.stringify(d2));
    if (d2.map !== 'cocina') await follow(g, () => G.field.mapId === 'cocina', 'the kitchen (the arrow from her room)');
    check('the arrow from her room led through the doorway to Papá', await g.ev(() => /hogar2:0/.test((G.guide.goal(G.field) || {}).why || '') && !!G.field.npc('papa').alert()));
    await startBeat(g, 'Papá: ¡A comer!');
    await reloadMidBeat(g, 'hogar2', 0, 'Papá asks for help').catch(e => { throw e; });
    await follow(g, () => (G.chapters.state().step.hogar2 | 0) >= 1, 'mesa');
    check('beat 0: la mesa met, alone', (await metNow(g)).join() === 'mesa', JSON.stringify(await metNow(g)));
    await branches(g, 'hogar2', 0);
    const trips = [['plato', 1, 2], ['vaso', 3, 4], ['cuchara', 5, 6]];
    for (const [id, a, b] of trips) {
      await g.ev(() => G.hint && 0);
      check(id + ': the arrow is at the shelf (unmet: ' + !(await g.ev(id => G.words.met(id), id)) + ')', await g.ev(([id, a]) => !G.words.met(id) && new RegExp('hogar2:' + a).test((G.guide.goal(G.field) || {}).why || ''), [id, a]));
      await follow(g, a => (G.chapters.state().step.hogar2 | 0) >= a + 1, id + ' at the shelf', a);
      check(id + ': met, in her hands as the chapter\'s thing (q: hogar2); nothing else new', await g.ev(id => G.words.met(id) && G.errands.bag.has(id, { q: 'hogar2' }), id) && (await metNow(g)).slice(-1)[0] === id);
      await branches(g, 'hogar2', a);
      await g.shot('carry_' + id);
      if (id === 'plato') { await startBeat(g, 'the plate on the table'); await reloadMidBeat(g, 'hogar2', 2, 'putting the plate down'); check('reload mid-trip: the plate is in her hands or already on the table, never lost', await g.ev(() => G.errands.bag.has('plato', { q: 'hogar2' }) || (G.chapters.ctx('hogar2').data.set || {}).plato === 1)); }
      await follow(g, b => (G.chapters.state().step.hogar2 | 0) >= b + 1, id + ' on the table', b);
      check(id + ': on the table (drawn from c.data), out of her hands', await g.ev(id => !G.errands.bag.has(id) && G.chapters.ctx('hogar2').data.set[id] === 1, id));
      await branches(g, 'hogar2', b);
      await g.shot('table_' + id);
    }
    await follow(g, () => (G.chapters.state().step.hogar2 | 0) >= 8, 'her chair');
    check('la silla met (Papá pulls out her chair)', await g.ev(() => G.words.met('silla')));
    await branches(g, 'hogar2', 7);
    await g.shot('chair');
    await follow(g, () => G.chapters.done('hogar2'), 'Papá: ¡A comer!, the family sits');
    const m2 = await metNow(g);
    check('chapter 2 done: mesa, plato, vaso, cuchara, silla in that order, each once (' + m2.join(' ') + ')', m2.join() === 'mesa,plato,vaso,cuchara,silla', m2.join());
    check('the chapter\'s things are gone from the bag', await g.ev(() => !G.errands.bag.list().some(i => i.q)));
    await branches(g, 'hogar2', 8);
    await g.shot('hogar2_done');
    // the arrow follows a home beat between the rooms: a beat in the yard is none today; the line leads from the patio too
    check('hogar2: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ONLY=door or ONLY=story: one part
const ONLY = process.env.ONLY || '';
run('En casa, chapters 1 and 2 by taps', [
  ['the doorway, its bubble and the arrow', doorway],
  ['the story: hogar1, hogar2', story],
].filter(([n]) => !ONLY || n.includes(ONLY)));
