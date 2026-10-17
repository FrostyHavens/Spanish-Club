# The open world: plan and how to build a zone

*2026-10-17. Step 1 (the framework) is built: this file is the plan for the five zone steps that follow, and the
pattern every zone agent follows. The engine is `src/zones.js`; each zone is one content file, `content/es/zone-<id>.js`.*

## Why
The 7-year-old (the target player) loved variety and choice, wants to explore, and wants to interact with the people
and animals she bumps into (`docs/PLAYTEST_NOTES.md`). The parent's decisions:
- **An open world, Pokémon-style but friendly: no locks, no bosses.** Wonder, adventure, exploration and *lots* of
  different animals; always something left to find.
- **The child names the dog** in the opener (default *Canelo*); the name is used everywhere (`{dog}` in any line).
- **The dog tutorial is skippable** (two big pictures: play with the puppy / go explore). The child is never forced to
  play with the dog; the dog's games stay available and fun (Mamá keeps the puppy game for later).
- **No daily word limit.** The new-word budget no longer gates anything (chapters, "soon", "busy", daily caps). Good
  teaching stays inside each activity: one unknown at a time, the first use soon after meeting it.
- **Travel both ways:** walkable paths between zones (things to meet along the way) and fast travel (a bus stop in
  every zone, usable once you've been there; a picture world map, tap to go).
- **Exploration first, a light story.** Places are tied together by recurring characters, items and quest types the
  child recognizes in every zone.

## The world
```
                         El bosque (N)
                              |
                       camino_bosque
                              |
 El parque de  -- camino_juegos -- VILLA SOL -- camino_montana -- La montaña (E)
 juegos (W)                   |          \
                     camino_abuelos      camino_playa
                              |              \
              La casa de los abuelos (SW)    La playa (S)
```
Villa Sol is the middle. Each zone is reached from an edge of town by a short PATH map. Every path and zone is
walkable from the very start (after the opener): nothing is locked. Any zone can be visited first, so **a zone's
activities may only rely on universal words or the zone's own words introduced there** (below).

| From Villa Sol | Edge tile (town) | Path map | Zone's first map | On the path |
| --- | --- | --- | --- | --- |
| west | (0, 14), by Rosa's road | `camino_juegos` (30x12) | `juegos` | a meadow: flowers, a bench, rabbits, a stick to throw |
| north | (10, 0), up the plaza road | `camino_bosque` (14x26) | `bosque` | trees getting thicker, a pond with a frog, rabbits, a stick |
| east | (47, 10), past the barn road | `camino_montana` (30x12) | `montana` | hills, boulders, the peaks behind, a goat on the slope, a stick |
| south | (29, 27), from the library road | `camino_playa` (14x24) | `playa` | grass turning to sand, a lagoon with ducks, a stick |
| south-west | (5, 27), from home | `camino_abuelos` (14x24) | `abuelos` | wheat fields, a fence, hens, an apple tree |

Each end of a path has a **signpost** with the picture of where it leads (an arrow on it), so the way is shown in
pictures. Villa Sol's bus stop is by the plaza road (26, 11).

## Recurring characters, items and quest types (the glue between places)
| What | In every zone | Built |
| --- | --- | --- |
| **Lola, the friend who travels** (an explorer: hat, green outfit) | waits at each zone's first map; her bubble shows the zone's picture until you talk to her there today; she says hello, holds up the place's picture and name, and shows what the dog can do here. A zone gives her more: zone def `lola: function* (f) {...}` | yes (`G.zones.lola`) |
| **Nico's hide-and-seek** | one game per zone, with that zone's hiding places and animals; Villa Sol's game is unchanged | yes (`src/seek.js`, `G.zones.nico`) |
| **The dog's thing to do** | a paw-print bubble on a spot: he digs (sand, a garden), splashes (waves), sniffs (a log), rolls (snow); he may leave something to pick up | yes (map `dogSpots`) |
| **The album (the Pokédex)** | a page per zone, numbered entries, silhouettes with a habitat hint, rare ones marked, "¡Completo!" per zone, "¡Nuevo animal!" the first time | yes (`src/album.js`) |
| **The bus** | a bus stop in each zone; the bus also comes to you from the map in the kid menu | yes |
| **Tomás the mail carrier** | delivers across zones: a letter (`carta`) from someone in one zone for someone in another; the child carries it (`G.errands.bag.add('carta', { to: 'abuela' })` and the receiver in `G.hearts.LIKES` or a zone's own talk) | to build (a zone step: once two zones exist; only between visited zones) |
| **Favours** | a zone's people add favours about the zone's words (`G.favores.OFFERS`, data-driven per map) | engine yes, content per zone |
| **Things to pick up** | each zone has its own (`G.carry.SOURCES`), plus the stick (a toy with no word) | yes (sticks, apples) |

## The zones
For each: the theme, about 12-15 first-year words for ages 4-7 (Mexican Spanish; ids are suggestions: check
`content/es/words.js` for clashes), its local people, the dog's activity, small repeatable side quests, a light zone
story (3-5 short chapters on the zone's own quest line), and **6-8 album animals, one or two of them rare** (only at a
time of day or in one spot), so there's always something left to find.

### La playa (south) — sea animals, the sun and water — **BUILT** (2026-10-17, `content/es/zone-playa.js`)
One big map (34x24): palms and dune grass along the top (the path in at (10, 0), the bus stop, Doña Nieves's ice-cream
cart), a wide beach (umbrellas, Marina's lifeguard tower, Tere's sandcastles, the turtles' nest), wet rocks and a tide
pool (*el charco*, clear water you can wade into) on the right, a wooden pier with Don Paco's boat on the left, then the
surf (animated waves), clear turquoise shallows (wade in) and the deep sea. New tiles in `src/tiles.js`: `9` surf, `-`
clear shallows, `&` dune grass, `d` pier, `1` palm, `2` umbrella, `3` sandcastle, `4`/`5` boat, `6`/`7` lifeguard
tower, `8` ice-cream cart, `0` wet rocks.
- **Words (17, two notebook pages):** *La playa*: el mar, la concha, el sol (id `elsol`: its own picture, a sun in
  sunglasses; *buenos días* keeps the plain sun), caliente, el helado, la arena, la cubeta (id `cubetaarena`: the town
  already had a milk-pail picture called `cubeta`), el castillo, la ola. *En el mar*: el cangrejo, la estrella de mar
  (`estrellamar`), la tortuga, la gaviota, nadar, la medusa (alt *aguamala*), el delfín, el pulpo. El pez stays a town
  word. Word ids must not shadow icon names used as plain strings (`sol`, `cubeta`): check `grep "'<id>'" src content`.
- **People:** Don Paco the fisherman (straw hat, white beard; on the pier), Marina the lifeguard (by her tower), Doña
  Nieves (the ice-cream cart), Tere (a girl who builds sandcastles); Lola and Nico as everywhere. None have hearts yet.
- **Album (7):** cangrejo (scuttles sideways, snaps its claws, runs from you), gaviota (walks and pecks, takes off when
  you or the dog come near, circles and lands), estrella de mar (in the shallows and the pool), tortuga (plods along the
  surf, pulls its head in when tapped), medusa (drifts and pulses out at sea), **delfín** (rare: the first minutes of a
  session, 75%: a fin out at sea, now and then a big leap), **pulpo** (rare: at night, in the tide pool). Tapping one
  whose word isn't met yet: Lola calls out its name (a one-unknown puzzle), so every animal can be named by finding it.
- **Story (line `playa`, 3 chapters, no time of day):** 1 *La red de Don Paco* (mar, cangrejo, estrella de mar, concha:
  pull his net up at the pier's end, put the crab and the starfish back in the sea, the shell is yours); 2 *¡Qué calor!*
  (sol, caliente, helado: Marina hops on the hot sand, an ice cream from Doña Nieves); 3 *Las tortuguitas* (arena,
  tortuga, gaviota, nadar: the nest hatches, gulls circle, tap the dog to chase them off, tap each baby to send it to
  the sea, they swim away). The planned "turtles at dusk" became any time (evening chapters only run at home).
- **Side quests (`G.state.playa`):** Lola's five shells (rosa, blanco, azul, amarillo, rojo: pick them up anywhere,
  bring them; she counts with you if the numbers are met; *¡Todas!*), Tere's sandcastle (la cubeta: fill it at the
  water's edge three times, pour, then the flag; a new castle every day), the little crab with no shell (after
  chapter 1: three shells to choose from, the big spiral one), an ice cream for whoever is hot today (after chapter 2).
- **Dog:** digs in the sand (a shell of some colour), splashes in the waves, chases the gulls (a new dog-spot act,
  `chase`). He eats an ice cream if you give him one.
- **Also:** six hide-and-seek places (umbrellas, the castle, the rocks, a palm, the boat), two page puzzles, favours for
  Paco, Nieves and Marina (once Villa Sol's chapter 7 has opened favours), a new ghost-hand demo (`fillpail`).

### El bosque (north) — woodland animals, big and small
- **Words:** el bosque, el árbol (met in town), la hoja, el hongo, el tronco, la piña, grande, pequeño, la ardilla,
  el zorro, el venado, el erizo, el búho, el oso, la cueva.
- **People:** Elena the forest ranger (*la guardabosques*), with binoculars.
- **Dog:** sniffs hollow logs (a stick, a bird flying out) — in the placeholder.
- **Side quests:** pine cones for the squirrel (count), big or small? (sort the leaves, the animals), follow the tracks.
- **Story:** the ranger's lost binoculars; the bear cub who can't find its mother (big / small).
- **Album (7):** ardilla, zorro, venado, erizo, mapache, **búho** (rare: at night), **oso** (rare: only by the cave).

### El parque de juegos (west) — action verbs
- **Words:** corre, salta (met as the dog's trick: reuse it), sube, baja, empuja, arriba, abajo, rápido, despacio, el
  columpio, la resbaladilla, el subibaja, la cuerda, la arena (shared with the beach: met once, wherever first).
- **People:** Pablo and Ana (kids who play); Nico comes here a lot.
- **Dog:** digs in the sandbox (a stick, a ball) — in the placeholder; races you down the path.
- **Side quests:** Simon says (*¡salta! ¡corre!*: the child taps / says the action, the kids do it), push Pablo on the
  swing (*¡más!*), a race.
- **Story:** the playground's opening day: fix the swing, find the lost jump rope, the big race.
- **Album (7):** paloma, caracol, hormiga, abeja, catarina, lombriz, **colibrí** (rare: at the flowers in the morning).

### La casa de los abuelos (south-west) — family, the body, clothes
- **Words:** el abuelo, la abuela, la familia, la mano, la cabeza, los ojos, la boca, la nariz, el pie, el sombrero,
  los zapatos, la camisa, el vestido, la bufanda, el pastel.
- **People:** Abuelo and Abuela (the child's own grandparents; Abuela Rosa in town is a different, town grandma), their
  cottage (the placeholder shows its back: the front door and the inside come with the zone).
- **Dog:** digs in the garden (a carrot, a bone) — in the placeholder; naps on the porch.
- **Side quests:** dress up from the trunk (*¿el sombrero?*), Abuelo's glasses (find them), a cake with Abuela (count the
  eggs: hens on the path), a family photo (who's who).
- **Story:** Abuela's birthday: a cake, a present, everyone in the photo.
- **Album (6):** vaca, cerdo, oveja, burro, pavo, **ratón** (rare: in the pantry at night).

### La montaña (east) — weather
- **Words:** la montaña, el sol, la lluvia, la nieve, el viento, la nube, el arcoíris, hace frío, hace calor, el río,
  la piedra, el gorro, los guantes, la bota.
- **People:** Don Lucho the shepherd, with his llamas.
- **Dog:** rolls in the snow (in the placeholder); chases snowflakes.
- **Side quests:** what's the weather? (dress for it: *gorro, guantes*), bring the llamas home (*¡ven!*), a snowman.
- **Story:** the storm: help Don Lucho bring the animals in, then the rainbow.
- **Album (6):** llama, águila, marmota, borrego cimarrón, **puma** (rare: far off at dusk), **pika** (rare: only in one
  rock pile).

## Words: universal and the zone's own (order-independent)
Any zone can be the first one visited, so:
- **Universal words**, safe anywhere: *hola* (always met: the opener's first puzzle). *sí, no, adiós, gracias* are
  universal too, but only once met: check `G.words.met(id)` and, when unmet, either avoid them or introduce them right
  there with `G.intro.show` (one unknown, the same puzzle as Villa Sol's). Town words (*perro, gato, agua...*) are NOT
  universal: they're met in Villa Sol's story, which the child may not have played.
- **The zone's own words**: introduced in the zone with the `G.intro.*` helpers (one unknown at a time; the other cards
  are pictures of things already met or the zone's words met just before), and used again within a minute or two
  (Canelo's "?" brings a just-met word back by itself). A word two zones share (*la arena*) is met in whichever comes
  first; write both zones so either can introduce it (`if (!G.words.met('arena')) yield* G.intro.show('arena', ...)`).
- **No budget.** Nothing waits on a daily word count any more (`G.budget.canIntro` is always true). Pacing is the
  activity's: a puzzle meets one word, an errand meets three to five, then the zone's play uses them.

## How to build a zone (the pattern for each zone step)
Files a zone step touches (and nothing else unless the engine truly needs it):
1. **`tools/mapgen.py`** — replace the zone's placeholder block (`# La playa: ...` under "the zones' first maps") with
   its maps. Keep the map id (`playa`) as the zone's first map and its tags `in`, `bus`, `busIn`, `post`, `lola`,
   `nico`; add more maps if the zone needs them (`playa_cueva`...). Keep the path map's end tile where it is (the path's
   exit points at the zone's `in` tile) or update both. Run `python3 tools/mapgen.py`. Tiles: `G.TERRAIN` in
   `src/tiles.js` (sand `s`, shallows `~`, water `w`, hills `h`, mountain `M`, boulder `r`, trees `T`/`f`, fence `F`,
   fields `y`, flowers `o`...); a new tile goes in `src/tiles.js` with its picture.
2. **`content/es/zone-<id>.js`** — the zone's content, replacing the placeholder (keep its shape):
   ```js
   G.maps.playa = { name: 'La playa', icon: 'playa', rows: MD.playa.rows, music: 'story',
     exits: [Z.edge(10, 0, 'camino_playa', 6, 22, 'up'), ...],        // edges; doors as in src/maps.js
     posts: [{ at: P('playa', 'post'), zone: 'playa' }],                // its signpost
     dogSpots: [{ id: 'playa_arena', at: [15, 7], act: 'dig', gives: 'hueso', every: 'day' }],
     animals: [{ kind: 'cangrejo', n: 3, area: 'rocas' }, { kind: 'pulpo', area: 'charco', when: 'noche' }, { kind: 'delfin', at: 'mar', chance: 0.3 }],
     ambient: { birds: 3, butterflies: 2 }, things: { tiles: { '~': 'ola' } },
     npcs: [K.canelo(10, 2), Z.lola(...P('playa', 'lola'), 'playa'), Z.nico(...P('playa', 'nico')),
            { id: 'paco', npc: 'paco', x, y, alert: () => ..., talk: K.talker('paco', function* (f) { ... }) }] };
   G.carry.SOURCES.push({ id: 'concha1', map: 'playa', at: [4, 6], item: 'concha', every: 120 });
   G.seek.SPOTS.push({ id: 'playa1', map: 'playa', at: [...], how: 'over', cut: 9, kinds: ['cangrejo'], place: 'playa' });
   G.seek.KINDS.push('cangrejo'); G.seek.PEEK.cangrejo = [3, 6];
   G.favores.OFFERS.push(['paco', 'thing', ['concha', 'cangrejo'], () => G.zones.visited('playa')]);
   Z.add({ id: 'playa', name: 'La playa', en: 'the beach', icon: 'playa', music: 'story', pos: [214, 184],
     maps: ['playa', 'playa_cueva'], path: 'camino_playa', bus: { map: 'playa', at: P('playa', 'bus') },
     entry: { map: 'playa', x, y, dir: 'down' },
     animals: ['cangrejo', 'gaviota', 'estrella', 'tortuga', 'medusa', 'delfin', 'pulpo'], // the album page, in order
     habitat: { cangrejo: 'arena', delfin: 'mar' },  // a picture on the silhouette: where it lives
     rare: { delfin: 'sol', pulpo: 'noche' },          // a corner mark: when / where it's found
     planned: 0,                                       // (no more "?" entries once its animals are in)
     lola: function* (f) { ... } });                   // (optional: Lola's extra lines here)
   ```
   `G.mapKit` (src/maps.js) has `talker(who, line)` (greeting, story, favours, then their line), `hello`, `say`, `met`,
   `stepBack`, `canelo(x, y)`; `G.zones` has `lola(x, y, zone)`, `nico(x, y)`, `edge(...)`.
3. **The zone's story** (a light quest line of 3-5 short chapters, never required): in the same file,
   ```js
   G.chapters.add({ id: 'playa1', line: 'playa', title: 'La red de Don Paco', en: '...', giver: 'paco', words: ['red', 'pez'], icon: 'red', col: '#3878d0' });
   G.chapters.script('playa1', [ { who: 'paco', run: function* (f, c) { ... } }, ... ], { stage(f, c) { ... } });
   ```
   A line's chapters play in order and never wait for another line (Villa Sol's can be going on at the same time). The
   beat triggers, helpers (`G.chapters.K`) and `G.intro.*` are as in `docs/CONTENT.md` ("A chapter"). Avoid `when:
   'morning' | 'evening'` unless the story needs it.
4. **`content/es/words.js`** — the zone's words (with a topic and a notebook page for the zone: `C.topics`,
   `C.topicOrder`, `C.pages`, `C.pageOrder`; at most 9 words a page, so a zone may need two pages), each with a picture
   in **`src/icons.js`** (`DRAW`). Page puzzles in the zone: `C.pagePlaces.playa = { 'x,y': 'pageId' }` and `pages:
   K.pages('playa')` in the map (`G.mapKit.pages`).
5. **Animals** — `G.animals.addKind(id, { word, cry, sound, speed, spr: { pal, stand, walk }, sfx })` in the zone file
   (frames: rows of letters, facing right, the same size; see `SPR` in `src/animals.js`), their word with a picture, a
   case in `tick()` / `frameOf()` in `src/animals.js` only if they need their own behaviour (swim, fly, hop: copy the
   duck's, the bird's, the rabbit's). Rare: `when: 'manana' | 'noche' | 'dia' | fn` and/or `chance: 0..1` on the map's
   `animals` entry. Hide-and-seek: `G.seek.KINDS`, `G.seek.PEEK[id] = [lo, hi]` (px showing: an ear, the eyes).
6. **People** — a new person: `G.data.npcs.<id> = { name, portrait, map }` (see `src/data.js`; the sprite engine draws
   them from a spec), `G.hearts.WHO` / `G.hearts.LIKES` / `G.hearts.POOLS` if they have hearts and a greeting.
7. **`index.html`** already loads `content/es/zone-<id>.js` (after `src/zones.js`); a new file goes there too.
8. **Tests** — `tools/test-world.js` must keep passing (paths walkable, the bus, the album by zone); add
   `tools/test-zone-<id>.js` for the zone's own content (its story by taps, its words introduced one at a time, its
   animals in the album, its hide-and-seek, its dog spot). Screenshot every new screen and map and look at them.
9. **Docs** — the zone's section here (what was built, where it differs), `DEVLOG.md`, `docs/CONTENT.md` if a new
   kind of thing was added. Then `python3 tools/build.py`.

### Rules for a zone (from the playtests)
- **Picture first, no Spanish-only instructions.** Every request shows its picture in a bubble; the guide's arrow finds
  the next thing by itself (a beat's `who` / `spot` / `tap`); a ghost-hand demo (`src/demo.js`) shows any new kind of
  action once.
- **Every door opens** or says why (in pictures). Nothing is a dead end: the zone always has its play (Lola, the dog's
  spot, things to pick up, Nico, the animals to tap).
- **The dog has something to do** in every zone (a `dogSpots` entry at least), and never blocks anything.
- **Never require another zone.** A zone's story and favours use the zone's words and universal words; a cross-zone
  quest (Tomás's letters) only appears between zones already visited.
- **One unknown at a time**, used again soon (`docs/LEARNING_DESIGN.md`).

## Framework additions from the zone steps (use them in the next zones)
- **Generic animal moves** (`G.animals.addKind(id, { move, on, water, shadow })`, `src/animals.js`): `scuttle`, `fly`,
  `drift`, `leap`, `still`, `crawl` (and the default `walk`), each with its frames and its tap reaction; `on` the tile
  codes it lives on (sand animals need `on: 's'`: the default land is grass and paths), `water: true` draws it flat
  with the ducks. `G.animals.takeOff(a)`, `.leap(a)`, `.tone/.noise` (for cries). No per-zone case in `tick()` needed.
- **Dog-spot act `chase`** (`{ act: 'chase', kind: 'gaviota' }`: he runs at the nearest one, it flies off). A spot's
  `col` may be a getter (a different shell colour each dig).
- **`G.zones.task(f)`**: a zone's task going on (the pail in your hands), a guide tier right after a favour going on, so
  a quest in progress beats other people's bubbles. `G.zones.goal(f)` stays the suggestion tier. Wrap both per map.
- **`G.zones.demos`**: `{ kind, find(f) -> tile }`, a zone's own once-only ghost-hand demo (`src/demo.js`).
- **Side places on a map**: the beach wraps `G.zones.search / special / blocks / drawUnder / drawTop` to add tappable
  places with picture bubbles (see `SIDE` in `content/es/zone-playa.js`): a pattern to copy for a zone's side quests.
- **`meetW(id, o)`** (`G.playa.meetW`): introduce a word if it isn't met, or ask it as a question if it was met in
  another zone: write every intro this way, since any zone can come first. Saved flags must not be `day()` (day 0 is
  falsy): store `true` or `{ d: day }`.
- `G.chapters.allWrittenDone()` and the badge rows (Misiones, the diploma) are Villa Sol's line only; a zone's chapters
  get their badge card when done but aren't listed there yet (a later step could add a row per zone).
- A zone's people talk: story, then their side quest, then `G.errands.talk` (presents, favours, "who'd love it"), then
  their line (`person()` in the beach file). Bubbles: use `{ icon }` objects, not bare word ids (a known word's id
  shows a "?").

## What the framework built (step 1)
- `src/zones.js`: the zone registry, visits ("¡Nuevo lugar!"), edge exits and routes across maps (`G.zones.route`),
  signposts, bus stops and the bus ride, the world map screen, the dog's spots, Lola and Nico for any zone, the guide's
  zone suggestions, rare-animal times, and the opener's choice screen.
- The opener (`content/es/story-c01-c10.js`, `CH.opener`): Mamá's *hola*, a puppy bursts in, the child names him
  (`src/creator.js`, dog mode), then picks *play with the puppy* (chapter 1 right away) or *go explore* (the world is
  open; chapter 1 waits as Mamá's puppy game, the very last thing the guide suggests).
- Quest lines (`src/chapters.js`): every zone can have its own line of chapters; Villa Sol's 21 chapters are its line.
- No word budget (`src/chapters.js` gate, `src/words.js` `G.budget.canIntro`).
- The album as a Pokédex (`src/album.js`), hide-and-seek per zone (`src/seek.js`), favours data-driven
  (`src/favores.js`), generic zone animals (`G.animals.addKind`, rare spawns), the guide re-tuned to nearby suggestions
  (`src/guide.js`), new demos (`bus`, `worldmap`, `dogspot`).
- Maps (`tools/mapgen.py`): Villa Sol's five openings, five path maps, five placeholder zone maps; their content in
  `content/es/zone-<id>.js` (placeholders), Villa Sol's world entry in `content/es/zone-villa.js`.
- Tests: `tools/test-world.js`.
