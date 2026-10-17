// ===== La montaña: its path from Villa Sol and its first map (a PLACEHOLDER: docs/WORLD_PLAN.md) =====
// The framework step (2026-10-17) built the way there and a small first place: the zone's signpost, its bus stop, the
// dog's thing to do, Lola (the friend who travels) and Nico's hiding places. A later step replaces this file's
// G.maps.montana with the whole zone (weather: el sol, la lluvia, la nieve, el viento, la nube, hace frío, hace calor, el arcoíris...), following docs/WORLD_PLAN.md
// ("How to build a zone"). Keep the zone id, the path map and the bus stop: saves remember where the child has been.
'use strict';
(function () {
  const Z = G.zones, K = G.mapKit, MD = G.MAPDATA;
  const P = (m, tag) => MD[m].pos[tag];

  // ---------- the path from Villa Sol: rolling hills, boulders, the mountains behind, a goat on the slope ----------
  G.maps.camino_montana = {
    name: 'El camino a la montaña', icon: 'montana', rows: MD.camino_montana.rows, music: 'field',
    exits: [Z.edge(0, 6, 'villa', 46, 10, 'left'), Z.edge(29, 6, 'montana', 1, 9, 'right')],
    posts: [{ at: P('camino_montana', 'postW'), zone: 'villa', dir: 'left' }, { at: P('camino_montana', 'postE'), zone: 'montana', dir: 'right' }],
    ambient: { birds: 4, butterflies: 3 },
    animals: [{ kind: 'cabra', area: 'cabras' }],
    things: {},
    npcs: [K.canelo(2, 6)],
  };

  // ---------- La montaña: the first map ----------
  G.maps.montana = {
    name: 'La montaña', icon: 'montana', rows: MD.montana.rows, music: 'field',
    exits: [Z.edge(0, 9, 'camino_montana', 28, 6, 'left')],
    posts: [{ at: P('montana', 'post'), zone: 'montana' }],
    dogSpots: [{ id: 'montana_nieve', at: P('montana', 'dog'), act: 'roll', every: 120 }],
    ambient: { birds: 3, butterflies: 3 },
    animals: [{ kind: 'cabra', n: 2, area: 'cabras' }],
    things: {},
    npcs: [K.canelo(2, 10), Z.lola(...P('montana', 'lola'), 'montana'), Z.nico(...P('montana', 'nico'))],
  };

  // things to pick up (carry.js) and Nico's hiding places here (seek.js: one game per zone)
  G.carry.SOURCES.push(...[{ id: 'palo_cmontana', map: 'camino_montana', at: P('camino_montana', 'palo'), item: 'palo', every: 90 }], ...[]);
  G.seek.SPOTS.push(...[
    { id: 'montana1', map: 'montana', at: P('montana', 'hide1'), how: 'over', cut: 6, dx: 0, kinds: ['cabra', 'conejo', 'gato'], place: 'montana' },
    { id: 'montana2', map: 'montana', at: P('montana', 'hide2'), how: 'over', cut: 6, dx: 0, kinds: ['cabra', 'conejo', 'gallina'], place: 'montana' },
    { id: 'montana3', map: 'montana', at: P('montana', 'hide3'), how: 'over', cut: 6, dx: 0, kinds: ['cabra', 'gato', 'conejo'], place: 'montana' },
  ]);

  const bus = P('montana', 'bus'), busIn = P('montana', 'busIn');
  Z.add({
    id: 'montana', name: 'La montaña', en: 'the mountain', icon: 'montana', music: 'field', pos: [264, 90],
    maps: ['montana'], path: 'camino_montana',
    bus: { map: 'montana', at: bus }, entry: { map: 'montana', x: busIn[0], y: busIn[1], dir: 'down' },
    animals: [],   // (the zone's own animals, its album page: added with the zone, docs/WORLD_PLAN.md)
    planned: 7,    // (album entries still to come: shown as numbered "?" until the zone is built)
  });
})();
