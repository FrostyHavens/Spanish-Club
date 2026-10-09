// The word model and what's built on it (docs/LEARNING_DESIGN.md): src/words.js (stages, Leitner boxes over sessions and
// days with a mocked clock and date, one star per word a day, old saves migrated, the review engine's order, the new-word
// budget), learn.js (G.ask's cards chosen by the answer's stage, cued answers, `learn:` only meeting co-listed words,
// distractors from met words), ui.js (unmet words are pictures only and stay unmet), intro.js (show / watch / listen /
// find introductions, the small celebration, review questions, page puzzles), menus.js (the notebook) and world.js
// (tap-anything within the budget).
//   NODE_PATH=$(npm root -g) node tools/test-words.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// a game on the map (not saved anywhere), with some words already at a stage
async function game(g, o = {}) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz'; G.state.flags.intro = true; G.debug.dayShift = 0;
    G.words.newSession('new');
    for (const [id, st] of Object.entries(o.st || {})) { G.words.meet(id, 'test'); const r = G.words.rec(id); r.st = st; r.fu = 0; r.box = Math.max(1, st); r.due = null; r.dd = G.words.day() + 5; r.dc = null; }
    G.goto(o.map || 'villa', o.x || 22, o.y || 13, o.dir || 'up');
  }, o);
  await g.fieldIdle(o.map || 'villa');
}
const task = (g, src) => g.ev(src => { window.__r = undefined; G.field.tasks.add((function* () { window.__r = yield* (new Function('return ' + src))()(); })()); }, src);
const choiceUp = g => g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 8 && G.input.ready(), null, 'the question');

// ---------- the model, in the page ----------
async function model(browser) {
  const { ctx, g } = await open(browser, 'words-model', true);
  try {
    await game(g);
    const m = await g.ev(() => {
      const W = G.words, o = {};
      // meeting
      o.unmet = W.stage('gato'); o.metNew = W.meet('gato', 'show'); o.metAgain = W.meet('gato', 'show'); o.st1 = W.stage('gato');
      const r = W.rec('gato'); o.fu = r.fu; o.box = r.box; o.dueNow = W.due('gato');
      // follow-ups: +1.5 min, then +6 min
      W.addTime(91); o.due90 = W.due('gato');
      const a1 = W.answerRight('gato', { mode: 'both' }); o.a1 = a1; o.fu1 = r.fu; o.st2 = r.st;
      W.addTime(100); o.due100 = W.due('gato');
      const early = W.answerRight('gato', { mode: 'text' }); o.early = { st: r.st, fu: r.fu }; // asked too soon: stage moves, schedule doesn't
      W.addTime(300); o.due400 = W.due('gato');
      W.answerRight('gato', { mode: 'text' }); o.after2 = { box: r.box, fu: r.fu, dd: r.dd - W.day(), st: r.st };
      // a cued answer changes nothing
      const c = W.answerRight('perro', { cued: true }); o.cuedMeets = { st: W.stage('perro'), cue: W.rec('perro').cue };
      W.addTime(91); W.answerRight('perro', { cued: true }); o.cued = { st: W.stage('perro'), fu: W.rec('perro').fu };
      // a miss: down a box, due again in 1.5 min
      W.answerWrong('perro'); o.miss = { box: W.rec('perro').box, in: Math.round(W.rec('perro').due - W.now()) };
      return o;
    });
    check('model: an unmet word is stage 0; meeting it -> stage 1, box 1, its first follow-up', m.unmet === 0 && m.metNew && !m.metAgain && m.st1 === 1 && m.fu === 1 && m.box === 1 && !m.dueNow, JSON.stringify(m));
    check('model: the first follow-up is due after 1.5 minutes of play', m.due90);
    check('model: an uncued first try -> known (stage 2), a star, the second follow-up (+6 min)', m.a1.stage === 2 && m.a1.star && m.fu1 === 2 && m.st2 === 2 && !m.due100, JSON.stringify(m));
    check('model: recalled from word-only cards -> remembered (stage 3, gold), but asked too soon its schedule waits', m.early.st === 3 && m.early.fu === 2, JSON.stringify(m.early));
    check('model: after both follow-ups: box 2, due the next day', m.due400 && m.after2.box === 2 && m.after2.fu === 0 && m.after2.dd === 1, JSON.stringify(m.after2));
    check('model: answering an unmet word meets it (a cued use); cued answers never move the stage or the box', m.cuedMeets.st === 1 && m.cuedMeets.cue === 1 && m.cued.st === 1 && m.cued.fu === 1, JSON.stringify(m));
    check('model: a miss drops it a box and brings it back in 1.5 minutes', m.miss.box === 1 && m.miss.in === 90, JSON.stringify(m.miss));

    // days: the Leitner boxes, stars once a day, solid on a later day
    const d = await g.ev(() => {
      const W = G.words, o = {}, s0 = G.state.stars;
      W.meet('casa', 'show'); const r = W.rec('casa'); r.fu = 0;
      W.addTime(100); W.answerRight('casa', { mode: 'both' }); o.star1 = G.state.stars - s0;
      W.answerRight('casa', { mode: 'text' }); o.star2 = G.state.stars - s0; // a second first try today: no second star
      o.today = { st: r.st, box: r.box, dd: r.dd - W.day() };
      const days = [];
      for (let k = 1; k <= 9; k++) { // a session on each of the next days (a new calendar date)
        G.debug.dayShift = k; W.newSession('load');
        days.push({ day: W.day(), due: W.due('casa'), st: r.st, box: r.box });
        if (W.due('casa')) W.answerRight('casa', { mode: 'pic' });
      }
      o.days = days; o.stars = G.state.stars - s0;
      // the same calendar day, but a new morning in the game (day.js): a new day too
      const d0 = W.day(); W.newSession('night'); o.night = W.day() - d0;
      const s1 = W.sess(); W.newSession('load'); o.load = { day: W.day() - d0, sess: W.sess() - s1 };
      G.debug.dayShift = 0;
      return o;
    });
    check('model: one star per word per day, from first tries', d.star1 === 1 && d.star2 === 1, JSON.stringify(d));
    check('model: right on the next days moves it up the boxes: due the next day, then +2, then +4 days (box 2 -> 3 -> 4 -> 5)', d.days.filter(x => x.due).map(x => x.day - d.days[0].day + 1).join() === '1,3,7' && JSON.stringify(d.days.filter(x => x.due).map(x => x.box)) === '[2,3,4]', JSON.stringify(d.days));
    check('model: remembered on a later day (3 uncued first tries over 2+ days) -> solid (stage 4)', d.days[d.days.length - 1].st === 4, JSON.stringify(d.days));
    check('model: a star on each day it came back', d.stars === 1 + d.days.filter(x => x.due).length, JSON.stringify(d));
    check('model: a new morning is a new day; a reload on the same date is a new session, not a new day', d.night === 1 && d.load.day === 1 && d.load.sess === 1, JSON.stringify(d));

    // migration of an older save
    const mg = await g.ev(() => {
      G.st.newGame(); G.state.words = { hola: { learned: true, right: 1, wrong: 0 }, gracias: { learned: true, right: 3, wrong: 1, said: 2 }, adios: { learned: false, right: 0, wrong: 0 }, si: { learned: true, right: 0, wrong: 0, said: 1 } };
      return ['hola', 'gracias', 'adios', 'si'].map(id => [id, G.words.stage(id), G.st.saidCount(id), G.words.due(id), G.st.knows(id), G.st.seen(id)]);
    });
    check('migration: learned -> known (2), or remembered (3) when answered twice or said; seen -> met; said counts kept; all due', JSON.stringify(mg) === JSON.stringify([['hola', 2, 0, true, false, true], ['gracias', 3, 2, true, true, true], ['adios', 1, 0, true, false, true], ['si', 3, 1, true, true, true]]), JSON.stringify(mg));

    // the review engine's order, and its filters
    await game(g);
    const rv = await g.ev(() => {
      const W = G.words, o = {};
      ['uno', 'dos', 'tres', 'gato', 'perro'].forEach(id => { W.meet(id, 'test'); });
      ['uno', 'dos', 'tres'].forEach(id => { const r = W.rec(id); r.fu = 0; r.due = null; }); // older words, due by day
      Object.assign(W.rec('uno'), { box: 3, dd: W.day() - 1 }); Object.assign(W.rec('dos'), { box: 2, dd: W.day() - 1 }); Object.assign(W.rec('tres'), { box: 2, dd: W.day() - 3 });
      o.before = G.review.due(9);
      W.addTime(95); o.after = G.review.due(9);
      W.answerWrong('uno'); W.addTime(95); o.missed = G.review.due(9);
      o.topic = G.review.due(9, { topic: 'animales' }); o.ex = G.review.due(9, { exclude: ['gato'], maxStage: 1 }); o.next = G.review.next({ filter: id => id.length === 3 });
      return o;
    });
    check('review: just-met words wait for their follow-up; older due words come by box, then by lateness', rv.before.join() === 'tres,dos,uno', JSON.stringify(rv));
    check('review: just-met follow-ups come first once due', rv.after.slice(0, 2).sort().join() === 'gato,perro' && rv.after.slice(2).join() === 'tres,dos,uno', JSON.stringify(rv));
    check('review: a missed word comes back right after the follow-ups', rv.missed.indexOf('uno') === 2, JSON.stringify(rv.missed));
    check('review: topic / exclude / filter', rv.topic.sort().join() === 'gato,perro' && rv.ex.indexOf('gato') < 0 && rv.ex.indexOf('perro') >= 0 && rv.next === 'uno', JSON.stringify(rv));

    // the budget
    const b = await g.ev(() => {
      const B = G.budget, W = G.words, o = { start: [B.recent(), B.session(), B.canIntro(1)] };
      ['pan', 'leche', 'queso', 'huevo'].forEach(id => W.meet(id, 'test'));
      o.nine = [B.recent(), B.session(), B.left(), B.canIntro(1), B.canIntro(1, { hard: true })]; // 5 (above) + 4 = 9 met this session
      W.addTime(301); o.later = [B.recent(), B.session(), B.canIntro(1), B.pending()];
      W.newSession('load'); o.next = [B.session(), B.canIntro(5), B.canIntro(6)];
      return o;
    });
    check('budget: words met in the last 5 minutes and this session; no more than 5 per 5 min, 6 a session (8 hard)', b.nine[0] === 9 && b.nine[1] === 9 && b.nine[2] === 0 && !b.nine[3] && !b.nine[4], JSON.stringify(b));
    check('budget: a new session starts a new count', b.next[0] === 0 && b.next[1] && b.next[2] === false, JSON.stringify(b));
    check('model: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- questions: cards by stage, cues, learn, distractors, text ----------
async function questions(browser) {
  const { ctx, g } = await open(browser, 'words-ask', true);
  try {
    await game(g, { st: { manzana: 1, platano: 2, naranja: 3, hola: 3 } });
    // speech: an unmet word is its picture only (and stays unmet); met: picture + blue; known: blue; remembered: gold
    const look = await g.ev(() => { const L = G.richLayout('[galleta] [manzana] [platano] [naranja]', 300); return L[0].items.map(i => i.look); });
    check('text: unmet -> picture only, met -> picture + word, known -> word, remembered -> gold word', look.join() === 'pic,both,text,gold', look.join());
    await g.ev(() => { G.field.tasks.add((function* () { yield G.say('¡[galleta]! ¿[galleta]?'); })()); });
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'a line');
    await g.frames(40); await g.shot('unmet_in_speech');
    await g.drive(() => G.top() === G.field, 'the line');
    check('text: appearing in a line or on a card never meets a word', await g.ev(() => G.words.stage('galleta') === 0 && !G.st.seen('galleta')));

    const disp = await g.ev(() => {
      const q = (ans, prompt, show) => { const c = [{ word: ans }, { word: 'hola' }, { word: 'pan' }]; return G.askDisplay({ prompt, show, choices: c, answer: 0 }); };
      return {
        unmet: q('galleta', '¿Qué es?'), met: q('manzana', '¿Qué es?'), metIn: q('manzana', '¿[manzana]?'),
        known: q('platano', '¿Qué es?', 'platano'), knownIn: q('platano', '¿Y el [platano]?'),
        gold: q('naranja', '¿Qué es?', 'naranja'), goldIn: q('naranja', '¿La [naranja]?'),
        override: G.askDisplay({ prompt: '¿Qué es?', choices: [{ word: 'naranja', text: true }, { word: 'hola' }], answer: 0 }),
      };
    });
    const D = k => disp[k].display + (disp[k].mask ? '+mask' : '');
    check('ask: unmet / met answers: picture + word cards; a met answer in the prompt is heard, not shown', D('unmet') === 'both' && D('met') === 'both' && D('metIn') === 'both+mask', JSON.stringify(disp));
    check('ask: a known answer: word cards (from its picture), or picture cards when the prompt says it', D('known') === 'text' && D('knownIn') === 'pic', JSON.stringify(disp));
    check('ask: a remembered answer: say it / pick its word from its picture, or listen and pick its picture', D('gold') === 'text' && D('goldIn') === 'pic+mask', JSON.stringify(disp));
    check('ask: a choice\'s own text / pic still wins (content overrides)', disp.override.display === null);

    // distractors from met words
    const dist = await g.ev(() => { const r = []; for (let i = 0; i < 20; i++) { const c = G.wordChoices('platano', ['platano', 'galleta', 'manzana', 'naranja', 'pan'], 3); r.push(c.choices.map(x => x.word).filter(w => w !== 'platano').sort().join()); } return [...new Set(r)]; });
    check('ask: wordChoices picks distractors from met words when there are enough', dist.length && dist.every(s => s === 'manzana,naranja'), dist.join(' | '));

    // a met answer in the prompt: masked (a speaker), picture + word cards; answered right -> known, no cue
    await task(g, `function* () { return yield* G.ask({ prompt: '¿Y la [manzana]?', choices: [{ word: 'hola' }, { word: 'manzana' }, { word: 'galleta' }], answer: 1, layout: 'cards', learn: ['manzana', 'pan'] }); }`);
    await choiceUp(g);
    const c1 = await g.ev(() => { const s = G.top(); return { mask: s.lines[0].items.find(i => i.id === 'manzana').look, views: s.ch.map((c, k) => s.view(k)).map(v => (v.icon ? 'P' : '') + (v.label ? 'W' : '')), cue: s.cue(1) }; });
    check('ask: the met answer\'s word is a speaker in the prompt; its card has picture + word; the unmet distractor only its picture', c1.mask === 'mask' && c1.views.join() === 'PW,PW,P' && !c1.cue.cued, JSON.stringify(c1));
    await g.frames(4); await g.shot('ask_masked');
    await g.ev(() => { G.words.addTime(100); });
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.drive(() => window.__r !== undefined, 'the question');
    const a1 = await g.ev(() => ({ st: G.words.stage('manzana'), pan: G.words.stage('pan'), galleta: G.words.stage('galleta') }));
    check('ask: right uncued -> known; `learn:` co-listed words are only met; the distractor stays unmet', a1.st === 2 && a1.pan === 1 && a1.galleta === 0, JSON.stringify(a1));

    // a cued answer (its picture over the question, picture cards) changes nothing
    await task(g, `function* () { return yield* G.ask({ prompt: '¿...?', show: 'pan', choices: [{ word: 'pan', look: 'both' }, { word: 'hola' }], answer: 0, layout: 'cards' }); }`);
    await choiceUp(g);
    check('ask: picture over the question + its picture on the card = cued', await g.ev(() => G.top().cue(0).cued === true));
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.drive(() => window.__r !== undefined, 'the question');
    check('ask: a cued right answer: no stage up', await g.ev(() => G.words.stage('pan') === 1 && G.state.words.pan.cue === 1));

    // known -> word cards from its picture -> remembered: the gold card ("¡Palabra de oro!")
    await task(g, `function* () { return yield* G.ask({ prompt: '¿Qué es?', show: 'platano', choices: [{ word: 'manzana' }, { word: 'platano' }, { word: 'naranja' }], answer: 1, layout: 'cards' }); }`);
    await choiceUp(g);
    check('ask: known answer -> word-only cards under its picture', await g.ev(() => G.top().ch.every((c, k) => !G.top().view(k).icon && G.top().view(k).label)));
    await g.frames(4); await g.shot('ask_text_cards');
    await g.ev(() => { G.words.addTime(400); });
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.until(() => G.top().constructor.name === 'WordCard', null, 'the gold card');
    await g.frames(30); await g.shot('gold_card');
    check('ask: recalled from its picture -> remembered (gold), with the big gold card', await g.ev(() => G.words.stage('platano') === 3 && G.st.knows('platano')));
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the gold card');

    // an unmet answer: met by the right pick, with the small celebration
    await task(g, `function* () { return yield* G.ask({ prompt: '¿Qué quieres?', choices: [{ word: 'queso' }, { word: 'hola' }], answer: 0, layout: 'cards' }); }`);
    await choiceUp(g);
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.until(() => G.intro.busy(), null, 'the small celebration');
    await g.frames(20); await g.shot('note_celebration');
    check('ask: an unmet answer is met by the right pick (into the notebook), not a retrieval', await g.ev(() => G.words.stage('queso') === 1 && G.words.rec('queso').how === 'answer'));
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the question');
    // a wrong first pick: the word drops a box
    await task(g, `function* () { return yield* G.ask({ prompt: '¿Qué es?', show: 'naranja', choices: [{ word: 'naranja' }, { word: 'hola' }], answer: 0, layout: 'cards' }); }`);
    await choiceUp(g);
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.frames(12);
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the question');
    check('ask: a wrong first pick is a miss for the answer (back in 1.5 min), not a first try', await g.ev(() => window.__r === false && G.state.words.naranja.wrong === 1 && G.state.words.naranja.due != null));
    check('ask: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- introductions ----------
async function intros(browser) {
  const { ctx, g } = await open(browser, 'words-intro', true);
  try {
    await game(g, { st: { hola: 2, casa: 2, manzana: 2 } });
    // show and name: the thing held up, then the new word among known pictures
    await task(g, `function* () { return yield* G.intro.show('pelota', { who: 'sofia', prompt: '¡Mira! ¡Mi [pelota]!' }); }`);
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Sofía');
    await g.frames(30); await g.shot('intro_show');
    check('intro.show: the thing is held up (its picture over the box), its word only a picture', await g.ev(() => G.top().opts.show === 'pelota' && G.top().lines[0].items.find(i => i.id === 'pelota').look === 'pic'));
    await g.drive(() => G.top().constructor.name === 'Choice', 'the line');
    await choiceUp(g);
    const q = await g.ev(() => { const s = G.top(); return { ans: s.ch[s.o.answer].word, views: s.ch.map((c, k) => [c.word, !!s.view(k).icon, !!s.view(k).label]), n: s.ch.length, show: s.o.show }; });
    check('intro.show: "¿Qué es?" with the new word written (no picture) among 2 known ones as pictures', q.ans === 'pelota' && q.n === 3 && q.views.every(([w, i, l]) => w === 'pelota' ? !i && l : i && l) && q.show === 'pelota', JSON.stringify(q));
    await g.frames(4); await g.shot('intro_show_question');
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the introduction');
    const s = await g.ev(() => ({ st: G.words.stage('pelota'), how: G.words.rec('pelota').how, fu: G.words.rec('pelota').fu, due: G.review.due(9) }));
    check('intro.show: the word is met (its follow-up scheduled)', s.st === 1 && s.how === 'show' && s.fu === 1, JSON.stringify(s));
    await g.ev(() => G.words.addTime(95));
    check('intro: the first real use is due 1.5 minutes later, first in the review', await g.ev(() => G.review.next() === 'pelota'));
    // the review question for it: hear it, pick among picture + word cards
    await task(g, `function* () { return yield* G.review.ask('pelota', { who: 'sofia' }); }`);
    await choiceUp(g);
    const rq = await g.ev(() => { const s = G.top(); return { masked: s.lines.some(L => L.items.some(i => i.look === 'mask')), ans: s.ch[s.o.answer].word, both: s.ch.every((c, k) => s.view(k).icon && s.view(k).label) }; });
    check('review.ask: a just-met word: heard (a speaker), picked among picture + word cards', rq.masked && rq.ans === 'pelota' && rq.both, JSON.stringify(rq));
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the review');
    check('review.ask: answered right -> known, counted as a review', await g.ev(() => G.words.stage('pelota') === 2 && G.words.rec('pelota').fu === 2));

    // watch and do
    await task(g, `function* () { window.__acts = 0; return yield* G.intro.watch('salta', { who: 'sofia', act: function* () { window.__acts++; yield 10; } }); }`);
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the watch introduction');
    check('intro.watch: shown happening, then the child picks / says it and it happens again; met', await g.ev(() => window.__acts === 2 && G.words.stage('salta') === 1 && G.words.rec('salta').how === 'watch'));
    // listen and point: the sound is the new word; its animal is the right picture
    await g.ev(() => { G.words.meet('pato', 'test'); G.words.rec('pato').fu = 0; });
    await task(g, `function* () { return yield* G.intro.listen('cuac', { who: 'nico', answer: 'pato', prompt: '¡[cuac]! ¿Quién es?' }); }`);
    await choiceUp(g);
    const lq = await g.ev(() => { const s = G.top(); return { ans: s.ch[s.o.answer].word, pics: s.ch.every((c, k) => s.view(k).icon && !s.view(k).label), masked: s.lines[0].items.find(i => i.id === 'cuac').look }; });
    check('intro.listen: heard (a speaker), pick its picture among pictures only', lq.ans === 'pato' && lq.pics && lq.masked === 'mask', JSON.stringify(lq));
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the listen introduction');
    check('intro.listen: the sound word is met', await g.ev(() => G.words.stage('cuac') === 1));

    // find it on the map: a wrong thing first, then the right one
    await game(g, { st: { hola: 2 }, x: 22, y: 14 });
    await task(g, `function* () { return yield* G.intro.find('fuente', { who: 'lucia', map: 'villa', at: [18, 11], wrong: [[22, 12]], prompt: '¿Y la [fuente]?' }); }`);
    await g.drive(() => window.__r !== undefined && G.top() === G.field && !G.field.locked, 'the find request');
    check('intro.find: someone is waiting for it; the hand and the bot know where it is', await g.ev(() => G.intro.seeking('lucia') === 'fuente' && G.intro.targets(G.field).length === 1 && !G.intro.found('fuente')));
    await g.tapTile(22, 12); // the bench: not that one
    await g.until(() => G.world.bubble && G.world.bubble.id === 'banco', null, 'the bench to say what it is');
    check('intro.find: a wrong thing says what it is (a "?" while unmet) and the puzzle goes on', await g.ev(() => !G.intro.found('fuente') && G.world.bubble.unk === true));
    await g.until(() => G.top() === G.field && !G.field.locked, null, 'free again');
    await g.tapTile(18, 11);
    await g.drive(() => G.intro.found('fuente') && G.top() === G.field && !G.field.locked, 'the right thing');
    check('intro.find: the right thing: found and met', await g.ev(() => G.words.stage('fuente') === 1 && G.words.rec('fuente').how === 'find' && !G.intro.seeking('lucia')));
    check('intro: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the notebook, page puzzles, tap-anything ----------
async function notebook(browser) {
  const { ctx, g } = await open(browser, 'words-book', true);
  try {
    await game(g, { st: { perro: 2, gato: 3, pajaro: 1 }, x: 13, y: 10 });
    await g.ev(() => { window.__w = G.notebook(); });
    await g.until(() => G.top().constructor.name === 'Notebook' && G.top().t > 4, null, 'the notebook');
    const nb = await g.ev(() => ({ list: G.top().list, page: G.top().page(), stars: ['perro', 'gato', 'pajaro', 'pez'].map(G.st.wordStars) }));
    check('notebook: only the topics with a met word have a page', nb.list.join() === 'animales' && nb.page === 'animales', JSON.stringify(nb));
    check('notebook: stars from the stage (known 1, remembered 2), none yet for met or unmet', nb.stars.join() === '1,2,0,0', JSON.stringify(nb));
    await g.frames(6); await g.shot('notebook');
    await g.ev(() => { window.__sp = []; const o = G.speak; G.speak = t => { window.__sp.push(t); o(t); }; });
    await g.tapRect(await g.ev(() => G.top().cellRect(0)));
    await g.tapRect(await g.ev(() => G.top().cellRect(4))); // an empty frame (pez, unmet)
    check('notebook: tap a met word to hear it; an unmet slot is empty and says nothing', await g.ev(() => window.__sp.join() === 'perro'));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));

    // page puzzles: waiting for 4 KNOWN words (known before this session), then a puzzle on the map
    check('page: with 3 met words the bench page waits (no sparkle)', await g.ev(() => !G.pages.ready('animales') && !G.pages.ready('cosas')));
    await g.ev(() => ['arbol', 'flor', 'fuente', 'banco'].forEach(id => { G.words.meet(id, 'test'); G.words.rec(id).fu = 0; }));
    check('page: 4 words only met: still no sparkle (they must be known: picked once without a cue)', await g.ev(() => !G.pages.ready('cosas')));
    await g.ev(() => ['arbol', 'flor', 'fuente', 'banco'].forEach(id => { const r = G.words.rec(id); r.st = 2; }));
    check('page: known this session: not yet (at the earliest the next session)', await g.ev(() => !G.pages.ready('cosas')));
    await g.ev(() => ['arbol', 'flor', 'fuente', 'banco'].forEach(id => { G.words.rec(id).ms = G.words.sess() - 1; }));
    check('page: 4 words known before this session -> its sparkle is a page puzzle', await g.ev(() => G.pages.ready('cosas')));
    const s0 = await g.ev(() => G.state.stars);
    await g.tapTile(13, 9);
    await g.until(() => G.top().constructor.name === 'PagePuzzle' && G.top().t > 10 && G.input.ready(), null, 'the page puzzle');
    const pz = await g.ev(() => ({ pics: G.top().pics.slice().sort().join(), words: G.top().words.slice().sort().join() }));
    check('page: 4 pictures and their 4 words, shuffled', pz.pics === 'arbol,banco,flor,fuente' && pz.words === pz.pics, JSON.stringify(pz));
    await g.frames(4); await g.shot('page_puzzle');
    // a wrong pair: gentle, nothing joins
    const wrong = await g.ev(() => { const s = G.top(), j = s.words.findIndex(w => w !== s.pics[0]); return { p: s.picRect(0), w: s.wordRect(j), id: s.pics[0] }; });
    await g.tapRect(wrong.p); await g.tapRect(wrong.w);
    check('page: a wrong pair wobbles ("¡Casi!") and nothing joins', await g.ev(() => !!G.top().miss && !Object.keys(G.top().match).length));
    await g.frames(20);
    // drag one word onto its picture
    const dr = await g.ev(() => { const s = G.top(), k = 1, j = s.words.indexOf(s.pics[k]), a = s.wordRect(j), b = s.picRect(k); const sc = (x, y) => { const r = G.canvas.getBoundingClientRect(); return [r.left + x * r.width / G.W, r.top + y * r.height / G.H]; }; return [sc(a.x + a.w / 2, a.y + a.h / 2), sc(b.x + b.w / 2, b.y + b.h / 2)]; });
    await g.page.mouse.move(...dr[0]); await g.page.mouse.down(); await g.frames(10);
    for (let i = 1; i <= 8; i++) { await g.page.mouse.move(dr[0][0] + (dr[1][0] - dr[0][0]) * i / 8, dr[0][1] + (dr[1][1] - dr[0][1]) * i / 8); await g.frames(1); }
    await g.page.mouse.up(); await g.frames(4);
    check('page: dragging a word onto its picture joins them', await g.ev(() => !!G.top().match[1]));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the rest of the puzzle');
    const pr = await g.ev(([s0, wid]) => ({ stars: G.state.stars - s0, solved: G.st.hasPage('cosas'), ready: G.pages.ready('cosas'), st: ['arbol', 'flor', 'fuente', 'banco'].map(G.words.stage), wrong: G.state.words[wid].wrong }), [s0, wrong.id]);
    check('page: all four matched -> one star; the sparkle is gone today', pr.stars === 1 && pr.solved && !pr.ready, JSON.stringify(pr));
    check('page: first-try matches are retrievals (known -> remembered); the wrong one isn\'t', pr.st.filter(x => x === 3).length === 3 && pr.wrong === 1, JSON.stringify(pr));
    check('page: on a later day, with 2+ of its words due again, the puzzle comes back', await g.ev(() => { G.debug.dayShift = 5; G.words.newSession('load'); const r = G.pages.ready('cosas'); G.debug.dayShift = 0; return r; }));

    // tap-anything: a thing whose word is unmet stays mysterious (its picture and "?"); it waits for its chapter
    await game(g, { x: 22, y: 13 });
    await g.ev(() => { window.__sp = []; const o = G.speak; G.speak = t => { window.__sp.push(t); o(t); }; });
    await g.tapTile(22, 12);
    await g.until(() => G.world.bubble && G.world.bubble.id === 'banco', null, 'the bench');
    await g.frames(30); await g.shot('tap_unmet');
    check('tap: an unmet thing shows its picture and "?", says nothing, stays unmet, no mic', await g.ev(() => G.world.bubble.unk && G.words.stage('banco') === 0 && !G.world.sayBack && !window.__sp.some(t => /banco/.test(t))));
    await g.ev(() => { G.world.introOnTap = true; });
    await game(g, { x: 22, y: 13 });
    await g.tapTile(22, 12);
    await g.until(() => G.world.bubble && G.world.bubble.id === 'banco' && !G.world.bubble.unk, null, 'the bench again');
    check('tap: with introOnTap (off by default) asking "what is this?" would meet it', await g.ev(() => G.words.stage('banco') === 1 && G.words.rec('banco').how === 'tap'));
    await g.ev(() => { G.world.introOnTap = false; });
    check('notebook: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('The word model (words.js, intro.js)', [['model: stages, boxes, days, stars, migration, review, budget', model], ['questions: cards by stage, cues, learn', questions], ['introductions: show, watch, listen, find', intros], ['notebook, page puzzles, tap-anything', notebook]]);
