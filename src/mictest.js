// ===== Mic test (for grown-ups): does speech recognition work on this device, and is the voice heard after it? =====
// G.micTest() opens it over whatever is on screen (the grown-ups menu calls it) and returns a G.Wait that resolves when
// it closes; it also works with yield* G.micTest() in a generator. Tap a word: the game says it. Tap the big mic and
// say the word: every guess the recognizer made is shown with its confidence and match score, then PASS / CLOSE / MISS
// (G.speech.match). Then the game speaks again and asks whether that was heard (on some iPhones the voice goes quiet
// after the mic). Every try is kept in localStorage 'spanishclub_mictest' (the last 200): Copy (Share where there's a
// share sheet) and Clear are at the bottom. Grown-ups only, so the labels are English. Keys: arrows pick a word, C says it, Z listens, X closes.
'use strict';
(function () {
  const LOG_KEY = 'spanishclub_mictest', LOG_MAX = 200;
  const WORDS = ['manzana', 'platano', 'hola', 'adios', 'gracias', 'porfavor', 'buenosdias', 'tres', 'dos', 'rojo', 'azul', 'si'];
  const COL = { PASS: '#70e070', CLOSE: '#f8c040', MISS: '#ff7860', ERROR: '#ff7860', dim: '#a8b0d8', yel: '#f8e060' };
  const AFTER = { PASS: '¡Muy bien!', CLOSE: '¡Casi!', MISS: 'Otra vez.', ERROR: 'Otra vez.' }; // said after the mic
  const OPTS = { lang: 'es-MX', alts: 5, timeout: 8000 };
  const HELP = {
    'not-allowed': 'The mic is blocked for this page. Safari: aA > Website Settings > Microphone > Allow. Chrome: the icon left of the address > Microphone.',
    'service-not-allowed': 'Dictation is off. iPad: Settings > General > Keyboard > Enable Dictation. Screen Time can also block Siri & Dictation.',
    'no-speech': 'Nothing was heard. Tap the mic, then say the word right away, close to the device.',
    'no-match': 'Something was heard, but no words came back. Try again, a little louder.',
    'network': 'Network error. Chrome sends the sound to Google to understand it, so it needs the internet.',
    'audio-capture': 'No microphone found, or another app is using it.',
    'aborted': 'Stopped before anything was heard.',
    'timeout': 'Nothing came back in time. Try again, a little louder.',
    'language-not-supported': 'This device can\'t listen in Spanish (es-MX). On iPad, add Spanish (Mexico) as a dictation language.',
    'busy': 'The mic was still busy. Wait a second and try again.',
    'start-failed': 'The mic could not start. Tap the mic button itself.',
  };
  const NO_API = ['Speech recognition is not available here.', 'iPad / iPhone: use Safari, iOS 14.5+.', 'Settings > General > Keyboard >', '   Enable Dictation: on.', 'Screen Time: allow Siri & Dictation.', 'Computer: Chrome, Edge or Safari.'];
  // the mic opened (so it's worth asking whether the voice still works afterwards)
  const opened = r => r.ok || ['no-speech', 'no-match', 'aborted', 'timeout', 'network'].includes(r.error);

  // ---------- The log ----------
  const p2 = n => String(n).padStart(2, '0');
  const stamp = ms => { const d = new Date(ms); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); };
  let ver = 0, memo = null; // stats are drawn every frame: worked out again only after a change
  const save = a => { G.store.set(LOG_KEY, a); ver++; };
  const log = {
    all() { const a = G.store.get(LOG_KEY); return Array.isArray(a) ? a : []; },
    add(e) { const a = log.all(); a.push(e); a.splice(0, Math.max(0, a.length - LOG_MAX)); save(a); return e; },
    update(id, patch) { const a = log.all(), e = a.find(e => e.id === id); if (e) { Object.assign(e, patch); save(a); } },
    clear() { G.store.del(LOG_KEY); ver++; },
    stats() {
      if (memo && memo.ver === ver) return memo.s;
      const a = log.all(), n = v => a.filter(e => e.verdict === v).length, asked = a.filter(e => e.heard != null);
      memo = { ver, s: { n: a.length, pass: n('PASS'), close: n('CLOSE'), miss: n('MISS'), err: n('ERROR'), asked: asked.length, heard: asked.filter(e => e.heard).length } };
      return memo.s;
    },
    text() { // plain text for pasting into a message
      const a = log.all(), info = G.speech.info(), v = G.currentVoice && G.currentVoice(), st = log.stats();
      const L = ['Club de Español mic test: ' + a.length + ' tries (copied ' + stamp(Date.now()) + ')',
        'Device: ' + info.device + ' | API: ' + (info.api || 'none') + ' | voice: ' + (v ? v.name + ' (' + v.lang + ')' : 'none') + ', mode ' + (G.voiceMode || 0),
        'Browser: ' + navigator.userAgent,
        'Summary: ' + st.pass + ' pass, ' + st.close + ' close, ' + st.miss + ' miss, ' + st.err + ' errors; voice heard after the mic ' + st.heard + ' of ' + st.asked, ''];
      a.forEach((e, i) => L.push(['#' + (i + 1), stamp(e.at), e.word, e.verdict, (e.score || 0).toFixed(2), e.ms + 'ms', 'started in ' + e.start,
        'voice after: ' + (e.heard == null ? '-' : e.heard ? 'heard' : 'NOT heard') + (e.tts ? ' (' + e.tts + ')' : ''),
        e.error ? 'error ' + e.error : '', (e.alts || []).map(([t, c]) => '"' + t + '" ' + c).join(', ')].filter(Boolean).join(' | ')));
      return L.join('\n');
    },
  };

  // a small button like G.iconBtn, with a text label
  function textBtn(ctx, r, label, o = {}) {
    const on = o.sel || G.input.holding(r.x, r.y, r.w, r.h) > 0;
    ctx.fillStyle = '#000010'; ctx.fillRect(r.x + 1, r.y, r.w - 2, r.h); ctx.fillRect(r.x, r.y + 1, r.w, r.h - 2);
    ctx.fillStyle = on ? '#f0d060' : '#8898e0'; ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    ctx.fillStyle = on ? '#304cc0' : (o.fill || '#1c2c8c'); ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, 3);
    G.textC(ctx, label, r.x + r.w / 2, r.y + (r.h >> 1) - 3, o.col || '#ffffff');
  }
  function micGlyph(ctx, cx, cy, col) { // capsule, holder, stem, base
    ctx.fillStyle = col;
    ctx.fillRect(cx - 4, cy - 12, 8, 13); ctx.fillRect(cx - 3, cy - 13, 6, 15);
    ctx.fillRect(cx - 8, cy - 4, 2, 5); ctx.fillRect(cx + 6, cy - 4, 2, 5); ctx.fillRect(cx - 7, cy + 1, 2, 2); ctx.fillRect(cx + 5, cy + 1, 2, 2); ctx.fillRect(cx - 5, cy + 3, 10, 2);
    ctx.fillRect(cx - 1, cy + 5, 2, 4); ctx.fillRect(cx - 5, cy + 9, 10, 2);
  }
  const disc = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  const fit = (s, w) => { s = String(s); if (G.textWidth(s) <= w) return s; while (s && G.textWidth(s + '..') > w) s = s.slice(0, -1); return s + '..'; };

  class MicTest {
    constructor(w) {
      this.w = w; this.t = 0; this.wi = 0; this.mode = 'ready'; // ready | listening | after | ask
      this.res = null; this.listen = null; this.started = null; this.note = ''; this.noteT = 0; this.clearT = 0; this.lastCopy = -1e9;
      this.info = G.speech.info(); this.ok = G.speech.supported();
      this.lastV = {}; log.all().forEach(e => { this.lastV[e.word] = e.verdict; }); // last verdict per word (a dot on its card)
    }
    onEnter() {
      G.toastT = 0;
      const top = () => G.top() === this && !this.text, ready = () => top() && this.ok && this.mode === 'ready';
      this.zones = [ // inside the real tap / key press (see speech.js): start the mic, copy to the clipboard
        G.speech.gestureTap(() => ready() ? this.micRect() : null, () => { this.started = this.go(); }, { key: ready }),
        G.speech.gestureTap(() => top() && this.mode === 'ready' ? this.copyRect() : null, () => { this.copied = true; this.copy(); }),
      ];
    }
    onExit() { this.zones.forEach(z => z.off()); if (this.listen) this.listen.abort(); this.hideText(); }
    word() { return WORDS[this.wi]; }
    sayWord() { G.speak(G.baseForm(this.word())); }
    // tap areas (shared with draw)
    cellRect(k) { return { x: 8 + (k % 4) * 77, y: 30 + Math.floor(k / 4) * 26, w: 74, h: 24 }; }
    micRect() { return { x: 10, y: 112, w: 50, h: 50 }; }
    sayXY() { return [290, 112]; }
    copyRect() { return { x: 8, y: 200, w: 66, h: 20 }; }
    clearRect() { return { x: 78, y: 200, w: 52, h: 20 }; }
    askRect() { return { x: 40, y: 58, w: 240, h: 104 }; }
    yesRect() { return { x: 58, y: 124, w: 94, h: 26 }; }
    noRect() { return { x: 168, y: 124, w: 94, h: 26 }; }
    askSayXY() { return [254, 64]; }
    notice(s) { this.note = s; this.noteT = 180; } // a line in the bottom bar
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); }

    go() { this.word0 = this.word(); return G.speech.listen(OPTS); } // inside the gesture when possible
    begin(l) { this.listen = l; this.mode = 'listening'; this.lt = 0; this.res = null; }
    update() {
      this.t++; if (this.noteT > 0) this.noteT--; if (this.clearT > 0) this.clearT--;
      this.watchVoice();
      if (this.text) { if (G.input.p('B') || G.input.p('A')) this.hideText(); return; } // the copy-by-hand panel
      const copied = this.copied; this.copied = false;
      if (this.started) { const l = this.started; this.started = null; this.begin(l); return; }
      if (this.mode === 'listening') return this.updListen();
      if (this.mode === 'after') return this.updAfter();
      if (this.mode === 'ask') return this.updAsk();
      // ready
      if (G.input.p('B') || G.closeHit()) { this.close(); return; }
      if (G.input.p('C') || G.speakerHit(...this.sayXY())) this.sayWord();
      const pick = k => { if (k !== this.wi) { this.wi = k; this.res = null; G.audio.sfx('cursor'); } this.sayWord(); };
      const d = G.input.repDir(14, 6), n = WORDS.length;
      if (d) pick((this.wi + { left: -1, right: 1, up: -4, down: 4 }[d] + n) % n);
      if (G.input.tap()) {
        const k = WORDS.findIndex((id, k) => G.tapIn(this.cellRect(k)));
        if (k >= 0) pick(k);
        if (G.tapIn(this.copyRect()) && !copied) this.copy();
        if (G.tapIn(this.clearRect())) {
          if (this.clearT > 0) { log.clear(); this.lastV = {}; this.clearT = 0; this.notice('Log cleared'); G.audio.sfx('ok'); }
          else { this.clearT = 150; G.audio.sfx('cursor'); }
        }
      }
      if (G.tapIn(this.micRect()) || G.input.p('A')) { // the gesture didn't start it (say, the D-pad's A): try from here
        if (!this.ok) { G.audio.sfx('error'); this.notice('No speech recognition here'); }
        else this.begin(this.go());
      }
    }
    updListen() {
      this.lt++;
      const l = this.listen;
      if (l.done()) { this.finish(l.result); return; }
      if (G.tapIn(this.micRect()) || G.input.p('A')) l.stop(); // finish now with what was heard
      else if (G.input.p('B') || G.closeHit()) l.abort();
    }
    finish(r) {
      const word = this.word0 || this.word(), target = G.data.words[word].es; // every form counts: 'rojo / roja', 'la manzana'
      const m = r.ok ? G.speech.match(target, r.alternatives) : { pass: false, score: 0, heard: '', i: -1 };
      const v = r.ok ? G.speech.grade(m.score) : 'ERROR';
      this.res = { r, m, v, word, scores: r.alternatives.map(a => G.speech.score(target, a.transcript)) };
      this.entry = log.add({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: Date.now(), word, verdict: v, score: +m.score.toFixed(2),
        error: r.error, ms: r.ms, start: r.during, alts: r.alternatives.slice(0, 5).map(a => [a.transcript, +a.confidence.toFixed(2)]),
        heard: null, tts: null, replays: 0, device: this.info.device,
      });
      this.lastV[word] = v; this.listen = null;
      G.audio.sfx(v === 'PASS' ? 'item' : v === 'CLOSE' ? 'ok' : 'error');
      const voice = G.prefs.voice > 0 && !G.audio.muted;
      if (!voice) log.update(this.entry.id, { tts: 'voice off' });
      this.mode = opened(r) && voice ? 'after' : 'ready'; this.at = 0;
    }
    updAfter() { // a moment for the audio to come back, then the game speaks and asks if it was heard
      if (++this.at === 30) { this.spoken = AFTER[this.res.v]; G.voiceStatus = ''; G.speak(this.spoken); this.vw = { id: this.entry.id, t: 0 }; }
      if (this.at >= 54) { this.mode = 'ask'; this.askT = 0; this.ai = 0; }
    }
    watchVoice() { // did speech synthesis report that the line after the mic started? (heard or not is the grown-up's answer)
      const vw = this.vw; if (!vw) return;
      if (G.voiceStatus === 'ok' || ++vw.t > 180) { log.update(vw.id, { tts: G.voiceStatus === 'ok' ? 'started' : 'no start' + (G.voiceStatus ? ' (' + G.voiceStatus + ')' : '') }); this.vw = null; }
    }
    updAsk() {
      this.askT++;
      if (G.input.p('C') || G.speakerHit(...this.askSayXY())) { G.input.eat(); G.speak(this.spoken); this.entry.replays++; log.update(this.entry.id, { replays: this.entry.replays }); return; }
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { this.ai = 1 - this.ai; G.audio.sfx('cursor'); }
      if (this.askT < 15) return;
      if (G.tapIn(this.yesRect())) this.answer(true);
      else if (G.tapIn(this.noRect())) this.answer(false);
      else if (G.input.p('A')) this.answer(this.ai === 0);
      else if (G.input.p('B')) this.answer(null);
    }
    answer(h) { log.update(this.entry.id, { heard: h }); this.mode = 'ready'; G.audio.sfx(h == null ? 'cancel' : 'ok'); if (h != null) this.notice(h ? 'Thanks! Voice OK after the mic' : 'Noted: voice lost after the mic'); }

    // ---------- Copy (inside the tap when possible: Safari only lets a tap copy or share) ----------
    // The share sheet when there is one (iPad: Messages, Mail, Notes, Copy...), else the clipboard, else a text box.
    copy() {
      const now = performance.now(); if (now - this.lastCopy < 500) return; this.lastCopy = now;
      const n = log.all().length; if (!n) { this.notice('Nothing to copy yet'); G.audio.sfx('error'); return; }
      const txt = log.text();
      try {
        if (navigator.share) {
          navigator.share({ title: 'Club de Español mic test', text: txt }).then(() => { this.notice('Shared ' + n + (n === 1 ? ' try' : ' tries')); G.audio.sfx('ok'); },
            e => { if (!(e && e.name === 'AbortError')) this.clip(txt, n); }); // closed the sheet: nothing to do
          return;
        }
      } catch (e) { }
      this.clip(txt, n);
    }
    clip(txt, n) {
      try {
        const cb = navigator.clipboard;
        if (cb && cb.writeText) { cb.writeText(txt).then(() => { this.notice('Copied ' + n + (n === 1 ? ' try' : ' tries')); G.audio.sfx('ok'); }, () => this.showText(txt, 'Copying was blocked. Select the text below and copy it.')); return; }
      } catch (e) { }
      this.showText(txt, 'Select the text below and copy it.');
    }
    showText(txt, why) { // a real text box over the game, for copying by hand
      this.hideText();
      const d = this.text = document.createElement('div'); d.id = 'mictext';
      d.style.cssText = 'position:fixed;inset:0;z-index:20;display:flex;flex-direction:column;gap:8px;padding:12px;box-sizing:border-box;background:rgba(8,12,48,.96);color:#f0f0ff;font:15px monospace';
      const p = document.createElement('div'); p.textContent = why;
      const ta = document.createElement('textarea'); ta.readOnly = true; ta.value = txt;
      ta.style.cssText = 'flex:1;width:100%;box-sizing:border-box;font:12px monospace;background:#000;color:#e8e8f8;border:2px solid #8898e0;user-select:text;-webkit-user-select:text;-webkit-touch-callout:default;touch-action:auto';
      const b = document.createElement('button'); b.textContent = 'Done';
      b.style.cssText = 'align-self:flex-end;font:bold 16px monospace;padding:10px 28px;border-radius:8px;border:2px solid #f0f0ff;background:#304cc0;color:#fff';
      b.addEventListener('click', () => this.hideText());
      d.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.hideText(); }); // let Ctrl/Cmd+C reach the text box
      d.append(p, ta, b); document.body.appendChild(d);
      try { ta.focus(); ta.setSelectionRange(0, txt.length); if (document.execCommand && document.execCommand('copy')) p.textContent = 'Copied. Here is the text too.'; } catch (e) { }
    }
    hideText() { if (this.text) { this.text.remove(); this.text = null; try { G.canvas.focus(); } catch (e) { } } }

    // ---------- Drawing ----------
    draw(ctx) {
      G.win(ctx, 0, 0, G.W, G.H, { alpha: 1 });
      G.text(ctx, 'MIC TEST', 8, 7, COL.yel); G.text(ctx, 'for grown-ups', 8 + G.textWidth('MIC TEST') + 8, 7, COL.dim);
      G.closeBtn(ctx);
      const api = this.info.api || 'no SpeechRecognition';
      G.text(ctx, fit(api + '   ' + OPTS.lang + '   ' + this.info.device, 280), 8, 18, this.ok ? '#c8d0f0' : COL.MISS);
      WORDS.forEach((id, k) => this.drawCell(ctx, k));
      G.win(ctx, 66, 108, 248, 88);
      this.drawMic(ctx);
      this.drawPanel(ctx);
      // bottom bar: copy, clear, and how it has gone so far
      textBtn(ctx, this.copyRect(), navigator.share ? 'Share log' : 'Copy log');
      textBtn(ctx, this.clearRect(), this.clearT > 0 ? 'Sure?' : 'Clear', { fill: this.clearT > 0 ? '#902838' : null });
      const st = log.stats();
      const line = this.noteT > 0 ? this.note : st.n ? st.n + (st.n === 1 ? ' try  ' : ' tries  ') + st.pass + ' pass' + (st.asked ? '  voice ' + st.heard + '/' + st.asked : '') : 'No tries yet';
      G.text(ctx, fit(line, 176), 136, 206, this.noteT > 0 ? COL.yel : COL.dim);
      if (this.mode === 'ask') this.drawAsk(ctx);
    }
    drawCell(ctx, k) {
      const R = this.cellRect(k), id = WORDS[k], sel = k === this.wi, wd = G.data.words[id];
      const on = G.input.holding(R.x, R.y, R.w, R.h) > 0 && this.mode === 'ready';
      G.win(ctx, R.x, R.y, R.w, R.h, sel || on ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { fill1: '#24308a', fill2: '#141c58', alpha: 1 });
      if (sel) { ctx.fillStyle = COL.yel; ctx.fillRect(R.x + 2, R.y + 1, R.w - 4, 1); ctx.fillRect(R.x + 2, R.y + R.h - 2, R.w - 4, 1); ctx.fillRect(R.x + 1, R.y + 2, 1, R.h - 4); ctx.fillRect(R.x + R.w - 2, R.y + 2, 1, R.h - 4); }
      G.drawIcon16(ctx, wd, R.x + 4, R.y + 4);
      const label = G.baseForm(id), col = sel ? COL.yel : '#ffffff';
      if (G.textWidth(label) <= R.w - 30) G.text(ctx, label, R.x + 23, R.y + 9, col);
      else { const [a, ...b] = label.split(' '); G.text(ctx, a, R.x + 23, R.y + 4, col); G.text(ctx, b.join(' '), R.x + 23, R.y + 13, col); }
      const v = this.lastV[id];
      if (v) { ctx.fillStyle = '#000010'; ctx.fillRect(R.x + R.w - 8, R.y + 3, 5, 5); ctx.fillStyle = COL[v]; ctx.fillRect(R.x + R.w - 7, R.y + 4, 3, 3); }
    }
    drawMic(ctx) {
      const r = this.micRect(), cx = r.x + r.w / 2, cy = r.y + r.h / 2, L = this.mode === 'listening';
      const ph = L && this.listen ? this.listen.phase : '';
      if (L) for (let i = 0; i < 3; i++) { // rings going out while it listens (green once it hears a voice)
        const p = ((this.t + i * 20) % 60) / 60;
        ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = ph === 'speech' ? COL.PASS : COL.yel; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 23 + p * 12, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const on = this.mode === 'ready' && G.input.holding(r.x, r.y, r.w, r.h) > 0, rad = 22 + (L ? Math.round(Math.sin(this.t / 5)) : 0);
      disc(ctx, cx, cy + 1, rad + 1, '#000010');
      disc(ctx, cx, cy, rad, !this.ok ? '#606888' : L ? '#f08890' : on ? '#f0d060' : '#8898e0');
      disc(ctx, cx, cy, rad - 2, !this.ok ? '#384060' : L ? '#c83040' : on ? '#304cc0' : '#2a40b0');
      ctx.globalAlpha = 0.25; disc(ctx, cx - 5, cy - 8, 9, '#ffffff'); ctx.globalAlpha = 1;
      micGlyph(ctx, cx + 1, cy + 1, '#000010'); micGlyph(ctx, cx, cy, this.ok ? '#f8f8ff' : '#9098b8');
      if (!this.ok) { ctx.strokeStyle = COL.MISS; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 14); ctx.lineTo(cx + 14, cy + 14); ctx.stroke(); }
      G.textC(ctx, L ? 'STOP' : this.ok ? 'TAP' : 'OFF', cx, r.y + r.h + 6, L ? '#ffb0b8' : COL.dim);
      if (L) G.bar(ctx, r.x + 2, r.y + r.h + 18, r.w - 6, OPTS.timeout / 1000 * 60 - this.lt, OPTS.timeout / 1000 * 60, '#f08890');
    }
    drawPanel(ctx) {
      const x = 74, R = this.res, word = R ? R.word : this.word();
      G.text(ctx, 'Say', x, 121, COL.dim);
      G.bigText(ctx, G.baseForm(word), x + 22 + (G.textWidth(G.baseForm(word)) + 2), 117, 2, COL.yel);
      G.speakerBtn(ctx, ...this.sayXY());
      const line = (s, y, c) => G.text(ctx, s, x, y, c || '#ffffff');
      if (!this.ok) { NO_API.forEach((s, i) => line(s, 138 + i * 9, i ? '#ffffff' : COL.MISS)); return; }
      if (this.mode === 'listening') {
        const ph = this.listen.phase, dots = '...'.slice(0, (this.t >> 4) % 4);
        line(ph === 'speech' ? 'Hearing you' + dots : ph === 'starting' ? 'Starting the mic' + dots : 'Listening' + dots, 140, ph === 'speech' ? COL.PASS : COL.yel);
        line('Say "' + G.baseForm(word) + '" now.', 154);
        line('Tap the mic to stop.', 166, COL.dim);
        return;
      }
      if (!R) {
        (G.touch ? ['1  Tap a word to hear it.', '2  Tap the mic and say it.', '3  See what the device heard.']
          : ['1  Arrows or a click: pick a word.', '   C: hear it again.', '2  Z or the mic: say it.', '3  See what the device heard.']).forEach((s, i) => line(s, 140 + i * 12));
        return;
      }
      // the verdict, then every guess: its confidence and how well it matches
      const v = R.v, cw = G.textWidth(v) + 8;
      ctx.fillStyle = '#000010'; ctx.fillRect(x - 1, 136, cw + 2, 11); ctx.fillStyle = COL[v]; ctx.fillRect(x, 137, cw, 9);
      G.text(ctx, v, x + 4, 138, '#101030', null);
      if (v === 'ERROR') {
        G.text(ctx, R.r.error + '  ' + (R.r.ms / 1000).toFixed(1) + 's', x + cw + 6, 138, COL.MISS);
        G.wrap(HELP[R.r.error] || 'Something went wrong.', 232).slice(0, 4).forEach((s, i) => line(s, 151 + i * 10));
        return;
      }
      G.text(ctx, R.m.score.toFixed(2) + '  ' + (R.r.ms / 1000).toFixed(1) + 's', x + cw + 6, 138, COL[v]);
      G.textR(ctx, 'conf', 266, 138, COL.dim); G.textR(ctx, 'match', 306, 138, COL.dim);
      R.r.alternatives.slice(0, 5).forEach((a, i) => {
        const y = 150 + i * 9, best = i === R.m.i, sc = R.scores[i];
        G.text(ctx, fit((i + 1) + ' "' + a.transcript + '"', 150), x, y, best ? COL.yel : '#ffffff');
        G.textR(ctx, a.confidence ? Math.round(a.confidence * 100) + '%' : '-', 266, y, COL.dim);
        G.textR(ctx, sc.toFixed(2), 306, y, COL[G.speech.grade(sc)]);
      });
    }
    drawAsk(ctx) {
      ctx.fillStyle = 'rgba(0,0,16,0.55)'; ctx.fillRect(0, 0, G.W, G.H);
      const b = this.askRect();
      G.win(ctx, b.x, b.y, b.w, b.h, { alpha: 1 });
      G.textC(ctx, 'After the mic, did you hear', G.W / 2, b.y + 10, '#ffffff');
      G.bigText(ctx, '"' + this.spoken + '"', G.W / 2, b.y + 30, 2, COL.yel);
      G.textC(ctx, 'the game\'s voice say this?', G.W / 2, b.y + 48, '#ffffff');
      G.speakerBtn(ctx, ...this.askSayXY());
      textBtn(ctx, this.yesRect(), 'Yes', { sel: !G.touch && this.ai === 0, fill: '#2a7a3a' });
      textBtn(ctx, this.noRect(), 'No', { sel: !G.touch && this.ai === 1, fill: '#902838' });
      if (!G.touch) G.textC(ctx, 'X: skip', G.W / 2, b.y + b.h - 10, COL.dim);
    }
  }

  G.micTest = function () {
    const w = new G.Wait(); G.push(new MicTest(w));
    w[Symbol.iterator] = function* () { yield w; return w.result; }; // so yield* G.micTest() works too
    return w;
  };
  G.micTest.log = log;
})();
