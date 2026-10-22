// ===== The end of the day: a sunset over Villa Sol, then home to bed and a new morning, all in a 15-minute sitting =====
// G.sessionTime counts the seconds of play since this game was started or opened, or since this morning (it is never
// saved). After G.day.SUNSET_AT (12.5 minutes), or sooner: a minute after the day's story is done when that's after
// DY.EARLY, 6 minutes (a chapter whose line then waits for the morning, or has no more: chapters.js calls DY.storyDone;
// a story done sooner leaves the open world until the usual sunset, so the story keeps its pace), the town warms to a
// sunset, its windows light up and a moon bubble floats over the home door. Going home then plays the evening: Mamá's
// "¡Buenas noches!", the "Hoy" card (the words met or grown today, as their growing word cards), then, while a night
// animal she hasn't met lives in a place she's been to, two big pictures: to bed, or a short night walk there (DY.walk:
// the bus at night, the guide's arrow on the animal; once she's found it, or after DY.WALK_MAX, back home to bed); then
// the night sky, a sunrise and Mamá's "¡Buenos días!"; the game is saved and the clock starts again.
// Nothing is forced: staying out to play changes nothing, and the bed is the picture already chosen.
// "Today" counts by calendar date: a game opened again later the same day still has the whole day's words and stars
// (a night at home starts a new day). Saved compact in G.state.hist.hoy = {d: 'YYYY-M-D', w: [ids grown today, in
// order], s: stars, m: speaking stars at the day's start}; each session snapshots the words' stages in memory to see
// what grows. G.debug.sunsetAt (seconds) brings the sunset sooner, for tests and curious grown-ups.
'use strict';
(function () {
  const DY = G.day = {};
  DY.SUNSET_AT = 12.5 * 60; // seconds of play before the sun goes down (15 minutes a day: the evening fits in)
  DY.EARLY = 6 * 60;        // the day's story done after this much play: the sun goes down DY.AFTER seconds later
  DY.AFTER = 60;
  DY.WALK_MAX = 180;        // a night walk: back home to bed after this long (seconds), the animal found or not
  DY.HOY_MAX = 44;          // words the Hoy card holds (4 rows of 11)
  G.debug = G.debug || {};
  G.sessionTime = 0;
  const HOME = 'casa', TOWN = 'villa', BED = [6, 3], NIGHT = '#080a26'; // where you wake up: beside your bed at home
  const T = (t, en) => ({ t, en });
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  let base = null, glow = 0, bringAt = null;
  DY.walk = null; // the night walk going on: {zone, map, kinds, t, found, calm, back}

  // ---------- the session: since the game was started or opened, or since this morning ----------
  // night: the morning after a night at home (a new day, even on the same date); else a game opened: today goes on
  function newDay(night) {
    const st = {}; for (const id in G.data.words) st[id] = G.st.stage(id); // each word's stage now (words.js)
    const h = G.hist ? G.hist.state() : {}, td = G.today();
    if (night || !isObj(h.hoy) || h.hoy.d !== td || !Array.isArray(h.hoy.w)) h.hoy = { d: td, w: [], s: G.state.stars | 0, m: G.st.micStars() };
    base = { state: G.state, st, hoy: h.hoy };
    G.sessionTime = 0; glow = 0; bringAt = null; DY.walk = null;
  }
  // an evening chapter is next (chapters.js: C9): the sun goes down sec seconds from now (or sooner, as it was)
  DY.bring = sec => { const at = G.sessionTime + sec; if (bringAt == null || at < bringAt) bringAt = at; };
  DY.brought = () => bringAt != null;
  // the day's story is done (chapters.js: its line waits for the morning, or has no more): after 6 minutes, the evening soon
  DY.storyDone = () => { if (G.sessionTime >= DY.EARLY) DY.bring(DY.AFTER); };
  DY.sunsetAt = () => Math.min(G.debug && G.debug.sunsetAt != null ? G.debug.sunsetAt : DY.SUNSET_AT, bringAt == null ? 1e9 : bringAt);
  DY.over = () => !!(G.state && G.state.flags.intro) && !!base && base.state === G.state && G.sessionTime >= DY.sunsetAt(); // (a game just opened: its clock starts at its first frame)
  // words met or grown a stage today (in that order), stars earned today and how many of them were speaking stars
  const sweep = () => { const w = base.hoy.w; for (const id in G.state.words) if (w.length < DY.HOY_MAX && w.indexOf(id) < 0 && G.st.stage(id) > (base.st[id] | 0)) w.push(id); };
  DY.sweep = () => { if (base && base.state === G.state) sweep(); }; // (state.js, before each save)
  DY.today = function () {
    if (!base || base.state !== G.state) return { words: [], stars: 0, said: 0 };
    sweep(); const r = base.hoy;
    return { words: r.w.filter(id => G.data.words[id]), stars: Math.max(0, (G.state.stars | 0) - (+r.s || 0)), said: Math.max(0, G.st.micStars() - (+r.m || 0)) };
  };
  // core.js, every frame: the clock runs while a game is on (a map is in the scene stack, maybe under a talk)
  DY.step = function () {
    const f = G.field;
    if (!f || !G.state || G.scenes.indexOf(f) < 0) return;
    if (!base || base.state !== G.state || (G.frame % 600 === 0 && base.hoy.d !== G.today() && !f.evening && !DY.walk)) newDay(); // a new game, one just opened, or one left open overnight: a new session
    G.sessionTime += 1 / 60;
    if (G.words) G.words.step(); // the word model's play clock (words.js)
    if (G.frame % 30 === 0) sweep();
    glow = G.clamp(glow + (DY.over() ? 1 / 480 : -1 / 30), 0, 1); // the sun goes down over ~8 s
    walkStep(f);
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
  // a night-blue thought bubble with the moon in it, trailing down to the door's sign: "time to go home"; sleepy: "z z"
  // drifting up out of it too (field.js G.drawAlert: a chapter's giver whose chapter opens after the night)
  function moonBubble(ctx, x, y, t, sleepy) {
    const b = Math.round(Math.sin(t / 14) * 2); y += b;
    const puffs = [[-8, 2, 7], [0, -3, 9], [8, 2, 7], [0, 5, 7]], blob = (grow, col) => { ctx.fillStyle = col; for (const [dx, dy, r] of puffs) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r + grow, 0, Math.PI * 2); ctx.fill(); } };
    blob(2, '#101030'); blob(1, '#e8ecff'); blob(0, '#283078');
    for (const [dx, dy, r] of [[7, 15, 2.5], [10, 21, 1.5]]) { ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(x + dx, y + dy - b / 2, r + 1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#283078'; ctx.beginPath(); ctx.arc(x + dx, y + dy - b / 2, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.drawImage(moon(6), Math.round(x - 9), Math.round(y - 6));
    const tw = (t >> 4) % 3;
    ctx.fillStyle = '#fff8c0';
    [[6, -5], [9, 3], [3, 6]].forEach(([dx, dy], k) => { if (k !== tw) { ctx.fillRect(x + dx, y + dy, 1, 1); } else { ctx.fillRect(x + dx - 1, y + dy, 3, 1); ctx.fillRect(x + dx, y + dy - 1, 1, 3); } });
    if (sleepy) for (let k = 0; k < 2; k++) { // z z, floating up and away
      const a = ((t + k * 45) % 90) / 90;
      ctx.globalAlpha = Math.min(1, (1 - a) * 2); G.text(ctx, 'z', Math.round(x + 10 + a * 8 + Math.sin(a * 6 + k) * 2), Math.round(y - 8 - a * 14), '#e8ecff', '#283078'); ctx.globalAlpha = 1;
    }
  }
  DY.moonBubble = moonBubble;

  // ---------- home at sunset: the evening, the night and a new morning ----------
  // maps.js runs this when you come home (and when you talk to Mamá at home after sunset).
  DY.evening = function* (f) {
    if (!f || f.mapId !== HOME || f.evening || !DY.over()) return;
    f.evening = true; f.locked = true; f.banner = null; // this field's own guard: it can't start twice
    if (DY.walk) { DY.walk = null; yield* sleep(f); return; } // home from the night walk (or on foot): good night was said, to bed
    while (G.fade.a > 0) yield 1;
    yield 12;
    f.player.dir = 'up';
    const mama = { portrait: G.portraitOf('mama'), name: G.nameOf('mama'), who: 'mama' }, met = id => G.st.seen(id);
    // the story's evening (chapters.js: C9 teaches agua, cama and buenas noches here), else Mamá's good night
    const story = !!(G.chapters && (yield* G.chapters.evening('dusk', f)));
    if (!story) {
      if (met('buenasnoches')) yield* G.chapters.ask('mama', '¡...!', 'The moon is out: Mom says good night. Say it back!', 'buenasnoches', met('buenosdias') ? ['buenosdias'].concat(met('cama') ? ['cama'] : met('hola') ? ['hola'] : []) : ['hola'], { show: { icon: 'noche' } });
      else yield G.say(T('¡[buenasnoches], {name}!', 'Good night, {name}!'), mama);
    }
    yield DY.todayCard();
    // a night animal she hasn't met lives in a place she's been to: to bed, or a little night walk there first?
    const z = !story && DY.walkTo();
    if (z && (yield DY.bedOrWalk(z)).result === 'walk') { yield* walkOut(f, z); return; }
    yield* sleep(f);
  };
  function* sleep(f) {
    G.audio.play('inn', true); // a little lullaby
    yield G.fadeTo(1, 0.03, NIGHT);
    Object.assign(f.player, { x: BED[0], y: BED[1], dir: 'left', ox: 0, oy: 0 }); f.snapCam();
    if (G.pet) G.pet.night(f); // Canelo curls up on his cushion (pet.js)
    yield DY.night(); // the night sky, then the sunrise (it fades itself in and out)
    newDay(true); if (G.words) G.words.newSession('night'); // a new game day and session (favours, chapters...); the memory keeps to calendar days, so no word falls due because of the night (words.js)
    G.audio.play(f.def.music || 'town', true);
    yield G.fadeTo(0, 0.04, '#fff2d0'); // out of the morning light (the night left the fade there)
    if (G.pet) G.pet.morning(f); // and Canelo hops up
    yield 16;
    const mama = { portrait: G.portraitOf('mama'), name: G.nameOf('mama'), who: 'mama' }, met = id => G.st.seen(id);
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
  }

  // ---------- the night walk: after the Hoy card, the bus at night to a place with a night animal, then to bed ----------
  // A place's night animals: its album's rare ones at 'noche' (zones.js) and the map each lives on (its animals entry).
  const nightOf = z => {
    const d = G.zones && G.zones.def(z), out = [];
    if (d && d.rare) for (const k in d.rare) if (d.rare[k] === 'noche') { const m = (d.maps || []).find(m => ((G.maps[m] || {}).animals || []).some(c => c.kind === k && c.when === 'noche')); if (m) out.push({ kind: k, map: m }); }
    return out;
  };
  DY.nightOf = nightOf;
  // where a walk would go: a place she's been to with a night animal not met yet (the beach last: its night isn't drawn
  // yet, docs/AUDIT_2026-10.md 3.7), or null (then the evening goes straight on to bed, as before)
  DY.walkTo = function () {
    if (!G.zones || !G.animals || !G.state) return null;
    const L = G.zones.visitedIds().filter(z => nightOf(z).some(n => !G.animals.met(n.kind)));
    return L.find(z => z !== 'playa') || L[0] || null;
  };
  function* walkOut(f, z) {
    const L = nightOf(z).filter(n => !G.animals.met(n.kind));
    DY.walk = { zone: z, map: L[0].map, kinds: L.map(n => n.kind), t: 0, found: null, calm: 0, back: false };
    f.evening = false; glow = 1; // (night: the sun is long down)
    yield* G.zones.ride(f, z); // the bus (from home it just fades): you get off at the stop, the moon up, the night animals out
  }
  // every frame on the walk: once she's found it (and the map is quiet a moment), or after DY.WALK_MAX, home to bed
  function walkStep(f) {
    const w = DY.walk; if (!w || w.back || f.mapId === HOME) return;
    w.t += 1 / 60;
    if (w.found == null && w.kinds.some(k => G.animals.met(k))) w.found = w.t;
    const free = G.top() === f && !f.locked && G.fade.a === 0, quiet = free && !f.player.moving && !f.route && !(G.world && (G.world.bubble || G.world.sayBack));
    w.calm = quiet ? w.calm + 1 : 0;
    if (free && ((w.found != null && w.calm > 150) || (w.t > DY.WALK_MAX && (quiet || w.t > DY.WALK_MAX + 30)))) { w.back = true; f.tasks.add(walkHome(f)); }
  }
  function* walkHome(f) {
    f.locked = true; f.route = null;
    if (G.pet) G.pet.sound('whine'); // (a sleepy yawn)
    yield 30;
    yield G.fadeTo(1, 0.03, NIGHT);
    G.goto(HOME, BED[0], BED[1], 'left'); // (casa's onEnter: DY.evening, straight on to bed)
    G.fadeTo(1, 1, NIGHT); // (it stays dark)
  }
  // the guide (guide.js, first): the arrow on the night animal (or the way to its map) until she's found it
  DY.walkGoal = function (f) {
    const w = DY.walk; if (!w || w.back || !G.animals) return null;
    const left = w.kinds.filter(k => !G.animals.met(k)); if (!left.length) return null;
    for (const k of left) { const a = G.animals.find(k, f); if (a) return { why: 'night walk: ' + k, pts: [{ x: Math.round(a.x), y: Math.round(a.y - 6), lift: 22 }] }; }
    return f.mapId !== w.map ? { why: 'night walk', map: w.map, far: true, badge: { icon: 'noche' } } : null;
  };
  // Two big pictures (like the opener's choice, zones.js), the voice asks "¿A dormir... o a pasear?": your bed with the
  // moon and "z z" (picked already: A, B or a tap on it goes to bed), or the night sky over that place with a dark "?"
  // shape of the animal waiting there, fireflies, and you and the dog walking out.
  class BedOrWalk {
    constructor(w, z) { this.w = w; this.z = G.zones.def(z); this.t = 0; this.sel = 0; this.transparent = true; this.kind = (nightOf(z).find(n => !G.animals.met(n.kind)) || {}).kind; }
    onEnter() { if (G.speak) G.speak('¿A dormir... o a pasear?'); }
    rect(k) { return { x: k ? 170 : 22, y: 40, w: 128, h: 150 }; }
    hintXY() { return null; }
    pick(k) { G.audio.sfx('ok'); if (G.speak) G.speak(k ? '¡A pasear!' : '¡A dormir!'); G.pop(); this.w.resolve(k ? 'walk' : 'bed'); }
    update() {
      this.t++;
      if (this.t < 20) return;
      const tap = G.input.tap();
      if (tap) for (const k of [0, 1]) if (G.tapIn(this.rect(k))) { this.sel = k; this.pick(k); return; }
      const d = G.input.repDir(14, 6); if (d === 'left' || d === 'right') { this.sel = d === 'left' ? 0 : 1; G.audio.sfx('cursor'); }
      if (G.input.p('A')) this.pick(this.sel); else if (G.input.p('B')) this.pick(0);
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(4,6,24,0.6)'; ctx.fillRect(0, 0, G.W, G.H);
      if (G.enVisible()) G.textC(ctx, 'Bed now, or a little night walk to find a night animal?', G.W / 2, 22, '#ffffff', '#10102a');
      for (const k of [0, 1]) {
        const r = this.rect(k), on = this.sel === k, bob = Math.round(Math.sin(this.t / 12 + k * Math.PI) * 2), cx = r.x + r.w / 2, top = r.y + bob, ix = r.x + 8, iy = top + 8, iw = r.w - 16, ih = r.h - 40;
        G.win(ctx, r.x, r.y + bob, r.w, r.h, on ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { alpha: 1 });
        ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
        const sky = ctx.createLinearGradient(0, iy, 0, iy + ih); sky.addColorStop(0, '#0a0e30'); sky.addColorStop(1, k ? '#283478' : '#3a2a5a'); ctx.fillStyle = sky; ctx.fillRect(ix, iy, iw, ih);
        for (let i = 0; i < 14; i++) { const sx = ix + (i * 37 + k * 11) % iw, sy = iy + (i * 23) % 50, tw = Math.sin(this.t / 10 + i * 1.9); ctx.globalAlpha = 0.5 + 0.5 * tw; ctx.fillStyle = '#e8ecff'; ctx.fillRect(sx, sy, 1, 1); }
        ctx.globalAlpha = 1; ctx.drawImage(moon(7), ix + iw - 22, iy + 6);
        ctx.imageSmoothingEnabled = false;
        if (!k) { // your bed, a lamp's glow, "z z" floating up
          const g = ctx.createRadialGradient(cx, iy + ih - 34, 4, cx, iy + ih - 34, 50); g.addColorStop(0, 'rgba(255,214,140,0.45)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(ix, iy, iw, ih);
          G.drawIcon16(ctx, 'cama', cx - 32, iy + ih - 70, 4);
          for (let j = 0; j < 2; j++) { const a = ((this.t + j * 40) % 80) / 80; ctx.globalAlpha = Math.min(1, (1 - a) * 2); G.bigText(ctx, 'z', Math.round(cx + 14 + a * 14), Math.round(iy + ih - 70 - a * 26), 1 + j, '#e8ecff'); ctx.globalAlpha = 1; }
        } else { // the place at night: its picture on the hill, the animal waiting (a dark "?" shape), fireflies, you and the dog
          ctx.fillStyle = '#18264a'; ctx.beginPath(); ctx.ellipse(cx, iy + ih + 18, iw * 0.75, 44, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.85; G.drawIcon16(ctx, this.z.icon, ix + 4, iy + ih - 40, 2); ctx.globalAlpha = 1;
          if (this.kind) { const glow = ctx.createRadialGradient(cx + 18, iy + 46, 2, cx + 18, iy + 46, 26); glow.addColorStop(0, 'rgba(200,210,255,0.5)'); glow.addColorStop(1, 'rgba(200,210,255,0)'); ctx.fillStyle = glow; ctx.fillRect(ix, iy, iw, ih); ctx.drawImage(G.tinted(G.icon(G.animals.KINDS[this.kind] ? G.animals.KINDS[this.kind].word : this.kind), '#0c0e2a', 'nightsil' + this.kind), cx + 2, iy + 30, 32, 32); G.bigText(ctx, '?', cx + 18, iy + 18, 1, '#f8e060'); }
          for (let i = 0; i < 6; i++) { const fx = ix + 10 + (i * 41) % (iw - 20) + Math.sin(this.t / 20 + i) * 4, fy = iy + 40 + (i * 29) % 50 + Math.cos(this.t / 17 + i * 2) * 3; ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(this.t / 15 + i)); ctx.fillStyle = '#f8f070'; ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2); }
          ctx.globalAlpha = 1;
          const step = (this.t >> 4) & 1, me = G.unitSprite(G.st.playerSpec().map, 'up', step), pup = G.data.npcs.canelo && G.unitSprite(G.data.npcs.canelo.map, 'up', step);
          ctx.drawImage(me, cx - 30, iy + ih - 34, 32, 32); if (pup && G.pet && G.pet.mine()) ctx.drawImage(pup, cx - 6, iy + ih - 22, 24, 24);
        }
        ctx.restore();
        G.textC(ctx, k ? '¡A pasear!' : '¡A dormir!', cx, top + r.h - 22, '#f8e060');
        if (on && (this.t >> 3) % 4 !== 3) G.textC(ctx, '\u0001', cx, r.y - 10 + bob, '#f8e060');
      }
    }
  }
  DY.bedOrWalk = function (z) { const w = new G.Wait(); G.push(new BedOrWalk(w, z)); return w; };

  // ---------- "Hoy": today's words, as their growing cards (cards.js) ----------
  // Cards pop in one by one, each said aloud (no stars: the plants on the cards show what grew). Tap a card (or left / right) to hear it
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
      // the words' cards (cards.js), as big as fit: up to 5 in a row full size, then 7, then 11
      const n = this.words.length, sc = n <= 5 ? 1 : n <= 14 ? 0.6 : 0.42, per = n <= 5 ? 5 : n <= 14 ? 7 : 11;
      this.L = { sc, w: Math.round(40 * sc), s: Math.round(82 * sc), step: Math.round(40 * sc) + (n <= 5 ? 6 : 4), per, gap: 4, rows: Math.ceil(n / per) };
    }
    onEnter() { G.audio.sfx('buff'); }
    nStars() { return 0; } // (no stars for the child any more: today's cards show what grew; this.stars is still counted)
    // the card, sized to what it holds: the title, today's cards (or your face), the word said
    box() {
      const L = this.L, pics = this.words.length ? L.rows * (L.s + L.gap) : 58, h = 34 + pics + 22 + 6;
      return { x: 32, y: Math.round((G.H - h) / 2), w: G.W - 64, h, pics };
    }
    // tap areas (shared with draw): one per card
    cells() {
      const L = this.L, n = this.words.length, b = this.box();
      return this.words.map((id, k) => {
        const r = Math.floor(k / L.per), c = k % L.per, inRow = Math.min(L.per, n - r * L.per), x0 = Math.round(G.W / 2 - (inRow * L.step - (L.step - L.w)) / 2);
        return { x: x0 + c * L.step, y: b.y + 36 + r * (L.s + L.gap), w: L.w, h: L.s, s: L.sc };
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
        ctx.save(); ctx.globalAlpha = a; G.cards.drawCard(ctx, this.words[k], r.x, r.y + dy + hop, { s: r.s, hi: sel }); ctx.restore();
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
