// The honest Learning page (docs/AUDIT_2026-10.md 2.8: H3, L2, M18): the numbers a parent reads once a week, and the page.
//   src/history.js   guess-adjusted recognition (k choices: (p - 1/k) / (1 - 1/k)), recall from memory (F, V, C), reviews
//                    done against due a day and the backlog, new items a day, not seen in 30 / 60 days, gold words
//                    forgotten and relearned, said aloud once a day (no echoes, no dog commands), the phrase builder apart,
//                    the club words, the dated note when the stricter measure began
//   src/words.js     n (a question's choices) to the history; fg / rl (forgotten, relearned)
//   src/mic.js       every mic try's outcome; "speaking: not working lately" when the recent tries all failed
//   src/dashboard.js the seven tabs; every text measured with the game's font (nothing squeezed or cut); the strength
//                    bar's 8 box marks; the share text
//   NODE_PATH=$(npm root -g) node tools/test-dashboard.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// ---------- a fake recognizer (as in tools/test-learning.js): each start() takes the next reply from window.__sr.queue ----------
function FAKE() {
  const sr = window.__sr = { queue: [], starts: 0 };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' }; sr.starts++;
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
// a new game on the map, the opener behind her, started o.day days from today (the switch day is that day)
const game = (g, o = {}) => g.ev(o => {
  G.debug.dayShift = o.day || 0;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
  G.words.newSession('new');
  G.goto('villa', 22, 13, 'down');
}, o);
const still = async (g, label) => { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); };
// page side: words met on an earlier day at a stage, nothing due unless asked (o: {id: [stage, days since last used, due]})
const SETUP = () => {
  window.__set = function (o) {
    const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
    for (const id in o) {
      const [st, ago, due] = o[id]; W.meet(id, 'test');
      Object.assign(W.rec(id), { st, box: st >= 3 ? 3 : 2, fu: 0, due: null, ds: null, dd: W.day() + (due ? 0 : 5), dc: W.dayNum() + (due ? 0 : 5), ld: W.dayNum() - ago, mdn: W.dayNum() - ago - 1, learned: st >= 3, gold: st >= 3 });
    }
    G.cards.grow = grow; G.budget.flush();
  };
  window.__key = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
};

// =====================================================================
//  The numbers, worked out on known answers
// =====================================================================
async function numbers(browser) {
  const { ctx, g } = await openWith(browser, 'dash-num', true);
  try {
    await game(g, { day: -3 });
    await g.fieldIdle('villa');
    await g.ev(`(${SETUP})()`);

    // ---- the dated note when the stricter measure began (words.js wm.v2: the day this code first ran on the save) ----
    const sn = await g.ev(() => {
      const W = G.words, H = G.hist, n0 = W.dayNum(), o = { v2: W.switchDay() === n0 };
      o.fresh = H.switchNote(); // (a save begun on its switch day: nothing earlier to explain)
      H.day(window.__key(n0 - 5)).s = 600; o.older = H.switchNote(); // (an older save: play before the switch)
      G.debug.dayShift += 130; o.late = H.switchNote(); G.debug.dayShift -= 130;
      return o;
    });
    check('switch note: a new save has none; one with play before the switch day gets "From <date> ..." (that day); after about 4 months it goes', sn.v2 && sn.fresh === null && sn.older && sn.older.num === await g.ev(() => G.words.dayNum()) && sn.late === null, JSON.stringify(sn));

    // ---- guess-adjusted recognition: (p - c) / (1 - c), c the average 1/k ----
    const rc = await g.ev(() => {
      const H = G.hist, n0 = G.words.dayNum(), k1 = window.__key(n0 - 2), k2 = window.__key(n0 - 1), k3 = window.__key(n0 - 3);
      // day 1: ten picks back after a day or more (k 3; the R has no k: 3 by default): 7 right, 3 misses. And what never
      // counts: a word met that day (gap 0), a cued pick (K), a check first (C), an echo (E), said (S, not a pick), said
      // from memory (F: that's recall), a phrase built (the builder is always right)
      H.day(k1).w = { perro: [3, 'P', 3], gato: [1, 'P', 3], casa: [2, 'Pp', 3], pelota: [5, 'P', 3], manzana: [1, 'P', 3], oso: [2, 'V', 3], pan: [2, 'R'], leche: [1, 'mp', 3], agua: [4, 'm', 3], cama: [1, 'm', 3],
        hola: [0, 'P', 3], si: [2, 'K', 3], no: [2, 'CP', 3], gracias: [2, 'E'], uno: [2, 'S'], dos: [2, 'F'], f_quiero: [3, 'P'] };
      // day 2: two picks among two cards (one right): a different guessing floor
      H.day(k2).w = { rojo: [1, 'P', 2], azul: [1, 'm', 2] };
      // day 3: all three missed: below luck is 0, never negative
      H.day(k3).w = { tres: [2, 'm', 3], cinco: [2, 'm', 4], mar: [2, 'm', 3] };
      return { d1: H.recognition({ key: k1 }), d2: H.recognition({ key: k2 }), d3: H.recognition({ key: k3 }), both: H.recognition({ days: 3 }) };
    });
    check('recognition: 7 of 10 picks right among 3 cards = 70% raw, 33% by luck -> (0.7 - 1/3) / (1 - 1/3) = 55%; same-day, cued, check-first, echo, said, said-from-memory and built-phrase answers never count',
      rc.d1.n === 10 && rc.d1.right === 7 && rc.d1.raw === 70 && rc.d1.chance === 33 && rc.d1.pct === 55, JSON.stringify(rc.d1));
    check('recognition: 1 of 2 among 2 cards (luck: half) = 0%; all missed is 0, never below', rc.d2.pct === 0 && rc.d2.chance === 50 && rc.d3.pct === 0 && rc.d3.n === 3, JSON.stringify([rc.d2, rc.d3]));
    check('recognition: mixed floors: 8 of 12, c = (10/3 + 2/2) / 12 -> 48%', rc.both.n === 12 && rc.both.right === 8 && rc.both.pct === 48, JSON.stringify(rc.both));

    // ---- a real question keeps its number of cards with the word's first pick ----
    await g.ev(() => { window.__set({ perro: [1, 2, true], gato: [2, 2, false], casa: [2, 2, false], flor: [2, 2, false] }); window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.review.ask('perro', { who: 'nico' }); })()); });
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10 && G.input.ready(), null, 'the review question');
    const nc = await g.ev(() => G.top().ch.length);
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => window.__r != null, null, 'the answer');
    const e = await g.ev(() => G.hist.day().w.perro);
    check('recognition: a question\'s cards (' + nc + ') are kept with the word\'s first pick of the day (its guessing floor)', e && /^[PV]/.test(e[1]) && e[2] === nc && nc >= 2, JSON.stringify(e));
    await g.until(() => G.top() === G.field && !G.field.locked, null, 'the map');

    // ---- recall from memory: F said before any written cue, V pictures alone a later day, C a grown-up's check ----
    const rl = await g.ev(() => {
      const W = G.words, H = G.hist;
      window.__set({ oso: [2, 2, true], pan: [2, 2, true], leche: [2, 2, true], cama: [2, 0, true], agua: [2, 0, true], hoja: [2, 3, true] });
      W.answerRight('oso', { mode: 'say', recall: true, said: true });          // F, back after 2 days
      W.answerRight('pan', { mode: 'pic', recall: true });                      // V (a later day than last used)
      H.checkStart(['leche']); H.checkAnswer(true);                             // C
      W.answerRight('cama', { mode: 'pic', recall: true });                     // used today already: a plain pick (P)
      W.answerRight('agua', { mode: 'say', recall: true, said: true });         // said first, but used today: not "from memory after a day"
      W.answerRight('hoja', { mode: 'pic' });                                   // a pick with words on screen: P
      const ids = ['oso', 'pan', 'leche', 'cama', 'agua', 'hoja'];
      return { r: H.recall({ key: G.today(), ids }), ev: ids.map(id => H.day().w[id][1]).join(',') };
    });
    check('recall: F (said first), V (pictures alone, a later day) and C (your check) count; the same letters on a word used earlier today don\'t (F), a plain pick doesn\'t',
      rl.r.n === 3 && rl.r.f === 1 && rl.r.v === 1 && rl.r.c === 1 && rl.ev === 'F,V,C,P,F,P', JSON.stringify(rl));

    // ---- reviews done against due, and the backlog ----
    const rv = await g.ev(() => {
      const W = G.words, H = G.hist, B = G.budget, n0 = W.dayNum();
      for (const id of W.list(1)) Object.assign(W.rec(id), { due: null, ds: null, fu: 0, dc: n0 + 9, dd: W.day() + 9 }); // (nothing due)
      window.__set({ conejo: [2, 3, true], rana: [2, 3, true], pato: [2, 3, true], pajaro: [2, 3, true], pez: [3, 3, true], mariposa: [2, 3, false] });
      delete H.state().d[G.today()]; B.flush();
      const d = H.day(), o = { bd: d.bd, backlog0: B.backlog() };
      W.answerRight('conejo', { mode: 'pic' });                 // done: up a box
      W.answerWrong('rana'); W.answerRight('rana', { mode: 'pic', firstTry: false }); // done once: the miss (the right after it isn't a second review)
      W.answerRight('pato', { mode: 'pic', cued: true });       // a cued pick: still due
      G.st.said('pajaro');                                      // said at the mic with no question: still due
      W.answerRight('mariposa', { mode: 'pic' });                // not due: not a review
      B.flush(); o.rv = d.rv; o.left = B.backlog();
      // an older day, before the counts began: done estimated (back after a day and answered), due unknown
      const od = H.day(window.__key(n0 - 1)); od.s = 600; od.w = { gato: [1, 'P'], casa: [2, 'mp'], flor: [0, 'P'], uno: [3, 'K'] }; delete od.bd; delete od.rv;
      o.days = H.reviewDays(3).map(x => [x.due, x.done, x.left, x.est].join(':'));
      return o;
    });
    check('reviews: the day\'s due reviews are counted when it begins (the pacing\'s backlog: 5)', rv.bd === 5 && rv.backlog0 === 5, JSON.stringify(rv));
    check('reviews: done = due words answered (a right first try, a miss); a cued pick, a mic word with no question, a word not due: not done; 3 left', rv.rv === 2 && rv.left === 3, JSON.stringify(rv));
    check('reviews: a bar per day: today 5 due, 2 done, 3 left; a day before the counts: done estimated (2), due unknown', rv.days[2] === '5:2:3:false' && rv.days[1] === ':2::true', JSON.stringify(rv.days));

    // ---- not seen in 30 / 60 days; forgotten and relearned ----
    const fr = await g.ev(() => {
      const W = G.words, H = G.hist, n0 = W.dayNum(), o = {};
      window.__set({ nube: [2, 35, false], nieve: [2, 70, false], gallina: [2, 10, false], vaca: [3, 2, true] });
      o.unseen = H.unseen();
      W.answerWrong('vaca'); o.after = H.forgotten(); o.fg = W.rec('vaca').fg === n0;
      W.addTime(100); W.answerRight('vaca', { mode: 'text' }); o.sameDay = H.forgotten().now;
      G.debug.dayShift += 1; W.newSession('load');
      W.answerRight('vaca', { mode: 'listen' }); o.listen = H.forgotten().now; // (a listen-and-do tap: no stage, no relearning)
      W.answerRight('vaca', { mode: 'text' }); o.next = H.forgotten();
      G.debug.dayShift -= 1; W.newSession('load');
      return o;
    });
    check('not seen: met words not met or used in 30+ days (2) and 60+ days (1)', fr.unseen.d30 === 2 && fr.unseen.d60 === 1, JSON.stringify(fr.unseen));
    check('forgotten: a gold word missed is forgotten; a right answer the same day doesn\'t bring it back (nor a listen tap the next day)', fr.after.now >= 1 && fr.after.ids.includes('vaca') && fr.fg && fr.sameDay === fr.after.now && fr.listen === fr.after.now, JSON.stringify(fr));
    check('relearned: gold again (a recall-type answer on a later day): relearned 1, this week 1, not forgotten any more', fr.next.now === fr.after.now - 1 && fr.next.relearned === 1 && fr.next.week === 1, JSON.stringify(fr.next));

    // ---- said aloud: once a day per word; no echoes, no dog commands; phrases: the builder apart ----
    const sa = await g.ev(() => {
      const W = G.words, H = G.hist, o = {};
      delete H.state().d[G.today()];
      window.__set({ perro: [2, 1, true], gato: [2, 1, true], ven: [2, 1, true], sientate: [2, 1, true], casa: [2, 1, true] });
      G.st.said('perro'); W.answerRight('perro', { said: true, mode: 'say' }); G.st.said('perro'); G.st.said('perro'); // said three times: one word
      W.answerRight('gato', { said: true, mode: 'say', echo: true });   // an echo (E)
      W.answerRight('ven', { said: true, mode: 'both', noStar: true });  // a dog command said at his menu (pet.js)
      W.answerRight('sientate', { mode: 'say', recall: true, said: true }); // a dog command said from memory (F): counts
      W.answerRight('casa', { mode: 'pic' });                            // practised, not said
      o.today = H.saidAloud({ key: G.today() }); o.ev = ['perro', 'gato', 'ven', 'sientate'].map(id => H.day().w[id][1]).join(',');
      // phrases: said whole twice today (one), an echo, built from cards (apart, never practice or retention)
      const P = G.state.phrases || (G.state.phrases = {}); for (const id of ['f_llamo', 'f_quiero', 'f_gusta']) { W.meet(id, 'test'); Object.assign(W.rec(id), { st: 2, fu: 0, due: null, ld: W.dayNum() - 2 }); }
      W.answerRight('f_llamo', { said: true, mode: 'say' }); W.answerRight('f_llamo', { said: true, mode: 'say' });
      W.answerRight('f_gusta', { said: true, mode: 'say', echo: true });
      W.answerRight('f_quiero', { mode: 'both' }); W.answerRight('f_quiero', { mode: 'both' });
      o.ph = H.phraseStats(); o.retQ = H.day().w.f_quiero;
      return o;
    });
    check('said aloud: a word said three times counts once; an echo (E) and a dog command said at his menu don\'t; a command said from memory (F) does: 2 of 5 words practised',
      sa.today.said === 2 && sa.today.of === 5 && sa.ev === 'SSS,E,S,F', JSON.stringify(sa));
    check('phrases: said aloud once a day each, no echoes (1); the builder\'s taps apart (2), and a built phrase is never a retention point',
      sa.ph.said === 1 && sa.ph.today === 1 && sa.ph.built === 3 && /^P/.test(sa.retQ[1]) && sa.retQ[0] >= 1, JSON.stringify(sa)); // (built: 2 today and 1 on the crafted day above)
    const ret = await g.ev(() => { const H = G.hist, w = H.day().w, o = {}; for (const id in w) if (!G.words.isPhrase(id)) o[id] = w[id]; return { all: H.retention({ key: G.today() }).n, words: Object.keys(o).filter(id => w[id][0] >= 1 && !'CcKE'.includes(w[id][1][0])).length }; });
    check('retention (the older measure, kept for the audit): the phrase builder no longer counts in it', ret.all === ret.words + 1, JSON.stringify(ret)); // (+1: f_llamo said whole, back after 2 days)

    // ---- the mic: "not working lately" from the last tries ----
    const mic = await g.ev(() => {
      const M = G.mic, o = {};
      M.tries = []; o.none = M.status().st;
      M.tries = [{ e: 'network', at: G.now() }, { e: 'network', at: G.now() }, { e: 'service-not-allowed', at: G.now() }, { e: 'network', at: G.now() }]; o.fail = M.status();
      M.note({ ok: true, alternatives: [] }); o.ok = M.status().st;
      ['no-speech', 'no-match', 'no-speech'].forEach(e => M.note({ ok: false, error: e })); o.soft = M.status().st;
      M.note({ ok: false, error: 'aborted' }); o.aborted = M.tries.length;
      ['network', 'network', 'network'].forEach(e => M.note({ ok: false, error: e })); o.three = M.status().st; // (the last 5 still hold a no-speech)
      ['network', 'network'].forEach(e => M.note({ ok: false, error: e })); o.five = M.status();
      G.prefs.mic = false; o.off = M.status().st; G.prefs.mic = true;
      o.saved = JSON.parse(localStorage.getItem('spanishclub_mictries')).length;
      return o;
    });
    check('mic: no tries: unknown; four recognizer failures in a row: "not working lately" (n 4, the last error)', mic.none === 'unknown' && mic.fail.st === 'unavailable' && mic.fail.n === 4 && mic.fail.e === 'network', JSON.stringify(mic));
    check('mic: one try that heard her: working; nothing said (no-speech, no-match) is not a failure; an aborted try isn\'t a try', mic.ok === 'ok' && mic.soft === 'ok' && mic.aborted === 8, JSON.stringify(mic));
    check('mic: "not working" only when the last 5 tries all failed (3 failures after a no-speech: not yet; 5: yes); the switch off: off; the last 12 kept on the device',
      mic.three === 'ok' && mic.five.st === 'unavailable' && mic.five.n === 5 && mic.off === 'off' && mic.saved === 12, JSON.stringify(mic));
    // a real try from a question's mic is noted
    await g.ev(() => { G.mic.tries = []; window.__sr.queue.push({ error: 'network' }); const c = G.wordChoices('perro', ['perro', 'gato', 'casa'], 3); window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.ask({ prompt: '¿Qué es?', show: 'perro', choices: c.choices, answer: c.answer, layout: 'cards' }); })()); });
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 25 && G.input.ready() && !!G.top().mic, null, 'a question with a mic');
    if (await g.ev(() => !!G.top().say)) await g.tap(160, 118); // (say it first: skip to the cards)
    await g.until(() => G.top().constructor.name === 'Choice' && !G.top().say && G.top().mic && G.top().mic.can(), null, 'the mic ready');
    await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
    await g.until(() => G.mic.tries.length > 0, null, 'the try noted', 6000);
    check('mic: a question\'s mic notes its try (the recognizer\'s error)', await g.ev(() => G.mic.tries[0].e === 'network'));
    await g.until(() => G.top().constructor.name === 'Choice' && G.input.ready() && !G.top().mic.l, null, 'the question again');
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => window.__r != null && G.top() === G.field, null, 'the answer');

    // ---- words to try at Spanish club ----
    const club = await g.ev(() => {
      const W = G.words, H = G.hist, o = {};
      const gold = ['hola', 'gracias', 'buenosdias', 'feliz', 'uno', 'dos', 'tres', 'rojo', 'azul', 'abuela', 'perro', 'gato', 'casa', 'flor', 'pan'], two = ['adios', 'verde', 'abuelo'];
      const o2 = {}; gold.forEach(id => { o2[id] = [3, 1, false]; }); two.forEach(id => { o2[id] = [2, 1, false]; }); window.__set(o2);
      for (const id of ['f_llamo', 'f_gusta']) Object.assign(W.rec(id), { st: 3 });
      delete H.state().club;
      const L = H.club(), G2 = H.clubGroups(), grp = id => G2.findIndex(g => g.includes(id));
      o.L = L; o.allGold = L.every(id => W.stage(id) >= 3); o.inGroups = L.every(id => grp(id) >= 0); o.groups = new Set(L.map(grp)).size;
      o.noTwo = L.every(id => !two.includes(id)); o.noOther = !L.includes('casa') && !L.includes('flor') && !L.includes('pan');
      Object.assign(W.rec('adios'), { st: 3 }); o.same = H.club().join() === L.join(); // (kept all week)
      G.debug.dayShift += 7; o.next = H.club(); o.wk = H.state().club.wk; G.debug.dayShift -= 7;
      return o;
    });
    check('club: about 10 words and phrases she knows well (gold+): greetings, phrases, feelings, numbers, colours, family, animals; mixed', club.L.length >= 8 && club.L.length <= 12 && club.allGold && club.inGroups && club.groups >= 6 && club.noTwo && club.noOther, JSON.stringify(club));
    check('club: the list stays all week; a new one the next week', club.same && club.next.length >= 8 && club.next.length <= 12, JSON.stringify(club));
    check('numbers: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  The page: seven tabs, each one's text measured; the notices; share
// =====================================================================
// two weeks of play, the switch three days ago, a backlog that grows the last days, a failing mic, a check, a queue
const SEED = () => {
  G.rngState = 4321;
  const W = G.words, H = G.hist, B = G.budget, grow = G.cards.grow; G.cards.grow = () => 0;
  const plan = [['hola', 'perro', 'guau', 'ven'], ['gato', 'miau', 'uno'], ['buenosdias', 'hueso', 'sientate', 'dos'], ['si', 'no', 'manzana', 'rojo'], [], ['pelota', 'azul', 'tres'], ['pan', 'gracias', 'pato', 'cuac'], [], ['mar', 'concha', 'elsol', 'abuela'], ['oso', 'cueva', 'elbosque', 'feliz'], ['hoja', 'arbol', 'verde'], [], ['vaca', 'cerdo', 'gallina'], ['nieve', 'frio', 'cuatro']];
  for (let d = 0; d < plan.length; d++) {
    if (d) { G.debug.dayShift = -13 + d; W.newSession('load'); }
    if (d === 4 || d === 11) continue;
    H.day(); let n = 0;
    for (const id of W.list(1)) {
      if (!W.due(id)) continue;
      if (d >= 10 && ++n > 4) continue; // (the last days: only 4 reviews a day: the backlog grows)
      const r = W.rec(id), p = 0.55 + 0.1 * r.st;
      if (id === 'cuac') { W.answerWrong(id, { n: 3 }); W.addTime(40); continue; }
      if (G.rand() < p) { if (G.rand() < 0.4) { G.st.said(id); W.answerRight(id, { said: true, mode: 'say', recall: true }); } else W.answerRight(id, { mode: G.rand() < 0.5 ? 'text' : 'pic', recall: true, n: 3 }); }
      else { W.answerWrong(id, { n: 3 }); W.addTime(20); W.answerRight(id, { firstTry: false, n: 3 }); }
      W.addTime(30);
    }
    for (const id of plan[d]) { if (G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'show'); W.addTime(100); W.answerRight(id, { mode: 'both' }); W.addTime(400); W.answerRight(id, { mode: 'text' }); }
    H.day().s += 900 + Math.round(G.rand() * 900);
  }
  G.cards.grow = grow;
  G.debug.dayShift = 0; W.newSession('load');
  G.state.wm.v2 = W.dayNum() - 3; // (the stricter measure began three days ago)
  G.mic.tries = [{ e: 'network', at: G.now() }, { e: 'service-not-allowed', at: G.now() }, { e: 'network', at: G.now() }, { e: 'network', at: G.now() }];
  H.checkStart(['perro', 'gato', 'oso', 'hola', 'manzana']); H.checkAnswer(true); H.checkAnswer(false); H.checkAnswer(true); H.checkAnswer(true); H.checkAnswer(null);
  B.defer('pulpo'); B.defer('medusa');
  const td = G.today(); Object.assign(H.state().wu, { d: td, n: 9, last: { d: td, ids: ['perro', 'gato', 'oso', 'hola', 'si'], right: 4, of: 5 }, m: { d: td, n: 1, right: 2, of: 2 } });
};
// page side: what one frame writes on the main canvas: [text, x, y, width]
const STRINGS = () => g => g.ev(() => { const seen = [], t = G.text; G.text = function (ctx, s, x, y) { if (ctx === G.ctx) seen.push([String(s), Math.round(x), Math.round(y), G.textWidth(String(s))]); return t.apply(this, arguments); }; try { G.drawFrame(); } finally { G.text = t; } return seen; });
const strings = STRINGS();
async function page(browser) {
  const { ctx, g } = await open(browser, 'dash-page', true);
  try {
    await game(g, { day: -14 });
    await g.ev(SEED);
    await g.ev(() => { G.goto('villa', 22, 13, 'down'); });
    await g.fieldIdle('villa');
    await g.ev(() => { window.__speak.length = 0; G.dashboard.open(); });
    await g.until(() => G.top().constructor.name === 'LearningDash' && G.input.ready(), null, 'the Learning page');
    const tabs = await g.ev(() => G.dashboard.TABS.map((n, k) => { const r = G.top().tabRect(k); return { n, fits: G.textWidth(n) <= r.w - 6, r }; }));
    check('page: seven tabs, Overview Memory Pace Words Check Tonight Talk, each as wide as its name (none squeezed), all on screen, none overlapping',
      tabs.map(t => t.n).join() === 'Overview,Memory,Pace,Words,Check,Tonight,Talk' && tabs.every(t => t.fits) && tabs[6].r.x + tabs[6].r.w <= 318 && tabs.every((t, k) => !k || t.r.x >= tabs[k - 1].r.x + tabs[k - 1].r.w), JSON.stringify(tabs));
    const views = {};
    for (let k = 0; k < tabs.length; k++) {
      await g.tapRect(tabs[k].r);
      await g.until(k => G.top().tab === k, k, 'the tab ' + tabs[k].n);
      await g.frames(6); await still(g, 'tab_' + tabs[k].n.toLowerCase());
      const lb = await g.ev(() => G.top().listBox());
      const S = (await strings(g)).filter(([s, x, y]) => tabs[k].n !== 'Words' || y <= lb.y + lb.h - 8 || x < 10); // (the Words list is clipped to its box: a row cut off at its foot isn't seen)
      // every text inside the window, not cut ("..") and not on top of another on its line
      const out = S.filter(([s, x, y, w]) => x < 4 || x + w > 316 || y < 2 || y > 214);
      const cut = S.filter(([s]) => /\.\.$/.test(s));
      const over = []; S.forEach((a, i) => S.forEach((b, j) => { if (j > i && Math.abs(a[2] - b[2]) < 8 && a[1] < b[1] + b[3] && b[1] < a[1] + a[3]) over.push([a[0], b[0]]); }));
      check('page: ' + tabs[k].n + ': every text fits its place (inside the window, none cut, none on another)', !out.length && !cut.length && !over.length, JSON.stringify({ out, cut, over }));
      views[tabs[k].n] = { S: S.map(s => s[0]), v: await g.ev(() => { const v = G.top().view(); return { o: { recog7: v.overview.recog7, recall7: v.overview.recall7, checkVs: v.overview.checkVs, switchNote: v.overview.switchNote, backlog: v.overview.backlog }, reviews: v.reviews, newDays: v.newDays, club: v.club, mic: v.mic }; }) };
    }
    // the rows: labels and values measured (a label in its 70 px, a value in its 228)
    const rows = await g.ev(() => ['Overview', 'Memory', 'Pace', 'Talk'].map(t => G.dashboard.lines(t).map(([a, b]) => [t, a, G.textWidth(a), b, G.textWidth(b)])).flat());
    check('page: every label / value row fits (labels 70 px, values 228 px: nothing cut)', rows.length >= 20 && rows.every(r => r[2] <= 70 && r[4] <= 228), JSON.stringify(rows.filter(r => r[2] > 70 || r[4] > 228)));
    const ov = views.Overview, V = ov.v, has = (t, re) => views[t].S.some(s => re.test(s));
    check('overview: recognition (this week, lucky taps out) is the history\'s number', V.o.recog7.n >= 3 && has('Overview', new RegExp('^' + V.o.recog7.pct + '% this week, lucky taps taken out$')), JSON.stringify(V.o.recog7));
    check('overview: recall, reviews done and waiting, new items against the target, the warm-up with the mid-session moment',
      has('Overview', /^\d+ words? this week \(\d+ said\)$|^\d+ words? this week$/) && has('Overview', /^\d+ done this week; \d+ waiting now$/) && has('Overview', /^\d+ this week \(target about 2\.5 a play day\)$/) && has('Overview', /^5 cards today, 4 right first try; \+2 later$/), JSON.stringify(ov.S));
    check('overview: the mic\'s recent tries all failed: "Speaking: not working lately" instead of said aloud', has('Overview', /^Speaking$/) && has('Overview', /^not working lately: see Talk$/), JSON.stringify(ov.S));
    check('memory: two numbers: recognition and recall from memory (with how), your check beside the game\'s for the same words',
      has('Memory', /^Recognition$/) && has('Memory', /^Recall from memory$/) && has('Memory', new RegExp('^' + V.o.recall7.n + ' words? this week$')) && has('Memory', /^\d+ said, \d+ pictures, \d+ yours$/) && V.o.checkVs && V.o.checkVs.right === 3 && V.o.checkVs.of === 4 && has('Memory', new RegExp('^3 of 4 right \\(.*\\); the game: ' + (V.o.checkVs.game.n >= 3 ? V.o.checkVs.game.pct + '%' : 'too few yet') + '$')), JSON.stringify([V.o.checkVs, views.Memory.S]));
    check('memory: forgotten, relearned, not seen in 30 / 60 days; the dated note (the switch three days ago)', has('Memory', /^Forgotten$/) && has('Memory', /^Relearned$/) && has('Memory', /in 30\+ days, \d+ in 60\+ days$/) && V.o.switchNote && has('Memory', /^From [A-Z][a-z]{2} \d+ the game uses a stricter measure; earlier$/), JSON.stringify(views.Memory.S));
    const P = views.Pace.v;
    check('pace: 21 days of reviews due and done; the last days fall behind (due > done): the backlog shows; waiting now', P.reviews.length === 21 && P.reviews.slice(-4).some(d => d.due > d.done) && P.reviews.filter(d => d.done).length >= 8 && has('Pace', /^\d+ reviews?(: new words wait| \(up to 5 is fine\))$/), JSON.stringify(P.reviews.map(d => [d.due, d.done, d.est])));
    check('pace: new items a day against the target; the held-back words (the pacing\'s queue)', P.newDays.length === 21 && P.newDays.filter(d => d.n).length >= 8 && has('Pace', /^New today$/) && has('Pace', /^el pulpo, la medusa$/), JSON.stringify(views.Pace.S));
    check('words: the review box is 1-8 now', has('Words', /review box \(1-8\)/));
    const T = views.Talk.v;
    const clubEs = await g.ev(L => L.map(id => G.data.words[id] ? [G.data.words[id].es.split(' / ')[0], G.data.words[id].en.replace(/^the /, '')] : [G.data.phrases[id].es.replace('___', '...'), G.data.phrases[id].en.replace('___', '...')]), T.club);
    check('talk: words to try at Spanish club: gold words, 8-12, each drawn with its English', T.club.length >= 8 && T.club.length <= 12 && await g.ev(L => L.every(id => G.words.stage(id) >= 3), T.club) && has('Talk', /^Words to try at Spanish club$/) && clubEs.every(([a, b]) => views.Talk.S.includes(a) && views.Talk.S.includes(b)), JSON.stringify([T.club, clubEs, views.Talk.S]));
    check('talk: the mic notice with the iPad settings, and where her voice goes', T.mic.st === 'unavailable' && has('Talk', /^not working: last 4 tries failed \(network\)$/) && has('Talk', /Siri & Dictation/) && has('Talk', /Dictation Languages\.$/) && has('Talk', /may send/) && has('Talk', /keeps no audio\.$/), JSON.stringify(views.Talk.S));
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(await g.ev(() => G.top().clubRect(0)));
    check('talk: tap a club word to hear it', await g.until(L => window.__speak.some(s => s.text === G.baseForm(L[0])), T.club, 'the word said', 3000).then(() => true));
    // the strength bar: eight box marks, lit up to the box
    const sb = await g.ev(() => { const marks = box => { const R = []; const c = { set fillStyle(v) { this.f = v; }, get fillStyle() { return this.f; }, fillRect(x, y, w, h) { if (y === 109) R.push(this.f); } }; G.dashboard.strength(c, 10, 100, 3, box); return { n: R.length, lit: R.filter(f => f === '#c8d0f0').length }; }; return [marks(5), marks(8), marks(1)]; });
    check('words: the strength bar has 8 box marks (box 5: 5 lit, not full; box 8: full)', sb[0].n === 8 && sb[0].lit === 5 && sb[1].lit === 8 && sb[2].lit === 1, JSON.stringify(sb));
    // share
    await g.ev(() => { window.__shared = null; navigator.share = o => { window.__shared = o; return Promise.resolve(); }; });
    await g.tapRect(await g.ev(() => G.top().shareRect()));
    await g.until(() => !!window.__shared, null, 'the share sheet', 3000);
    const sh = await g.ev(() => window.__shared.text);
    check('share: recognition (lucky taps out), recall, reviews and waiting, new items and the target, said aloud, the mic notice, forgotten / not seen, the warm-up, your check beside the game\'s, club words, the dated note',
      /Recognition \(.*lucky taps taken out\): \d+% in the last 7 days/.test(sh) && /Recall from memory: \d+ words? in the last 7 days/.test(sh) && /Reviews: \d+ done in the last 7 days; \d+ waiting now/.test(sh) && /target about 2\.5 a play day/.test(sh) && /Said aloud: .*echoes and dog commands not counted/.test(sh) && /Speaking: not working lately/.test(sh) && /Not seen in 30\+ days/.test(sh) && /Warm-up: 5 cards today, 4 right first try; \+2 later\./.test(sh) && /Last word check: 3 of 4/.test(sh) && /Words to try at Spanish club: /.test(sh) && /From [A-Z][a-z]{2} \d+ the game uses a stricter measure; earlier numbers counted guesses and same-day answers\./.test(sh), sh);
    // the mic working again: the notice goes
    await g.ev(() => { G.mic.note({ ok: true, alternatives: [] }); });
    await g.tapRect(await g.ev(() => G.top().tabRect(0))); await g.frames(40);
    check('overview: once a try hears her, said aloud is back (once a day each)', (await strings(g)).some(s => /^\d+ words? this week \(once a day each\)$/.test(s[0])));
    check('page: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('The honest Learning page (AUDIT 2.8)', [['the numbers', numbers], ['the page (iPad)', page]]);
