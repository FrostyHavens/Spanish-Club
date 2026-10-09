# Curriculum: the words, in order

This is the word order and the teaching plan for every errand that `LEARNING_DESIGN.md` asks for in its build step 2. It
follows the rules with numbers in `LEARNING_RESEARCH.md` and fixes what `VOCAB_AUDIT.md` measured: 65 words in the
first 15 minutes, 43 of them first met on notebook pages, 30 words never picked or said, and a median word used once.
It is a content plan: who says what, where, which cards each question shows, and in what order. The engine it relies
on (word stages, the review engine, the new-word budget, page puzzles) is described in `LEARNING_DESIGN.md`.

## At a glance
- **73 words** (was 78): seven dropped, two added (§7). Concrete and picturable, Mexican Spanish.
- **21 chapters on one path, about 17 sessions of 15 minutes** (all 21 are built: §7.5, §7.6). At most 5 new words per chapter and 6 per session; the
  last three chapters bring 0-2.
- **Day 1 is Canelo and the cat.** A puppy bursts through the door in the first minute. The first six words are
  *hola, el perro, guau, ven, el gato, miau*: two of them are things you say to animals and hear back (bark at Canelo,
  he barks back), one makes Canelo run to you.
- **Every new word is a puzzle with one unknown**: the new word and two words the child already knows, or (for places and
  things you walk to) the new word and other places in the world shown as unnamed pictures.
- **Every word is used soon:** its first active use comes 0.3-2.9 minutes after it is introduced (median 1.1).
- **Every word comes back:** the errands alone ask the child to pick or say each word at least 5 times (median 6)
  in at least 3 different chapters (median 5). Greetings, favores, Canelo, page puzzles and the *palabra del día*
  come on top of that.
- **Reviews dominate once there is something to review:** from Tomás's errand (session 6) on, 43-100% of the answers
  in each errand are older words (median about 70%). Before that the errands mostly practise their own new words, and
  the greetings, favores and Canelo carry the review.
- **No word is ever a wrong answer before it is taught, and no word is first met on a notebook page.**

**How it was checked.** The step lists in §4 are the source of truth. All 496 card questions in them were
checked mechanically: every card is a word already met (or the one new word), no question has more than one unknown,
no two sound-alike words share a mic question, every new word is used within 3 minutes of its introduction (using the
step times in §4), no session brings more than 6 new words, and the counts in §2 are computed from the same lists. When
the content is built, `tools/vocab-audit.js` should confirm these numbers on a real multi-day run.

**Notation.**
- [**perro** · hola · guau]: a question with word cards; the bold card is the right answer (the game shuffles them).
  Cards show picture + blue word while the word is new, the word alone later (`LEARNING_DESIGN.md`, the word model).
  Every such question has the mic; tapping always works.
- [pictures: **...** · ...]: picture-only cards. The child hears or reads the word and picks the picture (no mic).
- *¡Hola!*: what people say. "No word" in a prompt means it is a picture, a face, a sign, a sound or the thing itself:
  that is what makes a retrieval cue-free.
- Patterns (from `LEARNING_DESIGN.md`): **show-and-name**, **watch-and-do**, **find-it**, **listen-and-point**, **overheard**.
- Chapter ids C1-C21 are used throughout. Times are estimates for a 7-year-old (listening, thinking, walking).

## Contents
1. [The words in introduction order](#1-the-words-in-introduction-order)
2. [Reuse: where every word comes back](#2-reuse-where-every-word-comes-back)
3. [Sessions and pacing](#3-sessions-and-pacing)
4. [The errands, step by step](#4-the-errands-step-by-step)
5. [The notebook and page puzzles](#5-the-notebook-and-page-puzzles)
6. [Rules for writing content](#6-rules-for-writing-content)
7. [What changed from the current game](#7-what-changed-from-the-current-game)

---

## 1. The words in introduction order

Each chapter lists its new words in the order they are met. *What the child sees* is the introduction; *known
alternatives* are the other cards of the introduction puzzle (all met before); *first use* is the first later moment
in the same chapter where the child picks or says the word, with the step number from §4 and the time after the
introduction.

Three deliberate exceptions to "a new word and two known ones":
- **hola** is the first word of the game, so nothing is known yet: Mamá says it and it is a single card to say back.
  Its real first retrieval (Canelo waves a paw, no word) comes two minutes later with two known alternatives.
- **find-it introductions** (places, *rojo*, *blanco*, *rosado*, *amarillo*, *cama*, *perro*) use the world as the
  alternatives: the other places get picture bubbles without words, the other balls or flowers are never named.
- **uno, dos** are found as nests of eggs (pictures), and questions use two cards until *tres* exists.

### C1 · ¡Un perro! (session 1; Mamá, home) · 4 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `hola` | *hola* (hello) | saludos | show-and-name (echo) | Mamá, home | Mamá waves: "¡Hola, {name}!"; one card, hola, to say back | none: the bootstrap word (a single card) | she waves back and says it again | step 4, ~2.1 min: [**hola** · perro · guau] |
| 2 | `perro` | *el perro* (the dog) | animales | find-it | Mamá, home | a puppy bursts in; "¡Un perro! ¿Y el perro?"; three hiding spots, one wagging tail | world: the two empty hiding spots | he pops out: "¡El perro!" and barks | step 5, ~1.8 min: [**perro** · hola · guau] |
| 3 | `guau` | *guau* (woof) | sonidos | show-and-name | Mamá, home | Canelo barks; "El perro dice ¡guau!"; "¿Qué dice el perro?" | hola, perro | he barks back at your voice | step 6, ~1.4 min: [**guau** · hola · perro] |
| 4 | `ven` | *ven* (come!) | mascota | watch-and-do | Mamá, home | Mamá calls "¡ven!" twice and he runs to her; then he romps off | hola, guau | he races to you and jumps up (hola: he waves a paw; guau: he barks; both leave him where he is) | step 8, ~1.1 min: [**ven** · perro · hola] |

### C2 · El gato de la cerca (session 1; Nico, the plaza and the park fence) · 2 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | `gato` | *el gato* (the cat) | animales | show-and-name | Nico, park fence | a cat on the fence, "¡Miau!"; Nico: "¡Un gato! ¿Qué es?" | perro, guau | she stretches and purrs; "¡El gato!" | step 5, ~1.5 min: [**gato** · perro · hola] |
| 6 | `miau` | *miau* (meow) | sonidos | show-and-name | Nico, park fence | "El gato dice ¡miau!"; "¿Qué dice el gato?" | guau, hola | she meows back | step 5, ~0.9 min: heard or named, then found and tapped in the world |

### C3 · ¡Buenos días, Canelo! (session 2; Mamá, home, morning) · 3 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | `buenosdias` | *buenos días* (good morning) | saludos | show-and-name | Mamá, home (morning) | curtains open, sun picture: "¡Buenos días!"; answer her | ven, gato | Mamá smiles, sunlight sparkles (hola is never a card: it would be right too) | step 2, ~0.6 min: [**buenos días** · ven · guau] |
| 8 | `hueso` | *el hueso* (the bone) | mascota | show-and-name | Mamá, home | she holds up a bone, Canelo bounces; "¿Qué es?" | gato, perro | the bone glows, Canelo licks his lips | step 5, ~1.4 min: [**hueso** · gato · hola] |
| 9 | `sientate` | *siéntate* (sit!) | mascota | watch-and-do | Mamá, home | "¡siéntate!" twice, he sits for a treat; then he jumps at you | ven, guau | he sits and you give him the bone (ven: he jumps up and topples you; guau: he barks) | step 6, ~1.4 min: [**siéntate** · ven · perro] |

### C4 · El juego de Don Pepe (session 2; Don Pepe, his fruit stall on the plaza) · 3 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | `si` | *sí* (yes) | saludos | show-and-name | Don Pepe, fruit stall | he points at Canelo: "¿Un perro?", nods, thumbs up, "¡Sí!"; then asks you | hola, guau | he nods: "¡Sí!" | step 4, ~1.5 min: [**sí** · no] |
| 11 | `no` | *no* (no) | saludos | show-and-name | Don Pepe, fruit stall | he points at the cat: "¿Un perro?", shakes his head: "¡No! Un gato."; then asks you | sí, hola | he shakes his head: "¡No!" | step 4, ~0.8 min: [**no** · sí] |
| 12 | `manzana` | *la manzana* (the apple) | comida | show-and-name | Don Pepe, fruit stall | he holds up an apple: "¡Una manzana! ¿Qué es?" | hueso, gato | he polishes it: "¡Una manzana!" | step 7, ~0.8 min: [pictures: **manzana** · hueso · perro] |

### C5 · La pelota roja (session 3; Sofía, the park) · 2 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | `pelota` | *la pelota* (the ball) | mascota | watch-and-do | Sofía, park | she throws a ball, "¡La pelota!", Canelo fetches it; "¿Qué es?" | hueso, manzana | Canelo drops it at your feet | step 3, ~0.6 min: [**pelota** · siéntate · ven] |
| 14 | `rojo` | *rojo / roja* (red) | colores | find-it | Sofía, park | "Mi pelota... ¡roja!" (bubble: a red ball); three bushes hide a blue, a green and a red ball | world: the blue and green balls (colours never named) | she hugs it: "¡Roja!" | step 6, ~1.2 min: [pictures: **rojo** · pelota] |

### C6 · Pan para los patos (session 3; Marta, then Nico, the bakery door, then the farm pond) · 4 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | `pan` | *el pan* (the bread) | comida | show-and-name | Marta, bakery door | she holds out a loaf: "¡Pan! ¿Qué es?" | manzana, pelota | steam rises: "¡Pan!" | step 4, ~1.2 min: [**pan** · manzana · pelota] |
| 16 | `gracias` | *gracias* (thank you) | saludos | overheard | Marta and Rosa, bakery door | Rosa gets bread and says "¡Gracias!"; then Marta hands you a loaf: "¡Para ti!" | hola, no | Marta beams: "¡De nada!" | step 4, ~0.6 min: [**gracias** · hola · no] |
| 17 | `pato` | *el pato* (the duck) | granja | show-and-name | Nico, farm pond | "¡Cuac, cuac!", three ducks; "¡Un pato! ¿Qué es?" | perro, pelota | the duck flaps (never gato with pato) | step 6, ~1.4 min: [**pato** · perro · pelota] |
| 18 | `cuac` | *cuac* (quack) | sonidos | show-and-name | Nico, farm pond | "El pato dice ¡cuac!"; "¿Qué dice el pato?" | miau, guau | the ducks quack back | step 7, ~0.7 min: [**cuac** · miau · guau] |

### C7 · ¿Dónde está Canelo? (session 4; Mamá; Gómez, Nico, Lucía, Tomás, home, plaza, park, fountain, barn) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | `parque` | *el parque* (the park) | pueblo | find-it | Señor Gómez, plaza | "¡El parque!"; picture bubbles over three ways out of the plaza, no words | world: the school road and the farm road | the arrival banner: "el parque" | step 3, ~1.1 min: [**parque** · perro · gato] |
| 20 | `banco` | *el banco* (the bench) | cosas | find-it | Nico, park | "¡El banco!"; bubbles over a bench, a tree and the pond | world: the tree and the pond | Canelo's bone on it; banner "el banco" | step 5, ~0.8 min: [**banco** · pan · gato] |
| 21 | `fuente` | *la fuente* (the fountain) | cosas | find-it | Lucía, park gate | "¡La fuente!"; bubbles over the fountain, Pepe's stall and a bench | world: the stall and the bench | his ball bobbing in the water; banner | step 7, ~1.1 min: [**fuente** · banco · parque] |
| 22 | `granja` | *la granja* (the farm) | pueblo | find-it | Tomás, plaza | "¡La granja!"; the barn bubble east, past two other ways | world: the park and school roads | the barn door barks; banner | step 9, ~1.2 min: [**granja** · fuente · parque] |
| 23 | `cabra` | *la cabra* (the goat) | granja | show-and-name | Tomás, the barn | a goat trots out after Canelo: "¡Una cabra! ¿Qué es?" | perro, pato | she bleats and trots to her paddock | step 11, ~1.0 min: [**cabra** · gato · perro] |

### C8 · La escuela de Luna (session 5; Mamá, then Profesora Luna, home, the school, three friends) · 3 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | `escuela` | *la escuela* (the school) | pueblo | find-it | Mamá, home | "¡La escuela!"; bubbles over the school, the park and the farm road | world: the park and the farm road | banner at the school door | step 2, ~0.9 min: [**escuela** · parque · granja] |
| 25 | `bien` | *bien* (fine / well) | sentir | overheard | Luna and Nico, school | Luna asks Nico "¿cómo estás?", he says "¡Bien!" (thumbs up); then she asks you | hola, no | Luna: "¡Bien!" and a thumbs-up (never ven with bien) | step 5, ~0.6 min: [**bien** · no · hola] |
| 26 | `comoestas` | *¿cómo estás?* (how are you?) | saludos | overheard | Luna, school | heard twice (to Nico, to you); then "¡Pregúntale a Canelo!" with a question bubble | hola, gracias | Canelo wags, "¡Guau!" | step 6, ~1.4 min: [**¿cómo estás?** · hola · gracias] |

### C9 · ¡Buenas noches, Canelo! (session 5; Mamá, home, evening) · 3 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 27 | `agua` | *el agua* (the water) | comida | show-and-name | Mamá, home (evening) | Canelo pants at his empty bowl; she pours: "¡Agua!"; "¿Qué quiere Canelo?" | hueso, pan | lap lap, drops fly | step 2, ~0.7 min: [**agua** · hueso · pelota] |
| 28 | `cama` | *la cama* (the bed) | mascota | find-it | Mamá, home (evening) | "Canelo, ¡a la cama!" (he goes to his cushion); "¿Y tu cama?"; bubbles over your bed, the table, the door | world: the table and the door | you hop in; "¡La cama!" | step 4, ~0.5 min: [**cama** · ven · pelota] |
| 29 | `buenasnoches` **new id** | *buenas noches* (good night) | saludos | show-and-name | Mamá, home (evening) | moon picture: "¡Buenas noches, {name}!" | buenos días, ven | a kiss; the lamp goes out (the moon, not the sun, decides) | step 6, ~0.5 min: [**buenas noches** · buenos días · agua] |

### C10 · Tomás está cansado (session 6; Tomás, the plaza bench, Rosa's house, the school, the paddock) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 30 | `cansado` | *cansado / cansada* (tired) | sentir | show-and-name | Tomás, plaza bench | you ask him ¿cómo estás?; he yawns: "Mmm... cansado."; "¿Cómo está Tomás?" | bien, no | another yawn, a "zzz" | step 2, ~0.7 min: [**cansado** · bien · no] |
| 31 | `carta` | *la carta* (the letter) | pueblo | show-and-name | Tomás, plaza bench | he holds up an envelope: "Una carta. ¿Qué es?" | pan, pelota | stamped, into your bag | step 6, ~2.2 min: [**carta** · pan · hueso] |
| 32 | `casa` | *la casa* (the house) | pueblo | find-it | Tomás, plaza bench | "Para la casa de Rosa"; bubbles over Rosa's house, the school, the bakery | world: the school and the bakery | banner at Rosa's door | step 6, ~1.1 min: [**casa** · escuela · parque] |
| 33 | `caballo` | *el caballo* (the horse) | granja | show-and-name | Nico, the paddock | the horse eats the letter; "¡El caballo! ¿Qué es?" | cabra, pato | he whinnies, the letter sticking out of his mouth | step 9, ~1.4 min: [**caballo** · cabra · perro] |
| 34 | `adios` | *adiós* (goodbye) | saludos | watch-and-do | Tomás, plaza | rested, he walks off waving: "¡Adiós!"; wave back | hola, gracias | he turns and waves again as he goes | step 12, ~1.5 min: [**adiós** · hola · bien] |

### C11 · Los huevos de Rosa (session 7; Abuela Rosa, her house and the henhouse) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | `gallina` | *la gallina* (the hen) | granja | show-and-name | Rosa, henhouse | "¡Coc, coc!"; "¡Una gallina! ¿Qué es?" | pato, cabra | she clucks and ruffles | step 3, ~0.6 min: [**gallina** · pato · cabra] |
| 36 | `huevo` | *el huevo* (the egg) | comida | show-and-name | Rosa, henhouse | she holds up an egg: "Un huevo. ¿Qué es?" | pan, manzana | the egg wobbles in her hand | step 4, ~0.6 min: [**huevo** · pan · manzana] |
| 37 | `uno` | *uno* (one) | numeros | listen-and-point | Rosa, henhouse | one finger, one egg: "¡Uno!"; two nests (one egg, two eggs): "¿Uno?" | world: the nest with two eggs | she holds up one finger: "¡Uno!" | step 6, ~1.3 min: [**uno** · dos] |
| 38 | `dos` | *dos* (two) | numeros | listen-and-point | Rosa, henhouse | two eggs, two fingers: "¡Dos!"; "¿Dos?" tap the nest | world: the nest with one egg | "¡Dos!" two fingers | step 6, ~0.7 min: [**dos** · uno] |
| 39 | `blanco` | *blanco / blanca* (white) | colores | find-it | Rosa, henhouse | "La gallina blanca..."; a white hen and a brown hen (colours never named) | world: the brown hen | she flaps up: an egg! "¡Blanca!" | step 9, ~0.7 min: [**blanco** · rojo · pan] |

### C12 · El mercado de Mamá (session 8; Mamá, then Don Pepe, home and the fruit stall) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | `platano` | *el plátano* (the banana) | comida | show-and-name | Don Pepe, stall | "¡Un plátano! ¿Qué es?" | manzana, pan | he peels it halfway | step 3, ~1.1 min: [**plátano** · naranja · manzana] |
| 41 | `naranja` | *la naranja* (the orange) | comida | show-and-name | Don Pepe, stall | "¡Una naranja! ¿Qué es?" | manzana, plátano | he rolls it along the counter | step 6, ~1.9 min: [**naranja** · plátano · manzana] |
| 42 | `porfavor` | *por favor* (please) | saludos | overheard | Marta at Pepe's stall | Marta: "¡Una manzana, por favor!" and gets it at once; your turn to order | gracias, hola | Pepe: "¡Claro!" and starts counting | step 6, ~1.3 min: [**por favor** · gracias · adiós] |
| 43 | `tres` | *tres* (three) | numeros | listen-and-point (counting) | Don Pepe, stall | he counts bananas: "uno, dos... ¡tres!"; the list shows three | dos, uno | "¡Tres!" three fingers | step 7, ~1.3 min: [**tres** · cuatro · dos] |
| 44 | `cuatro` | *cuatro* (four) | numeros | listen-and-point (counting) | Don Pepe, stall | "uno, dos, tres... ¡cuatro!"; the list shows four oranges | tres, dos | "¡Cuatro!" | step 7, ~0.6 min: [**cuatro** · tres · dos] |

### C13 · El día de campo (session 9; Abuela Rosa, bakery, stall, hens, paddock, fountain, then a picnic in the park) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 | `panaderia` | *la panadería* (the bakery) | pueblo | find-it | Rosa, her door | "El pan... ¡la panadería!"; bubbles over the bakery, the library, the school | world: the library and the school | banner at the bakery | step 3, ~1.1 min: [**panadería** · casa · escuela] |
| 46 | `queso` | *el queso* (the cheese) | comida | show-and-name | Don Pepe, stall | "¡Un queso! ¿Qué es?" | pan, huevo | he wraps it in paper | step 6, ~1.6 min: [**queso** · pan · plátano] |
| 47 | `leche` | *la leche* (the milk) | comida | show-and-name | Nico, paddock | the goat's pail: "La cabra... ¡leche! ¿Qué es?" | agua, queso | he pours a cup | step 9, ~1.3 min: [**leche** · agua · pan] |
| 48 | `cinco` | *cinco* (five) | numeros | listen-and-point (counting) | Rosa, her door | she counts the basket: "...cuatro, ¡cinco!" | cuatro, tres | "¡Cinco!" a whole hand | step 11, ~0.3 min: [**cinco** · cuatro · tres] |
| 49 | `seis` | *seis* (six) | numeros | listen-and-point (counting) | Rosa, the picnic | she counts the plates: "...cinco, ¡seis!" | cinco, cuatro | "¡Seis!" | step 13, ~0.3 min: [**seis** · cinco · cuatro] |

### C14 · El show de perros (session 10; Sofía; Luna judges, the park, the bakery, the show ring) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | `pata` | *dame la pata* (shake! (paw)) | mascota | watch-and-do | Sofía, park | "Canelo, ¡dame la pata!", a paw in her hand; you hold out yours | siéntate, ven | a paw in your hand, a high-five sparkle | step 4, ~0.8 min: [**dame la pata** · siéntate · ven] |
| 51 | `salta` | *salta* (jump!) | mascota | watch-and-do | Sofía, park | she jumps a bar: "¡Salta!" and he follows | dame la pata, siéntate | he clears the bar, a dust puff | step 6, ~0.8 min: [**salta** · ven · dame la pata] |
| 52 | `galleta` | *la galleta* (the cookie) | comida | show-and-name | Marta, bakery | "¡Una galleta! ¿Qué es?" | pan, queso | crumbs; Canelo drools (never gallina with galleta) | step 8, ~1.5 min: [**galleta** · pan · hueso] |
| 53 | `azul` | *azul* (blue) | colores | show-and-name | Profesora Luna, show ring | "¡Una cinta azul!"; "¿De qué color?" | rojo, blanco | the ribbon on Canelo's collar | step 11, ~0.5 min: [**azul** · blanco · rojo] |
| 54 | `feliz` | *feliz* (happy) | sentir | show-and-name | Sofía, show ring | she jumps, beaming: "¡Estoy feliz!"; "¿Cómo está Sofía?" | cansado, bien | confetti, her big smile | step 13, ~0.5 min: [**feliz** · cansado · bien] |

### C15 · Las flores de Lucía (session 11; Lucía, the plaza and flowers around town) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 55 | `triste` | *triste* (sad) | sentir | show-and-name | Lucía, plaza | you ask her ¿cómo estás?; tears: "Triste..." | feliz, cansado | she sniffs and nods | step 2, ~1.0 min: [**triste** · feliz · cansado] |
| 56 | `flor` | *la flor* (the flower) | cosas | show-and-name | Lucía, plaza | she points at a flower bed: "Una flor... ¿Qué es?" | pelota, hueso | a flower sparkles | step 3, ~1.6 min: [**flor** · pelota · hueso] |
| 57 | `rosa` | *rosado / rosada* (pink) | colores | find-it | Lucía, around town | "Una flor rosada" (bubble: a pink flower); red, white and blue flowers are known, pink is not | world: the red, white and blue flowers (named with known words) | "¡Rosada!" | step 4, ~1.6 min: [**rosado** · azul · blanco] |
| 58 | `amarillo` | *amarillo / amarilla* (yellow) | colores | find-it | Lucía, around town | "Y una flor amarilla" (bubble: a yellow flower) | world: the other flowers | "¡Amarilla!" | step 7, ~1.4 min: [**amarillo** · azul · rojo] |
| 59 | `mariposa` | *la mariposa* (the butterfly) | animales | show-and-name | Lucía, the yellow flower | a butterfly on it: "¡Una mariposa! ¿Qué es?" | cabra, gato | it opens its wings | step 8, ~0.9 min: [**mariposa** · cabra · gato] |

### C16 · Las páginas perdidas (session 12; Inés and Señor Gómez, the library and the park) · 4 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | `biblioteca` | *la biblioteca* (the library) | pueblo | find-it | Señor Gómez, plaza | "¿Inés? ¡La biblioteca!"; bubbles over the library, the bakery, the school | world: the bakery and the school | banner at the library | step 2, ~1.2 min: [**biblioteca** · panadería · escuela] |
| 61 | `busca` **new id** | *busca* (find it! (sniff)) | mascota | watch-and-do | Señor Gómez, park bench | "Canelo... ¡busca!"; he sniffs a trail and barks at a hidden card | salta, ven | he runs to the next card and barks there | step 5, ~2.9 min: [**busca** · salta · siéntate] |
| 62 | `arbol` | *el árbol* (the tree) | cosas | find-it | Señor Gómez, park | a card stuck up a tree: "¡El árbol!"; bubbles over a tree, a bench, the fountain | world: the bench and the fountain | Canelo barks up it, the card flutters down | step 8, ~1.4 min: [**árbol** · banco · fuente] |
| 63 | `conejo` | *el conejo* (the rabbit) | animales | show-and-name | Señor Gómez, park lawn | a rabbit on the last card: "¡Un conejo! ¿Qué es?" | gato, perro | it twitches its nose and hops | step 9, ~2.0 min: [**conejo** · gato · cabra] |

### C17 · ¿Qué dicen? (session 13; Nico, the park pond, a tree, the farm, the fence) · 5 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 64 | `rana` | *la rana* (the frog) | animales | listen-and-point | Nico, park pond | "¡Croac, croac!" (the cry); follow it to a lily pad: "¡Una rana! ¿Qué es?" | pato, conejo | she hops pad to pad | step 3, ~1.9 min: [**rana** · pato · conejo] |
| 65 | `croac` | *croac* (ribbit) | sonidos | show-and-name | Nico, park pond | "La rana dice ¡croac!"; "¿Qué dice la rana?" | miau, guau | she croaks back (never cuac with croac) | step 3, ~0.7 min: [**croac** · miau · guau] |
| 66 | `verde` | *verde* (green) | colores | show-and-name | Nico, park pond | "La rana es... ¡verde!"; "¿De qué color?" | azul, rojo | she puffs up | step 5, ~1.3 min: [**verde** · azul · blanco] |
| 67 | `pajaro` | *el pájaro* (the bird) | animales | listen-and-point | Nico, a park tree | "¡Pío, pío!" (the cry); "¡Un pájaro! ¿Qué es?" | rana, conejo | it hops along the branch | step 6, ~2.9 min: [**pájaro** · rana · gato] |
| 68 | `gira` | *gira* (spin!) | mascota | watch-and-do | Nico, the farm | Nico spins: "Canelo... ¡gira!" and Canelo spins after him | salta, busca | he spins twice, sparkles | step 10, ~0.8 min: [**gira** · dame la pata · ven] |

### C18 · ¿Cuántos animales? (el pueblo) (session 14; Profesora Luna, the school and around town) · 3 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 69 | `pez` | *el pez* (the fish) | animales | show-and-name | Profesora Luna, plaza fountain | the fish jumps: "¡Un pez! ¿Qué es?" | pato, rana | it jumps again, a splash | step 3, ~2.6 min: [**pez** · rana · pájaro] |
| 70 | `siete` | *siete* (seven) | numeros | listen-and-point (counting) | Profesora Luna, around town | "...seis, ¡siete!" (the butterfly is the 7th) | seis, cinco | "¡Siete!" (never siéntate with siete) | step 5, ~0.8 min: [**siete** · seis · cinco] |
| 71 | `ocho` | *ocho* (eight) | numeros | listen-and-point (counting) | Profesora Luna, Rosa's hens | "...siete, ¡ocho!" | siete, seis | "¡Ocho!" | step 7, ~1.5 min: [**ocho** · siete · seis] |

### C19 · ¡Todos a la granja! (session 15; Profesora Luna, the farm) · 2 new

| # | id | Spanish (English) | topic | pattern | who, where | what the child sees | known alternatives | confirmed by | first use |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 72 | `nueve` | *nueve* (nine) | numeros | listen-and-point (counting) | Profesora Luna, the farm | the horse joins: "...ocho, ¡nueve!" | ocho, siete | "¡Nueve!" (never huevo with nueve) | step 5, ~1.8 min: [**nueve** · diez · ocho] |
| 73 | `diez` | *diez* (ten) | numeros | listen-and-point (counting) | Profesora Luna, the farm | the goat joins: "...nueve, ¡diez!" | nueve, ocho | a fanfare: "¡Diez!" | step 5, ~1.0 min: [**diez** · nueve · ocho] |

**73 words.** New ids: `buenasnoches`, `busca`. Every other id is reused from `src/data.js`; the topic column
shows the new notebook pages (§5), which merge some old ones.

---

## 2. Reuse: where every word comes back

### 2.1 Per word

*Active uses* count only the times the child must pick the right card or say the word in the errands of §4 (not
the introduction puzzle, not free choices in shops or Canelo's menu, not *sí* or *no* answers about a word). A sí/no
question counts for *sí* or *no* only. *Review sources* are the places the review engine can ask for it on top (§2.2).

| word | met in | active uses in errands (chapter × uses) | total | errands | review sources that can ask for it |
| --- | --- | --- | --- | --- | --- |
| *hola* | C1 | C1, C2, C4, C5, C6, C7×4, C8, C10, C12, C13, C14, C15, C16×2, C17, C18, C20 | 20 | 16 | greet (pepe, marta, rosa, sofia, nico, lucia, tomas, gomez, luna, ines); favores: manners; page saludos; palabra del día |
| *perro* | C1 | C1, C2, C7×4, C17, C18, C19, C21 | 10 | 7 | greet (mama, gomez); favores: find; Canelo; page animales; palabra del día |
| *guau* | C1 | C1, C2×2, C6, C7, C17, C21 | 7 | 6 | greet (nico); favores: sound; Canelo; page sonidos; palabra del día |
| *ven* | C1 | C1×3, C2×2, C3, C5×2, C7, C10, C11, C14, C16, C19×2, C20, C21 | 17 | 12 | greet (mama); Canelo; page mascota; palabra del día |
| *gato* | C2 | C2×3, C17, C18, C19, C21 | 7 | 5 | greet (nico); favores: find; side job: the sleepy cat; page animales; palabra del día |
| *miau* | C2 | C2×2, C17×2, C21 | 5 | 3 | greet (nico); favores: sound; side job: the sleepy cat; page sonidos; palabra del día |
| *buenos días* | C3 | C3×2, C4, C6, C7, C8, C9, C11, C19, C20, C21 | 11 | 10 | greet (mama, pepe, marta, rosa, gomez, luna); favores: manners; evening; page saludos; palabra del día |
| *hueso* | C3 | C3, C4, C7, C11, C13, C21 | 6 | 6 | greet (mama); favores: bring; Canelo; page mascota; palabra del día |
| *siéntate* | C3 | C3×2, C4, C5, C6, C7, C11, C14×2, C16×2, C20, C21 | 13 | 10 | greet (mama); Canelo; page mascota; palabra del día |
| *sí* | C4 | C4×4, C5×2, C10, C11, C12×2, C13, C14, C15×2, C18, C20 | 16 | 10 | greet (pepe); favores: manners; page saludos; palabra del día |
| *no* | C4 | C4×3, C5×2, C7, C12, C15 | 8 | 5 | greet (pepe); favores: manners; page saludos; palabra del día |
| *manzana* | C4 | C4, C10, C16, C19, C20, C21 | 6 | 6 | greet (pepe, rosa); favores: bring; side job: pet the horse; page comida; palabra del día |
| *pelota* | C5 | C5×2, C7×2, C8 | 5 | 3 | greet (mama, sofia); favores: bring; Canelo; page mascota; palabra del día |
| *rojo* | C5 | C5, C12, C14, C15, C20, C21 | 6 | 6 | greet (pepe, sofia, lucia); favores: colour; page colores; palabra del día |
| *pan* | C6 | C6×2, C13×2, C19, C20, C21 | 7 | 5 | greet (marta); favores: bring; side job: feed the ducks; page comida; palabra del día |
| *gracias* | C6 | C6×3, C8, C10, C11, C12, C13, C14, C16 | 10 | 8 | greet (pepe, marta, rosa, ines); favores: manners; side job: feed the ducks, the hens' egg; page saludos; palabra del día |
| *pato* | C6 | C6×2, C13, C17, C19, C20, C21 | 7 | 6 | greet (nico); favores: find; side job: feed the ducks; page granja; palabra del día |
| *cuac* | C6 | C6×3, C17×2, C20, C21 | 7 | 4 | greet (nico); favores: sound; side job: feed the ducks; page sonidos; palabra del día |
| *parque* | C7 | C7, C13, C14, C17, C20 | 5 | 5 | greet (sofia, tomas, gomez); favores: go to; page pueblo; palabra del día |
| *banco* | C7 | C7×2, C13, C15, C16, C20 | 6 | 5 | greet (gomez); favores: go to; page cosas; palabra del día |
| *fuente* | C7 | C7×2, C10, C13, C20 | 5 | 4 | greet (lucia, tomas); favores: go to; side job: Canelo's water; page cosas; palabra del día |
| *granja* | C7 | C7×2, C10, C13, C19, C20 | 6 | 5 | greet (tomas); favores: go to; page pueblo; palabra del día |
| *cabra* | C7 | C7, C10, C13, C19, C20, C21 | 6 | 6 | greet (nico); favores: find; page granja; palabra del día |
| *escuela* | C8 | C8, C10, C18×2, C20 | 5 | 4 | greet (tomas, luna); favores: go to; page pueblo; palabra del día |
| *bien* | C8 | C8×5, C10, C13, C14 | 8 | 4 | greet (mama, lucia, luna); favores: feeling; page sentir; palabra del día |
| *¿cómo estás?* | C8 | C8×3, C10×2, C13, C14, C15, C20 | 9 | 6 | greet (mama, luna); favores: manners; page saludos; palabra del día |
| *agua* | C9 | C9×2, C10, C12, C13×2, C20 | 7 | 5 | greet (mama, tomas); favores: bring; Canelo; evening; side job: Canelo's water; page comida; palabra del día |
| *cama* | C9 | C9, C10, C14, C20, C21 | 5 | 5 | greet (mama); Canelo; evening; page mascota; palabra del día |
| *buenas noches* | C9 | C9, C13, C14, C20, C21 | 5 | 5 | greet (mama); favores: manners; evening; page saludos; palabra del día |
| *cansado* | C10 | C10, C13, C14, C19, C20, C21 | 6 | 6 | greet (mama, lucia, tomas); favores: feeling; Canelo; evening; page sentir; palabra del día |
| *carta* | C10 | C10×2, C12, C16, C20×2 | 6 | 4 | greet (tomas); favores: bring; page pueblo; palabra del día |
| *casa* | C10 | C10, C11, C12, C13, C20 | 5 | 5 | greet (mama, rosa, tomas); favores: go to; side job: the hens' egg, Canelo's water; page pueblo; palabra del día |
| *caballo* | C10 | C10, C13, C19, C20, C21 | 5 | 5 | greet (nico); favores: find; side job: pet the horse; page granja; palabra del día |
| *adiós* | C10 | C10, C12, C13, C15, C16 | 5 | 5 | greet (tomas, ines); favores: manners; page saludos; palabra del día |
| *gallina* | C11 | C11×2, C13, C18, C19, C21 | 6 | 5 | greet (rosa); favores: find; side job: the hens' egg; page granja; palabra del día |
| *huevo* | C11 | C11×2, C13×2, C16, C20 | 6 | 4 | greet (rosa); favores: bring; side job: the hens' egg; page comida; palabra del día |
| *uno* | C11 | C11×2, C18×2, C19×2 | 6 | 3 | greet (pepe, marta, rosa, luna); favores: count; side job: feed the ducks; page numeros; palabra del día |
| *dos* | C11 | C11×2, C18×2, C19 | 5 | 3 | greet (pepe, marta, rosa, luna); favores: count; side job: feed the ducks; page numeros; palabra del día |
| *blanco* | C11 | C11, C13, C14, C15, C20 | 5 | 5 | greet (rosa, sofia, lucia); favores: colour; side job: the hens' egg; page colores; palabra del día |
| *plátano* | C12 | C12×2, C13, C20, C21 | 5 | 4 | greet (pepe); favores: bring; page comida; palabra del día |
| *naranja* | C12 | C12×2, C14, C16, C20 | 5 | 4 | greet (pepe); favores: bring; page comida; palabra del día |
| *por favor* | C12 | C12, C13, C14, C16, C20 | 5 | 5 | greet (pepe, marta); favores: manners; page saludos; palabra del día |
| *tres* | C12 | C12×2, C14, C18, C19×2 | 6 | 4 | greet (pepe, marta, rosa, luna); favores: count; side job: feed the ducks; page numeros; palabra del día |
| *cuatro* | C12 | C12, C13, C14, C18, C19 | 5 | 5 | greet (pepe, marta, luna); favores: count; page numeros; palabra del día |
| *panadería* | C13 | C13, C14, C16, C20, C21 | 5 | 5 | greet (marta, tomas); favores: go to; page pueblo; palabra del día |
| *queso* | C13 | C13×2, C16, C20, C21 | 5 | 4 | greet (pepe); favores: bring; page comida; palabra del día |
| *leche* | C13 | C13×2, C19, C20, C21 | 5 | 4 | greet (marta); favores: bring; page comida; palabra del día |
| *cinco* | C13 | C13×2, C15, C18, C19, C20 | 6 | 5 | greet (pepe, marta, luna); favores: count; page numeros; palabra del día |
| *seis* | C13 | C13, C18, C19, C20×2 | 5 | 4 | greet (pepe, luna); favores: count; page numeros; palabra del día |
| *dame la pata* | C14 | C14×3, C16, C20, C21 | 6 | 4 | greet (sofia); Canelo; page mascota; palabra del día |
| *salta* | C14 | C14×3, C16, C20, C21 | 6 | 4 | greet (sofia); Canelo; page mascota; palabra del día |
| *galleta* | C14 | C14×2, C16, C20, C21 | 5 | 4 | greet (mama, marta, sofia); favores: bring; Canelo; page comida; palabra del día |
| *azul* | C14 | C14, C15, C17, C20, C21 | 5 | 5 | greet (sofia, lucia); favores: colour; page colores; palabra del día |
| *feliz* | C14 | C14, C15, C17, C20×2, C21×2 | 7 | 5 | greet (mama, sofia, lucia); favores: feeling; Canelo; page sentir; palabra del día |
| *triste* | C15 | C15×2, C16, C17, C19, C20 | 6 | 5 | greet (lucia); favores: feeling; Canelo; page sentir; palabra del día |
| *flor* | C15 | C15×2, C16, C17, C18, C20, C21 | 7 | 6 | greet (rosa, lucia); favores: bring; page cosas; palabra del día |
| *rosado* | C15 | C15, C16, C18, C20×2, C21 | 6 | 5 | greet (rosa, lucia); favores: colour; page colores; palabra del día |
| *amarillo* | C15 | C15, C17, C20×2, C21 | 5 | 4 | greet (pepe, sofia, lucia); favores: colour; page colores; palabra del día |
| *mariposa* | C15 | C15, C16, C17, C18, C20, C21 | 6 | 6 | greet (nico, lucia); favores: find; page animales; palabra del día |
| *biblioteca* | C16 | C16×2, C17, C20, C21 | 5 | 4 | greet (tomas, ines); favores: go to; page pueblo; palabra del día |
| *busca* | C16 | C16×3, C19, C20, C21 | 6 | 4 | greet (gomez); Canelo; page mascota; palabra del día |
| *árbol* | C16 | C16×2, C17, C18, C21 | 5 | 4 | greet (gomez); favores: go to; page cosas; palabra del día |
| *conejo* | C16 | C16, C17, C18, C19, C21 | 5 | 5 | greet (nico, gomez); favores: find; page animales; palabra del día |
| *rana* | C17 | C17×2, C18×2, C20, C21 | 6 | 4 | greet (nico); favores: find; page animales; palabra del día |
| *croac* | C17 | C17×3, C18, C20, C21 | 6 | 4 | greet (nico); favores: sound; page sonidos; palabra del día |
| *verde* | C17 | C17, C18, C19, C20, C21 | 5 | 5 | greet (pepe, nico); favores: colour; page colores; palabra del día |
| *pájaro* | C17 | C17, C18, C19, C20, C21 | 5 | 5 | greet (nico, gomez); favores: find; page animales; palabra del día |
| *gira* | C17 | C17×2, C19, C20, C21 | 5 | 4 | greet (nico); Canelo; page mascota; palabra del día |
| *pez* | C18 | C18×2, C19, C20, C21 | 5 | 4 | greet (nico); favores: find; page animales; palabra del día |
| *siete* | C18 | C18×2, C19, C20, C21 | 5 | 4 | greet (pepe, luna); favores: count; page numeros; palabra del día |
| *ocho* | C18 | C18×2, C19, C20, C21 | 5 | 4 | greet (pepe, luna); favores: count; page numeros; palabra del día |
| *nueve* | C19 | C19×2, C20×2, C21 | 5 | 3 | greet (pepe, luna); favores: count; page numeros; palabra del día |
| *diez* | C19 | C19×2, C20, C21×2 | 5 | 3 | greet (pepe, luna); favores: count; page numeros; palabra del día |

### 2.2 The review sources

The review engine (`G.review.due(n, filter)`) picks words that are due; each source asks only for words in its pool
that the child has met, in the question form the word's stage calls for (recognise → recall → say). The target is
40-60% of all prompts reviewing older words once about 20 words are known (around session 4).

| source | starts | how often | how it asks (cue-free once the word is known) | can draw on |
| --- | --- | --- | --- | --- |
| **Morning greeting + a due word** | C3 (session 2) | the first talk of the day with each person | The person waves under a sun, a moon or neither: [buenos días · buenas noches · hola] (only from C9 on are both time-of-day greetings cards together; before, *hola* is never a card next to *buenos días*). Then one due word from their pool, asked the way their trade shows it: Pepe holds up a fruit (*¿Qué es?*), Rosa points at her hens (*¿Cuántas?*), Lucía holds a flower (*¿De qué color?*), Tomás shows a stamp picture (*¿Adónde?*), Nico makes a sound (*¿Quién dice...?*) | the pools below |
| **Favores** | C7 (session 4) | 3-5 a day, a "?" bubble over the person | **bring** (*¿Me traes una manzana?*: the word, no picture once known; fetch it from its place) · **find** (*¿Dónde está el conejo?*: walk to it and tap it) · **go to** (*¡A la biblioteca!*) · **how many** (*¿Cuántos patos?* on groups that exist: 3 ducks, 2 hens, the bag, a bouquet) · **what colour** (a flower or ribbon in hand) · **who says** (*¡cuac!*) · **how is** (a face) · **manners** (*gracias* when given something, *por favor* when asking, *adiós* when someone leaves, *¿cómo estás?* to ask, *sí/no* to offers) | bring: manzana, plátano, naranja, pan, galleta, queso, leche, huevo, agua, flor, pelota, carta, hueso · find: all 11 animals · go to: casa, escuela, parque, panadería, biblioteca, granja, fuente, banco, árbol · count: uno-diez · colour: rojo, azul, amarillo, verde, blanco, rosado · sound: guau, miau, cuac, croac · feeling: bien, feliz, triste, cansado · manners: the 9 *Saludos* words |
| **Canelo** | C1 | his menu any time; once a session he asks himself (a "?" bubble) for a due trick or care word | Tricks from a picture sign or the situation, never the word: he's far away (*ven*), he begs (*siéntate*), you hold out your hand (*dame la pata*), a bar (*salta*), a twirl sign (*gira*), a favor to find (*busca*). Care from his need: panting (*agua*), tummy rumble (*hueso*, *galleta*), the ball at your feet (*pelota*), yawning at home (*cama*). *¿Cómo está Canelo?* from his face. Picking from his menu without being asked is a free choice and doesn't count | ven, siéntate, dame la pata, salta, gira, busca, hueso, galleta, agua, pelota, cama, guau, perro, feliz, cansado, triste |
| **Page puzzles** | session 3 (*Saludos*, Don Pepe's tutorial) | a sparkle per page once 4 of its words are known; from C16 any page at Inés's library; one star per page per day | 4 pictures, 4 words, confirmed only when all four are right (1 in 24 by chance) | the page's words (§5) |
| **Palabra del día** | C8 (session 5) | once a day, at Luna | a picture only; say it (mic). With the mic off: pick from 4 words | any word at stage 2+ that is due, oldest first |
| **Evening at home** | C9 (session 5) | every evening | the moon: *buenas noches* to Mamá and Canelo; Canelo's needs; the next morning, the sun: *buenos días* | buenas noches, buenos días, cama, agua, cansado |
| **Side jobs** | as they unlock | once a day each, a star | feed the ducks (C6) · the hens' egg (C11) · Canelo's water (C9) · pet the horse, who wants an apple (C10) · wake the sleepy cat (C2) | ducks: pan, pato, cuac, uno-tres, gracias · egg: huevo, gallina, blanco, gracias, casa · water: agua, fuente, casa · horse: caballo, manzana · cat: gato, miau |

**Greeting pools** (the due word each person can ask for after their greeting):

| person | where | the due word comes from |
| --- | --- | --- |
| Mamá | home | buenos días, buenas noches, perro, ven, siéntate, hueso, agua, cama, pelota, galleta, casa, ¿cómo estás?, bien, feliz, cansado |
| Don Pepe | fruit stall, plaza | hola, buenos días, manzana, plátano, naranja, queso, por favor, gracias, sí, no, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, rojo, amarillo, verde |
| Marta | bakery | hola, buenos días, pan, galleta, leche, panadería, por favor, gracias, uno, dos, tres, cuatro, cinco |
| Abuela Rosa | her house, the hens | hola, buenos días, gallina, huevo, casa, flor, blanco, rosado, manzana, uno, dos, tres, gracias |
| Sofía | park | hola, pelota, rojo, azul, amarillo, blanco, dame la pata, salta, galleta, feliz, parque |
| Nico | park, farm | hola, gato, pato, cabra, caballo, conejo, rana, pájaro, pez, mariposa, guau, miau, cuac, croac, gira, verde |
| Lucía | plaza, park | hola, flor, rosado, amarillo, rojo, blanco, azul, mariposa, fuente, triste, feliz, bien, cansado |
| Tomás | his mail round | hola, adiós, carta, casa, escuela, parque, panadería, biblioteca, granja, fuente, cansado, agua |
| Señor Gómez | plaza, park bench | hola, buenos días, parque, banco, árbol, conejo, pájaro, busca, perro |
| Profesora Luna | school | hola, buenos días, escuela, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, ¿cómo estás?, bien |
| Inés | library | hola, biblioteca, adiós, gracias |

---

## 3. Sessions and pacing

### 3.1 The budget rules (what waits for tomorrow)
- **Up to 6 new words per calendar day, never more than 8.** A chapter starts only if all of its new words fit in
  today's budget. If not, its giver shows a sun bubble (*¡Mañana!*) and the hint hand passes them by.
- **No new chapter while 10 or more words are still at stage 1** (met but never picked without a cue). That day is a
  review day: favores, side jobs, Canelo, page puzzles (`LEARNING_RESEARCH.md` §11).
- **A started chapter can always be finished**; its words count against the day it started.
- **Morning chapters** (C3, C7, C8, C19) open at the start of a session or after a night at home. **C9 needs an
  evening**: when it is due, the sunset comes about five minutes after C8 ends.
- **A 30-minute sitting**: the day's chapter(s) take about 15 minutes; the rest is review content (3-5 favores, side
  jobs, Canelo, page puzzles, the album, tapping around). The next chapter may also open the same day if the day stays
  within 8 new words and today's new words have all had their second use; the small chapters (C2, C5, C9, C18, C19)
  are the ones that fit.

### 3.2 Day 1, minute by minute (session 1)
| time | what happens | words |
| --- | --- | --- |
| 0:00 | Mamá waves: *¡Hola!* Say it back (mic) | **hola** |
| 0:30 | Scratching, a bark, a puppy bursts in, does a lap and hides. Find him | **perro** |
| 1:30 | *¿Qué dice el perro?* Bark into the mic; he barks back | **guau** |
| 2:00 | *¡Saluda a Canelo!* (he waves a paw), *¿Qué es?*, he barks at a bird | hola, perro, guau |
| 3:30 | Mamá: *¡ven!*, he runs to her; your turn, three tries; *¡Canelo es tu perro!* He follows you | **ven** ×4 |
| 6:00 | Out the door (call him); the plaza; tapping animals shows "?" bubbles with their cries; Canelo chases a butterfly (call him) | ven |
| 8:00 | The park: Nico, a cat on the fence; *¡Un gato!*, *¡miau!*; Nico's sound game; the cat bolts, Canelo chases (call him); find the hidden cat | **gato**, **miau** |
| 14:00 | Free play: tap animals, Canelo's menu; Mamá's sun bubble says the story goes on tomorrow | |

Six new words, 17 questions with the mic plus Canelo's menu, and Canelo at your heels from about minute 5. *Sí/no*
wait for day 2 on purpose: they need things to ask about, and Don Pepe's game asks about Canelo and the cat.

### 3.3 All sessions
| session | chapters | new | new words | what the child does (about 15 min) | review that day (besides the chapter) | waits for tomorrow |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | C1, C2 | 6 | hola, perro, guau, ven, gato, miau | Canelo arrives and becomes yours; Nico and the cat (§3.2) | Canelo's *ven* | C3 (a morning chapter) |
| 2 | C3, C4 | 6 | buenos días, hueso, siéntate, sí, no, manzana | morning: *siéntate* earns the bone; Don Pepe's *¿Sí o no?* game; an apple for Abuela Rosa | daily greetings begin; Nico's sound game as a favor | C5 (Sofía's ball bubble with a sun) |
| 3 | C5, C6 | 6 | pelota, rojo, pan, gracias, pato, cuac | Sofía's red ball and Canelo's own ball; bread for the ducks | the first page puzzle, *Saludos* (Don Pepe shows how); feed-the-ducks side job | C7 (a morning chapter) |
| 4 | C7 | 5 | parque, banco, fuente, granja, cabra | Canelo runs away: four clues, four places, *¡ven!* at the barn | first favores; the *Mi perro* page puzzle at Canelo's cushion | C8 |
| 5 | C8, C9 | 6 | escuela, bien, ¿cómo estás?, agua, cama, buenas noches | Luna's school; ask three friends *¿cómo estás?*; the first evening at home | *palabra del día* starts; Canelo's water side job | C10 |
| 6 | C10 | 5 | cansado, carta, casa, caballo, adiós | Tomás's three letters; the horse eats one | evening routine; pet the horse | C11 |
| 7 | C11 | 5 | gallina, huevo, uno, dos, blanco | Abuela Rosa's hens and eggs | *El pueblo* page; the hens' egg side job | C12 |
| 8 | C12 | 5 | plátano, naranja, por favor, tres, cuatro | Mamá's shopping list at Pepe's (a short errand: more time for favores) | counting favores; *La granja* and *La comida* pages | C13 |
| 9 | C13 | 5 | panadería, queso, leche, cinco, seis | the picnic: five stops, a blanket in the park, sunset (the longest errand) | *Los números* page | C14 |
| 10 | C14 | 5 | dame la pata, salta, galleta, azul, feliz | the dog show: teach two tricks, show four from picture signs, four ribbons | Canelo's menu now has 4 tricks | C15 |
| 11 | C15 | 5 | triste, flor, rosado, amarillo, mariposa | Lucía's flowers; flowers become daily presents | flower presents | C16 |
| 12 | C16 | 4 | biblioteca, busca, árbol, conejo | the wind scatters the notebook; Canelo learns *¡busca!*; the library becomes the page-puzzle hub | *Los colores*, *Así me siento* pages; *busca* now finds favor targets | C17 |
| 13 | C17 | 5 | rana, croac, verde, pájaro, gira | Nico's sound game around town | *Los animales*, *En la plaza y el parque* pages | C18 |
| 14 | C18 | 3 | pez, siete, ocho | count the town with Luna (lighter: more review) | *¿Qué dicen?* page | C19 (a morning chapter) |
| 15 | C19 | 2 | nueve, diez | call every animal to the farm with *¡ven!*; count to *diez* | | C20 |
| 16 | C20 | 0 | | party preparations: invitations, food, ribbons, rehearsal | everything | C21 |
| 17 | C21 | 0 | | the animal party, the group photo, the diploma | everything | |

After the party the town keeps going: favores, side jobs, page puzzles and the *palabra del día* until words are solid
(3 stars on 2+ days); the diploma counts them. At 3 sessions a week this is about 6 weeks, in line with the 4-6 weeks
`LEARNING_RESEARCH.md` §1 expects for this many words.

---

## 4. The errands, step by step

Each chapter is a short story whose steps are moved by understanding the word: Canelo comes because you said *ven*,
the letter reaches the house because you walked to *la casa*. The quiz-like moments are things the people in the
story need ("¿Qué quiere el caballo?") or games they play with you (Pepe's *¿Sí o no?*, Nico's sounds, Luna's
counting). Where an old errand exists, *built from* names it.

| chapter | title | giver | session | new | new words | answers in it | of them older words |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | ¡Un perro! | Mamá | 1 | 4 | hola, perro, guau, ven | 6 | 0 (0%) |
| C2 | El gato de la cerca | Nico | 1 | 2 | gato, miau | 11 | 6 (54%) |
| C3 | ¡Buenos días, Canelo! | Mamá | 2 | 3 | buenos días, hueso, siéntate | 6 | 1 (16%) |
| C4 | El juego de Don Pepe | Don Pepe | 2 | 3 | sí, no, manzana | 12 | 4 (33%) |
| C5 | La pelota roja | Sofía | 3 | 2 | pelota, rojo | 11 | 8 (72%) |
| C6 | Pan para los patos | Marta, then Nico | 3 | 4 | pan, gracias, pato, cuac | 14 | 4 (28%) |
| C7 | ¿Dónde está Canelo? | Mamá; Gómez, Nico, Lucía, Tomás | 4 | 5 | parque, banco, fuente, granja, cabra | 24 | 16 (66%) |
| C8 | La escuela de Luna | Mamá, then Profesora Luna | 5 | 3 | escuela, bien, ¿cómo estás? | 13 | 4 (30%) |
| C9 | ¡Buenas noches, Canelo! | Mamá | 5 | 3 | agua, cama, buenas noches | 5 | 1 (20%) |
| C10 | Tomás está cansado | Tomás | 6 | 5 | cansado, carta, casa, caballo, adiós | 20 | 14 (70%) |
| C11 | Los huevos de Rosa | Abuela Rosa | 7 | 5 | gallina, huevo, uno, dos, blanco | 16 | 7 (43%) |
| C12 | El mercado de Mamá | Mamá, then Don Pepe | 8 | 5 | plátano, naranja, por favor, tres, cuatro | 18 | 10 (55%) |
| C13 | El día de campo | Abuela Rosa | 9 | 5 | panadería, queso, leche, cinco, seis | 36 | 28 (77%) |
| C14 | El show de perros | Sofía; Luna judges | 10 | 5 | dame la pata, salta, galleta, azul, feliz | 29 | 19 (65%) |
| C15 | Las flores de Lucía | Lucía | 11 | 5 | triste, flor, rosado, amarillo, mariposa | 19 | 12 (63%) |
| C16 | Las páginas perdidas | Inés and Señor Gómez | 12 | 4 | biblioteca, busca, árbol, conejo | 30 | 22 (73%) |
| C17 | ¿Qué dicen? | Nico | 13 | 5 | rana, croac, verde, pájaro, gira | 28 | 19 (67%) |
| C18 | ¿Cuántos animales? (el pueblo) | Profesora Luna | 14 | 3 | pez, siete, ocho | 31 | 25 (80%) |
| C19 | ¡Todos a la granja! | Profesora Luna | 15 | 2 | nueve, diez | 35 | 31 (88%) |
| C20 | Preparamos la fiesta | Profesora Luna; everyone | 16 | 0 | — | 62 | 62 (100%) |
| C21 | La fiesta de los animales | Profesora Luna; everyone | 17 | 0 | — | 48 | 48 (100%) |

*Answers in it* counts every card question and every find-it/listen-and-point use after the introductions;
*older words* are those met in earlier chapters.

### C1 · ¡Un perro!
*Mamá* · home · session 1 · about 6 min · built from: story.js mamaIntro + pet.js start: Canelo is yours in the first minutes

- **New (4):** *hola*, *perro*, *guau*, *ven*
- **Reviews (older words picked or said here):** none yet (the first words)
- **Mic:** 8 word-card questions, each with the mic.
- **Understanding moves it:** Canelo only comes when you say *ven*; he barks back or waves a paw for the other words, so the right word is the one that makes the thing happen.

1. You wake up at home. Mamá waves: *¡Hola, {name}!* One card, **hola**, to say back (mic) or tap. The bootstrap word: nothing else is known yet.
2. A scratching at the door and a bark (sound only). Mamá opens it: a brown puppy tumbles in, does a lap of the room and hides. Mamá: *¡Un perro! ¿Y el perro?* Three hiding spots, one tail wags: tap it. He pops out: *¡El perro!*
3. He barks. Mamá: *El perro dice ¡guau!* Then *¿Qué dice el perro?* [**guau** · hola · perro]. Say it and he barks back at your voice.
4. Mamá: *¡Se llama Canelo! ¡Saluda a Canelo!* He lifts a paw (a wave picture, no word): [**hola** · perro · guau].
5. Mamá points at him: *¿Qué es?* [**perro** · hola · guau].
6. He runs to the window and barks at a bird. Mamá: *¿Qué dice Canelo?* [**guau** · hola · perro].
7. Mamá, from the far corner: *Canelo... ¡ven!* He dashes to her; again from the window. *¡Ahora tú!* He romps off: [**ven** · hola · guau]. *hola*: he waves a paw but stays; *guau*: he barks back but stays; *ven*: he races to you and jumps up (a heart). Try 1 of 3.
8. Tries 2 and 3 (he wanders off between; the prompt shows him far away, no word): [**ven** · perro · hola], [**ven** · guau · hola]. Confetti: *¡Canelo es tu perro!* He follows you from now on. Mamá gives you the notebook: the *Saludos*, *Mi perro*, *Los animales* and *¿Qué dicen?* pages appear, holding today's words.
9. At the door Canelo dawdles at his bowl; call him to go out: [**ven** · hola · perro].

### C2 · El gato de la cerca
*Nico* · the plaza and the park fence · session 1 · about 8 min · built from: new short errand (the cat already naps on the fence: ambient.js)

- **New (2):** *gato*, *miau*
- **Reviews (older words picked or said here):** hola, perro, guau ×2, ven ×2
- **Mic:** 9 word-card questions, each with the mic.
- **Understanding moves it:** The cat is found by her sound word; *ven* brings Canelo back from the chase.

1. Outside. Tapping an animal you haven't met shows a **?** bubble with its cry and no word. Canelo chases a butterfly across the plaza; call him back (his menu or the mic): [**ven** · hola · guau].
2. The hand points to the park. Nico waves (no word): [**hola** · ven · perro]. Nico: *¡Hola! Soy Nico. ¡Un perro! ¿Qué dice?* [**guau** · hola · ven].
3. Canelo barks at the fence: a cat arches her back, *¡Miau!* Nico: *¡Un gato!* Then *¿Qué es?* [**gato** · perro · guau].
4. Nico: *El gato dice ¡miau!* Then *¿Qué dice el gato?* [**miau** · guau · hola]. Say it: she meows back.
5. Nico's sound game (listen and point): he says a sound word, no picture, and you tap who makes it on the map: *¡miau!* (the cat; then *¿Quién es?* [**gato** · perro · hola]), *¡guau!* (Canelo), *¡miau!* again.
6. The cat jumps down and bolts; Canelo chases her: [**ven** · hola · gato].
7. Nico: *¿Y el gato?* She hid: three bushes, one tail. Tap it.
8. Nico points at her: *¿Qué es?* [**gato** · perro · miau]; then at Canelo: [**perro** · gato · guau].
9. Nico waves; a sun bubble over the next errand giver means *tomorrow*. Free play: tapping animals (the dog and the cat now say their names), Canelo's menu, Nico's sound game again as a favor.

### C3 · ¡Buenos días, Canelo!
*Mamá* · home, morning · session 2 · about 6 min · built from: day.js morning + pet.js teach("sientate")

- **New (3):** *buenos días*, *hueso*, *siéntate*
- **Reviews (older words picked or said here):** ven
- **Mic:** 9 word-card questions, each with the mic.
- **Understanding moves it:** Canelo only stops jumping and gets his bone when you say *siéntate*.

1. Morning. Mamá opens the curtains and the sun streams in: *¡Buenos días, {name}!* [**buenos días** · ven · gato] (*hola* is never a card here: it would be right too).
2. Canelo stretches on his cushion. Tap him: the prompt is the sun and Canelo, no word: [**buenos días** · ven · guau].
3. Mamá holds up a bone; Canelo bounces: *¡Un hueso!* Then *¿Qué es?* [**hueso** · gato · perro].
4. Mamá: *Canelo... ¡siéntate!* He sits and gets the bone; again for a pat. *¡Ahora tú!* She gives you a bone and Canelo jumps at you: [**siéntate** · ven · guau] (*ven*: he jumps up and you both topple over; *guau*: he barks). Try 1 of 3.
5. He sits: *¿Qué le das?* [**hueso** · gato · hola]. Crunch.
6. Tries 2 and 3 of *siéntate*, each before a crumb (the prompt is Canelo bouncing, no word): [**siéntate** · ven · perro], [**siéntate** · guau · hola].
7. Mamá's bubble: Don Pepe's stall (his face and fruit; the fruit is not named yet). At the door Canelo dawdles: [**ven** · siéntate · hueso].
8. On the way, Nico's first daily greeting (sun picture, no word): [**buenos días** · gato · ven]. From now on everyone greets you once a day.

### C4 · El juego de Don Pepe
*Don Pepe* · his fruit stall on the plaza · session 2 · about 6 min · built from: maps.js pepeTalk: the sí/no lesson, now about known things only

- **New (3):** *sí*, *no*, *manzana*
- **Reviews (older words picked or said here):** hola, buenos días, hueso, siéntate
- **Mic:** 14 word-card questions, each with the mic; 1 picture-only picks (no mic).
- **Understanding moves it:** Pepe's game is played with *sí* and *no*; the apple reaches Rosa only if you pick it; Canelo sits only on *siéntate*.

1. Don Pepe's morning greeting (sun): [**buenos días** · perro · hueso].
2. Pepe pats Canelo: *¿Un perro?* He nods, thumbs up: *¡Sí!* Then to you, pointing at Canelo: *¿Un perro?* [**sí** · hola · guau].
3. The cat strolls past. Pepe points at her: *¿Un perro?* He shakes his head and laughs: *¡No! Un gato.* To you, pointing at the cat: *¿Un perro?* [**no** · sí · hola].
4. Pepe's game *¿Sí o no?*: a bone, *¿Un hueso?* [**sí** · no]; Canelo, *¿Un gato?* [**no** · sí]; the cat, *¿Un gato?* [**sí** · no].
5. Last round: Canelo is standing. *¿Siéntate?* [**no** · sí]. So tell him: [**siéntate** · ven · hola]. *¿Y ahora?* [**sí** · no].
6. Pepe holds up an apple: *¡Una manzana!* Then *¿Qué es?* [**manzana** · hueso · gato].
7. Abuela Rosa walks up and waves (no word): [**hola** · sí · gato]. She looks at the stall: *¿Una manzana?* Tap its picture [pictures: **manzana** · hueso · perro] and give it to her (she smiles: a heart; her *gracias* is still only a picture).
8. Pepe: *¿Una manzana para ti?* [**sí** · no]. *¿Y para Canelo?* [**no** · sí] (*¡Un hueso!* he laughs).
9. Canelo whines at your bag (the prompt is his face): *¿Qué quiere?* [**hueso** · manzana · gato].

### C5 · La pelota roja
*Sofía* · the park · session 3 · about 7 min · built from: maps.js sofiaTalk / findBall (Round A pelota), red only

- **New (2):** *pelota*, *rojo*
- **Reviews (older words picked or said here):** hola, ven ×2, siéntate, sí ×2, no ×2
- **Mic:** 11 word-card questions, each with the mic; 1 picture-only picks (no mic).
- **Understanding moves it:** Only the red ball makes Sofía happy; *pelota* throws Canelo's ball.

1. Sofía waves (no word): [**hola** · no · gato]. *¿Tu perro?* [**sí** · no].
2. Sofía throws a blue ball: *¡La pelota!* Canelo fetches it. She holds it up: *¿Qué es?* [**pelota** · hueso · manzana].
3. Your turn (Sofía mimes a throw, no word): [**pelota** · siéntate · ven]. You throw, he fetches.
4. He won't let go of it: [**siéntate** · hola · manzana]; then call him from across the lawn: [**ven** · pelota · hueso].
5. Sofía's own ball went over the fence: *Mi pelota... ¡roja!* (her bubble: a red ball). Three bushes hide a blue, a green and a red ball (their colours are never named). At each: *¿Roja?* blue [**no** · sí], green [**no** · sí], red [**sí** · no]. Bring the red one: *¡Roja!*
6. She holds up both balls: *¿La pelota roja?* [pictures: **rojo** · pelota] (two pictures: the red ball and the blue ball; no colour words on the cards).
7. She keeps the red one and gives the blue one to Canelo: *¡Para Canelo!* His care cards now have *la pelota*. He runs off with it: [**ven** · pelota · hola]; throw it again: [**pelota** · hueso · siéntate].

### C6 · Pan para los patos
*Marta, then Nico* · the bakery door, then the farm pond · session 3 · about 10 min · built from: errands.js ducksJob (feed the ducks), grown into an errand

- **New (4):** *pan*, *gracias*, *pato*, *cuac*
- **Reviews (older words picked or said here):** hola, guau, buenos días, siéntate
- **Mic:** 15 word-card questions, each with the mic.
- **Understanding moves it:** The ducks only come for the bread; *siéntate* keeps Canelo out of the pond.

1. Marta at the bakery door, morning greeting: [**buenos días** · no · pelota].
2. Marta holds out a loaf: *¡Pan!* Then *¿Qué es?* [**pan** · manzana · pelota].
3. Abuela Rosa comes out with bread and says *¡Gracias!*; Marta beams: *¡De nada!* Then Marta holds a loaf out to you: *¡Para ti!* [**gracias** · hola · no].
4. Rosa, leaving: *¿Qué tienes?* [**pan** · manzana · pelota]. Marta adds a second loaf, for the ducks: [**gracias** · hola · no].
5. Marta points east: a bubble with ducks (picture only). Through the farm gate, *¡Cuac, cuac!*; Nico is at the pond and waves: [**hola** · sí · pan]. Nico: *¡Un pato!* Then *¿Qué es?* [**pato** · perro · pelota] (never *gato* with *pato*).
6. Nico: *El pato dice ¡cuac!* Then *¿Qué dice el pato?* [**cuac** · miau · guau]. *¿Quién dice cuac?* [**pato** · perro · pelota].
7. The ducklings paddle up: *¿Qué dicen?* [**cuac** · miau · guau]. *¿Qué le das al pato?* [**pan** · hueso · manzana]. Crumbs and splashes.
8. Canelo crouches to jump in after them. Nico: *¡No, Canelo!* [**siéntate** · ven · pan].
9. Nico shares his crumb bag: *¡Para ti!* [**gracias** · sí · hola].
10. Nico's sound game at the pond: *¡cuac!* (tap a duck), *¡guau!* (Canelo), *¡cuac!* (a duckling in the reeds).
11. A duckling paddles up: *¿Qué es?* [**pato** · pelota · perro].
12. Back at the bakery Marta gives you a loaf for tomorrow: [**gracias** · hola · no]. Feeding the ducks is now a daily side job.

### C7 · ¿Dónde está Canelo?
*Mamá; Gómez, Nico, Lucía, Tomás* · home, plaza, park, fountain, barn · session 4 · about 14 min · built from: errands.js canelo: the same clue chain, with the places introduced one at a time

- **New (5):** *parque*, *banco*, *fuente*, *granja*, *cabra*
- **Reviews (older words picked or said here):** hola ×4, perro ×4, guau, ven, buenos días, hueso, siéntate, no, pelota ×2
- **Mic:** 23 word-card questions, each with the mic; 1 picture-only picks (no mic).
- **Understanding moves it:** Every clue is a place word: walking to the right place is the answer; *¡ven!* is what opens the barn.

1. Morning, Mamá (sun): [**buenos días** · no · pan]. Canelo barks at the door and runs out! *¿Y Canelo?* (quest card: a dog and "?").
2. On the plaza Señor Gómez waves: [**hola** · gracias · no]. Ask him (a question bubble, no word): *¿Y mi...?* [**perro** · gato · hueso]. Gómez: *¡El parque!* Picture bubbles float over three ways out of the plaza (the park, the school road, the farm road), with no words. Walk to the park.
3. Arriving, the place banner asks its name: [**parque** · perro · gato].
4. Paw prints. Nico: [**hola** · sí · no]. *¿Y mi...?* [**perro** · pato · hueso]. Nico: *¡El banco!* Bubbles over a bench, a tree and the pond (pictures only). Walk to the bench.
5. Banner: [**banco** · pan · gato]. On the bench, Canelo's bone: *¿Qué es?* [**hueso** · pan · pelota]. Into the bag.
6. Lucía at the park gate (first meeting): [**hola** · sí · pan]. *¿Canelo? ¿En el parque?* [**no** · sí]. *¡No! ¡La fuente!* Bubbles over the fountain, Don Pepe's stall and a bench. Walk to the fountain.
7. Banner: [**fuente** · banco · parque]. His ball bobs in the water: *¿Qué es?* [**pelota** · pan · hueso]. The fish jumps (a **?** bubble: you'll meet it later).
8. Tomás on his round: [**hola** · no · gracias]. *¿Y mi...?* [**perro** · gato · pelota]. Tomás: *¡La granja!* The barn bubble, east. Walk through the farm gate (Tomás comes along).
9. Banner: [**granja** · fuente · parque]. The barn door barks, *¡Guau, guau!*: *¿Quién es?* [pictures: **perro** · gato · pato].
10. **Say *¡ven!*** (the big mic moment of the errand; the cards are there too): [**ven** · siéntate · hola]. Canelo bursts out, dancing, and a goat trots after him. Tomás: *¡Una cabra!* Then *¿Qué es?* [**cabra** · perro · pato].
11. Canelo wants to chase her: [**siéntate** · ven · pelota]. Walk her back to the paddock gate; she bleats at it: *¿Qué es?* [**cabra** · gato · perro].
12. Home. Mamá hugs Canelo. Tell her the story with the photos the game took on the way (each photo is a picture, no word): *¿Y la pelota?* [**fuente** · parque · granja]; *¿Y el hueso?* [**banco** · fuente · granja]; *¿Y Canelo?* [**granja** · parque · fuente].
13. Canelo gets his ball back: throw it [**pelota** · hueso · ven]. A heart.

### C8 · La escuela de Luna
*Mamá, then Profesora Luna* · home, the school, three friends · session 5 · about 10 min · built from: maps.js lunaTalk + the Saludos errand, which now asks three friends ¿cómo estás?

- **New (3):** *escuela*, *bien*, *¿cómo estás?*
- **Reviews (older words picked or said here):** hola, buenos días, pelota, gracias
- **Mic:** 15 word-card questions, each with the mic.
- **Understanding moves it:** Asking *¿cómo estás?* is the errand: each friend's answer ticks a face off Luna's card.

1. Morning, Mamá (sun): [**buenos días** · no · hueso]. *¡La escuela!* Bubbles over the school, the park and the farm road (pictures only). Walk there.
2. Banner: [**escuela** · parque · granja].
3. Profesora Luna: [**hola** · no · pan]. She asks Nico (overheard): *Nico, ¿cómo estás?* Nico, thumbs up: *¡Bien!*
4. Luna: *{name}, ¿cómo estás?* (a thumbs-up face beside her) [**bien** · hola · no] (never *ven* in a question with *bien*).
5. Luna: *¡Pregúntale a Canelo!* (a question bubble, no word) [**¿cómo estás?** · hola · gracias]. Canelo wags: *¡Guau!* Luna: *¿Cómo está Canelo?* [**bien** · no · hola].
6. Luna's errand: *¡Pregunta a tres amigos!* (three faces). Nico in the park: ask [**¿cómo estás?** · hola · gracias]; he answers with a face and *¡Bien!*; the errand card asks *¿Cómo está Nico?* [**bien** · no · sí].
7. Sofía in the park: [**¿cómo estás?** · hola · gracias]; *¿Cómo está Sofía?* [**bien** · no · sí]. She asks you back: *¿Cómo estás?* [**bien** · pelota · no]; then Canelo wants his ball: [**pelota** · hueso · siéntate].
8. Abuela Rosa at her door: [**¿cómo estás?** · hola · gracias]; *¿Cómo está Rosa?* [**bien** · no · hola].
9. Back to Luna: *¡Tres amigos!* (three fingers; *tres* is still a picture). A gold star sticker: *¡Para ti!* [**gracias** · hola · no]. From now on Luna is here every day with her *palabra del día*.

### C9 · ¡Buenas noches, Canelo!
*Mamá* · home, evening · session 5 · about 4 min · built from: day.js evening at home (the sunset comes early when this chapter is due)

- **New (3):** *agua*, *cama*, *buenas noches*
- **Reviews (older words picked or said here):** buenos días
- **Mic:** 7 word-card questions, each with the mic.
- **Understanding moves it:** Water, the bed and *buenas noches* put Canelo to sleep and end the day.

1. The sky turns orange; a moon bubble over home. Canelo pants at his empty bowl. Mamá fills it: *¡Agua!* Then *¿Qué quiere Canelo?* [**agua** · hueso · pan].
2. He laps it all up and looks at you, still panting: [**agua** · hueso · pelota].
3. Mamá: *Canelo, ¡a la cama!* He trots to his cushion. *¿Y tu cama?* Bubbles over your bed, the table and the door (pictures only): tap your bed.
4. Canelo hops off again, wide awake. The prompt is his cushion and an arrow, no word: [**cama** · ven · pelota].
5. Mamá tucks you in: *¡Buenas noches, {name}!* (the moon) [**buenas noches** · buenos días · ven].
6. Say it to Canelo (the moon and Canelo yawning, no word): [**buenas noches** · buenos días · agua]. *z z z*.
7. The *Hoy* card. Next morning Canelo hops up (sun): [**buenos días** · buenas noches · cama]; his bowl is empty again: [**agua** · hueso · pelota]. Filling it from the fountain is now a daily side job.

### C10 · Tomás está cansado
*Tomás* · the plaza bench, Rosa's house, the school, the paddock · session 6 · about 14 min · built from: errands.js cansado: letters to Rosa, the school and the farm; the horse eats one

- **New (5):** *cansado*, *carta*, *casa*, *caballo*, *adiós*
- **Reviews (older words picked or said here):** hola, ven, sí, manzana, gracias, fuente, granja, cabra, escuela, bien, ¿cómo estás? ×2, agua, cama
- **Mic:** 22 word-card questions, each with the mic.
- **Understanding moves it:** Each letter goes where its word says; the apple (picked by word) gets the letter back from the horse.

1. Tomás sits by the plaza bench, his bag on the ground: [**hola** · no · agua]; ask him [**¿cómo estás?** · gracias · hola]. He yawns, eyes droop: *Mmm... cansado.* Then *¿Cómo está Tomás?* [**cansado** · bien · no].
2. Canelo flops down beside him and yawns too: *¿Y Canelo?* [**cansado** · bien · no].
3. *¿Qué quiere Tomás?* He fans himself and licks his lips: [**agua** · hueso · pelota]. Fill a bottle at the fountain (banner [**fuente** · banco · parque]) and give it to him: a heart.
4. He holds up an envelope: *Una carta.* Then *¿Qué es?* [**carta** · pan · pelota]. *¿Me ayudas?* [**sí** · no]. Three letters into your bag, each with its stamp picture.
5. Letter 1: *Para la casa de Rosa.* Bubbles over Rosa's house, the school and the bakery (pictures only). Walk there.
6. Banner: [**casa** · escuela · parque] (never *cama* in the same question). Rosa: *¿Para mí? ¿Qué es?* [**carta** · pan · hueso]. *¡Gracias!* She gives you an apple: [**gracias** · hola · no].
7. Letter 2: *Para la escuela* (no picture now: the word is known). Walk there. Luna: *¿Qué es?* [**carta** · pelota · pan].
8. Letter 3: *Para la granja* (no picture). Walk there. At the paddock gate the horse trots up and eats the letter! Nico, feeding the goat: *¡El caballo!* Then *¿Qué es?* [**caballo** · cabra · pato].
9. Nico, laughing (a munched-letter picture): *¿Quién come cartas?* [**caballo** · cabra · perro]. *¿Qué quiere el caballo?* He sniffs your bag: [**manzana** · hueso · pan]. Rosa's apple: he drops the letter.
10. Now the goat nibbles it: *¿Quién es?* [**cabra** · caballo · perro]; Canelo shoos her: [**ven** · siéntate · hola]. Post the letter in the barn's box.
11. Back to Tomás, now rested: ask [**¿cómo estás?** · hola · gracias]; *¡Bien!*; *¿Cómo está Tomás?* [**bien** · cansado · no]. He heads off on his round, waving: *¡Adiós!* Wave back: [**adiós** · hola · gracias].
12. Nico walks past and off, waving (no word): [**adiós** · hola · bien]. Mamá at bedtime: *¡A la cama!* [**cama** · agua · pelota].

### C11 · Los huevos de Rosa
*Abuela Rosa* · her house and the henhouse · session 7 · about 10 min · built from: errands.js eggJob (the hens' egg), grown into an errand

- **New (5):** *gallina*, *huevo*, *uno*, *dos*, *blanco*
- **Reviews (older words picked or said here):** ven, buenos días, hueso, siéntate, sí, gracias, casa
- **Mic:** 17 word-card questions, each with the mic.
- **Understanding moves it:** The eggs are found by following Rosa's words: the white hen, the nest with *dos*.

1. Rosa at her door, an egg in her bubble (a picture: *huevo* is not met yet). Banner [**casa** · escuela · parque]. Greeting (sun): [**buenos días** · buenas noches · cama]. *¿Me ayudas?* [**sí** · no].
2. At the henhouse: *¡Coc, coc!* Rosa: *¡Una gallina!* Then *¿Qué es?* [**gallina** · pato · cabra].
3. Rosa holds up an egg: *Un huevo.* Then *¿Qué es?* [**huevo** · pan · manzana]. *¿Quién pone huevos?* [**gallina** · pato · cabra].
4. Rosa sets the egg in a nest: *¿Qué es?* [**huevo** · pan · manzana]. One finger, one egg: *¡Uno!* Two nests on the shelf, one egg and two eggs (pictures, no number words): *¿Uno?* Tap the nest.
5. A second egg in the straw: *¡Dos!* (two fingers). *¿Dos?* Tap the nest with two eggs.
6. *¿Cuántos huevos?* [**dos** · uno]. *¿Cuántas gallinas?* [**dos** · uno]. *¿Cuántos perros?* [**uno** · dos] (two cards while only two numbers are known).
7. Search the hay bales. What you find: Canelo's buried bone, *¿Qué es?* [**hueso** · pan · pelota]; an egg, [**huevo** · pan · manzana] (never *hueso* and *huevo* in one question).
8. *La gallina blanca...* One hen is white, one brown (colours never named). The white one sits on something: tap her. She flaps up: an egg! *¡Blanca!*
9. *¿De qué color?* (the new egg) [**blanco** · rojo · pan]. *¿Cuántas gallinas blancas?* [**uno** · dos].
10. Canelo barks and the hens scatter: [**siéntate** · ven · cama]. One hen ran to the plaza: *¿Y la gallina?* Find her (tap), then *¡ven!* (it works on hens too): [**ven** · hola · sí].
11. Rosa gives you an egg: *¡Para ti!* [**gracias** · hola · no]. The hens' egg is now a daily side job (give it to Rosa: a heart).

### C12 · El mercado de Mamá
*Mamá, then Don Pepe* · home and the fruit stall · session 8 · about 8 min · built from: maps.js El mercado (Round A), numbers now three and four

- **New (5):** *plátano*, *naranja*, *por favor*, *tres*, *cuatro*
- **Reviews (older words picked or said here):** hola, sí ×2, no, rojo, gracias, agua, carta, casa, adiós
- **Mic:** 22 word-card questions, each with the mic.
- **Understanding moves it:** Pepe only hands over fruit you name and ask for with *por favor*; the numbers fill Mamá's list.

1. Mamá hands you her list (pictures: three bananas, four oranges, not named yet). First Canelo's bowl: [**agua** · hueso · pelota]. *¿Me ayudas?* [**sí** · no]. Tomás left a letter on the table: *¿Qué es?* [**carta** · pan · pelota].
2. Don Pepe: [**hola** · adiós · gracias]. He holds up fruit: *¡Un plátano!* Then *¿Qué es?* [**plátano** · manzana · pan].
3. *¡Una naranja!* Then *¿Qué es?* [**naranja** · manzana · plátano]. He holds up the banana again: [**plátano** · naranja · manzana].
4. Marta walks up: *¡Una manzana, por favor!* Pepe hands it over at once. Your turn: *Tú: ¡Plátanos...!* [**por favor** · gracias · hola].
5. Pepe counts bananas onto the counter: *uno, dos... ¡tres!* Then *¿Cuántos plátanos?* (the list shows three) [**tres** · dos · uno].
6. *¿Qué más?* [**naranja** · plátano · manzana]; [**por favor** · gracias · adiós]. Pepe counts: *uno, dos, tres... ¡cuatro!* Then *¿Cuántas naranjas?* [**cuatro** · tres · dos].
7. *¿Y los plátanos? ¿Cuántos?* [**tres** · cuatro · dos]. *¿Y las naranjas?* [**cuatro** · tres · dos].
8. A gift: three apples. *¿Cuántas manzanas?* [**tres** · dos · cuatro]; *¿De qué color?* [**rojo** · blanco · plátano].
9. He hands over the bag: [**gracias** · por favor · hola]. He waves: [**adiós** · hola · por favor].
10. Home (walk: the word *casa*, no picture). Mamá unpacks: *¿Qué es?* [**plátano** · naranja · manzana], [**naranja** · plátano · pan]. Canelo begs: *¿Un plátano para Canelo?* [**no** · sí]; *¿Un hueso?* [**sí** · no].

### C13 · El día de campo
*Abuela Rosa* · bakery, stall, hens, paddock, fountain, then a picnic in the park · session 9 · about 17 min · built from: errands.js picnic: cheese and milk are new; bread, egg and water are now known

- **New (5):** *panadería*, *queso*, *leche*, *cinco*, *seis*
- **Reviews (older words picked or said here):** hola, hueso, sí, pan ×2, gracias, pato, parque, banco, fuente, granja, cabra, bien, ¿cómo estás?, agua ×2, buenas noches, cansado, casa, caballo, adiós, gallina, huevo ×2, blanco, plátano, por favor, cuatro
- **Mic:** 33 word-card questions, each with the mic.
- **Understanding moves it:** Each stop gives its food only when you name it; the picnic starts when the basket holds *cinco*.

1. Rosa: [**hola** · adiós · gracias]; ask her [**¿cómo estás?** · hola · por favor]: *¡Bien!* *¿Cómo está Rosa?* [**bien** · cansado · no]. Her picnic list (pictures): bread, cheese, an egg, milk, water, a banana. *¿Me ayudas?* [**sí** · no].
2. *El pan... ¡la panadería!* Bubbles over the bakery, the library and the school (pictures). Walk there.
3. Banner: [**panadería** · casa · escuela]. Marta: *¿Qué quieres?* [**pan** · manzana · huevo]; she waits: [**por favor** · gracias · adiós]; she hands it over: [**gracias** · por favor · hola].
4. Don Pepe holds up a wedge: *¡Un queso!* Then *¿Qué es?* [**queso** · pan · huevo].
5. Pepe: *¿Y fruta?* (the list shows a banana): [**plátano** · naranja · manzana].
6. On the way, *¿Dónde está Señor Gómez?* [**banco** · fuente · granja] (he's on a park bench). He asks *¿Qué tienes?* (the newest thing in your bag) [**queso** · pan · plátano].
7. The hay by the hens: *¿Qué es?* (the white hen clucks) [**gallina** · pato · cabra]; find the egg [**huevo** · pan · queso]; *¿De qué color?* [**blanco** · rojo · queso].
8. On to the farm (the word *granja*, no picture). The ducks paddle by: [**pato** · perro · pelota]. At the paddock the horse peeks over: [**caballo** · cabra · pato]. Nico holds the goat's pail: *La cabra... ¡leche!* Then *¿Qué es?* [**leche** · agua · queso].
9. *¡Miau!* The cat on the fence wants some: *¿Qué quiere el gato?* [**leche** · agua · pan]. *¿Quién da leche?* [**cabra** · caballo · gallina].
10. The fountain: banner [**fuente** · banco · granja]; fill Rosa's bottle: *¿Qué es?* [**agua** · leche · queso].
11. Back to Rosa (the word *casa*, no picture): she counts the basket: *uno, dos, tres, cuatro... ¡cinco!* Then *¿Cuántos?* [**cinco** · cuatro · tres]. Canelo noses one out: *¿Y ahora?* [**cuatro** · cinco · tres]; he puts it back: [**cinco** · cuatro · tres].
12. Fade to a red checked blanket in the park (banner [**parque** · granja · fuente]). Rosa says each food and you tap it in the basket (hear it, pick the picture): pan, queso, huevo, leche, agua.
13. Friends sit down (Mamá, Sofía, Nico, Rosa, you, Canelo); Rosa counts the plates: *...cinco, ¡seis!* Then *¿Cuántos?* [**seis** · cinco · cuatro]. *¿Cuántos amigos?* [**seis** · cinco · cuatro].
14. Five apple slices: *¿Cuántas?* [**cinco** · seis · cuatro]. Canelo begs (his face): *¿Qué quiere?* [**hueso** · queso · leche]. He ran around all afternoon: *¿Cómo está Canelo?* [**cansado** · bien · no].
15. The sun sets over the park. Rosa (moon): [**buenas noches** · buenos días · adiós]; everyone waves: [**adiós** · hola · gracias].

### C14 · El show de perros
*Sofía; Luna judges* · the park, the bakery, the show ring · session 10 · about 14 min · built from: errands.js show: tricks taught here; Luna shows picture signs, never the words

- **New (5):** *dame la pata*, *salta*, *galleta*, *azul*, *feliz*
- **Reviews (older words picked or said here):** hola, ven, siéntate ×2, sí, rojo, gracias, parque, bien, ¿cómo estás?, cama, buenas noches, cansado, blanco, naranja, por favor, tres, cuatro, panadería
- **Mic:** 32 word-card questions, each with the mic.
- **Understanding moves it:** Canelo does each trick only when you say it from Luna's picture sign; each ribbon is won by its colour.

1. Sofía, a ribbon in her bubble: [**hola** · adiós · gracias]; ask her [**¿cómo estás?** · hola · gracias]: *¿Cómo está Sofía?* [**bien** · cansado · no]. *¡Un show de perros! ¿Canelo?* [**sí** · no].
2. Warm-up: Sofía holds up a picture sign of a sitting dog (no word): [**siéntate** · ven · pelota].
3. Sofía: *Canelo, ¡dame la pata!* He puts a paw in her hand. Your turn (hold out your hand on screen): [**dame la pata** · siéntate · ven]. Try 1 of 3.
4. Tries 2 and 3 (a paw sign, no word): [**dame la pata** · siéntate · ven], [**dame la pata** · ven · hola].
5. Sofía jumps a little bar: *¡Salta!* Canelo jumps after her. *¡Salta tú también!* Your turn: [**salta** · dame la pata · siéntate].
6. Tries 2 and 3 of *salta*: [**salta** · ven · dame la pata], [**salta** · siéntate · hola].
7. Treats: *¡Galletas para Canelo!* Off to the bakery (the word, no picture). Marta holds one up: *¡Una galleta!* Then *¿Qué es?* [**galleta** · pan · queso].
8. Marta: *¿Cuántas?* (three) [**tres** · dos · cuatro]; [**por favor** · gracias · adiós]; [**gracias** · hola · adiós]. Pepe calls over: *¿Y fruta para el show?* [**naranja** · plátano · manzana]. Back at Sofía: *¿Qué tienes?* [**galleta** · pan · hueso].
9. The show (walk to the park: the word, no picture; Luna judges; Nico, Rosa, Gómez, Lucía and Don Pepe watch). Luna holds up a picture sign for each trick and you say it to Canelo: sit [**siéntate** · salta · dame la pata], paw [**dame la pata** · ven · salta], jump [**salta** · siéntate · dame la pata]; Canelo at the far end of the ring [**ven** · dame la pata · siéntate]. A treat after each: [**galleta** · hueso · pelota].
10. A ribbon after each trick. The 1st is red: *¿De qué color?* [**rojo** · blanco · galleta]. The 2nd: Luna: *¡Una cinta azul!* Then *¿De qué color?* [**azul** · rojo · blanco].
11. The 3rd is white [**blanco** · azul · rojo]; the 4th blue [**azul** · blanco · rojo].
12. *¡Canelo es el campeón!* Sofía jumps: *¡Estoy feliz!* Then *¿Cómo está Sofía?* [**feliz** · cansado · bien].
13. Canelo dances: *¿Y Canelo?* [**feliz** · cansado · bien]. *¿Cuántas cintas?* [**cuatro** · tres · cinco].
14. Home: Canelo is worn out: *¿Cómo está Canelo?* [**cansado** · feliz · bien]; *¡A la cama!* [**cama** · ven · pelota]; *¡Buenas noches!* [**buenas noches** · buenos días · adiós].

### C15 · Las flores de Lucía
*Lucía* · the plaza and flowers around town · session 11 · about 10 min · built from: errands.js flores: pink and yellow are the new colours; red, white and blue are known

- **New (5):** *triste*, *flor*, *rosado*, *amarillo*, *mariposa*
- **Reviews (older words picked or said here):** hola, sí ×2, no, rojo, banco, ¿cómo estás?, adiós, blanco, cinco, azul, feliz
- **Mic:** 22 word-card questions, each with the mic.
- **Understanding moves it:** Only flowers of the asked colours go into the bouquet.

1. Lucía on the plaza, a sad face: [**hola** · adiós · gracias]; ask her [**¿cómo estás?** · hola · por favor]. Tears: *Triste...* Then *¿Cómo está Lucía?* [**triste** · feliz · cansado].
2. Canelo nuzzles her hand; she sniffs: still [**triste** · feliz · cansado]. Her mom's birthday. She points at a flower bed: *Una flor...* Then *¿Qué es?* [**flor** · pelota · hueso].
3. *Una flor rosada.* (her bubble: a pink flower). Lucía tags along. Flowers grow around town; at each one *¿Qué es?* (the first) [**flor** · pelota · hueso], then *¿De qué color?*: red [**rojo** · azul · blanco], white [**blanco** · rojo · azul], blue [**azul** · blanco · rojo], each time *¿Para Lucía?* [**no** · sí]. The pink one: *¡Rosada!* *¿Para Lucía?* [**sí** · no].
4. *¿De qué color?* (the pink flower in your hand) [**rosado** · azul · blanco] (never *rojo* with *rosa*). Lucía sits on a bench to rest: *¿Dónde está Lucía?* [**banco** · fuente · granja].
5. *Y una flor amarilla.* Her bubble changes; find the yellow flower by the farm road: *¡Amarilla!*
6. A butterfly sits on it. Lucía: *¡Una mariposa!* Then *¿Qué es?* [**mariposa** · cabra · gato].
7. *¿De qué color?* (the yellow flower) [**amarillo** · azul · rojo].
8. The butterfly flutters off: *¿Dónde está la mariposa?* [**flor** · banco · fuente]. It lands on Canelo's nose; he sneezes: *¿Qué es?* [**mariposa** · cabra · gato].
9. The bouquet: *¿Cuántas flores?* (five) [**cinco** · cuatro · seis]. *¿Para mamá?* [**sí** · no].
10. Lucía runs home and back: *¡Gracias!* Then *¿Cómo está Lucía?* [**feliz** · triste · cansado]. Canelo whimpers (the butterfly is gone): *¿Y Canelo?* [**triste** · feliz · cansado].
11. She waves: [**adiós** · hola · gracias]. From now on flowers can be picked once a day as presents (*¿De qué color?* each time).

### C16 · Las páginas perdidas
*Inés and Señor Gómez* · the library and the park · session 12 · about 12 min · built from: new errand: the busca trick, and the library as the home of page puzzles

- **New (4):** *biblioteca*, *busca*, *árbol*, *conejo*
- **Reviews (older words picked or said here):** hola ×2, ven, siéntate ×2, manzana, gracias, banco, carta, adiós, huevo, naranja, por favor, panadería, queso, dame la pata, salta, galleta, triste, flor, rosado, mariposa
- **Mic:** 28 word-card questions, each with the mic.
- **Understanding moves it:** *¡Busca!* finds the lost cards; naming them puts them back in the notebook.

1. A book bubble over the library. Señor Gómez on the plaza: [**hola** · adiós · gracias]. *¿Inés? ¡La biblioteca!* Bubbles over the library, the bakery and the school (pictures). Walk there.
2. Banner: [**biblioteca** · panadería · escuela]. Inés whispers *Shhh...*; greet her in a whisper: [**hola** · adiós · gracias]. She looks sad: *¿Cómo está Inés?* [**triste** · feliz · cansado]. A gust through the window: picture cards fly out of your notebook toward the park. Ask her for help (a question bubble with the notebook): [**por favor** · gracias · adiós].
3. Gómez on the park bench (banner [**banco** · fuente · granja]): *Canelo... ¡busca!* Canelo sniffs a trail and barks at a card under a bush. *¡Ahora tú!* [**busca** · salta · ven]. Try 1 of 3.
4. Each card is a picture from your notebook; name it as it goes back in (picture, three word cards): [**manzana** · pan · huevo], [**naranja** · queso · manzana], [**queso** · huevo · pan], [**huevo** · manzana · naranja], [**carta** · pelota · flor], [**flor** · carta · hueso]. A pink flower card: *¿De qué color?* [**rosado** · azul · blanco].
5. Tries 2 and 3 of *busca* lead to the next cards: [**busca** · salta · siéntate], [**busca** · ven · dame la pata]. Gómez rewards Canelo: *¿Qué le das?* [**galleta** · hueso · pan] (Gómez: *¡Las galletas de la...?* [**panadería** · biblioteca · escuela]).
6. One card is stuck up a tree. Gómez: *¡El árbol!* Bubbles over a tree, a bench and the fountain. Tap the tree; Canelo barks up it and the card flutters down.
7. A rabbit sits on the last card on the lawn. Gómez: *¡Un conejo!* Then *¿Qué es?* [**conejo** · gato · perro].
8. It hops off and hides (only its ears show): *¿Dónde está el conejo?* [**árbol** · banco · fuente]. Canelo wants to chase it: [**siéntate** · busca · ven]; then he finds the card it dropped: [**busca** · salta · ven]. A butterfly on the card: [**mariposa** · conejo · gato].
9. Back at the library Inés lays out the *Mi perro* page: four pictures, four words (ven, siéntate, dame la pata, salta); all four right and the page gets its gold edge. Then the rabbit card: *¿Qué es?* [**conejo** · gato · cabra].
10. Inés, happy now: *¡Gracias!* and a bookmark for you: [**gracias** · hola · adiós]. She waves: [**adiós** · hola · gracias]. From now on any page puzzle can be redone here once a day for a star.
11. Outside Gómez asks: *¿De dónde vienes?* [**biblioteca** · panadería · escuela]. *¿Y el conejo?* [**árbol** · banco · fuente].

### C17 · ¿Qué dicen?
*Nico* · the park pond, a tree, the farm, the fence · session 13 · about 11 min · built from: errands.js sonidos: animals asked for by their sound, and sounds by their animal

- **New (5):** *rana*, *croac*, *verde*, *pájaro*, *gira*
- **Reviews (older words picked or said here):** hola, perro, guau, gato, miau ×2, pato, cuac ×2, parque, azul, feliz, triste, flor, amarillo, mariposa, biblioteca, árbol, conejo
- **Mic:** 28 word-card questions, each with the mic.
- **Understanding moves it:** Following a sound word to the right animal is the whole game.

1. Nico: [**hola** · adiós · gracias]. *¡Un juego! ¡Escucha!* He tags along (*¡Al parque!*: walk, no picture). A cry from the park pond: *¡Croac, croac!* Follow it: a frog on a lily pad. Nico: *¡Una rana!* Then *¿Qué es?* [**rana** · pato · conejo].
2. *La rana dice ¡croac!* Then *¿Qué dice la rana?* [**croac** · miau · guau] (never with *cuac*).
3. *La rana es... ¡verde!* Then *¿De qué color es la rana?* [**verde** · azul · rojo]. She hops to another pad: *¿Qué es?* [**rana** · pato · conejo]; she croaks: [**croac** · miau · guau].
4. *¡Pío, pío!* from a tree (the bird's cry; *pío* is not a vocabulary word). Nico: *¡Un pájaro!* Then *¿Qué es?* [**pájaro** · rana · conejo].
5. *¿Dónde está el pájaro?* [**árbol** · banco · flor]. *¿De qué color es el pájaro?* (a blue one) [**azul** · verde · blanco]. *¿Y el árbol?* [**verde** · azul · blanco].
6. Nico's sound game around town (he says a sound word; you find who makes it, then name it): *¡cuac!* at the farm pond [**pato** · rana · perro], and *¿De qué color es el patito?* [**amarillo** · blanco · verde]; *¡miau!* by the library door: *¿Dónde está el gato?* [**biblioteca** · panadería · escuela], [**gato** · conejo · pájaro]; *¡croac!* [**rana** · pato · perro]; the cry *¡Pío, pío!* [**pájaro** · rana · gato]. A rabbit hops by: [**conejo** · gato · rana]. *¿Quién no dice nada?* (a quiet butterfly) [**mariposa** · pájaro · rana]; *¿Dónde está?* [**flor** · banco · árbol].
7. The other way round: Nico points: *¿Qué dice el pato?* [**cuac** · miau · guau]; *¿Qué dice la rana?* [**croac** · miau · guau]; *¿Qué dice el gato?* [**miau** · guau · croac].
8. Last, Nico barks *¡guau, guau!* and Canelo answers with a dance: *¿Quién dice guau?* [**perro** · gato · rana].
9. Nico's prize: he spins: *Canelo... ¡gira!* Canelo spins after him. *¡Gira tú también!* Your turn: [**gira** · salta · busca].
10. Tries 2 and 3 of *gira*: [**gira** · dame la pata · ven], [**gira** · busca · siéntate]. *¿Cómo está Nico?* [**feliz** · triste · cansado]. The frog hops away and Canelo whines: *¿Y Canelo?* [**triste** · feliz · cansado].

### C18 · ¿Cuántos animales? (el pueblo)
*Profesora Luna* · the school and around town · session 14 · about 12 min · built from: errands.js cuenta, part 1: the town; the child says each next number

- **New (3):** *pez*, *siete*, *ocho*
- **Reviews (older words picked or said here):** hola, perro, gato, sí, escuela ×2, gallina, uno ×2, dos ×2, tres, cuatro, cinco, seis, flor, rosado, mariposa, árbol, conejo, rana ×2, croac, verde, pájaro
- **Mic:** 32 word-card questions, each with the mic.
- **Understanding moves it:** Each animal counts only once it is named and its number said.

1. *¡A la escuela!* (the word, no picture). Luna: [**hola** · adiós · gracias] and her *palabra del día*. *¿Cuántos animales hay en Villa Sol?* A clipboard. *¿Me ayudas?* [**sí** · no].
2. At the fountain the fish jumps. Luna: *¡Un pez!* Then *¿Qué es?* [**pez** · pato · rana].
3. Count the town: tap each animal, name it, then say the next number with Luna. Canelo [**perro** · gato · conejo] [**uno** · dos · tres]; the cat [**gato** · conejo · pez] [**dos** · uno · tres]; the fish [**pez** · rana · pájaro] [**tres** · dos · cuatro]; the frog [**rana** · conejo · pez] [**cuatro** · cinco · tres], *¿Qué dice?* [**croac** · miau · guau]; the rabbit [**conejo** · rana · gato] [**cinco** · cuatro · seis]; a bird in a tree [**pájaro** · pez · gato] [**seis** · cinco · cuatro], *¿Dónde está?* [**árbol** · banco · fuente].
4. The butterfly on a pink flower [**mariposa** · pájaro · pez]; *¿Dónde está?* [**flor** · árbol · banco]; *¿De qué color es la flor?* [**rosado** · azul · blanco]. Luna: *...seis, ¡siete!* Then *¿Cuántos?* [**siete** · seis · cinco].
5. Luna recounts on her fingers: *¿Cuántos?* [**siete** · seis · cinco].
6. Rosa's two hens: [**gallina** · pato · cabra]. Luna: *...siete, ¡ocho!* Then *¿Cuántos?* [**ocho** · siete · seis].
7. Back at school (the word, no picture), the clipboard (pictures, no words): *¿Cuántas gallinas?* [**dos** · tres · uno]; *¿Cuántos peces?* [**uno** · dos · tres]; *¿Y este?* [**pez** · pato · rana]; *¿Y este?* [**rana** · pato · pez]; *¿Cuántos animales?* [**ocho** · siete · seis].
8. *¿De qué color es la rana?* [**verde** · azul · blanco]. Luna gives you seven stickers, *¿Cuántas?* [**siete** · seis · ocho], then one more: [**ocho** · siete · seis]. Tomorrow: the farm (a sun bubble).

### C19 · ¡Todos a la granja!
*Profesora Luna* · the farm · session 15 · about 11 min · built from: errands.js cuenta, part 2: call each animal with ¡ven! and count it into the paddock

- **New (2):** *nueve*, *diez*
- **Reviews (older words picked or said here):** perro, ven ×2, gato, buenos días, manzana, pan, pato, granja, cabra, cansado, caballo, gallina, uno ×2, dos, tres ×2, cuatro, leche, cinco, seis, triste, busca, conejo, verde, pájaro, gira, pez, siete, ocho
- **Mic:** 36 word-card questions, each with the mic.
- **Understanding moves it:** *¡Ven!* brings each named animal into the paddock; the count is said, not shown.

1. Walk to the farm (the word, no picture). Luna at the gate (sun): [**buenos días** · buenas noches · adiós]. *¡Una fiesta en la granja! ¿Cuántos animales vienen?* Invite each animal: find it, name it, call it with *¡ven!* and it trots behind you like Canelo.
2. Count them into the paddock (pick the next number each time): Canelo [**perro** · gato · conejo] [**uno** · dos · tres]; the cat [**gato** · conejo · perro] [**dos** · tres · uno], [**ven** · hola · sí], and *¿Qué quiere?* [**leche** · agua · pan]; the rabbit [**conejo** · gato · rana] [**tres** · cuatro · dos], [**ven** · hola · sí]; two hens [**gallina** · pato · cabra] [**cuatro** · cinco · tres] [**cinco** · seis · cuatro]; three ducks [**pato** · gallina · perro] [**seis** · siete · cinco] [**siete** · ocho · seis] [**ocho** · siete · seis]. The fish can't come: *¿Quién no puede venir?* [**pez** · pato · rana]. A bird watches from the barn roof: [**pájaro** · gato · conejo]. *¿De qué color es el árbol?* [**verde** · azul · amarillo].
3. The horse [**caballo** · cabra · pato]: Luna: *...ocho, ¡nueve!* Then *¿Cuántos?* [**nueve** · ocho · siete].
4. The goat [**cabra** · caballo · perro]: *...nueve, ¡diez!* Then *¿Cuántos?* [**diez** · nueve · ocho].
5. A duckling wanders off: *¿Cuántos?* [**nueve** · diez · ocho]. It peeps alone in the wheat: *¿Cómo está el patito?* [**triste** · feliz · cansado]. *¡Busca!* [**busca** · gira · ven]: Canelo finds it. *¿Y ahora?* [**diez** · nueve · ocho].
6. The horse wanders off for a drink: *¿Cuántos?* [**nueve** · diez · ocho]; back: *¿Cuántos animales?* [**diez** · nueve · ocho]. Luna: *¿Cuántos patos?* [**tres** · dos · cuatro]; *¿Cuántos caballos?* [**uno** · dos · tres]. Canelo spins with joy: [**gira** · salta · busca].
7. *¿Qué come el caballo?* [**manzana** · pan · agua]; *¿Y los patos?* [**pan** · manzana · queso]. Everyone is worn out: *¿Cómo está Canelo?* [**cansado** · feliz · triste]. Luna gives you the party card for tomorrow.

### C20 · Preparamos la fiesta
*Profesora Luna; everyone* · all over town · session 16 · about 14 min · built from: errands.js fiestab, first half: invitations, food, ribbons, rehearsal

- **New (0):** none (all review)
- **Reviews (older words picked or said here):** hola, ven, buenos días, siéntate, sí, manzana, rojo, pan, pato, cuac, parque, banco, fuente, granja, cabra, escuela, ¿cómo estás?, agua, cama, buenas noches, cansado, carta ×2, casa, caballo, huevo, blanco, plátano, naranja, por favor, panadería, queso, leche, cinco, seis ×2, dame la pata, salta, galleta, azul, feliz ×2, triste, flor, rosado ×2, amarillo ×2, mariposa, biblioteca, busca, rana, croac, verde, pájaro, gira, pez, siete, ocho, nueve ×2, diez
- **Mic:** 62 word-card questions, each with the mic.
- **Understanding moves it:** Every invitation, food and ribbon is asked for or found by its word.

1. Five invitation cards from Luna: *¿Qué es?* [**carta** · flor · galleta]. Faces on her list; their place is named, not pictured: *¿Dónde está Marta?* [**panadería** · biblioteca · escuela]; *¿Y Inés?* [**biblioteca** · casa · panadería]; *¿Y Rosa?* [**casa** · escuela · parque]; *¿Y Sofía?* [**parque** · granja · casa]; *¿Y Gómez?* [**banco** · fuente · árbol]; *¿Y Lucía?* [**fuente** · banco · árbol]. *¿Y Luna?* [**escuela** · biblioteca · casa]. *¿Dónde es la fiesta?* [**granja** · parque · escuela].
2. At each: the time-of-day greeting (sun, moon or neither): [**buenos días** · buenas noches · hola], [**hola** · adiós · gracias]; the card: *¿Qué es?* [**carta** · galleta · flor]; *¿Para mí?* [**sí** · no]; ask [**¿cómo estás?** · hola · por favor]; their face: *¿Cómo está Rosa?* [**feliz** · triste · cansado]; *¿Y Tomás?* [**cansado** · feliz · bien]; Gómez wasn't on the list: [**triste** · feliz · cansado] (invite him too: [**feliz** · triste · cansado]). *¿Cuántas invitaciones?* [**cinco** · seis · cuatro].
3. Food for the party: Marta [**pan** · galleta · queso], [**galleta** · pan · leche], *¿Cuántas?* [**nueve** · ocho · diez], [**por favor** · gracias · adiós]; Don Pepe [**manzana** · plátano · naranja] *¿Cuántas?* [**ocho** · siete · nueve], [**plátano** · naranja · queso] [**siete** · seis · ocho], [**naranja** · manzana · plátano] [**seis** · cinco · siete], [**queso** · pan · leche]; *¿Cuántos panes?* [**diez** · nueve · ocho]; Rosa [**huevo** · pan · leche]; Nico [**leche** · agua · queso]; the fountain [**agua** · leche · pan].
4. Ribbons for the barn (Sofía holds them up, no words): [**rojo** · azul · verde], [**azul** · blanco · verde], [**amarillo** · azul · verde], [**verde** · blanco · azul], [**blanco** · amarillo · azul], [**rosado** · azul · verde] (never *rojo* with *rosa*). *¿Cuántas cintas?* [**seis** · cinco · siete].
5. Lucía's flowers for the tables: *¿Qué es?* [**flor** · árbol · banco]; *¿De qué color?* [**rosado** · amarillo · azul], [**amarillo** · blanco · verde]. A butterfly follows them: [**mariposa** · pájaro · pez]. The fish watches from the fountain: [**pez** · pato · rana].
6. Nico rehearses the animals' song (each cry plays; who sings?): [**pato** · rana · perro], [**rana** · pato · conejo], [**pájaro** · rana · gato], [**caballo** · cabra · pato], [**cabra** · caballo · gallina]; and their parts: [**croac** · miau · guau], [**cuac** · miau · guau]. *¿Cuántos cantan?* (the fish can't) [**nueve** · diez · ocho].
7. Canelo rehearses with Sofía's picture signs: [**siéntate** · dame la pata · salta], [**dame la pata** · gira · ven], [**salta** · busca · siéntate], [**gira** · salta · dame la pata], [**busca** · ven · gira], [**ven** · siéntate · busca].
8. Sunset: everyone goes home: [**buenas noches** · buenos días · adiós]; Canelo: [**cama** · ven · agua].

### C21 · La fiesta de los animales
*Profesora Luna; everyone* · the farm · session 17 · about 13 min · built from: errands.js fiestab, second half: the show, the song, the photo, the diploma

- **New (0):** none (all review)
- **Reviews (older words picked or said here):** perro, guau, ven, gato, miau, buenos días, hueso, siéntate, manzana, rojo, pan, pato, cuac, cabra, cama, buenas noches, cansado, caballo, gallina, plátano, panadería, queso, leche, dame la pata, salta, galleta, azul, feliz ×2, flor, rosado, amarillo, mariposa, biblioteca, busca, árbol, conejo, rana, croac, verde, pájaro, gira, pez, siete, ocho, nueve, diez ×2
- **Mic:** 44 word-card questions, each with the mic; 4 picture-only picks (no mic).
- **Understanding moves it:** The show, the feeding and the song only go on when you say the words.

1. Morning (sun): [**buenos días** · buenas noches · adiós]. Everyone at the barn. *¿De dónde es el pan?* [**panadería** · biblioteca · escuela]; Inés arrives: *¿De dónde viene?* [**biblioteca** · casa · escuela]. Sofía calls each ribbon colour by its word and you tap that ribbon (hear it, pick the picture): [pictures: **rojo** · azul · verde], [pictures: **amarillo** · rosado · blanco], [pictures: **rosado** · azul · blanco], [pictures: **azul** · verde · blanco]. Lucía's flowers on the tables: [**flor** · árbol · banco].
2. Feed the animals (each one calls with its cry; say what it eats): the horse [**manzana** · pan · leche], the ducks [**pan** · queso · agua], the cat [**leche** · agua · pan], Canelo [**hueso** · galleta · queso], the goat [**plátano** · naranja · pan]. Canelo sneaks the cheese: *¿Qué tiene Canelo?* [**queso** · pan · leche].
3. Canelo's show (Luna's picture signs): [**siéntate** · salta · gira], [**dame la pata** · ven · busca], [**salta** · gira · siéntate], [**gira** · dame la pata · salta]; *¡busca!* finds the cake under a tree: [**busca** · ven · dame la pata], *¿Dónde está?* [**árbol** · banco · fuente]; from the far side [**ven** · siéntate · gira]. A cookie for the champion: [**galleta** · hueso · pan]. *¿Cuántas velas?* (nine candles on Luna's cake) [**nueve** · diez · ocho].
4. The animals' song: each cry plays in turn; who sings? [**perro** · gato · rana], [**gato** · conejo · perro], [**pato** · rana · perro], [**rana** · pato · conejo], [**caballo** · cabra · pato], [**cabra** · caballo · gallina], [**gallina** · pato · cabra], [**pájaro** · mariposa · pez]; *¿De qué color es la rana?* [**verde** · azul · amarillo]; then sing their part: [**guau** · miau · croac], [**miau** · guau · cuac], [**cuac** · miau · guau], [**croac** · miau · guau]. The fish jumps in the trough to see: [**pez** · pato · rana]; a butterfly lands on the camera: [**mariposa** · pájaro · pez]; the rabbit hops in last: [**conejo** · rana · pato].
5. Luna: *¿Cuántos animales?* [**diez** · nueve · ocho]; *¿Cuántos amigos a la mesa?* [**ocho** · siete · nueve]; *¿Cuántos en la foto?* (seven: you, Canelo and five friends) [**siete** · seis · ocho]; *¿Cómo estás?* [**feliz** · triste · cansado]; *¿Y Canelo?* [**feliz** · cansado · triste].
6. Sunset: say good night to the animals: [**buenas noches** · buenos días · adiós]; Canelo is sleepy [**cansado** · feliz · triste]; to his bed: [**cama** · agua · ven]. A group photo (*¿Cuántos animales en la foto?* [**diez** · nueve · ocho]), the badge and the diploma.

---

## 5. The notebook and page puzzles

The notebook is no longer handed out in pages. A page appears the moment its first word is met; a word is written in
at its introduction puzzle (picture + blue word) and turns gold with stars as it gets stronger. There are 11 pages
(was 14): pages that split one kind of word over two topics are merged (*Más números* into *Los números*, *El día de
campo* into *La comida*, *Más colores* into *Los colores*), and *bien*, *la pelota*, *la rana* and *la granja* move to
the page where the child will look for them.

**Page puzzles.** Once 4 words of a page are known (stage 2: picked once without a cue), its sparkle appears at the
spot below, at the earliest in the next session. The puzzle shows 4 pictures and 4 words from that page (the 4 most
due; never a stage-1 word). All four must be matched for the page to be confirmed (Sennaar-style; 1 chance in 24 by
guessing); a wrong match shows the right picture and plays its word, and that pair is tried again. A confirmed page
gets a gold edge and a star (one star per page per day). Pages with more than 4 words come back with a different four.
From C16 on, Inés's library holds every page whose puzzle is ready, so old pages are always one walk away.

| page (topic id) | words, in the order they are met (chapter) | page appears | 4th word met | page puzzle sparkle |
| --- | --- | --- | --- | --- |
| **Saludos** (`saludos`) | hola (C1), buenos días (C3), sí (C4), no (C4), gracias (C6), ¿cómo estás? (C8), buenas noches (C9), adiós (C10), por favor (C12) | C1 | C4 (session 2) | Don Pepe's stall, beside him; he shows how a page puzzle works (the first one; new spot, the page used to be handed over) |
| **Mi perro Canelo** (`mascota`) | ven (C1), hueso (C3), siéntate (C3), pelota (C5), cama (C9), dame la pata (C14), salta (C14), busca (C16), gira (C17) | C1 | C5 (session 3) | Canelo's cushion at home; Mamá points it out (new spot, the page used to be handed over) |
| **Los animales** (`animales`) | perro (C1), gato (C2), mariposa (C15), conejo (C16), rana (C17), pájaro (C17), pez (C18) | C1 | C16 (session 12) | the park flower at 13,19 (as now) |
| **La granja** (`granja`) | pato (C6), cabra (C7), caballo (C10), gallina (C11) | C6 | C11 (session 7) | the flower by the duck pond, 43,19 (as now) |
| **¿Qué dicen?** (`sonidos`) | guau (C1), miau (C2), cuac (C6), croac (C17) | C1 | C17 (session 13) | the barn door (as now) |
| **La comida** (`comida`) | manzana (C4), pan (C6), agua (C9), huevo (C11), plátano (C12), naranja (C12), queso (C13), leche (C13), galleta (C14) | C4 | C11 (session 7) | Abuela Rosa's shelf, 1,1 (as now) |
| **Los números** (`numeros`) | uno (C11), dos (C11), tres (C12), cuatro (C12), cinco (C13), seis (C13), siete (C18), ocho (C18), nueve (C19), diez (C19) | C11 | C12 (session 8) | the plaza fountain (as now) |
| **Los colores** (`colores`) | rojo (C5), blanco (C11), azul (C14), rosado (C15), amarillo (C15), verde (C17) | C5 | C15 (session 11) | the park flower at 21,20 (as now) |
| **El pueblo** (`pueblo`) | parque (C7), granja (C7), escuela (C8), carta (C10), casa (C10), panadería (C13), biblioteca (C16) | C7 | C10 (session 6) | the library shelf, 2,1 (as now) |
| **En la plaza y el parque** (`cosas`) | banco (C7), fuente (C7), flor (C15), árbol (C16) | C7 | C16 (session 12) | the plaza bench banco1 (as now) |
| **Así me siento** (`sentir`) | bien (C8), cansado (C10), feliz (C14), triste (C15) | C8 | C15 (session 11) | the school shelf, 3,1 (as now) |

Order the puzzles appear in a typical run: *Saludos* (session 3, Don Pepe shows how it works), *Mi perro* (4),
*El pueblo* (7), *La granja* and *La comida* (8), *Los números* (9), *Los colores* and *Así me siento*
(12), *Los animales* and *En la plaza y el parque* (13), *¿Qué dicen?* (14). The 3-heart secrets (`hearts.js`) point
to a page sparkle that is ready but not yet found, never to one that isn't ready.

---

## 6. Rules for writing content

A checklist for anyone adding a line, a question or an errand.

**Introducing a word**
- [ ] **One unknown per line and per question.** Every other word in it is met, a name, plain grammar, or acted out.
- [ ] **The intro puzzle is the new word + two known words** (or, for find-it, the new word + unnamed things in the
  world). The confirmation follows at once: the thing glows, the word is said again, the other cards dim.
- [ ] **No unmet word on a card, ever, not even as a wrong answer.** Unmet words in speech show as their picture only.
- [ ] **No distractor that is also right in meaning**: no *hola* next to *buenos días* before *buenas noches* exists, no
  *gato* as a card for "¿Un perro?" (the answer is *no*).
- [ ] **At most 5 new words per chapter and 6 per session; at most 2 from one tight set** (colours, farm animals, sounds,
  feelings, Canelo's commands). Numbers may come 3 at a time when they continue a count the child already knows.
- [ ] **Concrete first**: things and animals, then commands (each with an action the child triggers), then colours and
  feelings attached to things already known.
- [ ] **Places are introduced by find-it**: the place's picture next to the word, other places as wordless bubbles. On
  arrival the banner asks the place's name.
- [ ] **Commands are watch-and-do**: someone says it and Canelo does it, then the child says it and he does it for them.
  Learning a trick takes 3 good tries, spread over 2-3 minutes.

**Using a word**
- [ ] **First use within 1-3 minutes, a second 5-10 minutes later** (in the chapter or from the review queue).
- [ ] **Learn only the answered word.** `learn` is the answer and nothing else: a sí/no answer teaches *sí* or *no*,
  not the word inside the question.
- [ ] **Cue-free retrieval once a word is known**: the prompt never contains the answer's text or the answer's own
  picture. Ask with the thing itself (Pepe holds up the fruit), a face, a sound, a picture sign (Canelo's tricks), the
  sun or the moon (greetings), or a need (Canelo panting). Bubbles over people show a picture while the word is new
  and a "?" after.
- [ ] **A destination that is known is named by its word only** (*Para la escuela*, no picture), and walking there counts
  as a use.
- [ ] **Every word in at least 3 errands with at least 5 active uses** (picked or said), over at least 2 days.
- [ ] **Free choices are not retrievals** (shops, presents, Canelo's menu without a request): never count them, never
  rely on them.
- [ ] **Understanding moves the game**: the word opens the door, finds the thing, makes Canelo do it. If a question
  could be deleted without changing what happens next, rewrite it as something someone needs.

**The mic**
- [ ] **Never put sound-alike words in one mic question**: *ven/bien, gato/pato, cuac/croac, casa/cama, rosado/rojo,
  uno/no, hueso/huevo, nueve/huevo, galleta/gallina, pata/pato, siete/siéntate, agua/guau, tres/seis*.
- [ ] **The mic is a bonus, never a gate**: every mic question can be tapped. Two misses: play the word, praise the try,
  move on. A big say-it moment (like *¡ven!* at the barn) still has its cards.
- [ ] Ask for a word out loud from a picture only after it has been picked right once or twice; before that, the mic is
  "say it after me".

**Language** (`CONTENT.md`)
- [ ] Mexican Spanish, present tense, a few words per line, `{o/a}` for the player.
- [ ] After any content change, run `tools/vocab-audit.js` and check the targets in `LEARNING_DESIGN.md`.

---

## 7. What changed from the current game

### 7.1 Words (78 → 73)
| change | words | why |
| --- | --- | --- |
| dropped | *las uvas* | never the answer anywhere (0 uses); plural-only; three other fruits do the job |
| dropped | *negro*, *café* | no black or brown thing the game is about (Canelo's name already means cinnamon); 8 colours were too many of one set |
| dropped | *la ventana*, *la puerta* | nothing in an errand needs them; *ventana* appeared in one moment in the whole audit |
| dropped as words | *pío*, *bee* | kept as the bird's and the goat's cries (listen-and-point cues). *bee* was unreliable for the mic, and both made the sound set 6 strong |
| added | *buenas noches* (`buenasnoches`) | said every evening to Mamá and Canelo: a daily, natural retrieval, and the partner that makes *buenos días* a real choice |
| added | *busca* (`busca`) | a sixth trick with a job: Canelo sniffs out favor targets and page cards. More Canelo, more mic |
| changed form | *rosa* → *rosado / rosada* (id `rosa`, the mic still accepts *rosa*) | *rosa* clashed with Abuela Rosa's name in the same lines |
| moved page | *bien* → *Así me siento*; *la pelota* → *Mi perro*; *la rana* → *Los animales*; *la granja* → *El pueblo*; the *Más números*, *El día de campo* and *Más colores* words → *Los números*, *La comida*, *Los colores* | §5 |

### 7.2 Errands
| current | in this plan | what changes for teaching |
| --- | --- | --- |
| Mamá's intro (15 words, the *Saludos* page, *uvas* and *carta* as wrong answers) | C1 ¡Un perro! | 4 words; Canelo arrives in the first minute instead of after Saludos (about minute 9) |
| (none) | C2 El gato de la cerca | new, short: the cat on the fence, Nico's first sound game |
| Canelo becomes yours; Mamá teaches *siéntate*, *ven* | C1 (*ven*), C3 (*siéntate*, *hueso*, *buenos días*) | one trick per chapter; *buenos días* taught by the sun, not the prompt text |
| Don Pepe's sí/no about fruit nobody knew | C4 El juego de Don Pepe | sí/no about Canelo and the cat; *manzana* comes after |
| La pelota roja (red through sí/no, blue at the end) | C5 La pelota roja | only *pelota* and *rojo*; red is found, not co-learned with *sí*; *azul* moves to the show |
| side job: feed the ducks | C6 Pan para los patos | becomes the chapter that teaches *pan*, *gracias*, *pato*, *cuac* |
| ¿Dónde está Canelo? (places from a page dumped at 1:23) | C7 | the four places are introduced inside the errand, one per clue; *feliz* left for later |
| Saludos (greet 3 people) + Luna's welcome | C8 La escuela de Luna | asking *¿cómo estás?* is the errand; *bien* is never co-learned |
| the evening at home | C9 ¡Buenas noches, Canelo! | the first evening teaches *agua*, *cama*, *buenas noches* |
| La carta (Round A) + Tomás está cansado | C10 Tomás está cansado | one letter errand, not two; *carta*, *casa*, *adiós* taught here |
| side job: the hens' egg | C11 Los huevos de Rosa | teaches *gallina*, *huevo*, *uno*, *dos*, *blanco* |
| El mercado (Round A) | C12 El mercado de Mamá | *plátano*, *naranja*, *por favor*, *tres*, *cuatro*; *uno*/*dos* already known |
| El día de campo | C13 | only *queso*, *leche*, *panadería*, *cinco*, *seis* are new; the rest is review (77% of answers) |
| El show de perros | C14 | Luna shows picture signs (the old prompt showed the trick's own picture: cued); *azul*, *galleta*, *feliz* new |
| Las flores de Lucía | C15 | *rosado* and *amarillo* new, red, white and blue reviewed |
| (none) | C16 Las páginas perdidas | new: *busca*, Inés's library as the page-puzzle hub |
| ¿Qué dicen? | C17 | asks for animals by sound and sounds by animal (the audit: no question had an animal as its answer) |
| ¿Cuántos animales? (6-10 in one errand, Luna counting alone) | C18 + C19 | split over two sessions; the child says each next number |
| La fiesta de los animales | C20 + C21 | preparation and party: 110 review answers, no new words |
| Luna's *¿Repaso?* | the *palabra del día* and page puzzles | review is daily and in the world, not a drill after the story |

**Unlocking** becomes one path: each chapter opens when the previous one is done and today's budget allows (§3.1).
The choice a child gets each day moves to the favores, side jobs and page puzzles, which are open at the same time.

### 7.3 Engine pieces this plan needs
Most are in `LEARNING_DESIGN.md`'s build step 1; these are the content-facing ones.
- **Unmet things stay mysterious.** Tapping an animal or thing whose word is unmet shows a "?" bubble with its cry and
  its picture, no word and no voice; the album shows it as seen but unnamed. (Today every tap names the word, which
  would undo the order.)
- **Arrival banners ask the place's name** the first few times a place is reached while its word is due.
- **Picture-only answer cards** for "hear it, pick the picture" (`pic: true` in `G.ask`, no mic).
- **Picture signs for tricks** (Sofía, Luna) instead of prompts that show the trick or say its word.
- **`busca`**: Canelo runs toward the current target (an errand spot, a favor's thing, a page sparkle) and barks there;
  the `come` animation pointed at a target.
- **Animals follow on *¡ven!*** in C19, like Canelo's follow.
- **Time-of-day greetings**: a sun or a moon in the greeting prompt, with *buenos días / buenas noches / hola* as cards.
- **The daily new-word budget** and the *¡Mañana!* sun bubble (§3.1).
- **Bubbles over people** show a picture while the requested word is new and a "?" once it is known.
- Two new icons: a moon for *buenas noches*, a sniffing nose for *busca*.

### 7.4 Code that refers to dropped or changed words
- `src/data.js`: the words, topics, pages and `D.quests` goals (the sound game's goal lists *bee*).
- `src/animals.js`: `pajaro` has `sound: 'pio'`, `cabra` has `sound: 'bee'` (keep the cries, drop the sound words).
- `src/errands.js`: the sound game's `ROUNDS` (*bee*); the picnic's bread question pool (*uvas*).
- `src/maps.js`: the market's fruit pool (*uvas*); Round A errands and greetings are replaced by C4, C5, C8, C12.
- `src/story.js`: Mamá's intro (*uvas*, *carta*, *adiós*) is replaced by C1.
- `src/world.js`: `TILES` maps `N` to *ventana* and `D` to *puerta*; set them to `null`.
- `src/hearts.js`: `PAGE_PLACE` lists *numeros2*, *campo*, *colores2*; `H.greet` uses *hola/buenos días/bien* pools
  (replace with the time-of-day greeting and the pools in §2.2).

### 7.5 As built: chapters 1-10 (part 1)
Chapters 1-10 are in the game (`src/chapters.js`, `content/es/story-c01-c10.js`; the words, pages and the chapter
table in `content/es/words.js`). They follow §4 step by step; where the build differs:
- **Gating** (§3.1 made concrete, `G.chapters.gate`): at most 6 new words a game day and 8 a calendar date, and at
  most 5 inside 5 minutes of play (C2 waits a few minutes after a quick C1); no new
  chapter while 10 or more words are only met (a review day: Profesora Luna, or Mamá before C8, has a notebook
  bubble and asks the 5 oldest of them, so the story always goes on); C3, C7 and C8 (and C19) are *morning* chapters, opened
  only as the first chapter of a session; C9 is the *evening* chapter: after C8 the sunset comes about 5 minutes later
  and C9 plays at home at dusk and at dawn. A started chapter can always be finished. While the next chapter waits its
  giver shows a sun coming up (a moon for C9) and says *¡Mañana!*.
- **C1**: the puppy hides under the table (two other spots in the room are wrong); the notebook is not handed over, its
  pages appear as their first words are met. Leaving the house is the door beat (call Canelo from his bowl).
- **C2** starts by itself the first time you step outside after C1 (the butterfly chase).
- **C6**: Marta sends you to the pond with *Los patos... ¡por allá!* (*granja* is C7's word).
- **C8**: Luna says *¡Pregunta a tus amigos!* (no *tres* before C12).
- **C9**: Mamá's *¡Buenas noches!* (step 5) comes before the bed (steps 3-4), and saying it to Canelo (step 6) after
  he is back on his cushion, so its second use is a minute later; at dawn Canelo stretches on his cushion first
  ([**cama** · hueso · pelota]). The bed find has no picture bubbles (your bed is the right spot, the table and a shelf the wrong ones); the
  dawn beat ends with Mamá pointing at the fountain (the water side job opens).
- **C10**: the letters are *Esta / Y esta* (no numbers before C11).
- **Canelo's "?"**: a word met in this session a minute ago and not used since its puzzle puts a "?" over
  Canelo; tapping him asks it (a review question). It keeps every new word's first use within about 1-2 minutes.
- **Engine pieces of §7.3 in place**: unmet things and animals show only a "?" (the album too), arrival banners
  (*¿Dónde estás?*, up to 3 times while the place word is due), picture-only answer cards (`pic`), time-of-day
  greetings (from C3 on; `src/hearts.js`), the daily budget with the sun bubble, the moon and *busca* icons. The rest
  (picture signs for tricks, *busca* running to a target, animals following *¡ven!*, request bubbles that turn to "?"
  once their word is known) came with chapters 11-21 (§7.6).
- **After C10** (part 1 only) the older errands ran until C11-C21 were written: see §7.6. Side jobs open with the
  chapter that teaches their words (ducks C6, the sleepy cat C2, water C9, the horse C10, the hens' egg C11, flowers
  C15); the shops with C4 and C6.
- **Older saves** load with their errands mapped onto chapters (`G.chapters.migrate()`, §7.6).

### 7.6 As built: chapters 11-21 (part 2)
Chapters 11-21 are in the game (`content/es/story-c11-c21.js`), and with them the whole game is the chapter path: the
older errands they replace (§7.2) never open (`src/errands.js` keeps only the bag, the side jobs, presents, the shops
and the flowers). They follow §4 step by step; where the build differs:
- **C11**: Rosa walks you to her hens (the daily greeting is the greeting: no card for it in the chapter). The two
  nests (one egg, two eggs) are drawn by the henhouse and found by tapping (find-it), so *dos* is never a picture card
  before it is met; the white and the brown hen hold still for the *blanca* find-it. The scattered hen runs to the
  plaza; *¡ven!* (a card question with the hen pointed at) brings her trotting home.
- **C12**: Marta's *¡Una manzana, por favor!* is overheard at the stall. Every "¿Cuántos?" shows a heap of the things
  (three bananas, four oranges: `{icon, count}`), never the number's own picture. Mamá's list is a heap of both.
- **C13**: Gómez passes the stall (*¿Qué tienes?*, no bench question); at the paddock it is Canelo, not the cat, who
  wants the milk; Rosa counts the basket (a heap of the five foods, `{list}`) and six plates; no sunset (it is the
  afternoon: the moon line is left out).
- **C14**: Sofía's and Luna's signs are **picture signs**: the trick's picture painted on a little wooden sign on a post
  (`{icon, sign: true}`); once the trick is known the cards are words only, so it is a recall from the sign. Tries 2
  and 3 of each trick are from the sign. Home at the end: Canelo is *cansado* and goes to his *cama* (no *buenas
  noches*: it is not evening).
- **C15**: four flower beds around town (red, white, blue, pink) with no bubbles: the child finds the pink one (its
  colour asked at each); the yellow one by the farm road with the butterfly on it; Lucía's bouquet is the two you
  brought and three of hers (*cinco*). No bench question.
- **C16**: as planned; the cards land in the park (drawn), *¡busca!* walks Canelo to each one, sniffing, and he barks
  there (`busca` in `G.pet.TRICKS`, the `sniff` animation); Inés's page puzzle is *Mi perro*'s four most due words.
- **C17**: Nico tags along for the sound rounds (`follows`); the cat stays on the park fence; the bird sits in a park
  tree (drawn). A wrong animal in his game: *¡No! ¡Escucha!*
- **C18**: Luna waits at the fountain with her clipboard (the animals counted so far, top left); the child finds the
  cat, the frog, the rabbit, the bird, the butterfly on a pink flower and Rosa's hens; each count shows the heap of
  animals so far.
- **C19**: the animals **follow you** after *¡ven!* (`a.follow`: they trot along your trail; the cat is drawn trotting
  behind you) and walk into the paddock as they are counted (`a.go`, then `a.pin`); the horse and the goat bring
  *nueve* and *diez*; a duckling wanders off and *¡busca!* brings it back.
- **C20** is shorter than planned (about 40 answers, not 62: a 7-year-old's quarter of an hour): five invitations in
  order (Marta, Inés, Rosa, Don Pepe, Sofía), each with what they bring (bread and nine cookies, six eggs, eight apples
  and seven bananas, four ribbons and a rehearsal with picture signs), then Nico's song rehearsal and Lucía's flowers.
- **C21** (about 40 answers) at the barn: where things come from, Sofía's ribbons (hear the colour, tap the ribbon),
  feeding the animals, Canelo's show from Luna's picture signs, *¡busca!* finds the cake by a tree, the animals' song,
  how many, the group photo, *buenas noches* to the animals; the badge, then the diploma.
- **Request bubbles** over people show the thing's picture while its word is new and a "?" once it is known
  (`G.chapters.bubbleOf`).
- **Review in the world** (`src/favores.js`): favores (up to three a day from C7: go to a place named by its word,
  find an animal, count a heap, a colour, a sound, a face, a thing; a star and a heart), Luna's *palabra del día*
  (from C8: a picture, say it or pick its word from four) and, from C16, Inés's library offering one page puzzle a day.
  The morning greeting's due word (`src/hearts.js`) was already in.
- **Older saves**: a game from before the chapters maps its errands onto them (the market C4, the ball C5, lost Canelo
  C7, greetings C8, letters C10, the picnic C13, the show C14, the flowers C15, the sounds C17, the count C19, the
  party C21; every chapter before the furthest counts as done); a game from part 1 (chapters 1-10, then the older
  errands) maps those errands the same way. An older errand still going on is let go and its things leave the bag;
  Canelo keeps his tricks and gets those of every chapter behind him.
