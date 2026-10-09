// The story's chapters 1-10 (src/chapters.js, content/es/story-c01-c10.js; docs/CURRICULUM.md), played start to finish on
// an iPad page by taps, choosing what to do like the hint hand (tools/playflow.js), with some answers SPOKEN through a
// fake recognizer; the days in between are real calendar days (G.debug.dayShift). Checked on the way:
//   - day 1: Canelo bursts in within the first minute; chapters 1 and 2, their six words; then "tomorrow" (Mamá's sun
//     bubble, which the hint hand passes by)
//   - every chapter starts only when the one before is done and today's budget allows: at most 6 new words a game day,
//     8 a calendar date; no new chapter while 10+ words are only met; morning chapters open first thing in a session
//   - every new word is met in its chapter (the words of chapters 1-10 exactly), and no card ever shows a word not met
//     yet (no unmet distractors)
//   - a save and reload in the middle of chapter 7 (Canelo lost: he stays lost, the chapter goes on where it was)
//   - the first evening (chapter 9) comes ~5 minutes after chapter 8; after chapter 10 the older errands open
//   - older saves: a Round A + B game maps onto the chapters (no crash, Canelo still yours), a very old one starts at
//     chapter 1; the keyboard plays a chapter too
//   NODE_PATH=$(npm root -g) node tools/test-chapters.js [screenshot dir]        (ONLY=day1,old to run some)
'use strict';
const { open, check, run } = require('./harness');
const { newGame, playToEnd, settle, nextTap, nextDay } = require('./playflow');

function FAKE() { // each recognizer start() takes the next reply from window.__sr.queue
  const sr = window.__sr = { queue: [], starts: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.starts.push({ during: window.event ? window.event.type : 'frame', lang: this.lang });
      setTimeout(() => { this.onstart && this.onstart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(t => ({ transcript: t, confidence: 0.9 })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 200);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 40); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openFake(browser, name, touch = true) {
  const { ctx, g } = await open(browser, name, touch);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
const noErrors = (g, name) => check(name + ': no console errors', !g.errors.length, g.errors.join('\n'));
const CH_WORDS = { c1: ['hola', 'perro', 'guau', 'ven'], c2: ['gato', 'miau'], c3: ['buenosdias', 'hueso', 'sientate'], c4: ['si', 'no', 'manzana'], c5: ['pelota', 'rojo'],
  c6: ['pan', 'gracias', 'pato', 'cuac'], c7: ['parque', 'banco', 'fuente', 'granja', 'cabra'], c8: ['escuela', 'bien', 'comoestas'], c9: ['agua', 'cama', 'buenasnoches'], c10: ['cansado', 'carta', 'casa', 'caballo', 'adios'] };
const ALL10 = [].concat(...Object.values(CH_WORDS));

// watch every question: no card may show a word that isn't met yet (and isn't the answer being introduced)
async function watchCards(g) {
  await g.ev(() => {
    window.__unmetCards = [];
    const orig = G.choose;
    G.choose = function (o) {
      (o.choices || []).forEach((c, k) => { if (c.word && G.data.words[c.word] && !G.st.seen(c.word) && k !== o.answer && o.answer != null) window.__unmetCards.push(c.word + ' in "' + G.plain(o.prompt || '') + '"'); });
      return orig.call(this, o);
    };
  });
}
// the budget, as the game sees it each time a chapter starts: {id: {today, date, stage1, n}}
async function watchStarts(g) {
  await g.ev(() => {
    window.__starts = {};
    const orig = G.chapters.start;
    G.chapters.start = function (id) { if (!G.chapters.active(id) && !G.chapters.done(id)) window.__starts[id] = { today: G.chapters.newToday(), date: G.chapters.newOnDate(), stage1: G.chapters.stage1(), n: G.chapters.newWords(id).length, day: G.words.day(), sess: G.words.sess(), lastDone: G.state.ch.lastDoneSess }; return orig.call(this, id); };
  });
}
// speak the answer of the question on top (when it has a mic) -> true when it was taken
async function speakIt(g) {
  await g.until(() => G.top().constructor.name !== 'Choice' || G.top().t >= 12, null, 'the question to settle', 5000).catch(() => {}); // (a busy machine: frames come slowly)
  const said = await g.ev(() => { const s = G.top(); if (s.constructor.name !== 'Choice' || !s.mic || s.won || s.t < 12) return null; const a = s.ch[s.o.answer]; return a && a.word ? G.data.words[a.word].es.split(' / ')[0] : null; });
  if (!said) return false;
  await g.ev(t => window.__sr.queue.push({ results: [t] }), said);
  await g.tapRect(await g.ev(() => G.top().micRect()));
  try { await g.until(() => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'the spoken answer', 6000); return true; } catch (e) { return false; }
}

// ---------- day 1: chapters 1 and 2 ----------
async function day1(browser) {
  const { ctx, g } = await openFake(browser, 'ch-day1');
  try {
    await watchCards(g);
    await newGame(g);
    const t0 = await g.ev(() => ({ s: G.sessionTime, dog: !!G.field.npc('canelo'), met: G.words.list(1) }));
    check('day1: Canelo burst in within the first minute of play (he is hiding: a find-it puzzle)', t0.dog && t0.s < 60 && await g.ev(() => !!G.state.finds.perro && !G.state.finds.perro.found), JSON.stringify(t0));
    check('day1: only hola met before he is found', t0.met.join() === 'hola', t0.met.join());
    await g.shot('c1_hiding');
    // the hint hand points at the hiding places after a while (never at a question)
    await g.ev(() => { G.hint.IDLE_MAP = 30; });
    await g.until(() => !!G.hint.at, null, 'the hint hand');
    check('day1: the hand points at a hiding place', await g.ev(() => { const a = G.hint.at, t = G.intro.targets(G.field)[0]; return Math.abs(a.x - (t.x - Math.round(G.field.cam.x))) < 20; }));
    await g.ev(() => { G.hint.IDLE_MAP = 360; });
    // a wrong hiding place first: "?" and nothing found
    await g.tapTile(1, 5);
    await settle(g, 'the plant');
    check('day1: a wrong hiding place: not found, the word bubble is a "?" (unmet things stay mysterious)', await g.ev(() => !G.state.finds.perro.found && !G.words.met('perro')));
    // play on with taps, saying some answers
    let spoke = 0;
    g.beforeAct = async (s) => { if (s.name === 'Choice' && spoke < 3 && await g.ev(() => { const s = G.top(); return s.ch[s.o.answer] && s.ch[s.o.answer].word === 'ven' && G.words.met('ven'); })) { if (await speakIt(g)) { spoke++; return true; } } return false; };
    await playToEnd(g, { nextDay: async () => { throw new Error('STOP'); } }).catch(e => { if (e.message !== 'STOP') throw e; });
    g.beforeAct = null;
    const st = await g.ev(() => ({ q: G.state.quests, met: G.words.list(1).sort(), mine: G.pet.mine(), ven: G.pet.knows('ven'), t: G.sessionTime }));
    check('day1: chapters 1 and 2 done on day 1', st.q.c1 === 'done' && st.q.c2 === 'done', JSON.stringify(st.q));
    check('day1: Canelo is yours and comes when called', st.mine && st.ven);
    check('day1: exactly the six words of chapters 1 and 2 are met', st.met.join() === CH_WORDS.c1.concat(CH_WORDS.c2).sort().join(), st.met.join());
    check('day1: "¡ven!" said out loud to Canelo (fake recognizer)', spoke >= 1, 'spoke ' + spoke);
    check('day1: about a quarter of an hour of play', st.t < 30 * 60, String(st.t));
    // tomorrow: Mamá's sun bubble; the hand passes it by
    await g.ev(() => G.goto('casa', 4, 4, 'up')); await g.fieldIdle('casa'); await g.frames(10);
    const why = await g.ev(() => G.chapters.gate('c3'));
    check('day1: chapter 3 waits (a morning chapter, and the budget is spent)', why === 'morning' || why === 'budget', why);
    check('day1: Mamá shows the sun-coming-up bubble', await g.ev(() => { const a = G.field.npc('mama').alert(); return !!a && a.icon === 'manana' && a.wait; }));
    await g.shot('c3_tomorrow_bubble');
    await g.tapTile(3, 2); await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá');
    check('day1: talking to her: "¡Mañana!" (and nothing starts)', await g.ev(() => /Mañana/.test(G.top().pages[0].t)));
    await g.shot('c3_manana'); await settle(g, 'Mamá');
    check('day1: still not started', await g.ev(() => !G.chapters.active('c3')));
    const cards = await g.ev(() => window.__unmetCards);
    check('day1: no card ever showed an unmet word', !cards.length, cards.join('; '));
    noErrors(g, 'day1');
  } finally { await ctx.close(); }
}

// ---------- the whole of chapters 1-10, over the days the budget asks for, with a reload in chapter 7 ----------
async function chapters(browser) {
  const { ctx, g } = await openFake(browser, 'ch-all');
  try {
    await watchCards(g); await watchStarts(g);
    await g.ev(() => { G.speedMul = 2; });
    await newGame(g);
    let reloaded = false, spoke = 0, sunsetAfterC8 = null, shots = {};
    g.beforeAct = async (s) => { if (s.name === 'Choice' && (spoke % 7 === 0 || spoke < 2) && await g.ev(() => { const s = G.top(); const a = s.ch[s.o.answer]; return !!(a && a.word && G.words.met(a.word)); })) { spoke++; if (await speakIt(g)) return true; } else if (s.name === 'Choice') spoke++; return false; };
    const shotEach = async () => { const c = await g.ev(() => G.chapters.current()); if (c && !shots[c]) { shots[c] = 1; await g.frames(10); await g.shot(c + '_start'); } };
    await playToEnd(g, {
      nextDay: async () => {
        await watchStarts(g).catch(() => {});
        await nextDay(g);
        await watchCards(g); await watchStarts(g); await g.ev(() => { G.speedMul = 2; });
      },
      beforeStep: async (st) => {
        if (g.errors.length) throw new Error(g.errors.join('\n'));
        await shotEach();
        // a reload in the middle of chapter 7, while Canelo is lost
        if (!reloaded && st.q.c7 === 'active' && await g.ev(() => (G.state.ch.step.c7 | 0) >= 3)) {
          reloaded = true;
          const before = await g.ev(() => ({ step: G.state.ch.step.c7, lost: G.errands.lost(), met: G.words.list(1).length, finds: JSON.stringify(G.state.finds) }));
          const ds = await g.ev(() => G.debug.dayShift || 0); // (the test's moved date: a reload forgets it)
          await g.ev(() => G.st.saveNow());
          await g.page.reload();
          await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
          await g.ev(ds => { G.debug.dayShift = ds; }, ds);
          await g.tap(160, 180);
          await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
          await g.tapRect(await g.ev(() => G.top().cardRect(0)));
          await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
          await watchCards(g); await watchStarts(g); await g.ev(() => { G.speedMul = 2; });
          const after = await g.ev(() => ({ step: G.state.ch.step.c7, lost: G.errands.lost(), met: G.words.list(1).length, finds: JSON.stringify(G.state.finds), dog: !!G.field.npc('canelo') }));
          check('chapters: reloaded mid chapter 7: the same beat, Canelo still lost (not on the map), the same words', before.step === after.step && after.lost && !after.dog && before.met === after.met && before.finds === after.finds, JSON.stringify({ before, after }));
          return 'skip';
        }
        if (st.q.c8 === 'done' && sunsetAfterC8 == null) sunsetAfterC8 = await g.ev(() => ({ at: G.day.sunsetAt(), now: G.sessionTime, next: G.chapters.next(), gate: G.chapters.gate('c9', { evening: true }) }));
        if (st.q.c10 === 'done') throw new Error('DONE10');
      },
    }).catch(e => { if (e.message !== 'DONE10') throw e; });
    g.beforeAct = null;
    const r = await g.ev(() => ({ q: G.state.quests, met: G.words.list(1), starts: window.__starts, day: G.words.day() }));
    check('chapters: chapters 1-10 all done', Object.keys(r.q).filter(k => /^c\d+$/.test(k) && r.q[k] === 'done').length === 10, JSON.stringify(r.q));
    check('chapters: the words met are exactly the 34 words of chapters 1-10', r.met.slice().sort().join() === ALL10.slice().sort().join(), r.met.filter(w => !ALL10.includes(w)).join() + ' / missing ' + ALL10.filter(w => !r.met.includes(w)).join());
    const over = Object.entries(r.starts).filter(([id, s]) => s.today + s.n > 6 || s.date + s.n > 8 || s.stage1 >= 10);
    check('chapters: every chapter started within the budget (<= 6 new words a day, 8 a date, < 10 words only met)', !over.length, JSON.stringify(over));
    const mornings = ['c3', 'c7', 'c8'].filter(id => r.starts[id] && r.starts[id].lastDone === r.starts[id].sess);
    check('chapters: the morning chapters opened first thing in a session', !mornings.length, JSON.stringify(mornings.map(id => [id, r.starts[id]])));
    check('chapters: they took several days (about 6, one or two chapters a day)', r.day >= 5 && r.day <= 12, 'day ' + r.day);
    check('chapters: after chapter 8 the sunset came within ~5 minutes for chapter 9', sunsetAfterC8 && sunsetAfterC8.at - sunsetAfterC8.now <= 320, JSON.stringify(sunsetAfterC8));
    check('chapters: some answers were said out loud', spoke > 3, String(spoke));
    const cards = await g.ev(() => window.__unmetCards);
    check('chapters: no card ever showed an unmet word', !cards.length, cards.slice(0, 8).join('; '));
    // after chapter 10: the older errands open (mercado first), Misiones shows them; the next chapter is "to be written"
    await g.ev(() => { G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('night'); });
    check('chapters: after chapter 10 the older errands open (mercado first)', await g.ev(() => G.errands.offer('mercado') && G.chapters.gate('c11') === 'unwritten'));
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the menu');
    await g.tapRect(await g.ev(() => G.top().rect('quest')));
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    await g.frames(10); await g.shot('misiones_after_c10');
    check('chapters: Misiones lists the market errand waiting', await g.ev(() => G.top().rows().some(r => r.id === 'mercado' && r.st === 'new')));
    await g.tap(160, 120);
    noErrors(g, 'chapters');
  } finally { await ctx.close(); }
}

// ---------- the budget across days, by hand ----------
async function budget(browser) {
  const { ctx, g } = await open(browser, 'ch-budget', true);
  try {
    // a game with chapters 1-2 done today (6 words met today)
    await g.ev(() => {
      G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
      G.st.begin(1);
      for (const id of ['hola', 'perro', 'guau', 'ven', 'gato', 'miau']) { G.words.meet(id, 'test'); G.words.answerRight(id, { firstTry: true, mode: 'text' }); }
      Object.assign(G.state.quests, { c1: 'done', c2: 'done' }); Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true }); G.state.pet.tricks.ven = 3;
      G.state.ch.lastDoneSess = G.words.sess();
      G.goto('casa', 4, 4, 'up');
    });
    await g.fieldIdle('casa');
    check('budget: the same session: chapter 3 waits (morning)', await g.ev(() => G.chapters.gate('c3') === 'morning'));
    await g.ev(() => { G.words.newSession('load'); });
    check('budget: a new session on the same date: 6 met today, so 3 more would be 9: it waits (budget)', await g.ev(() => G.chapters.gate('c3') === 'budget'));
    await g.ev(() => { G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('load'); });
    check('budget: the next day: chapter 3 opens (Mamá has a "!")', await g.ev(() => !G.chapters.gate('c3') && G.field.npc('mama').alert() === true));
    // 10 words only met: a review day
    await g.ev(() => { for (const id of ['hueso', 'sientate', 'si', 'no', 'manzana', 'pelota', 'rojo', 'pan', 'pato', 'cuac']) G.words.meet(id, 'test'); });
    check('budget: 10+ words only met (stage 1): no new chapter today ("busy")', await g.ev(() => G.chapters.gate('c3') === 'busy' || G.chapters.gate('c3') === 'budget'));
    await g.ev(() => { G.debug.dayShift++; G.words.newSession('load'); });
    check('budget: the next day too, until they are used ("busy")', await g.ev(() => G.chapters.gate('c3') === 'busy'));
    check('budget: a review day: Mamá has a notebook bubble (Luna\'s, once her school is met)', await g.ev(() => G.chapters.needsReview() && G.field.npc('mama').alert() === 'pagina'));
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('mama'); return [n.x, n.y]; }));
    await g.until(() => G.top() !== G.field, null, 'Mamá\'s review');
    await g.shot('review_day');
    await settle(g, 'the review');
    check('budget: she asks the oldest words only met; used, they move on and chapter 3 opens again', await g.ev(() => G.chapters.stage1() < 10 && !G.chapters.gate('c3')), await g.ev(() => G.chapters.stage1() + ' ' + G.chapters.gate('c3')));
    // a started chapter can always be finished, whatever the budget
    await g.ev(() => { G.chapters.start('c3'); for (const id of ['cama', 'agua', 'escuela', 'bien', 'banco', 'fuente']) G.words.meet(id, 'test'); });
    check('budget: a started chapter goes on (its beats are live)', await g.ev(() => G.chapters.active('c3') && !!G.chapters.live() && G.chapters.live().id === 'c3'));
    noErrors(g, 'budget');
  } finally { await ctx.close(); }
}

// ---------- older saves ----------
async function oldSaves(browser) {
  const { ctx, g } = await open(browser, 'ch-old', true);
  try {
    // a Round A + B game (before the chapters): words in the old format, errands done, one going on
    await g.ev(() => {
      const words = {}; for (const id of ['hola', 'buenosdias', 'adios', 'comoestas', 'bien', 'gracias', 'manzana', 'platano', 'tres', 'dos', 'perro', 'gato', 'sientate', 'ven', 'uvas', 'negro']) words[id] = { learned: true, right: 2, wrong: 0 };
      const old = { flags: { intro: true, canelo: true, petStart: true, pepeSiNo: true, compra: true, e_picnic: { pan: 1 } }, searched: {}, playTime: 900, loc: { map: 'villa', x: 15, y: 13, dir: 'down' }, words,
        pages: { saludos: true, numeros: true, colores2: true }, quests: { saludos: 'done', mercado: 'done', pelota: 'done', carta: 'done', canelo: 'done', picnic: 'active' }, stars: 30, opts: { english: false },
        look: G.data.defaultLook('nino'), name: 'Leo', album: { perro: { first: 1, n: 3 } }, pet: { tricks: { sientate: 3, ven: 3 }, learning: null }, hearts: { mama: 3 }, bag: { items: [{ id: 'pan', q: 'picnic' }, { id: 'manzana' }] }, jobs: {}, savedAt: Date.now() };
      localStorage.setItem('spanishclub_slot2', JSON.stringify(old));
      localStorage.setItem('spanishclub_slot3', JSON.stringify({ flags: { intro: true }, loc: { map: 'casa', x: 4, y: 4, dir: 'down' }, words: { hola: { learned: true }, adios: {} }, quests: {}, stars: 2, name: 'Mia', look: G.data.defaultLook('nina') }));
    });
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
    await g.frames(10); await g.shot('slots_old');
    await g.tapRect(await g.ev(() => G.top().cardRect(1)));
    await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'the old game');
    await g.frames(20);
    const a = await g.ev(() => ({ q: G.state.quests, v: G.state.ch.v, mine: G.pet.mine(), tricks: G.state.pet.tricks, next: G.chapters.next(), bag: G.state.bag.items.map(i => i.id + (i.q ? ':' + i.q : '')), st: G.words.stage('hola'), map: G.field.mapId }));
    check('old: a Round A + B save loads: its errands map onto chapters 1-10 (saludos -> c8, carta / canelo -> c10...)', a.v === 2 && ['c1', 'c4', 'c7', 'c8', 'c10'].every(k => a.q[k] === 'done'), JSON.stringify(a.q));
    check('old: an older errand going on (picnic) after chapters 1-10 goes on, its things stay in the bag', a.q.picnic === 'active' && a.bag.join() === 'pan:picnic,manzana', JSON.stringify(a));
    check('old: Canelo is still yours, with his tricks; the words keep their stages', a.mine && a.tricks.ven === 3 && a.tricks.sientate === 3 && a.st >= 2, JSON.stringify(a));
    check('old: after chapter 10, the older errands go on (no chapter 11 yet)', a.next === 'c11' && await g.ev(() => G.chapters.gate('c11') === 'unwritten'));
    await g.shot('old_loaded');
    // walk around a little and open Misiones: nothing breaks
    const t = await nextTap(g);
    if (t) { await g.tap(t.sx, t.sy); await g.until(() => G.top() !== G.field || G.field.locked || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000); await settle(g, 'a step in the old game'); }
    noErrors(g, 'old');
    // a very old one: only Mamá's first lesson: chapter 1 waits at home
    await g.ev(() => G.toTitle());
    await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
    await g.tapRect(await g.ev(() => G.top().cardRect(2)));
    await g.until(() => G.field && G.top() === G.field, null, 'the very old game');
    await g.until(() => G.chapters.active('c1') || G.top() !== G.field, null, 'chapter 1 to start at home');
    await settle(g, 'chapter 1 in a very old game');
    const b = await g.ev(() => ({ q: G.state.quests, v: G.state.ch.v, hola: G.words.stage('hola'), finds: !!G.state.finds.perro }));
    check('old: a very old save (only the first lesson) starts chapter 1 at home; hola stays known', b.v === 2 && b.q.c1 === 'active' && b.finds && b.hola >= 2, JSON.stringify(b));
    noErrors(g, 'very old');
  } finally { await ctx.close(); }
}

// ---------- the keyboard plays chapter 1 too ----------
async function keys(browser) {
  const { ctx, g } = await open(browser, 'ch-keys', false);
  try {
    await g.ev(() => { G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nino'); G.st.begin(1); G.goto('casa', 4, 4, 'up'); });
    await g.drive(() => !!G.state.finds.perro && G.top() === G.field && !G.field.locked, 'chapter 1 by keys');
    // walk below the table and press Z facing it
    await g.ev(() => { const p = G.field.player; p.x = 3; p.y = 4; p.dir = 'up'; G.field.snapCam(); });
    await g.press('z');
    await g.drive(() => G.chapters.done('c1') || (G.top() === G.field && !G.field.locked && G.chapters.beat('c1') && G.chapters.beat('c1').door), 'chapter 1 by keys');
    check('keys: chapter 1 played by keys up to the door', await g.ev(() => G.pet.mine() && G.words.met('ven')));
    noErrors(g, 'keys');
  } finally { await ctx.close(); }
}

const SECTIONS = [['day 1: chapters 1 and 2', day1], ['chapters 1-10, over the days, with a reload', chapters], ['the budget across days', budget], ['older saves', oldSaves], ['keys', keys]];
const only = (process.env.ONLY || '').split(',').filter(Boolean);
run('Chapters 1-10', SECTIONS.filter(([n, fn]) => !only.length || only.some(o => n.toLowerCase().includes(o) || fn.name.toLowerCase().includes(o))));
