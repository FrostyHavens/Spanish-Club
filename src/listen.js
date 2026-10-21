// ===== Listen and do: a friend asks for something in Spanish, and she does it (docs/LEARNING_PLAN_2.md, Phase 3) =====
// "Dame tres conchas." "Dame la manzana roja." "Toca el perro grande." "¿Cuántas conchas azules hay?" The request is
// SPOKEN (a speaker to hear it again, as often as she likes) and written WITHOUT the pictures of its words (src/ui.js
// noPic: the words she has to understand are plain coloured text, blue or gold by stage), and below it a wooden tray
// of 4-6 pictures without labels: apples of three colours, a big and a little dog, piles of shells. She taps the right
// one, or counts things from a pile into the basket and gives it (a tap on the basket), or, for "¿Cuántas...?", counts
// and says the number (the big mic) or taps it.
//   right  the friend's face lights up, the things fly to them, "¡Gracias!", her cards grow
//   wrong  gently: her pick wobbles, and the right one is SHOWN and SAID (it glows; a count is counted into the basket
//          out loud: "una, dos, tres... ¡Tres conchas!"); then she can give it (one more try, nothing to lose) or go on
//          (an arrow): never blocked
// Every word of the request she had to understand (src/requests.js: the tray made it necessary) is one 'listen'
// retrieval in the word model and the history (L, or a miss: one per word per request, never one per shell counted);
// the others are only heard. A "¿Cuántas?" answer is hers: said (the mic) or picked (its word), like any answer.
// The first time, a ghost hand shows it (src/demo.js 'listen': the speaker, then the pictures; 'listencount': a pile,
// then the basket). The request maker's ramp (one detail, then two) and the grown-ups' counts are in G.state.hist.ld.
// Where she meets it (docs/LEARNING_PLAN_2.md "as built"):
//   favours  (src/favores.js kinds 'listen' and 'carry', offered at most twice a day in all, an ear in their bubble)
//            listen: Don Pepe's fruit, Nico's animals, Doña Lupe's berries, Elena's animals, Abuelo's orchard and
//            animals, Mateo's weather things: two requests on the tray; carry: Lola's shells on the beach (her leaves in
//            the forest, apples at the grandparents'), Lucía's flowers in Villa Sol: the things are scattered about,
//            she picks them up (src/carry.js: the hands hold three of a kind) and brings them; they check what she holds
//   warm-up  the dog's daily warm-up (src/warmup.js) brings one request once she knows enough words
//
// API (G.listen, short L):
//   L.on()  on (off in tests unless they ask: tools/harness.js {listen: true} or LISTEN=1)
//   L.run(req, o)     generator: the scene for one request (G.requests.make) -> {ok, first} | {cancel: true}
//                     o: {who (the face asking), cancel, cancelIcon, onCancel, drawExtra (the warm-up's), en}
//   L.round(spec, o)  generator: o.n requests (2) on a board (G.requests.spec(who, zone)), the first about o.focus
//   L.warm(extra)     generator: the warm-up's request -> right on the first try   L.warmReady()
//   L.credit(req, res, o)  the model and the history for an answer (the first one of a request)
//   L.scatter(f, req, who)  a world request's things on the map around who -> [[x, y], ...]
//   L.carryStart / carryCheck / carryRemind (v, f)  a 'carry' favour; L.cur() the scene on top or null
'use strict';
(function () {
  const L = G.listen = {}, T = G.TILE;
  const RQ = () => G.requests, Wd = () => G.words, H = () => G.hearts;
  const TT = (t, en) => ({ t, en });
  const WD = id => G.data.words[id];
  L.off = () => !!((typeof window !== 'undefined' && window.__listenOff) || (G.debug && G.debug.noListen));
  L.on = () => !!G.state && !L.off();
  L.cur = () => { const s = G.top(); return s instanceof ListenDo ? s : null; };
  const say = (who, show, ...pages) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, show ? { show } : {}));
  const enOf = id => (WD(id) ? WD(id).en.replace(/^the /, '') : id);
  L.en = req => 'Listen, then do it (no pictures: the words are the clue): ' + req.words.map(enOf).join(' + ') + '.';

  // ---------- pictures ----------
  // a tray thing's picture (a colour word's colour; the dog's ball keeps its own red)
  L.pic = c => (c.col ? { icon: WD(c.thing).icon, col: RQ().colHex(c.col) } : WD(c.thing));
  // its size on the tray: a big one and a little one stand on the same ground, the little one half as tall
  const ONE = { grande: 48, pequeno: 24 }, PILE = { grande: 22, pequeno: 13 };
  // where the k-th thing of a pile of n sits in a cell (r: the cell, s: a thing's size): a heap from the bottom
  function heap(r, n, s) {
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), out = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols), k = i % cols, inRow = row === rows - 1 ? n - row * cols : cols;
      out.push([Math.round(r.x + r.w / 2 - inRow * s / 2 + k * s + (row & 1 ? 2 : 0)), Math.round(r.y + r.h - 5 - (row + 1) * (s - 1))]);
    }
    return out;
  }
  const disc = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

  // =====================================================================
  //  The scene
  // =====================================================================
  const GOLD = '#f8d860', BLUE = '#a8d8ff';
  const PRAISE = ['¡Gracias!', '¡Muy bien!', '¡Sí! ¡Gracias!', '¡Perfecto!'];
  class ListenDo {
    constructor(req, o, w) {
      G.toastT = 0; this.transparent = true; this.req = req; this.o = o || {}; this.w = w; this.t = 0;
      this.who = this.o.who || req.who || null;
      this.cells = req.tray.map((c, i) => Object.assign({}, c, { left: c.n, i }));
      this.basket = []; this.fly = []; this.off = {}; this.miss = null; this.first = null; this.gold = [];
      this.phase = 'ask'; this.pt = 0; this.closeT = 0; this.joy = 0; this.replays = 0; this.glow = {}; this.cardOff = {}; this.counting = null;
      this.lines = G.richLayout(req.text, this.textW(), { noPic: true });
      this.mic = req.kind === 'howmany' && G.mic && G.mic.on() ? new G.MicBtn(this, { rect: () => this.micRect(), ready: () => this.phase === 'ask' && this.t > 10, heard: a => this.heard(a) }) : null;
      G.speak(req.say);
    }
    onEnter() { if (this.mic) this.mic.arm(); }
    onExit() { if (this.mic) this.mic.off(); }
    // ---------- where things are (game px) ----------
    left() { return this.o.cancel ? 30 : 0; }
    textW() { return G.W - 24 - 40 - 32 - this.left(); }
    box() { return { x: 12, y: 6, w: G.W - 24, h: Math.max(38, this.lines.length * 16 + 14) }; }
    faceRect() { const b = this.box(); return { x: b.x + 5 + this.left(), y: b.y + Math.round((b.h - 30) / 2), w: 30, h: 30 }; }
    spk() { const b = this.box(); return [b.x + b.w - 27, b.y + Math.round((b.h - 20) / 2)]; }
    backXY() { return this.o.cancelIcon === 'skip' ? [4, 4] : [18, 12]; }
    cancelHit() { return this.o.cancelIcon === 'skip' ? G.skipHit(...this.backXY()) : G.btnHit(...this.backXY()); }
    trayRect() { const b = this.box(), n = this.cells.length, cw = n > 4 ? 44 : 54, gap = n > 4 ? 4 : 8, w = n * cw + (n - 1) * gap + 14; return { x: Math.round((G.W - w) / 2), y: b.y + b.h + (this.req.kind === 'pick' ? 16 : 10), w, h: 76, cw, gap }; }
    cellRect(i) { const t = this.trayRect(); return { x: t.x + 7 + i * (t.cw + t.gap), y: t.y + 7, w: t.cw, h: 62 }; }
    basketRect() { return { x: Math.round(G.W / 2) - 34, y: 146, w: 68, h: 52 }; }
    cardRect(k) { const cw = 60, gap = 8, tw = 3 * cw + 2 * gap, x0 = Math.round((G.W - tw) / 2) - (this.mic ? 28 : 0); return { x: x0 + k * (cw + gap), y: 152, w: cw, h: 44 }; }
    micRect() { const r = this.cardRect(2); return { x: r.x + r.w + 12, y: 151, w: 46, h: 46 }; }
    nextRect() { return { x: G.W - 48, y: G.H - 42, w: 40, h: 34 }; }
    hintXY() { return null; } // (never point at an answer)
    // a thing's place in its cell: [x, y, size] (the k-th of a pile; a single one on its own)
    thingAt(i, k) {
      const c = this.cells[i], r = this.cellRect(i);
      if (this.req.kind === 'count') {
        const n = Math.max(1, c.n), cols = n <= 1 ? 1 : n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), fit = Math.min(Math.floor((r.w - 6) / cols), Math.floor((r.h - 8) / rows) + 1);
        const s = Math.min(PILE[c.size] || 16, fit, c.size === 'pequeno' ? Math.round(fit * 0.6) : 99), H2 = heap(r, n, s)[k] || [r.x + r.w / 2 - s / 2, r.y + r.h / 2];
        return [H2[0], H2[1], s];
      }
      const big = Math.min(ONE.grande, r.w - 6), s = c.size === 'grande' ? big : c.size === 'pequeno' ? Math.round(big / 2) : Math.min(32, r.w - 10);
      return [Math.round(r.x + r.w / 2 - s / 2), r.y + r.h - 6 - s, s];
    }
    basketAt(k) { const b = this.basketRect(), s = 14, cols = 4, row = Math.floor(k / cols), i = k % cols; return [b.x + 8 + i * 13 + (row & 1 ? 6 : 0), b.y + 6 - row * 9, s]; }
    faceXY() { const f = this.faceRect(); return [f.x + f.w / 2, f.y + f.h / 2]; }
    // ---------- what she does ----------
    replay() { this.replays++; G.speak(this.req.say); }
    tapCell(i) {
      const c = this.cells[i], req = this.req;
      if (req.kind === 'pick') {
        if (this.phase === 'shown') { if (c.right) this.finish(i); else { G.audio.sfx('boop'); this.nudge(i); } return; }
        if (this.off[i]) { G.audio.sfx('boop'); return; }
        this.answer(c, i);
      } else if (req.kind === 'count') {
        if (this.phase !== 'ask') { G.audio.sfx('boop'); return; }
        if (c.left <= 0 || this.basket.length >= 10) { G.audio.sfx('boop'); this.nudge(i); return; }
        const [x, y, s] = this.thingAt(i, c.left - 1); c.left--;
        const it = { thing: c.thing, col: c.col, size: c.size, from: i };
        this.basket.push(it); this.addFly(L.pic(c), x, y, s, 'basket', this.basket.length - 1);
        G.audio.sfx('pop');
      } else { G.audio.sfx('cursor'); this.nudge(i); } // (a "¿cuántas?": the pictures are to count; the answer is below)
    }
    nudge(i) { this.miss = { i, t: 0, soft: true }; }
    addFly(pic, x, y, s, to, k) { const [tx, ty] = to === 'face' ? this.faceXY() : to === 'basket' ? this.basketAt(k) : to; this.fly.push({ pic, x0: x + s / 2, y0: y + s / 2, x1: tx, y1: ty, s0: s, s1: to === 'face' ? 16 : 14, t: 0, len: to === 'face' ? 18 : 12, to }); }
    give() {
      if (!this.basket.length) { G.audio.sfx('boop'); return; }
      if (this.phase === 'shown') { if (!this.counting) this.finish(null); return; }
      this.answer(this.basket.slice(), -1);
    }
    pickNum(k) {
      const id = this.req.cards[k]; if (!id) return;
      if (this.phase === 'shown') { if (RQ().numOf(id) === this.req.answer) this.finish(null, k); else { G.audio.sfx('boop'); } return; }
      if (this.cardOff[k]) { G.audio.sfx('boop'); return; }
      this.answer(id, k);
    }
    heard(alts) { // the mic: a number she said, among the cards
      const k = G.mic.best(this.req.cards.map(id => G.mic.target({ word: id })), alts, this.req.cards.findIndex(id => RQ().numOf(id) === this.req.answer));
      if (k < 0 || this.cardOff[k]) { this.mic.miss(); return; }
      this.said = true; this.answer(this.req.cards[k], k);
    }
    // the first answer counts (the model, the history); then right or shown
    answer(a, k) {
      const req = this.req, res = RQ().check(req, a);
      if (!this.first) {
        this.first = res;
        // (the cards that grow pop up from the bottom, under what she did: the request and the tray stay in sight)
        const at = req.kind === 'count' ? [this.basketRect().x + 34, G.H - 2] : req.kind === 'howmany' ? [this.cardRect(Math.max(0, k)).x + 27, G.H - 2] : [this.cellRect(Math.max(0, k)).x + this.cellRect(0).w / 2, G.H - 2];
        const g = L.credit(req, res, { at, num: req.kind === 'howmany' ? a : null, said: !!this.said, micAt: this.mic ? this.micRect() : null, quiet: !res.ok });
        this.gold = g.gold;
      }
      if (res.ok) this.win(k); else this.wrong(k, a);
    }
    win(k) {
      this.phase = 'right'; this.pt = 0; this.joy = 1;
      const req = this.req;
      if (req.kind === 'pick') { const [x, y, s] = this.thingAt(k, 0); this.cells[k].gone = true; this.addFly(L.pic(this.cells[k]), x, y, s, 'face'); }
      else if (req.kind === 'count') this.basketToFace();
      else this.cardWon = k;
      G.audio.sfx('chime'); G.audio.jingle('item'); if (this.mic && this.said) this.mic.win();
      const [fx, fy] = this.faceXY(); G.fx.burst(fx, fy);
      const praise = PRAISE[G.r(PRAISE.length)];
      G.fx.say(praise, G.W / 2, this.box().y + this.box().h + 4, '#f8e060', true); G.speak(praise); // (the friend says it)
      this.closeT = 84;
      this.result = { ok: true, first: !!(this.first && this.first.ok) };
    }
    basketToFace() { this.basket.forEach((it, i) => { const [x, y] = this.basketAt(i); this.fly.push({ pic: L.pic(it), x0: x + 7, y0: y + 7, x1: this.faceXY()[0], y1: this.faceXY()[1], s0: 14, s1: 12, t: -i * 4, len: 18, to: 'face' }); }); this.basket = []; this.handed = true; }
    // gently: what she did wobbles, then the right one is shown and said
    wrong(k, a) {
      const req = this.req;
      G.audio.sfx('boop'); G.fx.shake = 3;
      this.phase = 'shown'; this.pt = 0;
      if (req.kind === 'pick') { this.off[k] = true; this.miss = { i: k, t: 0 }; this.glow = { [req.answer]: 1 }; this.sayNp = 26; }
      else if (req.kind === 'howmany') { if (k >= 0) this.cardOff[k] = true; this.miss = { card: k, t: 0 }; this.counting = { i: 0, t: -20, list: this.cells.map((c, i) => (c.right ? i : -1)).filter(i => i >= 0) }; }
      else { // the basket goes back to the piles, then the right pile is counted into it, out loud
        this.basket.forEach((it, i) => { const [x, y] = this.basketAt(i), c = this.cells[it.from], [tx, ty] = this.thingAt(it.from, c.left); c.left++; this.fly.push({ pic: L.pic(it), x0: x + 7, y0: y + 7, x1: tx + 8, y1: ty + 8, s0: 14, s1: PILE[c.size] || 16, t: -i * 3, len: 14, to: 'pile' }); });
        this.basket = [];
        this.counting = { i: 0, t: -34, list: Array.from({ length: req.n }, () => req.answer) };
      }
      this.result = { ok: false, first: false };
    }
    // the shown answer goes to them anyway (she taps it, or the arrow): never a dead end
    finish(i, k) {
      if (this.phase === 'right') return;
      if (this.req.kind === 'pick' && i != null) { const [x, y, s] = this.thingAt(i, 0); this.cells[i].gone = true; this.addFly(L.pic(this.cells[i]), x, y, s, 'face'); }
      if (this.req.kind === 'count' && this.basket.length) this.basketToFace();
      if (k != null) this.cardWon = k;
      this.phase = 'right'; this.pt = 0; this.joy = 0.6; this.closeT = i == null && k == null && !this.handed ? 30 : 64;
      G.audio.sfx('ok');
      if (i != null || k != null || this.handed) G.fx.say('¡Gracias!', G.W / 2, this.box().y + this.box().h + 4, '#f8e060', true);
    }
    cancel() { G.audio.sfx('cancel'); G.pop(); if (this.o.onCancel) this.o.onCancel(); this.w.resolve({ cancel: true }); }
    // ---------- every frame ----------
    update() {
      this.t++; this.pt++; if (this.miss) this.miss.t++; if (this.joy > 0) this.joy = Math.max(0, this.joy - 0.012);
      this.fly = this.fly.filter(f => ++f.t < f.len);
      if (this.sayNp && --this.sayNp === 0) G.speak(this.req.np);
      if (this.counting) this.stepCount();
      if (this.phase === 'right') { if (--this.closeT <= 0) { G.pop(); this.w.resolve(this.result); } return; }
      if (this.mic && this.mic.update()) return;
      if (G.input.p('C') || (G.speakerHit(...this.spk()) && G.input.eat())) { this.replay(); return; }
      if (!G.input.tap() || this.t <= 8) return;
      if (this.o.cancel && this.cancelHit()) { this.cancel(); return; }
      if (this.phase === 'shown' && !this.counting && G.tapIn(this.nextRect())) { this.finish(null); return; }
      if (this.miss && !this.miss.soft && this.miss.t < 10) return; // (no answering again mid-wobble)
      const req = this.req;
      if (req.kind === 'count' && (G.tapIn(this.basketRect()) || G.tapIn(this.faceRect()))) { this.give(); return; }
      if (req.kind === 'howmany') { const k = [0, 1, 2].findIndex(k => G.tapIn(this.cardRect(k))); if (k >= 0) { this.pickNum(k); return; } }
      const i = this.cells.findIndex((c, i) => { const r = this.cellRect(i); return G.tapIn(r.x - 3, r.y - 3, r.w + 6, r.h + 6); });
      if (i >= 0) { this.tapCell(i); return; }
      if (G.tapIn(this.box())) this.replay(); // (her finger on the words: hear them again)
    }
    // showing a count: the right things go into the basket one by one, counted out loud, then the whole phrase
    stepCount() {
      const c = this.counting; if (++c.t < 0) return;
      const req = this.req;
      if (c.i < c.list.length) {
        if (c.t % 32 !== 1) return;
        const n = req.kind === 'howmany' ? 1 : req.n, word = RQ().NUMS[c.i], g = RQ().noun(req.thing).g, said = RQ().numWord(word, g); void n;
        if (req.kind === 'count') { const i = c.list[c.i], cell = this.cells[i], [x, y, s] = this.thingAt(i, cell.left - 1); cell.left--; this.basket.push({ thing: cell.thing, col: cell.col, size: cell.size, from: i }); this.addFly(L.pic(cell), x, y, s, 'basket', this.basket.length - 1); }
        else this.glow[c.list[c.i]] = 1;
        G.speak(said.charAt(0).toUpperCase() + said.slice(1)); G.audio.sfx('pop');
        c.i++; c.t = 1;
        return;
      }
      if (c.t === 14) { G.speak(req.np); if (req.kind === 'howmany') this.cardGlow = req.cards.findIndex(id => RQ().numOf(id) === req.answer); }
      if (c.t >= 40) this.counting = null;
    }
    // ---------- drawing ----------
    draw(ctx) {
      const req = this.req, b = this.box(), t = this.t;
      ctx.globalAlpha = Math.min(1, t / 8) * 0.35; ctx.fillStyle = '#080c28'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1;
      // the one asking, the request (no pictures), the speaker
      G.win(ctx, b.x, b.y, b.w, b.h);
      const f = this.faceRect(), bounce = this.joy > 0 ? Math.round(Math.abs(Math.sin(t / 4)) * -3 * this.joy) : 0;
      ctx.fillStyle = '#10102a'; ctx.fillRect(f.x - 1, f.y - 1 + bounce, f.w + 2, f.h + 2);
      if (H() && this.who) H().face(ctx, this.who, f.x, f.y + bounce, f.w, t);
      if (this.joy > 0.3 && H()) for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i * 14) % 36; H().heart(ctx, f.x + 4 + i * 9, f.y - 2 - k, true, 1); }
      const tx = f.x + f.w + 8, ty = b.y + Math.round((b.h - this.lines.length * 16) / 2) + 2;
      G.richDraw(ctx, this.lines, tx, ty);
      const [sx, sy] = this.spk();
      if (this.replays === 0 && this.phase === 'ask' && t > 60 && (t % 90) < 30) { ctx.strokeStyle = '#f8e060'; ctx.lineWidth = 2; ctx.globalAlpha = 1 - (t % 90) / 30; ctx.beginPath(); ctx.arc(sx + 10, sy + 10, 13 + (t % 90) / 4, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; } // ("hear it again": now and then, until she has)
      G.speakerBtn(ctx, sx, sy);
      if (this.o.cancel) { if (this.o.cancelIcon === 'skip') G.skipBtn(ctx, ...this.backXY(), t); else G.iconBtn(ctx, 'back', ...this.backXY()); }
      if (this.o.en && G.enVisible()) G.enBox(ctx, this.o.en, b.y + b.h + 1, true);
      if (this.o.drawExtra) { try { this.o.drawExtra(ctx, this); } catch (e) { console.error(e); } }
      this.drawTray(ctx);
      if (req.kind === 'count') this.drawBasket(ctx);
      if (req.kind === 'howmany') this.drawCards(ctx);
      // things flying (to the basket, back to a pile, to the friend)
      for (const fl of this.fly) {
        if (fl.t < 0) continue;
        const u = fl.t / fl.len, e = u * u * (3 - 2 * u), s = fl.s0 + (fl.s1 - fl.s0) * e, x = fl.x0 + (fl.x1 - fl.x0) * e, y = fl.y0 + (fl.y1 - fl.y0) * e - Math.sin(u * Math.PI) * 18;
        G.drawIcon16(ctx, fl.pic, Math.round(x - s / 2), Math.round(y - s / 2), s / 16);
      }
      if (this.phase === 'shown' && !this.counting && this.pt > 20) this.drawNext(ctx);
      if (this.mic && this.phase !== 'shown') this.mic.draw(ctx); // (while the right number is shown: the arrow, no mic)
    }
    drawTray(ctx) {
      const tr = this.trayRect(), req = this.req, t = this.t;
      // a wooden board, two planks
      ctx.fillStyle = '#2a1608'; ctx.fillRect(tr.x - 1, tr.y + 1, tr.w + 2, tr.h - 2); ctx.fillRect(tr.x + 1, tr.y - 1, tr.w - 2, tr.h + 2);
      ctx.fillStyle = '#a8703c'; ctx.fillRect(tr.x + 1, tr.y + 1, tr.w - 2, tr.h - 2);
      ctx.fillStyle = '#c08850'; ctx.fillRect(tr.x + 1, tr.y + 1, tr.w - 2, 3); ctx.fillStyle = '#8a5a2c'; ctx.fillRect(tr.x + 1, tr.y + Math.round(tr.h / 2), tr.w - 2, 1);
      this.cells.forEach((c, i) => {
        const r = this.cellRect(i), m = this.miss, wob = m && m.i === i && m.t < 16 ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 16)) : 0, off = this.off[i];
        const glow = this.glow[i] && (this.phase === 'shown' || this.counting), x = r.x + wob;
        if (glow) { ctx.fillStyle = (t >> 3) & 1 ? '#fff8c0' : '#f8d040'; ctx.fillRect(x - 3, r.y - 3, r.w + 6, r.h + 6); }
        ctx.fillStyle = '#3a2410'; ctx.fillRect(x, r.y, r.w, r.h);
        ctx.fillStyle = off ? '#8a90a8' : '#d6e6f6'; ctx.fillRect(x + 1, r.y + 1, r.w - 2, r.h - 2);
        ctx.fillStyle = off ? '#7a8098' : '#bcd2ea'; ctx.fillRect(x + 1, r.y + r.h - 6, r.w - 2, 5); // (the ground they stand on)
        ctx.globalAlpha = off ? 0.45 : 1;
        if (req.kind === 'count') { for (let k = 0; k < c.left; k++) { const [px, py, s] = this.thingAt(i, k); G.drawIcon16(ctx, L.pic(c), px + wob, py, s / 16); } }
        else if (!c.gone) { const [px, py, s] = this.thingAt(i, 0), hop = glow ? Math.round(Math.abs(Math.sin(t / 7)) * -3) : 0; G.drawIcon16(ctx, L.pic(c), px + wob, py + hop, s / 16); }
        ctx.globalAlpha = 1;
      });
    }
    drawBasket(ctx) {
      const b = this.basketRect(), t = this.t, n = this.basket.length, live = this.phase !== 'right';
      // an arrow up to the friend when there's something in it ("give it to her": tap the basket)
      if (n && live && !this.counting) {
        const [fx, fy] = this.faceXY(), x0 = b.x + 8, y0 = b.y - 4, k = (t % 40) / 40;
        for (let i = 0; i < 7; i++) { const u = (i + k) / 7, x = x0 + (fx + 22 - x0) * u, y = y0 + (fy + 22 - y0) * u - Math.sin(u * Math.PI) * 10; disc(ctx, x, y, 1.6 + u * 1.2, i === 6 ? '#f8e060' : 'rgba(248,224,96,' + (0.35 + u * 0.6) + ')'); }
      }
      // the things in it, heaped up over the rim
      for (let i = 0; i < n; i++) { const [x, y, s] = this.basketAt(i); if (!this.fly.some(fl => fl.to === 'basket' && fl.t < fl.len && Math.abs(fl.x1 - x) < 1 && Math.abs(fl.y1 - y) < 1)) G.drawIcon16(ctx, L.pic(this.basket[i]), x, y, s / 16); }
      // the basket: woven, a handle
      const pulse = n && live && !this.counting && (t >> 4) % 2 === 0 ? 1 : 0;
      ctx.strokeStyle = '#3a2008'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 18, 26, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.strokeStyle = '#a86a28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 18, 26, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      const by = b.y + 18;
      ctx.fillStyle = '#3a2008'; ctx.fillRect(b.x + 2 - pulse, by - 1, b.w - 4 + 2 * pulse, b.h - 17);
      ctx.fillStyle = '#c88a40'; ctx.fillRect(b.x + 4, by + 1, b.w - 8, b.h - 21);
      ctx.fillStyle = '#a86a28'; for (let y = by + 4; y < b.y + b.h - 4; y += 5) ctx.fillRect(b.x + 4, y, b.w - 8, 2);
      ctx.fillStyle = '#8a5022'; for (let x = b.x + 9; x < b.x + b.w - 6; x += 9) ctx.fillRect(x, by + 1, 2, b.h - 21);
      ctx.fillStyle = '#e0a858'; ctx.fillRect(b.x + 3, by, b.w - 6, 3);
      if (pulse) { ctx.strokeStyle = '#f8e060'; ctx.lineWidth = 1; ctx.strokeRect(b.x + 0.5, by - 2.5, b.w - 1, b.h - 14); }
    }
    drawCards(ctx) {
      const req = this.req, t = this.t;
      const big = req.cards.every((id, k) => G.textWidth(this.cardLabel(id)) * 2 <= this.cardRect(k).w - 10); // (one size for all three)
      req.cards.forEach((id, k) => {
        const r = this.cardRect(k), off = this.cardOff[k], m = this.miss, wob = m && m.card === k && m.t < 16 ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 16)) : 0;
        const glow = (this.cardGlow === k && this.phase === 'shown') || this.cardWon === k;
        if (glow) { ctx.fillStyle = (t >> 3) & 1 ? '#fff8c0' : '#f8d040'; ctx.fillRect(r.x - 3 + wob, r.y - 3, r.w + 6, r.h + 6); }
        G.win(ctx, r.x + wob, r.y, r.w, r.h, off ? { fill1: '#5c6074', fill2: '#363a4c' } : {});
        const lab = this.cardLabel(id), col = off ? '#a8acb8' : Wd().stage(id) >= 3 ? GOLD : BLUE;
        if (big) G.bigText(ctx, lab, r.x + r.w / 2 + wob, r.y + 15, 2, col); else G.textC(ctx, lab, r.x + r.w / 2 + wob, r.y + 18, col);
      });
    }
    // a number card's word, agreeing with the thing counted ("¿Cuántas conchas?" "Una.")
    cardLabel(id) { const n = RQ().noun(this.req.thing); return id === 'uno' && n ? RQ().numWord('uno', n.g === 'f' ? 'f' : 'm').replace(/^un$/, 'uno') : G.baseForm(id); }
    drawNext(ctx) { const n = this.nextRect(); ctx.save(); ctx.translate(n.x + 2, n.y + 4); ctx.scale(1.4, 1.4); G.skipBtn(ctx, 0, 0, this.t); ctx.restore(); }
  }
  G.ListenDo = ListenDo;

  // =====================================================================
  //  Counting it: one retrieval per word per request (the first answer), in the model and the history
  // =====================================================================
  // res: G.requests.check(req, answer); o: {at: [x, y] (where the cards pop up), num (a "¿cuántas?" answer: a number
  // word), said (said with the mic), micAt, quiet (no card pops up: a wrong answer's right half)} -> {gold: [ids that
  // just turned gold]}
  L.credit = function (req, res, o = {}) {
    const W = Wd(), sp = RQ().split(req), at = o.at || [G.W / 2, 100], gold = [];
    const dimOf = w => ['num', 'thing', 'size', 'col'].find(k => req.dims[k] === w);
    if (G.cards) G.cards.at(at[0], at[1]);
    if (req.kind === 'howmany') {
      const ans = req.answerNum;
      if (res.ok) {
        for (const w of sp.tested) W.answerRight(w, { mode: 'listen', firstTry: true, review: W.isOld(w) });
        if (o.said && G.mic) { const m = o.micAt || { x: at[0], y: at[1], w: 0, h: 0 }; G.mic.award(ans, m.x + m.w / 2, m.y + m.h / 2); }
        const r = W.answerRight(ans, { said: !!o.said, mode: o.said ? 'say' : 'text', firstTry: true, review: W.isOld(ans) });
        if (r && r.gold) gold.push(ans);
      } else { W.answerWrong(ans); sp.tested.forEach(w => W.encounter(w, 'heard')); } // (a wrong count: the number she didn't find; the rest was heard)
      sp.heard.forEach(w => W.encounter(w, 'heard'));
      return { gold };
    }
    for (const w of sp.tested) { if (res.dims[dimOf(w)]) W.answerRight(w, { mode: 'listen', firstTry: true, review: W.isOld(w), noGrow: !!o.quiet }); else W.answerWrong(w); } // (a wrong answer's right half: counted, quietly: the right one is being shown)
    sp.heard.forEach(w => W.encounter(w, 'heard'));
    return { gold };
  };

  // =====================================================================
  //  Playing it: one request, a round of them, the warm-up's
  // =====================================================================
  L.run = function* (req, o = {}) {
    if (!req) return null;
    const w = new G.Wait(), sc = new ListenDo(req, Object.assign({ en: L.en(req) }, o), w);
    G.push(sc);
    const r = yield w, res = r.result || {};
    if (res.cancel) return res;
    if (RQ()) RQ().result(req, !!res.first);
    if (G.hist && G.hist.listenDone) G.hist.listenDone(!!res.ok, !!res.first, req.say);
    if (G.vocabLog) G.vlog.ev({ ty: 'listen', say: req.say, tpl: req.tpl, ok: !!res.ok, first: !!res.first });
    if (sc.gold.length) yield G.learnWords(sc.gold);
    return res;
  };
  // a due word this board can ask about (the review engine's order), or null
  L.focus = function (spec) {
    if (!spec || !G.review) return null;
    const words = RQ().words(spec);
    return G.review.next({ minStage: 2, filter: id => words.includes(id) && RQ().feasible(spec, id) }) || null;
  };
  L.round = function* (spec, o = {}) {
    const out = { n: 0, right: 0, first: 0 }, n = o.n || 2;
    let focus = o.focus || null;
    for (let i = 0; i < n; i++) {
      const req = RQ().make(spec, { focus });
      if (!req) break;
      const res = yield* L.run(req, o);
      if (!res || res.cancel) { out.cancel = true; break; }
      out.n++; if (res.ok) out.right++; if (res.first) out.first++;
      focus = L.focus(spec);
    }
    return out;
  };
  // the dog's warm-up (src/warmup.js): one request on everything she might know, about a word that's due
  L.warmReady = () => L.on() && !!RQ() && RQ().feasible(RQ().spec('dog'));
  L.warm = function* (extra) {
    const spec = RQ().spec('dog'), req = RQ().make(spec, { focus: L.focus(spec) });
    if (!req) return false;
    const res = yield* L.run(req, Object.assign({ who: 'canelo' }, extra || {}));
    return !!(res && !res.cancel && res.first);
  };

  // =====================================================================
  //  A world request (a 'carry' favour): the things scattered about, picked up, brought back, checked
  // =====================================================================
  const zoneOf = f => (G.zones && f ? G.zones.of(f.mapId) || G.zones.pathOf(f.mapId) || 'villa' : 'villa');
  L.boardHere = (who, f) => { const s = RQ() && RQ().SPECS[who]; if (!s) return null; if (s.places) { const z = zoneOf(f); return s.places[z] ? RQ().spec(who, z) : null; } return RQ().spec(who); };
  // free tiles she can walk to, 2-7 steps from the friend: each pile a little cluster (one thing per tile, so she can see
  // and count them), the clusters apart from each other -> every tile used
  L.scatter = function (f, req, who) {
    const C = G.carry, n = f.npc(who) || f.player, p = f.player, seen = new Set([p.x + ',' + p.y]), q = [[p.x, p.y]], cand = [];
    for (let i = 0; i < q.length && i < 4000; i++) {
      const [x, y] = q[i];
      const d = Math.abs(x - n.x) + Math.abs(y - n.y);
      if (d >= 2 && d <= 7 && C.canLie(f, x, y, req.thing) && !C.lying(f.mapId, x, y).length && !(x === p.x && y === p.y)) cand.push([x, y]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || f.blocked(nx, ny, p) || f.exitAt(nx, ny) || Math.abs(nx - n.x) + Math.abs(ny - n.y) > 10) continue; seen.add(k); q.push([nx, ny]); }
    }
    const used = new Set(), key = (x, y) => x + ',' + y, out = [], seeds = [];
    const freeC = () => cand.filter(([x, y]) => !used.has(key(x, y)));
    for (const c of req.tray) {
      const far = freeC().filter(([x, y]) => seeds.every(([a, b]) => Math.abs(a - x) + Math.abs(b - y) >= 4));
      const L1 = far.length ? far : freeC(); if (!L1.length) break;
      const seed = L1[Math.floor(G.rand() * L1.length)]; seeds.push(seed);
      const mine = [seed]; used.add(key(...seed));
      while (mine.length < c.n) { // its neighbours, nearest first
        const nb = freeC().filter(([x, y]) => mine.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) === 1));
        if (!nb.length) break;
        const t = nb[0]; mine.push(t); used.add(key(...t));
      }
      mine.forEach(([x, y], i) => {
        C.place(f.mapId, c.thing, c.col, x, y, i === mine.length - 1 ? c.n - mine.length + 1 : 1); out.push([x, y]); // (no room: the rest on the last tile)
        const sx = x * T + 12 - Math.round(f.cam.x), sy = y * T + 10 - Math.round(f.cam.y);
        for (let k = 0; k < 3; k++) G.fx.twinkle(sx + (G.rand() - 0.5) * 18, sy + (G.rand() - 0.5) * 14);
      });
    }
    return out;
  };
  const keep = req => ({ tpl: req.tpl, kind: req.kind, thing: req.thing, col: req.col || null, num: req.num || null, n: req.n, say: req.say, text: req.text, np: req.np, npText: req.npText, words: req.words.slice(), dims: Object.assign({}, req.dims), tested: Object.assign({}, req.tested), tray: req.tray.map(c => ({ thing: c.thing, col: c.col, n: c.n, right: !!c.right })) });
  // the favour starts: the things appear around, then the request (spoken; written without its words' pictures)
  L.carryStart = function* (v, f) {
    const spec = L.boardHere(v.who, f); if (!spec) return false;
    const req = RQ().make(spec, { focus: v.word, carry: true }); if (!req) return false;
    yield say(v.who, { icon: 'escucha' }, TT('¡{name}! ¡Mira! ¡Escucha!', 'Look! Listen to what I ask, then bring it to me.'));
    const at = L.scatter(f, req, v.who); if (!at.length) return false;
    G.audio.sfx('chime'); yield 24;
    v.req = Object.assign(keep(req), { map: f.mapId, at, tried: false, shown: false });
    v.on = true; G.st.autosave();
    yield* L.ask(v);
    return true;
  };
  L.ask = function* (v) { yield G.say([{ t: v.req.text, en: L.en(v.req) }], { portrait: G.portraitOf(v.who), name: G.nameOf(v.who), who: v.who, noPic: true }); };
  // a talk while it's going on, holding nothing of it: the request again (as often as she likes: no penalty)
  L.carryRemind = function* (v) { if (v.req) yield* L.ask(v); };
  // she brings what she holds: the first time is the one that counts (the model, the history)
  L.carryCheck = function* (v, f, h) {
    const req = v.req, items = Array.from({ length: h.n }, () => ({ thing: h.id, col: h.col || null, size: null })), res = RQ().check(req, items);
    if (!req.tried) {
      req.tried = true; req.first = res.ok;
      const n = f.npc(v.who), at = n ? [n.x * T + 12 - Math.round(f.cam.x), n.y * T - 10 - Math.round(f.cam.y)] : [G.W / 2, 90];
      L.credit(req, res, { at, quiet: !res.ok });
    }
    const done = function* (ok) {
      if (RQ()) RQ().result(req, !!req.first);
      if (G.hist && G.hist.listenDone) G.hist.listenDone(ok, !!req.first, req.say);
      G.favores.reward(v); v.req = Object.assign(req, { done: true });
    };
    if (res.ok) {
      for (let i = 0; i < h.n; i++) G.errands.bag.take(h.id, { col: h.col || undefined, q: null });
      G.audio.jingle('item');
      yield say(v.who, { icon: WD(h.id).icon, col: h.col ? RQ().colHex(h.col) : undefined, count: h.n }, TT(req.first ? '¡Sí! ¡[gracias:Gracias], {name}!' : '¡Sí! ¡Eso es! ¡[gracias:Gracias]!', 'Yes! That\'s it! Thank you, {name}!'));
      yield* done(true);
      return true;
    }
    if (!req.shown) { // gently: what she has isn't it; the right one, shown and said; then one more try
      req.shown = true; G.st.autosave();
      const right = { icon: WD(req.thing).icon, col: req.col ? RQ().colHex(req.col) : undefined, count: req.n || 1 };
      yield say(v.who, right, TT('¡Casi! ' + req.npText, 'Almost! This is what I asked for: ' + req.words.map(enOf).join(' + ') + '. Bring me these!'));
      return true;
    }
    yield say(v.who, null, TT('¡[gracias:Gracias], {name}!', 'Thank you anyway, {name}!'));
    yield* done(false);
    return true;
  };
  // where the guide points while it's going on (a hint, after a while): her friend once she holds the thing, else
  // every pile still lying about (a choice: never only the right one)
  L.carryTargets = function (f, v) {
    const req = v.req; if (!req || !f) return [];
    const h = G.carry && G.carry.held();
    if (h && h.id === req.thing) { const n = f.npc(v.who); return n ? [{ x: n.x * T + 12, y: n.y * T + 12, npc: true }] : []; }
    if (f.mapId !== req.map) return [];
    return (req.at || []).filter(([x, y]) => G.carry.lying(f.mapId, x, y).some(g => g.id === req.thing)).map(([x, y]) => ({ x: x * T + 12, y: y * T + 12, secret: true })); // (secret: the hint hand never picks one)
  };
  // the outermost talk of everyone (wrapped once all the content has loaded): what she brings for a 'carry' favour is
  // checked first (before a present they'd like, Lola's shell collection...), unless the story has something for them
  L.carryTalk = function* (who, f) {
    const FV = G.favores; if (!FV || !FV.mine || !G.state) return false;
    const v = FV.mine(who); if (!v || v.kind !== 'carry' || !v.on || !v.req || v.req.done || FV.storyHas(who)) return false;
    const h = G.carry && G.carry.held(); if (!h || h.id !== v.req.thing) return false;
    yield* L.carryCheck(v, f, h);
    return true;
  };

  // =====================================================================
  //  The favours (src/favores.js): who asks, on which board; the kinds 'listen' (the tray) and 'carry' (the world)
  // =====================================================================
  if (G.favores) {
    const FV = G.favores, zv = z => () => !!G.zones && G.zones.visited(z);
    FV.OFFERS.push(
      ['pepe', 'listen', null], ['nico', 'listen', null], ['lucia', 'carry', null, () => !!G.chapters && G.chapters.done('c15')],
      ['lola', 'carry', null], ['lupe', 'listen', null, zv('bosque')], ['elena', 'listen', null, zv('bosque')],
      ['abuelo', 'listen', null, zv('abuelos')], ['mateo', 'listen', null, zv('montana')]);
    FV.GROUP.listen = FV.GROUP.carry = 'listen'; FV.CAP.listen = 2; // (two a day at most, in all: not spammy)
    FV.OFF.listen = FV.OFF.carry = () => !L.on();
    FV.BUBBLE.listen = FV.BUBBLE.carry = { icon: 'escucha' };
    FV.ON.carry = v => (v.req && !v.req.done ? { icon: 'escucha' } : null);
    // the day's word: a due known word one of their boards can ask about
    const pickFor = (who, ok) => {
      const s = RQ().SPECS[who]; if (!s) return null;
      const boards = s.places ? Object.keys(s.places).map(z => RQ().spec(who, z)) : [RQ().spec(who)];
      const words = new Set(); boards.forEach(b => RQ().words(b).forEach(w => words.add(w)));
      return G.review.next({ minStage: 2, filter: id => words.has(id) && ok(id) && boards.some(b => RQ().feasible(b, id)) }) || null;
    };
    FV.PICK.listen = FV.PICK.carry = (who, pool, ok) => pickFor(who, ok);
    FV.KIND.listen = function* (v, f) {
      const spec = L.boardHere(v.who, f) || RQ().spec(v.who);
      if (!RQ().make(spec, { focus: v.word })) { v.done = true; G.st.autosave(); return; } // (nothing she knows to ask for after all)
      yield say(v.who, { icon: 'escucha' }, TT('¡{name}! ¿Me ayudas? ¡Escucha!', 'Can you help me? Listen to what I ask, then do it.'));
      yield* L.round(spec, { who: v.who, focus: v.word, n: 2 });
      FV.reward(v);
      yield say(v.who, null, TT('¡[gracias:Gracias], {name}!', 'Thank you, {name}!'));
    };
    FV.KIND.carry = function* (v, f) {
      if (yield* L.carryStart(v, f)) return;
      v.done = true; G.st.autosave(); // (nothing she knows to ask for here after all: no bubble that leads nowhere)
      yield say(v.who, null, TT('¡Hola, {name}!', 'Hi, {name}!'));
    };
    FV.REMIND.carry = function* (v, f) { yield* L.carryRemind(v, f); };
    FV.TARGETS.carry = (f, v) => L.carryTargets(f, v);
    // Lola's board is the place she's in (shells, leaves, apples): no bubble where she has none
    const a0 = FV.alert;
    FV.alert = function (who) { const r = a0(who); if (r && who === 'lola') { const v = FV.mine('lola'); if (v && v.kind === 'carry' && !v.on && !L.boardHere('lola', G.field)) return null; } return r; };
    const t0 = FV.talk;
    FV.talk = function* (who, f) { if (who === 'lola') { const v = FV.mine('lola'); if (v && v.kind === 'carry' && !v.on && !L.boardHere('lola', f)) return false; } return yield* t0(who, f); };
  }

  // =====================================================================
  //  Wrapping the people (after all the content has loaded): what she brings for a 'carry' favour is checked first
  // =====================================================================
  function wrap(def) {
    if (!def || !def.id || def._ld || def.id === 'canelo' || !def.talk) return;
    def._ld = true;
    const t0 = def.talk, a0 = def.alert, id = def.id;
    def.talk = function* (f, n) {
      if (G.state && L.on() && (yield* L.carryTalk(id, f))) return;
      yield* t0.call(this, f, n);
    };
    def.alert = function () {
      if (G.state && L.on() && G.favores && G.favores.mine) {
        const v = G.favores.mine(id), h = G.carry && G.carry.held();
        if (v && v.kind === 'carry' && v.on && v.req && !v.req.done && h && h.id === v.req.thing && !G.favores.storyHas(id)) return { icon: 'escucha' };
      }
      return a0 ? a0.apply(this, arguments) : null;
    };
  }
  for (const m in G.maps) for (const def of G.maps[m].npcs || []) wrap(def);
})();
