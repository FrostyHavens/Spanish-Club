// ===== Story scenes: Luna's review and the diploma (the story itself is in chapters: src/chapters.js) =====
'use strict';
(function () {
  const F = () => G.state.flags, S = G.st;
  const T = (t, en) => ({ t, en });
  const ST = G.story = {};
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }

  // (Mamá's first lesson is chapter 1 now: content/es/story-c01-c10.js. The old name still starts the story, for tools.)
  ST.mamaIntro = function* () { yield 1; };

  // ---------- Review (Luna's "¿Repaso?"): the words due first (words.js), then the weakest met words ----------
  ST.review = function* (n = 5) {
    const due = G.review.due(n), weak = G.words.list(1).filter(id => due.indexOf(id) < 0).sort((a, b) => G.words.stage(a) - G.words.stage(b) || G.rand() - 0.5);
    for (const id of due.concat(weak).slice(0, n)) yield* G.review.ask(id, { who: 'luna' });
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
      if (S.done('fiestab') || S.done('c21')) G.textC(ctx, G.fill('¡Amig{o/a} de los animales!'), cx + 20, y + 68, '#c03030', null);
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
      const ids = G.data.badgeOrder.concat((G.data.legacyQuests || []).filter(id => S.done(id))), rows = ids.length > 14 ? 2 : 1, n1 = Math.ceil(ids.length / rows);
      const per = Math.min(22, Math.floor((w - 16) / n1));
      ids.forEach((id, k) => {
        const r = Math.floor(k / n1), inRow = Math.min(n1, ids.length - r * n1), bx = cx - (inRow * per) / 2 + (per - 16) / 2, by = y + (rows === 2 ? 100 : 106) + r * 19;
        if (S.done(id)) G.drawBadge(ctx, id, bx + (k % n1) * per, by, this.t + k * 12);
        else { ctx.strokeStyle = '#d8c8a0'; ctx.beginPath(); ctx.arc(bx + (k % n1) * per + 8, by + 8, 9, 0, Math.PI * 2); ctx.stroke(); }
      });
      // best friends
      const best = G.hearts ? G.hearts.WHO.filter(n => G.hearts.best(n)) : [];
      if (best.length) { G.hearts.heart(ctx, x + 16, y + 146, true, 2); G.text(ctx, 'Amigos', x + 34, y + 148, '#a03060', null); }
      best.slice(0, 8).forEach((n, k) => { ctx.fillStyle = '#5a3810'; ctx.fillRect(x + 81 + k * 26, y + 140, 24, 24); G.hearts.face(ctx, n, x + 82 + k * 26, y + 141, 22, this.t); });
      G.textC(ctx, 'Luna', cx + 70, y + h - 24, '#203080', null);
      ctx.fillStyle = '#806040'; ctx.fillRect(cx + 34, y + h - 14, 72, 1);
      if (G.enVisible()) G.textC(ctx, 'Words, stars, speaking stars, animals; a badge per errand', cx, y + 126, '#a07030', null);
    }
  }
  ST.diploma = function () { const w = new G.Wait(); G.push(new Diploma(w)); return w; };
})();
