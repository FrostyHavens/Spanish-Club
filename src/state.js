// ===== Game state: what the player has seen and learned, errands, flags; 3 save slots, always autosaved =====
'use strict';
(function () {
  const D = () => G.data;
  const S = G.st = {};
  const LEGACY_KEY = 'spanishclub_save2', MIGRATED_KEY = 'spanishclub_migrated';
  S.SLOTS = 3;
  S.slotKey = n => 'spanishclub_slot' + n;

  // A fresh game, not saved anywhere yet (see S.begin). English help and the chosen voice are grown-up choices
  // kept per device (G.prefs), copied into opts so G.enVisible / G.currentVoice keep reading G.state.opts.
  function fresh() {
    return {
      flags: {}, searched: {}, playTime: 0,
      loc: { map: 'casa', x: 4, y: 4, dir: 'down' },
      // words: id -> the word model's record (words.js: stage, Leitner box, due, counts). Older saves held
      // {learned, right, wrong, said} (present = seen); words.js migrates those when it first reads them.
      words: {},
      wm: { clock: 0, sess: 0, day: 0, date: '' }, // words.js: play-time clock, session and day counters
      finds: {},          // intro.js: find-it puzzles going on: word id -> {who, map, at, wrong, found}
      pages: {},          // notebook page puzzles solved (intro.js): id -> {d: the day it was solved} (older saves: true)
      quests: {},         // id -> 'active' | 'done'
      stars: 0,
      opts: { english: false },
      look: null,         // the player's avatar, from the character creator
      name: null,         // the player's name, typed after the creator
      album: {},          // Round B (animals.js): animal id -> {first: ms, map, n: times tapped, said: name said out loud}
      sayback: {},        // Round B (world.js): word id -> 'YYYY-M-D' it last earned a say-it-back star (one a day)
      pet: { tricks: {}, learning: null, sleep: false }, // Round B (pet.js): Canelo's tricks (good tries 0..3), the one he's learning
      hearts: {},         // Round B (hearts.js): npc -> 0..5
      heartlog: {},       // Round B (hearts.js): today's hearts {d: 'YYYY-M-D', n, all, why}
      friends: {},        // Round B (hearts.js): npc -> {m3: secret + sticker given, m5: best-friend photo}
      bag: { items: [] }, // Round B (errands.js): what you carry: [{id: word id, col: colour word id (flowers), q: errand it belongs to, to: where (letters)}]
      jobs: {},           // Round B (errands.js): side job id -> 'YYYY-M-D' it was last done (once a day each)
    };
  }
  function devicePrefs(s) {
    const p = G.prefs || {};
    if (p.english != null) s.opts.english = !!p.english;
    if (p.voiceName) s.opts.voiceName = p.voiceName;
    return s;
  }
  S.newGame = function () { S.slot = null; bound = null; G.state = devicePrefs(fresh()); };

  S.playerSpec = () => D().playerSpec(G.state && G.state.look);
  S.playerName = () => (G.state && G.state.name) || D().player.name;
  S.isGirl = () => !!(G.state && G.state.look && G.state.look.gender === 'nina');

  // ---------- Words: the older helpers, now thin wrappers over the word model (words.js) ----------
  // seen = met (stage 1+), knows = gold (stage 3+, "remembered"), learned count = known (stage 2+). Appearing in a
  // sentence, on a card or in the bag no longer makes a word seen: see() only counts a meeting of a word already met.
  const WM = () => G.words;
  S.see = id => WM().encounter(id, 'seen');
  S.seen = id => WM().met(id);
  S.knows = id => WM().stage(id) >= 3;
  S.stage = id => WM().stage(id);
  // (tests and tools) make a word gold at once; true if it wasn't
  S.learn = function (id) { const r = WM().rec(id, true); if (!r || r.st >= 3) return false; if (r.st < 1) WM().meet(id, 'learn'); r.st = 3; r.learned = true; r.s3 = WM().day(); S.autosave(); if (G.vocabLog) G.vlog('learned', id); return true; };
  S.practiced = (id, firstTry) => (firstTry ? WM().answerRight(id, { firstTry: true }) : WM().answerWrong(id));
  // said out loud with the mic (mic.js): a bonus star, counted in stars; S.micStars() is the speaking stars so far
  S.said = function (id) { const w = WM().rec(id, true); if (!w) return; w.said = (w.said | 0) + 1; WM().encounter(id); G.state.stars++; S.autosave(); if (G.vocabLog) G.vlog('said', id, { via: G.top() && G.top().constructor.name }); };
  S.saidCount = id => (G.state.words[id] && G.state.words[id].said) | 0;
  S.micStars = (s = G.state) => Object.keys(s.words).reduce((n, id) => n + ((s.words[id] && s.words[id].said) | 0), 0);
  // 0..3 stars per word: its stage (known 1, remembered 2, solid 3)
  S.wordStars = id => WM().stars(id);
  S.learnedCount = () => WM().count(2);

  // ---------- Notebook page puzzles (intro.js) ----------
  S.solvePage = id => { G.state.pages[id] = { d: WM().day() }; S.autosave(); };
  S.hasPage = id => !!G.state.pages[id]; // its puzzle was solved (a page is no longer handed out)
  S.findPage = S.solvePage; // (the old name)

  // ---------- Errands ----------
  S.quest = id => G.state.quests[id];
  S.startQuest = id => { if (!G.state.quests[id]) { G.state.quests[id] = 'active'; S.autosave(); if (G.vocabLog) G.vlog.ev({ ty: 'quest', q: id, st: 'start' }); } };
  S.finishQuest = id => { G.state.quests[id] = 'done'; S.autosave(); if (G.vocabLog) G.vlog.ev({ ty: 'quest', q: id, st: 'done' }); };
  S.done = id => G.state.quests[id] === 'done';
  S.active = id => G.state.quests[id] === 'active';

  // ---------- Save slots ----------
  // Three slots (localStorage spanishclub_slot1..3), each holding one whole game as a single JSON value, so a
  // write either lands completely or not at all. Only the state object that belongs to the slot being played
  // (`bound`: loaded from it, or a new game once its character and name are chosen) is ever written, so the
  // title screen's throwaway state, or a test's G.st.newGame(), can never overwrite a save. Nothing here throws.
  S.slot = null;   // the slot being played (1..3), null on the title screen
  let bound = null, timer = 0;
  const has = k => { try { return localStorage.getItem(k) != null; } catch (e) { return false; } };
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const valid = s => isObj(s) && (isObj(s.words) || isObj(s.flags) || isObj(s.loc));
  // a stored game, read over a fresh one (older saves get any newer fields), or null when empty / unreadable
  S.read = function (n) {
    try {
      const s = G.store.get(S.slotKey(n)); if (!valid(s)) return null;
      const f = fresh();
      for (const k in f) if (f[k] !== null && (s[k] == null || typeof s[k] !== typeof f[k] || Array.isArray(s[k]))) s[k] = f[k];
      if (!isObj(s.look)) s.look = null;
      if (typeof s.name !== 'string' || !s.name) s.name = null;
      s.opts = Object.assign(f.opts, s.opts);
      const l = s.loc, m = G.maps && G.maps[l.map];
      if (!m || !Number.isInteger(l.x) || !Number.isInteger(l.y) || l.y < 0 || l.x < 0 || l.y >= m.rows.length || l.x >= m.rows[l.y].length) s.loc = f.loc;
      if (!G.DIRS[s.loc.dir]) s.loc.dir = 'down';
      return s;
    } catch (e) { return null; }
  };
  // what the slot screen shows: null for an empty slot
  S.summary = function (n) {
    const s = S.read(n); if (!s) return null;
    return { slot: n, name: s.name || D().player.name, look: s.look, stars: s.stars | 0, savedAt: s.savedAt || 0,
      words: Object.keys(s.words).filter(id => { const r = s.words[id]; return r && (r.st == null || r.st >= 1); }).length }; // words in the notebook (met; an older save's seen words count)
  };
  S.anySave = () => [1, 2, 3].some(n => S.read(n));
  S.hasSave = S.anySave; S.save = () => S.saveNow(); // the old names (there is no manual saving any more)
  // continue the game in slot n (sets G.state); false if it's empty
  S.loadSlot = function (n) {
    const s = S.read(n); if (!s) return false;
    clearTimeout(timer); timer = 0;
    G.state = devicePrefs(s); S.slot = n; bound = s;
    if (G.words) G.words.newSession('load'); // a new session (and a new day on a new date)
    return true;
  };
  // a new game (G.state, after the creator) takes slot n from now on, saved right away
  S.begin = function (n) { S.slot = n; bound = G.state; if (G.words && !G.state.wm.sess) G.words.newSession('new'); return S.saveNow(); };
  // leaving the game (back to the title): save, then stop saving
  S.close = function () { S.saveNow(); S.slot = null; bound = null; };
  S.erase = function (n) { G.store.del(S.slotKey(n)); if (S.slot === n) { S.slot = null; bound = null; } };
  // Once per device: the save from before slots existed is copied into slot 1 if that's empty. The legacy key
  // stays; a marker stops it coming back after slot 1 is deleted.
  S.migrate = function () {
    try {
      if (has(MIGRATED_KEY)) return;
      const old = G.store.get(LEGACY_KEY);
      if (valid(old) && !has(S.slotKey(1)) && !G.store.set(S.slotKey(1), old)) return; // try again next time
      G.store.set(MIGRATED_KEY, 1);
    } catch (e) { }
  };

  // ---------- Autosave ----------
  // Where to continue: the player's spot right now when they're free to walk there (not mid-step, in a door,
  // on an event or where someone stands at first); otherwise where they last were, or came in.
  function snapLoc() {
    const f = G.field; if (!f || !f.player || G.top() !== f || f.locked) return;
    const p = f.player;
    if (p.moving || f.exitAt(p.x, p.y) || (f.def.events || []).some(e => e.x === p.x && e.y === p.y) || f.npcs.some(n => n.home && n.home[0] === p.x && n.home[1] === p.y)) return;
    G.state.loc = { map: f.mapId, x: p.x, y: p.y, dir: p.dir };
  }
  // Save the game being played now. Returns true when it was written.
  S.saveNow = function () {
    clearTimeout(timer); timer = 0;
    try {
      if (!S.slot || !G.state || G.state !== bound) return false;
      snapLoc();
      G.state.savedAt = Date.now();
      return G.store.set(S.slotKey(S.slot), G.state);
    } catch (e) { return false; }
  };
  // Save soon (within ~0.6 s; many calls in a row make one write). Call it after changing G.state.
  S.autosave = function () { if (!timer && S.slot && G.state === bound) timer = setTimeout(S.saveNow, 600); };
  // The field calls this every frame: save on entering a map, whenever it unlocks again (an interaction,
  // event or menu just ended) and every ~15 s of walking around.
  let lastField = null, wasLocked = false, fieldT = 0;
  S.fieldTick = function (f) {
    try {
      if (G.vocabLog) G.vlog.tick(f);
      if (f !== lastField) { lastField = f; wasLocked = f.locked; fieldT = 0; S.autosave(); return; }
      if (wasLocked && !f.locked) S.autosave();
      wasLocked = f.locked;
      if (++fieldT >= 900) { fieldT = 0; S.autosave(); }
    } catch (e) { }
  };
  // the tab is hidden or closed (an iPad going to sleep, the home button): save at once
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') S.saveNow(); });
  window.addEventListener('pagehide', () => S.saveNow());
})();
