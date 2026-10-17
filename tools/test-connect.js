// The world, connected (src/connect.js, docs/WORLD_PLAN.md): Tomás's letters across the zones (his bubble, the letter
// with its face, the guide to the bus stop, the world map's letter, delivering, a heart and a star, a reply the other
// way, Tomás at a zone's bus stop on his round); the zones' people as friends (a greeting after their zone's first
// chapter, a gift they like, the 3-heart secret and sticker, Lola's heart in each new place, the Amigos page by place);
// the world's progress (the grown-ups' Story progress by place, the diploma's and the world map's "¡Mi mundo!", stars on
// the world map, a place complete: "¡Completo!"); the dog in every zone (his spots, the guide, on every map and the bus).
// NODE_PATH=$(npm root -g) node tools/test-connect.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

const fresh = (g, o = {}) => g.ev(o => {
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0;
  G.st.newGame(); G.state.name = 'Luz';
  Object.assign(G.state.flags, { opener: true, dogSkip: true, petStart: true, canelo: true, intro: true });
  G.words.meet('hola', 't'); G.demo.skip();
  G.zones.visit('villa'); for (const z of o.visit || ['playa']) G.zones.visit(z);
  for (const w of o.words || []) G.words.meet(w, 't');
  for (const q of o.done || []) G.state.quests[q] = 'done';
  if (o.day != null) G.state.wm.day = o.day;
  G.state.world.lola = Object.assign({ met: true }, o.lola || {});
  G.goto(o.map || 'villa', o.x == null ? 20 : o.x, o.y == null ? 13 : o.y, 'down');
}, o);
async function drv(g, done, what, o) {
  try { await g.drive(done, what, o); } catch (e) {
    await g.shot('stuck');
    console.log('    (stuck: ' + await g.ev(() => JSON.stringify({ top: G.top().constructor.name, locked: G.field && G.field.locked, map: G.field && G.field.mapId, p: G.field && [G.field.player.x, G.field.player.y], why: (G.guide.goal(G.field) || {}).why })) + ')');
    throw e;
  }
}
async function tapNpc(g, id, dx = 1, dy = 0) {
  await g.ev(([id, dx, dy]) => { const n = G.field.npc(id), p = G.field.player; n.home = [n.x, n.y]; p.x = n.x + dx; p.y = n.y + dy; p.dir = dx > 0 ? 'left' : dx < 0 ? 'right' : dy > 0 ? 'up' : 'down'; G.field.snapCam(); }, [id, dx, dy]);
  await g.frames(4);
  await g.tapTile(...await g.ev(id => { const n = G.field.npc(id); return [n.x, n.y]; }, id));
}
const side = async (g, id) => g.ev(id => { const n = G.field.npc(id), f = G.field; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!f.blocked(n.x + dx, n.y + dy, f.player)) return [dx, dy]; return [0, 1]; }, id);
const talkTo = async (g, id) => { const [dx, dy] = await side(g, id); await tapNpc(g, id, dx, dy); };
const ride = async (g, z) => { await g.ev(z => { G.chapters.scene(G.field, G.zones.ride(G.field, z)); }, z); await g.until(z => G.field && G.zones.of(G.field.mapId) === z && !G.field.locked && G.fade.a === 0 && !G.zones.bus, z, 'the bus to ' + z, 30000); };

// ---------- Tomás's letters ----------
async function letters(browser) {
  const { ctx, g } = await open(browser, 'connect-letters', true);
  try {
    await fresh(g, { visit: ['playa'], words: ['carta', 'gracias'], done: ['playa1', 'playa2', 'playa3'] });
    await g.fieldIdle('villa');
    const a = await g.ev(() => ({ al: G.field.npc('tomas').alert(), can: G.post.canOffer(), pick: G.post.pick('villa') }));
    check('letters: Tomás has a letter (his bubble), for someone at the beach (the only place visited)', a.can && a.al && a.al.icon === 'carta' && a.pick === 'paco', JSON.stringify(a));
    await g.frames(20); await g.shot('tomas_bubble');
    await talkTo(g, 'tomas');
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.show && G.top().opts.show.face === 'paco', null, 'Tomás holding up the letter with Don Paco\'s face');
    await g.frames(20); await g.shot('tomas_letter_for');
    await drv(g, () => free(), 'Tomás\'s letter');
    const b = await g.ev(() => ({ it: G.post.letter(), held: G.carry.held(), day: G.post.state().day, ic: G.errands.bag.icon(G.post.letter()), why: (G.guide.goal(G.field) || {}).why }));
    check('letters: the letter for Don Paco (from Don Pepe) is in your hands, a story thing (not dropped), the corner shows it with his face', b.it && b.it.to === 'paco' && b.it.from === 'pepe' && !b.held && b.ic.letter === 'paco', JSON.stringify(b));
    check('letters: the guide leads to the bus stop (the beach is another place)', /letter to paco \(bus\)/.test(b.why), b.why);
    await g.frames(30); await g.shot('letter_in_hands');
    check('letters: no second letter today', await g.ev(() => !G.post.canOffer() && !G.field.npc('tomas').alert()));
    // the world map shows the letter over the beach
    await g.ev(() => { G.worldMap({ travel: true }); });
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(20); await g.shot('worldmap_letter');
    await g.tapRect(await g.ev(() => G.top().rects().find(r => r.id === 'playa')));
    await g.until(() => G.top() === G.field, null, 'the world map closing');
    await g.ev(() => { G.top().locked = false; });
    await ride(g, 'playa');
    const c = await g.ev(() => ({ why: (G.guide.goal(G.field) || {}).why, al: G.field.npc('paco').alert(), dog: !!G.pet.npc(G.field) && !G.pet.npc(G.field).hidden }));
    check('letters: at the beach the guide points at Don Paco, his bubble shows the letter; the dog came on the bus', c.why === 'letter to paco' && JSON.stringify(c.al).includes('"letter":"paco"') && c.dog, JSON.stringify(c));
    await g.frames(10); await g.shot('paco_letter_bubble');
    const h0 = await g.ev(() => ({ h: G.hearts.get('paco'), s: G.state.stars }));
    await talkTo(g, 'paco');
    await drv(g, () => G.top().constructor.name === 'TextBox' && G.top().opts.show && G.top().opts.show.face === 'pepe', '"¡Es de Pepe!" with his face');
    await g.frames(10); await g.shot('es_de_pepe');
    await drv(g, () => free(), 'delivering');
    const d = await g.ev(() => ({ h: G.hearts.get('paco'), s: G.state.stars, n: G.post.state().n, it: G.post.letter(), why: (G.guide.goal(G.field) || {}).why }));
    check('letters: delivered: a heart for Don Paco (and one for his greeting) and a star', d.h >= h0.h + 1 && G_ok(d, h0) && d.n === 1, JSON.stringify([h0, d]));
    check('letters: the other way: Don Paco writes back to Don Pepe (in your hands), the guide leads to the bus stop', d.it && d.it.to === 'pepe' && d.it.from === 'paco' && /letter to pepe \(bus\)/.test(d.why), JSON.stringify(d));
    await ride(g, 'villa');
    const e = await g.ev(() => ({ why: (G.guide.goal(G.field) || {}).why }));
    check('letters: back in Villa Sol the guide points at Don Pepe', e.why === 'letter to pepe', JSON.stringify(e));
    const hp = await g.ev(() => G.hearts.get('pepe'));
    await talkTo(g, 'pepe');
    await drv(g, () => free() && !G.post.letter(), 'the reply to Don Pepe');
    check('letters: Don Pepe gets his letter: a heart, no reply this time', await g.ev(hp => G.hearts.get('pepe') === hp + 1 && G.post.state().n === 2 && !G.post.letter(), hp));
    // the next day: Tomás has another, for someone not written to yet (a second place visited: the forest)
    await g.ev(() => { G.zones.visit('bosque'); G.state.wm.day = 2; });
    const f2 = await g.ev(() => ({ can: G.post.canOffer(), pick: G.post.pick('villa') }));
    check('letters: a new day, a new letter, for someone not written to yet', f2.can && f2.pick && f2.pick !== 'paco', JSON.stringify(f2));
    // Tomás on his round: an odd day he waits at a place's bus stop, and his letter there goes to another place
    await g.ev(() => { G.state.wm.day = 3; });
    const tz = await g.ev(() => G.post.tomasIn());
    check('letters: some days Tomás is on his round at a place you\'ve been to', ['playa', 'bosque'].includes(tz), String(tz));
    await g.ev(tz => { const t = G.post.tomasAt[tz]; G.goto(t.map, t.at[0], t.at[1] + 2, 'up'); }, tz);
    await g.fieldIdle(tz);
    check('letters: Tomás is there by the bus stop, his bubble shows a letter', await g.ev(() => { const n = G.field.npc('tomas'); return !!n && !!n.alert() && n.alert().icon === 'carta'; }));
    await g.frames(10); await g.shot('tomas_on_his_round');
    await talkTo(g, 'tomas');
    await drv(g, () => free() && !!G.post.letter(), 'Tomás\'s letter on his round');
    const t2 = await g.ev(() => ({ it: G.post.letter(), here: G.zones.of(G.field.mapId) }));
    check('letters: his letter there is for someone in another place (or Lola)', t2.it && !!t2.it.to, JSON.stringify(t2));
    check('letters: ...not someone where he is', await g.ev(() => { const it = G.post.letter(); return G.hearts.ZONE[it.to] !== G.zones.of(G.field.mapId); }));
    check('letters: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the zones' people as friends ----------
async function friends(browser) {
  const { ctx, g } = await open(browser, 'connect-friends', true);
  try {
    await fresh(g, { visit: ['playa', 'bosque'], words: ['mar', 'ola', 'helado', 'concha', 'elsol', 'caliente'], done: ['playa1'], map: 'playa', x: 12, y: 8 });
    await g.fieldIdle('playa');
    check('friends: every zone person and Lola have hearts, a gift they like and words to greet with', await g.ev(() => ['paco', 'marina', 'nieves', 'tere', 'elena', 'lupe', 'ana', 'pablo', 'chuy', 'abuela', 'abuelo', 'bebe', 'lucho', 'mateo', 'lola'].every(n => G.hearts.WHO.includes(n) && G.data.words[G.hearts.LIKES[n]] && (G.hearts.POOLS[n] || []).every(w => G.data.words[w])) && G.hearts.TOWN.length === 12));
    check('friends: the beach\'s people greet after its first chapter; the forest\'s not yet', await g.ev(() => G.hearts.greetsWith('marina') && !G.hearts.greetsWith('elena') && G.hearts.greetsWith('lola')));
    // the greeting: Marina waves, you answer (a heart); then a due word from her pool
    await talkTo(g, 'marina');
    await g.until(() => G.top().constructor.name === 'Choice', null, 'Marina\'s greeting');
    await g.frames(10); await g.shot('marina_greeting');
    await drv(g, () => free(), 'the greeting');
    check('friends: Marina\'s greeting answered: a heart, once today', await g.ev(() => G.hearts.get('marina') === 1 && G.hearts.did('marina', 'greet')));
    // a gift she likes: an ice cream (free, in your hands)
    await g.ev(() => { G.errands.bag.add('helado'); });
    check('friends: holding an ice cream, Marina\'s bubble wants it', await g.ev(() => JSON.stringify(G.field.npc('marina').alert()).includes('helado')));
    await talkTo(g, 'marina');
    await drv(g, () => free() && !G.errands.bag.has('helado'), 'giving the ice cream');
    check('friends: Marina takes the ice cream: a heart', await g.ev(() => G.hearts.get('marina') === 2));
    // 3 hearts: the secret (a rare animal of the beach, in pictures) and the sticker
    await g.ev(() => { const l = G.state.heartlog; l.n.marina = 0; });
    await g.ev(() => { G.state.hearts.marina = 2; G.hearts.add('marina', 1, 'errand'); G.chapters.scene(G.field, G.hearts.milestones('marina')); });
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().opts.show && G.top().opts.show.list, null, 'Marina\'s secret');
    const sec = await g.ev(() => G.top().opts.show.list);
    check('friends: Marina\'s 3-heart secret shows a rare beach animal not found yet (and when)', ['delfin', 'pulpo'].includes(sec[0]), JSON.stringify(sec));
    await g.frames(10); await g.shot('marina_secret');
    await drv(g, () => free(), 'the secret and the sticker');
    check('friends: Marina\'s sticker', await g.ev(() => G.hearts.sticker('marina')));
    // Lola: a heart the first time you meet her in each place
    await g.ev(() => { G.state.world.lola = { met: true }; });
    await talkTo(g, 'lola');
    await drv(g, () => free(), 'Lola at the beach');
    const l1 = await g.ev(() => ({ h: G.hearts.get('lola'), z: Object.keys(G.state.world.lolaZ || {}) }));
    check('friends: Lola gets a heart the first time you meet her at the beach', l1.h >= 1 && l1.z.includes('playa'), JSON.stringify(l1));
    await g.ev(() => G.goto('bosque', 18, 27, 'up'));
    await g.fieldIdle('bosque');
    const lh = await g.ev(() => G.hearts.get('lola'));
    await talkTo(g, 'lola');
    await drv(g, () => free(), 'Lola in the forest');
    const l2 = await g.ev(() => ({ h: G.hearts.get('lola'), z: Object.keys(G.state.world.lolaZ || {}) }));
    check('friends: ...and another in the forest (explore all five: best friends)', l2.h >= lh + 1 && l2.z.includes('bosque'), JSON.stringify([lh, l2]));
    // the Amigos page: a tab per place, Lola on every zone's tab
    await g.ev(() => G.album('amigos'));
    await g.until(() => G.top().constructor.name === 'Album', null, 'the album');
    const am = await g.ev(() => ({ tab: G.top().ftab, L: G.top().friends(), tabs: G.top().ftabs() }));
    check('friends: the Amigos page opens on the forest\'s friends: Elena, Doña Lupe and Lola', am.tab === 'bosque' && am.L.join() === 'elena,lupe,lola' && am.tabs.length === 6, JSON.stringify(am));
    await g.frames(10); await g.shot('amigos_bosque');
    await g.tapRect(await g.ev(() => G.top().ftabRect(1)));
    check('friends: the beach\'s tab: Don Paco, Marina, Doña Nieves, Tere and Lola', await g.ev(() => G.top().ftab === 'playa' && G.top().friends().join() === 'paco,marina,nieves,tere,lola'));
    await g.frames(10); await g.shot('amigos_playa');
    await g.tapRect(await g.ev(() => G.top().ftabRect(0)));
    check('friends: Villa Sol\'s tab: the twelve in town', await g.ev(() => G.top().ftab === 'villa' && G.top().friends().length === 12));
    await g.frames(6); await g.shot('amigos_villa');
    await g.tapRect(await g.ev(() => G.top().ftabRect(5)));
    await g.frames(6); await g.shot('amigos_montana_unvisited');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top() === G.field, null, 'the album closing');
    check('friends: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the world's progress ----------
async function progress(browser) {
  const { ctx, g } = await open(browser, 'connect-progress', true);
  try {
    await fresh(g, { visit: ['playa', 'bosque', 'juegos'], map: 'playa', x: 12, y: 8, done: ['c1', 'c2', 'bosque1'] });
    await g.fieldIdle('playa');
    const p0 = await g.ev(() => ({ s: G.progress.story('playa'), a: G.progress.album('playa'), st: G.progress.stars('playa'), v: G.progress.visitedCount() }));
    check('progress: the beach\'s story (3 chapters), album and stars', p0.s.of === 3 && p0.s.done === 0 && p0.a.of === 7 && p0.st.join() === 'false,false,false' && p0.v === 4, JSON.stringify(p0));
    // the beach complete: its story and its album page -> "¡Completo!" once
    await g.ev(() => { for (const id of G.progress.lineIds('playa')) G.state.quests[id] = 'done'; for (const a of G.zones.def('playa').animals) G.animals.meet(a); });
    await g.until(() => G.top().constructor.name === 'ZoneDone' || G.album.discovering(), null, 'the album cards or the celebration', 30000);
    await drv(g, () => G.top().constructor.name === 'ZoneDone', 'the new animals\' cards');
    await g.frames(40); await g.shot('zone_done');
    await drv(g, () => free(), 'the celebration');
    check('progress: the beach complete: celebrated once (story and album stars)', await g.ev(() => G.progress.celebrated('playa') && G.progress.stars('playa')[0] && G.progress.stars('playa')[1]));
    await g.frames(60);
    check('progress: not celebrated again', await g.ev(() => G.top() === G.field));
    // the world map: stars over the places, the trophy -> "¡Mi mundo!"
    await g.ev(() => { G.worldMap({ travel: true }); });
    await g.until(() => G.top().constructor.name === 'WorldMap', null, 'the world map');
    await g.frames(20); await g.shot('worldmap_stars');
    await g.tapRect(await g.ev(() => G.top().trophyRect()));
    await g.until(() => G.top().constructor.name === 'WorldPage', null, '"¡Mi mundo!"');
    await g.frames(30); await g.shot('mi_mundo');
    await drv(g, () => G.top().constructor.name === 'WorldMap', 'closing "¡Mi mundo!"');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await g.until(() => G.top() === G.field, null, 'the map closing');
    // the grown-ups' Story progress: the town's page, then the world (every place's chapters)
    await g.ev(() => { G.field.locked = true; G.questLog(); });
    await g.until(() => G.top().constructor.name === 'QuestLog', null, 'Story progress');
    await g.frames(4); await g.shot('story_progress');
    await g.tap(160, 120);
    check('progress: a tap turns to the world page', await g.ev(() => G.top().constructor.name === 'QuestLog' && G.top().page === 1));
    await g.frames(10); await g.shot('story_progress_world');
    await g.tap(160, 120);
    await g.until(() => G.top() === G.field, null, 'Story progress closing');
    await g.ev(() => { G.field.locked = false; });
    // the diploma's second page is the world
    await g.ev(() => { G.field.locked = true; G.story.diploma(); });
    await g.until(() => G.top().constructor.name === 'Diploma', null, 'the diploma');
    await g.frames(64); await g.tap(160, 120);
    check('progress: the diploma turns to "¡Mi mundo!"', await g.ev(() => G.top().constructor.name === 'Diploma' && G.top().page === 1));
    await g.frames(64); await g.shot('diploma_world'); await g.tap(160, 120);
    await g.until(() => G.top() === G.field, null, 'the diploma closing');
    await g.ev(() => { G.field.locked = false; });
    check('progress: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog in every zone ----------
async function dog(browser) {
  const { ctx, g } = await open(browser, 'connect-dog', true);
  try {
    await fresh(g, { visit: ['playa', 'bosque', 'juegos', 'abuelos', 'montana'] });
    await g.fieldIdle('villa');
    const maps = await g.ev(() => { const out = []; for (const m in G.maps) { const z = G.zones.of(m), p = G.zones.pathOf(m); if ((z && z !== 'villa') || p) if (!(G.maps[m].npcs || []).some(n => n.id === 'canelo')) out.push(m); } return out; });
    check('dog: he has his place on every zone map and path (he follows you everywhere)', !maps.length, maps.join(','));
    for (const z of ['playa', 'bosque', 'juegos', 'abuelos', 'montana']) {
      await ride(g, z);
      const r = await g.ev(() => { const f = G.field, n = G.pet.npc(f); return { dog: !!n && !n.hidden, spots: (f.def.dogSpots || []).length, goal: (G.zones.goal(f) || {}).why, lola: (f.def.dogSpots || []).every(sp => G.zones.dogReady(sp)) }; });
      check('dog: ' + z + ': the dog came on the bus; his spots here (' + r.spots + '), the guide suggests one', r.dog && r.spots >= 2 && /^dog spot/.test(r.goal || ''), JSON.stringify(r));
      if (z === 'juegos') { await g.frames(20); await g.shot('dog_spot_' + z); }
    }
    check('dog: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

const G_ok = (d, h0) => d.s >= h0.s + 1;
const ONLY = process.env.ONLY;
run('The world, connected', [['Tomás\'s letters', letters], ['the zones\' people as friends', friends], ['the world\'s progress', progress], ['the dog in every zone', dog]].filter(([n, f]) => !ONLY || f.name === ONLY));
