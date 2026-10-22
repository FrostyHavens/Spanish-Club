// ===== Meeting new words (one-unknown puzzles), review questions, and the notebook's page puzzles =====
// docs/LEARNING_DESIGN.md. A new word arrives as a little puzzle with one unknown, among things the child already knows,
// and is confirmed right away: it glows, its name is said again and its new card flies into the deck (G.intro.note, the
// small celebration, cards.js; the big gold card is for remembering, learn.js). Every meeting schedules its first real use (words.js:
// due again at +1.5 min, then +6 min; G.review asks those first).
//
// G.intro (generators unless noted; o.who is who's talking: their portrait and name):
//   show(id, {who, prompt, en, ask, known: [2 ids], how})   "show and name": the thing is held up and named
//        ("¡Mira! ¡[id]!", its picture over the box), then "¿Qué es?" with the new word (written, no picture) among
//        known ones (their pictures): pick the one you don't know yet. Without known words it is just named.
//   watch(id, {who, prompt, en, act: function* () {...}, ask, known})   "watch and do" (actions, commands): it is said,
//        act() shows it happen; then "¡Ahora tú!" (the mic is on): pick or say it, and act() happens again for you.
//   listen(id, {who, prompt, en, sound: () => {...}, answer: id of the right picture (default id), known})   "listen and
//        point": the word is heard (and sound() plays), the prompt shows a speaker; pick its picture among known ones.
//   find(id, {who, prompt, en, map, at: [x, y], wrong: [[x, y], ...]})   "find it": someone needs a thing ("¿Y mi
//        [id]?"); it returns at once, and the child walks to the right thing on the map and taps it (field.js asks
//        spotAt / runFind; hint.js and the bot see targets(f)). A wrong thing names itself and gets a gentle "¿...?".
//        found(id) once it was found; seeking(who) the word someone is waiting for (for their thought bubble).
//   meet(id, how, o)  meet a word from a puzzle of your own (not a generator): the model and the small celebration
//   note(ids, o) -> Wait  the small celebration for words just met: the word's new card pops up (cards.js: its picture,
//        its blue word, a seed), says the word and flies into the deck; yield it to let the word be heard (~0.6 s)
//   known(id, n) n met words to go with id in a one-unknown puzzle (another topic, stronger first; none alike)
//   form(id, choices, o) a review question's form for the word's stage (below)
//   again(id, {who, prompt, en, extra})  a SLIPPING word (words.js: missed 3 times) met again instead of the same
//        question: it is held up and named like the first time, then a one-unknown puzzle (hear it, pick its picture
//        among 2 known ones; a cued use: the next questions move it on). G.review.ask does it by itself for a
//        slipping word not re-introduced yet (W.needsReintro), and so does the dog's warm-up (warmup.js).
// Pacing (words.js G.budget, AUDIT 2.9): show / watch / listen ask G.budget.canIntro themselves. A chapter's beat always
// introduces (the story). In the open world, on a day with no room for a new word, the moment still happens, without a
// card or a puzzle: the thing is held up and its name said (show), it happens (watch), it's heard (listen); then a word
// she knows that is due is asked instead (G.review.ask: a review; once per word in I.DEFER_GAP play seconds), and the new
// word waits in the queue (G.budget.defer) to be introduced first when there's room: the dog's warm-up brings it after
// its cards (queued(o), src/warmup.js), or the next time she meets the thing. They return false then (nothing met).
// note() never shows a card for a word not met.
//   queued(o)  the first word waiting in the queue, introduced now if pacing allows (a show-and-name, o.who): true if met
// G.review.ask(id, {who, prompt, en, pool, layout}) one question for a met word, fit for its stage (I.form): met or
//   known -> hear it (a speaker in the prompt) and pick its picture among picture-only cards; remembered+ -> that, or its
//   picture with the question for its kind of word (G.qform: ¿Quién es?, ¿Qué hace?, ¿De qué color es?, ¿Cuántas hay?...)
//   and its word among word-only cards (none alike). One in three of them (stage 2+, the mic on, not "quiet") starts with
//   "say it first" (G.sayFirst, learn.js): the picture and the big mic alone, then the cards. Counted as review.
// Page puzzles (G.pages): a notebook page's sparkle on the map (maps.js `pages`) is a puzzle: 4 pictures of words from
//   that page you've met, and their 4 words, shuffled; tap a picture and then its word (or drag the word onto it).
//   Right: they join and the word is said; wrong: a wobble and "¡Casi!". The last pair isn't asked (nothing left to
//   choose): it joins by itself with a sparkle (a forced pair for the model). All four: a star. (A page of three words, La huerta: three.) ready(page) (4+ met words,
//   not solved, or solved on an earlier day with 2+ of them due again), words(page), run(page) (yieldable), visible()
//   (the notebook's pages: those with a met word).
'use strict';
(function () {
  const D = () => G.data, S = () => G.st, Wd = () => G.words;
  const I = G.intro = {};
  const TT = (t, en) => ({ t, en });
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = G.r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sayAs = (who, pages, o) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, o || {}));
  // a word held up or called out, with its article from the word (G.requests.the): "¡Mira! ¡Una [llama]!", "¡Un [conejo]!",
  // "¡Mira! ¡[salta]!" (not a noun), "¿Y mi [pelota]?" / "¿Y mis [zapatos]?"
  const L = G.requests.LINES, the = (id, o) => G.requests.the(id, o);
  L.un = id => the(id, { un: 1, cap: 1, bang: 1 });
  L.mira = id => '¡Mira! ' + L.un(id);
  L['intro.mine'] = id => '¿Y ' + the(id, { my: 'mi' }) + '?';

  // ---------- the small celebration: a new card ----------
  // The word's card pops up where it was met (cards.js: its picture, its word, a seed in its pot), the word is said, and
  // it flies into the deck in the corner. (It used to be a notebook page; the notebook comes later, docs/PLAYTEST_NOTES.md.)
  let noteUntil = 0;
  I.note = function (ids, o = {}) {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(id => (G.words.item ? G.words.item(id) : D().words[id]) && Wd().met(id)); // (a word or a phrase: phrases.js; never one not met: pacing)
    const w = new G.Wait();
    if (!ids.length) { w.resolve(); return w; }
    ids.forEach((id, k) => { if (G.cards) G.cards.show(id, Object.assign({ fresh: true, delay: k * 36 }, o)); });
    const until = G.frame + 36 + (ids.length - 1) * 36;
    noteUntil = Math.max(noteUntil, until + 50);
    w.done = () => G.frame >= until || w.fin; // yieldable: a short pause so the word is heard
    return w;
  };
  I.step = function () {};
  I.busy = () => G.frame < noteUntil;
  I.draw = function () {};
  I.meet = function (id, how, o = {}) { const fresh = Wd().meet(id, how || 'meet', o); if (fresh) I.note([id]); return fresh; };

  // ---------- picking the known words for a one-unknown puzzle ----------
  // (never one that looks or sounds like it, or like another of them, while there are others: G.wordsAlike, learn.js)
  I.known = function (id, n = 2, o = {}) {
    const top = D().words[id] && D().words[id].topic, ex = o.exclude || [];
    const c = Wd().list(1).filter(k => k !== id && ex.indexOf(k) < 0 && G.iconDrawn(k) && G.baseForm(k) !== G.baseForm(id));
    const score = k => (D().words[k].topic === top ? 2 : 0) + (Wd().stage(k) >= 2 ? 0 : 1) + G.rand();
    return G.pickApart(id, c.sort((a, b) => score(a) - score(b)), n);
  };
  const ask = (id, o, choices, extra) => {
    const ch = shuffle(choices.slice());
    return Object.assign({ prompt: o.ask || '¿Qué es?', en: o.askEn || 'Which one is it?', choices: ch, answer: ch.findIndex(c => c.word === (o.answer || id)), layout: 'cards', who: o.who || null, intro: id, how: o.how }, extra || {});
  };

  // ---------- pacing: no room for a new word today (words.js G.budget) ----------
  const later = id => !Wd().met(id) && !!G.budget && !G.budget.canIntro(1, { id });
  // a due word she knows to ask instead: the same topic first, then any (with a picture, and 2 other met words to choose from)
  I.reviewFor = function (id) {
    if (Wd().count(1) < 3) return null;
    const ok = k => k !== id && G.iconDrawn(k) && G.baseForm(k) !== G.baseForm(id) && G.review.fresh(k), top = D().words[id] && D().words[id].topic; // (never one asked a moment ago)
    return G.review.next({ topic: top, filter: ok }) || G.review.next({ filter: ok });
  };
  // the moment without the new word: what she sees and hears (see()), then a review (once per word in I.DEFER_GAP play
  // seconds: the same swing ridden again and again isn't a question every time; and only while the talk has room and
  // that person hasn't asked a review in this place today: G.review.room, words.js); the word waits in the queue
  I.DEFER_GAP = 120;
  const deferAt = {};
  function* deferred(id, o, see) {
    G.budget.defer(id, o.how || 'show');
    if (G.vocabLog) G.vlog('shown', id, { via: 'deferred', who: o.who || null });
    yield* see();
    const now = Wd().now(), again = deferAt[id] != null && now >= deferAt[id] && now - deferAt[id] < I.DEFER_GAP;
    deferAt[id] = now;
    const k = !again && G.review.room(o.who || null) && I.reviewFor(id);
    if (k) { yield* G.review.ask(k, { who: o.who || null }); G.review.mark(o.who || null); if (G.hearts) G.hearts.talkGreeted = o.who || 'intro'; }
    return false;
  }
  I.queued = function* (o = {}) {
    if (!G.budget) return false;
    const id = G.budget.queue().find(k => G.iconDrawn(k));
    if (!id || !G.budget.canIntro(1, { id })) return false;
    yield* I.show(id, { who: o.who || null, prompt: L.mira(id), en: o.en || 'Look! Something you saw before: here is its name.', how: 'queue' });
    return Wd().met(id);
  };

  // ---------- show and name ----------
  I.show = function* (id, o = {}) {
    if (!D().words[id]) return false;
    if (later(id)) return yield* deferred(id, o, function* () { yield sayAs(o.who, [TT(o.prompt || L.mira(id), o.en || 'Look!')], { show: id }); });
    yield sayAs(o.who, [TT(o.prompt || L.mira(id), o.en || 'Look!')], { show: id });
    if (Wd().met(id)) return true;
    const known = o.known || I.known(id, 2);
    if (!known.length) { I.meet(id, o.how || 'show', { who: o.who }); yield 40; return true; }
    // the new word written, the known ones as pictures: which word is this thing? (the one you don't know yet)
    yield* G.ask(ask(id, Object.assign({ how: 'show' }, o), [{ word: id, look: 'text' }].concat(known.map(k => ({ word: k, look: 'both' }))), { show: id }));
    return true;
  };

  // ---------- watch and do ----------
  I.watch = function* (id, o = {}) {
    if (!D().words[id]) return false;
    if (later(id)) return yield* deferred(id, Object.assign({ how: 'watch' }, o), function* () { yield sayAs(o.who, [TT(o.prompt || L.mira(id), o.en || 'Watch!')]); if (o.act) yield* o.act(); });
    yield sayAs(o.who, [TT(o.prompt || L.mira(id), o.en || 'Watch!')]);
    if (o.act) yield* o.act();
    const known = o.known || I.known(id, 2);
    if (known.length && !Wd().met(id)) {
      yield* G.ask(ask(id, Object.assign({ how: 'watch', ask: o.ask || '¡Ahora tú!', askEn: o.askEn || 'Now you! (say it, or tap it)' }, o), [{ word: id, look: 'both' }].concat(known.map(k => ({ word: k, look: 'both' })))));
    } else I.meet(id, o.how || 'watch', { who: o.who });
    if (o.act) yield* o.act();
    return true;
  };

  // ---------- listen and point ----------
  I.listen = function* (id, o = {}) {
    if (!D().words[id]) return false;
    if (later(id)) return yield* deferred(id, Object.assign({ how: 'listen' }, o), function* () { if (o.sound) o.sound(); yield sayAs(o.who, [TT(o.prompt || '¡[' + id + ']!', o.en || 'Listen!')]); });
    const right = o.answer || id;
    const known = o.known || I.known(right, 2, { exclude: [id] });
    if (o.sound) o.sound();
    const prompt = o.prompt || '¡[' + id + ']!';
    if (!known.length) { yield sayAs(o.who, [TT(prompt, o.en || 'Listen!')]); I.meet(id, o.how || 'listen', { who: o.who }); yield 40; return true; }
    const q = ask(id, Object.assign({ how: 'listen', answer: right, ask: prompt, askEn: o.en || 'Listen! Which one?' }, o), [{ word: right, look: 'pic' }].concat(known.map(k => ({ word: k, look: 'pic' }))), { mask: [id] });
    yield* G.ask(q); // (when the sound is the new word, its animal, the right picture, is what's credited)
    if (right !== id && !Wd().met(id)) { I.meet(id, o.how || 'listen', { who: o.who }); yield 40; }
    return true;
  };

  // ---------- a slipping word, met again ----------
  // (o.extra: more for its question, e.g. the warm-up's skip button and its cards)
  I.again = function* (id, o = {}) {
    if (!D().words[id] || !Wd().met(id)) return false;
    Wd().reintroduced(id);
    if (G.vocabLog) G.vlog('shown', id, { via: 'again', who: o.who || null });
    yield sayAs(o.who, [TT(o.prompt || L.mira(id), o.en || 'Look! (this word again: listen, then find it)')], { show: id });
    const known = G.iconDrawn(id) ? I.known(id, 2) : [];
    if (known.length < 2) return true;
    const q = ask(id, Object.assign({ how: 'again', ask: '¿[' + id + ']?', askEn: 'Which one? (listen)' }, o), [{ word: id, look: 'pic' }].concat(known.map(k => ({ word: k, look: 'pic' }))), Object.assign({ mask: [id], reintro: true }, o.extra || {}));
    return yield* G.ask(q);
  };

  // ---------- find it (on the map) ----------
  const finds = () => { const s = G.state; if (!s.finds || typeof s.finds !== 'object') s.finds = {}; return s.finds; };
  const key = (x, y) => x + ',' + y;
  I.find = function* (id, o = {}) {
    if (!D().words[id] || !o.map || !o.at) return false;
    finds()[id] = { who: o.who || null, map: o.map, at: key(...o.at), wrong: (o.wrong || []).map(p => key(...p)), found: false, how: o.how || 'find', pics: o.pics || null };
    S().autosave();
    if (G.vocabLog) G.vlog('find-start', id, { who: o.who || null });
    if (!o.silent) yield sayAs(o.who, [TT(o.prompt || L['intro.mine'](id), o.en || 'Where is my...? (find it and tap it)')]);
    return true;
  };
  // o.pics: [[x, y, icon], ...] picture bubbles over the places to choose from (places: the right one shows its own
  // picture, the others theirs, no words), drawn until it's found
  I.drawUnder = function (f, ctx) {
    if (!G.state || !f || G.top() !== f) return;
    const F = finds();
    for (const id in F) {
      const s = F[id]; if (s.found || s.map !== f.mapId || !s.pics) continue;
      for (const [x, y, ic] of s.pics) G.drawAlert(ctx, ic, x * G.TILE - Math.round(f.cam.x), y * G.TILE - Math.round(f.cam.y) + 4, f.t + x * 7);
    }
  };
  I.clearFind = id => { if (G.state && finds()[id]) delete finds()[id]; };
  I.found = id => !!(G.state && finds()[id] && finds()[id].found);
  I.seeking = who => { if (!G.state) return null; const F = finds(); for (const id in F) if (F[id].who === who && !F[id].found) return id; return null; };
  I.spotAt = function (f, x, y) {
    if (!G.state || !f) return null;
    const F = finds(), k = key(x, y);
    for (const id in F) { const s = F[id]; if (s.found || s.map !== f.mapId) continue; if (s.at === k) return { id, right: true }; if (s.wrong.indexOf(k) >= 0) return { id, right: false }; }
    return null;
  };
  I.runFind = function* (f, m, x, y) {
    const s = finds()[m.id];
    if (!m.right) { // not that one: it says what it is (if it has a word), and a gentle "¿...?"
      if (G.vocabLog) G.vlog('find-wrong', m.id);
      if (!(G.world && G.world.nameTile(f, x, y, { noMic: true, noIntro: true }))) G.audio.sfx('boop');
      const [sx, sy] = [x * G.TILE + 12 - Math.round(f.cam.x), y * G.TILE - Math.round(f.cam.y)];
      G.fx.say('¿...?', sx, sy - 14, '#ffd8a8'); yield 30; return;
    }
    s.found = true; f.wig = { x, y, t: 18 };
    const [sx, sy] = [x * G.TILE + 12 - Math.round(f.cam.x), y * G.TILE + 8 - Math.round(f.cam.y)];
    G.audio.sfx('chime'); G.fx.burst(sx, sy);
    if (G.cards) G.cards.at(sx, sy);
    if (Wd().meet(m.id, s.how || 'find', { who: s.who })) yield I.note([m.id]); // (a word already met: found again, its card grows)
    else if (G.cards) G.cards.grow(m.id, 'find', { x: sx, y: sy });
    yield 20;
    S().autosave();
  };
  I.targets = function (f) {
    if (!G.state || !f) return [];
    const F = finds(), T = G.TILE, out = [];
    for (const id in F) { const s = F[id]; if (!s.found && s.map === f.mapId) { const [x, y] = s.at.split(',').map(Number); out.push({ x: x * T + 12, y: y * T + 12, find: id }); } }
    return out;
  };

  // ---------- the right question for each kind of word (docs/AUDIT_2026-10.md 2.11) ----------
  // Not "¿Qué es?" for everything: G.qform.of(id, o) -> {kind, t (the question), en (English help), show (the picture held
  // up), thing (numbers: what is counted)}. By the word's topic (content/es/words.js) and its grammar:
  //   thing     ¿Qué es?            things, food, places, the body, clothes, the weather's things
  //   things    ¿Qué son?           a plural-only word (los ojos, los zapatos, las burbujas)
  //   animal    ¿Quién es?          animals (as the album asks: src/album.js); person: ¿Quién es? (la abuela, el bebé);
  //   people    ¿Quiénes son?       la familia
  //   action    ¿Qué hace?          actions shown being done (corre, salta, busca: the command is also "he runs")
  //   command   ¿Qué le dices?      the dog's commands that aren't "he does" (ven, siéntate, dame la pata)
  //   like      ¿Qué le gusta hacer?  nadar (a verb as it is: "Le gusta nadar")
  //   how       ¿Cómo va?           rápido, despacio;  quality: ¿Cómo es? (grande, pequeño);  weather: ¿Qué tiempo hace? (frío)
  //   hot       ¿Cómo está el chocolate?  caliente, asked about a hot THING held up (Q.PIC: the mug of hot chocolate;
  //                                 "¿Cómo está?" while el chocolate isn't met), never about a person (its own picture is a
  //                                 hot face: "es / está caliente" about a person is slang, S2 review #8/#20); in review
  //                                 questions its card shows that thing too (Q.PIC), and the thing is never another card
  //   color     ¿De qué color es?   feel: ¿Cómo está? (bien, cansado, feliz, triste);  say: ¿Qué dice? (greetings,
  //                                 phrases, animal sounds)
  //   number    ¿Cuántos hay? / ¿Cuántas hay?  with a heap of a met thing to count (its gender: G.requests.o)
  // Templates built from a word are in G.requests.LINES (tools/test-spanish.js runs every word through them): 'q.howmany'
  // (the counted thing -> "¿Cuántas hay?") and 'q.ask' (a word -> its question).
  const Q = G.qform = {};
  Q.KINDS = {
    thing: ['¿Qué es?', 'What is it?'], things: ['¿Qué son?', 'What are they?'], animal: ['¿Quién es?', 'Who is it?'],
    person: ['¿Quién es?', 'Who is it?'], people: ['¿Quiénes son?', 'Who are they?'], action: ['¿Qué hace?', 'What are they doing?'],
    command: ['¿Qué le dices?', 'What do you tell him?'], like: ['¿Qué le gusta hacer?', 'What do they like to do?'],
    how: ['¿Cómo va?', 'How does it go?'], quality: ['¿Cómo es?', 'What is it like?'], weather: ['¿Qué tiempo hace?', 'What is the weather like?'],
    color: ['¿De qué color es?', 'What colour is it?'], feel: ['¿Cómo está?', 'How do they feel?'], say: ['¿Qué dice?', 'What do they say?'],
    number: [null, 'How many are there?'], hot: ['¿Cómo está?', 'How is it? (hot or cold?)'],
  };
  Q.OWN = { ven: 'command', sientate: 'command', pata: 'command', nadar: 'like', rapido: 'how', despacio: 'how', grande: 'quality', pequeno: 'quality', caliente: 'hot', frio: 'weather', familia: 'people' };
  // a word whose own picture would ask the wrong thing: the thing a review question shows for it instead (held up, and on
  // its card), and that thing's word is never one of its cards (G.review.ask, the dog's warm-up: Q.clash)
  Q.PIC = { caliente: 'chocolate' };
  Q.clash = (a, b) => Q.PIC[a] === b || Q.PIC[b] === a;
  Q.card = c => (c && Q.PIC[c.word] && D().words[Q.PIC[c.word]] ? Object.assign(c, { img: D().words[Q.PIC[c.word]] }) : c);
  Q.kind = function (id) {
    const w = D().words[id]; if (!w) return 'thing';
    if (Q.OWN[id]) return Q.OWN[id];
    const t = w.topic, n = G.requests.noun(id);
    if (t === 'numeros' || w.n) return 'number';
    if (t === 'colores') return 'color';
    if (t === 'sentir') return 'feel';
    if (t === 'saludos' || t === 'sonidos') return 'say';
    if (!n) return 'action'; // (the park's actions and the dog's tricks: corre, salta, busca, gira)
    if (t === 'familia') return 'person';
    if (G.requests.animate(id)) return 'animal';
    return n.plOnly ? 'things' : 'thing';
  };
  // what a number question counts: a met thing with its own picture that can be counted (uno: a masculine one, "uno"
  // not "una"); none yet: stars
  Q.thing = function (id) {
    const ok = k => { const n = G.requests.noun(k); return !!n && !n.plOnly && !(D().mass || []).includes(k) && !G.requests.ONLY.includes(k) && G.iconDrawn(k) && ['thing', 'animal'].includes(Q.kind(k)) && (id !== 'uno' || n.g === 'm'); };
    const L = Wd().list(1).filter(ok);
    return L.length ? L[G.r(L.length)] : 'estrella';
  };
  Q.of = function (id, o = {}) {
    const kind = Q.kind(id), K = Q.KINDS[kind];
    if (kind === 'number') {
      const thing = o.thing || Q.thing(id), w = D().words[thing], n = G.requests.numOf(id);
      return { kind, t: L['q.howmany'](thing), en: K[1], show: { icon: w ? w.icon : thing, col: w && w.col, count: n }, thing };
    }
    if (kind === 'hot') { const th = Q.PIC[id] || 'chocolate'; return { kind, t: Wd().met(th) ? '¿Cómo está ' + G.requests.the(th) + '?' : K[0], en: K[1], show: th, thing: th }; } // (¿Cómo está el [chocolate]?)
    return { kind, t: K[0], en: K[1], show: id };
  };
  L['q.howmany'] = id => '¿Cuánt' + G.requests.o(id, true) + ' hay?'; // ¿Cuántas hay? (manzanas) / ¿Cuántos hay? (huevos)
  L['q.ask'] = id => Q.of(id).t;

  // ---------- a review question's form, fit for the word's stage (G.review.ask, the dog's warm-up) ----------
  // c: its choices (G.wordChoices); o.say: say it first (G.sayFirst.want); o.recall: a known-well word (stage 3+) asked
  // from its picture (word-only cards) rather than heard; o.pic: true / false, from its picture or heard (the warm-up
  // alternates by the times it was asked). -> {prompt, en, show, display, sayFirst, sayEn, sayAlt}. No
  // give-aways (docs/AUDIT_2026-10.md 2.7); every form a tap answers moves the box (uncued: a quiet day or a broken mic
  // never stalls a word, S2 review #1/#16):
  //   met, known (1-2)   heard (a speaker), picked among picture-only cards: the first review is picture-only
  //   remembered+ (3+)   heard -> its picture, or (every other time: r.n even) its picture held up with its question
  //                      (¿Quién es?, ¿Qué hace?...) -> its word among word-only cards, none alike (else heard)
  //   say it first       its picture held up with its question and the big mic alone; if it isn't said, the cards:
  //                      word-only at 3+ (none alike), else (sayAlt) the picture put away, the word heard, picture-only
  //                      cards (a plain pick: the picture was just held up, so no recall from memory, learn.js)
  I.form = function (id, c, o = {}) {
    const st = Wd().stage(id), r = Wd().rec(id), K = Q.of(id), apart = G.wordsApart(c.choices.map(x => x.word));
    const recall = st >= 3 && apart, heard = { prompt: '¿[' + id + ']?', en: 'Which one? (listen)', display: 'pic' };
    if (o.say) return Object.assign({ prompt: K.t, en: K.en, show: K.show, sayFirst: true, sayEn: K.en + ' Say it! (the mic)' }, recall ? { display: 'text' } : { display: 'pic', sayAlt: { prompt: heard.prompt, en: heard.en } });
    if (recall && (o.pic != null ? o.pic : o.recall || r.n % 2 === 0)) return { prompt: K.t, en: K.en, show: K.show, display: 'text' }; // (o.pic: the caller alternates itself)
    return heard;
  };
  // the choices of a review question: its picture's thing (Q.PIC) never a card beside it; a caliente card shows that thing
  I.cards = c => { c.choices.forEach(Q.card); return c; };

  // ---------- a review question for a word, fit for its stage ----------
  // (its distractors: words of its topic first, then any met word; none looking or sounding like another card)
  G.review.ask = function* (id, o = {}) {
    const st = Wd().stage(id); if (st < 1) return false;
    if (Wd().needsReintro(id)) return yield* I.again(id, { who: o.who || null }); // (slipping: met again, not the same question)
    const top = D().words[id].topic, met = Wd().list(1).filter(k => k !== id && G.baseForm(k) !== G.baseForm(id) && !Q.clash(id, k));
    const pool = o.pool || shuffle(met.filter(k => D().words[k].topic === top)).concat(shuffle(met.filter(k => D().words[k].topic !== top)));
    const c = I.cards(G.wordChoices(id, [id].concat(pool), Math.min(3, pool.length + 1), o.pool ? {} : { ordered: true }));
    const f = I.form(id, c, { say: G.sayFirst.want(id) }); // (never right after the word was said or shown: SF.can)
    if (o.prompt) Object.assign(f, { prompt: o.prompt, en: o.en || f.en });
    return yield* G.ask(Object.assign(f, { choices: c.choices, answer: c.answer, layout: o.layout || 'cards', who: o.who || null, review: Wd().isOld(id) }));  // (a word met a minute ago, Canelo's "?": its first use, not a review)
  };

  // ---------- page puzzles ----------
  const P = G.pages = {};
  const pageWords = id => (D().pages[id] ? D().pages[id].words : []);
  P.visible = () => D().pageOrder.filter(p => pageWords(p).some(w => Wd().met(w)));
  P.solvedDay = id => { const v = G.state && G.state.pages[id]; return !v ? null : typeof v === 'object' ? v.d | 0 : 0; };
  // a page's sparkle waits for 4 of its words KNOWN (stage 2+: picked once without a cue), known before this session
  // (CURRICULUM.md 5: at the earliest in the next session after the 4th), and comes back on a later day with 2+ due
  const ripe = w => { const r = Wd().rec(w); return !!r && r.st >= 2 && (r.ms < Wd().sess() || r.how === 'old' || r.how === 'learn'); };
  const need = id => Math.min(4, pageWords(id).length); // (a page of three words, La huerta: three to match)
  P.need = need;
  P.AUTO = 22; // frames before the last pair joins by itself (P.lastForced: its word, for the tests)
  P.ready = function (id) {
    if (!G.state || !D().pages[id]) return false;
    const met = pageWords(id).filter(ripe); if (met.length < need(id)) return false;
    const d = P.solvedDay(id); if (d == null) return true;
    return d < Wd().day() && met.filter(w => Wd().due(w)).length >= 2;
  };
  // the 4 words to match (never one only met): due ones first, then the weakest, then the least recently met
  P.words = function (id) {
    const met = pageWords(id).filter(w => Wd().stage(w) >= 2);
    const sc = w => (Wd().due(w) ? 0 : 10) + Wd().stage(w) * 2 + G.rand();
    return shuffle(met.sort((a, b) => sc(a) - sc(b)).slice(0, 4));
  };
  P.run = function* (id) {
    const ids = P.words(id); if (ids.length < need(id)) return false;
    if (G.vocabLog) { ids.forEach(w => G.vlog('prompt', w, { kind: 'review', st: Wd().stage(w), mode: 'match', via: 'page' })); G.vlog.ev({ ty: 'puzzle', page: id }); }
    const r = yield P.open(id, ids);
    if (!r.result) return false; // closed before the end
    S().solvePage(id);
    yield 10;
    return true;
  };
  class PagePuzzle {
    constructor(w, id, ids) {
      G.toastT = 0; this.transparent = true; this.w = w; this.page = id; this.t = 0;
      this.pics = ids.slice(); this.words = shuffle(ids.slice()); // word card j says words[j]
      this.match = {};        // picture k -> matched (true)
      this.tried = {};        // word id -> a wrong attempt was made with its picture
      this.sel = null;        // {kind: 'pic' | 'word', k}
      this.miss = null;       // {pk, wk, t}
      this.drag = null;       // word card j being dragged
      this.done = 0; this.ki = 0;
    }
    onEnter() { G.audio.sfx('note'); }
    picRect(k) { return { x: 22 + (4 - this.pics.length) * 36 + k * 72, y: 42, w: 60, h: 58 }; } // (fewer than four: centred)
    wordRect(j) {
      const k = this.pics.indexOf(this.words[j]);
      if (this.match[k]) { const p = this.picRect(k); return { x: p.x - 2, y: p.y + 64, w: 64, h: 24, joined: true }; }
      return { x: 20 + (4 - this.pics.length) * 36 + j * 72, y: 150, w: 64, h: 26 };
    }
    closeXY() { return [G.W - 30, 8]; }
    hintXY() { return null; } // never point at an answer
    tryPair(k, j) {
      const pid = this.pics[k], wid = this.words[j];
      if (this.match[k] || this.auto) return;
      if (pid === wid) {
        this.match[k] = true; this.sel = null;
        const r = this.picRect(k); G.audio.sfx('chime'); G.fx.burst(r.x + r.w / 2, r.y + r.h / 2); G.speak(G.baseForm(pid));
        const first = !this.tried[pid];
        Wd().answerRight(pid, { mode: 'match', firstTry: first, review: true, noStar: true });
        // one pair left: nothing to choose any more, so it isn't "answered": it joins by itself a moment later, with a
        // little sparkle (docs/AUDIT_2026-10.md 2.7: no forced last pair)
        const left = this.pics.map((p, i) => i).filter(i => !this.match[i]);
        if (left.length === 1) this.auto = { k: left[0], t: 0 };
        else if (!left.length) this.finish();
        return;
      }
      if (!this.tried[pid]) { this.tried[pid] = true; Wd().answerWrong(pid); }
      if (G.vocabLog) G.vlog('wrong', wid, { ans: pid, via: 'page' });
      this.miss = { pk: k, wj: j, t: 0 }; this.sel = null;
      G.audio.sfx('boop'); const r = this.picRect(k); G.fx.say('¡Casi!', r.x + r.w / 2, r.y - 6, '#ffd8a8');
    }
    finish() { this.done = 1; G.audio.jingle('item'); G.fx.confetti(40, 200, 1, 20); G.fx.confetti(G.W - 40, 200, -1, 20); }
    // the last pair joining by itself: its word card glides up to its picture, sparkles, and the word is said. The model
    // hears it as forced (words.js answerRight {forced}: it proves nothing, so it doesn't count as a recall)
    autoJoin() {
      const k = this.auto.k, pid = this.pics[k], r = this.picRect(k);
      this.match[k] = true; this.auto = null; P.lastForced = pid;
      G.audio.sfx('note'); G.speak(G.baseForm(pid));
      for (let i = 0; i < 6; i++) G.fx.twinkle(r.x + 4 + Math.random() * (r.w - 8), r.y + 4 + Math.random() * (r.h + 20));
      Wd().answerRight(pid, { mode: 'match', forced: true, firstTry: !this.tried[pid], review: true, noStar: true });
      this.finish();
    }
    tapPic(k) {
      if (this.match[k]) return;
      if (this.sel && this.sel.kind === 'word') { this.tryPair(k, this.sel.k); return; }
      this.sel = { kind: 'pic', k }; G.audio.sfx('cursor');
    }
    tapWord(j) {
      const k = this.pics.indexOf(this.words[j]); if (this.match[k]) { G.speak(G.baseForm(this.words[j])); return; }
      G.speak(G.baseForm(this.words[j])); // hearing a word never gives its picture away
      if (this.sel && this.sel.kind === 'pic') { this.tryPair(this.sel.k, j); return; }
      this.sel = { kind: 'word', k: j }; G.audio.sfx('cursor');
    }
    update() {
      this.t++; if (this.miss && ++this.miss.t > 18) this.miss = null;
      if (this.done) {
        if (++this.done === 30) { G.state.stars++; G.fx.flyStar(G.W / 2, 110, 0); S().autosave(); }
        if (this.done > 70 && (G.input.tap() || G.input.p('A') || G.input.p('B') || this.done > 150)) { G.pop(); this.w.resolve(true); }
        return;
      }
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(false); return; }
      if (this.auto) { if (++this.auto.t >= P.AUTO) this.autoJoin(); return; } // (the last pair joins by itself)
      const ptr = G.input.ptr;
      // dragging a word card onto a picture
      if (ptr.down && this.drag == null && ptr.held > 6) {
        const j = this.words.findIndex((w, j) => { const r = this.wordRect(j); return !r.joined && ptr.sx >= r.x && ptr.sx < r.x + r.w && ptr.sy >= r.y && ptr.sy < r.y + r.h; });
        if (j >= 0 && Math.abs(ptr.x - ptr.sx) + Math.abs(ptr.y - ptr.sy) > 6) { this.drag = j; this.sel = null; }
      }
      if (this.drag != null && !ptr.down) {
        const j = this.drag; this.drag = null;
        const k = this.pics.findIndex((p, k) => { const r = this.picRect(k); return ptr.x >= r.x - 4 && ptr.x < r.x + r.w + 4 && ptr.y >= r.y - 4 && ptr.y < r.y + r.h + 24; });
        if (k >= 0) this.tryPair(k, j);
        return;
      }
      if (this.drag != null) return;
      const tap = G.input.tap();
      if (tap && this.t > 8) {
        const k = this.pics.findIndex((p, k) => G.tapIn(this.picRect(k)));
        if (k >= 0) { this.tapPic(k); return; }
        const j = this.words.findIndex((w, j) => G.tapIn(this.wordRect(j)));
        if (j >= 0) { this.tapWord(j); return; }
      }
      // keys: left / right moves along the pictures (or, once one is chosen, the words); A takes it
      const words = this.sel && this.sel.kind === 'pic', d = G.input.repDir(14, 6);
      const free = [0, 1, 2, 3].filter(i => !this.match[words ? this.pics.indexOf(this.words[i]) : i]);
      if (!free.length) return;
      if (free.indexOf(this.ki) < 0) this.ki = free[0];
      if (d === 'left' || d === 'right') { const i = free.indexOf(this.ki); this.ki = free[(i + (d === 'left' ? -1 : 1) + free.length) % free.length]; G.audio.sfx('cursor'); }
      if (G.input.p('A') && this.t > 8) { if (words) this.tapWord(this.ki); else this.tapPic(this.ki); this.ki = -1; }
    }
    draw(ctx) {
      const u = Math.min(1, this.t / 10);
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      ctx.globalAlpha = u;
      const tp = D().topics[D().pages[this.page].topic];
      G.drawIcon16(ctx, 'pagina', 18, 12);
      G.textC(ctx, G.fill(tp.name), G.W / 2, 18, '#a05020', null);
      if (G.enVisible()) G.textC(ctx, 'Match each picture with its word', G.W / 2, 28, '#a09070', null);
      G.closeBtn(ctx, ...this.closeXY());
      const keys = G.hint && G.hint.keyboard && G.hint.keyboard(), keyPic = keys && !(this.sel && this.sel.kind === 'pic'), wob = (m, on) => (m && on ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 18)) : 0);
      this.pics.forEach((id, k) => {
        const r = this.picRect(k), sel = this.sel && this.sel.kind === 'pic' && this.sel.k === k, ok = this.match[k], dx = wob(this.miss, this.miss && this.miss.pk === k);
        const bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        ctx.fillStyle = ok ? '#e8b830' : sel ? '#3a56c8' : '#8a6a40'; ctx.fillRect(r.x - 2 + dx, r.y - 2 - bob, r.w + 4, r.h + 4);
        ctx.fillStyle = ok ? '#fff4c8' : '#fffaf0'; ctx.fillRect(r.x + dx, r.y - bob, r.w, r.h);
        G.drawIcon16(ctx, id, r.x + 6 + dx, r.y + 5 - bob, 3);
        if (keyPic && k === this.ki && !ok && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 11, '#a05020', null);
      });
      this.words.forEach((id, j) => {
        let r = this.wordRect(j); const pk = this.pics.indexOf(id), ok = this.match[pk], sel = this.sel && this.sel.kind === 'word' && this.sel.k === j;
        if (this.drag === j) { const p = G.input.ptr; r = { x: p.x - r.w / 2, y: p.y - r.h / 2, w: r.w, h: r.h }; }
        if (this.auto && this.auto.k === pk) { const p = this.picRect(pk), u = Math.min(1, this.auto.t / P.AUTO), e = u * u * (3 - 2 * u); r = { x: r.x + (p.x - 2 - r.x) * e, y: r.y + (p.y + 64 - r.y) * e, w: 64, h: r.h + (24 - r.h) * e }; } // (the last word gliding up to its picture)
        const dx = wob(this.miss, this.miss && this.miss.wj === j), bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
        ctx.fillStyle = ok ? '#e8b830' : sel ? '#3a56c8' : '#5a3810'; ctx.fillRect(r.x - 1 + dx, r.y - 1 - bob, r.w + 2, r.h + 2);
        ctx.fillStyle = ok ? '#fff4c8' : sel ? '#dce4ff' : '#ffffff'; ctx.fillRect(r.x + dx, r.y - bob, r.w, r.h);
        const st = Wd().stage(id);
        G.textC(ctx, G.baseForm(id), r.x + r.w / 2 + dx, r.y + r.h / 2 - 4 - bob, st >= 3 ? '#a06008' : '#2860a8', null);
        if (keys && !keyPic && !ok && j === this.ki && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 11, '#a05020', null);
        if (ok) { ctx.fillStyle = '#c89020'; ctx.fillRect(r.x + r.w / 2, r.y - 6, 1, 6); } // joined to its picture
      });
      ctx.globalAlpha = 1;
      if (this.done) { G.bigText(ctx, '¡Muy bien!', G.W / 2, 186, 2, '#f8d040', '#5a2c04'); }
    }
  }
  P.open = function (id, ids) { const w = new G.Wait(); G.push(new PagePuzzle(w, id, ids)); return w; };
})();
