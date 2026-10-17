// ===== El bosque: its path from Villa Sol and its first map (a PLACEHOLDER: docs/WORLD_PLAN.md) =====
// The framework step (2026-10-17) built the way there and a small first place: the zone's signpost, its bus stop, the
// dog's thing to do, Lola (the friend who travels) and Nico's hiding places. A later step replaces this file's
// G.maps.bosque with the whole zone (woodland animals and big / small: el oso, el zorro, la ardilla, el búho, el ciervo, el erizo, la hoja, grande, pequeño...), following docs/WORLD_PLAN.md
// ("How to build a zone"). Keep the zone id, the path map and the bus stop: saves remember where the child has been.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA;
  const P = (m, tag) => MD[m].pos[tag];

  // ---------- the path from Villa Sol: the trees get thicker, a pond with a frog, rabbits, a fallen branch ----------
  G.maps.camino_bosque = {
    name: 'El camino al bosque', icon: 'bosque', rows: MD.camino_bosque.rows, music: 'field',
    exits: [Z.edge(6, 25, 'villa', 10, 1, 'down'), Z.edge(6, 0, 'bosque', 10, 12, 'up')],
    posts: [{ at: P('camino_bosque', 'postS'), zone: 'villa', dir: 'down' }, { at: P('camino_bosque', 'postN'), zone: 'bosque', dir: 'up' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'rana', area: 'rana' }, { kind: 'conejo', area: 'conejos' }],
    things: {},
    npcs: [K.canelo(6, 23)],
  };

  // ---------- El bosque: the first map ----------
  G.maps.bosque = {
    name: 'El bosque', icon: 'bosque', rows: MD.bosque.rows, music: 'castle',
    exits: [Z.edge(10, 13, 'camino_bosque', 6, 1, 'down')],
    posts: [{ at: P('bosque', 'post'), zone: 'bosque' }],
    dogSpots: [{ id: 'bosque_tronco', at: P('bosque', 'dog'), act: 'sniff', gives: 'palo', every: 120 }],
    ambient: { birds: 3, butterflies: 3 },
    animals: [{ kind: 'conejo', n: 2, area: 'conejos' }, { kind: 'rana', area: 'rana' }],
    things: {},
    npcs: [K.canelo(10, 11), Z.lola(...P('bosque', 'lola'), 'bosque'), Z.nico(...P('bosque', 'nico'))],
  };

  // things to pick up (carry.js) and Nico's hiding places here (seek.js: one game per zone)
  G.carry.SOURCES.push(...[{ id: 'palo_cbosque', map: 'camino_bosque', at: P('camino_bosque', 'palo'), item: 'palo', every: 90 }], ...[]);
  G.seek.SPOTS.push(...[
    { id: 'bosque1', map: 'bosque', at: P('bosque', 'hide1'), how: 'over', cut: 20, dx: 0, kinds: ['gato', 'conejo'], place: 'bosque' },
    { id: 'bosque2', map: 'bosque', at: P('bosque', 'hide2'), how: 'over', cut: 9, dx: 0, kinds: ['conejo', 'gato', 'rana'], place: 'bosque' },
    { id: 'bosque3', map: 'bosque', at: P('bosque', 'hide3'), how: 'over', cut: 9, dx: 0, kinds: ['conejo', 'gallina', 'pato'], place: 'bosque' },
  ]);

  const bus = P('bosque', 'bus'), busIn = P('bosque', 'busIn');
  Z.add({
    id: 'bosque', name: 'El bosque', en: 'the forest', icon: 'bosque', music: 'castle', pos: [160, 34],
    maps: ['bosque'], path: 'camino_bosque',
    bus: { map: 'bosque', at: bus }, entry: { map: 'bosque', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: [],   // (the zone's own animals, its album page: added with the zone, docs/WORLD_PLAN.md)
    planned: 7,    // (album entries still to come: shown as numbered "?" until the zone is built)
  });
})();
