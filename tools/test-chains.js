// Shorter quiz chains (docs/AUDIT_2026-10.md H8, Sprint 3 item 3.1): in the story, at most 3 questions in a row before
// something happens on the map. Every chapter of every line (Villa Sol's 21, the zones' 3 each) is played on an
// iPad page, going where the guide points like a child (G.guide.goal; tools/playflow.js when it shows nothing), with
// the phrases and listen-and-do on (the live game; the dog's warm-up, a moment of its own, stays off), and every
// question is counted:
//   a question     G.ask (picture cards, sí / no, a new word's puzzle, a review), a phrase to say, a listen-and-do tray:
//                  whatever counts toward a talk's questions (words.js G.review.asked)
//   a map action   she taps the map (walks somewhere, talks to someone, picks up or gives a thing, finds something),
//                  walks with the keys, someone walks 2+ tiles (the dog runs off, a friend comes over), the dog does
//                  something (G.pet.play: sits, fetches, digs), an animal of the story moves (a.go, a.follow: the hen
//                  runs off, the rabbit trots into the paddock; an animal hopping about by itself doesn't count), a new map
// The count goes back to 0 at each map action; it fails if any run of questions is longer than MAX (3), and prints the
// longest run of each chapter (with its questions) so a chapter that is close to the limit shows up. The chapters'
// own content back to back: a morning chapter opens at once, the evening comes when one waits for it, and the next
// chapter starts as soon as it may (its giver is where the arrow then goes).
//   NODE_PATH=$(npm root -g) node tools/test-chains.js [screenshot dir]
//   ONLY=villa,playa,bosque,juegos,abuelos,montana: some lines; FROM=c11 / UNTIL=c15: part of Villa Sol's;
//   CHAINS_SPEED=n game frames per screen frame (default 3); DBG=1 prints where it goes
'use strict';
const { run, open, check } = require('./harness');
const { settle, nextTap, toward } = require('./playflow');

const MAX = 3, SPEED = Number(process.env.CHAINS_SPEED || 3);

// page-side: count the questions between map actions
const INSTRUMENT = () => {
  if (window.__chains) return;
  const C = window.__chains = { run: [], runs: [], acts: 0 };
  const where = () => { const r = G.chapters.running && G.chapters.running(); return r ? r.id + '#' + r.k : 'free play'; };
  C.reset = why => { if (C.run.length) C.runs.push({ n: C.run.length, qs: C.run, then: why }); C.run = []; C.acts++; };
  // an animal of the story set going (a.go: it trots somewhere; a.follow: it follows her): seen each frame, and at once
  // before a question
  // (and she herself on a ride the story starts: running with the kite, up the climbing frame, down the slide)
  const scan = () => { const f = G.field; if (!f) return; const r = f.player && f.player.ride; if (r && r !== C.ride) C.reset('she rides'); C.ride = r; if (!f.zoo) return; for (const a of f.zoo.list) { if (a.go && a.go !== a.__cg) C.reset('animal ' + a.kind); if (a.follow && a.follow !== a.__cf) C.reset('animal ' + a.kind + ' follows'); a.__cg = a.go; a.__cf = a.follow; } };
  (function tick() { try { scan(); } catch (e) { /* */ } requestAnimationFrame(tick); })();
  // a question (G.ask, a phrase, a listen tray: what counts toward a talk, words.js); its prompt from G.choose / the stack
  const asked = G.review.asked;
  G.review.asked = function () {
    scan();
    const st = (new Error().stack || '').split('\n').slice(2, 4).join(' '), src = /phrases\.js/.test(st) ? 'phrase' : /listen\.js/.test(st) ? 'listen' : 'ask';
    C.run.push({ at: where(), src, p: src === 'ask' ? '' : src, f: G.frame });
    return asked.apply(this, arguments);
  };
  const choose = G.choose;
  G.choose = function (o) {
    const q = C.run[C.run.length - 1];
    if (q && !q.p && o && o.answer != null) { try { q.p = G.plain(G.fill(o.prompt || '')).slice(0, 40) + ' [' + ((o.choices[o.answer] || {}).word || '') + ']'; } catch (e) { q.p = '?'; } }
    return choose.apply(this, arguments);
  };
  // map actions
  const FP = G.Field.prototype;
  const tapped = FP.tapped; FP.tapped = function () { if (!this.locked && G.top() === this && G.input.tap()) C.reset('tap'); return tapped.apply(this, arguments); };
  const step = FP.step; FP.step = function (o) { if (o === this.player && !this.locked) C.reset('walk'); return step.apply(this, arguments); };
  const walkNpc = FP.walkNpc; FP.walkNpc = function (o, dirs) { if (String(dirs || '').replace(/[^udlr]/g, '').length >= 2) C.reset('walk ' + (o && o.id)); return walkNpc.apply(this, arguments); };
  const play = G.pet.play; G.pet.play = function (k) { C.reset('dog ' + k); return play.apply(this, arguments); };
  const go = G.goto; G.goto = function (m) { C.reset('map ' + m); return go.apply(this, arguments); };
  const push = G.push; G.push = function (s) { const k = s && s.constructor && s.constructor.name; if (k === 'Night' || k === 'TodayCard') C.reset('night'); return push.apply(this, arguments); }; // (a new day: a new talk)
};

const freeNow = () => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route;

// play scenes until the map is free (the world map: tap where its arrow points, or close it)
async function scenes(g, what) {
  g.beforeAct = async s => {
    if (s.name === 'WorldMap') {
      const a = await g.ev(() => (G.top().arrowAt ? G.top().arrowAt() : null));
      if (a && await g.ev(() => G.top().t > 20)) { await g.tap(a.x, a.y); await g.frames(10); return true; }
      if (!a && await g.ev(() => G.top().t < 40)) { await g.frames(10); return true; }
      return false;
    }
    if (s.name === 'FieldMenu') { await g.tapBtn(await g.ev(() => G.top().closeXY())); return true; }
    return false;
  };
  try { await settle(g, what); } finally { g.beforeAct = null; }
}

// play a line's chapters to the end, following the arrow; -> the chapters done
async function playLine(g, line, o = {}) {
  const ids = await g.ev(([line, from, until]) => { const L = G.chapters.ids().filter(id => G.chapters.lineOf(id) === line); const a = from ? Math.max(0, L.indexOf(from)) : 0, b = until ? L.indexOf(until) : L.length - 1; return L.slice(a, b < 0 ? L.length : b + 1); }, [line, o.from || null, o.until || null]);
  const t0 = Date.now(); let idle = 0, last = '', same = 0, lastDone = -1;
  for (let step = 0; step < 3000; step++) {
    await scenes(g, line + ' step ' + step);
    const st = await g.ev(([line, ids]) => {
      const CH = G.chapters, nx = CH.next(line), cur = CH.current(line);
      return { done: ids.filter(CH.done), all: ids.every(CH.done), cur, nx, gate: nx && !cur ? CH.gate(nx) : null, map: G.field.mapId, over: G.day.over(), a: G.guide.at && !G.guide.at.hidden ? { x: G.guide.at.x, y: G.guide.at.y, tx: G.guide.at.tx, ty: G.guide.at.ty, edge: !!G.guide.at.edge, why: G.guide.at.why, marks: G.guide.at.marks ? G.guide.at.marks.map(m => [m.tx, m.ty]) : null } : null };
    }, [line, ids]);
    if (st.all) break;
    if (st.done.length !== lastDone) { lastDone = st.done.length; console.log('    ' + line + ': done ' + (st.done.join(' ') || '-') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'); }
    if (Date.now() - t0 > (o.minutes || 30) * 60000) throw new Error(line + ': still not done after ' + (o.minutes || 30) + ' minutes: ' + JSON.stringify(st));
    // a chapter waiting for the morning: the next morning comes at once (the story's own content, back to back)
    if (!st.cur && st.gate === 'morning') { await g.ev(() => { G.state.ch.lastDoneSess = null; }); continue; }
    if (!st.cur && st.gate === 'evening' && !st.over) { await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; }); await g.frames(10); continue; }
    // the next chapter may start: she goes to its giver (the arrow offers the day's other things first: hide-and-seek...)
    if (!st.cur && st.nx && !st.gate && !(await g.ev(nx => { const b = G.chapters.scriptOf(nx).beats[0]; return !!b.auto || !!b.evening; }, st.nx))) { await g.ev(nx => G.chapters.start(nx), st.nx); continue; }
    // where to tap: the guide's goal (G.guide.goal: a puzzle's choices, the ones not tried yet first), on screen the
    // thing itself, off screen a step toward it (playflow); a goal on another map: the arrow at the door or the edge;
    // else the next thing to tap (playflow), else wait a little
    let pt = null;
    const gl = await g.ev(() => {
      const f = G.field, gl = G.guide.goal(f), cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), T = G.TILE;
      if (!gl || !gl.pts || !gl.pts.length || (gl.map && gl.map !== f.mapId)) return null;
      return { why: gl.why, choice: !!gl.choice, pts: gl.pts.map(p => ({ sx: Math.round(p.x - cx), sy: Math.round(p.y - cy), tile: [Math.floor(p.x / T), Math.floor(p.y / T)] })) };
    });
    if (gl) {
      const tried = g.__tried[gl.why] || (g.__tried[gl.why] = new Set()), key = p => p.tile.join(',');
      let p = gl.choice ? gl.pts.find(q => !tried.has(key(q))) : null;
      if (!p && gl.choice) { tried.clear(); p = gl.pts[0]; }
      if (!p) p = gl.pts[0];
      const on = p.sx >= 4 && p.sx <= 316 && p.sy >= 34 && p.sy <= 220;
      if (on) { if (gl.choice) tried.add(key(p)); pt = { x: p.sx, y: p.sy, why: gl.why }; }
      else { const t = await toward(g, p.tile[0], p.tile[1]); if (t) pt = { x: t.sx, y: t.sy, why: gl.why + ' (toward)' }; }
    }
    if (!pt && st.a) pt = { x: Math.round(st.a.edge ? st.a.x : st.a.tx), y: Math.round(st.a.edge ? st.a.y : st.a.ty), why: st.a.why };
    if (!pt) { const t = await nextTap(g); if (t) pt = { x: t.sx, y: t.sy, why: 'playflow ' + t.why }; }
    if (process.env.DBG && step % 10 === 0) console.log('    [' + step + '] ' + st.map + ' cur ' + st.cur + ' next ' + st.nx + ' gate ' + st.gate + ' -> ' + (pt ? pt.why : 'nothing'));
    if (!pt) { if (++idle > 40) throw new Error(line + ': nothing to do: ' + JSON.stringify(st)); await g.frames(30); continue; }
    idle = 0;
    if (pt.why === last && ++same > 25) {
      // the same goal over and over without the chapter moving: walk next to it the long way (playflow), then on
      const t = await nextTap(g); if (t) await g.tap(t.sx, t.sy); same = 0;
      if (process.env.DBG) console.log('    (same goal: ' + pt.why + ')');
    }
    if (pt.why !== last) same = 0;
    last = pt.why;
    await g.tap(pt.x, pt.y);
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 40000);
    await g.frames(2);
  }
  await scenes(g, line + ' end');
  return g.ev(ids => ids.filter(G.chapters.done), ids);
}

// the runs of questions while these chapters played: the longest of each chapter; fails over MAX
async function judge(g, label, ids) {
  const R = await g.ev(() => { window.__chains.reset('end'); return window.__chains.runs; });
  const by = {};
  for (const r of R) {
    const at = r.qs.map(q => q.at.split('#')[0]).find(a => a !== 'free play') || 'free play';
    if (!by[at] || r.n > by[at].n) by[at] = r;
  }
  for (const id of ids.concat(['free play'])) {
    const r = by[id]; if (!r) { if (id !== 'free play') console.log('    ' + id + ': no questions'); continue; }
    console.log('    ' + id + ': longest ' + r.n + (r.n > MAX ? ' (TOO LONG)' : '') + ' at ' + [...new Set(r.qs.map(q => q.at))].join(',') + ' then ' + r.then + ' :: ' + r.qs.map(q => q.p).join(' | '));
  }
  const bad = R.filter(r => r.n > MAX);
  check(label + ': every chapter played (' + ids.length + ')', true);
  check(label + ': never more than ' + MAX + ' questions in a row before something happens on the map (' + bad.length + ' runs over)', !bad.length,
    bad.map(r => r.n + ' at ' + [...new Set(r.qs.map(q => q.at))].join(',') + ': ' + r.qs.map(q => q.p).join(' | ')).join('\n      '));
  check(label + ': no console errors', !g.errors.length, g.errors.join('\n'));
}

// ---------- Villa Sol: a new game, the opener (play with the puppy), chapters 1-21 ----------
async function villa(browser) {
  const { ctx, g } = await open(browser, 'chains-villa', true, { phrases: true, listen: true, openPacing: true });
  g.__tried = {};
  try {
    const from = process.env.FROM || null, until = process.env.UNTIL || null;
    if (!from || from === 'c1') {
      await g.toCreator();
      await g.tapRect(await g.ev(() => G.top().optRects(5)[1]));
      await g.until(() => G.top().constructor.name === 'NameEntry', null, 'the name entry');
      await g.ev(() => { G.top().name = 'Luz'; });
      await g.tapRect(await g.ev(() => G.top().cellRect(3, 6)));
      await g.until(() => G.field && G.field.mapId === 'casa', null, 'home');
      await g.ev(INSTRUMENT); await g.ev(s => { G.speedMul = s; G.demo.skip(); }, SPEED);
    } else { // a game where the chapters before `from` are done (their words known, Canelo's tricks)
      await g.ev(from => {
        G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.st.begin(1);
        const ids = G.chapters.ids().filter(id => G.chapters.lineOf(id) === 'villa'), n = ids.indexOf(from);
        for (const id of ids.slice(0, n)) { G.state.quests[id] = 'done'; for (const w of G.chapters.def(id).words) { G.words.meet(w, 'test'); G.words.answerRight(w, { firstTry: true, mode: 'text' }); } }
        Object.assign(G.state.flags, { opener: true, intro: true, canelo: true, petStart: true });
        Object.assign(G.state.pet.tricks, { ven: 3, sientate: 3 }, n >= 14 ? { pata: 3, salta: 3 } : {}, n >= 16 ? { busca: 3 } : {}, n >= 17 ? { gira: 3 } : {});
        G.demo.skip(); G.zones.visit('villa'); G.goto('villa', 15, 13, 'down');
      }, from);
      await g.until(() => G.field && G.field.mapId === 'villa' && G.fade.a === 0, null, 'the town');
      await g.ev(INSTRUMENT); await g.ev(s => { G.speedMul = s; }, SPEED);
    }
    const done = await playLine(g, 'villa', { from, until, minutes: 40 });
    const ids = await g.ev(([from, until]) => { const L = G.chapters.ids().filter(id => G.chapters.lineOf(id) === 'villa'); const a = from ? L.indexOf(from) : 0, b = until ? L.indexOf(until) : L.length - 1; return L.slice(a, b + 1); }, [from, until]);
    check('villa: chapters ' + ids[0] + '-' + ids[ids.length - 1] + ' done', ids.every(id => done.includes(id)), done.join(' '));
    await judge(g, 'villa', ids);
  } finally { await ctx.close(); }
}

// ---------- a zone: "go explore", straight to the zone, its three chapters ----------
async function zone(browser, z) {
  const { ctx, g } = await open(browser, 'chains-' + z, true, { phrases: true, listen: true, openPacing: true });
  g.__tried = {};
  try {
    await g.ev(z => {
      G.st.newGame(); G.state.name = 'Luz';
      Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
      G.words.meet('hola', 't'); G.demo.skip();
      G.zones.visit('villa'); G.zones.visit(z);
      const e = G.zones.def(z).entry;
      G.goto(e.map, e.x, e.y, e.dir || 'down');
    }, z);
    await g.until(() => G.field && G.fade.a === 0 && G.top() === G.field, null, 'the zone');
    await g.ev(INSTRUMENT); await g.ev(s => { G.speedMul = s; }, SPEED);
    const done = await playLine(g, z, { minutes: 15 });
    const ids = await g.ev(z => G.chapters.ids().filter(id => G.chapters.lineOf(id) === z), z);
    check(z + ': its chapters done (' + ids.join(' ') + ')', ids.every(id => done.includes(id)), done.join(' '));
    await judge(g, z, ids);
  } finally { await ctx.close(); }
}

const LINES = ['villa', 'playa', 'bosque', 'juegos', 'abuelos', 'montana'];
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
run('Quiz chains: at most ' + MAX + ' questions before something happens on the map', LINES.filter(l => !ONLY.length || ONLY.includes(l))
  .map(l => [l === 'villa' ? 'Villa Sol, chapters 1-21' : 'the zone: ' + l, b => (l === 'villa' ? villa(b) : zone(b, l))]));
