// ===== Speaking for bonus stars: the kids' mic button on questions and on the "¡Palabra nueva!" card =====
// Speaking out loud is only ever a bonus: tapping always works, a miss costs nothing, and nothing is grammar-checked.
//   G.mic.on()                  mic buttons show: speech recognition here, the grown-ups' "Speaking (mic)" switch on
//                               (G.prefs.mic, per device, on unless turned off) and not blocked this session
//   G.mic.target(choice)        what a choice sounds like: its label plus every form of its word ('rojo / roja', ...)
//   G.mic.best(targets, alts, prefer)  the index of the best PASSING target (G.speech.match), or -1; a tie goes to prefer
//   G.mic.award(id, x, y)       a speaking star: words[id].said++, the speaking-star total and a star that flies from x, y
//   new G.MicBtn(scene, o)      the button. o: {rect() (its tap area, game px), ready() (may listen now),
//                               heard(alternatives) (the scene decides: right, wrong or G.MicBtn#miss())}.
//                               Scene calls: onEnter -> arm(), onExit -> off(), update -> if (mic.update()) return,
//                               draw -> mic.draw(ctx). The V key (and a tap on it) listens; a tap on it again stops.
// Listening starts INSIDE the tap or key press (G.speech.gestureTap: iOS Safari only lets a gesture start the mic),
// with the update() fallback for the on-screen pad, like src/mictest.js. G.speech.listen stops the voice first and
// brings the audio back after. A tap anywhere else while listening stops listening and is a normal tap.
// No speech, an error or no match: the button shows a listening ear and "¡Otra vez!", and the child can try again.
// A blocked mic ('not-allowed' and the like) hides every mic button until the grown-ups' switch is turned on again.
'use strict';
(function () {
  const M = G.mic = {};
  const OPTS = { lang: 'es-MX', alts: 5, timeout: 7000 };
  const BLOCK = ['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture', 'unsupported'];
  M.blocked = false;
  M.on = () => !!G.speech && G.speech.supported() && G.prefs.mic !== false && !M.blocked;
  M.target = c => { const w = c && c.word && G.data.words[c.word]; return [c && c.label, w && w.es].filter(Boolean).join(' / ') || null; };
  M.best = function (targets, alts, prefer) {
    let k = -1, sc = 0;
    targets.forEach((t, i) => {
      if (!t) return;
      const m = G.speech.match(t, alts);
      if (m.pass && (m.score > sc || (m.score === sc && i === prefer))) { k = i; sc = m.score; }
    });
    return k;
  };
  M.award = function (id, x, y) {
    G.st.said(id);
    G.audio.sfx('micstar');
    G.fx.ring(x, y, 26, '#70e0ff', 22);
    for (let i = 0; i < 3; i++) G.fx.twinkle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20);
    G.fx.flyStar(x, y, 10, true);
  };

  // ---------- pictures: the mic, the ear, sound waves ----------
  const MIC = ['..wwww..', '.wgwwww.', '.wgwwww.', '.wgwwww.', '.wgwwww.', '.wwwwww.', '..wwww..', 'w......w', 'w......w', '.w....w.', '..wwww..', '...ww...', '...ww...', '.wwwwww.'];
  const EAR = ['..oooo...', '.oSSSSo..', 'oSSssSSo.', 'oSsoooSSo', 'oSo...oSo', 'oSSo..oSo', '.oSSooSSo', '..oSSSSo.', '...oSSo..', '..oSSo...', '.oSSo....', '.oSo.....', '..o......'];
  const sprites = () => ({
    mic: G.sprite('mic_glyph', MIC, { w: '#f8f8ff', g: '#c8d8ff' }),
    micD: G.tinted(G.sprite('mic_glyph', MIC, { w: '#f8f8ff', g: '#c8d8ff' }), '#401020', 'mic_glyph'),
    ear: G.sprite('mic_ear', EAR, { o: '#5a2810', S: '#f8c8a0', s: '#e09878' }),
  });
  function star(ctx, x, y, r) { // a gold star centred on x, y (like the Hoy card's)
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 2.5; ctx.strokeStyle = '#5a2c04'; ctx.stroke();
    ctx.fillStyle = '#fff070'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#f8c020'; ctx.fillRect(x - r, y + r * 0.05, r * 2, r); ctx.restore();
  }
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

  // ---------- the button ----------
  G.MicBtn = class {
    constructor(scene, o) { this.s = scene; this.o = o; this.t = 0; this.l = null; this.started = null; this.sad = 0; this.done = false; this.pop = 0; }
    shown() { return M.on() || !!this.l; }
    can() { return M.on() && !this.l && !this.done && G.top() === this.s && this.o.ready(); }
    arm() { if (!this.z) this.z = G.speech.gestureTap(() => this.can() ? this.o.rect() : null, () => { this.started = this.go(); }, { key: () => this.can(), codes: ['KeyV'] }); }
    off() { if (this.z) { this.z.off(); this.z = null; } if (this.l) { this.l.abort(); this.l = null; } }
    reset() { if (this.l) this.l.abort(); this.l = null; this.started = null; this.sad = 0; this.done = false; }
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
          this.l = null; const res = l.result;
          if (res.ok && res.alternatives.length) this.o.heard(res.alternatives);
          else { if (BLOCK.includes(res.error)) M.blocked = true; else if (res.error !== 'aborted') this.miss(); }
          return true;
        }
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
      if (this.done) { // said it: a gold star with sound waves
        star(ctx, x, cy + 1, rad - 4);
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
