// ===== The end of the day: a sunset over Villa Sol after a good long play, then home to bed and a new morning =====
// G.sessionTime counts the seconds of play since this game was started or opened (it is never saved). After
// G.day.SUNSET_AT the town warms to a sunset, its windows light up and a moon bubble floats over the home door.
// Going home then plays the evening: Mamá's "¡Buenas noches!", the "Hoy" card (the words met or grown today, as
// pictures, and the stars earned today), the night sky, a sunrise and Mamá's "¡Buenos días!"; the game is saved
// and the clock starts again. Nothing is forced: staying out to play changes nothing.
// "Today" is what changed since the session began (a snapshot of the words' stages and the stars), so the save
// format doesn't change. G.debug.sunsetAt (seconds) brings the sunset sooner, for tests and curious grown-ups.
'use strict';
(function () {
  const DY = G.day = {};
  DY.SUNSET_AT = 18 * 60; // seconds of play before the sun goes down
  G.debug = G.debug || {};
  G.sessionTime = 0;
  const HOME = 'casa', TOWN = 'villa', BED = [6, 3]; // where you wake up: beside your bed at home
  const T = (t, en) => ({ t, en });
  let base = null, today = [], glow = 0, bringAt = null;

  // ---------- the session: since the game was started or opened, or since this morning ----------
  function newDay() {
    const st = {}; for (const id in G.data.words) st[id] = G.st.stage(id); // each word's stage this morning (words.js)
    base = { state: G.state, st, stars: G.state.stars | 0, said: G.st.micStars() };
    today = []; G.sessionTime = 0; glow = 0; bringAt = null;
  }
  // an evening chapter is next (chapters.js: C9): the sun goes down sec seconds from now (or sooner, as it was)
  DY.bring = sec => { const at = G.sessionTime + sec; if (bringAt == null || at < bringAt) bringAt = at; };
  DY.brought = () => bringAt != null;
  DY.sunsetAt = () => Math.min(G.debug && G.debug.sunsetAt != null ? G.debug.sunsetAt : DY.SUNSET_AT, bringAt == null ? 1e9 : bringAt);
  DY.over = () => !!(G.state && G.state.flags.intro) && G.sessionTime >= DY.sunsetAt();
  // words met or grown a stage today (in that order), stars earned today and how many of them were speaking stars
  const sweep = () => { for (const id in G.state.words) if (today.indexOf(id) < 0 && G.st.stage(id) > (base.st[id] | 0)) today.push(id); };
  DY.today = () => base && base.state === G.state && (sweep(), 1) ? { words: today.slice(), stars: Math.max(0, (G.state.stars | 0) - base.stars), said: Math.max(0, (G.st.micStars()) - base.said) } : { words: [], stars: 0, said: 0 };
  // core.js, every frame: the clock runs while a game is on (a map is in the scene stack, maybe under a talk)
  DY.step = function () {
    const f = G.field;
    if (!f || !G.state || G.scenes.indexOf(f) < 0) return;
    if (!base || base.state !== G.state) newDay(); // a new game, or one just opened: a new session
    G.sessionTime += 1 / 60;
    if (G.words) G.words.step(); // the word model's play clock (words.js)
    if (G.frame % 30 === 0) sweep();
    glow = G.clamp(glow + (DY.over() ? 1 / 480 : -1 / 30), 0, 1); // the sun goes down over ~8 s
  };
  DY.glow = () => glow;
  // the home door, while it has its moon bubble (hint.js points there too)
  DY.homeDoor = f => (f && f.mapId === TOWN && DY.over() ? G.MAPDATA.villa.pos.casaDoor : null);

  // ---------- drawing over Villa Sol (field.js, after the people, before their bubbles) ----------
  DY.drawField = function (ctx, f, cx, cy) {
    if (f.mapId !== TOWN || glow <= 0) return;
    const TS = G.TILE;
    ctx.save();
    // a warm wash: orange light from the west at the top, a dusky violet below
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = glow;
    const g = ctx.createLinearGradient(0, 0, G.W, G.H);
    g.addColorStop(0, '#ffb070'); g.addColorStop(0.55, '#f09898'); g.addColorStop(1, '#9c84d0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = glow * 0.3;
    const h = ctx.createRadialGradient(0, 0, 10, 0, 0, 260);
    h.addColorStop(0, '#ff9840'); h.addColorStop(1, 'rgba(255,152,64,0)');
    ctx.fillStyle = h; ctx.fillRect(0, 0, G.W, G.H);
    ctx.restore();
    // windows light up, lamps glow
    const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS);
    ctx.save(); ctx.globalAlpha = glow;
    for (let y = y0; y <= y0 + Math.ceil(G.H / TS) + 1; y++) for (let x = x0; x <= x0 + Math.ceil(G.W / TS) + 1; x++) {
      const c = f.map.get(x, y), sx = x * TS - cx, sy = y * TS - cy;
      if (c === 'N') { // the window of a house wall (tiles.js): two lit panes each side of the cross
        ctx.fillStyle = 'rgba(255,200,96,0.35)'; ctx.fillRect(sx + 6, sy + 2, 12, 14);
        for (const [px, py] of [[8, 4], [13, 4], [8, 10], [13, 10]]) { ctx.fillStyle = '#ffd868'; ctx.fillRect(sx + px, sy + py, 3, 4); ctx.fillStyle = '#fff4c0'; ctx.fillRect(sx + px, sy + py, 1, 1); }
      } else if (c === 'L') { // a lamp post
        const r = ctx.createRadialGradient(sx + 12, sy + 2, 1, sx + 12, sy + 2, 16);
        r.addColorStop(0, 'rgba(255,236,150,0.85)'); r.addColorStop(1, 'rgba(255,200,96,0)');
        ctx.fillStyle = r; ctx.fillRect(sx - 6, sy - 14, 36, 34);
      }
    }
    ctx.restore();
    const d = DY.homeDoor(f); if (d) moonBubble(ctx, d[0] * TS - cx + 12, d[1] * TS - cy - 30, f.t);
  };
  // a crescent moon (cached), drawn r px round
  const moon = r => G.cached('day_moon' + r, r * 2 + 2, r * 2 + 2, c => {
    c.fillStyle = '#f8e478'; c.beginPath(); c.arc(r + 1, r + 1, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff8c8'; c.beginPath(); c.arc(r - r * 0.25, r + 1 - r * 0.2, r * 0.45, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(r + 1 + r * 0.55, r + 1 - r * 0.4, r * 0.85, 0, Math.PI * 2); c.fill();
  });
  // a night-blue thought bubble with the moon in it, trailing down to the door's sign: "time to go home"
  function moonBubble(ctx, x, y, t) {
    const b = Math.round(Math.sin(t / 14) * 2); y += b;
    const puffs = [[-8, 2, 7], [0, -3, 9], [8, 2, 7], [0, 5, 7]], blob = (grow, col) => { ctx.fillStyle = col; for (const [dx, dy, r] of puffs) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r + grow, 0, Math.PI * 2); ctx.fill(); } };
    blob(2, '#101030'); blob(1, '#e8ecff'); blob(0, '#283078');
    for (const [dx, dy, r] of [[7, 15, 2.5], [10, 21, 1.5]]) { ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(x + dx, y + dy - b / 2, r + 1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#283078'; ctx.beginPath(); ctx.arc(x + dx, y + dy - b / 2, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.drawImage(moon(6), Math.round(x - 9), Math.round(y - 6));
    const tw = (t >> 4) % 3;
    ctx.fillStyle = '#fff8c0';
    [[6, -5], [9, 3], [3, 6]].forEach(([dx, dy], k) => { if (k !== tw) { ctx.fillRect(x + dx, y + dy, 1, 1); } else { ctx.fillRect(x + dx - 1, y + dy, 3, 1); ctx.fillRect(x + dx, y + dy - 1, 1, 3); } });
  }

  // ---------- home at sunset: the evening, the night and a new morning ----------
  // maps.js runs this when you come home (and when you talk to Mamá at home after sunset).
  DY.evening = function* (f) {
    if (!f || f.mapId !== HOME || f.evening || !DY.over()) return;
    f.evening = true; f.locked = true; f.banner = null; // this field's own guard: it can't start twice
    while (G.fade.a > 0) yield 1;
    yield 12;
    f.player.dir = 'up';
    const mama = { portrait: G.portraitOf('mama'), name: G.nameOf('mama'), who: 'mama' }, met = id => G.st.seen(id);
    // the story's evening (chapters.js: C9 teaches agua, cama and buenas noches here), else Mamá's good night
    if (!(G.chapters && (yield* G.chapters.evening('dusk', f)))) {
      if (met('buenasnoches')) yield* G.chapters.ask('mama', '¡...!', 'The moon is out: Mom says good night. Say it back!', 'buenasnoches', met('buenosdias') ? ['buenosdias'].concat(met('cama') ? ['cama'] : met('hola') ? ['hola'] : []) : ['hola'], { show: { icon: 'noche' } });
      else yield G.say(T('¡[buenasnoches], {name}!', 'Good night, {name}!'), mama);
    }
    yield DY.todayCard();
    G.audio.play('inn', true); // a little lullaby
    yield G.fadeTo(1, 0.03, '#080a26');
    Object.assign(f.player, { x: BED[0], y: BED[1], dir: 'left', ox: 0, oy: 0 }); f.snapCam();
    if (G.pet) G.pet.night(f); // Canelo curls up on his cushion (pet.js)
    yield DY.night(); // the night sky, then the sunrise (it fades itself in and out)
    newDay(); if (G.words) G.words.newSession('night'); // a new day for the word model too: yesterday's words come back
    G.audio.play(f.def.music || 'town', true);
    yield G.fadeTo(0, 0.04, '#fff2d0'); // out of the morning light (the night left the fade there)
    if (G.pet) G.pet.morning(f); // and Canelo hops up
    yield 16;
    // the morning: the story's (C9's last beat), else Mamá's good morning under the sun, once buenos días is met
    if (!(G.chapters && (yield* G.chapters.evening('dawn', f)))) {
      if (met('buenosdias')) {
        const plain = G.words.list(2).filter(id => G.data.words[id].topic !== 'saludos' && G.iconDrawn(id)).sort(() => G.rand() - 0.5);
        const others = met('buenasnoches') ? ['buenasnoches'].concat(plain.slice(0, 1)) : plain.slice(0, 2);
        if (others.length) yield* G.chapters.ask('mama', '¡...!', 'The sun is up: Mom says good morning. Say it back!', 'buenosdias', others, { show: { icon: 'sol' } });
      } else yield G.say(T('¡{name}!', '{name}! (a new day)'), mama);
    }
    f.locked = false; f.evening = false;
    if (G.st.autosave) G.st.autosave();
  };

  // ---------- "Hoy": today's words, as pictures, and today's stars ----------
  // Pictures pop in one by one, each said aloud; then the stars. Tap a picture (or left / right) to hear it
  // again; a tap anywhere else, A or B goes on. A tap while they're still coming shows them all at once.
  function star(ctx, x, y, r) { // a gold star centred on x, y
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#2a1404'; ctx.stroke();
    ctx.fillStyle = '#f8c820'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#fff090'; ctx.fillRect(x - r, y - r, r * 2, r * 0.9); ctx.restore();
  }
  class TodayCard {
    constructor(w) {
      G.toastT = 0; this.transparent = true; this.w = w; this.t = 0; this.sel = -1; this.shown = 0; this.wait = 0; this.popT = [];
      const d = DY.today(); this.words = d.words; this.stars = d.stars; this.said = Math.min(d.said, d.stars); this.starsShown = 0; this.starT = [];
      const n = this.words.length, big = n <= 10;
      this.L = { big, s: big ? 32 : 16, step: big ? 44 : 24, per: big ? 5 : 10, gap: big ? 12 : 8, rows: Math.ceil(n / (big ? 5 : 10)) };
    }
    onEnter() { G.audio.sfx('buff'); }
    nStars() { return Math.min(this.stars, 10); }
    // the card, sized to what it holds: the title, the pictures (or your face), the word said, the stars
    box() {
      const L = this.L, pics = this.words.length ? L.rows * (L.s + L.gap) : 58, h = 34 + pics + 22 + (this.stars ? 28 : 0) + 6;
      return { x: 44, y: Math.round((G.H - h) / 2), w: G.W - 88, h, pics };
    }
    // tap areas (shared with draw): one per picture
    cells() {
      const L = this.L, n = this.words.length, b = this.box();
      return this.words.map((id, k) => {
        const r = Math.floor(k / L.per), c = k % L.per, inRow = Math.min(L.per, n - r * L.per), x0 = Math.round(G.W / 2 - (inRow * L.step - (L.step - L.s)) / 2);
        return { x: x0 + c * L.step, y: b.y + 38 + r * (L.s + L.gap), w: L.s, h: L.s, s: L.s / 16 };
      });
    }
    revealed() { return this.shown >= this.words.length && this.starsShown >= this.nStars(); }
    say(k) { this.sel = k; G.speak(G.baseForm(this.words[k])); }
    hintXY() { if (!this.revealed() || this.wait < 30) return null; const b = this.box(); return [b.x + b.w - 13, b.y + b.h - 9]; }
    update() {
      this.t++;
      if (this.t < 16) return;
      if (!this.revealed()) { // a picture every 50 frames (said aloud), then the stars quickly
        if (this.shown < this.words.length) { if ((this.t - 16) % 50 === 0) { this.popT[this.shown] = this.t; this.say(this.shown); this.shown++; G.audio.sfx('select'); } }
        else if (this.t % 7 === 0) { this.starT[this.starsShown++] = this.t; G.audio.sfx('coin'); }
        if (G.input.p('A') || G.input.p('B') || G.input.tap()) { // all at once
          while (this.shown < this.words.length) this.popT[this.shown++] = this.t;
          while (this.starsShown < this.nStars()) this.starT[this.starsShown++] = this.t;
          this.wait = 0;
        }
        return;
      }
      this.wait++;
      const n = this.words.length, d = G.input.repDir(14, 6);
      if (n && (d === 'left' || d === 'right')) { this.say(((this.sel < 0 ? (d === 'left' ? 0 : -1) : this.sel) + (d === 'left' ? -1 : 1) + n) % n); G.audio.sfx('cursor'); }
      if (G.input.p('C') && this.sel >= 0) this.say(this.sel);
      if (this.wait < 20) return;
      const tap = G.input.tap(), k = tap ? this.cells().findIndex(r => G.tapIn(r.x - 4, r.y - 4, r.w + 8, r.h + 8)) : -1;
      if (k >= 0) { this.say(k); G.audio.sfx('cursor'); return; }
      if (G.input.p('A') || G.input.p('B') || tap) { G.audio.sfx('ok'); G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const b = this.box(), pop = Math.min(1, this.t / 10), dy = Math.round((1 - pop) * 24), y = b.y + dy;
      ctx.fillStyle = 'rgba(4,6,24,' + (0.55 * pop) + ')'; ctx.fillRect(0, 0, G.W, G.H); // the room goes dim
      ctx.globalAlpha = pop;
      G.win(ctx, b.x, y, b.w, b.h, { fill1: '#2c3a9c', fill2: '#141c58', alpha: 1 });
      // the sun and the moon around "¡Hoy!"
      G.drawIcon16(ctx, 'sol', G.W / 2 - 54, y + 8);
      ctx.drawImage(moon(7), G.W / 2 + 38, y + 8);
      G.bigText(ctx, '¡Hoy!', G.W / 2, y + 12, 2, '#f8e060');
      const hh = G.hearts ? G.hearts.today() : 0; // Round B: hearts from friends today (hearts.js)
      if (hh) { G.hearts.heart(ctx, b.x + 10, y + 9, true, 2); G.text(ctx, String(hh), b.x + 27, y + 13, '#f8a8c8'); }
      ctx.globalAlpha = 1;
      if (!this.words.length) { // nothing new today: your smile anyway
        ctx.fillStyle = '#f8e060'; ctx.fillRect(G.W / 2 - 27, y + 37, 54, 54);
        G.drawPortrait(ctx, G.st.playerSpec().portrait, G.W / 2 - 26, y + 38, this.t);
      }
      this.cells().forEach((r, k) => {
        if (k >= this.shown) return;
        const sel = k === this.sel, a = Math.min(1, (this.t - this.popT[k]) / 8), hop = Math.round((1 - a) * 6) + (sel ? Math.round(Math.abs(Math.sin(this.t / 7)) * -2) : 0);
        ctx.globalAlpha = a; G.drawIcon16(ctx, this.words[k], r.x, r.y + dy + hop, r.s, sel ? 'sel' : 'card'); ctx.globalAlpha = 1;
      });
      // the word just said (or picked), big and gold
      const ly = y + 34 + b.pics + 4;
      if (this.sel >= 0) G.bigText(ctx, G.baseForm(this.words[this.sel]), G.W / 2, ly, 2, '#f8d860');
      else if (!this.words.length) G.bigText(ctx, G.fill('¡Muy bien, {name}!'), G.W / 2, ly, 2, '#f8d860');
      // the stars earned today, popping in one by one (past ten: one star and the number)
      const sy = ly + 30, ns = this.nStars();
      // (speaking stars, said out loud with the mic, come last, with sound waves: past ten, a mic and their number)
      if (this.stars > 10 && this.starsShown) {
        star(ctx, G.W / 2 - 22 - (this.said ? 18 : 0), sy, 9); G.bigText(ctx, String(this.stars), G.W / 2 + 12 - (this.said ? 18 : 0), sy - 7, 2, '#f8d030');
        if (this.said) { G.mic.glyph(ctx, G.W / 2 + 26, sy - 4, '#70e0ff'); G.text(ctx, String(this.said), G.W / 2 + 36, sy - 3, '#a8f0ff'); }
      } else for (let i = 0; i < this.starsShown; i++) {
        const a = (this.t - this.starT[i]) / 8, sc = a >= 1 ? 1 : a < 0.6 ? a / 0.6 * 1.3 : 1.3 - (a - 0.6) / 0.4 * 0.3, sx = G.W / 2 - (ns - 1) * 10 + i * 20;
        if (sc > 0.1) star(ctx, sx, sy, 8 * sc);
        if (sc > 0.1 && i >= ns - this.said) G.mic.waves(ctx, sx, sy, 8 * sc + 1, '#70e0ff', 1, 0);
      }
      if (this.revealed() && this.wait >= 20 && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', b.x + b.w - 16, y + b.h - 13, '#f8e060');
    }
  }
  DY.todayCard = function () { const w = new G.Wait(); G.push(new TodayCard(w)); return w; };

  // ---------- the night: stars, the moon, lights out, "z z z", then the sun comes up ----------
  const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  class Night {
    constructor(w) { this.w = w; this.t = 0; this.phase = 0; this.pt = 0; }
    onEnter() { G.fadeTo(0, 0.04, '#080a26'); } // out of the evening's dark blue
    update() {
      this.t++; this.pt++;
      const go = G.input.p('A') || G.input.p('B') || !!G.input.tap();
      if (this.phase === 0 && (this.pt > 210 || (go && this.pt > 40))) { this.phase = 1; this.pt = 0; G.audio.sfx('heal'); }
      else if (this.phase === 1 && (this.pt > 150 || (go && this.pt > 30))) { this.phase = 2; this.pt = 0; G.fadeTo(1, 0.05, '#fff2d0'); }
      else if (this.phase === 2 && G.fade.a >= 1) { G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const d = this.phase === 0 ? 0 : this.phase === 1 ? Math.min(1, this.pt / 120) : 1; // dawn, 0..1
      const sky = ctx.createLinearGradient(0, 0, 0, 170);
      sky.addColorStop(0, mix('#060820', '#5878d0', d)); sky.addColorStop(0.6, mix('#182058', '#f8b080', d)); sky.addColorStop(1, mix('#2a3270', '#ffe8a8', d));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, G.W, G.H);
      for (let i = 0; i < 46; i++) { // twinkling stars, fading at dawn
        const sx = (i * 89 + 31) % G.W, sy = (i * 47 + 11) % 150, tw = Math.sin(this.t / 12 + i * 1.7);
        ctx.globalAlpha = (1 - d) * (0.55 + 0.45 * tw); ctx.fillStyle = i % 5 ? '#e8ecff' : '#fff4b0';
        ctx.fillRect(sx, sy, 1, 1); if (i % 7 === 0 && tw > 0.6) { ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); }
      }
      ctx.globalAlpha = 1 - d; ctx.drawImage(moon(16), 236, Math.round(26 + d * 50)); ctx.globalAlpha = 1;
      if (d > 0) { // the sun rises behind the hills
        const sx = 76, sy = Math.round(176 - d * 62), r = 16;
        const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 60); glow.addColorStop(0, 'rgba(255,240,170,' + 0.7 * d + ')'); glow.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, G.W, G.H);
        ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff8c8'; ctx.beginPath(); ctx.arc(sx - 4, sy - 4, 6, 0, Math.PI * 2); ctx.fill();
      }
      // hills, far and near
      const hill = (col, base, amp, k) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, G.H); for (let x = 0; x <= G.W; x += 8) ctx.lineTo(x, base - Math.sin(x / k) * amp - Math.sin(x / (k * 0.37)) * amp * 0.3); ctx.lineTo(G.W, G.H); ctx.fill(); };
      hill(mix('#141a40', '#78a858', d), 170, 10, 46); hill(mix('#0c1030', '#4c8840', d), 190, 6, 30);
      // home, with its window lit until lights out
      const hx = 160, hy = 192, wall = mix('#1e2048', '#f0d8a8', d), roof = mix('#141432', '#c85838', d);
      ctx.fillStyle = wall; ctx.fillRect(hx - 30, hy - 34, 60, 34);
      ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(hx - 38, hy - 32); ctx.lineTo(hx, hy - 58); ctx.lineTo(hx + 38, hy - 32); ctx.fill();
      ctx.fillStyle = mix('#0c0c20', '#7a4a28', d); ctx.fillRect(hx - 6, hy - 18, 12, 18); // door
      ctx.fillRect(hx + 18, hy - 56, 7, 14); // chimney
      const lit = this.phase === 0 && this.pt < 80;
      ctx.fillStyle = lit ? '#ffd868' : mix('#283060', '#a8d8f8', d); ctx.fillRect(hx - 24, hy - 26, 12, 10); ctx.fillRect(hx + 12, hy - 26, 12, 10);
      if (lit) { ctx.fillStyle = 'rgba(255,216,104,0.25)'; ctx.fillRect(hx - 28, hy - 30, 20, 18); ctx.fillRect(hx + 8, hy - 30, 20, 18); }
      ctx.fillStyle = mix('#141432', '#7a4a28', d); ctx.fillRect(hx - 19, hy - 26, 2, 10); ctx.fillRect(hx + 17, hy - 26, 2, 10);
      if (this.phase === 0 && this.pt >= 90) for (let k = 0; k < 3; k++) { // z z z, drifting up from the window
        const a = ((this.pt - 90) / 70 + k / 3) % 1, zx = hx + 26 + Math.sin(a * 6 + k) * 4 + a * 18, zy = hy - 36 - a * 54;
        ctx.globalAlpha = Math.min(1, (1 - a) * 2); G.bigText(ctx, 'z', zx, zy, 1 + (k === 1 ? 1 : 0), '#e8ecff'); ctx.globalAlpha = 1;
      }
    }
  }
  DY.night = function () { const w = new G.Wait(); G.push(new Night(w)); return w; };
})();
