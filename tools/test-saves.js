// Save slots, autosave and the grown-ups menu (F3 + F4): the title flow, the slot screen, deleting a slot,
// moving an old save into slot 1, saving by itself (and surviving reloads), and every grown-ups row.
//   NODE_PATH=$(npm root -g) node tools/test-saves.js [screenshot dir]
'use strict';
const { open, check, run, G_W } = require('./harness');

const GIRL = { gender: 'nina', skin: '#a87050', style: 'braid', hair: '#201010', outfit: '#8a50c8' };
const SAVE = (name, extra) => Object.assign({
  flags: { intro: true }, searched: {}, playTime: 60, loc: { map: 'villa', x: 5, y: 18, dir: 'down' },
  words: { hola: { learned: true, right: 1, wrong: 0 }, adios: { learned: false, right: 0, wrong: 0 } },
  pages: { saludos: true }, quests: {}, stars: 1, opts: { english: false }, look: null, name, savedAt: 1000,
}, extra || {});

// ---------- helpers ----------
const stored = (g, n) => g.ev(n => { const v = localStorage.getItem('spanishclub_slot' + n); try { return JSON.parse(v); } catch (e) { return 'unreadable'; } }, n);
const scene = (g, name, what) => g.until(n => G.top() && G.top().constructor.name === n, name, what || name);
async function reload(g) {
  await g.page.reload();
  await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after a reload');
}
async function seed(g, slots) { // put saves in slots (and skip the one-time move of an old save), then reload
  await g.ev(s => { localStorage.setItem('spanishclub_migrated', '1'); for (const n in s) localStorage.setItem('spanishclub_slot' + n, JSON.stringify(s[n])); }, slots);
  await reload(g);
}
// press and hold a rect for n frames (a finger on a touch page, the mouse otherwise); during(): run while held
async function hold(g, r, n, during) {
  await g.until(() => G.input.ready(), null, 'taps to count');
  const [x, y] = await g.screen(r.x + r.w / 2, r.y + r.h / 2);
  const cdp = g.touch ? await g.page.context().newCDPSession(g.page) : null;
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  else { await g.page.mouse.move(x, y); await g.page.mouse.down(); }
  if (during) { await g.frames(during.at); await during.fn(); await g.frames(n - during.at); } else await g.frames(n);
  if (cdp) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); } else await g.page.mouse.up();
  await g.frames(3);
}
async function drag(g, a, b) { // a finger sliding from game point a to b
  await g.until(() => G.input.ready(), null, 'taps to count');
  const cdp = await g.page.context().newCDPSession(g.page), p = await g.screen(...a), q = await g.screen(...b);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p[0], y: p[1] }] }); await g.frames(3);
  for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p[0] + (q[0] - p[0]) * i / 6, y: p[1] + (q[1] - p[1]) * i / 6 }] }); await g.frames(2); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); await g.frames(3);
}
const rowOf = (g, id) => g.ev(id => G.top().rows().findIndex(r => r.id === id), id);
const tapRow = async (g, id) => g.tapRect(await g.ev(k => G.top().rowRect(k), await rowOf(g, id)));
const tapLetter = async (g, ch) => g.tapRect(await g.ev(ch => { const s = G.top(); for (let r = 0; r < s.grid.length; r++) { const c = s.grid[r].indexOf(ch); if (c >= 0) return s.cellRect(r, c); } }, ch));

// ---------- a child's first time: no menus, straight into the creator; then it all saves itself ----------
async function firstLaunch(browser) {
  const { ctx, g } = await open(browser, 'saves-first', true);
  try {
    check('first: public API G.st.autosave / G.st.saveNow', await g.ev(() => typeof G.st.autosave === 'function' && typeof G.st.saveNow === 'function'));
    check('first: no saves on a new device', await g.ev(() => !G.st.anySave() && G.st.slot === null));
    await g.shot('title');
    await g.tap(230, 190); // anywhere
    await scene(g, 'Creator', 'the character creator');
    check('first: a tap on the title goes straight to the creator (no slot screen)', await g.ev(() => !G.scenes.some(s => s.constructor.name === 'Slots')));
    check('first: nothing is saved before the name is chosen', await g.ev(() => !localStorage.getItem('spanishclub_slot1') && G.st.slot === null));
    const tapOpt = async (r, k) => g.tapRect(await g.ev(([r, k]) => G.top().optRects(r)[k], [r, k]));
    await tapOpt(0, 1); await tapOpt(1, 3); await tapOpt(5, 1);
    await g.until(() => G.top().constructor.name === 'NameEntry' && G.top().t > 6, null, 'the name screen');
    for (const ch of ['L', 'U', 'Z', 'OK']) await tapLetter(g, ch);
    await g.until(() => G.field && G.field.mapId === 'casa', null, 'home');
    await g.until(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1') || 'null'); return s && s.name === 'Luz'; }, null, 'slot 1 to be saved', 3000);
    check('first: the game fills slot 1 as soon as the name is chosen', await g.ev(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1')); return G.st.slot === 1 && s.look.gender === 'nina' && !s.flags.intro; }));

    await scene(g, 'TextBox', 'Mamá to speak');
    await g.drive(() => G.st.seen('hola'), 'Mamá\'s first question');
    await g.until(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1')); return s.words.hola && s.words.hola.st >= 1; }, null, 'the new word to be saved', 3000);
    check('first: meeting a word saves it (mid-scene, within a second)', true);
    await g.drive(() => G.state.flags.intro && G.top() === G.field && !G.field.locked, 'the rest of Mamá\'s intro');
    await g.until(() => JSON.parse(localStorage.getItem('spanishclub_slot1')).flags.intro, null, 'the finished intro to be saved', 3000);
    check('first: a finished scene saves', true);

    await g.tapTile(...await g.ev(() => [G.maps.casa.exits[0].x, G.maps.casa.exits[0].y]));
    await g.fieldIdle('villa');
    await g.until(() => JSON.parse(localStorage.getItem('spanishclub_slot1')).loc.map === 'villa', null, 'the new map to be saved', 3000);
    check('first: changing maps saves', true);
    const spot = await g.ev(() => { // a plain tile a few steps away
      const f = G.field, p = f.player;
      for (const [dx, dy] of [[0, 2], [2, 0], [-2, 0], [0, 3], [3, 0], [-3, 0], [1, 2], [-1, 2]]) {
        const x = p.x + dx, y = p.y + dy;
        if (!f.blocked(x, y, p) && !f.exitAt(x, y) && !(f.def.events || []).some(e => e.x === x && e.y === y) && !f.npcs.some(n => n.home[0] === x && n.home[1] === y) && f.plan({ x, y }).dir) return [x, y];
      }
    });
    check('first: found a spot to walk to', !!spot);
    await g.tapTile(...spot);
    await g.until(s => !G.field.route && !G.field.player.moving && G.field.player.x === s[0] && G.field.player.y === s[1], spot, 'the walk');
    await g.ev(() => window.dispatchEvent(new Event('pagehide')));
    const l = (await stored(g, 1)).loc;
    check('first: leaving the page saves right away, where the player stands', l.map === 'villa' && l.x === spot[0] && l.y === spot[1], JSON.stringify(l));

    await reload(g);
    await g.tap(160, 180);
    await scene(g, 'Slots', 'the slot screen');
    check('first: after a reload the slot screen shows the saved game', await g.ev(() => { const c = G.top().cards; return c[0] && c[0].name === 'Luz' && c[0].words >= 3 && !c[1] && !c[2] && G.top().i === 0; }));
    await g.frames(8); await g.shot('slots_one');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.fieldIdle('villa');
    check('first: tapping it continues where the player was, with what they learned', await g.ev(s => G.field.player.x === s[0] && G.field.player.y === s[1] && G.st.seen('hola') && G.state.name === 'Luz' && G.st.slot === 1, spot));
    check('first: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the slot screen: continue, a new game in an empty slot, deleting with a held trash can ----------
async function slotScreen(browser) {
  const { ctx, g } = await open(browser, 'saves-slots', true);
  try {
    const nico = SAVE('Nico', { stars: 7 }), sofi = SAVE('Sofi', { look: GIRL, savedAt: 2000, stars: 12, words: { hola: { learned: true, right: 3, wrong: 0 }, gracias: { learned: true, right: 1, wrong: 0 }, si: { learned: true, right: 2, wrong: 1 } } });
    await seed(g, { 1: nico, 3: sofi });
    await g.tap(160, 180);
    await scene(g, 'Slots', 'the slot screen');
    check('slots: two filled cards and an empty one (words: those in the notebook, an older save\'s seen ones too), the last played picked', await g.ev(() => { const s = G.top(), c = s.cards; return c[0].name === 'Nico' && c[0].stars === 7 && c[0].words === 2 && !c[1] && c[2].name === 'Sofi' && c[2].words === 3 && s.i === 2; }));
    await g.frames(8); await g.shot('slots_two');
    check('slots: the screen says "¿Quién juega?" out loud', await g.ev(() => window.__speak.some(s => s.text === '¿Quién juega?')));

    await g.tapRect(await g.ev(() => G.top().cardRect(1))); // + Nuevo
    await scene(g, 'Creator', 'the creator');
    await g.tapBtn(await g.ev(() => G.top().backXY()));
    await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'back to the title');
    check('slots: backing out of the creator leaves the slot empty', !(await stored(g, 2)) && await g.ev(() => G.st.slot === null));
    await g.tap(160, 180);
    await scene(g, 'Slots');
    await g.tapRect(await g.ev(() => G.top().cardRect(1)));
    await scene(g, 'Creator');
    await g.tapRect(await g.ev(() => G.top().optRects(5)[1]));
    await g.until(() => G.top().constructor.name === 'NameEntry' && G.top().t > 6, null, 'the name screen');
    for (const ch of ['A', 'N', 'A', 'OK']) await tapLetter(g, ch);
    await g.until(() => G.field && G.field.mapId === 'casa' && G.st.slot === 2, null, 'home, in slot 2');
    await g.until(() => !!localStorage.getItem('spanishclub_slot2'), null, 'slot 2 to be saved', 3000);
    check('slots: a new game in the empty slot fills it and leaves the others alone',
      (await stored(g, 2)).name === 'Ana' && JSON.stringify(await stored(g, 1)) === JSON.stringify(nico) && JSON.stringify(await stored(g, 3)) === JSON.stringify(sofi));

    await reload(g);
    await g.tap(160, 180);
    await scene(g, 'Slots');
    const trash = await g.ev(() => G.top().trashRect(2));
    await g.tapRect(trash);
    check('slots: a quick tap on the trash can does nothing but wiggle', await g.ev(() => G.top().constructor.name === 'Slots' && G.top().holds[2].poke > 0) && !!(await stored(g, 3)));
    await hold(g, trash, 60);
    check('slots: a 1 s hold is not enough', await g.ev(() => G.top().constructor.name === 'Slots') && !!(await stored(g, 3)));
    await hold(g, trash, 190, { at: 90, fn: async () => {
      check('slots: holding fills the ring', await g.ev(() => { const p = G.top().holds[2].p; return p > 0.3 && p < 0.7; }));
      await g.shot('trash_ring');
    } });
    await scene(g, 'ConfirmErase', '"¿Borrar?"');
    await g.frames(12); await g.shot('confirm');
    check('slots: after 3 s it asks, with no picked first', await g.ev(() => G.top().i === 1 && G.top().c.name === 'Sofi'));
    await g.tapRect(await g.ev(() => G.top().rects()[1]));
    await scene(g, 'Slots');
    check('slots: no keeps the game', !!(await stored(g, 3)) && await g.ev(() => !!G.top().cards[2]));
    await hold(g, trash, 190);
    await scene(g, 'ConfirmErase');
    await g.tapRect(await g.ev(() => G.top().rects()[0]));
    await scene(g, 'Slots');
    check('slots: sí deletes it', !(await stored(g, 3)) && await g.ev(() => !G.top().cards[2] && !!G.top().cards[0] && !!G.top().cards[1]));
    await g.frames(6); await g.shot('deleted');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.fieldIdle('villa');
    check('slots: tapping a filled card continues it', await g.ev(() => G.state.name === 'Nico' && G.st.slot === 1 && G.field.player.x === 5 && G.field.player.y === 18));
    check('slots: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- an old save moves into slot 1; keyboard: the gear in the field, back to title, deleting ----------
async function legacyAndKeys(browser) {
  const { ctx, g } = await open(browser, 'saves-keys', false);
  try {
    const old = SAVE('Leo', { look: GIRL, loc: { map: 'villa', x: 14, y: 13, dir: 'up' }, stars: 4 });
    await g.ev(o => { localStorage.removeItem('spanishclub_migrated'); localStorage.setItem('spanishclub_save2', JSON.stringify(o)); }, old);
    await reload(g);
    check('legacy: the old save is copied into slot 1 and left in place', JSON.stringify(await stored(g, 1)) === JSON.stringify(old) && await g.ev(() => !!localStorage.getItem('spanishclub_save2') && !!localStorage.getItem('spanishclub_migrated')));
    await g.press('Enter');
    await scene(g, 'Slots');
    await g.press('Enter');
    await g.fieldIdle('villa');
    check('legacy: it continues where it was', await g.ev(() => G.state.name === 'Leo' && G.field.player.x === 14 && G.field.player.y === 13 && G.st.slot === 1));

    await g.press('x');
    await scene(g, 'FieldMenu', 'the field menu');
    await g.press('ArrowDown');
    check('keys: down moves onto the gear', await g.ev(() => G.top().sel === 'gear'));
    await g.press('z');
    await g.frames(10);
    check('keys: pressing Z on the gear does nothing', await g.ev(() => G.top().constructor.name === 'FieldMenu'));
    await g.page.keyboard.down('z'); await g.frames(70);
    check('keys: holding Z fills the gear\'s ring', await g.ev(() => G.top().gear.p > 0.4));
    await g.frames(60); await g.page.keyboard.up('z');
    await scene(g, 'GrownUps', 'the grown-ups menu');
    check('keys: holding Z on it 2 s opens the grown-ups menu', await g.ev(() => G.top().rows().some(r => r.id === 'title')));
    const music = await g.ev(() => G.prefs.music);
    await g.press('ArrowRight');
    check('keys: right turns the music up', await g.ev(m => G.prefs.music === m + 1, music));
    for (let i = 0; i < 4; i++) await g.press('ArrowDown');
    await g.press('Enter');
    check('keys: A switches English help on', await g.ev(() => G.top().rows()[G.top().i].id === 'english' && G.state.opts.english && G.prefs.english === true));
    for (let i = 0; i < 5; i++) await g.press('ArrowUp'); // wraps to the last row
    check('keys: the last row is Back to title', await g.ev(() => G.top().rows()[G.top().i].id === 'title'));
    await g.press('Enter');
    await scene(g, 'Title');
    check('keys: back at the title, the game was saved and nothing more is', (await stored(g, 1)).savedAt > 1000 && (await stored(g, 1)).opts.english && await g.ev(() => G.st.slot === null && !G.st.saveNow()));

    await g.until(() => G.top().t > 32, null, 'the title');
    await g.press('Enter');
    await scene(g, 'Slots');
    await g.press('ArrowDown');
    check('keys: down moves onto the trash can', await g.ev(() => G.top().trash && G.top().i === 0));
    await g.page.keyboard.down('z'); await g.frames(190); await g.page.keyboard.up('z');
    await scene(g, 'ConfirmErase');
    await g.press('ArrowLeft'); await g.press('Enter');
    await scene(g, 'Slots');
    check('keys: hold Z 3 s on the trash can, then sí, deletes', !(await stored(g, 1)));
    await reload(g);
    check('legacy: a deleted slot 1 doesn\'t get the old save back', !(await stored(g, 1)) && await g.ev(() => !!localStorage.getItem('spanishclub_save2')));
    await g.ev(n => { localStorage.removeItem('spanishclub_migrated'); localStorage.setItem('spanishclub_slot1', JSON.stringify(n)); }, SAVE('Nico'));
    await reload(g);
    check('legacy: the old save never overwrites a filled slot 1', (await stored(g, 1)).name === 'Nico');
    check('keys: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the grown-ups menu on the title, every row by taps ----------
async function grownUpsTitle(browser) {
  const { ctx, g } = await open(browser, 'saves-adults', true);
  try {
    await g.ev(() => { speechSynthesis.getVoices = () => [{ name: 'Paulina', lang: 'es-MX' }, { name: 'Jorge', lang: 'es-ES' }]; }); // two Spanish voices
    const gear = await g.ev(() => G.top().gearHit());
    await g.tapRect(gear);
    await g.frames(30);
    check('adults: a quick tap on the gear neither starts the game nor opens the menu', await g.ev(() => G.top().constructor.name === 'Title'));
    await hold(g, gear, 70, { at: 50, fn: async () => { await g.shot('gear_ring'); } });
    check('adults: a 1 s hold is not enough', await g.ev(() => G.top().constructor.name === 'Title'));
    await hold(g, gear, 130);
    await scene(g, 'GrownUps', 'the grown-ups menu');
    await g.frames(4); await g.shot('grownups_title');
    check('adults: held 2 s on the title it opens, without Back to title', await g.ev(() => G.top().rows().every(r => r.id !== 'title') && G.top().rows().length === 9));

    const bar = async (id, cell) => { const k = await rowOf(g, id); return g.ev(([k, c]) => { const r = G.top().rowRect(k); return [168 + (c - 1) * 12 + 6, r.y + 10]; }, [k, cell]); };
    await g.tap(...await bar('music', 4));
    check('adults: tapping the 4th music cell sets 4', await g.ev(() => G.prefs.music === 4 && JSON.parse(localStorage.getItem('spanishclub_prefs')).music === 4));
    await drag(g, await bar('sfx', 1), await bar('sfx', 9));
    check('adults: sliding a finger along the sounds bar sets 9', await g.ev(() => G.prefs.sfx === 9), 'sfx = ' + await g.ev(() => G.prefs.sfx));
    await g.tap(...(await bar('voice', 1)).map((v, i) => i ? v : v - 14)); // the speaker left of the bar
    check('adults: tapping the voice speaker sets 0', await g.ev(() => G.prefs.voice === 0));
    await g.tap(...await bar('voice', 10));
    check('adults: ...and the last cell 10', await g.ev(() => G.prefs.voice === 10));
    await tapRow(g, 'pick');
    check('adults: Choose voice picks the next voice (kept per device)', await g.ev(() => G.prefs.voiceName === 'Jorge' && G.state.opts.voiceName === 'Jorge'));
    await tapRow(g, 'english');
    check('adults: English help on (kept per device)', await g.ev(() => G.prefs.english === true && G.enVisible()));
    const pad = () => g.ev(() => { const e = document.getElementById('tcpad'); return !!e && getComputedStyle(e).display !== 'none'; });
    await tapRow(g, 'dpad');
    check('adults: On-screen buttons on', await pad() && await g.ev(() => G.prefs.dpad === true));
    await g.shot('grownups_changed');
    await tapRow(g, 'dpad');
    check('adults: ...and off', !(await pad()) && await g.ev(() => G.prefs.dpad === false));
    // the real mic test (mictest.js) opens over the menu and its close button comes back to it
    check('adults: Microphone test is on (mictest.js is loaded)', await g.ev(() => !G.top().rows().find(r => r.id === 'mic').off));
    await tapRow(g, 'mic');
    await scene(g, 'MicTest', 'the microphone test');
    await g.frames(4); await g.shot('mictest');
    await g.tapBtn([G_W - 26, 6]);
    await scene(g, 'GrownUps', 'back in the grown-ups menu');
    check('adults: the mic test opens from the row and closes back to the menu', true);
    const mic = await g.ev(() => { window.__realMic = G.micTest; G.micTest = undefined; return true; });
    await g.frames(2);
    check('adults: Microphone test greyed out without G.micTest', mic && await g.ev(() => { const r = G.top().rows().find(r => r.id === 'mic'); return r.off && r.right === 'not available'; }));
    await tapRow(g, 'mic');
    check('adults: ...and tapping it does nothing', await g.ev(() => G.top().constructor.name === 'GrownUps'));
    await g.ev(() => { window.__mic = 0; G.micTest = () => { window.__mic++; }; });
    await g.frames(2);
    await tapRow(g, 'mic');
    check('adults: with G.micTest defined, the row calls it', await g.ev(() => window.__mic === 1 && !G.top().rows().find(r => r.id === 'mic').off));
    await g.ev(() => { G.micTest = window.__realMic; });
    await tapRow(g, 'help');
    await scene(g, 'Controls', 'controls and tips');
    await g.frames(4); await g.shot('controls');
    await g.tap(160, 112);
    await scene(g, 'GrownUps');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await scene(g, 'Title');
    check('adults: the close button goes back to the title', true);
    await g.toCreator();
    check('adults: English help carries into a new game', await g.ev(() => G.enVisible()));
    check('adults: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the kid's field menu and the gear in the field, by taps ----------
async function grownUpsField(browser) {
  const { ctx, g } = await open(browser, 'saves-field', true);
  try {
    await seed(g, { 1: SAVE('Nico') });
    await g.tap(160, 180);
    await scene(g, 'Slots');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.fieldIdle('villa');
    await g.tap(310, 16); // the menu button
    await scene(g, 'FieldMenu', 'the field menu');
    await g.frames(6); await g.shot('fieldmenu');
    check('field: the menu has Cuaderno, Misiones and a small gear (no Guardar)', await g.ev(() => { const s = G.top(), g = s.rect('gear'), b = s.rect('book'); return g.w * g.h < b.w * b.h / 4; }));
    await g.tapRect(await g.ev(() => G.top().rect('book')));
    await scene(g, 'Notebook');
    await g.tapBtn(await g.ev(() => G.top().closeXY()));
    await scene(g, 'FieldMenu');
    await g.tapRect(await g.ev(() => G.top().rect('quest')));
    await scene(g, 'QuestLog');
    await g.tap(160, 112);
    await scene(g, 'FieldMenu');
    check('field: Cuaderno and Misiones open by tapping', true);
    const gear = await g.ev(() => G.top().gearHit());
    await g.tapRect(gear);
    await g.frames(20);
    check('field: a quick tap on the gear doesn\'t open the grown-ups menu', await g.ev(() => G.top().constructor.name === 'FieldMenu'));
    await hold(g, gear, 130, { at: 80, fn: () => g.shot('field_gear_ring') });
    await scene(g, 'GrownUps');
    await g.frames(4); await g.shot('grownups_field');
    await tapRow(g, 'english');
    await g.until(() => JSON.parse(localStorage.getItem('spanishclub_slot1')).opts.english === true, null, 'the English choice to be saved', 3000);
    check('field: a change in the grown-ups menu is saved', true);
    await tapRow(g, 'title');
    await scene(g, 'Title');
    check('field: Back to title saves and stops saving', (await stored(g, 1)).savedAt > 1000 && await g.ev(() => G.st.slot === null));
    check('field: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- autosave can't hurt a save, and a failing save can't hurt play ----------
async function robust(browser) {
  const { ctx, g } = await open(browser, 'saves-robust', true);
  try {
    check('robust: the title\'s throwaway game is never saved', await g.ev(() => { G.st.autosave(); return !G.st.saveNow() && !Object.keys(localStorage).some(k => /slot/.test(k)); }));
    await g.ev(n => { localStorage.setItem('spanishclub_slot2', '{oops'); }, null);
    await seed(g, { 3: SAVE('Sofi', { loc: { map: 'nowhere', x: 1, y: 1 } }) });
    await g.tap(160, 180);
    await scene(g, 'Slots');
    check('robust: an unreadable slot shows as empty', await g.ev(() => !G.top().cards[1] && !G.top().cards[0] && G.top().cards[2].name === 'Sofi'));
    await g.tapRect(await g.ev(() => G.top().cardRect(2)));
    await g.fieldIdle('casa');
    check('robust: a save pointing at a missing map starts at home', await g.ev(() => G.st.slot === 3 && G.field.player.x === 4 && G.field.player.y === 4));

    await g.ev(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('QuotaExceededError'); }; G.st.learn('gracias'); G.st.autosave(); });
    await g.frames(60);
    const mama = await g.ev(() => { const n = G.field.npc('mama'); return [n.x, n.y]; });
    await g.tapTile(...mama);
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá to talk');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'talking to Mamá');
    check('robust: when storage fails, play goes on without errors', !g.errors.length && await g.ev(() => !G.st.saveNow()), g.errors.join('\n'));
    await g.ev(() => { Storage.prototype.setItem = window.__set; });
    check('robust: when storage works again, the next save has everything', await g.ev(() => G.st.saveNow()) && ((w => w.st >= 2 || w.learned)((await stored(g, 3)).words.gracias)));

    await g.ev(() => { G.state.flags.loop = G.state; });
    check('robust: a state that can\'t be written leaves the save as it was', await g.ev(() => !G.st.saveNow()) && ((w => w.st >= 2 || w.learned)((await stored(g, 3)).words.gracias)));
    await g.ev(() => { delete G.state.flags.loop; });

    await g.ev(() => { G.state.flags.talked = 1; });
    await g.tapTile(...mama);
    await g.until(() => G.top().constructor.name === 'TextBox', null, 'Mamá to talk');
    await g.drive(() => G.top() === G.field && !G.field.locked, 'talking to Mamá');
    await g.until(() => JSON.parse(localStorage.getItem('spanishclub_slot3')).flags.talked === 1, null, 'the save after talking', 3000);
    check('robust: every finished talk saves', true);

    await g.ev(() => { G.state.flags.tick = 1; G.speedMul = 10; });
    await g.until(() => JSON.parse(localStorage.getItem('spanishclub_slot3')).flags.tick === 1, null, 'the timed save', 10000);
    await g.ev(() => { G.speedMul = 1; });
    check('robust: walking around saves every ~15 s', true);

    check('robust: hiding the tab saves at once', await g.ev(() => {
      G.state.flags.hidden = 1; Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange')); delete document.visibilityState;
      return JSON.parse(localStorage.getItem('spanishclub_slot3')).flags.hidden === 1;
    }));
    check('robust: a fresh G.st.newGame() (tests, tools) is never written into the slot', await g.ev(() => {
      G.st.newGame(); G.state.flags.junk = 1; G.st.autosave();
      return !G.st.saveNow() && G.st.slot === null && !JSON.parse(localStorage.getItem('spanishclub_slot3')).flags.junk;
    }));
    check('robust: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('Save slots, autosave and the grown-ups menu', [
  ['first launch (iPad)', firstLaunch], ['slot screen (iPad)', slotScreen], ['old save + keyboard (desktop)', legacyAndKeys],
  ['grown-ups menu on the title (iPad)', grownUpsTitle], ['grown-ups menu in the field (iPad)', grownUpsField], ['autosave is safe (iPad)', robust],
]);
