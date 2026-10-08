// ===== Story scenes: Mamá's first lesson, the club party, the diploma (original) =====
'use strict';
(function () {
  const F = () => G.state.flags, S = G.st;
  const T = (t, en) => ({ t, en });
  const ST = G.story = {};
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }
  const words = (...ids) => ids.map(id => ({ word: id }));

  // ---------- Mamá: the very first words ----------
  // No controls card interrupts it: the hand in hint.js shows where to tap when a child is stuck, and keyboard
  // players get a strip of the keys once it's done. main.js keeps the house locked until it ends; the guard on
  // the field stops it starting a second time while it runs.
  ST.mamaIntro = function* () {
    const f = G.field; if (f && f.introBusy) return;
    if (f) f.introBusy = true;
    yield* say('mama', T('¡[hola], {name}! ¡Qué guap{o/a}!', 'Hello, {name}! Don\'t you look nice!'));
    yield* G.ask({ prompt: '¡[hola]!', en: 'Mom says hello. Say it back!', layout: 'cards', who: 'mama', choices: words('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    yield* G.ask({ prompt: '¡[buenosdias]!', en: 'Good morning! (the sun is up)', layout: 'cards', who: 'mama', choices: words('buenosdias', 'uvas', 'carta'), answer: 0, learn: 'buenosdias' });
    yield* say('mama', T('¡Para ti!', 'For you! (a notebook)'));
    yield* G.findPage('saludos');
    yield* say('mama', T('La [escuela]. ¡Vamos!', 'The school. Off you go!'));
    yield* G.ask({ prompt: '¡[adios], {name}!', en: 'Goodbye, {name}!', layout: 'list', who: 'mama', choices: words('hola', 'adios', 'gracias'), answer: 1, learn: 'adios' });
    F().intro = true;
    if (f) f.introBusy = false;
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
    yield* say('luna', T('¡{name}! ¡Muy bien! ¡Fiesta!', '{name}! Well done! Party time!'), T('¿List{o/a}? ¡[uno], [dos], [tres], [cuatro], [cinco]!', 'Ready? A game first: five questions!'));
    yield* ST.review(5);
    yield* say('luna', T('¡Bravo, {name}!', 'Bravo, {name}!'));
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
    update() { this.t++; if (this.t > 60 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const x = 24, y = 14, w = G.W - 48, h = G.H - 28;
      ctx.fillStyle = '#5a3810'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#f8f0d0'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#c09040'; ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
      G.bigText(ctx, 'DIPLOMA', G.W / 2, y + 18, 2, '#a05020', null);
      G.textC(ctx, 'Club de Español', G.W / 2, y + 34, '#604020', null);
      G.bigText(ctx, G.st.playerName(), G.W / 2, y + 58, 2, '#203080', null);
      ctx.fillStyle = '#5a3810'; ctx.fillRect(x + 15, y + 15, 54, 54); G.drawPortrait(ctx, G.st.playerSpec().portrait, x + 16, y + 16, this.t);
      G.drawIcon(ctx, 'book', G.W / 2 - 70, y + 76); G.text(ctx, String(G.st.learnedCount()), G.W / 2 - 42, y + 82, '#604020', null);
      G.text(ctx, '\u0005 ' + G.state.stars, G.W / 2 + 26, y + 82, '#c08010', null);
      const said = G.st.micStars(); if (said) { G.mic.glyph(ctx, G.W / 2 + 62, y + 81, '#2a8a9a'); G.text(ctx, String(said), G.W / 2 + 72, y + 82, '#2a8a9a', null); } // speaking stars
      ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'].forEach((id, k) => G.drawBadge(ctx, id, G.W / 2 - 92 + k * 40, y + 108, this.t + k * 15));
      G.textC(ctx, 'Luna', G.W / 2 + 50, y + h - 24, '#203080', null);
      ctx.fillStyle = '#806040'; ctx.fillRect(G.W / 2 + 14, y + h - 14, 72, 1);
      if (G.enVisible()) G.textC(ctx, 'Words learned and stars earned', G.W / 2, y + 96, '#a07030', null);
    }
  }
  ST.diploma = function () { const w = new G.Wait(); G.push(new Diploma(w)); return w; };
})();
