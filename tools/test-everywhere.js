// Reviews follow her everywhere (docs/AUDIT_2026-10.md C6, M2, L2; polish plan Sprint 2, items 2.5 and 2.10):
//   forest    a beach word that is due, while she plays in the forest, is reviewed there: by Elena's greeting, by Lola's
//             photo (a place she isn't in), by a favour (a photo: never "bring me" what isn't here) and by the dog's
//             warm-up, always in a picture form; Tomás's letter carries a drawing of a word that is due
//   here      nothing asks her to bring a thing that isn't in the place she's in (Lola's world requests, the favours'
//             lines, "Dame" only for what can be held)
//   warm-up   2-3 cards when little is due, 4-8 with a backlog; never more than 3 questions in a row (the dog runs off
//             and brings the next card); the mid-session dog moment: once a sitting, only with due words, never
//             during a story beat, skippable
//   boards    a listen board in every place, only words she knows (stage 2+), right grammar (articles, the personal a,
//             "Dame" only for what can be held), every request checked with G.requests.check; the new templates are
//             in G.requests.LINES (tools/test-spanish.js runs every word through them); a random wrong pick credits
//             no word; the park's "Salta dos veces" / "Tócate la nariz" done by her character on the map
//   phrases   a gold phrase's written pattern fades (stage 3 faint, stage 4 not written)
//   NODE_PATH=$(npm root -g) node tools/test-everywhere.js [screenshot dir]     (ONLY=forest|here|warm|boards|phrases)
'use strict';
const { run, open, check } = require('./harness');

// ---------- a game: words [stage, due] met three days ago; chapters done; places visited ----------
const BEACH = ['concha', 'cangrejo', 'tortuga', 'estrellamar', 'gaviota'];
const KNOWN = ['hola', 'buenosdias', 'gracias', 'perro', 'gato', 'pato', 'conejo', 'manzana', 'platano', 'naranja', 'pan', 'flor', 'casa', 'rojo', 'verde', 'azul', 'amarillo', 'blanco',
  'uno', 'dos', 'tres', 'cuatro', 'grande', 'pequeno', 'oso', 'ardilla', 'venado', 'hoja', 'mora', 'bellota', 'hongo', 'elbosque', 'cueva', 'carta', 'mar', 'ola'];
const VILLA_DONE = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], ZONES_DONE = ['playa1', 'playa2', 'playa3', 'bosque1', 'bosque2', 'bosque3'];
const game = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving;
  G.debug.dayShift = -3;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of o.done || []) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
  W.newSession('new');
  const all = Object.keys(o.words || {});
  for (const id of all) { if (G.animals && G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'test'); }
  G.debug.dayShift = 0; W.newSession('load');
  for (const id of all) { const [st, due] = o.words[id]; Object.assign(W.rec(id), { st, box: 2, fu: 0, due: null, dd: W.day() + (due ? 0 : 4), dc: W.dayNum() + (due ? 0 : 4), ld: W.dayNum() - 3, learned: st >= 3, gold: st >= 3 }); }
  G.cards.grow = grow;
  G.demo.skip();
  G.zones.visit('villa'); for (const z of o.visit || []) G.zones.visit(z);
  G.state.world.lola = { met: true };
  if (G.warmup) G.warmup.skipToday();
  // every question asked: who, the answer, a picture held up, how the cards look
  window.__q = []; const ch = G.choose;
  G.choose = function (q) { const a = q.choices && q.choices[q.answer]; window.__q.push({ who: q.who || null, prompt: q.prompt, ans: a && a.word, show: q.show ? (typeof q.show === 'string' ? q.show : q.show.icon || 'pic') : null, display: q.display || null, warmup: !!q.warmup, f: G.frame }); return ch.apply(this, arguments); };
  window.__says = []; const sy = G.say; G.say = function (pages, op) { try { window.__says.push({ who: (op && op.who) || '', t: (Array.isArray(pages) ? pages : [pages]).map(p => (typeof p === 'string' ? p : p && p.t) || '').join(' / '), show: op && op.show ? (typeof op.show === 'string' ? op.show : op.show.icon || 'pic') : null }); } catch (e) { /* */ } return sy.apply(this, arguments); };
  G.goto(o.map || 'villa', o.x == null ? 22 : o.x, o.y == null ? 13 : o.y, 'down');
}, o);
const WORDS = (due, extra) => { const o = {}; for (const w of KNOWN) o[w] = [2, false]; for (const w of BEACH) o[w] = [2, due]; Object.assign(o, extra || {}); return o; };
async function tapNpc(g, id) {
  await g.until(() => free(), null, 'the map to be free');
  await g.ev(id => { const f = G.field, n = f.npc(id), p = f.player; n.wander = 0; n.home = [n.x, n.y]; for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) if (!f.blocked(n.x + dx, n.y + dy, p) && !f.exitAt(n.x + dx, n.y + dy)) { p.x = n.x + dx; p.y = n.y + dy; break; } f.snapCam(); }, id);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
const qs = (g, from) => g.ev(k => window.__q.slice(k), from || 0);
const nq = g => g.ev(() => window.__q.length);
// a picture form: the word's picture held up, or cards with pictures (never a word-only question with no picture)
const pictured = q => !!q && (q.show === q.ans || (q.show && q.show !== 'pic' && q.show !== null) || q.display !== 'text');

// =====================================================================
//  In the forest: a beach word that's due is reviewed there
// =====================================================================
async function forest(browser) {
  const { ctx, g } = await open(browser, 'ev-forest', true, { warmup: true });
  try {
    await game(g, { words: WORDS(true), done: VILLA_DONE.concat(ZONES_DONE), visit: ['playa', 'bosque'], map: 'bosque', x: 18, y: 27 });
    await g.fieldIdle('bosque');
    await g.ev(() => { G.bosque.state().sort = { d: G.words.day(), done: true, round: 0, on: false, gone: {} }; G.state.fav = { day: G.words.day(), list: [], pal: G.words.day() }; G.state.world.lola.bosque = G.words.day(); }); // (Elena's game done today, no favours yet, Lola has said hello here)
    check('forest: five beach words are due, the forest\'s aren\'t (she\'s in the forest)', await g.ev(B => B.every(id => G.words.due(id)) && !G.words.due('oso') && G.zones.of(G.field.mapId) === 'bosque', BEACH));

    // ---- Elena's greeting: the greeting, then one word that's due: a beach word, with its picture ----
    let k = await nq(g);
    await tapNpc(g, 'elena');
    await g.drive(() => free() && G.hearts.did('elena', 'greet'), 'Elena\'s greeting');
    const q1 = await qs(g, k);
    const w1 = q1.find(q => q.who === 'elena' && BEACH.includes(q.ans));
    check('forest: Elena\'s greeting asks a beach word that\'s due (' + (w1 && w1.ans) + ': "' + (w1 && w1.prompt) + '"), in a picture form', !!w1 && pictured(w1), JSON.stringify(q1));
    check('forest: ...two questions in that talk (the greeting and the word), no more', q1.length === 2, JSON.stringify(q1.map(q => q.ans)));

    // ---- Lola: her first talk in this place today: a photo of something from another place that's due ----
    await g.ev(() => { G.hearts.mark('lola', 'greet'); delete G.state.world.lola.bosque; }); // (her greeting done today; her hello here not yet)
    k = await nq(g);
    const s0 = await g.ev(() => window.__says.length);
    await tapNpc(g, 'lola');
    await g.drive(() => free() && G.zones.lolaTalked(G.field.mapId), 'Lola in the forest');
    const q2 = await qs(g, k), lines2 = await g.ev(k => window.__says.slice(k), s0);
    const w2 = q2.find(q => q.who === 'lola' && BEACH.includes(q.ans));
    check('forest: Lola shows a photo from her travels ("' + ((lines2.find(l => l.show === 'foto') || {}).t || '') + '") and asks a beach word (' + (w2 && w2.ans) + '), in a picture form', !!w2 && pictured(w2) && lines2.some(l => l.who === 'lola' && l.show === 'foto'), JSON.stringify([q2, lines2]));

    // ---- a favour: Elena's "thing" of the day is a beach word: a photo, asked with its picture ----
    await g.ev(() => { G.state.fav = { day: -1, list: [], pal: G.words.day() }; const O = G.favores.OFFERS; window.__offers = O.slice(); O.length = 0; O.push(['elena', 'thing', ['oso', 'ardilla', 'venado', 'zorro', 'mapache', 'cueva']]); });
    const fav = await g.ev(() => { const L = G.favores.today(); G.favores.OFFERS.length = 0; G.favores.OFFERS.push(...window.__offers); return L.map(v => v.who + ':' + v.kind + ':' + v.word); });
    check('forest: Elena\'s favour of the day is about a word that\'s due from anywhere: a beach word (' + fav.join() + ')', fav.length === 1 && BEACH.includes(fav[0].split(':')[2]), fav.join());
    k = await nq(g);
    const s1 = await g.ev(() => window.__says.length);
    await tapNpc(g, 'elena');
    await g.drive(() => free() && G.favores.today()[0].done, 'Elena\'s favour');
    const q3 = await qs(g, k), lines3 = await g.ev(k => window.__says.slice(k), s1);
    const w3 = q3.find(q => q.ans === fav[0].split(':')[2]);
    check('forest: ...she shows a photo of it ("' + ((lines3.find(l => l.show === 'foto') || {}).t || '') + '") and asks it with its picture; never "bring me" it', !!w3 && pictured(w3) && lines3.some(l => l.show === 'foto') && !lines3.some(l => /Tráeme|Dame/.test(l.t)), JSON.stringify([q3, lines3]));

    // ---- the dog's warm-up, here: the beach words first, each with its picture ----
    await g.ev(() => { G.hist.state().wu.d = ''; for (const id of ['concha', 'cangrejo']) Object.assign(G.words.rec(id), { dd: G.words.day(), dc: G.words.dayNum() }); for (const id of ['oso', 'hoja', 'mora']) Object.assign(G.words.rec(id), { dd: G.words.day(), dc: G.words.dayNum(), ld: G.words.dayNum() - 1 }); });
    const ids = await g.ev(() => G.warmup.pick(G.field));
    check('forest: the warm-up picks the words of the place she left first (' + ids.join(', ') + ')', ids.length >= 2 && BEACH.includes(ids[0]) && BEACH.includes(ids[1]), ids.join());
    k = await nq(g);
    await g.until(() => !!G.warmup.cur(), null, 'the warm-up', 12000);
    await g.drive(() => !G.warmup.cur() && free(), 'the warm-up');
    const q4 = (await qs(g, k)).filter(q => q.warmup);
    check('forest: ...and asks them in a picture form (' + q4.map(q => q.ans + (q.show ? ' [its picture]' : ' [' + q.display + ']')).join(', ') + ')', q4.length >= 2 && q4.filter(q => BEACH.includes(q.ans)).every(pictured) && q4.some(q => BEACH.includes(q.ans)), JSON.stringify(q4));

    // ---- Tomás's letter: a drawing inside, a word that's due ----
    await g.ev(() => { G.goto('playa', 10, 3, 'down'); });
    await g.fieldIdle('playa');
    await g.ev(() => { G.errands.bag.add('carta', { q: 'post', to: 'paco', from: 'elena' }); G.hearts.mark('paco', 'greet'); Object.assign(G.words.rec('oso'), { dd: G.words.day(), dc: G.words.dayNum() }); G.state.fav = { day: G.words.day(), list: [], pal: G.words.day() }; });
    k = await nq(g);
    const s2 = await g.ev(() => window.__says.length);
    await tapNpc(g, 'paco');
    await g.drive(() => free() && !(G.post.letter() && G.post.letter().to === 'paco'), 'the letter for Don Paco'); // (he may write back: a letter for Elena in her hands)
    const q5 = await qs(g, k), lines5 = await g.ev(k => window.__says.slice(k), s2);
    const w5 = q5.find(q => q.who === 'paco');
    check('letter: Don Paco opens Elena\'s letter: "¡Mira! ¡Un dibujo!" and a word that\'s due from her place first (' + (w5 && w5.ans) + '), with its picture', !!w5 && pictured(w5) && lines5.some(l => /Un dibujo/.test(l.t)) && ['oso', 'hoja', 'mora'].includes(w5.ans), JSON.stringify([q5, lines5.map(l => l.t)]));
    check('forest: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  Here: nothing asks her to bring a thing that isn't in the place she's in
// =====================================================================
async function here(browser) {
  const { ctx, g } = await open(browser, 'ev-here', false, { listen: true });
  try {
    await game(g, { words: WORDS(true, { hueso: [2, false], pelota: [2, false], zanahoria: [2, false], elote: [2, false], llama: [2, true], marmota: [2, true], salta: [2, true], gira: [2, false], nariz: [2, true], ojos: [2, false], boca: [2, false] }), done: VILLA_DONE.concat(ZONES_DONE), visit: ['playa', 'bosque', 'juegos', 'abuelos', 'montana'] });
    await g.fieldIdle('villa');
    const r = await g.ev(() => {
      const RQ = G.requests, L = G.listen, bad = [], made = {};
      const THINGS = { playa: ['concha'], bosque: ['hoja'], abuelos: ['manzana'] };
      for (const [map, z] of [['playa', 'playa'], ['bosque', 'bosque'], ['abuelos', 'abuelos'], ['juegos', 'juegos'], ['montana', 'montana'], ['villa', 'villa']]) {
        const spec = L.boardHere('lola', { mapId: map });
        if (!THINGS[z]) { if (spec) bad.push('lola has a board in ' + z); continue; }
        for (let i = 0; i < 40; i++) {
          const q = RQ.make(spec, { carry: true }); if (!q) continue; made[z] = (made[z] | 0) + 1;
          if (!THINGS[z].includes(q.thing) || q.tray.some(c => !THINGS[z].includes(c.thing))) bad.push(z + ': ' + q.say);
          if (!/^Tráeme /.test(q.say)) bad.push(z + ' (not a bring): ' + q.say);
        }
      }
      // every listen favour's board: "Dame" / "Tráeme" only for what can be held, and only things of that board
      const asked = new Set();
      for (const who of Object.keys(RQ.SPECS)) {
        if (who === 'lola') continue;
        const spec = RQ.spec(who);
        for (let i = 0; i < 60; i++) {
          const q = RQ.make(spec, { level: 1 + (i % 2) }); if (!q) continue; asked.add(q.say);
          const d = spec.things[q.thing];
          if (/^(Dame|Tráeme)/.test(q.say) && !RQ.holds(d)) bad.push(who + ' (can\'t be held): ' + q.say);
          if (q.tray.some(c => !spec.things[c.thing])) bad.push(who + ' (a thing not on the board): ' + q.say);
        }
      }
      return { bad, made, n: asked.size };
    });
    check('here: Lola\'s world requests are only about the place she\'s in (' + JSON.stringify(r.made) + '), none in the park, the mountain or town', !r.bad.length && r.made.playa && r.made.bosque && r.made.abuelos, r.bad.slice(0, 5).join(' | '));
    // a favour about a word from another place: the person's lines never ask her to bring or give it
    const lines = await g.ev(() => {
      const said = [], say0 = G.say, ask0 = G.review.ask;
      G.say = pages => { (Array.isArray(pages) ? pages : [pages]).forEach(p => said.push(typeof p === 'object' ? p.t : p)); return null; };
      G.review.ask = function* (id) { said.push('?' + id); };
      const go = gen => { let x = gen.next(), n = 0; while (!x.done && n++ < 40) x = gen.next(); };
      try { for (const [who, w] of [['pepe', 'cangrejo'], ['elena', 'tortuga'], ['paco', 'oso'], ['marta', 'llama']]) go(G.favores.KIND.thing({ who, kind: 'thing', word: w, done: false, on: false })); } finally { G.say = say0; G.review.ask = ask0; }
      return said;
    });
    check('here: a favour about a word from another place shows a photo and asks it ("' + lines.filter(t => !/^\?/.test(t)).slice(0, 3).join('" / "') + '"), never "bring me" it', lines.filter(t => t === '?cangrejo' || t === '?tortuga' || t === '?oso' || t === '?llama').length === 4 && !lines.some(t => /Tráeme|Dame|¡Para ti!/.test(t)), lines.join(' | '));
    check('here: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  The warm-up: its size, three questions at most in a row; the mid-session moment
// =====================================================================
async function warm(browser) {
  const { ctx, g } = await open(browser, 'ev-warm', true, { warmup: true });
  try {
    const many = {}; for (const w of KNOWN) many[w] = [2, false];
    await game(g, { words: many, done: VILLA_DONE.slice(0, 7) }); // (c8 next: no evening chapter bringing the sunset early)
    await g.fieldIdle('villa');
    const sizes = await g.ev(K => {
      const W = G.words, out = {};
      const setDue = n => { K.forEach((id, i) => Object.assign(W.rec(id), i < n ? { dd: W.day(), dc: W.dayNum() } : { dd: W.day() + 4, dc: W.dayNum() + 4 })); };
      for (const n of [1, 2, 3, 4, 6, 7, 10, 13, 16, 30]) { setDue(n); out[n] = G.warmup.pick(G.field).length; }
      setDue(0); return out;
    }, KNOWN.filter(w => !['hola', 'buenosdias', 'gracias'].includes(w)));
    check('warm-up: 2-3 cards when little is due (2 due: ' + sizes[2] + ', 3 due: ' + sizes[3] + '), none with one (' + sizes[1] + ' word: no warm-up)', sizes[2] === 2 && sizes[3] === 3 && sizes[1] === 1, JSON.stringify(sizes));
    check('warm-up: 4-8 with a backlog, more when more is due (' + [4, 6, 7, 10, 13, 16, 30].map(n => n + ' due: ' + sizes[n]).join(', ') + ')', sizes[4] === 4 && sizes[7] === 5 && sizes[10] === 6 && sizes[13] === 7 && sizes[16] === 8 && sizes[30] === 8 && [4, 6, 7, 10, 13, 16, 30].every((n, i, L) => sizes[n] >= 4 && sizes[n] <= 8 && (!i || sizes[n] >= sizes[L[i - 1]])), JSON.stringify(sizes));
    // a 7-card warm-up: three questions, then he runs off for the next card, three more, again, one
    await g.ev(K => { const W = G.words; K.slice(0, 11).forEach(id => Object.assign(W.rec(id), { dd: W.day(), dc: W.dayNum() })); window.__tl = []; const an = G.pet.anim; G.pet.anim = (n, k, a) => { if (k === 'bring') window.__tl.push('B'); return an(n, k, a); }; const ch = G.choose; G.choose = function (q) { if (q.warmup) window.__tl.push('Q'); return ch.apply(this, arguments); }; G.hist.state().wu.d = ''; }, KNOWN.filter(w => !['hola', 'buenosdias', 'gracias'].includes(w)));
    await g.until(() => !!G.warmup.cur(), null, 'the warm-up', 12000);
    const n7 = await g.ev(() => G.warmup.cur().ids.length);
    await g.until(() => G.warmup.cur() && G.warmup.cur().i === 3 && G.warmup.cur().phase === 'bring' && G.pet.npc(G.field).pa && G.pet.npc(G.field).pa.k === 'bring', null, 'the dog bringing the 4th card', 60000).catch(() => {});
    await g.drive(() => !G.warmup.cur() && free(), 'the warm-up');
    const tl = await g.ev(() => window.__tl.join(''));
    check('warm-up: 11 words due: ' + n7 + ' cards; never more than 3 questions in a row: the dog brings the next card (' + tl + ')', n7 === 6 && /^B(Q{1,3}B)*Q{1,3}$/.test(tl) && (tl.match(/Q/g) || []).length === n7 && (tl.match(/B/g) || []).length === 2, tl);
    await g.shot('after_warmup');

    // ---- the mid-session moment ----
    await g.ev(() => { const W = G.words; for (const id of W.list(1)) Object.assign(W.rec(id), { due: null, dd: W.day() + 4, dc: W.dayNum() + 4 }); window.__mid = []; const st = G.warmup.start; G.warmup.start = (f, ids, o) => { window.__mid.push({ ids: (ids || []).slice(), mid: !!(o && o.mid), t: G.sessionTime, running: !!G.chapters.running() }); return st(f, ids, o); }; });
    check('mid: not before ' + await g.ev(() => G.warmup.MID_AT / 60) + ' minutes into the sitting', await g.ev(() => G.warmup.midWait(G.field) === 'early'));
    await g.ev(() => { G.sessionTime = G.warmup.MID_AT + 5; });
    await g.frames(120);
    check('mid: 6-8 minutes in, nothing due: no dog moment', await g.ev(() => !G.warmup.cur() && !window.__mid.length && G.warmup.midWait(G.field) === null && !G.warmup.midPick(G.field).length), JSON.stringify(await g.ev(() => ({ cur: !!G.warmup.cur(), mid: window.__mid, wait: G.warmup.midWait(G.field), pick: G.warmup.midPick(G.field) }))));
    // a story beat going on holds it back
    await g.ev(() => { window.__run0 = G.chapters.running; G.chapters.running = () => ({ id: 'c9', k: 0 }); const W = G.words; for (const id of ['perro', 'gato', 'manzana', 'oso']) Object.assign(W.rec(id), { dd: W.day(), dc: W.dayNum() }); });
    await g.frames(120);
    check('mid: never during a story beat (words due, the beat going on: ' + await g.ev(() => G.warmup.midWait(G.field)) + ')', await g.ev(() => !G.warmup.cur() && !window.__mid.length && G.warmup.midWait(G.field) === 'story'));
    await g.ev(() => { G.chapters.running = window.__run0; });
    await g.until(() => !!G.warmup.cur(), null, 'the mid-session moment', 12000);
    const m = await g.ev(() => { const c = G.warmup.cur(); return { c: { ids: c.ids.slice(), mid: c.mid }, s: window.__mid[0], words: c.ids.every(id => !!G.data.words[id] && G.words.due(id)) }; });
    check('mid: with words due, the dog brings a card: 1-3 due words, nothing else (' + m.c.ids.join(', ') + ')', m.c.mid && m.s.mid && m.c.ids.length >= 1 && m.c.ids.length <= 3 && m.words, JSON.stringify(m));
    await g.until(() => { const n = G.pet.npc(G.field); return n.pa && n.pa.k === 'bring' && G.frame - n.pa.f0 > 30; }, null, 'the dog bringing it');
    await g.shot('mid_bring');
    const ev0 = await g.ev(() => Object.keys(G.hist.day().w).join());
    await g.tap(4 + 13, 4 + 11); // (the skip button)
    await g.until(() => !G.warmup.cur() && free(), null, 'skipped', 6000);
    check('mid: skippable (the same skip button): it ends, nothing asked', await g.ev(ev0 => Object.keys(G.hist.day().w).join() === ev0 && G.hist.state().wu.m && G.hist.state().wu.m.skipped, ev0));
    await g.frames(160);
    check('mid: once a sitting: words still due, it doesn\'t come back (' + await g.ev(() => G.warmup.midWait(G.field)) + ')', await g.ev(() => !G.warmup.cur() && window.__mid.length === 1 && G.warmup.midWait(G.field) === 'done'));
    check('warm-up: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  The listen boards: one in every place, only known words, right grammar; a wrong pick credits nothing; the park's
// =====================================================================
const STRESSED_A = ['agua', 'aguila', 'hambre'];
async function boards(browser) {
  const { ctx, g } = await open(browser, 'ev-boards', true, { listen: true });
  try {
    await game(g, { words: WORDS(false), done: VILLA_DONE.concat(ZONES_DONE), visit: ['playa', 'bosque', 'juegos', 'abuelos', 'montana'] });
    await g.fieldIdle('villa');
    // every word: known (2), only met (1) or not met (0), at random; the boards may use only the known ones
    const r = await g.ev(SA => {
      const RQ = G.requests, W = G.words, D = G.data.words, out = { bad: [], per: {}, ex: {}, zones: {} };
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (const id of Object.keys(D)) { const r = W.rec(id, true), k = rnd(); if (k < 0.65) Object.assign(r, { st: 2, box: 2, fu: 0, due: null, dd: W.day() + 4, dc: W.dayNum() + 4, ms: 0, md: 0 }); else if (k < 0.85) Object.assign(r, { st: 1, box: 1, fu: 0, due: null, dd: W.day() + 4 }); else Object.assign(r, { st: 0 }); }
      for (const id of ['salta', 'gira', 'baila', 'nariz', 'ojos', 'boca', 'uno', 'dos', 'tres', 'concha', 'cangrejo', 'llama', 'marmota', 'grande', 'pequeno']) Object.assign(W.rec(id, true), { st: 2, box: 2, fu: 0, due: null, dd: W.day() + 4, dc: W.dayNum() + 4 });
      const noun = id => { const w = D[id]; const m = w && /^(el|la|los|las) (.+)$/.exec(w.es.split(' / ')[0].trim()); if (!m) return null; const elFem = SA.includes(id); return { g: m[1] === 'la' || m[1] === 'las' || elFem ? 'f' : 'm', plOnly: m[1] === 'los' || m[1] === 'las', elFem }; };
      const DET = { el: [0, 'el'], al: [0, 'el'], del: [0, 'el'], la: [0, 'f'], los: [1, 'm'], las: [1, 'f'], un: [0, 'el'], una: [0, 'f'] };
      const NUMW = { dos: 1, tres: 1, cuatro: 1, cinco: 1, 'cuántos': 'm', 'cuántas': 'f' };
      const TOK = /\[([a-z0-9]+)(?::([^\]]+))?\]/g, plain = t => t.replace(/\[([a-z0-9]+)(?::([^\]]+))?\]/g, (m, id, f) => f || id); // (its own regex: a shared /g one would restart the loop)
      const agree = (text, many) => {
        const bad = []; let m; TOK.lastIndex = 0;
        while ((m = TOK.exec(text))) {
          const n = noun(m[1]); if (!n) continue;
          const before = plain(text.slice(0, m.index)), w = ((/([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+$/.exec(before) || [])[1] || '').toLowerCase();
          const pl = n.plOnly || many(m[1], m[2]);
          if (DET[w]) { const [dp, dg] = DET[w]; if (dp !== (pl ? 1 : 0) || (dg === 'f' && (n.g !== 'f' || (!pl && n.elFem))) || (dg === 'el' && n.g === 'f' && !n.elFem) || (dg === 'm' && n.g !== 'm')) bad.push('"' + w + '" + [' + m[1] + ']'); }
          else if (NUMW[w]) { if (!pl) bad.push(w + ' + a singular [' + m[1] + ']'); if (NUMW[w] !== 1 && NUMW[w] !== n.g) bad.push(w + ' + [' + m[1] + ']'); }
          else bad.push('no article before [' + m[1] + '] ("' + w + '")');
        }
        return bad;
      };
      const people = Object.keys(RQ.SPECS).filter(w => w !== 'dog'), zoneOf = who => (who === 'lola' ? null : G.hearts.zoneOf(who));
      for (const who of people) {
        const spec = RQ.spec(who), z = zoneOf(who); if (z) out.zones[z] = (out.zones[z] || []).concat([who]);
        if (who === 'lola') for (const pz of Object.keys(RQ.SPECS.lola.places)) out.zones[pz] = (out.zones[pz] || []).concat(['lola']);
        for (let i = 0; i < 80; i++) {
          const q = RQ.make(who === 'lola' ? RQ.spec('lola', ['playa', 'bosque', 'abuelos'][i % 3]) : spec, { level: 1 + (i % 2) }); if (!q) continue;
          out.per[who] = (out.per[who] | 0) + 1; out.ex[who + ':' + q.tpl] = q.say;
          const words = q.words.concat(q.answerNum ? [q.answerNum] : []);
          words.forEach(id => { if (W.stage(id) < 2) out.bad.push(who + ': ' + id + ' isn\'t known (' + q.say + ')'); });
          const right = q.kind === 'howmany' ? q.answerNum : q.kind === 'pick' ? q.tray[q.answer] : Array.from({ length: q.n }, () => q.tray[q.answer]);
          if (!RQ.check(q, right).ok) out.bad.push(who + ' the right answer isn\'t right: ' + q.say);
          if (q.kind === 'pick') q.tray.forEach((c, k) => { if (!c.right && RQ.check(q, c).ok) out.bad.push(who + ' a wrong picture is right: ' + q.say); });
          const many = (id, f) => { const n = noun(id); return !!f && !!n && f !== (D[id].es.split(' / ')[0].replace(/^(el|la|los|las) /, '')); };
          agree(q.text, many).forEach(e => out.bad.push(who + ': ' + q.say + ' -> ' + e));
          if (q.verb === 'touch' && RQ.animate(q.thing) && !/^Toca (al|a la|a los|a las) /.test(q.say)) out.bad.push(who + ' (the personal a): ' + q.say);
          if (q.verb === 'howmany' && noun(q.thing) && !q.say.startsWith('¿Cuánt' + (noun(q.thing).g === 'f' ? 'as' : 'os') + ' ')) out.bad.push(who + ': ' + q.say);
          if (/^(Dame|Tráeme)/.test(q.say) && !RQ.holds((who === 'lola' ? RQ.spec('lola', ['playa', 'bosque', 'abuelos'][i % 3]) : spec).things[q.thing])) out.bad.push(who + ' (can\'t be held): ' + q.say);
          if (!/^[¡¿]?[A-ZÁÉÍÓÚ]/.test(q.say)) out.bad.push(who + ' (lowercase): ' + q.say);
        }
      }
      out.lines = ['listen.give', 'listen.touch', 'listen.where', 'listen.self', 'listen.act', 'listen.veces', 'listen.vez'].filter(k => !RQ.LINES[k]);
      out.offers = G.favores.OFFERS.filter(o => o[1] === 'listen' || o[1] === 'carry').map(o => o[0]);
      return out;
    }, STRESSED_A);
    const places = ['villa', 'playa', 'bosque', 'juegos', 'abuelos', 'montana'];
    check('boards: a listen board in every place (' + places.map(z => z + ': ' + (r.zones[z] || []).join('/')).join(', ') + '), each one a favour someone offers', places.every(z => (r.zones[z] || []).some(w => r.offers.includes(w))), JSON.stringify([r.zones, r.offers]));
    check('boards: every board makes requests (' + Object.keys(r.per).map(w => w + ' ' + r.per[w]).join(', ') + ')', ['paco', 'ana', 'lucho', 'pepe', 'lupe', 'abuelo', 'mateo'].every(w => r.per[w] >= 40), JSON.stringify(r.per));
    check('boards: only words she knows, the right answer right and every other picture wrong, the articles and plurals agree, the personal a, ¿Cuántas?, "Dame" only for what can be held (' + Object.keys(r.per).reduce((a, w) => a + r.per[w], 0) + ' requests)', !r.bad.length, r.bad.slice(0, 6).join(' | '));
    console.log('    examples: ' + ['paco:col', 'paco:num', 'paco:size', 'ana:actnum', 'ana:self', 'lucho:size', 'lucho:howmany'].map(k => r.ex[k]).filter(Boolean).join(' / '));
    check('boards: the new templates are in G.requests.LINES (tools/test-spanish.js runs every word through them)', !r.lines.length, r.lines.join());
    // the plain request when no detail is known yet: a beach-first child (shells, crabs, turtles; no colour or number)
    const plain = await g.ev(() => { const W = G.words; for (const id of Object.keys(G.data.words)) { const r = W.rec(id); if (r) r.st = 0; } for (const id of ['concha', 'cangrejo', 'tortuga', 'gaviota']) Object.assign(W.rec(id, true), { st: 2 }); const out = new Set(); for (let i = 0; i < 30; i++) { const q = G.requests.make(G.requests.spec('paco')); if (q) out.add(q.say); } return [...out]; });
    check('boards: a beach-first child (no colour or number known) still gets requests: ' + plain.slice(0, 4).join(' / '), plain.length >= 3 && plain.every(t => /^(Dame la concha\.|Toca (al cangrejo|a la tortuga|a la gaviota)\.|¿Dónde está (el cangrejo|la tortuga|la gaviota)\?)$/.test(t)), plain.join(' | '));
    check('boards: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function listenScene(browser) {
  const { ctx, g } = await open(browser, 'ev-listen', true, { listen: true });
  try {
    await game(g, { words: WORDS(false, { salta: [2, false], gira: [2, false], baila: [2, false], nariz: [2, false], ojos: [2, false], boca: [2, false], cabeza: [2, false] }), done: VILLA_DONE.concat(ZONES_DONE), visit: ['juegos'], map: 'juegos', x: 20, y: 9 });
    await g.until(() => G.field && G.field.mapId === 'juegos' && G.fade.a === 0, null, 'the park');
    await g.drive(() => free(), 'arriving in the park');
    const request = o => g.ev(o => {
      window.__r = undefined; let req = null;
      for (let i = 0; i < 60 && (!req || (o.need || []).some(k => !req.tested[k])); i++) req = G.requests.make(G.requests.spec(o.who), { tpl: o.tpl, level: 1 });
      window.__req = req;
      G.chapters.scene(G.field, (function* () { window.__r = yield* G.listen.run(req, { who: o.who }); if (window.__r === undefined) window.__r = null; })());
      return { say: req.say, words: req.words, tested: req.tested, answer: req.answer, tray: req.tray, n: req.n, thing: req.thing, col: req.col };
    }, o);
    const up = () => g.until(() => { const s = G.top(); return s && s.constructor.name === 'ListenDo' && s.t > 14 && s.phase === 'ask' && G.input.ready(); }, null, 'the request');
    const ev = ids => g.ev(ids => ids.map(id => (G.hist.day().w[id] || [0, ''])[1]), ids);
    // ---- a random wrong pick: the right thing in the wrong colour: no word gets credit ----
    const r1 = await request({ who: 'pepe', tpl: 'col', need: ['col', 'thing'] });
    await up();
    const e0 = await ev(r1.words), right0 = await g.ev(w => w.map(id => G.words.rec(id).right), r1.words);
    const wrongK = r1.tray.findIndex(c => !c.right && c.thing === r1.thing && c.col !== r1.col);
    await g.tapRect(await g.ev(i => G.top().cellRect(i), wrongK));
    await g.until(() => G.top().phase === 'shown', null, 'the right one shown');
    const e1 = (await ev(r1.words)).map((e, i) => e.slice(e0[i].length)), right1 = await g.ev(w => w.map(id => G.words.rec(id).right), r1.words);
    const ti = r1.words.indexOf(r1.thing), ci = r1.words.indexOf(r1.col);
    check('listen: a wrong pick ("' + r1.tray[wrongK].col + '" for "' + r1.say + '"): the colour a miss, the thing she happened to get right NOT credited (' + e1.join(' ') + ')', e1[ci] === 'm' && e1[ti] === '' && right1[ti] === right0[ti], JSON.stringify([e1, right0, right1]));
    await g.tapRect(await g.ev(() => G.top().nextRect()));
    await g.until(() => window.__r !== undefined && free(), null, 'going on');
    // ---- the park: "Salta dos veces": the right picture (the jump, twice), then she jumps twice on the map ----
    await g.ev(() => { window.__acts = []; const a = G.juegos.act, b = G.abuelos.act; G.juegos.act = function* (f, e, k, o) { window.__acts.push((e === G.field.player ? 'me:' : '') + k); yield* a.call(this, f, e, k, o); }; G.abuelos.act = function* (f, e, k, o) { window.__acts.push((e === G.field.player ? 'me:' : '') + k); yield* b.call(this, f, e, k, o); }; });
    const r2 = await request({ who: 'ana', tpl: 'actnum', need: ['num', 'thing'] });
    await up();
    await g.frames(10); await g.shot('ana_actnum');
    check('park: "' + r2.say + '": the tray shows each action as many times as it\'s done (' + r2.tray.map(c => c.thing + '×' + c.n).join(' ') + '), the number and the action tested', r2.tested.num && r2.tested.thing && r2.tray.some(c => c.thing === r2.thing && c.n !== r2.n) && /^(Salta|Gira|Baila) (una vez|dos veces|tres veces)\.$/.test(r2.say), JSON.stringify(r2));
    await g.tapRect(await g.ev(i => G.top().cellRect(i), r2.answer));
    await g.until(() => window.__r !== undefined, null, 'the request done', 15000);
    await g.until(() => free(), null, 'the map free');
    const acts = await g.ev(() => window.__acts.slice());
    check('park: ...right: then her character does it on the map, ' + r2.n + ' time(s) (' + acts.join(', ') + ')', acts.length === r2.n && acts.every(a => a === 'me:' + r2.thing) && await g.ev(() => window.__r.ok && window.__r.first), acts.join());
    const r3 = await request({ who: 'ana', tpl: 'self' });
    await up();
    await g.frames(10); await g.shot('ana_self');
    await g.ev(() => { window.__acts.length = 0; });
    await g.tapRect(await g.ev(i => G.top().cellRect(i), r3.answer));
    await g.until(() => window.__r !== undefined, null, 'the request done', 15000);
    await g.until(() => free(), null, 'the map free');
    check('park: "' + r3.say + '": right, and she touches it (' + (await g.ev(() => window.__acts.join())) + ')', /^Tócate (la|los) /.test(r3.say) && await g.ev(t => window.__acts.join() === 'me:' + t, r3.thing));
    check('listen: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  Phrases: a gold phrase's written pattern fades
// =====================================================================
async function phrases(browser) {
  const { ctx, g } = await open(browser, 'ev-phrases', true, { phrases: true });
  try {
    await game(g, { words: WORDS(false, { galleta: [2, false], leche: [2, false] }), done: VILLA_DONE });
    await g.fieldIdle('villa');
    const look = async st => {
      await g.ev(st => {
        const W = G.words; W.meet('f_quiero', 'phrase'); Object.assign(W.rec('f_quiero'), { st: Math.floor(st), fu: 0, due: null, dd: W.day() + 4, s3n: st === 3 ? W.dayNum() : W.dayNum() - 1 }); G.phrase.state().intro.f_quiero = { d: 0, at: 'villa' }; // (3: gold today; 3.5: gold since yesterday)
        window.__drawn = []; const tc = G.textC, bt = G.bigText, ds = G.phrase.drawSentence, dr = G.PhraseAsk.prototype.draw;
        window.__undo = () => { G.textC = tc; G.bigText = bt; G.phrase.drawSentence = ds; G.PhraseAsk.prototype.draw = dr; };
        G.PhraseAsk.prototype.draw = function () { window.__inAsk = true; try { return dr.apply(this, arguments); } finally { window.__inAsk = false; } }; // (only the request's own drawing: not a card still popping up)
        G.textC = function (ctx, s) { if (window.__inAsk && /Quiero/.test(s)) window.__drawn.push(['card', ctx.globalAlpha]); return tc.apply(this, arguments); };
        G.phrase.drawSentence = function (ctx, x, y, w, h, id, o) { window.__drawn.push(['bubble', o && o.frameAlpha]); return ds.apply(this, arguments); };
        window.__p = undefined; G.chapters.scene(G.field, (function* () { window.__p = yield* G.phrase.ask('f_quiero', { who: 'marta', slots: ['pan', 'galleta', 'leche'], free: true, prompt: '¿Qué quieres?', noInvite: true }); })());
      }, st);
      await g.until(() => G.top().constructor.name === 'PhraseAsk' && G.top().t > 12, null, 'the phrase request');
      await g.frames(4); await g.shot('quiero_stage' + st);
      const d = await g.ev(() => { const out = { card: window.__drawn.filter(x => x[0] === 'card').map(x => x[1]), bubble: window.__drawn.filter(x => x[0] === 'bubble').map(x => x[1]) }; window.__drawn.length = 0; return out; });
      await g.ev(() => { G.top().tapCard(0); G.top().tapCard(1); }); // (built: the frame flies into her bubble and is shown in full)
      await g.until(() => window.__p !== undefined && free(), null, 'the phrase done');
      const built = await g.ev(() => { const n = window.__drawn.filter(x => x[0] === 'bubble' && x[1] === 1).length; window.__undo(); return n; });
      return Object.assign(d, { built, shown: await g.ev(() => G.phrase.patternShown('f_quiero')) });
    };
    const s2 = await look(2), s3 = await look(3), s35 = await look(3.5), s4 = await look(4);
    check('phrases: a phrase not gold yet: its pattern written in full (the frame card, her bubble)', s2.shown === 1 && s2.card.length && s2.card.every(a => a === 1) && s2.bubble.every(a => a == null || a === 1), JSON.stringify(s2));
    check('phrases: gold (stage 3) today: the pattern faint (' + s3.shown + ')', s3.shown > 0 && s3.shown < 1 && s3.card.length && s3.card.every(a => a < 1) && s3.bubble.some(a => a > 0 && a < 1), JSON.stringify(s3));
    check('phrases: gold since an earlier day: the pattern not written at all (S2 review #2/#17: said whole now, it is recalled)', s35.shown === 0 && !s35.card.length && s35.bubble.every(a => a == null || a === 0), JSON.stringify(s35));
    check('phrases: solid (stage 4): not written at all (saying it is recall)', s4.shown === 0 && !s4.card.length && s4.bubble.some(a => a === 0), JSON.stringify(s4));
    check('phrases: ...once built (or said), her bubble shows the whole phrase again', s4.built > 0, JSON.stringify(s4));
    check('phrases: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const SECTIONS = [['forest: a beach word reviewed in the forest (iPad)', forest], ['here: nothing to bring that isn\'t here', here], ['warm-up: its size, the mid-session moment (iPad)', warm],
  ['boards: one in every place, known words, grammar', boards], ['listen: no credit for a wrong pick; the park\'s verbs (iPad)', listenScene], ['phrases: the gold pattern fades (iPad)', phrases]];
const ONLY = process.env.ONLY;
run('Reviews everywhere (polish plan 2.5, 2.10)', ONLY ? SECTIONS.filter(([n]) => n.startsWith(ONLY)) : SECTIONS);
