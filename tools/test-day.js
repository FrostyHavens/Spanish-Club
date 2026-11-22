// A day that fits a 15-minute sitting (src/day.js, docs/AUDIT_2026-10.md 1.10 and 1.11): every map and place plays a
// song that loops (no map falls silent after a jingle); the sunset at 12.5 minutes, or a minute after the day's story
// is done if 6 minutes have passed; the Hoy card counts the calendar day (a reload the same day keeps the earlier words and
// stars; a new date or a night starts again); the night's animals come out at sunset where you are; after the Hoy card,
// to bed or a night walk (the bus at night to a place she's been to, the arrow on the night animal, home to bed once
// it's found or after a while, then the morning); the dog's warm-up once a calendar day and the morning greeting.
//   NODE_PATH=$(npm root -g) node tools/test-day.js [screenshot dir]
'use strict';
const { run, open, check } = require('./harness');

// a game in progress (the opener and chapters 1-2 done), standing somewhere; o: {words, quests, visit, slot}
const playing = (g, map, x, y, o = {}) => g.ev(([map, x, y, o]) => {
  window.free = () => G.top() === G.field && !G.field.locked && G.fade.a === 0;
  G.st.newGame(); G.state.name = 'Luz'; G.state.look = G.data.defaultLook('nina');
  Object.assign(G.state.flags, { opener: true, intro: true, canelo: true, petStart: true });
  Object.assign(G.state.quests, { c1: 'done', c2: 'done' }, o.quests || {});
  ['hola', 'buenosdias', 'adios'].concat(o.words || []).forEach(id => G.st.learn(id));
  if (G.demo && G.demo.skip) G.demo.skip();
  for (const z of o.visit || []) G.zones.visit(z);
  if (o.c2) { G.chapters.state().step.c2 = 5; G.state.finds = { gato: { map: 'villa', at: '16,19', found: false } }; }
  if (o.slot) G.st.begin(o.slot);
  G.debug.sunsetAt = null; G.goto(map, x, y, 'down');
}, [map, x, y, o]);
const scene = g => g.scene();
// play on through dialogue and questions (drive), the Hoy card and the night, until done() in the page
async function evening(g, done, o = {}) {
  for (let i = 0; i < 400 && !(await g.ev(done)); i++) {
    const s = await scene(g);
    if (s === 'TodayCard') {
      await g.until(() => G.top().constructor.name !== 'TodayCard' || (G.top().revealed() && G.top().wait > 20), null, 'the Hoy card');
      if (await scene(g) === 'TodayCard') { if (o.hoy) await o.hoy(); if (g.touch) await g.tap(160, 200); else await g.press('z'); }
    } else if (s === 'Night') { await g.ev(() => { G.debug.sunsetAt = null; }); await g.frames(10); } // (the test's early sunset: not again tomorrow)
    else await g.drive(`(() => ['TodayCard', 'Night'].includes(G.top().constructor.name) || (${done})())()`, 'the evening');
  }
  check(g.name + ': the evening played through', await g.ev(done));
}
const morning = () => G.top() === G.field && !G.field.locked && G.field.mapId === 'casa' && G.fade.a === 0 && G.sessionTime < 60 && !G.day.over();

// ---------- the music: every map and place plays a song that loops ----------
async function music(browser) {
  const { ctx, g } = await open(browser, 'day-music', false);
  try {
    const r = await g.ev(() => {
      const S = G.audio.songs, bad = [], all = [];
      for (const m in G.maps) { const id = G.maps[m].music || 'town'; all.push(m + ':' + id); if (!S[id] || !S[id].loop) bad.push('map ' + m + ': ' + id); }
      for (const z of G.zones.LIST) { all.push('zone ' + z.id + ':' + z.music); if (!S[z.music] || !S[z.music].loop) bad.push('zone ' + z.id + ': ' + z.music); }
      return { bad, n: all.length, maps: Object.keys(G.maps).length };
    });
    check('music: every map (' + r.maps + ') and every place has a song that loops (no jingle, no short tune)', !r.bad.length && r.maps > 20, r.bad.join('; '));
    check('music: the farm and the grandparents\' place play the ranch waltz; Rosa\'s house the home song; the bakery keeps the town\'s waltz', await g.ev(() => G.maps.granja.music === 'rancho' && G.maps.abuelos.music === 'rancho' && G.zones.def('abuelos').music === 'rancho' && G.maps.rosa.music === 'headquarters' && G.maps.panaderia.music === 'town'));
    const s = await g.ev(() => { const c = G.audio.compile(G.audio.songs.rancho); return { len: c.len, sec: c.len * 60 / G.audio.songs.rancho.tempo, notes: c.ev.length, tracks: G.audio.songs.rancho.tracks.length }; });
    check('music: the ranch waltz is a real song: 24 bars of 3/4, about 47 s a time round, flute, guitar-like harp and bass', s.len === 72 && s.sec > 40 && s.notes > 200 && s.tracks === 5, JSON.stringify(s));
    check('music: the bedtime lullaby is still the short tune (a jingle, played once)', await g.ev(() => G.audio.songs.inn && G.audio.songs.inn.loop === false));
    // in the page, as the audit measured it: a few seconds after coming into the barn and the grandparents' place, still playing
    await g.ev(() => { G.st.newGame(); G.state.name = 'Luz'; Object.assign(G.state.flags, { opener: true, intro: true }); });
    await g.press('m'); await g.press('m'); // (a key unlocks the sound, as a child's first touch does; M twice: still on)
    const live = await g.ev(() => !!(G.audio.ctx && G.audio.ctx.state === 'running'));
    if (live) {
      for (const m of ['granja', 'abuelos']) {
        const t0 = await g.ev(m => { G.goto(m, m === 'granja' ? 5 : 19, m === 'granja' ? 6 : 12, 'down'); return G.audio.ctx.currentTime; }, m);
        await g.until(t0 => G.audio.ctx.currentTime > t0 + 7, t0, '7 s of sound', 15000);
        check('music: 7 s after coming into ' + m + ' its song is still playing (it was silent after ~3 s)', await g.ev(() => G.audio.songName === 'rancho' && !!G.audio.song && G.audio.song.loop));
      }
    } else console.log('    (no running AudioContext in this browser: the in-page timing check is skipped)');
    check('music: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the sunset: 12.5 minutes, or a minute after the day's story is done after 6 minutes or more ----------
// chapter 2 at its last beat, waiting for the cat to be found (Nico's two questions); its next chapter waits for the morning
const atC2End = g => playing(g, 'villa', 15, 20, { quests: { c2: 'active' }, words: ['perro', 'guau', 'gato', 'miau', 'ven', 'si', 'parque'], c2: true });
// found (at: the clock then): the beat plays to the end of the chapter; G.day.storyDone's calls are kept in window.__story
const c2Found = (g, at) => g.ev(at => {
  window.__story = []; if (!G.day.__sd) { G.day.__sd = G.day.storyDone; G.day.storyDone = function () { const r = G.day.__sd.apply(this, arguments); window.__story.push({ now: G.sessionTime, at: G.day.sunsetAt() }); return r; }; }
  if (at != null) G.sessionTime = at;
  G.state.finds = { gato: { map: 'villa', at: '16,19', found: true } };
}, at);
async function sunset(browser) {
  const { ctx, g } = await open(browser, 'day-sunset', true);
  try {
    await playing(g, 'villa', 15, 20);
    await g.fieldIdle('villa');
    check('sunset: about 12.5 minutes of play (was 18): a 15-minute sitting has its evening', await g.ev(() => G.day.SUNSET_AT === 750 && G.day.sunsetAt() === 750 && !G.day.brought()));
    check('sunset: not before', await g.ev(() => { const t = G.sessionTime; G.sessionTime = 749; const a = G.day.over(); G.sessionTime = t; return !a; }));
    check('sunset: then the sun goes down', await g.ev(() => { const t = G.sessionTime; G.sessionTime = 751; const a = G.day.over(); G.sessionTime = t; return a; }));
    // the day's story done early: the usual sunset stays
    await atC2End(g);
    await g.fieldIdle('villa');
    await c2Found(g);
    await g.drive(() => G.state.quests.c2 === 'done' && window.free(), 'the end of chapter 2');
    let s = await g.ev(() => ({ story: window.__story, at: G.day.sunsetAt(), now: G.sessionTime, over: G.day.over(), gate: G.chapters.gate('c3') }));
    check('sunset: chapter 2 done (chapter 3 waits for the morning) after a minute or two: the open world until the usual sunset (the story keeps its pace)', s.story.length === 1 && s.gate === 'morning' && s.at === 750 && !s.over && !(await g.ev(() => G.day.brought())), JSON.stringify(s));
    // ... and after 6 minutes: a minute later
    await atC2End(g);
    await g.fieldIdle('villa');
    await c2Found(g, 480);
    await g.drive(() => G.state.quests.c2 === 'done' && window.free(), 'the end of chapter 2, later');
    s = await g.ev(() => ({ story: window.__story, at: G.day.sunsetAt(), now: G.sessionTime }));
    check('sunset: the day\'s story done after 8 minutes: the sun goes down a minute later', s.story.length === 1 && Math.abs(s.story[0].at - s.story[0].now - 60) < 0.5 && s.story[0].now >= 480, JSON.stringify(s));
    await g.ev(() => { G.sessionTime = G.day.sunsetAt() + 1; });
    await g.until(() => G.day.over() && G.day.glow() >= 1, null, 'the sunset');
    await g.frames(120);
    check('sunset: never forced: you play on, the arrow shows the way home', await g.ev(() => window.free() && G.field.mapId === 'villa' && /home/.test((G.guide.goal(G.field) || {}).why || '')));
    await g.shot('sunset');
    // a chapter whose line goes straight on (a zone's first) doesn't bring the evening
    check('sunset: a chapter with the next one ready (not waiting for the morning) leaves the sun where it was', await g.ev(() => { const L = G.chapters.ids().filter(id => G.chapters.lineOf(id) === 'abuelos'); return L.length === 3 && !G.chapters.def(L[1]).when; }));
    // the night's animals come out where you are when the sun goes down
    await playing(g, 'abuelos', 12, 5, { visit: ['villa', 'abuelos'] });
    await g.fieldIdle('abuelos');
    check('night: by day no possum in the grandparents\' orchard', await g.ev(() => !G.animals.find('tlacuache') && !G.day.over()));
    await g.ev(() => { G.debug.sunsetAt = 0; });
    await g.until(() => !!G.animals.find('tlacuache') && G.animals.here().some(a => a.kind === 'luciernaga'), null, 'the possum and the fireflies');
    check('night: the sun goes down while you\'re there: the possum and the fireflies come out (no need to walk out and in)', true);
    await g.frames(200); await g.shot('night_comes');
    check('sunset: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- night on every outdoor map (docs/AUDIT_2026-10.md 3.7): the shared wash, the beach, the paths, the bear ----------
// the screen's average brightness and warmth (red minus blue), sampled on a grid of the game canvas
const lum = g => g.ev(() => { const c = G.canvas, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, l = 0, w = 0; for (let y = 0; y < c.height; y += 16) for (let x = 0; x < c.width; x += 16) { const i = (y * c.width + x) * 4; l += d[i] + d[i + 1] + d[i + 2]; w += d[i] - d[i + 2]; n++; } return { l: l / n / 3, w: w / n }; });
async function nightWash(browser) {
  const { ctx, g } = await open(browser, 'day-wash', true);
  try {
    await playing(g, 'villa', 15, 20, { visit: ['villa', 'playa', 'bosque', 'juegos', 'abuelos', 'montana'] });
    const outdoor = [['villa', 15, 20], ['bosque', 18, 22], ['juegos', 20, 12], ['abuelos', 12, 12], ['montana', 20, 12], ['playa', 14, 10], ['playa', 22, 13], ['camino_playa', 6, 12], ['camino_bosque', 6, 12], ['camino_juegos', 6, 12], ['camino_montana', 14, 6], ['camino_abuelos', 6, 12]];
    const indoor = [['escuela', 6, 6], ['abuelos_casa', 6, 6], ['montana_refugio', 6, 6], ['bosque_cabana', 4, 4]];
    check('wash: the maps know if they are outdoors (a flag on the map def, no list of names)', await g.ev(([o, i]) => o.every(m => G.day.outdoor({ def: G.maps[m[0]] })) && i.every(m => !G.day.outdoor({ def: G.maps[m[0]] })), [outdoor, indoor]));
    const look = async (m, x, y, dark) => {
      await g.ev(([m, x, y, dark]) => { G.debug.sunsetAt = dark ? 0 : null; G.sessionTime = dark ? 0 : 0; G.goto(m, x, y, 'down'); }, [m, x, y, dark]);
      await g.fieldIdle(m);
      if (dark) await g.until(() => G.day.glow() >= 0.99, null, 'dark', 60000); else await g.until(() => G.day.glow() <= 0.01, null, 'day', 20000);
      await g.frames(40);
      return lum(g);
    };
    for (const [m, x, y] of outdoor) {
      const d = await look(m, x, y, false), n = await look(m, x, y, true);
      check('wash: ' + m + (m === 'playa' ? '@' + x : '') + ' after sunset is clearly darker than by day (' + Math.round(d.l) + ' to ' + Math.round(n.l) + ')', n.l < d.l * 0.8, JSON.stringify([d, n]));
      if (m === 'villa') check('wash: the town keeps its own warm sunset (warmer than by day, as before)', n.w > d.w, JSON.stringify([d, n]));
      else check('wash: ' + m + ' gets a blue dusk (less red against blue than by day)', n.w < d.w, JSON.stringify([d, n]));
      const lab = m + (m === 'playa' ? '_' + x : '');
      if (m !== 'playa' || x === 14 || x === 22) await g.shot('night_' + lab);
    }
    for (const [m, x, y] of indoor) {
      const d = await look(m, x, y, false), n = await look(m, x, y, true);
      check('wash: indoors (' + m + ') the night is not drawn (' + Math.round(d.l) + ' to ' + Math.round(n.l) + ')', n.l > d.l * 0.85, JSON.stringify([d, n]));
    }
    // the beach by night with its octopus, and the bear in the cave
    await g.ev(() => { G.debug.sunsetAt = 0; G.goto('playa', 22, 10, 'down'); });
    await g.fieldIdle('playa');
    await g.until(() => G.day.glow() >= 0.99 && !!G.animals.find('pulpo'), null, 'the octopus out at night', 60000);
    await g.frames(30); await g.shot('night_beach_octopus');
    check('wash: the beach at night has its octopus out', await g.ev(() => !!G.animals.find('pulpo')));
    await g.ev(() => { G.goto('bosque_cueva', 8, 6, 'down'); });
    await g.fieldIdle('bosque_cueva');
    await g.frames(20);
    const bear = await g.ev(() => { const b = G.animals.find('oso'); return b ? { z: [] } : null; });
    check('wash: the bear sleeps in the cave', !!bear);
    const zs = [];
    for (let i = 0; i < 6; i++) { await g.frames(30); zs.push(await g.ev(() => G.animals.find('oso').z)); }
    check('wash: the bear breathes (she rises a pixel and sinks again)', zs.includes(0) && zs.includes(1), zs.join());
    await g.shot('night_cave_bear');
    check('wash: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the Hoy card counts the calendar day ----------
async function hoy(browser) {
  const { ctx, g } = await open(browser, 'day-hoy', true);
  try {
    await g.ev(() => { try { localStorage.clear(); } catch (e) { } });
    await playing(g, 'villa', 5, 19, { slot: 1 });
    await g.fieldIdle('villa');
    await g.ev(() => { G.st.learn('manzana'); G.st.practiced('manzana', true); G.st.practiced('hola', true); G.st.saveNow(); }); // (saved at once: the sweep runs before each save)
    check('hoy: today\'s words and stars, kept in the save (compact)', await g.ev(() => { const s = JSON.parse(localStorage.getItem('spanishclub_slot1')), h = s.hist.hoy; return h.d === G.today() && h.w.join() === 'manzana' && JSON.stringify(h).length < 200 && G.day.today().stars === 2; }), await g.ev(() => localStorage.getItem('spanishclub_slot1').match(/"hoy":\{[^}]*\}/)));
    // closed and opened again later the same day (the audit: the card was empty)
    await g.page.reload();
    await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
    check('hoy: opened again: today still has the morning\'s word and stars', await g.ev(() => { const d = G.day.today(); return G.sessionTime < 20 && d.words.join() === 'manzana' && d.stars === 2; }), JSON.stringify(await g.ev(() => G.day.today())));
    // the day's clock goes on over a quick reload (iPad Safari reloads a tab left in the background: a reload at minute
    // 8 used to give a 20-minute day), and starts again after a longer pause
    const reopen = async later => { // later: minutes that have gone by when the game is opened again
      await g.page.reload();
      await g.until(() => window.G && G.top && G.top() && G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title after reload');
      if (later) await g.ev(m => { G.debug.dayShift = m / 1440; }, later);
      await g.tap(160, 180);
      await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
      await g.tapRect(await g.ev(() => G.top().cardRect(0)));
      await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
    };
    await g.ev(() => { G.sessionTime = 480; G.st.saveNow(); });
    await reopen();
    check('hoy: a reload a moment later: the day\'s clock goes on (8 minutes stay 8 minutes)', await g.ev(() => G.sessionTime >= 480 && G.sessionTime < 520 && !G.day.over()), String(await g.ev(() => G.sessionTime)));
    const lateNight = await g.ev(() => { const d = new Date(); return d.getHours() === 23 && d.getMinutes() >= 45; }); // (11 minutes on would be tomorrow: a new day anyway)
    await reopen(11);
    check('hoy: opened again after a longer pause (11 minutes): the clock starts again, today\'s words stay', await g.ev(() => G.sessionTime < 20) && (lateNight || await g.ev(() => G.day.today().words.join() === 'manzana')), String(await g.ev(() => G.sessionTime)));
    await g.ev(() => { G.debug.dayShift = 0; G.st.saveNow(); });
    await g.ev(() => { G.st.learn('tres'); G.st.practiced('tres', true); });
    await g.frames(32);
    check('hoy: and what grows now joins it', await g.ev(() => { const d = G.day.today(); return d.words.join() === 'manzana,tres' && d.stars === 3; }));
    // home at sunset: the Hoy card has the whole day
    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over(), null, 'the sunset');
    await g.ev(() => { G.goto('casa', 4, 4, 'up'); });
    await g.drive(() => G.top().constructor.name === 'TodayCard', 'good night');
    check('hoy: the bedtime card shows the whole day: the word from before the reload too', await g.ev(() => G.top().words.join() === 'manzana,tres' && G.top().stars === 3), JSON.stringify(await g.ev(() => [G.top().words, G.top().stars])));
    await g.until(() => G.top().revealed() && G.top().wait > 30, null, 'all of today on the card');
    await g.shot('hoy_after_reload');
    await g.ev(() => { G.debug.sunsetAt = null; });
    await evening(g, morning);
    check('hoy: after the night it\'s a new day: an empty card, the stars from zero', await g.ev(() => { const d = G.day.today(), h = G.state.hist.hoy; return !d.words.length && d.stars <= 1 && h.d === G.today() && !h.w.length; }), JSON.stringify(await g.ev(() => G.day.today())));
    // a new date: a new day too
    await g.ev(() => { G.st.learn('cuatro'); G.st.saveNow(); });
    await g.ev(() => { G.debug.dayShift = 1; G.toTitle(); });
    await g.until(() => G.top().constructor.name === 'Title' && G.top().t > 32, null, 'the title');
    await g.tap(160, 180);
    await g.until(() => G.top().constructor.name === 'Slots' && G.input.ready(), null, 'the slot screen');
    await g.tapRect(await g.ev(() => G.top().cardRect(0)));
    await g.until(() => G.field && G.top() === G.field && G.fade.a === 0, null, 'back in the game');
    check('hoy: the next day (a new date): a new card', await g.ev(() => !G.day.today().words.length && G.state.hist.hoy.d === G.today()));
    check('hoy: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- after the Hoy card: to bed, or a night walk to a night animal; then the morning ----------
async function nightWalk(browser) {
  const { ctx, g } = await open(browser, 'day-walk', true);
  try {
    // she's been to the grandparents' (its story done) and hasn't met the possum that comes out there at night
    await playing(g, 'casa', 4, 4, { visit: ['villa', 'abuelos'], words: ['buenasnoches'], quests: { abuelos1: 'done', abuelos2: 'done', abuelos3: 'done' } });
    await g.fieldIdle('casa');
    check('walk: the place to go is the grandparents\', for the possum', await g.ev(() => G.day.walkTo() === 'abuelos' && G.day.nightOf('abuelos').map(n => n.kind + '@' + n.map).join() === 'tlacuache@abuelos'));
    // the beach has its night now (no beach-last rule): it is the walk when it is the only place with an unmet night animal, and it comes in its turn among the places she's been to
    check('walk: the beach and the grandparents\' both visited: the first place in the world\'s order, the beach not left last', await g.ev(() => { G.zones.visit('playa'); const first = G.zones.visitedIds().find(z => G.day.nightOf(z).some(n => !G.animals.met(n.kind))); return G.day.nightOf('playa').map(n => n.kind).join() === 'pulpo' && G.day.walkTo() === first && G.zones.ids().indexOf('playa') < G.zones.ids().indexOf('abuelos') === (first === 'playa'); }));
    check('walk: the beach the only place with an unmet night animal (the octopus): the walk goes there', await g.ev(() => { const v = G.state.world.visited, keep = v.abuelos; delete v.abuelos; const r = G.day.walkTo() === 'playa'; v.abuelos = keep; return r; }));
    await g.ev(() => { delete G.state.world.visited.playa; });
    const toChoice = async () => {
      await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
      await g.until(() => G.day.over(), null, 'the sunset');
      await g.ev(() => { G.goto('casa', 4, 4, 'up'); });
      await evening(g, () => G.top().constructor.name === 'BedOrWalk');
      await g.until(() => G.top().t > 22 && G.input.ready(), null, 'the choice');
    };
    await g.ev(() => { window.__scenes = []; const push = G.push; G.push = s => { window.__scenes.push(s.constructor.name); return push(s); }; });
    // 1. to bed: the evening as before
    await toChoice();
    check('walk: after the Hoy card, two big pictures: your bed (chosen already) or a night walk', await g.ev(() => { const s = G.top(); return s.sel === 0 && s.z.id === 'abuelos' && s.kind === 'tlacuache' && window.__speak.some(x => /dormir/.test(x.text)); }));
    await g.frames(30); await g.shot('bed_or_walk');
    await g.tapRect(await g.ev(() => G.top().rect(0)));
    await g.until(() => G.top().constructor.name === 'Night', null, 'the night');
    await evening(g, morning);
    check('walk: "¡A dormir!": the night and the morning, as before (no walk)', await g.ev(() => !G.day.walk && G.field.player.x === 6 && G.field.player.y === 3));
    // 2. a walk, the possum not found: home to bed after a while all the same
    await toChoice();
    await g.ev(() => { G.day.WALK_MAX = 4; window.__scenes = []; });
    await g.tapRect(await g.ev(() => G.top().rect(1)));
    await g.until(() => G.field.mapId === 'abuelos' && window.free(), null, 'the grandparents\' at night', 30000);
    check('walk: "¡A pasear!": the bus at night to the grandparents\', the moon up, the possum out in the orchard', await g.ev(() => G.day.over() && G.day.glow() > 0.9 && !!G.day.walk && !!G.animals.find('tlacuache')));
    check('walk: the arrow is on the possum', await g.ev(() => (G.guide.goal(G.field) || {}).why === 'night walk: tlacuache'));
    await g.frames(20); await g.shot('walk_arrival');
    await g.until(() => G.field.mapId === 'casa', null, 'home after a while', 30000);
    await evening(g, morning);
    check('walk: not found after a few minutes: home to bed, the night and the morning all the same (no second Hoy card)', await g.ev(() => !G.day.walk && G.field.player.x === 6 && !G.animals.met('tlacuache') && !window.__scenes.includes('TodayCard')), JSON.stringify(await g.ev(() => window.__scenes)));
    await g.ev(() => { G.day.WALK_MAX = 180; });
    // 3. a walk, the possum found: Lola names it, then home to bed
    await toChoice();
    await g.ev(() => { window.__scenes = []; });
    await g.tapRect(await g.ev(() => G.top().rect(1)));
    await g.until(() => G.field.mapId === 'abuelos' && window.free(), null, 'the grandparents\' at night', 30000);
    await g.ev(() => { const a = G.animals.find('tlacuache'), p = G.field.player; p.x = Math.floor(a.x / G.TILE) + 1; p.y = Math.floor(a.y / G.TILE); G.field.snapCam(); });
    await g.frames(10); await g.shot('walk_possum');
    await g.ev(() => { G.animals.tapped(G.field, G.animals.find('tlacuache')); }); // (a tap on it: field.js hands it to G.animals.tapped)
    await g.drive(() => G.words.met('tlacuache') && window.free(), 'Lola names the possum');
    check('walk: tapped, Lola names it: el tlacuache is met and in the album', await g.ev(() => G.words.met('tlacuache') && G.animals.met('tlacuache')));
    await g.until(() => G.field.mapId === 'casa', null, 'home to bed', 30000);
    let second = null; // the walk's own word on a short second card (it used to be on no card at all)
    await evening(g, morning, { hoy: async () => { second = await g.ev(() => G.top().words.join()); } });
    check('walk: then home: a short Hoy card with the walk\'s word only (el tlacuache), no second good night, the night and the morning', await g.ev(() => !G.day.walk && G.field.player.x === 6 && window.__scenes.filter(n => n === 'TodayCard').length === 1 && window.__scenes.includes('Night')) && second === 'tlacuache', JSON.stringify([second, await g.ev(() => window.__scenes)]));
    check('walk: with every night animal of her places met, the evening goes straight to bed again', await g.ev(() => G.day.walkTo() === null));
    check('walk: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

// ---------- the dog's warm-up (once a calendar day) and the morning greeting, with the evening ----------
async function warmup(browser) {
  const { ctx, g } = await open(browser, 'day-warmup', true, { warmup: true });
  try {
    // words met on an earlier day, due now; the sun already down when she opens the game
    await playing(g, 'villa', 5, 19, { words: ['buenasnoches', 'perro', 'gato', 'manzana', 'tres'] });
    await g.ev(() => { for (const id of ['perro', 'gato', 'manzana', 'tres']) { const r = G.words.rec(id); r.mdate = '2026-1-1'; r.ms = 0; r.due = null; r.dd = 0; r.dc = 0; } G.debug.sunsetAt = 0; });
    await g.frames(120);
    check('warm-up: it waits while it\'s evening (the sun down)', await g.ev(() => !G.warmup.running() && !G.warmup.done() && G.warmup.wait(G.field) === 'evening'));
    check('greeting: in the evening, "buenas noches"', await g.ev(() => G.hearts.greetKind() === 'noches'));
    await g.ev(() => { G.goto('casa', 4, 4, 'up'); });
    await evening(g, () => G.top().constructor.name === 'Night' || G.warmup.running());
    check('warm-up: not during the evening at home', await g.ev(() => !G.warmup.running()));
    await g.ev(() => { G.debug.sunsetAt = null; });
    await evening(g, () => G.warmup.running() || (window.free() && G.field.mapId === 'casa' && !G.day.over() && G.sessionTime > 1));
    await g.until(() => G.warmup.running() || (window.free() && G.sessionTime > 8), null, 'the warm-up in the morning', 30000);
    check('warm-up: the next morning (the same date) it comes, once', await g.ev(() => G.warmup.running() && G.warmup.done()));
    check('greeting: in the morning, "buenos días"', await g.ev(() => G.sessionTime < 300 && G.hearts.greetKind() === 'dias'));
    await g.ev(() => G.warmup.skip());
    await g.until(() => !G.warmup.running() && window.free(), null, 'the warm-up skipped');
    // another evening and night on the same date: no second warm-up
    await g.ev(() => { G.debug.sunsetAt = G.sessionTime + 1; });
    await g.until(() => G.day.over(), null, 'the sunset');
    await g.ev(() => { G.goto('casa', 4, 4, 'up'); });
    await evening(g, morning);
    await g.frames(150);
    check('warm-up: after a second night the same date, not again (once a calendar day)', await g.ev(() => !G.warmup.running() && G.warmup.done() && G.state.hist.wu.n + G.state.hist.wu.k === 1), JSON.stringify(await g.ev(() => G.state.hist.wu)));
    check('warm-up: no console errors', !g.errors.length, g.errors.join('\n'));
  } finally { await ctx.close(); }
}

run('A day in a 15-minute sitting', [['music', music], ['the sunset', sunset], ['the Hoy card by date', hoy], ['night on every map', nightWash], ['the night walk', nightWalk], ['the warm-up and the greetings', warmup]]);
