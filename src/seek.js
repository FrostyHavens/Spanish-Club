// ===== ¿Dónde están? Nico's hide-and-seek: animals hiding around town and in the barn (docs/PLAYTEST_NOTES.md) =====
// A 4-year-old's favourite moment was finding the cat on the fence post, so once a day Nico starts a game of hide-and-
// seek: two or three animals hide in fun spots (on a fence post, behind a house's roof, in a tree, on a roof, behind hay
// bales and barrels, in the barn). Only animals whose words the child has MET hide, so nothing new is introduced (the
// new-word budget is untouched): their pictures show in Nico's bubble and in the little panel of who is still hiding.
// A hidden animal peeks: an ear, the top of a head, and every few seconds it pops up a little more (more often when
// you're near, with its cry). Tap it (or press A facing its spot): it pops out with a chime and a star, its name is
// said in the word bubble (the say-it-back mic), and when its word is due a quick review question (G.review.ask)
// comes first. All found: confetti and a heart from Nico.
// Hints, never the answer: Nico, asked again, holds up the picture of the place ("¿Y el [gato]?" and the bakery);
// Canelo, after a while with nothing found, sniffs and leaves a trail of paw prints toward the nearest one (or toward
// the door of the barn when it's in there).
// The game waits while a chapter is going on (the story's animals are where the story needs them): while
// G.chapters.current() is set, nothing hides; it starts again when the chapter is done. A hidden animal's own self on the
// map (the paddock's goat, the park's rabbit, Rosa's brown hen, a duckling, the cat on the park fence) is away while it
// hides (G.animals and G.ambient ask hides()).
// Hooks: field.js (update, tap, poke, draw, drawHud), maps.js (alert: Nico's bubble), errands.js (talk), animals.js
// (hides), ambient.js (the cat: c.hid).
// API: G.seek.today() (today's game: {day, list: [{kind, spot, found}], on, done}), .active(), .hiding(kind),
//   .ready(), .SPOTS, .KINDS, .where(h, f) (a hider's tap rectangle on screen, for tests), .hints(f) (Canelo's trail).
// Saved: G.state.seek.
'use strict';
(function () {
  const SK = G.seek = {}, T = G.TILE;
  const TT = (t, en) => ({ t, en });
  const W = id => G.data.words[id];
  const say = (who, ...pages) => G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who });
  const sayShow = (who, show, ...pages) => G.say(pages, { portrait: G.portraitOf(who), name: G.nameOf(who), who, show });
  SK.HOST = 'nico';
  SK.KINDS = ['gato', 'conejo', 'gallina', 'cabra', 'pato', 'rana'];
  // where they hide. at: the tile (tap it, or A facing it); how: 'sit' (on top of it, all of it showing: a fence post, a
  // roof ridge; y: where its feet are, px down the tile) or 'over' (behind it, peeking over a line `cut` px down the
  // tile: a roof's top, a hay bale, a bush, a barrel, the trough's water); dx: px across from the tile's middle;
  // place: the picture Nico holds up as a hint
  SK.SPOTS = [
    { id: 'poste', map: 'villa', at: [35, 16], how: 'sit', y: 6, dx: 0, kinds: ['gato', 'gallina'], place: 'granja' },     // a farm fence post
    { id: 'tejado', map: 'villa', at: [30, 4], how: 'sit', y: 9, dx: 0, kinds: ['gato'], place: 'panaderia' },             // the bakery roof
    { id: 'casa', map: 'villa', at: [6, 15], how: 'over', cut: 1, dx: 0, kinds: ['conejo', 'gato', 'cabra'], place: 'casa' }, // behind your house
    { id: 'biblio', map: 'villa', at: [31, 15], how: 'over', cut: 1, dx: 0, kinds: ['conejo', 'cabra', 'gallina'], place: 'biblioteca' }, // behind the library
    { id: 'arbol', map: 'villa', at: [24, 1], how: 'over', cut: 20, dx: 0, kinds: ['gato', 'conejo'], place: 'arbol' },   // in the trees, behind the school
    { id: 'fuente', map: 'villa', at: [18, 11], how: 'over', cut: 9, dx: -5, kinds: ['rana', 'pato'], place: 'fuente' },  // in the plaza's fountain
    { id: 'arbusto', map: 'villa', at: [43, 7], how: 'over', cut: 8, dx: 0, kinds: ['conejo', 'gallina', 'pato'], place: 'granja' }, // a bush by the barn
    { id: 'paja', map: 'villa', at: [45, 4], how: 'over', cut: 6, dx: 2, kinds: ['gallina', 'gato', 'conejo', 'pato'], place: 'granja' }, // the round hay bale
    { id: 'barriles', map: 'villa', at: [33, 6], how: 'over', cut: 4, dx: 0, kinds: ['gato', 'conejo', 'gallina'], place: 'panaderia' }, // the bakery's barrels
    { id: 'parque', map: 'villa', at: [13, 22], how: 'over', cut: 7, dx: 0, kinds: ['conejo', 'pato', 'gallina'], place: 'parque' }, // a bush in the park
    { id: 'pajar', map: 'granja', at: [9, 5], how: 'over', cut: 6, dx: 0, kinds: ['gallina', 'gato', 'conejo', 'pato'], place: 'granja' }, // the barn's hay
    { id: 'pila', map: 'granja', at: [1, 1], how: 'over', cut: 11, dx: 0, kinds: ['rana'], place: 'granja' },              // the horse's trough
    { id: 'barril', map: 'granja', at: [2, 7], how: 'over', cut: 4, dx: 0, kinds: ['gato', 'conejo', 'gallina'], place: 'granja' }, // the barn's barrel
  ];
  const spot = id => SK.SPOTS.find(s => s.id === id);
  // how much shows: lo (an ear, a comb, horns), hi (up to the eyes) in px from the top of the picture
  const PEEK = { gato: [4, 8], conejo: [5, 9], gallina: [4, 7], cabra: [4, 7], pato: [3, 5], rana: [3, 4] };

  // ---------- today's game ----------
  const st = () => { const s = G.state; if (!s.seek || typeof s.seek !== 'object' || !Array.isArray(s.seek.list)) s.seek = { day: -1, list: [], on: false, done: false }; return s.seek; };
  const kindsMet = () => SK.KINDS.filter(k => G.words.met(k));
  SK.ready = () => !!G.state && !!G.state.flags.intro && !!G.pet && G.pet.mine() && kindsMet().length >= 2;
  const story = () => !!G.chapters && !!G.chapters.current(); // a chapter going on: the game waits
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(G.rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  SK.today = function () {
    if (!SK.ready()) return null;
    const s = st(), d = G.words.day();
    if (s.day !== d) {
      const fav = G.favores ? G.favores.today().find(v => v.kind === 'find' && !v.done) : null; // (not the animal Nico's favour is about)
      const kinds = shuffle(kindsMet().filter(k => !fav || fav.word !== k)).slice(0, 3), used = new Set(), list = [];
      // one in the barn when one of them fits there, the others around town
      const barn = kinds.find(k => SK.SPOTS.some(p => p.map === 'granja' && p.kinds.includes(k)));
      for (const k of barn ? [barn].concat(kinds.filter(x => x !== barn)) : kinds) {
        const opts = shuffle(SK.SPOTS.filter(p => p.kinds.includes(k) && !used.has(p.id) && (k === barn && !list.length ? p.map === 'granja' : p.map === 'villa')));
        const p = opts[0] || shuffle(SK.SPOTS.filter(p => p.kinds.includes(k) && !used.has(p.id)))[0];
        if (!p) continue;
        used.add(p.id); list.push({ kind: k, spot: p.id, found: false });
      }
      Object.assign(s, { day: d, list, on: false, done: false });
      G.st.autosave();
    }
    return s.list.length >= 2 ? s : null;
  };
  SK.active = () => { const s = SK.ready() && SK.today(); return !!s && s.on && !s.done && !story(); };
  const left = () => (SK.active() ? st().list.filter(h => !h.found) : []);
  SK.hiding = kind => left().some(h => h.kind === kind);
  const here = f => left().filter(h => spot(h.spot).map === f.mapId);
  // is this animal of the map (animals.js) away hiding? (the brown hen, the last duckling, the others of their kind)
  SK.hides = function (f, a) {
    if (!f || f.mapId !== 'villa' || !SK.hiding(a.kind)) return false;
    if (a.kind === 'gallina') return !a.tint;
    if (a.kind === 'pato') return !!a.baby && !(f.zoo.list.some(o => o.baby && o.trail > a.trail));
    return !a.baby;
  };

  // ---------- Nico (maps.js: his bubble, errands.js: his talk) ----------
  SK.alert = function (who) {
    if (who !== SK.HOST || !SK.ready() || story()) return null;
    const s = SK.today(); return s && !s.on && !s.done ? { icon: 'lupa' } : null;
  };
  SK.talk = function* (who, f) {
    if (who !== SK.HOST || !SK.ready() || story()) return false;
    const s = SK.today(); if (!s || s.done) return false;
    if (!s.on) {
      yield say(who, TT('¡{name}! ¡A jugar a las escondidas!', '{name}! Let\'s play hide-and-seek! The animals are hiding.'));
      yield sayShow(who, { list: s.list.map(h => W(h.kind)) }, TT('¿Dónde están? ¡A buscar!', 'Where are they? Look for an ear or a tail peeking out, and tap it! (in town and in the barn)'));
      s.on = true; rt.quiet = 0; G.st.autosave();
      if (G.pet && G.pet.npc(f)) G.pet.sound('bark');
      return true;
    }
    yield* remind(who, f);
    return true;
  };
  function* remind(who, f) { // the nearest one still hiding: its name and the picture of the place
    const L = left(); if (!L.length) return;
    const p = f && f.player, d = h => { const sp = spot(h.spot); return (sp.map === f.mapId ? 0 : 100) + (p ? Math.abs(sp.at[0] - p.x) + Math.abs(sp.at[1] - p.y) : 0); };
    const h = L.slice().sort((a, b) => d(a) - d(b))[0], sp = spot(h.spot), art = W(h.kind).es.split(' ')[0];
    yield sayShow(who, { icon: sp.place }, TT('¿Y ' + art + ' [' + h.kind + ']? ¡Mira!', 'Where is it hiding? Look near this place!'));
  }

  // ---------- where a hider is, how much of it shows ----------
  const rt = { quiet: 0, trail: null, cry: 0, out: {} }; // (not saved: Canelo's trail, the found ones popping out)
  function pic(kind, flip) { return kind === 'gato' ? null : G.animals.frame({ kind, st: kind === 'pato' ? 'swim' : 'idle', react: 0, t: 0, tint: 0, baby: kind === 'pato', flip }); }
  const size = kind => { if (kind === 'gato') return [11, 14]; const c = pic(kind, false); return [c.width, c.height]; };
  // the line it hides behind and its feet (world px), x its middle
  function geo(sp, kind) {
    const [w, h] = size(kind), x = sp.at[0] * T + 12 + (sp.dx || 0);
    if (sp.how === 'sit') { const b = sp.at[1] * T + sp.y; return { x, cut: null, feet: b, top: b - h, w, h }; }
    const cut = sp.at[1] * T + sp.cut, [lo] = PEEK[kind] || [4, 7];
    return { x, cut, feet: cut + h - lo, top: cut - lo, w, h };
  }
  const near = (f, sp, n) => sp.map === f.mapId && Math.abs(f.player.x - sp.at[0]) + Math.abs(f.player.y - sp.at[1]) <= n;
  // px of it showing now: mostly an ear; every few seconds it pops up to its eyes (more often when you're near)
  function showing(f, h, sp) {
    const [lo, hi] = PEEK[h.kind] || [4, 7], per = near(f, sp, 5) ? 150 : 260, ph = (G.frame + sp.at[0] * 37) % per;
    if (ph < 50) return lo + Math.round((hi - lo) * Math.sin(ph / 50 * Math.PI));
    return lo - ((G.frame >> 4) % 11 === 0 ? 1 : 0); // (an ear twitches)
  }
  SK.where = function (h, f) { // its tap rectangle on screen (game px)
    f = f || G.field; const sp = spot(h.spot), g = geo(sp, h.kind), cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    const top = sp.how === 'sit' ? g.top : g.cut - (PEEK[h.kind] || [4, 7])[1];
    return { x: g.x - 14 - cx, y: top - 8 - cy, w: 28, h: (sp.how === 'sit' ? g.feet : g.cut + 6) - top + 8 + 4 };
  };
  function hit(f, h, wx, wy) {
    const sp = spot(h.spot), r = SK.where(h, f), cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    if (wx - cx >= r.x && wx - cx < r.x + r.w && wy - cy >= r.y && wy - cy < r.y + r.h) return true;
    return Math.floor(wx / T) === sp.at[0] && Math.floor(wy / T) === sp.at[1]; // (its hiding place itself)
  }

  // ---------- finding one ----------
  SK.tap = function (f, tap) {
    if (!tap || f.locked || G.top() !== f) return false;
    const wx = tap.x + Math.round(f.cam.x), wy = tap.y + Math.round(f.cam.y), h = here(f).find(h => hit(f, h, wx, wy));
    if (!h) return false;
    G.chapters.scene(f, found(f, h)); return true;
  };
  SK.poke = function (f, x, y) { // A facing its hiding place (the field is in a search: play it once that ends)
    const h = here(f).find(h => { const sp = spot(h.spot); return sp.at[0] === x && sp.at[1] === y; });
    if (!h) return false;
    f.tasks.add((function* () { while (f.locked) yield 1; G.chapters.scene(f, found(f, h)); })());
    return true;
  };
  function* found(f, h) {
    const sp = spot(h.spot), g = geo(sp, h.kind), K = G.animals.KINDS[h.kind];
    h.found = true; G.st.autosave();
    rt.out[h.spot] = { kind: h.kind, f0: G.frame, flip: f.player.x * T + 12 < g.x }; rt.quiet = 0; rt.trail = null;
    const sx = g.x - Math.round(f.cam.x), sy = (g.cut != null ? g.cut : g.top) - Math.round(f.cam.y);
    G.audio.sfx('chime'); G.fx.burst(sx, sy); G.animals.cry(h.kind);
    yield 30;
    G.animals.meet(h.kind);
    G.state.stars++; G.fx.flyStar(sx, sy - 10); G.audio.sfx('star'); G.fx.say('¡Aquí!', sx, sy - 22, '#f8e060', true);
    yield 30;
    if (G.words.due(h.kind)) yield* G.review.ask(h.kind, { who: null }); // a quick question when its word is due
    const fx = rt.out[h.spot]; if (fx) fx.f0 = Math.max(fx.f0, G.frame - 30); // (stay out a little longer)
    G.world.name(h.kind, g.x, (g.cut != null ? g.cut + 2 : g.feet) - g.h, { cry: K && K.cry, animal: h.kind }); // its name, said; the say-it-back mic
    yield 40;
    if (!st().list.every(x => x.found)) return;
    st().done = true; G.st.autosave();
    G.fx.confetti(G.W / 2 - 70, 140, -1, 18); G.fx.confetti(G.W / 2 + 70, 140, 1, 18); G.audio.jingle('promote');
    yield 30;
    yield G.say([TT('¡Muy bien, {name}! ¡Todos!', 'You found them all, {name}! Hide-and-seek again tomorrow.')]);
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star');
    if (G.hearts) G.hearts.add(SK.HOST, 1, 'care');
  }

  // ---------- every frame (field.js) ----------
  SK.update = function (f) {
    if (!G.state) return;
    const on = SK.active();
    if (f.mapId === 'villa' && f.amb && f.amb.cat) f.amb.cat.hid = on && SK.hiding('gato');
    if (!on || f.locked || G.top() !== f) return;
    const L = here(f);
    // a little cry now and then from one that's close by and peeking up
    for (const h of L) { const sp = spot(h.spot); if (near(f, sp, 4) && (G.frame + sp.at[0] * 37) % 150 === 0 && G.frame - rt.cry > 280) { rt.cry = G.frame; G.animals.cry(h.kind); } }
    // nothing found for a while: Canelo sniffs, and a trail of paw prints leads toward the nearest one
    if (++rt.quiet < 900) return;
    const n = G.pet && G.pet.npc(f); if (!n || n.moving || n.pa) return;
    const to = trailTo(f, n); if (!to) return;
    rt.quiet = 0;
    G.pet.anim(n, 'sniff'); G.pet.sound('bark'); if (G.pet.puff) G.pet.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
    rt.trail = { f, from: [n.x * T + 12, n.y * T + 16], to, f0: G.frame };
  };
  function trailTo(f, n) {
    const L = here(f), d = sp => Math.abs(sp.at[0] - n.x) + Math.abs(sp.at[1] - n.y);
    if (L.length) { const sp = L.map(h => spot(h.spot)).sort((a, b) => d(a) - d(b))[0]; return [sp.at[0] * T + 12, sp.at[1] * T + 14]; }
    const other = left().map(h => spot(h.spot).map).find(m => m !== f.mapId); if (!other) return null;
    const ex = (f.def.exits || []).find(e => e.to === other) || (f.mapId !== 'villa' ? (f.def.exits || []).find(e => e.to === 'villa') : null);
    return ex ? [ex.x * T + 12, ex.y * T + 14] : null;
  }
  SK.hints = f => (rt.trail && rt.trail.f === (f || G.field) ? rt.trail : null);
  SK.hint = function (f) { rt.quiet = 900; }; // (tests: Canelo sniffs on the next free frame)

  // ---------- drawing (field.js: after the ground, before the people; the panel with the HUD) ----------
  function drawKind(ctx, kind, x, feet, flip) { // its picture with its feet at x, feet (screen px)
    if (kind === 'gato') { if (G.ambient && G.ambient.drawCat) G.ambient.drawCat(ctx, x - 4, feet - 12, G.frame); return; }
    const c = pic(kind, flip); ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(feet - c.height));
  }
  SK.draw = function (f, ctx) {
    if (!G.state) return;
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y);
    const tr = SK.hints(f); // Canelo's trail of paw prints
    if (tr) {
      const k = G.frame - tr.f0; if (k > 300) rt.trail = null;
      else {
        const [x0, y0] = tr.from, [x1, y1] = tr.to, len = Math.hypot(x1 - x0, y1 - y0), n = Math.min(6, Math.floor(len / 14));
        ctx.globalAlpha = k > 240 ? (300 - k) / 60 : 1;
        for (let i = 1; i <= n && i * 6 <= k; i++) {
          const u = i * 14 / len, px = Math.round(x0 + (x1 - x0) * u - cx + (i & 1 ? 3 : -3)), py = Math.round(y0 + (y1 - y0) * u - cy);
          ctx.fillStyle = 'rgba(90,56,24,0.85)'; ctx.fillRect(px - 2, py, 4, 3); ctx.fillRect(px - 3, py - 2, 1, 1); ctx.fillRect(px - 1, py - 3, 1, 1); ctx.fillRect(px + 1, py - 3, 1, 1); ctx.fillRect(px + 2, py - 2, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    }
    for (const id in rt.out) { // found: it pops out in front of its hiding place, hops, then trots home (a puff)
      const o = rt.out[id], sp = spot(id); if (!sp || sp.map !== f.mapId) continue;
      const k = G.frame - o.f0; if (k > 200) { delete rt.out[id]; continue; }
      const g = geo(sp, o.kind), base = (g.cut != null ? g.cut + 3 : g.feet), z = k < 24 ? Math.round(Math.sin(k / 24 * Math.PI) * 14) : (k >> 3) % 4 === 0 ? 2 : 0;
      if (k > 176) { ctx.globalAlpha = Math.max(0, (200 - k) / 24); }
      ctx.fillStyle = 'rgba(16,28,8,0.3)'; ctx.fillRect(g.x - 6 - cx, base - 1 - cy, 12, 2);
      drawKind(ctx, o.kind, g.x - cx, base - z - cy, o.flip);
      ctx.globalAlpha = 1;
    }
    if (!SK.active()) return;
    for (const h of here(f)) {
      const sp = spot(h.spot), g = geo(sp, h.kind), flip = f.player.x * T + 12 < g.x;
      if (sp.how === 'sit') { const bob = (G.frame >> 5) % 6 === 0 ? 1 : 0; drawKind(ctx, h.kind, g.x - cx, g.feet - cy + bob, flip); continue; }
      const vis = showing(f, h, sp), feet = g.cut + g.h - vis;
      ctx.save(); ctx.beginPath(); ctx.rect(g.x - 20 - cx, g.cut - 40 - cy, 40, 40); ctx.clip(); // only what's above the line shows
      drawKind(ctx, h.kind, g.x - cx, feet - cy, flip);
      ctx.restore();
    }
  };
  // who is still hiding: a little panel under the bag (top-left), their pictures; the found ones bright with a tick
  SK.drawHud = function (f, ctx) {
    if (!SK.active() || f.locked || G.top() !== f || (G.hint && G.hint.stripShowing())) return;
    if (f.mapId !== 'villa' && f.mapId !== 'granja') return;
    const L = st().list, bag = G.state.bag && G.state.bag.items && G.state.bag.items.length, y = bag ? 30 : 4, w = 26 + L.length * 18;
    G.win(ctx, 4, y, w, 22, { alpha: 0.9 });
    G.drawIcon16(ctx, 'lupa', 8, y + 3);
    L.forEach((h, i) => {
      const x = 26 + i * 18;
      ctx.globalAlpha = h.found ? 1 : 0.6; G.drawIcon16(ctx, h.kind, x, y + 3); ctx.globalAlpha = 1;
      if (h.found) { ctx.fillStyle = '#10102a'; ctx.fillRect(x + 10, y + 12, 7, 6); ctx.fillStyle = '#58d858'; ctx.fillRect(x + 11, y + 15, 2, 2); ctx.fillRect(x + 12, y + 16, 2, 1); ctx.fillRect(x + 13, y + 14, 1, 2); ctx.fillRect(x + 14, y + 13, 2, 1); }
      else G.text(ctx, '?', x + 11, y + 10, '#f8e060', '#10102a'); // (still hiding)
    });
  };
})();
