// Shared by the En casa tests (tools/test-hogar1.js, test-hogar2.js, test-hogar-all.js): a game closed and opened again at
// ANY point of a beat. The page keeps a copy of the whole game (what a save holds) at every autosave a home beat makes and
// whenever what a beat has saved, held or changed is not what it was a moment ago (a heart, a word met, a thing put on the
// table...), so a save can be "taken" at each of those points; branches(g, id, k) then opens each copy as if the game had
// been closed there, follows the guide's arrow with taps until the chapter's beat k is over (or the whole chapter is done)
// and checks nothing is stuck. The main game goes on afterwards from where it was.
'use strict';
const { check } = require('./harness');
const { settle } = require('./playflow');

// page-side: start taking copies (once per page)
const SNAP = () => {
  if (window.__snapOn) return;
  window.__snapOn = true; window.__snaps = []; window.__snapSig = '';
  const take = why => {
    try {
      if (window.__snapOff || !G.state || !G.chapters.running) return;
      const r = G.chapters.running(); if (!r || !/^hogar/.test(r.id)) return;
      const s = G.state, c = s.ch || {};
      const sig = [r.id, r.k, JSON.stringify((c.data || {})[r.id]), JSON.stringify(G.errands.bag.list().map(i => i.id + ':' + (i.q || ''))), JSON.stringify(s.hearts || ''), Object.keys(s.words).filter(w => s.words[w] && s.words[w].st >= 1).length, JSON.stringify(s.quests)].join('|');
      if (sig === window.__snapSig) return;
      window.__snapSig = sig;
      window.__snaps.push({ id: r.id, k: r.k, why, json: JSON.stringify(s) });
    } catch (e) { /* a copy that could not be made is just not tested */ }
  };
  const a = G.st.autosave; G.st.autosave = function () { take('autosave'); return a.apply(this, arguments); };
  setInterval(() => take('sample'), 40);
};
const install = g => g.ev(`(${SNAP})()`);

// the arrow, followed by taps alone, until done(arg) is true in the page
async function follow(g, done, what, arg, max = 200) {
  for (let i = 0; i < max; i++) {
    await settle(g, what);
    if (await g.ev(done, arg)) return;
    const a = await g.ev(() => { const a = G.guide.at; return a && !a.hidden && !a.choice ? { x: a.edge ? a.x : a.tx, y: a.edge ? a.y : a.ty } : null; });
    if (!a) { await g.frames(20); continue; }
    await g.tap(a.x, a.y);
    await g.until(() => G.top() !== G.field || G.field.locked || G.fade.a > 0 || (!G.field.route && !G.field.player.moving), null, 'the walk', 30000);
    await g.frames(2);
  }
  throw new Error('the arrow never led to: ' + what + ' ' + JSON.stringify(await g.ev(() => ({ map: G.field.mapId, why: G.guide.at && G.guide.at.why, goal: (G.guide.goal(G.field) || {}).why, step: G.chapters.state().step, running: !!G.chapters.running() }))));
}

// close the game at the title and open it from the copy `json` (a string) in slot 1
async function openFrom(g, json, id) {
  await g.ev(() => { window.__snapOff = true; G.toTitle(); });
  await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
  await g.ev(j => { G.store.set(G.st.slotKey(1), JSON.parse(j)); }, json);
  await g.ev(() => { G.continueGame(1); });
  await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
  // (read before anything plays: a beat that starts by itself, like the first of a chapter, ends in the settle below)
  const s0 = id ? await g.ev(id => ({ active: G.chapters.active(id), done: G.chapters.done(id), step: G.chapters.state().step[id] | 0, map: G.field.mapId }), id) : null;
  await settle(g, 'back in the game');
  await g.ev(() => { window.__snapOff = false; });
  return s0;
}

// every copy taken in beat k of chapter id (at most `max`: the first, the last and some in between), then the game
// opened from each; each must go on (the arrow leads, the beat ends); the last one goes on to the chapter's end.
// keep: page variables (arrays) the main test reads, put back afterwards
async function branches(g, id, k, o = {}) {
  const keep = o.keep || ['__order', '__met'];
  const all = await g.ev(([id, k]) => window.__snaps.map((s, i) => ({ i, id: s.id, k: s.k })).filter(s => s.id === id && s.k === k).map(s => s.i), [id, k]);
  if (!all.length) return { n: 0, of: 0 };
  const max = o.max || 5, pick = all.length <= max ? all : [...new Set(Array.from({ length: max }, (_, j) => all[Math.round(j * (all.length - 1) / (max - 1))]))];
  await g.ev(() => { G.st.saveNow(); });
  const main = await g.ev(keep => { window.__snapOff = true; const m = { json: JSON.stringify(G.state), keep: {} }; for (const v of keep) m.keep[v] = window[v] ? window[v].slice() : null; return m; }, keep);
  const errs0 = g.errors.length;
  try {
    for (let n = 0; n < pick.length; n++) {
      const i = pick[n], last = n === pick.length - 1;
      const json = await g.ev(i => window.__snaps[i].json, i);
      const s0 = await openFrom(g, json, id);
      const label = id + ' beat ' + k + ' copy ' + (n + 1) + '/' + pick.length + ' (' + all.length + ' taken; ' + (await g.ev(i => window.__snaps[i].why, i)) + ')';
      // (a copy taken in the very last moment of a chapter's last beat may already hold it as done: nothing left to play)
      check('opened in the middle of ' + label + ': the chapter is still going on, on beat ' + s0.step + (s0.done ? ' (or already done)' : ''), s0.done || (s0.active && s0.step === k), JSON.stringify(s0));
      await follow(g, ([id, k]) => G.chapters.done(id) || (G.chapters.state().step[id] | 0) > k, label, [id, k]);
      if (last && o.finish !== false) {
        await follow(g, id => G.chapters.done(id), 'the end of ' + id + ' from ' + label, id, 400);
        check('...and that one finished ' + id + ': nothing of the chapter in the bag', await g.ev(() => !G.errands.bag.list().some(i => i.q)));
      }
    }
    check(id + ' beat ' + k + ': each of ' + pick.length + ' copies taken inside it went on (no console errors)', g.errors.length === errs0, g.errors.slice(errs0).join('\n'));
  } finally {
    await openFrom(g, main.json);
    await g.ev(m => { for (const v in m) if (m[v]) window[v] = m[v]; }, main.keep);
  }
  return { n: pick.length, of: all.length };
}

module.exports = { install, follow, openFrom, branches };
