// En casa from the start to the end, by taps alone, following the guide's arrow (docs/UNIT_EN_CASA.md):
//   1  a NEW game plays the opener and chapter 1 of the town for real (the puppy), then walks into the kitchen and plays
//      hogar1, hogar2, hogar3 and hogar4 in order, across as many game days as the pacing asks (tools/playflow.js nextDay),
//      with the phrases, listen-and-do and the dog's warm-up ON, as in real play. The town's later chapters are held back
//      (their gate says "unwritten") so the test follows the home line alone; each day ends with the sunset: the arrow
//      leads home to bed from the kitchen (one day) and from the patio (the next), and the evening and the night play.
//      The day after the last chapter: the daily meal, one favour from Leo, and a lime for Papá.
//      It checks: each of the 20 words unmet before its puzzle and met after, in the designed order; never more than 3
//      questions in a row (the dog's warm-up has its own rule); no console errors; nothing of any chapter left in the bag;
//      the real Leo back in the patio and Papá at the stove at the end; Mamá at (3,2) in her room.
//   2  three real saves of an older release (tools/fixtures/saves-2026-10-22.json: early, middle, late) open with no error,
//      the doorway bubble shows when it should, and hogar1 can be played from each.
// Screenshots (the folder on the command line): the doorway with its bubble and arrow, hogar2's everyone sits, hogar3's Leo
// eating, hogar4's family at the table, the served dish the next day, the lime and avocado trees.
//   NODE_PATH=$(npm root -g) node tools/test-hogar-all.js [screenshot dir]      ONLY=new or ONLY=saves: one part
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { run, open, check } = require('./harness');
const flow = require('./playflow');

const CHAPTERS = [
  ['hogar1', ['elpapa', 'cocina', 'hambre', 'sopa', 'rico']],
  ['hogar2', ['mesa', 'plato', 'vaso', 'cuchara', 'silla']],
  ['hogar3', ['hermano', 'tortilla', 'frijoles', 'taco', 'come']],
  ['hogar4', ['lamama', 'sed', 'limon', 'aguacate', 'arroz']],
];
const DESIGNED = CHAPTERS.reduce((a, [, w]) => a.concat(w), []);

// page-side, once: the order words are met in, the questions counted between map actions (as tools/test-chains.js does)
const INSTRUMENT = () => {
  window.__order = [];
  const meet = G.words.meet; G.words.meet = function (id) { const was = G.words.met(id), r = meet.apply(this, arguments); if (!was && G.words.met(id)) window.__order.push(id); return r; };
  const C = window.__chain = { run: [], runs: [] };
  const where = () => { const r = G.chapters.running && G.chapters.running(); return r ? r.id + '#' + r.k : G.warmup && G.warmup.running && G.warmup.running() ? 'warm-up' : 'free play'; };
  C.reset = () => { if (C.run.length) C.runs.push(C.run); C.run = []; };
  const asked = G.review.asked; G.review.asked = function () { C.run.push(where()); return asked.apply(this, arguments); };
  const FP = G.Field.prototype;
  const tapped = FP.tapped; FP.tapped = function () { if (!this.locked && G.top() === this && G.input.tap()) C.reset(); return tapped.apply(this, arguments); };
  const step = FP.step; FP.step = function (o) { if (o === this.player && !this.locked) C.reset(); return step.apply(this, arguments); };
  const walkNpc = FP.walkNpc; FP.walkNpc = function (o, dirs) { if (String(dirs || '').replace(/[^udlr]/g, '').length >= 2) C.reset(); return walkNpc.apply(this, arguments); };
  const play = G.pet.play; G.pet.play = function () { C.reset(); return play.apply(this, arguments); };
  const go = G.goto; G.goto = function () { C.reset(); return go.apply(this, arguments); };
  const push = G.push; G.push = function (s) { const k = s && s.constructor && s.constructor.name; if (k === 'Night' || k === 'TodayCard') C.reset(); return push.apply(this, arguments); };
};

// tap what the guide's arrow points at (the thing on screen, or the arrow itself at the edge); false when it shows nothing
async function tapArrow(g) {
  const a = await g.ev(() => { const a = G.guide.at; return a && !a.hidden && !a.choice ? { x: a.edge ? a.x : a.tx, y: a.edge ? a.y : a.ty, why: a.why } : null; });
  if (!a) return null;
  await g.tap(a.x, a.y);
  await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
  await g.frames(2);
  return a.why;
}

// screenshots of the moments worth looking at, taken from inside the scenes (g.beforeAct sees every step of a scene)
const SHOTS = {};
function watch(g) {
  let busy = false;
  const probe = async () => {
    if (busy) return false; busy = true;
    try {
      const k = await g.ev(() => {
        const f = G.field, r = G.chapters.running && G.chapters.running(); if (!f || !r) return null;
        const at = (id, x, y) => { const n = f.npc(id); return !!n && n.x === x && n.y === y; };
        if (r.id === 'hogar2' && r.k === 8 && at('mama_g', 7, 6) && at('leo_g', 5, 6) && f.player.x === 5 && f.player.y === 4) return 'hogar2_everyone_sits';
        if (r.id === 'hogar3' && r.k === 3 && at('leo_g', 5, 4) && G.chapters.ctx('hogar3').data.ate) return 'hogar3_leo_eats';
        if (r.id === 'hogar4' && r.k === 6 && at('mama_g', 5, 4) && at('leo_g', 7, 6) && at('papa', 7, 4) && f.player.x === 5 && f.player.y === 6) return 'hogar4_family_at_the_table';
        return null;
      });
      if (k && !SHOTS[k]) { SHOTS[k] = 1; await g.frames(14); await g.shot(k); }
    } finally { busy = false; }
    return false;
  };
  g.beforeAct = probe;
  const frames = g.frames.bind(g);
  g.frames = async n => { await frames(n); await probe(); }; // (a scene with no box up, like everyone sitting down, is waited out in frames)
}

// ---------- the invariant looked at on every step: a word is met only when its chapter has begun ----------
const unit = g => g.ev(([CHAPTERS]) => CHAPTERS.map(([id, words]) => ({ id, done: G.chapters.done(id), active: G.chapters.active(id), met: words.filter(w => G.words.met(w)) })), [CHAPTERS]);
async function invariants(g, where) {
  const u = await unit(g);
  for (const c of u) if (!c.done && !c.active && c.met.length) throw new Error(where + ': ' + c.id + ' has not begun but ' + c.met.join(',') + ' are met');
}

// the evening: the sun goes down where she is; the arrow leads home to bed, the evening and the night play
// a new day: she stands where she woke up for a moment, as a child starting the game does, and the dog's warm-up comes
async function morning(g, what) {
  await flow.nextDay(g);
  for (let i = 0; i < 3; i++) { await g.frames(100); await flow.settle(g, what); if (await g.ev(() => G.warmup.done())) break; }
  if (process.env.DBG) console.log('    morning: ' + JSON.stringify(await g.ev(() => ({ backlog: G.budget.backlog(), wu: G.state.hist && G.state.hist.wu, due: G.review.due(1e9).length }))));
}
async function evening(g, map, x, y, label) {
  await g.ev(([m, x, y]) => G.goto(m, x, y, 'down'), [map, x, y]); await g.fieldIdle(map); await g.frames(10);
  await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
  await g.until(() => G.day.over(), null, 'the sunset', 30000); await g.frames(12);
  const gl = await g.ev(() => { const o = G.guide.goal(G.field); return o ? { why: o.why, map: o.map || null, via: o.via || null } : null; });
  check(label + ': at sunset the arrow leads home to bed (' + (gl && gl.why) + ')', !!gl && /sunset/.test(gl.why) && gl.map === 'casa', JSON.stringify(gl));
  for (let i = 0; i < 40 && await g.ev(() => G.field.mapId !== 'casa'); i++) { await flow.settle(g, label + ': the way home'); if (await g.ev(() => G.field.mapId === 'casa')) break; if (!await tapArrow(g)) await g.frames(20); }
  await flow.settle(g, label + ': the evening and the night');
  check(label + ': the evening and the night played: a new morning, home, free', await g.ev(() => G.field.mapId === 'casa' && !G.day.over()), await g.ev(() => JSON.stringify({ m: G.field.mapId, over: G.day.over() })));
}

// =====================================================================
//  1 · a new game, all four chapters, the day after
// =====================================================================
async function newGame(browser) {
  const { ctx, g } = await open(browser, 'hogar-all', true, { phrases: true, listen: true, warmup: true });
  try {
    await flow.newGame(g);
    await g.ev(`(${INSTRUMENT})()`);
    // the town's later chapters wait (their gate says "unwritten": no bubble, nobody waits): the home line alone after chapter 1
    await g.ev(() => { const gate = G.chapters.gate; G.chapters.gate = function (id) { return /^c\d+$/.test(id) && id !== 'c1' ? 'unwritten' : gate.apply(this, arguments); }; G.chapters.flush(); });
    // ----- chapter 1 of the town, for real: the puppy is hiding; the bot finds him -----
    for (let i = 0; i < 400; i++) {
      await flow.settle(g, 'chapter 1');
      if (await g.ev(() => G.chapters.done('c1'))) break;
      const t = await flow.nextTap(g);
      if (!t) { await g.frames(60); continue; }
      await g.tap(t.sx, t.sy);
      await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
    }
    check('the opener and chapter 1 of the town played: the puppy is found', await g.ev(() => G.chapters.done('c1')));
    watch(g);
    await flow.settle(g, 'free at home');
    await g.ev(() => { G.goto('casa', 4, 4, 'down'); }); await g.fieldIdle('casa'); await g.frames(30);
    const door = await g.ev(() => ({ gate: G.chapters.gate('hogar1'), live: !!G.chapters.live({}, 'hogar'), why: (G.guide.goal(G.field) || {}).why || '' }));
    check('after the puppy: the home chapter may open, the doorway shows its bubble and the arrow leads there (' + door.why + ')', door.gate === null && door.live && /^hogar1:0/.test(door.why), JSON.stringify(door));
    await g.shot('doorway_bubble_and_arrow');

    // ----- the home chapters, day after day -----
    const log = [];
    let day = 1, lastCur = null, same = 0, lastWhy = '';
    for (; day <= Number(process.env.DAYS || 20) && !await g.ev(() => G.chapters.done('hogar4')); day++) {
      let caught = false;
      for (let step = 0; step < 250; step++) {
        await flow.settle(g, 'day ' + day + ' step ' + step);
        await invariants(g, 'day ' + day);
        const st = await g.ev(() => { const CH = G.chapters, cur = CH.current('hogar'), nx = CH.next('hogar'); return { cur, nx, gate: nx && !cur ? CH.gate(nx) : null, done: CH.done('hogar4') }; });
        if (st.cur !== lastCur) { lastCur = st.cur; if (st.cur) { log.push('day ' + day + ': ' + st.cur + ' begins'); console.log('    ' + log[log.length - 1]); } }
        if (st.done) break;
        // the next chapter waits for room (reviews due, or today's new words used up): the reviews she would have done are
        // done (the quickest honest set-up: her words are put off, as the other tests do between days); if the chapter still
        // waits (today's new words), the day is over
        if (!st.cur && st.nx && st.gate) {
          if (st.gate === 'room' && !caught) {
            caught = true;
            await g.ev(() => { for (const id of G.words.list(1)) Object.assign(G.words.rec(id), { due: null, ds: null, dd: G.words.day() + 3, dc: G.words.dayNum() + 3 }); G.budget.flush(); G.chapters.flush(); });
            await g.frames(4); continue;
          }
          console.log('    day ' + day + ': nothing more in the kitchen today (' + st.nx + ': ' + st.gate + ')'); break;
        }
        const why = await tapArrow(g);
        if (why == null) { if (++same > 12) { await g.shot('no_arrow'); throw new Error('the arrow showed nothing: ' + JSON.stringify(await g.ev(() => ({ map: G.field.mapId, goal: (G.guide.goal(G.field) || {}).why, ch: G.chapters.state().step })))); } await g.frames(30); continue; }
        if (why === lastWhy) same++; else same = 0; lastWhy = why;
        if (same > 60) { await g.shot('stuck'); throw new Error('the arrow led round in circles: ' + why); }
      }
      if (await g.ev(() => G.chapters.done('hogar4'))) break;
      await evening(g, day % 2 ? 'cocina' : 'patio', day % 2 ? 6 : 5, day % 2 ? 3 : 4, 'day ' + day);
      await morning(g, 'the next morning');
    }
    check('all four home chapters done (' + log.join('; ') + ')', await g.ev(() => ['hogar1', 'hogar2', 'hogar3', 'hogar4'].every(G.chapters.done)));
    check('the 20 words are met in the designed order, each once (unmet before its puzzle)', JSON.stringify((await g.ev(() => window.__order)).filter(w => DESIGNED.includes(w))) === JSON.stringify(DESIGNED), JSON.stringify(await g.ev(() => window.__order)));
    check('nothing of any chapter is left in the bag', await g.ev(() => !G.errands.bag.list().some(i => i.q)));
    await flow.settle(g, 'the end of hogar4');

    // ----- the day after: the daily meal, a favour from Leo, a lime for Papá -----
    await evening(g, 'patio', 5, 4, 'the last chapter\'s day');
    await morning(g, 'the day after');
    await g.ev(() => { G.goto('casa', 4, 4, 'down'); }); await g.fieldIdle('casa');
    check('the day after: Papá\'s pot has a bubble (the daily meal)', await g.ev(() => G.hogar.mealOn()));
    // (the arrow offers the day's other things first: the pot is the day's play, last; she goes to Papá for his bubble)
    await g.ev(() => { G.goto('cocina', 4, 4, 'down'); }); await g.fieldIdle('cocina'); await g.frames(20);
    check('in the kitchen Papá has the pot\'s bubble', await g.ev(() => !!G.field.npc('papa').alert()));
    await g.tapTile(4, 2);
    await flow.settle(g, 'the meal');
    check('the daily meal: Papá asked, the table was set by listening, a dish is served (' + await g.ev(() => G.hogar.dish()) + ')', await g.ev(() => !!G.hogar.dish()));
    await g.ev(() => { G.goto('cocina', 6, 3, 'down'); }); await g.fieldIdle('cocina'); await g.frames(20);
    await g.shot('served_dish_next_day');
    // Leo's favour (some days he has none: the day's list is drawn again until he has one)
    // (a favour asks for words she knows, not only met: a few days of reviews later her home words are known, stage 2)
    // (and favours begin with the town's chapter 7, far on in the story: it is set as done)
    await g.ev(() => { for (let i = 2; i <= 7; i++) G.state.quests['c' + i] = 'done'; });
    await g.ev(([W]) => { for (const id of W) Object.assign(G.words.rec(id), { st: 2, box: 2 }); G.budget.flush(); G.chapters.flush(); }, [DESIGNED]);
    const leo = await g.ev(() => { for (let i = 0; i < 30; i++) { if (G.favores.today().some(v => v.who === 'leo')) return true; if (G.state.fav) G.state.fav.day = -1; } return false; });
    check('Leo has a favour to ask today', leo);
    const leoDone = () => g.ev(() => !!(G.favores.today().find(v => v.who === 'leo') || {}).done);
    await g.ev(() => { G.goto('patio', 5, 5, 'down'); }); await g.fieldIdle('patio'); await g.frames(20);
    for (let i = 0; i < 8 && !await leoDone(); i++) {
      const at = await g.ev(() => { const n = G.field.npc('leo'); return [n.x, n.y]; });
      await g.tapTile(...at); await flow.settle(g, 'Leo\'s favour');
    }
    check('Leo\'s favour done', await g.ev(() => !!(G.favores.today().find(v => v.who === 'leo') || {}).done));
    // a lime from the tree, to Papá (the next day: Papá's hearts for the day are used up by the meal and the favours)
    await morning(g, 'the day after that');
    await g.ev(() => { G.goto('patio', 7, 4, 'down'); }); await g.fieldIdle('patio'); await g.frames(20);
    await g.shot('lime_and_avocado_trees');
    await g.ev(() => { G.state.hearts.papa = 3; }); // (Papá is at his 5 hearts by now, and a full heart takes no more: a gift is for someone with room)
    const h0 = await g.ev(() => G.hearts.get('papa'));
    await g.tapTile(7, 3); await g.until(() => !!G.carry.held(), null, 'the lime in her hands', 20000); await flow.settle(g, 'the lime');
    check('a lime picked at the tree', await g.ev(() => G.carry.held() && G.carry.held().id === 'limon'));
    await g.ev(() => { G.goto('cocina', 4, 4, 'down'); }); await g.fieldIdle('cocina'); await g.frames(10);
    await g.tapTile(4, 2); await flow.settle(g, 'the lime for Papá');
    const after = await g.ev(() => ({ held: G.carry.held() && G.carry.held().id, hearts: G.hearts.get('papa'), likes: G.hearts.likes('papa', 'limon'), canGift: G.hearts.canAddToday('papa', 'gift'), at: [G.field.mapId, G.field.player.x, G.field.player.y] }));
    check('the lime given to Papá: a heart, her hands empty', !after.held && after.hearts > h0, JSON.stringify([h0, after]));

    // ----- the end: where everyone is -----
    check('nothing of any chapter left in the bag', await g.ev(() => !G.errands.bag.list().some(i => i.q)));
    await g.ev(() => { G.goto('patio', 5, 4, 'down'); }); await g.fieldIdle('patio'); await g.frames(10);
    check('the real Leo is back in the yard, seen, near the sandpit', await g.ev(() => { const n = G.field.npc('leo'); return !!n && !n.hidden && Math.abs(n.x - 7) + Math.abs(n.y - 7) <= 3; }), await g.ev(() => JSON.stringify(G.field.npc('leo') && [G.field.npc('leo').x, G.field.npc('leo').y, G.field.npc('leo').hidden])));
    await g.ev(() => { G.goto('cocina', 6, 3, 'down'); }); await g.fieldIdle('cocina'); await g.frames(10);
    check('Papá is at the stove', await g.ev(() => { const n = G.field.npc('papa'); return n.x === 4 && n.y === 2 && !n.hidden; }));
    await g.ev(() => { G.goto('casa', 4, 4, 'down'); }); await flow.settle(g, 'home'); await g.fieldIdle('casa'); await g.frames(10);
    check('Mamá is at (3,2) in her room', await g.ev(() => { const n = G.field.npc('mama'); return n.x === 3 && n.y === 2 && !n.hidden; }));
    const runs = await g.ev(() => window.__chain.runs.concat([window.__chain.run]));
    const long = runs.filter(r => r.length > 3 && !r.every(w => w === 'warm-up'));
    check('never more than 3 questions in a row (longest ' + Math.max(0, ...runs.filter(r => !r.every(w => w === 'warm-up')).map(r => r.length)) + ')', !long.length, JSON.stringify(long));
    check('no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  2 · saves of an older release
// =====================================================================
const FIXTURE = path.join(__dirname, 'fixtures', 'saves-2026-10-22.json');
function savesOf() {
  const F = JSON.parse(fs.readFileSync(FIXTURE, 'utf8')), raw = JSON.parse(zlib.brotliDecompressSync(Buffer.from(F.blob, 'base64')).toString('utf8'));
  const list = F.list.map((s, i) => Object.assign({ raw: raw[i] }, s)), steps = list.filter(s => s.kind === 'step');
  const pick = id => steps.find(s => s.id === id) || steps[0];
  return [['early (chapter 1 of the town)', pick('c1@3')], ['middle (chapter 8)', pick('c8@2')], ['late (chapter 21)', pick('c21@1')]];
}
async function saves(browser) {
  for (const [name, save] of savesOf()) {
    const { ctx, g } = await open(browser, 'hogar-save', true, { phrases: true, listen: true });
    try {
      await g.ev(raw => { localStorage.setItem('spanishclub_migrated', '1'); localStorage.setItem('spanishclub_slot1', raw); }, save.raw);
      await g.page.reload();
      await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
      await g.ev(`(${INSTRUMENT})()`);
      await g.ev(() => { window.__al = []; const a = G.drawAlert; G.drawAlert = function (ctx, al, ex, ey, t) { window.__al.push([al && (al.icon || al), ex, ey]); return a.apply(this, arguments); }; });
      await g.tap(160, 180);
      await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
      await g.tapRect(await g.ev(() => G.top().cardRect(0)));
      await g.until(() => !!G.field && !!G.state && G.st.slot === 1, null, 'the game');
      await g.ev(() => { if (G.demo && G.demo.skip) G.demo.skip(); });
      await flow.settle(g, name + ': opening');
      const s = await g.ev(() => ({ c1: G.chapters.done('c1'), map: G.field.mapId }));
      check(save.id + ' (' + name + ') opens, free to walk (' + s.map + ')', true);
      await g.ev(() => G.goto('casa', 4, 4, 'down')); await g.fieldIdle('casa'); await g.ev(() => { window.__al.length = 0; }); await g.frames(20); await flow.settle(g, name + ': casa');
      const b = await g.ev(() => { const L = G.chapters.live({}, 'hogar'); return { gate: G.chapters.gate('hogar1'), live: !!L, sopa: window.__al.some(([ic]) => ic === 'sopa'), over: G.day.over() }; });
      // the bubble shows exactly when a home chapter could start (the puppy found, room for it, not sunset)
      check(save.id + ': the doorway bubble shows when it should (gate ' + b.gate + ', live ' + b.live + ', bubble ' + b.sopa + ')', b.sopa === (b.live && !b.over), JSON.stringify(b));
      if (!s.c1) { // the puppy not found yet: the doorway is Mamá's "wait"; with chapter 1 done the kitchen opens
        check(save.id + ': before the puppy is found there is no bubble and the doorway says wait', !b.sopa && b.gate === 'after');
        await g.ev(() => { G.state.quests.c1 = 'done'; G.chapters.flush(); });
      }
      await g.shot('save_' + save.id.replace('@', '_'));
      // hogar1 can be played from it: through the doorway by a tap, then by the arrow
      await g.ev(() => { G.chapters.flush(); });
      const room = await g.ev(() => { const L = G.chapters.live({}, 'hogar'); return { gate: G.chapters.gate('hogar1'), live: !!L }; });
      await g.tapTile(8, 4);
      await g.until(() => G.field.mapId === 'cocina' || G.top() !== G.field, null, 'the kitchen', 20000);
      for (let i = 0; i < 160 && !await g.ev(() => G.chapters.done('hogar1')); i++) {
        await flow.settle(g, name + ': hogar1');
        if (await g.ev(() => G.chapters.done('hogar1'))) break;
        if (!await tapArrow(g)) await g.frames(20);
      }
      check(save.id + ': hogar1 played to its end from this save (' + JSON.stringify(room) + ')', await g.ev(() => G.chapters.done('hogar1')));
      const order = await g.ev(() => window.__order);
      check(save.id + ': its five words met in order (' + order.join(' ') + ')', JSON.stringify(order.filter(w => DESIGNED.includes(w))) === JSON.stringify(CHAPTERS[0][1]), JSON.stringify(order));
      check(save.id + ': no console errors', !g.errors.length, g.errors.join('\n'));
    } finally { await ctx.close(); }
  }
}

const ONLY = process.env.ONLY || '';
run('En casa, from the start to the end', [['a new game: hogar1 to hogar4, the day after', newGame], ['saves of an older release', saves]].filter(([n, f]) => !ONLY || f.name === ONLY));
