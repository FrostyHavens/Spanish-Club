// The older story errands after chapters 1-10 (src/errands.js), the bag, gifts, the shops and the side jobs. (The lost
// Canelo and tired Tomás errands are chapters 7 and 10 now: tools/test-chapters.js.)
// Every errand is played start to finish on an iPad page with taps, with some answers SPOKEN through a fake recognizer
// (as in tools/test-speaking.js); one is saved and reloaded halfway; the unlock order, Misiones, the hint hand's targets
// and a keyboard run are checked too. Screenshots of each errand's key moments go to the shots folder.
//   NODE_PATH=$(npm root -g) node tools/test-roundb-errands.js [screenshot dir]     (ONLY=picnic,show to run some)
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
const CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];
const A_DONE = { mercado: 'done' }; // (with every chapter done: play() below)
// a game in slot 1 (so it saves) at map m; o: flags, quests, pet, hearts, bag, words
async function play(g, m, x, y, dir, o = {}) {
  await g.ev(([m, x, y, dir, o, CHAPTERS]) => {
    G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true, pepeSiNo: true }, o.flags || {});
    if (!o.fresh) CHAPTERS.forEach(id => { G.state.quests[id] = 'done'; });
    Object.assign(G.state.quests, o.quests || {});
    Object.assign(G.state.pet, { tricks: { sientate: 3, ven: 3 } }, o.pet || {});
    if (o.hearts) Object.assign(G.state.hearts, o.hearts);
    if (o.bag) G.state.bag.items = o.bag;
    for (const id of o.learned || []) G.state.words[id] = { learned: true, right: 1, wrong: 0 };
    G.st.begin(1); G.goto(m, x, y, dir);
  }, [m, x, y, dir, o, CHAPTERS]);
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
// a place an errand sends you: its bubble is up; tap it and play it through
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
  await g.until(s => G.top().constructor.name !== 'Choice' || !!G.top().won, null, 'the spoken answer');
  return { said, star: await g.ev(s => G.state.stars > s, st) };
}
// play scenes until a question is on top (then answer it by voice)
const toQuestion = (g, what) => g.drive(() => G.top().constructor.name === 'Choice' && !!G.top().mic && !G.top().won, what);
const quest = (g, id) => g.ev(id => G.state.quests[id], id);
const noErrors = (g, name) => check(name + ': no console errors', !g.errors.length, g.errors.join('\n'));

// reload the page and continue slot 1 (autosave check)
async function reload(g) {
  await g.ev(() => G.st.saveNow());
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
  await g.tap(160, 180);
  await g.until(() => G.top().constructor.name === 'Slots', null, 'the slot screen');
  await g.tapRect(await g.ev(() => G.top().cardRect(0)));
  await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
  await g.frames(10);
}
const goto = async (g, m, x, y, dir = 'down') => { await g.ev(([m, x, y, dir]) => G.goto(m, x, y, dir), [m, x, y, dir]); await g.fieldIdle(m); await g.frames(6); };
// tap an animal of a kind (the first one not yet counted, when counting): stand near it, then tap where it's drawn
async function tapAnimal(g, kind, o = {}) {
  await free(g);
  const t = await g.ev(([kind, o]) => { const f = G.field, a = f.zoo.list.find(a => a.kind === kind && (!o.uncounted || !a._cu)); return a && [Math.floor(a.x / G.TILE), Math.floor(a.y / G.TILE)]; }, [kind, o]);
  if (!t) throw new Error('no ' + kind + ' here');
  await g.ev(([x, y]) => {
    const f = G.field, p = f.player;
    for (let r = 1; r < 6; r++) for (const [dx, dy] of [[0, r], [-r, 0], [r, 0], [0, -r], [r, r], [-r, r]]) {
      if (!f.blocked(x + dx, y + dy, p) && !f.exitAt(x + dx, y + dy)) {
        p.x = x + dx; p.y = y + dy; p.ox = p.oy = 0; f.snapCam();
        for (const id of ['nico', 'canelo']) { const n = f.npc(id); if (n && n.ghost) { n.x = p.x + Math.sign(dx || 1) * 2; n.y = p.y + Math.sign(dy) * 2; n.ox = n.oy = 0; } } // followers out of the way of the tap
        return;
      }
    }
  }, t);
  await g.frames(6);
  const pt = await g.ev(([kind, o]) => { const f = G.field, a = f.zoo.list.find(a => a.kind === kind && (!o.uncounted || !a._cu)); if (a && a.kind === 'pez') G.animals.jump(a, f); return a && G.animals.screen(a); }, [kind, o]);
  if (kind === 'pez') await g.frames(12);
  await g.until(() => G.input.ready(), null, 'taps to count');
  // (it holds still for the tap: a hopping rabbit used to slip out from under the finger now and then)
  const pt2 = await g.ev(([kind, o]) => { const f = G.field, a = f.zoo.list.find(a => a.kind === kind && (!o.uncounted || !a._cu)); if (a && a.kind !== 'pez' && a.st !== 'swim') Object.assign(a, { st: 'idle', t: 1e9 }); return a && G.animals.screen(a); }, [kind, o]);
  await g.tap(...(pt2 || pt), true);
}

// ---------- 2: El día de campo (with a save and reload halfway) ----------
async function errandPicnic(browser) {
  const { ctx, g } = await openFake(browser, 'e2-picnic');
  try {
    await play(g, 'villa', 7, 9, 'up', { quests: Object.assign({}, A_DONE) });
    check('picnic: unlocked (mercado done): Rosa shows a basket', await g.ev(() => G.field.npc('rosa').alert() === 'canasta'));
    await g.shot('rosa_basket');
    await talk(g, 'rosa', 'Rosa\'s picnic');
    check('picnic: started; Marta and Don Pepe have bubbles; the hay and the pail too', await g.ev(() => G.st.active('picnic') && G.field.npc('pepe').alert() === 'queso' && G.errands.spotAt(G.field, 1, 7).id === 'egg' && G.errands.spotAt(G.field, 39, 12).id === 'milk'));
    await talk(g, 'pepe', 'Don Pepe: the cheese');
    check('picnic: Don Pepe: el queso (and how many: uno) in the bag', await g.ev(() => G.errands.bag.has('queso', { q: 'picnic' })));
    await spot(g, 'egg', 'the hay by the hens');
    await beside(g, 39, 12); await g.frames(8); await g.shot('pail');
    await spot(g, 'milk', 'the goat\'s pail');
    // the bakery: by voice
    await goto(g, 'panaderia', 5, 5, 'up');
    check('picnic: Marta\'s bubble shows bread', await g.ev(() => G.field.npc('marta').alert() === 'pan'));
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('marta'); return [n.x, n.y]; }));
    await toQuestion(g, 'Marta');
    if (await g.ev(() => G.top().ch[G.top().o.answer].word !== 'pan')) { await speak(g); await toQuestion(g, 'Marta: bread'); }
    check('picnic: "el pan" said at the bakery', (await speak(g, 'el pan')).star);
    await settle(g, 'the bakery');
    const mid = await g.ev(() => ({ bag: G.state.bag.items.map(i => i.id).join(), f: JSON.stringify(G.errands.fl('picnic')) }));
    await reload(g);
    const after = await g.ev(() => ({ bag: G.state.bag.items.map(i => i.id).join(), f: JSON.stringify(G.errands.fl('picnic')) }));
    check('picnic: saved and reloaded halfway: the bag and the errand\'s steps are kept', mid.bag === after.bag && mid.f === after.f && after.bag.split(',').length === 4, JSON.stringify({ mid, after }));
    await goto(g, 'villa', 17, 12, 'up');
    await g.frames(10); await g.shot('bag_hud');
    await spot(g, 'water', 'the fountain');
    check('picnic: five foods; Rosa has a "!"', await g.ev(() => G.state.bag.items.filter(i => i.q === 'picnic').length === 5 && G.field.npc('rosa').alert() === true));
    await talk(g, 'rosa', 'the picnic').catch(() => {});
    await free(g).catch(() => {});
    if (!await g.ev(() => G.st.done('picnic'))) {
      // (talk() settles everything: check the scene ran)
      throw new Error('the picnic did not finish ' + await g.ev(() => JSON.stringify(G.errands.fl('picnic'))));
    }
    await g.frames(10); await g.shot('picnic_blanket');
    check('picnic: done: the foods are on the blanket in the park, none left in the bag', await g.ev(() => !G.state.bag.items.length && G.field.picnic && G.field.picnic.food.length === 5 && G.field.player.y === 21));
    noErrors(g, 'picnic');
  } finally { await ctx.close(); }
}

// ---------- 3: El show de perros ----------
async function errandShow(browser) {
  const { ctx, g } = await openFake(browser, 'e3-show');
  try {
    await play(g, 'villa', 18, 22, 'up', { quests: Object.assign({}, A_DONE) });
    check('show: Sofía shows a ribbon', await g.ev(() => G.field.npc('sofia').alert() === 'cinta'));
    await talk(g, 'sofia', 'the dog show');
    check('show: started; Sofía now teaches dame la pata (the show needs it)', await g.ev(() => G.st.active('show') && G.field.npc('sofia').alert() === 'pata'));
    await talk(g, 'sofia', 'learning dame la pata');
    check('show: dame la pata is being learned', await g.ev(() => G.pet.learning() === 'pata'));
    await talk(g, 'sofia', 'a reminder');
    check('show: Misiones ticks the tricks already known', await g.ev(() => G.errands.parts('show').map(p => p.done).join() === 'true,false,false,false'));
    await g.ev(() => { G.state.pet.tricks.pata = 3; G.state.pet.tricks.salta = 3; G.state.pet.learning = null; });
    check('show: tricks ready: Nico shows his cat', await g.ev(() => G.field.npc('nico').alert() === 'gato'));
    await talk(g, 'nico', 'Nico\'s cat');
    await talk(g, 'sofia', 'show time').catch(e => { throw e; });
    check('show: done', await g.ev(() => G.st.done('show')));
    noErrors(g, 'show');
  } finally { await ctx.close(); }
}
// the show again, by voice, with screenshots
async function errandShowVoice(browser) {
  const { ctx, g } = await openFake(browser, 'e3-showvoice');
  try {
    await play(g, 'villa', 18, 22, 'up', { quests: Object.assign({ show: 'active' }, A_DONE), pet: { tricks: { sientate: 3, ven: 3, pata: 3, salta: 3 } }, flags: { e_show: { nico: 1 } } });
    const at = await g.ev(() => { const n = G.field.npc('sofia'); return [n.x, n.y]; });
    await beside(g, ...at); await g.tapTile(...at);
    await g.drive(() => G.top().constructor.name === 'Choice' && G.top().o.prompt === '¡Dile a Canelo!' && !G.top().won, 'the first trick');
    await g.frames(10); await g.shot('show_trick');
    check('show: Luna calls siéntate; said to Canelo by voice', (await speak(g, 'siéntate')).star);
    await g.until(() => { const n = G.pet.npc(); return n && n.pa; }, null, 'Canelo sitting');
    await g.frames(20); await g.shot('show_sit');
    await g.drive(() => G.top().constructor.name === 'Choice' && /color/.test(G.top().o.prompt) && !G.top().won, 'the ribbon');
    check('show: the ribbon\'s colour, by voice', (await speak(g, 'azul')).star);
    await g.drive(() => G.top().constructor.name === 'TextBox' && /campeón/.test(G.top().pages ? JSON.stringify(G.top().pages) : JSON.stringify(G.top().lines || '')), 'the champion').catch(() => {});
    await g.shot('show_champion');
    await settle(g, 'the end of the show');
    check('show: done, the audience back in their places', await g.ev(() => G.st.done('show') && G.field.npc('rosa').x !== 13 && !G.field.npc('luna_show')));
    noErrors(g, 'show voice');
  } finally { await ctx.close(); }
}

// ---------- 5: ¿Cuántos animales? ----------
async function errandCuenta(browser) {
  const { ctx, g } = await openFake(browser, 'e5-cuenta');
  try {
    await play(g, 'escuela', 6, 4, 'up', { quests: Object.assign({ picnic: 'done', show: 'done', flores: 'done', sonidos: 'done' }, A_DONE) });
    check('cuenta: unlocked after flores and sonidos', await g.ev(() => G.field.npc('luna').alert() === 'pregunta'));
    await g.tapTile(6, 2); await settle(g, 'Luna\'s count');
    await goto(g, 'villa', 37, 19, 'down');
    for (const [k, n] of [['pato', 3], ['gallina', 2], ['caballo', 1], ['cabra', 1], ['conejo', 1], ['rana', 1]]) {
      for (let i = 0; i < n; i++) {
        for (let tries = 0; tries < 3; tries++) { // (a tap that missed a moving animal is tried again)
          const c0 = await g.ev(k => G.errands.fl('cuenta').n[k] | 0, k);
          await tapAnimal(g, k, { uncounted: true });
          await g.frames(8);
          if (await g.ev(([k, c0]) => (G.errands.fl('cuenta').n[k] | 0) > c0, [k, c0])) break;
          await free(g).catch(() => {});
        }
        if (k === 'pato' && i === 1) await g.shot('counting_duck');
      }
      await free(g).catch(() => {});
      check('cuenta: ' + k + ' counted ' + n, await g.ev(([k, n]) => (G.errands.fl('cuenta').n[k] | 0) === n && G.album.counted(k), [k, n]), await g.ev(() => JSON.stringify(G.errands.fl('cuenta').n)));
    }
    await beside(g, 18, 11); await g.tapTile(18, 11); await g.frames(10);
    check('cuenta: the fish counted by tapping the fountain', await g.ev(() => G.errands.fl('cuenta').n.pez === 1));
    await g.shot('clipboard_full');
    await goto(g, 'escuela', 6, 4, 'up');
    await g.tapTile(6, 2);
    await toQuestion(g, 'how many ducks');
    if (await g.ev(() => G.top().ch[G.top().o.answer].word !== 'tres')) { await speak(g); await toQuestion(g, 'how many ducks'); }
    check('cuenta: "tres" (ducks) by voice', (await speak(g, 'tres')).star);
    await settle(g, 'Luna\'s questions');
    check('cuenta: done (diez met)', await g.ev(() => G.st.done('cuenta') && G.st.seen('diez')));
    noErrors(g, 'cuenta');
  } finally { await ctx.close(); }
}

// ---------- 6: ¿Qué dicen? ----------
async function errandSonidos(browser) {
  const { ctx, g } = await openFake(browser, 'e6-sonidos');
  try {
    await play(g, 'villa', 15, 13, 'down', { quests: Object.assign({ picnic: 'done', show: 'done' }, A_DONE) });
    check('sonidos: Nico shows a music note', await g.ev(() => G.field.npc('nico').alert() === 'nota'));
    await talk(g, 'nico', 'Nico\'s game');
    check('sonidos: Nico tags along', await g.ev(() => G.errands.nicoFollows() && G.field.npc('nico').ghost));
    for (const [k, snd] of [['pato', 'cuac'], ['rana', 'croac'], ['cabra', 'la cabra']]) { // (the goat: "¿Quién es?")
      await tapAnimal(g, k);
      if (process.env.DBG) console.log(await g.ev(() => JSON.stringify([G.top().constructor.name, G.field.locked, G.field.route, G.field.player.x, G.field.player.y, G.field.npc('nico') && [G.field.npc('nico').x, G.field.npc('nico').y], G.errands.fl('sonidos'), G.errands.nicoFollows()])));
      await toQuestion(g, 'what the ' + k + ' says');
      if (k === 'pato') { await g.frames(6); await g.shot('sound_question'); }
      check('sonidos: the ' + k + ' says "' + snd + '" (by voice)', (await speak(g, snd)).star);
      await settle(g, 'the next sound');
    }
    // the cat on the park fence, asleep
    await g.ev(() => { const f = G.field; f.player.x = 16; f.player.y = 19; f.snapCam(); f.amb.cat.nap = 900; });
    await g.frames(4);
    const [cx, cy] = await g.ev(() => { const f = G.field, c = f.amb.cat; return [c.x * G.TILE + 12 - Math.round(f.cam.x), c.y * G.TILE - 2 - Math.round(f.cam.y)]; });
    await g.tap(cx, cy);
    await settle(g, 'the cat and the last round');
    if (process.env.DBG) console.log(await g.ev(() => JSON.stringify([G.st.done('sonidos'), G.errands.jobDone('gato'), G.errands.nicoFollows(), G.errands.fl('sonidos'), G.field.amb.cat.nap])));
    check('sonidos: done (the cat woke up: a side-job star too)', await g.ev(() => G.st.done('sonidos') && G.errands.jobDone('gato') && !G.errands.nicoFollows()));
    noErrors(g, 'sonidos');
  } finally { await ctx.close(); }
}

// ---------- 7: Las flores de Lucía ----------
async function errandFlores(browser) {
  const { ctx, g } = await openFake(browser, 'e7-flores');
  try {
    await play(g, 'villa', 26, 14, 'up', { quests: Object.assign({ picnic: 'done', show: 'done' }, A_DONE) });
    check('flores: Lucía looks sad (a "triste" bubble)', await g.ev(() => G.field.npc('lucia').alert() === 'triste'));
    await talk(g, 'lucia', 'Lucía\'s flowers');
    check('flores: started; coloured flowers grow around town; the hand would point at the ones she wants', await g.ev(() => G.errands.spots(G.field).filter(s => s.flower).length === 9 && G.errands.targets(G.field).filter(t => /^flor/.test(t.spot)).length === 6));
    await beside(g, 31, 9); await g.frames(10); await g.shot('flowers');
    await spot(g, 'flor3_11', 'a red flower (not one she wants)');
    check('flores: a red one: "no", not picked', await g.ev(() => !G.errands.bag.has('flor')));
    await spot(g, 'flor8_12', 'pink');
    await beside(g, 31, 9); await g.tapTile(31, 9);
    await g.drive(() => G.top().constructor.name === 'Choice' && /color/.test(G.top().o.prompt) && !G.top().won, 'white');
    check('flores: its colour by voice: "blanca"', (await speak(g, 'blanca')).star);
    await settle(g, 'white');
    await beside(g, 39, 7); await g.frames(10); await g.shot('butterfly');
    await spot(g, 'flor39_7', 'yellow, with the butterfly');
    check('flores: three flowers in the bag, Lucía has a "!"', await g.ev(() => G.state.bag.items.filter(i => i.id === 'flor').length === 3 && G.field.npc('lucia').alert() === true));
    await talk(g, 'lucia', 'the bouquet');
    check('flores: done', await g.ev(() => G.st.done('flores') && !G.errands.bag.has('flor')));
    // a pink flower afterwards: a present Lucía likes
    await g.ev(() => { G.state.heartlog.d = '1999-1-1'; });
    await spot(g, 'flor26_8', 'a pink flower for later');
    const h0 = await g.ev(() => G.hearts.get('lucia'));
    check('gift: Lucía notices the pink flower (a picture bubble)', await g.ev(() => Array.isArray(G.field.npc('lucia').alert())));
    await talk(g, 'lucia', 'a present');
    check('gift: given: a heart, the flower is gone', await g.ev(h0 => G.hearts.get('lucia') > h0 && G.hearts.did('lucia', 'gift') && !G.errands.bag.has('flor'), h0));
    noErrors(g, 'flores');
  } finally { await ctx.close(); }
}

// ---------- 8: La fiesta de los animales ----------
async function errandFiesta(browser) {
  const { ctx, g } = await openFake(browser, 'e8-fiesta');
  try {
    const six = { picnic: 'done', show: 'done', flores: 'done', cuenta: 'done', sonidos: 'done' };
    await play(g, 'escuela', 6, 4, 'up', { quests: Object.assign(six, A_DONE), pet: { tricks: { sientate: 3, ven: 3, pata: 3 } }, hearts: { rosa: 5 } });
    check('fiesta: unlocked after the six older errands: Luna\'s star', await g.ev(() => G.field.npc('luna').alert() === 'estrella'));
    await g.tapTile(6, 2); await settle(g, 'the party errand');
    await goto(g, 'villa', 15, 13, 'down');
    for (const w of ['rosa', 'pepe', 'sofia', 'nico']) await talk(g, w, 'inviting ' + w);
    const lu = await g.ev(() => { const n = G.field.npc('lucia'); return [n.x, n.y]; });
    await beside(g, ...lu); await g.tapTile(...await g.ev(() => { const n = G.field.npc('lucia'); return [n.x, n.y]; }));
    await g.drive(() => G.top().constructor.name === 'Choice' && G.top().ch[G.top().o.answer].word === 'hola' && !G.top().won, 'Lucía\'s invitation');
    check('fiesta: "¡hola!" to invite, by voice', (await speak(g, 'hola')).star);
    await settle(g, 'Lucía invited');
    check('fiesta: five friends invited; the barn has ribbons to hang', await g.ev(() => Object.keys(G.errands.fl('fiestab').inv).length === 5 && G.errands.spotAt(G.field, 41, 4).id === 'ribbons'));
    await spot(g, 'ribbons', 'the ribbons');
    for (const s of ['feedDucks', 'feedHorse', 'feedHens']) await spot(g, s, s);
    await g.frames(20);
    check('fiesta: everyone gathers at the barn', await g.ev(() => G.field.npc('luna_party') && G.field.npc('rosa').x !== 7));
    await beside(g, 41, 4); await g.frames(10); await g.shot('party_waiting');
    await g.tapTile(41, 4);
    await g.drive(() => G.top().constructor.name === 'Photo', 'the party');
    await g.frames(30); await g.shot('group_photo');
    await g.drive(() => G.top().constructor.name === 'Diploma', 'the diploma');
    await g.frames(70); await g.shot('diploma');
    await settle(g, 'after the party');
    check('fiesta: done; the diploma came; Rosa (a best friend) in the photo', await g.ev(() => G.st.done('fiestab') && G.errands.fl('fiestab').photo.includes('rosa')));
    noErrors(g, 'fiesta');
  } finally { await ctx.close(); }
}

// ---------- side jobs, the shops, presents, Misiones ----------
async function sideJobs(browser) {
  const { ctx, g } = await openFake(browser, 'jobs');
  try {
    await play(g, 'panaderia', 5, 5, 'up', { quests: Object.assign({ picnic: 'done' }, A_DONE) });
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
    await g.shot('bowl_empty');
    await spot(g, 'bowl', 'filling the bowl');
    check('water: filled: a star, the bowl full', await g.ev(() => G.errands.jobDone('agua') && !G.errands.bowlEmpty()));
    await goto(g, 'villa', 41, 11, 'down');
    await tapAnimal(g, 'caballo'); await g.frames(10);
    check('horse: petted from close by: a star', await g.ev(() => G.errands.jobDone('caballo')));
    await settle(g, 'the horse');
    // presents: an apple from Don Pepe for Señor Gómez
    await talk(g, 'pepe', 'Don Pepe\'s shop');
    check('shop: Don Pepe: an apple (the first card)', await g.ev(() => G.errands.bag.has('manzana', { q: null })));
    await g.ev(() => { G.state.heartlog.d = '1999-1-1'; });
    const h0 = await g.ev(() => G.hearts.get('gomez'));
    await talk(g, 'gomez', 'a present for Gómez');
    check('gift: Gómez likes apples: +1 heart', await g.ev(h0 => G.hearts.get('gomez') > h0 && G.hearts.did('gomez', 'gift') && !G.errands.bag.has('manzana'), h0));
    // Misiones
    await g.ev(() => { G.field.menuReq = true; });
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the menu');
    await g.tapRect(await g.ev(() => G.top().rect('quest')));
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Misiones');
    await g.frames(10); await g.shot('misiones');
    check('misiones: lists new errands waiting (Sofía\'s show, Tomás...), and today\'s side jobs', await g.ev(() => G.top().rows().some(r => r.st === 'new')));
    noErrors(g, 'jobs');
  } finally { await ctx.close(); }
}

// ---------- unlocking, and the keyboard ----------
async function unlocks(browser) {
  const { ctx, g } = await openFake(browser, 'unlock', false);
  try {
    await play(g, 'villa', 36, 21, 'right', { fresh: true });
    const u = q => g.ev(q => { Object.assign(G.state.quests, q); return G.data.tailOrder.filter(G.errands.offer).join(); }, q);
    check('unlock: nothing during chapters 1-10', await u({ c1: 'done', c2: 'done', c3: 'done', c4: 'done', c5: 'done', c6: 'done', c7: 'done', c8: 'done', c9: 'done' }) === '');
    check('unlock: the market first, after chapter 10', await u({ c10: 'done' }) === 'mercado');
    check('unlock: then the picnic and the show', await u({ mercado: 'done' }) === 'picnic,show');
    check('unlock: flores and sonidos after both', await u({ picnic: 'done', show: 'done' }) === 'flores,sonidos');
    check('unlock: cuenta after those', await u({ flores: 'done', sonidos: 'done' }) === 'cuenta');
    check('unlock: the party after all six', await u({ cuenta: 'done' }) === 'fiestab');
    check('unlock: the lost-Canelo and tired-Tomás errands never start (chapters 7 and 10)', await g.ev(() => !G.errands.offer('canelo') && !G.errands.offer('cansado')));
    check('unlock: one new errand a day: started today, the next waits for tomorrow', await g.ev(() => { G.state.quests.fiestab = undefined; delete G.state.quests.fiestab; G.chapters.tailStarted(); return !G.errands.offer('fiestab'); }));
    // keyboard: buy bread... rather, feed the ducks by keys
    await g.ev(() => { G.state.bag.items = [{ id: 'pan' }]; G.state.jobs = {}; G.field.player.dir = 'right'; });
    await g.press('z');
    await g.drive(() => G.errands.jobDone('patos') && G.top() === G.field && !G.field.locked, 'the ducks by keys');
    check('keys: Z facing the pond feeds the ducks (questions by arrows and Enter)', await g.ev(() => G.errands.jobDone('patos')));
    noErrors(g, 'keys');
  } finally { await ctx.close(); }
}

const SECTIONS = [['2. picnic', errandPicnic], ['3. show', errandShow], ['3b. show by voice', errandShowVoice],
  ['5. cuenta', errandCuenta], ['6. sonidos', errandSonidos], ['7. flores', errandFlores], ['8. fiesta', errandFiesta],
  ['side jobs, shops, presents', sideJobs], ['unlocking, keys', unlocks]];
const only = (process.env.ONLY || '').split(',').filter(Boolean);
run('The older errands (after chapter 10)', SECTIONS.filter(([n, fn]) => !only.length || only.some(o => n.toLowerCase().includes(o) || fn.name.toLowerCase().includes(o))));
