// ===== Speaking: the kids' mic button on questions, on the gold word card, on the word bubble and Canelo's menu =====
// Saying a word out loud is the best way to grow its card (cards.js: its plant grows most, with sound waves), but it is
// never needed: tapping always works, a miss costs nothing, and nothing is grammar-checked.
//   G.mic.on()                  mic buttons show: speech recognition here, the grown-ups' "Speaking (mic)" switch on
//                               (G.prefs.mic, per device, on unless turned off) and not blocked this session
//   G.mic.target(choice)        what a choice sounds like: its label plus every form of its word ('rojo / roja', ...)
//                               and the word's `alt` forms (data.js, Round B: 'patito' for el pato)
//   G.mic.best(targets, alts, prefer)  the index of the best PASSING target (G.speech.match), or -1; a tie goes to prefer
//   G.mic.award(id, x, y)       said it: words[id].said++ (still counted as a speaking star, for the grown-ups and the
//                               diploma), its card pops up at x, y and grows the most (cards.js)
//   new G.MicBtn(scene, o)      the button. o: {rect() (its tap area, game px), ready() (may listen now),
//                               heard(alternatives) (the scene decides: right, wrong or G.MicBtn#miss()), nohear(res)
//                               (optional: nothing heard or an error; return true to take it quietly, no "¡Otra vez!")}.
//                               Scene calls: onEnter -> arm(), onExit -> off(), update -> if (mic.update()) return,
//                               draw -> mic.draw(ctx). The V key (and a tap on it) listens; a tap on it again stops.
// Listening starts INSIDE the tap or key press (G.speech.gestureTap: iOS Safari only lets a gesture start the mic),
// with the update() fallback for the on-screen pad, like src/mictest.js. G.speech.listen stops the voice first and
// brings the audio back after. A tap anywhere else while listening stops listening and is a normal tap.
// No speech, an error or no match: the button shows a listening ear and "¡Otra vez!", and the child can try again.
// A refusal ('not-allowed' and the like) never hides the mic: iPad Safari refuses now and then (the audio still busy
// with the voice, a start it didn't count as the tap) while the mic test works fine, and hiding the buttons made the
// mic vanish from the game for good. The child just gets "¡Otra vez!"; the last errors are kept on the device
// (M.errors, shown in the grown-ups menu and in the mic test's shared log) so a grown-up can see what went wrong.
// Every try's outcome is kept on the device too (M.tries: heard something, or the error; the last 12; the mic test's
// tries as well), so the grown-ups' Learning page can say when speaking has stopped working (AUDIT 2.8, M18):
//   G.mic.note(res)   a finished try (a G.speech.listen result; 'aborted' isn't a try)
//   G.mic.status()    {st: 'ok' (heard her at least once lately), 'unknown' (no try that heard anything yet), 'unavailable'
//                     (the last 3-5 tries all failed: an error from the recognizer itself, not just nothing said),
//                     'off' (the grown-ups' switch), 'unsupported' (no speech recognition here); n: the failed tries,
//                     e: the last error, okAt: when it last heard her (ms)}
'use strict';
(function () {
  const M = G.mic = {};
  const OPTS = { lang: 'es-MX', alts: 5, timeout: 7000 };
  const ERR_KEY = 'spanishclub_micerrors';
  M.blocked = false; // kept for older code; nothing sets it any more
  M.errors = G.store.get(ERR_KEY) || [];
  M.logError = function (res) {
    const d = new Date();
    M.errors.push({ error: res.error, during: res.during, at: d.toISOString().slice(0, 16).replace('T', ' ') });
    M.errors = M.errors.slice(-10); G.store.set(ERR_KEY, M.errors);
  };
  const TRY_KEY = 'spanishclub_mictries';
  M.tries = G.store.get(TRY_KEY) || [];
  M.SOFT = ['no-speech', 'no-match', 'aborted']; // (not the recognizer failing: nothing said, or nothing it knew)
  M.note = function (res) {
    if (!res || res.error === 'aborted') return;
    M.tries.push(res.ok ? { ok: 1, at: G.now() } : { e: res.error || 'error', at: G.now() });
    M.tries = M.tries.slice(-12); G.store.set(TRY_KEY, M.tries);
  };
  M.status = function () {
    if (!G.speech || !G.speech.supported()) return { st: 'unsupported' };
    if (G.prefs.mic === false) return { st: 'off' };
    const T = Array.isArray(M.tries) ? M.tries : [], last = T.slice(-5), ok = T.filter(t => t && t.ok), okAt = ok.length ? ok[ok.length - 1].at : null;
    if (last.length >= 3 && last.every(t => t && !t.ok && M.SOFT.indexOf(t.e) < 0)) return { st: 'unavailable', n: last.length, e: last[last.length - 1].e, okAt };
    return { st: okAt ? 'ok' : 'unknown', okAt };
  };
  M.on = () => !!G.speech && G.speech.supported() && G.prefs.mic !== false && !M.blocked;
  M.target = c => { const w = c && c.word && G.data.words[c.word]; return [c && c.label, w && w.es, w && w.alt].filter(Boolean).join(' / ') || null; };
  M.best = function (targets, alts, prefer) {
    let k = -1, sc = 0;
    targets.forEach((t, i) => {
      if (!t) return;
      const m = G.speech.match(t, alts);
      if (m.pass && (m.score > sc || (m.score === sc && i === prefer))) { k = i; sc = m.score; }
    });
    return k;
  };
  M.award = function (id, x, y, o) { // (o.cued: said right after hearing it, e.g. on the gold card: the history's echo)
    if (G.cards) G.cards.at(x, y); // its card pops up here and grows the most (cards.js)
    G.st.said(id, o);
    G.audio.sfx('micstar');
    G.fx.ring(x, y, 26, '#70e0ff', 22);
    for (let i = 0; i < 3; i++) G.fx.twinkle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20);
  };

  // ---------- pictures: the mic, the ear, sound waves ----------
  const MIC = ['..wwww..', '.wgwwww.', '.wgwwww.', '.wgwwww.', '.wgwwww.', '.wwwwww.', '..wwww..', 'w......w', 'w......w', '.w....w.', '..wwww..', '...ww...', '...ww...', '.wwwwww.'];
  const EAR = ['..oooo...', '.oSSSSo..', 'oSSssSSo.', 'oSsoooSSo', 'oSo...oSo', 'oSSo..oSo', '.oSSooSSo', '..oSSSSo.', '...oSSo..', '..oSSo...', '.oSSo....', '.oSo.....', '..o......'];
  const sprites = () => ({
    mic: G.sprite('mic_glyph', MIC, { w: '#f8f8ff', g: '#c8d8ff' }),
    micD: G.tinted(G.sprite('mic_glyph', MIC, { w: '#f8f8ff', g: '#c8d8ff' }), '#401020', 'mic_glyph'),
    ear: G.sprite('mic_ear', EAR, { o: '#5a2810', S: '#f8c8a0', s: '#e09878' }),
  });
  // a small word card with a sprout, centred on x, y (r: about half its height): "said it, its card grew"
  M.cardGlyph = function (ctx, x, y, r) {
    const h = Math.max(8, Math.round(r * 2)), w = Math.round(h * 0.7), X = Math.round(x - w / 2), Y = Math.round(y - h / 2);
    ctx.fillStyle = '#10102a'; ctx.fillRect(X - 1, Y - 1, w + 2, h + 2);
    ctx.fillStyle = '#f0c030'; ctx.fillRect(X, Y, w, h); ctx.fillStyle = '#fff8e0'; ctx.fillRect(X + 1, Y + 1, w - 2, h - 2);
    const cx = X + (w >> 1), by = Y + h - 2, sh = Math.max(3, Math.round(h * 0.45));
    ctx.fillStyle = '#b0582c'; ctx.fillRect(cx - 2, by - 1, 5, 2);
    ctx.fillStyle = '#3c9a3c'; ctx.fillRect(cx, by - sh, 1, sh);
    ctx.fillStyle = '#58c048'; ctx.fillRect(cx - 2, by - sh + 1, 2, 1); ctx.fillRect(cx + 1, by - sh, 2, 1); ctx.fillRect(cx - 2, by - sh + 3, 2, 1);
  };
  const disc = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  // sound waves: n arcs on each side of x, y (a = 0..1 how far out they've gone)
  M.waves = function (ctx, x, y, r, col, n = 2, t = 0) {
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const rr = r + i * 4 + (t % 12) / 4;
      ctx.strokeStyle = col; ctx.globalAlpha = (1 - i / n) * 0.9;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x, y, rr, s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  };
  // a small mic (the Cuaderno's mark for a word said out loud, the Diploma)
  M.glyph = function (ctx, x, y, col = '#2a8a9a') {
    ctx.fillStyle = col;
    ctx.fillRect(x + 2, y, 3, 5); ctx.fillRect(x + 1, y + 1, 5, 3);
    ctx.fillRect(x, y + 3, 1, 2); ctx.fillRect(x + 6, y + 3, 1, 2); ctx.fillRect(x + 1, y + 5, 5, 1); ctx.fillRect(x + 3, y + 6, 1, 1); ctx.fillRect(x + 1, y + 7, 5, 1);
  };

  // Space talks while the screen on top has a mic that can listen (core.js maps it to 'V' then, else to A)
  G.spaceTalks = () => { const s = G.top(), m = s && s.mic; return !!(m && m.shown() && (m.can() || m.l || m.started)); };

  // ---------- the button ----------
  G.MicBtn = class {
    constructor(scene, o) { this.s = scene; this.o = o; this.t = 0; this.l = null; this.started = null; this.sad = 0; this.done = false; this.pop = 0; }
    shown() { return M.on() || !!this.l; }
    can() { return M.on() && !this.l && !this.done && G.top() === this.s && this.o.ready(); }
    arm() { if (!this.z) this.z = G.speech.gestureTap(() => this.can() ? this.o.rect() : null, e => { this.started = this.go(); this.ptt = !!e && e.code === 'Space'; }, { key: () => this.can(), codes: ['KeyV', 'Space'] }); }
    off() { if (this.z) { this.z.off(); this.z = null; } if (this.l) { this.l.abort(); this.l = null; } }
    reset() { if (this.l) this.l.abort(); this.l = null; this.started = null; this.ptt = false; this.sad = 0; this.done = false; }
    go() { this.sad = 0; return G.speech.listen(OPTS); } // inside the gesture when possible
    begin(l) { this.l = l; this.lt = 0; }
    stop() { if (this.l) { this.l.abort(); this.l = null; } }
    listening() { return !!this.l; }
    miss() { this.sad = 70; G.audio.sfx('huh'); const r = this.o.rect(); G.fx.say('¡Otra vez!', r.x + r.w / 2, r.y - 8, '#a8e8ff'); }
    win() { this.done = true; this.pop = 12; }
    // -> true when it used this frame's input (the scene does nothing else this frame)
    update() {
      this.t++; if (this.sad > 0) this.sad--; if (this.pop > 0) this.pop--;
      if (this.started) { const l = this.started; this.started = null; this.begin(l); return true; }
      const r = this.o.rect();
      if (this.l) {
        this.lt++;
        const l = this.l;
        if (l.done()) {
          this.l = null; const res = l.result; M.note(res);
          if (res.ok && res.alternatives.length) this.o.heard(res.alternatives);
          else if (res.error !== 'aborted') { if (res.error && res.error !== 'no-speech' && res.error !== 'no-match') M.logError(res); if (!(this.o.nohear && this.o.nohear(res))) this.miss(); } // (o.nohear: the scene takes it quietly, e.g. "say it first": the cards just appear)
          return true;
        }
        // push-to-talk: letting go of Space finishes with what was heard (a quick press just starts it, like a tap)
        if (this.ptt && !G.input.h('V')) { this.ptt = false; if (this.lt > 15) { l.stop(); return true; } }
        if (G.tapIn(r) || G.input.p('V')) { l.stop(); return true; } // done talking: finish with what was heard
        if (G.input.tap() || G.input.p('A') || G.input.p('B')) this.stop(); // a tap anywhere else is a normal tap
        return false;
      }
      if (!this.shown()) return false;
      if (G.tapIn(r) || G.input.p('V')) { // the gesture didn't start it (say, the on-screen pad): try from here
        if (this.can()) this.begin(this.go());
        else if (this.done && this.o.again) this.o.again();
        return true;
      }
      return false;
    }
    draw(ctx) {
      if (!this.shown()) return;
      const r = this.o.rect(), cx = r.x + r.w / 2, cy = r.y + r.h / 2, L = !!this.l, ph = L ? this.l.phase : '', S = sprites();
      const idle = !L && !this.done && this.can();
      let rad = Math.min(r.w, r.h) / 2 - 2;
      if (L) for (let i = 0; i < 3; i++) { // rings going out while it listens (green once it hears a voice)
        const p = ((this.t + i * 20) % 60) / 60;
        ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = ph === 'speech' ? '#70e070' : '#f8e060'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rad + 2 + p * 12, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const wig = this.sad > 40 ? Math.round(Math.sin(this.sad * 0.9) * 2) : 0;
      const breathe = idle && (this.t % 150) < 24 ? Math.round(Math.sin((this.t % 150) / 24 * Math.PI) * 2) : 0; // "tap me", now and then
      rad += (L ? Math.round(Math.sin(this.t / 5)) : 0) + breathe + (this.pop ? Math.round(this.pop / 4) : 0);
      const x = cx + wig, held = !L && G.input.holding(r.x, r.y, r.w, r.h) > 0;
      const rim = this.done ? '#d8f8ff' : L ? '#ffffff' : held ? '#f8e060' : '#ffb0c8', body = this.done ? '#2890c0' : L ? (ph === 'speech' ? '#30a850' : '#20a0c8') : held ? '#c02850' : '#e85078'; // pink; listening: blue, green when it hears you
      disc(ctx, x, cy + 2, rad + 1, 'rgba(0,0,16,0.45)');
      disc(ctx, x, cy, rad + 1, '#200818');
      disc(ctx, x, cy, rad, rim);
      disc(ctx, x, cy, rad - 2, body);
      ctx.globalAlpha = 0.3; disc(ctx, x - rad * 0.3, cy - rad * 0.38, rad * 0.45, '#ffffff'); ctx.globalAlpha = 1;
      if (this.done) { // said it: a little growing card with sound waves (cards.js)
        M.cardGlyph(ctx, x, cy + 1, rad - 4);
        M.waves(ctx, x, cy, rad + 4, '#70e0ff', 2, this.t >> 1);
      } else if (this.sad && !L) { // didn't catch it: a listening ear
        ctx.drawImage(S.ear, x - 9, cy - 13, 18, 26);
        M.waves(ctx, x - 12, cy, 4, '#ffffff', 1, 0);
      } else {
        ctx.drawImage(S.micD, x - 7, cy - 13, 16, 28); ctx.drawImage(S.mic, x - 8, cy - 14, 16, 28);
        if (idle) M.waves(ctx, x, cy, rad + 4, '#ffd0e0', 1, 0);
      }
    }
  };
})();
