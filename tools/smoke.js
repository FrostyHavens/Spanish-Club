// Smoke test: plays the opening of the game in a touch browser (iPad-sized, taps only) and a desktop
// browser (keyboard only), failing on any console error or page error.
//   NODE_PATH=$(npm root -g) node tools/smoke.js [screenshot dir]
// Uses the globally installed Playwright and its browsers (PLAYWRIGHT_BROWSERS_PATH); never installs anything.
// The tests read game state (G.top(), G.field, G.state) to find tap targets and right answers.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SCRATCH = '/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad';
const OUT = path.resolve(process.argv[2] || (fs.existsSync(SCRATCH) ? path.join(SCRATCH, 'shots') : path.join(os.tmpdir(), 'spanish-club-shots')));

const G_W = 320; // game width in pixels
const results = []; // {name, ok, msg}
const check = (name, ok, msg = '') => { results.push({ name, ok: !!ok, msg }); console.log((ok ? '  ok   ' : '  FAIL ') + name + (msg && !ok ? ' - ' + msg : '')); if (!ok) throw new Error(name + (msg ? ': ' + msg : '')); };

// ---------- a driven page ----------
class Game {
  constructor(page, name, touch) { this.page = page; this.name = name; this.touch = touch; this.errors = []; this.shots = 0; this.seen = new Set(); }
  ev(fn, arg) { return this.page.evaluate(fn, arg); }
  scene() { return this.ev(() => { const s = G.top(); return s ? s.constructor.name : null; }); }
  // poll a page-side condition (with a timeout) instead of sleeping
  async until(fn, arg, what, timeout = 20000) {
    try { await this.page.waitForFunction(fn, arg, { timeout, polling: 50 }); }
    catch (e) { throw new Error('timed out waiting for ' + what + ' (top scene: ' + await this.scene().catch(() => '?') + ')'); }
  }
  async frames(n) { const f = await this.ev(() => G.frame); await this.page.waitForFunction(f => G.frame >= f, f + n, { polling: 'raf' }); }
  // a point in GAME pixels (320x224) on the screen, through the canvas' on-screen rect
  screen(gx, gy) { return this.ev(([gx, gy]) => { const b = G.canvas.getBoundingClientRect(); return [b.left + gx * b.width / G.W, b.top + gy * b.height / G.H]; }, [gx, gy]); }
  // tap a point in game pixels, once taps count on the screen on top (a finger put down in the first moments
  // after a scene changes is ignored, see G.input.ready); raw: tap right away, like a child's quick double tap
  async tap(gx, gy, raw) {
    if (!raw) await this.until(() => G.input.ready(), null, 'taps to count');
    const [x, y] = await this.screen(gx, gy);
    if (this.touch) await this.page.touchscreen.tap(x, y); else await this.page.mouse.click(x, y);
    await this.frames(2);
  }
  tapRect(o) { return this.tap(o.x + o.w / 2, o.y + o.h / 2); }
  tapBtn([x, y]) { return this.tap(x + 10, y + 10); } // a 20x20 G.iconBtn at x,y
  async tapTile(tx, ty) { const p = await this.ev(([tx, ty]) => { const f = G.field, T = G.TILE; return [tx * T + T / 2 - Math.round(f.cam.x), ty * T + T / 2 - Math.round(f.cam.y)]; }, [tx, ty]); await this.tap(...p); }
  async press(key) { await this.page.keyboard.press(key); await this.frames(2); }
  async shot(label) { const f = path.join(OUT, `${this.name}_${String(++this.shots).padStart(2, '0')}_${label}.png`); await this.page.screenshot({ path: f }); }
  fieldIdle(map) { return this.until(m => G.field && G.top() === G.field && G.field.mapId === m && !G.field.locked && G.fade.a === 0 && !G.field.player.moving, map, 'free walking in ' + map); }

  // Play whatever is on top (dialogue, questions, cards, the notebook) until done() is true in the page.
  // Questions are answered right, using the answer the scene carries (G.ask passes it); wrongFirst taps a
  // wrong card on the first question to check that it greys out.
  async drive(done, what, o = {}) {
    const t0 = Date.now();
    let wrong = !!o.wrongFirst;
    while (!(await this.ev(done))) {
      if (Date.now() - t0 > 90000) throw new Error('stuck while ' + what + ' (top scene: ' + await this.scene() + ')');
      const s = await this.ev(() => {
        const s = G.top(); if (!s) return {};
        const r = { name: s.constructor.name, t: s.t };
        if (r.name === 'Choice') Object.assign(r, { answer: s.o.answer == null ? 0 : s.o.answer, rects: s.rects(), off: s.ch.map(c => !!c.off), cards: s.cards, i: s.i, spk: s.spk() });
        if (r.name === 'TextBox') Object.assign(r, { pi: s.pi, shown: s.shown, all: s.chars(0, s.scroll + 3), spk: s.spk(), noVoice: !!s.opts.noVoice });
        if (r.name === 'Notebook') r.close = s.closeXY();
        return r;
      });
      const first = s.name && !this.seen.has(s.name + (s.cards ? 'c' : ''));
      switch (s.name) {
        case 'TextBox':
          if (first && this.touch && !s.noVoice) { // the speaker button repeats the line and doesn't advance
            await this.until(() => G.top().shown >= G.top().chars(0, G.top().scroll + 3), null, 'text revealed');
            await this.shot('textbox'); this.seen.add('TextBox');
            await this.tapBtn(s.spk);
            check(this.name + ': speaker button keeps the dialogue open', await this.ev(pi => G.top().constructor.name === 'TextBox' && G.top().pi === pi, s.pi));
            break;
          }
          this.seen.add('TextBox');
          if (this.touch) await this.tap(110, 120); else await this.press('z');
          break;
        case 'Choice': {
          if (s.t <= 8) { await this.frames(4); break; }
          if (first) { await this.frames(6); await this.shot('choice_' + (s.cards ? 'cards' : 'list')); this.seen.add('Choice' + (s.cards ? 'c' : '')); }
          if (this.touch) {
            const k = wrong ? s.off.findIndex((off, k) => !off && k !== s.answer) : s.answer;
            if (wrong && k >= 0) {
              wrong = false;
              await this.tapRect(s.rects[k]);
              await this.until(k => G.top().constructor.name === 'Choice' && G.top().ch[k].off, k, 'the wrong card to grey out');
              check(this.name + ': a wrong card greys out and the question stays', true);
              await this.frames(10); await this.shot('choice_wrong');
              break;
            }
            await this.tapRect(s.rects[s.answer]);
          } else {
            const key = s.cards ? 'ArrowRight' : 'ArrowDown';
            for (let n = 0; n < s.rects.length && await this.ev(() => G.top().i) !== s.answer; n++) await this.press(key);
            await this.press('Enter');
          }
          break;
        }
        case 'WordCard': case 'BadgeCard': case 'QuestCard': case 'KeyHint': case 'Diploma': case 'QuestLog': {
          const ready = { WordCard: 20, BadgeCard: 40, QuestCard: 30, KeyHint: 30, Diploma: 60, QuestLog: 0 }[s.name];
          if (s.t <= ready) { await this.frames(ready + 2 - s.t); break; }
          if (first) { await this.shot(s.name); this.seen.add(s.name); }
          if (this.touch) await this.tap(150, 200); else await this.press('z');
          break;
        }
        case 'Notebook':
          if (first) { await this.frames(4); await this.shot('notebook'); this.seen.add('Notebook'); }
          if (this.touch) await this.tapBtn(s.close); else await this.press('x');
          break;
        default: await this.frames(4); // the field between lines, fades, the blank creator backdrop
      }
    }
  }
}

async function open(browser, name, touch) {
  const ctx = await browser.newContext(touch ? { viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { // log which input event each speak() call runs in (speech must start inside a tap)
    window.__speak = [];
    const ss = window.speechSynthesis, sp = ss && ss.speak.bind(ss);
    if (sp) ss.speak = u => { window.__speak.push({ text: u.text, during: window.event ? window.event.type : '' }); sp(u); };
  });
  const g = new Game(page, name, touch);
  page.on('console', m => { if (m.type() === 'error') g.errors.push('console.error: ' + m.text()); });
  page.on('pageerror', e => g.errors.push('pageerror: ' + (e.stack || e.message)));
  await page.goto(URL);
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title menu');
  return { ctx, g };
}

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
  await g.drive(() => G.state.quests.saludos === 'active' && G.top() === G.field && !G.field.locked, 'Luna\'s first errand');
  check(g.name + ': Luna gives the first errand (Saludos)', true);
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

    await g.tapRect(await g.ev(() => G.top().rowRect(0))); // Nuevo juego
    await g.until(() => G.top().constructor.name === 'Creator', null, 'the character creator');
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
    await g.ev(() => { const run = G.story.mamaIntro; window.__intros = 0; G.story.mamaIntro = function* () { window.__intros++; yield* run(); }; });
    await tapLetter('OK');

    await g.until(() => G.field && G.field.mapId === 'casa' && G.state.name === 'Luz' && G.state.look.gender === 'nina', null, 'the house');
    check('ipad: new game starts at home with the chosen look and name', true);
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('mama'); return [n.x, n.y]; })); // a quick tap on Mamá before her intro starts
    check('ipad: the house waits for Mamá\'s intro (a tap doesn\'t walk)', await g.ev(() => G.field.locked && !G.field.route));
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá to speak');
    await g.drive(() => G.state.flags.intro && G.top() === G.field && !G.field.locked, 'Mamá\'s intro', { wrongFirst: true });
    check('ipad: Mamá\'s intro played (once) by tapping', await g.ev(() => ['hola', 'buenosdias', 'adios'].every(G.st.knows) && window.__intros === 1), 'intros: ' + await g.ev(() => window.__intros));
    await g.shot('home');

    const door = await g.ev(() => [G.maps.casa.exits[0].x, G.maps.casa.exits[0].y]);
    await g.tapTile(...door);
    await g.fieldIdle('villa');
    check('ipad: tapping the door walks out of the house', true);
    await g.shot('villa');

    // the menu button opens the field menu, without walking
    const before = await g.ev(() => [G.field.player.x, G.field.player.y]);
    await g.tap(G_W - 16, 16);
    await g.until(() => G.top().constructor.name === 'CrossMenu', null, 'the field menu');
    check('ipad: the menu button opens the menu and doesn\'t walk', await g.ev(b => !G.field.route && G.field.player.x === b[0] && G.field.player.y === b[1], before));
    await g.frames(4); await g.shot('menu');
    const tapIcon = async d => g.tapRect(await g.ev(d => G.top().iconRect(d), d));
    await tapIcon('up');
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the notebook');
    await g.tapBtn(await g.ev(() => G.top().nextXY()));
    check('ipad: notebook > turns the page', await g.ev(() => G.top().pi === 1));
    await g.tapBtn(await g.ev(() => G.top().prevXY()));
    await g.tapRect(await g.ev(() => G.top().cellRect(2)));
    check('ipad: notebook < turns back, tapping a word picks it', await g.ev(() => G.top().pi === 0 && G.top().wi === 2));
    await g.shot('notebook_tapped');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'CrossMenu', null, 'back to the menu');
    await tapIcon('left');
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    await g.frames(4); await g.shot('questlog');
    await g.tap(160, 112);
    await g.until(() => G.top().constructor.name === 'CrossMenu', null, 'back to the menu');
    await tapIcon('down');
    await g.until(() => G.top().constructor.name === 'Options', null, 'Opciones');
    const bar = await g.ev(() => ({ x: G.top().barX(), y: G.top().rowRect(0).y + 9 }));
    await g.tap(bar.x + 3 * 9 + 4, bar.y); // 4th cell of the music bar
    check('ipad: tapping the music bar sets the volume', await g.ev(() => G.prefs.music === 4), 'music = ' + await g.ev(() => G.prefs.music));
    await g.tapRect(await g.ev(() => G.top().rowRect(4)));
    check('ipad: tapping a row changes it (English on)', await g.ev(() => G.state.opts.english === true));
    await g.shot('options');
    await g.tapRect(await g.ev(() => G.top().rowRect(4)));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'CrossMenu', null, 'back to the menu');
    await g.tap(G_W - 16, 16); // the close button sits where the menu button was
    await g.fieldIdle('villa');
    check('ipad: menu closed by its close button', await g.ev(() => !G.state.opts.english && G.prefs.music === 4));

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
    await g.ev(([map, x, y, dir, flags]) => { G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, flags || {}); G.goto(map, x, y, dir); }, [map, x, y, dir, flags]);
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
    await g.tapTile(4, 7); // the dark just below the door, before Mamá's intro
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
    await g.tapTile(21, 20); // a hidden notebook page sparkles here
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the page to be found');
    check('walk: tapping a sparkle finds the page', await g.ev(() => G.st.hasPage('colores')) && String(await facing()) === '21,20');

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
    await g.press('Enter'); // Nuevo juego
    await g.until(() => G.top().constructor.name === 'Creator', null, 'the character creator');
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
    await g.drive(() => G.state.flags.intro && G.top() === G.field && !G.field.locked, 'Mamá\'s intro');
    check('desktop: Mamá\'s intro played with the keyboard', await g.ev(() => ['hola', 'buenosdias', 'adios'].every(G.st.knows)));
    await g.page.keyboard.down('ArrowDown');
    await g.until(() => G.field.mapId === 'villa', null, 'leaving the house');
    await g.page.keyboard.up('ArrowDown');
    await g.fieldIdle('villa');
    check('desktop: walked out of the house with the arrow keys', true);
    await g.shot('villa');
    await g.press('x');
    check('desktop: X opens the field menu', await g.ev(() => G.top().constructor.name === 'CrossMenu'));
    await g.press('x');
    await g.fieldIdle('villa');
    await toSchool(g, true);
    await talkToLuna(g, true);
    check('desktop: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
  return g;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Club de Español smoke test\n  page: ' + URL + '\n  shots: ' + OUT);
  const browser = await chromium.launch();
  let failed = false;
  for (const [name, run] of [['iPad (touch)', touchRun], ['iPad tap-to-walk details', walkRun], ['desktop (keyboard)', keyboardRun]]) {
    console.log('\n' + name);
    try { await run(browser); }
    catch (e) { failed = true; if (!results.length || results[results.length - 1].ok) { results.push({ name: name + ' crashed', ok: false, msg: e.message }); console.log('  FAIL ' + e.message.split('\n')[0]); } }
  }
  await browser.close();
  const bad = results.filter(r => !r.ok);
  console.log('\n' + (failed || bad.length ? 'FAIL' : 'PASS') + ': ' + (results.length - bad.length) + '/' + results.length + ' checks passed');
  bad.forEach(r => console.log('  - ' + r.name + (r.msg ? ': ' + r.msg : '')));
  process.exit(failed || bad.length ? 1 : 0);
})();
