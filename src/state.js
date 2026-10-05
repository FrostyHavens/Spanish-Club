// ===== Game state: learned words, stars, errands, flags, save/load =====
'use strict';
(function () {
  const D = () => G.data;
  const S = G.st = {};
  const SAVE_KEY = 'spanishclub_save';

  S.newGame = function () {
    G.state = {
      flags: {}, searched: {}, playTime: 0,
      loc: { map: 'casa', x: 4, y: 4, dir: 'down' },
      // words: id -> {seen: times practiced, right: first-try correct answers, wrong}
      words: {},
      // quests: id -> 'active' | 'done'
      quests: {},
      stars: 0,
      opts: { english: false, voice: true },
    };
  };

  // ---------- Words ----------
  S.knows = id => !!G.state.words[id];
  S.learn = function (id) {
    if (G.state.words[id]) return false;
    G.state.words[id] = { seen: 0, right: 0, wrong: 0 };
    return true;
  };
  S.practiced = function (id, firstTry) {
    const w = G.state.words[id] || (G.state.words[id] = { seen: 0, right: 0, wrong: 0 });
    w.seen++;
    if (firstTry) { w.right++; G.state.stars++; } else w.wrong++;
  };
  // 0..3 stars per word, from first-try answers
  S.wordStars = id => { const w = G.state.words[id]; return w ? Math.min(3, w.right) : 0; };
  S.learnedIn = topic => Object.keys(D().words).filter(id => D().words[id].topic === topic && S.knows(id));
  S.learnedCount = () => Object.keys(G.state.words).length;

  // ---------- Errands ----------
  S.quest = id => G.state.quests[id];
  S.startQuest = id => { if (!G.state.quests[id]) G.state.quests[id] = 'active'; };
  S.finishQuest = id => { G.state.quests[id] = 'done'; };
  S.done = id => G.state.quests[id] === 'done';
  S.active = id => G.state.quests[id] === 'active';
  S.badges = () => ['saludos', 'mercado', 'pelota', 'carta'].filter(S.done);

  // ---------- Save / load ----------
  S.save = function () { G.state.savedAt = Date.now(); return G.store.set(SAVE_KEY, G.state); };
  S.load = function () {
    const s = G.store.get(SAVE_KEY); if (!s) return false;
    S.newGame(); const fresh = G.state;
    G.state = Object.assign(fresh, s, { opts: Object.assign(fresh.opts, s.opts || {}) });
    return true;
  };
  S.hasSave = () => !!G.store.get(SAVE_KEY);
})();
