// ===== The learning history: what the child practised, day by day, kept in the save (no audio, on the device only) =====
// docs/LEARNING_PLAN_2.md, Phase 1 ("measure and review"). The parent wants to know what she actually RETAINS, so every
// retrieval is recorded with the gap since the word was last met or used: retention = right on the first try when a word
// comes back after a day or more.
//
// Saved in G.state.hist (one key, compact):
//   d: { 'YYYY-M-D' (G.today()): { n (the day's number: words.js dayNum), s (seconds played), met: [ids met that day],
//        w: { id: [gap, events, k] }, bd, rv, bl } }   the last H.KEEP days; older ones fold into `old` (their totals)
//      k: how many choices the word's first pick of the day had (G.ask; absent when not known: a page match, an
//        older day), for the guess-adjusted recognition below
//      bd: reviews due when the day began (the pacing's backlog, words.js G.budget.backlog: words due by calendar day,
//        and follow-ups left from an earlier sitting); rv: due reviews done (H.reviewed: a due word answered so that it
//        leaves the due list: right, or a miss); bl: the backlog left, the last time it was looked at (every 2 s of play).
//        (AUDIT 2.8: done against due a day, so a growing backlog shows. Days from before 2026-10-22 have none)
//      gap: whole days between the word's previous encounter (words.js r.ld: met, picked, recalled, said, missed,
//        checked; passive appearances in a line don't count) and its first event that day (-1: unknown); every later event
//        of the day has a gap of 0, so one gap per word and day keeps every event's gap
//      events: one letter per retrieval, in order: P pick, R recall (word-only cards, a page match), S said aloud,
//        L listen (the word understood in a spoken instruction with no picture: listen-and-do, src/listen.js, one per
//        word per request) (capital: right on the first try; p, r, s, l: right after a miss), K a cued pick (it could be
//        matched; a page puzzle's forced last pair too), E said right after hearing it (an echo), m a miss, C / c a
//        grown-up's check right / wrong, and RECALLED FROM MEMORY (2026-10, AUDIT 2.3 / 2.6; always first try):
//        F said before any written cue (say-it-first: words.js answerRight {mode: 'say', recall: true, said: true}),
//        V picked from picture-only cards with no written word on screen, on a later calendar day than the word was last
//        met or used (answerRight {mode: 'pic', recall: true}; the same day it is a P). F, V and C (H.MEM) are the
//        stages' evidence for solid (words.js). (Up to H.EVMAX a word a day.) An L that comes first on a day the word is
//        back after 1+ days counts for retention.
//   old: { days, s, rn, rr, pr, sp, cy, cn, sw, pw }   the folded days' totals (see stats below)
//   club: { wk, ids }   this week's "words to try at Spanish club" (H.club: kept all week)
//   pre: seconds of play before the history began (an older save's G.state.playTime)
//   chk: { cur: {d, at, ids, r: [1 | 0 | null], i} | null, log: [{d, at, ids, r}] }   the grown-ups' word checks
//   wu: { d: the day the dog's warm-up last ran (or was skipped), n: warm-ups done, k: skipped, none: days with too few
//        words, last: {d, ids, right, of} }   (warmup.js)
//   hoy: { d: 'YYYY-M-D', w: [ids grown since the morning], s, m: stars and speaking stars then }   the Hoy card's day,
//        by calendar date (a game opened again the same day keeps it; a night at home starts a new one; src/day.js)
//   ld: { n: listen-and-do requests done, ft: right on the first try, td: {d, n, ft} (today's), lvl: 1 | 2 (one detail,
//        or two details too: the request maker's ramp, src/requests.js), ok1: first-try rights at level 1, miss2: two-
//        detail requests missed in a row, last: {d, say, ok} }   (src/listen.js)
// Recording (words.js and state.js call these; content never needs to): H.event(id, kind, o), H.met(id), H.step(),
// H.reviewed() (a due review done).
//
// API (G.hist, short H): (o.days: the last n calendar days including today; o.all: everything, the folded days too)
//   H.state()                 the saved object          H.day(key?) a day's record (today's by default, made on demand)
//   H.days()                  the kept days' keys, oldest first
//   H.events(o)               [{day, n, word, kind: 'pick'|'recall'|'say'|'listen'|'miss'|'parent', first, ok, cued, echo,
//                             mem (recalled from memory: F, V, C), gap}]   H.isMem(letter)
//   H.stats(o)                {rn, rr (retention: first events after a day or more, right first try), pr (practice
//                             events, the grown-ups' checks and the phrase builder's taps apart), sp (said aloud), cy,
//                             cn (checks right / wrong), sw / pw (word-days said aloud / practised), s}
//   H.retention(o)            {n, right, pct}  (pct null with no data)      H.retentionByDay(n) [{key, n, right, pct}]
//   H.spoken(o)               {said, all, pct}                              H.minutes(key?)  H.totalMinutes()
//   H.daysPlayed()            calendar days with play (from older word records too)
//   H.zoneRows(zone)          a zone's words for the grown-ups (warmup.js / dashboard.js): {id, met, st, box, said,
//                             ago (days since last met or used, or null), slip}
//   H.overview()              the numbers on the grown-ups' Learning page
//   The honest numbers (AUDIT 2.8; o as above, o.ids: only these words):
//   H.recognition(o)          {n, right, chance, raw, pct}: each word's first event of a day it is back after a day or
//                             more, when that is a pick among choices (P R V L right, m a miss); pct guess-adjusted
//                             (lucky taps taken out); phrases apart (the builder is always right)
//   H.recall(o)               {n, f, v, c, back}: words recalled from memory (F, V on a day back after a day or more;
//                             C a grown-up's check), word-days; back: word-days back after a day or more
//   H.saidAloud(o)            {said, of}: word-days said aloud (S, s, F: an echo, E, isn't; a dog command only when
//                             said from memory, F) of word-days practised (phrases: H.phraseStats)
//   H.reviewDays(n)           the last n calendar days: [{num, key, due, done, left, played, est}] (est: done estimated,
//                             a day from before the counts began)      H.newDays(n) [{num, key, n}] new words and phrases
//   H.unseen()                {d30, d60}   met words not met or used in 30+ / 60+ days
//   H.forgotten()             {now, relearned, week}   gold words missed and not back yet; relearned in all / this week
//   H.club()                  this week's words to try at Spanish club (gold and up: greetings, phrases, feelings,
//                             numbers, colours, family, animals; about 10, kept all week, new each Monday)
//   H.checkVsGame()           the last check beside the game's recognition for the same words, or null
//   H.switchNote()            the date the stricter measure began (words.js W.switchDay), while it's worth saying
//   H.listen()                listen-and-do (src/listen.js): {n, ft, pct, today: {n, ft}} requests done, right first try
//   H.listenDone(ok, first)   a request done (listen.js; ok: right in the end, first: right on the first try)
//   The grown-ups' check: H.checkPick(n), H.checkStart(), H.checkCur(), H.checkAnswer(ok: true | false | null (skip)),
//   H.checkStop(), H.checkLast() -> {d, ago, right, of} | null, H.checks() (the log)
'use strict';
(function () {
  const H = G.hist = {};
  H.KEEP = 60;          // days kept in detail
  H.EVMAX = 60;         // events kept per word per day (a dog trick can be said fifty times...)
  H.IDLE = 180 * 60;    // frames without a touch or a key before play time stops counting (3 min)
  H.CHECK_N = 10;       // words in a grown-ups' check
  H.KIND = { P: 'pick', p: 'pick', K: 'pick', R: 'recall', r: 'recall', S: 'say', s: 'say', E: 'say', L: 'listen', l: 'listen', m: 'miss', C: 'parent', c: 'parent', F: 'say', V: 'recall' };
  H.MEM = 'FVC'; // recalled from memory: said before any written cue, picked from pictures alone on a later day, a grown-up's check
  H.isMem = c => !!c && c.length === 1 && H.MEM.indexOf(c) >= 0;
  const ADULT = ['GrownUps', 'LearningDash', 'MicTest', 'Controls', 'QuestLog', 'Backup', 'ProblemLog']; // grown-ups' screens: not play time
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const W = () => G.words, D = () => G.data;
  const today = () => G.today(), dn = () => G.words.dayNum();

  // ---------- the saved object ----------
  function st() {
    const s = G.state; if (!isObj(s.hist)) s.hist = {};
    const h = s.hist;
    if (!h.v) { h.v = 1; h.pre = Math.round(+s.playTime || 0); } // (a new history: the play before it is kept as a number)
    if (!isObj(h.d)) h.d = {};
    if (!isObj(h.old)) h.old = { days: 0, s: 0, rn: 0, rr: 0, pr: 0, sp: 0, cy: 0, cn: 0 };
    if (!isObj(h.chk)) h.chk = {};
    if (!Array.isArray(h.chk.log)) h.chk.log = [];
    if (h.chk.cur && !(isObj(h.chk.cur) && Array.isArray(h.chk.cur.ids) && Array.isArray(h.chk.cur.r))) h.chk.cur = null;
    if (!isObj(h.wu)) h.wu = { d: '', n: 0, k: 0, none: 0 };
    if (!isObj(h.ld)) h.ld = { n: 0, ft: 0, lvl: 1, ok1: 0, miss2: 0 };
    return h;
  }
  H.state = () => (G.state ? st() : null);
  const save = () => { if (G.st && G.st.autosave) G.st.autosave(); };
  H.numOf = key => G.words.numOf(key);
  // the day's record, made on demand (making one folds the oldest beyond H.KEEP)
  H.day = function (key) {
    const h = st(); key = key || today();
    let d = h.d[key];
    if (!isObj(d)) { d = h.d[key] = { n: key === today() ? dn() : H.numOf(key), s: 0, met: [], w: {} }; prune(h); }
    if (d.bd == null && key === today() && G.budget) { d.bd = G.budget.backlog() + (d.rv | 0); d.rv = d.rv | 0; } // (reviews due as the day began; a day begun by an older copy: from now)
    if (!Array.isArray(d.met)) d.met = [];
    if (!isObj(d.w)) d.w = {};
    if (!Number.isFinite(d.n)) d.n = H.numOf(key);
    return d;
  };
  const keys = h => Object.keys(h.d).filter(k => isObj(h.d[k]) && Number.isFinite(h.d[k].n)).sort((a, b) => h.d[a].n - h.d[b].n);
  H.days = () => (G.state ? keys(st()) : []);
  function prune(h) {
    const K = keys(h);
    while (K.length > H.KEEP) {
      const k = K.shift(), s = dayStats(h.d[k]), o = h.old;
      o.days += s.s > 0 || s.pr + s.cy + s.cn > 0 ? 1 : 0;
      for (const f of ['s', 'rn', 'rr', 'pr', 'sp', 'cy', 'cn', 'sw', 'pw']) o[f] = (o[f] | 0) + (s[f] | 0);
      delete h.d[k];
    }
  }

  // ---------- recording ----------
  // a retrieval (words.js answerRight / answerWrong, state.js said). o.said: said aloud (the mic); o.answer: a question's
  // answer (answerRight). The mic's say (G.st.said) comes a moment before the answer it belongs to: the answer then
  // replaces it (first try or not, an echo) instead of counting twice.
  // o.n: the question's choices, kept with the word's first pick of the day (recognition's guessing floor).
  let pend = null;
  const PICKS = 'PRVLm';
  H.event = function (id, k, o = {}) {
    if (!G.state || !W().item(id) || !H.KIND[k]) return null; // (a word or a phrase: phrases.js)
    const d = H.day(), r = W().rec(id);
    let e = d.w[id];
    if (o.answer && o.said && pend && pend.id === id && pend.key === today() && G.frame - pend.f <= 150 && Array.isArray(e) && typeof e[1] === 'string' && e[1].length > pend.i) {
      e[1] = e[1].slice(0, pend.i) + k + e[1].slice(pend.i + 1); pend = null;
      return k;
    }
    if (!Array.isArray(e) || typeof e[1] !== 'string') {
      const ld = W().lastDay(id);
      e = d.w[id] = [ld == null ? -1 : Math.max(0, d.n - ld), ''];
      if (o.n > 0 && PICKS.indexOf(k) >= 0) e[2] = o.n | 0;
    }
    if (e[1].length < H.EVMAX) e[1] += k;
    pend = o.said && !o.answer ? { id, key: today(), i: e[1].length - 1, f: G.frame } : null;
    if (r) r.ld = d.n;
    save();
    return k;
  };
  // a due review done (words.js answerRight / answerWrong: a word in the pacing's backlog answered so that it leaves it:
  // a right first try moves it up a box, a miss brings it back in minutes; a cued pick leaves it due)
  H.reviewed = function () { if (G.state) { const d = H.day(); d.rv = (d.rv | 0) + 1; } };
  // a word met (words.js meet)
  H.met = function (id) { if (!G.state || W().isPhrase(id)) return; const d = H.day(); if (d.met.indexOf(id) < 0) d.met.push(id); }; // (words: a phrase's introduction is G.state.phrases.intro)
  // every frame a game is on (words.js step): today's seconds of play (not while idle, not on the grown-ups' screens)
  let acc = 0, lastIn = 0, lastState = null;
  H.step = function () {
    if (!G.state) return;
    if (lastState !== G.state) { lastState = G.state; lastIn = G.frame; acc = 0; }
    if (G.frame % 120 === 0 && G.budget) H.day().bl = G.budget.backlog(); // (the backlog left: the day's last look)
    if (G.input.ptr.down || G.input.tap() || Object.keys(G.pressed).length) lastIn = G.frame;
    const top = G.top(), name = top && top.constructor ? top.constructor.name : '';
    if (ADULT.indexOf(name) >= 0 || G.frame - lastIn > H.IDLE) return;
    if ((acc += 1 / 60) >= 1) { acc -= 1; H.day().s++; }
  };

  // ---------- reading ----------
  const CAP = c => c === 'P' || c === 'R' || c === 'S' || c === 'L' || c === 'C' || c === 'F' || c === 'V';
  // one day's numbers: rn / rr retention (each word's first event that day, after a day or more: was it right first
  // try? a cued pick or an echo is no test, and a check before it means it was just seen), pr practice (every event but
  // the grown-ups' checks), sp said aloud, cy / cn checks right / wrong, s seconds played
  // (2026-10, AUDIT 2.8: a phrase built from its cards (P) is always right, so it is never a retention point; sw / pw:
  // word-days said aloud / practised, H.saidAloud)
  function dayStats(d, minGap = 1) {
    const o = { s: d.s | 0, rn: 0, rr: 0, pr: 0, sp: 0, cy: 0, cn: 0, sw: 0, pw: 0 };
    for (const id in d.w) {
      const e = d.w[id]; if (!Array.isArray(e) || typeof e[1] !== 'string') continue;
      const ev = e[1], gap = e[0], ph = W().isPhrase(id);
      for (const c of ev) { if (c === 'C') o.cy++; else if (c === 'c') o.cn++; else if (!(ph && (c === 'P' || c === 'p'))) { o.pr++; if (c === 'S' || c === 's' || c === 'E' || c === 'F') o.sp++; } } // (a phrase built from its cards: taps, not practice)
      if (!ph && /[^Cc]/.test(ev)) { o.pw++; if (saidIn(id, ev)) o.sw++; }
      const c0 = ev[0];
      if (c0 && gap >= minGap && c0 !== 'C' && c0 !== 'c' && c0 !== 'K' && c0 !== 'E' && !(ph && (c0 === 'P' || c0 === 'p'))) { o.rn++; if (CAP(c0)) o.rr++; }
    }
    return o;
  }
  // said aloud that day (S, s, F; an echo, E, only repeats what was just heard); a dog command (pet.js: said to the dog
  // from his menu, where its card is written, often many times a day) only when said from memory (F)
  const isTrick = id => !!(G.pet && G.pet.TRICKS && G.pet.TRICKS.some(t => t.id === id));
  function saidIn(id, ev) { return isTrick(id) ? ev.indexOf('F') >= 0 : /[SsF]/.test(ev); }
  H.dayStats = dayStats;
  // the days o covers: o.days (the last n calendar days, today included), o.key (one day), else every kept day
  function inRange(o = {}) {
    const h = st(), K = keys(h);
    if (o.key) return h.d[o.key] ? [h.d[o.key]] : [];
    if (o.days) { const lo = dn() - o.days + 1; return K.map(k => h.d[k]).filter(d => d.n >= lo); }
    return K.map(k => h.d[k]);
  }
  H.stats = function (o = {}) {
    const t = { s: 0, rn: 0, rr: 0, pr: 0, sp: 0, cy: 0, cn: 0, sw: 0, pw: 0 };
    if (!G.state) return t;
    for (const d of inRange(o)) { const s = dayStats(d, o.minGap || 1); for (const f in t) t[f] += s[f]; }
    if (o.all) { const old = st().old; for (const f in t) t[f] += old[f] | 0; }
    return t;
  };
  const pct = (a, b) => (b > 0 ? Math.round(a * 100 / b) : null);
  H.retention = o => { const s = H.stats(o); return { n: s.rn, right: s.rr, pct: pct(s.rr, s.rn) }; };
  H.spoken = o => { const s = H.stats(o); return { said: s.sp, all: s.pr, pct: pct(s.sp, s.pr) }; }; // (every said event, echoes too: the older measure; the page shows H.saidAloud)
  // the last n calendar days, oldest first (a day not played: n 0)
  H.retentionByDay = function (n = 14) {
    const out = []; if (!G.state) return out;
    const h = st(), byN = {}; for (const k of keys(h)) byN[h.d[k].n] = k;
    for (let i = n - 1; i >= 0; i--) {
      const num = dn() - i, k = byN[num], s = k ? dayStats(h.d[k]) : { rn: 0, rr: 0, pr: 0, s: 0 };
      out.push({ key: k || null, n: s.rn, right: s.rr, pct: pct(s.rr, s.rn), num, practice: s.pr, sec: s.s });
    }
    return out;
  };
  H.events = function (o = {}) {
    const out = []; if (!G.state) return out;
    for (const d of inRange(o)) {
      const key = keys(st()).find(k => st().d[k] === d);
      for (const id in d.w) {
        const e = d.w[id]; if (!Array.isArray(e) || typeof e[1] !== 'string') continue;
        [...e[1]].forEach((c, i) => out.push({ day: key, n: d.n, word: id, kind: H.KIND[c], first: CAP(c) || c === 'K' || c === 'E', ok: c !== 'm' && c !== 'c', cued: c === 'K' || c === 'E', echo: c === 'E', mem: H.isMem(c), gap: i ? 0 : e[0] }));
      }
    }
    return out;
  };
  H.minutes = key => { if (!G.state) return 0; const d = st().d[key || today()]; return d ? Math.floor((d.s | 0) / 60) : 0; };
  H.totalMinutes = () => { if (!G.state) return 0; const h = st(); return Math.floor(((h.pre | 0) + H.stats({ all: true }).s) / 60); };
  // calendar days with play: the history's, and the days older word records were met or answered on
  H.daysPlayed = function () {
    if (!G.state) return 0;
    const h = st(), set = new Set();
    for (const k of keys(h)) { const d = h.d[k]; if ((d.s | 0) >= 20 || d.met.length || Object.keys(d.w).length) set.add(d.n); }
    for (const id in G.state.words) {
      const r = W().rec(id); if (!r || r.st < 1) continue;
      for (const s of [r.mdate, r.star].concat(isObj(r.ft) ? Object.keys(r.ft) : [])) { const n = H.numOf(s); if (n != null) set.add(n); }
    }
    return set.size + (h.old.days | 0);
  };

  // ---------- a zone's words, for the grown-ups ----------
  H.wordsOf = zone => D().pageOrder.filter(p => D().pages[p] && (G.zones ? G.zones.ofTopic(D().pages[p].topic) : 'villa') === zone).reduce((a, p) => a.concat(D().pages[p].words.filter(id => a.indexOf(id) < 0)), []);
  H.row = function (id) {
    const r = W().rec(id), st0 = W().stage(id), g = W().gapDays(id);
    return { id, met: st0 >= 1, st: st0, box: r && st0 >= 1 ? Math.max(1, r.box | 0) : 0, said: r ? r.said | 0 : 0, ago: st0 >= 1 ? g : null, slip: W().slipping(id) };
  };
  H.zoneRows = zone => H.wordsOf(zone).map(H.row);
  // the phrases (phrases.js), for the grown-ups' Frases tab: the same rows
  H.phraseIds = () => (D().phraseOrder || Object.keys(D().phrases || {})).filter(id => D().phrases && D().phrases[id]);
  H.phraseRows = () => H.phraseIds().map(H.row);
  // phrases said aloud (S, s, F: once a day each; an echo, E, said right after it was modelled, isn't) and built from
  // their cards (P, p: taps, always right: shown apart, never counted as practice), in the kept days and today
  H.phraseStats = function () {
    const out = { met: 0, of: H.phraseIds().length, said: 0, today: 0, built: 0 };
    if (!G.state) return out;
    out.met = H.phraseIds().filter(id => W().met(id)).length;
    const h = st(), td = today();
    for (const k of keys(h)) {
      const d = h.d[k];
      for (const id in d.w) {
        if (!W().isPhrase(id)) continue;
        const e = d.w[id]; if (!Array.isArray(e) || typeof e[1] !== 'string') continue;
        if (/[SsF]/.test(e[1])) { out.said++; if (k === td) out.today++; }
        out.built += (e[1].match(/[Pp]/g) || []).length;
      }
    }
    return out;
  };

  // ---------- listen-and-do: requests done, right on the first try (src/listen.js) ----------
  H.listenState = () => (G.state ? st().ld : null);
  H.listenDone = function (ok, first, say) {
    if (!G.state) return;
    const L = st().ld, td = today();
    if (!isObj(L.td) || L.td.d !== td) L.td = { d: td, n: 0, ft: 0 };
    L.n = (L.n | 0) + 1; L.td.n++;
    if (first) { L.ft = (L.ft | 0) + 1; L.td.ft++; }
    L.last = { d: td, say: say || '', ok: ok ? 1 : 0, first: first ? 1 : 0 };
    save();
  };
  H.listen = function () {
    const out = { n: 0, ft: 0, pct: null, today: { n: 0, ft: 0 } }; if (!G.state) return out;
    const L = st().ld; out.n = L.n | 0; out.ft = L.ft | 0; out.pct = pct(out.ft, out.n);
    if (isObj(L.td) && L.td.d === today()) out.today = { n: L.td.n | 0, ft: L.td.ft | 0 };
    return out;
  };

  // ---------- the honest numbers (AUDIT 2.8: H3, L2, M18) ----------
  const entries = (o, fn) => { for (const d of inRange(o)) for (const id in d.w) { const e = d.w[id]; if (Array.isArray(e) && typeof e[1] === 'string' && (!o.ids || o.ids.indexOf(id) >= 0)) fn(id, e, d); } };
  // recognition: a pick among k choices is right by luck 1/k of the time (k: the question's cards, e[2]; 3, the game's
  // usual, when not known). With p right of n first picks and c the average 1/k: (p - c) / (1 - c), clamped 0..1. A
  // check first that day means it was just seen; a cued pick or an echo is no test
  H.GUESS_K = 3;
  H.recognition = function (o = {}) {
    const out = { n: 0, right: 0, chance: 0, raw: null, pct: null }; if (!G.state) return out;
    let cs = 0;
    entries(o, (id, e) => {
      const c0 = e[1][0]; if (W().isPhrase(id) || !(e[0] >= 1) || !c0 || PICKS.indexOf(c0) < 0) return;
      out.n++; if (c0 !== 'm') out.right++; cs += 1 / Math.max(2, e[2] > 1 ? e[2] : H.GUESS_K);
    });
    if (!out.n) return out;
    const p = out.right / out.n, c = cs / out.n;
    out.chance = Math.round(c * 100); out.raw = Math.round(p * 100); out.pct = Math.round(Math.max(0, Math.min(1, (p - c) / (1 - c))) * 100);
    return out;
  };
  // recalled from memory (word-days): said before any written cue (F) or picked from pictures alone (V) on a day it is
  // back after a day or more, or a grown-up's check right (C, any day); back: word-days back after a day or more (the
  // first event not a check, a cued pick or an echo)
  H.recall = function (o = {}) {
    const out = { n: 0, f: 0, v: 0, c: 0, back: 0 }; if (!G.state) return out;
    entries(o, (id, e) => {
      if (W().isPhrase(id)) return;
      const ev = e[1], back = e[0] >= 1, c0 = ev[0], f = back && ev.indexOf('F') >= 0, v = back && ev.indexOf('V') >= 0, c = ev.indexOf('C') >= 0;
      if (back && 'CcKE'.indexOf(c0) < 0) out.back++;
      if (f) out.f++; if (v) out.v++; if (c) out.c++; if (f || v || c) out.n++;
    });
    return out;
  };
  // said aloud: word-days (once a day per word), not echoes, not dog commands said at his menu (dayStats: sw of pw)
  H.saidAloud = o => { const s = H.stats(o); return { said: s.sw, of: s.pw, pct: pct(s.sw, s.pw) }; };
  // reviews due when each day began, due reviews done, the backlog left; a played day from before the counts began
  // (no bd): done estimated (words back after a day or more that were answered), due unknown
  const doneEst = d => { let n = 0; for (const id in d.w) { const e = d.w[id]; if (Array.isArray(e) && typeof e[1] === 'string' && e[0] >= 1 && !W().isPhrase(id) && /[PRSLFVCm]/.test(e[1])) n++; } return n; };
  const byNum = () => { const h = st(), m = {}; for (const k of keys(h)) m[h.d[k].n] = k; return m; };
  H.reviewDays = function (n = 21) {
    const out = []; if (!G.state) return out;
    const h = st(), m = byNum();
    for (let i = n - 1; i >= 0; i--) {
      const num = dn() - i, key = m[num], d = key ? h.d[key] : null, played = !!d && ((d.s | 0) >= 20 || Object.keys(d.w).length > 0);
      if (!d || d.bd == null) out.push({ num, key: key || null, due: null, done: played ? doneEst(d) : 0, left: null, played, est: played });
      else out.push({ num, key, due: d.bd | 0, done: d.rv | 0, left: key === today() && G.budget ? G.budget.backlog() : d.bl != null ? d.bl | 0 : null, played, est: false });
    }
    return out;
  };
  // new items a day: words met (d.met) and phrases met that day (their records' mdate)
  H.newDays = function (n = 21) {
    const out = []; if (!G.state) return out;
    const h = st(), m = byNum(), pm = {}, P = G.state.phrases;
    if (isObj(P) && isObj(P.r)) for (const id in P.r) { const r = P.r[id]; if (isObj(r) && r.st >= 1 && r.how !== 'old' && r.mdate) pm[r.mdate] = (pm[r.mdate] | 0) + 1; }
    for (let i = n - 1; i >= 0; i--) { const num = dn() - i, key = m[num], d = key ? h.d[key] : null; out.push({ num, key: key || null, n: d ? d.met.length + (pm[key] | 0) : 0, played: !!d && ((d.s | 0) >= 20 || Object.keys(d.w).length > 0 || d.met.length > 0) }); }
    return out;
  };
  // met words not met or used in 30+ / 60+ days (a word on a long gap can be on schedule; this says how much is resting)
  H.unseen = function () {
    const out = { d30: 0, d60: 0 }; if (!G.state) return out;
    for (const id of W().list(1)) { const g = W().gapDays(id); if (g != null && g >= 30) { out.d30++; if (g >= 60) out.d60++; } }
    return out;
  };
  // forgotten: gold words (stage 3+) missed and not back yet (words.js r.fg); relearned: gold again (r.rl, r.rld)
  H.forgotten = function () {
    const out = { now: 0, relearned: 0, week: 0, ids: [] }; if (!G.state) return out;
    for (const id of W().list(1)) { const r = W().rec(id); if (r.fg != null) { out.now++; out.ids.push(id); } out.relearned += r.rl | 0; if (r.rld != null && r.rld > dn() - 7) out.week++; }
    return out;
  };
  // the last check, beside the game's own recognition for the same words (its picks, the checks apart)
  H.checkVsGame = function () {
    const c = H.checkLast(); if (!c) return null;
    const ids = c.ids.filter((id, k) => c.r[k] != null);
    return Object.assign({}, c, { game: H.recognition({ ids }) });
  };
  // the dated note: from the switch day (words.js wm.v2) the stricter measure; said while there's play from before it
  // (an older save) and for H.NOTE_DAYS after
  H.NOTE_DAYS = 120;
  H.switchNote = function () {
    if (!G.state || !W().switchDay) return null;
    const v2 = W().switchDay(); if (v2 == null || dn() - v2 > H.NOTE_DAYS) return null;
    const h = st(); let before = (h.old.days | 0) > 0 || keys(h).some(k => h.d[k].n < v2);
    if (!before) for (const id of W().list(1)) { const r = W().rec(id), n = r.mdn != null ? r.mdn : W().numOf(r.mdate); if (n != null && n < v2) { before = true; break; } }
    return before ? { num: v2 } : null;
  };

  // ---------- words to try at Spanish club (roadmap 4.3): words and phrases she knows well, good for talking ----------
  // Gold and up (stage 3+), from greetings, phrases, feelings, numbers, colours, family and animals, one group at a time
  // (so the list is varied), in a different order each week; chosen once a week (kept in hist.club, so the list doesn't
  // change under the grown-up mid-week; topped up if it's short) and new each Monday.
  H.CLUB = 10;
  const week = () => Math.floor((dn() + 3) / 7); // (Monday weeks: day 0, 1970-01-01, was a Thursday)
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; };
  H.clubGroups = function () {
    const ws = D().words, of = t => Object.keys(ws).filter(id => ws[id].topic === t);
    return [of('saludos'), H.phraseIds(), of('sentir'), of('numeros'), of('colores'), of('familia'), Object.keys(ws).filter(id => G.animals && G.animals.KINDS && G.animals.KINDS[id])];
  };
  H.club = function () {
    if (!G.state) return [];
    const h = st(), wk = week(), gold = id => !!W().item(id) && W().stage(id) >= 3;
    if (!isObj(h.club) || h.club.wk !== wk || !Array.isArray(h.club.ids)) h.club = { wk, ids: [] };
    const c = h.club; c.ids = c.ids.filter(gold);
    if (c.ids.length < H.CLUB) {
      const G2 = H.clubGroups().map(L => L.filter(id => gold(id) && c.ids.indexOf(id) < 0).sort((a, b) => hash(wk + a) - hash(wk + b)));
      for (let k = 0, more = true; c.ids.length < H.CLUB && more; k++) { more = false; for (const L of G2) if (L[k] && c.ids.length < H.CLUB) { c.ids.push(L[k]); more = true; } }
    }
    return c.ids.slice();
  };

  // ---------- the overview ----------
  H.overview = function () {
    const Wd = W(), r7 = H.retention({ days: 7 }), ra = H.retention({ all: true }), sp = H.spoken({ all: true }), h = st();
    return {
      days: H.daysPlayed(), minutes: H.totalMinutes(), today: H.minutes(),
      met: Wd.count(1), known: Wd.count(2), remembered: Wd.count(3), solid: Wd.count(4), all: Object.keys(D().words).length,
      slipping: Wd.slipList(), r7, ra, spoken: sp, check: H.checkLast(), warmup: Object.assign({}, h.wu),
      phrases: H.phraseStats(), listen: H.listen(),
      recog7: H.recognition({ days: 7 }), recogAll: H.recognition(), recall7: H.recall({ days: 7 }), recallAll: H.recall(),
      said7: H.saidAloud({ days: 7 }), reviews: H.reviewDays(7), backlog: G.budget ? G.budget.backlog() : 0,
      newDays: H.newDays(7), target: G.budget ? G.budget.target() : 0, queue: G.budget ? G.budget.queue() : [],
      unseen: H.unseen(), forgotten: H.forgotten(), checkVs: H.checkVsGame(), switchNote: H.switchNote(),
    };
  };

  // ---------- the grown-ups' check: words to ask away from the game ----------
  // Half that need it (slipping first, then due or only met, the longest unseen first), half strong ones (remembered,
  // the longest unseen first), shuffled; words with a picture (to show) and no two that look the same.
  H.checkPick = function (n = H.CHECK_N) {
    const Wd = W(), seen = new Set();
    const ok = Wd.list(1).filter(id => G.iconDrawn(id)).filter(id => { const b = G.baseForm(id); if (seen.has(b)) return false; seen.add(b); return true; });
    const gap = id => { const g = Wd.gapDays(id); return g == null ? 0 : g; };
    const weak = ok.filter(id => Wd.stage(id) <= 2 || Wd.slipping(id)).sort((a, b) => (Wd.slipping(b) - Wd.slipping(a)) || (Wd.due(b) - Wd.due(a)) || gap(b) - gap(a) || Wd.stage(a) - Wd.stage(b));
    const strong = ok.filter(id => weak.indexOf(id) < 0).sort((a, b) => gap(b) - gap(a) || Wd.stage(b) - Wd.stage(a));
    const half = Math.ceil(n / 2), out = weak.slice(0, half);
    out.push(...strong.slice(0, n - out.length));
    for (const id of weak.slice(half)) if (out.length < n) out.push(id);
    for (let i = out.length - 1; i > 0; i--) { const j = G.r(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  };
  H.checkCur = () => (G.state ? st().chk.cur : null);
  H.checks = () => (G.state ? st().chk.log : []);
  H.checkStart = function (ids) {
    ids = ids || H.checkPick(); if (!ids.length) return null;
    const c = st().chk.cur = { d: today(), at: Date.now(), ids, r: ids.map(() => null), i: 0 };
    save(); return c;
  };
  // the grown-up's answer for the word shown: true (right: a recall), false (a miss), null (skipped: not counted)
  H.checkAnswer = function (ok) {
    const c = H.checkCur(); if (!c || c.i >= c.ids.length) return null;
    const id = c.ids[c.i];
    if (ok === true) W().answerRight(id, { parent: true, mode: 'parent', noStar: true, noGrow: true, review: true });
    else if (ok === false) W().answerWrong(id, { parent: true });
    c.r[c.i] = ok === true ? 1 : ok === false ? 0 : null; c.i++;
    if (c.i >= c.ids.length) H.checkStop();
    save();
    return id;
  };
  // the check ends (all asked, or the grown-up stops it): it goes in the log with what was answered
  H.checkStop = function () {
    const h = st(), c = h.chk.cur; if (!c) return null;
    h.chk.cur = null;
    if (c.r.some(v => v != null)) { h.chk.log.push({ d: c.d, at: c.at, ids: c.ids, r: c.r }); h.chk.log = h.chk.log.slice(-12); }
    save(); return c;
  };
  H.checkScore = c => ({ right: c.r.filter(v => v === 1).length, of: c.r.filter(v => v != null).length });
  H.checkLast = function () {
    const L = H.checks(), c = L[L.length - 1]; if (!c) return null;
    const n = H.numOf(c.d);
    return Object.assign({ d: c.d, ago: n == null ? null : dn() - n, ids: c.ids, r: c.r }, H.checkScore(c));
  };
})();
