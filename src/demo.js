// ===== Ghost-hand demos: the first time an action is there to do, a see-through hand shows it once =====
// Spanish instructions aren't followed by a child who can't read them yet (docs/PLAYTEST_NOTES.md, 2026-10-11): so the
// first time each of these comes up, a translucent hand does it once, slowly, without words, and never again (saved in
// G.state.flags.demo). It only draws and never takes a tap: the child's own tap stops it at once (they've got it), and a
// demo never shows an answer.
//   answer   a question's picture cards: the hand glides over the cards and taps one at random (not the answer)
//   mic      a mic button that can listen: the hand taps it, then a mouth talks beside it, sound waves coming out
//   canelo   Canelo on screen, your dog: the hand taps him (that's how to call him and play with him)
//   pickup   a thing to pick up on screen: the hand taps it
//   give     holding something he plays with or eats, Canelo on screen: the hand carries it from you to him
//   putdown  holding something (and its give demo already seen, or nobody for it): the hand taps you (put it down)
//   puzzle   a page puzzle: the hand drags a word up to the pictures (and lets go between them: no answer)
//   seek     hide-and-seek going on, an animal peeking on screen: the hand taps the peeking ears
//   bus      a bus stop on screen once you've been to two places: the hand taps the stop (zones.js)
//   worldmap the world map open: the hand taps a place you've been to (the bus goes there), or a "?" one (walk there)
//   dogspot  the dog's paw-print bubble on screen (his thing to do in this zone): the hand taps it
//   (zones)  a zone's own new action (G.zones.demos: {kind, find(f) -> tile}): the beach's 'fillpail' (the empty pail
//            in your hands: the hand taps the water's edge)
// The map's demos wait for a moment of standing about (DM.IDLE, so they don't get in the way of a child who is busy).
// API: G.demo.shown(kind), .KINDS, .cur (the demo playing: {kind, steps, ...} or null; tests), .skip() (tests: mark all
// shown), .reset(), .step() / .draw(ctx) (core.js, after the hint hand).
'use strict';
(function () {
  const DM = G.demo = {}, T = G.TILE;
  DM.KINDS = ['answer', 'mic', 'canelo', 'pickup', 'give', 'putdown', 'puzzle', 'seek', 'bus', 'worldmap', 'dogspot'];
  DM.IDLE = 90;    // frames standing about on the map before a map demo (1.5 s)
  DM.cur = null;
  let idle = 0, scan = 0;
  const book = () => { const f = G.state.flags; if (!f.demo || typeof f.demo !== 'object') f.demo = {}; return f.demo; };
  DM.shown = k => !!(G.state && G.state.flags && G.state.flags.demo && G.state.flags.demo[k]);
  const kinds = () => DM.KINDS.concat(G.zones && G.zones.demos ? G.zones.demos.map(d => d.kind) : []); // (and the zones' own: zones.js Z.demos)
  DM.skip = () => { if (G.state) kinds().forEach(k => { book()[k] = 1; }); DM.cur = null; };
  DM.reset = () => { if (G.state) G.state.flags.demo = {}; DM.cur = null; };
  const busy = () => G.input.ptr.down || !!G.input.tap() || Object.keys(G.pressed).length > 0 || Object.keys(G.keys).some(k => G.keys[k]);
  const name = s => (s && s.constructor ? s.constructor.name : '');
  const onScreen = (x, y, m = 10) => x >= m && x <= G.W - m && y >= 24 && y <= G.H - m;

  // ---------- a demo: steps the hand goes through ----------
  // step: {x, y, move (frames to get there), act: 'tap' | 'down' | 'up' | 'talk' | null, hold (frames after)}
  function start(kind, steps, o = {}) {
    book()[kind] = G.frame || 1; if (G.st) G.st.autosave();
    const s0 = steps[0];
    DM.cur = Object.assign({ kind, steps, i: 0, t: 0, x: s0.x + 30, y: s0.y + 40, fx: s0.x + 30, fy: s0.y + 40, down: false, push: 0, talk: 0, a: 0, top: G.top(), end: 0 }, o);
  }
  function advance(c) {
    const st = c.steps[c.i]; if (!st) { c.end++; return; }
    c.t++;
    const mv = st.move || 16;
    if (c.t <= mv) { const u = c.t / mv, e = u * u * (3 - 2 * u); c.x = c.fx + (st.x - c.fx) * e; c.y = c.fy + (st.y - c.fy) * e; if (c.t === mv && st.act === 'tap') G.fx.ring(st.x, st.y, 9, '#ffffff', 15); return; }
    const k = c.t - mv;
    if (st.act === 'tap') c.push = k < 6 ? k / 6 : Math.max(0, 1 - (k - 6) / 8);
    else if (st.act === 'down') c.down = true, c.push = Math.min(1, k / 6);
    else if (st.act === 'up') { c.down = false; c.push = Math.max(0, 1 - k / 6); }
    else if (st.act === 'talk') c.talk = k;
    if (k >= (st.hold != null ? st.hold : 14)) { c.i++; c.t = 0; c.fx = c.x; c.fy = c.y; c.talk = 0; if (!c.down) c.push = 0; }
  }

  // ---------- when each one comes up ----------
  function onQuestion(s) {
    const n = name(s);
    if (n === 'Choice' && s.cards && s.o.answer != null && !s.won && s.t >= 14 && !DM.shown('answer')) {
      const R = s.rects(), k = Math.floor(Math.random() * R.length), steps = R.map(r => ({ x: r.x + r.w / 2, y: r.y + r.h * 0.55, move: 14, hold: 4 }));
      steps.push({ x: R[k].x + R[k].w / 2, y: R[k].y + R[k].h * 0.55, move: 12, act: 'tap', hold: 16 });
      start('answer', steps); return true;
    }
    if (n === 'PagePuzzle' && s.t >= 14 && !s.done && !Object.keys(s.match).length && !DM.shown('puzzle')) {
      const w = s.wordRect(0), p0 = s.picRect(0), p1 = s.picRect(1), mx = (p0.x + p0.w + p1.x) / 2;
      start('puzzle', [{ x: w.x + w.w / 2, y: w.y + w.h / 2, move: 18, act: 'down', hold: 8 }, { x: mx, y: p0.y + p0.h / 2 + 10, move: 34, hold: 6 }, { x: mx, y: p0.y + p0.h / 2 + 10, move: 1, act: 'up', hold: 16 }], { drag: s.words[0] });
      return true;
    }
    if (n === 'WorldMap' && s.t >= 20 && !s.walk && !DM.shown('worldmap')) {
      const here = s.here(), R = s.rects(), r = R.find(r => r.id !== here && G.zones.visited(r.id)) || R.find(r => r.id !== here && !G.zones.visited(r.id));
      if (r) { start('worldmap', [{ x: r.x + r.w / 2, y: r.y + r.h / 2 - 4, move: 28, act: 'tap', hold: 24 }]); return true; }
    }
    const m = s && s.mic;
    if (m && !DM.shown('mic') && m.shown && m.shown() && m.can && m.can() && !(s.won) && (s.t == null || s.t > 20) && !(DM.cur)) {
      const r = m.o.rect(); start('mic', [{ x: r.x + r.w / 2, y: r.y + r.h / 2 + 2, move: 18, act: 'tap', hold: 4 }, { x: r.x + r.w / 2, y: r.y + r.h / 2 + 2, move: 1, act: 'talk', hold: 70 }], { mic: r });
      return true;
    }
    return false;
  }
  function onMap(f) {
    if (f.locked || f.player.moving || f.route || G.top() !== f || !G.state.flags.intro) return false;
    const sb = G.world && G.world.sayBack;
    if (sb && sb.f === f && !DM.shown('mic') && sb.mic.can()) { // the word bubble's mic (say it back)
      const r = G.world.micRect(f, sb.b); start('mic', [{ x: r.x + r.w / 2, y: r.y + r.h / 2 + 2, move: 18, act: 'tap', hold: 4 }, { x: r.x + r.w / 2, y: r.y + r.h / 2 + 2, move: 1, act: 'talk', hold: 70 }], { mic: r }); return true;
    }
    if (idle < DM.IDLE || (++scan % 10)) return false;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), scr = (x, y) => [x * T + 12 - cx, y * T + 12 - cy];
    const p = f.player, [px, py] = [p.x * T + 12 - cx, p.y * T + 6 - cy];
    const C = G.carry, h = C && C.held(), dog = G.pet && G.pet.mine() && G.pet.npc(f), [dx, dy] = dog ? scr(dog.x, dog.y) : [0, 0];
    const dogHere = dog && onScreen(dx, dy) && !(G.pet.sleeping && G.pet.sleeping(f));
    if (G.seek && G.seek.active() && !DM.shown('seek')) {
      const L = G.seek.list().filter(x => !x.found);
      for (const x of L) { const r = G.seek.where(x, f); if (r && onScreen(r.x + r.w / 2, r.y + 8)) { start('seek', [{ x: r.x + r.w / 2, y: r.y + 10, move: 24, act: 'tap', hold: 20 }]); return true; } }
    }
    const Zn = G.zones;
    if (Zn && !DM.shown('dogspot') && dogHere && !h) {
      const sp = (f.def.dogSpots || []).find(sp => Zn.dogReady(sp)); if (sp) { const [sx, sy] = scr(sp.at[0], sp.at[1]); if (onScreen(sx, sy - 16, 14)) { start('dogspot', [{ x: sx, y: sy - 14, move: 24, act: 'tap', hold: 22 }]); return true; } }
    }
    if (Zn && !DM.shown('bus') && Zn.visitedIds().length >= 2) {
      const z = Zn.def(Zn.of(f.mapId)); if (z && z.bus && z.bus.map === f.mapId) { const [sx, sy] = scr(z.bus.at[0], z.bus.at[1]); if (onScreen(sx, sy - 8, 14)) { start('bus', [{ x: sx, y: sy - 10, move: 24, act: 'tap', hold: 22 }]); return true; } }
    }
    for (const d of (Zn && Zn.demos) || []) { // a zone's own new action (zones.js Z.demos): the hand taps its tile
      if (DM.shown(d.kind)) continue; let at = null; try { at = d.find(f); } catch (e) { at = null; }
      if (at) { const [sx, sy] = scr(at[0], at[1]); if (onScreen(sx, sy, 14)) { start(d.kind, [{ x: sx, y: sy - 4, move: 24, act: 'tap', hold: 22 }]); return true; } }
    }
    if (h && C.DOG[h.id] && dogHere && !DM.shown('give')) {
      start('give', [{ x: px, y: py - 10, move: 16, act: 'down', hold: 8 }, { x: dx, y: dy - 2, move: 40, hold: 4 }, { x: dx, y: dy - 2, move: 1, act: 'up', hold: 4 }, { x: dx, y: dy - 2, move: 1, act: 'tap', hold: 16 }], { carry: h.it });
      return true;
    }
    if (h && !DM.shown('putdown') && (DM.shown('give') || !C.DOG[h.id] || !dogHere) && idle >= DM.IDLE * 2) { start('putdown', [{ x: px, y: py + 4, move: 20, act: 'tap', hold: 24 }]); return true; }
    if (!h && C && !DM.shown('pickup')) {
      const x0 = Math.floor(cx / T), y0 = Math.floor(cy / T);
      let best = null;
      for (let y = y0; y <= y0 + Math.ceil(G.H / T); y++) for (let x = x0; x <= x0 + Math.ceil(G.W / T); x++) {
        if (!C.at(f, x, y)) continue; const [sx, sy] = scr(x, y); if (!onScreen(sx, sy, 14)) continue;
        const d = Math.abs(x - p.x) + Math.abs(y - p.y); if (!best || d < best.d) best = { d, sx, sy };
      }
      if (best) { start('pickup', [{ x: best.sx, y: best.sy, move: 24, act: 'tap', hold: 22 }]); return true; }
    }
    if (dogHere && !h && !DM.shown('canelo')) { start('canelo', [{ x: dx, y: dy, move: 24, act: 'tap', hold: 22 }]); return true; }
    return false;
  }

  // ---------- every frame (core.js: pre before the scene's update, step after the hint hand; it never takes input) ----------
  let tapped = false;
  DM.pre = () => { if (G.input.tap() || G.input.ptr.down) tapped = true; };
  DM.step = function () {
    if (!G.state || !G.state.flags || G.fade.a > 0) { DM.cur = null; return; }
    const s = G.top(), f = G.field;
    const b = busy() || tapped; tapped = false;
    if (b) { idle = 0; if (DM.cur && DM.cur.t + DM.cur.i > 2) DM.cur = null; } // the child's own tap: they've got it
    else if (f && s === f && !f.locked && !f.player.moving) idle++; else idle = 0;
    const c = DM.cur;
    if (c) {
      if (G.top() !== c.top) { DM.cur = null; return; }
      c.a = Math.min(1, c.a + 0.1);
      advance(c);
      if (c.end) { c.a -= 0.2; if (c.end > 6) DM.cur = null; }
      return;
    }
    try { if (s && s !== f) onQuestion(s); else if (f && s === f) onMap(f); } catch (e) { if (!DM.err) { DM.err = true; console.error(e); } }
  };

  // a mouth talking (the mic demo): lips opening and closing, sound waves coming out
  function mouth(ctx, x, y, t) {
    const open = 1 + Math.abs(Math.sin(t / 5)) * 4;
    ctx.fillStyle = '#e04860'; ctx.beginPath(); ctx.ellipse(x, y, 8, open + 2.5, 0, 0, Math.PI * 2); ctx.fill();   // lips
    ctx.fillStyle = '#5a1020'; ctx.beginPath(); ctx.ellipse(x, y, 6, open, 0, 0, Math.PI * 2); ctx.fill();         // inside
    if (open > 2) { ctx.fillStyle = '#ff8098'; ctx.beginPath(); ctx.ellipse(x, y + open * 0.5, 3.5, open * 0.45, 0, 0, Math.PI * 2); ctx.fill(); } // tongue
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - 3), Math.round(y - open), 6, 1);                        // teeth
    if (G.mic) G.mic.waves(ctx, x, y, 11, '#70e0ff', 2, t);
  }
  DM.draw = function (ctx) {
    const c = DM.cur; if (!c || !G.hint || !G.hint.hand) return;
    ctx.save(); ctx.globalAlpha = 0.62 * Math.max(0, Math.min(1, c.a));
    if (c.carry && c.down && G.carry) G.drawIcon16(ctx, G.carry.pic(c.carry), Math.round(c.x - 8), Math.round(c.y - 22)); // carried along
    if (c.drag != null && c.down) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(c.x - 30), Math.round(c.y - 12), 60, 24); G.textC(ctx, G.baseForm(c.drag), c.x, c.y - 4, '#2860a8', null); }
    G.hint.hand(ctx, { x: c.x, y: c.y, dir: 'up' }, c.push);
    if (c.talk) { const mx = c.mic ? c.mic.x + c.mic.w / 2 : c.x, my = (c.mic ? c.mic.y : c.y) - 16; ctx.globalAlpha = Math.min(1, c.a); ctx.save(); ctx.translate(mx, my); ctx.scale(1.3, 1.3); mouth(ctx, 0, 0, c.talk); ctx.restore(); } // a mouth talking, over the mic
    ctx.restore();
  };
})();
