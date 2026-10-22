// Learning plan 2, Phase 3 (docs/LEARNING_PLAN_2.md): listen and do (src/requests.js, src/listen.js).
//   node    the request maker in plain Node: the grammar as a must-pass list (plurals: concha -> conchas, flor ->
//           flores, pez -> peces, lápiz -> lápices, ratón -> ratones, joven -> jóvenes...; articles by gender: el / la /
//           un / una, el águila; colour, size and number agreement: rojas, azules, verdes, pequeñas, una concha, un
//           plátano), only known words, what a tray tests (each tested word really needed), world requests (at most
//           three), the ramp (one detail, then two)
//   scene   the listen-and-do scene on an iPad page (a fake recognizer): the request spoken and written with no picture
//           for its words, the speaker to hear it again, the ghost hands; right (the friend reacts, one 'listen' credit
//           per tested word, cards grow, the counts); wrong (it wobbles, the right one glows and is said; one more try;
//           the half she got right is only heard: a wrong pick credits no word);
//           counting into the basket (one credit for the word however many are counted); a wrong count counted out
//           loud; "¿Cuántas?" said with the mic, and a wrong number; the ramp to two details; the Learning page
//   world   favours in two places (Doña Lupe in the forest, Don Pepe in Villa Sol: an ear in their bubble, two
//           requests, a star and a heart), the day's favours (at most two of these, none when it's off), the dog's
//           warm-up request, a carry request (Lola's shells on the beach: they appear, she picks the wrong ones first,
//           is shown the right ones, then brings them)
//   NODE_PATH=$(npm root -g) node tools/test-listen.js [screenshot dir]     (ONLY=node|scene|world)
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { run, open, check, ROOT } = require('./harness');

// =====================================================================
//  The request maker in Node
// =====================================================================
const PLURALS = [
  ['concha', 'conchas'], ['flor', 'flores'], ['pez', 'peces'], ['lápiz', 'lápices'], ['nariz', 'narices'], ['ratón', 'ratones'],
  ['calcetín', 'calcetines'], ['delfín', 'delfines'], ['joven', 'jóvenes'], ['examen', 'exámenes'], ['imagen', 'imágenes'],
  ['árbol', 'árboles'], ['colibrí', 'colibríes'], ['bebé', 'bebés'], ['lunes', 'lunes'], ['mes', 'meses'], ['autobús', 'autobuses'],
  ['rey', 'reyes'], ['pan', 'panes'], ['papel', 'papeles'], ['estrella de mar', 'estrellas de mar'], ['muñeco de nieve', 'muñecos de nieve'],
  ['pájaro carpintero', 'pájaros carpinteros'], ['manzana', 'manzanas'], ['oso', 'osos'],
];
// [request parts, the sentence it must make]
const SENTENCES = [
  [{ verb: 'give', thing: 'concha', num: 'tres' }, 'Dame tres conchas.'],
  [{ verb: 'give', thing: 'manzana', col: 'rojo' }, 'Dame la manzana roja.'],
  [{ verb: 'bring', thing: 'manzana', col: 'rojo' }, 'Tráeme la manzana roja.'],
  [{ verb: 'give', thing: 'concha', col: 'azul' }, 'Dame la concha azul.'],
  [{ verb: 'touch', thing: 'perro', size: 'grande' }, 'Toca al perro grande.'],
  [{ verb: 'where', thing: 'oso', size: 'pequeno' }, '¿Dónde está el oso pequeño?'],
  [{ verb: 'give', thing: 'flor', num: 'dos', col: 'amarillo' }, 'Dame dos flores amarillas.'],
  [{ verb: 'bring', thing: 'concha', num: 'tres', col: 'rosa' }, 'Tráeme tres conchas rosa.'],
  [{ verb: 'give', thing: 'concha', num: 'uno' }, 'Dame una concha.'],
  [{ verb: 'give', thing: 'platano', num: 'uno' }, 'Dame un plátano.'],
  [{ verb: 'give', thing: 'pez', num: 'cuatro', col: 'azul' }, 'Dame cuatro peces azules.'],
  [{ verb: 'give', thing: 'flor', num: 'dos', col: 'verde' }, 'Dame dos flores verdes.'],
  [{ verb: 'give', thing: 'flor', col: 'blanco' }, 'Dame la flor blanca.'],
  [{ verb: 'give', thing: 'manzana', num: 'cinco', col: 'verde' }, 'Dame cinco manzanas verdes.'],
  [{ verb: 'give', thing: 'hoja', num: 'dos', col: 'rojo' }, 'Dame dos hojas rojas.'],
  [{ verb: 'give', thing: 'gorro', col: 'amarillo' }, 'Dame el gorro amarillo.'],
  [{ verb: 'give', thing: 'bufanda', col: 'rosa' }, 'Dame la bufanda rosa.'],
  [{ verb: 'give', thing: 'guantes', col: 'rojo' }, 'Dame los guantes rojos.'],
  [{ verb: 'give', thing: 'calcetines', col: 'blanco' }, 'Dame los calcetines blancos.'],
  [{ verb: 'give', thing: 'zapatos', col: 'azul' }, 'Dame los zapatos azules.'],
  [{ verb: 'touch', thing: 'vaca', size: 'pequeno' }, 'Toca a la vaca pequeña.'],
  [{ verb: 'where', thing: 'gallina', size: 'grande' }, '¿Dónde está la gallina grande?'],
  [{ verb: 'touch', thing: 'aguila', size: 'pequeno' }, 'Toca al águila pequeña.'],
  [{ verb: 'touch', thing: 'abuelo' }, 'Toca al abuelo.'],
  [{ verb: 'give', thing: 'aguila', num: 'uno' }, 'Dame un águila.'],
  [{ verb: 'give', thing: 'aguila', num: 'dos', col: 'blanco' }, 'Dame dos águilas blancas.'],
  [{ verb: 'howmany', thing: 'concha', col: 'azul' }, '¿Cuántas conchas azules hay?'],
  [{ verb: 'howmany', thing: 'oso', size: 'pequeno' }, '¿Cuántos osos pequeños hay?'],
  [{ verb: 'howmany', thing: 'pez' }, '¿Cuántos peces hay?'],
  [{ verb: 'howmany', thing: 'vaca', size: 'grande' }, '¿Cuántas vacas grandes hay?'],
  [{ verb: 'give', thing: 'hongo', num: 'tres', size: 'pequeno' }, 'Dame tres hongos pequeños.'],
  [{ verb: 'give', thing: 'raton', num: 'dos' }, 'Dame dos ratones.'],
  [{ verb: 'give', thing: 'lombriz', num: 'tres' }, 'Dame tres lombrices.'],
  [{ verb: 'give', thing: 'colibri', num: 'dos' }, 'Dame dos colibríes.'],
  [{ verb: 'give', thing: 'arbol', num: 'dos' }, 'Dame dos árboles.'],
  [{ verb: 'touch', thing: 'muneco', size: 'grande' }, 'Toca el muñeco de nieve grande.'],
  [{ verb: 'where', thing: 'elsol', size: 'pequeno' }, '¿Dónde está el sol pequeño?'],
  [{ verb: 'touch', thing: 'nube', size: 'grande' }, 'Toca la nube grande.'],
  [{ verb: 'give', thing: 'estrellamar', num: 'dos', col: 'rojo' }, 'Dame dos estrellas de mar rojas.'],
  [{ verb: 'give', thing: 'concha', num: 'dos', polite: true }, 'Dame dos conchas, por favor.'],
  [{ verb: 'give', thing: 'pelota', col: 'verde' }, 'Dame la pelota verde.'],
  [{ verb: 'give', thing: 'hueso', num: 'cuatro' }, 'Dame cuatro huesos.'],
  [{ verb: 'howmany', thing: 'nube', size: 'grande' }, '¿Cuántas nubes grandes hay?'],
  [{ verb: 'give', thing: 'zanahoria', num: 'dos' }, 'Dame dos zanahorias.'],
  [{ verb: 'give', thing: 'zanahoria', num: 'uno' }, 'Dame una zanahoria.'],
  [{ verb: 'give', thing: 'elote', col: 'blanco' }, 'Dame el elote blanco.'],
  [{ verb: 'bring', thing: 'elote' }, 'Tráeme el elote.'],
  [{ verb: 'give', thing: 'jitomate', num: 'tres', col: 'rojo' }, 'Dame tres jitomates rojos.'],
  [{ verb: 'give', thing: 'elote', num: 'dos', col: 'amarillo' }, 'Dame dos elotes amarillos.'],
  [{ verb: 'howmany', thing: 'jitomate', col: 'verde' }, '¿Cuántos jitomates verdes hay?'],
  [{ verb: 'howmany', thing: 'zanahoria' }, '¿Cuántas zanahorias hay?'],
];
const ADJ = [['rojo', 'f', true, 'rojas'], ['rojo', 'm', false, 'rojo'], ['azul', 'f', true, 'azules'], ['azul', 'f', false, 'azul'], ['verde', 'm', true, 'verdes'], ['amarillo', 'f', false, 'amarilla'],
  ['blanco', 'm', true, 'blancos'], ['rosa', 'f', true, 'rosa'], ['pequeno', 'f', true, 'pequeñas'], ['pequeno', 'm', false, 'pequeño'], ['grande', 'f', true, 'grandes'], ['grande', 'm', false, 'grande']];
function nodeMaker(known) {
  const ctx = { console, Math }; ctx.window = ctx; ctx.G = { content: {} }; ctx.window.G = ctx.G; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'content', 'es', 'words.js'), 'utf8'), ctx, { filename: 'content/es/words.js' });
  ctx.G.data = ctx.G.content.es;
  const K = new Set(known || Object.keys(ctx.G.data.words));
  ctx.G.words = { stage: id => (K.has(id) ? 2 : 0), met: id => K.has(id) };
  const ld = { n: 0, ft: 0, lvl: 1, ok1: 0, miss2: 0 };
  ctx.G.hist = { listenState: () => ld };
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', 'requests.js'), 'utf8'), ctx, { filename: 'src/requests.js' });
  return { RQ: ctx.G.requests, ld, K, C: ctx.G.data };
}
async function node() {
  const { RQ, ld, C } = nodeMaker();
  check('node: requests.js and the content load with no browser; every board of RQ.SPECS uses words of the game', !!RQ.make && Object.keys(RQ.SPECS).every(w => RQ.words(RQ.spec(w)).every(id => C.words[id])));
  for (const [s, want] of PLURALS) check(`plural: ${s} -> ${want}`, RQ.plural(s) === want, RQ.plural(s));
  for (const [r, want] of SENTENCES) { const s = RQ.sentence(r); check(`sentence: ${JSON.stringify(r)} -> "${want}"`, s && s.say === want, s && s.say); }
  for (const [id, g, pl, want] of ADJ) check(`agreement: ${id} ${g}${pl ? ' plural' : ''} -> ${want}`, RQ.adj(id, g, pl) === want, RQ.adj(id, g, pl));
  check('agreement: uno before a noun: un / una', RQ.numWord('uno', 'm') === 'un' && RQ.numWord('uno', 'f') === 'una' && RQ.numWord('tres', 'f') === 'tres');
  check('agreement: articles by gender (el / la / los / las / un / una), el águila (a feminine noun with "el")', RQ.art(RQ.noun('concha'), false, true) === 'la' && RQ.art(RQ.noun('oso'), true, true) === 'los' && RQ.art(RQ.noun('flor'), true, true) === 'las' && RQ.art(RQ.noun('platano'), false, false) === 'un' && RQ.art(RQ.noun('aguila'), false, true) === 'el' && RQ.art(RQ.noun('aguila'), true, true) === 'las' && RQ.noun('aguila').g === 'f');
  check('agreement: a noun\'s own plural wins (content/es/words.js pl), plural-only words stay plural (los guantes)', RQ.noun('colibri').pl === 'colibríes' && RQ.noun('guantes').plOnly && RQ.noun('guantes').pl === 'guantes' && RQ.noun('muneco').pl === 'muñecos de nieve');
  const s3 = RQ.sentence({ verb: 'give', thing: 'concha', num: 'tres', col: 'rosa' });
  check('sentence: the rich text marks each word ([tres:tres] [concha:conchas] [rosa:rosa]) and reads as the plain sentence', s3.text === 'Dame [tres:tres] [concha:conchas] [rosa:rosa].' && s3.text.replace(/\[[a-z0-9]+:([^\]]+)\]/g, '$1') === s3.say, s3.text);
  check('sentence: the right one, as shown and said after a miss ("¡Tres conchas rosa!")', s3.np === '¡Tres conchas rosa!', s3.np);
  // every request on every board: only known words, the right answer right, each tested word needed
  let n = 0, bad = [], two = 0, one = 0;
  for (const who of Object.keys(RQ.SPECS)) for (let lvl = 1; lvl <= 2; lvl++) for (let i = 0; i < 40; i++) {
    const r = RQ.make(RQ.spec(who, who === 'lola' ? ['playa', 'bosque', 'abuelos'][i % 3] : null), { level: lvl }); if (!r) { bad.push(who + ': null'); continue; }
    n++; if (RQ.TWO_DETAILS.includes(r.tpl)) { two++; if (lvl === 1) bad.push(who + ' level 1: ' + r.say); } else one++;
    const right = r.kind === 'howmany' ? r.answerNum : r.kind === 'pick' ? r.tray[r.answer] : Array.from({ length: r.n }, () => r.tray[r.answer]);
    if (!RQ.check(r, right).ok) bad.push(who + ' right not ok: ' + r.say);
    if (r.kind === 'count' && !(r.carry && !r.col) && r.tray[r.answer].n <= r.n) bad.push(who + ' pile too small: ' + r.say);
    if (r.kind === 'pick') { const w = r.tray.findIndex(c => !c.right); if (w >= 0 && RQ.check(r, r.tray[w]).ok) bad.push(who + ' wrong ok: ' + r.say); }
    for (const k of ['thing', 'col', 'size']) if (r.tested[k]) { const rc = r.tray.find(c => c.right); if (!r.tray.some(c => !c.right && (c[k] || null) !== (rc[k] || null) && ['thing', 'col', 'size'].every(j => j === k || (c[j] || null) === (rc[j] || null)))) bad.push(who + ' ' + k + ' not needed: ' + r.say); }
    if (r.carry && (r.n > 3 || !['num', 'col', 'numcol'].includes(r.tpl))) bad.push(who + ' carry: ' + r.say);
    if (r.tray.length < 1 || r.tray.length > 6) bad.push(who + ' tray ' + r.tray.length);
  }
  check('make: a request on every board at both levels (' + n + '), the right answer right, a wrong picture wrong, each tested word needed, piles bigger than asked, world requests of at most three', !bad.length, bad.slice(0, 6).join(' | '));
  check('make: level 1 is one detail only; level 2 mixes two details in (' + two + ' of ' + (two + one) + ')', two > 20 && one > 40);
  // only known words
  const sub = nodeMaker(['concha', 'rojo', 'azul', 'dos', 'tres', 'uno', 'perro', 'gato', 'grande', 'manzana', 'verde']);
  let leak = [], made = 0;
  for (const who of Object.keys(sub.RQ.SPECS)) for (let i = 0; i < 30; i++) { const r = sub.RQ.make(sub.RQ.spec(who, 'playa'), { level: 1 + (i % 2) }); if (!r) continue; made++; r.words.concat(r.answerNum ? [r.answerNum] : []).forEach(w => { if (!sub.K.has(w)) leak.push(w); }); }
  check('make: only words she knows (stage 2+), in the request and the answer (' + made + ' made with eleven known words)', made > 30 && !leak.length, leak.join());
  const none = nodeMaker(['hola']);
  check('make: nothing she knows on a board: no request', Object.keys(none.RQ.SPECS).every(w => !none.RQ.make(none.RQ.spec(w))));
  check('make: the word that\'s due comes first (a request about it when one can be made)', [...Array(10)].every(() => { const r = RQ.make(RQ.spec('lupe'), { focus: 'bellota' }); return r.words.includes('bellota'); }) && [...Array(10)].every(() => { const r = RQ.make(RQ.spec('pepe'), { focus: 'verde' }); return r.words.includes('verde'); }));
  // what she can't hold is never handed over (Mateo's clouds, sun and snowmen: touched or found), and an animal touched
  // takes the personal a ("Toca al perro grande", "Toca a la vaca pequeña")
  const handed = [], noA = [], seen = new Set();
  for (const who of ['mateo', 'nico', 'elena', 'abuelo', 'dog']) for (let i = 0; i < 160; i++) {
    const r = RQ.make(RQ.spec(who), { level: 1 + (i % 2) }); if (!r) continue; seen.add(r.say);
    if (['nube', 'elsol', 'muneco'].includes(r.thing) && /^(Dame|Tráeme)/.test(r.say)) handed.push(r.say);
    if (r.verb === 'touch' && RQ.animate(r.thing) && !/^Toca (al|a la|a los|a las) /.test(r.say)) noA.push(r.say);
  }
  check('make: nothing she can\'t hold is handed over ("Toca la nube grande", "¿Dónde está el sol pequeño?", never "Dame el sol")', !handed.length && [...seen].some(t => /nube|sol |muñeco/.test(t)), handed.slice(0, 4).join(' | '));
  check('make: an animal touched takes the personal a ("Toca al perro grande")', !noA.length && [...seen].some(t => /^Toca (al|a la) /.test(t)), noA.slice(0, 4).join(' | '));
  // Abuelo's garden on his board: carrots to count, corn and tomatoes by colour
  const veg = { zanahoria: [], elote: [], jitomate: [] };
  for (const v of Object.keys(veg)) for (let i = 0; i < 12; i++) { const r = RQ.make(RQ.spec('abuelo'), { focus: v, level: 1 + (i % 2) }); if (r && r.words.includes(v)) veg[v].push(r.say); }
  check('abuelo: his garden is on his board (' + Object.values(veg).map(L => L[0]).join(' / ') + ')', Object.values(veg).every(L => L.length === 12) && veg.elote.some(t => /elotes? (amarillos?|blancos?)/.test(t)) && veg.jitomate.some(t => /jitomates? (rojos?|verdes?)/.test(t)), JSON.stringify(veg).slice(0, 300));
  // the ramp
  check('ramp: one detail to begin with (level 1)', RQ.level() === 1);
  const one1 = RQ.make(RQ.spec('pepe'), {});
  for (let i = 0; i < RQ.UP - 1; i++) RQ.result(one1, true);
  check('ramp: still one detail after ' + (RQ.UP - 1) + ' right first try', RQ.level() === 1);
  RQ.result(one1, false); RQ.result(one1, true);
  check('ramp: two details once she gets ' + RQ.UP + ' right first try', RQ.level() === 2);
  const tw = RQ.make(RQ.spec('lucia'), { tpl: 'numcol' });
  RQ.result(tw, false);
  check('ramp: one two-detail miss: still two details', RQ.level() === 2);
  RQ.result(tw, false);
  check('ramp: two two-detail misses in a row: back to one detail, two more rights bring two details back', RQ.level() === 1 && ld.ok1 === RQ.UP - 2);
  RQ.result(one1, true); RQ.result(one1, true);
  check('ramp: ...and they do', RQ.level() === 2);
}

// ---------- a fake recognizer: each start() takes the next reply from window.__sr.queue ----------
function FAKE() {
  const sr = window.__sr = { queue: [], starts: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.starts.push({ during: window.event ? window.event.type : 'frame' });
      setTimeout(() => { this.onstart && this.onstart({}); this.onaudiostart && this.onaudiostart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(([transcript, confidence]) => ({ transcript, confidence })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 250);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 50); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openWith(browser, name, touch, o = {}) {
  const { ctx, g } = await open(browser, name, touch, Object.assign({ listen: true }, o));
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// the words she knows in these tests (stage 2, met on an earlier day, not due unless o.due)
const WORDS = ['hola', 'gracias', 'si', 'no', 'perro', 'gato', 'conejo', 'pato', 'rana', 'pez', 'manzana', 'platano', 'naranja', 'flor', 'concha', 'mora', 'bellota', 'hongo', 'hoja',
  'oso', 'ardilla', 'venado', 'zorro', 'rojo', 'blanco', 'azul', 'rosa', 'amarillo', 'verde', 'grande', 'pequeno', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'hueso', 'pelota', 'mar', 'ola', 'elbosque', 'cueva'];
// a game on the map: words known (yesterday), chapters done, places visited, demos seen (unless o.demos)
const game = (g, o = {}) => g.ev(o => {
  G.debug.dayShift = -1;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina'); G.state.dogName = 'Bruno';
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, opener: true, book: true });
  for (const id of o.done || ['c1', 'c2', 'c3']) G.state.quests[id] = 'done';
  const W = G.words, grow = G.cards.grow; G.cards.grow = () => 0;
  W.newSession('new');
  for (const id of o.words) { if (G.animals && G.animals.KINDS[id]) G.state.album[id] = { first: 1, map: 'villa', n: 1 }; W.meet(id, 'test'); } // (in the album first: no "¡Nuevo animal!")
  G.debug.dayShift = 0; W.newSession('load');
  for (const id of o.words) Object.assign(W.rec(id), { st: 2, box: 2, fu: 0, due: null, dd: W.day() + 3, dc: W.dayNum() + 3, ld: W.dayNum() - 1 }); // (known, not due)
  for (const id of o.due || []) Object.assign(W.rec(id), { dd: W.day(), dc: W.dayNum() });
  G.cards.grow = grow;
  if (!o.demos) G.demo.skip();
  for (const z of o.visit || []) G.zones.visit(z);
  window.__said = []; const sp = G.speak; G.speak = t => { window.__said.push(G.plain(G.fill(t))); sp(t); };
  G.goto(o.map || 'villa', o.x || 22, o.y || 13, o.dir || 'down');
}, o);
const still = async (g, label) => { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); };
// a request as a story moment: window.__r gets its result; o: {who, tpl, focus, level, spec (a board's who), carry}
const request = (g, o) => g.ev(o => {
  window.__r = undefined;
  let req = null; // (o.need: the details its tray must test, e.g. ['col', 'thing'])
  for (let i = 0; i < 60 && (!req || (o.need || []).some(k => !req.tested[k])); i++) req = G.requests.make(G.requests.spec(o.spec || o.who), { tpl: o.tpl, focus: o.focus, level: o.level || 1 });
  window.__req = req;
  G.chapters.scene(G.field, (function* () { window.__r = yield* G.listen.run(req, { who: o.who }); if (window.__r === undefined) window.__r = null; })());
  return req && { say: req.say, text: req.text, np: req.np, kind: req.kind, tpl: req.tpl, words: req.words, tested: req.tested, answer: req.answer, n: req.n, tray: req.tray, cards: req.cards, answerNum: req.answerNum };
}, o);
const up = g => g.until(() => { const s = G.top(); return s && s.constructor.name === 'ListenDo' && s.t > 14 && s.phase === 'ask' && G.input.ready(); }, null, 'the request');
const hev = (g, id) => g.ev(id => { const e = G.hist.day().w[id]; return e ? e[1] : ''; }, id); // (today's events of a word)
const sc = (g, fn, a) => g.ev(new Function('a', 'const s = G.top(); return (' + fn + ')(s, a);'), a);
async function tapCell(g, i) { await g.tapRect(await g.ev(i => G.top().cellRect(i), i)); }
// free on the map again (what's in the way, if it isn't)
async function idle(g, map = 'villa') {
  try { await g.fieldIdle(map); } catch (e) { throw new Error(e.message + ' ' + JSON.stringify(await g.ev(() => ({ locked: G.field.locked, fade: G.fade.a, moving: G.field.player.moving, route: !!G.field.route, map: G.field.mapId, scenes: G.scenes.map(s => s.constructor.name) })))); }
}

// =====================================================================
//  The scene
// =====================================================================
async function scene(browser) {
  const { ctx, g } = await openWith(browser, 'ld-scene', true);
  try {
    await game(g, { words: WORDS, demos: true });
    await g.fieldIdle('villa');
    check('scene: listen and do is on (the harness asked), off by itself in other tests', await g.ev(() => G.listen.on() && !window.__listenOff));

    // ---- a request with a picture to tap: the ghost hand, no pictures in the request, the speaker ----
    const r1 = await request(g, { who: 'pepe', tpl: 'col' });
    await g.until(() => G.top().constructor.name === 'ListenDo', null, 'the scene');
    check('scene: "' + r1.say + '": spoken as it comes up', await g.ev(s => window.__said.includes(s), r1.say), JSON.stringify(await g.ev(() => window.__said)));
    const looks = await g.ev(() => G.top().lines.reduce((a, L) => a.concat(L.items.filter(it => it.id).map(it => it.id + ':' + it.look)), []));
    check('scene: the request\'s words are written without their pictures (plain coloured text: ' + looks.join(' ') + ')', looks.length === r1.words.length && looks.every(l => /:(text|goldtext)$/.test(l)) && r1.words.every(w => looks.some(l => l.startsWith(w + ':'))), looks.join());
    check('scene: every word of the request is known (stage 2+)', await g.ev(w => w.every(id => G.words.stage(id) >= 2), r1.words));
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'listen' && G.demo.cur.i >= 2, null, 'the ghost hand');
    await still(g, 'demo_listen');
    check('scene: the first time, a ghost hand taps the speaker, then glides over the pictures and taps one (never the right one)', await g.ev(a => { const c = G.demo.cur, last = c.steps[c.steps.length - 1], s = G.top(), r = s.cellRect(a), sp = s.spk(); return Math.abs(c.steps[0].x - (sp[0] + 10)) < 2 && !(last.x >= r.x && last.x <= r.x + r.w); }, r1.answer));
    await g.until(() => !G.demo.cur, null, 'the hand to finish');
    await still(g, 'ask_col');
    const n0 = await g.ev(() => window.__said.length);
    await g.tapBtn(await g.ev(() => G.top().spk()));
    check('scene: the speaker says the request again (as often as she likes)', await g.ev(([n, s]) => window.__said.length === n + 1 && window.__said[n] === s, [n0, r1.say]));
    await g.ev(() => { G.cards.log.length = 0; });
    const st0 = await g.ev(w => w.map(id => G.words.rec(id).right), r1.words);
    await tapCell(g, r1.answer);
    await g.frames(12); await still(g, 'right_col');
    check('scene: the right one: it flies to the friend, who lights up ("¡Gracias!")', await g.ev(() => G.top().phase === 'right' && G.top().joy > 0.5));
    await g.until(() => window.__r !== undefined, null, 'the request to end');
    check('scene: ...the result: right, on the first try', await g.ev(() => window.__r.ok && window.__r.first));
    const tested1 = r1.words.filter(w => (r1.tested.thing && w === r1.tray[r1.answer].thing) || (r1.tested.col && w === r1.tray[r1.answer].col));
    const ev1 = await g.ev(w => w.map(id => id + ':' + ((G.hist.day().w[id] || [0, ''])[1])), r1.words);
    check('scene: ...each tested word: one listen retrieval (L) in the history; a word the tray didn\'t test is only heard (' + ev1.join(' ') + ')', r1.words.every(w => (tested1.includes(w) ? ev1.includes(w + ':L') : ev1.includes(w + ':'))), ev1.join(' '));
    check('scene: ...in the model too (right first try) and the cards grow (listen)', await g.ev(([w, st0, t]) => w.every((id, k) => G.words.rec(id).right === st0[k] + (t.includes(id) ? 1 : 0)) && t.every(id => G.cards.log.filter(l => l.id === id && l.how === 'listen').length === 1), [r1.words, st0, tested1]));
    check('scene: ...the counts: 1 request, right first try', await g.ev(() => { const l = G.hist.listen(); return l.n === 1 && l.ft === 1 && l.today.n === 1; }));
    await idle(g);

    // ---- a wrong pick: it wobbles; the right one glows and is said; one more try ----
    const r2 = await request(g, { who: 'pepe', tpl: 'col', need: ['col', 'thing'] });
    await up(g);
    const before2 = await g.ev(w => w.map(id => (G.hist.day().w[id] || [0, ''])[1]), r2.words); // (today's events so far: the new ones are this request's)
    const added = async () => (await g.ev(w => w.map(id => (G.hist.day().w[id] || [0, ''])[1]), r2.words)).map((e, i) => e.slice(before2[i].length));
    const wrongK = r2.tray.findIndex(c => !c.right && c.thing === r2.tray[r2.answer].thing && c.col !== r2.tray[r2.answer].col);
    await tapCell(g, wrongK);
    await g.frames(4);
    check('scene: a wrong one ("' + r2.tray[wrongK].col + '" for "' + r2.say + '"): it wobbles and greys out; the right one glows', await g.ev(([k, a]) => { const s = G.top(); return s.phase === 'shown' && s.off[k] && s.glow[a] && !s.result.ok; }, [wrongK, r2.answer]));
    await g.until(np => window.__said.includes(np), r2.np, 'the right one said');
    await g.frames(20); await still(g, 'wrong_shown');
    const col2 = r2.tray[r2.answer].col, thing2 = r2.tray[r2.answer].thing, add2 = await added(), ci = r2.words.indexOf(col2), ti = r2.words.indexOf(thing2);
    check('scene: ...and said ("' + r2.np + '"); the colour word a miss (m), the thing she happened to get right only heard: no credit for a wrong pick (AUDIT M2)', add2[ci] === 'm' && add2[ti] === '', add2.join(' '));
    check('scene: ...a "go on" arrow (never blocked)', await g.ev(() => G.top().pt > 20));
    await tapCell(g, r2.answer);
    await g.until(() => window.__r !== undefined, null, 'the right one given');
    check('scene: one more try: she gives the right one; it ends (not right first try, nothing more counted)', await g.ev(() => window.__r.ok === false && window.__r.first === false) && (await added()).join() === add2.join(), (await added()).join());
    await idle(g);

    // ---- counting into the basket: one credit for the word however many ----
    const r3 = await request(g, { who: 'lupe', tpl: 'num', focus: 'tres' });
    await up(g);
    const before3 = await g.ev(w => w.map(id => (G.hist.day().w[id] || [0, ''])[1]), r3.words);
    await g.until(() => G.demo.cur && G.demo.cur.kind === 'listencount' && G.demo.cur.i >= 1, null, 'the counting hand');
    await still(g, 'demo_count');
    check('scene: the first count: the ghost hand taps a pile, then the basket', await g.ev(() => { const c = G.demo.cur, b = G.top().basketRect(); return c.steps.length === 2 && c.steps[1].y > b.y; }));
    await g.until(() => !G.demo.cur, null, 'the hand to finish');
    for (let i = 0; i < r3.n; i++) { await tapCell(g, r3.answer); await g.frames(4); }
    await g.frames(16); await still(g, 'count_basket');
    check('scene: "' + r3.say + '": each tap puts one in the basket (an arrow up to the friend)', await g.ev(n => G.top().basket.length === n && G.top().cells[G.top().req.answer].left === G.top().req.tray[G.top().req.answer].n - n, r3.n));
    await g.tapRect(await g.ev(() => G.top().basketRect()));
    await g.until(() => window.__r !== undefined, null, 'the basket given');
    const add3 = (await g.ev(w => w.map(id => (G.hist.day().w[id] || [0, ''])[1]), r3.words)).map((e, i) => e.slice(before3[i].length));
    check('scene: giving the basket: right first try; the number and the thing one listen each, however many were counted (' + add3.join(', ') + ')', await g.ev(() => window.__r.ok && window.__r.first) && add3.join() === 'L,L' && r3.words[0] === 'tres', add3.join());
    await g.fieldIdle('villa');

    // ---- a wrong count: shown out loud, then given ----
    const r4 = await request(g, { who: 'lupe', tpl: 'num', focus: 'dos' });
    await up(g);
    for (let i = 0; i < r4.n + 1; i++) { await tapCell(g, r4.answer); await g.frames(4); }
    await g.tapRect(await g.ev(() => G.top().basketRect()));
    check('scene: one too many ("' + r4.say + '"): gently, they go back to the pile', await g.ev(() => G.top().phase === 'shown' && !!G.top().counting));
    await g.until(() => !G.top().counting, null, 'the count shown', 20000);
    await g.frames(4); await still(g, 'count_shown');
    const counted = await g.ev(() => window.__said.slice(-4));
    check('scene: ...then counted into the basket out loud ("Una, Dos... ' + r4.np + '"), the right number in it', counted.includes('Dos') && counted.includes(r4.np) && await g.ev(n => G.top().basket.length === n, r4.n), counted.join(' | '));
    check('scene: ...the number a miss (m)', /m$/.test(await hev(g, 'dos')), await hev(g, 'dos'));
    await g.tapRect(await g.ev(() => G.top().basketRect()));
    await g.until(() => window.__r !== undefined, null, 'given after the count');
    check('scene: ...she gives it: it ends kindly (one more try)', await g.ev(() => window.__r.ok === false && window.__r.first === false));
    await g.fieldIdle('villa');

    // ---- "¿Cuántas?": said with the mic ----
    const r5 = await request(g, { who: 'pepe', tpl: 'howmany', level: 1 });
    await up(g);
    await g.frames(10); await still(g, 'howmany');
    const said5 = await g.ev(n => G.data.words[n].es, r5.answerNum);
    // another number heard first: "¡Otra vez!", never a wrong answer (only a tap can be wrong: S2 review #7)
    const other5 = await g.ev(([cards, n]) => (window.__o5 = G.data.words[cards.find(id => id !== n)].es), [r5.cards, r5.answerNum]);
    await g.ev(n => { window.__h5 = (G.hist.day().w[n] || [])[1] || ''; window.__sr.queue.push({ results: [[window.__o5, 0.9]] }); }, r5.answerNum);
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.top().mic && G.top().mic.sad > 0 && !G.top().mic.listening(), null, '"¡Otra vez!" for another number', 8000);
    check('scene: another number said ("' + other5 + '"): "¡Otra vez!", no wrong answer (still the first try, no card off, nothing in the history)', await g.ev(n => window.__r === undefined && G.top().first == null && !Object.values(G.top().cardOff).some(Boolean) && ((G.hist.day().w[n] || [])[1] || '') === window.__h5, r5.answerNum), await g.ev(n => JSON.stringify({ r: window.__r, first: G.top().first, off: G.top().cardOff, h: G.hist.day().w[n], h0: window.__h5 }), r5.answerNum));
    await g.until(() => !G.top().mic.listening() && G.top().mic.sad === 0, null, 'the mic ready again', 8000);
    await g.ev(t => window.__sr.queue.push({ results: [[t, 0.9]] }), said5);
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.drive(() => window.__r !== undefined, 'the spoken number'); // (a number that turns gold: its "¡Palabra de oro!" card first)
    check('scene: "' + r5.say + '" — "' + said5 + '" said with the mic: right; the number said (S), the thing a listen (L)', await g.ev(() => window.__r.ok && window.__r.first) && /S$/.test(await hev(g, r5.answerNum)) && /L$/.test(await hev(g, r5.tray.find(c => c.right).thing)), (await hev(g, r5.answerNum)) + ' ' + (await hev(g, r5.tray.find(c => c.right).thing)));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'after the spoken number');

    // ---- "¿Cuántas?": a wrong number tapped: counted for her ----
    const r6 = await request(g, { who: 'nico', tpl: 'howmany', level: 1 });
    await up(g);
    const wrongCard = r6.cards.findIndex(id => id !== r6.answerNum);
    await g.tapRect(await g.ev(k => G.top().cardRect(k), wrongCard));
    await g.until(() => !G.top().counting && G.top().phase === 'shown', null, 'the right number shown', 20000);
    await g.frames(4); await still(g, 'howmany_shown');
    check('scene: a wrong number: the right ones glow, counted out loud, the right card glows ("' + r6.np + '")', await g.ev(([np, a]) => window.__said.includes(np) && G.top().cardGlow === G.top().req.cards.indexOf(a) && Object.keys(G.top().glow).length === G.top().req.answer, [r6.np, r6.answerNum]));
    check('scene: ...the number she didn\'t find: a miss', /m$/.test(await hev(g, r6.answerNum)));
    await g.tapRect(await g.ev(() => G.top().nextRect()));
    await g.until(() => window.__r !== undefined, null, 'going on');
    check('scene: ...the "go on" arrow ends it', await g.ev(() => window.__r.ok === false));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'after the number');

    // ---- the ramp: two details once several are right first try ----
    const lv = await g.ev(() => ({ lvl: G.requests.level(), ok1: G.hist.listenState().ok1 }));
    check('scene: the ramp counts first-try rights at one detail (' + lv.ok1 + ' so far: level ' + lv.lvl + ')', lv.ok1 === 3 && lv.lvl === 1, JSON.stringify(lv));
    const r7 = await request(g, { who: 'elena', tpl: 'size' });
    await up(g);
    await g.frames(10); await still(g, 'size');
    await tapCell(g, r7.answer);
    await g.until(() => window.__r !== undefined, null, 'the size request');
    check('scene: "' + r7.say + '" right: four first-try rights, two details now (level 2)', await g.ev(() => G.requests.level() === 2));
    await g.fieldIdle('villa');
    const r8 = await request(g, { who: 'pepe', level: 2, tpl: 'numcol' });
    await up(g);
    await g.frames(10); await still(g, 'numcol');
    check('scene: a two-detail request ("' + r8.say + '"): number, thing and colour', /^(Dame|Tráeme) (dos|tres|cuatro|cinco) /.test(r8.say) && r8.words.length === 3);
    await g.drive(() => window.__r !== undefined && G.top() === G.field, 'the two-detail request');
    check('scene: ...done right (drive): right first try', await g.ev(() => window.__r.ok && window.__r.first));

    // ---- the grown-ups' page ----
    await g.ev(() => { G.dashboard.open(); });
    await g.until(() => G.top().constructor.name === 'LearningDash' && G.input.ready(), null, 'the Learning page');
    await g.frames(10); await still(g, 'dash_overview');
    const ov = await g.ev(() => { const s = G.top(), l = G.hist.overview().listen; return { l, line: s.listenLine(l), share: G.dashboard.shareText() }; });
    check('dash: the Overview has listen and do (' + ov.line + ')', ov.l.n === 8 && ov.l.ft === 5 && /^8 requests, 63% right first try \(8 today\)$/.test(ov.line), JSON.stringify(ov.l));
    check('dash: ...and so does Share', /Listen and do \(spoken requests with no pictures, like "Dame tres conchas"\): 8 requests, 63% right the first time \(5 of 8\); 8 today\./.test(ov.share), ov.share);
    check('dash: the history\'s new letter: L counts as practice and for retention (H.KIND, H.events)', await g.ev(() => G.hist.KIND.L === 'listen' && G.hist.events({ days: 1 }).some(e => e.kind === 'listen' && e.first && e.ok)));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    check('scene: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// =====================================================================
//  In the world: favours in two places, the day's favours, the warm-up, a carry request
// =====================================================================
async function world(browser) {
  const { ctx, g } = await openWith(browser, 'ld-world', true, { warmup: true });
  try {
    const free = (also = 'true') => new Function('return G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && (' + also + ');');
    async function talk(id) {
      await g.until(free(), null, 'the map to be free');
      await g.ev(id => { const f = G.field, n = f.npc(id), p = f.player; n.wander = 0; n.home = [n.x, n.y]; for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) if (!f.blocked(n.x + dx, n.y + dy, p) && !f.exitAt(n.x + dx, n.y + dy)) { p.x = n.x + dx; p.y = n.y + dy; break; } f.snapCam(); }, id);
      await g.frames(4);
      await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
    }
    const fav = (who, kind, word) => g.ev(([who, kind, word]) => { G.state.fav = { day: G.words.day(), list: [{ who, kind, word, done: false, on: false }], pal: G.words.day() }; G.state.heartlog = null; }, [who, kind, word]);
    await game(g, { words: WORDS, done: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'bosque1', 'bosque2', 'bosque3', 'playa1', 'playa2', 'playa3'], visit: ['bosque', 'playa'], due: ['mora', 'manzana', 'concha', 'perro'] });
    await g.ev(() => G.warmup.skipToday());
    await g.fieldIdle('villa');

    // ---- the day's favours: listen and carry ones, at most two a day, an ear in their bubble; none when it's off ----
    const days = await g.ev(() => { const out = []; for (let i = 0; i < 40; i++) { G.state.fav.day = -1; out.push(G.favores.today().map(v => v.kind)); } return out; });
    const lk = days.map(L => L.filter(k => k === 'listen' || k === 'carry').length);
    check('favours: listen-and-do favours come up some days (' + lk.filter(n => n).length + ' of 40), never more than two a day', lk.some(n => n) && lk.every(n => n <= 2), JSON.stringify(days.slice(0, 6)));
    const off = await g.ev(() => { window.__listenOff = true; const out = []; for (let i = 0; i < 20; i++) { G.state.fav.day = -1; out.push(...G.favores.today().map(v => v.kind)); } window.__listenOff = false; return out; });
    check('favours: with listen and do off (the other tests), none', !off.some(k => k === 'listen' || k === 'carry'));

    // ---- Don Pepe in Villa Sol: fruit by colour and number ----
    await fav('pepe', 'listen', 'manzana');
    await g.ev(() => G.goto('villa', 22, 13, 'down'));
    await g.fieldIdle('villa');
    check('pepe: his bubble is an ear (listen, then do it)', await g.ev(() => { const a = G.field.npc('pepe').alert(); return a && a.icon === 'escucha'; }), JSON.stringify(await g.ev(() => G.field.npc('pepe').alert())));
    await g.frames(4); await g.shot('pepe_bubble');
    const s0 = await g.ev(() => ({ st: G.state.stars, h: G.hearts.get('pepe'), n: G.hist.listen().n }));
    await talk('pepe');
    await g.drive(() => G.top().constructor.name === 'ListenDo', 'Pepe\'s request');
    await g.frames(16); await still(g, 'pepe_request');
    const p1 = await g.ev(() => ({ say: G.top().req.say, words: G.top().req.words }));
    check('pepe: "¡Escucha!", then a request about his fruit ("' + p1.say + '"), the apple that was due in it', p1.words.includes('manzana'), JSON.stringify(p1));
    await g.drive(free('G.favores.today()[0].done'), 'Pepe\'s favour');
    check('pepe: two requests, then a star and a heart; the favour is done', await g.ev(s0 => G.hist.listen().n === s0.n + 2 && G.state.stars > s0.st && G.hearts.get('pepe') > s0.h && G.state.heartlog.why && /care/.test(JSON.stringify(G.state.heartlog)), s0), JSON.stringify(await g.ev(s0 => ({ n: G.hist.listen().n, s0, st: G.state.stars, h: G.hearts.get('pepe'), log: G.state.heartlog }), s0)));

    // ---- Doña Lupe in the forest: her berries, acorns, mushrooms and leaves ----
    await fav('lupe', 'listen', 'mora');
    await g.ev(() => { G.goto('bosque', 22, 22, 'down'); });
    await g.fieldIdle('bosque');
    await g.ev(() => { const p = G.bosque.state().pie; Object.assign(p, { d: G.words.day(), n: 0, got: {}, baked: true, on: false }); }); // (her pie is baked today: her own side quest is done)
    check('lupe: her bubble is an ear', await g.ev(() => { const n = G.field.npc('lupe'); const a = n && n.alert(); return a && a.icon === 'escucha'; }), JSON.stringify(await g.ev(() => { const n = G.field.npc('lupe'); return n && n.alert(); })));
    const s1 = await g.ev(() => ({ st: G.state.stars, h: G.hearts.get('lupe'), n: G.hist.listen().n }));
    await talk('lupe');
    await g.drive(() => G.top().constructor.name === 'ListenDo', 'Lupe\'s request');
    await g.frames(16); await still(g, 'lupe_request');
    const l1 = await g.ev(() => ({ say: G.top().req.say, words: G.top().req.words, things: G.top().req.tray.map(c => c.thing) }));
    check('lupe: a request about the forest\'s things ("' + l1.say + '"), the blackberries that were due in it', l1.words.includes('mora') && l1.things.every(t => ['mora', 'bellota', 'hongo', 'hoja'].includes(t)), JSON.stringify(l1));
    await g.drive(free('G.favores.today()[0].done'), 'Lupe\'s favour');
    check('lupe: two requests, a star and a heart', await g.ev(s1 => G.hist.listen().n === s1.n + 2 && G.state.stars > s1.st && G.hearts.get('lupe') > s1.h, s1), JSON.stringify(await g.ev(s1 => ({ n: G.hist.listen().n, s1, st: G.state.stars, h: G.hearts.get('lupe') }), s1)));

    // ---- Lola on the beach: shells to bring (a world request) ----
    await fav('lola', 'carry', 'concha');
    await g.ev(() => { G.goto('playa', 10, 3, 'down'); });
    await g.fieldIdle('playa');
    await g.ev(() => { const w = G.state.world; w.lola = Object.assign(w.lola || {}, { met: true, playa: G.words.day() }); G.playa.state().hot = { d: G.words.day() }; Object.assign(G.playa.state().shells, { rosa: 1, blanco: 1, azul: 1, amarillo: 1, rojo: 1 }); }); // (she has said hello here today; nobody is hot; her collection is complete)
    check('lola: her bubble is an ear', await g.ev(() => { const a = G.field.npc('lola').alert(); return a && a.icon === 'escucha'; }), JSON.stringify(await g.ev(() => G.field.npc('lola').alert())));
    await g.ev(() => { G.requests.SPECS.lola.places.playa.concha.count = 1; window.__mk = G.requests.make; G.requests.make = (s, o) => window.__mk(s, Object.assign({}, o, { tpl: 'numcol', level: 2 })); }); // (two details: "Tráeme dos conchas azules")
    await talk('lola');
    await g.drive(() => G.top().constructor.name === 'TextBox' && G.top().opts.noPic, 'Lola\'s request');
    await g.ev(() => { G.requests.make = window.__mk; });
    await g.frames(30); await still(g, 'lola_request');
    const rq = await g.ev(() => { const v = G.favores.today()[0]; return v.req; });
    const tl = await g.ev(() => G.top().lines.reduce((a, L) => a.concat(L.items.filter(it => it.id).map(it => it.look)), []));
    check('lola: "' + rq.say + '": written without the words\' pictures', tl.length === rq.words.length && tl.every(l => l === 'text' || l === 'goldtext'), tl.join());
    await g.drive(free(), 'Lola\'s request');
    const ground = await g.ev(rq => rq.at.map(([x, y]) => G.carry.lying('playa', x, y).map(t => t.id + '/' + t.col).join('+')), rq);
    await g.frames(10); await g.shot('lola_shells');
    check('lola: shells are scattered on the sand around her, one a tile (' + ground.join(' ') + '): the right colour, more than asked, and others', ground.join(' ').split(/[ +]/).filter(t => t === 'concha/' + rq.col).length > rq.n && ground.some(s => !s.includes('/' + rq.col)) && ground.every(s => !s.includes('+')), JSON.stringify(rq));
    const wrongAt = await g.ev(rq => rq.at.find(([x, y]) => G.carry.lying('playa', x, y).some(t => t.col !== rq.col)), rq);
    const rightAt = await g.ev(rq => rq.at.find(([x, y]) => G.carry.lying('playa', x, y).some(t => t.col === rq.col)), rq);
    // the guide points at every pile (a hint, after a while), never only the right one
    check('lola: the guide\'s hint is every pile still lying about (a choice), the hint hand stays away', await g.ev(rq => { const t = G.favores.targets(G.field); return t.length === rq.at.length && t.every(p => p.secret); }, rq));
    // pick up wrong-coloured shells: one, and bring it
    await g.ev(([x, y]) => { const f = G.field, p = f.player; p.x = x; p.y = y + 1; f.snapCam(); }, wrongAt);
    await g.frames(4);
    await g.tapTile(...wrongAt);
    await g.until(() => G.carry.held() && G.carry.held().id === 'concha', null, 'a shell in her hands');
    await g.drive(free(), 'the shell picked up');
    const hold1 = await g.ev(() => G.carry.held());
    await talk('lola');
    await g.drive(() => G.top().constructor.name === 'TextBox' && /Casi/.test(G.top().pages[0].t), 'Lola checks it');
    await g.frames(30); await still(g, 'lola_casi');
    check('lola: the wrong one (' + hold1.n + ' ' + hold1.col + '): "¡Casi!" and the right ones shown ("' + rq.np + '": their picture held up) and said', await g.ev(rq => { const s = G.top(); return s.opts.show && s.opts.show.count === rq.n && window.__said.some(t => t.includes(rq.np.replace(/^¡|!$/g, ''))); }, rq));
    await g.drive(free(), 'after ¡Casi!');
    check('lola: ...her first try counted: the colour a miss', /m$/.test(await hev(g, rq.col)) && await g.ev(() => G.favores.today()[0].on && !G.favores.today()[0].done));
    // one more try: put them down, pick up the right ones, bring them
    await g.ev(() => { G.carry.drop(G.field); });
    const rightTiles = await g.ev(rq => rq.at.filter(([x, y]) => G.carry.lying('playa', x, y).some(t => t.col === rq.col)), rq);
    for (let i = 0; i < rq.n; i++) {
      await g.frames(6); await g.until(free(), null, 'free');
      await g.ev(([x, y]) => { const f = G.field, p = f.player; for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) if (!f.blocked(x + dx, y + dy, p) && !G.carry.lying('playa', x + dx, y + dy).length) { p.x = x + dx; p.y = y + dy; break; } f.snapCam(); }, rightTiles[i]);
      await g.frames(4);
      await g.tapTile(...rightTiles[i]); await g.until(n => G.carry.held() && G.carry.held().n === n, i + 1, 'shell ' + (i + 1)); await g.drive(free(), 'picked');
    }
    check('lola: ' + rq.n + ' ' + rq.col + ' shells in her hands (three at most of a kind)', await g.ev(rq => { const h = G.carry.held(); return h.id === 'concha' && h.col === rq.col && h.n === rq.n; }, rq));
    const s2 = await g.ev(() => ({ st: G.state.stars, h: G.hearts.get('lola') }));
    await talk('lola');
    await g.drive(free(), 'Lola takes them');
    check('lola: the right ones: she takes them, a star and a heart, the favour is done', await g.ev(s2 => !G.carry.held() && G.favores.today()[0].done && G.state.stars > s2.st && G.hearts.get('lola') === s2.h + 1, s2));
    check('lola: counted once (the first try): the request done, not right first time', await g.ev(() => G.hist.listenState().last.ok === 1 && G.hist.listenState().last.first === 0));

    // ---- the dog's warm-up brings a request ----
    await g.ev(() => { G.hist.state().wu.d = ''; G.goto('villa', 22, 13, 'down'); for (const id of ['perro', 'gato', 'pato']) Object.assign(G.words.rec(id), { dd: G.words.day(), dc: G.words.dayNum() }); });
    await g.fieldIdle('villa');
    check('warmup: a listen-and-do request is one of the dog\'s cards (an ear), before a phrase', await g.ev(() => G.warmup.pick(G.field).includes(G.warmup.LD)));
    await g.ev(() => { G.warmup.start(G.field, ['perro', G.warmup.LD]); });
    await g.drive(() => G.top().constructor.name === 'ListenDo', 'the warm-up\'s request');
    await g.frames(20); await still(g, 'warmup_request');
    check('warmup: the dog asks (his face), the skip button is there', await g.ev(() => { const s = G.top(); return s.who === 'canelo' && s.o.cancelIcon === 'skip' && s.req.words.every(id => G.words.stage(id) >= 2); }));
    await g.drive(() => !G.warmup.cur() && G.top() === G.field, 'the warm-up');
    check('warmup: done right (drive): it counts as one of the warm-up\'s right answers', await g.ev(() => { const l = G.hist.state().wu.last; return l && l.ids.includes('_ld') && l.right === 2; }), JSON.stringify(await g.ev(() => G.hist.state().wu.last)));
    check('world: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const SECTIONS = [['node: the request maker', node], ['the scene (iPad, a fake recognizer)', scene], ['in the world: favours, the warm-up, a carry request', world]];
run('Listen and do', process.env.ONLY ? SECTIONS.filter(([n]) => n.includes(process.env.ONLY)) : SECTIONS);
