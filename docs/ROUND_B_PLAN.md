# Round B plan: the animals of Villa Sol

Playtest (age 7, iPad, Safari 15.6, es-MX mic works well): *"Bored that there's not much stuff to do. I like the animals, especially the dog following. Errands a little too short. Not many options for using the microphone."*

Round B puts animals at the heart of Villa Sol. Canelo becomes your dog and learns tricks by voice. Every animal and many things in town can be tapped: they say their Spanish word, and you can say it back for a speaking star. Eight longer story errands (5-10 min each) mix walking, finding, tapping and speaking. Townsfolk become friends (hearts), and an album fills up as you meet animals.

**Status.** All built: the foundation (the words, pictures, map, animals, tap-anything, say-it-back, album records), stage 2a (Canelo as your dog with his tricks and care, hearts with voice greetings, the album screen with the Amigos page) and stage 2b (the eight story errands, the bag, presents, the shops and the side jobs, the animal party as the game's ending: `src/errands.js`, §7). The APIs are listed at the end.

Language rules: [CONTENT.md](CONTENT.md). Mexican Spanish, present tense, a few words per line, `{o/a}` for the player.

---

## 1. Words (78 = 30 from Round A + 48 new)

Every word has a 16x16 picture (`src/icons.js`) and sits on a notebook page (`src/data.js`). The pages are hidden around town (*where* below). `alt` lists other forms the mic accepts (*patito* for *el pato*).

| Page (topic) | Words | Who teaches it / where the page is |
| --- | --- | --- |
| Saludos *(Round A)* | hola, buenos días, adiós, ¿cómo estás?, bien, gracias, por favor, sí, no | Mamá, Luna, the greetings errand |
| Los números *(A)* | uno … cinco | the fountain (page); Don Pepe |
| La comida *(A)* | la manzana, el plátano, la naranja, las uvas, el pan | Rosa's shelf (page); Don Pepe |
| Los colores *(A)* | rojo, azul, verde, amarillo, la pelota | park flower (page); Sofía |
| El pueblo *(A)* | la casa, la escuela, el parque, la panadería, la biblioteca, la carta | library shelf (page); Tomás |
| **Los animales** | el perro, el gato, el pájaro, la mariposa, el pez, el conejo | page: park flower (13,19). Tap the animals; Luna's animal count |
| **La granja** | el pato, la rana, la gallina, el caballo, la cabra | page: flower by the pond (43,19). Tap the animals; Rosa (hens) |
| **¿Qué dicen?** (sounds) | guau, miau, pío, cuac, croac, bee | page: the barn door (41,4). Every animal says its sound; Nico's sound game |
| **Mi perro** (Canelo) | el hueso, la cama, siéntate, ven, salta, dame la pata, gira | page: Mamá hands it over with Canelo. Mamá, Sofía, Nico (tricks) |
| **En el pueblo** (things) | el árbol, la flor, la fuente, el banco, la puerta, la ventana, la granja | page: the plaza bench (13,9). Tap anything |
| **Más números** | seis, siete, ocho, nueve, diez | page: the hay bale by the barn (44,4). Luna's animal count |
| **El día de campo** (picnic) | la leche, el queso, el huevo, el agua, la galleta | page: the bakery shelf. Rosa's picnic |
| **Más colores** | blanco, negro, café, rosa | page: a flower east of the farm road (44,8). Lucía's flowers |
| **Así me siento** | feliz, triste, cansado / cansada | page: the school shelf. Tomás, Lucía, the hearts |

Sounds in the world (not all are vocabulary): perro *¡Guau, guau!*, gato *¡Miau!*, pájaro *¡Pío, pío!*, pato *¡Cuac, cuac!*, rana *¡Croac!*, cabra *¡Beee!*, gallina *¡Coc, coc!*, caballo *¡Iiijii!*, pez *¡Glu, glu!*. Rabbits and butterflies are quiet.

Mic notes: *ven* and *bien* sound alike (0.75), so never put them in the same question. Keep choices in one question sounding different (CONTENT.md).

## 2. The map

Villa Sol is now 48x28. The Round A town (x 0-35) keeps every door, tag and spot. New tags are in `G.MAPDATA.villa.pos` (from `tools/mapgen.py`):

| Tag | Where | What lives there |
| --- | --- | --- |
| `gallinero` [1,7,4,4] | beside Abuela Rosa's house, with a hay bale | 2 hens (brown, white) |
| `fuentePez` [18,11] | the plaza fountain (now a real fountain, animated) | the goldfish; it jumps out |
| `rana` [19,21,4,2] | the park pond (a bit bigger), lily pads | the frog |
| `conejo` [12,18,12,7] | the park lawn | the rabbit |
| `banco1` [13,9], `banco2` [22,12], `banco3` [20,18] | plaza and park benches (tile `J`) | |
| `gateFarm` [35,10], `gatePond` [35,21] | gates in the farm fence (the town's east edge) | |
| `granja` [38,2,6,3], `granjaDoor` [41,4] | the red barn (door closed, a picture sign), hay bales (tile `O`) | |
| `corral` [38,13,8,5], `paddockGate` [41,12] | the fenced paddock | the horse and the goat |
| `estanque` [37,20,6,5] | the duck pond | a duck and two ducklings |
| wheat field | x 44-46, y 20-25 | (birds, butterflies) |
| `escuelaArea`, `rosaArea`, `casaArea`, `panaderiaArea`, `bibliotecaArea` | building rectangles | a tap on a roof says the building |

Birds (8), butterflies (5) and the cat (on the park fence; she naps when nobody is near) are in `ambient.js` as before.

## 3. Tap anything, say it back (built)

- **Tap an animal** → it reacts (hop, flap, the horse rears, the fish jumps, the frog hops pads) with its own little sound; a word bubble shows its picture, *el gato* and *¡Miau!*, and the voice says both. The word and its sound word are marked seen. The album records it. You walk toward it.
- **Tap a thing** (tree, flower, fountain, bench, window, door, water, a building's roof, a bed indoors) → walk up to it; it wiggles, sparkles and says its word. Already beside it: right away. Flowers: walk onto them (the same word once every 20 s this way).
- **People, doors, page sparkles and search spots win**, exactly as in Round A.
- **Say it back**: with *Speaking (mic)* on, a pink mic sits beside the word for ~5 s. Tap it (or V, or hold Space) and say the word → a speaking star (*¡Bien dicho!*), the word is learned if it wasn't (a *¡Palabra nueva!* card, without its own mic). **One say-it-back star per word per calendar day** (`G.state.sayback`), so it can't be farmed. A miss: *¡Otra vez!*, a little more time, no penalty.

## 4. Canelo, your dog (built: `src/pet.js`)

Canelo already follows you once you've met him. Now he's *your* dog.

**Start.** Once the Saludos errand is done, Mamá has a "!" (an older save after the party gets it too): *"¡{name}! ¡Mira!"* Canelo bursts in and dances; *"¡Canelo es tu perro!"*; *"¡Para ti!"* and she hands over the *Mi perro* page (no longer on the shelf); then she teaches *siéntate*. (Sooner than "day 2" in the first plan: the playtester was bored, and the dog is what they love.) Canelo lives at home too: a red cushion (*la cama*, tap it) in the corner and a water bowl; he follows you in and out.

**Tricks** (learned in this order, one at a time; the teacher's thought bubble shows the trick's picture when it's their turn):
| Trick | Taught by | Canelo does |
| --- | --- | --- |
| ¡Siéntate! | Mamá | sits (squashes down), wags, a heart |
| ¡Ven! | Mamá | dashes off up to 3 tiles (walls stop him), a "!", then runs back to you with dust puffs and jumps up |
| ¡Dame la pata! | Sofía (when her ball errand doesn't need her) | turns to you and lifts a front paw, a little high-five shake, sparkles |
| ¡Salta! | Sofía | crouches, jumps ~20 px, lands with a dust puff |
| ¡Gira! | Nico | spins through the four directions twice, sparkles |

A teaching scene: the teacher says it (*"¡Mira! Canelo... ¡siéntate!"*), Canelo does it for them, *"¡Ahora tú!"*, your first try (a "¡Dile a Canelo!" question), *"¡Otra vez! Toca a Canelo."* While a trick is being learned a thought bubble over Canelo shows its picture and three paw dots.

**The pet menu.** Tap Canelo (or A facing him): he comes to your side (the view lifts so you both stay above the menu) and big picture cards slide up. Top row, his tricks: known ones with their word in gold and a star; the one he's learning in pink with its paw prints (1-2-3); the next one faded with its teacher's little face; the rest "?". Bottom row, care: *el hueso*, *la galleta*, *el agua*, *la pelota*, a pat (his face with hearts), *la cama* (away from home it shows a little house). His name and hearts sit top-left; the close button top-right (a tap on the map above also closes it).
- **The mic sits beside the tricks.** Say a command and he does it; say a care word and he gets it (*"¡la pelota!"* throws the ball). A speaking star once per word per day (the say-it-back book, `G.state.sayback`); a care word said out loud is learned (a *¡Palabra nueva!*, no second mic). Tapping a card says the word and does it too.
- **Learning takes 3 good tries.** Tapping the learning card asks *"¡Dile a Canelo!"* (a `G.ask` with `{word}` picture cards, so the mic comes for free); saying the command straight at the menu counts as a try too. Try 1: he tilts his head with a "?" and half does it; try 2: nearly ("2/3"); try 3: the real thing, confetti, a fanfare, a heart (not capped) and the *¡Palabra nueva!* card for the command.
- The menu closes while he does something (you see him clearly), then comes back, until you close it.

**Care:** food in his red bowl (crunch crunch, crumbs; *el hueso* is his favourite: the gift heart), water (lap lap, drops), the ball (it arcs away and bounces, he runs, brings it back in his mouth and drops it at your feet), a pat (your hand pats his head, hearts float up), *la cama* (at home he goes to his cushion and sleeps, *z z z*; tap him to wake him). He also sleeps there after sunset and through the night, and hops up in the morning. A best-friend Canelo (5 hearts) does a little happy dance when you open the menu.

## 5. Hearts (friendship) (built: `src/hearts.js`)

Each townsperson (Mamá, Luna, Rosa, Pepe, Sofía, Tomás, Marta, Inés, Gómez, Lucía, Nico, and Canelo) has 0-5 hearts, saved in `G.state.hearts[npc]`.

**What raises them** (at most +2 a day per person from greetings, gifts and care, so it's spread over days):
- **Greeting by voice**: after the Saludos errand, the first talk of the day with someone starts with their greeting as a picture-card question with the mic: *"Don Pepe: ¡Hola, Luz!"* (*hola*), *"¡Buenos días, Luz!"* early in a session (*buenos días*), or *"¡Hola! ¿Cómo estás?"* (*bien*). Answered (voice or tap): +1, once a day per person.
- **Finishing their errand**: +2 to the errand's giver (`D.quests[id].giver`), not counted in the cap (Round A's errands do it too).
- **A gift they like**: +1, once a day. Rosa: *la flor*; Pepe: *el queso*; Sofía: *la galleta*; Tomás: *el agua*; Marta: *la leche*; Inés: *el pan*; Gómez: *la manzana*; Lucía: *la flor* (a pink one); Nico: *la pelota*; Luna: *la manzana*; Mamá: *la flor*; Canelo: *el hueso* (the pet menu's bone). The errands give the things.
- **Canelo**: each care action or trick shown +1 (within the cap), each trick learned +1 (not capped).

**What unlocks:**
| Hearts | Unlock |
| --- | --- |
| 1 | They call you by name as you pass within 2 tiles (a "¡Hola, Luz!" bubble and a hop, at most once a minute); errands can require it (`G.hearts.get`) |
| 3 | A **secret**: where a notebook page you haven't found is (*"¡Un secreto! Una página... ¡el parque!"*, the place as a picture word; errands can replace it per person) and a **sticker** of their face (a round gold-edged card) for the album |
| 5 | **Best friends**: a photo of the two of you for the album, and their greeting changes to *"¡Mi amig{o/a} {name}!"*. They join the animal party (errand 8: `G.hearts.best(npc)`) |

Hearts show as a row over a person on the map for a moment when they rise (the new heart pops, a chime, sparkles), and as a row of five over the portrait whenever they talk. The Hoy card shows the hearts earned today (top-left). The album's Amigos page lists everyone.

## 6. The album (built: `src/album.js`)

A third big button in the menu, *Animales* (a paw) with *7/11* under it, next to Cuaderno and Misiones. One card per animal, 11 in `G.animals.list()` order: perro, gato, pájaro, mariposa, pez, conejo, pato, rana, gallina, caballo, cabra.

- Title: a paw, *Mis animales*, *7/11* and a bar that fills a notch per animal.
- Not met: a dark silhouette and *? ? ?*; a tap only wobbles it.
- Met (`G.state.album[id]` exists): its picture (2x), *el gato*, its sound *¡Miau!*; tap: it hops and you hear both (and its cry).
- Said its name (`said: true`): a little mic mark, like the Cuaderno.
- Counted in Luna's animal count (`G.album.count(id)` sets `counted`): a gold star.
- All 11 met: the first time, a fanfare, confetti and *"¡Amig{o/a} de los animales!"* spoken; from then on that title sits on a red ribbon (`flags.albumFull`).
- The twelfth card, *Amigos* (a big heart and the total of everyone's hearts): a page of everyone's face, name and five hearts, a gold sticker mark at 3, a gold frame at 5. Back (or B) returns to the animals.
- Taps and keys: arrows move, A or C says the card, B closes.

## 7. The eight story errands (built: `src/errands.js`)

Each is a little story of 5-10 minutes for a 7-year-old: walking across town, finding things (a picture bubble floats over every place to go, and the hint hand points there), tapping animals, and lots of **speaking**: every question is a `G.ask` with `{word}` picture cards, so the mic is always there (tapping always works too). Each has its quest card, a badge (`BADGE_COL` / `BADGE_ICON` in learn.js), a Misiones row with its steps ticked off (`G.errands.parts(id)`), and gives its giver +2 hearts.

**How they unlock** (`UNLOCK` in errands.js), so there are usually 2-3 to choose from:
| Errand | Opens when |
| --- | --- |
| `canelo` ¿Dónde está Canelo? | Canelo is yours and one Round A errand (mercado, pelota, carta) is done |
| `picnic` / `show` / `cansado` | `canelo` is done, and the same person's Round A errand (Rosa's mercado / Sofía's pelota / Tomás's carta) |
| `cuenta` | 3 Round B errands done |
| `sonidos`, `flores` | 4 done |
| `fiestab` (the party, the ending) | all of Round A and 6 of the 7 |

An errand that's open shows its picture over the giver (Mamá "!", Rosa a basket, Sofía a ribbon, Tomás *cansado*, Luna "?", Nico a music note, Lucía *triste*, Luna a star). A new errand comes before a trick to teach; an errand's step for someone comes before their Round A lines (`G.errands.urgent`).

### 1. ¿Dónde está Canelo? (Mamá; Gómez, Lucía, Tomás) — paw-print badge
Mamá calls you home; Canelo barks and **runs out of the door**. *¿Qué buscas?* (say *el perro*). Quest card: dog + "?". One clue at a time, a dog bubble over the next neighbour: you ask *"¡Hola! ¿Y mi...?"* (say *el perro*). Gómez: *el parque, el banco* → a paw-print bubble over the park bench: *¿Dónde está?* (*el banco*). Lucía: *¡la fuente!* → his ball in the fountain (*la pelota*, into the bag). Tomás: *¡la granja!* → the barn door barks (*¡Guau!* bubbles); **say *¡ven!*** and Canelo bursts out, dancing, with **the goat** (who trots back to her paddock): *¿Y ella?* (*la cabra*). Home: Mamá: *¿Cómo está Canelo?* (*feliz*), his ball back (he fetches it). Mic: perro ×4, banco, pelota, ven, cabra, feliz.

### 2. El día de campo (Rosa) — basket badge
*¿Me ayudas?* (*sí*). Five foods, any order, each into the bag: Marta (*¿Qué quieres?* *el pan*, *gracias*), Don Pepe (*el queso*, *¿Cuántos?* *uno*), the hay bale by the hens (*¡Coc, coc!* *el huevo*), the goat's pail by the paddock gate (*la leche*), the fountain (*el agua*). Back to Rosa: a fade to a red checked blanket in the park; she holds out her hand for each food by picture (say it), and they appear on the blanket; a cookie for Canelo. Mic: about 13.

### 3. El show de perros (Sofía, Nico, Luna) — ribbon badge
*¿Y Canelo? ¿Sí?* Quest card: *siéntate, dame la pata, salta*. Gated on the tricks: until Canelo knows all three, Sofía (and Mamá for *ven*, which comes before them) teach them as usual and remind you (*¡Toca a Canelo y practica!*; the hint hand points at Canelo while he's learning). Then Nico brings his cat (*¡Miau! ¿Quién es?* *el gato*), and the show: a fade to the park with an audience (Luna judging, Nico, Rosa, Gómez, Lucía, Don Pepe; no thought bubbles in the crowd). For each trick Luna calls it, you **say it to Canelo** (`G.pet.command`), applause, confetti, and a ribbon: *¿De qué color?* (azul, rojo, amarillo). *¡Canelo es el campeón!*

### 4. Tomás está cansado (Tomás) — winged-envelope badge
While it's open or on, Tomás sits by the plaza bench (off his mail round). *¿Cómo está Tomás?* (*cansado*), *¿Me ayudas?*: three letters in the bag. Rosa (*¿Dónde estás?* *la casa*), Inés in the library (*la biblioteca*), the barn door (*la granja*): **the horse trots up and eats the letter!** An apple bubble over the paddock; Don Pepe shows an apple (*la manzana*); give it to the horse (*¿Qué quiere?* *la manzana*), he gives the letter back. Tomás: *¿Cómo está?* (*feliz*), back on his round.

### 5. ¿Cuántos animales? (Profesora Luna) — "10" badge
*¿Cuántos animales hay en Villa Sol?* A clipboard under the bag (each animal's picture and dots) while you **tap the animals**: each tap shows and says the next number (*¡uno!*, *¡dos!*...) instead of the name; ducks 3, hens 2, horse, goat, rabbit, frog, and the fish (a fish bubble over the fountain: it jumps). A full row gives the album's gold star (`G.album.count`). Back to Luna: *¿Cuántos patos? / ¿Cuántas gallinas?...* (numbers, by voice), she counts to nine, *¿Cuántos animales?* — **diez**.

### 6. ¿Qué dicen? (Nico) — music-note badge
*¡Un juego! ¡Escucha!* — a cry (*¡Cuac, cuac!*). Nico **tags along** and makes the sound again now and then (a speech bubble); the hint hand points at the right animal. Tap the duck: *¿Qué dice el pato?* (*cuac*); the frog (*croac*), the goat (*bee*), the cat on the park fence (*miau*; asleep or not). A wrong animal: *¡No! ¡Escucha!* Last: Nico barks *¡Guau, guau!*, Canelo answers with a dance: *¿Quién dice guau?* (*el perro*).

### 7. Las flores de Lucía (Lucía) — flower badge
A *triste* bubble. *¿Cómo está Lucía?* (*triste*): her mom's birthday; she wants *una flor rosa, blanca y amarilla* (her bubble shows the ones still missing). Nine big coloured flowers grow around town (pink ×2, white ×2, yellow ×2, red ×2, blue). Each: *¿De qué color?* (say it), then *¿Para Lucía?* (sí / no). A butterfly sits on the last one she needs: *¿Qué es?* (*la mariposa*), and it flutters away. Back: *¡Qué bonitas!*, *¿Cómo está?* (*feliz*). Afterwards the flowers can be picked once a day as presents. **Lucía's 3-heart secret** (replacing the page one): a golden flower in the wheat field (3 stars, and a present).

### 8. La fiesta de los animales (Luna) — the ending, star badge
*¡Una fiesta en la granja! ¡Para los animales!* Invite five friends (any five of Rosa, Pepe, Sofía, Nico, Lucía, Gómez, Tomás: an invitation bubble over each): you say **¡hola!**, they ask *¿Para mí?*, you say *sí*. Then four ribbons on the barn (*¿De qué color?* ×4; bunting appears on the roof), food in the bag, and feeding: bread for the ducks, water for the horse, corn for the hens (*¿Quiénes son?* *las gallinas*). Everyone gathers in front of the barn (the invited, every best friend at 5 hearts, Luna, Mamá). Tap the star over the door: Canelo shows every trick he knows as you say them, a cookie, the animals' song (every cry in turn), confetti, *¿Estás feliz?*, a flash and a **group photo** (you, Canelo and your best friends), the badge, and the **diploma**.

Round A's old ending (Luna's party with a review game) is folded into this one: after the Round A errands Luna offers the replayable *¿Repaso?* instead, and a save that already had that party keeps its badge.

**The diploma** (`G.story.diploma`): your portrait and name, *¡Amig{o/a} de los animales!*, words learned, stars, speaking stars, animals met (n/11), a badge (or an empty ring) for every errand, and your best friends' faces.

### The bag, presents and the shops
`G.state.bag.items` (drawn top-left on the map, and in Misiones): errand things carry `q` and can't be given away; your own things can. **Shops**: Marta (*el pan*, *la galleta*) and Don Pepe (*la manzana*, *el queso*) ask *¿Qué quieres?* when there's nothing else to say: a free choice with the mic (say any of them, or *no*), one of each at a time. **Presents**: someone who likes something you carry (`G.hearts.LIKES`; Lucía only pink flowers) shows it in their bubble; talking to them: *¿Un regalo? ¿Para mí?* — *sí* gives it (+1 heart, once a day).

### Small side jobs (once a day each: a star; Misiones shows today's)
- **Feed the ducks**: with bread from Marta a bread bubble floats over the pond; the ducks swim over, *¿Cuántos patos?* (*tres*).
- **The hens' egg** (after the picnic): the hay bale by the hens (*el huevo*), then give it to Rosa (+1 heart).
- **Canelo's water**: his bowl at home is empty every day (an *agua* bubble on it); fill a bottle at the fountain (*el agua*), pour it: he drinks (+1 heart).
- **Pet the horse**: tap him from close by: hearts, a star.
- **The sleepy cat**: she naps when nobody's near, and now stays asleep until you're right beside her; tap her: *¡Shh!* *¿Quién duerme?* (*el gato*) and she wakes, purring.

## 8. APIs

- **Animals** (`src/animals.js`): `G.animals.KINDS[id]` `{word, sound, cry, order}`; `list()`; `met(id)`; `meet(id)`; `tap(kind, wx, wy, o)` (name + album, for any animal, including critters in `ambient.js` and Canelo); `here()` (live animals on this map), `find(kind)`, `jump(fish)`, `cry(kind)`, `screen(a)`, `hit(field, tap)`. Map config: `animals: [{ kind, n, area | at }]`.
- **Album record**: `G.state.album[id] = { first: ms, map: 'villa', n: times tapped, said: bool }`.
- **Tap anything / say it back** (`src/world.js`): `G.world.TILES`, map `things: { tiles, areas, at }`, `wordAt(f, x, y)`, `name(id, wx, wy, o)`, `nameTile(f, x, y)`, `offerSayBack(id, bubble)`, `canSayBack(id)`, `bubble`, `sayBack`, `today()`. `G.state.sayback[word] = 'YYYY-M-D'`.
- `G.learnWords(ids, { noMic: true })`, `G.mic.target` includes a word's `alt`, `G.iconDrawn(id)`, `D.numberWords10`.
- **Canelo** (`src/pet.js`): `G.pet.TRICKS` `[{id, by, anim}]`; `mine()` (he's yours: `flags.petStart`); `knows(id)` (3 good tries: use this to check a trick is learned); `tries(id)`; `learning()`; `known()`; `canTeach(who)`; generators `teach(id, who)`, `practice(id)`, `ask(id, o)` (a "¡Dile a Canelo!" question: `o.prompt`, `o.pool`), `command(id, o)` (ask, then he does it: for the pet show), `trick(id, {amp})`, `play(kind, o)` (sit come paw jump spin huh eat drink fetch pet dance wake; `{item: 'hueso'}` for eat), `menu()`, `start()`; `npc(f)`, `sleeping(f)`, `spokeStar(id)`. Saved: `G.state.pet = {tricks: {id: 0..3}, learning, sleep}`.
- **Hearts** (`src/hearts.js`): `G.hearts.WHO`, `LIKES`, `get(npc)`, `add(npc, n, why)` (why: `greet` and `gift` once a day; `care`; `errand` and `trick` skip the daily cap; returns the hearts added), `canAddToday(npc, why)`, `did(npc, why)`, `today(npc?)`, `gift(npc, word)`, `best(npc)`, `greeting(npc)`, generators `greet(npc)` and `milestones(npc)` (call after adding hearts outside a normal talk), `secrets[npc] = function* () {...}` to replace a 3-heart secret, `sticker(npc)`, `photo(npc)`, `row(ctx, npc, x, y, scale)`, `face(ctx, npc, x, y, w)`. Saved: `G.state.hearts`, `G.state.heartlog` (today), `G.state.friends` (`m3`, `m5`). In maps.js, `hello(who)` (greeting + milestones) starts every townsperson's talk; `finishQuest(id)` gives the giver +2.
- **Album** (`src/album.js`): `G.album(start?)` (opens it; `'amigos'` for the friends page), `G.album.count(id)` (the gold star for Luna's count), `counted(id)`, `metCount()`, `full()`.
- **Errands** (`src/errands.js`): `G.errands.talk(who, f)` / `alert(who)` / `urgent(who)` (maps.js), `SPOTS` (places: `{id, map, at, icon(), run, quiet, nohint()}`) with `spotAt`, `runSpot`, `targets(f)` (hint.js), `waitsIn(map)`, `bag` (`list, has(id, {col, q, to}), add, take, icon`), `jobDone(id)`, `unlocked(id)`, `offer(id)`, `fl(id)` (an errand's saved flags, `G.state.flags['e_' + id]`), `parts(id)` (Misiones), `lost()`, `bowlEmpty()`, `tomasTired()`, `nicoFollows()`, `catTap(f)`, `guests()`, `photoCard(ids)`. It wraps `G.animals.tapped` (counting, the sound game, petting the horse) and `G.world.nameTile`. `G.animals.react(f, a)`, `G.ambient.wake(f)`, `G.drawAlert(ctx, al, x, y, t)` (a thought bubble), `G.choose({mic: true})` (a free choice with the mic). Saved: `G.state.bag`, `G.state.jobs`, `flags.e_<errand>`, `flags.e_picked`, `flags.e_gold`.
- **Hooks** for scenes: `G.say(pages, {portrait, name, who})` shows `who`'s hearts over the portrait; a map NPC can draw itself with `n.drawSelf(ctx, cx, cy)` (true = drawn); `field.camShift` lifts the view (px).

