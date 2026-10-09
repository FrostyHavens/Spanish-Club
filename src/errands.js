// ===== The bag, the side jobs, presents and the shops (and the helpers the chapters share) =====
// The story is the 21 chapters (src/chapters.js, content/es/story-*.js). The older errands it replaced (docs/CURRICULUM.md
// 7.2: the market, the picnic, the dog show, the count, the sound game, the flowers, the party, lost Canelo, tired
// Tomás) never start now; an older game that had one going lets it go (G.chapters.migrate), and their badges stay in
// Misiones for games that earned them. What lives here:
//
// The bag (G.state.bag.items): what you carry, drawn top-left on the map. A chapter's things carry `q` (their chapter)
// and can't be given away; the rest (bought from Marta and Don Pepe, a flower, an egg, water from the fountain, a
// favour's present) can be given to someone who likes it (G.hearts.LIKES; Lucía only likes pink flowers): they notice
// it when you talk ("¿Para mí?").
// Side jobs (once a day each, a star and sometimes a heart; G.state.jobs[id] = 'YYYY-M-D'; each opens with the chapter
// that teaches its words, CURRICULUM.md 2.2): feed the ducks (c6: bread from Marta, tap the pond), the hens' egg (c11:
// the hay bale by them; give it to Rosa), Canelo's water (c9: his bowl at home is empty each day: fill a bottle at the
// fountain), pet the horse (c10: tap him from close by), the sleepy cat (c2: tap her while she naps and say "gato").
// Flowers (c15): coloured flowers grow around town; pick one a day each as a present ("¿De qué color?" every time);
// Lucía's 3-heart secret is a golden flower in the wheat.
//
// Hooks (other files call these): talk(who, f) / alert(who) for every townsperson (maps.js: presents, the shops),
// spotAt / runSpot (field.js: the places a side job sends you, which win over tap-anything), update / drawUnder /
// drawTop / drawHud (field.js), targets(f) / waitsIn(map) (hint.js: where the hand points), catTap(f) (ambient.js),
// lost() (Canelo's map entries), bowlEmpty() (pet.js), nicoFollows() (maps.js: Nico tags along in chapter 17), and
// G.animals.tapped is wrapped here (the story's animals first, then the horse).
// For the chapters: stage(f, places) / unstage(f, back) (move people for a scene and back), photoCard(who) (the party's
// group photo). API for tests: G.errands.bag {list, has, add, take}, .jobDone(id), .fl(id) (an older errand's saved
// flags), .SPOTS, .FLOWERS, .offer(id) / .unlocked(id) (always false now).
'use strict';
(function () {
  const E = G.errands = {}, T = G.TILE;
  const F = () => G.state.flags, S = G.st;
  const TT = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const today = () => G.world.today();
  const words = (...ids) => ids.map(id => ({ word: id }));
  const fl = id => { const k = 'e_' + id, f = F(); if (!f[k] || typeof f[k] !== 'object') f[k] = {}; return f[k]; };
  E.fl = fl;
  const chDone = id => !!G.chapters && G.chapters.done(id);

  // ---------- talking ----------
  function* say(who, ...pages) { yield G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who }); }
  function* tell(...pages) { yield G.say(pages); }
  // a picture-card question: the right word and a few met others, shuffled
  function* q(who, prompt, en, answer, pool, o = {}) {
    const met = pool.filter(w => w === answer || G.words.met(w)); // (no unmet word as a choice)
    if (met.length >= 2) pool = met;
    const c = G.wordChoices(answer, pool, Math.min(o.n || 3, pool.length));
    return yield* G.ask(Object.assign({ prompt, en, choices: c.choices, answer: c.answer, layout: 'cards', who }, o.show ? { show: o.show } : {}));
  }
  function scene(f, gen) {
    f.route = null; f.locked = true;
    f.tasks.add((function* () { try { yield* gen; } finally { f.locked = false; } })());
  }
  const scr = (f, wx, wy) => [wx - Math.round(f.cam.x), wy - Math.round(f.cam.y)];
  const tileScr = (f, x, y) => scr(f, x * T + 12, y * T + 8);

  // ---------- the older errands: they never open now ----------
  E.unlocked = () => false;
  E.offer = () => false;
  E.lost = () => !!G.state && !!G.chapters && G.chapters.lost();
  E.nicoFollows = () => !!G.state && !!G.chapters && G.chapters.follows('nico');
  E.tomasTired = () => false;
  E.urgent = () => null;
  E.caneloAlert = () => false;
  E.parts = () => null; // (Misiones: an older errand shows its badge only)

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
  const free = id => B.has(id, { q: null }); // something of yours (not a chapter's)

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
  E.bowlEmpty = () => !!G.state && !!G.pet && G.pet.mine() && chDone('c9') && !E.jobDone('agua');

  // ---------- flowers (after Lucía's chapter): a present a day ----------
  E.FLOWERS = [ // coloured flowers around town (on flower or grass tiles): [x, y, colour]
    [8, 12, 'rosa'], [3, 11, 'rojo'], [31, 9, 'blanco'], [23, 15, 'azul'], [39, 7, 'amarillo'], [26, 8, 'rosa'],
    [12, 15, 'rojo'], [32, 22, 'amarillo'], [7, 24, 'blanco'],
  ];
  const COLS = ['rosa', 'blanco', 'amarillo', 'rojo', 'azul', 'verde'];
  const GOLD = [45, 22]; // Lucía's 3-heart secret: a golden flower in the wheat
  const flowerPic = (col, gold) => ({ icon: 'flor', col: gold ? '#f8c820' : W(col).col });
  const picked = (x, y) => { const p = F().e_picked; return !!(p && p[x + ',' + y] === today()); };
  const pickNow = (x, y) => { if (!F().e_picked || typeof F().e_picked !== 'object') F().e_picked = {}; F().e_picked[x + ',' + y] = today(); };
  const flowersOut = () => chDone('c15');
  function* pickFlower(f, x, y, col) {
    G.audio.sfx('select');
    yield* tell(TT('¡Una [flor]!', 'A flower!'));
    yield* q(null, '¿De qué color?', 'What colour is it?', col, COLS.filter(k => !(col === 'rosa' && k === 'rojo') && !(col === 'rojo' && k === 'rosa')), { show: flowerPic(col) });
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
  if (G.hearts) G.hearts.secrets.lucia = function* () { // 3 hearts: the golden flower in the wheat field
    yield G.say([TT('¡Un secreto! Una [flor] de oro... ¡en la [granja]!', 'A secret! A golden flower... out by the farm, in the wheat!')], { portrait: G.portraitOf('lucia'), name: G.nameOf('lucia'), who: 'lucia' });
    F().e_gold = 1;
  };

  // =====================================================================
  //  Places a side job sends you (SPOTS): a picture bubble over them; a tap walks you there and runs it
  // =====================================================================
  // icon(): the bubble when it's active, else null. Several can share a tile: the first active one wins.
  const V = (tag) => G.MAPDATA.villa.pos[tag];
  E.SPOTS = [
    { id: 'jobDucks', map: 'villa', at: [37, 21], icon: () => chDone('c6') && free('pan') && !E.jobDone('patos') ? 'pan' : null, run: ducksJob },
    { id: 'jobEgg', map: 'villa', at: [1, 7], icon: () => (chDone('c11') || S.done('picnic')) && !E.jobDone('huevo') && !free('huevo') ? 'huevo' : null, run: eggJob },
    { id: 'jobWater', map: 'villa', at: V('fuente'), icon: () => E.bowlEmpty() && !free('agua') ? 'agua' : null, run: waterJob },
    { id: 'bowl', map: 'casa', at: [1, 4], icon: () => E.bowlEmpty() ? 'agua' : null, nohint: () => !free('agua'), run: bowlJob },
    { id: 'gold', map: 'villa', at: GOLD, quiet: true, icon: () => F().e_gold === 1 && !picked(GOLD[0], GOLD[1]) ? 'flor' : null, run: goldSpot }, // (no bubble: it shines)
  ];
  // the flower spots (no bubble: the flower itself is drawn, bright and twinkling)
  E.FLOWERS.forEach(([x, y, col]) => E.SPOTS.push({ id: 'flor' + x + '_' + y, map: 'villa', at: [x, y], flower: col, quiet: true,
    icon: () => flowersOut() && !picked(x, y) && !B.has('flor', { col }) ? 'flor' : null, run: function* (f) { yield* pickFlower(f, x, y, col); } }));
  const spotIcon = sp => { try { return sp.icon(); } catch (e) { return null; } };
  E.spotAt = function (f, x, y) {
    if (!G.state || !f) return null;
    for (const sp of E.SPOTS) if (sp.map === f.mapId && sp.at[0] === x && sp.at[1] === y && spotIcon(sp)) return sp;
    return null;
  };
  E.runSpot = function* (f, sp) { yield* sp.run(f, sp); };
  E.spots = f => E.SPOTS.filter(sp => sp.map === f.mapId && spotIcon(sp));
  const hinted = sp => !sp.quiet && !(sp.nohint && sp.nohint()); // (a bubble that only says "not yet": no hand)
  E.waitsIn = map => !!G.state && (E.SPOTS.some(sp => sp.map === map && hinted(sp) && spotIcon(sp)) || (!!G.chapters && G.chapters.waitsIn(map)));
  // where the hint hand may point (world px): the story's places, animals and people first (chapters.js), then side jobs
  E.targets = function (f) {
    if (!G.state || !f) return [];
    const out = G.chapters ? G.chapters.targets(f) : [];
    for (const sp of E.spots(f)) if (hinted(sp)) out.push({ x: sp.at[0] * T + 12, y: sp.at[1] * T + 12, spot: sp.id });
    return out;
  };

  // =====================================================================
  //  Side jobs
  // =====================================================================
  function swimOver(f) { const d = (f.zoo ? f.zoo.list : []).find(a => a.kind === 'pato' && !a.baby); if (d) { d.tx = 38 * T + 4; d.ty = 21 * T + 14; d.st = 'swim'; } }
  function* ducksJob(f) {
    swimOver(f); G.animals.cry('pato');
    yield* tell(TT('¡[cuac], [cuac]! ¡Los [pato:patos]!', 'Quack, quack! The ducks!'));
    B.take('pan', { q: null });
    for (let i = 0; i < 6; i++) G.fx.twinkle(...tileScr(f, 38, 21));
    yield 20;
    if (['dos', 'tres', 'cuatro', 'cinco'].every(n => G.words.met(n))) yield* q(null, '¿Cuántos [pato:patos]?', 'How many ducks?', 'tres', ['dos', 'tres', 'cuatro', 'cinco'], { show: { icon: 'pato', count: 3 } });
    else yield* q(null, '¿[cuac]?', 'Who says quack?', 'pato', ['pato', 'perro', 'gato'].filter(n => n === 'pato' || G.words.met(n)), {});
    jobStar(f, 'patos', ...tileScr(f, 38, 21));
    yield 30;
  }
  function* eggJob() {
    G.animals.cry('gallina');
    yield* tell(TT('¡Coc, coc! ...¿Qué es?', 'Cluck, cluck! ...What\'s this?'));
    yield* q(null, '¿Qué es?', 'What is it?', 'huevo', ['huevo', 'pan', 'pelota']);
    B.add('huevo');
    yield* tell(TT('¡Un [huevo]! ¿Para Rosa?', 'An egg! For Grandma Rosa?'));
  }
  function* waterJob() {
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
  // the sleepy cat (a tap while she naps on the fence)
  E.catTap = function (f) {
    if (!G.state || !f || f.locked || !f.amb || !f.amb.cat) return false;
    const c = f.amb.cat, nap = G.ambient.napping(f), sx = c.x * T + 12 - Math.round(f.cam.x), sy = c.y * T - 6 - Math.round(f.cam.y);
    if (!(nap && !E.jobDone('gato') && chDone('c2'))) return false;
    scene(f, (function* () {
      yield* tell(TT('¡Shh! Zzz... zzz...', 'Shh! The cat is sleeping...'));
      yield* q(null, '¿Quién duerme?', 'Who is sleeping? (say it softly)', 'gato', ['gato', 'perro', 'conejo']);
      G.ambient.wake(f);
      if (G.animals) G.animals.meet('gato');
      jobStar(f, 'gato', sx, sy);
      yield 40;
    })());
    return true;
  };

  // =====================================================================
  //  Presents and the shops
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
    if (!SHOP[who] || !chDone(who === 'marta' ? 'c6' : 'c4') || B.full()) return false;
    const items = SHOP[who].filter(k => !B.has(k, { q: null }) && G.words.met(k)); if (!items.length) return false; // (a word not met yet waits for its chapter)
    yield* say(who, TT('¡[hola]! ¿Qué quieres?', 'Hello! What would you like?'));
    const r = yield G.choose({ prompt: '¿Qué quieres?', en: 'What would you like? (or "no")', choices: words(...items, 'no'), layout: 'cards', mic: true, cancel: true });
    const k = r.result;
    if (k < 0 || k >= items.length) { yield* say(who, TT('¡[adios]!', 'Bye!')); return true; }
    B.add(items[k]);
    yield* say(who, TT('¡Aquí tienes! ¡[' + items[k] + ']!', 'Here you are!'));
    return true;
  }

  // =====================================================================
  //  Who says what (maps.js calls talk / alert for every townsperson, after the story)
  // =====================================================================
  // a present they'd like first, then the day's favour (favores.js), Nico's hide-and-seek (seek.js), then the shop
  E.talk = function* (who, f) {
    if (!G.state) return false;
    if (yield* gift(who)) return true;
    if (G.favores && (yield* G.favores.talk(who, f))) return true;
    if (G.seek && (yield* G.seek.talk(who, f))) return true; // Nico's hide-and-seek (seek.js)
    if (yield* shop(who)) return true;
    return false;
  };
  E.alert = function (who) {
    if (!G.state) return false;
    const g = giftFor(who); if (g) return [[B.icon(g), 1]];
    return false;
  };

  // =====================================================================
  //  Hooks: animals tapped, every frame
  // =====================================================================
  if (G.animals) {
    const orig = G.animals.tapped;
    G.animals.tapped = function (f, a) {
      const p = f.player, here = { x: p.x, y: p.y, animal: a.kind };
      const [sx, sy] = scr(f, a.x, a.y - 14);
      if (G.chapters && G.chapters.tapped(a.kind, f)) { G.animals.react(f, a); G.animals.cry(a.kind); return here; } // the story's animal (chapters.js)
      const out = orig(f, a);
      // pet the horse: tap him from close by (once a day, a star)
      if (a.kind === 'caballo' && Math.abs(Math.floor(a.x / T) - p.x) + Math.abs(Math.floor((a.y - 4) / T) - p.y) <= 3 && chDone('c10') && jobStar(f, 'caballo', sx, sy - 10)) {
        for (let i = 0; i < 3; i++) f.zoo.fx.push({ k: 'heart', x: a.x - 10 + i * 10, y: a.y - 22 - i * 3, t: 0, life: 60 });
      }
      return out;
    };
  }
  E.update = function () { if (popIn && ++popIn.t > 50) popIn = null; };

  // =====================================================================
  //  Drawing
  // =====================================================================
  // flowers (bigger than the tile's own), the picnic blanket (chapter 13: f.picnic), the party's ribbons on the barn
  const RIBBONS = ['rojo', 'azul', 'amarillo', 'verde'];
  E.drawUnder = function (f, ctx) {
    if (!G.state || f.mapId !== 'villa') return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    for (const sp of E.SPOTS) if ((sp.flower || sp.id === 'gold') && spotIcon(sp)) {
      const x = sp.at[0] * T - cx, y = sp.at[1] * T - cy, gold = sp.id === 'gold', bob = Math.round(Math.sin((f.t + sp.at[0] * 9) / 14));
      ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(x + 6, y + 19, 12, 2);
      G.drawIcon16(ctx, flowerPic(sp.flower || 'amarillo', gold), x + 4, y + 2 + bob);
      if ((f.t + sp.at[0] * 13) % 70 < 10 || gold) { const k = (f.t % 40) / 40; ctx.fillStyle = gold ? '#fff8b0' : '#ffffff'; ctx.fillRect(x + 16 + Math.round(k * 3), y + 1, 1, 3); ctx.fillRect(x + 15 + Math.round(k * 3), y + 2, 3, 1); }
    }
    if (f.picnic) { // a red checked blanket in the park, the food on it
      const x = 14 * T - cx, y = 20 * T - cy + 4, w = 3 * T;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) { ctx.fillStyle = (i + j) & 1 ? '#f8f0e8' : '#d83838'; ctx.fillRect(x + i * 8, y + j * 4, 8, 4); }
      ctx.fillStyle = '#802020'; ctx.fillRect(x, y + 16, w, 1);
      f.picnic.food.forEach((k, i) => G.drawIcon16(ctx, k, x + 2 + i * 14, y - 2));
    }
    if (S.done('fiestab') || chDone('c20')) { // ribbons on the barn: the party (from chapter 20 on)
      const d = V('granjaDoor'), x0 = (d[0] - 3) * T - cx, y0 = (d[1] - 1) * T - cy + 4;
      for (let i = 0; i < 6 * T; i += 6) { const yy = y0 + Math.round(Math.sin(i / (6 * T) * Math.PI) * 8); ctx.fillStyle = '#5a3818'; ctx.fillRect(x0 + i, yy, 6, 1); ctx.fillStyle = W(RIBBONS[(i / 6) % RIBBONS.length]).col; ctx.beginPath(); ctx.moveTo(x0 + i, yy + 1); ctx.lineTo(x0 + i + 5, yy + 1); ctx.lineTo(x0 + i + 2.5, yy + 6); ctx.fill(); }
    }
  };
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
  // the bag (top-left)
  E.drawHud = function (f, ctx) {
    if (!G.state || f.locked || G.top() !== f || (G.hint && G.hint.stripShowing())) return;
    const L = bagS(); if (!L.length) return;
    const w = 26 + L.length * 15;
    G.win(ctx, 4, 4, w, 22, { alpha: 0.9 });
    G.drawIcon16(ctx, 'bolsa', 8, 7);
    L.forEach((it, i) => {
      const pop = popIn && popIn.it === it ? Math.round(Math.sin(Math.min(1, popIn.t / 20) * Math.PI) * -6) : 0;
      G.drawIcon16(ctx, B.icon(it), 26 + i * 15, 7 + pop);
    });
  };

  // =====================================================================
  //  For the chapters: moving people about for a scene, the group photo
  // =====================================================================
  // places {id: [x, y, dir]}; someone who isn't on this map is added ('mama_p' is Mamá as a guest) -> back
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
  E.stage = stage; E.unstage = unstage;
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
  E.photoCard = function (who) { const w = new G.Wait(); G.push(new Photo(who, w)); return w; };
})();
