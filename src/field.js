// ===== Field exploration: town & interiors; NPCs, talking, searching, doors, events =====
'use strict';
(function () {
  const D = () => G.data;
  const key = (x, y) => x + ',' + y;
  const HUD = [G.W - 26, 6];          // the field menu button (= B), top-right
  const COUNTER = 'etaY';             // people are talked to across these (see interact)
  const THING = 'rlkgPLYZteaujJO';      // objects a tap walks up to and searches (fences, walls, trees, water: just walk)
  const DIR4 = ['up', 'down', 'left', 'right'];

  class Field {
    constructor(mapId, x, y, dir) {
      this.mapId = mapId; this.def = G.maps[mapId];
      const rows = this.def.rows;
      this.map = { w: Math.max(...rows.map(r => r.length)), h: rows.length, rows, get(x, y) { if (y < 0 || y >= this.h || x < 0 || x >= this.w) return ' '; return this.rows[y][x] || ' '; } };
      this.player = { x, y, dir: dir || 'down', ox: 0, oy: 0, moving: false, spec: G.st.playerSpec().map };
      this.npcs = [];
      (this.def.npcs || []).forEach(n => { if (!n.cond || n.cond()) this.addNpc(n); });
      this.t = 0; this.tasks = new G.Tasks(); this.cam = { x: 0, y: 0 };
      this.locked = false; this.stepCount = 0;
      G.field = this;
      this.snapCam();
    }
    addNpc(n) {
      const spec = n.spec || (n.npc && D().npcs[n.npc] ? D().npcs[n.npc].map : null);
      const o = Object.assign({ ox: 0, oy: 0, dir: 'down', home: [n.x, n.y], wt: G.r(120) }, n, { spec });
      this.npcs.push(o); return o;
    }
    npc(id) { return this.npcs.find(n => n.id === id); }
    removeNpc(id) { this.npcs = this.npcs.filter(n => n.id !== id); }
    onEnter() {
      G.audio.play(this.def.music || 'town');
      if (this.def.name && !this.noBanner) { this.banner = { text: this.def.name, icon: this.def.icon, t: 150 }; if (this.def.icon) G.st.see(this.def.icon); }
      if (this.def.onEnter) this.tasks.add(this.def.onEnter(this));
    }
    // ---------- walkability ----------
    blocked(x, y, self) {
      if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) return true;
      const ex = this.exitAt(x, y); if (ex) return false;
      const t = G.TERRAIN[this.map.get(x, y)] || G.TERRAIN['.'];
      if (t.block || t.wall) return true;
      if (this.npcs.some(n => n !== self && !n.ghost && n.x === x && n.y === y)) return true;
      if (self !== this.player && this.player.x === x && this.player.y === y) return true;
      return false;
    }
    exitAt(x, y) { return (this.def.exits || []).find(e => e.x === x && e.y === y && (!e.cond || e.cond())); }
    // ---------- camera ----------
    camTarget() {
      const T = G.TILE, p = this.player;
      let cx = p.x * T + p.ox + T / 2 - G.W / 2, cy = p.y * T + p.oy + T / 2 - G.H / 2;
      const mw = this.map.w * T, mh = this.map.h * T;
      cx = mw <= G.W ? (mw - G.W) / 2 : G.clamp(cx, 0, mw - G.W);
      cy = mh <= G.H ? (mh - G.H) / 2 : G.clamp(cy, 0, mh - G.H);
      if (this.camShift) cy += this.camShift; // a menu over the bottom of the map (pet.js) lifts the view a little
      return { x: cx, y: cy };
    }
    snapCam() { this.cam = this.camTarget(); }
    // ---------- movement ----------
    *step(o, dir, speed = 3) {
      o.dir = dir; const [dx, dy] = G.DIRS[dir];
      const nx = o.x + dx, ny = o.y + dy;
      if (this.blocked(nx, ny, o)) return false;
      o.moving = true; o.x = nx; o.y = ny;
      const n = Math.ceil(G.TILE / speed);
      for (let i = 1; i <= n; i++) { o.ox = -dx * (G.TILE - Math.min(G.TILE, i * speed)); o.oy = -dy * (G.TILE - Math.min(G.TILE, i * speed)); yield 1; }
      o.ox = 0; o.oy = 0; o.moving = false;
      return true;
    }
    // scripted walks: dirs string like "uurrd"
    *walkNpc(o, dirs, speed = 2) {
      const m = { u: 'up', d: 'down', l: 'left', r: 'right' };
      for (const c of dirs) { if (m[c]) { const dir = m[c]; const [dx, dy] = G.DIRS[dir]; o.dir = dir; o.x += dx; o.y += dy; const n = Math.ceil(G.TILE / speed); for (let i = 1; i <= n; i++) { o.ox = -dx * (G.TILE - Math.min(G.TILE, i * speed)); o.oy = -dy * (G.TILE - Math.min(G.TILE, i * speed)); yield 1; } o.ox = 0; o.oy = 0; } else if (c === '.') yield 16; else if (c === 'U') o.dir = 'up'; else if (c === 'D') o.dir = 'down'; else if (c === 'L') o.dir = 'left'; else if (c === 'R') o.dir = 'right'; }
    }
    // The player walks with the keys, or along a tap route (this.route, see tapTarget/plan). Both use the
    // same steps below, so doors, events and talking behave the same; a key press cancels a tap route.
    *playerWalk() {
      const p = this.player;
      while (true) {
        yield 1;
        if (this.locked || G.top() !== this) { this.route = null; continue; } // a cutscene or a screen on top ends a tap walk
        let d = G.input.dir();
        if (d || G.input.p('A') || G.input.p('B')) this.route = null;
        if (!d && this.route) {
          const pl = this.plan(this.route);
          if (pl && pl.dir) d = pl.dir;
          else { // arrived (or can't get any closer): face the target, then talk / search like A
            const r = this.route; this.route = null;
            if (pl && pl.face) p.dir = pl.face;
            if (pl && pl.act) { this.locked = true; yield* this.interact(); this.locked = false; continue; }
            if (pl && r.name && G.world) G.world.arrive(this, r); // a thing with a word: it names itself (world.js)
          }
        }
        if (d) {
          if (p.dir !== d && !G.input.h(d + 'Moved')) { p.dir = d; }
          const [dx, dy] = G.DIRS[d];
          const ex = this.exitAt(p.x + dx, p.y + dy);
          if (G.fx.walk) G.fx.walk(this, p, d); // a dust puff when starting to walk (fx.js)
          const moved = yield* this.step(p, d, 3);
          if (moved) {
            this.stepCount++;
            if (this.stepCount % 2 === 0) G.audio.sfx('step');
            if (ex) { this.route = null; yield* this.useExit(ex); continue; }
            const ev = (this.def.events || []).find(e => e.x === p.x && e.y === p.y && (!e.once || !G.state.flags['ev_' + this.mapId + e.x + '_' + e.y]) && (!e.cond || e.cond()));
            if (ev) { this.route = null; if (ev.once) G.state.flags['ev_' + this.mapId + ev.x + '_' + ev.y] = true; this.locked = true; yield* ev.run(this); this.locked = false; }
          }
          continue;
        }
        if (G.input.p('A')) { this.locked = true; yield* this.interact(); this.locked = false; continue; }
        if (G.input.p('B') || this.menuReq) { this.menuReq = false; this.locked = true; yield* G.fieldMenu(this); this.locked = false; continue; }
      }
    }
    // ---------- tap-to-walk ----------
    // What a tap on the map means: talk to someone (their tile, the tile above where the head and bubble are,
    // or a counter in front of them), go through a door (or its sign), search a sparkle / object, or walk there.
    // A thing with a word (world.js) carries it as `name`: it names itself when you get there. (Animals: update.)
    tapTarget(tap) {
      const T = G.TILE, wx = tap.x + Math.round(this.cam.x), wy = tap.y + Math.round(this.cam.y), tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      const talker = (x, y) => this.npcs.find(n => n.talk && n.spec && !n.hidden && n.x === x && n.y === y);
      // a person where they are drawn (mid-step too, sliding between tiles), or `up` tiles above that (the head)
      const drawn = up => this.npcs.find(n => n.talk && n.spec && !n.hidden && wx >= n.x * T + n.ox && wx < n.x * T + n.ox + T && wy >= (n.y - up) * T + n.oy && wy < (n.y - up + 1) * T + n.oy);
      const c = this.map.get(tx, ty);
      let n = drawn(0) || talker(tx, ty) || drawn(1) || talker(tx, ty + 1);
      if (!n && COUNTER.includes(c)) n = DIR4.map(d => talker(tx + G.DIRS[d][0], ty + G.DIRS[d][1])).find(Boolean);
      if (n) return { npc: n, x: n.x, y: n.y };
      if (this.exitAt(tx, ty)) return { exit: true, x: tx, y: ty };
      const door = (G.TERRAIN[c] || G.TERRAIN['.']).wall && DIR4.map(d => this.exitAt(tx + G.DIRS[d][0], ty + G.DIRS[d][1])).find(Boolean);
      if (door) return { exit: true, x: door.x, y: door.y }; // the wall or sign around a door, the dark just outside one
      const pg = (this.def.pages || {})[key(tx, ty)];
      const name = G.world ? G.world.wordAt(this, tx, ty) : null;
      const special = !!((pg && !G.st.hasPage(pg)) || (this.def.searches || {})[key(tx, ty)] || (G.errands && G.errands.spotAt(this, tx, ty))); // these win over an animal on them
      if (special || THING.includes(c)) return { search: true, x: tx, y: ty, name, special };
      if (name) return this.blocked(tx, ty, this.player) && !(this.player.x === tx && this.player.y === ty) ? { search: true, x: tx, y: ty, name } : { x: tx, y: ty, name };
      return { x: tx, y: ty };
    }
    // Next step of a tap route, re-planned every step (people move): a breadth-first search over walkable
    // tiles to the nearest goal; doors only as the destination. -> {dir} to walk, or {face, act} on arrival.
    // If no goal can be reached, it walks to the reachable tile closest to the target.
    plan(r) {
      const p = this.player, goals = new Map(); // tile -> direction to face there
      let tx = r.x, ty = r.y;
      if (r.npc) {
        if (!this.npcs.includes(r.npc)) return null;
        tx = r.npc.x; ty = r.npc.y;
        for (const d of DIR4) { const [dx, dy] = G.DIRS[d]; goals.set(key(tx - dx, ty - dy), d); if (COUNTER.includes(this.map.get(tx - dx, ty - dy)) && !goals.has(key(tx - 2 * dx, ty - 2 * dy))) goals.set(key(tx - 2 * dx, ty - 2 * dy), d); }
      } else if (r.search) for (const d of DIR4) goals.set(key(tx - G.DIRS[d][0], ty - G.DIRS[d][1]), d);
      else goals.set(key(tx, ty), null);
      const start = key(p.x, p.y), prev = new Map([[start, null]]), q = [[p.x, p.y]];
      let found = null, near = start, nearD = Math.abs(p.x - tx) + Math.abs(p.y - ty);
      for (let i = 0; i < q.length && !found; i++) {
        const [x, y] = q[i], k = key(x, y), door = k !== start && this.exitAt(x, y);
        if (door && !(r.exit && x === tx && y === ty)) continue; // never walk through a door on the way
        if (goals.has(k)) { found = k; break; }
        const md = Math.abs(x - tx) + Math.abs(y - ty); if (md < nearD) { near = k; nearD = md; }
        for (const d of DIR4) {
          const nx = x + G.DIRS[d][0], ny = y + G.DIRS[d][1], nk = key(nx, ny);
          if (!prev.has(nk) && !this.blocked(nx, ny, p)) { prev.set(nk, [k, d]); q.push([nx, ny]); }
        }
      }
      let k = found || near, dir = null;
      r.end = k.split(',').map(Number);
      while (prev.get(k)) { dir = prev.get(k)[1]; k = prev.get(k)[0]; }
      return { dir, face: found ? goals.get(found) : null, act: !!(found && (r.npc || r.search)) };
    }
    *useExit(ex) {
      if (ex.run) { this.locked = true; const ok = yield* ex.run(this); this.locked = false; if (ok === false) return; }
      if (!ex.to) return;
      G.audio.sfx(ex.sfx || 'door');
      yield G.fadeTo(1, 0.08);
      G.goto(ex.to, ex.tx, ex.ty, ex.dir || this.player.dir);
    }
    facing() { const [dx, dy] = G.DIRS[this.player.dir]; return [this.player.x + dx, this.player.y + dy]; }
    *interact() {
      const [fx, fy] = this.facing();
      let n = this.npcs.find(o => o.x === fx && o.y === fy);
      // talk across counters
      if (!n) { const t = this.map.get(fx, fy); if (t === 'e' || t === 't' || t === 'a' || t === 'Y') { const [dx, dy] = G.DIRS[this.player.dir]; n = this.npcs.find(o => o.x === fx + dx && o.y === fy + dy); } }
      if (n && n.talk) {
        const back = { u: 'down', d: 'up', l: 'right', r: 'left' }[this.player.dir[0]];
        const prev = n.dir; if (!n.fixed) n.dir = back;
        if (typeof n.talk === 'function') yield* n.talk(this, n);
        else { const lines = Array.isArray(n.talk) ? n.talk : [n.talk]; yield G.say(lines, { portrait: G.portraitOf(n), name: G.nameOf(n.npc) }); }
        if (!n.fixed && n.wander) n.dir = prev;
        return;
      }
      yield* this.search(fx, fy);
    }
    *search(fx, fy) {
      if (fx === undefined) [fx, fy] = this.facing();
      const sp = G.errands && G.errands.spotAt(this, fx, fy); // a place an errand sends you (errands.js)
      if (sp) { yield* G.errands.runSpot(this, sp); return; }
      const pg = (this.def.pages || {})[key(fx, fy)];
      if (pg && !G.st.hasPage(pg)) { yield* G.findPage(pg); return; }
      const k = this.mapId + ':' + key(fx, fy);
      const s = (this.def.searches || {})[key(fx, fy)];
      if (s) {
        if (G.state.searched[k]) { yield G.say(s.emptyText || { t: 'Ya no hay nada aquí.', en: 'There is nothing else here.' }); return; }
        if (s.cond && !s.cond()) { yield G.say({ t: 'No hay nada aquí.', en: 'There is nothing here.' }); return; }
        G.state.searched[k] = true;
        if (s.text) yield G.say(s.text);
        if (s.run) yield* s.run(this);
        return;
      }
      if (G.ambient && G.ambient.poke(this, fx, fy)) return; // pet the cat on the fence
      if (G.world && G.world.nameTile(this, fx, fy)) return; // a thing with a word says it (world.js)
      yield G.say({ t: '...', en: 'Nothing here.' }, { noVoice: true });
    }
    // ---------- NPC wandering ----------
    *npcAI() {
      while (true) {
        yield 1;
        if (this.locked || G.top() !== this) continue;
        for (const n of this.npcs) {
          if (!n.wander || n.moving || n.busy) continue;
          if (--n.wt > 0) continue;
          n.wt = 60 + G.r(160);
          const dirs = ['up', 'down', 'left', 'right']; const d = dirs[G.r(4)];
          const [dx, dy] = G.DIRS[d];
          const nx = n.x + dx, ny = n.y + dy;
          if (Math.abs(nx - n.home[0]) + Math.abs(ny - n.home[1]) > (n.wander === true ? 2 : n.wander)) { n.dir = d; continue; }
          if (this.blocked(nx, ny, n) || this.exitAt(nx, ny)) { n.dir = d; continue; }
          const self = this; const g = (function* () { n.busy = true; yield* self.step(n, d, 1.5); n.busy = false; })();
          this.tasks.add(g);
        }
      }
    }
    start() { this.tasks.add(this.playerWalk()); this.tasks.add(this.npcAI()); }
    onExit() { if (G.world) G.world.leave(this); }
    update() {
      this.t++;
      if (G.world && G.world.update(this)) G.input.eat(); // the say-it-back mic used this frame's tap or key (world.js)
      // keys win over a tap walk, and a cutscene (the field locked) ends it rather than pausing it
      if (this.route && (this.locked || G.input.dir() || ['up', 'down', 'left', 'right', 'A', 'B'].some(k => G.input.p(k)))) this.route = null;
      if (!this.locked && G.input.tap()) { // the menu button (= B, eats the tap), else tap-to-walk (field tasks still see the tap)
        if (G.btnHit(...HUD)) { G.input.eat(); this.menuReq = true; this.route = null; }
        else { // tap-to-walk; a tap on an animal (animals.js, not over a person or a door) names it and walks toward it
          const tap = G.input.tap(), tt = this.tapTarget(tap), an = !tt.npc && !tt.exit && !tt.special && G.animals && G.animals.hit(this, tap);
          this.route = an ? G.animals.tapped(this, an) : tt; this.plan(this.route);
        }
      }
      this.tasks.update();
      if (G.ambient) G.ambient.update(this); // the living town (ambient.js): critters, people who look at you, walkers
      if (G.pet) G.pet.update(this); // Canelo, your dog: his tricks and his bed (pet.js)
      if (G.hearts) G.hearts.update(this); // friends call you by name as you pass (hearts.js)
      if (G.animals) G.animals.update(this); // ducks, hens, the fish, the frog, the rabbit, the horse, the goat (animals.js)
      if (G.errands) G.errands.update(this); // Round B errands: who stands where, Canelo lost, Nico tagging along (errands.js)
      const ct = this.camTarget(); this.cam.x += (ct.x - this.cam.x) * 0.3; this.cam.y += (ct.y - this.cam.y) * 0.3;
      if (Math.abs(ct.x - this.cam.x) < 0.5) this.cam.x = ct.x; if (Math.abs(ct.y - this.cam.y) < 0.5) this.cam.y = ct.y;
      if (this.banner) this.banner.t--;
      G.state.playTime += 1 / 60;
      G.st.fieldTick && G.st.fieldTick(this); // autosave: new map, after each interaction or event, every ~15 s
      if (G.input.p('M')) G.audio.toggleMute();
    }
    draw(ctx) {
      const T = G.TILE, cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.W, G.H);
      const x0 = Math.floor(cx / T), y0 = Math.floor(cy / T);
      for (let y = y0; y <= y0 + Math.ceil(G.H / T) + 1; y++) for (let x = x0; x <= x0 + Math.ceil(G.W / T) + 1; x++) {
        if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) continue;
        G.drawTile(ctx, this.map, x, y, x * T - cx, y * T - cy, this.t);
      }
      for (const sg of this.def.signs || []) { // picture signs over doors
        const sx = sg.x * T - cx + 4, sy = sg.y * T - cy - 12;
        ctx.fillStyle = '#5a3818'; ctx.fillRect(sx + 3, sy - 3, 1, 3); ctx.fillRect(sx + 12, sy - 3, 1, 3);
        ctx.fillStyle = '#3a2008'; ctx.fillRect(sx - 1, sy - 1, 18, 18); ctx.fillStyle = '#f4ecd8'; ctx.fillRect(sx, sy, 16, 16);
        G.drawIcon16(ctx, sg.icon, sx, sy);
      }
      for (const k in this.def.pages || {}) { // a hidden notebook page twinkles
        if (G.st.hasPage(this.def.pages[k])) continue;
        const [px, py] = k.split(',').map(Number), ph = (this.t + px * 7) % 60;
        if (ph < 30) { const sx = px * T - cx + 12, sy = py * T - cy + 8 - (ph >> 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 2, sy, 5, 1); ctx.fillRect(sx, sy - 2, 1, 5); ctx.fillStyle = '#f8e060'; ctx.fillRect(sx, sy, 1, 1); }
      }
      if (G.world) G.world.drawUnder(this, ctx); // a named thing wiggles
      if (this.route && this.route.end) { // where a tap is taking you: pulsing corner marks
        const [ex, ey] = this.route.end, i = 3 + ((this.t >> 3) & 1), mx = ex * T - cx, my = ey * T - cy, s = T - 1 - 2 * i;
        for (const [col, o] of [['#10102a', 1], ['#f8e060', 0]]) {
          ctx.fillStyle = col;
          for (const [ax, ay] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const px = mx + i + ax * s + o, py = my + i + ay * s + o; ctx.fillRect(ax ? px - 3 : px, py, 4, 1); ctx.fillRect(px, ay ? py - 3 : py, 1, 4); }
        }
      }
      if (G.ambient) G.ambient.draw(this, ctx, 'ground'); // birds on the ground, shadows
      if (G.animals) G.animals.draw(this, ctx, 'ground'); // lily pads, ripples, swimmers, shadows
      if (G.pet) G.pet.drawUnder(this, ctx); // Canelo's cushion and bowl at home
      if (G.errands) G.errands.drawUnder(this, ctx); // Lucía's flowers, the picnic blanket, the party ribbons (errands.js)
      const ents = this.npcs.filter(n => n.spec && !n.hidden).concat([this.player]);
      const zoo = G.animals ? G.animals.ents(this) : []; // land animals, drawn in order with the people
      for (const e of ents.concat(zoo).sort((a, b) => (a.sy != null ? a.sy : a.y * T + a.oy) - (b.sy != null ? b.sy : b.y * T + b.oy))) {
        if (e.draw) { e.draw(ctx, cx, cy); continue; }
        if (e.drawSelf && e.drawSelf(ctx, cx, cy)) continue; // Canelo doing a trick, or asleep (pet.js)
        const moving = e.moving || e.ox || e.oy;
        const fr = moving ? Math.floor(this.t / 6) % 2 : Math.floor((this.t + (e.x || 0) * 13) / 24) % 2;
        const img = G.unitSprite(e.spec, e.dir, fr), bob = Math.abs(e.ox + e.oy) >= 6 && Math.abs(e.ox + e.oy) <= 18 ? 1 : 0; // a hop mid-step
        ctx.drawImage(img, Math.round(e.x * T + e.ox - cx), Math.round(e.y * T + e.oy - cy - 3) - bob);
      }
      if (G.ambient) G.ambient.draw(this, ctx, 'air'); // birds in flight, butterflies, the cat
      if (G.animals) G.animals.drawTop(this, ctx); // hearts and splashes
      if (G.pet) G.pet.drawTop(this, ctx); // Canelo's hearts, dust, crumbs; the trick he's learning
      if (G.hearts) G.hearts.drawTop(this, ctx); // a friend's hearts rising
      if (G.day) G.day.drawField(ctx, this, cx, cy); // the sunset (over the critters too), lit windows, the moon over home (day.js)
      // "!" bubbles over people who have something for the player (kids always know where to go next)
      if (G.errands) G.errands.drawTop(this, ctx); // Round B errands: picture bubbles over places to go (errands.js)
      for (const e of ents) {
        const al = e.alert && e.alert(); if (!al) continue;
        G.drawAlert(ctx, al, Math.round(e.x * T + e.ox - cx), Math.round(e.y * T + e.oy - cy), this.t);
      }
      if (G.world) G.world.draw(this, ctx); // the word bubble of a thing just named, and its say-it-back mic
      if (this.banner && G.top() !== this) this.banner.t = Math.min(this.banner.t, 0); // a talk or a card opened over the map: the name has done its job
      if (this.banner && this.banner.t > 0) {
        const a = Math.min(1, this.banner.t / 30), ic = this.banner.icon;
        ctx.globalAlpha = a; const w = G.textWidth(this.banner.text) + 30 + (ic ? 20 : 0);
        G.win(ctx, (G.W - w) / 2, 8, w, 26);
        if (ic) G.drawIcon16(ctx, ic, (G.W - w) / 2 + 12, 13);
        G.textC(ctx, this.banner.text, G.W / 2 + (ic ? 10 : 0), 17, '#f8e060'); ctx.globalAlpha = 1;
      }
      if (!this.locked && G.top() === this) G.iconBtn(ctx, 'menu', ...HUD);
      if (G.errands) G.errands.drawHud(this, ctx); // what you carry, Luna's clipboard (errands.js)
    }
  }
  G.Field = Field;
  // a thought bubble over a person or a place (ex, ey: the top-left of its tile on screen): "!" (al === true) or the
  // picture(s) of what they want (a word id, or a goal like [['manzana', 3]])
  G.drawAlert = function (ctx, al, ex, ey, t) {
    const bob = Math.round(Math.sin(t / 8) * 2);
    if (al === true) {
      G.win(ctx, ex + 7, ey - 16 + bob, 11, 13, { fill1: '#f8f0c0', fill2: '#f8d860', alpha: 1 });
      G.text(ctx, '!', ex + 11, ey - 13 + bob, '#c02020', null);
      return;
    }
    const goal = Array.isArray(al) ? al : [[al, 1]];
    const gw = G.goalWidth(goal);
    const bw = gw + 8, bx = ex + 12 - bw / 2, by = ey - 26 + bob;
    G.win(ctx, bx, by, bw, 22, { fill1: '#ffffff', fill2: '#e8e8f0', alpha: 1 });
    ctx.fillStyle = '#ffffff'; ctx.fillRect(ex + 10, by + 21, 3, 2); ctx.fillRect(ex + 11, by + 23, 1, 1);
    G.drawGoal(ctx, goal, bx + 4, by + 3);
  };
  // found a notebook page: open the notebook right at it
  G.findPage = function* (id) {
    G.audio.jingle('item');
    G.st.findPage(id);
    G.toast('\u0005 ¡Una página! \u0005', 90);
    yield 30;
    yield G.notebook(id);
  };
  G.maps = {};
  G.portraitOf = function (n) {
    if (!n) return null;
    if (n.portrait) return n.portrait;
    if (typeof n === 'string') return n === 'player' ? G.st.playerSpec().portrait : D().npcs[n] ? D().npcs[n].portrait : null;
    if (n.npc && D().npcs[n.npc]) return D().npcs[n.npc].portrait;
    return null;
  };
  G.goto = function (mapId, x, y, dir) {
    const f = new Field(mapId, x, y, dir);
    G.state.loc = { map: mapId, x, y, dir };
    G.replace(f); f.start();
    G.fade.a = 1; G.fadeTo(0, 0.08);
    return f;
  };
})();
