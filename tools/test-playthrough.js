// Full tap-only playthrough on an iPad context: new game -> intro -> every errand -> sunset/evening -> fiesta -> diploma,
// with a reload midway to confirm autosave. Taps only, choosing what to do next like the hint hand does.
//   NODE_PATH=$(npm root -g) node tools/test-playthrough.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// page-side: where to tap next on the map (like hint.js, plus the shrubs for the ball), as a screen point
async function nextTap(g) {
  return g.ev(() => {
    const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), S = G.st, F = G.state.flags;
    const alerting = n => { try { return !!(n.alert && n.alert()); } catch (e) { return false; } };
    const waits = id => { const m = G.maps[id]; return !!m && (m.npcs || []).some(n => (!n.cond || n.cond()) && alerting(n)); };
    let tgt = null, why = '';
    const take = (x, y, w, kind) => { const d = Math.abs(x - p.x) + Math.abs(y - p.y); if (!tgt || d < tgt.d) { tgt = { x, y, d, kind }; why = w; } };
    for (const n of f.npcs) if (n.spec && !n.hidden && alerting(n)) take(n.x, n.y, 'npc ' + n.id, 'npc');
    const home = G.day.homeDoor(f); if (home) take(home[0], home[1], 'home door (sunset)', 'exit');
    if (!tgt && f.mapId === 'villa' && S.active('pelota') && !F.pelotaRoja) {
      window.__searched = window.__searched || {};
      for (const k of Object.keys(f.def.searches || {})) if (!window.__searched[k]) { const [x, y] = k.split(',').map(Number); take(x, y, 'shrub ' + k, 'search'); }
    }
    if (!tgt) for (const ex of f.def.exits || []) if (ex.to && (!ex.cond || ex.cond()) && waits(ex.to)) take(ex.x, ex.y, 'door to ' + ex.to, 'exit');
    if (!tgt && f.mapId !== 'villa') for (const ex of f.def.exits || []) if (ex.to === 'villa') take(ex.x, ex.y, 'back to town', 'exit');
    if (!tgt) return null;
    const on = (x, y) => x * T >= cx && (x + 1) * T <= cx + G.W && y * T >= cy + 32 && (y + 1) * T <= cy + G.H;
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
  for (let i = 0; i < 400; i++) {
    const s = await g.ev(() => ({ n: G.top().constructor.name, free: G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, hint: !!G.top().hintXY, t: G.top().t }));
    if (s.free) return;
    if (s.n === 'TodayCard') { if (!g.seen.has('TodayCard')) { await g.frames(150); await g.shot('hoy'); g.seen.add('TodayCard'); } await g.tap(160, 200); continue; }
    if (s.n === 'Night') { if (!g.seen.has('Night')) { await g.frames(60); await g.shot('night'); g.seen.add('Night'); } await g.frames(10); continue; }
    if (s.n === 'Field') { await g.frames(4); continue; }
    if (s.n === 'Diploma' && !g.seen.has('Diploma')) { await g.frames(80); await g.shot('diploma'); }
    await g.drive(() => { const t = G.top(); return t === G.field || ['TodayCard', 'Night'].includes(t.constructor.name); }, what);
  }
  throw new Error('never settled: ' + what);
}

run('Full tap playthrough (iPad)', async browser => {
  let { ctx, g } = await open(browser, 'play', true);
  try {
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
    check('play: intro done, free at home', await g.ev(() => G.state.flags.intro || G.field.mapId === 'casa'));
    await g.shot('home_free');

    const shotsAt = {}; let reloaded = false, sunset = false;
    for (let step = 0; step < 400; step++) {
      await settle(g, 'step ' + step);
      const st = await g.ev(() => ({ map: G.field.mapId, q: Object.assign({}, G.state.quests), fiesta: G.st.done('fiesta') }));
      if (st.fiesta) break;
      if (!shotsAt[st.map]) { shotsAt[st.map] = 1; await g.frames(30); await g.shot('map_' + st.map); }
      const doneN = ['saludos', 'mercado', 'pelota', 'carta'].filter(k => st.q[k] === 'done').length;
      // reload midway: after two errands, on the map
      if (doneN >= 2 && !reloaded) {
        reloaded = true;
        const before = await g.ev(() => ({ map: G.field.mapId, x: G.field.player.x, y: G.field.player.y, q: JSON.stringify(G.state.quests), stars: G.state.stars, name: G.state.name }));
        await g.page.reload();
        await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
        await g.tap(160, 180);
        await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
        await g.frames(20); await g.shot('slots_after_reload');
        await g.tapRect(await g.ev(() => G.top().cardRect(0)));
        await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
        const after = await g.ev(() => ({ map: G.field.mapId, x: G.field.player.x, y: G.field.player.y, q: JSON.stringify(G.state.quests), stars: G.state.stars, name: G.state.name }));
        check('play: autosave survived a reload mid-game (same errands, stars, map; spot within 3 tiles)', before.q === after.q && before.stars === after.stars && before.name === after.name && before.map === after.map && Math.abs(before.x - after.x) + Math.abs(before.y - after.y) <= 3, JSON.stringify({ before, after }));
        await g.shot('resumed');
        continue;
      }
      // after three errands, bring the sunset forward and go home for the evening
      if (doneN >= 3 && !sunset) { sunset = true; await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; }); await g.frames(500); await g.shot('sunset'); }
      if (sunset && st.map === 'casa' && await g.ev(() => G.sessionTime < 30 && G.debug.sunsetAt != null)) {
        await g.ev(() => { G.debug.sunsetAt = null; });
        check('play: the evening ran (Hoy card, night, a new morning) and the game was saved', g.seen.has('TodayCard') && g.seen.has('Night') && await g.ev(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1') || 'null'); return !!s && s.loc && s.loc.map === 'casa'; }));
      }
      const t = await nextTap(g);
      if (!t) throw new Error('nothing to do on ' + st.map + ' quests ' + JSON.stringify(st.q));
      if (t.direct && t.kind === 'search') await g.ev(k => { window.__searched[k] = 1; }, t.tile.join(','));
      if (step < 3 || step % 7 === 0) console.log('    tap', t.why, 'on', st.map);
      await g.tap(t.sx, t.sy);
      await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
    }
    await settle(g, 'the end');
    check('play: the fiesta is done', await g.ev(() => G.st.done('fiesta')));
    check('play: diploma seen', g.seen.has('Diploma'));
    await g.frames(30); await g.shot('end');
    check('play: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
