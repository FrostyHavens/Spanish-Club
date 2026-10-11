// ===== The guide: the next thing to do is always in sight while you're free to walk (docs/INTUITIVE_AUDIT.md) =====
// Children don't read the Spanish instructions and don't open menus (docs/PLAYTEST_NOTES.md, 2026-10-11): so there is
// always ONE goal, shown without words:
//   on screen      a bouncing yellow arrow over it (over its bubble, over a door's sign)
//   off screen     an arrow at the screen's edge pointing the way, with a little picture of who or what waits there
//   in a building  the arrow is on the way out; outside, on the right door (with the picture of who is inside)
//   choices        a puzzle's places to choose from (which bush has the red ball, who says "¡miau!") all get a smaller
//                  white arrow, so it shows WHERE to look without giving the answer away
//   idle ~4 s      Canelo trots a few tiles toward the goal, barks and looks back at you
// The goal, most important first: the story's chapter (its beat: a person, a place, an animal, a door, a find-it
// puzzle; the next chapter's giver; a review day's teacher) > home at sunset > a favour going on or offered > Nico's
// hide-and-seek (only the edge arrow: the peeking ears are the game; the arrow over one after a long wait) > Canelo's
// "?", Luna's palabra del día, Inés's pages, a side job, anyone else with a bubble. Nothing to do (the next chapter
// opens tomorrow): no arrow.
// The hint hand (hint.js) taps on the same goal after a few seconds of doing nothing, when it's on screen.
// API: G.guide.goal(f) -> {why, map, pts: [{x, y, lift, npc?, icon?}] (world px; several = a choice), soft, via: 'door'}
//   or null; G.guide.at (what is drawn now, screen px: {x, y, edge, dir, why, marks}: tests and tools/naivebot.js read
//   it); G.guide.handAt(f) (hint.js); G.guide.update(f) / .draw(f, ctx) (field.js).
'use strict';
(function () {
  const GD = G.guide = {}, T = G.TILE;
  GD.IDLE_TROT = 240;   // frames of doing nothing before Canelo trots toward the goal (~4 s)
  GD.IDLE_SOFT = 600;   // ... before a hide-and-seek animal gets the arrow over it (~10 s)
  GD.at = null;
  let idle = 0, trotCool = 0, trotted = null, lastGoal = null, shownT = 0;

  const alerting = n => { try { const a = n.alert && n.alert(); return a && !a.wait ? a : null; } catch (e) { return null; } };
  const here = (f, who) => (who === 'canelo' ? (G.pet && G.pet.npc(f)) : f.npcs.find(n => n.id === who && n.spec && !n.hidden)) || null;
  const mapOfNpc = who => { for (const m in G.maps) if ((G.maps[m].npcs || []).some(n => n.id === who && (!n.cond || n.cond()))) return m; return null; };
  const mapOfAnimal = kind => { for (const m in G.maps) if ((G.maps[m].animals || []).some(a => a.kind === kind)) return m; return 'villa'; };
  // a person as a goal (world px of their middle; lift: how far above it the arrow goes, over the head and the bubble)
  const person = (n, why) => ({ x: n.x * T + (n.ox || 0) + 12, y: n.y * T + (n.oy || 0) + 12, lift: alerting(n) ? 44 : 24, npc: n, why });
  const tileP = (x, y, lift, o) => Object.assign({ x: x * T + 12, y: y * T + 12, lift }, o || {});
  const ctxOf = L => G.chapters.ctx(L.id);
  const whenOk = L => { try { return !L.b.when || !!L.b.when(ctxOf(L)); } catch (e) { return false; } };

  // ---------- the goal, tier by tier: each returns {why, map?, pts?, choice?, soft?, badge?} or null ----------
  function chapterGoal(f) {
    const CH = G.chapters; if (!CH || !G.state) return null;
    // a find-it puzzle going on (the puppy hiding, which way the park is): its picture bubbles are the choices
    const F = G.state.finds || {};
    for (const id in F) {
      const s = F[id]; if (s.found) continue;
      if (s.map !== f.mapId) return { why: 'find ' + id, map: s.map, badge: { icon: id } };
      if (s.pics) return { why: 'find ' + id, map: s.map, choice: true, pts: s.pics.map(([x, y, ic]) => tileP(x, y, 42, { icon: ic })) };
      const [x, y] = s.at.split(',').map(Number);
      return { why: 'find ' + id, map: s.map, pts: [tileP(x, y, 14)] };
    }
    if (CH.needsReview()) { const who = CH.reviewer(), n = here(f, who); return n ? { why: 'review ' + who, pts: [person(n)] } : { why: 'review ' + who, map: mapOfNpc(who), badge: { who } }; }
    const L = CH.live(); if (!L || !L.b) return null;
    const b = L.b, why = L.id + ':' + L.k;
    if (b.evening) return G.day && G.day.over() ? { why: why + ' evening', map: 'casa', home: true, badge: { icon: 'noche' } } : null;
    if (!whenOk(L)) return null;
    if (b.auto) return b.auto === true || b.auto === f.mapId ? null : { why, map: b.auto, badge: { icon: CH.def(L.id).icon } }; // (it starts by itself there)
    const ts = CH.targets(f);
    if (ts.length) {
      const spots = b.spots || (b.spot ? [b.spot] : []);
      const bubble = t => { const m = /^ch:[^:]+:(\d+)$/.exec(t.spot || ''), sp = m && spots[+m[1]]; return !!(sp && !sp.quiet && sp.icon); }; // (a place with a picture bubble: the arrow goes over it)
      const pts = ts.map(t => Object.assign({ x: t.x, y: t.y, lift: t.door ? 28 : t.npc ? 24 : t.cat || t.animal ? 14 : bubble(t) ? 42 : 14 }, t.npc ? { npc: here(f, t.npc) } : {}, t.door ? { door: true } : {}));
      const secret = ts.every(t => t.secret);
      if (secret && pts.length === 1) addDecoys(f, pts); // (who says "¡miau!": the cat AND Canelo get an arrow)
      return { why, pts, choice: secret };
    }
    if (b.who) {
      const n = here(f, b.who);
      if (n) return { why, pts: [person(n)] };
      return { why, map: b.who === 'canelo' ? null : mapOfNpc(b.who), badge: { who: b.who } };
    }
    const sp = b.spots || (b.spot ? [b.spot] : []);
    if (sp.length) return { why, map: sp[0].map, badge: { icon: sp[0].icon && typeof sp[0].icon === 'string' ? sp[0].icon : CH.def(L.id).icon } };
    if (b.door) return { why, map: b.door, badge: { icon: CH.def(L.id).icon } };
    if (b.tap) return { why, map: b.tap === 'cat' ? 'villa' : b.tap === 'canelo' ? null : mapOfAnimal(b.tap), badge: { icon: b.tap === 'cat' ? 'gato' : b.tap } };
    return null;
  }
  // the others to choose from when a puzzle's answer is a single animal (Canelo, the cat, a duck: whoever is here)
  function addDecoys(f, pts) {
    const near = (x, y) => pts.some(p => Math.abs(p.x - x) < 14 && Math.abs(p.y - y) < 14);
    const add = (x, y, o) => { if (!near(x, y)) pts.push(Object.assign({ x, y, lift: 18 }, o)); };
    const dog = G.pet && G.pet.npc(f); if (dog) add(dog.x * T + 12, dog.y * T + 12, { npc: dog });
    const cat = f.amb && f.amb.cat; if (cat && !cat.away && !cat.hid) add(cat.x * T + 12, cat.y * T - 2);
    if (G.animals && G.words.met('pato')) { const d = G.animals.find('pato', f); if (d) add(Math.round(d.x), Math.round(d.y - 6)); }
  }
  function sunsetGoal(f) {
    if (!G.day || !G.day.over() || (f.mapId === 'casa')) return null;
    const d = G.day.homeDoor(f); if (d) return { why: 'home (sunset)', pts: [tileP(d[0], d[1], 48, { door: true, icon: 'noche' })] }; // (over the moon bubble)
    return { why: 'home (sunset)', map: 'casa', badge: { icon: 'noche' } };
  }
  function favourGoal(f) {
    const FV = G.favores; if (!FV || !G.state || !FV.today) return null;
    const L = FV.today(), on = L.find(v => v.on && !v.done);
    if (on) {
      const ts = FV.targets(f); if (ts.length) return { why: 'favour ' + on.kind + ' ' + on.word, pts: ts.map(t => ({ x: t.x, y: t.y, lift: t.animal ? 18 : 22 })) };
      for (const m in G.maps) if (FV.waitsIn(m)) return { why: 'favour go ' + on.word, map: m, badge: { icon: G.maps[m].icon || 'carta' } };
      if (on.kind === 'find') return { why: 'favour find ' + on.word, map: mapOfAnimal(on.word), badge: { icon: on.word } };
      return null;
    }
    for (const v of L) {
      if (v.done || !FV.alert(v.who)) continue;
      const n = here(f, v.who); if (n) return { why: 'favour ' + v.who, pts: [person(n)] };
      const m = mapOfNpc(v.who); if (m) return { why: 'favour ' + v.who, map: m, badge: { who: v.who } };
    }
    return null;
  }
  function seekGoal(f) {
    const SK = G.seek; if (!SK || !G.state) return null;
    if (SK.alert && SK.alert(SK.HOST)) { const n = here(f, SK.HOST); return n ? { why: 'seek: Nico', pts: [person(n)] } : { why: 'seek: Nico', map: mapOfNpc(SK.HOST), badge: { who: SK.HOST } }; }
    if (!SK.active()) return null;
    const p = f.player, L = G.state.seek.list.filter(h => !h.found).map(h => ({ h, sp: SK.SPOTS.find(s => s.id === h.spot) }));
    const mine = L.filter(o => o.sp.map === f.mapId).sort((a, b) => Math.abs(a.sp.at[0] - p.x) + Math.abs(a.sp.at[1] - p.y) - Math.abs(b.sp.at[0] - p.x) - Math.abs(b.sp.at[1] - p.y));
    if (mine.length) return { why: 'seek ' + mine[0].h.kind, soft: true, pts: [tileP(mine[0].sp.at[0], mine[0].sp.at[1], 26, { icon: mine[0].h.kind })] };
    if (L.length) return { why: 'seek ' + L[0].h.kind, soft: true, map: L[0].sp.map, badge: { icon: 'lupa' } };
    return null;
  }
  function reviewGoal(f) {
    const dog = G.pet && G.pet.npc(f);
    if (dog && alerting(dog)) return { why: 'canelo ?', pts: [person(dog)] };
    const FV = G.favores;
    if (FV && FV.palabraReady && FV.palabraReady()) { const n = here(f, 'luna'); return n ? { why: 'palabra', pts: [person(n)] } : { why: 'palabra', map: mapOfNpc('luna'), badge: { who: 'luna' } }; }
    if (FV && FV.pageReady && FV.pageReady()) { const n = here(f, 'ines'); return n ? { why: 'pages', pts: [person(n)] } : { why: 'pages', map: mapOfNpc('ines'), badge: { who: 'ines' } }; }
    const E = G.errands;
    if (E && E.spots) { const sp = E.spots(f).filter(s => !s.quiet && !(s.nohint && s.nohint()))[0]; if (sp) return { why: 'job ' + sp.id, pts: [tileP(sp.at[0], sp.at[1], 42)] }; }
    // anyone else on this map with a bubble (a present they'd like...), the nearest
    const p = f.player, ns = f.npcs.filter(n => n.spec && !n.hidden && alerting(n)).sort((a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - Math.abs(b.x - p.x) - Math.abs(b.y - p.y));
    if (ns.length) return { why: 'bubble ' + ns[0].id, pts: [person(ns[0])] };
    if (E && E.waitsIn) for (const m in G.maps) if (m !== f.mapId && E.waitsIn(m)) return { why: 'job in ' + m, map: m, badge: { icon: G.maps[m].icon || 'pregunta' } };
    return null;
  }
  const TIERS = [chapterGoal, sunsetGoal, favourGoal, seekGoal, reviewGoal];

  // on another map: the door that leads there (from town, its door; from a building, the way out)
  function viaDoor(f, g) {
    const ex = (f.def.exits || []).filter(e => e.to && (!e.cond || e.cond()));
    const e = f.mapId === 'villa' ? ex.find(e => e.to === g.map) : ex.find(e => e.to === 'villa') || ex[0];
    if (!e) return null;
    return Object.assign({}, g, { via: 'door', pts: [tileP(e.x, e.y, f.mapId === 'villa' ? 28 : 16, { door: true })] });
  }
  GD.goal = function (f) {
    if (!G.state || !f) return null;
    for (const tier of TIERS) {
      let g = null;
      try { g = tier(f); } catch (e) { if (!GD.err) { GD.err = true; console.error(e); } }
      if (!g) continue;
      if (g.pts && g.pts.length) return g;
      if (g.map && g.map !== f.mapId) { const d = viaDoor(f, g); if (d) return d; }
    }
    return null;
  };

  // ---------- every frame (field.js, after the map's update) ----------
  const busy = () => G.input.ptr.down || !!G.input.tap() || Object.keys(G.pressed).length > 0 || Object.keys(G.keys).some(k => G.keys[k]);
  const free = f => G.top() === f && !f.locked && G.fade.a === 0;
  GD.update = function (f) {
    if (!f) return;
    if (busy() || f.player.moving || f.route) idle = 0; else idle++;
    if (trotCool > 0) trotCool--;
    const dog = trotted && trotted.n;
    if (dog && (f.player.moving || f.locked) && dog.amb && dog.amb.hold > 0 && !dog.busy) { dog.amb.hold = 0; trotted = null; } // you're off: he follows again
    const g = free(f) ? GD.goal(f) : null;
    lastGoal = g;
    if (!g) { GD.at = null; shownT = 0; return; }
    shownT++;
    GD.at = layout(f, g);
    if (idle >= GD.IDLE_TROT && !trotCool && !g.soft && !g.choice) trot(f, g);
  };
  // where the arrow (or arrows) go on screen now
  function layout(f, g) {
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    const scr = p => { // (near the top of the screen: under it, pointing up)
      const tx = Math.round(p.x - cx), ty = Math.round(p.y - cy), y = ty - (p.lift || 20);
      return y < 16 ? { x: tx, y: ty + 14, tx, ty, up: true } : { x: tx, y, tx, ty };
    };
    const on = s => s.tx >= 6 && s.tx <= G.W - 6 && s.ty >= 14 && s.ty <= G.H - 4;
    if (g.choice) {
      const marks = g.pts.map(scr).filter(on);
      if (marks.length) return { why: g.why, choice: true, marks, x: marks[0].x, y: marks[0].y, tx: marks[0].tx, ty: marks[0].ty };
    }
    // the nearest point (one goal), on screen: over it; off screen: at the edge
    const p0 = f.player, pts = g.pts.slice().sort((a, b) => Math.hypot(a.x - p0.x * T, a.y - p0.y * T) - Math.hypot(b.x - p0.x * T, b.y - p0.y * T)), p = pts[0], s = scr(p);
    const badge = g.badge || badgeOf(p);
    if (on(s)) {
      if (g.soft && idle < GD.IDLE_SOFT) return { why: g.why, soft: true, hidden: true, x: s.x, y: s.y, tx: s.tx, ty: s.ty };
      return { why: g.why, x: s.x, y: s.y, tx: s.tx, ty: s.ty, up: !!s.up, door: !!p.door, badge: g.via === 'door' ? badge : null, choice: !!g.choice };
    }
    const x0 = 16, x1 = G.W - 16, y0 = 40, y1 = G.H - 16;
    const px = G.clamp(p0.x * T + 12 - cx, x0, x1), py = G.clamp(p0.y * T + 12 - cy, y0, y1), dx = s.tx - px, dy = s.ty - py;
    const kx = dx > 0 ? (x1 - px) / dx : dx < 0 ? (x0 - px) / dx : Infinity, ky = dy > 0 ? (y1 - py) / dy : dy < 0 ? (y0 - py) / dy : Infinity, k = Math.min(kx, ky, 1);
    const ex = Math.round(px + dx * k), ey = Math.round(py + dy * k);
    return { why: g.why, edge: true, x: ex, y: ey, tx: ex, ty: ey, ang: Math.atan2(dy, dx), dir: kx < ky ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), badge };
  }
  const badgeOf = p => (p.npc ? { npc: p.npc } : p.icon ? { icon: p.icon } : null);
  // the hint hand's spot (hint.js): the goal's own tile on screen, one goal only (never a choice: it'd give the answer)
  GD.handAt = function (f) {
    const a = GD.at; if (!a || a.edge || a.choice || a.soft || !free(f)) return null;
    return { x: a.tx, y: a.ty };
  };

  // ---------- Canelo trots toward the goal when you stand about ----------
  function trot(f, g) {
    const n = G.pet && G.pet.mine() && G.pet.npc(f); if (!n || n.busy || n.moving || !n.amb || !n.amb.follow || n.pa) return;
    const p = g.pts[0], gx = Math.floor(p.x / T), gy = Math.floor(p.y / T), pl = f.player;
    if (Math.abs(gx - pl.x) + Math.abs(gy - pl.y) <= 2 || (p.npc === n)) return;
    const path = G.chapters.K.path(f, n, gx, gy), D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
    let s = '', x = n.x, y = n.y;
    for (const c of path) {
      const nx = x + D[c][0], ny = y + D[c][1];
      if (f.exitAt(nx, ny) || (nx === gx && ny === gy) || f.npcs.some(o => o !== n && !o.ghost && !o.hidden && o.x === nx && o.y === ny)) break;
      s += c; x = nx; y = ny; if (s.length >= 4) break;
    }
    while (s.length && x === pl.x && y === pl.y) { const c = s[s.length - 1]; x -= D[c][0]; y -= D[c][1]; s = s.slice(0, -1); } // (not to stop on you: he's a ghost on the way)
    trotCool = 600; // (once in a while: not on every pause)
    if (s.length < 2) return;
    trotted = { n, f0: G.frame };
    n.busy = true; n.ghost = true;
    f.tasks.add((function* () {
      yield* f.walkNpc(n, s, 3);
      n.busy = false; n.home = [n.x, n.y];
      const dx = gx - n.x, dy = gy - n.y; n.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (G.pet.sound) G.pet.sound('bark');
      if (G.pet.puff) G.pet.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
      if (n.amb) n.amb.hold = 150; // (he waits there for you a moment, looking the way)
    })());
  }
  GD.trotting = () => !!trotted && G.frame - trotted.f0 < 400;
  GD.trotAt = () => (trotted ? trotted.f0 : -1); // (tests)
  GD.idle = () => idle;

  // ---------- drawing (field.js, over the map, under the menu button) ----------
  // a fat yellow arrow pointing down, its tip at x, y (small: a choice)
  function down(ctx, x, y, small, col, up) {
    if (up) { ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); down(ctx, 0, 0, small, col); ctx.restore(); return; }
    const w = small ? 5 : 7, h = small ? 5 : 7, sw = small ? 2 : 3, sh = small ? 4 : 7;
    ctx.fillStyle = '#10102a';
    for (let i = 0; i <= h; i++) ctx.fillRect(x - w + i - 1, y - h + i - 1, 2 * (w - i) + 3, 1);
    ctx.fillRect(x - sw + 0 - 1, y - h - sh - 1, 2 * sw + 1 + 2, sh + 1);
    ctx.fillStyle = col;
    for (let i = 0; i < h; i++) ctx.fillRect(x - w + i, y - h + i, 2 * (w - i) + 1, 1);
    ctx.fillRect(x - sw + 1, y - h - sh, 2 * sw - 1, sh);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - sw + 1, y - h - sh, 1, sh - 1); // (a glint)
  }
  function drawBadge(ctx, b, x, y) { // a little round window with who or what waits there
    G.win(ctx, x - 11, y - 11, 22, 22, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 });
    if (b.npc || b.who) {
      const spec = b.npc ? b.npc.spec : G.data.npcs[b.who] && G.data.npcs[b.who].map;
      if (spec) { const img = G.unitSprite(spec, 'down', 0); ctx.save(); ctx.beginPath(); ctx.rect(x - 9, y - 9, 18, 18); ctx.clip(); ctx.drawImage(img, x - 12, y - 9); ctx.restore(); }
    } else if (b.icon) G.drawIcon16(ctx, G.data.words[b.icon] || b.icon, x - 8, y - 8);
  }
  GD.draw = function (f, ctx) {
    const a = GD.at; if (!a || !free(f) || a.hidden) return;
    const fade = Math.min(1, shownT / 20); if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade;
    if (a.marks) { // a choice: a small white arrow over each, bobbing in turn
      a.marks.forEach((m, i) => { const b = Math.round(Math.abs(Math.sin(G.frame / 9 + i * 1.3)) * 4); down(ctx, m.x, m.up ? m.y + b : m.y - b, true, '#f8f8ff', m.up); });
    } else if (!a.edge) {
      const bob = Math.round(Math.abs(Math.sin(G.frame / 8)) * 5);
      down(ctx, a.x, a.up ? a.y + bob : a.y - bob, false, '#f8e060', a.up);
      if (a.badge) drawBadge(ctx, a.badge, a.x + (a.x > G.W - 40 ? -24 : 24), a.up ? a.y + 12 + bob : a.y - 12 - bob);
    } else edgeArrow(ctx, a);
    ctx.restore();
  };
  function edgeArrow(ctx, a) {
    const pulse = 1 + 0.12 * Math.sin(G.frame / 7) + (idle > 300 ? 0.15 : 0), L = 14 * pulse, W2 = 9 * pulse;
    const ux = Math.cos(a.ang), uy = Math.sin(a.ang), vx = -uy, vy = ux, push = Math.round(Math.sin(G.frame / 6) * 2);
    const tx = a.x + ux * (2 + push), ty = a.y + uy * (2 + push);
    const tri = (o, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tx + ux * o, ty + uy * o); ctx.lineTo(tx - ux * (L + o) + vx * (W2 + o), ty - uy * (L + o) + vy * (W2 + o)); ctx.lineTo(tx - ux * (L + o) - vx * (W2 + o), ty - uy * (L + o) - vy * (W2 + o)); ctx.closePath(); ctx.fill(); };
    tri(2, '#10102a'); tri(0, '#f8e060');
    if (a.badge) drawBadge(ctx, a.badge, Math.round(a.x - ux * (L + 17)), Math.round(a.y - uy * (L + 17)));
  }
})();
