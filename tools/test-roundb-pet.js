// Round B stage 2a: Canelo as your dog (src/pet.js), hearts (src/hearts.js) and the animal album (src/album.js).
// Mamá gives you Canelo and the Mi perro page and teaches siéntate; tricks are learned in 3 good tries, by voice (a FAKE
// recognizer, as in tools/test-speaking.js) and by tap; care (food, water, the ball, a pat, his bed); hearts rules
// (once-a-day greetings, the daily cap, errands, gifts, 3- and 5-heart surprises, the row over the portrait); voice
// greetings; the album (silhouettes, names and sounds, the count, the full-album party, the Amigos page); keys; and
// everything surviving a save and reload.
//   NODE_PATH=$(npm root -g) node tools/test-roundb-pet.js [screenshot dir]
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
// a game in slot 1 (so it saves), at map m
async function play(g, m, x, y, dir, o = {}) {
  await g.ev(([m, x, y, dir, o]) => {
    G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
    Object.assign(G.state.flags, { intro: true }, o.flags || {}); Object.assign(G.state.quests, { saludos: 'done' }, o.quests || {});
    if (o.pet) Object.assign(G.state.pet, o.pet);
    if (o.hearts) Object.assign(G.state.hearts, o.hearts);
    G.st.begin(1); G.goto(m, x, y, dir);
  }, [m, x, y, dir, o]);
  await g.fieldIdle(m);
  await g.frames(10);
}
const free = g => g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, null, 'the map to be free');
const settle = (g, what) => g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0, what);
const canelo = g => g.ev(() => { const n = G.pet.npc(); return n && [n.x, n.y]; });
async function openMenu(g) {
  await free(g);
  const [x, y] = await canelo(g);
  await g.tapTile(x, y);
  await g.until(() => G.top().constructor.name === 'PetMenu' && G.top().t > 12, null, 'the pet menu');
}
const card = (g, id) => g.ev(id => { const s = G.top(), k = s.cards().findIndex(c => c.id === id); return s.rect(k); }, id);
// tap a card of the pet menu; wait for its animation to finish and the menu to come back (or the map, when closed)
async function tapCard(g, id, o = {}) {
  await g.tapRect(await card(g, id));
  if (o.shotAt) { await g.until(() => { const n = G.pet.npc(); return n && n.pa; }, null, 'Canelo to move'); await g.frames(o.shotAt); await g.shot(o.shot || id); }
}
const waitMenu = async g => { // (a heart surprise may come first: the sticker)
  await g.drive(() => G.top().constructor.name === 'PetMenu', 'back to the menu').catch(e => { throw new Error(e.message + ' ' + g.errors.join(' | ')); });
  await g.until(() => G.top().constructor.name === 'PetMenu' && G.top().t > 12, null, 'the pet menu again');
};

// ---------- iPad: Mamá gives you Canelo; siéntate by voice and by tap; care; hearts; save and reload ----------
async function ipad(browser) {
  const { ctx, g } = await openFake(browser, 'pet-ipad', true);
  try {
    check('pet: the Mi perro page is no longer on the shelf (Mamá hands it over)', await g.ev(() => !Object.values(G.maps.casa.pages || {}).includes('mascota')));
    await play(g, 'casa', 3, 4, 'up');
    check('pet: after the Saludos errand Mamá has a "!" for you', await g.ev(() => G.field.npc('mama').alert() === true && G.pet.startReady()));
    await g.tapTile(3, 2);
    // her greeting first (once a day): answered by voice
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10, null, 'Mamá\'s greeting');
    check('hearts: the first talk of the day starts with a greeting (a G.ask with a mic)', await g.ev(() => /Mamá: ¡\[buenosdias\]|Mamá: ¡\[hola\]/.test(G.top().o.prompt) && !!G.top().mic));
    await g.shot('greeting');
    const st0 = await g.ev(() => G.state.stars);
    const say = await g.ev(() => { const s = G.top(); return s.ch[s.o.answer].word === 'buenosdias' ? 'buenos días' : s.ch[s.o.answer].word === 'bien' ? 'bien' : 'hola'; });
    await g.ev(say => window.__sr.queue.push({ results: [say] }), say);
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.drive(() => G.hearts.get('mama') === 1, 'a heart from Mamá (and the word card)');
    check('hearts: answering the greeting by voice gives Mamá a heart and a speaking star', await g.ev(s => G.state.stars > s && G.hearts.did('mama', 'greet'), st0));
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.who === 'mama', null, 'Mamá talking');
    await g.frames(20); await g.shot('mama_hearts_row');
    check('hearts: her hearts show over her portrait', await g.ev(() => G.top().opts.who === 'mama' && G.hearts.shows('mama')));
    await settle(g, 'Mamá gives you Canelo');
    const s1 = await g.ev(() => ({ mine: G.pet.mine(), page: G.st.hasPage('mascota'), l: G.pet.learning(), tries: G.pet.tries('sientate'), alert: G.field.npc('mama').alert(), n: !!G.pet.npc(), album: G.animals.met('perro') }));
    check('pet: Mamá gives you Canelo, the Mi perro page and his first trick (siéntate, one try done)', s1.mine && s1.page && s1.l === 'sientate' && s1.tries === 1 && s1.n && s1.album, JSON.stringify(s1));
    check('pet: her "!" is gone while he learns', !s1.alert, JSON.stringify(s1));
    await g.frames(30); await g.shot('learning_bubble');

    // the pet menu
    await openMenu(g);
    const m = await g.ev(() => G.top().cards().map(c => c.id + ':' + c.st).join(' '));
    check('menu: tricks (learning siéntate, ven next by Mamá, the rest "?") and the care cards', m === 'sientate:learn ven:next pata:lock salta:lock gira:lock hueso:care galleta:care agua:care pelota:care mimo:care cama:care', m);
    check('menu: it has the mic, and the hand would point at the trick he is learning', await g.ev(() => !!G.top().mic && !!G.top().hintXY()));
    await g.shot('pet_menu');
    // say it straight at the menu: a good try (2/3) and a speaking star
    const st1 = await g.ev(() => G.state.stars);
    await g.ev(() => window.__sr.queue.push({ results: ['siéntate'] }));
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.pet.tries('sientate') === 2, null, 'the second good try');
    check('voice: "siéntate" said at the menu is a good try (2/3) and a speaking star', await g.ev(s => G.state.stars === s + 1 && G.st.saidCount('sientate') === 1, st1));
    await g.frames(30); await g.shot('sit_try2');
    await waitMenu(g);
    // the third: tap its card -> "¡Dile a Canelo!" -> tap the right card
    await tapCard(g, 'sientate');
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10, null, 'the practice question');
    check('tap: the learning card asks "¡Dile a Canelo!" with picture cards and a mic', await g.ev(() => G.top().o.prompt === '¡Dile a Canelo!' && G.top().ch[G.top().o.answer].word === 'sientate' && !!G.top().mic));
    await g.shot('practice_question');
    await g.tapRect(await g.ev(() => G.top().rects()[G.top().o.answer]));
    await g.until(() => G.pet.knows('sientate'), null, 'siéntate learned');
    await g.frames(30); await g.shot('sit_learned');
    await g.until(() => G.top().constructor.name === 'WordCard', null, 'the new word card');
    check('learned: 3 good tries -> siéntate is learned, a "¡Palabra nueva!" and a heart from Canelo', await g.ev(() => G.st.knows('sientate') && !G.pet.learning() && G.hearts.get('canelo') === 1));
    await waitMenu(g);
    check('menu: siéntate is gold now, ven is Mamá\'s next', await g.ev(() => G.top().cards().slice(0, 2).map(c => c.st).join() === 'known,next'));
    // a known trick by tap, and by voice
    await tapCard(g, 'sientate', { shotAt: 30, shot: 'sit' });
    await waitMenu(g);
    await g.ev(() => window.__sr.queue.push({ results: ['siéntate'] }));
    const st2 = await g.ev(() => G.state.stars);
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.top().constructor.name !== 'PetMenu', null, 'the menu to close for the trick');
    await waitMenu(g);
    check('voice: a known trick said again today does it, with no second star', await g.ev(s => G.state.stars === s, st2));
    // care: el hueso (his favourite: the gift heart), then the cap (a new day for the hearts first)
    const c0 = await g.ev(() => { G.state.heartlog.d = '1999-1-1'; return G.hearts.get('canelo'); });
    await tapCard(g, 'hueso', { shotAt: 40, shot: 'eat' });
    await waitMenu(g);
    check('care: el hueso feeds him and is his favourite (a gift heart)', await g.ev(c0 => G.hearts.get('canelo') === c0 + 1 && G.hearts.did('canelo', 'gift'), c0));
    await tapCard(g, 'agua', { shotAt: 40, shot: 'drink' });
    await waitMenu(g);
    await tapCard(g, 'pelota', { shotAt: 22, shot: 'fetch_throw' });
    await g.frames(60); await g.shot('fetch_back');
    await waitMenu(g);
    await tapCard(g, 'mimo', { shotAt: 50, shot: 'pet_hearts' });
    await waitMenu(g);
    const h = await g.ev(() => ({ c: G.hearts.get('canelo'), today: G.state.heartlog.n.canelo, sticker: G.hearts.sticker('canelo') }));
    check('hearts: care hearts stop at the daily cap of 2', h.c === c0 + 2 && h.today === 2, JSON.stringify(h));
    check('hearts: Canelo at 3 hearts gave his sticker', h.sticker, JSON.stringify(h));
    // a care word said: the ball, a star, and the word is learned
    await g.ev(() => window.__sr.queue.push({ results: ['la pelota'] }));
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.top().constructor.name === 'WordCard' || G.st.knows('pelota'), null, 'la pelota learned');
    check('voice: "la pelota" said to Canelo throws it, a speaking star, and the word is learned', await g.ev(() => G.st.saidCount('pelota') === 1 && G.st.knows('pelota')));
    await waitMenu(g);
    // his bed: at home he goes to sleep
    await tapCard(g, 'cama');
    await settle(g, 'Canelo to bed');
    await g.frames(40);
    check('care: la cama at home: he sleeps on his cushion (z z z)', await g.ev(() => G.pet.sleeping() && G.pet.npc().x === G.pet.BED[0] && G.pet.npc().y === G.pet.BED[1]));
    await g.shot('sleeping');
    // Mamá teaches ven
    await free(g);
    check('teach: Mamá\'s thought bubble shows ven next', await g.ev(() => G.field.npc('mama').alert() === 'ven'));
    await g.tapTile(3, 2);
    await settle(g, 'Mamá teaches ven');
    check('teach: Mamá teaches ven next (one try done)', await g.ev(() => G.pet.learning() === 'ven' && G.pet.tries('ven') === 1));
    // save and reload
    await g.ev(() => G.st.saveNow());
    const before = await g.ev(() => JSON.stringify({ p: G.state.pet, h: G.state.hearts, f: G.state.flags.petStart }));
    await g.page.reload();
    await g.until(() => window.G && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.ev(() => { G.st.loadSlot(1); G.goto(G.state.loc.map, G.state.loc.x, G.state.loc.y, G.state.loc.dir); });
    await g.fieldIdle('casa');
    const after = await g.ev(() => JSON.stringify({ p: G.state.pet, h: G.state.hearts, f: G.state.flags.petStart }));
    check('save: Canelo\'s tricks, his bed and everyone\'s hearts survive a reload', before === after, before + ' / ' + after);
    check('save: Canelo is home after the reload', await g.ev(() => !!G.pet.npc()));
    check('ipad: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- every trick's animation, in town; Sofía and Nico teach ----------
async function tricks(browser) {
  const { ctx, g } = await openFake(browser, 'pet-tricks', true);
  try {
    await play(g, 'villa', 19, 13, 'down', { flags: { canelo: true, petStart: true }, quests: { pelota: 'done' }, pet: { tricks: { sientate: 3, ven: 3 } } });
    await g.until(() => !!G.pet.npc() && !G.pet.npc().moving, null, 'Canelo beside you');
    check('teach: Sofía\'s bubble shows dame la pata next', await g.ev(() => G.field.npc('sofia').alert() === 'pata'));
    await g.ev(() => { const [x, y] = G.MAPDATA.villa.pos.sofia; G.field.player.x = x; G.field.player.y = y + 1; G.field.player.dir = 'up'; G.field.snapCam(); });
    await g.frames(10);
    await g.tapTile(...await g.ev(() => G.MAPDATA.villa.pos.sofia));
    await settle(g, 'Sofía teaches la pata');
    check('teach: Sofía teaches dame la pata', await g.ev(() => G.pet.learning() === 'pata' && G.pet.tries('pata') === 1));
    // the other tricks, all known: one screenshot each mid-trick
    await g.ev(() => { Object.assign(G.state.pet.tricks, { pata: 3, salta: 3, gira: 3 }); G.state.pet.learning = null; });
    for (const [id, at] of [['ven', 30], ['pata', 40], ['salta', 24], ['gira', 20]]) {
      await openMenu(g);
      if (id === 'ven') await g.shot('menu_all_tricks');
      await tapCard(g, id, { shotAt: at, shot: 'trick_' + id });
      await waitMenu(g);
      await g.tapBtn(await g.ev(() => G.top().closeXY()));
      await free(g);
    }
    check('tricks: every trick plays and the menu closes with its button', true);
    check('teach: with all five learned nobody teaches more', await g.ev(() => !G.pet.canTeach('nico') && !G.pet.canTeach('sofia')));
    // Nico teaches gira when it's his turn
    await g.ev(() => { G.state.pet.tricks.gira = 0; });
    check('teach: Nico\'s bubble shows gira when it\'s his turn', await g.ev(() => G.field.npc('nico').alert() === 'gira'));
    // a voice greeting in town: Don Pepe
    await g.ev(() => { const [x, y] = G.MAPDATA.villa.pos.pepe; G.field.player.x = x; G.field.player.y = y + 1; G.field.player.dir = 'up'; G.field.snapCam(); });
    await g.frames(6);
    await g.tapTile(...await g.ev(() => G.MAPDATA.villa.pos.pepe));
    await g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 10, null, 'Don Pepe\'s greeting');
    check('greet: Don Pepe greets you first ("Don Pepe: ...")', await g.ev(() => G.top().o.prompt.startsWith('Don Pepe: ')));
    await g.ev(() => { const s = G.top(), w = s.ch[s.o.answer].word; window.__sr.queue.push({ results: [w === 'buenosdias' ? 'buenos días' : w] }); });
    await g.tapRect(await g.ev(() => G.top().micRect()));
    await g.until(() => G.hearts.get('pepe') === 1, null, 'Pepe\'s heart');
    await g.frames(8); await g.shot('pepe_heart_rises');
    await settle(g, 'Don Pepe');
    await g.tapTile(...await g.ev(() => G.MAPDATA.villa.pos.pepe));
    await g.until(() => G.top().constructor.name !== 'Field', null, 'Don Pepe again');
    check('greet: only once a day (the second talk goes straight to him)', await g.ev(() => G.top().constructor.name === 'TextBox'));
    await settle(g, 'Don Pepe again');
    check('tricks: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- hearts rules (page-side), milestones, waving ----------
async function hearts(browser) {
  const { ctx, g } = await open(browser, 'pet-hearts', true);
  try {
    await play(g, 'villa', 8, 9, 'down');
    const r = await g.ev(() => {
      const H = G.hearts, o = {};
      o.api = ['get', 'add', 'canAddToday', 'did', 'today', 'gift', 'greet', 'milestones'].every(k => typeof H[k] === 'function') && H.WHO.length === 12;
      o.a = H.add('rosa', 1, 'care'); o.b = H.add('rosa', 1, 'care'); o.c = H.add('rosa', 1, 'care'); // the cap: 2
      o.can = H.canAddToday('rosa', 'care');
      o.err = H.add('rosa', 2, 'errand'); // errands skip the cap
      o.rosa = H.get('rosa');
      o.g1 = H.add('luna', 1, 'greet'); o.g2 = H.add('luna', 1, 'greet'); // once a day
      o.gift0 = H.gift('pepe', 'manzana'); o.gift1 = H.gift('pepe', 'queso'); o.gift2 = H.gift('pepe', 'queso');
      o.max = H.add('rosa', 9, 'errand'); o.rosa5 = H.get('rosa');
      o.nobody = H.add('lobo', 1, 'care');
      o.today = H.today();
      // a new day: the log starts over
      G.state.heartlog.d = '1999-1-1'; o.newDay = H.canAddToday('luna', 'greet');
      return o;
    });
    check('hearts: the API is there for the errands (get, add, canAddToday, did, today, gift, greet, milestones)', r.api);
    check('hearts: care is capped at 2 a day per person', r.a === 1 && r.b === 1 && r.c === 0 && !r.can, JSON.stringify(r));
    check('hearts: an errand gives +2 even past the cap, and 5 is the most', r.err === 2 && r.rosa === 4 && r.max === 1 && r.rosa5 === 5, JSON.stringify(r));
    check('hearts: a greeting counts once a day; a gift only when it\'s what they like, once a day', r.g1 === 1 && r.g2 === 0 && r.gift0 === 0 && r.gift1 === 1 && r.gift2 === 0, JSON.stringify(r));
    check('hearts: unknown people get nothing; today adds up; a new day starts over', r.nobody === 0 && r.today === 1 + 1 + 2 + 1 + 1 + 1 && r.newDay, JSON.stringify(r));
    // Rosa at 5: her next talk plays the sticker (3) and the photo (5), once
    await g.ev(() => { const n = G.field.npc('rosa'); n.x = 8; n.y = 10; n.wander = 0; });
    await g.tapTile(8, 10);
    await g.drive(() => G.top().constructor.name === 'FriendCard', 'her greeting, to the sticker');
    await g.frames(32); await g.shot('sticker');
    await g.drive(() => G.top().constructor.name === 'FriendCard' && G.top().kind === 'photo', 'to the photo');
    await g.frames(32); await g.shot('photo');
    await settle(g, 'Rosa');
    check('hearts: 3 hearts -> a secret and a sticker; 5 -> a best-friend photo; each once', await g.ev(() => G.hearts.sticker('rosa') && G.hearts.photo('rosa') && G.state.friends.rosa.m3 && G.state.friends.rosa.m5));
    check('hearts: a best friend greets you "¡Mi amig{o/a} {name}!"', await g.ev(() => G.hearts.greeting('rosa') === '¡Mi amig{o/a} {name}!'));
    // 1 heart: they call you by name as you pass
    await g.ev(() => { G.state.hearts.gomez = 1; const n = G.field.npc('gomez'); n.x = 10; n.y = 9; n.wander = 0; G.field.amb.fx = []; });
    await g.ev(() => { G.field.player.x = 10; G.field.player.y = 11; G.field.snapCam(); });
    await g.until(() => G.field.amb.fx.some(e => e.kind === 'say' && e.s === '¡Hola, Luz!'), null, 'Gómez calling your name');
    await g.frames(10); await g.shot('wave');
    check('hearts: with 1 heart they call you by name as you pass', true);
    check('hearts: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the album (taps) ----------
async function album(browser) {
  const { ctx, g } = await open(browser, 'pet-album', true);
  try {
    await play(g, 'villa', 19, 13, 'down');
    await g.ev(() => { ['pato', 'gato', 'rana', 'perro', 'caballo', 'pez', 'gallina'].forEach(id => G.animals.meet(id)); G.state.album.gato.said = true; G.album.count('pato'); });
    await g.tap(310, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the field menu');
    await g.frames(6); await g.shot('menu_with_album');
    await g.tapRect(await g.ev(() => G.top().rect('album')));
    await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.frames(6); await g.shot('album');
    check('album: 7/11 met, a star for the counted duck', await g.ev(() => G.album.metCount() === 7 && G.album.counted('pato') && !G.album.full()));
    await g.ev(() => { window.__speak.length = 0; });
    await g.tapRect(await g.ev(() => G.top().cell(1)));
    await g.until(() => window.__speak.some(s => /gato. ¡Miau!/.test(s.text)), null, 'the cat\'s name and sound');
    check('album: tapping a met card says its name and its sound', true);
    await g.tapRect(await g.ev(() => G.top().cell(5))); // the rabbit: not met
    check('album: an unmet card is a silhouette that only wobbles', await g.ev(() => G.top().hop[5] && G.top().hop[5].no));
    await g.tapRect(await g.ev(() => G.top().cell(11)));
    check('album: the Amigos card opens everyone\'s hearts', await g.ev(() => G.top().page === 'amigos'));
    await g.frames(6); await g.shot('amigos');
    await g.tapBtn(await g.ev(() => G.top().backXY()));
    check('album: back goes back to the animals', await g.ev(() => G.top().page === 'animales'));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    // the whole album: a party, once
    await g.ev(() => G.animals.list().forEach(id => G.animals.meet(id)));
    await g.tapRect(await g.ev(() => G.top().rect('album')));
    await g.until(() => G.top().constructor.name === 'Album', null, 'the album again');
    check('album: all 11 met -> the party and "¡Amiga de los animales!"', await g.ev(() => G.album.full() && G.state.flags.albumFull && G.top().party > 0));
    await g.frames(40); await g.shot('album_full');
    check('album: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- desktop: keys ----------
async function keys(browser) {
  const { ctx, g } = await open(browser, 'pet-keys', false);
  try {
    await play(g, 'villa', 19, 13, 'down', { flags: { canelo: true, petStart: true }, pet: { tricks: { sientate: 3 }, learning: 'ven' } });
    await g.until(() => !!G.pet.npc() && !G.pet.npc().moving && !G.pet.npc().slide, null, 'Canelo');
    await g.ev(() => { const n = G.pet.npc(), p = G.field.player; n.x = p.x; n.y = p.y + 1; n.ox = n.oy = 0; n.amb.idle = 0; p.dir = 'down'; });
    await g.press('z');
    await g.until(() => G.top().constructor.name === 'PetMenu' && G.top().t > 12, null, 'Z facing Canelo opens the menu');
    check('keys: Z facing Canelo opens the pet menu, on the trick he is learning', await g.ev(() => G.top().cards()[G.top().sel].id === 'ven'));
    await g.press('ArrowLeft');
    check('keys: arrows move along the cards', await g.ev(() => G.top().cards()[G.top().sel].id === 'sientate'));
    await g.press('ArrowDown');
    check('keys: down goes to the care row', await g.ev(() => G.top().sel >= 5));
    await g.press('ArrowUp'); await g.press('Enter');
    await g.until(() => !!G.pet.npc().pa && G.pet.npc().pa.k === 'sit', null, 'the trick');
    check('keys: Enter does the trick', true);
    await waitMenu(g);
    await g.press('Escape');
    await free(g);
    check('keys: Esc closes the pet menu', true);
    // the album with keys
    await g.press('x');
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the field menu');
    await g.press('ArrowRight'); await g.press('ArrowRight');
    check('keys: the menu has the album after Misiones', await g.ev(() => G.top().sel === 'album'));
    await g.press('ArrowDown');
    check('keys: down still goes to the gear', await g.ev(() => G.top().sel === 'gear'));
    await g.press('ArrowUp'); await g.press('Enter');
    await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    await g.press('ArrowRight'); await g.press('ArrowDown');
    check('keys: arrows move in the album grid', await g.ev(() => G.top().sel === 5));
    await g.press('Escape');
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'back to the menu');
    check('keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const ONLY = process.env.ONLY;
const ALL = [['iPad: Canelo is your dog (voice and taps)', ipad], ['iPad: every trick, Sofía, a voice greeting', tricks], ['hearts: rules, surprises, waving', hearts], ['iPad: the album', album], ['desktop: keys', keys]];
run('Round B: Canelo, hearts and the album', ONLY ? ALL.filter(s => s[0].includes(ONLY)) : ALL);
