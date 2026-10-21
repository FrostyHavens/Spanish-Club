// ===== Core: canvas, loop, input, RNG, scenes =====
'use strict';
const G = window.G = {};
G.W = 320; G.H = 224;
G.TILE = 24;

// ---------- RNG (seedable, deterministic for tests) ----------
G.rngState = (Date.now() ^ 0x5bd1e995) >>> 0;
G.rand = function () { // xorshift32 -> [0,1)
  let x = G.rngState; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
  G.rngState = x; return x / 4294967296;
};
G.r = n => (n <= 0 ? 0 : Math.floor(G.rand() * n)); // 0..n-1
G.chance = n => G.r(n) === 0; // 1 in n
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Canvas ----------
G.canvas = document.getElementById('screen');
G.ctx = G.canvas.getContext('2d');
G.canvas.width = G.W; G.canvas.height = G.H;
G.ctx.imageSmoothingEnabled = false;
G.makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return c; };
function resize() {
  const s = Math.max(1, Math.floor(Math.min(window.innerWidth / G.W, window.innerHeight / G.H) * 4) / 4);
  G.canvas.style.width = (G.W * s) + 'px'; G.canvas.style.height = (G.H * s) + 'px';
}
window.addEventListener('resize', resize); resize();

// ---------- Input ----------
// A = confirm/talk, B = cancel, C = menu / English help, plus directions.
G.keys = {}; G.pressed = {}; G.repeatT = {};
const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  KeyZ: 'A', Space: 'A', Enter: 'A', KeyJ: 'A',
  KeyX: 'B', Escape: 'B', Backspace: 'B', KeyK: 'B',
  KeyC: 'C', ShiftLeft: 'C', ShiftRight: 'C', KeyL: 'C',
  KeyM: 'M', KeyV: 'V'
};
// Space is push-to-talk (the mic, 'V') while the screen on top has a mic ready, else it's A
const keyOf = e => e.code === 'Space' && G.spaceTalks && G.spaceTalks() ? 'V' : KEYMAP[e.code];
window.addEventListener('keydown', e => {
  // while typing a name, printable keys, Backspace and Enter go to the text field instead of the buttons
  if (G.textInput && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) {
    e.preventDefault(); G.audio && G.audio.unlock(); G.textInput(e.key); return;
  }
  const k = keyOf(e); if (!k) return;
  e.preventDefault();
  if (!G.keys[k]) { G.pressed[k] = true; G.repeatT[k] = 0; }
  G.keys[k] = true;
  G.audio && G.audio.unlock(); G.primeSpeech && G.primeSpeech();
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) { G.keys[k] = false; } if (e.code === 'Space') G.keys.V = false; });
window.addEventListener('blur', () => { G.keys = {}; G.input.ptr.down = false; });

// ---------- Pointer (touch / mouse / pen), in game pixels ----------
// Input API, shared by every scene (keyboard and taps run side by side; a scene checks both):
//   G.input.p(k) h(k) rep(k) dir() repDir()  keys / D-pad: 'up' 'down' 'left' 'right' 'A' 'B' 'C' 'M', 'V' (the mic)
//   G.input.keyHeld(k)    frames key k has been held down (0 = up), for press-and-hold on the keyboard
//   G.input.tap()         {x, y} of a tap released this frame (short press, little movement), else null.
//                         Only presses on the game picture count (not the black margins), the newest finger wins,
//                         and a finger that went down less than 0.4 s after the top scene changed is ignored, so a
//                         double tap can't answer a question (or walk, or close a menu) the child hasn't seen yet
//   G.input.ready()       a tap starting now would count (the top scene has been up for that grace period)
//   G.input.eat()         takes this frame's tap (returns it) so nothing after sees it (e.g. the map's menu button).
//                         Only the top scene updates each frame. The field reads a map tap without eating it, so its
//                         tasks (run inside its update, after the tap-to-walk check) still see it
//   G.input.ptr           live pointer {down, x, y, sx, sy, held}: sx,sy = where it went down, held = frames down
//   G.input.holding(x,y,w,h)  frames the pointer has been held inside the rect (pressed there on this scene,
//                         still there), else 0: for press-and-hold buttons (a long press is never a tap)
//   G.tapIn(x, y, w, h)   this frame's tap is inside the rect (or G.tapIn({x, y, w, h}))
//   G.touch               true on touch screens; G.setDpad(on) shows/hides the HTML D-pad + A/B/C buttons
//                         (hidden by default; the choice is G.prefs.dpad, saved per device)
// On-canvas buttons (ui.js), 20x20 game px, tap area padded to 28x28; pressed look while held:
//   G.iconBtn(ctx, kind, x, y) + G.btnHit(x, y)   kind: 'close' 'back' 'next' 'speaker' 'menu'
//   G.closeBtn(ctx, x, y) + G.closeHit(x, y)      close / back (default spot: top-right of the screen)
//   G.speakerBtn(ctx, x, y) + G.speakerHit(x, y)  "hear it again" (same as C)
// Taps and key presses are both edge-triggered and cleared at the end of every frame. Scenes keep their tap
// areas in small methods (rects(), rowRect(i), closeXY()...) shared by update and draw; tools/smoke.js uses them too.
G.touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
const ptr = { down: false, x: 0, y: 0, sx: 0, sy: 0, held: 0 };
let tapNow = null, ptrId = null, ptrT0 = 0, ptrF = 0, sceneF = 0;
const TAP_MOVE = 12, TAP_MS = 800; // a tap: moved at most 12 game px, released within 0.8 s
const TAP_GRACE = 24;              // frames after the top scene changes before a new finger counts (a double tap)
function gameXY(e) {
  const r = G.canvas.getBoundingClientRect();
  return [G.clamp((e.clientX - r.left) * G.W / r.width, 0, G.W - 0.01), G.clamp((e.clientY - r.top) * G.H / r.height, 0, G.H - 0.01)];
}
// Speech may only start inside a user activation: a key, a mouse press, or a finger (or pen) lifting.
const wake = prime => { G.audio && G.audio.unlock(); if (prime && G.primeSpeech) G.primeSpeech(); };
window.addEventListener('pointerdown', e => {
  wake(e.pointerType === 'mouse');
  if (e.target !== G.canvas || (e.pointerType === 'mouse' && e.button !== 0)) return; // the margins and the D-pad aren't taps
  const [x, y] = gameXY(e); // a new finger takes over from one already down (say, a thumb resting on the edge)
  Object.assign(ptr, { down: true, x, y, sx: x, sy: y, held: 0 }); ptrId = e.pointerId; ptrT0 = performance.now(); ptrF = G.frame;
});
window.addEventListener('pointermove', e => { if (ptr.down && e.pointerId === ptrId) [ptr.x, ptr.y] = gameXY(e); });
window.addEventListener('pointerup', e => {
  wake(e.pointerType !== 'mouse');
  if (!ptr.down || e.pointerId !== ptrId) return;
  [ptr.x, ptr.y] = gameXY(e); ptr.down = false; ptr.held = 0;
  if (Math.hypot(ptr.x - ptr.sx, ptr.y - ptr.sy) <= TAP_MOVE && performance.now() - ptrT0 <= TAP_MS) tapNow = { x: ptr.x, y: ptr.y, f: ptrF };
});
window.addEventListener('pointercancel', e => { if (e.pointerId === ptrId) { ptr.down = false; ptr.held = 0; } });
window.addEventListener('touchend', () => wake(true));
G.canvas.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault()); // no pinch-zoom on iOS
const inRect = (px, py, x, y, w, h) => px >= x && px < x + w && py >= y && py < y + h;
G.tapIn = (x, y, w, h) => { if (typeof x === 'object') ({ x, y, w, h } = x); const t = G.input.tap(); return !!t && inRect(t.x, t.y, x, y, w, h); };

G.input = {
  // edge-triggered
  p(k) { return !!G.pressed[k]; },
  // held
  h(k) { return !!G.keys[k]; },
  keyHeld(k) { return G.keys[k] ? (G.repeatT[k] || 0) + 1 : 0; },
  // edge + auto-repeat (for cursors/menus)
  rep(k, delay = 14, rate = 5) {
    if (G.pressed[k]) return true;
    if (!G.keys[k]) return false;
    const t = G.repeatT[k] || 0;
    return t >= delay && (t - delay) % rate === 0;
  },
  dir() { // held direction (for walking)
    if (G.keys.up) return 'up'; if (G.keys.down) return 'down';
    if (G.keys.left) return 'left'; if (G.keys.right) return 'right'; return null;
  },
  repDir(delay, rate) {
    for (const d of ['up', 'down', 'left', 'right']) if (this.rep(d, delay, rate)) return d;
    return null;
  },
  ptr,
  tap() { return tapNow && tapNow.f >= sceneF + TAP_GRACE ? tapNow : null; },
  ready() { return G.frame >= sceneF + TAP_GRACE; },
  eat() { const t = this.tap(); tapNow = null; return t; },
  holding(x, y, w, h) { return ptr.down && ptrF >= sceneF && inRect(ptr.sx, ptr.sy, x, y, w, h) && inRect(ptr.x, ptr.y, x, y, w, h) ? ptr.held + 1 : 0; },
  sceneChanged() { sceneF = G.frame; },
  endFrame() { G.pressed = {}; tapNow = null; if (ptr.down) ptr.held++; },
  clear() { G.pressed = {}; tapNow = null; }
};
G.DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// ---------- Scene stack ----------
// A scene: {update(), draw(ctx), onEnter?, onExit?, transparent?}
G.scenes = [];
G.push = s => { G.scenes.push(s); G.input.sceneChanged(); s.onEnter && s.onEnter(); return s; };
G.pop = () => { const s = G.scenes.pop(); G.input.sceneChanged(); s && s.onExit && s.onExit(); return s; };
G.replace = s => { while (G.scenes.length) G.pop(); return G.push(s); };
G.top = () => G.scenes[G.scenes.length - 1];

// ---------- Coroutine-ish task runner (for cutscenes & battle flow) ----------
// Generators yield: number (wait frames), a Promise-like {done()} object, or nothing (1 frame)
// A task that throws (a talk, a cutscene: H7) is dropped and logged (G.oops), the screens it had just pushed close
// (whatever waited on them goes on), and the owner hears about it: tasks.onError(e, gen) (field.js: the map unlocks
// and walking starts again; main.js: back to the title).
G.Tasks = class {
  constructor() { this.list = []; this.onError = null; }
  add(gen) { this.list.push({ gen, wait: 0, obj: null }); }
  get busy() { return this.list.length > 0; }
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i];
      if (t.wait > 0) { t.wait--; continue; }
      if (t.obj && !t.obj.done()) continue;
      const back = t.obj; t.obj = null;
      const top0 = G.top();
      let r;
      try { r = t.gen.next(back); } catch (e) {
        this.list.splice(i, 1); G.oops(e, 'task'); G.dropAbove(top0); // (a text box it opened, half-said: closed)
        if (this.onError) try { this.onError(e, t.gen); } catch (e2) { G.oops(e2, 'task'); }
        continue;
      }
      if (r.done) { this.list.splice(i, 1); continue; }
      const v = r.value;
      if (typeof v === 'number') t.wait = v - 1;
      else if (v && typeof v.done === 'function') { t.obj = v; if (v.done()) { /* resolves next frame */ } }
    }
  }
};

// Fade overlay
G.fade = { a: 0, target: 0, speed: 0.08, color: '#000' };
G.fadeTo = (a, speed = 0.08, color = '#000') => { G.fade.target = a; G.fade.speed = speed; G.fade.color = color; return { done: () => G.fade.a === G.fade.target }; };

// Screen flash / shake
G.fx = { shake: 0, flash: 0, flashColor: '#fff' };

// ---------- Crash guards (docs/AUDIT_2026-10.md H7: one error used to stop the game for good) ----------
// The loop below always re-arms itself, and every part of a frame is caught on its own: the overlays (fx, cards,
// album, demo, hint, day), the top scene's update and each scene's draw. A scene that keeps throwing (3 times within
// half a second) is closed, with anything over it: back to the screen under it, the map. Whatever waited on it (a
// G.Wait it holds) goes on as if it had closed. The map (a G.Field) and the screen at the bottom are never closed.
// A draw that threw may leave a transform, a clip or a save behind: the next frame starts from a fresh canvas state.
// Errors go to G.oops (the problem log, below).
function closeTop() { // pop the top scene for good; its waits resolve (null), so a talk waiting on it goes on
  const s = G.scenes[G.scenes.length - 1];
  try { G.pop(); } catch (e) { if (G.top() === s) G.scenes.pop(); G.oops(e, 'onExit'); }
  if (s) for (const k in s) { const v = s[k]; if (v && G.Wait && v instanceof G.Wait && !v.fin) v.resolve(null); }
}
G.dropAbove = s => { if (!s || G.scenes.indexOf(s) < 0) return; while (G.top() !== s) closeTop(); }; // close what's over s
const fails = new WeakMap(); // scene -> frames of its last errors
let drawBad = false;
G.ctxReset = () => { drawBad = true; }; // (a draw caught its own error: field.js)
function sceneFailed(s, e, where) {
  G.oops(e, where);
  if (!s || G.scenes.indexOf(s) <= 0 || (G.Field && s instanceof G.Field)) return;
  const L = (fails.get(s) || []).filter(f => f > G.frame - 30); L.push(G.frame); fails.set(s, L);
  if (L.length >= 3) while (G.scenes.indexOf(s) >= 0) closeTop();
}
const PRE = [['fx', 'step'], ['intro', 'step'], ['cards', 'step'], ['album', 'step'], ['demo', 'pre']], POST = [['day', 'step'], ['hint', 'step'], ['demo', 'step']];
const OVER = [['hint', 'draw'], ['intro', 'draw'], ['cards', 'draw'], ['album', 'draw'], ['demo', 'draw'], ['fx', 'draw']];
function hooks(L, arg) { for (const [m, f] of L) { const o = G[m]; if (o && o[f]) try { o[f](arg); } catch (e) { if (arg) drawBad = true; G.oops(e, m + '.' + f); } } }

G.frame = 0;
function step() {
  G.frame++;
  const s = G.top();
  // before the scene: the particle layer (fx.js: sees this frame's tap before a scene can eat it), a word just met (intro.js),
  // word cards popping up and growing (cards.js), "¡Nuevo animal!" (album.js), a tap stopping a ghost-hand demo (demo.js)
  hooks(PRE);
  if (s) try { s.update(); } catch (e) { sceneFailed(s, e, 'update'); }
  // fade
  const f = G.fade;
  if (f.a < f.target) f.a = Math.min(f.target, f.a + f.speed);
  else if (f.a > f.target) f.a = Math.max(f.target, f.a - f.speed);
  if (G.fx.shake > 0) G.fx.shake--;
  if (G.fx.flash > 0) G.fx.flash--;
  for (const k in G.keys) if (G.keys[k]) G.repeatT[k] = (G.repeatT[k] || 0) + 1;
  if (G.toastT > 0) G.toastT--;
  hooks(POST); // the day's clock (day.js), tap hints (hint.js), demos (demo.js): before input clears
  G.input.endFrame();
  try { G.audio && G.audio.tick(); } catch (e) { G.oops(e, 'audio'); }
}
function draw() {
  const ctx = G.ctx;
  if (drawBad) { drawBad = false; G.canvas.width = G.W; ctx.imageSmoothingEnabled = false; } // (a fresh state: no clip or save left over)
  ctx.save();
  if (G.fx.shake > 0) ctx.translate(G.r(5) - 2, G.r(3) - 1);
  ctx.fillStyle = '#000'; ctx.fillRect(-4, -4, G.W + 8, G.H + 8);
  // draw from lowest non-transparent scene upward
  let start = G.scenes.length - 1;
  while (start > 0 && G.scenes[start].transparent) start--;
  for (let i = Math.max(0, start); i < G.scenes.length; i++) { const s = G.scenes[i]; try { s.draw(ctx); } catch (e) { drawBad = true; ctx.globalAlpha = 1; sceneFailed(s, e, 'draw'); } }
  ctx.restore();
  // above the scenes, bottom to top: flash, toast, the hint hand (hint.js), particles (fx.js); a fade covers it all
  if (G.fx.flash > 0) { ctx.globalAlpha = Math.min(1, G.fx.flash / 6); ctx.fillStyle = G.fx.flashColor; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; }
  if (G.toastT > 0 && G.win) { const w = G.textWidth(G.toastMsg) + 20; ctx.globalAlpha = Math.min(1, G.toastT / 15); G.win(ctx, (G.W - w) / 2, 40, w, 20); G.textC(ctx, G.toastMsg, G.W / 2, 46, '#f8e060'); ctx.globalAlpha = 1; }
  // the tapping hand and keyboard strip (hint.js), intro.js (nothing of its own now), word cards growing and flying into
  // the deck (cards.js), "¡Nuevo animal!" (album.js), the ghost hand (demo.js), ripples, bursts and confetti (fx.js, unshaken)
  hooks(OVER, ctx);
  ctx.globalAlpha = 1;
  if (G.fade.a > 0) { ctx.globalAlpha = G.fade.a; ctx.fillStyle = G.fade.color; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; }
}
G.toast = (msg, t = 90) => { G.toastMsg = msg; G.toastT = t; };
G.step = step; G.drawFrame = draw;

let last = performance.now(), acc = 0;
G.speedMul = 1;
function loop(now) {
  requestAnimationFrame(loop); // first: nothing below can stop the game
  acc += Math.min(100, now - last); last = now;
  const dt = 1000 / 60;
  let n = 0;
  try { while (acc >= dt && n < 5) { for (let k = 0; k < G.speedMul; k++) step(); acc -= dt; n++; } } catch (e) { acc = 0; G.oops(e, 'step'); }
  try { draw(); } catch (e) { drawBad = true; G.oops(e, 'draw'); }
}
G.start = () => { if (location.hash === '#test') return; requestAnimationFrame(t => { last = t; loop(t); }); };

// ---------- Storage (safe) ----------
// Nothing here throws. set / setRaw return false when the browser refused (storage full, private browsing, a value
// that can't be written), with the reason in G.store.err ('QuotaExceededError' = full); state.js counts the game's
// failed saves (C4).
G.store = {
  err: null,
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); G.store.err = null; return true; } catch (e) { G.store.err = (e && e.name) || 'Error'; return false; } },
  raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  setRaw(k, s) { try { localStorage.setItem(k, s); G.store.err = null; return true; } catch (e) { G.store.err = (e && e.name) || 'Error'; return false; } },
  keys() { try { const out = []; for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); return out; } catch (e) { return []; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};

// ---------- The problem log (H7: errors used to go only to a console nobody sees on an iPad) ----------
// G.oops(e, where) keeps an error the game got past: the last 20 on the device ('spanishclub_errors'), each with its
// message, the first lines of its stack, where it was caught (update, draw, task, map <hook>, window, promise...), the
// screen on top, the map, when, and the build (G.build(): a hash of the scripts' ?v= stamps). The same error again
// only counts up (n, last), so a frame that keeps failing doesn't flood the log. A new one also goes to the console
// (the tests read it). The grown-ups menu's Problem log (backup.js) shows them, with Copy and Clear.
(function () {
  const KEY = 'spanishclub_errors', MAX = 20;
  let list = null, timer = 0, build = null;
  G.errlogVer = 0;
  const load = () => { if (!list) { const a = G.store.get(KEY); list = Array.isArray(a) ? a.filter(e => e && typeof e === 'object') : []; } return list; };
  const save = () => { clearTimeout(timer); timer = 0; G.store.set(KEY, list); };
  const short = s => String(s == null ? '' : s).replace(/(?:https?|file):\/\/[^\s()]*?\/((?:src|content)\/[^\s?():]+)(?:\?v=[0-9a-f]+)?/g, '$1')
    .replace(/(?:https?|file):\/\/[^\s()]*\/([^\s\/()]+)/g, '$1').slice(0, 220); // (src/field.js:95:20; the single file: its name)
  G.build = function () {
    if (build) return build;
    const v = Array.from(document.scripts || []).map(s => (/[?&]v=([0-9a-f]+)/.exec(s.src || '') || [])[1]).filter(Boolean);
    let h = 2166136261; for (const ch of v.join('')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const b = v.length ? (h >>> 0).toString(16).padStart(8, '0') : 'unstamped';
    if (document.readyState !== 'loading') build = b; // (not while the scripts are still loading)
    return b;
  };
  const L = G.errlog = {
    list: () => load().slice(),
    add(e, where) {
      try {
        const msg = short(e instanceof Error ? String(e) : typeof e === 'string' ? e : (() => { try { return JSON.stringify(e); } catch (x) { return String(e); } })());
        const stack = e && e.stack ? String(e.stack).split('\n').filter(l => /\sat\s|@/.test(l)).slice(0, 4).map(l => short(l.trim())) : [];
        const a = load(), now = Date.now(), old = a.find(x => x.msg === msg && x.where === where && (x.stack || [])[0] === stack[0]);
        G.errlogVer++;
        if (old) { old.n = (old.n || 1) + 1; old.last = now; a.splice(a.indexOf(old), 1); a.push(old); if (!timer) timer = setTimeout(save, 1000); return old; }
        let top = null, map = null;
        try { const s = G.top(); top = s ? s.constructor.name : null; if (G.field && G.scenes.indexOf(G.field) >= 0) map = G.field.mapId; } catch (x) { }
        const ent = { at: now, msg, where: where || '?', scene: top, map, stack, build: G.build(), n: 1 };
        a.push(ent); a.splice(0, Math.max(0, a.length - MAX)); save();
        try { console.error('[caught: ' + ent.where + ']', e); } catch (x) { }
        return ent;
      } catch (x) { return null; }
    },
    clear() { list = []; clearTimeout(timer); timer = 0; G.store.del(KEY); G.errlogVer++; },
  };
  G.oops = (e, where) => L.add(e, where);
  window.addEventListener('error', e => { if (e && (e.error || e.message)) L.add(e.error || e.message, 'window'); });
  window.addEventListener('unhandledrejection', e => L.add(e && e.reason, 'promise'));
})();

// ---------- On-screen D-pad + A/B/C (a grown-ups option, per device; hidden by default) ----------
(function () {
  const css = document.createElement('style');
  css.textContent = 'html,body{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}canvas#screen{outline:none}' +
    '.tc{position:fixed;z-index:5;display:flex;gap:10px;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.tc button{width:54px;height:54px;border-radius:50%;border:2px solid #8898e0;background:rgba(28,44,140,.55);color:#f0f0ff;font:bold 16px monospace}' +
    '.tc button:active,.tc button.on{background:rgba(240,208,96,.7);color:#101030}' +
    '#tcpad{left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px);gap:2px}' +
    '#tcpad button{width:48px;height:48px;border-radius:8px}' +
    '#tcbtn{right:14px;bottom:calc(20px + env(safe-area-inset-bottom,0px));align-items:flex-end}';
  document.head.appendChild(css);
  G.canvas.tabIndex = 0;
  G.canvas.addEventListener('pointerdown', () => { try { G.canvas.focus(); } catch (e) { } });
  let els = null;
  function build() {
    const pad = document.createElement('div'); pad.id = 'tcpad'; pad.className = 'tc';
    const cells = ['', 'up', '', 'left', '', 'right', '', 'down', ''];
    const lab = { up: '▲', down: '▼', left: '◀', right: '▶' };
    cells.forEach(k => { const b = document.createElement(k ? 'button' : 'span'); if (k) { b.textContent = lab[k]; b.dataset.k = k; } pad.appendChild(b); });
    const btns = document.createElement('div'); btns.id = 'tcbtn'; btns.className = 'tc';
    [['C', 'C'], ['B', 'B'], ['A', 'A']].forEach(([k, t]) => { const b = document.createElement('button'); b.textContent = t; b.dataset.k = k; if (k === 'A') b.style.marginBottom = '30px'; btns.appendChild(b); });
    document.body.appendChild(pad); document.body.appendChild(btns);
    const down = k => { if (!G.keys[k]) { G.pressed[k] = true; G.repeatT[k] = 0; } G.keys[k] = true; }; // audio and speech wake up in the window's handlers
    const up = k => { G.keys[k] = false; };
    [pad, btns].forEach(el => {
      el.addEventListener('pointerdown', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; e.preventDefault(); e.target.classList.add('on'); down(k); e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); });
      const rel = e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; e.target.classList.remove('on'); up(k); };
      el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('pointerleave', rel);
    });
    return [pad, btns];
  }
  // on: show or hide; noSave: don't store the choice (G.prefs lives in audio.js, which loads after this file)
  G.setDpad = function (on, noSave) {
    on = !!on;
    if (G.prefs) { if (!noSave && G.audio && G.audio.setPref) G.audio.setPref('dpad', on); else G.prefs.dpad = on; }
    if (on && !els) els = build();
    if (els) els.forEach(el => { el.style.display = on ? '' : 'none'; });
    if (!on) ['up', 'down', 'left', 'right', 'A', 'B', 'C'].forEach(k => { G.keys[k] = false; });
  };
  const init = () => G.setDpad(G.prefs && G.prefs.dpad, true); // after every script has run
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init);
})();
