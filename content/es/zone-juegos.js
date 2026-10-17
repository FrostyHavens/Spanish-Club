// ===== El parque de juegos: its path from Villa Sol and its first map (a PLACEHOLDER: docs/WORLD_PLAN.md) =====
// The framework step (2026-10-17) built the way there and a small first place: the zone's signpost, its bus stop, the
// dog's thing to do, Lola (the friend who travels) and Nico's hiding places. A later step replaces this file's
// G.maps.juegos with the whole zone (action verbs: corre, salta, sube, baja, el columpio, el tobogán, la arena, la cuerda...), following docs/WORLD_PLAN.md
// ("How to build a zone"). Keep the zone id, the path map and the bus stop: saves remember where the child has been.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA;
  const P = (m, tag) => MD[m].pos[tag];

  // ---------- the path from Villa Sol: a meadow with flowers, a bench, rabbits and sticks to throw ----------
  G.maps.camino_juegos = {
    name: 'El camino al parque de juegos', icon: 'juegos', rows: MD.camino_juegos.rows, music: 'field',
    exits: [Z.edge(29, 6, 'villa', 1, 14, 'right'), Z.edge(0, 6, 'juegos', 20, 7, 'left')],
    posts: [{ at: P('camino_juegos', 'postE'), zone: 'villa', dir: 'right' }, { at: P('camino_juegos', 'postW'), zone: 'juegos', dir: 'left' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'conejo', n: 2, area: 'conejos' }],
    things: {},
    npcs: [K.canelo(27, 6)],
  };

  // ---------- El parque de juegos: the first map ----------
  G.maps.juegos = {
    name: 'El parque de juegos', icon: 'juegos', rows: MD.juegos.rows, music: 'title',
    exits: [Z.edge(21, 7, 'camino_juegos', 1, 6, 'right')],
    posts: [{ at: P('juegos', 'post'), zone: 'juegos' }],
    dogSpots: [{ id: 'juegos_arena', at: P('juegos', 'dog'), act: 'dig', gives: 'palo', every: 120 }],
    ambient: { birds: 3, butterflies: 3 },
    animals: [{ kind: 'conejo', area: 'conejos' }],
    things: {},
    npcs: [K.canelo(19, 8), Z.lola(...P('juegos', 'lola'), 'juegos'), Z.nico(...P('juegos', 'nico'))],
  };

  // things to pick up (carry.js) and Nico's hiding places here (seek.js: one game per zone)
  G.carry.SOURCES.push(...[{ id: 'palo_cjuegos', map: 'camino_juegos', at: P('camino_juegos', 'palo'), item: 'palo', every: 90 }], ...[{ id: 'palo_juegos', map: 'juegos', at: [15, 10], item: 'palo', every: 60 }]);
  G.seek.SPOTS.push(...[
    { id: 'juegos1', map: 'juegos', at: P('juegos', 'hide1'), how: 'over', cut: 7, dx: 0, kinds: ['conejo', 'gato', 'gallina'], place: 'juegos' },
    { id: 'juegos2', map: 'juegos', at: P('juegos', 'hide2'), how: 'over', cut: 7, dx: 0, kinds: ['conejo', 'pato', 'gato'], place: 'juegos' },
    { id: 'juegos3', map: 'juegos', at: P('juegos', 'hide3'), how: 'over', cut: 6, dx: 0, kinds: ['gato', 'conejo'], place: 'juegos' },
  ]);

  const bus = P('juegos', 'bus'), busIn = P('juegos', 'busIn');
  Z.add({
    id: 'juegos', name: 'El parque de juegos', en: 'the playground', icon: 'juegos', music: 'title', pos: [54, 100],
    maps: ['juegos'], path: 'camino_juegos',
    bus: { map: 'juegos', at: bus }, entry: { map: 'juegos', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: [],   // (the zone's own animals, its album page: added with the zone, docs/WORLD_PLAN.md)
    planned: 7,    // (album entries still to come: shown as numbered "?" until the zone is built)
  });
})();
