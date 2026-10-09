// ===== Round B: tap anything. Things in town say their Spanish word; say it back for a speaking star =====
// A tap on a thing that has a word (a tree, a flower, the fountain, a bench, a window, the barn, the pond...) shows a
// word bubble over it with its picture and its Spanish word ("el árbol"), says the word and gives the thing a little
// wiggle and a sparkle. A word not met yet (words.js) is met this way when the new-word budget allows (WD.introOnTap:
// the child chose to ask "what's this?"; G.intro.note's small celebration); otherwise its bubble shows the picture and
// "?" and says nothing: it waits for its own puzzle. With the mic on, a small pink mic bubble sits beside a met word
// for ~5 s: tap it (or press V, or hold Space while you talk) and say the word -> a speaking star (G.mic.award; a cued
// retrieval for the word model: it was just heard), and that word gives no more say-it-back stars today (one per
// word per calendar day, kept in G.state.sayback[id] = 'YYYY-M-D', so it can't be farmed). A miss: "¡Otra vez!", the
// bubble stays a little longer, no penalty. Animals (animals.js, ambient.js, Canelo) use the same bubble, with their
// sound under the word ("el gato" / "¡Miau!").
//
// How a tap on the map is read (field.js tapTarget), in this order:
//   1. a person, a door (or its sign or wall), a notebook page sparkle, a search spot: exactly as before
//   2. an animal (animals.js): it reacts and says its name at once; you walk toward it (nothing else on arrival)
//   3. an object you can't walk onto (the fountain, a bench, a tree, the water, a roof): you walk up to it and it names
//      itself when you get there (right away if you're already beside it). If you can't get beside it (the middle of
//      the pond, a roof), you walk as close as you can and then it names itself
//   4. something you can walk onto (a flower, a little tree in the corner): you walk there and it names itself when
//      you arrive (the same word only once every 20 s this way, so walking over flowers isn't noisy)
//   5. anything else: walk there, as before
// With the keys, A facing a thing names it (where it used to say "...").
//
// Which things have words: G.world.TILES (tile code -> word id) for every map that has `things` in its definition,
// plus the map's own `things` (maps.js):
//   things: { tiles: { k: 'banco' } (more or different tile words; a code: null takes one away),
//             areas: { escuelaArea: 'escuela' } (G.MAPDATA[map].pos tag holding [x, y, w, h] -> word, for the tiles
//                     of that rectangle that have no tile word: a building's roof and walls),
//             at: { '41,4': 'puerta' } (one tile -> word; wins over everything) }
// A map without `things` names nothing (and A there still says "...").
//
// API: G.world.wordAt(f, x, y)        the word id of tile x, y on field f, or null
//      G.world.name(id, wx, wy, o)    name a word at world px wx, wy (the top of the thing): the bubble, the voice, met,
//                                     sparkles; then the say-it-back mic. o: {cry: '¡Miau!' (a second line, also spoken),
//                                     animal: id (for the album's `said`), tile: [x, y] (wiggles it), delay: frames
//                                     before speaking, noMic, walkOn (the 20 s rule), noIntro (never meets an unmet
//                                     word)}. Returns the bubble or null.
//      G.world.nameTile(f, x, y)      name tile x, y if it has a word (true if it did)
//      G.world.bubble                 the word bubble showing now {id, x, y, t, cry} or null
//      G.world.sayBack                the say-it-back now {id, t, life, mic (a G.MicBtn), done} or null
//      G.world.offerSayBack(id, b)    show the mic for word id beside bubble b (name() calls it)
//      G.world.canSayBack(id)         the mic is on and this word hasn't earned its say-it-back star today
//      G.world.today()                today's key, 'YYYY-M-D'
'use strict';
(function () {
  const T = G.TILE, WD = G.world = {};
  const key = (x, y) => x + ',' + y;
  WD.TILES = { T: 'arbol', f: 'arbol', o: 'flor', l: 'fuente', w: 'agua', J: 'banco', N: 'ventana', D: 'puerta', j: 'cama' };
  WD.introOnTap = true; // a tap on an unmet thing meets its word when G.budget.canIntro(1) (words.js)
  const LIFE = 170, SAY_LIFE = 330, WALK_AGAIN = 20 * 60;
  WD.bubble = null; WD.sayBack = null;
  let speakAt = null, walked = {}; // a line waiting to be spoken {f, text, at}; word -> G.frame it was named by walking onto it

  WD.today = () => G.today(); // (words.js: the date, which tests and the audit can move on)
  const sbook = () => (G.state.sayback || (G.state.sayback = {}));

  // ---------- which word a tile has ----------
  WD.wordAt = function (f, x, y) {
    const th = f && f.def && f.def.things; if (!th) return null;
    if (th.at && th.at[key(x, y)]) return th.at[key(x, y)];
    const c = f.map.get(x, y), tiles = Object.assign({}, WD.TILES, th.tiles || {});
    if (tiles[c]) return tiles[c];
    const pos = G.MAPDATA[f.mapId] && G.MAPDATA[f.mapId].pos;
    for (const tag in th.areas || {}) {
      const r = pos && pos[tag];
      if (r && r.length === 4 && x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3]) return th.areas[tag];
    }
    return null;
  };

  // ---------- naming ----------
  WD.name = function (id, wx, wy, o = {}) {
    const f = G.field, w = G.data.words[id]; if (!f || !w) return null;
    if (o.walkOn && walked[id] != null && G.frame - walked[id] < WALK_AGAIN) return null;
    if (o.walkOn) walked[id] = G.frame;
    if (G.vocabLog) G.vlog('tapped-object', id, { via: o.animal ? 'animal' : o.walkOn ? 'walk-on' : 'tap' }); // (the dev-only log, vocablog.js)
    let fresh = false;
    if (!G.st.seen(id) && WD.introOnTap && !o.walkOn && !o.noIntro && G.budget.canIntro(1)) fresh = G.words.meet(id, 'tap'); // asked "what's this?": met
    else G.st.see(id);
    const unk = !G.st.seen(id); // not met yet: its picture and "?", and no voice
    const b = WD.bubble = { id, x: wx, y: wy, t: 0, cry: o.cry || null, f, unk };
    if (o.tile) f.wig = { x: o.tile[0], y: o.tile[1], t: 18 };
    const text = unk ? (o.cry || '') : w.es.split(' / ')[0] + (o.cry ? '. ' + o.cry : '');
    if (!text) speakAt = null; else if (o.delay) speakAt = { f, text, at: G.frame + o.delay }; else { speakAt = null; G.speak(text); }
    if (fresh) G.intro.note([id]);
    G.audio.sfx('cursor');
    const [sx, sy] = [wx - Math.round(f.cam.x), wy - Math.round(f.cam.y)];
    for (let i = 0; i < 3; i++) G.fx.twinkle(sx + (Math.random() - 0.5) * 22, sy + (Math.random() - 0.5) * 12);
    WD.lastNamed = { id, frame: G.frame, x: wx, y: wy };
    if (WD.sayBack) { WD.sayBack.off(); WD.sayBack = null; }
    if (!o.noMic && !unk && WD.canSayBack(id)) WD.offerSayBack(id, b, o.animal);
    return b;
  };
  WD.nameTile = function (f, x, y, o = {}) {
    const id = WD.wordAt(f, x, y); if (!id) return false;
    WD.name(id, x * T + 12, y * T + 2, Object.assign({ tile: [x, y] }, o));
    if (id === 'fuente' && G.animals) { const fish = G.animals.find('pez', f); if (fish) G.animals.jump(fish, f); } // the fish says hello
    return true;
  };
  // field.js: a tap walk that had a word on it ended (walked onto it, or as close as it could get)
  WD.arrive = function (f, r) {
    if (!r || !r.name) return;
    const walkOn = !f.blocked(r.x, r.y, f.player) || (f.player.x === r.x && f.player.y === r.y);
    WD.nameTile(f, r.x, r.y, { walkOn });
  };

  // ---------- say it back ----------
  WD.canSayBack = id => !!(G.mic && G.mic.on() && G.speech && G.state && sbook()[id] !== WD.today());
  // the mic bubble: a small round button (pink; blue while listening, green once it hears you; a star when said)
  class BubbleMic extends G.MicBtn {
    draw(ctx) {
      if (!this.shown()) return;
      const r = this.o.rect(), cx = r.x + r.w / 2, cy = r.y + r.h / 2, L = !!this.l, ph = L ? this.l.phase : '';
      const idle = !L && !this.done && this.can();
      let rad = 11 + (idle && (this.t % 90) < 16 ? Math.round(Math.sin((this.t % 90) / 16 * Math.PI) * 2) : 0) + (this.pop ? Math.round(this.pop / 4) : 0);
      if (L) for (let i = 0; i < 2; i++) {
        const p = ((this.t + i * 20) % 40) / 40;
        ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = ph === 'speech' ? '#70e070' : '#f8e060'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rad + 2 + p * 9, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const x = cx + (this.sad > 40 ? Math.round(Math.sin(this.sad * 0.9) * 2) : 0);
      const held = !L && G.input.holding(r.x, r.y, r.w, r.h) > 0;
      const body = this.done ? '#2890c0' : L ? (ph === 'speech' ? '#30a850' : '#20a0c8') : held ? '#c02850' : this.sad ? '#a86080' : '#e85078';
      const disc = (rr, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, cy, rr, 0, Math.PI * 2); ctx.fill(); };
      disc(rad + 2, '#200818'); disc(rad + 1, this.done ? '#d8f8ff' : L ? '#ffffff' : '#ffb0c8'); disc(rad - 1, body);
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - rad * 0.3, cy - rad * 0.4, rad * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (this.done) { G.text(ctx, '\u0005', x - 2, cy - 4, '#fff070', '#5a2c04'); G.mic.waves(ctx, x, cy, rad + 3, '#70e0ff', 2, this.t >> 1); return; }
      const mx = Math.round(x), my = Math.round(cy); // a little white microphone: the head, its holder, the stand
      ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 3, my - 8, 6, 9); ctx.fillRect(mx - 2, my - 9, 4, 1); ctx.fillRect(mx - 2, my + 1, 4, 1);
      ctx.fillStyle = '#c8d8ff'; ctx.fillRect(mx - 3, my - 7, 1, 7);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 5, my - 2, 1, 3); ctx.fillRect(mx + 4, my - 2, 1, 3); ctx.fillRect(mx - 4, my + 1, 1, 2); ctx.fillRect(mx + 3, my + 1, 1, 2); ctx.fillRect(mx - 3, my + 3, 6, 1);
      ctx.fillRect(mx - 1, my + 4, 2, 2); ctx.fillRect(mx - 3, my + 6, 6, 1);
      if (idle) G.mic.waves(ctx, x, cy, rad + 4, '#ffd0e0', 1, 0);
    }
  }
  class SayBack {
    constructor(f, id, b, animal) {
      this.f = f; this.id = id; this.b = b; this.animal = animal || null; this.t = 0; this.life = SAY_LIFE; this.done = 0;
      this.mic = new BubbleMic(f, { rect: () => WD.micRect(f, this.b), ready: () => this.t > 6 && !f.locked && G.top() === f && !this.done,
        heard: a => this.heard(a), again: () => G.speak(G.data.words[id].es.split(' / ')[0]) });
      this.mic.arm(); f.mic = this.mic;
    }
    target() { const w = G.data.words[this.id]; return [w.es, w.alt].filter(Boolean).join(' / '); }
    heard(alts) {
      if (!G.speech.match(this.target(), alts).pass) { this.mic.miss(); this.t = Math.min(this.t, this.life - 200); return; } // a little longer to try again
      const r = WD.micRect(this.f, this.b), cx = r.x + r.w / 2, cy = r.y + r.h / 2, id = this.id, f = this.f;
      this.mic.win(); this.done = 1;
      G.mic.award(id, cx, cy);
      G.fx.say('¡Bien dicho!', cx, cy - 18, '#a8f0ff', true);
      sbook()[id] = WD.today();
      if (this.animal && G.state.album && G.state.album[this.animal]) G.state.album[this.animal].said = true;
      G.words.answerRight(id, { said: true, cued: true, mode: 'say', noStar: true }); // (said after hearing it: a cued use)
      G.st.autosave();
    }
    // -> true when it used this frame's input
    update() {
      if (G.top() === this.f && !this.f.locked) this.t++;
      if (this.done) this.done++;
      const used = this.mic.update();
      if (!this.mic.listening() && !this.mic.started && (this.t > this.life || this.done > 70)) return { used, end: true };
      return { used, end: false };
    }
    off() { this.mic.off(); if (this.f.mic === this.mic) this.f.mic = null; }
  }
  WD.offerSayBack = function (id, b, animal) {
    const f = G.field; if (!f) return null;
    if (WD.sayBack) WD.sayBack.off();
    WD.sayBack = new SayBack(f, id, b, animal);
    return WD.sayBack;
  };

  // ---------- where things go on screen ----------
  function lines(b) { const w = G.data.words[b.id]; return [b.unk ? '?' : w.es.split(' / ')[0]].concat(b.cry ? [b.cry] : []); }
  WD.bubbleRect = function (f, b) {
    const ls = lines(b), tw = Math.max(...ls.map(s => G.textWidth(s))), w = 30 + tw, h = ls.length > 1 ? 26 : 22;
    let x = Math.round(b.x - f.cam.x - w / 2), y = Math.round(b.y - f.cam.y) - h - 6;
    const below = y < 4; if (below) y = Math.round(b.y - f.cam.y) + 30;
    const room = WD.sayBack && WD.sayBack.b === b ? 30 : 0; // keep the mic on screen too
    x = G.clamp(x, 4, G.W - 4 - w - room);
    return { x, y: G.clamp(y, 4, G.H - h - 4), w, h, below };
  };
  WD.micRect = function (f, b) { const r = WD.bubbleRect(f, b); return { x: r.x + r.w + 2, y: r.y + r.h / 2 - 14, w: 28, h: 28 }; };

  // ---------- hooks (field.js) ----------
  // every frame the map is on top, before it reads taps: -> true when the say-it-back mic used this frame's input
  WD.update = function (f) {
    if (speakAt && speakAt.f === f && G.frame >= speakAt.at) { G.speak(speakAt.text); speakAt = null; }
    const b = WD.bubble;
    if (b && b.f !== f) WD.bubble = null; else if (b) b.t++;
    if (f.wig && --f.wig.t <= 0) f.wig = null;
    const sb = WD.sayBack;
    if (!sb) { if (b && b.t > LIFE) WD.bubble = null; return false; }
    if (sb.f !== f) { sb.off(); WD.sayBack = null; return false; }
    const r = sb.update();
    if (r.end) { sb.off(); WD.sayBack = null; if (WD.bubble === sb.b) WD.bubble.t = Math.max(WD.bubble.t, LIFE - 20); }
    else if (WD.bubble === sb.b) WD.bubble.t = Math.min(WD.bubble.t, 40); // the word stays while you can say it
    return r.used;
  };
  // leaving a map: nothing of it stays armed
  WD.leave = function (f) {
    if (WD.sayBack && WD.sayBack.f === f) { WD.sayBack.off(); WD.sayBack = null; }
    if (WD.bubble && WD.bubble.f === f) WD.bubble = null;
    if (speakAt && speakAt.f === f) speakAt = null;
  };
  // the wiggle: the named tile drawn again, nudged side to side (after the tiles, before the people)
  WD.drawUnder = function (f, ctx) {
    const wg = f.wig; if (!wg) return;
    const dx = Math.round(Math.sin(wg.t * 1.2) * 1.6); if (!dx) return;
    ctx.drawImage(G.tileCanvas(f.map, wg.x, wg.y), wg.x * T - Math.round(f.cam.x) + dx, wg.y * T - Math.round(f.cam.y));
  };
  // the word bubble and the mic, over everything on the map
  WD.draw = function (f, ctx) {
    const b = WD.bubble; if (!b || b.f !== f) return;
    const r = WD.bubbleRect(f, b), ls = lines(b), w = G.data.words[b.id];
    const k = Math.min(1, b.t / 8), rise = Math.round((1 - FXease(k)) * 6), fade = b.t > LIFE - 20 ? Math.max(0, (LIFE - b.t) / 20) : 1;
    ctx.globalAlpha = fade;
    const y = r.y + rise;
    G.win(ctx, r.x, y, r.w, r.h, { fill1: '#ffffff', fill2: '#ece8f4', alpha: 1 });
    const tx = G.clamp(Math.round(b.x - f.cam.x), r.x + 6, r.x + r.w - 7); // the tail points at the thing
    ctx.fillStyle = '#ffffff';
    if (r.below) { ctx.fillRect(tx - 1, y - 2, 3, 2); ctx.fillRect(tx, y - 3, 1, 1); }
    else { ctx.fillRect(tx - 1, y + r.h - 1, 3, 2); ctx.fillRect(tx, y + r.h + 1, 1, 1); }
    const hop = b.t < 30 ? Math.round(Math.abs(Math.sin(b.t / 30 * Math.PI * 2)) * -2) : 0;
    G.drawIcon16(ctx, w, r.x + 5, y + (r.h - 16) / 2 + hop);
    G.text(ctx, ls[0], r.x + 25, y + (ls.length > 1 ? 4 : 7), b.unk ? '#a08060' : G.st.knows(b.id) ? '#a06008' : '#2860a8', null);
    if (ls[1]) G.text(ctx, ls[1], r.x + 25, y + 14, '#e06010', null);
    ctx.globalAlpha = 1;
    if (WD.sayBack && WD.sayBack.b === b && WD.sayBack.f === f) WD.sayBack.mic.draw(ctx);
  };
  const FXease = u => (G.fx.easeBack ? G.fx.easeBack(u) : u);
})();
