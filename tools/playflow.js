// Playing the whole game by taps, shared by tools/test-playthrough.js (which checks it) and tools/vocab-audit.js (which
// measures the vocabulary on the way). On an iPad-sized touch page from harness.open(browser, name, true):
//   await newGame(g)                    title -> character creator -> name "LUZ" -> free at home after Mamá's intro
//   await playToEnd(g, { beforeStep })  every Round A and Round B errand, the animal party and the diploma, choosing
//                                       what to do next like the hint hand does (people with bubbles, errand places,
//                                       animals to count or find, a trick to practise with Canelo). beforeStep(st, doneN)
//                                       runs before each tap on the map (st: {map, q}, doneN: Round A errands done);
//                                       it returns 'skip' to look again without tapping (it changed something)
//   await settle(g, what)               play scenes (dialogue, questions, cards, the Hoy card, the night, Canelo's
//                                       menu) until the map is free again
//   await nextTap(g)                    where to tap next on the map, or null
// g.hooks.scene(name) (optional) is told about each TodayCard / Night scene settle passes.
'use strict';
const { check } = require('./harness');

// page-side: where to tap next on the map (like hint.js, plus the shrubs for the ball), as a screen point
async function nextTap(g) {
  return g.ev(() => {
    const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), S = G.st, F = G.state.flags;
    const alerting = n => { try { return !!(n.alert && n.alert()); } catch (e) { return false; } };
    const waits = id => { const m = G.maps[id]; return !!m && ((m.npcs || []).some(n => (!n.cond || n.cond()) && alerting(n)) || G.errands.waitsIn(id)); };
    let tgt = null, why = '';
    const take = (x, y, w, kind) => { const d = Math.abs(x - p.x) + Math.abs(y - p.y); if (!tgt || d < tgt.d) { tgt = { x, y, d, kind }; why = w; } };
    for (const n of f.npcs) if (n.spec && !n.hidden && alerting(n)) take(n.x, n.y, 'npc ' + n.id, 'npc');
    for (const t of G.errands.targets(f)) { // errand places, animals to count or find, the cat, Canelo to practise a trick
      const kind = t.npc ? 'npc' : t.animal || t.cat ? 'animal' : 'search';
      const tx = Math.floor(t.x / T), ty = Math.floor(t.y / T), d = Math.abs(tx - p.x) + Math.abs(ty - p.y);
      if (!tgt || d < tgt.d) { tgt = { x: tx, y: ty, d, kind, wx: t.x, wy: t.y, animal: t.animal, cat: t.cat }; why = 'errand ' + (t.spot || t.animal || (t.cat && 'cat') || t.npc); }
    }
    const home = G.day.homeDoor(f); if (home) take(home[0], home[1], 'home door (sunset)', 'exit');
    if (!tgt && f.mapId === 'villa' && S.active('pelota') && !F.pelotaRoja) {
      window.__searched = window.__searched || {};
      for (const k of Object.keys(f.def.searches || {})) if (!window.__searched[k]) { const [x, y] = k.split(',').map(Number); take(x, y, 'shrub ' + k, 'search'); }
    }
    if (!tgt) for (const ex of f.def.exits || []) if (ex.to && (!ex.cond || ex.cond()) && waits(ex.to)) take(ex.x, ex.y, 'door to ' + ex.to, 'exit');
    if (!tgt && f.mapId !== 'villa') for (const ex of f.def.exits || []) if (ex.to === 'villa') take(ex.x, ex.y, 'back to town', 'exit');
    if (!tgt) return null;
    const on = (x, y) => x * T >= cx && (x + 1) * T <= cx + G.W && y * T >= cy + 32 && (y + 1) * T <= cy + G.H;
    if (tgt.kind === 'animal' && on(tgt.x, tgt.y)) return { sx: Math.round(tgt.wx) - cx, sy: Math.round(tgt.wy) - cy, why, tile: [tgt.x, tgt.y], kind: tgt.kind, direct: true, animal: tgt.animal };
    if (on(tgt.x, tgt.y)) return { sx: tgt.x * T + 12 - cx, sy: tgt.y * T + 12 - cy, why, tile: [tgt.x, tgt.y], kind: tgt.kind, direct: true };
    // off screen: the visible plain tile nearest the target
    let best = null;
    for (let y = Math.ceil((cy + 32) / T); (y + 1) * T <= cy + G.H; y++) for (let x = Math.ceil(cx / T); (x + 1) * T <= cx + G.W; x++) {
      const t = f.tapTarget({ x: x * T + 12 - cx, y: y * T + 12 - cy });
      if (t.npc || t.search || t.exit || f.blocked(x, y, p)) continue;
      const d = Math.abs(x - tgt.x) + Math.abs(y - tgt.y);
      if (!best || d < best.d) best = { d, sx: x * T + 12 - cx, sy: y * T + 12 - cy };
    }
    return best && { sx: best.sx, sy: best.sy, why: why + ' (toward)', tile: [tgt.x, tgt.y], kind: tgt.kind, direct: false };
  });
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
  check(g.name + ': intro done, free at home', await g.ev(() => G.state.flags.intro || G.field.mapId === 'casa'));
  await g.shot('home_free');
}

// tap on through the whole game until every badge is earned (the party can come before the 7th errand: play on)
async function playToEnd(g, o = {}) {
  const shotsAt = {}; let lastDone = -1, lastWhy = '', same = 0;
  for (let step = 0; step < 3000; step++) {
    await settle(g, 'step ' + step);
    const st = await g.ev(() => ({ map: G.field.mapId, q: Object.assign({}, G.state.quests), fiesta: G.data.badgeOrder.every(G.st.done) }));
    if (st.fiesta) break;
    const nq = Object.keys(st.q).filter(k => st.q[k] === 'done').length;
    if (nq !== lastDone) { lastDone = nq; console.log('    errands done: ' + Object.keys(st.q).filter(k => st.q[k] === 'done').join(' ') + ' (step ' + step + ')'); }
    if (!shotsAt[st.map]) { shotsAt[st.map] = 1; await g.frames(30); await g.shot('map_' + st.map); }
    const doneN = ['saludos', 'mercado', 'pelota', 'carta'].filter(k => st.q[k] === 'done').length;
    if (o.beforeStep && await o.beforeStep(st, doneN) === 'skip') continue;
    const t = await nextTap(g);
    if (!t) throw new Error('nothing to do on ' + st.map + ' quests ' + JSON.stringify(st.q) + ' ' + await g.ev(() => JSON.stringify({ learning: G.pet.learning(), tricks: G.state.pet.tricks, next: G.pet.next(), dog: !!G.pet.npc(), sofia: G.field.npc('sofia') && G.field.npc('sofia').alert(), lost: G.errands.lost() })));
    if (t.direct && t.kind === 'search') await g.ev(k => { window.__searched[k] = 1; }, t.tile.join(','));
    if (step < 3 || step % 25 === 0) console.log('    tap', t.why, 'on', st.map);
    if (process.env.DBG && t.direct && t.why === lastWhy && ++same > 4) { console.log('    DBG', t.why, JSON.stringify(t), await g.ev(() => JSON.stringify({ q: G.state.quests, p: [G.field.player.x, G.field.player.y], n: G.field.npcs.filter(n => !n.hidden).map(n => n.id + ':' + n.x + ',' + n.y + (n.ghost ? 'g' : '') + ':' + JSON.stringify(n.alert && n.alert())), learning: G.pet.learning(), tricks: G.state.pet.tricks }))); await g.shot('dbg_loop'); if (same > 6) throw new Error('loop'); }
    if (t.why !== lastWhy) same = 0;
    lastWhy = t.why;
    await g.tap(t.sx, t.sy);
    await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
  }
  await settle(g, 'the end');
}

module.exports = { nextTap, settle, newGame, playToEnd };
