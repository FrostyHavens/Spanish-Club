// The bus stop and the signposts are easy to tap: their whole picture counts (they are drawn mostly above their own
// tile, so tapping the round bus sign used to land on the empty tile above), with a generous margin.
'use strict';
const { run, open, check } = require('./harness');

run('signs', async browser => {
  const { ctx, g } = await open(browser, 'signs', true);
  try {
    const b = await g.ev(() => {
      G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
      for (const id of ['c1', 'c2']) G.state.quests[id] = 'done';
      if (G.demo) G.demo.skip();
      const at = G.zones.def('villa').bus.at; G.goto('villa', at[0] + 2, at[1] + 1, 'up'); return at;
    });
    await g.fieldIdle('villa');
    // a game-px point on the screen for a world-px point
    const scr = (wx, wy) => g.ev(([wx, wy]) => [wx - Math.round(G.field.cam.x), wy - Math.round(G.field.cam.y)], [wx, wy]);
    const T = 24;
    const tries = [['the middle of the round sign (above its tile)', b[0] * T + 12, b[1] * T - 8], ['the top edge of the sign', b[0] * T + 12, b[1] * T - 18], ['just beside the sign', b[0] * T + 28, b[1] * T - 6], ['the pole', b[0] * T + 12, b[1] * T + 14]];
    for (const [what, wx, wy] of tries) {
      await g.until(() => G.top() === G.field && !G.field.locked && G.input.ready(), null, 'free');
      const p = await scr(wx, wy);
      await g.tap(p[0], p[1]);
      await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map after tapping ' + what, 15000).catch(() => {});
      check('signs: tapping ' + what + ' opens the bus', await g.ev(() => G.top().constructor.name === 'WorldMap'));
      if (what === tries[0][0]) await g.shot('bus_tapped');
      await g.ev(() => { const s = G.top(); if (s.constructor.name === 'WorldMap') { G.pop(); s.w && s.w.resolve && s.w.resolve(null); } });
      await g.until(() => G.top() === G.field && !G.field.locked, null, 'back on the map', 15000);
    }
    // a tap well away from it is just a walk
    await g.until(() => G.top() === G.field && !G.field.locked && G.input.ready(), null, 'free');
    const far = await scr(b[0] * T + 12 + 3 * T, b[1] * T + 12 + 2 * T);
    await g.tap(far[0], far[1]); await g.frames(10);
    check('signs: a tap 3 tiles away is a walk, not the bus', await g.ev(() => G.top() === G.field));
    // a signpost: its board counts too
    const post = await g.ev(() => { const p = (G.field.def.posts || [])[0]; return p ? p.at : null; });
    if (post) {
      await g.ev(([x, y]) => { G.goto('villa', x + 1, y + 2, 'up'); }, post);
      await g.fieldIdle('villa');
      await g.until(() => G.input.ready(), null, 'ready');
      const p = await scr(post[0] * T + 12, post[1] * T - 2);
      await g.tap(p[0], p[1]);
      await g.until(() => !!G.field.wig, null, 'the signpost to wiggle', 15000).catch(() => {});
      check('signs: tapping a signpost\'s board (above its tile) reads it', await g.ev(() => !!G.field.wig));
    }
    check('signs: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
});
