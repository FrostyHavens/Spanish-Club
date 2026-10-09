// ===== The story, chapters 11-21 (docs/CURRICULUM.md section 4): Rosa's hens, Mamá's market, the picnic, the dog show,
// Lucía's flowers, the lost pages, Nico's sound game, counting the town, everyone to the farm, the party =====
// The same kind of script as content/es/story-c01-c10.js (beats for G.chapters, src/chapters.js). Every new word arrives
// in a one-unknown puzzle and is used again within a minute or two; most of every chapter is older words coming back
// in the things people need ("¿Cuántos huevos?", Luna's picture signs for Canelo's tricks, the party's ribbons).
// Pictures that are not the answer's own picture keep a question cue-free: a heap of things to count (K.many, K.heap:
// never the number's picture), a picture sign for a trick (K.sign: a sign on a post), the thing pointed at on the map.
// Lines: T('Spanish', 'English for grown-ups'); [id] marks a word (an unmet one is drawn as its picture only).
'use strict';
(function () {
  const CH = G.chapters, K = CH.K, T = K.T, TL = G.TILE, S = G.st;
  const say = K.say, sayShow = K.sayShow, tell = K.tell, ask = K.ask, siNo = K.siNo;
  const V = tag => G.MAPDATA.villa.pos[tag];
  const W = id => G.data.words[id];
  const found = id => () => G.intro.found(id);
  const tile = (x, y) => ({ x: x * TL + 12, y: y * TL });
  const bag = () => G.errands.bag;
  const COL = id => W(id).col;
  const RED = COL('rojo'), WHITE = COL('blanco'), BLUE = COL('azul'), PINK = COL('rosa'), YELLOW = COL('amarillo'), GREEN = COL('verde');
  const cinta = col => ({ icon: 'cinta', col });
  const flower = col => ({ icon: 'flor', col });
  // pictures made of pictures (icons.js): n of a thing to count, several things in a heap, a trick's picture sign
  const many = (icon, n, col) => ({ icon: W(icon) ? W(icon).icon : icon, count: n, col });
  const heap = list => ({ list: list.map(k => (typeof k === 'string' && W(k) ? W(k) : k)) });
  const sign = id => ({ icon: W(id).icon, sign: true });
  // a trick asked from a picture sign: once the trick is known, the cards are words only (the sign is the picture)
  const fromSign = id => (G.words.stage(id) >= 2 ? { show: sign(id), display: 'text' } : { show: sign(id) });

  // ---------- Canelo ----------
  const dog = f => K.dog(f);
  const dogAt = (f, x, y, dir) => { const n = dog(f); Object.assign(n, { x, y, ox: 0, oy: 0, home: [x, y], slide: false, moving: false }); if (dir) n.dir = dir; return n; };
  function* run(f, x, y, sp = 4) { yield* K.walk(f, dog(f), x, y, sp); }
  const toward = (n, p) => { const dx = p.x - n.x, dy = p.y - n.y; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; };
  function* come(f) {
    const n = dog(f), p = f.player;
    const c = [[p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y + 1], [p.x, p.y - 1]].find(([x, y]) => !f.blocked(x, y, n) && !f.exitAt(x, y));
    if (c) yield* K.walk(f, n, c[0], c[1], 4);
    n.dir = toward(n, p);
    yield* G.pet.play('wake'); K.heart(f, n);
  }
  const tries = (f, k) => { const n = dog(f); K.puff('txt', n.x * TL + 12, n.y * TL - 6, { s: k + '/3', life: 70 }); G.audio.sfx('select'); };
  const bark = f => K.bark(f, dog(f));
  // a wrong card does what it says: Canelo sits for siéntate, jumps for salta, spins for gira... (understanding moves it)
  const ACT = { hola: 'paw', pata: 'paw', ven: 'jump', salta: 'jump', sientate: 'sit', gira: 'spin', busca: 'sniff' };
  const dogWrong = f => w => { const n = dog(f); if (w === 'guau') bark(f); else G.pet.anim(n, ACT[w] || 'huh', { amp: 0.6 }); if (w === 'ven') G.fx.shake = 4; };
  const learned = (f, id) => { G.pet.state().tricks[id] = 3; S.autosave(); K.confetti(); G.pet.sound('tada'); if (G.hearts) G.hearts.add('canelo', 1, 'trick'); };
  // ¡busca!: he sniffs his way to tile (x, y) and barks there (found it)
  function* busca(f, x, y) {
    const n = dog(f);
    yield* G.pet.play('sniff', { amp: 0.5 });
    yield* K.walk(f, n, x, y, 3);
    n.dir = 'down'; yield* G.pet.play('sniff'); bark(f);
  }

  // ---------- people ----------
  function hold(f, id, x, y, dir) {
    const n = f.npc(id); if (!n) return null;
    if (n.x !== x || n.y !== y) Object.assign(n, { x, y, ox: 0, oy: 0, moving: false });
    Object.assign(n, { home: [x, y], wander: 0, route: null, dir: dir || n.dir });
    if (n.amb) n.amb.follow = false;
    return n;
  }
  // back to their own place and ways (from the map's definition)
  function release(f, id) {
    const n = f.npc(id), d = (G.maps[f.mapId].npcs || []).find(o => o.id === id); if (!n || !d) return;
    Object.assign(n, { home: [d.x, d.y], wander: d.wander || 0, route: d.route || null });
  }
  function guest(f, id, x, y, dir) { let n = f.npc(id + '_g'); if (!n) n = f.addNpc({ id: id + '_g', npc: id, x, y, dir: dir || 'down', fixed: true, guest: true }); return n; }
  const unguest = (f, id) => f.removeNpc(id + '_g');
  const clap = (f, ids) => { G.audio.sfx('coin'); for (const id of ids) { const n = f.npc(id) || f.npc(id + '_g'); if (n && G.ambient) G.ambient.happy(n); } };
  // a scene somewhere else on the map: fade out, put everyone in place ({id: [x, y, dir]}), you and Canelo too, fade in
  function* scene(f, places, me, dogXY) {
    yield* K.fade(1);
    const p = f.player; Object.assign(p, { x: me[0], y: me[1], dir: me[2] || 'up', ox: 0, oy: 0 });
    const back = G.errands.stage(f, places);
    if (dogXY) dogAt(f, dogXY[0], dogXY[1], dogXY[2] || 'up');
    f.route = null; f.snapCam();
    yield* K.fade(0);
    return back;
  }
  function* unscene(f, back) { yield* K.fade(1); G.errands.unstage(f, back); f.snapCam(); yield* K.fade(0); }

  // ---------- the animals ----------
  const zoo = f => (G.animals.find('pato', f), f.zoo ? f.zoo.list : []);
  const animal = (f, kind, k = 0) => zoo(f).filter(a => a.kind === kind && !a.baby)[k] || null;
  const over = a => (a ? { x: Math.round(a.x), y: Math.round(a.y - 18) } : null);  // a point over an animal
  const at = (x, y) => [x * TL + 12, y * TL + 18];                                 // an animal's feet on tile (x, y)
  const hens = f => { const h = zoo(f).filter(a => a.kind === 'gallina'); return { brown: h.find(a => !a.tint) || h[0], white: h.find(a => a.tint) || h[1] }; };

  // ---------- little pictures drawn on the map ----------
  const sx = (f, x) => x * TL - Math.round(f.cam.x), sy = (f, y) => y * TL - Math.round(f.cam.y);
  function nest(ctx, f, x, y, n) { G.drawIcon16(ctx, { icon: 'nido', n }, sx(f, x) + 4, sy(f, y) + 6); }
  function bigFlower(ctx, f, x, y, col, k) { // a flower bigger than the tile's own, bobbing, with a twinkle now and then
    const X = sx(f, x), Y = sy(f, y), bob = Math.round(Math.sin((f.t + x * 9) / 14));
    ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(X + 6, Y + 19, 12, 2);
    G.drawIcon16(ctx, flower(col), X + 4, Y + 2 + bob);
    if ((f.t + x * 13 + (k | 0) * 7) % 70 < 10) { ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 17, Y + 1, 1, 3); ctx.fillRect(X + 16, Y + 2, 3, 1); }
  }
  function butterfly(ctx, x, y) {
    const o = (G.frame >> 3) & 1; x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = '#201828'; ctx.fillRect(x, y - 2, 1, 5);
    ctx.fillStyle = '#f8a020'; ctx.fillRect(x - 3 + o, y - 3, 3 - o, 3); ctx.fillRect(x + 1, y - 3, 3 - o, 3);
    ctx.fillStyle = '#f8d060'; ctx.fillRect(x - 2 + o, y, 2, 2); ctx.fillRect(x + 1, y, 2, 2);
  }
  function bar(ctx, f, x, y) { // a little jumping bar (Sofía's)
    const X = sx(f, x), Y = sy(f, y);
    ctx.fillStyle = '#1a1420'; ctx.fillRect(X + 1, Y + 8, 3, 14); ctx.fillRect(X + 20, Y + 8, 3, 14); ctx.fillRect(X + 1, Y + 9, 22, 4);
    ctx.fillStyle = '#e8e0d0'; ctx.fillRect(X + 2, Y + 9, 1, 12); ctx.fillRect(X + 21, Y + 9, 1, 12);
    for (let i = 0; i < 20; i += 4) { ctx.fillStyle = (i >> 2) & 1 ? '#ffffff' : '#e03028'; ctx.fillRect(X + 2 + i, Y + 10, 4, 2); }
  }

  // =====================================================================
  //  C11 · Los huevos de Rosa  (Abuela Rosa, her house and the henhouse)  gallina, huevo, uno, dos, blanco
  // =====================================================================
  const ROSA_HENS = [4, 8], NEST1 = [1, 10], NEST2 = [3, 10], WHITE_AT = [2, 9], BROWN_AT = [4, 10], HAY = [1, 7], PLAZA_HEN = [10, 9];
  const pinHens = f => { const h = hens(f); if (h.white) { h.white.pin = at(...WHITE_AT); h.white.flip = false; } if (h.brown) { h.brown.pin = at(...BROWN_AT); h.brown.flip = true; } };
  const unpinHens = f => { for (const a of zoo(f)) if (a.kind === 'gallina') { a.pin = null; a.go = null; } };
  CH.script('c11', [
    { who: 'rosa', bubble: 'huevo', run: function* (f) { // Rosa needs help with her hens
      yield* say('rosa', T('¡{name}! ¡Mis [gallina:gallinas]!', '{name}! My hens!'));
      yield* siNo('rosa', '¿Me ayudas?', 'Will you help me?', true);
      yield G.questCard('c11');
      const r = f.npc('rosa'); if (r) yield* K.walk(f, r, ...ROSA_HENS, 3);
      hold(f, 'rosa', ...ROSA_HENS, 'left');
      yield* tell(T('¡Coc, coc!', 'Cluck, cluck! (go to Rosa\'s hens, beside her house)'));
    } },
    { spot: { map: 'villa', at: [2, 8], icon: 'gallina' }, part: 'gallina', run: function* (f, c) { // una gallina, un huevo; uno
      const h = hens(f); G.animals.cry('gallina'); if (h.white) G.animals.react(f, h.white);
      yield* G.intro.show('gallina', { who: 'rosa', prompt: '¡Coc, coc! ¡Una [gallina]!', en: 'Cluck, cluck! A hen!', known: ['pato', 'cabra'] });
      G.animals.cry('gallina');
      yield* G.intro.show('huevo', { who: 'rosa', prompt: '¡Mira! Un [huevo].', en: 'Look! An egg.', known: ['pan', 'manzana'] });
      yield* ask('rosa', '¿Quién pone [huevo:huevos]?', 'Who lays eggs?', 'gallina', ['pato', 'cabra'], { point: over(h.white) });
      c.data.nests = 1; S.autosave();
      yield* ask('rosa', '¿Qué es?', 'Rosa puts it in a nest. What is it?', 'huevo', ['pan', 'manzana'], { point: tile(...NEST1) });
      yield* sayShow('rosa', many('huevo', 1), T('¡[uno]! Un [huevo].', 'One! One egg. (she holds up one finger)'));
      yield* G.intro.find('uno', { who: 'rosa', map: 'villa', at: NEST1, wrong: [NEST2], prompt: '¿Y el nido con [uno]?', en: 'Which nest has ONE egg? (tap it)' });
    } },
    { auto: 'villa', when: found('uno'), run: function* () { // dos
      yield* say('rosa', T('¡[si]! ¡[uno]!', 'Yes! One!'));
      yield* sayShow('rosa', many('huevo', 2), T('[uno]... ¡[dos]! [dos] [huevo:huevos].', 'One... two! Two eggs. (two fingers)'));
      yield* G.intro.find('dos', { who: 'rosa', map: 'villa', at: NEST2, wrong: [NEST1], prompt: '¿Y el nido con [dos]?', en: 'And the nest with TWO eggs? (tap it)' });
    } },
    { auto: 'villa', when: found('dos'), run: function* (f, c) { // counting; Canelo digs in the hay; the white hen
      yield* say('rosa', T('¡[si]! ¡[dos]!', 'Yes! Two!'));
      yield* ask('rosa', '¿Cuántos [huevo:huevos]?', 'How many eggs in this nest?', 'dos', ['uno'], { point: tile(...NEST2) });
      const h = hens(f);
      yield* ask('rosa', '¿Cuántas [gallina:gallinas]?', 'How many hens?', 'dos', ['uno'], { show: many('gallina', 2) });
      yield* ask('rosa', '¿Cuántos [perro:perros]?', 'And how many dogs?', 'uno', ['dos'], { point: dog(f) });
      // Canelo digs in the hay
      yield* run(f, HAY[0] + 1, HAY[1], 3); dog(f).dir = 'left'; G.pet.anim(dog(f), 'sniff'); yield 50; bark(f);
      yield* ask(null, '¿Qué es?', 'Canelo found something in the hay! What is it?', 'hueso', ['pan', 'pelota'], { point: tile(...HAY) });
      yield* G.pet.play('eat', { item: 'hueso' });
      yield* ask(null, '¿Y esto?', 'And there\'s something else in the hay. What is it?', 'huevo', ['pan', 'manzana'], { point: tile(...HAY) });
      c.data.pin = 1; pinHens(f);
      yield* G.intro.find('blanco', { who: 'rosa', map: 'villa', at: WHITE_AT, wrong: [BROWN_AT], prompt: 'Y la [gallina] [blanco:blanca]... ¿Dónde está?', en: 'And the WHITE hen... where is she? (tap her)' });
      void h;
    } },
    { auto: 'villa', when: found('blanco'), part: 'huevo', run: function* (f, c) { // she flaps up: an egg! Canelo scatters them
      const h = hens(f); if (h.white) G.animals.react(f, h.white); G.animals.cry('gallina');
      yield* sayShow('rosa', 'huevo', T('¡Un [huevo]! ¡Gracias, [gallina] [blanco:blanca]!', 'An egg! Thank you, white hen!'));
      yield* ask('rosa', '¿De qué color?', 'The new egg: what colour is it?', 'blanco', ['rojo', 'pan'], { show: { icon: 'huevo' } });
      yield* ask('rosa', '¿Cuántas [gallina:gallinas] [blanco:blancas]?', 'How many WHITE hens?', 'uno', ['dos'], { show: many('gallina', 2) });
      // Canelo barks and the hens scatter
      c.data.pin = 0; unpinHens(f);
      const n = dog(f); dogAt(f, 3, 9, 'left'); bark(f); G.pet.anim(n, 'jump');
      for (const a of zoo(f)) if (a.kind === 'gallina') G.animals.react(f, a);
      G.animals.cry('gallina');
      yield* ask('rosa', '¡Canelo! ¡...!', 'Canelo is chasing the hens! Tell him.', 'sientate', ['ven', 'cama'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      if (h.white) { h.white.go = [...at(...PLAZA_HEN), 1.6]; G.animals.cry('gallina'); }
      c.data.away = 1; S.autosave();
      yield* say('rosa', T('¡Ay! ¿Y mi [gallina]?', 'Oh no! Where did my hen go? (she ran to the plaza)'));
    } },
    { tap: 'gallina', hint: f => { const a = hens(f).white; return a ? [{ x: Math.round(a.x), y: Math.round(a.y - 6), animal: 'gallina' }] : []; }, run: function* (f, c) { // ¡ven! works on hens too
      const a = hens(f).white;
      yield* ask(null, 'Gallina... ¡...!', 'Call the hen back home!', 'ven', ['hola', 'si'], { point: over(a) });
      if (a) { a.pin = null; a.go = [...at(...WHITE_AT), 1.2]; }
      G.animals.cry('gallina');
      c.data.away = 0; S.autosave();
      yield* tell(T('¡Coc, coc! ...¡A la [casa]!', 'Cluck! Off she trots, home to Rosa.'));
    } },
    { who: 'rosa', bubble: true, run: function* (f) { // an egg for you: the hens' egg is a daily job now
      unpinHens(f);
      yield* say('rosa', T('¡Mi [gallina]! Y para ti...', 'My hen! And for you...'));
      yield* ask('rosa', 'Rosa: ¡Para ti!', 'Rosa gives you an egg. What do you say?', 'gracias', ['hola', 'no'], { show: 'huevo' });
      yield* say('rosa', T('¡Un [huevo] cada día!', 'An egg every day! (look in the hay by the hens)'));
      release(f, 'rosa');
    } },
  ], {
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      if (c.step >= 1 && c.step <= 5) hold(f, 'rosa', ...ROSA_HENS, 'left');
      if (c.data.pin) pinHens(f);
      if (c.data.away && c.step === 5) { const a = hens(f).white; if (a && !a.go) a.pin = at(...PLAZA_HEN); }
    },
    draw(f, ctx, c) {
      if (f.mapId !== 'villa' || !c.data.nests || c.step > 3) return;
      nest(ctx, f, ...NEST1, 1); nest(ctx, f, ...NEST2, 2);
    },
  });

  // =====================================================================
  //  C12 · El mercado de Mamá  (Mamá, then Don Pepe)  plátano, naranja, por favor, tres, cuatro
  // =====================================================================
  const LIST = heap([many('platano', 3), many('naranja', 4)]);
  CH.script('c12', [
    { who: 'mama', run: function* (f) { // Mamá's list; Canelo's bowl; a letter on the table
      const n = dog(f);
      yield* sayShow('mama', { icon: 'pagina' }, T('¡{name}! Mi lista... ¡Para Don Pepe!', '{name}! My shopping list... for Don Pepe! (the fruit is on it, as pictures)'));
      yield* ask('mama', 'Primero... ¿Canelo?', 'First, Canelo: he pants at his bowl. What does he want?', 'agua', ['hueso', 'pelota'], { point: n });
      yield* G.pet.play('drink');
      yield* siNo('mama', '¿Me ayudas?', 'Will you help me?', true);
      yield* ask('mama', '¿Y esto?', 'Tomás left something on the table. What is it?', 'carta', ['pan', 'pelota'], { point: tile(2, 3) });
      yield G.questCard('c12');
      yield* sayShow('mama', LIST, T('¡Don Pepe! ¡[adios]!', 'To Don Pepe\'s fruit stall! Bye!'));
    } },
    { who: 'pepe', bubble: 'platano', part: 'platano', run: function* (f) { // un plátano, una naranja; Marta: ¡por favor!
      yield* G.intro.show('platano', { who: 'pepe', prompt: '¿Qué quieres? ¡Mira! ¡Un [platano]!', en: 'What would you like? Look! A banana!', known: ['manzana', 'pan'] });
      yield* G.intro.show('naranja', { who: 'pepe', prompt: '¡Y una [naranja]!', en: 'And an orange!', known: ['manzana', 'platano'] });
      yield* ask('pepe', '¿Y esto?', 'He holds up the banana again. What is it?', 'platano', ['naranja', 'manzana'], { show: 'platano' });
      const m = guest(f, 'marta', 15, 10, 'up');
      yield* say('marta', T('¡Una [manzana], [porfavor]!', 'An apple, please!'));
      yield* say('pepe', T('¡Claro! ¡Aquí tienes!', 'Of course! Here you are!'));
      yield* say('marta', T('¡[gracias]! ¡[adios]!', 'Thank you! Bye!'));
      unguest(f, 'marta'); void m;
      yield* ask(null, 'Tú: ¡[platano:Plátanos]...!', 'Your turn! Ask for bananas the way Marta asked.', 'porfavor', ['gracias', 'hola'], { intro: true, how: 'overheard', look: { porfavor: 'text', gracias: 'both', hola: 'both' }, show: LIST });
      yield* sayShow('pepe', many('platano', 3), T('¡Claro! [uno], [dos]... ¡[tres]!', 'Of course! One, two... three!'));
      yield* ask('pepe', '¿Cuántos [platano:plátanos]?', 'How many bananas?', 'tres', ['dos', 'uno'], { intro: true, how: 'show', look: { tres: 'text', dos: 'both', uno: 'both' }, show: many('platano', 3) });
      bag().add('platano', { q: 'c12' });
    } },
    { auto: 'villa', part: 'naranja', run: function* () { // the oranges: cuatro
      yield* ask('pepe', '¿Qué más?', 'What else is on the list?', 'naranja', ['platano', 'manzana'], { show: LIST });
      yield* ask('pepe', 'Tú: ¡[naranja:Naranjas]...!', 'Ask nicely!', 'porfavor', ['gracias', 'adios']);
      yield* sayShow('pepe', many('naranja', 4), T('[uno], [dos], [tres]... ¡[cuatro]!', 'One, two, three... four!'));
      yield* ask('pepe', '¿Cuántas [naranja:naranjas]?', 'How many oranges?', 'cuatro', ['tres', 'dos'], { intro: true, how: 'show', look: { cuatro: 'text', tres: 'both', dos: 'both' }, show: many('naranja', 4) });
      bag().add('naranja', { q: 'c12' });
      yield* ask('pepe', '¿Y los [platano:plátanos]? ¿Cuántos?', 'And the bananas? How many?', 'tres', ['cuatro', 'dos'], { show: many('platano', 3) });
      yield* ask('pepe', '¿Y las [naranja:naranjas]?', 'And the oranges?', 'cuatro', ['tres', 'dos'], { show: many('naranja', 4) });
      yield* say('pepe', T('¡Y un regalo! Para ti...', 'And a present! For you...'));
      yield* ask('pepe', '¿Cuántas [manzana:manzanas]?', 'Three apples! How many?', 'tres', ['dos', 'cuatro'], { show: many('manzana', 3) });
      yield* ask('pepe', '¿De qué color?', 'What colour are the apples?', 'rojo', ['blanco', 'platano'], { show: 'manzana' });
      yield* ask(null, 'Pepe: ¡Aquí tienes!', 'He hands you the bag. What do you say?', 'gracias', ['porfavor', 'hola'], { show: { icon: 'bolsa' } });
      yield* sayShow('pepe', 'adios', T('¡De nada! ¡[adios]!', 'You\'re welcome! Bye! (he waves)'));
      yield* ask(null, 'Pepe: ¡...!', 'Wave back!', 'adios', ['hola', 'porfavor']);
      yield* tell(T('¡A la [casa]!', 'Home to Mom!'));
    } },
    { who: 'mama', bubble: 'casa', part: 'casa', run: function* (f) { // Mamá unpacks; Canelo begs
      bag().take('platano', { q: 'c12' }); bag().take('naranja', { q: 'c12' });
      yield* say('mama', T('¡La fruta! ¡[gracias]!', 'The fruit! Thank you!'));
      yield* ask('mama', '¿Qué es?', 'Mom unpacks. What is this?', 'platano', ['naranja', 'manzana'], { show: 'platano' });
      yield* ask('mama', '¿Y esto?', 'And this?', 'naranja', ['platano', 'pan'], { show: 'naranja' });
      const n = dog(f); G.pet.anim(n, 'jump');
      yield* siNo('mama', '¿Un [platano] para Canelo?', 'Canelo begs. A banana for Canelo?', false, { point: n });
      yield* siNo('mama', '¿Un [hueso]?', 'A bone, then?', true, { point: n });
      yield* G.pet.play('eat', { item: 'hueso' }); K.heart(f, n);
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa' && c.step === 2) hold(f, 'pepe', ...V('pepe'), 'down'); },
  });

  // =====================================================================
  //  C13 · El día de campo  (Abuela Rosa: the bakery, the stall, the hens, the paddock, the fountain; a picnic)
  //        panadería, queso, leche, cinco, seis
  // =====================================================================
  const FOODS = ['pan', 'queso', 'huevo', 'leche', 'agua'];
  const ROSA_LIST = heap(['pan', 'queso', 'huevo', 'leche', 'agua']);
  const got = (c, k) => { (c.data.got || (c.data.got = {}))[k] = 1; bag().add(k, { q: 'c13' }); S.autosave(); };
  CH.script('c13', [
    { who: 'rosa', bubble: 'canasta', run: function* (f) { // Rosa's picnic list; the bakery
      yield* ask(null, 'Tú: ¿...?', 'Ask Rosa how she is!', 'comoestas', ['hola', 'porfavor']);
      yield* sayShow('rosa', 'bien', T('¡[bien]! ¡Muy [bien]!', 'Fine! Very well!'));
      yield* ask(null, '¿Cómo está Rosa?', 'How is Rosa?', 'bien', ['cansado', 'no']);
      yield* sayShow('rosa', ROSA_LIST, T('¡Un día de campo! [pan], [queso], [huevo], [leche], [agua]...', 'A picnic! Bread, cheese, an egg, milk and water...'));
      yield* siNo('rosa', '¿Me ayudas?', 'Will you help me?', true);
      yield G.questCard('c13');
      yield* G.intro.find('panaderia', { who: 'rosa', map: 'villa', at: [29, 7], wrong: [[29, 18], [17, 5]], pics: [[29, 7, 'panaderia'], [29, 18, 'biblioteca'], [17, 5, 'escuela']],
        prompt: 'El [pan]... ¡de la [panaderia]!', en: 'The bread... from the bakery! (which one? tap it)' });
    } },
    { auto: 'panaderia', part: 'pan', run: function* (f, c) { // the bakery: Marta's bread
      if (!G.intro.found('panaderia')) { const s = G.state.finds.panaderia; if (s) s.found = true; if (G.intro.meet('panaderia', 'find', { who: 'rosa' })) yield 40; }
      yield* CH.banner('panaderia', ['casa', 'escuela']);
      yield* ask('marta', '¡[hola]! ¿Qué quieres?', 'Marta: hello! What would you like? (Rosa\'s list)', 'pan', ['manzana', 'huevo'], { show: ROSA_LIST });
      yield* ask(null, 'Tú: ¡[pan]...!', 'Ask nicely!', 'porfavor', ['gracias', 'adios']);
      got(c, 'pan');
      yield* ask(null, 'Marta: ¡Aquí tienes!', 'Here you are! What do you say?', 'gracias', ['porfavor', 'hola'], { show: 'pan' });
    } },
    { who: 'pepe', bubble: 'queso', part: 'queso', run: function* (f, c) { // un queso
      yield* G.intro.show('queso', { who: 'pepe', prompt: '¡Mira! ¡Un [queso]!', en: 'Look! A cheese!', known: ['pan', 'huevo'] });
      got(c, 'queso');
      yield* ask('pepe', '¿Y fruta?', 'And some fruit? (a banana for the picnic)', 'platano', ['naranja', 'manzana'], { show: many('platano', 1) });
      bag().add('platano', { q: 'c13' });
      yield* ask('gomez', 'Gómez: ¿Qué tienes?', 'Señor Gómez walks by: what have you got? (the new thing)', 'queso', ['pan', 'platano'], { point: f.npc('gomez') || undefined });
    } },
    { spot: { map: 'villa', at: [2, 8], icon: 'huevo' }, part: 'huevo', run: function* (f, c) { // the hens: an egg
      const h = hens(f); G.animals.cry('gallina'); if (h.white) G.animals.react(f, h.white);
      yield* ask(null, '¿Qué es?', 'Cluck, cluck! What is she?', 'gallina', ['pato', 'cabra'], { point: over(h.white) });
      yield* ask(null, '¿Y esto?', 'Something in the hay. What is it?', 'huevo', ['pan', 'queso'], { point: tile(...HAY) });
      got(c, 'huevo');
      yield* ask(null, '¿De qué color?', 'What colour is the egg?', 'blanco', ['rojo', 'queso'], { show: { icon: 'huevo' } });
      yield* tell(T('Y la [leche]... ¡a la [granja]!', 'And the milk... off to the farm!'));
    } },
    { spot: { map: 'villa', at: [41, 12], icon: 'cubeta' }, part: 'leche', run: function* (f, c) { // the paddock: la leche
      hold(f, 'nico', 40, 11, 'right');
      const horse = animal(f, 'caballo'), goat = animal(f, 'cabra');
      if (horse) { horse.go = [...at(42, 13), 1]; } if (goat) { goat.go = [...at(40, 13), 1]; }
      G.animals.cry('caballo'); yield 20;
      yield* ask('nico', '¿Quién es?', 'Someone peeks over the gate. Who is it?', 'caballo', ['cabra', 'pato'], { point: horse ? { x: 42 * TL + 12, y: 13 * TL - 4 } : tile(42, 13) });
      G.animals.cry('cabra');
      yield* G.intro.show('leche', { who: 'nico', prompt: 'La [cabra]... ¡[leche]!', en: 'The goat... milk! (Nico holds up the pail)', known: ['agua', 'queso'] });
      yield* ask('nico', '¿Quién da [leche]?', 'Who gives milk?', 'cabra', ['caballo', 'gallina'], { point: { x: 40 * TL + 12, y: 13 * TL - 2 } });
      got(c, 'leche');
      const n = dog(f); G.pet.anim(n, 'huh');
      yield* ask('nico', '¿Qué quiere Canelo?', 'Canelo licks his lips at the pail. What does he want?', 'leche', ['agua', 'pan'], { point: n });
      if (horse) horse.pin = null; if (goat) goat.pin = null;
      yield* tell(T('Y el [agua]... ¡la [fuente]!', 'And the water... from the fountain!'));
      release(f, 'nico');
    } },
    { spot: { map: 'villa', at: V('fuente'), icon: 'agua' }, part: 'agua', run: function* (f, c) {
      yield* CH.banner('fuente', ['banco', 'granja']);
      yield* ask(null, '¿Qué es?', 'You fill Rosa\'s bottle. What is it?', 'agua', ['leche', 'queso'], { point: tile(...V('fuente')) });
      got(c, 'agua');
      yield* tell(T('¡Todo! ¡A Rosa!', 'Everything! Back to Rosa!'));
    } },
    { who: 'rosa', bubble: true, part: 'canasta', run: function* (f, c) { // cinco; the picnic in the park; seis
      yield* say('rosa', T('¡Mi canasta! [uno], [dos], [tres], [cuatro]... ¡[cinco]!', 'My basket! One, two, three, four... five!'));
      yield* ask('rosa', '¿Cuántos?', 'How many things in the basket?', 'cinco', ['cuatro', 'tres'], { intro: true, how: 'show', look: { cinco: 'text', cuatro: 'both', tres: 'both' }, show: ROSA_LIST });
      const n = dog(f); G.pet.anim(n, 'sniff'); yield 30; bark(f);
      yield* ask('rosa', '¡Canelo! ¿Y ahora?', 'Canelo noses the cheese out! How many now?', 'cuatro', ['cinco', 'tres'], { show: heap(['pan', 'huevo', 'leche', 'agua']) });
      yield* ask('rosa', '¡[no], Canelo! ¿Y ahora?', 'He puts it back. And now?', 'cinco', ['cuatro', 'tres'], { show: ROSA_LIST });
      yield* say('rosa', T('¡Al [parque]!', 'To the park!'));
      for (const k of FOODS) bag().take(k, { q: 'c13' }); bag().take('platano', { q: 'c13' });
      // the picnic: a red checked blanket in the park
      const back = yield* scene(f, { rosa: [15, 19, 'down'] }, [15, 21, 'up'], [16, 21, 'up']);
      f.picnic = { food: [] };
      yield* say('rosa', T('¡Un día de campo! ¿La comida?', 'A picnic! Now the food: tap what I ask for.'));
      for (const k of FOODS) {
        const others = FOODS.filter(o => o !== k).sort(() => G.rand() - 0.5).slice(0, 2);
        yield* ask('rosa', '¡[' + k + ']!', 'Rosa asks for it: tap its picture!', k, others, { pic: true, mask: [k] });
        f.picnic.food.push(k); G.audio.sfx('pop');
      }
      c.data.picnic = back;
      // friends come and sit: six plates
      const back2 = G.errands.stage(f, { mama_p: [13, 20, 'right'], sofia: [17, 20, 'left'], nico: [14, 22, 'up'] });
      clap(f, ['mama_p', 'sofia', 'nico']);
      yield* sayShow('rosa', many('plato', 6), T('¡Amigos! [uno], [dos], [tres], [cuatro], [cinco]... ¡[seis]!', 'Friends! One, two, three, four, five... six plates!'));
      yield* ask('rosa', '¿Cuántos?', 'How many plates?', 'seis', ['cinco', 'cuatro'], { intro: true, how: 'show', look: { seis: 'text', cinco: 'both', cuatro: 'both' }, show: many('plato', 6) });
      yield* ask('rosa', '¿Cuántos amigos?', 'Count everyone on the blanket: you, Canelo, Rosa, Mom, Sofía and Nico!', 'seis', ['cinco', 'cuatro']);
      yield* ask('rosa', '¿Cuántas?', 'Five apple slices! How many?', 'cinco', ['seis', 'cuatro'], { show: many('manzana', 5) });
      G.pet.anim(dog(f), 'huh');
      yield* ask('rosa', '¿Qué quiere Canelo?', 'Canelo begs. What does he want? (not the cheese!)', 'hueso', ['queso', 'leche'], { point: dog(f) });
      yield* G.pet.play('eat', { item: 'hueso' });
      yield* ask('rosa', '¿Cómo está Canelo?', 'He ran around all afternoon. How is Canelo?', 'cansado', ['bien', 'no'], { point: dog(f) });
      yield* say('rosa', T('¡[gracias], {name}! ¡[adios], amigos!', 'Thank you, {name}! Bye, friends!'));
      yield* ask(null, 'Todos: ¡...!', 'Everyone waves goodbye. Wave back!', 'adios', ['hola', 'gracias']);
      yield* K.fade(1); f.picnic = null; G.errands.unstage(f, back2); G.errands.unstage(f, back); c.data.picnic = null; f.snapCam(); yield* K.fade(0);
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa' && f.npc('gomez') && c.step === 2) hold(f, 'gomez', 13, 10, 'up'); },
  });

  // =====================================================================
  //  C14 · El show de perros  (Sofía; Luna judges)  dame la pata, salta, galleta, azul, feliz
  // =====================================================================
  const BAR = [20, 21];
  CH.script('c14', [
    { who: 'sofia', bubble: () => cinta(BLUE), run: function* (f) { // a dog show! warm-up; dame la pata
      yield* ask(null, 'Tú: ¿...?', 'Ask Sofía how she is!', 'comoestas', ['hola', 'gracias']);
      yield* sayShow('sofia', 'bien', T('¡[bien]!', 'Fine! (thumbs up)'));
      yield* ask(null, '¿Cómo está Sofía?', 'How is Sofía?', 'bien', ['cansado', 'no']);
      yield* sayShow('sofia', cinta(RED), T('¡Un show de perros! ¿Canelo?', 'A dog show! Will Canelo be in it?'));
      yield* siNo('sofia', '¿Canelo? ¿En el show?', 'Canelo, in the show?', true);
      yield G.questCard('c14');
      const n = dog(f); G.pet.place(f, n); yield 10;
      yield* say('sofia', T('¡Mira! Un cartel...', 'Look! A picture sign: tell Canelo what it shows!'));
      yield* ask('sofia', 'Sofía: ¡...!', 'Sofía holds up a picture sign. Tell Canelo!', 'sientate', ['ven', 'pelota'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('sientate')));
      yield* G.pet.play('sit');
      yield* say('sofia', T('¡Muy bien! Ahora... Canelo, ¡[pata]!', 'Very good! Now... Canelo, shake!'));
      yield* G.pet.play('paw'); K.heart(f, n);
      yield* say('sofia', T('¡Ahora tú!', 'Now you! Hold out your hand...'));
      yield* ask(null, '¡Ahora tú! Canelo... ¡...!', 'Now you: hold out your hand and tell Canelo!', 'pata', ['sientate', 'ven'], { intro: true, how: 'watch', look: { pata: 'both', sientate: 'both', ven: 'both' }, point: n, wrong: dogWrong(f) });
      yield* G.pet.play('paw', { amp: 0.4 }); tries(f, 1);
    } },
    { auto: 'villa', part: 'pata', run: function* (f) { // tries 2 and 3; salta
      const n = dog(f);
      yield* ask(null, 'Canelo... ¡...!', 'Sofía holds up the paw sign. Tell him!', 'pata', ['sientate', 'ven'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('pata')));
      yield* G.pet.play('paw', { amp: 0.7 }); tries(f, 2);
      yield* ask(null, 'Canelo... ¡...!', 'Again!', 'pata', ['ven', 'hola'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('pata')));
      yield* G.pet.play('paw'); tries(f, 3); learned(f, 'pata');
      yield* G.pet.play('dance');
      yield* say('sofia', T('¡Bravo! Y ahora... ¡[salta]!', 'Bravo! And now... jump! (she jumps over the little bar)'));
      const s = f.npc('sofia'); if (s) { s.oy = -10; yield 8; s.oy = -14; yield 8; s.oy = -6; yield 6; s.oy = 0; }
      dogAt(f, BAR[0] - 1, BAR[1], 'right'); yield* G.pet.play('jump');
      yield* ask(null, '¡Ahora tú! Canelo... ¡...!', 'Now you: tell Canelo to jump the bar!', 'salta', ['pata', 'sientate'], { intro: true, how: 'watch', look: { salta: 'both', pata: 'both', sientate: 'both' }, point: n, wrong: dogWrong(f) });
      yield* G.pet.play('jump', { amp: 0.4 }); tries(f, 1);
    } },
    { auto: 'villa', part: 'salta', run: function* (f) { // tries 2 and 3; cookies from the bakery
      const n = dog(f);
      yield* ask(null, 'Canelo... ¡...!', 'The jump sign! Tell him!', 'salta', ['ven', 'pata'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('salta')));
      yield* G.pet.play('jump', { amp: 0.7 }); tries(f, 2);
      yield* ask(null, 'Canelo... ¡...!', 'Once more!', 'salta', ['sientate', 'hola'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('salta')));
      yield* G.pet.play('jump'); tries(f, 3); learned(f, 'salta');
      yield* sayShow('sofia', 'galleta', T('¡[galleta:Galletas] para Canelo! ¡La [panaderia]!', 'Cookies for Canelo, for the show! From the bakery!'));
    } },
    { who: 'marta', bubble: 'galleta', part: 'galleta', run: function* (f, c) { // una galleta
      yield* G.intro.show('galleta', { who: 'marta', prompt: '¿Para Canelo? ¡Una [galleta]!', en: 'For Canelo? A cookie!', known: ['pan', 'queso'] });
      yield* ask('marta', '¿Cuántas?', 'How many cookies? (count them)', 'tres', ['dos', 'cuatro'], { show: many('galleta', 3) });
      yield* ask(null, 'Tú: ¡...!', 'Ask nicely!', 'porfavor', ['gracias', 'adios']);
      bag().add('galleta', { q: 'c14' });
      yield* ask(null, 'Marta: ¡Aquí tienes!', 'Here you are! What do you say?', 'gracias', ['hola', 'adios'], { show: many('galleta', 3) });
    } },
    { who: 'sofia', bubble: () => cinta(BLUE), part: 'cinta', run: function* (f, c) { // the show: Luna's picture signs, four ribbons
      yield* ask('sofia', '¿Qué tienes?', 'Sofía: what have you got for Canelo?', 'galleta', ['pan', 'hueso']);
      yield* say('sofia', T('¡El show!', 'Show time!'));
      const crowd = { luna_s: [19, 19, 'down'], nico: [15, 21, 'right'], rosa: [15, 22, 'right'], gomez: [22, 21, 'left'], lucia: [22, 22, 'left'] };
      const back = yield* scene(f, crowd, [18, 23, 'up'], [18, 21, 'up']);
      c.data.show = 1;
      yield* say('luna', T('¡El show de perros! ¡Canelo!', 'The dog show! Canelo, with {name}!'));
      const n = dog(f), wins = [RED, BLUE, WHITE, BLUE];
      const rounds = [['sientate', ['salta', 'pata']], ['pata', ['ven', 'salta']], ['salta', ['sientate', 'pata']], ['ven', ['pata', 'sientate']]];
      for (let i = 0; i < rounds.length; i++) {
        const [t, others] = rounds[i];
        if (t === 'ven') { yield* run(f, 21, 19, 4); n.dir = 'left'; }
        yield* ask('luna', 'Luna: ¡...!', 'Luna holds up a picture sign. Say it to Canelo!', t, others, Object.assign({ point: n, wrong: dogWrong(f) }, fromSign(t)));
        if (t === 'ven') yield* come(f); else yield* G.pet.trick(t);
        clap(f, Object.keys(crowd));
        if (i === 1) { bag().take('galleta', { q: 'c14' }); yield* ask('luna', '¿Y para Canelo?', 'A treat for the champion! What do you give him?', 'galleta', ['hueso', 'pelota'], { point: n }); yield* G.pet.play('eat', { item: 'galleta' }); }
        // a ribbon for each trick
        if (i === 1) {
          yield* sayShow('luna', cinta(BLUE), T('¡Una cinta [azul]!', 'A blue ribbon!'));
          yield* ask('luna', '¿De qué color?', 'What colour is this ribbon?', 'azul', ['rojo', 'blanco'], { intro: true, how: 'show', look: { azul: 'text', rojo: 'both', blanco: 'both' }, show: cinta(BLUE) });
        } else yield* ask('luna', '¿De qué color?', 'A ribbon! What colour is it?', i === 0 ? 'rojo' : i === 2 ? 'blanco' : 'azul', i === 0 ? ['blanco', 'galleta'] : ['blanco', 'rojo'].concat(i === 2 ? ['azul'] : []).filter(k => k !== (i === 2 ? 'blanco' : 'azul')).slice(0, 2), { show: cinta(wins[i]) });
        (c.data.ribbons || (c.data.ribbons = [])).push(wins[i]);
      }
      K.confetti(); G.audio.jingle('promote');
      yield* say('luna', T('¡Canelo es el campeón!', 'Canelo is the champion!'));
      const s = f.npc('sofia'); if (s && G.ambient) G.ambient.happy(s);
      yield* sayShow('sofia', 'feliz', T('¡Estoy [feliz]!', 'I\'m happy! (she jumps for joy)'));
      yield* ask(null, '¿Cómo está Sofía?', 'How is Sofía?', 'feliz', ['cansado', 'bien'], { intro: true, how: 'show', look: { feliz: 'text', cansado: 'both', bien: 'both' }, point: s || undefined });
      yield* G.pet.play('dance');
      yield* ask('luna', '¿Y Canelo?', 'Canelo dances. And how is he?', 'feliz', ['cansado', 'bien'], { point: n });
      yield* ask('luna', '¿Cuántas cintas?', 'How many ribbons did Canelo win?', 'cuatro', ['tres', 'cinco'], { show: heap(wins.map(cinta)) });
      c.data.show = 0;
      yield* unscene(f, back);
      yield* tell(T('¡A la [casa]! Canelo...', 'Home! Canelo is worn out.'));
    } },
    { who: 'mama', bubble: 'cansado', run: function* (f) { // home: tired Canelo
      const n = dog(f); G.pet.anim(n, 'huh');
      yield* say('mama', T('¡Una cinta! ¡Bravo, Canelo!', 'A ribbon! Bravo, Canelo!'));
      yield* ask('mama', '¿Cómo está Canelo?', 'He yawns. How is Canelo?', 'cansado', ['feliz', 'bien'], { point: n });
      yield* ask('mama', 'Canelo, ¡a la...!', 'Where does he go to rest?', 'cama', ['ven', 'pelota'], { point: tile(7, 5) });
      yield* K.walk(f, n, 7, 5, 3); n.dir = 'left'; G.pet.sound('snore');
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa') hold(f, 'sofia', ...V('sofia'), 'down'); },
    draw(f, ctx, c) { if (f.mapId === 'villa' && c.step >= 1 && c.step <= 2) bar(ctx, f, ...BAR); },
  });

  // =====================================================================
  //  C15 · Las flores de Lucía  (Lucía, the plaza and flowers around town)  triste, flor, rosado, amarillo, mariposa
  // =====================================================================
  const LUCIA = [26, 12];
  const BEDS = [[8, 12, 'rojo'], [31, 9, 'blanco'], [23, 15, 'azul'], [12, 15, 'rosa']], YELLOW_AT = [39, 7];
  CH.script('c15', [
    { who: 'lucia', bubble: 'triste', run: function* (f) { // triste; la flor; a pink one
      yield* ask(null, 'Tú: ¿...?', 'Lucía looks sad. Ask her how she is!', 'comoestas', ['hola', 'porfavor']);
      yield* sayShow('lucia', 'triste', T('[triste:Triste]...', 'Sad... (she wipes a tear)'));
      yield* ask(null, '¿Cómo está Lucía?', 'How is Lucía?', 'triste', ['feliz', 'cansado'], { intro: true, how: 'show', look: { triste: 'text', feliz: 'both', cansado: 'both' }, point: f.npc('lucia') || undefined });
      const n = dog(f); G.pet.place(f, n); yield 10; G.pet.anim(n, 'paw');
      yield* ask(null, '¿Y ahora?', 'Canelo nuzzles her hand. She sniffs. How is she still?', 'triste', ['feliz', 'cansado'], { point: f.npc('lucia') || undefined });
      yield* say('lucia', T('Mi mamá... ¡su cumpleaños!', 'It\'s my mom\'s birthday... and I have no present.'));
      yield* G.intro.show('flor', { who: 'lucia', prompt: '¡Mira! Una [flor]...', en: 'Look! A flower... (she points at the flower bed)', known: ['pelota', 'hueso'] });
      yield* sayShow('lucia', flower(PINK), T('Una [flor] [rosa:rosada]... ¿[porfavor]?', 'A PINK flower... please? (flowers grow around town)'));
      yield G.questCard('c15');
    } },
    { spots: BEDS.map(([x, y], i) => ({ map: 'villa', at: [x, y], quiet: true, off: c => !!(c.data.tried || {})[i] })), part: () => flower(PINK),
      hint: (f, c) => BEDS.filter((b, i) => !(c.data.tried || {})[i]).map(([x, y]) => ({ x: x * TL + 12, y: y * TL + 12, spot: 'flor', secret: true })),
      run: function* (f, c, i) { // flowers around town: the pink one is the one she wants
        const [x, y, col] = BEDS[i], pink = col === 'rosa';
        G.audio.sfx('select');
        if (!c.data.first) { c.data.first = 1; yield* ask(null, '¿Qué es?', 'What is this?', 'flor', ['pelota', 'hueso'], { show: flower(COL(col)) }); }
        if (!pink) {
          yield* ask(null, '¿De qué color?', 'What colour is this flower?', col, ['rojo', 'blanco', 'azul'].filter(k => k !== col), { show: flower(COL(col)) });
          yield* siNo(null, '¿Para Lucía?', 'Is it the one Lucía wants? (pink)', false, { show: flower(COL(col)) });
          (c.data.tried || (c.data.tried = {}))[i] = 1; S.autosave();
          return false;
        }
        yield* siNo(null, '¿[rosa:Rosada]?', 'Is it the pink one?', true, { show: flower(PINK) });
        G.audio.jingle('item'); G.intro.meet('rosa', 'find', { who: 'lucia' }); yield 40;
        c.data.picked = 1; bag().add('flor', { col: 'rosa', q: 'c15' });
        yield* ask(null, '¿De qué color?', 'What colour is your flower?', 'rosa', ['azul', 'blanco'], { show: flower(PINK) }); // (never rojo beside rosa)
        void x; void y;
      } },
    { who: 'lucia', bubble: () => flower(PINK), run: function* (f) { // and a yellow one
      yield* say('lucia', T('¡[si]! ¡La [flor] [rosa:rosada]! ¡[gracias]!', 'Yes! The pink flower! Thank you!'));
      yield* sayShow('lucia', flower(YELLOW), T('Y una [flor] [amarillo:amarilla]... ¿[porfavor]?', 'And a YELLOW flower... please? (by the farm road)'));
    } },
    { spot: { map: 'villa', at: YELLOW_AT, icon: () => flower(YELLOW) }, part: () => flower(YELLOW), run: function* (f, c) { // the yellow one; a butterfly on it
      G.audio.jingle('item'); G.intro.meet('amarillo', 'find', { who: 'lucia' }); yield 40;
      yield* tell(T('¡[amarillo:Amarilla]! ...¡Shh! ¡Mira!', 'Yellow! ...Shh! Look! (something sits on it)'));
      c.data.fly = 1;
      yield* G.intro.show('mariposa', { who: null, prompt: '¡Una [mariposa]!', en: 'A butterfly!', known: ['cabra', 'gato'] });
      yield* ask(null, '¿De qué color?', 'What colour is the flower?', 'amarillo', ['azul', 'rojo'], { show: flower(YELLOW) });
      bag().add('flor', { col: 'amarillo', q: 'c15' });
      c.data.fly = 2; const n = dog(f); yield 40; G.pet.anim(n, 'huh');
      yield* ask(null, '¿Qué es?', 'It lands on Canelo\'s nose! What is it?', 'mariposa', ['cabra', 'gato'], { point: n });
      c.data.fly = 3; G.pet.sound('whine');
      yield* tell(T('¡Ja, ja! ¡A Lucía!', 'Ha ha! Back to Lucía with the flowers!'));
    } },
    { who: 'lucia', bubble: () => flower(YELLOW), part: 'flor', run: function* (f) { // the bouquet; happy Lucía
      bag().take('flor', { col: 'rosa', q: 'c15' }); bag().take('flor', { col: 'amarillo', q: 'c15' });
      yield* say('lucia', T('¡[rosa:Rosada] y [amarillo:amarilla]! ¡Y mis [flor:flores]!', 'Pink and yellow! And my own flowers!'));
      const bunch = heap([flower(PINK), flower(YELLOW), flower(RED), flower(WHITE), flower(BLUE)]);
      yield* ask('lucia', '¿Cuántas [flor:flores]?', 'Her bouquet: how many flowers?', 'cinco', ['cuatro', 'seis'], { show: bunch });
      yield* siNo('lucia', '¿Para mi mamá?', 'For her mom?', true, { show: bunch });
      const l = f.npc('lucia');
      if (l) { l.hidden = true; yield 50; l.hidden = false; if (G.ambient) G.ambient.happy(l); }
      yield* say('lucia', T('¡Mi mamá está muy [feliz]! ¡[gracias], {name}!', 'My mom is so happy! Thank you, {name}!'));
      yield* ask(null, '¿Cómo está Lucía?', 'And how is Lucía now?', 'feliz', ['triste', 'cansado'], { point: l || undefined });
      const n = dog(f); G.pet.sound('whine'); G.pet.anim(n, 'huh');
      yield* ask('lucia', '¿Y Canelo?', 'Canelo whimpers: the butterfly flew away. How is he?', 'triste', ['feliz', 'cansado'], { point: n });
      yield* sayShow('lucia', 'adios', T('¡[adios]!', 'Bye! (she waves)'));
      yield* ask(null, 'Lucía: ¡...!', 'Wave back!', 'adios', ['hola', 'gracias']);
      yield* tell(T('Las [flor:flores]... ¡un regalo!', 'From now on you can pick a flower a day as a present.'));
      release(f, 'lucia');
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa' && c.step <= 3) hold(f, 'lucia', ...LUCIA, 'down'); },
    draw(f, ctx, c) {
      if (f.mapId !== 'villa') return;
      if (c.step === 1) BEDS.forEach(([x, y, col], i) => { if (!(c.data.tried || {})[i]) bigFlower(ctx, f, x, y, COL(col), i); });
      if (c.step === 3 || (c.step === 4 && c.data.fly)) bigFlower(ctx, f, ...YELLOW_AT, YELLOW, 7);
    },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'villa' || !c.data.fly || c.step !== 3) return;
      const n = f.npc('canelo'), tx = c.data.fly >= 2 && n ? n.x * TL + 12 : YELLOW_AT[0] * TL + 12, ty = c.data.fly >= 2 && n ? n.y * TL + 2 : YELLOW_AT[1] * TL + 4;
      const fl = c.data.fl || (c.data.fl = { x: tx, y: ty });
      if (c.data.fly === 3) { fl.x += 1.2; fl.y -= 0.9; } else { fl.x += (tx - fl.x) * 0.08; fl.y += (ty + Math.sin(G.frame / 9) * 2 - fl.y) * 0.08; }
      butterfly(ctx, fl.x - Math.round(f.cam.x), fl.y - Math.round(f.cam.y));
    },
  });

  // =====================================================================
  //  C16 · Las páginas perdidas  (Inés and Señor Gómez, the library and the park)  biblioteca, busca, árbol, conejo
  // =====================================================================
  // the picture cards blown out of the notebook: where they land in the park, and the pictures on them
  const CARDS = [[16, 20, ['manzana', 'naranja']], [13, 22, ['queso', 'huevo']], [22, 23, ['carta', 'flor']]], TREE = [23, 18], RABBIT_CARD = [15, 23], GOMEZ_BENCH = [19, 19];
  const card = (ctx, f, x, y, k) => { const X = sx(f, x) + 6, Y = sy(f, y) + 6 + Math.round(Math.sin((f.t + k * 20) / 12)); ctx.fillStyle = '#5a3810'; ctx.fillRect(X - 1, Y - 1, 14, 12); ctx.fillStyle = '#f8f0dc'; ctx.fillRect(X, Y, 12, 10); ctx.fillStyle = '#e88080'; ctx.fillRect(X + 3, Y, 1, 10); };
  // a picture card from your notebook, named as it goes back in: its picture, three words
  function* named(id, others) { yield* ask(null, '¿Qué es?', 'A picture card from your notebook! Name it and it goes back in.', id, others, { show: id, display: 'text' }); G.audio.sfx('note'); }
  CH.script('c16', [
    { who: 'gomez', bubble: { icon: 'pagina' }, run: function* () { // ¿Inés? ¡La biblioteca!
      yield* say('gomez', T('¡{name}! Inés... ¡un libro para ti!', '{name}! Inés has a book for you!'));
      yield* G.intro.find('biblioteca', { who: 'gomez', map: 'villa', at: [29, 18], wrong: [[29, 7], [17, 5]], pics: [[29, 18, 'biblioteca'], [29, 7, 'panaderia'], [17, 5, 'escuela']],
        prompt: '¿Inés? ¡La [biblioteca]!', en: 'Inés? At the library! (which one? tap it)' });
    } },
    { auto: 'biblioteca', part: 'biblioteca', run: function* (f, c) { // Inés; a gust of wind: the cards fly out
      if (!G.intro.found('biblioteca')) { const s = G.state.finds.biblioteca; if (s) s.found = true; if (G.intro.meet('biblioteca', 'find', { who: 'gomez' })) yield 40; }
      yield* CH.banner('biblioteca', ['panaderia', 'escuela']);
      yield* say('ines', T('Shhh...', 'Shhh... (this is the library: whisper!)'));
      yield* ask(null, 'Tú: ¡...!', 'Say hello to Inés, in a whisper!', 'hola', ['adios', 'gracias']);
      yield* ask('ines', '¿Cómo está Inés?', 'Inés looks sad: no one comes to read. How is she?', 'triste', ['feliz', 'cansado'], { point: f.npc('ines') || undefined });
      G.audio.sfx('swing'); G.fx.flash = 8; G.fx.flashColor = '#ffffff';
      for (let i = 0; i < 10; i++) G.fx.twinkle(80 + Math.random() * 160, 60 + Math.random() * 80);
      yield* tell(T('¡Fuuu! ...¡Ay! ¡Mi cuaderno!', 'Whoosh! A gust of wind through the window... picture cards fly out of your notebook, off to the park!'));
      c.data.cards = 1; S.autosave();
      yield* ask(null, 'Tú: ¿Me ayudas...?', 'Ask Inés for help, nicely!', 'porfavor', ['gracias', 'adios'], { show: { icon: 'pagina' } });
      yield* say('ines', T('¡[si]! El [parque]... ¡el señor Gómez!', 'Yes! In the park... Señor Gómez will help!'));
    } },
    { who: 'gomez', bubble: { icon: 'pagina' }, part: 'busca', run: function* (f, c) { // ¡busca! (Gómez shows it, then you: try 1)
      yield* ask(null, '¿Dónde está Gómez?', 'Where is Señor Gómez sitting?', 'banco', ['fuente', 'granja'], { point: f.npc('gomez') || undefined });
      yield* say('gomez', T('¿Tus cartas? Canelo... ¡[busca]!', 'Your cards? Canelo... find them!'));
      yield* busca(f, ...CARDS[0].slice(0, 2)); c.data.got = 1; S.autosave();
      for (const id of CARDS[0][2]) yield* named(id, id === 'manzana' ? ['pan', 'huevo'] : ['queso', 'manzana']);
      yield* say('gomez', T('¡Ahora tú!', 'Now you! Tell Canelo to find the next one.'));
      yield* ask(null, '¡Ahora tú! Canelo... ¡...!', 'Now you: tell Canelo to sniff out the next card!', 'busca', ['salta', 'ven'], { intro: true, how: 'watch', look: { busca: 'both', salta: 'both', ven: 'both' }, point: dog(f), wrong: dogWrong(f) });
      tries(f, 1); yield* busca(f, ...CARDS[1].slice(0, 2)); c.data.got = 2; S.autosave();
      for (const id of CARDS[1][2]) yield* named(id, id === 'queso' ? ['huevo', 'pan'] : ['manzana', 'naranja']);
    } },
    { auto: 'villa', run: function* (f, c) { // tries 2 and 3; the card up a tree
      yield* ask(null, 'Canelo... ¡...!', 'One more card! Tell Canelo.', 'busca', ['salta', 'sientate'], Object.assign({ point: dog(f), wrong: dogWrong(f) }, fromSign('busca')));
      tries(f, 2); yield* busca(f, ...CARDS[2].slice(0, 2)); c.data.got = 3; S.autosave();
      for (const id of CARDS[2][2]) yield* named(id, id === 'carta' ? ['pelota', 'flor'] : ['carta', 'hueso']);
      yield* ask(null, '¿De qué color?', 'This flower card: what colour?', 'rosa', ['azul', 'blanco'], { show: flower(PINK) });
      yield* ask('gomez', 'Gómez: ¿Y para Canelo?', 'Gómez: a treat for Canelo! What do you give him?', 'galleta', ['hueso', 'pan'], { point: dog(f) });
      yield* G.pet.play('eat', { item: 'galleta' });
      yield* ask('gomez', '¡Mmm! ¿De la...?', 'Mmm! Where are cookies from?', 'panaderia', ['biblioteca', 'escuela']);
      yield* ask(null, 'Canelo... ¡...!', 'Is there another card? Tell Canelo!', 'busca', ['ven', 'pata'], Object.assign({ point: dog(f), wrong: dogWrong(f) }, fromSign('busca')));
      tries(f, 3); learned(f, 'busca');
      yield* busca(f, TREE[0], TREE[1] + 1); dog(f).dir = 'up'; bark(f); yield 16; bark(f);
      c.data.tree = 1; S.autosave();
      yield* G.intro.find('arbol', { who: 'gomez', map: 'villa', at: TREE, wrong: [[20, 18], [19, 21]], pics: [[TREE[0], TREE[1], 'arbol'], [20, 18, 'banco'], [19, 21, 'agua']],
        prompt: 'Una carta... ¡en el [arbol]!', en: 'A card is stuck up in the tree! (which one? tap it)' });
    } },
    { auto: 'villa', when: found('arbol'), part: 'arbol', run: function* (f, c) { // the card flutters down; a rabbit on the last one
      bark(f); c.data.tree = 2; G.audio.sfx('swing'); yield 30;
      yield* tell(T('¡La carta! ...¿Y esta?', 'The card flutters down! ...And one more, on the lawn: someone is sitting on it!'));
      const r = animal(f, 'conejo'); if (r) { r.pin = at(...RABBIT_CARD); G.animals.react(f, r); }
      yield* G.intro.show('conejo', { who: 'gomez', prompt: '¡Mira! ¡Un [conejo]!', en: 'Look! A rabbit!', known: ['gato', 'perro'] });
      if (r) { r.pin = null; r.go = [...at(TREE[0] - 1, TREE[1] + 1), 1.8]; }
      yield 40;
      yield* ask('gomez', '¿Dónde está el [conejo]?', 'It hopped off to hide! Where is the rabbit? (only its ears show)', 'arbol', ['banco', 'fuente']);
      const n = dog(f); G.pet.anim(n, 'jump');
      yield* ask('gomez', '¡Canelo! ¡...!', 'Canelo wants to chase it! Tell him.', 'sientate', ['busca', 'ven'], { point: n, wrong: dogWrong(f) });
      yield* G.pet.play('sit');
      yield* ask(null, 'Canelo... ¡...!', 'The rabbit dropped the card! Tell Canelo to find it.', 'busca', ['salta', 'ven'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('busca')));
      yield* busca(f, ...RABBIT_CARD); c.data.got = 4; S.autosave();
      yield* ask(null, '¿Qué es?', 'A picture card: what is on it?', 'mariposa', ['conejo', 'gato'], { show: 'mariposa', display: 'text' });
      if (r) r.go = null;
      yield* say('gomez', T('¡Todo! ¡A la [biblioteca]!', 'All of them! Back to the library, to Inés!'));
    } },
    { who: 'ines', bubble: { icon: 'pagina' }, part: 'pagina', run: function* (f, c) { // the Mi perro page, put back together; a bookmark
      c.data.cards = 0;
      yield* say('ines', T('¡Tus cartas! A ver... ¡Canelo!', 'Your cards! Let\'s see... the page about Canelo!'));
      const r = yield G.pages.open('mascota', G.pages.words('mascota').length >= 4 ? G.pages.words('mascota') : ['ven', 'sientate', 'pata', 'salta']);
      if (r.result) S.solvePage('mascota');
      yield* ask('ines', '¿Y esta?', 'And the last card: what is on it?', 'conejo', ['gato', 'cabra'], { show: 'conejo' });
      yield* say('ines', T('¡Qué bonito! ¡Estoy [feliz]! Y para ti...', 'How lovely! I\'m happy! And for you... a bookmark.'));
      yield* ask(null, 'Inés: ¡Para ti!', 'Inés gives you a bookmark. What do you say?', 'gracias', ['hola', 'adios'], { show: { icon: 'pagina' } });
      yield* say('ines', T('¡Las páginas... aquí, cada día!', 'Come back every day: I keep all your notebook pages here, to play with!'));
      yield* sayShow('ines', 'adios', T('¡[adios]!', 'Bye!'));
      yield* ask(null, 'Inés: ¡...!', 'Wave back!', 'adios', ['hola', 'gracias']);
    } },
    { who: 'gomez', bubble: true, run: function* () { // Gómez asks where you've been
      yield* ask('gomez', '¿De dónde vienes?', 'Where have you just been?', 'biblioteca', ['panaderia', 'escuela']);
      yield* ask('gomez', '¿Y el [conejo]?', 'And the rabbit? Where was it hiding?', 'arbol', ['banco', 'fuente']);
      yield* say('gomez', T('¡Muy bien, {name}! ¡Y Canelo!', 'Very good, {name}! And Canelo too!'));
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa' && c.step >= 2 && c.step <= 6) hold(f, 'gomez', ...GOMEZ_BENCH, 'down'); },
    draw(f, ctx, c) {
      if (f.mapId !== 'villa' || !c.data.cards) return;
      CARDS.forEach(([x, y], k) => { if ((c.data.got | 0) <= k) card(ctx, f, x, y, k); });
      if (c.data.tree === 1) card(ctx, f, TREE[0], TREE[1] - 0.6, 5);
      if ((c.data.got | 0) < 4 && c.step >= 4) card(ctx, f, RABBIT_CARD[0], RABBIT_CARD[1], 6);
    },
  });

  // =====================================================================
  //  C17 · ¿Qué dicen?  (Nico: the park pond, a tree, the farm, the fence)  rana, croac, verde, pájaro, gira
  // =====================================================================
  const BIRD_TREE = [23, 18], NICO_POND2 = [18, 20];
  function* listen(f, s, en) { K.npcSay(f, 'nico', s, 120); yield* say('nico', T(s, en)); }
  const ranaP = f => over(animal(f, 'rana')), duckP2 = f => over(animal(f, 'pato')), catP = f => (f.amb && f.amb.cat ? { x: f.amb.cat.x * TL + 12, y: f.amb.cat.y * TL - 8 } : null);
  const aniHint = kind => f => { const a = animal(f, kind); return a ? [{ x: Math.round(a.x), y: Math.round(a.y - 6), animal: kind }] : []; };
  function drawBird(ctx, f, x, y, col) { // a little bird on a branch (pío, pío)
    const X = sx(f, x) + 10, Y = sy(f, y) - 2 + ((G.frame >> 5) & 1 ? -1 : 0);
    ctx.fillStyle = '#1a1420'; ctx.fillRect(X - 1, Y - 1, 9, 7); ctx.fillStyle = col; ctx.fillRect(X, Y, 7, 5); ctx.fillRect(X + 5, Y - 2, 4, 4);
    ctx.fillStyle = '#f8a020'; ctx.fillRect(X + 9, Y - 1, 2, 1); ctx.fillStyle = '#101010'; ctx.fillRect(X + 7, Y - 1, 1, 1);
  }
  CH.script('c17', [
    { who: 'nico', bubble: { icon: 'nota' }, run: function* (f) { // a game: listen!
      yield* say('nico', T('¡{name}! ¡Un juego! ¡Escucha!', '{name}! A game! Listen...'));
      G.animals.cry('rana'); yield 30; G.animals.cry('rana');
      yield* listen(f, '¡Croac, croac!', 'Croak, croak! Who says that? It comes from the park pond. Find it and tap it!');
      yield G.questCard('c17');
    } },
    { tap: 'rana', hint: aniHint('rana'), part: 'rana', run: function* (f) { // la rana, croac, verde
      yield* G.intro.show('rana', { who: 'nico', prompt: '¡Croac! ¡Una [rana]!', en: 'Croak! A frog!', known: ['pato', 'conejo'] });
      G.animals.cry('rana');
      yield* G.intro.show('croac', { who: 'nico', prompt: 'La [rana] dice ¡[croac]!', en: 'The frog says ribbit!', ask: '¿Qué dice la [rana]?', askEn: 'What does the frog say?', known: ['miau', 'guau'] });
      yield* say('nico', T('Y la [rana] es... ¡[verde]!', 'And the frog is... green!'));
      yield* ask('nico', '¿De qué color es la [rana]?', 'What colour is the frog?', 'verde', ['azul', 'rojo'], { intro: true, how: 'show', look: { verde: 'text', azul: 'both', rojo: 'both' }, point: ranaP(f) });
      const a = animal(f, 'rana'); if (a) G.animals.react(f, a); G.animals.cry('rana');
      yield* ask('nico', '¿Qué es?', 'She hops to another lily pad. What is she?', 'rana', ['pato', 'conejo'], { point: ranaP(f) });
      yield* ask('nico', '¿Y qué dice?', 'She croaks again. What does she say?', 'croac', ['miau', 'guau'], { point: ranaP(f) });
    } },
    { auto: 'villa', part: 'pajaro', run: function* (f, c) { // ¡pío, pío!: el pájaro in the tree
      c.data.bird = 1; G.animals.cry('pajaro'); yield 30; G.animals.cry('pajaro');
      yield* G.intro.show('pajaro', { who: 'nico', prompt: '¡Pío, pío! ¡Un [pajaro]!', en: 'Tweet, tweet! A bird! (up in the tree)', known: ['rana', 'conejo'] });
      yield* ask('nico', '¿Dónde está el [pajaro]?', 'Where is the bird?', 'arbol', ['banco', 'flor'], { point: tile(...BIRD_TREE) });
      yield* ask('nico', '¿De qué color es el [pajaro]?', 'What colour is the bird?', 'azul', ['verde', 'blanco'], { point: tile(...BIRD_TREE) });
      yield* ask('nico', '¿Y el [arbol]?', 'And the tree: what colour?', 'verde', ['azul', 'blanco'], { point: tile(...BIRD_TREE) });
      c.data.bird = 0;
      yield* say('nico', T('¡Más! ¡Escucha!', 'More! Listen... (Nico comes with you)'));
      yield* listen(f, '¡Cuac, cuac!', 'Quack, quack! Who says that? Find it at the farm pond and tap it!');
    } },
    { tap: 'pato', hint: aniHint('pato'), run: function* (f) {
      yield* ask('nico', '¡[si]! ¿Quién es?', 'Yes! Who is it?', 'pato', ['rana', 'perro'], { point: duckP2(f) });
      yield* ask('nico', '¿De qué color es el patito?', 'And the duckling: what colour is it?', 'amarillo', ['blanco', 'verde'], { point: over(zoo(f).find(a => a.kind === 'pato' && a.baby)) });
      yield* listen(f, '¡Miau!', 'Meow! Who says that? (on the park fence)');
    } },
    { tap: 'cat', hint: f => { const p = catP(f); return p ? [Object.assign({ cat: true }, p, { y: p.y + 6 })] : []; }, run: function* (f) {
      yield* ask('nico', '¡[si]! ¿Quién es?', 'Yes! Who is it?', 'gato', ['conejo', 'pajaro'], { point: catP(f) });
      const r = animal(f, 'conejo'); if (r) G.animals.react(f, r);
      yield* ask('nico', '¿Y este? ¡No dice nada!', 'A rabbit hops by. It says nothing! What is it?', 'conejo', ['gato', 'rana'], { point: over(r) });
      yield* listen(f, '¡Croac!', 'Ribbit! Who says that? (back at the park pond)');
    } },
    { tap: 'rana', hint: aniHint('rana'), run: function* (f, c) {
      yield* ask('nico', '¡[si]! ¿Quién es?', 'Yes! Who is it?', 'rana', ['pato', 'perro'], { point: ranaP(f) });
      c.data.bird = 1; G.animals.cry('pajaro');
      yield* ask('nico', '¡Pío, pío! ¿Quién es?', 'Tweet, tweet! Who is it?', 'pajaro', ['rana', 'gato'], { point: tile(...BIRD_TREE) });
      c.data.bird = 0; c.data.fly = 1;
      yield* ask('nico', '¿Y quién no dice nada?', 'Who never says anything? (fluttering by)', 'mariposa', ['pajaro', 'rana']);
      c.data.fly = 0;
      // the other way round: Nico points, you say the sound
      yield* ask('nico', '¿Qué dice el [pato]?', 'What does the duck say?', 'cuac', ['miau', 'guau'], { show: 'pato' });
      yield* ask('nico', '¿Qué dice la [rana]?', 'What does the frog say?', 'croac', ['miau', 'guau'], { show: 'rana' });
      yield* ask('nico', '¿Qué dice el [gato]?', 'What does the cat say?', 'miau', ['guau', 'croac'], { show: 'gato' });
      yield* say('nico', T('¡Y yo! ¡Guau, guau!', 'And me! Woof, woof!'));
      const n = dog(f); G.pet.place(f, n); yield 10; yield* G.pet.play('dance');
      yield* ask('nico', '¿Quién dice "guau"?', 'Canelo answers with a dance! Who says woof?', 'perro', ['gato', 'rana'], { point: n });
    } },
    { auto: 'villa', part: 'gira', run: function* (f) { // Nico's prize: ¡gira!
      const n = dog(f), nk = f.npc('nico');
      yield* say('nico', T('¡Mira! Canelo... ¡[gira]!', 'Look! Canelo... spin! (Nico spins round)'));
      if (nk) { for (const d of ['left', 'up', 'right', 'down', 'left', 'up', 'right', 'down']) { nk.dir = d; yield 5; } }
      yield* G.pet.play('spin');
      yield* ask(null, '¡Ahora tú! Canelo... ¡...!', 'Now you: tell Canelo to spin!', 'gira', ['salta', 'busca'], { intro: true, how: 'watch', look: { gira: 'both', salta: 'both', busca: 'both' }, point: n, wrong: dogWrong(f) });
      yield* G.pet.play('spin', { amp: 0.4 }); tries(f, 1);
      yield* ask(null, 'Canelo... ¡...!', 'Nico holds up a spin sign. Tell Canelo!', 'gira', ['pata', 'ven'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('gira')));
      yield* G.pet.play('spin', { amp: 0.7 }); tries(f, 2);
      yield* ask(null, 'Canelo... ¡...!', 'Once more!', 'gira', ['busca', 'sientate'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('gira')));
      yield* G.pet.play('spin'); tries(f, 3); learned(f, 'gira');
      yield* ask(null, '¿Cómo está Nico?', 'Nico laughs and claps. How is he?', 'feliz', ['triste', 'cansado'], { point: nk || undefined });
      G.pet.sound('whine'); G.pet.anim(n, 'huh');
      yield* ask('nico', '¿Y Canelo?', 'The frog hopped away and Canelo whines. How is he?', 'triste', ['feliz', 'cansado'], { point: n });
      yield* say('nico', T('¡[gracias], {name}! ¡[adios]!', 'Thanks, {name}! Bye!'));
      release(f, 'nico');
    } },
  ], {
    follows: (who, c) => who === 'nico' && c.step >= 3 && c.step <= 5,
    stage(f, c) { if (f.mapId === 'villa' && c.step >= 1 && c.step <= 2) hold(f, 'nico', ...NICO_POND2, 'down'); },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'villa') return;
      if (c.data.bird) drawBird(ctx, f, ...BIRD_TREE, '#3068e0');
      if (c.data.fly) butterfly(ctx, f.player.x * TL + 20 - Math.round(f.cam.x) + Math.sin(G.frame / 9) * 14, f.player.y * TL - 10 - Math.round(f.cam.y) + Math.cos(G.frame / 7) * 6);
    },
    tap(kind, f, c) { // a wrong one in Nico's game: "¡No! ¡Escucha!"
      const b = CH.beat('c17'); if (!b || !b.tap || c.step < 3 || c.step > 5 || kind === b.tap || !['pato', 'rana', 'cat', 'conejo', 'gallina', 'caballo', 'cabra'].includes(kind)) return false;
      K.npcSay(f, 'nico', '¡No! ¡Escucha!', 90); G.audio.sfx('boop');
      return true;
    },
  });

  // =====================================================================
  //  C18 · ¿Cuántos animales? (el pueblo)  (Profesora Luna, the fountain and around town)  pez, siete, ocho
  // =====================================================================
  const LUNA_FOUNTAIN = [17, 12], FLOWER_AT = [12, 15];
  // Luna's clipboard: the animals counted so far (and how many)
  function clipboard(ctx, list) {
    if (!list || !list.length) return;
    const w = 10 + list.length * 14;
    G.win(ctx, 4, 30, w, 22, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
    list.forEach((k, i) => G.drawIcon16(ctx, k, 9 + i * 14, 33, 0.75));
    G.text(ctx, String(list.length), w - 2, 40, '#a05020', null);
  }
  // one more animal on the clipboard: name it, then say how many so far
  function* tally(c, kind, others, nums, o = {}) {
    yield* ask('luna', o.prompt || '¿Qué es?', o.en || 'Luna: what is it?', kind, others, o.point ? { point: o.point } : {});
    const L = c.data.list || (c.data.list = []); L.push(kind); S.autosave();
    G.audio.sfx('pop');
    yield* ask('luna', '¿Cuántos?', 'Luna writes it down. How many animals so far?', nums[0], nums.slice(1), { show: heap(L) });
  }
  const NUM = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  const SOUNDALIKE = { tres: 'seis', seis: 'tres' }; // (never in one question with the mic: CURRICULUM.md 6)
  const cnt = n => { const a = NUM[n - 1]; return [a, [NUM[n], NUM[n - 2], NUM[n - 3], NUM[n + 1]].filter(k => k && G.words.met(k) && k !== SOUNDALIKE[a]).slice(0, 2)]; }; // n: the answer and two met neighbours
  CH.script('c18', [
    { who: 'luna', bubble: { icon: 'pagina' }, run: function* () { // ¿Cuántos animales hay en Villa Sol?
      yield* sayShow('luna', { icon: 'pagina' }, T('¡{name}! ¿Cuántos animales hay en Villa Sol?', '{name}! How many animals are there in Villa Sol? Let\'s count them!'));
      yield* siNo('luna', '¿Me ayudas?', 'Will you help?', true);
      yield G.questCard('c18');
      yield* say('luna', T('¡A la [fuente]!', 'Let\'s start at the fountain!'));
    } },
    { spot: { map: 'villa', at: V('fuente'), icon: 'pagina' }, part: 'pez', run: function* (f, c) { // the fish; Canelo is number one
      const fish = G.animals.find('pez', f); if (fish) G.animals.jump(fish, f);
      yield 20;
      yield* G.intro.show('pez', { who: 'luna', prompt: '¡Splash! ¡Un [pez]!', en: 'Splash! A fish!', known: ['pato', 'rana'] });
      yield* say('luna', T('¡A contar! [uno]...', 'Let\'s count! Number one...'));
      yield* tally(c, 'perro', ['gato', 'conejo'], ['uno', 'dos', 'tres'], { point: dog(f) });
      if (fish) G.animals.jump(fish, f);
      yield* tally(c, 'pez', ['rana', 'pajaro'], ['dos', 'uno', 'tres'], { prompt: '¿Y este?', point: tile(...V('fuente')) });
      yield* say('luna', T('¡Más animales! ¡Escucha!', 'More animals! Find them and tap them. (Miau... by the park fence)'));
    } },
    { tap: 'cat', hint: f => { const p = catP(f); return p ? [Object.assign({ cat: true }, p, { y: p.y + 6 })] : []; }, run: function* (f, c) { yield* tally(c, 'gato', ['conejo', 'pez'], ['tres', 'dos', 'cuatro'], { point: catP(f) }); } },
    { tap: 'rana', hint: aniHint('rana'), run: function* (f, c) {
      yield* tally(c, 'rana', ['conejo', 'pez'], ['cuatro', 'cinco', 'tres'], { point: ranaP(f) });
      G.animals.cry('rana');
      yield* ask('luna', '¿Qué dice?', 'And what does she say?', 'croac', ['miau', 'guau'], { point: ranaP(f) });
    } },
    { tap: 'conejo', hint: aniHint('conejo'), run: function* (f, c) { yield* tally(c, 'conejo', ['rana', 'gato'], ['cinco', 'cuatro', 'seis'], { point: over(animal(f, 'conejo')) }); } },
    { spot: { map: 'villa', at: BIRD_TREE, icon: 'nota' }, run: function* (f, c) { // a bird in the tree
      c.data.bird = 1; G.animals.cry('pajaro');
      yield* tally(c, 'pajaro', ['pez', 'gato'], ['seis', 'cinco', 'cuatro'], { prompt: '¡Pío, pío! ¿Qué es?', point: tile(...BIRD_TREE) });
      yield* ask('luna', '¿Dónde está?', 'Where is the bird?', 'arbol', ['banco', 'fuente'], { point: tile(...BIRD_TREE) });
    } },
    { spot: { map: 'villa', at: FLOWER_AT, quiet: true }, hint: () => [{ x: FLOWER_AT[0] * TL + 12, y: FLOWER_AT[1] * TL + 12, spot: 'flor' }], run: function* (f, c) { // the butterfly on a pink flower: siete
      c.data.bird = 0;
      yield* ask('luna', '¿Qué es?', 'Something on the pink flower! What is it?', 'mariposa', ['pajaro', 'pez'], { point: tile(...FLOWER_AT) });
      yield* ask('luna', '¿Dónde está?', 'Where is it sitting?', 'flor', ['arbol', 'banco'], { point: tile(...FLOWER_AT) });
      yield* ask('luna', '¿De qué color es la [flor]?', 'What colour is the flower?', 'rosa', ['azul', 'blanco'], { show: flower(PINK) });
      const L = c.data.list || (c.data.list = []); L.push('mariposa'); S.autosave();
      yield* sayShow('luna', heap(L), T('[uno], [dos], [tres], [cuatro], [cinco], [seis]... ¡[siete]!', 'One, two, three, four, five, six... seven!'));
      yield* ask('luna', '¿Cuántos?', 'How many animals so far?', 'siete', ['seis', 'cinco'], { intro: true, how: 'show', look: { siete: 'text', seis: 'both', cinco: 'both' }, show: heap(L) });
      yield* ask('luna', '¿Cuántos?', 'Luna counts again on her fingers. How many?', 'siete', ['seis', 'cinco'], { show: many('estrella', 7) });
      yield* say('luna', T('¡Y las [gallina:gallinas] de Rosa!', 'And Grandma Rosa\'s hens!'));
    } },
    { spot: { map: 'villa', at: [2, 8], icon: 'gallina' }, part: 'gallina', run: function* (f, c) { // Rosa's hens: ocho
      G.animals.cry('gallina');
      yield* ask('luna', '¿Qué es?', 'What are they?', 'gallina', ['pato', 'cabra'], { point: over(hens(f).white) });
      const L = c.data.list || (c.data.list = []); L.push('gallina'); S.autosave();
      yield* sayShow('luna', heap(L), T('...[seis], [siete]... ¡[ocho]!', '...six, seven... eight!'));
      yield* ask('luna', '¿Cuántos?', 'How many animals now?', 'ocho', ['siete', 'seis'], { intro: true, how: 'show', look: { ocho: 'text', siete: 'both', seis: 'both' }, show: heap(L) });
      yield* say('luna', T('¡A la [escuela]!', 'Back to the school!'));
    } },
    { who: 'luna', bubble: true, run: function* (f, c) { // the clipboard
      const L = c.data.list || [];
      yield* ask('luna', '¿Cuántas [gallina:gallinas]?', 'How many hens does Rosa have?', 'dos', ['tres', 'uno'], { show: many('gallina', 2) });
      yield* ask('luna', '¿Cuántos [pez:peces]?', 'And how many fish in the fountain?', 'uno', ['dos', 'tres'], { show: many('pez', 1) });
      yield* ask('luna', '¿Y este?', 'And this one on the list?', 'rana', ['pato', 'pez'], { show: 'rana' });
      yield* ask('luna', '¿De qué color es?', 'What colour is the frog?', 'verde', ['azul', 'blanco'], { show: 'rana' });
      yield* ask('luna', '¿Cuántos animales?', 'How many animals in all?', 'ocho', ['siete', 'seis'], { show: heap(L) });
      yield* say('luna', T('¡Muy bien! Para ti...', 'Very good! For you... stickers!'));
      yield* ask('luna', '¿Cuántas?', 'How many stickers?', 'siete', ['seis', 'ocho'], { show: many('estrella', 7) });
      yield* ask('luna', '¡Y otra! ¿Cuántas?', 'And one more! How many now?', 'ocho', ['siete', 'seis'], { show: many('estrella', 8) });
      yield* sayShow('luna', 'granja', T('¡Mañana... la [granja]!', 'Tomorrow... the farm! Come in the morning.'));
      c.data.list = null;
    } },
  ], {
    stage(f, c) { if (f.mapId === 'villa' && c.step >= 1 && c.step <= 7) guest(f, 'luna', ...LUNA_FOUNTAIN, 'down'); else if (f.mapId === 'villa') unguest(f, 'luna'); },
    draw(f, ctx, c) { if (f.mapId === 'villa' && c.step === 6) bigFlower(ctx, f, ...FLOWER_AT, PINK, 3); },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'villa') return;
      if (c.step === 5 || c.data.bird) drawBird(ctx, f, ...BIRD_TREE, '#3068e0');
      if (c.step === 6) butterfly(ctx, FLOWER_AT[0] * TL + 12 - Math.round(f.cam.x) + Math.sin(G.frame / 11) * 3, FLOWER_AT[1] * TL + 2 - Math.round(f.cam.y));
      if (c.step >= 1 && c.step <= 7 && G.top() === f && !f.locked) clipboard(ctx, c.data.list);
    },
  });

  // =====================================================================
  //  C19 · ¡Todos a la granja!  (Profesora Luna, the farm; a morning)  nueve, diez
  // =====================================================================
  const LUNA_GATE = [40, 11], PEN = { perro: [39, 14], gato: [40, 14], conejo: [41, 14], gallina: [42, 14], gallina2: [43, 14], pato: [39, 16], caballo: [44, 15], cabra: [42, 16] };
  const followers = f => zoo(f).filter(a => a.follow);
  function* calls(f, c, a, kind) { // ¡ven!: it trots after you
    yield* ask(null, '¡...!', 'Call it! It will follow you to the farm.', 'ven', ['hola', 'si'], { point: over(a) });
    const k = followers(f).length + 1; if (a) { a.pin = null; a.go = null; a.follow = k; }
    (c.data.came || (c.data.came = [])).push(kind); S.autosave();
    if (a) G.animals.react(f, a); G.animals.cry(kind === 'gato' ? 'gato' : kind);
  }
  CH.script('c19', [
    { who: 'luna', bubble: 'granja', run: function* () { // a party at the farm: how many animals will come?
      yield* sayShow('luna', 'granja', T('¡Una fiesta en la [granja]! ¿Cuántos animales vienen?', 'A party at the farm! How many animals will come?'));
      yield G.questCard('c19');
      yield* say('luna', T('¡Llama a los animales! ¡[ven]!', 'Call the animals: "¡ven!" and they follow you to the farm! (the cat, the rabbit, the hens, the ducks)'));
    } },
    { tap: 'cat', hint: f => { const p = catP(f); return p ? [Object.assign({ cat: true }, p, { y: p.y + 6 })] : []; }, part: 'gato', run: function* (f, c) {
      yield* ask(null, '¿Quién es?', 'Who is this?', 'gato', ['conejo', 'perro'], { point: catP(f) });
      yield* ask(null, '¡...!', 'Call her! She will follow you to the farm.', 'ven', ['hola', 'si'], { point: catP(f) });
      if (f.amb && f.amb.cat) f.amb.cat.away = true; c.data.cat = 1; S.autosave(); if (G.ambient && G.ambient.sfx) G.ambient.sfx.meow();
      yield* ask(null, '¿Qué quiere el [gato]?', 'She meows at you. What does a cat like to drink?', 'leche', ['agua', 'pan']);
    } },
    { tap: 'conejo', hint: aniHint('conejo'), part: 'conejo', run: function* (f, c) {
      const a = animal(f, 'conejo');
      yield* ask(null, '¿Quién es?', 'Who is this?', 'conejo', ['gato', 'rana'], { point: over(a) });
      yield* calls(f, c, a, 'conejo');
    } },
    { spot: { map: 'villa', at: [2, 8], quiet: true }, hint: () => [{ x: 2 * TL + 12, y: 8 * TL + 12, spot: 'hens' }], part: 'gallina', run: function* (f, c) {
      const h = hens(f); G.animals.cry('gallina');
      yield* ask(null, '¿Quién es?', 'Who lives here?', 'gallina', ['pato', 'cabra'], { point: over(h.white) });
      yield* ask(null, '¡...!', 'Call them! They will follow you to the farm.', 'ven', ['hola', 'si'], { point: over(h.white) });
      for (const a of [h.white, h.brown]) if (a) { a.pin = null; a.follow = followers(f).length + 1; G.animals.react(f, a); }
      (c.data.came || (c.data.came = [])).push('gallina', 'gallina'); S.autosave();
    } },
    { tap: 'pato', hint: aniHint('pato'), part: 'pato', run: function* (f, c) {
      const a = animal(f, 'pato');
      yield* ask(null, '¿Quién es?', 'Who is this?', 'pato', ['gallina', 'perro'], { point: over(a) });
      yield* calls(f, c, a, 'pato');
      c.data.came.push('pato', 'pato'); S.autosave(); // (the ducklings follow their mother)
      const fish = G.animals.find('pez', f);
      yield* ask(null, '¿Y quién no puede venir?', 'Who can\'t come? (she lives in the water of the fountain)', 'pez', ['pato', 'rana'], { show: { icon: 'fuente' } });
      void fish;
      yield* tell(T('¡A la [granja]!', 'To the farm! Everyone follows you.'));
    } },
    { spot: { map: 'villa', at: [41, 12], icon: 'estrella' }, part: 'granja', run: function* (f, c) { // into the paddock, counted; nueve, diez
      yield* ask('luna', 'Luna: ¡...!', 'Profesora Luna waits at the gate. The sun is up: say it!', 'buenosdias', ['buenasnoches', 'adios'], { show: { icon: 'sol' } });
      yield* say('luna', T('¡Los animales! ¡A contar!', 'The animals! Let\'s count them in!'));
      const L = c.data.list = [];
      const count = function* (en) { const [a, o] = cnt(L.length); yield* ask('luna', '¿Cuántos?', en, a, o, { show: heap(L) }); };
      const inPen = (a, p) => { if (a) { a.follow = 0; a.go = [...at(...p), 1.2]; } };
      const d = dog(f); yield* K.walk(f, d, ...PEN.perro, 4); // Canelo first
      yield* ask('luna', '¿Quién es?', 'Who goes in first?', 'perro', ['gato', 'conejo'], { point: d }); L.push('perro');
      yield* count('How many animals in the paddock?');
      c.data.cat = 2; L.push('gato'); G.audio.sfx('pop');
      yield* count('The cat hops in! How many now?');
      inPen(animal(f, 'conejo'), PEN.conejo); L.push('conejo'); yield 20;
      yield* count('The rabbit hops in! How many now?');
      const h = hens(f); inPen(h.white, PEN.gallina); L.push('gallina'); yield 20;
      yield* count('A hen! How many now?');
      inPen(h.brown, PEN.gallina2); L.push('gallina'); yield 20;
      yield* count('The other hen! How many now?');
      inPen(animal(f, 'pato'), PEN.pato); yield 30;
      for (let k = 0; k < 3; k++) { L.push('pato'); yield* count(k ? 'And a duckling! How many now?' : 'The duck waddles in! How many now?'); }
      // the horse: nueve
      const horse = animal(f, 'caballo'), goat = animal(f, 'cabra');
      if (horse) inPen(horse, PEN.caballo); G.animals.cry('caballo');
      yield* ask('luna', '¿Quién es?', 'Someone big trots up!', 'caballo', ['cabra', 'pato'], { point: over(horse) }); L.push('caballo');
      yield* sayShow('luna', heap(L), T('...[siete], [ocho]... ¡[nueve]!', '...seven, eight... nine!'));
      yield* ask('luna', '¿Cuántos?', 'How many animals now?', 'nueve', ['ocho', 'siete'], { intro: true, how: 'show', look: { nueve: 'text', ocho: 'both', siete: 'both' }, show: heap(L) });
      if (goat) inPen(goat, PEN.cabra); G.animals.cry('cabra');
      yield* ask('luna', '¿Y quién es?', 'And one more!', 'cabra', ['caballo', 'perro'], { point: over(goat) }); L.push('cabra');
      yield* sayShow('luna', heap(L), T('...[ocho], [nueve]... ¡[diez]!', '...eight, nine... TEN!'));
      yield* ask('luna', '¿Cuántos?', 'How many animals now?', 'diez', ['nueve', 'ocho'], { intro: true, how: 'show', look: { diez: 'text', nueve: 'both', ocho: 'both' }, show: heap(L) });
      K.confetti(); G.audio.jingle('promote');
      for (const a of zoo(f)) a.follow = 0;
    } },
    { auto: 'villa', run: function* (f, c) { // a duckling wanders off: ¡busca!
      const L = c.data.list, baby = zoo(f).find(a => a.kind === 'pato' && a.baby);
      if (baby) { baby.mom = baby.mom || null; baby.pin = null; baby.go = [...at(45, 21), 1]; }
      yield* say('luna', T('¡Ay! ¡Un patito!', 'Oh! A duckling wandered off!'));
      yield* ask('luna', '¿Cuántos?', 'How many animals now?', 'nueve', ['diez', 'ocho'], { show: heap(L.slice(0, 9)) });
      yield* ask('luna', '¿Cómo está el patito?', 'It peeps all alone in the wheat. How is it?', 'triste', ['feliz', 'cansado']);
      yield* ask(null, 'Canelo... ¡...!', 'Tell Canelo to find it!', 'busca', ['gira', 'ven'], Object.assign({ point: dog(f), wrong: dogWrong(f) }, fromSign('busca')));
      yield* busca(f, 44, 20); if (baby) { baby.go = [...at(...PEN.pato), 1.6]; } yield 30;
      yield* ask('luna', '¡Bravo! ¿Y ahora?', 'Canelo brings it back! And now?', 'diez', ['nueve', 'ocho'], { show: heap(L) });
      yield* ask('luna', '¿Cuántos [pato:patos]?', 'How many ducks?', 'tres', ['dos', 'cuatro'], { show: many('pato', 3) });
      yield* ask('luna', '¿Cuántos [caballo:caballos]?', 'And how many horses?', 'uno', ['dos', 'tres'], { show: many('caballo', 1) });
      yield* ask(null, 'Canelo... ¡...!', 'Canelo is so happy! The spin sign: tell him!', 'gira', ['salta', 'busca'], Object.assign({ point: dog(f), wrong: dogWrong(f) }, fromSign('gira')));
      yield* G.pet.play('spin');
      yield* ask('luna', '¿Qué come el [caballo]?', 'What does the horse eat?', 'manzana', ['pan', 'agua']);
      yield* ask('luna', '¿Y los [pato:patos]?', 'And the ducks?', 'pan', ['manzana', 'queso']);
      yield* ask('luna', '¿Cómo está Canelo?', 'Everyone is worn out. How is Canelo?', 'cansado', ['feliz', 'triste'], { point: dog(f) });
      yield* sayShow('luna', { icon: 'carta' }, T('¡Mañana... la fiesta!', 'Tomorrow... the party! Here is the party card.'));
    } },
  ], {
    stage(f, c) {
      if (f.mapId !== 'villa') return;
      if (c.step >= 5 && c.step <= 6) guest(f, 'luna', ...LUNA_GATE, 'down'); else unguest(f, 'luna');
      if (c.data.cat && f.amb && f.amb.cat) f.amb.cat.away = true;
      if (c.step >= 1 && c.step <= 5) { // (back on the map: whoever came, follows again)
        const came = c.data.came || [], h = hens(f); let k = 1;
        if (came.includes('conejo')) { const a = animal(f, 'conejo'); if (a && !a.follow) a.follow = k++; }
        if (came.includes('gallina')) for (const a of [h.white, h.brown]) if (a && !a.follow) a.follow = k++;
        if (came.includes('pato')) { const a = animal(f, 'pato'); if (a && !a.follow) a.follow = k++; }
      }
    },
    drawTop(f, ctx, c) { // the cat trotting after you, then in the paddock
      if (f.mapId !== 'villa' || !c.data.cat || c.step > 6) return;
      const tr = f.zoo && f.zoo.trail, pt = c.data.cat === 2 ? at(...PEN.gato) : tr && tr[Math.max(0, tr.length - 1 - 8)];
      if (pt) G.drawIcon16(ctx, 'gato', Math.round(pt[0] - 8 - f.cam.x), Math.round(pt[1] - 16 - f.cam.y));
    },
  });

  // =====================================================================
  //  C20 · Preparamos la fiesta  (Profesora Luna; everyone)  no new words: invitations, food, ribbons, the rehearsal
  // =====================================================================
  function* invite(c, who) { // an invitation card for them
    bag().take('carta', { q: 'c20' });
    yield* siNo(who, '¿Una [carta]? ¿Para mí?', 'An invitation! For me?', true, { show: { icon: 'sobre' } });
    (c.data.inv || (c.data.inv = {}))[who] = 1; S.autosave();
    if (G.ambient) { const n = G.field.npc(who); if (n) G.ambient.happy(n); }
    yield* say(who, T('¡Una fiesta! ¡[gracias]!', 'A party! Thank you!'));
  }
  const invBeat = (who, run) => ({ who, bubble: () => 'carta', part: who === 'pepe' ? 'manzana' : who === 'sofia' ? 'cinta' : 'carta', run: function* (f, c) { yield* invite(c, who); yield* run(f, c); } });
  CH.script('c20', [
    { who: 'luna', bubble: { icon: 'carta' }, run: function* (f, c) { // the invitations, and where everyone lives
      yield* say('luna', T('¡La fiesta de los animales! ¡Mañana!', 'The animal party is tomorrow! Let\'s get everything ready.'));
      yield* ask('luna', '¿Qué es?', 'Luna has written invitations. What are they?', 'carta', ['flor', 'galleta'], { show: many('carta', 5) });
      yield* ask('luna', '¿Cuántas?', 'How many invitations?', 'cinco', ['seis', 'cuatro'], { show: many('carta', 5) });
      for (let i = 0; i < 5; i++) bag().add('carta', { q: 'c20' });
      yield G.questCard('c20');
      yield* ask('luna', '¿Dónde está Marta?', 'One for Marta. Where is Marta?', 'panaderia', ['biblioteca', 'escuela']);
      yield* ask('luna', '¿Y Inés?', 'And Inés?', 'biblioteca', ['casa', 'panaderia']);
      yield* ask('luna', '¿Y Rosa?', 'And Grandma Rosa?', 'casa', ['escuela', 'parque']);
      yield* ask('luna', '¿Y Sofía?', 'And Sofía?', 'parque', ['granja', 'casa']);
      yield* ask('luna', '¿Y la fiesta? ¿Dónde?', 'And where is the party?', 'granja', ['parque', 'escuela']);
      yield* say('luna', T('¡Las [carta:cartas]! ¡[adios]!', 'Off you go with the invitations! (Marta, Inés, Rosa, Don Pepe and Sofía)'));
    } },
    invBeat('marta', function* () {
      yield* ask('marta', '¿Para la fiesta? ¿Qué es?', 'For the party she will bake this. What is it?', 'pan', ['galleta', 'queso'], { show: 'pan' });
      yield* ask('marta', '¿Y esto?', 'And these?', 'galleta', ['pan', 'leche'], { show: 'galleta' });
      yield* ask('marta', '¿Cuántas [galleta:galletas]?', 'How many cookies?', 'nueve', ['ocho', 'diez'], { show: many('galleta', 9) });
    }),
    invBeat('ines', function* (f) {
      yield* ask(null, '¿Cómo está Inés?', 'How is Inés now?', 'feliz', ['triste', 'cansado'], { point: f.npc('ines') || undefined });
    }),
    invBeat('rosa', function* () {
      yield* ask('rosa', '¿Y para la fiesta?', 'And for the party she brings...', 'huevo', ['pan', 'leche'], { show: 'huevo' });
      yield* ask('rosa', '¿Cuántos?', 'How many eggs?', 'seis', ['cinco', 'siete'], { show: many('huevo', 6) });
    }),
    invBeat('pepe', function* () {
      yield* ask('pepe', '¡Fruta para la fiesta! ¿Qué es?', 'Fruit for the party! What is it?', 'manzana', ['platano', 'naranja'], { show: 'manzana' });
      yield* ask('pepe', '¿Cuántas?', 'How many apples?', 'ocho', ['siete', 'nueve'], { show: many('manzana', 8) });
      yield* ask('pepe', '¿Y esto?', 'And these?', 'platano', ['naranja', 'queso'], { show: 'platano' });
      yield* ask('pepe', '¿Cuántos?', 'How many bananas?', 'siete', ['seis', 'ocho'], { show: many('platano', 7) });
      yield* ask('pepe', '¿Y esto?', 'And this, for the goat?', 'queso', ['pan', 'leche'], { show: 'queso' });
    }),
    invBeat('sofia', function* (f) { // the ribbons; Canelo's rehearsal
      for (const [col, others] of [['rojo', ['azul', 'verde']], ['amarillo', ['azul', 'verde']], ['verde', ['blanco', 'azul']], ['rosa', ['azul', 'verde']]]) {
        yield* ask('sofia', '¿De qué color?', 'Ribbons for the barn! What colour is this one?', col, others, { show: cinta(COL(col)) });
      }
      yield* ask('sofia', '¿Cuántas cintas?', 'How many ribbons?', 'cuatro', ['cinco', 'tres'], { show: heap([cinta(RED), cinta(YELLOW), cinta(GREEN), cinta(PINK)]) });
      yield* say('sofia', T('¡Y Canelo! ¡Un ensayo!', 'And Canelo! A rehearsal for the show!'));
      const n = dog(f); G.pet.place(f, n); yield 10;
      for (const [t, others] of [['pata', ['gira', 'ven']], ['gira', ['salta', 'pata']], ['salta', ['busca', 'sientate']]]) {
        yield* ask('sofia', 'Sofía: ¡...!', 'Sofía holds up a picture sign. Tell Canelo!', t, others, Object.assign({ point: n, wrong: dogWrong(f) }, fromSign(t)));
        yield* G.pet.trick(t);
      }
    }),
    { who: 'nico', bubble: { icon: 'nota' }, part: 'nota', run: function* (f) { // the animals' song, rehearsed
      yield* say('nico', T('¡La canción de los animales! ¡Escucha!', 'The animals\' song for the party! Listen: who sings this part?'));
      for (const [k, others] of [['pato', ['rana', 'perro']], ['rana', ['pato', 'conejo']], ['caballo', ['cabra', 'pato']], ['cabra', ['caballo', 'gallina']]]) {
        G.animals.cry(k); yield 30;
        yield* ask('nico', '¿Quién es?', 'Who sings this part?', k, others, { pic: true });
      }
      yield* ask('nico', '¿Y la [rana]? ¿Qué dice?', 'And the frog\'s part?', 'croac', ['miau', 'guau']);
      yield* ask('nico', '¿Y el [pato]?', 'And the duck\'s part?', 'cuac', ['miau', 'guau']);
    } },
    { who: 'lucia', bubble: () => flower(PINK), part: 'flor', run: function* () { // flowers for the tables
      yield* ask('lucia', '¿Para la fiesta? ¿Qué es?', 'For the party tables! What is it?', 'flor', ['arbol', 'banco'], { show: flower(PINK) });
      yield* ask('lucia', '¿De qué color?', 'What colour is this one?', 'rosa', ['amarillo', 'azul'], { show: flower(PINK) });
      yield* ask('lucia', '¿Y esta?', 'And this one?', 'amarillo', ['blanco', 'verde'], { show: flower(YELLOW) });
      yield* ask('lucia', '¡Mira! ¿Qué es?', 'Something follows the flowers! What is it?', 'mariposa', ['pajaro', 'pez']);
    } },
    { who: 'luna', bubble: true, run: function* () {
      yield* say('luna', T('¡Todo listo! ¡Muy bien, {name}!', 'Everything is ready! Very good, {name}!'));
      yield* sayShow('luna', 'granja', T('¡Mañana, la fiesta en la [granja]!', 'Tomorrow: the party at the farm!'));
    } },
  ]);

  // =====================================================================
  //  C21 · La fiesta de los animales  (Profesora Luna; everyone, at the farm)  no new words: the show, the song, the photo
  // =====================================================================
  const PARTY = { luna_p: [41, 6, 'down'], mama_p: [38, 7, 'right'], marta_p: [44, 7, 'left'], ines_p: [37, 8, 'right'], rosa: [45, 8, 'left'], pepe: [38, 9, 'right'],
    sofia: [44, 9, 'left'], nico: [39, 10, 'up'], lucia: [43, 10, 'up'], gomez: [37, 10, 'right'], tomas: [45, 10, 'left'] };
  CH.script('c21', [
    { who: 'luna', bubble: { icon: 'estrella' }, run: function* () {
      yield* sayShow('luna', { icon: 'estrella' }, T('¡Hoy es la fiesta! ¡A la [granja]!', 'Today is the party! Everyone is at the farm, by the barn!'));
      yield G.questCard('c21');
    } },
    { spot: { map: 'villa', at: [41, 7], icon: 'estrella' }, part: 'estrella', run: function* (f, c) {
      const back = yield* scene(f, PARTY, [41, 8, 'up'], [42, 8, 'up']);
      const who = Object.keys(PARTY), n = dog(f);
      yield* say('luna', T('¡Bienvenidos a la fiesta de los animales!', 'Welcome to the animal party!'));
      clap(f, who);
      yield* ask('luna', '¿De dónde es el [pan]?', 'Marta brought bread. Where is it from?', 'panaderia', ['biblioteca', 'escuela'], { show: 'pan' });
      yield* ask('luna', '¿Y de dónde viene Inés?', 'And where does Inés come from?', 'biblioteca', ['casa', 'escuela'], { point: f.npc('ines_p') || undefined });
      // Sofía calls the ribbons by their colour: tap that one
      for (const [col, others] of [['rojo', ['azul', 'verde']], ['amarillo', ['rosa', 'blanco']]]) {
        const pics = {}; [col].concat(others).forEach(k => { pics[k] = cinta(COL(k)); });
        yield* ask('sofia', '¡[' + col + ']!', 'Sofía calls a ribbon colour: tap that ribbon!', col, others, { pic: true, mask: [col], img: pics });
      }
      // feeding the animals
      yield* say('luna', T('¡La comida para los animales!', 'Food for the animals! What does each one eat?'));
      for (const [k, food, others] of [['caballo', 'manzana', ['pan', 'leche']], ['pato', 'pan', ['queso', 'agua']], ['cabra', 'platano', ['naranja', 'pan']]]) {
        G.animals.cry(k);
        yield* ask('luna', '¿Y para el [' + k + ']?', 'And for this one?', food, others, { show: k });
      }
      G.pet.anim(n, 'jump');
      yield* ask('luna', '¡Canelo! ¿Qué tiene?', 'Canelo sneaked something off the table! What has he got?', 'queso', ['pan', 'leche'], { point: n });
      // Canelo's show, from Luna's picture signs
      yield* say('luna', T('¡El show de Canelo!', 'Canelo\'s show!'));
      for (const [t, others] of [['sientate', ['salta', 'gira']], ['pata', ['ven', 'busca']], ['salta', ['gira', 'sientate']], ['gira', ['pata', 'salta']]]) {
        yield* ask('luna', 'Luna: ¡...!', 'Luna holds up a picture sign. Say it to Canelo!', t, others, Object.assign({ point: n, wrong: dogWrong(f) }, fromSign(t)));
        yield* G.pet.trick(t); clap(f, who);
      }
      yield* say('luna', T('¿Y el pastel? ...¡Canelo!', 'And the cake? It\'s hidden! Canelo can find it...'));
      yield* ask(null, 'Canelo... ¡...!', 'Tell Canelo to find the cake!', 'busca', ['ven', 'pata'], Object.assign({ point: n, wrong: dogWrong(f) }, fromSign('busca')));
      yield* busca(f, 46, 6); c.data.cake = 1;
      yield* ask('luna', '¿Dónde está?', 'Where was the cake?', 'arbol', ['banco', 'fuente'], { point: tile(46, 5) });
      yield* ask(null, 'Canelo... ¡...!', 'Canelo is far away with the cake! Call him!', 'ven', ['sientate', 'gira'], { point: n });
      yield* come(f); c.data.cake = 2;
      yield* ask('luna', '¿Y para el campeón?', 'A treat for the champion!', 'galleta', ['hueso', 'pan'], { point: n });
      yield* G.pet.play('eat', { item: 'galleta' });
      // the animals' song: who sings?
      yield* say('nico', T('¡La canción de los animales!', 'The animals\' song!'));
      for (const [k, others] of [['perro', ['gato', 'rana']], ['gato', ['conejo', 'perro']], ['gallina', ['pato', 'cabra']], ['pajaro', ['mariposa', 'pez']]]) {
        if (k === 'perro') bark(f); else if (k === 'gato' && G.ambient && G.ambient.sfx) G.ambient.sfx.meow(); else G.animals.cry(k);
        yield 26;
        yield* ask('nico', '¿Quién canta?', 'Who is singing now?', k, others, { pic: true });
      }
      yield* ask('nico', '¡Ahora tú! ¿Qué dice el [perro]?', 'Now you sing! What does the dog say?', 'guau', ['miau', 'croac']);
      yield* ask('nico', '¿Y la [rana]?', 'And the frog?', 'croac', ['miau', 'guau']);
      const fish = G.animals.find('pez', f); void fish;
      yield* ask('luna', '¿Y este? ¡Splash!', 'The fish jumps in the trough to see! What is it?', 'pez', ['pato', 'rana'], { show: 'pez' });
      yield* ask('luna', '¿Y esta?', 'Who lands on the camera?', 'mariposa', ['pajaro', 'pez'], { show: 'mariposa' });
      yield* ask('luna', '¿Y este, el último?', 'And the last one hops in late!', 'conejo', ['rana', 'pato'], { show: 'conejo' });
      G.fx.confetti(40, 200, 1, 24); G.fx.confetti(G.W - 40, 200, -1, 24); G.audio.jingle('promote'); clap(f, who);
      yield* ask('luna', '¿Cuántos animales?', 'How many animals at the party?', 'diez', ['nueve', 'ocho'], { show: heap(['perro', 'gato', 'conejo', 'gallina', 'gallina', 'pato', 'pato', 'pato', 'caballo', 'cabra']) });
      yield* ask('luna', '¿Cómo estás, {name}?', 'How are you?', 'feliz', ['triste', 'cansado'], { show: { icon: 'estrella' } });
      yield* ask('luna', '¿Y Canelo?', 'And Canelo?', 'feliz', ['cansado', 'triste'], { point: n });
      yield* say('luna', T('¡Una foto! ¡Todos juntos!', 'A photo! Everyone together!'));
      G.audio.sfx('pop'); G.fade.a = 0.9; G.fadeTo(0, 0.05, '#ffffff');
      yield G.errands.photoCard(['luna', 'mama', 'rosa', 'pepe', 'sofia', 'nico', 'lucia', 'marta']);
      // the sun goes down on the party
      yield* say('luna', T('La luna... ¡[buenasnoches], animales!', 'The moon comes up... good night, animals!'));
      yield* ask(null, 'Tú: ¡...!', 'Say good night to the animals!', 'buenasnoches', ['buenosdias', 'adios'], { show: { icon: 'noche' } });
      G.pet.anim(n, 'huh');
      yield* ask(null, '¿Cómo está Canelo?', 'Canelo yawns a big yawn. How is he?', 'cansado', ['feliz', 'triste'], { point: n });
      yield* ask(null, 'Canelo, ¡a la...!', 'Where does he go now?', 'cama', ['agua', 'ven']);
      yield* unscene(f, back); c.data.cake = 0;
    } },
  ], {
    after: function* () { G.audio.play('victory'); yield G.story.diploma(); G.audio.play('town', true); },
    drawTop(f, ctx, c) { if (f.mapId === 'villa' && c.data.cake === 1) G.drawIcon16(ctx, 'estrella', 46 * TL + 4 - Math.round(f.cam.x), 6 * TL - 4 - Math.round(f.cam.y)); },
  });
})();
