// ===== The guide: the next thing to do is always in sight while you're free to walk (docs/INTUITIVE_AUDIT.md) =====
// Children don't read the Spanish instructions and don't open menus (docs/PLAYTEST_NOTES.md, 2026-10-11): so there is
// always ONE goal, shown without words:
//   on screen      a bouncing yellow arrow over it (over its bubble, over a door's sign)
//   off screen     an arrow at the screen's edge pointing the way, with a little picture of who or what waits there
//   in a building  the arrow is on the way out; outside, on the right door (with the picture of who is inside)
//   choices        a puzzle's places to choose from (which bush has the red ball, who says "¡miau!") all get a smaller
//                  white arrow, so it shows WHERE to look without giving the answer away
//   idle ~4 s      Canelo trots a few tiles toward the goal, barks and looks back at you
// The goal, most important first: (on a night walk after the Hoy card, day.js: the night animal she came to see) >
// the story's chapter (its beat: a person, a place, an animal, a door, a find-it puzzle; the next chapter's giver; a
// review day's teacher) > home at sunset > a favour going on or offered > a place she asked for on the world map >
// Tomás's letter in your hands (to whoever it's for; another place: the bus stop, src/connect.js; it waits while she's
// in a place she picked herself) > a zone's task > Nico's
// hide-and-seek (only the edge arrow: the peeking ears are the game; the arrow over one after a long wait) > Canelo's
// "?", Luna's palabra del día, Inés's pages, a side job, anyone else with a bubble > (the next chapter, then Tomás's
// letter of the day, exploring, a letter that waited) > the day's play (src/carry.js, this part of the world first: what
// you hold to whoever would love it, or Canelo; empty-handed, today's next play: fetch, an apple for Luna, a flower for
// Mamá, the bone, an egg for Rosa, bread for the ducks, a page puzzle... and a game of fetch is always there). So there
// is never a dead end: between chapters, while today's new words are used up, before the evening chapter, the arrow
// points at something fun that teaches nothing new (docs/INTUITIVE_AUDIT.md, step 2); at sunset it's home, and at
// home your bed. A favour that sends you to a place or an animal named only by its word is the word being
// remembered: its arrow (and Canelo's trot) only come as a hint, after ~10 s of standing about.
// The hint hand (hint.js) taps on the same goal after a few seconds of doing nothing, when it's on screen.
// Following the arrow never goes round in circles (docs/AUDIT_2026-10.md C1-C3): "go in there" and "do this" come from the
// same rules (a door is shown for something only when the arrow would show that thing inside: the waitsIn of a map
// counts a chapter only once it's going on; a bubble shows only when its talk can run, src/phrases.js canRun), and a
// safety net below sets aside a goal that led nowhere anyway. Nothing it points at hides under a corner button: the
// arrow is never drawn on one, and a tap on its target there goes to the target (wins, field.js).
// API: G.guide.goal(f) -> {why, map, pts: [{x, y, lift, npc?, icon?}] (world px; several = a choice), soft, via: 'door'}
//   or null; G.guide.at (what is drawn now, screen px: {x, y, edge, dir, why, marks}: tests and tools/naivebot.js read
//   it); G.guide.handAt(f) (hint.js); G.guide.update(f) / .draw(f, ctx) (field.js); .wins(f, tap) (field.js: the
//   target under a corner button wins the tap); .loops (the safety net's log: tools/test-live.js); .place(f, g) (where
//   the arrow for goal g goes now, tests); .arrow(ctx, x, y, small, col, up) (the arrow itself: the world map, zones.js).
'use strict';
(function () {
  const GD = G.guide = {}, T = G.TILE;
  GD.IDLE_TROT = 240;   // frames of doing nothing before Canelo trots toward the goal (~4 s)
  GD.IDLE_SOFT = 600;   // ... before a hide-and-seek animal gets the arrow over it (~10 s)
  GD.at = null;
  let idle = 0, trotCool = 0, trotted = null, lastGoal = null, shownT = 0;

  const alerting = n => { try { const a = n.alert && n.alert(); return a && !a.wait ? a : null; } catch (e) { return null; } };
  const here = (f, who) => (who === 'canelo' ? (G.pet && G.pet.npc(f)) : f.npcs.find(n => n.id === who && n.spec && !n.hidden)) || null;
  // The open world (docs/WORLD_PLAN.md): the guide SUGGESTS things to do NEAR you, in the zone you're in (a path between
  // zones is its own little area), never "go back to town now". Someone or something on another map counts only when
  // that map is in this zone; the way there is found over every map's exits (G.zones.route).
  const area = m => (G.zones ? G.zones.area(m) : 'villa');
  const curArea = () => (G.field ? area(G.field.mapId) : 'villa');
  const near = m => !m || area(m) === curArea();
  const mapOfNpc = (who, far) => { const L = []; for (const m in G.maps) if ((G.maps[m].npcs || []).some(n => n.id === who && (!n.cond || n.cond()))) L.push(m); return L.find(near) || (far && L[0]) || null; }; // (far: anywhere, the day's play from a zone)
  const mapOfAnimal = kind => { for (const m in G.maps) if ((G.maps[m].animals || []).some(a => a.kind === kind) && near(m)) return m; return null; };
  // a person as a goal (world px of their middle; lift: how far above it the arrow goes, over the head and the bubble)
  const person = (n, why) => ({ x: n.x * T + (n.ox || 0) + 12, y: n.y * T + (n.oy || 0) + 12, lift: alerting(n) ? 44 : 24, npc: n, why });
  const tileP = (x, y, lift, o) => Object.assign({ x: x * T + 12, y: y * T + 12, lift }, o || {});
  const ctxOf = L => G.chapters.ctx(L.id);
  const whenOk = L => { try { return !L.b.when || !!L.b.when(ctxOf(L)); } catch (e) { return false; } };

  // ---------- the goal, tier by tier: each returns {why, map?, pts?, choice?, soft?, badge?} or null ----------
  function chapterGoal(f) {
    const CH = G.chapters; if (!CH || !G.state) return null;
    // a find-it puzzle going on (the puppy hiding, which way the park is): its picture bubbles are the choices
    const F = G.state.finds || {};
    for (const id in F) {
      const s = F[id]; if (s.found) continue;
      if (s.map !== f.mapId) return { why: 'find ' + id, map: s.map, badge: { icon: id } };
      if (s.pics) return { why: 'find ' + id, map: s.map, choice: true, pts: s.pics.map(([x, y, ic]) => tileP(x, y, 42, { icon: ic })) };
      const [x, y] = s.at.split(',').map(Number);
      return { why: 'find ' + id, map: s.map, pts: [tileP(x, y, 14)] };
    }
    if (CH.needsReview() && (!G.zones || G.zones.area(f.mapId) === 'villa')) { const who = CH.reviewer(), n = here(f, who); return n ? { why: 'review ' + who, pts: [person(n)] } : { why: 'review ' + who, map: mapOfNpc(who), badge: { who } }; } // (a review day is Villa Sol's: out in a zone, its story's beat still leads)
    const L = CH.live(); if (!L || !L.b) return null;
    if (!L.started && !GD.laterChapter) return null; // (a chapter not started yet is a suggestion among the others: chapterLater)
    const b = L.b, why = L.id + ':' + L.k;
    if (b.evening) return G.day && G.day.over() ? { why: why + ' evening', map: 'casa', home: true, badge: { icon: 'noche' } } : null;
    if (!whenOk(L)) return null;
    const au = CH.autoOf(L);
    if (au) return au === true || au === f.mapId ? null : { why, map: au, badge: { icon: CH.def(L.id).icon } }; // (it starts by itself there)
    const ts = CH.targets(f);
    if (ts.length) {
      const spots = b.spots || (b.spot ? [b.spot] : []);
      const bubble = t => { const m = /^ch:[^:]+:(\d+)$/.exec(t.spot || ''), sp = m && spots[+m[1]]; return !!(sp && !sp.quiet && sp.icon); }; // (a place with a picture bubble: the arrow goes over it)
      const pts = ts.map(t => Object.assign({ x: t.x, y: t.y, lift: t.door ? 28 : t.npc ? 24 : t.cat || t.animal ? 14 : bubble(t) ? 42 : 14 }, t.npc ? { npc: here(f, t.npc) } : {}, t.door ? { door: true } : {}));
      const secret = ts.every(t => t.secret);
      if (secret && pts.length === 1 && (ts[0].cat || ts[0].animal || ts[0].npc)) addDecoys(f, pts); // (who says "¡miau!": the cat AND Canelo get an arrow; the last bush to look in is just that bush)
      return { why, pts, choice: secret };
    }
    if (b.who) {
      const n = here(f, b.who);
      if (n) return { why, pts: [person(n)] };
      return { why, map: b.who === 'canelo' ? null : mapOfNpc(b.who), badge: { who: b.who } };
    }
    const sp = b.spots || (b.spot ? [b.spot] : []);
    if (sp.length) return { why, map: sp[0].map, badge: { icon: sp[0].icon && typeof sp[0].icon === 'string' ? sp[0].icon : CH.def(L.id).icon } };
    if (b.door) return { why, map: b.door, badge: { icon: CH.def(L.id).icon } };
    if (b.tap) return { why, map: b.tap === 'cat' ? 'villa' : b.tap === 'canelo' ? null : mapOfAnimal(b.tap), badge: { icon: b.tap === 'cat' ? 'gato' : b.tap } };
    return null;
  }
  // the others to choose from when a puzzle's answer is a single animal (Canelo, the cat, a duck: whoever is here)
  function addDecoys(f, pts) {
    const near = (x, y) => pts.some(p => Math.abs(p.x - x) < 14 && Math.abs(p.y - y) < 14);
    const add = (x, y, o) => { if (!near(x, y)) pts.push(Object.assign({ x, y, lift: 18 }, o)); };
    const dog = G.pet && G.pet.npc(f); if (dog) add(dog.x * T + 12, dog.y * T + 12, { npc: dog });
    const cat = f.amb && f.amb.cat; if (cat && !cat.away && !cat.hid) add(cat.x * T + 12, cat.y * T - 2);
    if (G.animals && G.words.met('pato')) { const d = G.animals.find('pato', f); if (d) add(Math.round(d.x), Math.round(d.y - 6)); }
  }
  function sunsetGoal(f) {
    if (!G.day || !G.day.over()) return null;
    if (f.mapId === 'casa') return f.evening ? null : { why: 'bed (sunset)', pts: [tileP(7, 2, 20, { icon: 'noche' })] }; // (home already: your bed ends the day, maps.js)
    const d = G.day.homeDoor(f); if (d) return { why: 'home (sunset)', pts: [tileP(d[0], d[1], 48, { door: true, icon: 'noche' })] }; // (over the moon bubble)
    return { why: 'home (sunset)', map: 'casa', far: true, badge: { icon: 'noche' } };
  }
  function favourGoal(f) {
    const FV = G.favores; if (!FV || !G.state || !FV.today) return null;
    const L = FV.today(), on = L.find(v => v.on && !v.done);
    if (on) {
      // (the place or animal is the word being remembered: the arrow only comes as a hint, after a while)
      const ts = FV.targets(f); if (ts.length) return { why: 'favour ' + on.kind + ' ' + on.word, quiz: true, pts: ts.map(t => ({ x: t.x, y: t.y, lift: t.animal ? 18 : 22 })) };
      for (const m in G.maps) if (FV.waitsIn(m)) return { why: 'favour go ' + on.word, quiz: true, map: m, badge: { icon: G.maps[m].icon || 'carta' } };
      if (on.kind === 'find') return { why: 'favour find ' + on.word, quiz: true, map: mapOfAnimal(on.word), badge: { icon: on.word } };
      return null;
    }
    for (const v of L) {
      if (v.done || !FV.alert(v.who)) continue;
      const n = here(f, v.who); if (n) return { why: 'favour ' + v.who, pts: [person(n)] };
      const m = mapOfNpc(v.who); if (m) return { why: 'favour ' + v.who, map: m, badge: { who: v.who } };
    }
    return null;
  }
  function seekGoal(f) {
    const SK = G.seek; if (!SK || !G.state) return null;
    if (SK.alert && SK.alert(SK.HOST)) { const n = here(f, SK.HOST); return n ? { why: 'seek: Nico', pts: [person(n)] } : { why: 'seek: Nico', map: mapOfNpc(SK.HOST), badge: { who: SK.HOST } }; }
    if (!SK.active()) return null;
    const p = f.player, L = SK.list().filter(h => !h.found).map(h => ({ h, sp: SK.SPOTS.find(s => s.id === h.spot) }));
    const mine = L.filter(o => o.sp.map === f.mapId).sort((a, b) => Math.abs(a.sp.at[0] - p.x) + Math.abs(a.sp.at[1] - p.y) - Math.abs(b.sp.at[0] - p.x) - Math.abs(b.sp.at[1] - p.y));
    if (mine.length) return { why: 'seek ' + mine[0].h.kind, soft: true, pts: [tileP(mine[0].sp.at[0], mine[0].sp.at[1], 26, { icon: mine[0].h.kind })] };
    if (L.length) return { why: 'seek ' + L[0].h.kind, soft: true, map: L[0].sp.map, badge: { icon: 'lupa' } };
    return null;
  }
  function reviewGoal(f) {
    const dog = G.pet && G.pet.npc(f);
    if (dog && alerting(dog)) return { why: 'canelo ?', pts: [person(dog)] };
    const FV = G.favores;
    if (FV && FV.palabraReady && FV.palabraReady()) { const n = here(f, 'luna'); return n ? { why: 'palabra', pts: [person(n)] } : { why: 'palabra', map: mapOfNpc('luna'), badge: { who: 'luna' } }; }
    if (FV && FV.pageReady && FV.pageReady()) { const n = here(f, 'ines'); return n ? { why: 'pages', pts: [person(n)] } : { why: 'pages', map: mapOfNpc('ines'), badge: { who: 'ines' } }; }
    const E = G.errands;
    if (E && E.spots) { const sp = E.spots(f).filter(s => !s.quiet && !(s.nohint && s.nohint()))[0]; if (sp) return { why: 'job ' + sp.id, pts: [tileP(sp.at[0], sp.at[1], 42)] }; }
    // anyone else on this map with a bubble (a present they'd like...), the nearest
    const Lc = G.chapters && G.chapters.live(), later = Lc && !Lc.started && Lc.b && Lc.b.who; // (the next chapter's giver: a suggestion for later, chapterLater)
    const p = f.player, ns = f.npcs.filter(n => n.spec && !n.hidden && alerting(n) && !alerting(n).later && n.id !== later).sort((a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - Math.abs(b.x - p.x) - Math.abs(b.y - p.y));
    if (ns.length) return { why: 'bubble ' + ns[0].id, pts: [person(ns[0])] };
    // something inside another map: only what its own arrow would show there (a chapter not started yet is chapterLater's
    // to offer, by its own rules: counting it here sent "go explore" in and out of the front door, AUDIT C1)
    if (E && E.waitsIn) for (const m in G.maps) if (m !== f.mapId && E.waitsIn(m, { started: true })) return { why: 'job in ' + m, map: m, badge: { icon: G.maps[m].icon || 'pregunta' } };
    return null;
  }
  // the day's play (carry.js): never a dead end. Something in this part of the world first (carry.js plan); only when
  // there is nothing here, the way to it (far: from a zone back to Villa Sol), so the arrow never just disappears
  function playGoal(f) {
    const C = G.carry; if (!C || !C.plan) return null;
    const p = C.plan(f); if (!p) return null;
    const why = 'play: ' + p.why, far = !!p.far;
    if (p.dog) { const n = G.pet && G.pet.npc(f); return n ? { why, play: true, pts: [Object.assign(person(n), { icon: p.icon })] } : { why, play: true, map: 'villa', far: true, badge: { icon: 'perro' } }; }
    if (p.who) { const n = here(f, p.who); return n ? { why, play: true, pts: [person(n)] } : { why, play: true, map: mapOfNpc(p.who, far), far, badge: { who: p.who } }; }
    if (p.map === f.mapId) return { why, play: true, pts: [tileP(p.at[0], p.at[1], 20, { icon: p.icon })] };
    return { why, play: true, map: p.map, far, badge: { icon: p.icon } };
  }
  // the next chapter of the story here, not started yet: offered after the things going on here (never a must)
  // (chapter 1 after "go explore" in the opener: the puppy's games at home are the very last suggestion, never a pull.
  // That's Villa Sol's own line only: in a zone, its story's next chapter is offered as usual, AUDIT C3)
  const puppyLater = () => { if (!G.state || !G.state.flags.dogSkip) return false; const L = G.chapters.live(); return !!L && L.id === 'c1' && !L.started; };
  function chapterLater(f) { if (puppyLater()) return null; GD.laterChapter = true; try { return chapterGoal(f); } finally { GD.laterChapter = false; } }
  function puppyGoal(f) { if (!puppyLater()) return null; GD.laterChapter = true; try { return chapterGoal(f); } finally { GD.laterChapter = false; } }
  // the zone's own things: the dog's spot, ... (zones.js); the way to a place asked for on the world map, or not
  // visited yet (exploring)
  const zoneGoal = f => (G.zones ? G.zones.goal(f) : null);
  // a zone's own task going on (the beach's pail in your hands: to the water, back to Tere): with the things going on
  const zoneTask = f => (G.zones && G.zones.task ? G.zones.task(f) : null);
  const wantGoal = f => (G.zones && G.zones.want() ? G.zones.exploreGoal(f) : null);
  const exploreGoal = f => (G.zones ? G.zones.exploreGoal(f) : null);
  // Tomás's letter in your hands (connect.js): to whoever it's for; in another place, by the bus (or the way there).
  // Her own pick on the world map comes first (AUDIT M5: the open world listens to her): the place she asked for leads
  // (wantGoal, before the letter), and while she's on her way to a place she picked, or in it, the letter waits until
  // the things to do there are done (postLater), never dragging her back to the bus stop
  const waits = () => { const z = G.zones && G.zones.picked ? G.zones.picked() : null; return !!z && !!G.post && !!G.post.letter() && G.post.letterZone() !== z; };
  const postGoal = f => (G.post && G.post.goal && !waits() ? G.post.goal(f) : null);
  const postLater = f => (G.post && G.post.goal && waits() ? G.post.goal(f) : null);
  const postOffer = f => (G.post && G.post.offerGoal ? G.post.offerGoal(f) : null); // (Tomás's letter of the day: after the story's next chapter)
  // the night walk after the Hoy card (day.js): the arrow on the night animal she came to see, before anything else
  const nightWalk = f => (G.day && G.day.walkGoal ? G.day.walkGoal(f) : null);
  const TIERS = [nightWalk, chapterGoal, sunsetGoal, favourGoal, wantGoal, postGoal, zoneTask, seekGoal, reviewGoal, zoneGoal, chapterLater, postOffer, exploreGoal, postLater, playGoal, puppyGoal];

  // on another map: the door that leads there (from town, its door; from a building, the way out)
  function viaDoor(f, g) {
    const e = G.zones ? G.zones.route(f.mapId, g.map) : null;
    if (!e) return null;
    return Object.assign({}, g, { via: 'door', to: e.to, pts: [tileP(e.x, e.y, e.edge ? 16 : f.mapId === 'villa' ? 28 : 16, { door: true })] });
  }
  GD.goal = function (f) {
    if (!G.state || !f) return null;
    for (const tier of TIERS) {
      let g = null;
      try { g = tier(f); } catch (e) { if (!GD.err) { GD.err = true; console.error(e); } }
      if (!g) continue;
      if (g.pts && g.pts.length) { if (aside(f, g)) continue; return g; }
      if (g.map && g.map !== f.mapId && (g.home || g.far || near(g.map))) { const d = viaDoor(f, g); if (d && !aside(f, d)) return d; }
    }
    return null;
  };

  // ---------- the safety net: never round in circles ----------
  // Whatever the tiers say, following the arrow must not loop. Two ways it could, if one part of the game ever promised
  // what another can't give: a round trip (the arrow sent you through a door for a goal and, without pointing at a
  // single thing on the maps in between, brought you back to where that same goal sends you through that door again: the
  // front door, AUDIT C1), or the same talk (the arrow led you to someone, and after their talk it's straight back on
  // them for the same reason, and the talk was word for word the one before: Lola's hello, AUDIT C2; a talk that gets
  // something done moves the arrow on, so a shell given or a pail poured is never one). That goal is set aside for a few
  // minutes (the next tier leads) and GD.loops logs it: tools/test-live.js fails if it ever fires, so it's a net for her,
  // never a cover for a bug.
  GD.ASIDE = 3 * 60 * 60; // frames a goal stays set aside (~3 minutes of play)
  GD.loops = [];
  const set = {}, said = {}; // set aside: map|why -> frame; the last talk the arrow led to: map|why -> its lines
  let trip = null, prevMap = null, lastDoor = null, talk = null, ended = null, shown = null;
  function aside(f, g) { const k = f.mapId + '|' + g.why, t = set[k]; if (t == null) return false; if (G.frame - t > GD.ASIDE) { delete set[k]; return false; } return true; }
  function loop(kind, f, why) { set[f.mapId + '|' + why] = G.frame; GD.loops.push({ kind, map: f.mapId, why, frame: G.frame }); if (GD.loops.length > 20) GD.loops.shift(); }
  // a round trip: g is the goal shown now (free on the map) -> true when it was set aside (look again)
  function tripCheck(f, g) {
    if (f.mapId !== prevMap) { // a new map: through the door the arrow showed, or your own way (that ends the trip)
      if (!(lastDoor && lastDoor.map === prevMap && lastDoor.to === f.mapId)) trip = null; else if (trip) trip.away = true;
      prevMap = f.mapId; lastDoor = null;
    }
    if (!g) return false;
    const p = g.pts && g.pts.length === 1 ? g.pts[0] : null, ex = p && p.door ? f.exitAt(Math.floor(p.x / T), Math.floor(p.y / T)) : null;
    if (!ex || !ex.to) { trip = null; return false; } // (the arrow points at something here, not a way out: whatever comes next is new)
    lastDoor = { map: f.mapId, to: ex.to };
    if (trip && trip.away && trip.from === f.mapId && trip.why === g.why) { loop('trip', f, g.why); trip = null; return true; }
    if (!trip || (!trip.away && trip.from === f.mapId)) trip = { from: f.mapId, why: g.why, away: false };
    return false;
  }
  // the same talk: a talk begins (the map locked) with the person the arrow was on; it ends (free again) -> ended
  function talkCheck(f, free) {
    if (!free) { if (!talk && shown && f.talkWith && shown.pts && shown.pts.length === 1 && shown.pts[0].npc === f.talkWith) talk = { k: f.mapId + '|' + shown.why, why: shown.why, npc: f.talkWith, n0: G.said.n }; return; }
    if (talk) { const lines = G.saidSince(talk.n0).join(' | '); if (lines) ended = Object.assign(talk, { lines }); talk = null; }
    f.talkWith = null;
  }
  // ...and the goal right after it (g): back on the same person for the same reason, and word for word the last talk
  // there? -> true when it was set aside (look again)
  function againCheck(f, g) {
    const e = ended; ended = null; if (!e) return false;
    if (!(g && g.pts && g.pts.length === 1 && g.pts[0].npc === e.npc && f.mapId + '|' + g.why === e.k)) { delete said[e.k]; return false; } // (the arrow moved on: something got done)
    if (said[e.k] === e.lines) { delete said[e.k]; loop('talk', f, e.why); return true; }
    said[e.k] = e.lines; return false;
  }

  // ---------- every frame (field.js, after the map's update) ----------
  const busy = () => G.input.ptr.down || !!G.input.tap() || Object.keys(G.pressed).length > 0 || Object.keys(G.keys).some(k => G.keys[k]);
  const free = f => G.top() === f && !f.locked && G.fade.a === 0;
  GD.update = function (f) {
    if (!f) return;
    if (busy() || f.player.moving || f.route) idle = 0; else idle++;
    if (trotCool > 0) trotCool--;
    const dog = trotted && trotted.n;
    if (dog && (f.player.moving || f.locked) && dog.amb && dog.amb.hold > 0 && !dog.busy) { dog.amb.hold = 0; trotted = null; } // you're off: he follows again
    const fr = free(f);
    talkCheck(f, fr);
    let g = fr ? GD.goal(f) : null;
    if (fr) { const a = againCheck(f, g), b = tripCheck(f, g); if (a || b) g = GD.goal(f); } // (both keep their books)
    lastGoal = g; if (g) shown = g;
    if (g) GD.lastWhy = g.why; // (kept while the map is locked: Canelo's menu asks what the day's play wanted, carry.js petWant)
    if (!g) { GD.at = null; shownT = 0; return; }
    shownT++;
    GD.at = layout(f, g);
    if (idle >= GD.IDLE_TROT && !trotCool && !g.soft && !g.choice && !(g.quiz && idle < GD.IDLE_SOFT)) trot(f, g);
  };
  // where the arrow (or arrows) go on screen now
  // the corner buttons (field.js corners: the deck top-right, what you hold top-left): an arrow is never drawn on one
  const corners = f => (f.corners ? f.corners() : []);
  const hits = (R, x, y, w, h) => R.some(r => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y);
  function layout(f, g) {
    const cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), R = corners(f);
    const scr = (p, small) => { // (too near the top of the screen for the arrow, or over a corner button: under it, pointing up)
      const tx = Math.round(p.x - cx), ty = Math.round(p.y - cy), y = ty - (p.lift || 20), h = small ? 14 : 20; // (its height with the bob)
      if (y >= (small ? 11 : 16) && !hits(R, tx - 8, y - h, 16, h)) return { x: tx, y, tx, ty };
      let uy = ty + 14; for (const r of R) if (hits([r], tx - 8, uy, 16, h)) uy = Math.max(uy, r.y + r.h + 2); // (pointing up from under the button, never on it)
      return { x: tx, y: uy, tx, ty, up: true };
    };
    const on = s => s.tx >= 6 && s.tx <= G.W - 6 && s.ty >= 6 && s.ty <= G.H - 4; // (a way out on a map's top row is on screen, over the arrow: as an edge arrow under it, a tap there walked nowhere)
    if (g.choice) {
      const marks = g.pts.map(p => scr(p, true)).filter(on);
      if (marks.length) return { why: g.why, choice: true, marks, x: marks[0].x, y: marks[0].y, tx: marks[0].tx, ty: marks[0].ty };
    }
    // the nearest point (one goal), on screen: over it; off screen: at the edge
    const p0 = f.player, pts = g.pts.slice().sort((a, b) => Math.hypot(a.x - p0.x * T, a.y - p0.y * T) - Math.hypot(b.x - p0.x * T, b.y - p0.y * T)), p = pts[0], s = scr(p);
    const badge = g.badge || badgeOf(p);
    if (g.quiz && idle < GD.IDLE_SOFT) return { why: g.why, quiz: true, hidden: true, x: s.x, y: s.y, tx: s.tx, ty: s.ty };
    if (on(s)) {
      if (g.soft && idle < GD.IDLE_SOFT) return { why: g.why, soft: true, hidden: true, x: s.x, y: s.y, tx: s.tx, ty: s.ty };
      return { why: g.why, x: s.x, y: s.y, tx: s.tx, ty: s.ty, up: !!s.up, door: !!p.door, badge: g.via === 'door' ? badge : null, choice: !!g.choice };
    }
    const x0 = 16, x1 = G.W - 16, y0 = 40, y1 = G.H - 16;
    const px = G.clamp(p0.x * T + 12 - cx, x0, x1), py = G.clamp(p0.y * T + 12 - cy, y0, y1), dx = s.tx - px, dy = s.ty - py;
    const kx = dx > 0 ? (x1 - px) / dx : dx < 0 ? (x0 - px) / dx : Infinity, ky = dy > 0 ? (y1 - py) / dy : dy < 0 ? (y0 - py) / dy : Infinity, k = Math.min(kx, ky, 1);
    const ex = Math.round(px + dx * k), ey = Math.round(py + dy * k);
    return { why: g.why, edge: true, x: ex, y: ey, tx: ex, ty: ey, ang: Math.atan2(dy, dx), dir: kx < ky ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), badge };
  }
  const badgeOf = p => (p.npc ? { npc: p.npc } : p.icon ? { icon: p.icon } : null);
  // the hint hand's spot (hint.js): the goal's own tile on screen, one goal only (never a choice: it'd give the answer)
  GD.handAt = function (f) {
    const a = GD.at; if (!a || a.edge || a.choice || a.soft || a.hidden || !free(f)) return null;
    return { x: a.tx, y: a.ty };
  };
  // a tap on what the arrow points at, where a corner button covers it (a bus stop at the top of a map, under the deck):
  // the target wins the tap, not the button (field.js asks before the buttons; AUDIT H10). Its spot: the tile and the
  // sign or head drawn above it
  GD.wins = function (f, tap) {
    const a = GD.at; if (!a || !tap || a.edge || a.hidden || !free(f)) return false;
    const R = corners(f).filter(r => tap.x >= r.x && tap.x < r.x + r.w && tap.y >= r.y && tap.y < r.y + r.h); if (!R.length) return false;
    return (a.marks || [a]).some(m => tap.x >= m.tx - 16 && tap.x < m.tx + 16 && tap.y >= m.ty - 34 && tap.y < m.ty + 16 && hits(R, m.tx - 12, m.ty - 32, 24, 44));
  };
  GD.place = (f, g) => layout(f, g); // (tests: where the arrow for goal g would be drawn now)
  GD.arrow = (ctx, x, y, small, col, up) => down(ctx, x, y, small, col || '#f8e060', up); // (the world map's arrow, zones.js)

  // ---------- Canelo trots toward the goal when you stand about ----------
  function trot(f, g) {
    const n = G.pet && G.pet.mine() && G.pet.npc(f); if (!n || n.busy || n.moving || !n.amb || !n.amb.follow || n.pa) return;
    const p = g.pts[0], gx = Math.floor(p.x / T), gy = Math.floor(p.y / T), pl = f.player;
    if (Math.abs(gx - pl.x) + Math.abs(gy - pl.y) <= 2 || (p.npc === n)) return;
    const path = G.chapters.K.path(f, n, gx, gy), D = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
    let s = '', x = n.x, y = n.y;
    for (const c of path) {
      const nx = x + D[c][0], ny = y + D[c][1];
      if (f.exitAt(nx, ny) || (nx === gx && ny === gy) || f.npcs.some(o => o !== n && !o.ghost && !o.hidden && o.x === nx && o.y === ny)) break;
      s += c; x = nx; y = ny; if (s.length >= 4) break;
    }
    while (s.length && x === pl.x && y === pl.y) { const c = s[s.length - 1]; x -= D[c][0]; y -= D[c][1]; s = s.slice(0, -1); } // (not to stop on you: he's a ghost on the way)
    trotCool = 600; // (once in a while: not on every pause)
    if (s.length < 2) return;
    trotted = { n, f0: G.frame };
    n.busy = true; n.ghost = true;
    f.tasks.add((function* () {
      yield* f.walkNpc(n, s, 3);
      n.busy = false; n.home = [n.x, n.y];
      const dx = gx - n.x, dy = gy - n.y; n.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (G.pet.sound) G.pet.sound('bark');
      if (G.pet.puff) G.pet.puff('ex', n.x * T + 12, n.y * T - 4, { life: 30 });
      if (n.amb) n.amb.hold = 150; // (he waits there for you a moment, looking the way)
    })());
  }
  GD.trotting = () => !!trotted && G.frame - trotted.f0 < 400;
  GD.trotAt = () => (trotted ? trotted.f0 : -1); // (tests)
  GD.idle = () => idle;

  // ---------- drawing (field.js, over the map, under the menu button) ----------
  // a fat yellow arrow pointing down, its tip at x, y (small: a choice)
  function down(ctx, x, y, small, col, up) {
    if (up) { ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); down(ctx, 0, 0, small, col); ctx.restore(); return; }
    const w = small ? 5 : 7, h = small ? 5 : 7, sw = small ? 2 : 3, sh = small ? 4 : 7;
    ctx.fillStyle = '#10102a';
    for (let i = 0; i <= h; i++) ctx.fillRect(x - w + i - 1, y - h + i - 1, 2 * (w - i) + 3, 1);
    ctx.fillRect(x - sw + 0 - 1, y - h - sh - 1, 2 * sw + 1 + 2, sh + 1);
    ctx.fillStyle = col;
    for (let i = 0; i < h; i++) ctx.fillRect(x - w + i, y - h + i, 2 * (w - i) + 1, 1);
    ctx.fillRect(x - sw + 1, y - h - sh, 2 * sw - 1, sh);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - sw + 1, y - h - sh, 1, sh - 1); // (a glint)
  }
  function drawBadge(ctx, b, x, y) { // a little round window with who or what waits there
    G.win(ctx, x - 11, y - 11, 22, 22, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 });
    if (b.npc || b.who) {
      const spec = b.npc ? b.npc.spec : G.data.npcs[b.who] && G.data.npcs[b.who].map;
      if (spec) { const img = G.unitSprite(spec, 'down', 0); ctx.save(); ctx.beginPath(); ctx.rect(x - 9, y - 9, 18, 18); ctx.clip(); ctx.drawImage(img, x - 12, y - 9); ctx.restore(); }
    } else if (b.icon) G.drawIcon16(ctx, G.data.words[b.icon] || b.icon, x - 8, y - 8);
  }
  GD.draw = function (f, ctx) {
    const a = GD.at; if (!a || !free(f) || a.hidden) return;
    const fade = Math.min(1, shownT / 20); if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade;
    if (a.marks) { // a choice: a small white arrow over each, bobbing in turn
      a.marks.forEach((m, i) => { const b = Math.round(Math.abs(Math.sin(G.frame / 9 + i * 1.3)) * 4); down(ctx, m.x, m.up ? m.y + b : m.y - b, true, '#f8f8ff', m.up); });
    } else if (!a.edge) {
      const bob = Math.round(Math.abs(Math.sin(G.frame / 8)) * 5);
      down(ctx, a.x, a.up ? a.y + bob : a.y - bob, false, '#f8e060', a.up);
      if (a.badge) drawBadge(ctx, a.badge, a.x + (a.x > G.W - 40 ? -24 : 24), a.up ? a.y + 12 + bob : a.y - 12 - bob);
    } else edgeArrow(ctx, a);
    ctx.restore();
  };
  function edgeArrow(ctx, a) {
    const pulse = 1 + 0.12 * Math.sin(G.frame / 7) + (idle > 300 ? 0.15 : 0), L = 14 * pulse, W2 = 9 * pulse;
    const ux = Math.cos(a.ang), uy = Math.sin(a.ang), vx = -uy, vy = ux, push = Math.round(Math.sin(G.frame / 6) * 2);
    const tx = a.x + ux * (2 + push), ty = a.y + uy * (2 + push);
    const tri = (o, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tx + ux * o, ty + uy * o); ctx.lineTo(tx - ux * (L + o) + vx * (W2 + o), ty - uy * (L + o) + vy * (W2 + o)); ctx.lineTo(tx - ux * (L + o) - vx * (W2 + o), ty - uy * (L + o) - vy * (W2 + o)); ctx.closePath(); ctx.fill(); };
    tri(2, '#10102a'); tri(0, '#f8e060');
    if (a.badge) drawBadge(ctx, a.badge, Math.round(a.x - ux * (L + 17)), Math.round(a.y - uy * (L + 17)));
  }
})();
