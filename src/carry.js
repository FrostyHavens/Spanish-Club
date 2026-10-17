// ===== Pick up and carry, and the day's play (docs/PLAYTEST_NOTES.md, 2026-10-11: "I want to be able to pick up stuff";
// "didn't know what to do / ran out of things to do"; "you get to do stuff with the dog: feed him, play fetch") =====
// Things lie about in the world: apples under the apple trees (and in the barn's basket), sticks in the park, Canelo's
// blue ball in front of home, a bone by his cushion every morning, eggs in the barn's hay, the coloured flowers (picked
// with a colour question once Lucía's chapter has taught them: errands.js), a letter Tomás dropped (after his chapter).
// Tap one: you walk up to it and pick it up. You hold it up over your head, its name is said in the word bubble with
// its picture (world.js: a met word is picture + word and a light encounter, with the say-it-back mic; an unmet one is
// its picture and "?", and is never met by this: the new-word budget is untouched). The stick has no word: a toy.
// You hold ONE kind of thing at a time, a small stack of up to three (three apples); picking up something else puts
// what you held down where the new thing was. Tap yourself (or the thing in the corner) to put it down in front of you.
// Things respawn: apples and flowers a few minutes after they're picked, sticks sooner, the bone and the eggs every
// day, the ball when it's nowhere (given away). What you put down stays where you left it (saved).
// Giving: walk to someone and tap them while you hold it. Canelo: the ball and the stick are thrown and he fetches them
// back to you; the bone, a cookie, bread he eats (the bone is his favourite: a gift heart); water he drinks; the rest he
// sniffs (a flower makes him sneeze) and you keep it. People: one who likes it takes it (errands.js gift(): a heart,
// G.hearts.gift); Tomás takes his letter back; anyone else looks at it and says who'd love it (with that friend's face).
// The bag is your hands: the story's things (G.errands.bag items with `q`) are held too and can't be put down or given
// away like this; the corner shows what you hold (picture + word, "?" while unmet), the story's things after it.
//
// The day's play (G.carry.plan(f), read by the guide, src/guide.js, when the story has nothing for now): what you hold
// goes to whoever would love it today (or Canelo, or the ducks); empty-handed, today's next play, in an order that
// changes every day: a game of fetch with the ball, an apple for Luna or Señor Gómez, a flower for Mamá, Rosa or Lucía
// (a pink one), the bone for Canelo, a stick to throw, an egg for Rosa, Tomás's letter, bread from Marta for the ducks,
// a notebook page puzzle that's ready. When everything is done: not endless fetch but, in turn, a trick for Canelo,
// petting him, food or water for him, another round of hide-and-seek, the ball for Nico, fetch (C.more).
// Every play is word-safe: nothing here introduces a word.
//
// API: G.carry.held() -> {id, col, n, it} (your free stack) or null; .at(f, x, y) (what lies on that tile: {ground|src,
//   id, col}); .pick(f, x, y); .drop(f); .giveDog(f, n) / .show(who, f) (generators); .plan(f) -> {why, who | dog |
//   map+at, icon} or null; .SOURCES, .DOG; .tapSelf / .tapHud (field.js taps), .search (field.js), .makeRoom (errands.js
//   bag.add), .drawUnder / .drawHeld / .drawHud (field.js). Saved in G.state.bag: items (the hands), ground [{id, col,
//   map, x, y}], taken {source: {d: day, t: play s}}, play {day, n: {kind: times today}}.
'use strict';
(function () {
  const C = G.carry = {}, T = G.TILE;
  const TT = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const chDone = id => !!G.chapters && G.chapters.done(id);
  const day = () => (G.words ? G.words.day() : 0);
  const clock = () => (G.words ? G.words.now() : 0);
  const say = (who, show, ...pages) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, show ? { show } : {}));
  C.STACK = 3;       // a small stack of one kind
  C.GROUND_MAX = 14; // things lying about on one map (more: the oldest rolls away)
  C.FLY = 14;        // frames a thing flies between your hands and the ground
  // what Canelo does with a thing you give him (anything else: he sniffs it and you keep it)
  C.DOG = { pelota: 'fetch', palo: 'fetch', hueso: 'eat', galleta: 'eat', pan: 'eat', queso: 'eat', agua: 'drink', leche: 'drink' };

  // ---------- where things are ----------
  // every: play seconds before it's back after being picked up, or 'day' (a new one every morning); unique: there is
  // only one (it's back only when it's nowhere: not in your hands, not lying about); hidden: the tile itself shows it
  // (the barn's basket of apples); tree: the tile of the tree it fell from (drawn with apples on it)
  C.SOURCES = [
    { id: 'manzana1', map: 'villa', at: [12, 19], item: 'manzana', every: 150, tree: [12, 18] }, // under the park's apple tree
    { id: 'manzana2', map: 'villa', at: [34, 4], item: 'manzana', every: 150, tree: [34, 3] },   // under the apple tree by the farm
    { id: 'cesta', map: 'granja', at: [5, 4], item: 'manzana', every: 40, hidden: true },        // the barn's basket of apples
    { id: 'palo1', map: 'villa', at: [13, 24], item: 'palo', every: 90 },                        // sticks in the park
    { id: 'palo2', map: 'villa', at: [22, 18], item: 'palo', every: 90 },
    { id: 'pelota', map: 'villa', at: [7, 19], item: 'pelota', col: 'azul', every: 60, unique: true }, // Canelo's blue ball, in front of home
    { id: 'hueso', map: 'casa', at: [6, 5], item: 'hueso', every: 'day' },                       // a bone by his cushion every morning
    { id: 'huevo1', map: 'granja', at: [10, 1], item: 'huevo', every: 'day' },                   // eggs in the hay by the nest boxes
    { id: 'huevo2', map: 'granja', at: [11, 1], item: 'huevo', every: 'day' },
    { id: 'carta', map: 'villa', at: [21, 14], item: 'carta', every: 'day', when: () => chDone('c10') }, // a letter Tomás dropped
  ];
  // the coloured flowers (errands.js): carried as they are before Lucía's chapter; from it on, errands.js picks them
  // (once a day each, with "¿De qué color?")
  (G.errands ? G.errands.FLOWERS : []).forEach(([x, y, col]) => C.SOURCES.push({ id: 'flor' + x + '_' + y, map: 'villa', at: [x, y], item: 'flor', col, every: 180, when: () => !chDone('c15') }));

  // ---------- saved state (in G.state.bag, next to the hands) ----------
  const bag = () => G.errands.bag;
  function st() {
    bag().list(); const b = G.state.bag;
    if (!Array.isArray(b.ground)) b.ground = [];
    if (!b.taken || typeof b.taken !== 'object' || Array.isArray(b.taken)) b.taken = {};
    if (!b.play || typeof b.play !== 'object' || b.play.day !== day()) b.play = { day: day(), n: {} };
    return b;
  }
  C.state = () => (G.state ? st() : null);
  const sameKind = (a, b) => a.id === b.id && (a.col || null) === (b.col || null);
  const free = () => bag().list().filter(it => !it.q);
  C.held = () => { if (!G.state) return null; const L = free(); return L.length ? { id: L[0].id, col: L[0].col || null, n: L.length, it: L[0] } : null; };
  C.holding = id => { const h = C.held(); return !!h && (!id || h.id === id); };
  const exists = it => free().some(o => sameKind(o, it)) || st().ground.some(g => sameKind(g, it));
  function avail(s) {
    try { if (s.when && !s.when()) return false; } catch (e) { return false; }
    if (s.unique && exists({ id: s.item, col: s.col })) return false;
    const tk = st().taken[s.id]; if (!tk) return true;
    if (s.every === 'day') return tk.d !== day();
    return clock() - tk.t >= s.every || clock() < tk.t; // (a clock that went back counts as time passed)
  }
  C.avail = id => { const s = C.SOURCES.find(s => s.id === id); return !!s && !!G.state && avail(s); };
  const groundAt = (map, x, y) => st().ground.filter(g => g.map === map && g.x === x && g.y === y);
  const srcAt = (map, x, y) => C.SOURCES.find(s => s.map === map && s.at[0] === x && s.at[1] === y && avail(s)) || null;
  // what lies on tile x, y of this map (a thing put down wins over a source)
  C.at = function (f, x, y) {
    if (!G.state || !f || !G.errands) return null;
    const g = groundAt(f.mapId, x, y)[0]; if (g) return { ground: g, id: g.id, col: g.col || null };
    const s = srcAt(f.mapId, x, y); return s ? { src: s, id: s.item, col: s.col || null } : null;
  };
  // the picture of a thing (a coloured flower, the blue ball)
  const pic = (id, col) => (col ? { icon: W(id) ? W(id).icon : id, col: W(col) ? W(col).col : col } : (W(id) || id));
  C.pic = it => pic(it.id, it.col);
  // what the corner and the bubble say under it: the word once met, "?" before, nothing for a thing without a word
  C.label = id => (!W(id) ? '' : G.st.seen(id) ? W(id).es.split(' / ')[0] : '?');

  // ---------- picking up, putting down ----------
  let fly = [], thrown = null; // things flying between your hands and the ground; the thing in the air while Canelo fetches it
  const head = f => ({ x: f.player.x * T + f.player.ox + 12, y: f.player.y * T + f.player.oy - 10 });
  const addFly = (f, it, from, to, toHand) => fly.push({ f, it: { id: it.id, col: it.col || null }, x0: from.x, y0: from.y, x1: to.x, y1: to.y, t: 0, toHand });
  // a tile something can lie on: ground you can walk on, not a door, nobody's place in the story, no other kind there
  C.canLie = function (f, x, y, id) {
    if (x < 0 || y < 0 || x >= f.map.w || y >= f.map.h) return false;
    const t = G.TERRAIN[f.map.get(x, y)] || G.TERRAIN['.'];
    if (t.block || t.wall || f.exitAt(x, y)) return false;
    if ((G.chapters && G.chapters.spotAt(f, x, y)) || (G.errands.spotAt(f, x, y)) || G.intro.spotAt(f, x, y) || srcAt(f.mapId, x, y)) return false;
    if (f.npcs.some(n => !n.ghost && !n.hidden && n.x === x && n.y === y)) return false;
    return !groundAt(f.mapId, x, y).some(g => g.id !== id);
  };
  // your free things go on tile x, y
  function putDown(f, x, y, from) {
    const L = bag().list(), fr = L.filter(it => !it.q); if (!fr.length) return;
    for (const it of fr) {
      L.splice(L.indexOf(it), 1);
      st().ground.push(Object.assign({ id: it.id, col: it.col || null, map: f.mapId, x, y, f0: G.frame }, it.gold ? { gold: true } : {}));
      addFly(f, it, from || head(f), { x: x * T + 12, y: y * T + 14 }, false);
    }
    const mine = st().ground.filter(g => g.map === f.mapId); // (too many lying about: the oldest rolls away)
    while (mine.length > C.GROUND_MAX) { const g = mine.shift(); st().ground.splice(st().ground.indexOf(g), 1); }
    G.st.autosave();
  }
  // where to put things down: in front of you, else beside you, else at your feet
  function spotNear(f, id) {
    const p = f.player, [dx, dy] = G.DIRS[p.dir];
    const tries = [[p.x + dx, p.y + dy], [p.x, p.y + 1], [p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y - 1], [p.x - 1, p.y + 1], [p.x + 1, p.y + 1]];
    return tries.find(([x, y]) => C.canLie(f, x, y, id)) || [p.x, p.y];
  }
  C.drop = function (f) {
    f = f || G.field; const h = C.held(); if (!h || !f) return false;
    const [x, y] = spotNear(f, h.id);
    putDown(f, x, y);
    G.audio.sfx('pop');
    return true;
  };
  // errands.js bag.add: a free thing of another kind (or a fourth) coming into your hands puts what you held down
  C.makeRoom = function (id, o = {}) {
    const f = G.field, h = C.held(); if (!h || !f || !G.state || G.scenes.indexOf(f) < 0) return;
    if (sameKind(h, { id, col: o.col }) && h.n < C.STACK) return;
    const [x, y] = spotNear(f, h.id); putDown(f, x, y);
  };
  // pick up what lies on tile x, y (you're beside it or on it) -> true
  C.pick = function (f, x, y) {
    const a = C.at(f, x, y); if (!a) return false;
    const h = C.held(), it = { id: a.id, col: a.col };
    if (a.ground) st().ground.splice(st().ground.indexOf(a.ground), 1); else st().taken[a.src.id] = { d: day(), t: clock() };
    if (h && (!sameKind(h, it) || h.n >= C.STACK)) putDown(f, x, y, { x: x * T + 12, y: y * T + 14 }); // (a swap: what you held goes where this was)
    const o = Object.assign({}, a.col ? { col: a.col } : {}, a.ground && a.ground.gold ? { gold: true } : {});
    bag().add(a.id, o);
    addFly(f, it, { x: x * T + 12, y: y * T + 14 }, head(f), true);
    if (W(a.id) && G.world) G.world.name(a.id, f.player.x * T + 12, f.player.y * T - 14, { noIntro: true, pic: pic(a.id, a.col), grow: 'carry' }); // its name, with its picture ("?" while unmet); its card grows
    else for (let i = 0; i < 4; i++) G.fx.twinkle(x * T + 12 - Math.round(f.cam.x) + (Math.random() - 0.5) * 18, y * T + 8 - Math.round(f.cam.y) + (Math.random() - 0.5) * 12);
    G.st.autosave();
    return true;
  };
  // field.js search (A facing it, or a tap's walk ending beside it)
  C.search = function (f, x, y) { return !!G.state && !!C.at(f, x, y) && C.pick(f, x, y); };

  // ---------- taps (field.js update, before tap-to-walk) ----------
  // a tap on yourself: put down what you hold (or pick up what you stand on)
  C.tapSelf = function (f, tap) {
    if (!G.state || !f || f.locked || !tap) return false;
    const p = f.player, wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y);
    const on = wx >= p.x * T + p.ox && wx < p.x * T + p.ox + T && wy >= p.y * T + p.oy - 6 && wy < p.y * T + p.oy + T;
    if (!on || p.moving) return false;
    if (C.held()) return C.drop(f);
    if (C.at(f, p.x, p.y)) return C.pick(f, p.x, p.y);
    return false;
  };
  let hud = null; // the corner's hand slot, as drawn (screen px)
  C.tapHud = function (f, tap) {
    if (!hud || !tap || !C.held() || f.locked) return false;
    if (tap.x < hud.x || tap.x >= hud.x + hud.w || tap.y < hud.y || tap.y >= hud.y + hud.h) return false;
    return C.drop(f);
  };
  C.hud = () => hud;

  // ---------- giving ----------
  const careHeart = () => { if (G.hearts) G.hearts.add('canelo', 1, 'care'); };
  const bump = k => { const n = st().play.n; n[k] = (n[k] | 0) + 1; };
  // Canelo, tapped while you hold something (maps.js caneloTalk, after the story): -> true when he took it up
  C.giveDog = function* (f, n) {
    const h = C.held(); if (!h || !n || !G.pet || !G.pet.mine()) return false;
    while (n.moving) yield 1;
    G.pet.place(f, n); yield 10;
    const what = C.DOG[h.id] || 'sniff', [sx, sy] = [n.x * T + 12 - Math.round(f.cam.x), n.y * T - Math.round(f.cam.y)];
    if (what !== 'sniff' && G.cards && W(h.id)) G.cards.grow(h.id, 'give', { x: sx, y: sy }); // giving it to him grows its card (cards.js)
    if (what === 'fetch') { // thrown from your hands: he runs, picks it up and brings it back to you
      thrown = h.it;
      try { yield* G.pet.play('fetch', { item: { id: h.id, col: h.col } }); } finally { thrown = null; }
      careHeart(); bump(h.id); bump('fetch');
      G.fx.say('¡Muy bien!', sx, sy - 20, '#f8e060', true);
      yield 10;
    } else if (what === 'eat' || what === 'drink') {
      bag().take(h.id, { col: h.col || undefined, q: null }); G.audio.sfx('pop');
      yield* G.pet.play(what, what === 'eat' ? { item: h.id } : {});
      if (!(G.hearts && G.hearts.gift('canelo', h.id))) careHeart();
      bump(h.id);
      yield 10;
    } else { // not for dogs: he sniffs it (a flower makes him sneeze) and gives it back
      yield* G.pet.play('sniff', { amp: 0.5 });
      if (h.id === 'flor') { G.pet.sound('woof'); G.pet.puff('txt', n.x * T + 12, n.y * T - 6, { s: '¡Achís!', life: 70 }); yield 30; }
      yield* G.pet.play('huh');
    }
    if (G.hearts) yield* G.hearts.milestones('canelo');
    return true;
  };
  // who would love it today (a gift heart they haven't had), nearest first; not `not`
  const reach = who => { for (const m in G.maps) if ((G.maps[m].npcs || []).some(n => n.id === who && (!n.cond || n.cond()))) return m; return null; };
  const likes = (who, it) => !!G.hearts && G.hearts.LIKES[who] === it.id && (who !== 'lucia' || it.col === 'rosa');
  const wants = (who, it) => likes(who, it) && G.hearts.canAddToday(who, 'gift') && !!reach(who);
  C.likerFor = function (it, not) {
    if (!G.hearts) return null;
    const f = G.field, p = f && f.player, here = who => (f ? f.npcs.find(n => n.id === who && !n.hidden) : null);
    const L = G.hearts.WHO.filter(w => w !== not && w !== 'canelo' && wants(w, it));
    L.sort((a, b) => { const na = here(a), nb = here(b); return (na ? 0 : 1) - (nb ? 0 : 1) || (na && nb && p ? Math.abs(na.x - p.x) + Math.abs(na.y - p.y) - Math.abs(nb.x - p.x) - Math.abs(nb.y - p.y) : 0); });
    return L[0] || null;
  };
  // a townsperson tapped while you hold something nobody else's talk took (errands.js talk, after a present they like,
  // a favour, hide-and-seek and the shop): Tomás takes his letter back; anyone else looks and says who'd love it
  C.show = function* (who, f) {
    const h = C.held(); if (!h || who === 'canelo') return false;
    if (who === 'tomas' && h.id === 'carta') {
      bag().take('carta', { q: null }); G.audio.jingle('item'); bump('carta');
      yield say(who, null, TT('¡Mi [carta]! ¡[gracias], {name}!', 'My letter! Thank you, {name}!'));
      if (G.hearts) { G.hearts.add('tomas', 1, 'care'); yield 20; yield* G.hearts.milestones('tomas'); }
      return true;
    }
    const lk = C.likerFor(h.it, who);
    if (lk) yield say(who, { face: lk }, TT('¡Oh! ¿Para ' + G.nameOf(lk).replace(/^(Profesora|Señor|Señora|Don|Doña|Abuela) /, '') + '?', 'Oh, nice! Take it to ' + G.nameOf(lk) + ': they love it!'));
    else if (C.DOG[h.id] === 'fetch' && G.pet && G.pet.mine()) yield say(who, { icon: 'perro' }, TT('¡Para {dog}!', 'For {dog}! (tap him: he fetches it)'));
    else yield say(who, C.pic(h), TT('¡Oh! ¡Mira!', 'Oh, look at that! (put it down: tap yourself)'));
    return true;
  };
  if (G.errands) { // after everything else in a townsperson's talk; Tomás notices his letter
    const et = G.errands.talk, ea = G.errands.alert;
    G.errands.talk = function* (who, f) { if (yield* et(who, f)) return true; return yield* C.show(who, f); };
    G.errands.alert = function (who) { const a = ea(who); if (a) return a; const h = G.state && C.held(); return h && who === 'tomas' && h.id === 'carta' ? [[pic('carta'), 1]] : false; };
  }

  // ---------- the day's play (the guide, src/guide.js) ----------
  // the nearest place to pick up a thing that pred({id, col}) likes: lying about, a source, a flower to pick; here first
  function nearest(f, pred) {
    const p = f.player, out = [];
    for (const g of st().ground) if (pred(g)) out.push({ map: g.map, at: [g.x, g.y], id: g.id, col: g.col || null });
    for (const s of C.SOURCES) if (avail(s) && pred({ id: s.item, col: s.col || null })) out.push({ map: s.map, at: s.at, id: s.item, col: s.col || null });
    if (G.errands && chDone('c15')) for (const sp of G.errands.SPOTS) { let on = null; try { on = sp.flower && sp.icon(); } catch (e) { /* */ } if (on && pred({ id: 'flor', col: sp.flower })) out.push({ map: sp.map, at: sp.at, id: 'flor', col: sp.flower }); }
    const d = c => (c.map === f.mapId ? 0 : 1000) + Math.abs(c.at[0] - p.x) + Math.abs(c.at[1] - p.y);
    out.sort((a, b) => d(a) - d(b));
    return out[0] || null;
  }
  const go = (why, c) => (c ? { why, map: c.map, at: c.at, icon: pic(c.id, c.col) } : null);
  const fetchOk = () => !!G.pet && G.pet.mine() && !(G.errands && G.errands.lost());
  const pageAt = f => { // a notebook page puzzle that's ready (a sparkle), this map first
    let best = null;
    for (const m in G.maps) for (const k in G.maps[m].pages || {}) if (G.pages && G.pages.ready(G.maps[m].pages[k]) && (!best || m === f.mapId)) best = { map: m, at: k.split(',').map(Number), icon: 'pagina' };
    return best;
  };
  C.PLAYS = {
    pelota: f => (fetchOk() && (st().play.n.pelota | 0) < 3 ? go('fetch the ball', nearest(f, g => g.id === 'pelota')) : null),
    manzana: f => { const w = C.likerFor({ id: 'manzana' }); return w ? go('an apple for ' + w, nearest(f, g => g.id === 'manzana')) : null; },
    flor: f => {
      const w = C.likerFor({ id: 'flor' }) || C.likerFor({ id: 'flor', col: 'rosa' }); if (!w) return null;
      return go('a flower for ' + w, nearest(f, g => g.id === 'flor' && (w !== 'lucia' || g.col === 'rosa')));
    },
    hueso: f => (fetchOk() && G.hearts && G.hearts.canAddToday('canelo', 'gift') ? go('a bone for Canelo', nearest(f, g => g.id === 'hueso')) : null),
    palo: f => (fetchOk() && (st().play.n.palo | 0) < 2 ? go('a stick to throw', nearest(f, g => g.id === 'palo')) : null),
    huevo: f => (!G.errands.jobDone('huevo') && reach('rosa') ? go('an egg for Rosa', nearest(f, g => g.id === 'huevo')) : null),
    carta: f => (chDone('c10') && !st().play.n.carta ? go('Tomás\'s letter', nearest(f, g => g.id === 'carta')) : null),
    patos: () => (chDone('c6') && !G.errands.jobDone('patos') && G.words.met('pan') && !C.holding('pan') ? { why: 'bread for the ducks', who: 'marta', icon: 'pan' } : null),
    pagina: f => { const p = pageAt(f); return p ? Object.assign({ why: 'a page puzzle' }, p) : null; },
  };
  C.ORDER = ['pelota', 'manzana', 'flor', 'hueso', 'palo', 'huevo', 'carta', 'patos', 'pagina'];
  C.plan = function (f) {
    if (!G.state || !f || !G.errands) return null;
    const h = C.held();
    if (h) { // what you hold, to whoever would love it
      const w = C.likerFor(h.it); if (w) return { why: 'give ' + h.id + ' to ' + w, who: w, icon: pic(h.id, h.col) };
      if (h.id === 'carta' && !st().play.n.carta && reach('tomas')) return { why: 'the letter to Tomás', who: 'tomas', icon: pic('carta') };
      if (h.id === 'huevo' && !G.errands.jobDone('huevo') && reach('rosa')) return { why: 'the egg to Rosa', who: 'rosa', icon: pic('huevo') };
      if (h.id === 'pan' && chDone('c6') && !G.errands.jobDone('patos')) return { why: 'bread for the ducks', map: 'villa', at: [37, 21], icon: 'pato' };
      if (C.DOG[h.id] && fetchOk() && (C.DOG[h.id] !== 'fetch' || (st().play.n[h.id] | 0) < 5)) return { why: (C.DOG[h.id] === 'fetch' ? 'throw it for Canelo' : 'Canelo: ' + h.id), dog: true, icon: pic(h.id, h.col) };
    }
    const k0 = day() % C.ORDER.length;
    for (let i = 0; i < C.ORDER.length; i++) {
      const id = C.ORDER[(k0 + i) % C.ORDER.length]; if (h && h.id === id) continue;
      let g = null; try { g = C.PLAYS[id](f); } catch (e) { if (!C.err) { C.err = 1; console.error(e); } }
      if (g) return g;
    }
    return C.more(f, h);
  };
  // When the day's plays are all done: not endless fetch, but the next of these in turn (the one played least today
  // first, ties in an order that turns each day): a trick for Canelo, petting him, water or a cookie for him, another
  // round of hide-and-seek with Nico, a present (the ball for Nico), a game of fetch. Each counts in play.n when it's
  // done (pet.js: truco, mimo, comida; seek.js: seek; giveDog: fetch).
  C.MORE = ['truco', 'mimo', 'seek', 'comida', 'regalo', 'fetch'];
  C.bump = k => { if (G.state) bump(k); };
  C.played = k => (G.state ? st().play.n[k] | 0 : 0);
  const MORE = {
    truco: () => { const k = G.pet && G.pet.known ? G.pet.known() : []; if (!k.length) return null; const id = k[(day() + C.played('truco')) % k.length]; return { why: 'a trick for Canelo', dog: true, icon: id, pet: id }; },
    mimo: () => ({ why: 'pet Canelo', dog: true, icon: 'feliz', pet: 'mimo' }),
    comida: () => { const w = ['agua', 'galleta', 'hueso'].filter(id => G.words.met(id)); if (!w.length) return null; const id = w[(day() + C.played('comida')) % w.length]; return { why: 'food for Canelo', dog: true, icon: id, pet: id }; },
    seek: () => (G.seek && G.seek.again && G.seek.again() ? { why: 'hide-and-seek again', who: 'nico', icon: 'lupa' } : null),
    regalo: f => { const w = C.likerFor({ id: 'pelota', col: 'azul' }); return w ? go('the ball for ' + w, nearest(f, g => g.id === 'pelota')) : null; },
    fetch: (f, h) => (h && C.DOG[h.id] === 'fetch' ? { why: 'fetch', dog: true, icon: pic(h.id, h.col) } : go('fetch', nearest(f, g => C.DOG[g.id] === 'fetch'))),
  };
  // the card the day's play wants in Canelo's menu (pet.js draws an arrow over it), when the guide is showing that play
  C.petWant = function (f) {
    const why = G.guide && (G.guide.at ? G.guide.at.why : G.guide.lastWhy); if (!f || !/^play:/.test(why || '')) return null;
    const p = C.plan(f); return p && p.pet ? p.pet : null;
  };
  C.more = function (f, h) {
    if (!fetchOk()) return null;
    if (h) { // something in your hands: it's for Canelo, or put it down first (the hand demo shows how)
      if (C.DOG[h.id]) return { why: C.DOG[h.id] === 'fetch' ? 'fetch' : 'Canelo: ' + h.id, dog: true, icon: pic(h.id, h.col) };
    }
    const k0 = day() % C.MORE.length, order = C.MORE.map((k, i) => ({ k, i: (i - k0 + C.MORE.length) % C.MORE.length })).sort((a, b) => C.played(a.k) - C.played(b.k) || a.i - b.i);
    for (const { k } of order) { let g = null; try { g = MORE[k](f, h); } catch (e) { /* */ } if (g) return g; }
    return null;
  };

  // ---------- drawing (field.js) ----------
  // things lying about (under the people): a soft shadow, a little bob, a twinkle now and then; apples on their trees
  C.drawUnder = function (f, ctx) {
    if (!G.state || !G.errands) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    const one = (it, x, y, k, f0) => {
      if (f0 != null && G.frame - f0 < C.FLY) return; // (still flying down)
      const X = x * T - cx, Y = y * T - cy; if (X < -24 || Y < -24 || X > G.W || Y > G.H) return;
      const bob = Math.round(Math.sin((G.frame + x * 9 + k * 5) / 16));
      ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(X + 6, Y + 19, 12, 2);
      G.drawIcon16(ctx, C.pic(it), X + 4 + (k % 2) * 3, Y + 4 + bob - (k > 1 ? 3 : 0));
      if ((G.frame + x * 13 + y * 7) % 90 < 10) { const u = ((G.frame + x * 13 + y * 7) % 90) / 10; ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 17 + Math.round(u * 2), Y + 2, 1, 3); ctx.fillRect(X + 16 + Math.round(u * 2), Y + 3, 3, 1); }
    };
    for (const s of C.SOURCES) {
      if (s.map !== f.mapId) continue;
      if (s.tree) { const X = s.tree[0] * T - cx, Y = s.tree[1] * T - cy; for (const [dx, dy] of [[6, 6], [14, 4], [10, 11], [16, 10]]) { ctx.fillStyle = '#401010'; ctx.fillRect(X + dx - 1, Y + dy - 1, 4, 4); ctx.fillStyle = '#e03028'; ctx.fillRect(X + dx, Y + dy, 2, 2); } }
      if (!s.hidden && avail(s)) one({ id: s.item, col: s.col }, s.at[0], s.at[1], 0);
    }
    const seen = {};
    for (const g of st().ground) if (g.map === f.mapId) { const k = g.x + ',' + g.y; seen[k] = (seen[k] | 0) + 1; one(g, g.x, g.y, seen[k] - 1, g.f0); }
  };
  // what you hold, up over your head in both hands (after the people); things flying to and from your hands
  C.drawHeld = function (f, ctx) {
    if (f.player.hidden) return; // (on the bus: zones.js)
    if (!G.state || !G.errands) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), p = f.player;
    const L = bag().list(), fr = L.filter(it => !it.q && it !== thrown), qs = L.filter(it => it.q);
    const show = fr.concat(qs).slice(0, 3);
    const landing = fly.some(o => o.f === f && o.toHand);
    if (show.length && !(landing && !qs.length && fr.length <= 1)) {
      const moving = p.moving || p.ox || p.oy, bob = Math.abs(p.ox + p.oy) >= 6 && Math.abs(p.ox + p.oy) <= 18 ? 1 : 0;
      const X = Math.round(p.x * T + p.ox - cx), Y = Math.round(p.y * T + p.oy - cy - 3) - bob - (moving ? 0 : Math.round(Math.abs(Math.sin(G.frame / 24))));
      show.forEach((it, k) => G.drawIcon16(ctx, bag().icon(it), X + 4, Y - 12 - k * 6)); // (a little tower when there are more)
      const skin = (G.st.playerSpec().map && G.st.playerSpec().map.skin) || '#f0c8a0'; // two hands holding it up
      for (const hx of [X + 3, X + 18]) { ctx.fillStyle = '#1a1420'; ctx.fillRect(hx - 1, Y - 2, 5, 5); ctx.fillStyle = skin; ctx.fillRect(hx, Y - 1, 3, 3); }
    }
    fly = fly.filter(o => o.f === f && ++o.t <= C.FLY);
    for (const o of fly) {
      const u = o.t / C.FLY, to = o.toHand ? head(f) : { x: o.x1, y: o.y1 };
      const x = o.x0 + (to.x - o.x0) * u, y = o.y0 + (to.y - o.y0) * u - Math.sin(u * Math.PI) * 14;
      G.drawIcon16(ctx, C.pic(o.it), Math.round(x - 8 - cx), Math.round(y - 12 - cy));
    }
  };
  // the corner: what you hold (picture + word, "?" while unmet; tap it to put it down), then the story's things
  C.drawHud = function (f, ctx) {
    hud = null;
    if (!G.state || f.locked || G.top() !== f || (G.hint && G.hint.stripShowing())) return;
    const L = bag().list(); if (!L.length) return;
    const fr = L.filter(it => !it.q), qs = L.filter(it => it.q);
    const lab = fr.length ? C.label(fr[0].id) : '', lw = lab ? G.textWidth(lab) + 6 : 0;
    const fw = fr.length ? 22 + (fr.length - 1) * 5 + lw + 12 : 0, qw = qs.length ? qs.length * 15 + (fr.length ? 6 : 4) : 0;
    G.win(ctx, 4, 4, 4 + fw + qw, 22, { fill1: '#ffffff', fill2: '#ece8f4', alpha: 0.95 });
    let x = 8;
    if (fr.length) {
      const pop = G.errands.popT ? G.errands.popT(fr[0]) : 0;
      fr.slice(0, C.STACK).forEach((it, k) => G.drawIcon16(ctx, bag().icon(it), x + k * 5, 7 + pop - (k ? 1 : 0)));
      const tx = x + 20 + (fr.length - 1) * 5;
      if (lab) G.text(ctx, lab, tx, 11, lab === '?' ? '#a08060' : G.st.knows(fr[0].id) ? '#a06008' : '#2860a8', null);
      const ax = tx + lw, ay = 9; // a little arrow down to the ground: tap to put it down
      ctx.fillStyle = '#8890b8'; ctx.fillRect(ax + 2, ay, 2, 5); ctx.fillRect(ax, ay + 4, 6, 1); ctx.fillRect(ax + 1, ay + 5, 4, 1); ctx.fillRect(ax + 2, ay + 6, 2, 1); ctx.fillRect(ax - 1, ay + 9, 8, 1);
      hud = { x: 4, y: 4, w: fw + 4, h: 22 };
      x += fw;
      if (qs.length) { ctx.fillStyle = '#c8c0d8'; ctx.fillRect(x - 3, 8, 1, 14); }
    }
    qs.forEach((it, i) => G.drawIcon16(ctx, bag().icon(it), x + i * 15, 7));
  };
  if (G.errands) G.errands.drawHud = C.drawHud;
})();
