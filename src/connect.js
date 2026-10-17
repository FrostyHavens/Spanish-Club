// ===== The world, connected (docs/WORLD_PLAN.md, "Recurring characters"): Tomás's letters across the zones, the
// zones' people as friends (hearts, greetings, gifts, surprises), Lola who travels, and the progress of the whole world =====
// The 7-year-old explores five places around Villa Sol; what ties them together is people she recognizes everywhere.
//
// Tomás's letters (G.post): once a day Tomás the mail carrier (in Villa Sol, and some days at a zone's bus stop: he
//   goes on his rounds) has a letter: his bubble shows it. He holds it up with the face of who it's for (someone in a
//   place you've been to: Don Paco, Elena, Ana, Abuela, Don Lucho... or Lola, who is everywhere) and the picture of
//   their place. The letter goes in your hands (a story thing: it can't be dropped); the corner shows it with their
//   face; the guide's arrow leads there (to the bus stop when it's another place: the world map shows the letter over
//   that place, and the bus takes you), and their bubble shows it once you're near. Delivering: "¡Es de Mamá!" (the
//   sender's face), a thank-you, a heart and a star. Every other letter they write back (to the town friend who wrote,
//   or later between places), so letters go both ways and the child travels across the world.
// The zones' people (G.hearts.ZONE): Don Paco, Marina, Doña Nieves, Tere, Elena, Doña Lupe, Ana, Pablo, Don Chuy,
//   Abuela, Abuelo, the baby, Don Lucho, Mateo and Lola have hearts like the town: a greeting a day (after their zone's
//   first chapter: answer it, then one due word from their zone's words, G.review), a thing they like as a present
//   (G.hearts.LIKES), the 3-heart secret (a rare animal of their place, shown in pictures) and sticker, the 5-heart photo.
//   Lola is special: the first time you meet her in each place she gets a heart, so exploring all five places makes her
//   your best friend; the Amigos page shows where you've met her.
// The world's progress (G.progress): per place, its story (its line of chapters), its album page and its friends (all
//   with a sticker): three stars on the world map, the "¡Mi mundo!" page (the world map's trophy, the diploma's second
//   page), the grown-ups' Story progress (a page per place). A place whose story and album page are both complete gets
//   a celebration once ("¡Completo!", ZoneDone).
// The dog: every zone has its spots (zones.js); he follows you on every map (each map has his entry) and on the bus.
//
// API: G.post.state(), .letter() (the letter in your hands: {to, from}), .canOffer(), .pick(zone), .where(npc),
//   .zoneOf(npc), .goal(f) (guide.js tier), .tomasIn() (the zone Tomás visits today, or null), .deliver / .offer
//   (generators). G.progress.story(z) / .album(z) / .friends(z) -> {done|met|m3, of}, .stars(z) -> [story, album,
//   friends], .complete(z), .visitedCount(), .celebrate(z) -> Wait. G.story.world() -> Wait (the "¡Mi mundo!" page).
// Saved: G.state.post = {day (Tomás's letter given), n (delivered), log: {npc: n}}, G.state.world.lolaZ {zone: day},
//   G.state.world.done {zone: day} (celebrated).
'use strict';
(function () {
  const Z = G.zones, H = G.hearts, CH = G.chapters, CK = CH.K, TT = CK.T, TL = G.TILE, K = G.mapKit;
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const day = () => (G.words ? G.words.day() : 0);
  const met = id => !!(G.words && G.words.met(id));
  const bag = () => G.errands.bag;
  const nm = id => G.nameOf(id) || '';
  const short = id => nm(id).replace(/^(Profesora|Señor|Señora|Don|Doña|Abuela) /, '').replace(/ (el|la) .*/, '');
  const opened = () => !!(CH.openerDone && CH.openerDone());

  // =====================================================================
  //  Tomás's letters
  // =====================================================================
  const P = G.post = {};
  function st() {
    const s = G.state; if (!isObj(s.post)) s.post = {};
    const p = s.post; if (!isObj(p.log)) p.log = {}; if (typeof p.n !== 'number') p.n = 0; if (typeof p.day !== 'number') p.day = -1;
    return p;
  }
  P.state = () => (G.state ? st() : null);
  // who writes to whom: a town friend writes to each of the zones' people (and they write back)
  P.FROM = { paco: 'pepe', marina: 'sofia', nieves: 'marta', tere: 'sofia', elena: 'gomez', lupe: 'rosa', ana: 'nico', pablo: 'nico', chuy: 'lucia',
    abuela: 'mama', abuelo: 'mama', lucho: 'luna', mateo: 'luna', lola: 'nico' };
  P.TO = Object.keys(P.FROM); // (the baby gets no letters: she can't read yet)
  P.letter = () => (G.state ? bag().list().find(it => it.id === 'carta' && it.q === 'post' && it.to) || null : null);
  const zonesBeen = () => Z.visitedIds().filter(z => z !== 'villa');
  // the maps where someone is now (their map entries whose cond is true)
  P.where = function (who) {
    const L = [];
    for (const m in G.maps) for (const n of G.maps[m].npcs || []) if (n.id === who && (!n.cond || (() => { try { return n.cond(); } catch (e) { return false; } })())) { L.push(m); break; }
    return L;
  };
  // the place someone lives in (Lola: wherever you are, or the first place you've been to)
  P.zoneOf = function (who) {
    const z = H.zoneOf(who);
    if (z !== '*') return z;
    const here = G.field ? Z.of(G.field.mapId) : null;
    return here && here !== 'villa' && Z.visited(here) ? here : zonesBeen()[0] || null;
  };
  // the ones a letter can go to now: in places you've been to (Lola once you've been to two), the place you're in last
  P.pick = function (here) {
    const been = zonesBeen(), log = st().log;
    let L = P.TO.filter(id => (H.ZONE[id] === '*' ? been.length >= 2 : been.includes(H.ZONE[id])) && P.where(id).length);
    const away = L.filter(id => H.ZONE[id] !== here); if (away.length) L = away;
    const k = id => (P.TO.indexOf(id) * 7 + day()) % P.TO.length; // (ties: an order that turns each day)
    L.sort((a, b) => (log[a] | 0) - (log[b] | 0) || k(a) - k(b));
    return L[0] || null;
  };
  // Tomás has today's letter: after the opener, once a place beyond Villa Sol has been visited, one a day
  P.canOffer = () => !!G.state && opened() && zonesBeen().length > 0 && st().day !== day() && !P.letter() && !!P.pick(G.field ? Z.of(G.field.mapId) : null);
  // the place Tomás visits on his round today (every other day, a place you've been to, in turn), or null
  P.tomasIn = function () {
    if (!G.state || !opened()) return null;
    const been = zonesBeen(); if (!been.length || day() % 2 !== 1) return null;
    return been[(day() >> 1) % been.length];
  };
  // the sender of today's letter: the town friend who writes to them; later, sometimes someone from another place
  function sender(to) {
    const n = st().n, z = H.ZONE[to];
    if (n >= 3 && day() % 2 === 1) {
      const L = P.TO.filter(id => id !== to && H.ZONE[id] !== '*' && H.ZONE[id] !== z && Z.visited(H.ZONE[id]));
      if (L.length) return L[day() % L.length];
    }
    return P.FROM[to] || 'tomas';
  }
  const zonePic = who => { const z = Z.def(P.zoneOf(who)); return H.ZONE[who] === '*' ? { icon: 'explorar' } : z ? { icon: z.icon } : { icon: 'mapa' }; };
  // Tomás hands you today's letter
  P.offer = function* (f) {
    const here = f ? Z.of(f.mapId) : null, to = P.pick(here); if (!to) return false;
    const from = sender(to);
    if (!met('carta')) yield* Z.meetW('carta', { who: 'tomas', prompt: '¡Una [carta]!', en: 'A letter!' });
    yield* CK.sayShow('tomas', { face: to }, TT('¡Una [carta] para ' + short(to) + '!', 'A letter for ' + nm(to) + '! Can you take it, please?'));
    const z = Z.def(P.zoneOf(to));
    if (H.ZONE[to] === '*') yield* CK.sayShow('tomas', { icon: 'explorar' }, TT('¡Lola está en todas partes!', 'Lola is everywhere: find her in any place you\'ve been to!'));
    else if (z) yield* CK.sayShow('tomas', { icon: z.icon }, TT('¡' + z.name + '!', nm(to) + ' lives at ' + (z.en || z.name) + '. Follow the arrow: the bus is quickest!'));
    st().day = day(); G.st.autosave();
    bag().add('carta', { q: 'post', to, from }); G.audio.jingle('item');
    return true;
  };
  // tapping the one it's for: they take it, it's from someone, a heart and a star; every other letter, a reply
  P.deliver = function* (who, f) {
    const it = P.letter(); if (!it || it.to !== who) return false;
    yield* CK.sayShow(who, { icon: 'carta' }, TT(met('carta') ? '¡Una [carta]! ¿Para mí?' : '¡Oh! ¿Para mí?', 'A letter! For me?'));
    bag().take('carta', { q: 'post', to: who }); G.audio.jingle('item');
    if (G.cards && met('carta')) G.cards.grow('carta', 'give', { x: G.W / 2, y: G.H / 2 });
    if (it.from && it.from !== who) yield* CK.sayShow(who, { face: it.from }, TT('¡Es de ' + short(it.from) + '!', 'It\'s from ' + (it.from === 'canelo' ? G.dogName() : nm(it.from)) + '!'));
    const s = st(); s.n++; s.log[who] = (s.log[who] | 0) + 1;
    G.state.stars++; G.fx.flyStar(G.W / 2, 90, 0); G.audio.sfx('star'); CK.confetti();
    yield* CK.say(who, TT(met('gracias') ? '¡[gracias:Gracias], {name}!' : '¡Gracias, {name}!', 'Thank you, {name}!'));
    if (H.add(who, 1, 'errand')) { yield 30; yield* H.milestones(who); }
    // the other way: a reply to the one who wrote (a town friend, or someone in another place), every other letter
    const back = it.from;
    if (!it.reply && back && back !== 'tomas' && back !== who && s.n % 2 === 1 && P.where(back).length && H.WHO.includes(back)) {
      yield* CK.sayShow(who, { face: back }, TT('¡Y una [carta] para ' + short(back) + '!', 'And here\'s a letter back for ' + nm(back) + '! Can you take it?'));
      bag().add('carta', { q: 'post', to: back, from: who, reply: true }); G.audio.jingle('item');
    }
    G.st.autosave();
    return true;
  };
  P.alertFor = who => { const it = P.letter(); return it && it.to === who ? [[{ icon: 'carta', letter: who }, 1]] : null; };
  // the guide (guide.js, right after a favour going on): to whoever the letter is for; another place: the bus stop
  P.goal = function (f) {
    const it = P.letter(); if (!it || !f) return null;
    const why = 'letter to ' + it.to;
    const n = f.npcs.find(n => n.id === it.to && n.spec && !n.hidden);
    if (n) return { why, pts: [{ x: n.x * TL + (n.ox || 0) + 12, y: n.y * TL + (n.oy || 0) + 12, lift: 44, npc: n }] };
    const maps = P.where(it.to); if (!maps.length) return null;
    const here = Z.area(f.mapId), same = maps.find(m => Z.area(m) === here);
    if (same) return { why, map: same, far: true, badge: { who: it.to } };
    const tz = P.zoneOf(it.to), z0 = Z.def(Z.of(f.mapId)), target = maps.find(m => Z.of(m) === tz) || maps[0];
    if (z0 && z0.bus && z0.bus.map === f.mapId && tz && Z.visited(tz)) return { why: why + ' (bus)', bus: true, pts: [{ x: z0.bus.at[0] * TL + 12, y: z0.bus.at[1] * TL + 12, lift: 30, icon: 'autobus' }], badge: { who: it.to } };
    return { why, map: target, far: true, badge: { who: it.to } };
  };

  // ---------- Tomás on his round: some days at a place's bus stop ----------
  // a free tile next to where the bus leaves you (not the stop, not an exit, not the entry itself)
  function nearEntry(z) {
    const e = z.entry, rows = G.MAPDATA[e.map] && G.MAPDATA[e.map].rows; if (!rows) return null;
    const land = []; for (const m in G.maps) for (const x2 of G.maps[m].exits || []) if (x2.to === e.map) land.push([x2.tx, x2.ty]); // (where you arrive: never in the way)
    const busy = (x, y) => land.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) <= 1) || (G.maps[e.map].npcs || []).some(n => Math.abs(n.x - x) + Math.abs(n.y - y) <= 0) || (G.maps[e.map].dogSpots || []).some(d => d.at[0] === x && d.at[1] === y);
    const ok = (x, y) => { const t = G.TERRAIN[(rows[y] || '')[x]]; return !!t && !t.block && !t.wall && !(z.bus && z.bus.at[0] === x && z.bus.at[1] === y) && !(G.maps[e.map].exits || []).some(x2 => x2.x === x && x2.y === y) && !(x === e.x && y === e.y) && !busy(x, y); };
    const D = [[2, 0], [-2, 0], [2, 1], [-2, 1], [2, -1], [-2, -1], [3, 0], [-3, 0], [1, 2], [-1, 2], [2, 2], [-2, 2]];
    for (const road of [false, true]) for (const [dx, dy] of D) if (ok(e.x + dx, e.y + dy) && (road || (rows[e.y + dy] || '')[e.x + dx] !== ',')) return [e.x + dx, e.y + dy]; // (off the road first)
    return null;
  }
  P.tomasAt = {};
  for (const z of Z.LIST) {
    if (z.id === 'villa' || !z.entry || !G.maps[z.entry.map]) continue;
    const at = nearEntry(z); if (!at) continue;
    P.tomasAt[z.id] = { map: z.entry.map, at };
    G.maps[z.entry.map].npcs.push({ id: 'tomas', npc: 'tomas', x: at[0], y: at[1], dir: 'down', fixed: true, cond: () => P.tomasIn() === z.id,
      alert: () => (G.errands && G.errands.alert('tomas')) || (G.favores && G.favores.alert('tomas')) || null,
      talk: function* (f) {
        yield* K.hello('tomas');
        if (G.errands && (yield* G.errands.talk('tomas', f))) return;
        yield* CK.sayShow('tomas', { icon: 'carta' }, TT(met('carta') ? '¡[hola:Hola], {name}! ¡Mis [carta:cartas]!' : '¡Hola, {name}!', 'Hi, {name}! I bring the letters everywhere, even out here!'));
      } });
  }

  // ---------- every person's talk and bubble: a letter for them first; the zones' people greet you ----------
  const lolaZ = () => { const w = Z.state(); if (!isObj(w.lolaZ)) w.lolaZ = {}; return w.lolaZ; };
  function wrap(def) {
    const id = def.id; if (!id || id === 'canelo' || def._post) return;
    def._post = true;
    const t0 = def.talk, a0 = def.alert;
    def.alert = function () {
      if (!G.state) return a0 ? a0.apply(this, arguments) : null;
      const a = P.alertFor(id); if (a) return a;
      const b = a0 ? a0.apply(this, arguments) : null; if (b) return b;
      if (H.ZONE[id] && G.errands) { const e = G.errands.alert(id); if (e) return e; } // (a present they'd like: the zones' own bubbles don't ask errands.js)
      return id === 'tomas' && P.canOffer() ? { icon: 'carta' } : null;
    };
    def.talk = function* (f, n) {
      if (G.state && H.WHO.includes(id)) { yield* H.greet(id); yield* H.milestones(id); } // (once a day: the town's own talk, maps.js, greets too, after this it's a no-op)
      if (G.state && (yield* P.deliver(id, f)) && !CH.alert(id)) return;
      if (G.state && id === 'tomas' && !CH.alert('tomas') && !(G.favores && G.favores.alert('tomas')) && P.canOffer() && (yield* P.offer(f))) return;
      const lz = id === 'lola' && G.state && f ? Z.of(f.mapId) : null, first = lz && lz !== 'villa' && !lolaZ()[lz];
      if (t0) yield* t0.call(this, f, n);
      if (first && !lolaZ()[lz]) { // Lola: a heart the first time you meet her in each place
        lolaZ()[lz] = { d: day() }; G.st.autosave();
        if (H.add('lola', 1, 'errand')) { yield 30; yield* H.milestones('lola'); }
      }
    };
  }
  for (const m in G.maps) for (const def of G.maps[m].npcs || []) wrap(def);
  // the letter in your hands: its picture has the face of who it's for (the corner, the bubbles)
  { const icon0 = bag().icon; bag().icon = it => (it && it.id === 'carta' && it.to ? { icon: 'carta', letter: it.to } : icon0(it)); }

  // ---------- the zones' people: their 3-heart secret (a rare animal of their place, in pictures) ----------
  const RARE_EN = { noche: 'at night', manana: 'in the morning', sol: 'when the sun shines', elsol: 'when the sun shines', dia: 'by day' };
  function* zoneSecret(npc) {
    const z = P.zoneOf(npc), zd = Z.def(z), AN = G.animals;
    const rare = zd && zd.rare ? Object.keys(zd.rare).find(id => AN.KINDS[id] && !AN.met(id)) : null;
    if (rare) {
      const when = zd.rare[rare], pic = AN.KINDS[rare].word;
      yield* CK.sayShow(npc, { list: [pic, when === true ? 'estrella' : when] }, TT('¡Un secreto! ¡Mira!', 'A secret! An animal for your album hides here' + (RARE_EN[when] ? ', ' + RARE_EN[when] : '') + '. Look for it!'));
      return;
    }
    const pg = Object.values((G.maps[(zd && zd.entry && zd.entry.map) || ''] || {}).pages || {}).find(p => G.pages && G.pages.ready(p));
    if (pg) { yield* CK.sayShow(npc, { icon: 'pagina' }, TT('¡Un secreto! ¡Una página!', 'A secret! A notebook page puzzle sparkles somewhere here.')); return; }
    yield* CK.say(npc, TT('¡Eres muy simpátic{o/a}, {name}!', 'You\'re very nice, {name}!'));
  }
  for (const npc in H.ZONE) if (!H.secrets[npc]) H.secrets[npc] = zoneSecret;

  // =====================================================================
  //  The world's progress
  // =====================================================================
  const PR = G.progress = {};
  PR.lineIds = z => CH.writtenIds().filter(id => CH.lineOf(id) === z);
  PR.story = z => { const L = PR.lineIds(z); return { done: L.filter(CH.done).length, of: L.length }; };
  PR.album = z => (G.album && G.album.zoneCount ? G.album.zoneCount(z) : { met: 0, of: 0 });
  PR.albumDone = z => { const c = PR.album(z); return !!c.of && c.met === c.of && G.album.entries(z).every(Boolean); };
  PR.people = z => H.inZone(z);
  PR.friends = z => { const L = PR.people(z); return { m3: L.filter(n => H.get(n) >= 3).length, of: L.length, hearts: L.reduce((s, n) => s + H.get(n), 0) }; };
  PR.stars = z => { const s = PR.story(z), f = PR.friends(z); return [!!s.of && s.done === s.of, PR.albumDone(z), !!f.of && f.m3 === f.of]; };
  PR.complete = z => { const s = PR.stars(z); return s[0] && s[1]; };
  PR.visitedCount = () => Z.ids().filter(id => id === 'villa' || Z.visited(id)).length;
  const doneS = () => { const w = Z.state(); if (!isObj(w.done)) w.done = {}; return w.done; };
  PR.celebrated = z => !!(G.state && doneS()[z]);
  // three little stars (story, album, friends): gold when earned (the world map, "¡Mi mundo!")
  PR.drawStars = function (ctx, z, cx, y) {
    PR.stars(z).forEach((on, k) => G.text(ctx, '\u0005', cx - 13 + k * 9, y, on ? '#f8d040' : '#8a8098', on ? '#5a2c04' : '#2a2438'));
  };

  // ---------- a place complete (its story and its album page): a celebration, once ----------
  class ZoneDone {
    constructor(w, z) { this.w = w; this.z = Z.def(z); this.t = 0; this.transparent = true; }
    onEnter() { G.audio.jingle('promote'); CK.confetti(); if (G.speak) G.speak('¡' + this.z.name + '! ¡Completo!'); }
    closeXY() { return [G.W - 28, 6]; }
    update() {
      this.t++;
      if (this.t % 45 === 20) { G.fx.confetti(40 + Math.random() * 60, 200, -1, 14); G.fx.confetti(G.W - 40 - Math.random() * 60, 200, 1, 14); }
      if (this.t > 230 || (this.t > 50 && (G.input.tap() || G.input.p('A') || G.input.p('B')))) { G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const k = Math.min(1, this.t / 18), s = 0.4 + 0.6 * (1 - Math.pow(1 - k, 3)), cx = G.W / 2, cy = 98, z = this.z;
      ctx.fillStyle = 'rgba(16,16,42,0.55)'; ctx.fillRect(0, 0, G.W, G.H);
      const r = Math.round(48 * s);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + this.t / 50; ctx.fillStyle = i & 1 ? '#f8e060' : '#f8a030'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (r + 9), cy + Math.sin(a) * (r + 9), 5, 0, Math.PI * 2); ctx.fill(); } // a gold rosette
      ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      const sz = Math.round(4 * s) || 1; G.drawIcon16(ctx, z.icon, cx - 8 * sz, cy - 8 * sz, sz);
      if (this.t > 18) {
        G.bigText(ctx, z.name, cx, cy + r + 14, 2, '#fff070', '#401010');
        G.bigText(ctx, '¡Completo!', cx, cy + r + 34, 2, '#f8d040', '#401010');
        const st3 = PR.stars(z.id); st3.forEach((on, i) => { const b = Math.round(Math.sin(this.t / 8 + i) * 2); ctx.globalAlpha = on ? 1 : 0.3; G.drawIcon16(ctx, 'estrella', cx - 70 + i * 48 + (i === 1 ? 6 : 0), 4 + b + (i === 1 ? 0 : 6), 2); ctx.globalAlpha = 1; });
      }
    }
  }
  PR.celebrate = z => { const w = new G.Wait(); G.push(new ZoneDone(w, z)); return w; };
  // checked every frame on the map (errands.js update): the place you're in, once its story and album are complete
  PR.update = function (f) {
    if (!G.state || !f || f.locked || G.top() !== f || G.fade.a > 0 || f.player.moving || (G.album.discovering && G.album.discovering())) return;
    const z = Z.of(f.mapId); if (!z || PR.celebrated(z) || !PR.complete(z)) return;
    doneS()[z] = { d: day() }; G.st.autosave();
    f.locked = true;
    f.tasks.add((function* () { try { yield PR.celebrate(z); } finally { f.locked = false; } })());
  };
  { const eu = G.errands.update; G.errands.update = function (f) { eu(f); PR.update(f); }; }

  // ---------- "¡Mi mundo!": the whole world on one page (the world map's trophy; the diploma's second page) ----------
  G.story.drawWorld = function (ctx, t) {
    const x = 10, y = 6, w = G.W - 20, h = G.H - 12;
    ctx.fillStyle = '#5a3810'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4); ctx.fillStyle = '#f8f0d0'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#c09040'; ctx.strokeRect(x + 3.5, y + 3.5, w - 7, h - 7);
    G.drawIcon16(ctx, 'trofeo', x + 8, y + 6, 2);
    G.bigText(ctx, '¡Mi mundo!', G.W / 2, y + 8, 2, '#a05020', null);
    G.textC(ctx, G.st.playerName(), G.W / 2, y + 26, '#203080', null);
    // the totals: places, words, animals, friends
    const AN = G.animals, all = AN ? AN.list().length : 0, seen = AN ? AN.list().filter(AN.met).length : 0;
    const friends = H.WHO.filter(n => H.get(n) > 0).length;
    const items = [['mapa', PR.visitedCount() + '/' + Z.ids().length], ['book', String(G.st.learnedCount())], ['pata', seen + '/' + all], ['heart', friends + '/' + H.WHO.length]];
    items.forEach(([ic, s], k) => {
      const ix = x + 16 + k * 74, iy = y + 40;
      if (ic === 'book') G.drawIcon(ctx, 'book', ix, iy - 4); else if (ic === 'heart') H.heart(ctx, ix + 4, iy + 1, true, 2); else G.drawIcon16(ctx, ic, ix + 2, iy - 2);
      G.text(ctx, s, ix + (ic === 'book' ? 28 : 24), iy + 3, '#604020', null);
    });
    // a card per place: its picture, its name, three stars, its story, album and hearts
    Z.ids().forEach((id, k) => {
      const z = Z.def(id), been = id === 'villa' || Z.visited(id), cx = x + 7 + (k % 3) * 97, cy = y + 62 + Math.floor(k / 3) * 70, cw = 92, ch = 66;
      const done = PR.complete(id);
      ctx.fillStyle = done ? '#f8d870' : been ? '#fffaf0' : '#d8ccb0'; ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = done ? '#b07000' : '#b09068'; ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1);
      if (been) G.drawIcon16(ctx, z.icon, cx + 4, cy + 4, 2);
      else { ctx.globalAlpha = 0.8; ctx.imageSmoothingEnabled = false; ctx.drawImage(G.tinted(G.icon(z.icon), '#3a3048', 'wdsil' + id), cx + 4, cy + 4, 32, 32); ctx.globalAlpha = 1; G.bigText(ctx, '?', cx + 20, cy + 12, 2, '#f8e060', '#10102a'); }
      const short = z.name.replace(/^(El|La) /, '').replace('parque de ', '').replace('casa de los ', '');
      G.text(ctx, been ? short.charAt(0).toUpperCase() + short.slice(1) : '? ? ?', cx + 40, cy + 6, '#604020', null);
      if (been) {
        PR.drawStars(ctx, id, cx + 54, cy + 18);
        const s = PR.story(id), a = PR.album(id), fr = PR.friends(id);
        G.drawIcon16(ctx, 'bandera', cx + 40, cy + 30); G.text(ctx, s.done + '/' + s.of, cx + 58, cy + 34, '#604020', null);
        G.drawIcon16(ctx, 'pata', cx + 4, cy + 46); G.text(ctx, a.met + '/' + a.of, cx + 22, cy + 50, '#2860a8', null);
        H.heart(ctx, cx + 56, cy + 50, true, 1); G.text(ctx, String(fr.hearts), cx + 66, cy + 50, '#c04870', null);
      }
    });
    if (G.enVisible()) G.textC(ctx, 'Places, words, animals, friends; a star per place for its story, album, friends', G.W / 2, y + h - 12, '#a07030', null);
    void t;
  };
  class WorldPage {
    constructor(w) { G.toastT = 0; this.w = w; this.t = 0; this.transparent = true; }
    onEnter() { G.audio.jingle('item'); if (G.speak) G.speak('¡Mi mundo!'); }
    closeXY() { return [G.W - 28, 6]; }
    update() { this.t++; if (this.t > 20 && (G.input.tap() || G.input.p('A') || G.input.p('B'))) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); } }
    draw(ctx) { ctx.fillStyle = 'rgba(16,16,42,0.5)'; ctx.fillRect(0, 0, G.W, G.H); G.story.drawWorld(ctx, this.t); }
  }
  G.story.world = function () { const w = new G.Wait(); G.push(new WorldPage(w)); return w; };

  // ---------- the world map: three stars over each place, the letter over the place it's going to ----------
  Z.MAPDRAW.push(function (ctx, m) {
    for (const id of Z.ids()) {
      const n = m.node(id); if (!n || !(id === 'villa' || Z.visited(id))) continue;
      PR.drawStars(ctx, id, n.x, n.y - n.r - 11);
    }
    const it = P.letter(); if (!it) return;
    const tz = P.zoneOf(it.to), n = tz && m.node(tz); if (!n) return;
    const b = Math.round(Math.sin(m.t / 7) * 2);
    G.win(ctx, n.x - n.r - 16, n.y - 2 + b, 22, 22, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 });
    G.drawIcon16(ctx, { icon: 'carta', letter: it.to }, n.x - n.r - 13, n.y + 1 + b);
  });
})();
