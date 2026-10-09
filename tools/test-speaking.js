// Speaking for bonus stars (src/mic.js and its use in learn.js, state.js, menus.js, day.js, story.js), with a FAKE
// SpeechRecognition (the same as tools/test-speech.js) that plays back scripted results, errors and silence:
// the mic on picture cards and list questions, a right answer said out loud (chosen + a speaking star + said count),
// a wrong one said (greys out like a tap), silence and errors (nothing breaks, "¡Otra vez!", tapping still works),
// a tap while listening, the "¡Palabra nueva!" card's mic, the V key, the grown-ups' switch, a blocked mic, no
// recognizer at all, saving and reloading the said counts, the Cuaderno's mark, and the mic test's share sheet.
//   NODE_PATH=$(npm root -g) node tools/test-speaking.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// ---------- a fake recognizer: each start() takes the next reply from window.__sr.queue ----------
//   {results: [[transcript, confidence], ...], final, delay, hang, error, throw}
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [], calls: [] };
  const ss = window.speechSynthesis;
  if (ss) { const c = ss.cancel.bind(ss); ss.cancel = () => { sr.calls.push('cancel'); c(); }; }
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.calls.push('start');
      sr.starts.push({ during: window.event ? window.event.type : 'frame', lang: this.lang, gain: G.audio && G.audio.master ? G.audio.master.gain.value : null });
      if (s.throw) throw new DOMException('fake', s.throw);
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      if (s.hang) return;
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
function NONE() { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; }

async function openWith(browser, name, touch, init) {
  const { ctx, g } = await open(browser, name, touch);
  await ctx.addInitScript(init);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// on the map, ready to walk, every sound effect logged in window.__sfx
async function start(g, o = {}) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz'; G.state.flags.intro = true; G.goto('villa', 5, 18, 'down');
    window.__sfx = []; const sfx = G.audio.sfx; G.audio.sfx = n => { window.__sfx.push(n); sfx(n); };
    if (o.slot) G.st.begin(o.slot);
  }, o);
  await g.fieldIdle('villa');
}
const heard = (g, n) => g.ev(n => window.__sfx.includes(n), n);
async function still(g, label) { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); }
// (the gold "¡Palabra de oro!" card now comes when the word model says a word is remembered, learn.js; this test is about
// the mic on questions and on that card, so each question is followed by the card for its word, made gold)
const ask = (g, q) => g.ev(q => { window.__r = null; G.field.tasks.add((function* () { const r = yield* G.ask(q); yield G.learnWords(q.learn, { force: true }); window.__r = r; })()); }, q);
const choiceUp = g => g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 8 && G.input.ready(), null, 'the question');
const cards = (...ids) => ids.map(id => ({ word: id }));
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const btn = ([x, y]) => ({ x: x - 4, y: y - 4, w: 28, h: 28 }); // a corner button's tap area
// script the recognizer, then tap the mic (or press a key); resolves with how the recognizer was started
async function speak(g, reply, how = 'tap') {
  await g.ev(r => window.__sr.queue.push(r), reply);
  const n = await g.ev(() => window.__sr.starts.length);
  if (how === 'tap') await g.tapRect(await g.ev(() => G.top().mic.o.rect())); else await g.press(how);
  await g.until(n => window.__sr.starts.length > n, n, 'the recognizer to start');
  return g.ev(() => window.__sr.starts[window.__sr.starts.length - 1]);
}
const micIdle = g => g.until(() => G.top().mic && !G.top().mic.listening() && !G.speech.listening(), null, 'the mic to finish');

async function ipad(browser) {
  const { ctx, g } = await openWith(browser, 'speak', true, FAKE);
  try {
    await start(g);
    const stars0 = await g.ev(() => G.state.stars);

    // ---- picture cards: a mic button, clear of the cards and the speaker ----
    await ask(g, { prompt: '¡[hola]!', layout: 'cards', choices: cards('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    await choiceUp(g);
    let L = await g.ev(() => { const s = G.top(); return { mic: s.mic && s.mic.o.rect(), rects: s.rects(), spk: s.spk() }; });
    check('speak: a cards question has a big mic button', !!L.mic && L.mic.w >= 32 && L.mic.h >= 32, JSON.stringify(L.mic));
    check('speak: ...clear of the cards (and their tap padding) and the speaker', L.rects.every(r => !overlap(L.mic, { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 6 })) && !overlap(L.mic, btn(L.spk)) && L.mic.x + L.mic.w <= 320 && L.mic.y + L.mic.h <= 224);
    await g.frames(30); await still(g, 'mic_cards');

    // ---- the right answer said out loud: chosen, plus a speaking star ----
    await g.ev(() => { window.__sfx.length = 0; window.__c = G.top(); });
    const st = await speak(g, { results: [['Hola', 0.97], ['ola', 0.4]], delay: 600 });
    check('speak: the mic starts inside the touch itself (touchend), es-MX', st.during === 'touchend' && st.lang === 'es-MX', JSON.stringify(st));
    check('speak: the voice is stopped right before listening, the music turned down', await g.ev(() => { const c = window.__sr.calls, i = c.lastIndexOf('start'); return c[i - 1] === 'cancel'; }) && st.gain === 0);
    await g.frames(16); await still(g, 'mic_listening');
    check('speak: the question stays up while listening', await g.ev(() => G.top() === window.__c && window.__c.mic.listening() && !window.__c.won));
    await g.until(() => window.__c.won, null, 'the spoken answer');
    check('speak: saying the right word picks it (as a first try)', await g.ev(() => window.__c.w.result === 1 && window.__c.won.spoken && window.__c.won.k === 1));
    check('speak: ...with a speaking star: words.hola.said = 1, micStars() = 1', await g.ev(() => G.state.words.hola.said === 1 && G.st.micStars() === 1 && G.st.saidCount('hola') === 1));
    check('speak: ...its own sound and a star with sound waves flying up', await heard(g, 'micstar') && await heard(g, 'chime') && await g.ev(() => G.fx.live('fly') >= 1));
    check('speak: the audio comes back after listening', await g.ev(() => G.audio.master.gain.value > 0 && !G.speech.listening()));
    await g.frames(6); await still(g, 'mic_bonus_cards');
    await g.frames(14); await still(g, 'mic_bonus_fly');
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    check('speak: ...the stars: first try + speaking star', await g.ev(s0 => G.state.stars === s0 + 2, stars0));

    // ---- "¡Palabra nueva!": say it for one more speaking star ----
    L = await g.ev(() => { const s = G.top(), b = s.box(); return { mic: s.mic && s.mic.o.rect(), spk: s.spk(), box: b }; });
    check('speak: the new word card has a mic, inside the card and clear of its speaker', !!L.mic && !overlap(L.mic, btn(L.spk)) && L.mic.x >= L.box.x && L.mic.y + L.mic.h <= L.box.y + L.box.h);
    await g.frames(20); await still(g, 'wordcard_mic');
    await speak(g, { results: [['pelota', 0.9]] });
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().mic.sad > 0, null, '"¡Otra vez!"');
    check('speak: a different word on the card: "¡Otra vez!" and nothing else', await g.ev(() => G.state.words.hola.said === 1 && G.top().constructor.name === 'WordCard' && !G.top().mic.done) && await heard(g, 'huh'));
    await g.frames(4); await still(g, 'wordcard_otra_vez');
    await micIdle(g);
    await speak(g, { results: [['hola', 0.95]] });
    await g.until(() => G.top().mic.done, null, 'the card\'s speaking star');
    check('speak: saying the new word: said = 2, micStars = 2, the card stays up', await g.ev(() => G.state.words.hola.said === 2 && G.st.micStars() === 2 && G.top().constructor.name === 'WordCard'));
    await g.frames(8); await still(g, 'wordcard_said');
    await g.tapRect(await g.ev(() => G.top().mic.o.rect()));
    check('speak: tapping the gold mic again just says the word (no more stars, the card stays)', await g.ev(() => G.st.micStars() === 2 && G.top().constructor.name === 'WordCard'));
    await g.tap(150, 200);
    await g.until(() => window.__r != null, null, 'the question to finish');
    check('speak: a tap goes on as always; G.ask reports a first try', await g.ev(() => window.__r === true));
    await g.fieldIdle('villa');

    // ---- a list question: a wrong word said, silence, an error, then a tap ----
    await ask(g, { prompt: '¡[adios]!', layout: 'list', choices: cards('hola', 'adios', 'gracias'), answer: 1, learn: 'adios' });
    await choiceUp(g);
    L = await g.ev(() => { const s = G.top(); return { mic: s.mic && s.mic.o.rect(), rects: s.rects(), spk: s.spk() }; });
    check('speak: a list question has the mic too, clear of the list and the speaker', !!L.mic && L.rects.every(r => !overlap(L.mic, r)) && !overlap(L.mic, btn(L.spk)));
    await g.frames(20); await still(g, 'mic_list');
    await g.ev(() => { window.__sfx.length = 0; window.__c = G.top(); });
    await speak(g, { results: [['gracias', 0.95]] });
    await g.until(() => window.__c.ch[2].off, null, 'the said wrong row to grey out');
    check('speak: saying a wrong choice greys it out, like tapping it (boop, question stays)', await g.ev(() => G.top() === window.__c && !window.__c.won && window.__c.miss.k === 2) && await heard(g, 'boop'));
    await micIdle(g); await g.until(() => window.__c.miss.t > 10, null, 'the wobble');
    await g.ev(() => { window.__sfx.length = 0; });
    await speak(g, { error: 'no-speech', delay: 200 });
    await g.until(() => window.__c.mic.sad > 0, null, '"¡Otra vez!"');
    check('speak: silence: a gentle "¡Otra vez!", nothing greyed, no penalty', await g.ev(() => !window.__c.won && window.__c.ch.filter(c => c.off).length === 1) && await heard(g, 'huh') && !(await heard(g, 'boop')) && !(await heard(g, 'error')));
    await g.frames(6); await still(g, 'mic_otra_vez');
    await micIdle(g);
    await speak(g, { error: 'network', delay: 100 });
    await g.until(() => window.__c.mic.sad > 0 && !window.__c.mic.listening(), null, '"¡Otra vez!" after an error');
    await micIdle(g);
    await speak(g, { results: [['banana', 0.9], ['bandera', 0.5]] });
    await g.until(() => !window.__c.mic.listening() && window.__c.mic.sad > 0, null, 'no match');
    check('speak: an error or a word that is none of the choices: no change, the mic still there', await g.ev(() => !window.__c.won && window.__c.ch.filter(c => c.off).length === 1 && G.mic.on() && !!window.__c.mic));
    await micIdle(g);
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    check('speak: tapping still answers (no speaking star)', await g.ev(() => window.__c.won && !window.__c.won.spoken && window.__c.w.result === 1 && !G.state.words.adios.said && G.st.micStars() === 2));
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    await g.tap(150, 200);
    await g.until(() => window.__r != null, null, 'the question to finish');
    check('speak: ...and a wrong try is not a first try', await g.ev(() => window.__r === false));
    await g.fieldIdle('villa');

    // ---- a tap on a card while listening: stops the mic, answers ----
    await ask(g, { prompt: '¡[gracias]!', layout: 'cards', choices: cards('gracias', 'pelota', 'manzana', 'carta'), answer: 0, learn: 'gracias' });
    await choiceUp(g);
    L = await g.ev(() => { const s = G.top(); return { mic: s.mic.o.rect(), rects: s.rects() }; });
    check('speak: four cards make room for the mic', L.rects.every(r => !overlap(L.mic, { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 6 })) && L.rects[0].x >= 8);
    await g.frames(10); await still(g, 'mic_cards4');
    await g.ev(() => { window.__c = G.top(); });
    await speak(g, { hang: true });
    await g.until(() => window.__c.mic.listening() && window.__c.mic.l.phase === 'listening', null, 'listening');
    await g.tapRect(L.rects[0]);
    check('speak: a tap on a card while listening stops the mic and answers', await g.ev(() => window.__c.won && !window.__c.won.spoken && window.__c.w.result === 0 && !window.__c.mic.listening() && window.__sr.calls.slice(-1)[0] === 'abort'));
    await g.until(() => !G.speech.listening(), null, 'the mic to close');
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    await g.tap(150, 200);
    await g.fieldIdle('villa');

    // ---- the grown-ups' switch ----
    await g.ev(() => { window.__gu = G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps' && G.input.ready(), null, 'the grown-ups menu');
    let row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'speak'); return { k, r: s.rows()[k], rect: s.rowRect(k), n: s.rows().length, last: s.rowRect(s.rows().length - 1) }; });
    check('speak: grown-ups has "Speaking (mic)", on by default', row.k >= 0 && row.r.label === 'Speaking (mic)' && row.r.on === true && !row.r.off);
    check('speak: ...every row still fits above the help line', row.last.y + row.last.h <= 204, JSON.stringify(row.last));
    await g.frames(4); await still(g, 'grownups');
    await g.tapRect(row.rect);
    check('speak: tapping it turns speaking off (kept per device)', await g.ev(() => G.prefs.mic === false && JSON.parse(localStorage.getItem('spanishclub_prefs')).mic === false && !G.mic.on()));
    await g.frames(2); await still(g, 'grownups_off');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    await ask(g, { prompt: '¡[si]!', layout: 'cards', choices: cards('si', 'no'), answer: 0, learn: 'si' });
    await choiceUp(g);
    check('speak: switched off, questions have no mic', await g.ev(() => !G.top().mic));
    await g.ev(() => { window.__sr.queue.push({ results: [['sí', 0.9]] }); });
    await g.press('v');
    check('speak: ...and V does nothing', await g.ev(() => window.__sr.queue.length === 1 && !G.top().won));
    await g.ev(() => { window.__sr.queue.length = 0; });
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    check('speak: switched off, the new word card has no mic', await g.ev(() => !G.top().mic));
    await g.tap(150, 200);
    await g.fieldIdle('villa');
    await g.ev(() => G.audio.setPref('mic', true));

    // ---- refusals never hide the mic (iPad Safari refuses now and then); they are logged for grown-ups ----
    await ask(g, { prompt: '¡[no]!', layout: 'cards', choices: cards('si', 'no'), answer: 1, learn: 'no' });
    await choiceUp(g);
    await g.ev(() => { window.__c = G.top(); });
    await speak(g, { error: 'audio-capture', delay: 50 });
    await micIdle(g);
    check('speak: a busy mic (audio-capture) just says ¡Otra vez! and stays', await g.ev(() => G.mic.on() && window.__c.mic.shown() && window.__c.mic.sad > 0));
    for (let k = 0; k < 3; k++) { await speak(g, { error: 'not-allowed', delay: 50 }); await micIdle(g); }
    check('speak: repeated refusals keep the mic, with ¡Otra vez!', await g.ev(() => G.mic.on() && window.__c.mic.shown() && window.__c.mic.sad > 0 && !window.__c.won));
    check('speak: refusals are logged on the device', await g.ev(() => G.mic.errors.filter(e => e.error === 'not-allowed').length >= 3 && JSON.parse(localStorage.getItem('spanishclub_micerrors')).length >= 3));
    await g.frames(4); await still(g, 'mic_refused');
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    await g.tap(150, 200);
    await g.fieldIdle('villa');
    await g.ev(() => { window.__gu = G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps' && G.input.ready(), null, 'the grown-ups menu');
    row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'speak'); return { r: s.rows()[k], rect: s.rowRect(k) }; });
    check('speak: grown-ups shows the switch on, and the last mic problem', row.r.on === true && /not-allowed/.test(row.r.help));
    check('speak: the mic test log includes in-game mic problems', await g.ev(() => /In-game mic problems \(last \d+\): .*not-allowed/.test(G.micTest.log.text())));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');

    // ---- the mic test shares its log through the share sheet when there is one ----
    await g.ev(() => {
      G.micTest.log.add({ id: 'a', at: Date.now(), word: 'hola', verdict: 'PASS', score: 1, alts: [['hola', 0.97]], ms: 2100, start: 'touchend' });
      navigator.share = d => { window.__shared = { d, during: window.event ? window.event.type : 'frame' }; return Promise.resolve(); };
      window.__mw = G.micTest();
    });
    await g.until(() => G.top().constructor.name === 'MicTest' && G.input.ready(), null, 'the mic test');
    await g.frames(2); await still(g, 'mictest_share');
    await g.tapRect(await g.ev(() => G.top().copyRect()));
    await g.until(() => window.__shared && G.top().noteT > 0, null, 'the share');
    check('speak: the mic test\'s "Share log" opens the share sheet inside the touch', await g.ev(() => window.__shared.during === 'touchend' && /hola/.test(window.__shared.d.text) && /Shared/.test(G.top().note)));
    await g.ev(() => { navigator.share = () => Promise.reject(new DOMException('closed', 'AbortError')); window.__copied = null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__copied = t; return Promise.resolve(); } } }); });
    await g.until(() => performance.now() - G.top().lastCopy > 500, null, 'a moment');
    await g.tapRect(await g.ev(() => G.top().copyRect()));
    await g.frames(10);
    check('speak: closing the share sheet does nothing more', await g.ev(() => window.__copied === null && !document.getElementById('mictext')));
    await g.ev(() => { navigator.share = () => Promise.reject(new DOMException('no', 'NotAllowedError')); });
    await g.until(() => performance.now() - G.top().lastCopy > 500, null, 'a moment');
    await g.tapRect(await g.ev(() => G.top().copyRect()));
    await g.until(() => window.__copied, null, 'the clipboard');
    check('speak: if sharing fails it copies to the clipboard instead', await g.ev(() => /hola/.test(window.__copied)));
    await g.ev(() => { G.top().close(); delete navigator.share; });

    check('speak: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// the save keeps what was said; older saves load fine; the Cuaderno, Hoy and the diploma show it
async function saves(browser) {
  const { ctx, g } = await openWith(browser, 'speak-save', true, FAKE);
  try {
    await g.ev(() => localStorage.clear());
    await start(g, { slot: 1 });
    await ask(g, { prompt: '¡[hola]!', layout: 'cards', choices: cards('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    await choiceUp(g);
    await speak(g, { results: [['hola', 0.98]] });
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    await speak(g, { results: [['hola', 0.98]] });
    await g.until(() => G.top().mic.done, null, 'the card\'s star');
    await g.tap(150, 200);
    await g.fieldIdle('villa');
    check('save: said twice, two speaking stars', await g.ev(() => G.st.saidCount('hola') === 2 && G.st.micStars() === 2));
    await g.ev(() => { window.__tc = G.day.todayCard(); });
    await g.until(() => G.top().constructor.name === 'TodayCard', null, 'the Hoy card');
    await g.tap(150, 120); await g.frames(20); await still(g, 'hoy');
    check('save: the Hoy card counts today\'s speaking stars', await g.ev(() => G.top().said === 2 && G.top().stars === 3));
    await g.until(() => G.top().wait >= 20, null, 'the Hoy card to settle');
    await g.tap(150, 200);
    await g.fieldIdle('villa');
    await g.ev(() => { G.state.pages.saludos = true; G.st.saveNow(); });
    await g.page.reload();
    await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title', null, 'the title after reload');
    check('save: after a reload the said count and speaking stars are back', await g.ev(() => G.st.loadSlot(1) && G.st.saidCount('hola') === 2 && G.state.words.hola.said === 2 && G.st.micStars() === 2 && G.state.stars >= 3));
    check('save: an older save (no said counts) loads with zeros', await g.ev(() => {
      localStorage.setItem('spanishclub_slot3', JSON.stringify({ flags: { intro: true }, words: { hola: { learned: true, right: 2, wrong: 0 } }, pages: {}, quests: {}, stars: 2, opts: {}, loc: { map: 'villa', x: 5, y: 18, dir: 'down' }, name: 'Ana' }));
      const s = G.st.read(3); return s && G.st.micStars(s) === 0 && s.words.hola.said === undefined && s.stars === 2;
    }));
    // the Cuaderno marks words said out loud; the "Hoy" card and the diploma count the speaking stars
    await g.ev(() => { G.st.loadSlot(1); G.goto('villa', 5, 18, 'down'); });
    await g.fieldIdle('villa');
    await g.ev(() => { window.__nb = G.notebook('saludos'); });
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the notebook');
    await g.frames(4); await still(g, 'cuaderno_said');
    check('save: the Cuaderno knows which words were said', await g.ev(() => G.top().words().includes('hola') && G.st.saidCount('hola') > 0 && G.st.saidCount('adios') === 0));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.fieldIdle('villa');
    await g.ev(() => { window.__dp = G.story.diploma(); });
    await g.until(() => G.top().constructor.name === 'Diploma', null, 'the diploma');
    await g.frames(10); await still(g, 'diploma');
    check('save: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function desktop(browser) {
  const { ctx, g } = await openWith(browser, 'speak-keys', false, FAKE);
  try {
    await start(g);
    await ask(g, { prompt: '¿Qué quieres?', layout: 'cards', choices: cards('manzana', 'platano', 'galleta'), answer: 1, learn: 'platano' });
    await choiceUp(g);
    await g.press('ArrowRight');
    check('speak keys: arrows still move the cursor', await g.ev(() => G.top().i === 1 || G.top().i === 2));
    await g.ev(() => { window.__c = G.top(); });
    const st = await speak(g, { results: [['el plátano', 0.9]] }, 'v');
    check('speak keys: V starts the mic inside the key press', st.during === 'keydown', JSON.stringify(st));
    await g.until(() => window.__c.won, null, 'the spoken answer');
    check('speak keys: "el plátano" picks plátano, with a speaking star', await g.ev(() => window.__c.w.result === 1 && window.__c.won.spoken && G.state.words.platano.said === 1));
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20, null, 'the new word card');
    await speak(g, { hang: true }, 'v');
    await g.until(() => G.top().mic.listening(), null, 'listening');
    await g.press('v');
    await g.until(() => !G.top().mic.listening(), null, 'V to stop it');
    check('speak keys: V again stops listening (nothing heard: "¡Otra vez!")', await g.ev(() => G.top().constructor.name === 'WordCard' && G.top().mic.sad > 0 && window.__sr.calls.includes('stop')));
    await g.press('z');
    await g.until(() => window.__r != null, null, 'the question to finish');
    check('speak keys: Z still goes on', await g.ev(() => window.__r === true));
    await g.fieldIdle('villa');
    await ask(g, { prompt: '¡[hola]!', layout: 'list', choices: cards('hola', 'adios'), answer: 0, learn: 'hola' });
    await choiceUp(g);
    await g.press('Enter');
    check('speak keys: Enter answers as before', await g.ev(() => window.__r === null && G.top().won && G.top().w.result === 0));
    // Space is push-to-talk while a mic is ready: hold to talk, let go to finish; it doesn't answer like A
    await g.drive(() => window.__r != null, 'the question to finish');
    await g.fieldIdle('villa');
    await ask(g, { prompt: '¿Qué quieres?', layout: 'cards', choices: cards('manzana', 'platano', 'galleta'), answer: 0, learn: 'manzana' });
    await choiceUp(g);
    await g.ev(() => { window.__c = G.top(); window.__sr.queue.push({ hang: true }); });
    const n0 = await g.ev(() => window.__sr.starts.length);
    await g.page.keyboard.down('Space');
    await g.until(n => window.__sr.starts.length > n, n0, 'Space to start the recognizer');
    check('speak space: holding Space starts the mic inside the key press', await g.ev(() => window.__sr.starts[window.__sr.starts.length - 1].during === 'keydown'));
    await g.frames(30);
    check('speak space: while held it keeps listening and answers nothing', await g.ev(() => window.__c.mic.listening() && !window.__c.won && window.__r === null));
    await g.page.keyboard.up('Space');
    await g.until(() => !window.__c.mic.listening(), null, 'letting go of Space to finish');
    check('speak space: letting go stops listening', await g.ev(() => window.__sr.calls.includes('stop') && !window.__c.won));
    await micIdle(g);
    await g.ev(() => { window.__sr.calls.length = 0; window.__sr.queue.push({ hang: true }); });
    await g.page.keyboard.press('Space'); await g.frames(30);
    check('speak space: a quick press starts it and it keeps listening, like a tap', await g.ev(() => window.__c.mic.listening() && !window.__sr.calls.includes('stop')));
    await g.press('v');
    await micIdle(g);
    await g.press('Enter');
    check('speak space: Enter still answers', await g.ev(() => window.__c.won && window.__c.w.result === 0));
    check('speak keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function unsupported(browser) {
  const { ctx, g } = await openWith(browser, 'speak-none', true, NONE);
  try {
    await start(g);
    check('speak none: no recognizer, no mic', await g.ev(() => !G.speech.supported() && !G.mic.on()));
    await ask(g, { prompt: '¡[hola]!', layout: 'cards', choices: cards('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    await choiceUp(g);
    check('speak none: questions have no mic button', await g.ev(() => !G.top().mic));
    await g.frames(10); await still(g, 'no_mic_cards');
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20 && G.input.ready(), null, 'the new word card');
    check('speak none: the new word card has no mic', await g.ev(() => !G.top().mic));
    await g.tap(150, 200);
    await g.until(() => window.__r != null, null, 'the question to finish');
    await g.fieldIdle('villa');
    await g.ev(() => { window.__gu = G.grownUps(); });
    await g.until(() => G.top().constructor.name === 'GrownUps' && G.input.ready(), null, 'the grown-ups menu');
    const row = await g.ev(() => { const s = G.top(), k = s.rows().findIndex(r => r.id === 'speak'); return { r: s.rows()[k], rect: s.rowRect(k) }; });
    check('speak none: grown-ups shows "Speaking (mic)" greyed: not available', row.r.off && row.r.right === 'not available');
    await g.tapRect(row.rect);
    check('speak none: tapping it changes nothing', await g.ev(() => G.prefs.mic == null && G.top().constructor.name === 'GrownUps'));
    await g.frames(4); await still(g, 'grownups_none');
    check('speak none: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Speaking for bonus stars', [['questions and the new word card on iPad (fake recognizer, taps)', ipad], ['saving what was said', saves], ['keys on a desktop (V)', desktop], ['no speech recognition (iPad)', unsupported]]);
