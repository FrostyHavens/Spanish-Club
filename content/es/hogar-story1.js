// ===== En casa, chapters 1 and 2 (docs/UNIT_EN_CASA.md): ¡Tengo hambre! and Pon la mesa =====
// The kitchen's two first chapters, the home line 'hogar' (content/es/hogar.js has the table, the rooms and Papá).
//   1 ¡Tengo hambre!  el papá, la cocina, tengo hambre, la sopa, ¡qué rico!
//        She walks into the kitchen (the beat starts by itself: Papá comes to meet her), Papá names himself and the kitchen,
//        goes back to the pot (steam, the dog sniffs), her tummy rumbles and she says she is hungry (her own line), the
//        soup is on the table, she tastes it, the dog gets a taste.
//   2 Pon la mesa     la mesa, la silla, el plato, el vaso, la cuchara
//        Papá needs help: the table is met, then three trips, one thing each (a plate, a glass, a spoon): met at the shelf,
//        held up over her head (the chapter's thing, q: 'hogar2'), carried to the table where it stays. Her chair, then the
//        family sits and there is confetti.
// Only hola and the unit's own words are assumed: si / no, and every other word, only when met (G.words.met). Each new
// word arrives in a one-unknown puzzle (G.intro.show, or her own line: youSay) and is used again soon after.
'use strict';
(function () {
  const CH = G.chapters, K = CH.K, T = K.T, TL = G.TILE;
  const say = K.say, sayShow = K.sayShow, ask = K.ask, siNo = K.siNo;
  const P = tag => G.MAPDATA.cocina.pos[tag];
  const the = (id, o) => G.requests.the(id, o);
  const met = id => !!(G.words && G.words.met(id));
  const bag = () => G.errands.bag;
  const L = G.requests.LINES;
  // lines built from a word (G.requests.LINES: tools/test-spanish.js runs every word through them)
  L['hogar.mira'] = id => '¡Mira! ' + the(id, { cap: 1, bang: 1 });            // ¡Mira! ¡La [sopa]!
  L['hogar.para'] = id => '¡Para ' + the(id) + '!';                            // ¡Para la [mesa]!
  L['hogar.tu'] = id => '¡' + the(id, { my: 'tu', cap: 1 }) + '!';             // ¡Tu [silla]!
  L['hogar.bienvenida'] = id => '¡Bienvenid{o/a} ' + the(id, { pre: 'a' }) + '!'; // ¡Bienvenida a la [cocina]!

  // ---------- where things are in the kitchen (G.MAPDATA.cocina.pos) ----------
  const STOVE = P('papa');                       // Papá at the stove: [4, 2]
  const BOWL = [6, 5];                           // the soup, on the middle of the table
  const SHELF = { plato: [8, 2], vaso: [9, 2], cuchara: [10, 2] };  // the free floor in front of the shelf: plates, glasses, spoons
  const SET = { plato: [5, 5], cuchara: [6, 5], vaso: [7, 5] };     // where each goes on the table (reached from the free tiles round it)
  const CHAIR = [5, 4];                          // her chair
  const SEATS = { papa: [7, 4], mama_g: [7, 6], leo_g: [5, 6] };    // the family at the table (her chair is at 5,4)

  const dirTo = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; };
  const papa = f => f.npc('papa');
  const dog = f => (G.pet && G.pet.mine() ? K.dog(f) : null);
  const papaHome = f => K.place(f, 'papa', STOVE[0], STOVE[1], 'up'); // back at the stove, facing it
  const pointAt = (x, y) => CH.point(x * TL + 12, y * TL);

  // her own line: the new word written among known pictures (a one-unknown puzzle; no card to pick when she knows nothing else)
  function* youSay(id, who, prompt, en, show) {
    const known = G.intro.known(id, 2);
    if (!known.length) { G.intro.meet(id, 'overheard', { who }); yield 40; return; }
    const look = { [id]: 'text' }; known.forEach(k => { look[k] = 'both'; });
    yield* ask(who, prompt, en, id, known, { intro: true, how: 'overheard', look, show: show || id });
  }
  // a word met in a one-unknown puzzle; a word met already (the beat played again after a save in the middle of it): only said
  function* meet(id, who, prompt, en) {
    if (!met(id)) yield* G.intro.show(id, { who, prompt, en });
    else yield* sayShow(who, id, T(prompt, en));
  }
  // met words to choose from beside the answer (never an unmet one: a word is not first seen as a wrong card)
  const others = (answer, prefer) => prefer.filter(k => k !== answer && met(k)).concat(G.intro.known(answer, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== answer).slice(0, 2);

  // =====================================================================
  //  1 · ¡Tengo hambre!   (Papá's soup)
  // =====================================================================
  CH.script('hogar1', [
    { auto: 'cocina', run: function* (f) { // she walks in: Papá comes to meet her; el papá, la cocina; back to the pot, the dog sniffs
      const n = papa(f), d = dog(f);
      yield* K.walk(f, n, 4, 4, 3); n.dir = dirTo(n, f.player);
      yield* say('papa', T('¡[hola], {name}!', 'Hi, {name}!'));
      yield* G.intro.show('elpapa', { who: 'papa', prompt: '¡Soy tu [elpapa:papá]!', en: 'I\'m your dad! (he points at himself)' });
      yield* G.intro.show('cocina', { who: 'papa', prompt: L['hogar.bienvenida']('cocina'), en: 'Welcome to the kitchen! (he waves his arms)' });
      yield* K.walk(f, n, STOVE[0], STOVE[1], 3); n.dir = 'up'; // back to the pot: he stirs
      for (let k = 0; k < 4; k++) { n.dir = k & 1 ? 'up' : 'left'; G.audio.sfx('select'); yield 14; }
      n.dir = 'up';
      if (d) { yield* K.walk(f, d, STOVE[0] + 1, STOVE[1] + 1, 3); d.dir = 'up'; yield* G.pet.play('sniff'); }
    } },
    { who: 'papa', bubble: 'hambre', run: function* (f, c) { // her tummy rumbles: tengo hambre (her own line); Papá carries the soup to the table
      const n = papa(f), p = f.player;
      G.audio.sfx('huh'); K.puff('txt', p.x * TL + 12, p.y * TL - 8, { s: '¡Grrr!', life: 80 }); yield 60;
      n.dir = dirTo(n, p);
      yield* sayShow('papa', 'hambre', T('¿Tienes hambre?', 'Are you hungry? (your tummy rumbles)'));
      yield* youSay('hambre', 'papa', 'Tú: ¡...!', 'Your turn! Tell Papá you are hungry (say it, or tap it)');
      yield* say('papa', T('¡Ya está!', 'It\'s ready! (he carries the pot to the table)'));
      yield* K.walk(f, n, 6, 3, 3); n.dir = 'down';
      c.data.bowl = 1; G.audio.sfx('item');
    } },
    { spot: { map: 'cocina', at: BOWL, icon: 'sopa' }, run: function* (f, c) { // la sopa; the dog sniffs; she tastes it: ¡qué rico!; the dog gets a taste
      const n = papa(f), d = dog(f);
      n.dir = 'down';
      yield* G.intro.show('sopa', { who: 'papa', prompt: L['hogar.mira']('sopa'), en: 'Look! The soup!' });
      if (d) { G.pet.place(f, d); yield* G.pet.play('sniff'); }
      yield* say('papa', T('¡Prueba!', 'Taste it!'));
      G.audio.sfx('item'); K.sparkle(f, BOWL[0], BOWL[1], 6); yield 50;
      yield* G.intro.show('rico', { who: 'papa', prompt: '¡Mmm! ¡[rico:Qué rico]!', en: 'Mmm! So yummy! (you taste it)' });
      for (let k = 0; k < 3; k++) K.puff('heart', n.x * TL + 8 + k * 5, n.y * TL - 6, { life: 50, vy: -0.4 }); // a heart for Papá
      yield* G.review.ask('sopa', { who: 'papa' });
      yield* say('papa', T('¡Y un poquito para {dog}!', 'And a little for {dog}!'));
      if (d) { G.pet.place(f, d); yield* G.pet.play('eat', { item: 'sopa' }); }
      c.data.bowl = 2; papaHome(f);
      yield* G.review.ask('elpapa', { who: 'papa' }); // (el papá comes back: who is this?)
    } },
  ], {
    draw(f, ctx, c) { // the soup on the table, steaming
      if (f.mapId !== 'cocina' || !c.data.bowl || CH.done('hogar1')) return;
      const x = BOWL[0] * TL + 4 - Math.round(f.cam.x), y = BOWL[1] * TL + 2 - Math.round(f.cam.y);
      G.drawIcon16(ctx, 'sopa', x, y);
    },
    drawTop(f, ctx) { // the pot steams, the whole house smells of it
      if (f.mapId !== 'cocina' || CH.done('hogar1')) return;
      steam(ctx, STOVE[0] * TL + 12 - Math.round(f.cam.x), STOVE[1] * TL + 6 - Math.round(f.cam.y), f.t);
    },
  });
  function steam(ctx, x, y, t) { // three little white wisps rising and fading
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const k = ((t >> 1) + i * 14) % 42;
      ctx.globalAlpha = 0.8 * (1 - k / 42); ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (i - 1) * 4 + Math.round(Math.sin((k + i * 9) / 6) * 2), y - Math.round(k / 3), 2, 2);
    }
    ctx.restore();
  }

  // =====================================================================
  //  2 · Pon la mesa   (the shelf, three trips, the table)
  // =====================================================================
  // a trip's first half: at the shelf the thing is met (one unknown) and goes into her hands (the chapter's thing)
  const shelfBeat = (id, en) => ({ spot: { map: 'cocina', at: SHELF[id], icon: id }, run: function* (f) {
    yield* meet(id, 'papa', L['hogar.mira'](id), en);
    if (!bag().has(id, { q: 'hogar2' })) bag().add(id, { q: 'hogar2' });
    yield* sayShow('papa', id, T(L['hogar.para']('mesa'), 'For the table! (carry it there: tap the table)'));
  } });
  // ...and the second: it goes on the table and stays there (c.data.set, drawn below)
  const tableBeat = id => ({ spot: { map: 'cocina', at: SET[id], icon: id }, run: function* (f, c) {
    (c.data.set || (c.data.set = {}))[id] = 1; // (on the table first, then out of her hands: take saves both, so a save in the middle of this beat keeps the plate on the table)
    bag().take(id, { q: 'hogar2' });
    G.audio.sfx('pop'); K.sparkle(f, SET[id][0], SET[id][1], 5); yield 24;
    yield* G.review.ask(id, { who: 'papa' });
    yield* say('papa', T('¡Muy bien, {name}!', 'Very good, {name}!'));
  } });
  CH.script('hogar2', [
    { who: 'papa', run: function* (f) { // ¡A comer! ¿Me ayudas? la mesa
      const n = papa(f); n.dir = dirTo(n, f.player);
      yield* say('papa', T('¡A comer!', 'Time to eat!'));
      if (met('hambre')) yield* G.review.ask('hambre', { who: 'papa' });
      if (met('si') && met('no')) yield* siNo('papa', '¿Me ayudas?', 'Will you help me? (say yes!)', true, { show: { icon: 'pregunta' } });
      else yield* sayShow('papa', { icon: 'pregunta' }, T('¿Me ayudas?', 'Will you help me?'));
      pointAt(...P('table'));
      try { yield* G.intro.show('mesa', { who: 'papa', prompt: L['hogar.mira']('mesa'), en: 'Look! The table!' }); } finally { CH.point(null); }
      pointAt(SHELF.vaso[0], 1);
      try { yield* say('papa', T(L['hogar.para']('mesa'), 'For the table! (fetch things from the shelf)')); } finally { CH.point(null); }
    } },
    shelfBeat('plato', 'Look! A plate! (it goes in your hands)'),
    tableBeat('plato'),
    shelfBeat('vaso', 'Look! A glass!'),
    tableBeat('vaso'),
    shelfBeat('cuchara', 'Look! A spoon!'),
    tableBeat('cuchara'),
    { spot: { map: 'cocina', at: CHAIR, icon: 'silla' }, run: function* (f) { // Papá pulls out her chair: la silla
      const n = papa(f);
      yield* K.walk(f, n, CHAIR[0] - 1, CHAIR[1] - 1, 3); n.dir = 'down';
      G.audio.sfx('select'); K.puff('dust', CHAIR[0] * TL + 12, CHAIR[1] * TL + 18, { life: 24, vy: -0.3 });
      yield* G.intro.show('silla', { who: 'papa', prompt: L['hogar.tu']('silla'), en: 'Your chair! (he pulls it out for you)' });
      papaHome(f);
    } },
    { who: 'papa', run: function* (f, c) { // Papá holds a thing up: ¿Qué es?; the family sits down; confetti
      const n = papa(f); n.dir = dirTo(n, f.player);
      yield* say('papa', T('¡A comer!', 'Time to eat!'));
      const up = 'vaso';
      yield* ask('papa', '¿Qué es?', 'He holds something up: what is it? (tap its word)', up, others(up, ['plato', 'cuchara']), { show: up, look: { vaso: 'text', plato: 'text', cuchara: 'text' } });
      yield* G.review.ask('silla', { who: 'papa' });
      yield* G.review.ask('cocina', { who: 'papa' });
      // everyone sits: Mamá and Leo come in from the yard (as guests), Papá takes his chair, she takes hers
      const p = f.player, was = [p.x, p.y, p.dir], back = G.errands.stage(f, { papa: [4, 3, 'down'], mama_g: [10, 5, 'left'], leo_g: [10, 4, 'left'] });
      try {
        for (const id of ['papa', 'mama_g', 'leo_g']) { const m = f.npc(id), s = SEATS[id]; if (m) yield* K.walk(f, m, s[0], s[1], 3); }
        Object.assign(p, { x: CHAIR[0], y: CHAIR[1], ox: 0, oy: 0, dir: 'right' }); f.snapCam();
        f.npc('papa').dir = 'left'; f.npc('mama_g').dir = 'left'; f.npc('leo_g').dir = 'right';
        K.confetti(); G.audio.jingle('item'); yield 90;
        for (let k = 0; k < 3; k++) K.puff('heart', SEATS.papa[0] * TL + 8 + k * 5, SEATS.papa[1] * TL - 6, { life: 50, vy: -0.4 });
        yield 70;
      } finally { Object.assign(p, { x: was[0], y: was[1], ox: 0, oy: 0, dir: was[2] }); f.snapCam(); G.errands.unstage(f, back); papaHome(f); }
    } },
  ], {
    draw(f, ctx, c) { // what she has put on the table
      if (f.mapId !== 'cocina' || !c.data.set || CH.done('hogar2')) return;
      for (const id in c.data.set) { const at = SET[id]; if (at) G.drawIcon16(ctx, id, at[0] * TL + 4 - Math.round(f.cam.x), at[1] * TL + 3 - Math.round(f.cam.y)); }
    },
  });
})();
