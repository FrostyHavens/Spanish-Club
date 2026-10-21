// ===== The request maker: listen-and-do instructions built only from words she knows (docs/LEARNING_PLAN_2.md, Phase 3) =====
// A friend asks for something and she does it: "Dame tres conchas." "Dame la manzana roja." "Toca el perro grande."
// "¿Dónde está el oso pequeño?" "¿Cuántas conchas azules hay?" Later two details at once: "Dame dos flores amarillas."
// Every vocabulary word in a request is KNOWN (stage 2+, src/words.js); the rest is plain grammar (Dame, Toca, la, un,
// hay...), always correct Mexican Spanish:
//   articles by gender     el / la / los / las, un / una (el agua, el águila: feminine nouns with "el", RQ.FEM_EL)
//   plurals                the word's own `pl` (content/es/words.js) or the rules: concha -> conchas, flor -> flores,
//                          pez -> peces (z -> ces: lápiz -> lápices), ratón -> ratones (the accent goes), joven ->
//                          jóvenes (one comes), árbol -> árboles (it stays), colibrí -> colibríes, el lunes -> los lunes,
//                          estrella de mar -> estrellas de mar
//   colour and size        rojo / roja / rojos / rojas, amarillo, blanco, rosado, pequeño; azul -> azules, verde ->
//                          verdes, grande -> grandes (no gender)
//   numbers                uno -> un / una before the noun (Dame una concha. Dame un plátano.)
// The templates (one detail; two details once she gets several right first try: the ramp, RQ.level):
//   num      count into the basket        "Dame tres conchas."               (number + thing)
//   col      tap the right one            "Dame la manzana roja."            (colour + thing)
//   size     tap the right one            "Toca el perro grande." / "¿Dónde está el oso pequeño?" / "Dame el hongo grande."
//   howmany  count, then say or tap it    "¿Cuántas conchas hay?"            (the number is HER answer: the mic fits here)
//   numcol   (two details) count          "Dame dos flores amarillas."
//   numsize  (two details) count          "Dame tres hongos pequeños."
//   howmany2 (two details) count, answer  "¿Cuántas conchas azules hay?" / "¿Cuántos osos pequeños hay?"
// A request's tray (the board of 4-6 pictures without labels, src/listen.js) is built so that each word is really
// needed: a word is TESTED when a picture differs from the right one only in that word's detail (a red and a green
// apple test "roja"; a red apple and a red flower test "manzana"; a pile bigger than the number tests the number).
// Only tested words get credit (src/listen.js: one 'listen' retrieval per word per request); the others are heard.
// World requests (carry: true) are smaller (at most three: the hands hold three, src/carry.js) and their things are
// scattered on the map to pick up ("Tráeme dos conchas rosadas.").
//
// API (G.requests, short RQ):
//   RQ.noun(id) {id, g: 'm'|'f', sg, pl, plOnly}   RQ.plural(s)   RQ.pluralAdj(s)   RQ.adj(id, g, plural)
//   RQ.numWord(id, g)  ('una')   RQ.art(noun, plural, definite)   RQ.np(r) the noun phrase {text, plain}
//   RQ.sentence(r) {text (rich: the words as [id:form] tokens, src/ui.js), say (plain)}
//   RQ.make(spec, o) -> a request or null. spec: RQ.SPECS[who] (or one of a place: RQ.spec(who, zone)); o: {focus (a
//     word id to use if it can), level (1 | 2; default RQ.level()), tpl (force one), carry, verb}
//   RQ.feasible(spec, id) a request can be made that uses the word id     RQ.words(spec) every word a spec may use
//   RQ.check(req, answer) -> {ok, dims: {thing, col, size, num: true | false}} (answer: a tray cell, a list of things,
//     or a number word)
//   RQ.level() 1 | 2   RQ.result(req, first) the ramp after a request (src/history.js keeps it: G.state.hist.ld)
//   RQ.SPECS   who asks for what (content: add a person's board here or from a zone file)
'use strict';
(function () {
  const RQ = G.requests = {};
  const D = () => G.data;
  const WD = id => (D() && D().words && D().words[id]) || null;
  const rnd = () => (G.rand ? G.rand() : Math.random());
  const pick = a => a[Math.floor(rnd() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const stage = id => (G.words && G.words.stage ? G.words.stage(id) : 0);
  RQ.MIN_STAGE = 2;                 // every word in a request: known (picked right without a cue) or better
  RQ.known = id => !!WD(id) && stage(id) >= RQ.MIN_STAGE;
  RQ.UP = 4;                        // first-try rights at level 1 before two details come in
  RQ.DOWN = 2;                      // two-detail requests missed in a row before it steps back
  RQ.TWO = 0.6;                     // at level 2, the share of two-detail requests (when one can be made)
  RQ.ONE = 0.25;                    // how often counting "una concha" (one) is among the counts: rarely, it's easy
  RQ.NUMS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

  // =====================================================================
  //  Grammar
  // =====================================================================
  RQ.FEM_EL = ['agua', 'aguila']; // feminine nouns that take "el" / "un" in the singular (a stressed a-): el águila blanca
  const VOWELS = 'aeiouáéíóúü', ACC = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }, ADD = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
  const isV = c => VOWELS.includes(c);
  const syllables = s => (s.match(/[aeiouáéíóúü]+/g) || []).length; // (vowel runs: close enough for the stress rules here)
  const accentLast = s => /[áéíóú][^aeiouáéíóúü]*$/.test(s);      // a written accent in the last syllable
  // a plural, by the rules (a word's own `pl` in content/es/words.js always wins: RQ.noun)
  RQ.plural = function (s) {
    s = String(s).trim();
    const k = s.indexOf(' de '); if (k > 0) return RQ.plural(s.slice(0, k)) + s.slice(k); // estrella de mar -> estrellas de mar
    if (s.includes(' ')) { const p = s.split(' '); return [RQ.plural(p[0])].concat(p.slice(1).map(RQ.pluralAdj)).join(' '); } // pájaro carpintero -> pájaros carpinteros
    const low = s.toLowerCase(), c = low.slice(-1);
    if ('aeoáéó'.includes(c) || ((c === 'i' || c === 'u') && !accentLast(low))) return s + 's'; // concha -> conchas, bebé -> bebés, taxi -> taxis
    if (c === 'í' || c === 'ú') return s + 'es';                       // colibrí -> colibríes
    if (c === 'z') return s.slice(0, -1) + 'ces';                      // pez -> peces, lápiz -> lápices, nariz -> narices
    if (c === 'y' && isV(low.slice(-2, -1))) return s + 'es';          // rey -> reyes
    if (c === 's' || c === 'x') {                                      // el lunes -> los lunes; el mes -> los meses, el autobús -> los autobuses
      if (syllables(low) > 1 && !accentLast(low)) return s;
      return unaccentLast(s) + 'es';
    }
    if (c === 'n') {
      if (accentLast(low)) return unaccentLast(s) + 'es';             // ratón -> ratones, calcetín -> calcetines
      if (syllables(low) > 1 && !/[áéíóú]/.test(low)) return accentPenult(s) + 'es'; // joven -> jóvenes, examen -> exámenes
      return s + 'es';                                                 // pan -> panes
    }
    return s + 'es';                                                   // flor -> flores, árbol -> árboles, pared -> paredes
  };
  // the accent of the last syllable goes away (ratón -> raton-)
  function unaccentLast(s) { const m = /([áéíóú])([^aeiouáéíóúü]*)$/.exec(s); return m ? s.slice(0, m.index) + ACC[m[1]] + m[2] : s; }
  // a written accent on the vowel that carries the stress of a word stressed on its next-to-last syllable (joven -> jóven-)
  function accentPenult(s) {
    const runs = []; s.replace(/[aeiouü]+/g, (m, i) => { runs.push([m, i]); return m; });
    if (runs.length < 2) return s;
    const [m, i] = runs[runs.length - 2], j = (() => { for (let k = 0; k < m.length; k++) if ('aeo'.includes(m[k])) return k; return m.length - 1; })();
    return s.slice(0, i + j) + ADD[m[j]] + s.slice(i + j + 1);
  }
  // an adjective's plural: roja -> rojas, azul -> azules, verde -> verdes, feliz -> felices
  RQ.pluralAdj = s => (/[aeiouáéó]$/.test(s) ? s + 's' : /z$/.test(s) ? s.slice(0, -1) + 'ces' : s + 'es');
  // a noun word: {id, g, sg (null for a plural-only word: los guantes), pl, plOnly}, or null (not a noun)
  RQ.noun = function (id) {
    const w = WD(id); if (!w) return null;
    const m = /^(el|la|los|las) (.+)$/.exec(w.es.split(' / ')[0].trim()); if (!m) return null;
    const plOnly = m[1] === 'los' || m[1] === 'las', elFem = RQ.FEM_EL.includes(id);
    const g = m[1] === 'la' || m[1] === 'las' || elFem ? 'f' : 'm';
    return { id, g, sg: plOnly ? null : m[2], pl: plOnly ? m[2] : (w.pl || RQ.plural(m[2])), plOnly, elFem };
  };
  // the article: definite (el, la, los, las) or not (un, una, unos, unas); el / un for el águila
  RQ.art = (n, plural, def) => (def ? (plural ? (n.g === 'f' ? 'las' : 'los') : (n.g === 'f' && !n.elFem ? 'la' : 'el'))
    : (plural ? (n.g === 'f' ? 'unas' : 'unos') : (n.g === 'f' && !n.elFem ? 'una' : 'un')));
  // a colour or size word agreeing with its noun
  RQ.adj = function (id, g, plural) {
    const w = WD(id); if (!w) return id;
    const f = w.es.split(' / ').map(x => x.trim()), sg = g === 'f' && f[1] ? f[1] : f[0];
    return plural ? RQ.pluralAdj(sg) : sg;
  };
  // a number word before its noun: uno -> un / una, the rest as they are
  RQ.numWord = (id, g) => (id === 'uno' ? (g === 'f' ? 'una' : 'un') : WD(id) ? WD(id).es.split(' / ')[0] : id);
  RQ.numOf = id => (WD(id) && WD(id).n) || RQ.NUMS.indexOf(id) + 1;
  const tok = (id, form) => '[' + id + ':' + form + ']';
  // the noun phrase of a request r {thing, col, size, num, def}: {text: rich text with tokens, plain}
  RQ.np = function (r) {
    const n = RQ.noun(r.thing); if (!n) return null;
    const many = r.num ? RQ.numOf(r.num) !== 1 : n.plOnly || !!r.plural, parts = [];
    if (r.num) parts.push([r.num, r.num === 'uno' && n.elFem ? 'un' : RQ.numWord(r.num, n.g)]); // (un águila)
    else if (r.def !== false) parts.push([null, RQ.art(n, many, true)]);
    parts.push([r.thing, many ? n.pl : n.sg]);
    if (r.size) parts.push([r.size, RQ.adj(r.size, n.g, many)]);
    if (r.col) parts.push([r.col, RQ.adj(r.col, n.g, many)]);
    return { text: parts.map(([id, f]) => (id ? tok(id, f) : f)).join(' '), plain: parts.map(p => p[1]).join(' '), many, g: n.g };
  };
  const cap = s => s.replace(/^([¿¡]?)(\S)/, (m, a, b) => a + b.toUpperCase());
  const VERB = { give: 'Dame', bring: 'Tráeme', touch: 'Toca' };
  // the whole sentence: {text, say}. r.verb: 'give' | 'bring' | 'touch' | 'where' | 'howmany'; r.polite: ", por favor"
  RQ.sentence = function (r) {
    const np = RQ.np(Object.assign({}, r, r.verb === 'howmany' ? { def: false, plural: true, num: null } : {})); if (!np) return null;
    let text, say;
    if (r.verb === 'howmany') { const q = np.g === 'f' ? 'Cuántas' : 'Cuántos'; text = '¿' + q + ' ' + np.text + ' hay?'; say = '¿' + q + ' ' + np.plain + ' hay?'; }
    else if (r.verb === 'where') { const v = np.many ? 'están' : 'está'; text = '¿Dónde ' + v + ' ' + np.text + '?'; say = '¿Dónde ' + v + ' ' + np.plain + '?'; }
    else {
      const v = VERB[r.verb] || 'Dame', pol = r.polite ? ', por favor' : '';
      text = v + ' ' + np.text + pol + '.'; say = v + ' ' + np.plain + pol + '.';
    }
    return { text: cap(text), say: cap(say), np: '¡' + cap(np.plain) + '!' };
  };

  // =====================================================================
  //  Who asks for what: a person's board (the things of their place)
  // =====================================================================
  // things: { word id: {cols: [colour word ids it comes in], count: 1 (it can be counted: piles, "¿cuántas?"), sizes: 1
  //   (big and small), animal: 1 (touched or looked for: "Toca el perro grande", never handed over)} }; carry: 1 (a world
  // request: the things are scattered on the map to pick up and bring, src/listen.js); places: { zone: things } (Lola:
  // the board of the place she's in)
  const A = { sizes: 1, count: 1, animal: 1 };
  const FRUIT = { manzana: { cols: ['rojo', 'verde', 'amarillo'], count: 1 }, platano: { cols: ['amarillo', 'verde'], count: 1 }, naranja: { count: 1 } };
  const COLS = ['rojo', 'azul', 'amarillo', 'verde', 'rosa', 'blanco'];
  RQ.SPECS = {
    // Villa Sol: Don Pepe's fruit (by colour, by number), Nico's animals (big and small), Lucía's flowers (to bring)
    pepe: { things: FRUIT },
    nico: { things: { perro: A, gato: A, conejo: A, pato: A, rana: A, pajaro: A, pez: A, cabra: A, caballo: A, gallina: A } },
    lucia: { carry: 1, things: { flor: { cols: ['rosa', 'amarillo', 'blanco', 'rojo', 'azul'], count: 1 } } },
    // Lola, in whichever place she is: the beach's shells, the forest's leaves, the grandparents' apples (to bring)
    lola: { carry: 1, places: {
      playa: { concha: { cols: ['rosa', 'blanco', 'azul', 'amarillo', 'rojo'], count: 1 } },
      bosque: { hoja: { cols: ['verde', 'amarillo', 'rojo'], count: 1 } },
      abuelos: { manzana: { cols: ['rojo', 'verde', 'amarillo'], count: 1 } } } },
    // El bosque: Doña Lupe's berries, acorns, mushrooms and leaves; Elena's animals (big and small)
    lupe: { things: { mora: { count: 1 }, bellota: { count: 1 }, hongo: { sizes: 1, count: 1 }, hoja: { cols: ['verde', 'amarillo', 'rojo'], count: 1 } } },
    elena: { things: { oso: A, ardilla: A, mapache: A, venado: A, zorro: A, erizo: A, buho: A, conejo: A } },
    // La casa de los abuelos: Abuelo's orchard and henhouse (the game has no vegetable words yet: a vegetable word added
    // to content/es/words.js can join his board here), and his animals
    abuelo: { things: Object.assign({ huevo: { count: 1 } }, { manzana: FRUIT.manzana }, { vaca: A, cerdo: A, oveja: A, burro: A, pavo: A, gallo: A }) },
    // La montaña: Mateo's weather things (clouds, the sun, snowmen: big and small) and the clothes for the cold
    mateo: { things: { nube: { sizes: 1, count: 1 }, elsol: { sizes: 1 }, muneco: { sizes: 1 }, gorro: { cols: COLS }, bufanda: { cols: COLS }, guantes: { cols: COLS } } },
    // the dog's warm-up (src/warmup.js): his own things, and every board above (RQ.spec('dog'))
    dog: { things: { pelota: { cols: COLS }, hueso: { count: 1 } } },
  };
  // the board a person asks about here: a place's own (Lola), the dog's: everything she might know
  RQ.spec = function (who, zone) {
    const s = RQ.SPECS[who]; if (!s) return null;
    if (s.places) { const z = zone && s.places[zone] ? zone : Object.keys(s.places)[0]; return Object.assign({ who, zone: z }, s, { things: s.places[z] }); }
    if (who === 'dog') {
      const things = {};
      for (const k in RQ.SPECS) { const o = RQ.SPECS[k]; if (o.carry) continue; Object.assign(things, o.things); }
      Object.assign(things, s.things);
      return { who, things };
    }
    return Object.assign({ who }, s);
  };
  // every word a board may use (its things, their colours, the sizes, the numbers)
  RQ.words = function (spec) {
    const out = new Set(); if (!spec) return [];
    const add = t => { const o = spec.things[t]; out.add(t); (o.cols || []).forEach(c => out.add(c)); if (o.sizes) { out.add('grande'); out.add('pequeno'); } if (o.count) RQ.NUMS.slice(0, spec.carry ? 3 : 5).forEach(n => out.add(n)); };
    if (spec.places) for (const z in spec.places) RQ.words(Object.assign({}, spec, { places: null, things: spec.places[z] })).forEach(w => out.add(w));
    else Object.keys(spec.things || {}).forEach(add);
    return [...out].filter(WD);
  };

  // =====================================================================
  //  Making a request
  // =====================================================================
  const colHex = c => (WD(c) ? WD(c).col : c);
  RQ.colHex = colHex;
  const drawable = t => !!WD(t) && (!G.iconDrawn || G.iconDrawn(t));
  // the templates a board allows for a thing, with what each needs
  const TPL1 = ['num', 'col', 'size', 'howmany'], TPL2 = ['numcol', 'numsize', 'howmany2'];
  RQ.TPLS = TPL1.concat(TPL2);
  RQ.TWO_DETAILS = TPL2;
  // all the requests one template could make on this board: [{tpl, thing, col, size, num, answer}]
  function options(spec, tpl, o) {
    const out = [], th = spec.things || {}, carry = !!(o.carry || spec.carry), maxN = carry ? 3 : 5;
    const nums = RQ.NUMS.slice(0, maxN).filter(RQ.known), sizes = ['grande', 'pequeno'].filter(RQ.known);
    for (const t of Object.keys(th)) {
      const d = th[t], n = RQ.noun(t); if (!n || !RQ.known(t) || !drawable(t)) continue;
      const cols = (d.cols || []).filter(RQ.known), canCount = !!d.count && !n.plOnly;
      if (tpl === 'num' && canCount && !d.animal) nums.filter(k => k !== 'uno' || o.focus === 'uno' || o.one).forEach(num => out.push({ tpl, thing: t, num })); // ("una": now and then, RQ.ONE)
      if (tpl === 'col' && cols.length && d.cols.length >= 2) cols.forEach(col => out.push({ tpl, thing: t, col }));
      if (tpl === 'size' && d.sizes && !carry) sizes.forEach(size => out.push({ tpl, thing: t, size }));
      if (tpl === 'howmany' && canCount && !carry) nums.filter(k => RQ.numOf(k) <= 4).forEach(k => out.push({ tpl, thing: t, answerNum: k }));
      if (tpl === 'numcol' && canCount && !d.animal && cols.length && d.cols.length >= 2) cols.forEach(col => nums.filter(k => RQ.numOf(k) >= 2).forEach(num => out.push({ tpl, thing: t, col, num })));
      if (tpl === 'numsize' && canCount && !d.animal && d.sizes && !carry) sizes.forEach(size => nums.filter(k => RQ.numOf(k) >= 2 && RQ.numOf(k) <= 4).forEach(num => out.push({ tpl, thing: t, size, num })));
      if (tpl === 'howmany2' && canCount && !carry) {
        nums.filter(k => RQ.numOf(k) <= 3).forEach(k => {
          if (cols.length && d.cols.length >= 2) cols.forEach(col => out.push({ tpl, thing: t, col, answerNum: k }));
          if (d.sizes) sizes.forEach(size => out.push({ tpl, thing: t, size, answerNum: k }));
        });
      }
    }
    // a "¿cuántas?" needs answer cards: two other numbers she has met
    return out.filter(r => !r.answerNum || RQ.NUMS.filter(k => k !== r.answerNum && G.words && G.words.met && G.words.met(k)).length >= 2);
  }
  const usesWord = (r, id) => r.thing === id || r.col === id || r.size === id || r.num === id || r.answerNum === id;
  const CARRY_TPL = ['num', 'col', 'numcol'];
  const tplsFor = (level, carry) => (level >= 2 ? TPL1.concat(TPL2) : TPL1).filter(t => !carry || CARRY_TPL.includes(t));
  RQ.feasible = (spec, id, level) => !!spec && tplsFor(level || RQ.level(), !!spec.carry).some(tpl => options(spec, tpl, {}).some(r => !id || usesWord(r, id)));
  // the ramp (src/history.js keeps it in G.state.hist.ld)
  const ld = () => (G.hist && G.hist.listenState ? G.hist.listenState() : null);
  RQ.level = () => { const L = ld(); return L && L.lvl === 2 ? 2 : 1; };
  RQ.result = function (req, first) {
    const L = ld(); if (!L || !req) return;
    const two = TPL2.includes(req.tpl);
    if ((L.lvl | 0) !== 2) { if (first) L.ok1 = (L.ok1 | 0) + 1; if ((L.ok1 | 0) >= RQ.UP) { L.lvl = 2; L.miss2 = 0; } }
    else if (two) {
      if (first) L.miss2 = 0;
      else if ((L.miss2 = (L.miss2 | 0) + 1) >= RQ.DOWN) { L.lvl = 1; L.ok1 = RQ.UP - 2; L.miss2 = 0; } // (two more rights bring them back)
    }
    if (G.st && G.st.autosave) G.st.autosave();
  };

  // a request on this board, or null when nothing she knows fits
  RQ.make = function (spec, o = {}) {
    if (!spec || !spec.things) return null;
    const level = o.level || RQ.level(), carry = !!(o.carry || spec.carry);
    const tpls = o.tpl ? [o.tpl] : tplsFor(level, carry);
    let all = [];
    const one = rnd() < RQ.ONE; // ("Dame una concha": counting one now and then, for un / una)
    for (const t of tpls) all = all.concat(options(spec, t, { carry, focus: o.focus, one }));
    if (!all.length) return null;
    // the word that's due comes first, then (level 2) mostly a two-detail one, else one detail; one at random
    let pool = o.focus ? all.filter(r => usesWord(r, o.focus)) : [];
    if (!pool.length) pool = all;
    if (!o.tpl) {
      const two = pool.filter(r => TPL2.includes(r.tpl)), one = pool.filter(r => !TPL2.includes(r.tpl));
      pool = level >= 2 && two.length && (rnd() < RQ.TWO || !one.length) ? two : one.length ? one : two;
    }
    // a template first (each one as likely), then one of its requests
    const byT = {}; pool.forEach(r => { (byT[r.tpl] = byT[r.tpl] || []).push(r); });
    const r = Object.assign({}, pick(byT[pick(Object.keys(byT))]));
    return build(spec, r, Object.assign({}, o, { carry, level }));
  };

  // the tray (or the things to scatter), the sentence, what's tested
  function build(spec, r, o) {
    const th = spec.things, d = th[r.thing], n = RQ.noun(r.thing);
    r.level = o.level; r.carry = !!o.carry; r.who = spec.who || null;
    r.kind = /^howmany/.test(r.tpl) ? 'howmany' : /^num/.test(r.tpl) ? 'count' : 'pick';
    r.n = r.num ? RQ.numOf(r.num) : r.kind === 'pick' ? 1 : null;
    const cols = (d.cols || []).slice(), others = Object.keys(th).filter(t => t !== r.thing && drawable(t) && RQ.noun(t) && !(r.kind === 'count' && th[t].animal));
    const otherCol = c => shuffle(cols.filter(x => x !== c));
    const sizeO = s => (s === 'grande' ? 'pequeno' : 'grande');
    const otherThing = need => shuffle(others.filter(t => need(th[t])));
    const cells = [], add = c => { cells.push(Object.assign({ thing: r.thing, col: null, size: null, n: 1 }, c)); return c; };
    const metFirst = L => L.sort((a, b) => (G.words && G.words.met ? (G.words.met(b) ? 1 : 0) - (G.words.met(a) ? 1 : 0) : 0));
    if (r.kind === 'pick') {
      // the right one, a picture that differs only in the detail, one that differs only in the thing, then others
      add({ col: r.col || null, size: r.size || null, right: true });
      if (r.col) { otherCol(r.col).slice(0, 2).forEach(c => add({ col: c })); const t2 = metFirst(otherThing(x => (x.cols || []).includes(r.col)))[0]; if (t2) add({ thing: t2, col: r.col }); }
      if (r.size) { add({ size: sizeO(r.size) }); const t2 = metFirst(otherThing(x => x.sizes))[0]; if (t2) { add({ thing: t2, size: r.size }); add({ thing: t2, size: sizeO(r.size) }); } }
      for (const t of metFirst(others.slice())) { if (cells.length >= 4) break; if (!cells.some(c => c.thing === t)) add({ thing: t, col: r.col ? ((th[t].cols || [])[0] || null) : null, size: r.size ? pick(['grande', 'pequeno']) : null }); }
    } else if (r.kind === 'count' && o.carry && !r.col) {
      // a world request for a number of things, any colour: little piles of them in different colours, enough to count
      const cs = cols.length ? shuffle(cols.slice()) : [null];
      let left = r.n + 1 + Math.floor(rnd() * 2);
      for (let i = 0; left > 0 && i < 4; i++) { const k = Math.min(left, 1 + Math.floor(rnd() * 2)); add({ col: cs[i % cs.length], n: k, right: true }); left -= k; }
    } else if (r.kind === 'count') {
      // the right pile has more than asked (the number is what she counts), a pile of the thing in another colour /
      // size, a pile of another thing like it, then others
      const extra = o.carry ? 1 : 1 + Math.floor(rnd() * 2);
      add({ col: r.col || null, size: r.size || null, n: r.n + extra, right: true });
      if (r.col) { const c2 = otherCol(r.col)[0]; if (c2) add({ col: c2, n: Math.max(r.n, 2) + Math.floor(rnd() * 2) }); const t2 = metFirst(otherThing(x => x.count && (x.cols || []).includes(r.col)))[0]; if (t2 && !o.carry) add({ thing: t2, col: r.col, n: 2 + Math.floor(rnd() * 3) }); }
      if (r.size) { add({ size: sizeO(r.size), n: Math.max(r.n, 2) + Math.floor(rnd() * 2) }); }
      if (!o.carry) for (const t of metFirst(otherThing(x => !x.animal))) { if (cells.length >= (r.col || r.size ? 4 : 3)) break; add({ thing: t, col: r.col && (th[t].cols || []).length ? th[t].cols[0] : null, size: r.size ? r.size : null, n: 2 + Math.floor(rnd() * 3) }); }
      else if (r.col) { const c3 = otherCol(r.col)[1]; if (c3) add({ col: c3, n: 1 + Math.floor(rnd() * 2) }); }
    } else { // howmany: single pictures to count (the answer's number of them), with ones that differ in a detail
      const k = RQ.numOf(r.answerNum), detail = { col: r.col || null, size: r.size || null };
      for (let i = 0; i < k; i++) add(Object.assign({ right: true }, detail));
      const near = [];
      if (r.col) { const c2 = otherCol(r.col); near.push({ col: c2[0] }); if (c2[1]) near.push({ col: c2[1] }); }
      if (r.size) near.push({ size: sizeO(r.size) }, { size: sizeO(r.size) });
      const t2 = metFirst(otherThing(x => (!r.col || (x.cols || []).includes(r.col)) && (!r.size || x.sizes)))[0];
      if (t2) near.push(Object.assign({ thing: t2 }, detail));
      for (const c of near) { if (cells.length >= 6) break; add(c); }
      for (const t of metFirst(otherThing(() => true))) { if (cells.length >= Math.max(4, k + 2)) break; add({ thing: t, col: r.col && (th[t].cols || []).length ? th[t].cols[0] : null, size: r.size || null }); }
      r.answer = k;
      const met = RQ.NUMS.filter(x => x !== r.answerNum && G.words && G.words.met && G.words.met(x) && RQ.numOf(x) <= 6);
      const near2 = met.filter(x => Math.abs(RQ.numOf(x) - k) <= 2), cards = shuffle(near2.length >= 2 ? near2 : met).slice(0, 2).concat([r.answerNum]);
      r.cards = shuffle(cards);
    }
    // what's tested: some picture differs from the right one only in that detail
    const same = (a, b, but) => ['thing', 'col', 'size'].every(k => k === but || (a[k] || null) === (b[k] || null));
    const right = cells.find(c => c.right), wrong = cells.filter(c => !c.right && !(r.kind === 'howmany' && same(c, right, '_')));
    r.tested = {
      thing: wrong.some(c => c.thing !== r.thing && same(c, right, 'thing')),
      col: !!r.col && wrong.some(c => c.col !== r.col && same(c, right, 'col')),
      size: !!r.size && wrong.some(c => c.size !== r.size && same(c, right, 'size')),
      num: !!r.num, // (the right pile always has more than asked; a "¿cuántas?" is her answer: src/listen.js)
    };
    if (r.kind !== 'howmany') { shuffle(cells); r.answer = cells.findIndex(c => c.right); }
    else shuffle(cells);
    r.tray = cells;
    r.verb = o.verb || (r.kind === 'howmany' ? 'howmany' : o.carry ? 'bring' : d.animal ? (rnd() < 0.5 ? 'touch' : 'where') : 'give');
    r.polite = r.verb !== 'where' && r.verb !== 'howmany' && r.verb !== 'touch' && RQ.known('porfavor') && rnd() < 0.5;
    r.words = [r.num, r.thing, r.size, r.col].filter(Boolean);
    const s = RQ.sentence(r); if (!s) return null;
    Object.assign(r, s);
    const shown = RQ.np(r.kind === 'howmany' ? { thing: r.thing, col: r.col, size: r.size, num: r.answerNum } : r); // ("¡Tres conchas azules!": the right one, said when it's shown)
    r.np = '¡' + cap(shown.plain) + '!';
    r.npText = '¡' + shown.text.replace(/^(\[[a-z0-9]+:)?(\S)/, (m, a, b) => (a || '') + b.toUpperCase()) + '!';
    r.dims = { thing: r.thing, col: r.col || null, size: r.size || null, num: r.num || null };
    r.words.forEach(w => { if (!RQ.known(w)) throw new Error('requests: ' + w + ' is not known'); });
    return r;
  }

  // =====================================================================
  //  Checking an answer
  // =====================================================================
  // answer: a tray cell (pick), a list of things [{thing, col, size}] (count, carry), or a number word (howmany)
  RQ.check = function (req, a) {
    const dims = {};
    if (req.kind === 'howmany') {
      const ok = !!a && RQ.numOf(a) === req.answer;
      ['thing', 'col', 'size', 'num'].forEach(k => { if (req.dims[k] || k === 'num') dims[k] = ok; });
      return { ok, dims };
    }
    const L = Array.isArray(a) ? a : a ? [a] : [], all = (k, v) => L.length > 0 && L.every(x => (x[k] || null) === (v || null));
    dims.thing = all('thing', req.thing);
    if (req.col) dims.col = all('col', req.col);
    if (req.size) dims.size = all('size', req.size);
    if (req.num) dims.num = L.length === req.n;
    else if (req.kind === 'count') dims.num = L.length >= 1;
    return { ok: Object.keys(dims).every(k => dims[k]), dims };
  };
  // the words a request credits (tested) and the ones it only lets her hear: {tested: [ids], heard: [ids]}
  RQ.split = function (req) {
    const tested = [], heard = [];
    for (const k of ['num', 'thing', 'size', 'col']) { const w = req.dims[k]; if (!w) continue; (req.tested[k] ? tested : heard).push(w); }
    return { tested, heard };
  };
})();
