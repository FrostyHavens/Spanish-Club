// The memory engine (src/words.js, docs/AUDIT_2026-10.md Sprint 2 items 2.1-2.4 and 2.9): review gaps in calendar days
// (1, 3, 7, 16, 35, 75, 150), a night at home in the same sitting moves nothing, an older save upgraded on load with
// nothing lost and not everything due, a forgotten word really drops back, honest stages (gold on a later day, solid
// from recall on 2 later days 2+ apart; listen taps, cued picks and forced pairs never promote; cards never shrink),
// the most overdue for its gap reviewed first, and review-first pacing (a busy day defers the open world's new words:
// seen and heard, in the album, queued, a due word asked instead; the queue first when there's room; 8 a day at most;
// the story always introduces its words).
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
      W.answerRight('pan', { mode: 'listen' }); W.answerRight('leche', { cued: true }); W.answerRight('agua', { mode: 'match', forced: true });
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
      return o;
    });
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
    noErrors(g, 'story');
  } finally { await ctx.close(); }
}

const SECTIONS = [['gaps: calendar days, a night at home', gaps], ['upgrade: an older save', upgrade], ['stages: misses, gold, solid, what never counts', stages], ['puzzle: the forced pair, cards', puzzle], ['order: most overdue for its gap', order], ['pacing: the rules', rules], ['pacing: the beach, the queue', beach], ['pacing: the story', story]];
run('The memory engine (words.js: gaps, stages, order, pacing)', SECTIONS.filter(([n]) => !ONLY.length || ONLY.some(o => n.includes(o))));
