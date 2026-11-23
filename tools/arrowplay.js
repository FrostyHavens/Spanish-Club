// Playing one chapter line by going where the guide's arrow points, like a child (the same moves as tools/test-chains.js
// makes, without its counting), for tools/make-old-saves.js (which plays the OLDER game with that game's own harness and
// playflow) and tools/test-resplit.js (which plays the new one). Nothing here knows which copy of the game it drives:
//   const { followArrow } = require('./arrowplay');
//   await followArrow(g, flow, { line: 'villa', until: 'c6', minutes: 10, log: s => console.log(s) })
//     g      a driven page (harness.js Game) of the game to play
//     flow   that game's tools/playflow.js ({ settle, nextTap, toward })
//     line   the chapter line to play ('villa', a zone's id); until: stop once this chapter is done (none: the whole line)
//     stop   (optional) a page-side function arg => true to stop early (looked at when the map is free; stopArg: its arg)
//     each   (optional) async () => {...} called each time the map is free, before the next tap
//   -> { done: [the line's chapters done], stopped: true when `stop` ended it }
// The chapters' own content back to back, as in test-chains: a morning chapter opens at once, the evening comes when a
// chapter waits for it, and the next chapter starts as soon as it may.
'use strict';

// play scenes until the map is free (the world map: tap where its arrow points, or close it)
async function scenes(g, flow, what) {
  const was = g.beforeAct;
  g.beforeAct = async s => {
    if (s.name === 'WorldMap') {
      const a = await g.ev(() => (G.top().arrowAt ? G.top().arrowAt() : null));
      if (a && await g.ev(() => G.top().t > 20)) { await g.tap(a.x, a.y); await g.frames(10); return true; }
      if (!a && await g.ev(() => G.top().t < 40)) { await g.frames(10); return true; }
      return false;
    }
    if (s.name === 'FieldMenu') { await g.tapBtn(await g.ev(() => G.top().closeXY())); return true; }
    return false;
  };
  try { await flow.settle(g, what); } finally { g.beforeAct = was || null; }
}

async function followArrow(g, flow, o = {}) {
  const line = o.line || 'villa', log = o.log || (() => {});
  const ids = await g.ev(([line, until]) => { const L = G.chapters.ids().filter(id => G.chapters.lineOf(id) === line), b = until ? L.indexOf(until) : L.length - 1; return L.slice(0, b < 0 ? L.length : b + 1); }, [line, o.until || null]);
  const tried = {}, t0 = Date.now();
  let idle = 0, last = '', same = 0, lastDone = -1, stopped = false;
  for (let step = 0; step < 3000; step++) {
    await scenes(g, flow, line + ' step ' + step);
    if (o.each) await o.each();
    if (o.stop && await g.ev(o.stop, o.stopArg)) { stopped = true; break; }
    const st = await g.ev(([line, ids]) => {
      const CH = G.chapters, nx = CH.next(line), cur = CH.current(line), a = G.guide.at;
      const b = cur ? CH.beat(cur) : null;
      return { done: ids.filter(CH.done), all: ids.every(CH.done), cur, step: cur ? G.state.ch.step[cur] | 0 : null, eve: !!(b && b.evening), nx, gate: nx && !cur ? CH.gate(nx) : null, map: G.field.mapId, over: G.day.over(),
        a: a && !a.hidden ? { x: a.x, y: a.y, tx: a.tx, ty: a.ty, edge: !!a.edge, why: a.why } : null };
    }, [line, ids]);
    if (st.all) break;
    if (st.done.length !== lastDone) { lastDone = st.done.length; log(line + ': done ' + (st.done.join(' ') || '-') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'); }
    if (Date.now() - t0 > (o.minutes || 15) * 60000) throw new Error(line + ': still not done after ' + (o.minutes || 15) + ' minutes: ' + JSON.stringify(st));
    // a chapter waiting for the morning: the next morning comes at once; for the evening: the sun goes down now
    if (!st.cur && st.gate === 'morning') { await g.ev(() => { G.state.ch.lastDoneSess = null; }); continue; }
    // (or an evening beat of a chapter going on; the sunset is set once, a second from now: set again at every look it
    // would stay a second away)
    if (((!st.cur && st.gate === 'evening') || st.eve) && !st.over) { await g.ev(() => { if (!(G.debug.sunsetAt <= G.sessionTime + 1)) G.debug.sunsetAt = G.sessionTime + 1; }); await g.frames(10); continue; }
    // the next chapter may start: she goes to its giver (the arrow offers the day's other things first)
    if (!st.cur && st.nx && !st.gate && !(await g.ev(nx => { const b = G.chapters.scriptOf(nx).beats[0]; return !!b.auto || !!b.evening; }, st.nx))) { await g.ev(nx => G.chapters.start(nx), st.nx); continue; }
    // where to tap: the guide's goal (a puzzle's choices: the ones not tried yet first), on screen the thing itself, off
    // screen a step toward it; a goal on another map: the arrow at the door or the edge; else the next thing to tap
    // (playflow), else wait a little
    let pt = null;
    const gl = await g.ev(() => {
      const f = G.field, gl = G.guide.goal(f), cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), T = G.TILE;
      if (!gl || !gl.pts || !gl.pts.length || (gl.map && gl.map !== f.mapId)) return null;
      const ts = G.chapters.targets(f); // (an animal to tap: where it is drawn now, it hops about)
      const kind = p => { const t = ts.find(t => t.animal && Math.abs(t.x - p.x) < 3 && Math.abs(t.y - p.y) < 3); return t ? t.animal : null; };
      return { why: gl.why, choice: !!gl.choice, pts: gl.pts.map(p => ({ sx: Math.round(p.x - cx), sy: Math.round(p.y - cy), tile: [Math.floor(p.x / T), Math.floor(p.y / T)], animal: kind(p) })) };
    });
    if (gl) {
      const T = tried[gl.why] || (tried[gl.why] = new Set()), key = p => p.tile.join(',');
      let p = gl.choice ? gl.pts.find(q => !T.has(key(q))) : null;
      if (!p && gl.choice) { T.clear(); p = gl.pts[0]; }
      if (!p) p = gl.pts[0];
      const on = p.sx >= 4 && p.sx <= 316 && p.sy >= 34 && p.sy <= 220;
      if (on) { if (gl.choice) T.add(key(p)); pt = { x: p.sx, y: p.sy, why: gl.why, animal: p.animal }; }
      else { const t = await flow.toward(g, p.tile[0], p.tile[1]); if (t) pt = { x: t.sx, y: t.sy, why: gl.why + ' (toward)' }; }
    }
    if (!pt && st.a) pt = { x: Math.round(st.a.edge ? st.a.x : st.a.tx), y: Math.round(st.a.edge ? st.a.y : st.a.ty), why: st.a.why };
    if (!pt) { const t = await flow.nextTap(g); if (t) pt = { x: t.sx, y: t.sy, why: 'playflow ' + t.why }; }
    if (process.env.DBG && step % 10 === 0) log('[' + step + '] ' + st.map + ' cur ' + st.cur + '@' + st.step + ' next ' + st.nx + ' gate ' + st.gate + ' -> ' + (pt ? pt.why : 'nothing'));
    if (!pt) { if (++idle > 40) throw new Error(line + ': nothing to do: ' + JSON.stringify(st)); await g.frames(30); continue; }
    idle = 0;
    if (pt.why === last && ++same > 25) { // the same goal over and over without the chapter moving: walk next to it the long way (playflow), then on
      const t = await flow.nextTap(g); if (t) await g.tap(t.sx, t.sy); same = 0;
      if (process.env.DBG) log('(same goal: ' + pt.why + ' at ' + pt.x + ',' + pt.y + ')');
    }
    if (pt.why !== last) same = 0;
    last = pt.why;
    // (a word bubble with its say-it-back mic from a tap that named a thing instead: let it go first)
    await g.until(() => !G.world || (!G.world.sayBack && !G.world.bubble), null, 'the word bubble to go', 20000).catch(() => {});
    // an animal of the story hops about: her tap lands on it where it is in that very frame, as field.js reads a tap on
    // an animal (G.animals.tapped: its reaction, the story's beat)
    if (!(pt.animal && await g.ev(k => { const f = G.field, a = G.animals.find(k, f); if (!a || f.locked || G.top() !== f) return false; f.route = G.animals.tapped(f, a); f.plan(f.route); return true; }, pt.animal))) await g.tap(pt.x, pt.y);
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 40000);
    await g.frames(2);
  }
  await scenes(g, flow, line + ' end');
  return { done: await g.ev(ids => ids.filter(G.chapters.done), ids), stopped };
}

// page-side: every script's beats as their triggers ("who:"rosa"", "spot:{...}", "auto:"villa" when"): what a save's step
// number counts. Two copies of the game whose lists differ for a chapter have re-split it (docs/CONTENT.md).
const chapterShapes = () => {
  const o = {}, j = v => (typeof v === 'function' ? 'fn' : JSON.stringify(v, (k, x) => (typeof x === 'function' ? 'fn' : x)));
  for (const id of G.chapters.ids()) {
    const sc = G.chapters.scriptOf(id); if (!sc) continue;
    o[id] = sc.beats.map(b => ['who', 'spot', 'spots', 'tap', 'auto', 'door', 'evening'].filter(k => b[k] != null).map(k => k + ':' + j(b[k])).join(' ') + (b.when ? ' when' : ''));
  }
  return o;
};

module.exports = { followArrow, scenes, chapterShapes };
