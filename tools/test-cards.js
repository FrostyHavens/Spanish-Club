// Word cards that grow, cards before the book, picture + word always, ghost-hand demos, variety in the day's play
// (src/cards.js, src/demo.js, ui.js / learn.js rendering, carry.js C.more; docs/PLAYTEST_NOTES.md 2026-10-11):
//   - a right pick, saying a word (the most), carrying and finding grow its card; it pops up near the action and flies
//     into the deck in the corner (no star counter, no flying stars); passive uses can't be farmed; the plant agrees
//     with the word's stage (no flower before it is remembered)
//   - the deck (the map's corner button), the kid menu's cards; the book only once 15 words are met, with a celebration
//   - every word in a line shows its picture (met: picture + word; unmet: picture + a blank); a question's own choices
//     in its prompt are heard, not shown
//   - each ghost-hand demo plays once (answer, mic, pick up, give, put down, puzzle) and is saved
//   - when the day's plays are done the guide rotates Canelo's tricks, petting, food, hide-and-seek, a present, fetch
//   NODE_PATH=$(npm root -g) node tools/test-cards.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

function FAKE() { // a fake recognizer (as tools/test-speaking.js): each start() takes the next reply from window.__sr.queue
  const sr = window.__sr = { queue: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
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
async function openFake(browser, name) {
  const { ctx, g } = await open(browser, name, true);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// on the map, every sound logged in window.__sfx; o.demos: keep the ghost-hand demos (else they're all marked seen)
async function start(g, o = {}) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
    for (const id of ['c1', 'c2']) G.state.quests[id] = 'done';
    if (!o.demos) G.demo.skip();
    G.goto(o.map || 'villa', o.x || 9, o.y || 18, 'down');
    window.__sfx = []; const sfx = G.audio.sfx; G.audio.sfx = n => { window.__sfx.push(n); sfx(n); };
  }, o);
  await g.fieldIdle(o.map || 'villa');
}
const heard = (g, n) => g.ev(n => window.__sfx.includes(n), n);
const ask = (g, q) => g.ev(q => { window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.ask(q); })()); }, q);
const choiceUp = g => g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 8 && G.input.ready(), null, 'the question');
const cards = (...ids) => ids.map(id => ({ word: id }));
const lastLog = g => g.ev(() => G.cards.log[G.cards.log.length - 1] || null);
async function still(g, label) { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); }

async function growing(browser) {
  const { ctx, g } = await openFake(browser, 'cards-grow');
  try {
    await start(g);
    await g.ev(() => { for (const w of ['hola', 'adios', 'gracias', 'manzana', 'pelota', 'perro', 'gato']) G.words.meet(w, 'test'); G.cards.log.length = 0; });
    await g.until(() => !G.cards.busy(), null, 'quiet');

    // a right pick: the card pops up by the card tapped, grows, then flies into the deck
    await ask(g, { prompt: '¿Qué es?', show: 'adios', layout: 'cards', choices: cards('hola', 'adios', 'gracias'), answer: 1, noMic: true });
    await choiceUp(g);
    const r1 = await g.ev(() => G.top().rects()[1]);
    await g.ev(() => { window.__sfx.length = 0; });
    await g.tapRect(r1);
    await g.until(() => G.cards.live() > 0, null, 'a card to pop');
    const p1 = await g.ev(() => G.cards.list()[0]);
    check('pick: the card of the word picked pops up near the card tapped', p1.id === 'adios' && Math.abs(p1.x - (r1.x + r1.w / 2)) < 30, JSON.stringify(p1));
    const l1 = await lastLog(g);
    check('pick: a right first pick grows it by 2', l1 && l1.id === 'adios' && l1.how === 'pick' && l1.add === 2 && l1.to > l1.from, JSON.stringify(l1));
    await g.until(() => G.cards.list().some(p => p.t > 25), null, 'the card to grow', 5000);
    await still(g, 'pick_grow');
    check('pick: ...with the growing sound, and no star counter or flying star', await heard(g, 'grow') && await g.ev(() => !G.fx.counterShown() && G.fx.live('fly') === 0));
    await g.until(() => G.cards.live() === 0, null, 'the card to fly into the deck', 8000);
    check('pick: the card lands in the deck (a soft flick)', await heard(g, 'deck'));
    await g.until(() => window.__r !== null, null, 'the question to finish');

    // saying it: the biggest growth, with sound waves (the mic on a question)
    await g.ev(() => { window.__sfx.length = 0; G.cards.log.length = 0; window.__sr.queue.push({ results: [['gracias', 0.9]] }); });
    await ask(g, { prompt: '¿Qué es?', show: 'gracias', layout: 'cards', choices: cards('hola', 'adios', 'gracias'), answer: 2 });
    await choiceUp(g);
    check('say: the question has a mic', await g.ev(() => !!G.top().mic && G.top().mic.shown()));
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.cards.log.some(l => l.how === 'say'), null, 'saying it to grow the card', 8000);
    const ls = await g.ev(() => G.cards.log.find(l => l.how === 'say'));
    check('say: saying a word grows its card the most (5, a pick 2)', ls.id === 'gracias' && ls.add === 5 && ls.add > l1.add, JSON.stringify(ls));
    check('say: ...with sound waves and the big growing sound', await g.ev(() => G.cards.list().some(p => p.said)) && await g.until(() => window.__sfx.includes('growbig'), null, 'growbig', 3000).then(() => true));
    await g.frames(30); await still(g, 'say_grow');
    check('say: no second growth for the pick that the saying made', await g.ev(() => G.cards.log.filter(l => l.id === 'gracias').length === 1));
    await g.until(() => window.__r !== null && G.cards.live() === 0, null, 'the question and the card', 10000);
    await g.until(() => G.top() === G.field || G.top().constructor.name === 'WordCard', null, 'back');
    if (await g.scene() === 'WordCard') { await g.frames(24); await g.tap(150, 200); }
    await g.fieldIdle('villa');

    // the plant agrees with the word model: a met word can't flower, a remembered one is at least a flower
    const ag = await g.ev(() => {
      const r = G.words.rec('hola'); r.st = 2; r.gp = 100; const a = G.cards.pts('hola'), la = G.cards.level('hola');
      r.st = 3; const b = G.cards.pts('hola'); r.gp = 0; const c = G.cards.level('hola'); r.st = 1; r.gp = 0;
      return { a, la, b, c, flower: G.cards.LV[4] };
    });
    check('stage: no flower before the word is remembered; remembered = at least a flower', ag.a < ag.flower && ag.la === 3 && ag.b >= ag.flower && ag.c === 4, JSON.stringify(ag));

    // carrying: picking up the apple grows its card a little, once in a while (passive uses can't be farmed)
    await g.ev(() => { G.cards.log.length = 0; G.state.bag.taken = {}; });
    const ap = await g.ev(() => G.carry.SOURCES.find(s => s.id === 'manzana1').at);
    await g.ev(ap => { const f = G.field; f.player.x = ap[0]; f.player.y = ap[1] - 1; f.snapCam(); }, ap);
    await g.ev(ap => G.carry.pick(G.field, ap[0], ap[1]), ap);
    const lc = await lastLog(g);
    check('carry: picking up an apple grows its card (by 1)', lc && lc.id === 'manzana' && lc.how === 'carry' && lc.add === 1, JSON.stringify(lc));
    await g.ev(() => { G.carry.drop(G.field); });
    await g.ev(() => { const f = G.field, gr = G.state.bag.ground.find(x => x.id === 'manzana' && x.map === 'villa'); G.carry.pick(f, gr.x, gr.y); });
    check('carry: picked up again at once: no more growth (once per word per 30 s)', await g.ev(() => G.cards.log.filter(l => l.id === 'manzana').length === 1));
    await g.ev(() => { G.words.addTime(40); G.carry.drop(G.field); const f = G.field, gr = G.state.bag.ground.find(x => x.id === 'manzana' && x.map === 'villa'); G.carry.pick(f, gr.x, gr.y); });
    check('carry: ...and grows again a while later', await g.ev(() => G.cards.log.filter(l => l.id === 'manzana').length === 2));
    await g.ev(() => G.carry.drop(G.field));
    // finding (hide-and-seek and find-its name the animal with grow: 'find')
    await g.ev(() => { G.cards.log.length = 0; G.world.name('gato', G.field.player.x * 24, G.field.player.y * 24, { grow: 'find', noMic: true }); });
    const lf = await lastLog(g);
    check('find: finding the cat grows its card by 2', lf && lf.id === 'gato' && lf.how === 'find' && lf.add === 2, JSON.stringify(lf));
    // an unmet word never grows (and never pops)
    check('unmet: a word not met has no card to grow', await g.ev(() => G.cards.grow('queso', 'say') === 0 && G.cards.grow('leche', 'pick') === 0));
    await g.until(() => G.cards.live() === 0, null, 'quiet', 8000);
    check('growing: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function deckAndBook(browser) {
  const { ctx, g } = await open(browser, 'cards-deck', true);
  try {
    await start(g);
    const W = await g.ev(() => Object.keys(G.data.words).filter(id => G.iconDrawn(id)).slice(0, 20));
    await g.ev(W => W.slice(0, 6).forEach(w => { G.words.addTime(2); G.words.meet(w, 'test'); }), W);
    await g.until(() => !G.cards.busy(), null, 'quiet', 10000);
    await still(g, 'deck_corner');
    // the corner button is the deck: tap it, the kid menu's first picture is the cards
    await g.tap(320 - 16, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    check('deck: before the book, the kid menu is the cards and the album', await g.ev(() => G.top().tiles().join() === 'cards,album'));
    await g.frames(6); await still(g, 'kid_menu');
    await g.tapRect(await g.ev(() => G.top().rect('cards')));
    await g.until(() => G.top().constructor.name === 'Deck' && G.top().t > 14, null, 'the deck');
    check('deck: every card met is in it, the newest first', await g.ev(W => { const d = G.top(); return d.ids.length === G.words.count(1) && d.ids.length >= 6 && d.ids[0] === W[5]; }, W));
    await still(g, 'deck');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    // someone handing over "the notebook" before it has opened: your cards pop up instead (no notebook)
    await g.ev(() => { window.__seen = []; G.field.tasks.add((function* () { G.field.locked = true; yield* G.findPage('saludos'); G.field.locked = false; })()); });
    await g.until(() => G.cards.live() > 0, null, 'the cards to show');
    await g.frames(20);
    check('book: before it opens, handing over a page shows the cards, not the notebook', await g.ev(() => G.top().constructor.name !== 'Notebook' && G.cards.list().length > 0));
    await g.until(() => !G.cards.busy(), null, 'quiet', 10000);
    await g.fieldIdle('villa');
    // 15 words met: a small celebration opens the book; it joins the kid menu
    await g.ev(W => W.slice(6, 15).forEach(w => G.words.meet(w, 'test')), W);
    await g.until(() => G.cards.party(), null, 'the book\'s celebration', 15000);
    await g.until(() => G.cards.party() && G.frame % 1 === 0, null, 'party', 1000);
    await g.frames(60); await still(g, 'book_party');
    check('book: 15 words met: the book opens with a celebration (saved)', await g.ev(() => G.state.flags.book === true));
    await g.until(() => !G.cards.party(), null, 'the celebration to end', 10000);
    await g.tap(320 - 16, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the kid menu');
    check('book: then the kid menu has the cards, the book and the album', await g.ev(() => G.top().tiles().join() === 'cards,book,album'));
    await g.frames(6); await still(g, 'kid_menu_book');
    await g.tapRect(await g.ev(() => G.top().rect('book')));
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the notebook');
    await g.frames(6); await still(g, 'notebook_plants');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    check('deck: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function pictureAndWord(browser) {
  const { ctx, g } = await open(browser, 'cards-text', true);
  try {
    await start(g);
    await g.ev(() => { G.words.meet('manzana', 'test'); G.words.meet('gato', 'test'); const r = G.words.rec('gato'); r.st = 3; G.words.meet('hola', 'test'); G.words.rec('hola').st = 2; });
    const L = await g.ev(() => G.richLayout('¡[manzana]! ¿Y el [gato]? ¡[hola]! ¡[queso]!', 400)[0].items.filter(it => it.id).map(it => ({ id: it.id, look: it.look, pic: G.lookHasPic(it.look) })));
    check('text: a met word is picture + word, a known one too (no word alone any more)', L[0].look === 'both' && L[2].look === 'both' && L.every(x => x.pic), JSON.stringify(L));
    check('text: a remembered word is picture + gold word', L[1].look === 'gold');
    check('text: an unmet word is its picture and a blank (not readable yet)', L[3].look === 'pic');
    await g.ev(() => G.field.tasks.add((function* () { yield G.say('¡Mira! ¡[manzana]! ¿Y el [gato]? ¡[hola]! ¡[queso]!'); })()));
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().shown >= G.top().chars(0, 3), null, 'the line');
    await still(g, 'line');
    await g.tap(110, 120);
    await g.fieldIdle('villa');
    // a question's own choices are heard in its prompt, not shown (the picture would give the answer away)
    await ask(g, { prompt: '¿Dónde está el [gato]?', layout: 'cards', choices: cards('gato', 'manzana', 'hola'), answer: 0 });
    await choiceUp(g);
    check('question: its answer in the prompt is a speaker (heard, not shown)', await g.ev(() => G.top().lines[0].items.find(it => it.id === 'gato').look === 'mask'));
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.frames(6); await still(g, 'won_card');
    await g.until(() => window.__r !== null, null, 'the question to finish');
    // the bubble over a thing and the corner: picture + word (the corner, unmet: picture + "?")
    check('text: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function demos(browser) {
  const { ctx, g } = await openFake(browser, 'cards-demo');
  try {
    await start(g, { demos: true, x: 7, y: 17 });
    await g.ev(() => { for (const w of ['hola', 'adios', 'gracias', 'pelota', 'manzana']) G.words.meet(w, 'test'); });
    await g.until(() => !G.cards.busy(), null, 'quiet', 10000);
    // the first question with picture cards: the hand glides over the cards and taps one
    await ask(g, { prompt: '¿Qué es?', show: 'adios', layout: 'cards', choices: cards('hola', 'adios', 'gracias'), answer: 1 });
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'answer', null, 'the answer demo', 8000);
    check('demo: the first question\'s cards get the ghost hand (and it\'s saved)', await g.ev(() => G.demo.shown('answer')));
    await g.frames(30); await still(g, 'demo_answer');
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'mic', null, 'the mic demo after it', 12000);
    check('demo: then the mic: the hand taps it and a mouth talks beside it', await g.ev(() => G.demo.shown('mic')));
    await g.until(() => G.demo.cur && G.demo.cur.talk > 20, null, 'the mouth', 8000);
    await still(g, 'demo_mic');
    await g.until(() => !G.demo.cur, null, 'the demo to end', 10000);
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.until(() => window.__r !== null, null, 'the question to finish');
    await g.until(() => G.top() === G.field || G.top().constructor.name === 'WordCard', null, 'back');
    if (await g.scene() === 'WordCard') { await g.frames(24); await g.tap(150, 200); }
    await g.fieldIdle('villa');
    // a second question: no demo any more
    await ask(g, { prompt: '¿Qué es?', show: 'hola', layout: 'cards', choices: cards('hola', 'adios', 'gracias'), answer: 0, noMic: true });
    await choiceUp(g); await g.frames(40);
    check('demo: shown once: the next question has no hand', await g.ev(() => !G.demo.cur));
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.until(() => window.__r !== null, null, 'the question to finish');
    await g.fieldIdle('villa');
    await g.until(() => !G.cards.busy(), null, 'quiet', 10000);
    // on the map, standing about: the ball in front of home gets the pick-up hand
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'pickup', null, 'the pick-up demo', 15000);
    await g.frames(20); await still(g, 'demo_pickup');
    await g.until(() => !G.demo.cur, null, 'the demo to end', 10000);
    // holding the ball with Canelo near: the hand carries it to him
    await g.ev(() => { const s = G.carry.SOURCES.find(s => s.id === 'pelota'); G.carry.pick(G.field, s.at[0], s.at[1]); });
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'give', null, 'the give demo', 20000);
    await g.frames(36); await still(g, 'demo_give');
    await g.until(() => !G.demo.cur, null, 'the demo to end', 10000);
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'putdown', null, 'the put-down demo', 20000);
    await g.frames(16); await still(g, 'demo_putdown');
    check('demo: pick up, give to Canelo, put down (tap yourself), each once', await g.ev(() => ['pickup', 'give', 'putdown'].every(k => G.demo.shown(k))));
    await g.until(() => !G.demo.cur, null, 'the demo to end', 10000);
    // a child's own tap stops a demo at once
    await g.ev(() => { delete G.state.flags.demo.putdown; });
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'putdown', null, 'the put-down demo again', 20000);
    await g.frames(10);
    await g.tapTile(9, 18);
    check('demo: the child\'s own tap stops it', await g.ev(() => !G.demo.cur), await g.ev(() => JSON.stringify(G.demo.cur && { k: G.demo.cur.kind, t: G.demo.cur.t, i: G.demo.cur.i })));
    // saved: a reload keeps them shown
    check('demo: the demos shown are in the save', await g.ev(() => { G.st.begin(3); const s = G.st.read(3); return !!(s && s.flags.demo && s.flags.demo.answer && s.flags.demo.pickup); }));
    check('demo: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function variety(browser) {
  const { ctx, g } = await open(browser, 'cards-play', true);
  try {
    await start(g);
    const seq = await g.ev(() => {
      for (const w of ['agua', 'galleta', 'hueso', 'pelota', 'gato', 'conejo', 'pato', 'gallina']) G.words.meet(w, 'test');
      const p = G.pet.state(); p.tricks.ven = 3; p.tricks.sientate = 3;
      const sk = G.seek.today(); if (sk) { sk.done = true; sk.on = true; sk.list.forEach(h => { h.found = true; }); }
      const out = [];
      for (let i = 0; i < 6; i++) {
        const g0 = G.carry.more(G.field, null); if (!g0) break;
        out.push(g0.why);
        const k = /trick/.test(g0.why) ? 'truco' : /pet/.test(g0.why) ? 'mimo' : /food/.test(g0.why) ? 'comida' : /hide/.test(g0.why) ? 'seek' : /ball for/.test(g0.why) ? 'regalo' : 'fetch';
        G.carry.bump(k);
      }
      return out;
    });
    const kinds = new Set(seq.map(w => w.split(' ')[0] + (w.match(/trick|pet|food|hide|ball|fetch/) || [''])[0]));
    check('play: after the day\'s plays, the next goals turn: tricks, petting, food, hide-and-seek... (not endless fetch)', seq.length >= 5 && kinds.size >= 5 && seq.filter(w => w === 'fetch').length <= 1, JSON.stringify(seq));
    check('play: a trick for Canelo shows the trick\'s picture', await g.ev(() => { G.state.bag.play.n = {}; const g0 = G.carry.more(G.field, null); return !!g0 && g0.dog && !!G.data.words[g0.icon]; }));
    // hide-and-seek again: Nico starts a second round when the guide sends you to him
    const re = await g.ev(() => { G.state.bag.play.n = { truco: 5, mimo: 5, comida: 5 }; return G.seek.again() && (G.carry.more(G.field, null) || {}).who === 'nico'; });
    check('play: hide-and-seek again with Nico (the day\'s round done)', re);
    check('play: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Word cards that grow, the book later, picture + word, ghost-hand demos, variety', [
  ['cards grow by use (pick, say, carry, find)', growing],
  ['the deck, and the book later', deckAndBook],
  ['picture and word together', pictureAndWord],
  ['ghost-hand demos, once each', demos],
  ['variety when the day\'s plays are done', variety],
]);
