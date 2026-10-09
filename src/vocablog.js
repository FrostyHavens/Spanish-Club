// ===== Dev only: the vocabulary-flow log, for tools/vocab-audit.js =====
// Off unless a test sets G.vocabLog = [] in the page. Every hook in the game is guarded by `if (G.vocabLog)`, so with
// it off nothing is computed, nothing is stored and nothing is saved (the log lives on G, never in G.state).
// With it on, every time a vocabulary word reaches the child it pushes one event onto G.vocabLog:
//   { t: game seconds since the log started (frames / 60, plus any pacing a test adds with G.vlog.pace),
//     ty: 'shown'        in a dialogue line or a question prompt (via: dialogue / question / picture / bag / banner / pet-teach)
//         'heard'        spoken by the voice (G.speak: [id] tokens, or a line that is just a word: "el gato. ¡Miau!")
//         'seen-first'   G.st.see marks it seen for the first time
//         'page'         on a notebook page just found
//         'tapped-object' named by tap-anything, an animal (or its sound), or the animal count (via: tap / walk-on / animal / animal-sound / count)
//         'choice-shown' one of the cards or rows of a question (pic: drawn with its picture)
//         'recognized'   picked as the right answer by tap (receptive retrieval; cue flags below)
//         'wrong'        picked wrongly (ans: the right word)
//         'picked'       picked in a free choice with no right answer (a shop, Canelo's menu)
//         'said'         said out loud and matched (productive; via: the scene it was said in)
//         'learned'      G.st.learn flipped it to learned
//     w: word id, map, who (who is talking or asking, when known), ep (the episode: see below), g (a greeting) }
// Cue flags on 'recognized': pic (the answer card showed its picture), show (the question's picture IS the answer),
// prompt (the answer word is in the prompt text).
// Other entries (no w): { ty: 'quest', q, st: 'start' | 'done' }, { ty: 'mark', label } (G.vlog.mark, from tests), and
// { ty: 'ep', ep, ch } when an episode ends: an episode runs until the child is free to walk again (state.js
// fieldTick); ch is what changed in G.state meanwhile ({q: {id: status}, f: [flag keys], s: new searched spots,
// pg: [pages], pet, jobs, bag, h}), which tells the audit which errand the episode belonged to.
'use strict';
(function () {
  const V = G.vlog = function (ty, ids, o) {
    const L = G.vocabLog; if (!L) return;
    sync(L);
    const words = G.data && G.data.words;
    const base = { t: now(), ty, map: G.field ? G.field.mapId : null, ep: V.ep, who: (o && o.who) || whoNow() };
    if (V.greet) base.g = V.greet;
    if (o) for (const k in o) if (k !== 'who' && o[k] != null) base[k] = o[k];
    for (const w of Array.isArray(ids) ? ids : [ids]) if (w && words && words[w]) { L.push(Object.assign({ w }, base)); V.dirty = true; }
  };
  V.greet = null;
  let f0 = 0, extra = 0;
  const now = () => Math.round(((G.frame - f0) / 60 + extra) * 100) / 100;
  function sync(L) {
    if (V.L === L) return;
    V.L = L; f0 = G.frame; extra = 0; V.ep = 1; V.dirty = false; V.st = G.state; V.snap = snap();
  }
  function whoNow() {
    const s = G.top && G.top(); if (!s) return null;
    return (s.opts && s.opts.who) || (s.o && s.o.who) || null;
  }
  // an entry that isn't about one word
  V.ev = function (o) { const L = G.vocabLog; if (!L) return; sync(L); L.push(Object.assign({ t: now(), ep: V.ep, map: G.field ? G.field.mapId : null }, o)); };
  V.mark = (label, o) => V.ev(Object.assign({ ty: 'mark', label }, o || {}));
  // a test's model of a child's pace: sec more seconds pass (reading, listening, thinking); the day's clock moves too
  V.pace = function (sec) { const L = G.vocabLog; if (!L || !(sec > 0)) return; sync(L); extra += sec; G.sessionTime += sec; };
  V.time = () => (G.vocabLog ? (sync(G.vocabLog), now()) : 0);

  // ---------- what the voice said: [id] tokens, else a line that is only words ("el gato. ¡Miau!") ----------
  let forms = null;
  const norm = s => String(s).toLowerCase().replace(/[¡!¿?.,:;…«»"]/g, ' ').replace(/\s+/g, ' ').trim();
  function formMap() {
    if (forms) return forms;
    forms = {};
    const W = G.data.words;
    for (const id in W) {
      const w = W[id], all = [w.es, w.alt, w.pl].filter(Boolean).join(' / ').split(' / ');
      for (const f of all) { const n = norm(f); forms[n] = forms[n] || id; forms[n.replace(/^(el|la|los|las) /, '')] = forms[n.replace(/^(el|la|los|las) /, '')] || id; }
    }
    return forms;
  }
  V.heard = function (text) {
    if (!G.vocabLog || text == null) return;
    const s = G.fill(String(text)), ids = G.richIds(s);
    if (!ids.length) {
      const fm = formMap();
      for (const seg of G.plain(s).split(/[.!?¡¿,]+/)) {
        const n = norm(seg); if (!n) continue;
        if (fm[n]) ids.push(fm[n]);
        else { const r = n.split(' ').map(x => fm[x]); if (r.every(Boolean) && n.split(' ').length <= 3) r.forEach(id => { if (ids.indexOf(id) < 0) ids.push(id); }); } // "guau guau"
      }
    }
    if (ids.length) V('heard', ids);
  };

  // ---------- episodes: everything until the child can walk again ----------
  const J = v => JSON.stringify(v === undefined ? null : v);
  function snap() {
    const s = G.state; if (!s) return null;
    const f = {}; for (const k in s.flags || {}) f[k] = J(s.flags[k]);
    return { f, q: Object.assign({}, s.quests), pg: Object.keys(s.pages || {}), s: Object.keys(s.searched || {}).length,
      pet: J(s.pet && s.pet.tricks), jobs: J(s.jobs), bag: J(s.bag), h: J(s.hearts) };
  }
  function diff(a, b) {
    if (!a || !b) return null;
    const ch = {}; let any = false;
    const fk = Object.keys(b.f).filter(k => a.f[k] !== b.f[k]); if (fk.length) { ch.f = fk; any = true; }
    const q = {}; for (const k in b.q) if (a.q[k] !== b.q[k]) q[k] = b.q[k];
    if (Object.keys(q).length) { ch.q = q; any = true; }
    const pg = b.pg.filter(p => a.pg.indexOf(p) < 0); if (pg.length) { ch.pg = pg; any = true; }
    if (b.s > a.s) { ch.s = b.s - a.s; any = true; }
    for (const k of ['pet', 'jobs', 'bag', 'h']) if (a[k] !== b[k]) { ch[k] = 1; any = true; }
    return any ? ch : null;
  }
  // state.js S.fieldTick, every frame the map runs
  V.tick = function (f) {
    const L = G.vocabLog; if (!L) return;
    sync(L);
    if (V.st !== G.state) { V.st = G.state; V.snap = snap(); return; } // a new game, a loaded slot
    if (f.locked || G.top() !== f) return;
    const s = snap(), ch = diff(V.snap, s);
    if (V.dirty || ch) { L.push({ t: now(), ty: 'ep', ep: V.ep, map: f.mapId, ch: ch || {} }); V.ep++; V.dirty = false; }
    V.snap = s;
  };
})();
