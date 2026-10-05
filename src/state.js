// ===== Game state: what the player has seen and learned, errands, flags, save/load =====
'use strict';
(function () {
  const D = () => G.data;
  const S = G.st = {};
  const SAVE_KEY = 'spanishclub_save2';

  S.newGame = function () {
    G.state = {
      flags: {}, searched: {}, playTime: 0,
      loc: { map: 'casa', x: 4, y: 4, dir: 'down' },
      // words: id -> {learned, right: first-try correct answers, wrong}. Present = seen at least once.
      words: {},
      pages: {},          // notebook pages found: id -> true
      quests: {},         // id -> 'active' | 'done'
      stars: 0,
      opts: { english: false },
      look: null,         // the player's avatar, from the character creator
      name: null,         // the player's name, typed after the creator
    };
  };

  S.playerSpec = () => D().playerSpec(G.state && G.state.look);
  S.playerName = () => (G.state && G.state.name) || D().player.name;
  S.isGirl = () => !!(G.state && G.state.look && G.state.look.gender === 'nina');

  // ---------- Words: unseen -> seen (met in a sentence or on a page) -> learned (used correctly) ----------
  const rec = id => G.state.words[id] || (G.state.words[id] = { learned: false, right: 0, wrong: 0 });
  S.see = id => { if (D().words[id]) rec(id); };
  S.seen = id => !!G.state.words[id];
  S.knows = id => !!(G.state.words[id] && G.state.words[id].learned);
  S.learn = function (id) { const w = rec(id); if (w.learned) return false; w.learned = true; return true; };
  S.practiced = function (id, firstTry) {
    const w = rec(id);
    if (firstTry) { w.right++; G.state.stars++; } else w.wrong++;
  };
  // 0..3 stars per word, from first-try answers
  S.wordStars = id => { const w = G.state.words[id]; return w ? Math.min(3, w.right) : 0; };
  S.learnedCount = () => Object.keys(G.state.words).filter(S.knows).length;

  // ---------- Notebook pages ----------
  S.findPage = id => { const fresh = !G.state.pages[id]; G.state.pages[id] = true; (D().pages[id].words || []).forEach(S.see); return fresh; };
  S.hasPage = id => !!G.state.pages[id];

  // ---------- Errands ----------
  S.quest = id => G.state.quests[id];
  S.startQuest = id => { if (!G.state.quests[id]) G.state.quests[id] = 'active'; };
  S.finishQuest = id => { G.state.quests[id] = 'done'; };
  S.done = id => G.state.quests[id] === 'done';
  S.active = id => G.state.quests[id] === 'active';

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
