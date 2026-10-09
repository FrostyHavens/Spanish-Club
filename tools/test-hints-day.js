// Tap hints (hint.js) and the end of the day (day.js): the first two minutes of a new game on an iPad and on a
// keyboard, the hand that shows where to tap next, then a sunset, the evening at home, the night and a new morning.
//   NODE_PATH=$(npm root -g) node tools/test-hints-day.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

// A new game right after the creator and the name, the way main.js starts one: the house stays locked a moment, then
// chapter 1 starts by itself. Every scene pushed from now on is listed in window.__scenes.
const newGame = g => g.ev(() => {
  window.__scenes = [];
  const push = G.push; G.push = s => { window.__scenes.push(s.constructor.name); return push(s); };
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
  const f = G.goto('casa', 4, 4, 'up');
  f.locked = true;
  f.tasks.add((function* () { yield 40; f.locked = false; })());
});
// chapter 1 up to its door: the find-it puzzle (the puppy under the table), then the rest by drive()
async function chapter1(g, keys) {
  await g.drive(() => !!G.state.finds.perro && G.top() === G.field && !G.field.locked, 'chapter 1: Mamá and the puppy');
  if (keys) { await g.ev(() => { const p = G.field.player; p.x = 3; p.y = 4; p.dir = 'up'; G.field.snapCam(); }); await g.press('z'); }
  else await g.tapTile(3, 3);
  await g.drive(() => { const b = G.chapters.beat('c1'); return !!b && !!b.door && G.top() === G.field && !G.field.locked; }, 'chapter 1');
}
// a game in progress (Mamá's intro done), standing somewhere
const playing = (g, map, x, y, dir, flags) => g.ev(([map, x, y, dir, flags]) => {
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true }, flags || {}); Object.assign(G.state.quests, { c1: 'done', c2: 'done' });
  ['hola', 'buenosdias', 'adios'].forEach(id => G.st.learn(id));
  G.debug.sunsetAt = null; G.goto(map, x, y, dir);
}, [map, x, y, dir, flags]);
const hintAt = g => g.ev(() => G.hint.at);
const waitHint = (g, what, t = 15000) => g.until(() => !!G.hint.at && G.hint.at.y != null, null, 'the hint hand ' + what, t);
const near = (a, x, y, d = 3) => !!a && Math.abs(a.x - x) <= d && Math.abs(a.y - y) <= d;
// the screen spot of a map tile's centre
const tileXY = (g, tx, ty) => g.ev(([tx, ty]) => { const f = G.field, T = G.TILE; return [tx * T + T / 2 - Math.round(f.cam.x), ty * T + T / 2 - Math.round(f.cam.y)]; }, [tx, ty]);

// ---------- iPad: the first two minutes, by taps; the hand ----------
async function firstMinutes(browser) {
  const { ctx, g } = await open(browser, 'hint-ipad', true);
  try {
    await newGame(g);
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().shown >= G.top().chars(0, 3), null, 'Mamá\'s first line');
    check('ipad: no hand while a line is fresh', !(await hintAt(g)));
    await waitHint(g, 'on the waiting line');
    const a = await hintAt(g), box = await g.ev(() => { const s = G.top(); return { x: s.boxX + s.boxW, y: s.boxY() + 60 }; });
    check('ipad: a waiting line gets a tapping hand at its corner', a.talk && a.x > box.x - 20 && a.x < box.x && a.y > box.y - 20 && a.y < box.y, JSON.stringify(a));
    await g.frames(20); await g.shot('hand_dialogue');
    await g.tap(110, 120);
    check('ipad: a tap hides the hand at once', !(await hintAt(g)));
    await chapter1(g, false);
    const sc = await g.ev(() => window.__scenes);
    check('ipad: chapter 1 has no controls card (the notebook comes with Canelo)', !sc.includes('KeyHint') && sc.includes('Notebook'), sc.join(','));
    check('ipad: no keyboard strip on a touch screen', !(await g.ev(() => G.hint.stripShowing())));

    // home, free to walk: after ~6 s the hand shows the door
    const door = await g.ev(() => [G.maps.casa.exits[0].x, G.maps.casa.exits[0].y]);
    await g.frames(200);
    check('ipad: no hand before ~6 s of doing nothing', !(await hintAt(g)));
    await waitHint(g, 'on the house door');
    const dxy = await tileXY(g, ...door);
    check('ipad: then the hand points at the door', near(await hintAt(g), dxy[0], dxy[1]), JSON.stringify([await hintAt(g), dxy]));
    await g.frames(30); await g.shot('hand_door');
    await g.ev(() => G.words.addTime(300)); // (a child takes a few minutes over chapter 1: chapter 2 may open, chapters.js 'soon')
    await g.tap(...dxy);
    check('ipad: tapping hides it (and walks)', !(await hintAt(g)) && await g.ev(() => !!G.field.route));
    await g.drive(() => G.field.mapId === 'villa' && (G.state.ch.step.c2 | 0) >= 1 && G.top() === G.field && !G.field.locked && G.fade.a === 0, 'out of the house (Canelo, then the butterfly)');

    // the next chapter's giver: the hand is on Mamá (chapter 3, the next morning)
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.quests, { c1: 'done', c2: 'done' }); Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true }); G.goto('casa', 4, 4, 'up'); });
    await g.fieldIdle('casa');
    await waitHint(g, 'on Mamá');
    const m = await g.ev(() => { const n = G.field.npc('mama'), f = G.field; return [n.x * 24 + 12 - Math.round(f.cam.x), n.y * 24 + 12 - Math.round(f.cam.y)]; });
    check('ipad: a chapter waiting to start: the hand is on its giver (Mamá)', near(await hintAt(g), m[0], m[1]), JSON.stringify(await hintAt(g)));
    await g.shot('hand_mama');
    // ...but not when it opens tomorrow (her sun bubble)
    await g.ev(() => { G.state.ch.lastDoneSess = G.words.sess(); });
    await g.frames(400);
    check('ipad: a "tomorrow" bubble gets no hand', await g.ev(() => !G.hint.at && G.field.npc('mama').alert().wait));
    await g.shot('hand_none_tomorrow');

    // the notebook: the hand on its close button
    await g.ev(() => { G.field.introBusy = false; G.notebook(); });
    await waitHint(g, 'on the notebook\'s close button');
    const cl = await g.ev(() => G.top().closeXY());
    check('ipad: a notebook left open gets the hand on its close button', near(await hintAt(g), cl[0] + 10, cl[1] + 12, 4));
    await g.frames(12); await g.shot('hand_notebook');
    await g.tapBtn(cl);
    // a card that a tap closes ("¡Palabra nueva!"): the hand below it
    await g.ev(() => { window.__w = G.learnWords(['galleta'], { force: true }); });
    await waitHint(g, 'below the new word card');
    check('ipad: a new-word card left waiting gets the hand below it', await g.ev(() => G.top().constructor.name === 'WordCard' && G.hint.at.y > 180));
    await g.frames(20); await g.shot('hand_wordcard');
    await g.tap(160, 112);
    check('ipad: a tap closes it as before', await g.ev(() => window.__w.done() && !G.hint.at));
    check('ipad: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- desktop: Z on a waiting line, the one-time key strip ----------
async function keyboard(browser) {
  const { ctx, g } = await open(browser, 'hint-desk', false);
  try {
    await newGame(g);
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().shown >= G.top().chars(0, 3), null, 'Mamá\'s first line');
    await waitHint(g, 'on the waiting line');
    check('desktop: a waiting line shows the Z key', await g.ev(() => G.hint.at.talk && G.hint.keyboard()));
    await g.frames(20); await g.shot('key_dialogue');
    await g.press('z');
    check('desktop: a key hides it', !(await hintAt(g)));
    check('desktop: no key strip during the intro', !(await g.ev(() => G.hint.stripShowing())));
    await chapter1(g, true);
    await g.until(() => G.hint.stripShowing(), null, 'the key strip');
    check('desktop: once Canelo is yours, a strip shows Z / X / C', true);
    await g.frames(20); await g.shot('key_strip');
    // the strip goes away by itself
    await g.ev(() => { const p = G.field.player; p.x = 4; p.y = 5; p.dir = 'down'; G.field.snapCam(); G.words.addTime(300); });
    await g.page.keyboard.down('ArrowDown');
    await g.until(() => G.field.mapId === 'villa' || G.top() !== G.field || G.field.locked, null, 'leaving the house');
    await g.page.keyboard.up('ArrowDown');
    await g.drive(() => G.field.mapId === 'villa' && (G.state.ch.step.c2 | 0) >= 1 && G.top() === G.field && !G.field.locked && G.fade.a === 0, 'out of the house');
    await g.ev(() => { G.hint.STRIP = 60; });
    await g.until(() => !G.hint.stripShowing() && G.hint.stripDone(), null, 'the strip to go');
    check('desktop: the key strip goes away by itself, once', true);
    check('desktop: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the end of the day (iPad) ----------
// Plays a scene to the end of the evening: dialogue and questions as drive() does, the "Hoy" card, the night.
async function evening(g, done) {
  for (let i = 0; i < 400 && !(await g.ev(done)); i++) {
    const s = await g.scene();
    if (s === 'TodayCard') {
      await g.until(() => G.top().constructor.name !== 'TodayCard' || (G.top().revealed() && G.top().wait > 20), null, 'the Hoy card');
      if (await g.scene() === 'TodayCard') { if (g.touch) await g.tap(160, 200); else await g.press('z'); }
    } else if (s === 'Night') await g.frames(10);
    else await g.drive(`(() => ['TodayCard', 'Night'].includes(G.top().constructor.name) || (${done})())()`, 'the evening');
  }
}
async function endOfDay(browser) {
  const { ctx, g } = await open(browser, 'day-ipad', true);
  try {
    await playing(g, 'villa', 5, 19, 'up');
    await g.fieldIdle('villa');
    const t0 = await g.ev(() => G.sessionTime);
    await g.frames(60);
    check('day: G.sessionTime counts play', await g.ev(t0 => G.sessionTime >= t0 + 0.9, t0));
    check('day: no sunset yet', await g.ev(() => !G.day.over() && G.day.glow() === 0 && !G.day.homeDoor(G.field)));
    // today: words learned and stars earned since the session began
    await g.ev(() => { G.st.learn('manzana'); G.st.practiced('manzana', true); G.st.learn('tres'); G.st.practiced('tres', true); G.st.practiced('hola', true); });
    await g.frames(2);
    check('day: today\'s words and stars are tracked', await g.ev(() => { const d = G.day.today(); return d.words.join() === 'manzana,tres' && d.stars === 3; }), JSON.stringify(await g.ev(() => G.day.today())));
    check('day: the save format is unchanged by the day (only Round B album / sayback / pet / hearts / heartlog / friends / bag / jobs and the word model wm / finds are new in G.state)', await g.ev(() => Object.keys(G.state).every(k => ['flags', 'searched', 'playTime', 'loc', 'words', 'pages', 'quests', 'stars', 'opts', 'look', 'name', 'savedAt', 'album', 'sayback', 'pet', 'hearts', 'heartlog', 'friends', 'bag', 'jobs', 'wm', 'finds', 'ch'].includes(k))), await g.ev(() => Object.keys(G.state).join()));

    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over() && G.day.glow() >= 1, null, 'the sunset');
    check('day: after the threshold the sun goes down over Villa Sol', true);
    check('day: the home door has a moon bubble', await g.ev(() => { const d = G.day.homeDoor(G.field), p = G.MAPDATA.villa.pos.casaDoor; return !!d && d[0] === p[0] && d[1] === p[1]; }));
    await g.frames(10); await g.shot('sunset');
    // never forced: playing on changes nothing
    await g.frames(120);
    check('day: nothing happens while you play on', await g.ev(() => G.top() === G.field && !G.field.locked && G.field.mapId === 'villa'));
    await waitHint(g, 'at sunset');
    const dh = await tileXY(g, ...await g.ev(() => G.MAPDATA.villa.pos.casaDoor));
    check('day: idle at sunset, the hand shows the way home', near(await hintAt(g), dh[0], dh[1]), JSON.stringify(await hintAt(g)));
    await g.shot('sunset_hand');
    // somewhere else in town it's sunset too
    await g.ev(() => { G.field.player.x = 17; G.field.player.y = 12; G.field.snapCam(); });
    await g.frames(4); await g.shot('sunset_square');
    await g.ev(() => { G.field.player.x = 5; G.field.player.y = 19; G.field.snapCam(); });
    await g.frames(4);

    // home: good night, Hoy, the night, the morning
    await g.ev(() => { G.st.autosave = () => { window.__saves = (window.__saves || 0) + 1; }; });
    const door = await g.ev(() => G.MAPDATA.villa.pos.casaDoor);
    await g.ev(() => { const d = G.pet.npc(G.field); if (d) { d.x = 8; d.y = 19; d.ox = d.oy = 0; } }); // (Canelo, following, out of the way of the tap)
    await g.tapTile(...door);
    await g.until(() => G.field.mapId === 'casa' && G.top().constructor.name === 'TextBox', null, 'Mamá at home');
    check('day: coming home, Mamá says "¡Buenas noches, Luz!" (the moon picture: buenas noches is chapter 9\'s)', await g.ev(() => G.top().pages[0].t === '¡[buenasnoches], Luz!' && G.field.locked));
    await g.until(() => G.top().shown >= G.top().chars(0, 3), null, 'the line'); await g.shot('good_night');
    await g.tap(110, 120);
    await g.until(() => G.top().constructor.name === 'TodayCard', null, 'the Hoy card');
    check('day: the Hoy card has today\'s words and stars', await g.ev(() => G.top().words.join() === 'manzana,tres' && G.top().stars === 3));
    await g.until(() => G.top().revealed() && G.top().wait > 30, null, 'all of today on the card');
    check('day: each picture was said aloud', await g.ev(() => ['manzana', 'tres'].every(w => window.__speak.some(s => s.text === w))));
    await g.shot('hoy');
    const cell = await g.ev(() => G.top().cells()[0]);
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(cell);
    check('day: tapping a picture says it again (the card stays)', await g.ev(() => G.top().constructor.name === 'TodayCard' && G.top().sel === 0 && window.__speak.some(s => s.text === 'manzana')));
    await g.tap(160, 200);
    await g.until(() => G.top().constructor.name === 'Night' && G.fade.a === 0, null, 'the night');
    await g.frames(100); await g.shot('night');
    await g.until(() => G.top().constructor.name === 'Night' && G.top().phase === 1 && G.top().pt > 100, null, 'the sunrise');
    await g.shot('sunrise');
    await g.until(() => G.top().constructor.name === 'Choice', null, 'the morning', 20000);
    check('day: a new morning: Mamá\'s "¡Buenos días!" under the sun (say it back)', await g.ev(() => G.top().ch[G.top().o.answer].word === 'buenosdias' && G.top().o.show.icon === 'sol'));
    await g.frames(30); await g.shot('morning');
    check('day: the clock started again, the day\'s list too', await g.ev(() => G.sessionTime < 2 && !G.day.over() && G.day.today().words.length === 0));
    await g.ev(() => { G.debug.sunsetAt = null; }); // (or the test's early sunset would come again)
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => G.top() === G.field && !G.field.locked, null, 'free to play');
    check('day: you wake up beside your bed, free to play, and the game was saved', await g.ev(() => { const p = G.field.player; return p.x === 6 && p.y === 3 && window.__saves > 0; }), JSON.stringify(await g.ev(() => [G.field.player.x, G.field.player.y, window.__saves])));
    check('day: the morning star counts for the new day', await g.ev(() => G.day.today().stars === 1));
    await g.frames(10); await g.shot('morning_free');
    // back out to town: a sunny morning; coming home again does nothing special
    await g.tapTile(...await g.ev(() => [G.maps.casa.exits[0].x, G.maps.casa.exits[0].y]));
    await g.fieldIdle('villa');
    check('day: the sun is up again in town', await g.ev(() => G.day.glow() === 0 && !G.day.homeDoor(G.field)));
    await g.tapTile(...door);
    await g.fieldIdle('casa');
    await g.frames(30);
    check('day: home before sunset is just home', await g.ev(() => G.top() === G.field && !G.field.locked));
    check('day: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the end of the day with the keyboard, starting at home ----------
async function endOfDayKeys(browser) {
  const { ctx, g } = await open(browser, 'day-desk', false);
  try {
    await playing(g, 'casa', 3, 4, 'up'); // facing Mamá across the table
    await g.fieldIdle('casa');
    await g.ev(() => { G.debug.sunsetAt = 0; });
    await g.until(() => G.field.npc('mama').alert(), null, 'Mamá\'s bubble');
    check('desk: at home when the sun goes down, Mamá has a bubble', true);
    await g.press('z');
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá');
    check('desk: talking to her starts the evening', await g.ev(() => G.top().pages[0].t === '¡[buenasnoches], Luz!'));
    await g.ev(() => { G.debug.sunsetAt = null; });
    await evening(g, () => G.top() === G.field && !G.field.locked && G.field.player.x === 6);
    check('desk: the evening plays through with the keys', await g.ev(() => !G.day.over() && G.sessionTime < 30));
    check('desk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Tap hints and the end of the day', [['iPad: the first two minutes, the hand', firstMinutes], ['desktop: keys', keyboard], ['iPad: the end of the day', endOfDay], ['desktop: the end of the day', endOfDayKeys]]);
