#!/usr/bin/env node
// Club de Español: how much new language can a child absorb at 15 minutes a day for 3 years, given THIS game's
// review model, and how much content does that imply?
//
// Plain Node, no browser, no dependencies:   node sim.js            (full run, prints a markdown report)
//                                            node sim.js --quick    (fewer seeds / grid points)
//                                            node sim.js --calib    (one item's trajectory, to check the memory model)
//                                            node sim.js --checks   (the cases quoted in docs/ROADMAP_3_YEARS.md, ~3 s)
// --json <file> also writes every number to that file (nothing is written otherwise).
// Copied from the October 2026 audit (docs/AUDIT_2026-10.md, docs/ROADMAP_3_YEARS.md; its full output is in
// docs/audit-2026-10/sim-output.txt). After about 3 months of real play, re-fit BASE.mem to the Learning page's numbers
// and re-run.
//
// What is modelled (the game's own rules, from src/words.js, src/warmup.js, src/history.js):
//   * Items: words, phrases ("Quiero ___") and grammar patterns, all on the same record (stages, Leitner boxes).
//   * Introduction: a one-unknown puzzle (G.intro.*) + two same-session follow-ups (W.FOLLOW 90 s / 360 s), then box 2,
//     due the next day.
//   * The game's ladder W.BOX_DAYS = [0, 0, 1, 2, 4, 8]: box 2 +1 day, 3 +2, 4 +4, 5 +8 (cap: a box-5 word comes back
//     every 8 days FOREVER). Due = calendar day reached (the dc clock; with one session a day it is the binding one).
//   * A right uncued first try moves the box only when the item is due; asked again too soon nothing moves (massed).
//   * A miss: down a box, asked again ~90 s later (W.MISS); a right re-ask moves it up a box again, so in the game a
//     miss + right re-ask RESTORES the old box and interval. 3 misses within 10 min of play -> slipping -> the next ask
//     is a fresh introduction (G.intro.again).
//   * Stages (what the dashboard counts): 1 met, 2 known (any uncued right), 3 remembered (a recall-mode right: word-only
//     cards, a page match, said), 4 solid (on a later day than stage 3, 3 uncued first-try rights over 2+ days; the
//     follow-ups count, so "solid" can be reached on day 2).
//   * Retention as the Learning page computes it: the first event of an item on a day it comes back after 1+ days,
//     right on the first try (guesses on 3-card questions included).
//   * Review channels in the game as built: the dog's warm-up (3-4), greetings (one due word of the friend's pool),
//     favours / listen-and-do (<= 2 a day), Luna's palabra, the seek hider, ... -> at most ~P.dueCap due items a session
//     are chosen BY the review engine; the rest of the practice is zone quests / chapters asking their own words
//     (G.zones.meetW asks a met word whether it is due or not).
//
// The memory model (not the game's; an assumption, FSRS-style, see ASSUMPTIONS below):
//   R(t) = 1 / (1 + t / (9 S))   (power-law forgetting; S = days until recall drops to 90%)   [--curve exp: 0.9^(t/S)]
//   success from memory at recall R:  S <- S * (1 + a * S^-b * (e^(c (1 - R)) - 1))   (spaced = big gain, massed = ~0)
//   a lucky guess (3 cards: 1/3): S <- S * 1.05 (the box still moves: the game cannot tell)
//   a miss: S <- max(S0, 0.4 S) (lapse), the answer is shown; re-ask right w.p. 0.85
//   per-item difficulty: lognormal (sd 0.35) on S0 and on a.
'use strict';
const fs = require('fs');
const path = require('path');

// ======================================================================================================================
// Parameters
// ======================================================================================================================
const TYPES = [ // cost multipliers (retrieval, introduction) and S0 multiplier per item type
  { k: 'word', tR: 1.0, tI: 1.0, s0: 1.0 },
  { k: 'phrase', tR: 1.4, tI: 1.5, s0: 0.8 },
  { k: 'pattern', tR: 1.5, tI: 2.0, s0: 0.6 },
];
const LADDERS = {
  game: [0, 0, 1, 2, 4, 8],                       // src/words.js W.BOX_DAYS (box 1: same session)
  long: [0, 0, 1, 2, 4, 8, 16, 32, 64, 128],      // proposed: four more boxes
  s21: [0, 0, 1, 3, 7, 16, 35, 75, 150],         // the ladder in docs/AUDIT_2026-10.md item 2.1 (used by --checks)
};
// review engines
//   game      the game as built: 8-day cap, a miss + right re-ask restores the box, at most dueCap engine-chosen reviews a
//             session, the rest of the practice is quests asking random words of the zones visited today
//   steered   same intervals and miss rule, but every practice moment can be steered to a due item (more channels:
//             quests ask the zone's DUE words first, a longer warm-up, letters, ...)
//   ladder    the game's channels (capped) with the long ladder only
//   proposed  long ladder + honest lapses (a miss drops 2 boxes and the 90-s re-ask does not promote; due next day)
//             + steering + most-overdue-relative-to-interval first
const SCHED = {
  game: { ladder: 'game', lapse: 'restore', capped: true, steer: false, order: 'box', honest: false },
  steered: { ladder: 'game', lapse: 'restore', capped: false, steer: true, order: 'box', honest: false },
  ladder: { ladder: 'long', lapse: 'restore', capped: true, steer: false, order: 'box', honest: false },
  proposed: { ladder: 'long', lapse: 'drop2', capped: false, steer: true, order: 'late', honest: true },
  p21: { ladder: 's21', lapse: 'drop2', capped: false, steer: true, order: 'late', honest: true }, // proposed, audit 2.1 gaps
};
const CALENDARS = {
  ideal: { label: 'every day, no breaks', wd: 1, we: 1 },
  steady: { label: 'weekdays 95%, weekends 75%, a 2-week summer trip, 1 week off at Christmas', wd: 0.95, we: 0.75, summer: { from: [7, 15], to: [7, 31], p: 0 }, winter: { from: [12, 24], to: [12, 31], p: 0 } },
  realistic: { label: 'weekdays 90%, weekends 60%, 6-week summer (15%), 2-week winter (30%), a 3-7 day gap every ~60 days', wd: 0.9, we: 0.6, summer: { from: [7, 1], to: [8, 11], p: 0.15 }, winter: { from: [12, 20], to: [1, 3], p: 0.3 }, gapEvery: 60, gapLen: [3, 7] },
  patchy: { label: 'weekdays 75%, weekends 45%, 9-week summer (5%), 2-week winter (20%), a 4-12 day gap every ~35 days, a March lull (15%)', wd: 0.75, we: 0.45, summer: { from: [6, 15], to: [8, 15], p: 0.05 }, winter: { from: [12, 18], to: [1, 4], p: 0.2 }, gapEvery: 35, gapLen: [4, 12], lull: { from: [3, 1], to: [3, 28], p: 0.15 } },
};
const BASE = {
  calendar: 'realistic',
  sessionSec: 900,        // 15 minutes
  practice: 0.55,         // share of the session that is practice (questions, requests, intros); the rest walking, story, album...
  n: 3,                   // new items per play day (target)
  sched: 'proposed',
  policy: 'review-first', // 'review-first': new items wait while > backlogTol items are still due; 'content-first': the open world (no gate)
  backlogTol: 5,
  tRet: 10,               // s per retrieval incl. feedback (question, warm-up card, listen request)
  tIntro: 45,             // s per introduction puzzle (show-and-name / find-it / watch-and-do), follow-ups extra
  fuMiss: 0.1,            // a follow-up missed (one more question)
  reaskP: 0.85,           // the 90-s re-ask after a miss is right
  dueCap: 15,             // game as built: due items the review channels reach per session
  zoneSize: 20,           // items per zone (content asks pick the zone's items)
  pNewZone: 0.5,          // share of quest asks in the newest zone (else a revisited older zone)
  spoken: 0.35,           // share of answers said (no guessing); the rest tapped on 3 cards
  guess: 1 / 3,
  pRecall: 0.6,           // a known item's question is recall (word-only cards, held-up picture) rather than recognition
  mem: { curve: 'power', S0: 0.25, a: 3.0, b: 0.15, c: 2.5, lapse: 0.4, guessGain: 1.05, reaskGain: 1.1, diffSd: 0.35 },
  mix: [[0.85, 0.12, 0.03], [0.75, 0.18, 0.07], [0.65, 0.23, 0.12]], // word / phrase / pattern share of new items, years 1-3
};

// ======================================================================================================================
// RNG, calendar
// ======================================================================================================================
function rngOf(seed) {
  let a = seed >>> 0;
  const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.normal = () => { let u = 0; while (u === 0) u = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * f()); };
  f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
  return f;
}
const START = Date.UTC(2026, 10, 2); // Monday 2 Nov 2026
const MONTH_END = [-1];
for (let m = 1; m <= 36; m++) MONTH_END[m] = Math.round((Date.UTC(2026, 10 + m, 2) - START) / 864e5) - 1;
const DAYS = MONTH_END[36] + 1;
const dayOfDate = (y, mo, d) => Math.round((Date.UTC(y, mo - 1, d) - START) / 864e5);
const dateOf = d => new Date(START + d * 864e5);
const mdOf = dt => (dt.getUTCMonth() + 1) * 100 + dt.getUTCDate();
function inWin(dt, w) {
  if (!w) return false;
  const x = mdOf(dt), a = w.from[0] * 100 + w.from[1], b = w.to[0] * 100 + w.to[1];
  return a <= b ? x >= a && x <= b : x >= a || x <= b;
}
const calCache = new Map();
function calendar(name, seed) {
  const key = name + ':' + seed; if (calCache.has(key)) return calCache.get(key);
  const C = CALENDARS[name], rng = rngOf(seed * 104729 + 7), play = new Array(DAYS).fill(false);
  let gap = 0;
  for (let d = 0; d < DAYS; d++) {
    const dt = dateOf(d), wd = dt.getUTCDay();
    let p = wd === 0 || wd === 6 ? C.we : C.wd;
    if (inWin(dt, C.summer)) p = C.summer.p; else if (inWin(dt, C.winter)) p = C.winter.p;
    if (C.lull && inWin(dt, C.lull)) p = Math.min(p, C.lull.p);
    if (gap > 0) { gap--; p = 0; } else if (C.gapEvery && rng() < 1 / C.gapEvery) { gap = rng.int(C.gapLen[0], C.gapLen[1]) - 1; p = 0; }
    play[d] = rng() < p;
  }
  calCache.set(key, play);
  return play;
}
const monthOf = d => { for (let m = 1; m <= 36; m++) if (d <= MONTH_END[m]) return m; return 36; };
const MONTH_OF = Array.from({ length: DAYS }, (_, d) => monthOf(d));

// ======================================================================================================================
// One run: 3 years of sessions
// ======================================================================================================================
function merge(a, b) { // deep-ish merge for P overrides
  const o = Object.assign({}, a);
  for (const k of Object.keys(b || {})) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? Object.assign({}, a[k], b[k]) : b[k];
  return o;
}
function run(P, seed, opt = {}) {
  const rng = rngOf(seed * 7919 + 13), play = calendar(P.calendar, seed);
  const SC = SCHED[P.sched], L = LADDERS[SC.ladder], MAXBOX = L.length - 1, M = P.mem;
  const Rof = M.curve === 'exp' ? (t, S) => Math.pow(0.9, t / S) : (t, S) => 1 / (1 + t / (9 * S));
  const items = [], buckets = Array.from({ length: DAYS + 400 }, () => []);
  let pool = [], scanned = -1, quota = 0;
  const mon = Array.from({ length: 37 }, () => ({ play: 0, intros: 0, target: 0, dueStart: 0, dueServed: 0, revSec: 0, introSec: 0, otherSec: 0, backlog: 0, rn: 0, rr: 0, rR: 0, retr: 0, miss: 0, reintro: 0, snap: null }));
  const daily = opt.daily ? { play, dueStart: new Int32Array(DAYS), backlog: new Int32Array(DAYS), rn: new Int32Array(DAYS), rr: new Int32Array(DAYS), revSec: new Float32Array(DAYS) } : null;
  const extraSnaps = {}, dIntro = new Int16Array(DAYS), dTarget = new Int16Array(DAYS);
  let today = 0, cur = null; // cur: this month's accumulator

  const schedule = (it, day) => { it.due = day; buckets[Math.min(day, buckets.length - 1)].push(it); };
  const recall = it => Rof(Math.max(0.01, today - it.last), it.S);
  function stageRight(it, recallMode) {
    const f = it.ft;
    if (f.length && f[f.length - 1][0] === today) f[f.length - 1][1]++; else { f.push([today, 1]); if (f.length > 12) f.shift(); }
    if (it.st === 1) it.st = 2;
    else if (it.st === 2 && recallMode) { it.st = 3; it.s3 = today; }
    else if (it.st === 3 && today > it.s3) { let n = 0; for (const x of f) n += x[1]; if (n >= 3 && f.length >= 2) it.st = 4; }
  }
  function firstEvent(it, right, R) { // the Learning page's retention: first event of a day it comes back after 1+ days
    if (it.ev === today) return;
    if (today - it.ev >= 1) { cur.rn++; if (right) cur.rr++; cur.rR += R; if (daily) { daily.rn[today]++; if (right) daily.rr[today]++; } }
    it.ev = today;
  }
  function introduce() {
    const yr = Math.min(2, Math.floor(today / 365.25)), mix = P.mix[yr], u = rng();
    const type = u < mix[0] ? 0 : u < mix[0] + mix[1] ? 1 : 2, T = TYPES[type];
    const diff = Math.exp(rng.normal() * M.diffSd);
    const it = { type, zone: Math.floor(items.length / P.zoneSize), tR: P.tRet * T.tR, s0: M.S0 * T.s0 * diff, a: M.a * Math.sqrt(diff), S: 0, box: 2, due: 0, st: 1, s3: -1, ft: [], last: today, ev: today, slip: false, inPool: false, asked: -1 };
    it.S = it.s0;
    items.push(it);
    let cost = P.tIntro * T.tI;
    // the two follow-ups (Canelo's "?", the errand's next question): recognition, then recall-able
    for (let k = 0; k < 2; k++) {
      cost += it.tR;
      if (rng() < P.fuMiss) { cost += it.tR; continue; }
      stageRight(it, k === 1 && (rng() < P.spoken || rng() < P.pRecall));
    }
    schedule(it, today + L[2]);
    cur.intros++;
    return cost;
  }
  // one question about an item (any channel). Returns its cost in seconds.
  function retrieve(it) {
    it.asked = today;
    cur.retr++;
    if (it.slip) { // slipping: a fresh one-unknown introduction instead (G.intro.again)
      it.slip = false; it.S = Math.max(it.S, it.s0 * 1.5); it.last = today; it.ev = today;
      it.box = Math.max(1, Math.min(it.box, 2)); schedule(it, today + 1); cur.reintro++;
      return P.tIntro * TYPES[it.type].tI;
    }
    let cost = it.tR;
    const R = recall(it), spoken = rng() < P.spoken, recallMode = spoken || (it.st >= 2 && rng() < P.pRecall);
    const mem = rng() < R, right = mem || (!spoken && rng() < P.guess), due = it.due <= today;
    firstEvent(it, right, R);
    if (right) {
      it.S *= mem ? 1 + it.a * Math.pow(it.S, -M.b) * (Math.exp(M.c * (1 - R)) - 1) : M.guessGain;
      stageRight(it, recallMode);
      if (due) { it.box = Math.min(MAXBOX, Math.max(1, it.box) + 1); schedule(it, today + L[it.box]); }
    } else {
      cur.miss++;
      it.S = Math.max(it.s0, it.S * M.lapse);
      let box = Math.max(1, it.box - (SC.lapse === 'drop2' ? 2 : 1)), ok = false;
      for (let k = 0; k < 2 && !ok; k++) { // asked again ~90 s later (W.MISS), up to twice
        cost += it.tR;
        ok = rng() < P.reaskP;
        if (ok) { it.S *= M.reaskGain; if (!SC.honest) stageRight(it, rng() < P.spoken || rng() < P.pRecall); } else box = Math.max(1, box - 1);
      }
      if (SC.lapse === 'restore' && ok) { box = Math.min(MAXBOX, box + 1); it.box = box; schedule(it, today + Math.max(1, L[box])); }
      else { it.box = box; if (!ok) it.slip = true; schedule(it, today + 1); }
    }
    it.last = today;
    return cost;
  }
  function refreshPool() {
    for (let d = scanned + 1; d <= today; d++) for (const it of buckets[d]) if (it.due === d && !it.inPool) { it.inPool = true; pool.push(it); }
    scanned = today;
    pool = pool.filter(it => { if (it.due <= today) return true; it.inPool = false; return false; });
    if (SC.order === 'box') pool.sort((x, y) => (x.box - y.box) || (x.due - y.due) || (x.last - y.last));
    else pool.sort((x, y) => ((today - x.due + 1) / Math.max(1, L[x.box])) - ((today - y.due + 1) / Math.max(1, L[y.box])) || (x.box - y.box)); // least overdue for its interval first: under a backlog, save what is still there
  }
  const avgIntroCost = () => P.tIntro * 1.15 + 2.2 * P.tRet * 1.08;
  function session() {
    cur.play++;
    let budget = P.sessionSec * P.practice;
    refreshPool();
    const dueStart = pool.length; cur.dueStart += dueStart; if (daily) daily.dueStart[today] = dueStart;
    quota += P.n; let nToday = Math.floor(quota); quota -= nToday;
    if (P.maxItems != null) nToday = Math.max(0, Math.min(nToday, P.maxItems - items.length)); // the content runs out
    cur.target += nToday; dTarget[today] = nToday;
    const met0 = items.length;
    let introSec = 0, revSec = 0, otherSec = 0, served = 0;
    const iCost = avgIntroCost();
    let introduced = 0;
    const doIntros = (upto = nToday) => { while (introduced < upto && budget >= 0.5 * iCost) { const c = introduce(); budget -= c; introSec += c; introduced++; } };
    let pi = 0; // pointer into the sorted pool
    const reviewPhase = (cap, keep) => { // engine-chosen due items, most needed first
      while (pi < pool.length && served < cap && budget > keep) {
        const it = pool[pi++]; if (it.due > today || it.asked === today) continue;
        const c = retrieve(it); budget -= c; revSec += c; served++;
      }
    };
    const stillDue = () => { let n = 0; for (let k = pi; k < pool.length; k++) if (pool[k].due <= today && pool[k].asked !== today) n++; return n; };
    // quests, chapters, favours, page puzzles... ask the words of the zones visited today (steered engines: the zone's
    // DUE words first, then any due word; the game as built: whichever of the zone's words the quest is about)
    const N0 = () => items.length;
    let zN = -1, zR = -1, qz = null, qi = 0;
    const contentPhase = keep => {
      const N = N0(); if (!N) return;
      if (zN < 0) { zN = Math.floor((N - 1) / P.zoneSize); zR = zN > 0 ? Math.floor(rng() * zN) : zN; }
      const zoneItem = () => { const z = rng() < P.pNewZone ? Math.floor((N0() - 1) / P.zoneSize) : zR, lo = z * P.zoneSize, hi = Math.min(N0(), lo + P.zoneSize); return items[lo + Math.floor(rng() * (hi - lo))]; };
      if (SC.steer && !qz) {
        qz = []; const rest = [];
        for (let k = pi; k < pool.length; k++) { const it = pool[k]; if (it.due > today) continue; (it.zone === zN || it.zone === zR ? qz : rest).push(it); }
        qz = qz.concat(rest);
      }
      let guard = 0;
      while (budget > keep && guard++ < 2000) {
        let it = null;
        while (qz && qi < qz.length && !it) { const c = qz[qi++]; if (c.due <= today && c.asked !== today) it = c; }
        if (!it) { for (let k = 0; k < 4; k++) { it = zoneItem(); if (it.asked !== today) break; } }
        const wasDue = it.due <= today, c = retrieve(it); budget -= c;
        if (wasDue) { revSec += c; served++; } else otherSec += c;
      }
    };
    const cap = SC.capped ? P.dueCap : Infinity;
    if (P.policy === 'content-first') { // the open world: new things whenever the content has them
      doIntros(); reviewPhase(cap, 0); contentPhase(0);
    } else if (!SC.capped) { // review-first: every due item first, new items only once the queue is (nearly) empty
      if (P.newFloor) doIntros(Math.min(nToday, P.newFloor)); // (a novelty floor: something new every day, even after a break)
      reviewPhase(cap, 0);
      if (stillDue() <= P.backlogTol) doIntros();
      contentPhase(0);
    } else { // review-first with the game's channels: the engine's 15, then the quests (keeping time for today's new items)
      if (P.newFloor) doIntros(Math.min(nToday, P.newFloor));
      reviewPhase(cap, 0);
      const reserve = Math.min(budget, (nToday - introduced) * iCost);
      contentPhase(reserve);
      let left = 0; for (const it of pool) if (it.due <= today && it.asked !== today) left++;
      if (left <= P.backlogTol) doIntros();
      contentPhase(0);
    }
    let left = 0; for (const it of pool) if (it.due <= today) left++;
    dIntro[today] = items.length - met0;
    cur.dueServed += served; cur.revSec += revSec; cur.introSec += introSec; cur.otherSec += otherSec; cur.backlog += left;
    if (daily) { daily.backlog[today] = left; daily.revSec[today] = revSec; }
  }
  function snapshot() {
    let met = 0, k2 = 0, k3 = 0, k4 = 0, sumR = 0, durable = 0, strong4 = 0, gold = 0;
    for (const it of items) {
      met++; if (it.st >= 2) k2++; if (it.st >= 3) k3++; if (it.st >= 4) k4++;
      const t = Math.max(0.01, today - it.last), R = Rof(t, it.S);
      sumR += R;
      if (Rof(t + 30, it.S) >= 0.8) durable++;
      if (it.st >= 4 && R >= 0.8) strong4++;
      if (R >= 0.8) gold++;
    }
    return { met, k2, k3, k4, sumR, durable, strong4, r80: gold };
  }
  for (today = 0; today < DAYS; today++) {
    cur = mon[MONTH_OF[today]];
    if (play[today]) session();
    if (today === MONTH_END[MONTH_OF[today]]) cur.snap = snapshot();
    if (opt.snapAt && opt.snapAt.includes(today)) extraSnaps[today] = snapshot();
  }
  // normal days: a play day with 3+ play days in the 7 before it (not the first days back from a break)
  const normal = new Uint8Array(DAYS);
  for (let d = 0; d < DAYS; d++) { if (!play[d]) continue; let c = 0; for (let x = Math.max(0, d - 7); x < d; x++) if (play[x]) c++; normal[d] = d < 7 || c >= 3 ? 1 : 0; }
  return { mon, daily, extraSnaps, dIntro, dTarget, normal, play, items: opt.keepItems ? items : null };
}

// ======================================================================================================================
// Aggregation over seeds
// ======================================================================================================================
function summarize(res, P) {
  const m = res.mon;
  let play = 0, intros = 0, target = 0, rn = 0, rr = 0, rnL = 0, rrL = 0;
  for (let k = 1; k <= 36; k++) { play += m[k].play; intros += m[k].intros; target += m[k].target; rn += m[k].rn; rr += m[k].rr; if (k >= 25) { rnL += m[k].rn; rrL += m[k].rr; } }
  let sat = null;
  for (let k = 2; k <= 36; k++) if (m[k].play >= 5 && m[k].intros < 0.8 * m[k].target) { sat = k; break; }
  const yr = [0, 1, 2].map(y => { let i = 0, t = 0; for (let k = y * 12 + 1; k <= y * 12 + 12; k++) { i += m[k].intros; t += m[k].target; } return t ? i / t : 1; });
  // intake achieved on normal days (not the first days back from a break), per year
  const yrN = [0, 1, 2].map(y => { let i = 0, t = 0; for (let d = MONTH_END[y * 12] + 1 || 0; d <= MONTH_END[y * 12 + 12]; d++) if (res.normal[d]) { i += res.dIntro[d]; t += res.dTarget[d]; } return t ? i / t : 1; });
  const at = k => m[k].snap;
  return { play, intros, target, yr, yrN, intakeRatio: target ? intros / target : 1, ret: rn ? rr / rn : null, retLate: rnL ? rrL / rnL : null, sat, snaps: [6, 12, 24, 36].map(at), mon: m };
}
function avg(list, f) { const v = list.map(f).filter(x => x != null && !Number.isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
function runSeeds(P, seeds, opt) { return seeds.map(s => summarize(run(P, s, opt), P)); }
function agg(rs) {
  const o = {
    play: avg(rs, r => r.play), intros: avg(rs, r => r.intros), target: avg(rs, r => r.target), intakeRatio: avg(rs, r => r.intakeRatio),
    yr: [0, 1, 2].map(i => avg(rs, r => r.yr[i])), yrN: [0, 1, 2].map(i => avg(rs, r => r.yrN[i])),
    ret: avg(rs, r => r.ret), retLate: avg(rs, r => r.retLate), sat: rs.some(r => r.sat) ? avg(rs, r => r.sat || 37) : null,
    snaps: [0, 1, 2, 3].map(i => { const s = {}; for (const k of Object.keys(rs[0].snaps[i])) s[k] = avg(rs, r => r.snaps[i][k]); return s; }),
    mon: [],
  };
  for (let k = 1; k <= 36; k++) {
    const row = {};
    for (const key of ['play', 'intros', 'target', 'dueStart', 'dueServed', 'revSec', 'introSec', 'otherSec', 'backlog', 'rn', 'rr', 'rR', 'retr', 'miss', 'reintro']) row[key] = avg(rs, r => r.mon[k][key]);
    row.snap = {}; for (const key of Object.keys(rs[0].mon[k].snap)) row.snap[key] = avg(rs, r => r.mon[k].snap[key]);
    o.mon[k] = row;
  }
  return o;
}

// ======================================================================================================================
// Experiments
// ======================================================================================================================
const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const SEEDS = QUICK ? [1, 2] : [1, 2, 3, 4];
const GRID = QUICK ? [0.5, 1, 1.5, 2, 2.5, 3, 4, 6] : [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5, 4, 5, 6];
// What "sustainable" means (two lenses):
//   content-first (the open world as built: new items arrive whatever the backlog): after 3 years, 80%+ of everything
//     met is still recallable (sum of R / met) and first-try retention in months 25-36 is 75%+
//   review-first (a gate: new items only once the due queue is (nearly) empty): in year 3, on normal play days (not the
//     first days back from a break), 85%+ of the target still gets introduced, and retention in months 25-36 is 75%+
const CRIT = {
  'content-first': a => a.snaps[3].sumR / Math.max(1, a.snaps[3].met) >= 0.80 && (a.retLate == null || a.retLate >= 0.75),
  'review-first': a => a.yrN[2] >= 0.85 && (a.retLate == null || a.retLate >= 0.75),
};
const t0 = Date.now();
const f0 = (x, d = 0) => (x == null || Number.isNaN(x) ? '-' : Number(x).toFixed(d));
const pct = x => (x == null || Number.isNaN(x) ? '-' : Math.round(x * 100) + '%');
const log = (...a) => console.log(...a);
const el = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';

function calibration() { // one average word through the two ladders, reviewed exactly when due, never missed
  const M = BASE.mem, Rof = (t, S) => 1 / (1 + t / (9 * S)), out = [];
  for (const lad of ['game', 'long']) {
    const L = LADDERS[lad]; let S = M.S0, box = 2, day = 0; const row = [];
    for (let k = 0; k < 12; k++) {
      const t = L[box], R = Rof(t, S); day += t;
      S = S * (1 + M.a * Math.pow(S, -M.b) * (Math.exp(M.c * (1 - R)) - 1));
      row.push(`day ${day}: R ${R.toFixed(2)}, P(right) ${(R + (1 - R) * BASE.guess * (1 - BASE.spoken)).toFixed(2)} -> S ${S.toFixed(1)}`);
      box = Math.min(L.length - 1, box + 1);
    }
    out.push([lad, row]);
  }
  return out;
}
if (args.includes('--calib')) { calibration().forEach(([l, r]) => log(l + ': ' + r.join(' | '))); process.exit(0); }
// --checks: the cases the roadmap quotes (4 seeds each). "fill" = review first, then fill the practice time left with
// new items (target 6 a play day); "open" = the open world as built (new items whatever the backlog).
if (args.includes('--checks')) {
  const one = (label, over) => {
    const P = merge(BASE, over), rs = [1, 2, 3, 4].map(sd => summarize(run(P, sd), P)), a = agg(rs), s = a.snaps[3];
    const perYr = [0, 1, 2].map(y => avg(rs, r => { let i = 0; for (let k = y * 12 + 1; k <= y * 12 + 12; k++) i += r.mon[k].intros; return i; }));
    const span = (k0, k1) => { let ds = 0, dd = 0, bl = 0, pl = 0; for (let k = k0; k <= k1; k++) { const x = a.mon[k]; if (!x.play) continue; ds += x.dueStart; dd += x.dueServed; bl += x.backlog; pl += x.play; } return [ds / pl, dd / pl, bl / pl].map(v => f0(v)).join(' / '); };
    log(`| ${label} | ${perYr.map(x => f0(x)).join(' / ')} | ${f0(s.met)} | ${f0(s.sumR)} | ${f0(s.durable)} | ${pct(a.retLate)} | ${f0(a.snaps[1].met)} / ${f0(a.snaps[1].sumR)} | ${span(1, 3)} | ${span(13, 18)} | ${span(31, 36)} |`);
  };
  log('| case | new items yr 1 / 2 / 3 | met mo 36 | recallable mo 36 | durable mo 36 | retention mo 25-36 | met / recallable mo 12 | due at start / done / left per play day, mo 1-3 | mo 13-18 | mo 31-36 |');
  log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const cal of ['realistic', 'ideal', 'steady', 'patchy']) {
    one(cal + ', fill, proposed (gaps to 128 d)', { calendar: cal, sched: 'proposed', n: 6, policy: 'review-first' });
    one(cal + ', fill, audit 2.1 gaps (to 150 d)', { calendar: cal, sched: 'p21', n: 6, policy: 'review-first' });
  }
  one('realistic, fill, proposed, practice 27% (today\'s free-play density)', { sched: 'proposed', n: 6, policy: 'review-first', practice: 0.27 });
  one('realistic, fill, proposed, practice 40%', { sched: 'proposed', n: 6, policy: 'review-first', practice: 0.40 });
  one('realistic, fill, proposed, practice 70%', { sched: 'proposed', n: 6, policy: 'review-first', practice: 0.70 });
  one('realistic, fill, proposed, pessimistic memory', { sched: 'proposed', n: 6, policy: 'review-first', mem: { S0: 0.125, a: 2.0, curve: 'exp' } });
  one('realistic, open, proposed, n 2', { sched: 'proposed', n: 2, policy: 'content-first' });
  one('realistic, open, proposed, n 2, practice 27%', { sched: 'proposed', n: 2, policy: 'content-first', practice: 0.27 });
  one('realistic, open, as built, n 1.5', { sched: 'game', n: 1.5, policy: 'content-first' });
  one('realistic, open, as built, n 3', { sched: 'game', n: 3, policy: 'content-first' });
  one('realistic, open, as built, n 5 (today\'s measured pace)', { sched: 'game', n: 5, policy: 'content-first' });
  process.exit(0);
}

function sweep(Pover, grid = GRID) {
  const P0 = merge(BASE, Pover), ok = CRIT[P0.policy];
  const rows = grid.map(n => ({ n, a: agg(runSeeds(merge(P0, { n }), SEEDS)) }));
  let best = null, peak = null;
  for (const r of rows) { if (ok(r.a)) best = r; if (!peak || r.a.snaps[3].sumR > peak.a.snaps[3].sumR) peak = r; }
  return { rows, best, peak };
}
const OUT = { base: BASE, crit: 'content-first: recallable/met at month 36 >= 80% and retention months 25-36 >= 75%; review-first: year-3 normal-day intake >= 85% and retention months 25-36 >= 75%' };
const ENGINES = ['game', 'ladder', 'steered', 'proposed'];
const POLICIES = ['content-first', 'review-first'];
const SHARES = [0.40, 0.55, 0.70];

// ---------- 1. calendars ----------
const calRows = Object.keys(CALENDARS).map(c => {
  const days = SEEDS.map(s => calendar(c, s));
  const perYear = [0, 1, 2].map(y => avg(days, p => p.slice(MONTH_END[y * 12] + 1, MONTH_END[y * 12 + 12] + 1).filter(Boolean).length));
  return { c, perYear, total: avg(days, p => p.filter(Boolean).length) };
});
OUT.calendars = calRows;
const playPerYear = c => calRows.find(r => r.c === c).total / 3;

// ---------- 2. sustainable intake: engine x practice share x policy (realistic calendar) ----------
const MAIN = {};
for (const policy of POLICIES) for (const sched of ENGINES) for (const practice of SHARES) {
  const key = `${policy}|${sched}|${practice}`;
  MAIN[key] = sweep({ sched, practice, policy });
  process.stderr.write(`main ${key} n*=${MAIN[key].best ? MAIN[key].best.n : '<' + GRID[0]} (${el()})\n`);
}
const nStar = (policy, sched, practice = 0.55) => { const b = MAIN[`${policy}|${sched}|${practice}`].best; return b ? b.n : GRID[0]; };
OUT.main = Object.fromEntries(Object.entries(MAIN).map(([k, v]) => [k, { best: v.best ? v.best.n : null, peak: v.peak.n, rows: v.rows.map(r => ({ n: r.n, yr: r.a.yr, yrN: r.a.yrN, ret: r.a.ret, retLate: r.a.retLate, snaps: r.a.snaps })) }]));

// ---------- 2b. the absorption ceiling: review first, then fill whatever practice time is left with new items ----------
// (review-first with a target the time can never meet: 6 a play day; what gets introduced is what fits)
const GREEDY = {};
for (const c of Object.keys(CALENDARS)) for (const practice of SHARES) for (const sched of ['proposed', 'ladder']) {
  const P = merge(BASE, { calendar: c, practice, sched, n: 6, policy: 'review-first' });
  const rs = SEEDS.map(sd => summarize(run(P, sd), P));
  const perYr = [0, 1, 2].map(y => avg(rs, r => { let i = 0; for (let k = y * 12 + 1; k <= y * 12 + 12; k++) i += r.mon[k].intros; return i; }));
  const playYr = [0, 1, 2].map(y => avg(rs, r => { let i = 0; for (let k = y * 12 + 1; k <= y * 12 + 12; k++) i += r.mon[k].play; return i; }));
  GREEDY[`${c}|${practice}|${sched}`] = { perYr, playYr, a: agg(rs) };
}
process.stderr.write(`greedy (${el()})\n`);
OUT.greedy = Object.fromEntries(Object.entries(GREEDY).map(([k, v]) => [k, { perYr: v.perYr, playYr: v.playYr, snaps: v.a.snaps, retLate: v.a.retLate }]));

// ---------- 3. today's content: 186 items (180 words + 6 phrases) met at ~5 a play day, then nothing new ----------
const TODAY = {};
for (const sched of ['game', 'proposed']) TODAY[sched] = agg(runSeeds(merge(BASE, { sched, n: 5, policy: 'content-first', maxItems: 186 }), SEEDS));
OUT.today = Object.fromEntries(Object.entries(TODAY).map(([k, a]) => [k, a.snaps]));

// ---------- 4. timelines ----------
const D = (y, m, d) => dayOfDate(y, m, d);
const BREAKS = [[D(2027, 6, 30), D(2027, 8, 12)], [D(2028, 6, 30), D(2028, 8, 12)]];
function timeline(Pover) {
  const P = merge(BASE, Pover);
  const raw = SEEDS.map(s => run(P, s, { daily: true, snapAt: BREAKS.flat() }));
  const a = agg(raw.map(r => summarize(r, P)));
  const brk = BREAKS.map(([b0, b1]) => {
    const per = raw.map(r => {
      const d = r.daily, pre = [], post = [];
      for (let x = b0; x >= 0 && pre.length < 10; x--) if (d.play[x]) pre.push(x);
      for (let x = b1; x < DAYS && post.length < 10; x++) if (d.play[x]) post.push(x);
      const ret = xs => { let n = 0, k = 0; for (const x of xs) { n += d.rn[x]; k += d.rr[x]; } return n ? k / n : null; };
      let clear = null; for (let k = 0; k < post.length; k++) if (d.backlog[post[k]] <= P.backlogTol) { clear = k + 1; break; }
      const sa = r.extraSnaps[b0], sb = r.extraSnaps[b1];
      return { retPre: ret(pre), retPost: ret(post.slice(0, 5)), dueFirst: d.dueStart[post[0]], revMinFirst: d.revSec[post[0]] / 60, clear: clear == null ? 11 : clear, sumRa: sa.sumR, sumRb: sb.sumR, durA: sa.durable, durB: sb.durable, metA: sa.met };
    });
    const o = {}; for (const k of Object.keys(per[0])) o[k] = avg(per, p => p[k]); return o;
  });
  return { P, a, brk };
}
const nCFp = nStar('content-first', 'proposed'), nCFg = nStar('content-first', 'game'), nRFp = nStar('review-first', 'proposed');
const TL = [
  ['proposed, open world (content-first), n = ' + nCFp, { sched: 'proposed', n: nCFp, policy: 'content-first' }],
  ['game as built, open world, n = ' + nCFg, { sched: 'game', n: nCFg, policy: 'content-first' }],
  ['game as built, open world, n = 3 (new content at about today\'s pace, all 3 years)', { sched: 'game', n: 3, policy: 'content-first' }],
  ['proposed, gated (review-first), n = ' + nRFp, { sched: 'proposed', n: nRFp, policy: 'review-first' }],
  ['proposed, gated, then fill the rest with new items (target 6)', { sched: 'proposed', n: 6, policy: 'review-first' }],
  ['proposed, open world, n = ' + nCFp + ', exponential forgetting', { sched: 'proposed', n: nCFp, policy: 'content-first', mem: { curve: 'exp' } }],
].map(([label, o]) => Object.assign({ label }, timeline(o)));
process.stderr.write(`timelines (${el()})\n`);
OUT.timelines = TL.map(t => ({ label: t.label, brk: t.brk, mon: t.a.mon.slice(1).map(m => ({ play: m.play, intros: m.intros, dueStart: m.dueStart, revSec: m.revSec, introSec: m.introSec, otherSec: m.otherSec, backlog: m.backlog, rn: m.rn, rr: m.rr, snap: m.snap })) }));

// ---------- 5. calendars ----------
const CALRES = {};
for (const c of Object.keys(CALENDARS)) {
  CALRES[c] = {};
  for (const sched of ['game', 'proposed']) CALRES[c][sched] = sweep({ calendar: c, sched, policy: 'content-first' });
  CALRES[c].proposedRF = sweep({ calendar: c, sched: 'proposed', policy: 'review-first' });
}
process.stderr.write(`calendars (${el()})\n`);
OUT.calendarsRes = Object.fromEntries(Object.entries(CALRES).map(([c, v]) => [c, Object.fromEntries(Object.entries(v).map(([k, sw]) => [k, { best: sw.best ? sw.best.n : null, snaps36: sw.best ? sw.best.a.snaps[3] : null, play: sw.rows[0].a.play }]))]));

// ---------- 6. sensitivity (realistic calendar, 55% practice) ----------
const SENS = [
  ['base', {}],
  ['practice share 40%', { practice: 0.40 }], ['practice share 70%', { practice: 0.70 }],
  ['retrieval 6 s', { tRet: 6 }], ['retrieval 15 s', { tRet: 15 }],
  ['introduction 30 s', { tIntro: 30 }], ['introduction 60 s', { tIntro: 60 }],
  ['forgets faster (S0 x0.5: next-day recall 53%)', { mem: { S0: 0.125 } }], ['forgets slower (S0 x1.5: 77%)', { mem: { S0: 0.375 } }],
  ['consolidates slower (gain a x0.67)', { mem: { a: 2.0 } }], ['consolidates faster (gain a x1.33)', { mem: { a: 4.0 } }],
  ['exponential forgetting (harsh on gaps)', { mem: { curve: 'exp' } }],
  ['harder items (difficulty sd 0.6)', { mem: { diffSd: 0.6 } }],
  ['spoken 15% (more 3-card guessing)', { spoken: 0.15 }], ['spoken 60%', { spoken: 0.6 }],
  ['all words (no phrases / patterns)', { mix: [[1, 0, 0], [1, 0, 0], [1, 0, 0]] }],
  ['phrase-heavy (50% phrases+patterns by yr 3)', { mix: [[0.8, 0.15, 0.05], [0.6, 0.28, 0.12], [0.5, 0.32, 0.18]] }],
  ['quests revisit old zones more (pNewZone 0.3)', { pNewZone: 0.3 }],
  ['game channels reach 8 due items/session', { dueCap: 8 }], ['game channels reach 30 due items/session', { dueCap: 30 }],
  ['10-minute sessions', { sessionSec: 600 }], ['20-minute sessions', { sessionSec: 1200 }],
  ['audit-matched density (70% practice, 8 s: ~5 prompts/min like tools/vocab-audit.js)', { practice: 0.70, tRet: 8 }],
  ['pessimistic memory (S0 x0.5, gain x0.67, exponential)', { mem: { S0: 0.125, a: 2.0, curve: 'exp' } }],
  ['optimistic memory (S0 x1.5, gain x1.33)', { mem: { S0: 0.375, a: 4.0 } }],
];
const SENSRES = {};
for (const [name, o] of SENS) {
  SENSRES[name] = {
    gameCF: sweep(merge({ sched: 'game', policy: 'content-first' }, o)),
    propCF: sweep(merge({ sched: 'proposed', policy: 'content-first' }, o)),
    propRF: sweep(merge({ sched: 'proposed', policy: 'review-first' }, o)),
  };
  process.stderr.write(`sens ${name} (${el()})\n`);
}
OUT.sens = Object.fromEntries(Object.entries(SENSRES).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([s, sw]) => [s, { best: sw.best ? sw.best.n : null, snaps36: sw.best ? sw.best.a.snaps[3] : null, peakN: sw.peak.n, peakR: sw.peak.a.snaps[3].sumR }]))]));

// ======================================================================================================================
// Report
// ======================================================================================================================
log('# Club de Español: 3-year intake model (sim.js output)\n');
log(`Seeds: ${SEEDS.length} per point (means shown); n grid: ${GRID.join(', ')} new items per play day; runtime ${el()}.`);
log('Engines: **game** = as built (8-day cap, a miss + right re-ask restores the box, ~' + BASE.dueCap + ' engine-chosen reviews a session, quests ask random words of the zones visited); **ladder** = game + boxes 16/32/64/128 d; **steered** = game intervals but every practice moment can go to a due item; **proposed** = long ladder + honest lapses + steering.');
log('Policies: **content-first** = the open world as built (new items whenever the content has them); **review-first** = new items only once <= ' + BASE.backlogTol + ' due items are left.\n');
log('## Calibration (one average word, reviewed exactly when due, never missed; P(right) includes 3-card guessing on taps)\n');
for (const [l, r] of calibration()) log(`- **${l}**: ` + r.slice(0, 9).join('; '));
log('\n## Play days by calendar\n');
log('| calendar | pattern | yr 1 | yr 2 | yr 3 | 3 yrs | per week | hours of play / yr |');
log('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of calRows) log(`| ${r.c} | ${CALENDARS[r.c].label} | ${f0(r.perYear[0])} | ${f0(r.perYear[1])} | ${f0(r.perYear[2])} | ${f0(r.total)} | ${(r.total / (DAYS / 7)).toFixed(1)} | ${f0(r.total / 3 * BASE.sessionSec / 3600)} |`);

log('\n## Sustainable intake n* (new items per play day), realistic calendar\n');
log(OUT.crit + '. Cell: n* (items/yr at n*; met -> recallable at month 36).\n');
log('| policy | engine | practice 40% | practice 55% | practice 70% | peak recallable mo 36 at 55% (n) |');
log('| --- | --- | --- | --- | --- | --- |');
for (const policy of POLICIES) for (const sched of ENGINES) {
  const cell = p => { const sw = MAIN[`${policy}|${sched}|${p}`], b = sw.best; if (!b) return '< ' + GRID[0]; return `**${b.n}** (${f0(b.n * b.a.play / 3)}/yr; ${f0(b.a.snaps[3].met)} -> ${f0(b.a.snaps[3].sumR)})`; };
  const pk = MAIN[`${policy}|${sched}|0.55`].peak;
  log(`| ${policy} | ${sched} | ${cell(0.4)} | ${cell(0.55)} | ${cell(0.7)} | ${f0(pk.a.snaps[3].sumR)} (n ${pk.n}) |`);
}
log('\n### The absorption ceiling: review first, then fill the rest of the practice time with new items (target 6 a play day)\n');
log('| calendar | engine | practice | new items yr 1 | yr 2 | yr 3 | per play day yr 1 / 2 / 3 | met mo 36 | recallable mo 36 | durable mo 36 | retention mo 25-36 |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [k, v] of Object.entries(GREEDY)) {
  const [c, p, sched] = k.split('|'), s = v.a.snaps[3];
  log(`| ${c} | ${sched} | ${Math.round(p * 100)}% | ${f0(v.perYr[0])} | ${f0(v.perYr[1])} | ${f0(v.perYr[2])} | ${v.perYr.map((x, i) => f0(x / v.playYr[i], 2)).join(' / ')} | ${f0(s.met)} | ${f0(s.sumR)} | ${f0(s.durable)} | ${pct(v.a.retLate)} |`);
}
log('\n### Full grid at 55% practice\n');
log('| policy | engine | n | met mo 36 | recallable mo 36 | kept | durable mo 36 | "solid" (st 4) mo 36 | retention all | retention mo 25-36 | intake yr 1/2/3 (normal days) |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const policy of POLICIES) for (const sched of ENGINES) for (const r of MAIN[`${policy}|${sched}|0.55`].rows) {
  const a = r.a, s = a.snaps[3];
  log(`| ${policy} | ${sched} | ${r.n} | ${f0(s.met)} | ${f0(s.sumR)} | ${pct(s.sumR / s.met)} | ${f0(s.durable)} | ${f0(s.k4)} | ${pct(a.ret)} | ${pct(a.retLate)} | ${a.yrN.map(pct).join(' / ')} |`);
}

log('\n## Cumulative items (realistic calendar, 55% practice)\n');
for (const t of TL) {
  log(`\n### ${t.label}\n`);
  log('| month | met | known (st 2+) | remembered (st 3+) | "solid" (st 4) | recallable now (sum R) | R >= 0.8 now | durable (R >= 0.8 after 30 more days) | retention that month |');
  log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const k of [3, 6, 9, 12, 18, 24, 30, 36]) { const m = t.a.mon[k], s = m.snap; log(`| ${k} | ${f0(s.met)} | ${f0(s.k2)} | ${f0(s.k3)} | ${f0(s.k4)} | ${f0(s.sumR)} | ${f0(s.r80)} | ${f0(s.durable)} | ${pct(m.rn ? m.rr / m.rn : null)} |`); }
}
log('\n## Daily practice minutes over time (per play day; the practice budget is ' + (BASE.sessionSec * BASE.practice / 60).toFixed(2) + ' min at 55%)\n');
for (const t of TL.slice(0, 5)) {
  log(`\n### ${t.label}\n`);
  log('| months | play days | due at start | due reviews done | review min | intro min | other practice min | due left over | new items/day |');
  log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const [m0, m1] of [[1, 3], [4, 6], [7, 9], [10, 12], [13, 18], [19, 24], [25, 30], [31, 36]]) {
    let pd = 0, ds = 0, sv = 0, rv = 0, it = 0, ot = 0, bl = 0, ni = 0;
    for (let k = m0; k <= m1; k++) { const m = t.a.mon[k]; pd += m.play; ds += m.dueStart; sv += m.dueServed; rv += m.revSec; it += m.introSec; ot += m.otherSec; bl += m.backlog; ni += m.intros; }
    const d = Math.max(1, pd);
    log(`| ${m0}-${m1} | ${f0(pd)} | ${f0(ds / d, 1)} | ${f0(sv / d, 1)} | ${f0(rv / d / 60, 1)} | ${f0(it / d / 60, 1)} | ${f0(ot / d / 60, 1)} | ${f0(bl / d, 1)} | ${f0(ni / d, 2)} |`);
  }
}
log('\n## Today\'s content (186 items met at ~5 a play day, then nothing new; content-first)\n');
log('| engine | met mo 1 | mo 2 | mo 3 | recallable mo 6 | mo 12 | mo 36 | "solid" mo 36 |');
log('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [k, a] of Object.entries(TODAY)) log(`| ${k} | ${f0(a.mon[1].snap.met)} | ${f0(a.mon[2].snap.met)} | ${f0(a.mon[3].snap.met)} | ${f0(a.snaps[0].sumR)} | ${f0(a.snaps[1].sumR)} | ${f0(a.snaps[3].sumR)} | ${f0(a.snaps[3].k4)} |`);

log('\n## Breaks (summer Jul 1 - Aug 11)\n');
log('| run | summer | recallable before -> after | lost | durable before -> after | retention 10 play days before | first 5 play days back | due on day 1 back | review min day 1 back | play days to clear the backlog |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const t of TL) t.brk.forEach((b, i) => log(`| ${t.label} | ${2027 + i} | ${f0(b.sumRa)} -> ${f0(b.sumRb)} | ${pct(1 - b.sumRb / b.sumRa)} | ${f0(b.durA)} -> ${f0(b.durB)} | ${pct(b.retPre)} | ${pct(b.retPost)} | ${f0(b.dueFirst)} | ${f0(b.revMinFirst, 1)} | ${b.clear > 10 ? '>10' : f0(b.clear, 1)} |`));
log('\n### By calendar (55% practice)\n');
log('| calendar | play days / yr | game open-world n* | items/yr | recallable mo 36 | proposed open-world n* | items/yr | recallable mo 36 | proposed gated n* | items/yr | recallable mo 36 |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const c of Object.keys(CALENDARS)) {
  const v = CALRES[c], py = playPerYear(c);
  const cells = sw => sw.best ? `${sw.best.n} | ${f0(sw.best.n * py)} | ${f0(sw.best.a.snaps[3].sumR)}` : `< ${GRID[0]} | - | -`;
  log(`| ${c} | ${f0(py)} | ${cells(v.game)} | ${cells(v.proposed)} | ${cells(v.proposedRF)} |`);
}

log('\n## Sensitivity (realistic calendar, 55% practice unless the row changes it): n* and recallable items at month 36 at n*\n');
log('| variant | game open-world n* | recallable mo 36 | proposed open-world n* | recallable mo 36 | durable mo 36 | proposed gated n* | recallable mo 36 | proposed peak recallable (n) |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [name, v] of Object.entries(SENSRES)) {
  const c = sw => sw.best ? [sw.best.n, f0(sw.best.a.snaps[3].sumR), f0(sw.best.a.snaps[3].durable)] : ['< ' + GRID[0], '-', '-'];
  const g = c(v.gameCF), p = c(v.propCF), r = c(v.propRF);
  log(`| ${name} | ${g[0]} | ${g[1]} | ${p[0]} | ${p[1]} | ${p[2]} | ${r[0]} | ${r[1]} | ${f0(v.propCF.peak.a.snaps[3].sumR)} (${v.propCF.peak.n}) |`);
}

// ---------- content-volume implications ----------
log('\n## Content-volume implications (55% practice)\n');
log('Authored first-play minutes per new item: Villa Sol measured ~2.5 (tools/vocab-audit.js: 73 words in 181 min of bot play, incl. free-play days); a real child is slower (README: 5-10 min per errand of 3-5 words), ~3.5.\n');
log('| calendar | engine / policy | n* | play days / yr | new items / yr | 3-yr total | zones / yr at 15 / 20 / 25 items | play hours / yr | of which not practice (story, exploring) | authored first-play hours / yr at 2.5 / 3.5 min per item | share of all play |');
log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const IMPL = [];
for (const c of ['ideal', 'steady', 'realistic', 'patchy']) for (const [lab, sw] of [['game, open world', CALRES[c].game], ['proposed, open world', CALRES[c].proposed], ['proposed, gated', CALRES[c].proposedRF]]) {
  if (!sw.best) continue;
  const n = sw.best.n, py = playPerYear(c), perYr = n * py, hrs = py * BASE.sessionSec / 3600;
  const a1 = perYr * 2.5 / 60, a2 = perYr * 3.5 / 60;
  IMPL.push({ c, lab, n, py, perYr, total: sw.best.a.snaps[3].met, hrs, a1, a2 });
  log(`| ${c} | ${lab} | ${n} | ${f0(py)} | ${f0(perYr)} | ${f0(sw.best.a.snaps[3].met)} | ${f0(perYr / 15)} / ${f0(perYr / 20)} / ${f0(perYr / 25)} | ${f0(hrs)} | ${f0(hrs * (1 - BASE.practice))} | ${f0(a1)} / ${f0(a2)} | ${pct(a1 / hrs)} - ${pct(a2 / hrs)} |`);
}
OUT.implications = IMPL;
{ const j = args.indexOf('--json'); if (j >= 0 && args[j + 1]) fs.writeFileSync(path.resolve(args[j + 1]), JSON.stringify(OUT)); }
log(`\n(results.json written; ${el()})`);
