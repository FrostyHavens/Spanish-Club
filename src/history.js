// ===== The learning history: what the child practised, day by day, kept in the save (no audio, on the device only) =====
// docs/LEARNING_PLAN_2.md, Phase 1 ("measure and review"). The parent wants to know what she actually RETAINS, so every
// retrieval is recorded with the gap since the word was last met or used: retention = right on the first try when a word
// comes back after a day or more.
//
// Saved in G.state.hist (one key, compact):
//   d: { 'YYYY-M-D' (G.today()): { n (the day's number: words.js dayNum), s (seconds played), met: [ids met that day],
//        w: { id: [gap, events] } } }   the last H.KEEP days; older ones fold into `old` (their totals)
//      gap: whole days between the word's previous encounter (words.js r.ld: met, picked, recalled, said, missed,
//        checked; passive appearances in a line don't count) and its first event that day (-1: unknown); every later event
//        of the day has a gap of 0, so one gap per word and day keeps every event's gap
//      events: one letter per retrieval, in order: P pick, R recall (word-only cards, a page match), S said aloud
//        (capital: right on the first try; p, r, s: right after a miss), K a cued pick (it could be matched), E said right
//        after hearing it (an echo), m a miss, C / c a grown-up's check right / wrong. (Up to H.EVMAX a word a day.)
//   old: { days, s, rn, rr, pr, sp, cy, cn }   the folded days' totals (see stats below)
//   pre: seconds of play before the history began (an older save's G.state.playTime)
//   chk: { cur: {d, at, ids, r: [1 | 0 | null], i} | null, log: [{d, at, ids, r}] }   the grown-ups' word checks
//   wu: { d: the day the dog's warm-up last ran (or was skipped), n: warm-ups done, k: skipped, none: days with too few
//        words, last: {d, ids, right, of} }   (warmup.js)
// Recording (words.js and state.js call these; content never needs to): H.event(id, kind, o), H.met(id), H.step().
//
// API (G.hist, short H): (o.days: the last n calendar days including today; o.all: everything, the folded days too)
//   H.state()                 the saved object          H.day(key?) a day's record (today's by default, made on demand)
//   H.days()                  the kept days' keys, oldest first
//   H.events(o)               [{day, n, word, kind: 'pick'|'recall'|'say'|'miss'|'parent', first, ok, cued, echo, gap}]
//   H.stats(o)                {rn, rr (retention: first events after a day or more, right first try), pr (practice
//                             events, the grown-ups' checks apart), sp (said aloud), cy, cn (checks right / wrong), s}
//   H.retention(o)            {n, right, pct}  (pct null with no data)      H.retentionByDay(n) [{key, n, right, pct}]
//   H.spoken(o)               {said, all, pct}                              H.minutes(key?)  H.totalMinutes()
//   H.daysPlayed()            calendar days with play (from older word records too)
//   H.zoneRows(zone)          a zone's words for the grown-ups (warmup.js / dashboard.js): {id, met, st, box, said,
//                             ago (days since last met or used, or null), slip}
//   H.overview()              the numbers on the grown-ups' Learning page
//   The grown-ups' check: H.checkPick(n), H.checkStart(), H.checkCur(), H.checkAnswer(ok: true | false | null (skip)),
//   H.checkStop(), H.checkLast() -> {d, ago, right, of} | null, H.checks() (the log)
'use strict';
(function () {
  const H = G.hist = {};
  H.KEEP = 60;          // days kept in detail
  H.EVMAX = 60;         // events kept per word per day (a dog trick can be said fifty times...)
  H.IDLE = 180 * 60;    // frames without a touch or a key before play time stops counting (3 min)
  H.CHECK_N = 10;       // words in a grown-ups' check
  H.KIND = { P: 'pick', p: 'pick', K: 'pick', R: 'recall', r: 'recall', S: 'say', s: 'say', E: 'say', m: 'miss', C: 'parent', c: 'parent' };
  const ADULT = ['GrownUps', 'LearningDash', 'MicTest', 'Controls', 'QuestLog']; // grown-ups' screens: not play time
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
      for (const f of ['s', 'rn', 'rr', 'pr', 'sp', 'cy', 'cn']) o[f] = (o[f] | 0) + (s[f] | 0);
      delete h.d[k];
    }
  }

  // ---------- recording ----------
  // a retrieval (words.js answerRight / answerWrong, state.js said). o.said: said aloud (the mic); o.answer: a question's
  // answer (answerRight). The mic's say (G.st.said) comes a moment before the answer it belongs to: the answer then
  // replaces it (first try or not, an echo) instead of counting twice.
  let pend = null;
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
    }
    if (e[1].length < H.EVMAX) e[1] += k;
    pend = o.said && !o.answer ? { id, key: today(), i: e[1].length - 1, f: G.frame } : null;
    if (r) r.ld = d.n;
    save();
    return k;
  };
  // a word met (words.js meet)
  H.met = function (id) { if (!G.state || W().isPhrase(id)) return; const d = H.day(); if (d.met.indexOf(id) < 0) d.met.push(id); }; // (words: a phrase's introduction is G.state.phrases.intro)
  // every frame a game is on (words.js step): today's seconds of play (not while idle, not on the grown-ups' screens)
  let acc = 0, lastIn = 0, lastState = null;
  H.step = function () {
    if (!G.state) return;
    if (lastState !== G.state) { lastState = G.state; lastIn = G.frame; acc = 0; }
    if (G.input.ptr.down || G.input.tap() || Object.keys(G.pressed).length) lastIn = G.frame;
    const top = G.top(), name = top && top.constructor ? top.constructor.name : '';
    if (ADULT.indexOf(name) >= 0 || G.frame - lastIn > H.IDLE) return;
    if ((acc += 1 / 60) >= 1) { acc -= 1; H.day().s++; }
  };

  // ---------- reading ----------
  const CAP = c => c === 'P' || c === 'R' || c === 'S' || c === 'C';
  // one day's numbers: rn / rr retention (each word's first event that day, after a day or more: was it right first
  // try? a cued pick or an echo is no test, and a check before it means it was just seen), pr practice (every event but
  // the grown-ups' checks), sp said aloud, cy / cn checks right / wrong, s seconds played
  function dayStats(d, minGap = 1) {
    const o = { s: d.s | 0, rn: 0, rr: 0, pr: 0, sp: 0, cy: 0, cn: 0 };
    for (const id in d.w) {
      const e = d.w[id]; if (!Array.isArray(e) || typeof e[1] !== 'string') continue;
      const ev = e[1], gap = e[0];
      for (const c of ev) { if (c === 'C') o.cy++; else if (c === 'c') o.cn++; else { o.pr++; if (c === 'S' || c === 's' || c === 'E') o.sp++; } }
      const c0 = ev[0];
      if (c0 && gap >= minGap && c0 !== 'C' && c0 !== 'c' && c0 !== 'K' && c0 !== 'E') { o.rn++; if (CAP(c0)) o.rr++; }
    }
    return o;
  }
  H.dayStats = dayStats;
  // the days o covers: o.days (the last n calendar days, today included), o.key (one day), else every kept day
  function inRange(o = {}) {
    const h = st(), K = keys(h);
    if (o.key) return h.d[o.key] ? [h.d[o.key]] : [];
    if (o.days) { const lo = dn() - o.days + 1; return K.map(k => h.d[k]).filter(d => d.n >= lo); }
    return K.map(k => h.d[k]);
  }
  H.stats = function (o = {}) {
    const t = { s: 0, rn: 0, rr: 0, pr: 0, sp: 0, cy: 0, cn: 0 };
    if (!G.state) return t;
    for (const d of inRange(o)) { const s = dayStats(d, o.minGap || 1); for (const f in t) t[f] += s[f]; }
    if (o.all) { const old = st().old; for (const f in t) t[f] += old[f] | 0; }
    return t;
  };
  const pct = (a, b) => (b > 0 ? Math.round(a * 100 / b) : null);
  H.retention = o => { const s = H.stats(o); return { n: s.rn, right: s.rr, pct: pct(s.rr, s.rn) }; };
  H.spoken = o => { const s = H.stats(o); return { said: s.sp, all: s.pr, pct: pct(s.sp, s.pr) }; };
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
        [...e[1]].forEach((c, i) => out.push({ day: key, n: d.n, word: id, kind: H.KIND[c], first: CAP(c) || c === 'K' || c === 'E', ok: c !== 'm' && c !== 'c', cued: c === 'K' || c === 'E', echo: c === 'E', gap: i ? 0 : e[0] }));
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
  // phrases said aloud (S, s, E events of phrase ids) and built, in all and today
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
        for (const c of e[1]) { if (c === 'S' || c === 's' || c === 'E') { out.said++; if (k === td) out.today++; } else if (c === 'P' || c === 'p') out.built++; }
      }
    }
    return out;
  };

  // ---------- the overview ----------
  H.overview = function () {
    const Wd = W(), r7 = H.retention({ days: 7 }), ra = H.retention({ all: true }), sp = H.spoken({ all: true }), h = st();
    return {
      days: H.daysPlayed(), minutes: H.totalMinutes(), today: H.minutes(),
      met: Wd.count(1), known: Wd.count(2), remembered: Wd.count(3), solid: Wd.count(4), all: Object.keys(D().words).length,
      slipping: Wd.slipList(), r7, ra, spoken: sp, check: H.checkLast(), warmup: Object.assign({}, h.wu),
      phrases: H.phraseStats(),
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
