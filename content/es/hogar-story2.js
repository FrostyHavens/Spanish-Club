// ===== En casa, chapters 3 and 4 (docs/UNIT_EN_CASA.md): Los tacos de Papá, Agua de limón =====
// 3  Leo is hungry too (patio). Papá builds a taco on the table in three steps she sees on the map: a tortilla, the
//    beans, the fold. She tells Leo ¡come! and then the dog.            hermano, tortilla, frijoles, taco, come
// 4  Mamá is thirsty (her room). Limes in the patio, Papá makes agua de limón, a glass for Mamá, an avocado from its
//    tree, rice on the table, and the whole family sits down together.   lamama, sed, limon, aguacate, arroz
// Every new word is a one-unknown puzzle (G.intro.*) and comes back in a line or a review question within a minute or
// two. Only `hola` and the unit's own words are taken for granted: any other word (agua) is used only when it is met.
// The saved state of each chapter is c.data; the pictures on the table are drawn from it, so a save in the middle of
// a beat opens on the same table. Leo and Mamá in the kitchen are guests (as in story-c01-c10.js): the real ones stay
// in the yard and in her room.
'use strict';
(function () {
  const CH = G.chapters, CK = CH.K, T = CK.T, TL = G.TILE;
  const MD = G.MAPDATA, P = (m, tag) => MD[m].pos[tag];
  const say = CK.say, ask = CK.ask;
  const met = id => !!(G.words && G.words.met(id));
  const the = (id, o) => G.requests.the(id, o);
  const bag = () => G.errands.bag;
  const L = G.requests.LINES;

  // lines built from a word (G.requests.LINES: tools/test-spanish.js runs every word through them)
  L['hogar.soy'] = id => '¡Soy ' + the(id, { my: 'tu' }) + '!';   // ¡Soy tu [hermano]!
  L['hogar.y'] = id => '¡Y ' + the(id) + '!';                       // ¡Y los [frijoles]!
  L['hogar.a'] = id => '¡' + the(id, { pre: 'a', cap: 1 }) + '!';   // ¡A la [mesa]!
  L['hogar.mmm'] = id => '¡Mmm! ' + the(id, { cap: 1, bang: 1 });  // ¡Mmm! ¡El [aguacate]!

  // ---------- small helpers ----------
  const npcAt = (f, id) => f.npcs.find(n => n.id === id && !n.hidden) || null;
  // someone who is not on this map, standing in for a scene (Leo in the kitchen, Mamá at the table), then gone again
  function guest(f, id, x, y, dir) { let n = f.npc(id + '_g'); if (!n) n = f.addNpc({ id: id + '_g', npc: id, x, y, dir: dir || 'down', fixed: true, guest: true }); return n; }
  const unguest = (f, id) => f.removeNpc(id + '_g');
  // the real Leo while his guest is in the kitchen: not seen, not wandering, and not standing on a tile of the yard (the
  // field counts the hidden when it asks "is this tile free?"); put back where he plays when the guest is done
  function parkLeo(n) { if (!n) return; if (!n.parked) n.parked = [n.x, n.y, n.wander]; n.hidden = true; n.wander = 0; n.x = PARK[0]; n.y = PARK[1]; n.ox = 0; n.oy = 0; }
  function unparkLeo(n) { if (!n || !n.parked) return; const q = n.parked; n.parked = null; n.hidden = false; n.wander = q[2]; n.x = q[0]; n.y = q[1]; n.home = [q[0], q[1]]; }
  // two known words to stand beside a new one in its puzzle: the ones named first, if met, then any others
  const others = (id, prefer) => prefer.filter(k => k !== id && met(k)).concat(G.intro.known(id, 3)).filter((k, i, a) => a.indexOf(k) === i && k !== id).slice(0, 2);
  // a new word, held up and named (a one-unknown puzzle); a word already met (a beat played again after a reload) is not asked again
  function* meet(id, o) {
    if (met(id)) return false;
    yield* G.intro.show(id, Object.assign({ how: 'show', known: others(id, o.prefer || []) }, o));
    return true;
  }
  const puffAt = (kind, n, o) => CK.puff(kind, n.x * TL + 12 + (n.ox || 0), n.y * TL - 2 + (n.oy || 0), o);
  const hearts = (n, k = 3) => { for (let i = 0; i < k; i++) CK.puff('heart', n.x * TL + 6 + i * 6 + (n.ox || 0), n.y * TL - 4 + (n.oy || 0), { life: 50 + i * 8, vy: -0.4 }); };
  const give = (who, n, why) => { if (G.hearts) G.hearts.add(who, n, why || 'care'); };
  // a picture drawn on the map at a tile (a world position, so it moves with the camera)
  const pic = (ctx, f, id, tx, ty, dx, dy, scale) => G.drawIcon16(ctx, id, Math.round(tx * TL + dx - f.cam.x), Math.round(ty * TL + dy - f.cam.y), scale);
  const FX = { flip: -999, squeeze: -999 }; // (what is happening now, only for drawing: nothing here is saved)

  const TABLE = P('cocina', 'table'), TABLE_AT = [TABLE[0] + 1, TABLE[1]];     // the middle of the table: (6,5)
  const STOVE = P('cocina', 'stove'), PAPA = P('cocina', 'papa'), CDOOR = P('cocina', 'door');
  const BELOW = P('cocina', 'mesaLibre2');                                      // the free tile south of it (6,6)
  const LEO_SIT = P('cocina', 'chair1');                                        // Leo eats on the chair at the north-west corner (5,4): the dialogue box covers the south side of the table
  const LEO_FACE = 'down';                                                      // (facing the table)
  const LEO_WAIT = [CDOOR[0] + 3, CDOOR[1]];                                    // where Leo waits for the taco (3,5)
  // Papá stands beside the table (east end) while the taco is made, so both free tiles of the spot at the middle of the
  // table (north and south of it) are left to her; with him on one of them the dog on the other would shut the spot
  const PAPA_SIDE = P('cocina', 'mesaEste');                                    // (8,5)
  const PARK = [0, 3];                                                          // a fence tile of the yard: nobody walks or blocks there
  const PDOOR = P('patio', 'door');
  const LIME = P('patio', 'limonTronco'), AVO = P('patio', 'aguacateTronco');

  // =====================================================================
  //  3 · Los tacos de Papá  (Leo in the patio, Papá at the stove)  hermano, tortilla, frijoles, taco, come
  // =====================================================================
  CH.script('hogar3', [
    { who: 'leo', run: function* (f, c) { // Leo is hungry; he is her brother; he runs ahead to the kitchen
      const leo = f.npc('leo');
      yield* say('leo', T('¡[hambre:Tengo hambre]!', 'I\'m hungry!'));
      yield* meet('hermano', { who: 'leo', prompt: L['hogar.soy']('hermano'), en: 'I\'m your brother!', prefer: ['elpapa', 'cocina'] });
      yield* say('leo', T('¡' + the('cocina', { pre: 'a', cap: 1 }) + '!', 'To the kitchen!'));
      if (leo && !leo.hidden) { yield* CK.walk(f, leo, PDOOR[0], PDOOR[1], 4); parkLeo(leo); }
      c.data.leoIn = 1; c.data.leoPos = LEO_WAIT;
    } },
    { who: 'papa', bubble: true, run: function* (f, c) { // the first step: a tortilla, flipped on the stove
      const d = c.data;
      yield* say('papa', T('¡[hola], {name}! ¡Mira!', 'Hi, {name}! Look!'));
      FX.flip = G.frame; G.audio.sfx('pop'); yield 28; G.audio.sfx('pop'); yield 28;
      yield* meet('tortilla', { who: 'papa', en: 'Look! A tortilla!', prefer: ['sopa', 'plato'] });
      if (!d.tort && !bag().has('tortilla', { q: 'hogar3' })) bag().add('tortilla', { q: 'hogar3' });
      yield* say('papa', T(L['hogar.a']('mesa'), 'To the table! (carry the tortilla there)'));
    } },
    { spot: { map: 'cocina', at: TABLE_AT, icon: 'tortilla' }, run: function* (f, c) { // the tortilla on the table; beans; the fold
      const d = c.data, papa = npcAt(f, 'papa');
      if (!d.tort) { bag().take('tortilla', { q: 'hogar3' }); d.tort = 1; G.audio.sfx('pop'); CK.sparkle(f, TABLE_AT[0], TABLE_AT[1], 4); yield 12; }
      yield* say('papa', T('¡Muy bien!', 'Well done!'));
      d.pot = 1; d.papaAt = 1; // Papá comes over with the pot of beans
      if (papa) { yield* CK.walk(f, papa, PAPA_SIDE[0], PAPA_SIDE[1], 3); papa.dir = 'left'; }
      d.pot = 0;
      yield* meet('frijoles', { who: 'papa', prompt: L['hogar.y']('frijoles'), en: 'And the beans!', prefer: ['tortilla', 'sopa'] });
      if (!d.beans) { d.beans = 1; G.audio.sfx('pop'); CK.sparkle(f, TABLE_AT[0], TABLE_AT[1], 4); yield 20; }
      if (!d.fold) { d.fold = 1; G.audio.sfx('item'); CK.sparkle(f, TABLE_AT[0], TABLE_AT[1], 5); yield 20; }
      yield* meet('taco', { who: 'papa', prompt: G.requests.LINES.un('taco'), en: 'A taco!', prefer: ['tortilla', 'frijoles'] });
    } },
    // (a save at any point of this beat opens on it again: `ate` keeps the beat open once the taco is eaten, and nothing the beat
    // needs to find its way back is changed before its last line)
    { spot: { map: 'cocina', at: TABLE_AT, icon: 'taco' }, when: c => !!(c.data.fold || c.data.ate), run: function* (f, c) { // she tells Leo to eat
      const d = c.data, leo = f.npc('leo_g') || guest(f, 'leo', LEO_WAIT[0], LEO_WAIT[1], 'right');
      if (!d.ate) {
        yield* say('papa', T('¡Para Leo!', 'For Leo!'));
        d.leoPos = LEO_SIT; yield* CK.walk(f, leo, LEO_SIT[0], LEO_SIT[1], 3); leo.dir = LEO_FACE;
        const bite = function* () { for (let k = 0; k < 2; k++) { leo.dir = LEO_FACE; G.audio.sfx('pop'); puffAt('heart', leo, { life: 50, vy: -0.35 }); yield 14; } };
        yield* G.intro.watch('come', { who: 'papa', prompt: '¡[come], Leo!', en: 'Eat, Leo! (Papá tells Leo to eat)', act: bite,
          ask: 'Leo... ¡...!', askEn: 'Now you tell Leo to eat! (say it, or tap it)', known: others('come', ['sopa', 'rico']) });
        d.ate = 1; // the taco is eaten (the table is drawn empty from now on)
        hearts(leo, 3); give('leo', 1);
      }
      leo.dir = LEO_FACE;
      yield* say('leo', T('¡[rico:Qué rico]!', 'Yummy!'));
      yield* G.review.ask('hermano', { who: 'papa' }); // (Leo, again, within a minute)
      yield* G.review.ask('taco', { who: 'papa' });    // (and the taco: none of the three foods was asked again)
    } },
    { who: 'canelo', bubble: 'come', run: function* (f, c) { // and {dog} gets a piece
      const d = c.data, dog = CK.dog(f), leo = f.npc('leo_g'), papa = npcAt(f, 'papa');
      yield* say('papa', T('¡Y {dog}!', 'And {dog}!'));
      yield* ask(null, '{dog}... ¡...!', 'Tell {dog} to eat! (say it, or tap it)', 'come', others('come', ['sopa', 'rico']), { point: dog });
      yield* G.pet.play('eat'); CK.heart(f, dog); give('canelo', 1);
      if (leo) { leo.dir = 'down'; yield* say('leo', T('¡[come], {dog}!', 'Eat, {dog}!')); }
      d.leoPos = null; d.leoOut = 1; // Leo goes back out to the yard (the real Leo is there again when the yard opens)
      if (leo) { yield* CK.walk(f, leo, CDOOR[0] + 1, CDOOR[1], 3); unguest(f, 'leo'); }
      if (papa) { d.papaAt = 0; yield* CK.walk(f, papa, PAPA[0], PAPA[1], 3); papa.dir = 'up'; }
      unparkLeo(f.npc('leo')); // (she tapped the dog in the yard: the real Leo plays there again)
    } },
  ], {
    stage(f, c) {
      const d = c.data, on = CH.active('hogar3');
      if (f.mapId === 'patio') { const n = f.npc('leo'); if (on && d.leoIn && !d.leoOut) parkLeo(n); else unparkLeo(n); } // Leo is in the kitchen
      if (!on || f.mapId !== 'cocina') return;
      if (d.leoIn && !d.leoOut) { const n = guest(f, 'leo', ...(d.leoPos || LEO_WAIT), 'right'); if (!n.busy) CK.place(f, 'leo_g', ...(d.leoPos || LEO_WAIT), d.leoPos ? LEO_FACE : 'right'); }
      const pa = npcAt(f, 'papa'); if (pa && !pa.busy) { if (d.papaAt) CK.place(f, 'papa', PAPA_SIDE[0], PAPA_SIDE[1], 'left'); else CK.place(f, 'papa', PAPA[0], PAPA[1], 'up'); }
    },
    draw(f, ctx, c) { // the taco on the table, step by step
      if (f.mapId !== 'cocina' || !CH.active('hogar3')) return;
      const d = c.data;
      if (d.ate) return;
      if (d.fold) pic(ctx, f, 'taco', TABLE_AT[0], TABLE_AT[1], 4, 0);
      else if (d.tort) { pic(ctx, f, 'tortilla', TABLE_AT[0], TABLE_AT[1], 4, 0); if (d.beans) pic(ctx, f, 'frijoles', TABLE_AT[0], TABLE_AT[1], 8, 4, 0.5); }
    },
    drawTop(f, ctx, c) {
      if (f.mapId !== 'cocina' || !CH.active('hogar3')) return;
      const k = G.frame - FX.flip;
      if (k >= 0 && k < 64) pic(ctx, f, 'tortilla', STOVE[0], STOVE[1], 4, 2 - Math.round(Math.sin(k / 32 * Math.PI) * 12) - 6); // the tortilla flips over the stove
      const pa = c.data.pot && npcAt(f, 'papa');
      if (pa) pic(ctx, f, 'frijoles', pa.x, pa.y, 4 + (pa.ox || 0), -16 + (pa.oy || 0), 0.75); // the pot of beans, carried
    },
  });

  // =====================================================================
  //  4 · Agua de limón  (Mamá in her room, the yard, Papá)  lamama, sed, limon, aguacate, arroz
  // =====================================================================
  const AGUA = () => (met('agua') ? '[agua]' : 'Agua'); // (agua is a town word: marked only once it is met)
  function* walkPlayer(f, x, y) { const p = f.player; yield* f.walkNpc(p, CK.path(f, p, x, y), 3); }
  // (Mamá and Papá, who speak at the table, sit on the north side: the dialogue box covers the south side of the room)
  const CHAIRS = { mama: P('cocina', 'chair1'), papa: P('cocina', 'chair2'), leo: P('cocina', 'chair4'), me: P('cocina', 'chair3') };
  CH.script('hogar4', [
    { who: 'mama', bubble: true, run: function* (f, c) { // Mamá is hot and thirsty
      const ma = f.npc('mama');
      yield* meet('lamama', { who: 'mama', prompt: L['hogar.soy']('lamama'), en: 'I\'m your mom!', prefer: ['elpapa', 'hermano', 'cocina'] });
      if (ma) for (let k = 0; k < 3; k++) { puffAt('drop', ma, { life: 36, vy: 0.5 }); G.audio.sfx('select'); yield 12; } // she fans herself
      yield* meet('sed', { who: 'mama', prompt: '¡Uf! ¡[sed:Tengo sed]!', en: 'Phew! I\'m thirsty!', prefer: ['sopa', 'cocina'] });
    } },
    { spot: { map: 'patio', at: LIME, icon: 'limon' }, run: function* (f, c) { // a lime at the tree
      const d = c.data;
      CK.sparkle(f, LIME[0], LIME[1] - 1, 4); G.audio.sfx('pop'); yield 14;
      yield* meet('limon', { who: null, en: 'Look! A lime!', prefer: ['sopa', 'cocina'] });
      if (!d.juice && !bag().has('limon', { q: 'hogar4' })) bag().add('limon', { q: 'hogar4' });
    } },
    { who: 'papa', bubble: 'limon', run: function* (f, c) { // Papá squeezes it: agua de limón; a glass for Mamá
      const d = c.data, papa = npcAt(f, 'papa');
      if (!d.juice) { bag().take('limon', { q: 'hogar4' }); d.juice = 1; }
      yield* say('papa', T('¡Mmm!', 'Mmm!'));
      FX.squeeze = G.frame;
      for (let k = 0; k < 3; k++) { G.audio.sfx('pop'); if (papa) puffAt('drop', papa, { life: 30, vy: 0.6 }); yield 14; }
      yield* say('papa', T('¡' + AGUA() + ' de [limon:limón]!', 'Lime water!'));
      yield* G.review.ask('limon', { who: 'papa' });
      yield* ask('papa', G.requests.LINES.un('vaso') + ' ¿Para quién?', 'A glass! Who is it for?', 'lamama', others('lamama', ['elpapa', 'hermano']), { show: 'vaso' });
      if (!bag().has('vaso', { q: 'hogar4' })) bag().add('vaso', { q: 'hogar4' });
    } },
    { who: 'mama', bubble: 'vaso', run: function* (f, c) { // Mamá drinks
      const ma = f.npc('mama');
      bag().take('vaso', { q: 'hogar4' }); G.audio.sfx('pop'); yield 16;
      if (ma) hearts(ma, 3);
      give('mama', 1);
      yield* say('mama', T('¡[rico:Qué rico]!', 'Yummy!'));
      yield* G.review.ask('sed', { who: 'mama' });
      yield* CK.sayShow('mama', { icon: 'aguacate' }, T(L['hogar.mmm']('aguacate'), 'Mmm! An avocado! (pick one in the yard)'));
    } },
    { spot: { map: 'patio', at: AVO, icon: 'aguacate' }, run: function* (f, c) { // an avocado at its tree
      CK.sparkle(f, AVO[0], AVO[1] - 1, 4); G.audio.sfx('pop'); yield 14;
      yield* meet('aguacate', { who: null, en: 'Look! An avocado!', prefer: ['limon', 'sopa'] });
      if (!bag().has('aguacate', { q: 'hogar4' })) bag().add('aguacate', { q: 'hogar4' });
    } },
    { who: 'papa', bubble: 'aguacate', run: function* (f, c) { // the avocado for Papá; rice on the table
      const d = c.data;
      bag().take('aguacate', { q: 'hogar4' });
      yield* say('papa', T('¡Muy bien, {name}!', 'Well done, {name}!'));
      if (!d.rice) { d.rice = 1; G.audio.sfx('item'); CK.sparkle(f, TABLE_AT[0], TABLE_AT[1], 5); yield 20; }
      yield* meet('arroz', { who: 'papa', prompt: G.requests.LINES.un('arroz'), en: 'Rice!', prefer: ['aguacate', 'sopa', 'frijoles'] });
      yield* G.review.ask('aguacate', { who: 'papa' });
      yield* say('papa', T(L['hogar.a']('mesa'), 'To the table!'));
    } },
    { auto: 'cocina', when: c => !!c.data.rice, run: function* (f, c) { // the whole family sits down
      const papa = npcAt(f, 'papa'), pl = f.player;
      const ma = guest(f, 'mama', CDOOR[0] + 1, CDOOR[1] - 1, 'right'), leo = guest(f, 'leo', CDOOR[0] + 1, CDOOR[1] + 1, 'right');
      G.audio.sfx('door');
      yield* CK.walk(f, ma, CHAIRS.mama[0], CHAIRS.mama[1], 3); ma.dir = 'down';
      yield* CK.walk(f, leo, CHAIRS.leo[0], CHAIRS.leo[1], 3); leo.dir = 'up';
      if (papa) { yield* CK.walk(f, papa, CHAIRS.papa[0], CHAIRS.papa[1], 3); papa.dir = 'down'; }
      yield* walkPlayer(f, CHAIRS.me[0], CHAIRS.me[1]); pl.dir = 'up';
      yield 16;
      if (papa) { yield* say('papa', T('¡[come], {name}!', 'Eat, {name}!')); hearts(papa, 2); }
      yield* say('mama', T('¡Mmm! ¡[rico:Qué rico]!', 'Mmm! Yummy!')); hearts(ma, 2);
      yield* say('leo', T('¡[arroz]! ¡[rico:Qué rico]!', 'Rice! Yummy!')); hearts(leo, 2);
      CK.confetti(); G.audio.jingle('item'); give('papa', 1); give('mama', 1); give('leo', 1);
      yield 50;
      // everyone gets up again: Mamá and Leo go, Papá back to the stove, her beside the table
      yield* walkPlayer(f, BELOW[0], BELOW[1]);
      yield* CK.walk(f, ma, CDOOR[0] + 1, CDOOR[1], 3); unguest(f, 'mama');
      yield* CK.walk(f, leo, CDOOR[0] + 1, CDOOR[1], 3); unguest(f, 'leo');
      if (papa) { yield* CK.walk(f, papa, PAPA[0], PAPA[1], 3); papa.dir = 'up'; }
    } },
  ], {
    stage(f, c) {
      if (!CH.active('hogar4') || f.mapId !== 'cocina') return;
      const pa = npcAt(f, 'papa'); if (pa && !pa.busy) CK.place(f, 'papa', PAPA[0], PAPA[1], 'up');
    },
    draw(f, ctx, c) { // the bowl of rice on the table
      if (f.mapId === 'cocina' && CH.active('hogar4') && c.data.rice) pic(ctx, f, 'arroz', TABLE_AT[0], TABLE_AT[1], 4, 0);
    },
    drawTop(f, ctx, c) { // the lime over Papá's hands while he squeezes it
      if (f.mapId !== 'cocina' || !CH.active('hogar4')) return;
      const k = G.frame - FX.squeeze, pa = npcAt(f, 'papa');
      if (pa && k >= 0 && k < 44) pic(ctx, f, 'limon', pa.x, pa.y, 4, -14 + Math.round(Math.sin(k / 3) * 2), 0.75);
    },
  });
})();
