// ===== Learning UI: picture questions, learning by doing, new-word celebrations, badges =====
// Words are never translated. A word starts as a picture next to the Spanish; the player shows they
// understand it by using it correctly, and only then does it count as learned (and turn gold).
'use strict';
(function () {
  const D = () => G.data, S = () => G.st;
  const STAR = '\u0005';

  // ---------- "¡Palabra nueva!" card: the reward for using a word correctly ----------
  class WordCard {
    constructor(ids, w) { G.toastT = 0; this.transparent = true; this.ids = ids; this.i = 0; this.w = w; this.t = 0; this.open(); }
    open() { this.t = 0; G.speak(G.baseForm(this.ids[this.i])); }
    word() { return D().words[this.ids[this.i]]; }
    update() {
      this.t++;
      if (this.t < 20) return;
      if (G.input.p('C')) { G.speak(G.baseForm(this.ids[this.i])); return; }
      if (G.input.p('A') || G.input.p('B')) {
        G.audio.sfx('ok');
        if (++this.i >= this.ids.length) { G.pop(); this.w.resolve(); return; }
        this.open();
      }
    }
    draw(ctx) {
      const wd = this.word(), pop = Math.min(1, this.t / 10);
      const W = 200, H = 140, x = (G.W - W) / 2, y = 24 + (1 - pop) * 30;
      ctx.globalAlpha = pop;
      G.win(ctx, x, y, W, H);
      G.textC(ctx, '¡' + STAR + ' Palabra nueva ' + STAR + '!', G.W / 2, y + 9, '#f8e060');
      const bob = Math.round(Math.sin(this.t / 12) * 2);
      G.drawIcon16(ctx, wd, G.W / 2 - 24, y + 26 + bob, 3, 'card');
      G.bigText(ctx, wd.es, G.W / 2, y + 92, 2, '#f8d860');
      if (G.enVisible()) G.textC(ctx, wd.en, G.W / 2, y + 112, '#a8b0d8');
      if (this.t >= 20 && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', x + W - 16, y + H - 13, '#f8e060');
      ctx.globalAlpha = 1;
    }
  }
  // Mark words learned; celebrates the ones that are new. Yieldable.
  G.learnWords = function (ids) {
    ids = (Array.isArray(ids) ? ids : [ids]).filter(id => D().words[id] && S().learn(id));
    const w = new G.Wait();
    if (!ids.length) { w.resolve(); return w; }
    G.audio.jingle('item');
    G.push(new WordCard(ids, w)); return w;
  };

  // ---------- Choice screen ----------
  // opts: {prompt (rich text), en, show: picture above, choices, layout: 'cards'|'list'}
  // A choice is {word: id} (drawn as picture+blue word until learned, then gold word), optionally with
  // label (shown form), pic: true (picture only), text: true (word only), or a free {label, icon}.
  function view(c) {
    const W = D().words[c.word];
    if (!W) return { label: c.label, icon: c.icon, col: '#ffffff' };
    const k = S().knows(c.word), label = c.label || G.baseForm(c.word);
    if (c.pic) return { label: null, icon: W, col: '#ffffff' };
    if (c.text) return { label, icon: null, col: k ? '#f8d860' : '#a8d8ff' };
    return { label, icon: k ? null : W, col: k ? '#f8d860' : '#a8d8ff' };
  }
  class Choice {
    constructor(opts, w) {
      this.transparent = true; this.o = opts; this.w = w; this.t = 0; this.i = 0; this.shake = 0;
      this.ch = opts.choices; this.cards = opts.layout === 'cards';
      while (this.ch[this.i] && this.ch[this.i].off) this.i++;
      G.richIds(opts.prompt || '').forEach(id => S().see(id));
      this.ch.forEach(c => c.word && S().see(c.word));
      this.lines = G.richLayout(opts.prompt || '', G.W - 44);
      if (!opts.noVoice) G.speak(G.plain(opts.prompt || ''));
    }
    move(d) {
      const n = this.ch.length; let k = this.i;
      for (let s = 0; s < n; s++) { k = (k + d + n) % n; if (!this.ch[k].off) break; }
      if (k !== this.i) { this.i = k; G.audio.sfx('cursor'); const v = view(this.ch[k]); if (v.label && this.ch[k].word) G.speak(v.label); }
    }
    update() {
      this.t++; if (this.shake > 0) this.shake--;
      const d = G.input.repDir(14, 6);
      if (d === (this.cards ? 'left' : 'up')) this.move(-1);
      if (d === (this.cards ? 'right' : 'down')) this.move(1);
      if (G.input.p('C')) G.speak(G.plain(this.o.prompt || ''));
      if (G.input.p('A') && this.t > 8) { G.pop(); this.w.resolve(this.i); }
      if (G.input.p('B') && this.o.cancel) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(-1); }
    }
    draw(ctx) {
      const o = this.o, top = 8;
      const ph = this.lines.length * 16 + 10 + (o.show ? 58 : 0);
      G.win(ctx, 12, top, G.W - 24, ph);
      if (o.show) G.drawIcon16(ctx, o.show, G.W / 2 - 24, top + 8, 3, 'card');
      G.richDraw(ctx, this.lines, G.W / 2, top + 5 + (o.show ? 58 : 0), { center: true });
      if (o.en && G.enVisible()) G.enBox(ctx, o.en, top + ph + 1, true);
      const sx = this.shake ? (this.shake % 4 < 2 ? 2 : -2) : 0;
      const vs = this.ch.map(view);
      if (this.cards) {
        const n = this.ch.length, cw = 58, gap = 12, tw = n * cw + (n - 1) * gap, x0 = (G.W - tw) / 2, y0 = G.H - 92;
        this.ch.forEach((c, k) => {
          const v = vs[k], x = x0 + k * (cw + gap), sel = k === this.i;
          const bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0;
          ctx.globalAlpha = c.off ? 0.3 : 1;
          G.win(ctx, x, y0 - bob, cw, v.label ? 78 : 62, sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
          G.drawIcon16(ctx, v.icon || D().words[c.word] || c.icon, x + cw / 2 - 16, y0 + 12 - bob, 2, sel ? 'sel' : 'card');
          if (v.label) G.textC(ctx, v.label, x + cw / 2, y0 + 56 - bob, v.col);
          ctx.globalAlpha = 1;
          if (sel && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', x + cw / 2, y0 - 10 - bob, '#f8e060');
        });
      } else {
        const rows = this.ch.length, wd = Math.max(...vs.map(v => (v.label ? G.textWidth(v.label) : 0) + (v.icon ? 20 : 0))) + 34;
        const h = rows * 20 + 8, x = (G.W - wd) / 2 + sx, y = G.H - h - 10;
        G.win(ctx, x, y, wd, h);
        this.ch.forEach((c, k) => {
          const v = vs[k], yy = y + 6 + k * 20, sel = k === this.i;
          ctx.globalAlpha = c.off ? 0.3 : 1;
          let tx = x + 18;
          if (v.icon) { G.drawIcon16(ctx, v.icon, tx, yy); tx += 20; }
          if (v.label) G.text(ctx, v.label, tx, yy + 5, sel && v.col === '#ffffff' ? '#f8e060' : v.col);
          ctx.globalAlpha = 1;
          if (sel && (this.t >> 3) % 4 !== 3) G.text(ctx, '\u0002', x + 8, yy + 5, '#f8e060');
        });
      }
    }
  }
  G.choose = function (opts) { const w = new G.Wait(); const s = new Choice(opts, w); w.scene = s; G.push(s); return w; };

  // ---------- Ask until right ----------
  // q: {prompt, en, show, choices, answer: index, layout, learn: word ids learned by getting it right, who}
  // Wrong picks shake and grey out (no lecture), so every question can be finished.
  // Returns true if right on the first try (worth a star).
  const PRAISE = ['¡Muy bien!', '¡Excelente!', '¡Perfecto!', '¡Fantástico!', '¡Bravo!'];
  G.ask = function* (q) {
    const ch = q.choices.map(c => Object.assign({}, c));
    let tries = 0;
    while (true) {
      const r = yield G.choose(Object.assign({}, q, { choices: ch, noVoice: tries > 0 }));
      const k = r.result;
      if (k === q.answer) break;
      tries++;
      G.audio.sfx('error'); G.fx.shake = 6; G.toast('¡Casi!', 50);
      ch[k].off = true;
    }
    const first = tries === 0;
    const ids = q.learn ? (Array.isArray(q.learn) ? q.learn : [q.learn]) : [];
    ids.forEach(id => S().practiced(id, first));
    G.audio.sfx(first ? 'item' : 'ok');
    G.toast(first ? STAR + ' ' + PRAISE[G.r(PRAISE.length)] + ' ' + STAR : PRAISE[G.r(PRAISE.length)], 70);
    yield 20;
    yield G.learnWords(ids);
    return first;
  };
  // Choices for a word question from a pool of word ids (distractors shuffled in). opts are copied onto each choice.
  G.wordChoices = function (answerId, pool, n = 3, opts = {}) {
    const others = pool.filter(id => id !== answerId).sort(() => G.rand() - 0.5).slice(0, n - 1);
    const ids = others.concat([answerId]).sort(() => G.rand() - 0.5);
    return { choices: ids.map(id => Object.assign({ word: id }, opts, opts.label ? { label: opts.label(id) } : {})), answer: ids.indexOf(answerId) };
  };
  // A sí / no question, shown as two picture cards.
  G.siNo = function* (prompt, yes, extra = {}) {
    return yield* G.ask(Object.assign({ prompt, layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], answer: yes ? 0 : 1, learn: yes ? 'si' : 'no' }, extra));
  };

  // ---------- Badge award ----------
  class BadgeCard {
    constructor(q, w) { G.toastT = 0; this.transparent = true; this.q = q; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 40 && (G.input.p('A') || G.input.p('B'))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const q = D().quests[this.q], W = 200, H = 100, x = (G.W - W) / 2, y = 44;
      G.win(ctx, x, y, W, H, { fill1: '#7a4a10', fill2: '#3a2008' });
      G.drawBadge(ctx, this.q, G.W / 2 - 16, y + 14, this.t, 2);
      G.bigText(ctx, q.name, G.W / 2, y + 66, 2, '#fff8e0', '#3a1a00');
      if (G.enVisible()) G.textC(ctx, q.en, G.W / 2, y + 84, '#f8d8a0');
    }
  }
  const BADGE_COL = { saludos: '#e85060', mercado: '#e89030', pelota: '#3a78e0', carta: '#40a848', fiesta: '#b050d0' };
  const BADGE_ICON = { saludos: 'hola', mercado: 'manzana', pelota: 'pelota', carta: 'carta', fiesta: 'sol' };
  G.drawBadge = function (ctx, id, x, y, t, scale = 1) {
    const s = 16 * scale, col = BADGE_COL[id] || '#888';
    ctx.fillStyle = '#201008'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 3 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8d040'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 2 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 0.5 * scale, 0, Math.PI * 2); ctx.fill();
    const img = G.icon(BADGE_ICON[id]); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x + 2 * scale, y + 2 * scale, 12 * scale, 12 * scale);
    if (t != null && (t % 90) < 12) { ctx.fillStyle = '#ffffff'; const k = (t % 90); ctx.fillRect(x + k * scale * 1.2, y + 2, scale, s - 4); }
  };
  G.badge = function (id) { const w = new G.Wait(); G.audio.jingle('promote'); G.push(new BadgeCard(id, w)); return w; };

  // ---------- New errand card: who asked -> what they want, in pictures ----------
  class QuestCard {
    constructor(id, w) { G.toastT = 0; this.transparent = true; this.id = id; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 30 && (G.input.p('A') || G.input.p('B'))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const q = D().quests[this.id], gw = G.goalWidth(q.goal), W = Math.max(150, gw + 80), H = 64, x = (G.W - W) / 2, y = 50 + Math.max(0, 10 - this.t);
      G.win(ctx, x, y, W, H, { fill1: '#2a6a3a', fill2: '#103a1c' });
      G.textC(ctx, '¡Misión!', G.W / 2, y + 8, '#f8e060');
      const gx = (G.W - (gw + 48)) / 2;
      ctx.drawImage(G.unitSprite(D().npcs[q.giver].map, 'down', (this.t >> 4) & 1), gx, y + 24);
      G.drawIcon16(ctx, 'flecha', gx + 28, y + 28);
      G.drawGoal(ctx, q.goal, gx + 48, y + 28);
      if (G.enVisible()) G.textC(ctx, q.en, G.W / 2, y + H + 4, '#f8e8b0');
    }
  }
  G.questCard = function (id) { const w = new G.Wait(); G.audio.sfx('buff'); G.push(new QuestCard(id, w)); return w; };

  // ---------- Picture goals (Misiones, thought bubbles) ----------
  // goal: [[word, count], '>', ...] -> draws icons left to right; returns width
  G.drawGoal = function (ctx, goal, x, y) {
    let cx = x;
    for (const g of goal) {
      if (g === '>') { G.drawIcon16(ctx, 'flecha', cx, y); cx += 18; continue; }
      const [id, n] = g;
      for (let i = 0; i < n; i++) { G.drawIcon16(ctx, D().words[id] || id, cx, y); cx += n > 1 ? 12 : 18; }
      if (n > 1) cx += 8;
    }
    return cx - x;
  };

  G.goalWidth = goal => goal.reduce((w, g) => w + (g === '>' ? 18 : g[1] > 1 ? g[1] * 12 + 8 : 18), 0);

  G.nameOf = function (who) {
    if (who === 'player') return D().player.name;
    return D().npcs[who] ? D().npcs[who].name : null;
  };
})();
