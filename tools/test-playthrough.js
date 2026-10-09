// Full tap-only playthrough on an iPad context: new game -> intro -> the Round A errands -> Canelo -> all eight Round B
// errands (src/errands.js) -> sunset/evening -> the animal party -> diploma, with a reload midway to confirm autosave.
// Taps only, choosing what to do next like the hint hand does (people with bubbles, errand places, animals to count or
// find, a trick to practise with Canelo).
//   NODE_PATH=$(npm root -g) node tools/test-playthrough.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');
const { newGame, playToEnd } = require('./playflow'); // the tap-by-tap play itself (shared with tools/vocab-audit.js)

run('Full tap playthrough (iPad)', async browser => {
  let { ctx, g } = await open(browser, 'play', true);
  try {
    await newGame(g);
    let reloaded = false, sunset = false;
    await playToEnd(g, { beforeStep: async (st, doneN) => {
      // reload midway: after two errands, on the map
      if (doneN >= 2 && !reloaded) {
        reloaded = true;
        const before = await g.ev(() => ({ map: G.field.mapId, x: G.field.player.x, y: G.field.player.y, q: JSON.stringify(G.state.quests), stars: G.state.stars, name: G.state.name, home: G.field.npcs.some(n => n.home && n.home[0] === G.field.player.x && n.home[1] === G.field.player.y) }));
        await g.page.reload();
        await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
        await g.tap(160, 180);
        await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
        await g.frames(20); await g.shot('slots_after_reload');
        await g.tapRect(await g.ev(() => G.top().cardRect(0)));
        await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
        const after = await g.ev(() => ({ map: G.field.mapId, x: G.field.player.x, y: G.field.player.y, q: JSON.stringify(G.state.quests), stars: G.state.stars, name: G.state.name }));
        check('play: autosave survived a reload mid-game (same errands, stars, map; spot within 3 tiles, unless it was someone\'s own spot, which is never saved)', before.q === after.q && before.stars === after.stars && before.name === after.name && before.map === after.map && (Math.abs(before.x - after.x) + Math.abs(before.y - after.y) <= 3 || before.home), JSON.stringify({ before, after }));
        await g.shot('resumed');
        return 'skip';
      }
      // after three errands, bring the sunset forward and go home for the evening
      if (doneN >= 3 && !sunset) { sunset = true; await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; }); await g.frames(500); await g.shot('sunset'); }
      if (sunset && st.map === 'casa' && await g.ev(() => G.sessionTime < 30 && G.debug.sunsetAt != null)) {
        await g.ev(() => { G.debug.sunsetAt = null; });
        check('play: the evening ran (Hoy card, night, a new morning) and the game was saved', g.seen.has('TodayCard') && g.seen.has('Night') && await g.ev(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1') || 'null'); return !!s && s.loc && s.loc.map === 'casa'; }));
      }
    } });
    check('play: every errand is done, Round A and Round B, and the animal party', await g.ev(() => G.data.badgeOrder.every(G.st.done)), await g.ev(() => JSON.stringify(G.state.quests)));
    check('play: diploma seen', g.seen.has('Diploma'));
    await g.frames(30); await g.shot('end');
    check('play: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
