// Pick up and carry (src/carry.js, docs/PLAYTEST_NOTES.md: "I want to be able to pick up stuff"), on an iPad page.
//   NODE_PATH=$(npm root -g) node tools/test-carry.js [screenshot dir]
// Checks: things lie about (the ball, apples under the trees, sticks); a tap walks you there and picks it up; you hold
// it up over your head and the corner shows it (picture + word once met, "?" before: no meeting, the budget untouched;
// a met word is a light encounter); a small stack of one kind, a swap when you pick up another kind; a tap on yourself
// or on the corner puts it down; Canelo fetches the ball and the stick from your hands, eats the bone (his gift heart);
// someone who likes it takes it (a heart), anyone else says who'd love it; things come back (apples after a few
// minutes, the bone the next day, the ball when it's nowhere); what you put down stays (saved).
'use strict';
const path = require('path');
const { run, open, check, OUT } = require('./harness');
const { canvasShot } = require('./naivebot');

const W1 = ['hola', 'perro', 'guau', 'ven', 'gato', 'miau'];
// a game after chapter 2 (day 1's chapters), Canelo yours, on a map
async function setup(g, o = {}) {
  await g.ev(o => {
    G.st.newGame(); G.state.name = 'Luz';
    Object.assign(G.state.flags, { intro: true, canelo: true, petStart: true });
    for (const id of o.done || ['c1', 'c2']) G.state.quests[id] = 'done';
    for (const w of o.words || []) G.words.meet(w, 'test');
    G.state.ch.lastDoneSess = G.words.sess();
    G.goto(o.map || 'villa', o.x, o.y, o.dir || 'down');
  }, Object.assign({ words: W1 }, o));
  await g.fieldIdle(o.map || 'villa');
  await g.ev(() => { if (G.field.banner) G.field.banner.t = 0; });
  await g.frames(20);
}
const free = g => g.until(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, null, 'the map to be free', 30000);
const settle = (g, what) => g.drive(() => G.top() === G.field && !G.field.locked && G.fade.a === 0 && !G.field.player.moving && !G.field.route, what);
const held = g => g.ev(() => { const h = G.carry.held(); return h && { id: h.id, col: h.col, n: h.n }; });
async function tapAndWalk(g, x, y) { await g.tapTile(x, y); await free(g); await g.frames(6); }
async function shot(g, name) { await g.frames(4); await canvasShot(g, path.join(OUT, 'carry_' + name + '.png')); }
// stand beside tile x, y (a free side) and tap what's there; play any talk through
async function tapBeside(g, x, y, what) {
  await g.ev(([x, y]) => {
    const f = G.field, p = f.player;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const nx = x + dx, ny = y + dy;
      if (!f.blocked(nx, ny, p) && !f.exitAt(nx, ny)) { p.x = nx; p.y = ny; p.dir = dir; p.ox = p.oy = 0; f.route = null; f.snapCam(); return; }
    }
  }, [x, y]);
  await g.frames(4);
  await g.tapTile(x, y);
  await g.frames(8);
  await settle(g, what);
}
const npcAt = (g, id) => g.ev(id => { const n = id === 'canelo' ? G.pet.npc(G.field) : G.field.npc(id); return n && [n.x, n.y]; }, id);

async function pickDrop(browser) {
  const { ctx, g } = await open(browser, 'carry', true);
  try {
    await setup(g, { x: 9, y: 19 });
    check('carry: Canelo\'s blue ball lies in front of home, apples under the park\'s apple tree, sticks in the park', await g.ev(() => {
      const f = G.field, b = G.carry.at(f, 7, 19), a = G.carry.at(f, 12, 19), s = G.carry.at(f, 13, 24);
      return b && b.id === 'pelota' && b.col === 'azul' && a && a.id === 'manzana' && s && s.id === 'palo';
    }));
    await shot(g, '01_lying_about');
    const b0 = await g.ev(() => [G.budget.session(), G.words.met('pelota')]);
    await tapAndWalk(g, 7, 19);
    check('carry: a tap on the ball walks you there and picks it up', JSON.stringify(await held(g)) === JSON.stringify({ id: 'pelota', col: 'azul', n: 1 }));
    check('carry: it\'s gone from the ground (the one ball is in your hands)', await g.ev(() => !G.carry.at(G.field, 7, 19)));
    check('carry: its bubble is its picture and "?" (la pelota isn\'t met yet): not met by this, the budget untouched', await g.ev(b0 => {
      const b = G.world.bubble; return !!b && b.id === 'pelota' && b.unk && !G.words.met('pelota') && G.budget.session() === b0[0];
    }, b0));
    check('carry: the corner shows what you hold, with "?" for an unmet word', await g.ev(() => !!G.carry.hud() && G.carry.label('pelota') === '?'));
    await shot(g, '02_holding_ball');
    // put it down: a tap on yourself
    const me = await g.ev(() => [G.field.player.x, G.field.player.y]);
    await g.tapTile(...me); await g.frames(20);
    check('carry: a tap on yourself puts it down in front of you', !(await held(g)) && await g.ev(() => G.state.bag.ground.length === 1 && G.state.bag.ground[0].id === 'pelota'));
    await shot(g, '03_put_down');
    const at = await g.ev(() => [G.state.bag.ground[0].x, G.state.bag.ground[0].y]);
    check('carry: there is one ball: its home spot has no new one while it lies about', await g.ev(() => !G.carry.avail('pelota') && G.state.bag.ground.filter(o => o.id === 'pelota').length === 1));
    await tapAndWalk(g, ...at);
    check('carry: and picked up again where you left it', (await held(g) || {}).id === 'pelota');
    // a met word: picture + word, a light encounter
    await g.ev(() => { G.words.meet('manzana', 'test'); });
    const n0 = await g.ev(() => G.words.rec('manzana').n);
    await tapAndWalk(g, 12, 19);
    check('carry: picking up an apple (met): the ball goes down where the apple was (one kind at a time)', (await held(g) || {}).id === 'manzana' && await g.ev(() => G.state.bag.ground.some(o => o.id === 'pelota' && o.x === 12 && o.y === 19)));
    check('carry: its bubble says "la manzana" with its picture; a light encounter for the word', await g.ev(n0 => { const b = G.world.bubble; return b.id === 'manzana' && !b.unk && G.words.rec('manzana').n > n0; }, n0));
    check('carry: the corner shows the word under its picture', await g.ev(() => G.carry.label('manzana') === 'la manzana'));
    await shot(g, '04_holding_apple');
    // a small stack: two more apples lying about
    await g.ev(() => { const gr = G.state.bag.ground; gr.push({ id: 'manzana', map: 'villa', x: 10, y: 21 }, { id: 'manzana', map: 'villa', x: 11, y: 21 }, { id: 'manzana', map: 'villa', x: 9, y: 21 }); });
    await tapAndWalk(g, 10, 21); await tapAndWalk(g, 11, 21);
    check('carry: a small stack of one kind (three apples)', (await held(g) || {}).n === 3);
    await shot(g, '05_three_apples');
    await tapAndWalk(g, 9, 21);
    check('carry: a fourth one: the three go down there, you hold the new one', (await held(g) || {}).n === 1 && await g.ev(() => G.state.bag.ground.filter(o => o.id === 'manzana' && o.x === 9 && o.y === 21).length === 3));
    // the corner: a tap puts it down
    const r = await g.ev(() => G.carry.hud());
    await g.tap(r.x + 10, r.y + 10); await g.frames(10);
    check('carry: a tap on the thing in the corner puts it down too', !(await held(g)));
    // a stick: no word (a toy): no "?"
    await tapAndWalk(g, 13, 24);
    check('carry: a stick (a toy, no word): no label, no word bubble', (await held(g) || {}).id === 'palo' && await g.ev(() => G.carry.label('palo') === ''));
    // saved: what lies about and what you hold
    const saved = await g.ev(() => { G.st.begin(1); G.st.saveNow(); return JSON.parse(JSON.stringify(G.state.bag)); });
    check('carry: saved with the game (the hands, what lies about, what was taken)', saved.items.some(i => i.id === 'palo') && saved.ground.length >= 4 && !!saved.taken.pelota && !!saved.taken.manzana1);
    check('carry: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function giving(browser) {
  const { ctx, g } = await open(browser, 'carry-give', true);
  try {
    await setup(g, { x: 8, y: 19 });
    await tapAndWalk(g, 7, 19);
    // Canelo: the ball from your hands
    const h0 = await g.ev(() => G.hearts.get('canelo'));
    const dogAt = await npcAt(g, 'canelo');
    await g.tapTile(...dogAt);
    await g.until(() => { const n = G.pet.npc(G.field); return !!n.pa && n.pa.k === 'fetch'; }, null, 'Canelo to fetch', 8000);
    check('give: holding the ball, a tap on Canelo throws it: he fetches it', true);
    check('give: the ball is in the air, not in your hands, while he runs for it', await g.ev(() => !!G.pet.npc(G.field).pa.item && G.pet.npc(G.field).pa.item.col === 'azul'));
    await g.frames(70); await shot(g, '06_fetch');
    await settle(g, 'the fetch');
    check('give: he brings it back: the ball is in your hands again, a heart for Canelo', (await held(g) || {}).id === 'pelota' && await g.ev(h0 => G.hearts.get('canelo') > h0 && G.state.bag.play.n.pelota === 1, h0));
    // a stick: fetched too
    await g.ev(() => { G.state.bag.items = [{ id: 'palo' }]; });
    await g.tapTile(...await npcAt(g, 'canelo'));
    await g.until(() => { const n = G.pet.npc(G.field); return !!n.pa && n.pa.k === 'fetch' && n.pa.item.id === 'palo'; }, null, 'Canelo to fetch the stick', 8000);
    await g.frames(80); await shot(g, '07_fetch_stick');
    await settle(g, 'the stick');
    check('give: a stick is thrown and fetched the same way', (await held(g) || {}).id === 'palo');
    // the bone: he eats it (his favourite: a gift heart)
    await g.ev(() => { G.state.bag.items = [{ id: 'hueso' }]; G.state.heartlog.d = '1999-1-1'; });
    await g.tapTile(...await npcAt(g, 'canelo'));
    await g.until(() => { const n = G.pet.npc(G.field); return !!n.pa && n.pa.k === 'eat'; }, null, 'Canelo to eat', 8000);
    await settle(g, 'the bone');
    check('give: the bone: he eats it (gone from your hands), his gift heart', !(await held(g)) && await g.ev(() => G.hearts.did('canelo', 'gift')));
    // a flower: he sniffs (and sneezes), you keep it
    await g.ev(() => { G.state.bag.items = [{ id: 'flor', col: 'rosa' }]; });
    await g.tapTile(...await npcAt(g, 'canelo'));
    await g.until(() => { const n = G.pet.npc(G.field); return !!n.pa && n.pa.k === 'sniff'; }, null, 'Canelo to sniff', 8000);
    await settle(g, 'the flower');
    check('give: a flower: he sniffs it and you keep it', (await held(g) || {}).id === 'flor');
    // a friend who likes it: Señor Gómez and an apple (a heart); no confirm while sí / no aren't met
    await g.ev(() => { G.state.bag.items = [{ id: 'manzana' }]; G.state.heartlog.d = '1999-1-1'; const n = G.field.npc('gomez'); Object.assign(n, { x: 8, y: 12, ox: 0, oy: 0, home: [8, 12], wander: 0 }); });
    check('give: Gómez likes apples: his bubble shows the apple you hold', await g.ev(() => JSON.stringify(G.field.npc('gomez').alert()).includes('manzana')));
    check('give: the guide points at him (the day\'s play: what you hold, to whoever would love it)', await g.ev(() => /gomez/.test((G.guide.goal(G.field) || {}).why || '')));
    const gm = await g.ev(() => G.hearts.get('gomez'));
    await tapBeside(g, 8, 12, 'the apple for Gómez');
    check('give: he takes it: +1 heart, your hands are empty', !(await held(g)) && await g.ev(gm => G.hearts.get('gomez') > gm && G.hearts.did('gomez', 'gift'), gm));
    // someone who doesn't especially: they say who would love it (Luna's face)
    await g.ev(() => { G.state.bag.items = [{ id: 'manzana' }]; });
    const nico = await npcAt(g, 'nico');
    await g.ev(([x, y]) => { const n = G.field.npc('nico'); Object.assign(n, { x, y, home: [x, y], wander: 0 }); }, nico);
    await g.ev(([x, y]) => { const f = G.field, p = f.player; p.x = x; p.y = y + 1; p.dir = 'up'; f.snapCam(); }, nico);
    await g.frames(4); await g.tapTile(...nico);
    await g.until(() => G.top().constructor.name === 'TextBox' && !!G.top().opts.show && G.top().opts.show.face === 'luna', null, 'Nico\'s "¿Para Luna?"', 8000);
    await g.frames(20); await shot(g, '08_para_luna');
    check('give: Nico doesn\'t take the apple: "¿Para Luna?" with her face', true);
    await settle(g, 'Nico');
    check('give: you still hold it', (await held(g) || {}).id === 'manzana');
    check('give: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function respawn(browser) {
  const { ctx, g } = await open(browser, 'carry-again', true);
  try {
    await setup(g, { x: 12, y: 20 });
    await tapAndWalk(g, 12, 19);
    check('again: the apple is picked: not under the tree for now', await g.ev(() => !G.carry.at(G.field, 12, 19)));
    await g.ev(() => { G.words.addTime(200); });
    check('again: a few minutes of play later another one has fallen', await g.ev(() => { const a = G.carry.at(G.field, 12, 19); return !!a && a.id === 'manzana'; }));
    // the bone at home: one a day
    await g.ev(() => { G.state.bag.items = []; G.goto('casa', 5, 5, 'right'); });
    await g.fieldIdle('casa'); await g.frames(10);
    check('again: a bone lies by Canelo\'s cushion', await g.ev(() => (G.carry.at(G.field, 6, 5) || {}).id === 'hueso'));
    await shot(g, '09_bone_at_home');
    await tapAndWalk(g, 6, 5);
    check('again: picked up (Canelo standing on it or not)', (await held(g) || {}).id === 'hueso');
    await g.ev(() => { G.state.bag.items = []; G.words.addTime(600); });
    check('again: taken, the bone isn\'t back the same day', await g.ev(() => !G.carry.at(G.field, 6, 5)));
    await g.ev(() => { G.words.newSession('night'); });
    check('again: the next morning a new bone is there', await g.ev(() => (G.carry.at(G.field, 6, 5) || {}).id === 'hueso'));
    // the ball: given away (Nico loves it), it's back at home a minute later
    await g.ev(() => { G.goto('villa', 8, 19, 'left'); });
    await g.fieldIdle('villa'); await g.frames(10);
    await tapAndWalk(g, 7, 19);
    await g.ev(() => { G.state.bag.items = []; }); // (as if Nico kept it)
    await g.frames(4);
    check('again: the ball is nowhere: not back at once', await g.ev(() => !G.carry.at(G.field, 7, 19)));
    await g.ev(() => { G.words.addTime(70); });
    check('again: a minute later Canelo\'s ball is back in front of home', await g.ev(() => (G.carry.at(G.field, 7, 19) || {}).col === 'azul'));
    // eggs in the barn, a new pair every day
    await g.ev(() => { G.goto('granja', 10, 3, 'up'); });
    await g.fieldIdle('granja'); await g.frames(10);
    check('again: eggs in the barn\'s hay by the nest boxes', await g.ev(() => (G.carry.at(G.field, 10, 1) || {}).id === 'huevo' && (G.carry.at(G.field, 11, 1) || {}).id === 'huevo'));
    await shot(g, '10_eggs');
    check('again: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Pick up and carry', [['pick up, hold, put down', pickDrop], ['give: Canelo, friends', giving], ['things come back', respawn]]);
