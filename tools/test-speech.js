// Speech recognition test: G.speech.match() in plain Node, then the grown-ups' mic test screen (G.micTest()) in
// Chromium with a FAKE SpeechRecognition that plays back scripted results, errors and silence.
//   NODE_PATH=$(npm root -g) node tools/test-speech.js [screenshot dir]
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { run, open, check, ROOT } = require('./harness');

// ---------- G.speech.match, loaded into a bare VM context (no browser, no game) ----------
const MUST_PASS = [['manzana', 'mansana'], ['manzana', 'manzana'], ['manzana', 'la manzana'], ['manzana', 'Manzana.'],
  ['gracias', 'grasias'], ['gracias', 'gracia'], ['adiós', 'adios'], ['hola', 'ola'], ['hola', 'Hola!'], ['plátano', 'platano'],
  ['buenos días', 'buenos dias'], ['buenos días', 'buenas días'], ['por favor', 'porfavor']];
const MUST_FAIL = [['manzana', 'banana'], ['hola', 'adiós'], ['tres', 'dos'], ['rojo', 'azul'], ['manzana', '']];

async function nodeMatch() {
  const ctx = { G: {}, window: {}, console, setTimeout, clearTimeout };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'speech.js'), 'utf8'), ctx, { filename: 'src/speech.js' });
  const S = ctx.G.speech;
  check('node: speech.js loads with no browser around it', !!S && typeof S.match === 'function' && !S.supported());
  let low = 1, high = 0;
  for (const [t, h] of MUST_PASS) {
    const m = S.match(t, [{ transcript: h, confidence: 0.4 }]); low = Math.min(low, m.score);
    check(`match: '${t}' heard '${h}' passes (${m.score.toFixed(2)})`, m.pass && m.heard === h && m.i === 0, JSON.stringify(m));
  }
  for (const [t, h] of MUST_FAIL) {
    const m = S.match(t, [{ transcript: h, confidence: 0.9 }]); high = Math.max(high, m.score);
    check(`match: '${t}' heard '${h}' fails (${m.score.toFixed(2)})`, !m.pass && m.score < S.PASS, JSON.stringify(m));
  }
  check(`match: a clear gap around the ${S.PASS} threshold (must-pass >= ${low.toFixed(2)}, must-fail <= ${high.toFixed(2)})`, low >= 0.85 && high <= 0.72);
  const empty = [S.match('hola', []), S.match('hola'), S.match('hola', null), S.match('', ['hola']), S.match('hola', [{ transcript: '' }])];
  check('match: no alternatives, an empty target or an empty transcript never pass', empty.every(m => !m.pass && m.score === 0));
  let m = S.match('manzana', [{ transcript: 'banana', confidence: 0.9 }, { transcript: 'la mansana', confidence: 0.3 }]);
  check('match: the best of several alternatives wins, whatever its confidence', m.pass && m.i === 1 && m.heard === 'la mansana', JSON.stringify(m));
  m = S.match('hola', ['adiós', 'tres']);
  check('match: plain strings work, and heard is still filled when nothing matches', !m.pass && m.heard === 'adiós' && m.i === 0, JSON.stringify(m));
  check('match: a target with forms ("rojo / roja") takes any of them', S.match('rojo / roja', ['roja']).pass && S.match('rojo / roja', ['rojo']).pass && !S.match('rojo / roja', ['azul']).pass);
  check('match: the article is optional ("la manzana" = "manzana")', S.match('la manzana', ['manzana']).pass && S.match('el plátano', ['plátano']).pass);
  check('match: digits count as number words ("3" = tres, "2" is not)', S.match('tres', ['3']).pass && !S.match('tres', ['2']).pass && S.match('dos', ['2']).pass);
  check('match: the word inside a longer answer ("yo quiero una manzana")', S.match('manzana', ['yo quiero una manzana']).pass);
  check('match: ¿¡ and accents are ignored, ñ = n', S.match('¿cómo estás?', ['como estas']).pass && S.norm('¡Ñandú, sí!') === 'nandu si');
  check('match: learner sounds fold (v=b, z/ce/ci=s, ll=y, h, qu/c=k, rr=r; ch stays)', S.fold('vaca zorro cinco llave hola queso chocolate') === 'baka soro sinko yabe ola keso chokolate', S.fold('vaca zorro cinco llave hola queso chocolate'));
  check('match: grades', S.grade(1) === 'PASS' && S.grade(S.PASS) === 'PASS' && S.grade(0.6) === 'CLOSE' && S.grade(0.2) === 'MISS');
  const alts = [{ transcript: 'Mansana', confidence: 0.5 }], copy = JSON.stringify(alts);
  check('match: pure (same answer twice, input untouched)', JSON.stringify(S.match('manzana', alts)) === JSON.stringify(S.match('manzana', alts)) && JSON.stringify(alts) === copy);
  check('node: listen() without a recognizer resolves at once with "unsupported"', (() => { ctx.G.Wait = class { constructor() { this.fin = false; } done() { return this.fin; } resolve(v) { this.result = v; this.fin = true; } }; const w = S.listen(); return w.done() && w.result.ok === false && w.result.error === 'unsupported' && Array.isArray(w.result.alternatives); })());
}

// ---------- the browser side ----------
// A fake recognizer: each start() takes the next scripted reply from window.__sr.queue:
//   {results: [[transcript, confidence], ...], final, delay, hang, error, throw}
// and records the input event it was started in, its settings, and the music volume at that moment.
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [], calls: [] };
  const ss = window.speechSynthesis;
  if (ss) { const c = ss.cancel.bind(ss); ss.cancel = () => { sr.calls.push('cancel'); c(); }; }
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.calls.push('start');
      sr.starts.push({ during: window.event ? window.event.type : 'frame', lang: this.lang, alts: this.maxAlternatives, interim: this.interimResults, continuous: this.continuous, gain: G.audio && G.audio.master ? G.audio.master.gain.value : null });
      if (s.throw) throw new DOMException('fake', s.throw);
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      if (s.hang) { if (s.results) setTimeout(() => this.result(s), s.delay || 200); return; } // like iOS: never ends by itself
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); this.result(s); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 300);
    }
    result(s) { const r = s.results.map(([transcript, confidence]) => ({ transcript, confidence })); r.isFinal = s.final !== false; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
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
  await g.ev(() => { window.__mw = G.micTest(); });
  await g.until(() => G.top().constructor.name === 'MicTest' && G.input.ready(), null, 'the mic test');
  return { ctx, g };
}
const M = (g, fn, arg) => g.ev(fn, arg); // runs against G.top(), the MicTest scene
const lastLog = g => g.ev(() => { const a = G.micTest.log.all(); return a[a.length - 1]; });
const spoke = (g, text) => g.page.waitForFunction(t => window.__speak.some(s => s.text === t), text, { timeout: 3000, polling: 50 }).then(() => true, () => false); // said (G.speak may wait a moment)

// one try: script the recognizer, tap the mic, wait for the answer
async function attempt(g, reply, how = 'tap') {
  await g.ev(r => window.__sr.queue.push(r), reply);
  const n = await g.ev(() => window.__sr.starts.length);
  g.logN = await g.ev(() => G.micTest.log.all().length);
  if (how === 'tap') await g.tapRect(await M(g, () => G.top().micRect()));
  else if (how === 'pad') await g.page.tap('#tcbtn button[data-k="A"]');
  else await g.press(how);
  await g.until(n => window.__sr.starts.length > n, n, 'the recognizer to start');
  return g.ev(() => window.__sr.starts[window.__sr.starts.length - 1]);
}
const settled = g => g.until(n => G.top().constructor.name === 'MicTest' && G.top().mode !== 'listening' && G.micTest.log.all().length > n, g.logN, 'the result'); // logged = finished
const asked = g => g.until(() => G.top().mode === 'ask' && G.top().askT > 15, null, 'the "did you hear the voice" question');

async function ipad(browser) {
  const { ctx, g } = await openWith(browser, 'mic', true, FAKE);
  try {
    check('mic: the screen knows the recognizer (webkitSpeechRecognition, es-MX)', await M(g, () => G.top().ok && G.top().info.api === 'webkitSpeechRecognition' && G.speech.supported()));
    await g.frames(4); await g.shot('start');
    await g.tapRect(await M(g, () => G.top().cellRect(1)));
    check('mic: tapping a word picks it and says it', await M(g, () => G.top().wi === 1) && await spoke(g, 'plátano'));
    await g.tapRect(await M(g, () => G.top().cellRect(0)));

    // a good try: started inside the real touch, voice stopped and music down while listening
    const st = await attempt(g, { results: [['mansana', 0.82], ['manzana', 0.61], ['banana', 0.3]], delay: 900 });
    check('mic: the recognizer starts inside the touch itself (touchend), single shot es-MX, 5 guesses', st.during === 'touchend' && st.lang === 'es-MX' && st.alts === 5 && st.interim === false && st.continuous === false, JSON.stringify(st));
    check('mic: the game\'s voice is stopped right before listening', await g.ev(() => { const c = window.__sr.calls, i = c.lastIndexOf('start'); return c[i - 1] === 'cancel'; }));
    check('mic: the music is turned down while listening', st.gain === 0 && await g.ev(() => G.audio.master.gain.value === 0 && G.speech.listening()), JSON.stringify(st));
    await g.frames(20); await g.shot('listening');
    await settled(g);
    check('mic: a good try is a PASS, with every guess listed', await M(g, () => { const r = G.top().res; return r.v === 'PASS' && r.m.heard === 'mansana' && r.m.score === 1 && r.r.alternatives.length === 3; }));
    check('mic: the music comes back after listening', await g.ev(() => G.audio.master.gain.value > 0 && !G.speech.listening()));
    await g.shot('pass');
    await asked(g);
    check('mic: after the mic the game says "¡Muy bien!" and asks if it was heard', await spoke(g, '¡Muy bien!'));
    await g.shot('ask');
    await g.tapRect(await M(g, () => G.top().yesRect()));
    let e = await lastLog(g);
    check('mic: the try is logged (word, verdict, score, guesses, how it started, voice heard)', e && e.word === 'manzana' && e.verdict === 'PASS' && e.score === 1 && e.alts.length === 3 && e.alts[0][0] === 'mansana' && e.alts[0][1] === 0.82 && e.start === 'touchend' && e.heard === true && e.ms > 0, JSON.stringify(e));
    check('mic: the tap after the mic wakes the audio and re-primes speech inside the touch', await g.ev(() => window.__speak.some(s => s.text === ' ' && s.during === 'touchend')) || await g.ev(() => speechSynthesis.speaking || speechSynthesis.pending), JSON.stringify(await g.ev(() => window.__speak.slice(-3))));
    await g.until(() => G.micTest.log.all().slice(-1)[0].tts != null, null, 'the voice check');
    check('mic: whether the voice started after the mic is logged too', !!(await lastLog(g)).tts);

    // nearly, then a wrong word
    await attempt(g, { results: [['banana', 0.9]] });
    await settled(g); await asked(g);
    check('mic: "banana" for "manzana" is only CLOSE, and the game says "¡Casi!"', await M(g, () => G.top().res.v === 'CLOSE') && await spoke(g, '¡Casi!'));
    await g.tapRect(await M(g, () => G.top().noRect()));
    check('mic: "No" is logged as the voice not heard', (await lastLog(g)).heard === false);
    await attempt(g, { results: [['pelota', 0.9], ['paleta', 0.5]] });
    await settled(g);
    check('mic: a wrong word is a MISS', await M(g, () => G.top().res.v === 'MISS' && G.top().res.scores.every(s => s < 0.5)));
    await g.frames(4); await g.shot('miss');
    await asked(g);
    check('mic: ...and the game says "Otra vez."', await spoke(g, 'Otra vez.'));
    await g.tapRect(await M(g, () => G.top().yesRect()));

    // silence
    await attempt(g, { error: 'no-speech', delay: 200 });
    await settled(g);
    check('mic: silence shows the no-speech error', await M(g, () => G.top().res.v === 'ERROR' && G.top().res.r.error === 'no-speech'));
    await asked(g); await g.tapRect(await M(g, () => G.top().yesRect()));
    await g.frames(4); await g.shot('no_speech');

    // blocked mic: nothing to ask afterwards
    await attempt(g, { error: 'not-allowed', delay: 100 });
    await settled(g); await g.frames(40);
    check('mic: a blocked mic says so, with no voice question', await M(g, () => G.top().res.r.error === 'not-allowed' && G.top().mode === 'ready') && (await lastLog(g)).error === 'not-allowed');
    await g.shot('not_allowed');
    await attempt(g, { throw: 'NotAllowedError' });
    await settled(g);
    check('mic: start() throwing is caught (not-allowed), never an exception', await M(g, () => G.top().res.r.error === 'not-allowed'));

    // like iOS: an interim result and then nothing, the recognizer never ends by itself
    await g.tapRect(await M(g, () => G.top().cellRect(2))); // hola
    await attempt(g, { results: [['Hola', 0.4]], final: false, hang: true, delay: 200 });
    await settled(g);
    check('mic: an interim result with no end still finishes (stopped after a quiet moment) and passes', await M(g, () => G.top().res.v === 'PASS' && G.top().res.m.heard === 'Hola') && await g.ev(() => window.__sr.calls.includes('stop')));
    await asked(g); await g.tapRect(await M(g, () => G.top().yesRect()));
    // tapping the mic again stops listening
    await attempt(g, { hang: true });
    await g.until(() => G.top().listen && G.top().listen.phase === 'listening' && G.top().lt > 30, null, 'listening');
    await g.tapRect(await M(g, () => G.top().micRect()));
    await settled(g);
    check('mic: tapping the mic while listening stops it', await M(g, () => G.top().res.r.error === 'no-speech') && await g.ev(() => window.__sr.calls.slice(-1)[0] === 'stop'));
    await asked(g); await g.tapRect(await M(g, () => G.top().yesRect()));

    // the on-screen pad's A button can't start inside a gesture (it acts on the finger going down): it still works from the game loop
    await g.ev(() => G.setDpad(true, true));
    await attempt(g, { results: [['ola', 0.5]] }, 'pad');
    await settled(g);
    check('mic: the D-pad A button starts it from the game loop ("frame")', await g.ev(() => window.__sr.starts.slice(-1)[0].during === 'frame') && await M(g, () => G.top().res.v === 'PASS'));
    await asked(g); await g.tapRect(await M(g, () => G.top().yesRect()));
    await g.ev(() => G.setDpad(false, true));

    // copy: inside the tap; if the clipboard refuses, a text box to copy by hand
    await g.ev(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__copied = { t, during: window.event ? window.event.type : 'frame' }; return Promise.resolve(); } } }));
    await g.tapRect(await M(g, () => G.top().copyRect()));
    await g.until(() => window.__copied && G.top().noteT > 0, null, 'the copy');
    const cp = await g.ev(() => window.__copied);
    check('mic: Copy writes the log to the clipboard inside the touch', cp.during === 'touchend' && /mansana/.test(cp.t) && /PASS/.test(cp.t) && /NOT heard/.test(cp.t) && /webkitSpeechRecognition/.test(cp.t), cp.during + '\n' + cp.t.slice(0, 400));
    await g.shot('copied');
    await g.ev(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('no')) } }));
    await g.until(() => performance.now() - G.top().lastCopy > 500, null, 'a moment');
    await g.tapRect(await M(g, () => G.top().copyRect()));
    await g.until(() => !!document.getElementById('mictext'), null, 'the copy-by-hand box');
    check('mic: when copying is blocked, the text is shown to copy by hand', await g.ev(() => /mansana/.test(document.querySelector('#mictext textarea').value)));
    await g.shot('copy_by_hand');
    await g.page.tap('#mictext button');
    check('mic: Done closes the text box', await g.ev(() => !document.getElementById('mictext') && G.top().constructor.name === 'MicTest'));
    await g.ev(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
    await g.until(() => performance.now() - G.top().lastCopy > 500, null, 'a moment');
    await g.tapRect(await M(g, () => G.top().copyRect()));
    await g.until(() => !!document.getElementById('mictext'), null, 'the copy-by-hand box');
    await g.page.keyboard.press('Escape'); await g.frames(2);
    check('mic: with no clipboard at all the text box shows too, and Esc closes it', await g.ev(() => !document.getElementById('mictext') && G.top().constructor.name === 'MicTest'));

    // the log keeps the last 200; Clear asks once more
    check('mic: the log keeps the last 200 tries', await g.ev(() => { const L = G.micTest.log, keep = L.all(); for (let i = 0; i < 230; i++) L.add({ id: 'x' + i, at: Date.now(), word: 'hola', verdict: 'PASS', score: 1, alts: [] }); const a = L.all(), ok = a.length === 200 && a[0].id === 'x30'; localStorage.setItem('spanishclub_mictest', JSON.stringify(keep)); return ok; }));
    await g.tapRect(await M(g, () => G.top().clearRect()));
    check('mic: the first tap on Clear only asks', await M(g, () => G.top().clearT > 0) && await g.ev(() => G.micTest.log.all().length > 0));
    await g.frames(4); await g.shot('clear_sure');
    await g.tapRect(await M(g, () => G.top().clearRect()));
    check('mic: the second tap clears the log', await g.ev(() => G.micTest.log.all().length === 0 && localStorage.getItem('spanishclub_mictest') === null));

    await g.tapBtn([G_W() - 26, 6]);
    check('mic: the close button closes it', await g.ev(() => G.top().constructor.name === 'Title' && window.__mw.done()));
    check('mic: works as yield* G.micTest() in a task too', await g.ev(() => {
      const T = new G.Tasks(); let back = false;
      T.add((function* () { yield* G.micTest(); back = true; })());
      T.update(); const opened = G.top().constructor.name === 'MicTest';
      G.top().close(); T.update(); T.update();
      return opened && back && G.top().constructor.name === 'Title';
    }));
    check('mic: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}
const G_W = () => 320;

async function desktop(browser) {
  const { ctx, g } = await openWith(browser, 'mic-keys', false, FAKE);
  try {
    await g.press('ArrowRight');
    check('mic keys: arrows pick a word and say it', await M(g, () => G.top().wi === 1) && await spoke(g, 'plátano'));
    await g.press('ArrowLeft'); await g.press('ArrowDown');
    check('mic keys: down moves a row', await M(g, () => G.top().wi === 4));
    await g.press('ArrowUp');
    await g.ev(() => { window.__speak.length = 0; });
    await g.press('c');
    check('mic keys: C says the word again', await spoke(g, 'manzana'));
    await g.shot('start');
    const st = await attempt(g, { results: [['manzana', 0.9]] }, 'z');
    check('mic keys: Z starts the recognizer inside the key press', st.during === 'keydown', JSON.stringify(st));
    await settled(g); await asked(g);
    await g.press('ArrowRight'); await g.shot('ask'); await g.press('Enter');
    check('mic keys: the voice question is answered with arrows + Enter', (await lastLog(g)).heard === false && await M(g, () => G.top().mode === 'ready'));
    await attempt(g, { results: [['mansana', 0.7]] });
    check('mic keys: a mouse click on the mic starts it inside the click (pointerup)', await g.ev(() => window.__sr.starts.slice(-1)[0].during === 'pointerup'));
    await settled(g); await asked(g); await g.press('x');
    check('mic keys: X skips the voice question', (await lastLog(g)).heard === null && await M(g, () => G.top().mode === 'ready'));
    await attempt(g, { hang: true }, 'z');
    await g.until(() => G.top().lt > 20, null, 'listening');
    await g.press('x');
    await settled(g);
    check('mic keys: X while listening stops it (aborted)', await M(g, () => G.top().res.r.error === 'aborted') && await g.ev(() => window.__sr.calls.slice(-1)[0] === 'abort'));
    await asked(g); await g.press('x');
    await g.press('x');
    check('mic keys: X closes the mic test', await g.ev(() => G.top().constructor.name === 'Title' && window.__mw.done()));
    check('mic keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function unsupported(browser) {
  const { ctx, g } = await openWith(browser, 'mic-none', true, NONE);
  try {
    check('mic none: no recognizer is detected', await M(g, () => !G.top().ok && !G.speech.supported() && G.top().info.api === null));
    check('mic none: listen() resolves at once with "unsupported"', await g.ev(() => { const w = G.speech.listen(); return w.done() && !w.result.ok && w.result.error === 'unsupported'; }));
    await g.tapRect(await M(g, () => G.top().micRect()));
    check('mic none: tapping the mic explains instead of listening', await M(g, () => G.top().mode === 'ready' && G.top().noteT > 0));
    await g.tapRect(await M(g, () => G.top().cellRect(5)));
    check('mic none: the words still speak (the voice can be tested)', await spoke(g, 'por favor'));
    await g.frames(4); await g.shot('unsupported');
    check('mic none: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Speech recognition + mic test', [['G.speech.match (Node)', nodeMatch], ['mic test on iPad (fake recognizer, taps)', ipad], ['mic test with keys and mouse (desktop)', desktop], ['no speech recognition (iPad)', unsupported]]);
