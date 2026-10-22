// ===== The word model: how strong each word is, when it comes back, and how many new words arrive at once =====
// docs/LEARNING_DESIGN.md. Each word has a stage the child can see and a Leitner box behind it:
//   stage 0 unmet       never introduced: in speech it is only its picture (ui.js), it is never "seen" by appearing
//   stage 1 met         its introduction puzzle (G.intro, learn.js / intro.js): picture + blue word, in the notebook
//   stage 2 known       picked right without a cue: blue word (no picture in speech), 1 star in the notebook
//   stage 3 remembered  gold, 2 stars: a recall-type right answer (word-only cards, a page match, said (not an echo of
//                       what was just heard), a grown-up's check, or a recall from memory below) on a LATER calendar day
//                       than the one it was met on
//   stage 4 solid       3 stars: recalled FROM MEMORY on 2 calendar days later than the one it was met on, at least 2
//                       days apart. From memory (the history's F, V and C, src/history.js): said before any written cue
//                       (say-it-first), picked from picture-only cards (no written word on screen) on a later day than the
//                       last time it was met or used, or a grown-up's check
// (Since the switch, 2026-10 (G.state.wm.v2: the calendar day this code first ran on the save, AUDIT 2.3). Before it,
// gold came from a recall-type answer the same day and solid from 3 uncued first tries over 2+ days; whatever was
// earned then stays: a stage never goes down, and a card never shrinks, cards.js.) Never toward a stage: a cued pick, a
// listen-and-do tap (mode 'listen'), a forced pair (o.forced: the last pair of a page puzzle), and a right answer on
// the calendar day it was missed (after a miss the answer was just shown; it can still become known).
// Boxes 1-8 (0 = not met), in CALENDAR days (W.dayNum(), not the game's day: a night at home in the same sitting moves
// nothing, AUDIT 2.1): box 1 the same session (minutes), 2 the next day, 3 +3 days, 4 +7, 5 +16, 6 +35, 7 +75, 8 +150
// (W.BOX_DAYS). A right uncued first try, when it was due -> up a box (a just-met word's two follow-ups first: fu 1 ->
// due at +1.5 min, fu 2 -> +6 min, then box 2); asked again too soon, nothing moves. A miss -> back to box 2 (from box 4
// or more) or box 1, due again in ~1.5 minutes; on the calendar day of a miss a right answer can't lift it above box 2
// (the quick re-ask helps, but the word climbs again from the next day, AUDIT 2.2).
// Clocks: G.words.now() is play time in seconds (G.state.wm.clock, saved; day.js ticks it while a game is on, the dev
// log's pace adds to it). A session is a page load / continue, a new game, or a new morning (day.js); the game's day
// (W.day(): favours, carry, seek, connect, chapters...; stars are one per word per calendar date) is a new calendar date or a new morning, whichever comes
// first (G.state.wm: {clock, sess, day, date}). The memory has its own session (wm.ms: a load or a new game, not a night
// at home) for "a follow-up not asked is due anyway next time", and its own day: the calendar day number (W.dayNum()).
// G.today() and G.debug.dayShift (whole days added to the real date) let tests and the audit play on later days.
// Saved per word (G.state.words[id]): {st, box, due (play s; and ds, the memory session: due anyway in a later one) |
// dc (the calendar day number it is due; dd, the game day, is still written for an older copy of the game), fu,
// met (play s), ms (session met), md (game day met), mdate (the calendar date it was met), mdn (its day number),
// how, last, n (encounters), right, wrong, said, cue (cued right answers), ret (active retrievals), ft {date: uncued
// first-try rights}, star (date of the last star), s3 (game day it reached stage 3), gold (its "¡Palabra de oro!" was
// shown), learned (= st >= 3, for older readers), ld (the calendar day number it was last met or used: picked, recalled,
// said, missed, checked by a grown-up; passive appearances in a line don't count; older records: estimated from star /
// ft / mdate, W.lastDay), lapse (the calendar day number of its last miss), rd [calendar day numbers it was recalled
// from memory, newest last, up to 4], mc (misses in a row), mw (play times of the last 3 misses), slip ({d: day number,
// n: right first tries since, re: 1 once re-introduced}: a SLIPPING word, docs/LEARNING_PLAN_2.md Phase 1), gk (its
// card's points as shown at the switch: a floor, cards.js), fg (FORGOTTEN: the day number a gold word (stage 3+) was
// missed; cleared when it is relearned: a recall-type right answer on a later calendar day, the gold rule again), rl
// (times relearned), rld (the day number of the last), v (2: upgraded)}. (fg / rl: the grown-ups' page, AUDIT 2.8)
// Upgrading an older save (W.upgrade, on load; W.rec does it per record on demand): G.state.wm.v2 = today (the switch),
// wm.ms = wm.sess, wm.d0 = the first day the save was played (from the history, else the earliest word met); each record:
// old box 1-5 (gaps 0, 1, 2, 4, 8 days) -> box 1, 2, 2, 3, 4 (W.OLD_BOX: the next gap after a right answer is the
// closest to what it was, 1 day shorter at most: 2 -> 3 days for box 3, 4 -> 3 for box 4, 8 -> 16 for box 5), its
// calendar due date kept (dc; a game-day one only, dd: its days to go from today, any record, W.rec), so nothing falls due because
// of the upgrade; mdn from mdate; gk its card as shown. Stages, stars, counts and cards are untouched.
// Slipping: a word missed 3 times (in a row, or 3 misses within W.SLIP.win play seconds) is marked slipping; the next
// review question for it (G.review.ask, the dog's warm-up) is a fresh one-unknown introduction instead (G.intro.again,
// intro.js); it stays slipping until it is answered right on the first try twice. W.slipping(id), W.needsReintro(id).
// The learning history (src/history.js, G.hist) hears every retrieval from here: answerRight / answerWrong / meet (and
// G.st.said for the mic), so every path that goes through the model is recorded.
//
// API (G.words, short W below):
//   W.stage(id) 0..4   W.met(id)   W.rec(id) the record (made and migrated on demand; null for a word not in D.words)
//   W.meet(id, how, o) stage 0 -> 1 (how: 'show' 'find' 'watch' 'listen' 'answer' 'co' 'tap' ...; o.who), schedules the
//                      follow-ups; true if it was new. (G.intro.* call it and add the small celebration.) It never asks
//                      the pacing: content asks G.budget.canIntro first (G.intro.show / watch / listen do it themselves)
//   W.answerRight(id, o) -> {stage, up, star, gold}: an active retrieval. Uncued first tries move the box and the stage;
//                      a star at most once per word per day (first tries only). o:
//                        firstTry (default true), cued (it could be matched or was just shown), review, noStar, noGrow
//                        mode: 'both' (picture + word cards) | 'text' (word-only cards) | 'pic' (picture-only cards) |
//                          'match' (a page puzzle) | 'say' (said, its card not written) | 'parent' | 'listen' (the word
//                          understood in a spoken instruction with no picture: listen-and-do, src/listen.js; receptive,
//                          so it moves the box like a pick, never the stage)
//                        said: said aloud (the mic); echo: said right after hearing it (no recall)
//                        recall: true  the question gave nothing written to read. The two forms other files use:
//                          answerRight(id, { mode: 'say', recall: true, said: true })  say-it-first: said before any
//                            written cue (the history's F, recall from memory)
//                          answerRight(id, { mode: 'pic', recall: true })  picked from picture-only cards, no written
//                            word on screen (the history's V when it is a later calendar day than the word was last
//                            met or used; the same day it is a plain pick, P)
//                        parent: a grown-up's check (mode 'parent': the history's C, recall from memory)
//                        forced: the only answer left (the last pair of a page puzzle): a cued pick, nothing moves
//                        n: how many choices the question had (G.ask): the history keeps it with the word's first
//                          pick of the day, for the grown-ups' guess-adjusted recognition (history.js)
//                      Who passes what (the engine can't see the screen): G.ask (learn.js) passes recall: true with
//                      mode 'pic' when the answer's card is a picture only, no card in the question has a label, the
//                      answer isn't written in the prompt (absent, or masked: a speaker) and it isn't cued (the review's
//                      "hear it, pick the picture", the warm-up's picture cards); say-it-first passes {mode: 'say',
//                      recall: true, said: true}; the grown-ups' check passes parent (history.js); a page puzzle's last
//                      pair passes forced; listen-and-do passes mode 'listen'. (pet.js: a care card said to the dog has
//                      no word on it: it could pass recall: true too.) Without recall: true a picture-only pick is a P
//                        how: 'answer' (G.ask: a question whose answer is a word not met yet meets it with the right
//                          pick; in the open world on a day with no room for new words it doesn't: G.budget.defer)
//   W.answerWrong(id, {parent, n})  a miss: back to box 2 or 1, due again soon (3 misses: slipping; a gold word: forgotten)
//   W.lastDay(id) the day number it was last met or used (or null)   W.gapDays(id) days since then (or null)
//   W.slipping(id)  W.needsReintro(id) (slipping, not re-introduced yet)  W.reintroduced(id) (G.intro.again calls it)
//   W.encounter(id, how) a passive meeting of a met word (heard, named, in the bag...): only `last` and `n`
//   W.backlogged(id) due by calendar day or left from an earlier sitting (G.budget.backlog counts these; answering one
//                      so that it leaves is a due review done: history.js H.reviewed)
//   W.due(id)  W.overdue(id) (how late, for sorting)  W.lateness(id) (days late / its gap)  W.gap(id) its gap in days
//   W.strength(id) 0..1  W.stars(id) 0..3 (the notebook's)  W.recallDays(id) the calendar days it was recalled from memory
//   W.isOld(id) met in an earlier session or 5+ minutes ago (a prompt for it is a review)
//   W.list(minStage) ids at that stage or more   W.count(minStage)
//   W.newSession(reason) ('load', 'new', 'night')   W.step() every frame (the clock, a new calendar date)
//   W.upgrade() an older save's records onto the new ladder (state.js on load; idempotent)   W.switchDay() wm.v2
// G.review: due(n, {topic, filter, exclude, minStage, maxStage}) the words due now: just-met follow-ups first, then
//   missed ones (due again in minutes), then the rest, the most overdue for its gap first (days late / the box's gap;
//   when that ties, the longer gap first: AUDIT 2.4); next(o) the first of them; count(o); ask(id, o) a question for that
//   word fit for its stage (yieldable; see intro.js).
// G.budget (review-first pacing, AUDIT 2.9; new items are words and phrases): canIntro(n, {id, story}) may n new items be
//   introduced now? Always in a chapter's beat (the story is the spine, paced by its morning gates: G.budget.story(); its
//   words count toward the day). Elsewhere (the open world: a zone's people, Lola's animals, tap-to-ask, the album,
//   phrases) only while the backlog (words due by calendar day; not the follow-ups and misses of this session) is 5 or
//   fewer, up to today's soft target (B.target(): about 2.5 a play day in year 1, 1.8 in year 2, 1.5 from year 3, by days
//   since the save began; the fraction carries to the next play day), beyond it only while the backlog is 0, and never
//   past 8 new items in a calendar day (the story's count too). why(n) the reason it's no ('cap' | 'backlog' | 'target')
//   or null; backlog(); today() items met today; target(); defer(id, src) a word seen but not introduced waits in a small
//   queue (saved, B.PACE.qmax, newest kept) to be introduced first when pacing allows (the dog's warm-up, G.intro.queued;
//   or the next time she sees it); queue(); unqueue(id) (W.meet). open(): no pacing (B.OPEN, G.debug.openPacing,
//   window.__openPacing: tools/harness.js open(..., {openPacing: true})). The older counts stay for the audit and tests:
//   recent(sec) words met in the last sec play-seconds (300), session() words met this session, pending() words waiting
//   for their follow-ups, left(o).
// Saved: G.state.wm = {clock, sess, day, date, sessAt, ms (memory session), v2 (switch day), d0 (first day played),
//   pace: {d (day number), t (today's target), fr (the fraction carried), q: [ids waiting]}}.
'use strict';
(function () {
  const D = () => G.data;
  const W = G.words = {};
  W.STAGES = ['unmet', 'met', 'known', 'remembered', 'solid'];
  W.FOLLOW = [90, 360];               // just met: asked again after 1.5 min, then 6 min (play seconds)
  W.MISS = 90;                        // a miss: due again after 1.5 min
  W.BOX_DAYS = [0, 0, 1, 3, 7, 16, 35, 75, 150]; // box -> calendar days until due (box 1: the same session)
  W.MAXBOX = W.BOX_DAYS.length - 1;
  W.OLD_BOX = [0, 1, 2, 2, 3, 4];     // an older record's box (1-5: gaps 0, 1, 2, 4, 8 days) -> its box on this ladder
  W.SLIP = { n: 3, win: 600, rights: 2 }; // 3 misses (in a row, or within 10 min of play) -> slipping, until 2 right first tries
  W.V = 2;                            // the record's version (r.v)

  // ---------- calendar ----------
  G.debug = G.debug || {};
  G.now = () => Date.now() + (G.debug.dayShift || 0) * 864e5;
  G.today = () => { const d = new Date(G.now()); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const dayNum = () => { const d = new Date(G.now()); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
  W.dayNum = dayNum;

  // ---------- session, day and clock (G.state.wm) ----------
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const wm = () => {
    const s = G.state; if (!s) return { clock: 0, sess: 0, day: 0, date: '' };
    if (!isObj(s.wm)) s.wm = { clock: 0, sess: 0, day: 0, date: '' };
    return s.wm;
  };
  W.wm = wm;
  W.now = () => wm().clock;
  W.sess = () => wm().sess;
  W.day = () => wm().day;
  W.msess = () => { const m = wm(); if (m.ms == null) m.ms = m.sess | 0; return m.ms; }; // (the memory's session: not a night at home)
  W.newSession = function (reason) {
    const m = wm();
    W.upgrade();
    m.sess = (m.sess | 0) + 1;
    if (reason !== 'night') m.ms = W.msess() + 1; // (a night at home in the same sitting is the game's new day, not the memory's)
    if (reason === 'night' || !m.day || m.date !== G.today()) m.day = (m.day | 0) + 1;
    m.date = G.today(); m.sessAt = m.clock;
    if (G.vocabLog) G.vlog.ev({ ty: 'session', sess: m.sess, day: m.day, date: m.date, why: reason || '' });
  };
  let dateT = 0;
  W.step = function () { // day.js, every frame a game is on
    if (!G.state) return;
    const m = wm(); m.clock += 1 / 60;
    if (++dateT >= 600) { dateT = 0; if (m.date && m.date !== G.today()) { m.day++; m.date = G.today(); } } // played past midnight
    if (G.hist) G.hist.step(); // the learning history: today's minutes of play (src/history.js)
  };
  W.addTime = sec => { if (G.state && sec > 0) wm().clock += sec; };

  // ---------- records ----------
  // an old record (before stages: {learned, right, wrong, said}; present = seen) becomes: learned -> stage 2, or 3 when
  // it was answered right twice or said; seen -> met. Either way it's due now.
  function migrate(r) {
    const st = r.learned ? ((r.right | 0) >= 2 || (r.said | 0) >= 1 ? 3 : 2) : 1;
    Object.assign(r, { st, box: st >= 3 ? 2 : 1, due: null, dd: wm().day, dc: dayNum(), fu: 0, met: 0, ms: 0, md: 0, how: 'old', last: 0, n: 1,
      right: r.right | 0, wrong: r.wrong | 0, said: r.said | 0, cue: 0, ret: (r.right | 0) + (r.said | 0), ft: {}, star: '', s3: st >= 3 ? 0 : null, gold: st >= 3, learned: st >= 3, mdn: null, v: W.V });
    return r;
  }
  W.migrate = migrate;
  // ---------- the switch (AUDIT 2.1-2.3): an older save's records onto the new ladder ----------
  // wm.v2: the calendar day this code first ran on the save; wm.d0: the first day it was played (the pacing's year)
  function firstDay() {
    let best = dayNum();
    const see = n => { if (Number.isFinite(n) && n < best) best = n; };
    const h = G.state.hist; if (isObj(h) && isObj(h.d)) for (const k in h.d) see(isObj(h.d[k]) ? h.d[k].n : null);
    for (const ws of [G.state.words, isObj(G.state.phrases) && G.state.phrases.r]) if (isObj(ws)) for (const id in ws) { const r = ws[id]; if (isObj(r)) see(W.numOf(r.mdate)); }
    return best;
  }
  function upState() {
    if (!G.state) return;
    const m = wm();
    if (m.v2 == null) { m.v2 = dayNum(); W.msess(); }
    if (m.d0 == null) m.d0 = firstDay();
  }
  W.switchDay = () => (G.state ? (upState(), wm().v2) : null);
  // one record: its box onto the new ladder, its calendar due date kept, the day it was met, its card as shown now
  function up(r) {
    upState();
    if (r.st >= 1) {
      const b = r.box | 0;
      r.box = b <= 0 ? 1 : W.OLD_BOX[Math.min(5, b)];
      if (r.mdn == null) r.mdn = W.numOf(r.mdate);
      if (G.cards && G.cards.shownAt) { const k = G.cards.shownAt(r.st, r.gp); if (k > 0) r.gk = k; }
    }
    r.v = W.V;
    return r;
  }
  // every record of the save (state.js on load, W.newSession): idempotent
  W.upgrade = function () {
    if (!G.state) return;
    upState();
    for (const id in G.state.words) W.rec(id);
    const p = G.state.phrases; if (isObj(p) && isObj(p.r)) for (const id in p.r) W.rec(id);
  };
  // Phrases (docs/LEARNING_PLAN_2.md, Phase 2; content/es/words.js C.phrases, src/phrases.js) are learnable items too:
  // the same record, stages, boxes, history and cards, kept apart in G.state.phrases.r so that every list of WORDS
  // (W.list, the review engine, the warm-up's words, the notebook's pages, the save slots' counts) stays words only.
  W.isPhrase = id => !!(D().phrases && D().phrases[id]);
  W.item = id => D().words[id] || (D().phrases && D().phrases[id]) || null; // a word or a phrase
  const recsOf = id => {
    if (!W.isPhrase(id)) return G.state.words;
    const s = G.state; if (!isObj(s.phrases)) s.phrases = {};
    if (!isObj(s.phrases.r)) s.phrases.r = {};
    return s.phrases.r;
  };
  W.rec = function (id, make) {
    if (!G.state || !W.item(id)) return null;
    const ws = recsOf(id); let r = ws[id];
    if (r && (!isObj(r) || r.st == null)) r = ws[id] = migrate(isObj(r) ? r : {});
    if (r && r.v !== W.V) up(r);
    if (r && r.st >= 1 && r.due == null && r.dc == null && r.dd != null) r.dc = dayNum() + ((r.dd | 0) - wm().day); // (a game-day due date only: its days to go, as calendar days)
    if (!r && make) { upState(); r = ws[id] = { st: 0, box: 0, due: null, dd: null, dc: null, fu: 0, met: null, ms: 0, md: 0, how: null, last: null, n: 0, right: 0, wrong: 0, said: 0, cue: 0, ret: 0, ft: {}, star: '', s3: null, gold: false, learned: false, v: W.V }; }
    return r || null;
  };
  const save = () => { if (G.st && G.st.autosave) G.st.autosave(); };
  let ver = 0; // (bumped by every change to a schedule or a stage: G.budget's memo)
  const log = (ty, id, o) => { if (G.vocabLog) G.vlog(ty, id, o); };
  W.stage = id => { const r = W.rec(id); return r ? r.st | 0 : 0; };
  W.met = id => W.stage(id) >= 1;
  W.list = (min = 1) => Object.keys(D().words).filter(id => W.stage(id) >= min);
  W.count = (min = 1) => W.list(min).length;
  W.stars = id => Math.max(0, Math.min(3, W.stage(id) - 1));
  function setStage(r, id, st) {
    if (st <= r.st) return false;
    ver++;
    r.st = st; r.learned = st >= 3;
    if (st === 3 && r.s3 == null) r.s3 = wm().day;
    log('stage', id, { st });
    return true;
  }
  // when it's due next: in play seconds (sec) or in calendar days (box 2+). (dd, the game day, is written too, so an
  // older copy of the game reading this save still finds a due date)
  function schedule(r, sec, days) {
    ver++;
    if (sec != null) { r.due = W.now() + sec; r.ds = W.msess(); r.dd = null; r.dc = null; } // (and due anyway next memory session)
    else { r.due = null; r.ds = null; r.dc = dayNum() + days; r.dd = wm().day + days; }
  }

  W.meet = function (id, how, o = {}) {
    const r = W.rec(id, true); if (!r) return false;
    r.last = W.now(); r.n++;
    if (r.st >= 1) return false;
    r.st = 1; r.box = 1; r.fu = 1; r.met = W.now(); r.ms = wm().sess; r.md = wm().day; r.mdate = G.today(); r.mdn = dayNum(); r.how = how || 'meet';
    r.ld = dayNum();
    schedule(r, W.FOLLOW[0]);
    log('meet', id, { how: r.how, who: o.who || null });
    if (G.hist) G.hist.met(id); // (the learning history: words met today)
    if (G.budget) G.budget.unqueue(id);
    save();
    return true;
  };

  // ---------- the last day a word was met or used (the history's gaps), and slipping words ----------
  // 'YYYY-M-D' (G.today()) -> the day number (dayNum), or null
  W.numOf = s => { const p = String(s || '').split('-').map(Number); return p.length === 3 && p.every(v => Number.isFinite(v) && v > 0) ? Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5) : null; };
  W.lastDay = function (id) {
    const r = W.rec(id); if (!r || r.st < 1) return null;
    if (Number.isFinite(r.ld)) return r.ld;
    let best = null; // (an older record: its last star, its first-try days, the day it was met)
    const see = s => { const n = W.numOf(s); if (n != null && (best == null || n > best)) best = n; };
    see(r.star); if (isObj(r.ft)) Object.keys(r.ft).forEach(see); see(r.mdate);
    return best;
  };
  W.gapDays = id => { const l = W.lastDay(id); return l == null ? null : Math.max(0, dayNum() - l); };
  W.slipping = id => { const r = W.rec(id); return !!(r && r.st >= 1 && isObj(r.slip)); };
  W.needsReintro = id => { const r = W.rec(id); return !!(r && r.st >= 1 && isObj(r.slip) && !r.slip.re); };
  W.reintroduced = id => { const r = W.rec(id); if (!r || !isObj(r.slip)) return; r.slip.re = 1; r.mc = 0; r.mw = []; save(); };
  W.slipList = () => W.list(1).filter(W.slipping);
  // a miss: three in a row, or three within W.SLIP.win play seconds, and the word is slipping (a fresh episode if it was
  // already re-introduced and is missed again)
  function missed(r) {
    r.mc = (r.mc | 0) + 1;
    const mw = (Array.isArray(r.mw) ? r.mw : []).concat([Math.round(W.now())]).slice(-W.SLIP.n); r.mw = mw;
    if (r.mc < W.SLIP.n && !(mw.length >= W.SLIP.n && mw[mw.length - 1] - mw[0] <= W.SLIP.win)) return;
    if (!isObj(r.slip)) r.slip = { d: dayNum(), n: 0, re: 0 };
    else if (r.slip.re) { r.slip.re = 0; r.slip.n = 0; }
    r.mc = 0; r.mw = [];
  }
  W.encounter = function (id, how) {
    const r = W.rec(id); if (!r || r.st < 1) return false;
    r.last = W.now(); r.n++;
    return true;
  };

  // ---------- recall from memory, and the stages' rules (since the switch) ----------
  // the history's letter for a recall from memory, or null: F said before any written cue, V picked from picture-only
  // cards on a later calendar day than the last time it was met or used, C a grown-up's check
  function memOf(o, mode, first, cued, ld0, dn) {
    if (o.parent || mode === 'parent') return 'C';
    if (!first || cued || o.echo || !o.recall) return null;
    if (o.said) return 'F';
    if (mode === 'pic' && ld0 != null && ld0 < dn) return 'V';
    return null;
  }
  W.recallDays = id => { const r = W.rec(id); return r && Array.isArray(r.rd) ? r.rd.slice() : []; };
  // solid: recalled from memory on 2 calendar days (both later than the one it was met on), at least 2 days apart
  const solidReady = r => Array.isArray(r.rd) && r.rd.length >= 2 && r.rd[r.rd.length - 1] - r.rd[0] >= 2;

  // an active retrieval: o (see the API above)
  W.answerRight = function (id, o = {}) {
    const none = { stage: 0, up: false, star: false, gold: false };
    const r = W.rec(id, true); if (!r) return none;
    const st0 = r.st, bl0 = backlogged(id, r);
    // (pacing: a question whose answer isn't met yet meets it by the right pick; in the open world on a day with no room
    // for a new word it doesn't: no card, and the word waits in the queue, G.budget.defer)
    if (st0 < 1 && o.how === 'answer' && G.budget && !G.budget.canIntro(1, { id })) { G.budget.defer(id, 'answer'); return Object.assign(none, { deferred: true }); }
    const first = o.firstTry !== false, mode = o.mode || 'both', day = G.today(), dn = dayNum();
    const cued = !!o.cued || !!o.forced || st0 < 1; // (meeting a word by answering is its puzzle, not a retrieval; a forced pair is no choice)
    const ld0 = st0 >= 1 ? W.lastDay(id) : null; // (the last time it was met or used, before this answer)
    const pts0 = G.cards && st0 >= 1 ? G.cards.pts(id) : 0; // (its card before the stage moves: a new stage's floor would hide the growth)
    const mem = st0 >= 1 ? memOf(o, mode, first, cued, ld0, dn) : null;
    // the history's event (src/history.js): P/p pick, R/r recall (word-only cards, a page match), S/s said, E said right
    // after hearing it (an echo), K a cued pick (a forced pair too), C a grown-up's check, L/l a spoken instruction
    // understood (listen-and-do, src/listen.js: the word heard in a sentence, no picture), F recalled from memory and
    // said, V recalled from memory from pictures alone (capitals: right on the first try)
    const hk = st0 < 1 ? null : mem || (o.said ? (cued || o.echo ? 'E' : first ? 'S' : 's') : cued ? 'K' : mode === 'listen' ? (first ? 'L' : 'l') : mode === 'text' || mode === 'match' ? (first ? 'R' : 'r') : first ? 'P' : 'p');
    if (hk && G.hist) G.hist.event(id, hk, { answer: true, said: !!o.said, n: o.n });
    if (st0 < 1) W.meet(id, o.how || 'answer');
    r.last = W.now(); r.ru = r.last; r.n++; r.ret++; // (ru: the last retrieval, chapters.js nudge)
    r.ld = dn;
    if (first) { r.right++; r.mc = 0; } // (a miss was counted by answerWrong)
    if (cued) r.cue++;
    if (first && !cued && !o.echo && isObj(r.slip) && st0 >= 1 && ++r.slip.n >= W.SLIP.rights) r.slip = null; // (slipping: right twice, it's back)
    let star = false;
    if (first && !o.noStar && r.star !== day) { r.star = day; star = true; G.state.stars = (G.state.stars | 0) + 1; }
    if (first && !cued) {
      r.ft[day] = (r.ft[day] | 0) + 1;
      const keys = Object.keys(r.ft); if (keys.length > 12) delete r.ft[keys[0]]; // (only the recent days matter)
      // the stage (since the switch, see the top): 1 -> 2 by any uncued answer; 2 -> 3 by a recall-type answer on a later
      // calendar day than the day it was met; 3 -> 4 once recalled from memory on 2 such days, 2+ days apart. Never by
      // a listen-and-do tap; never past known on the day it was missed (the answer was just shown)
      const later = r.mdn == null || dn > r.mdn, lapsed = r.lapse === dn;
      const recallType = !!mem || (!o.echo && (mode === 'text' || mode === 'match' || mode === 'say' || mode === 'parent' || (o.said && mode !== 'both'))); // (an echo just repeats what was heard)
      if (mem && later && !lapsed) { const rd = Array.isArray(r.rd) ? r.rd : (r.rd = []); if (rd[rd.length - 1] !== dn) { rd.push(dn); if (rd.length > 4) rd.shift(); } }
      if (r.fg != null && recallType && dn > r.fg && mode !== 'listen') { r.fg = null; r.rl = (r.rl | 0) + 1; r.rld = dn; } // (a forgotten gold word, gold again: relearned)
      if (mode !== 'listen') {
        if (r.st === 1) setStage(r, id, 2);
        else if (r.st === 2 && recallType && later && !lapsed) setStage(r, id, 3);
        if (r.st === 3 && solidReady(r)) setStage(r, id, 4);
      }
      // the box, only when it was due (asked again too soon, it stays where it is): a just-met word's follow-ups
      // first, then up a box (on the day of a miss, box 2 at most: it climbs again from the next day)
      const ready = r.due != null ? W.now() >= r.due - 30 || W.due(id) : W.due(id);
      if (!ready) { /* massed: no change */ }
      else if (r.fu === 1) { r.fu = 2; schedule(r, W.FOLLOW[1]); }
      else if (r.fu === 2) { r.fu = 0; r.box = 2; schedule(r, null, W.BOX_DAYS[2]); }
      else { r.box = Math.min(lapsed ? 2 : W.MAXBOX, Math.max(1, r.box) + 1); schedule(r, null, W.BOX_DAYS[r.box]); }
    }
    log('retrieval', id, { said: !!o.said || null, cued: cued || null, mode, first: first || null, st0, st: r.st, review: o.review || null, star: star || null, mem: mem || null });
    if (bl0 && !backlogged(id, r) && G.hist) G.hist.reviewed(id); // (a due review done: the grown-ups' page, history.js)
    // its card grows (cards.js): a pick, a page match (saying it grows it through G.st.said, mic.js)
    if (G.cards && !o.said && !o.noGrow && st0 >= 1) G.cards.grow(id, mode === 'match' ? 'match' : mode === 'listen' ? 'listen' : 'pick', first ? { from: pts0 } : { add: 1, from: pts0 });
    save();
    return { stage: r.st, up: r.st > st0, star, gold: r.st >= 3 && st0 < 3 };
  };
  W.answerWrong = function (id, o = {}) {
    const r = W.rec(id, true); if (!r) return;
    if (r.st < 1) return; // an unmet word can't be missed (it's still a puzzle)
    const bl0 = backlogged(id, r);
    if (G.hist) G.hist.event(id, o.parent ? 'c' : 'm', { n: o.n }); // (the history, src/history.js: before the last day moves)
    if (r.st >= 3 && r.fg == null) r.fg = dayNum(); // (a gold word missed: forgotten, until it's relearned)
    r.wrong++; r.last = W.now(); r.ld = dayNum(); r.lapse = dayNum();
    r.box = (r.box | 0) >= 4 ? 2 : 1; if (r.fu === 2) r.fu = 1; // (forgotten: back to the bottom of the ladder, not one box down)
    schedule(r, W.MISS);
    missed(r);
    if (bl0 && G.hist) G.hist.reviewed(id); // (it was due and it's been reviewed: missed, back in minutes)
    save();
  };

  // ---------- due ----------
  W.due = function (id) {
    const r = W.rec(id); if (!r || r.st < 1) return false;
    if (r.due != null) return W.now() >= r.due || (r.ds != null && W.msess() > r.ds);
    if (r.dc != null) return dayNum() >= r.dc;
    return true;
  };
  // how late it is (bigger = later), to sort the due words: seconds for the minutes' timers, days * 1e5 for the rest
  W.overdue = function (id) {
    const r = W.rec(id); if (!r) return 0;
    if (r.due != null) return W.now() - r.due;
    if (r.dc != null) return (dayNum() - r.dc) * 1e5;
    return 1e6;
  };
  W.gap = id => { const r = W.rec(id); return r ? W.BOX_DAYS[Math.max(1, Math.min(W.MAXBOX, r.box | 0))] : 0; };
  // days late for its gap (0: due today; 1: a whole gap late), for the review's order (AUDIT 2.4)
  W.lateness = function (id) {
    const r = W.rec(id); if (!r || r.due != null) return 0;
    if (r.dc == null) return 1;
    return Math.max(0, dayNum() - r.dc) / Math.max(1, W.gap(id));
  };
  W.strength = id => { const r = W.rec(id); return !r || r.st < 1 ? 0 : Math.min(1, (r.st - 1) / 3 * 0.7 + (Math.max(1, r.box) - 1) / (W.MAXBOX - 1) * 0.3); };
  // in the backlog: due by calendar day, or a follow-up / miss left from an earlier sitting (not this session's minutes)
  const backlogged = (id, r) => !!r && r.st >= 1 && !W.isPhrase(id) && W.due(id) && !(r.due != null && r.ds === W.msess());
  W.backlogged = id => backlogged(id, W.rec(id));
  W.isOld = id => { const r = W.rec(id); return !!r && r.st >= 1 && (r.ms < wm().sess || W.now() - (r.met || 0) >= 300); };
  W.starToday = id => { const r = W.rec(id); return !!r && r.star === G.today(); };

  // ---------- the review engine ----------
  const R = G.review = {};
  const asList = v => (v == null ? null : Array.isArray(v) ? v : [v]);
  R.due = function (n = 1, o = {}) {
    const topics = asList(o.topic), ex = asList(o.exclude) || [];
    const ids = Object.keys(D().words).filter(id => {
      const st = W.stage(id);
      if (st < Math.max(1, o.minStage || 1) || (o.maxStage != null && st > o.maxStage) || ex.includes(id) || !W.due(id)) return false;
      if (topics && !topics.includes(D().words[id].topic)) return false;
      return !o.filter || o.filter(id);
    });
    // just-met follow-ups, then misses (due again in minutes), then the rest: the most overdue for its gap first (a word
    // a whole gap late before one due today), then the longer gap (closest to long-term memory), then the latest
    const grp = id => { const r = W.rec(id); return r.fu ? 0 : r.due != null ? 1 : 2; };
    const late = {}, gp = {}; ids.forEach(id => { late[id] = W.lateness(id); gp[id] = W.gap(id); });
    ids.sort((a, b) => {
      const ga = grp(a), gb = grp(b); if (ga !== gb) return ga - gb;
      const ra = W.rec(a), rb = W.rec(b);
      if (ga === 2) { if (late[a] !== late[b]) return late[b] - late[a]; if (gp[a] !== gp[b]) return gp[b] - gp[a]; }
      return W.overdue(b) - W.overdue(a) || (ra.last || 0) - (rb.last || 0);
    });
    return ids.slice(0, n);
  };
  R.next = o => R.due(1, o)[0] || null;
  R.count = o => R.due(1e9, o).length;

  // ---------- the new-word budget: review-first pacing (AUDIT 2.9) ----------
  const B = G.budget = {};
  B.LIMITS = { win: 300, per5: 5, session: 6, hard: 8 }; // (the older counts: the audit, the grown-ups)
  B.PACE = { backlog: 5, cap: 8, rate: [2.5, 1.8, 1.5], qmax: 6 }; // backlog: new things only at or under it; cap: new items a calendar day; rate: the soft target a play day, years 1, 2, 3+
  B.OPEN = false; // true: no pacing (the open world of 2026-10-17); tests: open(..., { openPacing: true })
  B.open = () => B.OPEN || !!(G.debug && G.debug.openPacing) || (typeof window !== 'undefined' && !!window.__openPacing);
  B.story = () => !!(G.chapters && G.chapters.running && G.chapters.running()); // (a chapter's beat: the story)
  const allRecs = () => { if (!G.state) return []; const p = G.state.phrases, out = []; for (const ws of [G.state.words, isObj(p) && p.r]) if (isObj(ws)) for (const id in ws) { const r = W.rec(id); if (r) out.push(r); } return out; };
  const metList = () => Object.keys(G.state ? G.state.words : {}).map(W.rec).filter(r => r && r.st >= 1 && r.how !== 'old');
  B.recent = (sec = B.LIMITS.win) => metList().filter(r => r.met != null && W.now() - r.met < sec).length;
  B.session = () => metList().filter(r => r.ms === wm().sess).length;
  B.pending = () => metList().filter(r => r.fu > 0).length;
  B.left = (o = {}) => Math.max(0, Math.min(B.LIMITS.per5 - B.recent(), (o.hard ? B.LIMITS.hard : B.LIMITS.session) - B.session()));
  // (worked out once a frame at most, the bubbles ask every frame; any change through this file starts again: ver.
  // Changing a record by hand (tests): G.budget.flush())
  let memo = {};
  const fresh = () => { const k = G.frame + '|' + ver + '|' + dayNum() + '|' + W.msess() + '|' + wm().clock + '|' + G.today(); if (memo.k !== k || memo.s !== G.state) memo = { k, s: G.state, bl: null, td: null }; return memo; };
  B.flush = () => { memo = {}; };
  // the backlog: words due by calendar day (and follow-ups or misses left from an earlier session), not this session's
  B.backlog = function () {
    if (!G.state) return 0;
    const m = fresh(); if (m.bl != null) return m.bl;
    let n = 0;
    for (const id in G.state.words) if (backlogged(id, W.rec(id))) n++;
    return (m.bl = n);
  };
  // new items (words and phrases) met today, by calendar date: the story's too
  B.today = function () {
    if (!G.state) return 0;
    const m = fresh(); if (m.td != null) return m.td;
    const t = G.today(); return (m.td = allRecs().filter(r => r.st >= 1 && r.how !== 'old' && r.mdate === t).length);
  };
  // today's soft target: the rate of the save's year, a whole number a play day (the fraction carries to the next)
  B.rate = () => { const d = dayNum() - (wm().d0 != null ? wm().d0 : dayNum()), R = B.PACE.rate; return d < 365 ? R[0] : d < 730 ? R[1] : R[2]; };
  function pace() {
    upState();
    const m = wm(); if (!isObj(m.pace)) m.pace = { d: null, t: 0, fr: 0, q: [] };
    const p = m.pace; if (!Array.isArray(p.q)) p.q = [];
    const dn = dayNum();
    if (p.d !== dn) { p.fr = (+p.fr || 0) + B.rate(); p.t = Math.floor(p.fr + 1e-9); p.fr = Math.round((p.fr - p.t) * 1000) / 1000; p.d = dn; }
    return p;
  }
  B.target = () => (G.state ? pace().t : 0);
  B.why = function (n = 1) {
    if (!G.state) return null;
    const t = B.today();
    if (t + n > B.PACE.cap) return 'cap';
    const bl = B.backlog();
    if (bl > B.PACE.backlog) return 'backlog';
    if (t + n > B.target() && bl > 0) return 'target';
    return null;
  };
  B.canIntro = (n = 1, o = {}) => B.open() || !!o.story || B.story() || !B.why(n);
  // the queue: words seen in the open world but not introduced (no room that day), newest kept
  B.queue = () => (G.state ? pace().q.filter(id => D().words[id] && !W.met(id)) : []);
  B.defer = function (id, src) {
    if (!G.state || !D().words[id] || W.met(id)) return false;
    const p = pace(); p.q = p.q.filter(k => k !== id); p.q.push(id);
    while (p.q.length > B.PACE.qmax) p.q.shift();
    log('defer', id, { src: src || null, why: B.why() });
    save();
    return true;
  };
  B.unqueue = id => { if (!G.state) return; const m = wm(); if (isObj(m.pace) && Array.isArray(m.pace.q) && m.pace.q.indexOf(id) >= 0) m.pace.q = m.pace.q.filter(k => k !== id); };
})();
