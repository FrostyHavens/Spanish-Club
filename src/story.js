// ===== Story scenes: opening, Mamá's intro, the club party, the diploma (original) =====
'use strict';
(function () {
  const F = () => G.state.flags, S = G.st;
  const T = (t, en) => ({ t, en });
  const ST = G.story = {};
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who) }); }

  // ---------- Opening: bilingual scroll over a sunny sky ----------
  class Crawl {
    constructor(lines, w) { this.lines = lines; this.w = w; this.t = 0; this.y = G.H + 10; this.clouds = Array.from({ length: 6 }, (_, i) => [G.r(G.W), 20 + i * 22, 0.1 + G.rand() * 0.2]); }
    update() {
      this.t++; this.y -= G.input.h('A') ? 1.4 : 0.4;
      const end = this.y + this.lines.length * 24;
      if (end < -10 || G.input.p('B')) { G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, G.H); g.addColorStop(0, '#3a88e0'); g.addColorStop(1, '#a8d8f8'); ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
      ctx.fillStyle = '#f8e060'; ctx.beginPath(); ctx.arc(G.W - 40, 36, 16 + Math.sin(this.t / 30), 0, Math.PI * 2); ctx.fill();
      this.clouds.forEach(c => { c[0] = (c[0] + c[2]) % (G.W + 60); ctx.fillStyle = 'rgba(255,255,255,0.85)'; const x = c[0] - 30; ctx.fillRect(x, c[1], 40, 8); ctx.fillRect(x + 8, c[1] - 5, 20, 6); });
      ctx.fillStyle = 'rgba(10,20,60,0.45)'; ctx.fillRect(20, 0, G.W - 40, G.H);
      this.lines.forEach(([es, en], i) => {
        const y = Math.round(this.y + i * 24); if (y < -20 || y > G.H + 4) return;
        G.textC(ctx, es, G.W / 2, y, i === 0 ? '#f8e060' : '#ffffff');
        if (en) G.textC(ctx, en, G.W / 2, y + 10, '#b8c8f0');
      });
      G.textR(ctx, 'B: saltar', G.W - 4, G.H - 10, '#e0e8ff');
    }
  }
  ST.crawl = function (lines) { const w = new G.Wait(); G.push(new Crawl(lines, w)); return w; };
  ST.opening = [
    ['CLUB DE ESPAÑOL', 'SPANISH CLUB'],
    ['', ''],
    ['Villa Sol es un pueblo pequeño y bonito.', 'Villa Sol is a small, pretty town.'],
    ['Alex y su familia viven aquí.', 'Alex and their family live here.'],
    ['Hoy es un día especial:', 'Today is a special day:'],
    ['¡el primer día en el Club de Español!', 'the first day at the Spanish Club!'],
    ['', ''],
    ['En Villa Sol, todos hablan español.', 'In Villa Sol, everyone speaks Spanish.'],
    ['¿No entiendes? ¡No pasa nada!', 'Don\'t understand? No problem!'],
    ['Mantén presionada la C para ver el inglés.', 'Hold down C to see the English.'],
  ];

  // ---------- Mamá: first morning ----------
  ST.mamaIntro = function* () {
    yield* say('mama', T('¡Buenos días, Alex!', 'Good morning, Alex!'));
    yield G.teach('buenosdias');
    yield* say('mama', T('Hoy es tu primer día en el Club de Español. ¡Qué emoción!', 'Today is your first day at the Spanish Club. How exciting!'),
      T('La Profesora Luna te espera en la escuela. La escuela está al norte de la plaza.', 'Profesora Luna is waiting for you at the school. The school is north of the square.'),
      T('Recuerda: mantén presionada la C para ver el inglés. Presiona X para abrir el menú y ver tu cuaderno.', 'Remember: hold C to see the English. Press X to open the menu and see your notebook.'));
    yield* say('mama', T('¡Adiós, Alex! ¡Que te diviertas!', 'Goodbye, Alex! Have fun!'));
    yield G.teach('adios');
    yield* G.ask({ prompt: 'Mamá dice: «¡Adiós!» ¿Qué dices tú?', en: 'Mom says "Goodbye!" What do you say?', who: 'mama', layout: 'list',
      choices: [{ label: '¡Adiós, mamá!', en: 'Goodbye, Mom!' }, { label: 'Uvas.', en: 'Grapes.' }, { label: 'Cinco.', en: 'Five.' }], answer: 0, word: 'adios' });
    F().intro = true;
  };

  // ---------- La fiesta: a friendly review quiz, then the diploma ----------
  ST.fiesta = function* () {
    yield* say('luna', T('¡Alex! ¡Ayudaste a todo el pueblo! ¡Es la hora de la fiesta del club!', 'Alex! You helped the whole town! It\'s time for the club party!'),
      T('Pero primero... ¡un juego! Cinco preguntas. ¿Lista? ¿Listo? ¡Vamos!', 'But first... a game! Five questions. Ready? Let\'s go!'));
    const W = G.data.words, known = Object.keys(G.state.words).filter(id => W[id]);
    const picks = known.slice().sort(() => G.rand() - 0.5).slice(0, 5);
    let firsts = 0;
    for (let i = 0; i < picks.length; i++) {
      const id = picks[i], topic = W[id].topic;
      let pool = known.filter(k => W[k].topic === topic);
      if (pool.length < 3) pool = known;
      const c = G.wordChoices(id, pool, 3, { noIcon: true, label: k => W[k].es.split(' / ')[0] });
      if (yield* G.ask({ prompt: 'Pregunta ' + (i + 1) + ': ¿Qué es?', en: 'Question ' + (i + 1) + ': What is it?', show: W[id], choices: c.choices, answer: c.answer, layout: 'list', word: id, who: 'luna' })) firsts++;
    }
    yield* say('luna', firsts >= 4 ? T('¡Increíble! ¡Eres una estrella!', 'Incredible! You\'re a star!') : T('¡Muy bien! ¡Aprendes muy rápido!', 'Very good! You learn very fast!'));
    G.st.finishQuest('fiesta');
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
      G.textC(ctx, 'Club de Español de Villa Sol', G.W / 2, y + 34, '#604020', null);
      G.bigText(ctx, G.data.player.name, G.W / 2, y + 58, 2, '#203080', null);
      G.textC(ctx, 'habla un poco de español. ¡Felicidades!', G.W / 2, y + 74, '#302018', null);
      G.textC(ctx, 'Palabras: ' + G.st.learnedCount() + '     \u0005 ' + G.state.stars, G.W / 2, y + 90, '#604020', null);
      ['saludos', 'mercado', 'pelota', 'carta', 'fiesta'].forEach((id, k) => G.drawBadge(ctx, id, G.W / 2 - 92 + k * 40, y + 108, this.t + k * 15));
      G.textC(ctx, 'Profesora Luna', G.W / 2 + 50, y + h - 24, '#203080', null);
      ctx.fillStyle = '#806040'; ctx.fillRect(G.W / 2 + 14, y + h - 14, 72, 1);
      if (G.enVisible()) G.textC(ctx, 'Diploma: ' + G.data.player.name + ' speaks a little Spanish. Congratulations!', G.W / 2, y + h - 40, '#a07030', null);
    }
  }
  ST.diploma = function () { const w = new G.Wait(); G.push(new Diploma(w)); return w; };
})();
