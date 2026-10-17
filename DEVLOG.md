# Dev log

A running record of what changed in Club de Español and why. Newest first.

## 2026-10-17 — El parque de juegos, the third zone (step 4 of the open world): action words
The park west of Villa Sol, following "How to build a zone" (docs/WORLD_PLAN.md); it only uses universal words and its
own (Villa Sol's *salta*, *gira* and *pelota* are met here when they aren't yet), so it can be the first place visited.
The theme is action words for ages 4-7, taught by Total Physical Response: the child says (or taps) the word and her
character, the kids and the dog DO it.
- **The map** (`tools/mapgen.py`, 40x28): the fenced playground (swings, slide, climbing frame by a tall tree, seesaw,
  merry-go-round, sandbox), the kite hill, a little soccer field, a pond with rocks, the dog's jumping course, a garden
  with a fountain, Don Chuy's bubble cart by the path in. Eight new tiles (`src/tiles.js`: `! < > / ? ^ ; $`); the
  moving parts (swing seats, the seesaw's plank, the turning wheel, the hurdles, the field's lines, the hill's rise) are
  drawn by the zone. Blue night with glowing lamps and crickets.
- **Actions** (`G.juegos`): `act` / `all` / `tpr` / `choose` animate anyone with a verb (corre out and back, fast or
  slow; salta; gira; baila; sube; baja; empuja; lanza and atrapa with a flying ball), with extra arms drawn over the
  sprite; the dog does his matching trick. Tap yourself in the park: "¿Qué hago?" (say one!) and you do it (a ghost-hand
  demo shows it once). Every ride is tappable: you swing, climb the ladder and whoosh down the slide, climb the frame,
  seesaw with Ana, ride the merry-go-round; its word is met the first time and said after (say-it-back).
- **23 words, three pages** (`content/es/words.js`, pictures in `src/icons.js`: verbs show a kid doing it): corre, baila,
  sube, baja, rápido (a race car), despacio (a snail), empuja, lanza, atrapa; el columpio, el papalote, la resbaladilla,
  el subibaja, las burbujas, la cuerda; la paloma, la catarina, la hormiga, la abeja, la lagartija, la lombriz, el
  grillo, el colibrí.
- **Eight album animals**; new generic moves (`src/animals.js`): `march` (a line of ants following each other; tapped,
  they scatter) and `hop` (the cricket: chirps, hops off). The cricket (night, the hill) and the hummingbird (morning,
  the flowers) are rare.
- **People** (`src/data.js`): Ana, Pablo, Don Chuy. **Story** (line `juegos`): ¡Simón dice! (each kid shows two actions,
  everyone does them; then you are Simón), El papalote de Pablo (climb up for the kite stuck in the tree; on the hill run
  fast and it flies, slowly and it sinks; Pablo flies it there ever after), ¡A los juegos! (the slide, push Pablo on the
  swing, the seesaw with Ana).
- **Side quests:** Ana's jump rope (five ¡salta!, counted) and Simón dice, Pablo's ball (lanza, atrapa; the dog leaps for
  it), Don Chuy's bubbles (tap six; then a bubble wand: bubbles trail behind you on any map). The dog digs a ball out of
  the sandbox, runs his jumping course (new dog-spot act `course`) and chases the pigeons. Six hiding places, three page
  puzzles, favours, a ball on the soccer field.
- Tests: `tools/test-zone-juegos.js` (new: walking in, everything reachable, the bus, Lola; the animals, the ants' line,
  the cricket, the album; tapping yourself and every ride; the story by taps; the side quests; the dog's three things;
  hide-and-seek, a page puzzle, save and load). `test-world`: its "zone still to be built" checks (a zone's own chapter
  line, the album's "?" tab) moved to La casa de los abuelos; the park's dig gives a ball.

## 2026-10-17 — El bosque, the second zone (step 3 of the open world)
The forest north of Villa Sol, following "How to build a zone" (docs/WORLD_PLAN.md); it only uses universal words and
its own, so it can be the first place a child explores. The parent asked for wonder, adventure and many animals.
- **The maps** (`tools/mapgen.py`): a 40x30 forest (a rock cliff and a waterfall into a pond, a meadow, the bears' cave,
  a river with a little bridge and stepping stones, a clearing ringed by tall trees, Doña Lupe's log cabin and her
  blackberry bushes, a hollow log, groves), the cave inside (dark, glowing mushrooms, fireflies, mama bear asleep) and
  the cabin inside. Twelve new tiles (`src/tiles.js`): tall trees over two tiles (oak or pine), mushrooms, berry bush,
  hollow log, rock cliff, waterfall, the cave's mouth, stepping stones, log cabin wall and door, cave floor and walls.
  At night the forest goes dark blue with fireflies glowing; the cave is always dim with a light around you.
- **17 words, two pages** (`content/es/words.js`, pictures in `src/icons.js`): el bosque, pequeño, grande, la cueva, la
  bellota, la hoja, el tronco, la mora, el hongo; el oso, la ardilla, el mapache, el venado, el zorro, el erizo, el
  búho, la luciérnaga. Each met in a one-unknown puzzle (`G.zones.meetW`) and used right after (many mic questions:
  "¿Cómo es?" big or small, "¿Cuántas?").
- **Eight album animals**, new generic moves (`src/animals.js`): squirrels `climb` up the trunks when you come near,
  deer are `shy` and bound away, fireflies `flit` with a `glow`; the fox sits and the raccoon stands up when tapped
  (`react` frames); the hedgehog curls up; mama bear (`scale: 2`) sleeps in the cave (rare), the owl only at night.
- **People:** Elena the forest ranger, Doña Lupe (`src/data.js`). **Story** (line `bosque`): the lost bear cub (the dog
  follows the paw prints to the cave; mama bear stands up BIG), the squirrel's acorns under the leaf piles (and a
  hedgehog), Elena's binoculars (a raccoon in the hollow log; then a full-screen binocular view: a deer, a fox).
- **Side quests:** Lupe's blackberry pie (a basket, four bushes, a pie the dog loves), Elena's big-or-small mushroom
  game, Lola's leaves (three colours), fireflies in Lola's jar at night. The dog sniffs the log, follows a trail of paw
  prints (`trail`) and swims across the river for a stick (`swim`). Six hiding places, two page puzzles, favours.
- **Two old test failures fixed:** "¡Nuevo animal!" kept running (and spoke) under a menu that opened over it (the
  notebook test heard "el perro"): it now waits, hidden and silent, while anything is on top of the map (`src/album.js`).
  The flower walk-on test tapped a coloured flower that is a thing to pick up (carry.js walks you beside those): it now
  taps a plain flower (`tools/test-roundb-world.js`).
- Tests: `tools/test-zone-bosque.js` (new: walking in, every place reachable, the cave and the cabin, the bus; the
  animals, their moves, night, the album page; the story by taps; the side quests and the demo; the dog's three things;
  hide-and-seek, a page puzzle, save and load).

## 2026-10-17 — La playa, the first zone built (step 2 of the open world)
The beach south of Villa Sol, following "How to build a zone" (docs/WORLD_PLAN.md); everything only uses universal
words and the beach's own, so it can be the first place a child explores.
- **The map** (`tools/mapgen.py`, 34x24): dune grass and palms, the path and the bus stop, Doña Nieves's ice-cream
  cart, umbrellas, Marina's lifeguard tower, Tere's sandcastle, the turtles' nest, wet rocks with a tide pool you can
  wade into, a pier with Don Paco's boat, the surf rolling in, clear turquoise shallows and the deep sea. New tiles
  (`src/tiles.js`): surf `9` (a wave laps up the sand and back), clear shallows `-`, dune grass `&`, pier `d`, palm `1`,
  umbrella `2`, sandcastle `3`, boat `4`/`5`, tower `6`/`7`, cart `8`, wet rocks `0`.
- **17 words, two notebook pages** (`content/es/words.js`, pictures in `src/icons.js`): el mar, la concha, el sol (a sun
  in sunglasses), caliente, el helado, la arena, la cubeta, el castillo, la ola; el cangrejo, la estrella de mar, la
  tortuga, la gaviota, nadar, la medusa, el delfín, el pulpo. Each is met in a one-unknown puzzle (`meetW`: introduced
  here, or asked as a question if another zone met it first) and used again right after. Ids `elsol` / `cubetaarena`:
  `sol` and `cubeta` were already icon names used as plain strings, and a word id shadows its icon.
- **Seven album animals** with pixel frames and cries; generic moves in `src/animals.js` (`scuttle`, `fly`, `drift`,
  `leap`, `still`, `crawl`, chosen by `addKind({ move, on, water })`), so a zone needs no case of its own: crabs dash
  sideways and snap, gulls take off when you or the dog come close, jellyfish pulse, the turtle pulls its head in, the
  dolphin (rare: mornings) shows its fin and leaps, the octopus (rare: nights) waits in the tide pool. Tapping one whose
  word isn't met: Lola calls out its name in a puzzle.
- **People:** Don Paco, Marina, Doña Nieves, Tere (`src/data.js`), each with a bubble and a talk (story, side quest,
  presents and favours, their line).
- **The story** (line `playa`): Don Paco's net (what's tangled in it, back to the sea), ¡Qué calor! (an ice cream for
  Marina), Las tortuguitas (the nest hatches, the dog chases the gulls, tap each baby to the sea, they swim).
- **Side quests:** Lola's five shell colours, Tere's sandcastle with the pail (fill it three times, then the flag; a
  new one daily), the little crab with no shell, an ice cream for whoever is hot today. The dog digs for shells,
  splashes in the waves and chases the gulls (new dog-spot act `chase`); he eats ice cream. Six hiding places, two page
  puzzles, favours for the beach's people.
- **Framework:** a guide tier for a zone's task going on (`G.zones.task`: the pail in your hands beats other bubbles), a
  zone's own ghost-hand demos (`G.zones.demos`: `fillpail`), `G.animals.takeOff / leap / tone / noise`. The first zone
  chapters showed that "every written chapter" meant Villa Sol's story: `G.chapters.allWrittenDone(line = 'villa')`
  and the badge rows (Misiones, the diploma) are Villa Sol's line now (a zone's chapter still gets its badge card). Notes for the
  next zones in docs/WORLD_PLAN.md ("Framework additions").
- Tests: `tools/test-zone-playa.js` (new: walking in and the bus, every place reachable, the animals and Lola's naming,
  the rare ones, the album page, the story by taps, the side quests and the demo, the dog's three things and carrying,
  hide-and-seek, a page puzzle, save and load). `test-world` (the album's "?" tab is now El bosque's) and
  `test-roundb-world` (70+ words, Villa Sol's 11 animals first) follow. Known before this step and unchanged: the
  flower walk-on check in `test-roundb-world` fails on the base commit too.

## 2026-10-17 — The open world, step 1: the framework (zones, paths, the bus, the world map, the dog's name)
The 7-year-old loved variety and choice and wants to explore and meet people and animals; the parent decided: an open
world, Pokémon-style but friendly (no locks, no bosses), the child names the dog, the dog tutorial can be skipped, no
daily word limit, walkable paths AND a bus, exploration first with recurring characters, and the album as a real
Pokédex. The plan for the five zones and the pattern each zone step follows: `docs/WORLD_PLAN.md`.
- **The opener** (`CH.opener`, content/es/story-c01-c10.js): Mamá's *hola*, a puppy bursts in, laps the room and sits
  at your feet; Mamá asks *¿Cómo se llama?* and the name screen comes up with his picture and *Canelo* already typed
  (one tap on ✓ keeps it; a dice picks another dog's name; any name can be typed: `src/creator.js`, dog mode). Then two
  big pictures (`G.playOrExplore`, src/zones.js): the puppy with his ball (*¡A jugar con Chispa!*: chapter 1 right away)
  or a path into the hills (*¡A explorar!*: the door is open, he comes along; his games wait as Mamá's puppy bubble,
  the very last thing the guide suggests). The voice asks it; no reading needed.
- **{dog}** everywhere: `G.fill` fills `{dog}` like `{name}` (`G.dogName()`, saved as `G.state.dogName`); every
  "Canelo" in a string became `{dog}` (dialogue, prompts, English help, chapter titles, the notebook page, the pet menu,
  the Amigos page). `G.nameOf('canelo')` is his name.
- **No word budget**: `G.chapters.gate` lost 'budget', 'soon' and 'busy' (a review day is only an offer now);
  `G.budget.canIntro` is always true. Morning / evening chapters stay (they're the story's time of day).
- **Zones** (`src/zones.js`): a registry (`G.zones.add`), visits with a "¡Nuevo lugar!" card (the zone's picture pops in
  with confetti, its name said, a little bus drives in: you can come back by bus), map-edge exits (`G.zones.edge`) and
  routes over every map's exits (`G.zones.route`), signposts with the zone's picture, a bus stop in every zone, the bus
  ride (it drives in along your row, you and the dog hop on, it drives off; it drops you at the zone's stop), the dog's
  spots (dig, splash, sniff, roll: he may leave something to pick up), Lola (the friend who travels: at every zone's
  first map) and Nico's hide-and-seek for any zone, rare-animal times.
- **The world map** (`G.worldMap`, from any bus stop and from the kid menu's new map picture): Villa Sol in the middle,
  the zones as big pictures on paths; visited ones in colour with their name and album count (tap: the bus takes you;
  from the menu it comes to you), the others dark "?" silhouettes (tap: footprints run along the path and the guide's
  arrow suggests the way on foot); your face shows where you are.
- **Maps** (`tools/mapgen.py`): Villa Sol has five openings (west, north, east, south, south-west) with signposts and a bus
  stop by the plaza road; five path maps (a meadow, a forest track, hills, sand and a lagoon, wheat fields) with animals,
  a stick or an apple tree and signposts; five placeholder zone maps (sand and sea, a clearing, a sandbox and benches,
  the grandparents' garden, a meadow under the peaks), each with its signpost, bus stop, the dog's spot, Lola, Nico and
  hiding places (`content/es/zone-<id>.js`; Villa Sol's entry in `content/es/zone-villa.js`).
- **Quest lines** (`src/chapters.js`): chapters have a `line` (a zone; Villa Sol's 21 are 'villa'); each line has its
  own chapter going on, and none waits for another (`G.chapters.add`, `.current(line)`, `.next(line)`, `.lines()`,
  `.lineHere()`). Villa Sol's story is its quest line, never required to leave town.
- **The guide** suggests what's NEAR (the zone you're in, or the path): someone or something on another map counts
  only in the same zone, the way found over every map's exits; a chapter not started yet comes after the things going
  on here; places not visited yet come before the day's play (a road out with the zone's picture); a place asked for on
  the world map comes early. In a zone: Lola's bubble, the dog's spot, Nico, things to pick up.
- **The album is a Pokédex** (`src/album.js`): a tab per zone (its picture and count; gold when complete) and Amigos;
  numbered entries in world order; silhouettes with a little picture of where they live; rare ones marked; numbered "?"
  for animals a zone will have; "¡Completo!" with confetti per zone; and "¡Nuevo animal!" over the map (never blocking
  it; it waits until a talk or a menu is over) the first time an animal is met: its number, picture, cry and name, then it flips into the corner.
- **Generalized for zones**: hide-and-seek is one game per zone (`src/seek.js`: Villa Sol's unchanged), favours are
  data-driven per map (`G.favores.OFFERS`, `PLACES` with `on`, an offer's condition), `G.animals.addKind` for a zone's
  animals (a default walk, frames, a cry) and rare spawns (`when`, `chance`), `G.mapKit` (talker, Canelo on any map).
- **Demos** (`src/demo.js`): `bus` (the hand taps the bus stop, once two places are visited), `worldmap` (it taps a
  place), `dogspot` (it taps the paw prints).
- Tests: `tools/test-world.js` (new: naming the dog and `{dog}`, the skip path, no budget, every path walkable both
  ways, a walk by keys into a zone and "¡Nuevo lugar!", the bus and the world map ("?" places, the bus from the menu),
  the dog's spot, Lola, Nico's game in a zone, a zone's quest line beside Villa Sol's, the album by zone, save and
  load). Existing tests follow: the kid menu has the map; the guide test expects exploring before the day's play and
  chapter 5 opening on a 12-word day; the harness plays the dog's name, the choice ("play" unless `g.explore`), the new
  place card and the world map.
- Left for the zone steps (docs/WORLD_PLAN.md): each zone's own maps, words, people, animals (pixel art, cries,
  habitats, rare ones), story line and favours; Tomás's letters between zones; Lola in the Amigos page (hearts). Note:
  with no word limit, a child who plays the town's chapters back to back can meet 30+ new words in a day (test-chapters2
  logs the counts); the cards and the review engine adapt, but a soft "rest" suggestion may be worth adding if the parent
  sees overload.

## 2026-10-11 — Word cards that grow, the book later, picture + word always, a ghost hand (step 3 of the second playtest)
The parent (`docs/PLAYTEST_NOTES.md`): bonus stars mean nothing to a child; show progress on the word itself (say it a few
times and see its card pop up and grow); the notebook comes too soon (early on just cards, the book later as an
organizer); any word with a picture should always show both; Spanish instructions aren't followed: it must be intuitive.
- **Word cards that grow** (`src/cards.js`). Every met word is a card: its picture, its word (blue; gold once
  remembered) and a plant in a pot: seed, sprout, leaves, bud, flower, then two flowers and a third, gold one. Using the
  word grows it: saying it 5 (by far the most, with sound waves and a brighter rising sound), a right pick 2 (1 after a
  miss), a find 2, a page-puzzle match 2, carrying, giving or tapping it 1 (these at most once per word per 30 s of play,
  so nothing can be farmed). Each use pops the card up right where it happened (the card picked, the mic, beside the
  word bubble on the map), the plant grows before the child's eyes (a sparkle and a chime at each new stage), then the
  card flies into the deck. The plant is floored and capped by the word model: no flower before the word is remembered
  (stage 3: the card turns gold and blooms right there), a known word is at least a sprout, a solid one has two flowers.
  Growth points live in the word's record (`gp`), so the save format is unchanged.
- **No stars for the child.** The corner star counter and the flying stars are gone (`G.fx.flyStar` is a little
  sparkle now); the mic's "said it" mark, the say-back bubble and Canelo's learned tricks show a little growing card;
  the *Hoy* card shows today's cards (no star row); the save slots show the deck and the number of cards; the grown-ups'
  help says "saying a word grows its card the most". `G.state.stars` is still counted (the diploma, grown-ups).
- **Cards before the book.** The map's corner button is now the deck (a little stack of cards, the count beside it).
  The kid menu is the cards (a fan of the newest three) and the album; the deck (`G.deck()`) lays every card out on a
  green table, newest first, tap one to hear it. At 15 met words a small celebration (an open book drops in, the
  newest cards fly into it, confetti, it flies to the corner) opens the notebook in the kid menu, as their organizer.
  Before that, someone handing over "the notebook" (Mamá in chapter 1, Canelo's page) pops the cards instead. Page
  puzzles work before and after.
- **Picture and word, always together** (`src/ui.js`). Every word in a line has its picture beside it: met, picture +
  blue word; remembered, picture + gold word (there is no "word alone" look any more). The Tunic rule stays: a word not
  met yet is its picture and a faint dotted blank, unreadable until its puzzle. So that pictures everywhere give no
  answer away, a question's own choices that appear in its prompt are a speaker (heard, not shown), automatically; and
  the right card, once picked, shows its picture and its word. The recall cards themselves (word-only, picture-only)
  are unchanged: that's the learning. Canelo's care cards now carry their word once met.
- **A ghost hand shows each new thing once** (`src/demo.js`, saved in `flags.demo`). The first question's picture cards
  (it glides over them and taps one at random: never the answer), the first mic (it taps it, then a mouth talks over it
  with sound waves), Canelo (tap him), a thing to pick up, giving it to Canelo (the hand carries it from you to him),
  putting it down (it taps you), a page puzzle (it drags a word up between the pictures: no answer) and a peeking
  hide-and-seek animal. It only draws; the child's own tap stops it. Map demos wait for 1.5 s of standing about.
- **Variety when the day's plays are done** (`G.carry.more`): not endless fetch, but the next of a trick for Canelo (its
  picture by the arrow), petting him, water or a cookie, another round of hide-and-seek with Nico (new hiding places, up
  to three a day), the ball for Nico, fetch, the one played least today first. When it's Canelo's turn, his menu opens
  with the guide's yellow arrow over that card (the trick, the pat, the water); the naive bot follows that arrow too and
  counts a play done as something happening.
- Tests: `tools/test-cards.js` (new: growth on pick, say, carry, find and its limits, the stage cap, the deck, cards before
  the book and its celebration, picture + word rendering and the masked choice, each demo once and saved, a tap stopping
  one, the variety). `smoke`, `test-guide`, `test-hints-day`, `test-roundb-pet`, `test-fx`, `test-speaking` follow the
  cards (the kid menu, no notebook in chapter 1, no flying star); the harness closes the deck like the notebook.

## 2026-10-11 — Pick things up, and never a dead end (step 2 of the second playtest)
The 7-year-old: "I want to be able to pick up stuff"; "didn't know what to do / ran out of things to do"; loves doing
things with the dog (`docs/PLAYTEST_NOTES.md`). Step 1's audit left one thing: the gaps with nothing to do between
chapters and at the end of a day (`docs/INTUITIVE_AUDIT.md`).
- **Pick up and carry** (`src/carry.js`). Things lie about: apples under two apple trees (red apples drawn on them) and
  in the barn's basket, sticks in the park, Canelo's blue ball in front of home, a bone by his cushion every morning,
  eggs in the barn's hay, the coloured flowers, a letter Tomás dropped (after chapter 10). Tap one: you walk up to it,
  pick it up and hold it up over your head in both hands; its name is said in the word bubble with its picture (a met
  word: picture + word, a light encounter and the say-it-back mic; an unmet one: its picture and "?", never met this
  way, so the new-word budget is untouched; the stick is a toy with no word). One kind at a time, a stack of up to three;
  picking up another kind puts what you held down where the new thing was. A tap on yourself or on the thing in the
  corner puts it down in front of you, and it stays there (saved). Things come back: apples and flowers a few minutes
  after they're picked, sticks sooner, the bone and the eggs every morning, the ball a minute after it's nowhere.
- **Giving.** Tap Canelo while you hold the ball or a stick: you throw it and he fetches it back to you (a heart); the
  bone, a cookie, bread he eats (the bone is his favourite: a gift heart); a flower makes him sneeze and you keep it.
  Tap a friend who loves it (their bubble already shows it): they take it for a heart (no yes/no question before *sí*
  and *no* are met). Anyone else looks at it and says who'd love it, holding up that friend's face (*¿Para Luna?*);
  Tomás takes his letter back.
- **The bag is your hands**: the story's things are held up over your head too (Pepe's apple, Marta's bread, the
  letters), and the corner shows what you hold as picture + word ("?" while unmet), the story's things after it.
  Chapter 4's apple for Rosa is now a carry step: Don Pepe puts it in your hands, Rosa's bubble shows it, the guide's
  arrow goes to her and her question comes when you bring it.
- **Never a dead end** (the guide's last tier, `G.carry.plan`): when the story has nothing for now, the arrow points at
  the day's play: what you hold goes to whoever would love it today (or Canelo, or the ducks); empty-handed, today's next
  play in an order that turns every day (fetch with the ball, an apple for Luna or Gómez, a flower for Mamá, Rosa or
  Lucía, the bone for Canelo, a stick, an egg for Rosa, Tomás's letter, bread from Marta for the ducks, a page puzzle);
  a game of fetch is always there. All word-safe.
- **Later, without words**: the next chapter's giver sleeps under a night-blue moon bubble with "z z" floating up
  (tonight: the moon alone), never a sun and "¡Mañana!" alone; tapped, they yawn, "z" puffs float up and the line
  holds up the sleeping picture (a moon over a pillow), then the sun coming up. Nico's *¡Hasta mañana!* and Luna's after
  the palabra hold up the sunrise. At sunset the arrow points home, and at home to your bed: a tap on it is good night.
- Tests: `tools/test-carry.js` (new: pick up, hold, the corner, "?" for an unmet word and the budget, a stack, a swap,
  put down by a tap on yourself or the corner, saved; Canelo fetches the ball and the stick, eats the bone; Gómez's
  heart; Nico's "¿Para Luna?"; apples, the bone, the ball and the eggs come back). `tools/test-guide.js`: never a dead
  end (a play goal when the next chapter is a morning one or today's words are used up; the giver asleep; sunset home;
  the bed), and the naive bot's day 1 now plays between chapters with no time lost. `test-chapters` and
  `test-hints-day` follow the sleeping giver; `test-roundb-pet` follows step 1's kid menu (the album right after the
  notebook). The naive bot counts picking something up as something happening.
- **The audit** (`docs/INTUITIVE_AUDIT.md`, step 2): days 1-3 by the naive bot, each played to sunset and bed. Seconds
  with nothing to do: **659 → 0** (stuck moments 7 → 0; the 14 s lost while there was a story step are unchanged).
  Every day ended at sunset at home (step 1's ended stuck with nothing to do). The bot now sleeps into the next calendar
  day, counts picking something up as something happening, and (in a chapter) only the story as progress. Two fixes it
  found: a story's place wins over the head of someone standing below it (the bushes of chapter 5, with Canelo
  below), and the last bush to look in no longer gets Canelo and the cat as decoys.

## 2026-10-11 — Always a next thing to do, in sight (from the second playtest)
The 7-year-old "didn't know what to do next" and "ran out of things to do"; the parent: kids don't go into menus like
Misiones, they need pointers and arrows, Spanish instructions aren't followed (`docs/PLAYTEST_NOTES.md`). Step 1 of a
series (next: never a dead end and picking things up; word cards that grow, picture-and-word always, ghost-hand demos).
- **A kid's-eye audit** (`docs/INTUITIVE_AUDIT.md`, `docs/audit-shots/`): days 1-3 on an iPad played by a *naive bot*
  (`tools/naivebot.js`, `tools/audit-intuitive.js`) that only taps what visibly calls for a tap (bubbles, the hint
  hand, peeking animals, sparkles) and otherwise wanders and stands about like a child who can't read Spanish. It
  counts the seconds lost at every moment free on the map, and the line said just before (the instruction a child
  would have had to read). The worst: Nico's listening game (who says "¡Miau!": nothing on screen says "tap the cat";
  the hand never came, as it would give the answer away) and Sofía's bushes (same), Sofía off screen on day 3 (only a
  hand at the screen's edge, after 6 s still), the hand sending the child in and out of the house during "¡Guau,
  guau!" (Canelo was the answer: the hand's door fallback found "Canelo" in the house), and the gaps between chapters
  (nothing at all to do). Before: 17 moments stuck while there was a next step, 1262 s lost; with the guide: 0 and 14 s.
  What's left is the time with nothing to do at all (step 2).
- **The guide** (`src/guide.js`): while free to walk there is always one goal, most important first: the chapter's
  beat (a person, a place, an animal, a door, a find-it puzzle; the next chapter's giver; a review day's teacher) >
  home at sunset > a favour > Nico's hide-and-seek > Canelo's "?", Luna's palabra, Inés's pages, a side job, anyone
  with a bubble. On screen a yellow arrow bounces over it (over its bubble; under it, pointing up, near the top of the
  screen); off screen an arrow waits at the screen's edge pointing the way, with a little picture of who or what is
  there; on another map it's over the right door (in town) or the way out (in a building), with the picture beside it.
  A puzzle's choices (the cat and Canelo in the listening game, the bushes, a find-it's picture bubbles) all get a small
  white arrow, never only the answer. Standing about ~4 s, Canelo trots a few tiles that way, barks and looks back (he
  follows again as soon as you walk). The hint hand now taps on the guide's goal (and only on screen: off screen the
  edge arrow does it), which also ends the in-and-out door loop. Nothing to do (the next chapter opens tomorrow): no
  arrow.
- **Bubbles**: a chapter's person shows the chapter's picture (`G.chapters.emblem`: Nico a cat, Sofía her red ball, Don
  Pepe an apple), never a bare "!". A favour naming a place or an animal by its word only gets the arrow as a hint,
  after ~10 s (the word is what's being remembered).
- **The kid's menu** is two pictures, no words: the notebook and the animal album (and the grown-ups' gear).
  **Misiones** moved to the grown-ups menu (*Story progress*).
- Tests: `tools/test-guide.js` (new: a goal whenever there's something to do, the arrow on and off screen, doors both
  ways, choices without the answer, Canelo's trot, the bubble picture, the menus, and the naive bot playing day 1 through
  chapters 1 and 2 by following only what it sees); smoke, test-saves, test-chapters, test-review follow Misiones to the
  grown-ups menu and the chapter-picture bubble.

## 2026-10-09 — The barn opens, hide-and-seek, doors that say why (from the first playtest)
A 4-year-old's first session (`docs/PLAYTEST_NOTES.md`): finding the cat on the fence post was the best moment; "the
door that was locked, I never got to go in there" the worst.
- **The barn opens** (`G.maps.granja`, a 13x9 interior from `tools/mapgen.py`): new tiles in the same hand-drawn style
  (a straw floor, plank walls with two windows, a horseshoe and a coil of rope, square hay bales, nest boxes with a
  perch, a trough, a milk can, a basket of apples). Inside: a cream horse in her fenced stall (a second look, `tint`),
  two hens on the perch (`perch` in animals.js) and one scratching about, Canelo tagging along. Everything with a word
  names itself (`things`: huevo, agua, leche, manzana; the animals); before its word is met it's a "?" and its picture,
  as everywhere (the banner is the barn's picture only before chapter 7). A hay bale rustles (a map's `poke`). The
  *¿Qué dicen?* page puzzle moved from the barn's door into the barn. Entering asks the barn's name when it's due (like
  the other buildings), and Tomás's "go to the farm" favour also counts walking into the barn.
- **Chapter beats at the barn stay outside**: chapter 7's find-it ("¡La granja!" while Canelo barks in the barn) now
  also counts walking into the barn's door as finding it, so a child who heads for the door isn't sent inside an
  empty barn; Canelo comes out as before. Chapters 19 and 21 (the paddock gate, the party in front of the barn) are
  unchanged: they're big outdoor scenes with the whole town.
- **¿Dónde están?** (`src/seek.js`): once a day, when no chapter is going on, Nico has a magnifying-glass bubble and
  starts hide-and-seek: two or three animals whose words are met (cat, rabbit, hen, goat, duckling, frog) hide in 13
  spots (a farm fence post, the bakery roof, behind your house and the library, in the trees, in the fountain, behind
  hay bales, bushes and barrels, three in the barn; one in the barn when it fits). They peek (an ear, a comb), pop up
  to their eyes every few seconds (more often, with their cry, when you're close); their own selves are away
  meanwhile. Tap one: it pops out with a chime and a star, its name in the word bubble (say-it-back), a review
  question when its word is due; all found: confetti, a star and a heart from Nico. Hints: Nico holds up the place's
  picture; Canelo, after ~15 s with nothing found, sniffs and leaves paw prints toward the nearest one (or the barn's
  door). A little panel shows who's still hiding. No word is introduced (the budget is untouched); it waits while a
  chapter is going on, so the story's animals are always where the story needs them.
- **Doors**: audited every exit. The barn was the only door that never opened; every `D` / `K` in town is now an exit
  (the test checks it). The front door before chapter 1 is over (the puppy hiding) no longer says only "¡Luz!": Mamá
  says *¿Y el perro?* and points at his hiding place. Chapter `door:` beats were already scenes with their reason.
- Tests: `tools/test-barn.js` (new): in and out by taps, the barn's things before and after their words, hide-and-seek
  from Nico's bubble to the last find (no word met, the chapter pause), Canelo's trail, the doors. `test-chapters` and
  `test-chapters2`: their peek at the question on top no longer crashes when it has just closed (it flaked when
  several browser tests ran at once).

## 2026-10-09 — The mic no longer disappears on iPad
- On iPad Safari the mic test worked but no mic showed up in the game. Two refusals from Safari (it sometimes refuses
  while the voice is still finishing a line) used to hide every mic button for the rest of the session. Now a refusal
  never hides the mic: the child gets "¡Otra vez!" and can try again. The last 10 mic problems are kept on the device,
  shown in the grown-ups menu's *Speaking (mic)* row and included in the mic test's shared log.

## 2026-10-09 — Learning redesign: wrap-up
- The review-share target is now **at least 40%** (was 40–60%). With at most 5 new words per chapter and at least 5
  spaced retrievals per word, review naturally lands around 70–80%; a ceiling of 60% would have meant fewer
  retrievals than the research asks for. With that, **all 10 measured targets pass** on the full 18-session run
  (`docs/VOCAB_AUDIT.md`).
- Before → after on the whole game: most new words in 5 minutes 40 → 5; new words in the first session 65 → 6; words
  first met on a notebook page 43 → 0; median time from meeting a word to first using it 6:50 → 1:10; words never
  actively used 30 → 0; median active uses per word 1 → 10; words met first as a wrong answer 18 → 0.

## 2026-10-09 — Learning redesign, step 2 (part 2) and step 3: chapters 11-21, review in the world
The whole game is now the chapter path of `docs/CURRICULUM.md`: chapters 11-21 are written and the older errands they
replace never open.
- **Chapters 11-21** (`content/es/story-c11-c21.js`): Rosa's hens (nests with *uno* and *dos* found on the map, the
  white hen, a hen called home with *¡ven!*), Mamá's market (counting heaps of fruit, *por favor* overheard), the picnic
  (five stops, a basket of *cinco*, six plates on a blanket), the dog show (*dame la pata*, *salta*, Luna judging from
  picture signs, four ribbons), Lucía's flowers (find the pink and the yellow one, a butterfly on Canelo's nose), the
  lost pages (*¡busca!*: Canelo sniffs the notebook's cards out in the park, one up a tree, a rabbit on the last; Inés's
  library), Nico's sound game (frog, *croac*, green, a bird; *¡gira!*), counting the town with Luna (a fish, *siete*,
  *ocho*), the animals following you to the farm (*nueve*, *diez*), getting the party ready and the party (no new
  words; Canelo's show, the animals' song, the photo, the diploma). §7.6 of the curriculum lists where the build
  differs from the plan (C20 and C21 are shorter: about 40 answers each).
- **Engine pieces**: picture signs (`{icon, sign}`: a trick's picture on a wooden sign; word-only cards), heaps to
  count (`{icon, count}`, `{list}`: never the number's own picture), *busca* (a `sniff` animation, then Canelo walks to
  the target and barks), animals that follow you after *¡ven!* (`a.follow`, `a.go`, `a.pin` in animals.js), request
  bubbles that turn to "?" once their word is known, someone tagging along (`follows`), a chapter's `after` (the
  diploma), Canelo's menu with six tricks, all taught by the chapters. Two people on one tile: the one with a bubble
  (or the one tapped) is the one you talk to.
- **Review in the world** (`src/favores.js`): favores (up to three a day: go to a place named only by its word, find an
  animal, count, a colour, a sound, a face, a thing; a star and a heart), Luna's *palabra del día* (a picture: say it),
  Inés's library offering a page puzzle a day. With the morning greeting's due word, Canelo's "?" and the page puzzles,
  that is every review source of the design.
- **The older errands are retired**: `src/errands.js` is now the bag, side jobs (the hens' egg opens with C11, flowers
  as presents with C15), presents and the shops; the market went from maps.js. Older saves (from before the chapters,
  or from part 1 with the older errands after chapter 10) map those errands onto chapters 11-21 (`migrate()`, save
  version 3); an errand still going on is let go.
- **Audit** (`docs/VOCAB_AUDIT.md`, the full run: 18 sessions, every chapter, the diploma): 9 of the 10 targets pass
  (part 1 passed 6): no word unused or only cued, none met as a wrong answer first, a median of 10 active retrievals
  per word, every word in 3+ episodes. The review share is 76% against 40-60%: left high on purpose (the curriculum's
  chapters are 70% review by design, and ≥ 5 spaced retrievals per word cannot fit under 60%); the audit report
  explains it. Canelo's "?" (a word's first use) no longer counts as a review.
- **Tests**: `tools/test-chapters2.js` (new: chapters 11-21 by taps to the diploma, each chapter's words, the budget,
  the tricks, favores and the palabra on the way; a part-1 save), `tools/test-review.js` (new, replaces
  `test-roundb-errands.js`: favores of every kind, the palabra del día, Inés's pages, the greeting's due word, side jobs,
  shops, presents, flowers, no older errand); the others follow (six tricks; chapter 11 after chapter 10; Tomás's road
  check counts the tiles he steps on, not time samples, which made it flaky).

## 2026-10-09 — Learning redesign, step 2: the chapters (1-10)
The curriculum of `docs/CURRICULUM.md` begins: one story path of chapters in a fixed order, chapters 1-10 written.
- **Content moved to `content/es/`**: `words.js` (73 words: *uvas*, *negro*, *café*, *ventana*, *puerta*, *pío* and
  *bee* dropped; *buenas noches* and *busca* added with a moon and a nose; *rosa* shows *rosado / rosada*), 11 notebook
  pages and where their puzzles sit, and the 21-chapter table. `story-c01-c10.js` holds chapters 1-10. `src/data.js`
  copies it into `G.data`; pictures stay in `src/icons.js`.
- **Chapters** (`src/chapters.js`): a chapter is a list of beats (talk to someone, a place, an animal, by itself, a
  door, the evening at home), saved beat by beat, and a quest for Misiones and the badges. The gate opens the next
  chapter when the last is done and today's new words fit (6 a day, 8 a date; a review day while 10+ words are only
  met, when Luna or Mamá asks the oldest of them; morning and evening chapters); the next giver shows a sun
  coming up meanwhile. Older saves map their errands
  onto chapters (`migrate()`). After chapter 10 the older errands run, one new one a day.
- **Chapters 1-10** replace Mamá's intro, the Round A errands (greetings, market, ball, letter) and the lost-Canelo
  and tired-Tomás errands. Day 1: Mamá's *hola*, then a puppy bursts in within the first minute, hides under the table,
  barks *guau* and comes on *¡ven!*: Canelo is yours; then Nico's cat outside. Every new word arrives in a one-unknown
  puzzle and is used again within minutes.
- **Pacing**: at most 5 new words inside 5 minutes of play (the next chapter waits a few minutes); Canelo shows a
  "?" for a word met a minute ago and not used since: tap him to answer it.
- **Engine**: unmet things and animals show only a "?" (no meeting by tapping); arrival banners ask the place's name;
  picture-only cards; time-of-day greetings (*buenos días / buenas noches / hola*) from chapter 3; side jobs and shops
  wait for the chapter that teaches their words and never offer an unmet word; the evening chapter brings the sunset
  forward; the numbers page of the notebook has four columns.
- **Tests**: `tools/test-chapters.js` (new: day 1, chapters 1-10 over several days by taps and some speaking, the
  gate, a reload mid-chapter, older saves, keys); the playthrough and the audit play over several days
  (`tools/playflow.js` walks by path and moves to the next day when nothing is left); every other test follows the
  chapter flow.

## 2026-10-09 — Learning redesign, step 1: the engine
Built the content-agnostic engine of `docs/LEARNING_DESIGN.md`; the curriculum and errands come next, on top of it.
- **Word model** (`src/words.js`): stages 0-4 (unmet, met, known, remembered, solid) with a Leitner box behind each word.
  Just-met words come back after 1.5 and 6 minutes of play, then the next day, +2, +4, +8 days; a miss drops a box and
  comes back in 1.5 minutes; massed repeats don't move the box. Sessions (a load, a new game, a new morning) and days (a
  new date or a new morning) are counted in the save (`G.state.wm`), with a play clock day.js ticks. One star per word
  per day. Old saves migrate (learned -> known, or remembered when answered twice or said; seen -> met; all due now).
  `G.st.seen / knows / learn / practiced` are thin wrappers (seen = met, knows = gold).
- **Rendering**: an unmet `[id]` is only its picture (Tunic-style) and nothing meets a word by showing it (lines, cards,
  the bag, banners). Met: picture + blue word; known: blue word; remembered: gold.
- **Questions adapt** (`G.ask`, learn.js): the cards follow the answer's stage (picture + word, word only under its
  picture, picture only with the word heard: a speaker in the prompt). A right answer that could be found by matching
  the prompt is *cued* and never moves a word on. `learn:` only meets co-listed words. Distractors come from met words.
  The big card is now *¡Palabra de oro!*, for reaching stage 3; meeting a word gets a small celebration (it flies into
  the notebook).
- **Introductions** (`src/intro.js`): `G.intro.show / watch / listen / find` (one-unknown puzzles, find-it on the map),
  `G.review.due / next / ask`, `G.budget.canIntro` (<= 5 per 5 min, 6 a session, 8 hard).
- **Notebook**: words are written in when met, a topic page appears with its first word, stages and stars show, tap to
  hear. The sparkles are **page puzzles** (match 4 met words' pictures to their words, a star, a review), waiting for 4
  met words and coming back on a later day when the words are due.
- **Tap-anything** meets an unmet word when the budget allows (else a picture and "?"); saying a word back is a cued use.
- **Audit** (`tools/vocab-audit.js`): plays several 15-minute sessions on successive dates (the playthrough, then free
  play), checks the design's measured targets (PASS / FAIL, `--strict`), `--quick` runs the game 3x faster.
- Tests: `tools/test-words.js` (new); existing tests updated where the expected behaviour changed (words met instead of
  learned, the gold card only for remembered words, page puzzles instead of found pages, the save's new keys).
- Old content still runs: Pepe's sí/no, the errands and Canelo work, but few words get proper introductions yet, so most
  targets fail until the curriculum step rewrites the content.

## 2026-10-09 — Learning redesign begins
- Researched how young children learn vocabulary (`docs/LEARNING_RESEARCH.md`).
- Built a word-flow audit (`tools/vocab-audit.js`, `src/vocablog.js`) and measured the game (`docs/VOCAB_AUDIT.md`):
  65 of 78 words arrived in the first 15 minutes (43 on notebook pages), 30 words were never actively used, and the
  median word was used once.
- Wrote the redesign (`docs/LEARNING_DESIGN.md`): a few new words at a time, each introduced as a one-unknown puzzle,
  a word-strength model with spaced review woven into the world, a notebook that fills as you learn, and measured
  targets the audit checks.
