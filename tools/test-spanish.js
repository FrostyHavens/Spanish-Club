// The Spanish of the lines built by code (docs/AUDIT_2026-10.md, H5, H6, L3, L4): every word of content/es/words.js
// through every template, checked against the word's own article in words.js (not against the game's helper).
//   source   the code and the content as text: no article, possessive or contraction hard-coded before a word put in by
//            code ("¿Y el [' + k + ']?", "toca tu [' + w + ']"), no bare "¡Mira! ¡[' + id + ']!" or "Me encanta [' + k";
//            "caliente" never said about a person ("¡Qué [caliente]!"), Mamá osa, no English "Bye, bye", no stray ¡ or space
//            before ! (the punctuation typos), no "zorra" or "salte" among the mic's alternatives, no bee living in a flower
//   lines    in the page: every template of G.requests.LINES (the favours, the finale, Lola, Mateo, Simón dice, "¡Mira!
//            ¡Una llama!"...) and the helper's forms (G.requests.the: el / la / los / las, un / una, al / del, tu / tus,
//            mi / mis; lo / la; ¿Cuántos? / ¿Cuántas?), with every word: the article agrees in gender and number (el
//            águila, el agua: feminine with "el"), none missing before a noun, never "a el" / "de el", no "tu" before a
//            plural; the requests: the personal a ("Toca al perro"), "¿Cuántas?" for feminine things; every line as shown
//            has no sentence starting in lowercase
//   shown    every hand-written line with a word at a sentence's start ("¡[hola], {name}!") is shown with a capital
//            (¡Hola, Luz!), "¿[comoestas]?" isn't doubled; the favours' real talks (Nico's cabra, Tomás's parque, Señor
//            Gómez's fuente, Luna's stars)
//   NODE_PATH=$(npm root -g) node tools/test-spanish.js [screenshot dir]     (ONLY=source|lines|shown)
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const { run, open, check, ROOT } = require('./harness');

// ---------- the words, straight from content/es/words.js ----------
const ctx = { console }; ctx.window = ctx; ctx.G = { content: {} }; ctx.window.G = ctx.G; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'content', 'es', 'words.js'), 'utf8'), ctx, { filename: 'content/es/words.js' });
const C = ctx.G.content.es, WORDS = Object.keys(C.words).filter(k => !/^f_/.test(k));
const STRESSED_A = ['agua', 'aguila', 'hambre']; // feminine nouns that take "el" / "un" in the singular (a stressed a-)
const ANIMATE = ['animales', 'granja', 'mar', 'fauna', 'bichos', 'rancho', 'faunamontana', 'familia']; // the personal a
// a noun's truth from its own article: {g: 'm' | 'f', plOnly, elFem, sg, pl}, or null (not a noun)
function noun(id) {
  const w = C.words[id]; if (!w) return null;
  const m = /^(el|la|los|las) (.+)$/.exec(w.es.split(' / ')[0].trim()); if (!m) return null;
  const elFem = STRESSED_A.includes(id), g = m[1] === 'la' || m[1] === 'las' || elFem ? 'f' : 'm', plOnly = m[1] === 'los' || m[1] === 'las';
  return { g, plOnly, elFem, sg: plOnly ? null : m[2], pl: plOnly ? m[2] : w.pl || null, mass: (C.mass || []).includes(id), animate: ANIMATE.includes(w.topic) };
}
const NOUNS = WORDS.filter(noun);
// the determiners and what each needs: [plural, gender ('m' | 'f' | 'el': masculine or a stressed-a feminine)]
const DET = { el: [0, 'el'], al: [0, 'el'], del: [0, 'el'], la: [0, 'f'], los: [1, 'm'], las: [1, 'f'], un: [0, 'el'], una: [0, 'f'], unos: [1, 'm'], unas: [1, 'f'], tu: [0], tus: [1], mi: [0], mis: [1] };
const TOK = /\[([a-z0-9]+)(?::([^\]]+))?\]/g;
// what's wrong with the articles of a rich line (every noun token in it): [] when it's right. o.pl: the plural is meant
function agreement(line, o = {}) {
  const bad = [], s = String(line);
  if (/\b(a|de) (el|El)\b/.test(s.replace(TOK, 'X'))) bad.push('"a el" / "de el" (al, del)');
  let m; TOK.lastIndex = 0;
  while ((m = TOK.exec(s))) {
    const n = noun(m[1]); if (!n) continue;
    const pl = n.plOnly || (o.pl != null ? !!o.pl : !!(m[2] && n.pl && m[2] === n.pl));
    const before = s.slice(0, m.index), w = (/([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+$/.exec(before) || [])[1], d = w && DET[w.toLowerCase()];
    if (!d) { if (!(n.mass && !pl && /¡\s*$/.test(before))) bad.push('no article before [' + m[1] + '] (' + (w || before.slice(-3)) + ')'); continue; }
    const [dp, dg] = d, isFem = n.g === 'f' && !n.elFem;
    if (dp !== (pl ? 1 : 0)) bad.push('"' + w + '" with ' + (pl ? 'a plural' : 'a singular') + ' [' + m[1] + ']');
    else if (dg === 'el' && isFem) bad.push('"' + w + '" with the feminine [' + m[1] + ']');
    else if (dg === 'f' && n.g !== 'f') bad.push('"' + w + '" with the masculine [' + m[1] + ']');
    else if (dg === 'f' && !pl && n.elFem) bad.push('"' + w + '" with [' + m[1] + '] (a stressed a-: el / un)');
    else if (dg === 'm' && n.g !== 'm') bad.push('"' + w + '" with the feminine [' + m[1] + ']');
  }
  return bad;
}
// a sentence of the shown text that starts in lowercase (after ¡ ¿ at the start, after . ! ? but not "...", after
// "Name: ¡"), or null
function lowStart(t) {
  const re = /(^|[.!?…]\s+|:\s+(?=[¡¿]))([¡¿«"“(]*)(\p{L})/gu; let m;
  while ((m = re.exec(t))) {
    const pre = t.slice(0, m.index + m[1].length).trimEnd();
    if (/(\.\.|…)$/.test(pre)) continue;           // (after "...": the sentence goes on)
    if (m[1].startsWith(':') && !m[2]) continue;
    if (m[3] !== m[3].toUpperCase()) return t.slice(Math.max(0, m.index - 10), m.index + m[0].length + 12);
  }
  return null;
}

// ---------- the source as text ----------
const FILES = [].concat(...['src', path.join('content', 'es')].map(d => fs.readdirSync(path.join(ROOT, d)).filter(f => /\.js$/.test(f)).map(f => path.join(d, f))));
const SRC = FILES.map(f => ({ f, lines: fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n') }));
const grepSrc = re => { const out = []; for (const { f, lines } of SRC) lines.forEach((l, i) => { if (re.test(l)) out.push(f + ':' + (i + 1) + ' ' + l.trim().slice(0, 90)); }); return out; };
// every string literal in the game's code: [file:line, text]
const LITERALS = []; for (const { f, lines } of SRC) lines.forEach((l, i) => { const re = /'((?:[^'\\\n]|\\.)*)'/g; let m; while ((m = re.exec(l))) LITERALS.push([f + ':' + (i + 1), m[1].replace(/\\'/g, '\'')]); });

// a check that's recorded but lets the next ones run too (the summary still fails): every problem shows at once
const soft = (...a) => { try { check(...a); } catch (e) { /* recorded */ } };
// in the page: a line as the dialogue writes it (the words in their shown forms, G.richLayout)
const SHOWN = () => { window.__shown = s => G.richLayout(G.fill(s), 1e5).map(L => L.items.map(it => (it.gap ? ' ' : '') + it.text).join('')).join('\n'); };

async function source() {
  const hard = grepSrc(/(^|[\s'¡¿])(el|la|los|las|un|una|El|La|Los|Las|Un|Una|tu|tus|mi|mis|al|del|Al|Del) \[' \+/);
  soft('source: no article, possessive or contraction hard-coded before a word put in by code (G.requests.the takes it from the word)', !hard.length, hard.slice(0, 5).join(' | '));
  const bare = grepSrc(/¡Mira! ¡\[' \+|Me encanta \[' \+|¡\[' \+ (it\.id|items\[k\]|PAGE_PLACE)/);
  soft('source: no bare noun where an article is needed ("¡Mira! ¡[llama]!", "¡Me encanta [nieve]!", "¡[flor]! ¡Gracias!")', !bare.length, bare.slice(0, 5).join(' | '));
  const hotPerson = grepSrc(/[Qq]ué \[caliente\]|(Estoy|estoy|Estás|estás|Tengo|tengo|Tienes|tienes|Tiene|tiene) \[caliente/);
  soft('source: "caliente" is never said about a person ("¡Qué calor!", "Tiene mucho calor"; caliente stays for sand, the sun, chocolate)', !hotPerson.length, hotPerson.slice(0, 4).join(' | '));
  const slips = grepSrc(/Mamá \[oso\]|Bye, bye|¡Al pay!|¡A Rosa!|¡A Lucía!|Y el \[agua\]\.\.\. ¡la|Don Lucho tiene!'/);
  soft('source: Mamá osa, a Spanish goodbye, the short exclamations with their words (¡de la fuente!, ¡Vamos con Rosa!)', !slips.length, slips.slice(0, 4).join(' | '));
  // punctuation: a space before ! or ?, an opening ¡ / ¿ inside another one that never closed (in one literal)
  const typos = [];
  for (const [at, t] of LITERALS) {
    if (!/[¡¿]/.test(t)) continue;
    if (/[^\s.] +[!?]/.test(t.replace(/\.\.\. +[!?]/g, '')) || /\.\.\. [!?]/.test(t)) typos.push(at + ' ' + t);
    const stack = []; for (const c of t) { if (c === '¡' || c === '¿') { if (stack[stack.length - 1] === c) { typos.push(at + ' ' + t); break; } stack.push(c); } else if ((c === '!' && stack[stack.length - 1] === '¡') || (c === '?' && stack[stack.length - 1] === '¿')) stack.pop(); }
  }
  soft('source: no punctuation typos ("¡Bajo las... !", "¡Una [bellota]... ¡para ti!")', !typos.length, typos.slice(0, 4).join(' | '));
  const alts = WORDS.filter(id => (C.words[id].alt || '').split('/').map(s => s.trim()).some(a => ['zorra', 'salte'].includes(a)));
  soft('source: no "zorra" (an insult) or "salte" (get out) among the forms the mic accepts', !alts.length, alts.join());
  const bee = grepSrc(/abeja: 'flor'/).filter(l => /dashboard/.test(l)); // (an album hint of where to find her, zone-juegos.js, is fine)
  soft('source: the grown-ups\' "where does it live" never says a bee lives in a flower', !bee.length, bee.join());
}

async function lines(browser) {
  const { ctx: c, g } = await open(browser, 'spanish', false);
  try {
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; }); await g.ev(SHOWN);
    // the requests: every noun with every verb; the personal a with animals and people
    const reqs = await g.ev(N => { const R = G.requests, o = []; for (const id of N) for (const verb of ['give', 'touch', 'where', 'howmany', 'bring']) { const s = R.sentence({ verb, thing: id, size: 'grande' }); o.push({ id, verb, text: s && s.text, say: s && s.say }); } return o; }, NOUNS);
    const rb = [];
    for (const r of reqs) {
      const n = noun(r.id); if (!r.text) { rb.push(r.id + ' ' + r.verb + ': none'); continue; }
      const pl = r.verb === 'howmany' || n.plOnly;
      if (r.verb !== 'howmany') agreement(r.text.replace(/^(Dame|Toca a|Toca|Tráeme|¿Dónde (está|están)) /, (m, v) => (v === 'Toca a' ? 'a ' : '')), { pl }).forEach(e => rb.push(r.say + ' -> ' + e));
      if (r.verb === 'howmany' && !r.say.startsWith('¿Cuánt' + (n.g === 'f' ? 'as' : 'os') + ' ')) rb.push(r.say);
      if (r.verb === 'touch' && n.animate !== /^Toca (al|a la|a los|a las) /.test(r.say)) rb.push(r.say + (n.animate ? ' (an animal: the personal a)' : ' (not an animal: no a)'));
      if (lowStart(r.say)) rb.push('lowercase: ' + r.say);
    }
    soft('lines: every request with every noun (' + reqs.length + '): agreement, ¿Cuántas? for feminine things, "Toca al perro" / "Toca a la vaca" (and "Toca la nube")', !rb.length, rb.length + ': ' + rb.slice(0, 6).join(' | '));
    const has = await g.ev(() => !!(G.requests && G.requests.the && G.requests.LINES));
    check('lines: one helper takes the article from the word (G.requests.the) and the lines built from a word are registered (G.requests.LINES)', has);
    const names = await g.ev(() => Object.keys(G.requests.LINES));
    const want = ['fav.tomas', 'fav.gomez', 'fav.find', 'fav.count', 'fav.remindTomas', 'fav.remindGomez', 'fav.remindFind', 'finale.food', 'lola.fav', 'mateo.love', 'simon.intro', 'simon.says', 'mira', 'un', 'intro.mine', 'hearts.secret'];
    soft('lines: every fixed template is registered (' + names.length + ': ' + names.join(', ') + ')', want.every(k => names.includes(k)), want.filter(k => !names.includes(k)).join());
    // every word through every template
    const out = await g.ev(W => { const L = G.requests.LINES, o = []; for (const k in L) for (const id of W) o.push({ k, id, t: L[k](id), shown: window.__shown(L[k](id)) }); return o; }, WORDS);
    const bad = [], low = [];
    for (const r of out) {
      const pl = r.k === 'mateo.love' ? !!(noun(r.id) && (noun(r.id).plOnly || C.words[r.id].pl)) : null;
      agreement(r.t, { pl }).forEach(e => bad.push(r.k + '(' + r.id + '): ' + r.t + ' -> ' + e));
      const l = lowStart(r.shown); if (l) low.push(r.k + '(' + r.id + '): ' + r.shown);
    }
    soft('lines: every word (' + WORDS.length + ') through every template (' + names.length + '): the article agrees, none missing, no "a el"', !bad.length, bad.length + ': ' + bad.slice(0, 6).join(' | '));
    soft('lines: ...and no sentence starts in lowercase as shown', !low.length, low.length + ': ' + low.slice(0, 6).join(' | '));
    // the pronoun and the ending agree: ¡Búscalo! / ¡Búscala!, ¿Cuántos? / ¿Cuántas?, Me encanta / Me encantan
    const pro = [];
    for (const r of out) {
      const n = noun(r.id); if (!n) continue;
      const f = n.g === 'f', p = n.plOnly;
      if (r.k === 'fav.find' && !r.t.endsWith('¡Búsca' + (f ? 'la' : 'lo') + (p ? 's' : '') + '!')) pro.push(r.t);
      if (r.k === 'fav.count' && r.t !== '¿Cuánt' + (f ? 'as' : 'os') + '?') pro.push(r.id + ': ' + r.t);
      if (r.k === 'mateo.love' && !/^¡Me encanta(n)? /.test(r.t)) pro.push(r.t);
      if (r.k === 'mateo.love' && /encantan /.test(r.t) !== !!(n.plOnly || C.words[r.id].pl)) pro.push(r.t);
    }
    soft('lines: the pronoun and endings agree with the word (¡Búscala! for la cabra, ¿Cuántas? for apples, ¡Me encantan las nubes!)', !pro.length, pro.slice(0, 6).join(' | '));
    const famous = await g.ev(() => { const L = G.requests.LINES; return [L['finale.food']('cabra'), L['fav.find']('cabra'), L['fav.tomas']('parque'), L['fav.gomez']('fuente'), L['lola.fav']('tortuga'), L['mateo.love']('nieve'), L['simon.says']('ojos'), L.mira('llama'), L['fav.count']('estrella'), L['hearts.secret']('fuente'), L.un('flor'), L['mateo.love']('nube')]; });
    soft('lines: the audit\'s cases: ' + famous.join(' / '), famous[0] === '¿Y para la [cabra]?' && famous[1] === '¡Un juego! ¿Y la [cabra]? ¡Búscala!' && /¡para el \[parque\]!/.test(famous[2]) && /¡A la \[fuente\]!/.test(famous[3]) &&
      famous[4] === '¡La [tortuga]! ¡A mí también me gusta!' && famous[5] === '¡Me encanta la [nieve]!' && famous[6] === '¡Simón dice: tócate los [ojos]!' && famous[7] === '¡Mira! ¡Una [llama]!' && famous[8] === '¿Cuántas?' && famous[9] === '¡Un secreto! Una página... ¡en la [fuente]!' && famous[10] === '¡Una [flor]!' && famous[11] === '¡Me encantan las [nube:nubes]!');
    // the helper's forms, every noun
    const forms = await g.ev(N => { const R = G.requests, o = []; for (const id of N) { const F = { def: R.the(id), un: R.the(id, { un: 1 }), pl: R.the(id, { pl: 1 }), unpl: R.the(id, { un: 1, pl: 1 }), a: R.the(id, { pre: 'a' }), de: R.the(id, { pre: 'de' }), apl: R.the(id, { pre: 'a', pl: 1 }), tu: R.the(id, { my: 'tu' }), tus: R.the(id, { my: 'tu', pl: 1 }), mi: R.the(id, { my: 'mi' }), mis: R.the(id, { my: 'mi', pl: 1 }), cap: R.the(id, { cap: 1, un: 1 }), lo: R.lo(id), los: R.lo(id, true) }; o.push({ id, F }); } return o; }, NOUNS);
    const fb = [];
    for (const { id, F } of forms) {
      const n = noun(id);
      for (const k of ['def', 'un', 'pl', 'unpl', 'a', 'de', 'apl', 'tu', 'tus', 'mi', 'mis', 'cap']) if (!(n.mass && (k === 'un' || k === 'cap'))) agreement(F[k], { pl: /pl|tus|mis/.test(k) || n.plOnly }).forEach(e => fb.push(id + ' ' + k + ': ' + F[k] + ' -> ' + e));
      if (!n.plOnly && !n.elFem && F.def.split(' ')[0] !== (n.g === 'f' ? 'la' : 'el')) fb.push(id + ': ' + F.def);
      if (n.elFem && F.def !== 'el [' + id + ']') fb.push(id + ' (el águila): ' + F.def);
      if (/^(a el|de el) /.test(F.a + ' ' + F.de)) fb.push(id + ': ' + F.a + ' / ' + F.de);
      if (!n.plOnly && n.g === 'm' && F.a !== 'al [' + id + ']') fb.push(id + ': ' + F.a);
      if (n.mass && F.un !== '[' + id + ']') fb.push(id + ' (a mass noun: bare): ' + F.un);
      if (F.cap[0] !== F.cap[0].toUpperCase()) fb.push(id + ' cap: ' + F.cap);
      if (F.lo !== (n.g === 'f' ? 'la' : 'lo') + (n.plOnly ? 's' : '') || F.los !== (n.g === 'f' ? 'las' : 'los')) fb.push(id + ': ' + F.lo + ' / ' + F.los);
    }
    soft('lines: the helper\'s forms for every noun (' + NOUNS.length + '): el / la / los / las, un / una / unos / unas, al / del, tu / tus, mi / mis, lo / la, el águila, agua bare after "un"', !fb.length, fb.length + ': ' + fb.slice(0, 6).join(' | '));
    check('lines: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await c.close(); }
}

async function shown(browser) {
  const { ctx: c, g } = await open(browser, 'spanish-shown', false);
  try {
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; }); await g.ev(SHOWN);
    // the favours' real talks (G.say and the question stubbed: the lines they make)
    const fav = await g.ev(() => {
      const said = [], say0 = G.say, ask0 = G.chapters.ask;
      G.say = pages => { (Array.isArray(pages) ? pages : [pages]).forEach(p => said.push(typeof p === 'object' ? p.t : p)); return null; };
      G.chapters.ask = function* (who, prompt) { said.push(prompt); };
      const go = gen => { let r = gen.next(), n = 0; while (!r.done && n++ < 40) r = gen.next(); };
      try {
        const K = G.favores.KIND;
        go(K.find({ who: 'nico', kind: 'find', word: 'cabra' }));
        go(K.go({ who: 'tomas', kind: 'go', word: 'parque' }));
        go(K.go({ who: 'gomez', kind: 'go', word: 'fuente' }));
        go(K.count({ who: 'luna', kind: 'count', word: 'tres' }));
        go(K.count({ who: 'pepe', kind: 'count', word: 'dos' }));
      } finally { G.say = say0; G.chapters.ask = ask0; }
      return said;
    });
    soft('shown: the favours as they are said (' + fav.filter(t => /cabra|parque|fuente|Cuánt/.test(t)).join(' / ') + ')', fav.includes('¡Un juego! ¿Y la [cabra]? ¡Búscala!') && fav.some(t => /¡para el \[parque\]!/.test(t)) && fav.some(t => /¡A la \[fuente\]!/.test(t)) && fav.filter(t => t === '¿Cuántas?').length === 2, fav.join(' | '));
    // every hand-written line with a word token right after ¡ or ¿, as the dialogue writes it
    const lits = LITERALS.filter(([, t]) => /[¡¿]\[[a-z0-9]+(:[^\]]*)?\]/.test(t));
    const res = await g.ev(L => L.map(([at, t]) => [at, t, window.__shown(t)]), lits);
    const low = res.filter(([, , s]) => lowStart(s)).map(([at, t, s]) => at + ' ' + t + ' -> ' + s);
    soft('shown: every hand-written line (' + res.length + ') writes a word that starts a sentence with a capital ("¡[hola], {name}!" -> ¡Hola, Luz!)', !low.length, low.length + ': ' + low.slice(0, 5).join(' | '));
    const S = await g.ev(() => ['¡[hola], {name}!', '¡Nico! ¿[comoestas]?', 'Luna: ¿[comoestas]?', 'El [perro] dice ¡[guau]!', '{dog}, ¡[busca]!', '[uno]... ¡[dos]! [dos] [huevo:huevos].', '¡Simón dice: [salta]!'].map(window.__shown));
    soft('shown: capitals at a sentence\'s start only, "¿cómo estás?" not doubled (' + S.join(' / ') + ')', S[0] === '¡Hola, Luz!' && S[1] === '¡Nico! ¿Cómo estás?' && S[2] === 'Luna: ¿Cómo estás?' && S[3] === 'El perro dice ¡guau!' && /, ¡busca!$/.test(S[4]) && S[5] === 'Uno... ¡dos! Dos huevos.' && S[6] === '¡Simón dice: salta!');
    check('shown: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await c.close(); }
}

const ONLY = process.env.ONLY;
run('Spanish: the lines built by code', [['source', source], ['lines', lines], ['shown', shown]].filter(([n]) => !ONLY || ONLY === n));
