// Round B foundation (src/animals.js, src/world.js and the new words, map and pictures): every new word has a picture
// and a notebook page placed in the world; tapping an animal names it ("el pato / ¡Cuac, cuac!") and records the album;
// tapping an object names it; say-it-back with a FAKE recognizer (as in tools/test-speaking.js) gives a speaking star
// once per word per day, learns the word, and a miss costs nothing; the keyboard names things too; and doors, people,
// searches, pages and plain tap-to-walk work exactly as before.
//   NODE_PATH=$(npm root -g) node tools/test-roundb-world.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

function FAKE() { // each recognizer start() takes the next reply from window.__sr.queue
  const sr = window.__sr = { queue: [], starts: [] };
  class FakeRecognition {
    start() {
      const s = this.s = sr.queue.shift() || { error: 'no-speech' };
      sr.starts.push({ during: window.event ? window.event.type : 'frame', lang: this.lang });
      setTimeout(() => { this.onstart && this.onstart({}); }, 30);
      setTimeout(() => {
        if (this.ended) return;
        if (s.results) { this.onspeechstart && this.onspeechstart({}); const r = s.results.map(t => ({ transcript: t, confidence: 0.9 })); r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }
        if (s.error) this.onerror && this.onerror({ error: s.error });
        this.end();
      }, s.delay || 250);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 40); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openFake(browser, name, touch) {
  const { ctx, g } = await open(browser, name, touch);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
async function town(g, x, y, dir, o = {}) {
  await g.ev(([x, y, dir, o]) => {
    G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { intro: true }, o.flags || {}); Object.assign(G.state.quests, o.quests || {}); Object.assign(G.state.pages, o.pages || {});
    G.goto('villa', x, y, dir);
  }, [x, y, dir, o]);
  await g.fieldIdle('villa');
  await g.until(() => G.field.amb && G.field.zoo, null, 'the town and its animals');
  await g.frames(20);
}
const idle = g => g.until(() => G.top() === G.field && !G.field.route && !G.field.player.moving && !G.field.locked, null, 'the walk to end');

// ---------- data: words, pictures, pages ----------
async function data(browser) {
  const { ctx, g } = await open(browser, 'rb-data', true);
  try {
    const d = await g.ev(() => {
      const D = G.data, ids = Object.keys(D.words), onPage = new Set([].concat(...Object.values(D.pages).map(p => p.words)));
      const placed = new Set(); for (const m in G.maps) for (const k in G.maps[m].pages || {}) placed.add(G.maps[m].pages[k]);
      return {
        n: ids.length, noPic: ids.filter(id => !G.iconDrawn(id)), offPage: ids.filter(id => !onPage.has(id)),
        badTopic: ids.filter(id => !D.topics[D.words[id].topic]), unplaced: D.pageOrder.slice(5).filter(p => !placed.has(p) && p !== 'mascota'), // Round A's saludos page and Round B's Mi perro page come from Mamá
        big: D.pageOrder.filter(p => D.pages[p].words.length > 9), order: D.pageOrder.length === Object.keys(D.pages).length,
        kinds: G.animals.list(), animalWords: G.animals.list().every(k => D.words[G.animals.KINDS[k].word]),
        sounds: G.animals.list().map(k => G.animals.KINDS[k].sound).filter(Boolean).every(id => D.words[id]),
      };
    });
    check('data: about 75-80 words (Round A 30 + Round B)', d.n >= 70 && d.n <= 80, 'n=' + d.n);
    check('data: every word has its own picture (no placeholder)', !d.noPic.length, d.noPic.join(','));
    check('data: every word is on a notebook page of at most 9, with a topic', !d.offPage.length && !d.badTopic.length && !d.big.length && d.order, JSON.stringify(d));
    check('data: every Round B notebook page is placed somewhere in the world', !d.unplaced.length, d.unplaced.join(','));
    check('data: 11 animals, each with its word (and sound word)', d.kinds.length === 11 && d.animalWords && d.sounds, JSON.stringify(d.kinds));
    check('data: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- iPad: animals and things say their names; say it back ----------
async function ipad(browser) {
  const { ctx, g } = await openFake(browser, 'rb-world', true);
  try {
    // a duck on the farm pond
    await town(g, 36, 20, 'right'); // (beside the duck pond)
    const live = await g.ev(() => G.animals.here().map(a => a.kind));
    check('animals: ducks, hens, the fish, the frog, the rabbit, the horse and the goat live in Villa Sol', ['pato', 'gallina', 'pez', 'rana', 'conejo', 'caballo', 'cabra'].every(k => live.includes(k)), live.join(','));
    await g.shot('farm');
    const duck = await g.ev(() => { const a = G.animals.find('pato'); Object.assign(a, { x: 40 * 24 + 12, y: 21 * 24 + 16, st: 'idle', t: 1e9, react: 0 }); return G.animals.screen(a); }); // on screen
    await g.until(([x, y]) => !!G.animals.hit(G.field, { x, y }), duck, 'the duck under the tap');
    await g.tap(...duck);
    const st = await g.ev(() => ({ b: G.world.bubble && G.world.bubble.id, cry: G.world.bubble && G.world.bubble.cry, album: G.state.album.pato, met: G.animals.met('pato'), seen: G.st.seen('pato') && G.st.seen('cuac'), walk: !!G.field.route, sb: G.world.sayBack && G.world.sayBack.id }));
    check('animals: tapping the duck says "el pato / ¡Cuac, cuac!" and walks you toward it', st.b === 'pato' && st.cry === '¡Cuac, cuac!' && st.walk, JSON.stringify(st));
    check('animals: the album records it (first, map, n) and pato + cuac are seen', st.met && st.album.n === 1 && st.album.map === 'villa' && st.album.first > 0 && st.seen, JSON.stringify(st));
    check('animals: the say-it-back mic shows beside the word', st.sb === 'pato');
    await g.frames(10); await g.shot('duck_named');

    // say it back: "el pato" -> a speaking star, learned (the card has no mic), album said
    const s0 = await g.ev(() => G.state.stars);
    await g.ev(() => window.__sr.queue.push({ results: ['el pato'] }));
    await g.tapRect(await g.ev(() => G.world.sayBack.mic.o.rect()));
    await g.until(() => window.__sr.starts.length > 0, null, 'the recognizer to start');
    check('saying: the mic starts inside the touch (touchend), es-MX', await g.ev(() => window.__sr.starts[0].during === 'touchend' && window.__sr.starts[0].lang === 'es-MX'));
    await g.until(() => G.st.saidCount('pato') === 1, null, 'the speaking star');
    const sr = await g.ev(s0 => ({ stars: G.state.stars - s0, day: G.state.sayback.pato === G.world.today(), said: G.state.album.pato.said }), s0);
    check('saying: "el pato" gives a speaking star, marks today and the album', sr.stars === 1 && sr.day && sr.said, JSON.stringify(sr));
    await g.until(() => G.top().constructor.name === 'WordCard', null, 'the new word card');
    check('saying: the word is learned, with a "¡Palabra nueva!" card that has no mic of its own', await g.ev(() => G.st.knows('pato') && !G.top().mic));
    await g.frames(25); await g.shot('pato_learned');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the word card');
    await idle(g);
    // once per word per day
    await g.ev(() => { const a = G.animals.find('pato'); a.st = 'idle'; a.t = 1e9; });
    await g.tap(...await g.ev(() => G.animals.screen(G.animals.find('pato'))));
    check('saying: tapped again today, the duck is named but offers no second say-it-back star', await g.ev(() => G.world.bubble.id === 'pato' && !G.world.sayBack));

    // an object: the bench in the plaza (adjacent: named at once); a miss, then V
    await idle(g);
    await town(g, 22, 13, 'up');
    await g.tapTile(22, 12);
    await g.until(() => G.world.bubble && G.world.bubble.id === 'banco', null, 'the bench to say its name');
    check('things: tapping the bench beside you names it "el banco" (seen, a wiggle), no dialogue', await g.ev(() => G.st.seen('banco') && !!G.field.wig && G.top() === G.field && !!G.world.sayBack));
    await g.frames(6); await g.shot('bench_named');
    const s1 = await g.ev(() => G.state.stars);
    await g.ev(() => window.__sr.queue.push({ results: ['manzana', 'mansana'] }));
    await g.tapRect(await g.ev(() => G.world.sayBack.mic.o.rect()));
    await g.until(() => G.world.sayBack && G.world.sayBack.mic.sad > 0, null, 'the miss');
    check('saying: a wrong word is a gentle miss (no star, the mic stays)', await g.ev(s1 => G.state.stars === s1 && !!G.world.sayBack && !G.st.knows('banco'), s1));
    await g.ev(() => window.__sr.queue.push({ results: ['el banco'] }));
    await g.until(() => G.world.sayBack && !G.world.sayBack.mic.listening() && G.world.sayBack.mic.can(), null, 'the mic ready again');
    await g.press('v');
    await g.until(() => G.st.saidCount('banco') === 1, null, 'the speaking star by V');
    check('saying: V listens too, "el banco" -> a speaking star', await g.ev(s1 => G.state.stars === s1 + 1, s1));
    await g.drive(() => G.top() === G.field && !G.field.locked && G.st.knows('banco'), 'the word card');

    // a far object: walk up to the fountain, it names itself (its page was found already); the fish jumps
    await town(g, 18, 15, 'up', { pages: { numeros: true } });
    await g.tapTile(18, 11);
    await g.until(() => G.world.bubble && G.world.bubble.id === 'fuente', null, 'the fountain to say its name');
    check('things: tapping the fountain from afar walks you up to it, then "la fuente"; the fish jumps', await g.ev(() => G.field.player.y === 12 && G.animals.find('pez').st === 'jump'));
    // a walk-on thing: a flower
    await town(g, 30, 8, 'down');
    await g.tapTile(31, 9);
    await idle(g);
    check('things: tapping a flower walks you onto it and it says "la flor"', await g.ev(() => G.field.player.x === 31 && G.field.player.y === 9 && G.world.bubble && G.world.bubble.id === 'flor'));
    // speaking off: names, no mic
    await g.ev(() => { G.prefs.mic = false; });
    await town(g, 1, 12, 'left');
    await g.tapTile(0, 12);
    await g.until(() => G.world.bubble && G.world.bubble.id === 'arbol', null, 'the tree');
    check('things: with speaking off a tree still says "el árbol", with no mic', await g.ev(() => !G.world.sayBack));
    await g.ev(() => { G.prefs.mic = true; });
    check('ipad: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- iPad: everything from before still works ----------
async function before(browser) {
  const { ctx, g } = await open(browser, 'rb-before', true);
  try {
    // plain tap-to-walk on grass
    await town(g, 8, 14, 'down');
    await g.tapTile(8, 16); await idle(g);
    check('before: tapping plain ground just walks there (nothing named)', await g.ev(() => G.field.player.x === 8 && G.field.player.y === 16 && !G.world.bubble));
    // a door
    await town(g, 5, 18, 'up');
    await g.tapTile(5, 17);
    await g.until(() => G.field && G.field.mapId === 'casa', null, 'going home through the door');
    check('before: tapping a door still goes through it', true);
    // the bed at home says la cama
    await g.fieldIdle('casa');
    // a person: Don Pepe (his stall is a counter)
    await town(g, 14, 8, 'down');
    await g.tapTile(14, 9);
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.name === 'Don Pepe', null, 'Don Pepe to talk');
    check('before: tapping a person still talks to them', true);
    await g.drive(() => G.top() === G.field && !G.field.locked, 'Don Pepe');
    // a search spot in the park (the ball errand), even with the rabbit hopping about
    await town(g, 13, 23, 'up', { quests: { pelota: 'active' }, flags: { canelo: false } });
    await g.ev(() => { const r = G.animals.find('conejo'); r.x = 13 * 24 + 12; r.y = 22 * 24 + 20; r.st = 'eat'; r.t = 1e9; });
    await g.tapTile(13, 22);
    await g.until(() => G.top().constructor.name !== 'Field', null, 'the search');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the search');
    check('before: a search spot still searches (it wins over an animal on it)', await g.ev(() => !!G.state.searched['villa:13,22']));
    // a page sparkle on a named thing: the page first
    await town(g, 13, 10, 'up');
    await g.tapTile(13, 9);
    await g.until(() => G.top().constructor.name === 'Notebook', null, 'the page on the bench');
    check('before: a notebook page on a bench is found first', await g.ev(() => G.st.hasPage('cosas')));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'the notebook');
    check('before: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- desktop: keys ----------
async function keys(browser) {
  const { ctx, g } = await open(browser, 'rb-keys', false);
  try {
    await town(g, 1, 12, 'left');
    await g.press('z');
    await g.until(() => G.world.bubble && G.world.bubble.id === 'arbol', null, 'Z facing a tree');
    check('keys: Z facing a tree names it (no "..." box)', await g.ev(() => G.top() === G.field));
    await g.ev(() => { G.goto('casa', 6, 3, 'up'); });
    await g.fieldIdle('casa');
    await g.ev(() => { G.field.player.dir = 'right'; G.field.player.x = 6; G.field.player.y = 2; });
    await g.press('z');
    await g.until(() => G.world.bubble && G.world.bubble.id === 'cama', null, 'Z facing the bed');
    check('keys: indoors, the bed says "la cama"', true);
    check('keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Round B world (animals.js, world.js)', [['data: words, pictures, pages', data], ['iPad: animals, things, say it back', ipad], ['iPad: doors, people, searches, pages, walking', before], ['desktop: keys', keys]]);
