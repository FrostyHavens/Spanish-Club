// Test harness for Club de Español: drives index.html in headless Chromium through the globally installed
// Playwright (NODE_PATH=$(npm root -g)); never installs anything. Used by tools/smoke.js and tools/test-*.js.
//
// Writing a new test, tools/test-<feature>.js (tools/test-all.sh runs it after the smoke test):
//   'use strict';
//   const { run, open, check } = require('./harness');
//   run('my feature', async browser => {
//     const { ctx, g } = await open(browser, 'feat', true);      // true: iPad-sized touch page, false: desktop keys
//     try {
//       await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; G.goto('villa', 5, 18, 'down'); });
//       await g.fieldIdle('villa');                               // poll page state with g.until(), never sleep
//       await g.tapTile(10, 21);                                  // or g.press('z'), g.tapRect(rect), g.drive(done, what)
//       check('feat: something true in the page', await g.ev(() => G.field.route != null));
//       check('feat: no console errors', !g.errors.length, g.errors.join('\n'));
//     } finally { await ctx.close(); }
//   });
// Run it with: NODE_PATH=$(npm root -g) node tools/test-<feature>.js [screenshot dir]
// The page is ../index.html relative to THIS file, so a copy of the repo (e.g. a git worktree) tests its own code.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SCRATCH = '/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad';
const OUT = path.resolve(process.argv[2] || (fs.existsSync(SCRATCH) ? path.join(SCRATCH, 'shots') : path.join(os.tmpdir(), 'spanish-club-shots')));

const G_W = 320; // game width in pixels
const results = []; // {name, ok, msg}
// record a check and print it; a failed check throws, ending the current section
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

const launch = () => chromium.launch();

// Run a test file: run(title, async browser => {...}) or run(title, [[sectionName, async browser => {...}], ...]).
// Each section runs in turn on one shared browser (a throw fails that section and moves on); prints the
// PASS/FAIL summary and exits with 0 or 1.
function run(title, sections) {
  if (typeof sections === 'function') sections = [[title, sections]];
  return (async () => {
    fs.mkdirSync(OUT, { recursive: true });
    console.log(title + '\n  page: ' + URL + '\n  shots: ' + OUT);
    const browser = await launch();
    let failed = false;
    for (const [name, fn] of sections) {
      console.log('\n' + name);
      try { await fn(browser); }
      catch (e) { failed = true; if (!results.length || results[results.length - 1].ok) { results.push({ name: name + ' crashed', ok: false, msg: e.message }); console.log('  FAIL ' + e.message.split('\n')[0]); } }
    }
    await browser.close();
    const bad = results.filter(r => !r.ok);
    console.log('\n' + (failed || bad.length ? 'FAIL' : 'PASS') + ': ' + (results.length - bad.length) + '/' + results.length + ' checks passed');
    bad.forEach(r => console.log('  - ' + r.name + (r.msg ? ': ' + r.msg : '')));
    process.exit(failed || bad.length ? 1 : 0);
  })().catch(e => { console.log('FAIL: ' + (e.stack || e.message)); process.exit(1); });
}

module.exports = { Game, open, check, results, run, launch, chromium, URL, ROOT, OUT, G_W };
