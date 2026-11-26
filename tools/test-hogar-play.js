// En casa, what stays to do every day (content/es/hogar-play.js, docs/UNIT_EN_CASA.md): ¿Qué hay de comer? once a day
// (what she wants, the table by listening, the dish served on the table, hearts), Papá's board and favours, Leo's
// favours, a lime for Papá, the day's play, the two notebook pages in the kitchen. The chapters themselves are
// written elsewhere: here they are set as done, with their words met, the way other tests set up a save.
// NODE_PATH=$(npm root -g) node tools/test-hogar-play.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

const HW = {
  hogar1: ['elpapa', 'cocina', 'hambre', 'sopa', 'rico'], hogar2: ['mesa', 'silla', 'plato', 'vaso', 'cuchara'],
  hogar3: ['hermano', 'tortilla', 'frijoles', 'taco', 'come'], hogar4: ['lamama', 'sed', 'limon', 'aguacate', 'arroz'],
};
const BASE = ['hola', 'gracias', 'si', 'no', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'rojo', 'azul', 'amarillo', 'verde', 'hueso', 'pelota', 'perro'];

// a game on a map: the home chapters in o.ch done with their words known (met yesterday, not due unless o.due)
const game = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route;
  G.debug.dayShift = -1;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']) G.state.quests[id] = 'done';
  const words = o.words.concat(o.base);
  for (const id of o.ch) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
  W.newSession('new');
  G.state.album.perro = { first: 1, map: 'villa', n: 1 }; // (in the album already: no "¡Nuevo animal!" over the screenshots)
  for (const id of words) W.meet(id, 'test');
  G.debug.dayShift = 0; W.newSession('load');
  for (const id of words) Object.assign(W.rec(id), { st: 2, box: 2, fu: 0, due: null, dd: W.day() + 3, dc: W.dayNum() + 3, ld: W.dayNum() - 1 });
  for (const id of o.due || []) Object.assign(W.rec(id), { dd: W.day(), dc: W.dayNum() });
  G.cards.grow = grow;
  G.state.ch.lastDoneSess = G.words.sess();
  G.demo.skip();
  G.goto(o.map || 'cocina', o.x == null ? 6 : o.x, o.y == null ? 3 : o.y, 'down');
}, o);
// the chapters 1..n done, their words known
const upto = n => { const ch = [], words = []; for (let i = 1; i <= n; i++) { ch.push('hogar' + i); words.push(...HW['hogar' + i]); } return { ch, words, base: BASE }; };
const settle = (g, what) => g.drive(() => window.free(), what);
async function tapNpc(g, id, dx = 1, dy = 0) {
  await g.ev(([id, dx, dy]) => { const n = G.field.npc(id), p = G.field.player; p.x = n.x + dx; p.y = n.y + dy; p.ox = p.oy = 0; p.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down'; G.field.route = null; G.field.snapCam(); }, [id, dx, dy]);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
const papa = g => tapNpc(g, 'papa', 0, 1);
const hearts = (g, who) => g.ev(w => G.hearts.get(w), who);
const nextDay = g => g.ev(() => { G.debug.dayShift++; G.words.newSession('load'); for (const id of G.words.list(1)) Object.assign(G.words.rec(id), { due: null, ds: null, dd: G.words.day() + 3, dc: G.words.dayNum() + 3 }); G.budget.flush(); G.goto('cocina', 6, 3, 'down'); });
// count what a talk asks: phrases and trays
const spy = g => g.ev(() => { window.__q = { phrase: 0, listen: 0, ask: 0, dog: [] }; const pr = G.phrase.request; G.phrase.request = function* () { const r = yield* pr.apply(this, arguments); if (r !== null) window.__q.phrase++; return r; }; const lr = G.listen.run; G.listen.run = function* () { window.__q.listen++; return yield* lr.apply(this, arguments); }; const ga = G.ask; G.ask = function* (o) { if (o && o.who === 'papa') window.__q.ask++; return yield* ga.apply(this, arguments); }; const pp = G.pet.play; G.pet.play = function (k) { window.__q.dog.push(k); return pp.apply(this, arguments); }; });
const q = g => g.ev(() => window.__q);

// ---------- nothing before hogar1 ----------
async function before(browser) {
  const { ctx, g } = await open(browser, 'hogar-before', true);
  try {
    await game(g, { ch: [], words: [], base: BASE });
    await g.fieldIdle('cocina');
    check('before: Papá has no bubble and the meal is not on', await g.ev(() => !G.hogar.mealOn() && !G.field.npc('papa').alert()));
    await papa(g); await settle(g, 'Papá greets');
    check('before: Papá only greets: no meal, no dish', await g.ev(() => !G.hogar.dish() && !G.state.hogar));
    check('before: nobody offers favours from Papá or Leo, no plays for the home line', await g.ev(() => { const l = G.favores.today(); return !l.some(v => v.who === 'papa' || v.who === 'leo') && !G.carry.PLAYS.comida() && !G.carry.PLAYS.limon({}) && !G.carry.PLAYS.excavar(); }));
    check('before: the page sparkles do not show (no words known)', await g.ev(() => !G.pages.ready('cocina') && !G.pages.ready('acomer')));
    check('before: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the meal with only hogar1 done: soup, the old way (phrases and listen off) ----------
async function mealOne(browser) {
  const { ctx, g } = await open(browser, 'hogar-meal1', true);
  try {
    await game(g, upto(1));
    await g.fieldIdle('cocina');
    await settle(g, 'the first cards'); await g.frames(30);
    check('meal 1: Papá\'s bubble is the pot (a picture)', await g.ev(() => { const a = G.field.npc('papa').alert(); return !!a && a.icon === 'cocina' && G.hogar.mealOn(); }));
    check('meal 1: the guide leads to him', await g.ev(() => /papa/.test((G.guide.goal(G.field) || {}).why || '')), await g.ev(() => JSON.stringify((G.guide.goal(G.field) || {}).why)));
    check('meal 1: and the meal is one of the day\'s plays', await g.ev(() => { const o = G.carry.ORDER.slice(); G.carry.ORDER.splice(0, o.length, 'comida'); const p = G.carry.plan(G.field); G.carry.ORDER.splice(0, 1, ...o); return !!p && p.who === 'papa'; }));
    await g.shot('pot_bubble');
    const h0 = await hearts(g, 'papa');
    await spy(g);
    await papa(g);
    await g.until(() => G.top().constructor.name === 'TextBox' || G.top().constructor.name === 'Choice', null, 'Papá asking');
    await g.frames(30); await g.shot('asks');
    await settle(g, 'the meal');
    const r = await q(g);
    check('meal 1: soup is the only food: one question, the dog smelled the pot and ate', r.phrase === 0 && r.listen === 0 && r.dog.includes('sniff') && r.dog.includes('eat'), JSON.stringify(r));
    check('meal 1: the dish of the day is the soup, on the table', await g.ev(() => G.hogar.dish() === 'sopa'));
    await g.frames(10); await g.shot('served');
    check('meal 1: Papá got a heart', await hearts(g, 'papa') > h0);
    check('meal 1: once a day: no pot bubble any more', await g.ev(() => { const a = G.field.npc('papa').alert(); return !G.hogar.mealOn() && !(a && a.icon === 'cocina'); }));
    await papa(g); await settle(g, 'a second hello');
    check('meal 1: the second talk did not serve again', await g.ev(() => G.hogar.dish() === 'sopa'));
    // a new day: the pot is back, the table is bare
    await nextDay(g); await g.fieldIdle('cocina');
    check('meal 1: next day the pot is back and the table is bare', await g.ev(() => G.hogar.mealOn() && !G.hogar.dish() && !!G.field.npc('papa').alert()));
    await papa(g); await settle(g, 'the meal again');
    check('meal 1: and served again', await g.ev(() => G.hogar.dish() === 'sopa'));
    check('meal 1: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hogar1 and 2: the table by listening, then the dish ----------
async function mealTwo(browser, on) {
  const { ctx, g } = await open(browser, 'hogar-meal2' + (on ? 'on' : 'off'), true, { phrases: on, listen: on });
  try {
    await game(g, upto(2));
    await g.fieldIdle('cocina');
    await spy(g);
    await papa(g); await settle(g, 'the meal');
    const r = await q(g);
    if (on) check('meal 1-2 (listen on): two requests on Papá\'s board, the dog ate', r.listen === 2 && r.dog.includes('eat'), JSON.stringify(r));
    else check('meal 1-2 (listen off): no tray; a review of a kitchen word; the dog ate', r.listen === 0 && r.phrase === 0 && r.dog.includes('eat'), JSON.stringify(r));
    check('meal 1-2: the soup is on the table', await g.ev(() => G.hogar.dish() === 'sopa'));
    if (on) await g.shot('served_12');
    check('meal 1-2: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- all four done: the dish turns among the foods she has met ----------
async function mealAll(browser, on) {
  const { ctx, g } = await open(browser, 'hogar-meal4' + (on ? 'on' : 'off'), true, { phrases: on, listen: on });
  try {
    await game(g, Object.assign(upto(4), { due: ['taco', 'tortilla', 'plato', 'vaso'] }));
    await g.fieldIdle('cocina');
    const list = await g.ev(() => { const met = ['sopa', 'tortilla', 'frijoles', 'taco', 'arroz', 'aguacate'].filter(G.words.met), due = G.review.due(1e9, { filter: id => met.includes(id) }); return { met, due }; });
    check('meal 4: six foods are known and the due ones are taco and tortilla', list.met.length === 6 && list.due.includes('taco') && list.due.includes('tortilla'), JSON.stringify(list));
    await spy(g);
    await g.ev(() => { window.__dish = null; });
    await papa(g);
    // she asks for the taco (the 1st food shown is a due one: free phrase, any card is right)
    await settle(g, 'the meal');
    const r = await q(g);
    check('meal 4: ' + (on ? 'the phrase and two requests' : 'the picture question') + ', then the dog ate', on ? ((r.phrase >= 1 || r.ask >= 1) && r.listen === 2 && r.dog.includes('eat')) : (r.phrase === 0 && r.listen === 0 && r.ask >= 1 && r.dog.includes('eat')), JSON.stringify(r));
    const dish = await g.ev(() => G.hogar.dish());
    check('meal 4: a food she knows is on the table (' + dish + ')', ['sopa', 'tortilla', 'frijoles', 'taco', 'arroz', 'aguacate'].includes(dish) && ['taco', 'tortilla'].includes(dish), String(dish));
    await g.frames(10); await g.shot('served_' + (on ? 'on' : 'off'));
    // "¡Come!" is said once come is met
    check('meal 4: the line used the word come', await g.ev(() => G.words.met('come')));
    check('meal 4: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the story first: no meal while a chapter is going on ----------
async function storyFirst(browser) {
  const { ctx, g } = await open(browser, 'hogar-story', true);
  try {
    await game(g, upto(1));
    await g.fieldIdle('cocina');
    await g.ev(() => { G.state.quests.c9 = 'active'; G.state.ch.step.c9 = 0; });
    check('story first: a town chapter left half-done does not hide the pot', await g.ev(() => !!G.chapters.current('villa') && G.hogar.mealOn()));
    await g.ev(() => { G.state.quests.c9 = 'done'; G.state.quests.hogar2 = 'active'; G.state.ch.step.hogar2 = 0; });
    check('story first: a home chapter going on: the pot has no bubble and the meal is off', await g.ev(() => !!G.chapters.current('hogar') && !G.hogar.mealOn() && !G.carry.PLAYS.comida()));
    check('story first: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- Papá's board and the favours ----------
async function favours(browser) {
  const { ctx, g } = await open(browser, 'hogar-fav', true, { listen: true });
  try {
    await game(g, Object.assign(upto(4), { due: ['plato', 'vaso', 'cuchara', 'limon', 'tortilla', 'taco', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'mesa', 'silla', 'sopa'] }));
    await g.fieldIdle('cocina');
    check('favours: Papá has a board (plates, glasses, spoons, limes, tortillas) and a listen offer', await g.ev(() => !!G.requests.SPECS.papa && Object.keys(G.requests.SPECS.papa.things).length === 5 && G.favores.OFFERS.some(o => o[0] === 'papa' && o[1] === 'listen')));
    const seen = await g.ev(() => { const s = new Set(), fv = G.favores; for (let i = 0; i < 80; i++) { G.state.fav = { day: -1, list: [], pal: -1 }; for (const v of fv.today()) s.add(v.who + ':' + v.kind); } return [...s]; });
    check('favours: over many days Papá asks to listen and names things; Leo counts and names things', ['papa:listen', 'papa:thing', 'leo:count', 'leo:thing'].every(k => seen.includes(k)), JSON.stringify(seen));
    // Papá's listen favour, played through
    await g.ev(() => { G.state.fav = { day: G.words.day(), list: [{ who: 'papa', kind: 'listen', word: 'plato', done: false, on: false }], pal: -1 }; G.state.hogar = { day: G.words.day(), dish: 'sopa' }; });
    check('favours: Papá\'s favour has the ear bubble (after the meal)', await g.ev(() => { const a = G.field.npc('papa').alert(); return !!a && a.icon === 'escucha'; }));
    const st0 = await g.ev(() => G.state.stars), h0 = await hearts(g, 'papa');
    await spy(g);
    await papa(g); await settle(g, 'Papá\'s requests');
    check('favours: Papá\'s favour: two requests, done, a star and a heart', await g.ev(a => G.favores.today()[0].done && G.state.stars > a, st0) && (await q(g)).listen === 2 && await hearts(g, 'papa') > h0);
    // Papá names a thing
    await g.ev(() => { G.state.fav = { day: G.words.day(), list: [{ who: 'papa', kind: 'thing', word: 'cuchara', done: false, on: false }], pal: -1 }; });
    await papa(g); await settle(g, 'Papá\'s thing');
    check('favours: Papá\'s "¿Qué es?" about the spoon: done', await g.ev(() => G.favores.today()[0].done));
    // Leo: count the limes, name a thing
    await g.ev(() => { G.goto('patio', 7, 5, 'down'); });
    await g.fieldIdle('patio');
    await g.ev(() => { G.state.fav = { day: G.words.day(), list: [{ who: 'leo', kind: 'count', word: 'tres', done: false, on: false }], pal: -1 }; });
    check('favours: Leo\'s bubble asks (a "?")', await g.ev(() => !!G.field.npc('leo').alert()));
    await g.shot('leo_asks');
    await tapNpc(g, 'leo', 0, -1); await settle(g, 'Leo counting');
    check('favours: Leo\'s count (the limes): done', await g.ev(() => G.favores.today()[0].done));
    await g.ev(() => { G.state.fav = { day: G.words.day(), list: [{ who: 'leo', kind: 'thing', word: 'taco', done: false, on: false }], pal: -1 }; });
    await tapNpc(g, 'leo', 0, -1); await settle(g, 'Leo naming');
    check('favours: Leo\'s "¿Qué es?" about the taco: done', await g.ev(() => G.favores.today()[0].done));
    check('favours: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the day's play: a lime for Papá ----------
async function plays(browser) {
  const { ctx, g } = await open(browser, 'hogar-play', true);
  try {
    await game(g, Object.assign(upto(1), { map: 'villa', x: 7, y: 19 }));
    await g.fieldIdle('villa');
    await g.ev(() => { G.state.hogar = { day: G.words.day(), dish: 'sopa' }; G.state.bag.play = { day: G.words.day(), n: { pelota: 9, palo: 9, hueso: 9, carta: 9, huevo: 9, manzana: 9 } }; });
    const where = await g.ev(() => { const o = G.carry.ORDER.slice(), r = {}; for (const id of ['limon', 'aguacate', 'excavar', 'comida']) { G.carry.ORDER.splice(0, G.carry.ORDER.length, id); const p = G.carry.plan(G.field); r[id] = p && (p.map || p.who); } G.carry.ORDER.splice(0, G.carry.ORDER.length, ...o); return r; });
    check('plays: from town the plan reaches the home line: a lime and an avocado in the patio, the dig, (the meal is done today)', where.limon === 'patio' && where.aguacate === 'patio' && where.excavar === 'patio', JSON.stringify(where));
    await g.ev(() => { G.debug.dayShift = 0; });
    // the lime: picked up in the patio, given to Papá for a heart
    await g.ev(() => { G.goto('patio', 7, 4, 'down'); });
    await g.fieldIdle('patio');
    await g.tapTile(7, 3); await g.until(() => !!G.carry.held(), null, 'the lime in hand'); await settle(g, 'the lime\'s name');
    check('plays: a lime is picked up in the patio (its word: a "?" before it is met)', await g.ev(() => G.carry.held().id === 'limon' && !G.words.met('limon')));
    check('plays: the plan with the lime in hand: give it to Papá', await g.ev(() => { const p = G.carry.plan(G.field); return !!p && p.who === 'papa'; }));
    await g.ev(() => { G.goto('cocina', 6, 3, 'down'); });
    await g.fieldIdle('cocina');
    const h0 = await hearts(g, 'papa');
    await papa(g); await settle(g, 'the gift');
    check('plays: the lime given to Papá: a heart, and the hands are empty', await hearts(g, 'papa') > h0 && await g.ev(() => !G.carry.held()));
    check('the Learning page says "an avocado" (not "a avocado"), and tonight\'s lines name the article by code', await g.ev(() => G.tplMore.find(t => t[0] === 'comer')[1]('aguacate').ans.en === 'I want an avocado.' && G.tplMore.find(t => t[0] === 'comer')[1]('tortilla').ans.en === 'I want a tortilla.' && G.requests.LINES['hogar.escucha']('mesa') === '¡{name}! ¡La [mesa]! ¡Escucha!'));
    check('plays: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog's digging spot (patio) ----------
async function dig(browser) {
  const { ctx, g } = await open(browser, 'hogar-dig', true);
  try {
    await game(g, Object.assign(upto(1), { map: 'patio', x: 10, y: 5 }));
    await g.fieldIdle('patio');
    check('dig: the digging spot is ready and a play of the day', await g.ev(() => !!G.carry.PLAYS.excavar() && G.zones.dogReady(G.maps.patio.dogSpots[0])));
    check('dig: the dog is with her in the patio', await g.ev(() => !!G.pet.npc(G.field)));
    await g.ev(() => { const n = G.pet.npc(G.field); n.x = 11; n.y = 6; n.ox = n.oy = 0; n.home = [11, 6]; });
    await g.frames(4);
    await g.tapTile(11, 7);
    await g.until(() => G.carry.held() || G.zones.dogReady(G.maps.patio.dogSpots[0]) === false, null, 'the dog digging', 30000);
    await settle(g, 'digging');
    check('dig: the bone is found', await g.ev(() => !G.zones.dogReady(G.maps.patio.dogSpots[0])));
    check('dig: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the two notebook pages in the kitchen ----------
async function pages(browser) {
  const { ctx, g } = await open(browser, 'hogar-pages', true);
  try {
    await game(g, Object.assign(upto(4), { x: 3, y: 3 }));
    await g.fieldIdle('cocina');
    await g.ev(() => { G.field.banner && (G.field.banner.t = 0); });
    check('pages: both page puzzles are ready, and sit on free tiles', await g.ev(() => {
      const pl = G.maps.cocina.pages, f = G.field, ok = Object.keys(pl).every(k => { const [x, y] = k.split(',').map(Number), t = G.TERRAIN[f.map.get(x, y)]; return !t.block && !f.exitAt(x, y); });
      return ok && pl['1,2'] === 'cocina' && pl['9,7'] === 'acomer' && G.pages.ready('cocina') && G.pages.ready('acomer');
    }));
    await g.ev(() => { G.field.player.x = 3; G.field.player.y = 3; G.field.snapCam(); });
    await g.frames(20); await g.shot('sparkle_fridge');
    await g.ev(() => { G.field.player.x = 8; G.field.player.y = 7; G.field.snapCam(); });
    await g.frames(20); await g.shot('sparkle_crates');
    for (const [pg, x, y, sx, sy] of [['cocina', 1, 2, 2, 2], ['acomer', 9, 7, 8, 7]]) {
      await g.ev(([x, y, sx, sy]) => { const p = G.field.player; p.x = sx; p.y = sy; p.ox = p.oy = 0; p.dir = sx < x ? 'right' : 'left'; G.field.route = null; G.field.snapCam(); }, [x, y, sx, sy]);
      await g.frames(4);
      await g.tapTile(x, y);
      await g.until(() => G.top().constructor.name === 'PagePuzzle', null, 'the ' + pg + ' page puzzle');
      await settle(g, 'the ' + pg + ' page puzzle');
      check('pages: the ' + pg + ' page puzzle is solved', await g.ev(pg => !G.pages.ready(pg), pg));
    }
    check('pages: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- tonight's question ----------
async function tonight(browser) {
  const { ctx, g } = await open(browser, 'hogar-tonight', true);
  try {
    await game(g, upto(4));
    await g.fieldIdle('cocina');
    const t = await g.ev(() => { const L = G.dashboard.tonights(); return L.filter(x => ['hambre', 'sed', 'comer'].includes(x.tpl)).map(x => x.id + ':' + x.es + ' / ' + x.ans.es); });
    check('tonight: home questions come with answers (hambre, sed, a food)', t.some(s => /^hambre:¿Tienes hambre\? \/ Sí, tengo hambre/.test(s)) && t.some(s => /^sed:/.test(s)) && t.some(s => /¿Qué quieres comer\? \/ Quiero /.test(s)), JSON.stringify(t));
    check('tonight: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('En casa: the daily meal and favours', [
  ['nothing before hogar1', before], ['meal after hogar1', mealOne],
  ['meal after hogar1-2, phrases and listen on', b => mealTwo(b, true)], ['meal after hogar1-2, phrases and listen off', b => mealTwo(b, false)],
  ['meal after all four, phrases and listen on', b => mealAll(b, true)], ['meal after all four, phrases and listen off', b => mealAll(b, false)],
  ['the story first', storyFirst], ['Papá\'s board, favours', favours], ['a lime for Papá', plays], ['the dog\'s digging', dig],
  ['the notebook pages', pages], ['tonight\'s question', tonight],
]);
