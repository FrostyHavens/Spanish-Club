// Learning plan 2, Phase 2 (docs/LEARNING_PLAN_2.md): phrases, "say it to get it" (src/phrases.js).
//   node      G.speech.matchPhrase in plain Node: must-pass / must-fail lists (lenient: articles, accents, ¿¡, word order,
//             small mishearings, frame synonyms, "por favor" anywhere; the key word alone, the frame alone, a wrong word)
//   ask       the request with a FAKE recognizer (as tools/test-speaking.js): a pattern's introduction (two friends model
//             it, then "¡Ahora tú!"), the whole phrase said (the thing comes, the phrase's and the word's cards grow, the
//             history), the key word only (it still comes; the invitation; the second try's bonus), a wrong word, nothing
//             heard, the frame alone, "por favor", Me llamo with a mis-heard name, the builder (taps), the ghost hands
//   cards     phrase cards (the deck's Frases tab, the notebook's page), the grown-ups' Learning page (the Frases tab,
//             the Overview's phrases, share), each pattern introduced once and one at a time, the warm-up's phrase
//   world     a real placement per pattern: Marta's shop (Quiero), Lola's first hello (Me llamo) and her favourite animal
//             (Me gusta, pinned in the album), Nico's hide-and-seek hint (¿Dónde está?), a present (Tengo), Don Pepe's
//             shop with "por favor", a town friend's greeting (Me llamo), Doña Nieves's ice cream; phrases off: the old way
//   NODE_PATH=$(npm root -g) node tools/test-phrases.js [screenshot dir]
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { run, open, check, ROOT } = require('./harness');

// =====================================================================
//  G.speech.matchPhrase in Node
// =====================================================================
// [frame, slot targets (word ids or names), heard, expected: {frame, slot, full, polite}]
const MUST = [
  ['f_quiero', ['helado'], 'quiero un helado', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['helado'], 'Quiero un helado.', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['helado'], 'helado', { frame: false, slot: 0, full: false }],
  ['f_quiero', ['helado'], 'un helado', { frame: false, slot: 0, full: false }],
  ['f_quiero', ['helado'], 'quiero', { frame: true, slot: -1, full: false }],
  ['f_quiero', ['helado', 'pan'], 'quiero pan', { frame: true, slot: 1, full: true }],       // (the slot is helado: a wrong word, for the caller)
  ['f_quiero', ['helado'], 'quiero pan', { frame: true, slot: -1, full: false }],
  ['f_quiero', ['helado'], 'un helado quiero', { frame: true, slot: 0, full: true }],       // word order
  ['f_quiero', ['helado'], 'kiero un elado', { frame: true, slot: 0, full: true }],         // mishearings
  ['f_quiero', ['helado'], 'quero un helado', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['helado'], 'yo quiero helado', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['helado'], 'quisiera un helado', { frame: true, slot: 0, full: true }],      // a frame synonym
  ['f_quiero', ['galleta'], 'quiero galletas', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['estrellamar'], 'quiero una estrella de mar', { frame: true, slot: 0, full: true }],
  ['f_quiero', ['helado'], 'quiero un helado por favor', { frame: true, slot: 0, full: true, polite: true }],
  ['f_quiero', ['helado'], 'por favor quiero un helado', { frame: true, slot: 0, full: true, polite: true }],
  ['f_quiero', ['helado'], 'un helado por favor', { frame: false, slot: 0, full: false, polite: true }],
  ['f_porfavor', ['pan'], 'pan por favor', { frame: true, slot: 0, full: true, polite: true }],
  ['f_porfavor', ['pan'], 'por favor, pan', { frame: true, slot: 0, full: true, polite: true }],
  ['f_porfavor', ['pan'], 'pan porfavor', { frame: true, slot: 0, full: true, polite: true }],
  ['f_porfavor', ['pan'], 'pan', { frame: false, slot: 0, full: false }],
  ['f_llamo', ['Luz'], 'me llamo Luz', { frame: true, slot: 0, full: true }],
  ['f_llamo', ['Luz'], 'Me llamo luis', { frame: true, full: true }],                      // a mis-heard name
  ['f_llamo', ['Luz'], 'me llamo los', { frame: true, full: true }],
  ['f_llamo', ['Luz'], 'me llamo', { frame: true, full: true }],                           // (the name lost)
  ['f_llamo', ['Luz'], 'mi nombre es Luz', { frame: true, slot: 0, full: true }],
  ['f_llamo', ['Luz'], 'Luz', { frame: false, slot: 0, full: false }],
  ['f_donde', ['gato'], 'dónde está el gato', { frame: true, slot: 0, full: true }],
  ['f_donde', ['gato'], '¿Dónde está el gato?', { frame: true, slot: 0, full: true }],
  ['f_donde', ['gato'], 'donde esta la gata', { frame: true, slot: 0, full: true }],
  ['f_donde', ['gato', 'conejo'], 'dónde están los conejos', { frame: true, slot: 1, full: true }],
  ['f_donde', ['gato'], 'dónde gato', { frame: false, slot: 0, full: false }],               // ("está" left out: the key word)
  ['f_gusta', ['oso', 'gato'], 'me gusta el oso', { frame: true, slot: 0, full: true }],
  ['f_gusta', ['oso'], 'me gusta mucho el oso', { frame: true, slot: 0, full: true }],
  ['f_gusta', ['zapatos'], 'me gustan los zapatos', { frame: true, slot: 0, full: true }],
  ['f_gusta', ['oso'], 'me encanta el oso', { frame: true, slot: 0, full: true }],
  ['f_tengo', ['carta'], 'tengo una carta', { frame: true, slot: 0, full: true }],
  ['f_tengo', ['carta'], 'aquí tengo una carta', { frame: true, slot: 0, full: true }],
  ['f_tengo', ['carta'], 'una carta tengo', { frame: true, slot: 0, full: true }],
  ['f_tengo', ['flor', 'manzana', 'pelota'], 'tengo una manzana', { frame: true, slot: 1, full: true }],
  // must fail: not the frame asked for, nothing like the word
  ['f_quiero', ['helado'], 'me gusta el helado', { frame: false, slot: 0, full: false }],
  ['f_tengo', ['carta'], 'quiero una carta', { frame: false, slot: 0, full: false }],
  ['f_gusta', ['gato'], 'me llamo gato', { frame: false, slot: 0, full: false }],
  ['f_quiero', ['queso', 'pan'], 'queso', { frame: false, slot: 0, full: false }],          // (queso is not quiero)
  ['f_quiero', ['manzana'], 'quiero una banana', { frame: true, slot: -1, full: false }],
  ['f_quiero', ['helado'], 'hola', { frame: false, slot: -1, full: false }],
  ['f_quiero', ['helado'], '', { frame: false, slot: -1, full: false }],
  ['f_llamo', ['Luz'], 'hola', { frame: false, slot: -1, full: false }],
  ['f_donde', ['gato'], 'el perro', { frame: false, slot: -1, full: false }],
];
async function node() {
  const ctx = { G: {}, console, setTimeout, clearTimeout }; ctx.window = { G: ctx.G }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'speech.js'), 'utf8'), ctx, { filename: 'src/speech.js' });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'content', 'es', 'words.js'), 'utf8'), ctx, { filename: 'content/es/words.js' });
  const S = ctx.G.speech, C = ctx.G.content.es;
  check('node: speech.js and the content load with no browser; six phrases, each with its spoken frames', !!S.matchPhrase && Object.keys(C.phrases).length === 6 && Object.keys(C.phrases).every(id => C.phrases[id].say && C.phrases[id].es.includes('___')));
  for (const id in C.phrases) S.FRAMES[id] = C.phrases[id]; // (as src/phrases.js does)
  const target = id => { const w = C.words[id]; return w ? [w.es, w.alt].filter(Boolean).join(' / ') : id; };
  for (const [f, slots, heard, want] of MUST) {
    const m = S.matchPhrase(f, slots.map(target), [{ transcript: heard, confidence: 0.5 }]);
    const ok = m.frame === want.frame && (want.slot === undefined || m.slot === want.slot) && m.full === want.full && m.polite === !!want.polite;
    check(`phrase: ${f} ${JSON.stringify(slots)} heard ${JSON.stringify(heard)} -> frame ${m.frame}, slot ${m.slot}, full ${m.full}${m.polite ? ', polite' : ''}`, ok, JSON.stringify(m));
  }
  let m = S.matchPhrase('f_quiero', [target('helado')], [{ transcript: 'helado' }, { transcript: 'quiero un helado' }, { transcript: 'quiero' }]);
  check('phrase: the best alternative wins (the whole phrase over the key word alone over the frame alone)', m.full && m.i === 1, JSON.stringify(m));
  m = S.matchPhrase({ say: 'quiero' }, ['pan'], 'quiero pan');
  check('phrase: a frame can be given as a spec, and plain strings work', m.full && m.slot === 0);
  const a = [{ transcript: 'Quiero pan' }], copy = JSON.stringify(a);
  check('phrase: pure (the same answer twice, input untouched)', JSON.stringify(S.matchPhrase('f_quiero', ['pan'], a)) === JSON.stringify(S.matchPhrase('f_quiero', ['pan'], a)) && JSON.stringify(a) === copy);
  check('phrase: the single-word matcher is unchanged ("yo quiero una manzana" still finds manzana)', S.match('manzana', ['yo quiero una manzana']).pass && !S.match('manzana', ['banana']).pass);
}

// ---------- a fake recognizer (as in tools/test-speaking.js): each start() takes the next reply from window.__sr.queue ----------
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [], calls: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.calls.push('start'); sr.starts.push({ during: window.event ? window.event.type : 'frame' });
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(([transcript, confidence]) => ({ transcript, confidence })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 250);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 50); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openWith(browser, name, touch, o = {}) {
  const { ctx, g } = await open(browser, name, touch, Object.assign({ phrases: true }, o));
  if (!o.noMic) await ctx.addInitScript(FAKE); else await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// a game on the map: words met on an earlier day (o.words), chapters done (o.done), the dog yours, demos seen (o.demos: not)
const game = (g, o = {}) => g.ev(o => {
  G.debug.dayShift = -1;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of o.done || ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
  W.newSession('new');
  for (const id of o.words || []) { W.meet(id, 'test'); if (G.animals && G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; }
  G.debug.dayShift = 0; W.newSession('load');
  for (const id of o.words || []) Object.assign(W.rec(id), { st: 2, box: 2, fu: 0, due: null, dd: W.day() + 3, dc: W.dayNum() + 3 }); // (known, not due: the review stays out of the way)
  G.cards.grow = grow;
  if (!o.demos) G.demo.skip();
  for (const z of o.visit || []) G.zones.visit(z);
  if (o.lola) G.state.world.lola = { met: true };
  window.__said = []; const sp = G.speak; G.speak = t => { window.__said.push(G.plain(G.fill(t))); sp(t); };
  G.goto(o.map || 'villa', o.x || 22, o.y || 13, o.dir || 'down');
}, o);
const top = g => g.ev(() => G.top().constructor.name);
const still = async (g, label) => { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); };
// a phrase request as a story moment: window.__r gets its result
const request = (g, id, o) => g.ev(([id, o]) => { window.__r = undefined; window.__got = []; o.onGet = function* (k) { window.__got.push(k); yield 1; }; G.chapters.scene(G.field, (function* () { window.__r = yield* G.phrase.request(id, o); if (window.__r === undefined) window.__r = null; })()); }, [id, o]);
const askUp = (g, invite) => g.until(inv => { const s = G.top(); return s && s.constructor.name === 'PhraseAsk' && (s.invite != null) === inv && s.t > 12 && !s.result && G.input.ready(); }, !!invite, invite ? 'the invitation' : 'the phrase request');
// script the recognizer, then tap the big mic
async function speak(g, reply) {
  await g.ev(r => window.__sr.queue.push(r), reply);
  const n = await g.ev(() => window.__sr.starts.length);
  await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
  await g.until(n => window.__sr.starts.length > n, n, 'the recognizer to start');
  await g.until(() => !G.speech.listening() && !(G.top().mic && G.top().mic.listening()), null, 'the mic to finish', 8000);
  await g.frames(4);
}
const say = (g, text) => speak(g, { results: [[text, 0.9]] });
// tap through any lines (a TextBox) until cond
async function past(g, cond, what, timeout = 20000) {
  const t0 = Date.now();
  while (!(await g.ev(cond))) {
    if (Date.now() - t0 > timeout) throw new Error('timed out waiting for ' + what + ' (top scene: ' + await g.scene() + ')');
    const n = await top(g);
    if ((n === 'TextBox' || n === 'WordCard' || n === 'FriendCard') && await g.ev(() => G.input.ready() && G.top().t > 20)) await g.tap(150, 120); else await g.frames(4);
  }
}
// the model's events for an item today (history.js)
const ev = (g, id) => g.ev(id => { const e = G.hist.day().w[id]; return e ? e[1] : ''; }, id);
const WORDS = ['hola', 'pan', 'galleta', 'helado', 'manzana', 'flor', 'carta', 'pelota', 'gato', 'perro', 'conejo', 'pato', 'oso', 'gracias', 'si', 'no'];

// =====================================================================
//  The request: introduction, the whole phrase, the key word, the invitation, a wrong word, nothing, por favor, builder
// =====================================================================
async function ask(browser) {
  const { ctx, g } = await openWith(browser, 'phr-ask', true);
  try {
    await game(g, { words: WORDS, demos: true });
    await g.fieldIdle('villa');
    check('ask: G.phrase is on, six patterns, none met yet', await g.ev(() => G.phrase.on() && G.phrase.ids().length === 6 && G.phrase.list(1).length === 0));

    // ---- the introduction: two friends model it, then "¡Ahora tú!" ----
    await request(g, 'f_quiero', { who: 'marta', slots: ['pan', 'galleta'], free: true });
    await g.until(() => G.top().constructor.name === 'PhraseModel', null, 'the introduction');
    await g.frames(60); await still(g, 'intro_quiero_lola');
    const said1 = await g.ev(() => window.__said.slice());
    check('ask: the introduction says the first model ("Quiero pan." by Lola, to Marta)', said1.includes('Quiero pan.') && await g.ev(() => { const m = G.top().models; return m[0].who === 'lola' && m[0].to === 'marta' && m[1].who === 'nico'; }), said1.join(' | '));
    await g.until(() => G.top().row === 1 && G.top().rt > 110, null, 'the second model');
    await still(g, 'intro_quiero_nico');
    check('ask: ...then the second ("Quiero una galleta."), and Marta answers "¡Aquí tienes!" each time', await g.ev(() => window.__said.includes('Quiero una galleta.') && window.__said.filter(s => s === '¡Aquí tienes!').length >= 1));
    await g.until(() => G.top().row === 2 && G.top().rt > 40, null, '"¡Ahora tú!"');
    await still(g, 'intro_quiero_ahora_tu');
    check('ask: then "¡Ahora tú!": her face and her empty bubble', await g.ev(() => window.__said.includes('¡Ahora tú!')));
    await g.tap(160, 120);
    await g.until(() => G.cards.list().some(c => c.id === 'f_quiero' && c.fresh), null, 'its new card');
    const popped = await g.ev(() => !G.phrase.cur());
    await askUp(g);
    const st0 = await g.ev(() => ({ met: G.phrase.met('f_quiero'), intro: G.phrase.state().intro.f_quiero, flown: !G.cards.popping('f_quiero'), words: Object.keys(G.state.words).some(k => k.startsWith('f_')) }));
    check('ask: the pattern is met (its new card pops up, says itself and flies into the deck before the request), its introduction saved; its record is kept apart from the words', popped && st0.met && st0.intro && st0.flown && !st0.words, JSON.stringify(st0));
    await g.frames(20); await still(g, 'ask_quiero');
    const L = await g.ev(() => { const s = G.top(); return { mic: s.mic && s.mic.o.rect(), rects: s.rects(), bubble: s.bubble(), face: s.faceRect(), box: s.box() }; });
    const inside = r => r.x >= 0 && r.y >= 0 && r.x + r.w <= 320 && r.y + r.h <= 224, apart = (a, b) => a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
    check('ask: a big mic (46 px) beside her speech bubble; the frame card and a card per word; nothing overlaps, all on screen', L.mic && L.mic.w >= 44 && L.rects.length === 3 && [L.mic, L.bubble, L.face, L.box].concat(L.rects).every(inside) && apart(L.mic, L.bubble) && apart(L.face, L.bubble) && L.rects.every(r => apart(r, L.mic) && apart(r, L.bubble)), JSON.stringify(L));
    // the ghost hand: say the whole thing (the mic, a mouth on her face, the bubble's pieces lighting up)
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'phrasesay' && G.demo.cur.talk > 20, null, 'the "say the whole thing" demo');
    await still(g, 'demo_phrasesay');
    check('ask: the first time, a ghost hand taps the big mic and her face talks (phrasesay)', await g.ev(() => G.demo.shown('phrasesay') && !!G.demo.cur.mouth));

    // ---- the whole phrase: the thing comes, both cards grow a lot, the history ----
    await g.ev(() => { G.cards.log.length = 0; });
    await say(g, 'Quiero pan');
    await g.until(() => window.__r !== undefined, null, 'the request to end');
    const f1 = await g.ev(() => ({ r: window.__r, got: window.__got, log: G.cards.log.map(l => l.id + ':' + l.how + ':' + l.add), rec: G.words.rec('f_quiero'), pan: G.words.rec('pan').said }));
    check('ask: "Quiero pan" -> the whole phrase: the thing comes (onGet), k = pan', f1.r && f1.r.how === 'full' && f1.r.k === 0 && f1.got.join() === '0', JSON.stringify(f1.r));
    check('ask: ...the phrase\'s card grows the most (phrase 8) and the word\'s card too (said 5, +3 for the whole phrase)', f1.log.includes('f_quiero:phrase:8') && f1.log.includes('pan:say:5') && f1.log.includes('pan:say:3'), f1.log.join(' '));
    check('ask: ...the phrase was said (stage 2, said 1, its card shows the word it was said with); pan said too', f1.rec.st === 2 && f1.rec.said === 1 && f1.rec.slot === 'pan' && f1.pan === 1, JSON.stringify(f1.rec));
    check('ask: ...in the history: S for the phrase, S for the word', await ev(g, 'f_quiero') === 'S' && await ev(g, 'pan') === 'S');
    await g.fieldIdle('villa');

    // ---- the key word only: it still comes; then the invitation (one more try, a bonus) ----
    await g.ev(() => { G.phrase.state().last = -1e6; G.cards.log.length = 0; });
    await request(g, 'f_quiero', { who: 'marta', slots: ['pan', 'galleta'], free: true, polite: false }); // (polite: false: not "por favor"'s introduction now)
    await askUp(g);
    await say(g, 'galleta');
    await g.until(() => window.__got.length === 1, null, 'the thing to come');
    check('ask: "galleta" alone -> it still comes (onGet ran first)', await g.ev(() => window.__got[0] === 1 && window.__r === undefined));
    check('ask: ...the word was said (its card grew), the phrase a miss (m: it wasn\'t said)', await ev(g, 'galleta') === 'S' && (await ev(g, 'f_quiero')).endsWith('m') && await g.ev(() => G.cards.log.some(l => l.id === 'galleta' && l.how === 'say')));
    await askUp(g, true);
    await g.frames(30); await still(g, 'invite_quiero');
    const inv = await g.ev(() => { const s = G.top(); return { placed: s.placed, said: window.__said.slice(-3), next: s.nextRect(), mic: s.mic.o.rect() }; });
    check('ask: the invitation: her bubble with the whole phrase ("Quiero una galleta." said for her), the big mic, a "go on" arrow', inv.placed.frame && inv.placed.slot === 1 && inv.said.includes('Quiero una galleta.') && inv.next.w >= 30, JSON.stringify(inv));
    await g.ev(() => { G.cards.log.length = 0; });
    await say(g, 'quiero una galleta');
    await g.until(() => window.__r !== undefined, null, 'the invitation to end');
    const f2 = await g.ev(() => ({ r: window.__r, log: G.cards.log.map(l => l.id + ':' + l.how + ':' + l.add) }));
    check('ask: said whole on the second try: the bonus (the phrase grows, the word +3), res.again', f2.r.how === 'key' && f2.r.again === true && f2.log.includes('f_quiero:phrase:8') && f2.log.includes('galleta:say:3'), JSON.stringify(f2));
    check('ask: ...the history: the phrase\'s miss, then said after it (s)', /ms$/.test(await ev(g, 'f_quiero')), await ev(g, 'f_quiero'));
    await g.fieldIdle('villa');

    // ---- the invitation never blocks: the "go on" arrow ----
    await request(g, 'f_quiero', { who: 'marta', slots: ['pan', 'galleta'], free: true, polite: false });
    await askUp(g);
    await say(g, 'pan');
    await askUp(g, true);
    await g.tapRect(await g.ev(() => G.top().nextRect()));
    await g.until(() => window.__r !== undefined, null, 'going on');
    check('ask: the invitation\'s arrow goes on at once (no bonus, nothing lost)', await g.ev(() => window.__r.how === 'key' && window.__r.again === false && window.__got[0] === 0));
    await g.fieldIdle('villa');

    // ---- nothing heard, the frame alone, a wrong word ----
    await g.ev(() => { G.phrase.state().last = -1e6; });
    await request(g, 'f_tengo', { who: 'mama', slots: ['flor', 'manzana', 'pelota'], answer: 0 });
    await g.until(() => G.top().constructor.name === 'PhraseModel', null, 'Tengo\'s introduction');
    await g.until(() => G.top().row === 0 && G.top().rt > 110, null, 'its first model');
    await still(g, 'intro_tengo');
    await g.drive(() => G.top().constructor.name === 'PhraseAsk', 'to the request');
    await askUp(g);
    await speak(g, { error: 'no-speech' });
    check('ask: nothing heard: "¡Otra vez!" (the mic\'s ear), the request stays', await g.ev(() => G.top().constructor.name === 'PhraseAsk' && G.top().mic.sad > 0 && !G.top().result));
    await say(g, 'tengo');
    check('ask: the frame alone ("tengo"): it lights up, "¿...?" over the empty slot, no miss', await g.ev(() => { const s = G.top(); return s.lit > 0 && s.ask > 0 && !s.result && !G.hist.day().w.flor; }));
    await g.frames(6); await still(g, 'frame_only');
    await say(g, 'tengo una manzana');
    check('ask: a wrong word ("tengo una manzana" holding a flower): its card greys out, the answer\'s word a miss', await g.ev(() => { const s = G.top(); return s.off[1] && !s.result && G.hist.day().w.flor[1] === 'm'; }));
    await g.frames(6); await still(g, 'wrong_word');
    await say(g, 'tengo una flor');
    await g.until(() => window.__r !== undefined, null, 'Tengo to end');
    check('ask: then "tengo una flor": the whole phrase (the word right after its miss)', await g.ev(() => window.__r.how === 'full' && window.__r.k === 0 && G.hist.day().w.flor[1] === 'ms'));
    await g.fieldIdle('villa');

    // ---- "por favor": the polite bonus (met right there when she says it on her own) ----
    const h0 = await g.ev(() => G.hearts.get('marta'));
    await g.ev(() => { G.cards.log.length = 0; });
    await request(g, 'f_quiero', { who: 'marta', slots: ['pan', 'galleta'], free: true, polite: false });
    await askUp(g);
    await say(g, 'quiero pan por favor');
    await g.frames(8); await still(g, 'por_favor');
    await g.until(() => window.__r !== undefined, null, 'the polite request');
    const pf = await g.ev(h0 => ({ r: window.__r, met: G.phrase.met('f_porfavor'), said: G.words.rec('f_porfavor').said, log: G.cards.log.map(l => l.id + ':' + l.how), heart: G.hearts.get('marta') - h0, at: G.phrase.state().intro.f_porfavor }), h0);
    check('ask: "Quiero pan, por favor": the whole phrase AND the "por favor" phrase (met right there), its card grows, a heart', pf.r.how === 'full' && pf.r.polite && pf.met && pf.said === 1 && pf.log.includes('f_porfavor:phrase') && pf.heart === 1 && pf.at.at === 'said', JSON.stringify(pf));
    await g.fieldIdle('villa');
    await request(g, 'f_quiero', { who: 'marta', slots: ['pan', 'galleta'], free: true, polite: false });
    await askUp(g);
    await say(g, 'una galleta por favor');
    await g.until(() => window.__r !== undefined, null, 'the polite key word');
    check('ask: "Una galleta, por favor" (no Quiero): a whole polite request, it comes, no invitation', await g.ev(() => window.__r.how === 'polite' && window.__r.k === 1 && window.__r.again === undefined && G.words.rec('f_porfavor').said === 2));
    await g.fieldIdle('villa');

    // ---- Me llamo: a mis-heard name still counts once "me llamo" is heard ----
    await g.ev(() => { G.phrase.state().last = -1e6; window.__r = undefined; G.chapters.scene(G.field, (function* () { window.__r = yield* G.phrase.meetName('pepe'); })()); });
    await g.until(() => G.top().constructor.name === 'PhraseModel', null, 'Me llamo\'s introduction');
    await g.until(() => G.top().row === 1 && G.top().rt > 110, null, 'the second model');
    await still(g, 'intro_llamo');
    check('ask: Me llamo is modelled by Lola and Nico ("Me llamo Lola." "¡Hola, Lola!")', await g.ev(() => window.__said.includes('Me llamo Lola.') && window.__said.includes('¡Hola, Lola!') && window.__said.includes('Me llamo Nico.')));
    await g.drive(() => G.top().constructor.name === 'PhraseAsk', 'to the request');
    await askUp(g);
    await g.frames(10); await still(g, 'ask_llamo');
    check('ask: Don Pepe: "¡Hola! Me llamo Pepe. ¿Y tú?"; one card: her face and her name', await g.ev(() => { const s = G.top(); return /Me llamo Pepe/.test(s.prompt) && s.cardsN === 1 && s.slots[0].name && s.slotView(0).label === 'Luz'; }));
    await say(g, 'me llamo lus');
    await past(g, () => window.__r !== undefined, 'the name exchange');
    check('ask: "me llamo lus" (her name mis-heard): the whole phrase; they know each other now', await g.ev(() => window.__r === true && G.phrase.named('pepe') && G.words.rec('f_llamo').said === 1 && /S$/.test(G.hist.day().w.f_llamo[1])));
    await g.fieldIdle('villa');

    // ---- the builder: tap the frame card, then a word card: read aloud, counted as built (below saying) ----
    await g.ev(() => { G.phrase.state().last = -1e6; G.cards.log.length = 0; });
    await request(g, 'f_gusta', { who: 'lola', slots: ['oso', 'gato', 'perro'], free: true });
    await g.drive(() => G.top().constructor.name === 'PhraseAsk', 'Me gusta\'s introduction');
    await askUp(g);
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'phrase' && G.demo.cur.i >= 1, null, 'the builder demo', 15000);
    await still(g, 'demo_builder');
    check('ask: when she waits, a ghost hand shows the builder (the frame card, then a word card)', await g.ev(() => G.demo.shown('phrase')));
    await g.until(() => !G.demo.cur, null, 'the demo to end');
    const R = await g.ev(() => G.top().rects());
    await g.tapRect(R[0]);
    check('ask: the frame card goes into her bubble ("Me gusta" said)', await g.ev(() => G.top().placed.frame && G.top().placed.slot < 0 && window.__said.slice(-1)[0] === 'Me gusta'));
    await g.frames(16); await still(g, 'builder_frame');
    await g.tapRect(R[1]);
    await g.frames(4); await still(g, 'builder_done');
    await g.until(() => window.__r !== undefined, null, 'the built phrase');
    const b = await g.ev(() => ({ r: window.__r, said: window.__said.slice(-3), e: G.hist.day().w.f_gusta[1], st: G.words.stage('f_gusta'), log: G.cards.log.map(l => l.id + ':' + l.how) }));
    check('ask: then a word card: the sentence is read aloud ("Me gusta el oso."), counted as built (P), its card grows (build)', b.r.how === 'built' && b.r.k === 0 && b.said.includes('Me gusta el oso.') && b.e === 'P' && b.log.includes('f_gusta:build'), JSON.stringify(b));
    // a built phrase can't make it gold: saying it can
    await g.ev(() => { const r = G.words.rec('f_gusta'); Object.assign(r, { st: 2, due: null, dd: 0, dc: 0 }); });
    await request(g, 'f_gusta', { who: 'lola', slots: ['oso', 'gato', 'perro'], free: true });
    await askUp(g);
    await (async () => { const R2 = await g.ev(() => G.top().rects()); await g.tapRect(R2[0]); await g.tapRect(R2[2]); })();
    await g.until(() => window.__r !== undefined, null, 'built again');
    check('ask: built again: still known (stage 2), never gold by taps', await g.ev(() => G.words.stage('f_gusta') === 2));
    await g.fieldIdle('villa');
    await request(g, 'f_gusta', { who: 'lola', slots: ['oso', 'gato', 'perro'], free: true });
    await askUp(g);
    await say(g, 'me gusta el perro');
    await past(g, () => window.__r !== undefined, 'said');
    check('ask: said whole: remembered (stage 3, gold), like a word recalled', await g.ev(() => G.words.stage('f_gusta') === 3));
    check('ask: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  Cards, the notebook, the grown-ups' page; each pattern introduced once, one at a time; the warm-up's phrase
// =====================================================================
async function cards(browser) {
  const { ctx, g } = await openWith(browser, 'phr-cards', true, { warmup: true });
  try {
    await game(g, { words: WORDS });
    await g.ev(() => G.warmup.skipToday());
    await g.fieldIdle('villa');
    // three phrases met: Quiero said (with el helado), Me llamo said, Me gusta built
    await g.ev(() => {
      const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
      for (const id of ['f_quiero', 'f_llamo', 'f_gusta']) { W.meet(id, 'phrase'); G.phrase.state().intro[id] = { d: W.day(), at: 'test' }; }
      W.answerRight('f_quiero', { said: true, mode: 'say' }); Object.assign(W.rec('f_quiero'), { said: 1, slot: 'helado', gp: 12 });
      W.answerRight('f_llamo', { said: true, mode: 'say' }); Object.assign(W.rec('f_llamo'), { said: 2, slot: '_name', gp: 6 });
      W.answerRight('f_gusta', { mode: 'both' }); Object.assign(W.rec('f_gusta'), { slot: 'oso', gp: 3 });
      G.cards.grow = grow;
    });
    check('cards: the phrases met, in their order; the words\' lists stay words', await g.ev(() => G.phrase.list(1).join() === 'f_llamo,f_quiero,f_gusta' && !G.words.list(1).some(id => id.startsWith('f_')) && G.review.due(1e9).every(id => !id.startsWith('f_'))));
    check('cards: a phrase\'s sentence and card label (the slot it was said with, its article by ear)', await g.ev(() => G.phrase.sentence('f_quiero') === 'Quiero un helado.' && G.phrase.sentence('f_llamo') === 'Me llamo Luz.' && G.phrase.sentence('f_gusta') === 'Me gusta el oso.' && G.phrase.sentence('f_donde', 'gato') === '¿Dónde está el gato?' && G.phrase.sentence('f_donde', 'ojos') === '¿Dónde están los ojos?' && G.phrase.sentence('f_porfavor', 'pan') === 'Pan, por favor.' && G.phrase.sentence('f_tengo', 'carta') === 'Tengo una carta.' && G.phrase.sentence('f_quiero', 'agua') === 'Quiero agua.' && G.phrase.label('f_donde') === '¿Dónde está?' && G.phrase.label('f_porfavor') === 'por favor'));
    // the deck: the words, and a speech bubble for the phrases
    await g.ev(() => { window.__d = G.deck(); });
    await g.until(() => G.top().constructor.name === 'Deck' && G.input.ready(), null, 'the deck');
    check('cards: the deck opens on the words, with a speech-bubble tab for the phrases', await g.ev(() => G.top().group === 'words' && G.top().phrases.length === 3));
    await g.tapBtn(await g.ev(() => G.top().frasesXY()));
    await g.frames(20); await still(g, 'deck_frases');
    check('cards: the Frases tab: the phrase cards (newest... in their order)', await g.ev(() => G.top().group === 'frases' && G.top().onPage().join() === 'f_llamo,f_quiero,f_gusta'));
    await g.tapRect(await g.ev(() => G.top().cardRect(1)));
    check('cards: tapping a phrase card says its sentence ("Quiero un helado.")', await g.ev(() => window.__said.slice(-1)[0] === 'Quiero un helado.'));
    await g.tapBtn(await g.ev(() => G.top().wordsXY()));
    check('cards: the deck\'s own picture goes back to the words', await g.ev(() => G.top().group === 'words'));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    // the notebook: a "Frases" page, first
    await g.ev(() => { G.notebook(); });
    await g.until(() => G.top().constructor.name === 'Notebook' && G.input.ready(), null, 'the notebook');
    await g.frames(10); await still(g, 'notebook_frases');
    check('cards: the notebook\'s first page is Frases: the six phrases, three met', await g.ev(() => G.top().page() === 'frases' && G.top().words().length === 6 && G.top().words().filter(id => G.words.met(id)).length === 3));
    await g.tapRect(await g.ev(() => G.top().cellRect(0)));
    check('cards: tapping one says it ("Me llamo Luz.")', await g.ev(() => window.__said.slice(-1)[0] === 'Me llamo Luz.'));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    // the grown-ups' Learning page: a Frases tab on Words, the Overview's phrases, share
    await g.ev(() => { G.dashboard.open({ tab: 'Words' }); });
    await g.until(() => G.top().constructor.name === 'LearningDash' && G.input.ready(), null, 'the Learning page');
    const zk = await g.ev(() => { const s = G.top(); return s.zoneRect(G.zones.ids().length); });
    await g.tapRect(zk);
    await g.frames(10); await still(g, 'dash_frases');
    const dv = await g.ev(() => { const v = G.top().view(); return { zone: v.zone, rows: v.rows.map(r => [r.id, r.met, r.st, r.said].join(':')) }; });
    check('cards: the Words tab has a speech-bubble tab: every phrase, met first (stage, said aloud)', dv.zone === 'frases' && dv.rows.length === 6 && dv.rows[0] === 'f_llamo:true:2:2' && dv.rows.includes('f_quiero:true:2:1') && dv.rows.includes('f_gusta:true:2:0') && dv.rows.slice(3).every(r => r.includes(':false:')), JSON.stringify(dv));
    await g.tapRect(await g.ev(() => G.top().tabRect(0)));
    await g.frames(10); await still(g, 'dash_overview');
    const ov = await g.ev(() => { const line = G.top().phraseLine(G.hist.overview().phrases); return { p: G.hist.overview().phrases, line, fits: G.textWidth(line) <= G.W - 92, share: G.dashboard.shareText() }; });
    check('cards: the Overview counts the phrases: 3 of 6 met, said aloud 2 times today (S events), built 1 (in one line)', ov.p.met === 3 && ov.p.of === 6 && ov.p.said === 2 && ov.p.today === 2 && ov.p.built === 1 && /^3 of 6 met; said 2 times \(2 today\), built 1$/.test(ov.line) && ov.fits, JSON.stringify(ov));
    check('cards: the shared text has the phrases', /Phrases: 3 of 6 met \(Me llamo, Quiero, Me gusta\); said aloud 2 times, 2 today\./.test(ov.share), ov.share);
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');

    // ---- one pattern at a time; each introduced once ----
    await g.ev(() => { G.phrase.state().last = G.words.now() - 30; });
    check('intro: right after an introduction, another pattern waits (one at a time)', await g.ev(() => !G.phrase.canIntro('f_donde')));
    await g.ev(() => { G.phrase.state().last = G.words.now() - G.phrase.GAP - 1; });
    check('intro: a few minutes of play later it may come', await g.ev(() => G.phrase.canIntro('f_donde')));
    check('intro: ...but not with a word met a moment ago (two new things at once)', await g.ev(() => { G.words.meet('rana', 't'); return !G.phrase.canIntro('f_donde', { slots: ['rana', 'gato'] }) && G.phrase.canIntro('f_donde', { slots: ['gato', 'perro'] }); }));
    const models = { n: 0 };
    for (const id of ['f_donde', 'f_tengo', 'f_porfavor']) {
      await g.ev(id => { G.phrase.state().last = -1e6; window.__ok = undefined; const slots = { f_donde: ['gato', 'perro'], f_tengo: ['flor', 'manzana'], f_porfavor: ['pan', 'galleta'] }[id]; G.chapters.scene(G.field, (function* () { window.__ok = yield* G.phrase.ready(id, { who: 'nico', slots }); })()); }, id);
      await g.until(() => G.top().constructor.name === 'PhraseModel', null, id + '\'s introduction');
      models.n++;
      if (id === 'f_donde') { await g.until(() => G.top().row === 1 && G.top().rt > 110, null, 'its second model'); await still(g, 'intro_donde'); }
      if (id === 'f_porfavor') { await g.until(() => G.top().row === 0 && G.top().rt > 110, null, 'its first model'); await still(g, 'intro_porfavor'); }
      await g.drive(() => window.__ok !== undefined && G.top() === G.field, id + ' introduced');
    }
    const again = await g.ev(() => { let shown = false; const p0 = G.push; G.push = s => { if (s.constructor.name === 'PhraseModel') shown = true; return p0(s); }; const it = G.phrase.ready('f_donde', {}); const r = it.next(); G.push = p0; return { shown, done: r.done, val: r.value }; });
    check('intro: each pattern is introduced once (its comic strip), then never again: ready at once', models.n === 3 && !again.shown && again.done && again.val === true, JSON.stringify(again));
    check('intro: all six met now, each with its introduction saved', await g.ev(() => G.phrase.ids().every(id => G.phrase.met(id) && G.phrase.state().intro[id])));
    // a pattern said only as its key word 3 times is modelled again before its next request
    await g.ev(() => { const W = G.words; for (let i = 0; i < 3; i++) W.answerWrong('f_tengo'); });
    check('intro: three key-word-only answers: Tengo is slipping', await g.ev(() => G.words.needsReintro('f_tengo')));
    await g.ev(() => { window.__ok = undefined; G.chapters.scene(G.field, (function* () { window.__ok = yield* G.phrase.ready('f_tengo', { who: 'mama' }); })()); });
    await g.until(() => G.top().constructor.name === 'PhraseModel', null, 'Tengo modelled again');
    check('intro: ...so it is modelled again (no "¡Ahora tú!" row: the request follows)', await g.ev(() => G.top().n === 2));
    await g.drive(() => window.__ok !== undefined && G.top() === G.field, 'modelled again');
    check('intro: ...once (not slipping-and-new any more)', await g.ev(() => !G.words.needsReintro('f_tengo')));

    // ---- the dog's warm-up brings a phrase that's due ----
    await g.ev(() => { const r = G.words.rec('f_quiero'); Object.assign(r, { due: null, dd: 0, dc: 0, fu: 0, box: 2 }); });
    check('warmup: a phrase that\'s due is among the warm-up\'s cards, last', await g.ev(() => { const L = G.warmup.pick(G.field); return L[L.length - 1] === 'f_quiero' && G.phrase.due().includes('f_quiero'); }));
    await g.ev(() => { G.warmup.start(G.field, ['perro', 'f_quiero']); });
    await g.drive(() => G.top().constructor.name === 'PhraseAsk', 'the warm-up\'s first card');
    await askUp(g);
    await g.frames(10); await still(g, 'warmup_phrase');
    const wq = await g.ev(() => { const s = G.top(); return { who: s.o.who, prompt: s.prompt, slots: s.slots.map(x => x.word), skip: s.o.cancelIcon === 'skip' }; });
    check('warmup: the dog asks "¿Qué quieres?" with three of her words; the skip button is there', wq.who === 'canelo' && wq.prompt === '¿Qué quieres?' && wq.slots.length === 3 && wq.skip, JSON.stringify(wq));
    await say(g, 'quiero ' + wq.slots[1]);
    await g.until(() => !G.warmup.cur(), null, 'the warm-up to end', 30000).catch(() => {});
    await g.drive(() => !G.warmup.cur() && G.top() === G.field, 'the warm-up\'s end');
    check('warmup: said whole: right on the first try (the dog\'s card for it), the phrase said', await g.ev(() => G.hist.state().wu.last && G.hist.state().wu.last.right === 2 && G.words.rec('f_quiero').said === 2));
    check('cards: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  In the world: a real placement per pattern
// =====================================================================
async function world(browser) {
  const { ctx, g } = await openWith(browser, 'phr-world', true);
  try {
    // speak instead of building when a request comes up during a drive (g.sayNext), else drive() builds it from its cards
    g.beforeAct = async s => {
      if (s.name === 'PhraseAsk' && !s.invite && s.t > 12 && !s.closing && g.sayNext) { const t = g.sayNext; g.sayNext = null; await g.until(() => G.input.ready(), null, 'taps'); await say(g, t); return true; }
      return false;
    };
    const drv = (cond, what) => g.drive(cond, what);
    const FREE = 'G.top() === G.field && !G.field.locked && G.fade.a === 0'; // (drive's condition runs in the page)
    const free = (also = 'true') => new Function('return (' + FREE + ') && (' + also + ');');
    async function talk(id) {
      await g.ev(id => { const f = G.field, n = f.npc(id), p = f.player; n.wander = 0; n.home = [n.x, n.y]; for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) if (!f.blocked(n.x + dx, n.y + dy, p)) { p.x = n.x + dx; p.y = n.y + dy; break; } f.snapCam(); }, id);
      await g.frames(4);
      await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
    }
    const greeted = (g2, ids) => g2.ev(ids => { for (const id of ids) { G.hearts.mark(id, 'greet'); G.phrase.state().named[id] = 0; } }, ids);
    await game(g, { words: WORDS.concat(['queso', 'rana']), done: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'], visit: ['playa'] });
    await g.fieldIdle('villa');

    // ---- Quiero: Marta's bakery (the pattern introduced right there, then asked for) ----
    await g.ev(() => G.goto('panaderia', 5, 5, 'up'));
    await g.fieldIdle('panaderia');
    await greeted(g, ['marta']);
    await talk('marta');
    await drv(() => G.top().constructor.name === 'PhraseModel', 'Marta: ¿Qué quieres? and Quiero\'s introduction');
    check('world: Marta\'s shop introduces Quiero (her bread and cookies modelled by Lola and Nico)', await g.ev(() => G.top().id === 'f_quiero' && G.top().models.every(m => m.to === 'marta')));
    g.sayNext = 'quiero pan';
    await drv(free("G.errands.bag.has('pan')"), 'asking for bread');
    check('world: "Quiero pan": the bread comes (in her hands), the phrase said', await g.ev(() => G.errands.bag.has('pan', { q: null }) && G.words.rec('f_quiero').said === 1));
    await g.ev(() => { G.errands.bag.take('pan', { q: null }); });

    // ---- ___, por favor: Don Pepe's market (introduced once Quiero is known) ----
    await g.ev(() => { G.phrase.state().last = -1e6; G.goto('villa', 22, 13, 'down'); });
    await g.fieldIdle('villa');
    await greeted(g, ['pepe']);
    await talk('pepe');
    await drv(() => G.top().constructor.name === 'PhraseModel', 'Pepe: por favor\'s introduction');
    check('world: Don Pepe\'s market (Quiero known) introduces "___, por favor"', await g.ev(() => G.top().id === 'f_porfavor'));
    g.sayNext = 'una manzana por favor';
    await drv(free("G.errands.bag.has('manzana')"), 'asking nicely');
    check('world: "Una manzana, por favor": the apple comes, the "por favor" phrase said', await g.ev(() => G.errands.bag.has('manzana', { q: null }) && G.words.rec('f_porfavor').said === 1));

    // ---- Tengo: a present for Abuela Rosa (who loves flowers) ----
    await g.ev(() => { G.phrase.state().last = -1e6; G.errands.bag.take('manzana', { q: null }); G.errands.bag.add('flor', { col: 'rosa' }); });
    await greeted(g, ['rosa']);
    const hr = await g.ev(() => G.hearts.get('rosa'));
    await talk('rosa');
    await drv(() => G.top().constructor.name === 'PhraseAsk', 'Rosa: ¿Qué tienes?');
    await askUp(g);
    await g.frames(6); await still(g, 'world_tengo');
    check('world: Rosa sees the flower: "¿Qué tienes?" (Tengo, its introduction first); the flower among three cards', await g.ev(() => { const s = G.top(); return s.id === 'f_tengo' && s.slots.some(x => x.word === 'flor') && s.slots.length === 3 && s.slots[s.answer].word === 'flor'; }));
    g.sayNext = null; await say(g, 'tengo una flor');
    await drv(free(), 'the present');
    check('world: "Tengo una flor": she takes it, a heart', await g.ev(hr => !G.errands.bag.has('flor') && G.hearts.get('rosa') === hr + 1, hr));

    // ---- ¿Dónde está?: Nico's hint in hide-and-seek ----
    await g.ev(() => { G.phrase.state().last = -1e6; });
    await greeted(g, ['nico']);
    await talk('nico');
    await drv(free(), 'Nico starts hide-and-seek');
    check('world: Nico\'s hide-and-seek is on', await g.ev(() => G.seek.active()));
    await talk('nico');
    await drv(() => G.top().constructor.name === 'PhraseAsk', 'asking Nico');
    await askUp(g);
    const kinds = await g.ev(() => G.top().slots.map(x => x.word));
    await g.frames(6); await still(g, 'world_donde');
    check('world: asking Nico again: "¿Dónde está...?" with the animals still hiding as its cards', await g.ev(k => G.top().id === 'f_donde' && k.every(w => G.seek.hiding(w)), kinds) && kinds.length >= 2);
    await say(g, 'dónde está el ' + kinds[0]);
    await drv(() => G.top().constructor.name === 'TextBox' && G.top().opts.show && !!G.top().opts.show.icon, 'Nico\'s hint');
    await g.frames(10); await still(g, 'world_donde_hint');
    check('world: "¿Dónde está el ...?": Nico holds up the picture of where that one hides', await g.ev(k => { const L = G.seek.list().filter(h => h.kind === k), sp = L.length && G.seek.SPOTS.find(p => p.id === L[0].spot); return !!sp && G.top().opts.show.icon === sp.place; }, kinds[0]));
    await drv(free(), 'the hint');

    // ---- Me llamo: a town friend's next greeting (Lucía) ----
    await g.ev(() => { G.phrase.state().last = -1e6; });
    await talk('lucia');
    await drv(() => G.top().constructor.name === 'PhraseAsk' && G.top().id === 'f_llamo', 'Lucía\'s greeting, then her name');
    await askUp(g);
    check('world: after Lucía\'s greeting: "¡Hola! Me llamo Lucía. ¿Y tú?" (Me llamo introduced first)', await g.ev(() => G.hearts.did('lucia', 'greet') && /Me llamo Lucía/.test(G.top().prompt) && G.phrase.state().intro.f_llamo));
    await say(g, 'me llamo luz');
    await drv(free(), 'the name exchange');
    check('world: ...they know each other now; no due word that day (one question with them)', await g.ev(() => G.phrase.named('lucia') && G.words.rec('f_llamo').said === 1));

    // ---- Lola (the beach): her first hello, Me llamo; then her favourite-animal question, Me gusta ----
    await g.ev(() => G.goto('playa', 10, 3, 'down'));
    await g.fieldIdle('playa');
    await talk('lola');
    await drv(() => G.top().constructor.name === 'PhraseAsk', 'Lola\'s first hello');
    await askUp(g);
    check('world: meeting Lola: "¡Hola! Me llamo Lola. ¿Y tú?"', await g.ev(() => /Me llamo Lola/.test(G.top().prompt)));
    g.sayNext = null; await say(g, 'luz');
    await drv(() => G.phrase.cur() && G.phrase.cur().invite != null, 'the key word, then the invitation');
    await askUp(g, true);
    await g.frames(10); await still(g, 'world_llamo_invite');
    check('world: her name alone: Lola says hello anyway, then the invitation shows "Me llamo Luz"', await g.ev(() => window.__said.includes('¡Hola, Luz! ¡Mucho gusto!') && G.top().slots[G.top().invite].name));
    await say(g, 'me llamo luz');
    await drv(free(), 'Lola\'s hello');
    check('world: ...said whole on the second try; Lola goes on with her hello (no "¡Soy Lola!" again)', await g.ev(() => G.phrase.named('lola') && G.zones.lolaTalked('playa') && !window.__said.some(s => /Soy Lola/.test(s))));
    await g.ev(() => { G.phrase.state().last = -1e6; for (const a of ['gato', 'perro', 'conejo', 'pato', 'oso', 'rana']) G.state.album[a] = G.state.album[a] || { first: 1, map: 'villa', n: 1 }; });
    check('world: once her hello is done, Lola\'s bubble has a heart: her question', await g.ev(() => JSON.stringify(G.field.npc('lola').alert()) === JSON.stringify(G.phrase.favBubble())));
    await talk('lola');
    g.sayNext = 'me gusta el oso';
    await drv(free('!!G.phrase.fav()'), 'Lola\'s question');
    check('world: "¿Qué animal te gusta?" "Me gusta el oso": pinned (her favourite: el oso)', await g.ev(() => G.phrase.fav().id === 'oso' && G.words.met('f_gusta')));
    await g.ev(() => { G.album('amigos'); });
    await g.until(() => G.top().constructor.name === 'Album' && G.input.ready(), null, 'the Amigos page');
    await g.ev(() => { G.top().ftab = 'playa'; });
    await g.frames(10); await still(g, 'album_amigos_fav');
    await g.ev(() => { const s = G.top(); s.page = 'animales'; s.zone = 'bosque'; });
    await g.frames(10); await still(g, 'album_fav_heart');
    await g.ev(() => { G.top().close ? G.top().close() : (G.pop(), 0); });
    await g.ev(() => { if (G.top().constructor.name === 'Album') { G.pop(); } });
    await g.fieldIdle('playa');

    // ---- Quiero in a zone: Doña Nieves's ice cream for whoever is hot ----
    await g.ev(() => { for (const q of ['playa1', 'playa2']) G.state.quests[q] = 'done'; G.errands.bag.list().length = 0; });
    await greeted(g, ['nieves']);
    await talk('nieves');
    await drv(() => G.top().constructor.name === 'PhraseAsk', 'Doña Nieves');
    g.sayNext = null; await askUp(g); await say(g, 'quiero un helado');
    await drv(free(), 'the ice cream');
    check('world: Doña Nieves: "Quiero un helado": the ice cream comes (for whoever is hot)', await g.ev(() => G.errands.bag.has('helado')));

    // ---- phrases off (the grown-ups' tests, older behaviour): the shop asks as before ----
    await g.ev(() => { window.__phrasesOff = true; G.goto('panaderia', 5, 5, 'up'); });
    await g.fieldIdle('panaderia');
    await talk('marta');
    await drv(() => G.top().constructor.name === 'Choice', 'the old shop');
    check('world: phrases off: the shop is the old picture question (with "no")', await g.ev(() => G.top().ch.some(c => c.word === 'no')));
    await drv(free(), 'the old shop');
    check('world: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const SECTIONS = [['node: matchPhrase', node], ['the request (iPad, a fake recognizer)', ask], ['cards, the notebook, the grown-ups, one at a time, the warm-up', cards], ['in the world: a placement per pattern', world]];
// ONLY=world (a word of a section's name) runs just that section while working on it
run('Phrases: say it to get it', process.env.ONLY ? SECTIONS.filter(([n]) => n.includes(process.env.ONLY)) : SECTIONS);
