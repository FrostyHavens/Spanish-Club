// ===== The word model: how strong each word is, when it comes back, and how many new words arrive at once =====
// docs/LEARNING_DESIGN.md. Each word has a stage the child can see and a Leitner box behind it:
//   stage 0 unmet       never introduced: in speech it is only its picture (ui.js), it is never "seen" by appearing
//   stage 1 met         its introduction puzzle (G.intro, learn.js / intro.js): picture + blue word, in the notebook
//   stage 2 known       picked right without a cue: blue word (no picture in speech), 1 star in the notebook
//   stage 3 remembered  recalled from a picture or sound with word-only cards, matched on a page puzzle, or said: gold, 2 stars
//   stage 4 solid       remembered again on a later day (3 uncued first-try answers over 2+ days, after reaching 3): 3 stars
// Box 1-5 (0 = not met): right uncued first try -> up a box, due later: box 1 the same session (minutes), 2 the next day,
// 3 +2 days, 4 +4, 5 +8 days; a miss -> down a box (not below 1), due again in ~1.5 minutes. A just-met word gets two
// follow-ups first (fu 1 -> due at +1.5 min, fu 2 -> +6 min), and the review engine asks those before anything else.
// Clocks: G.words.now() is play time in seconds (G.state.wm.clock, saved; day.js ticks it while a game is on, the dev
// log's pace adds to it). A session is a page load / continue, a new game, or a new morning (day.js); a day is a new
// calendar date or a new morning, whichever comes first (G.state.wm: {clock, sess, day, date}). G.today() and
// G.debug.dayShift (whole days added to the real date) let tests and the audit play on later days.
// Saved per word (G.state.words[id]): {st, box, due (play s; and ds, the session: due anyway in a later one) | dd (day) +
// dc (calendar day number), fu, met (play s),
// ms (session met), md (day met), how, last, n (encounters), right, wrong, said, cue (cued right answers), ret (active
// retrievals), ft {date: uncued first-try rights}, star (date of the last star), s3 (day it reached stage 3), gold
// (its "¡Palabra de oro!" was shown), learned (= st >= 3, for older readers)}.
//
// API (G.words, short W below):
//   W.stage(id) 0..4   W.met(id)   W.rec(id) the record (made and migrated on demand; null for a word not in D.words)
//   W.meet(id, how, o) stage 0 -> 1 (how: 'show' 'find' 'watch' 'listen' 'answer' 'co' 'tap' ...; o.who), schedules the
//                      follow-ups; true if it was new. (G.intro.* call it and add the small celebration.)
//   W.answerRight(id, {cued, said, firstTry = true, mode: 'both'|'text'|'pic'|'match'|'say', review}) -> {stage, up,
//                      star, gold}: an active retrieval. Uncued first tries move the box and the stage; a star at most
//                      once per word per day (first tries only)
//   W.answerWrong(id)  a miss: down a box, due again soon
//   W.encounter(id, how) a passive meeting of a met word (heard, named, in the bag...): only `last` and `n`
//   W.due(id)  W.overdue(id) (how late, for sorting)  W.strength(id) 0..1  W.stars(id) 0..3 (the notebook's)
//   W.isOld(id) met in an earlier session or 5+ minutes ago (a prompt for it is a review)
//   W.list(minStage) ids at that stage or more   W.count(minStage)
//   W.newSession(reason) ('load', 'new', 'night')   W.step() every frame (the clock, a new calendar date)
// G.review: due(n, {topic, filter, exclude, minStage, maxStage}) the words due now, just-met follow-ups first, then
//   missed ones, then by box and lateness; next(o) the first of them; ask(id, o) a question for that word fit for its
//   stage (yieldable; see intro.js). G.budget: recent(sec) words met in the last sec play-seconds (300), session() words
//   met this session, pending() words waiting for their follow-ups, canIntro(n, {hard}) (<= 5 per 5 min, <= 6 per
//   session, 8 with hard), left(o).
'use strict';
(function () {
  const D = () => G.data;
  const W = G.words = {};
  W.STAGES = ['unmet', 'met', 'known', 'remembered', 'solid'];
  W.FOLLOW = [90, 360];               // just met: asked again after 1.5 min, then 6 min (play seconds)
  W.MISS = 90;                        // a miss: due again after 1.5 min
  W.BOX_DAYS = [0, 0, 1, 2, 4, 8];    // box -> days until due (box 1: the same session)

  // ---------- calendar ----------
  G.debug = G.debug || {};
  G.now = () => Date.now() + (G.debug.dayShift || 0) * 864e5;
  G.today = () => { const d = new Date(G.now()); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const dayNum = () => { const d = new Date(G.now()); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
  W.dayNum = dayNum;

  // ---------- session, day and clock (G.state.wm) ----------
  const wm = () => {
    const s = G.state; if (!s) return { clock: 0, sess: 0, day: 0, date: '' };
    if (!s.wm || typeof s.wm !== 'object') s.wm = { clock: 0, sess: 0, day: 0, date: '' };
    return s.wm;
  };
  W.wm = wm;
  W.now = () => wm().clock;
  W.sess = () => wm().sess;
  W.day = () => wm().day;
  W.newSession = function (reason) {
    const m = wm();
    m.sess = (m.sess | 0) + 1;
    if (reason === 'night' || !m.day || m.date !== G.today()) m.day = (m.day | 0) + 1;
    m.date = G.today(); m.sessAt = m.clock;
    if (G.vocabLog) G.vlog.ev({ ty: 'session', sess: m.sess, day: m.day, date: m.date, why: reason || '' });
  };
  let dateT = 0;
  W.step = function () { // day.js, every frame a game is on
    if (!G.state) return;
    const m = wm(); m.clock += 1 / 60;
    if (++dateT >= 600) { dateT = 0; if (m.date && m.date !== G.today()) { m.day++; m.date = G.today(); } } // played past midnight
  };
  W.addTime = sec => { if (G.state && sec > 0) wm().clock += sec; };

  // ---------- records ----------
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  // an old record (before stages: {learned, right, wrong, said}; present = seen) becomes: learned -> stage 2, or 3 when
  // it was answered right twice or said; seen -> met. Either way it's due now.
  function migrate(r) {
    const st = r.learned ? ((r.right | 0) >= 2 || (r.said | 0) >= 1 ? 3 : 2) : 1;
    Object.assign(r, { st, box: st >= 3 ? 2 : 1, due: null, dd: wm().day, dc: null, fu: 0, met: 0, ms: 0, md: 0, how: 'old', last: 0, n: 1,
      right: r.right | 0, wrong: r.wrong | 0, said: r.said | 0, cue: 0, ret: (r.right | 0) + (r.said | 0), ft: {}, star: '', s3: st >= 3 ? 0 : null, gold: st >= 3, learned: st >= 3 });
    return r;
  }
  W.migrate = migrate;
  W.rec = function (id, make) {
    if (!G.state || !D().words[id]) return null;
    const ws = G.state.words; let r = ws[id];
    if (r && (!isObj(r) || r.st == null)) r = ws[id] = migrate(isObj(r) ? r : {});
    if (!r && make) r = ws[id] = { st: 0, box: 0, due: null, dd: null, dc: null, fu: 0, met: null, ms: 0, md: 0, how: null, last: null, n: 0, right: 0, wrong: 0, said: 0, cue: 0, ret: 0, ft: {}, star: '', s3: null, gold: false, learned: false };
    return r || null;
  };
  const save = () => { if (G.st && G.st.autosave) G.st.autosave(); };
  const log = (ty, id, o) => { if (G.vocabLog) G.vlog(ty, id, o); };
  W.stage = id => { const r = W.rec(id); return r ? r.st | 0 : 0; };
  W.met = id => W.stage(id) >= 1;
  W.list = (min = 1) => Object.keys(D().words).filter(id => W.stage(id) >= min);
  W.count = (min = 1) => W.list(min).length;
  W.stars = id => Math.max(0, Math.min(3, W.stage(id) - 1));
  function setStage(r, id, st) {
    if (st <= r.st) return false;
    r.st = st; r.learned = st >= 3;
    if (st === 3 && r.s3 == null) r.s3 = wm().day;
    log('stage', id, { st });
    return true;
  }
  // when it's due next: in play seconds (sec) or in days (box 2+)
  function schedule(r, sec, days) {
    if (sec != null) { r.due = W.now() + sec; r.ds = wm().sess; r.dd = null; r.dc = null; } // (and due anyway next session)
    else { r.due = null; r.dd = wm().day + days; r.dc = dayNum() + days; }
  }

  W.meet = function (id, how, o = {}) {
    const r = W.rec(id, true); if (!r) return false;
    r.last = W.now(); r.n++;
    if (r.st >= 1) return false;
    r.st = 1; r.box = 1; r.fu = 1; r.met = W.now(); r.ms = wm().sess; r.md = wm().day; r.how = how || 'meet';
    schedule(r, W.FOLLOW[0]);
    log('meet', id, { how: r.how, who: o.who || null });
    save();
    return true;
  };
  W.encounter = function (id, how) {
    const r = W.rec(id); if (!r || r.st < 1) return false;
    r.last = W.now(); r.n++;
    return true;
  };

  // an active retrieval: o {cued, said, firstTry (default true), mode, review}
  W.answerRight = function (id, o = {}) {
    const r = W.rec(id, true); if (!r) return { stage: 0, up: false, star: false, gold: false };
    const first = o.firstTry !== false, mode = o.mode || 'both', day = G.today(), st0 = r.st, cued = !!o.cued || st0 < 1; // (meeting a word by answering is its puzzle, not a retrieval)
    if (st0 < 1) W.meet(id, o.how || 'answer');
    r.last = W.now(); r.n++; r.ret++;
    if (first) r.right++; // (a miss was counted by answerWrong)
    if (cued) r.cue++;
    let star = false;
    if (first && !o.noStar && r.star !== day) { r.star = day; star = true; G.state.stars = (G.state.stars | 0) + 1; }
    if (first && !cued) {
      r.ft[day] = (r.ft[day] | 0) + 1;
      const keys = Object.keys(r.ft); if (keys.length > 12) delete r.ft[keys[0]]; // (only the recent days matter)
      // the stage: 1 -> 2 by any uncued answer; 2 -> 3 by recall (word-only cards, a page match, saying it outside
      // picture+word cards); 3 -> 4 on a later day once 3 uncued first tries over 2+ days have come since
      const recall = mode === 'text' || mode === 'match' || mode === 'say' || (o.said && mode !== 'both');
      if (r.st === 1) setStage(r, id, 2);
      else if (r.st === 2 && recall) setStage(r, id, 3);
      else if (r.st === 3 && r.s3 != null && wm().day > r.s3) {
        const days = Object.keys(r.ft).filter(k => r.ft[k] > 0), n = days.reduce((a, k) => a + r.ft[k], 0);
        if (n >= 3 && days.length >= 2) setStage(r, id, 4);
      }
      // the box, only when it was due (asked again too soon, it stays where it is): a just-met word's follow-ups
      // first, then up a box
      const ready = r.due != null ? W.now() >= r.due - 30 || W.due(id) : W.due(id);
      if (!ready) { /* massed: no change */ }
      else if (r.fu === 1) { r.fu = 2; schedule(r, W.FOLLOW[1]); }
      else if (r.fu === 2) { r.fu = 0; r.box = 2; schedule(r, null, W.BOX_DAYS[2]); }
      else { r.box = Math.min(5, Math.max(1, r.box) + 1); schedule(r, null, W.BOX_DAYS[r.box]); }
    }
    log('retrieval', id, { said: !!o.said || null, cued: cued || null, mode, first: first || null, st0, st: r.st, review: o.review || null, star: star || null });
    save();
    return { stage: r.st, up: r.st > st0, star, gold: r.st >= 3 && st0 < 3 };
  };
  W.answerWrong = function (id) {
    const r = W.rec(id, true); if (!r) return;
    if (r.st < 1) return; // an unmet word can't be missed (it's still a puzzle)
    r.wrong++; r.last = W.now();
    r.box = Math.max(1, (r.box | 0) - 1); if (r.fu === 2) r.fu = 1;
    schedule(r, W.MISS);
    save();
  };

  // ---------- due ----------
  W.due = function (id) {
    const r = W.rec(id); if (!r || r.st < 1) return false;
    if (r.due != null) return W.now() >= r.due || (r.ds != null && wm().sess > r.ds);
    if (r.dd != null) return wm().day >= r.dd || (r.dc != null && dayNum() >= r.dc);
    return true;
  };
  // how late it is (bigger = later), to sort the due words: seconds for box 1, days * 1e5 for the rest
  W.overdue = function (id) {
    const r = W.rec(id); if (!r) return 0;
    if (r.due != null) return W.now() - r.due;
    if (r.dd != null) return Math.max(wm().day - r.dd, r.dc != null ? dayNum() - r.dc : 0) * 1e5;
    return 1e6;
  };
  W.strength = id => { const r = W.rec(id); return !r || r.st < 1 ? 0 : Math.min(1, (r.st - 1) / 3 * 0.7 + (Math.max(1, r.box) - 1) / 4 * 0.3); };
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
    const grp = id => { const r = W.rec(id); return r.fu ? 0 : r.due != null ? 1 : 2; };
    ids.sort((a, b) => {
      const ga = grp(a), gb = grp(b); if (ga !== gb) return ga - gb;
      const ra = W.rec(a), rb = W.rec(b);
      if (ga === 2 && ra.box !== rb.box) return ra.box - rb.box;
      return W.overdue(b) - W.overdue(a) || (ra.last || 0) - (rb.last || 0);
    });
    return ids.slice(0, n);
  };
  R.next = o => R.due(1, o)[0] || null;
  R.count = o => R.due(1e9, o).length;

  // ---------- the new-word budget ----------
  const B = G.budget = {};
  B.LIMITS = { win: 300, per5: 5, session: 6, hard: 8 };
  const metList = () => Object.keys(G.state ? G.state.words : {}).map(W.rec).filter(r => r && r.st >= 1 && r.how !== 'old');
  B.recent = (sec = B.LIMITS.win) => metList().filter(r => r.met != null && W.now() - r.met < sec).length;
  B.session = () => metList().filter(r => r.ms === wm().sess).length;
  B.pending = () => metList().filter(r => r.fu > 0).length;
  B.left = (o = {}) => Math.max(0, Math.min(B.LIMITS.per5 - B.recent(), (o.hard ? B.LIMITS.hard : B.LIMITS.session) - B.session()));
  B.canIntro = (n = 1, o = {}) => B.left(o) >= n;
})();
