// A "naive bot": plays the map like a 7-year-old who can't read Spanish (docs/INTUITIVE_AUDIT.md). On the map it only
// taps what is VISIBLY calling for a tap on the screen right now:
//   guide   the guide's bouncing arrow over the goal, or its arrow at the screen's edge (src/guide.js)
//   hand    the hint hand (src/hint.js, after a few seconds of doing nothing)
//   bubble  a picture or "!" bubble over a person or a place (not a "tomorrow" sun / moon), the moon over home at sunset
//   peek    an animal peeking out in hide-and-seek
//   spark   a twinkling page-puzzle sparkle
// With nothing like that on screen it wanders (taps a random spot a few tiles away), stands about, wanders again, the
// way a child does; the seconds spent like that are counted (game time, 60 frames a second). Dialogue, questions and
// cards are played by harness.drive (a question's right card: the audit is about the map, not the words).
//   const bot = new NaiveBot(g, { log, shot })
//   await bot.free(limitSec)  -> {cue, idle, wander} until the bot tapped a cue that started something (a scene, or a thing
//                             picked up or put down, src/carry.js: {picked: true}) (or the limit)
// Used by tools/audit-intuitive.js and tools/test-guide.js.
'use strict';
const path = require('path'), fs = require('fs');

// page-side: what is calling for a tap on screen now (screen px), most obvious first
const CUES = () => {
  const f = G.field, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), out = [];
  const on = (x, y) => x >= 4 && x <= G.W - 4 && y >= 30 && y <= G.H - 4;
  const alerting = n => { try { const a = n.alert && n.alert(); return !!a && !a.wait ? a : null; } catch (e) { return null; } };
  if (G.guide && G.guide.at && !G.guide.at.hidden) { const a = G.guide.at; for (const p of a.marks || [a]) out.push({ kind: 'guide', x: p.tx != null ? p.tx : p.x, y: p.ty != null ? p.ty : p.y, edge: !!a.edge, what: (a.why || '') + '@' + Math.round(p.tx / 12) + ',' + Math.round(p.ty / 12) }); }
  if (G.hint.at && G.hint.at.y != null) out.push({ kind: 'hand', x: G.hint.at.x, y: G.hint.at.y - (G.hint.at.edge ? 0 : 0), edge: !!G.hint.at.edge, what: 'hand' });
  for (const n of f.npcs) { if (!n.spec || n.hidden) continue; const a = alerting(n); if (!a) continue; const x = n.x * T + (n.ox || 0) + 12 - cx, y = n.y * T + (n.oy || 0) + 12 - cy; if (on(x, y)) out.push({ kind: 'bubble', x, y, what: n.id + ':' + (typeof a === 'object' ? a.icon || 'list' : a) }); }
  try { // a chapter's place with a picture bubble
    const L = G.chapters.live();
    if (L && L.b) for (const sp of (L.b.spots || (L.b.spot ? [L.b.spot] : []))) if (sp.map === f.mapId && !sp.quiet && sp.icon) { const x = sp.at[0] * T + 12 - cx, y = sp.at[1] * T + 12 - cy; if (on(x, y)) out.push({ kind: 'bubble', x, y, what: 'spot' }); }
  } catch (e) { /* (no chapter) */ }
  for (const sp of G.errands.spots(f)) if (!sp.quiet) { const x = sp.at[0] * T + 12 - cx, y = sp.at[1] * T + 12 - cy; if (on(x, y)) out.push({ kind: 'bubble', x, y, what: 'job:' + sp.id }); }
  const F = (G.state.finds || {}); for (const id in F) { const s = F[id]; if (s.found || s.map !== f.mapId || !s.pics) continue; for (const [px, py] of s.pics) { const x = px * T + 12 - cx, y = py * T + 12 - cy; if (on(x, y)) out.push({ kind: 'bubble', x, y, what: 'find:' + id }); } }
  const home = G.day.homeDoor(f); if (home) { const x = home[0] * T + 12 - cx, y = home[1] * T + 12 - cy; if (on(x, y)) out.push({ kind: 'bubble', x, y, what: 'moon' }); }
  if (G.seek && G.seek.active()) for (const h of G.state.seek.list) { if (h.found) continue; const sp = G.seek.SPOTS.find(s => s.id === h.spot); if (sp.map !== f.mapId) continue; const r = G.seek.where(h, f); if (on(r.x + r.w / 2, r.y + r.h / 2)) out.push({ kind: 'peek', x: r.x + r.w / 2, y: r.y + r.h / 2, what: 'seek:' + h.kind }); }
  for (const k in f.def.pages || {}) { if (!G.pages.ready(f.def.pages[k])) continue; const [px, py] = k.split(',').map(Number), x = px * T + 12 - cx, y = py * T + 12 - cy; if (on(x, y)) out.push({ kind: 'spark', x, y, what: 'page' }); }
  return out;
};
const RANK = { guide: 0, hand: 1, bubble: 2, peek: 3, spark: 4 };

class NaiveBot {
  constructor(g, o = {}) {
    this.g = g; this.o = o; this.tried = new Map(); // cue key -> times tapped since the story last moved on
    this.prog = null;
    this.total = { cueSec: 0, idleSec: 0, wanderSec: 0, wanders: 0, taps: 0 };
  }
  // the page is free to walk (no scene, no walk going on)
  isFree() { return this.g.ev(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route); }
  cues() { return this.g.ev(`(${CUES})()`); }
  // the story moved on, or (between chapters) the day's play did (src/carry.js: a fetch, a present given, something
  // picked up); during a chapter only the story counts, so a fun loop (throwing the ball at the dog) isn't progress
  progress() { return this.g.ev(() => JSON.stringify([G.state.quests, G.state.ch && G.state.ch.step, G.state.finds && Object.keys(G.state.finds).map(k => G.state.finds[k].found), G.state.seek && G.state.seek.list && G.state.seek.list.map(h => h.found), G.field.mapId].concat(G.chapters.current() ? [] : [G.state.bag && G.state.bag.play, G.state.bag && G.state.bag.items, G.state.hearts]))); }
  sig() { return this.g.ev(() => JSON.stringify([G.state.quests, G.state.ch && G.state.ch.step, Object.keys(G.state.words).length, G.field.mapId, G.state.stars, G.state.seek && G.state.seek.list && G.state.seek.list.map(h => h.found), G.state.finds && Object.keys(G.state.finds).map(k => G.state.finds[k].found)])); }
  // what's in your hands and lying about (src/carry.js: picking something up is something happening, though no scene)
  hands() { return this.g.ev(() => JSON.stringify([G.state.bag && G.state.bag.items, G.state.bag && G.state.bag.ground && G.state.bag.ground.length])); }
  async gameSec() { return (await this.g.ev(() => G.frame)) / 60; }
  // wait for a walk (or what it started) to end
  async settleWalk() { await this.g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 40000); }
  // a random walkable spot 2-6 tiles from the player, on screen
  wanderSpot() {
    return this.g.ev(() => {
      const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), L = [];
      for (let y = p.y - 6; y <= p.y + 6; y++) for (let x = p.x - 6; x <= p.x + 6; x++) {
        const d = Math.abs(x - p.x) + Math.abs(y - p.y), sx = x * T + 12 - cx, sy = y * T + 12 - cy;
        if (d < 2 || d > 6 || sx < 8 || sx > G.W - 30 || sy < 34 || sy > G.H - 8 || f.blocked(x, y, p) || f.exitAt(x, y)) continue;
        const t = f.tapTarget({ x: sx, y: sy }); if (t.npc || t.exit || t.search) continue;
        L.push([sx, sy]);
      }
      return L.length ? L[Math.floor(Math.random() * L.length)] : null;
    });
  }
  // free on the map: look, wander, stand about, until a cue's tap starts something. -> what happened
  async free(limitSec = 90) {
    const g = this.g, t0 = await this.gameSec(), sig0 = await this.sig(), pr = await this.progress();
    if (pr !== this.prog) { this.prog = pr; this.tried.clear(); } // (the story moved on: every cue is worth a try again)
    let wanders = 0, idleSec = 0, wanderSec = 0, phase = 0;
    while (true) {
      const now = await this.gameSec();
      if (now - t0 > limitSec) { this.total.idleSec += idleSec; this.total.wanderSec += wanderSec; return { cue: null, sec: now - t0, idleSec, wanderSec, wanders, stuck: true }; }
      if (!(await this.isFree())) return { cue: 'scene', sec: now - t0, idleSec, wanderSec, wanders };
      const n = c => this.tried.get(c.kind + c.what) || 0;
      const cs = (await this.cues()).filter(c => c.edge || n(c) < 3).sort((a, b) => (n(a) - n(b)) * 10 + RANK[a.kind] - RANK[b.kind]); // (most obvious first; one tapped already, after the others)
      if (cs.length) {
        const c = cs[0];
        if (this.o.onCue) await this.o.onCue(c, now - t0);
        this.total.taps++;
        const h0 = await this.hands();
        await g.tap(Math.round(c.x), Math.round(c.y));
        await this.settleWalk();
        await g.frames(6);
        if (!c.edge) this.tried.set(c.kind + c.what, n(c) + 1);
        if (!(await this.isFree()) || (await this.hands()) !== h0) { const sec = (await this.gameSec()) - t0; this.total.cueSec += sec; this.total.idleSec += idleSec; this.total.wanderSec += wanderSec; return { cue: c.kind, what: c.what, sec, idleSec, wanderSec, wanders, picked: await this.isFree() }; }
        continue;
      }
      // nothing calling: wander twice (a few tiles, a short look around), then stand about for a while
      if (phase < 2) {
        const s = await this.wanderSpot(), a = await this.gameSec();
        if (s) { await g.tap(s[0], s[1]); await this.settleWalk(); wanders++; }
        await this.watch(150); // (2.5 s looking around)
        wanderSec += (await this.gameSec()) - a; phase++;
      } else {
        const a = await this.gameSec();
        await this.watch(480); // (8 s standing about: long enough for the hint hand)
        idleSec += (await this.gameSec()) - a; phase = 0;
      }
    }
  }
  // stand still for n frames, but stop as soon as a cue shows or a scene starts
  async watch(n) {
    const g = this.g, end = (await g.ev(() => G.frame)) + n;
    while ((await g.ev(() => G.frame)) < end) {
      await g.frames(15);
      if (!(await this.isFree())) return;
      if ((await this.cues()).some(c => c.edge || (this.tried.get(c.kind + c.what) || 0) < 3)) return;
    }
  }
}

// the canvas at 2x, as a small PNG (game pixels, no page around it)
async function canvasShot(g, file) {
  const url = await g.ev(() => { const c = document.createElement('canvas'); c.width = G.W * 2; c.height = G.H * 2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(G.canvas, 0, 0, c.width, c.height); return c.toDataURL('image/png'); });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}

module.exports = { NaiveBot, CUES, canvasShot };
