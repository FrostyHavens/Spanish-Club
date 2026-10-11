// ===== Word cards that grow (docs/PLAYTEST_NOTES.md, 2026-10-11: stars mean nothing to a child; show the progress on
// the word itself: say a word a few times and see its card pop up and grow; early on just cards, the book later) =====
// Every word the child has met is a CARD: its picture, its word (blue; gold once remembered) and a little plant in a pot
// that grows each time the word is used: seed -> sprout -> leaves -> bud -> flower (-> two flowers -> three, gold).
// Growth points (G.state.words[id].gp, next to the word model's record) come from USING the word:
//   say 5 (the mic: by far the best way to grow a card), pick 2 (a right answer; 1 after a miss), find 2, match 2 (a page
//   puzzle), carry 1, tap 1, give 1 (these last three at most once per word per C.GAP seconds of play, so they can't be farmed)
// The plant always agrees with the word model (words.js, docs/LEARNING_DESIGN.md): it can't flower before the word is
// remembered (stage 3, the gold card), a known word is at least a sprout, a remembered one at least a flower and a solid
// one two flowers; the third flower (gold petals) only grows on a solid word.
// Each use pops the card up near the action (where the child tapped, the mic, the thing on the map: C.at / o.x, o.y), the
// plant grows before their eyes with a rising sound (speaking: bigger, slower, with sound waves and a brighter sound),
// then the card flies into the deck in the top-right corner. On the map the deck IS the menu button (a little stack of
// cards, the count beside it, field.js / ui.js iconBtn 'menu'); over another screen the card just flies into that
// corner and the deck there pops when the map is back.
// The deck (G.deck(), the first picture in the kid menu, menus.js): all the cards in a grid, newest first; tap one to hear
// it. The book (the notebook, G.notebook) only comes later: at C.BOOK_AT met words a small celebration (a book drops in,
// cards fly into it, confetti) opens it in the kid menu as the organizer of the cards (topic pages, page puzzles). Before
// that there is no book, just cards (G.findPage pops the page's cards instead, field.js).
// API: G.cards.grow(id, how, {x, y, add}) -> points added (0 for an unmet word or a passive use too soon); .show(id, o) a
//   card pops up and flies into the deck without growing (a new card: o.fresh); .at(x, y) where the next pop starts
//   (screen px, for ~1.5 s); .pts(id) the plant's points as shown; .level(id) 0..6 (C.LV); .drawCard(ctx, id, x, y, o);
//   .drawPlant(ctx, pts, cx, bottom, o); .drawDeck(ctx, x, y) (the 20x20 corner button and its count); .bookOpen();
//   .live() cards popping now; .busy(); .log (tests: the last uses [{id, how, add, from, to}]); .party() the book's
//   celebration going on; .step() / .draw(ctx) (core.js, around the scenes like fx.js).
'use strict';
(function () {
  const C = G.cards = {};
  C.GROW = { say: 5, pick: 2, find: 2, match: 2, carry: 1, tap: 1, give: 1 };
  C.PASSIVE = ['carry', 'tap', 'give'];
  C.GAP = 30;                       // play seconds between two passive growths of one word
  C.LV = [0, 2, 6, 12, 20, 32, 46]; // seed, sprout, leaves, bud, flower, two flowers, three
  C.BOOK_AT = 15;                   // met words before the book opens
  C.W = 40; C.H = 82;               // a card at scale 1
  const FLOOR = [0, 0, 2, 20, 32], CAP = st => (st < 3 ? 19 : st < 4 ? 45 : 1e9);
  const IN = 10, GROW = 30, GROW_SAY = 44, HOLD = 16, FLY = 22;
  const HUD = [G.W - 26, 6]; // the deck: the map's menu button (top right)
  const D = () => G.data;
  const rec = id => (G.words ? G.words.rec(id) : null);
  const met = id => !!G.state && !!G.words && G.words.met(id);

  // ---------- points and levels ----------
  C.raw = id => { const r = rec(id); return r ? +r.gp || 0 : 0; };
  C.shown = function (id, gp) {
    const st = G.words ? G.words.stage(id) : 0; if (st < 1) return 0;
    return Math.max(FLOOR[st] || 0, Math.min(CAP(st), gp == null ? C.raw(id) : gp));
  };
  C.pts = id => C.shown(id);
  C.levelOf = p => { let k = 0; while (k + 1 < C.LV.length && p >= C.LV[k + 1]) k++; return k; };
  C.level = id => C.levelOf(C.pts(id));
  C.bookOpen = () => !!(G.state && G.state.flags && G.state.flags.book);
  C.count = () => (G.state && G.words ? G.words.count(1) : 0);

  // ---------- using a word ----------
  C.log = [];
  let spot = null, lastTap = null;
  C.at = (x, y) => { spot = { x, y, f: G.frame }; };
  C.grow = function (id, how, o = {}) {
    if (!G.state || !D().words[id] || !met(id)) return 0;
    const r = rec(id); if (!r) return 0;
    const add = o.add != null ? o.add : (C.GROW[how] || 1);
    if (C.PASSIVE.indexOf(how) >= 0) {
      const now = G.words.now();
      if (r.gpt != null && now >= r.gpt && now - r.gpt < C.GAP) return 0;
      r.gpt = now;
    }
    const from = C.pts(id);
    r.gp = Math.round(((+r.gp || 0) + add) * 10) / 10;
    const to = C.pts(id);
    C.log.push({ id, how, add, from, to }); if (C.log.length > 60) C.log.shift();
    pop(id, { from, to, how, x: o.x, y: o.y, said: how === 'say', small: C.PASSIVE.indexOf(how) >= 0 });
    return add;
  };
  C.show = function (id, o = {}) { if (!D().words[id]) return; const p = C.pts(id); pop(id, Object.assign({ from: p, to: p, how: 'show' }, o)); };

  // ---------- cards popping up ----------
  const pops = [];
  C.live = () => pops.length;
  C.list = () => pops.map(p => ({ id: p.id, x: p.x, y: p.y, t: p.t, said: p.said, fresh: p.fresh, from: p.from, to: p.to, cur: p.cur })); // (tests)
  C.busy = () => pops.length > 0 || !!party;
  C.popping = id => pops.some(p => p.id === id);
  function where(o) {
    if (o.x != null && o.y != null) return [o.x, o.y];
    if (spot && G.frame - spot.f < 90) return [spot.x, spot.y];
    if (lastTap && G.frame - lastTap.f < 120) return [lastTap.x, lastTap.y];
    return [G.W / 2, G.H / 2 + 20];
  }
  function pop(id, o) {
    const old = pops.find(p => p.id === id && p.t < p.flyAt);
    if (old) { // the same card is still up: it grows on from where it is
      old.from = old.cur; old.to = Math.max(old.to, o.to); old.said = old.said || !!o.said; old.small = old.small && !!o.small;
      old.t = Math.min(old.t, IN); old.flyAt = IN + (old.said ? GROW_SAY : GROW) + HOLD; return;
    }
    const [x, y] = where(o), waiting = pops.filter(p => p.t < p.flyAt).length;
    const p = { id, from: o.from, to: o.to, cur: o.from, how: o.how, said: !!o.said, fresh: !!o.fresh, small: !!o.small, x, y, t: -Math.max(o.delay || 0, waiting * 12), lv: C.levelOf(o.from) };
    p.flyAt = o.fresh ? IN + 46 : IN + (p.said ? GROW_SAY : GROW) + HOLD;
    pops.push(p);
  }
  const easeOut = u => 1 - (1 - u) * (1 - u);
  const deckFree = () => { const f = G.field; return !!f && G.top() === f && !f.locked; };
  const deckXY = () => [HUD[0] + 10, HUD[1] + 10]; // (over another screen the card just goes into that corner)
  // where a card's middle is and how big it is now
  function place(p) {
    const s0 = p.small ? 0.8 : p.said ? 1.15 : 1, hw = C.W * s0 / 2 + 2, hh = C.H * s0 / 2 + 2;
    const cx = G.clamp(p.x, hw, G.W - hw), cy = G.clamp(p.y - hh - 14, hh + 2, G.H - hh - 2);
    if (p.t < IN) { const u = Math.max(0, p.t) / IN; return { x: cx, y: cy + (1 - u) * 10, s: s0 * (0.3 + 0.7 * G.fx.easeBack(u)), a: Math.min(1, u * 2) }; }
    if (p.t < p.flyAt) {
      const g = p.t - IN, bump = p.lvUpT != null && p.t - p.lvUpT < 10 ? Math.sin((p.t - p.lvUpT) / 10 * Math.PI) * 0.12 : 0;
      return { x: cx, y: cy - (p.said && g < GROW_SAY ? Math.abs(Math.sin(g / 6)) * 2 : 0), s: s0 * (1 + bump), a: 1 };
    }
    const u = Math.min(1, (p.t - p.flyAt) / FLY), e = u * u * (3 - 2 * u), [tx, ty] = deckXY();
    return { x: cx + (tx - cx) * e, y: cy + (ty - cy) * e - Math.sin(u * Math.PI) * 26, s: s0 * (1 - 0.8 * e), a: 1 };
  }

  // ---------- every frame (core.js, before the top scene's update: it sees taps a scene then eats) ----------
  let deckVis = 0, deckPop = 0, party = null;
  C.party = () => !!party;
  C.step = function () {
    const tp = G.input.tap(); if (tp) lastTap = { x: tp.x, y: tp.y, f: G.frame };
    if (deckPop > 0) deckPop--;
    if (deckVis > 0) deckVis--;
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]; p.t++;
      if (p.t === 1) { G.audio.sfx(p.fresh ? 'note' : 'pop'); if (p.fresh) G.speak(G.baseForm(p.id)); }
      if (p.t > 0) deckVis = Math.max(deckVis, 40);
      const gl = p.said ? GROW_SAY : GROW;
      if (!p.fresh && p.t >= IN && p.t <= IN + gl) {
        const target = Math.max(p.to, C.pts(p.id)); // (the word may have turned gold meanwhile: it blooms right here)
        if (p.t === IN && target > p.from) G.audio.sfx(p.said ? 'growbig' : 'grow');
        p.cur = p.from + (target - p.from) * easeOut((p.t - IN) / gl);
        const lv = C.levelOf(p.cur);
        if (lv > p.lv) { p.lv = lv; p.lvUpT = p.t; G.audio.sfx('select'); p.spark = 8; }
      }
      if (p.t === p.flyAt) G.audio.sfx('swing');
      if (p.t >= p.flyAt + FLY) { pops.splice(i, 1); deckPop = 10; deckVis = 40; G.audio.sfx('deck'); }
    }
    // the book: once enough cards, a small celebration opens it (on the map, nothing else going on)
    if (!party && G.state && G.state.flags && !G.state.flags.book && C.count() >= C.BOOK_AT && deckFree() && !pops.length && G.fade.a === 0 && G.state.flags.intro) {
      G.state.flags.book = true; G.st.autosave();
      party = { t: 0, ids: G.words.list(1).sort((a, b) => ((rec(b).met || 0) - (rec(a).met || 0))).slice(0, 6) };
      G.audio.jingle('item');
    }
    if (party) {
      party.t++;
      if (party.t > 24 && party.t <= 24 + party.ids.length * 10 && (party.t - 24) % 10 === 0) G.audio.sfx('note');
      if (party.t === 100) { G.fx.confetti(G.W / 2 - 40, 120, -1, 18); G.fx.confetti(G.W / 2 + 40, 120, 1, 18); G.audio.sfx('chime'); }
      if (party.t >= 160) { party = null; deckPop = 12; deckVis = 50; G.audio.sfx('deck'); }
    }
  };

  // ---------- drawing ----------
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const LEAF = '#58c048', LEAF2 = '#2c7a2c', STEM = '#3c9a3c';
  function leaf(ctx, x, y, dir) { // a small leaf going out from the stem at x, y (dir -1 left, 1 right)
    R(ctx, dir < 0 ? x - 2 : x + 1, y, 2, 1, LEAF); R(ctx, dir < 0 ? x - 3 : x + 3, y - 1, 1, 1, LEAF2);
  }
  function flower(ctx, x, y, gold) {
    const pet = gold ? '#f8c820' : '#f05888', pet2 = gold ? '#fff080' : '#ff98c0';
    R(ctx, x - 1, y - 2, 3, 1, pet); R(ctx, x - 1, y + 2, 3, 1, pet); R(ctx, x - 2, y - 1, 1, 3, pet); R(ctx, x + 2, y - 1, 1, 3, pet);
    R(ctx, x - 1, y - 1, 3, 3, pet2); R(ctx, x, y, 1, 1, '#f8d020');
  }
  // the plant in its pot: cx its middle, by the pot's bottom, o.s its pixel size (2 on a card); pts as shown (a fraction
  // grows it pixel by pixel). About 10 x 15 pixels: a pot of 4, a stem of up to 8, a flower on top.
  C.drawPlant = function (ctx, pts, cx, by, o = {}) {
    const k = o.s || 1;
    ctx.save(); ctx.translate(Math.round(cx), Math.round(by)); if (k !== 1) ctx.scale(k, k);
    R(ctx, -5, -6, 10, 2, '#401c0c'); R(ctx, -4, -4, 8, 4, '#401c0c');                 // the pot's outline
    R(ctx, -4, -5, 8, 1, '#d87038'); R(ctx, -3, -4, 6, 3, '#b0582c'); R(ctx, -3, -4, 1, 3, '#c86834');
    R(ctx, -3, -6, 6, 1, '#5a3818');                                                 // soil
    const lv = C.levelOf(pts), top = -7;
    if (lv === 0) { // a seed (cracking open as it gets its first points)
      R(ctx, -1, top + 1, 3, 1, '#8a5a28'); R(ctx, -1, top, 2, 1, '#a87038');
      if (pts >= 1) R(ctx, 0, top - 1, 1, 1, LEAF);
      ctx.restore(); return;
    }
    const h = Math.round(pts <= 20 ? 1 + (pts - 2) / 18 * 5 : 6); // 1..6 of stem
    R(ctx, 0, top - h + 1, 1, h, STEM);
    const ty = top - h + 1;
    if (lv === 1) { leaf(ctx, 0, ty, -1); leaf(ctx, 0, ty, 1); ctx.restore(); return; }
    leaf(ctx, 0, top - Math.round(h * 0.3), -1); leaf(ctx, 0, top - Math.round(h * 0.55), 1);
    if (lv === 2) { leaf(ctx, 0, ty, -1); leaf(ctx, 0, ty, 1); ctx.restore(); return; }
    if (lv === 3) { // a bud, its tip turning pink
      const u = Math.min(1, (pts - 12) / 8);
      R(ctx, -1, ty - 2, 2, 2, '#48a840'); R(ctx, -1, ty - 3, 2, 1, u > 0.5 ? '#f070a0' : '#58c048');
      ctx.restore(); return;
    }
    if (lv >= 5) { R(ctx, -3, top - 3, 3, 1, STEM); R(ctx, -4, top - 5, 1, 3, STEM); flower(ctx, -4, top - 7, !!o.gold); }
    if (lv >= 6) { R(ctx, 1, top - 2, 3, 1, STEM); R(ctx, 4, top - 4, 1, 3, STEM); flower(ctx, 4, top - 6, true); }
    flower(ctx, 0, ty - 2, !!o.gold);
    ctx.restore();
  };
  // a whole card at x, y (top-left), o: {s scale, pts (the plant, e.g. while it grows), hi (selected), st (stage)}
  C.drawCard = function (ctx, id, x, y, o = {}) {
    const wd = D().words[id]; if (!wd) return;
    const st = o.st != null ? o.st : (G.words ? G.words.stage(id) : 1), s = o.s || 1, gold = st >= 3, isMet = st >= 1;
    const pts = o.pts != null ? o.pts : C.pts(id);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (s !== 1) ctx.scale(s, s);
    if (o.a != null) ctx.globalAlpha *= o.a;
    R(ctx, 2, 3, C.W, C.H - 1, 'rgba(0,0,16,0.35)');                                  // shadow
    R(ctx, 1, 0, C.W - 2, C.H, '#10102a'); R(ctx, 0, 1, C.W, C.H - 2, '#10102a');      // outline
    R(ctx, 1, 1, C.W - 2, C.H - 2, !isMet ? '#c8bca0' : gold ? (o.hi ? '#fff070' : '#f0c030') : (o.hi ? '#b8e8ff' : '#6898e0')); // the rim: blue, gold once remembered
    R(ctx, 3, 3, C.W - 6, C.H - 6, gold ? '#fff4c8' : '#fffaf0');
    if (gold) { R(ctx, 3, 3, C.W - 6, 1, '#fff8e0'); }
    ctx.globalAlpha *= isMet ? 1 : 0.5;
    G.drawIcon16(ctx, o.pic || wd, 4, 3, 2);
    ctx.globalAlpha /= isMet ? 1 : 0.5;
    const lab = isMet ? (o.label || G.baseForm(id)) : '? ? ?', lw = G.textWidth(lab), sq = Math.min(1, (C.W - 6) / Math.max(1, lw));
    ctx.save(); ctx.translate(C.W / 2, 0); ctx.scale(sq, 1); G.textC(ctx, lab, 0, 37, !isMet ? '#b0a080' : gold ? '#a06008' : '#2860a8', null); ctx.restore();
    if (isMet) C.drawPlant(ctx, pts, C.W / 2, C.H - 3, { gold: st >= 4, s: 2 });
    if (st >= 4 && ((G.frame >> 4) & 3) === 0) { R(ctx, 5, 5, 1, 3, '#ffffff'); R(ctx, 4, 6, 3, 1, '#ffffff'); }
    ctx.restore();
  };
  // the deck: a 20x20 button (like G.iconBtn) with a little stack of cards, and how many cards beside it
  C.drawDeck = function (ctx, x, y, o = {}) {
    x = Math.round(x); y = Math.round(y);
    const sc = deckPop > 0 && !o.still ? 1 + 0.3 * deckPop / 10 : 1;
    ctx.save();
    if (sc !== 1) { ctx.translate(x + 10, y + 10); ctx.scale(sc, sc); ctx.translate(-x - 10, -y - 10); }
    const on = G.input.holding(x - 4, y - 4, 28, 28) > 0;
    R(ctx, x + 1, y, 18, 20, '#000010'); R(ctx, x, y + 1, 20, 18, '#000010');
    R(ctx, x + 1, y + 1, 18, 18, on ? '#f0d060' : '#8898e0'); R(ctx, x + 2, y + 2, 16, 16, on ? '#304cc0' : '#1c2c8c');
    const card = (cx, cy, top) => { R(ctx, cx - 1, cy - 1, 10, 13, '#10102a'); R(ctx, cx, cy, 8, 11, top ? '#6898e0' : '#a8b8e0'); R(ctx, cx + 1, cy + 1, 6, 9, '#fffaf0'); };
    card(x + 4, y + 6, false); card(x + 6, y + 5, false); card(x + 8, y + 4, true);
    R(ctx, x + 12, y + 8, 1, 4, STEM); R(ctx, x + 10, y + 9, 2, 1, LEAF); R(ctx, x + 13, y + 8, 2, 1, LEAF); R(ctx, x + 11, y + 12, 3, 1, '#b0582c'); // a sprout on the top card
    ctx.restore();
    const n = o.noCount ? 0 : o.n != null ? o.n : C.count(); if (!n) return;
    const str = String(n), w = G.textWidth(str) + 7;
    R(ctx, x - w + 1, y + 4, w - 2, 12, '#000010'); R(ctx, x - w, y + 5, w, 10, '#000010');
    R(ctx, x - w + 1, y + 5, w - 2, 10, '#fffaf0');
    G.text(ctx, str, x - w + 4, y + 6, '#2860a8', null);
  };
  C.draw = function (ctx) {
    // the deck shows for a moment where the cards land when the map's own button isn't there
    for (const p of pops) {
      if (p.t <= 0) continue;
      const q = place(p), w = C.W * q.s, h = C.H * q.s;
      ctx.save(); ctx.globalAlpha = q.a;
      if (p.said && p.t >= IN && p.t < p.flyAt && G.mic) G.mic.waves(ctx, q.x, q.y, w / 2 + 3, '#70e0ff', 2, p.t);
      if (p.t >= IN && p.t < p.flyAt && (p.said || p.spark)) { ctx.globalAlpha = 0.35 * q.a; R(ctx, Math.round(q.x - w / 2 - 3), Math.round(q.y - h / 2 - 3), Math.round(w + 6), Math.round(h + 6), p.said ? '#70e0ff' : '#fff8a0'); ctx.globalAlpha = q.a; }
      C.drawCard(ctx, p.id, q.x - w / 2, q.y - h / 2, { s: q.s, pts: p.fresh ? C.pts(p.id) : p.cur, hi: !!p.spark });
      if (p.fresh && p.t < p.flyAt && (p.t >> 3) & 1) { R(ctx, Math.round(q.x + w / 2 - 6), Math.round(q.y - h / 2 - 2), 7, 7, '#40a848'); R(ctx, Math.round(q.x + w / 2 - 4), Math.round(q.y - h / 2 + 1), 3, 1, '#ffffff'); R(ctx, Math.round(q.x + w / 2 - 3), Math.round(q.y - h / 2), 1, 3, '#ffffff'); } // a new card: a little "+"
      ctx.restore();
      if (p.spark) { p.spark--; if (p.spark % 3 === 0) G.fx.twinkle(q.x + (Math.random() - 0.5) * w, q.y + h * 0.25 + (Math.random() - 0.5) * h * 0.3); }
    }
    if (party) drawParty(ctx);
  };
  // an open book (the notebook) centred on x, y; k its size (1: 72 x 48)
  C.drawBook = (ctx, x, y, k, t) => drawBook(ctx, x, y, k, t);
  function drawBook(ctx, x, y, k, t) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(k, k);
    R(ctx, -37, -22, 74, 48, '#10102a'); R(ctx, -36, -21, 72, 46, '#a83828');           // the cover
    R(ctx, -33, -24, 32, 46, '#10102a'); R(ctx, 1, -24, 32, 46, '#10102a');            // the pages
    R(ctx, -32, -23, 31, 44, '#fffaf0'); R(ctx, 1, -23, 31, 44, '#fffaf0');
    R(ctx, -1, -23, 2, 46, '#d8c8a8');                                                 // the spine
    for (let i = 0; i < 4; i++) { R(ctx, -28, -16 + i * 9, 6, 6, '#c8d8f0'); R(ctx, -20, -14 + i * 9, 16, 1, '#a8b8d8'); R(ctx, 5, -14 + i * 9, 22, 1, '#a8b8d8'); } // little pictures and lines
    R(ctx, 26, 21, 4, 8, '#e04848'); R(ctx, 26, 29, 2, 2, '#e04848');                  // the ribbon
    if (t != null && (t >> 3) % 3 === 0) { R(ctx, 30, -26, 1, 5, '#ffffff'); R(ctx, 28, -24, 5, 1, '#ffffff'); }
    ctx.restore();
  }
  // the book's celebration: a book drops in, the newest cards fly into it, it shines, then it goes to the corner
  function drawParty(ctx) {
    const t = party.t, cx = G.W / 2, cy = 96;
    const u = Math.min(1, t / 16), out = t > 130 ? Math.min(1, (t - 130) / 30) : 0, e = out * out, [tx, ty] = [HUD[0] + 10, HUD[1] + 10];
    const bx = cx + (tx - cx) * e, by = cy + (1 - G.fx.easeBack(u)) * -60 + (ty - cy) * e - Math.sin(out * Math.PI) * 20, s = 3 * (1 - 0.72 * e);
    ctx.save();
    ctx.globalAlpha = 0.35 * (1 - out) * u; R(ctx, 0, 0, G.W, G.H, '#080c28'); ctx.globalAlpha = 1;
    if (t > 90 && t < 130) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#f8e060'; ctx.beginPath(); ctx.arc(bx, by, 40 + Math.sin(t / 5) * 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    drawBook(ctx, bx, by, s / 3, t);
    party.ids.forEach((id, k) => { // each card flies from the deck into the book
      const t0 = 24 + k * 10, v = (t - t0) / 18; if (v < 0 || v > 1) return;
      const [dx, dy] = [HUD[0] + 10, HUD[1] + 10], ee = v * v * (3 - 2 * v), x = dx + (bx - dx) * ee, y = dy + (by - dy) * ee - Math.sin(v * Math.PI) * 30, sc = 0.5 * (1 - 0.6 * ee);
      C.drawCard(ctx, id, x - C.W * sc / 2, y - C.H * sc / 2, { s: sc });
    });
    ctx.restore();
  }

  // ---------- the deck: every card, newest first; tap one to hear it ----------
  const COLS = 6, ROWS = 2, PER = COLS * ROWS;
  class Deck {
    constructor(w) {
      G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.pg = 0; this.sel = 0; this.hop = {};
      this.ids = G.words.list(1).sort((a, b) => (rec(b).met || 0) - (rec(a).met || 0) || (a < b ? -1 : 1));
    }
    pages() { return Math.max(1, Math.ceil(this.ids.length / PER)); }
    onPage() { return this.ids.slice(this.pg * PER, this.pg * PER + PER); }
    cardRect(k) { return { x: 12 + (k % COLS) * 50, y: 31 + Math.floor(k / COLS) * 91, w: C.W, h: C.H }; }
    prevXY() { return [G.W / 2 - 62, 4]; }
    nextXY() { return [G.W / 2 + 42, 4]; }
    closeXY() { return [G.W - 30, 8]; }
    turn(d) { if (this.pages() < 2) return; this.pg = (this.pg + d + this.pages()) % this.pages(); this.sel = 0; G.audio.sfx('note'); }
    say(k) { const id = this.onPage()[k]; if (!id) return; this.sel = k; this.hop[id] = this.t; G.speak(G.baseForm(id)); G.audio.sfx('cursor'); }
    update() {
      this.t++;
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); return; }
      if (this.pages() > 1 && G.btnHit(...this.prevXY())) { this.turn(-1); return; }
      if (this.pages() > 1 && G.btnHit(...this.nextXY())) { this.turn(1); return; }
      const ids = this.onPage();
      if (G.input.tap() && this.t > 6) { const k = ids.findIndex((id, k) => G.tapIn(this.cardRect(k))); if (k >= 0) { this.say(k); return; } }
      const d = G.input.repDir(14, 6), n = ids.length;
      if (n && (d === 'left' || d === 'right')) {
        const k = this.sel + (d === 'left' ? -1 : 1);
        if (k < 0 || k >= n || (d === 'right' && k % COLS === 0) || (d === 'left' && k % COLS === COLS - 1)) this.turn(d === 'left' ? -1 : 1); else { this.sel = k; G.audio.sfx('cursor'); }
      }
      if (n && (d === 'up' || d === 'down')) { const k = this.sel + (d === 'up' ? -COLS : COLS); if (k >= 0 && k < n) { this.sel = k; G.audio.sfx('cursor'); } }
      if ((G.input.p('A') || G.input.p('C')) && n) this.say(this.sel);
    }
    draw(ctx) {
      const u = Math.min(1, this.t / 8);
      ctx.fillStyle = 'rgba(4,6,24,' + (0.5 * u) + ')'; ctx.fillRect(0, 0, G.W, G.H);
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#2c7a4a', fill2: '#14502a', alpha: 1 }); // a green table to lay the cards on
      C.drawDeck(ctx, 44, 8, { still: true });
      G.closeBtn(ctx, ...this.closeXY());
      if (this.pages() > 1) {
        G.iconBtn(ctx, 'back', ...this.prevXY()); G.iconBtn(ctx, 'next', ...this.nextXY());
        for (let k = 0; k < this.pages(); k++) R(ctx, G.W / 2 - this.pages() * 5 + k * 10 + 1, 13, 6, 6, k === this.pg ? '#f8e060' : '#5a8a6a');
      }
      const ids = this.onPage();
      if (!ids.length) { ctx.globalAlpha = 0.5; R(ctx, G.W / 2 - 20, 70, C.W, C.H, '#fffaf0'); ctx.globalAlpha = 1; G.bigText(ctx, '?', G.W / 2, 96, 3, '#2c7a4a', null); return; }
      ids.forEach((id, k) => {
        const r = this.cardRect(k), born = k * 2, a = Math.min(1, Math.max(0, (this.t - born) / 6)); if (a <= 0) return;
        const hp = this.hop[id] != null ? this.t - this.hop[id] : 99, hop = hp < 14 ? Math.round(Math.sin(hp / 14 * Math.PI) * 6) : 0;
        const sel = k === this.sel && (G.hint && G.hint.keyboard && G.hint.keyboard());
        ctx.save(); ctx.globalAlpha = a;
        C.drawCard(ctx, id, r.x, r.y - hop + Math.round((1 - a) * 8), { hi: sel || hp < 14 });
        ctx.restore();
        if (sel && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', r.x + r.w / 2, r.y - 10, '#f8e060');
      });
    }
  }
  G.Deck = Deck;
  G.deck = function () { const w = new G.Wait(); G.push(new Deck(w)); return w; };
})();
