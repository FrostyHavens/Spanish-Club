# The open world: plan and how to build a zone

*2026-10-17. All six steps are built (the framework and the five zones), and step 7 connected them (Tomás's letters,
the zones' people as friends, the world's progress: "Connecting the world" below): this file is the plan, what each zone
became, and the pattern a new zone follows. The engine is `src/zones.js`; each zone is one content file, `content/es/zone-<id>.js`.*

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
| **Tomás the mail carrier** | a letter a day for someone in a place you've been to (from a town friend; later between places); they write back every other letter; some days he's at a zone's bus stop on his round | yes (`G.post`, `src/connect.js`) |
| **Hearts with everyone** | the zones' people and Lola have hearts, a greeting a day, a gift they like, the 3-heart secret and sticker, the 5-heart photo; the Amigos page by place | yes (`G.hearts.ZONE`, `src/connect.js`) |
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
  Nieves (the ice-cream cart), Tere (a girl who builds sandcastles); Lola and Nico as everywhere. Hearts since step 7.
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

### El bosque (north) — woodland animals, big and small — **BUILT** (2026-10-17, `content/es/zone-bosque.js`)
One big map (40x30) and two small ones. A rock cliff along the top with a waterfall into a pond (a frog), a meadow
(deer, rabbits), the bears' cave in a rock outcrop (top right, a path to it), a river across the middle with a little
bridge on the main path and stepping stones further east, then the south woods: a clearing ringed by tall trees,
Doña Lupe's log cabin with her blackberry bushes (left), a hollow log (right), groves of trees to wander in, the path in
from Villa Sol at the bottom (18, 29) with the bus stop and the signpost. `bosque_cueva` (the cave inside: dark, glowing
mushrooms, a pool, mama bear asleep, fireflies; always dim, a light around you) and `bosque_cabana` (Lupe's cabin: her
oven, shelves, a bed; the pie cools on the table once baked). At night (`G.day.over()`) the forest goes dark blue,
fireflies fill the clearing and an owl sits in a tall tree. New tiles in `src/tiles.js`: `(` / `)` a tall tree (crown
over trunk; oak or pine by column; squirrels climb the trunks), `%` mushrooms (glowing teal in the cave), `*` blackberry
bush, `_` hollow log, `#` rock cliff, `|` waterfall, `@` the cave's mouth (an exit), `:` stepping stones (walkable), `[`
/ `]` log cabin wall and door, `{` / `}` cave floor and wall. `camino_bosque`'s north exit now lands at (18, 28).
- **Words (17, two notebook pages):** *El bosque*: el bosque (id `elbosque`: the zone's picture is `bosque`), pequeño,
  grande, la cueva, la bellota, la hoja, el tronco, la mora (alt *zarzamora*), el hongo. *Animales del bosque*
  (`fauna`): el oso, la ardilla, el mapache, el venado, el zorro, el erizo, el búho (alt *tecolote*), la luciérnaga. El
  árbol stays a town word (the trees say it). La piña was left out (in Mexico it is the pineapple).
- **People:** Elena the ranger (a green hat, khaki: the story, her mushroom game), Doña Lupe (a grandma in a purple
  shawl: her cabin, the blackberry pie, chapter 2); Lola and Nico as everywhere. Hearts since step 7.
- **Album (8):** ardilla (`climb`: dashes about, races up the nearest trunk when you come near, sits up there a while),
  venado (`shy`: grazes, bounds away in leaps), zorro and mapache (`walk`, with a `react` frame: the fox sits, the
  raccoon stands up), erizo (`crawl`: curls into a ball), **oso** (rare: only asleep in the cave; drawn at 2x, `scale`),
  **búho** (rare: at night, perched in a tall tree), luciérnaga (`flit`, `glow`: in the cave any time, in the clearing at
  night). Lola names an unmet one when it's tapped, as on the beach.
- **Story (line `bosque`):** 1 *El osito perdido* (oso, pequeño, cueva, grande: a bear cub crying in the clearing; big
  paw prints; the dog follows them over the bridge to the cave, the cub trots after you, mama bear comes out and stands
  up BIG; they go home, and sleep in the cave afterwards), 2 *Las bellotas de la ardilla* (Lupe; ardilla, bellota,
  hoja, erizo: five leaf piles in the clearing, three hide acorns, one a sleeping hedgehog), 3 *Los binoculares de
  Elena* (tronco, mapache, venado, zorro: raccoon prints to the hollow log, the raccoon drops them; then look through
  them: a full-screen binocular view, a deer, a fox).
- **Side quests (`G.state.bosque`):** Lupe's blackberry pie (la canasta: tap four bushes, bring it back, she bakes; the
  pie is yours: the dog eats it; daily), ¿grande o pequeño? (Elena, after chapter 1: four mushrooms, two big, two
  little, "¡el grande!" / "¡el pequeño!", then "¿Cómo es?" with the mic; daily), Lola's leaves (verde, amarillo, rojo),
  fireflies at night (Lola's jar: tap five, count them, let them go).
- **Dog:** sniffs the hollow log (a stick), follows a trail of paw prints (new dog-spot act `trail`: an acorn at its
  end), swims across the river for a stick (new act `swim`). He eats blackberries and pie.
- **Also:** six hiding places (the squirrel's oak, the log, two blackberry bushes, a boulder by the cave, a tall tree), two
  page puzzles (the clearing, the meadow), favours for Elena and Lupe, a ghost-hand demo (`pickberry`).

### El parque de juegos (west) — action words (TPR) — **BUILT** (2026-10-17, `content/es/zone-juegos.js`)
One big map (40x28). The path comes in on the east edge (39, 13) past the bus stop and Don Chuy's bubble cart; north of
the main path the fenced playground (three swings, a slide, a climbing frame beside a tall tree, a seesaw, a
merry-go-round, a sandbox with a little sandcastle), the kite hill to the north-west (a soft rise drawn by the zone),
the little soccer field to the south (lines drawn by the zone, two goals), a pond with ducks and rocks (lizards) and the
dog's jumping course to the south-west, a garden with a fountain, benches and flower beds to the south-east. At night
the park goes blue, the lamps glow and crickets sing on the hill. New tiles (`src/tiles.js`): `!` swing set (A-frame
legs at the row's ends), `<` / `>` slide ladder and chute, `/` climbing frame, `?` seesaw (stand in the middle tile),
`^` merry-go-round pad (2x2), `;` goal, `$` bubble cart. The moving parts (the seats and chains, the seesaw's plank, the
turning wheel) are drawn by the zone in `drawUnder`, the riders by their own `drawSelf`.
- **The core: say an action, someone DOES it** (Total Physical Response). `G.juegos.act(f, e, verb)` animates anyone
  (the player, a kid, Lola, Nico) as offsets / squash / tilt / extra arms / a ball from `G.frame` (`drawPerson`, set as
  `e.drawSelf`): *corre* (out and back, `speed: 'rapido' | 'despacio'`), *salta*, *gira*, *baila*, *sube* (stretch up),
  *baja* (crouch), *empuja*, *lanza*, *atrapa*; `G.juegos.all(f, verb)` makes everyone near do it (the dog too: his
  matching trick, `G.pet.anim`); `G.juegos.tpr(id, {who, prompt, demo, act, ask, show})` is the TPR step: new, a
  one-unknown "watch, then you" puzzle (`G.intro.watch`: someone shows it, then the child picks/says it and it happens);
  met, "¿Qué hago?" picture cards with the situation's picture (mic on) and then it happens; `G.juegos.choose` a free
  choice of met verbs (mic on: say one!) that everyone does. **Tap yourself in the park:** "¿Qué hago?" and you do it
  (a ghost-hand demo `meact` shows it once).
- **Rides** (tap the thing; `e.ride` poses): the swings (higher with each swing), the slide (up the ladder: *¡sube!*,
  whoosh down: *¡baja!*, you land at its end), the climbing frame (up, a wave, down), the seesaw (with Ana:
  *¡sube! ¡baja!*), the merry-go-round (*¡gira!*). A ride's word (columpio, resbaladilla, subibaja) is met the first time
  (Pablo or Ana names it) and said after with the say-it-back mic. Pablo idles on a swing, Ana skips her rope.
- **Words (23, three notebook pages):** *¡A jugar!* (`acciones`): corre, baila, sube, baja, rápido, despacio, empuja,
  lanza (alt *avienta, tira*), atrapa (alt *cáchala, agarra*); *El parque de juegos* (`juegosparque`): el columpio, el
  papalote (Mexican; alt *cometa*), la resbaladilla (alt *tobogán*), el subibaja, las burbujas, la cuerda; *Bichos del
  parque* (`bichos`): la paloma, la catarina, la hormiga, la abeja, la lagartija, la lombriz, el grillo, el colibrí.
  *salta*, *gira* (the dog's tricks) and *la pelota* are Villa Sol words: the park meets them if they aren't met yet.
  *baja* and *baila* sound alike: never on the same question (`CLASH`). Verb pictures show a kid doing it; *rápido* is
  a race car, *despacio* a snail.
- **People:** Ana (a girl in orange with a ponytail: Simón dice, her jump rope), Pablo (a boy with a green bandana: the
  swings, his kite, the ball), Don Chuy (the bubble man: a straw hat, a moustache, a blue shirt, his cart). Lola meets
  *el columpio* and points at the playground; Nico's hide-and-seek. Hearts since step 7.
- **Album (8):** paloma (`fly`, by the fountain and the benches), catarina (`crawl`, on the flowers; its wings open when
  tapped), hormiga (new move `march`: a line of ants, each following the one before; tapped, they scatter), abeja
  (`flit`), lagartija (`scuttle`, on the rocks by the pond), lombriz (`still`, popping out of the sandbox), **grillo**
  (rare: at night on the kite hill; new move `hop`, it chirps), **colibrí** (rare: in the morning at the flowers).
- **Story (line `juegos`):** 1 *¡Simón dice!* (Ana: corre, salta; Pablo: gira, baila; each shown by the kid, then
  everyone does it; then the child is Simón: three free choices, then a listening round), 2 *El papalote de Pablo*
  (papalote; the kite is stuck in the tall tree: climb the frame (*sube*), come down (*baja*); on the hill run
  (*corre*), faster (*rápido*: it flies high), slowly (*despacio*: it sinks); after it Pablo flies it on the hill every
  day), 3 *¡A los juegos!* (Ana: la resbaladilla (sube, baja), push Pablo on el columpio (*empuja*, "¡Más!" twice), el
  subibaja with Ana ("¿Y tú?" sube or baja)).
- **Side quests (`G.state.juegos`):** Ana's jump rope (after chapter 1; *la cuerda*, five *¡salta!*, counted; daily),
  then Simón dice again; Pablo's ball (after chapter 1; *lanza* / *atrapa*: the ball flies to Pablo and back, then the
  dog leaps for it; daily); Don Chuy's bubbles (any day: *las burbujas*, *atrapa*; tap six as they float, the dog pops
  some too; then a bubble wand of your own: bubbles trail from it on any map). The kids' bubbles wait while their story
  goes on. The guide suggests a ride not tried today.
- **Dog:** digs in the sandbox (a green ball), runs his jumping course (new dog-spot act `course`: hurdles drawn by the
  zone, he leaps each), chases the pigeons (`chase`).
- **Also:** six hiding places (the cart, the slide, the sandcastle, a garden bench, a bush, a tall tree), three page
  puzzles (the playground, under the kite tree, the garden), favours for Ana, Pablo and Don Chuy, the yellow ball to pick
  up on the soccer field.

### La casa de los abuelos (south-west) — family, the body, clothes — **BUILT** (2026-10-17, `content/es/zone-abuelos.js`)
One big map (40x30) and the cottage inside (20x11). The path comes in at the top (30, 0) past the bus stop and the
signpost (`camino_abuelos`' south exit now lands at (30, 1)); the grandparents' cottage in the middle with its front
door at (19, 9) (it opens: `abuelos_casa`), the orchard behind it (tall trees, apples; a swing hangs from the tree east
of the cottage), the henhouse and the hens' run on the left, the vegetable garden (three rows of beds) and the water
pump, the clothesline (drawn by the zone: the story's clothes, then towels, a sheet and a sock), the duck pond, the
paddock (the cow, the donkey), the turkeys' yard, the sheep's meadow and the pigs' muddy pen. Inside: the living room
(the family photos on the wall, the fireplace, the sofa, a rug, the baby cousin), the kitchen (Abuela, the stove, the
table where cookies cool, a mouse and its hole), the bedroom (the wardrobe with its mirror, two beds, the dressing-up
trunk). At night the windows glow, fireflies come out over the orchard. New tiles (`src/tiles.js`, Unicode codes:
the ASCII ones are used up): `ñ` garden bed (lettuce, carrots, tomatoes, corn along the row), `á` henhouse (2 tiles),
`í` the pigs' mud, `é` the water pump and trough, `ó` the wardrobe (an indoor wall), `ú` the dressing-up trunk.
- **Words (25, four notebook pages; three more since on a fifth, *La huerta*, below):** *La familia* (`familia`): la abuela, la familia, el abuelo, el bebé (`bebe`);
  *Mi cuerpo* (`cuerpo`): la mano, el pie, la nariz, los ojos, la boca, la cabeza; *La ropa* (`ropa`): la camisa, el
  pantalón (`pantalon`), los calcetines, el vestido, los zapatos, el sombrero, la chamarra (Mexican; alt *chaqueta*);
  *En casa de los abuelos* (`rancho`): la vaca, el cerdo (alt *puerco, cochino*), la oveja (alt *borrego*), el burro,
  el pavo (alt *guajolote*), el ratón (`raton`), el gallo, el tlacuache (alt *zarigüeya*). Las orejas, el papá and the
  cake were left out (word count); the cookies and eggs are pictures (*huevo* and *galleta* stay town words, said with
  `[huevo]` markup: met or not). Clothes pictures take `col` (the colour you wear).
- **People:** Abuela (grey braid, pink, an apron: her kitchen; for the photo she waits on the porch), Abuelo (a straw
  hat, a white moustache, blue: the garden), the baby cousin (`bebe`: a little one in yellow, drawn small, crawling on the
  rug). Abuela Rosa in town is a different grandma. Lola meets *la vaca* and points at the front door. Hearts since step 7.
- **Clothes you wear** (`G.abuelos.wear`, saved in `G.state.abuelos.wear`): a cosmetic over the creator's look, on every
  map and the portrait (`G.st.playerSpec` is wrapped): the shirt is the outfit colour, the dress a robe, the jacket goes
  over the shirt (its collar shows), trousers the pants colour, shoes the boots (socks show when there are no shoes),
  the hat a `head: 'hat'`. `AB.putOn(f, id, col)` (sparkle, the sprite changes at once), `AB.takeOff`, `AB.mirror()`
  (a full-screen mirror). The trunk (any time after chapter 1): *¿Qué te pones?* picture cards in colour (mic on; the
  same one again: the next colour), then the mirror, and the first time each day a fashion show (the family claps).
- **The body is DONE** (`G.abuelos.act / .start / .all`, drawn by the zone's `drawAB` as `e.drawSelf`): *toca* a part
  (both hands on the head, over the eyes, a finger on the nose or the mouth, clapping hands, crouching to the feet),
  `wash: true` (rubbing, drops of water), `aplaude`, `tiembla` (cold), `jala` (a tug), `saluda`; the dog does a
  matching trick. Tap yourself here: *¿Qué toco?* (from two met body words). `AB.chooseBody` is the free choice.
- **Album (8):** vaca and burro (`walk`, a `react` frame: the cow moos, the donkey brays), cerdo (`walk` on the mud: it
  rolls), oveja (`walk`), pavo (`fly`: they flap off when you or the dog come near), ratón (`scuttle` on the kitchen
  floor), **gallo** (rare: in the morning by the henhouse), **tlacuache** (rare: at night in the orchard; tapped, it
  plays dead). Lola names an unmet one when it's tapped.
- **Story (line `abuelos`):** 1 *¡A vestirse!* (Abuela in her kitchen: la abuela; the family photo is today, your
  clothes are drying on the line: la camisa, el pantalón, el vestido, put on one by one, trousers or the dress your
  choice; the dog snatches the socks and runs: a tug of war, los calcetines; the mirror in the bedroom), 2 *¡A lavarse!*
  (Abuelo: el abuelo, el cerdo; the dog rolls in the pigs' mud and jumps on you: mud on your hands, feet and nose; at
  the pump Abuelo shows each, you wash it: la mano, el pie, la nariz), 3 *¡La foto de la familia!* (la familia; the
  trunk: los zapatos, el sombrero; the baby has crawled off: el bebé, little hand prints to the pond, she crawls after
  you; everyone on the porch, the camera on its tripod, *¿Cuántos somos?*, *¡whisky!*: a full-screen photo; it hangs on
  the wall after).
- **Side quests (`G.state.abuelos`):** Abuela's cookies (after chapter 1: three eggs from the hens' run, *¿Cuántos?*,
  wash your hands, she bakes; a cookie for you or the dog; daily), the photo wall (after chapter 3: *¿Quién es?*),
  Abuelo's garden (after chapter 2: his basket, four of the day's vegetable from its beds, one for you; daily; see
  *La huerta* below), Simón dice with Abuelo (after
  chapter 2: los ojos, la boca, la cabeza met one at a time (he shows, you do), then *¡Simón dice: toca tu...!* to
  listen, then you are Simón; daily), Abuelo's jacket at night (*¡Brrr!*: la chamarra), the trunk's fashion show, the
  swing in the orchard.
- **La huerta (added 2026-10-21, the parent's choice):** a fifth page, *La huerta* (`huerta`, three words: its page
  puzzle by the beds matches three, `src/intro.js` `P.need`): **la zanahoria** (id = the carrot picture's own name, so
  the dog's dug carrot, Abuelo's gift and Don Lucho's snowman nose are all the word; the picture is unchanged in
  shape, redrawn fatter), **el elote** (`col`: yellow, or white corn), **el jitomate** (`col`: red, or green). The beds'
  vegetables follow the tile (`gardenTile`'s kind by column and row: carrots, tomatoes, corn, lettuce with no word;
  `AB.BEDS` = `[x, y, veg]`, not the bed right above Abuelo: a tap there is a tap on him). Each garden day wants four
  of one vegetable: the first not met yet (met there in a one-unknown puzzle, `meetW`, then named as each is picked,
  *¿Cuántas zanahorias?*, one for you), else one in turn by day. Once met, each grows by the beds to pick up
  (`G.carry.SOURCES`, back after 150 s): a carrot for the dog (he eats it), any of them for Abuela or Abuelo (*¡Para la
  sopa!*, a care heart; `G.carry.show` wrapped; the guide's play takes a vegetable in your hands to Abuela). Abuelo's
  listen-and-do board has them ("Dame dos zanahorias." "Dame el elote blanco." "¿Cuántos jitomates verdes hay?").
- **Dog:** digs in the garden (a carrot: the word *la zanahoria*), steals a sock off the line (dog-spot act `tug`, the zone's own: a tug of war,
  three pulls; from chapter 1's end), chases the turkeys (`chase`).
- **Also:** six hiding places (the hens' hay, the henhouse, the paddock's hay, the pump, the swing tree, a rock by the
  pond), four page puzzles (the body page by the pump, the animals by the paddock, the family under the photos, the
  clothes in the bedroom), favours for Abuela and Abuelo, a ghost-hand demo (`pickegg`), apples in the orchard.

### La montaña (east) — the weather, snow and the cold — **BUILT** (2026-10-17, `content/es/zone-montana.js`)
The last zone. One big map (40x32) and the refuge inside (12x8). The path comes in on the west edge (0, 24)
(`camino_montana`'s east exit now lands at (1, 24)) into a green meadow: the bus stop and the signpost, Mateo's weather
station (a white louvred box; its vane and windsock are drawn by the zone: they spin in the wind), Don Lucho's refuge (a
log cabin under a snowy roof; its door at (25, 17) opens: `montana_refugio`, the fire and the pot of hot chocolate, a long
table, bunk beds), the llamas' corral, a grove of tall firs (monarch butterflies, a woodpecker). Up the hill the snow
begins along a soft wave: snowy pines, the sledding slope (a straight run between two rows of pines and little flags, the
sled waiting at its top (18, 3)), the snowfield (the snowman at (10, 7), three snow piles), the marmots' rocks, the puma's
sunny ledge, the frozen pond (walkable ice: tap it to skate), the lookout on its crag top left (coin binoculars: the view
over the clouds); snowy peaks all along the top and down the sides. New tiles (`src/tiles.js`, Unicode): `ü` snow (the
meadow's grass creeps in at its edges), `ö` ice (walkable; snowy rims), `ç` a snowy pine, `ï` snowy peaks (like `M`,
snow-capped), `ò` the weather station, `ù` the lookout's binoculars, `â` a snowy roof (over the forest's `[` / `]`
cabin wall and door). Night: a deep blue, the refuge's windows and the station's lamp glow, a wolf howls on the crag.
- **The weather** (`G.montana.weather()` / `.setWeather(k)`, saved per day in `G.state.montana.wx`): `nieve`, `elsol`,
  `nube`, `viento`, `lluvia`, drawn over the map by the zone (snowflakes drifting, rain streaks and splashes, soft clouds
  floating over with their shadows, gusts and leaves blowing, warm sunshine and sparkles on the snow) with a cross-fade
  when it changes; after rain, the sun brings a rainbow (`MT.rainbowOn()`). It snows until the first chapter is done
  (wonder on arrival), then each day has its own weather. **The weather station** (after chapter 3): *¿Qué tiempo
  quieres?* (picture cards of the weather words met, not the weather you have: four fit; mic on): say it and it comes.
  The eagle only comes out in the sunshine.
- **The cold**: up in the snow without a *gorro*, a *bufanda*, *guantes* (or the grandparents' *chamarra*) you shiver
  now and then (*¡Brrr!*, your breath steams); hot chocolate keeps you warm a while. **Clothes for the cold** join the
  grandparents' clothes you wear (`G.abuelos.CLOTHES`, `AB.FIRST`; worn on every map, in the portrait, the mirror and
  the grandparents' trunk): the sprite engine (`src/sprites.js`) gained `head: 'beanie'` (a knitted cap with a band and
  a pom-pom), `scarf: col` (a band round the neck, one end hanging; it flaps when you walk sideways) and `gloves: col`
  (the hands' colour), on the map sprite and the portrait. A cap and a sombrero: one at a time (`AB.putOn` wrapped).
- **Words (22, three notebook pages):** *¿Qué tiempo hace?* (`tiempo`): la nieve, frío (`frio`: *frío / fría*), la
  nube, el viento, la lluvia, el arcoíris (`arcoiris`); *La montaña* (`montana`): la montaña (`lamontana`: the zone's
  picture is `montana`), el gorro, la bufanda, los guantes, el muñeco de nieve (`muneco`), el chocolate, el trineo, el
  hielo; *Animales de la montaña* (`faunamontana`): la llama, la marmota, el zorrillo, el pájaro carpintero
  (`carpintero`), la mariposa monarca (`monarca`), el puma, el águila (`aguila`), el lobo. *el sol* (`elsol`) and
  *caliente* are the beach's: the mountain meets them if they aren't met. Sound-alikes never share a question (`CLASH`:
  monarca / mariposa, carpintero / pájaro, muñeco de nieve / nieve); *nieve* left *helado*'s alts and *gorro*
  *sombrero*'s. Long words on a card wrap onto two lines now (`src/learn.js`). The plan's *hace calor, el río, la
  piedra, la bota* were left out (*caliente* covers the heat; the boots are the grandparents' *zapatos*).
- **People:** Don Lucho (the refuge's keeper and the llamas' shepherd: a red knitted cap, a grey beard, an orange
  poncho, a blue scarf: chapter 1, the carrot, hot chocolate; inside the refuge at night and while chocolate is on, by
  the corral by day), Mateo (the weather kid: a yellow raincoat with its hood up, red boots, green mittens: his weather
  station, chapters 2 and 3, *¿Qué tiempo hace?*). Lola meets *la mariposa monarca* (the firs are full of them) and points
  at Don Lucho; Nico's hide-and-seek. Hearts since step 7.
- **Album (8):** llama (`walk`, a `react` frame: ears back, a hum; in the corral and the meadow), marmota (new move
  `peek`: up by its burrow, whistling; ducks into its hole when the dog comes near or you run up, pops out again),
  zorrillo (`walk`; tapped, its tail goes up and a little green cloud drifts off), carpintero (new move `cling`: on a
  fir's trunk, pecking *toc, toc*; flies to another trunk), monarca (`flit`, nine in the grove), puma (`still`, asleep on
  a sunny ledge, a big yawn), **águila** (rare: only when the sun shines; new move `soar`: high circles over the lookout,
  its shadow sliding over the snow, now and then a swoop), **lobo** (rare: at night on the lookout's crag; its other frame
  howls at the moon). Lola names an unmet one when it's tapped.
- **Story (line `montana`):** 1 *¡Qué frío!* (Don Lucho: la montaña, la nieve (it snows); up in the snow you shiver:
  frío; the basket of warm clothes by the refuge's door: el gorro, la bufanda, los guantes put on one by one, the mirror;
  back in the snow, warm, the dog plays), 2 *El muñeco de nieve* (Mateo: el muñeco de nieve; roll three snowballs from
  the piles (*¿Cómo es?* big / small when the forest's words are met); a carrot nose from Don Lucho (his llamas love
  carrots); *¿Qué le pones?* a cap and a scarf; the dog steals the nose: *¡ven!* (or tap him); then hot chocolate in
  the refuge: el chocolate, caliente, pour four cups, *¿Cuántas?*; no chocolate for dogs: a bone), 3 *¡El arcoíris!*
  (Mateo's station: el viento (the vane spins), las nubes, la lluvia (the dog shakes); the child taps the station and
  asks for the sun (el sol): a rainbow, el arcoíris, *¿Qué colores ves?*).
- **Side quests (`G.state.montana`):** the weather station (any time after chapter 3), Mateo's *¿Qué tiempo hace?*
  (look around and say it; *¿frío o calor?*; daily), Don Lucho's hot chocolate (daily after chapter 2: pour four cups,
  count, drink; warm a while), the sled race with the dog (after chapter 1: *el trineo*; *¡tres, dos, uno!*, whoosh down
  the slope, the dog races alongside (you win the first race, then mostly); *¿Otra vez?* and he pulls you back up on a
  rope), skating on the frozen pond (*el hielo*; round and round, a spin: *¡gira!*), animal tracks in the snow (after
  chapter 1, one trail a day: the dog sniffs along them to a pine or a rock; who made them? a marmot, a skunk, a rabbit),
  the lookout (the view over the clouds: the sun or the moon and stars, an eagle, the rainbow, the places you've been far
  below; then *¿Qué hay abajo?*), dressing the snowman (after chapter 2: *¿Qué le pones?*, another colour). Snowballs to
  pick up after the snowman (the dog chomps them).
- **Dog:** rolls in the snow (`roll`, here a snow angel he leaves behind), digs a snow tunnel (a dog-spot act of the
  zone's own, `tunel`: he dives in, a mound moves under the snow, he pops out over there with a bone), chases the marmots
  (`chase`: they duck in).
- **Also:** six hiding places (a snowy pine, the marmots' rock, the refuge's woodpile, the weather station, the llamas'
  hay, a rock by the pond), three page puzzles (the weather by the station, the mountain on the snowfield, the animals by
  the corral), favours for Don Lucho and Mateo, a ghost-hand demo (`snowball`: a snow pile), a stick in the meadow.

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
- **From El bosque:** moves `climb` (o.trees, o.high), `shy`, `flit`; `o.glow` (a light around it), `o.scale` (a big
  animal drawn at 2x), a `react` frame for plain walkers; dog-spot acts `trail` (`path: [[x, y], ...]`) and `swim` (`to:
  [x, y]`, a stick thrown over water); `G.zones.meetW(id, o)` (the beach's meetW, shared: use it); a story spot on the
  same tile as a dog's spot must win (the forest's `Z.search` wrapper defers to `G.chapters.spotAt`); a zone can darken
  its maps at night in `drawTop` (multiply + 'lighter' glows: the forest, the cave); story-drawn sprites with a small
  cached `spr(rows, pal)` helper (the cub, the leaf piles); a full-screen scene (`Binoculars`) for a looking moment.
- **Pitfalls met here:** a mapgen block that replaces lines can silently drop later lines (flowers vanished once):
  re-render the map (`G.drawTile` into a canvas) after every mapgen change; tiles whose look depends on their column
  need `uniq: true` in `reg` (the tile cache key doesn't include x); `perch: 0` is falsy (use 1); "¡Nuevo animal!" now
  waits (hidden, silent) while a menu or a talk is on top.
- **From El parque de juegos:** animal moves `march` (a line per map entry, followers walk the leader's trail) and
  `hop`; dog-spot act `course` (`path: [[x, y, jump], ...]`, `G.zones.hurdle` while he leaps); anyone can be animated
  through `e.drawSelf` (the park's `drawPerson`: actions and rides as poses from `G.frame`, extra arms drawn over the
  sprite) — reuse `G.juegos.act / .all / .tpr / .choose` for any zone's action words (the mountain's *¡ven!*, the
  grandparents' *dress up*); a free `G.choose({ mic: true })` is the way to let the child say whatever she wants;
  `G.seek.tap` and `G.carry.tapSelf` can be wrapped for a zone's own tappable things (bubbles) and "tap yourself";
  `G.animals.update` is a per-frame hook for a zone's mini-game; a story spot on a multi-tile thing should win on all
  its tiles (the park's `main` tile per ride); a chapter's `stage` runs for the line's next chapter too, so guard it with
  `CH.active(id)` when it moves people.
- **Pitfalls met here:** a picture's `col` is a colour (`'#f8c830'`), not a colour word (the black ball); test waits on
  a dialogue need `g.drive`, not `g.until` (a TextBox waits for taps).
- **From La casa de los abuelos:** a zone map you go INTO (a `D` door on the house's front with an explicit exit, the
  inside as a second map; people on either map by an npc `cond` (Abuela inside, on the porch for the photo); a beat on
  another map is found by the guide over the exits); the player's look can be dressed (`G.st.playerSpec` wrapped, memoized
  by look + clothes; set `f.player.spec` again after a change); `G.abuelos.act` (body actions) next to `G.juegos.act`
  (verbs) — both draw people through `e.drawSelf` (keep the sprite at `-24` from the feet, as field.js); a dog-spot act
  of the zone's own (`tug`) caught in the zone's `Z.search` wrapper before zones.js's default dig, and `Z.dogReady`
  wrapped to hold it back until a chapter is done; a story place under the dog is the place, not his menu (the zone's
  `Z.special` includes `CH.spotAt`); full-screen moments (`Mirror`, `FamilyPhoto`) are listed in `tools/harness.js`
  `drive` so tests tap through them. Map tile codes are Unicode now (`ñ á í é ó ú`): the ASCII ones are all used.
- **Pitfalls met here:** a side quest's bubble waits behind the next chapter's (CH.alert comes first: mark the chapters
  done in a side-quest test); `g.until(...).catch(() => {})` in a test waits its whole timeout when the thing happens
  inside a dialogue (drive instead).
- **From La montaña (the last zone):** weather drawn over a map by the zone (`drawWx` in `Z.drawTop`, screen space, a
  cross-fade between two kinds) and a per-day saved state the child changes by saying a word; a zone-wide status effect
  from what you wear (`MT.cold(f)`: shivering on snow tiles without warm clothes, a per-frame check in the zone's
  `AN.update` wrapper); a second `G.st.playerSpec` wrapper on top of the grandparents' (memoized by look + clothes) and
  new sprite parts (`head: 'beanie'`, `scarf`, `gloves`, `src/sprites.js`); people drawn by the zone through
  `e.drawSelf` (`drawMT`: shiver, drink, wave, a sled ride, skating) — the grandparents' `G.abuelos.act` only draws in
  its own zone, so a zone that wants poses draws its own; generic animal moves `peek`, `cling`, `soar`
  (`src/animals.js`); a `when` function on a map's animal (the eagle: `() => G.montana.weather() === 'elsol'`), and
  `f.zoo = null` to respawn when it changes; a SIDE place whose tile moves (`at: () => ...`, the day's tracks); a
  free choice that waits for one answer (*¡pide el sol!*: `MT.weatherGame({ must: true })` in a loop); Choice cards
  wrap a long word onto two lines (`src/learn.js` `fit`). A review day's teacher no longer takes the guide's chapter
  tier in a zone (`src/guide.js`: the review is Villa Sol's; out in a zone, the zone's story beat still leads).
- **Pitfalls met here:** at most four cards fit a `layout: 'cards'` choice (a fifth is pushed off screen: drop one); a
  daily object (`daily(k)` clears all its keys on a new day) must not hold lifetime counters (keep them beside it); the
  guide's tiers put the dog's spots (`Z.goal`) and Nico's game before a zone's own suggestions, so test a zone's
  suggestions by calling `G.zones.goal` / `.task`, or its side places' bubbles; 10+ words met in a test's setup make a
  review day (see above).
- **Every zone is built:** `tools/test-world.js` no longer has a "zone still to be built": a zone's own line is tested
  with a test chapter added after La montaña's (its chapters marked done), the album's numbered "?" entries with a
  planned page pretended for a moment, and every tab (Villa Sol and the five zones) is checked complete.
- `G.chapters.allWrittenDone()` and the badge rows (Misiones, the diploma's first page) are Villa Sol's line only; every
  zone's chapters are listed on Story progress's second page and on *¡Mi mundo!* (step 7).
- A zone's people talk: story, then their side quest, then `G.errands.talk` (presents, favours, "who'd love it"), then
  their line (`person()` in the beach file). Bubbles: use `{ icon }` objects, not bare word ids (a known word's id
  shows a "?").

## Connecting the world (step 7, 2026-10-17, `src/connect.js`)
With all five zones built, what ties them together for the 7-year-old is people she recognizes everywhere.
- **Tomás's letters** (`G.post`): after the opener, once a place beyond Villa Sol has been visited, Tomás has one letter a
  day (his bubble: `carta`). He holds it up with the face of who it's for (`P.pick`: the zones' people in places you've
  been to, Lola once two places are visited, the least written-to first, never someone in the place he's in) and their
  place's picture; `carta` is met there first if it isn't (`Z.meetW`). The guide offers Tomás (`P.offerGoal`) after the
  story's next chapter (his bubble is `later`: the guide's bubble tier passes it by). It goes in your hands as a story thing
  (`bag.add('carta', { q: 'post', to, from })`: not dropped, not given away); its picture (`{ icon: 'carta', letter: npc }`,
  `src/icons.js`) has their face, in the corner and in their bubble. The guide (`G.post.goal`, a tier right after a
  favour going on): them on this map; another map of this place: the way there; another place: the bus stop (the
  world map shows the letter over that place) or, without a stop here, the way on foot. Delivering (any person's talk,
  wrapped): *¡Una carta! ¿Para mí?*, *¡Es de Pepe!* (the sender's face), thank you, a heart (`'errand'`: not capped) and
  a star; every other letter (`n` odd) they write back to the sender (a town friend: the way back to Villa Sol). From
  the fourth letter on, odd days' letters can come from someone in another place. Senders: `P.FROM` (Paco ← Pepe, Abuela
  and Abuelo ← Mamá, Lucho and Mateo ← Luna, Lola ← Nico...). The baby gets none.
- **Tomás on his round** (`P.tomasIn()`): on odd days he stands by one visited place's bus stop (`P.tomasAt`: a free
  tile near the bus's drop-off, off the road, never where a path arrives), with the same letter of the day. He stays in
  Villa Sol too (the town's story may need him any time).
- **Every person's talk is wrapped** once all content has loaded (every `G.maps[m].npcs` entry but the dog): the
  letter for them first (if their story has nothing for now, that's the talk), Tomás's letter of the day after his
  story and favour, the greeting of the day for the zones' people and Tomás (`H.greet`; the town's own talk greets the others, maps.js). Bubbles: the
  letter for them, then their own, then (zone people) a present they'd like (`G.errands.alert`), then Tomás's letter.
- **The zones' people as friends** (`src/hearts.js`): `H.ZONE` (npc → zone, Lola `'*'`), `H.TOWN` (the 12), `H.WHO`
  (all 27), `H.inZone(z)`, `H.greetsWith(npc)` (town: chapter 3; a zone's people: their zone's chapter 1 or a heart;
  Lola: met), `H.POOLS` (their zone's words for the due word after the greeting), `H.LIKES` (paco pan, marina helado,
  nieves flor, tere concha, elena hoja, lupe bellota, ana galleta, pablo pelota, chuy pan, abuela flor, abuelo
  manzana, bebe pelota, lucho galleta, mateo hoja, lola manzana). Their 3-heart secret (`H.secrets`): a rare animal of
  their place not found yet, shown as pictures (the animal and when), else a page puzzle ready there. A zone chapter's
  giver gets the chapter's +2 hearts like the town's. **Lola**: a heart the first time you meet her in each place
  (`G.state.world.lolaZ`), so all five places make her a best friend.
- **The Amigos page** (`src/album.js`): a tab per place (its picture, its friends' hearts; the heart is full when all
  have a sticker), two columns of cards (face, name, hearts, sticker); on a zone's tab Lola has a wide card with the
  places' pictures lit where you've met her. Unvisited places' faces are "?".
- **The world's progress** (`G.progress`): per place `story` (its line), `album`, `friends` (a sticker each), `stars`
  (three: story, album, friends), `complete` (story and album). Three little stars over each visited place on the world
  map (`Z.MAPDRAW`, a hook for more drawings there); the map's trophy (top left) opens *¡Mi mundo!* (`G.story.world()`,
  also the diploma's second page: places visited, words learned, animals, friends; a card per place). A place complete
  is celebrated once, on its map (`ZoneDone`, `G.state.world.done`). The grown-ups' Story progress: a tap turns to the
  world page (a row per place: its chapters' badges, the one going on, album, hearts; Villa Sol's 21 as dots).
- **The dog in every zone**: every zone and path map has his entry (he follows you), he gets off the bus with you,
  every zone has 3 dog spots, and the guide's zone tier suggests one when nothing else is going on
  (`tools/test-connect.js` checks all of it).
- **Pitfalls:** a delivery to someone whose chapter is waiting goes on into the chapter in the same talk (test the
  delivery with that zone's chapters done); `H.WHO` is no longer 12 (`H.TOWN` is); an npc def wrapped after load must
  keep `this` for `alert` (field.js copies defs into npcs with `Object.assign`); a new full-screen moment needs its
  name in `tools/harness.js` `drive` and `src/hint.js` `TAP_ON`.

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
