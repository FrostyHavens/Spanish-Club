// ===== En casa, what stays to do every day once the story is played (docs/UNIT_EN_CASA.md) =====
// ¿Qué hay de comer? Once a day Papá's pot has a bubble: he asks what she wants (a phrase, or a picture question), she
// sets the table by listening, the dish is served on the table for the rest of the day, and the family eats. Papá's
// board for listen-and-do ("Dame dos platos."), Leo's and Papá's favours, the day's play (a lime, an avocado, the dog's
// digging spot, the meal) and the two notebook page puzzles in the kitchen.
// Only words she has met are used. This file loads before src/phrases.js, src/listen.js and src/guide.js: what they
// make is only looked up inside the scenes, never when the file loads.
// Saved: G.state.hogar = { day (the game day the meal was served), dish (the word on the table) }.
'use strict';
(function () {
  const K = G.mapKit, CH = G.chapters, MD = G.MAPDATA, RQ = G.requests;
  const T = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const P = (m, tag) => MD[m].pos[tag];
  const say = (who, show, ...pages) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, show ? { show } : {}));
  RQ.LINES['hogar.escucha'] = id => '¡{name}! ' + RQ.the(id, { cap: 1, bang: 1 }) + ' ¡Escucha!'; // ¡{name}! ¡La [mesa]! ¡Escucha!
  const FOODS = ['sopa', 'tortilla', 'frijoles', 'taco', 'arroz', 'aguacate'];
  const day = () => G.words.day();

  // ---------- the notebook's page puzzles in the kitchen (words.js pagePlaces) ----------
  G.maps.cocina.pages = K.pages('cocina');

  // ---------- Papá's board (listen and do) ----------
  RQ.SPECS.papa = { things: {
    plato: { cols: ['azul', 'rojo', 'amarillo'], count: 1 }, vaso: { cols: ['azul', 'rojo', 'verde'], count: 1 }, cuchara: { count: 1 },
    limon: { count: 1 }, tortilla: { count: 1 } } };
  G.favores.OFFERS.push(['papa', 'listen', null, () => CH.done('hogar2')]);

  // ---------- Leo's and Papá's favours ----------
  const FV = G.favores;
  // Leo's heap in the patio: limes once she has met them, else the tacos
  Object.defineProperty(FV.COUNT_OF, 'leo', { enumerable: true, get: () => (G.words.met('limon') ? 'limon' : 'taco') });
  FV.THINGS.leo = ['taco', 'tortilla', 'frijoles', 'sopa', 'plato', 'vaso', 'cuchara', 'mesa', 'silla'];
  FV.THINGS.papa = ['plato', 'vaso', 'cuchara', 'mesa', 'silla', 'sopa', 'tortilla', 'frijoles', 'arroz', 'taco', 'aguacate', 'limon'];
  FV.OFFERS.push(
    ['leo', 'count', ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis'], () => CH.done('hogar3')],
    ['leo', 'thing', FV.THINGS.leo, () => CH.done('hogar3')],
    ['papa', 'thing', FV.THINGS.papa, () => CH.done('hogar1')]);
  Object.assign(G.carry.DOG, { tortilla: 'eat', taco: 'eat' }); // (what Canelo may taste)

  // ---------- ¿Qué hay de comer? ----------
  const st = () => { const s = G.state; if (!s.hogar || typeof s.hogar !== 'object') s.hogar = { day: -1, dish: null }; return s.hogar; };
  const busy = () => !!CH.current('hogar'); // (a home chapter going on: the story first. A town chapter left half-done must not hide the pot for days)
  const holdsGift = () => { const h = G.carry && G.carry.held(); return !!h && !!G.hearts && G.hearts.likes('papa', h.id) && G.hearts.canAddToday('papa', 'gift'); };
  const served = () => !!G.state && !!G.state.hogar && G.state.hogar.day === day();
  // The guide plans the day's play (and the bubble over the pot asks) many times a frame, so the answers are worked out once for
  // each moment of a frame and each game day (G.pulse, core.js; between frames, in a test or a tool, always afresh)
  let memo = null;
  const once = (key, fn) => {
    const p = G.pulse, s = G.state;
    if (!p || !s) return fn();
    const d = day();
    if (!memo || memo.p !== p || memo.s !== s || memo.d !== d) memo = { p, s, d, v: Object.create(null) };
    return key in memo.v ? memo.v[key] : (memo.v[key] = fn());
  };
  const mealOn = () => once('meal', () => !!G.state && CH.done('hogar1') && !served() && !busy() && !CH.beatFor('papa') && !holdsGift());
  G.hogar = { mealOn, dish: () => (served() ? G.state.hogar.dish : null) };

  // the foods to ask about: two or three she has met, the due ones first, then the others turning by the day
  const foods = () => once('foods', foodsNow);
  function foodsNow() {
    const met = FOODS.filter(id => G.words.met(id) && G.iconDrawn(id));
    const due = G.review.due(1e9, { filter: id => met.includes(id) });
    const rest = met.filter(id => !due.includes(id)), k = rest.length ? day() % rest.length : 0;
    return due.concat(rest.slice(k), rest.slice(0, k)).slice(0, 3);
  }
  // (a) "¿Qué quieres?": Quiero ___ (the foods' cards), or the old way: the picture question
  function* wants(list) {
    let dish = list[0];
    const ph = G.phrase ? yield* G.phrase.quiero('papa', list, { onGet: function* (k) {
      dish = list[k];
      yield say('papa', dish, T('¡Perfecto! ¡Ya casi!', 'Perfect! Almost ready!'));
    } }) : null;
    if (ph) return dish;
    if (list.length > 1) {
      const c = G.wordChoices(dish, list, list.length);
      yield* G.ask({ prompt: '¿Qué quieres?', en: 'What would you like? (tap the one you want)', choices: c.choices, answer: c.answer, layout: 'cards', who: 'papa', review: true });
    } else yield* G.review.ask(dish, { who: 'papa' });
    return dish;
  }
  // (b) the table, by listening: two requests on Papá's board, else one review of a kitchen word
  function* table() {
    const L = G.listen, spec = RQ.spec('papa');
    if (L && L.on() && RQ.make(spec, {})) {
      yield say('papa', { icon: 'escucha' }, T(RQ.LINES['hogar.escucha']('mesa'), 'The table! Listen to what I ask, then do it.'));
      yield* L.round(spec, { who: 'papa', focus: L.focus(spec), n: 2 });
      return;
    }
    const id = G.review.next({ filter: w => W(w).topic === 'cocina' && G.iconDrawn(w) && G.review.fresh(w) });
    if (id) yield* G.review.ask(id, { who: 'papa' });
  }
  function* meal(f) {
    const list = foods(); if (!list.length) return;
    yield say('papa', 'cocina', T('¡{name}! ¿Qué quieres?', 'What would you like?'));
    const dish = yield* wants(list);
    if (G.pet && G.pet.mine()) yield* G.pet.play('sniff'); // (the dog smells the pot: something happens on the map)
    if (CH.done('hogar2')) yield* table();
    // (c) served on the table, for the rest of the day
    st().day = day(); st().dish = dish; G.st.autosave();
    G.audio.sfx('pop');
    yield 20;
    yield say('papa', dish, G.words.met('come') ? T('¡[come], {name}!', 'Eat up, {name}!') : T('¡Buen provecho, {name}!', 'Enjoy your meal, {name}!'));
    if (G.hearts) { G.hearts.add('papa', 1, 'care'); yield* G.hearts.milestones('papa'); }
    if (G.pet && G.pet.mine()) { yield* G.pet.play('eat', { item: 'hueso' }); if (G.hearts) G.hearts.add('canelo', 1, 'care'); }
  }
  // Papá's bubble (the pot) and his talk: the story and a present she holds for him first, then the meal
  const papa = G.maps.cocina.npcs.find(n => n.id === 'papa'), alert0 = papa.alert, talk0 = papa.talk;
  papa.alert = function () { return mealOn() ? { icon: 'cocina' } : alert0.apply(this, arguments); };
  papa.talk = function* (f, n) {
    if (!mealOn()) { yield* talk0.call(this, f, n); return; }
    yield* K.hello('papa');
    yield* meal(f);
  };
  // the dish on the table (carry.js draws what lies about, under the people: this goes with it)
  const du = G.carry.drawUnder;
  G.carry.drawUnder = function (f, ctx) {
    du.apply(this, arguments);
    if (f.mapId !== 'cocina' || !served() || busy() || !W(G.state.hogar.dish)) return; // (not while a home chapter has its own things on the table)
    const [tx, ty] = P('cocina', 'table'), X = (tx + 1) * G.TILE - Math.round(f.cam.x) + 4, Y = ty * G.TILE - Math.round(f.cam.y) - 1;
    G.drawIcon16(ctx, W(G.state.hogar.dish), X, Y);
  };

  // ---------- the day's play (carry.js): a lime and an avocado for Papá, the dog's digging, the meal ----------
  const C = G.carry, started = () => CH.done('hogar1');
  const fruit = (item, ids, who) => f => {
    if (!started()) return null;
    const w = C.likerFor({ id: item }); if (w !== 'papa') return null;
    const s = C.SOURCES.find(o => ids.includes(o.id) && C.avail(o.id)); if (!s) return null;
    return { why: who, map: s.map, at: s.at, icon: W(item), pick: true };
  };
  C.PLAYS.limon = fruit('limon', ['limon_patio1', 'limon_patio2'], 'a lime for Papá');
  C.PLAYS.aguacate = fruit('aguacate', ['aguacate_patio1'], 'an avocado for Papá');
  C.PLAYS.excavar = () => {
    const sp = (G.maps.patio.dogSpots || [])[0];
    return started() && sp && G.pet && G.pet.mine() && G.zones.dogReady(sp) ? { why: 'dig with Canelo', map: 'patio', at: sp.at, icon: W('hueso') } : null;
  };
  C.PLAYS.comida = () => (mealOn() && foods().length ? { why: 'lunch with Papá', who: 'papa', icon: 'cocina' } : null);
  C.ORDER.push('limon', 'aguacate', 'excavar', 'comida');

  // ---------- Tonight's question (the Learning page, src/dashboard.js reads G.tplMore) ----------
  const bare = id => W(id).es.replace(/^(el|la|los|las) /, '');
  G.tplMore = [
    ['hambre', id => id === 'hambre' ? { es: '¿Tienes hambre?', en: 'Are you hungry?', ans: { es: 'Sí, tengo hambre. / No.', en: 'Yes, I\'m hungry. / No.' }, words: [id] } : null],
    ['sed', id => id === 'sed' ? { es: '¿Tienes sed?', en: 'Are you thirsty?', ans: { es: 'Sí, tengo sed. / No.', en: 'Yes, I\'m thirsty. / No.' }, words: [id] } : null],
    ['comer', id => {
      if (!FOODS.includes(id)) return null;
      const n = RQ.noun(id), mass = (G.data.mass || []).includes(id);
      const what = mass || n.plOnly ? bare(id) : (n.g === 'f' ? 'una ' : 'un ') + bare(id);
      return { es: '¿Qué quieres comer?', en: 'What do you want to eat?', ans: { es: 'Quiero ' + what + '.', en: 'I want ' + W(id).en.replace(/^the /, (mass || n.plOnly) ? '' : /^the [aeiou]/.test(W(id).en) ? 'an ' : 'a ') + '.' }, words: [id] };
    }],
  ];
})();
