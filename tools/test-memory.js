// The memory engine (src/words.js, docs/AUDIT_2026-10.md Sprint 2 items 2.1-2.4 and 2.9): review gaps in calendar days
// (1, 3, 7, 16, 35, 75, 150), a night at home in the same sitting moves nothing, an older save upgraded on load with
// nothing lost and not everything due, a forgotten word really drops back, honest stages (gold on a later day, solid
// from recall on 2 later days 2+ apart; listen taps, cued picks and forced pairs never promote; cards never shrink),
// the most overdue for its gap reviewed first, and review-first pacing (a busy day defers the open world's new words:
// seen and heard, in the album, queued, a due word asked instead; the queue first when there's room; 8 a day at most;
// the story always introduces its words). Back after a break (W.spread, W.BREAK): the reviews due at once are spread
// over the next days, the strongest first; and a word held back by the pacing comes on the first free day (warmup.js).
//   NODE_PATH=$(npm root -g) node tools/test-memory.js [screenshot dir]     (ONLY=pacing,upgrade to run some)
'use strict';
const { open, check, run } = require('./harness');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);

// a game on the map (not saved anywhere): the dog is hers, the opener behind her; o.old: [id, st, box, daysAgoMet, dueIn
// (calendar days from today; 0: due today, negative: overdue)] met on an earlier day; o.done: chapters done
const game = (g, o = {}) => g.ev(o => {
  G.debug.dayShift = 0;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of o.done || ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
  W.newSession('new');
  const dn = W.dayNum(), ds = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
  for (const [id, st, box, ago, dueIn] of o.old || []) {
    if (G.animals && G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 };
    W.meet(id, 'test'); const r = W.rec(id), a = ago == null ? 3 : ago;
    Object.assign(r, { st, box, fu: 0, due: null, ds: null, dc: dn + (dueIn || 0), dd: W.day() + (dueIn || 0), mdate: ds(dn - a), mdn: dn - a, md: 0, ms: 0, ld: dn - 1, learned: st >= 3, gold: st >= 3 });
  }
  G.state.wm.d0 = dn - 10;
  G.cards.grow = grow; G.budget.flush();
  G.goto(o.map || 'villa', o.x || 22, o.y || 13, o.dir || 'down');
}, o);
const noErrors = (g, name) => check(name + ': no console errors', !g.errors.length, g.errors.join('\n'));

// ---------- 2.1: the gaps, in calendar days; a night at home moves nothing ----------
async function gaps(browser) {
  const { ctx, g } = await open(browser, 'mem-gaps', true);
  try {
    await game(g);
    await g.fieldIdle('villa');
    const r = await g.ev(() => {
      const W = G.words, o = { ladder: W.BOX_DAYS.join() };
      W.meet('gato', 'show'); const r = W.rec('gato');
      W.addTime(91); W.answerRight('gato', { mode: 'both' }); W.addTime(361); W.answerRight('gato', { mode: 'both' });
      o.after = { box: r.box, in: r.dc - W.dayNum(), fu: r.fu };
      const seen = [];
      for (let k = 1; k <= 300; k++) { // a session on every calendar day: answered right whenever it is due
        G.debug.dayShift = k; W.newSession('load');
        if (W.due('gato')) { W.answerRight('gato', { mode: 'text' }); seen.push([k, r.box, r.dc - W.dayNum()]); }
      }
      o.seen = seen; G.debug.dayShift = 0;
      return o;
    });
    check('gaps: the ladder is 0, 0, 1, 3, 7, 16, 35, 75, 150 calendar days (box 1: the same session)', r.ladder === '0,0,1,3,7,16,35,75,150', r.ladder);
    check('gaps: after its two follow-ups a word is in box 2, due the next calendar day', r.after.box === 2 && r.after.in === 1 && r.after.fu === 0, JSON.stringify(r.after));
    check('gaps: right every time it is due: back after 1, 3, 7, 16, 35, 75, 150 days, then every 150', JSON.stringify(r.seen.map(s => s[0])) === JSON.stringify([1, 4, 11, 27, 62, 137, 287]) && r.seen.map(s => s[2]).join() === '3,7,16,35,75,150,150' && r.seen[r.seen.length - 1][1] === 8, JSON.stringify(r.seen));

    // a night at home in the same sitting: the game's day moves on, the memory doesn't
    await game(g, { old: [['casa', 2, 2, 2, 1], ['perro', 3, 4, 5, 2], ['arbol', 2, 3, 4, 3], ['flor', 2, 2, 2, 0]] });
    const n = await g.ev(() => {
      const W = G.words, o = {};
      W.meet('pan', 'show'); W.addTime(91); W.answerRight('pan', { mode: 'both' }); // (its second follow-up waits 6 minutes)
      W.meet('leche', 'show');                                                       // (its first follows in 1.5 minutes)
      W.answerWrong('flor');                                                         // (a miss: back in 1.5 minutes)
      const all = ['casa', 'perro', 'arbol', 'pan', 'leche', 'flor'];
      o.before = all.filter(W.due); o.day0 = W.day(); o.bl0 = G.budget.backlog();
      W.newSession('night'); // (day.js: a night at home, the sun comes up: a new game day and session)
      o.after = all.filter(W.due); o.day1 = W.day(); o.bl1 = G.budget.backlog(); o.review = G.review.due(9);
      return o;
    });
    check('night: a night at home starts a new game day (favours, chapters, the dog: W.day())', n.day1 === n.day0 + 1, JSON.stringify(n));
    check('night: ...but nothing falls due because of it: words due tomorrow and this sitting\'s follow-ups and misses wait', n.before.length === 0 && n.after.length === 0 && n.review.length === 0 && n.bl1 === 0, JSON.stringify(n));
    const n2 = await g.ev(() => { const W = G.words; W.addTime(400); const a = ['pan', 'leche', 'flor'].filter(W.due); G.debug.dayShift = 1; W.newSession('load'); const b = ['casa'].filter(W.due); G.debug.dayShift = 0; return { a, b }; });
    check('night: the follow-ups still come when their minutes are up, and tomorrow\'s word tomorrow (calendar)', n2.a.join() === 'pan,leche,flor' && n2.b.join() === 'casa', JSON.stringify(n2));
    noErrors(g, 'gaps');
  } finally { await ctx.close(); }
}

// ---------- 2.1 / 2.3: a save made before the new rules, upgraded on load ----------
async function upgrade(browser) {
  const { ctx, g } = await open(browser, 'mem-upgrade', true);
  try {
    // a save as the older code wrote it: boxes 1-5 (gaps 0, 1, 2, 4, 8 days), dd (game day) and dc (calendar day),
    // gold and solid words, grown cards, a follow-up and a miss left from the last sitting, a phrase, a pre-stage record
    const want = await g.ev(() => {
      const W = G.words, dn = W.dayNum(), ds = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
      const day = 14, sess = 20, clock = 9000;
      const rec = (st, box, o) => Object.assign({ st, box, due: null, dd: null, dc: null, fu: 0, met: 100, ms: 3, md: 2, mdate: ds(dn - 12), how: 'show', last: 8000, n: 9, right: 6, wrong: 1, said: 0, cue: 0, ret: 7, ft: {}, star: ds(dn - 1), s3: st >= 3 ? 5 : null, gold: st >= 3, learned: st >= 3, ld: dn - 1, gp: 0 }, o);
      const words = {
        gato: rec(4, 5, { dd: day + 8, dc: dn + 8, gp: 40 }),         // solid, top box: due in 8 days
        perro: rec(3, 4, { dd: day + 3, dc: dn + 3, gp: 25 }),        // gold
        casa: rec(3, 3, { dd: day + 1, dc: dn + 1, gp: 22 }),         // gold, due tomorrow
        hola: rec(2, 2, { dd: day, dc: dn, gp: 8 }),                  // due today
        manzana: rec(2, 3, { dd: day + 2, dc: null, gp: 6 }),         // a game-day date only
        pan: rec(1, 1, { fu: 1, due: clock - 10, ds: sess, gp: 0, mdate: ds(dn) }), // met in the last sitting, its follow-up not asked
        leche: rec(2, 1, { due: clock + 50, ds: sess, gp: 4 }),       // missed in the last sitting
        agua: rec(4, 5, { dd: day - 2, dc: dn - 2, gp: 60 }),         // solid, overdue
        flor: rec(3, 4, { dd: day + 4, dc: dn + 4, gp: 50 }),         // gold, grown past its stage's cap
        arbol: rec(2, 2, { dd: day + 1, dc: dn + 1, gp: 30 }),        // known, grown past its stage's cap
        adios: { learned: true, right: 3, wrong: 0 },                 // a record from before the stages
      };
      const s = G.st.parse({ words, wm: { clock, sess, day, date: G.today() }, flags: { intro: true, canelo: true, petStart: true, opener: true }, quests: { c1: 'done', c2: 'done', c3: 'done' }, name: 'Luz', look: G.data.defaultLook('nina'), stars: 77, album: { gato: { first: 1, map: 'villa', n: 3, said: true } }, phrases: { r: { f_quiero: rec(2, 2, { dd: day + 1, dc: dn + 1, gp: 9 }) }, intro: {} } });
      G.st.erase(1); G.store.set(G.st.slotKey(1), s);
      // what each card showed under the older code (cards.js: the stage's floor and cap)
      const FLOOR = [0, 0, 2, 20, 32], CAP = st => (st < 3 ? 19 : st < 4 ? 45 : 1e9), shown = r => (r.st == null ? null : Math.max(FLOOR[r.st] || 0, Math.min(CAP(r.st), r.gp || 0)));
      const o = { dn, cards: {}, st: {} };
      for (const id in words) { o.cards[id] = shown(words[id]); o.st[id] = words[id].st; }
      return o;
    });
    await g.ev(() => { G.st.loadSlot(1); G.goto('villa', 22, 13, 'down'); });
    await g.fieldIdle('villa');
    const u = await g.ev(want => {
      const W = G.words, ids = Object.keys(want.st), o = { dn: W.dayNum() };
      o.v2 = G.state.wm.v2; o.ms = G.state.wm.ms; o.d0 = G.state.wm.d0;
      o.st = {}; o.box = {}; o.in = {}; o.cards = {}; o.due = [];
      for (const id of ids) { const r = W.rec(id); o.st[id] = r.st; o.box[id] = r.box; o.in[id] = r.dc == null ? null : r.dc - o.dn; o.cards[id] = G.cards.pts(id); if (W.due(id)) o.due.push(id); }
      o.phrase = { st: W.stage('f_quiero'), box: W.rec('f_quiero').box, in: W.rec('f_quiero').dc - o.dn };
      o.stars = G.state.stars; o.album = !!G.state.album.gato; o.saved = !!G.store.get(G.st.slotKey(1));
      return o;
    }, want);
    const ex = { gato: 4, perro: 3, casa: 2, hola: 2, manzana: 2, pan: 1, leche: 1, agua: 4, flor: 3, arbol: 2 };
    check('upgrade: the switch day is today (G.state.wm.v2); the memory\'s session and the first day are set', u.v2 === u.dn && u.ms >= 21 && u.d0 <= u.dn - 12, JSON.stringify([u.v2, u.dn, u.ms, u.d0]));
    check('upgrade: every stage kept: solid stays solid, gold stays gold (and the pre-stage record migrates as before)', Object.keys(ex).every(id => u.st[id] === want.st[id]) && u.st.adios === 3, JSON.stringify(u.st));
    check('upgrade: old boxes 1-5 onto the new ladder: 1 -> 1, 2 -> 2, 3 -> 2, 4 -> 3, 5 -> 4', Object.keys(ex).every(id => u.box[id] === ex[id]) && u.phrase.box === 2, JSON.stringify(u.box));
    check('upgrade: each word keeps its calendar due date (a game-day date only: its days still to go)', u.in.gato === 8 && u.in.perro === 3 && u.in.casa === 1 && u.in.hola === 0 && u.in.manzana === 2 && u.in.agua === -2 && u.in.flor === 4 && u.phrase.in === 1, JSON.stringify(u.in));
    check('upgrade: not everything is due: only what was due anyway (today, overdue, last sitting\'s follow-up and miss, the pre-stage record)', u.due.sort().join() === 'adios,agua,hola,leche,pan', u.due.join());
    check('upgrade: every card shows exactly what it showed before (nothing shrinks)', Object.keys(ex).every(id => u.cards[id] === want.cards[id]), JSON.stringify([u.cards, want.cards]));
    check('upgrade: stars, the album and the phrase kept; saved', u.stars === 77 && u.album && u.phrase.st === 2 && u.saved);
    // the next gap after a right answer: never much shorter than before (box 3 was +4 days, now +3; box 5 was +8, now +16)
    const nx = await g.ev(() => {
      const W = G.words, o = {};
      G.debug.dayShift = 1; W.newSession('load');
      W.answerRight('casa', { mode: 'text' }); o.casa = W.rec('casa').dc - W.dayNum();
      G.debug.dayShift = 8; W.newSession('load');
      W.answerRight('gato', { mode: 'text' }); o.gato = W.rec('gato').dc - W.dayNum();
      o.again = G.words.rec('gato').v; W.upgrade(); o.box = W.rec('gato').box; G.debug.dayShift = 0;
      return o;
    });
    check('upgrade: the next gaps: old box 3 -> +3 days (was +4), old box 5 -> +16 (was +8)', nx.casa === 3 && nx.gato === 16, JSON.stringify(nx));
    check('upgrade: done once (W.upgrade again changes nothing)', nx.again === 2 && nx.box === 5, JSON.stringify(nx));
    await g.ev(() => { G.st.close(); G.st.erase(1); });
    noErrors(g, 'upgrade');
  } finally { await ctx.close(); }
}

// ---------- 2.2 / 2.3: misses, gold, solid, and what never counts ----------
async function stages(browser) {
  const { ctx, g } = await open(browser, 'mem-stages', true);
  try {
    await game(g, { old: [['gato', 2, 6, 40, 0], ['perro', 2, 3, 10, 0], ['casa', 2, 2, 3, 0], ['arbol', 2, 2, 3, 0], ['flor', 2, 2, 3, 0], ['pan', 1, 1, 2, 0], ['leche', 1, 1, 2, 0], ['agua', 1, 1, 2, 0]] });
    await g.fieldIdle('villa');
    const m = await g.ev(() => {
      const W = G.words, o = {}, dn = () => W.dayNum(), at = id => { const r = W.rec(id); return { box: r.box, st: r.st, in: r.dc == null ? null : r.dc - dn(), soon: r.due != null ? Math.round(r.due - W.now()) : null }; };
      // a forgotten word drops back: box 6 -> 2, box 3 -> 1; due again in 1.5 minutes
      W.answerWrong('gato'); W.answerWrong('perro'); o.miss = [at('gato'), at('perro')];
      // the quick re-ask helps, but the same calendar day it can't climb past box 2, nor turn gold
      W.addTime(95); W.answerRight('gato', { mode: 'text' }); W.answerRight('perro', { mode: 'text' }); o.reask = [at('gato'), at('perro')];
      // it climbs again from the next day
      G.debug.dayShift = 1; W.newSession('load'); W.answerRight('gato', { mode: 'text' }); o.next = at('gato');
      G.debug.dayShift = 0; W.newSession('load');
      return o;
    });
    check('miss: a forgotten word drops back to box 2 (from box 4+) or box 1, due again in 1.5 minutes', m.miss[0].box === 2 && m.miss[1].box === 1 && m.miss[0].soon === 90, JSON.stringify(m.miss));
    check('miss: the re-ask the same day can\'t lift it above box 2 (due tomorrow) or make it gold', m.reask[0].box === 2 && m.reask[0].in === 1 && m.reask[1].box === 2 && m.reask[1].in === 1 && m.reask.every(x => x.st === 2), JSON.stringify(m.reask));
    check('miss: the next day it climbs again (box 3: +3 days) and, recalled, turns gold', m.next.box === 3 && m.next.in === 3 && m.next.st === 3, JSON.stringify(m.next));

    const s = await g.ev(() => {
      const W = G.words, o = {}, H = G.hist;
      // gold: a recall-type answer the day it was met isn't enough; on a later calendar day it is
      W.meet('pelota', 'show'); W.addTime(91); W.answerRight('pelota', { mode: 'both' }); W.addTime(361);
      W.answerRight('pelota', { mode: 'text' }); W.answerRight('pelota', { mode: 'match' }); W.answerRight('pelota', { mode: 'say', said: true }); W.answerRight('pelota', { mode: 'parent', parent: true });
      o.sameDay = W.stage('pelota');
      G.debug.dayShift = 1; W.newSession('load'); W.answerRight('pelota', { mode: 'text' }); o.nextDay = W.stage('pelota');
      // solid: recall from memory on 2 later calendar days, 2+ days apart (word-only cards every day never make it)
      for (let k = 2; k <= 6; k++) { G.debug.dayShift = k; W.newSession('load'); W.answerRight('pelota', { mode: 'text', firstTry: true }); }
      o.textOnly = W.stage('pelota');
      G.debug.dayShift = 7; W.newSession('load'); W.answerRight('pelota', { mode: 'say', recall: true, said: true }); o.r1 = [W.stage('pelota'), W.recallDays('pelota').length];
      G.debug.dayShift = 8; W.newSession('load'); W.answerRight('pelota', { mode: 'pic', recall: true }); o.r2 = [W.stage('pelota'), W.recallDays('pelota').length]; // (the next day: only 1 apart)
      G.debug.dayShift = 9; W.newSession('load'); W.answerRight('pelota', { mode: 'pic', recall: true }); o.r3 = W.stage('pelota');
      // picture-only recall counts only on a later day than the last time it was met or used (the same day it's a pick)
      G.debug.dayShift = 10; W.newSession('load');
      W.answerRight('casa', { mode: 'text' }); W.answerRight('casa', { mode: 'pic', recall: true }); o.picSame = W.recallDays('casa').length;
      o.letters = H.day().w.casa[1];
      // a grown-up's check is a recall from memory too, and C counts as one
      W.answerRight('arbol', { parent: true, mode: 'parent', noStar: true, noGrow: true }); o.check = [W.stage('arbol'), W.recallDays('arbol').length];
      // listen-and-do taps, cued picks and forced pairs: no stage (and cued / forced: no box)
      const b = id => W.rec(id).box;
      W.addTime(5000); const pb = [b('pan'), b('leche'), b('agua')];
      W.answerRight('pan', { mode: 'listen' }); W.answerRight('leche', { cued: true }); W.answerRight('agua', { forced: true }); // (forced: the last page-puzzle pair joining by itself, src/intro.js)
      o.never = { st: ['pan', 'leche', 'agua'].map(W.stage), box: [b('pan') - pb[0], b('leche') - pb[1], b('agua') - pb[2]] };
      W.answerRight('flor', { mode: 'listen' }); W.answerRight('flor', { mode: 'listen' }); o.listenGold = W.stage('flor');
      o.letters2 = ['pan', 'leche', 'agua'].map(id => H.day().w[id][1]).join();
      o.mem = H.events({ days: 1 }).filter(e => e.mem).map(e => e.word + ':' + e.kind);
      o.pmem = H.events({ all: true }).filter(e => e.word === 'pelota' && e.mem).map(e => e.kind).join();
      o.pletters = H.events({ all: true }).filter(e => e.word === 'pelota').map(e => e.kind[0] + (e.mem ? '*' : '')).join('');
      G.debug.dayShift = 0;
      return o;
    });
    check('gold: recall-type answers (word cards, a match, said, a grown-up\'s check) the day it was met: still known', s.sameDay === 2, JSON.stringify(s));
    check('gold: a recall-type answer on a later calendar day: gold', s.nextDay === 3, JSON.stringify(s));
    check('solid: word-only cards on 5 more days never make it solid (that\'s recognition, not recall)', s.textOnly === 3, JSON.stringify(s));
    check('solid: recalled from memory on one day, then the next: still gold (not 2 days apart)', s.r1[0] === 3 && s.r1[1] === 1 && s.r2[0] === 3 && s.r2[1] === 2, JSON.stringify(s));
    check('solid: recalled again 2 days after the first: solid', s.r3 === 4, JSON.stringify(s));
    check('recall: picture-only cards the same day it was just used: a pick (P), not a recall', s.picSame === 0 && s.letters === 'RP', JSON.stringify(s));
    check('recall: a grown-up\'s check (C) is a recall from memory on a later day: gold', s.check[0] === 3 && s.check[1] === 1, JSON.stringify(s));
    check('never: a listen-and-do tap, a cued pick and a forced pair move no stage; cued and forced no box', s.never.st.join() === '1,1,1' && s.never.box[1] === 0 && s.never.box[2] === 0 && s.listenGold === 2, JSON.stringify(s.never));
    check('history: the new letters: F said from memory (a say), V recalled from pictures (a recall), C a check; a forced pair is a cued pick (K)', s.letters2 === 'L,K,K' && s.pmem === 'parent,say,recall,recall' && s.mem.includes('arbol:parent'), JSON.stringify(s));
    noErrors(g, 'stages');
  } finally { await ctx.close(); }
}

// ---------- 2.3: the page puzzle's last pair is forced; cards never shrink ----------
async function puzzle(browser) {
  const { ctx, g } = await open(browser, 'mem-puzzle', true);
  try {
    await game(g, { old: [['arbol', 2, 2, 3, 0], ['flor', 2, 2, 3, 0], ['fuente', 2, 2, 3, 0], ['banco', 2, 2, 3, 0]], x: 13, y: 10 });
    await g.fieldIdle('villa');
    await g.ev(() => { window.__w = G.pages.open('cosas', ['arbol', 'flor', 'fuente', 'banco']); });
    await g.until(() => G.top().constructor.name === 'PagePuzzle' && G.top().t > 10 && G.input.ready(), null, 'the page puzzle');
    const order = [];
    for (let i = 0; i < 4; i++) {
      const p = await g.ev(() => { const s = G.top(), k = s.pics.findIndex((p, k) => !s.match[k]); return { id: s.pics[k], p: s.picRect(k), w: s.wordRect(s.words.indexOf(s.pics[k])) }; });
      order.push(p.id); await g.tapRect(p.p); await g.tapRect(p.w); await g.frames(4);
    }
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the end of the puzzle');
    const r = await g.ev(order => ({ st: order.map(G.words.stage), ev: order.map(id => G.hist.day().w[id][1]), cards: order.map(G.cards.pts) }), order);
    check('puzzle: the first three matches (on a later day): gold; the last, forced pair: no stage (a cued pick, K)', r.st.slice(0, 3).join() === '3,3,3' && r.st[3] === 2 && r.ev.join() === 'R,R,R,K', JSON.stringify(r));
    // cards never shrink: grown before the switch, the stricter stages don't pull them back
    const c = await g.ev(() => {
      const W = G.words, r = W.rec('banco'); r.gp = 19; const before = G.cards.pts('banco');
      for (let i = 0; i < 6; i++) W.answerRight('banco', { mode: 'listen' }); // (more growth, no stage)
      const mid = G.cards.pts('banco'); r.gk = 30; const kept = G.cards.pts('banco'); r.gk = 0;
      return { before, mid, kept, st: W.stage('banco') };
    });
    check('cards: a grown card never shrinks (its stage\'s cap holds it, and a card kept from the switch keeps its points)', c.mid >= c.before && c.kept === 30 && c.st === 2, JSON.stringify(c));
    noErrors(g, 'puzzle');
  } finally { await ctx.close(); }
}

// ---------- 2.4: when time is short, the most overdue for its gap first ----------
async function order(browser) {
  const { ctx, g } = await open(browser, 'mem-order', true);
  try {
    // [id, stage, box, days ago met, due in]: casa box 2 a day late (1 gap late), perro box 5 4 days late (1/4 of its gap),
    // gato box 3 6 days late (2 gaps), arbol box 6 and flor box 2 due today; leche missed a moment ago; pan just met
    await game(g, { old: [['casa', 2, 2, 9, -1], ['perro', 3, 5, 60, -4], ['gato', 3, 3, 20, -6], ['arbol', 3, 6, 90, 0], ['flor', 2, 2, 5, 0], ['leche', 2, 4, 30, 0]] });
    await g.fieldIdle('villa');
    const o = await g.ev(() => {
      const W = G.words;
      W.meet('pan', 'show'); W.answerWrong('leche'); W.addTime(95);
      return { due: G.review.due(9), late: ['gato', 'casa', 'perro', 'arbol', 'flor'].map(id => Math.round(W.lateness(id) * 100) / 100) };
    });
    check('order: follow-ups first, then misses, then the most overdue for its gap (2 gaps, 1, 1/4), then due today by the longer gap', o.due.join() === 'pan,leche,gato,casa,perro,arbol,flor' && o.late.join() === '2,1,0.25,0,0', JSON.stringify(o));
    check('order: (the lowest box first would have put flor and casa before gato: the words closest to long-term memory were the ones skipped)', true);
    noErrors(g, 'order');
  } finally { await ctx.close(); }
}

// ---------- 2.9: review-first pacing, the rules ----------
async function rules(browser) {
  const { ctx, g } = await open(browser, 'mem-rules', true);
  try {
    const due8 = ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan', 'leche', 'agua'].map(id => [id, 2, 2, 3, 0]);
    await game(g, { old: due8 });
    await g.fieldIdle('villa');
    const r = await g.ev(() => {
      const B = G.budget, W = G.words, o = {};
      // the floor: a little new every play day even with a backlog (2: the first two of the day come, a third waits)
      o.floor = { floor: B.PACE.floor, can: B.canIntro(1), why2: B.why(2), why3: B.why(3) };
      B.PACE.floor = 0; // (the rules below, without the floor)
      o.start = { bl: B.backlog(), why: B.why(), can: B.canIntro(1), story: B.canIntro(1, { story: true }), target: B.target() };
      // reviewed down to 5: room again, up to today's target (2 on the first play day of 2.5 a day: the half carries)
      ['casa', 'perro', 'gato'].forEach(id => W.answerRight(id, { mode: 'text' }));
      o.five = { bl: B.backlog(), can: B.canIntro(1) };
      W.meet('pelota', 'show'); W.meet('hola', 'show');
      o.atTarget = { today: B.today(), why: B.why(), bl: B.backlog() };
      // the follow-ups of today's new words are never the backlog; with every due word reviewed: more, up to 8
      ['arbol', 'flor', 'pan', 'leche', 'agua'].forEach(id => W.answerRight(id, { mode: 'text' }));
      o.zero = { bl: B.backlog(), pending: B.pending(), can: B.canIntro(1) };
      ['uno', 'dos', 'tres', 'rojo', 'azul', 'verde'].forEach(id => { if (B.canIntro(1)) W.meet(id, 'show'); });
      o.cap = { today: B.today(), why: B.why(), story: B.canIntro(1, { story: true }) };
      // the next play day: the target's half carried (3), the count starts again
      G.debug.dayShift = 1; W.newSession('load'); o.day2 = { target: B.target(), today: B.today() };
      // year 2 and 3 of the save: slower
      G.state.wm.d0 = W.dayNum() - 400; o.y2 = B.rate(); G.state.wm.d0 = W.dayNum() - 800; o.y3 = B.rate();
      G.debug.dayShift = 0;
      // phrases are new items too: a busy day holds them back, and the open switch lets everything through
      o.phrase = (() => { G.debug.noPhrases = false; const was = G.phrase.off; G.phrase.off = () => false; const v = [G.phrase.canIntro('f_quiero')]; G.budget.OPEN = true; v.push(B.canIntro(50), G.phrase.canIntro('f_quiero')); G.budget.OPEN = false; G.phrase.off = was; return v; })();
      B.PACE.floor = o.floor.floor;
      return o;
    });
    check('pacing: the floor: with 8 due and nothing new yet today, the first 2 new items still come; a third waits', r.floor.floor === 2 && r.floor.can && r.floor.why2 === null && r.floor.why3 === 'backlog', JSON.stringify(r.floor));
    check('pacing: 8 words due today: the backlog is 8, no new word in the open world; the story may', r.start.bl === 8 && r.start.why === 'backlog' && !r.start.can && r.start.story, JSON.stringify(r.start));
    check('pacing: reviewed down to 5: room again', r.five.bl === 5 && r.five.can, JSON.stringify(r.five));
    check('pacing: today\'s soft target met (2 on the first day of 2.5 a day), with reviews still due: no more', r.atTarget.today === 2 && r.atTarget.why === 'target', JSON.stringify(r.atTarget));
    check('pacing: every due word reviewed (follow-ups don\'t count): more, up to 8 in a calendar day', r.zero.bl === 0 && r.zero.pending >= 2 && r.zero.can && r.cap.today === 8 && r.cap.why === 'cap' && r.cap.story, JSON.stringify([r.zero, r.cap]));
    check('pacing: the next play day: the carried half makes 3; the count starts again', r.day2.target === 3 && r.day2.today === 0, JSON.stringify(r.day2));
    check('pacing: about 1.8 a day in the save\'s second year, 1.5 from the third', r.y2 === 1.8 && r.y3 === 1.5, JSON.stringify(r));
    check('pacing: a phrase waits on a full day too; G.budget.OPEN (or openPacing) lets everything through', r.phrase.join() === 'false,true,true', JSON.stringify(r.phrase));
    noErrors(g, 'rules');
  } finally { await ctx.close(); }
}

// ---------- 2.9: on the beach on a busy day; the queue; the story ----------
async function beach(browser) {
  const { ctx, g } = await open(browser, 'mem-beach', true);
  try {
    const due8 = ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan', 'leche', 'agua'].map(id => [id, 2, 2, 3, 0]);
    await game(g, { old: due8, done: G_DONE() });
    await g.ev(() => { G.budget.PACE.floor = 0; }); // (the backlog's hold, without the day's floor of 2)
    await g.ev(() => { const z = G.zones.def('playa'); G.zones.visit && G.zones.visit('playa'); G.goto('playa', z.entry.x, z.entry.y, 'down'); });
    await g.fieldIdle('playa');
    await g.ev(() => { window.__sp = []; const o = G.speak; G.speak = t => { window.__sp.push(t); o(t); }; });
    // she taps a crab: it reacts, the album records it, Lola calls out its name (seen and heard); no card, no puzzle
    const kind = await g.ev(() => { const a = G.animals.find('cangrejo', G.field); window.__a = a; return a && a.kind; });
    check('beach: a crab on the beach', kind === 'cangrejo');
    await g.ev(() => { G.animals.tapped(G.field, window.__a); });
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.show === 'cangrejo', null, 'Lola calling out the crab');
    await g.frames(30); await g.shot('deferred_seen');
    const d = await g.ev(() => ({ album: G.animals.met('cangrejo'), st: G.words.stage('cangrejo'), q: G.budget.queue(), said: window.__sp.some(t => /cangrejo/.test(t)), cards: G.cards.list().length }));
    check('beach: busy day: the crab is seen and its name said, the album records it, but no card is made', d.album && d.st === 0 && d.said && d.cards === 0, JSON.stringify(d));
    check('beach: ...and it waits in the queue', d.q.join() === 'cangrejo', JSON.stringify(d));
    await g.drive(() => G.top().constructor.name === 'Choice', 'the line');
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 8, null, 'the question');
    const q = await g.ev(() => { const s = G.top(); return { ans: s.ch[s.o.answer].word, review: !!s.o.review }; });
    check('beach: instead, a due word she knows comes back (a review)', ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan', 'leche', 'agua'].includes(q.ans), JSON.stringify(q));
    await g.frames(4); await g.shot('deferred_review');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the review');
    check('beach: no puzzle for the crab: still not met; the review moved its word on', await g.ev(a => G.words.stage('cangrejo') === 0 && G.words.rec(a).box === 3, q.ans));
    // another crab a moment later: seen and named again, but not another question (once per word in 2 minutes)
    await g.ev(() => { window.__asks = 0; const ch = G.choose; G.choose = function (o) { window.__asks++; return ch.call(this, o); }; G.animals.tapped(G.field, G.animals.find('cangrejo', G.field)); });
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.show === 'cangrejo', null, 'Lola calling out the crab again');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the second crab');
    check('beach: the same thing again within 2 minutes: seen and named, no second question', await g.ev(() => window.__asks === 0 && G.words.stage('cangrejo') === 0 && G.budget.backlog() === 7), await g.ev(() => JSON.stringify([window.__asks, G.budget.backlog()])));

    // the dog's warm-up, once the backlog is down to 5: its cards first, then the waiting crab is introduced
    await g.ev(() => { ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan', 'leche', 'agua'].filter(id => G.words.due(id)).slice(0, 2).forEach(id => { G.words.rec(id).dc = G.words.dayNum() + 3; }); G.budget.flush(); });
    check('queue: backlog 5: room again', await g.ev(() => G.budget.backlog() === 5 && G.budget.canIntro(1)));
    await g.ev(() => { G.warmup.start(G.field); });
    await g.drive(() => !G.warmup.cur() || G.warmup.cur().phase === 'new', 'the warm-up\'s cards');
    await g.until(() => (G.top().constructor.name === 'TextBox' && G.top().opts.show === 'cangrejo') || !G.warmup.cur(), null, 'the crab after the cards');
    await g.frames(20); await g.shot('queue_intro');
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the introduction and the end of the warm-up');
    const w = await g.ev(() => ({ st: G.words.stage('cangrejo'), how: G.words.rec('cangrejo').how, q: G.budget.queue(), last: G.hist.state().wu.last }));
    check('queue: after the warm-up\'s reviews, the waiting crab is introduced first (its puzzle, its card)', w.st === 1 && w.how === 'queue' && !w.q.length && w.last.of === 4, JSON.stringify(w));

    // the next time she sees one, with room: Lola introduces it there (a gull: not met, room today)
    await g.ev(() => { G.budget.flush(); G.animals.tapped(G.field, G.animals.find('gaviota', G.field)); });
    await g.ev(() => { window.__intro = null; const ask = G.ask; G.ask = function (q) { if (q.intro) window.__intro = q.intro; return ask.call(this, q); }; });
    await g.until(() => G.top() !== G.field, null, 'Lola calling out the gull');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the gull');
    check('beach: with room (backlog 1, under today\'s target): an animal she taps is introduced as before (its puzzle)', await g.ev(() => G.words.stage('gaviota') === 1 && window.__intro === 'gaviota'));
    noErrors(g, 'beach');
  } finally { await ctx.close(); }
}
function G_DONE() { return ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19', 'c20', 'c21']; }

// ---------- 2.9: the story always introduces its words (and they count toward the day) ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'mem-story', true);
  try {
    const due8 = ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan', 'leche', 'agua'].map(id => [id, 2, 2, 3, 0]);
    await game(g, { old: due8, done: G_DONE(), map: 'villa' });
    await g.fieldIdle('villa');
    await g.ev(() => { G.budget.PACE.floor = 0; }); // (the backlog's hold, without the day's floor of 2)
    // a chapter of its own line (a test chapter) whose beat introduces a word, on a day with 8 reviews due
    await g.ev(() => {
      const CH = G.chapters;
      CH.add({ id: 'zt1', line: 'zt', title: 'Prueba', en: 'Test', giver: 'mama', words: ['pelota'], icon: 'pelota' });
      CH.script('zt1', [{ auto: true, run: function* () { window.__can = G.budget.canIntro(1); yield* G.intro.show('pelota', { who: 'mama', prompt: '¡Mira! ¡Una [pelota]!' }); } }]);
    });
    await g.until(() => G.chapters.running() || G.chapters.done('zt1'), null, 'the test chapter');
    await g.drive(() => G.chapters.done('zt1') && G.top() === G.field && !G.field.locked, 'the chapter');
    const s = await g.ev(() => ({ can: window.__can, st: G.words.stage('pelota'), bl: G.budget.backlog(), today: G.budget.today(), open: G.budget.canIntro(1) }));
    check('story: with 8 reviews due, a chapter\'s beat still introduces its word (its puzzle, its card)', s.can && s.st === 1 && s.bl === 8, JSON.stringify(s));
    check('story: it counts toward the day; the open world still waits', s.today === 1 && !s.open, JSON.stringify(s));
    // ---- story pacing (the open-world learning audit): a chapter NOT started yet waits for room (a backlog of 8 or
    // fewer, 4 or fewer new items today); one started always goes on; the first chapters (c1-c3) never wait ----
    const p = await g.ev(() => {
      const CH = G.chapters, W = G.words, B = G.budget, f = G.field, out = {};
      CH.add({ id: 'zt2', line: 'zt', title: 'Prueba 2', en: 'Test 2', giver: 'pepe', words: ['queso'], icon: 'queso' });
      CH.script('zt2', [{ who: 'pepe', run: function* () { yield 1; } }, { who: 'pepe', run: function* () { yield 1; } }]);
      const look = () => { B.flush(); const L = CH.lives().find(L => L.id === 'zt2'); return { bl: B.backlog(), today: B.today(), gate: CH.gate('zt2'), alert: !!CH.alert('pepe'), live: !!L, guide: (G.guide.goal(f) || {}).why || null }; };
      out.room = look();
      W.meet('naranja', 't'); Object.assign(W.rec('naranja'), { fu: 0, box: 2, due: null, ds: null, dc: W.dayNum() - 1 }); // (a 9th word due)
      out.busy = look();
      CH.EXEMPT.push('zt2'); out.exempt = CH.gate('zt2'); CH.EXEMPT.pop();
      CH.add({ id: 'zu1', line: 'zu', title: 'Prueba U', en: 'Test U', giver: 'rosa', words: ['huevo'], icon: 'huevo' }); CH.script('zu1', [{ who: 'rosa', run: function* () { yield 1; } }]);
      const d0 = W.wm().d0; out.zu1 = CH.gate('zu1'); W.wm().d0 = W.dayNum(); out.first = { zu1: CH.gate('zu1'), zt2: CH.gate('zt2') }; W.wm().d0 = d0; // (the save's first play day: a zone's first chapter never waits, its second does)
      CH.PACED = false; out.off = CH.gate('zt2'); CH.PACED = true;
      W.answerRight('naranja', { mode: 'pic' }); for (const id of ['queso', 'leche', 'huevo', 'uno', 'dos']) if (!W.met(id)) W.meet(id, 't'); // (the backlog down again, but five new things today)
      out.today5 = look();
      CH.start('zt2'); Object.assign(W.rec('casa'), { dc: W.dayNum() - 1 }); out.started = look(); // (started: it goes on, whatever the day)
      return out;
    });
    check('story pacing: with room (' + p.room.bl + ' due, ' + p.room.today + ' new today) the next chapter is live, its giver has its bubble', p.room.gate === null && p.room.live && p.room.alert, JSON.stringify(p.room));
    check('story pacing: a 9th word due: it waits ("room"): no bubble over its giver, not live, the guide passes it by (' + p.busy.guide + ')', p.busy.bl === 9 && p.busy.gate === 'room' && !p.busy.alert && !p.busy.live && !/zt2/.test(p.busy.guide || ''), JSON.stringify(p.busy));
    check('story pacing: ...an exempt chapter (the first ones: c1-c3) never waits; the switch off (G.chapters.PACED, openPacing): never', p.exempt === null && p.off === null, JSON.stringify(p));
    check('story pacing: ...on the save\'s first play day a zone\'s first chapter never waits (a new explorer finds it), its second does', p.zu1 === 'room' && p.first.zu1 === null && p.first.zt2 === 'room', JSON.stringify([p.zu1, p.first]));
    check('story pacing: 5 new things today: it waits too, whatever the backlog (' + p.today5.bl + ')', p.today5.today >= 5 && p.today5.gate === 'room' && !p.today5.alert, JSON.stringify(p.today5));
    check('story pacing: a chapter already started always goes on (its beat live, its bubble)', p.started.gate === null && p.started.live && p.started.alert, JSON.stringify(p.started));
    // a beat whose map goes away under it (back to the title, a G.goto mid-beat) isn't "running" for ever after: that held
    // the dog's warm-up back and let every word in (G.budget.story) for the rest of the page session (the audit's day 6)
    await g.ev(() => { const CH = G.chapters; G.state.quests.zt2 = 'done'; CH.add({ id: 'zt9', line: 'zt9', title: 'Prueba 9', en: 'Test 9', giver: 'pepe', words: [], icon: 'queso' }); CH.script('zt9', [{ who: 'pepe', run: function* () { for (;;) yield 1; } }]); CH.EXEMPT.push('zt9'); CH.scene(G.field, CH.talk('pepe', G.field)); });
    await g.until(() => !!G.chapters.running() && G.chapters.running().id === 'zt9', null, 'the endless beat');
    await g.ev(() => { G.goto('villa', 22, 13, 'down'); });
    await g.until(() => G.top() === G.field && G.fade.a === 0, null, 'the new map');
    check('story: a beat whose map went away (G.goto mid-beat) no longer counts as running; the story\'s pass for new words ends with it', await g.ev(() => !G.chapters.running() && !G.budget.story()));
    await g.ev(() => { G.state.quests.zt9 = 'done'; });
    noErrors(g, 'story');
  } finally { await ctx.close(); }
}

// ---------- back after a break: the reviews are spread over the next days (words.js W.spread, W.BREAK) ----------
// a save in slot 1 as the game writes it now, last played o.away days ago: o.n words with a picture in mixed boxes, every
// one due by calendar day (o.timers: two of them on the minutes' timers of the last sitting instead: a miss, a follow-up
// never asked), a phrase due too (o.phrases: all six). o.old: the older record shape (boxes 1-5, no version; one with a
// game-day date only, one from before the stages). A save that doesn't say when it was last played: o.nodate (no
// wm.date; o.hist: a history day on the last day played; o.bare: the records carry nothing dated but their due day),
// o.prestage (every record from before the stages and no session record: nothing dates it).
// Kept as text in window.__save (put back before each load).
const breakSave = (g, o) => g.ev(o => {
  G.debug.dayShift = 0;
  const W = G.words, dn = W.dayNum(), ds = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
  const clock = 9000, sess = 20, day = 14, last = dn - (o.away || 0), mix = o.old ? [5, 4, 4, 3, 3, 2, 2, 1] : [5, 4, 4, 3, 3, 3, 2, 2, 2, 1];
  const GAP = o.old ? [0, 0, 1, 2, 4, 8] : W.BOX_DAYS, ids = Object.keys(G.data.words).filter(id => G.iconDrawn(id)).slice(0, o.n), words = {}, album = {};
  ids.forEach((id, i) => {
    const box = mix[i % mix.length], st = box >= 4 ? 3 : box >= 2 ? 2 : 1, ld = last - (i % 4), dc = Math.min(ld + GAP[box], dn - 1); // (last used on the last day played, or a day or three before; due by yesterday at the latest)
    if (G.animals && G.animals.KINDS[id]) album[id] = { first: 1, map: 'villa', n: 1 };
    words[id] = { st, box, due: null, dd: day + (dc - last), dc, fu: 0, met: 100 + i, ms: 3, md: 2, mdate: ds(ld - 20), how: 'show', last: 8000 - i * 7, n: 9, right: 6, wrong: 1, said: 0, cue: 0, ret: 7, ft: {}, star: ds(ld), s3: st >= 3 ? 5 : null, gold: st >= 3, learned: st >= 3, ld, gp: st >= 3 ? 24 : 6 };
    if (!o.old) Object.assign(words[id], { ds: null, mdn: ld - 20, v: 2 });
  });
  if (o.timers) { Object.assign(words[ids[8]], { st: 2, box: 2, due: clock + 50, ds: sess, dd: null, dc: null }); Object.assign(words[ids[9]], { st: 1, box: 1, fu: 1, due: clock - 10, ds: sess, dd: null, dc: null, learned: false, gold: false, s3: null }); }
  if (o.old) { words[ids[2]].dc = null; words[ids[2]].dd = day - 3; words[ids[5]] = { learned: true, right: 3, wrong: 0 }; } // (a game-day date only; a record from before the stages)
  if (o.bare) ids.forEach(id => { const r = words[id]; delete r.ld; delete r.mdate; delete r.mdn; r.star = ''; });
  if (o.prestage) ids.forEach((id, i) => { words[id] = { learned: i % 3 === 0, right: i % 3 === 0 ? 3 : 1, wrong: 0 }; });
  const wm = { clock, sess, day, date: ds(last) }; if (!o.old) Object.assign(wm, { ms: sess, sessAt: 8000, v2: dn - 40, d0: dn - 70 });
  if (o.nodate) delete wm.date;
  const hist = o.hist ? { v: 1, d: { [ds(last)]: { n: last, s: 600, met: [], w: {} } } } : undefined;
  const phr = k => ({ st: 2, box: 2, due: null, dd: day - 5, dc: last - 5 - k, fu: 0, met: 300, ms: 3, md: 2, mdate: ds(last - 30), how: 'show', last: 7000, n: 5, right: 3, wrong: 0, said: 2, cue: 0, ret: 3, ft: {}, star: '', s3: null, gold: false, learned: false, ld: last - 6, gp: 9 });
  const pr = {}, intro = {}; (o.phrases ? G.phrase.ids() : ['f_quiero']).forEach((id, k) => { pr[id] = phr(k); if (o.phrases) intro[id] = { d: 3, at: 100 }; });
  const s = G.st.parse({ words, wm: o.prestage ? undefined : wm, hist, flags: { intro: true, canelo: true, petStart: true, opener: true, book: true }, quests: { c1: 'done', c2: 'done', c3: 'done' }, name: 'Luz', look: G.data.defaultLook('nina'), dogName: 'Bruno', stars: 77, album, phrases: o.prestage || o.bare ? undefined : { r: pr, intro } });
  window.__save = JSON.stringify(s);
  return { ids, dn };
}, o);
// load it and read every word. o.off: with the rule switched off (what she would have met); o.fresh false: the game as
// it was left (saved, then opened again) instead of the save as made; o.day: on that day
const breakLoad = (g, o = {}) => g.ev(o => {
  const W = G.words, B = G.budget, CH = G.chapters;
  if (o.fresh !== false) { if (G.st.slot) G.st.detach(); G.debug.dayShift = o.day || 0; G.st.erase(1); G.store.set(G.st.slotKey(1), JSON.parse(window.__save)); }
  else { G.st.saveNow(); G.debug.dayShift = o.day || 0; }
  const away = W.BREAK.away; if (o.off) W.BREAK.away = 1e9;
  G.st.loadSlot(1); W.BREAK.away = away;
  G.goto('villa', 22, 13, 'down'); B.flush();
  if (!CH.def('zb1')) { CH.add({ id: 'zb1', line: 'zb', title: 'Prueba', en: 'Test', giver: 'pepe', words: ['queso'], icon: 'queso' }); CH.script('zb1', [{ who: 'pepe', run: function* () { yield 1; } }]); } // (a chapter not started yet, of its own line)
  const dn = W.dayNum(), out = { dn, bl: B.backlog(), back: G.state.wm.back || null, v2: G.state.wm.v2, room: CH.room(), gate: CH.gate('zb1'), gateV: CH.next() ? CH.gate(CH.next()) : 'none', w: {}, note: G.dashboard.backNote() };
  for (const id in G.state.words) {
    const r = W.rec(id);
    out.w[id] = { box: r.box, st: r.st, in: r.dc == null ? null : r.dc - dn, dd: r.dd == null ? null : r.dd - W.day(), timer: r.due != null, due: W.due(id), ld: W.lastDay(id), last: r.last || 0, pts: G.cards.pts(id),
      rest: Object.keys(r).filter(k => k !== 'dc' && k !== 'dd').sort().map(k => k + '=' + JSON.stringify(r[k])).join('|') }; // (everything but the due day)
  }
  const p = W.rec('f_quiero'); out.phrase = p ? { in: p.dc - dn, due: W.due('f_quiero'), box: p.box, st: p.st } : null;
  return out;
}, o);
// the reviews expected on each later day of a load: the words due on it, and the first return of every word that load
// spread (ids) onto a day before it (answered right on its day, a word comes back after its next box's gap): what
// W.spread counts as it fills a day
function expected(a, BOX, ids) {
  const on = {};
  for (const id in a.w) { const w = a.w[id]; if (!w.timer && w.in > 0) on[w.in] = (on[w.in] | 0) + 1; }
  for (const id of ids) { const w = a.w[id], k = w.in + BOX[Math.min(BOX.length - 1, Math.max(1, w.box) + 1)]; on[k] = (on[k] | 0) + 1; }
  return on;
}
// what a spread must look like: at most keep due today, the strongest; the rest on the following days, the weakest last,
// a day taking words only while fewer than perDay reviews are expected on it, and passed over only when it is full
function spreadChecks(name, a, K, BOX) {
  const keep = K.keep, perDay = K.perDay, ids = Object.keys(a.w), due = ids.filter(id => a.w[id].due), kept = due.filter(id => !a.w[id].timer), moved = ids.filter(id => !a.w[id].due && !a.w[id].timer);
  const stronger = (x, y) => a.w[x].box > a.w[y].box || (a.w[x].box === a.w[y].box && ((a.w[x].ld || 0) > (a.w[y].ld || 0) || ((a.w[x].ld || 0) === (a.w[y].ld || 0) && a.w[x].last >= a.w[y].last)));
  check(name + ': after loading, ' + a.bl + ' reviews are due (at most ' + keep + '), the others on later days', a.bl === due.length && a.bl <= keep && a.bl === Math.min(keep, ids.length) && moved.length === ids.length - a.bl, JSON.stringify([a.bl, due.length, moved.length]));
  check(name + ': the ones left due today are the strongest (the highest box, then the most recently used)', kept.length > 0 && kept.every(k => moved.every(m => stronger(k, m))), JSON.stringify(kept.map(id => [id, a.w[id].box, a.w[id].ld])));
  const days = {}; moved.forEach(id => { (days[a.w[id].in] = days[a.w[id].in] || []).push(id); });
  const D = Object.keys(days).map(Number).sort((x, y) => x - y), last = D[D.length - 1], on = expected(a, BOX, moved), all = []; for (let d = 1; d <= last; d++) all.push(d);
  const lay = all.map(d => { const n = (days[d] || []).length, r = (on[d] | 0) - n; return (n || '-') + (r ? '+' + r : ''); }).join(' '); // (words due + returns expected)
  check(name + ': the rest fall due on the days that follow, ' + perDay + ' a day at most, a day taking words only while fewer than ' + perDay + ' reviews are expected on it (words + the returns expected: ' + lay + ')',
    D[0] >= 1 && D.every(d => days[d].length <= perDay && (on[d] | 0) <= perDay) && moved.every(id => a.w[id].dd === a.w[id].in), JSON.stringify([D, lay]));
  check(name + ': ...and no day is passed over unless it is full (' + perDay + ' or more expected on it already)', all.slice(0, -1).every(d => (on[d] | 0) >= perDay), lay);
  check(name + ': ...in the same order: every day\'s words are stronger than the next day\'s, the weakest last (boxes ' + D.map(d => days[d].map(id => a.w[id].box).join('')).join(' ') + ')', D.every((d, i) => !i || days[D[i - 1]].every(x => days[d].every(y => stronger(x, y)))));
  check(name + ': the save records it (wm.back: the day, days away, kept, moved, the days it runs: ' + last + ')', !!a.back && a.back.n === a.dn && a.back.kept === a.bl && a.back.moved === moved.length && a.back.days === last, JSON.stringify(a.back));
  return { due, kept, moved, days: last, on, n: d => (days[d] || []).length };
}
const sameBut = (a, b, f) => Object.keys(a.w).filter(id => !b.w[id] || f(a.w[id], b.w[id]));
// page side: what one frame writes on the main canvas: [text, x, y, width] (as tools/test-dashboard.js reads a tab)
const strings = g => g.ev(() => { const seen = [], t = G.text; G.text = function (ctx, s, x, y) { if (ctx === G.ctx) seen.push([String(s), Math.round(x), Math.round(y), G.textWidth(String(s))]); return t.apply(this, arguments); }; try { G.drawFrame(); } finally { G.text = t; } return seen; });

async function backAfter(browser) {
  const { ctx, g } = await open(browser, 'mem-break', true);
  try {
    const K = await g.ev(() => Object.assign({}, G.words.BREAK)), BOX = await g.ev(() => G.words.BOX_DAYS);
    check('break: the constants in one place (W.BREAK): a break is ' + K.away + '+ days away, ' + K.keep + ' reviews kept that day (the story\'s limit, CH.PACE.backlog), ' + K.perDay + ' expected a day after', K.away === 6 && K.keep === await g.ev(() => G.chapters.PACE.backlog) && K.perDay >= 4 && K.perDay <= 8, JSON.stringify(K));
    // ---- 1. 50 words, all due, last played 24 days ago ----
    const sv = await breakSave(g, { n: 50, away: 24, timers: true });
    const off = await breakLoad(g, { off: true }); // (without the rule: what she met before)
    await g.fieldIdle('villa');
    check('break: without the rule: back after 24 days, all 50 words are due at once and the story is shut ("' + off.gate + '")', sv.ids.length === 50 && off.bl === 50 && off.gate === 'room' && !off.room && !off.back && off.note === '', JSON.stringify([off.bl, off.gate, off.room, off.back]));
    const a = await breakLoad(g);
    await g.fieldIdle('villa');
    const sp = spreadChecks('break', a, K, BOX);
    const tm = Object.keys(a.w).filter(id => a.w[id].timer);
    check('break: the two words left on the last sitting\'s minutes (a miss, a follow-up) count toward the ' + K.keep + ' and are not moved', tm.length === 2 && tm.every(id => a.w[id].due && a.w[id].in === null) && sp.kept.length === K.keep - 2 && a.back.away === 24 && a.back.moved === 50 - K.keep && a.back.days >= Math.ceil((50 - K.keep) / K.perDay) && a.back.days <= 16, JSON.stringify([tm, sp.kept.length, a.back]));
    check('break: a chapter can open that day: its gate is not "room" (' + JSON.stringify([a.gate, a.gateV]) + '), there is room for the story', a.gate === null && a.gateV !== 'room' && a.room, JSON.stringify([a.gate, a.gateV, a.room]));
    const ch = sameBut(a, off, (x, y) => x.box !== y.box || x.st !== y.st || x.pts !== y.pts || x.rest !== y.rest);
    check('break: no word changed its box, its stage, its card or its history: only the due day moved (dc, and dd to match)', !ch.length && Object.keys(a.w).length === 50, JSON.stringify(ch.map(id => [a.w[id].rest, off.w[id].rest])));
    check('break: the phrase is no part of it (still due, untouched)', a.phrase.due && a.phrase.in === off.phrase.in && a.phrase.box === off.phrase.box, JSON.stringify([a.phrase, off.phrase]));
    check('break: the history records the reviews due when the day began after the spread (' + await g.ev(() => G.hist.day().bd) + ')', await g.ev(() => G.hist.day().bd === G.budget.backlog() && G.hist.reviewDays(1)[0].due === G.words.BREAK.keep));
    // the grown-ups' line, on the Learning page's Memory tab; nothing said to the child
    check('break: for the grown-up: "' + a.note + '"', a.note === 'Back after 24 days: ' + (50 - K.keep) + ' reviews spread over ' + a.back.days + ' days.', a.note);
    await g.ev(() => { G.dashboard.open({ tab: 'Memory' }); });
    await g.until(() => G.top().constructor.name === 'LearningDash' && G.input.ready(), null, 'the Learning page');
    await g.frames(4); await g.shot('break_memory_tab');
    const S = await strings(g), cut = S.filter(([t]) => /\.\.$/.test(t)), out = S.filter(([t, x, y, w]) => x < 4 || x + w > 316 || y < 2 || y > 214), over = [];
    S.forEach((p, i) => S.forEach((q, j) => { if (j > i && Math.abs(p[2] - q[2]) < 8 && p[1] < q[1] + q[3] && q[1] < p[1] + p[3]) over.push([p[0], q[0]]); }));
    check('break: ...on the Memory tab, whole, the dated note still under it; every text fits (none cut, none on another)', S.some(([t]) => t === a.note) && S.some(([t]) => /^From [A-Z][a-z]{2} \d+ the game uses a stricter measure/.test(t)) && S.some(([t]) => /^Recognition: picking/.test(t)) && !cut.length && !out.length && !over.length, JSON.stringify({ cut, out, over, S: S.map(x => x[0]) }));
    await g.ev(() => { G.pop(); });
    await g.fieldIdle('villa');
    check('break: nothing is said to the child about it (no line, no card: the map is free; the dog\'s cards are the welcome)', await g.ev(() => G.top() === G.field && !G.field.locked && !(G.toastT > 0)));
    // ---- once: the same day again, and the next day ----
    const again = await breakLoad(g); // (the same save opened a second time before anything was saved: the same spread)
    check('break: the same save loaded again comes out the same (the order is fixed: box, last used, id)', !sameBut(a, again, (x, y) => x.in !== y.in || x.due !== y.due).length && JSON.stringify(again.back) === JSON.stringify(a.back));
    const b = await breakLoad(g, { fresh: false }); // (saved, closed, opened again the same day)
    await g.fieldIdle('villa');
    check('break: loading again the same day changes nothing (no word moves, the record is the same)', !sameBut(a, b, (x, y) => x.in !== y.in || x.dd !== y.dd || x.due !== y.due || x.rest !== y.rest).length && b.bl === a.bl && JSON.stringify(b.back) === JSON.stringify(a.back), JSON.stringify([b.bl, b.back]));
    const c = await breakLoad(g, { fresh: false, day: 1 });
    await g.fieldIdle('villa');
    const moved1 = sameBut(a, c, (x, y) => x.in !== (y.in == null ? null : y.in + 1) || x.rest !== y.rest);
    check('break: the next day\'s load does not spread again: nothing reviewed, ' + c.bl + ' are due (' + K.keep + ' + the ' + sp.n(1) + ' put on that day), every due day as it was', !moved1.length && c.bl === K.keep + sp.n(1) && c.back.n === a.dn && c.note === a.note, JSON.stringify([c.bl, c.back, moved1]));
    // ---- a spread still running, and days missed in it: levelled again (W.BREAK.skip) ----
    const d = await breakLoad(g, { fresh: false, day: 4 }); // (not played on days 2 and 3: 3 days since the last play)
    await g.fieldIdle('villa');
    const would = K.keep + sp.n(1) + sp.n(2) + sp.n(3) + sp.n(4), perDay = {}; Object.keys(d.w).forEach(id => { const k = d.w[id].in; if (k != null && k > 0) perDay[k] = (perDay[k] | 0) + 1; });
    const moved4 = sameBut(c, d, (x, y) => !x.timer && !y.timer && x.in !== y.in + 3), newDays = moved4.map(id => d.w[id].in), on4 = expected(d, BOX, moved4);
    check('break: days missed while it runs (opened on day 4, nothing reviewed: ' + would + ' would be due): levelled again, ' + d.bl + ' due, the others on later days with room (' + newDays.sort((x, y) => x - y).join(' ') + ' days on), never more than ' + K.perDay + ' words a day',
      d.bl === K.keep && d.back.n === a.dn + 4 && d.back.away === 3 && d.back.moved === would - K.keep && moved4.length === would - K.keep && newDays.every(k => k >= 1 && on4[k] <= K.perDay) && Object.keys(perDay).every(k => perDay[k] <= K.perDay) && d.back.days >= a.back.days - 4 && Object.keys(d.w).every(id => d.w[id].timer || d.w[id].box === a.w[id].box), JSON.stringify([d.bl, d.back, perDay, newDays]));
    const d5 = await breakLoad(g, { fresh: false, day: 5 });
    check('break: ...and the day after that, played or not, nothing moves again', !sameBut(d, d5, (x, y) => !x.timer && x.in !== y.in + 1).length && d5.back.n === d.back.n, JSON.stringify(d5.back));

    // ---- 2. away 3 days: no spread ----
    await breakSave(g, { n: 50, away: 3 });
    const e = await breakLoad(g);
    await g.fieldIdle('villa');
    check('break: away 3 days is no break: nothing is spread (all 50 due, as before)', e.bl === 50 && !e.back && e.note === '' && Object.keys(e.w).every(id => e.w[id].due), JSON.stringify([e.bl, e.back]));
    // ---- 3. a night at home in the same sitting: no spread (the same state on a load: spread) ----
    const n = await g.ev(() => {
      const W = G.words, B = G.budget, H = G.hist, o = { bd0: H.day().bd };
      const ds = k => { const d = new Date(k * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
      G.state.wm.date = ds(W.dayNum() - 24); // (as if the save had last been played 24 days ago)
      W.newSession('night'); B.flush();
      o.night = { bl: B.backlog(), back: G.state.wm.back || null, day: W.day() };
      G.state.wm.date = ds(W.dayNum() - 24);
      W.newSession('load');
      o.load = { bl: B.backlog(), back: G.state.wm.back || null, bd: H.day().bd };
      return o;
    });
    check('break: a night at home in the same sitting never spreads (the sun comes up: ' + n.night.bl + ' still due)', n.bd0 === 50 && n.night.bl === 50 && !n.night.back, JSON.stringify(n));
    check('break: ...the same state on a load does; a history day already begun takes the moved ones off its "due when the day began"', n.load.bl === K.keep && n.load.back && n.load.back.moved === 50 - K.keep && n.load.bd === K.keep, JSON.stringify(n.load));

    // ---- 4. a save in the older record shape (boxes 1-5, no version), away 24 days: it upgrades, then spreads ----
    await breakSave(g, { n: 30, away: 24, old: true, timers: true });
    const u0 = await breakLoad(g, { off: true });
    const u = await breakLoad(g);
    await g.fieldIdle('villa');
    const OLD = await g.ev(() => G.words.OLD_BOX), raw = JSON.parse(await g.ev(() => window.__save)).words;
    const upOk = Object.keys(u.w).filter(id => raw[id].st != null && !u.w[id].timer).every(id => u.w[id].box === OLD[raw[id].box] && u.w[id].st === raw[id].st);
    check('break: an older save (boxes 1-5, a record from before the stages, a game-day date only): upgraded first (the switch day is today; boxes onto the new ladder; stages kept)', u.v2 === u.dn && u0.v2 === u.dn && upOk && u0.bl === 30, JSON.stringify([u.v2, u.dn, u0.bl, Object.keys(u.w).map(id => [raw[id].box, u.w[id].box])]));
    spreadChecks('break (older save)', u, K, BOX);
    const uch = sameBut(u, u0, (x, y) => x.box !== y.box || x.st !== y.st || x.pts !== y.pts || x.rest !== y.rest);
    check('break: ...then spread by its new boxes; boxes, stages and cards exactly as the upgrade alone leaves them', !uch.length && u.back.away === 24 && u.back.moved === 30 - K.keep, JSON.stringify([u.back, uch]));

    // ---- 5. a save that doesn't say when it was last played (no wm.date): the newest day found in it dates it ----
    await breakSave(g, { n: 30, away: 24, nodate: true, hist: true });
    const v1 = await breakLoad(g);
    await g.fieldIdle('villa');
    check('break: no date in the save: its history and its records date it (last used 24 days ago): spread, as after 24 days ("' + v1.note + '")', v1.bl === K.keep && !!v1.back && v1.back.away === 24 && v1.back.moved === 30 - K.keep && /^Back after 24 days: /.test(v1.note), JSON.stringify([v1.bl, v1.back, v1.note]));
    await breakSave(g, { n: 30, away: 24, nodate: true, bare: true });
    const v2 = await breakLoad(g);
    await g.fieldIdle('villa');
    check('break: ...records with nothing dated but their due day (less its box\'s gap: the day it was last answered): the same', v2.bl === K.keep && !!v2.back && v2.back.away === 24 && v2.back.moved === 30 - K.keep, JSON.stringify([v2.bl, v2.back]));
    await breakSave(g, { n: 30, away: 3, nodate: true });
    const v3 = await breakLoad(g);
    await g.fieldIdle('villa');
    check('break: ...dated 3 days ago: no break, nothing spread (all 30 due)', v3.bl === 30 && !v3.back && v3.note === '', JSON.stringify([v3.bl, v3.back]));
    await breakSave(g, { n: 30, prestage: true });
    const v4 = await breakLoad(g);
    await g.fieldIdle('villa');
    check('break: nothing dates it at all (every record from before the stages, no session record): taken for a long break ("' + v4.note + '")', v4.bl === K.keep && !!v4.back && v4.back.away === null && v4.back.moved === 30 - K.keep && new RegExp('^Back after a break: ' + (30 - K.keep) + ' reviews spread over \\d+ days\\.$').test(v4.note) && Object.keys(v4.w).every(id => v4.w[id].st >= 1), JSON.stringify([v4.bl, v4.back, v4.note]));
    spreadChecks('break (undated save)', v4, K, BOX);
    const v5 = await breakLoad(g, { fresh: false, day: 1 });
    check('break: ...once: it has a date from then on, and the next day\'s load moves nothing', v5.back.n === v4.dn && !sameBut(v4, v5, (x, y) => x.in !== y.in + 1).length, JSON.stringify(v5.back));
    await g.ev(() => { G.st.detach(); G.st.erase(1); G.debug.dayShift = 0; });
    noErrors(g, 'break');
  } finally { await ctx.close(); }
}

// ---------- the tuning: the days after (she does the dog's cards every day, all answered right) ----------
// As she plays: the dog's cards are not all words (a listen-and-do request every day, a phrase when one is due: with six
// phrases met, most days), so the page has both on. Two ways to play: his first cards only, and the mid-sitting cards too.
async function breakDays(browser) {
  const { ctx, g } = await open(browser, 'mem-break-days', true, { phrases: true, listen: true });
  try {
    const K = await g.ev(() => Object.assign({}, G.words.BREAK));
    // page side: each day of the save: the reviews waiting as the day begins, may a chapter open, the dog's cards
    const play = (g, o) => g.ev(o => {
      const W = G.words, B = G.budget, CH = G.chapters, WU = G.warmup, rows = [], ids = Object.keys(G.state.words), spread = {};
      const answer = id => { W.addTime(200); if (id === WU.LD) return; if (W.isPhrase(id)) W.answerRight(id, { mode: 'say', said: true }); else W.answerRight(id, { mode: 'pic', recall: true, n: 3 }); };
      for (let k = 0; k < o.days; k++) {
        if (k) { G.debug.dayShift = k; W.newSession('load'); }
        B.flush();
        if (!k) ids.forEach(id => { const r = W.rec(id); spread[id] = r.dc - W.dayNum(); });
        const row = { start: B.backlog(), room0: CH.room(), fromSpread: ids.filter(id => spread[id] === k && W.due(id)).length };
        const cards = WU.pick(G.field); cards.forEach(answer);
        G.hist.state().wu.d = G.today(); B.flush(); // (the day's cards have come)
        Object.assign(row, { cards: cards.length, words: cards.filter(id => !!G.data.words[id]).length, room1: CH.room() });
        if (o.mid) { W.addTime(400); WU.midPick(G.field).forEach(answer); B.flush(); }
        rows.push(row);
      }
      return { rows, last: Math.max(...ids.map(id => spread[id])), days: ids.map(id => spread[id]).filter(k => k > 0), back: Object.assign({}, G.state.wm.back), ready: G.listen.warmReady() };
    }, o);
    for (const n of [50, 60]) {
      const R = {};
      for (const mid of [false, true]) {
        await breakSave(g, { n, away: 24, phrases: true });
        await breakLoad(g);
        await g.fieldIdle('villa');
        R[mid ? 'mid' : 'wu'] = await play(g, { days: 21, mid });
      }
      const r = R.wu, A = r.rows, M = R.mid.rows, N = r.last, wk = x => x.slice(1, 8).map(d => d.start), tail = x => x.slice(8).map(d => d.start), early = r.days.filter(k => k <= 8).length;
      check('tuning (' + n + ' words): the first day back ' + A[0].start + ' are due and a chapter can open at once; the dog brings ' + A[0].cards + ' cards, ' + A[0].words + ' of them words (a request and a phrase too)', r.ready && A[0].start === K.keep && A[0].room0 && A[0].cards >= 4 && A[0].cards <= 6 && A[0].words >= 3, JSON.stringify(A[0]));
      check('tuning (' + n + ' words): ' + early + ' of the ' + r.days.length + ' spread words come up within 8 calendar days; the weakest ' + (r.days.length - early) + ' wait until the first returns have passed, the last on day ' + N, N === r.back.days && N <= 16 && early >= 0.75 * r.days.length, JSON.stringify([r.back, r.days.slice().sort((x, y) => x - y)]));
      check('tuning (' + n + ' words): the dog\'s first cards done each day: about 12 reviews waiting each morning of the first week (' + wk(A).join(' ') + '), ' + K.perDay + ' of them new from the spread', wk(A).every(v => v <= 14) && A.slice(1, 8).every(d => d.fromSpread <= K.perDay && d.cards >= 4 && d.cards <= 8), JSON.stringify(A.map(d => [d.start, d.fromSpread, d.cards, d.words])));
      check('tuning (' + n + ' words): ...with the mid-sitting cards too: ' + K.keep + ' or fewer each morning (' + wk(M).join(' ') + ')', wk(M).every(v => v <= K.keep), JSON.stringify(M.map(d => d.start)));
      // The second week. The strong words went first and come back after long gaps, the weak ones later and after short
      // gaps: they would all come back together from about day 8 (with 5 spread words a day whatever was expected: 29
      // waiting and no chapter on 4 days for 50 words, 40 and 8 days for 60). Counting the returns as each day is filled
      // (W.spread), those days take no spread words: no pile-up, and the story goes on
      const pa = Math.max(...tail(A)), pm = Math.max(...tail(M)), shut = x => x.map((d, k) => (d.room1 ? null : k)).filter(k => k != null);
      check('tuning (' + n + ' words): the second week and after, his first cards alone: mornings of ' + tail(A).join(' ') + ' (the most ' + pa + '); a chapter can open once his cards have come on ' + (A.length - shut(A).length) + ' of the ' + A.length + ' days' + (shut(A).length ? ' (not on day ' + shut(A).join(', ') + ')' : ''),
        pa <= n / 2 && shut(A).length <= (n > 50 ? 1 : 0), JSON.stringify([A.map(d => d.start), shut(A)]));
      check('tuning (' + n + ' words): ...with the mid-sitting cards too: mornings of ' + tail(M).join(' ') + ' (the most ' + pm + '); a chapter every day', pm <= pa && pm <= n / 3 && !shut(M).length, JSON.stringify([M.map(d => d.start), shut(M)]));
    }
    await g.ev(() => { G.st.detach(); G.st.erase(1); G.debug.dayShift = 0; });
    noErrors(g, 'tuning');
  } finally { await ctx.close(); }
}

// ---------- a word held back by the pacing comes on the first free day (warmup.js: the dog's "new card" moment) ----------
async function held(browser) {
  const { ctx, g } = await open(browser, 'mem-held', true);
  try {
    const free = () => g.until(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked && G.fade.a === 0, null, 'the map free again');
    // day 0: six words she knows, none due for days; a crab seen on a busy day waits in the queue (the dog's cards are
    // off in a test's page until asked: window.__warmupOff)
    await game(g, { old: ['casa', 'perro', 'gato', 'arbol', 'flor', 'pan'].map(id => [id, 2, 3, 6, 5]) });
    await g.fieldIdle('villa');
    await g.ev(() => { G.budget.defer('cangrejo', 'test'); });
    // the next day: nothing is due at all
    await g.ev(() => {
      G.debug.dayShift = 1; G.words.newSession('load'); G.budget.flush();
      window.__tl = []; const an = G.pet.anim; G.pet.anim = (n, k, a) => { window.__tl.push(k); return an(n, k, a); };
      G.goto('villa', 22, 13, 'down');
    });
    await g.fieldIdle('villa');
    const pre = await g.ev(() => ({ due: G.review.count(), bl: G.budget.backlog(), q: G.budget.queue(), can: G.budget.canIntro(1), pick: G.warmup.pick(G.field), nc: G.warmup.newCard() }));
    check('held back: the next day 0 words are due (too few for the dog\'s cards), the crab still waits and there is room for it', pre.due === 0 && pre.bl === 0 && pre.q.join() === 'cangrejo' && pre.can && !pre.pick.length && pre.nc === 'cangrejo', JSON.stringify(pre));
    await g.ev(() => { window.__warmupOff = false; });
    await g.until(() => !!G.warmup.cur(), null, 'the dog\'s new-card moment', 12000);
    const c = await g.ev(() => { const c = G.warmup.cur(); return { ids: c.ids.slice(), mid: c.mid, done: G.warmup.done() }; });
    check('held back: the dog comes all the same, with no review card, and the day\'s warm-up is marked done', c.ids.length === 0 && !c.mid && c.done, JSON.stringify(c));
    await g.until(() => (G.top().constructor.name === 'TextBox' && G.top().opts.show === 'cangrejo') || !G.warmup.cur(), null, 'the crab');
    check('held back: he fetches a card, and it is the crab', await g.ev(() => !!G.warmup.cur() && G.warmup.cur().phase === 'new' && window.__tl.join() === 'bring'), await g.ev(() => JSON.stringify([G.warmup.cur() && G.warmup.cur().phase, window.__tl])));
    await g.frames(20); await g.shot('held_new_card');
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the introduction and the treat');
    const w = await g.ev(() => { const wu = G.hist.state().wu; return { st: G.words.stage('cangrejo'), how: G.words.rec('cangrejo').how, q: G.budget.queue(), tl: window.__tl.join(), wu: { d: wu.d === G.today(), n: wu.n | 0, none: wu.none | 0, nw: wu.nw, last: wu.last || null }, text: G.dashboard.warmText(wu) }; });
    check('held back: the crab is introduced (its puzzle, its card), the queue is empty, then his jump and his treat (' + w.tl + ')', w.st === 1 && w.how === 'queue' && !w.q.length && /^bring,.*jump,eat$/.test(w.tl), JSON.stringify(w));
    check('held back: counted as a day with too few words due, the word it brought noted (the grown-ups\' page: "' + w.text + '")', w.wu.d && w.wu.none === 1 && w.wu.n === 0 && w.wu.nw && w.wu.nw.id === 'cangrejo' && !w.wu.last && /fewer than 2 words were due/.test(w.text), JSON.stringify(w.wu));
    // the mid-sitting moment does the same: nothing due, another word waiting, room for it
    await free();
    await g.ev(() => { const W = G.words; Object.assign(W.rec('cangrejo'), { fu: 0, box: 2, due: null, ds: null, dc: W.dayNum() + 5 }); G.budget.flush(); G.budget.defer('gaviota', 'test'); window.__tl = [];
      G.hist.state().hoy.d = G.today(); G.sessionTime = G.warmup.MID_AT + 200; }); // (well into the sitting; the Hoy card's day is today, or day.js would take the test's moved date for a game left open overnight and start the sitting's clock again)
    await g.until(() => !!G.warmup.cur(), null, 'the mid-sitting new-card moment', 12000);
    const m = await g.ev(() => { const c = G.warmup.cur(); return { ids: c.ids.slice(), mid: c.mid }; });
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the mid-sitting introduction');
    const m2 = await g.ev(() => { const wu = G.hist.state().wu; return { st: G.words.stage('gaviota'), how: G.words.rec('gaviota').how, q: G.budget.queue(), m: wu.m, nw: wu.nw, tl: window.__tl.join(), done: G.warmup.midDone() }; });
    check('held back: mid-sitting too: nothing due, a gull waiting: the dog brings it (no review card), once a sitting', m.mid && !m.ids.length && m2.st === 1 && m2.how === 'queue' && !m2.q.length && m2.nw.id === 'gaviota' && m2.m && m2.m.n === 1 && m2.done && /^bring,.*jump,eat$/.test(m2.tl), JSON.stringify([m, m2]));
    // one word due and one waiting: the due one is asked first (reviews before new words), then the new card
    await free();
    await g.ev(() => {
      const W = G.words; G.debug.dayShift = 2; W.newSession('load');
      for (const id of W.list(1)) Object.assign(W.rec(id), { fu: 0, box: Math.max(2, W.rec(id).box), due: null, ds: null, dc: W.dayNum() + 5 });
      W.rec('casa').dc = W.dayNum(); G.budget.flush(); G.budget.defer('tortuga', 'test');
      window.__asked = []; const ask = G.ask; G.ask = function (q) { const c = q.choices && q.choices[q.answer]; window.__asked.push((q.intro ? 'new:' : 'review:') + (q.intro || (c && c.word))); return ask.call(this, q); };
      G.goto('villa', 22, 13, 'down');
    });
    await g.until(() => !!G.warmup.cur(), null, 'the dog, one word due and one waiting', 12000);
    const o1 = await g.ev(() => G.warmup.cur().ids.slice());
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the due word and the new card');
    const o2 = await g.ev(() => { const wu = G.hist.state().wu; return { asked: window.__asked, casa: G.words.rec('casa').box, st: G.words.stage('tortuga'), last: wu.last, n: wu.n | 0, text: G.dashboard.warmText(wu) }; });
    check('held back: one word due and one waiting: the due word first, then the new one (' + o2.asked.join(', ') + '); "' + o2.text + '"', o1.join() === 'casa' && o2.asked.join() === 'review:casa,new:tortuga' && o2.casa === 4 && o2.st === 1 && o2.last && o2.last.of === 1 && o2.n === 1 && /^1 card today/.test(o2.text), JSON.stringify([o1, o2]));
    // nothing due and nothing waiting: no dog moment, as before
    await free();
    await g.ev(() => { const W = G.words; G.debug.dayShift = 3; W.newSession('load'); for (const id of W.list(1)) Object.assign(W.rec(id), { fu: 0, due: null, ds: null, dc: W.dayNum() + 5 }); G.budget.flush(); G.goto('villa', 22, 13, 'down'); });
    await g.until(() => G.warmup.done(), null, 'the day\'s look for cards', 12000);
    check('held back: nothing due and nothing waiting: he doesn\'t come that day (as before)', await g.ev(() => !G.warmup.cur() && !G.budget.queue().length && G.hist.state().wu.none === 2));
    await g.ev(() => { G.debug.dayShift = 0; });
    noErrors(g, 'held back');
  } finally { await ctx.close(); }
}

const SECTIONS = [['gaps: calendar days, a night at home', gaps], ['upgrade: an older save', upgrade], ['stages: misses, gold, solid, what never counts', stages], ['puzzle: the forced pair, cards', puzzle], ['order: most overdue for its gap', order], ['pacing: the rules', rules], ['pacing: the beach, the queue', beach], ['pacing: the story', story],
  ['break: back after weeks away, the reviews spread', backAfter], ['break: the tuning, the days after', breakDays], ['held back: a word waiting comes on the first free day', held]];
run('The memory engine (words.js: gaps, stages, order, pacing)', SECTIONS.filter(([n]) => !ONLY.length || ONLY.some(o => n.includes(o))));
