// ===== Field menu: Cuaderno (found pages), Misiones (picture goals), Guardar, Opciones =====
'use strict';
(function () {
  const D = () => G.data, S = () => G.st;
  const STAR = '\u0005';

  G.fieldMenu = function* (field) {
    while (true) {
      const c = yield G.cross({
        up: { label: 'Cuaderno', icon: 'book' }, left: { label: 'Misiones', icon: 'quest' },
        right: { label: 'Guardar', icon: 'save' }, down: { label: 'Opciones', icon: 'gear' },
      }, { x: G.W / 2 - 40, y: G.H / 2 + 20 });
      const op = c.result; if (!op) return;
      if (op === 'up') yield G.notebook();
      else if (op === 'left') yield G.questLog();
      else if (op === 'right') {
        const r = yield G.choose({ prompt: '¿Guardar?', en: 'Save the game?', show: 'save', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], cancel: true });
        if (r.result === 0) { const ok = S().save(); G.audio.sfx(ok ? 'item' : 'error'); G.toast(ok ? '\u0005 ¡Guardado! \u0005' : '¡Error!', 80); }
      } else if (op === 'down') yield* G.options();
    }
  };

  // ---------- Cuaderno: one page per topic, found around town ----------
  class Notebook {
    constructor(w, start) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.pi = Math.max(0, D().pageOrder.indexOf(start)); this.wi = 0; }
    page() { return D().pageOrder[this.pi]; }
    words() { return D().pages[this.page()].words; }
    // tap areas (shared with draw): word k on the page, the < > page buttons around the page dots, close
    cellRect(k) { return { x: 18 + (k % 3) * 96, y: 34 + Math.floor(k / 3) * 58, w: 92, h: 56 }; }
    prevXY() { return [G.W / 2 - 60, 4]; }
    nextXY() { return [G.W / 2 + 36, 4]; }
    closeXY() { return [G.W - 30, 8]; }
    turn(dx) { this.pi = (this.pi + dx + D().pageOrder.length) % D().pageOrder.length; this.wi = 0; G.audio.sfx('select'); }
    update() {
      this.t++;
      const d = G.input.repDir(14, 5), found = S().hasPage(this.page()), n = this.words().length;
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
      if (G.btnHit(...this.prevXY())) { this.turn(-1); return; }
      if (G.btnHit(...this.nextXY())) { this.turn(1); return; }
      if (found) for (let k = 0; k < n; k++) if (G.tapIn(this.cellRect(k))) { // tap a word: hear it
        if (this.wi !== k) G.audio.sfx('cursor');
        this.wi = k; if (S().seen(this.words()[k])) G.speak(G.baseForm(this.words()[k]));
      }
      // left/right moves within the page's 3-column grid, and past its edge turns the page
      if (d === 'left' || d === 'right') {
        const col = this.wi % 3, dx = d === 'left' ? -1 : 1;
        if (found && col + dx >= 0 && col + dx < 3 && this.wi + dx < n) { this.wi += dx; G.audio.sfx('cursor'); }
        else { this.turn(dx); return; }
      }
      if (found && (d === 'up' || d === 'down')) { const k = this.wi + (d === 'up' ? -3 : 3); if (k >= 0 && k < n) { this.wi = k; G.audio.sfx('cursor'); } }
      if (found && (G.input.p('A') || G.input.p('C'))) { const id = this.words()[this.wi]; if (S().seen(id)) G.speak(G.baseForm(id)); }
    }
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      const pid = this.page(), found = S().hasPage(pid);
      G.iconBtn(ctx, 'back', ...this.prevXY()); G.iconBtn(ctx, 'next', ...this.nextXY()); G.closeBtn(ctx, ...this.closeXY());
      // page dots
      D().pageOrder.forEach((p, k) => {
        const x = G.W / 2 - 34 + k * 14;
        ctx.fillStyle = k === this.pi ? '#a05020' : S().hasPage(p) ? '#c8a070' : '#e8dcc0';
        ctx.fillRect(x, 11, 8, 6); ctx.fillStyle = '#7a4a20'; ctx.fillRect(x, 17, 8, 1);
      });
      if (!found) {
        ctx.globalAlpha = 0.35; G.drawIcon16(ctx, 'pagina', G.W / 2 - 24, 64, 3); ctx.globalAlpha = 1;
        G.bigText(ctx, '?', G.W / 2, 140, 3, '#a08060', null);
        return;
      }
      const tp = D().topics[D().pages[pid].topic];
      G.textC(ctx, tp.name, G.W / 2, 24, '#a05020', null);
      if (G.enVisible()) G.text(ctx, tp.en, 16, 24, '#a09070', null);
      this.words().forEach((id, k) => {
        const R = this.cellRect(k), cx = R.x + 4, cy = R.y + 2, sel = k === this.wi;
        const wd = D().words[id], seen = S().seen(id), kn = S().knows(id);
        if (sel) { ctx.fillStyle = '#f8e0a0'; ctx.fillRect(cx - 4, cy - 2, 92, 56); }
        G.drawIcon16(ctx, wd, cx + 26, cy, 2);
        if (seen) G.textC(ctx, wd.es.split(' / ')[0], cx + 42, cy + 35, kn ? '#a06008' : '#2860a8', null);
        else G.textC(ctx, '? ? ?', cx + 42, cy + 35, '#b8a888', null);
        if (G.enVisible()) G.textC(ctx, wd.en, cx + 42, cy + 45, '#a09070', null);
        else if (kn) { const st = S().wordStars(id); for (let s = 0; s < 3; s++) G.text(ctx, STAR, cx + 30 + s * 8, cy + 45, s < st ? '#e0a010' : '#d8ccb0', null); }
      });
    }
  }
  G.notebook = function (start) { const w = new G.Wait(); G.push(new Notebook(w, start)); return w; };

  // ---------- Misiones: who asked, and what they want (pictures only) ----------
  class QuestLog {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (G.input.p('A') || G.input.p('B') || G.input.tap()) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); } } // a tap anywhere closes
    draw(ctx) {
      G.win(ctx, 6, 6, G.W - 12, G.H - 12);
      G.closeBtn(ctx, G.W - 30, 8);
      G.drawIcon(ctx, 'quest', G.W / 2 - 12, 8);
      const list = D().questOrder.filter(id => S().quest(id));
      if (!list.length) G.bigText(ctx, '?', G.W / 2, 80, 3, '#404878');
      list.forEach((id, k) => {
        const q = D().quests[id], done = S().done(id), y = 34 + k * 30;
        ctx.fillStyle = '#0a1040'; ctx.fillRect(14, y - 2, G.W - 28, 26);
        ctx.globalAlpha = done ? 0.5 : 1;
        ctx.drawImage(G.unitSprite(D().npcs[q.giver].map, 'down', (this.t >> 5) & 1), 18, y);
        G.drawIcon16(ctx, 'flecha', 46, y + 4);
        G.drawGoal(ctx, q.goal, 68, y + 4);
        ctx.globalAlpha = 1;
        if (done) G.drawIcon16(ctx, 'si', G.W - 36, y + 4);
        if (G.enVisible()) G.textR(ctx, q.en, G.W - 40, y + 9, '#f8e8b0');
      });
      ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'].forEach((id, k) => {
        const x = G.W / 2 - 88 + k * 40, yy = G.H - 34;
        if (S().done(id)) G.drawBadge(ctx, id, x, yy, this.t + k * 18);
        else { ctx.fillStyle = '#0a1040'; ctx.beginPath(); ctx.arc(x + 8, yy + 8, 10, 0, Math.PI * 2); ctx.fill(); G.textC(ctx, '?', x + 8, yy + 4, '#404878'); }
      });
    }
  }
  G.questLog = function () { const w = new G.Wait(); G.push(new QuestLog(w)); return w; };

  // ---------- Opciones (mostly for grown-ups) ----------
  // Up/down picks a row; left/right moves a volume slider (0..10); A changes the other rows.
  class Options {
    constructor(w) { this.transparent = true; this.w = w; this.t = 0; this.i = 0; this.n = this.rows().length; }
    rows() {
      const voices = G.spanishVoices(), cur = G.currentVoice();
      return [
        { label: 'Música', vol: 'music', icon: 'music', en: 'Music volume' },
        { label: 'Sonidos', vol: 'sfx', icon: 'sound', en: 'Sound effects volume' },
        { label: 'Voz', vol: 'voice', icon: 'voice', en: 'Speaking volume (0 = no voice)' },
        { label: 'Elegir voz', right: voices.length ? (voiceIndex(voices, cur) + 1) + '/' + voices.length : '-',
          en: cur ? 'Change the voice. Now: ' + cur.name + ' (' + cur.lang + ')' : 'No Spanish voice found on this device' },
        { label: 'Inglés (padres)', right: G.state.opts.english ? 'Sí' : 'No', en: 'Show English translations (for parents and teachers)' },
      ];
    }
    sample(kind) {
      if (kind === 'sfx') G.audio.sfx('coin');
      else if (kind === 'voice') G.speak('¡Hola!');
    }
    vol(kind, level) { const before = G.prefs[kind]; G.audio.setVolume(kind, level); if (G.prefs[kind] !== before) this.sample(kind); }
    // tap areas (shared with draw): row k, the volume bar's left edge (cells are 9 px; left of it = 0), close
    box() { const W = 220, H = this.n * 18 + 28; return { x: (G.W - W) / 2, y: 40, W, H }; }
    rowRect(k) { const b = this.box(); return { x: b.x + 4, y: b.y + 19 + k * 18, w: b.W - 8, h: 18 }; }
    barX() { return this.box().x + 100; }
    closeXY() { const b = this.box(); return [b.x + b.W - 16, b.y - 6]; }
    update() {
      this.t++;
      const rows = this.rows();
      if (G.input.tap()) { // tap a row to pick it (and change it); tap a volume bar to set the level
        if (G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
        const k = rows.findIndex((r, i) => G.tapIn(this.rowRect(i))), tx = G.input.tap().x, bx = this.barX();
        if (k >= 0 && k !== this.i) { this.i = k; G.audio.sfx('cursor'); }
        if (k >= 0 && rows[k].vol && tx >= bx - 12) this.vol(rows[k].vol, tx < bx ? 0 : Math.floor((tx - bx) / 9) + 1);
        else if (k >= 0 && !rows[k].vol) this.act();
      }
      const r = rows[this.i], d = G.input.repDir(14, 5);
      if (d === 'up' || d === 'down') { this.i = (this.i + (d === 'up' ? -1 : 1) + rows.length) % rows.length; G.audio.sfx('cursor'); }
      if (r.vol && (d === 'left' || d === 'right')) this.vol(r.vol, G.prefs[r.vol] + (d === 'left' ? -1 : 1));
      if (G.input.p('A')) this.act();
      if (G.input.p('B')) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); }
    }
    act() { // A on a row
      if (this.i === 3) {
        const voices = G.spanishVoices(), cur = G.currentVoice();
        if (!voices.length) { G.audio.sfx('error'); return; }
        G.state.opts.voiceName = voices[(voiceIndex(voices, cur) + 1) % voices.length].name;
        G.audio.setPref('voiceMode', 0);
        if (!G.prefs.voice) G.audio.setVolume('voice', 7);
        G.speak('¡Hola! Hoy es tu primer día en el Club de Español.');
      } else if (this.i === 4) { G.state.opts.english = !G.state.opts.english; G.audio.sfx('ok'); }
    }
    draw(ctx) {
      const rows = this.rows(), { x, y, W, H } = this.box();
      G.win(ctx, x, y, W, H);
      G.closeBtn(ctx, ...this.closeXY());
      G.text(ctx, 'OPCIONES', x + 9, y + 8, '#f8e060');
      rows.forEach((r, k) => {
        const yy = y + 24 + k * 18, sel = k === this.i;
        if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x + 8, yy, '#f8e060');
        if (r.icon) volIcon(ctx, r.icon, x + 18, yy - 1, r.vol && !G.prefs[r.vol]);
        G.text(ctx, r.label, x + (r.icon ? 32 : 18), yy, sel ? '#f8e060' : '#ffffff');
        if (r.vol) {
          const v = G.prefs[r.vol], bx = this.barX();
          if (sel) G.text(ctx, '<', bx - 8, yy, '#f8e060');
          for (let s = 0; s < 10; s++) { ctx.fillStyle = s < v ? (sel ? '#f8d030' : '#c8d0f0') : '#303a78'; ctx.fillRect(bx + s * 9, yy + 6 - Math.floor(s / 2), 7, 2 + Math.floor(s / 2)); }
          if (sel) G.text(ctx, '>', bx + 92, yy, '#f8e060');
          G.textR(ctx, String(v), x + W - 10, yy, v ? '#ffffff' : '#7078a0');
        } else G.textR(ctx, r.right, x + W - 10, yy, '#ffffff');
      });
      // voice status line: which voice is speaking, or why not
      const v = G.currentVoice(), st = G.voiceStatus;
      const mode = G.prefs.voiceMode || 0, nv = G.spanishVoices().length;
      const who = !v ? '(ninguna voz en español)' : mode === 0 ? v.name + ' (' + v.lang + ')' : 'predeterminada (' + v.lang + ')' + (mode === 2 ? ' + pausa' : '');
      const line = !window.speechSynthesis ? 'Voz: no disponible en este navegador' : 'Voz: ' + who + ' [' + nv + ']' + (st && st !== 'ok' ? ' ! ' + st : '');
      G.win(ctx, x, y + H + 2, W, 18, { alpha: 0.9 });
      G.text(ctx, line.length > 44 ? line.slice(0, 42) + '..' : line, x + 8, y + H + 7, st && st !== 'ok' ? '#ff9080' : '#a8b0d8');
      const cur = rows[this.i];
      if (G.enVisible()) G.enBox(ctx, cur.en, y + H + 22, true);
    }
  }
  // browsers may hand back new voice objects on each call, so match by name
  const voiceIndex = (voices, cur) => cur ? voices.findIndex(v => v.name === cur.name) : -1;
  // tiny speaker / note icons for the volume rows (crossed out at 0)
  function volIcon(ctx, kind, x, y, off) {
    ctx.fillStyle = off ? '#7078a0' : '#f8e060';
    if (kind === 'music') { ctx.fillRect(x + 6, y, 1, 7); ctx.fillRect(x + 7, y, 3, 1); ctx.fillRect(x + 9, y, 1, 6); ctx.fillRect(x + 4, y + 6, 3, 2); ctx.fillRect(x + 7, y + 5, 3, 2); }
    else { ctx.fillRect(x + 1, y + 2, 2, 4); ctx.fillRect(x + 3, y + 1, 1, 6); ctx.fillRect(x + 4, y, 1, 8); if (kind === 'voice') { ctx.fillRect(x + 7, y + 2, 1, 4); ctx.fillRect(x + 9, y + 1, 1, 6); } else { ctx.fillRect(x + 7, y + 3, 1, 2); } }
    if (off) { ctx.fillStyle = '#e04040'; for (let i = 0; i < 9; i++) ctx.fillRect(x + i, y + 8 - i, 1, 1); }
  }
  G.options = function* () { const w = new G.Wait(); G.push(new Options(w)); yield w; };
})();
