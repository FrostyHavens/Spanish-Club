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
      ch: {},             // the story's chapters (chapters.js): the beat each one is on, their own data, when they began
      world: {},          // the open world (zones.js): zones visited, the one asked for on the map, the dog's spots done
      dogName: null,      // the dog's name, chosen by the child in the opener (G.dogName(): "Canelo" until then)
      hist: {},           // the learning history (history.js): per day the minutes played, words met, every retrieval
                          // (compact, no audio, the last 60 days); the parent checks; the dog's warm-up (warmup.js)
      phrases: {},        // the phrases (phrases.js, words.js): r {id: the word model's record}, intro {id: {d, at}},
                          // named {npc: day}, fav (her favourite animal, for Lola), likes {npc: {w, d}}, last (play s)
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
  // said out loud with the mic (mic.js): its card grows the most (cards.js); still counted in stars (for the diploma); S.micStars() is the speaking stars so far
  // The learning history records it (history.js): o.cued = said right after hearing it (an echo: the gold card's mic);
  // a question's answer that follows (words.js answerRight, said) makes it that answer's event instead of a second one.
  S.said = function (id, o) { const w = WM().rec(id, true); if (!w) return; if (G.hist && w.st >= 1) G.hist.event(id, o && o.cued ? 'E' : 'S', { said: true }); w.said = (w.said | 0) + 1; WM().encounter(id); G.state.stars++; if (G.cards) G.cards.grow(id, 'say'); S.autosave(); if (G.vocabLog) G.vlog('said', id, { via: G.top() && G.top().constructor.name }); };
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
  let bound = null, timer = 0, badSlot = null;
  const has = k => { try { return localStorage.getItem(k) != null; } catch (e) { return false; } };
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const valid = s => isObj(s) && (isObj(s.words) || isObj(s.flags) || isObj(s.loc));
  // a stored game, read over a fresh one (older saves get any newer fields), or null when empty / unreadable
  S.read = n => S.parse(G.store.get(S.slotKey(n)));
  // the same for a game object (a slot's, or one in a backup: backup.js); it is changed in place; null when not a game
  S.parse = function (s) {
    try {
      if (!valid(s)) return null;
      const f = fresh();
      for (const k in f) if (f[k] !== null && (s[k] == null || typeof s[k] !== typeof f[k] || Array.isArray(s[k]))) s[k] = f[k];
      if (!isObj(s.look)) s.look = null;
      if (typeof s.name !== 'string' || !s.name) s.name = null;
      if (typeof s.dogName !== 'string' || !s.dogName) s.dogName = null;
      s.opts = Object.assign(f.opts, s.opts);
      const l = s.loc, m = G.maps && G.maps[l.map];
      if (!m || !Number.isInteger(l.x) || !Number.isInteger(l.y) || l.y < 0 || l.x < 0 || l.y >= m.rows.length || l.x >= m.rows[l.y].length) s.loc = f.loc;
      if (!G.DIRS[s.loc.dir]) s.loc.dir = 'down';
      return s;
    } catch (e) { return null; }
  };
  // what the slot screen shows: null for an empty slot
  S.summary = n => S.summaryOf(S.read(n), n);
  S.summaryOf = function (s, n) { // (s: a parsed game, S.parse)
    if (!s) return null;
    return { slot: n, name: s.name || D().player.name, look: s.look, stars: s.stars | 0, savedAt: s.savedAt || 0,
      words: Object.keys(s.words).filter(id => { const r = s.words[id]; return r && (r.st == null || r.st >= 1); }).length }; // words in the notebook (met; an older save's seen words count)
  };
  S.anySave = () => [1, 2, 3].some(n => S.read(n));
  S.hasSave = S.anySave; S.save = () => S.saveNow(); // the old names (there is no manual saving any more)
  // continue the game in slot n (sets G.state); false if it's empty
  S.loadSlot = function (n) {
    const s = S.read(n); if (!s) return false;
    clearTimeout(timer); timer = 0;
    G.state = devicePrefs(s); S.slot = n; bound = s; badSlot = null;
    Object.assign(status, { at: s.savedAt || 0, fails: 0, why: null });
    if (G.chapters) G.chapters.migrate(); // a game from before the chapters: its errands map onto them (chapters.js)
    if (G.words) G.words.newSession('load'); // a new session (and a new day on a new date)
    return true;
  };
  // a new game (G.state, after the creator) takes slot n from now on, saved right away. A slot that holds something
  // unreadable (shown as empty: L8) is copied to spanishclub_slotN_bad first (see keepBad).
  S.begin = function (n) {
    S.slot = n; bound = G.state; Object.assign(status, { at: 0, fails: 0, why: null });
    badSlot = S.damaged(n) ? n : null;
    if (G.words && !G.state.wm.sess) G.words.newSession('new');
    return S.saveNow();
  };
  // leaving the game (back to the title): save, then stop saving
  S.close = function () { S.saveNow(); S.slot = null; bound = null; };
  // stop saving the game in play, without a last save (a restore or its undo replaces the slots: backup.js)
  S.detach = function () { clearTimeout(timer); timer = 0; S.slot = null; bound = null; };
  // the game in play (what the next save writes), or null on the title
  S.playing = () => (S.slot && G.state && G.state === bound ? G.state : null);
  S.erase = function (n) { G.store.del(S.slotKey(n)); if (S.slot === n) { S.slot = null; bound = null; } };
  // ---------- An unreadable slot (L8) ----------
  // A slot whose text is there but doesn't read as a game shows as empty on the slot screen; before a new game is
  // written over it, its text is kept in 'spanishclub_slotN_bad' (another one already there: '..._bad_<time>'), so a
  // grown-up can still send it to be rescued (backups carry these copies too, backup.js). If even that copy can't be
  // written, the new game isn't written there either: its saves count as failed (the grown-ups see it; the child's cloud).
  S.damaged = n => { const r = G.store.raw(S.slotKey(n)); return r != null && r !== '' && r !== 'null' && !S.read(n); };
  S.badKeys = () => G.store.keys().filter(k => /^spanishclub_slot\d_bad/.test(k)).sort();
  function keepBad(n) {
    if (badSlot !== n) return true;
    const raw = G.store.raw(S.slotKey(n)); if (raw == null || !S.damaged(n)) { badSlot = null; return true; }
    let k = S.slotKey(n) + '_bad'; const there = G.store.raw(k);
    if (there === raw) { badSlot = null; return true; }
    if (there != null) k += '_' + Date.now();
    if (!G.store.setRaw(k, raw)) return false;
    badSlot = null; return true;
  }
  // ---------- Did the last save land? (C4: a failed save used to be silent: 37 stars in the game, 0 in storage) ----------
  // at: when the game in play was last written (just loaded: when it was saved before); fails: failed writes in a row
  // (storage full, private browsing, a state that can't be written); why: the browser's reason for the last one.
  // Grown-ups see S.saveLine() ("Saved just now" / "Not saved since 10:42 (storage full)") in the grown-ups menu, on
  // the Learning page and in Back up / restore; after 3 failed saves in a row the child sees a small grey cloud by the
  // map's menu button (S.troubled(), field.js), gone with the next save that works.
  const status = S.status = { at: 0, fails: 0, why: null };
  S.TROUBLE = 3;
  S.troubled = () => !!S.slot && status.fails >= S.TROUBLE;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  S.when = function (ms) { // 10:42, or Oct 20 10:42 on another day
    const d = new Date(ms), n = new Date();
    return (d.toDateString() === n.toDateString() ? '' : MON[d.getMonth()] + ' ' + d.getDate() + ' ') + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  S.saveLine = function () {
    if (!S.slot) return null;
    if (status.fails) return 'Not saved since ' + (status.at ? S.when(status.at) : 'it began') + (/quota/i.test(status.why || '') ? ' (storage full)' : '');
    const s = (Date.now() - status.at) / 1000;
    return !status.at ? 'Not saved yet' : s < 90 ? 'Saved just now' : s < 3600 ? 'Saved ' + Math.round(s / 60) + ' min ago' : 'Saved at ' + S.when(status.at);
  };
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
      const ok = keepBad(S.slot) && G.store.set(S.slotKey(S.slot), G.state);
      if (ok) Object.assign(status, { at: G.state.savedAt, fails: 0, why: null });
      else { status.fails++; status.why = G.store.err; }
      return ok;
    } catch (e) { status.fails++; return false; }
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
