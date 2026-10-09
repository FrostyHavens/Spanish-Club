// Playing the whole game by taps, shared by tools/test-playthrough.js (which checks it) and tools/vocab-audit.js (which
// measures the vocabulary on the way). On an iPad-sized touch page from harness.open(browser, name, true):
//   await newGame(g)                    title -> character creator -> name "LUZ" -> chapter 1 starts at home and plays
//                                       until its first find-it puzzle (the puppy hiding)
//   await playToEnd(g, { beforeStep, nextDay })  every chapter written (src/chapters.js) and the older errands after
//                                       them, the animal party and the diploma, choosing what to do next like the hint
//                                       hand does (people with bubbles, a chapter's places and puzzles, errand places,
//                                       animals to count or find, a trick to practise with Canelo). beforeStep(st, doneN)
//                                       runs before each tap on the map (st: {map, q}, doneN: chapters done); it returns
//                                       'skip' to look again without tapping (it changed something). When there is
//                                       nothing left to do today (the next chapter opens tomorrow), nextDay() is called
//                                       (default: the game is saved, closed and continued on the next calendar day)
//   await nextDay(g)                    that: save, close to the title, G.debug.dayShift + 1, continue slot 1
//   await settle(g, what)               play scenes (dialogue, questions, cards, the Hoy card, the night, Canelo's
//                                       menu) until the map is free again
//   await nextTap(g)                    where to tap next on the map, or null
//   await toward(g, x, y)               a screen point that walks toward tile x, y (the tile, or the nearest visible one)
// g.hooks.scene(name) (optional) is told about each TodayCard / Night scene settle passes.
'use strict';
const { check } = require('./harness');

// page-side helper: walking distance from every tile to tile (tx, ty) (a breadth-first search over ground that isn't a
// wall or water; people don't count) -> dist(x, y), Infinity where unreachable
const WALK_DIST = () => {
  window.__walkDist = function (f, tx, ty) {
    const W = f.map.w, H = f.map.h, D = new Float64Array(W * H).fill(Infinity), q = [];
    const free = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return false; const t = G.TERRAIN[f.map.get(x, y)] || G.TERRAIN['.']; return !(t.block || t.wall) || !!f.exitAt(x, y); };
    D[ty * W + tx] = 0; q.push([tx, ty]);
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], d = D[y * W + x];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || D[ny * W + nx] !== Infinity) continue; if (!free(nx, ny) && !(i === 0)) continue; D[ny * W + nx] = d + 1; if (free(nx, ny)) q.push([nx, ny]); }
    }
    return (x, y) => D[y * W + x];
  };
};
// page-side: where to tap next on the map (like hint.js), as a screen point
async function nextTap(g) {
  await g.ev(`(${WALK_DIST})()`);
  return g.ev(() => {
    const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), S = G.st, F = G.state.flags;
    const alerting = n => { try { const a = n.alert && n.alert(); return !!a && !a.wait; } catch (e) { return false; } }; // (a "tomorrow" bubble: nothing to do today)
    const waits = id => { const m = G.maps[id]; return !!m && ((m.npcs || []).some(n => (!n.cond || n.cond()) && alerting(n)) || G.errands.waitsIn(id)); };
    let tgt = null, why = '';
    const take = (x, y, w, kind) => { const d = Math.abs(x - p.x) + Math.abs(y - p.y); if (!tgt || d < tgt.d) { tgt = { x, y, d, kind }; why = w; } };
    for (const n of f.npcs) if (n.spec && !n.hidden && alerting(n)) take(n.x, n.y, 'npc ' + n.id, 'npc');
    for (const t of G.intro.targets(f)) take(Math.floor(t.x / T), Math.floor(t.y / T), 'find ' + t.find, 'search'); // a find-it puzzle (intro.js)
    for (const t of G.errands.targets(f)) { // errand places, animals to count or find, the cat, Canelo to practise a trick
      const kind = t.npc ? 'npc' : t.animal || t.cat ? 'animal' : 'search';
      const tx = Math.floor(t.x / T), ty = Math.floor(t.y / T), d = Math.abs(tx - p.x) + Math.abs(ty - p.y);
      if (!tgt || d < tgt.d) { tgt = { x: tx, y: ty, d, kind, wx: t.x, wy: t.y, animal: t.animal, cat: t.cat }; why = 'errand ' + (t.spot || t.animal || (t.cat && 'cat') || t.npc); }
    }
    const home = G.day.homeDoor(f); if (home) take(home[0], home[1], 'home door (sunset)', 'exit');
    if (!tgt) for (const ex of f.def.exits || []) if (ex.to && (!ex.cond || ex.cond()) && waits(ex.to)) take(ex.x, ex.y, 'door to ' + ex.to, 'exit');
    if (!tgt && f.mapId !== 'villa') for (const ex of f.def.exits || []) if (ex.to === 'villa') take(ex.x, ex.y, 'back to town', 'exit');
    if (!tgt) return null;
    const on = (x, y) => x * T >= cx && (x + 1) * T <= cx + G.W && y * T >= cy + 32 && (y + 1) * T <= cy + G.H;
    if (tgt.kind === 'animal' && on(tgt.x, tgt.y)) return { sx: Math.round(tgt.wx) - cx, sy: Math.round(tgt.wy) - cy, why, tile: [tgt.x, tgt.y], kind: tgt.kind, direct: true, animal: tgt.animal };
    if (on(tgt.x, tgt.y)) return { sx: tgt.x * T + 12 - cx, sy: tgt.y * T + 12 - cy, why, tile: [tgt.x, tgt.y], kind: tgt.kind, direct: true };
    // off screen: the visible plain tile nearest the target by walking (window.__walkDist), not the player's own
    const dist = window.__walkDist(f, tgt.x, tgt.y);
    let best = null;
    for (let y = Math.ceil((cy + 32) / T); (y + 1) * T <= cy + G.H; y++) for (let x = Math.ceil(cx / T); (x + 1) * T <= cx + G.W; x++) {
      const t = f.tapTarget({ x: x * T + 12 - cx, y: y * T + 12 - cy });
      if (t.npc || t.search || t.exit || f.blocked(x, y, p) || (x === p.x && y === p.y)) continue;
      const d = dist(x, y);
      if (!best || d < best.d) best = { d, sx: x * T + 12 - cx, sy: y * T + 12 - cy };
    }
    return best && { sx: best.sx, sy: best.sy, why: why + ' (toward)', tile: [tgt.x, tgt.y], kind: tgt.kind, direct: false };
  });
}

// page-side: a screen point to tap to get to tile x, y on this map: the tile itself when it's on screen, else the visible
// plain tile nearest it (or null)
async function toward(g, x, y) {
  await g.ev(`(${WALK_DIST})()`);
  return g.ev(([x, y]) => {
    const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (x * T >= cx && (x + 1) * T <= cx + G.W && y * T >= cy + 32 && (y + 1) * T <= cy + G.H) return { sx: x * T + 12 - cx, sy: y * T + 12 - cy, direct: true };
    const dist = window.__walkDist(f, x, y);
    let best = null;
    for (let ty = Math.ceil((cy + 32) / T); (ty + 1) * T <= cy + G.H; ty++) for (let tx = Math.ceil(cx / T); (tx + 1) * T <= cx + G.W; tx++) {
      const t = f.tapTarget({ x: tx * T + 12 - cx, y: ty * T + 12 - cy });
      if (t.npc || t.search || t.exit || f.blocked(tx, ty, p) || (tx === p.x && ty === p.y)) continue;
      const d = dist(tx, ty);
      if (!best || d < best.d) best = { d, sx: tx * T + 12 - cx, sy: ty * T + 12 - cy, direct: false };
    }
    return best;
  }, [x, y]);
}

// play scenes until the map is free, also handling the scenes Game.drive doesn't know (the Hoy card)
async function settle(g, what) {
  const hook = name => g.hooks && g.hooks.scene ? g.hooks.scene(name) : null;
  for (let i = 0; i < 400; i++) {
    const s = await g.ev(() => ({ n: G.top().constructor.name, free: G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, hint: !!G.top().hintXY, t: G.top().t }));
    if (s.free) return;
    if (s.n === 'TodayCard') { await hook('TodayCard'); if (!g.seen.has('TodayCard')) { await g.frames(150); await g.shot('hoy'); g.seen.add('TodayCard'); } await g.tap(160, 200); continue; }
    if (s.n === 'Night') { await hook('Night'); if (!g.seen.has('Night')) { await g.frames(60); await g.shot('night'); g.seen.add('Night'); } await g.frames(10); continue; }
    if (s.n === 'Field') { await g.frames(4); continue; }
    if (s.n === 'PetMenu') { // Canelo's menu: practise the trick he's learning (the dog show needs it), else close it
      const r = await g.ev(() => { const m = G.top(), k = m.cards().findIndex(c => c.st === 'learn'); return m.t > 12 ? (k >= 0 ? m.rect(k) : { close: m.closeXY() }) : null; });
      if (!r) { await g.frames(4); continue; }
      if (r.close) { await g.tapBtn(r.close); continue; }
      await g.tapRect(r);
      await g.drive(() => G.top().constructor.name === 'PetMenu' || (G.top() === G.field && !G.field.locked), 'practising a trick');
      continue;
    }
    if (s.n === 'Diploma' && !g.seen.has('Diploma')) { await g.frames(80); await g.shot('diploma'); }
    await g.drive(() => { const t = G.top(); return t === G.field || ['TodayCard', 'Night', 'PetMenu'].includes(t.constructor.name); }, what);
  }
  throw new Error('never settled: ' + what);
}

// title -> creator (girl, a few looks) -> name LUZ -> Mamá's intro, free at home
async function newGame(g) {
  await g.shot('title');
  await g.toCreator();
  await g.frames(10); await g.shot('creator');
  const tapOpt = async (r, k) => g.tapRect(await g.ev(([r, k]) => G.top().optRects(r)[k], [r, k]));
  await tapOpt(0, 1); await tapOpt(2, 2); await tapOpt(4, 3);
  await tapOpt(5, 1); // ✓
  await g.until(() => G.top().constructor.name === 'NameEntry' && G.top().t > 6, null, 'the name screen');
  const tapLetter = async ch => g.tapRect(await g.ev(ch => { const s = G.top(); for (let r = 0; r < s.grid.length; r++) { const c = s.grid[r].indexOf(ch); if (c >= 0) return s.cellRect(r, c); } }, ch));
  for (const ch of ['L', 'U', 'Z']) await tapLetter(ch);
  await g.frames(10); await g.shot('name');
  await tapLetter('OK');
  await g.until(() => G.field && G.field.mapId === 'casa', null, 'the house');
  await settle(g, 'the intro');
  check(g.name + ': chapter 1 begun, free at home (the puppy is hiding)', await g.ev(() => G.chapters.active('c1') && G.field.mapId === 'casa'));
  await g.shot('home_free');
}

// the next calendar day: saved, closed to the title, the date moved on, continued (a child coming back tomorrow)
async function nextDay(g) {
  await g.ev(() => { G.st.saveNow(); G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.toTitle(); });
  await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.tap(160, 180);
  await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
}

// tap on through the whole game until every badge is earned (the party can come before the last errand: play on)
async function playToEnd(g, o = {}) {
  const shotsAt = {}; let lastDone = -1, lastWhy = '', same = 0, idle = 0, days = 0;
  for (let step = 0; step < 4000; step++) {
    await settle(g, 'step ' + step);
    await g.ev(() => { if (window.__fastSun && G.sessionTime < 10) { G.debug.sunsetAt = null; window.__fastSun = false; } }); // (a new morning)
    const st = await g.ev(() => ({ map: G.field.mapId, q: Object.assign({}, G.state.quests), fiesta: G.data.badgeOrder.every(G.st.done) }));
    if (st.fiesta) { if (process.env.DBG) console.log('    the end: every badge'); break; }
    const nq = Object.keys(st.q).filter(k => st.q[k] === 'done').length;
    if (nq !== lastDone) { lastDone = nq; console.log('    done: ' + Object.keys(st.q).filter(k => st.q[k] === 'done').join(' ') + ' (step ' + step + ', day ' + (await g.ev(() => G.words.day())) + ')'); }
    if (!shotsAt[st.map]) { shotsAt[st.map] = 1; await g.frames(30); await g.shot('map_' + st.map); }
    const doneN = Object.keys(st.q).filter(k => /^c\d+$/.test(k) && st.q[k] === 'done').length;
    if (o.beforeStep && await o.beforeStep(st, doneN) === 'skip') continue;
    const t = await nextTap(g);
    if (!t) { // nothing to do today: tomorrow (a few tries on the map first: a person may be walking into view)
      if (++idle < 3) { await g.frames(60); continue; }
      if (await g.ev(() => !!(G.day.brought && G.day.brought() && !G.day.over()))) { // an evening chapter: the sun is going down soon
        if (o.fastSunset) await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; window.__fastSun = true; }); // (back to normal after the night: below)
        console.log('    waiting for the sunset (an evening chapter)');
        await g.until(() => G.day.over(), null, 'the sunset', 15 * 60 * 1000); idle = 0; continue;
      }
      if (await g.ev(() => { const n = G.chapters.next(); return !!n && G.chapters.gate(n) === 'soon'; })) { // the next chapter opens in a few minutes of play: play on (faster)
        console.log('    the next chapter in a few minutes');
        await g.ev(() => { window.__sm = G.speedMul; G.speedMul = Math.max(G.speedMul, 8); });
        await g.until(() => { const n = G.chapters.next(); return !n || G.chapters.gate(n) !== 'soon' || G.top() !== G.field; }, null, 'the next chapter to open', 10 * 60 * 1000);
        await g.ev(() => { G.speedMul = window.__sm; });
        idle = 0; continue;
      }
      idle = 0;
      if (++days > 60) throw new Error('more than 60 days and still not done: ' + JSON.stringify(st.q));
      const why = await g.ev(() => { const n = G.chapters.next(); const C = G.chapters, b = ' [new today ' + C.newToday() + ', on the date ' + C.newOnDate() + ', only met ' + C.stage1() + ']'; return (n ? n + ':' + C.gate(n) : 'tail ' + C.tailGate()) + b; });
      console.log('    nothing more today (' + why + '): the next day');
      if (o.nextDay) await o.nextDay(); else await nextDay(g);
      continue;
    }
    idle = 0;
    if (step < 3 || step % 25 === 0) console.log('    tap', t.why, 'on', st.map);
    if (process.env.DBG && t.direct && t.why === lastWhy && ++same > 4) { console.log('    DBG', t.why, JSON.stringify(t), await g.ev(() => JSON.stringify({ q: G.state.quests, p: [G.field.player.x, G.field.player.y], n: G.field.npcs.filter(n => !n.hidden).map(n => n.id + ':' + n.x + ',' + n.y + (n.ghost ? 'g' : '') + ':' + JSON.stringify(n.alert && n.alert())), learning: G.pet.learning(), tricks: G.state.pet.tricks }))); await g.shot('dbg_loop'); if (same > 6) throw new Error('loop'); }
    if (t.why !== lastWhy) same = 0;
    lastWhy = t.why;
    await g.tap(t.sx, t.sy);
    await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
  }
  await settle(g, 'the end');
}

module.exports = { nextTap, settle, newGame, playToEnd, toward, nextDay };
