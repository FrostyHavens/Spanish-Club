// ===== Round B: Canelo is your dog. Tricks learned by voice, care, his bed at home =====
// Mamá gives you Canelo (after the Saludos errand; her "!" shows): "¡Canelo es tu perro!", the Mi perro notebook page,
// and his first trick. Each trick is taught by someone (who says it, Canelo does it for them, then you try once):
//   ¡Siéntate! Mamá (sits) -> ¡Ven! Mamá (runs off, then back to you) -> ¡Dame la pata! Sofía (lifts a paw)
//   -> ¡Salta! Sofía (jumps) -> ¡Gira! Nico (spins). One at a time, in this order; a teacher's thought bubble shows the
//   trick's picture when it's their turn.
// Tap Canelo (or A facing him): the pet menu, big picture cards over the map. Top row: his tricks (known ones gold, the
// one he's learning with its paw prints 1-2-3, the next one with its teacher's face, the rest "?"); bottom row: care
// (el hueso, la galleta, el agua, la pelota, a pat, la cama). The mic sits beside the tricks: SAY a command and he does
// it (a speaking star, once per word per day; a care word works too: "¡la pelota!" throws the ball). Tapping works too.
// Learning a trick takes 3 good tries: tapping its card asks "¡Dile a Canelo!" (G.ask with {word} cards, so the mic is
// built in); saying it straight at the menu counts too. Try 1: he tilts his head and half does it; try 2: nearly;
// try 3: he does it, confetti and a heart (and the gold card for the command once the word model says it's remembered).
// Care: food (crunch crunch, el hueso is his favourite: a gift heart), water (lap lap), the ball (thrown; he fetches
// it), a pat (hearts float up), la cama (at home he goes to his bed and sleeps, z z z; he sleeps there at night too).
// Every action shows Canelo's own hearts (G.hearts 'canelo': care +1 up to the daily cap, +1 per trick learned).
// A best-friend Canelo (5 hearts) does a little happy spin when you open the menu.
//
// API (errands, tests): G.pet.TRICKS [{id, by, anim}], G.pet.mine() (he's your dog: flags.petStart),
//   G.pet.knows(id) (3 good tries), G.pet.tries(id), G.pet.learning() (the trick being learned, or null),
//   G.pet.known() (ids), G.pet.canTeach(who) (the trick id `who` would teach now, or null),
//   G.pet.teach(id, who) generator (the teaching scene), G.pet.practice(id) generator (one good try: the question, then
//   Canelo's attempt), G.pet.command(id, o) generator (a G.ask "¡Dile a Canelo!" for any trick, then he does it: for
//   shows; o.prompt, o.pool), G.pet.trick(id) generator (he just does it), G.pet.play(kind, o) generator (any animation:
//   sit come paw jump spin huh eat drink fetch pet dance wake), G.pet.menu() generator (the pet menu),
//   G.pet.npc(f) (Canelo on this map), G.pet.sleeping(f).
// Saved: G.state.pet = {tricks: {id: good tries 0..3}, learning: id | null, sleep: bool}, flags.petStart.
'use strict';
(function () {
  const P = G.pet = {}, T = G.TILE;
  const F = () => G.state.flags, S = G.st;
  const TT = (t, en) => ({ t, en });
  // ven and siéntate are learned in the story (chapters 1 and 3); the others are taught by Sofía and Nico (canTeach) for
  // the older errands after chapter 10, until chapters 14 and 17 teach them
  P.TRICKS = [{ id: 'ven', by: 'mama', anim: 'come', story: true }, { id: 'sientate', by: 'mama', anim: 'sit', story: true }, { id: 'pata', by: 'sofia', anim: 'paw' },
    { id: 'salta', by: 'sofia', anim: 'jump' }, { id: 'gira', by: 'nico', anim: 'spin' }];
  P.CARE = ['hueso', 'galleta', 'agua', 'pelota', 'mimo', 'cama'];
  P.NEED = 3;
  P.BED = [7, 5]; P.BOWL = [1, 4]; // at home (casa): his cushion and his bowl
  const trick = id => P.TRICKS.find(t => t.id === id);
  const st = () => {
    const s = G.state; if (!s.pet || typeof s.pet !== 'object' || Array.isArray(s.pet)) s.pet = {};
    if (!s.pet.tricks || typeof s.pet.tricks !== 'object') s.pet.tricks = {};
    return s.pet;
  };
  P.state = st;
  P.mine = () => !!(G.state && G.state.flags.petStart);
  P.tries = id => Math.min(P.NEED, st().tricks[id] | 0);
  P.knows = id => P.tries(id) >= P.NEED;
  P.learning = () => { const l = G.state && st().learning; return l && trick(l) && !P.knows(l) ? l : null; };
  P.known = () => P.TRICKS.filter(t => P.knows(t.id)).map(t => t.id);
  P.next = () => P.TRICKS.find(t => !P.knows(t.id)) || null;
  P.canTeach = who => {
    if (!G.state || !P.mine() || P.learning() || !(G.chapters && G.chapters.allWrittenDone())) return null;
    const n = P.TRICKS.find(t => !P.knows(t.id) && !t.story); return n && n.by === who ? n.id : null;
  };
  P.startReady = () => false; // (Canelo becomes yours in chapter 1 now: content/es/story-c01-c10.js)
  P.npc = (f = G.field) => (f && f.npcs.find(n => n.id === 'canelo' && !n.hidden)) || null;
  P.sleeping = (f = G.field) => !!(f && G.state && f.mapId === 'casa' && P.mine() && (st().sleep || (G.day && G.day.over())) && !f.petAwake);

  // ---------- little sounds ----------
  function au() { const a = G.audio; return a && a.ctx && a.sfxGain ? a : null; }
  function tone(type, f0, f1, len, vol, at = 0) {
    const a = au(); if (!a) return;
    const ac = a.ctx, t = ac.currentTime + 0.01 + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(a.sfxGain); o.start(t); o.stop(t + len + 0.03);
  }
  function noise(freq, len, vol, at = 0) {
    const a = au(); if (!a || !a.noise) return;
    const ac = a.ctx, t = ac.currentTime + 0.01 + at, n = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    n.buffer = a.noise; fl.type = 'bandpass'; fl.frequency.value = freq; fl.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(fl); fl.connect(g); g.connect(a.sfxGain); n.start(t); n.stop(t + len + 0.05);
  }
  const SND = {
    bark: () => { tone('triangle', 640, 360, 0.09, 0.16); tone('triangle', 700, 380, 0.09, 0.16, 0.14); },
    woof: () => { tone('sawtooth', 300, 170, 0.14, 0.09); tone('triangle', 520, 300, 0.12, 0.14, 0.01); },
    whine: () => tone('sine', 900, 1300, 0.25, 0.06),
    crunch: () => { noise(2600, 0.07, 0.25); noise(1800, 0.06, 0.18, 0.08); },
    lap: () => { tone('sine', 500, 1100, 0.06, 0.12); noise(3200, 0.04, 0.08, 0.02); },
    throw: () => noise(1200, 0.25, 0.1),
    bounce: () => tone('sine', 220, 140, 0.08, 0.15),
    pant: () => { for (let i = 0; i < 3; i++) noise(1500, 0.06, 0.06, i * 0.13); },
    snore: () => tone('sine', 140, 110, 0.6, 0.05),
    tada: () => { [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]].forEach(([f, at]) => tone('square', f, f, 0.16, 0.05, at)); },
  };
  P.sound = k => { try { (SND[k] || (() => { }))(); } catch (e) { } };

  // ---------- particles over the map (world px) ----------
  let fx = [], fxF = 0;
  const puff = (k, x, y, o = {}) => fx.push(Object.assign({ k, x, y, t: 0, life: 40, vx: 0, vy: 0 }, o));
  P.puff = puff; // (chapters.js: hearts, "!", "?" over Canelo in the story)
  function fxStep() { let n = G.frame - fxF; fxF = G.frame; if (n <= 0) return; if (n > 4) n = 4; while (n--) fx = fx.filter(e => { e.t++; e.x += e.vx; e.y += e.vy; if (e.g) e.vy += e.g; return e.t < e.life; }); }

  // ---------- Canelo's animations (time from G.frame, so they play under any screen) ----------
  // n.pa = {k, f0, len, amp, sx, sy (away direction), D (px away), ev: fired events, item}
  const LEN = { sit: 80, come: 120, paw: 92, jump: 72, spin: 76, huh: 56, eat: 112, drink: 96, fetch: 168, pet: 104, dance: 64, wake: 30 };
  const DIRS = ['down', 'right', 'up', 'left'];
  const ease = u => 1 - (1 - u) * (1 - u);
  // the free distance (tiles, up to max) from n's tile going (dx, dy): walls stop it
  function room(f, n, dx, dy, max) { let k = 0; while (k < max) { const x = n.x + dx * (k + 1), y = n.y + dy * (k + 1); const t = G.TERRAIN[f.map.get(x, y)] || G.TERRAIN['.']; if (x < 0 || y < 0 || x >= f.map.w || y >= f.map.h || t.block || t.wall) break; k++; } return k; }
  function start(f, n, k, o = {}) {
    const p = f.player, a = { k, f0: G.frame, len: LEN[k] || 60, amp: o.amp == null ? 1 : o.amp, ev: {}, item: o.item || null, px: p.x, py: p.y };
    if (k === 'come' || k === 'fetch') { // run away from you along the roomier side, 3 tiles at most
      const side = n.x < p.x ? -1 : n.x > p.x ? 1 : (room(f, n, 1, 0, 4) >= room(f, n, -1, 0, 4) ? 1 : -1);
      let dx = side, dy = 0, r = room(f, n, dx, dy, 3);
      if (r < 2) { const r2 = room(f, n, -dx, 0, 3); if (r2 > r) { dx = -dx; r = r2; } }
      if (r < 1) { dx = 0; dy = n.y <= p.y ? -1 : 1; r = room(f, n, 0, dy, 3); }
      a.sx = dx; a.sy = dy; a.D = Math.max(0.6, r) * T * (k === 'come' ? Math.max(0.5, a.amp) : 1);
    }
    n.pa = a; return a;
  }
  P.anim = (n, k, o) => start(G.field, n, k, o);
  const towardP = (n, a) => { const dx = a.px - n.x, dy = a.py - n.y; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : dx < 0 ? 'left' : 'down') : dy > 0 ? 'down' : 'up'; };
  const dirOf = (dx, dy) => dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down';
  // pose of the dog at frame t of its animation: offsets, squash, tilt and what to draw around it
  function pose(n, a, t) {
    const o = { dx: 0, dy: 0, z: 0, sx: 1, sy: 1, rot: 0, dir: n.dir, fr: (G.frame >> 4) & 1, paw: 0, bowl: null, ball: null, mouth: false };
    const A = a.amp, ev = (at, fn) => { if (t >= at && !a.ev[at]) { a.ev[at] = 1; fn(); } };
    const wx = n.x * T + 12, wy = n.y * T;
    switch (a.k) {
      case 'sit': {
        const q = t < 12 ? t / 12 : t < 64 ? 1 : Math.max(0, 1 - (t - 64) / 16);
        o.sy = 1 - 0.24 * q * A; o.sx = 1 + 0.08 * q * A; o.dir = 'down';
        if (q >= 1 && A >= 1) o.rot = Math.sin(t / 3) * 0.03; // a wag
        ev(14, () => { P.sound('bark'); if (A >= 1) puff('heart', wx + 8, wy - 2, { life: 50, vy: -0.35 }); });
        break;
      }
      case 'come': {
        const D = a.D;
        if (t < 22) { const u = ease(t / 22); o.dx = a.sx * D * u; o.dy = a.sy * D * u; o.dir = dirOf(a.sx, a.sy); o.fr = (t >> 2) & 1; }
        else if (t < 44) { o.dx = a.sx * D; o.dy = a.sy * D; o.dir = dirOf(-a.sx, -a.sy); ev(28, () => { puff('ex', wx + a.sx * D, wy + a.sy * D - 8, { life: 30 }); P.sound('woof'); }); }
        else if (t < 84) {
          const u = (t - 44) / 40; o.dx = a.sx * D * (1 - u); o.dy = a.sy * D * (1 - u); o.dir = dirOf(-a.sx, -a.sy); o.fr = (t >> 2) & 1;
          o.z = Math.abs(Math.sin(t / 3.2)) * 3;
          if (t % 6 === 0) puff('dust', wx + o.dx, wy + o.dy + 22, { life: 18, vx: a.sx * 0.3, vy: -0.2 });
        } else { const u = (t - 84) / 36; o.z = Math.sin(Math.min(1, u * 1.6) * Math.PI) * 10 * A; o.dir = towardP(n, a); ev(88, () => { P.sound('bark'); puff('heart', wx, wy - 4, { life: 50, vy: -0.35 }); }); }
        break;
      }
      case 'paw': {
        const q = t < 14 ? t / 14 : t < 72 ? 1 : Math.max(0, 1 - (t - 72) / 20);
        o.dir = a.px < n.x ? 'left' : a.px > n.x ? 'right' : (G.frame >> 6) & 1 ? 'left' : 'right';
        o.paw = q * A; o.pawBob = t > 30 && t < 60 && A >= 1 ? Math.round(Math.sin(t / 2)) : 0; o.sy = 1 - 0.1 * q;
        ev(30, () => { P.sound('bark'); if (A >= 1) { puff('spark', wx + (o.dir === 'left' ? -10 : 10), wy + 8, { life: 24 }); puff('heart', wx, wy - 2, { life: 50, vy: -0.35 }); } });
        break;
      }
      case 'jump': {
        if (t < 10) { o.sy = 1 - 0.16 * (t / 10); o.sx = 1 + 0.08 * (t / 10); }
        else if (t < 42) { const u = (t - 10) / 32; o.z = Math.sin(u * Math.PI) * 20 * A; o.sy = 1.08; o.sx = 0.95; o.fr = 1; }
        else if (t < 54) { const u = (t - 42) / 12; o.sy = 1 - 0.18 * Math.sin(u * Math.PI); o.sx = 1 + 0.1 * Math.sin(u * Math.PI); }
        o.dir = 'down';
        ev(11, () => P.sound('bark'));
        ev(42, () => { P.sound('bounce'); for (let i = 0; i < 4; i++) puff('dust', wx + (i - 1.5) * 5, wy + 22, { life: 20, vx: (i - 1.5) * 0.4, vy: -0.25 }); });
        break;
      }
      case 'spin': {
        const steps = A >= 1 ? 12 : A > 0.5 ? 6 : 2, per = 52 / steps;
        if (t < 56) { o.dir = DIRS[Math.min(steps, Math.floor(t / per)) % 4]; o.z = Math.abs(Math.sin(t / per * Math.PI)) * 2; o.fr = (t >> 2) & 1; } else o.dir = 'down';
        if (t % 8 === 0 && t < 56 && A >= 1) puff('spark', wx + Math.cos(t / 4) * 14, wy + 10 + Math.sin(t / 4) * 5, { life: 18 });
        ev(58, () => { P.sound('bark'); if (A >= 1) puff('heart', wx, wy - 2, { life: 50, vy: -0.35 }); });
        break;
      }
      case 'huh': o.rot = Math.sin(Math.min(1, t / 10) * Math.PI / 2) * 0.22 * (t < 46 ? 1 : (56 - t) / 10); o.dir = 'down'; ev(4, () => { puff('q', wx, wy - 8, { life: 46 }); P.sound('whine'); }); break;
      case 'eat': case 'drink': {
        o.dir = 'down'; o.bowl = a.k === 'eat' ? (a.item || 'hueso') : 'agua'; o.left = Math.max(0, 1 - t / (a.len - 24));
        if (t > 10 && t < a.len - 18) { o.dy = ((t >> 3) & 1) + 2; o.sy = 0.94; }
        if (a.k === 'eat') { for (const at of [20, 40, 60, 80]) ev(at, () => { P.sound('crunch'); for (let i = 0; i < 3; i++) puff('crumb', wx + (Math.random() - 0.5) * 10, wy + 22, { life: 24, vx: (Math.random() - 0.5) * 0.8, vy: -0.9, g: 0.08 }); }); }
        else for (const at of [16, 30, 44, 58, 72]) ev(at, () => { P.sound('lap'); puff('drop', wx + (Math.random() - 0.5) * 8, wy + 22, { life: 20, vx: (Math.random() - 0.5) * 0.6, vy: -1, g: 0.1 }); });
        ev(a.len - 14, () => { P.sound('bark'); puff('heart', wx, wy - 2, { life: 50, vy: -0.35 }); });
        break;
      }
      case 'fetch': {
        const D = a.D, bx0 = (a.px - n.x) * T, by0 = (a.py - n.y) * T; // the ball from your hands (relative to the dog)
        const bx1 = a.sx * D, by1 = a.sy * D;
        ev(1, () => P.sound('throw'));
        if (t < 30) { const u = t / 30; o.ball = [bx0 + (bx1 - bx0) * u, by0 + (by1 - by0) * u, Math.sin(u * Math.PI) * 26 + 8 * (1 - u)]; }
        else if (t < 48) { const u = (t - 30) / 18; o.ball = [bx1 + a.sx * 6 * u, by1 + a.sy * 6 * u, Math.abs(Math.sin(u * Math.PI * 2)) * 6 * (1 - u)]; }
        ev(30, () => P.sound('bounce'));
        if (t < 10) o.dir = dirOf(a.sx, a.sy);
        else if (t < 52) { const u = ease((t - 10) / 42); o.dx = (bx1 + a.sx * 6) * u; o.dy = (by1 + a.sy * 6) * u; o.dir = dirOf(a.sx, a.sy); o.fr = (t >> 2) & 1; o.z = Math.abs(Math.sin(t / 3)) * 2; if (t % 7 === 0) puff('dust', wx + o.dx, wy + o.dy + 22, { life: 16, vy: -0.2 }); }
        else if (t < 62) { o.dx = bx1 + a.sx * 6; o.dy = by1 + a.sy * 6; o.sy = 0.9; o.dir = dirOf(a.sx, a.sy); if (t < 56) o.ball = [o.dx, o.dy, 0]; else o.mouth = true; }
        else if (t < 104) { const u = (t - 62) / 42; o.dx = (bx1 + a.sx * 6) * (1 - u); o.dy = (by1 + a.sy * 6) * (1 - u); o.dir = dirOf(-a.sx, -a.sy); o.fr = (t >> 2) & 1; o.mouth = true; o.z = Math.abs(Math.sin(t / 3)) * 2; }
        else { o.dir = towardP(n, a); if (t < 150) o.ball = [(a.px - n.x) * T * 0.4, (a.py - n.y) * T * 0.4 + 2, 0]; o.rot = Math.sin(t / 3) * 0.04; }
        ev(56, () => P.sound('bark'));
        ev(106, () => { P.sound('bark'); puff('heart', wx, wy - 2, { life: 50, vy: -0.35 }); });
        break;
      }
      case 'pet': {
        o.sx = 1 + Math.sin(t / 4) * 0.05; o.sy = 1 - Math.sin(t / 4) * 0.05; o.dir = 'down'; o.hand = t < 84 ? Math.abs(Math.sin(t / 7)) : 0;
        if (t % 14 === 0 && t < 90) puff('heart', wx + (Math.random() - 0.5) * 16, wy, { life: 56, vy: -0.4, vx: (Math.random() - 0.5) * 0.2 });
        ev(2, () => P.sound('pant')); ev(50, () => P.sound('bark'));
        break;
      }
      case 'dance': { o.dir = DIRS[Math.floor(t / 6) % 4]; o.z = Math.abs(Math.sin(t / 6 * Math.PI)) * 6; ev(2, () => P.sound('bark')); ev(34, () => P.sound('bark')); if (t % 10 === 0) puff('spark', wx + (Math.random() - 0.5) * 20, wy + Math.random() * 10, { life: 20 }); break; }
      case 'wake': o.z = Math.sin(Math.min(1, t / 20) * Math.PI) * 6; o.dir = 'down'; ev(2, () => P.sound('bark')); break;
    }
    return o;
  }
  const sleepPose = () => ({ dx: 0, dy: 3, z: 0, sx: 1.14, sy: 0.6, rot: 0, dir: 'left', fr: 0, paw: 0 });
  // field.js calls n.drawSelf for Canelo: true when it drew him (an animation, or asleep)
  function drawSelf(ctx, cx, cy) {
    const n = this, f = G.field; if (!f) return false;
    const a = n.pa && G.frame - n.pa.f0 < n.pa.len ? n.pa : null;
    const sl = !a && P.sleeping(f);
    if (!a && !sl) return false;
    const o = a ? pose(n, a, G.frame - a.f0) : sleepPose();
    const bx = Math.round(n.x * T + n.ox - cx + o.dx), by = Math.round(n.y * T + n.oy - cy - 3 + o.dy);
    if (o.bowl) drawBowl(ctx, bx + 12, by + 25, o.bowl, o.left); // behind his nose... in front of his paws
    ctx.fillStyle = 'rgba(16,28,8,0.3)'; const sw = Math.max(6, 14 - o.z / 2); ctx.fillRect(Math.round(bx + 12 - sw / 2), by + 24, Math.round(sw), 2);
    const img = G.unitSprite(n.spec, o.dir, o.fr);
    ctx.save(); ctx.translate(bx + 12, by + 24 - Math.round(o.z)); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.sx, o.sy);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -12, -24); ctx.restore();
    if (o.paw > 0) { // a front paw up, toward you
      const side = o.dir === 'left' ? -1 : 1, px = bx + 12 + side * Math.round(6 + o.paw * 5), py = by + 20 - Math.round(o.paw * 10) + (o.pawBob || 0);
      ctx.fillStyle = '#1a1420'; ctx.fillRect(px - 4, py - 3, 8, 8); ctx.fillRect(px - 3, py - 4, 6, 10); // the leg up to a round paw
      ctx.fillRect(px - side * 3 - 1, py + 3, 4, Math.max(0, by + 20 - py));
      ctx.fillStyle = '#b87038'; ctx.fillRect(px - side * 3, py + 3, 2, Math.max(0, by + 19 - py)); ctx.fillRect(px - 3, py - 2, 6, 6); ctx.fillRect(px - 2, py - 3, 4, 8);
      ctx.fillStyle = '#f0a0a8'; ctx.fillRect(px - 1, py, 2, 2); ctx.fillRect(px - 3, py - 2, 1, 1); ctx.fillRect(px, py - 3, 1, 1); ctx.fillRect(px + 2, py - 2, 1, 1);
      if (o.paw > 0.9) { ctx.fillStyle = '#fff8b0'; ctx.fillRect(px + side * 6, py - 4, 1, 3); ctx.fillRect(px + side * 7, py, 2, 1); ctx.fillRect(px + side * 5, py + 4, 1, 1); } // a little "ta-da"!
    }
    if (o.mouth) drawBall(ctx, bx + 12 + (o.dir === 'left' ? -7 : o.dir === 'right' ? 7 : 0), by + 15 - Math.round(o.z), 0);
    if (o.ball) drawBall(ctx, bx - o.dx + 12 + o.ball[0], by - o.dy + 22 + o.ball[1] - o.ball[2], o.ball[2]);
    if (o.hand) { const hx = bx + 10, hy = by + 1 - Math.round(o.hand * 4); ctx.fillStyle = '#1a1420'; ctx.fillRect(hx - 1, hy - 1, 9, 6); ctx.fillStyle = G.st.playerSpec().map.skin || '#f0c8a0'; ctx.fillRect(hx, hy, 7, 4); ctx.fillRect(hx + 7, hy + 1, 1, 2); }
    if (sl) for (let i = 0; i < 3; i++) { const k = ((G.frame + i * 40) % 120) / 120; ctx.globalAlpha = 1 - k; G.text(ctx, 'z', bx + 16 + Math.round(k * 8 + Math.sin(k * 6) * 2), by + 6 - Math.round(k * 18), '#ffffff', '#303060'); ctx.globalAlpha = 1; }
    return true;
  }
  function drawBall(ctx, x, y, z) {
    x = Math.round(x); y = Math.round(y);
    if (z > 1) { ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(x - 2, y + Math.round(z) + 3, 4, 1); }
    ctx.fillStyle = '#1a1420'; ctx.fillRect(x - 3, y - 2, 6, 5); ctx.fillRect(x - 2, y - 3, 4, 7);
    ctx.fillStyle = '#e03028'; ctx.fillRect(x - 2, y - 2, 4, 5); ctx.fillRect(x - 3, y - 1, 6, 3);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 2, 1, 1); ctx.fillStyle = '#f8e060'; ctx.fillRect(x - 3, y, 6, 1);
  }
  function drawBowl(ctx, x, y, what, left) {
    x = Math.round(x); y = Math.round(y);
    const el = (rx, ry, c, dy = 0) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y + dy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };
    el(8, 4.5, '#1a1420', 0.5); el(7, 3.5, '#d03838', 0.5); ctx.fillStyle = '#d03838'; ctx.fillRect(x - 7, y, 14, 3); // a round red bowl
    el(5.5, 2, '#5a1818', -0.5); ctx.fillStyle = '#f07070'; ctx.fillRect(x - 5, y + 2, 3, 1);
    if (left == null) left = 1;
    if (what === 'agua') { if (left > 0) { el(4.5, 1.4 * Math.max(0.3, left), '#58a8f8', -0.5); ctx.fillStyle = '#d0ecff'; ctx.fillRect(x - 2, y - 1, 2, 1); } }
    else if (left > 0.05) { ctx.globalAlpha = Math.min(1, left * 1.5); G.drawIcon16(ctx, what, x - 6, y - 12, 0.75); ctx.globalAlpha = 1; }
  }
  // his bed and bowl at home (field.js, before the people)
  P.drawUnder = function (f, ctx) {
    if (f.mapId !== 'casa' || !G.state || !P.mine()) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), [bx, by] = P.BED, x = bx * T - cx, y = by * T - cy;
    // a round cushion: dark rim, red edge, soft cream middle
    ctx.fillStyle = '#1a1420'; ctx.beginPath(); ctx.ellipse(x + 12, y + 16, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c04040'; ctx.beginPath(); ctx.ellipse(x + 12, y + 16, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0dcb8'; ctx.beginPath(); ctx.ellipse(x + 12, y + 17, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e06060'; ctx.fillRect(x + 4, y + 11, 6, 1);
    const [wx, wy] = P.BOWL; drawBowl(ctx, wx * T - cx + 12, wy * T - cy + 18, 'agua', G.errands && G.errands.bowlEmpty() ? 0 : 1); // (errands.js: empty until you fill it, once a day)
  };

  // ---------- each frame (field.js) ----------
  P.update = function (f) {
    if (!G.state) return;
    if (f.mapId !== 'casa' && st().sleep) st().sleep = false; // out of the house: he's up
    const n = P.npc(f); if (!n) return;
    if (!n.drawSelf) n.drawSelf = drawSelf;
    if (n.pa && G.frame - n.pa.f0 >= n.pa.len) n.pa = null;
    if (n.slide) { // gliding over to beside you
      const step = v => v - Math.sign(v) * Math.min(Math.abs(v), Math.max(1, Math.ceil(Math.abs(v) * 0.22))); n.ox = step(n.ox); n.oy = step(n.oy);
      if (!n.ox && !n.oy) n.slide = false;
    }
    if (P.sleeping(f) && !n.pa && !n.moving && !n.slide && (n.x !== P.BED[0] || n.y !== P.BED[1])) { n.ox += (n.x - P.BED[0]) * T; n.oy += (n.y - P.BED[1]) * T; n.x = P.BED[0]; n.y = P.BED[1]; n.slide = true; n.dir = 'left'; }
    if (!f.locked && G.top() === f && !P.sleeping(f) && f.petAwake && !n.pa) f.petAwake = false; // the menu closed: back to bed (at night)
  };
  // Canelo comes to stand beside you, left or right if he can (above the menu's cards)
  P.place = function (f, n) {
    const p = f.player, cand = [[p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y - 1], [p.x - 1, p.y - 1], [p.x + 1, p.y - 1], [p.x, p.y + 1]];
    if (cand.some(([x, y]) => x === n.x && y === n.y) && (n.y <= p.y)) { n.dir = towardP(n, { px: p.x, py: p.y }); return; }
    const ok = cand.find(([x, y]) => !f.blocked(x, y, n) && !f.exitAt(x, y));
    if (!ok) return;
    n.ox = n.ox + (n.x - ok[0]) * T; n.oy = n.oy + (n.y - ok[1]) * T; n.x = ok[0]; n.y = ok[1]; n.slide = true;
    n.dir = towardP(n, { px: p.x, py: p.y });
  };
  P.drawTop = function (f, ctx) {
    fxStep();
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const e of fx) {
      const k = e.t / e.life, x = Math.round(e.x - cx), y = Math.round(e.y - cy);
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      if (e.k === 'heart') G.text(ctx, '\u0003', x - 2, y, '#f04878', '#401020');
      else if (e.k === 'dust') { ctx.fillStyle = '#e8dcc0'; const r = 1 + Math.round(k * 2); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      else if (e.k === 'crumb') { ctx.fillStyle = '#c89048'; ctx.fillRect(x, y, 2, 2); }
      else if (e.k === 'drop') { ctx.fillStyle = '#88c8f8'; ctx.fillRect(x, y, 1, 2); }
      else if (e.k === 'spark') { ctx.fillStyle = '#fff8b0'; ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); }
      else if (e.k === 'q' || e.k === 'ex' || e.k === 'txt') {
        const s = e.k === 'q' ? '?' : e.k === 'ex' ? '!' : e.s, w = G.textWidth(s) + 8, bob = Math.round(Math.sin(e.t / 5) * 1.5);
        G.win(ctx, x - w / 2, y - 16 + bob, w, 13, { fill1: '#ffffff', fill2: '#e8e8f0', alpha: 1 });
        G.text(ctx, s, x - w / 2 + 4, y - 13 + bob, e.k === 'txt' ? '#2860a8' : '#c02020', null);
      }
      ctx.globalAlpha = 1;
    }
    // learning a trick: a thought bubble over him with its picture and its paw prints (1-2-3)
    const n = P.npc(f), l = P.learning();
    if (n && l && !n.pa && !P.sleeping(f) && G.top() === f && !f.locked) {
      const x = Math.round(n.x * T + n.ox - cx) + 12, y = Math.round(n.y * T + n.oy - cy) - 30 + Math.round(Math.sin(f.t / 8) * 2);
      G.win(ctx, x - 13, y - 4, 26, 26, { fill1: '#ffffff', fill2: '#e8e8f0', alpha: 1 });
      G.drawIcon16(ctx, l, x - 8, y - 1);
      for (let i = 0; i < P.NEED; i++) { ctx.fillStyle = i < P.tries(l) ? '#e85078' : '#c8c0d8'; ctx.fillRect(x - 8 + i * 6, y + 16, 5, 3); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y + 22, 3, 3); ctx.fillRect(x, y + 26, 2, 2);
    }
  };

  // ---------- playing animations from a script ----------
  P.play = function* (k, o = {}) {
    const f = G.field, n = P.npc(f); if (!n) { yield 10; return; }
    while (n.moving || n.slide) yield 1;
    const a = start(f, n, k, o);
    while (n.pa === a && G.frame - a.f0 < a.len) yield 1;
    if (n.pa === a) n.pa = null;
  };
  const ANIM = id => (trick(id) || {}).anim;
  P.trick = function* (id, o = {}) { yield* P.play(ANIM(id), o); };
  const dogXY = () => { const f = G.field, n = P.npc(f); return n ? [Math.round(n.x * T + n.ox + 12 - f.cam.x), Math.round(n.y * T + n.oy - f.cam.y)] : [G.W / 2, G.H / 2]; };
  // a speaking star for saying a command or a care word to Canelo (once per word per day, like say-it-back)
  function spokeStar(id) {
    const sb = G.state.sayback || (G.state.sayback = {}), today = G.world.today();
    if (sb[id] === today) { if (G.vocabLog) G.vlog('said', id, { via: 'PetMenu', star: false }); return false; } // (the dev-only log, vocablog.js: said, no star today)
    sb[id] = today;
    const [x, y] = dogXY(); G.mic.award(id, x, y - 8); G.fx.say('¡Bien dicho!', x, y - 26, '#a8f0ff', true);
    return true;
  }
  P.spokeStar = spokeStar;
  // the other cards of a "¡Dile a Canelo!" question: commands and care words he knows of, sounding different
  function others(id, pool) {
    const all = (pool || P.TRICKS.map(t => t.id).concat(['hueso', 'pelota', 'agua', 'cama'])).filter(k => k !== id && G.data.words[k]);
    return all.filter(k => !(id === 'ven' && k === 'bien'));
  }
  // one question: "¡Dile a Canelo!" (picture cards; say it or tap it) -> true if right on the first try
  P.ask = function* (id, o = {}) {
    const c = G.wordChoices(id, [id].concat(others(id, o.pool)), 3, { label: k => LABEL[k] || null });
    // (the trick's picture over the question only while it's new: once met, the child has to remember it)
    return yield* G.ask({ prompt: o.prompt || '¡Dile a Canelo!', en: o.en || 'Tell Canelo! (say the trick, or tap it)', show: o.show === false || S.seen(id) ? null : id, choices: c.choices, answer: c.answer, layout: 'cards', who: 'canelo' });
  };
  // for errands (a show): ask for any trick, then he does it
  P.command = function* (id, o = {}) { const first = yield* P.ask(id, o); yield* P.trick(id, { amp: P.knows(id) ? 1 : 0.7 }); return first; };
  // one good try at the trick he's learning; spoken: it was said straight at the menu (no question)
  P.practice = function* (id, spoken) {
    id = id || P.learning(); if (!id) return;
    if (!spoken) yield* P.ask(id); // (G.ask credits the word, words.js)
    else G.words.answerRight(id, { said: true, mode: 'both', noStar: true }); // said at the menu, where its card is written
    const p = st(); p.learning = id; p.tricks[id] = Math.min(P.NEED, (p.tricks[id] | 0) + 1);
    const k = p.tricks[id], [x, y] = dogXY();
    S.autosave();
    if (k === 1) { yield* P.play('huh'); yield* P.trick(id, { amp: 0.35 }); }
    else if (k === 2) yield* P.trick(id, { amp: 0.7 });
    else yield* P.trick(id, { amp: 1 });
    if (k < P.NEED) { puff('txt', x + G.field.cam.x, y + G.field.cam.y - 6, { s: k + '/' + P.NEED, life: 70 }); G.audio.sfx('select'); yield 30; return; }
    // learned!
    p.learning = null; S.autosave();
    P.sound('tada'); G.fx.confetti(x - 30, y + 10, -1, 16); G.fx.confetti(x + 30, y + 10, 1, 16);
    G.fx.say('¡' + G.baseForm(id).replace(/^¡|!$/g, '') + '!', x, y - 30, '#f8e060', true);
    if (G.hearts) G.hearts.add('canelo', 1, 'trick');
    yield 50;
    yield G.learnWords([id]);
    if (G.hearts) yield* G.hearts.milestones('canelo');
  };
  // the teaching scene: the teacher says it, Canelo does it for them, then your first try
  const tsay = (who, ...pages) => G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who });
  P.teach = function* (id, who) {
    const f = G.field, n = P.npc(f), p = st();
    p.learning = id; p.tricks[id] = p.tricks[id] | 0; if (G.vocabLog) G.vlog('shown', id, { via: 'pet-teach', who }); S.see(id); S.autosave();
    if (n) { while (n.moving) yield 1; P.place(f, n); }
    yield tsay(who, TT('¡Mira! Canelo... ¡[' + id + ']!', 'Look! Canelo... (watch what he does)'));
    yield* P.trick(id, { amp: 1 });
    yield tsay(who, TT('¡Muy bien, Canelo! ¡Ahora tú, {name}!', 'Good dog! Now you, {name}!'));
    yield* P.practice(id, false);
    yield tsay(who, TT('¡Otra vez! Toca a Canelo. ¡[' + id + ']!', 'Again! Tap Canelo and practice: three times.'));
  };
  // Mamá gives you Canelo (her "!" after the Saludos errand), the Mi perro page and his first trick
  P.start = function* (f) {
    f = f || G.field;
    F().canelo = true; F().petStart = true; S.autosave();
    let n = P.npc(f);
    if (!n) {
      const def = (G.maps[f.mapId].npcs || []).find(d => d.id === 'canelo') || { id: 'canelo', npc: 'canelo', x: 4, y: 5, dir: 'up' };
      n = f.addNpc(Object.assign({}, def, { x: 4, y: 5 })); n.ghost = true;
    }
    yield tsay('mama', TT('¡{name}! ¡Mira!', '{name}! Look!'));
    P.place(f, n); yield 16; yield* P.play('dance');
    yield tsay('mama', TT('¡Canelo es tu [perro]!', 'Canelo is your dog!'));
    if (G.animals) G.animals.meet('perro');
    yield* P.play('pet');
    yield tsay('mama', TT('¡Para ti!', 'For you! (a page about Canelo)'));
    if (!S.hasPage('mascota')) yield* G.findPage('mascota');
    yield* P.teach('sientate', 'mama');
  };

  // ---------- the pet menu ----------
  const LABEL = { pata: 'la pata' };
  const W = id => G.data.words[id];
  class PetMenu {
    constructor(w) {
      G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.won = null;
      const C = this.cards(), k = C.findIndex(c => c.st === 'learn');
      this.sel = k >= 0 ? k : Math.max(0, C.findIndex(c => c.st === 'known'));
      if (this.sel < 0 || C[this.sel].st === 'lock') this.sel = 5;
      this.mic = G.mic && G.mic.on() ? new G.MicBtn(this, { rect: () => this.micRect(), ready: () => this.t > 10 && !this.won, heard: a => this.heard(a) }) : null;
    }
    onEnter() { if (this.mic) this.mic.arm(); }
    onExit() { if (this.mic) this.mic.off(); }
    home() { return !!G.field && G.field.mapId === 'casa'; }
    cards() {
      const l = P.learning(), nx = P.TRICKS.find(t => !P.knows(t.id) && t.id !== l);
      return P.TRICKS.map(tr => ({ id: tr.id, row: 0, by: tr.by, st: P.knows(tr.id) ? 'known' : l === tr.id ? 'learn' : nx && nx.id === tr.id ? 'next' : 'lock' }))
        .concat(P.CARE.map(id => ({ id, row: 1, st: id === 'cama' && !this.home() ? 'away' : 'care' })));
    }
    rect(k) { return k < 5 ? { x: 9 + k * 54, y: 136, w: 52, h: 46 } : { x: 10 + (k - 5) * 44, y: 184, w: 40, h: 38 }; }
    micRect() { return { x: 279, y: 140, w: 36, h: 36 }; }
    closeXY() { return [G.W - 26, 6]; }
    hintXY() { const k = this.cards().findIndex(c => c.st === 'learn'); if (k < 0) return null; const r = this.rect(k); return [r.x + r.w / 2, r.y + r.h / 2]; }
    usable(c) { return c.st === 'known' || c.st === 'learn' || c.st === 'care' || c.st === 'away'; }
    heard(alts) {
      const C = this.cards(), targets = C.map(c => (c.st === 'known' || c.st === 'learn' || c.st === 'care') && W(c.id) && S.seen(c.id) ? G.mic.target({ word: c.id }) : null); // (a word not met yet waits for its chapter)
      const k = G.mic.best(targets, alts, C.findIndex(c => c.st === 'learn'));
      if (k < 0) { this.mic.miss(); return; }
      this.mic.win(); this.pick(k, true);
    }
    pick(k, spoken) {
      const c = this.cards()[k]; this.sel = k;
      if (!this.usable(c)) { G.audio.sfx('boop'); const r = this.rect(k); G.fx.say('?', r.x + r.w / 2, r.y - 6, '#ffd8a8'); return; }
      G.audio.sfx('ok');
      if (!spoken && c.st !== 'learn' && W(c.id)) G.speak((c.row === 0 ? '¡' + G.baseForm(c.id) + '!' : G.baseForm(c.id)));
      this.won = { k, t: 0, v: { id: c.id, spoken: !!spoken, st: c.st } };
    }
    update() {
      this.t++;
      if (this.won) { if (this.mic) { this.mic.t++; if (this.mic.pop) this.mic.pop--; } if (++this.won.t >= (this.won.v.spoken ? 24 : 10)) { G.pop(); this.w.resolve(this.won.v); } return; }
      if (this.mic && this.mic.update()) return;
      const C = this.cards(), d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { const row = this.sel < 5 ? [0, 5] : [5, 11], n = row[1] - row[0]; this.sel = row[0] + ((this.sel - row[0] + (d === 'left' ? -1 : 1) + n) % n); G.audio.sfx('cursor'); }
      if (d === 'up' || d === 'down') { // the card nearest above / below
        const r = this.rect(this.sel), cx = r.x + r.w / 2, want = d === 'up' ? [0, 5] : [5, 11];
        if ((d === 'up') === (this.sel >= 5)) { let b = want[0], bd = 1e9; for (let k = want[0]; k < want[1]; k++) { const q = this.rect(k), dd = Math.abs(q.x + q.w / 2 - cx); if (dd < bd) { bd = dd; b = k; } } this.sel = b; G.audio.sfx('cursor'); }
      }
      if (G.input.p('C') && W(C[this.sel].id)) G.speak(G.baseForm(C[this.sel].id));
      if (G.input.tap()) {
        if (G.closeHit(...this.closeXY())) { this.close(); return; }
        const k = C.findIndex((c, k) => G.tapIn(this.rect(k)));
        if (k >= 0) { this.pick(k); return; }
        const tp = G.input.tap(); if (tp.y < 128 && !G.tapIn(4, 4, 104, 28)) { this.close(); return; } // a tap on the map above closes it
        return;
      }
      if (G.input.p('A')) this.pick(this.sel);
      else if (G.input.p('B')) this.close();
    }
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); }
    draw(ctx) {
      const C = this.cards(), slide = Math.round(Math.max(0, 1 - this.t / 8) * 40);
      ctx.save(); ctx.translate(0, slide);
      G.win(ctx, 4, 130, G.W - 8, 92);
      C.forEach((c, k) => {
        const r = this.rect(k), sel = k === this.sel, mine = this.won && this.won.k === k, bob = sel && !this.won ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        const y = r.y - bob, lock = c.st === 'lock' || c.st === 'next';
        if (mine) { ctx.fillStyle = (this.won.t >> 2) & 1 ? '#fff8c0' : (this.won.v.spoken ? '#70e0ff' : '#f8d040'); ctx.fillRect(r.x - 2, y - 2, r.w + 4, r.h + 4); }
        const fill = lock ? { fill1: '#3a3e58', fill2: '#24263a' } : c.st === 'learn' ? { fill1: '#c04880', fill2: '#802858' } : sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : c.row ? { fill1: '#2c7a4a', fill2: '#14502a' } : {};
        G.win(ctx, r.x, y, r.w, r.h, Object.assign({ alpha: 1 }, fill));
        if (sel) { ctx.strokeStyle = '#f8e060'; ctx.lineWidth = 1; ctx.strokeRect(r.x + 0.5, y + 0.5, r.w - 1, r.h - 1); }
        if (c.row === 0) {
          if (c.st === 'lock') G.bigText(ctx, '?', r.x + r.w / 2, y + 12, 2, '#6a6e90', null);
          else if (c.st === 'next') { // who teaches it next: their little face, and the trick, faded
            ctx.globalAlpha = 0.35; G.drawIcon16(ctx, c.id, r.x + 9, y + 4, 2); ctx.globalAlpha = 1;
            ctx.drawImage(G.unitSprite(G.data.npcs[c.by].map, 'down', (this.t >> 5) & 1), r.x + r.w - 26, y + r.h - 28);
            G.text(ctx, '?', r.x + 6, y + r.h - 12, '#f8e060');
          } else {
            G.drawIcon16(ctx, c.id, r.x + 9, y + 2, 2);
            const lab = LABEL[c.id] || G.baseForm(c.id);
            G.textC(ctx, lab, r.x + r.w / 2, y + 35, c.st === 'known' ? '#f8d860' : '#ffffff');
            if (c.st === 'learn') for (let i = 0; i < P.NEED; i++) drawPaw(ctx, r.x + 6 + i * 14, y + 4, i < P.tries(c.id));
            if (c.st === 'known') G.text(ctx, '\u0005', r.x + r.w - 9, y + 3, '#f8d040');
          }
        } else {
          ctx.globalAlpha = c.st === 'away' ? 0.45 : 1;
          if (c.id === 'mimo') { G.drawIcon16(ctx, 'perro', r.x + 4, y + 3, 2); G.text(ctx, '\u0003', r.x + r.w - 12, y + 4, '#f04878', '#401020'); G.text(ctx, '\u0003', r.x + r.w - 16, y + 10, '#f87898', '#401020'); }
          else G.drawIcon16(ctx, c.id, r.x + 4, y + 3, 2);
          ctx.globalAlpha = 1;
          if (c.st === 'away') G.drawIcon16(ctx, 'casa', r.x + r.w - 15, y + r.h - 15);
        }
        if (sel && !this.won && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, y - 9, '#f8e060');
      });
      ctx.restore();
      // his name and hearts, top left
      G.win(ctx, 4, 4, 104, 28);
      G.drawIcon16(ctx, 'perro', 9, 10);
      G.text(ctx, 'Canelo', 28, 9, '#f8e060');
      if (G.hearts) G.hearts.row(ctx, 'canelo', 28, 19);
      G.closeBtn(ctx, ...this.closeXY());
      if (this.mic && slide === 0 && (!this.won || this.won.v.spoken)) this.mic.draw(ctx);
    }
  }
  function drawPaw(ctx, x, y, on) {
    const c = on ? '#ffe070' : 'rgba(255,255,255,0.35)';
    ctx.fillStyle = c; ctx.fillRect(x + 2, y + 4, 5, 4); ctx.fillRect(x + 1, y + 5, 7, 2);
    ctx.fillRect(x, y + 2, 2, 2); ctx.fillRect(x + 3, y, 2, 3); ctx.fillRect(x + 7, y + 2, 2, 2);
  }
  P.openMenu = function () { const w = new G.Wait(); G.push(new PetMenu(w)); return w; };

  // the whole thing, from Canelo's talk (field locked): the menu, what was picked, again, until closed
  P.menu = function* (f, n) {
    f = f || G.field; n = n || P.npc(f); if (!n) return;
    while (n.moving) yield 1;
    if (G.animals) G.animals.meet('perro');
    if (P.sleeping(f)) { f.petAwake = true; yield* P.play('wake'); }
    P.place(f, n); yield 10;
    lift(f, n);
    if (G.hearts && G.hearts.best('canelo') && !f.petDanced) { f.petDanced = true; yield* P.play('dance'); } else P.sound('bark');
    while (true) {
      const r = yield P.openMenu(); const v = r.result;
      if (!v) break;
      const end = yield* P.act(v);
      if (end) break;
      P.place(f, n); lift(f, n);
    }
    f.camShift = 0;
  };
  // the menu covers the bottom of the screen: lift the view so you and Canelo stay in sight above it
  function lift(f, n) {
    f.camShift = 0;
    const cam = f.camTarget(), bottom = Math.max(n.y, f.player.y) * T + T - cam.y;
    f.camShift = bottom > 118 ? Math.min(96, bottom - 116) : 0;
  }
  const careHeart = () => { if (G.hearts) G.hearts.add('canelo', 1, 'care'); };
  // one thing from the menu (or said to Canelo) -> true when the menu shouldn't come back (he went to sleep)
  P.act = function* (v) {
    const f = G.field, id = v.id, spoken = !!v.spoken;
    if (trick(id)) {
      if (P.knows(id)) { if (spoken) { spokeStar(id); G.words.answerRight(id, { said: true, mode: 'both', noStar: true }); } yield* P.trick(id); careHeart(); G.fx.say('¡Muy bien!', ...dogXY().map((q, i) => q - (i ? 26 : 0)), '#f8e060', true); yield 10; }
      else if (id === P.learning()) { if (spoken) spokeStar(id); yield* P.practice(id, spoken); }
      if (G.hearts) yield* G.hearts.milestones('canelo');
      return false;
    }
    if (W(id)) { if (G.vocabLog && !spoken) G.vlog('picked', id, { via: 'pet-menu' }); S.see(id); }
    let learnIt = false;
    // said from its picture (the care cards have no words): a retrieval that can make it gold (words.js)
    if (spoken) { spokeStar(id); learnIt = !!(W(id) && G.words.answerRight(id, { said: true, mode: 'say', noStar: true }).gold); }
    if (id === 'hueso' || id === 'galleta') { yield* P.play('eat', { item: id }); if (!(G.hearts && G.hearts.gift('canelo', id))) careHeart(); }
    else if (id === 'agua') { yield* P.play('drink'); careHeart(); }
    else if (id === 'pelota') { yield* P.play('fetch'); careHeart(); }
    else if (id === 'mimo') { yield* P.play('pet'); careHeart(); }
    else if (id === 'cama') {
      if (f.mapId !== 'casa') { yield* P.play('huh'); const [x, y] = dogXY(); puff('txt', x + f.cam.x, y + f.cam.y - 6, { s: 'la casa', life: 70 }); yield 30; }
      else {
        const n = P.npc(f); st().sleep = true; f.petAwake = false; S.autosave();
        if (n) { n.ox += (n.x - P.BED[0]) * T; n.oy += (n.y - P.BED[1]) * T; n.x = P.BED[0]; n.y = P.BED[1]; n.slide = true; }
        yield 24; P.sound('snore');
        if (learnIt) yield G.learnWords(['cama'], { noMic: true });
        return true;
      }
    }
    if (learnIt) yield G.learnWords([id], { noMic: true });
    if (G.hearts) yield* G.hearts.milestones('canelo');
    return false;
  };

  // ---------- the night (day.js): asleep on his cushion; up again in the morning ----------
  P.night = function (f) { if (!G.state || !P.mine()) return; st().sleep = true; const n = P.npc(f); if (n) { n.pa = null; n.x = P.BED[0]; n.y = P.BED[1]; n.ox = n.oy = 0; n.dir = 'left'; } };
  P.morning = function (f) { if (!G.state || !P.mine()) return; st().sleep = false; const n = P.npc(f); if (n) start(f, n, 'wake'); };
})();
