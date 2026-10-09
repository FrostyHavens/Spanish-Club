// ===== Round B: hearts (friendship) with the townsfolk and Canelo; voice greetings; best-friend stickers and photos =====
// Everyone in town (and Canelo) has 0-5 hearts, saved in G.state.hearts[npc]. Hearts go up:
//   - a greeting answered (by voice or by tap): once a day per person, +1. From chapter 3 on, the first talk of the
//     day with someone starts with their greeting as a G.ask question (a sun, a moon or a wave: buenos días, buenas
//     noches or hola), so the kids' mic is there, then one due word from their pool (H.POOLS);
//   - a gift they like (G.hearts.gift(npc, word), once a day per person): +1 (LIKES below; Canelo likes el hueso);
//   - finishing their errand (maps.js finishQuest -> giver): +2, not counted in the daily cap;
//   - Canelo: care (food, water, the ball, petting, a trick shown) +1 each, and +1 for every trick learned (not capped).
// At most DAY_CAP (2) a day per person from greetings, gifts and care, so friendships grow over several days.
// Unlocks: 1 heart -> they call you by name and hop when you pass (a "¡Hola, Luz!" bubble, at most once a minute);
// 3 -> a secret (where a notebook page you haven't found is, by a picture word) and a sticker of their face for the album;
// 5 -> best friends: a photo of you together for the album, and their greeting changes to "¡Mi amig{o/a} {name}!".
// Hearts show as a row over a person on the map for a moment when they rise (the new one pops), and as a row of five
// above the portrait whenever they talk (G.say with opts.who). The album's Amigos page lists everyone's hearts.
//
// API (for errands, the album and tests):
//   G.hearts.WHO               the 12 friends: mama luna rosa pepe sofia tomas marta ines gomez lucia nico canelo
//   G.hearts.get(npc)          0..5
//   G.hearts.add(npc, n, why)  -> hearts actually added (0 when capped / full / a once-a-day reason already used today).
//                              why: 'greet' | 'gift' (once a day each) | 'care' | 'errand' | 'trick' (these two skip the cap)
//   G.hearts.canAddToday(npc, why)  would add() give anything now
//   G.hearts.did(npc, why)     that reason was used today (e.g. did('rosa', 'greet'))
//   G.hearts.today(npc?)       hearts earned today by npc (or by everyone)
//   G.hearts.gift(npc, word)   +1 if it's the thing they like (once a day); -> hearts added
//   G.hearts.greet(npc)        generator: their voice greeting, once a day (yield* it at the start of a talk)
//   G.hearts.milestones(npc)   generator: the 3-heart secret + sticker and the 5-heart photo, when due (once each)
//   G.hearts.secrets[npc]      optional generator to replace someone's 3-heart secret (errands can hide things)
//   G.hearts.greeting(npc)     the line they greet you with now
//   G.hearts.row(ctx, npc, x, y, s)  draw their five hearts (s = scale)
// Saved: G.state.hearts {npc: n}, G.state.heartlog {d: 'YYYY-M-D', n: {npc: capped today}, all: {npc: today}, why: {npc: {why: 1}}},
// G.state.friends {npc: {m3: 1 (secret + sticker given), m5: 1 (photo)}}.
'use strict';
(function () {
  const H = G.hearts = {}, T = G.TILE;
  H.MAX = 5; H.DAY_CAP = 2;
  H.WHO = ['mama', 'luna', 'rosa', 'pepe', 'sofia', 'tomas', 'marta', 'ines', 'gomez', 'lucia', 'nico', 'canelo'];
  // what each friend likes as a gift (word ids; Lucía: a pink flower)
  H.LIKES = { mama: 'flor', luna: 'manzana', rosa: 'flor', pepe: 'queso', sofia: 'galleta', tomas: 'agua', marta: 'leche', ines: 'pan', gomez: 'manzana', lucia: 'flor', nico: 'pelota', canelo: 'hueso' };
  const ONCE = ['greet', 'gift'], FREE = ['errand', 'trick'];
  H.secrets = {};
  const today = () => (G.world ? G.world.today() : new Date().toDateString());
  const obj = (s, k) => { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; return s[k]; };
  function log() {
    const s = G.state; let l = s.heartlog;
    if (!l || typeof l !== 'object' || l.d !== today()) l = s.heartlog = { d: today(), n: {}, all: {}, why: {} };
    obj(l, 'n'); obj(l, 'all'); obj(l, 'why');
    return l;
  }
  const friends = npc => obj(obj(G.state, 'friends'), npc);
  H.get = npc => (G.state && G.state.hearts ? Math.max(0, Math.min(H.MAX, G.state.hearts[npc] | 0)) : 0);
  H.did = (npc, why) => !!(G.state && log().why[npc] && log().why[npc][why]);
  H.mark = (npc, why) => { obj(log().why, npc)[why] = 1; };
  H.today = npc => { if (!G.state) return 0; const a = log().all; return npc ? a[npc] | 0 : Object.keys(a).reduce((s, k) => s + (a[k] | 0), 0); };
  H.canAddToday = function (npc, why = 'care') {
    if (!G.state || H.WHO.indexOf(npc) < 0 || H.get(npc) >= H.MAX) return false;
    if (ONCE.includes(why) && H.did(npc, why)) return false;
    if (!FREE.includes(why) && (log().n[npc] | 0) >= H.DAY_CAP) return false;
    return true;
  };
  H.add = function (npc, n = 1, why = 'care') {
    if (!G.state) return 0;
    const ok = H.canAddToday(npc, why), l = log();
    if (ONCE.includes(why)) H.mark(npc, why);
    if (!ok) return 0;
    const cur = H.get(npc);
    let k = Math.min(n, H.MAX - cur);
    if (!FREE.includes(why)) k = Math.min(k, H.DAY_CAP - (l.n[npc] | 0));
    if (k <= 0) return 0;
    obj(G.state, 'hearts')[npc] = cur + k;
    if (!FREE.includes(why)) l.n[npc] = (l.n[npc] | 0) + k;
    l.all[npc] = (l.all[npc] | 0) + k;
    obj(l.why, npc)[why] = 1;
    H.show(npc, cur, cur + k);
    G.st.autosave();
    return k;
  };
  H.gift = (npc, word) => (H.LIKES[npc] === word ? H.add(npc, 1, 'gift') : 0);
  H.best = npc => H.get(npc) >= H.MAX;
  H.greeting = npc => H.best(npc) ? '¡Mi amig{o/a} {name}!' : H.get(npc) >= 1 ? '¡Hola, {name}!' : '¡Hola!';

  // ---------- the sound of a heart, made here ----------
  function chime() {
    const au = G.audio; if (!au || !au.ctx || !au.sfxGain) return;
    const ac = au.ctx;
    [[880, 0], [1175, 0.09], [1568, 0.18]].forEach(([f, at]) => {
      const t = ac.currentTime + 0.01 + at, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(au.sfxGain); o.start(t); o.stop(t + 0.3);
    });
  }

  // ---------- drawing hearts ----------
  const HEART = ['.kk.kk.', 'kRrkrrk', 'krrrrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'];
  const heartImg = full => G.sprite('heart7' + (full ? 'f' : 'e'), HEART, full ? { k: '#401020', r: '#f04878', R: '#ffc0d8' } : { k: '#2a2040', r: '#5a5078', R: '#6a6088' });
  H.heart = (ctx, x, y, full, s = 1) => { ctx.imageSmoothingEnabled = false; ctx.drawImage(heartImg(full), Math.round(x), Math.round(y), 7 * s, 7 * s); };
  const pops = {}; // npc -> {from, to, f0}: the last rise, for the map row and the portrait row's pulse
  // five hearts, left to right from x, y; a heart that just rose pops and sparkles
  H.row = function (ctx, npc, x, y, s = 1, n) {
    const h = n == null ? H.get(npc) : n, p = pops[npc], age = p ? G.frame - p.f0 : 1e9;
    for (let i = 0; i < H.MAX; i++) {
      const fresh = p && i >= p.from && i < p.to && age < 90, k = fresh ? Math.min(1, age / 10) : 1;
      const sc = fresh && age < 20 ? 1 + 0.6 * Math.sin(k * Math.PI) : 1, hx = x + i * 8 * s, w = 7 * s * sc;
      if (fresh && age < 6) { H.heart(ctx, hx, y, false, s); continue; }
      ctx.imageSmoothingEnabled = false; ctx.drawImage(heartImg(i < h), Math.round(hx + 3.5 * s - w / 2), Math.round(y + 3.5 * s - w / 2), Math.round(w), Math.round(w));
    }
  };
  H.rowW = (s = 1) => (H.MAX * 8 - 1) * s;
  // hearts over a person on the map when they rise (field.js -> drawTop)
  H.show = function (npc, from, to) {
    pops[npc] = { from, to, f0: G.frame };
    chime();
    const f = G.field, n = f && who(f, npc);
    if (n) { const [sx, sy] = head(f, n); for (let i = 0; i < 4; i++) G.fx.twinkle(sx + (Math.random() - 0.5) * 30, sy - 4 + (Math.random() - 0.5) * 10); }
  };
  const who = (f, npc) => f.npcs.find(n => n.id === npc && !n.hidden) || f.npcs.find(n => n.npc === npc && !n.hidden && n.talk);
  const head = (f, n) => [Math.round(n.x * T + (n.ox || 0) + 12 - f.cam.x), Math.round(n.y * T + (n.oy || 0) - f.cam.y - (n.id === 'canelo' ? 0 : 8))];
  H.drawTop = function (f, ctx) {
    for (const npc in pops) {
      const p = pops[npc], age = G.frame - p.f0; if (age > 170) continue;
      const n = who(f, npc); if (!n) continue;
      let [sx, sy] = head(f, n); const w = H.rowW() + 6;
      try { if (n.alert && n.alert()) sy -= 26; } catch (e) { } // above their thought bubble
      const a = age > 150 ? (170 - age) / 20 : 1, rise = Math.round(Math.min(1, age / 12) * 6);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#10102a'; ctx.fillRect(sx - w / 2, sy - 10 - rise, w, 11); ctx.fillStyle = '#fff4f8'; ctx.fillRect(sx - w / 2 + 1, sy - 9 - rise, w - 2, 9);
      H.row(ctx, npc, sx - w / 2 + 3, sy - 8 - rise);
      ctx.globalAlpha = 1;
    }
  };
  H.pulse = npc => { const p = pops[npc]; return !!p && G.frame - p.f0 < 120; };
  // ui.js TextBox: a row of hearts above the portrait of someone who has hearts
  const greets = () => !!G.chapters && G.chapters.done('c3'); // greetings begin after chapter 3 (CURRICULUM.md 2.2)
  H.shows = npc => H.WHO.includes(npc) && !!G.state && (H.get(npc) > 0 || greets());

  // ---------- 1 heart: they call you by name as you pass ----------
  const waved = {};
  H.update = function (f) {
    if (f.locked || G.top() !== f || !f.amb || !G.state) return;
    const p = f.player;
    for (const n of f.npcs) {
      const id = n.id === 'canelo' ? null : H.WHO.includes(n.id) ? n.id : null;
      if (!id || n.hidden || !n.spec || n.moving || H.get(id) < 1) continue;
      let bub = null; try { bub = n.alert && n.alert(); } catch (e) { bub = null; }
      if (bub) continue; // (their own bubble is up: no name call over it)
      const d = Math.abs(n.x - p.x) + Math.abs(n.y - p.y);
      if (d > 2 || d === 0 || (waved[id] != null && G.frame - waved[id] < 3600)) continue;
      if (waved[id] == null && G.frame < 240) { waved[id] = G.frame - 3000; continue; } // not the moment a map opens
      waved[id] = G.frame;
      if (n.amb) n.amb.hop = 24;
      f.amb.fx.push({ kind: 'say', s: G.fill(H.best(id) ? '¡Mi amig{o/a}!' : '¡Hola, {name}!'), o: n, dx: 0, t: 0, life: 110 });
    }
  };

  // ---------- the voice greeting (once a day per person, from chapter 3 on) ----------
  // The person waves under a sun (the morning: the first minutes of a session), a moon (the evening, once buenas noches
  // is met) or neither, and you answer: [buenos días / buenas noches / hola] when both time-of-day greetings are met,
  // else the right greeting among known words that aren't greetings (hola is never a card beside buenos días before
  // buenas noches exists: it would be right too). Then one word that is due from their pool (POOLS: what their trade
  // shows), asked for its stage (G.review.ask). Once a day each; a heart.
  H.POOLS = {
    mama: ['buenosdias', 'buenasnoches', 'perro', 'ven', 'sientate', 'hueso', 'agua', 'cama', 'pelota', 'galleta', 'casa', 'comoestas', 'bien', 'feliz', 'cansado'],
    pepe: ['hola', 'buenosdias', 'manzana', 'platano', 'naranja', 'queso', 'porfavor', 'gracias', 'si', 'no', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'rojo', 'amarillo', 'verde'],
    marta: ['hola', 'buenosdias', 'pan', 'galleta', 'leche', 'panaderia', 'porfavor', 'gracias', 'uno', 'dos', 'tres', 'cuatro', 'cinco'],
    rosa: ['hola', 'buenosdias', 'gallina', 'huevo', 'casa', 'flor', 'blanco', 'rosa', 'manzana', 'uno', 'dos', 'tres', 'gracias'],
    sofia: ['hola', 'pelota', 'rojo', 'azul', 'amarillo', 'blanco', 'pata', 'salta', 'galleta', 'feliz', 'parque'],
    nico: ['hola', 'gato', 'pato', 'cabra', 'caballo', 'conejo', 'rana', 'pajaro', 'pez', 'mariposa', 'guau', 'miau', 'cuac', 'croac', 'gira', 'verde'],
    lucia: ['hola', 'flor', 'rosa', 'amarillo', 'rojo', 'blanco', 'azul', 'mariposa', 'fuente', 'triste', 'feliz', 'bien', 'cansado'],
    tomas: ['hola', 'adios', 'carta', 'casa', 'escuela', 'parque', 'panaderia', 'biblioteca', 'granja', 'fuente', 'cansado', 'agua'],
    gomez: ['hola', 'buenosdias', 'parque', 'banco', 'arbol', 'conejo', 'pajaro', 'busca', 'perro'],
    luna: ['hola', 'buenosdias', 'escuela', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'comoestas', 'bien'],
    ines: ['hola', 'biblioteca', 'adios', 'gracias'],
  };
  const GREET = ['hola', 'buenosdias', 'buenasnoches', 'adios', 'comoestas'];
  H.greetKind = function () {
    const met = id => G.st.seen(id);
    if (G.day && G.day.over() && met('buenasnoches')) return 'noches';
    if (G.sessionTime < 300 && met('buenosdias')) return 'dias';
    return 'hola';
  };
  H.greet = function* (npc) {
    if (!G.state || !greets() || npc === 'canelo' || !H.WHO.includes(npc) || H.did(npc, 'greet')) return false;
    const nm = G.nameOf(npc) || '', kind = H.best(npc) ? 'best' : H.greetKind(), met = id => G.st.seen(id);
    const ans = kind === 'noches' ? 'buenasnoches' : kind === 'dias' ? 'buenosdias' : 'hola';
    const both = met('buenosdias') && met('buenasnoches') && met('hola');
    const plain = G.words.list(2).concat(G.words.list(1)).filter((id, i, a) => a.indexOf(id) === i && !GREET.includes(id) && G.data.words[id].topic !== 'saludos' && G.iconDrawn(id));
    let others = both ? ['buenosdias', 'buenasnoches', 'hola'].filter(k => k !== ans) : plain.sort(() => G.rand() - 0.5).slice(0, 2);
    if (others.length < 2) others = others.concat(G.words.list(1).filter(k => k !== ans && !others.includes(k) && !(ans === 'buenosdias' && k === 'hola'))).slice(0, 2);
    const show = kind === 'noches' ? { icon: 'noche' } : kind === 'dias' ? { icon: 'sol' } : { icon: 'hola' };
    const Q = {
      best: ['¡Mi amig{o/a} {name}!', 'My friend {name}! (wave back: say hi)'],
      dias: ['¡...!', 'The sun is up: ' + nm + ' says good morning. Say it back!'],
      noches: ['¡...!', 'The moon is out: ' + nm + ' says good night. Say it back!'],
      hola: ['¡...!', nm + ' waves at you. Say hi back!'],
    }[kind];
    if (G.vocabLog) G.vlog.greet = npc; // (the dev-only log, vocablog.js: tags the greeting's words)
    try { yield* G.chapters.ask(npc, nm + ': ' + Q[0], Q[1], ans, others, { show: kind === 'best' ? null : show }); } finally { if (G.vlog) G.vlog.greet = null; }
    H.add(npc, 1, 'greet'); // (marks today's greeting even when no heart is left to give)
    yield 20;
    // one word that's due, from what they know about
    const pool = H.POOLS[npc] || [];
    const due = G.review.next({ filter: id => pool.includes(id) && !GREET.includes(id) });
    if (due) { if (G.vocabLog) G.vlog.greet = npc; try { yield* G.review.ask(due, { who: npc }); } finally { if (G.vlog) G.vlog.greet = null; } }
    yield* H.milestones(npc);
    return true;
  };

  // ---------- 3 hearts: a secret and a sticker; 5 hearts: a photo together ----------
  const PAGE_PLACE = { saludos: 'fuente', numeros: 'fuente', comida: 'casa', colores: 'parque', pueblo: 'biblioteca', animales: 'parque', granja: 'granja', sonidos: 'granja', cosas: 'banco', sentir: 'escuela', mascota: 'casa' };
  const T_ = (t, en) => ({ t, en });
  const say = (npc, ...pages) => G.say(pages, { portrait: G.portraitOf(npc), name: G.nameOf(npc) || (npc === 'canelo' ? 'Canelo' : null), who: npc });
  function* secret(npc) {
    if (npc === 'canelo') { yield say(npc, T_('¡Guau, guau!', 'Woof, woof! (he wags his tail)')); return; }
    const pg = G.data.pageOrder.find(p => G.pages.ready(p) && PAGE_PLACE[p] && p !== 'saludos'); // a page puzzle waiting (intro.js)
    if (!pg) { yield say(npc, T_('¡Eres muy simpátic{o/a}, {name}!', 'You\'re very nice, {name}!')); return; }
    yield say(npc, T_('¡Un secreto! Una página... ¡[' + PAGE_PLACE[pg] + ']!', 'A secret! A notebook page... near the ' + G.data.words[PAGE_PLACE[pg]].en.replace('the ', '') + '!'));
  }
  H.milestones = function* (npc) {
    if (!G.state || !H.WHO.includes(npc)) return;
    const fr = friends(npc), h = H.get(npc);
    if (h >= 3 && !fr.m3) {
      fr.m3 = 1; G.st.autosave();
      yield* (H.secrets[npc] || secret)(npc);
      yield say(npc, T_('¡Para ti!', 'For you! (a sticker for your album)'));
      yield H.card(npc, 'sticker');
    }
    if (h >= 5 && !fr.m5) {
      fr.m5 = 1; G.st.autosave();
      yield say(npc, T_(npc === 'canelo' ? '¡Guau! ¡Guau, guau!' : '¡{name}! ¡Mi amig{o/a}!', npc === 'canelo' ? 'Woof! (Canelo is your best friend)' : '{name}! My friend! (best friends)'));
      yield H.card(npc, 'photo');
    }
  };
  H.sticker = npc => !!(G.state && G.state.friends && G.state.friends[npc] && G.state.friends[npc].m3);
  H.photo = npc => !!(G.state && G.state.friends && G.state.friends[npc] && G.state.friends[npc].m5);

  // a face (portrait, or Canelo's sprite) in a w x w square
  H.face = function (ctx, npc, x, y, w, t) {
    const ps = npc === 'player' ? G.st.playerSpec().portrait : G.portraitOf(npc);
    if (ps) { ctx.save(); ctx.translate(x, y); ctx.scale(w / 52, w / 52); G.drawPortrait(ctx, ps, 0, 0, t || 0); ctx.restore(); return; }
    const sp = G.data.npcs[npc] && G.data.npcs[npc].map; if (!sp) return;
    ctx.fillStyle = '#5a8a40'; ctx.fillRect(x, y, w, w);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(G.unitSprite(sp, 'down', ((t || 0) >> 5) & 1), x + w * 0.1, y + w * 0.08, w * 0.8, w * 0.8);
  };

  // ---------- the sticker / photo card ----------
  class FriendCard {
    constructor(npc, kind, w) { G.toastT = 0; this.transparent = true; this.npc = npc; this.kind = kind; this.w = w; this.t = 0; }
    onEnter() { G.audio.jingle('item'); }
    update() {
      this.t++;
      if (this.t === 1) { G.fx.confetti(G.W / 2 - 80, 150, -1, 20); G.fx.confetti(G.W / 2 + 80, 150, 1, 20); }
      if (this.t > 30 && (G.input.p('A') || G.input.p('B') || G.input.tap())) { G.audio.sfx('ok'); G.pop(); this.w.resolve(); }
    }
    draw(ctx) {
      const u = Math.min(1, this.t / 14), s = 0.3 + 0.7 * G.fx.easeBack(u), cx = G.W / 2, cy = 100;
      ctx.globalAlpha = 0.5 * u; ctx.fillStyle = '#080c28'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
      if (this.kind === 'sticker') { // a round sticker with a scalloped gold edge
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + this.t / 60; ctx.fillStyle = '#f8c820'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44, 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.clip(); H.face(ctx, this.npc, cx - 40, cy - 40, 80, this.t); ctx.restore();
      } else { // a photo: you and your friend, in a white frame, a little tilted
        ctx.translate(cx, cy); ctx.rotate(-0.05); ctx.translate(-cx, -cy);
        ctx.fillStyle = '#10102a'; ctx.fillRect(cx - 66, cy - 44, 132, 96); ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - 65, cy - 43, 130, 94);
        ctx.fillStyle = '#88c8f8'; ctx.fillRect(cx - 58, cy - 36, 116, 64);
        H.face(ctx, 'player', cx - 56, cy - 34, 56, this.t); H.face(ctx, this.npc, cx, cy - 34, 56, this.t);
        G.text(ctx, '\u0003', cx - 3, cy - 40 + 2, '#f04878', null);
        G.textC(ctx, G.fill('¡Mejores amigos!'), cx, cy + 34, '#a05020', null);
      }
      ctx.restore();
      const nm = G.nameOf(this.npc) || 'Canelo';
      if (u >= 1) { G.bigText(ctx, nm, cx, cy + 62, 2, '#f8e060'); H.row(ctx, this.npc, cx - H.rowW(2) / 2, cy + 84, 2); }
      if (this.t > 30 && (this.t >> 4) % 2 === 0) G.text(ctx, '\u0001', G.W - 22, G.H - 16, '#f8e060');
    }
  }
  H.card = function (npc, kind) { const w = new G.Wait(); G.push(new FriendCard(npc, kind, w)); return w; };
})();
