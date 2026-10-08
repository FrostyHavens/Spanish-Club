// ===== Tap hints: a hand shows where to tap next when a child is stuck; the keys for keyboard players =====
// When nothing has been pressed or touched for a while, a gloved hand taps gently at the next thing to do:
//   on the map (~6 s): the nearest person with a bubble (Mamá first, at home), the moon over the home door at
//     sunset (day.js), else the door that leads to someone with a bubble (out of the house, into the school...).
//     Someone off screen gets the hand at the screen's edge, pointing the way, with a little "!" bubble;
//   on a line of dialogue that's waiting (~4 s): the box ("tap to go on"), or the Z key for keyboard players;
//     the same below a card that a tap closes (a new word, a badge, a new errand, the diploma);
//   in the notebook (~6 s): its close button; a scene with hintXY() (the "Hoy" card): that spot.
// Never on a question: the hand would give the answer away.
// Any key or touch hides it at once. It only draws (core.js calls step and draw), so it never takes input.
// Keyboard players (no touch screen, or a key pressed last) also get a one-time strip of the keys once Mamá's
// intro is done: Z talk, X menu (the notebook), C hear again; each key lights up while it's held.
'use strict';
(function () {
  const H = G.hint = {};
  H.IDLE_MAP = 360;  // frames of doing nothing on the map before the hand shows (~6 s)
  H.IDLE_TALK = 240; // ... on a line that waits for a tap (~4 s)
  H.STRIP = 720;     // frames the keyboard strip stays up on the map (~12 s)
  H.at = null;       // where the hand points now: {x, y, dir, talk} in game px, or null (tests read it)
  let idle = 0, shownT = 0, last = null, strip = 0, kb = !G.touch;
  // a key pressed last = a keyboard player; a finger or the mouse last = a tapper
  window.addEventListener('keydown', () => { kb = true; }, true);
  window.addEventListener('pointerdown', () => { kb = false; }, true);
  H.keyboard = () => kb;

  // ---------- what to point at ----------
  const alerting = n => { try { return !!(n.alert && n.alert()); } catch (e) { return false; } };
  const waitsInside = id => { const m = G.maps[id]; return !!m && ((m.npcs || []).some(n => (!n.cond || n.cond()) && alerting(n)) || !!(G.errands && G.errands.waitsIn(id))); };
  function mapTarget(f) {
    const p = f.player; if (f.locked || p.moving || f.route) return null;
    const T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    let best = null;
    const take = (x, y, ox, oy) => { const d = Math.abs(x - p.x) + Math.abs(y - p.y); if (!best || d < best.d) best = { d, x: x * T + ox + T / 2 - cx, y: y * T + oy + T / 2 - cy }; };
    for (const n of f.npcs) if (n.spec && !n.hidden && alerting(n)) take(n.x, n.y, n.ox || 0, n.oy || 0);
    if (G.errands) for (const g of G.errands.targets(f)) take(Math.floor(g.x / T), Math.floor(g.y / T), g.x % T - T / 2, g.y % T - T / 2); // errand places, animals to find
    const home = G.day && G.day.homeDoor && G.day.homeDoor(f); if (home) take(home[0], home[1], 0, 0);
    if (!best) for (const ex of f.def.exits || []) if (ex.to && (!ex.cond || ex.cond()) && waitsInside(ex.to)) take(ex.x, ex.y, 0, 0);
    if (!best || (best.x >= 10 && best.x <= G.W - 10 && best.y >= 10 && best.y <= G.H - 10)) return best && place(best.x, best.y);
    // off screen: at the screen's edge, on the line from the player towards it, pointing that way
    const x0 = 14, x1 = G.W - 14, y0 = 38, y1 = G.H - 14; // (clear of the menu button)
    const px = G.clamp(p.x * T + T / 2 - cx, x0, x1), py = G.clamp(p.y * T + T / 2 - cy, y0, y1), dx = best.x - px, dy = best.y - py;
    const tx = dx > 0 ? (x1 - px) / dx : dx < 0 ? (x0 - px) / dx : Infinity, ty = dy > 0 ? (y1 - py) / dy : dy < 0 ? (y0 - py) / dy : Infinity, k = Math.min(tx, ty);
    return { x: Math.round(px + dx * k), y: Math.round(py + dy * k), dir: tx < ty ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), edge: true };
  }
  // the hand sits below its target pointing up, or above it pointing down near the bottom of the screen
  const place = (x, y, talk) => ({ x, y, dir: y + 24 > G.H ? 'down' : 'up', talk });
  function target(s) {
    if (!s || G.fade.a > 0) return null;
    if (s === G.field) return mapTarget(s);
    if (s.hintXY) { const p = s.hintXY(); return p && place(p[0], p[1], true); }
    const name = s.constructor && s.constructor.name;
    if (name === 'TextBox' && !(s.opts && s.opts.auto) && s.lines && s.shown >= s.chars(0, s.scroll + 3)) return place(s.boxX + s.boxW - 11, s.boxY() + 51, true);
    if (name === 'Notebook' && s.closeXY) { const [x, y] = s.closeXY(); return place(x + 10, y + 12); }
    if (TAP_ON[name]) return place(G.W / 2, G.H - 32, true); // a tap anywhere goes on: below the card
    return null;
  }
  const TAP_ON = { WordCard: 1, BadgeCard: 1, QuestCard: 1, Diploma: 1, FriendCard: 1 };
  const busy = () => G.input.ptr.down || !!G.input.tap() || Object.keys(G.pressed).length > 0 || Object.keys(G.keys).some(k => G.keys[k]);

  // ---------- every frame (core.js step, before input is cleared) ----------
  H.step = function () {
    const s = G.top();
    if (s !== last || busy()) { last = s; idle = 0; }
    let t = null;
    try { t = target(s); } catch (e) { if (!H.err) { H.err = true; console.error(e); } } // (never stop the game loop)
    if (!t) { idle = 0; H.at = null; shownT = 0; }
    else { idle++; H.at = idle >= (t.talk ? H.IDLE_TALK : H.IDLE_MAP) ? t : null; shownT = H.at ? shownT + 1 : 0; }
    if (strip >= 0 && stripUp() && ++strip > H.STRIP + 30) strip = -1; // the keyboard strip runs while it shows
  };
  // the keyboard strip: once, after Mamá's intro, while walking around (not over a map's name banner)
  H.stripShowing = () => strip > 0 && stripUp();
  H.stripDone = () => strip < 0;
  const stripUp = () => { const f = G.field; return kb && !!f && G.top() === f && !f.locked && !(f.banner && f.banner.t > 0) && !!G.state && !!G.state.flags.intro && G.fade.a === 0; };

  // ---------- drawing (core.js draw, above every scene) ----------
  const HAND = [
    '....oo......',
    '...owwo.....',
    '...owwo.....',
    '...owwooo...',
    '...owwowwoo.',
    '...owwowwowo',
    '.ooowwwwwowo',
    'owwowwwwwwwo',
    'owwwwwwwwwwo',
    '.owwwwwwwwso',
    '..owwwwwwwso',
    '..owwwwwwsso',
    '...owwwwsso.',
    '...occcccco.',
    '...oCCCCCCo.',
    '...oooooooo.',
  ];
  const HAND_PAL = { o: '#201828', w: '#ffffff', s: '#c8c8e0', c: '#78b8f8', C: '#3870c0' };
  const ANG = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
  // a keyboard key: top-left x, y; down = pressed in, lit = glowing
  H.keyCap = function (ctx, k, x, y, down, lit) {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#101028'; ctx.fillRect(x + 1, y + 2, 13, 14);
    const d = down ? 1 : 0;
    G.win(ctx, x, y + d, 15, 15, { fill1: lit ? '#fff8c0' : '#f4f4fc', fill2: lit ? '#f0c040' : '#b8b8cc', alpha: 1 });
    G.textC(ctx, k, x + 8, y + 4 + d, '#202040', null);
  };
  function hand(ctx, a, push) {
    const spr = G.sprite('hint_hand', HAND, HAND_PAL), gap = 2 + Math.round((1 - push) * 5), al = ctx.globalAlpha;
    ctx.save(); ctx.translate(Math.round(a.x), Math.round(a.y)); ctx.rotate(ANG[a.dir] || 0);
    ctx.globalAlpha = al * 0.45; ctx.drawImage(G.tinted(spr, '#000010', 'hint_hand'), -4, gap + 1); // a soft shadow, for light pages
    ctx.globalAlpha = al; ctx.drawImage(spr, -5, gap);
    ctx.restore();
    if (a.edge) { // someone is waiting that way: a little "!" bubble beside the hand
      const [bx, by] = { up: [7, 4], down: [7, -17], left: [4, 7], right: [-15, 7] }[a.dir];
      G.win(ctx, a.x + bx, a.y + by, 11, 13, { fill1: '#f8f0c0', fill2: '#f8d860', alpha: 1 });
      G.text(ctx, '!', a.x + bx + 4, a.y + by + 3, '#c02020', null);
    }
  }
  H.draw = function (ctx) {
    if (strip > 0) drawStrip(ctx);
    const a = H.at; if (!a || G.fade.a > 0) return;
    const ph = G.frame % 50, push = ph < 12 ? ph / 12 : ph < 22 ? 1 : Math.max(0, 1 - (ph - 22) / 20);
    ctx.save(); ctx.globalAlpha = Math.min(1, shownT / 12);
    if (ph >= 12 && ph < 34) { // the tap ring
      const r = 3 + (ph - 12) * 0.7; ctx.lineWidth = 1;
      ctx.globalAlpha *= 1 - (ph - 12) / 22;
      ctx.strokeStyle = '#201828'; ctx.beginPath(); ctx.arc(a.x, a.y, r + 1, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#fff8a0'; ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = Math.min(1, shownT / 12);
    }
    if (a.talk && kb) { // keyboard players: the key that goes on
      const k = G.prefs && G.prefs.dpad ? 'A' : 'Z';
      H.keyCap(ctx, k, a.x - 7, a.dir === 'down' ? a.y - 22 : a.y + 4, push >= 1, true);
    } else hand(ctx, a, push);
    ctx.restore();
  };
  function drawStrip(ctx) {
    const al = Math.min(1, strip / 15, (H.STRIP + 30 - strip) / 30); if (al <= 0) return;
    if (!stripUp()) return;
    const x = 6, y = 6, w = 146, h = 28;
    ctx.save(); ctx.globalAlpha = al;
    G.win(ctx, x, y, w, h);
    [['Z', 'A', 'talk'], ['X', 'B', 'book'], ['C', 'C', 'speaker']].forEach(([k, b, ic], i) => {
      const gx = x + 6 + i * 47, on = G.input.h(b);
      H.keyCap(ctx, k, gx, y + 6, on, on);
      if (ic === 'speaker') G.iconBtn(ctx, 'speaker', gx + 19, y + 4); else G.drawIcon(ctx, ic, gx + 18, y + 4, on);
    });
    ctx.restore();
  }
})();
