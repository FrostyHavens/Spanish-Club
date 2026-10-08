// ===== UI: dialogue boxes, list menus, 4-way icon menus, number/confirm prompts =====
'use strict';
(function () {
  // Awaitable handle returned by UI calls; generators can `yield` it.
  class Wait { constructor() { this.fin = false; this.result = undefined; } done() { return this.fin; } resolve(v) { this.result = v; this.fin = true; } }
  G.Wait = Wait;

  // ---------- English (parents' option only) ----------
  // The game teaches like Tunic: no translations by default. Opciones > Inglés turns on an English strip.
  G.enVisible = () => !!(G.state && G.state.opts && G.state.opts.english);
  G.enBox = function (ctx, en, y, top) { // translation strip above (or below) a window
    const lines = G.wrap(en, G.W - 40); const h = lines.length * 11 + 10;
    const yy = top ? y : y - h - 2;
    G.win(ctx, 14, yy, G.W - 28, h, { fill1: '#3a2a10', fill2: '#1c1408' });
    lines.forEach((l, i) => G.text(ctx, l, 22, yy + 6 + i * 11, '#f8e8b0'));
  };

  // ---------- Player name & gendered Spanish ----------
  // {name} becomes the player's name; {boy form/girl form} picks by the chosen character:
  // '¡Bienvenid{o/a}!' -> '¡Bienvenido!' or '¡Bienvenida!'
  G.fill = function (s) {
    if (s == null || !G.st) return s;
    const girl = G.st.isGirl();
    return String(s).replace(/\{name\}/g, G.st.playerName()).replace(/\{([^{}\/]*)\/([^{}]*)\}/g, (m, a, b) => girl ? b : a);
  };

  // ---------- Rich text: words grow from pictures ----------
  // In dialogue, [id] or [id:shown form] marks a vocabulary word. A word the player hasn't learned yet
  // is drawn as its picture plus the word in blue; once learned, the picture drops away and the word is gold.
  const TOK = /\[([a-z0-9]+)(?::([^\]]+))?\]/g;
  const COL = { text: '#ffffff', seen: '#a8d8ff', known: '#f8d860' };
  G.baseForm = id => { const w = G.data.words[id]; return w ? w.es.split(' / ')[0].replace(/^(el|la|los|las) /, '') : id; };
  G.richIds = s => { const out = []; String(s).replace(TOK, (m, id) => { out.push(id); return m; }); return out; };
  G.plain = s => String(s).replace(TOK, (m, id, shown) => shown || G.baseForm(id));
  function items(s) { // -> [{text, id?, gap}]  gap: a space precedes this item (wrapping happens only at gaps)
    const out = []; let gap = false, last = 0, m;
    const text = t => { for (const part of t.split(/(\s+)/)) { if (!part) continue; if (/^\s+$/.test(part)) { gap = true; continue; } out.push({ text: part, gap }); gap = false; } };
    TOK.lastIndex = 0;
    while ((m = TOK.exec(s))) { text(s.slice(last, m.index)); out.push({ text: m[2] || G.baseForm(m[1]), id: m[1], gap }); gap = false; last = TOK.lastIndex; }
    text(s.slice(last));
    return out;
  }
  const known = id => G.st && G.st.knows(id);
  const itemW = it => G.textWidth(it.text) + (it.id && !known(it.id) ? 18 : 0);
  G.richLayout = function (s, maxW) {
    const lines = [{ items: [], w: 0 }];
    for (const p of String(s).split('\n')) {
      if (lines[lines.length - 1].items.length) lines.push({ items: [], w: 0 });
      // chunks: runs of items with no space between them wrap together
      const its = items(p), chunks = [];
      its.forEach(it => { if (it.gap || !chunks.length) chunks.push([it]); else chunks[chunks.length - 1].push(it); });
      for (const ch of chunks) {
        const cw = ch.reduce((a, it) => a + itemW(it), 0);
        let L = lines[lines.length - 1];
        const sp = L.items.length ? 4 : 0;
        if (L.items.length && L.w + sp + cw > maxW) { L = { items: [], w: 0 }; lines.push(L); }
        ch.forEach((it, k) => { it.sp = k === 0 && L.items.length ? 4 : 0; L.items.push(it); L.w += it.sp + itemW(it); });
      }
    }
    lines.forEach(L => { L.chars = L.items.reduce((a, it) => a + it.text.length + (it.id ? 1 : 0), 0); });
    return lines;
  };
  // draw lines[from..from+n) ; chars limits the typewriter reveal; returns nothing
  G.richDraw = function (ctx, lines, x, y, o = {}) {
    const lh = o.lineH || 16, from = o.from || 0, n = o.n || lines.length;
    let chars = o.chars == null ? 1e9 : o.chars;
    for (let i = from; i < Math.min(lines.length, from + n); i++) {
      const L = lines[i]; let cx = o.center ? Math.round(x - L.w / 2) : x; const cy = y + (i - from) * lh;
      for (const it of L.items) {
        if (chars <= 0) return;
        cx += it.sp;
        if (it.id) {
          const k = known(it.id);
          if (!k) { G.drawIcon16(ctx, G.data.words[it.id] || it.id, cx, cy); cx += 18; chars--; }
          const t = it.text.slice(0, Math.max(0, chars)); G.text(ctx, t, cx, cy + 5, k ? COL.known : COL.seen);
        } else G.text(ctx, it.text.slice(0, Math.max(0, chars)), cx, cy + 5, o.color || COL.text);
        chars -= it.text.length; cx += G.textWidth(it.text);
      }
    }
  };

  // ---------- Dialogue ----------
  // G.say(pages, {name, portrait, pos:'bottom'|'top', auto, silent, noVoice}) -> Wait
  // A page is a string or {t: 'Spanish text with [words]', en: 'English (parents option)'}.
  class TextBox {
    constructor(pages, opts, w) {
      this.transparent = true; this.opts = opts || {}; this.w = w;
      this.pages = (Array.isArray(pages) ? pages : [pages]).map(p => typeof p === 'object' ? { t: G.fill(String(p.t)), en: G.fill(p.en) } : { t: G.fill(String(p)) });
      this.pi = 0; this.setPage();
    }
    setPage() {
      const hasP = !!this.opts.portrait;
      this.boxX = hasP ? 70 : 8; this.boxW = G.W - this.boxX - 8;
      const t = this.pages[this.pi].t;
      G.richIds(t).forEach(id => G.st && G.st.see(id));
      this.lines = G.richLayout(t, this.boxW - 18 - (this.opts.noVoice ? 0 : 24)); // room for the speaker button
      this.shown = 0; this.scroll = 0; this.t = 0;
      this.spoke = !!this.opts.noVoice;
    }
    chars(a, b) { return this.lines.slice(a, b).reduce((s, L) => s + L.chars, 0); }
    boxY() { return this.opts.pos === 'top' ? 6 : G.H - 66; }
    spk() { return [this.boxX + this.boxW - 26, this.boxY() + 6]; } // "hear it again" button
    update() {
      this.t++;
      if (!this.spoke) { this.spoke = true; G.speak(G.plain(this.pages[this.pi].t)); }
      if (!this.opts.noVoice && G.speakerHit(...this.spk())) { G.input.eat(); G.speak(G.plain(this.pages[this.pi].t)); }
      if (G.input.p('C')) G.speak(G.plain(this.pages[this.pi].t));
      const go = G.input.p('A') || G.input.p('B') || !!G.input.tap(); // a tap anywhere = A
      const target = this.chars(0, this.scroll + 3);
      if (this.shown < target) { // the typewriter: 2 letters a frame (4 with A held); a tap shows the rest, the next tap goes on
        const sp = G.input.h('A') || G.input.h('B') ? 4 : 2;
        this.shown = Math.min(target, this.shown + sp);
        if (this.t % 4 === 0 && !this.opts.silent) G.audio.sfx('text');
        if (go && this.t > 4) this.shown = target;
        return;
      }
      if (this.opts.auto) { if (this.t > this.opts.auto) this.next(); return; }
      if (go) this.next();
    }
    next() {
      if (this.scroll + 3 < this.lines.length) { this.scroll += 3; this.t = 0; return; }
      this.pi++;
      if (this.pi >= this.pages.length) { G.pop(); this.w.resolve(); return; }
      this.setPage();
    }
    draw(ctx) {
      const top = this.opts.pos === 'top';
      const h = 60, y = this.boxY();
      if (this.opts.portrait) {
        const py = top ? 6 : G.H - 60 - 6;
        G.win(ctx, 6, py, 60, 60);
        G.drawPortrait(ctx, this.opts.portrait, 10, py + 4, this.t);
        const who = this.opts.who; // Round B: their hearts, over the portrait (hearts.js)
        if (who && G.hearts && G.hearts.shows(who)) {
          const hy = top ? py + 61 : py - 11, pl = G.hearts.pulse(who) && (this.t >> 3) & 1;
          G.win(ctx, 6, hy, 60, 12, { fill1: pl ? '#ffe0ec' : '#fff4f8', fill2: '#f8d8e4', alpha: 1 });
          G.hearts.row(ctx, who, 16, hy + 3);
        }
      }
      G.win(ctx, this.boxX, y, this.boxW, h);
      const name = this.opts.name;
      if (name) { const nw = G.textWidth(name) + 14; G.win(ctx, this.boxX + 6, y - 13, nw, 16); G.text(ctx, name, this.boxX + 13, y - 9, '#f8e060'); }
      G.richDraw(ctx, this.lines, this.boxX + 9, y + 6, { from: this.scroll, n: 3, chars: this.shown - this.chars(0, this.scroll) });
      const done = this.shown >= this.chars(0, this.scroll + 3);
      if (done && !this.opts.auto) G.moreArrow(ctx, this.boxX + this.boxW - 16, y + h - 11, this.t);
      if (!this.opts.noVoice) G.speakerBtn(ctx, ...this.spk());
      const en = this.pages[this.pi].en;
      if (en && G.enVisible()) G.enBox(ctx, en, top ? y + h + 2 : y - (name ? 14 : 0), top);
    }
  }
  G.say = function (pages, opts) { const w = new Wait(); G.push(new TextBox(pages, opts, w)); return w; };
  // the bouncing "go on" arrow at the end of a page or card (tap, or A)
  G.moreArrow = function (ctx, x, y, t) {
    y -= Math.round(Math.abs(Math.sin(t / 9)) * 3);
    ctx.fillStyle = '#10102a'; for (let i = 0; i < 4; i++) ctx.fillRect(x + i + 1, y + i + 1, 7 - 2 * i, 1);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i ? '#f8e060' : '#fff8c0'; ctx.fillRect(x + i, y + i, 7 - 2 * i, 1); }
  };

  // ---------- Spoken Spanish (browser speech synthesis; silently skipped if unavailable) ----------
  // Default: a North American voice (Mexico, then the US, then other Latin American), Spain only as a
  // last resort. Opciones > Elegir voz lets a person pick any Spanish voice by ear; that choice wins.
  const VOICE_PREF = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-GT', 'es-CR', 'es-PR', 'es-CU', 'es-DO', 'es-PA', 'es-SV', 'es-HN', 'es-NI', 'es-VE', 'es-PE', 'es-EC', 'es-CL', 'es-AR', 'es-UY', 'es-PY', 'es-BO'];
  G.spanishVoices = function () {
    try { return (window.speechSynthesis.getVoices() || []).filter(v => /^es([-_]|$)/i.test(v.lang)); } catch (e) { return []; }
  };
  function rank(v) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    let i = VOICE_PREF.findIndex(l => l.toLowerCase() === lang);
    if (i < 0) i = lang === 'es-es' ? 100 : 50;
    if (/natural|neural|premium|enhanced|google/i.test(v.name)) i -= 0.5; // nicer-sounding voices first
    return i;
  }
  G.currentVoice = function () {
    const all = G.spanishVoices(), want = G.state && G.state.opts && G.state.opts.voiceName;
    return all.find(v => v.name === want) || all.slice().sort((a, b) => rank(a) - rank(b))[0] || null;
  };
  // Mobile browsers need extra care:
  //  - iOS Safari / Android Chrome only allow speech after it has been started inside a real tap or key
  //    press, so the first one "primes" it with a silent utterance (G.primeSpeech, called from core.js on a key
  //    press, a mouse press or a finger lifting: a finger going down doesn't count as a tap there);
  //  - cancel() immediately followed by speak() often drops the new line, so we wait a moment after cancelling;
  //  - speech can get stuck "paused", so we resume() first; and we keep a reference to the current
  //    utterance so it isn't garbage-collected mid-sentence.
  // Some phones (seen on iPhone) stay silent with no error: a listed voice that isn't really installed, or
  // speech muted while Web Audio music plays. So each line is watched: if it hasn't started after a moment,
  // we retry one step down this ladder and keep the step that works for the rest of this visit (G.voiceMode):
  //   0 = the chosen voice   1 = 0 + pause the music while speaking   2 = another Spanish voice + pause the music
  // Every step names a Spanish voice: with no voice set, iPadOS 15 Safari reads the Spanish with its English
  // voice. The step isn't saved on the device: right after the mic, iOS is slow to hand the audio back, and a
  // late start there used to step down for good. Lines started soon after the mic get longer to begin.
  // G.voiceStatus says what happened last (shown in Opciones) to help track down device problems.
  const MODES = 3;
  G.voiceMode = 0;
  if (G.prefs.voiceMode) G.audio.setPref('voiceMode', 0); // drop a step remembered by older versions
  let current = null, primed = false, timer = null, watch = null, lastCancel = -1e9, pausedMusic = false;
  G.voiceStatus = '';
  G.primeSpeech = function () {
    if (primed) return;
    try {
      const ss = window.speechSynthesis; if (!ss) { G.voiceStatus = 'no speech'; return; }
      primed = true;
      const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'es-MX';
      ss.resume(); ss.speak(u);
      ss.getVoices(); // starts loading the voice list on Android
    } catch (e) { }
  };
  function musicBack() { if (pausedMusic) { pausedMusic = false; try { G.audio.ctx && G.audio.ctx.resume(); } catch (e) { } } }
  function attempt(clean, mode, tries) {
    const ss = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(clean); u.rate = 0.85; u.volume = G.prefs.voice / 10;
    const cur = G.currentVoice(), alt = mode === 2 && G.spanishVoices().filter(o => !cur || o.name !== cur.name).sort((a, b) => rank(a) - rank(b))[0];
    const v = alt || cur;
    if (v) { u.voice = v; u.lang = v.lang.replace('_', '-'); } else u.lang = 'es-MX';
    let started = false;
    u.onstart = () => {
      started = true; if (current !== u) return; // a line that was given up on
      G.voiceStatus = 'ok'; G.voiceMode = mode;
    };
    u.onend = () => { if (current === u) musicBack(); };
    u.onerror = e => { if (e.error !== 'interrupted' && e.error !== 'canceled') G.voiceStatus = e.error || 'error'; if (current === u) musicBack(); };
    current = u;
    const go = () => {
      if (current !== u) return;
      try {
        if (mode > 0 && G.audio.ctx && G.audio.ctx.state === 'running') { pausedMusic = true; G.audio.ctx.suspend(); }
        ss.resume(); ss.speak(u);
      } catch (e) { G.voiceStatus = 'error'; }
      // silent-failure watchdog: no start after 1.5s (4s soon after the mic) -> try the next mode
      clearTimeout(watch);
      const patience = performance.now() - (G.micEndedAt || -1e9) < 8000 ? 4000 : 1500;
      watch = setTimeout(() => {
        if (current !== u || started || ss.speaking) return;
        musicBack();
        if (tries + 1 >= MODES) { G.voiceStatus = 'silent'; return; }
        G.voiceStatus = 'retry ' + ((mode + 1) % MODES);
        ss.cancel(); lastCancel = performance.now();
        setTimeout(() => { if (current === u) attempt(clean, (mode + 1) % MODES, tries + 1); }, 120);
      }, patience);
    };
    const now = performance.now();
    if (ss.speaking || ss.pending) { ss.cancel(); lastCancel = now; }
    const wait = lastCancel + 90 - now; // never speak within ~90ms of a cancel
    clearTimeout(timer);
    if (wait > 0) timer = setTimeout(go, wait); else go();
  }
  G.speak = function (text) {
    try {
      if (!G.prefs.voice || G.audio.muted) return;
      const ss = window.speechSynthesis; if (!ss) { G.voiceStatus = 'no speech'; return; }
      const clean = G.plain(G.fill(text)).replace(/[\u0001-\u0005«»]/g, '').trim();
      if (!clean || clean === '...' || clean === '. . .') return;
      musicBack();
      attempt(clean, Math.min(MODES - 1, G.voiceMode), 0);
    } catch (e) { G.voiceStatus = 'error'; }
  };
  // stop talking now, and drop a line still waiting to start or to be retried (speech.js calls it before listening)
  G.hush = function () { current = null; clearTimeout(timer); clearTimeout(watch); musicBack(); lastCancel = performance.now(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { } };



  // ---------- List menu ----------
  // items: [{label, right?, disabled?, color?}] or strings. opts: {x,y,w,title,cols,onMove(i),maxRows,cancel:true,help(i)->str}
  class ListMenu {
    cancel() { G.pop(); this.w.resolve(-1); }
    constructor(items, opts, w) {
      this.transparent = true; this.w = w; this.opts = opts || {};
      this.items = items.map(it => typeof it === 'string' ? { label: it } : it);
      this.i = G.clamp(this.opts.start || 0, 0, Math.max(0, this.items.length - 1)); this.top = 0; this.t = 0;
      this.rows = Math.min(this.items.length, this.opts.maxRows || 8); this.rh = this.opts.rowH || 12;
      const iw = Math.max(...this.items.map(it => G.textWidth(it.label) + (it.right ? G.textWidth(it.right) + 14 : 0)), this.opts.title ? G.textWidth(this.opts.title) : 0);
      this.wd = this.opts.w || iw + 30;
      this.ht = this.rows * this.rh + 14 + (this.opts.title ? 12 : 0);
      this.x = this.opts.x != null ? this.opts.x : Math.floor((G.W - this.wd) / 2);
      this.y = this.opts.y != null ? this.opts.y : Math.floor((G.H - this.ht) / 2);
      this.opts.onMove && this.opts.onMove(this.i);
    }
    // tap areas: row r on screen (item this.top + r); the ^ / v scroll strips above and below the rows (reaching
    // 10 px outside the window, so they are big enough to hit); the close button just outside the window (right, else left)
    rowRect(r) { return { x: this.x + 3, y: this.y + 6 + (this.opts.title ? 12 : 0) + r * this.rh, w: this.wd - 6, h: this.rh }; }
    scrollRect(down) { const a = down ? this.rowRect(this.rows).y : this.y - 10, b = down ? this.y + this.ht + 10 : this.rowRect(0).y; return { x: this.x, y: a, w: this.wd, h: b - a }; }
    closeXY() { const r = this.x + this.wd + 2; return [r + G.BTN <= G.W ? r : Math.max(0, this.x - G.BTN - 2), this.y]; }
    update() {
      this.t++;
      const n = this.items.length; if (!n) { if (G.input.p('B') || G.input.p('A') || G.input.tap()) { G.pop(); this.w.resolve(-1); } return; }
      const d = G.input.repDir(14, 4), i0 = this.i;
      let tapped = false;
      if (G.input.tap()) { // tap a row = pick it; the ^ / v arrows scroll
        if (this.opts.cancel !== false && G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); return; }
        if (this.top > 0 && G.tapIn(this.scrollRect(false))) { this.i = this.top - 1; G.audio.sfx('cursor'); }
        else if (this.top + this.rows < n && G.tapIn(this.scrollRect(true))) { this.i = this.top + this.rows; G.audio.sfx('cursor'); }
        else for (let r = 0; r < this.rows; r++) if (this.items[this.top + r] && G.tapIn(this.rowRect(r))) { this.i = this.top + r; tapped = true; }
        if (this.i !== i0) this.opts.onMove && this.opts.onMove(this.i);
      }
      if (d === 'up' || d === 'down') {
        this.i = (this.i + (d === 'up' ? -1 : 1) + n) % n; G.audio.sfx('cursor');
        this.opts.onMove && this.opts.onMove(this.i);
      }
      if (this.i < this.top) this.top = this.i; if (this.i >= this.top + this.rows) this.top = this.i - this.rows + 1;
      if (G.input.p('A') || tapped) {
        const it = this.items[this.i];
        if (it.disabled) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok'); if (!this.opts.keep) G.pop(); this.w.resolve(this.i);
      } else if (G.input.p('B') && this.opts.cancel !== false) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); }
    }
    draw(ctx) {
      G.win(ctx, this.x, this.y, this.wd, this.ht);
      let y = this.y + 8;
      if (this.opts.title) { G.text(ctx, this.opts.title, this.x + 9, y, '#f8e060'); y += 12; }
      const ty = r => y + r * this.rh + ((this.rh - 12) >> 1);
      for (let r = 0; r < this.rows; r++) {
        const idx = this.top + r, it = this.items[idx]; if (!it) break;
        const col = it.disabled ? '#7078a0' : (it.color || '#fff');
        G.text(ctx, it.label, this.x + 17, ty(r), col);
        if (it.right) G.textR(ctx, it.right, this.x + this.wd - 9, ty(r), col);
        if (idx === this.i && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', this.x + 8, ty(r), '#f8e060');
      }
      if (this.top > 0) G.textC(ctx, '^', this.x + this.wd / 2, this.y + 2, '#f8e060');
      if (this.top + this.rows < this.items.length) G.textC(ctx, '\u0001', this.x + this.wd / 2, this.y + this.ht - 8, '#f8e060');
      if (this.opts.cancel !== false) G.closeBtn(ctx, ...this.closeXY());
      const cur = this.items[this.i];
      if (cur && cur.en && G.enVisible()) G.enBox(ctx, cur.en, this.y);
      if (this.opts.help) {
        const hs = this.opts.help(this.i); if (hs) { const lines = G.wrap(hs, G.W - 34); const hh = lines.length * 11 + 12; G.win(ctx, 8, G.H - hh - 6, G.W - 16, hh); lines.forEach((l, k) => G.text(ctx, l, 17, G.H - hh + 1 + k * 11)); }
      }
    }
  }
  G.menu = function (items, opts) { const w = new Wait(); G.push(new ListMenu(items, opts, w)); return w; };

  // ---------- Yes/No ----------
  G.confirm = function (opts = {}) { return G.menu([{ label: 'Sí', en: 'Yes' }, { label: 'No', en: 'No' }], Object.assign({ x: G.W - 70, y: G.H - 110 }, opts)); };

  // ---------- 4-way icon menu (SF-style cross) ----------
  // entries: {up:{label, icon}, left:..., right:..., down:...}; returns 'up'/'left'/... or null
  class CrossMenu {
    cancel() { G.pop(); this.w.resolve(null); }
    constructor(entries, opts, w) { this.transparent = true; this.e = entries; this.opts = opts || {}; this.w = w; this.sel = 'up'; this.t = 0; }
    center() { return [this.opts.x != null ? this.opts.x : G.W / 2, this.opts.y != null ? this.opts.y : G.H - 52]; }
    iconRect(d) { const [cx, cy] = this.center(), [dx, dy] = CROSS[d]; return { x: cx + dx - 12, y: cy + dy - 10, w: 24, h: 20 }; }
    labelRect() { const [cx, cy] = this.center(); return { x: cx + 48, y: cy - 8, w: Math.max(56, G.textWidth(this.e[this.sel].label) + 18), h: 20 }; }
    update() {
      this.t++;
      const d = G.input.repDir(20, 10);
      if (d && this.e[d]) { if (d !== this.sel) G.audio.sfx('cursor'); this.sel = d; }
      let tapped = false;
      if (G.input.tap()) { // tap an icon (or the label) to pick it; the close button = B
        if (G.closeHit()) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); return; }
        tapped = G.tapIn(this.labelRect());
        for (const k in this.e) { const r = this.iconRect(k); if (G.tapIn(r.x - 2, r.y - 2, r.w + 4, r.h + 4)) { this.sel = k; tapped = true; } }
      }
      if (G.input.p('A') || tapped) {
        const en = this.e[this.sel];
        if (en.disabled) { G.audio.sfx('error'); return; }
        G.audio.sfx('ok'); G.pop(); this.w.resolve(this.sel);
      } else if (G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(null); }
    }
    draw(ctx) {
      for (const d of ['up', 'left', 'right', 'down']) {
        const en = this.e[d]; if (!en) continue;
        const r = this.iconRect(d), s = d === this.sel;
        const bob = s ? Math.round(Math.sin(this.t / 5) * 1.5) : 0;
        G.drawIcon(ctx, en.icon, r.x, r.y + bob, s, en.disabled);
      }
      const L = this.labelRect();
      G.win(ctx, L.x, L.y, L.w, L.h);
      G.text(ctx, this.e[this.sel].label, L.x + 9, L.y + 6, this.e[this.sel].disabled ? '#7078a0' : '#fff');
      G.closeBtn(ctx);
    }
  }
  const CROSS = { up: [0, -22], left: [-30, 0], right: [30, 0], down: [0, 22] };
  G.cross = function (entries, opts) { const w = new Wait(); G.push(new CrossMenu(entries, opts, w)); return w; };

  // ---------- Icons (procedural 24x20 framed tiles) ----------
  const ICON_ART = {
    attack: ['.........ww', '........wWw', '.......wWw.', '......wWw..', '.....wWw...', '.y..wWw....', '.yyWWw.....', '..yyy......', '.bybyy.....', 'bb...y.....', 'b..........'],
    magic: ['....s.....', '...sSs....', '....s.....', '...ooo....', '...oOo....', '....b.....', '....b.....', '....b.....', '....b.....', '....b.....', '...bbb....'],
    item: ['...bbbb...', '..b....b..', '.rrrrrrrr.', 'rRRRRRRRRr', 'rRRyyRRRRr', 'rRRyyRRRRr', 'rRRRRRRRRr', 'rRRRRRRRRr', '.rrrrrrrr.'],
    stay: ['....hh....', '...hssh...', '...ssss...', '....ss....', '..bbbbbb..', '.bbbbbbbb.', '.s.bbbb.s.', '...bbbb...', '...b..b...', '...b..b...', '..bb..bb..'],
    member: ['...hhhh...', '..hhhhhh..', '..hssssh..', '..sesses..', '..ssssss..', '...smms...', '....ss....', '..bbbbbb..', '.bbbbbbbb.', 'bbbbbbbbbb'],
    search: ['..gggg....', '.gWWWWg...', 'gWwwwwWg..', 'gWwwwwWg..', 'gWwwwwWg..', '.gWWWWg...', '..ggggbb..', '......bbb.', '.......bbb', '........bb'],
    talk: ['.wwwwwwww.', 'wwwwwwwwww', 'ww.w.w.www', 'wwwwwwwwww', '.wwwwwwww.', '...ww.....', '..w.......'],
    give: ['..rr......', '.rRRr.....', '.rRRr.....', '..rr.ss...', '....sssss.', '...ssssss.', '...sssss..'],
    equip: ['.gg....gg.', 'gWWg..gWWg', 'gWWWggWWWg', '.gWWWWWWg.', '..gWWWWg..', '..gWWWWg..', '.gWWggWWg.', '.gWg..gWg.'],
    drop: ['....b.....', '....b.....', '....b.....', '..bbbbb...', '...bbb....', '....b.....', '..........', '.rrrrrrr..'],
    use: ['...gg.....', '..gggg....', '..gGGg....', '.gGGGGg...', '.gGGGGg...', '.gGGGGg...', '..gggg....'],
    depot: ['rrrrrrrrrr', 'rRRRRRRRRr', 'rryyyyyyrr', 'rRRRRRRRRr', 'rRRRRRRRRr', 'rrrrrrrrrr'],
    join: ['..h....h..', '.hsh..hsh.', '.sss..sss.', '..s....s..', '.bbb..ccc.', 'bbbbbcccccc', '.bb....cc.'],
    book: ['.rrrr.cccc.', 'rRRRRrcCCCc', 'rRwwRrcwwCc', 'rRRRRrcCCCc', 'rRwwRrcwwCc', 'rRRRRrcCCCc', 'rRRRRrcCCCc', '.rrrrwcccc.', '.....w.....'],
    quest: ['.bbbbbbbb.', 'b........b', '.wwwwwwww.', '.wWWWWWWw.', '.wwwwwwww.', '.wWWWWWw..', '.wwwwwwww.', 'b........b', '.bbbbbbbb.'],
    save: ['........ys', '.......yy.', '......yy..', '.....yy...', '....yy....', '...yy.....', '..yy......', '.bb.......', 'bb........'],
    album: ['...ss.ss...', '..ssssssss.', '..ssssssss.', 's..ss.ss..s', 'ss.......ss', 'ss..sss..ss', '...sssss...', '..sssssss..', '..sssssss..', '...sssss...'], // a paw (the animal album)
    gear: ['...gg.gg...', '..gWWgWWg..', '.gWWWWWWWg.', '..gWWgWWg..', 'gWWg...gWWg', '..gWWgWWg..', '.gWWWWWWWg.', '..gWWgWWg..', '...gg.gg...'],
    quit: ['w........w', '.w......w.', '..w....w..', '...w..w...', '....ww....', '...w..w...', '..w....w..', '.w......w.', 'w........w'],
  };
  const ICON_PAL = { w: '#e8e8f8', W: '#a8b0d0', y: '#e8b830', b: '#8a5a30', s: '#f0c8a0', S: '#fff8a0', o: '#58a8f8', O: '#b8e0ff', r: '#a83828', R: '#d86040', h: '#704018', e: '#202040', m: '#c05050', g: '#b0b8c8', G: '#50e080', c: '#3868c8' };
  G.drawIcon = function (ctx, name, x, y, sel, disabled) {
    const frame = G.cached('iconframe' + (sel ? 1 : 0) + (disabled ? 1 : 0), 24, 20, (c) => {
      c.fillStyle = '#000010'; c.fillRect(1, 0, 22, 20); c.fillRect(0, 1, 24, 18);
      c.fillStyle = sel ? '#f0d060' : '#8898e0'; c.fillRect(1, 1, 22, 18);
      c.fillStyle = disabled ? '#303858' : (sel ? '#304cc0' : '#1c2c8c'); c.fillRect(2, 2, 20, 16);
    });
    ctx.drawImage(frame, Math.round(x), Math.round(y));
    const art = ICON_ART[name]; if (!art) return;
    const spr = G.sprite('icon_' + name, art, ICON_PAL);
    ctx.globalAlpha = disabled ? 0.45 : 1;
    ctx.drawImage(spr, Math.round(x + 12 - spr.width / 2), Math.round(y + 10 - spr.height / 2));
    ctx.globalAlpha = 1;
  };

  // ---------- Tap buttons: 20x20 on the canvas, tap area padded to 28x28 (see the input notes in core.js) ----------
  const BTN_ART = {
    close: ['ww......ww', 'www....www', '.www..www.', '..wwwwww..', '...wwww...', '...wwww...', '..wwwwww..', '.www..www.', 'www....www', 'ww......ww'],
    back: ['....ww', '...www', '..www.', '.www..', 'www...', 'ww....', 'www...', '.www..', '..www.', '...www', '....ww'],
    speaker: ['....w.......', '...ww.....w.', '..www..w...w', 'wwwww...w..w', 'wwwww...w..w', 'wwwww...w..w', '..www..w...w', '...ww.....w.', '....w.......'],
  };
  G.BTN = 20;
  G.btnHit = (x, y) => G.tapIn(x - 4, y - 4, G.BTN + 8, G.BTN + 8);
  G.iconBtn = function (ctx, kind, x, y) {
    x = Math.round(x); y = Math.round(y);
    const on = G.input.holding(x - 4, y - 4, G.BTN + 8, G.BTN + 8) > 0;
    ctx.fillStyle = '#000010'; ctx.fillRect(x + 1, y, 18, 20); ctx.fillRect(x, y + 1, 20, 18);
    ctx.fillStyle = on ? '#f0d060' : '#8898e0'; ctx.fillRect(x + 1, y + 1, 18, 18);
    ctx.fillStyle = on ? '#304cc0' : '#1c2c8c'; ctx.fillRect(x + 2, y + 2, 16, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x + 2, y + 2, 16, 3);
    let spr;
    if (kind === 'menu') spr = G.sprite('icon_book', ICON_ART.book, ICON_PAL); // the notebook, like the field menu's Cuaderno
    else {
      const art = BTN_ART[kind === 'next' ? 'back' : kind]; if (!art) return;
      spr = G.sprite('btn_' + kind, art, { w: '#f0f0ff' }, kind === 'next');
      ctx.drawImage(G.tinted(spr, '#000010', 'btn_' + kind), x + 11 - (spr.width >> 1), y + 11 - (spr.height >> 1));
    }
    ctx.drawImage(spr, x + 10 - (spr.width >> 1), y + 10 - (spr.height >> 1));
  };
  G.closeBtn = (ctx, x = G.W - 26, y = 6) => G.iconBtn(ctx, 'close', x, y);
  G.closeHit = (x = G.W - 26, y = 6) => G.btnHit(x, y);
  G.speakerBtn = (ctx, x, y) => G.iconBtn(ctx, 'speaker', x, y);
  G.speakerHit = (x, y) => G.btnHit(x, y);

})();
