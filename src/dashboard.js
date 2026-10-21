// ===== Learning: the grown-ups' page of what the child actually knows and keeps (docs/LEARNING_PLAN_2.md, Phase 1) =====
// The grown-ups menu's "Learning" row (behind the held gear, so English labels). Five tabs:
//   Overview   days played, minutes (in all, today), words met / known / remembered / solid (each count includes the
//              stronger ones), the share of practice said aloud, retention, slipping words, the last check, the warm-up
//   Retention  right on the first try when a word comes back after a day or more (last 7 days, all time, with the
//              counts), and a bar per day for the last two weeks (the goal band 70-80%)
//   Words      by place (Villa Sol and the five zones, picture tabs): each word's picture, its Spanish, a strength bar
//              (four stages, the box under it), said aloud (a mic), last met or used, slipping; scroll; tap: hear it
//              (and a last tab, a speech bubble: the phrases, src/phrases.js, Phase 2: the same rows)
//   Check      ten words to ask away from the game (some strong, some slipping or due): the picture, the Spanish and the
//              English for the grown-up; tap right or not yet (the card stays a moment with its mark), skip or stop; the
//              answers count as practice (history.js H.checkAnswer: right = a recall, not yet = a miss) and the last
//              check's score shows, its words in the order asked
//   Tonight    one simple Spanish question for dinner from today's words (or the last days'), only words the child
//              has met, with its English and an answer to expect (templates per kind of word, below)
// Share (top): the summary as text (the share sheet; else the clipboard; else a box to copy from), inside the tap.
// API: G.dashboard.open() -> Wait; .tonight(k) the k-th question of tonight's list ({id, es, en, ans: {es, en}, why,
//   words}); .tonights() the whole list; .shareText(); .TABS. The screen is 'LearningDash' (tests read .tab, .view()).
'use strict';
(function () {
  const DB = G.dashboard = {};
  const D = () => G.data, H = () => G.hist, Wd = () => G.words;
  DB.TABS = ['Overview', 'Retention', 'Words', 'Check', 'Tonight'];
  const COL = { yel: '#f8e060', dim: '#a8b0d8', white: '#ffffff', met: '#a8d8ff', known: '#70b0ff', gold: '#f8d860', solid: '#f8b030', slip: '#f8a040', good: '#60d070', bad: '#f07070', line: '#303a78' };
  const STAGE_COL = [COL.met, COL.known, COL.gold, COL.solid];
  const CHECK_HOLD = 22; // frames the card just answered stays, with its tick or cross, before the next word
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fit = (s, w) => { s = String(s); if (G.textWidth(s) <= w) return s; while (s.length > 1 && G.textWidth(s + '..') > w) s = s.slice(0, -1); return s + '..'; };
  const es = id => (D().words[id] ? D().words[id].es.split(' / ')[0] : id); // with its article: el oso
  const en = id => (D().words[id] ? D().words[id].en : '');
  const dateOf = key => { const n = Wd().numOf(key); if (n == null) return key || ''; const d = new Date(n * 864e5); return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const ago = n => (n == null ? '-' : n <= 0 ? 'today' : n === 1 ? 'yesterday' : n + ' days ago');
  const hm = min => (min < 1 ? 'under a minute' : min < 60 ? min + ' min' : Math.floor(min / 60) + ' h ' + (min % 60 ? (min % 60) + ' min' : ''));
  const pctS = r => (r.pct == null ? '--' : r.pct + '%');
  const name = () => G.st.playerName();

  // =====================================================================
  //  Tonight's question: one line for dinner
  // =====================================================================
  // Templates by the kind of word; a question only uses words the child has met (and an answer she can give with
  // them). The answer's English is for the grown-up.
  const SOUND = { perro: 'guau', gato: 'miau', pato: 'cuac', rana: 'croac' };
  const HOME = { perro: 'casa', gato: 'casa', pajaro: 'arbol', mariposa: 'flor', pez: 'agua', conejo: 'parque', rana: 'agua', pato: 'agua', gallina: 'granja', caballo: 'granja', cabra: 'granja',
    cangrejo: 'arena', estrellamar: 'mar', tortuga: 'mar', gaviota: 'mar', medusa: 'mar', delfin: 'mar', pulpo: 'mar',
    oso: 'cueva', ardilla: 'arbol', mapache: 'elbosque', venado: 'elbosque', zorro: 'elbosque', erizo: 'elbosque', buho: 'arbol', luciernaga: 'elbosque',
    paloma: 'parque', catarina: 'flor', hormiga: 'parque', abeja: 'flor', lagartija: 'parque', grillo: 'parque', colibri: 'flor',
    vaca: 'granja', cerdo: 'granja', oveja: 'granja', burro: 'granja', pavo: 'granja', raton: 'casa', gallo: 'granja', tlacuache: 'arbol',
    llama: 'lamontana', marmota: 'lamontana', zorrillo: 'lamontana', carpintero: 'arbol', monarca: 'arbol', puma: 'lamontana', aguila: 'lamontana', lobo: 'lamontana' };
  const COLOR = { manzana: 'rojo', platano: 'amarillo', leche: 'blanco', huevo: 'blanco', queso: 'amarillo', pelota: 'rojo', hoja: 'verde', rana: 'verde', arbol: 'verde',
    mar: 'azul', nieve: 'blanco', nube: 'blanco', elsol: 'amarillo', oveja: 'blanco', cerdo: 'rosa', catarina: 'rojo', abeja: 'amarillo' };
  const ACT = { corre: ['correr', 'run'], baila: ['bailar', 'dance'], salta: ['saltar', 'jump'], nadar: ['nadar', 'swim'], sube: ['subir', 'climb'], lanza: ['lanzar', 'throw'] };
  const FOOD = ['comida', 'helado', 'chocolate', 'mora'];
  const WEATHER = [['elsol', 'Hace sol.', 'Sunny.'], ['frio', 'Hace frío.', 'Cold.'], ['caliente', 'Hace calor.', 'Hot.'], ['lluvia', 'Llueve.', 'Raining.'], ['nieve', 'Nieva.', 'Snowing.'], ['viento', 'Hace viento.', 'Windy.'], ['nube', 'Hay nubes.', 'Cloudy.']];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fem = id => /^(la|las) /.test(es(id)), plural = id => /^(los|las) /.test(es(id)), noun = id => /^(el|la|los|las) /.test(es(id));
  const bare = id => es(id).replace(/^(el|la|los|las) /, '');
  const enBare = id => en(id).replace(/^the /, '');
  const form = (id, k) => { const f = D().words[id].es.split(' / ').map(s => s.trim()); return f[Math.min(k, f.length - 1)]; };
  const met = id => !!D().words[id] && Wd().met(id);
  // [template, question builder]: each returns null or {es, en, ans: {es, en}, words: [ids it uses]}
  const TPL = [
    ['sound', id => SOUND[id] && met(SOUND[id]) ? { es: '¿Qué dice ' + es(id) + '?', en: 'What does ' + en(id) + ' say?', ans: { es: '¡' + cap(form(SOUND[id], 0)) + '!', en: cap(en(SOUND[id])) + '!' }, words: [id, SOUND[id]] } : null],
    ['home', id => HOME[id] && met(HOME[id]) ? { es: '¿Dónde vive ' + es(id) + '?', en: 'Where does ' + en(id) + ' live?', ans: { es: 'En ' + es(HOME[id]) + '.', en: 'In ' + en(HOME[id]) + '.' }, words: [id, HOME[id]] } : null],
    ['color', id => COLOR[id] && met(COLOR[id]) ? { es: '¿De qué color es ' + es(id) + '?', en: 'What color is ' + en(id) + '?', ans: { es: 'Es ' + form(COLOR[id], fem(id) ? 1 : 0) + '.', en: 'It\'s ' + en(COLOR[id]) + '.' }, words: [id, COLOR[id]] } : null],
    ['dog', id => id === 'perro' ? { es: '¿Cómo se llama tu perro?', en: 'What is your dog\'s name?', ans: { es: G.fill('Se llama {dog}.'), en: G.fill('His name is {dog}.') }, words: [id] } : null],
    ['body', id => D().words[id].topic === 'cuerpo' ? (plural(id) ? { es: '¿Dónde están tus ' + bare(id) + '?', en: 'Where are your ' + enBare(id) + '?', ans: { es: '¡Aquí están!', en: 'Here they are! (pointing)' }, words: [id] } : { es: '¿Dónde está tu ' + bare(id) + '?', en: 'Where is your ' + enBare(id) + '?', ans: { es: '¡Aquí está!', en: 'Here it is! (pointing)' }, words: [id] }) : null],
    ['clothes', id => D().words[id].topic === 'ropa' ? (plural(id) ? { es: '¿De qué color son tus ' + bare(id) + '?', en: 'What color are your ' + enBare(id) + '?', ans: { es: 'Son... (the color)', en: 'They are... (a color word)' }, words: [id] } : { es: '¿De qué color es tu ' + bare(id) + '?', en: 'What color is your ' + enBare(id) + '?', ans: { es: 'Es... (the color)', en: 'It\'s... (a color word)' }, words: [id] }) : null],
    ['family', id => id === 'abuela' || id === 'abuelo' ? { es: '¿Cómo se llama tu ' + bare(id) + '?', en: 'What is your ' + (id === 'abuela' ? 'grandma' : 'grandpa') + '\'s name?', ans: { es: 'Se llama... (a name)', en: 'Her / his name is... ' }, words: [id] } : null],
    ['feel', id => (id === 'feliz' || id === 'triste' || id === 'cansado') ? { es: G.fill('¿Estás ' + (id === 'cansado' ? 'cansad{o/a}' : bare(id)) + '?'), en: 'Are you ' + en(id) + '?', ans: { es: met('si') ? '¡Sí! / No.' : 'Sí. / No.', en: 'Yes! / No.' }, words: [id] } : (id === 'bien' || id === 'comoestas') ? { es: '¿Cómo estás?', en: 'How are you?', ans: { es: met('bien') ? '¡Bien!' + (met('gracias') ? ' Gracias.' : '') : '¡Feliz!', en: 'Fine! (Thank you.)' }, words: [id].concat(met('bien') ? ['bien'] : []) } : null],
    ['weather', id => { if (id === 'frio') return { es: '¿Tienes frío?', en: 'Are you cold?', ans: { es: 'Sí, tengo frío. / No.', en: 'Yes, I\'m cold. / No.' }, words: [id] };
      if (D().words[id].topic !== 'tiempo') return null;
      const A = WEATHER.filter(a => met(a[0])).slice(0, 3); // (answers from her own weather words)
      return A.length ? { es: '¿Qué tiempo hace hoy?', en: 'What is the weather like today?', ans: { es: A.map(a => a[1]).join(' / '), en: A.map(a => a[2]).join(' / ') }, words: [id].concat(A.map(a => a[0])) } : null; }],
    ['age', id => D().words[id].topic === 'numeros' ? { es: '¿Cuántos años tienes?', en: 'How old are you?', ans: { es: 'Tengo... años. (a number)', en: 'I\'m... (her age)' }, words: [id] } : null],
    ['act', id => ACT[id] ? { es: '¿Te gusta ' + ACT[id][0] + '?', en: 'Do you like to ' + ACT[id][1] + '?', ans: { es: met('si') ? '¡Sí!' : '¡Sí! / No.', en: 'Yes! / No.' }, words: [id] } : null],
    ['like', id => { const w = D().words[id]; if (!noun(id) || ['saludos', 'numeros', 'colores', 'sentir', 'acciones', 'cuerpo', 'familia', 'ropa'].includes(w.topic)) return null;
      const food = FOOD.includes(w.topic) || FOOD.includes(id), n = plural(id) ? 'n' : '';
      return { es: '¿Te gusta' + n + ' ' + es(id) + '?', en: 'Do you like ' + (food ? enBare(id) : en(id)) + '?', ans: { es: '¡Sí, me gusta' + n + '! / No, no me gusta' + n + '.', en: 'Yes, I like ' + (n ? 'them' : 'it') + '! / No, I don\'t.' }, words: [id] }; }],
  ];
  const SPECIFIC = ['sound', 'home', 'color', 'dog', 'body', 'clothes', 'feel', 'weather', 'family'];
  // a little hash for the day's order (stable all day, a different order tomorrow)
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
  DB.tonights = function () {
    if (!G.state) return [];
    const h = H(), today = h.day(), keys = h.days(), recent = {}; // word -> {days ago, how}
    const note = (id, a, how) => { if (!recent[id] || a < recent[id].a) recent[id] = { a, how }; };
    today.met.forEach(id => note(id, 0, 'met today'));
    Object.keys(today.w).forEach(id => note(id, 0, 'practised today'));
    for (const k of keys) { const d = h.state().d[k], a = Wd().dayNum() - d.n; if (a < 1 || a > 3) continue; d.met.forEach(id => note(id, a, 'met ' + ago(a))); Object.keys(d.w).forEach(id => note(id, a, 'practised ' + ago(a))); }
    let ids = Object.keys(recent).filter(met);
    if (!ids.length) { ids = Wd().list(1).sort((a, b) => (Wd().rec(b).met || 0) - (Wd().rec(a).met || 0)).slice(0, 12); ids.forEach(id => note(id, 9, 'one of her words')); }
    const out = [], day = G.today();
    for (const id of ids) {
      for (const [tpl, fn] of TPL) {
        let q = null; try { q = fn(id); } catch (e) { q = null; }
        if (!q || !q.words.every(met)) continue;
        const r = recent[id], sc = (r.a === 0 ? 6 : r.a <= 1 ? 3 : 1) + (r.how.indexOf('met') === 0 ? 2 : 0) + (SPECIFIC.includes(tpl) ? 3 : 0) + (q.words.length > 1 ? 1 : 0) + hash(day + id + tpl);
        out.push(Object.assign({ id, tpl, why: r.how, sc }, q));
      }
    }
    out.sort((a, b) => b.sc - a.sc);
    // one question per word first, then the rest
    const seen = new Set(), first = out.filter(q => !seen.has(q.id) && seen.add(q.id));
    return first.concat(out.filter(q => first.indexOf(q) < 0));
  };
  DB.tonight = (k = 0) => { const L = DB.tonights(); return L.length ? L[((k % L.length) + L.length) % L.length] : null; };

  // =====================================================================
  //  The summary as text (Share)
  // =====================================================================
  DB.shareText = function () {
    if (!G.state) return '';
    const o = H().overview(), d = new Date(G.now()), L = [];
    L.push('Club de Español: ' + name() + '\'s learning (' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ')');
    L.push('Played ' + o.days + (o.days === 1 ? ' day' : ' days') + ', ' + hm(o.minutes) + ' in all' + (o.today ? ', ' + hm(o.today) + ' today' : '') + '.');
    L.push('Words: ' + o.met + ' met, ' + o.known + ' known, ' + o.remembered + ' remembered, ' + o.solid + ' solid (of ' + o.all + ' in the game).');
    L.push('Retention (right on the first try when a word comes back after a day or more): ' + (o.r7.n ? o.r7.pct + '% in the last 7 days (' + o.r7.right + ' of ' + o.r7.n + ')' : 'no words back after a day yet this week') + (o.ra.n ? ', ' + o.ra.pct + '% overall (' + o.ra.right + ' of ' + o.ra.n + ').' : '.'));
    L.push('Said aloud: ' + (o.spoken.all ? o.spoken.pct + '% of practice (' + o.spoken.said + ' of ' + o.spoken.all + ').' : 'no practice recorded yet.'));
    if (o.slipping.length) L.push('Slipping (' + o.slipping.length + '): ' + o.slipping.map(es).join(', ') + '.');
    if (o.phrases && o.phrases.met) L.push('Phrases: ' + o.phrases.met + ' of ' + o.phrases.of + ' met (' + H().phraseIds().filter(id => G.words.met(id)).map(id => G.phrase ? G.phrase.label(id) : id).join(', ') + '); said aloud ' + o.phrases.said + ' times, ' + o.phrases.today + ' today.');
    if (o.check) L.push('Last word check: ' + o.check.right + ' of ' + o.check.of + ' (' + dateOf(o.check.d) + ').');
    const td = H().day().met; if (td.length) L.push('New today: ' + td.map(es).join(', ') + '.');
    const q = DB.tonight(0); if (q) L.push('Tonight\'s question: ' + q.es + ' (' + q.en + ') A good answer: ' + q.ans.es);
    return L.join('\n');
  };

  // =====================================================================
  //  The screen
  // =====================================================================
  // a small text button (like the mic test's)
  function textBtn(ctx, r, label, o = {}) {
    const on = o.sel || G.input.holding(r.x, r.y, r.w, r.h) > 0;
    ctx.fillStyle = '#000010'; ctx.fillRect(r.x + 1, r.y, r.w - 2, r.h); ctx.fillRect(r.x, r.y + 1, r.w, r.h - 2);
    ctx.fillStyle = on ? '#f0d060' : (o.rim || '#8898e0'); ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
    ctx.fillStyle = on ? '#304cc0' : (o.fill || '#1c2c8c'); ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, 3);
    if (o.glyph) o.glyph(ctx, r);
    G.textC(ctx, label, r.x + r.w / 2 + (o.dx || 0), r.y + (r.h >> 1) - 3, o.col || '#ffffff');
  }
  // a check mark and a cross, in pixels
  function tick(ctx, x, y, col = COL.good, k = 1) { ctx.fillStyle = col; const R = (a, b, w, h) => ctx.fillRect(x + a * k, y + b * k, w * k, h * k); R(0, 4, 2, 2); R(1, 5, 2, 2); R(2, 6, 2, 2); R(3, 5, 2, 2); R(4, 4, 2, 2); R(5, 3, 2, 2); R(6, 2, 2, 2); R(7, 1, 2, 2); R(8, 0, 2, 2); }
  function cross(ctx, x, y, col = COL.bad, k = 1) { ctx.fillStyle = col; for (let i = 0; i < 8; i++) { ctx.fillRect(x + i * k, y + i * k, 2 * k, 2 * k); ctx.fillRect(x + (7 - i) * k, y + i * k, 2 * k, 2 * k); } }
  DB.tick = tick; DB.cross = cross;
  // a word's strength: four stage blocks (met, known, remembered, solid) and its box under them (1-5)
  function strength(ctx, x, y, st, box) {
    for (let j = 0; j < 4; j++) { ctx.fillStyle = '#000010'; ctx.fillRect(x + j * 9 - 1, y - 1, 10, 8); ctx.fillStyle = j < st ? STAGE_COL[j] : COL.line; ctx.fillRect(x + j * 9, y, 8, 6); }
    for (let j = 0; j < 5; j++) { ctx.fillStyle = j < box ? '#c8d0f0' : COL.line; ctx.fillRect(x + j * 7, y + 9, 5, 2); }
  }
  DB.strength = strength;

  const ZONES = () => (G.zones ? G.zones.ids() : ['villa']).concat(G.phrase && G.phrase.on() ? ['frases'] : []); // (the phrases' tab last)
  class LearningDash {
    constructor(w, o) {
      G.toastT = 0; this.w = w; this.t = 0; this.tab = Math.max(0, DB.TABS.indexOf((o && o.tab) || 'Overview'));
      this.zone = 'villa'; this.scroll = 0; this.drag = null; this.hi = null; this.tq = 0; this.note = ''; this.noteT = 0; this.lastShare = -1e9; this.adult = true;
      this.rowsCache = null;
    }
    onEnter() { this.zoneTap = G.speech && G.speech.gestureTap ? G.speech.gestureTap(() => (G.top() === this && !this.text ? this.shareRect() : null), () => { this.shared = true; this.share(); }) : null; }
    onExit() { if (this.zoneTap) this.zoneTap.off(); this.hideText(); }
    // tap areas (shared with draw)
    closeXY() { return [G.W - 26, 4]; }
    shareRect() { return { x: G.W - 88, y: 4, w: 56, h: 20 }; }
    tabRect(k) { return { x: 4 + k * 63, y: 27, w: 60, h: 16 }; }
    zoneRect(k) { return { x: 6 + k * 29, y: 47, w: 26, h: 20 }; }
    listBox() { return { x: 4, y: 80, w: 286, h: 126 }; }
    rowRect(k) { const b = this.listBox(); return { x: b.x, y: b.y + k * 18 - this.scroll, w: b.w, h: 18 }; }
    upXY() { return [294, 78]; }
    downXY() { return [294, 188]; }
    startRect() { return { x: 90, y: 112, w: 140, h: 26 }; }
    yesRect() { return { x: 34, y: 170, w: 118, h: 30 }; }
    noRect() { return { x: 168, y: 170, w: 118, h: 30 }; }
    skipRect() { return { x: 248, y: 205, w: 64, h: 16 }; }
    stopRect() { return { x: 8, y: 205, w: 64, h: 16 }; }
    sayXY() { return [256, 64]; }
    anotherRect() { return { x: 90, y: 192, w: 140, h: 22 }; }
    tonightSayXY() { return [G.W - 34, 66]; }
    rows() { if (!this.rowsCache || this.rowsCache.zone !== this.zone || this.rowsCache.t !== G.frame >> 5) { const L = this.zone === 'frases' ? H().phraseRows() : H().zoneRows(this.zone); L.sort((a, b) => b.met - a.met); this.rowsCache = { zone: this.zone, t: G.frame >> 5, L }; } return this.rowsCache.L; } // (met words first, in notebook order; the phrases' tab: the phrases)
    maxScroll() { return Math.max(0, this.rows().length * 18 - this.listBox().h); }
    notice(s) { this.note = s; this.noteT = 180; }
    // the page's numbers, worked out again twice a second (they're drawn every frame)
    memo(k, fn) { const m = this.memos || (this.memos = {}), t = G.frame >> 5; if (!m[k] || m[k].t !== t || m[k].v !== this.ver) m[k] = { t, v: this.ver, x: fn() }; return m[k].x; }
    close() { G.audio.sfx('cancel'); G.pop(); this.w.resolve(); }
    setTab(k) { if (k === this.tab) return; this.tab = k; G.audio.sfx('cursor'); this.hi = null; this.ver = (this.ver | 0) + 1; }
    // the check's card just answered (shown a moment with its tick or cross; taps wait), or null
    held() { const h = this.hi; return h && h.ids && this.t - h.t < CHECK_HOLD ? h : null; }
    // what the page shows (tests read it)
    view() {
      const o = H().overview();
      return { tab: DB.TABS[this.tab], overview: o, r7: o.r7, ra: o.ra, byDay: H().retentionByDay(14), zone: this.zone, rows: this.rows(), check: H().checkCur(), last: H().checkLast(), tonight: DB.tonight(this.tq) };
    }

    update() {
      this.t++; if (this.noteT > 0) this.noteT--;
      if (this.text) { if (G.input.p('B') || G.input.p('A')) this.hideText(); return; }
      const shared = this.shared; this.shared = false;
      if (G.input.p('B') || G.closeHit(...this.closeXY())) { this.close(); return; }
      if (G.tapIn(this.shareRect())) { if (!shared) this.share(); return; }
      const k = DB.TABS.findIndex((n, k) => G.tapIn(this.tabRect(k)));
      if (k >= 0) { this.setTab(k); return; }
      const d = G.input.repDir(14, 6);
      if (d === 'left' || d === 'right') this.setTab((this.tab + (d === 'left' ? DB.TABS.length - 1 : 1)) % DB.TABS.length);
      const page = DB.TABS[this.tab];
      if (page === 'Words') this.updWords(d);
      else if (page === 'Check') this.updCheck();
      else if (page === 'Tonight') this.updTonight();
    }
    updWords(d) {
      const Z = ZONES(), zk = Z.findIndex((z, k) => G.tapIn(this.zoneRect(k)));
      if (zk >= 0) { if (Z[zk] !== this.zone) { this.zone = Z[zk]; this.scroll = 0; this.rowsCache = null; G.audio.sfx('cursor'); } return; }
      const step = 18 * 3, ptr = G.input.ptr, b = this.listBox();
      if (G.btnHit(...this.upXY())) { this.scroll = Math.max(0, this.scroll - step); G.audio.sfx('cursor'); return; }
      if (G.btnHit(...this.downXY())) { this.scroll = Math.min(this.maxScroll(), this.scroll + step); G.audio.sfx('cursor'); return; }
      if (d === 'up') this.scroll = Math.max(0, this.scroll - 18);
      if (d === 'down') this.scroll = Math.min(this.maxScroll(), this.scroll + 18);
      // a finger dragged over the list scrolls it
      if (ptr.down && ptr.sx >= b.x && ptr.sx < b.x + b.w && ptr.sy >= b.y && ptr.sy < b.y + b.h) {
        if (!this.drag) this.drag = { y: ptr.y, s: this.scroll };
        this.scroll = G.clamp(Math.round(this.drag.s - (ptr.y - this.drag.y)), 0, this.maxScroll());
      } else this.drag = null;
      const tap = G.input.tap();
      if (tap && G.tapIn(b)) {
        const L = this.rows(), i = Math.floor((tap.y - b.y + this.scroll) / 18);
        if (L[i]) { this.hi = { id: L[i].id, t: this.t }; G.speak(this.zone === 'frases' && G.phrase ? G.phrase.sentence(L[i].id) : G.baseForm(L[i].id)); }
      }
    }
    updCheck() {
      if (this.held()) return;
      const c = H().checkCur();
      if (!c) { if (G.tapIn(this.startRect()) || G.input.p('A')) { if (H().checkStart()) G.audio.sfx('ok'); else { G.audio.sfx('error'); this.notice('No words met yet'); } } return; }
      const id = c.ids[c.i];
      if (G.speakerHit(...this.sayXY()) || G.input.p('C')) { G.speak(G.baseForm(id)); return; }
      if (G.tapIn(this.yesRect())) { this.answer(c, true); G.audio.sfx('chime'); return; }
      if (G.tapIn(this.noRect())) { this.answer(c, false); G.audio.sfx('boop'); return; }
      if (G.tapIn(this.skipRect())) { H().checkAnswer(null); G.audio.sfx('cursor'); return; }
      if (G.tapIn(this.stopRect())) { H().checkStop(); G.audio.sfx('cancel'); }
    }
    answer(c, ok) { // record it (history.js), and hold the card a moment with its mark
      const i = c.i; H().checkAnswer(ok);
      this.hi = { id: c.ids[i], ok: ok ? 1 : 0, t: this.t, ids: c.ids, r: c.r.slice(), i }; this.ver = (this.ver | 0) + 1;
    }
    updTonight() {
      const q = DB.tonight(this.tq);
      if (q && (G.speakerHit(...this.tonightSayXY()) || G.input.p('C'))) { G.speak(q.es); return; }
      if (G.tapIn(this.anotherRect()) || G.input.p('A')) { this.tq++; G.audio.sfx('cursor'); const q2 = DB.tonight(this.tq); if (q2) G.speak(q2.es); }
    }

    // ---------- Share: the share sheet, else the clipboard, else a box to copy from (inside the tap when possible) ----------
    share() {
      const now = performance.now(); if (now - this.lastShare < 500) return; this.lastShare = now;
      const txt = DB.shareText();
      try {
        if (navigator.share) {
          navigator.share({ title: 'Club de Español: ' + name(), text: txt }).then(() => { this.notice('Shared'); G.audio.sfx('ok'); }, e => { if (!(e && e.name === 'AbortError')) this.clip(txt); });
          return;
        }
      } catch (e) { }
      this.clip(txt);
    }
    clip(txt) {
      try {
        const cb = navigator.clipboard;
        if (cb && cb.writeText) { cb.writeText(txt).then(() => { this.notice('Copied: paste it in a message'); G.audio.sfx('ok'); }, () => this.showText(txt, 'Copying was blocked. Select the text below and copy it.')); return; }
      } catch (e) { }
      this.showText(txt, 'Select the text below and copy it.');
    }
    showText(txt, why) {
      this.hideText();
      const d = this.text = document.createElement('div'); d.id = 'learntext';
      d.style.cssText = 'position:fixed;inset:0;z-index:20;display:flex;flex-direction:column;gap:8px;padding:12px;box-sizing:border-box;background:rgba(8,12,48,.96);color:#f0f0ff;font:15px sans-serif';
      const p = document.createElement('div'); p.textContent = why;
      const ta = document.createElement('textarea'); ta.readOnly = true; ta.value = txt;
      ta.style.cssText = 'flex:1;width:100%;box-sizing:border-box;font:14px sans-serif;background:#000;color:#e8e8f8;border:2px solid #8898e0;user-select:text;-webkit-user-select:text;-webkit-touch-callout:default;touch-action:auto';
      const b = document.createElement('button'); b.textContent = 'Done';
      b.style.cssText = 'align-self:flex-end;font:bold 16px sans-serif;padding:10px 28px;border-radius:8px;border:2px solid #f0f0ff;background:#304cc0;color:#fff';
      b.addEventListener('click', () => this.hideText());
      d.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.hideText(); });
      d.append(p, ta, b); document.body.appendChild(d);
      try { ta.focus(); ta.setSelectionRange(0, txt.length); } catch (e) { }
    }
    hideText() { if (this.text) { this.text.remove(); this.text = null; try { G.canvas.focus(); } catch (e) { } } }

    // ---------- drawing ----------
    draw(ctx) {
      G.win(ctx, 0, 0, G.W, G.H, { alpha: 1 });
      G.text(ctx, 'LEARNING', 8, 9, COL.yel);
      G.text(ctx, fit(name(), 120), 8 + G.textWidth('LEARNING') + 8, 9, COL.white);
      textBtn(ctx, this.shareRect(), navigator.share ? 'Share' : 'Copy');
      G.closeBtn(ctx, ...this.closeXY());
      DB.TABS.forEach((n, k) => {
        const r = this.tabRect(k), on = k === this.tab;
        G.win(ctx, r.x, r.y, r.w, r.h, on ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { fill1: '#18205e', fill2: '#10164a', alpha: 1 });
        G.textC(ctx, n, r.x + r.w / 2, r.y + 5, on ? COL.yel : COL.dim);
      });
      ctx.fillStyle = '#6070b0'; ctx.fillRect(6, 44, G.W - 12, 1);
      const page = DB.TABS[this.tab];
      if (page === 'Overview') this.drawOverview(ctx);
      else if (page === 'Retention') this.drawRetention(ctx);
      else if (page === 'Words') this.drawWords(ctx);
      else if (page === 'Check') this.drawCheck(ctx);
      else this.drawTonight(ctx);
      if (this.noteT > 0) { const w = G.textWidth(this.note) + 16; G.win(ctx, (G.W - w) / 2, 196, w, 18, { fill1: '#2a6a3a', fill2: '#103a1c', alpha: 1 }); G.textC(ctx, this.note, G.W / 2, 201, COL.yel); }
    }
    drawOverview(ctx) {
      const o = this.memo('o', () => H().overview());
      [['met', o.met, STAGE_COL[0]], ['known', o.known, STAGE_COL[1]], ['remembered', o.remembered, STAGE_COL[2]], ['solid', o.solid, STAGE_COL[3]]].forEach(([lab, n, col], k) => {
        const x = 8 + k * 77;
        G.win(ctx, x, 49, 73, 38, { fill1: '#202a78', fill2: '#121a50', alpha: 1 });
        G.bigText(ctx, String(n), x + 36, 56, 2, col);
        G.textC(ctx, lab, x + 36, 75, col);
      });
      // every word of the game, by stage (unmet grey)
      const bx = 8, by = 92, bw = G.W - 16, all = Math.max(1, o.all), segs = [[o.solid, STAGE_COL[3]], [o.remembered - o.solid, STAGE_COL[2]], [o.known - o.remembered, STAGE_COL[1]], [o.met - o.known, STAGE_COL[0]]];
      ctx.fillStyle = '#000010'; ctx.fillRect(bx - 1, by - 1, bw + 2, 7); ctx.fillStyle = COL.line; ctx.fillRect(bx, by, bw, 5);
      let x = bx; for (const [n, col] of segs) { const w = Math.round(bw * Math.max(0, n) / all); ctx.fillStyle = col; ctx.fillRect(x, by, w, 5); x += w; }
      G.textR(ctx, o.met + ' of ' + o.all + ' words met', G.W - 8, 100, COL.dim);
      const lines = [
        ['Played', o.days + (o.days === 1 ? ' day, ' : ' days, ') + hm(o.minutes) + ' in all, ' + (o.today ? hm(o.today) : 'nothing yet') + ' today'],
        ['Retention', o.r7.n ? pctS(o.r7) + ' last 7 days (' + o.r7.right + ' of ' + o.r7.n + ')' + (o.ra.n ? ', ' + pctS(o.ra) + ' in all' : '') : o.ra.n ? pctS(o.ra) + ' in all (' + o.ra.right + ' of ' + o.ra.n + ')' : 'no word back after a day yet'],
        ['Said aloud', o.spoken.all ? o.spoken.pct + '% of practice (' + o.spoken.said + ' of ' + o.spoken.all + ')' : 'no practice yet'],
        ['Slipping', o.slipping.length ? o.slipping.length + ': ' + o.slipping.map(es).join(', ') : 'none'],
        ['Last check', o.check ? o.check.right + ' of ' + o.check.of + ', ' + ago(o.check.ago) : 'none yet (the Check tab)'],
        ['Warm-up', this.warmLine(o.warmup)],
        ['Phrases', this.phraseLine(o.phrases)],
      ];
      lines.forEach(([a, b], k) => {
        const y = 110 + k * 13;
        G.text(ctx, a, 10, y, COL.dim);
        G.text(ctx, fit(b, G.W - 92), 82, y, k === 3 && o.slipping.length ? COL.slip : COL.white);
      });
      G.text(ctx, 'Each count includes the stronger words: a solid word', 10, 200, '#8890c0');
      G.text(ctx, 'is also remembered, known and met.', 10, 210, '#8890c0');
    }
    // the phrases (src/phrases.js): how many met, said aloud in all and today, built from cards
    phraseLine(p) {
      if (!p || !p.met) return 'none met yet (Me llamo, Quiero, ¿Dónde está?, Me gusta, Tengo, por favor)';
      return p.met + ' of ' + p.of + ' met; said aloud ' + p.said + (p.said === 1 ? ' time' : ' times') + ' (' + p.today + ' today)' + (p.built ? ', built ' + p.built : '');
    }
    warmLine(w) {
      const today = w && w.d === G.today(), L = w && w.last;
      if (today && L && L.d === G.today()) return G.fill('{dog} brought ' + (L.skipped ? L.ids.length : L.of) + ' words today' + (L.skipped ? ' (skipped after ' + L.of + ')' : ', ' + L.right + ' right first try') + '; ' + (w.n | 0) + ' in all');
      if (today) return 'not today (fewer than 2 words were due)';
      return 'not yet today; ' + (w ? w.n | 0 : 0) + ' in all' + (w && w.k ? ', ' + w.k + ' skipped' : '');
    }
    drawRetention(ctx) {
      const r7 = this.memo('r7', () => H().retention({ days: 7 })), ra = this.memo('ra', () => H().retention({ all: true }));
      G.textC(ctx, 'Right on the first try when a word comes back', G.W / 2, 50, COL.dim);
      G.textC(ctx, 'after a day or more away', G.W / 2, 60, COL.dim);
      [[r7, 'last 7 days', 88], [ra, 'all time', 232]].forEach(([r, lab, cx]) => {
        G.bigText(ctx, pctS(r), cx, 73, 3, r.pct == null ? COL.dim : r.pct >= 70 ? COL.gold : COL.met);
        G.textC(ctx, lab, cx, 97, COL.white);
        G.textC(ctx, r.n ? r.right + ' of ' + r.n + ' words' : 'no data yet', cx, 107, COL.dim);
      });
      // the last 14 days: a bar for each (its retention), the goal band 70-80%
      const L = this.memo('byDay', () => H().retentionByDay(14)), x0 = 36, base = 184, top = base - 46, hgt = p => Math.round(46 * p / 100), sw = 19, cw = 14 * sw;
      G.text(ctx, 'Last 14 days', 10, 119, COL.dim);
      ctx.fillStyle = COL.line; ctx.fillRect(x0 - 4, base + 1, cw + 2, 1);
      ctx.globalAlpha = 0.22; ctx.fillStyle = COL.good; ctx.fillRect(x0 - 4, base - hgt(80), cw + 2, hgt(80) - hgt(70)); ctx.globalAlpha = 1;
      ctx.fillStyle = COL.line; ctx.fillRect(x0 - 4, top, cw + 2, 1);
      G.textR(ctx, '100%', x0 - 7, top - 3, '#6070b0'); G.textR(ctx, 'goal', x0 - 7, base - hgt(80) - 1, COL.good); G.textR(ctx, '0', x0 - 7, base - 6, '#6070b0');
      L.forEach((d, k) => {
        const x = x0 + k * sw, today = k === L.length - 1;
        if (d.n) {
          const h = Math.max(2, hgt(d.pct)), col = d.pct >= 70 ? COL.gold : COL.met;
          ctx.fillStyle = '#000010'; ctx.fillRect(x - 1, base - h - 1, 14, h + 1);
          ctx.fillStyle = col; ctx.fillRect(x, base - h, 12, h);
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, base - h, 12, 1);
          G.textC(ctx, String(d.n), x + 6, base - h - 9, COL.dim);
        } else if (d.practice || d.sec) { ctx.fillStyle = '#6070b0'; ctx.fillRect(x + 4, base - 2, 4, 2); } // (played, nothing came back after a day)
        const dt = new Date(d.num * 864e5).getUTCDate();
        G.textC(ctx, String(dt), x + 6, base + 3, today ? COL.yel : '#8890c0');
      });
      G.wrap('Each bar: that day\'s words back after a day or more (how many on top). Goal 70-80%; a day with few is jumpy.', G.W - 20).slice(0, 2).forEach((l, i) => G.text(ctx, l, 10, 198 + i * 10, '#8890c0'));
    }
    drawWords(ctx) {
      const Z = ZONES(), rows = this.rows(), b = this.listBox();
      Z.forEach((z, k) => {
        const r = this.zoneRect(k), on = z === this.zone, zd = G.zones ? G.zones.def(z) : null;
        G.win(ctx, r.x, r.y, r.w, r.h, on ? { fill1: '#3a56c8', fill2: '#1c2c8c', alpha: 1 } : { fill1: '#18205e', fill2: '#10164a', alpha: 1 });
        if (on) { ctx.fillStyle = COL.yel; ctx.fillRect(r.x + 2, r.y + r.h - 3, r.w - 4, 1); }
        if (z === 'frases') G.cards.bubble(ctx, r.x + 6, r.y + 4, 1); else G.drawIcon16(ctx, zd ? zd.icon : 'sol', r.x + 5, r.y + 2);
      });
      const zd = G.zones ? G.zones.def(this.zone) : null, nm = rows.filter(r => r.met).length, ns = rows.filter(r => r.slip).length, nx = 6 + Z.length * 29 + 4;
      G.text(ctx, fit(this.zone === 'frases' ? 'Phrases' : zd ? zd.name : 'Villa Sol', G.W - nx - 6), nx, 49, COL.white);
      G.text(ctx, fit(nm + ' of ' + rows.length + ' met' + (ns ? ', ' + ns + ' slipping' : ''), G.W - nx - 6), nx, 59, ns ? COL.slip : COL.dim);
      G.text(ctx, 'Word', 30, 70, '#8890c0'); G.text(ctx, 'Stage', 116, 70, '#8890c0'); G.text(ctx, 'Said', 160, 70, '#8890c0'); G.text(ctx, 'Last met/used', 190, 70, '#8890c0');
      ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      rows.forEach((w, k) => {
        const r = this.rowRect(k); if (r.y + r.h < b.y || r.y > b.y + b.h) return;
        const hi = this.hi && this.hi.id === w.id && this.t - this.hi.t < 40;
        if (hi) { ctx.fillStyle = 'rgba(248,224,96,0.18)'; ctx.fillRect(r.x, r.y, r.w, r.h); }
        else if (k % 2) { ctx.fillStyle = 'rgba(136,152,224,0.08)'; ctx.fillRect(r.x, r.y, r.w, r.h); }
        ctx.globalAlpha = w.met ? 1 : 0.35;
        if (this.zone === 'frases' && G.phrase) { G.phrase.drawPic(ctx, G.phrase.cardPic(w.id), 10, r.y + 1, 1, this.t); G.cards.bubble(ctx, 18, r.y - 1, 0.6); } else G.drawIcon16(ctx, w.id, 10, r.y + 1);
        ctx.globalAlpha = 1;
        const lab = G.baseForm(w.id), col = !w.met ? '#6870a0' : w.st >= 3 ? COL.gold : COL.met;
        G.text(ctx, fit(lab, 82), 30, r.y + 6, col);
        if (!w.met) { G.text(ctx, 'not met yet', 116, r.y + 6, '#5a6290'); return; }
        strength(ctx, 116, r.y + 3, w.st, w.box);
        if (w.said) { G.mic.glyph(ctx, 164, r.y + 5, '#58c8d8'); if (w.said > 1) G.text(ctx, String(Math.min(99, w.said)), 173, r.y + 6, '#58c8d8'); }
        G.text(ctx, ago(w.ago), 190, r.y + 6, w.ago != null && w.ago >= 7 ? '#c8a0a0' : COL.white);
        if (w.slip) { ctx.fillStyle = COL.slip; ctx.fillRect(257, r.y + 5, 3, 5); ctx.fillRect(256, r.y + 9, 5, 1); ctx.fillRect(257, r.y + 10, 3, 1); ctx.fillRect(258, r.y + 11, 1, 1); G.text(ctx, 'slip', 264, r.y + 6, COL.slip); }
      });
      ctx.restore();
      if (!rows.length) G.textC(ctx, 'No words here', b.x + b.w / 2, b.y + 40, COL.dim);
      // scrolling: arrows and a bar
      const ms = this.maxScroll();
      if (ms > 0) {
        G.iconBtn(ctx, 'back', ...this.upXY()); G.iconBtn(ctx, 'next', ...this.downXY());
        arrowGlyph(ctx, this.upXY(), -1); arrowGlyph(ctx, this.downXY(), 1);
        const tx = 302, ty = 102, th = 82, kh = Math.max(10, Math.round(th * b.h / (b.h + ms))), ky = ty + Math.round((th - kh) * this.scroll / ms);
        ctx.fillStyle = COL.line; ctx.fillRect(tx, ty, 4, th); ctx.fillStyle = '#c8d0f0'; ctx.fillRect(tx, ky, 4, kh);
      }
      G.text(ctx, 'Tap a word to hear it. Dashes: its review box (1-5).', 8, 210, '#8890c0');
    }
    drawCheck(ctx) {
      const h = this.held(); if (h) return this.drawCard(ctx, h.ids, h.r, h.i, h);
      const c = H().checkCur(), last = H().checkLast();
      if (!c) {
        G.text(ctx, fit('Ask ' + name() + ' ' + H().CHECK_N + ' words, away from the game.', G.W - 20), 10, 52, COL.white);
        G.wrap('Show each picture, or say the English ("How do you say the dog?"), and listen for the Spanish. Tap right or not yet: the answers count as practice.', G.W - 22).forEach((l, i) => G.text(ctx, l, 10, 66 + i * 11, COL.dim));
        textBtn(ctx, this.startRect(), last ? 'Start a new check' : 'Start the check', { fill: '#2a7a3a', rim: '#a8e8b0' });
        if (!last) { G.wrap('The words: about half that need it (slipping, due for review, new), half strong ones, mixed.', G.W - 22).forEach((l, i) => G.text(ctx, l, 10, 150 + i * 11, '#8890c0')); return; }
        G.text(ctx, 'Last check: ' + last.right + ' of ' + last.of + ' right, ' + ago(last.ago) + ' (' + dateOf(last.d) + ')', 10, 146, COL.yel);
        const half = Math.ceil(last.ids.length / 2);
        last.ids.forEach((id, k) => { // the words in the order asked (two columns, top to bottom), with how they went
          const x = 10 + (k < half ? 0 : 154), y = 158 + (k < half ? k : k - half) * 10, v = last.r[k];
          if (v === 1) tick(ctx, x, y + 1, COL.good, 0.7); else if (v === 0) cross(ctx, x + 1, y + 1, COL.bad, 0.7); else G.text(ctx, '-', x + 2, y, COL.dim);
          G.text(ctx, fit(es(id), 136), x + 12, y, v === 0 ? '#f0b0b0' : COL.white);
        });
        const L = H().checks(); if (L.length > 1) G.textR(ctx, 'Before: ' + L.slice(-6, -1).map(x => H().checkScore(x).right + '/' + H().checkScore(x).of).join('  '), G.W - 10, 210, COL.dim);
        return;
      }
      this.drawCard(ctx, c.ids, c.r, c.i, null);
    }
    // a word of the check: its picture, Spanish and English, what to ask, the answer buttons (h: the card just answered)
    drawCard(ctx, ids, r, i, h) {
      const id = ids[i], wd = D().words[id];
      G.text(ctx, 'Word ' + (i + 1) + ' of ' + ids.length, 10, 50, COL.white);
      ids.forEach((x, k) => { const v = r[k], px = G.W - 10 - (ids.length - k) * 9; ctx.fillStyle = '#000010'; ctx.fillRect(px - 1, 49, 8, 8); ctx.fillStyle = k === i && !h ? COL.yel : v === 1 ? COL.good : v === 0 ? COL.bad : k < i ? '#6070b0' : COL.line; ctx.fillRect(px, 50, 6, 6); });
      G.win(ctx, 24, 60, G.W - 48, 104, { fill1: '#fffaf0', fill2: '#f0e4c8', alpha: 1 });
      ctx.fillStyle = '#000010'; ctx.fillRect(33, 69, 54, 54); ctx.fillStyle = '#8898e0'; ctx.fillRect(34, 70, 52, 52); ctx.fillStyle = '#d4e4f8'; ctx.fillRect(35, 71, 50, 50); // (light blue: a white bone shows)
      G.drawIcon16(ctx, wd, 36, 72, 3);
      const sx = 190;
      G.bigText(ctx, fit(es(id), 108), sx, 84, 2, '#a06008', '#f8e8b0');
      G.textC(ctx, fit(wd.en, 160), sx, 106, '#4a3a2a', null);
      G.textC(ctx, fit('Ask: "How do you say ' + wd.en + '?"', 176), sx, 128, '#8a7050', null);
      G.textC(ctx, 'or show the picture', sx, 140, '#8a7050', null);
      G.speakerBtn(ctx, ...this.sayXY());
      textBtn(ctx, this.yesRect(), 'Right', { fill: '#2a7a3a', rim: '#a8e8b0', dx: 8, glyph: (cx, r) => tick(cx, r.x + 14, r.y + 10, '#ffffff') });
      textBtn(ctx, this.noRect(), 'Not yet', { fill: '#902838', rim: '#f0a8b0', dx: 8, glyph: (cx, r) => cross(cx, r.x + 14, r.y + 10, '#ffffff') });
      textBtn(ctx, this.skipRect(), 'Skip', { fill: '#24308a' });
      textBtn(ctx, this.stopRect(), 'Stop', { fill: '#24308a' });
      if (h) { // its mark over the picture
        const mark = h.ok ? tick : cross, x = h.ok ? 40 : 42, y = h.ok ? 80 : 78;
        mark(ctx, x + 1, y + 1, '#000010', 4); mark(ctx, x, y, h.ok ? COL.good : COL.bad, 4);
      }
    }
    drawTonight(ctx) {
      const q = this.memo('q' + this.tq, () => DB.tonight(this.tq));
      G.text(ctx, 'Tonight\'s question, for dinner', 10, 50, COL.yel);
      if (!q) { G.wrap('Nothing yet: after a little play, a question from the day\'s words shows up here.', G.W - 24).forEach((l, i) => G.text(ctx, l, 10, 70 + i * 12, COL.dim)); return; }
      G.drawIcon16(ctx, q.id, 12, 66, 2, 'card');
      // the Spanish, big (on two lines if it's long)
      const cx = 172, mw = 230;
      if (G.textWidth(q.es) * 2 <= mw) G.bigText(ctx, q.es, cx, 74, 2, COL.gold);
      else { const w = q.es.split(' '), h = Math.ceil(w.length / 2); G.bigText(ctx, w.slice(0, h).join(' '), cx, 66, 2, COL.gold); G.bigText(ctx, w.slice(h).join(' '), cx, 86, 2, COL.gold); }
      G.speakerBtn(ctx, ...this.tonightSayXY());
      G.textC(ctx, fit(q.en, G.W - 30), G.W / 2, 108, COL.white);
      G.text(ctx, 'A good answer:', 10, 126, COL.dim);
      G.text(ctx, fit(q.ans.es, G.W - 110), 96, 126, COL.gold);
      G.text(ctx, fit('(' + q.ans.en + ')', G.W - 110), 96, 138, COL.dim);
      G.text(ctx, fit('From ' + name() + '\'s words: ' + es(q.id) + ' (' + q.why + ')', G.W - 20), 10, 154, COL.dim);
      G.wrap('Ask it in Spanish. An answer in English? Say it back in Spanish, with a smile.', G.W - 20).slice(0, 2).forEach((l, i) => G.text(ctx, l, 10, 166 + i * 10, '#8890c0'));
      textBtn(ctx, this.anotherRect(), 'Another question');
    }
  }
  function arrowGlyph(ctx, [x, y], dir) { // over the iconBtn's own arrow: an up / down triangle
    ctx.fillStyle = '#1c2c8c'; ctx.fillRect(x + 2, y + 2, 16, 16);
    ctx.fillStyle = '#f0f0ff';
    for (let i = 0; i < 5; i++) { const w = 1 + i * 2, yy = dir < 0 ? y + 7 + i : y + 12 - i; ctx.fillRect(x + 10 - i, yy, w, 1); }
  }
  G.LearningDash = LearningDash;
  DB.open = function (o) { const w = new G.Wait(); G.push(new LearningDash(w, o)); return w; };
})();
