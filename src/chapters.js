// ===== The story in chapters: one path of 21 chapters (docs/CURRICULUM.md), each opening when the last is done and
// today's new-word budget allows =====
// The chapter table (title, giver, new words, badge) is content/es/words.js (G.data.chapters); each chapter's script is
// registered by a content file (content/es/story-*.js) with G.chapters.script(id, beats, opts). A chapter is also a
// quest (G.state.quests[id] = 'active' | 'done'), so Misiones, badges and S.done(id) work as for the older errands.
//
// A script is a list of BEATS, played in order. A beat waits for its trigger, then its run(f, c) plays as a scene (the
// map locked); when it ends, the chapter moves on to the next beat (saved). A run may return false to stay on that beat.
// Triggers (one per beat):
//   who: 'nico'           talking to that person (their bubble: beat.bubble, default "!"); 'canelo' = tapping Canelo
//   spot: {map, at, icon} a place on a map: a picture bubble over it (unless quiet); walking up to it / tapping it runs it
//   spots: [{map, at, icon, quiet, off(c)}]  several places: run(f, c, i) gets the one chosen and returns false to wait
//   tap: 'cat' | kind     tapping the cat on the fence, or an animal of that kind (G.animals), runs it
//   auto: 'villa' | true  runs by itself as soon as the map (any map: true) is free
//   door: 'casa'          runs when you walk into that map's way out (and the way out waits for it)
//   evening: 'dusk' | 'dawn'  runs in the evening at home (day.js), before the Hoy card / after the night
// beat.when(c): an extra condition (e.g. () => G.intro.found('perro')); beat.hint(f, c): [{x, y}] world px for the hint
// hand; beat.part: an icon for Misiones (the steps with a part are ticked off as they are done).
// opts: { stage(f, c) (puts people where the chapter needs them; called when a map opens and after every beat),
//         after(f, c) (a generator played once the chapter is done and its badge shown: the diploma),
//         follows(who, c) (someone tags along with you now: Nico's sound game),
//         draw(f, ctx, c) (under the people), drawTop(f, ctx, c), lost: (c) => Canelo is away (his map entries
//         hide), tap(kind, f, c) (true: a tap on an animal / the cat / Canelo was handled, e.g. a wrong one) }
// c (the chapter's context, also G.chapters.ctx(id)): { id, def, data (its own saved object), step }.
//
// Opening (gate(id) -> null when it may start, else why not):
//   'prev'      the chapter before isn't done          'unwritten'  no script yet
//   'budget'    its new words don't fit today: at most 6 new words a day (G.words.day) and 8 a calendar date
//   'soon'      more than 5 new words would fall inside 5 minutes of play: it opens a few minutes later (no bubble
//               meanwhile; the evening chapter has the sunset for that)
//   'busy'      10 or more words are still only met (stage 1, never picked without a cue): a review day (the
//               reviewer, Luna or Mamá, has a notebook bubble and asks 5 of them: .needsReview(), .review(who))
//   'morning'   a morning chapter opens only as the first chapter of a session (a new day, a night at home)
//   'evening'   an evening chapter opens only in the evening at home (after C8 the sunset comes ~5 minutes later)
// A started chapter can always be finished. While the next chapter waits, its giver shows a "tomorrow" bubble (a sun
// coming up: {icon: 'manana', wait: true}; the hint hand passes it by) and says so.
//
// API: G.chapters.script(id, beats, opts), .ids(), .def(id), .written(id), .done(id), .current() (the active one),
//   .next() (the next to open), .gate(id), .ready(id), .start(id), .ctx(id), .beat(id) (the current beat),
//   .newToday() / .newOnDate() (words met today), .stage1() (words still only met), .parts(id) (Misiones),
//   .alert(who) / .talk(who, f) (maps.js), .spotAt / .runSpot (field.js), .tapped(kind, f) (animals, the cat, Canelo),
//   .nudge() / .nudgeRun(f, n) (Canelo's "?": a word just met comes back), .door(f) (an exit's run), .evening(phase, f) (day.js), .targets(f) (hint.js, tools/playflow.js), .waitsIn(map),
//   .update(f) / .draw(f, ctx, layer) (field.js), .lost() (Canelo away), .tailGate() (the older errands after
//   chapter 10), .migrate() (older saves), .say / .ask / .K (helpers for scripts: content/es/story-*.js).
// Saved: G.state.ch = { v, step: {id: beat}, data: {id: {...}}, began: {id: {day, date}}, doneSess: {id: session},
//   lastDoneSess, tailDay, placeAsk: {word: times} }.
'use strict';
(function () {
  const CH = G.chapters = {};
  const D = () => G.data, S = G.st, F = () => G.state.flags, T = G.TILE;
  const TT = (t, en) => ({ t, en });
  const scripts = {};
  CH.LIMITS = { day: 6, date: 8, busy: 10, win: 300, inWin: 5 }; // (at most inWin new words in win seconds of play)
  CH.VERSION = 3; // (2: chapters 1-10 then the older errands; 3: all 21 chapters)

  // ---------- the table and the scripts ----------
  CH.ids = () => (D().chapters || []).map(c => c.id);
  CH.def = id => (D().chapters || []).find(c => c.id === id) || null;
  CH.script = function (id, beats, opts) { scripts[id] = { beats, o: opts || {} }; };
  CH.written = id => !!scripts[id];
  CH.writtenIds = () => CH.ids().filter(CH.written);
  // the badge rows (Misiones, the diploma): the chapters (and any older errands still listed in tailOrder: none now)
  Object.defineProperty(D(), 'badgeOrder', { configurable: true, get: () => CH.writtenIds().concat(D().tailOrder || []) });

  // ---------- saved state ----------
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function st() {
    const s = G.state; if (!isObj(s.ch)) s.ch = {};
    const c = s.ch;
    for (const k of ['step', 'data', 'began', 'doneSess', 'placeAsk']) if (!isObj(c[k])) c[k] = {};
    if (!c.v) c.v = CH.VERSION;
    return c;
  }
  CH.state = () => (G.state ? st() : null);
  CH.done = id => !!G.state && G.state.quests[id] === 'done';
  CH.active = id => !!G.state && G.state.quests[id] === 'active';
  CH.current = () => (G.state ? CH.ids().find(CH.active) || null : null);
  CH.next = function () {
    if (!G.state || CH.current()) return null;
    return CH.ids().find(id => !CH.done(id)) || null;
  };
  CH.allWrittenDone = () => !!G.state && CH.writtenIds().every(CH.done);
  CH.data = id => { const d = st().data; if (!isObj(d[id])) d[id] = {}; return d[id]; };
  CH.ctx = id => ({ id, def: CH.def(id), data: CH.data(id), step: st().step[id] | 0 });
  CH.beat = id => { id = id || CH.current(); const sc = id && scripts[id]; return sc ? sc.beats[st().step[id] | 0] || null : null; };

  // ---------- the budget ----------
  const recs = () => Object.keys(G.state ? G.state.words : {}).map(G.words.rec).filter(r => r && r.st >= 1 && r.how !== 'old');
  CH.newToday = () => { const d = G.words.day(); return recs().filter(r => r.md === d).length; };
  CH.newOnDate = () => { const t = G.today(); return recs().filter(r => r.mdate === t).length; };
  CH.stage1 = () => recs().filter(r => r.st === 1).length;
  CH.newRecent = sec => { const now = G.words.now(), ss = G.words.sess(); return recs().filter(r => r.met != null && r.ms === ss && now - r.met < sec).length; }; // (this session only)
  CH.newWords = id => { const c = CH.def(id); return c ? c.words.filter(w => !G.words.met(w)) : []; };
  CH.gate = function (id, o = {}) {
    const c = CH.def(id); if (!c || !G.state) return 'none';
    if (CH.done(id)) return 'done';
    if (CH.active(id)) return null;
    if (!scripts[id]) return 'unwritten';
    const k = CH.ids().indexOf(id);
    if (k > 0 && !CH.done(CH.ids()[k - 1])) return 'prev';
    if (c.when === 'evening' && !o.evening) return 'evening';
    if (c.when === 'morning' && st().lastDoneSess === G.words.sess()) return 'morning';
    const n = CH.newWords(id).length;
    if (n && (CH.newToday() + n > CH.LIMITS.day || CH.newOnDate() + n > CH.LIMITS.date)) return 'budget';
    if (n && CH.stage1() >= CH.LIMITS.busy) return 'busy';
    if (n && c.when !== 'evening' && CH.newRecent(CH.LIMITS.win) + n > CH.LIMITS.inWin) return 'soon';
    return null;
  };
  CH.ready = (id, o) => !CH.gate(id, o);
  // the older errands after chapter 10 (errands.js): one a day, on a day with room for new words
  CH.tailGate = () => !!G.state && CH.allWrittenDone() && CH.newToday() <= 3 && CH.newOnDate() <= 4 && CH.stage1() < CH.LIMITS.busy && st().tailDay !== G.words.day();
  CH.tailStarted = () => { st().tailDay = G.words.day(); };

  // ---------- starting, moving on, finishing ----------
  CH.start = function (id) {
    if (!G.state || CH.done(id)) return;
    const s = st();
    if (!CH.active(id)) { s.step[id] = 0; s.began[id] = { day: G.words.day(), date: G.today() }; S.startQuest(id); }
  };
  function advance(id) {
    const s = st(); s.step[id] = (s.step[id] | 0) + 1; S.autosave();
    return s.step[id] >= scripts[id].beats.length;
  }
  function* finish(id, f) {
    const s = st(), c = CH.def(id);
    S.finishQuest(id); s.doneSess[id] = G.words.sess(); s.lastDoneSess = G.words.sess();
    yield G.badge(id);
    if (G.hearts && c.giver && G.hearts.WHO.includes(c.giver) && G.hearts.add(c.giver, 2, 'errand')) { yield 40; yield* G.hearts.milestones(c.giver); }
    const sc = scripts[id]; if (sc && sc.o.after) yield* sc.o.after(f, CH.ctx(id)); // (the last chapter: the diploma)
    const nx = CH.next();
    if (nx && CH.def(nx).when === 'evening' && !CH.gate(nx, { evening: true }) && G.day && G.day.bring) G.day.bring(300); // (C9: the sunset comes sooner)
    restage(f);
    S.autosave();
  }
  // play beat k of chapter id (a scene: the caller has locked the map). Returns true if it ran.
  let running = null;
  CH.running = () => running;
  function* play(id, f, k, i) {
    const sc = scripts[id], b = sc.beats[k];
    if (!b) return false;
    if (!CH.active(id)) CH.start(id);
    running = { id, k };
    let r;
    try { r = yield* b.run(f, CH.ctx(id), i); } finally { running = null; }
    if (r === false) { restage(f); return true; }
    if (advance(id)) yield* finish(id, f);
    restage(f);
    return true;
  }
  // the chapter (and beat) a trigger could run now: the active one, or the next one when it may open
  function live(o = {}) {
    const cur = CH.current();
    if (cur) { const sc = scripts[cur]; return sc ? { id: cur, k: st().step[cur] | 0, b: CH.beat(cur), started: true } : null; }
    const nx = CH.next(); if (!nx || !scripts[nx] || CH.gate(nx, o)) return null;
    return { id: nx, k: 0, b: scripts[nx].beats[0], started: false };
  }
  CH.live = live;
  const when = (L) => { try { return !L.b.when || !!L.b.when(CH.ctx(L.id)); } catch (e) { console.error(e); return false; } };

  // ---------- who says what (maps.js) ----------
  // the bubble over someone: the beat waiting for them, the next chapter's giver (or "tomorrow")
  // a review day (10+ words only met): the teacher (Profesora Luna once her school is met, else Mamá) has a notebook
  // bubble and asks the oldest of them, so the story can go on (nothing waits on a word that never comes back)
  CH.reviewer = () => (G.words.met('escuela') ? 'luna' : 'mama');
  CH.needsReview = () => !!G.state && !CH.current() && CH.stage1() >= CH.LIMITS.busy;
  CH.review = function* (who, n = 5) {
    const say = (...p) => G.say(p, { portrait: G.portraitOf(who), name: G.nameOf(who), who, show: { icon: 'pagina' } });
    yield say(TT('¡[hola], {name}! ¿Y tus palabras?', 'Hi, {name}! Let\'s practise your new words.'));
    const ids = Object.keys(G.state.words).filter(id => G.words.stage(id) === 1).map(id => [id, G.words.rec(id)])
      .sort((a, b) => (a[1].met || 0) - (b[1].met || 0)).slice(0, n).map(a => a[0]);
    for (const id of ids) yield* G.review.ask(id, { who });
    yield say(TT('¡Muy bien, {name}!', 'Very good, {name}!'));
    G.st.autosave();
  };
  // Canelo's "?": a word met this session a minute or more ago and not used since its puzzle comes back through him
  // (tap him: a review question for it), so every new word is used again within a minute or two (at most one every
  // 40 seconds of play)
  // the next nudge: a word that will put the "?" over Canelo within a minute (tools/playflow.js waits for it)
  CH.nudgeSoon = function () {
    if (!G.state || !G.pet || !G.pet.mine()) return false;
    if (G.errands && G.errands.lost()) return false;
    const now = G.words.now(), ss = G.words.sess(), s = st(), cool = s.nudgeAt != null && now >= s.nudgeAt && now - s.nudgeAt < 40;
    return Object.keys(G.state.words).some(id => { const r = G.words.rec(id); return r && r.st >= 1 && r.how !== 'old' && r.ms === ss && r.met != null && (now - r.met < 60 || (cool && now - r.met <= 600)) && (r.ru == null || r.ru - r.met < 20); });
  };
  CH.nudge = function () {
    if (!G.state || !G.pet || !G.pet.mine() || (G.errands && G.errands.lost())) return null;
    const now = G.words.now(), ss = G.words.sess(), s = st();
    if (s.nudgeAt != null && now - s.nudgeAt < 40 && now >= s.nudgeAt) return null;
    let best = null;
    for (const id of Object.keys(G.state.words)) {
      const r = G.words.rec(id);
      if (!r || r.st < 1 || r.how === 'old' || r.ms !== ss || r.met == null) continue;
      const age = now - r.met;
      if (age < 60 || age > 600 || (r.ru != null && r.ru - r.met >= 20)) continue;
      if (!best || r.met < best[1]) best = [id, r.met];
    }
    return best && best[0];
  };
  CH.nudgeRun = function* (f, n) {
    const id = CH.nudge(); if (!id) return false;
    st().nudgeAt = G.words.now();
    if (n && G.ambient) G.ambient.happy(n);
    if (G.pet && G.pet.sound) G.pet.sound('bark');
    yield 16;
    yield* G.review.ask(id, { who: null });
    if (n && G.hearts) G.hearts.add('canelo', 1, 'care');
    return true;
  };
  CH.alert = function (who) {
    if (!G.state) return null;
    const L = live();
    if (L && L.b.who === who && when(L)) { const bb = L.b.bubble, v = typeof bb === 'function' ? bb(CH.ctx(L.id)) : bb != null ? bb : true; return CH.bubbleOf(v); }
    if (who === 'canelo' && CH.nudge()) return 'pregunta';
    if (CH.needsReview() && who === CH.reviewer()) return 'pagina';
    if (!CH.current()) {
      const nx = CH.next(), c = nx && CH.def(nx), g = nx && CH.gate(nx);
      if (c && g && c.giver === who && scripts[nx] && g !== 'prev' && g !== 'soon') return g === 'evening' ? { icon: 'noche', wait: true } : { icon: 'manana', wait: true };
    }
    return null;
  };
  // a request bubble over someone shows the thing's picture while its word is new, and a "?" once the word is known
  // (stage 2+: the child has to remember what they want; CURRICULUM.md 7.3)
  CH.bubbleOf = v => (typeof v === 'string' && G.data.words[v] && G.words.stage(v) >= 2 ? 'pregunta' : v);
  // their part of a talk: true when it handled it
  CH.talk = function* (who, f) {
    if (!G.state) return false;
    const L = live();
    if (L && L.b.who === who && when(L)) return yield* play(L.id, f || G.field, L.k);
    if (CH.needsReview() && who === CH.reviewer()) { yield* CH.review(who); return true; }
    if (who === 'canelo' && CH.nudge()) return yield* CH.nudgeRun(f || G.field, G.pet && G.pet.npc(f || G.field));
    if (!CH.current()) {
      const nx = CH.next(), c = nx && CH.def(nx), g = nx && CH.gate(nx);
      if (c && g && c.giver === who && scripts[nx] && g !== 'prev' && g !== 'soon') { yield* tomorrow(who, g); return true; }
    }
    return false;
  };
  function* tomorrow(who, why) {
    const say = (...p) => G.say(p, { portrait: G.portraitOf(who), name: G.nameOf(who), who, show: { icon: why === 'evening' ? 'noche' : 'manana' } });
    if (why === 'evening') yield say(TT('¡Esta noche!', 'Tonight! (when the sun goes down, come home)'));
    else if (why === 'busy') yield say(TT('¡Mañana! Hoy... ¡a jugar con Canelo!', 'Tomorrow! Today, play with Canelo and say hello to everyone.'));
    else yield say(TT('¡Mañana!', 'Tomorrow! (a new chapter opens tomorrow)'));
  }

  // ---------- places, taps and doors ----------
  // a beat's places: spot, or spots (several to choose from: run(f, c, i) gets which one, and returns false to wait for
  // another, e.g. a ball of the wrong colour)
  const spotsOf = b => (b.spots || (b.spot ? [b.spot] : []));
  CH.spotAt = function (f, x, y) {
    if (!G.state || !f) return null;
    const L = live(); if (!L || !when(L)) return null;
    const i = spotsOf(L.b).findIndex(sp => sp.map === f.mapId && sp.at[0] === x && sp.at[1] === y && !(sp.off && sp.off(CH.ctx(L.id))));
    return i >= 0 ? Object.assign({ i }, L) : null;
  };
  CH.runSpot = function* (f, L) { return yield* play(L.id, f, L.k, L.i); };
  // an animal (kind), 'cat' or 'canelo' tapped -> true when the chapter took it (it plays as a scene)
  CH.tapped = function (kind, f) {
    if (!G.state || !f || (!f.locked && G.top() !== f) || running) return false;
    const L = live();
    if (L && L.b.tap === kind && when(L)) {
      if (f.locked) f.tasks.add((function* () { while (f.locked) yield 1; scene(f, play(L.id, f, L.k)); })()); // (from a search: once it ends)
      else scene(f, play(L.id, f, L.k));
      return true;
    }
    return CH.tapHook(kind, f);
  };
  // the chapter's own reaction to a tap that isn't its beat (opts.tap: a wrong animal in a listening game)
  CH.tapHook = function (kind, f) {
    const L = live(), sc = L && scripts[L.id];
    if (sc && sc.o.tap) { try { return !!sc.o.tap(kind, f, CH.ctx(L.id)); } catch (e) { console.error(e); } }
    return false;
  };
  // a way out of a map: a beat waiting at the door plays first, then you go out (false: it asked to stay)
  CH.door = function* (f) {
    const L = live();
    if (L && L.b.door === f.mapId && when(L)) { const k = st().step[L.id] | 0; yield* play(L.id, f, L.k); return CH.done(L.id) || (st().step[L.id] | 0) > k; }
    return true;
  };
  function scene(f, gen) {
    f.route = null; f.locked = true;
    f.tasks.add((function* () { try { yield* gen; } finally { f.locked = false; } })());
  }
  CH.scene = scene;

  // ---------- the evening at home (day.js) ----------
  // phase 'dusk' (before the Hoy card) or 'dawn' (after the night): true when a chapter played it
  CH.evening = function* (phase, f) {
    if (!G.state) return false;
    let ran = false;
    for (let guard = 0; guard < 20; guard++) {
      const L = live({ evening: true });
      if (!L || L.b.evening !== phase || !when(L)) break;
      yield* play(L.id, f, L.k); ran = true;
    }
    return ran;
  };

  // ---------- every frame (field.js) ----------
  CH.update = function (f) {
    if (!G.state || !f) return;
    if (f.chStaged !== G.state) { f.chStaged = G.state; restage(f); }
    const L = live();
    // an evening chapter waiting: the sunset comes soon
    if (!L && !CH.current()) { const nx = CH.next(); if (nx && CH.def(nx).when === 'evening' && !CH.gate(nx, { evening: true }) && G.day && G.day.bring && !G.day.brought()) G.day.bring(180); }
    if (f.locked || G.top() !== f || G.fade.a > 0 || f.player.moving || running) return;
    if (L && L.b.auto && (L.b.auto === true || L.b.auto === f.mapId) && when(L)) { scene(f, play(L.id, f, L.k)); return; }
    if (!L || L.b.auto) placeAsk(f);
  };
  function restage(f) {
    f = f || G.field; if (!f || !G.state) return;
    const id = CH.current() || CH.next(); const sc = id && scripts[id];
    if (sc && sc.o.stage) { try { sc.o.stage(f, CH.ctx(id)); } catch (e) { console.error(e); } }
  }
  CH.restage = restage;
  CH.lost = function () { const id = CH.current(), sc = id && scripts[id]; return !!(sc && sc.o.lost && sc.o.lost(CH.ctx(id))); };
  // someone tags along with you for a while (opts.follows(who, c): Nico in his sound game, chapter 17)
  CH.follows = function (who) { const id = CH.current(), sc = id && scripts[id]; try { return !!(sc && sc.o.follows && sc.o.follows(who, CH.ctx(id))); } catch (e) { return false; } };

  // ---------- the arrival banner: entering a building whose word is met and due asks its name (a few times) ----------
  const PLACES = ['escuela', 'panaderia', 'biblioteca', 'casa', 'granja'];
  function placeAsk(f) {
    if (f.placeAsked) return;
    f.placeAsked = true;
    const id = f.def && f.def.icon; if (!id || !PLACES.includes(id) || !G.data.words[id] || !G.words.met(id) || !G.words.due(id)) return;
    if (f.mapId === 'casa' && G.day && G.day.over()) return;
    const pa = st().placeAsk; if ((pa[id] | 0) >= 3 || pa[id + '@'] === G.words.sess()) return;
    const others = G.words.list(1).filter(k => k !== id && G.data.words[k].topic === 'pueblo' && k !== 'carta' && !(id === 'casa' && k === 'cama'));
    const more = G.words.list(1).filter(k => k !== id && !others.includes(k) && k !== 'cama');
    const pool = others.concat(more.sort(() => G.rand() - 0.5)).slice(0, 2);
    if (pool.length < 2) return;
    pa[id] = (pa[id] | 0) + 1; pa[id + '@'] = G.words.sess();
    scene(f, (function* () { yield 20; yield* CH.banner(id, pool, { who: null }); })());
  }
  // a place's name, asked on arrival: [place, ...others] (picture + word while it's new)
  CH.banner = function* (id, others, o = {}) {
    return yield* CH.ask(o.who || null, '¿Dónde estás?', 'Where are you? (this place\'s name)', id, others, o);
  };

  // ---------- where the hint hand points (and the test bot goes) ----------
  CH.targets = function (f) {
    if (!G.state || !f) return [];
    const L = live(); if (!L || !when(L)) return [];
    const out = [], b = L.b;
    if (b.hint) { try { for (const t of b.hint(f, CH.ctx(L.id)) || []) out.push(Object.assign({ ch: L.id }, t)); } catch (e) { console.error(e); } return out; }
    spotsOf(b).forEach((sp, i) => { if (sp.map === f.mapId && !(sp.off && sp.off(CH.ctx(L.id)))) out.push({ x: sp.at[0] * T + 12, y: sp.at[1] * T + 12, spot: 'ch:' + L.id + ':' + i, ch: L.id }); });
    if (b.tap && f.mapId) {
      if (b.tap === 'cat' && f.amb && f.amb.cat && !f.amb.cat.away) out.push({ x: f.amb.cat.x * T + 12, y: f.amb.cat.y * T - 2, cat: true, ch: L.id });
      else if (b.tap === 'canelo') { const n = G.pet && G.pet.npc(f); if (n) out.push({ x: n.x * T + 12, y: n.y * T + 12, npc: 'canelo', ch: L.id }); }
      else if (G.animals) { const a = G.animals.find(b.tap, f); if (a) out.push({ x: Math.round(a.x), y: Math.round(a.y - 6), animal: b.tap, ch: L.id }); }
    }
    if (b.door === f.mapId) { const ex = (f.def.exits || [])[0]; if (ex) out.push({ x: ex.x * T + 12, y: ex.y * T + 12, door: true, ch: L.id }); }
    return out;
  };
  // does something wait inside map m (for the hand at a door)?
  CH.waitsIn = function (m) {
    if (CH.needsReview() && m === (CH.reviewer() === 'luna' ? 'escuela' : 'casa')) return true;
    if (m === 'villa' && G.field && G.field.mapId !== 'villa' && !(G.pet && G.pet.npc(G.field)) && CH.nudge()) return true; // (Canelo waits outside with his "?")
    const L = live(); if (!L || !when(L)) return false;
    const b = L.b, def = G.maps[m];
    if (spotsOf(b).some(sp => sp.map === m)) return true;
    if (b.auto === m || b.door === m) return true;
    if (b.who && def && (def.npcs || []).some(n => n.id === b.who && (!n.cond || n.cond()))) return true;
    return false;
  };

  // ---------- drawing (field.js) ----------
  CH.draw = function (f, ctx, layer) {
    if (!G.state) return;
    const id = CH.current() || CH.next(), sc = id && scripts[id];
    if (sc) { const fn = layer === 'top' ? sc.o.drawTop : sc.o.draw; if (fn) { try { fn(f, ctx, CH.ctx(id)); } catch (e) { console.error(e); } } }
    if (layer !== 'top') return;
    const L = live();
    if (L && when(L) && G.top() === f) for (const sp of spotsOf(L.b)) {
      if (sp.map !== f.mapId || sp.quiet || (sp.off && sp.off(CH.ctx(L.id)))) continue;
      const at = sp.at, ic = typeof sp.icon === 'function' ? sp.icon(CH.ctx(L.id)) : sp.icon;
      if (ic) G.drawAlert(ctx, ic, at[0] * T - Math.round(f.cam.x), at[1] * T - Math.round(f.cam.y) + 4, f.t);
    }
    drawPoint(f, ctx);
  };
  // a bouncing arrow over something on the map ("this one"), while a question about it is up
  let pointAt = null;
  CH.point = (x, y) => { pointAt = x == null ? null : { x, y }; }; // world px (the top of the thing), or nothing
  CH.pointNpc = n => { pointAt = n ? { n } : null; };
  function drawPoint(f, ctx) {
    if (!pointAt) return;
    const p = pointAt.n ? { x: pointAt.n.x * T + (pointAt.n.ox || 0) + 12, y: pointAt.n.y * T + (pointAt.n.oy || 0) - 6 } : pointAt;
    const x = Math.round(p.x - f.cam.x), y = Math.round(p.y - f.cam.y) - 6 - Math.round(Math.abs(Math.sin(G.frame / 8)) * 4);
    ctx.fillStyle = '#10102a'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 6 + i, y - 8 + i, 13 - 2 * i, 1);
    ctx.fillStyle = '#10102a'; ctx.fillRect(x - 3, y - 15, 7, 8);
    ctx.fillStyle = '#f8e060'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 5 + i, y - 8 + i, 11 - 2 * i, 1);
    ctx.fillRect(x - 2, y - 14, 5, 7);
  }

  // ---------- Misiones ----------
  CH.parts = function (id) {
    const sc = scripts[id]; if (!sc) return null;
    const k = st().step[id] | 0, out = [];
    sc.beats.forEach((b, i) => { if (b.part) out.push({ icon: b.part, done: CH.done(id) || i < k }); });
    return out.length ? out : null;
  };

  // ---------- older saves ----------
  // A game from before the chapters (no G.state.ch): its errands map onto the chapters that replaced them (CURRICULUM.md
  // section 7.2), and every chapter before the furthest one counts as done too (one path). A game from part 1 (ch.v 2:
  // chapters 1-10, then the older errands): those errands map onto chapters 11-21 the same way. Canelo stays yours, with
  // the tricks he knew (and the tricks of every chapter now behind you). An older errand still going is let go (its
  // chapter replaces it; its things leave the bag). Nothing is ever lost: the words keep their stages. Runs once.
  const MAP = { mercado: 'c4', pelota: 'c5', canelo: 'c7', saludos: 'c8', carta: 'c10', cansado: 'c10', fiesta: 'c10',
    picnic: 'c13', show: 'c14', flores: 'c15', sonidos: 'c17', cuenta: 'c19', fiestab: 'c21' };
  const TAIL = { picnic: 'c13', show: 'c14', flores: 'c15', sonidos: 'c17', cuenta: 'c19', fiestab: 'c21' };
  const TRICK_AT = { sientate: 'c3', pata: 'c14', salta: 'c14', busca: 'c16', gira: 'c17' };
  CH.migrate = function () {
    const s = G.state; if (!s) return;
    const v = isObj(s.ch) ? s.ch.v | 0 : 0;
    if (v >= CH.VERSION) return;
    const q = s.quests || (s.quests = {}), old = Object.keys(q).filter(k => !/^c\d+$/.test(k)), ids = CH.ids();
    const c = st(); c.v = CH.VERSION;
    if (!v && !old.length && !(s.flags && s.flags.intro)) return; // a new game
    let far = -1;
    if (v) { if (q.c10 === 'done') for (const k of old) if (q[k] === 'done' && TAIL[k]) far = Math.max(far, ids.indexOf(TAIL[k])); } // (part 1)
    else {
      for (const k of old) if (q[k] === 'done' && MAP[k]) far = Math.max(far, ids.indexOf(MAP[k]));
      if (s.flags && s.flags.petStart) far = Math.max(far, 0); // Canelo was already yours: chapter 1 is behind you
    }
    for (let i = 0; i <= far; i++) q[ids[i]] = 'done';
    // older errands still going: the chapters replace them
    for (const k of old) if (q[k] === 'active') { delete q[k]; if (s.flags) delete s.flags['e_' + k]; }
    if (s.bag && Array.isArray(s.bag.items)) s.bag.items = s.bag.items.filter(it => !it.q || q[it.q] === 'active');
    if (!v && far >= 0) { s.flags.intro = true; s.flags.canelo = true; s.flags.petStart = true; }
    if (s.flags && s.flags.petStart) {
      const p = isObj(s.pet) ? s.pet : (s.pet = {}); if (!isObj(p.tricks)) p.tricks = {};
      p.tricks.ven = 3;
      for (const t in TRICK_AT) if (q[TRICK_AT[t]] === 'done') p.tricks[t] = 3;
      p.learning = null; // (every trick is taught by its chapter now)
    }
    if (!v) c.lastDoneSess = null;
  };

  // =====================================================================
  //  Helpers for the scripts (content/es/story-*.js)
  // =====================================================================
  const K = CH.K = {};
  K.T = TT;
  K.say = function* (who, ...pages) { yield G.say(pages, who ? { portrait: G.portraitOf(who), name: G.nameOf(who) || (who === 'canelo' ? 'Canelo' : null), who } : {}); };
  K.sayShow = function* (who, show, ...pages) { yield G.say(pages, Object.assign(who ? { portrait: G.portraitOf(who), name: G.nameOf(who), who } : {}, { show })); };
  K.tell = function* (...pages) { yield G.say(pages); };
  // a picture-card question: [answer, ...others] shuffled; the answer is what it practises. o: show, en, mask, noMic,
  // pic (all picture-only cards, no mic: hear it, pick the picture), look {id: 'text' | 'both' | 'pic'} (how a card
  // looks), img {id: picture} (a card's own picture), wrong(word) (what happens on a wrong pick),
  // point (an npc or {x, y} to point at on the map while it's up), intro / how (it introduces the answer)
  CH.ask = function* (who, prompt, en, answer, others, o = {}) {
    const ids = [answer].concat(others.filter(k => k !== answer && G.data.words[k])).sort(() => G.rand() - 0.5);
    const choices = ids.map(id => Object.assign({ word: id }, o.pic ? { pic: true } : {}, o.look && o.look[id] ? { look: o.look[id] } : {}, o.img && o.img[id] ? { img: o.img[id] } : {}));
    if (o.point) { if (o.point.x != null && o.point.n == null && o.point.id == null) CH.point(o.point.x, o.point.y); else CH.pointNpc(o.point); }
    try {
      return yield* G.ask(Object.assign({ prompt, en, choices, answer: ids.indexOf(answer), layout: 'cards', who }, o.show ? { show: o.show } : {}, o.mask ? { mask: o.mask } : {},
        o.pic || o.noMic ? { noMic: true } : {}, o.intro ? { intro: answer, how: o.how || 'show' } : {}, o.display ? { display: o.display } : {},
        o.wrong ? { wrongAct: (k, w) => { try { o.wrong(w); } catch (e) { console.error(e); } } } : {}));
    } finally { if (o.point) CH.point(null); }
  };
  K.ask = CH.ask;
  K.siNo = function* (who, prompt, en, yes, o = {}) { return yield* CH.ask(who, prompt, en, yes ? 'si' : 'no', [yes ? 'no' : 'si'], o); };
  K.fade = function* (a) { yield G.fadeTo(a, 0.1); };
  // Canelo on this map (added beside you if he isn't here); his state
  K.dog = function (f) {
    f = f || G.field; let n = f.npc('canelo');
    if (!n) {
      const def = (G.maps[f.mapId].npcs || []).find(d => d.id === 'canelo') || { id: 'canelo', npc: 'canelo', dir: 'down', talk: function* (f, n) { yield* G.chapters.caneloTalk(f, n); } };
      n = f.addNpc(Object.assign({}, def, { x: f.player.x, y: f.player.y + 1, cond: null })); n.ghost = true;
      if (G.pet) G.pet.place(f, n);
    }
    n.hidden = false;
    return n;
  };
  // the first steps of a walk for o to tile (x, y) over free ground (people don't block: ghosts), as a dirs string
  K.path = function (f, o, x, y) {
    const key = (a, b) => a + ',' + b, prev = new Map([[key(o.x, o.y), null]]), q = [[o.x, o.y]];
    const free = (a, b) => { if (a < 0 || b < 0 || a >= f.map.w || b >= f.map.h) return false; const t = G.TERRAIN[f.map.get(a, b)] || G.TERRAIN['.']; return !(t.block || t.wall) || (a === x && b === y); };
    for (let i = 0; i < q.length; i++) {
      const [a, b] = q[i]; if (a === x && b === y) break;
      for (const [d, dx, dy] of [['u', 0, -1], ['d', 0, 1], ['l', -1, 0], ['r', 1, 0]]) { const na = a + dx, nb = b + dy, k = key(na, nb); if (!prev.has(k) && free(na, nb)) { prev.set(k, [key(a, b), d]); q.push([na, nb]); } }
    }
    let k = key(x, y), s = ''; if (!prev.has(k)) return '';
    while (prev.get(k)) { s = prev.get(k)[1] + s; k = prev.get(k)[0]; }
    return s;
  };
  K.walk = function* (f, n, x, y, speed = 3) { if (!n) return; const was = n.ghost; n.ghost = true; n.busy = true; yield* f.walkNpc(n, K.path(f, n, x, y), speed); n.busy = false; n.ghost = was; n.home = [n.x, n.y]; };
  K.place = function (f, id, x, y, dir) { const n = f.npc(id); if (!n) return null; Object.assign(n, { x, y, ox: 0, oy: 0, home: [x, y], moving: false, slide: false }); if (dir) n.dir = dir; return n; };
  K.puff = (kind, wx, wy, o) => { if (G.pet && G.pet.puff) G.pet.puff(kind, wx, wy, o); };
  K.bark = (f, n) => { n = n || (f && f.npc('canelo')); if (G.pet) G.pet.sound('bark'); if (n) K.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 }); };
  K.heart = (f, n) => { n = n || (f && f.npc('canelo')); if (n) K.puff('heart', n.x * T + 12, n.y * T - 2, { life: 50, vy: -0.35 }); };
  K.sparkle = (f, x, y, k = 4) => { for (let i = 0; i < k; i++) G.fx.twinkle(x * T + 12 - Math.round(f.cam.x) + (Math.random() - 0.5) * 20, y * T + 8 - Math.round(f.cam.y) + (Math.random() - 0.5) * 14); };
  K.confetti = () => { G.fx.confetti(G.W / 2 - 70, 140, -1, 18); G.fx.confetti(G.W / 2 + 70, 140, 1, 18); };
  K.npcSay = (f, id, s, life = 80) => { const n = f.npc(id); if (n && f.amb) f.amb.fx.push({ kind: 'say', s, o: n, dx: 0, t: 0, life }); };
  // Canelo becomes yours (chapter 1): he follows you, knows "ven", sleeps at home
  K.adopt = function () { Object.assign(F(), { canelo: true, petStart: true }); const p = G.pet.state(); p.tricks.ven = 3; S.autosave(); };
  CH.caneloTalk = function* (f, n) { if (G.pet && G.pet.mine()) yield* G.pet.menu(f, n); };
})();
