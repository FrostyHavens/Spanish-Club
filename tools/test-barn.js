// The barn you can go into, Nico's hide-and-seek and doors that say why (docs/PLAYTEST_NOTES.md: "the door that was
// locked, I never got to go in there"; "finding the cat on the post"). On an iPad page, by taps:
//   - the barn: in and out through its door; inside, before chapter 7 (la granja not met yet) only pictures and "?"
//     (the banner, the horse, the trough); after chapter 13 everything names itself (the horse, the hens on their
//     perch, the eggs, the trough, the milk can, the apples); a hay bale rustles; the ¿Qué dicen? page puzzle is in here
//   - hide-and-seek: Nico's bubble, the start, only animals whose words are met hide (one in the barn), their own
//     selves on the map are away, Nico's hint (the place's picture), Canelo's trail of paw prints, finding each one by
//     tapping it (a star, its name, a question when it's due), all found (Nico's heart), no new word met; the game
//     waits while a chapter is going on
//   - doors: every exit leads somewhere; the front door before chapter 1 is over (Mamá says why); in chapter 7 walking
//     into the barn while Tomás's find-it waits counts as finding la granja, and the chapter goes on (Canelo comes out)
//   NODE_PATH=$(npm root -g) node tools/test-barn.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// a game at map m, chapters 1..upTo done, their words known (met yesterday)
async function play(g, m, x, y, dir, upTo, o = {}) {
  await g.ev(([m, x, y, dir, upTo, o]) => {
    G.st.erase(1); G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
    G.st.begin(1);
    const ids = G.chapters.ids().slice(0, upTo);
    for (const id of ids) { G.state.quests[id] = 'done'; for (const w of G.chapters.def(id).words) { G.words.meet(w, 'test'); G.words.answerRight(w, { firstTry: true, mode: 'text' }); } }
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
    Object.assign(G.state.pet.tricks, { ven: 3, sientate: 3 });
    Object.assign(G.state.quests, o.quests || {});
    G.state.ch.lastDoneSess = G.words.sess();
    G.debug.dayShift = (G.debug.dayShift || 0) + 1; G.words.newSession('load'); // (the next day)
    G.goto(m, x, y, dir);
  }, [m, x, y, dir, upTo, o]);
  await g.fieldIdle(m);
  await g.frames(10);
}
const free = g => g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, null, 'the map to be free', 30000);
const settle = (g, what) => g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, what);
// tap a thing on the map and wait for its word bubble -> {id, unk}
async function tapThing(g, x, y) {
  await g.ev(() => { G.world.bubble = null; });
  await g.tapTile(x, y);
  await g.until(() => !!G.world.bubble || (G.top() !== G.field), null, 'a word bubble at ' + x + ',' + y);
  const b = await g.ev(() => G.world.bubble && { id: G.world.bubble.id, unk: G.world.bubble.unk });
  await free(g);
  return b;
}
// an animal on the map (world px), to tap it
const tapAnimal = async (g, pick) => {
  const p = await g.ev(pick); if (!p) return null;
  await g.ev(() => { G.world.bubble = null; });
  await g.tap(p[0], p[1]);
  await g.until(() => !!G.world.bubble, null, 'the animal named');
  return g.ev(() => ({ id: G.world.bubble.id, unk: G.world.bubble.unk }));
};

run('the barn, hide-and-seek, doors that say why', [
  ['barn: in and out, before chapter 7 (pictures only)', async browser => {
    const { ctx, g } = await open(browser, 'barn-early', true);
    try {
      await play(g, 'villa', 41, 7, 'up', 6);
      check('early: la granja is not met yet', await g.ev(() => !G.words.met('granja') && !G.words.met('caballo') && !G.words.met('agua')));
      await g.shot('barn_outside');
      await g.tapTile(41, 4); // the barn's door
      await g.until(() => G.field.mapId === 'granja' && G.fade.a === 0, null, 'inside the barn');
      const ban = await g.ev(() => G.field.banner && { text: G.field.banner.text, icon: G.field.banner.icon });
      check('early: inside the barn; its banner is only its picture (la granja not met)', !!ban && ban.text === '' && ban.icon === 'granja', JSON.stringify(ban));
      await free(g); await g.frames(30); await g.shot('barn_inside_early');
      check('early: Canelo came in with you', await g.ev(() => !!G.pet.npc(G.field)));
      check('early: the horse in her stall and three hens (two on the perch)', await g.ev(() => { const h = G.animals.here(); return h.filter(a => a.kind === 'caballo').length === 1 && h.filter(a => a.kind === 'gallina').length === 3 && G.field.zoo.list.filter(a => a.perched).length === 2; }));
      const horse = await tapAnimal(g, () => { const a = G.animals.find('caballo'), [x, y] = G.animals.screen(a); return [x, y]; });
      check('early: the horse is a "?" (its word not met), and meeting it never happens by a tap', horse && horse.id === 'caballo' && horse.unk && !(await g.ev(() => G.words.met('caballo'))), JSON.stringify(horse));
      await free(g);
      const trough = await tapThing(g, 1, 1);
      check('early: the trough is "agua", shown as a "?" (not met)', trough && trough.id === 'agua' && trough.unk, JSON.stringify(trough));
      check('early: nothing in here met a word', await g.ev(() => !G.words.met('agua') && !G.words.met('caballo') && !G.words.met('granja') && !G.words.met('leche')));
      await g.ev(() => { G.world.bubble = null; });
      await g.tapTile(10, 5); // a hay bale: it rustles, no "..." box
      await g.until(() => !!G.field.wig || G.top() !== G.field, null, 'the hay to rustle');
      check('early: a hay bale rustles (no dialogue box)', await g.ev(() => !!G.field.wig && G.top() === G.field));
      await free(g);
      check('early: the ¿Qué dicen? page puzzle lives in the barn now', await g.ev(() => G.maps.granja.pages['6,2'] === 'sonidos' && !Object.values(G.data.pagePlaces.villa).includes('sonidos')));
      await g.tapTile(6, 8); // the way out
      await g.until(() => G.field.mapId === 'villa' && G.fade.a === 0, null, 'back outside');
      check('early: back out in front of the barn', await g.ev(() => G.field.player.x === 41 && G.field.player.y === 5));
      check('early: no console errors', !g.errors.length, g.errors.join('\n'));
    } finally { await ctx.close(); }
  }],
  ['barn: everything names itself (after chapter 13)', async browser => {
    const { ctx, g } = await open(browser, 'barn-late', true);
    try {
      await play(g, 'granja', 6, 6, 'up', 13);
      check('late: the barn\'s banner says its name', await g.ev(() => G.field.banner && G.field.banner.text === 'La granja'));
      await g.frames(30); await settle(g, 'arriving (the place\'s name may be asked)'); await g.frames(20); await g.shot('barn_inside');
      for (const [x, y, id] of [[1, 1, 'agua'], [8, 1, 'huevo'], [5, 1, 'leche'], [5, 4, 'manzana']]) {
        const b = await tapThing(g, x, y);
        check('late: ' + id + ' names itself (the word, not a "?")', b && b.id === id && !b.unk, JSON.stringify(b));
      }
      await g.shot('barn_named');
      const hen = await tapAnimal(g, () => { const a = G.field.zoo.list.find(a => a.perched), [x, y] = G.animals.screen(a); return [x, y]; });
      check('late: a hen on the perch is la gallina', hen && hen.id === 'gallina' && !hen.unk, JSON.stringify(hen));
      await free(g);
      const horse = await tapAnimal(g, () => { const a = G.animals.find('caballo'), [x, y] = G.animals.screen(a); return [x, y]; });
      check('late: the horse is el caballo', horse && horse.id === 'caballo' && !horse.unk, JSON.stringify(horse));
      await free(g);
      check('late: no console errors', !g.errors.length, g.errors.join('\n'));
    } finally { await ctx.close(); }
  }],
  ['hide-and-seek: Nico, the hiders, finding them', async browser => {
    const { ctx, g } = await open(browser, 'seek', true);
    try {
      await play(g, 'villa', 15, 16, 'up', 11);
      await g.ev(() => { const n = G.field.npc('nico'); Object.assign(n, { x: 15, y: 14, wander: 0, home: [15, 14] }); G.state.fav = { day: G.words.day(), list: [], pal: G.words.day() }; });
      check('seek: ready after chapter 11 (cat, duck, goat and hen met), nothing on yet', await g.ev(() => G.seek.ready() && !G.seek.active()));
      check('seek: Nico has the magnifying-glass bubble', await g.ev(() => { const a = G.field.npc('nico').alert(); return !!a && a.icon === 'lupa'; }));
      const met0 = await g.ev(() => G.words.list(1).length);
      await g.tapTile(15, 14);
      await g.until(() => G.top() !== G.field, null, 'Nico to talk');
      await g.drive(() => { const t = G.top(); return t.constructor.name === 'TextBox' && !!t.opts.show && !!t.opts.show.list; }, 'Nico\'s greeting'); // (his greeting and its due word first)
      await g.frames(30); await g.shot('nico_seek');
      await settle(g, 'Nico starts hide-and-seek');
      const s = await g.ev(() => JSON.parse(JSON.stringify(G.state.seek)));
      check('seek: it is on: three animals hiding', s.on && s.list.length === 3, JSON.stringify(s));
      check('seek: only animals whose words are met hide', await g.ev(() => G.state.seek.list.every(h => G.words.met(h.kind))));
      check('seek: one of them is in the barn', await g.ev(() => G.state.seek.list.some(h => G.seek.SPOTS.find(p => p.id === h.spot).map === 'granja')));
      check('seek: their own selves on the map are away (find() skips them)', await g.ev(() => G.state.seek.list.filter(h => ['cabra', 'conejo'].includes(h.kind)).every(h => !G.animals.find(h.kind))));
      check('seek: the cat, if hiding, is off the park fence', await g.ev(() => !G.seek.hiding('gato') || G.field.amb.cat.hid));
      // Nico's hint: the picture of a place
      await g.tapTile(15, 14);
      await g.until(() => G.top().constructor.name === 'TextBox' && !!G.top().opts.show, null, 'Nico\'s hint');
      const hint = await g.ev(() => G.top().opts.show);
      check('seek: asked again, Nico holds up the picture of a hiding place', !!hint && !!hint.icon && G_PLACES.includes(hint.icon), JSON.stringify(hint));
      await settle(g, 'Nico\'s hint');
      // Canelo's trail of paw prints
      await g.ev(() => G.seek.hint());
      await g.until(() => !!G.seek.hints(G.field), null, 'Canelo to sniff out a trail');
      await g.frames(50); await g.shot('canelo_trail');
      check('seek: after a while Canelo sniffs out a trail of paw prints', true);
      // find each one
      const stars0 = await g.ev(() => G.state.stars);
      for (let i = 0; i < 3; i++) {
        const h = await g.ev(i => G.state.seek.list[i], i);
        const sp = await g.ev(id => G.seek.SPOTS.find(p => p.id === id), h.spot);
        await g.ev(([m, x, y]) => { if (m === 'granja') G.goto(m, 6, 6, 'up'); else G.goto(m, x, y + 2, 'up'); }, [sp.map, sp.at[0], sp.at[1]]);
        await g.fieldIdle(sp.map); await g.ev(() => { G.field.banner = null; }); await g.frames(20);
        await g.shot('hiding_' + h.kind + '_' + h.spot);
        const r = await g.ev(() => { const h = G.state.seek.list.find(h => !h.found); return G.seek.where(h); });
        await g.tap(r.x + r.w / 2, r.y + r.h / 2);
        await g.until(() => G.field.locked || G.top() !== G.field, null, 'the find to start');
        await g.frames(20); await g.shot('found_' + h.kind);
        await settle(g, 'finding the ' + h.kind);
        check('seek: tapping the peeking ' + h.kind + ' finds it, its name in the word bubble', await g.ev(k => G.state.seek.list.find(h => h.kind === k).found && (!G.world.bubble || G.world.bubble.id === k), h.kind));
      }
      const end = await g.ev(() => ({ done: G.state.seek.done, stars: G.state.stars, nico: G.hearts.get('nico'), met: G.words.list(1).length, active: G.seek.active() }));
      check('seek: all found: done, a star for each and one for all', end.done && !end.active && end.stars >= stars0 + 4, JSON.stringify(end));
      check('seek: no new word was met by hide-and-seek', end.met === met0, met0 + ' -> ' + end.met);
      check('seek: Nico has no bubble for it any more today', await g.ev(() => !G.seek.alert('nico')));
      // the next day: a new game; it waits while a chapter is going on
      await g.ev(() => { G.debug.dayShift++; G.words.newSession('load'); });
      check('seek: the next day there is a new game', await g.ev(() => !!G.seek.today() && !G.state.seek.on && !G.state.seek.done));
      await g.ev(() => { G.state.seek.on = true; G.state.quests.c12 = 'active'; });
      check('seek: while a chapter is going on nothing hides (the story\'s animals stay where they are)', await g.ev(() => !G.seek.active() && !G.seek.hiding(G.state.seek.list[0].kind) && !G.seek.alert('nico')));
      check('seek: no console errors', !g.errors.length, g.errors.join('\n'));
    } finally { await ctx.close(); }
  }],
  ['doors: every one opens or says why', async browser => {
    const { ctx, g } = await open(browser, 'doors', true);
    try {
      check('doors: every exit of every map leads to a map', await g.ev(() => Object.keys(G.maps).every(m => (G.maps[m].exits || []).every(e => !e.to || !!G.maps[e.to]))));
      check('doors: every door tile in town is an exit (none is only painted on)', await g.ev(() => { const rows = G.maps.villa.rows, out = []; rows.forEach((r, y) => [...r].forEach((c, x) => { if ((c === 'D' || c === 'K') && !G.maps.villa.exits.some(e => e.x === x && e.y === y)) out.push(x + ',' + y); })); return !out.length; }));
      // the front door before chapter 1 is over: Mamá says why (the puppy is hiding: ¿Y el perro?)
      await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; G.state.quests.c1 = 'active'; G.state.ch.step = { c1: 1 }; G.state.finds.perro = { who: 'mama', map: 'casa', at: '3,3', wrong: [], found: false, how: 'find' }; G.goto('casa', 4, 5, 'down'); });
      await g.fieldIdle('casa');
      await g.tapTile(4, 6);
      await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá saying why');
      const line = await g.ev(() => ({ who: G.top().opts.who, text: G.top().lines[0].t || G.top().lines[0] }));
      await g.shot('door_mama_why');
      check('doors: the front door during chapter 1: Mamá says why (¿Y el perro?)', line.who === 'mama' && /perro/.test(JSON.stringify(line)), JSON.stringify(line));
      await settle(g, 'Mamá');
      check('doors: ...and you stay home, off the doorstep', await g.ev(() => G.field.mapId === 'casa' && G.field.player.y === 5));
      // chapter 7: Tomás has said "¡La granja!" (a find-it at the barn's front): walking into the barn's door finds it
      await play(g, 'villa', 41, 7, 'up', 6);
      await g.ev(() => {
        G.chapters.start('c7'); G.state.ch.step.c7 = 8; G.state.ch.data.c7 = { lost: 1 };
        for (const w of ['parque', 'banco', 'fuente']) { G.words.meet(w, 'test'); }
        G.state.finds.granja = { who: 'tomas', map: 'villa', at: '41,5', wrong: ['17,17', '17,5'], found: false, how: 'find', pics: [[41, 5, 'granja']] };
      });
      check('doors: chapter 7 at the barn: its beat waits for la granja to be found', await g.ev(() => G.chapters.beat('c7').auto === 'villa' && !G.intro.found('granja')));
      await g.tapTile(41, 4);
      await g.until(() => G.intro.found('granja'), null, 'the barn found by walking into it');
      await settle(g, 'chapter 7 at the barn');
      const c7 = await g.ev(() => ({ map: G.field.mapId, step: G.state.ch.step.c7, met: G.words.met('granja'), lost: G.state.ch.data.c7.lost }));
      check('doors: walking into the barn found la granja (met), you stay outside, Canelo came out, the chapter went on', c7.map === 'villa' && c7.step >= 9 && c7.met && c7.lost === 0, JSON.stringify(c7));
      await g.shot('c7_canelo_out');
      check('doors: no console errors', !g.errors.length, g.errors.join('\n'));
    } finally { await ctx.close(); }
  }],
]);
const G_PLACES = ['granja', 'panaderia', 'casa', 'biblioteca', 'arbol', 'fuente', 'parque'];
