// Smoke test: plays the opening of the game in a touch browser (iPad-sized, taps only) and a desktop
// browser (keyboard only), failing on any console error or page error.
//   NODE_PATH=$(npm root -g) node tools/smoke.js [screenshot dir]
// Uses the globally installed Playwright and its browsers (PLAYWRIGHT_BROWSERS_PATH); never installs anything.
// The tests read game state (G.top(), G.field, G.state) to find tap targets and right answers.
// The driver (Game, open, check, run) lives in tools/harness.js.
'use strict';
const { open, check, run, G_W } = require('./harness');

// ---------- shared steps ----------
async function toSchool(g, byKeys) {
  const door = await g.ev(() => { const e = G.maps.villa.exits.find(e => e.to === 'escuela'); return [e.x, e.y]; });
  for (let i = 0; i < 40 && await g.ev(() => G.field.mapId) === 'villa'; i++) {
    if (await g.ev(() => G.top() !== G.field)) { await g.drive(() => G.top() === G.field, 'someone on the way'); continue; }
    if (byKeys) { // arrow keys along the game's own path to the door
      const st = await g.ev(([x, y]) => { const f = G.field, pl = f.plan({ x, y, exit: true }); return { dir: pl && pl.dir, p: [f.player.x, f.player.y] }; }, door);
      if (!st.dir && st.p[0] === door[0] && st.p[1] === door[1]) { await g.until(() => G.field.mapId !== 'villa', null, 'the school door to open'); break; }
      if (!st.dir) throw new Error('no path to the school door from ' + st.p);
      const key = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[st.dir];
      await g.page.keyboard.down(key);
      await g.until(p => !G.field || G.field.mapId !== 'villa' || G.field.player.x !== p[0] || G.field.player.y !== p[1] || G.top() !== G.field, st.p, 'a step');
      await g.page.keyboard.up(key);
      await g.until(() => !G.field || G.field.mapId !== 'villa' || !G.field.player.moving, null, 'the step to end');
      i--; if (await g.ev(() => G.field.stepCount) > 200) throw new Error('too many steps');
      continue;
    }
    // taps: the visible tile nearest the door that is a plain walk (no one to talk to, nothing to search, clear of the menu button)
    const tgt = await g.ev(([dx, dy]) => {
      const f = G.field, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
      let best = null;
      for (let y = Math.ceil((cy + 32) / T); (y + 1) * T <= cy + G.H; y++) for (let x = Math.ceil(cx / T); (x + 1) * T <= cx + G.W; x++) {
        const t = f.tapTarget({ x: x * T + 12 - cx, y: y * T + 12 - cy });
        const ok = t.exit ? t.x === dx && t.y === dy : !t.npc && !t.search && !f.blocked(x, y, f.player);
        const d = Math.abs(x - dx) + Math.abs(y - dy);
        if (ok && (!best || d < best.d)) best = { x, y, d, sx: x * T + 12 - cx, sy: y * T + 12 - cy, exit: !!t.exit };
      }
      return best;
    }, door);
    if (!tgt) throw new Error('no tile to tap toward the school');
    await g.tap(tgt.sx, tgt.sy);
    if (i === 0) { check(g.name + ': tapping the map starts a walk with a marker', await g.ev(() => !!(G.field.route && G.field.route.end))); await g.frames(4); await g.shot('walk_marker'); }
    await g.until(() => !G.field || G.field.mapId !== 'villa' || G.top() !== G.field || (!G.field.route && !G.field.player.moving), null, 'the tap walk to finish');
  }
  await g.fieldIdle('escuela');
  check(g.name + ': reached the school', true);
}

async function talkToLuna(g, byKeys) {
  const luna = await g.ev(() => { const n = G.field.npc('luna'); return [n.x, n.y]; });
  if (byKeys) {
    for (let i = 0; i < 30; i++) {
      const st = await g.ev(() => { const f = G.field, pl = f.plan({ npc: f.npc('luna') }); return { dir: pl.dir, face: pl.face, p: [f.player.x, f.player.y] }; });
      const key = d => ({ up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[d]);
      if (!st.dir) { await g.press(key(st.face)); await g.press('z'); break; }
      await g.page.keyboard.down(key(st.dir));
      await g.until(p => G.field.player.x !== p[0] || G.field.player.y !== p[1], st.p, 'a step');
      await g.page.keyboard.up(key(st.dir));
      await g.until(() => !G.field.player.moving, null, 'the step to end');
    }
  } else await g.tapTile(...luna);
  await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.name === G.nameOf('luna'), null, 'Profesora Luna to talk');
  check(g.name + ': talking to Profesora Luna', true);
  await g.frames(30); await g.shot('luna');
  await g.drive(() => G.top() === G.field && !G.field.locked, 'Luna\'s hello');
  check(g.name + ': Luna says hello (her school is chapter 8)', true);
}

// ---------- iPad: taps only ----------
async function touchRun(browser) {
  const { ctx, g } = await open(browser, 'ipad', true);
  try {
    const padShown = () => g.ev(() => { const e = document.getElementById('tcpad'); return !!e && getComputedStyle(e).display !== 'none'; });
    check('ipad: touch screen detected', await g.ev(() => G.touch));
    check('ipad: D-pad hidden by default', !(await padShown()));
    await g.ev(() => G.setDpad(true));
    check('ipad: G.setDpad(true) shows it and remembers', await padShown() && await g.ev(() => G.prefs.dpad === true && JSON.parse(localStorage.getItem('spanishclub_prefs')).dpad === true));
    await g.ev(() => G.setDpad(false));
    check('ipad: G.setDpad(false) hides it', !(await padShown()) && await g.ev(() => G.prefs.dpad === false));
    await g.shot('title');

    await g.toCreator(); // a tap on the title: no saves yet, so straight into the creator
    check('ipad: speech is primed when the finger lifts', await g.ev(() => window.__speak.length > 0 && ['pointerup', 'touchend'].includes(window.__speak[0].during)), JSON.stringify(await g.ev(() => window.__speak[0])));
    const tapOpt = async (r, k) => g.tapRect(await g.ev(([r, k]) => G.top().optRects(r)[k], [r, k]));
    await tapOpt(0, 1); await tapOpt(1, 3); await tapOpt(2, 3); await tapOpt(3, 2); await tapOpt(4, 4);
    const ok = await g.ev(() => { const l = G.top().look, L = G.data.looks; return l.gender === 'nina' && l.skin === L.skins[3] && l.style === L.styles[3] && l.hair === L.hairs[2] && l.outfit === L.outfits[4]; });
    check('ipad: creator options picked by tapping', ok);
    await g.frames(10); await g.shot('creator');
    await tapOpt(5, 1); // ✓
    await g.until(() => G.top().constructor.name === 'NameEntry' && G.top().t > 6, null, 'the name screen');
    const tapLetter = async ch => g.tapRect(await g.ev(ch => { const s = G.top(); for (let r = 0; r < s.grid.length; r++) { const c = s.grid[r].indexOf(ch); if (c >= 0) return s.cellRect(r, c); } }, ch));
    for (const ch of ['L', 'U', 'X', 'DEL', 'Z']) await tapLetter(ch);
    check('ipad: name typed on the letter grid', await g.ev(() => G.top().name === 'Luz'), await g.ev(() => G.top().name));
    await g.shot('name');
    await tapLetter('OK');

    await g.until(() => G.field && G.field.mapId === 'casa' && G.state.name === 'Luz' && G.state.look.gender === 'nina', null, 'the house');
    check('ipad: new game starts at home with the chosen look and name', true);
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('mama'); return [n.x, n.y]; })); // a quick tap on Mamá before her intro starts
    check('ipad: the house waits a moment before chapter 1 (a tap doesn\'t walk)', await g.ev(() => G.field.locked && !G.field.route));
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá to speak');
    await g.drive(() => !!G.state.finds.perro && G.top() === G.field && !G.field.locked, 'chapter 1: Mamá, and a puppy bursts in', { wrongFirst: true });
    check('ipad: chapter 1 starts by itself: hola met, the puppy hides (a find-it puzzle)', await g.ev(() => G.chapters.active('c1') && G.st.seen('hola') && !G.st.seen('perro') && G.field.npc('canelo').hidden));
    await g.shot('home');
    await g.tapTile(3, 3); // the table he hides under
    await g.drive(() => { const b = G.chapters.beat('c1'); return !!b && !!b.door && G.top() === G.field && !G.field.locked; }, 'chapter 1');
    check('ipad: found him: chapter 1 played by tapping (hola, perro, guau, ven), Canelo is yours', await g.ev(() => ['hola', 'perro', 'guau', 'ven'].every(G.st.seen) && G.pet.mine()));

    const door = await g.ev(() => [G.maps.casa.exits[0].x, G.maps.casa.exits[0].y]);
    await g.tapTile(...door);
    await g.drive(() => G.field && G.field.mapId === 'villa' && (G.state.ch.step.c2 | 0) >= 1 && G.top() === G.field && !G.field.locked && G.fade.a === 0, 'out of the house: Canelo at the door, then the butterfly');
    check('ipad: tapping the door: Canelo comes along (chapter 1 done), out in town chapter 2 begins', await g.ev(() => G.chapters.done('c1') && G.chapters.active('c2')));
    await g.shot('villa');

    // the menu button opens the field menu, without walking
    const before = await g.ev(() => [G.field.player.x, G.field.player.y]);
    await g.tap(G_W - 16, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the field menu');
    check('ipad: the menu button opens the menu and doesn\'t walk', await g.ev(b => !G.field.route && G.field.player.x === b[0] && G.field.player.y === b[1], before));
    await g.frames(4); await g.shot('menu');
    const tapIcon = async k => g.tapRect(await g.ev(k => G.top().rect(k), k));
    await g.ev(() => G.words.meet('uno', 'test')); // a second topic met: a second page
    await tapIcon('book');
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the notebook');
    await g.tapBtn(await g.ev(() => G.top().nextXY()));
    check('ipad: notebook > turns the page', await g.ev(() => G.top().pi === 1));
    await g.tapBtn(await g.ev(() => G.top().prevXY()));
    await g.tapRect(await g.ev(() => G.top().cellRect(2)));
    check('ipad: notebook < turns back, tapping a word picks it', await g.ev(() => G.top().pi === 0 && G.top().wi === 2));
    await g.shot('notebook_tapped');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    await tapIcon('quest');
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    await g.frames(4); await g.shot('questlog');
    await g.tap(160, 112);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    await g.tap(G_W - 16, 16); // the close button sits where the menu button was
    await g.fieldIdle('villa');
    check('ipad: menu closed by its close button', true); // the grown-ups menu (was Opciones) is tested in tools/test-saves.js

    await toSchool(g, false);
    await talkToLuna(g, false);
    check('ipad: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
  return g;
}
// ---------- iPad: tap-to-walk details, each from a fresh spot on a map ----------
async function walkRun(browser) {
  const { ctx, g } = await open(browser, 'ipad-walk', true);
  const go = async (map, x, y, dir, flags) => {
    await g.ev(([map, x, y, dir, flags]) => {
      G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, flags || {});
      if (flags && flags.intro) Object.assign(G.state.quests, { c1: 'done', c2: 'done' }); // (the story's first day behind you)
      else Object.assign(G.state.quests, { c1: 'active' }), G.state.ch.step = { c1: 1 }; // (chapter 1 waiting for its puppy to be found)
      G.goto(map, x, y, dir);
    }, [map, x, y, dir, flags]);
    await g.fieldIdle(map);
  };
  const talking = who => g.until(n => G.top().constructor.name === 'TextBox' && G.top().opts.name === G.nameOf(n), who, who + ' to talk');
  const facing = () => g.ev(() => G.field.facing());
  const faces = id => g.ev(id => { // the player faces this person, maybe across a counter (like interact)
    const f = G.field, [x, y] = f.facing(), [dx, dy] = G.DIRS[f.player.dir], at = (x, y) => f.npcs.find(n => n.x === x && n.y === y);
    const n = at(x, y) || ('etaY'.includes(f.map.get(x, y)) && at(x + dx, y + dy)); return !!n && n.id === id;
  }, id);
  const opened = async (make, ready = 0) => { await g.ev(make); await g.until(t => G.top() !== G.field && G.top().t > t, ready, 'the scene'); };
  const result = () => g.ev(() => window.__w.done() ? window.__w.result : 'open');
  try {
    await go('casa', 4, 4, 'down');
    await g.tapTile(4, 7); // the dark just below the door, before chapter 1 is done
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá calling you back');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'Mamá calling');
    check('walk: a guarded door runs its guard (Mamá calls you back), you stay home', await g.ev(() => G.field.mapId === 'casa' && !G.field.route));
    await g.tapTile(3, 1); // the tile above Mamá, where her head and "!" are
    await talking('mama');
    check('walk: tapping above a person walks up to them (the table counts), faces them and talks', await faces('mama'));

    await go('panaderia', 5, 6, 'up');
    await g.tapTile(5, 2);
    await talking('marta');
    check('walk: talks across a counter', await faces('marta') && await g.ev(() => G.field.player.y === 4));

    await go('villa', 14, 13, 'up', { intro: true });
    await g.tapTile(14, 10); // Don Pepe's stall
    await talking('pepe');
    check('walk: tapping a stall talks to the person behind it', await faces('pepe'));

    await go('villa', 3, 9, 'down', { intro: true });
    await g.tapTile(2, 6); // a shrub
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.noVoice, null, 'searching the shrub');
    check('walk: tapping an object walks up to it and searches it', String(await facing()) === '2,6');

    await go('villa', 22, 23, 'up', { intro: true });
    check('walk: a page puzzle waits until 4 words of its page are known (no sparkle)', await g.ev(() => !G.pages.ready('colores')));
    await g.ev(() => ['rojo', 'azul', 'verde', 'amarillo'].forEach(id => { G.words.meet(id, 'test'); Object.assign(G.words.rec(id), { st: 2, ms: G.words.sess() - 1 }); }));
    await g.tapTile(21, 20); // a notebook page puzzle sparkles here
    await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the page puzzle');
    check('walk: tapping a sparkle opens its page puzzle', await g.ev(() => G.top().page === 'colores') && String(await facing()) === '21,20');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    check('walk: closing the puzzle leaves the sparkle', await g.ev(() => G.top() !== null && G.pages.ready('colores') && !G.st.hasPage('colores')));

    await go('villa', 5, 18, 'down', { intro: true });
    await g.tapTile(10, 21);
    await g.frames(5);
    await g.tapTile(1, 21);
    check('walk: a new tap while walking changes the destination', await g.ev(() => G.field.route && G.field.route.x === 1 && G.field.route.y === 21));
    await g.press('ArrowDown');
    check('walk: a key press cancels the tap walk', await g.ev(() => !G.field.route));

    await go('villa', 17, 19, 'down', { intro: true });
    await g.tapTile(19, 21); // the pond
    await g.until(() => !G.field.route && !G.field.player.moving, null, 'walking to the pond');
    check('walk: an unreachable spot walks as close as it can', await g.ev(() => { const p = G.field.player; return Math.abs(p.x - 19) + Math.abs(p.y - 21) === 1 && G.top() === G.field; }));
    await g.shot('pond');

    // a tap walk ends when a cutscene locks the field (it doesn't carry on afterwards)
    await go('villa', 5, 18, 'down', { intro: true });
    await g.tapTile(10, 21);
    await g.until(() => G.field.player.moving, null, 'the walk to start');
    await g.ev(() => { G.field.locked = true; });
    await g.until(() => !G.field.player.moving, null, 'the step to end');
    const stop = await g.ev(() => [G.field.player.x, G.field.player.y]);
    await g.ev(() => { G.field.locked = false; });
    await g.frames(40);
    check('walk: a cutscene ends a tap walk', await g.ev(p => !G.field.route && G.field.player.x === p[0] && G.field.player.y === p[1], stop));

    // a person who is mid-step is tapped where they are drawn
    const mid = await g.ev(() => {
      const f = G.field, n = f.npcs.find(n => n.wander && n.talk && n.spec && !n.hidden && !n.moving && !f.blocked(n.x + 1, n.y, n) && !f.exitAt(n.x + 1, n.y));
      if (!n) return 'no wandering person with room to step';
      n.wander = 0; f.tasks.add(f.step(n, 'right', 1.5)); return n.id;
    });
    await g.frames(5);
    check('walk: tapping a person mid-step talks to them', await g.ev(id => {
      const f = G.field, n = f.npc(id), T = G.TILE;
      return n.ox < -T / 2 && f.tapTarget({ x: n.x * T + n.ox + T / 2 - Math.round(f.cam.x), y: n.y * T + T / 2 - Math.round(f.cam.y) }).npc === n;
    }, mid), mid);

    // a quick double tap on the line before a question doesn't answer it
    await g.ev(() => { window.__w = null; G.field.tasks.add((function* () { yield G.say('¡Hola!'); window.__w = G.choose({ prompt: '¿...?', layout: 'cards', choices: [{ word: 'manzana' }, { word: 'hola' }, { word: 'pelota' }], answer: 1 }); })()); });
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().shown >= G.top().chars(0, 3) && G.input.ready(), null, 'the line');
    await g.tap(100, 190, true); await g.page.waitForTimeout(250); await g.tap(100, 190, true); // over the first card
    await g.until(() => window.__w && G.top().constructor.name === 'Choice', null, 'the question');
    await g.frames(30);
    check('walk: a double tap on a line doesn\'t answer the next question', await g.ev(() => G.top().constructor.name === 'Choice' && !window.__w.done() && G.top().ch.every(c => !c.off)));
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    check('walk: ...and the next tap does', await g.ev(() => window.__w.done() && window.__w.result === 1));

    // only the game picture takes taps: not the black margins, and a thumb resting there doesn't block the other hand
    await g.fieldIdle('villa');
    const vp = g.page.viewportSize(), cdp = await g.page.context().newCDPSession(g.page), rest = { x: 6, y: vp.height / 2, id: 7 };
    await g.until(() => G.input.ready(), null, 'taps to count');
    await g.page.touchscreen.tap(vp.width / 2, vp.height - 6); await g.frames(3);
    check('walk: a tap on the black margin does nothing', await g.ev(() => !G.field.route && !G.input.ptr.down));
    await opened(() => { window.__w = G.menu(['Uno', 'Dos', 'Tres']); });
    await g.until(() => G.input.ready(), null, 'taps to count');
    const [rx, ry] = await g.screen(...await g.ev(() => { const r = G.top().rowRect(2); return [r.x + r.w / 2, r.y + r.h / 2]; }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [rest] }); await g.frames(3);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [rest, { x: rx, y: ry, id: 8 }] }); await g.frames(2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: rx, y: ry, id: 8 }] }); await g.frames(3);
    check('walk: a finger resting on the margin doesn\'t block taps', await g.ev(() => window.__w.done() && window.__w.result === 2));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await g.frames(2);

    // press-and-hold: G.input.holding counts frames; a long press is not a tap (so it doesn't walk)
    const [hx, hy] = await g.screen(100, 150);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: hx, y: hy }] });
    await g.frames(60);
    const held = await g.ev(() => G.input.holding(90, 140, 20, 20));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await g.frames(3);
    check('walk: press-and-hold counts frames, and a long press is not a tap', held >= 50 && await g.ev(() => !G.input.ptr.down && !G.field.route), 'held ' + held);

    // scenes the opening doesn't reach, pushed directly over the field
    await opened(() => { window.__w = G.menu(['Uno', 'Dos', 'Tres'], { title: 'Menú' }); });
    await g.shot('listmenu');
    await g.tapRect(await g.ev(() => G.top().rowRect(1)));
    check('walk: tapping a list menu row picks it', await result() === 1);
    await opened(() => { window.__w = G.menu(['Uno', 'Dos']); });
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    check('walk: a list menu\'s close button cancels it', await result() === -1);
    await opened(() => { window.__w = G.choose({ prompt: '¿Repaso?', show: 'pagina', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], cancel: true }); }, 8);
    await g.shot('choice_cancel');
    await g.tapBtn(await g.ev(() => G.top().backXY()));
    check('walk: a question with a way out has a back button', await result() === -1);
    await opened(() => { window.__w = G.badge('saludos'); }, 40);
    await g.shot('badge'); await g.tap(160, 112);
    check('walk: a tap closes the badge card', await result() !== 'open');
    await opened(() => { window.__w = G.story.diploma(); }, 60);
    await g.shot('diploma'); await g.tap(160, 112);
    check('walk: a tap closes the diploma', await result() !== 'open');
    check('ipad-walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- desktop: keyboard only ----------
async function keyboardRun(browser) {
  const { ctx, g } = await open(browser, 'desktop', false);
  try {
    check('desktop: no on-screen pad', await g.ev(() => !document.getElementById('tcpad')));
    await g.toCreator(); // Enter on the title: no saves yet, so straight into the creator
    await g.press('ArrowRight'); // niña
    const d = await g.ev(() => { const d = G.data.defaultLook('nina'), L = G.data.looks; return { skin: L.skins.indexOf(d.skin), style: L.styles.indexOf(d.style) }; });
    await g.press('ArrowDown'); await g.press('ArrowRight'); await g.press('ArrowRight'); // skin: two to the right
    await g.press('ArrowDown'); await g.press('ArrowLeft'); // hairstyle: one to the left
    check('desktop: creator changed with arrow keys', await g.ev(d => { const l = G.top().look, L = G.data.looks, n = L.styles.length; return l.gender === 'nina' && l.skin === L.skins[(d.skin + 2) % L.skins.length] && l.style === L.styles[(d.style + n - 1) % n]; }, d));
    await g.press('Enter'); await g.press('Enter'); // A jumps to ✓, A again opens the name screen
    await g.until(() => G.top().constructor.name === 'NameEntry' && G.top().t > 6, null, 'the name screen');
    await g.page.keyboard.type('Leox'); await g.press('Backspace');
    check('desktop: name typed on the keyboard', await g.ev(() => G.top().name === 'Leo'));
    await g.press('Enter');
    await g.until(() => G.field && G.field.mapId === 'casa' && G.state.name === 'Leo', null, 'the house');
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá to speak');
    await g.drive(() => !!G.state.finds.perro && G.top() === G.field && !G.field.locked, 'chapter 1 by keys');
    await g.ev(() => { const p = G.field.player; p.x = 3; p.y = 4; p.dir = 'up'; G.field.snapCam(); });
    await g.press('z'); // facing the table he hides under
    await g.drive(() => { const b = G.chapters.beat('c1'); return !!b && !!b.door && G.top() === G.field && !G.field.locked; }, 'chapter 1 by keys');
    check('desktop: chapter 1 played with the keyboard', await g.ev(() => ['hola', 'perro', 'guau', 'ven'].every(G.st.seen)));
    await g.ev(() => { const p = G.field.player; p.x = 4; p.y = 5; p.dir = 'down'; G.field.snapCam(); });
    await g.page.keyboard.down('ArrowDown');
    await g.until(() => G.field.mapId === 'villa' || G.top() !== G.field || G.field.locked, null, 'the door');
    await g.page.keyboard.up('ArrowDown');
    await g.drive(() => G.field && G.field.mapId === 'villa' && (G.state.ch.step.c2 | 0) >= 1 && G.top() === G.field && !G.field.locked && G.fade.a === 0, 'leaving the house');
    check('desktop: walked out of the house with the arrow keys', true);
    await g.shot('villa');
    await g.press('x');
    check('desktop: X opens the field menu', await g.ev(() => G.top().constructor.name === 'FieldMenu'));
    await g.press('x');
    await g.fieldIdle('villa');
    await toSchool(g, true);
    await talkToLuna(g, true);
    check('desktop: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
  return g;
}

run('Club de Español smoke test', [['iPad (touch)', touchRun], ['iPad tap-to-walk details', walkRun], ['desktop (keyboard)', keyboardRun]]);
