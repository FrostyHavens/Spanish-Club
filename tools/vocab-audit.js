// Vocabulary-flow audit: plays the WHOLE game by taps (tools/playflow.js, the same play as tools/test-playthrough.js)
// with the dev-only word log on (src/vocablog.js: G.vocabLog = []), then measures how every word flows past the child:
// when and how it first appears, when it is first used, how often it comes back, the gaps, which errands and play
// sessions it lives in, and where too many new words arrive at once.
//   NODE_PATH=$(npm root -g) node tools/vocab-audit.js [--speak 0.35] [--wrong 0.12] [--pages 8] [--seed 7] [--out dump.json]
//   node tools/vocab-audit.js --from dump.json        (analyse a saved run again, no browser)
// A child's pace is modelled on top of the game's own frames (G.vlog.pace, which also moves the day's clock): time to
// listen to each line, to think at each question, to look at a card or a new notebook page. Walking is real game time.
// With --speak p, a fake speech recognizer (as in tools/test-speaking.js) lets the child SAY the answer at a share p of the
// questions that have a mic (and the new word on a "¡Palabra nueva!" card at p * 0.6); with --wrong p a share of
// picture-card questions get one wrong tap first; with --pages n (0: never) the child also goes for a notebook page's
// sparkle when it is on screen within n tiles (the hint hand never points at pages, but sparkles draw children in).
// Writes docs/VOCAB_AUDIT.md (only the part between the AUDIT markers: findings written above or below them stay),
// docs/vocab-timeline.svg and the JSON dump (default: the scratchpad, else the OS temp dir).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');

const ARGS = process.argv.slice(2);
const arg = (k, d) => { const i = ARGS.indexOf('--' + k); return i >= 0 ? ARGS[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..');
const SCRATCH = '/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad';
const OUTDIR = fs.existsSync(SCRATCH) ? SCRATCH : os.tmpdir();
const DUMP = path.resolve(arg('out', path.join(OUTDIR, 'vocab-audit.json')));
const REPORT = path.join(ROOT, 'docs', 'VOCAB_AUDIT.md'), SVG = path.join(ROOT, 'docs', 'vocab-timeline.svg');
const SESSION = 15 * 60;   // a play session, in game seconds
const OVERLOAD = { win: 5 * 60, n: 8 }; // more than n new words inside win seconds is an overload moment
const BURST = { win: 30, n: 5 };        // n or more new words inside win seconds is a burst
const STEP_PACE = 2.5;                  // seconds a child takes to look around and choose where to go, at each tap on the map

// ======================================================================================================
//  1. Play (in the browser)
// ======================================================================================================
function FAKE() { // a scripted SpeechRecognition: each start() takes the next reply from window.__sr.queue
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

async function play() {
  const { open, check, launch } = require('./harness');
  const { newGame, playToEnd } = require('./playflow');
  const P_SPEAK = +arg('speak', 0.35), P_WRONG = +arg('wrong', 0.12), R = rng(+arg('seed', 7));
  const browser = await launch();
  const { ctx, g } = await open(browser, 'vocab', true);
  const stats = { spoken: 0, spokenCard: 0, wrongTaps: 0 };
  try {
    if (P_SPEAK > 0) {
      await ctx.addInitScript(FAKE);
      await g.page.reload();
      await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
    }
    await g.ev(() => { G.vocabLog = []; G.vlog.mark('start'); });
    const pace = s => g.ev(s => G.vlog.pace(s), s);
    // tell the fake recognizer what the child says, tap the mic, and wait for the scene to take it
    const sayIt = async (text, done) => {
      await g.ev(t => window.__sr.queue.push({ results: [[t, 0.95]], delay: 400 }), text);
      await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
      try { await g.until(done, null, 'the spoken answer', 6000); return true; } catch (e) { return false; }
    };
    // a child's pace and choices, before Game.drive's own move (true: the move was made here)
    g.beforeAct = async s => {
      const info = await g.ev(() => {
        const t = G.top(); if (!t) return null;
        const v = t.__va || (t.__va = {});
        const n = t.constructor.name, o = { n, v, t: t.t };
        if (n === 'TextBox') { o.text = G.plain(t.pages[t.pi].t); o.pi = t.pi; o.rev = t.shown >= t.chars(0, t.scroll + 3); }
        if (n === 'Choice') {
          o.prompt = G.plain(t.o.prompt || ''); o.nc = t.ch.length; o.won = !!t.won; o.mic = !!(t.mic && t.mic.shown() && t.mic.can());
          o.ask = !!t.o.onWrong && t.o.answer != null; o.cards = t.cards;
          const a = t.ch[t.o.answer]; o.say = a && a.word ? (G.mic.target(a) || '').split(' / ')[0].replace(/^(el|la|los|las) /, '') : null;
          o.wrong = t.ch.map((c, k) => k !== t.o.answer && !c.off ? k : -1).filter(k => k >= 0);
          o.rects = t.rects();
        }
        if (n === 'WordCard') { o.mic = !!(t.mic && t.mic.can()); o.word = G.baseForm(t.ids[t.i]); o.i = t.i; }
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
          if (info.v.decided) return false;
          await mark({ decided: 1 });
          if (info.ask && info.cards && info.wrong.length && R() < P_WRONG) { // a wrong tap first
            const k = info.wrong[Math.floor(R() * info.wrong.length)];
            await g.tapRect(info.rects[k]); stats.wrongTaps++;
            await g.until(k => G.top().constructor.name !== 'Choice' || G.top().ch[k].off, k, 'the wrong card to grey out');
            await g.frames(12); await pace(1.5);
            return true;
          }
          if (P_SPEAK > 0 && info.mic && info.say && R() < P_SPEAK) {
            await pace(2);
            if (await sayIt(info.say, () => G.top().constructor.name !== 'Choice' || !!G.top().won)) { stats.spoken++; return true; }
          }
          return false;
        }
        case 'WordCard':
          if (info.t <= 20 || info.v.paced === info.i) return false;
          await mark({ paced: info.i }); await pace(3);
          if (P_SPEAK > 0 && info.mic && R() < P_SPEAK * 0.6) { await pace(2); if (await sayIt(info.word, () => G.top().constructor.name !== 'WordCard' || G.top().mic.done)) stats.spokenCard++; }
          return false;
        case 'QuestCard': case 'BadgeCard': case 'FriendCard': case 'Photo':
          if (!info.v.paced) { await mark({ paced: 1 }); await pace(2); }
          return false;
        case 'Notebook': // a page just found: a look at its pictures
          if (!info.v.paced) { await mark({ paced: 1 }); await pace(5); }
          return false;
        default: return false;
      }
    };
    let evenings = 0;
    g.hooks = { scene: async n => { if (n === 'TodayCard' && await g.ev(() => !G.top().__marked && (G.top().__marked = 1))) { evenings++; await g.ev(() => G.vlog.mark('evening')); } } };
    await newGame(g);
    // a child goes for a notebook page's sparkle when it's close by (the hint hand never points at pages)
    const PAGE_NEAR = +arg('pages', 8);
    let pagesTaken = 0; const tries = {};
    await playToEnd(g, { beforeStep: async () => {
      await pace(STEP_PACE); // looking around and choosing where to go next
      if (!PAGE_NEAR) return;
      const t = await g.ev(near => {
        const f = G.field, p = f.player, T = G.TILE, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
        let best = null;
        for (const k in f.def.pages || {}) {
          if (G.st.hasPage(f.def.pages[k])) continue;
          const [x, y] = k.split(',').map(Number), d = Math.abs(x - p.x) + Math.abs(y - p.y);
          const on = x * T >= cx && (x + 1) * T <= cx + G.W && y * T >= cy + 32 && (y + 1) * T <= cy + G.H;
          if (d <= near && on && (!best || d < best.d)) best = { d, sx: x * T + 12 - cx, sy: y * T + 12 - cy, page: f.def.pages[k] };
        }
        return best;
      }, PAGE_NEAR);
      if (!t || (tries[t.page] = (tries[t.page] | 0) + 1) > 3) return; // (three tries each: a page out of reach is left)
      console.log('    page sparkle: ' + t.page);
      await g.tap(t.sx, t.sy);
      await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk to a page', 30000);
      if (await g.ev(p => G.st.hasPage(p), t.page)) pagesTaken++;
      return 'skip';
    } });
    stats.pages = pagesTaken;
    check('vocab: every errand done', await g.ev(() => G.data.badgeOrder.every(G.st.done)));
    const out = await g.ev(() => ({
      log: G.vocabLog, end: G.vlog.time(),
      words: Object.keys(G.data.words).map(id => ({ id, es: G.data.words[id].es, topic: G.data.words[id].topic })),
      pages: G.data.pages, quests: Object.keys(G.data.quests).map(id => ({ id, name: G.data.quests[id].name, giver: G.data.quests[id].giver })),
      state: { words: G.state.words, stars: G.state.stars },
    }));
    out.meta = { speak: P_SPEAK, wrong: P_WRONG, seed: +arg('seed', 7), stats, evenings, date: new Date().toISOString(), errors: g.errors };
    check('vocab: no console errors', !g.errors.length, g.errors.join('\n'));
    return out;
  } finally { await ctx.close(); await browser.close(); }
}

// ======================================================================================================
//  2. Analyse
// ======================================================================================================
const PASSIVE = ['shown', 'heard', 'page', 'tapped-object', 'choice-shown'];
const ACTIVE = ['recognized', 'said'];
const FLAG_Q = { compra: 'mercado', pepeSiNo: 'mercado', pelotaRoja: 'pelota', cartaDada: 'carta', intro: 'intro', petStart: 'canelo-dog', canelo: 'canelo-dog', e_picked: 'flores', e_gold: 'side', albumFull: 'album' };
const LABEL = { intro: 'Mamá\'s intro', 'canelo-dog': 'Canelo becomes yours', tricks: 'teaching Canelo', page: 'finding a page', side: 'side jobs', greeting: 'greetings', shop: 'shops & presents', hearts: 'hearts', explore: 'exploring (tap-anything)', other: 'other', evening: 'the evening at home' };
const fmt = s => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const mins = s => (s / 60).toFixed(1);
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

function analyse(D) {
  const L = D.log.slice().sort((a, b) => a.t - b.t);
  const qName = {}; D.quests.forEach(q => { qName[q.id] = q.name; });
  const isQuest = id => !!qName[id];
  const es = {}; D.words.forEach(w => { es[w.id] = w.es; });
  const END = D.end;

  // ---- episodes -> what they were about ----
  const epCh = {}; L.filter(e => e.ty === 'ep').forEach(e => { epCh[e.ep] = e.ch || {}; });
  const epEvents = {}; L.filter(e => e.w).forEach(e => { (epEvents[e.ep] = epEvents[e.ep] || []).push(e); });
  const epLabel = {};
  const labelOf = ep => {
    if (epLabel[ep]) return epLabel[ep];
    const ch = epCh[ep] || {}, evs = epEvents[ep] || [];
    let lab = null;
    if (ch.q) lab = Object.keys(ch.q)[0];
    if (!lab && ch.f) for (const k of ch.f) { const m = /^e_(\w+)$/.exec(k); const q = m && isQuest(m[1]) ? m[1] : /^sal_/.test(k) ? 'saludos' : FLAG_Q[k]; if (q) { lab = q; break; } }
    if (!lab && ch.s) lab = 'pelota';
    if (!lab && ch.pet) lab = 'tricks';
    if (!lab && ch.pg) lab = 'page';
    if (!lab && ch.jobs) lab = 'side';
    if (!lab && ch.bag) lab = 'shop';
    if (!lab && evs.length && evs.every(e => e.g)) lab = 'greeting';
    if (!lab && ch.h) lab = 'hearts';
    if (!lab && evs.some(e => e.ty === 'tapped-object')) lab = 'explore';
    return (epLabel[ep] = lab || 'other');
  };
  const marks = L.filter(e => e.ty === 'mark');
  const evenings = marks.filter(m => m.label === 'evening').map(m => m.t);
  // the evening episode (Hoy card, night) is labelled as such
  const ctxOf = e => (e.g ? 'greeting' : evenings.some(t => Math.abs(t - e.t) < 20) && e.map === 'casa' && !isQuest(labelOf(e.ep)) ? 'evening' : labelOf(e.ep));
  const sessOf = t => Math.floor(t / SESSION);

  // ---- quests: when they ran ----
  const qStart = {}, qDone = {};
  L.filter(e => e.ty === 'quest').forEach(e => { if (e.st === 'start' && qStart[e.q] == null) qStart[e.q] = e.t; if (e.st === 'done') qDone[e.q] = e.t; });

  // ---- per word ----
  const wordEv = {}; D.words.forEach(w => { wordEv[w.id] = []; });
  L.filter(e => e.w && wordEv[e.w]).forEach(e => wordEv[e.w].push(e));
  const W = {};
  for (const w of D.words) {
    const ev = wordEv[w.id], expo = ev.filter(e => PASSIVE.includes(e.ty) || ACTIVE.includes(e.ty));
    const r = W[w.id] = { id: w.id, es: w.es, topic: w.topic, events: ev.length };
    if (!expo.length) { r.never = true; continue; }
    const first = expo[0];
    // how it first came: the first event in that same moment that says where (a page beats the voice reading it)
    const firstHow = expo.filter(e => e.t - first.t < 0.5).map(e => e.ty === 'shown' ? (e.via || 'shown') : e.ty)[0];
    r.first = first.t; r.firstHow = firstHow; r.firstCtx = ctxOf(first); r.firstEp = first.ep; r.firstSess = sessOf(first.t);
    const act = ev.filter(e => ACTIVE.includes(e.ty));
    r.recognized = ev.filter(e => e.ty === 'recognized').length;
    r.said = ev.filter(e => e.ty === 'said').length;
    r.wrong = ev.filter(e => e.ty === 'wrong').length;
    r.active = act.length;
    // cue: echo (the answer is in the prompt), match (the prompt's picture is the answer), else meaning
    r.cued = ev.filter(e => e.ty === 'recognized' && (e.prompt || e.show)).length;
    r.firstActive = act.length ? act[0].t : null;
    r.toActive = act.length ? act[0].t - r.first : null;
    r.exposures = ev.filter(e => PASSIVE.includes(e.ty)).length;
    // encounters: distinct episodes that touched it (any event)
    const eps = []; const seenEp = new Set();
    for (const e of ev) if (!seenEp.has(e.ep)) { seenEp.add(e.ep); eps.push({ ep: e.ep, t: e.t, ctx: ctxOf(e) }); }
    r.encounters = eps.length;
    const gaps = []; for (let i = 1; i < eps.length; i++) gaps.push(eps[i].t - eps[i - 1].t);
    r.avgGap = gaps.length ? avg(gaps) : null; r.maxGap = gaps.length ? Math.max(...gaps) : null;
    r.last = ev[ev.length - 1].t;
    r.endGap = END - r.last;
    r.ctxs = [...new Set(eps.map(e => e.ctx))];
    r.errands = r.ctxs.filter(isQuest);
    r.sessions = [...new Set(ev.map(e => sessOf(e.t)))].length;
    const learned = ev.find(e => e.ty === 'learned'); r.learned = learned ? learned.t : null;
    if (learned) {
      // what learned it: its own answer or saying it (within the same episode), or the answer to ANOTHER word's question
      const own = ev.filter(e => ACTIVE.includes(e.ty) && e.ep === learned.ep && e.t <= learned.t + 0.01);
      const otherAct = L.filter(e => e.ep === learned.ep && ACTIVE.includes(e.ty) && e.w !== w.id && e.t <= learned.t + 0.01);
      r.learnedBy = own.length ? (own[own.length - 1].ty === 'said' ? 'said' : 'answer') : otherAct.length ? 'co-learned with ' + otherAct[otherAct.length - 1].w : 'other';
      r.afterLearn = new Set(ev.filter(e => e.t > learned.t + 2 && e.ep !== learned.ep).map(e => e.ep)).size;
    }
    // recalled after the errand (or moment) that introduced it: an active use in another context, after that one ended
    const introEnd = isQuest(r.firstCtx) && qDone[r.firstCtx] != null ? qDone[r.firstCtx] : first.t + 1;
    r.recalledAfter = act.some(e => e.t > introEnd && ctxOf(e) !== r.firstCtx);
  }

  // ---- per context (errand) ----
  const ctxList = {};
  const firstOf = {}; for (const id in W) if (!W[id].never) firstOf[id] = W[id];
  for (const e of L.filter(e => e.w)) {
    const c = ctxOf(e), C = ctxList[c] || (ctxList[c] = { id: c, words: new Set(), news: new Set(), learned: new Set(), active: 0, cued: 0, wrong: 0, events: 0, t0: e.t, t1: e.t, eps: new Set() });
    C.words.add(e.w); C.events++; C.t1 = Math.max(C.t1, e.t); C.eps.add(e.ep);
    if (W[e.w].firstEp === e.ep && W[e.w].first === e.t) C.news.add(e.w);
    if (ACTIVE.includes(e.ty)) C.active++;
    if (e.ty === 'recognized' && (e.prompt || e.show)) C.cued++;
    if (e.ty === 'wrong') C.wrong++;
    if (e.ty === 'learned') C.learned.add(e.w);
  }
  for (const C of Object.values(ctxList)) {
    for (const id of C.words) if (W[id].firstCtx === C.id) C.news.add(id);
    C.reviewed = [...C.words].filter(id => !C.news.has(id) && W[id].first < (isQuest(C.id) && qStart[C.id] != null ? qStart[C.id] : C.t0));
    C.reviewedActive = new Set(L.filter(e => e.w && ACTIVE.includes(e.ty) && ctxOf(e) === C.id && C.reviewed.includes(e.w)).map(e => e.w)).size;
    C.start = qStart[C.id]; C.done = qDone[C.id];
  }

  // ---- per session (15 min of game time) ----
  const nS = Math.max(1, Math.ceil(END / SESSION));
  const sessions = [];
  for (let s = 0; s < nS; s++) {
    const a = s * SESSION, b = a + SESSION, ev = L.filter(e => e.w && e.t >= a && e.t < b);
    const news = Object.values(firstOf).filter(r => r.first >= a && r.first < b);
    sessions.push({ s: s + 1, from: a, to: Math.min(b, END), news: news.length, newFromPages: news.filter(r => r.firstHow === 'page').length,
      learned: ev.filter(e => e.ty === 'learned').length, recognized: ev.filter(e => e.ty === 'recognized').length, said: ev.filter(e => e.ty === 'said').length,
      wrong: ev.filter(e => e.ty === 'wrong').length, words: new Set(ev.map(e => e.w)).size,
      reviewed: new Set(ev.filter(e => ACTIVE.includes(e.ty) && W[e.w].first < a).map(e => e.w)).size,
      errands: [...new Set(L.filter(e => e.ty === 'quest' && e.st === 'done' && e.t >= a && e.t < b).map(e => e.q))] });
  }

  // ---- timeline (per minute) ----
  const nM = Math.ceil(END / 60), minute = [];
  for (let m = 0; m < nM; m++) {
    const a = m * 60, b = a + 60, ev = L.filter(e => e.w && e.t >= a && e.t < b);
    minute.push({ m, news: Object.values(firstOf).filter(r => r.first >= a && r.first < b).length,
      learned: ev.filter(e => e.ty === 'learned').length, active: ev.filter(e => ACTIVE.includes(e.ty)).length,
      seenTot: Object.values(firstOf).filter(r => r.first < b).length, learnedTot: Object.values(W).filter(r => r.learned != null && r.learned < b).length,
      ctx: [...new Set(ev.map(ctxOf))] });
  }

  // ---- problems ----
  const words = Object.values(W).filter(r => !r.never);
  const P = {};
  // bursts: >= BURST.n first exposures within BURST.win seconds
  const firsts = words.slice().sort((a, b) => a.first - b.first);
  const bursts = [];
  for (let i = 0; i < firsts.length;) {
    let j = i; while (j + 1 < firsts.length && firsts[j + 1].first - firsts[i].first <= BURST.win) j++;
    if (j - i + 1 >= BURST.n) { const grp = firsts.slice(i, j + 1); bursts.push({ t: grp[0].first, n: grp.length, how: [...new Set(grp.map(r => r.firstHow))], ctx: [...new Set(grp.map(r => r.firstCtx))], words: grp.map(r => r.id), activeIn5: grp.filter(r => r.firstActive != null && r.firstActive - r.first <= 300).length }); i = j + 1; }
    else i++;
  }
  P.bursts = bursts;
  // overload: the busiest windows of OVERLOAD.win seconds
  const over = [];
  for (const r of firsts) { const n = firsts.filter(q => q.first >= r.first && q.first < r.first + OVERLOAD.win).length; over.push({ t: r.first, n }); }
  over.sort((a, b) => b.n - a.n);
  const peaks = []; for (const o of over) if (o.n > OVERLOAD.n && !peaks.some(p => Math.abs(p.t - o.t) < OVERLOAD.win)) peaks.push(o);
  P.overload = peaks.sort((a, b) => a.t - b.t).map(p => Object.assign(p, { words: firsts.filter(q => q.first >= p.t && q.first < p.t + OVERLOAD.win).map(q => q.id) }));
  P.maxIn5 = over.length ? over[0].n : 0;
  P.pageFirst = words.filter(r => r.firstHow === 'page');
  P.pageNoUse5 = P.pageFirst.filter(r => r.firstActive == null || r.firstActive - r.first > 300);
  P.onceOnly = words.filter(r => r.encounters <= 1);
  P.fewTouches = words.filter(r => r.encounters <= 3);
  P.neverActive = words.filter(r => !r.active);
  P.onlyCued = words.filter(r => r.active && r.recognized === r.cued && !r.said);
  P.longGap = words.filter(r => r.maxGap != null && r.maxGap > SESSION).sort((a, b) => b.maxGap - a.maxGap);
  P.notRecalled = words.filter(r => !r.recalledAfter);
  P.coLearned = words.filter(r => r.learnedBy && /^co-learned|^other/.test(r.learnedBy));
  P.notLearned = words.filter(r => r.learned == null);
  P.noReviewAfterLearn = words.filter(r => r.learned != null && !r.afterLearn);
  P.lateFade = words.filter(r => r.endGap > 2 * SESSION);
  P.never = Object.values(W).filter(r => r.never);
  return { W, ctx: ctxList, sessions, minute, P, qStart, qDone, qName, END, L, evenings, isQuest };
}

// ======================================================================================================
//  3. Report
// ======================================================================================================
function svgChart(A) {
  // two panels on one time axis: cumulative words met / learned (top), new words per minute (bottom, its own scale)
  const M = A.minute, w = 760, pl = 46, pr = 104, iw = w - pl - pr, top = 34, ih = 190, gap = 34, bh = 80, h = top + ih + gap + bh + 40;
  const tot = Math.ceil(Object.keys(A.W).length / 20) * 20, X = m => pl + m / Math.max(1, M.length) * iw, Y = v => top + ih - v / tot * ih;
  const b0 = top + ih + gap, maxNew = Math.max(5, ...M.map(m => m.news)), bstep = maxNew > 20 ? 10 : 5, bmax = Math.ceil(maxNew / bstep) * bstep, YB = v => b0 + bh - v / bmax * bh;
  const line = k => M.map((m, i) => (i ? 'L' : 'M') + X(i + 1).toFixed(1) + ' ' + Y(m[k]).toFixed(1)).join(' ');
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="11">\n`;
  s += `<title>Vocabulary over play time: words met and learned (top), new words per minute (bottom)</title>\n<rect width="${w}" height="${h}" fill="#fcfcfb"/>\n`;
  for (let v = 0; v <= tot; v += 20) s += `<line x1="${pl}" x2="${pl + iw}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e4e3df"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" fill="#52514e">${v}</text>\n`;
  for (let v = 0; v <= bmax; v += bstep) s += `<line x1="${pl}" x2="${pl + iw}" y1="${YB(v)}" y2="${YB(v)}" stroke="#e4e3df"/><text x="${pl - 6}" y="${YB(v) + 4}" text-anchor="end" fill="#52514e">${v}</text>\n`;
  s += `<text x="${pl}" y="${b0 - 8}" fill="#0b0b0b">New words met in each minute</text>\n`;
  const vline = (x, col, dash, label, ly) => `<line x1="${x}" x2="${x}" y1="${top}" y2="${b0 + bh}" stroke="${col}" ${dash ? 'stroke-dasharray="3 3"' : 'stroke-width="1.5"'}/><text x="${x + 3}" y="${ly}" fill="${col}">${label}</text>\n`;
  for (let k = 1; k * SESSION / 60 < M.length; k++) s += vline(X(k * SESSION / 60), '#8a8984', true, 'session ' + (k + 1), top + ih - 6);
  for (const t of A.evenings) s += vline(X(t / 60), '#4a3aa7', false, 'evening', top + ih - 20);
  M.forEach((m, i) => { if (!m.news) return; const x0 = X(i) + 1, bw = Math.max(1, X(i + 1) - X(i) - 2); s += `<rect x="${x0.toFixed(1)}" y="${YB(m.news).toFixed(1)}" width="${bw.toFixed(1)}" height="${(b0 + bh - YB(m.news)).toFixed(1)}" rx="1" fill="#eb6834"><title>minute ${i}-${i + 1}: ${m.news} new word${m.news > 1 ? 's' : ''}</title></rect>\n`; });
  s += `<path d="${line('seenTot')}" fill="none" stroke="#2a78d6" stroke-width="2"/>\n<path d="${line('learnedTot')}" fill="none" stroke="#1baf7a" stroke-width="2"/>\n`;
  const lastM = M[M.length - 1];
  s += `<text x="${X(M.length) + 6}" y="${Y(lastM.seenTot) + 4}" fill="#0b0b0b">met: ${lastM.seenTot}</text><text x="${X(M.length) + 6}" y="${Y(lastM.learnedTot) + 4}" fill="#0b0b0b">learned: ${lastM.learnedTot}</text>\n`;
  s += `<line x1="${pl}" x2="${pl + iw}" y1="${top + ih}" y2="${top + ih}" stroke="#52514e"/><line x1="${pl}" x2="${pl + iw}" y1="${b0 + bh}" y2="${b0 + bh}" stroke="#52514e"/>\n`;
  for (let m = 0; m <= M.length; m += 10) s += `<text x="${X(m)}" y="${b0 + bh + 14}" text-anchor="middle" fill="#52514e">${m}</text>\n`;
  s += `<text x="${pl + iw / 2}" y="${h - 8}" text-anchor="middle" fill="#52514e">game minutes (paced like a child)</text>\n`;
  [['#2a78d6', 'words met (cumulative)'], ['#1baf7a', 'words learned (cumulative)']].forEach(([c, t], i) => { s += `<rect x="${pl + i * 190}" y="8" width="10" height="10" rx="2" fill="${c}"/><text x="${pl + 14 + i * 190}" y="17" fill="#0b0b0b">${t}</text>\n`; });
  return s + '</svg>\n';
}

function report(A, D) {
  const { W, P } = A, words = Object.values(W).filter(r => !r.never), N = Object.keys(W).length;
  const ctxName = c => A.qName[c] ? A.qName[c] + ' (`' + c + '`)' : LABEL[c] || c;
  const wl = (rs, n = 99, f = r => (typeof r === 'string' ? r : r.id)) => !rs.length ? 'none' : rs.slice(0, n).map(f).join(', ') + (rs.length > n ? ', … (+' + (rs.length - n) + ')' : '');
  const totalAct = words.reduce((a, r) => a + r.active, 0), totalRec = words.reduce((a, r) => a + r.recognized, 0), totalSaid = words.reduce((a, r) => a + r.said, 0), totalCued = words.reduce((a, r) => a + r.cued, 0);
  const howCount = {}; words.forEach(r => { howCount[r.firstHow] = (howCount[r.firstHow] || 0) + 1; });
  const o = [];
  o.push('<!-- AUDIT:BEGIN (generated by tools/vocab-audit.js; edit outside these markers) -->');
  o.push('## Run');
  o.push(`One full tap playthrough (tools/playflow.js), ${D.meta.date.slice(0, 10)}: every Round A and Round B errand, the animal party and the diploma. ` +
    `Speaking: ${Math.round(D.meta.speak * 100)}% of mic questions answered by voice (${D.meta.stats.spoken} answers + ${D.meta.stats.spokenCard} new-word cards); ` +
    `${Math.round(D.meta.wrong * 100)}% of picture-card questions got one wrong tap first (${D.meta.stats.wrongTaps}); notebook-page sparkles picked up when on screen within 8 tiles (${new Set(A.L.filter(e => e.ty === 'page').map(e => e.page)).size} of ${Object.keys(D.pages).length} pages found in all: ${[...new Set(A.L.filter(e => e.ty === 'page').map(e => e.page))].join(', ')}); seed ${D.meta.seed}. ` +
    `Game time ${fmt(A.END)} (${mins(A.END)} min) with a child's pace added for reading, listening, thinking and looking; ${A.sessions.length} sessions of 15 min; ${D.meta.evenings} evening(s) at home.`);
  o.push('');
  o.push('## Headline numbers');
  o.push('| | |\n| --- | --- |');
  o.push(`| Words in the game | ${N} |`);
  o.push(`| Met at least once / learned by the end | ${words.length} / ${words.filter(r => r.learned != null).length} |`);
  o.push(`| First met via | ${Object.entries(howCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', ')} |`);
  o.push(`| Active retrievals (picked right + said) | ${totalAct} (${totalRec} picked, ${totalSaid} said); ${pct(totalCued, totalRec)} of the picks were cued (the answer was in the prompt's text or picture) |`);
  o.push(`| Median time from first meeting to first use | ${fmt(median(words.filter(r => r.toActive != null).map(r => r.toActive)))} |`);
  o.push(`| Median encounters per word (distinct moments) | ${median(words.map(r => r.encounters))} (min ${Math.min(...words.map(r => r.encounters))}, max ${Math.max(...words.map(r => r.encounters))}) |`);
  o.push(`| Median active retrievals per word | ${median(words.map(r => r.active))} |`);
  o.push(`| Most new words in any 5 minutes | ${P.maxIn5} |`);
  o.push('');
  o.push('![Words met and learned over game time](vocab-timeline.svg)');
  o.push('');
  o.push('## Problems (measured)');
  o.push(`- **Bursts** (${BURST.n}+ new words within ${BURST.win} s): ${P.bursts.length}. ` + P.bursts.map(b => `${fmt(b.t)} ${b.n} words via ${b.how.join('/')} in ${b.ctx.map(ctxName).join(', ')} (${b.activeIn5} used within 5 min)`).join('; ') + '.');
  o.push(`- **Notebook pages as the first meeting**: ${P.pageFirst.length} words; ${P.pageNoUse5.length} of them not used within 5 minutes: ${wl(P.pageNoUse5)}.`);
  o.push(`- **Overload moments** (more than ${OVERLOAD.n} new words in 5 minutes): ${P.overload.length}. ` + P.overload.map(p => `${fmt(p.t)}: ${p.n} (${wl(p.words, 12)})`).join('; ') + '.');
  o.push(`- **Never actively retrieved** (never picked right or said): ${P.neverActive.length}: ${wl(P.neverActive)}.`);
  o.push(`- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): ${P.onlyCued.length}: ${wl(P.onlyCued)}.`);
  o.push(`- **Met once and never again** (one moment only): ${P.onceOnly.length}: ${wl(P.onceOnly)}. Three moments or fewer: ${P.fewTouches.length}.`);
  o.push(`- **Long gaps** (more than 15 min between two meetings): ${P.longGap.length}: ${wl(P.longGap, 25, r => r.id + ' ' + mins(r.maxGap) + 'm')}.`);
  o.push(`- **Not recalled after the errand that introduced it**: ${P.notRecalled.length}: ${wl(P.notRecalled)}.`);
  o.push(`- **Learned without its own puzzle** (learned by answering another word, or by no question at all): ${P.coLearned.length}: ${wl(P.coLearned, 99, r => r.id + ' (' + r.learnedBy + ')')}.`);
  o.push(`- **Learned, then never met again**: ${P.noReviewAfterLearn.length}: ${wl(P.noReviewAfterLearn)}.`);
  o.push(`- **Faded out** (not met in the last 30 minutes of play): ${P.lateFade.length}: ${wl(P.lateFade)}.`);
  o.push(`- **Never learned**: ${P.notLearned.length}: ${wl(P.notLearned)}. **Never met**: ${P.never.length}${P.never.length ? ': ' + wl(P.never) : ''}.`);
  o.push('');
  o.push('## Per errand (and other contexts)');
  o.push('Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo\'s training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).');
  o.push('');
  o.push('| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |');
  o.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  const order = Object.values(A.ctx).sort((a, b) => (A.qStart[a.id] != null ? A.qStart[a.id] : a.t0) - (A.qStart[b.id] != null ? A.qStart[b.id] : b.t0));
  for (const C of order) {
    const ran = C.start != null ? `${fmt(C.start)}-${C.done != null ? fmt(C.done) : '?'} (${mins((C.done || A.END) - C.start)}m)` : `${fmt(C.t0)}-${fmt(C.t1)}`;
    o.push(`| ${ctxName(C.id)} | ${ran} | ${C.news.size}${C.news.size ? ': ' + [...C.news].join(', ') : ''} | ${C.learned.size} | ${C.reviewed.length} (${C.reviewedActive}) | ${C.active} | ${C.cued} | ${C.wrong} |`);
  }
  o.push('');
  o.push('## Per 15-minute session');
  o.push('| Session | Game time | New words (from pages) | Learned | Picked right | Said | Wrong | Older words used | Errands finished |');
  o.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const s of A.sessions) o.push(`| ${s.s} | ${fmt(s.from)}-${fmt(s.to)} | ${s.news} (${s.newFromPages}) | ${s.learned} | ${s.recognized} | ${s.said} | ${s.wrong} | ${s.reviewed} | ${s.errands.join(', ') || '-'} |`);
  o.push('');
  o.push('## Timeline (5-minute steps)');
  o.push('`#` = one new word met in that step.');
  o.push('');
  o.push('| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |');
  o.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (let a = 0; a < A.minute.length; a += 5) {
    const ms = A.minute.slice(a, a + 5), news = ms.reduce((x, m) => x + m.news, 0), last = ms[ms.length - 1];
    const ctx = [...new Set(ms.flatMap(m => m.ctx))].filter(c => c !== 'other').map(c => A.qName[c] ? c : LABEL[c] || c);
    const ids = Object.values(W).filter(r => !r.never && r.first >= a * 60 && r.first < (a + 5) * 60).map(r => r.id);
    o.push(`| ${fmt(a * 60)} | ${'#'.repeat(news) || '.'} ${news} | ${ms.reduce((x, m) => x + m.learned, 0)} | ${ms.reduce((x, m) => x + m.active, 0)} | ${last.seenTot} / ${last.learnedTot} | ${ids.join(', ')} | ${ctx.join(', ')} |`);
  }
  o.push('');
  o.push('## Per word');
  o.push('*First*: game time and how it first reached the child. *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.');
  o.push('');
  o.push('| Word | First | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |');
  o.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of Object.values(W).sort((a, b) => (a.first == null ? 1e9 : a.first) - (b.first == null ? 1e9 : b.first))) {
    if (r.never) { o.push(`| ${r.id} | never | | | | 0 | 0 | 0 | | | | | | | |`); continue; }
    o.push(`| ${r.id} *${r.es}* | ${fmt(r.first)} | ${r.firstHow} | ${r.firstCtx} | ${r.toActive == null ? 'never' : fmt(r.toActive)} | ${r.encounters} | ${r.exposures} | ${r.active} (${r.said}, ${r.cued}) | ${r.wrong} | ${r.avgGap == null ? '-' : mins(r.avgGap) + 'm / ' + mins(r.maxGap) + 'm'} | ${fmt(r.last)} | ${r.errands.length} | ${r.sessions} | ${r.learned == null ? 'no' : fmt(r.learned) + ' (' + r.learnedBy + ')'} | ${r.recalledAfter ? 'yes' : 'no'} |`);
  }
  o.push('');
  o.push('## How it is measured');
  o.push('- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event: *shown* (in a dialogue line, a question prompt, a question\'s picture, the bag, a map banner), *heard* (spoken by the voice), *seen-first*, *page* (on a notebook page just found), *tapped-object* (tap-anything, an animal and its sound, the animal count), *choice-shown*, *recognized* (picked right by tap), *wrong*, *picked* (a free choice), *said* (said out loud and matched) and *learned*, with the game time, map, speaker and the episode.');
  o.push('- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, a page, Canelo\'s tricks, a side job, the bag) says which errand it belonged to.');
  o.push('- Time is the game\'s own frames (60 a second: walking, animations, the typewriter) plus a child\'s pace on top: ~1 s + 0.09 s a letter to listen to a line (the voice reads at 0.85), ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a new-word card, 2 s for errand and badge cards, 5 s to look at a new notebook page, 2 s more to say an answer, and ' + STEP_PACE + ' s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around; the sunset (18 min) runs on this clock.');
  o.push('- Greetings (and say-it-back stars) come once per person per calendar day, and the whole run happens on one calendar day, so they are under-counted compared with play over several days.');
  o.push('- *Cued*: the right answer was in the prompt\'s own text (`¡[hola]!` -> hola) or the prompt\'s picture was the answer itself (Canelo\'s "¡Dile a Canelo!" shows the trick). *Active uses* count picks of the right answer by tap and answers said out loud; a free pick in a shop or Canelo\'s menu is not counted.');
  o.push(`- Bursts: ${BURST.n}+ first meetings within ${BURST.win} s. Overload: more than ${OVERLOAD.n} first meetings within 5 minutes. Sessions: every 15 minutes of game time.`);
  o.push('- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 20 minutes; `--from <dump.json>` re-analyses a saved run in a second).');
  o.push('<!-- AUDIT:END -->');
  return o.join('\n') + '\n';
}
function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

function writeReport(text) {
  let doc = fs.existsSync(REPORT) ? fs.readFileSync(REPORT, 'utf8') : '# Vocabulary flow audit\n\nHow the words of Club de Español reach a child over one full playthrough, measured by `tools/vocab-audit.js`.\n\n';
  const a = doc.indexOf('<!-- AUDIT:BEGIN'), b = doc.indexOf('<!-- AUDIT:END -->');
  doc = a >= 0 && b > a ? doc.slice(0, a) + text + doc.slice(b + '<!-- AUDIT:END -->'.length + 1) : doc + text;
  fs.writeFileSync(REPORT, doc);
}

(async () => {
  let D;
  if (arg('from')) D = JSON.parse(fs.readFileSync(arg('from'), 'utf8'));
  else {
    D = await play();
    fs.writeFileSync(DUMP, JSON.stringify(D));
    console.log('dump: ' + DUMP);
  }
  const A = analyse(D);
  writeReport(report(A, D));
  fs.writeFileSync(SVG, svgChart(A));
  const sum = { end: A.END, words: Object.keys(A.W).length, met: Object.values(A.W).filter(r => !r.never).length, perWord: A.W, ctx: Object.values(A.ctx).map(C => ({ id: C.id, news: [...C.news], reviewed: C.reviewed, learned: [...C.learned], active: C.active })), sessions: A.sessions,
    problems: Object.fromEntries(Object.entries(A.P).map(([k, v]) => [k, Array.isArray(v) ? v.map(r => r.id || r) : v])) };
  fs.writeFileSync(DUMP.replace(/\.json$/, '') + '-summary.json', JSON.stringify(sum, null, 1));
  console.log('report: ' + REPORT + '\nchart: ' + SVG + '\nsummary: ' + DUMP.replace(/\.json$/, '') + '-summary.json');
  console.log('game time ' + fmt(A.END) + ', words met ' + sum.met + '/' + sum.words + ', problems: ' + Object.entries(A.P).map(([k, v]) => k + '=' + (Array.isArray(v) ? v.length : v)).join(' '));
})().catch(e => { console.log('FAIL: ' + (e.stack || e.message)); process.exit(1); });
