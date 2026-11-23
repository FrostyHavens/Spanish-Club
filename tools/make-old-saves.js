// Real saves of an OLDER release, for tools/test-resplit.js: a bot plays the old game from a new game to the diploma,
// and the save slot is kept each time a chapter moves to another step (the same text the old game writes to the iPad's
// storage when the page is hidden at that moment: its own S.saveNow). So there is one save for every (chapter, step) of
// the old game, the first and the last step too, plus a few from the middle of a beat (just after a chapter's thing went
// into the bag or came out of it: a child who pressed the home button there).
//
// How to add a release's saves (after each release, from the game that is now live; the older files stay: her save
// may be several releases old):
//   git worktree add /tmp/old-main origin/main          (the old game, outside this folder)
//   OLD=/tmp/old-main NODE_PATH=$(npm root -g) node tools/make-old-saves.js
//   git worktree remove /tmp/old-main
// It writes tools/fixtures/saves-<the date of the old game's last commit>.json (about 15 minutes, some 70 KB), and
// tools/test-resplit.js plays every such file. The old game is played with ITS OWN tools/harness.js and
// tools/playflow.js (they know that game), the live game's way: phrases and listen-and-do on, story pacing open (the
// bot does no reviews), each new day a real save, back to the title and on (playflow nextDay). The play begins 30 days
// ago (G.debug.dayShift), so the saves are some weeks old when the test opens them. In the middle of chapter 6 she takes
// the bus to the beach, the forest and the mountain and plays each one's first chapter (two lines going on at once).
//   OLD      the old game's folder (default /tmp/old-main)      OUT   the file to write (default: as above)
//   SPEED    game frames per screen frame (default 3)           DAYS_AGO  how long ago the play begins (default 30)
//   UNTIL    stop once this chapter is done (UNTIL=c12: the first twelve)   TRIP=0  no bus trip to the zones
//   PICK_HINT=ends  the file says that the test need only play three saves of each chapter (a sample of a release
//            before the last one, whose scripts are the same)
//   MAX_KB   the file's size limit (default 1500): over it, KEEP=c4,c6,... keeps every save of those chapters and, of
//            the others, the first, a middle and the last step
// An older release still (before tools knew G.chapters.scriptOf): the same command with OLD= its worktree; the script
// list is read as its chapters.js loads.
// The file: { about, release (that date), from (the old commit), made, pick, beats {chapter: how many beats the old script had}, shapes {chapter:
// its beats' triggers: arrowplay.js chapterShapes}, list [{id, ch, step, kind 'step' | 'mid', shift, bag}], blob (the
// saves' texts, a JSON list in the list's order, brotli + base64) }.
'use strict';
const path = require('path'), fs = require('fs'), zlib = require('zlib'), cp = require('child_process');

const OLD = path.resolve(process.env.OLD || '/tmp/old-main');
const git = (...a) => cp.execFileSync('git', ['-C', OLD].concat(a)).toString().trim();
const SPEED = Number(process.env.SPEED || 3), DAYS_AGO = Number(process.env.DAYS_AGO || 30), MAX_KB = Number(process.env.MAX_KB || 1500);
if (!fs.existsSync(path.join(OLD, 'tools', 'harness.js'))) { console.log('No older game at ' + OLD + ' (git worktree add /tmp/old-main origin/main, or OLD=...)'); process.exit(1); }
if (!process.argv[2]) process.argv[2] = path.join(require('os').tmpdir(), 'old-saves-shots'); // (the old harness reads its screenshot folder there)
const H = require(path.join(OLD, 'tools', 'harness.js')), flow = require(path.join(OLD, 'tools', 'playflow.js'));
const { followArrow, chapterShapes } = require('./arrowplay');

// page-side (the old game): keep the slot's text each time a chapter is on a step for the first time, and at a
// chapter's bag changes in the middle of a beat
const INSTRUMENT = () => {
  if (window.__snaps) return;
  const out = window.__snaps = [], seen = {}, S = G.st, auto = S.autosave;
  const bag = id => ((G.state.bag && G.state.bag.items) || []).filter(it => it.q === id).map(it => it.id + (it.to ? '>' + it.to : '') + (it.col ? '/' + it.col : '')).join(',');
  const snap = (kind, id, k) => {
    if (!S.saveNow()) return; // (what a page hidden at this very moment writes)
    out.push({ id: id + '@' + k + (kind === 'mid' ? '+' + seen[id + '@' + k].mids : ''), ch: id, step: k, kind, shift: G.debug.dayShift || 0, bag: bag(id), raw: localStorage.getItem(S.slotKey(S.slot)) });
  };
  S.autosave = function () {
    try {
      if (S.slot && G.state && (!S.playing || S.playing()) && G.state.ch && G.state.ch.step) {
        const run = G.chapters.running && G.chapters.running();
        for (const id of G.chapters.ids()) {
          if (G.state.quests[id] !== 'active') continue;
          const sc = G.chapters.scriptOf(id), k = G.state.ch.step[id] | 0; if (!sc || k >= sc.beats.length) continue;
          const key = id + '@' + k, b = bag(id);
          if (!seen[key]) { seen[key] = { bag: b, mids: 0 }; snap('step', id, k); }
          else if (run && run.id === id && run.k === k && b !== seen[key].bag && seen[key].mids < 2) { seen[key].bag = b; seen[key].mids++; snap('mid', id, k); }
        }
      }
    } catch (e) { console.error(e); }
    return auto.apply(this, arguments);
  };
};

const free = () => G.field && G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving;

(async () => {
  const from = git('rev-parse', '--short', 'HEAD'), release = git('log', '-1', '--format=%cs');
  const OUT = path.resolve(process.env.OUT || path.join(__dirname, 'fixtures', 'saves-' + release + '.json'));
  console.log('Old saves: playing the older game at ' + OLD + ' (' + from + ', ' + release + ')');
  const browser = await H.launch(), t0 = Date.now(), snaps = [];
  const { ctx, g } = await H.open(browser, 'old-saves', true, { phrases: true, listen: true, openPacing: true });
  const pull = async () => { for (const s of await g.ev(() => window.__snaps ? window.__snaps.splice(0) : [])) { snaps.push(s); console.log('    save ' + s.id + (s.bag ? '  [' + s.bag + ']' : '') + '  ' + Math.round(s.raw.length / 1024) + ' KB'); } };
  try {
    if (!(await g.ev(() => !!G.chapters.scriptOf))) { // (an older release: its scripts are kept as its chapters.js loads)
      await g.page.route(/src\/chapters\.js/, route => route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(path.join(OLD, 'src', 'chapters.js'), 'utf8') +
        '\n;(function () { var S = {}, o = G.chapters.script; G.chapters.script = function (id, beats, opts) { S[id] = { beats: beats, o: opts || {} }; return o.apply(this, arguments); }; G.chapters.scriptOf = function (id) { return S[id] || null; }; })();\n' }));
      await g.page.reload();
      await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    }
    await g.ev(d => { G.debug.dayShift = -d; }, DAYS_AGO);
    await g.ev(INSTRUMENT);
    await flow.newGame(g);
    await g.ev(s => { G.speedMul = s; if (G.demo && G.demo.skip) G.demo.skip(); }, SPEED);
    let trip = process.env.TRIP === '0';
    const UNTIL = process.env.UNTIL || '', STOP = new Error('far enough');
    await flow.playToEnd(g, { fastSunset: true, beforeStep: async st => {
      await pull();
      if (UNTIL && st.q[UNTIL] === 'done') throw STOP;
      // in the middle of chapter 6 (the bread in her hands, Nico waiting at the pond): the bus to three zones, each
      // one's first chapter by the arrow, then back to the plaza
      if (!trip && st.q.c6 === 'active' && await g.ev(() => (G.state.ch.step.c6 | 0) >= 2 && !G.chapters.running())) {
        trip = true;
        for (const z of ['playa', 'bosque', 'montana']) {
          console.log('    the bus to ' + z);
          await g.ev(z => { G.zones.visit('villa'); G.zones.visit(z); const e = G.zones.def(z).entry; G.goto(e.map, e.x, e.y, e.dir || 'down'); }, z);
          await g.until(free, null, 'the zone ' + z);
          const first = await g.ev(z => G.chapters.ids().find(id => G.chapters.lineOf(id) === z), z);
          const r = await followArrow(g, flow, { line: z, until: first, minutes: 10, each: pull, log: s => console.log('    ' + s) });
          if (!r.done.includes(first)) throw new Error(z + ': its first chapter did not end');
        }
        await g.ev(() => G.goto('villa', 15, 13, 'down'));
        await g.until(free, null, 'back on the plaza');
        return 'skip';
      }
    } }).catch(e => { if (e !== STOP) throw e; });
    await pull();
    if (g.errors.length) console.log('  (the old game\'s console errors: ' + g.errors.slice(0, 5).join(' | ').slice(0, 600) + ')');
    const beats = await g.ev(() => { const o = {}; for (const id of G.chapters.ids()) { const sc = G.chapters.scriptOf(id); if (sc) o[id] = sc.beats.length; } return o; });
    // every step of every chapter played must be there
    const missing = [];
    for (const id of Object.keys(beats)) { if (!snaps.some(s => s.ch === id)) continue; for (let k = 0; k < beats[id]; k++) if (!snaps.some(s => s.ch === id && s.step === k && s.kind === 'step')) missing.push(id + '@' + k); }
    if (missing.length) console.log('  MISSING steps: ' + missing.join(' '));
    // the dates in the saves are those of the play (some weeks ago): the time each was written too
    for (const s of snaps) { const o = JSON.parse(s.raw); o.savedAt += s.shift * 864e5; s.raw = JSON.stringify(o); }
    write(OUT, snaps, beats, { from, release }, await g.ev(chapterShapes));
    console.log('Done in ' + Math.round((Date.now() - t0) / 60000) + ' minutes: ' + snaps.length + ' saves of ' + new Set(snaps.map(s => s.ch)).size + ' chapters.');
  } catch (e) {
    console.log('FAILED: ' + (e.stack || e.message));
    await pull().catch(() => {});
    console.log('  (' + snaps.length + ' saves so far; nothing written)');
    process.exitCode = 1;
  } finally { await ctx.close(); await browser.close(); }
})();

function pack(list) { return zlib.brotliCompressSync(Buffer.from(JSON.stringify(list.map(s => s.raw))), { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24 } }).toString('base64'); }
// (a file over the size limit: the chapters named in KEEP keep every save, the others their first, a middle and their
// last step; it says which saves it left out)
function write(OUT, snaps, beats, o, shapes) {
  let list = snaps.slice();
  let blob = pack(list), dropped = [];
  if (blob.length > MAX_KB * 1024 && process.env.KEEP) {
    const keep = process.env.KEEP.split(',');
    const thin = s => !keep.includes(s.ch) && (s.kind === 'mid' || !(s.step === 0 || s.step === beats[s.ch] - 1 || s.step === (beats[s.ch] >> 1)));
    dropped = list.filter(thin).map(s => s.id); list = list.filter(s => !thin(s)); blob = pack(list);
  }
  const file = {
    about: 'Real saves made by an older release of the game, one for each step of each chapter (kind "step": as that step began; "mid": in the middle of a beat, as one of the chapter\'s things went into or out of the bag). Made by tools/make-old-saves.js, read by tools/test-resplit.js. blob: a JSON list of the saves\' texts in the list\'s order, brotli then base64.',
    release: o.release, from: o.from, made: new Date().toISOString().slice(0, 10), daysAgo: DAYS_AGO, pick: process.env.PICK_HINT || undefined, beats, shapes,
    list: list.map(s => ({ id: s.id, ch: s.ch, step: s.step, kind: s.kind, shift: s.shift, bag: s.bag })), blob,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(file) + '\n');
  console.log('  wrote ' + OUT + ': ' + list.length + ' saves, ' + Math.round(fs.statSync(OUT).size / 1024) + ' KB' + (dropped.length ? ' (left out: ' + dropped.join(' ') + ')' : ''));
}
