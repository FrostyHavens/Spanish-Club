// ===== Story scenes: wordless sunrise, Mamá's first lesson, the club party, the diploma (original) =====
'use strict';
(function () {
  const F = () => G.state.flags, S = G.st;
  const T = (t, en) => ({ t, en });
  const ST = G.story = {};
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who) }); }
  const words = (...ids) => ids.map(id => ({ word: id }));

  // ---------- Opening: sunrise over Villa Sol, no words ----------
  class Sunrise {
    constructor(w) { this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 300 || (this.t > 20 && (G.input.p('A') || G.input.p('B')))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const k = Math.min(1, this.t / 220);
      G.drawBattleBG(ctx, 'town', this.t);
      // the sun climbs from behind the rooftops
      const sy = 120 - k * 90;
      ctx.fillStyle = 'rgba(255,220,120,0.35)'; ctx.beginPath(); ctx.arc(250, sy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8e060'; ctx.beginPath(); ctx.arc(250, sy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(20,10,60,' + (0.75 * (1 - k)).toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H);
      ctx.fillStyle = 'rgba(255,140,60,' + (0.25 * Math.sin(k * Math.PI)).toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H);
      if (this.t > 160) { ctx.globalAlpha = Math.min(1, (this.t - 160) / 40); G.bigText(ctx, 'Villa Sol', G.W / 2, 40, 3, '#fff8e0', '#702010'); ctx.globalAlpha = 1; }
    }
  }
  ST.sunrise = function () { const w = new G.Wait(); G.push(new Sunrise(w)); return w; };

  // ---------- Button hints, in pictures ----------
  class KeyHint {
    constructor(w) { this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 30 && (G.input.p('A') || G.input.p('B'))) { G.pop(); this.w.resolve(); } }
    key(ctx, k, x, y) { G.win(ctx, x, y, 22, 20, { fill1: '#e8e8f0', fill2: '#b8b8c8', alpha: 1 }); G.textC(ctx, k, x + 11, y + 6, '#202040', null); }
    draw(ctx) {
      const x = G.W / 2 - 70, y = 40;
      G.win(ctx, x, y, 140, 104);
      const touch = !!document.getElementById('tcpad');
      this.key(ctx, touch ? 'A' : 'Z', x + 14, y + 10); G.drawIcon16(ctx, 'pregunta', x + 44, y + 12); G.drawIcon16(ctx, 'si', x + 64, y + 12);
      this.key(ctx, touch ? 'B' : 'X', x + 14, y + 40); G.drawIcon(ctx, 'book', x + 42, y + 40); G.drawIcon(ctx, 'quest', x + 68, y + 40);
      this.key(ctx, 'C', x + 14, y + 70); // C: hear it again
      ctx.fillStyle = '#f8e060'; ctx.fillRect(x + 46, y + 76, 4, 8); ctx.fillRect(x + 50, y + 73, 2, 14); ctx.fillRect(x + 52, y + 71, 2, 18);
      for (let i = 0; i < 3; i++) { ctx.fillRect(x + 58 + i * 4, y + 78 - i * 2, 1, 4 + i * 4); }
      if ((this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', x + 124, y + 90, '#f8e060');
    }
  }
  ST.keyHint = function () { const w = new G.Wait(); G.push(new KeyHint(w)); return w; };

  // ---------- Mamá: the very first words ----------
  ST.mamaIntro = function* () {
    yield* say('mama', T('¡[hola], Alex!', 'Hello, Alex!'));
    yield* G.ask({ prompt: '¡[hola]!', en: 'Mom says hello. Say it back!', layout: 'cards', who: 'mama', choices: words('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    yield* G.ask({ prompt: '¡[buenosdias]!', en: 'Good morning! (the sun is up)', layout: 'cards', who: 'mama', choices: words('buenosdias', 'uvas', 'carta'), answer: 0, learn: 'buenosdias' });
    yield* say('mama', T('¡Para ti!', 'For you! (a notebook)'));
    yield* G.findPage('saludos');
    yield ST.keyHint();
    yield* say('mama', T('La [escuela]. ¡Vamos!', 'The school. Off you go!'));
    yield* G.ask({ prompt: '¡[adios], Alex!', en: 'Goodbye, Alex!', layout: 'list', who: 'mama', choices: words('hola', 'adios', 'gracias'), answer: 1, learn: 'adios' });
    F().intro = true;
  };

  // ---------- Review: words seen but not yet learned come first ----------
  ST.review = function* (n = 5) {
    const Wd = G.data.words, seen = Object.keys(G.state.words).filter(id => Wd[id]);
    const shuffle = a => a.sort(() => G.rand() - 0.5);
    const picks = shuffle(seen.filter(id => !S.knows(id))).concat(shuffle(seen.filter(S.knows))).slice(0, n);
    for (const id of picks) {
      let pool = seen.filter(k => Wd[k].topic === Wd[id].topic); if (pool.length < 3) pool = seen;
      const c = G.wordChoices(id, pool, 3, { text: true });
      yield* G.ask({ prompt: '¿...?', en: 'What is it?', show: Wd[id], choices: c.choices, answer: c.answer, layout: 'list', learn: id, who: 'luna' });
    }
  };

  // ---------- La fiesta: a review game, then the diploma ----------
  ST.fiesta = function* () {
    yield* say('luna', T('¡Alex! ¡Muy bien! ¡Fiesta!', 'Alex! Well done! Party time!'), T('¿...? ¡[uno], [dos], [tres], [cuatro], [cinco]!', 'A game first: five questions!'));
    yield* ST.review(5);
    yield* say('luna', T('¡Bravo, Alex!', 'Bravo, Alex!'));
    S.finishQuest('fiesta');
    yield G.badge('fiesta');
    G.audio.play('victory');
    yield ST.diploma();
    G.audio.play('town', true);
    yield G.fadeTo(1, 0.06);
    G.goto('escuela', 6, 4, 'down');
  };

  // ---------- Diploma ----------
  class Diploma {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 60 && (G.input.p('A') || G.input.p('B'))) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const x = 24, y = 14, w = G.W - 48, h = G.H - 28;
      ctx.fillStyle = '#5a3810'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#f8f0d0'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#c09040'; ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
      G.bigText(ctx, 'DIPLOMA', G.W / 2, y + 18, 2, '#a05020', null);
      G.textC(ctx, 'Club de Español', G.W / 2, y + 34, '#604020', null);
      G.bigText(ctx, G.data.player.name, G.W / 2, y + 58, 2, '#203080', null);
      G.drawIcon(ctx, 'book', G.W / 2 - 70, y + 76); G.text(ctx, String(G.st.learnedCount()), G.W / 2 - 42, y + 82, '#604020', null);
      G.text(ctx, '\u0005 ' + G.state.stars, G.W / 2 + 26, y + 82, '#c08010', null);
      ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'].forEach((id, k) => G.drawBadge(ctx, id, G.W / 2 - 92 + k * 40, y + 108, this.t + k * 15));
      G.textC(ctx, 'Luna', G.W / 2 + 50, y + h - 24, '#203080', null);
      ctx.fillStyle = '#806040'; ctx.fillRect(G.W / 2 + 14, y + h - 14, 72, 1);
      if (G.enVisible()) G.textC(ctx, 'Words learned and stars earned', G.W / 2, y + 96, '#a07030', null);
    }
  }
  ST.diploma = function () { const w = new G.Wait(); G.push(new Diploma(w)); return w; };
})();
