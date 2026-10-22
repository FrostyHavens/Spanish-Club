// Crash guards (docs/AUDIT_2026-10.md H7 / 1.8): a talk, an event or a cutscene that throws leaves the map free and the
// child walks on (a text box it had half-opened closes); a map hook that throws every frame doesn't stop the map; a
// screen whose update or draw keeps throwing is closed (back to the map) and whatever waited on it goes on; the game
// loop never stops (a throwing title); errors are kept (the last 20, window.onerror and unhandled rejections too),
// shown in the grown-ups' Problem log, copied (Share / Copy) and cleared.
//   NODE_PATH=$(npm root -g) node tools/test-crash.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

const GIRL = { gender: 'nina', skin: '#a87050', style: 'braid', hair: '#201010', outfit: '#8a50c8' };
const SAVE = name => ({
  flags: { intro: true }, searched: {}, playTime: 60, loc: { map: 'casa', x: 4, y: 4, dir: 'down' },
  words: { hola: { learned: true, right: 1, wrong: 0 } }, pages: {}, quests: { c1: 'done', c2: 'done' }, ch: { v: 2 }, stars: 1, opts: { english: false }, look: GIRL, name, savedAt: 1000,
});
const scene = (g, name, what) => g.until(n => G.top() && G.top().constructor.name === n, name, what || name);
const expected = g => g.errors.filter(e => !/test: /.test(e)); // (the errors these tests throw on purpose are expected)
async function start(g) { // a game at home (Mamá is there), free to walk
  await g.ev(s => { localStorage.setItem('spanishclub_migrated', '1'); localStorage.setItem('spanishclub_slot1', JSON.stringify(s)); }, SAVE('Luz'));
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.tap(160, 180);
  await scene(g, 'Slots');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.fieldIdle('casa');
  await g.ev(() => {
    G.errlog.clear();
    window.Broken = class Broken { constructor(w, part) { this.w = w; this.part = part; this.transparent = true; this.n = 0; } update() { this.n++; if (this.part === 'update') throw new Error('test: a screen\'s update breaks'); } draw(ctx) { if (this.part === 'draw') throw new Error('test: a screen\'s draw breaks'); ctx.fillStyle = '#f00'; ctx.fillRect(0, 0, 4, 4); } };
  });
}
// the player can walk: a free map, and a step in some direction moves her
async function walks(g) {
  await g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving, null, 'a free map', 5000);
  const p0 = await g.ev(() => [G.field.player.x, G.field.player.y]);
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) { // (one step; the front door is down)
    await g.page.keyboard.down(k); await g.frames(3); await g.page.keyboard.up(k); await g.frames(12);
    const p = await g.ev(() => [G.field.player.x, G.field.player.y]);
    if (p[0] !== p0[0] || p[1] !== p0[1]) return true;
  }
  return false;
}
// tap Mamá (she may wander a step): tapped again until her talk has begun (done() in the page), up to 3 times
async function talkToMama(g, done) {
  for (let n = 0; n < 3; n++) {
    await g.until(() => G.top() === G.field && !G.field.locked && !G.field.player.moving, null, 'a free map', 5000);
    const m = await g.ev(() => { const n = G.field.npc('mama'); return [n.x, n.y]; });
    await g.tapTile(...m);
    try { await g.until(done, null, 'Mamá\'s talk', 6000); return; } catch (e) { if (n === 2) throw e; }
  }
}

// ---------- talks, events and cutscenes that throw ----------
async function talks(browser) {
  const { ctx, g } = await open(browser, 'crash-talk', true);
  try {
    await start(g);
    // a talk that throws after its first line
    await g.ev(() => { const n = G.field.npc('mama'); n.alert = () => null; n.talk = function* () { yield G.say('¡Hola!'); throw new Error('test: a talk breaks'); }; });
    await talkToMama(g, () => G.top().constructor.name === 'TextBox');
    // (tap the line away, only while it's up: a tap at (160, 190) once the map is free is the front door, and she walks out)
    await g.frames(30); for (let i = 0; i < 2 && await g.ev(() => G.top().constructor.name === 'TextBox'); i++) { await g.tap(160, 190); await g.frames(20); }
    await g.until(() => G.errlog.list().length >= 1, null, 'the error to be caught', 5000);
    check('talk: a talk that throws leaves the map free (not locked)', await g.ev(() => G.top() === G.field && !G.field.locked));
    check('talk: ...walking starts again, and the child walks', await g.ev(() => G.field.tasks.list.some(t => t.gen === G.field.walker)) && await walks(g));
    const e = await g.ev(() => G.errlog.list()[0]);
    check('talk: the error is kept: message, where, screen, map, time, stack, build', e.msg === 'Error: test: a talk breaks' && e.where === 'task' && e.map === 'casa' && e.at > 0 && e.stack.length > 0 && e.stack.some(l => /src\/field\.js:\d+/.test(l)) && typeof e.build === 'string', JSON.stringify(e));
    // a talk that throws with its text box half open (the same step)
    await g.ev(() => { G.field.npc('mama').talk = function* () { G.say('...'); throw new Error('test: a talk breaks mid-line'); }; });
    await talkToMama(g, () => G.errlog.list().length >= 2);
    await g.frames(4);
    check('talk: a text box it had half opened is closed, the map is free', await g.ev(() => G.top() === G.field && !G.field.locked && !G.scenes.some(s => s.constructor.name === 'TextBox')));
    check('talk: ...and the child walks', await walks(g));
    // a talk waiting on a screen that keeps throwing: the screen closes, the talk goes on to its end
    await g.ev(() => { G.field.npc('mama').talk = function* () { const w = new G.Wait(); G.push(new Broken(w, 'update')); const r = yield w; G.state.flags.after = r.result === null ? 'closed' : 'other'; yield G.say('¡Sigue!'); }; });
    await talkToMama(g, () => G.scenes.some(s => s.constructor.name === 'Broken') || G.state.flags.after);
    await g.until(() => G.state.flags.after === 'closed', null, 'the talk to go on', 5000);
    check('talk: a screen that keeps throwing is closed and the talk waiting on it goes on', await g.ev(() => !G.scenes.some(s => s.constructor.name === 'Broken')));
    await scene(g, 'TextBox'); await g.frames(30); await g.tap(160, 190); await g.frames(20); await g.tap(160, 190);
    check('talk: ...then the map is free again', await walks(g));
    // an event (a cutscene task of the map) that throws while holding the map
    await g.ev(() => { const f = G.field; f.locked = true; f.tasks.add((function* () { yield 10; G.say('...'); throw new Error('test: a cutscene breaks'); })()); });
    await g.until(() => G.errlog.list().some(e => /cutscene/.test(e.msg)), null, 'the cutscene error', 5000);
    check('event: a cutscene that throws (holding the map, no clean-up of its own) frees the map', await g.ev(() => !G.field.locked) && await walks(g));
    // the walking itself throws (a broken tap route): it starts again
    await g.ev(() => { const f = G.field, plan = f.plan; f.plan = function () { f.plan = plan; throw new Error('test: a route breaks'); }; f.route = { x: f.player.x + 1, y: f.player.y }; });
    await g.until(() => G.errlog.list().some(e => /route breaks/.test(e.msg)), null, 'the route error', 5000);
    check('walk: walking that throws starts again', await walks(g));
    // a map system that throws every frame (the guide): the map goes on, the error is counted, not repeated
    await g.ev(() => { window.__gu = G.guide.update; G.guide.update = () => { throw new Error('test: the guide breaks'); }; });
    await g.frames(30);
    check('hook: a map system that throws every frame doesn\'t stop the map; the child walks', await walks(g));
    const gu = await g.ev(() => G.errlog.list().filter(e => /guide breaks/.test(e.msg)));
    check('hook: ...it is one entry in the log, counted', gu.length === 1 && gu[0].n > 20 && gu[0].where === 'map guide', JSON.stringify(gu));
    check('hook: ...and said once in the console', g.errors.filter(e => /guide breaks/.test(e)).length === 1, g.errors.join('\n'));
    await g.ev(() => { G.guide.update = window.__gu; });
    await g.shot('after_errors');
    check('talk (iPad): no other console errors', !expected(g).length, expected(g).join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the game loop never stops ----------
async function loop(browser) {
  const { ctx, g } = await open(browser, 'crash-loop', true);
  try {
    await start(g);
    // a screen over the map whose update throws: closed after 3 tries, its wait resolved, the loop goes on
    const r = await g.ev(() => { const w = new G.Wait(); window.__w = w; G.push(new Broken(w, 'update')); return G.frame; });
    await g.until(f => G.frame > f + 30, r, 'the loop to keep going', 5000);
    check('loop: a screen whose update throws is closed (back to the map), the loop goes on', await g.ev(() => G.top() === G.field && window.__w.fin && window.__w.result === null));
    check('loop: ...after 3 tries', await g.ev(() => { const e = G.errlog.list().find(e => /update breaks/.test(e.msg)); return e && e.n === 3 && e.where === 'update' && e.scene === 'Broken'; }));
    // the same for draw
    const r2 = await g.ev(() => { const w = new G.Wait(); window.__w2 = w; G.push(new Broken(w, 'draw')); return G.frame; });
    await g.until(f => G.frame > f + 30, r2, 'the loop to keep going', 5000);
    check('loop: a screen whose draw throws is closed too; the map draws again', await g.ev(() => G.top() === G.field && window.__w2.fin && G.errlog.list().some(e => /draw breaks/.test(e.msg) && e.where === 'draw')) && await walks(g));
    // a map whose draw throws in one layer: the map is never closed, its menu button is still drawn
    await g.ev(() => { window.__wd = G.warmup.draw; G.warmup.draw = () => { throw new Error('test: a layer breaks'); }; window.__btn = 0; const b = G.iconBtn; window.__ib = b; G.iconBtn = function (ctx, kind) { if (kind === 'menu') window.__btn++; return b.apply(this, arguments); }; });
    await g.frames(20);
    check('loop: a map layer that throws: the map stays, its menu button is still drawn, the child walks', await g.ev(() => G.top() === G.field && window.__btn > 10 && G.errlog.list().some(e => e.where === 'map draw over')) && await walks(g));
    await g.ev(() => { G.warmup.draw = window.__wd; G.iconBtn = window.__ib; });
    // the bottom screen (the title) throwing every frame: it can't be closed, but the loop never stops (it used to freeze)
    await g.ev(() => G.toTitle());
    await scene(g, 'Title');
    const f0 = await g.ev(() => { G.top().update = () => { throw new Error('test: the title breaks'); }; return G.frame; });
    await g.until(f => G.frame > f + 60, f0, 'the frames to go on with a broken title', 5000);
    check('loop: a title whose update throws: the frames go on (no freeze), it isn\'t closed', await g.ev(() => G.top().constructor.name === 'Title'));
    await g.ev(() => G.toTitle());
    await g.frames(40);
    await g.tap(160, 180);
    await scene(g, 'Slots');
    check('loop: ...and the game goes on from a new title', true);
    check('loop (iPad): no other console errors', !expected(g).length, expected(g).join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the log: capped at 20, window errors too, shown, copied, cleared ----------
async function logged(browser) {
  const { ctx, g } = await open(browser, 'crash-log', true);
  try {
    await start(g);
    await g.ev(() => { for (let i = 0; i < 26; i++) G.oops(new Error('test: number ' + Math.min(i, 24)), 'test'); }); // (the last one twice, from the same place)
    const L = await g.ev(() => ({ a: G.errlog.list(), s: JSON.parse(localStorage.getItem('spanishclub_errors')) }));
    check('log: the last 20 are kept (oldest dropped), on the device too', L.a.length === 20 && L.a[0].msg === 'Error: test: number 5' && L.a[19].msg === 'Error: test: number 24' && L.s.length === 20, L.a.map(e => e.msg).join());
    check('log: the same error again counts up', L.a[19].n === 2);
    await g.ev(() => { setTimeout(() => { throw new Error('test: a timer breaks'); }); Promise.reject(new Error('test: a promise breaks')); });
    await g.until(() => G.errlog.list().some(e => e.where === 'window' && /timer breaks/.test(e.msg)) && G.errlog.list().some(e => e.where === 'promise' && /promise breaks/.test(e.msg)), null, 'window.onerror and unhandledrejection', 5000);
    check('log: window.onerror and unhandled rejections are kept too', true);
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after a reload');
    check('log: it is still there after a reload', await g.ev(() => G.errlog.list().length === 20 && G.errlog.list()[19].where === 'promise'));
    // the grown-ups menu: the Problem log row, the screen, Share, Clear
    await g.ev(() => {
      window.__shared = [];
      Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: d => { window.__shared.push({ d, during: window.event ? window.event.type : '' }); return Promise.resolve(); } });
      G.grownUps({ title: true });
    });
    await scene(g, 'GrownUps');
    const row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'problems'); return { r: s.rows()[k], rect: s.rowRect(k) }; });
    check('log: the grown-ups menu has a Problem log row: how many, the last one', row.r.right === '20' && /^Last: Error: test: a promise breaks/.test(row.r.help), JSON.stringify(row.r));
    await g.tapRect(row.rect);
    await scene(g, 'ProblemLog');
    await g.frames(4); await g.shot('problem_log');
    await g.tapRect(await g.ev(() => G.top().copyRect()));
    await g.until(() => window.__shared.length === 1, null, 'the share sheet', 3000);
    const sh = await g.ev(() => window.__shared[0]);
    check('log: Share sends it all as text, inside the tap', sh.during === 'touchend' && /^Club de Español problem log: 20 problems/.test(sh.d.text) && /Build: /.test(sh.d.text) && /test: a promise breaks/.test(sh.d.text) && /test: number 7\b/.test(sh.d.text) && !/test: number 6\b/.test(sh.d.text) && /\| promise \|/.test(sh.d.text), sh.d.text.slice(0, 400));
    // no share sheet (a computer): the clipboard
    await g.ev(() => { delete navigator.share; window.__clip = null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__clip = t; return Promise.resolve(); } } }); });
    await g.frames(40);
    await g.tapRect(await g.ev(() => G.top().copyRect()));
    await g.until(() => window.__clip != null, null, 'the copy', 3000);
    check('log: Copy puts it on the clipboard where there is no share sheet', await g.ev(() => /problem log: 20 problems/.test(window.__clip) && /Copied/.test(G.top().note)));
    await g.tapRect(await g.ev(() => G.top().clearRect()));
    check('log: Clear asks once more ("Sure?")', await g.ev(() => G.errlog.list().length === 20 && G.top().clearT > 0));
    await g.tapRect(await g.ev(() => G.top().clearRect()));
    check('log: ...then it is empty, on the device too', await g.ev(() => G.errlog.list().length === 0 && localStorage.getItem('spanishclub_errors') === null));
    await g.tapBtn([294, 6]);
    await scene(g, 'GrownUps');
    check('log: the row says none', await g.ev(() => G.top().rows().find(r => r.id === 'problems').right === 'none'));
    check('log (iPad): no other console errors', !expected(g).length, expected(g).join('\n'));
  } finally { await ctx.close(); }
}

run('Crash guards and the problem log', [['talks and events that throw (iPad)', talks], ['the game loop never stops (iPad)', loop], ['the problem log (iPad)', logged]]);
