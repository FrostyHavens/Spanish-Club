// ===== La playa: its path from Villa Sol and its first map (a PLACEHOLDER: docs/WORLD_PLAN.md) =====
// The framework step (2026-10-17) built the way there and a small first place: the zone's signpost, its bus stop, the
// dog's thing to do, Lola (the friend who travels) and Nico's hiding places. A later step replaces this file's
// G.maps.playa with the whole zone (sea animals and the sun and water: el mar, la arena, el cangrejo, la concha, la estrella de mar, la tortuga, la gaviota, el sol, nadar...), following docs/WORLD_PLAN.md
// ("How to build a zone"). Keep the zone id, the path map and the bus stop: saves remember where the child has been.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA;
  const P = (m, tag) => MD[m].pos[tag];

  // ---------- the path from Villa Sol: grass turning to sand, a lagoon with ducks ----------
  G.maps.camino_playa = {
    name: 'El camino a la playa', icon: 'playa', rows: MD.camino_playa.rows, music: 'field',
    exits: [Z.edge(6, 0, 'villa', 29, 26, 'up'), Z.edge(6, 23, 'playa', 10, 1, 'down')],
    posts: [{ at: P('camino_playa', 'postN'), zone: 'villa', dir: 'up' }, { at: P('camino_playa', 'postS'), zone: 'playa', dir: 'down' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'pato', n: 3, area: 'laguna' }],
    things: {},
    npcs: [K.canelo(6, 2)],
  };

  // ---------- La playa: the first map ----------
  G.maps.playa = {
    name: 'La playa', icon: 'playa', rows: MD.playa.rows, music: 'story',
    exits: [Z.edge(10, 0, 'camino_playa', 6, 22, 'up')],
    posts: [{ at: P('playa', 'post'), zone: 'playa' }],
    dogSpots: [{ id: 'playa_arena', at: P('playa', 'dog'), act: 'dig', gives: 'hueso', every: 'day' }, { id: 'playa_olas', at: [12, 9], act: 'splash', every: 120 }],
    ambient: { birds: 3, butterflies: 3 },
    animals: [{ kind: 'pato', n: 2, area: 'patos' }],
    things: {},
    npcs: [K.canelo(10, 2), Z.lola(...P('playa', 'lola'), 'playa'), Z.nico(...P('playa', 'nico'))],
  };

  // things to pick up (carry.js) and Nico's hiding places here (seek.js: one game per zone)
  G.carry.SOURCES.push(...[{ id: 'palo_cplaya', map: 'camino_playa', at: P('camino_playa', 'palo'), item: 'palo', every: 90 }], ...[{ id: 'palo_playa', map: 'playa', at: [3, 7], item: 'palo', every: 90 }]);
  G.seek.SPOTS.push(...[
    { id: 'playa1', map: 'playa', at: P('playa', 'hide1'), how: 'over', cut: 9, dx: 0, kinds: ['gato', 'conejo'], place: 'playa' },
    { id: 'playa2', map: 'playa', at: P('playa', 'hide2'), how: 'over', cut: 9, dx: 0, kinds: ['gato', 'conejo', 'gallina'], place: 'playa' },
    { id: 'playa3', map: 'playa', at: P('playa', 'hide3'), how: 'over', cut: 4, dx: 0, kinds: ['gato', 'conejo', 'rana'], place: 'playa' },
  ]);

  const bus = P('playa', 'bus'), busIn = P('playa', 'busIn');
  Z.add({
    id: 'playa', name: 'La playa', en: 'the beach', icon: 'playa', music: 'story', pos: [214, 184],
    maps: ['playa'], path: 'camino_playa',
    bus: { map: 'playa', at: bus }, entry: { map: 'playa', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: [],   // (the zone's own animals, its album page: added with the zone, docs/WORLD_PLAN.md)
    planned: 7,    // (album entries still to come: shown as numbered "?" until the zone is built)
  });
})();
