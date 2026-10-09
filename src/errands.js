// ===== Round B: the eight story errands, the bag, gifts, the shops and the side jobs (docs/ROUND_B_PLAN.md section 7) =====
// Each errand is a little story that mixes walking, finding, tapping and SPEAKING (every question is a G.ask with {word}
// picture cards, so the kids' mic comes with it). Who asks:
//   canelo  ¿Dónde está Canelo?        Mamá: Canelo runs off; Gómez, Lucía and Tomás give clues (a paw print by the park
//                                      bench, his ball at the fountain, barking in the barn); say "¡ven!" at the barn door
//   picnic  El día de campo            Rosa: pan (Marta), queso (Pepe), huevo (the hay by the hens), leche (the goat's pail),
//                                      agua (the fountain); then a picnic on a blanket in the park
//   show    El show de perros          Sofía: Canelo needs siéntate, dame la pata and salta; Nico brings his cat; Luna judges
//   cansado Tomás está cansado         Tomás: three letters (Rosa, the barn, Inés); the horse eats one: an apple gets it back
//   cuenta  ¿Cuántos animales?         Luna: tap every animal to count it (ducks 3, hens 2, horse, goat, rabbit, frog, fish);
//                                      then say how many of each, and the total: ¡diez!
//   sonidos ¿Qué dicen?                Nico tags along and plays a sound; find the animal and say its sound (cuac, croac,
//                                      bee, miau); last, Nico barks and Canelo answers
//   flores  Las flores de Lucía        Lucía is sad: a pink, a white and a yellow flower for her mom (coloured flowers grow
//                                      around town; a butterfly sits on the last one)
//   fiestab La fiesta de los animales  Luna (after the 3 Round A errands and 6 of these 7): invite 5 friends, hang 4 ribbons
//                                      on the barn, feed the ducks, the horse and the hens, then the show and a group photo
// How they unlock (UNLOCK below): canelo after the first Round A errand (Canelo must be yours); picnic / show / cansado
// after canelo and the Round A errand of the same person; cuenta after 3 of them; sonidos and flores after 4; the party
// after all of Round A and 6 of the 7. So there are usually 2-3 to choose from.
//
// The bag (G.state.bag.items): what you carry, drawn top-left on the map. Errand things carry `q` (their errand) and
// can't be given away; the rest (bought from Marta and Don Pepe, a flower, an egg, water from the fountain) can be given
// to someone who likes it (G.hearts.LIKES; Lucía only likes pink flowers): they notice it when you talk ("¿Para mí?").
// Side jobs (once a day each, a star and sometimes a heart; G.state.jobs[id] = 'YYYY-M-D'): feed the ducks (bread from
// Marta, tap the pond), the hens' egg (the hay bale by them, after the picnic; give it to Rosa), Canelo's water (his bowl at
// home is empty each day: fill a bottle at the fountain), pet the horse (tap him from close by), the sleepy cat (tap her
// while she naps and say "gato").
//
// Hooks (other files call these): talk(who, f) / alert(who) for every townsperson (maps.js), spotAt / runSpot (field.js:
// the places an errand sends you, which win over tap-anything), update / drawUnder / drawTop / drawHud (field.js),
// targets(f) / waitsIn(map) (hint.js: where the hand points), catTap(f) (ambient.js), lost() (Canelo's map entries),
// bowlEmpty() (pet.js), tomasTired() / nicoFollows() (maps.js), and G.animals.tapped / G.world.nameTile are wrapped here.
// API for tests: G.errands.bag {list, has, add, take}, .jobDone(id), .unlocked(id), .offer(id), .fl(id) (an errand's own
// saved flags, in G.state.flags['e_' + id]), .SPOTS, .FLOWERS, .COUNT.
'use strict';
(function () {
  const E = G.errands = {}, T = G.TILE;
  const F = () => G.state.flags, S = G.st, D = () => G.data;
  const TT = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const today = () => G.world.today();
  const words = (...ids) => ids.map(id => ({ word: id }));
  const ORDER = ['canelo', 'picnic', 'show', 'cansado', 'cuenta', 'sonidos', 'flores', 'fiestab'];
  E.B = ORDER.slice(0, 7);
  const A3 = ['mercado', 'pelota', 'carta'];
  const fl = id => { const k = 'e_' + id, f = F(); if (!f[k] || typeof f[k] !== 'object') f[k] = {}; return f[k]; };
  E.fl = fl;

  // ---------- talking ----------
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }
  function* tell(...pages) { yield G.say(pages); }
  // a picture-card question: the right word and a few others, shuffled; learned when answered (o.learn: other ids, or null)
  function* q(who, prompt, en, answer, pool, o = {}) {
    const c = G.wordChoices(answer, pool, Math.min(o.n || 3, pool.length));
    return yield* G.ask(Object.assign({ prompt, en, choices: c.choices, answer: c.answer, layout: 'cards', who, learn: o.learn === undefined ? answer : o.learn }, o.show ? { show: o.show } : {}));
  }
  function* newQuest(id) { S.startQuest(id); yield G.questCard(id); }
  function* finishQuest(id) {
    S.finishQuest(id); yield G.badge(id);
    const giver = D().quests[id].giver;
    if (G.hearts && G.hearts.add(giver, 2, 'errand')) { yield 40; yield* G.hearts.milestones(giver); }
  }
  // a scene started from the map (an animal tapped, the cat): the map is locked while it runs
  function scene(f, gen) {
    f.route = null; f.locked = true;
    f.tasks.add((function* () { try { yield* gen; } finally { f.locked = false; } })());
  }
  const fade = function* (a) { yield G.fadeTo(a, 0.1); };
  const scr = (f, wx, wy) => [wx - Math.round(f.cam.x), wy - Math.round(f.cam.y)];
  const tileScr = (f, x, y) => scr(f, x * T + 12, y * T + 8);

  // ---------- which errands are open ----------
  const aDone = () => A3.filter(S.done).length, bDone = () => E.B.filter(S.done).length;
  const UNLOCK = {
    canelo: () => S.done('saludos') && !!G.pet && G.pet.mine() && aDone() >= 1,
    picnic: () => S.done('canelo') && S.done('mercado'),
    show: () => S.done('canelo') && S.done('pelota'),
    cansado: () => S.done('canelo') && S.done('carta'),
    cuenta: () => bDone() >= 3,
    sonidos: () => bDone() >= 4,
    flores: () => bDone() >= 4,
    fiestab: () => S.done('saludos') && aDone() === 3 && bDone() >= 6,
  };
  E.unlocked = id => !!(G.state && UNLOCK[id] && UNLOCK[id]());
  E.offer = id => !!G.state && !S.quest(id) && E.unlocked(id);
  E.bDone = bDone;

  // ---------- the bag ----------
  const bagS = () => { const s = G.state; if (!s.bag || typeof s.bag !== 'object' || !Array.isArray(s.bag.items)) s.bag = { items: [] }; return s.bag.items; };
  const match = (it, id, o) => it.id === id && (o.col === undefined || it.col === o.col) && (o.q === undefined || (it.q || null) === o.q) && (o.to === undefined || it.to === o.to);
  let popIn = null; // the last thing put in the bag, bouncing in {it, t}
  const B = E.bag = {
    MAX: 8,
    list: () => bagS(),
    has: (id, o = {}) => bagS().some(it => match(it, id, o)),
    add(id, o = {}) { const it = Object.assign({ id }, o); bagS().push(it); popIn = { it, t: 0 }; G.audio.sfx('item'); if (G.vocabLog) G.vlog('shown', id, { via: 'bag' }); S.see(id); S.autosave(); return it; },
    take(id, o = {}) { const L = bagS(), k = L.findIndex(it => match(it, id, o)); if (k < 0) return null; const it = L.splice(k, 1)[0]; S.autosave(); return it; },
    icon: it => (it.col ? { icon: W(it.id).icon, col: it.gold ? '#f8c820' : W(it.col).col } : W(it.id) || it.id),
    full: () => bagS().length >= 8,
  };
  const free = id => B.has(id, { q: null }); // something of yours (not an errand's)

  // ---------- side jobs and their stars ----------
  const jobs = () => { const s = G.state; if (!s.jobs || typeof s.jobs !== 'object' || Array.isArray(s.jobs)) s.jobs = {}; return s.jobs; };
  E.JOBS = ['patos', 'huevo', 'agua', 'caballo', 'gato'];
  E.JOB_ICON = { patos: 'pato', huevo: 'huevo', agua: 'agua', caballo: 'caballo', gato: 'gato' };
  E.jobDone = id => !!G.state && jobs()[id] === today();
  function jobStar(f, id, sx, sy) {
    if (E.jobDone(id)) return false;
    jobs()[id] = today(); G.state.stars++;
    G.fx.flyStar(sx, sy); G.audio.sfx('star'); G.fx.say('¡Muy bien!', sx, sy - 16, '#f8e060', true);
    S.autosave(); return true;
  }
  E.bowlEmpty = () => !!G.state && !!G.pet && G.pet.mine() && S.done('saludos') && aDone() >= 1 && !E.jobDone('agua');

  // ---------- Canelo lost (errand 1) ----------
  const cl = () => fl('canelo');
  E.lost = () => !!G.state && S.active('canelo') && !cl().found;
  // the neighbour who has the next clue
  const clueWho = () => { const c = cl(); return !c.clue ? 'gomez' : c.clue === 1 && c.paw ? 'lucia' : c.clue === 2 && c.ball ? 'tomas' : null; };

  // ---------- Tomás tired, Nico tagging along ----------
  const ca = () => fl('cansado');
  const lettersDone = () => { const c = ca(); return !!(c.rosa && c.granja === 2 && c.ines); };
  E.tomasTired = () => !!G.state && (E.offer('cansado') || S.active('cansado'));
  const so = () => fl('sonidos');
  E.nicoFollows = () => !!G.state && S.active('sonidos') && (so().i | 0) < 5;

  // ---------- Lucía's flowers ----------
  E.FLOWERS = [ // coloured flowers around town (on flower or grass tiles): [x, y, colour]
    [8, 12, 'rosa'], [3, 11, 'rojo'], [31, 9, 'blanco'], [23, 15, 'azul'], [39, 7, 'amarillo'], [26, 8, 'rosa'],
    [12, 15, 'rojo'], [32, 22, 'amarillo'], [7, 24, 'blanco'],
  ];
  const WISH = ['rosa', 'blanco', 'amarillo'], COLS = ['rosa', 'blanco', 'amarillo', 'rojo', 'azul', 'verde'];
  const GOLD = [45, 22]; // Lucía's 3-heart secret: a golden flower in the wheat
  const flowerPic = (col, gold) => ({ icon: 'flor', col: gold ? '#f8c820' : W(col).col });
  const fo = () => fl('flores');
  const picked = (x, y) => { const p = F().e_picked; return !!(p && p[x + ',' + y] === today()); };
  const pickNow = (x, y) => { if (!F().e_picked || typeof F().e_picked !== 'object') F().e_picked = {}; F().e_picked[x + ',' + y] = today(); };
  const flowersOut = () => !!S.quest('flores');
  const wishLeft = () => WISH.filter(c => !fo().got || !fo().got[c]);

  // ---------- the animal count (errand 5) ----------
  E.COUNT = [['pato', 3], ['gallina', 2], ['caballo', 1], ['cabra', 1], ['conejo', 1], ['rana', 1], ['pez', 1]];
  const cu = () => { const c = fl('cuenta'); if (!c.n || typeof c.n !== 'object') c.n = {}; return c; };
  const counted = k => cu().n[k] | 0;
  const countDone = () => E.COUNT.every(([k, n]) => counted(k) >= n);
  const NUM = D().numberWords10;

  // ---------- the sound game (errand 6) ----------
  const ROUNDS = [['pato', 'cuac', '¡Cuac, cuac!'], ['rana', 'croac', '¡Croac, croac!'], ['cabra', 'bee', '¡Beee!'], ['gato', 'miau', '¡Miau!']];
  function playSound(f, i) {
    const r = ROUNDS[i]; if (!r) return;
    if (r[0] === 'gato') { if (G.ambient && G.ambient.sfx) G.ambient.sfx.meow(); } else G.animals.cry(r[0]);
    const n = f && f.npc('nico');
    if (n && f.amb) f.amb.fx.push({ kind: 'say', s: r[2], o: n, dx: 0, t: 0, life: 120 });
  }

  // ---------- the party (errand 8) ----------
  const fb = () => { const c = fl('fiestab'); if (!c.inv || typeof c.inv !== 'object') c.inv = {}; if (!c.fed || typeof c.fed !== 'object') c.fed = {}; return c; };
  const INVITE = ['rosa', 'pepe', 'sofia', 'nico', 'lucia', 'gomez', 'tomas'];
  const RIBBONS = ['rojo', 'azul', 'amarillo', 'verde'];
  const invited = () => Object.keys(fb().inv).length;
  const decorated = () => (fb().deco | 0) >= RIBBONS.length;
  const FEED = ['patos', 'caballo', 'gallinas'];
  const fedAll = () => FEED.every(k => fb().fed[k]);

  // =====================================================================
  //  Places an errand sends you (SPOTS): a picture bubble over them; a tap walks you there and runs it
  // =====================================================================
  // icon(): the bubble when it's active, else null. Several can share a tile: the first active one wins.
  const V = (tag) => G.MAPDATA.villa.pos[tag];
  E.SPOTS = [
    // errand 1: the trail
    { id: 'paw', map: 'villa', at: V('banco3'), icon: () => S.active('canelo') && cl().clue >= 1 && !cl().paw ? 'huella' : null, run: pawSpot },
    { id: 'ball', map: 'villa', at: V('fuente'), icon: () => S.active('canelo') && cl().clue >= 2 && !cl().ball ? 'pelota' : null, run: ballSpot },
    { id: 'barn', map: 'villa', at: V('granjaDoor'), icon: () => S.active('canelo') && cl().clue >= 3 && !cl().found ? 'guau' : null, run: barnSpot },
    // errand 5: the goldfish in the fountain (tap the fountain and it jumps out: counted)
    { id: 'fish', map: 'villa', at: V('fuente'), icon: () => S.active('cuenta') && counted('pez') < 1 ? 'pez' : null, run: fishSpot },
    // errand 2: the picnic foods
    { id: 'egg', map: 'villa', at: [1, 7], icon: () => S.active('picnic') && !fl('picnic').huevo ? 'huevo' : null, run: eggSpot },
    { id: 'milk', map: 'villa', at: [39, 12], icon: () => S.active('picnic') && !fl('picnic').leche ? 'cubeta' : null, run: milkSpot },
    { id: 'water', map: 'villa', at: V('fuente'), icon: () => (S.active('picnic') && !fl('picnic').agua) ? 'agua' : null, run: waterSpot },
    // errand 7: Tomás's letter for the barn, and the horse who ate it
    { id: 'letter', map: 'villa', at: V('granjaDoor'), icon: () => S.active('cansado') && !ca().granja ? 'carta' : null, run: barnLetter },
    { id: 'horse', map: 'villa', at: [42, 12], icon: () => S.active('cansado') && ca().granja === 1 ? 'manzana' : null, nohint: () => !B.has('manzana'), run: horseLetter },
    // errand 8: the party
    { id: 'ribbons', map: 'villa', at: V('granjaDoor'), icon: () => S.active('fiestab') && invited() >= 5 && !decorated() ? [[{ icon: 'cinta', col: '#e03028' }, 1], [{ icon: 'cinta', col: '#3068e0' }, 1]] : null, run: ribbonSpot },
    { id: 'feedDucks', map: 'villa', at: [37, 21], icon: () => S.active('fiestab') && decorated() && !fb().fed.patos ? 'pato' : null, run: feedSpot('patos') },
    { id: 'feedHorse', map: 'villa', at: [42, 12], icon: () => S.active('fiestab') && decorated() && !fb().fed.caballo ? 'caballo' : null, run: feedSpot('caballo') },
    { id: 'feedHens', map: 'villa', at: [1, 7], icon: () => S.active('fiestab') && decorated() && !fb().fed.gallinas ? 'gallina' : null, run: feedSpot('gallinas') },
    { id: 'party', map: 'villa', at: V('granjaDoor'), icon: () => S.active('fiestab') && decorated() && fedAll() ? 'estrella' : null, run: partySpot },
    // side jobs
    { id: 'jobDucks', map: 'villa', at: [37, 21], icon: () => S.done('saludos') && free('pan') && !E.jobDone('patos') ? 'pan' : null, run: ducksJob },
    { id: 'jobEgg', map: 'villa', at: [1, 7], icon: () => S.done('picnic') && !E.jobDone('huevo') && !free('huevo') ? 'huevo' : null, run: eggJob },
    { id: 'jobWater', map: 'villa', at: V('fuente'), icon: () => E.bowlEmpty() && !free('agua') ? 'agua' : null, run: waterJob },
    { id: 'bowl', map: 'casa', at: [1, 4], icon: () => E.bowlEmpty() ? 'agua' : null, nohint: () => !free('agua'), run: bowlJob },
    { id: 'gold', map: 'villa', at: GOLD, quiet: true, icon: () => F().e_gold === 1 && !picked(GOLD[0], GOLD[1]) ? 'flor' : null, run: goldSpot }, // (no bubble: it shines)
  ];
  // the flower spots (no bubble: the flower itself is drawn, bright and twinkling)
  E.FLOWERS.forEach(([x, y, col]) => E.SPOTS.push({ id: 'flor' + x + '_' + y, map: 'villa', at: [x, y], flower: col, quiet: true,
    icon: () => flowersOut() && !picked(x, y) && (!S.done('flores') || !B.has('flor', { col })) ? 'flor' : null, run: function* (f) { yield* pickFlower(f, x, y, col); } }));
  const spotIcon = sp => { try { return sp.icon(); } catch (e) { return null; } };
  E.spotAt = function (f, x, y) {
    if (!G.state || !f) return null;
    for (const sp of E.SPOTS) if (sp.map === f.mapId && sp.at[0] === x && sp.at[1] === y && spotIcon(sp)) return sp;
    return null;
  };
  E.runSpot = function* (f, sp) { yield* sp.run(f, sp); };
  E.spots = f => E.SPOTS.filter(sp => sp.map === f.mapId && spotIcon(sp));
  const hinted = sp => !sp.quiet && !(sp.nohint && sp.nohint()); // (a bubble that only says "not yet": no hand)
  E.waitsIn = map => !!G.state && E.SPOTS.some(sp => sp.map === map && hinted(sp) && spotIcon(sp));

  // where the hint hand may point (world px): active places, then the animals to find
  E.targets = function (f) {
    if (!G.state || !f) return [];
    const out = [];
    for (const sp of E.spots(f)) if (hinted(sp) || (S.active('flores') && sp.flower && WISH.includes(sp.flower) && wishLeft().includes(sp.flower))) out.push({ x: sp.at[0] * T + 12, y: sp.at[1] * T + 12, spot: sp.id });
    if (f.mapId !== 'villa') return out;
    // the dog show: a trick to practise with Canelo
    const dog = G.pet && G.pet.npc(f);
    if (S.active('show') && !showReady() && dog && G.pet.learning()) out.push({ x: dog.x * T + 12, y: dog.y * T + 12, npc: 'canelo' });
    if (S.active('cuenta') && !countDone() && G.animals) {
      for (const [k, n] of E.COUNT) if (counted(k) < n) {
        if (k === 'pez') continue; // (the fountain's own bubble)
        const a = (f.zoo ? f.zoo.list : []).find(a => a.kind === k && !a._cu); if (a) out.push({ x: Math.round(a.x), y: Math.round(a.y - 6), animal: k });
      }
    }
    if (E.nicoFollows() && f.npc('nico')) {
      const r = ROUNDS[so().i | 0];
      if (r && r[0] === 'gato') { if (f.amb && f.amb.cat) out.push({ x: f.amb.cat.x * T + 12, y: f.amb.cat.y * T - 2, cat: true }); }
      else if (r) { const a = G.animals.find(r[0], f); if (a) out.push({ x: Math.round(a.x), y: Math.round(a.y - 6), animal: r[0] }); }
    }
    return out;
  };

  // =====================================================================
  //  Errand 1: ¿Dónde está Canelo?
  // =====================================================================
  function* caneloStart(f) {
    const n = G.pet && G.pet.npc(f);
    yield* say('mama', TT('¡{name}! ¡Buenos días!', '{name}! Good morning!'));
    if (n) { // he spots something outside and he's off, out of the door
      if (G.pet.state().sleep) G.pet.state().sleep = false;
      n.busy = true; n.ghost = true;
      G.pet.sound('bark'); yield 20;
      const door = G.MAPDATA.casa.pos.door;
      let path = '';
      for (let x = n.x; x !== door[0]; x += Math.sign(door[0] - x)) path += door[0] > x ? 'r' : 'l';
      for (let y = n.y; y !== door[1]; y++) path += 'd';
      yield* f.walkNpc(n, path, 4);
      G.pet.sound('woof'); f.removeNpc('canelo');
    }
    cl().clue = 0; S.startQuest('canelo'); // (he's lost from now on)
    yield* say('mama', TT('¡Ay! ¡Canelo! ¿Dónde está?', 'Oh no! Canelo! Where is he?'));
    yield* q('mama', 'Mamá: ¿Qué buscas?', 'Mom: What are you looking for?', 'perro', ['perro', 'gato', 'pato']);
    yield G.questCard('canelo');
    yield* say('mama', TT('¡Pregunta en el pueblo! El señor Gómez...', 'Ask around town! Mr. Gómez first...'));
  }
  // a neighbour: you ask about Canelo (by voice), they give you a clue
  const CLUE = {
    gomez: [TT('¡[si]! ¡[guau], [guau]! Un [perro]... ¡en el [parque]!', 'Yes! Woof, woof! A dog... in the park!'), TT('Mira el [banco].', 'Look at the bench.')],
    lucia: [TT('¿Canelo? ¡Una [pelota]! ¡En la [fuente]!', 'Canelo? A ball! At the fountain!')],
    tomas: [TT('¡Uy! ¡[guau], [guau]! ¡En la [granja]!', 'Oh! Woof, woof! At the farm!'), TT('La [puerta] de la [granja]...', 'The barn door...')],
  };
  function* clueTalk(who) {
    yield* q(who, 'Tú: ¡[hola]! ¿Y mi...?', 'You: Hi! Have you seen my... (say "el perro")', 'perro', ['perro', 'gato', 'pez']);
    yield* say(who, ...CLUE[who]);
    cl().clue = (cl().clue | 0) + 1;
    G.toast('\u0003 ' + cl().clue + '/3', 90);
  }
  function* pawSpot(f) {
    G.audio.sfx('chest');
    yield* tell(TT('¡Mira! Una huella...', 'Look! A paw print...'));
    yield* q(null, '¿Dónde está?', 'Where is it? (by the bench)', 'banco', ['banco', 'fuente', 'arbol'], { show: 'huella' });
    yield* tell(TT('¡El [banco]! ¡Canelo! ¿Y ahora?', 'The bench! Canelo was here! And now?'));
    cl().paw = 1;
  }
  function* ballSpot(f) {
    G.audio.sfx('chest');
    yield* tell(TT('¡Mira! En la [fuente]...', 'Look! In the fountain...'));
    yield* q(null, '¿Qué es?', 'What is it?', 'pelota', ['pelota', 'pan', 'flor']);
    yield* tell(TT('¡La [pelota] de Canelo!', 'Canelo\'s ball!'));
    B.add('pelota', { q: 'canelo' });
    cl().ball = 1;
  }
  function* barnSpot(f) {
    G.pet.sound('bark'); yield 14; G.pet.sound('bark');
    yield* tell(TT('¡[guau]! ¡[guau]! ...¿Canelo?', 'Woof! Woof! ...Canelo?'));
    yield* G.pet.ask('ven', { prompt: '¡Dile a Canelo!', en: 'Call him out: say "¡ven!" (come!)', pool: ['ven', 'sientate', 'gira', 'salta'] });
    // he bursts out of the barn, with a friend: the goat
    const def = G.maps.villa.npcs.find(d => d.id === 'canelo');
    cl().found = 1; S.autosave();
    let n = f.npc('canelo');
    if (!n) { n = f.addNpc(Object.assign({}, def, { x: 41, y: 5, dir: 'down' })); n.ghost = true; }
    n.x = 41; n.y = 4; n.ox = 0; n.oy = 0; G.pet.place(f, n); // (out of the barn door, to your side)
    const goat = G.animals.find('cabra', f);
    if (goat) { goat.x = 43 * T + 4; goat.y = 5 * T + 20; goat.flip = false; goat.react = 40; goat.st = 'walk'; goat.tx = 42 * T + 10; goat.ty = 15 * T + 18; }
    for (let i = 0; i < 4; i++) G.fx.twinkle(...tileScr(f, 41, 4));
    yield* G.pet.play('dance');
    yield* tell(TT('¡[guau], [guau]!', 'Woof, woof!'));
    G.animals.cry('cabra');
    yield* tell(TT('¡[bee]!', 'Baa!'));
    yield* q(null, '¿Y ella?', 'And who is she?', 'cabra', ['cabra', 'caballo', 'gallina']);
    yield* tell(TT('¡Canelo y la [cabra]: amigos! ¡A [casa]!', 'Canelo and the goat are friends! Now home!'));
  }
  function* caneloEnd(f) {
    yield* say('mama', TT('¡Canelo! ¡Aquí estás!', 'Canelo! There you are!'));
    const n = G.pet.npc(f);
    if (n) { G.pet.place(f, n); yield 12; yield* G.pet.play('dance'); }
    yield* q('mama', 'Mamá: ¿Cómo está Canelo?', 'Mom: How is Canelo?', 'feliz', ['feliz', 'triste', 'cansado'], { show: 'perro' });
    yield* say('mama', TT('¡Muy [feliz]! ¿Y su [pelota]?', 'Very happy! And his ball?'));
    B.take('pelota', { q: 'canelo' });
    if (n) yield* G.pet.play('fetch');
    yield* say('mama', TT('¡Bravo, {name}!', 'Bravo, {name}!'));
    yield* finishQuest('canelo');
    if (G.hearts) G.hearts.add('canelo', 1, 'care');
  }

  // =====================================================================
  //  Errand 2: El día de campo de Abuela Rosa
  // =====================================================================
  const FOODS = ['pan', 'queso', 'huevo', 'leche', 'agua'];
  const pc = () => fl('picnic');
  const gotAll = () => FOODS.every(k => pc()[k]);
  function* picnicStart() {
    yield* say('rosa', TT('¡{name}! ¡Un día de campo!', '{name}! A picnic!'));
    yield* q('rosa', 'Rosa: ¿Me ayudas?', 'Rosa: Will you help me?', 'si', ['si', 'no']);
    yield* newQuest('picnic');
    yield* say('rosa', TT('[pan], [queso], [huevo], [leche] y [agua]. ¡[gracias]!', 'Bread, cheese, an egg, milk and water. Thank you!'));
  }
  function got(k) { pc()[k] = 1; B.add(k, { q: 'picnic' }); G.toast('\u0005 ' + FOODS.filter(x => pc()[x]).length + '/5', 90); }
  function* eggSpot(f) {
    G.animals.cry('gallina');
    yield* tell(TT('¡Coc, coc! ...¡Mira!', 'Cluck, cluck! ...Look!'));
    yield* q(null, '¿Qué es?', 'What is it?', 'huevo', ['huevo', 'pan', 'pelota']);
    got('huevo');
    yield* tell(TT('¡Un [huevo]! ¡[gracias], [gallina:gallinas]!', 'An egg! Thank you, hens!'));
  }
  function* milkSpot(f) {
    G.animals.cry('cabra');
    yield* tell(TT('¡[bee]! La [cabra]...', 'Baa! The goat...'));
    yield* q(null, '¿Qué es?', 'What is in the pail?', 'leche', ['leche', 'agua', 'queso'], { show: 'cubeta' });
    got('leche');
    yield* tell(TT('¡La [leche]! ¡[gracias], [cabra]!', 'The milk! Thank you, goat!'));
  }
  function* waterSpot(f) {
    yield* tell(TT('La [fuente]...', 'The fountain...'));
    yield* q(null, '¿Qué es?', 'What is it?', 'agua', ['agua', 'leche', 'pan']);
    got('agua');
  }
  function* picnicEnd(f) {
    yield* say('rosa', TT('¡Todo! ¡Al [parque]!', 'Everything! To the park!'));
    const n = f.npc('rosa'), p = f.player, dog = G.pet && G.pet.npc(f);
    yield* fade(1);
    p.x = 15; p.y = 21; p.dir = 'up'; p.ox = p.oy = 0;
    if (n) { n.x = 15; n.y = 19; n.ox = n.oy = 0; n.dir = 'down'; n.wander = 0; n.home = [15, 19]; n.moving = false; }
    if (dog) { dog.x = 16; dog.y = 21; dog.ox = dog.oy = 0; dog.dir = 'up'; }
    f.picnic = { food: [] }; f.snapCam();
    yield* fade(0);
    yield* say('rosa', TT('¡Un día de campo! ¿Y la comida?', 'A picnic! And the food?'));
    for (const k of FOODS) {
      const c = G.wordChoices(k, FOODS, 3);
      yield* G.ask({ prompt: 'Rosa: ¿...?', en: 'Rosa holds out her hand: which food is it?', show: k, choices: c.choices, answer: c.answer, layout: 'cards', learn: k, who: 'rosa' });
      B.take(k, { q: 'picnic' }); f.picnic.food.push(k); G.audio.sfx('pop');
    }
    yield* say('rosa', TT('¡Mmm! ¡Qué rico! ¡Y una [galleta] para Canelo!', 'Mmm! Delicious! And a cookie for Canelo!'));
    if (dog) { yield* G.pet.play('eat', { item: 'galleta' }); if (G.hearts) G.hearts.add('canelo', 1, 'care'); }
    yield* say('rosa', TT('¡[gracias], {name}! ¡Qué [feliz]!', 'Thank you, {name}! So happy!'));
    yield* finishQuest('picnic');
  }

  // =====================================================================
  //  Errand 3: El show de perros de Sofía
  // =====================================================================
  const SHOW = [['sientate', 'azul'], ['pata', 'rojo'], ['salta', 'amarillo']];
  const showReady = () => SHOW.every(([t]) => G.pet.knows(t));
  function* showStart() {
    yield* say('sofia', TT('¡{name}! ¡Un show de perros en el [parque]!', '{name}! A dog show in the park!'));
    yield* q('sofia', 'Sofía: ¿Y Canelo? ¿Sí?', 'Sofía: Will Canelo be in it?', 'si', ['si', 'no']);
    yield* newQuest('show');
    yield* say('sofia', TT('Canelo: [sientate], [pata] y [salta]. ¡Practica!', 'Canelo needs: sit, shake and jump. Practice!'));
  }
  function* showRemind() {
    const l = G.pet.learning(), nx = G.pet.next();
    if (l) yield* say('sofia', TT('¡[' + l + ']! ¡Toca a Canelo y practica!', 'Tap Canelo and practise!'));
    else if (nx && nx.by !== 'sofia') yield* say('sofia', TT('Canelo: [sientate], [pata] y [salta]. ¡' + G.nameOf(nx.by) + '!', 'Canelo needs: sit, shake and jump. Ask ' + G.nameOf(nx.by) + '!'));
    else yield* say('sofia', TT('Canelo: [sientate], [pata] y [salta]. ¡Practica!', 'Canelo needs: sit, shake and jump. Practice!'));
  }
  // move people about for a scene (and back): places {id: [x, y, dir]}; extra people who aren't on this map are added
  function stage(f, places) {
    const back = [];
    for (const id in places) {
      const [x, y, dir] = places[id];
      let n = f.npc(id);
      if (!n) { n = f.addNpc({ id, npc: id.replace(/_.*/, ''), x, y, dir, fixed: true, guest: true }); back.push({ n, add: true }); }
      else back.push({ n, x: n.x, y: n.y, dir: n.dir, wander: n.wander, route: n.route, home: n.home, ghost: n.ghost, alert: n.alert });
      n.alert = null; // (no thought bubbles in the crowd)
      n.x = x; n.y = y; n.ox = n.oy = 0; n.dir = dir; n.wander = 0; n.route = null; n.home = [x, y]; n.moving = false; n.busy = false; n.ghost = true;
    }
    return back;
  }
  function unstage(f, back) {
    for (const b of back) {
      if (b.add) { f.npcs = f.npcs.filter(n => n !== b.n); continue; }
      Object.assign(b.n, { x: b.x, y: b.y, dir: b.dir, wander: b.wander, route: b.route, home: b.home, ghost: b.ghost, alert: b.alert, ox: 0, oy: 0 });
    }
  }
  const clap = (f, ids) => { G.audio.sfx('coin'); for (const id of ids) { const n = f.npc(id); if (n && G.ambient) G.ambient.happy(n); } };
  function* showTime(f) {
    yield* say('sofia', TT('¡Todo list{o/a}! ¡El show!', 'All ready! Show time!'));
    yield* fade(1);
    const p = f.player, dog = G.pet.npc(f);
    p.x = 16; p.y = 21; p.dir = 'right'; p.ox = p.oy = 0;
    if (dog) { dog.x = 17; dog.y = 21; dog.ox = dog.oy = 0; dog.dir = 'down'; }
    const crowd = { luna_show: [17, 19, 'down'], nico: [21, 19, 'left'], rosa: [13, 20, 'right'], gomez: [14, 19, 'right'], lucia: [22, 20, 'left'], pepe: [21, 20, 'left'] };
    const back = stage(f, crowd); f.snapCam();
    yield* fade(0);
    const who = Object.keys(crowd);
    yield* say('luna', TT('¡Bienvenidos al show de perros!', 'Welcome to the dog show!'));
    for (const [tr, col] of SHOW) {
      yield* say('luna', TT('Canelo... ¡[' + tr + ']!', 'Canelo... (Luna calls a trick: say it to Canelo)'));
      yield* G.pet.command(tr, { prompt: '¡Dile a Canelo!', en: 'Tell Canelo! (say the trick)' });
      clap(f, who); G.fx.confetti(G.W / 2 - 60, 120, -1, 14); G.fx.confetti(G.W / 2 + 60, 120, 1, 14);
      yield* say('luna', TT('¡Bravo! ¡Una cinta para Canelo!', 'Bravo! A ribbon for Canelo!'));
      yield* q('luna', '¿De qué color?', 'What colour is the ribbon?', col, ['azul', 'rojo', 'amarillo', 'verde'], { show: { icon: 'cinta', col: W(col).col } });
      (f.ribbons || (f.ribbons = [])).push(col);
    }
    G.audio.jingle('item');
    yield* say('luna', TT('¡Canelo es el campeón!', 'Canelo is the champion!'));
    clap(f, who);
    if (dog) yield* G.pet.play('dance');
    yield* say('sofia', TT('¡[gracias], {name}! ¡Qué [feliz]!', 'Thank you, {name}! So happy!'));
    yield* finishQuest('show');
    if (G.hearts) G.hearts.add('canelo', 1, 'trick');
    yield* fade(1); unstage(f, back); yield* fade(0);
  }

  // =====================================================================
  //  Errand 4: Tomás está cansado
  // =====================================================================
  function* tomasStart() {
    yield* say('tomas', TT('Uf... uf...', 'Phew... phew...'));
    yield* q('tomas', '¿Cómo está Tomás?', 'How is Tomás?', 'cansado', ['cansado', 'feliz', 'triste']);
    yield* say('tomas', TT('¡[si]! Estoy [cansado:cansado]... [tres] [carta:cartas]...', 'Yes! I\'m tired... three letters...'));
    yield* q('tomas', 'Tomás: ¿Me ayudas?', 'Tomás: Will you help me?', 'si', ['si', 'no']);
    for (const to of ['casa', 'granja', 'biblioteca']) B.add('carta', { q: 'cansado', to });
    yield* newQuest('cansado');
    yield* say('tomas', TT('Rosa: la [casa]. La [granja]. Inés: la [biblioteca]. ¡[gracias]!', 'Rosa\'s house, the barn, and Inés at the library. Thanks!'));
  }
  function* deliver(who, to, pool) {
    yield* say(who, TT('¿Una [carta]? ¿Para mí?', 'A letter? For me?'));
    yield* q(null, '¿Dónde estás?', 'Where are you? (say the place)', to, pool, { show: 'carta' });
    B.take('carta', { q: 'cansado', to });
  }
  function* barnLetter(f) {
    yield* tell(TT('La [carta] de Tomás...', 'Tomás\'s letter...'));
    yield* q(null, '¿Dónde estás?', 'Where are you? (say the place)', 'granja', ['granja', 'parque', 'casa'], { show: 'carta' });
    // the horse trots up and eats it!
    const h = G.animals.find('caballo', f);
    if (h) { h.x = 42 * T + 14; h.y = 6 * T + 18; h.flip = true; h.st = 'idle'; h.t = 200; G.animals.react(f, h); h.react = 60; G.animals.cry('caballo'); }
    yield* tell(TT('¡Iiijii! ...¡Ñam, ñam!', 'Neigh! ...Munch, munch!'));
    B.take('carta', { q: 'cansado', to: 'granja' });
    ca().granja = 1; S.autosave();
    yield* tell(TT('¡Ay! ¡El [caballo]! ¡La [carta]!', 'Oh no! The horse! The letter!'));
    if (h) { h.st = 'walk'; h.tx = 42 * T + 12; h.ty = 14 * T + 18; }
    yield* tell(TT('¿Una [manzana] para el [caballo]?', 'An apple for the horse?'));
  }
  function* horseLetter(f) {
    const h = G.animals.find('caballo', f);
    if (!B.has('manzana')) { if (h) { G.animals.react(f, h); G.animals.cry('caballo'); } yield* tell(TT('¡Iiijii! ¿Una [manzana]? ¡Don Pepe!', 'Neigh! An apple? Don Pepe has them!')); return; }
    yield* tell(TT('¡El [caballo]!', 'The horse!'));
    yield* q(null, '¿Qué quiere?', 'What does he want?', 'manzana', ['manzana', 'pan', 'queso'], { show: 'caballo' });
    B.take('manzana', B.has('manzana', { q: 'cansado' }) ? { q: 'cansado' } : {});
    if (h) { h.x = 42 * T + 12; h.y = 13 * T + 20; h.flip = true; h.st = 'idle'; h.t = 200; G.animals.react(f, h); }
    G.animals.cry('caballo');
    yield* tell(TT('¡Ñam! ¡Aquí está la [carta]! ¡Para la [granja]!', 'Munch! Here is the letter! It\'s for the barn!'));
    ca().granja = 2;
    G.audio.sfx('chime');
    if (lettersDone()) yield* tell(TT('¡Listo! ¡A Tomás!', 'Done! Back to Tomás!'));
  }
  function* tomasEnd(f) {
    yield* say('tomas', TT('¡[tres] [carta:cartas]! ¡[gracias], {name}!', 'Three letters! Thank you, {name}!'));
    yield* q('tomas', '¿Y ahora? ¿Cómo está Tomás?', 'And now? How is Tomás?', 'feliz', ['feliz', 'cansado', 'triste']);
    yield* say('tomas', TT('¡Ya no estoy [cansado:cansado]! ¡Eres un{/a} gran carter{o/a}!', 'I\'m not tired any more! You\'re a great mail carrier!'));
    yield* finishQuest('cansado');
    const n = f.npc('tomas'), def = G.maps.villa.npcs.find(d => d.id === 'tomas');
    if (n && def) { n.route = def.route; n._tired = false; }
  }

  // =====================================================================
  //  Errand 5: ¿Cuántos animales? (Profesora Luna)
  // =====================================================================
  function* cuentaStart() {
    yield* say('luna', TT('¡{name}! ¿Cuántos animales hay en Villa Sol?', '{name}! How many animals are there in Villa Sol?'));
    yield* q('luna', 'Luna: ¿Me ayudas?', 'Luna: Will you help me count?', 'si', ['si', 'no']);
    yield* newQuest('cuenta');
    yield* say('luna', TT('¡Toca los animales y cuenta! [uno], [dos], [tres]...', 'Tap the animals to count them! One, two, three...'));
  }
  function count(f, kind, sx, sy) {
    const tot = (E.COUNT.find(c => c[0] === kind) || [])[1], c = cu();
    if (!tot || counted(kind) >= tot) return false;
    c.n[kind] = counted(kind) + 1;
    const w = NUM[c.n[kind] - 1];
    if (G.vocabLog) G.vlog('tapped-object', w, { via: 'count' }); // (the dev-only log, vocablog.js)
    G.fx.say('¡' + G.baseForm(w) + '!', sx, sy - 10, '#fff070', true); G.speak(G.baseForm(w)); G.audio.sfx('coin');
    if (c.n[kind] >= tot) { G.album.count(kind); G.audio.sfx('chime'); for (let i = 0; i < 3; i++) G.fx.twinkle(sx + (Math.random() - 0.5) * 24, sy + (Math.random() - 0.5) * 14); }
    if (countDone()) G.toast('\u0005 ¡Luna! \u0005', 120);
    S.autosave();
    return true;
  }
  function* fishSpot(f) {
    const p = V('fuente'), fish = G.animals.find('pez', f);
    if (fish) G.animals.jump(fish, f);
    G.animals.meet('pez'); count(f, 'pez', ...tileScr(f, p[0], p[1]));
    yield 50;
  }
  function* cuentaEnd() {
    yield* say('luna', TT('¡{name}! ¿Cuántos?', '{name}! How many?'));
    for (const [k, n] of E.COUNT) {
      const fem = W(k).es.startsWith('la ');
      yield* q('luna', '¿Cuánt' + (fem ? 'as' : 'os') + ' [' + k + ':' + (W(k).pl || k) + ']?', 'How many ' + W(k).en.replace('the ', '') + 's?', NUM[n - 1], NUM.slice(0, Math.max(4, n + 2)), { show: k });
    }
    yield* say('luna', TT('¡[uno], [dos], [tres], [cuatro], [cinco], [seis], [siete], [ocho], [nueve]...!', 'One, two, three, four, five, six, seven, eight, nine...!'));
    yield* q('luna', '¿Cuántos animales?', 'How many animals in all?', 'diez', ['diez', 'ocho', 'seis']);
    yield* say('luna', TT('¡[diez] animales! ¡Qué list{o/a}!', 'Ten animals! How clever!'));
    yield* finishQuest('cuenta');
  }

  // =====================================================================
  //  Errand 6: ¿Qué dicen? (Nico's sound game)
  // =====================================================================
  function* sonidosStart(f) {
    yield* say('nico', TT('¡{name}! ¡Un juego! ¡Escucha!', '{name}! A game! Listen!'));
    playSound(f, 0); yield 50;
    yield* say('nico', TT('¿Quién es? ¡Vamos!', 'Who is it? Let\'s go and find it!'));
    so().i = 0;
    yield* newQuest('sonidos');
  }
  function* sonidosRemind(f) { yield* say('nico', TT('¡Escucha!', 'Listen!')); playSound(f, so().i | 0); yield 40; }
  // the round's animal was tapped (with Nico there): say its sound
  function* soundFound(f) {
    const i = so().i | 0, [kind, snd] = ROUNDS[i];
    yield* say('nico', TT('¡[si]! ¡El [' + kind + ']!', 'Yes! The ' + W(kind).en.replace('the ', '') + '!'));
    yield* q('nico', '¿Qué dice ' + (W(kind).es.startsWith('la') ? 'la' : 'el') + ' [' + kind + ']?', 'What does it say?', snd, ROUNDS.map(r => r[1]), { show: kind });
    so().i = i + 1; S.autosave();
    if (i + 1 < ROUNDS.length) { yield* say('nico', TT('¡Muy bien! ¡Escucha!', 'Well done! Listen!')); playSound(f, i + 1); yield 40; return; }
    // last: Nico barks, and Canelo answers
    yield* say('nico', TT('¡Ahora yo! ¡[guau], [guau]!', 'Now me! Woof, woof!'));
    if (G.pet.npc(f)) { G.pet.place(f, G.pet.npc(f)); yield 10; yield* G.pet.play('dance'); }
    yield* q('nico', '¿Quién dice [guau]?', 'Who says woof?', 'perro', ['perro', 'gato', 'pato']);
    so().i = 5;
    yield* say('nico', TT('¡Canelo! ¡Ja, ja! ¡[gracias], {name}!', 'Canelo! Ha ha! Thanks, {name}!'));
    yield* finishQuest('sonidos');
    const n = f.npc('nico'); if (n && n.amb) { n.amb.follow = false; n.ghost = false; n.wander = 2; n.home = [n.x, n.y]; }
  }

  // =====================================================================
  //  Errand 7: Las flores de Lucía
  // =====================================================================
  function* floresStart() {
    yield* say('lucia', TT('Ay...', 'Sigh...'));
    yield* q('lucia', '¿Cómo está Lucía?', 'How is Lucía?', 'triste', ['triste', 'feliz', 'cansado']);
    yield* say('lucia', TT('Sí, [triste]... Mi mamá... ¡su cumpleaños!', 'Yes, sad... It\'s my mom\'s birthday!'), TT('Flores: [rosa], [blanco:blanca] y [amarillo:amarilla]. ¿[porfavor]?', 'Flowers: a pink one, a white one and a yellow one. Please?'));
    fo().got = {};
    yield* newQuest('flores');
  }
  function* pickFlower(f, x, y, col) {
    const active = S.active('flores'), c = fo(), need = active && WISH.includes(col) && !(c.got && c.got[col]);
    if (need && wishLeft().length === 1 && !c.bfly) { // a butterfly sits on the last one
      yield* tell(TT('¡Shh! ¡Mira!', 'Shh! Look!'));
      yield* q(null, '¿Qué es?', 'What is sitting on the flower?', 'mariposa', ['mariposa', 'pajaro', 'pez']);
      c.bfly = 1; f.bfly = { x: x * T + 12, y: y * T + 6, t: 0 };
      yield* tell(TT('¡[adios], [mariposa]!', 'Bye-bye, butterfly!'));
    }
    G.audio.sfx('select');
    yield* tell(TT('¡Una [flor]!', 'A flower!'));
    yield* q(null, '¿De qué color?', 'What colour is it?', col, COLS, { show: flowerPic(col) });
    if (active) {
      yield* G.siNo('¿Para Lucía?', need, { show: flowerPic(col), en: 'Is it one Lucía wants? (pink, white, yellow)' });
      if (!need) { yield* tell(TT('Lucía: [rosa], [blanco:blanca], [amarillo:amarilla]...', 'Lucía wants pink, white and yellow...')); return; }
      c.got[col] = 1; pickNow(x, y); B.add('flor', { col, q: 'flores' });
      if (!wishLeft().length) yield* tell(TT('¡[tres] [flor:flores]! ¡A Lucía!', 'Three flowers! Off to Lucía!'));
      return;
    }
    // after the errand: flowers to give away
    if (B.has('flor', { col }) || B.full()) return;
    pickNow(x, y); B.add('flor', { col });
  }
  function* goldSpot(f) {
    G.audio.sfx('chest');
    yield* tell(TT('¡Oh! ¡Una [flor] de oro!', 'Oh! A golden flower!'));
    yield* q(null, '¿De qué color?', 'What colour is it?', 'amarillo', ['amarillo', 'azul', 'rojo'], { show: flowerPic('amarillo', true) });
    pickNow(GOLD[0], GOLD[1]);
    for (let i = 0; i < 3; i++) { G.state.stars++; G.fx.flyStar(...tileScr(f, GOLD[0], GOLD[1]), i * 8); }
    if (!B.full()) B.add('flor', { col: 'amarillo', gold: true });
  }
  function* floresEnd() {
    yield* say('lucia', TT('¡Mis [flor:flores]! ¡Qué bonitas!', 'My flowers! How pretty!'));
    for (const col of WISH) B.take('flor', { col, q: 'flores' });
    yield* say('lucia', TT('¡Para mi mamá! ¡[gracias], {name}!', 'For my mom! Thank you, {name}!'));
    yield* q('lucia', '¿Y ahora? ¿Cómo está Lucía?', 'And now? How is Lucía?', 'feliz', ['feliz', 'triste', 'cansado']);
    yield* say('lucia', TT('¡Estoy muy [feliz]!', 'I\'m very happy!'));
    yield* finishQuest('flores');
  }
  if (G.hearts) G.hearts.secrets.lucia = function* () { // 3 hearts: the golden flower in the wheat field
    yield G.say([TT('¡Un secreto! Una [flor] de oro... ¡en la [granja]!', 'A secret! A golden flower... out by the farm, in the wheat!')], { portrait: G.portraitOf('lucia'), name: G.nameOf('lucia'), who: 'lucia' });
    F().e_gold = 1;
  };

  // =====================================================================
  //  Errand 8: La fiesta de los animales (the finale)
  // =====================================================================
  function* fiestaStart() {
    yield* say('luna', TT('¡{name}! ¡Una fiesta en la [granja]! ¡Para los animales!', '{name}! A party at the farm! For the animals!'));
    yield* q('luna', 'Luna: ¿Me ayudas?', 'Luna: Will you help?', 'si', ['si', 'no']);
    yield* newQuest('fiestab');
    yield* say('luna', TT('Di [hola] a [cinco] amigos: ¡la fiesta!', 'Say hello to five friends and invite them!'));
  }
  function* invite(who) {
    yield* q(who, 'Tú: ¡...! ¡Una fiesta!', 'You: Hi! A party! (say hello)', 'hola', ['hola', 'adios', 'gracias']);
    yield* say(who, TT('¿Una fiesta? ¿Para mí?', 'A party? For me?'));
    yield* q(null, '¿...?', 'Say yes!', 'si', ['si', 'no']);
    fb().inv[who] = 1;
    yield* say(who, TT('¡[si]! ¡A la [granja]!', 'Yes! To the farm!'));
    G.toast('\u0003 ' + invited() + '/5', 90);
    if (invited() === 5) yield* tell(TT('¡[cinco]! ¡A la [granja]! ¡Las cintas!', 'Five! To the barn! The ribbons!'));
  }
  function* ribbonSpot(f) {
    yield* tell(TT('¡La [granja]! ¡Las cintas!', 'The barn! The ribbons!'));
    const c = fb();
    while ((c.deco | 0) < RIBBONS.length) {
      const col = RIBBONS[c.deco | 0];
      yield* q(null, '¿De qué color?', 'What colour is this ribbon?', col, ['rojo', 'azul', 'amarillo', 'verde', 'blanco'], { show: { icon: 'cinta', col: W(col).col } });
      c.deco = (c.deco | 0) + 1; G.audio.sfx('pop'); S.autosave();
    }
    G.fx.confetti(G.W / 2 - 50, 110, -1, 16); G.fx.confetti(G.W / 2 + 50, 110, 1, 16);
    yield* tell(TT('¡Qué bonito! Ahora... ¡la comida!', 'So pretty! Now... the food!'));
    for (const k of ['pan', 'agua']) if (!B.has(k, { q: 'fiestab' })) B.add(k, { q: 'fiestab' });
    yield* tell(TT('[pan] para los [pato:patos], [agua] para el [caballo]...', 'Bread for the ducks, water for the horse... and the hens!'));
  }
  function swimOver(f) { const d = (f.zoo ? f.zoo.list : []).find(a => a.kind === 'pato' && !a.baby); if (d) { d.tx = 38 * T + 4; d.ty = 21 * T + 14; d.st = 'swim'; } }
  function feedSpot(k) {
    return function* (f) {
      if (k === 'patos') {
        swimOver(f); G.animals.cry('pato');
        yield* tell(TT('¡[cuac], [cuac]!', 'Quack, quack!'));
        yield* q(null, '¡Para los [pato:patos]!', 'For the ducks! What do you give them?', 'pan', ['pan', 'agua', 'flor']);
        B.take('pan', { q: 'fiestab' });
      } else if (k === 'caballo') {
        const h = G.animals.find('caballo', f); if (h) { h.x = 42 * T + 12; h.y = 13 * T + 20; G.animals.react(f, h); }
        G.animals.cry('caballo');
        yield* q(null, '¡Para el [caballo]!', 'For the horse! What do you give him?', 'agua', ['agua', 'pan', 'flor']);
        B.take('agua', { q: 'fiestab' });
      } else {
        G.animals.cry('gallina');
        yield* tell(TT('¡Coc, coc! Maíz...', 'Cluck, cluck! Some corn...'));
        yield* q(null, '¿Quiénes son?', 'Who are they?', 'gallina', ['gallina', 'pato', 'pajaro']);
      }
      fb().fed[k] = 1; G.audio.sfx('chime'); S.autosave();
      if (fedAll()) yield* tell(TT('¡Todo list{o/a}! ¡A la [granja]: la fiesta!', 'All ready! To the barn: the party!'));
    };
  }
  // the guests: everyone invited and every best friend, with Luna and Mamá
  const GUEST_SPOTS = [[38, 6, 'right'], [44, 6, 'left'], [37, 7, 'right'], [45, 7, 'left'], [38, 8, 'right'], [44, 8, 'left'], [37, 9, 'right'], [45, 9, 'left'], [39, 9, 'up'], [43, 9, 'up'], [36, 8, 'right'], [46, 8, 'left']];
  E.guests = function () {
    const g = ['luna', 'mama'];
    for (const w of G.hearts ? G.hearts.WHO : []) if (w !== 'canelo' && !g.includes(w) && (fb().inv[w] || G.hearts.best(w))) g.push(w);
    return g;
  };
  function partyPlaces() {
    const pl = {}, gs = E.guests();
    gs.forEach((w, k) => { const s = GUEST_SPOTS[k]; if (!s) return; pl[['luna', 'mama', 'marta', 'ines'].includes(w) ? w + '_party' : w] = w === 'luna' ? [41, 6, 'down'] : s; });
    if (pl.luna_party) { /* Luna leads, in front of the door */ }
    return pl;
  }
  function* partySpot(f) {
    yield* fade(1);
    if (f.partyWait) { unstage(f, f.partyWait); f.partyWait = null; } // (everyone back where they were, then onto the stage)
    const p = f.player, dog = G.pet.npc(f);
    p.x = 40; p.y = 8; p.dir = 'up'; p.ox = p.oy = 0;
    if (dog) { dog.x = 41; dog.y = 8; dog.ox = dog.oy = 0; dog.dir = 'up'; }
    const pl = partyPlaces(); pl.luna_party = [41, 6, 'down'];
    const back = stage(f, pl); f.party = true; f.snapCam();
    yield* fade(0);
    const who = Object.keys(pl);
    yield* say('luna', TT('¡Bienvenidos a la fiesta de los animales!', 'Welcome to the animal party!'));
    clap(f, who);
    // Canelo shows every trick he knows, as you say them
    const tricks = G.pet.known();
    if (tricks.length) yield* say('luna', TT('¡El show de Canelo!', 'Canelo\'s show!'));
    for (const id of tricks) {
      yield* G.pet.command(id, { prompt: 'Luna: ¡[' + id + ']!', en: 'Luna calls a trick: say it to Canelo!', show: false });
      clap(f, who);
    }
    yield* say('luna', TT('¡Una [galleta] para Canelo!', 'A cookie for Canelo!'));
    if (dog) yield* G.pet.play('eat', { item: 'galleta' });
    // the animals' song
    yield* say('luna', TT('¡Y ahora... los animales!', 'And now... the animals!'));
    const SONG = [['pato', '¡Cuac, cuac!'], ['cabra', '¡Beee!'], ['caballo', '¡Iiijii!'], ['gallina', '¡Coc, coc!'], ['rana', '¡Croac!'], ['gato', '¡Miau!'], ['perro', '¡Guau, guau!']];
    for (const [k, s] of SONG) {
      G.animals.cry(k);
      G.fx.say(s, 60 + Math.random() * 200, 50 + Math.random() * 60, '#fff070', true);
      if (k === 'perro' && dog) G.pet.anim(dog, 'dance');
      yield 46;
    }
    G.fx.confetti(40, 200, 1, 24); G.fx.confetti(G.W - 40, 200, -1, 24); G.audio.jingle('promote');
    clap(f, who);
    yield 40;
    yield* q('luna', '¿Estás [feliz]?', 'Are you happy?', 'feliz', ['feliz', 'triste', 'cansado']);
    yield* say('luna', TT('¡Una foto! ¡Todos juntos!', 'A photo! Everyone together!'));
    G.audio.sfx('pop'); G.fade.a = 0.9; G.fadeTo(0, 0.05, '#ffffff');
    const best = (G.hearts ? G.hearts.WHO : []).filter(w => w !== 'canelo' && G.hearts.best(w));
    fb().photo = best.length ? best : E.guests().slice(0, 6);
    yield photoCard(fb().photo);
    S.finishQuest('fiestab');
    yield G.badge('fiestab');
    if (G.hearts) { G.hearts.add('luna', 2, 'errand'); yield* G.hearts.milestones('luna'); }
    G.audio.play('victory');
    yield G.story.diploma();
    G.audio.play('town', true);
    yield* fade(1); unstage(f, back); f.party = false; yield* fade(0);
  }

  // ---------- the group photo ----------
  class Photo {
    constructor(who, w) { G.toastT = 0; this.transparent = true; this.who = who; this.w = w; this.t = 0; }
    onEnter() { G.audio.jingle('item'); }
    update() {
      this.t++;
      if (this.t === 1) { G.fx.confetti(G.W / 2 - 90, 150, -1, 20); G.fx.confetti(G.W / 2 + 90, 150, 1, 20); }
      if (this.t > 40 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.audio.sfx('ok'); G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const u = Math.min(1, this.t / 14), s = 0.3 + 0.7 * G.fx.easeBack(u), cx = G.W / 2, cy = 104;
      ctx.globalAlpha = 0.5 * u; ctx.fillStyle = '#080c28'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.03); ctx.translate(-cx, -cy);
      const ppl = ['player', 'canelo'].concat(this.who).slice(0, 10), n = ppl.length, rows = n <= 5 ? 1 : 2, per = Math.ceil(n / rows);
      const w = 232, fw = Math.min(44, Math.floor((w - 20) / per) - 2), ph = rows * (fw + 2) + 16, top = cy - 20 - ph / 2;
      ctx.fillStyle = '#10102a'; ctx.fillRect(cx - w / 2 - 1, top - 9, w + 2, ph + 36); ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - w / 2, top - 8, w, ph + 34);
      ctx.fillStyle = '#88c8f8'; ctx.fillRect(cx - w / 2 + 6, top - 2, w - 12, ph); ctx.fillStyle = '#68b048'; ctx.fillRect(cx - w / 2 + 6, top - 2 + ph * 0.7, w - 12, ph * 0.3);
      ppl.forEach((p, k) => { const r = Math.floor(k / per), i = k % per, inRow = Math.min(per, n - r * per); G.hearts.face(ctx, p, cx - (inRow * (fw + 2)) / 2 + i * (fw + 2), top + 6 + r * (fw + 2), fw, this.t); });
      G.textC(ctx, G.fill('¡La fiesta de los animales!'), cx, top + ph + 8, '#a05020', null);
      ctx.restore();
      if (this.t > 40 && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', G.W - 22, G.H - 16, '#f8e060');
    }
  }
  function photoCard(who) { const w = new G.Wait(); G.push(new Photo(who, w)); return w; }
  E.photoCard = photoCard;

  // =====================================================================
  //  Side jobs
  // =====================================================================
  function* ducksJob(f) {
    swimOver(f); G.animals.cry('pato');
    yield* tell(TT('¡[cuac], [cuac]! ¡Los [pato:patos]!', 'Quack, quack! The ducks!'));
    B.take('pan', { q: null });
    for (let i = 0; i < 6; i++) G.fx.twinkle(...tileScr(f, 38, 21));
    yield 20;
    yield* q(null, '¿Cuántos [pato:patos]?', 'How many ducks?', 'tres', ['dos', 'tres', 'cuatro', 'cinco'], { show: 'pato' });
    jobStar(f, 'patos', ...tileScr(f, 38, 21));
    yield 30;
  }
  function* eggJob(f) {
    G.animals.cry('gallina');
    yield* tell(TT('¡Coc, coc! ...¿Qué es?', 'Cluck, cluck! ...What\'s this?'));
    yield* q(null, '¿Qué es?', 'What is it?', 'huevo', ['huevo', 'pan', 'pelota']);
    B.add('huevo');
    yield* tell(TT('¡Un [huevo]! ¿Para Rosa?', 'An egg! For Grandma Rosa?'));
  }
  function* waterJob(f) {
    yield* tell(TT('La [fuente]... ¿Para Canelo?', 'The fountain... for Canelo\'s bowl?'));
    yield* q(null, '¿Qué es?', 'What is it?', 'agua', ['agua', 'leche', 'pan']);
    B.add('agua');
  }
  function* bowlJob(f) {
    const dog = G.pet.npc(f);
    if (!B.has('agua', { q: null })) {
      if (dog) yield* G.pet.play('huh');
      yield* tell(TT('El [agua]... ¡[no]! ¿La [fuente]?', 'No water! The fountain?'));
      return;
    }
    B.take('agua', { q: null }); G.audio.sfx('pop');
    jobStar(f, 'agua', ...tileScr(f, 1, 4)); // (the bowl is full now)
    if (dog) { dog.x = 2; dog.y = 4; dog.ox = dog.oy = 0; dog.dir = 'left'; yield 6; yield* G.pet.play('drink'); }
    if (G.hearts) G.hearts.add('canelo', 1, 'care');
    yield 20;
  }
  E.catTap = function (f) {
    if (!G.state || !f || f.locked || !f.amb || !f.amb.cat) return false;
    const c = f.amb.cat, nap = G.ambient.napping(f), sx = c.x * T + 12 - Math.round(f.cam.x), sy = c.y * T - 6 - Math.round(f.cam.y);
    const game = E.nicoFollows() && f.npc('nico') && ROUNDS[so().i | 0] && ROUNDS[so().i | 0][0] === 'gato';
    if (!game && !(nap && !E.jobDone('gato') && S.done('saludos'))) return false;
    scene(f, (function* () {
      if (nap) {
        yield* tell(TT('¡Shh! Zzz... zzz...', 'Shh! The cat is sleeping...'));
        yield* q(null, '¿Quién duerme?', 'Who is sleeping? (say it softly)', 'gato', ['gato', 'perro', 'conejo']);
        G.ambient.wake(f);
        if (G.animals) G.animals.meet('gato');
        jobStar(f, 'gato', sx, sy);
        yield 40;
      } else { G.ambient.wake(f); yield 20; }
      if (game) yield* soundFound(f);
    })());
    return true;
  };

  // =====================================================================
  //  Gifts and the shops
  // =====================================================================
  const likes = (who, it) => !!G.hearts && G.hearts.LIKES[who] === it.id && !it.q && (who !== 'lucia' || it.col === 'rosa');
  const giftFor = who => (G.hearts && G.hearts.canAddToday(who, 'gift') ? bagS().find(it => likes(who, it)) : null) || (who === 'rosa' && !E.jobDone('huevo') ? bagS().find(it => it.id === 'huevo' && !it.q) : null);
  function* gift(who) {
    const it = giftFor(who); if (!it) return false;
    const egg = it.id === 'huevo' && who === 'rosa';
    yield* say(who, TT('¡Oh! ¿Un regalo? ¿Para mí?', 'Oh! A present? For me?'));
    const r = yield G.choose({ prompt: '¿Para ' + G.nameOf(who).replace(/ (el|la) .*/, '') + '?', en: 'Give it?', show: B.icon(it), choices: words('si', 'no'), layout: 'cards', mic: true });
    if (r.result !== 0) { yield* say(who, TT('¡Oh! Bueno...', 'Oh! All right...')); return true; }
    B.take(it.id, { col: it.col, q: null });
    G.audio.jingle('item');
    yield* say(who, TT('¡[' + it.id + ']! ¡[gracias], {name}!', 'Thank you, {name}!'));
    if (egg) { G.hearts.add('rosa', 1, 'care'); jobStar(G.field, 'huevo', G.W / 2, 90); }
    else G.hearts.add(who, 1, 'gift');
    yield 30;
    yield* G.hearts.milestones(who);
    return true;
  }
  const SHOP = { marta: ['pan', 'galleta'], pepe: ['manzana', 'queso'] };
  function* shop(who) {
    if (!SHOP[who] || !S.done('saludos') || B.full()) return false;
    const items = SHOP[who].filter(k => !B.has(k, { q: null })); if (!items.length) return false;
    yield* say(who, TT('¡[hola]! ¿Qué quieres?', 'Hello! What would you like?'));
    const r = yield G.choose({ prompt: '¿Qué quieres?', en: 'What would you like? (or "no")', choices: words(...items, 'no'), layout: 'cards', mic: true, cancel: true });
    const k = r.result;
    if (k < 0 || k >= items.length) { yield* say(who, TT('¡[adios]!', 'Bye!')); return true; }
    B.add(items[k]);
    yield* say(who, TT('¡Aquí tienes! ¡[' + items[k] + ']!', 'Here you are!'));
    return true;
  }

  // =====================================================================
  //  Who says what (maps.js calls talk / alert for every townsperson)
  // =====================================================================
  // real steps: true when it handled this talk
  const STEP = {
    canelo: function* (who, f) {
      const c = cl();
      if (who === clueWho()) { yield* clueTalk(who); return true; }
      if (who === 'mama' && c.found) { yield* caneloEnd(f); return true; }
      return false;
    },
    picnic: function* (who, f) {
      const c = pc();
      if (who === 'marta' && !c.pan) {
        yield* say('marta', TT('¡[hola], {name}! ¿Qué quieres?', 'Hello, {name}! What would you like?'));
        yield* q('marta', '¿Qué quieres?', 'What would you like? (bread for the picnic)', 'pan', ['pan', 'galleta', 'uvas']);
        yield* q('marta', '¡Aquí tienes!', 'Here you are! (say thank you)', 'gracias', ['gracias', 'hola', 'no'], { show: 'pan' });
        got('pan'); return true;
      }
      if (who === 'pepe' && !c.queso) {
        yield* say('pepe', TT('¡[hola]! ¿Qué quieres?', 'Hello! What would you like?'));
        yield* q('pepe', '¿Qué quieres?', 'What would you like? (cheese for the picnic)', 'queso', ['queso', 'manzana', 'naranja']);
        yield* q('pepe', '¿Cuántos?', 'How many?', 'uno', ['uno', 'dos', 'tres'], { show: 'queso' });
        got('queso');
        yield* say('pepe', TT('¡Un [queso]! ¡[adios]!', 'One cheese! Bye!'));
        return true;
      }
      if (who === 'rosa' && gotAll()) { yield* picnicEnd(f); return true; }
      return false;
    },
    show: function* (who, f) {
      if (!showReady()) return false;
      const c = fl('show');
      if (who === 'nico' && !c.nico) {
        yield* say('nico', TT('¿El show? ¡Mi gato también!', 'The show? My cat is in it too!'));
        yield* q('nico', '¡[miau]! ¿Quién es?', 'Meow! Who is it?', 'gato', ['gato', 'perro', 'conejo']);
        c.nico = 1;
        yield* say('nico', TT('¡Al [parque]! ¡Sofía!', 'To the park! To Sofía!'));
        return true;
      }
      if (who === 'sofia' && c.nico) { yield* showTime(f); return true; }
      return false;
    },
    cansado: function* (who, f) {
      const c = ca();
      if (who === 'rosa' && !c.rosa) { yield* deliver('rosa', 'casa', ['casa', 'escuela', 'biblioteca']); c.rosa = 1; yield* say('rosa', TT('¡Mi [carta]! ¡[gracias]!', 'My letter! Thank you!')); return true; }
      if (who === 'ines' && !c.ines) { yield* deliver('ines', 'biblioteca', ['biblioteca', 'panaderia', 'escuela']); c.ines = 1; yield* say('ines', TT('Shhh... ¡[gracias]!', 'Shhh... thank you!')); return true; }
      if (who === 'pepe' && c.granja === 1 && !B.has('manzana')) {
        yield* say('pepe', TT('¿Una [manzana]? ¿Para el [caballo]?', 'An apple? For the horse?'));
        yield* q('pepe', '¿Qué quieres?', 'What would you like? (an apple for the horse)', 'manzana', ['manzana', 'platano', 'naranja']);
        B.add('manzana', { q: 'cansado' });
        yield* say('pepe', TT('¡Para el [caballo]! ¡Ja, ja!', 'For the horse! Ha ha!'));
        return true;
      }
      if (who === 'tomas' && lettersDone()) { yield* tomasEnd(f); return true; }
      return false;
    },
    cuenta: function* (who) { if (who === 'luna' && countDone()) { yield* cuentaEnd(); return true; } return false; },
    sonidos: function* () { return false; },
    flores: function* (who) { if (who === 'lucia' && !wishLeft().length) { yield* floresEnd(); return true; } return false; },
    fiestab: function* (who) { if (INVITE.includes(who) && invited() < 5 && !fb().inv[who]) { yield* invite(who); return true; } return false; },
  };
  // reminders from the person who asked
  const REMIND = {
    canelo: function* (who) {
      if (who === 'mama') { yield* say('mama', TT('¡Canelo! ¿Dónde está? ¡Busca en el pueblo!', 'Where is Canelo? Look around town!')); return true; }
      if (['gomez', 'lucia', 'tomas'].includes(who)) { yield* say(who, TT('¿Canelo? Mmm... no sé.', 'Canelo? Hmm... I don\'t know.')); return true; }
      return false;
    },
    picnic: function* (who) {
      if (who !== 'rosa') return false;
      const left = FOODS.filter(k => !pc()[k]);
      yield* say('rosa', TT(left.map(k => '[' + k + ']').join(', ') + '... ¿[porfavor]?', 'Still to find: ' + left.map(k => W(k).en.replace('the ', '')).join(', ') + '.'));
      return true;
    },
    show: function* (who, f) {
      if (who === 'sofia' && !showReady()) { yield* showRemind(); return true; }
      if (who === 'sofia') { yield* say('sofia', TT('¿Y Nico? ¡Su [gato]!', 'And Nico? His cat!')); return true; }
      return false;
    },
    cansado: function* (who) {
      if (who !== 'tomas') return false;
      yield* say('tomas', TT('Uf... Mis [carta:cartas]... ¿[porfavor]?', 'Phew... My letters... please?'));
      return true;
    },
    cuenta: function* (who) { if (who !== 'luna') return false; yield* say('luna', TT('¡Toca los animales y cuenta!', 'Tap the animals to count them!')); return true; },
    sonidos: function* (who, f) { if (who !== 'nico') return false; yield* sonidosRemind(f); return true; },
    flores: function* (who) {
      if (who !== 'lucia') return false;
      yield* say('lucia', TT(wishLeft().map(c => '[flor] [' + c + (c === 'blanco' ? ':blanca' : c === 'amarillo' ? ':amarilla' : '') + ']').join(', ') + '... ¿[porfavor]?', 'Still to find: ' + wishLeft().map(c => W(c).en).join(', ') + ' flowers.'));
      return true;
    },
    fiestab: function* (who) {
      if (who !== 'luna') return false;
      yield* say('luna', invited() < 5 ? TT('Di [hola] a [cinco] amigos: ¡la fiesta!', 'Invite five friends!') : TT('¡A la [granja]!', 'To the farm!'));
      return true;
    },
  };
  const START = { canelo: caneloStart, picnic: picnicStart, show: showStart, cansado: tomasStart, cuenta: cuentaStart, sonidos: sonidosStart, flores: floresStart, fiestab: fiestaStart };
  const OFFER_ICON = { canelo: true, picnic: 'canasta', show: 'cinta', cansado: 'cansado', cuenta: 'pregunta', sonidos: 'nota', flores: 'triste', fiestab: 'estrella' };

  E.talk = function* (who, f) {
    if (!G.state) return false;
    f = f || G.field;
    for (const id of ORDER) if (S.active(id) && STEP[id] && (yield* STEP[id](who, f))) return true;
    for (const id of ORDER) if (D().quests[id].giver === who && E.offer(id)) { yield* START[id](f); return true; }
    if (G.pet && G.pet.canTeach(who) && !E.lost()) { yield* G.pet.teach(G.pet.canTeach(who), who); return true; }
    if (yield* gift(who)) return true;
    for (const id of ORDER) if (S.active(id) && REMIND[id] && (yield* REMIND[id](who, f))) return true;
    if (yield* shop(who)) return true;
    return false;
  };
  // the thought bubble over someone: what an errand needs from them, a trick to teach, a new errand, a present
  const ALERT = {
    canelo: who => (who === clueWho() ? 'perro' : who === 'mama' && cl().found ? true : null),
    picnic: who => (who === 'marta' && !pc().pan ? 'pan' : who === 'pepe' && !pc().queso ? 'queso' : who === 'rosa' && gotAll() ? true : null),
    show: who => (!showReady() ? null : who === 'nico' && !fl('show').nico ? 'gato' : who === 'sofia' && fl('show').nico ? true : null),
    cansado: who => {
      const c = ca();
      return who === 'rosa' && !c.rosa ? 'carta' : who === 'ines' && !c.ines ? 'carta' : who === 'pepe' && c.granja === 1 && !B.has('manzana') ? 'manzana' : who === 'tomas' && lettersDone() ? true : null;
    },
    cuenta: who => (who === 'luna' && countDone() ? true : null),
    sonidos: () => null, // (Nico walks with you and makes the sound again now and then)
    flores: who => (who === 'lucia' && !wishLeft().length ? true : null), // (the flowers she still wants shine around town)
    fiestab: who => (INVITE.includes(who) && invited() < 5 && !fb().inv[who] ? 'carta' : null),
  };
  // an errand step that should come before someone's Round A lines (Tomás's clue while his letter errand waits...)
  E.urgent = function (who) {
    if (!G.state) return null;
    for (const id of ORDER) if (S.active(id) && ALERT[id]) { const a = ALERT[id](who); if (a) return a; }
    return null;
  };
  E.alert = function (who) {
    if (!G.state) return false;
    for (const id of ORDER) if (S.active(id) && ALERT[id]) { const a = ALERT[id](who); if (a) return a; }
    for (const id of ORDER) if (D().quests[id].giver === who && E.offer(id)) return OFFER_ICON[id];
    if (G.pet && G.pet.canTeach(who) && !E.lost()) return G.pet.canTeach(who);
    const g = giftFor(who); if (g) return [[B.icon(g), 1]];
    return false;
  };
  // Canelo's own bubble: his empty bowl at home
  E.caneloAlert = () => false; // (his bowl has its own bubble)

  // =====================================================================
  //  Hooks: animals tapped, the fountain, every frame
  // =====================================================================
  if (G.animals) {
    const orig = G.animals.tapped;
    G.animals.tapped = function (f, a) {
      const p = f.player, here = { x: p.x, y: p.y, animal: a.kind };
      const [sx, sy] = scr(f, a.x, a.y - 14);
      // the sound game: the round's animal, with Nico here
      if (E.nicoFollows() && f.npc('nico') && !f.locked) {
        const r = ROUNDS[so().i | 0];
        if (r && r[0] === a.kind) { G.animals.react(f, a); G.animals.cry(a.kind); scene(f, soundFound(f)); return here; }
        if (r && a.kind !== r[0]) { const n = f.npc('nico'); if (n && f.amb) f.amb.fx.push({ kind: 'say', s: '¡No! ¡Escucha!', o: n, dx: 0, t: 0, life: 70 }); soundAt = G.frame + 60; }
      }
      // the count: a number instead of the name, once per animal
      if (S.active('cuenta') && !a._cu && E.COUNT.some(([k]) => k === a.kind) && counted(a.kind) < E.COUNT.find(([k]) => k === a.kind)[1]) {
        a._cu = 1; G.animals.react(f, a); G.animals.cry(a.kind); G.animals.meet(a.kind);
        count(f, a.kind, sx, sy);
        return { x: Math.floor(a.x / T), y: Math.floor(a.y / T), animal: a.kind };
      }
      const out = orig(f, a);
      // pet the horse: tap him from close by (once a day, a star)
      if (a.kind === 'caballo' && Math.abs(Math.floor(a.x / T) - p.x) + Math.abs(Math.floor((a.y - 4) / T) - p.y) <= 3 && S.done('saludos') && jobStar(f, 'caballo', sx, sy - 10)) {
        for (let i = 0; i < 3; i++) f.zoo.fx.push({ k: 'heart', x: a.x - 10 + i * 10, y: a.y - 22 - i * 3, t: -i * 8, life: 60 });
      }
      return out;
    };
  }
  if (G.world) {
    const orig = G.world.nameTile;
    G.world.nameTile = function (f, x, y, o) {
      const id = G.world.wordAt(f, x, y);
      if (id === 'fuente' && G.state && S.active('cuenta') && counted('pez') < 1 && G.animals) {
        const fish = G.animals.find('pez', f); if (fish) G.animals.jump(fish, f);
        G.animals.meet('pez'); count(f, 'pez', ...tileScr(f, x, y));
        return true;
      }
      return orig(f, x, y, o);
    };
  }

  let barkT = 0, soundAt = 0;
  E.update = function (f) {
    if (!G.state) return;
    if (popIn && ++popIn.t > 50) popIn = null;
    if (f.mapId !== 'villa') return;
    // Tomás sits tired by the plaza bench while his errand is waiting or on
    const tn = f.npc('tomas');
    if (tn && E.tomasTired() && !tn._tired && !tn.moving && !f.locked) { tn._tired = true; tn.route = null; tn.x = 21; tn.y = 12; tn.ox = tn.oy = 0; tn.home = [21, 12]; tn.dir = 'down'; tn.wander = 0; }
    // the party: the guests wait by the barn once everything is ready
    if (S.active('fiestab') && decorated() && fedAll() && !f.partyWait && !f.locked) { f.partyWait = stage(f, partyPlaces()); }
    // Nico makes the sound again now and then (and right after a wrong animal)
    if (E.nicoFollows() && G.top() === f && !f.locked && f.npc('nico')) {
      if (!soundAt) soundAt = G.frame + 600;
      if (G.frame >= soundAt) { soundAt = G.frame + 600; playSound(f, so().i | 0); }
    }
    // Canelo barks in the barn
    if (S.active('canelo') && cl().clue >= 3 && !cl().found && G.top() === f && ++barkT % 150 === 0) {
      const d = V('granjaDoor'), p = f.player;
      if (Math.abs(p.x - d[0]) + Math.abs(p.y - d[1]) < 12) { G.pet.sound('bark'); G.fx.say('¡Guau!', ...tileScr(f, d[0], d[1] - 1), '#ffffff'); }
    }
  };

  // =====================================================================
  //  Drawing
  // =====================================================================
  // flowers (bigger than the tile's own), the picnic blanket, the barn ribbons, the milk pail
  E.drawUnder = function (f, ctx) {
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (f.mapId !== 'villa') return;
    for (const sp of E.SPOTS) if ((sp.flower || sp.id === 'gold') && spotIcon(sp)) {
      const x = sp.at[0] * T - cx, y = sp.at[1] * T - cy, gold = sp.id === 'gold', bob = Math.round(Math.sin((f.t + sp.at[0] * 9) / 14));
      ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(x + 6, y + 19, 12, 2);
      G.drawIcon16(ctx, flowerPic(sp.flower || 'amarillo', gold), x + 4, y + 2 + bob);
      if ((f.t + sp.at[0] * 13) % 70 < 10 || gold) { const k = (f.t % 40) / 40; ctx.fillStyle = gold ? '#fff8b0' : '#ffffff'; ctx.fillRect(x + 16 + Math.round(k * 3), y + 1, 1, 3); ctx.fillRect(x + 15 + Math.round(k * 3), y + 2, 3, 1); }
      // the butterfly on the last flower Lucía wants
      if (S.active('flores') && !fo().bfly && wishLeft().length === 1 && sp.flower === wishLeft()[0]) drawFly(ctx, x + 12, y + 2 + Math.round(Math.sin(f.t / 10)), f.t);
    }
    if (f.bfly) { const b = f.bfly; b.t++; if (b.t > 120) f.bfly = null; else drawFly(ctx, b.x - cx + b.t * 1.2, b.y - cy - b.t * 0.9 + Math.sin(b.t / 5) * 4, f.t); }
    // the pail by the paddock gate (the picnic's milk)
    if (S.active('picnic') && !pc().leche) G.drawIcon16(ctx, 'cubeta', 39 * T - cx + 4, 12 * T - cy - 2);
    // the picnic: a red checked blanket in the park, the food on it
    if (f.picnic) {
      const x = 14 * T - cx, y = 20 * T - cy + 4, w = 3 * T;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) { ctx.fillStyle = (i + j) & 1 ? '#f8f0e8' : '#d83838'; ctx.fillRect(x + i * 8, y + j * 4, 8, 4); }
      ctx.fillStyle = '#802020'; ctx.fillRect(x, y + 16, w, 1);
      f.picnic.food.forEach((k, i) => G.drawIcon16(ctx, k, x + 2 + i * 14, y - 2));
    }
    // ribbons on the barn: the party
    const deco = Math.min(RIBBONS.length, S.done('fiestab') || S.active('fiestab') ? (S.done('fiestab') ? RIBBONS.length : fb().deco | 0) : 0);
    if (deco) {
      const d = V('granjaDoor'), x0 = (d[0] - 3) * T - cx, y0 = (d[1] - 1) * T - cy + 4;
      for (let i = 0; i < 6 * T; i += 6) { const yy = y0 + Math.round(Math.sin(i / (6 * T) * Math.PI) * 8); ctx.fillStyle = '#5a3818'; ctx.fillRect(x0 + i, yy, 6, 1); const col = W(RIBBONS[(i / 6) % deco]).col; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0 + i, yy + 1); ctx.lineTo(x0 + i + 5, yy + 1); ctx.lineTo(x0 + i + 2.5, yy + 6); ctx.fill(); }
    }
  };
  function drawFly(ctx, x, y, t) {
    const o = (t >> 3) & 1;
    ctx.fillStyle = '#201828'; ctx.fillRect(Math.round(x), Math.round(y) - 2, 1, 5);
    ctx.fillStyle = '#f8a020'; ctx.fillRect(Math.round(x) - 3 + o, Math.round(y) - 3, 3 - o, 3); ctx.fillRect(Math.round(x) + 1, Math.round(y) - 3, 3 - o, 3);
    ctx.fillStyle = '#f8d060'; ctx.fillRect(Math.round(x) - 2 + o, Math.round(y), 2, 2); ctx.fillRect(Math.round(x) + 1, Math.round(y), 2, 2);
  }
  // picture bubbles over the places to go
  E.drawTop = function (f, ctx) {
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), seen = {};
    for (const sp of E.spots(f)) {
      if (sp.quiet) continue;
      const k = sp.at.join(); if (seen[k]) continue; seen[k] = 1;
      G.drawAlert(ctx, spotIcon(sp), sp.at[0] * T - cx, sp.at[1] * T - cy + 4, f.t);
    }
  };
  // the bag (top-left), and Luna's clipboard while counting
  E.drawHud = function (f, ctx) {
    if (!G.state || f.locked || G.top() !== f || (G.hint && G.hint.stripShowing())) return;
    const L = bagS();
    let y = 4;
    if (L.length) {
      const w = 26 + L.length * 15;
      G.win(ctx, 4, y, w, 22, { alpha: 0.9 });
      G.drawIcon16(ctx, 'bolsa', 8, y + 3);
      L.forEach((it, i) => {
        const pop = popIn && popIn.it === it ? Math.round(Math.sin(Math.min(1, popIn.t / 20) * Math.PI) * -6) : 0;
        G.drawIcon16(ctx, B.icon(it), 26 + i * 15, y + 3 + pop);
      });
      y += 24;
    }
    if (S.active('cuenta') && f.mapId === 'villa') {
      const n = E.COUNT.length, w = 8 + n * 22;
      G.win(ctx, 4, y, w, 30, { fill1: '#f4ecd8', fill2: '#e0d4b8', alpha: 1 });
      E.COUNT.forEach(([k, tot], i) => {
        const x = 9 + i * 22, c = counted(k);
        ctx.globalAlpha = c >= tot ? 1 : 0.75; G.drawIcon16(ctx, k, x, y + 3); ctx.globalAlpha = 1;
        for (let j = 0; j < tot; j++) { ctx.fillStyle = j < c ? '#e0a010' : '#c8bca0'; ctx.fillRect(x + 1 + j * 5, y + 22, 4, 4); }
        if (c >= tot) G.text(ctx, '\u0005', x + 11, y + 1, '#e0a010', '#5a2c04');
      });
    }
  };

  // ---------- Misiones: an active errand's steps, ticked off ----------
  // -> [{icon, done}] in the order of its goal pictures
  E.parts = function (id) {
    const tick = (list) => list.map(([icon, done]) => ({ icon, done: !!done }));
    switch (id) {
      case 'canelo': { const c = cl(); return tick([['huella', c.paw], ['pelota', c.ball], ['granja', c.found], ['casa', false]]); }
      case 'picnic': return tick(FOODS.map(k => [k, pc()[k]]));
      case 'show': return tick(SHOW.map(([t]) => [t, G.pet.knows(t)]).concat([['gato', fl('show').nico]]));
      case 'cansado': { const c = ca(); return tick([['casa', c.rosa], ['granja', c.granja === 2], ['biblioteca', c.ines]]); }
      case 'cuenta': return tick(E.COUNT.map(([k, n]) => [k, counted(k) >= n]));
      case 'sonidos': return tick(ROUNDS.map(([, s], i) => [s, (so().i | 0) > i]).concat([['guau', (so().i | 0) >= 5]]));
      case 'flores': return tick(WISH.map(c => [flowerPic(c), fo().got && fo().got[c]]));
      case 'fiestab': { const c = fb(); return tick([['hola', invited() >= 5], [{ icon: 'cinta', col: '#e03028' }, decorated()], ['pan', c.fed.patos], ['agua', c.fed.caballo], ['gallina', c.fed.gallinas], ['estrella', false]]); }
    }
    return null;
  };
})();
