// The live game (docs/AUDIT_2026-10.md, M7 / Sprint 1 item 1.6): the game a child really gets, with the dog's warm-up,
// the phrases and listen-and-do all ON, played from a new game by a child who does nothing but follow the guide's arrow
// (src/guide.js): tap where it points (a puzzle's choices one after another), answer every question right
// (harness drive), and on the world map tap where its arrow points. Both opener choices: the story ("¡A jugar con
// Canelo!") and "¡A explorar!", a few minutes of game time each, and on into at least one zone; and a first zone visit a
// little later in the game (three album animals met: Lola's favourite-animal question, AUDIT C2). It fails on
//   a back-and-forth loop   the same two maps alternating more than 4 times in a row with nobody talked to in between,
//                           or more than 12 door trips in a minute of play (the explore loop at the front door: 49 in 60 s)
//   a talk repeated         the same lines 3 times in a row (Lola's heart bubble: her hello 45 times)
//   nothing to follow       20 s free on the map with no arrow, or with an arrow whose tap leads nowhere; an arrow
//                           whose tap opens the corner menu instead (the grandparents' bus stop)
//   the guide's safety net  G.guide.loops (a goal it had to set aside because following it went round in circles,
//                           guide.js) stays empty: a loop the net catches is still a bug
// It also checks the arrow led into a zone (and, after "¡A explorar!", to the zone's own first chapter: AUDIT C3).
// Play runs at LIVE_SPEED game frames per screen frame (default 2: the same game, about 4-5 minutes for all three).
//   NODE_PATH=$(npm root -g) node tools/test-live.js [screenshot dir]
//   LIVE_MIN=n: minutes of play per part (default 3, the zone visit 2); ONLY=explore|story|zone: one part
'use strict';
const { run, open, check } = require('./harness');

const MIN = Number(process.env.LIVE_MIN || 3), ZONE_MIN = Number(process.env.LIVE_MIN || 2); // (minutes of play: each opener path, the zone visit)
const TRIPS_MIN = 12, ALTERNATE = 4, REPEAT = 3, DEAD = 20, SPEED = Number(process.env.LIVE_SPEED || 2);

// page-side: a log of every map change, every line said and question asked, and the corner menu opening
const INSTRUMENT = speed => {
  const L = window.__live = { maps: [], says: [], menus: [] }; G.speedMul = speed || 1; // (game frames per screen frame: the same game, sooner)
  const go = G.goto; G.goto = function (m) { L.maps.push({ m, f: G.frame }); return go.apply(this, arguments); };
  const txt = p => (typeof p === 'string' ? p : p && p.t ? p.t : '');
  const say = G.say; G.say = function (pages, o) { try { L.says.push({ f: G.frame, who: (o && (o.who || o.name)) || '', t: G.fill((Array.isArray(pages) ? pages : [pages]).map(txt).join(' / ')) }); } catch (e) { /* */ } return say.apply(this, arguments); };
  const ch = G.choose; G.choose = function (o) { try { L.says.push({ f: G.frame, who: (o && o.who) || '', t: '? ' + G.fill(o.prompt || '') + ' [' + (o.choices || []).map(c => c.word || c.label || '').join(',') + ']' }); } catch (e) { /* */ } return ch.apply(this, arguments); };
  const fm = G.fieldMenu; G.fieldMenu = function* (f) { L.menus.push({ f: G.frame, why: G.guide.lastWhy, map: f.mapId, at: [f.player.x, f.player.y] }); yield* fm.call(this, f); };
};
const freeNow = () => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route;

// a new game through the creator; the opener played, picking `explore` or not
async function newGame(g, explore) {
  await g.toCreator();
  await g.tapRect(await g.ev(() => G.top().optRects(5)[1]));
  await g.until(() => G.top().constructor.name === 'NameEntry', null, 'the name entry');
  await g.ev(() => { G.top().name = 'Luz'; });
  await g.tapRect(await g.ev(() => G.top().cellRect(3, 6)));
  await g.until(() => G.field && G.field.mapId === 'casa', null, 'home');
  g.explore = explore; g.dogName = null;
  await g.ev(`(${INSTRUMENT})(${SPEED})`);
  await g.drive(() => G.chapters.openerDone() && (G.top() === G.field && !G.field.locked), 'the opener');
}

// play whatever is on top until the map is free: the harness drives questions and talks; the world map: tap where its
// arrow points (or close it); the corner menu, if it opens: logged (the test fails on it) and closed
async function settle(g) {
  g.beforeAct = async s => {
    if (s.name === 'WorldMap') {
      const a = await g.ev(() => (G.top().arrowAt ? G.top().arrowAt() : null));
      if (a && await g.ev(() => G.top().t > 20)) { await g.tap(a.x, a.y); await g.frames(10); return true; }
      if (!a && await g.ev(() => G.top().t < 40)) { await g.frames(10); return true; }
      return false; // (no arrow: the harness closes it)
    }
    if (s.name === 'FieldMenu') { await g.tapBtn(await g.ev(() => G.top().closeXY())); return true; }
    if (s.name === 'TodayCard') { await g.tap(160, 200); return true; }
    if (s.name === 'Night') { await g.frames(10); return true; }
    return false;
  };
  for (let i = 0; i < 50 && !(await g.ev(freeNow)); i++) {
    await g.drive(() => { const t = G.top(); return (t === G.field && !G.field.locked && G.fade.a === 0) || (G.fade.a > 0 && t === G.field); }, 'a scene');
    await g.frames(2);
  }
  g.beforeAct = null;
}

// follow the arrow for `sec` seconds of play; -> what happened
async function follow(g, sec, label) {
  const f0 = await g.ev(() => G.frame), log = { talks: [], dead: 0, deadMax: 0, deadWhy: '', zones: new Set(), whys: [] };
  const tried = new Map();
  let s0 = await g.ev(() => window.__live.says.length);
  while ((await g.ev(() => G.frame)) - f0 < sec * 60) {
    await settle(g);
    const said = await g.ev(k => window.__live.says.slice(k).map(s => s.who + ': ' + s.t), s0); s0 += said.length; // (a talk: what was said since the last free moment)
    if (said.length) { log.talks.push(said.join(' | ')); log.dead = 0; }
    const st = await g.ev(() => { const a = G.guide.at, f = G.field, p = f.player; return { a: a && { x: a.x, y: a.y, tx: a.tx, ty: a.ty, edge: !!a.edge, hidden: !!a.hidden, why: a.why, marks: a.marks ? a.marks.map(m => [m.tx, m.ty]) : null }, map: f.mapId, zone: G.zones.of(f.mapId), p: [p.x, p.y], f: G.frame }; });
    if (st.zone && st.zone !== 'villa') log.zones.add(st.zone);
    const sig = st.map + ' ' + st.p.join(',');
    if (!st.a || st.a.hidden) { // nothing to follow yet (a favour's arrow waits ~10 s on purpose): stand about
      await g.frames(30); log.dead += 0.5; if (log.dead > log.deadMax) { log.deadMax = log.dead; log.deadWhy = (st.a ? st.a.why + ' (hidden)' : 'no arrow') + ' on ' + sig; } continue;
    }
    if (log.whys[log.whys.length - 1] !== st.a.why) log.whys.push(st.a.why);
    let x = st.a.tx, y = st.a.ty;
    if (st.a.marks) { const k = st.a.why + st.a.marks.length, n = tried.get(k) || 0; tried.set(k, n + 1); [x, y] = st.a.marks[n % st.a.marks.length]; }
    else if (st.a.edge) { x = st.a.x; y = st.a.y; }
    const t0 = st.f;
    await g.tap(Math.round(x), Math.round(y));
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 40000);
    await g.frames(4);
    const after = await g.ev(() => ({ sig: G.field.mapId + ' ' + G.field.player.x + ',' + G.field.player.y, busy: G.top() !== G.field || G.field.locked || G.fade.a > 0, f: G.frame }));
    if (after.busy || after.sig !== sig) { log.dead = 0; continue; }
    log.dead += (after.f - t0) / 60 + 0.5; await g.frames(30); // (the tap did nothing)
    if (log.dead > log.deadMax) { log.deadMax = log.dead; log.deadWhy = st.a.why + ' tapped at ' + Math.round(x) + ',' + Math.round(y) + ' on ' + sig; }
  }
  void label;
  return log;
}

// the checks on what happened
async function judge(g, label, log, o = {}) {
  const L = await g.ev(() => ({ maps: window.__live.maps, menus: window.__live.menus, loops: G.guide.loops || [], talked: window.__live.says.filter(s => s.who).map(s => s.f) }));
  // door trips: the most in any minute of play, and the longest run alternating between the same two maps with nobody
  // talked to in between (in and out of the cottage for the grandparents' story is play; in and out for nothing is a loop)
  let most = 0, mostAt = 0;
  for (let i = 0; i < L.maps.length; i++) { let n = 0; for (let j = i; j < L.maps.length && L.maps[j].f - L.maps[i].f < 3600; j++) n++; if (n > most) { most = n; mostAt = i; } }
  const talkedIn = i => L.talked.some(f => f > L.maps[i - 1].f && f < L.maps[i].f);
  let alt = 0, altMax = 0, altAt = '';
  for (let i = 2; i < L.maps.length; i++) { if (L.maps[i].m === L.maps[i - 2].m && L.maps[i].m !== L.maps[i - 1].m && !talkedIn(i)) { alt = alt ? alt + 1 : 3; if (alt > altMax) { altMax = alt; altAt = L.maps[i - 1].m + ' <-> ' + L.maps[i].m; } } else alt = 0; }
  const trips = Math.max(0, altMax - 1);
  let rep = 1, repMax = 1, repWhat = '';
  for (let i = 1; i < log.talks.length; i++) { if (log.talks[i] === log.talks[i - 1]) { rep++; if (rep > repMax) { repMax = rep; repWhat = log.talks[i]; } } else rep = 1; }
  console.log('    ' + label + ': ' + L.maps.length + ' map changes (' + L.maps.map(m => m.m).join(' ').slice(0, 300) + '), ' + log.talks.length + ' talks, zones ' + ([...log.zones].join(',') || 'none') + '; arrow: ' + log.whys.slice(0, 40).join(' > ').slice(0, 600));
  check(label + ': no back-and-forth through a door (the same two maps alternating ' + trips + ' times in a row; at most ' + ALTERNATE + ')', trips <= ALTERNATE, altAt);
  check(label + ': no more than ' + TRIPS_MIN + ' door trips in any minute (' + most + ')', most <= TRIPS_MIN, L.maps.slice(mostAt, mostAt + 16).map(m => m.m).join(' '));
  check(label + ': no talk repeated ' + REPEAT + ' times in a row (at most ' + repMax + ')', repMax < REPEAT, repWhat);
  check(label + ': never ' + DEAD + ' s with nothing to follow (at most ' + log.deadMax.toFixed(1) + ' s)', log.deadMax < DEAD, log.deadWhy);
  check(label + ': the arrow never sent her into the corner menu', !L.menus.length, JSON.stringify(L.menus));
  check(label + ': the guide never had to break a loop itself (G.guide.loops empty)', !L.loops.length, JSON.stringify(L.loops));
  check(label + ': following the arrow led into a zone', log.zones.size > 0);
  if (o.zoneStory) check(label + ': ...and to the zone\'s own story (its first chapter, found by the arrow after "¡A explorar!": AUDIT C3)', log.whys.some(w => /^(playa|bosque|juegos|abuelos|montana)\d+:/.test(w)), log.whys.join(' > ').slice(-400));
  check(label + ': no console errors', !g.errors.length, g.errors.join('\n'));
}

async function path(browser, explore) {
  const label = explore ? 'explore' : 'story';
  const { ctx, g } = await open(browser, 'live-' + label, true, { warmup: true, phrases: true, listen: true });
  try {
    await newGame(g, explore);
    check(label + ': the opener chose ' + (explore ? '"¡A explorar!"' : 'the puppy\'s game'), await g.ev(x => !!G.state.flags.dogSkip === x, explore));
    const log = await follow(g, MIN * 60, label);
    await g.shot('end');
    await judge(g, label, log, { zoneStory: explore });
  } finally { await ctx.close(); }
}

// a first zone visit a little later in the game (the explore choice, three album animals met: AUDIT C2's moment, Lola
// says "Me llamo Lola" and then has her favourite-animal question), from the path into La casa de los abuelos
async function zone(browser) {
  const label = 'zone';
  const { ctx, g } = await open(browser, 'live-zone', true, { warmup: true, phrases: true, listen: true });
  try {
    await g.ev(() => {
      G.st.newGame(); G.state.name = 'Luz';
      Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
      for (const w of ['hola', 'perro', 'gato', 'pato', 'gallina', 'pajaro']) G.words.meet(w, 'test');
      for (const a of ['perro', 'gato', 'pato', 'gallina']) G.animals.meet(a);
      G.zones.visit('villa'); G.demo.skip(); G.goto('camino_abuelos', 6, 3, 'down');
    });
    await g.until(() => G.field && G.field.mapId === 'camino_abuelos' && G.fade.a === 0, null, 'the path to the grandparents\'');
    await g.ev(`(${INSTRUMENT})(${SPEED})`);
    check(label + ': three album animals met (Lola\'s question is ready once she has said hello)', await g.ev(() => G.phrase.favReady()));
    const log = await follow(g, ZONE_MIN * 60, label);
    await g.shot('end');
    await judge(g, label, log, { zoneStory: true });
  } finally { await ctx.close(); }
}

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); // (ONLY=story, explore or zone: one of them)
run('The live game: following only the arrow, everything on', [['explore: "¡A explorar!"', b => path(b, true)], ['story: play with the puppy', b => path(b, false)], ['zone: a first visit, three album animals met', zone]].filter(([n]) => !ONLY.length || ONLY.some(o => n.startsWith(o))));
