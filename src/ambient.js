// ===== Living town: birds, butterflies and a cat; people who look at you; Tomás's mail round; Canelo tags along =====
// Hooks in field.js: G.ambient.update(field) every frame the map is on top (after its tasks); G.ambient.draw(field, ctx,
// 'ground' | 'air') before / after the people; G.ambient.poke(field, x, y) when A searches a tile (petting the cat).
// Critters are pure decoration: never in field.npcs, never block, and they animate from G.frame, so they keep moving
// under a dialogue box. A tap on one is read, never eaten (tap-to-walk still walks there).
// Map def:  ambient: { birds: n, butterflies: n, cat: [x, y] }   (the cat sits on a fence post)
// NPC defs (maps.js):
//   follow: () => bool               while true, walks after the player loosely, as a ghost (Canelo, once you've met him)
//   route: [[x, y, dir, wait], ...]  walks this loop of stops along the roads, pausing `wait` frames facing `dir` (Tomás)
//   noLook: true                     never turns to look at the player (everyone else does when you come close)
// A talk (the field locked) stops a walker; someone you walk up to waits for you (~4 s, or as long as a tap-walk is on its
// way to them; never on a doorstep). G.ambient.happy(npc, say) makes someone hop with a heart (Canelo when you pet him).
// Uses Math.random, not G.rand, so the game's seedable dice stay untouched.
'use strict';
(function () {
  const T = G.TILE, A = G.ambient = {};
  const rnd = n => Math.random() * n, ri = n => Math.floor(Math.random() * n);
  const key = (x, y) => x + ',' + y;
  const man = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const DIR4 = ['up', 'down', 'left', 'right'];
  const GROUND = '.o,=p', ROAD = ',=p', PLAZA = '=p'; // birds hop on grass, flowers, paths and the plaza; walkers prefer roads
  const NEAR = 2, WAIT = 240;                         // people notice you within 2 tiles, and wait ~4 s for you to talk

  // ---------- tiny pixel pictures (rows of letters -> palette), cached, with a dark outline ----------
  const OL = '#1a1420';
  function pix(id, rows, pal, flip, outline = true) {
    const w = Math.max(...rows.map(r => r.length)), h = rows.length, o = outline ? 1 : 0;
    rows = rows.map(r => r.padEnd(w, '.'));
    return G.cached('amb|' + id + (flip ? '|f' : ''), w + 2 * o, h + 2 * o, ctx => {
      const at = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return null; const c = rows[y][flip ? w - 1 - x : x]; return c === '.' ? null : c; };
      if (o) { ctx.fillStyle = OL; for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) if (!at(x, y) && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) ctx.fillRect(x + o, y + o, 1, 1); }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = at(x, y); if (c && pal[c]) { ctx.fillStyle = pal[c]; ctx.fillRect(x + o, y + o, 1, 1); } }
    });
  }
  // birds face right; every frame keeps the body on row 2 and the feet on row 5
  const BIRD = {
    stand: ['......hh.', '.....hhek', 'ttbbbbh..', '.tbddbw..', '..bwww...', '...l.l...'],
    peck: ['.........', '.........', 'ttbbbb...', '.tbddbhh.', '..bwwbhek', '...l.l...'],
    up: ['...dd....', '...ddd.hh', 'ttbbbbhek', '..bwwb...', '.........', '.........'],
    down: ['.........', '.......hh', 'ttbbbbhek', '..bdddb..', '...ddd...', '....d....'],
  };
  const BIRD_PAL = {
    gorrion: { h: '#6a3e1c', e: '#101010', k: '#f0b040', t: '#5a3818', b: '#b88044', d: '#6a4422', w: '#f0dcb4', l: '#e09050' },
    paloma: { h: '#5c6a90', e: '#101010', k: '#f0d0b8', t: '#4a4e64', b: '#a4a8bc', d: '#767a92', w: '#dcdee8', l: '#e07878' },
    azulejo: { h: '#2e5cc0', e: '#101010', k: '#383028', t: '#22408c', b: '#4a7ee0', d: '#2a4ca0', w: '#f4a060', l: '#806040' },
  };
  // butterflies (from above): wings open, half, shut; w = wing, s = wing edge / spots, b = body
  const FLY = [['ws...sw', 'wwwbwww', '.wsbsw.', '..w.w..'], ['.w...w.', '.wwbww.', '..wbw..', '..w.w..'], ['...w...', '..wbw..', '...b...', '.......']];
  const FLY_COL = [['#f88c28', '#3a1808'], ['#f8e050', '#b88018'], ['#f8f8f0', '#8888a0'], ['#78b4f8', '#2848a0'], ['#f8a0d0', '#b03878']].map(([w, s]) => ({ w, s, b: '#3a2418' }));
  // an orange tabby sitting on a fence post, facing you
  const CAT_PAL = { b: '#f09840', d: '#b8601c', w: '#fff0d8', E: '#58c040', n: '#f07890', s: '#b8601c' };
  const CAT_HEAD = ['b.....b', 'bb...bb', 'bdbdbdb', 'bEbbbEb', 'bbbnbbb', '.bwwwb.'];
  const CAT_HEAD_SHUT = ['b.....b', 'bb...bb', 'bdbdbdb', 'bsbbbsb', 'bbbnbbb', '.bwwwb.'];
  const CAT_BODY = ['.bbwbb.', 'bbdwdbb', 'bbbwbbb', 'bwbbbwb'];
  const CAT_TAIL = [[[7, 8], [8, 8], [8, 9], [8, 10], [8, 11], [7, 12]], [[7, 8], [8, 8], [8, 9], [8, 10], [9, 11], [9, 12]], [[7, 8], [8, 8], [9, 9], [9, 10], [10, 10], [10, 11]]];

  // ---------- little sounds, made here (the synth's own effects are private to audio.js) ----------
  function tone(type, f0, f1, len, vol, at = 0) {
    const au = G.audio; if (!au || !au.ctx || !au.sfxGain) return;
    const ac = au.ctx, t = ac.currentTime + 0.01 + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(au.sfxGain); o.start(t); o.stop(t + len + 0.03);
  }
  function hiss(freq, len, vol) {
    const au = G.audio; if (!au || !au.ctx || !au.noise) return;
    const ac = au.ctx, t = ac.currentTime + 0.01, n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    n.buffer = au.noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.5;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(f); f.connect(g); g.connect(au.sfxGain); n.start(t); n.stop(t + len + 0.05);
  }
  const flutter = () => { hiss(2400, 0.2, 0.14); tone('sine', 2900, 3700, 0.05, 0.035, 0.04); tone('sine', 3100, 4000, 0.05, 0.03, 0.12); };
  function meow() {
    const au = G.audio; if (!au || !au.ctx || !au.sfxGain) return;
    const ac = au.ctx, t = ac.currentTime + 0.01, o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 1500;
    o.frequency.setValueAtTime(560, t); o.frequency.linearRampToValueAtTime(820, t + 0.12); o.frequency.linearRampToValueAtTime(500, t + 0.42);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.05); g.gain.setValueAtTime(0.07, t + 0.28); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(lp); lp.connect(g); g.connect(au.sfxGain); o.start(t); o.stop(t + 0.5);
  }
  const yip = () => { tone('triangle', 640, 360, 0.09, 0.16); tone('triangle', 700, 380, 0.09, 0.16, 0.14); };

  // ---------- setting up a map ----------
  function setup(f) {
    const cfg = f.def.ambient || {}, a = f.amb = { f: G.frame, birds: [], flies: [], cat: null, fx: [], spots: [], flowers: [], flap: 0 };
    for (let y = 0; y < f.map.h; y++) for (let x = 0; x < f.map.w; x++) {
      const c = f.map.get(x, y);
      if (GROUND.includes(c) && !f.exitAt(x, y)) a.spots.push([x, y]);
      if (c === 'o') a.flowers.push([x, y]);
    }
    const p = f.player, away = s => Math.abs(s[0] - p.x) + Math.abs(s[1] - p.y) >= 4;
    // little flocks of 2-3, away from you: one in sight as you arrive, pigeons in the plaza, the rest anywhere
    const picks = [s => away(s) && Math.abs(s[0] - p.x) <= 5 && Math.abs(s[1] - p.y) <= 3, s => away(s) && PLAZA.includes(f.map.get(s[0], s[1])), away];
    for (let left = cfg.birds || 0, tries = 0; left > 0 && tries < 100; tries++) {
      const s = spot(f, a, picks[Math.min(tries, picks.length - 1)]); if (!s) continue;
      const k = kindAt(f, s[0], s[1]);
      for (let i = 0, n = 2 + ri(2); i < n && left > 0; i++) { const x = s[0] * T + 4 + rnd(16), y = s[1] * T + 6 + rnd(14); if (okGround(f, x, y)) { a.birds.push(bird(k, x, y)); left--; } }
    }
    const inView = ([x, y]) => Math.abs(x - p.x) <= 6 && Math.abs(y - p.y) <= 4 && Math.abs(x - p.x) + Math.abs(y - p.y) >= 2;
    const mixed = a.flowers.slice().sort(() => Math.random() - 0.5), fl = mixed.filter(inView).slice(0, 2);
    fl.push(...mixed.filter(h => !fl.includes(h)));
    for (let i = 0; i < (cfg.butterflies || 0) && i < fl.length; i++) a.flies.push(butterfly(fl[i]));
    if (cfg.cat) a.cat = { x: cfg.cat[0], y: cfg.cat[1], t: ri(100), blink: 0, look: 0, lookT: 0, happy: 0 };
    for (const n of f.npcs) { meet(n); if (n.follow && n.follow()) { follow(n); placeNear(f, n); } }
  }
  // per-person state, kept on the person (a fresh copy every time a map is entered)
  function meet(n) { if (!n.amb) n.amb = { dir0: n.dir, look: 0, back: 0, near: 0, hold: n.route ? 60 + ri(120) : 0, i: n.route ? 1 % n.route.length : 0, stuck: 0, hop: 0, idle: 0, sniff: 200 }; return n.amb; }
  function follow(n) { const m = meet(n); if (!m.follow) { m.follow = true; n.ghost = true; n.wander = 0; } }
  const special = (f, x, y) => !!((f.def.pages || {})[key(x, y)] || (f.def.searches || {})[key(x, y)]); // a follower keeps off these
  // a follower arriving on the map (out of a door) appears beside you
  function placeNear(f, n) { // the nearest free tile you could walk to; beside or behind you before in front
    const p = f.player, [fx, fy] = f.facing(), [bx, by] = G.DIRS[p.dir], seen = new Set([key(p.x, p.y)]), c = [];
    for (let d = 1, q = [[p.x, p.y]]; d <= 3 && !c.length; d++) {
      const nq = [];
      for (const [x0, y0] of q) for (const k of DIR4) {
        const x = x0 + G.DIRS[k][0], y = y0 + G.DIRS[k][1];
        if (seen.has(key(x, y)) || f.blocked(x, y, n) || f.exitAt(x, y)) continue;
        seen.add(key(x, y)); nq.push([x, y]);
        if (!(x === fx && y === fy) && !special(f, x, y)) c.push([(x - p.x) * bx + (y - p.y) * by, x, y]);
      }
      q = nq;
    }
    c.sort((a, b) => a[0] - b[0]);
    if (c.length) { n.x = c[0][1]; n.y = c[0][2]; n.ox = n.oy = 0; n.dir = toward(n, p); }
  }
  const kindAt = (f, x, y) => PLAZA.includes(f.map.get(x, y)) ? 'paloma' : Math.random() < 0.3 ? 'azulejo' : 'gorrion';
  function okGround(f, x, y) {
    const tx = Math.floor(x / T), ty = Math.floor(y / T);
    return GROUND.includes(f.map.get(tx, ty)) && !f.exitAt(tx, ty) && !f.npcs.some(n => !n.hidden && n.x === tx && n.y === ty) && !(f.player.x === tx && f.player.y === ty);
  }
  function spot(f, a, ok) { const c = a.spots.filter(ok); return c.length ? c[ri(c.length)] : null; }
  const bird = (k, x, y) => ({ k, x, y, z: 0, vx: 0, vy: 0, vz: 0, f: ri(2) ? 1 : -1, st: 'ground', t: ri(60), act: null, at: 0, age: ri(8), scare: 0 });
  function butterfly(h) {
    const hx = h[0] * T + 12, hy = h[1] * T + 14;
    const c = FLY_COL[ri(FLY_COL.length)];
    return { hx, hy, x: hx + rnd(16) - 8, y: hy + rnd(10) - 5, z: 10, vx: 0, vy: 0, tx: hx, ty: hy, t: 0, sp: 0.5, ph: ri(64), age: 0, c };
  }

  // ---------- critters, one tick per game frame ----------
  function sync(f) {
    const a = f.amb; if (!a) return;
    let n = G.frame - a.f; if (n <= 0) return;
    a.f = G.frame; if (n > 4) n = 4; // after a long pause (a hidden tab) just carry on
    while (n--) tick(f, a);
  }
  const center = o => [o.x * T + (o.ox || 0) + 12, o.y * T + (o.oy || 0) + 16];
  function tick(f, a) {
    const p = f.player, [px, py] = center(p), th = [[px, py, 44]]; // birds fly when you come within ~2 tiles
    for (const n of f.npcs) if (n.spec && !n.hidden) { const [x, y] = center(n); th.push([x, y, n.amb && n.amb.follow ? 30 : n.moving ? 20 : 12]); }
    for (const b of a.birds) {
      b.age++;
      if (b.st === 'ground' || b.st === 'land') {
        const t = th.find(([x, y, r]) => Math.hypot(b.x - x, b.y - y) < r);
        if (t && (b.st === 'ground' || b.z < 20)) { scare(f, a, b, t[0], t[1]); continue; }
      }
      if (b.st === 'ground') ground(f, b);
      else if (b.st === 'fly') {
        b.x += b.vx; b.y += b.vy; b.z += b.vz; b.vx *= 1.01; b.t++;
        const sx = b.x - f.cam.x, sy = b.y - b.z - f.cam.y;
        if (b.t > 240 || sx < -40 || sx > G.W + 40 || sy < -40 || sy > G.H + 60) { b.st = 'away'; b.t = 420 + ri(700); } // come back later
      } else if (b.st === 'away') { if (--b.t <= 0) land(f, a, b); }
      else if (b.st === 'land') {
        const s = Math.min(1, ++b.t / b.lt), e = 1 - (1 - s) * (1 - s);
        b.x = b.lx + (b.tx - b.lx) * e; b.y = b.ly + (b.ty - b.ly) * e; b.z = (1 - e) * 64;
        if (s >= 1) { b.st = 'ground'; b.z = 0; b.t = 30 + ri(60); b.act = null; }
      }
    }
    for (const fl of a.flies) {
      fl.age++;
      if (fl.flee > 0) fl.flee--; else if (Math.hypot(fl.x - px, fl.y - py) < 26) flee(f, a, fl);
      if (--fl.t <= 0 || Math.hypot(fl.tx - fl.x, fl.ty - fl.y) < 3) { fl.tx = fl.hx + rnd(30) - 15; fl.ty = fl.hy + rnd(20) - 10; fl.t = 40 + ri(80); }
      const dx = fl.tx - fl.x, dy = fl.ty - fl.y, d = Math.hypot(dx, dy) || 1;
      fl.vx += dx / d * 0.07 + rnd(0.2) - 0.1; fl.vy += dy / d * 0.07 + rnd(0.2) - 0.1;
      const v = Math.hypot(fl.vx, fl.vy); if (v > fl.sp) { fl.vx *= fl.sp / v; fl.vy *= fl.sp / v; }
      fl.x += fl.vx; fl.y += fl.vy; fl.sp = Math.max(0.5, fl.sp * 0.985);
      fl.z = 10 + Math.sin((fl.age + fl.ph) / 18) * 4 + (fl.sp - 0.5) * 10;
    }
    const c = a.cat;
    if (c) {
      c.t++; if (c.happy > 0) c.happy--;
      if (c.blink > 0) c.blink--; else if (ri(260) === 0) c.blink = 7;
      const dx = px - (c.x * T + 12), near = Math.abs(dx) < 3 * T && Math.abs(py - (c.y * T + 12)) < 3 * T;
      const want = near && Math.abs(dx) > 8 ? Math.sign(dx) : 0;
      if (near || c.happy) c.nap = 0; else c.nap = (c.nap || 0) + 1; // nobody about for ~8 s: a nap (Round B)
      if (want !== c.look && ++c.lookT > 10) { c.look = want; c.lookT = 0; } else if (want === c.look) c.lookT = 0;
    }
    a.fx = a.fx.filter(e => ++e.t < e.life);
  }
  function ground(f, b) {
    if (b.scare > 0) { if (--b.scare === 0) fly(b, b.sx, b.sy); return; } // the rest of the flock goes a moment later
    if (b.act === 'hop') {
      const s = ++b.at / 10; b.x = b.hx0 + (b.hx - b.hx0) * s; b.y = b.hy0 + (b.hy - b.hy0) * s; b.z = Math.sin(s * Math.PI) * 3;
      if (b.at >= 10) { b.act = null; b.z = 0; } return;
    }
    if (b.act === 'peck') { if (++b.at >= b.an) b.act = null; return; }
    if (--b.t > 0) return;
    b.t = 20 + ri(80);
    const r = Math.random();
    if (r < 0.45) { b.act = 'peck'; b.at = 0; b.an = 8 * (1 + ri(3)); }
    else if (r < 0.8) {
      const dx = (Math.random() < 0.7 ? b.f : -b.f) * (3 + rnd(5)), dy = rnd(6) - 3;
      if (okGround(f, b.x + dx, b.y + dy)) { b.f = dx > 0 ? 1 : -1; b.act = 'hop'; b.at = 0; b.hx0 = b.x; b.hy0 = b.y; b.hx = b.x + dx; b.hy = b.y + dy; }
      else b.f = -b.f;
    } else b.f = -b.f;
  }
  function scare(f, a, b, sx, sy) {
    if (b.st !== 'ground' && b.st !== 'land') return;
    fly(b, sx, sy);
    for (const o of a.birds) if (o !== b && o.st === 'ground' && !o.scare && Math.hypot(o.x - b.x, o.y - b.y) < 40) { o.scare = 2 + ri(10); o.sx = sx; o.sy = sy; }
    const vx = b.x - f.cam.x, vy = b.y - f.cam.y;
    if (vx > -8 && vx < G.W + 8 && vy > -8 && vy < G.H + 8 && G.frame - a.flap > 20) { a.flap = G.frame; flutter(); }
  }
  function fly(b, sx, sy) {
    let dx = b.x - sx, dy = b.y - sy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (Math.abs(dx) < 0.35) dx = (dx < 0 || (!dx && b.f < 0) ? -1 : 1) * 0.35;
    const sp = 1.8 + rnd(0.8);
    Object.assign(b, { st: 'fly', t: 0, act: null, scare: 0, vx: dx * sp + rnd(0.6) - 0.3, vy: dy * sp * 0.5 - 0.3, vz: 1.1 + rnd(0.5) });
    b.f = b.vx >= 0 ? 1 : -1;
  }
  function land(f, a, b) { // glide back in, near a friend far from you, or anywhere quiet
    const p = f.player, far = (x, y) => Math.abs(x / T - p.x - 0.5) + Math.abs(y / T - p.y - 0.5) > 5;
    const mates = a.birds.filter(o => o.st === 'ground' && far(o.x, o.y));
    let tx = null, ty = null;
    if (mates.length && ri(3)) { const m = mates[ri(mates.length)]; tx = m.x + rnd(24) - 12; ty = m.y + rnd(10) - 5; }
    if (tx === null || !okGround(f, tx, ty)) {
      const d = s => Math.abs(s[0] - p.x) + Math.abs(s[1] - p.y), s = spot(f, a, s => d(s) > 5 && d(s) < 10) || spot(f, a, s => d(s) > 5); // in sight, if it can
      if (!s) { b.t = 120; return; }
      tx = s[0] * T + 4 + rnd(16); ty = s[1] * T + 6 + rnd(14); if (!okGround(f, tx, ty)) { b.t = 60; return; }
    }
    b.f = ri(2) ? 1 : -1;
    Object.assign(b, { st: 'land', t: 0, lt: 80, tx, ty, lx: tx - b.f * (90 + rnd(40)), ly: ty - 10 - rnd(20) });
    b.x = b.lx; b.y = b.ly; b.z = 64;
  }
  function flee(f, a, fl) { // off to another flower, away from you
    const p = f.player, hx = Math.floor(fl.hx / T), hy = Math.floor(fl.hy / T);
    const opts = a.flowers.filter(([x, y]) => { const d = Math.abs(x - hx) + Math.abs(y - hy); return d >= 2 && d <= 7 && Math.abs(x - p.x) + Math.abs(y - p.y) >= 3; });
    const h = opts.length ? opts[ri(opts.length)] : null;
    if (h) { fl.hx = h[0] * T + 12; fl.hy = h[1] * T + 14; }
    else { fl.hx += Math.sign(fl.x - (p.x * T + 12)) * 40 || 40; } // nowhere to go: just away
    fl.tx = fl.hx; fl.ty = fl.hy; fl.t = 90; fl.sp = 1.5; fl.flee = 40;
  }
  function pet(a) {
    const c = a.cat; c.nap = 0; if (c.happy > 30) return;
    c.happy = 80; meow();
    if (!G.animals) a.fx.push({ kind: 'say', s: '¡Miau!', x: c.x * T + 12, y: c.y * T - 9, dx: -8, t: 0, life: 70 }); // the bubble up-left (Round B: the word bubble says it),
    a.fx.push({ kind: 'heart', x: c.x * T + 22, y: c.y * T - 4, t: 0, life: 50 });                    // a heart rising on the right
  }
  function catHit(c, wx, wy) { const x = c.x * T + 12, y = c.y * T; return wx >= x - 10 && wx < x + 11 && wy >= y - 9 && wy < y + 12; }

  // ---------- people ----------
  const toward = (n, p) => { const dx = p.x - n.x, dy = p.y - n.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : dy < 0 ? 'up' : n.dir); };
  // first step of the cheapest walk from o to a tile where goal(x, y) holds (people and doors in the way go around;
  // with roads, grass costs 3 so walkers keep to the paths); null if there is none
  function stepTo(f, o, goal, roads) {
    const W = f.map.w, H = f.map.h, start = o.y * W + o.x, D = new Int32Array(W * H).fill(1e9), first = new Int8Array(W * H).fill(-1), B = [[start]];
    D[start] = 0;
    for (let c = 0; c < B.length; c++) for (const i of B[c] || []) {
      if (D[i] !== c) continue;
      const x = i % W, y = (i - x) / W;
      if (i !== start && goal(x, y)) return DIR4[first[i]];
      for (let k = 0; k < 4; k++) {
        const [dx, dy] = G.DIRS[DIR4[k]], nx = x + dx, ny = y + dy, j = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || f.blocked(nx, ny, o) || f.exitAt(nx, ny)) continue;
        const nc = c + (roads && !ROAD.includes(f.map.get(nx, ny)) ? 3 : 1);
        if (nc < D[j]) { D[j] = nc; first[j] = i === start ? k : first[i]; (B[nc] || (B[nc] = [])).push(j); }
      }
    }
    return null;
  }
  function go(f, n, dir, speed) { n.busy = true; f.tasks.add((function* () { yield* f.step(n, dir, speed); n.busy = false; })()); }
  // Tomás: stop to stop along the roads; at a door he slips a letter in
  function walker(f, n, stay) {
    const m = n.amb, R = n.route;
    if (stay && !DIR4.some(d => f.exitAt(n.x + G.DIRS[d][0], n.y + G.DIRS[d][1]))) return; // never wait on a doorstep
    if (m.hold > 0) { m.hold--; return; }
    const [sx, sy, sdir, wait] = R[m.i];
    if (n.x === sx && n.y === sy) {
      if (sdir) n.dir = sdir;
      m.hold = wait || 0; m.i = (m.i + 1) % R.length; m.stuck = 0;
      const door = (f.def.exits || []).find(e => e.y === sy - 1 && Math.abs(e.x - sx) <= 1);
      if (door) f.amb.fx.push({ kind: 'letter', x: sx * T + 12 + (door.x - sx) * 4, y: sy * T + 6, dx: (door.x - sx) * 16, t: 0, life: 36 });
      return;
    }
    const d = stepTo(f, n, (x, y) => x === sx && y === sy, true);
    if (d) { m.stuck = 0; go(f, n, d, 1.5); }
    else if (++m.stuck > 5) { m.i = (m.i + 1) % R.length; m.stuck = 0; } // someone stands on the stop: skip it
    else m.hold = 20;
  }
  // Canelo: trots after you as a ghost (you can walk through him), stays a tile or two away, sniffs about
  function follower(f, n) {
    const m = n.amb, p = f.player;
    if (f.locked) return;
    if (m.hold > 0) { m.hold--; return; }
    const d = man(n, p), [fx, fy] = f.facing(), ok = (x, y) => !(x === fx && y === fy) && !special(f, x, y);
    const crowd = d === 0 || f.npcs.some(o => o !== n && !o.ghost && !o.hidden && o.x === n.x && o.y === n.y);
    if (crowd || d >= 3) {
      const dir = stepTo(f, n, (x, y) => { const e = Math.abs(x - p.x) + Math.abs(y - p.y); return e >= 1 && e <= 2 && ok(x, y); }, false);
      if (dir) { go(f, n, dir, d > 5 ? 4 : 3); m.idle = 0; } else m.hold = 30; // no way through right now: try again soon
      return;
    }
    n.dir = toward(n, p);
    if (++m.idle > m.sniff) {
      m.idle = 0; m.sniff = 150 + ri(240);
      const dirs = DIR4.filter(k => { const x = n.x + G.DIRS[k][0], y = n.y + G.DIRS[k][1], e = Math.abs(x - p.x) + Math.abs(y - p.y); return e >= 1 && e <= 2 && ok(x, y) && !f.blocked(x, y, n) && !f.exitAt(x, y); });
      if (dirs.length) go(f, n, dirs[ri(dirs.length)], 2);
    }
  }

  // ---------- hooks ----------
  A.update = function (f) {
    if (!f.amb) setup(f);
    sync(f);
    const tap = G.input.tap(), a = f.amb, p = f.player;
    if (tap) { // poke a critter (the tap still walks you there); Round B: it says its name too (animals.js)
      const wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y), [px, py] = center(p);
      let named = null;
      for (const b of a.birds) if ((b.st === 'ground' || b.st === 'land') && Math.hypot(b.x - wx, b.y - b.z - 3 - wy) < 12) { scare(f, a, b, px, py); named = named || ['pajaro', b.x, b.y - b.z - 8]; }
      for (const fl of a.flies) if (Math.hypot(fl.x - wx, fl.y - fl.z - wy) < 12) { flee(f, a, fl); named = named || ['mariposa', fl.x, fl.y - fl.z - 4]; }
      if (a.cat && catHit(a.cat, wx, wy) && !(G.errands && G.errands.catTap(f))) { pet(a); named = ['gato', a.cat.x * T + 12, a.cat.y * T - 8]; } // (errands.js: the sleepy cat, the sound game)
      if (named && G.animals) G.animals.tap(named[0], named[1], named[2], { silent: true });
    }
    for (const n of f.npcs) {
      const m = meet(n);
      if (m.hop > 0) { m.hop--; if (!n.moving) n.oy = -Math.round(Math.abs(Math.sin(m.hop / 12 * Math.PI)) * 5); }
      if (n.hidden || !n.spec || n.moving || n.busy) continue;
      if (n.follow && n.follow()) { follow(n); follower(f, n); continue; }
      if (f.locked) { m.hold = Math.max(m.hold, 45); continue; } // a talk or a cutscene: stand still, and a moment after
      const d = man(n, p);
      if (d <= NEAR) m.near++; else if (d > NEAR + 1) m.near = 0;
      const stay = d <= NEAR && (m.near < WAIT || (f.route && f.route.npc === n));
      if (!n.noLook) { // turn to look at you; people who stand in one spot turn back when you leave
        if (d && d <= NEAR) { if (++m.look > 6) n.dir = toward(n, p); m.back = 0; }
        else { m.look = 0; if (!n.wander && !n.route && n.dir !== m.dir0 && d > NEAR + 1 && ++m.back > 40) n.dir = m.dir0; }
      }
      if (n.route) walker(f, n, stay);
      else if (n.wander && stay) n.wt = Math.max(n.wt, 2); // hold still while you come over
    }
  };
  A.draw = function (f, ctx, layer) {
    const a = f.amb; if (!a) return;
    sync(f);
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), vis = (x, y) => x > cx - 24 && x < cx + G.W + 24 && y > cy - 24 && y < cy + G.H + 80;
    const drawBird = b => {
      const fr = b.st === 'ground' ? (b.act === 'peck' && (b.at >> 2) & 1 ? 'peck' : 'stand') : b.st === 'land' && b.z < 8 ? 'up' : (b.age >> 2) & 1 ? 'up' : 'down';
      ctx.drawImage(pix(b.k + fr, BIRD[fr], BIRD_PAL[b.k], b.f < 0), Math.round(b.x - cx) - 5, Math.round(b.y - b.z - cy) - 7);
    };
    if (layer === 'ground') {
      ctx.fillStyle = 'rgba(16,28,8,0.28)';
      for (const b of a.birds) if (b.st !== 'away' && b.z < 48 && vis(b.x, b.y)) { const w = b.z > 16 ? 2 : 4; ctx.fillRect(Math.round(b.x - cx - w / 2), Math.round(b.y - cy) - 1, w, 1); }
      for (const fl of a.flies) if (vis(fl.x, fl.y)) ctx.fillRect(Math.round(fl.x - cx) - 1, Math.round(fl.y - cy), 2, 1);
      for (const b of a.birds) if (b.st === 'ground' && vis(b.x, b.y)) drawBird(b);
      return;
    }
    const c = a.cat; // on its fence post, in front of anyone standing behind the fence
    if (c && vis(c.x * T, c.y * T)) {
      const nap = (c.nap || 0) > 480, x = c.x * T + 9 - cx, y = c.y * T - 5 - cy, tail = CAT_TAIL[nap ? 0 : [0, 1, 2, 1][(c.t >> (c.happy ? 2 : 4)) & 3]], shut = c.blink || c.happy > 10 || nap;
      ctx.fillStyle = OL; for (const [tx, ty] of tail) ctx.fillRect(x + tx - 1, y + ty - 1, 3, 3);
      ctx.fillStyle = CAT_PAL.b; for (const [tx, ty] of tail) ctx.fillRect(x + tx, y + ty, 1, 1);
      ctx.drawImage(pix('catbody', CAT_BODY, CAT_PAL), x - 1, y + 5);
      ctx.drawImage(pix(shut ? 'cathead2' : 'cathead', shut ? CAT_HEAD_SHUT : CAT_HEAD, CAT_PAL), x - 1 + c.look, y - 1 + (nap ? 1 : 0));
      if (nap) for (let i = 0; i < 2; i++) { const k = ((c.t + i * 50) % 100) / 100; ctx.globalAlpha = 1 - k; G.text(ctx, 'z', x + 8 + Math.round(k * 6), y - 4 - Math.round(k * 12), '#ffffff', '#303060'); ctx.globalAlpha = 1; }
    }
    for (const b of a.birds) if ((b.st === 'fly' || b.st === 'land') && vis(b.x, b.y - b.z)) drawBird(b);
    for (const fl of a.flies) {
      if (!vis(fl.x, fl.y)) continue;
      const fr = [0, 1, 2, 1][((fl.age + fl.ph) >> 2) & 3];
      ctx.drawImage(pix('fly' + fl.c.w + fr, FLY[fr], fl.c, false, false), Math.round(fl.x - cx) - 3, Math.round(fl.y - fl.z - cy) - 2);
    }
    for (const e of a.fx) {
      const k = e.t / e.life; let x = Math.round((e.o ? e.o.x * T + e.o.ox + 12 : e.x) - cx), y = Math.round((e.o ? e.o.y * T + e.o.oy - 8 : e.y) - cy);
      ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
      if (e.kind === 'heart') G.text(ctx, '\u0003', x - 2 + (e.dx || 0), y - Math.round(e.t * 0.35), '#f04878', '#401020');
      else if (e.kind === 'say') { const w = G.textWidth(e.s) + 8, bx = x + (e.dx || 0) - (w >> 1), by = y - 14; G.win(ctx, bx, by, w, 13, { fill1: '#ffffff', fill2: '#e8e8f0', alpha: 1 }); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, by + 12, 3, 2); G.text(ctx, e.s, bx + 4, by + 3, '#603018', null); }
      else if (e.kind === 'letter') { const ly = y - Math.round(k * 14 + Math.sin(k * Math.PI) * 4); x += Math.round(k * e.dx); ctx.fillStyle = OL; ctx.fillRect(x - 3, ly - 1, 7, 6); ctx.fillStyle = '#f8f4e8'; ctx.fillRect(x - 2, ly, 5, 4); ctx.fillStyle = '#c04040'; ctx.fillRect(x - 1, ly + 1, 1, 1); ctx.fillRect(x + 1, ly + 1, 1, 1); ctx.fillRect(x, ly + 2, 1, 1); }
      ctx.globalAlpha = 1;
    }
  };
  // A pressed facing a tile: the cat purrs and meows (true = handled, so the search says nothing)
  A.poke = function (f, x, y) { const a = f.amb; if (a && a.cat && a.cat.x === x && a.cat.y === y) { if (G.errands && G.errands.catTap(f)) return true; pet(a); if (G.animals) G.animals.tap('gato', x * T + 12, y * T - 8, { silent: true }); return true; } return false; };
  A.wake = f => { const a = f && f.amb; if (a && a.cat) pet(a); }; // the cat wakes up, purrs and meows (errands.js)
  A.sfx = { meow, yip, flutter }; // for animals.js
  A.napping = f => !!(f && f.amb && f.amb.cat && (f.amb.cat.nap || 0) > 480);
  // a happy hop, a heart and a yip (Canelo, when you talk to him), and a little speech bubble if `say` is given
  A.happy = function (n, say) {
    const m = meet(n), a = G.field && G.field.amb; m.hop = 24; yip();
    if (!a || !G.field.npcs.includes(n)) return;
    a.fx.push({ kind: 'heart', o: n, dx: say ? 12 : 0, t: 0, life: 50 });
    if (say) a.fx.push({ kind: 'say', s: say, o: n, dx: -6, t: 0, life: 60 });
  };
})();
