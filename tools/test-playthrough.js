// Full tap-only playthrough on an iPad context: new game -> chapters 1-10 (src/chapters.js, content/es/story-c01-c10.js)
// over several days (the next chapter waits for tomorrow when the day's new words are used up) -> the older errands
// after them (src/errands.js) -> sunset/evening -> the animal party -> diploma, with a reload midway to confirm
// autosave. Taps only, choosing what to do next like the hint hand does (people with bubbles, a chapter's places and
// puzzles, errand places, animals to count or find, a trick to practise with Canelo).
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
        const ds = await g.ev(() => G.debug.dayShift || 0); // (the test's moved date: a reload forgets it)
        await g.page.reload();
        await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
        await g.ev(ds => { G.debug.dayShift = ds; }, ds);
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
      // the evening (chapter 9 brings the sunset; the sun goes down quickly here): the Hoy card, the night, a morning
      if (!sunset && g.seen.has('Night') && st.map === 'casa' && await g.ev(() => G.sessionTime < 30)) {
        sunset = true;
        check('play: the evening ran (Hoy card, night, a new morning) and the game was saved', g.seen.has('TodayCard') && await g.ev(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1') || 'null'); return !!s && s.loc && s.loc.map === 'casa'; }));
      }
    }, fastSunset: true });
    check('play: the evening came (chapter 9)', sunset);
    check('play: chapters 1-10, then the older errands, and the animal party: every badge', await g.ev(() => G.data.badgeOrder.every(G.st.done)), await g.ev(() => JSON.stringify(G.state.quests)));
    check('play: diploma seen', g.seen.has('Diploma'));
    await g.frames(30); await g.shot('end');
    check('play: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
