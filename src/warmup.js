// ===== The dog's warm-up: once a day, the first time the child is free to walk, the dog brings some words back =====
// docs/LEARNING_PLAN_2.md, Phase 1 [decided with the parent]. The first time each day she is free to walk (on any map),
// the dog trots off, noses about, finds a word card and drops it at her feet. Then 3-4 words that are due come back as
// quick questions, the most overdue first, words from earlier days and from other places first (G.review.due): she says
// the word (a big mic right beside its picture) or taps it. Each card grows (cards.js); the dog wags after each one, and
// at the end he jumps for joy and gets a treat (and gives a heart). About a minute. A skip button (two arrows: "not
// now", top left) ends it at any moment, without a word of Spanish. The cards teach nothing new: only met words; a
// slipping word (words.js) is met again instead (G.intro.again). After the cards, a word waiting in the pacing's queue (seen on a
// day with no room for new words) is introduced if there's room now (G.intro.queued: the only new thing it ever brings).
// The first time, a ghost hand shows the mic (demo.js 'warmup').
// It waits for the story: never during a beat (CH.running), a find-it puzzle, the opener, the bus, a dog lost in a
// chapter, the evening at home; with fewer than 2 words due it doesn't come (that day). The guide carries on after.
//   The form, from the word's stage (the answer-card rules: learn.js Choice.view never lets pictures give it away):
//     met (1)        hear it, pick it (its picture and word among two others: recognition, as for any met word)
//     known and up   its picture held up: say it (the big mic) or pick its word (word-only cards: recall)
//
// API (G.warmup, short WU):
//   WU.wait(f) why it can't start now ('done', 'story', 'find', 'busy'... or null: it can)   WU.pick(f, n) the words
//   WU.update(f) / WU.draw(f, ctx) (field.js, every frame)    WU.start(f, ids) start it now (tests, content)
//   WU.cur() the one going on: {ids, i, phase: 'bring' | 'ask' | 'party', res: [1 | 0], skipped} or null
//   WU.done() today's has come (done, skipped or too few words)   WU.skip() ends the one going on   WU.skipToday()
//   WU.HOLDS.push(f => bool)   content holds it back while true (a zone's moment that mustn't be interrupted)
//   WU.FORMS[topic] = function* (id, extra) { ... return true if right first try }   a topic's own way to ask a word
//   WU.LD ('_ld') the card that is a listen-and-do request (src/listen.js G.listen.warm), before a due phrase
//     (extra: options for its G.ask: the skip button, the cards; pass them on so the child can still skip)
// Saved: G.state.hist.wu (history.js: {d: the day it last came, n: done, k: skipped, none, last: {d, ids, right, of}}).
// Off while G.debug.noWarmup (tools/harness.js keeps it off unless a test opens its page with {warmup: true}).
'use strict';
(function () {
  const WU = G.warmup = {}, T = G.TILE;
  WU.MAX = 4;        // words it brings
  WU.MIN = 2;        // fewer due than this: no warm-up that day
  WU.SETTLE = 40;    // frames free on the map before it starts (the map has faded in, the child has looked)
  WU.HOLDS = [];
  WU.FORMS = {};
  WU.LD = '_ld';     // the card that is a listen-and-do request (src/listen.js), not a word
  const SKIP = [4, 4]; // the skip button (G.skipBtn), the same place on the map and over the questions
  let cur = null, freeT = 0;
  const wu = () => G.hist.state().wu;
  WU.off = () => !!((typeof window !== 'undefined' && window.__warmupOff) || (G.debug && G.debug.noWarmup));
  WU.done = () => !!G.state && wu().d === G.today();
  WU.cur = () => cur;
  WU.running = () => !!cur;
  WU.skipToday = () => { if (G.state) { wu().d = G.today(); G.st.autosave(); } };
  WU.skip = () => { if (cur) cur.skipped = true; };
  const here = f => (G.zones ? G.zones.of(f.mapId) || G.zones.pathOf(f.mapId) || 'villa' : 'villa');

  // ---------- when ----------
  WU.wait = function (f) {
    if (!G.state || !f) return 'none';
    if (WU.off()) return 'off';
    if (cur) return 'going';
    if (WU.done()) return 'done';
    const CH = G.chapters, F = G.state.flags;
    if (!F.intro || !(CH && CH.openerDone && CH.openerDone())) return 'opener';
    if (!G.pet || !G.pet.mine()) return 'no dog';
    if (G.top() !== f || f.locked || G.fade.a > 0 || f.player.moving || f.player.hidden || f.evening) return 'busy';
    if (CH.running && CH.running()) return 'story';
    if (Object.keys(G.state.finds || {}).some(k => G.state.finds[k] && !G.state.finds[k].found)) return 'find';
    if (CH.lost && CH.lost()) return 'dog away';
    if (G.day && G.day.over && G.day.over()) return 'evening';
    for (const h of WU.HOLDS) { try { if (h(f)) return 'held'; } catch (e) { console.error(e); } }
    return null;
  };
  // the words it would bring now: due (G.review.due), met on an earlier day (today's too only when there are too few),
  // with a picture; the latest first (days since last met or used, past its box's interval), then words from other
  // places, a slipping word; never two that look the same
  WU.pick = function (f, n = WU.MAX) {
    if (!G.state) return [];
    const Wd = G.words, td = G.today(), zone = f ? here(f) : 'villa';
    const earlier = id => { const r = Wd.rec(id); return !!r && (r.how === 'old' || (r.mdate ? r.mdate !== td : r.ms < Wd.sess())); };
    const due = G.review.due(1e9).filter(id => G.iconDrawn(id));
    let L = due.filter(earlier);
    if (L.length < WU.MIN) L = L.concat(due.filter(id => L.indexOf(id) < 0));
    const late = id => { const r = Wd.rec(id), g = Wd.gapDays(id); return (g == null ? 3 : g) - (Wd.BOX_DAYS[Math.max(1, r.box | 0)] | 0); };
    const score = id => late(id) + (G.zones && G.zones.ofWord(id) !== zone ? 2 : 0) + (Wd.slipping(id) ? 1 : 0) + (earlier(id) ? 5 : 0);
    const sc = {}; L.forEach(id => { sc[id] = score(id); });
    L.sort((a, b) => sc[b] - sc[a] || Wd.stage(a) - Wd.stage(b) || (Wd.rec(a).last || 0) - (Wd.rec(b).last || 0));
    // a phrase that's due comes too, as the last card (src/phrases.js: "Quiero..." to the dog; docs/LEARNING_PLAN_2.md Phase 2)
    const ph = G.phrase && G.phrase.on() ? G.phrase.due()[0] : null;
    // and a listen-and-do request once she knows enough words (src/listen.js: "Dame dos huesos."), before the phrase
    const ld = G.listen && G.listen.warmReady && G.listen.warmReady() ? WU.LD : null;
    const out = [], forms = new Set();
    for (const id of L) { const b = G.baseForm(id); if (forms.has(b)) continue; forms.add(b); out.push(id); if (out.length >= n - (ph ? 1 : 0) - (ld ? 1 : 0)) break; }
    if (ld && out.length) out.push(ld);
    if (ph) out.push(ph);
    return out;
  };

  // ---------- every frame (field.js, after the story's own: a beat that starts by itself goes first) ----------
  WU.update = function (f) {
    if (!G.state || !f) return;
    if (cur) {
      if (cur.f === f && cur.phase !== 'party' && cur.phase !== 'ask' && G.top() === f && G.skipHit(...SKIP)) { G.input.eat(); cur.skipped = true; G.audio.sfx('cancel'); }
      return;
    }
    if (WU.wait(f)) { freeT = 0; return; }
    if (++freeT < WU.SETTLE) return;
    freeT = 0;
    const ids = WU.pick(f);
    if (ids.filter(id => id !== WU.LD).length < WU.MIN) { const w = wu(); w.d = G.today(); w.none = (w.none | 0) + 1; G.st.autosave(); return; } // (the request alone never brings it)
    WU.start(f, ids);
  };
  WU.start = function (f, ids) {
    f = f || G.field; if (!G.state || !f || cur) return false;
    ids = (ids || WU.pick(f)).filter(id => id === WU.LD || G.words.met(id)); if (!ids.length) return false;
    wu().d = G.today();
    cur = { f, ids, i: -1, phase: 'bring', res: [], skipped: false, t0: G.frame, card: null };
    if (G.vocabLog) G.vlog.ev({ ty: 'warmup', ids });
    G.chapters.scene(f, run(f, cur));
    G.st.autosave();
    return true;
  };

  // ---------- the warm-up itself (a scene on the map: the map is locked) ----------
  function* wait(c, k) { for (let i = 0; i < k && !c.skipped; i++) yield 1; }
  // a dog animation (pet.js), to its end or until skipped
  function* anim(c, n, k, o) {
    const a = G.pet.anim(n, k, o);
    while (n.pa === a && G.frame - a.f0 < a.len) { if (c.skipped && c.phase !== 'party') { n.pa = null; return; } yield 1; }
    if (n.pa === a) n.pa = null;
  }
  const dogXY = (f, n) => [Math.round(n.x * T + n.ox + 12 - f.cam.x), Math.round(n.y * T + n.oy - f.cam.y)];
  function* run(f, c) {
    const P = G.pet;
    const n = P.npc(f) || G.chapters.K.dog(f); // (not on this map: he comes along)
    const ghost = n.ghost; c.n = n;
    try {
      n.busy = true; n.ghost = true;
      for (let i = 0; i < 120 && (n.moving || n.slide) && !c.skipped; i++) yield 1;
      if (P.sleeping(f)) { f.petAwake = true; yield* anim(c, n, 'wake'); }
      if (!c.skipped) { P.place(f, n); yield* wait(c, 12); }
      // 1. he brings a word card and drops it at your feet
      if (!c.skipped) {
        yield* anim(c, n, 'bring', { item: { id: 'tarjeta' } });
        const p = f.player; c.card = [n.x * T + 12 + (p.x - n.x) * T * 0.5, n.y * T + 19 + (p.y - n.y) * T * 0.5 + 3]; // (where it landed: pet.js 'bring')
        yield* wait(c, 14);
      }
      // 2. the cards, one by one
      for (let i = 0; i < c.ids.length && !c.skipped; i++) {
        c.i = i; c.phase = 'ask';
        if (i === 0 && c.card) { const [x, y] = [c.card[0] - f.cam.x, c.card[1] - f.cam.y]; G.fx.burst(x, y - 4); G.audio.sfx('swing'); } // (the card jumps up into the question)
        c.card = null;
        const ok = yield* ask(c, c.ids[i]);
        if (c.skipped) break;
        c.res.push(ok ? 1 : 0);
        c.phase = 'wag';
        yield* anim(c, n, 'wag', { amp: ok ? 1 : 0.6 });
      }
      c.card = null;
      if (c.skipped) { finish(c, false); return; }
      // (pacing, words.js G.budget: a word she saw on a day with no room for new ones is introduced now, after the
      // reviews, if there's room: intro.js G.intro.queued)
      if (G.intro.queued) { c.phase = 'new'; yield* G.intro.queued({ who: 'canelo' }); }
      // 3. the dog jumps for joy and gets a treat
      c.phase = 'party';
      const [dx, dy] = dogXY(f, n);
      G.audio.jingle('item'); G.fx.confetti(dx - 34, dy + 14, -1, 16); G.fx.confetti(dx + 34, dy + 14, 1, 16);
      yield* anim(c, n, 'jump');
      yield* anim(c, n, 'eat', { item: 'hueso' });
      finish(c, true);
      if (G.hearts) { G.hearts.add('canelo', 1, 'care'); yield 16; yield* G.hearts.milestones('canelo'); }
    } finally {
      n.busy = false; n.ghost = ghost; n.home = [n.x, n.y];
      if (n.pa && (n.pa.k === 'bring' || n.pa.k === 'wag')) n.pa = null;
      cur = null; freeT = 0;
      G.st.autosave();
    }
  }
  function finish(c, completed) {
    const w = wu(), right = c.res.filter(Boolean).length;
    if (completed) w.n = (w.n | 0) + 1; else w.k = (w.k | 0) + 1;
    w.last = { d: G.today(), ids: c.ids.slice(), right, of: c.res.length, skipped: !completed || null };
  }
  // one word, in the strongest form that fits its stage
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = G.r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function* ask(c, id) {
    const Wd = G.words, st = Wd.stage(id), wd = G.data.words[id];
    const extra = { who: 'canelo', cancel: true, cancelIcon: 'skip', onCancel: () => { c.skipped = true; }, drawExtra: (ctx, s) => drawCards(ctx, s, c), warmup: { k: c.i, n: c.ids.length } };
    if (id === WU.LD) return !!(G.listen && (yield* G.listen.warm(extra))); // (a listen-and-do request: "Dame dos huesos")
    if (Wd.isPhrase && Wd.isPhrase(id)) return !!(yield* G.phrase.warm(id, extra)); // (a phrase: say the whole thing to the dog)
    if (Wd.needsReintro(id)) return !!(yield* G.intro.again(id, { who: null, extra })); // (slipping: met again)
    if (WU.FORMS[wd.topic]) return !!(yield* WU.FORMS[wd.topic](id, extra));
    // two other met words: the same topic first, never one that sounds like another card (the mic hears them all)
    const alike = (a, b) => G.speech && G.speech.score ? Math.max(G.speech.score(G.baseForm(a), G.baseForm(b)), G.speech.score(G.baseForm(b), G.baseForm(a))) >= 0.6 : false;
    const met = shuffle(Wd.list(1).filter(k => k !== id && G.iconDrawn(k) && G.baseForm(k) !== G.baseForm(id)));
    const pool = [];
    for (const k of met.filter(k => G.data.words[k].topic === wd.topic).concat(met.filter(k => G.data.words[k].topic !== wd.topic))) {
      if (pool.length >= 2) break;
      if (![id].concat(pool).some(o => alike(o, k))) pool.push(k);
    }
    const ch = G.wordChoices(id, [id].concat(pool), pool.length + 1);
    const q = st <= 1 ? { prompt: '¿[' + id + ']?', en: 'Which one? (listen, then tap it)' }
      : { prompt: '¿Qué es?', en: 'What is it? Say it (the big mic), or tap its word.', show: id, micBig: true };
    return !!(yield* G.ask(Object.assign({ choices: ch.choices, answer: ch.answer, layout: 'cards', review: true }, q, extra)));
  }

  // ---------- drawing ----------
  // over a question: the dog's cards, one per word (done ones with their sprout, this one bobbing, the rest faded)
  function drawCards(ctx, s, c) {
    const ph = s.lines.length * 16 + 10 + (s.o.show ? 58 : 0), b = s.box ? s.box() : null, y = b ? b.y + b.h + 3 : 8 + ph - 15; // (a phrase's question: under its box, over her face)
    c.ids.forEach((id, k) => {
      const x = (b ? 18 : 40) + k * (b ? 11 : 12), now = k === c.i, bob = now ? Math.round(Math.abs(Math.sin(G.frame / 8)) * -2) : 0;
      ctx.globalAlpha = k < c.i || now ? 1 : 0.35;
      if (id === WU.LD) G.drawIcon16(ctx, 'escucha', x - 6, y - 6 + bob, 0.75); // (a request: an ear)
      else if (G.words.isPhrase && G.words.isPhrase(id) && G.cards.bubble) G.cards.bubble(ctx, x - 6, y - 5 + bob, 1); else G.mic.cardGlyph(ctx, x, y + bob, 5);
      if (k < c.i && c.res[k]) { ctx.fillStyle = '#f8d040'; ctx.fillRect(x + 3, y - 6, 2, 2); }
      ctx.globalAlpha = 1;
    });
  }
  // on the map: the card on the ground, and the skip button while the dog brings it
  WU.draw = function (f, ctx) {
    const c = cur; if (!c || c.f !== f) return;
    if (c.card && G.pet.drawThing) G.pet.drawThing(ctx, Math.round(c.card[0] - f.cam.x), Math.round(c.card[1] - f.cam.y), 0, { id: 'tarjeta', big: true });
    if (c.phase !== 'party' && G.top() === f) G.skipBtn(ctx, ...SKIP, G.frame - c.t0);
  };
  WU.skipXY = () => SKIP.slice();
})();
