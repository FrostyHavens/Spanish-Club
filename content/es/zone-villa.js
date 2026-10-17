// ===== Villa Sol, the zone in the middle of the world (docs/WORLD_PLAN.md) =====
// Villa Sol's own maps are in src/maps.js and its story is the 21 chapters (content/es/story-*.js): its quest line, never
// required to leave town and never required to explore. This file only puts Villa Sol in the world: the zone's entry in
// G.zones (src/zones.js), its five roads out (an exit at each edge, with a signpost), its bus stop, and its album page.
'use strict';
(function () {
  const Z = G.zones, P = tag => G.MAPDATA.villa.pos[tag];
  const V = G.maps.villa;
  // the five roads out of town: a path tile on each edge leads to the path map toward that zone
  V.exits.push(
    Z.edge(...P('edgeJuegos'), 'camino_juegos', 28, 6, 'left'),
    Z.edge(...P('edgeBosque'), 'camino_bosque', 6, 24, 'up'),
    Z.edge(...P('edgeMontana'), 'camino_montana', 1, 6, 'right'),
    Z.edge(...P('edgePlaya'), 'camino_playa', 6, 1, 'down'),
    Z.edge(...P('edgeAbuelos'), 'camino_abuelos', 6, 1, 'down'),
  );
  V.posts = [
    { at: P('postJuegos'), zone: 'juegos', dir: 'left' },
    { at: P('postBosque'), zone: 'bosque', dir: 'up' },
    { at: P('postMontana'), zone: 'montana', dir: 'right' },
    { at: P('postPlaya'), zone: 'playa', dir: 'down' },
    { at: P('postAbuelos'), zone: 'abuelos', dir: 'down' },
  ];
  // the town's buildings are inside: the bus doesn't drive in there (a ride from the menu just fades)
  for (const m of ['casa', 'escuela', 'rosa', 'panaderia', 'biblioteca', 'granja']) G.maps[m].indoor = true;
  const bus = P('busVilla');
  Z.add({
    id: 'villa', name: 'Villa Sol', en: 'the town of Villa Sol', icon: 'sol', music: 'town', pos: [160, 114],
    maps: ['villa', 'casa', 'escuela', 'rosa', 'panaderia', 'biblioteca', 'granja'],
    bus: { map: 'villa', at: bus }, entry: { map: 'villa', x: bus[0], y: bus[1] + 1, dir: 'down' },
    // the album's first page (the Pokédex numbers start here): the town's animals, where each one lives as its hint
    animals: ['perro', 'gato', 'pajaro', 'mariposa', 'pez', 'conejo', 'pato', 'rana', 'gallina', 'caballo', 'cabra'],
    habitat: { perro: 'casa', gato: 'parque', pajaro: 'arbol', mariposa: 'flor', pez: 'fuente', conejo: 'parque', pato: 'agua', rana: 'agua', gallina: 'granja', caballo: 'granja', cabra: 'granja' },
  });
})();
