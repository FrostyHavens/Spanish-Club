// Her save survives a chapter re-split (src/chapters.js "a script whose beats changed", docs/CONTENT.md): real saves made
// by OLDER releases in the middle of every chapter (tools/fixtures/saves-<release date>.json, made by
// tools/make-old-saves.js: one for each step of each chapter, and a few from the middle of a beat) are opened in THIS
// game, some weeks later, and each is played to the end of its chapter by going where the arrow points
// (tools/arrowplay.js), the live game's way (phrases and listen-and-do on). For every save:
//   it opens on the step its script's table gives (or on the first beat, the chapter's things put away: a restart), and
//     the chapter remembers the script's revision
//   no console error, and nothing new in the grown-ups' Problem log
//   the chapter becomes done, and the next chapter of its line can open
//   the bag holds nothing of a finished chapter
//   the count of word cards never goes down
// Before them: the scripts' own tables (as long as the old scripts, pointing at real beats), every chapter whose beats
// differ from an older release's carries a revision, no script's beats changed without a new revision (the beats written
// down in tools/fixtures/chapter-shapes.json; RECORD=1 writes them down), a made-up step past a script's end (the
// chapter ends by itself, on any map, with the dog's warm-up on too, and the story goes on), and a chapter begun again
// (chapter 4's real save; chapter 7 forced, with its lost dog, its bone in the bag and a find-it puzzle going on).
//   NODE_PATH=$(npm root -g) node tools/test-resplit.js [screenshot dir]
// Which saves (every file of saves in tools/fixtures, the newest release first):
//   by default      every save of a chapter whose script is not at the revision the save began on (those are the ones a
//                   re-split moves), and of the other chapters the first, a middle and the last step; a file that says
//                   pick: 'ends' (a sample from a release before the last one): those three of every chapter
//   PICK=ends       those three of every chapter;  PICK=every: every save in the files
//   ONLY=c4,c6      only these chapters' saves;  KIND=step|mid: only saves made as a step began / in the middle of a beat
//   FROM=c10@3      start at this save (to go on after a stop);  SKIP_RULES=1: without the checks before the saves
//   FIXTURES=saves-2026-10-22.json   only this file (or several, with commas)
//   RESPLIT_SPEED=n game frames per screen frame (default 5);  DBG=1 prints where it goes
// It is slow: about 220 saves, each played to its chapter's end (an hour on a quiet machine, more beside other tests).
// The lines show how far it is; ONLY= and FIXTURES= run it in parts.
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { run, open, check } = require('./harness');
const flow = require('./playflow');
const { followArrow, chapterShapes } = require('./arrowplay');

const SPEED = Number(process.env.RESPLIT_SPEED || 5);
const DIR = path.join(__dirname, 'fixtures'), SHAPES = path.join(DIR, 'chapter-shapes.json');
const FILES = process.env.FIXTURES ? process.env.FIXTURES.split(',').filter(Boolean) : fs.readdirSync(DIR).filter(f => /^saves-.*\.json$/.test(f)).sort().reverse();
// a file of saves: { tag (its release), from, beats, shapes, pick, saves: [{id, ch, step, kind, bag, raw, rev (the
// revision its chapter began on)}] }
const SETS = FILES.map(name => {
  const F = JSON.parse(fs.readFileSync(path.join(DIR, name), 'utf8')), raw = JSON.parse(zlib.brotliDecompressSync(Buffer.from(F.blob, 'base64')).toString('utf8'));
  const tag = F.release || name.replace(/^saves-|\.json$/g, '');
  return { name, tag, from: F.from, made: F.made, beats: F.beats, shapes: F.shapes || null, pick: F.pick || null,
    saves: F.list.map((s, i) => { const o = JSON.parse(raw[i]); return Object.assign({ raw: raw[i], tag, rev: ((o.ch && o.ch.rev) || {})[s.ch] || 1 }, s); }) };
});
const pre = s => (SETS.length > 1 ? s.tag + ' ' : '') + s.id; // (a save's name in the lines: its release when there are several)

// ---------- a save opened in this game: from the title, slot 1 ----------
const SEEN = ['TextBox', 'Choice', 'Choicec', 'WordCard', 'BadgeCard', 'QuestCard', 'KeyHint', 'Diploma', 'QuestLog', 'FriendCard', 'Photo', 'Mirror', 'FamilyPhoto', 'ZoneDone', 'WorldPage', 'PagePuzzle',
  'NameEntry', 'PlayOrExplore', 'BedOrWalk', 'PhraseAsk', 'PhraseModel', 'ListenDo', 'NewPlace', 'Notebook', 'Deck', 'TodayCard', 'Night']; // (no first-time screenshots: there are many saves)
async function load(browser, name, raw, o = {}) {
  const { ctx, g } = await open(browser, name, true, Object.assign({ phrases: true, listen: true }, o));
  SEEN.forEach(n => g.seen.add(n));
  await g.ev(raw => { localStorage.setItem('spanishclub_migrated', '1'); localStorage.setItem('spanishclub_slot1', raw); }, raw);
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.ev(s => { // (the badges shown are kept: a chapter that ends by itself shows its own)
    window.__badges = []; const b = G.badge; G.badge = function (id) { window.__badges.push(id); return b.apply(this, arguments); };
    G.speedMul = s;
  }, SPEED);
  await g.tap(160, 180);
  await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.until(() => !!G.field && !!G.state && G.st.slot === 1, null, 'the game');
  await g.ev(() => { if (G.demo && G.demo.skip) G.demo.skip(); });
  return { ctx, g };
}
const cardsIn = raw => { const w = JSON.parse(raw).words || {}; return Object.keys(w).filter(id => w[id] && (w[id].st == null || w[id].st >= 1)).length; };
const cardsNow = g => g.ev(() => G.words.list(1).length);
// where a save should open: its step when the script is at the revision it began on, else the script's table for that
// revision, or the first beat
const expected = (g, fx) => g.ev(([ch, step, have]) => {
  const sc = G.chapters.scriptOf(ch), rev = G.chapters.revOf(ch), T = (sc.o.steps || {})[have];
  let to = 0, restart = false;
  if (rev === have) to = step;                                           // (a script that did not change since)
  else if (Array.isArray(T) && step >= T.length) to = sc.beats.length;   // (past the old script's end: past this one's)
  else if (Array.isArray(T) && Number.isInteger(T[step])) to = T[step];  // (its table)
  else restart = true;                                                   // (no clean place: its first beat)
  return { step: to, rev, restart, has: G.state.ch.step[ch] | 0, hasRev: G.state.ch.rev ? G.state.ch.rev[ch] : undefined, active: G.chapters.active(ch) };
}, [fx.ch, fx.step, fx.rev]);
const leftovers = g => g.ev(() => (G.state.bag.items || []).filter(it => it.q && G.chapters.def(it.q) && G.chapters.done(it.q)).map(it => it.id + ':' + it.q));
// the chapter after `ch` in its line may open (a new morning, the evening come, room for it), or has begun by itself; or
// the line is done
const nextOpens = (g, ch) => g.ev(ch => {
  const CH = G.chapters, line = CH.lineOf(ch), L = CH.ids().filter(id => CH.lineOf(id) === line), nx = L[L.indexOf(ch) + 1];
  if (!nx || !CH.written(nx)) return { ok: CH.current(line) == null, nx: null };
  if (CH.active(nx) || CH.done(nx)) return { ok: true, nx, begun: true }; // (it began by itself: chapter 2 as she steps out of the house)
  const was = window.__openPacing, sess = G.state.ch.lastDoneSess;
  window.__openPacing = true; G.state.ch.lastDoneSess = null;
  const gate = CH.gate(nx, { evening: true }), next = CH.next(line);
  window.__openPacing = was; G.state.ch.lastDoneSess = sess;
  return { ok: next === nx && gate == null, nx, gate, next };
}, ch);
// play the save's chapter to its end by the arrow; -> what happened (the fewest word cards seen on the way)
async function playOut(g, ch, o = {}) {
  let low = await cardsNow(g);
  const line = await g.ev(ch => G.chapters.lineOf(ch), ch);
  const r = await followArrow(g, flow, Object.assign({ line, until: ch, minutes: 12, each: async () => { low = Math.min(low, await cardsNow(g)); }, log: s => { if (process.env.DBG) console.log('      ' + s); } }, o));
  low = Math.min(low, await cardsNow(g));
  return { done: r.done.includes(ch), low, stopped: r.stopped };
}
const clean = g => g.ev(() => G.errlog.list().map(e => e.where + ': ' + e.msg));

// ---------- the scripts: revisions and tables ----------
async function scripts(browser) {
  const { ctx, g } = await open(browser, 'resplit-scripts', true);
  try {
    const shapes = await g.ev(chapterShapes);
    const now = await g.ev(shapes => { const o = {}; for (const id of Object.keys(shapes)) { const sc = G.chapters.scriptOf(id); o[id] = { rev: G.chapters.revOf(id), n: sc.beats.length, steps: sc.o.steps || null, beats: shapes[id] }; } return o; }, shapes);
    for (const S of SETS) {
      // a chapter whose beats are not that release's (another count, another trigger) carries a revision
      if (S.shapes) {
        const diff = Object.keys(now).filter(id => S.shapes[id] && JSON.stringify(S.shapes[id]) !== JSON.stringify(now[id].beats));
        check('scripts: the ' + diff.length + ' chapters whose beats are not the ' + S.tag + ' release\'s carry a revision (' + diff.join(' ') + ')', diff.every(id => now[id].rev >= 2), diff.filter(id => now[id].rev < 2).join(' '));
      }
      // a table for a revision is as long as the script that release had (for the revisions its saves began on), and
      // every place in it is a beat (or null: begin again)
      const bad = [];
      for (const id of Object.keys(now)) {
        const revs = new Set(S.saves.filter(s => s.ch === id).map(s => s.rev));
        for (const have of revs) {
          const T = now[id].steps && now[id].steps[have]; if (!T) continue;
          if (S.beats[id] != null && T.length !== S.beats[id]) bad.push(id + ': its table for revision ' + have + ' has ' + T.length + ' steps, that script had ' + S.beats[id]);
          T.forEach((to, k) => { if (to !== null && !(Number.isInteger(to) && to >= 0 && to < now[id].n)) bad.push(id + ': old step ' + k + ' -> ' + to + ' is not a beat'); if (k && Number.isInteger(to) && Number.isInteger(T[k - 1]) && to < T[k - 1]) bad.push(id + ': old step ' + k + ' goes back'); });
        }
        if (now[id].steps && now[id].rev < 2) bad.push(id + ': a table but no revision');
      }
      check('scripts: each step table is as long as the ' + S.tag + ' release\'s script and points at real beats', !bad.length, bad.join('; '));
    }
    // the beats as they are now, beside the ones written down for each chapter's revision (tools/fixtures/chapter-shapes.json):
    // a chapter whose beats were added, taken out or given another trigger without a new revision is caught here
    if (process.env.RECORD === '1') {
      const out = {}; for (const id of Object.keys(now)) out[id] = { rev: now[id].rev, beats: now[id].beats };
      fs.writeFileSync(SHAPES, JSON.stringify(out, null, 1) + '\n'); console.log('  (written: ' + SHAPES + ')');
    }
    const was = fs.existsSync(SHAPES) ? JSON.parse(fs.readFileSync(SHAPES, 'utf8')) : {}, changed = [];
    for (const id of Object.keys(now)) {
      const w = was[id]; if (!w) { changed.push(id + ' (a new chapter: RECORD=1 writes it down)'); continue; }
      const same = JSON.stringify(w.beats) === JSON.stringify(now[id].beats);
      if (!same && w.rev === now[id].rev) changed.push(id + ' (its beats changed and its revision is still ' + w.rev + ': give it rev ' + (w.rev + 1) + ' and a step table or a restart, docs/CONTENT.md; then RECORD=1)');
      else if (!same || w.rev !== now[id].rev) changed.push(id + ' (revision ' + now[id].rev + ' is not written down yet: RECORD=1 node tools/test-resplit.js, once its table is right)');
    }
    check('scripts: no chapter\'s beats changed without a new revision (' + Object.keys(now).length + ' scripts)', !changed.length, changed.join('; '));
    check('scripts: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- rule 1: a step past the end of a script ----------
// (made up from a real save: the step set past the end, with and without the script's revision; with the dog's warm-up
// on; and for a chapter of another place than the one she stands in)
const byId = id => { for (const S of SETS) { const s = S.saves.find(s => s.id === id); if (s) return s; } return null; }; // (from the newest release that has it)
async function pastEnd(browser, label, id, edit, o = {}) {
  const fx = byId(id); if (!fx) { console.log('  (no save ' + id + ' in the fixtures: skipped)'); return; }
  const s = JSON.parse(fx.raw); edit(s);
  const ch = o.ch || fx.ch, hearts0 = (s.hearts || {});
  const { ctx, g } = await load(browser, 'resplit-past', JSON.stringify(s), o.open);
  try {
    const giver = await g.ev(ch => G.chapters.def(ch).giver, ch);
    const cards0 = cardsIn(fx.raw);
    // (nobody taps the map: whatever comes up by itself is played, the dog's warm-up too when it is on, until it has ended)
    for (let i = 0; i < 8 && !(await g.ev(ch => G.chapters.done(ch), ch)); i++) { await flow.settle(g, label + ': the first free moments'); await g.frames(30); }
    await flow.settle(g, label + ': the ending');
    check(label + ': a chapter going on past its script\'s end ends by itself at the first free moment (its badge shown)', await g.ev(ch => G.chapters.done(ch) && window.__badges.includes(ch) && G.state.ch.doneSess[ch] != null, ch));
    const h = await g.ev(who => [(G.state.hearts || {})[who] | 0, G.hearts.MAX], giver);
    check(label + ': its giver\'s two hearts, as at a chapter\'s end (' + (hearts0[giver] | 0) + ' -> ' + h[0] + ')', h[0] === Math.min(h[1], (hearts0[giver] | 0) + 2));
    const nx = await nextOpens(g, ch);
    check(label + ': the next chapter of its line can open (' + nx.nx + ')', nx.ok, JSON.stringify(nx));
    check(label + ': nothing of it is left in the bag', !(await leftovers(g)).length, (await leftovers(g)).join(' '));
    check(label + ': the save written after it says done', await g.ev(ch => { G.st.saveNow(); return JSON.parse(localStorage.getItem('spanishclub_slot1')).quests[ch] === 'done'; }, ch));
    if (o.on) { // the story goes on: the next chapter by the arrow, until it is on its second beat
      const r = await followArrow(g, flow, { line: 'villa', until: nx.nx, minutes: 8, stop: id => G.chapters.active(id) && (G.state.ch.step[id] | 0) >= 1 && !G.chapters.running(), stopArg: nx.nx, log: s => { if (process.env.DBG) console.log('      ' + s); } });
      check(label + ': the arrow leads on into the next chapter (' + nx.nx + ' begun, on its second beat)', r.stopped || r.done.includes(nx.nx));
    }
    check(label + ': the word cards did not go down (' + cards0 + ' -> ' + await cardsNow(g) + ')', await cardsNow(g) >= cards0);
    check(label + ': no console error, nothing in the Problem log', !g.errors.length && !(await clean(g)).length, g.errors.concat(await clean(g)).join('\n'));
  } finally { await ctx.close(); }
}

// ---------- a chapter begun again ----------
async function restarted(browser, label, id, edit, look) {
  const fx = byId(id); if (!fx) { console.log('  (no save ' + id + ' in the fixtures: skipped)'); return; }
  const s = JSON.parse(fx.raw); if (edit) edit(s);
  const had = (s.bag.items || []).filter(it => it.q === fx.ch).map(it => it.id);
  const { ctx, g } = await load(browser, 'resplit-again', JSON.stringify(s));
  try {
    const st = await g.ev(ch => ({ step: G.state.ch.step[ch], data: JSON.stringify(G.state.ch.data[ch] || {}), rev: G.state.ch.rev[ch], want: G.chapters.revOf(ch), active: G.chapters.active(ch),
      bag: (G.state.bag.items || []).filter(it => it.q === ch).map(it => it.id), finds: Object.keys(G.state.finds || {}).filter(k => !G.state.finds[k].found && G.chapters.def(ch).words.includes(k)) }), fx.ch);
    check(label + ': the chapter begins again: its first beat, its own data empty, the script\'s revision remembered', st.active && st.step === 0 && st.data === '{}' && st.rev === st.want, JSON.stringify(st));
    check(label + ': its things are out of the bag (she had: ' + (had.join(' ') || 'nothing') + ') and no find-it puzzle of its words is left going', !st.bag.length && !st.finds.length, JSON.stringify(st));
    if (look) await look(g);
    const cards0 = cardsIn(fx.raw), r = await playOut(g, fx.ch);
    check(label + ': played again to its end by the arrow: done', r.done);
    const nx = await nextOpens(g, fx.ch);
    check(label + ': the next chapter of its line can open (' + nx.nx + ')', nx.ok, JSON.stringify(nx));
    check(label + ': the bag holds nothing of a finished chapter', !(await leftovers(g)).length, (await leftovers(g)).join(' '));
    check(label + ': the word cards never went down (' + cards0 + ' in the save, never under ' + r.low + ')', r.low >= cards0);
    check(label + ': no console error, nothing in the Problem log', !g.errors.length && !(await clean(g)).length, g.errors.concat(await clean(g)).join('\n'));
  } finally { await ctx.close(); }
}

// ---------- every save ----------
const T0 = Date.now();
async function one(browser, fx, k) {
  const label = pre(fx), t1 = Date.now();
  if (k % 5 === 0) console.log('  (' + Math.round((Date.now() - T0) / 60000) + ' minutes so far)');
  const { ctx, g } = await load(browser, 'resplit-' + fx.id.replace(/\W/g, '_'), fx.raw);
  try {
    const e = await expected(g, fx), cards0 = cardsIn(fx.raw);
    check(label + ': opens on ' + (e.restart ? 'its first beat (begun again)' : 'step ' + e.step) + ' (that release\'s step ' + fx.step + '), revision ' + e.rev, e.active && e.has === e.step && (e.rev === 1 ? e.hasRev == null || e.hasRev === 1 : e.hasRev === e.rev), JSON.stringify(e));
    const others = await g.ev(ch => G.chapters.ids().filter(id => id !== ch && G.chapters.active(id)).map(id => ({ id, step: G.state.ch.step[id] | 0, n: G.chapters.scriptOf(id).beats.length, rev: (G.state.ch.rev || {})[id] || 1, want: G.chapters.revOf(id) })), fx.ch);
    if (others.length) check(label + ': the other chapter going on (' + others.map(o => o.id + ' step ' + o.step).join(', ') + ') is on a beat of its script too, at its revision', others.every(o => o.step < o.n && o.rev === o.want), JSON.stringify(others));
    const r = await playOut(g, fx.ch);
    check(label + ': played to its end by the arrow: the chapter is done', r.done);
    const nx = await nextOpens(g, fx.ch);
    check(label + ': the next chapter of its line can open (' + (nx.nx || 'none: the line is done') + ')', nx.ok, JSON.stringify(nx));
    const left = await leftovers(g);
    check(label + ': the bag holds nothing of a finished chapter', !left.length, left.join(' '));
    check(label + ': the word cards never went down (' + cards0 + ' in the save, never under ' + r.low + ', ' + await cardsNow(g) + ' now)', r.low >= cards0);
    const errs = g.errors.concat(await clean(g));
    check(label + ': no console error, nothing new in the Problem log (' + Math.round((Date.now() - t1) / 1000) + ' s)', !errs.length, errs.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- which saves ----------
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), KIND = process.env.KIND || '', PICK = process.env.PICK || '';
const REVS = fs.existsSync(SHAPES) ? JSON.parse(fs.readFileSync(SHAPES, 'utf8')) : {}; // (each script's revision, as written down)
let list = [];
for (const S of SETS) {
  const three = s => s.kind === 'step' && (s.step === 0 || s.step === S.beats[s.ch] - 1 || s.step === (S.beats[s.ch] >> 1));
  const moved = s => !!REVS[s.ch] && REVS[s.ch].rev !== s.rev; // (its script is at another revision now)
  const pick = PICK || S.pick || 'moved';
  const L = S.saves.filter(s => (!ONLY.length || ONLY.includes(s.ch)) && (!KIND || s.kind === KIND) && (pick === 'every' || three(s) || (pick !== 'ends' && moved(s))));
  console.log('Saves of the ' + S.tag + ' release (' + S.from + ', made ' + S.made + '): ' + L.length + ' of ' + S.saves.length + ' to play');
  list = list.concat(L);
}
if (process.env.FROM) { const k = list.findIndex(s => s.id === process.env.FROM || pre(s) === process.env.FROM); if (k >= 0) list = list.slice(k); }

const sections = [['the scripts: revisions and step tables', scripts]];
if (!process.env.SKIP_RULES) {
  sections.push(['a step past the end (made up: chapter 6, far past, the revision already this script\'s)', b => pastEnd(b, 'past the end', 'c6@7', s => { s.ch.step.c6 = 99; s.ch.rev = Object.assign({}, s.ch.rev, { c6: 2 }); }, { on: true, open: { openPacing: true } })]); // (pacing open: the next chapter does not wait for the day's reviews)
  sections.push(['a step past the end, the dog\'s warm-up on (the live game: both want the first free moment of the day)', b => pastEnd(b, 'past the end, warm-up on', 'c6@7', s => { s.ch.step.c6 = 7; s.ch.rev = Object.assign({}, s.ch.rev, { c6: 2 }); }, { open: { warmup: true } })]);
  sections.push(['a step past the end (made up: an older release\'s chapter 6, one past its last step)', b => pastEnd(b, 'past the old end', 'c6@7', s => { s.ch.step.c6 = 8; })]);
  sections.push(['a step past the end, for a chapter of another place (made up: chapter 6 while she is at the beach)', b => pastEnd(b, 'past the end, elsewhere', 'playa1@1', s => { s.ch.step.c6 = 50; }, { ch: 'c6' })]);
  sections.push(['a chapter begun again: chapter 4, the apple in her hands (a real save)', b => restarted(b, 'begun again (c4)', 'c4@3', null, async g => {
    const v = await g.ev(() => ({ pepe: !!G.chapters.alert('pepe'), rosa: G.chapters.beatFor('rosa'), crates: !!G.state.ch.data.c4.crates, apple: G.errands.bag.has('manzana', { q: 'c4' }) }));
    check('begun again (c4): Don Pepe has the chapter\'s bubble again, Rosa waits for nothing, no crates out yet, no apple held', v.pepe && !v.rosa && !v.crates && !v.apple, JSON.stringify(v));
  })]);
  sections.push(['a chapter begun again: chapter 7 forced (a revision this script has no table for), the dog lost, his bone in the bag, a find-it puzzle going on', b => restarted(b, 'begun again (c7)', 'c7@6', s => { s.ch.rev = Object.assign({}, s.ch.rev, { c7: 9 }); }, async g => {
    check('begun again (c7): the dog is not lost any more (he runs off again when the chapter is played)', await g.ev(() => !G.chapters.lost()));
  })]);
}
list.forEach((fx, k) => sections.push([(k + 1) + '/' + list.length + '  ' + pre(fx) + (fx.kind === 'mid' ? ' (the middle of a beat' + (fx.bag ? ', in the bag: ' + fx.bag : '') + ')' : ''), b => one(b, fx, k)]));
run('A chapter re-split: saves of older releases open and play on', sections);
