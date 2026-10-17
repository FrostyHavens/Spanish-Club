// The guide (src/guide.js, docs/INTUITIVE_AUDIT.md): the next thing to do is always in sight while free to walk.
//   NODE_PATH=$(npm root -g) node tools/test-guide.js [screenshot dir]
// Checks: a goal whenever there is something to do; the arrow over it on screen, at the screen's edge pointing the way
// off screen, on the right door when it's on another map; a puzzle's choices all marked (never only the answer);
// Canelo trotting toward the goal when the child stands about; the chapter's picture instead of a "!"; never a dead end
// (the day's play when the story has nothing for now, a budget-gated day too; the next giver asleep under a moon;
// sunset: home, and at home the bed, src/carry.js); the kid's menu
// without Misiones (in the grown-ups menu); and a naive bot that only taps what visibly calls for a tap (the guide's
// arrow, the hand, bubbles) playing day 1 to the end of chapter 2 without ever being stuck while there was a goal.
'use strict';
const path = require('path');
const { run, open, check, OUT } = require('./harness');
const { newGame, settle, nextTap } = require('./playflow');
const { NaiveBot, canvasShot } = require('./naivebot');

const near = (a, x, y, d = 4) => !!a && Math.abs(a.x - x) <= d && Math.abs(a.y - y) <= d;
const scr = (g, tx, ty) => g.ev(([tx, ty]) => { const f = G.field, T = G.TILE; return [tx * T + 12 - Math.round(f.cam.x), ty * T + 12 - Math.round(f.cam.y)]; }, [tx, ty]);
// a game partway through: chapters done, one going on at a beat, Canelo yours, on a map
async function setup(g, o) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz';
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
    for (const id of o.done || []) G.state.quests[id] = 'done';
    for (const w of o.words || []) G.words.meet(w, 'test');
    if (o.ch) { G.chapters.start(o.ch); G.state.ch.step[o.ch] = o.beat || 0; }
    G.goto(o.map, o.x, o.y, 'down');
  }, o);
  await g.fieldIdle(o.map);
  await g.ev(() => { if (G.field.banner) G.field.banner.t = 0; }); // (the map's name has had its moment: clearer shots)
  await g.frames(30);
}
const at = g => g.ev(() => G.guide.at);

async function arrows(browser) {
  const { ctx, g } = await open(browser, 'guide', true);
  try {
    const W1 = ['hola', 'perro', 'guau', 'ven'];
    // chapter 2, Nico waiting at the park fence; you far away by the barn: the arrow at the screen's edge, pointing his way
    await setup(g, { done: ['c1'], words: W1, ch: 'c2', beat: 1, map: 'villa', x: 40, y: 8 });
    let a = await at(g);
    check('guide: a goal while free to walk (Nico, chapter 2)', !!a && /c2:1/.test(a.why), JSON.stringify(a));
    check('guide: Nico off screen: an arrow at the screen\'s edge, pointing left (where he is)', a.edge && Math.cos(a.ang) < -0.5 && (a.x <= 20 || a.y >= 200), JSON.stringify(a));
    check('guide: the edge arrow carries Nico\'s picture', !!a.badge && (a.badge.npc && a.badge.npc.id === 'nico'));
    await canvasShot(g, path.join(OUT, 'guide_01_edge.png'));
    // walk closer: the arrow is over him (over his bubble)
    await g.ev(() => { const p = G.field.player; p.x = 13; p.y = 19; G.field.snapCam(); });
    await g.frames(4);
    a = await at(g);
    const nico = await g.ev(() => { const n = G.field.npc('nico'), f = G.field; return [n.x * 24 + 12 - Math.round(f.cam.x), n.y * 24 + 12 - Math.round(f.cam.y)]; });
    check('guide: Nico on screen: a bouncing arrow right over him', !a.edge && !a.up && Math.abs(a.tx - nico[0]) <= 2 && a.y < nico[1] - 30, JSON.stringify([a, nico]));
    check('guide: his bubble is the chapter\'s picture (a cat), not a "!"', await g.ev(() => { const b = G.field.npc('nico').alert(); return !!b && b.icon === 'gato'; }));
    await canvasShot(g, path.join(OUT, 'guide_02_over.png'));
    // the hand, after a few seconds, taps on the same goal
    await g.until(() => !!G.hint.at, null, 'the hint hand', 15000);
    check('guide: the hint hand taps on the same goal', near(await g.ev(() => G.hint.at), nico[0], nico[1]), JSON.stringify(await g.ev(() => G.hint.at)));

    // Canelo trots toward the goal when you stand about
    await g.ev(() => { const p = G.field.player, n = G.pet.npc(G.field); p.x = 25; p.y = 18; Object.assign(n, { x: 26, y: 18, ox: 0, oy: 0 }); G.field.snapCam(); });
    await g.frames(10);
    const dist = () => g.ev(() => { const f = G.field, n = G.pet.npc(f), m = f.npc('nico'); return G.chapters.K.path(f, n, m.x, m.y).length; }); // (walking steps)
    const d0 = await dist(), f0 = await g.ev(() => G.frame);
    await g.until(f0 => G.guide.trotAt() > f0, f0, 'Canelo to trot toward Nico', 25000);
    await g.until(() => { const n = G.pet.npc(G.field); return !n.busy; }, null, 'his trot', 5000);
    const d1 = await dist();
    check('guide: idle, Canelo trots a few tiles toward the goal', d1 <= d0 - 2, d0 + ' -> ' + d1);
    await canvasShot(g, path.join(OUT, 'guide_03_trot.png'));
    await g.tapTile(24, 20);
    await g.until(() => !G.field.route && !G.field.player.moving, null, 'the walk');
    await g.frames(60);
    check('guide: walking on, he follows you again', await g.ev(() => { const n = G.pet.npc(G.field), p = G.field.player; return Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 3; }));

    // a choice: Nico's "¡Miau!" (tap who says it): the cat AND Canelo get an arrow; no hand (it'd give it away)
    await setup(g, { done: ['c1'], words: W1.concat(['gato', 'miau']), ch: 'c2', beat: 2, map: 'villa', x: 16, y: 20 });
    a = await at(g);
    check('guide: a listening game: every one to choose from is marked (cat and Canelo)', a.choice && a.marks && a.marks.length >= 2, JSON.stringify(a));
    check('guide: no single arrow or hand on the answer', await g.ev(() => !G.guide.handAt(G.field)));
    await canvasShot(g, path.join(OUT, 'guide_04_choice.png'));

    // through doors: Mamá's chapter 3 while you're in town: the arrow over your house's door, her picture beside it
    await setup(g, { done: ['c1', 'c2'], words: W1.concat(['gato', 'miau']), ch: 'c3', beat: 0, map: 'villa', x: 6, y: 20 });
    a = await at(g);
    const door = await scr(g, 5, 17);
    check('guide: the goal is inside a house: the arrow over its door', !a.edge && Math.abs(a.tx - door[0]) <= 2 && Math.abs(a.ty - door[1]) <= 2, JSON.stringify([a, door]));
    check('guide: with Mamá\'s picture beside it', !!a.badge && a.badge.who === 'mama', JSON.stringify(a.badge));
    await canvasShot(g, path.join(OUT, 'guide_05_door.png'));
    // in the school, with Mamá's chapter going on: the way out
    await setup(g, { done: ['c1', 'c2'], words: W1.concat(['gato', 'miau']), ch: 'c3', beat: 0, map: 'escuela', x: 6, y: 6 });
    a = await at(g);
    const out = await g.ev(() => { const e = G.maps.escuela.exits[0], f = G.field; return [e.x * 24 + 12 - Math.round(f.cam.x), e.y * 24 + 12 - Math.round(f.cam.y)]; });
    check('guide: inside another building: the arrow on the way out', !!a && Math.abs(a.tx - out[0]) <= 2 && Math.abs(a.ty - out[1]) <= 2, JSON.stringify([a, out]));
    // every chapter's picture draws as a bubble (a word's picture keeps its colours: Sofía's red ball)
    await setup(g, { done: ['c1', 'c2', 'c3', 'c4'], words: W1, ch: 'c5', beat: 3, map: 'villa', x: 18, y: 23 });
    await g.frames(10);
    check('guide: Sofía shows her ball (the chapter\'s picture, in colour) and it draws', await g.ev(() => { const b = G.field.npc('sofia').alert(); return !!b && b.icon === 'pelota' && !!b.col; }) && !g.errors.length, g.errors.join('\n'));
    check('guide: every chapter\'s picture can be drawn as a bubble', await g.ev(() => { const c = document.createElement('canvas').getContext('2d'); try { G.data.chapters.forEach(ch => G.drawAlert(c, G.chapters.emblem(ch.id), 0, 40, 0)); return true; } catch (e) { return String(e); } }) === true);
    // a scene on top: no arrow drawn
    await setup(g, { done: ['c1'], words: W1, ch: 'c2', beat: 1, map: 'villa', x: 15, y: 21 });
    await g.ev(() => { G.say(['¡Hola!']); });
    await g.frames(4);
    check('guide: a line on top: the arrow waits', await g.ev(() => G.top() !== G.field && !G.guide.handAt(G.field)));
    await g.tap(110, 120);
    check('guide: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// never a dead end (step 2): when the story has nothing for now, the guide points at the day's play; the giver of the
// next chapter sleeps under a moon; at sunset the arrow goes home, and at home to your bed
async function noDeadEnd(browser) {
  const { ctx, g } = await open(browser, 'guide-play', true);
  try {
    const W1 = ['hola', 'perro', 'guau', 'ven'], W12 = W1.concat(['gato', 'miau']);
    // chapter 3 opens tomorrow (a morning chapter): Mamá asleep, the arrow on something to play with
    await setup(g, { done: ['c1', 'c2'], words: W12, map: 'casa', x: 4, y: 4 });
    await g.ev(() => { G.state.ch.lastDoneSess = G.words.sess(); });
    await g.frames(10);
    // (the open world: before the day's play, the guide suggests the places not visited yet; docs/WORLD_PLAN.md)
    check('play: with places still to explore, the guide suggests a road out of town first', /^explore /.test(((await at(g)) || {}).why || ''), JSON.stringify(await at(g)));
    await g.ev(() => { G.zones.ids().forEach(G.zones.visit); G.state.post = { day: G.words.day(), n: 0, log: {} }; }); await g.frames(4); // (Tomás's letter of the day already delivered: connect.js)
    check('play: chapter 3 waits for the morning', await g.ev(() => G.chapters.gate('c3') === 'morning' && !G.chapters.live()));
    check('play: Mamá (its giver) sleeps under a moon: "z z" (no word to read)', await g.ev(() => { const a = G.field.npc('mama').alert(); return !!a && a.sleep && a.wait; }));
    let a = await at(g);
    check('play: still the guide shows something to do: the day\'s play', !!a && /^play:/.test(a.why), JSON.stringify(a));
    await canvasShot(g, path.join(OUT, 'guide_07_mama_asleep.png'));
    await g.tapTile(3, 2);
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá');
    check('play: tapping her: "¡Mañana!" holds up the sleeping picture (the moon over a pillow)', await g.ev(() => /Mañana/.test(G.top().pages[0].t) && G.top().opts.show.icon === 'dormir'));
    await g.frames(20); await canvasShot(g, path.join(OUT, 'guide_08_manana.png'));
    await settle(g, 'Mamá');
    check('play: and then the arrow is on the day\'s play again', /^play:/.test(((await at(g)) || {}).why || ''));
    // in town: the arrow on a thing to pick up (and Canelo trots that way)
    await setup(g, { done: ['c1', 'c2'], words: W12, map: 'villa', x: 6, y: 20 });
    await g.ev(() => { G.state.ch.lastDoneSess = G.words.sess(); G.zones.ids().forEach(G.zones.visit); G.state.post = { day: G.words.day(), n: 0, log: {} }; }); // (Tomás's letter of the day already delivered: connect.js)
    await g.frames(10);
    a = await at(g);
    const goal = await g.ev(() => G.carry.plan(G.field));
    check('play: in town, a play goal with a place: ' + goal.why, !!a && /^play:/.test(a.why) && !!(goal.map || goal.who || goal.dog), JSON.stringify([a, goal]));
    await canvasShot(g, path.join(OUT, 'guide_09_play.png'));
    // many new words today: no daily word limit any more (2026-10-17): the next chapter still opens (Sofía's ball)
    const W4 = W12.concat(['buenosdias', 'hueso', 'sientate', 'si', 'no', 'manzana']);
    await g.ev(W4 => { G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true }); for (const id of ['c1', 'c2', 'c3', 'c4']) G.state.quests[id] = 'done'; for (const w of W4) { G.words.meet(w, 'test'); G.words.answerRight(w, { mode: 'text' }); } G.zones.ids().forEach(G.zones.visit); G.goto('villa', 17, 21, 'down'); }, W4);
    await g.fieldIdle('villa'); await g.frames(10);
    check('play: 12 new words today and chapter 5 still opens (no word budget)', await g.ev(() => G.chapters.gate('c5') === null));
    check('play: Sofía (its giver) has the chapter\'s picture, not a moon', await g.ev(() => { const a = G.field.npc('sofia').alert(); return !!a && !a.sleep; }));
    a = await at(g);
    check('play: and the guide suggests it', !!a && /^c5:/.test(a.why), JSON.stringify(a));
    // sunset: the arrow goes home
    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over(), null, 'the sunset');
    await g.frames(10);
    a = await at(g);
    check('play: at sunset the arrow points home (over the moon at the door), not at play', !!a && /home \(sunset\)/.test(a.why), JSON.stringify(a));
    await canvasShot(g, path.join(OUT, 'guide_10_sunset_home.png'));
    // at home when the sun went down: the arrow on your bed; a tap on it and it's good night
    await g.ev(() => { G.debug.sunsetAt = null; G.goto('casa', 5, 3, 'right'); });
    await g.fieldIdle('casa');
    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over(), null, 'the sunset at home');
    await g.frames(6);
    a = await at(g);
    check('play: home at sunset: the arrow is on your bed', !!a && /bed/.test(a.why), JSON.stringify(a));
    await canvasShot(g, path.join(OUT, 'guide_11_bed.png'));
    await g.tapTile(7, 2);
    await g.until(() => G.field.evening, null, 'the evening', 8000);
    check('play: a tap on the bed: good night (the evening, the night, a new morning)', true);
    await settle(g, 'the evening');
    check('play: a new day after it', await g.ev(() => !G.day.over()));
    check('play: no word was met along the way (play is word-safe)', await g.ev(n => G.words.list(1).length === n, W4.length));
    check('play: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function menu(browser) {
  const { ctx, g } = await open(browser, 'guide-menu', true);
  try {
    await setup(g, { done: ['c1'], words: ['hola'], ch: 'c2', beat: 1, map: 'villa', x: 15, y: 21 });
    await g.tap(310, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    await g.frames(8);
    check('menu: the kid menu has no Misiones: the word cards and the album, pictures only (the book comes later)', await g.ev(() => G.top().tiles().join() === 'cards,album,map'));
    await canvasShot(g, path.join(OUT, 'guide_06_kidmenu.png'));
    await g.ev(() => { G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps', null, 'the grown-ups menu');
    const k = await g.ev(() => G.top().rows().findIndex(r => r.id === 'story'));
    check('menu: Misiones is in the grown-ups menu (Story progress)', k >= 0);
    await g.tapRect(await g.ev(k => G.top().rowRect(k), k));
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    check('menu: it opens Misiones', true);
    check('menu: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// day 1 by a child who only follows what visibly calls for a tap: chapters 1 and 2
async function naiveDay1(browser) {
  const { ctx, g } = await open(browser, 'guide-naive', true);
  try {
    await newGame(g);
    const bot = new NaiveBot(g), lost = [];
    let play = 0, noPlay = 0, lostFree = 0;
    for (let i = 0; i < 120; i++) {
      await settle(g, 'naive ' + i);
      if (await g.ev(() => G.chapters.done('c1') && G.chapters.done('c2'))) break;
      await g.frames(3);
      const goal = await nextTap(g), why = await g.ev(() => (G.guide.at ? G.guide.at.why : null));
      if (goal) check('naive: whenever there is something to do, the guide shows it (' + goal.why + ')', !!why, JSON.stringify(goal));
      else if (await g.ev(() => !G.chapters.current())) { if (!why || !/^(play:|explore )/.test(why)) noPlay++; else play++; } // (nothing in the story now: the day's play)
      const r = await bot.free(goal ? 60 : 30);
      if (r.idleSec + r.wanderSec > 0.5) lost.push((goal ? goal.why : 'nothing') + ' [guide ' + why + ', ' + (await g.ev(() => G.field.mapId + ' ' + G.field.player.x + ',' + G.field.player.y)) + ']: ' + (r.idleSec + r.wanderSec).toFixed(1) + 's');
      if (!goal) lostFree += r.idleSec + r.wanderSec;
      if (r.stuck && goal) check('naive: never stuck while there is a goal (' + goal.why + ')', false);
      if (r.stuck) { // nothing to do: the next chapter opens in a few minutes (the pacing): fast-forward
        await g.ev(() => { G.speedMul = 8; });
        await g.until(() => { const n = G.chapters.next(); return G.top() !== G.field || !!G.chapters.nudge() || (!!n && !G.chapters.gate(n)) || G.chapters.done('c2'); }, null, 'the next chapter', 10 * 60 * 1000);
        await g.ev(() => { G.speedMul = 1; });
      }
    }
    console.log('    time lost wandering or standing about: ' + (lost.join(', ') || 'none') + '; taps on cues: ' + bot.total.taps);
    check('naive: day 1, chapters 1 and 2 done by following only visible cues', await g.ev(() => G.chapters.done('c1') && G.chapters.done('c2')));
    check('naive: between chapters there was always something to play (' + play + ' play goals followed; no word budget now, so often no gap at all)', noPlay === 0, play + ' / ' + noPlay);
    check('naive: and next to no time with nothing to do (' + lostFree.toFixed(1) + ' s)', lostFree < 20, String(lostFree));
    check('naive: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); // (ONLY=naive,play to run some sections)
run('The guide: always a next thing to do, in sight', [['arrows, doors, choices, Canelo', arrows], ['never a dead end: play, asleep, sunset, bed', noDeadEnd], ['the kid menu', menu], ['a naive child plays day 1', naiveDay1]].filter(([n]) => !ONLY.length || ONLY.some(o => n.includes(o))));
