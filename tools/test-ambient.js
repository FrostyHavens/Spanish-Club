// Living town (src/ambient.js): birds that fly off when you come close or tap them and come back later, butterflies,
// the cat on the park fence, Canelo tagging along, townsfolk who look at you, and Tomás's mail round.
//   NODE_PATH=$(npm root -g) node tools/test-ambient.js [screenshot dir]
'use strict';
const { open, check, run } = require('./harness');

// a fresh game in Villa Sol at x, y (Mamá's intro done; flags / quests as given)
async function town(g, x, y, dir, o = {}) {
  await g.ev(([x, y, dir, o]) => {
    G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { intro: true }, o.flags || {}); Object.assign(G.state.quests, o.quests || {});
    G.goto('villa', x, y, dir);
  }, [x, y, dir, o]);
  await g.fieldIdle('villa');
  await g.until(() => G.field.amb, null, 'the town to come alive');
}
// screen point (game px) of something at world px x, y
const onScreen = (g, x, y) => g.ev(([x, y]) => [x - Math.round(G.field.cam.x), y - Math.round(G.field.cam.y)], [x, y]);
// (after the Saludos errand, the first talk of the day starts with their greeting, hearts.js: answered here)
const talking = async (g, who) => {
  await g.until(n => (G.top().constructor.name === 'TextBox' && G.top().opts.name === G.nameOf(n)) || (G.top().constructor.name === 'Choice' && G.top().o.who === n), who, who + ' to talk', 30000);
  if (await g.ev(() => G.top().constructor.name === 'Choice')) {
    await g.ev(() => { G.debug.greeted = G.top().o.who; });
    await g.drive(() => G.top().constructor.name === 'TextBox' && G.top().opts.who === G.debug.greeted, who + ' after the greeting');
  }
};

// ---------- iPad: critters ----------
async function critters(browser) {
  const { ctx, g } = await open(browser, 'amb-critters', true);
  try {
    await town(g, 12, 15, 'down');
    const st = await g.ev(() => {
      const f = G.field, a = f.amb, p = f.player, T = G.TILE, tile = (x, y) => f.map.get(Math.floor(x / T), Math.floor(y / T));
      const view = b => Math.abs(b.x / T - p.x - 0.5) <= 7 && Math.abs(b.y / T - p.y - 0.5) <= 5;
      return {
        birds: a.birds.length, ground: a.birds.every(b => b.st !== 'ground' || '.o,=p'.includes(tile(b.x, b.y))), // (a passer-by may have startled one)
        away: a.birds.every(b => b.st !== 'ground' || Math.abs(Math.floor(b.x / T) - p.x) + Math.abs(Math.floor(b.y / T) - p.y) >= 3), seen: a.birds.some(view),
        pigeons: a.birds.some(b => b.k === 'paloma' && '=p'.includes(tile(b.x, b.y))),
        flies: a.flies.length, flowers: a.flies.every(fl => f.map.get(Math.floor(fl.hx / T), Math.floor(fl.hy / T)) === 'o'),
        cat: a.cat && f.map.get(a.cat.x, a.cat.y), npcs: f.npcs.every(n => !n.ghost),
      };
    });
    check('critters: 8 birds on grass, paths or the plaza, a few tiles away from you', st.birds === 8 && st.ground && st.away, JSON.stringify(st));
    check('critters: some birds in sight as you arrive, pigeons in the plaza', st.seen && st.pigeons, JSON.stringify(st));
    check('critters: 5 butterflies over flowers, a cat on the park fence', st.flies === 5 && st.flowers && st.cat === 'F', JSON.stringify(st));
    check('critters: nobody is a ghost before Canelo is your friend', st.npcs);
    await g.frames(30); await g.shot('town');

    // a tap on a bird: it flies off (with its flock) and the tap still walks you there
    const tgt = await g.ev(() => {
      const f = G.field, a = f.amb, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), [px, py] = [f.player.x * 24 + 12, f.player.y * 24 + 16];
      let b = a.birds.find(b => b.st === 'ground' && Math.hypot(b.x - px, b.y - py) > 64 && b.x - cx > 16 && b.x - cx < 280 && b.y - cy > 40 && b.y - cy < 210);
      if (!b) { b = a.birds[0]; Object.assign(b, { st: 'ground', x: (f.player.x - 4) * 24 + 12, y: f.player.y * 24 + 14 }); } // (15, 15): grass 4 tiles left
      b.t = 1e9; b.act = null; b.z = 0; // hold still for the tap
      return { i: a.birds.indexOf(b), x: b.x - cx, y: b.y - 3 - cy };
    });
    check('critters: a bird to tap', tgt);
    await g.tap(tgt.x, tgt.y);
    check('critters: a tapped bird flies away, and the tap still walks you there', await g.ev(i => G.field.amb.birds[i].st === 'fly' && !!G.field.route, tgt.i));
    await g.frames(12); await g.shot('birds_fly');
    await g.until(i => G.field.amb.birds[i].st === 'away', tgt.i, 'the bird to fly out of sight', 10000);
    check('critters: it flies out of sight', true);

    // ...and comes back later, gliding in far from you
    await g.until(() => !G.field.route && !G.field.player.moving, null, 'the walk to end');
    const gone = await g.ev(() => G.field.amb.birds.map((b, i) => b.st === 'away' && (b.t = 1) && i).filter(i => i !== false));
    await g.until(() => G.field.amb.birds.some(b => b.st === 'land'), null, 'a bird to come back');
    await g.frames(40); await g.shot('birds_land');
    await g.until(() => G.field.amb.birds.every(b => b.st === 'ground' || b.st === 'away'), null, 'the birds to land', 10000);
    // (a walker like Tomás can scare one off again on its way down, so only the ones that landed are checked)
    const back = await g.ev(gone => { const f = G.field, p = f.player, on = gone.filter(i => f.amb.birds[i].st === 'ground'); return { on, ok: on.every(i => { const b = f.amb.birds[i]; return Math.abs(Math.floor(b.x / 24) - p.x) + Math.abs(Math.floor(b.y / 24) - p.y) >= 4; }) }; }, gone);
    check('critters: birds come back and land away from you', gone.length && back.on.length && back.ok, JSON.stringify({ gone, back }));

    // a tap on a butterfly sends it to another flower
    const fly = await g.ev(() => {
      const f = G.field, cx = Math.round(f.cam.x), cy = Math.round(f.cam.y), a = f.amb, p = f.player;
      let k = a.flies.findIndex(fl => fl.x - cx > 16 && fl.x - cx < 280 && fl.y - fl.z - cy > 40 && fl.y - fl.z - cy < 210 && Math.hypot(fl.x - p.x * 24 - 12, fl.y - p.y * 24 - 16) > 40);
      if (k < 0) { k = 0; Object.assign(a.flies[0], { x: cx + 80, y: cy + 150 }); } // none in sight: bring one over
      const fl = a.flies[k]; fl.vx = fl.vy = 0; fl.tx = fl.x; fl.ty = fl.y; fl.t = 1e9; // hold still
      return { k, x: fl.x - cx, y: fl.y - fl.z - cy, hx: fl.hx, hy: fl.hy };
    });
    await g.tap(fly.x, fly.y);
    check('critters: a tapped butterfly flutters off to another flower', await g.ev(o => { const fl = G.field.amb.flies[o.k]; return (fl.hx !== o.hx || fl.hy !== o.hy) && fl.sp > 1; }, fly));

    // the cat: tap it and it meows (and you still walk over)
    await town(g, 12, 15, 'down'); // a few tiles from the cat
    const cat = await g.ev(() => { const c = G.field.amb.cat; return [c.x * 24 + 12, c.y * 24 + 2]; });
    await g.tap(...await onScreen(g, ...cat));
    check('critters: tapping the cat makes it meow, says "el gato / ¡Miau!" (Round B word bubble) and walks you over', await g.ev(() => G.field.amb.cat.happy > 0 && G.world.bubble && G.world.bubble.id === 'gato' && G.world.bubble.cry === '¡Miau!' && !!G.field.route));
    await g.frames(16); await g.shot('cat_meow');
    check('critters: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- iPad: Canelo tags along ----------
async function canelo(browser) {
  const { ctx, g } = await open(browser, 'amb-canelo', true);
  try {
    await town(g, 16, 7, 'right');
    const dog = () => g.ev(() => { const n = G.field.npc('canelo'), p = G.field.player; return { x: n.x, y: n.y, d: Math.abs(n.x - p.x) + Math.abs(n.y - p.y), ghost: !!n.ghost, wander: n.wander, moving: n.moving || n.busy }; });
    await g.ev(() => { const n = G.field.npc('canelo'); n.wander = 0; }); // hold still until we reach him
    await g.tapTile(...await g.ev(() => { const n = G.field.npc('canelo'); return [n.x, n.y]; }));
    await talking(g, 'canelo');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'Canelo');
    check('canelo: after you talk to him he is your friend (saved in the flags)', await g.ev(() => G.state.flags.canelo === true));
    await g.frames(8); await g.shot('canelo_happy');
    let d = await dog();
    check('canelo: he hops for joy, then follows as a ghost', d.ghost && !d.wander && await g.ev(() => G.field.amb.fx.some(e => e.kind === 'heart')), JSON.stringify(d));
    await g.until(() => !G.field.npc('canelo').oy, null, 'the hop to end');

    // walk away by tapping: he trots after you and stays close
    await g.tapTile(13, 12);
    await g.until(() => !G.field.route && !G.field.player.moving && G.field.player.x === 13 && G.field.player.y === 12, null, 'the walk to (13, 12)');
    await g.until(() => { const n = G.field.npc('canelo'), p = G.field.player; return !n.moving && !n.busy && Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 2; }, null, 'Canelo to catch up', 10000);
    d = await dog();
    check('canelo: he followed you across town', d.d >= 1 && d.d <= 2, JSON.stringify(d));
    await g.shot('canelo_follows');
    check('canelo: he never blocks you', await g.ev(() => { const n = G.field.npc('canelo'); return !G.field.blocked(n.x, n.y, G.field.player); }));

    // he waits outside while you visit a house, and is right there when you come out
    await g.tapTile(9, 14);
    await g.until(() => !G.field.route && !G.field.player.moving, null, 'the walk to (9, 14)');
    await g.tapTile(5, 17); // home
    await g.fieldIdle('casa');
    await g.tapTile(...await g.ev(() => { const e = G.maps.casa.exits[0]; return [e.x, e.y]; }));
    await g.fieldIdle('villa');
    d = await dog();
    check('canelo: back outside, he is beside you (not in the doorway)', d.d >= 1 && d.d <= 2 && await g.ev(() => { const n = G.field.npc('canelo'); return !G.field.exitAt(n.x, n.y); }), JSON.stringify(d));
    await g.frames(10); await g.shot('canelo_outside');
    check('canelo: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- iPad: Tomás's mail round ----------
async function tomas(browser) {
  const { ctx, g } = await open(browser, 'amb-tomas', true);
  try {
    await town(g, 25, 5, 'right', { quests: { saludos: 'done' } });
    await g.ev(() => { // note the ground under him, every few frames while he walks
      window.__tom = []; const f = G.field;
      window.__tomT = setInterval(() => { const n = f.npc('tomas'); if (G.field === f && n.moving) window.__tom.push(f.map.get(n.x, n.y)); }, 50);
    });
    await g.until(() => G.field.amb.fx.some(e => e.kind === 'letter'), null, 'Tomás to deliver a letter at the bakery', 30000);
    const road = await g.ev(() => { clearInterval(window.__tomT); return window.__tom.filter(c => ',=p'.includes(c)).length / window.__tom.length; });
    const at = await g.ev(() => { const n = G.field.npc('tomas'); return [n.x, n.y, n.dir]; });
    check('tomas: walks his round to the bakery and slips a letter in the door', at.join() === '28,7,up', at.join());
    check('tomas: keeps to the roads', road > 0.8, 'on the road ' + Math.round(road * 100) + '%');
    await g.frames(8); await g.shot('tomas_letter');
    check('tomas: his "carta" bubble is still up', await g.ev(() => G.field.npc('tomas').alert() === 'carta'));

    // tap him while he walks: you catch up with him and talk
    await g.until(() => G.field.npc('tomas').moving, null, 'Tomás to walk on', 20000);
    await g.frames(4);
    const p = await g.ev(() => { const n = G.field.npc('tomas'), f = G.field; return [n.x * 24 + n.ox + 12 - Math.round(f.cam.x), n.y * 24 + n.oy + 10 - Math.round(f.cam.y)]; });
    await g.tap(...p);
    check('tomas: a tap on him while he walks heads for him', await g.ev(() => G.field.route && G.field.route.npc === G.field.npc('tomas')));
    await talking(g, 'tomas');
    const here = await g.ev(() => { const n = G.field.npc('tomas'); return [n.x, n.y]; });
    await g.frames(90);
    check('tomas: talking stops him', await g.ev(h => { const n = G.field.npc('tomas'); return n.x === h[0] && n.y === h[1] && !n.moving; }, here));
    await g.drive(() => G.top() === G.field && !G.field.locked, 'Tomás\'s errand');
    check('tomas: he gave you the letter errand', await g.ev(() => G.state.quests.carta === 'active'));
    await g.until(h => { const n = G.field.npc('tomas'); return n.x !== h[0] || n.y !== h[1]; }, here, 'Tomás to go on with his round', 15000);
    check('tomas: then goes on with his round', true);
    check('tomas: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- desktop: the same town with the keyboard ----------
async function keys(browser) {
  const { ctx, g } = await open(browser, 'amb-keys', false);
  try {
    // Sofía looks at you when you come close, and turns back when you leave
    await town(g, 16, 20, 'right');
    await g.until(() => G.field.npc('sofia').dir === 'left', null, 'Sofía to look at you', 5000);
    check('keys: a townsperson turns to look at you', true);
    await g.shot('look');
    for (let i = 0; i < 3; i++) { await g.page.keyboard.down('ArrowLeft'); await g.until(x => G.field.player.x < x, 16 - i, 'a step'); await g.page.keyboard.up('ArrowLeft'); await g.until(() => !G.field.player.moving, null, 'the step to end'); }
    await g.until(() => G.field.npc('sofia').dir === 'down', null, 'Sofía to turn back', 5000);
    check('keys: ...and turns back when you walk away', true);

    // a bird ahead flies off as you walk up to it
    await town(g, 4, 22, 'right');
    const i = await g.ev(() => { const b = G.field.amb.birds[0]; Object.assign(b, { st: 'ground', x: 9 * 24 + 12, y: 22 * 24 + 14, z: 0, t: 1e9, act: null }); return 0; });
    await g.page.keyboard.down('ArrowRight');
    await g.until(i => G.field.amb.birds[i].st === 'fly', i, 'the bird to fly off', 8000);
    await g.page.keyboard.up('ArrowRight');
    const far = await g.ev(i => { const b = G.field.amb.birds[i], p = G.field.player; return Math.abs(9 - p.x); }, i);
    check('keys: a bird flies off when you come within about 2 tiles', far >= 1 && far <= 3, 'tiles away: ' + far);

    // A on the cat: a meow, no dialogue
    await town(g, 16, 16, 'down');
    await g.press('z');
    await g.frames(4);
    check('keys: Z facing the cat pets it (a meow, no text box)', await g.ev(() => G.top() === G.field && G.field.amb.cat.happy > 0));

    // Canelo with the keyboard: he follows, and you walk right through him
    await town(g, 5, 18, 'right', { flags: { canelo: true } });
    let d = await g.ev(() => { const n = G.field.npc('canelo'), p = G.field.player; return { d: Math.abs(n.x - p.x) + Math.abs(n.y - p.y), ghost: n.ghost, door: !!G.field.exitAt(n.x, n.y) }; });
    check('keys: a friend already, Canelo is beside you when you arrive', d.ghost && d.d >= 1 && d.d <= 2 && !d.door, JSON.stringify(d));
    await g.ev(() => { const n = G.field.npc('canelo'), p = G.field.player; n.x = p.x + 1; n.y = p.y; n.amb.idle = -1e9; }); // right in front of you
    await g.page.keyboard.down('ArrowRight');
    await g.until(() => G.field.player.x === 6, null, 'a step onto Canelo', 3000).catch(() => {});
    await g.page.keyboard.up('ArrowRight');
    await g.until(() => !G.field.player.moving, null, 'the step');
    check('keys: you walk through Canelo', await g.ev(() => G.field.player.x === 6));
    await g.until(() => { const n = G.field.npc('canelo'), p = G.field.player; return !n.busy && (n.x !== p.x || n.y !== p.y); }, null, 'Canelo to make room', 5000);
    check('keys: ...and he makes room', true);
    await g.page.keyboard.down('ArrowRight');
    await g.until(() => G.field.player.x >= 10, null, 'walking right');
    await g.page.keyboard.up('ArrowRight');
    await g.until(() => { const n = G.field.npc('canelo'), p = G.field.player; return !p.moving && !n.moving && !n.busy && Math.abs(n.x - p.x) + Math.abs(n.y - p.y) <= 2; }, null, 'Canelo to catch up', 8000);
    check('keys: Canelo follows you', true);
    await g.ev(() => { const n = G.field.npc('canelo'), [x, y] = G.field.facing(); n.x = x; n.y = y; n.amb.idle = -1e9; });
    await g.press('z');
    await g.frames(6);
    check('keys: Z on Canelo, a friend: a bark (Round B: "el perro / ¡Guau, guau!" word bubble) and a heart, no text box', await g.ev(() => G.top() === G.field && G.world.bubble && G.world.bubble.id === 'perro' && G.field.amb.fx.some(e => e.kind === 'heart')));
    await g.shot('canelo');
    check('keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Living town (ambient.js)', [['iPad: birds, butterflies, the cat', critters], ['iPad: Canelo tags along', canelo], ['iPad: Tomás\'s mail round', tomas], ['desktop: keyboard', keys]]);
