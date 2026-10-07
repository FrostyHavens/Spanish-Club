// ===== Juice: a particle layer drawn above every scene (tap ripples, star bursts, confetti, flying stars, dust) =====
// core.js steps it before the top scene's update (so it sees every counted tap, even one the scene then eats) and
// draws it after all the scenes, unshaken. A fixed pool of particles: nothing is allocated frame to frame.
//   G.fx.ripple(x, y)                  a small ring where a tap landed (every counted tap gets one, with a soft click)
//   G.fx.burst(x, y)                   a right answer: a gold ring and little stars shooting out
//   G.fx.flyStar(x, y, delay)          a first-try star: pops out at x, y, flies to the top-right corner and adds
//                                      itself to the star counter that shows there for a moment
//   G.fx.confetti(x, y, dir, n)        a party popper at x, y shooting up and out (dir -1 left, 1 right, 0 both ways)
//   G.fx.twinkle(x, y)                 one 4-point sparkle
//   G.fx.say(text, x, y, color, big)   words that pop up, rise and fade ("¡Casi!", "¡Muy bien!")
//   G.fx.walk(field, player, dir)      field.js calls it before each player step: a dust puff when starting to walk
//   G.fx.live(kind)                    how many particles are alive (of a kind: 'ring' 'star' 'fly' ...), for tests
//   G.fx.clear()
// Coordinates are game pixels (320x224). Dust is pinned to the map, so it stays put while the camera moves.
// Randomness comes from Math.random, never G.rand, so effects don't change the game's own dice.
'use strict';
(function () {
  const FX = G.fx; // core.js made {shake, flash, flashColor}; the particle layer joins it
  const MAX = 200;
  const KINDS = ['', 'ring', 'star', 'spark', 'confetti', 'twinkle', 'fly', 'dust', 'words'];
  const RING = 1, STAR = 2, SPARK = 3, CONF = 4, TWINK = 5, FLY = 6, DUST = 7, WORDS = 8;
  const LAYER = [0, 1, 1, 1, 0, 1, 2, 0, 2]; // dust and confetti under the bursts; words and the flying star on top
  const CONFETTI = ['#f8e060', '#f06080', '#60c0f0', '#70e070', '#ffffff', '#c080f0'];
  const FLY_POP = 12, FLY_GO = 28;              // a flying star hangs where it was won, then flies (frames)
  const pool = [];
  for (let i = 0; i < MAX; i++) pool.push({ on: false, k: 0, x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 1, t: 0, life: 0, c: '#ffffff', s: 1, ph: 0, x0: 0, y0: 0, img: null, map: null });
  let next = 0, lastWalk = -99;
  const counter = { vis: 0, pop: 0, top: null, n: -1, str: '' }; // the star counter in the top-right corner
  const rnd = Math.random;
  const ease = u => { const c = 1.70158, v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; }; // overshoots a little
  FX.easeBack = ease;

  function spawn(k, x, y, life) {
    let p = null;
    for (let n = 0; n < MAX && !p; n++) { const q = pool[next]; next = (next + 1) % MAX; if (!q.on) p = q; }
    if (!p) for (let n = 0; n < MAX && !p; n++) { const q = pool[next]; next = (next + 1) % MAX; if (q.k !== FLY) p = q; } // full: recycle one (never a flying star)
    if (!p) p = pool[0];
    p.on = true; p.k = k; p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.g = 0; p.drag = 1; p.t = 0; p.life = life;
    p.c = '#ffffff'; p.s = 1; p.ph = rnd() * 100; p.img = null; p.map = null;
    return p;
  }

  // ---------- pixel art (built once) ----------
  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    const outlined = (rows, pal, key) => { // 1 px dark outline all around
      const src = G.sprite('fx_' + key, rows, pal), dark = G.tinted(src, '#40200a', 'fx_' + key);
      return G.cached('fx_o_' + key, src.width + 2, src.height + 2, c => { for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) c.drawImage(dark, dx, dy); c.drawImage(src, 1, 1); });
    };
    const gold = { y: '#f8d040', w: '#fff8d0', o: '#e89820' };
    SPR = {
      big: outlined(['.....w.....', '....wyy....', '....wyy....', 'wwwwwyyyyyo', '.oyyyyyyyo.', '..oyyyyyo..', '...yyyyy...', '..yyyoyyy..', '..yyo.oyy..', '.yyo...oyy.', '.oo.....oo.'], gold, 'big'),
      small: outlined(['..w..', '.wyy.', 'wyyyo', '.yyo.', '.y.o.'], gold, 'small'),
    };
    return SPR;
  }
  const words = new Map(); // floating words, pre-drawn once each (outlined so they read over anything)
  function wordImg(text, col, big) {
    const key = text + '|' + col + (big ? '|b' : '');
    if (words.has(key)) return words.get(key);
    const w = G.textWidth(text) + 2, sc = big ? 2 : 1;
    const t = G.makeCanvas(w, 10); G.text(t.getContext('2d'), text, 0, 1, col, null);
    const d = G.makeCanvas(w, 10), dx = d.getContext('2d'); dx.drawImage(t, 0, 0); dx.globalCompositeOperation = 'source-in'; dx.fillStyle = '#10102a'; dx.fillRect(0, 0, w, 10);
    const c = G.makeCanvas(w * sc + 2, 10 * sc + 2), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    for (const [ox, oy] of [[0, 1], [2, 1], [1, 0], [1, 2], [2, 2]]) x.drawImage(d, ox, oy, w * sc, 10 * sc);
    x.drawImage(t, 1, 1, w * sc, 10 * sc);
    words.set(key, c); return c;
  }

  // ---------- making effects ----------
  function ring(x, y, r, col, life) { const p = spawn(RING, x, y, life); p.s = r; p.c = col; return p; }
  FX.ripple = (x, y) => ring(x, y, 9, '#ffffff', 15);
  FX.burst = function (x, y) {
    ring(x, y, 22, '#f8e060', 18);
    for (let i = 0; i < 10; i++) {
      const a = (i + rnd() * 0.5) / 10 * Math.PI * 2, v = 2 + rnd() * 1.6, p = spawn(STAR, x, y, 26 + (rnd() * 10 | 0));
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 0.5; p.drag = 0.89; p.g = 0.05;
    }
    for (let i = 0; i < 10; i++) {
      const a = rnd() * Math.PI * 2, v = 0.8 + rnd() * 2.2, p = spawn(SPARK, x, y, 16 + (rnd() * 10 | 0));
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.drag = 0.9; p.c = i & 1 ? '#ffffff' : '#fff0a0'; p.s = 1 + (i % 3 === 0);
    }
  };
  FX.flyStar = function (x, y, delay = 0) { const p = spawn(FLY, x, y, FLY_POP + FLY_GO); p.x0 = x; p.y0 = y; p.t = -delay; return p; };
  FX.confetti = function (x, y, dir = 0, n = 24) {
    for (let i = 0; i < n; i++) {
      const d = dir || (i & 1 ? 1 : -1), a = -Math.PI / 2 + d * (0.2 + rnd() * 0.75), v = 2.6 + rnd() * 2.4;
      const p = spawn(CONF, x, y, 100 + (rnd() * 50 | 0));
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.drag = 0.95; p.g = 0.07; p.c = CONFETTI[i % CONFETTI.length];
    }
  };
  FX.twinkle = (x, y) => { const p = spawn(TWINK, x, y, 22); p.s = 3; return p; };
  FX.say = function (text, x, y, col = '#ffffff', big = false) { // one at a time: older words fade out quickly
    for (let i = 0; i < MAX; i++) { const q = pool[i]; if (q.on && q.k === WORDS) q.life = Math.min(q.life, Math.max(q.t + 4, Math.ceil((q.t + 1) / 0.7))); }
    const img = wordImg(text, col, big), hw = img.width / 2;
    const p = spawn(WORDS, G.clamp(x, hw + 2, G.W - hw - 2), y, big ? 36 : 44);
    p.img = img; p.vy = -1.1; p.drag = 0.9; return p;
  };
  FX.walk = function (f, pl, dir) {
    const [dx, dy] = G.DIRS[dir];
    if (f.blocked(pl.x + dx, pl.y + dy, pl)) return; // walking into a wall isn't walking
    const start = G.frame - lastWalk > 14; lastWalk = G.frame;
    if (!start) return;
    const T = G.TILE, fx = pl.x * T + T / 2 - dx * 6, fy = pl.y * T + T - 5 - dy * 4;
    for (let i = 0; i < 5; i++) {
      const p = spawn(DUST, fx + (rnd() - 0.5) * 10, fy + (rnd() - 0.5) * 3, 14 + (rnd() * 8 | 0));
      p.map = f; p.vx = -dx * (0.3 + rnd() * 0.4) + (rnd() - 0.5) * 0.7; p.vy = -0.2 - rnd() * 0.3 - dy * 0.3; p.drag = 0.9; p.s = 1 + (rnd() * 2 | 0);
    }
  };
  FX.live = kind => { const k = kind ? KINDS.indexOf(kind) : 0; let n = 0; for (let i = 0; i < MAX; i++) if (pool[i].on && (!k || pool[i].k === k)) n++; return n; };
  FX.counterShown = () => counter.vis > 0;
  FX.clear = function () { for (let i = 0; i < MAX; i++) pool[i].on = false; counter.vis = 0; };

  // ---------- stepping (core.js, before the top scene's update) ----------
  const TX = G.W - 14, TY = 12; // where flying stars land: the star in the counter
  function flyPos(p) {
    if (p.t < FLY_POP) { p.x = p.x0; p.y = p.y0 - p.t * 0.6; return; }
    const u = (p.t - FLY_POP) / FLY_GO, e = u * u * (3 - 2 * u), tx = TX, ty = TY;
    const sx = p.x0, sy = p.y0 - FLY_POP * 0.6, cx = sx - 20, cy = ty - 10; // up first, then a swoop into the corner
    p.x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * tx;
    p.y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ty;
  }
  function land() {
    counter.vis = 110; counter.pop = 10; counter.top = G.top();
    G.audio.sfx('star');
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, p = spawn(SPARK, TX, TY, 14); p.vx = Math.cos(a) * 1.6; p.vy = Math.sin(a) * 1.6; p.drag = 0.85; p.c = '#fff8c0'; }
  }
  function move(p) {
    p.t++;
    if (p.t >= p.life) { if (p.k === FLY) land(); p.on = false; return; }
    if (p.t <= 0) return; // still waiting (a delayed star)
    if (p.k === FLY) {
      flyPos(p);
      if (p.t > FLY_POP && p.t % 3 === 0) { const s = spawn(SPARK, p.x + (rnd() - 0.5) * 4, p.y + (rnd() - 0.5) * 4, 12); s.c = '#fff0a0'; s.vy = 0.3; }
      return;
    }
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy;
    if (p.k === CONF) p.x += Math.sin(p.t * 0.12 + p.ph) * 0.4;
  }
  FX.step = function () {
    const tp = G.input.tap();
    if (tp) { FX.ripple(tp.x, tp.y); G.audio.sfx('tap'); }
    for (let i = 0; i < MAX; i++) if (pool[i].on) move(pool[i]);
    if (counter.pop > 0) counter.pop--;
    if (counter.vis > 0) { // fades early once the screen moves on, and soon once the map is free (its menu button lives there)
      counter.vis--;
      const top = G.top(), f = G.field;
      if (top !== counter.top) counter.vis = Math.min(counter.vis, 12);
      else if (f && top === f && !f.locked) counter.vis = Math.min(counter.vis, 45);
    }
  };

  // ---------- drawing (core.js, after every scene) ----------
  function dot(ctx, x, y) { ctx.fillRect(x, y, 1, 1); }
  function drawP(ctx, p) {
    const u = p.t / p.life;
    let x = p.x, y = p.y;
    if (p.map) { if (p.map !== G.field) { p.on = false; return; } x -= Math.round(p.map.cam.x); y -= Math.round(p.map.cam.y); }
    switch (p.k) {
      case RING: { // a dotted ring that grows and fades
        const r = 2 + (p.s - 2) * (1 - (1 - u) * (1 - u)), n = Math.max(10, Math.round(r * 3)), a = 1 - u * u;
        for (let pass = 0; pass < 2; pass++) {
          ctx.globalAlpha = pass ? a : a * 0.5; ctx.fillStyle = pass ? p.c : '#10102a';
          for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; dot(ctx, Math.round(x + Math.cos(t) * r) + 1 - pass, Math.round(y + Math.sin(t) * r) + 1 - pass); }
        }
        if (p.t < 4) { ctx.globalAlpha = 1; ctx.fillStyle = p.c; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }
        break;
      }
      case STAR: {
        if (u > 0.7 && (p.t & 2)) break; // blink out
        const img = sprites().small; ctx.globalAlpha = 1; ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2));
        break;
      }
      case SPARK: ctx.globalAlpha = 1 - u * u; ctx.fillStyle = p.c; ctx.fillRect(Math.round(x), Math.round(y), p.s, p.s); break;
      case CONF: {
        const h = 1 + Math.round(Math.abs(Math.sin(p.t * 0.25 + p.ph)) * 2); // it tumbles
        ctx.globalAlpha = u > 0.8 ? (1 - u) * 5 : 1; ctx.fillStyle = p.c; ctx.fillRect(Math.round(x), Math.round(y), 2, h);
        break;
      }
      case TWINK: {
        const a = Math.round(Math.sin(u * Math.PI) * p.s), X = Math.round(x), Y = Math.round(y);
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff0a0';
        if (a > 0) { ctx.fillRect(X - a, Y, a * 2 + 1, 1); ctx.fillRect(X, Y - a, 1, a * 2 + 1); }
        ctx.fillStyle = '#ffffff'; ctx.fillRect(X, Y, 1, 1);
        break;
      }
      case DUST: {
        const s = p.s + Math.round(u * 2);
        ctx.globalAlpha = 0.85 * (1 - u); ctx.fillStyle = '#f4ecd8';
        ctx.fillRect(Math.round(x - s), Math.round(y - s + 1), s * 2, s * 2 - 2); ctx.fillRect(Math.round(x - s + 1), Math.round(y - s), s * 2 - 2, s * 2);
        break;
      }
      case WORDS: {
        const img = p.img, sc = p.t < 8 ? 0.5 + 0.5 * ease(p.t / 8) : 1, w = Math.round(img.width * sc), h = Math.round(img.height * sc);
        ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
        ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
        break;
      }
      case FLY: {
        if (p.t <= 0) break;
        const img = sprites().big, sc = p.t < FLY_POP ? ease(Math.min(1, p.t / 8)) * 1.25 : 1.25 - 0.4 * (p.t - FLY_POP) / FLY_GO;
        const w = Math.max(1, Math.round(img.width * sc)), h = Math.max(1, Math.round(img.height * sc));
        ctx.globalAlpha = 1; ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
        break;
      }
    }
  }
  function drawCounter(ctx) {
    let n = G.state ? G.state.stars : 0;
    for (let i = 0; i < MAX; i++) if (pool[i].on && pool[i].k === FLY) n--; // stars still on their way
    n = Math.max(0, n);
    if (n !== counter.n) { counter.n = n; counter.str = String(n); }
    const img = sprites().big, tw = G.textWidth(counter.str), w = tw + img.width + 12, h = 18, x = G.W - 3 - w, y = 3;
    ctx.save();
    ctx.globalAlpha = Math.min(1, counter.vis / 12);
    if (counter.pop > 0) { const s = 1 + 0.3 * counter.pop / 10, cx = TX, cy = y + h / 2; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
    ctx.fillStyle = '#000010'; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
    ctx.fillStyle = '#f0d060'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#1c2c8c'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    G.text(ctx, counter.str, x + 5, y + 6, '#f8e060');
    ctx.drawImage(img, TX - (img.width >> 1), TY - (img.height >> 1));
    ctx.restore();
  }
  FX.draw = function (ctx) {
    for (let L = 0; L < 3; L++) for (let i = 0; i < MAX; i++) { const p = pool[i]; if (p.on && LAYER[p.k] === L) drawP(ctx, p); }
    ctx.globalAlpha = 1;
    if (counter.vis > 0) drawCounter(ctx);
  };
})();
