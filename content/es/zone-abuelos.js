// ===== La casa de los abuelos: its path from Villa Sol and its first map (a PLACEHOLDER: docs/WORLD_PLAN.md) =====
// The framework step (2026-10-17) built the way there and a small first place: the zone's signpost, its bus stop, the
// dog's thing to do, Lola (the friend who travels) and Nico's hiding places. A later step replaces this file's
// G.maps.abuelos with the whole zone (family, body and clothes: el abuelo, la abuela, la mano, la cabeza, el sombrero, los zapatos...), following docs/WORLD_PLAN.md
// ("How to build a zone"). Keep the zone id, the path map and the bus stop: saves remember where the child has been.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA;
  const P = (m, tag) => MD[m].pos[tag];

  // ---------- the path from Villa Sol: wheat fields, a fence, hens, an apple tree ----------
  G.maps.camino_abuelos = {
    name: 'El camino a la casa de los abuelos', icon: 'abuelos', rows: MD.camino_abuelos.rows, music: 'field',
    exits: [Z.edge(6, 0, 'villa', 5, 26, 'up'), Z.edge(6, 23, 'abuelos', 10, 1, 'down')],
    posts: [{ at: P('camino_abuelos', 'postN'), zone: 'villa', dir: 'up' }, { at: P('camino_abuelos', 'postS'), zone: 'abuelos', dir: 'down' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'gallina', n: 2, area: 'gallinas' }],
    things: {},
    npcs: [K.canelo(6, 2)],
  };

  // ---------- La casa de los abuelos: the first map ----------
  G.maps.abuelos = {
    name: 'La casa de los abuelos', icon: 'abuelos', rows: MD.abuelos.rows, music: 'inn',
    exits: [Z.edge(10, 0, 'camino_abuelos', 6, 22, 'up')],
    posts: [{ at: P('abuelos', 'post'), zone: 'abuelos' }],
    dogSpots: [{ id: 'abuelos_jardin', at: P('abuelos', 'dog'), act: 'dig', gives: 'hueso', every: 'day' }],
    ambient: { birds: 3, butterflies: 3 },
    animals: [{ kind: 'gallina', n: 3, area: 'gallinas' }],
    things: {},
    npcs: [K.canelo(10, 2), Z.lola(...P('abuelos', 'lola'), 'abuelos'), Z.nico(...P('abuelos', 'nico'))],
  };

  // things to pick up (carry.js) and Nico's hiding places here (seek.js: one game per zone)
  G.carry.SOURCES.push(...[{ id: 'manzana_cabuelos', map: 'camino_abuelos', at: P('camino_abuelos', 'manzana'), item: 'manzana', every: 150, tree: [10, 15] }], ...[{ id: 'manzana_abuelos', map: 'abuelos', at: P('abuelos', 'manzana'), item: 'manzana', every: 150, tree: [3, 3] }]);
  G.seek.SPOTS.push(...[
    { id: 'abuelos1', map: 'abuelos', at: P('abuelos', 'hide1'), how: 'over', cut: 9, dx: 0, kinds: ['gato', 'conejo', 'gallina'], place: 'abuelos' },
    { id: 'abuelos2', map: 'abuelos', at: P('abuelos', 'hide2'), how: 'over', cut: 7, dx: 0, kinds: ['gato', 'conejo', 'gallina'], place: 'abuelos' },
    { id: 'abuelos3', map: 'abuelos', at: [8, 2], how: 'sit', y: 9, dx: 0, kinds: ['gato'], place: 'abuelos' },
  ]);

  const bus = P('abuelos', 'bus'), busIn = P('abuelos', 'busIn');
  Z.add({
    id: 'abuelos', name: 'La casa de los abuelos', en: 'the grandparents\' house', icon: 'abuelos', music: 'inn', pos: [78, 176],
    maps: ['abuelos'], path: 'camino_abuelos',
    bus: { map: 'abuelos', at: bus }, entry: { map: 'abuelos', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: [],   // (the zone's own animals, its album page: added with the zone, docs/WORLD_PLAN.md)
    planned: 7,    // (album entries still to come: shown as numbered "?" until the zone is built)
  });
})();
