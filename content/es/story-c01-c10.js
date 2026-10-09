// ===== The story, chapters 1-10 (docs/CURRICULUM.md section 4): Canelo arrives, the cat, the morning, Don Pepe's game,
// the red ball, bread for the ducks, Canelo lost, Luna's school, the first evening, tired Tomás =====
// Each chapter is a list of beats for G.chapters (src/chapters.js: who / spot / spots / tap / auto / door / evening
// triggers; run(f, c) plays it). Every new word arrives in a one-unknown puzzle (G.intro.show / watch, or a find-it on
// the map) and is used again within a minute or two; older words come back in the questions people need answered.
// Lines: T('Spanish', 'English for grown-ups'); [id] marks a word (an unmet one is drawn as its picture only); a sound
// someone makes ("¡Miau!") is plain text when the child must pick who makes it. Mexican Spanish, present tense, short.
'use strict';
(function () {
  const CH = G.chapters, K = CH.K, T = K.T, TL = G.TILE, S = G.st;
  const F = () => G.state.flags;
  const say = K.say, sayShow = K.sayShow, tell = K.tell, ask = K.ask, siNo = K.siNo;
  const V = tag => G.MAPDATA.villa.pos[tag];
  const W = id => G.data.words[id];
  const found = id => () => G.intro.found(id);
  const tile = (x, y) => ({ x: x * TL + 12, y: y * TL });               // a point over a tile (for the pointing arrow)
  const ani = (f, kind) => { const a = G.animals && G.animals.find(kind, f); return a ? { x: a.x, y: a.y - 12, a } : null; };
  const pointAni = (f, kind) => { const p = ani(f, kind); return p ? { x: p.x, y: p.y } : null; };
  const catP = f => (f.amb && f.amb.cat ? { x: f.amb.cat.x * TL + 12, y: f.amb.cat.y * TL - 8 } : null);
  const BLUE = '#3068e0', GREEN = '#38b040', RED = '#e03028';
  const ball = col => ({ icon: 'pelota', col });

  // ---------- Canelo ----------
  const dog = f => K.dog(f);
  const dogAt = (f, x, y, dir) => { const n = dog(f); Object.assign(n, { x, y, ox: 0, oy: 0, home: [x, y], slide: false, moving: false }); if (dir) n.dir = dir; return n; };
  function* run(f, x, y, sp = 4) { yield* K.walk(f, dog(f), x, y, sp); }
  const toward = (n, p) => { const dx = p.x - n.x, dy = p.y - n.y; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; };
  // he races to you, hops up and a heart pops (understanding "¡ven!")
  function* come(f) {
    const n = dog(f), p = f.player;
    const c = [[p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y + 1], [p.x, p.y - 1]].find(([x, y]) => !f.blocked(x, y, n) && !f.exitAt(x, y));
    if (c) yield* K.walk(f, n, c[0], c[1], 4);
    n.dir = toward(n, p);
    yield* G.pet.play('wake'); K.heart(f, n);
  }
  const tries = (f, k) => { const n = dog(f); K.puff('txt', n.x * TL + 12, n.y * TL - 6, { s: k + '/3', life: 70 }); G.audio.sfx('select'); };
  const bark = f => K.bark(f, dog(f));
  // what a wrong card does to Canelo: hola -> a paw wave, guau -> a bark, ven -> he jumps up at you, the rest -> "?"
  const dogWrong = f => w => { const n = dog(f); if (w === 'hola') G.pet.anim(n, 'paw'); else if (w === 'guau') bark(f); else if (w === 'ven') { G.pet.anim(n, 'jump'); G.fx.shake = 6; } else G.pet.anim(n, 'huh'); };
  const meow = f => { if (G.ambient && G.ambient.sfx) G.ambient.sfx.meow(); const c = catP(f); if (c) K.puff('heart', c.x + 8, c.y, { life: 50, vy: -0.35 }); };

  // ---------- little pictures drawn on the map by the chapters ----------
  function tail(ctx, f, x, y, col, side = 1) { // a tail wagging out from behind something at tile (x, y)
    const sx = x * TL + 12 + side * 9 - Math.round(f.cam.x), sy = y * TL + 14 - Math.round(f.cam.y), w = Math.round(Math.sin(G.frame / 5) * 3);
    ctx.fillStyle = '#1a1420'; ctx.fillRect(sx - 2 + w, sy - 7, 5, 9); ctx.fillStyle = col; ctx.fillRect(sx - 1 + w, sy - 6, 3, 7); ctx.fillRect(sx, sy - 8, 1, 2);
  }
  function peekBall(ctx, f, x, y, col) { // a ball peeking out of a bush
    const sx = x * TL + 16 - Math.round(f.cam.x), sy = y * TL + 15 - Math.round(f.cam.y) + Math.round(Math.sin(G.frame / 20 + x));
    ctx.fillStyle = '#1a1420'; ctx.fillRect(sx - 4, sy - 3, 9, 7); ctx.fillRect(sx - 3, sy - 4, 7, 9);
    ctx.fillStyle = col; ctx.fillRect(sx - 3, sy - 3, 7, 6); ctx.fillRect(sx - 2, sy - 4, 5, 8); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 2, sy - 2, 1, 1);
  }
  function butterfly(ctx, x, y) {
    const o = (G.frame >> 3) & 1; x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#201828'; ctx.fillRect(x, y - 2, 1, 5);
    ctx.fillStyle = '#f8a020'; ctx.fillRect(x - 3 + o, y - 3, 3 - o, 3); ctx.fillRect(x + 1, y - 3, 3 - o, 3);
    ctx.fillStyle = '#f8d060'; ctx.fillRect(x - 2 + o, y, 2, 2); ctx.fillRect(x + 1, y, 2, 2);
  }
  function paws(ctx, f, from, to) { // paw prints along a line of tiles
    for (let k = 0; k <= 6; k++) {
      const u = k / 6, x = (from[0] + (to[0] - from[0]) * u) * TL + 12 + (k & 1 ? 4 : -4) - Math.round(f.cam.x), y = (from[1] + (to[1] - from[1]) * u) * TL + 14 - Math.round(f.cam.y);
      ctx.fillStyle = 'rgba(90,56,24,0.75)'; ctx.fillRect(x - 2, y, 4, 3); ctx.fillRect(x - 3, y - 2, 1, 1); ctx.fillRect(x - 1, y - 3, 1, 1); ctx.fillRect(x + 1, y - 3, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1);
    }
  }
  // someone who isn't on this map, standing in for a scene (Rosa in the bakery, Nico at school), then gone again
  function guest(f, id, x, y, dir) { let n = f.npc(id + '_g'); if (!n) n = f.addNpc({ id: id + '_g', npc: id, x, y, dir: dir || 'down', fixed: true, guest: true }); return n; }
  const unguest = (f, id) => f.removeNpc(id + '_g');
  // put a townsperson somewhere for a chapter (they stay there while it needs them)
  function hold(f, id, x, y, dir) {
    const n = f.npc(id); if (!n) return null;
    if (n.x !== x || n.y !== y) Object.assign(n, { x, y, ox: 0, oy: 0, moving: false });
    Object.assign(n, { home: [x, y], wander: 0, route: null, dir: dir || n.dir });
    if (n.amb) n.amb.follow = false;
    return n;
  }

  // =====================================================================
  //  C1 · ¡Un perro!  (Mamá, home)  hola, perro, guau, ven
  // =====================================================================
  CH.script('c1', [
    { auto: 'casa', run: function* (f, c) { // Mamá says hello; a puppy bursts in, does a lap and hides
      yield 30;
      yield* say('mama', T('¡[hola], {name}!', 'Hello, {name}!'));
      yield* ask('mama', '¡[hola]!', 'Mom says hello. Say it back! (tap it, or say it)', 'hola', [], { intro: true, how: 'show' });
      yield* say('mama', T('¡[hola]! ¡Muy bien!', 'Hello! Very good!'));
      G.audio.sfx('chest'); yield 14; G.audio.sfx('chest'); yield 20; G.pet.sound('bark');
      f.npc('mama').dir = 'down';
      yield* say('mama', T('¿...?', 'What\'s that noise at the door?'));
      G.audio.sfx('door'); yield 10;
      const n = dog(f); dogAt(f, 4, 6, 'up'); n.ghost = true; G.pet.sound('woof');
      yield* f.walkNpc(n, 'urrrulu', 4); G.pet.sound('bark');
      yield* f.walkNpc(n, 'ulldl', 4);
      n.hidden = true; c.data.hid = 1;
      yield 20;
      yield* G.intro.find('perro', { who: 'mama', map: 'casa', at: [3, 3], wrong: [[1, 5], [7, 2]], prompt: '¡Un [perro]! ¿Y el [perro]?', en: 'A dog! Where did the dog go? (tap where he is hiding)' });
    } },
    { auto: 'casa', when: found('perro'), run: function* (f, c) { // he pops out: el perro; he barks: guau
      const n = dog(f); dogAt(f, 4, 3, 'down'); n.hidden = false; c.data.hid = 0;
      G.pet.sound('bark'); yield* G.pet.play('dance');
      yield* say('mama', T('¡El [perro]!', 'The dog!'));
      bark(f); yield 20; bark(f);
      yield* G.intro.show('guau', { who: 'mama', prompt: 'El [perro] dice ¡[guau]!', en: 'The dog says woof!', ask: '¿Qué dice el [perro]?', askEn: 'What does the dog say?', known: ['hola', 'perro'] });
      bark(f); yield 16; bark(f);
    } },
    { auto: 'casa', run: function* (f) { // ¡Saluda a Canelo!, ¿Qué es?, ¿Qué dice Canelo?
      const n = dog(f);
      yield* say('mama', T('¡Se llama Canelo! ¡Saluda a Canelo!', 'His name is Canelo! Say hello to Canelo!'));
      G.pet.anim(n, 'paw');
      yield* ask(null, 'Canelo: ¡...!', 'Canelo waves his paw at you. Say hello!', 'hola', ['perro', 'guau'], { show: { icon: 'pata' }, point: n, wrong: dogWrong(f) });
      bark(f); K.heart(f, n); yield 20;
      yield* ask('mama', '¿Qué es?', 'Mom points at him: what is he?', 'perro', ['hola', 'guau'], { point: n, wrong: dogWrong(f) });
      yield* run(f, 4, 5, 3); n.dir = 'down';
      if (G.animals) G.animals.cry('pajaro'); yield 20; bark(f); yield 12; bark(f);
      yield* ask('mama', '¿Qué dice Canelo?', 'He barks at a bird outside. What does Canelo say?', 'guau', ['hola', 'perro'], { point: n });
      bark(f); yield 10;
    } },
    { auto: 'casa', run: function* (f) { // Mamá calls ¡ven! twice and he runs to her; now you: try 1 of 3
      const n = dog(f);
      yield* run(f, 6, 4, 3); n.dir = 'left'; yield 10;
      yield* say('mama', T('Canelo... ¡[ven]!', 'Canelo... come!'));
      yield* run(f, 4, 2, 4); n.dir = 'left'; K.heart(f, n); G.pet.sound('bark'); yield 20;
      yield* run(f, 7, 4, 3); n.dir = 'left'; yield 10;
      yield* say('mama', T('¡[ven], Canelo!', 'Come, Canelo!'));
      yield* run(f, 4, 2, 4); n.dir = 'left'; K.heart(f, n); G.pet.sound('bark'); yield 16;
      yield* say('mama', T('¡Ahora tú, {name}!', 'Now you, {name}!'));
      yield* run(f, 7, 1, 3); n.dir = 'down'; yield 10;
      yield* ask(null, '¡Ahora tú! Canelo... ¡...!', 'Now you: call Canelo! (say it, or tap it)', 'ven', ['hola', 'guau'], { intro: true, how: 'watch', look: { ven: 'both', hola: 'both', guau: 'both' }, point: n, wrong: dogWrong(f) });
      yield* come(f); tries(f, 1); yield 30;
    } },
    { auto: 'casa', run: function* (f) { // tries 2 and 3; Canelo is yours; the notebook
      const n = dog(f);
      yield* run(f, 1, 2, 3); n.dir = 'right'; G.pet.anim(n, 'huh'); yield 20;
      yield* ask(null, 'Canelo... ¡...!', 'He wandered off again. Call him!', 'ven', ['perro', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* come(f); tries(f, 2); yield 30;
      yield* run(f, 7, 5, 3); n.dir = 'left'; yield 20;
      yield* ask(null, 'Canelo... ¡...!', 'And again! Call him!', 'ven', ['guau', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* come(f); tries(f, 3);
      K.confetti(); G.audio.jingle('promote'); yield 20;
      K.adopt(); if (G.animals) G.animals.meet('perro');
      yield* G.pet.play('dance');
      yield* say('mama', T('¡Canelo es tu [perro]!', 'Canelo is your dog!'));
      yield* G.pet.play('pet'); if (G.hearts) G.hearts.add('canelo', 1, 'care');
      yield* say('mama', T('¡Para ti!', 'For you! (a notebook: every new word goes in it)'));
      yield* G.findPage('saludos');
      F().intro = true;
      yield* say('mama', T('¡Canelo y {name}! ¡A jugar!', 'Canelo and {name}! Off you go and play!'));
    } },
    { door: 'casa', run: function* (f) { // at the door he dawdles at his bowl: call him
      const n = dog(f); dogAt(f, 1, 4, 'left'); G.pet.anim(n, 'huh');
      yield 20;
      yield* ask(null, 'Canelo... ¡...!', 'Canelo is sniffing his bowl. Call him to come out with you!', 'ven', ['hola', 'perro'], { point: n, wrong: dogWrong(f) });
      yield* come(f);
    } },
  ], {
    stage(f, c) { // Canelo in the house before he's yours: hidden under the table, then out
      if (f.mapId !== 'casa' || G.pet.mine()) return;
      const k = c.step;
      if (k < 1 || (k === 1 && !G.intro.found('perro') && !c.data.hid)) return;
      const n = dog(f);
      if (k === 1 && !G.intro.found('perro')) { dogAt(f, 3, 3, 'down'); n.hidden = true; } else if (n.hidden) { n.hidden = false; dogAt(f, 4, 3, 'down'); }
    },
    draw(f, ctx, c) { if (f.mapId === 'casa' && c.step === 1 && !G.intro.found('perro')) tail(ctx, f, 3, 3, '#b87038', 1); },
  });

  // =====================================================================
  //  C2 · El gato de la cerca  (Nico, the plaza and the park fence)  gato, miau
  // =====================================================================
  const NICO_FENCE = [15, 18];
  // Nico's sound game: he says a sound (plain text: heard, not pictured), you tap who makes it
  function* listen(f, who, s, en) { K.npcSay(f, who, s, 120); yield* say(who, T(s, en)); }
  CH.script('c2', [
    { auto: 'villa', run: function* (f, c) { // outside: Canelo chases a butterfly; call him back
      yield 30;
      const n = dog(f);
      c.data.fly = { x: n.x * TL + 12, y: n.y * TL - 10 };
      yield* run(f, 10, 14, 3); n.dir = 'up';
      yield 10; bark(f);
      yield* ask(null, 'Canelo... ¡...!', 'Canelo is chasing a butterfly! Call him back.', 'ven', ['hola', 'guau'], { point: n, wrong: dogWrong(f) });
      c.data.fly = null;
      yield* come(f);
      yield* tell(T('...¡Mira! ¡El parque!', 'Look! Someone is waving from the park.'));
    } },
    { who: 'nico', run: function* (f, c) { // Nico; the cat on the fence: el gato, miau
      yield* ask('nico', 'Nico: ¡...!', 'Nico waves at you. Say hello!', 'hola', ['ven', 'perro'], { show: { icon: 'hola' } });
      yield* say('nico', T('¡[hola]! Soy Nico. ¡Un [perro]!', 'Hi! I\'m Nico. A dog!'));
      yield* ask('nico', '¿Qué dice el [perro]?', 'What does the dog say?', 'guau', ['hola', 'ven'], { point: dog(f) });
      bark(f);
      yield* run(f, 16, 18, 3); dog(f).dir = 'up'; bark(f); yield 14; bark(f);
      meow(f); const cp = catP(f); if (cp) K.puff('ex', cp.x, cp.y - 4, { life: 40 });
      yield 20;
      yield* G.intro.show('gato', { who: 'nico', prompt: '¡Miau! ¡Un [gato]!', en: 'Meow! A cat!', known: ['perro', 'guau'] });
      meow(f); yield 20;
      yield* G.intro.show('miau', { who: 'nico', prompt: 'El [gato] dice ¡[miau]!', en: 'The cat says meow!', ask: '¿Qué dice el [gato]?', askEn: 'What does the cat say?', known: ['guau', 'hola'] });
      meow(f); yield 20;
      yield* say('nico', T('¡Un juego! ¡Escucha!', 'A game! Listen... and tap who says it!'));
      yield* listen(f, 'nico', '¡Miau!', 'Meow! Who says it? Tap them!');
    } },
    { tap: 'cat', hint: (f) => { const p = catP(f); return p ? [Object.assign({ cat: true, secret: true }, p, { y: p.y + 6 })] : []; }, run: function* (f) {
      meow(f);
      yield* say('nico', T('¡[si]!', 'Yes!'));
      yield* ask('nico', '¿Quién es?', 'Who is it?', 'gato', ['perro', 'hola'], { point: catP(f) });
      yield* listen(f, 'nico', '¡Guau, guau!', 'Woof, woof! Who says it? Tap them!');
    } },
    { who: 'canelo', bubble: false, hint: (f) => { const n = f.npc('canelo'); return n ? [{ x: n.x * TL + 12, y: n.y * TL + 12, npc: 'canelo', secret: true }] : []; }, run: function* (f) {
      bark(f); yield* G.pet.play('wake'); bark(f);
      yield* say('nico', T('¡Sí! ¡El [perro]!', 'Yes! The dog!'));
      yield* listen(f, 'nico', '¡Miau!', 'Meow! Who says it? Tap them!');
    } },
    { tap: 'cat', hint: (f) => { const p = catP(f); return p ? [Object.assign({ cat: true, secret: true }, p, { y: p.y + 6 })] : []; }, run: function* (f, c) { // the cat bolts, Canelo chases her; she hides
      meow(f);
      yield* say('nico', T('¡Sí! ¡El [gato]!', 'Yes! The cat!'));
      G.pet.sound('bark'); f.amb.cat.away = true; c.data.away = 1; G.audio.sfx('swing');
      const cp = catP(f); if (cp) for (let i = 0; i < 4; i++) K.puff('dust', cp.x + (i - 2) * 4, cp.y + 14, { life: 20, vy: -0.3 });
      const n = dog(f); yield* run(f, 22, 23, 4); n.dir = 'up'; bark(f);
      yield* ask(null, 'Canelo... ¡...!', 'The cat ran off, and Canelo is chasing her! Call him back.', 'ven', ['hola', 'gato'], { point: n, wrong: dogWrong(f) });
      yield* come(f);
      yield* G.intro.find('gato', { who: 'nico', map: 'villa', at: [16, 19], wrong: [[13, 22], [22, 19]], prompt: '¿Y el [gato]?', en: 'Where is the cat hiding? (tap the bush with her tail)' });
    } },
    { auto: 'villa', when: found('gato'), run: function* (f, c) { // found her: what is she? and him?
      c.data.away = 0; f.amb.cat.away = false; meow(f);
      yield* say('nico', T('¡El [gato]! ¡Ja, ja!', 'The cat! Ha ha!'));
      yield* ask('nico', '¿Qué es?', 'Nico points at her: what is she?', 'gato', ['perro', 'miau'], { point: catP(f) });
      yield* ask('nico', '¿Y este?', 'And this one?', 'perro', ['gato', 'guau'], { point: dog(f) });
      yield* say('nico', T('¡Hasta mañana, {name}!', 'See you tomorrow, {name}!'));
    } },
  ], {
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      hold(f, 'nico', ...NICO_FENCE, 'up');
      if (f.amb && f.amb.cat) f.amb.cat.away = !!(c.data.away && !G.intro.found('gato'));
    },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'villa') return;
      const fl = c.data.fly, n = f.npc('canelo');
      if (fl && n) { const tx = n.x * TL + 12, ty = n.y * TL - 14; fl.x += (tx + Math.sin(G.frame / 9) * 16 - fl.x) * 0.06; fl.y += (ty + Math.cos(G.frame / 7) * 8 - fl.y) * 0.06; butterfly(ctx, fl.x - f.cam.x, fl.y - f.cam.y); }
    },
    draw(f, ctx, c) { if (f.mapId === 'villa' && c.data.away && !G.intro.found('gato')) tail(ctx, f, 16, 19, '#f09840', 1); },
    tap(kind, f, c) { // a wrong one in Nico's game: "¡No! ¡Escucha!"
      const b = CH.beat('c2'); if (!b || (b.tap !== 'cat' && b.who !== 'canelo') || (kind !== 'cat' && kind !== 'canelo')) return false;
      const want = b.tap === 'cat' ? 'cat' : 'canelo'; if (kind === want) return false;
      K.npcSay(f, 'nico', want === 'cat' ? '¡No! ¡Miau!' : '¡No! ¡Guau!', 90); G.audio.sfx('boop');
      return true;
    },
  });

  // =====================================================================
  //  C3 · ¡Buenos días, Canelo!  (Mamá, home, morning)  buenos días, hueso, siéntate
  // =====================================================================
  CH.script('c3', [
    { who: 'mama', run: function* (f) { // the curtains open: ¡Buenos días!
      G.fx.flash = 10; G.fx.flashColor = '#fff4c0'; G.audio.sfx('heal');
      for (let i = 0; i < 6; i++) G.fx.twinkle(80 + Math.random() * 160, 40 + Math.random() * 60);
      yield 20;
      yield* G.intro.show('buenosdias', { who: 'mama', prompt: '¡[buenosdias], {name}!', en: 'Good morning, {name}! (the sun is up)', ask: '¿Y tú? ¡...!', askEn: 'And you? Answer her!', known: ['ven', 'gato'] });
      yield* say('mama', T('¡[buenosdias]! ¿Y Canelo?', 'Good morning! And Canelo?'));
    } },
    { who: 'canelo', bubble: { icon: 'sol' }, run: function* (f) { // say it to Canelo (the sun and Canelo, no word)
      const n = dog(f); G.pet.state().sleep = false; G.pet.anim(n, 'wake');
      yield* ask(null, 'Canelo: ¡...!', 'Canelo stretches. Say good morning to him!', 'buenosdias', ['ven', 'guau'], { show: { icon: 'sol' }, point: n });
      bark(f); K.heart(f, n); yield 20;
    } },
    { auto: 'casa', run: function* (f) { // un hueso
      const n = dog(f); G.pet.anim(n, 'jump');
      yield* G.intro.show('hueso', { who: 'mama', prompt: '¡Mira! ¡Un [hueso]!', en: 'Look! A bone!', known: ['gato', 'perro'] });
      G.pet.anim(n, 'jump'); bark(f); yield 20;
    } },
    { auto: 'casa', run: function* (f) { // siéntate: Mamá shows it twice, then you (try 1)
      const n = dog(f);
      yield* say('mama', T('Canelo... ¡[sientate]!', 'Canelo... sit!'));
      yield* G.pet.play('sit'); yield* G.pet.play('eat', { item: 'hueso' });
      yield* say('mama', T('¡Muy bien! ¡[sientate]!', 'Good boy! Sit!'));
      yield* G.pet.play('sit'); yield* G.pet.play('pet');
      yield* say('mama', T('¡Ahora tú! Un [hueso] para ti...', 'Now you! Here is a bone for you...'));
      G.pet.anim(n, 'jump'); bark(f);
      yield* ask(null, 'Canelo... ¡...!', 'Canelo jumps up at the bone! Tell him to sit.', 'sientate', ['ven', 'guau'], { intro: true, how: 'watch', look: { sientate: 'both', ven: 'both', guau: 'both' }, point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit'); tries(f, 1); yield 20;
      yield* ask('mama', '¿Qué le das?', 'He sits! What do you give him?', 'hueso', ['gato', 'hola'], { point: n });
      yield* G.pet.play('eat', { item: 'hueso' });
    } },
    { auto: 'casa', run: function* (f) { // tries 2 and 3, each for a crumb
      const n = dog(f);
      G.pet.anim(n, 'jump'); bark(f); yield 10;
      yield* ask(null, 'Canelo... ¡...!', 'He bounces again! Tell him.', 'sientate', ['ven', 'perro'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit'); tries(f, 2); yield* G.pet.play('eat', { item: 'hueso' });
      G.pet.anim(n, 'jump'); bark(f); yield 10;
      yield* ask(null, 'Canelo... ¡...!', 'And again!', 'sientate', ['guau', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit'); tries(f, 3);
      G.pet.state().tricks.sientate = 3; S.autosave();
      K.confetti(); G.pet.sound('tada'); yield* G.pet.play('dance');
      if (G.hearts) G.hearts.add('canelo', 1, 'trick');
      yield* sayShow('mama', { icon: 'manzana' }, T('¡Muy bien! Ahora... ¡Don Pepe!', 'Very good! Now... go and see Don Pepe at his fruit stall!'));
    } },
    { door: 'casa', run: function* (f) { // he dawdles: call him
      const n = dog(f); dogAt(f, 7, 5, 'left'); G.pet.anim(n, 'huh'); yield 16;
      yield* ask(null, 'Canelo... ¡...!', 'Canelo is lying on his cushion. Call him to come with you!', 'ven', ['sientate', 'hueso'], { point: n, wrong: dogWrong(f) });
      yield* come(f);
    } },
    { who: 'nico', bubble: { icon: 'sol' }, run: function* (f) { // Nico's first morning greeting: from now on everyone greets you
      yield* ask('nico', 'Nico: ¡...!', 'The sun is up: Nico says good morning. Say it back!', 'buenosdias', ['gato', 'ven'], { show: { icon: 'sol' } });
      if (G.hearts) G.hearts.add('nico', 1, 'greet');
      yield* say('nico', T('¡[buenosdias], {name}! ¡Don Pepe!', 'Good morning, {name}! Look, Don Pepe!'));
    } },
  ], {
    stage(f) { if (f.mapId === 'casa' && G.pet.mine()) G.pet.state().sleep = false; },
  });

  // =====================================================================
  //  C4 · El juego de Don Pepe  (his fruit stall)  sí, no, manzana
  // =====================================================================
  CH.script('c4', [
    { who: 'pepe', run: function* (f) { // ¿Un perro? ¡Sí!  ¿Un perro? (the cat) ¡No!
      const n = dog(f); G.pet.place(f, n);
      yield* say('pepe', T('¡Ah! ¿Un [perro]?', 'Oh! A dog?'));
      yield* sayShow('pepe', 'si', T('¡[si]! ¡Un [perro]!', 'Yes! A dog! (he nods, thumbs up)'));
      yield* ask('pepe', '¿Un [perro]?', 'He points at Canelo: a dog?', 'si', ['hola', 'guau'], { intro: true, how: 'show', look: { si: 'text', hola: 'both', guau: 'both' }, point: n });
      yield* say('pepe', T('¡[si]! ¡Muy bien!', 'Yes! Very good!'));
      yield* sayShow('pepe', 'gato', T('Y este... ¿Un [perro]?', 'And this one... a dog?'));
      yield* sayShow('pepe', 'no', T('¡[no]! Un [gato]. ¡Ja, ja!', 'No! A cat. Ha ha! (he shakes his head)'));
      yield* ask('pepe', '¿Un [perro]?', 'The cat: is it a dog?', 'no', ['si', 'hola'], { intro: true, how: 'show', look: { no: 'text', si: 'both', hola: 'both' }, show: 'gato' });
      yield* say('pepe', T('¡[no]! ¡Un [gato]!', 'No! A cat!'));
    } },
    { auto: 'villa', run: function* (f) { // Pepe's game: ¿Sí o no?
      const n = dog(f);
      yield* say('pepe', T('¡Un juego! ¿[si] o [no]?', 'A game! Yes or no?'));
      yield* siNo('pepe', '¿Un [hueso]?', 'A bone?', true, { show: 'hueso' });
      yield* siNo('pepe', '¿Un [gato]?', 'He points at Canelo: a cat?', false, { point: n });
      yield* siNo('pepe', '¿Un [gato]?', 'A cat?', true, { show: 'gato' });
      yield* siNo('pepe', '¿[sientate]?', 'Is Canelo sitting?', false, { point: n });
      yield* ask('pepe', '¡Dile a Canelo!', 'Tell Canelo!', 'sientate', ['ven', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      yield* siNo('pepe', '¿Y ahora? ¿[sientate]?', 'And now? Is he sitting?', true, { point: n });
    } },
    { auto: 'villa', run: function* (f) { // una manzana; Abuela Rosa wants one
      yield* G.intro.show('manzana', { who: 'pepe', prompt: '¡Mira! ¡Una [manzana]!', en: 'Look! An apple!', known: ['hueso', 'gato'] });
      const r = hold(f, 'rosa', 15, 10, 'left');
      if (r) { r.ox = 24; for (let i = 0; i < 8; i++) { r.ox -= 3; yield 2; } r.ox = 0; }
      yield* ask('rosa', 'Rosa: ¡...!', 'Grandma Rosa walks up and waves. Say hello!', 'hola', ['si', 'gato'], { show: { icon: 'hola' } });
      yield* ask('rosa', '¿Una [manzana]?', 'Rosa wants one: tap its picture', 'manzana', ['hueso', 'perro'], { pic: true, mask: ['manzana'] });
      G.audio.jingle('item'); if (G.hearts) G.hearts.add('rosa', 1, 'gift');
      yield* say('rosa', T('¡Mmm! ¡[gracias]!', 'Mmm! Thank you!'));
      yield* siNo('pepe', '¿Una [manzana] para ti?', 'An apple for you?', true, { show: 'manzana' });
      yield* siNo('pepe', '¿Y para Canelo?', 'And one for Canelo?', false, { show: 'manzana' });
      yield* say('pepe', T('¡[no]! ¡Un [hueso]! ¡Ja, ja!', 'No! A bone for him! Ha ha!'));
      const n = dog(f); G.pet.anim(n, 'huh');
      yield* ask(null, '¿Qué quiere?', 'Canelo whines at your bag. What does he want?', 'hueso', ['manzana', 'gato'], { point: n });
      yield* G.pet.play('eat', { item: 'hueso' });
      if (r) Object.assign(r, { home: [7, 7], wander: 1 });
    } },
  ]);

  // =====================================================================
  //  C5 · La pelota roja  (Sofía, the park)  pelota, rojo
  // =====================================================================
  const BUSHES = [[16, 19, BLUE], [13, 22, GREEN], [22, 19, RED]];
  CH.script('c5', [
    { who: 'sofia', run: function* (f) { // ¡La pelota!
      const n = dog(f);
      yield* siNo('sofia', '¿Tu [perro]?', 'Is he your dog?', true, { point: n });
      yield* sayShow('sofia', ball(BLUE), T('¡Canelo! ¡La [pelota]!', 'Canelo! The ball! (she throws it)'));
      yield* G.pet.play('fetch');
      yield* ask('sofia', '¿Qué es?', 'She holds it up: what is it?', 'pelota', ['hueso', 'manzana'], { intro: true, how: 'show', look: { pelota: 'text', hueso: 'both', manzana: 'both' }, show: ball(BLUE), img: { pelota: ball(BLUE) } });
      yield* say('sofia', T('¡La [pelota]! ¡Ahora tú!', 'The ball! Now you throw it!'));
      yield* ask('sofia', 'Sofía: ¡...!', 'Your turn: what do you throw?', 'pelota', ['sientate', 'ven'], { img: { pelota: ball(BLUE) } });
      yield* G.pet.play('fetch');
    } },
    { auto: 'villa', run: function* (f, c) { // he won't let go: siéntate; ven from across the lawn; Sofía's red ball is lost
      const n = dog(f);
      G.pet.anim(n, 'huh');
      yield* ask(null, 'Canelo... ¡...!', 'He won\'t let go of the ball! Tell him to sit.', 'sientate', ['hola', 'manzana'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      yield* run(f, 22, 23, 3); n.dir = 'up';
      yield* ask(null, 'Canelo... ¡...!', 'He ran across the lawn. Call him!', 'ven', ['pelota', 'hueso'], { point: n, wrong: dogWrong(f) });
      yield* come(f);
      yield* sayShow('sofia', ball(RED), T('Ay... mi [pelota]... ¡[rojo:roja]!', 'Oh no... my ball... my red one! It went in the bushes.'));
      c.data.balls = 1;
      yield* say('sofia', T('¿Y mi [pelota] [rojo:roja]?', 'Where is my red ball? (look in the bushes)'));
    } },
    { spots: BUSHES.map(([x, y]) => ({ map: 'villa', at: [x, y], quiet: true })), hint: (f, c) => BUSHES.filter((b, i) => !(c.data.tried || {})[i]).map(([x, y]) => ({ x: x * TL + 12, y: y * TL + 12, spot: 'ball', secret: true })), run: function* (f, c, i) {
      const [, , col] = BUSHES[i], red = col === RED;
      G.audio.sfx('chest');
      yield* tell(T('¡Una [pelota]!', 'A ball!'));
      yield* siNo('sofia', '¿[rojo:Roja]?', 'Is it the red one?', red, { show: ball(col) });
      if (!red) { (c.data.tried || (c.data.tried = {}))[i] = 1; yield* say('sofia', T('[no]...', 'No...')); return false; }
      G.audio.jingle('item'); G.intro.meet('rojo', 'find', { who: 'sofia' }); yield 40;
      yield* say('sofia', T('¡[si]! ¡[rojo:Roja]!', 'Yes! Red!'));
      c.data.balls = 2;
    } },
    { who: 'sofia', run: function* (f, c) { // her red ball; the blue one for Canelo
      yield* sayShow('sofia', ball(RED), T('¡Mi [pelota] [rojo:roja]! ¡[si]!', 'My red ball! Yes!'));
      yield* ask('sofia', '¿La [pelota] [rojo:roja]?', 'Which one is the red ball?', 'rojo', ['pelota'], { pic: true, mask: ['rojo'], img: { rojo: ball(RED), pelota: ball(BLUE) } });
      yield* sayShow('sofia', ball(BLUE), T('¡Y esta... para Canelo!', 'And this one... for Canelo!'));
      c.data.balls = 3;
      const n = dog(f); yield* run(f, 21, 23, 4); n.dir = 'up';
      yield* ask(null, 'Canelo... ¡...!', 'He runs off with his new ball. Call him!', 'ven', ['pelota', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* come(f);
      yield* ask('sofia', '¡Otra vez!', 'Again! What do you throw?', 'pelota', ['hueso', 'sientate'], { img: { pelota: ball(BLUE) } });
      yield* G.pet.play('fetch');
      yield* say('sofia', T('¡[gracias:Gracias]!', 'Thank you!'));
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa') hold(f, 'sofia', ...V('sofia'), 'down'); },
    draw(f, ctx, c) {
      if (f.mapId !== 'villa' || c.data.balls !== 1) return;
      BUSHES.forEach(([x, y, col], i) => { if (!(c.data.tried || {})[i]) peekBall(ctx, f, x, y, col); });
    },
  });

  // =====================================================================
  //  C6 · Pan para los patos  (Marta at the bakery, then Nico at the farm pond)  pan, gracias, pato, cuac
  // =====================================================================
  const NICO_POND = [36, 20];
  const duckP = f => pointAni(f, 'pato');
  function swim(f) { const d = (f.zoo ? f.zoo.list : []).find(a => a.kind === 'pato' && !a.baby); if (d) { d.tx = 38 * TL + 4; d.ty = 20 * TL + 14; d.st = 'swim'; } }
  CH.script('c6', [
    { who: 'marta', run: function* (f) { // ¡Pan!  Rosa says ¡Gracias!; your turn
      yield* G.intro.show('pan', { who: 'marta', prompt: '¡Mira! ¡[pan]!', en: 'Look! Bread!', known: ['manzana', 'pelota'] });
      const r = guest(f, 'rosa', 3, 5, 'up');
      yield* say('marta', T('¡[pan] para Rosa!', 'Bread for Rosa!'));
      yield* say('rosa', T('¡[gracias]!', 'Thank you!'));
      yield* say('marta', T('¡De nada!', 'You\'re welcome!'));
      yield* say('marta', T('Y {name}... ¡Para ti!', 'And {name}... for you!'));
      yield* ask('marta', 'Marta: ¡Para ti!', 'She holds a loaf out to you. What do you say?', 'gracias', ['hola', 'no'], { intro: true, how: 'overheard', look: { gracias: 'text', hola: 'both', no: 'both' }, show: 'pan' });
      yield* say('marta', T('¡De nada, {name}!', 'You\'re welcome, {name}!'));
      void r;
    } },
    { auto: 'panaderia', run: function* (f) { // Rosa: ¿Qué tienes?; bread for the ducks
      G.errands.bag.add('pan', { q: 'c6' });
      yield* ask('rosa', 'Rosa: ¿Qué tienes?', 'Rosa asks: what have you got?', 'pan', ['manzana', 'pelota']);
      yield* say('rosa', T('¡Mmm! ¡[adios]!', 'Mmm! Bye!'));
      unguest(f, 'rosa');
      yield* say('marta', T('¡Y [pan] para los [pato:patos]!', 'And bread for the ducks!'));
      yield* ask('marta', 'Marta: ¡Para los [pato:patos]!', 'Another loaf, for the ducks. What do you say?', 'gracias', ['hola', 'no'], { show: 'pan' });
      yield* sayShow('marta', 'pato', T('Los [pato:patos]... ¡por allá!', 'The ducks are at the farm pond, east of the plaza!'));
    } },
    { who: 'nico', bubble: 'pato', run: function* (f) { // ¡Un pato! ¡cuac!
      swim(f); G.animals.cry('pato'); yield 20;
      yield* G.intro.show('pato', { who: 'nico', prompt: '¡Cuac, cuac! ¡Un [pato]!', en: 'Quack, quack! A duck!', known: ['perro', 'pelota'] });
      G.animals.cry('pato'); yield 10;
      yield* G.intro.show('cuac', { who: 'nico', prompt: 'El [pato] dice ¡[cuac]!', en: 'The duck says quack!', ask: '¿Qué dice el [pato]?', askEn: 'What does the duck say?', known: ['miau', 'guau'] });
      G.animals.cry('pato');
      yield* ask('nico', '¿Quién dice "cuac"?', 'Who says quack?', 'pato', ['perro', 'pelota']);
    } },
    { auto: 'villa', run: function* (f) { // the ducklings: ¿Qué dicen?, bread for them, Canelo sits, Nico's crumbs
      swim(f); G.animals.cry('pato'); yield 30;
      yield* ask('nico', '¿Qué dicen?', 'The ducklings paddle up. What do they say?', 'cuac', ['miau', 'guau'], { point: duckP(f) });
      yield* ask('nico', '¿Qué le das al [pato]?', 'What do you give the duck?', 'pan', ['hueso', 'manzana'], { point: duckP(f) });
      G.errands.bag.take('pan', { q: 'c6' }); G.audio.sfx('pop');
      for (let i = 0; i < 6; i++) G.fx.twinkle(38 * TL + 12 - Math.round(f.cam.x) + (Math.random() - 0.5) * 30, 21 * TL - Math.round(f.cam.y) + (Math.random() - 0.5) * 16);
      G.animals.cry('pato'); yield 20;
      const n = dog(f); G.pet.anim(n, 'huh');
      yield* say('nico', T('¡[no], Canelo! ¡[no]!', 'No, Canelo! No! (he wants to jump in)'));
      yield* ask('nico', '¡Dile a Canelo!', 'Tell Canelo!', 'sientate', ['ven', 'pan'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      yield* ask('nico', 'Nico: ¡Para ti!', 'Nico shares his crumbs with you. What do you say?', 'gracias', ['si', 'hola'], { show: { icon: 'bolsa' } });
      yield* say('nico', T('¡Un juego! ¡Escucha!', 'A game! Listen... and tap who says it!'));
      yield* listen(f, 'nico', '¡Cuac, cuac!', 'Quack, quack! Who says it? Tap them!');
    } },
    { tap: 'pato', hint: (f) => { const p = duckP(f); return p ? [{ x: p.x, y: p.y + 6, animal: 'pato', secret: true }] : []; }, run: function* (f) {
      yield* say('nico', T('¡[si]! ¡El [pato]!', 'Yes! The duck!'));
      yield* listen(f, 'nico', '¡Guau, guau!', 'Woof, woof! Who says it?');
    } },
    { who: 'canelo', bubble: false, hint: (f) => { const n = f.npc('canelo'); return n ? [{ x: n.x * TL + 12, y: n.y * TL + 12, npc: 'canelo', secret: true }] : []; }, run: function* (f) {
      bark(f); yield* G.pet.play('wake'); bark(f);
      yield* say('nico', T('¡Sí! ¡El [perro]!', 'Yes! The dog!'));
      yield* listen(f, 'nico', '¡Cuac!', 'Quack! Who says it?');
    } },
    { tap: 'pato', hint: (f) => { const p = duckP(f); return p ? [{ x: p.x, y: p.y + 6, animal: 'pato', secret: true }] : []; }, run: function* (f) {
      yield* say('nico', T('¡[si]!', 'Yes!'));
      yield* ask('nico', '¿Qué es?', 'A duckling paddles up. What is it?', 'pato', ['pelota', 'perro'], { point: duckP(f) });
      yield* sayShow('nico', 'pan', T('¡Marta! ¡Más [pan]!', 'Go back to Marta: more bread!'));
    } },
    { who: 'marta', bubble: 'pan', run: function* () { // a loaf for tomorrow: feeding the ducks is a daily job now
      yield* say('marta', T('¡[hola]! ¡Más [pan]! Para mañana...', 'Hello! More bread, for tomorrow...'));
      yield* ask('marta', 'Marta: ¡Para ti!', 'A loaf for tomorrow: what do you say?', 'gracias', ['hola', 'no'], { show: 'pan' });
      G.errands.bag.add('pan');
      yield* say('marta', T('¡Para los [pato:patos]!', 'For the ducks! (feed them every day)'));
    } },
  ], {
    stage(f) { if (f.mapId === 'villa') hold(f, 'nico', ...NICO_POND, 'right'); },
    tap(kind, f) {
      const b = CH.beat('c6'); if (!b || (b.tap !== 'pato' && b.who !== 'canelo') || (kind !== 'pato' && kind !== 'canelo' && kind !== 'cat')) return false;
      const want = b.tap === 'pato' ? 'pato' : 'canelo'; if (kind === want) return false;
      K.npcSay(f, 'nico', want === 'pato' ? '¡No! ¡Cuac!' : '¡No! ¡Guau!', 90); G.audio.sfx('boop');
      return true;
    },
  });

  // =====================================================================
  //  C7 · ¿Dónde está Canelo?  (morning; Mamá, Gómez, Nico, Lucía, Tomás)  parque, banco, fuente, granja, cabra
  // =====================================================================
  const PLAZA_WAYS = { parque: [17, 17, 'parque'], escuela: [17, 5, 'escuela'], granja: [35, 10, 'granja'] };
  CH.script('c7', [
    { who: 'mama', run: function* (f, c) { // Canelo barks at the door and runs off
      const n = dog(f); G.pet.state().sleep = false;
      G.pet.sound('bark'); K.puff('ex', n.x * TL + 12, n.y * TL - 4, { life: 30 }); yield 20;
      yield* K.walk(f, n, 4, 6, 4); G.pet.sound('woof'); f.removeNpc('canelo');
      c.data.lost = 1; S.autosave();
      yield* say('mama', T('¡Ay! ¡Canelo! ¿Y Canelo?', 'Oh no! Canelo ran out! Where is he?'));
      yield G.questCard('c7');
      yield* say('mama', T('¡El señor Gómez!', 'Ask around town: Señor Gómez first!'));
    } },
    { who: 'gomez', bubble: 'perro', part: 'parque', run: function* () {
      yield* ask('gomez', 'Tú: ¿Y mi...?', 'Ask him: have you seen my...?', 'perro', ['gato', 'hueso'], { show: { icon: 'pregunta' } });
      const w = PLAZA_WAYS;
      yield* G.intro.find('parque', { who: 'gomez', map: 'villa', at: w.parque.slice(0, 2), wrong: [w.escuela.slice(0, 2), w.granja.slice(0, 2)], pics: [w.parque, w.escuela, w.granja],
        prompt: '¡[si]! Un [perro]... ¡El [parque]!', en: 'Yes! A dog... the park! (which way? tap it)' });
    } },
    { auto: 'villa', when: found('parque'), run: function* (f, c) { // the park: its name; paw prints
      yield* CH.banner('parque', ['perro', 'gato']);
      c.data.paws = 1;
      yield* tell(T('¡Mira! ¡[pata:Huellas]!', 'Look! Paw prints! Ask Nico.'));
    } },
    { who: 'nico', bubble: 'perro', part: 'banco', run: function* () {
      yield* ask('nico', 'Tú: ¿Y mi...?', 'Ask Nico: have you seen my...?', 'perro', ['pato', 'hueso'], { show: { icon: 'pregunta' } });
      yield* G.intro.find('banco', { who: 'nico', map: 'villa', at: [20, 18], wrong: [[12, 18], [20, 21]], pics: [[20, 18, 'banco'], [12, 18, 'arbol'], [20, 21, 'agua']],
        prompt: '¡[si]! ¡El [banco]!', en: 'Yes! The bench! (which one? tap it)' });
    } },
    { auto: 'villa', when: found('banco'), run: function* (f, c) { // his bone on the bench
      yield* CH.banner('banco', ['pan', 'gato']);
      c.data.paws = 0;
      yield* ask(null, '¿Qué es?', 'Something on the bench: what is it?', 'hueso', ['pan', 'pelota'], { point: tile(20, 18) });
      G.errands.bag.add('hueso', { q: 'c7' });
      yield* tell(T('¡El [hueso] de Canelo! ...¿Y Canelo?', 'Canelo\'s bone! ...But where is Canelo? Ask Lucía at the park gate.'));
    } },
    { who: 'lucia', bubble: 'perro', part: 'fuente', run: function* () {
      yield* siNo('lucia', '¿Canelo? ¿En el [parque]?', 'Canelo? In the park?', false);
      yield* G.intro.find('fuente', { who: 'lucia', map: 'villa', at: [18, 11], wrong: [[14, 10], [22, 12]], pics: [[18, 11, 'fuente'], [14, 10, 'canasta'], [22, 12, 'banco']],
        prompt: '¡[no]! ¡La [fuente]!', en: 'No! The fountain! (which one? tap it)' });
    } },
    { auto: 'villa', when: found('fuente'), run: function* (f) { // his ball in the water
      yield* CH.banner('fuente', ['banco', 'parque']);
      const fish = G.animals.find('pez', f); if (fish) G.animals.jump(fish, f);
      yield* ask(null, '¿Qué es?', 'Something bobs in the water: what is it?', 'pelota', ['pan', 'hueso'], { point: tile(18, 11) });
      G.errands.bag.add('pelota', { q: 'c7' });
      yield* tell(T('¡La [pelota] de Canelo! ...¿Y Canelo?', 'Canelo\'s ball! But where is he? Ask Tomás, the mail carrier.'));
    } },
    { who: 'tomas', bubble: 'perro', part: 'granja', run: function* () {
      yield* ask('tomas', 'Tú: ¿Y mi...?', 'Ask Tomás: have you seen my...?', 'perro', ['gato', 'pelota'], { show: { icon: 'pregunta' } });
      const w = PLAZA_WAYS;
      yield* G.intro.find('granja', { who: 'tomas', map: 'villa', at: [41, 5], wrong: [w.parque.slice(0, 2), w.escuela.slice(0, 2)], pics: [[41, 5, 'granja'], w.parque, w.escuela],
        prompt: '¡[guau], [guau]! ¡La [granja]!', en: 'Woof, woof! The farm, at the big red barn! (which way? tap it)' });
    } },
    { auto: 'villa', when: found('granja'), run: function* (f, c) { // the barn barks: ¡ven!  Canelo and a goat
      yield* CH.banner('granja', ['fuente', 'parque']);
      G.pet.sound('bark'); yield 14; G.pet.sound('bark');
      yield* ask(null, '¡Guau, guau! ¿Quién es?', 'Someone is barking in the barn. Who is it?', 'perro', ['gato', 'pato'], { pic: true });
      yield* ask(null, '¡Dile a Canelo!', 'Call him out! (say it out loud!)', 'ven', ['sientate', 'hola']);
      c.data.lost = 0; S.autosave();
      const n = dogAt(f, 41, 5, 'down'); n.ghost = true; G.pet.place(f, n);
      const goat = G.animals.find('cabra', f);
      if (goat) { goat.x = 43 * TL + 4; goat.y = 5 * TL + 20; goat.flip = false; goat.react = 40; goat.st = 'idle'; goat.t = 600; }
      for (let i = 0; i < 4; i++) G.fx.twinkle(41 * TL + 12 - Math.round(f.cam.x) + (Math.random() - 0.5) * 20, 4 * TL - Math.round(f.cam.y));
      yield* G.pet.play('dance'); bark(f);
      G.animals.cry('cabra');
      const t = hold(f, 'tomas', 39, 6, 'right');
      yield* G.intro.show('cabra', { who: t ? 'tomas' : null, prompt: '¡Beee! ¡Una [cabra]!', en: 'Baa! A goat!', known: ['perro', 'pato'] });
      G.pet.anim(n, 'huh'); bark(f);
      yield* ask(null, '¡Dile a Canelo!', 'Canelo wants to chase her! Tell him.', 'sientate', ['ven', 'pelota'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      if (goat) { goat.st = 'walk'; goat.tx = 41 * TL + 12; goat.ty = 11 * TL + 18; }
      yield* tell(T('La [cabra]... ¡a su casa!', 'Walk the goat back to her paddock gate.'));
    } },
    { spot: { map: 'villa', at: [41, 12], icon: 'cabra' }, part: 'cabra', run: function* (f) {
      const goat = G.animals.find('cabra', f);
      if (goat) { goat.x = 41 * TL + 12; goat.y = 11 * TL + 20; goat.react = 30; }
      G.animals.cry('cabra');
      yield* ask(null, '¿Qué es?', 'She bleats at the gate. What is she?', 'cabra', ['gato', 'perro'], { point: goat ? { x: goat.x, y: goat.y - 14 } : tile(41, 11) });
      if (goat) { goat.st = 'walk'; goat.tx = 42 * TL + 10; goat.ty = 15 * TL + 18; goat.t = 120; }
      yield* tell(T('¡Bravo! ¡A [casa], Canelo!', 'Bravo! Home now, Canelo: Mom is waiting!'));
    } },
    { who: 'mama', part: 'perro', run: function* (f) { // home: tell Mamá where everything was
      const n = dog(f); G.pet.place(f, n);
      yield* say('mama', T('¡Canelo! ¡Aquí estás!', 'Canelo! There you are!'));
      yield* G.pet.play('dance');
      yield* say('mama', T('¿Y la [pelota]?', 'And his ball? Where was it?'));
      yield* ask('mama', '¿Y la [pelota]?', 'Where was his ball?', 'fuente', ['parque', 'granja'], { show: 'pelota' });
      yield* ask('mama', '¿Y el [hueso]?', 'And his bone?', 'banco', ['fuente', 'granja'], { show: 'hueso' });
      yield* ask('mama', '¿Y Canelo?', 'And Canelo himself?', 'granja', ['parque', 'fuente'], { show: 'perro' });
      G.errands.bag.take('hueso', { q: 'c7' }); G.errands.bag.take('pelota', { q: 'c7' });
      yield* ask(null, 'Canelo: ¡...!', 'His ball is back! What do you throw?', 'pelota', ['hueso', 'ven'], { point: n });
      yield* G.pet.play('fetch'); K.heart(f, n);
    } },
  ], {
    lost: c => c.data.lost === 1,
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      const k = c.step;
      if (k >= 3 && k <= 4) hold(f, 'nico', 16, 21, 'up');
      if (k >= 5 && k <= 5) hold(f, 'lucia', 18, 16, 'down');
      if (k >= 7 && k <= 7) hold(f, 'tomas', 20, 12, 'down');
    },
    draw(f, ctx, c) { if (f.mapId === 'villa' && c.data.paws) paws(ctx, f, [17, 17], [20, 19]); },
  });

  // =====================================================================
  //  C8 · La escuela de Luna  (morning; Mamá, then Profesora Luna)  escuela, bien, ¿cómo estás?
  // =====================================================================
  function* asked(f, who, name, en) { // ask a friend ¿cómo estás?, then how they are
    yield* ask(who, 'Tú: ¿...?', 'Ask ' + name + ' how ' + (who === 'rosa' || who === 'sofia' ? 'she is' : 'he is') + '!', 'comoestas', ['hola', 'gracias']);
    yield* sayShow(who, 'bien', T('¡[bien]! ¡Muy [bien]!', 'Fine! Very well! (thumbs up)'));
    yield* ask(who, '¿Cómo está ' + name + '?', 'How is ' + name + '?', 'bien', [who === 'rosa' ? 'hola' : 'si', 'no']);
  }
  CH.script('c8', [
    { who: 'mama', run: function* () { // ¡La escuela!
      const w = PLAZA_WAYS;
      yield* G.intro.find('escuela', { who: 'mama', map: 'villa', at: w.escuela.slice(0, 2), wrong: [w.parque.slice(0, 2), w.granja.slice(0, 2)], pics: [w.escuela, w.parque, w.granja],
        prompt: '¡La [escuela]! ¡Profesora Luna!', en: 'The school! Profesora Luna is waiting for you. (which way? out on the plaza)' });
    } },
    { auto: 'escuela', part: 'escuela', run: function* (f) { // the school; bien, ¿cómo estás?
      if (!G.intro.found('escuela')) { const s = G.state.finds.escuela; if (s) s.found = true; if (G.intro.meet('escuela', 'find', { who: 'mama' })) yield 40; }
      yield* CH.banner('escuela', ['parque', 'granja']);
      if (G.hearts) yield* G.hearts.greet('luna');
      const nico = guest(f, 'nico', 5, 4, 'up');
      yield* say('luna', T('¡Nico! ¿[comoestas]?', 'Nico! How are you?'));
      yield* sayShow('nico', 'bien', T('¡[bien]!', 'Fine! (thumbs up)'));
      yield* say('luna', T('Y {name}... ¿[comoestas]?', 'And you, {name}... how are you?'));
      yield* ask('luna', 'Luna: ¿[comoestas]?', 'How are you? (a thumbs-up face)', 'bien', ['hola', 'no'], { intro: true, how: 'overheard', look: { bien: 'text', hola: 'both', no: 'both' }, show: 'bien' });
      yield* sayShow('luna', 'bien', T('¡[bien]! ¡Qué bueno!', 'Fine! Great!'));
      yield* say('luna', T('¡Ahora tú! ¡Pregúntale a Canelo!', 'Now you! Ask Canelo how he is!'));
      const n = dog(f);
      yield* ask(null, 'Tú: ¿...?', 'Ask Canelo how he is', 'comoestas', ['hola', 'gracias'], { intro: true, how: 'overheard', look: { comoestas: 'text', hola: 'both', gracias: 'both' }, show: { icon: 'pregunta' } });
      bark(f); K.heart(f, n); yield* G.pet.play('dance');
      yield* ask('luna', '¿Cómo está Canelo?', 'How is Canelo?', 'bien', ['no', 'hola'], { point: n });
      yield* say('luna', T('¡Pregunta a tus amigos! Nico, Sofía y Rosa.', 'Ask three friends how they are: Nico, Sofía and Rosa!'));
      yield G.questCard('c8');
      unguest(f, 'nico'); void nico;
    } },
    { who: 'nico', bubble: { icon: 'pregunta' }, part: 'pregunta', run: function* (f) { yield* asked(f, 'nico', 'Nico'); } },
    { who: 'sofia', bubble: { icon: 'pregunta' }, part: 'pregunta', run: function* (f) {
      yield* asked(f, 'sofia', 'Sofía');
      yield* ask('sofia', 'Sofía: ¿[comoestas]?', 'She asks you back: how are you?', 'bien', ['pelota', 'no']);
      const n = dog(f); G.pet.anim(n, 'huh');
      yield* ask(null, '¿Qué quiere?', 'Canelo wants something! What?', 'pelota', ['hueso', 'sientate'], { point: n });
      yield* G.pet.play('fetch');
    } },
    { who: 'rosa', bubble: { icon: 'pregunta' }, part: 'pregunta', run: function* (f) { yield* asked(f, 'rosa', 'Rosa'); yield* say('rosa', T('¡Luna! ¡La [escuela]!', 'Back to Luna at the school!')); } },
    { who: 'luna', run: function* () { // three friends: a gold star
      yield* say('luna', T('¡Tus amigos están [bien]! ¡Muy bien, {name}!', 'Your friends are fine! Very good, {name}!'));
      yield* ask('luna', 'Luna: ¡Para ti!', 'A gold star sticker for you! What do you say?', 'gracias', ['hola', 'no'], { show: { icon: 'estrella' } });
      yield* say('luna', T('¡Hasta pronto!', 'See you soon!'));
    } },
  ], {
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      if (c.step === 2) hold(f, 'nico', 16, 20, 'up');
    },
  });

  // =====================================================================
  //  C9 · ¡Buenas noches, Canelo!  (Mamá, home, the first evening)  agua, cama, buenas noches
  // =====================================================================
  CH.script('c9', [
    { evening: 'dusk', run: function* (f) { // Canelo's empty bowl: agua
      f.petAwake = true; G.pet.state().sleep = false;
      const n = dog(f); dogAt(f, 2, 4, 'left');
      G.pet.sound('pant'); yield 30; G.pet.sound('pant');
      yield* sayShow('mama', 'agua', T('¡[agua]! Para Canelo...', 'Water! For Canelo... (she fills his bowl)'));
      yield* ask('mama', '¿Qué quiere Canelo?', 'What does Canelo want?', 'agua', ['hueso', 'pan'], { intro: true, how: 'show', look: { agua: 'text', hueso: 'both', pan: 'both' }, show: 'agua' });
      yield* G.pet.play('drink');
      G.pet.sound('pant'); G.pet.anim(n, 'huh');
      yield* ask(null, '¿...?', 'He looks at you, still panting. What does he want?', 'agua', ['hueso', 'pelota'], { point: n });
      yield* G.pet.play('drink'); K.heart(f, n);
    } },
    { evening: 'dusk', run: function* (f) { // ¡Buenas noches! (Mamá, as you get ready for bed)
      yield* sayShow('mama', 'buenasnoches', T('¡[buenasnoches], {name}!', 'Good night, {name}! (the moon is out)'));
      yield* ask('mama', 'Mamá: ¡...!', 'Answer Mom!', 'buenasnoches', ['buenosdias', 'ven'], { intro: true, how: 'show', look: { buenasnoches: 'text', buenosdias: 'both', ven: 'both' }, show: { icon: 'noche' } });
    } },
    { evening: 'dusk', run: function* (f, c) { // ¡a la cama! (find your bed), Canelo hops off: tell him
      const n = dog(f);
      yield* say('mama', T('Canelo, ¡a la [cama]!', 'Canelo, to bed!'));
      yield* K.walk(f, n, 7, 5, 3); n.dir = 'left';
      yield* G.intro.find('cama', { who: 'mama', map: 'casa', at: [7, 2], wrong: [[3, 3], [2, 1]], prompt: '¿Y tu [cama], {name}?', en: 'And your bed, {name}? (tap it)' });
      f.locked = false; // (the evening keeps the house locked: tap your bed now, then it locks again)
      while (!(G.intro.found('cama') && !f.locked && G.top() === f && !f.player.moving)) yield 1;
      f.route = null; f.locked = true;
      yield 10;
      f.petAwake = true; G.pet.state().sleep = false;
      dogAt(f, 5, 4, 'up'); G.pet.anim(n, 'wake'); bark(f); yield 20;
      yield* ask(null, '¡Canelo! ¡...!', 'Canelo hopped off his cushion, wide awake! Tell him where to go.', 'cama', ['ven', 'pelota'], { point: tile(7, 5) });
      yield* K.walk(f, n, 7, 5, 3); n.dir = 'left'; G.pet.state().sleep = true; G.pet.sound('snore');
      c.data.bed = 1;
      yield 30;
      yield* ask(null, 'Canelo: ...¡...!', 'Canelo yawns. Say good night to him!', 'buenasnoches', ['buenosdias', 'agua'], { point: dog(f) });
      G.pet.sound('snore');
    } },
    { evening: 'dawn', run: function* (f) { // the next morning
      const n = dog(f);
      yield* ask(null, '¿...?', 'Canelo stretches on his cushion. Where did he sleep?', 'cama', ['hueso', 'pelota'], { point: tile(7, 5) });
      yield* ask(null, 'Canelo: ¡...!', 'Canelo hops up: the sun is up! Say it!', 'buenosdias', ['buenasnoches', 'cama'], { show: { icon: 'sol' }, point: n });
      bark(f); dogAt(f, 2, 4, 'left'); G.pet.sound('pant');
      yield* ask(null, '¿...?', 'His bowl is empty again. What does he want?', 'agua', ['hueso', 'pelota'], { point: tile(1, 4) });
      yield* say('mama', T('¡El [agua]... de la [fuente]!', 'Water from the fountain! Fill his bowl every day.'));
    } },
  ]);

  // =====================================================================
  //  C10 · Tomás está cansado  (Tomás by the plaza bench, Rosa's house, the school, the paddock)
  //        cansado, carta, casa, caballo, adiós
  // =====================================================================
  const TOMAS_BENCH = [21, 12], PADDOCK = [41, 12];
  const bag = () => G.errands.bag;
  CH.script('c10', [
    { who: 'tomas', bubble: 'cansado', run: function* (f) { // ¿cómo estás? cansado
      yield* ask('tomas', 'Tú: ¿...?', 'Ask Tomás how he is!', 'comoestas', ['gracias', 'hola']);
      yield* sayShow('tomas', 'cansado', T('Mmm... [cansado:cansado]...', 'Mmm... tired... (he yawns)'));
      yield* ask('tomas', '¿Cómo está Tomás?', 'How is Tomás?', 'cansado', ['bien', 'no'], { intro: true, how: 'show', look: { cansado: 'text', bien: 'both', no: 'both' }, show: 'cansado' });
      const n = dog(f); G.pet.anim(n, 'sit');
      yield* ask(null, '¿Y Canelo?', 'Canelo flops down and yawns too. How is he?', 'cansado', ['bien', 'no'], { point: n });
      yield* ask(null, '¿Qué quiere Tomás?', 'He fans himself and licks his lips. What does he want?', 'agua', ['hueso', 'pelota']);
      yield* say('tomas', T('¡[agua]... de la [fuente]!', 'Water... from the fountain!'));
    } },
    { spot: { map: 'villa', at: V('fuente'), icon: 'agua' }, run: function* () {
      yield* CH.banner('fuente', ['banco', 'parque']);
      bag().add('agua', { q: 'c10' });
      yield* tell(T('¡[agua]! ¡Para Tomás!', 'Water! Take it to Tomás.'));
    } },
    { who: 'tomas', bubble: 'agua', part: 'agua', run: function* (f) { // una carta; three to deliver; the first: la casa de Rosa
      bag().take('agua', { q: 'c10' }); G.audio.sfx('pop');
      if (G.hearts) G.hearts.add('tomas', 1, 'care');
      yield* say('tomas', T('¡Ahh! ¡[gracias], {name}!', 'Ahh! Thank you, {name}!'));
      yield* G.intro.show('carta', { who: 'tomas', prompt: '¡Mira! Una [carta].', en: 'Look! A letter.', known: ['pan', 'pelota'] });
      yield* siNo('tomas', '¿Me ayudas?', 'Will you help me deliver them?', true);
      for (const to of ['casa', 'escuela', 'granja']) bag().add('carta', { q: 'c10', to });
      yield* G.intro.find('casa', { who: 'tomas', map: 'villa', at: [5, 7], wrong: [[17, 5], [29, 7]], pics: [[5, 7, 'casa'], [17, 5, 'escuela'], [29, 7, 'panaderia']],
        prompt: 'Esta: para la [casa] de Rosa.', en: 'The first one: for Grandma Rosa\'s house! (which one? tap it)' });
    } },
    { auto: 'villa', when: found('casa'), part: 'casa', run: function* (f) { // Rosa's letter; an apple
      yield* CH.banner('casa', ['escuela', 'parque']);
      hold(f, 'rosa', 6, 7, 'left');
      yield* say('rosa', T('¿Para mí?', 'For me?'));
      yield* ask('rosa', '¿Qué es?', 'What is it?', 'carta', ['pan', 'hueso'], { show: { icon: 'sobre' } });
      bag().take('carta', { q: 'c10', to: 'casa' });
      yield* say('rosa', T('¡Mi [carta]! Y para ti...', 'My letter! And for you...'));
      yield* ask('rosa', 'Rosa: ¡Para ti!', 'She gives you an apple. What do you say?', 'gracias', ['hola', 'no'], { show: 'manzana' });
      bag().add('manzana', { q: 'c10' });
      yield* tell(T('Y esta: para la [escuela].', 'The second letter: for the school.'));
    } },
    { auto: 'escuela', part: 'escuela', run: function* () { // Luna's letter
      if (G.hearts) yield* G.hearts.greet('luna');
      yield* say('luna', T('¿Una [carta]? ¿Para mí?', 'A letter? For me?'));
      yield* ask('luna', '¿Qué es?', 'What is it?', 'carta', ['pelota', 'pan'], { show: { icon: 'sobre' } });
      bag().take('carta', { q: 'c10', to: 'escuela' });
      yield* say('luna', T('¡[gracias]!', 'Thank you!'));
      yield* tell(T('Y esta: para la [granja].', 'The third letter: for the farm.'));
    } },
    { spot: { map: 'villa', at: PADDOCK, quiet: true }, part: 'granja', run: function* (f) { // the horse eats the letter!
      const h = G.animals.find('caballo', f);
      if (h) { h.x = 41 * TL + 14; h.y = 13 * TL + 18; h.flip = true; h.st = 'idle'; h.t = 400; G.animals.react(f, h); h.react = 60; G.animals.cry('caballo'); }
      yield* tell(T('¡Iiijii! ...¡Ñam, ñam!', 'Neigh! ...Munch, munch! The horse ate the letter!'));
      bag().take('carta', { q: 'c10', to: 'granja' });
      hold(f, 'nico', 40, 11, 'right');
      yield* G.intro.show('caballo', { who: 'nico', prompt: '¡Ja, ja! ¡El [caballo]!', en: 'Ha ha! The horse!', known: ['cabra', 'pato'] });
      const hp = () => (h ? { x: h.x, y: h.y - 22 } : tile(41, 13));
      yield* ask('nico', '¿Quién come cartas?', 'Who eats letters?', 'caballo', ['cabra', 'perro'], { point: hp() });
      yield* ask('nico', '¿Qué quiere el [caballo]?', 'He sniffs your bag. What does the horse want?', 'manzana', ['hueso', 'pan'], { point: hp() });
      bag().take('manzana', { q: 'c10' }); G.audio.sfx('pop'); G.animals.cry('caballo');
      yield* tell(T('¡Ñam! ...¡La [carta]!', 'Munch! ...He drops the letter!'));
      const goat = G.animals.find('cabra', f);
      if (goat) { goat.x = 42 * TL + 10; goat.y = 13 * TL + 20; goat.react = 30; goat.st = 'idle'; goat.t = 300; G.animals.cry('cabra'); }
      yield* ask('nico', '¿Quién es?', 'Now someone nibbles the letter! Who is it?', 'cabra', ['caballo', 'perro'], { point: goat ? { x: goat.x, y: goat.y - 16 } : tile(42, 13) });
      const n = dog(f);
      yield* ask(null, 'Canelo... ¡...!', 'Call Canelo: he shoos the goat away!', 'ven', ['sientate', 'hola'], { point: n, wrong: dogWrong(f) });
      yield* come(f); bark(f);
      if (goat) { goat.st = 'walk'; goat.tx = 44 * TL; goat.ty = 16 * TL + 18; }
      yield* say('nico', T('¡La [carta]... a la [granja]! ¡Listo!', 'The letter goes in the barn\'s mailbox. Done! Back to Tomás!'));
    } },
    { who: 'tomas', bubble: true, run: function* (f) { // rested: bien; adiós
      yield* ask('tomas', 'Tú: ¿...?', 'Ask Tomás how he is now!', 'comoestas', ['hola', 'gracias']);
      yield* sayShow('tomas', 'bien', T('¡[bien]! ¡Muy [bien]!', 'Fine! Very well!'));
      yield* ask('tomas', '¿Cómo está Tomás?', 'How is Tomás now?', 'bien', ['cansado', 'no']);
      yield* say('tomas', T('¡[gracias], {name}! ¡Eres un{/a} gran carter{o/a}!', 'Thank you, {name}! You\'re a great mail carrier!'));
      yield* sayShow('tomas', 'adios', T('¡[adios]!', 'Goodbye! (he waves as he goes)'));
      const t = f.npc('tomas');
      yield* ask('tomas', 'Tomás: ¡[adios]!', 'He waves goodbye. Wave back!', 'adios', ['hola', 'gracias'], { intro: true, how: 'watch', look: { adios: 'text', hola: 'both', gracias: 'both' }, show: 'adios' });
      const def = G.maps.villa.npcs.find(d => d.id === 'tomas');
      if (t && def) { Object.assign(t, { route: def.route, _tired: false, wander: 0 }); if (t.amb) t.amb.hold = 30; }
      K.npcSay(f, 'tomas', '¡Adiós!', 100);
      const nico = f.npc('nico');
      if (nico) { Object.assign(nico, { x: 19, y: 13, ox: 0, oy: 0, dir: 'left' }); }
      yield 30;
      yield* ask('nico', 'Nico: ¡...!', 'Nico walks off, waving. What does he say?', 'adios', ['hola', 'bien'], { point: nico || undefined });
      if (nico) { Object.assign(nico, { home: [15, 15], wander: 2 }); K.npcSay(f, 'nico', '¡Adiós!', 90); }
    } },
  ], {
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      if (c.step <= 6) { const t = hold(f, 'tomas', ...TOMAS_BENCH, 'down'); if (t) t._tired = true; }
    },
  });
})();
