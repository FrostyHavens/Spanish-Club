// ===== El hogar: the two new rooms of her house, and the people in them (docs/UNIT_EN_CASA.md) =====
// La cocina (the kitchen, indoors) is through a doorway in the east wall of her room: Papá cooks at the stove, there is a
// shelf of plates, glasses and spoons, a table with four chairs, a fridge, a sink and a window. Its back door leads to
// el patio (the back yard, outdoors, so it gets the night wash like the other outdoor maps): a lemon tree, an avocado
// tree, a small vegetable bed, the clothes line, a sandpit where Leo (her little brother) plays, flowers, a fence all
// round and a spot where Canelo digs. Both maps are part of Villa Sol's zone (content/es/zone-villa.js).
// This file is the rooms and the people only: the story (chapters hogar1..hogar4) is written in other files, so for now
// the four chapters are in the table with no script (CH.gate says 'unwritten': nobody waits on them, no bubble, no row
// in Misiones or the Learning page) and Papá and Leo only say hello. The coordinates the story needs are in
// G.MAPDATA.cocina.pos and G.MAPDATA.patio.pos (tools/mapgen.py).
// Loaded after src/zones.js and before content/es/zone-villa.js (which lists the maps and marks the kitchen indoor).
'use strict';
(function () {
  const K = G.mapKit, MD = G.MAPDATA, CH = G.chapters;
  const P = (m, tag) => MD[m].pos[tag];
  const T = (t, en) => ({ t, en });

  // who has a bubble over their head: the story's, then a present, a favour, hide-and-seek (as in src/maps.js)
  const alertOf = who => () => (CH && CH.alert(who)) || (G.errands && G.errands.alert(who)) || (G.favores && G.favores.alert(who)) || (G.seek && G.seek.alert(who)) || null;

  // ---------- la cocina ----------
  G.maps.cocina = {
    name: 'La cocina', icon: 'cocina', rows: MD.cocina.rows, music: 'headquarters', indoor: true, line: 'hogar', // (the home song goes on from her room without starting again)
    exits: [
      { x: P('cocina', 'door')[0], y: P('cocina', 'door')[1], to: 'casa', tx: 7, ty: 4, dir: 'left' }, // back in her room, beside the doorway
      { x: P('cocina', 'patioDoor')[0], y: P('cocina', 'patioDoor')[1], to: 'patio', tx: P('patio', 'in')[0], ty: P('patio', 'in')[1], dir: 'down' },
    ],
    // the table and its chairs name themselves (the stove, the shelf, the fridge, the sink and the window have no word)
    things: { tiles: { t: 'mesa', 'ë': 'silla' } },
    pages: K.pages('cocina'),
    npcs: [
      K.canelo(3, 6),
      { id: 'papa', npc: 'papa', x: P('cocina', 'papa')[0], y: P('cocina', 'papa')[1], dir: 'up', fixed: true, // at the stove
        alert: alertOf('papa'),
        talk: K.talker('papa', function* () { yield* K.say('papa', T('¡[hola], {name}!', 'Hi, {name}!')); }) },
    ],
  };

  // ---------- el patio ----------
  G.maps.patio = {
    name: 'El patio', icon: 'arbol', rows: MD.patio.rows, music: 'town', line: 'hogar',
    exits: [{ x: P('patio', 'door')[0], y: P('patio', 'door')[1], to: 'cocina', tx: P('cocina', 'patioDoor')[0] - 1, ty: P('cocina', 'patioDoor')[1], dir: 'left' }],
    // Canelo's digging spot (a bone, once a day, like the beach's shells)
    dogSpots: [{ id: 'patio_hueso', at: P('patio', 'dog'), act: 'dig', gives: 'hueso', every: 'day' }],
    pages: K.pages('patio'),
    ambient: { birds: 3, butterflies: 3 },
    // the trees name themselves on any of their tiles (the crown and the trunk under it)
    things: { tiles: { 'ô': 'limon', 'õ': 'aguacate' }, at: {
      [P('patio', 'limonTronco').join(',')]: 'limon', [P('patio', 'aguacateTronco').join(',')]: 'aguacate' } },
    npcs: [
      K.canelo(4, 5),
      { id: 'leo', npc: 'leo', x: P('patio', 'leo')[0], y: P('patio', 'leo')[1], dir: 'down', wander: 2, // plays about the sandpit
        alert: alertOf('leo'),
        talk: K.talker('leo', function* () { yield* K.say('leo', T('¡[hola]!', 'Hi!')); }) },
    ],
  };

  // ---------- the doorway from her room ----------
  // One more exit on the east wall of casa (the front door stays exits[0]: chapters' door beats read it). Until the puppy
  // has been found (chapter 1) the doorway is Mamá's "wait", like the front door: the puppy's game is in this room.
  G.maps.casa.exits.push({
    x: P('casa', 'cocinaDoor')[0], y: P('casa', 'cocinaDoor')[1], to: 'cocina', tx: P('cocina', 'door')[0] + 1, ty: P('cocina', 'door')[1], dir: 'right',
    run: function* (f) {
      if (!CH || CH.done('c1')) return true;
      K.stepBack(f, 'left');
      yield* K.say('mama', T('¡{name}! ¡Espera!', '{name}! Wait a moment! (stay with Mamá)'));
      return false;
    },
  });

  // The two maps' own line of story ('hogar') is the one to ask about while she is in them (chapters.js lineHere reads the
  // zone, and these maps are Villa Sol's). Everywhere else it is as it was.
  const lineHere = CH.lineHere;
  CH.lineHere = function () {
    const f = G.field, l = f && f.def && f.def.line;
    return l && CH.lines().indexOf(l) >= 0 ? l : lineHere();
  };

  // ---------- things to pick up: lemons and an avocado, picked from the tile beside the tree ----------
  // (an unmet word's thing is a picture and a "?": carry.js, fine to pick up before the chapter)
  G.carry.SOURCES.push(
    { id: 'limon_patio1', map: 'patio', at: P('patio', 'limon1'), item: 'limon', every: 150, tree: P('patio', 'limonCopa'), fruit: '#f8e040' },
    { id: 'limon_patio2', map: 'patio', at: P('patio', 'limon2'), item: 'limon', every: 150, tree: P('patio', 'limonCopa'), fruit: '#f8e040' },
    { id: 'aguacate_patio1', map: 'patio', at: P('patio', 'aguacate1'), item: 'aguacate', every: 200, tree: P('patio', 'aguacateCopa'), fruit: '#7aa032' },
  );

  // ---------- the unit's four chapters (docs/UNIT_EN_CASA.md): in the table, with no script yet ----------
  CH.add({ id: 'hogar1', line: 'hogar', title: '¡Tengo hambre!', en: 'I\'m hungry! Papá is cooking soup: you say you are hungry, taste it and say how good it is', giver: 'papa', words: ['elpapa', 'cocina', 'hambre', 'sopa', 'rico'], icon: 'sopa', col: '#e0782a' });
  CH.add({ id: 'hogar2', line: 'hogar', title: 'Pon la mesa', en: 'Set the table: carry the plates, glasses and spoons from the shelf to the table', giver: 'papa', words: ['mesa', 'silla', 'plato', 'vaso', 'cuchara'], icon: 'plato', col: '#4a86c8' });
  CH.add({ id: 'hogar3', line: 'hogar', title: 'Los tacos de Papá', en: 'Papá\'s tacos: build a taco step by step and tell Leo (and the dog) to eat', giver: 'leo', words: ['hermano', 'tortilla', 'frijoles', 'taco', 'come'], icon: 'taco', col: '#e8b030' });
  CH.add({ id: 'hogar4', line: 'hogar', title: 'Agua de limón', en: 'Lemon water: Mamá is thirsty; pick lemons and an avocado in the yard and the family sits down together', giver: 'mama', words: ['lamama', 'sed', 'limon', 'aguacate', 'arroz'], icon: 'limon', col: '#7cb830' });
})();
