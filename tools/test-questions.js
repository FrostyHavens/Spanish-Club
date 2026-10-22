// How the game asks about words (docs/AUDIT_2026-10.md, Sprint 2: 2.6 say it first, 2.7 no give-aways, 2.11 the right
// question for each kind of word; issues H1, M3, M4), with a FAKE SpeechRecognition (as in tools/test-speaking.js):
//   sayfirst  a review question for a known word (stage 2+) starts, one in three, with only its picture and the big mic:
//             heard right -> a celebration and answerRight {mode: 'say', recall: true, said: true}; another word, an
//             error, silence, a tap elsewhere or ~4 s -> the cards appear: no wrong sound, no miss; the recognizer only
//             starts inside a tap; a word said-first today isn't asked that way again; quiet mode (the grown-ups' row) and
//             the mic off: never
//   warmup    the dog's warm-up: a known word's say step now and then (then heard, picture-only cards: a tap moves it
//             on), a remembered word's every other card (word-only cards if not said), the others heard -> picture-only
//             (recall from memory for a child who doesn't speak); picture-only for a word only met
//   cards     the first review is picture-only (and every review below stage 3); word-only cards only at stage 3+,
//             never two alike (abuela / abuelo, gato / pato); one text size and one colour across a question's cards
//   puzzle    a page puzzle's last pair joins by itself (answerRight {forced: true}), never asked
//   forms     every word gets the question for its kind (¿Qué hace? ¿De qué color es? ¿Cómo está? ¿Cuántas hay? ¿Qué
//             dice? ¿Quién es? ¿Qué es?...), checked against content/es/words.js; ¿Cuántos? / ¿Cuántas? from the
//             counted thing for every number and every countable thing; never "¿Qué es?" for a word that isn't a thing
//   album     "¿Quién es?": a found animal's silhouette and the mic, then the reveal, never failing
//   NODE_PATH=$(npm root -g) node tools/test-questions.js [screenshot dir]     (ONLY=sayfirst|warmup|cards|puzzle|forms|album)
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { run, open, check, ROOT } = require('./harness');

// ---------- the words, straight from content/es/words.js (the test's own truth, not the game's helpers) ----------
const vctx = { console }; vctx.window = vctx; vctx.G = { content: {} }; vctx.window.G = vctx.G; vm.createContext(vctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'content', 'es', 'words.js'), 'utf8'), vctx, { filename: 'content/es/words.js' });
const C = vctx.G.content.es, WORDS = Object.keys(C.words);
const art = id => (/^(el|la|los|las) /.exec(C.words[id].es.split(' / ')[0]) || [])[1] || null;
const STRESSED_A = ['agua', 'aguila'];
const fem = id => art(id) === 'la' || art(id) === 'las' || STRESSED_A.includes(id);
const ANIMALS = ['animales', 'granja', 'mar', 'fauna', 'bichos', 'rancho', 'faunamontana'];
const OWN = { ven: '¿Qué le dices?', sientate: '¿Qué le dices?', pata: '¿Qué le dices?', nadar: '¿Qué le gusta hacer?', rapido: '¿Cómo va?', despacio: '¿Cómo va?', grande: '¿Cómo es?', pequeno: '¿Cómo es?', caliente: '¿Cómo está?', frio: '¿Qué tiempo hace?', familia: '¿Quiénes son?' }; // (caliente: about a hot thing held up, el chocolate, never a person: S2 review #8)
// the question a native speaker would ask about this word's picture
function expected(id) {
  const w = C.words[id], t = w.topic, a = art(id);
  if (OWN[id]) return OWN[id];
  if (t === 'numeros') return 'number';
  if (t === 'colores') return '¿De qué color es?';
  if (t === 'sentir') return '¿Cómo está?';
  if (t === 'saludos' || t === 'sonidos') return '¿Qué dice?';
  if (!a) return '¿Qué hace?';
  if (t === 'familia' || ANIMALS.includes(t)) return '¿Quién es?';
  return a === 'los' || a === 'las' ? '¿Qué son?' : '¿Qué es?';
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim().replace(/^(el|la|los|las) /, '');
const lev = (a, b) => { let p = Array.from({ length: b.length + 1 }, (v, j) => j); for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[b.length]; };
const nearSame = (a, b) => { const x = norm(C.words[a].es.split(' / ')[0]), y = norm(C.words[b].es.split(' / ')[0]); let k = 0; while (k < x.length && x[k] === y[k]) k++; return lev(x, y) <= 2 || k >= 4; };

// ---------- a fake recognizer: each start() takes the next reply from window.__sr.queue ----------
//   {results: [[transcript, confidence], ...], delay, error}; every start is logged with the input event it ran in
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [], calls: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.calls.push('start'); sr.starts.push({ during: window.event ? window.event.type : 'frame', lang: this.lang });
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(([transcript, confidence]) => ({ transcript, confidence })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 300);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { sr.calls.push('stop'); setTimeout(() => this.end(), 50); }
    abort() { sr.calls.push('abort'); setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openWith(browser, name, o) {
  const { ctx, g } = await open(browser, name, true, o);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// a game on the map: the dog is yours, the ghost hands seen; o.st {id: stage} met before today's session (due now);
// every sound effect in window.__sfx, every answerRight / answerWrong in window.__ar / window.__aw
async function game(g, o = {}) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz'; G.state.dogName = 'Bruno';
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
    for (const id of ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
    const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
    for (const id in o.st || {}) { if (G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'test'); const s = o.st[id]; Object.assign(W.rec(id), { st: s, box: Math.max(1, s), fu: 0, n: 2, due: null, dd: W.day(), dc: W.dayNum(), ms: W.sess() - 1, learned: s >= 3, gold: s >= 3 }); }
    G.cards.grow = grow; G.demo.skip(); G.sayFirst.reset();
    window.__sfx = []; const sfx = G.audio.sfx; G.audio.sfx = n => { window.__sfx.push(n); sfx(n); };
    window.__ar = []; const ar = G.words.answerRight; G.words.answerRight = function (id, a) { window.__ar.push({ id, o: Object.assign({}, a) }); return ar.call(this, id, a); };
    window.__aw = []; const aw = G.words.answerWrong; G.words.answerWrong = function (id, a) { window.__aw.push(id); return aw.call(this, id, a); };
    G.goto('villa', 22, 13, 'down');
  }, o);
  await g.fieldIdle('villa');
}
// run a review question for id (or any generator source) as a task on the map; window.__r gets its result
const ask = (g, id, o) => g.ev(([id, o]) => { window.__r = undefined; G.field.tasks.add((function* () { window.__r = yield* G.review.ask(id, o || { who: 'nico' }); })()); }, [id, o || null]);
const choiceUp = g => g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10 && G.input.ready(), null, 'the question');
const answered = g => g.drive(() => window.__r !== undefined && G.top() === G.field && !G.field.locked, 'the question');
const heard = (g, n) => g.ev(n => window.__sfx.includes(n), n);
// wait for cond (page side), tapping through a gold word card ("¡Palabra de oro!") when one comes up
async function past(g, cond, what, timeout = 15000) {
  const t0 = Date.now();
  while (!(await g.ev(cond))) {
    if (Date.now() - t0 > timeout) throw new Error('timed out waiting for ' + what + ' (top scene: ' + await g.scene() + ')');
    if (await g.ev(() => G.top().constructor.name === 'WordCard' && G.top().t > 22 && G.input.ready())) await g.tap(150, 200); else await g.frames(4);
  }
}
async function still(g, label) { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); }
// script the recognizer, tap the mic; -> how the recognizer was started
async function speak(g, reply) {
  await g.ev(r => window.__sr.queue.push(r), reply);
  const n = await g.ev(() => window.__sr.starts.length);
  await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
  await g.until(n => window.__sr.starts.length > n, n, 'the recognizer to start');
  return g.ev(() => window.__sr.starts[window.__sr.starts.length - 1]);
}
const KNOWN = { gato: 2, perro: 2, casa: 2, manzana: 2, pelota: 2, pan: 2, flor: 2, arbol: 2, oso: 2, vaca: 2, leche: 2, queso: 2, concha: 1, hola: 1, rojo: 3, azul: 3, verde: 3, tres: 3, corre: 3 };

// =====================================================================
async function sayfirst(browser) {
  const { ctx, g } = await openWith(browser, 'q-say');
  try {
    await game(g, { st: KNOWN });
    // ---- how often: one in three review questions about a known word (stage 2+); never for a word only met ----
    const seq = [];
    for (const id of ['gato', 'perro', 'concha', 'casa', 'manzana', 'pelota', 'hola', 'pan', 'flor', 'arbol']) {
      await ask(g, id); await choiceUp(g);
      seq.push(id + (await g.ev(() => !!G.top().say) ? '+' : ''));
      await answered(g);
    }
    check('sayfirst: one in three review questions of a known word starts with "say it first" (its 3rd and 6th); a word only met never', seq.join() === 'gato,perro,concha,casa+,manzana,pelota,hola,pan+,flor,arbol', seq.join());
    check('sayfirst: skipped by a tap, then answered by a tap: no miss recorded', await g.ev(() => !window.__aw.length));
    // a word said-first today isn't asked that way again; the next one is
    await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; });
    await ask(g, 'casa'); await choiceUp(g);
    check('sayfirst: a word already asked this way today: straight to the cards', await g.ev(() => !G.top().say));
    await answered(g);
    await ask(g, 'oso'); await choiceUp(g);
    check('sayfirst: ...and the count waits for the next word', await g.ev(() => !!G.top().say));
    await answered(g);

    // ---- never right after the word was said or shown (S2 review #6): an echo, not a recall ----
    await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; G.say([{ t: '¡Mira! ¡Una [vaca]!', en: 'Look!' }], { show: 'vaca' }); });
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the line');
    await ask(g, 'vaca'); await choiceUp(g);
    check('sayfirst: a word a line just said and showed: no say step (straight to the cards), the count isn\'t used', await g.ev(() => !G.top().say && !G.top().o.sayFirst && G.sayFirst.n === G.sayFirst.EVERY - 1));
    await answered(g);
    check('sayfirst: ...and the pick is a plain pick (fresh: no recall from memory)', await g.ev(() => { const a = window.__ar.find(a => a.id === 'vaca'); return !!a && a.o.fresh === true && !a.o.recall; }));
    // ---- the say step: its picture and the big mic alone, the question for its kind of word, no cards ----
    await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; G.words.addTime(G.words.EXPOSE); window.__sfx.length = 0; window.__ar.length = 0; }); // (a minute later: the words asked above aren't fresh any more)
    await ask(g, 'gato'); await choiceUp(g);
    const s1 = await g.ev(() => { const s = G.top(), m = s.micRect(); return { say: !!s.say, show: s.o.show, prompt: s.o.prompt, mic: m, nearPic: m.x > G.W / 2 && m.y < 70, shown: !!s.mic && s.mic.shown(), sayEn: s.o.sayEn }; });
    check('sayfirst: the picture held up, "¿Quién es?" (an animal), the big mic beside the picture, no cards yet', s1.say && s1.show === 'gato' && s1.prompt === '¿Quién es?' && s1.nearPic && s1.mic.w >= 44 && s1.shown && /Say it/.test(s1.sayEn), JSON.stringify(s1));
    await g.frames(20); await still(g, 'sayfirst_step');
    // heard right: a celebration, answered, a recall said aloud
    const st1 = await speak(g, { results: [['el gato', 0.9]], delay: 400 });
    check('sayfirst: the recognizer starts inside the tap itself (touchend), es-MX', st1.during === 'touchend' && st1.lang === 'es-MX', JSON.stringify(st1));
    await g.until(() => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'the said answer');
    check('sayfirst: said right: answered with a party (chime, a speaking star, confetti), no card was shown', await g.ev(() => { const s = G.top(); return s.constructor.name === 'Choice' && s.said1 && s.won.said1; }) && await heard(g, 'chime') && await heard(g, 'micstar'));
    await g.frames(10); await still(g, 'sayfirst_said');
    await answered(g);
    const a1 = await g.ev(() => Object.assign({ r: window.__r }, window.__ar.find(a => a.id === 'gato')));
    check('sayfirst: ...recorded as answerRight(id, {mode: "say", recall: true, said: true}), first try', !!a1.o && a1.o.mode === 'say' && a1.o.recall === true && a1.o.said === true && a1.o.firstTry !== false && a1.r === true, JSON.stringify(a1));
    check('sayfirst: ...a speaking star (the word said once more)', await g.ev(() => G.st.saidCount('gato') === 1));

    // ---- heard something else, an error, silence: the cards appear, no "wrong", no sad sound, no miss ----
    for (const [label, reply, id] of [['another word', { results: [['la casa', 0.9]] }, 'perro'], ['an error', { error: 'network' }, 'manzana'], ['silence', { error: 'no-speech' }, 'pelota']]) {
      await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; G.words.addTime(G.words.EXPOSE); window.__sfx.length = 0; window.__ar.length = 0; window.__aw.length = 0; });
      await ask(g, id); await choiceUp(g);
      const w0 = await g.ev(id => G.words.rec(id).wrong, id);
      await speak(g, reply);
      await g.until(() => !G.top().say, null, 'the cards');
      const r = await g.ev(([id, w0]) => ({ why: G.top().revealed, won: !!G.top().won, off: G.top().ch.some(c => c.off), wrong: G.words.rec(id).wrong - w0, aw: window.__aw.length, sfx: window.__sfx.slice() }), [id, w0]);
      check('sayfirst: ' + label + ' -> the cards simply appear: no "wrong", no sad sound, no miss', !r.won && !r.off && !r.wrong && !r.aw && !r.sfx.some(n => ['boop', 'huh', 'error'].includes(n)) && ['heard', 'nohear'].includes(r.why), JSON.stringify(r));
      if (label === 'silence') { await g.frames(8); await still(g, 'sayfirst_cards'); }
      await g.until(() => G.top().mic && !G.top().mic.listening() && !G.speech.listening(), null, 'the mic to finish');
      await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
      await answered(g);
      const a = await g.ev(id => window.__ar.find(a => a.id === id), id);
      check('sayfirst: ' + label + ' -> ...then a tap answers it as today (first try, not a say)', !!a && a.o.mode !== 'say' && !a.o.said && a.o.firstTry === true, JSON.stringify(a));
    }

    // ---- no tap on the mic: the cards come by themselves after about 4 s, and the recognizer never started ----
    await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; G.words.addTime(G.words.EXPOSE); });
    const n0 = await g.ev(() => window.__sr.starts.length);
    await ask(g, 'flor'); await choiceUp(g);
    const f0 = await g.ev(() => G.frame);
    await g.until(() => !G.top().say, null, 'the cards by themselves', 15000);
    const t = await g.ev(f0 => ({ why: G.top().revealed, frames: G.frame - f0, starts: window.__sr.starts.length }), f0);
    check('sayfirst: no tap on the mic: the cards appear by themselves after about 4 s', t.why === 'time' && t.frames >= 200 && t.frames <= 300, JSON.stringify(t));
    check('sayfirst: ...and the recognizer never started (it only starts inside a tap on the mic)', t.starts === n0 && await g.ev(() => window.__sr.starts.every(s => s.during === 'touchend')), JSON.stringify(t));
    await answered(g);
    // a tap anywhere else: at once
    await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; G.words.addTime(G.words.EXPOSE); });
    await ask(g, 'arbol'); await choiceUp(g);
    await g.tap(160, 118);
    check('sayfirst: a tap anywhere else shows the cards at once (and picks nothing)', await g.ev(() => !G.top().say && G.top().revealed === 'tap' && !G.top().won));
    await answered(g);

    // ---- quiet mode (the grown-ups' "Speaking prompts" row): never; the other mic buttons stay ----
    await g.ev(() => { G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps' && G.input.ready(), null, 'the grown-ups menu');
    const row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'prompts'); return { k, r: s.rows()[k], rect: s.rowRect(k), last: s.rowRect(s.rows().length - 1) }; });
    check('quiet: the grown-ups menu has "Speaking prompts: on", every row on screen', row.k >= 0 && row.r.right === 'on' && !row.r.off && row.last.y + row.last.h <= 206, JSON.stringify(row));
    await g.tapRect(row.rect);
    check('quiet: a tap turns it to "quiet" (kept per device)', await g.ev(() => G.prefs.sayFirst === false && G.top().rows().find(r => r.id === 'prompts').right === 'quiet' && JSON.parse(localStorage.getItem('spanishclub_prefs')).sayFirst === false));
    await g.frames(4); await still(g, 'quiet_row');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    const quiet = [];
    for (const id of ['vaca', 'leche', 'queso', 'perro']) { await g.ev(() => { G.sayFirst.n = G.sayFirst.EVERY - 1; }); await ask(g, id); await choiceUp(g); quiet.push(await g.ev(() => !!G.top().say || !!G.top().o.sayFirst)); await answered(g); }
    check('quiet: no "say it first" in review questions', quiet.every(x => !x), quiet.join());
    check('quiet: ...nor in the warm-up\'s form', await g.ev(() => !G.sayFirst.want('perro', { always: true }) && !G.sayFirst.on()));
    await ask(g, 'rojo'); await choiceUp(g);
    check('quiet: ...and the question\'s own mic stays', await g.ev(() => !!G.top().mic && G.top().mic.shown()));
    await answered(g);
    await g.ev(() => { G.audio.setPref('sayFirst', true); G.audio.setPref('mic', false); });
    check('mic off: no "say it first" either, and the prompts row is greyed', await g.ev(() => !G.sayFirst.on() && !G.sayFirst.want('perro', { always: true })));
    await g.ev(() => { G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps', null, 'the grown-ups menu');
    check('mic off: ...the row says so', await g.ev(() => { const r = G.top().rows().find(r => r.id === 'prompts'); return r.off && r.right === 'mic off'; }));
    await g.ev(() => { G.pop(); G.audio.setPref('mic', true); });
    check('sayfirst: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
async function warmup(browser) {
  const { ctx, g } = await openWith(browser, 'q-warmup');
  try {
    await game(g, { st: KNOWN });
    // oso and rojo remembered (from their picture this time: asked an even number of times), verde remembered (heard
    // this time: asked an odd number of times)
    await g.ev(() => { const W = G.words; Object.assign(W.rec('oso'), { st: 3, ret: 2, wrong: 0, learned: true, gold: true }); Object.assign(W.rec('rojo'), { ret: 2, wrong: 0 }); Object.assign(W.rec('verde'), { ret: 2, wrong: 1 }); G.sayFirst.n = G.sayFirst.EVERY - 1; });
    await g.ev(() => { G.warmup.start(G.field, ['casa', 'concha', 'oso', 'rojo', 'verde']); });
    // casa (known): say it first now and then (here: its turn, 1 in 3 as in any review)
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.top().t > 10 && G.input.ready(), null, 'the first card');
    const q1 = await g.ev(() => { const s = G.top(); return { say: !!s.say, big: s.big(), show: s.o.show, prompt: s.o.prompt, skip: s.skip() }; });
    check('warmup: a known word, its turn: "say it first", its picture, "¿Qué es?" (a thing), the big mic, the skip button', q1.say && q1.big && q1.show === 'casa' && q1.prompt === '¿Qué es?' && q1.skip, JSON.stringify(q1));
    await still(g, 'warmup_say');
    await g.tap(160, 118);
    await g.until(() => !G.top().say, null, 'the cards');
    const c1 = await g.ev(() => { const s = G.top(); return { v: s.ch.map((c, k) => (s.view(k).icon ? 'P' : '') + (s.view(k).label ? 'W' : '')).join(), show: s.o.show || null, mask: (s.o.mask || []).includes('casa'), big: s.big() }; });
    check('warmup: ...not said: the picture is put away, she hears it and picks its picture (picture-only cards: S2 review #1/#16)', c1.v === 'P,P,P' && !c1.show && c1.mask && !c1.big, JSON.stringify(c1));
    await g.frames(8); await still(g, 'warmup_say_heard');
    const b0 = await g.ev(() => G.words.rec('casa').box);
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => window.__ar.some(a => a.id === 'casa'), null, 'casa answered');
    const ca = await g.ev(b0 => { const a = window.__ar.find(a => a.id === 'casa'), r = G.words.rec('casa'); return { cued: !!a.o.cued, recall: !!a.o.recall, mode: a.o.mode, up: r.box > b0, due: G.words.due('casa') }; }, b0);
    check('warmup: ...that tap moves the word on (uncued: up a box, not due any more), a plain pick (its picture was just held up: no recall)', !ca.cued && !ca.recall && ca.mode === 'pic' && ca.up && !ca.due, JSON.stringify(ca));
    // concha (only met): heard, picture-only cards, no say step
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.warmup.cur().i === 1 && G.top().t > 10 && G.input.ready(), null, 'the second card', 15000);
    const q2 = await g.ev(() => { const s = G.top(); return { say: !!s.say, show: s.o.show || null, mask: s.o.mask, pics: s.ch.every((c, k) => !!s.view(k).icon && !s.view(k).label) }; });
    check('warmup: a word only met: heard (a speaker), picture-only cards, no say step', !q2.say && !q2.show && q2.mask && q2.mask.includes('concha') && q2.pics, JSON.stringify(q2));
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    // oso (remembered, from its picture this time): said first
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.warmup.cur().i === 2 && G.top().t > 10 && G.input.ready(), null, 'the third card', 15000);
    check('warmup: a remembered word from its picture: "say it first" (every such card here), "¿Quién es?" for an animal', await g.ev(() => !!G.top().say && G.top().o.prompt === '¿Quién es?'));
    await speak(g, { results: [['oso', 0.8]] });
    await g.until(() => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'oso said');
    // rojo (remembered, from its picture): said nothing -> word-only cards (a recall), "¿De qué color es?"
    await past(g, () => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.warmup.cur().i === 3 && G.top().t > 10 && G.input.ready(), 'the fourth card', 30000);
    check('warmup: a colour: "¿De qué color es?"', await g.ev(() => !!G.top().say && G.top().o.prompt === '¿De qué color es?'));
    await g.tap(160, 118);
    await g.until(() => !G.top().say, null, 'the cards');
    check('warmup: ...a remembered word not said: word-only cards (recall)', await g.ev(() => { const s = G.top(); return s.ch.every((c, k) => !s.view(k).icon && !!s.view(k).label); }));
    await g.frames(8); await still(g, 'warmup_text');
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    // verde (remembered, heard this time): no say step, picture-only cards: a child who never speaks recalls it from
    // memory here too (the way to solid, S2 review #3)
    await past(g, () => G.top().constructor.name === 'Choice' && G.top().o.warmup && G.warmup.cur().i === 4 && G.top().t > 10 && G.input.ready(), 'the fifth card', 30000);
    const q5 = await g.ev(() => { const s = G.top(); return { say: !!s.say, show: s.o.show || null, mask: (s.o.mask || []).includes('verde'), pics: s.ch.every((c, k) => !!s.view(k).icon && !s.view(k).label) }; });
    check('warmup: a remembered word, every other card: heard, picture-only cards (no say step)', !q5.say && !q5.show && q5.mask && q5.pics, JSON.stringify(q5));
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.drive(() => !G.warmup.cur() && G.top() === G.field && !G.field.locked, 'the end of the warm-up');
    const r = await g.ev(() => ({ last: G.hist.state().wu.last, oso: window.__ar.find(a => a.id === 'oso'), rojo: window.__ar.find(a => a.id === 'rojo'), verde: window.__ar.find(a => a.id === 'verde') }));
    check('warmup: five right; oso said first (a recall said aloud), rojo picked from word-only cards, verde from picture-only cards (recall: true)', r.last && r.last.right === 5 && r.oso.o.mode === 'say' && r.oso.o.recall && r.rojo.o.mode === 'text' && !r.rojo.o.cued && r.verde.o.mode === 'pic' && r.verde.o.recall === true, JSON.stringify(r));
    check('warmup: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
async function cards(browser) {
  const { ctx, g } = await openWith(browser, 'q-cards');
  try {
    await game(g, { st: Object.assign({}, KNOWN, { abuela: 3, abuelo: 2, bebe: 2, pato: 2, gallo: 2, gallina: 2, mariposa: 2, no: 2, si: 2 }) });
    await g.ev(() => { G.audio.setPref('sayFirst', false); }); // (the cards themselves: "say it first" is above)
    // the first review of a word (stage 1): heard, picture-only cards
    await ask(g, 'concha'); await choiceUp(g);
    const c1 = await g.ev(() => { const s = G.top(); return { mask: (s.o.mask || []).includes('concha'), v: s.ch.map((c, k) => (s.view(k).icon ? 'P' : '') + (s.view(k).label ? 'W' : '')).join() }; });
    check('cards: the first review of a word: heard (a speaker), picture-only cards (no written word to match the sound)', c1.mask && c1.v === 'P,P,P', JSON.stringify(c1));
    await g.frames(6); await still(g, 'cards_first_review');
    await answered(g);
    // below stage 3, never word-only cards (each form, several times)
    const low = [];
    for (let i = 0; i < 6; i++) for (const id of ['gato', 'pan', 'hola']) {
      await g.ev(([id, i]) => { G.words.rec(id).n = i; }, [id, i]);
      await ask(g, id); await choiceUp(g);
      low.push(await g.ev(() => { const s = G.top(); return s.ch.some((c, k) => !s.view(k).icon && !!s.view(k).label) ? s.ch[s.o.answer].word : ''; }));
      await answered(g);
    }
    check('cards: a word below stage 3 (met, known) never gets word-only cards', low.every(x => !x), low.join());
    // stage 3+: its picture -> word-only cards, never two alike (abuela / abuelo, gato / pato...)
    const hi = [];
    for (let i = 0; i < 10; i++) {
      await g.ev(() => { G.words.rec('abuela').n = 0; });
      await ask(g, 'abuela'); await choiceUp(g);
      hi.push(await g.ev(() => { const s = G.top(); return { text: s.ch.every((c, k) => !s.view(k).icon && !!s.view(k).label), words: s.ch.map(c => c.word), prompt: s.o.prompt }; }));
      if (i === 0) { await g.frames(6); await still(g, 'cards_word_only'); }
      await answered(g);
    }
    const bad = hi.filter(q => q.words.some((a, i) => q.words.some((b, j) => j > i && nearSame(a, b))));
    check('cards: a remembered word from its picture ("¿Quién es?"): word-only cards', hi.every(q => q.text && q.prompt === '¿Quién es?'), JSON.stringify(hi[0]));
    check('cards: ...never two near-identical words side by side (no abuelo or bebé look-alike: edit distance 2, a shared stem)', !bad.length && hi.every(q => !q.words.includes('abuelo')), JSON.stringify(bad.slice(0, 3)));
    // only look-alikes to choose from: no word-only cards then (heard, its picture)
    await g.ev(() => { G.words.rec('gato').st = 3; G.words.rec('gato').n = 0; });
    await ask(g, 'gato', { who: 'nico', pool: ['pato', 'gallo'] }); await choiceUp(g);
    check('cards: when only look-alikes are left (gato: pato, gallo), no word-only cards: heard -> its picture', await g.ev(() => { const s = G.top(); return s.ch.every((c, k) => !!s.view(k).icon && !s.view(k).label) && (s.o.mask || []).includes('gato'); }));
    await answered(g);
    // one text size and one colour across a question's cards
    const look = async (choices) => {
      await g.ev(ch => { window.__q = G.choose({ prompt: '¿Qué es?', display: 'text', answer: 0, onWrong() {}, layout: 'cards', choices: ch.map(w => ({ word: w })) }); }, choices);
      await choiceUp(g);
      const r = await g.ev(() => {
        const s = G.top(), labs = s.ch.map((c, k) => s.view(k).label), out = [], bt = G.bigText, tc = G.textC;
        G.bigText = function (ctx, t, x, y, sc, col) { if (labs.includes(t)) out.push({ t, big: true, col }); return bt.apply(this, arguments); };
        G.textC = function (ctx, t, x, y, col) { if (labs.includes(t)) out.push({ t, big: false, col }); return tc.apply(this, arguments); };
        try { s.draw(G.ctx); } finally { G.bigText = bt; G.textC = tc; }
        return out;
      });
      await g.ev(() => { G.pop(); window.__q.resolve(-1); });
      return r;
    };
    const mixed = await look(['no', 'mariposa', 'pan']), short = await look(['si', 'no', 'pan']), gold = await look(['rojo', 'gato', 'pan']);
    check('cards: a short word among long ones is drawn at the same size as them (no "no" twice as big)', mixed.length === 3 && mixed.every(x => !x.big), JSON.stringify(mixed));
    check('cards: ...all short: all big, together', short.length === 3 && short.every(x => x.big), JSON.stringify(short));
    check('cards: ...and one colour for every card until it is answered (a gold word among blue ones would point at it)', [mixed, short, gold].every(L => L.every(x => x.col === L[0].col)), JSON.stringify(gold));
    // caliente (its own picture a hot face): never asked about a person (S2 review #8/#20): its picture held up is the hot
    // chocolate ("¿Cómo está el chocolate?"), its card shows the hot chocolate too, and el chocolate is never a card beside it
    await g.ev(() => { const W = G.words; for (const id of ['caliente', 'chocolate', 'elsol', 'helado', 'mar']) { W.meet(id, 'test'); Object.assign(W.rec(id), { st: id === 'caliente' ? 3 : 2, fu: 0 }); } });
    const hot = [];
    for (let i = 0; i < 6; i++) {
      await g.ev(i => { G.words.rec('caliente').n = i; }, i);
      await ask(g, 'caliente'); await choiceUp(g);
      hot.push(await g.ev(() => { const s = G.top(), k = s.o.answer; return { show: s.o.show || null, prompt: s.o.prompt, words: s.ch.map(c => c.word), pic: s.view(k).icon ? s.view(k).icon.icon || s.view(k).icon : null, label: s.view(k).label }; }));
      await answered(g);
    }
    check('cards: caliente: its picture held up is the hot chocolate ("¿Cómo está el chocolate?"), never its face; heard: its card shows the hot chocolate', hot.every(q => (q.show ? q.show === 'chocolate' && /Cómo está el/.test(q.prompt) : q.pic === 'chocolate')) && hot.some(q => q.show) && hot.some(q => !q.show), JSON.stringify(hot));
    check('cards: ...and el chocolate is never one of its cards', hot.every(q => !q.words.includes('chocolate')), JSON.stringify(hot.map(q => q.words)));
    await g.ev(() => { G.audio.setPref('sayFirst', true); });
    check('cards: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
async function puzzle(browser) {
  const { ctx, g } = await openWith(browser, 'q-puzzle');
  try {
    await game(g, { st: { rojo: 2, azul: 2, verde: 2, amarillo: 2 } });
    await g.ev(() => { window.__p = G.pages.open('colores', ['rojo', 'azul', 'verde', 'amarillo']); window.__ar.length = 0; });
    await g.until(() => G.top().constructor.name === 'PagePuzzle' && G.top().t > 10 && G.input.ready(), null, 'the page puzzle');
    for (let n = 0; n < 3; n++) {
      const p = await g.ev(() => { const s = G.top(), k = s.pics.findIndex((p, k) => !s.match[k]); return { p: s.picRect(k), w: s.wordRect(s.words.indexOf(s.pics[k])) }; });
      await g.tapRect(p.p); await g.tapRect(p.w);
    }
    const m = await g.ev(() => ({ auto: !!G.top().auto, matched: Object.keys(G.top().match).length, calls: window.__ar.length }));
    check('puzzle: three pairs matched, one left: it isn\'t asked (nothing to choose): it joins by itself', m.auto && m.matched === 3 && m.calls === 3, JSON.stringify(m));
    await g.frames(10); await still(g, 'puzzle_last_pair');
    await g.until(() => G.top().constructor.name === 'PagePuzzle' && G.top().done > 0, null, 'the last pair to join', 5000);
    const r = await g.ev(() => ({ calls: window.__ar.map(a => [a.id, !!a.o.forced]), last: G.pages.lastForced, matched: Object.keys(G.top().match).length }));
    check('puzzle: ...with a sparkle; the model hears it as forced (answerRight {forced: true}), the three chosen ones not', r.matched === 4 && r.calls.length === 4 && r.calls.slice(0, 3).every(c => !c[1]) && r.calls[3][1] && r.calls[3][0] === r.last, JSON.stringify(r));
    await g.drive(() => G.top() === G.field, 'the puzzle\'s end');
    check('puzzle: the puzzle ends as before (a star)', await g.ev(() => window.__p.result === true));
    check('puzzle: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
async function forms(browser) {
  const { ctx, g } = await open(browser, 'q-forms', false);
  try {
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; });
    const all = await g.ev(W => W.map(id => { const f = G.qform.of(id, { thing: 'manzana' }); return { id, kind: f.kind, t: f.t, en: f.en, show: f.show, line: G.requests.LINES['q.ask'](id) }; }), WORDS);
    const wrong = all.filter(f => { const e = expected(f.id); return e === 'number' ? f.kind !== 'number' : f.t !== e; });
    check('forms: every word (' + all.length + ') gets the question for its kind (checked against content/es/words.js)', !wrong.length, wrong.slice(0, 6).map(f => f.id + ': ' + f.t + ' (want ' + expected(f.id) + ')').join(' | '));
    const kinds = {}; all.forEach(f => { kinds[f.t] = (kinds[f.t] || 0) + 1; });
    check('forms: ...¿Qué hace?, ¿De qué color es?, ¿Cómo está?, ¿Cuántas hay?, ¿Qué dice?, ¿Quién es?, ¿Qué es? all used (' + Object.keys(kinds).join(' ') + ')', ['¿Qué hace?', '¿De qué color es?', '¿Cómo está?', '¿Cuántas hay?', '¿Qué dice?', '¿Quién es?', '¿Qué es?', '¿Qué son?'].every(k => kinds[k]));
    const notThing = all.filter(f => !art(f.id) && f.t === '¿Qué es?');
    check('forms: never "¿Qué es?" for a word that isn\'t a thing (actions, colours, feelings, numbers, greetings: AUDIT M3)', !notThing.length, notThing.map(f => f.id).join());
    check('forms: every question has its English help line, and is the same as its registered template (G.requests.LINES q.ask)', all.every(f => f.en && /[a-z]/.test(f.en) && f.en !== f.t && (f.kind === 'number' || f.line === f.t)), JSON.stringify(all.find(f => !f.en || f.en === f.t)));
    check('forms: an action shows the one doing it (its own picture), a colour its colour, an animal itself', ['corre', 'rojo', 'oso'].every(id => all.find(f => f.id === id).show === id));
    // caliente (its own picture is a hot face): asked about a hot THING held up, never about a person (S2 review #8/#20)
    const cal0 = all.find(f => f.id === 'caliente');
    check('forms: caliente: "¿Cómo está?" over the mug of hot chocolate (never "¿Cómo es?" over its hot face)', cal0.t === '¿Cómo está?' && cal0.show === 'chocolate', JSON.stringify(cal0));
    check('forms: ...once el chocolate is met: "¿Cómo está el chocolate?"', await g.ev(() => { G.words.meet('chocolate', 't'); return G.qform.of('caliente').t === '¿Cómo está el [chocolate]?' && G.requests.LINES['q.ask']('caliente') === G.qform.of('caliente').t; }));
    // numbers: ¿Cuántos? / ¿Cuántas? from the counted thing, for every number and every countable thing
    const things = WORDS.filter(id => { const a = art(id); return (a === 'el' || a === 'la') && !(C.mass || []).includes(id); });
    const nums = await g.ev(([N, T]) => { const o = []; for (const n of N) for (const t of T) { const f = G.qform.of(n, { thing: t }); o.push({ n, t, q: f.t, count: f.show.count, icon: f.show.icon, want: G.requests.numOf(n) }); } return o; }, [C.numberWords10, things]);
    const nb = nums.filter(x => x.q !== '¿Cuánt' + (fem(x.t) ? 'as' : 'os') + ' hay?' || x.count !== x.want || x.icon !== C.words[x.t].icon);
    check('forms: numbers: "¿Cuántas hay?" for feminine things, "¿Cuántos hay?" for masculine ones (' + nums.length + ': every number x every countable thing), the right heap', !nb.length, nb.slice(0, 5).map(x => x.n + '/' + x.t + ': ' + x.q).join(' | '));
    check('forms: the counting templates are registered for tools/test-spanish.js (q.howmany, q.ask)', await g.ev(() => ['q.howmany', 'q.ask'].every(k => typeof G.requests.LINES[k] === 'function') && G.requests.LINES['q.howmany']('estrella') === '¿Cuántas hay?' && G.requests.LINES['q.howmany']('huevo') === '¿Cuántos hay?'));
    // with nothing countable met yet: stars ("¿Cuántas hay?"); uno counts something masculine (uno, not una)
    check('forms: nothing countable met yet: it counts stars ("¿Cuántas hay?")', await g.ev(() => { const f = G.qform.of('tres'); return f.thing === 'estrella' && f.t === '¿Cuántas hay?' && f.show.count === 3; }));
    check('forms: "uno" counts a masculine thing ("¿Cuántos hay?" - "uno")', await g.ev(() => { ['manzana', 'huevo', 'flor', 'pan'].forEach(id => G.words.meet(id, 't')); for (let i = 0; i < 20; i++) { const f = G.qform.of('uno'); if (f.t !== '¿Cuántos hay?') return false; } return true; }));
    check('forms: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
async function album(browser) {
  const { ctx, g } = await openWith(browser, 'q-album');
  try {
    await game(g, { st: { gato: 2, perro: 2, pato: 2 } });
    await g.ev(() => { ['gato', 'perro', 'pato'].forEach(id => G.animals.meet(id)); window.__speak.length = 0; });
    const openAlbum = async () => { await g.ev(() => { G.album('villa'); }); await g.until(() => G.top().constructor.name === 'Album' && G.top().t > 6 && G.input.ready(), null, 'the album'); };
    const cellOf = id => g.ev(id => G.top().cell(G.album.entries('villa').indexOf(id)), id);
    await openAlbum();
    await g.tapRect(await cellOf('gato'));
    const q = await g.ev(() => { const s = G.top(); return s.quien && { ph: s.quien.ph, id: s.quien.id, mic: s.mic && s.mic.shown() }; });
    check('album: tapping a found animal: "¿Quién es?", its silhouette and the big mic', !!q && q.ph === 'ask' && q.id === 'gato' && q.mic, JSON.stringify(q));
    await g.until(() => window.__speak.some(s => s.text === '¿Quién es?'), null, '"¿Quién es?" said', 3000);
    await g.frames(14); await still(g, 'album_quien');
    const said0 = await g.ev(() => G.st.saidCount('gato'));
    const st = await speak(g, { results: [['gato', 0.8]] });
    await g.until(() => G.top().quien && G.top().quien.ph === 'show', null, 'the reveal');
    check('album: said: the reveal with a party, the card\'s little mic, a speaking star (the mic started in the tap)', st.during === 'touchend' && await g.ev(s0 => G.top().quien.said && G.state.album.gato.said && G.st.saidCount('gato') === s0 + 1, said0) && !(await heard(g, 'huh')));
    await g.frames(16); await still(g, 'album_quien_said');
    await g.until(() => G.top().quien && G.top().quien.t > 26 && G.input.ready(), null, 'the reveal shown');
    await g.tap(160, 200);
    check('album: a tap closes it', await g.ev(() => !G.top().quien));
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(await cellOf('perro'));
    check('album: one per opening of the album: the next tap just says its name, as always', await g.ev(() => !G.top().quien) && await g.until(() => window.__speak.some(s => /perro/.test(s.text)), null, 'perro said', 3000).then(() => true));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    // silence: the reveal all the same, never a fail
    await openAlbum();
    await g.ev(() => { window.__sfx.length = 0; window.__speak.length = 0; });
    await g.tapRect(await cellOf('perro'));
    await g.until(() => G.top().quien && G.top().quien.t > 12, null, '"¿Quién es?" for the dog');
    await speak(g, { error: 'no-speech' });
    await g.until(() => G.top().quien && G.top().quien.ph === 'show', null, 'the reveal');
    check('album: nothing heard: the reveal anyway (its name and its cry), no sad sound, no fail', await g.ev(() => !G.top().quien.said && !window.__sfx.some(n => ['huh', 'boop', 'error'].includes(n))) && await g.until(() => window.__speak.some(s => /perro/.test(s.text)), null, 'its name', 3000).then(() => true));
    await g.until(() => G.top().quien && G.top().quien.t > 26 && G.input.ready(), null, 'the reveal shown');
    await g.tap(160, 200);
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    // once a day each; a tap reveals at once; quiet: never
    await openAlbum();
    await g.tapRect(await cellOf('gato'));
    check('album: an animal already asked today: just its name', await g.ev(() => !G.top().quien));
    await g.tapRect(await cellOf('pato'));
    await g.until(() => G.top().quien && G.top().quien.t > 12 && G.input.ready(), null, '"¿Quién es?" for the duck');
    await g.tap(30, 200);
    check('album: a tap anywhere: the reveal at once', await g.ev(() => G.top().quien && G.top().quien.ph === 'show' && !G.top().quien.said));
    await g.ev(() => { G.top().quien = null; });
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.ev(() => { G.sayFirst.reset(); G.audio.setPref('sayFirst', false); });
    await openAlbum();
    await g.tapRect(await cellOf('gato'));
    check('album: quiet: no "¿Quién es?" (just its name)', await g.ev(() => !G.top().quien));
    await g.ev(() => { G.audio.setPref('sayFirst', true); });
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    check('album: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY;
run('How words are asked: say it first, no give-aways, the right question', [['sayfirst', sayfirst], ['warmup', warmup], ['cards', cards], ['puzzle', puzzle], ['forms', forms], ['album', album]].filter(([n]) => !ONLY || ONLY === n));
