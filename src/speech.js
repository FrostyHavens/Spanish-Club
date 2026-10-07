// ===== Speech recognition: listen once in Spanish, and check what was heard against a word =====
// G.speech.supported()          the browser has SpeechRecognition / webkitSpeechRecognition
// G.speech.listen(o) -> G.Wait  o: {lang: 'es-MX', alts: 5, timeout: 8000 ms}; single shot, no interim results.
//                               Resolves {ok, alternatives: [{transcript, confidence}], error, ms, during}; never throws.
//                               error: 'unsupported' 'not-allowed' 'service-not-allowed' 'no-speech' 'no-match' 'network'
//                               'aborted' 'audio-capture' 'language-not-supported' 'timeout' 'busy' 'start-failed' ...
//                               during: the input event it was started in ('touchend' 'pointerup' 'keydown'), else 'frame'.
//                               The Wait also has .phase ('starting' 'listening' 'speech' 'done'), .stop() (finish now,
//                               keeping what was heard) and .abort(). G.speech.stop() / .abort() act on the current one.
// G.speech.match(target, alts)  -> {pass, score 0..1, heard (the transcript that scored best), i (its index)}. Pure.
// G.speech.gestureTap(zone, fn, {key, codes})  runs fn(event) INSIDE the input event when a tap lands in zone() (a
//                               game-px rect, or null when not armed), or when an A key (Z / Space / Enter; or the key
//                               codes listed, e.g. ['KeyV']) goes down while key() is true. Returns {off()}. Start
//                               listening from fn, not from a scene's update():
//
// Why gestureTap: on iPad / iPhone Safari (webkitSpeechRecognition, iOS 14.5+, needs Siri & Dictation turned on),
// start() only works inside a user gesture, like speech and audio. The game reads taps in update() on the next
// animation frame, after the touch event is over, so a start() there can fail with 'not-allowed' (or do nothing).
// gestureTap applies the game's tap rule (moved < 12 px, lifted within 0.8 s, began on the picture after the scene's
// grace time) to the raw touchend / mouse pointerup / keydown and calls fn right there. The same tap still reaches the
// scene as a normal G.input.tap() on the next frame, so the scene picks up what fn started (see src/mictest.js).
// Desktop Chrome doesn't need this but doesn't mind; a scene can still call listen() from update() as a fallback.
//
// Sharing the audio with the game's voice and music (iOS has one audio session; the mic switches it to recording):
// before listening, speech synthesis is stopped (G.hush also drops a line still waiting to start or to retry) and
// the music is turned down to 0 so the mic doesn't hear it; afterwards the music comes back, the AudioContext is
// resumed (iOS can leave it 'interrupted'), speech synthesis is resumed, and the next tap or key resumes the audio
// again and re-primes speech with a silent line, inside that gesture. The mic test asks a grown-up whether the voice
// was still heard after the mic, a known iPhone problem.
// Also seen on iOS: the first start() on a page asks for the mic (Safari may ask again on later visits, every time
// for a file:// page), and confidence often comes back as 0 (the mic test shows '-').
// iOS doesn't always honour single-shot listening, so: after a final result we stop(); after an interim result and
// 1.2 s with nothing new we stop(); at the timeout we stop(); and if 'end' never comes we resolve anyway.
'use strict';
(function () {
  const W = typeof window !== 'undefined' ? window : {};
  const S = G.speech = {};
  const now = () => (W.performance ? W.performance.now() : Date.now());

  // ---------- Matching what was heard ----------
  // Learner-friendly: lowercase, no accents, no ¿¡ or punctuation, digits as words ("3" = tres); then sounds a
  // beginner (and a recognizer) mixes up are folded together: v=b, z/ce/ci=s, ll=y, silent h (not ch), ñ=n,
  // qu/c(a,o,u)=k, rr=r. Score = 1 - levenshtein / longer length, over the whole transcript and over every run of
  // words up to the target's length + 1 (so "la manzana" contains "manzana", and "porfavor" is "por favor").
  // A target can list forms: 'rojo / roja', and 'la manzana' also counts as 'manzana'. Best alternative wins.
  // PASS at 0.75. The first plan was 0.6, but then 'banana' passes for 'manzana' (0.71). Checked in
  // tools/test-speech.js: every listed must-pass scores >= 0.85 ('gracia' 0.86, 'buenas días' 0.9, the rest fold to
  // 1.0) and every must-fail <= 0.71. In short words one wrong sound is a MISS: 'dos'/'tos' is 0.67.
  S.PASS = 0.75; S.CLOSE = 0.5;
  const NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  S.norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').map(w => NUM[+w] && /^\d+$/.test(w) ? NUM[+w] : w).join(' ');
  S.fold = w => w.replace(/ch/g, '\u0001').replace(/h/g, '').replace(/ll/g, 'y').replace(/v/g, 'b').replace(/qu/g, 'k')
    .replace(/c(?=[eiy])/g, 's').replace(/z/g, 's').replace(/c/g, 'k').replace(/rr/g, 'r').replace(/\u0001/g, 'ch');
  S.lev = function (a, b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (v, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  };
  const sim = (a, b) => a && b ? 1 - S.lev(a, b) / Math.max(a.length, b.length) : 0;
  const words = s => { const n = S.norm(s); return n ? n.split(' ').map(S.fold) : []; };
  function forms(target) { // 'la manzana' -> [['la','mansana'], ['mansana']]
    const out = [];
    String(target == null ? '' : target).split('/').forEach(f => {
      const w = words(f); if (!w.length) return;
      out.push(w);
      if (w.length > 1 && /^(el|la|los|las|un|una|unos|unas)$/.test(w[0])) out.push(w.slice(1));
    });
    return out;
  }
  // score of one transcript against the target (0..1)
  S.score = function (target, transcript) {
    const fs = forms(target), ws = words(transcript); let best = 0;
    for (const f of fs) {
      const t = f.join('');
      for (let len = 1; len <= Math.min(ws.length, f.length + 1); len++)
        for (let k = 0; k + len <= ws.length; k++) best = Math.max(best, sim(t, ws.slice(k, k + len).join('')));
      if (ws.length) best = Math.max(best, sim(t, ws.join('')));
    }
    return best;
  };
  // alternatives: [{transcript, confidence}] or strings (or one string)
  S.match = function (target, alternatives) {
    const list = alternatives == null ? [] : Array.isArray(alternatives) ? alternatives : [alternatives];
    let best = { pass: false, score: 0, heard: '', i: -1 };
    list.forEach((a, i) => {
      const tr = a && typeof a === 'object' ? a.transcript : a, sc = S.score(target, tr);
      if (best.i < 0 || sc > best.score) best = { pass: false, score: sc, heard: String(tr).trim(), i };
    });
    best.pass = best.score >= S.PASS;
    return best;
  };
  S.grade = score => score >= S.PASS ? 'PASS' : score >= S.CLOSE ? 'CLOSE' : 'MISS';

  // ---------- What this browser has ----------
  const SR = () => W.SpeechRecognition || W.webkitSpeechRecognition || null;
  S.supported = () => !!SR();
  S.device = function () { // short: 'iPad Safari 17.4', 'Mac Chrome 128'
    const nav = W.navigator || {}, ua = nav.userAgent || '';
    const os = /iPad/.test(ua) || (/Macintosh/.test(ua) && nav.maxTouchPoints > 1) ? 'iPad' : /iPhone|iPod/.test(ua) ? 'iPhone'
      : /Android/.test(ua) ? 'Android' : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '?';
    const NAME = { CriOS: 'Chrome', FxiOS: 'Firefox', EdgiOS: 'Edge', Edg: 'Edge', EdgA: 'Edge', OPR: 'Opera', SamsungBrowser: 'Samsung' };
    let m = /(CriOS|FxiOS|EdgiOS|EdgA|Edg|OPR|SamsungBrowser|Firefox|Chrome)\/(\d+)/.exec(ua), br;
    if (m) br = (NAME[m[1]] || m[1]) + ' ' + m[2];
    else if ((m = /Version\/([\d.]+).*Safari/.exec(ua))) br = 'Safari ' + m[1];
    else br = /Safari/.test(ua) ? 'Safari' : '?';
    const ios = /OS (\d+)_(\d+)[_ ]/.exec(ua);
    return os + (ios && /iP/.test(os) ? ' ' + ios[1] + '.' + ios[2] : '') + ' ' + br;
  };
  S.info = () => ({ api: W.SpeechRecognition ? 'SpeechRecognition' : W.webkitSpeechRecognition ? 'webkitSpeechRecognition' : null, device: S.device() });

  // ---------- Sharing the audio (see the notes at the top) ----------
  let ducked = null, afterMic = false;
  function quiet() {
    try { if (G.hush) G.hush(); else if (W.speechSynthesis) W.speechSynthesis.cancel(); } catch (e) { }
    const A = G.audio; if (A && A.master && ducked == null) { ducked = A.master.gain.value || 0.8; A.master.gain.value = 0; }
    afterMic = false;
  }
  function wakeAudio() {
    const ac = G.audio && G.audio.ctx;
    try { if (ac && ac.state !== 'running' && ac.state !== 'closed') { const p = ac.resume(); if (p && p.catch) p.catch(() => { }); } } catch (e) { }
  }
  function unquiet() {
    const A = G.audio; if (A && A.master && ducked != null) A.master.gain.value = A.muted ? 0 : ducked;
    ducked = null; wakeAudio(); G.micEndedAt = performance.now();
    try { W.speechSynthesis && W.speechSynthesis.resume(); } catch (e) { }
    afterMic = true; // the next tap or key wakes the audio and re-primes speech, inside that gesture
  }
  function reprime() {
    try {
      const ss = W.speechSynthesis; if (!ss || ss.speaking || ss.pending) return;
      const u = new W.SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'es-MX'; ss.resume(); ss.speak(u);
    } catch (e) { }
  }

  // ---------- Listening ----------
  let sess = null; // the Wait of the recognition in progress
  S.listening = () => !!sess;
  S.stop = () => { if (sess) sess.stop(); };
  S.abort = () => { if (sess) sess.abort(); };
  S.listen = function (o) {
    o = Object.assign({ lang: 'es-MX', alts: 5, timeout: 8000 }, o || {});
    const w = new G.Wait(), t0 = now(), Rec = SR();
    w.phase = 'starting'; w.during = (W.event && W.event.type) || 'frame';
    let rec = null, got = null, err = null, heard = false, timedOut = false, tm = null, hush = null, endT = null;
    const finish = r => {
      if (w.fin) return;
      clearTimeout(tm); clearTimeout(hush); clearTimeout(endT);
      if (sess === w) { sess = null; unquiet(); }
      w.phase = 'done';
      w.resolve({ ok: !!r.ok, alternatives: r.alternatives || [], error: r.ok ? null : (r.error || 'error'), ms: Math.round(now() - t0), during: w.during });
    };
    const result = () => got ? { ok: true, alternatives: got } : { error: err || (timedOut ? 'timeout' : heard ? 'no-match' : 'no-speech') };
    const settle = ms => { clearTimeout(endT); endT = setTimeout(() => { try { rec && rec.abort(); } catch (e) { } finish(result()); }, ms); };
    w.stop = () => { if (w.fin) return; try { rec && rec.stop(); } catch (e) { } settle(1500); };
    w.abort = () => { if (w.fin) return; try { rec && rec.abort(); } catch (e) { } err = err || 'aborted'; finish(result()); };
    if (!Rec) { finish({ error: 'unsupported' }); return w; }
    hook(); if (sess) sess.abort();
    sess = w; quiet();
    try {
      rec = new Rec();
      rec.lang = o.lang; rec.maxAlternatives = o.alts; rec.interimResults = false; rec.continuous = false;
      rec.onstart = rec.onaudiostart = () => { if (w.phase === 'starting') w.phase = 'listening'; };
      rec.onspeechstart = () => { heard = true; w.phase = 'speech'; };
      rec.onresult = e => {
        const rs = e && e.results; if (!rs || !rs.length) return;
        const r = rs[rs.length - 1], alts = [];
        for (let i = 0; i < r.length; i++) if (r[i] && r[i].transcript != null) alts.push({ transcript: String(r[i].transcript).trim(), confidence: +r[i].confidence || 0 });
        if (alts.some(a => a.transcript)) { got = alts; heard = true; }
        clearTimeout(hush);
        if (r.isFinal === false) hush = setTimeout(() => w.stop(), 1200); // iOS: interim results and no end
        else w.stop();
      };
      rec.onnomatch = () => { err = err || 'no-match'; };
      rec.onerror = e => { err = (e && e.error) || 'error'; settle(1500); };
      rec.onend = () => finish(result());
      rec.start();
    } catch (e) {
      const n = e && e.name;
      finish({ error: n === 'NotAllowedError' ? 'not-allowed' : n === 'InvalidStateError' ? 'busy' : 'start-failed' });
      return w;
    }
    tm = setTimeout(() => { timedOut = true; w.stop(); }, o.timeout);
    return w;
  };

  // ---------- Starting things inside the real tap (see the notes at the top) ----------
  const A_KEYS = ['KeyZ', 'Space', 'Enter', 'NumpadEnter', 'KeyJ'];
  const TAP_MOVE = 12, TAP_MS = 800; // the same tap rule as core.js
  const zones = [];
  let hooked = false, down = null;
  const inR = (x, y, r) => !!r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
  function gameXY(cx, cy) { const b = G.canvas.getBoundingClientRect(); return [(cx - b.left) * G.W / b.width, (cy - b.top) * G.H / b.height]; }
  function press(cx, cy, id, touch) { const [x, y] = gameXY(cx, cy); return { x, y, id, touch, t: now(), ready: G.input.ready() }; }
  function fire(e, x, y, d, code) { // x == null: a key (code); else a tap that went down at d and lifted at x, y
    for (let i = zones.length - 1; i >= 0; i--) { // newest first
      const z = zones[i]; let hit = false;
      try { const r = x == null ? null : z.zone(); hit = x == null ? (z.codes || A_KEYS).includes(code) && !!(z.key && z.key()) : inR(x, y, r) && inR(d.x, d.y, r); } catch (er) { }
      if (hit) { try { z.fn(e); } catch (er) { console.error(er); } return true; }
    }
    return false;
  }
  function lift(e, cx, cy) {
    const d = down, [x, y] = gameXY(cx, cy); down = null;
    return d.ready && Math.hypot(x - d.x, y - d.y) <= TAP_MOVE && now() - d.t <= TAP_MS && fire(e, x, y, d);
  }
  function after(fired) { if (!fired && afterMic && !sess) { afterMic = false; wakeAudio(); reprime(); } }
  function hook() {
    if (hooked || !W.addEventListener) return; hooked = true;
    const o = { capture: true, passive: true };
    W.addEventListener('touchstart', e => { const t = e.changedTouches[e.changedTouches.length - 1]; if (e.target === G.canvas && t) down = press(t.clientX, t.clientY, t.identifier, true); }, o);
    W.addEventListener('touchend', e => {
      const t = down && down.touch && Array.from(e.changedTouches).find(t => t.identifier === down.id);
      after(t ? lift(e, t.clientX, t.clientY) : false);
    }, o);
    W.addEventListener('touchcancel', () => { down = null; }, o);
    // mouse and pen; a finger is handled at touchend (Safari's gesture for a touch)
    W.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && e.target === G.canvas && e.button === 0) down = press(e.clientX, e.clientY, e.pointerId, false); }, o);
    W.addEventListener('pointerup', e => {
      if (e.pointerType === 'touch') return;
      after(down && !down.touch && e.pointerId === down.id ? lift(e, e.clientX, e.clientY) : false);
    }, o);
    W.addEventListener('keydown', e => { after(!e.repeat && !G.textInput && fire(e, null, null, null, e.code)); }, o);
  }
  S.gestureTap = function (zone, fn, opts) {
    const z = { zone: zone || (() => null), fn, key: opts && opts.key, codes: opts && opts.codes };
    zones.push(z); hook();
    return { off() { const i = zones.indexOf(z); if (i >= 0) zones.splice(i, 1); } };
  };
})();
