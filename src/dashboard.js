// ===== Learning: the grown-ups' page of what the child actually knows and keeps (docs/LEARNING_PLAN_2.md, Phase 1;
// the honest page: docs/AUDIT_2026-10.md 2.8) =====
// The grown-ups menu's "Learning" row (behind the held gear, so English labels). For a parent who looks once a week and
// wants to know whether the pace is right. Seven tabs:
//   Overview   days played, minutes, words met / known / remembered / solid (each count includes the stronger ones), and
//              the week: recognition, recall, reviews done and waiting, new items, said aloud (or "speaking: not
//              working lately"), the dog's warm-up and the mid-session dog moment, slipping words; the backup's foot
//   Memory     two numbers instead of one "retention": RECOGNITION (picks when a word comes back after a day or more,
//              lucky taps taken out: (p - 1/k) / (1 - 1/k), history.js H.recognition) and RECALL (words recalled from
//              memory: said before seeing them written, picked from pictures alone on a later day, the grown-up's
//              checks: H.recall); the last check beside the game's number for the same words; gold words forgotten and
//              relearned; words not seen in 30 / 60 days; slipping; the dated note when the stricter measure began
//   Pace       reviews done a day against reviews due (bars, the last 3 weeks: a growing backlog shows) and the backlog
//              now; new words and phrases a day against the pacing's target (words.js G.budget); the words seen but
//              not taught yet (the pacing's queue)
//   Words      by place (Villa Sol and the five zones, picture tabs): each word's picture, its Spanish, a strength bar
//              (four stages, its review box 1-8 under it), said aloud (a mic), last met or used, slipping; scroll; tap:
//              hear it (and a last tab, a speech bubble: the phrases, src/phrases.js, Phase 2: the same rows)
//   Check      ten words to ask away from the game (some strong, some slipping or due): the picture, the Spanish and the
//              English for the grown-up; tap right or not yet (the card stays a moment with its mark), skip or stop; the
//              answers count as practice (history.js H.checkAnswer: right = a recall, not yet = a miss) and the last
//              check's score shows, its words in the order asked
//   Tonight    one simple Spanish question for dinner from today's words (or the last days'), only words the child
//              has met, with its English and an answer to expect (templates per kind of word, below)
//   Talk       words to try at Spanish club (about 10 she knows well: greetings, phrases, feelings, numbers, colours,
//              family, animals; a new list each week, H.club; tap one to hear it), and her speaking: words said aloud
//              (once a day each, no echoes, no dog commands), the phrases (builder taps apart), listen and do, the mic
//              (a notice when the recent tries all failed, with the iPad settings to check: mic.js G.mic.status), and
//              where her voice goes
// Share (top): the summary as text (the share sheet; else the clipboard; else a box to copy from), inside the tap.
// Overview's foot: whether the game is saving (G.st.saveLine: "Saved just now" / "Not saved since 10:42"), the last
// backup ("Last backup: never / 9 days ago - back up now", asked for after 7 days), "Going on a trip or a break? Back up
// first.", and a Back up button that opens Back up / restore (src/backup.js). Only here, for grown-ups: never in her play.
// Every text is measured with the game's font so nothing is squeezed (tools/test-dashboard.js checks each tab).
// API: G.dashboard.open() -> Wait; .tonight(k) the k-th question of tonight's list ({id, es, en, ans: {es, en}, why,
//   words}); .tonights() the whole list; .shareText(); .TABS; .lines() each tab's rows of text (tests). The screen is
//   'LearningDash' (tests read .tab, .view()).
'use strict';
(function () {
  const DB = G.dashboard = {};
  const D = () => G.data, H = () => G.hist, Wd = () => G.words;
  DB.TABS = ['Overview', 'Memory', 'Pace', 'Words', 'Check', 'Tonight', 'Talk'];
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
  const name = () => G.st.playerName();
  const dateN = n => { const d = new Date(n * 864e5); return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate(); }; // (a day number)
  const dateMs = ms => { const d = new Date(ms); return MONTHS[d.getMonth()] + ' ' + d.getDate(); };
  const nOf = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
  // a list of words that fits a row: as many as fit, then "+3 more"
  const listFit = (ids, wmax, pre = '') => { const L = ids.map(es); for (let k = L.length; k > 0; k--) { const t = pre + L.slice(0, k).join(', ') + (k < L.length ? ' +' + (L.length - k) + ' more' : ''); if (G.textWidth(t) <= wmax || k === 1) return t; } return pre; };
  const ROW_W = 228; // (a row's value: G.W - 92)
  const sum = (L, f) => L.reduce((a, x) => a + (f(x) | 0), 0);
  const RECOG_MIN = 3; // (fewer picks than this: no percentage yet)
  // the item's words for a list: a word with its article ("el oso"), a phrase as its pattern ("Me llamo ...")
  const itemEs = id => (G.data.phrases && G.data.phrases[id] ? G.data.phrases[id].es.replace('___', '...') : es(id));
  const itemEn = id => (G.data.phrases && G.data.phrases[id] ? G.data.phrases[id].en.replace('___', '...') : en(id).replace(/^the /, ''));
  // the week's numbers, for the page and the share text
  DB.week = function () {
    const H0 = H(), o = H0.overview(), rv = o.reviews, nd = o.newDays;
    return { o, recog: o.recog7, recall: o.recall7, said: o.said7, done: sum(rv, d => d.done), backlog: o.backlog, newN: sum(nd, d => d.n), newToday: nd.length ? nd[nd.length - 1].n : 0,
      rate: G.budget ? G.budget.rate() : 2.5, target: o.target, mic: G.mic && G.mic.status ? G.mic.status() : { st: 'unsupported' } };
  };
  const rateS = r => (Math.round(r * 10) / 10).toString();
  // the lines (short, plain) the Overview and Share use
  const recogS = r => (r.n < RECOG_MIN ? 'too few words back after a day yet' : r.pct + '% this week, lucky taps taken out');
  const recallS = c => (c.n ? nOf(c.n, 'word') + ' this week' + (c.f ? ' (' + c.f + ' said)' : '') : 'none this week yet');
  const reviewS = w => w.done + ' done this week; ' + w.backlog + ' waiting now';
  const newS = w => w.newN + ' this week (target about ' + rateS(w.rate) + ' a play day)';
  const saidS = sa => (sa.of ? nOf(sa.said, 'word') + ' this week (once a day each)' : 'no practice this week yet');
  const MEM_NOTE = 'Recognition: picking the right card when a word comes back a day or more later. Recall: saying it before seeing it written, or picking it from pictures alone.';
  const switchS = n => 'From ' + dateN(n) + ' the game uses a stricter measure; earlier numbers counted guesses and same-day answers.';


  // =====================================================================
  //  Tonight's question: one line for dinner
  // =====================================================================
  // Templates by the kind of word; a question only uses words the child has met (and an answer she can give with
  // them). The answer's English is for the grown-up.
  const SOUND = { perro: 'guau', gato: 'miau', pato: 'cuac', rana: 'croac' };
  const HOME = { perro: 'casa', gato: 'casa', pajaro: 'arbol', pez: 'agua', rana: 'agua', pato: 'agua', gallina: 'granja', caballo: 'granja', cabra: 'granja',
    cangrejo: 'arena', estrellamar: 'mar', tortuga: 'mar', gaviota: 'mar', medusa: 'mar', delfin: 'mar', pulpo: 'mar',
    oso: 'cueva', ardilla: 'arbol', mapache: 'elbosque', venado: 'elbosque', zorro: 'elbosque', erizo: 'elbosque', buho: 'arbol', luciernaga: 'elbosque',
    // (no bee: bees live in a hive, not one of her words; the little ones that visit flowers or the park: SEEN)
    vaca: 'granja', cerdo: 'granja', oveja: 'granja', burro: 'granja', pavo: 'granja', raton: 'casa', gallo: 'granja', tlacuache: 'arbol',
    llama: 'lamontana', marmota: 'lamontana', zorrillo: 'lamontana', carpintero: 'arbol', monarca: 'arbol', puma: 'lamontana', aguila: 'lamontana', lobo: 'lamontana' };
  // where you see them (they don't live in a flower or in the park): "¿Dónde hay mariposas? En las flores." [place, plural]
  const SEEN = { mariposa: ['flor', 1], catarina: ['flor', 1], colibri: ['flor', 1], conejo: ['parque'], paloma: ['parque'], hormiga: ['parque'], lagartija: ['parque'], grillo: ['parque'] };
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
    ['seen', id => { const s = SEEN[id], n = s && G.requests.noun(id), p = s && G.requests.noun(s[0]); if (!n || !p || !met(s[0])) return null;
      const enPl = w => enBare(w).replace(/y$/, 'ie') + 's', place = s[1] ? (p.g === 'f' ? 'las ' : 'los ') + p.pl : es(s[0]);
      return { es: '¿Dónde hay ' + n.pl + '?', en: 'Where do you find ' + enPl(id) + '?', ans: { es: 'En ' + place + '.', en: (s[1] ? 'On the ' + enPl(s[0]) : 'In ' + en(s[0])) + '.' }, words: [id, s[0]] }; }],
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
  const SPECIFIC = ['sound', 'home', 'seen', 'color', 'dog', 'body', 'clothes', 'feel', 'weather', 'family'];
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
    const w = DB.week(), o = w.o, d = new Date(G.now()), L = [];
    L.push('Club de Español: ' + name() + '\'s learning (' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ')');
    L.push('Played ' + o.days + (o.days === 1 ? ' day' : ' days') + ', ' + hm(o.minutes) + ' in all' + (o.today ? ', ' + hm(o.today) + ' today' : '') + '.');
    L.push('Words: ' + o.met + ' met, ' + o.known + ' known, ' + o.remembered + ' remembered, ' + o.solid + ' solid (of ' + o.all + ' in the game).');
    L.push('Recognition (picking the right card when a word comes back after a day or more, lucky taps taken out): ' + (w.recog.n < RECOG_MIN ? 'too few words back after a day this week.' : w.recog.pct + '% in the last 7 days (' + w.recog.right + ' of ' + w.recog.n + ' right first try, ' + w.recog.raw + '% before taking out lucky taps).'));
    const c = w.recall; L.push('Recall from memory: ' + (c.n ? nOf(c.n, 'word') + ' in the last 7 days (' + [c.f + ' said before seeing them written', c.v + ' picked from pictures alone', c.c + ' your checks'].join(', ') + ').' : 'none in the last 7 days.'));
    L.push('Reviews: ' + w.done + ' done in the last 7 days; ' + w.backlog + ' waiting now' + (w.backlog > 5 ? ' (new words wait until it is 5 or fewer)' : '') + '.');
    L.push('New words and phrases: ' + w.newN + ' in the last 7 days, ' + w.newToday + ' today (target about ' + rateS(w.rate) + ' a play day, never more than 8 a day).' + (o.queue.length ? ' Seen, not taught yet: ' + o.queue.map(es).join(', ') + '.' : ''));
    L.push('Said aloud: ' + (w.said.of ? nOf(w.said.said, 'word') + ' in the last 7 days (each counted once a day; echoes and dog commands not counted).' : 'no practice in the last 7 days.'));
    if (w.mic.st === 'unavailable') L.push('Speaking: not working lately (the last ' + w.mic.n + ' mic tries failed: ' + w.mic.e + '). ' + IPAD_HINT + ' It needs the internet. Taps always work meanwhile.');
    L.push('Not seen in 30+ days: ' + o.unseen.d30 + '; 60+ days: ' + o.unseen.d60 + '. Forgotten (gold words missed, not back yet): ' + o.forgotten.now + '; relearned: ' + o.forgotten.relearned + '.');
    if (o.slipping.length) L.push('Slipping (' + o.slipping.length + '): ' + o.slipping.map(es).join(', ') + '.');
    if (o.phrases && o.phrases.met) L.push('Phrases: ' + o.phrases.met + ' of ' + o.phrases.of + ' met (' + H().phraseIds().filter(id => G.words.met(id)).map(id => G.phrase ? G.phrase.label(id) : id).join(', ') + '); said aloud ' + o.phrases.said + ' (once a day each), ' + o.phrases.today + ' today; built from cards ' + o.phrases.built + ' (not counted).');
    if (o.listen && o.listen.n) L.push('Listen and do (spoken requests with no pictures, like "Dame tres conchas"): ' + o.listen.n + (o.listen.n === 1 ? ' request' : ' requests') + ', ' + o.listen.pct + '% right the first time (' + o.listen.ft + ' of ' + o.listen.n + '); ' + o.listen.today.n + ' today.');
    L.push('Warm-up: ' + DB.warmText(o.warmup) + '.');
    const cv = o.checkVs;
    if (cv) L.push('Last word check: ' + cv.right + ' of ' + cv.of + ' (' + dateOf(cv.d) + ')' + (cv.game.n >= RECOG_MIN ? '; the game\'s recognition for the same words: ' + cv.game.pct + '%.' : '.'));
    const club = H().club(); if (club.length) L.push('Words to try at Spanish club: ' + club.map(itemEs).join(', ') + '.');
    const td = H().day().met; if (td.length) L.push('New today: ' + td.map(es).join(', ') + '.');
    const q = DB.tonight(0); if (q) L.push('Tonight\'s question: ' + q.es + ' (' + q.en + ') A good answer: ' + q.ans.es);
    if (o.switchNote) L.push(switchS(o.switchNote.num));
    return L.join('\n');
  };
  // the dog's warm-up today, and the mid-session dog moment (warmup.js: hist.wu, hist.wu.m)
  DB.warmText = function (w) {
    const td = G.today(), L = w && w.last, m = w && w.m && w.m.d === td ? w.m : null;
    const mid = m && m.of ? '; +' + m.of + ' later' : '';
    if (w && w.d === td && L && L.d === td) { const rq = L.ids.indexOf('_ld') >= 0 ? 1 : 0, nw = (L.skipped ? L.ids.length : L.of) - rq; return L.skipped ? 'skipped today after ' + nOf(L.of, 'card') + mid : nOf(nw, 'card') + (rq ? ' and a request' : '') + ' today, ' + L.right + ' right first try' + mid; } // (_ld: a listen-and-do request, warmup.js)
    if (w && w.d === td) return 'not today (fewer than 2 words were due)';
    return 'not yet today; ' + (w ? w.n | 0 : 0) + ' in all';
  };
  // where her voice goes, and the iPad settings speaking needs (mic.js, speech.js)
  const IPAD_HINT = 'On iPad: Siri & Dictation on, and Spanish (Mexico) added under Settings, General, Keyboard, Dictation Languages.';
  const PRIVACY = 'Her voice: on iPad, Safari\'s speech recognition may send audio to Apple; check your iPadOS settings. Chrome sends it to Google. The game keeps no audio.';

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
  // a word's strength: four stage blocks (met, known, remembered, solid) and its review box under them, one mark a box
  // (words.js W.MAXBOX: 8, gaps up to 150 days)
  function strength(ctx, x, y, st, box) {
    for (let j = 0; j < 4; j++) { ctx.fillStyle = '#000010'; ctx.fillRect(x + j * 9 - 1, y - 1, 10, 8); ctx.fillStyle = j < st ? STAGE_COL[j] : COL.line; ctx.fillRect(x + j * 9, y, 8, 6); }
    const n = G.words.MAXBOX || 8;
    for (let j = 0; j < n; j++) { ctx.fillStyle = j < box ? '#c8d0f0' : COL.line; ctx.fillRect(x + Math.round(j * 35 / n), y + 9, 3, 2); }
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
    tabRect(k) { // as wide as its name (and an even share of what's left), so no name is squeezed
      if (!DB.tabRs) { const ws = DB.TABS.map(n => G.textWidth(n) + 8), gap = 2, add = Math.floor((G.W - 8 - ws.reduce((a, b) => a + b, 0) - gap * (ws.length - 1)) / ws.length); let x = 4; DB.tabRs = ws.map(w => { const r = { x, y: 27, w: w + add, h: 16 }; x += w + add + gap; return r; }); }
      return DB.tabRs[k];
    }
    clubRect(k) { return { x: k % 2 ? 162 : 6, y: 60 + (k >> 1) * 10, w: 152, h: 10 }; } // (Talk: a word to try at the club)
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
    backupRect() { return { x: G.W - 70, y: 190, w: 62, h: 20 }; } // (Overview: opens Back up / restore)
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
      const w = DB.week(), o = w.o;
      return { tab: DB.TABS[this.tab], overview: o, week: w, reviews: H().reviewDays(PACE_DAYS), newDays: H().newDays(PACE_DAYS), club: H().club(), mic: w.mic, zone: this.zone, rows: this.rows(), check: H().checkCur(), last: H().checkLast(), tonight: DB.tonight(this.tq) };
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
      if (page === 'Overview' && G.backup && G.tapIn(this.backupRect())) { G.audio.sfx('ok'); G.backup.open(); return; }
      if (page === 'Words') this.updWords(d);
      else if (page === 'Check') this.updCheck();
      else if (page === 'Tonight') this.updTonight();
      else if (page === 'Talk') this.updTalk();
    }
    updTalk() { // tap a word to try at the club: hear it
      const L = this.memo('club', () => H().club()), k = L.findIndex((id, k) => G.tapIn(this.clubRect(k)));
      if (k >= 0) { this.hi = { id: L[k], t: this.t }; G.speak(G.data.phrases && G.data.phrases[L[k]] && G.phrase ? G.phrase.label(L[k]) : G.baseForm(L[k])); }
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
      else if (page === 'Memory') this.drawMemory(ctx);
      else if (page === 'Pace') this.drawPace(ctx);
      else if (page === 'Words') this.drawWords(ctx);
      else if (page === 'Check') this.drawCheck(ctx);
      else if (page === 'Tonight') this.drawTonight(ctx);
      else this.drawTalk(ctx);
      if (this.noteT > 0) { const w = G.textWidth(this.note) + 16; G.win(ctx, (G.W - w) / 2, 196, w, 18, { fill1: '#2a6a3a', fill2: '#103a1c', alpha: 1 }); G.textC(ctx, this.note, G.W / 2, 201, COL.yel); }
    }
    drawOverview(ctx) {
      const w = this.memo('w', () => DB.week()), o = w.o;
      [['met', o.met, STAGE_COL[0]], ['known', o.known, STAGE_COL[1]], ['remembered', o.remembered, STAGE_COL[2]], ['solid', o.solid, STAGE_COL[3]]].forEach(([lab, n, col], k) => {
        const x = 8 + k * 77;
        G.win(ctx, x, 49, 73, 38, { fill1: '#202a78', fill2: '#121a50', alpha: 1 });
        G.bigText(ctx, String(n), x + 36, 56, 2, col);
        G.textC(ctx, lab, x + 36, 75, col);
      });
      // every word of the game, by stage (unmet grey)
      const bx = 8, by = 92, bw = G.W - 16, all = Math.max(1, o.all), segs = [[o.solid, STAGE_COL[3]], [o.remembered - o.solid, STAGE_COL[2]], [o.known - o.remembered, STAGE_COL[1]], [o.met - o.known, STAGE_COL[0]]];
      ctx.fillStyle = '#000010'; ctx.fillRect(bx - 1, by - 1, bw + 2, 7); ctx.fillStyle = COL.line; ctx.fillRect(bx, by, bw, 5);
      let x = bx; for (const [n, col] of segs) { const ww = Math.round(bw * Math.max(0, n) / all); ctx.fillStyle = col; ctx.fillRect(x, by, ww, 5); x += ww; }
      G.textR(ctx, o.met + ' of ' + o.all + ' words met', G.W - 8, 100, COL.dim);
      G.text(ctx, 'Counts include the stronger words', 8, 100, '#8890c0');
      this.rowsAt(ctx, DB.overviewRows(w), 110);
      this.drawBackup(ctx);
    }
    // label / value rows from y (10 px apart): [label, value, colour]
    rowsAt(ctx, rows, y) {
      rows.forEach(([a, b, col], k) => {
        G.text(ctx, a, 10, y + k * 10, COL.dim);
        G.text(ctx, fit(b, G.W - 92), 82, y + k * 10, col || COL.white);
      });
    }
    // is it saving, the last backup (asked for after 7 days), before a trip; a button to Back up / restore (backup.js)
    drawBackup(ctx) {
      const B = G.backup; if (!B) return;
      ctx.fillStyle = COL.line; ctx.fillRect(8, 188, G.W - 16, 1);
      const sl = G.st.saveLine(), od = B.overdue(), w = G.W - 84;
      G.text(ctx, fit(sl ? sl + '.' : '', w), 10, 192, G.st.status.fails ? COL.slip : COL.dim);
      G.text(ctx, fit(B.lastLine() + '.', w), 10, 202, od ? COL.yel : COL.dim);
      G.text(ctx, 'Going on a trip or a break? Back up first.', 10, 212, '#8890c0');
      textBtn(ctx, this.backupRect(), 'Back up', od || G.st.status.fails ? { fill: '#2a7a3a', rim: '#a8e8b0' } : {});
    }
    // listen and do (src/listen.js): spoken requests with no pictures, how many and how many right on the first try
    listenLine(l) {
      if (!l || !l.n) return 'none yet ("Dame tres conchas.")';
      return l.n + (l.n === 1 ? ' request, ' : ' requests, ') + l.pct + '% right first try (' + l.today.n + ' today)';
    }
    // the phrases (src/phrases.js): how many met, said aloud (once a day each, no echoes) in the kept days and today, and
    // the builder's taps apart (always right: not practice)
    phraseLine(p) {
      if (!p || !p.met) return 'none met yet (Me llamo, Quiero, Me gusta...)';
      return p.met + ' of ' + p.of + ' met; said ' + p.said + ' (' + p.today + ' today)' + (p.built ? '; ' + p.built + ' built' : ''); // (said: once a day each; the line under the rows says so)
    }
    // ---------- Memory: recognition and recall, your check beside the game's, forgotten, not seen, the switch ----------
    drawMemory(ctx) {
      const w = this.memo('w', () => DB.week()), o = w.o, r = w.recog, c = w.recall;
      const cols = [[80, 'Recognition', r.n < RECOG_MIN ? '--' : r.pct + '%', r.n < RECOG_MIN ? COL.dim : r.pct >= 60 ? COL.gold : COL.met, 'lucky taps taken out', r.n ? r.right + ' of ' + r.n + ' right first try' : 'none back after a day yet'],
        [236, 'Recall from memory', String(c.n), c.n ? COL.gold : COL.dim, nOf(c.n, 'word') + ' this week', c.n ? [c.f && c.f + ' said', c.v && c.v + ' pictures', c.c && c.c + ' yours'].filter(Boolean).join(', ') : 'said or picked from memory']];
      for (const [cx, lab, big, col, a, b] of cols) {
        G.textC(ctx, lab, cx, 50, COL.white);
        G.bigText(ctx, big, cx, 64, 3, col);
        G.textC(ctx, a, cx, 94, COL.dim); G.textC(ctx, b, cx, 104, COL.dim);
      }
      this.rowsAt(ctx, DB.memoryRows(w), 118);
      G.wrap(MEM_NOTE, G.W - 20).slice(0, 3).forEach((l, i) => G.text(ctx, l, 10, 170 + i * 10, '#8890c0'));
      const sn = o.switchNote; if (sn) G.wrap(switchS(sn.num), G.W - 20).slice(0, 2).forEach((l, i) => G.text(ctx, l, 10, 203 + i * 10, COL.yel));
    }
    // ---------- Pace: reviews done against due a day, the backlog; new items a day against the target; the queue ----------
    drawPace(ctx) {
      const R = this.memo('rv', () => H().reviewDays(PACE_DAYS)), N = this.memo('nd', () => H().newDays(PACE_DAYS)), w = this.memo('w', () => DB.week());
      const x0 = 30, sw = 13, base = 116, hh = 50;
      G.text(ctx, 'Reviews a day, last 3 weeks:', 10, 50, COL.dim);
      const lx = 10 + G.textWidth('Reviews a day, last 3 weeks:') + 8;
      ctx.fillStyle = COL.gold; ctx.fillRect(lx, 51, 6, 6); G.text(ctx, 'done', lx + 9, 50, COL.white);
      ctx.fillStyle = '#a8b0d8'; ctx.fillRect(lx + 42, 51, 6, 6); ctx.fillStyle = '#1c2c8c'; ctx.fillRect(lx + 43, 52, 4, 4); G.text(ctx, 'due', lx + 51, 50, COL.white);
      const top = Math.max(5, ...R.map(d => Math.max(d.due | 0, d.done | 0))), scale = top <= 5 ? 5 : top <= 10 ? 10 : Math.ceil(top / 10) * 10, hgt = n => Math.round(hh * n / scale);
      ctx.fillStyle = COL.line; ctx.fillRect(x0 - 4, base + 1, R.length * sw + 2, 1); ctx.fillRect(x0 - 4, base - hh, R.length * sw + 2, 1);
      G.textR(ctx, String(scale), x0 - 7, base - hh - 3, '#6070b0'); G.textR(ctx, '0', x0 - 7, base - 6, '#6070b0');
      R.forEach((d, k) => {
        const x = x0 + k * sw;
        if (d.done) { const h = Math.max(2, hgt(d.done)), col = d.est ? '#6070b0' : d.due != null && d.done >= d.due ? COL.gold : COL.met; ctx.fillStyle = '#000010'; ctx.fillRect(x + 2, base - h - 1, 8, h + 1); ctx.fillStyle = col; ctx.fillRect(x + 2, base - h, 6, h); }
        else if (d.played) { ctx.fillStyle = '#6070b0'; ctx.fillRect(x + 3, base - 2, 4, 2); }
        if (d.due) { const h = Math.max(2, hgt(d.due)); ctx.fillStyle = '#a8b0d8'; ctx.fillRect(x, base - h, 10, 1); ctx.fillRect(x, base - h, 1, h); ctx.fillRect(x + 9, base - h, 1, h); } // (due: a frame over it, open at the foot)
      });
      [R.length - 15, R.length - 8, R.length - 1].forEach(k => { if (k >= 0) G.textC(ctx, dateN(R[k].num), x0 + k * sw + 5, base + 4, k === R.length - 1 ? COL.yel : '#8890c0'); });
      // new items a day: a bar each, 3 px an item (the cap, 8, at the top), the year's target as a line
      const nb = 162, ph = 3;
      G.text(ctx, 'New words and phrases a day', 10, 129, COL.dim);
      const tx = 10 + G.textWidth('New words and phrases a day') + 8; ctx.fillStyle = COL.good; ctx.fillRect(tx, 133, 10, 1); G.text(ctx, 'target', tx + 13, 129, COL.white);
      ctx.fillStyle = COL.line; ctx.fillRect(x0 - 4, nb + 1, R.length * sw + 2, 1);
      N.forEach((d, k) => { if (!d.n) return; const x = x0 + k * sw, h = Math.min(8, d.n) * ph; ctx.fillStyle = '#000010'; ctx.fillRect(x + 1, nb - h - 1, 9, h + 1); ctx.fillStyle = COL.met; ctx.fillRect(x + 2, nb - h, 6, h); });
      ctx.globalAlpha = 0.8; ctx.fillStyle = COL.good; for (let x = x0 - 4; x < x0 + R.length * sw - 2; x += 4) ctx.fillRect(x, nb - Math.round(w.rate * ph), 2, 1); ctx.globalAlpha = 1;
      this.rowsAt(ctx, DB.paceRows(w), 168);
      G.text(ctx, 'Reviews come first: new words wait while 6+ are due.', 10, 200, '#8890c0');
      G.text(ctx, R.some(d => d.est) ? 'Grey: days before due counts began (done estimated).' : 'Held back: seen in play, taught when there is room.', 10, 210, '#8890c0');
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
      G.text(ctx, 'Tap a word to hear it. Dashes: its review box (1-8).', 8, 210, '#8890c0');
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
    // ---------- Talk: words to try at Spanish club; her speaking ----------
    drawTalk(ctx) {
      const L = this.memo('club', () => H().club()), w = this.memo('w', () => DB.week());
      G.text(ctx, 'Words to try at Spanish club', 10, 50, COL.yel);
      G.textR(ctx, 'new each week', G.W - 10, 50, '#8890c0');
      if (!L.length) G.wrap('Nothing yet: words she knows well (gold cards) show up here, a new list each week.', G.W - 20).forEach((l, i) => G.text(ctx, l, 10, 66 + i * 10, COL.dim));
      L.forEach((id, k) => {
        const r = this.clubRect(k), hi = this.hi && this.hi.id === id && this.t - this.hi.t < 40, a = itemEs(id);
        if (hi) { ctx.fillStyle = 'rgba(248,224,96,0.18)'; ctx.fillRect(r.x, r.y - 1, r.w, r.h); }
        G.text(ctx, a, r.x + 4, r.y + 1, COL.gold);
        G.text(ctx, fit(itemEn(id), r.w - 12 - G.textWidth(a)), r.x + 10 + G.textWidth(a), r.y + 1, COL.dim);
      });
      if (L.length) G.text(ctx, 'She knows these well: share them with her club teacher.', 10, 114, '#8890c0');
      ctx.fillStyle = COL.line; ctx.fillRect(8, 125, G.W - 16, 1);
      this.rowsAt(ctx, DB.talkRows(w), 129);
      const m = w.mic, hint = m.st === 'unavailable' ? G.wrap(IPAD_HINT, G.W - 20).slice(0, 2) : [];
      hint.forEach((l, i) => G.text(ctx, l, 10, 170 + i * 10, COL.slip));
      G.wrap(PRIVACY, G.W - 20).slice(0, 3).forEach((l, i) => G.text(ctx, l, 10, 192 + i * 10, '#8890c0'));
    }
  }
  const PACE_DAYS = 21;
  // each tab's label / value rows (the screen draws them; tests measure them): [label, value, colour]
  DB.overviewRows = function (w) {
    const o = w.o, unav = w.mic.st === 'unavailable';
    return [
      ['Played', o.days + (o.days === 1 ? ' day, ' : ' days, ') + hm(o.minutes) + ' in all, ' + (o.today ? hm(o.today) : 'nothing yet') + ' today'],
      ['Recognition', recogS(w.recog), w.recog.n < RECOG_MIN ? COL.dim : null],
      ['Recall', recallS(w.recall)],
      ['Reviews', reviewS(w), w.backlog > 5 ? COL.slip : null],
      ['New items', newS(w)],
      unav ? ['Speaking', 'not working lately: see Talk', COL.slip] : ['Said aloud', saidS(w.said)],
      ['Warm-up', DB.warmText(o.warmup)],
      ['Slipping', o.slipping.length ? listFit(o.slipping, ROW_W, o.slipping.length + ': ') : 'none', o.slipping.length ? COL.slip : null],
    ];
  };
  DB.memoryRows = function (w) {
    const o = w.o, cv = o.checkVs, f = o.forgotten, all = o.recogAll, ra = o.recallAll;
    return [
      ['Your check', cv ? cv.right + ' of ' + cv.of + ' right (' + dateOf(cv.d) + '); the game: ' + (cv.game.n >= RECOG_MIN ? cv.game.pct + '%' : 'too few yet') : 'none yet (the Check tab)', cv ? COL.yel : COL.dim],
      ['60 days', (all.n >= RECOG_MIN ? all.pct + '% (' + nOf(all.n, 'pick') + ')' : 'too few picks') + '; recall ' + nOf(ra.n, 'word')],
      ['Forgotten', f.now ? nOf(f.now, 'gold word') + ' missed, not back yet' : 'none (no gold word missed lately)', f.now ? COL.slip : null],
      ['Relearned', f.relearned ? f.relearned + ' in all (' + f.week + ' this week)' : 'none yet'],
      ['Not seen', o.unseen.d30 + ' in 30+ days, ' + o.unseen.d60 + ' in 60+ days'],
    ];
  };
  DB.paceRows = function (w) {
    const q = w.o.queue;
    return [
      ['Waiting now', nOf(w.backlog, 'review') + (w.backlog > 5 ? ': new words wait' : ' (up to 5 is fine)'), w.backlog > 5 ? COL.slip : null],
      ['New today', w.newToday + ' (target ' + w.target + '; never more than 8)'],
      ['Held back', q.length ? listFit(q, ROW_W) : 'nothing (words seen but not taught yet)', q.length ? null : COL.dim],
    ];
  };
  DB.talkRows = function (w) {
    const o = w.o, m = w.mic;
    const mic = m.st === 'unavailable' ? ['not working: last ' + m.n + ' tries failed (' + m.e + ')', COL.slip] : m.st === 'ok' ? ['working (heard her ' + dateMs(m.okAt) + ')'] : m.st === 'off' ? ['off (grown-ups menu: Speaking)', COL.dim]
      : m.st === 'unsupported' ? ['no speech recognition in this browser', COL.dim] : ['no try has heard her yet', COL.dim];
    return [
      ['Said aloud', saidS(w.said)],
      ['Phrases', LearningDash.prototype.phraseLine(o.phrases)],
      ['Listen & do', LearningDash.prototype.listenLine(o.listen)],
      ['Mic', mic[0], mic[1]],
    ];
  };
  // every row of text on a tab, for the tests (what's drawn, before fitting)
  DB.lines = function (tab) {
    const w = DB.week();
    return tab === 'Overview' ? DB.overviewRows(w) : tab === 'Memory' ? DB.memoryRows(w) : tab === 'Pace' ? DB.paceRows(w) : tab === 'Talk' ? DB.talkRows(w) : [];
  };
  function arrowGlyph(ctx, [x, y], dir) { // over the iconBtn's own arrow: an up / down triangle
    ctx.fillStyle = '#1c2c8c'; ctx.fillRect(x + 2, y + 2, 16, 16);
    ctx.fillStyle = '#f0f0ff';
    for (let i = 0; i < 5; i++) { const w = 1 + i * 2, yy = dir < 0 ? y + 7 + i : y + 12 - i; ctx.fillRect(x + 10 - i, yy, w, 1); }
  }
  G.LearningDash = LearningDash;
  DB.open = function (o) { const w = new G.Wait(); G.push(new LearningDash(w, o)); return w; };
})();
