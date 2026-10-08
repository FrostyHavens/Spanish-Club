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

  // ---------- Diploma ----------
  // The end of the game (errands.js: after the animal party): everything the child did, on one page. Words learned,
  // stars, speaking stars, animals met (the album), and a badge for every errand (a faint ring for one not done yet).
  class Diploma {
    constructor(w) { G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; }
    update() { this.t++; if (this.t > 60 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.pop(); this.w.resolve(); } }
    draw(ctx) {
      const x = 24, y = 10, w = G.W - 48, h = G.H - 20, cx = G.W / 2;
      ctx.fillStyle = '#5a3810'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#f8f0d0'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#c09040'; ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
      G.bigText(ctx, 'DIPLOMA', cx + 20, y + 16, 2, '#a05020', null);
      G.textC(ctx, 'Club de Español', cx + 20, y + 32, '#604020', null);
      G.bigText(ctx, G.st.playerName(), cx + 20, y + 50, 2, '#203080', null);
      ctx.fillStyle = '#5a3810'; ctx.fillRect(x + 11, y + 11, 54, 54); G.drawPortrait(ctx, G.st.playerSpec().portrait, x + 12, y + 12, this.t);
      const S = G.st, animals = G.animals ? G.animals.list().filter(G.animals.met).length : 0, all = G.animals ? G.animals.list().length : 11;
      if (S.done('fiestab')) G.textC(ctx, G.fill('¡Amig{o/a} de los animales!'), cx + 20, y + 68, '#c03030', null);
      // words learned, stars, speaking stars, animals met
      const row = y + 84, items = [['book', S.learnedCount()], ['star', G.state.stars], ['mic', S.micStars()], ['pata', animals + '/' + all]];
      items.forEach(([ic, n], k) => {
        const ix = x + 14 + k * 66;
        if (ic === 'book') G.drawIcon(ctx, 'book', ix, row - 6);
        else if (ic === 'star') G.text(ctx, '\u0005', ix + 6, row, '#c08010', null);
        else if (ic === 'mic') G.mic.glyph(ctx, ix + 6, row - 1, '#2a8a9a');
        else G.drawIcon16(ctx, 'pata', ix + 2, row - 5);
        G.text(ctx, String(n), ix + 24, row, ic === 'mic' ? '#2a8a9a' : ic === 'star' ? '#c08010' : '#604020', null);
      });
      // a badge for every errand
      const ids = G.data.badgeOrder.concat(S.done('fiesta') ? ['fiesta'] : []), per = Math.min(22, Math.floor((w - 16) / ids.length)), bx = cx - (ids.length * per) / 2 + (per - 16) / 2;
      ids.forEach((id, k) => {
        if (S.done(id)) G.drawBadge(ctx, id, bx + k * per, y + 106, this.t + k * 12);
        else { ctx.strokeStyle = '#d8c8a0'; ctx.beginPath(); ctx.arc(bx + k * per + 8, y + 114, 9, 0, Math.PI * 2); ctx.stroke(); }
      });
      // best friends
      const best = G.hearts ? G.hearts.WHO.filter(n => G.hearts.best(n)) : [];
      best.slice(0, 8).forEach((n, k) => { ctx.fillStyle = '#5a3810'; ctx.fillRect(x + 13 + k * 22, y + h - 37, 20, 20); G.hearts.face(ctx, n, x + 14 + k * 22, y + h - 36, 18, this.t); });
      G.textC(ctx, 'Luna', cx + 70, y + h - 24, '#203080', null);
      ctx.fillStyle = '#806040'; ctx.fillRect(cx + 34, y + h - 14, 72, 1);
      if (G.enVisible()) G.textC(ctx, 'Words, stars, speaking stars, animals; a badge per errand', cx, y + 136, '#a07030', null);
    }
  }
  ST.diploma = function () { const w = new G.Wait(); G.push(new Diploma(w)); return w; };
})();
