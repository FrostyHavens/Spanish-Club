// ===== Phrases: "say it to get it" (docs/LEARNING_PLAN_2.md, Phase 2) =====
// A phrase is a FRAME with a SLOT for a word she knows: "Quiero ___" + el helado -> "Quiero un helado". Six patterns
// (content/es/words.js C.phrases): Me llamo ___ (meeting a friend), Quiero ___ (shops and food), ___, por favor (a bonus
// on any request), ¿Dónde está ___? (Nico's hint in hide-and-seek), Me gusta ___ (Lola asks her favourite animal;
// friends ask what she likes), Tengo ___ (giving what she carries: a present, a letter).
// Phrases are learnable items in the word model (words.js: the same record, stages, boxes and history, kept in
// G.state.phrases.r), with their own cards (cards.js: a speech bubble on the card, the frame as its label, the word it
// was last said with as its picture), a "Frases" tab in the deck, a page in the notebook (menus.js) and on the
// grown-ups' Learning page (dashboard.js).
//
// Saying it makes it happen [decided with the parent]:
//   the whole phrase   ("Quiero un helado")  they do it, and the phrase's card and the word's card grow a lot
//   the key word only  ("helado")            they still do it; then the frame is shown as a picture-sentence (her
//                                             speech bubble: "Quiero [helado]") and she's invited to say the whole
//                                             thing: one more try, a bonus if she does, never in the way
//   "por favor"        anywhere: the polite bonus (the "___, por favor" card grows, "¡Qué amable!", a heart)
//   a wrong word       (a request with one right answer: Tengo ___ with what she holds) the card wobbles, greys out
//   the frame alone    ("Quiero") the frame lights up, "¿...?" over the empty slot: say what
//   nothing heard      "¡Otra vez!"
//   taps (the builder) tap the frame card and a word card: they go into her bubble, the sentence is read aloud, it
//                      counts as a built phrase (productive, below saying: it can't make a phrase gold)
// Matching: G.speech.matchPhrase (speech.js): lenient (articles, accents, ¿¡, word order, small mishearings, frame
// synonyms: quisiera, mi nombre es, dónde están...). No colour for el / la: grammar is by ear (people say it right).
//
// Each pattern is introduced once, one at a time (never two in a few minutes), wherever it comes up first in the world:
// two friends model it in a little comic strip (Lola: "Quiero pan." -> she gets bread; Nico: "Quiero una galleta."),
// then "¡Ahora tú!" (PhraseModel). The key word alone is neutral for the phrase [decided]: it still works and counts for
// the word, never as a miss of the phrase; a slipping phrase (an older save's misses) is modelled again (words.js).
//
// API (G.phrase, short P):
//   P.on()  phrases are on (off in tests unless they ask: tools/harness.js {phrases: true} or PHRASES=1)
//   P.def(id) P.ids() P.met(id) P.list(minStage) P.due()    P.sentence(id, slot) ('Quiero un helado.')  P.label(id)
//   P.slot(s) a slot: a word id, {name: true} (her name), {face: npc, es: 'Lola'}, {id, es: 'el pay', icon, alt}
//   P.ready(id, o)   generator: introduces the pattern if it's new (or modelled again when slipping) -> false: not now
//   P.ask(id, o)     generator -> {k, how: 'full' | 'key' | 'built' | 'polite', polite, again, slot} | {cancel} | null
//                    o: {who, prompt, en, slots: [slot...] (the word cards), more (more slots heard, no card), answer
//                    (index of the right slot) | free: true (any), show (a picture held up), cancel (a way out),
//                    onGet: function* (k, res) {...} (they do it: before the invitation), noInvite, cued, extra...}
//   P.request(id, o) generator: P.ready + P.ask; null when phrases are off or the pattern can't be introduced now (the
//                    caller then does what it did before). A request for 'f_quiero' may introduce "por favor" instead.
//   Placements: P.meetName(npc) (Me llamo), P.quiero(who, slots, o), P.donde(who, kinds, onGet), P.tengo(who, it, o),
//   P.favTalk(f) / P.fav() (Lola's question, her favourite animal), P.likeAsk(npc) (a friend asks what she likes),
//   P.warm(id, extra) (the dog's warm-up), P.drawSentence(ctx, ...) (her speech bubble), P.drawPic.
// Saved: G.state.phrases = {r: {id: record}, intro: {id: {d, at}}, named: {npc: day}, fav: {id, d}, likes: {npc: {w, d}},
//   last: play s of the last introduction}.
'use strict';
(function () {
  const P = G.phrase = {};
  const D = () => G.data, Wd = () => G.words, H = () => G.hearts;
  const TT = (t, en) => ({ t, en });
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const day = () => Wd().day();
  P.GAP = 240;       // play seconds between two introductions (one pattern at a time)
  P.NO_NAME = ['mama', 'canelo', 'abuela', 'abuelo', 'bebe']; // (your Mom, your dog, your grandparents, a baby)

  // ---------- the patterns ----------
  P.def = id => (D().phrases && D().phrases[id]) || null;
  P.ids = () => (D().phraseOrder || Object.keys(D().phrases || {})).filter(P.def);
  P.met = id => Wd().met(id);
  P.list = (min = 1) => P.ids().filter(id => Wd().stage(id) >= min);
  P.due = () => P.list(1).filter(id => Wd().due(id)).sort((a, b) => Wd().overdue(b) - Wd().overdue(a));
  P.off = () => !!((typeof window !== 'undefined' && window.__phrasesOff) || (G.debug && G.debug.noPhrases));
  P.on = () => !!G.state && !P.off();
  function st() {
    const s = G.state; if (!isObj(s.phrases)) s.phrases = {};
    const p = s.phrases; for (const k of ['r', 'intro', 'named', 'likes']) if (!isObj(p[k])) p[k] = {};
    return p;
  }
  P.state = () => (G.state ? st() : null);
  P.introduced = id => !!(G.state && st().intro[id]);
  P.named = npc => !!(G.state && st().named[npc] != null);
  // the mic's frames (speech.js matchPhrase): the content's spoken forms
  for (const id of P.ids()) G.speech.FRAMES[id] = P.def(id);

  // ---------- slots: what goes in the frame ----------
  // a slot -> {id, word (a word id), es ('el helado'), icon (a picture), face (a face instead), name, say (what the mic hears)}
  P.slot = function (s) {
    if (s && s.es != null && s.say != null) return s; // (already made)
    if (typeof s === 'string') {
      const w = D().words[s]; if (!w) return { id: s, es: s, icon: s, say: s };
      return { id: s, word: s, es: w.es.split(' / ')[0], icon: w, say: [w.es, w.alt].filter(Boolean).join(' / ') };
    }
    if (s && s.name) { const n = G.st.playerName(); return { id: '_name', name: true, face: 'player', es: n, say: n }; }
    if (s && s.face) { const n = s.es || (G.nameOf(s.face) || '').replace(/^(Profesora|Señor|Señora|Don|Doña) /, '').replace(/ (el|la) .*/, ''); return { id: '_' + s.face, face: s.face, es: n, say: n }; }
    const o = Object.assign({}, s); o.es = o.es || o.id; o.icon = o.icon || o.id; o.say = [o.es, o.alt].filter(Boolean).join(' / ');
    if (o.word && D().words[o.word]) { const w = D().words[o.word]; o.say = [o.say, w.es, w.alt].filter(Boolean).join(' / '); }
    return o;
  };
  const plural = s => /^(los|las) /.test(s.es);
  // the slot as said in this frame: Quiero UN HELADO, Quiero PAN, ¿Dónde está EL GATO?, Me llamo LUZ, Me gusta EL ROJO
  P.slotText = function (id, s) {
    s = P.slot(s); const d = P.def(id) || {}, art = d.art || '';
    if (s.name || s.face) return s.es;
    const es = String(s.es).split(' / ')[0], m = /^(el|la|los|las) (.*)$/.exec(es);
    if (art === 'el') return m ? es : s.word && D().words[s.word].topic === 'colores' ? 'el ' + es : es;
    if (art === 'un') {
      if (!m) return es;
      if ((D().mass || []).indexOf(s.word || s.id) >= 0 || m[1] === 'los' || m[1] === 'las') return m[2];
      return (m[1] === 'el' ? 'un ' : 'una ') + m[2];
    }
    return m ? m[2] : es;
  };
  // the frame's words around the slot: {before, after} ('¿Dónde está', '?'); a plural slot takes the frame's plural
  P.parts = function (id, s) {
    const d = P.def(id) || { es: '___' }, es = s && d.plural && plural(P.slot(s)) ? d.plural : d.es, k = es.indexOf('___');
    return k < 0 ? { before: es, after: '' } : { before: es.slice(0, k).trim(), after: es.slice(k + 3) };
  };
  const cap = t => t.replace(/^([¿¡]?)(\p{L})/u, (m, a, b) => a + b.toUpperCase());
  // the whole sentence, as said ('Quiero un helado.', '¿Dónde está el gato?', 'Una galleta, por favor.')
  P.sentence = function (id, s) {
    s = P.slot(s || P.cardSlot(id));
    const p = P.parts(id, s), t = ((p.before ? p.before + ' ' : '') + P.slotText(id, s) + p.after).replace(/\s+([,?!.])/g, '$1').trim();
    return cap(/[.?!]$/.test(t) ? t : t + '.');
  };
  // the card's label: the frame alone ('Quiero', '¿Dónde está?', 'por favor')
  P.label = id => { const d = P.def(id); return d ? d.es.replace('___', '').replace(/\s+([?])/, '$1').replace(/^,\s*/, '').replace(/\s+/g, ' ').trim() : id; };
  // the card's picture: the slot it was last said with (or the pattern's own)
  // the slot it was last said with (a word, her name, a face, a picture), or null
  P.lastSlot = function (id) {
    const r = G.state ? Wd().rec(id) : null; if (!r || !r.slot) return null;
    if (r.slot === '_name') return { name: true }; if (r.slot.charAt(0) === '_') return { face: r.slot.slice(1) };
    if (D().words[r.slot]) return r.slot; return r.slotPic ? { id: r.slot, es: r.slotEs || r.slot, icon: r.slotPic } : null;
  };
  // the slot a phrase is said with when nothing else is given (its card speaking): the last one, else a usual one
  P.cardSlot = function (id) {
    const d = P.def(id) || {}, l = P.lastSlot(id); if (l) return l;
    if (d.anySlot) return { name: true };
    const L = P.SLOTS[id] || []; return L.find(w => G.state && Wd().met(w)) || L[0] || d.icon;
  };
  // the card's picture: the slot it was last said with, else the pattern's own picture
  P.cardPic = id => { const l = P.lastSlot(id), d = P.def(id) || {}; if (!l && d.anySlot) return { face: 'player' }; const s = P.slot(l || d.icon); return s.face ? { face: s.face } : s.icon; };
  // a picture: a face (a portrait in a square) or an icon, at x, y, k times 16 px
  P.drawPic = function (ctx, pic, x, y, k = 2, t) {
    if (pic && pic.face) {
      const w = 16 * k; ctx.fillStyle = '#10102a'; ctx.fillRect(Math.round(x), Math.round(y), w, w);
      if (H()) { ctx.save(); ctx.beginPath(); ctx.rect(Math.round(x) + 1, Math.round(y) + 1, w - 2, w - 2); ctx.clip(); H().face(ctx, pic.face, Math.round(x) + 1, Math.round(y) + 1, w - 2, t || 0); ctx.restore(); }
      return;
    }
    if (pic) G.drawIcon16(ctx, pic, Math.round(x), Math.round(y), k);
  };
  const slotPic = s => (s.face ? { face: s.face } : s.icon);
  const slotLabel = s => (s.face || s.name ? s.es : s.word ? G.baseForm(s.word) : String(s.es).replace(/^(el|la|los|las) /, ''));

  // ---------- her speech bubble: the frame and the slot as a picture-sentence ----------
  // (x, y, w, h: the bubble; o: {tail: 'left' | 'down', frame: 'ghost' | 'on' | 'lit', slot: null (empty) | a slot,
  //  pulse, t, glow (0..1), col (the frame's colour), small (scale-1 text)}) -> {frame: rect, slot: rect}
  P.drawSentence = function (ctx, x, y, w, h, id, o = {}) {
    const R = (a, b, c, d, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(a), Math.round(b), Math.round(c), Math.round(d)); };
    const ink = '#10102a', paper = o.glow ? '#fff8c8' : '#ffffff';
    // the bubble: a rounded box and its tail
    R(x + 2, y, w - 4, h, ink); R(x, y + 2, w, h - 4, ink); R(x + 1, y + 1, w - 2, h - 2, ink);
    R(x + 2, y + 1, w - 4, h - 2, paper); R(x + 1, y + 2, w - 2, h - 4, paper);
    if (o.tail === 'down') { for (let i = 0; i < 7; i++) { R(x + 18 + i, y + h - 1 + i, 9 - i, 1, ink); R(x + 19 + i, y + h - 1 + i, 7 - i, 1, paper); } }
    else { const ty = y + Math.round(h / 2); for (let i = 0; i < 8; i++) { R(x - i - 1, ty - 4 + Math.round(i / 2), 1, 9 - i, ink); R(x - i, ty - 3 + Math.round(i / 2), 1, 7 - i, paper); } }
    if (o.glow) { ctx.globalAlpha = 0.35 * o.glow; R(x + 2, y + 2, w - 4, h - 4, '#f8e060'); ctx.globalAlpha = 1; }
    const s = o.slot ? P.slot(o.slot) : null, p = P.parts(id, s);
    const sb = o.small ? 22 : 34, gap = 6;
    let k = o.small ? 1 : 2;
    const tw = str => (str ? G.textWidth(str) * k : 0);
    let total = tw(p.before) + (p.before ? gap : 0) + sb + (p.after.trim() ? gap + tw(p.after.trim()) : 0);
    if (total > w - 12 && k === 2) { k = 1; total = tw(p.before) + (p.before ? gap : 0) + sb + (p.after.trim() ? gap + tw(p.after.trim()) : 0); }
    let cx = x + Math.round((w - total) / 2);
    const mid = y + Math.round(h / 2) - (s && !o.noWord ? 4 : 0);
    const fcol = o.frame === 'ghost' ? '#b8bcd0' : o.frame === 'lit' ? '#20a040' : (o.col || '#2860a8');
    const out = {};
    const word = str => {
      const ww = tw(str), bob = o.frame === 'lit' || (o.pulseFrame && (o.t >> 3) & 1) ? -1 : 0;
      if (k === 2) G.bigText(ctx, str, cx + ww / 2, mid - 7 + bob, 2, fcol, null); else G.text(ctx, str, cx, mid - 4 + bob, fcol, null);
      const r = { x: cx, y: mid - 9, w: ww, h: 18 }; cx += ww + gap; return r;
    };
    if (p.before) out.frame = word(p.before);
    // the slot: its picture (and the slot as said under it), or an empty dashed box with a "?"
    const bx = cx, by = mid - Math.round(sb / 2), pulse = !s && o.pulse ? Math.round(Math.sin((o.t || 0) / 6) * 1.5) : 0;
    if (s) {
      P.drawPic(ctx, slotPic(s), bx + (sb - (o.small ? 16 : 32)) / 2, by + (sb - (o.small ? 16 : 32)) / 2, o.small ? 1 : 2, o.t);
      if (!o.noWord) G.textC(ctx, P.slotText(id, s), bx + sb / 2, by + sb + 1, '#604020', null);
    } else {
      const c = o.slotHint ? '#f0a020' : '#8890c0';
      for (let i = 0; i < sb + pulse * 2; i += 4) { R(bx - pulse + i, by - pulse, 2, 1, c); R(bx - pulse + i, by + sb + pulse - 1, 2, 1, c); R(bx - pulse, by - pulse + i, 1, 2, c); R(bx + sb + pulse - 1, by - pulse + i, 1, 2, c); }
      if (k === 2) G.bigText(ctx, '?', bx + sb / 2, by + sb / 2 - 7, 2, c, null); else G.textC(ctx, '?', bx + sb / 2, by + sb / 2 - 4, c, null);
    }
    out.slot = { x: bx, y: by, w: sb, h: sb }; cx += sb + gap;
    if (p.after.trim()) { const a = p.after.trim(); if (!p.before) out.frame = word(a); else word(a); }
    return out;
  };

  // =====================================================================
  //  Counting it: the word model, the history, the cards (words.js, history.js, cards.js)
  // =====================================================================
  // how: 'full' (the whole phrase said), 'again' (said whole after the invitation: right after it was shown and read
  // aloud, so an echo in the history, never a retention test), 'key' (the key word only: NEUTRAL for the phrase
  // [decided with the parent]: no miss and no right, only an encounter; the word in the slot gets its credit and the
  // invitation follows), 'built' (tapped together), 'polite' (the slot + "por favor": the "por favor" phrase)
  P.credit = function (sc, how, k, at) {
    const id = sc.id, s = sc.slots[k], r = Wd().rec(id, true), [bx, by] = at.frame, [sx, sy] = at.slot;
    const rec = () => { r.slot = s.word || s.id; if (!s.word && !s.face && !s.name) { r.slotPic = typeof s.icon === 'string' ? s.icon : null; r.slotEs = s.es; } };
    if (how === 'full' || how === 'again') {
      Wd().answerRight(id, { said: true, mode: 'say', firstTry: how === 'full', echo: how === 'again', noGrow: true, review: Wd().isOld(id) });
      r.said = (r.said | 0) + 1; rec();
      if (G.cards) G.cards.grow(id, 'phrase', { x: bx, y: by });
    } else if (how === 'built') {
      Wd().answerRight(id, { mode: 'both', firstTry: true, noGrow: true, review: Wd().isOld(id) }); rec();
      if (G.cards) G.cards.grow(id, 'build', { x: bx, y: by });
    } else if (how === 'key') Wd().encounter(id); // (it still works, and it's neither a miss nor a right for the phrase)
    // the word in the slot
    const w = s.word;
    if (w && Wd().met(w)) {
      const shown = !!sc.slotView(k).label, said = how !== 'built';
      if (how === 'again') { if (G.cards) G.cards.grow(w, 'say', { add: 3, x: sx, y: sy }); } // (the bonus)
      else {
        if (said && G.mic) G.mic.award(w, sx, sy);
        if (!sc.free) Wd().answerRight(w, { said, mode: said ? (shown ? 'both' : 'say') : (shown ? 'both' : 'pic'), firstTry: !sc.slotMiss, cued: !!sc.o.cued, review: Wd().isOld(w) });
        else if (!said && G.cards) G.cards.grow(w, 'pick', { x: sx, y: sy });
        if (how === 'full' && G.cards) G.cards.grow(w, 'say', { add: 3, x: sx, y: sy }); // (the whole phrase: a bigger boost)
      }
    }
    G.st.autosave();
  };
  // "por favor" heard with a request: the "___, por favor" phrase (met right now if she says it before its introduction)
  P.polite = function (sc, k, at) {
    const id = 'f_porfavor'; if (!P.def(id) || sc.id === id) return;
    if (!P.met(id)) { Wd().meet(id, 'said', { who: sc.o.who }); st().intro[id] = { d: day(), at: 'said' }; }
    const r = Wd().rec(id), s = sc.slots[k];
    Wd().answerRight(id, { said: true, mode: 'say', noGrow: true }); r.said = (r.said | 0) + 1; if (s) r.slot = s.word || s.id;
    if (G.cards) G.cards.grow(id, 'phrase', { x: at.frame[0] + 60, y: at.frame[1] });
    const who = sc.o.who; if (who && H() && H().WHO.includes(who)) H().add(who, 1, 'care');
    G.st.autosave();
  };

  // =====================================================================
  //  Introducing a pattern: two friends model it, then "¡Ahora tú!" (PhraseModel)
  // =====================================================================
  const FIRST = id => (G.nameOf(id) || '').replace(/^(Profesora|Señor|Señora|Don|Doña|Abuela) /, '').replace(/ (el|la) .*/, '');
  P.shortName = FIRST;
  // the words a pattern is usually said with (the models' slots when the moment has too few of its own)
  P.SLOTS = {
    f_quiero: ['pan', 'galleta', 'manzana', 'helado', 'agua', 'leche', 'platano', 'naranja', 'queso', 'chocolate', 'mora'],
    f_porfavor: ['pan', 'agua', 'galleta', 'manzana', 'helado', 'leche', 'chocolate'],
    f_donde: ['gato', 'perro', 'pato', 'conejo', 'pelota', 'rana', 'pajaro', 'gallina', 'oso', 'ardilla', 'cangrejo', 'vaca', 'llama'],
    f_gusta: ['gato', 'perro', 'helado', 'pan', 'manzana', 'pelota', 'oso', 'pato', 'conejo', 'galleta', 'flor'],
    f_tengo: ['manzana', 'pelota', 'flor', 'concha', 'hoja', 'carta', 'hueso', 'galleta', 'bellota'],
  };
  // where a thing might be (the listener's answer to "¿Dónde está...?" in a model)
  const PLACES = ['arbol', 'casa', 'flor', 'fuente', 'granja', 'parque', 'banco'];
  const metW = id => !!D().words[id] && Wd().met(id) && G.iconDrawn(id);
  // the two models: [{who (says it), to (hears it), slot}]
  P.models = function (id, o = {}) {
    const who = o.who && o.who !== 'player' ? o.who : null;
    const askers = ['lola', 'nico'], hear = a => (who && who !== a ? who : askers.find(x => x !== a));
    if (id === 'f_llamo') return askers.map(a => ({ who: a, to: hear(a), slot: { face: a } }));
    const fromMoment = (o.slots || []).map(P.slot).filter(s => !s.word || metW(s.word));
    const extra = (P.SLOTS[id] || []).filter(metW).map(P.slot);
    const pool = [];
    for (const s of fromMoment.concat(extra)) if (!pool.some(p => p.id === s.id)) pool.push(s);
    if (!pool.length) pool.push(P.slot(P.def(id).icon));
    return askers.map((a, i) => ({ who: a, to: hear(a), slot: pool[i % pool.length], place: PLACES[(i * 3 + day()) % PLACES.length] }));
  };
  class PhraseModel {
    constructor(id, models, o, w) {
      G.toastT = 0; this.transparent = true; this.id = id; this.models = models; this.o = o; this.w = w; this.t = 0;
      this.row = 0; this.rt = 0; this.n = models.length + (o.noNow ? 0 : 1); this.done = false;
    }
    hintXY() { return this.row >= this.n - 1 && this.rt > 50 ? [G.W / 2, G.H - 26] : null; }
    rowY(r) { return 12 + r * 66; }
    update() {
      this.t++; this.rt++;
      const m = this.models[this.row], last = this.row >= this.models.length;
      if (!last) {
        if (this.rt === 6) G.speak(P.sentence(this.id, m.slot));
        if (this.rt === 70) { G.audio.sfx(this.id === 'f_gusta' ? 'chime' : 'pop'); }
        if (this.rt === 96) G.speak(this.reply(m));
        if (this.rt >= 150) this.next();
      } else if (this.rt === 4) { G.speak('¡Ahora tú!'); G.audio.sfx('note'); }
      if (G.input.tap() || G.input.p('A') || G.input.p('B')) {
        if (!last && this.rt > 12) this.next();
        else if (last && this.rt > 30) { G.audio.sfx('ok'); G.pop(); this.w.resolve(true); }
      }
    }
    next() { this.row++; this.rt = 0; if (this.row >= this.n) { G.pop(); this.w.resolve(true); } }
    reply(m) {
      const d = P.def(this.id);
      if (this.id === 'f_llamo') return '¡Hola, ' + P.slot(m.slot).es + '!';
      return G.fill(d.reply || '¡Muy bien!');
    }
    draw(ctx) {
      const R = (a, b, c, d, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(a), Math.round(b), Math.round(c), Math.round(d)); };
      ctx.globalAlpha = Math.min(1, this.t / 8) * 0.5; R(0, 0, G.W, G.H, '#080c28'); ctx.globalAlpha = 1;
      G.win(ctx, 6, 6, G.W - 12, G.H - 12, { fill1: '#fdf6e4', fill2: '#efe2c4', alpha: 1 });
      const rows = Math.min(this.row + 1, this.n);
      for (let r = 0; r < rows; r++) {
        const y = this.rowY(r), lt = r === this.row ? this.rt : 999, last = r >= this.models.length;
        if (last) { this.drawNow(ctx, y, lt); continue; }
        const m = this.models[r], pop = Math.min(1, lt / 10);
        this.face(ctx, m.who, 14, y + 4, 40);
        this.face(ctx, m.to, G.W - 56, y + 4, 40);
        // the bubble pops in; its frame lights up while it's said
        ctx.save(); const cx = 62 + 83, cy = y + 25; ctx.translate(cx, cy); ctx.scale(0.4 + 0.6 * pop, 0.4 + 0.6 * pop); ctx.translate(-cx, -cy);
        P.drawSentence(ctx, 62, y + 2, 166, 46, this.id, { slot: m.slot, frame: lt > 6 && lt < 70 ? 'lit' : 'on', col: '#a05020', t: this.t });
        ctx.restore();
        // what happens: the thing goes to the one who asked (Quiero, por favor), or from the one who has it (Tengo),
        // a heart (Me gusta), the place where it is (¿Dónde está?), a wave (Me llamo)
        const s = P.slot(m.slot), k = Math.max(0, Math.min(1, (lt - 70) / 26)), e = k * k * (3 - 2 * k);
        const fx = G.W - 36, tx = 34, yy = y + 24;
        if (lt >= 70 && k < 1) {
          if (this.id === 'f_quiero' || this.id === 'f_porfavor') P.drawPic(ctx, slotPic(s), fx + (tx - fx) * e - 16, yy - Math.sin(k * Math.PI) * 20 - 16, 2);
          else if (this.id === 'f_tengo') P.drawPic(ctx, slotPic(s), tx + (fx - tx) * e - 16, yy - Math.sin(k * Math.PI) * 20 - 16, 2);
        }
        if (lt >= 96 || (this.id === 'f_donde' && lt >= 70)) { // where it is: the place, and it peeking out
          if (this.id === 'f_donde') { const bx = G.W - 86, by = y + 10; R(bx, by, 24, 24, '#10102a'); R(bx + 1, by + 1, 22, 22, '#d8ecff'); G.drawIcon16(ctx, m.place, bx + 4, by + 6); P.drawPic(ctx, slotPic(s), bx + 7, by + 1 - Math.round(Math.abs(Math.sin(lt / 8)) * 3), 0.625); }
        }
        if (lt >= 96) { // the one who heard it answers (under their face)
          const txt = this.reply(m), rw = G.textWidth(txt) + 10 + (this.id === 'f_gusta' ? 10 : 0), rx = G.W - 12 - rw, ry = y + 50;
          G.win(ctx, rx, ry, rw, 14, { fill1: '#ffffff', fill2: '#f0f0f8', alpha: 1 });
          if (this.id === 'f_gusta' && H()) H().heart(ctx, rx + 4, ry + 4, true, 1);
          G.text(ctx, txt, rx + 5 + (this.id === 'f_gusta' ? 10 : 0), ry + 4, '#203080', null);
        }
      }
    }
    // the last row: her face, her bubble with the frame and an empty slot, "¡Ahora tú!"
    drawNow(ctx, y, lt) {
      this.face(ctx, 'player', 14, y + 4, 40);
      const pop = Math.min(1, lt / 10);
      ctx.save(); const cx = 145, cy = y + 25; ctx.translate(cx, cy); ctx.scale(0.4 + 0.6 * pop, 0.4 + 0.6 * pop); ctx.translate(-cx, -cy);
      P.drawSentence(ctx, 62, y + 2, 166, 46, this.id, { slot: null, frame: 'on', col: '#a05020', pulse: true, t: this.t });
      ctx.restore();
      const b = Math.round(Math.abs(Math.sin(this.t / 9)) * -3);
      G.textC(ctx, '¡Ahora tú!', G.W - 40, y + 6 + b, '#d04010', null);
      if (G.mic && G.mic.on()) { // a mic: say it
        ctx.fillStyle = '#10102a'; ctx.beginPath(); ctx.arc(G.W - 40, y + 32, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e85078'; ctx.beginPath(); ctx.arc(G.W - 40, y + 32, 12, 0, Math.PI * 2); ctx.fill();
        G.mic.glyph(ctx, G.W - 43, y + 28, '#ffffff');
        G.mic.waves(ctx, G.W - 40, y + 32, 15, '#f8a0c0', 1, this.t >> 1);
      }
      if (lt > 30) G.moreArrow(ctx, G.W - 22, G.H - 18, this.t);
    }
    // a face in a frame, the name on a strip at its bottom
    face(ctx, who, x, y, w) {
      const R = (a, b, c, d, col) => { ctx.fillStyle = col; ctx.fillRect(a, b, c, d); };
      R(x - 2, y - 2, w + 4, w + 4, '#5a3810'); R(x - 1, y - 1, w + 2, w + 2, '#f8e0a0');
      if (H()) H().face(ctx, who, x, y, w, this.t);
      const nm = who === 'player' ? G.st.playerName() : FIRST(who) || G.nameOf(who) || '';
      ctx.globalAlpha = 0.7; R(x, y + w - 9, w, 9, '#10102a'); ctx.globalAlpha = 1;
      G.textC(ctx, nm, x + w / 2, y + w - 8, '#fff8e0', null);
    }
  }
  G.PhraseModel = PhraseModel;
  // one pattern at a time: none introduced in the last P.GAP play seconds, and every word of the moment met a while ago
  P.canIntro = function (id, o = {}) {
    if (!P.on() || !P.def(id)) return false;
    const last = st().last; if (last != null && Wd().now() - last < P.GAP) return false;
    const fresh = (o.slots || []).some(s => { const w = typeof s === 'string' ? s : s && s.word; const r = w && Wd().rec(w); return !!r && r.st >= 1 && r.met != null && r.ms === Wd().sess() && Wd().now() - r.met < 60; });
    return !fresh;
  };
  P.intro = function* (id, o = {}) {
    const w = new G.Wait(); G.push(new PhraseModel(id, P.models(id, o), o, w)); yield w;
    if (o.again) { Wd().reintroduced(id); return; }
    Wd().meet(id, 'phrase', { who: o.who });
    st().intro[id] = { d: day(), at: (G.field && G.field.mapId) || '' }; st().last = Wd().now();
    if (G.intro) yield G.intro.note([id]);
    for (let i = 0; i < 90 && G.cards && G.cards.popping(id); i++) yield 1; // (her new card says itself and flies into the deck first: the request's bubble stays clear)
    G.st.autosave();
  };
  // introduce it if it's new (false: not now; the caller does what it did before); model it again when it's slipping
  P.ready = function* (id, o = {}) {
    if (!P.on() || !P.def(id)) return false;
    if (!P.met(id)) { if (!P.canIntro(id, o)) return false; yield* P.intro(id, o); return true; }
    if (Wd().needsReintro(id)) yield* P.intro(id, Object.assign({}, o, { again: true, noNow: true }));
    return true;
  };

  // =====================================================================
  //  Say it to get it: the request (PhraseAsk)
  // =====================================================================
  const GOLD = '#f8d860', BLUE = '#a8d8ff';
  const fit = (s, w) => { if (G.textWidth(s) <= w || !s.includes(' ')) return [s]; let best = null; for (let i = s.indexOf(' '); i >= 0; i = s.indexOf(' ', i + 1)) { const d = Math.abs(G.textWidth(s.slice(0, i)) - G.textWidth(s.slice(i + 1))); if (!best || d < best.d) best = { d, i }; } return [s.slice(0, best.i), s.slice(best.i + 1)]; };
  class PhraseAsk {
    constructor(id, o, w) {
      G.toastT = 0; this.transparent = true; this.id = id; this.def = P.def(id); this.o = o; this.w = w; this.t = 0;
      this.slots = (o.slots || []).map(P.slot);
      this.cardsN = this.slots.length; // (the word cards; o.more are heard but have no card)
      this.slots = this.slots.concat((o.more || []).map(P.slot).filter(s => !this.slots.some(x => x.id === s.id)));
      this.free = !!o.free || o.answer == null; this.answer = o.answer;
      this.invite = o.invite != null ? o.invite : null;
      this.placed = { frame: this.invite != null, slot: this.invite != null ? this.invite : -1 };
      this.off = {}; this.miss = null; this.won = null; this.lit = 0; this.ask = 0; this.sel = 0; this.politeT = 0; this.tries = 0; this.fly = [];
      this.prompt = G.fill(this.invite != null ? '' : (o.prompt || this.def.prompt || ''));
      this.lines = this.prompt ? G.richLayout(this.prompt, this.textW()) : [];
      this.mic = G.mic && G.mic.on() ? new G.MicBtn(this, { rect: () => this.micRect(), ready: () => !this.won && this.t > 10 && (!this.miss || this.miss.t > 8), heard: a => this.heard(a), again: () => this.hear() }) : null;
      G.richIds(this.prompt).forEach(i => G.st.see(i));
      if (this.invite != null) G.speak(P.sentence(id, this.slots[this.invite])); else if (this.prompt) G.speak(this.prompt);
    }
    onEnter() { if (this.mic) this.mic.arm(); }
    onExit() { if (this.mic) this.mic.off(); }
    // ---------- where things are ----------
    left() { return this.o.cancel ? 30 : 0; }
    textW() { return G.W - 24 - 34 - 30 - (this.o.show ? 40 : 0) - this.left(); }
    box() { return { x: 12, y: 6, w: G.W - 24, h: Math.max(32, this.lines.length * 16 + 12) }; }
    bubble() { const b = this.box(); return { x: 66, y: b.y + b.h + 8, w: 188, h: 56 }; }
    faceRect() { const u = this.bubble(); return { x: 12, y: u.y + 6, w: 44, h: 44 }; }
    micRect() { const u = this.bubble(); return { x: G.W - 58, y: u.y + 5, w: 46, h: 46 }; }
    spk() { return [G.W - 38, 12]; }
    backXY() { return this.o.cancelIcon === 'skip' ? [4, 4] : [18, 12]; }
    cancelHit() { return this.o.cancelIcon === 'skip' ? G.skipHit(...this.backXY()) : G.btnHit(...this.backXY()); }
    nextRect() { return { x: G.W - 50, y: G.H - 44, w: 40, h: 34 }; }
    // the cards: the frame card first, then a card per word (o.slots)
    rects() {
      if (this.invite != null) return [];
      const n = 1 + this.cardsN, cw = 58, gap = n > 4 ? 6 : 10, tw = n * cw + (n - 1) * gap, x0 = Math.round((G.W - tw) / 2), y0 = G.H - 86;
      const out = []; for (let k = 0; k < n; k++) out.push({ x: x0 + k * (cw + gap), y: y0, w: cw, h: 78 });
      return out;
    }
    // how a word card looks: its picture; its word too while it's only met (stage 1), a name always (o.words: always)
    slotView(k) {
      const s = this.slots[k]; if (!s) return {};
      const st = s.word ? Wd().stage(s.word) : 1, label = s.face || s.name || !s.word || st <= 1 || this.o.words ? slotLabel(s) : null;
      return { pic: slotPic(s), label, col: st >= 3 ? GOLD : BLUE };
    }
    // the bubble's parts on screen (the frame's words, the slot box): for the cards that fly in, the growth that pops up
    parts() { const u = this.bubble(); return this._parts || { frame: { x: u.x + 10, y: u.y + 18, w: 60, h: 18 }, slot: { x: u.x + u.w - 50, y: u.y + 10, w: 34, h: 34 } }; } // (as last drawn)
    at() { const p = this.parts(); return { frame: [p.frame.x + p.frame.w / 2, p.frame.y], slot: [p.slot.x + p.slot.w / 2, p.slot.y] }; }
    // where the cards that grow pop up: under her bubble (the finished sentence stays in sight), the phrase's on the left
    growAt() { const u = this.bubble(); return { frame: [u.x + 40, G.H - 4], slot: [u.x + u.w - 20, G.H - 4] }; }
    hintXY() { return null; } // (never point at a word: it's her choice, or the answer)
    // ---------- what she does ----------
    hear() { G.speak(this.placed.slot >= 0 ? P.sentence(this.id, this.slots[this.placed.slot]) : P.label(this.id)); }
    heard(alts) {
      const m = G.speech.matchPhrase(this.id, this.slots.map(s => s.say), alts), ok = k => k >= 0 && !this.off[k] && (this.free || k === this.answer);
      this.lastHeard = m;
      if (this.invite != null) { // one more try: the whole thing, for a bonus
        this.tries++;
        if (m.full && (m.slot < 0 || m.slot === this.invite || this.free)) { this.win('again', this.invite, m.polite); return; }
        if (m.slot >= 0 || m.frame) { this.lit = 30; this.finish({ again: false }, 40); G.fx.say('¡Bien!', ...this.sayAt(), '#a8f0ff', true); return; }
        this.mic.miss(); return;
      }
      if (m.full && (ok(m.slot) || (m.slot < 0 && this.def.anySlot))) { this.win('full', m.slot < 0 ? 0 : m.slot, m.polite); return; }
      if (ok(m.slot) && m.polite && this.id !== 'f_porfavor') { this.win('polite', m.slot, true); return; }
      if (ok(m.slot)) { this.win('key', m.slot, m.polite); return; }
      if (m.slot >= 0 && m.slot < this.cardsN && !this.off[m.slot]) { if (m.frame) this.lit = 50; this.wrong(m.slot); return; }
      if (m.frame) { this.lit = 70; this.ask = 70; G.audio.sfx('huh'); G.fx.say('¿...?', ...this.slotAt(), '#ffd8a8', true); return; }
      this.mic.miss();
    }
    sayAt() { const u = this.bubble(); return [u.x + u.w / 2, u.y - 6]; }
    slotAt() { const p = this.parts(); return [p.slot.x + p.slot.w / 2, p.slot.y - 6]; }
    // a wrong word (a request with one right answer): its card wobbles and greys out; the answer's word: a miss
    wrong(k) {
      this.off[k] = true; this.miss = { k, t: 0 }; G.audio.sfx('boop'); G.fx.shake = 4;
      const r = this.rects()[k + 1]; G.fx.say('¡Casi!', r ? r.x + r.w / 2 : G.W / 2, r ? r.y - 8 : G.H - 100, '#ffd8a8');
      const a = this.slots[this.answer]; if (!this.slotMiss && a && a.word && Wd().met(a.word)) Wd().answerWrong(a.word);
      this.slotMiss = true;
      if (this.placed.slot === k) this.placed.slot = -1;
    }
    tapCard(k) {
      if (this.won) return;
      if (k === 0) { // the frame card goes into her bubble
        if (this.placed.frame) { G.speak(P.label(this.id)); return; }
        this.placed.frame = true; G.audio.sfx('select'); this.flyIn(0);
        G.speak(P.parts(this.id, this.placed.slot >= 0 ? this.slots[this.placed.slot] : null).before || P.label(this.id));
      } else {
        const j = k - 1; if (this.off[j]) { G.audio.sfx('boop'); return; }
        if (!this.free && j !== this.answer) { this.wrong(j); return; }
        this.placed.slot = j; G.audio.sfx('select'); this.flyIn(k);
        if (!this.placed.frame) G.speak(P.slotText(this.id, this.slots[j]));
      }
      if (this.placed.frame && this.placed.slot >= 0) { G.speak(P.sentence(this.id, this.slots[this.placed.slot])); this.win('built', this.placed.slot, false); }
    }
    flyIn(k) { const r = this.rects()[k]; if (r) this.fly.push({ k, x: r.x + r.w / 2, y: r.y + 30, t: 0 }); }
    win(how, k, polite) {
      if (this.won) return;
      this.won = { how, k, t: 0, polite: !!polite }; this.placed.slot = k;
      if (how === 'full' || how === 'again' || how === 'built') this.placed.frame = true;
      const at = this.at(), ga = this.growAt();
      P.credit(this, how, k, ga);
      if (polite || how === 'polite') { P.polite(this, k, ga); this.politeT = 70; }
      G.audio.sfx(how === 'key' ? 'chime' : 'micstar'); G.fx.burst(...at.slot);
      if (how === 'full' || how === 'again') { G.fx.ring(at.frame[0], at.frame[1] + 9, 30, '#70e0ff', 24); for (let i = 0; i < 6; i++) G.fx.twinkle(this.bubble().x + Math.random() * this.bubble().w, this.bubble().y + Math.random() * this.bubble().h); }
      const praise = how === 'full' || how === 'again' ? '¡Muy bien dicho!' : how === 'built' ? '¡Muy bien!' : '¡Bien!';
      G.fx.say(this.politeT ? '¡Qué amable!' : praise, ...this.sayAt(), how === 'built' ? '#f8e060' : this.politeT ? '#ffb8d8' : '#a8f0ff', true);
      if (this.mic && how !== 'built') this.mic.win();
      const res = how === 'again' ? { again: true } : { k, how, polite: !!(polite || how === 'polite'), slot: this.slots[k], said: how !== 'built' };
      this.finish(res, how === 'key' ? 46 : 60);
    }
    finish(res, after) { this.result = res; this.closeT = after; }
    cancel() { G.audio.sfx('cancel'); G.pop(); if (this.o.onCancel) this.o.onCancel(); this.w.resolve({ cancel: true }); }
    // ---------- every frame ----------
    update() {
      this.t++; if (this.miss) this.miss.t++; if (this.lit > 0) this.lit--; if (this.ask > 0) this.ask--; if (this.politeT > 0) this.politeT--;
      this.fly = this.fly.filter(f => ++f.t < 14);
      if (this.result) { if (this.won) this.won.t++; if (--this.closeT <= 0) { G.pop(); this.w.resolve(this.result); } return; }
      if (this.mic && this.mic.update()) return;
      if (G.input.p('C') || (G.speakerHit(...this.spk()) && G.input.eat())) { if (this.invite != null) this.hear(); else G.speak(this.prompt); return; }
      const R = this.rects(), calm = !this.miss || this.miss.t > 8;
      if (G.input.tap() && this.t > 8) {
        if (this.o.cancel && this.cancelHit()) { this.cancel(); return; }
        if (this.invite != null && G.tapIn(this.nextRect())) { G.audio.sfx('ok'); this.finish({ again: false }, 1); return; }
        const u = this.bubble(); if (G.tapIn(u.x, u.y, u.w, u.h)) { this.hear(); return; }
        const k = R.findIndex(r => G.tapIn(r.x - 4, r.y - 4, r.w + 8, r.h + 6));
        if (k >= 0 && calm) { this.sel = k; this.tapCard(k); }
        return;
      }
      if (this.invite != null) { if (G.input.p('A')) { G.audio.sfx('ok'); this.finish({ again: false }, 1); } return; }
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') { this.sel = (this.sel + (d === 'left' ? R.length - 1 : 1)) % R.length; G.audio.sfx('cursor'); }
      if (G.input.p('A') && this.t > 8 && calm) this.tapCard(this.sel);
      if (G.input.p('B') && this.o.cancel) this.cancel();
    }
    // ---------- drawing ----------
    draw(ctx) {
      const o = this.o, b = this.box(), won = this.won, wt = won ? won.t : 0;
      // the one asking: their face, their words (a speaker to hear them again), a picture held up
      if (this.invite == null) {
        G.win(ctx, b.x, b.y, b.w, b.h);
        const fx = b.x + 4 + this.left();
        if (o.who && H()) { ctx.fillStyle = '#10102a'; ctx.fillRect(fx, b.y + 3, 26, 26); H().face(ctx, o.who, fx + 1, b.y + 4, 24, this.t); }
        G.richDraw(ctx, this.lines, fx + (o.who ? 32 : 4), b.y + 6 + Math.max(0, Math.round((b.h - 12 - this.lines.length * 16) / 2)));
        if (o.show) G.drawIcon16(ctx, o.show, G.W - 80, b.y + 2, 2);
        G.speakerBtn(ctx, ...this.spk());
        if (o.cancel) { if (o.cancelIcon === 'skip') G.skipBtn(ctx, ...this.backXY(), this.t); else G.iconBtn(ctx, 'back', ...this.backXY()); }
      } else G.speakerBtn(ctx, ...this.spk());
      if (o.drawExtra) { try { o.drawExtra(ctx, this); } catch (e) { console.error(e); } }
      // her face and her speech bubble (the picture-sentence)
      const f = this.faceRect(), u = this.bubble();
      ctx.fillStyle = '#10102a'; ctx.fillRect(f.x - 2, f.y - 2, f.w + 4, f.h + 4); ctx.fillStyle = '#f8e0a0'; ctx.fillRect(f.x - 1, f.y - 1, f.w + 2, f.h + 2);
      if (H()) H().face(ctx, 'player', f.x, f.y, f.w, this.t);
      const sOn = this.placed.slot >= 0 ? this.slots[this.placed.slot] : null, demo = G.demo && G.demo.cur && G.demo.cur.top === this && G.demo.cur.kind === 'phrasesay' && G.demo.cur.talk ? G.demo.cur.talk : 0;
      const frameState = won && (won.how === 'key' || won.how === 'polite') ? 'ghost' : this.placed.frame || this.lit > 0 || (demo && (demo >> 4) % 3 === 0) ? (this.lit > 0 || (won && wt < 30) || demo ? 'lit' : 'on') : this.invite != null ? 'on' : 'ghost';
      const glow = won ? Math.max(0, 1 - wt / 40) : this.invite != null ? 0.3 + 0.3 * Math.sin(this.t / 8) : 0;
      ctx.save();
      if (won && wt < 12) { const s = 1 + 0.08 * Math.sin(wt / 12 * Math.PI), cx = u.x + u.w / 2, cy = u.y + u.h / 2; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
      this._parts = P.drawSentence(ctx, u.x, u.y, u.w, u.h, this.id, { slot: sOn, frame: frameState, col: Wd().stage(this.id) >= 3 ? '#b07000' : '#2860a8', pulse: true, t: this.t, glow, slotHint: this.ask > 0 || (demo && (demo >> 4) % 3 === 1), pulseFrame: this.invite != null });
      ctx.restore();
      if (this.politeT > 0 && H()) for (let i = 0; i < 3; i++) { const k = (70 - this.politeT + i * 12) % 40; H().heart(ctx, f.x + 8 + i * 12, f.y - 4 - k, true, 1); }
      // the word cards (and the frame card) that fly into the bubble
      for (const fl of this.fly) { const p = this.parts(), tg = fl.k === 0 ? p.frame : p.slot, e = fl.t / 14, x = fl.x + (tg.x + tg.w / 2 - fl.x) * e, y = fl.y + (tg.y + tg.h / 2 - fl.y) * e - Math.sin(e * Math.PI) * 20; ctx.globalAlpha = 1 - e * 0.5; if (fl.k === 0) G.cards.bubble(ctx, x - 13, y - 11, 2); else P.drawPic(ctx, slotPic(this.slots[fl.k - 1]), x - 16, y - 16, 2, this.t); ctx.globalAlpha = 1; }
      if (this.invite != null) this.drawInvite(ctx); else this.drawCards(ctx);
      if (this.mic) this.mic.draw(ctx);
    }
    drawCards(ctx) {
      const R = this.rects(), won = this.won, keys = G.hint && G.hint.keyboard && G.hint.keyboard();
      R.forEach((r, k) => {
        const sel = keys && k === this.sel && !won, frame = k === 0, j = k - 1, placed = frame ? this.placed.frame : this.placed.slot === j;
        const off = !frame && this.off[j], m = this.miss, wob = m && m.k === j && m.t < 16 ? Math.round(Math.sin(m.t * 1.7) * 3 * (1 - m.t / 16)) : 0;
        const bob = sel ? Math.round(Math.sin(this.t / 6) * 1.5) : 0, x = r.x + wob, y = r.y - bob;
        if (placed) { // (it's in her bubble now: a dashed place where it was)
          ctx.fillStyle = '#8890c0'; for (let i = 0; i < r.w; i += 4) { ctx.fillRect(x + i, y, 2, 1); ctx.fillRect(x + i, y + r.h - 1, 2, 1); } for (let i = 0; i < r.h; i += 4) { ctx.fillRect(x, y + i, 1, 2); ctx.fillRect(x + r.w - 1, y + i, 1, 2); }
          return;
        }
        if (frame) { // the frame card: a speech bubble and the frame's words
          G.win(ctx, x, y, r.w, r.h, sel ? { fill1: '#fff8d0', fill2: '#f8e8a0', alpha: 1 } : { fill1: '#ffffff', fill2: '#e8f0ff', alpha: 1 });
          G.cards.bubble(ctx, x + r.w / 2 - 13, y + 8, 2, '#ffffff');
          const L = fit(P.label(this.id), r.w - 12), col = Wd().stage(this.id) >= 3 ? '#b07000' : '#2860a8'; // (a margin inside the card's rim: "por / favor")
          L.forEach((l, i) => G.textC(ctx, l, x + r.w / 2, y + 44 + i * 10 - (L.length - 1) * 4, col, null));
          return;
        }
        const v = this.slotView(j);
        G.win(ctx, x, y, r.w, r.h, off ? { fill1: '#5c6074', fill2: '#363a4c' } : sel ? { fill1: '#3a56c8', fill2: '#1c2c8c' } : {});
        ctx.globalAlpha = off ? 0.5 : 1;
        if (v.pic && v.pic.face) { ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x + r.w / 2 - 17, y + 11, 34, 34); P.drawPic(ctx, v.pic, x + r.w / 2 - 16, y + 12, 2, this.t); }
        else G.drawIcon16(ctx, v.pic, x + r.w / 2 - 16, y + 12, 2, 'card');
        if (v.label) { const L = fit(v.label, r.w - 4); L.forEach((l, i) => G.textC(ctx, l, x + r.w / 2, y + Math.min(56, r.h - 9) - (L.length - 1 - i) * 9 + (L.length > 1 ? 2 : 0), off ? '#a8acb8' : v.col)); }
        ctx.globalAlpha = 1;
      });
    }
    // the invitation: her bubble with the whole phrase, the big mic, a "go on" arrow (never in the way)
    drawInvite(ctx) {
      const n = this.nextRect(); // "not now, go on": the skip arrows (as the dog's warm-up), a little bigger
      ctx.save(); ctx.translate(n.x + 2, n.y + 2); ctx.scale(1.4, 1.4); G.skipBtn(ctx, 0, 0, this.t); ctx.restore();
      const u = this.bubble(), y = u.y + u.h + 16;
      // the whole phrase is two pieces: the frame card and the word, side by side (say both!)
      const s = this.slots[this.invite], cx = G.W / 2 - 40;
      G.win(ctx, cx - 30, y, 60, 56, { fill1: '#ffffff', fill2: '#e8f0ff', alpha: 1 }); G.cards.bubble(ctx, cx - 13, y + 6, 2); { const L = fit(P.label(this.id), 50); L.forEach((l, i) => G.textC(ctx, l, cx, y + 38 + i * 9 - (L.length - 1) * 5, '#2860a8', null)); } // ("¿Dónde / está?": both lines)
      G.bigText(ctx, '+', G.W / 2, y + 22, 2, '#f8e060');
      G.win(ctx, cx + 50, y, 60, 56, { fill1: '#ffffff', fill2: '#fff0d0', alpha: 1 }); P.drawPic(ctx, slotPic(s), cx + 64, y + 6, 2, this.t);
      const L = fit(P.slotText(this.id, s), 56); L.forEach((l, i) => G.textC(ctx, l, cx + 80, y + 40 + i * 8 - (L.length - 1) * 3, '#604020', null));
    }
  }
  G.PhraseAsk = PhraseAsk;
  P.cur = () => { const s = G.top(); return s instanceof PhraseAsk ? s : null; };

  // the request itself (no introduction here: P.ready first) -> its result
  P.ask = function* (id, o = {}) {
    if (!P.def(id)) return null;
    const w = new G.Wait(); G.push(new PhraseAsk(id, o, w));
    const r = yield w; const res = r.result || {};
    if (res.cancel) return res;
    if (o.onGet) yield* o.onGet(res.k, res);
    // the key word only: they did it; now the whole phrase, shown as a picture-sentence, one more try (never in the way)
    if (res.how === 'key' && G.mic && G.mic.on() && !o.noInvite) {
      const w2 = new G.Wait(); G.push(new PhraseAsk(id, Object.assign({}, o, { invite: res.k, cancel: false, prompt: '' }), w2));
      const r2 = yield w2; res.again = !!(r2.result && r2.result.again);
    }
    return res;
  };
  // can a request for this pattern run now (P.request won't come back null: the caller's old way)? Phrases on, and the
  // pattern met already, or free to be introduced now (one at a time, P.GAP). Every bubble that promises a phrase asks
  // this with the same slots as its talk, so it shows only when its talk can ask (AUDIT C2: Lola's heart bubble whose
  // talk fell back to her hello, 45 times)
  P.canRun = (id, o) => P.on() && !!P.def(id) && (P.met(id) || P.canIntro(id, o));
  // introduce if new, then ask; null: phrases off, or a pattern that can't be introduced now (the caller's old way)
  // A request for "Quiero" may introduce "___, por favor" instead (once Quiero is known: one pattern at a time).
  P.request = function* (id, o = {}) {
    if (!P.on()) return null;
    if (id === 'f_quiero' && o.polite !== false && P.met('f_quiero') && Wd().stage('f_quiero') >= 2 && !P.met('f_porfavor') && P.canIntro('f_porfavor', o)) id = 'f_porfavor';
    if (!(yield* P.ready(id, o))) return null;
    return yield* P.ask(id, o);
  };

  // =====================================================================
  //  Where they live (data-driven helpers the content calls; each returns null when phrases are off: the old way)
  // =====================================================================
  const say = (who, show, ...pages) => G.say(pages, Object.assign({ portrait: G.portraitOf(who), name: G.nameOf(who), who }, show ? { show } : {}));
  // ---------- Me llamo ___: a friend says their name, she says hers ----------
  P.wantsName = npc => P.on() && !!H() && H().WHO.includes(npc) && P.NO_NAME.indexOf(npc) < 0 && !P.named(npc) && P.canRun('f_llamo', { who: npc });
  P.meetName = function* (npc) {
    if (!P.wantsName(npc)) return false;
    if (!(yield* P.ready('f_llamo', { who: npc }))) return false;
    const nm = FIRST(npc);
    yield* P.ask('f_llamo', { who: npc, prompt: '¡Hola! Me llamo ' + nm + '. ¿Y tú?', en: 'Hi! My name is ' + nm + '. And you? (say "Me llamo" and your name)', slots: [{ name: true }], free: true,
      onGet: function* () { yield say(npc, null, TT('¡Hola, {name}! ¡Mucho gusto!', 'Hello, {name}! Nice to meet you!')); } });
    st().named[npc] = day(); G.st.autosave();
    return true;
  };
  // ---------- Quiero ___: shops and food (the thing comes when it's asked for) ----------
  P.quiero = function* (who, slots, o = {}) {
    return yield* P.request('f_quiero', Object.assign({ who, slots, free: true, prompt: '¿Qué quieres?', en: 'What would you like? Say "Quiero..." (or tap)' }, o));
  };
  // ---------- ¿Dónde está ___?: a hint from Nico in hide-and-seek ----------
  P.donde = function* (who, kinds, onGet) {
    return yield* P.request('f_donde', { who, slots: kinds.slice(0, 3), free: true, prompt: '¿Sí?', en: 'Ask Nico where one is hiding: "¿Dónde está el...?"', onGet });
  };
  // ---------- Tengo ___: giving what she carries ----------
  const CARRY = ['flor', 'manzana', 'pelota', 'concha', 'hoja', 'carta', 'hueso', 'galleta', 'pan', 'helado', 'bellota', 'queso', 'leche', 'agua', 'huevo'];
  P.tengo = function* (who, it, o = {}) {
    if (!P.on()) return null;
    const id = it.id || it, others = CARRY.filter(k => k !== id && metW(k)).sort(() => G.rand() - 0.5).slice(0, 2);
    const slots = [id].concat(others).sort(() => G.rand() - 0.5);
    const r = yield* P.request('f_tengo', Object.assign({ who, slots, answer: slots.indexOf(id), prompt: '¿Qué tienes?', en: 'What do you have? Say "Tengo..."', cancel: o.cancel }, o));
    return r;
  };
  // ---------- Me gusta ___: Lola asks her favourite animal (pinned in the album); friends ask what she likes ----------
  P.fav = () => (G.state && isObj(st().fav) ? st().fav : null);
  const albumMet = () => (G.animals ? G.animals.list().filter(a => G.animals.met(a) && G.animals.KINDS[a] && metW(G.animals.KINDS[a].word)).map(a => G.animals.KINDS[a].word) : []);
  P.favReady = () => P.on() && !P.fav() && albumMet().length >= 3;
  P.favBubble = () => ({ icon: 'gracias' });
  G.requests.LINES['lola.fav'] = id => '¡' + G.requests.the(id, { cap: 1 }) + '! ¡A mí también me gusta!'; // ¡La [tortuga]! (the word's own article)
  // her question can run now: ready, she has said hello in this place today, the story has nothing for her, and the
  // pattern can be asked (P.canRun, with every animal her cards come from). Her bubble and her talk both ask this
  P.favCan = f => P.favReady() && !!f && !!(G.zones && G.zones.lolaTalked && G.zones.lolaTalked(f.mapId)) && !(G.chapters && G.chapters.alert('lola')) && P.canRun('f_gusta', { slots: albumMet() });
  // Lola, once she has said hello in this place today: "¿Qué animal te gusta?" (any album animal she has met)
  P.favTalk = function* (f) {
    if (!P.favCan(f)) return false;
    const all = albumMet(), cards = all.slice().sort(() => G.rand() - 0.5).slice(0, 3);
    const r = yield* P.request('f_gusta', { who: 'lola', slots: cards, more: all, free: true, prompt: '¡{name}! ¿Qué animal te gusta?', en: 'Which animal do you like best? Say "Me gusta el..."',
      onGet: function* (k, res) {
        const w = res.slot.word || res.slot.id; st().fav = { id: w, d: day() }; G.st.autosave();
        G.audio.jingle('item');
        yield say('lola', w, TT(G.requests.LINES['lola.fav'](w), 'The ' + (D().words[w] ? D().words[w].en.replace('the ', '') : w) + '! I like it too! (it\'s in your album now, with a heart)'));
      } });
    return r != null;
  };
  // a friend asks what she likes (some days, after the greeting; at most one a day in the whole world)
  const LIKE = ['comida', 'colores'], LIKE_EXTRA = ['helado', 'chocolate', 'mora'];
  P.likeAsk = function* (npc) {
    if (!H() || !P.met('f_gusta') || !P.canRun('f_gusta')) return false;
    const L = st().likes, d = day();
    if (L._d === d || (L[npc] && d - L[npc].d < 7)) return false;
    let h = 0; for (const c of npc + d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    if (h % 3) return false; // (some days)
    const pool = (H().POOLS[npc] || []).concat(LIKE_EXTRA).filter(w => D().words[w] && (LIKE.includes(D().words[w].topic) || LIKE_EXTRA.includes(w)) && metW(w));
    const cards = pool.filter((w, i) => pool.indexOf(w) === i).sort(() => G.rand() - 0.5).slice(0, 3);
    if (cards.length < 2) return false;
    const col = D().words[cards[0]].topic === 'colores';
    const r = yield* P.request('f_gusta', { who: npc, slots: cards, free: true, prompt: col ? '¿Qué color te gusta?' : '¿Qué te gusta?', en: 'What do you like? Say "Me gusta..."',
      onGet: function* (k, res) { L[npc] = { w: res.slot.word, d }; L._d = d; G.st.autosave(); yield say(npc, null, TT('¡A mí también!', 'Me too!')); } });
    return r != null;
  };

  // ---------- the dog's warm-up (warmup.js): a phrase that's due ----------
  const WARM = {
    f_quiero: () => ({ prompt: '¿Qué quieres?', slots: P.SLOTS.f_quiero }),
    f_porfavor: () => ({ prompt: '¿Qué quieres?', slots: P.SLOTS.f_porfavor }),
    f_llamo: () => ({ prompt: '¿Cómo te llamas?', slots: [{ name: true }] }),
    f_donde: () => ({ prompt: '¿Qué buscas?', slots: P.SLOTS.f_donde }),
    f_gusta: () => ({ prompt: '¿Qué te gusta?', slots: P.SLOTS.f_gusta }),
    f_tengo: () => ({ prompt: '¿Qué tienes?', slots: P.SLOTS.f_tengo, one: true }),
  };
  P.warm = function* (id, extra) {
    const W = WARM[id] && WARM[id](); if (!W) return false;
    let slots = W.slots.filter(s => typeof s !== 'string' || metW(s)).sort(() => G.rand() - 0.5).slice(0, 3);
    if (!slots.length) slots = [P.def(id).icon];
    const o = Object.assign({ who: 'canelo', prompt: W.prompt, slots, free: !W.one, noInvite: false }, extra || {});
    if (W.one) { o.answer = 0; o.show = slots[0]; }
    if (Wd().needsReintro(id)) yield* P.intro(id, Object.assign({}, o, { again: true, noNow: true }));
    const r = yield* P.ask(id, o);
    return !!(r && !r.cancel && (r.how === 'full'));
  };

  // =====================================================================
  //  Wrapping the people (after all the content has loaded): Me llamo the first time you meet a zone's people and Lola;
  //  Lola's favourite-animal question (the town's friends say their name at their next greeting: hearts.js H.greet)
  // =====================================================================
  function wrap(def) {
    const id = def.id; if (!id || def._phr || !H() || !(id in H().ZONE)) return;
    def._phr = true;
    const t0 = def.talk, a0 = def.alert;
    def.talk = function* (f, n) {
      let named = false;
      if (G.state && P.wantsName(id) && !(H().greetsWith(id) && !H().did(id, 'greet'))) named = yield* P.meetName(id); // (a greeting due: after it, hearts.js)
      if (id === 'lola' && !named && G.state && P.on() && (yield* P.favTalk(f))) return;
      if (t0) yield* t0.call(this, f, n);
    };
    if (id === 'lola') def.alert = function () {
      const a = a0 ? a0.apply(this, arguments) : null; if (a) return a;
      const f = G.field; return G.state && P.favCan(f) ? P.favBubble() : null; // (only when her question can really be asked: the same check as her talk)
    };
  }
  for (const m in G.maps) for (const def of G.maps[m].npcs || []) wrap(def);
})();
