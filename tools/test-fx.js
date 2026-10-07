// Juice test (src/fx.js and the answer / word-card / dialogue effects in learn.js and ui.js):
// tap ripples (even on a tap a scene eats), dust when starting to walk, the faster typewriter with tap-to-finish,
// wrong picks greying out in place with a boop, the right pick popping with a burst and a chime, the first-try star
// flying to the corner counter, the "¡Palabra nueva!" card, badge confetti, keys still working, and the pool cap.
//   NODE_PATH=$(npm root -g) node tools/test-fx.js [screenshot dir]
'use strict';
const { open, check, run, G_W } = require('./harness');

// start on the map, ready to walk, with every sound effect logged in window.__sfx
async function start(g) {
  await g.ev(() => {
    G.st.newGame(); G.state.name = 'Luz'; G.state.flags.intro = true; G.goto('villa', 5, 18, 'down');
    window.__sfx = []; const sfx = G.audio.sfx; G.audio.sfx = n => { window.__sfx.push(n); sfx(n); };
  });
  await g.fieldIdle('villa');
}
const heard = (g, n) => g.ev(n => window.__sfx.includes(n), n);
// a screenshot of one exact moment: the game stands still (it keeps drawing) while the picture is taken
async function still(g, label) { await g.ev(() => { G.speedMul = 0; }); await g.page.waitForTimeout(60); await g.shot(label); await g.ev(() => { G.speedMul = 1; }); }
// run a question in the field's tasks (like a talk script); window.__r gets G.ask's answer (true = first try)
const ask = (g, q) => g.ev(q => { window.__r = null; G.field.tasks.add((function* () { window.__r = yield* G.ask(q); })()); }, q);
const choiceUp = g => g.until(() => G.top().constructor.name === 'Choice' && G.top().t > 8 && G.input.ready(), null, 'the question');
const cards = (...ids) => ids.map(id => ({ word: id }));

async function touchRun(browser) {
  const { ctx, g } = await open(browser, 'fx-ipad', true);
  try {
    await start(g);
    // a tap: ripple + soft click, and starting to walk puffs dust
    await g.ev(() => { window.__sfx.length = 0; });
    await g.tapTile(10, 21);
    check('fx: a tap leaves a ripple and a soft click', await g.ev(() => G.fx.live('ring') > 0) && await heard(g, 'tap'));
    await g.frames(3);
    check('fx: ...exactly once (one ring, one click)', await g.ev(() => G.fx.live('ring') === 1 && window.__sfx.filter(n => n === 'tap').length === 1), await g.ev(() => JSON.stringify([G.fx.live('ring'), window.__sfx])));
    await g.until(() => G.fx.live('dust') > 0, null, 'a dust puff', 3000);
    check('fx: starting to walk puffs dust', true);
    await still(g, 'ripple_dust');
    await g.until(() => !G.field.route && !G.field.player.moving, null, 'the walk to end');
    // one step at a time keeps puffing only at the start of each walk, not on every step
    check('fx: walking on doesn\'t puff every step', await g.ev(() => G.fx.live('dust') === 0));
    // a tap the scene eats (the menu button) still gets its ripple
    await g.until(() => G.fx.live('ring') === 0, null, 'the old ripple to fade');
    await g.tap(G_W - 16, 16);
    await g.until(() => G.top().constructor.name === 'FieldMenu', null, 'the field menu');
    check('fx: the menu button\'s (eaten) tap gets a ripple too', await g.ev(() => G.fx.live('ring') > 0 && !G.field.route));
    await g.tap(G_W - 16, 16);
    await g.fieldIdle('villa');

    // dialogue: 2 letters a frame; a tap shows the rest (and stays), the next tap goes on
    await g.ev(() => { window.__w = null; G.field.tasks.add((function* () { window.__w = G.say('¡Hola, Luz! Hoy es un día muy bonito en Villa Sol. ¿Vamos al mercado con la abuela Rosa? ¡Hay manzanas y plátanos!'); })()); });
    await g.until(() => G.top().constructor.name === 'TextBox' && G.top().shown > 0, null, 'the dialogue');
    const [s1, f1] = await g.ev(() => [G.top().shown, G.frame]); await g.frames(6);
    const [s2, f2] = await g.ev(() => [G.top().shown, G.frame]), rate = (s2 - s1) / (f2 - f1);
    check('fx: the typewriter shows about 2 letters a frame', rate > 1.5 && rate <= 2.01, 'rate ' + rate.toFixed(2));
    await g.tap(110, 120);
    check('fx: a tap finishes the line and keeps it up', await g.ev(() => G.top().constructor.name === 'TextBox' && G.top().pi === 0 && G.top().shown >= G.top().chars(0, G.top().scroll + 3)));
    await g.frames(12); await still(g, 'textbox_arrow');
    for (let i = 0; i < 4 && !(await g.ev(() => window.__w.done())); i++) await g.tap(110, 120);
    check('fx: the next tap goes on', await g.ev(() => window.__w.done()));
    await g.fieldIdle('villa');

    // a question (cards): a wrong pick greys out in place with a boop; the right one pops with a burst and a chime
    await ask(g, { prompt: '¡[hola]!', layout: 'cards', choices: cards('manzana', 'hola', 'pelota'), answer: 1, learn: 'hola' });
    await choiceUp(g);
    await g.frames(4); await g.shot('choice');
    await g.ev(() => { window.__c = G.top(); window.__sfx.length = 0; });
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    check('fx: a wrong card greys out in place (the same question stays up)', await g.ev(() => G.top() === window.__c && window.__c.ch[0].off && !window.__c.w.done()));
    check('fx: ...with a soft boop and a "¡Casi!" over the card', await heard(g, 'boop') && !(await heard(g, 'error')) && await g.ev(() => G.fx.live('words') === 1));
    await g.frames(4); await still(g, 'choice_wrong');
    await g.until(() => window.__c.miss.t > 8, null, 'the wobble');
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    check('fx: the right card answers at once and stays up to pop', await g.ev(() => G.top() === window.__c && window.__c.won && window.__c.w.done() && window.__c.w.result === 1));
    check('fx: ...with a star burst, praise and a rising chime', await heard(g, 'chime') && await g.ev(() => G.fx.live('star') >= 8 && G.fx.live('words') >= 1));
    check('fx: no flying star after a wrong try', await g.ev(() => G.fx.live('fly') === 0));
    await g.frames(3); await still(g, 'choice_right');
    await g.until(() => G.top().constructor.name !== 'Choice', null, 'the question to close');
    check('fx: the question closes itself after the pop', await g.ev(() => window.__c.won.t >= 24));

    // "¡Palabra nueva!": springs open, confetti, the word spoken, sparkles
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t >= 2, null, 'the word card');
    check('fx: the word card pops open with confetti', await heard(g, 'pop') && await g.ev(() => G.fx.live('confetti') >= 30));
    await g.until(() => G.top().t >= 9, null, 'the card to spring');
    await still(g, 'wordcard_spring');
    await g.until(() => G.fx.live('twinkle') > 0, null, 'a sparkle', 5000);
    check('fx: the picture sparkles', true);
    await g.until(() => G.top().t >= 44, null, 'the card to settle');
    await still(g, 'wordcard');
    await g.tap(150, 200);
    await g.until(() => window.__r !== null, null, 'the question to finish');
    check('fx: a wrong first try earns no star', await g.ev(() => window.__r === false && G.state.stars === 0));
    await g.fieldIdle('villa');

    // the first try: a star flies to the corner and the counter there counts it
    await ask(g, { prompt: '¡[adios]!', layout: 'cards', choices: cards('hola', 'adios', 'gracias'), answer: 1, learn: 'adios' });
    await choiceUp(g);
    await g.ev(() => { window.__sfx.length = 0; });
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    check('fx: a first try sends a star flying', await g.ev(() => G.fx.live('fly') === 1));
    await g.frames(4); await still(g, 'star_pop');
    await g.frames(16); await still(g, 'star_flying');
    await g.until(() => G.fx.counterShown(), null, 'the star to land');
    check('fx: the star lands in the counter (with a ding) and counts', await heard(g, 'star') && await g.ev(() => G.state.stars === 1 && G.fx.live('fly') === 0));
    await g.frames(6); await still(g, 'star_counter');
    await g.until(() => G.top().constructor.name === 'WordCard' && G.top().t > 20, null, 'the word card');
    await g.tap(150, 200);
    await g.until(() => window.__r !== null, null, 'the question to finish');
    check('fx: G.ask still reports the first try', await g.ev(() => window.__r === true));
    await g.fieldIdle('villa');
    check('fx: the counter steps aside when the map is free (its menu button lives there)', await g.until(() => !G.fx.counterShown(), null, 'the counter to fade', 3000).then(() => true));

    // a list question, wrong then right (an already-known word: no word card)
    await ask(g, { prompt: '¿[adios]?', layout: 'list', choices: cards('hola', 'gracias', 'adios'), answer: 2, learn: 'adios' });
    await choiceUp(g);
    await g.ev(() => { window.__c = G.top(); });
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    check('fx: a wrong row greys out in place too', await g.ev(() => G.top() === window.__c && window.__c.ch[0].off));
    await g.frames(3); await still(g, 'list_wrong');
    await g.until(() => window.__c.miss.t > 8, null, 'the wobble');
    await g.tapRect(await g.ev(() => G.top().rects()[2]));
    check('fx: the right row pops', await g.ev(() => G.top() === window.__c && window.__c.won && window.__c.w.result === 2));
    await g.frames(3); await still(g, 'list_right');
    await g.until(() => window.__r !== null, null, 'the question to finish');
    check('fx: a known word gives no word card', await g.ev(() => window.__r === false && G.top() === G.field));

    // a question with a way out still works (the back button), and a plain choice just closes
    await g.ev(() => { window.__w = G.choose({ prompt: '¿Repaso?', show: 'pagina', layout: 'cards', choices: [{ word: 'si' }, { word: 'no' }], cancel: true }); });
    await choiceUp(g);
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    check('fx: a choice with no right answer closes at once with the pick', await g.ev(() => window.__w.done() && window.__w.result === 1 && G.top() === G.field));

    // a finished errand: confetti
    await g.ev(() => { window.__w = G.badge('saludos'); });
    await g.until(() => G.top().constructor.name === 'BadgeCard' && G.top().t > 30, null, 'the badge');
    check('fx: a badge gets confetti', await g.ev(() => G.fx.live('confetti') > 0));
    await still(g, 'badge');
    await g.until(() => G.top().t > 40, null, 'the badge to wait');
    await g.tap(160, 112);
    check('fx-ipad: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

async function keyboardRun(browser) {
  const { ctx, g } = await open(browser, 'fx-desktop', false);
  try {
    await start(g);
    // keys: a wrong pick moves the cursor off the greyed card; presses during the pop don't reach the next line
    await g.ev(() => {
      window.__r = null; window.__w = null;
      G.field.tasks.add((function* () {
        window.__r = yield* G.ask({ prompt: '¡[hola]!', layout: 'cards', choices: [{ word: 'manzana' }, { word: 'pelota' }, { word: 'hola' }], answer: 2 });
        window.__w = G.say('¡Muy bien, Luz! Ahora vamos a la escuela con la profesora Luna.');
      })());
    });
    await choiceUp(g);
    await g.ev(() => { window.__c = G.top(); });
    await g.press('Enter'); // on the first card: wrong
    check('desktop fx: Enter on a wrong card greys it, the cursor moves on', await g.ev(() => G.top() === window.__c && window.__c.ch[0].off && window.__c.i === 1));
    await g.until(() => window.__c.miss.t > 8, null, 'the wobble');
    await g.press('ArrowRight');
    await g.press('Enter');
    check('desktop fx: Enter on the right card pops it', await g.ev(() => window.__c.won && window.__c.w.result === 2));
    await g.press('Enter'); await g.press('Enter'); // a child hammering the key during the pop
    await g.until(() => window.__w && G.top().constructor.name === 'TextBox', null, 'the next line');
    check('desktop fx: keys pressed during the pop don\'t skip the next line', await g.ev(() => window.__r === false && G.top().shown < G.top().chars(0, 3)));
    await g.until(() => G.top().t > 6, null, 'the line to start');
    await g.press('Enter'); await g.press('Enter');
    await g.until(() => window.__w.done(), null, 'the line to close');
    check('desktop fx: Enter finishes the line, then closes it', true);
    await g.fieldIdle('villa');
    // walking with the keys puffs dust once
    await g.page.keyboard.down('ArrowLeft');
    await g.until(() => G.fx.live('dust') > 0, null, 'a dust puff', 3000);
    await g.page.keyboard.up('ArrowLeft');
    check('desktop fx: walking with the keys puffs dust', true);
    await g.until(() => !G.field.player.moving, null, 'the step to end');
    check('desktop fx: no tap ripples from keys', await g.ev(() => G.fx.live('ring') === 0 && !window.__sfx.includes('tap')));

    // the pool is capped, and a flying star survives a flood of bursts
    const r = await g.ev(() => {
      G.fx.clear(); G.fx.flyStar(160, 150);
      for (let i = 0; i < 60; i++) G.fx.burst(40 + i * 4, 100);
      const live = G.fx.live(), fly = G.fx.live('fly'), t0 = performance.now();
      for (let i = 0; i < 100; i++) { G.fx.step(); G.fx.draw(G.ctx); }
      const ms = (performance.now() - t0) / 100;
      G.fx.clear();
      return { live, fly, ms };
    });
    check('desktop fx: the particle pool is capped', r.live <= 200, 'live ' + r.live);
    check('desktop fx: a flying star is never recycled', r.fly === 1);
    check('desktop fx: a full pool steps and draws quickly', r.ms < 4, r.ms.toFixed(2) + ' ms a frame');
    console.log('    (a full pool: ' + r.ms.toFixed(2) + ' ms a frame)');
    check('fx-desktop: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Club de Español juice test (fx)', [['iPad (taps)', touchRun], ['desktop (keys)', keyboardRun]]);
