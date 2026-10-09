// The story's chapters 11-21 (content/es/story-c11-c21.js; docs/CURRICULUM.md), played by taps from a game where chapters
// 1-10 are done (their 34 words known), over the days the budget asks for, to the animal party and the diploma,
// choosing what to do like the hint hand (tools/playflow.js). Checked on the way:
//   - each chapter meets exactly its own new words (CURRICULUM.md section 1), and no card ever shows an unmet word
//   - every chapter starts within the budget (<= 6 new words a day, 8 a date, < 10 words only met)
//   - Canelo learns his tricks in the story (dame la pata and salta in 14, busca in 16, gira in 17): six cards in his menu
//   - the older errands never open (the whole game is the chapter path); the side jobs open with their chapters
//   - the review in the world: the morning greeting asks a due word, favores ("?" bubbles) and Luna's palabra del día
//   - a part-1 save (chapters 1-10 done, then some of the older errands, one going on) loads onto the chapters
//   NODE_PATH=$(npm root -g) node tools/test-chapters2.js [screenshot dir]        (ONLY=story,old to run some; UNTIL=c15)
'use strict';
const { open, check, run } = require('./harness');
const { playToEnd, nextDay, settle } = require('./playflow');

const CH_WORDS = { c11: ['gallina', 'huevo', 'uno', 'dos', 'blanco'], c12: ['platano', 'naranja', 'porfavor', 'tres', 'cuatro'], c13: ['panaderia', 'queso', 'leche', 'cinco', 'seis'],
  c14: ['pata', 'salta', 'galleta', 'azul', 'feliz'], c15: ['triste', 'flor', 'rosa', 'amarillo', 'mariposa'], c16: ['biblioteca', 'busca', 'arbol', 'conejo'],
  c17: ['rana', 'croac', 'verde', 'pajaro', 'gira'], c18: ['pez', 'siete', 'ocho'], c19: ['nueve', 'diez'], c20: [], c21: [] };
const FIRST10 = ['hola', 'perro', 'guau', 'ven', 'gato', 'miau', 'buenosdias', 'hueso', 'sientate', 'si', 'no', 'manzana', 'pelota', 'rojo', 'pan', 'gracias', 'pato', 'cuac',
  'parque', 'banco', 'fuente', 'granja', 'cabra', 'escuela', 'bien', 'comoestas', 'agua', 'cama', 'buenasnoches', 'cansado', 'carta', 'casa', 'caballo', 'adios'];
const noErrors = (g, name) => check(name + ': no console errors', !g.errors.length, g.errors.join('\n'));

// a game where chapters 1..n are done (yesterday): their words known, Canelo yours with the tricks of those chapters
// (n = 10 normally; FROM=15 starts the test later, to try the last chapters quickly)
function afterN(n) {
  G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
  G.st.begin(1);
  for (const id of G.chapters.ids().slice(0, n)) { G.state.quests[id] = 'done'; for (const w of G.chapters.def(id).words) { G.words.meet(w, 'test'); G.words.answerRight(w, { firstTry: true, mode: 'text' }); } }
  Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
  Object.assign(G.state.pet.tricks, { ven: 3, sientate: 3 }, n >= 14 ? { pata: 3, salta: 3 } : {}, n >= 16 ? { busca: 3 } : {}, n >= 17 ? { gira: 3 } : {});
  G.state.ch.lastDoneSess = G.words.sess();
  G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('load');
  G.st.saveNow();
}
const FROM = +(process.env.FROM || 10);
async function watch(g) {
  await g.ev(() => {
    window.__unmetCards = window.__unmetCards || []; window.__starts = window.__starts || {}; window.__metIn = window.__metIn || {};
    if (!G.choose.__w) {
      const orig = G.choose;
      G.choose = function (o) {
        (o.choices || []).forEach((c, k) => { if (c.word && G.data.words[c.word] && !G.st.seen(c.word) && k !== o.answer && o.answer != null) window.__unmetCards.push(c.word + ' in "' + G.plain(o.prompt || '') + '"'); });
        return orig.call(this, o);
      };
      G.choose.__w = true;
    }
    if (!G.chapters.start.__w) {
      const st = G.chapters.start;
      G.chapters.start = function (id) { if (!G.chapters.active(id) && !G.chapters.done(id)) window.__starts[id] = { today: G.chapters.newToday(), date: G.chapters.newOnDate(), stage1: G.chapters.stage1(), n: G.chapters.newWords(id).length }; return st.call(this, id); };
      G.chapters.start.__w = true;
    }
    if (!G.words.meet.__w) {
      const m = G.words.meet;
      G.words.meet = function (id, ...a) { const r = m.call(this, id, ...a); if (r) { const c = G.chapters.current() || 'none'; (window.__metIn[c] || (window.__metIn[c] = [])).push(id); } return r; };
      G.words.meet.__w = true;
    }
  });
}

// ---------- chapters 11-21, by taps, to the diploma ----------
async function story(browser) {
  const { ctx, g } = await open(browser, 'ch2', true);
  try {
    await g.ev(afterN, FROM);
    await g.ev(() => G.toTitle());
    await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
    await watch(g); await g.ev(() => { G.speedMul = 2; });
    const until = process.env.UNTIL || null, shots = {};
    // a screenshot of the first question of each kind of picture: a heap to count, a picture sign, a mixed heap
    const seenKind = {};
    g.beforeAct = async (s) => {
      if (s.name !== 'Choice' || s.t < 12) return false;
      const k = await g.ev(() => { const sh = G.top().o.show; return sh && typeof sh === 'object' ? (sh.sign ? 'sign' : sh.count ? 'count' : sh.list ? 'heap' : null) : null; });
      if (k && !seenKind[k]) { seenKind[k] = 1; await g.shot('question_' + k); }
      return false;
    };
    let sawFavor = false, sawPalabra = false;
    await playToEnd(g, {
      nextDay: async () => { await nextDay(g); await watch(g); await g.ev(() => { G.speedMul = 2; }); },
      beforeStep: async (st) => {
        if (g.errors.length) throw new Error(g.errors.join('\n'));
        const c = await g.ev(() => G.chapters.current());
        if (c && !shots[c]) { shots[c] = 1; await g.frames(10); await g.shot(c + '_start'); }
        const fd = await g.ev(() => { const t = G.intro.targets(G.field)[0]; return t ? t.find : null; });
        if (fd && !shots['find_' + fd]) { shots['find_' + fd] = 1; await g.frames(20); await g.shot('find_' + fd); } // (a find-it on the map: the nests, the white hen...)
        if (c === 'c15' && !shots.flowers && await g.ev(() => (G.state.ch.step.c15 | 0) === 1)) { shots.flowers = 1; await g.frames(20); await g.shot('c15_flowers'); }
        if (c === 'c19' && !shots.parade && await g.ev(() => G.field.zoo && G.field.zoo.list.filter(a => a.follow).length >= 3)) { shots.parade = 1; await g.frames(30); await g.shot('c19_parade'); }
        if (!sawFavor) sawFavor = await g.ev(() => !!(G.favores && G.favores.today().length));
        if (!sawPalabra) sawPalabra = await g.ev(() => !!(G.favores && G.favores.palabraDone()));
        if (until && st.q[until] === 'done') throw new Error('UNTIL');
      },
    }).catch(e => { if (e.message !== 'UNTIL') throw e; });
    const r = await g.ev(() => ({ q: G.state.quests, metIn: window.__metIn, starts: window.__starts, cards: window.__unmetCards, tricks: G.state.pet.tricks, day: G.words.day(), old: G.data.tailOrder.length, offered: ['mercado', 'picnic', 'show', 'flores', 'sonidos', 'cuenta', 'fiestab'].filter(id => G.state.quests[id]) }));
    const ids = Object.keys(CH_WORDS).filter(id => r.q[id] === 'done' && +id.slice(1) > FROM);
    check('story: chapters done: ' + ids.join(' '), ids.length >= (until ? 1 : 21 - FROM), JSON.stringify(r.q));
    const wrong = ids.filter(id => (r.metIn[id] || []).slice().sort().join() !== CH_WORDS[id].slice().sort().join());
    check('story: each chapter met exactly its own new words', !wrong.length, wrong.map(id => id + ': ' + (r.metIn[id] || []).join(',') + ' (want ' + CH_WORDS[id].join(',') + ')').join('; ') + ' | other: ' + JSON.stringify(r.metIn.none || []));
    const over = Object.entries(r.starts).filter(([id, s]) => s.today + s.n > 6 || s.date + s.n > 8 || (s.n && s.stage1 >= 10));
    check('story: every chapter started within the budget', !over.length, JSON.stringify(over));
    check('story: no card ever showed an unmet word', !r.cards.length, r.cards.slice(0, 8).join('; '));
    check('story: the older errands never opened', !r.old && !r.offered.length, r.offered.join());
    if (!until) {
      check('story: Canelo learned dame la pata, salta, busca and gira (all six tricks)', ['pata', 'salta', 'busca', 'gira'].every(t => r.tricks[t] === 3), JSON.stringify(r.tricks));
      check('story: the animal party and the diploma', r.q.c21 === 'done' && g.seen.has('Diploma'));
      check('story: favores and Luna\'s palabra del día came up on the way', sawFavor && sawPalabra, JSON.stringify({ sawFavor, sawPalabra }));
      check('story: it took several days (one chapter a day, about)', FROM > 10 || r.day >= 8, 'day ' + r.day);
    }
    noErrors(g, 'story');
  } finally { await ctx.close(); }
}

// ---------- a part-1 save: chapters 1-10, then some older errands ----------
async function oldSave(browser) {
  const { ctx, g } = await open(browser, 'ch2-old', true);
  try {
    await g.ev(first10 => {
      const words = {}; for (const id of first10.concat(['platano', 'tres', 'queso', 'leche', 'pata'])) words[id] = { st: 2, box: 2, n: 2, met: 0, md: 0, ms: 0, how: 'old' };
      const q = {}; for (let i = 1; i <= 10; i++) q['c' + i] = 'done';
      Object.assign(q, { mercado: 'done', picnic: 'done', show: 'active' });
      const old = { flags: { intro: true, canelo: true, petStart: true, e_show: {} }, searched: {}, playTime: 3000, loc: { map: 'villa', x: 15, y: 13, dir: 'down' }, words, pages: {}, quests: q, stars: 50,
        opts: { english: false }, look: G.data.defaultLook('nino'), name: 'Leo', album: {}, pet: { tricks: { sientate: 3, ven: 3, pata: 2 }, learning: 'pata' }, hearts: {}, bag: { items: [{ id: 'galleta', q: 'show' }, { id: 'manzana' }] },
        jobs: {}, ch: { v: 2, step: {}, data: {}, began: {}, doneSess: {}, placeAsk: {} }, savedAt: Date.now() };
      localStorage.setItem('spanishclub_slot2', JSON.stringify(old));
    }, FIRST10);
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
    await g.tapRect(await g.ev(() => G.top().cardRect(1)));
    await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'the old game');
    await g.frames(20);
    const a = await g.ev(() => ({ q: G.state.quests, v: G.state.ch.v, tricks: G.state.pet.tricks, learning: G.state.pet.learning, bag: G.state.bag.items.map(i => i.id + (i.q ? ':' + i.q : '')), next: G.chapters.next() }));
    check('old: a part-1 save (the picnic done) maps onto chapter 13: chapters 1-13 done', a.v === 3 && ['c11', 'c12', 'c13'].every(k => a.q[k] === 'done') && !a.q.c14, JSON.stringify(a.q));
    check('old: the older errand going on (the dog show) is let go, its things leave the bag; chapter 14 is next', !a.q.show && a.bag.join() === 'manzana' && a.next === 'c14', JSON.stringify(a));
    check('old: Canelo keeps his tricks; nothing half-learned is left hanging', a.tricks.ven === 3 && a.tricks.sientate === 3 && !a.learning, JSON.stringify(a));
    noErrors(g, 'old');
  } finally { await ctx.close(); }
}

const SECTIONS = [['chapters 11-21 by taps', story], ['a part-1 save', oldSave]];
const only = (process.env.ONLY || '').split(',').filter(Boolean);
run('Chapters 11-21', SECTIONS.filter(([n, fn]) => !only.length || only.some(o => n.toLowerCase().includes(o) || fn.name.toLowerCase().includes(o))));
