// Review in the world and the town's daily things (src/favores.js, src/errands.js): favores, Luna's palabra del día,
// the morning greeting's due word, Inés's page puzzles, the side jobs, the shops, presents and the flowers, played with
// taps on an iPad page (some answers SPOKEN through a fake recognizer, as in tools/test-speaking.js); and the older
// errands the chapters replaced never open. Screenshots of the key moments go to the shots folder.
//   NODE_PATH=$(npm root -g) node tools/test-review.js [screenshot dir]     (ONLY=favores,jobs to run some)
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
      }, s.delay || 200);
    }
    end() { if (this.ended) return; this.ended = true; this.onend && this.onend({}); }
    stop() { setTimeout(() => this.end(), 40); }
    abort() { setTimeout(() => { if (this.ended) return; this.onerror && this.onerror({ error: 'aborted' }); this.end(); }, 20); }
  }
  window.SpeechRecognition = undefined; window.webkitSpeechRecognition = FakeRecognition;
}
async function openFake(browser, name, touch = true) {
  const { ctx, g } = await open(browser, name, touch);
  await ctx.addInitScript(FAKE);
  await g.page.reload();
  await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  return { ctx, g };
}
// a game in slot 1 (so it saves) at map m, chapters 1..upTo done, their words known (met yesterday); o: quests, hearts, bag
async function play(g, m, x, y, dir, upTo, o = {}) {
  await g.ev(([m, x, y, dir, upTo, o]) => {
    G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
    G.st.begin(1);
    const ids = G.chapters.ids().slice(0, upTo);
    for (const id of ids) { G.state.quests[id] = 'done'; for (const w of G.chapters.def(id).words) { G.words.meet(w, 'test'); G.words.answerRight(w, { firstTry: true, mode: 'text' }); } }
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
    Object.assign(G.state.pet.tricks, { ven: 3, sientate: 3 }, upTo >= 14 ? { pata: 3, salta: 3 } : {}, upTo >= 16 ? { busca: 3 } : {}, upTo >= 17 ? { gira: 3 } : {});
    Object.assign(G.state.quests, o.quests || {});
    if (o.hearts) Object.assign(G.state.hearts, o.hearts);
    if (o.bag) G.state.bag.items = o.bag;
    G.state.ch.lastDoneSess = G.words.sess();
    G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('load'); // (the next day: everything is due)
    G.goto(m, x, y, dir);
  }, [m, x, y, dir, upTo, o]);
  await g.fieldIdle(m);
  await g.frames(10);
}
const free = g => g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, null, 'the map to be free', 30000);
const settle = (g, what) => g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, what);
// stand next to tile x, y (the first free side), facing it
async function beside(g, x, y) {
  await g.ev(([x, y]) => {
    const f = G.field, p = f.player;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const nx = x + dx, ny = y + dy;
      if (!f.blocked(nx, ny, p) && !f.exitAt(nx, ny)) { p.x = nx; p.y = ny; p.dir = dir; p.ox = p.oy = 0; f.route = null; f.snapCam(); return; }
    }
  }, [x, y]);
  await g.frames(4);
}
// walk up to someone (teleport beside them, then tap them) and play the talk through
async function talk(g, id, what) {
  await free(g);
  const at = await g.ev(id => { const n = G.field.npc(id); return n && [n.x, n.y]; }, id);
  if (!at) throw new Error('nobody called ' + id + ' here');
  await beside(g, ...at);
  const at2 = await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id);
  await g.tapTile(...at2);
  await g.until(() => G.top() !== G.field || G.field.locked, null, 'the talk with ' + id);
  await settle(g, what || 'talking to ' + id);
}
// a side job's place: its bubble is up; tap it and play it through
async function spot(g, id, what) {
  await free(g);
  const sp = await g.ev(id => { const s = G.errands.SPOTS.find(s => s.id === id); return s && { at: s.at, on: !!G.errands.spotAt(G.field, s.at[0], s.at[1]) && G.errands.spotAt(G.field, s.at[0], s.at[1]).id === id }; }, id);
  if (!sp || !sp.on) throw new Error('the spot ' + id + ' is not active');
  await beside(g, ...sp.at);
  await g.tapTile(...sp.at);
  await g.until(() => G.top() !== G.field || G.field.locked, null, 'the spot ' + id);
  await settle(g, what || 'the spot ' + id);
}
// answer the question on top by voice (the right answer), and wait for it to close
async function speak(g, text) {
  await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10 && !!G.top().mic && !G.top().won, null, 'a question with a mic');
  const said = text || await g.ev(() => { const s = G.top(), w = G.data.words[s.ch[s.o.answer].word]; return w.es.split(' / ')[0]; });
  const st = await g.ev(() => G.state.stars);
  await g.ev(t => window.__sr.queue.push({ results: [t] }), said);
  await g.tapRect(await g.ev(() => G.top().micRect()));
  await g.until(() => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'the spoken answer');
  return { said, star: await g.ev(s => G.state.stars > s, st) };
}
// (arriving may ask the place's name first: "¿Dónde estás?", chapters.js placeAsk: answered on the way)
const goto = async (g, m, x, y, dir = 'down') => { await g.ev(([m, x, y, dir]) => G.goto(m, x, y, dir), [m, x, y, dir]); await g.until(m => G.field && G.field.mapId === m && G.fade.a === 0, m, 'arriving in ' + m); await g.frames(30); await settle(g, 'arriving in ' + m); await g.frames(6); };
// tap an animal of a kind: stand near it, then tap where it's drawn
async function tapAnimal(g, kind) {
  await free(g);
  const t = await g.ev(kind => { const a = G.animals.find(kind); return a && [Math.floor(a.x / G.TILE), Math.floor(a.y / G.TILE)]; }, kind);
  if (!t) throw new Error('no ' + kind + ' here');
  await g.ev(([x, y]) => {
    const f = G.field, p = f.player;
    for (let r = 1; r < 6; r++) for (const [dx, dy] of [[0, r], [-r, 0], [r, 0], [0, -r], [r, r], [-r, r]]) {
      if (!f.blocked(x + dx, y + dy, p) && !f.exitAt(x + dx, y + dy)) {
        p.x = x + dx; p.y = y + dy; p.ox = p.oy = 0; f.snapCam();
        for (const id of ['nico', 'canelo']) { const n = f.npc(id); if (n) { n.x = p.x; n.y = p.y; n.ox = n.oy = 0; n.hidden = true; setTimeout(() => { n.hidden = false; }, 1500); } } // (followers out of the way of the tap)
        return;
      }
    }
  }, t);
  await g.frames(6);
  await g.until(() => G.input.ready(), null, 'taps to count');
  const pt = await g.ev(kind => { const a = G.animals.find(kind); Object.assign(a, { st: 'idle', t: 1e9 }); return G.animals.screen(a); }, kind);
  await g.tap(...pt, true);
}
const noErrors = (g, name) => check(name + ': no console errors', !g.errors.length, g.errors.join('\n'));

// ---------- favores, the palabra del día, the greeting's due word, Inés's pages ----------
async function favores(browser) {
  const { ctx, g } = await openFake(browser, 'fav');
  try {
    await play(g, 'villa', 15, 13, 'down', 21); // (the story is over: nobody's chapter bubble comes first)
    const list = await g.ev(() => G.favores.today().map(v => v.who + ':' + v.kind + ':' + v.word));
    check('favores: up to three a day, each about a known word, one per person', list.length >= 1 && list.length <= 3 && new Set(list.map(s => s.split(':')[0])).size === list.length && await g.ev(() => G.favores.today().every(v => G.words.stage(v.word) >= 2)), list.join(' '));
    check('favores: their givers show a "?" bubble (the story\'s bubble first, and Luna\'s palabra del día)', await g.ev(() => G.favores.today().every(v => { const n = G.maps.villa.npcs.concat(G.maps.casa.npcs, G.maps.escuela.npcs, G.maps.panaderia.npcs).find(d => d.id === v.who); const a = n && n.alert && n.alert(); return a === 'pregunta' || (v.who === 'luna' && a && a.icon === 'estrella') || !!G.chapters.alert(v.who); })), await g.ev(() => JSON.stringify(G.favores.today())));
    await g.shot('favor_bubbles');
    // do each kind once: force the list so every kind is played
    for (const [who, kind, word] of [['tomas', 'go', 'escuela'], ['nico', 'find', 'conejo'], ['pepe', 'count', 'cuatro'], ['lucia', 'colour', 'amarillo'], ['nico', 'sound', 'croac'], ['mama', 'feel', 'feliz'], ['marta', 'thing', 'galleta']]) {
      await g.ev(([who, kind, word]) => { G.state.fav.list = [{ who, kind, word, done: false, on: false }]; G.state.heartlog = null; }, [who, kind, word]);
      const map = who === 'mama' ? 'casa' : who === 'marta' ? 'panaderia' : 'villa';
      if (await g.ev(() => G.field.mapId) !== map) await goto(g, map, map === 'casa' ? 4 : map === 'panaderia' ? 5 : 15, map === 'villa' ? 13 : 5, 'up');
      const s0 = await g.ev(() => G.state.stars), h0 = await g.ev(who => G.hearts.get(who), who);
      await talk(g, who, 'the favour: ' + kind);
      if (kind === 'go') {
        check('favores: go: Tomás asks to take a letter to a place named by its word only', await g.ev(() => G.state.fav.list[0].on && G.errands.bag.has('carta', { q: 'fav' })));
        await g.ev(() => G.goto('escuela', 6, 7, 'up')); // (walking in: the favour's place)
        await g.until(() => G.field.mapId === 'escuela' && (G.top() !== G.field || G.state.fav.list[0].done), null, 'arriving at the school');
        await g.frames(20); await g.shot('favor_go_arrived');
        await settle(g, 'arriving at the school');
      }
      if (kind === 'find') {
        for (let i = 0; i < 3 && !await g.ev(() => G.top() !== G.field || G.state.fav.list[0].done); i++) { await tapAnimal(g, 'conejo'); await g.frames(20); }
        // (a hopping rabbit can still slip from under the finger on a busy machine: then the tap lands on it directly)
        if (!await g.ev(() => G.top() !== G.field || G.state.fav.list[0].done)) await g.ev(() => { const f = G.field; f.route = G.animals.tapped(f, G.animals.find('conejo', f)); });
        await g.shot('favor_find'); await settle(g, 'the rabbit');
      }
      check('favores: ' + kind + ': done, a star and a heart', await g.ev(([s0, h0, who]) => G.state.fav.list[0].done && G.state.stars > s0 && G.hearts.get(who) > h0, [s0, h0, who]), JSON.stringify(await g.ev(() => G.state.fav.list)));
      if (map !== 'villa') await goto(g, 'villa', 15, 13, 'down');
    }
    // the palabra del día: Luna, once a day
    await goto(g, 'escuela', 6, 5, 'up');
    check('palabra: Luna has a star bubble', await g.ev(() => { const a = G.field.npc('luna').alert(); return !!a && a.icon === 'estrella'; }));
    await g.ev(() => { G.state.heartlog = null; G.hearts.mark('luna', 'greet'); }); // (her greeting is done for today: straight to the palabra)
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('luna'); return [n.x, n.y]; }));
    await g.drive(() => G.top().constructor.name === 'Choice' && G.top().o.show && G.top().t > 10, 'the palabra del día');
    await g.shot('palabra');
    check('palabra: a picture only, its word among four (words, no pictures), and a mic', await g.ev(() => { const s = G.top(); return s.ch.length === 4 && s.ch.every((c, k) => !s.view(k).icon) && !!s.mic && s.o.show === s.ch[s.o.answer].word; }));
    check('palabra: said out loud: a speaking star', (await speak(g)).star);
    await settle(g, 'Luna');
    check('palabra: once a day (no bubble now)', await g.ev(() => G.favores.palabraDone() && !G.field.npc('luna').alert()));
    // Inés's library: a page puzzle that is ready
    await goto(g, 'biblioteca', 5, 5, 'up');
    check('pages: Inés has a page bubble (a page puzzle is ready)', await g.ev(() => { const a = G.field.npc('ines').alert(); return !!a && a.icon === 'pagina'; }));
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('ines'); return [n.x, n.y]; }));
    await settle(g, 'Inés\'s page puzzle');
    check('pages: solved there', await g.ev(() => Object.keys(G.state.pages).length >= 1));
    // the morning greeting asks one due word after the greeting
    await goto(g, 'villa', 15, 13, 'down');
    await g.ev(() => { G.state.heartlog = null; G.state.fav.list = []; });
    const asked = [];
    await g.ev(() => { window.__asked = []; const o = G.ask; G.ask = function* (q) { window.__asked.push(q.who + ':' + (q.choices[q.answer] && q.choices[q.answer].word)); return yield* o(q); }; });
    await talk(g, 'pepe', 'Don Pepe\'s greeting');
    asked.push(...await g.ev(() => window.__asked));
    check('greeting: Don Pepe greets you, then asks one due word from his stall', asked.length >= 2 && /^pepe:(hola|buenosdias)/.test(asked[0]), asked.join(' '));
    noErrors(g, 'favores');
  } finally { await ctx.close(); }
}

// ---------- side jobs, the shops, presents, flowers ----------
async function sideJobs(browser) {
  const { ctx, g } = await openFake(browser, 'jobs');
  try {
    await play(g, 'panaderia', 5, 5, 'up', 15);
    await g.ev(() => { G.state.fav = { day: G.words.day(), list: [], pal: G.words.day() }; }); // (no favours today: the side jobs on their own)
    await g.tapTile(5, 2);
    await g.drive(() => G.top().constructor.name === 'Choice' && G.top().o.mic === true, 'Marta\'s shop');
    await g.frames(8); await g.shot('shop');
    check('shop: "¿Qué quieres?" with pan, galleta and no, and a mic', await g.ev(() => G.top().ch.map(c => c.word).join() === 'pan,galleta,no' && !!G.top().mic));
    check('shop: "el pan" said buys it (with a star)', (await speak(g, 'el pan')).star);
    await settle(g, 'Marta');
    check('shop: bread in the bag', await g.ev(() => G.errands.bag.has('pan', { q: null })));
    await goto(g, 'villa', 36, 20, 'down');
    check('ducks: with bread, the pond has a bubble', await g.ev(() => G.errands.spotAt(G.field, 37, 21).id === 'jobDucks'));
    await spot(g, 'jobDucks', 'feeding the ducks');
    check('ducks: a star for the day', await g.ev(() => G.errands.jobDone('patos') && !G.errands.bag.has('pan')));
    await spot(g, 'jobEgg', 'the egg');
    check('egg: an egg in the bag; Rosa notices it', await g.ev(() => G.errands.bag.has('huevo') && JSON.stringify(G.field.npc('rosa').alert()).includes('huevo')));
    const r0 = await g.ev(() => G.hearts.get('rosa'));
    await talk(g, 'rosa', 'the egg for Rosa');
    check('egg: given to Rosa: a heart, the job done', await g.ev(r0 => G.errands.jobDone('huevo') && G.hearts.get('rosa') > r0 && !G.errands.bag.has('huevo'), r0));
    await spot(g, 'jobWater', 'water at the fountain');
    await goto(g, 'casa', 3, 4, 'left');
    check('water: Canelo\'s bowl is empty: it has a water bubble', await g.ev(() => G.errands.bowlEmpty() && G.errands.spotAt(G.field, 1, 4).id === 'bowl'));
    await spot(g, 'bowl', 'filling the bowl');
    check('water: filled: a star, the bowl full', await g.ev(() => G.errands.jobDone('agua') && !G.errands.bowlEmpty()));
    await goto(g, 'villa', 41, 11, 'down');
    for (let i = 0; i < 3 && !await g.ev(() => G.errands.jobDone('caballo')); i++) { await tapAnimal(g, 'caballo'); await g.frames(10); await settle(g, 'the horse'); }
    check('horse: petted from close by: a star', await g.ev(() => G.errands.jobDone('caballo')));
    await settle(g, 'the horse');
    // presents: an apple from Don Pepe for Profesora Luna
    await talk(g, 'pepe', 'Don Pepe\'s shop');
    check('shop: Don Pepe: an apple (the first card)', await g.ev(() => G.errands.bag.has('manzana', { q: null })));
    await g.ev(() => { G.state.heartlog.d = '1999-1-1'; });
    await goto(g, 'escuela', 6, 5, 'up');
    const h0 = await g.ev(() => G.hearts.get('luna'));
    await talk(g, 'luna', 'a present for Luna');
    check('gift: Luna likes apples: +1 heart', await g.ev(h0 => G.hearts.get('luna') > h0 && G.hearts.did('luna', 'gift') && !G.errands.bag.has('manzana'), h0));
    await goto(g, 'villa', 15, 13, 'down');
    // flowers (after Lucía's chapter): pick a pink one, give it to Lucía
    check('flowers: coloured flowers grow around town (a quiet spot each)', await g.ev(() => G.errands.spotAt(G.field, 8, 12) && G.errands.spotAt(G.field, 8, 12).flower === 'rosa'));
    await g.shot('flowers');
    await g.ev(() => { for (const id of ['gomez', 'rosa']) { const n = G.field.npc(id); if (n) Object.assign(n, { x: 3, y: 14, ox: 0, oy: 0, home: [3, 14], wander: 0 }); } }); // (nobody in the way of the flower)
    await beside(g, 8, 12); await g.tapTile(8, 12);
    await g.drive(() => G.top().constructor.name === 'Choice' && G.top().t > 10, 'the flower');
    check('flowers: "¿De qué color?" (never rojo beside rosa)', await g.ev(() => G.top().ch[G.top().o.answer].word === 'rosa' && !G.top().ch.some(c => c.word === 'rojo')));
    await settle(g, 'the flower');
    check('flowers: a pink flower in the bag', await g.ev(() => G.errands.bag.has('flor', { col: 'rosa' })));
    const l0 = await g.ev(() => G.hearts.get('lucia'));
    await talk(g, 'lucia', 'a flower for Lucía');
    check('gift: Lucía loves pink flowers: +1 heart', await g.ev(l0 => G.hearts.get('lucia') > l0, l0));
    // Misiones: the chapter, the bag, today's side jobs
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the menu');
    await g.tapRect(await g.ev(() => G.top().rect('quest')));
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    await g.frames(10); await g.shot('misiones');
    check('misiones: the next chapter (16) is listed; no older errand', await g.ev(() => { const r = G.top().rows(); return r.length === 1 && r[0].id === 'c16'; }));
    await g.tap(160, 120);
    noErrors(g, 'jobs');
  } finally { await ctx.close(); }
}

// ---------- the older errands never open; the keyboard ----------
async function olderErrands(browser) {
  const { ctx, g } = await openFake(browser, 'older', false);
  try {
    await play(g, 'villa', 36, 21, 'right', 21);
    check('older: none of the older errands opens, with every chapter done', await g.ev(() => !['mercado', 'picnic', 'show', 'flores', 'sonidos', 'cuenta', 'fiestab', 'canelo', 'cansado'].some(G.errands.offer) && !G.data.tailOrder.length));
    check('older: the badge rows are the 21 chapters', await g.ev(() => G.data.badgeOrder.length === 21 && G.data.badgeOrder.every(id => /^c\d+$/.test(id))));
    // keyboard: feed the ducks by keys
    await g.ev(() => { G.state.bag.items = [{ id: 'pan' }]; G.state.jobs = {}; G.field.player.dir = 'right'; });
    await g.press('z');
    await g.drive(() => G.errands.jobDone('patos') && G.top() === G.field && !G.field.locked, 'the ducks by keys');
    check('keys: Z facing the pond feeds the ducks (questions by arrows and Enter)', await g.ev(() => G.errands.jobDone('patos')));
    noErrors(g, 'keys');
  } finally { await ctx.close(); }
}

const SECTIONS = [['favores, palabra, greeting, pages', favores], ['side jobs, shops, presents, flowers', sideJobs], ['older errands, keys', olderErrands]];
const only = (process.env.ONLY || '').split(',').filter(Boolean);
run('Review in the world, side jobs and presents', SECTIONS.filter(([n, fn]) => !only.length || only.some(o => n.toLowerCase().includes(o) || fn.name.toLowerCase().includes(o))));
