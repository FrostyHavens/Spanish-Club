# Round B plan: the animals of Villa Sol

Playtest (age 7, iPad, Safari 15.6, es-MX mic works well): *"Bored that there's not much stuff to do. I like the animals, especially the dog following. Errands a little too short. Not many options for using the microphone."*

Round B puts animals at the heart of Villa Sol. Canelo becomes your dog and learns tricks by voice. Every animal and many things in town can be tapped: they say their Spanish word, and you can say it back for a speaking star. Eight longer story errands (5-10 min each) mix walking, finding, tapping and speaking. Townsfolk become friends (hearts), and an album fills up as you meet animals.

**Status.** The foundation is built (the words, pictures, map, animals, tap-anything, say-it-back, album records). Canelo's tricks, hearts, the album screen and the errands are next. The APIs are listed at the end.

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
| **Mi perro** (Canelo) | el hueso, la cama, siéntate, ven, salta, dame la pata, gira | page: your shelf at home. Mamá and Sofía (tricks) |
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

## 4. Canelo, your dog (next: tricks agent)

Canelo already follows you once you've met him. Round B makes him *your* dog.

**Start.** After Mamá's morning lesson (day 2, or after Round A's party for older saves): *"¡{name}! Canelo es tu perro."* Mamá gives the *Mi perro* page. Canelo has a bed (*la cama*) and a bowl at home.

**Tricks** (learned in this order; each one is a little scene):
| Trick | Taught by | Canelo does |
| --- | --- | --- |
| ¡Siéntate! | Mamá | sits (sit frame), wags |
| ¡Ven! | Mamá, outside | runs to you from 4 tiles away |
| ¡Dame la pata! | Sofía | lifts a paw; a heart |
| ¡Salta! | Sofía | jumps (a hop of ~10 px), a dust puff |
| ¡Gira! | Nico | spins (turns through the 4 directions) |

How it works: tap Canelo → a small trick menu of picture cards (only the tricks he knows, plus the one he's learning). Saying the command (the mic) or tapping its card makes him do it. Each trick needs **3 good tries** to be "learned" (a *¡Palabra nueva!* for the command, a heart from Canelo). Saying it earns speaking stars (normal G.ask once-per-question rules). Use `G.ask` with `{ word: 'sientate' }` choices so the mic and its matching come for free.

**Care** (any time, from the same menu): *el hueso* / *la galleta* (feed: crunch, heart), *el agua* (the bowl at home or the fountain: lap lap), *la pelota* (throw: he fetches it back), pet him (tap and hold: hearts), *la cama* (at home, at night: he sleeps with *z z z*). Canelo's own happiness = hearts (0-5, see §5); a happy Canelo does a little dance.

## 5. Hearts (friendship) (next: hearts agent)

Each townsperson (Mamá, Luna, Rosa, Pepe, Sofía, Tomás, Marta, Inés, Gómez, Lucía, Nico, and Canelo) has 0-5 hearts, saved in `G.state.hearts[npc]`.

**What raises them** (at most +2 a day per person, so it's spread over days):
- **Greeting by voice**: when you come near, they say *¡Hola, {name}!* and a mic bubble (the say-it-back helper) asks you to answer *hola* / *buenos días* / *bien*. Answered: +1 (once a day per person).
- **Finishing their errand**: +2.
- **A gift they like** (from the picnic foods, flowers, cookies): +1. Each person likes one thing (Rosa: *la flor*; Pepe: *el queso*; Sofía: *la galleta*; Tomás: *el agua*; Marta: *la leche*; Inés: *el pan*; Gómez: *la manzana*; Lucía: *la flor rosa*; Nico: *la pelota*; Luna: *la manzana*; Canelo: *el hueso*).

**What unlocks:**
| Hearts | Unlock |
| --- | --- |
| 1 | They call you by name and wave when you pass; their errand opens (some errands need 1 heart) |
| 3 | A **secret**: they tell you where a hidden thing is (a page, an egg, a golden flower) with a picture bubble; and they give a **gift** for the album (a sticker of their face) |
| 5 | **Best friends**: a photo in the album, they join the animal party (errand 8), and their greeting changes (*¡Mi amig{o/a} {name}!*) |

The Hoy card can show hearts earned today.

## 6. The album (next: hearts/album agent)

A new tab in the menu (a paw icon next to Cuaderno). One card per animal, 11 in `G.animals.list()` order: perro, gato, pájaro, mariposa, pez, conejo, pato, rana, gallina, caballo, cabra.

- Not met: a dark silhouette and *? ? ?*.
- Met (`G.state.album[id]` exists): the animal's picture (its 16x16 icon at 3x, or the live map sprite), *el gato*, its sound *¡Miau!* (tap: hear both), how many times you said hi (`n`).
- Said its name (`said: true`): a little mic mark, like the Cuaderno.
- Counted in Luna's animal count: a gold star.
- All 11 met: a page of confetti and a badge (*¡Amig{o/a} de los animales!*).

## 7. The eight story errands (next: errands agents)

Each takes 5-10 minutes, has 4-6 steps, sends you to at least 3 places, and uses the mic at least 3 times (always optional: tapping works too). Add them to `D.quests` / `D.questOrder`, with a badge each. Order of unlocking: 1 → 2 → 3, then any.

### 1. ¿Dónde está Canelo? (Canelo is missing) — Mamá, then Gómez, Lucía, Tomás
1. Morning at home: Mamá — *¡Ay! ¿Y Canelo?* Canelo's bed is empty (picture card: *la cama*, *el perro*). Quest card: *el perro ?*
2. In town, three neighbors each give a picture clue (a thought bubble). Ask by voice: the mic bubble on each person says *¿El perro?* — say *el perro* (or tap). Gómez: *¡Guau! ... el parque*. Lucía: *Una pelota... la fuente*. Tomás: *¡Uy! La granja*.
3. Follow the clues: in the park, a paw print by the bench (*el banco*: tap it); at the fountain, Canelo's ball (*la pelota*); at the farm, barking from the barn.
4. At the barn door: say **¡Canelo, ven!** (or tap *ven*). He bursts out of the hay with **the goat**, his new friend. *¡Guau!* *¡Beee!*
5. Walk him home (he follows). Mamá: *¡Canelo! ¡Qué feliz!* → *feliz* is asked (feliz / triste). Badge: a paw print.
Words: perro, ven, cama, banco, fuente, pelota, granja, feliz, triste. Mic: 3 neighbors, *ven*, *feliz*.

### 2. El día de campo de Abuela Rosa (the picnic) — Rosa
1. Rosa: *¡Un día de campo! ¿Me ayudas?* Quest card: five foods (*el pan, el queso, el huevo, la leche, el agua*).
2. Bakery: Marta asks *¿Qué quieres?* (cards; say *el pan*).
3. Market: Don Pepe has *el queso* (say it; he asks *¿Cuántos?* → *uno*).
4. Rosa's hens: search the hay bale → *¡Un huevo!* The hen clucks. Say *el huevo*.
5. The farm: the goat's bucket by the barn → *la leche* (the goat says *¡Beee!*).
6. The fountain: fill the bottle → *el agua*.
7. Back to Rosa: she lays a blanket in the park; she asks for each food by picture (*¿El queso?* sí/no, then say it). The ducks come over for crumbs. Badge: a basket.
Words: the *campo* page, plus gracias, por favor. Mic: every food once.

### 3. El show de mascotas de Sofía (the pet show) — Sofía, Nico, Luna
1. Sofía: *¡Un show de perros! Canelo, ¿sí?* Quest card: *siéntate, salta, dame la pata*.
2. Teach Canelo the three tricks (§4) anywhere in town (3 good tries each).
3. Nico has a cat in the show (*¡Mi gato!*); you can tap and name it.
4. Show time at the park (an audience of townsfolk on the benches): Luna calls each trick in Spanish; you say it to Canelo. Each trick done: applause, a ribbon colour (*azul, rojo, amarillo*).
5. Luna: *¡Canelo es el campeón!* Ribbon colour question. Badge: a ribbon.
Words: sientate, salta, pata, perro, gato, colours. Mic: every trick (Canelo only does it when said or tapped).

### 4. ¿Cuántos animales? (the animal count) — Profesora Luna
1. Luna: *¿Cuántos animales hay en Villa Sol?* She gives a clipboard with pictures: patos, gallinas, pájaros, peces, conejos, caballos, cabras.
2. Tap each animal to count it (a number pops: *uno, dos, tres*...). Ducks 3, hens 2, the fish 1, the rabbit 1, the horse 1, the goat 1, birds: count those on the plaza (they fly off, come back!).
3. Back to Luna: for each picture, *¿Cuántos patos?* — answer with numbers to *diez* (cards + mic). Total: *¡Diez animales!* (or the real total).
Words: animals, numbers 1-10 (introduces *seis ... diez*). Mic: every answer. Album: counted animals get a gold star.

### 5. ¿Qué dicen? (Nico's sound game) — Nico
1. Nico: *¡Un juego! Escucha...* He plays a sound (the procedural cry): *¡Cuac, cuac!*
2. Find the animal that says it and tap it (the duck at the farm pond). Back to Nico: *¿Qué dice el pato?* — say *cuac*.
3. Four rounds: cuac (pato), croac (rana), bee (cabra), miau (gato, napping on the fence: wake her up gently).
4. Nico's last round: he barks *¡Guau!* and Canelo answers. Badge: a music note.
Words: the *sonidos* page, the animals. Mic: say each sound.

### 6. Las flores de Lucía (Lucía's flowers) — Lucía
1. Lucía is **triste**: *Mi mamá... su cumpleaños.* She wants a bouquet: *una flor rosa, una flor blanca, una flor amarilla*.
2. Flowers of different colours grow around town (new flower spots of each colour; tap → *la flor ... rosa*). Pick the right ones (sí/no on colour).
3. A butterfly sits on the last one: wait, or say *mariposa* and it flies off.
4. Lucía: *¡Qué bonitas! Estoy feliz.* Feelings question (*feliz / triste*). Badge: a flower.
Words: flor, blanco, rosa, amarillo, negro / café (distractors), feliz, triste, mariposa.

### 7. Tomás está cansado (Tomás is tired) — Tomás
1. Tomás sits on a bench: *Estoy cansado...* (feelings card). He has 3 letters.
2. Deliver them: to Abuela Rosa (*la casa*), to the barn (*la granja*: the horse eats the letter's corner!), to Inés (*la biblioteca*). At each door, say where you are.
3. The horse letter: give the horse *una manzana* so it gives it back.
4. Back to Tomás: *¡Gracias! ¡Ya no estoy cansado!* He gives you *agua* to drink. Badge: an envelope with wings.
Words: cansado, casa, granja, biblioteca, caballo, manzana, puerta, ventana (Inés waves from the window).

### 8. La fiesta de los animales (the animal party) — everyone
Unlocks when 6 of the errands are done.
1. Luna: *¡Una fiesta en la granja!* Invite 5 friends by voice (*¡Hola! ¿Vienes a la fiesta?* → they answer *sí*).
2. Decorate: hang ribbons in 4 colours (tap colour cards / say them).
3. Feed the animals: *el pan* for the ducks, *la galleta* for Canelo, *el agua* for the horse, corn for the hens (tap).
4. The show: Canelo does all his tricks while you say them; every animal does its sound in a chorus.
5. Everyone at 5 hearts appears in a group photo for the album. Diploma: *¡Amig{o/a} de los animales!*

### Small side jobs (1-2 min, repeatable, any time)
- **Feed the ducks**: buy *pan* from Marta, tap the pond: the ducks swim over (a heart each).
- **Find an egg**: the hens hide one egg a day in the hay (search); give it to Rosa (+1 heart).
- **Canelo's water**: his bowl at home is empty after a long walk; fill it at the fountain (*el agua*).
- **Pet the horse**: hold a tap on him; he nuzzles. *Say caballo* for the star.
- **The sleepy cat**: when she naps, tiptoe up (walk slowly) and say *gato* to wake her.

## 8. APIs built in the foundation

- **Animals** (`src/animals.js`): `G.animals.KINDS[id]` `{word, sound, cry, order}`; `list()`; `met(id)`; `meet(id)`; `tap(kind, wx, wy, o)` (name + album, for any animal, including critters in `ambient.js` and Canelo); `here()` (live animals on this map), `find(kind)`, `jump(fish)`, `cry(kind)`, `screen(a)`, `hit(field, tap)`. Map config: `animals: [{ kind, n, area | at }]`.
- **Album record**: `G.state.album[id] = { first: ms, map: 'villa', n: times tapped, said: bool }`.
- **Tap anything / say it back** (`src/world.js`): `G.world.TILES`, map `things: { tiles, areas, at }`, `wordAt(f, x, y)`, `name(id, wx, wy, o)`, `nameTile(f, x, y)`, `offerSayBack(id, bubble)`, `canSayBack(id)`, `bubble`, `sayBack`, `today()`. `G.state.sayback[word] = 'YYYY-M-D'`.
- `G.learnWords(ids, { noMic: true })`, `G.mic.target` includes a word's `alt`, `G.iconDrawn(id)`, `D.numberWords10`.
