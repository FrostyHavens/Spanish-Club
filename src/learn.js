// ===== Learning UI: new-word cards, picture & word choices, gentle retries, badges =====
'use strict';
(function () {
  const D = () => G.data;
  const STAR = '\u0005';

  // ---------- "¡Palabra nueva!" card ----------
  class WordCard {
    constructor(ids, w) { G.toastT = 0; this.transparent = true; this.ids = ids; this.i = 0; this.w = w; this.t = 0; this.open(); }
    open() { this.t = 0; G.speak(this.word().es.split(' / ')[0]); }
    word() { return D().words[this.ids[this.i]]; }
    update() {
      this.t++;
      if (this.t < 20) return;
      if (G.input.p('B')) { G.speak(this.word().es.split(' / ')[0]); return; }
      if (G.input.p('A')) {
        G.audio.sfx('ok');
        if (++this.i >= this.ids.length) { G.pop(); this.w.resolve(); return; }
        this.open();
      }
    }
    draw(ctx) {
      const wd = this.word(), pop = Math.min(1, this.t / 10);
      const W = 200, H = 150, x = (G.W - W) / 2, y = 20 + (1 - pop) * 30;
      ctx.globalAlpha = pop;
      G.win(ctx, x, y, W, H);
      G.textC(ctx, '¡Palabra nueva!', G.W / 2, y + 9, '#f8e060');
      if (this.ids.length > 1) G.textR(ctx, (this.i + 1) + '/' + this.ids.length, x + W - 9, y + 9, '#9098c8');
      const bob = Math.round(Math.sin(this.t / 12) * 2);
      G.drawIcon16(ctx, wd, G.W / 2 - 24, y + 26 + bob, 3, 'card');
      G.bigText(ctx, wd.es, G.W / 2, y + 90, 2, '#ffffff');
      G.textC(ctx, wd.en, G.W / 2, y + 112, '#a8b0d8');
      if (this.t >= 20 && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', x + W - 16, y + H - 13, '#f8e060');
      if (G.state.opts.voice) { G.text(ctx, 'B', x + 9, y + H - 13, '#f8e060'); G.text(ctx, 'escuchar', x + 17, y + H - 13, '#9098c8'); }
      ctx.globalAlpha = 1;
    }
  }
  // Teach one or more words (only the ones not yet known get a card). Yield the result.
  G.teach = function (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(id => G.st.learn(id));
    const w = new G.Wait();
    if (!ids.length) { w.resolve(); return w; }
    G.audio.jingle('item');
    G.push(new WordCard(ids, w)); return w;
  };

  // ---------- Choice screen ----------
  // opts: {prompt, en, show: word to picture above the choices, choices: [{label, icon, en, off}], layout: 'cards'|'list'}
  class Choice {
    constructor(opts, w) {
      this.transparent = true; this.o = opts; this.w = w; this.t = 0; this.i = 0; this.shake = 0;
      this.ch = opts.choices; this.cards = opts.layout === 'cards';
      while (this.ch[this.i] && this.ch[this.i].off) this.i++;
    }
    move(d) {
      const n = this.ch.length; let k = this.i;
      for (let s = 0; s < n; s++) { k = (k + d + n) % n; if (!this.ch[k].off) break; }
      if (k !== this.i) { this.i = k; G.audio.sfx('cursor'); }
    }
    update() {
      this.t++; if (this.shake > 0) this.shake--;
      const d = G.input.repDir(14, 6);
      if (d === (this.cards ? 'left' : 'up')) this.move(-1);
      if (d === (this.cards ? 'right' : 'down')) this.move(1);
      if (G.input.p('A') && this.t > 8) { G.pop(); this.w.resolve(this.i); }
      if (G.input.p('B') && this.o.cancel) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); }
    }
    draw(ctx) {
      const o = this.o;
      // prompt window
      const lines = G.wrap(o.prompt, G.W - 40);
      let top = 8;
      const ph = lines.length * 12 + 12 + (o.show ? 58 : 0);
      G.win(ctx, 12, top, G.W - 24, ph);
      if (o.show) G.drawIcon16(ctx, o.show, G.W / 2 - 24, top + 8, 3, 'card');
      lines.forEach((l, i) => G.textC(ctx, l, G.W / 2, top + 7 + (o.show ? 58 : 0) + i * 12, '#ffffff'));
      if (o.en) { if (G.enVisible()) G.enBox(ctx, o.en, top + ph + 1, true); else G.enHint(ctx, G.W - 64, top + ph - 11); }
      const sx = this.shake ? (this.shake % 4 < 2 ? 2 : -2) : 0;
      if (this.cards) {
        const n = this.ch.length, cw = 58, gap = 12, tw = n * cw + (n - 1) * gap, x0 = (G.W - tw) / 2, y0 = G.H - 92;
        this.ch.forEach((c, k) => {
          const x = x0 + k * (cw + gap) + (k === this.i ? sx : 0), sel = k === this.i;
          const bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
          ctx.globalAlpha = c.off ? 0.35 : 1;
          G.win(ctx, x, y0 - bob, cw, c.label ? 78 : 62, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
          G.drawIcon16(ctx, c.icon, x + cw / 2 - 16, y0 + 12 - bob, 2, sel ? 'sel' : 'card');
          if (c.label) G.textC(ctx, c.label, x + cw / 2, y0 + 56 - bob, sel ? '#f8e060' : '#ffffff');
          ctx.globalAlpha = 1;
          if (sel && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', x + cw / 2, y0 - 10 - bob, '#f8e060');
        });
        const cur = this.ch[this.i];
        if (cur && cur.en && G.enVisible()) G.enBox(ctx, cur.en, G.H - 12, false);
      } else {
        const rows = this.ch.length, wd = Math.max(...this.ch.map(c => G.textWidth(c.label) + (c.icon ? 22 : 0))) + 34;
        const h = rows * 18 + 10, x = (G.W - wd) / 2 + sx, y = G.H - h - 10;
        G.win(ctx, x, y, wd, h);
        this.ch.forEach((c, k) => {
          const yy = y + 7 + k * 18, sel = k === this.i;
          ctx.globalAlpha = c.off ? 0.35 : 1;
          let tx = x + 18;
          if (c.icon) { G.drawIcon16(ctx, c.icon, tx, yy - 1); tx += 20; }
          G.text(ctx, c.label, tx, yy + 4, sel ? '#f8e060' : '#ffffff');
          ctx.globalAlpha = 1;
          if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x + 8, yy + 4, '#f8e060');
        });
        const cur = this.ch[this.i];
        if (cur && cur.en && G.enVisible()) G.enBox(ctx, cur.en, y, false);
      }
    }
  }
  G.choose = function (opts) { const w = new G.Wait(); const s = new Choice(opts, w); w.scene = s; G.push(s); return w; };

  // ---------- Ask until right (kid-friendly) ----------
  // q: {prompt, en, show, choices:[...], answer: index, layout, word: id to score, hint, hintEn, who}
  // Wrong picks are greyed out, so every question is finishable. Returns true if right on the first try.
  const PRAISE = [['¡Muy bien!', 'Very good!'], ['¡Excelente!', 'Excellent!'], ['¡Perfecto!', 'Perfect!'], ['¡Fantástico!', 'Fantastic!'], ['¡Bravo!', 'Bravo!']];
  G.ask = function* (q) {
    const ch = q.choices.map(c => Object.assign({}, c));
    let tries = 0;
    while (true) {
      const r = yield G.choose(Object.assign({}, q, { choices: ch }));
      const k = r.result;
      if (k === q.answer) break;
      tries++;
      G.audio.sfx('error'); G.fx.shake = 6;
      ch[k].off = true;
      const p = ['¡Casi! Inténtalo otra vez.', 'Almost! Try again.'];
      yield G.say([{ t: q.hint ? p[0] + ' ' + q.hint : p[0], en: q.hintEn ? p[1] + ' ' + q.hintEn : p[1] }], { portrait: q.who ? G.portraitOf(q.who) : null, name: q.who ? G.nameOf(q.who) : null });
    }
    const first = tries === 0;
    if (q.word) (Array.isArray(q.word) ? q.word : [q.word]).forEach(id => G.st.practiced(id, first));
    G.audio.sfx(first ? 'item' : 'ok');
    const pr = PRAISE[G.r(PRAISE.length)];
    G.toast(first ? STAR + ' ' + pr[0] + ' ' + STAR : pr[0], 70);
    return first;
  };
  // Build choices for a word quiz from a pool of word ids (picks distractors, shuffles).
  G.wordChoices = function (answerId, pool, n = 3, opts = {}) {
    const others = pool.filter(id => id !== answerId).sort(() => G.rand() - 0.5).slice(0, n - 1);
    const ids = others.concat([answerId]).sort(() => G.rand() - 0.5);
    const W = D().words;
    return {
      choices: ids.map(id => ({ label: opts.noLabel ? null : (opts.label ? opts.label(id) : W[id].es), icon: opts.noIcon ? null : W[id], en: W[id].en })),
      answer: ids.indexOf(answerId),
    };
  };

  // ---------- Badge award ----------
  class BadgeCard {
    constructor(q, w) { G.toastT = 0; this.transparent = true; this.q = q; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 40 && (G.input.p('A') || G.input.p('B'))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const q = D().quests[this.q], W = 220, H = 110, x = (G.W - W) / 2, y = 40;
      G.win(ctx, x, y, W, H, { fill1: '#7a4a10', fill2: '#3a2008' });
      G.textC(ctx, '¡Insignia nueva!', G.W / 2, y + 9, '#f8e060');
      G.drawBadge(ctx, this.q, G.W / 2 - 16, y + 24, this.t, 2);
      G.bigText(ctx, q.name, G.W / 2, y + 76, 2, '#fff8e0', '#3a1a00');
      if (G.enVisible()) G.textC(ctx, q.en + ' badge', G.W / 2, y + 94, '#f8d8a0');
      else G.enHint(ctx, x + W - 52, y + H - 12);
    }
  }
  const BADGE_COL = { saludos: '#e85060', mercado: '#e89030', pelota: '#3a78e0', carta: '#40a848', fiesta: '#b050d0' };
  const BADGE_ICON = { saludos: 'hola', mercado: 'manzana', pelota: 'pelota', carta: 'carta', fiesta: 'sol' };
  G.drawBadge = function (ctx, id, x, y, t, scale = 1) {
    const s = 16 * scale, col = BADGE_COL[id] || '#888';
    ctx.fillStyle = '#201008'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 3 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8d040'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 2 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 0.5 * scale, 0, Math.PI * 2); ctx.fill();
    const w = BADGE_ICON[id] === 'pelota' ? { icon: 'pelota', col: '#e03028' } : BADGE_ICON[id];
    const img = G.icon(w); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x + 2 * scale, y + 2 * scale, 12 * scale, 12 * scale);
    if (t != null && (t % 90) < 12) { ctx.fillStyle = '#ffffff'; const k = (t % 90); ctx.fillRect(x + k * scale * 1.2, y + 2, scale, s - 4); }
  };
  G.badge = function (id) { const w = new G.Wait(); G.audio.jingle('promote'); G.push(new BadgeCard(id, w)); return w; };

  G.nameOf = function (who) {
    if (who === 'player') return D().player.name;
    return D().npcs[who] ? D().npcs[who].name : null;
  };
})();
