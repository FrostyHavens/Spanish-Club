// Speed (docs/AUDIT_2026-10.md C8, item 4.1): is the game smooth on an old, slow iPad, and will it stay smooth as the
// content grows? Her iPad stops at iPadOS 15, so this desktop browser is slowed 4 times (Chrome's own CPU throttle) to
// stand in for it, and the work of each frame is timed: the game loop's update and draw, with the page's own clock
// around them (not the gap between frames: that also holds the browser's waiting).
// Where: Villa Sol and every zone's outdoor map, standing still and walking about, by day, with a mid-game save (the
// story half done, three chapters going on, every zone visited, 110 words, a dozen reviews due, the dog's warm-up done,
// hide-and-seek started, phrases and listen-and-do on).
// Three cases:
//   a  today's content             pass: a typical frame (the median) takes 16 ms or less, and 95 in 100 take 33 ms or less
//   b  a save with 1,000 words     pass: a typical frame takes 33 ms or less
//   c  three times the content     pass: a typical frame takes 33 ms or less
//      (chapters 36 -> 108, story lines 6 -> 18, hiding places 43 -> 129: copies of today's, added in the page)
// This machine is shared with other tests, so every map is measured in several windows (SPEED_FRAMES frames each),
// spread over the run, and judged by its best window; the spread is printed. A map that passed in every one of the
// first 3 rounds is done; the others are measured again, up to 6 rounds.
// For each map a table says where the time goes (one more window, walking, with Chrome's profiler on): the guide, the
// chapters, hiding places and animals, words and pacing, the map's drawing, the rest. So a slow frame shows its cause.
// (A moment's time goes to the file of the function then running, so what the guide asks of the chapters is counted
// with the chapters; the canvas's own calls go to whoever made them.)
// It passes with another browser running beside it (tools/test-lanes.sh); if it ever fails there, run it by itself.
// It also checks the reading a grown-up can take on the real iPad (core.js G.perf, the Learning page): it is there and
// agrees with this test's own clock.
// First of all it checks that what the game now remembers from frame to frame stays right (the first part, 'memo'):
// after each kind of change (a word answered or met, a beat, a chapter ending or starting, a first visit to a zone, a
// new day, a game loaded, another slot, a save changed by hand the way tests do), what the game sees inside a frame
// (the live chapters, every gate and bubble, the pacing's counts, the due words, hide-and-seek, the guide's goal) is
// compared with the same things worked out from scratch at that very moment.
// In case a it also checks that the map's tiles, whose pictures are now kept with the map (tiles.js), draw the same
// ground as worked out from scratch.
// What it cannot see: how fast the iPad itself paints (see the note it prints at the end).
//   NODE_PATH=$(npm root -g) node tools/test-speed.js
//   ONLY=memo|a|b|c (one part)   SPEED_MAPS=villa,playa (some maps)   SPEED_RATE=4 (the slowdown)   SPEED_FRAMES=120
//   SPEED_ROUNDS=3 SPEED_MAX_ROUNDS=6   SPEED_JSON=file (the numbers, for a before / after table)
'use strict';
const fs = require('fs');
const { run, open, check } = require('./harness');

const RATE = Number(process.env.SPEED_RATE || 4), FRAMES = Number(process.env.SPEED_FRAMES || 120);
const ROUNDS = Number(process.env.SPEED_ROUNDS || 3), MAX_ROUNDS = Math.max(ROUNDS, Number(process.env.SPEED_MAX_ROUNDS || 6));
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), MAPS = (process.env.SPEED_MAPS || '').split(',').filter(Boolean);
const WINDOW_MS = 8000; // a window ends after SPEED_FRAMES frames, or this long (a very slow game: fewer frames)
const CASES = [
  { id: 'a', name: 'today\'s content', median: 16, p95: 33 },
  { id: 'b', name: 'a save with 1,000 words', median: 33, words: 1000 },
  { id: 'c', name: 'three times the content', median: 33, triple: true },
];
const PARTS = [['guide', 'the guide'], ['chapters', 'chapters'], ['animals', 'hiding places and animals'], ['words', 'words and pacing'], ['draw', 'the map\'s drawing'], ['rest', 'the rest']];
// whose time is whose (the profiler's samples, by the file of the function running)
const PART_OF = { 'guide.js': 'guide', 'chapters.js': 'chapters', 'story-c01-c10.js': 'chapters', 'story-c11-c21.js': 'chapters', 'seek.js': 'animals', 'animals.js': 'animals',
  'words.js': 'words', 'tiles.js': 'draw', 'field.js': 'draw', 'gfx.js': 'draw', 'sprites.js': 'draw', 'icons.js': 'draw', 'ui.js': 'draw' };

// ---------- in the page ----------
// the clock around the loop's work: the loop asks for its next frame with requestAnimationFrame, so what it is given
// to call is wrapped: time before, the loop's update(s) and draw, time after. Nothing is recorded outside a window.
const PROBE = () => {
  const S = window.__sp = { left: 0, ms: [], busy: 0, steps: 0, walk: null, done: null, t0: 0, max: 0 };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => {
    if (S.walk) S.walk(); // (the walker's own work is not the game's: before the clock starts)
    const rec = S.left > 0, f0 = G.frame, t0 = performance.now();
    cb(t);
    if (!rec) return;
    const t1 = performance.now(), f = G.field;
    S.ms.push(t1 - t0); S.steps += G.frame - f0;
    if (!f || G.top() !== f || f.locked) S.busy++;
    if (--S.left <= 0 || t1 - S.t0 > S.max) { S.left = 0; S.done({ ms: S.ms, busy: S.busy, steps: S.steps, top: G.top() ? G.top().constructor.name : '', map: f ? f.mapId : '' }); }
  });
  // walking about: one arrow key held; at a wall, a person, a way out or the edge she turns (never through a door).
  // Looked at before every frame, from the tile she is stepping onto: a slow frame holds several updates, and a key
  // still held at the end of a step would walk her on, out of the map.
  let dir = 'right', seed = 7;
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const ok = (f, d) => { const p = f.player, [dx, dy] = G.DIRS[d], x = p.x + dx, y = p.y + dy; return !f.blocked(x, y, p) && !f.exitAt(x, y) && !(f.def.events || []).some(e => e.x === x && e.y === y); };
  const keys = d => { for (const k of ['up', 'down', 'left', 'right']) G.keys[k] = k === d; };
  S.walker = () => {
    const f = G.field; if (!f || G.top() !== f || f.locked) { keys(null); return; }
    if (!ok(f, dir)) {
      const back = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir], L = ['up', 'down', 'left', 'right'].filter(d => d !== dir && ok(f, d)), side = L.filter(d => d !== back);
      if (!L.length) { keys(null); return; }
      dir = (side.length ? side : L)[rnd((side.length ? side : L).length)];
    }
    keys(dir);
  };
  S.start = on => { dir = 'right'; seed = 7; S.walk = on ? S.walker : null; if (!on) keys(null); };
};
const WINDOW = ([n, max]) => new Promise(res => { const S = window.__sp; S.ms = []; S.busy = 0; S.steps = 0; S.t0 = performance.now(); S.max = max; S.done = res; S.left = n; });

// three times the content: every chapter twice more (in story lines of their own: 6 -> 18 lines) and every hiding
// place twice more. The copies are real to the engine (written, live, their people get bubbles) but their beats do
// nothing and never start by themselves.
const TRIPLE = () => {
  const CH = G.chapters, SK = G.seek, ids = CH.ids(), spots = SK.SPOTS.slice(), noop = function* () { };
  const n0 = ids.length, w0 = ids.filter(CH.written).length, l0 = CH.lines().length, lw = new Set(ids.filter(CH.written).map(CH.lineOf)).size; // (what three times as much comes to: written chapters and the lines that have one are copied twice)
  for (const x of [2, 3]) for (const id of ids) {
    const d = CH.def(id), sc = CH.scriptOf(id), nid = id + '_x' + x;
    if (!sc) continue; // (a chapter whose script is not written yet: nothing to copy)
    CH.add({ id: nid, line: CH.lineOf(id) + '_x' + x, title: d.title, en: d.en, giver: d.giver, words: d.words.slice(), icon: d.icon, col: d.col, goal: d.goal, when: d.when });
    CH.script(nid, sc.beats.map(b => (b.spot || b.spots ? { spots: (b.spots || [b.spot]).map(s => ({ map: s.map, at: s.at.slice(), quiet: true })), run: noop }
      : b.tap ? { tap: b.tap, run: noop } : b.door ? { door: b.door, run: noop } : b.evening ? { evening: b.evening, run: noop } : { who: b.who || d.giver, run: noop })));
  }
  for (const x of [2, 3]) for (const s of spots) SK.SPOTS.push(Object.assign({}, s, { id: s.id + '_x' + x, kinds: s.kinds.slice() }));
  return { chapters: CH.ids().length, lines: CH.lines().length, spots: SK.SPOTS.length, want: { chapters: n0 + 2 * w0, lines: l0 + 2 * lw } };
};

// a mid-game save, in slot 1 (so it autosaves as hers does): half of Villa Sol's story done and a chapter going on,
// a zone's story finished, two going on, one waiting, one not begun; every zone visited before today; 110 words at
// every stage, 12 of them due (a chapter not begun waits for room), 2 met a minute ago; the dog's warm-up done today.
// o.words: that many word records in all (the extra ones are copies of real words, with pages of their own).
// o.triple: the copies of TRIPLE are as far along as the chapters they copy.
const SEED = o => {
  const W = G.words, CH = G.chapters, dn = W.dayNum();
  G.rngState = 20261122; { let r = 99; Math.random = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x80000000; }; } // (the same favours, hiding places and wandering every run)
  const dateOf = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); };
  G.st.newGame();
  const s = G.state; s.name = 'Luz'; s.look = G.data.defaultLook('nina'); s.dogName = 'Bruno'; s.stars = 240; s.playTime = 9 * 3600;
  Object.assign(s.flags, { intro: true, canelo: true, petStart: true, opener: true, notebook: true, book: true });
  W.newSession('new');
  Object.assign(s.wm, { clock: 9 * 3600, d0: dn - 30, v2: dn - 30 }); s.wm.sessAt = s.wm.clock;
  // the story
  const done = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'playa1', 'playa2', 'playa3', 'bosque1', 'juegos1', 'montana1'];
  const going = { c12: [1, {}], bosque2: [1, { sq: 1, piles: 1 }], montana2: [1, { roll: 1, balls: 0, got: {} }] };
  const ch = s.ch = { v: CH.VERSION, step: {}, data: {}, began: {}, doneSess: {}, placeAsk: {}, lastDoneSess: 0 };
  for (const x of o.triple ? ['', '_x2', '_x3'] : ['']) {
    done.forEach((id, i) => { s.quests[id + x] = 'done'; ch.began[id + x] = { day: 0, date: dateOf(dn - 30 + i) }; ch.doneSess[id + x] = 0; });
    for (const id in going) { s.quests[id + x] = 'active'; ch.step[id + x] = going[id][0]; ch.data[id + x] = JSON.parse(JSON.stringify(going[id][1])); ch.began[id + x] = { day: 0, date: dateOf(dn - 1) }; }
  }
  // the words: those of the chapters behind her and going on, every animal that plays hide-and-seek, then the next in
  // the table, 110 in all
  const ids = [], add = id => { if (G.data.words[id] && ids.indexOf(id) < 0) ids.push(id); };
  for (const id of done.concat(Object.keys(going))) CH.def(id).words.forEach(add);
  G.seek.KINDS.forEach(add);
  for (const id in G.data.words) { if (ids.length >= 110) break; add(id); }
  if (o.words) { // more words than the game has yet: copies, a dozen to a page
    const real = Object.keys(G.data.words);
    for (let i = 0; ids.length < o.words; i++) {
      const id = 'zz' + i, t = 'zzt' + Math.floor(i / 12);
      G.data.words[id] = Object.assign({}, G.data.words[real[i % real.length]], { topic: t });
      if (!G.data.topics[t]) G.data.topics[t] = { name: 'Página ' + t, en: 'Page ' + t };
      ids.push(id);
    }
  }
  const sess = W.sess(), now = W.now();
  ids.forEach((id, i) => {
    const st = [2, 3, 1, 3, 2, 4, 3, 4][i % 8], due = i % 9 === 4 && i < 110, late = i % 3; // (12 of the first 110 are due: today, or a day or two late)
    s.words[id] = { st, box: st === 1 ? 2 : 2 + i % 5, due: null, ds: null, dc: due ? dn - late : dn + 1 + (i * 7) % 30, dd: null, fu: 0, met: 60 + i, ms: 0, md: 0, how: 'show', last: 100 + i, n: 4 + i % 5,
      right: 2 + i % 4, wrong: i % 3 === 0 ? 1 : 0, said: i % 4 === 0 ? 1 : 0, cue: 1, ret: 3 + i % 4, ft: {}, star: dateOf(dn - 1 - i % 6), s3: st >= 3 ? 0 : null, gold: st >= 3, learned: st >= 3,
      mdate: dateOf(dn - 3 - i % 26), mdn: dn - 3 - i % 26, ld: dn - 1 - i % 6, v: W.V };
  });
  ids.slice(-2).forEach(id => Object.assign(s.words[id], { st: 1, box: 1, fu: 1, due: now + 60, ds: W.msess(), dc: null, met: now - 40, ms: sess, md: W.day(), mdate: G.today(), mdn: dn, ld: dn, last: now - 40 })); // (met a minute ago: their follow-ups wait)
  // the world: every zone visited on an earlier day, its animals in the album, some hearts; the warm-up done today
  s.world = { visited: {}, dog: {}, want: null };
  for (const z of G.zones.ids()) s.world.visited[z] = { d: 0, date: dateOf(dn - 2) };
  for (const k of G.seek.KINDS) s.album[k] = { first: 1, map: 'villa', n: 2 };
  for (const who of ['mama', 'nico', 'rosa', 'pepe', 'canelo', 'lola']) s.hearts[who] = 2;
  if (G.warmup && G.warmup.skipToday) G.warmup.skipToday();
  if (G.demo && G.demo.skip) G.demo.skip();
  if (G.budget.flush) G.budget.flush();
  G.st.begin(1);
  G.goto('villa', 26, 12, 'down');
  if (G.favores && G.favores.today) G.favores.today(); // (today's favours and every zone's game of hide-and-seek: drawn now, the same every run)
  for (const z of G.zones.ids()) G.seek.today(z);
  return { words: Object.keys(s.words).length, backlog: G.budget.backlog(), today: G.budget.today(), chapters: CH.ids().length, lines: CH.lines().length, spots: G.seek.SPOTS.length,
    maps: G.zones.ids().map(z => { const d = G.zones.def(z); return { zone: z, map: d.entry.map, x: d.entry.x, y: d.entry.y }; }) };
};
// on a map: there, free to walk, by day; the zone's game of hide-and-seek started (the animals hide, unless its story
// is in the way), so the busiest everyday state is what is timed
const ARRIVE = m => {
  if (G.field.mapId !== m.map) G.goto(m.map, m.x, m.y, 'down'); else { const p = G.field.player; Object.assign(p, { x: m.x, y: m.y, ox: 0, oy: 0, moving: false, dir: 'down' }); G.field.route = null; G.field.snapCam(); }
  G.sessionTime = Math.min(G.sessionTime, 120); // (the sun stays up: a long test is still one afternoon)
  const sk = G.seek.today(m.zone); if (sk && !sk.done) sk.on = true;
};
const STATE = () => { const f = G.field, sk = G.seek.today(); return { map: f.mapId, free: G.top() === f && !f.locked, animals: f.zoo ? f.zoo.list.length : 0, people: f.npcs.length, hiding: sk && sk.on && G.seek.active() ? sk.list.filter(h => !h.found).length : 0, why: G.guide.at ? G.guide.at.why : (G.guide.lastWhy || '') + ' (no arrow)', night: !!(G.day && G.day.over()) }; };

// the ground of the map on screen, drawn twice at several moments of its animations and two places: with the tiles'
// pictures kept with the map (tiles.js G.tileCanvas) and worked out from scratch -> how many of them differ (0)
const GROUND = () => {
  const f = G.field, T = G.TILE, c = G.makeCanvas(G.W, G.H), x = c.getContext('2d'), t0 = f.t, cam0 = { x: f.cam.x, y: f.cam.y };
  const draw = (cx, cy) => { x.clearRect(0, 0, G.W, G.H); f.drawGround(x, T, cx, cy); return x.getImageData(0, 0, G.W, G.H).data; };
  let diff = 0, n = 0, anim = 0, prev = null;
  for (const [cx, cy] of [[Math.round(f.cam.x), Math.round(f.cam.y)], [0, 0], [Math.max(0, f.map.w * T - G.W), Math.max(0, f.map.h * T - G.H)]]) for (const t of [0, 17, 40, 83, 120, 200, 331]) {
    f.t = t;
    draw(cx, cy); const kept = draw(cx, cy).slice(); // (drawn once to fill what is kept, then from it)
    f.map.tc = null; G.clearTileCache(); const scratch = draw(cx, cy);
    let same = true; for (let i = 0; i < kept.length; i++) if (kept[i] !== scratch[i]) { same = false; break; }
    if (prev && cx === 0 && cy === 0) { for (let i = 0; i < kept.length; i++) if (kept[i] !== prev[i]) { anim++; break; } }
    prev = cx === 0 && cy === 0 ? kept : null;
    n++; if (!same) diff++;
  }
  f.t = t0; f.cam.x = cam0.x; f.cam.y = cam0.y;
  return { n, diff, anim, kept: !!(f.map.tc && f.map.tc.at.length) };
};

// "What's going on" as the game sees it inside a frame, as one text: read at the end of the map's update, once from what
// is remembered and once more after everything remembered is thrown away (G.budget.flush, G.chapters.flush,
// G.seek.flush), at the same moment. The two must be the same, whatever happened before.
const WATCH = () => {
  const CH = G.chapters, W = G.words, B = G.budget, SK = G.seek, WT = window.__watch = { want: 0, res: null, did: 0 };
  const snap = () => { const f = G.field; return {
    day: G.today() + ' ' + W.dayNum() + ' s' + W.sess(),
    cur: CH.lines().map(l => CH.current(l) || '-').join(), next: CH.lines().map(l => CH.next(l) || '-').join(),
    live: CH.lives().map(L => L.id + ':' + L.k + (L.started ? '' : '?')).join(), here: (L => (L ? L.id + ':' + L.k : '-'))(CH.live()),
    gate: CH.ids().map(id => CH.gate(id) || 'open').join(), waiting: CH.waiting(), review: CH.needsReview() + ' ' + CH.stage1(), nudge: CH.nudge() + ' ' + CH.nudgeSoon(),
    bubbles: f.npcs.map(n => { try { return n.id + ':' + JSON.stringify((n.alert && n.alert()) || 0); } catch (e) { return n.id + ':!'; } }).join(' '),
    budget: [B.backlog(), B.today(), B.why(), B.canIntro(1)].join(), count: [1, 2, 3, 4].map(n => W.count(n)).join(), due: G.review.due(1e9).join(), palabra: G.favores.palabraReady(),
    seek: G.zones.ids().map(z => z + ':' + SK.ready(z)).join() + ' ' + SK.active() + ' ' + SK.KINDS.filter(k => SK.hiding(k)).join(),
    goal: (g => (g ? g.why : '-'))(G.guide.goal(f)),
  }; };
  const up = G.guide.update;
  G.guide.update = function (f) { // (the last of the map's own systems: inside the frame, where what is remembered is used)
    up.call(this, f);
    if (!WT.want || G.frame < WT.want) return;
    WT.want = 0;
    const a = snap(); B.flush(); CH.flush(); SK.flush(); const b = snap();
    WT.res = { a, b, frame: G.frame };
  };
};
// a change made the way the game makes them: inside a frame, as a step of one of the map's tasks
const INSIDE = code => { window.__watch.did = 0; G.field.tasks.add((function* () { (new Function(code))(); window.__watch.did = G.frame; })()); };

// ---------- in the test ----------
const sorted = a => a.slice().sort((x, y) => x - y);
const pct = (a, p) => { const s = sorted(a); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
const f1 = n => (Number.isFinite(n) ? n.toFixed(1) : '?');
const span = a => (a.length ? f1(Math.min(...a)) + (a.length > 1 ? '-' + f1(Math.max(...a)) : '') : '?');

// one profiled window: ms a frame by part. A sample's time goes to the function that was running, by its file (so
// what the guide asks of the chapters is the chapters' time); the canvas's own calls (drawImage, fillRect...) go to the
// part that made them; the browser's work outside the game's code (its painting, its memory sweeps) is kept apart.
async function profile(cdp, g) {
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  await cdp.send('Profiler.start');
  const w = await g.ev(WINDOW, [FRAMES, WINDOW_MS]);
  const { profile: P } = await cdp.send('Profiler.stop');
  await cdp.send('Profiler.disable');
  const node = {}, up = {}; for (const n of P.nodes) { node[n.id] = n; for (const c of n.children || []) up[c] = n.id; }
  const fileOf = n => (n.callFrame.url || '').split('/').pop().split('?')[0];
  const partOf = id => { // null: idle
    const fn = node[id].callFrame.functionName || '';
    if (fn === '(idle)') return null;
    if (fn === '(program)' || fn === '(garbage collector)' || fn === '(root)') return 'browser';
    for (let k = id; k != null; k = up[k]) { const f = fileOf(node[k]); if (f) return PART_OF[f] || 'rest'; } // (a canvas call: whoever made it)
    return 'test'; // (this test's own clock and walker)
  };
  const ms = {}, top = {}; (P.samples || []).forEach((id, i) => {
    const k = partOf(id), d = (P.timeDeltas[i] || 0) / 1000; if (!k) return;
    ms[k] = (ms[k] || 0) + d;
    if (k !== 'browser' && k !== 'test') { const n = node[id], f = fileOf(n), name = (f ? f + ' ' : 'canvas ') + (n.callFrame.functionName || '(anonymous)') + (f ? ':' + (n.callFrame.lineNumber + 1) : ''); top[name] = (top[name] || 0) + d; }
  });
  const n = Math.max(1, w.ms.length); for (const k in ms) ms[k] /= n;
  return { ms, frames: w.ms.length, median: pct(w.ms, 0.5), top: Object.keys(top).sort((a, b) => top[b] - top[a]).slice(0, 6).map(k => k + ' ' + f1(top[k] / n)) };
}

async function measure(browser, C, out) {
  const { ctx, g } = await open(browser, 'speed-' + C.id, true, { warmup: true, phrases: true, listen: true });
  try {
    const cdp = await ctx.newCDPSession(g.page);
    await g.ev(PROBE);
    if (C.triple) { const t = await g.ev(TRIPLE); check(C.id + ': three times the content is in the page (every written chapter and its line copied twice: a chapter with no script yet is not copied; 129 hiding places)', t.chapters === t.want.chapters && t.lines === t.want.lines && t.spots === 129, JSON.stringify(t)); }
    const seed = await g.ev(SEED, { words: C.words || 0, triple: !!C.triple });
    await g.fieldIdle('villa');
    console.log('  the save: ' + seed.words + ' words (' + seed.backlog + ' due, ' + seed.today + ' new today), ' + seed.chapters + ' chapters in ' + seed.lines + ' lines, ' + seed.spots + ' hiding places');
    if (C.words) check(C.id + ': the save has ' + C.words + ' word records', seed.words === C.words, String(seed.words));
    const maps = seed.maps.filter(m => !MAPS.length || MAPS.includes(m.map));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    const R = {}; for (const m of maps) R[m.map] = { still: [], walk: [], busy: 0, info: null };
    const passes = w => w.median <= C.median && (C.p95 == null || w.p95 <= C.p95);
    const settled = m => ['still', 'walk'].every(k => R[m.map][k].length >= ROUNDS && R[m.map][k].every(passes));
    const arrive = async m => { await g.ev(ARRIVE, m); await g.fieldIdle(m.map); await g.frames(30); }; // (the first frames on a map draw its tiles for the first time: not timed)
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const todo = maps.filter(m => round < ROUNDS || !settled(m)); if (!todo.length) break;
      for (const m of todo) {
        await arrive(m);
        if (!R[m.map].info) R[m.map].info = await g.ev(STATE);
        for (const mode of ['still', 'walk']) {
          await g.ev(on => window.__sp.start(on), mode === 'walk');
          if (mode === 'walk') await g.frames(12);
          const w = await g.ev(WINDOW, [FRAMES, WINDOW_MS]);
          await g.ev(() => window.__sp.start(false));
          if (w.busy > w.ms.length / 10 || w.map !== m.map) { // (something came up, or she left the map: not frames of walking about here)
            R[m.map].busy++; R[m.map].busyTop = w.map !== m.map ? 'she left for ' + w.map : w.top;
            await g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0, 'whatever came up on ' + m.map).catch(() => { }); await arrive(m); continue;
          }
          R[m.map][mode].push({ median: pct(w.ms, 0.5), p95: pct(w.ms, 0.95), max: Math.max(...w.ms), n: w.ms.length, steps: w.steps / w.ms.length });
        }
      }
    }
    // where the time goes: one more window on each map, walking, with the profiler on
    for (const m of maps) {
      await arrive(m); await g.ev(() => window.__sp.start(true)); await g.frames(12);
      R[m.map].prof = await profile(cdp, g);
      await g.ev(() => window.__sp.start(false));
    }
    // the map's tiles keep their pictures (tiles.js): the ground must look the same as worked out from scratch
    const ground = [];
    if (C.id === 'a') for (const m of maps) { await arrive(m); ground.push(Object.assign({ map: m.map }, await g.ev(GROUND))); }
    // the grown-ups' reading (core.js G.perf), against this test's clock: one more window, walking, read both ways
    let perf = null;
    if (await g.ev(() => !!(window.G.perf && G.perf.line && G.perf.reset))) {
      const m = maps[maps.length - 1];
      await arrive(m); await g.ev(() => { window.__sp.start(true); G.perf.reset(); });
      const w = await g.ev(WINDOW, [Math.max(FRAMES, 150), WINDOW_MS * 2]);
      perf = await g.ev(() => ({ line: G.perf.line(), short: G.perf.short(), typical: G.perf.typical(), frames: G.perf.frames(), fps: G.perf.fps() }));
      await g.ev(() => window.__sp.start(false));
      perf.mine = pct(w.ms, 0.5); perf.busy = w.busy; perf.n = w.ms.length;
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    // the tables
    console.log('  ms of work a frame, the browser slowed ' + RATE + ' times (best window; in brackets: every window\'s typical frame)');
    const res = out[C.id] = {};
    for (const m of maps) {
      const r = R[m.map], i = r.info || {};
      console.log('  ' + m.map + '  (' + i.people + ' people, ' + i.animals + ' animals, ' + i.hiding + ' hiding; the arrow: ' + i.why + (i.night ? '; NIGHT' : '') + ')');
      res[m.map] = {};
      for (const mode of ['still', 'walk']) {
        const ws = r[mode], best = ws.slice().sort((a, b) => (passes(b) - passes(a)) || a.median - b.median)[0];
        res[m.map][mode] = best ? { median: best.median, p95: best.p95, medians: ws.map(w => w.median), p95s: ws.map(w => w.p95) } : null;
        console.log('    ' + (mode === 'still' ? 'standing' : 'walking ') + '  typical ' + (best ? f1(best.median).padStart(5) : '    ?') + '   95 in 100 under ' + (best ? f1(best.p95).padStart(5) : '    ?') + '   [' + ws.length + ' windows: ' + span(ws.map(w => w.median)) + '; slow frames ' + span(ws.map(w => w.p95)) + (best && best.steps > 1.2 ? '; ' + f1(best.steps) + ' updates a frame' : '') + ']');
      }
      if (r.prof) {
        const p = r.prof.ms; res[m.map].parts = p; res[m.map].top = r.prof.top;
        console.log('    where it goes (walking, profiled: ' + f1(r.prof.median) + ' ms):  ' + PARTS.map(([k, name]) => name + ' ' + f1(p[k] || 0)).join(' | ') + '   (outside the game\'s work, the browser\'s own: ' + f1(p.browser || 0) + ')');
        console.log('      most: ' + r.prof.top.join(', '));
      }
    }
    // the pass marks
    const soft = (name, ok, msg) => { try { check(name, ok, msg); } catch (e) { /* (every map is judged, not only the first slow one) */ } };
    for (const m of maps) for (const mode of ['still', 'walk']) {
      const r = res[m.map][mode], what = C.id + ': ' + m.map + ', ' + (mode === 'still' ? 'standing' : 'walking') + ': a typical frame takes ' + C.median + ' ms or less' + (C.p95 ? ', 95 in 100 take ' + C.p95 + ' ms or less' : '');
      if (!r) soft(what, false, 'never free to measure (' + (R[m.map].busyTop || '?') + ' came up ' + R[m.map].busy + ' times)');
      else soft(what, r.median <= C.median && (C.p95 == null || r.p95 <= C.p95), 'typical ' + f1(r.median) + ' ms, slow frames ' + f1(r.p95) + ' ms');
    }
    if (ground.length) soft(C.id + ': the tiles\' kept pictures draw the same ground as worked out from scratch (every map, 3 places, 7 moments of the animations)',
      ground.every(r => r.n === 21 && r.diff === 0 && r.kept) && ground.some(r => r.anim > 0), JSON.stringify(ground));
    // the grown-ups' reading: there, a plain sentence, and within 2 ms (or a sixth) of this test's clock for the same frames
    soft(C.id + ': the grown-ups\' speed reading is a plain sentence (G.perf.line: "Speed: a typical frame takes N ms; N% of frames are slow (over 33 ms)...")',
      !!perf && /^Speed: a typical frame takes \d+ ms; \d+% of frames are slow \(over 33 ms\)/.test(perf.line) && /^\d+ ms a frame, \d+% slow/.test(perf.short), perf ? perf.line + ' / ' + perf.short : 'no G.perf');
    if (perf) {
      console.log('    the reading a grown-up sees: "' + perf.line + '"  (this test\'s clock for the same ' + perf.n + ' frames: ' + f1(perf.mine) + ' ms; on the Overview: "' + perf.short + '")');
      soft(C.id + ': the reading agrees with this test\'s clock (the typical frame, the same frames)', perf.typical != null && Math.abs(perf.typical + 0.5 - perf.mine) <= Math.max(2, perf.mine / 6), 'the reading ' + perf.typical + ' ms, the test ' + f1(perf.mine) + ' ms (' + perf.frames + ' frames read, ' + perf.busy + ' busy)');
    }
    soft(C.id + ': no console errors', !g.errors.length, g.errors.slice(0, 5).join('\n'));
  } finally { await ctx.close(); }
}

// what is remembered stays right: after each kind of change, the game's view inside a frame against the same from scratch
async function remembered(browser) {
  const { ctx, g } = await open(browser, 'speed-memo', true, { warmup: true, phrases: true, listen: true });
  try {
    await g.ev(PROBE); await g.ev(SEED, { words: 0, triple: false });
    await g.fieldIdle('villa'); await g.ev(WATCH);
    const look = async (what, sees) => { // a few frames later (nothing thrown away meanwhile): the two views, and that the change shows
      await g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0, null, 'the map free (' + what + ')');
      await g.frames(4);
      await g.ev(() => { window.__watch.res = null; window.__watch.want = G.frame + 1; });
      await g.until(() => !!window.__watch.res, null, 'a look inside a frame (' + what + ')');
      const r = await g.ev(() => window.__watch.res), a = r.a, b = r.b, diff = Object.keys(b).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
      check('memo: ' + what + ': what the game remembers is what it would work out from scratch', !diff.length, diff.map(k => k + ': remembered ' + JSON.stringify(a[k]) + ', from scratch ' + JSON.stringify(b[k])).join('; '));
      if (sees) check('memo: ' + what + ': the change shows', !!sees(b), JSON.stringify(b));
      return b;
    };
    const inside = async code => { await g.ev(INSIDE, code); await g.until(() => window.__watch.did > 0, null, 'the change, made inside a frame'); };
    const at = (list, id, s) => s.split(',')[list.indexOf(id)];
    const lines = await g.ev(() => G.chapters.lines().slice()), ids = await g.ev(() => G.chapters.ids());
    const v0 = await look('the game just begun to be watched', b => at(lines, 'villa', b.cur) === 'c12' && /c12:1/.test(b.live) && b.budget.startsWith('12,2,'));
    // a word answered; a word met
    await inside('const id = G.review.due(1, { minStage: 2 })[0]; G.words.answerRight(id, { mode: "text" });');
    const v1 = await look('a due word answered right', b => b.budget.startsWith('11,2,') && b.due !== v0.due);
    await inside('const id = Object.keys(G.data.words).find(k => !G.words.met(k) && G.iconDrawn(k)); G.words.meet(id, "test");');
    const v2 = await look('a new word met', b => b.budget.startsWith('11,3,') && b.count !== v1.count && b.review !== v1.review);
    await inside('window.__k = [G.budget.backlog(), G.words.count(2)]; const id = G.review.due(1, { minStage: 1, maxStage: 1 })[0]; G.words.answerRight(id, { mode: "text" }); window.__k.push(G.budget.backlog(), G.words.count(2), G.words.stage(id));');
    check('memo: inside one step of a talk, an answer shows at once (the backlog one fewer, one more word known)', await g.ev(() => { const k = window.__k; return k[2] === k[0] - 1 && k[3] === k[1] + 1 && k[4] === 2; }), JSON.stringify(await g.ev(() => window.__k)));
    await look('a word answered inside a talk');
    // the story: a beat, a chapter ends, a chapter starts
    await inside('G.state.ch.step.c12 = 2; G.st.autosave();');
    await look('a beat of the story played (the chapter\'s step moved on)', b => /c12:2/.test(b.live));
    await inside('G.st.finishQuest("c12"); G.state.ch.doneSess.c12 = G.words.sess(); G.state.ch.lastDoneSess = G.words.sess();');
    await look('a chapter ended', b => at(lines, 'villa', b.cur) === '-' && at(lines, 'villa', b.next) === 'c13' && at(ids, 'c12', b.gate) === 'done' && !/c12/.test(b.live));
    await inside('G.chapters.start("juegos2");');
    await look('a chapter started', b => at(lines, 'juegos', b.cur) === 'juegos2' && /juegos2:0/.test(b.live));
    await inside('const CH = G.chapters, k = L => (CH.lives().find(x => x.line === L) || {}).k; window.__k = [k("montana"), CH.current("montana"), CH.next("montana")]; G.state.ch.step.montana2 = 2; window.__k.push(k("montana")); G.st.finishQuest("montana2"); window.__k.push(CH.current("montana"), CH.next("montana"), CH.gate("montana2"), (CH.lives().find(x => x.line === "montana") || {}).id !== "montana2");');
    check('memo: inside one step of a beat, its step and its end show at once (the live chapter, the next one)', await g.ev(() => JSON.stringify(window.__k) === JSON.stringify([1, 'montana2', null, 2, null, 'montana3', 'done', true])), JSON.stringify(await g.ev(() => window.__k)));
    await look('a beat and a chapter\'s end inside one step', b => at(lines, 'montana', b.next) === 'montana3');
    // a first visit to a zone (its first chapter opens that day, whatever the backlog)
    await inside('delete G.state.world.visited.abuelos;');
    await look('a zone not visited yet'); // (today, with a chapter begun and 10 reviews waiting, its first chapter waits for room)
    await inside('G.zones.visit("abuelos");');
    await look('a first visit to a zone', b => at(ids, 'abuelos1', b.gate) === 'open' && /abuelos1:0\?/.test(b.live));
    // a new day
    await inside('G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession("load");');
    const v4 = await look('a new day', b => b.day !== v2.day && b.budget.split(',')[1] === '0' && Number(b.budget.split(',')[0]) > 11);
    await inside('G.debug.dayShift++;'); // (midnight passes while she plays: no new session)
    const v4b = await look('midnight passes during play', b => b.day.split(' ')[1] !== v4.day.split(' ')[1] && b.day.split(' ')[2] === v4.day.split(' ')[2] && Number(b.budget.split(',')[0]) >= Number(v4.budget.split(',')[0]));
    // the save object swapped for a copy in which one more word is due and an early chapter is not done (nothing else differs)
    await inside('const s = JSON.parse(JSON.stringify(G.state)), dn = G.words.dayNum(), id = Object.keys(s.words).find(k => s.words[k].st >= 2 && s.words[k].due == null && s.words[k].dc > dn); Object.assign(s.words[id], { dc: dn - 1 }); delete s.quests.c3; G.state = s;');
    await look('the save swapped for another (a copy: one more word due, an early chapter undone)', b => Number(b.budget.split(',')[0]) === Number(v4b.budget.split(',')[0]) + 1 && at(lines, 'villa', b.next) === 'c3');
    await inside('G.state.quests.c3 = "done"; G.st.begin(1);');
    // the game saved and loaded (another G.state object); another slot and back
    await inside('G.st.saveNow(); G.st.loadSlot(1); G.goto("villa", 26, 12, "down");');
    const v5 = await look('the game loaded again', b => b.cur === v4.cur && b.next === v4.next && b.count === v4.count && at(lines, 'villa', b.next) === 'c13');
    await inside('G.st.saveNow(); G.st.newGame(); G.state.name = "Ana"; Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true }); G.words.newSession("new"); G.st.begin(2); G.goto("villa", 26, 12, "down");');
    await look('another player\'s game (slot 2, a new one)', b => at(lines, 'villa', b.next) === 'c1' && b.count === '0,0,0,0' && b.budget.startsWith('0,0,') && /villa:false/.test(b.seek));
    await inside('for (const k of ["gato", "conejo", "gallina"]) G.words.meet(k, "test");');
    await look('animals met: hide-and-seek can begin in Villa Sol', b => /villa:true/.test(b.seek) && b.count === '3,0,0,0');
    await inside('G.st.saveNow(); G.st.loadSlot(1); G.goto("villa", 26, 12, "down");');
    await look('back to the first player\'s game (slot 1)', b => b.cur === v5.cur && b.next === v5.next && b.count === v5.count && b.gate === v5.gate);
    // the save changed by hand between frames, the way tests do it
    await g.ev(() => { G.state.quests.bosque2 = 'done'; });
    await look('a chapter marked done by hand, between frames', b => at(lines, 'bosque', b.cur) === '-' && at(lines, 'bosque', b.next) === 'bosque3');
    const bl = Number((await g.ev(() => G.budget.backlog())));
    await g.ev(() => { const id = G.words.list(2).find(k => !G.words.due(k)); Object.assign(G.words.rec(id), { due: null, ds: null, dc: G.words.dayNum() - 1 }); });
    await look('a word\'s record changed by hand, between frames', b => Number(b.budget.split(',')[0]) === bl + 1);
    await g.ev(() => { G.chapters.add({ id: 'zt1', line: 'zt', title: 'Prueba', en: 'Test', giver: 'pepe', words: [], icon: 'queso' }); G.chapters.script('zt1', [{ who: 'pepe', run: function* () { } }]); });
    await look('a chapter added to the table (a new line)', b => /zt1/.test(b.next));
    check('memo: no console errors', !g.errors.length, g.errors.slice(0, 5).join('\n'));
  } finally { await ctx.close(); }
}

const out = {}, want = id => !ONLY.length || ONLY.includes(id);
run('speed: a frame\'s work on a slow tablet (the browser slowed ' + RATE + ' times)', (want('memo') ? [['what is remembered stays right', remembered]] : []).concat(CASES.filter(C => want(C.id)).map(C => [C.id + ') ' + C.name, browser => measure(browser, C, out)])).concat([['what this cannot see', async () => {
  if (process.env.SPEED_JSON) fs.writeFileSync(process.env.SPEED_JSON, JSON.stringify(out, null, 1));
  console.log('  The slowdown makes this browser run the game\'s program ' + RATE + ' times slower. It does not stand in for an iPad\'s');
  console.log('  painting: here the canvas is painted by this machine\'s own software, there by the iPad\'s graphics chip. So this');
  console.log('  test proves that the game\'s own work fits in a frame, today and with three years of content. How long her iPad');
  console.log('  takes to paint about 190 tiles, 30 animals and the sunset each frame can only be read on the iPad: Learning page,');
  console.log('  Overview, the Speed row (the whole sentence is in the shared text). If it says few pictures a second while a');
  console.log('  frame\'s work is small, the painting is the slow part.');
}]]));
