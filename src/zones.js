// ===== The open world: zones, paths between them, bus stops, the world map, the dog's spots (docs/WORLD_PLAN.md) =====
// A 7-year-old who loves variety and choice explores on her own (docs/PLAYTEST_NOTES.md, 2026-10-17): Villa Sol is in
// the middle, and five places lie around it: La playa, El bosque, El parque de juegos, La casa de los abuelos and La
// montaña. Nothing is locked and there are no bosses: every zone can be walked to from the start (a short PATH map
// from an edge of Villa Sol, with things to meet on the way) and, once you've been there, reached by BUS from any bus
// stop (or from the map in the kid menu: the bus comes to you). A picture world map shows the zones as big icons:
// the ones you've been to in colour (tap: the bus takes you), the others as dark "?" silhouettes (tap: footprints run
// along the path and the guide's arrow suggests the way on foot).
//
// A zone is registered by its content file (content/es/zone-<id>.js) with G.zones.add({...}):
//   id, name ('La playa'), en, icon (a picture in src/icons.js), music, pos: [x, y] on the world map (game px),
//   maps: ['playa', ...] (its maps; every map def also gets zone: id), path: 'camino_playa' (the walk from Villa Sol),
//   bus: { map, at: [x, y] } (the bus stop: a post with the bus picture; it blocks like a post),
//   entry: { map, x, y, dir } (where the bus leaves you, next to the stop),
//   animals: ['cangrejo', ...] (its album page, in order: the Pokédex numbers follow G.zones order then this order),
//   habitat: { cangrejo: 'arena' } (an icon: where it lives, shown on its silhouette in the album: a hint),
//   rare: { estrella: 'noche' } (shown as "rare" in the album: an icon of when / where: 'manana', 'noche', a place)
// A map can carry (in its G.maps definition, read here):
//   zone: id (zone maps) or path: id (the path map leading to that zone),
//   posts: [{ at: [x, y], zone: 'playa', dir: 'left' }] (a signpost with the zone's picture and an arrow; tap: its name),
//   dogSpots: [{ id, at: [x, y], act: 'dig' | 'splash' | 'sniff' | 'roll' | 'chase' | 'trail' | 'swim' | 'course', gives: 'hueso' | 'palo' | ..., col, every: 'day' | s,
//              kind (chase: the animal he runs at, e.g. 'gaviota': it flies off), path (trail: tiles; course: [x, y, jump]
//              tiles: he runs along and leaps where jump is set; the zone draws its hurdles), to (swim: the far bank) }]
//     (the dog's thing to do there: a paw-print bubble; tap it: he runs over and digs, splashes, sniffs or rolls, and
//      sometimes leaves something to pick up (carry.js). Every zone has one: the dog always has something to do)
//   indoor: true (no bus driving in: a ride from the menu just fades)
// Map edges: G.zones.edge(x, y, to, tx, ty, dir) is an exit on a path tile at the map's edge (no door sound).
// API: G.zones.add(def), .def(id), .ids(), .of(map) (its zone id, null on a path), .pathOf(map), .area(map) (the
//   "nearby" unit for the guide: the zone, or 'path:<zone>'), .visited(id), .visitedIds(), .visit(id), .want() (a zone
//   the child asked for on the map and hasn't reached), .route(fromMap, toMap) (the exit to take next, over every map's
//   exits), .travel(f, id) / .ride(f, id) (the bus), .worldMap(o) -> Wait (G.worldMap), .enter(f) (field.js onEnter),
//   .busAt / .postAt / .dogSpotAt (f, x, y), .blocks(f, x, y), .search(f, x, y) (a generator or null, field.js),
//   .goal(f) (guide.js: a nearby thing to do in this zone), .drawUnder / .drawTop (field.js), .bus (the bus on screen).
// Saved: G.state.world = { visited: {zone: {d: day}}, want: zone | null, dog: {spotId: {d, t}} } and G.state.dogName.
'use strict';
(function () {
  const Z = G.zones = {}, T = G.TILE;
  const TT = (t, en) => ({ t, en });
  Z.LIST = [];
  Z.MAPDRAW = []; // more to draw on the world map: fn(ctx, worldMap) (connect.js: the stars, the letter going somewhere)
  // a zone's own ghost-hand demos (src/demo.js): { kind, find(f) -> [x, y] tile to tap, or null } (once each, saved)
  Z.demos = [];
  Z.add = function (def) {
    Z.LIST = Z.LIST.filter(z => z.id !== def.id).concat([def]);
    for (const m of def.maps || []) if (G.maps[m]) G.maps[m].zone = def.id;
    if (def.path && G.maps[def.path]) G.maps[def.path].path = def.id;
    return def;
  };
  Z.def = id => Z.LIST.find(z => z.id === id) || null;
  Z.ids = () => Z.LIST.map(z => z.id);
  Z.of = m => { const d = G.maps[m]; if (!d) return null; if (d.path) return null; return d.zone || 'villa'; };
  Z.pathOf = m => (G.maps[m] && G.maps[m].path) || null;
  Z.area = m => Z.of(m) || ('path:' + Z.pathOf(m));
  Z.name = id => { const z = Z.def(id); return z ? z.name : ''; };
  // a time of day for rare animals (animals.js: a map's animals entry with when): 'manana' (the first minutes of a
  // session: the morning), 'noche' (after sunset), 'dia' (before sunset), or a function
  Z.timeOk = function (w) {
    if (typeof w === 'function') { try { return !!w(); } catch (e) { return false; } }
    const night = !!(G.day && G.day.over && G.day.over());
    if (w === 'noche') return night;
    if (w === 'dia') return !night;
    if (w === 'manana') return !night && (G.sessionTime || 0) < 300;
    return true;
  };

  // ---------- saved ----------
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.world)) s.world = {};
    const w = s.world; if (!isObj(w.visited)) w.visited = {}; if (!isObj(w.dog)) w.dog = {};
    return w;
  }
  Z.state = () => (G.state ? st() : null);
  Z.visited = id => !!(G.state && st().visited[id]);
  Z.visitedIds = () => Z.ids().filter(Z.visited);
  Z.visit = id => { if (!G.state || !Z.def(id) || Z.visited(id)) return false; st().visited[id] = { d: G.words ? G.words.day() : 0 }; G.st.autosave(); return true; };
  Z.want = () => { const w = G.state && st().want; return w && !Z.visited(w) ? w : null; };

  const opened = () => !!(G.chapters && G.chapters.openerDone && G.chapters.openerDone());
  // ---------- arriving: a new place is a celebration ----------
  Z.enter = function (f) {
    if (!G.state || !f) return;
    const z = Z.of(f.mapId); if (!z) return;
    if (z === 'villa' || !opened()) { if (z === 'villa') Z.visit('villa'); return; } // (home: no fuss; the opener first)
    if (!Z.visit(z)) return;
    if (st().want === z) st().want = null;
    f.tasks.add((function* () {
      while (G.fade.a > 0 || f.locked || G.top() !== f) yield 1;
      f.locked = true;
      try { yield Z.newPlace(z); } finally { f.locked = false; }
    })());
  };
  // "¡Nuevo lugar!": the zone's big picture pops in with confetti, its name is said, and a little bus flies in ("you can
  // come back by bus"). It closes by itself (or with a tap).
  class NewPlace {
    constructor(w, z) { this.w = w; this.z = Z.def(z); this.t = 0; this.transparent = true; }
    onEnter() { G.audio.jingle('promote'); G.fx.confetti(G.W / 2 - 70, 150, -1, 22); G.fx.confetti(G.W / 2 + 70, 150, 1, 22); if (G.speak) G.speak('¡' + this.z.name + '!'); }
    closeXY() { return [G.W - 28, 6]; }
    update() {
      this.t++;
      if (this.t === 70) { G.audio.sfx('star'); if (G.pet && G.pet.sound) G.pet.sound('bark'); }
      if (this.t > 170 || (this.t > 40 && (G.input.tap() || G.input.p('A') || G.input.p('B')))) { G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const k = Math.min(1, this.t / 18), s = 0.4 + 0.6 * (1 - Math.pow(1 - k, 3)), cx = G.W / 2, cy = 96;
      ctx.fillStyle = 'rgba(16,16,42,0.45)'; ctx.fillRect(0, 0, G.W, G.H);
      const r = Math.round(46 * s);
      ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + this.t / 40; ctx.fillStyle = i & 1 ? '#f8e060' : '#f8b040'; ctx.fillRect(Math.round(cx + Math.cos(a) * (r + 10)) - 2, Math.round(cy + Math.sin(a) * (r + 10)) - 2, 4, 4); }
      const sz = Math.round(4 * s) || 1; G.drawIcon16(ctx, this.z.icon, cx - 8 * sz, cy - 8 * sz, sz);
      if (this.t > 20) G.bigText(ctx, this.z.name, cx, cy + r + 14, 2, '#fff070', '#401010');
      if (this.t > 60) { // the bus drives in under it: you can come back by bus
        const u = Math.min(1, (this.t - 60) / 30), bx = Math.round(-30 + (cx - 10 + 30) * (1 - Math.pow(1 - u, 2)));
        G.win(ctx, bx - 6, 182, 44, 30, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 });
        G.drawIcon16(ctx, 'autobus', bx, 185, 2);
        if (u >= 1) G.text(ctx, '+', bx + 34, 186, '#38a838', '#10301a');
      }
    }
  }
  Z.newPlace = z => { const w = new G.Wait(); G.push(new NewPlace(w, z)); return w; };

  // ---------- the map's objects: signposts, the bus stop, the dog's spots ----------
  const at = (o, x, y) => o && o.at && o.at[0] === x && o.at[1] === y;
  Z.busAt = function (f, x, y) { const z = Z.def(Z.of(f.mapId)); return z && z.bus && z.bus.map === f.mapId && at(z.bus, x, y) ? z : null; };
  Z.postAt = (f, x, y) => (f.def.posts || []).find(p => at(p, x, y)) || null;
  const clock = () => (G.words ? G.words.now() : 0), day = () => (G.words ? G.words.day() : 0);
  const dogHere = f => !!(G.pet && G.pet.mine() && G.pet.npc(f) && !(G.errands && G.errands.lost()));
  Z.dogReady = function (sp) {
    const r = G.state && st().dog[sp.id]; if (!r) return true;
    if (sp.every === 'day' || sp.every == null) return r.d !== day();
    return clock() - r.t >= sp.every;
  };
  Z.dogSpotAt = (f, x, y) => (dogHere(f) ? (f.def.dogSpots || []).find(sp => at(sp, x, y) && Z.dogReady(sp)) || null : null);
  Z.blocks = (f, x, y) => !!(Z.busAt(f, x, y) || Z.postAt(f, x, y));
  // what a tap on one of them does (field.js search: the field is locked meanwhile)
  Z.search = function (f, x, y) {
    if (Z.busAt(f, x, y)) return busStop(f);
    const p = Z.postAt(f, x, y);
    if (p) return (function* () { const z = Z.def(p.zone); f.wig = { x, y, t: 18 }; G.audio.sfx('select'); if (z && G.speak) G.speak(z.name); G.fx.say(z ? z.name : '', (x * T + 12 - Math.round(f.cam.x)), y * T - 14 - Math.round(f.cam.y), '#f8e060', true); yield 30; })();
    const d = Z.dogSpotAt(f, x, y); if (d) return dogRun(f, d);
    return null;
  };
  Z.special = (f, x, y) => !!(Z.busAt(f, x, y) || Z.postAt(f, x, y) || Z.dogSpotAt(f, x, y));

  // ---------- the dog's thing to do in each zone ----------
  function* dogRun(f, sp) {
    const n = G.pet.npc(f), K = G.chapters.K, [sx, sy] = sp.at;
    if (sp.act === 'chase') { // he races at the nearest animal of sp.kind (the beach's gulls) and it flies off; he barks, hops, comes back
      const a = G.animals && G.animals.find(sp.kind, f), tx = a ? Math.floor(a.x / T) : sx, ty = a ? Math.floor((a.y - 4) / T) : sy;
      G.pet.sound('bark'); K.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
      yield* K.walk(f, n, tx, ty, 5);
      if (a && G.animals.takeOff) G.animals.takeOff(a);
      if (a) G.animals.cry(sp.kind);
      G.pet.sound('bark'); yield* G.pet.play('jump'); G.pet.sound('bark');
      st().dog[sp.id] = { d: day(), t: clock() };
      K.heart(f, n); if (G.hearts) G.hearts.add('canelo', 1, 'care');
      if (G.carry && G.carry.bump) G.carry.bump('dog');
      G.st.autosave(); yield 20; return;
    }
    if (sp.act === 'trail') { // he follows a trail of paw prints (sp.path: tiles), nose down, and finds something at its end
      G.pet.sound('bark'); K.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
      yield* K.walk(f, n, sx, sy, 4);
      for (const [x, y] of sp.path || []) { yield* G.pet.play('sniff'); K.puff('q', n.x * T + 12, n.y * T - 6, { life: 20 }); yield* f.walkNpc(n, K.path(f, n, x, y), 3); }
      const [ex, ey] = (sp.path && sp.path.length) ? sp.path[sp.path.length - 1] : sp.at;
      K.puff('ex', ex * T + 12, ey * T - 8, { life: 30 }); yield* G.pet.play('jump');
      return yield* found(f, sp, n, ex, ey);
    }
    if (sp.act === 'course') { // a jumping course (El parque de juegos): he runs along sp.path ([x, y, jump]) and leaps at each hurdle
      G.pet.sound('bark'); K.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
      yield* K.walk(f, n, sx, sy, 4); n.dir = 'right';
      for (const [x, y, j] of sp.path || []) {
        yield* K.walk(f, n, x, y, 4);
        if (j) { G.pet.sound('bark'); Z.hurdle = { sp: sp.id, x, y, t: G.frame }; yield* G.pet.play('jump'); }
      }
      Z.hurdle = null;
      const [ex, ey] = (sp.path && sp.path.length) ? sp.path[sp.path.length - 1] : sp.at;
      yield* G.pet.play('spin');
      return yield* found(f, sp, n, ex, ey);
    }
    if (sp.act === 'swim') { // a stick thrown across the water (sp.at: the bank, sp.to: the far side): he swims over and brings it back
      const [tx, ty] = sp.to, dx = Math.sign(tx - sx), dy = Math.sign(ty - sy);
      yield* K.walk(f, n, sx, sy, 4); n.dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      Z.stick = { from: [f.player.x, f.player.y], to: [tx, ty], t: 0 }; G.audio.sfx('swing');
      for (let k = 0; k <= 30; k++) { Z.stick.t = k / 30; yield 1; }
      G.pet.sound('bark'); yield* G.pet.play('jump');
      const steps = Math.abs(tx - sx) + Math.abs(ty - sy), dir = dy < 0 ? 'u' : dy > 0 ? 'd' : dx < 0 ? 'l' : 'r', back = { u: 'd', d: 'u', l: 'r', r: 'l' }[dir];
      const splash = () => { for (let i = 0; i < 6; i++) K.puff('drop', n.x * T + 12 + (Math.random() - 0.5) * 14, n.y * T + 12, { vy: -1.2 - Math.random(), vx: (Math.random() - 0.5) * 1.4, g: 0.12, life: 30 }); G.audio.sfx('swing'); };
      for (let i = 0; i < steps; i++) { splash(); yield* f.walkNpc(n, dir, 2); }
      Z.stick = null; G.pet.sound('bark'); K.puff('ex', n.x * T + 12, n.y * T - 6, { life: 30 });
      for (let i = 0; i < steps; i++) { splash(); yield* f.walkNpc(n, back, 2); }
      return yield* found(f, sp, n, sx, sy);
    }
    const side = [[sx - 1, sy], [sx + 1, sy], [sx, sy + 1], [sx, sy - 1]].find(([x, y]) => !f.blocked(x, y, n) && !f.exitAt(x, y)) || [sx, sy + 1];
    G.pet.sound('bark'); K.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
    yield* K.walk(f, n, side[0], side[1], 4);
    n.dir = sx > n.x ? 'right' : sx < n.x ? 'left' : sy > n.y ? 'down' : 'up';
    const wx = sx * T + 12, wy = sy * T + 14;
    if (sp.act === 'splash') { yield* G.pet.play('jump'); for (let i = 0; i < 12; i++) K.puff('drop', wx + (Math.random() - 0.5) * 16, wy - 4, { vy: -1.5 - Math.random(), vx: (Math.random() - 0.5) * 1.6, g: 0.12, life: 36 }); G.audio.sfx('swing'); yield* G.pet.play('dance'); }
    else if (sp.act === 'roll') { yield* G.pet.play('spin'); for (let i = 0; i < 10; i++) K.puff('dust', wx + (Math.random() - 0.5) * 18, wy - 2, { vy: -0.4, vx: (Math.random() - 0.5), life: 40 }); yield* G.pet.play('dance'); }
    else if (sp.act === 'sniff') { yield* G.pet.play('sniff'); K.puff('q', wx, wy - 12, { life: 30 }); yield 20; K.puff('ex', wx, wy - 12, { life: 30 }); }
    else { // dig: sniff, then dirt flies
      yield* G.pet.play('sniff');
      for (let k = 0; k < 3; k++) { for (let i = 0; i < 5; i++) K.puff('crumb', wx + (Math.random() - 0.5) * 8, wy - 2, { vy: -1.4 - Math.random(), vx: (Math.random() - 0.5) * 2, g: 0.15, life: 30 }); G.pet.sound('crunch'); yield 14; }
    }
    yield* found(f, sp, n, sx, sy);
  }
  // the end of a dog's spot: saved as done; what he found lies at (x, y) to pick up; a bark and a heart
  function* found(f, sp, n, x, y) {
    const K = G.chapters.K, wx = x * T + 12, wy = y * T + 14;
    st().dog[sp.id] = { d: day(), t: clock() };
    if (sp.gives && G.carry && G.carry.state) { // he found something: it lies there to pick up
      const g = G.carry.state().ground; g.push({ id: sp.gives, col: sp.col || null, map: f.mapId, x, y });
      G.audio.sfx('chime'); G.fx.burst(wx - Math.round(f.cam.x), wy - 8 - Math.round(f.cam.y));
    }
    G.pet.sound('bark'); K.heart(f, n); if (G.hearts) G.hearts.add('canelo', 1, 'care');
    if (G.carry && G.carry.bump) G.carry.bump('dog');
    G.st.autosave();
    yield 20;
  }

  // ---------- a zone's word: met here, or brought back if it was met elsewhere (any zone may be the first) ----------
  // not met: its one-unknown puzzle (G.intro.show: held up, then "which word is this?"); met: a question about it.
  // (La playa has its own copy, G.playa.meetW; El bosque and later zones use this one.)
  Z.meetW = function* (id, o = {}) {
    const K = G.chapters.K;
    if (!met(id)) { yield* G.intro.show(id, Object.assign({ how: 'show' }, o)); return true; }
    yield* K.sayShow(o.who, o.showPic || o.show || id, K.T(o.prompt || '¡[' + id + ']!', o.en || ''));
    yield* G.review.ask(id, { who: o.who });
    return false;
  };

  // ---------- exits at a map's edge ----------
  Z.edge = (x, y, to, tx, ty, dir) => ({ x, y, to, tx, ty, dir, sfx: 'step', edge: true });
  // the next exit to take from map a toward map b (over every map's exits; null when there's no way)
  Z.route = function (a, b) {
    if (a === b) return null;
    const prev = new Map([[a, null]]), q = [a];
    for (let i = 0; i < q.length; i++) {
      const m = q[i]; if (m === b) break;
      for (const e of (G.maps[m] && G.maps[m].exits) || []) { if (!e.to || prev.has(e.to) || (e.cond && !e.cond())) continue; prev.set(e.to, [m, e]); q.push(e.to); }
    }
    if (!prev.has(b)) return null;
    let k = b, first = null;
    while (prev.get(k)) { first = prev.get(k)[1]; k = prev.get(k)[0]; }
    return first;
  };

  // ---------- the bus ----------
  Z.bus = null; // {f, x, y (world px: its middle bottom), door, dir}
  function* busStop(f) {
    G.audio.sfx('select');
    const here = Z.of(f.mapId);
    const r = yield Z.worldMap({ travel: true });
    if (r.result && r.result !== here) yield* Z.ride(f, r.result);
  }
  const honk = () => { const a = G.audio; try { G.audio.sfx('cursor'); if (G.pet && G.pet.sound) G.pet.sound('woof'); } catch (e) { } void a; };
  // ride the bus to zone id: it drives in along your row, you hop on, it drives off; you get off by that zone's stop
  Z.ride = function* (f, id) {
    const d = Z.def(id); if (!d || !d.entry) return;
    const p = f.player;
    if (!f.def.indoor) {
      const y = p.y * T + 22, stopX = p.x * T - 18;
      Z.bus = { f, x: Math.round(f.cam.x) - 40, y, door: 0 };
      honk();
      while (Z.bus.x < stopX) { Z.bus.x = Math.min(stopX, Z.bus.x + 5); yield 1; }
      honk(); yield 12; Z.bus.door = 1; yield 10;
      p.hidden = true; G.audio.sfx('door'); yield 14; Z.bus.door = 0;
      const dog = G.pet && G.pet.npc(f); if (dog) dog.hidden = true;
      for (let v = 1; Z.bus.x < Math.round(f.cam.x) + G.W + 50; v = Math.min(7, v + 0.25)) { Z.bus.x += v; yield 1; }
    }
    yield G.fadeTo(1, 0.06);
    p.hidden = false; Z.bus = null;
    const e = d.entry, nf = G.goto(e.map, e.x, e.y, e.dir || 'down');
    nf.locked = true;
    const dog2 = G.pet && G.pet.npc(nf); if (dog2) dog2.hidden = true;
    nf.player.hidden = true;
    Z.bus = { f: nf, x: e.x * T - 18, y: e.y * T + 22, door: 0 };
    nf.tasks.add((function* () {
      while (G.fade.a > 0) yield 1;
      yield 10; Z.bus.door = 1; G.audio.sfx('door'); yield 10;
      nf.player.hidden = false; if (dog2) { dog2.hidden = false; G.pet.place(nf, dog2); G.pet.sound('bark'); }
      yield 12; Z.bus.door = 0; honk();
      for (let v = 1; Z.bus && Z.bus.x < Math.round(nf.cam.x) + G.W + 50; v = Math.min(7, v + 0.25)) { Z.bus.x += v; yield 1; }
      Z.bus = null; nf.locked = false;
    })());
  };
  // the bus picture on the map: a little yellow bus (world px: x its left, y its bottom)
  function drawBus(ctx, f) {
    const b = Z.bus; if (!b || b.f !== f) return;
    const x = Math.round(b.x - f.cam.x), y = Math.round(b.y - f.cam.y), w = 46, h = 26;
    ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(x + 2, y - 2, w, 3);
    ctx.fillStyle = '#10102a'; ctx.fillRect(x - 1, y - h - 1, w + 2, h - 3);
    ctx.fillStyle = '#f8c830'; ctx.fillRect(x, y - h, w, h - 5);
    ctx.fillStyle = '#fff0a0'; ctx.fillRect(x, y - h, w, 2);
    ctx.fillStyle = '#e05030'; ctx.fillRect(x, y - 12, w, 2);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#88d0f8'; ctx.fillRect(x + 3 + i * 9, y - h + 4, 7, 7); ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3 + i * 9, y - h + 4, 2, 1); }
    ctx.fillStyle = b.door ? '#10102a' : '#5898d0'; ctx.fillRect(x + w - 9, y - h + 4, 7, h - 10); // the door (open: dark)
    ctx.fillStyle = '#fff8c0'; ctx.fillRect(x + w - 1, y - 9, 2, 3);
    for (const wx of [x + 9, x + w - 12]) { ctx.fillStyle = '#10102a'; ctx.fillRect(wx - 4, y - 6, 9, 7); ctx.fillStyle = '#404050'; ctx.fillRect(wx - 3, y - 5, 7, 5); ctx.fillStyle = '#a0a0b0'; ctx.fillRect(wx - 1, y - 3, 2, 2); }
  }
  // from the kid menu: the bus comes to you
  Z.travel = function* (f, id) { if (id && id !== Z.of(f.mapId)) yield* Z.ride(f, id); };

  // ---------- drawing on the map (field.js) ----------
  function post(ctx, x, y, icon, dir, t, wig) { // a wooden signpost with an arrow board and a picture
    const w = wig ? Math.round(Math.sin(wig * 0.9) * 2) : 0;
    ctx.fillStyle = '#3a2410'; ctx.fillRect(x + 10, y + 8, 4, 16); ctx.fillStyle = '#8a5a2c'; ctx.fillRect(x + 11, y + 8, 2, 15);
    const bx = x + 1 + w, by = y - 6;
    ctx.fillStyle = '#3a2410'; ctx.fillRect(bx - 1, by - 1, 24, 20);
    ctx.fillStyle = '#c88a48'; ctx.fillRect(bx, by, 22, 18); ctx.fillStyle = '#f4e8c8'; ctx.fillRect(bx + 2, by + 1, 18, 16);
    G.drawIcon16(ctx, icon, bx + 3, by + 1);
    if (dir) { // a little red arrow on the board's side
      ctx.fillStyle = '#e03028'; const ax = dir === 'left' ? bx - 5 : dir === 'right' ? bx + 23 : bx + 9, ay = dir === 'up' ? by - 6 : dir === 'down' ? by + 18 : by + 6;
      const bob = Math.round(Math.sin(t / 10) * 1);
      if (dir === 'left' || dir === 'right') { const s = dir === 'left' ? -1 : 1; for (let i = 0; i < 4; i++) ctx.fillRect(ax + s * i + bob * s, ay + i - 3 + 3, 1, 7 - 2 * i); }
      else { const s = dir === 'up' ? -1 : 1; for (let i = 0; i < 4; i++) ctx.fillRect(ax + i - 3 + 3, ay + s * i + bob * s, 7 - 2 * i, 1); }
    }
  }
  function busSign(ctx, x, y, t) { // the bus stop: a pole with a round sign and the bus on it
    ctx.fillStyle = '#10102a'; ctx.fillRect(x + 10, y - 2, 4, 26); ctx.fillStyle = '#a0a0b0'; ctx.fillRect(x + 11, y - 2, 2, 25);
    ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(x + 12, y - 8, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a78e0'; ctx.beginPath(); ctx.arc(x + 12, y - 8, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + 12, y - 8, 8, 0, Math.PI * 2); ctx.fill();
    G.drawIcon16(ctx, 'autobus', x + 4, y - 16);
    if ((t >> 5) % 4 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 20, y - 18, 1, 3); ctx.fillRect(x + 19, y - 17, 3, 1); }
  }
  Z.drawUnder = function (f, ctx) {
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const sp of f.def.dogSpots || []) { // a little mound of dirt / a splash ring / a sniffy log, where he can play
      const x = sp.at[0] * T - cx, y = sp.at[1] * T - cy; if (x < -24 || y < -24 || x > G.W || y > G.H) continue;
      if (sp.act === 'dig' || !sp.act) { ctx.fillStyle = '#7a4a20'; ctx.fillRect(x + 6, y + 14, 12, 4); ctx.fillStyle = '#a06a34'; ctx.fillRect(x + 8, y + 12, 8, 3); }
      else if (sp.act === 'splash') { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(x + 12, y + 14, 8 + (f.t >> 3) % 3, 3, 0, 0, Math.PI * 2); ctx.stroke(); }
      else if (sp.act === 'roll') { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 4, y + 13, 16, 6); ctx.fillStyle = '#d8e8f8'; ctx.fillRect(x + 6, y + 17, 12, 2); }
      else if (sp.act === 'chase') { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 6, y + 15, 4, 1); ctx.fillRect(x + 7, y + 14, 2, 1); ctx.fillStyle = '#c8d0dc'; ctx.fillRect(x + 13, y + 17, 5, 1); ctx.fillRect(x + 15, y + 16, 2, 1); } // two feathers on the sand
      else if (sp.act === 'sniff') { ctx.fillStyle = '#5a3818'; ctx.fillRect(x + 3, y + 12, 18, 6); ctx.fillStyle = '#8a5a2c'; ctx.fillRect(x + 4, y + 13, 16, 3); ctx.fillStyle = '#c89a60'; ctx.fillRect(x + 18, y + 13, 3, 4); }
    }
  };
  Z.stick = null; // a stick flying across the water for the dog (dog-spot act 'swim'): {from, to (tiles), t: 0..1}
  Z.drawTop = function (f, ctx) {
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const p of f.def.posts || []) { const z = Z.def(p.zone); if (z) post(ctx, p.at[0] * T - cx, p.at[1] * T - cy, z.icon, p.dir, f.t, f.wig && f.wig.x === p.at[0] && f.wig.y === p.at[1] ? f.wig.t : 0); }
    const z = Z.def(Z.of(f.mapId));
    if (z && z.bus && z.bus.map === f.mapId) busSign(ctx, z.bus.at[0] * T - cx, z.bus.at[1] * T - cy, f.t);
    if (dogHere(f) && !f.locked && G.top() === f) for (const sp of f.def.dogSpots || []) if (Z.dogReady(sp)) G.drawAlert(ctx, 'huella', sp.at[0] * T - cx, sp.at[1] * T - cy + 6, f.t);
    drawBus(ctx, f);
    const sk = Z.stick; if (sk && G.drawIcon16) { const u = sk.t, x = sk.from[0] + (sk.to[0] - sk.from[0]) * u, y = sk.from[1] + (sk.to[1] - sk.from[1]) * u; G.drawIcon16(ctx, 'palo', Math.round(x * T + 4 - cx), Math.round(y * T + 2 - cy - Math.sin(u * Math.PI) * 30)); }
  };

  // ---------- the guide's suggestion in this zone (guide.js) ----------
  // a dog's spot ready on this map; the friend who travels (Lola) with her bubble; an unvisited zone's signpost
  Z.goal = function (f) {
    if (!G.state || !f) return null;
    if (dogHere(f)) { const sp = (f.def.dogSpots || []).find(Z.dogReady); if (sp) return { why: 'dog spot ' + sp.id, pts: [{ x: sp.at[0] * T + 12, y: sp.at[1] * T + 12, lift: 30, icon: 'huella' }] }; }
    return null;
  };
  // a zone's own task going on (guide.js, right after the story and a favour going on): a zone file wraps it
  Z.task = function () { return null; };
  // the way toward a zone not visited yet (the one asked for on the world map first, else the nearest new one): an exit
  Z.exploreGoal = function (f) {
    if (!G.state || !f || !opened()) return null;
    const want = Z.want(), here = Z.area(f.mapId);
    const ids = want ? [want] : Z.ids().filter(id => id !== 'villa' && !Z.visited(id));
    let best = null;
    for (const id of ids) {
      const z = Z.def(id), to = z && (z.entry ? z.entry.map : z.maps && z.maps[0]); if (!to || !G.maps[to]) continue;
      if (here !== 'villa' && here !== 'path:' + id && !want) continue; // (from another zone: only the one asked for)
      const ex = Z.route(f.mapId, to); if (!ex) continue;
      const d = Math.abs(ex.x - f.player.x) + Math.abs(ex.y - f.player.y);
      if (!best || d < best.d) best = { d, ex, id };
    }
    if (!best) return null;
    return { why: 'explore ' + best.id, explore: true, pts: [{ x: best.ex.x * T + 12, y: best.ex.y * T + 12, lift: 20, door: true }], badge: { icon: Z.def(best.id).icon } };
  };

  // ---------- the friends who are in every zone (for the zones' content files) ----------
  const sayP = (who, show, ...pages) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, show ? { show } : {}));
  const met = id => !!(G.words && G.words.met(id));
  // Lola, the friend who travels: at every zone's first map. Her bubble shows the zone's picture until you've talked to
  // her there today; she says hello, holds up the zone's picture and its name, and shows what the dog can do here.
  // A zone file can give her more to say: zone def `lola: function* (f) {...}` (played after her hello).
  Z.lolaTalked = m => { const r = G.state && st().lola; return !!(r && r[m] === day()); };
  Z.lola = (x, y, zone) => ({ id: 'lola', npc: 'lola', x, y, dir: 'down', wander: 1,
    alert: () => { if (G.chapters && G.chapters.alert('lola')) return G.chapters.alert('lola'); const f = G.field; return f && !Z.lolaTalked(f.mapId) ? { icon: (Z.def(zone) || {}).icon || 'mapa' } : (G.favores && G.favores.alert('lola')) || null; },
    talk: function* (f) {
      if (G.chapters && (yield* G.chapters.talk('lola', f))) return;
      const z = Z.def(zone), w = st(); if (!isObj(w.lola)) w.lola = {};
      const first = !w.lola.met; w.lola.met = true;
      if (Z.lolaTalked(f.mapId) && G.favores && (yield* G.favores.talk('lola', f))) return; // (her favour of the day, a zone's)
      yield sayP('lola', null, first ? TT(met('hola') ? '¡[hola], {name}! ¡Soy Lola!' : '¡Hola, {name}! ¡Soy Lola!', 'Hi, {name}! I\'m Lola. I explore everywhere!') : TT(met('hola') ? '¡[hola], {name}!' : '¡Hola, {name}!', 'Hi, {name}!'));
      if (z) yield sayP('lola', { icon: z.icon }, TT('¡' + z.name + '!', 'This is ' + (z.en || z.name) + '!'));
      w.lola[f.mapId] = day(); G.st.autosave();
      if (z && z.lola) { yield* z.lola(f); return; }
      const sp = dogHere(f) && (f.def.dogSpots || []).find(Z.dogReady);
      if (sp) { G.chapters.point(sp.at[0] * T + 12, sp.at[1] * T); try { yield sayP('lola', { icon: 'huella' }, TT('¡Mira, {dog}!', 'Look! {dog} can play over there: tap the paw prints!')); } finally { G.chapters.point(null); } }
    } });
  // Nico in a zone: his hide-and-seek with that zone's hiding places (seek.js, one game per zone)
  Z.nico = (x, y) => ({ id: 'nico', npc: 'nico', x, y, dir: 'down', wander: 1,
    alert: () => (G.chapters && G.chapters.alert('nico')) || (G.seek && G.seek.alert('nico')) || null,
    talk: function* (f) {
      if (G.chapters && (yield* G.chapters.talk('nico', f))) return;
      if (G.seek && (yield* G.seek.talk('nico', f))) return;
      yield sayP('nico', null, TT(met('hola') ? '¡[hola], {name}!' : '¡Hola, {name}!', 'Hi, {name}!'));
    } });

  // =====================================================================
  //  The world map: the zones as big pictures; tap one you've been to and the bus takes you there
  // =====================================================================
  class WorldMap {
    constructor(w, o) { this.w = w; this.o = o || {}; this.t = 0; this.hop = {}; this.walk = null; this.transparent = false; }
    onEnter() { G.audio.sfx('ok'); }
    here() { const f = G.field; return f ? Z.area(f.mapId) : 'villa'; }
    node(id) { const z = Z.def(id); return z && z.pos ? { x: z.pos[0], y: z.pos[1], r: 21 } : null; }
    closeXY() { return [G.W - 28, 6]; }
    hintXY() { return null; }
    trophyRect() { return { x: 4, y: 4, w: 22, h: 22 }; }
    rects() { return Z.ids().map(id => { const n = this.node(id); return n ? { id, x: n.x - n.r - 2, y: n.y - n.r - 2, w: 2 * n.r + 4, h: 2 * n.r + 14 } : null; }).filter(Boolean); }
    tapZone(id) {
      const here = this.here();
      if (id === here) { this.hop[id] = 0; honk(); return; }
      if (Z.visited(id)) { if (!this.o.travel) { this.hop[id] = 0; return; } G.audio.sfx('ok'); G.pop(); this.w.resolve(id); return; }
      // not been there yet: footprints run along the path from here to it; the guide will suggest the way on foot
      st().want = id; G.st.autosave(); G.audio.sfx('select'); this.walk = { id, t: 0 }; this.hop[id] = 0;
    }
    update() {
      this.t++;
      for (const k in this.hop) if (++this.hop[k] > 24) delete this.hop[k];
      if (this.walk && ++this.walk.t > 80) { G.pop(); this.w.resolve(null); return; }
      if (this.walk) return;
      const tap = G.input.tap();
      if ((tap && G.closeHit(...this.closeXY())) || G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); return; }
      if (tap && G.story && G.story.world && G.tapIn(this.trophyRect())) { G.audio.sfx('ok'); G.story.world(); return; } // the whole world on one page
      if (tap) for (const r of this.rects()) if (G.tapIn(r)) { this.tapZone(r.id); return; }
      const ids = Z.ids(); if (this.sel == null) this.sel = Math.max(0, ids.indexOf(this.here()));
      const d = G.input.repDir(14, 6); if (d) { this.sel = (this.sel + (d === 'left' || d === 'up' ? -1 : 1) + ids.length) % ids.length; G.audio.sfx('cursor'); }
      if (G.input.p('A')) this.tapZone(ids[this.sel]);
    }
    draw(ctx) {
      // the land: grass, the sea along the bottom right, hills at the top right, dots of trees at the top
      ctx.fillStyle = '#4a90d8'; ctx.fillRect(0, 0, G.W, G.H);
      ctx.fillStyle = '#7cc45c'; ctx.beginPath(); ctx.ellipse(160, 108, 158, 104, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f0dca0'; ctx.beginPath(); ctx.ellipse(214, 206, 70, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7cc45c'; ctx.beginPath(); ctx.ellipse(160, 104, 150, 92, 0, 0, Math.PI * 2); ctx.fill();
      for (const [x, y] of [[120, 26], [138, 18], [186, 22], [200, 32], [108, 42]]) { ctx.fillStyle = '#2a7a38'; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x - 6, y + 4); ctx.lineTo(x + 6, y + 4); ctx.fill(); }
      for (const [x, y, s] of [[290, 56, 1], [250, 50, 0.7]]) { ctx.fillStyle = '#8a9ab8'; ctx.beginPath(); ctx.moveTo(x, y - 22 * s); ctx.lineTo(x - 20 * s, y + 10); ctx.lineTo(x + 20 * s, y + 10); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - 22 * s); ctx.lineTo(x - 6 * s, y - 13 * s); ctx.lineTo(x + 6 * s, y - 13 * s); ctx.fill(); }
      // the paths from Villa Sol: dotted, with footprints running along one that was just asked for
      const v = this.node('villa');
      for (const id of Z.ids()) {
        if (id === 'villa') continue; const n = this.node(id); if (!n || !v) continue;
        const len = Math.hypot(n.x - v.x, n.y - v.y), k = Math.floor(len / 7);
        for (let i = 2; i < k - 2; i++) { const u = i / k; ctx.fillStyle = Z.visited(id) ? '#f8e8b0' : '#c8b888'; ctx.fillRect(Math.round(v.x + (n.x - v.x) * u) - 1, Math.round(v.y + (n.y - v.y) * u) - 1, 3, 3); }
        if (this.walk && this.walk.id === id) {
          const here = this.node(this.here().replace('path:', '')) || v, from = this.here() === 'villa' || this.here().startsWith('path:') ? v : here;
          for (let i = 0; i < 8; i++) { const u = Math.min(1, i / 8 + this.walk.t / 160); if (u * 80 > this.walk.t + 8) continue; const px = Math.round(from.x + (n.x - from.x) * u), py = Math.round(from.y + (n.y - from.y) * u) + (i & 1 ? 3 : -3); ctx.fillStyle = '#6a3a18'; ctx.fillRect(px - 2, py, 4, 3); ctx.fillRect(px - 2, py - 2, 1, 1); ctx.fillRect(px, py - 3, 1, 1); ctx.fillRect(px + 2, py - 2, 1, 1); }
        }
      }
      // the zones
      const here = this.here(), ids = Z.ids();
      ids.forEach((id, i) => {
        const z = Z.def(id), n = this.node(id); if (!n) return;
        const been = Z.visited(id), h = this.hop[id], hop = h != null ? Math.round(Math.sin(h / 24 * Math.PI) * -6) : 0, sel = this.sel === i;
        const x = n.x, y = n.y + hop;
        ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(x, y, n.r + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = sel ? '#f8e060' : been ? '#fffaf0' : '#5a5070'; ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI * 2); ctx.fill();
        if (been) G.drawIcon16(ctx, z.icon, x - 16, y - 16, 2);
        else {
          ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 0.85; ctx.drawImage(G.tinted(G.icon(z.icon), '#2a2438', 'wmsil' + id), x - 16, y - 16, 32, 32); ctx.globalAlpha = 1;
          G.bigText(ctx, '?', x, y - 6, 2, '#f8e060', '#10102a');
        }
        if (been) { const w = G.textWidth(z.name) + 8, lx = G.clamp(x, w / 2 + 2, G.W - w / 2 - 2); G.win(ctx, lx - w / 2, y + n.r - 2, w, 13, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 }); G.textC(ctx, z.name, lx, y + n.r + 1, '#604020', null); }
        if (been && G.album && G.album.zoneCount) { const c = G.album.zoneCount(id); if (c.of) G.text(ctx, c.met + '/' + c.of, x + n.r - 6, y - n.r - 2, '#ffffff', '#10102a'); }
        if (been && id !== here && this.o.travel) { const b = Math.round(Math.sin(this.t / 9 + i) * 1.5); G.drawIcon16(ctx, 'autobus', x - n.r - 8, y - n.r - 4 + b); } // (the bus goes there)
      });
      // you are here: your face over the zone (on a path: half way along it)
      const hz = here.startsWith('path:') ? here.slice(5) : here, hn = this.node(hz);
      if (hn) {
        const onPath = here.startsWith('path:'), px = onPath && v ? (hn.x + v.x) / 2 : hn.x + hn.r + 6, py = (onPath && v ? (hn.y + v.y) / 2 : hn.y - 4) - Math.round(Math.abs(Math.sin(this.t / 10)) * 3); // (beside the place: its name stays readable)
        const img = G.unitSprite(G.st.playerSpec().map, 'down', (this.t >> 4) & 1);
        ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(px, py - 10, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f04878'; ctx.beginPath(); ctx.arc(px, py - 10, 12, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.arc(px, py - 10, 11, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, Math.round(px - 12), Math.round(py - 22)); ctx.restore();
        ctx.fillStyle = '#f04878'; ctx.beginPath(); ctx.moveTo(px - 5, py + 1); ctx.lineTo(px + 5, py + 1); ctx.lineTo(px, py + 8); ctx.fill();
      }
      for (const fn of Z.MAPDRAW) { try { fn(ctx, this); } catch (e) { if (!Z.err) { Z.err = 1; console.error(e); } } }
      { const r = this.trophyRect(), b = Math.round(Math.sin(this.t / 12) * 1); G.win(ctx, r.x, r.y + b, r.w, r.h, { fill1: '#fff6d0', fill2: '#f8d870', alpha: 1 }); G.drawIcon16(ctx, 'trofeo', r.x + 3, r.y + 3 + b); } // the trophy: "¡Mi mundo!" (connect.js)
      G.closeBtn(ctx, ...this.closeXY());
      if (G.enVisible()) G.text(ctx, this.o.travel ? 'Tap a place you have been to: the bus takes you. "?": walk there!' : 'The world', 30, 10, '#ffffff', '#10102a');
    }
  }
  Z.worldMap = function (o) { const w = new G.Wait(); G.push(new WorldMap(w, o)); return w; };
  G.worldMap = Z.worldMap;

  // =====================================================================
  //  The opener's choice: play with the puppy, or go exploring (content/es/story-c01-c10.js)
  // =====================================================================
  // Two big pictures and no words to read: the puppy with his ball and a heart (play with him: the puppy tutorial,
  // chapter 1), or a path into green hills (go explore: the door opens, he comes along; his games wait for later, and
  // Mamá has his picture in her bubble). The voice asks it.
  class PlayOrExplore {
    constructor(w) { this.w = w; this.t = 0; this.sel = 0; this.transparent = true; }
    onEnter() { if (G.speak) G.speak(G.fill('¿Jugar con {dog}... o explorar?')); }
    rect(k) { return { x: k ? 170 : 22, y: 40, w: 128, h: 150 }; }
    hintXY() { return null; }
    pick(k) { G.audio.sfx('ok'); if (G.speak) G.speak(G.fill(k ? '¡A explorar!' : '¡A jugar con {dog}!')); G.pop(); this.w.resolve(k ? 'explore' : 'play'); }
    update() {
      this.t++;
      if (this.t < 20) return;
      const tap = G.input.tap();
      if (tap) for (const k of [0, 1]) if (G.tapIn(this.rect(k))) { this.sel = k; this.pick(k); return; }
      const d = G.input.repDir(14, 6); if (d === 'left' || d === 'right') { this.sel = d === 'left' ? 0 : 1; G.audio.sfx('cursor'); }
      if (G.input.p('A')) this.pick(this.sel);
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(16,16,42,0.55)'; ctx.fillRect(0, 0, G.W, G.H);
      for (const k of [0, 1]) {
        const r = this.rect(k), on = this.sel === k, bob = Math.round(Math.sin(this.t / 12 + k * Math.PI) * 2);
        G.win(ctx, r.x, r.y + bob, r.w, r.h, on ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { alpha: 1 });
        const cx = r.x + r.w / 2, top = r.y + bob;
        if (!k) { // the puppy with his ball, wagging, a heart rising
          ctx.fillStyle = '#78c058'; ctx.fillRect(r.x + 8, top + 8, r.w - 16, r.h - 40);
          const img = G.unitSprite(G.data.npcs.canelo.map, 'down', (this.t >> 3) & 1), hop = (this.t % 70) < 12 ? -Math.round(Math.sin((this.t % 70) / 12 * Math.PI) * 6) : 0;
          ctx.imageSmoothingEnabled = false; ctx.drawImage(img, cx - 36, top + 20 + hop, 72, 72);
          G.drawIcon16(ctx, { icon: 'pelota', col: '#3068e0' }, cx + 22, top + 74, 2);
          if (G.hearts && G.hearts.heart) G.hearts.heart(ctx, cx + 24, top + 16 - ((this.t >> 3) % 6), true, 2);
          G.textC(ctx, G.fill('¡A jugar con {dog}!'), cx, top + r.h - 22, '#f8e060');
        } else { // a path into the hills, you and the puppy walking along it
          ctx.save(); ctx.beginPath(); ctx.rect(r.x + 8, top + 8, r.w - 16, r.h - 40); ctx.clip();
          ctx.imageSmoothingEnabled = false; ctx.drawImage(G.icon('explorar'), r.x + 8, top + 8, r.w - 16, r.w - 16);
          ctx.restore();
          const step = (this.t >> 4) & 1, me = G.unitSprite(G.st.playerSpec().map, 'up', step), pup = G.unitSprite(G.data.npcs.canelo.map, 'up', step);
          ctx.drawImage(me, cx - 22, top + 70, 32, 32); ctx.drawImage(pup, cx + 2, top + 82, 24, 24);
          G.textC(ctx, '¡A explorar!', cx, top + r.h - 22, '#f8e060');
        }
        if (on && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', cx, r.y - 10 + bob, '#f8e060');
      }
    }
  }
  G.playOrExplore = function () { const w = new G.Wait(); G.push(new PlayOrExplore(w)); return w; };
})();
