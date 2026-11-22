// Open-world learning audit (docs/AUDIT_2026-10.md 2.12, M19; section 5's "how we'll know polish is done"): a child plays
// several in-game days of about 15 minutes, one a calendar day, in the open world with every live feature on (the dog's
// warm-up and its mid-session moment, phrases, listen and do, review-first pacing ON), going to a place each day in turn
// (Villa Sol first, then the zones by bus), at a child's pace: reading and thinking time (G.vlog.pace, as
// tools/vocab-audit.js), about 20% of picture-card questions tapped wrong first, saying some answers on mic days (a fake
// recognizer) and never on the "no mic" days. The player is the existing bots: tools/naivebot.js on the map (it taps only
// what visibly calls for a tap: the guide's arrow, the hint hand, bubbles, sparkles; helped along by tools/playflow.js
// nextTap when stuck), tools/playflow.js settle and tools/harness.js drive for every scene.
// It reports, per day and in all (the numbers come from the game's own learning history, src/history.js, plus a timer
// on story vs free play and on practice scenes):
//   practice moments a minute (each retrieval in the history: a pick, a recall, a said word, a request's word), overall
//   and in free play vs a chapter's beats; the practice share of the session (time on questions, requests, phrase
//   asks, page puzzles); new items per play day (and the pacing's target); reviews due when the day began, due
//   reviews done, the backlog left at session end; a place's words used while she is somewhere else; guess-adjusted
//   recognition (history.js H.recognition: lucky taps taken out) beside the older "retention"; the spoken-recall share
//   (said before any written cue, F, of all practice); recall from memory; listen-and-do requests; the dog's moments
// next to the audit's targets: 3+ practice moments a minute in free play (about half the session), reviews done >= due,
// about 2-3 new items a play day (3 or fewer on average, never more than 8 a day), a backlog of 5 or fewer at session
// end on most days, each place's words used every few days while she's away.
//   NODE_PATH=$(npm root -g) node tools/learning-audit.js [--days 6] [--session 15] [--wrong 0.2] [--speak 0.35]
//        [--nomic 3] [--speed 3] [--seed 11] [--places villa,playa,bosque,juegos,abuelos,montana] [--out dir] [--write-docs]
//   [--gap D:N]  (a break: after play day D, N extra calendar days before the next play day)
//   node tools/learning-audit.js --from dump.json [--write-docs]   (the report again from a saved run, no browser)
// --nomic n: every n-th day the child doesn't talk (0: she talks every day); --speed: G.speedMul (the same frames, less
// waiting; 1 = real time). Writes learning-audit.md and learning-audit.json to the scratch folder (the scratchpad when
// there is one, else the OS temp dir; --out dir), never into docs/ unless --write-docs (then docs/LEARNING_AUDIT.md).
// Also reported: stars, words met and the furthest chapter in each story line on every play day (and the play day the
// stars pass 52, the child's own count); every practice moment split three ways (a word that was due, a new word, a word
// not due: so the minutes target cannot be met by repeating words that were not due); free-play seconds and moments by
// what the guide arrow was leading to (G.guide.at.why) or no arrow; "Coming back after a break" (with --gap); and each
// measurable Sprint 2 and Sprint 3 target (docs/AUDIT_2026-10.md section 5 table) as one PASS or FAIL line.
// The default run (6 days) takes about 15-20 minutes on a quiet machine.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');

const ARGS = process.argv.slice(2);
const arg = (k, d) => { const i = ARGS.indexOf('--' + k); return i >= 0 ? ARGS[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..');
// the report's folder: --out, or SPANISH_CLUB_OUT, or the system's temp folder (--write-docs also writes docs/)
const OUTDIR = path.resolve(arg('out', process.env.SPANISH_CLUB_OUT || os.tmpdir()));
const WRITE_DOCS = ARGS.includes('--write-docs');
const DAYS = +arg('days', 6), SESSION = +arg('session', 15) * 60, SPEED = +arg('speed', 3);
const P_WRONG = +arg('wrong', 0.2), P_SPEAK = +arg('speak', 0.35), NOMIC = +arg('nomic', 3);
const GAP = (() => { const g = arg('gap'); if (!g) return null; const [d, n] = g.split(':').map(Number); return d > 0 && n > 0 ? { d, n } : null; })();
const PLACES = arg('places', 'villa,playa,bosque,juegos,abuelos,montana').split(',');
const placeOf = day => PLACES[(day - 1) % PLACES.length];
const TARGET = { freeMin: 3, newMax: 3, backlog: 5, awayEvery: 3 };

// ---------- a scripted SpeechRecognition (as in tools/vocab-audit.js): each start() takes the next reply ----------
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
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- page side: the meters (story vs free play, practice scenes, every history event with its moment) ----------
const METERS = () => {
  if (window.__LA) return;
  const A = window.__LA = { ev: [], met: [], sec: { story: 0, free: 0, practice: 0 }, by: {}, cat: 'no arrow', day: 1, place: null };
  // what the guide arrow is leading to (G.guide.at.why, src/guide.js), in a few words; kept while a scene is on top
  const catOf = at => {
    const w = at && at.why; if (!w) return 'no arrow';
    if (/^play:/.test(w)) return 'the day\'s play'; if (/^review /.test(w)) return 'a review talk'; if (/^find /.test(w)) return 'a story find';
    if (/^favour/.test(w)) return 'a favour'; if (/^seek/.test(w)) return 'seek and find'; if (/^canelo/.test(w)) return 'the dog'; if (/^palabra/.test(w)) return 'the word of the day';
    if (/^pages/.test(w)) return 'the page puzzles'; if (/^job/.test(w)) return 'a job'; if (/^bubble/.test(w)) return 'a bubble'; if (/^greet/.test(w)) return 'a greeting';
    if (/^(home|bed)/.test(w)) return 'going home'; if (/^\S+:\S/.test(w)) return 'a story beat'; return 'other: ' + String(w).split(' ').slice(0, 2).join(' ');
  };
  const split = id => { try { const r = G.words.rec(id); if (!r || r.st < 1 || r.mdate === G.today()) return 'new'; return G.words.due(id) ? 'due' : 'off'; } catch (e) { return 'off'; } }; // (a word due, a new word, or one not due)
  const meet = G.words.meet; G.words.meet = function (id) { const r = meet.apply(this, arguments); if (r) A.met.push({ day: A.day, id, story: !!G.chapters.running(), phrase: G.words.isPhrase(id) }); return r; }; // (a new item: in a chapter's beat or not)
  const PRACTICE = s => { const n = s && s.constructor && s.constructor.name; return n === 'ListenDo' || n === 'PhraseAsk' || n === 'PagePuzzle' || (n === 'Choice' && s.o && s.o.answer != null && !!s.o.onWrong); };
  const add = sec => { const st = !!(G.chapters && G.chapters.running && G.chapters.running()); A.sec[st ? 'story' : 'free'] += sec; if (G.top() === G.field) A.cat = catOf(G.guide && G.guide.at); if (!st) A.by[A.cat] = (A.by[A.cat] || 0) + sec; if (PRACTICE(G.top())) A.sec.practice += sec; };
  const step = G.words.step; G.words.step = function () { if (G.state) add(1 / 60); return step.apply(this, arguments); };
  const pace = G.vlog.pace; G.vlog.pace = function (sec) { if (G.vocabLog && sec > 0) add(sec); return pace.apply(this, arguments); };
  const len = id => { const e = G.state && G.hist.day().w[id]; return e && typeof e[1] === 'string' ? e[1].length : 0; };
  const ev = G.hist.event; G.hist.event = function (id, k) {
    const n0 = len(id), q = split(id), r = ev.apply(this, arguments);
    if (!r) return r;
    if (n0 && len(id) === n0) { for (let i = A.ev.length - 1; i >= 0; i--) if (A.ev[i].id === id) { A.ev[i].k = r; break; } return r; } // (the mic's word then its answer: one event, history.js)
    const m = G.field && G.field.mapId, here = m ? G.zones.of(m) || G.zones.pathOf(m) : null;
    A.ev.push({ t: G.vlog.time(), day: A.day, k: r, id, phrase: G.words.isPhrase(id), zone: G.words.isPhrase(id) ? null : G.zones.ofWord(id) || 'villa', here, story: !!G.chapters.running(), map: m, q, c: A.cat });
    return r;
  };
};

async function play() {
  const { open, launch, Game } = require('./harness');
  const { settle, newGame, nextTap } = require('./playflow');
  const { NaiveBot } = require('./naivebot');
  Game.prototype.shot = async function () {}; // (no screenshots: an audit, not a test)
  const R = rng(+arg('seed', 11));
  const browser = await launch();
  const { ctx, g } = await open(browser, 'learnaudit', true, { warmup: true, phrases: true, listen: true });
  const t0 = Date.now(), days = [], stats = { spoken: 0, spokenFirst: 0, spokenPhrase: 0, wrong: 0, stuck: 0, helped: 0, cues: {} };
  let speaking = true, sessT0 = 0, day = 1; const starts = {};
  try {
    await ctx.addInitScript(FAKE);
    await g.page.reload();
    await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
    await g.ev(s => { G.vocabLog = []; G.vlog.mark('start'); G.speedMul = s; }, SPEED);
    await g.ev(`(${METERS})()`);
    const pace = s => g.ev(s => G.vlog.pace(s), s);
    const now = () => g.ev(() => G.vlog.time());
    const sayIt = async (text, done) => {
      await g.ev(t => window.__sr.queue.push({ results: [[t, 0.95]], delay: 400 }), text);
      await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
      try { await g.until(done, null, 'the spoken answer', 6000); return true; } catch (e) { return false; }
    };
    // a child's pace and choices, before harness drive's own move (true: the move was made here)
    g.beforeAct = async () => {
      const info = await g.ev(() => {
        const t = G.top(); if (!t) return null;
        const v = t.__va || (t.__va = {}), n = t.constructor.name, o = { n, v, t: t.t };
        if (n === 'TextBox') { o.text = G.plain(t.pages[t.pi].t); o.pi = t.pi; o.rev = t.shown >= t.chars(0, t.scroll + 3); }
        if (n === 'Choice') {
          o.prompt = G.plain(t.o.prompt || ''); o.nc = t.ch.length; o.won = !!t.won; o.say = !!t.say; o.mic = !!(t.mic && t.mic.shown() && t.mic.can());
          o.ask = !!t.o.onWrong && t.o.answer != null; o.cards = t.cards;
          const a = t.ch[t.o.answer]; o.word = a && a.word ? (G.mic.target(a) || '').split(' / ')[0].replace(/^(el|la|los|las) /, '') : null;
          o.wrong = t.ch.map((c, k) => k !== t.o.answer && !c.off ? k : -1).filter(k => k >= 0);
          o.rects = t.rects();
        }
        if (n === 'PhraseAsk') { o.mic = !!(t.mic && t.mic.can && t.mic.can()); o.inv = t.invite != null; try { o.sent = G.phrase.sentence(t.id, t.slots[t.free ? 0 : t.answer]); } catch (e) { o.sent = null; } }
        return o;
      });
      if (!info) return false;
      const mark = v => g.ev(v => Object.assign(G.top().__va || (G.top().__va = {}), v), v);
      switch (info.n) {
        case 'TextBox': // listen to the line (the voice reads ~12 letters a second), then go on
          if (info.rev && info.v.paced !== info.pi) { await mark({ paced: info.pi }); await pace(Math.max(0, 1 + info.text.length * 0.09 - info.t / 60)); }
          return false;
        case 'Choice': {
          if (info.t <= 8 || info.won) return false;
          if (!info.v.paced) { await mark({ paced: 1 }); await pace(Math.max(0, 1.5 + info.prompt.length * 0.07 + info.nc * 0.6 - info.t / 60)); }
          if (info.say) { // say it first: on a mic day she tries it now and then (drive skips it otherwise)
            if (info.v.sayDecided) return false;
            await mark({ sayDecided: 1 });
            if (speaking && info.mic && info.word && R() < P_SPEAK) { await pace(2); if (await sayIt(info.word, () => G.top().constructor.name !== 'Choice' || !!G.top().won || !G.top().say)) { stats.spokenFirst++; return true; } }
            return false;
          }
          if (info.v.decided) return false;
          await mark({ decided: 1 });
          if (info.ask && info.cards && info.wrong.length && R() < P_WRONG) { // a wrong tap first
            const k = info.wrong[Math.floor(R() * info.wrong.length)];
            await g.tapRect(info.rects[k]); stats.wrong++;
            await g.until(k => G.top().constructor.name !== 'Choice' || G.top().ch[k].off, k, 'the wrong card to grey out');
            await g.frames(12); await pace(1.5);
            return true;
          }
          if (speaking && info.mic && info.word && R() < P_SPEAK) {
            await pace(2);
            if (await sayIt(info.word, () => G.top().constructor.name !== 'Choice' || !!G.top().won)) { stats.spoken++; return true; }
          }
          return false;
        }
        case 'PhraseAsk':
          if (!info.v.paced) { await mark({ paced: 1 }); await pace(4); }
          if (!info.v.decided && info.mic && info.sent && !info.inv) {
            await mark({ decided: 1 });
            if (speaking && R() < P_SPEAK) { await pace(2); if (await sayIt(info.sent, () => G.top().constructor.name !== 'PhraseAsk' || !!G.top().result || G.top().invite != null)) { stats.spokenPhrase++; return true; } }
          }
          return false;
        case 'ListenDo': if (!info.v.paced) { await mark({ paced: 1 }); await pace(4); } return false;
        case 'PagePuzzle': if (!info.v.paced) { await mark({ paced: 1 }); await pace(12); } return false;
        case 'WordCard': if (!info.v.paced) { await mark({ paced: 1 }); await pace(3); } return false;
        case 'QuestCard': case 'BadgeCard': case 'FriendCard': case 'Photo': case 'PhraseModel': case 'NewPlace':
          if (!info.v.paced) { await mark({ paced: 1 }); await pace(2); }
          return false;
        default: return false;
      }
    };
    sessT0 = await now();
    await newGame(g);
    const bot = new NaiveBot(g);
    // the day's place: Villa Sol is where the game starts; a zone: the bus (G.zones.travel), as from the world map
    // the dog's warm-up comes the first time she is free on a new day: it plays first (a map change under it would drop it)
    const warmUp = async () => {
      await g.until(() => !!G.warmup.cur() || (G.top() === G.field && !G.field.locked && G.warmup.wait(G.field) != null), null, 'the warm-up, or a reason it waits', 15000).catch(() => {});
      for (let k = 0; k < 600 && await g.ev(() => !!G.warmup.cur()); k++) {
        if (await g.ev(() => G.top() !== G.field)) await g.drive(() => G.top() === G.field || !G.warmup.cur(), 'the warm-up'); else await g.frames(8);
      }
    };
    const goPlace = async z => {
      await settle(g, 'before the bus');
      await warmUp(); await settle(g, 'after the warm-up');
      const here = await g.ev(() => G.zones.of(G.field.mapId));
      if (here === z) return;
      await g.ev(z => { G.field.tasks.add(G.zones.travel(G.field, z)); }, z);
      try { await g.until(z => G.field && G.zones.of(G.field.mapId) === z, z, 'the bus to ' + z, 60000); } catch (e) { console.log('    (the bus to ' + z + ' did not arrive: ' + e.message + ')'); }
      await settle(g, 'arriving');
    };
    // the end of a day's session: its numbers (from the game's history and the meters)
    const endOfDay = () => g.ev(day => {
      const H = G.hist, B = G.budget, d = H.day(), A = window.__LA;
      const CH = G.chapters, lines = CH.lines();
      return { day, date: G.today(), map: G.field && G.field.mapId, t: G.vlog.time(), sec: Object.assign({}, A.sec), by: Object.assign({}, A.by), stars: G.state.stars | 0, wordsMet: G.words.count(1),
        story: lines.map(l => { const ids = CH.ids().filter(id => CH.lineOf(id) === l); let last = -1; ids.forEach((id, k) => { if (CH.done(id)) last = k; }); return { line: l, done: ids.filter(CH.done).length, of: ids.length, last: last + 1 }; }),
        chStarted: CH.startedToday(), chOpenEnd: lines.some(l => !!CH.current(l) || (!!CH.next(l) && CH.gate(CH.next(l)) === null)), backlog: B.backlog(), bd: d.bd, rv: d.rv | 0, met: d.met.slice(), newItems: B.today(), target: B.target(),
        queue: B.queue(), stages: [1, 2, 3, 4].map(k => G.words.count(k)), wu: JSON.parse(JSON.stringify(H.state().wu)), ld: Object.assign({}, H.state().ld), mic: G.mic.status().st };
    }, day);
    // starts[day]: each day as it began (before the dog's warm-up): the backlog, and whether a story chapter could open
    const atStart = d => g.ev(d => { const CH = G.chapters, lines = CH.lines(); return { day: d, backlog: G.budget.backlog(), chOpen: lines.some(l => !!CH.current(l) || (!!CH.next(l) && CH.gate(CH.next(l)) === null)), chWait: lines.some(l => !CH.current(l) && !!CH.next(l) && CH.gate(CH.next(l)) === 'room') }; }, d);
    speaking = !(NOMIC > 0 && day % NOMIC === 0);
    console.log('  day 1 (' + placeOf(1) + ')' + (speaking ? '' : ', no mic'));
    for (let step = 0; step < 20000; step++) {
      if (await now() - sessT0 >= SESSION) {
        const rec = await endOfDay(); rec.place = placeOf(day); rec.speaking = speaking; days.push(rec);
        console.log(`  day ${day} (${rec.place}) ends: ${Math.round(rec.t - sessT0)} s, new ${rec.newItems}, due ${rec.bd} done ${rec.rv} left ${rec.backlog}; wall ${Math.round((Date.now() - t0) / 1000)} s`);
        if (day >= DAYS) break;
        const gapDays = GAP && GAP.d === day ? GAP.n : 0; rec.gapAfter = gapDays;
        if (gapDays) console.log('  ... ' + gapDays + ' days away');
        day++;
        await g.ev(n => { G.st.saveNow(); G.vlog.mark('session-end'); G.debug.dayShift = (G.debug.dayShift || 0) + n; G.toTitle(); }, 1 + gapDays);
        await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
        await g.tap(160, 180);
        await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
        await g.tapRect(await g.ev(() => G.top().cardRect(0)));
        await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
        await g.ev(d => { const A = window.__LA; A.day = d; A.sec = { story: 0, free: 0, practice: 0 }; A.by = {}; }, day);
        speaking = !(NOMIC > 0 && day % NOMIC === 0);
        console.log('  day ' + day + ' (' + placeOf(day) + ')' + (speaking ? '' : ', no mic'));
        await pace(5); // (getting going again)
        sessT0 = await now();
        await settle(g, 'arrival');
        starts[day] = await atStart(day);
        await goPlace(placeOf(day));
        continue;
      }
      await settle(g, 'step ' + step);
      const r = await bot.free(45);
      stats.cues[r.cue || 'none'] = (stats.cues[r.cue || 'none'] || 0) + 1;
      if (r.stuck) {
        stats.stuck++;
        const t = await nextTap(g);
        if (t) { stats.helped++; await g.tap(t.sx, t.sy); await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the helped walk', 30000).catch(() => {}); }
      }
    }
  } catch (e) { console.log('RUN ERROR: ' + (e.stack || e.message)); stats.error = e.message; }
  let final = null;
  try {
    final = await g.ev(() => {
      const H = G.hist, ids = Object.keys(G.data.words);
      return { ev: window.__LA.ev, met: window.__LA.met, hist: G.state.hist, recog: H.recognition(), retention: H.retention(), recall: H.recall(), said: H.saidAloud(), phrases: H.phraseStats(), listen: H.listen(), reviews: H.reviewDays(30), newDays: H.newDays(30),
        zoneOf: Object.fromEntries(ids.map(id => [id, G.zones.ofWord(id) || 'villa'])), stage: Object.fromEntries(ids.map(id => [id, G.words.stage(id)])), log: (G.vocabLog || []).filter(e => e.ty === 'warmup' || e.ty === 'warmup-mid' || e.ty === 'listen' || e.ty === 'defer') };
    });
  } catch (e) { console.log('final read failed: ' + e.message); }
  days.forEach(d => { d.start = starts[d.day] || null; });
  const meta = { gap: GAP, days: DAYS, session: SESSION, places: PLACES, wrong: P_WRONG, speak: P_SPEAK, nomic: NOMIC, speed: SPEED, seed: +arg('seed', 11), stats, wall: Math.round((Date.now() - t0) / 1000), errors: g.errors, date: new Date().toISOString() };
  await ctx.close(); await browser.close();
  return { meta, days, final };
}

// ---------- the numbers ----------
const PRACTICE = e => e.k !== 'C' && e.k !== 'c' && !(e.phrase && (e.k === 'P' || e.k === 'p')); // (every retrieval but the grown-ups' checks and the phrase builder's taps)
// a day's free play by what the arrow led to: seconds and moments
const freeBy = (d, free) => { const o = {}; for (const c in d.by || {}) o[c] = { sec: Math.round(d.by[c]), n: 0 }; for (const e of free) { const c = e.c || 'no arrow'; (o[c] || (o[c] = { sec: 0, n: 0 })).n++; } return o; };
const r1 = x => Math.round(x * 10) / 10;
const pctS = (a, b) => (b ? Math.round(100 * a / b) + '%' : '-');
function analyse(D) {
  const { days, final } = D, ev = (final && final.ev) || [];
  const out = { days: [], all: {} };
  const firstDay = {}; days.forEach(d => { if (firstDay[d.place] == null) firstDay[d.place] = d.day; });
  for (const d of days) {
    const E = ev.filter(e => e.day === d.day && PRACTICE(e)), min = (d.sec.story + d.sec.free) / 60;
    const story = E.filter(e => e.story), free = E.filter(e => !e.story);
    const away = {}; // a place's words used today while she's somewhere else (places met on an earlier day)
    for (const z of Object.keys(firstDay)) if (firstDay[z] < d.day && z !== d.place) away[z] = E.filter(e => !e.phrase && e.zone === z && e.here !== z).length;
    out.days.push({ day: d.day, place: d.place, speaking: d.speaking, min: r1(min), moments: E.length, perMin: r1(E.length / Math.max(1, min)), freeMin: r1(d.sec.free / 60), freePerMin: r1(free.length / Math.max(0.1, d.sec.free / 60)), storyMin: r1(d.sec.story / 60), storyPerMin: d.sec.story > 30 ? r1(story.length / (d.sec.story / 60)) : null,
      practiceShare: Math.round(100 * d.sec.practice / Math.max(1, d.sec.story + d.sec.free)), newItems: d.newItems, newStory: ((final && final.met) || []).filter(m => m.day === d.day && m.story).length, target: d.target, due: d.bd, done: d.rv, backlog: d.backlog, away, stars: d.stars, wordsMet: d.wordsMet, story: d.story || [], chStarted: d.chStarted, chOpenEnd: d.chOpenEnd, start: d.start || null, gapAfter: d.gapAfter || 0,
      split: { due: E.filter(e => e.q === 'due').length, new: E.filter(e => e.q === 'new').length, off: E.filter(e => e.q === 'off').length }, freeBy: freeBy(d, free), F: E.filter(e => e.k === 'F').length, listen: E.filter(e => e.k === 'L' || e.k === 'l').length, mid: d.wu && d.wu.m && d.wu.m.d === d.date ? d.wu.m.of | 0 : 0, warm: d.wu && d.wu.last && d.wu.last.d === d.date ? d.wu.last.of | 0 : 0, mic: d.mic });
  }
  const D2 = out.days, sum = f => D2.reduce((a, x) => a + (x[f] || 0), 0);
  const sp3 = f => D2.reduce((a, x) => a + x.split[f], 0);
  const allE = ev.filter(e => PRACTICE(e) && D2.some(d => d.day === e.day)), min = sum('min'), freeMin = sum('freeMin'), storyMin = sum('storyMin');
  out.all = {
    min: r1(min), moments: allE.length, perMin: r1(allE.length / Math.max(1, min)), freePerMin: r1(allE.filter(e => !e.story).length / Math.max(0.1, freeMin)), storyPerMin: storyMin > 0.5 ? r1(allE.filter(e => e.story).length / storyMin) : null,
    freeShare: Math.round(100 * freeMin / Math.max(1, min)), practiceShare: Math.round(D2.reduce((a, d) => a + d.practiceShare * d.min, 0) / Math.max(1, min)),
    newPerDay: r1(sum('newItems') / Math.max(1, D2.length)), newMax: Math.max(0, ...D2.map(d => d.newItems)), newStory: sum('newStory'),
    newFreeMax: Math.max(0, ...D2.map(d => d.newItems - d.newStory)),
    due: sum('due'), done: sum('done'), keptUp: D2.filter(d => d.due == null || d.done >= d.due).length, backlogOk: D2.filter(d => d.backlog <= TARGET.backlog).length, backlogEnd: D2.length ? D2[D2.length - 1].backlog : null,
    recog: final ? final.recog : null, retention: final ? final.retention : null, recall: final ? final.recall : null, said: final ? final.said : null,
    spokenRecall: allE.length ? Math.round(100 * allE.filter(e => e.k === 'F').length / allE.length) : 0, F: allE.filter(e => e.k === 'F').length,
    listen: final ? final.listen : null, listenDays: D2.filter(d => d.listen > 0).length,
    split: { due: sp3('due'), new: sp3('new'), off: sp3('off') },
  };
  const sp = out.all.split; for (const k of ['due', 'new', 'off']) sp[k + 'PerMin'] = r1(sp[k] / Math.max(1, min));
  sp.dueNewPerMin = r1((sp.due + sp.new) / Math.max(1, min));
  const freeE = allE.filter(e => !e.story); // (free play on its own, split the same way)
  sp.free = { due: freeE.filter(e => e.q === 'due').length, new: freeE.filter(e => e.q === 'new').length, off: freeE.filter(e => e.q === 'off').length };
  sp.freeDueNewPerMin = r1((sp.free.due + sp.free.new) / Math.max(0.1, freeMin));
  // free play by what the arrow led to
  const fb = {}; for (const d of D2) for (const c in d.freeBy) { const o = fb[c] || (fb[c] = { sec: 0, n: 0 }); o.sec += d.freeBy[c].sec; o.n += d.freeBy[c].n; }
  out.freeBy = fb;
  // where the child is: the play day the stars reach 52 (the child this game is for has 52 stars)
  const k52 = D2.find(d => d.stars >= 52);
  out.stars52 = k52 ? { day: k52.day } : null;
  // after a break (--gap D:N)
  const gp = D.meta.gap;
  if (gp) {
    const after = D2.filter(d => d.day > gp.d), back = after[0];
    const clear = after.find(d => d.backlog <= 10);
    out.brk = { gap: gp, before: D2.find(d => d.day === gp.d) || null, after, clearDays: clear ? clear.day - gp.d : null, clearDay: clear ? clear.day : null, firstDue: back ? (back.start ? back.start.backlog : back.due) : null };
  }
  // each place's words while away: uses on the days she was elsewhere, after its first day
  const places = {};
  for (const d of D2) for (const z in d.away) { const p = places[z] || (places[z] = { awayDays: 0, uses: 0, daysUsed: 0 }); p.awayDays++; p.uses += d.away[z]; if (d.away[z] > 0) p.daysUsed++; }
  out.places = places;
  // the targets (docs/AUDIT_2026-10.md section 5)
  const A = out.all, P = Object.values(places);
  out.targets = [
    ['Practice moments a minute in free play', A.freePerMin, '3 or more', A.freePerMin >= TARGET.freeMin],
    ['Practice moments a minute, the whole session', A.perMin, '3 or more (about half the session)', A.perMin >= TARGET.freeMin],
    ['Practice share of the session (time on questions, requests, phrases, puzzles)', A.practiceShare + '%', 'about 50%', A.practiceShare >= 40],
    ['New items a play day (average; the most in a day)', A.newPerDay + ' (max ' + A.newMax + '; ' + A.newStory + ' of ' + sum('newItems') + ' in all came in a chapter\'s beat; the most outside the story in a day: ' + A.newFreeMax + ')', 'about 2-3, 3 or fewer on average, never more than 8', A.newPerDay <= TARGET.newMax && A.newMax <= 8],
    ['Reviews done against due (all days)', A.done + ' done of ' + A.due + ' due; kept up on ' + A.keptUp + ' of ' + D2.length + ' days', 'done >= due', A.done >= A.due],
    ['Backlog left at session end', D2.map(d => d.backlog).join(', ') + ' (5 or fewer on ' + A.backlogOk + ' of ' + D2.length + ' days)', '5 or fewer on most days', A.backlogOk * 2 > D2.length],
    ['A place\'s words used while she is away', P.length ? Object.entries(places).map(([z, p]) => z + ' ' + p.daysUsed + '/' + p.awayDays + ' days (' + p.uses + ' uses)').join('; ') : 'no place left yet', 'every few days (on at least 1 in ' + TARGET.awayEvery + ' days away)', P.length > 0 && P.every(p => p.daysUsed * TARGET.awayEvery >= p.awayDays)],
    ['Listen and do', (A.listen ? A.listen.n : 0) + ' requests; on ' + A.listenDays + ' of ' + D2.length + ' days', 'some every day', A.listenDays === D2.length],
    ['Guess-adjusted recognition (lucky taps taken out)', A.recog && A.recog.pct != null ? A.recog.pct + '% (' + A.recog.right + ' of ' + A.recog.n + ' right first try, ' + A.recog.raw + '% raw; the older "retention": ' + (A.retention && A.retention.pct != null ? A.retention.pct + '%' : '-') + ')' : '-', 'reported', true],
    ['Spoken-recall share (said before any written cue, F, of all practice)', A.spokenRecall + '% (' + A.F + ' of ' + A.moments + ')', 'reported', true],
  ];
  // every measurable Sprint 2 and Sprint 3 target of the table in docs/AUDIT_2026-10.md section 5, one line each: [text, ok (null: reported)]
  const bd = out.brk, L = out.lines = [];
  const L1 = (what, num, ok) => L.push([what + ': ' + num, ok]);
  L1('Reviews done keep up with reviews due (Sprint 2)', A.done + ' of ' + A.due, A.done >= A.due);
  L1('3 or fewer new items a play day on average (Sprint 2)', A.newPerDay, A.newPerDay <= 3);
  L1('Never more than 8 new items in a day (Sprint 2)', 'most in a day ' + A.newMax, A.newMax <= 8);
  L1('A backlog of 5 or fewer at session end on most days (Sprint 2)', A.backlogOk + ' of ' + D2.length + ' days', A.backlogOk * 2 > D2.length);
  L1('Each place\'s words used every few days while she is away (Sprint 2)', P.length ? Object.entries(places).map(([z, p]) => z + ' ' + p.daysUsed + '/' + p.awayDays).join(', ') + ' days' : 'no place left yet', P.length > 0 && P.every(p => p.daysUsed * TARGET.awayEvery >= p.awayDays));
  L1('Listen and do on day 1 (Sprint 2)', (D2[0] ? D2[0].listen : 0) + ' requests on day 1', !!D2[0] && D2[0].listen > 0);
  L1('Guess-adjusted recognition reported (Sprint 2)', A.recog && A.recog.pct != null ? A.recog.pct + '%' : 'no number', null);
  L1('Spoken-recall share reported (Sprint 2)', A.spokenRecall + '%', null);
  L1('3 or more practice moments a minute, whole session (Sprint 3)', A.perMin, A.perMin >= TARGET.freeMin);
  L1('About half the session is practice (Sprint 3)', A.practiceShare + '%', A.practiceShare >= 40);
  L1('3 or more a minute counting only words that were due or new (so repeats do not count)', sp.dueNewPerMin, sp.dueNewPerMin >= TARGET.freeMin);
  L1('3 or more a minute in free play', A.freePerMin, A.freePerMin >= TARGET.freeMin);
  if (bd) L1('After a break the backlog is back to 10 or fewer within a few play days (Sprint 2)', bd.clearDays == null ? 'not in ' + bd.after.length + ' play days' : bd.clearDays + ' play day' + (bd.clearDays === 1 ? '' : 's'), bd.clearDays != null && bd.clearDays <= 3);
  return out;
}

const storyText = d => d.story.map(x => x.line + ' ' + x.last + '/' + x.of).join(', ');
// "Coming back after a break": the days after a --gap, as markdown lines (also appended to the docs by hand for a break run)
function breakSection(A, h) {
  const L = [], b = A.brk;
  if (!b) return L;
  L.push(h + ' Coming back after a break');
  L.push('');
  L.push('The child played ' + b.gap.d + ' days, then was away ' + b.gap.n + ' more days, then played again.');
  L.push('');
  const pre = b.before, back = b.after[0];
  L.push('- Reviews waiting on the first day back: ' + (b.firstDue == null ? '-' : b.firstDue) + (pre ? ' (the last day before the break ended with ' + pre.backlog + ' waiting)' : '') + '.');
  L.push('- A story chapter could open on the first day back: ' + (back && back.start ? (back.start.chOpen ? 'yes' : 'no' + (back.start.chWait ? ' (it waited for the reviews)' : '')) : '-') + '.');
  L.push('- Play days until the backlog at the end of a sitting is 10 or fewer: ' + (b.clearDays == null ? 'not within the ' + b.after.length + ' play days played' : b.clearDays + ' (play day ' + b.clearDay + ')') + '.');
  L.push('');
  L.push('| Play day back | Day | Reviews waiting at the start | Chapter could open at the start | Chapters started that day | Reviews done | Backlog at the end |');
  L.push('| --- | --- | --- | --- | --- | --- | --- |');
  b.after.forEach((d, i) => L.push('| ' + (i + 1) + ' | ' + d.day + ' | ' + (d.start ? d.start.backlog : '-') + ' | ' + (d.start ? (d.start.chOpen ? 'yes' : 'no') : '-') + ' | ' + (d.chStarted == null ? '-' : d.chStarted) + ' | ' + d.done + ' | ' + d.backlog + ' |'));
  L.push('');
  return L;
}

function report(D, A) {
  const L = [], M = D.meta, a0 = A.all, D2 = A.days, f0 = D2[0], fl = D2[D2.length - 1], ok = A.lines.filter(l => l[1] === true).length, judged = A.lines.filter(l => l[1] != null).length;
  L.push('# Open-world learning audit');
  L.push('');
  L.push('Summary: ' + D2.length + ' play days' + (M.gap ? ' (a ' + M.gap.n + '-day break after day ' + M.gap.d + ')' : '') + '. Stars went from ' + (f0 ? f0.stars : '-') + ' to ' + (fl ? fl.stars : '-') + ' and word cards from ' + (f0 ? f0.wordsMet : '-') + ' to ' + (fl ? fl.wordsMet : '-') + '. ' + (A.stars52 ? 'Stars pass 52 on play day ' + A.stars52.day + '.' : 'Stars do not reach 52 in this run.'));
  L.push('Practice came to ' + a0.perMin + ' moments a minute (' + a0.freePerMin + ' in free play); counting only due and new words it is ' + a0.split.dueNewPerMin + '. ' + ok + ' of ' + judged + ' targets PASS.');
  L.push('');
  L.push('Date: ' + M.date.slice(0, 10) + '. This measures the game BEFORE the "welcome back" rule and the free-play work.');
  L.push('');
  L.push('Generated by `tools/learning-audit.js` on ' + M.date.slice(0, 10) + ': ' + M.days + ' days of ' + (M.session / 60) + ' minutes in the open world, a place a day (' + D.days.map(d => d.place).join(', ') + '), all live features on (warm-up, phrases, listen and do, review-first pacing), a child\'s pace, ' + Math.round(M.wrong * 100) + '% wrong first taps, speaking ' + Math.round(M.speak * 100) + '% of the time' + (M.nomic ? ' (no mic every ' + M.nomic + ' days)' : '') + '. Wall time ' + Math.round(M.wall / 60) + ' min' + (M.errors.length ? '; ' + M.errors.length + ' console errors' : '') + (M.stats.error ? '; the run stopped early: ' + M.stats.error : '') + '.');
  L.push('');
  L.push('## Targets, pass or fail');
  L.push('');
  for (const [t, okk] of A.lines) L.push('- ' + t + (okk == null ? ' (reported)' : okk ? ', PASS' : ', FAIL'));
  L.push('- Not measured by this bot: the 3-year simulation numbers (tools/sim-3year.js), a child who never speaks reaching gold and solid, cards grown before the switch, 3 questions between map actions, music on every map, the evening in 15 minutes.');
  L.push('');
  L.push('## Where she is, play day by play day');
  L.push('');
  L.push('The last column is the furthest chapter done in each story line (done of all in that line).');
  L.push('');
  L.push('| Day | Stars | Word cards (words met) | Furthest chapter done |');
  L.push('| --- | --- | --- | --- |');
  for (const d of D2) L.push('| ' + d.day + ' | ' + d.stars + ' | ' + d.wordsMet + ' | ' + storyText(d) + ' |');
  L.push('');
  L.push(A.stars52 ? 'Stars pass 52 on play day ' + A.stars52.day + '.' : 'Stars do not reach 52 in ' + D2.length + ' play days (' + (fl ? fl.stars : '-') + ' at the end).');
  L.push('');
  L.push('## Practice moments: due, new, or not due');
  L.push('');
  L.push('A moment counts as "due" if the word was due for review when she answered, "new" if she met it today, "not due" if it was neither (a word asked again too soon).');
  L.push('');
  L.push('| Day | Due | New | Not due | Total | Due + new a minute | Minutes |');
  L.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const d of D2) L.push('| ' + d.day + ' | ' + d.split.due + ' | ' + d.split.new + ' | ' + d.split.off + ' | ' + d.moments + ' | ' + r1((d.split.due + d.split.new) / Math.max(1, d.min)) + ' | ' + d.min + ' |');
  const sp = a0.split;
  L.push('| All | ' + sp.due + ' | ' + sp.new + ' | ' + sp.off + ' | ' + a0.moments + ' | ' + sp.dueNewPerMin + ' | ' + a0.min + ' |');
  L.push('');
  L.push('A minute, overall: ' + a0.perMin + ' moments (due ' + sp.duePerMin + ', new ' + sp.newPerMin + ', not due ' + sp.offPerMin + '). In free play: ' + a0.freePerMin + ' moments a minute (due ' + sp.free.due + ', new ' + sp.free.new + ', not due ' + sp.free.off + '; due and new together ' + sp.freeDueNewPerMin + ' a minute).');
  L.push('');
  L.push('## Free play, by what the arrow led to');
  L.push('');
  L.push('| The arrow led to | Seconds | Practice moments | Moments a minute |');
  L.push('| --- | --- | --- | --- |');
  for (const [c, o] of Object.entries(A.freeBy).sort((x, y) => y[1].sec - x[1].sec)) L.push('| ' + c + ' | ' + o.sec + ' | ' + o.n + ' | ' + (o.sec >= 20 ? r1(o.n / (o.sec / 60)) : '-') + ' |');
  L.push('');
  L.push(...breakSection(A, '##'));
  L.push('## Against the targets');
  L.push('');
  L.push('| What | Measured | Target | |');
  L.push('| --- | --- | --- | --- |');
  for (const [w, m, t, ok] of A.targets) L.push('| ' + w + ' | ' + m + ' | ' + t + ' | ' + (t === 'reported' ? '' : ok ? 'PASS' : 'FAIL') + ' |');
  L.push('');
  L.push('## Day by day');
  L.push('');
  L.push('| Day | Place | Mic | Minutes (free / story) | Practice a min (free / story) | Practice share | New: in all (story; target) | Due / done / left | Said first (F) | Listen & do | Warm-up + mid | Words of other places |');
  L.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const d of A.days) L.push('| ' + d.day + ' | ' + d.place + ' | ' + (d.speaking ? 'yes' : 'no') + ' | ' + d.min + ' (' + d.freeMin + ' / ' + d.storyMin + ') | ' + d.perMin + ' (' + d.freePerMin + ' / ' + (d.storyPerMin == null ? '-' : d.storyPerMin) + ') | ' + d.practiceShare + '% | ' + d.newItems + ' (' + d.newStory + '; ' + d.target + ') | ' + (d.due == null ? '-' : d.due) + ' / ' + d.done + ' / ' + d.backlog + ' | ' + d.F + ' | ' + d.listen + ' | ' + d.warm + ' + ' + d.mid + ' | ' + (Object.keys(d.away).length ? Object.entries(d.away).map(([z, n]) => z + ' ' + n).join(', ') : '-') + ' |');
  L.push('');
  const a = A.all;
  L.push('In all: ' + a.moments + ' practice moments in ' + a.min + ' minutes (' + a.perMin + ' a minute; free play ' + a.freePerMin + ', story ' + (a.storyPerMin == null ? '-' : a.storyPerMin) + '; free play was ' + a.freeShare + '% of the time). Recall from memory: ' + (a.recall ? a.recall.n + ' word-days (' + a.recall.f + ' said first, ' + a.recall.v + ' from pictures alone)' : '-') + '. Said aloud: ' + (a.said ? a.said.said + ' of ' + a.said.of + ' word-days practised' : '-') + '. Bot: ' + JSON.stringify(M.stats) + '.');
  L.push('');
  L.push('Free play split three ways, per day, and the arrow table per day are in the JSON dump (`days[].split`, `days[].freeBy`).');
  L.push('');
  L.push('Practice moments are the learning history\'s retrievals (src/history.js: a pick, a recall, a said word, each word of a spoken request, a page puzzle\'s pairs), the grown-ups\' checks and the phrase builder\'s taps apart; "story" is time inside a chapter\'s beat (G.chapters.running), "free play" the rest. Minutes include a child\'s reading and thinking time.');
  return L.join('\n') + '\n';
}

(async () => {
  let D;
  if (arg('from')) D = JSON.parse(fs.readFileSync(arg('from'), 'utf8'));
  else D = await play();
  fs.mkdirSync(OUTDIR, { recursive: true });
  const dump = path.join(OUTDIR, 'learning-audit.json');
  if (!arg('from')) fs.writeFileSync(dump, JSON.stringify(D));
  const A = analyse(D), text = report(D, A);
  const md = WRITE_DOCS ? path.join(ROOT, 'docs', 'LEARNING_AUDIT.md') : path.join(OUTDIR, 'learning-audit.md');
  fs.writeFileSync(md, text);
  console.log('\n' + text);
  console.log('report: ' + md + (arg('from') ? '' : '\ndump: ' + dump));
  if (D.meta.errors.length) { console.log('console errors:\n' + D.meta.errors.join('\n')); process.exitCode = 1; }
})().catch(e => { console.log('FAIL: ' + (e.stack || e.message)); process.exit(1); });
