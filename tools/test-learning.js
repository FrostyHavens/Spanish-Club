// Learning plan 2, Phase 1 (docs/LEARNING_PLAN_2.md): measure and review.
//   src/history.js   the learning history in the save: every retrieval (pick, recall, say, miss, a grown-up's check) with
//                    the gap since the word was last met or used, across days (G.debug.dayShift); retention; minutes;
//                    the 60-day cap; older saves
//   src/words.js     slipping words (3 misses) and G.intro.again: met again instead of the same question, until right twice
//   src/warmup.js    the dog's warm-up: once a day the first time free, due words (most overdue, earlier days, other
//                    places first), the big mic, cards growing, the dog's party; skippable; never during a story beat;
//                    the guide after; the ghost hand the first time
//   src/dashboard.js the grown-ups' Learning page: overview, retention, words by place, the word check, tonight's
//                    question, share; every number checked against the model
//   NODE_PATH=$(npm root -g) node tools/test-learning.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// ---------- a fake recognizer (as in tools/test-speaking.js): each start() takes the next reply from window.__sr.queue ----------
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [], calls: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.calls.push('start'); sr.starts.push({ during: window.event ? window.event.type : 'frame' });
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(([transcript, confidence]) => ({ transcript, confidence })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 300);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 50); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openWith(browser, name, touch, o) {
  const { ctx, g } = await open(browser, name, touch, o);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}

// A game on the map: the dog is yours, the opener and o.done's chapters are behind you (c1-c3 by default); o.words
// [id, stage, box, days since last met or used] were met on an earlier day and are due now (o.notDue: not due);
// o.today: words met today. Animals are in the album already (no "¡Nuevo animal!" in the shots).
const game = (g, o = {}) => g.ev(o => {
  G.debug.dayShift = (o.day || 0) - 1;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of o.done || ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0; // (no cards popping up from the setup)
  W.newSession('new');
  const meet = id => { if (G.animals && G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'test'); return W.rec(id); };
  for (const [id] of o.words || []) meet(id);
  G.debug.dayShift = o.day || 0; W.newSession('load');
  for (const [id, st, box, ago] of o.words || []) { const r = W.rec(id); Object.assign(r, { st, box, fu: 0, due: null, dd: W.day(), dc: W.dayNum(), ld: W.dayNum() - (ago || 1), learned: st >= 3, gold: st >= 3 }); if ((o.notDue || []).includes(id)) { r.dd = W.day() + 5; r.dc = W.dayNum() + 5; } }
  for (const id of o.today || []) { const r = meet(id); Object.assign(r, { st: 2, fu: 0 }); }
  G.cards.grow = grow;
  window.__anims = []; const an = G.pet.anim; G.pet.anim = (n, k, a) => { window.__anims.push(k); return an(n, k, a); };
  window.__starts = []; const st = G.warmup.start; G.warmup.start = (f, ids) => { window.__starts.push({ day: G.today(), running: !!G.chapters.running(), locked: !!(G.field && G.field.locked), ids: (ids || []).slice() }); return st(f, ids); };
  if (o.demoSkip) G.demo.skip();
  G.goto(o.map || 'villa', o.x || 22, o.y || 13, o.dir || 'down');
}, o);
// the next calendar day (a reload of the game the next morning)
const nextDay = (g, map = 'villa') => g.ev(map => { G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('load'); G.goto(map, 22, 13, 'down'); }, map);
const cur = g => g.ev(() => { const c = G.warmup.cur(); return c && { ids: c.ids, i: c.i, phase: c.phase, res: c.res, skipped: c.skipped }; });
const today = g => g.ev(() => JSON.parse(JSON.stringify(G.hist.day())));
// wait for cond (page side), tapping through a gold word card ("¡Palabra de oro!", learn.js) when one comes up
async function past(g, cond, what, timeout = 15000) {
  const t0 = Date.now();
  while (!(await g.ev(cond))) {
    if (Date.now() - t0 > timeout) throw new Error('timed out waiting for ' + what + ' (top scene: ' + await g.scene() + ')');
    if (await g.ev(() => G.top().constructor.name === 'WordCard' && G.top().t > 22 && G.input.ready())) await g.tap(150, 200); else await g.frames(4);
  }
}
const still = async (g, label) => { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); };

// =====================================================================
//  The history, in the page
// =====================================================================
async function history(browser) {
  const { ctx, g } = await open(browser, 'learn-hist', true);
  try {
    await game(g, { day: 0 });
    await g.fieldIdle('villa');
    const h = await g.ev(() => {
      const W = G.words, H = G.hist, o = {};
      W.addTime(10);
      ['perro', 'gato', 'casa', 'pelota', 'manzana', 'oso'].forEach(id => W.meet(id, 'test'));
      o.met = H.day().met.slice();
      W.addTime(100);
      W.answerRight('perro', { mode: 'both' });                                   // a pick
      W.answerRight('gato', { mode: 'text' });                                    // a recall (word-only cards)
      G.st.said('casa'); W.answerRight('casa', { said: true, mode: 'text' });     // said aloud: ONE event
      W.answerWrong('pelota'); W.answerRight('pelota', { firstTry: false });     // a miss, then right
      G.st.said('manzana'); W.answerRight('manzana', { said: true, cued: true, mode: 'say' }); // said after hearing it: an echo
      W.answerRight('oso', { mode: 'match', firstTry: true });                    // a page match: a recall
      o.d0 = JSON.parse(JSON.stringify(H.day().w));
      // the next day: a pick, a miss, a grown-up's check right and wrong
      G.debug.dayShift = 1; W.newSession('load');
      W.answerRight('perro', { mode: 'pic' });
      W.answerWrong('gato');
      H.checkStart(['casa', 'pelota']); H.checkAnswer(true); H.checkAnswer(false);
      o.d1 = JSON.parse(JSON.stringify(H.day().w)); o.check = H.checkLast();
      // three days later: a recall after a 3-day gap; a parent check first and then an in-game answer the same day
      G.debug.dayShift = 3; W.newSession('load');
      W.answerRight('manzana', { mode: 'text' });
      H.checkStart(['oso']); H.checkAnswer(true); W.answerRight('oso', { mode: 'text' });
      o.d4 = JSON.parse(JSON.stringify(H.day().w));
      o.ev = H.events().map(e => [e.word, e.kind, e.first, e.ok, e.cued, e.gap].join(':'));
      o.retAll = H.retention({ all: true }); o.ret1 = H.retention({ days: 1 }); o.ret7 = H.retention({ days: 7 });
      o.spoken = H.spoken({ all: true });
      o.byDay = H.retentionByDay(4).map(d => d.n + '/' + d.right);
      o.size = JSON.stringify(G.state.hist).length;
      return o;
    });
    check('history: the words met today are in the day\'s record', h.met.join() === 'perro,gato,casa,pelota,manzana,oso', h.met.join());
    check('history: day 0 (met today, gap 0): a pick P, a recall R, said S (the mic and its answer: one event), a miss then right "mp", an echo E, a page match R',
      JSON.stringify(h.d0) === JSON.stringify({ perro: [0, 'P'], gato: [0, 'R'], casa: [0, 'S'], pelota: [0, 'mp'], manzana: [0, 'E'], oso: [0, 'R'] }), JSON.stringify(h.d0));
    check('history: the next day the gap is 1: a pick, a miss, a grown-up\'s check right (C) and wrong (c)',
      JSON.stringify(h.d1) === JSON.stringify({ perro: [1, 'P'], gato: [1, 'm'], casa: [1, 'C'], pelota: [1, 'c'] }), JSON.stringify(h.d1));
    check('history: three days later the gap is 3; a check first, then the game\'s answer the same day (one gap per word and day)', JSON.stringify(h.d4) === JSON.stringify({ manzana: [3, 'R'], oso: [3, 'CR'] }), JSON.stringify(h.d4));
    check('history: H.events() expands them: {word, kind: pick | recall | say | miss | parent, first, ok, cued, gap}', ['perro:pick:true:true:false:0', 'casa:say:true:true:false:0', 'pelota:miss:false:false:false:0', 'pelota:pick:false:true:false:0', 'manzana:say:true:true:true:0', 'gato:miss:false:false:false:1', 'casa:parent:true:true:false:1', 'pelota:parent:false:false:false:1', 'manzana:recall:true:true:false:3'].every(e => h.ev.includes(e)), h.ev.join(' '));
    // retention: first events after a day or more, not a check, not cued: perro P (1), gato m (1), manzana R (3) -> 2 of 3
    check('history: retention = right on the first try when a word comes back after a day or more: 2 of 3 (67%); a check or a cued answer never counts', h.retAll.n === 3 && h.retAll.right === 2 && h.retAll.pct === 67, JSON.stringify(h.retAll));
    check('history: retention over the last day / the last 7 days', h.ret1.n === 1 && h.ret1.right === 1 && h.ret7.n === 3, JSON.stringify([h.ret1, h.ret7]));
    check('history: the share said aloud: S and E of every practice event (checks apart): 2 of 11', h.spoken.said === 2 && h.spoken.all === 11 && h.spoken.pct === 18, JSON.stringify(h.spoken));
    check('history: a bar per day for the chart (a day with nothing back after a day: 0)', h.byDay.join() === '0/0,2/1,0/0,1/1', h.byDay.join());
    check('history: the last check\'s score', h.check && h.check.right === 1 && h.check.of === 2, JSON.stringify(h.check));
    check('history: compact (a few hundred bytes here)', h.size < 900, h.size);

    // the grown-up's check counts in the model: right = a recall (stage 2 -> 3), wrong = a miss (down a box)
    const m = await g.ev(() => {
      const W = G.words, H = G.hist;
      W.meet('pan', 'test'); W.meet('leche', 'test'); Object.assign(W.rec('pan'), { st: 2, box: 2, fu: 0, due: null, dd: W.day(), dc: W.dayNum(), mdn: W.dayNum() - 2 }); Object.assign(W.rec('leche'), { st: 2, box: 3, fu: 0 }); // (pan met on an earlier day: gold needs a later day, words.js)
      H.checkStart(['pan', 'leche']); H.checkAnswer(true); H.checkAnswer(false);
      return { pan: W.stage('pan'), panBox: W.rec('pan').box, leche: W.rec('leche').box, wrong: W.rec('leche').wrong, d: H.day().w.pan[1] + H.day().w.leche[1] };
    });
    check('history: a check\'s right is a recall in the word model (known -> remembered, up a box); not yet is a miss (back to box 1 from box 3)', m.pan === 3 && m.panBox === 3 && m.leche === 1 && m.wrong === 1 && m.d === 'Cc', JSON.stringify(m));

    // minutes: counted while the game is on, not when idle, not on the grown-ups' screens
    const s0 = await g.ev(() => G.hist.day().s);
    await g.frames(150);
    const s1 = await g.ev(() => G.hist.day().s);
    check('history: today\'s seconds of play are counted', s1 >= s0 + 1, s0 + ' -> ' + s1);
    await g.ev(() => { G.hist.IDLE = 30; });
    await g.frames(60); const s2 = await g.ev(() => G.hist.day().s); await g.frames(120);
    check('history: ...not while nobody touches anything', await g.ev(s2 => G.hist.day().s === s2, s2));
    await g.ev(() => { G.hist.IDLE = 180 * 60; G.grownUps(); });
    await g.tap(160, 6); // (a touch: not idle)
    const s3 = await g.ev(() => G.hist.day().s); await g.frames(150);
    check('history: ...and not on the grown-ups\' screens', await g.ev(s3 => G.hist.day().s === s3 && G.top().constructor.name === 'GrownUps', s3));
    await g.ev(() => { G.pop(); });

    // the last 60 days in detail; older days fold into totals (all time still counts them)
    const cap = await g.ev(() => {
      const H = G.hist, h = H.state(), W = G.words, n0 = W.dayNum(), key = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
      for (let k = 80; k >= 1; k--) { const d = H.day(key(n0 - k)); d.s = 600; d.w.perro = [2, 'P']; }
      return { kept: H.days().length, old: h.old.days, allS: H.stats({ all: true }).s, allR: H.retention({ all: true }).n, size: JSON.stringify(h).length };
    });
    check('history: only the last 60 days are kept in detail', cap.kept === 60, JSON.stringify(cap));
    check('history: ...the older ones fold into totals, still counted in "all time"', cap.old >= 20 && cap.allR >= 80 && cap.allS >= 80 * 600, JSON.stringify(cap));
    check('history: two months of play stay small in the save', cap.size < 8000, cap.size);

    // an older save (no history, words from before ld): it loads, the history starts, gaps come from what the word knew
    const old = await g.ev(() => {
      const W = G.words, d3 = (() => { const d = new Date(G.now() - 3 * 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); })();
      const save = { flags: { intro: true, canelo: true, petStart: true }, loc: { map: 'villa', x: 22, y: 13, dir: 'down' }, quests: { c1: 'done', c2: 'done', c3: 'done' }, stars: 3, playTime: 5400, name: 'Ana',
        words: { perro: { st: 3, box: 3, due: null, dd: 1, dc: null, fu: 0, met: 0, ms: 0, md: 0, how: 'show', last: 0, n: 5, right: 3, wrong: 0, said: 1, cue: 0, ret: 3, ft: { [d3]: 1 }, star: d3, s3: 0, gold: true, learned: true }, gato: { learned: true, right: 1, wrong: 0 } } };
      localStorage.setItem('spanishclub_slot3', JSON.stringify(save));
      const ok = G.st.loadSlot(3);
      const o = { ok, hist: JSON.stringify(G.state.hist), ld: W.lastDay('perro') === W.dayNum() - 3, gap: W.gapDays('perro'), ov: G.hist.overview() };
      W.answerRight('perro', { mode: 'text' }); o.ev = G.hist.day().w.perro;
      o.minutes = G.hist.totalMinutes();
      G.st.close();
      return o;
    });
    check('history: an older save loads; its history begins empty', old.ok && old.hist === '{}', JSON.stringify(old.hist));
    check('history: ...a word\'s last day comes from what it knew (its last star / first tries): 3 days ago', old.ld && old.gap === 3, JSON.stringify(old));
    check('history: ...so its first answer is a retention point (gap 3); the play before the history counts in the total', old.ev[0] === 3 && old.ev[1] === 'R' && old.minutes >= 90, JSON.stringify([old.ev, old.minutes]));
    check('history: ...and the overview works on it', old.ov.met === 2 && old.ov.days >= 1, JSON.stringify(old.ov));
    check('history: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  Slipping words: three misses, met again, right twice
// =====================================================================
async function slipping(browser) {
  const { ctx, g } = await open(browser, 'learn-slip', true);
  try {
    await game(g, { words: [['pato', 2, 2, 1], ['gato', 2, 2, 1], ['perro', 3, 3, 1], ['casa', 2, 2, 1], ['manzana', 2, 2, 1], ['pan', 2, 2, 1]], demoSkip: true });
    await g.fieldIdle('villa');
    const m = await g.ev(() => {
      const W = G.words, o = {}, grow = G.cards.grow; G.cards.grow = () => 0; // (no cards popping up over the screenshots)
      W.answerWrong('pato'); W.answerWrong('pato'); o.two = W.slipping('pato');
      W.answerWrong('pato'); o.three = W.slipping('pato'); o.re = W.needsReintro('pato');
      // three misses within 10 minutes of play, with rights between: slipping too
      W.answerWrong('gato'); W.addTime(60); W.answerRight('gato', { firstTry: true, mode: 'pic' }); W.answerWrong('gato'); W.addTime(60); W.answerRight('gato', { mode: 'pic' }); W.answerWrong('gato');
      o.window = W.slipping('gato');
      // ...but not when they are far apart
      W.answerWrong('casa'); W.answerRight('casa', { mode: 'pic' }); W.addTime(700); W.answerWrong('casa'); W.answerRight('casa', { mode: 'pic' }); W.addTime(700); W.answerWrong('casa');
      o.apart = W.slipping('casa');
      o.list = W.slipList();
      G.cards.grow = grow;
      return o;
    });
    check('slipping: two misses are not enough; three in a row: slipping, to be met again', !m.two && m.three && m.re, JSON.stringify(m));
    check('slipping: three misses within 10 minutes of play (rights between them) count too; far apart they don\'t', m.window && !m.apart, JSON.stringify(m));
    check('slipping: the model lists them', m.list.join() === 'gato,pato', m.list.join());

    // the next review question for it is a fresh introduction: held up and named, then hear it and pick its picture
    const before = await g.ev(() => { const r = G.words.rec('pato'); return { box: r.box, st: r.st }; });
    await g.ev(() => { window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.review.ask('pato', { who: 'nico' }); })()); });
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'the word held up');
    check('slipping: the review question is now an introduction: "¡Mira! ¡Un pato!" with its picture held up', await g.ev(() => { const s = G.top(); return s.pages[0].t.indexOf('[pato]') >= 0 && s.opts.show === 'pato'; }));
    await g.until(() => G.top().shown >= G.top().chars(0, 3), null, 'the line'); await still(g, 'slip_shown');
    await g.tap(110, 120);
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10 && G.input.ready(), null, 'its one-unknown puzzle');
    const q = await g.ev(() => { const s = G.top(); return { mask: s.o.mask, pics: s.ch.map((c, k) => !!s.view(k).icon && !s.view(k).label), n: s.ch.length, ans: s.ch[s.o.answer].word, others: s.ch.filter((c, k) => k !== s.o.answer).map(c => G.words.met(c.word)) }; });
    check('slipping: ...then hear it and pick its picture among two known ones (one unknown)', q.ans === 'pato' && q.mask.includes('pato') && q.n === 3 && q.pics.every(Boolean) && q.others.every(Boolean), JSON.stringify(q));
    await still(g, 'slip_puzzle');
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => window.__r != null, null, 'the puzzle to end');
    const after = await g.ev(() => { const r = G.words.rec('pato'); return { box: r.box, st: r.st, slip: G.words.slipping('pato'), re: G.words.needsReintro('pato'), ev: G.hist.day().w.pato }; });
    check('slipping: the re-introduction is a cued use (no box or stage change); still slipping, not re-introduced again', after.box === before.box && after.st === before.st && after.slip && !after.re && /K$/.test(after.ev[1]), JSON.stringify([before, after]));
    // the next questions are normal ones; right twice and it's back
    await g.ev(() => { window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.review.ask('pato', { who: 'nico' }); })()); });
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10 && G.input.ready(), null, 'a normal question');
    check('slipping: re-introduced, the next review is a normal question again', await g.ev(() => G.top().constructor.name === 'Choice' && !G.top().o.reintro));
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await past(g, () => window.__r != null && G.top() === G.field, 'the answer');
    const one = await g.ev(() => G.words.slipping('pato'));
    await g.ev(() => { G.words.answerRight('pato', { mode: 'pic' }); });
    check('slipping: right on the first try once: still slipping; twice: not any more', one && await g.ev(() => !G.words.slipping('pato')));
    check('slipping: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  The dog's warm-up
// =====================================================================
// due words: [id, stage, box, days since last met or used]. In Villa Sol: casa (town, 4 days, box 1: 4 late) 9, concha
// (beach: another place, 1 day, box 1) 8, oso (forest: another place, 1 day, box 2) 7, perro (4 days, box 3: a 3-day gap,
// 1 late) 6, manzana (1 day, box 2) 5; hola isn't due, gato was met today
const WORDS = [['casa', 2, 1, 4], ['concha', 1, 1, 1], ['oso', 2, 2, 1], ['perro', 3, 3, 4], ['manzana', 2, 2, 1], ['hola', 3, 3, 1], ['pan', 2, 2, 2], ['cama', 2, 2, 1]];
async function warmup(browser) {
  const { ctx, g } = await openWith(browser, 'learn-warmup', true, { warmup: true });
  try {
    await game(g, { words: WORDS, notDue: ['hola', 'pan', 'cama'], today: ['gato'] });
    await g.until(() => !!G.warmup.cur(), null, 'the warm-up', 12000);
    const c0 = await cur(g);
    check('warm-up: the first time free on a new day, the dog\'s warm-up starts by itself', !!c0 && c0.phase === 'bring');
    check('warm-up: 4 due words, from earlier days, the latest and other places first: casa, concha, oso, perro', c0.ids.join() === 'casa,concha,oso,perro', c0.ids.join());
    check('warm-up: the map is locked meanwhile (a scene)', await g.ev(() => G.field.locked && !G.chapters.running()));
    await g.until(() => { const n = G.pet.npc(G.field); return n && n.pa && n.pa.k === 'bring' && G.frame - n.pa.f0 > 50; }, null, 'the dog with the card in his mouth');
    await still(g, 'wu_bring');
    check('warm-up: the dog trots off and comes back with a word card in his mouth (pet.js bring)', await g.ev(() => { const a = G.pet.npc(G.field).pa; return a.k === 'bring' && a.item && a.item.id === 'tarjeta'; }));
    await g.until(() => { const c = G.warmup.cur(); return c && c.phase === 'bring' && !!c.card && G.pet.npc(G.field).pa == null; }, null, 'the card dropped');
    await still(g, 'wu_dropped');
    check('warm-up: he drops it at your feet: the card on the ground (and a skip button with two arrows)', true);

    // the first card: casa (known): its picture held up, the big mic right beside it, word-only cards, the skip button
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.top().t > 10, null, 'the first card');
    const q1 = await g.ev(() => { const s = G.top(); return { ans: s.ch[s.o.answer].word, show: s.o.show, big: s.big(), mic: s.mic && s.mic.o.rect(), textOnly: s.ch.every((c, k) => !s.view(k).icon && !!s.view(k).label), skip: s.skip(), back: s.backXY(), n: s.ch.length, others: s.ch.filter((c, k) => k !== s.o.answer).map(c => c.word), met: s.ch.every(c => G.words.met(c.word)) }; });
    check('warm-up: a known word: its picture held up, the big mic beside it, the cards show only words (recall; no picture gives it away)', q1.ans === 'casa' && q1.show === 'casa' && q1.big && q1.mic && q1.mic.w >= 44 && q1.textOnly, JSON.stringify(q1));
    check('warm-up: ...two other met words, none sounding like it (no cama for casa: the mic hears them all)', q1.n === 3 && q1.met && q1.others.every(w => w !== 'cama'), JSON.stringify(q1.others));
    check('warm-up: ...and the skip button (a picture: two arrows), top left', q1.skip && q1.back[0] === 4 && q1.back[1] === 4);
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'warmup' && G.demo.cur.i >= 1, null, 'the ghost hand on the mic', 8000);
    await still(g, 'wu_q1_demo');
    check('warm-up: the first time, a ghost hand taps the big mic and a mouth talks', await g.ev(() => G.demo.cur.mic && G.demo.shown('warmup')));
    await g.until(() => !G.demo.cur, null, 'the demo to end', 8000);
    await still(g, 'wu_q1');
    // say it: the fake recognizer hears "la casa"
    await g.ev(() => { window.__sr.queue.push({ results: [['la casa', 0.93]] }); window.__said0 = G.st.saidCount('casa'); G.cards.log.length = 0; });
    await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
    await g.until(() => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'the spoken answer');
    check('warm-up: saying it answers it (a speaking star, its card grows the most)', await g.ev(() => G.st.saidCount('casa') === window.__said0 + 1) && await g.until(() => G.cards.log.some(l => l.id === 'casa' && l.how === 'say'), null, 'casa\'s card growing', 3000).then(() => true));
    await g.frames(10); await still(g, 'wu_q1_said');

    // the second card: concha (only met): hear it and pick it (picture and word cards; the answer heard, not shown)
    await past(g, () => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.top().t > 10 && G.warmup.cur().i === 1 && G.input.ready(), 'the second card');
    const q2 = await g.ev(() => { const s = G.top(); return { ans: s.ch[s.o.answer].word, show: s.o.show || null, mask: s.o.mask, big: s.big(), both: s.ch.every((c, k) => !!s.view(k).icon && !!s.view(k).label) }; });
    check('warm-up: a word only met: hear it, pick it (picture + word cards, the word heard: recognition)', q2.ans === 'concha' && !q2.show && q2.mask && q2.mask.includes('concha') && !q2.big && q2.both, JSON.stringify(q2));
    await still(g, 'wu_q2');
    check('warm-up: the progress: one card per word, the first one done', await g.ev(() => G.warmup.cur().res.join() === '1'));
    await g.ev(() => { G.cards.log.length = 0; });
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => G.cards.log.some(l => l.id === 'concha'), null, 'concha\'s card growing', 5000);
    check('warm-up: a tap answers too; its card grows', true);
    await g.until(() => { const n = G.pet.npc(G.field); return G.top() === G.field && n.pa && n.pa.k === 'wag'; }, null, 'the dog wagging', 6000);
    await still(g, 'wu_wag');
    // the rest by taps (a gold word card may come for oso: drive taps it)
    await g.drive(() => !G.warmup.cur() || G.warmup.cur().phase === 'party', 'the last cards');
    check('warm-up: four cards, all right', await g.ev(() => !G.warmup.cur() || G.warmup.cur().res.join() === '1,1,1,1'));
    await g.until(() => { const n = G.pet.npc(G.field); return n.pa && n.pa.k === 'jump'; }, null, 'the dog jumping', 6000).catch(() => {});
    await still(g, 'wu_party');
    await g.until(() => { const n = G.pet.npc(G.field); return n.pa && n.pa.k === 'eat'; }, null, 'the treat', 6000);
    await g.frames(30); await still(g, 'wu_treat');
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the end of the warm-up');
    check('warm-up: at the end the dog jumps for joy and gets a treat', await g.ev(() => window.__anims.includes('jump') && window.__anims.includes('eat') && window.__anims.includes('bring') && window.__anims.filter(k => k === 'wag').length >= 3));
    check('warm-up: ...and gives a heart', await g.ev(() => G.hearts.today('canelo') >= 1));
    const d = await today(g);
    check('warm-up: the history: each word\'s retrieval with its gap (casa said, 4 days; concha picked, 1 day...)', d.w.casa && d.w.casa[0] === 4 && d.w.casa[1] === 'S' && d.w.concha[0] === 1 && d.w.concha[1] === 'P' && d.w.oso && d.w.perro && d.w.perro[0] === 4, JSON.stringify(d.w));
    check('warm-up: saved: today\'s done, 4 of 4 right', await g.ev(() => { const w = G.hist.state().wu; return w.d === G.today() && w.n === 1 && w.last.right === 4 && w.last.of === 4; }));
    // the guide carries on after; the dog follows again
    await g.frames(40);
    check('warm-up: after it the map is free, the dog follows again, and the guide still points at something to do', await g.ev(() => { const n = G.pet.npc(G.field); return G.top() === G.field && !G.field.locked && !n.busy && !!G.guide.goal(G.field); }), await g.ev(() => JSON.stringify(G.guide.goal(G.field) && G.guide.goal(G.field).why)));
    await g.until(() => !!G.guide.at, null, 'the guide\'s arrow', 5000);
    await still(g, 'wu_after');
    // once a day: another map, the same day: nothing
    await g.ev(() => { G.goto('casa', 4, 4, 'up'); });
    await g.fieldIdle('casa'); await g.frames(90);
    check('warm-up: once a day: the same day on another map it doesn\'t come back', await g.ev(() => !G.warmup.cur() && G.warmup.wait(G.field) === 'done' && window.__starts.length === 1));
    check('warm-up: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function warmupDays(browser) {
  const { ctx, g } = await openWith(browser, 'learn-warmup2', true, { warmup: true });
  try {
    // ---- a story beat going on: chapter 2 starts by itself in town (the dog chases a butterfly) ----
    await game(g, { words: WORDS.concat([['ven', 3, 3, 1], ['guau', 3, 3, 1]]), done: ['c1'], demoSkip: true });
    await g.until(() => G.chapters.running() && G.top().constructor.name === 'Choice', null, 'chapter 2\'s first beat', 15000);
    check('warm-up: a story beat that starts by itself goes first (chapter 2)', await g.ev(() => !G.warmup.cur() && ['busy', 'story'].includes(G.warmup.wait(G.field))));
    await g.drive(() => (G.state.ch.step.c2 | 0) >= 1 && !G.chapters.running(), 'chapter 2\'s first beat');
    await g.until(() => !!G.warmup.cur(), null, 'the warm-up after the beat', 12000);
    check('warm-up: ...and only after the beat, the warm-up (never during it)', await g.ev(() => window.__starts.length === 1 && !window.__starts[0].running && (G.state.ch.step.c2 | 0) >= 1));
    // ---- skipped on the map, while the dog brings the card: the skip button ----
    await g.until(() => { const n = G.pet.npc(G.field); return n.pa && n.pa.k === 'bring' && G.frame - n.pa.f0 > 30; }, null, 'the dog bringing it');
    await still(g, 'wu_skip_map');
    const ev0 = await g.ev(() => Object.keys(G.hist.day().w).join());
    await g.tap(4 + 13, 4 + 11);
    await g.until(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, null, 'the warm-up to end', 5000);
    check('warm-up: the skip button ends it at once: the map free, nothing asked, the dog back to normal', await g.ev(ev0 => Object.keys(G.hist.day().w).join() === ev0 && !G.pet.npc(G.field).busy && !G.pet.npc(G.field).pa, ev0));
    check('warm-up: ...counted as skipped; not again today', await g.ev(() => { const w = G.hist.state().wu; return w.k === 1 && w.d === G.today() && G.warmup.wait(G.field) === 'done'; }));

    // ---- the next day: skipped on its first question ----
    await nextDay(g);
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.top().t > 10 && G.input.ready(), null, 'the first card, the next day', 15000);
    check('warm-up: the next day it comes again; the ghost hand only the first time', await g.ev(() => window.__starts.length === 2 && G.demo.shown('warmup') && (!G.demo.cur || G.demo.cur.kind !== 'warmup')));
    const first = await g.ev(() => G.warmup.cur().ids[0]);
    await g.tapBtn(await g.ev(() => G.top().backXY()));
    await g.until(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, null, 'the warm-up to end', 5000);
    check('warm-up: the skip button on a card ends it too, and that card isn\'t counted', await g.ev(first => !G.hist.day().w[first] && G.hist.state().wu.k === 2, first));

    // ---- the next day: a find-it puzzle going on holds it back; fewer than 2 words due: no warm-up that day ----
    await g.ev(() => { G.state.finds.pelota = { who: 'sofia', map: 'villa', at: '30,30', wrong: [], found: false }; });
    await nextDay(g);
    await g.fieldIdle('villa'); await g.frames(80);
    check('warm-up: a find-it puzzle going on holds it back', await g.ev(() => !G.warmup.cur() && G.warmup.wait(G.field) === 'find'));
    await g.ev(() => { G.state.finds.pelota.found = true; });
    await g.until(() => !!G.warmup.cur(), null, 'the warm-up once the puzzle is done', 8000);
    await g.ev(() => { G.warmup.skip(); });
    await g.until(() => !G.warmup.cur() && !G.field.locked, null, 'skipped');
    await g.ev(() => { const W = G.words; for (const id of W.list(1)) { const r = W.rec(id); Object.assign(r, { due: null, dd: W.day() + 9, dc: W.dayNum() + 9 }); } Object.assign(W.rec('casa'), { dd: W.day() + 1, dc: W.dayNum() + 1 }); });
    await nextDay(g);
    await g.fieldIdle('villa'); await g.frames(90);
    check('warm-up: with fewer than 2 words due it doesn\'t come that day', await g.ev(() => !G.warmup.cur() && G.hist.state().wu.none === 1 && G.warmup.wait(G.field) === 'done'));
    check('warm-up: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  The grown-ups' Learning page
// =====================================================================
// two weeks of play (one slipping word), then today
const SEED = () => {
  G.rngState = 12345;
  const W = G.words, H = G.hist, grow = G.cards.grow; G.cards.grow = () => 0;
  const plan = [['hola', 'perro', 'guau', 'ven'], ['gato', 'miau'], ['buenosdias', 'hueso', 'sientate'], ['si', 'no', 'manzana'], [], ['pelota', 'rojo'], ['pan', 'gracias', 'pato', 'cuac'], [], ['mar', 'concha', 'elsol'], ['oso', 'cueva', 'elbosque'], ['hoja', 'arbol'], [], ['vaca', 'cerdo'], ['nieve', 'frio']];
  for (let d = 0; d < plan.length; d++) {
    if (d) { G.debug.dayShift = -13 + d; W.newSession('load'); }
    if (d === 4 || d === 11) continue;
    for (const id of W.list(1)) {
      if (!W.due(id)) continue;
      const r = W.rec(id), p = 0.55 + 0.1 * r.st;
      if (id === 'cuac') { W.answerWrong(id); W.addTime(40); continue; }
      if (G.rand() < p) { if (G.rand() < 0.4) { G.st.said(id); W.answerRight(id, { said: true, mode: 'say' }); } else W.answerRight(id, { mode: G.rand() < 0.5 ? 'text' : 'pic' }); }
      else { W.answerWrong(id); W.addTime(20); W.answerRight(id, { firstTry: false }); }
      W.addTime(30);
    }
    for (const id of plan[d]) { if (G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'show'); W.addTime(100); W.answerRight(id, { mode: 'both' }); W.addTime(400); W.answerRight(id, { mode: 'text' }); }
    H.day().s += 900 + Math.round(G.rand() * 900);
  }
  G.cards.grow = grow;
};
async function dashboard(browser) {
  const { ctx, g } = await open(browser, 'learn-dash', true);
  try {
    await game(g, { day: -13, done: ['c1', 'c2', 'c3'], demoSkip: true });
    await g.ev(SEED);
    await g.ev(() => { G.debug.dayShift = 0; G.words.newSession('load'); const grow = G.cards.grow; G.cards.grow = () => 0; ['oso', 'manzana', 'perro'].forEach(id => G.words.answerRight(id, { mode: 'pic' })); G.cards.grow = grow; G.goto('villa', 22, 13, 'down'); });
    await g.fieldIdle('villa');
    await g.ev(() => { window.__speak.length = 0; G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps' && G.input.ready(), null, 'the grown-ups menu');
    const rows = await g.ev(() => G.top().rows().map(r => r.id));
    check('dashboard: the grown-ups menu has a Learning row (before Story progress), all rows on screen', rows.indexOf('learning') >= 0 && rows.indexOf('learning') === rows.indexOf('story') - 1 && await g.ev(() => { const s = G.top(), r = s.rowRect(s.rows().length - 1); return r.y + r.h <= 206; }), rows.join());
    await g.frames(6); await still(g, 'grownups');
    await g.tapRect(await g.ev(() => G.top().rowRect(G.top().rows().findIndex(r => r.id === 'learning'))));
    await g.until(() => G.top().constructor.name === 'LearningDash', null, 'the Learning page');
    await g.frames(8); await still(g, 'dash_overview');
    // the overview's numbers are the model's
    const ov = await g.ev(() => {
      const v = G.top().view(), o = v.overview, W = G.words, H = G.hist;
      // retention worked out again from the events: each word's first event of a day, a day or more after it was last met or used
      const first = {}; H.events({ all: true }).forEach(e => { const k = e.day + ':' + e.word; if (!(k in first)) first[k] = e; });
      const pts = Object.values(first).filter(e => e.gap >= 1 && e.kind !== 'parent' && !e.cued), rr = pts.filter(e => e.ok && e.first).length;
      const prac = H.events({ all: true }).filter(e => e.kind !== 'parent'), said = prac.filter(e => e.kind === 'say').length;
      return { o, ok: { met: o.met === W.count(1), known: o.known === W.count(2), rem: o.remembered === W.count(3), solid: o.solid === W.count(4), slip: o.slipping.join() === W.slipList().join() },
        ret: [o.ra.n, o.ra.right, pts.length, rr], spoken: [o.spoken.said, o.spoken.all, said, prac.length], days: o.days, today: o.today, mins: o.minutes };
    });
    check('dashboard: overview: met / known / remembered / solid are the word model\'s counts; slipping its list', Object.values(ov.ok).every(Boolean) && ov.o.met >= 25 && ov.o.slipping.includes('cuac'), JSON.stringify(ov.ok) + ' ' + JSON.stringify([ov.o.met, ov.o.known, ov.o.remembered, ov.o.solid, ov.o.slipping]));
    check('dashboard: overview: retention matches the events (first try, a day or more after)', ov.ret[0] === ov.ret[2] && ov.ret[1] === ov.ret[3] && ov.ret[0] > 10, JSON.stringify(ov.ret));
    check('dashboard: overview: said aloud = the share of practice said', ov.spoken[0] === ov.spoken[2] && ov.spoken[1] === ov.spoken[3] && ov.spoken[0] > 0, JSON.stringify(ov.spoken));
    check('dashboard: overview: days played (12 of the 14, today\'s new words included) and the minutes', ov.days === 12 && ov.mins >= 12 * 15, JSON.stringify([ov.days, ov.mins, ov.today]));
    const s0 = await g.ev(() => G.hist.day().s); await g.frames(130);
    check('dashboard: time on the Learning page isn\'t play time', await g.ev(s0 => G.hist.day().s === s0, s0));
    // retention
    await g.tapRect(await g.ev(() => G.top().tabRect(1)));
    await g.frames(6); await still(g, 'dash_retention');
    const rt = await g.ev(() => { const v = G.top().view(); return { tab: v.tab, r7: v.r7, by: v.byDay.map(d => d.n), r7b: G.hist.retention({ days: 7 }) }; });
    check('dashboard: retention: last 7 days and all time, with the counts; a bar per day for two weeks', rt.tab === 'Retention' && rt.r7.n === rt.r7b.n && rt.r7.pct === rt.r7b.pct && rt.by.length === 14 && rt.by.filter(Boolean).length >= 8, JSON.stringify(rt));
    // words by place
    await g.tapRect(await g.ev(() => G.top().tabRect(2)));
    await g.frames(6); await still(g, 'dash_words');
    const wv = await g.ev(() => {
      const s = G.top(), out = {};
      for (const z of G.zones.ids()) {
        s.zone = z; s.rowsCache = null; const L = s.rows(), W = G.words;
        out[z] = { n: L.length, all: L.every(r => G.zones.ofWord(r.id) === z), ok: L.every(r => r.met === W.met(r.id) && r.st === W.stage(r.id) && (!r.met || r.box === Math.max(1, W.rec(r.id).box)) && r.said === ((G.state.words[r.id] || {}).said | 0) && r.slip === W.slipping(r.id) && (!r.met || r.ago === W.gapDays(r.id))), metFirst: L.findIndex(r => !r.met) < 0 || L.slice(L.findIndex(r => !r.met)).every(r => !r.met) };
      }
      s.zone = 'villa'; s.rowsCache = null;
      return { out, total: Object.values(out).reduce((a, z) => a + z.n, 0), words: Object.keys(G.data.words).length };
    });
    check('dashboard: words: a tab per place, every word in exactly one (all ' + wv.words + ')', wv.total === wv.words && Object.values(wv.out).every(z => z.all), JSON.stringify(wv));
    check('dashboard: words: each row is the model: stage, box, said aloud, last met or used, slipping; met words first', Object.values(wv.out).every(z => z.ok && z.metFirst), JSON.stringify(wv.out));
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(await g.ev(() => G.top().rowRect(1)));
    check('dashboard: words: tap a word to hear it', await g.until(() => { const id = G.top().rows()[1].id; return window.__speak.some(s => s.text === G.baseForm(id)); }, null, 'the word said', 3000).then(() => true));
    await g.tapBtn(await g.ev(() => G.top().downXY()));
    check('dashboard: words: the list scrolls (the arrow; a finger drags it too)', await g.ev(() => G.top().scroll > 0));
    await g.frames(4); await still(g, 'dash_words_scrolled');
    await g.tapRect(await g.ev(() => G.top().zoneRect(2)));
    await g.frames(4); await still(g, 'dash_words_bosque');
    check('dashboard: words: another place\'s tab', await g.ev(() => G.top().zone === G.zones.ids()[2] && G.top().scroll === 0));
    // the word check
    await g.tapRect(await g.ev(() => G.top().tabRect(3)));
    await g.frames(6); await still(g, 'dash_check');
    await g.tapRect(await g.ev(() => G.top().startRect()));
    const ck = await g.ev(() => { const c = G.hist.checkCur(), W = G.words; return { n: c.ids.length, met: c.ids.every(id => W.met(id) && G.iconDrawn(id)), slip: c.ids.includes('cuac'), strong: c.ids.filter(id => W.stage(id) >= 3).length, uniq: new Set(c.ids).size }; });
    check('dashboard: check: 10 different words to ask, met, with pictures; slipping ones and strong ones mixed', ck.n === 10 && ck.met && ck.uniq === 10 && ck.slip && ck.strong >= 3, JSON.stringify(ck));
    await g.frames(4); await still(g, 'dash_check_card');
    const w0 = await g.ev(() => { const id = G.hist.checkCur().ids[0], r = G.words.rec(id); return { id, right: r.right, ev: (G.hist.day().w[id] || [0, ''])[1] }; });
    await g.tapRect(await g.ev(() => G.top().yesRect()));
    const w1 = await g.ev(() => { const id = G.hist.checkCur().ids[1], r = G.words.rec(id); return { id, wrong: r.wrong, box: r.box }; });
    check('dashboard: check: the card just answered stays a moment with its mark (taps wait)', await g.ev(w0 => { const h = G.top().held(); return !!h && h.id === w0.id && h.ok === 1; }, w0));
    const free = () => g.until(() => !G.top().held(), null, 'the check\'s next word', 3000);
    await free(); await g.tapRect(await g.ev(() => G.top().noRect()));
    check('dashboard: check: right is a recall in the model and in the history (C)', await g.ev(w0 => G.words.rec(w0.id).right === w0.right + 1 && G.hist.day().w[w0.id][1] === w0.ev + 'C', w0));
    check('dashboard: check: not yet is a miss (back to box 2 from box 4+, else 1) and in the history (c)', await g.ev(w1 => { const r = G.words.rec(w1.id); return r.wrong === w1.wrong + 1 && r.box === (w1.box >= 4 ? 2 : 1) && /c$/.test(G.hist.day().w[w1.id][1]); }, w1));
    await g.frames(2); await still(g, 'dash_check_answered');
    await free(); await g.frames(2); await still(g, 'dash_check_next');
    await g.tapRect(await g.ev(() => G.top().skipRect()));
    for (let i = 3; i < 10; i++) { await free(); await g.tapRect(await g.ev(i => i % 3 ? G.top().yesRect() : G.top().noRect(), i)); }
    await free();
    const last = await g.ev(() => ({ cur: G.hist.checkCur(), last: G.hist.checkLast(), view: G.top().view().last }));
    check('dashboard: check: done: its score (5 of 9: one skipped) is the last check\'s, shown on the page and the overview', !last.cur && last.last.right === 5 && last.last.of === 9 && last.view.right === 5, JSON.stringify(last.last));
    await g.frames(6); await still(g, 'dash_check_done');
    // tonight's question
    await g.tapRect(await g.ev(() => G.top().tabRect(4)));
    await g.frames(6); await still(g, 'dash_tonight');
    const tq = await g.ev(() => { const L = G.dashboard.tonights(); return { L: L.map(q => ({ es: q.es, words: q.words, met: q.words.every(id => G.words.met(id)), en: !!q.en, ans: !!(q.ans && q.ans.es && q.ans.en), why: q.why })), first: G.top().view().tonight }; });
    check('dashboard: tonight: a Spanish question with its English and an answer, from today\'s words first', tq.L.length >= 3 && tq.L.every(q => q.en && q.ans) && /today/.test(tq.L[0].why), JSON.stringify(tq.L.slice(0, 4)));
    check('dashboard: tonight: only words the child has met (the question and its answer)', tq.L.every(q => q.met), JSON.stringify(tq.L.filter(q => !q.met)));
    check('dashboard: tonight: the templates: what an animal says, where it lives, a color, likes', tq.L.some(q => /^¿Qué dice /.test(q.es)) && tq.L.some(q => /^¿Dónde vive /.test(q.es)) && tq.L.some(q => /^¿De qué color /.test(q.es)), tq.L.map(q => q.es).join(' | '));
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(await g.ev(() => G.top().anotherRect()));
    check('dashboard: tonight: another question (and it is said)', await g.until(q0 => { const q = G.top().view().tonight; return q.es !== q0.es && window.__speak.some(s => s.text === q.es); }, tq.first, 'another question, said', 3000).then(() => true));
    await g.frames(6); await still(g, 'dash_tonight2');
    // share: the share sheet, else the clipboard
    await g.ev(() => { window.__shared = null; navigator.share = o => { window.__shared = o; return Promise.resolve(); }; });
    await g.tapRect(await g.ev(() => G.top().shareRect()));
    await g.until(() => !!window.__shared, null, 'the share sheet', 3000);
    const sh = await g.ev(() => window.__shared.text);
    check('dashboard: share: the summary as text (name, days, words, retention, said aloud, slipping, the check, tonight\'s question)', /Luz/.test(sh) && /Played 12 days/.test(sh) && /Retention/.test(sh) && /Said aloud/.test(sh) && /Slipping/.test(sh) && /cuac/.test(sh) && /Last word check: 5 of 9/.test(sh) && /Tonight's question: ¿/.test(sh), sh);
    await g.ev(() => { delete navigator.share; navigator.share = undefined; window.__clip = null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__clip = t; return Promise.resolve(); } } }); });
    await g.frames(45);
    await g.tapRect(await g.ev(() => G.top().shareRect()));
    await g.until(() => !!window.__clip, null, 'the clipboard', 3000);
    check('dashboard: share: without a share sheet, the clipboard (the button says Copy)', await g.ev(() => window.__clip === G.dashboard.shareText() && /Copied/.test(G.top().note)));
    await g.frames(8); await still(g, 'dash_copied');
    await g.tapRect(await g.ev(() => G.top().tabRect(0)));
    await g.frames(6); await still(g, 'dash_overview_after');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'GrownUps', null, 'back in the grown-ups menu');
    check('dashboard: the close button goes back to the grown-ups menu', true);
    check('dashboard: the save stays small after two weeks', await g.ev(() => JSON.stringify(G.state.hist).length < 6000), await g.ev(() => JSON.stringify(G.state.hist).length));
    check('dashboard: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Learning plan 2, Phase 1: measure and review', [['the learning history', history], ['slipping words', slipping], ['the dog\'s warm-up (iPad)', warmup], ['the warm-up across days: never during a beat, skipping, too few words (iPad)', warmupDays], ['the grown-ups\' Learning page (iPad)', dashboard]]);
