# Spanish review: lines for a native speaker to check

The game is written in Mexican Spanish for a 7-year-old who is just starting. There is no native-speaker reviewer.
Each line was settled from grammar references and dictionaries of Mexican Spanish and by a second, skeptical reading.
The answers to the numbered questions are recorded under each batch. This file lists the lines that changed, in batches.

**How to review:** for each line, mark it ✓ (fine), or write what a Mexican adult would say to a 7-year-old. Words in
[brackets] are the word cards she is learning; they must stay. A word shown as [caliente:calor] means the card
*caliente* is shown as the word "calor".

---

## Batch 1 (2026-10-21): polish Sprint 1, grammar fixes in lines built by the code
The audit found lines where code joins a sentence and a word, with the wrong article ("¿Y para el cabra?"). One helper
now takes the article from the word. These are the lines it changed, plus a few hand fixes.

### Things the person or animal says
| Where | Before | After |
| --- | --- | --- |
| Beach, Marina is hot | ¡Para Marina! ¡Qué [caliente]! | ¡Para Marina! ¡Tiene mucho [caliente:calor]! |
| Beach, a hot day | ¡Uf! ¡Qué [caliente]! | ¡Uf! ¡Qué [caliente:calor]! |
| Beach, the baby turtles leave | ¡Bye, bye, [tortuguitas]! | ¡[Adiós], [tortuguitas]! |
| Beach, a new animal | ¡Mira! ¡[cangrejo]! | ¡Mira! ¡Un [cangrejo]! |
| Beach, a find | ¡[concha]! | ¡Una [concha]! |
| The finale (every player sees it) | ¿Y para el [cabra]? | ¿Y para la [cabra]? |
| Story, the water | Y el [agua]... ¡la [fuente]! | Y el [agua]... ¡de la [fuente]! |
| Story | ¡Todo! ¡A Rosa! | ¡Todo! ¡Vamos con Rosa! |
| Story | ¡Ja, ja! ¡A Lucía! | ¡Ja, ja! ¡Vamos con Lucía! |
| Tomás, a letter | ¡Una [carta]... ¡para la [parque]! | Una [carta]... ¡para el [parque]! / ¡para la [fuente]! |
| Tomás, a reminder | ¿La [carta]? ¡La [parque]! | ¿La [carta]? ¡Para el [parque]! |
| Sr. Gómez | ¡Al [fuente]! | ¡Al [parque]! / ¡A la [fuente]! |
| Sr. Gómez, a reminder | ¿La [carta]? ¡La [fuente]! | ¡Vamos al [parque]! / ¡Vamos a la [fuente]! |
| Nico, hide-and-seek | ¿Y el [cabra]? ¡Búscalo! | ¿Y la [cabra]? ¡Búscala! / ¿Y el [conejo]? ¡Búscalo! |
| A reminder in a search | ¿Y el [rana]? | ¿Y la [rana]? |
| Don Pepe, counting apples | ¿Cuántos? | ¿Cuántas? (also Luna's stars; bread and eggs keep ¿Cuántos?) |
| Lola, "I like it too" | ¡El [tortuga]! ¡A mí también me gusta! | ¡La [tortuga]! ¡A mí también me gusta! |
| Mountain, Mateo | ¡Me encanta [nieve]! | ¡Me encanta la [nieve]! / el [sol] / el [viento] / la [lluvia] |
| Mountain, Mateo | ¡Me encanta [nubes]! | ¡Me encantan las [nubes]! |
| Mountain, a new animal | ¡Mira! ¡[llama]! | ¡Mira! ¡Una [llama]! |
| Mountain, the snowman | ¿Y la nariz? ¡Don Lucho tiene! | ¿Y la nariz? ¡Don Lucho tiene una! |
| Grandparents, getting dressed | ¡Toca tus [ojos]! / ¡Toca tu [boca]! | ¡Tócate los [ojos]! / ¡Tócate la [boca]! |
| Grandparents, Simon says | ¡Simón dice: toca tu [nariz]! | ¡Simón dice: tócate la [nariz]! (el [pie], los [ojos], la [mano]...) |
| Grandparents, a new animal | ¡Mira! ¡[vaca]! | ¡Mira! ¡Una [vaca]! |
| Forest, the bear's mother | Mamá [oso] | Mamá [osa] |
| Forest, acorns | ¡Cuatro! ¡Al pay! | ¡Cuatro! ¡A hacer el pay! |
| Forest, a new animal | ¡Mira! ¡[oso]! | ¡Mira! ¡Un [oso]! |
| Playground | ¡[columpio]! | ¡El [columpio]! / ¡La [resbaladilla]! / ¡El [subibaja]! |
| Playground, a new animal | ¡Mira! ¡[abeja]! | ¡Mira! ¡Una [abeja]! |
| Any new thing (default) | ¡Mira! ¡[manzana]! | ¡Mira! ¡Una [manzana]! (actions stay bare: ¡Mira! ¡[salta]!; water: ¡Mira! ¡[agua]!; ¡Mira! ¡El [sol]!) |
| Someone lost things | ¿Y mi [zapatos]? | ¿Y mis [zapatos]? |
| A page found | Una página... ¡[fuente]! | Una página... ¡en la [fuente]! / ¡en el [parque]! |
| A flower given | ¡[flor]! ¡Gracias! | ¡Una [flor]! ¡Gracias! |
| An apple handed over | ¡Aquí tienes! ¡[manzana]! | ¡Aquí tienes! ¡Una [manzana]! (bread and cheese stay "¡Pan!") |
| A best-friend photo | ¡Mejores amigos! | ¡Mejores amigas! when she and the friend are both girls |
| Canelo's trick | ¡siéntate! | ¡Siéntate! |

### Listen-and-do requests (she hears them and does them)
| Before | After |
| --- | --- |
| Toca el perro grande. | Toca al perro grande. |
| Toca la vaca pequeña. | Toca a la vaca pequeña. |
| Toca el águila pequeña. | Toca al águila pequeña. |
| Dame el sol pequeño. | Toca el sol pequeño. / ¿Dónde está el sol pequeño? |
| Dame el muñeco de nieve grande. | Toca el muñeco de nieve grande. |
| Dame cuatro nubes. | (no longer asked; "¿Cuántas nubes hay?" stays) |

### Other
- Speech recognition: "zorra" (heard for *zorro*) and "salte" (for *salta*) are no longer accepted.
- Spelling of accepted forms: pececito, ericito, buhito.
- About 147 lines started a sentence with a small letter ("¡hola, Ana!"); they now start with a capital.

### Questions for the reviewer
1. **"¡Tiene mucho calor!" / "¡Qué calor!"** are shown with the word card *caliente*. Should the game have a separate
   card for *calor* (the weather or feeling hot) and keep *caliente* for hot things (soup, sand)? The card's picture is
   a sweating face today.
2. **Simón dice:** "tócate la nariz" (what we changed to) or "toca tu nariz"? Which one would a Mexican teacher use with
   a 7-year-old?
3. **The baby at the grandparents' house** is a girl. Abuela says "¡Búscalo!" because the card is *el bebé*. Would you
   say "¡Búscala!" (la bebé) here?
4. **"Cartas" for the notebook's picture cards.** Is that natural (like lotería cards), or should it be "tarjetas"?
5. **"¡A hacer el pay!"** for "let's make the pie": is *pay* right for a Mexican child, or *pastel*?
6. **"¡Vamos con Rosa!"** for "let's go to Rosa's": natural, or "¡Vamos a ver a Rosa!"?

---

## Batch 2 (2026-10-22): polish Sprint 2, new questions and requests

### The question for each kind of word
When a review holds up a word's picture, it now asks the question a Mexican adult would ask for that kind of word.
| Kind of word | Question |
| --- | --- |
| things | ¿Qué es? |
| things that come in pairs or groups (los ojos, los zapatos, las burbujas) | ¿Qué son? |
| animals and people | ¿Quién es? |
| la familia | ¿Quiénes son? |
| actions (corre, salta, baila...) | ¿Qué hace? |
| colours | ¿De qué color es? |
| feelings (bien, cansado, feliz, triste) | ¿Cómo está? |
| numbers | ¿Cuántas hay? / ¿Cuántos hay? (from the thing counted) |
| greetings, phrases, animal sounds | ¿Qué dice? |
| commands to the dog (ven, siéntate, dame la pata) | ¿Qué le dices? |
| nadar | ¿Qué le gusta hacer? |
| rápido, despacio | ¿Cómo va? |
| grande, pequeño | ¿Cómo es? |
| caliente (shown with a cup of hot chocolate, never a person) | ¿Cómo está? / ¿Cómo está el chocolate? |
| frío | ¿Qué tiempo hace? |

### Reviews in other places
| Who | Line |
| --- | --- |
| A friend with a photo | ¡{name}! ¡Mira mi foto! / ¡Mira, {name}! ¡Una foto! / ¡{name}! ¿Y en esta foto? |
| Lola, in a new place | ¡Mira mi foto! ¿Te acuerdas? / ¡{name}! ¡Una foto de mi viaje! / ¡Mira! ¿Te acuerdas de esto? |
| A letter from Tomás | ¡Mira! ¡Un dibujo! |
| Don Chuy, the bubbles | ¿Qué quieres? → (she says) Quiero burbujas, por favor. → ¡Burbujas! ¡Aquí tienes! |

### New listen-and-do requests (she hears them and does them)
- **The beach, Don Paco:** Dame la concha blanca. / Dame dos conchas. / Dame dos estrellas de mar. / ¿Cuántos cangrejos
  hay? / Toca a la tortuga pequeña. / ¿Dónde está la gaviota pequeña? / Toca al pez grande. / Dame dos conchas blancas. /
  ¿Cuántas conchas rosadas hay?
- **The park, Ana** (her character does it): Salta dos veces. / Gira una vez. / Baila tres veces. / Tócate la nariz. /
  Tócate los ojos. / Tócate la boca.
- **The mountain, Don Lucho:** Toca a la llama grande. / Toca al águila pequeña. / ¿Dónde está el lobo pequeño? /
  ¿Cuántas marmotas hay? / ¿Cuántos zorrillos pequeños hay?
- **Before she knows a colour or number:** Dame la concha. / Toca al cangrejo. / ¿Dónde está la tortuga? / Baila.

### Questions for the reviewer
7. **"¿Quién es?" for animals** (to match the album, like a Pokédex): natural for a child, or should it be "¿Qué animal
   es?"
8. **"rosada / rosado"** for pink: the game says "conchas rosadas". In Mexico, is "rosa" (invariable: "conchas rosa")
   more natural for a child?
9. **"Gira una vez"** (turn around once): natural, or "Da una vuelta"?

---

## Batch 3 (2026-10-23): polish Sprint 3, shorter story chains and Mexican names
The story's long question chains were split up with things to do on the map. Some names and words were changed to
Mexican usage.

### Names and words (Mexican usage)
- Character name: Profesora Luna -> Maestra Luna (src/data.js; shown in every talk's name box and in "Maestra Luna: ¡...!" greetings)
- Character name: Abuela Rosa -> Doña Rosa (src/data.js)
- C8 find-it: "¡La [escuela]! ¡Profesora Luna!" -> "¡La [escuela]! ¡Maestra Luna!"
- Present question (errands.js): "¿Para Profesora Luna?" / "¿Para Señor Gómez?" / "¿Para Abuela Rosa?" -> "¿Para la maestra Luna?" / "¿Para el señor Gómez?" / "¿Para Doña Rosa?" (G.requests.person)
- The colour pink: rosado / rosada -> rosa (the same for every noun; the mic still accepts rosado, rosada, rosas)
  - C15 Lucía: "Una [flor] [rosada]... ¿[por favor]?" -> "Una [flor] [rosa]... ¿[por favor]?"
  - C15 flower bed: "¿[Rosada]?" -> "¿[Rosa]?"
  - C15 Lucía: "¡[Sí]! ¡La [flor] [rosada]! ¡[Gracias]!" -> "¡[Sí]! ¡La [flor] [rosa]! ¡[Gracias]!"
  - C15 Lucía: "¡[Rosada] y [amarilla]! ¡Y mis [flores]!" -> "¡[Rosa] y [amarilla]! ¡Y mis [flores]!"
  - Listen-and-do requests: "Tráeme tres conchas rosadas." -> "Tráeme tres conchas rosa."; "Dame la bufanda rosada." -> "Dame la bufanda rosa."; "¿Cuántas conchas rosadas hay?" -> "¿Cuántas conchas rosa hay?"
  - Dashboard: "¿De qué color es el cerdo? Es rosado." -> "Es rosa."
- The ribbon: cinta -> listón
  - C14 Luna: "¡Una cinta [azul]!" -> "¡Un listón [azul]!"
  - C14 Luna: "¿Cuántas cintas?" -> "¿Cuántos listones?"
  - C14 Mamá: "¡Una cinta! ¡Bravo, {dog}!" -> "¡Un listón! ¡Bravo, {dog}!"
  - C20 Sofía: "¿Cuántas cintas?" -> "¿Cuántos listones?"
- The dog show: show de perros -> concurso de perros
  - C14 title: "El show de perros" -> "El concurso de perros" (also the older errand's name)
  - C14 Sofía: "¡Un show de perros! ¿{dog}?" -> "¡Un concurso de perros! ¿{dog}?"
  - C14 Sofía: "¿{dog}? ¿En el show?" -> "¿{dog}? ¿En el concurso?"
  - C14 Sofía: "¡El show!" -> "¡El concurso!"
  - C14 Luna: "¡El show de perros! ¡{dog}!" -> "¡El concurso de perros! ¡{dog}!"
  - C21 Luna: "¡El show de {dog}!" -> "¡Los trucos de {dog}!" (the party isn't a contest)
- La huerta: Abuelo "¡Mi huerto! ¿Me ayudas?" -> "¡Mi huerta! ¿Me ayudas?"
- Dashboard "Tonight's question": the little visitors are asked where you find them, not where they live:
  "¿Dónde vive la mariposa? En la flor." -> "¿Dónde hay mariposas? En las flores." (also catarinas, colibríes: en las
  flores; conejos, palomas, hormigas, lagartijas, grillos: en el parque)

### The greeting before a story beat
- When a person's story beat comes next, they greet her ("¡[Buenos días], {name}!", "¡[Hola], {name}!", "¡[Buenas noches], {name}!") instead of asking her to say it back; the name / "¿Qué te gusta?" phrase waits for another talk.

### New or changed story lines (shorter question chains)
- C4 Don Pepe (the game moves to three crates on the plaza):
  - new: "¡Un juego! ¿[Sí] o [no]?" now ends his first talk (was the start of the next scene; unchanged words)
  - new: "¡[No]! ¡Un [perro]! ¡Otra!" (after the bone crate: "another crate!")
  - siNo prompts kept: "¿Un [hueso]?", "¿Un [gato]?", "¿[Siéntate]?", "¿Y ahora? ¿[Siéntate]?"
- C6 Nico: new "¡El [pan]! ¡Para el [pato]!" (she then taps the duck to feed it). One round of the "who says it" game dropped (the duck was tapped twice in a row): "¡[Sí]! ¡El [pato]!" removed.
- C10: unchanged lines, new order (Canelo's tiredness is asked at the fountain).
- C12 Don Pepe: new "Las [naranjas]... ¡allá!" (the oranges are at the other end of his stall)
- C13: Rosa's "¡Al [parque]!" now ends her talk (the picnic is a place in the park).
- C16, C17, C18: new order only (C17: "¿Qué dice el [gato]?" dropped; C18: "¿Cuántas [gallinas]?" and "¿Cuántos [peces]?" dropped from Luna's clipboard).
- C19: "¿Cuántos [caballos]?" dropped.
- C20:
  - Luna asks only "¿Dónde está Marta?" and, at the end, "¿Y la fiesta? ¿Dónde?"
  - Marta: new "¿Y Inés? ¿Dónde está?" (was Luna's "¿Y Inés?")
  - Inés: new "¿Y Rosa? ¿Dónde está?" (was Luna's "¿Y Rosa?")
  - Rosa: new "¡Y Don Pepe! ¡La fruta!"
  - Don Pepe: new "¡Y Sofía! En el [parque]." (Luna's question "¿Y Sofía?" became this line)
  - Sofía: new "¡Listones para la [granja]! ¿Me ayudas?" (the ribbons are on the lawn to pick up)
  - Sofía: "¡Y {dog}! ¡Un ensayo!" kept
- C21 (the party is five stations):
  - new: "¿Qué come cada uno?" (at the food by the paddock gate)
  - new: "¡{dog}! ¡[Ven]! ¡Los listones!" (Sofía calls her over)
  - new: "¡Mira! ¡Más amigos!" (Lucía)
  - kept: "¡La comida para los animales!", "¡La canción de los animales!"

### Questions for the reviewer
10. **Pink as "rosa" for every noun** ("conchas rosa", "la bufanda rosa"): is that what you'd say to a child, or
    "conchas rosas"?
11. **"¿Para la maestra Luna?" / "¿Para el señor Gómez?"** (asking who a present is for): natural?
12. **"¡Los trucos de {dog}!"** (the dog's tricks at the party): natural?

## Batch 4 (2026-11-22): "calor" and "caliente" are two cards

Before, one card, "caliente" (a sweating face), was used for the heat in the weather ("¡Qué calor!") and for hot things.
Now "el calor" (the sweating face) is the weather and feeling hot, and "caliente" (a steaming bowl) is for hot things.
The card "caliente" keeps its old id, so a saved game still knows it.

### The words
- new card: "el calor", English "the heat (it's hot)". The microphone also accepts: hace calor, mucho calor, tengo calor, qué calor, calor.
- "caliente" card: the microphone used to accept "calor / hace calor / tengo calor / qué calor". Now it accepts: está caliente, muy caliente, calientito, quema.
- question for "calor": "¿Qué tiempo hace?" (like "frío"). Question for "caliente" is unchanged: "¿Cómo está el chocolate?"

### Changed lines (the heat in the weather)
- Doña Nieves, the ice cream for the one who is hot: "¡Tiene mucho [caliente:calor]!" -> "¡Tiene mucho [calor]!" (English "they are so hot!")
- the one who is hot, with no ice cream yet: "¡Uf! ¡Qué [caliente:calor]!" -> "¡Uf! ¡Qué [calor]!". The first time, it is introduced as a new word (picture, then "which word is this?").
- Mateo's weather question: "¿Hace [frio:frío] o [caliente:calor]?" -> "¿Hace [frio:frío] o [calor]?". Asked only when "calor" is met.
- Lucho's "¡Brrr! ¡Hace frío!" puzzle: the other word offered may now be "calor" (not "caliente").

### New lines
- Marina, in story 2 (the sunny beach), after the hot sand: "¡Uf!" (English "Phew! (she fans herself)"). Changed later (2026-11-23): it is a plain line, it no longer teaches "calor". Story 2 teaches three words, one at a time: el sol, caliente, el helado. "Calor" is met when someone on the beach is hot.

### Lines that keep "caliente" (hot things)
- Marina on the hot sand: "¡Ay, ay! ¡[caliente]!", asked "¿Cómo está la arena?"
- Marina after the ice cream: "¿Y el [elsol]? ¿Cómo está?" -> "caliente", and "¡El [elsol]! ¡[caliente]!" (English "The sun is hot!"). Unsure: "el sol está caliente" is said in Mexico, but "hace calor" is the more standard way to say the sun is hot. Kept because the sun is shown as a hot thing.
- Don Lucho's chocolate: "¡Mmm! ¡Está [caliente]!" (English "Nice and hot!"), "¡Cuidado! ¡Está [caliente]!", and "¿Cómo está?" for the chocolate.

### Questions for the reviewer
13. **"¡El sol! ¡Caliente!"** / "¿Y el sol? ¿Cómo está?": natural for a child, or should it be "¡Hace calor!"?
14. **"el calor" as the card name** (the card shows "el calor" but the lines say "¡Qué calor!" and "Hace calor"): fine?

### Answers to the numbered questions (recorded 2026-11-22)
1. A separate "calor" card was added (batch 4).
2. "Tócate la nariz" kept.
3. "El bebé" / "¡Búscalo!" kept, matching the card.
4. "Tarjetas" (not "cartas") for the notebook's cards.
5. "Pay" kept.
6. "¡Vamos con Rosa!" kept.
7. "¿Quién es?" kept for animals; "¿Qué animal es?" is the neutral form.
8. and 10. "Rosa", with the plural "rosas".
9. "Gira una vez" kept.
11. Kept.
12. "Trucos" kept.

---

## Batch 5 (2026-11-22): from the proofread of every line
Every line of the story and the world was read again. These are the ones that changed. Where a card word shows in
[brackets], the card stays; only the line around it changed.

### Words
- "el banco" (the bench in the park) -> "la banca". In Mexico a long seat in a park is "la banca"; "el banco" there is a stool, or the bank. The word id stays "banco" (saves). The line "¡[si]! ¡El [banco]!" -> "¡[si]! ¡La [banco]!" (English "Yes! The bench! (which one? tap it)"). Also accepted by the microphone: banco, banquita.
- "conchas rosa" -> "conchas rosas". "Rosa" as a colour has no "-o / -a" form, but it takes an "s" in the plural, like every other colour. Both are heard in Mexico; one rule is kinder to a child. The request line "Tráeme dos conchas rosas." The card still reads "rosa" (accepted also: rosado, rosada, rosas).
- the owl (el búho), the microphone's accepted form "buhíto" -> "buhito" (the same spelling as "pececito" and "ericito": "buhito" has no written accent).

### Changed lines
- the dog sneezing at the flower: "¡Achís!" -> "¡Achú!" ("achú" is the usual way to write a sneeze in Spanish).
- Doña Abuela and Don Abuelo washing: "¿Qué lavo?" -> "¿Qué me lavo?" (English "What do I wash before baking? (say it!)" / "What do I wash now? (say it!)"). Body parts are washed with "me": "me lavo las manos".
- Don Pepe's yes/no game: "¿[sientate]?" -> "¿Está [sientate:sentado]?" and "¿Y ahora? ¿[sientate]?" -> "¿Y ahora? ¿Está [sientate:sentado]?" (English "Is he sitting?"). The card is still the dog's trick "siéntate".
- paw prints: "¡Mira! ¡[pata:Huellas]!" -> "¡Mira! ¡Huellas!" (English "Look! Paw prints! Ask Nico."). It is a plain line now: the "pata" card was the wrong card for "huellas".
- the notebook's cards, chapter 16 (four lines): "cartas" -> "tarjetas".
  - Gómez: "¿Tus cartas? {dog}... ¡[busca]!" -> "¿Tus tarjetas? {dog}... ¡[busca]!"
  - the tree: "Una carta... ¡en el [arbol]!" -> "Una tarjeta... ¡en el [arbol]!"
  - the card on the lawn: new line "¡La tarjeta! ...¿Y esta?" (English "The card flutters down! ...And one more, on the lawn: someone is sitting on it!")
  - Inés: "¡Tus cartas! A ver... ¡{dog}!" -> "¡Tus tarjetas! A ver... ¡{dog}!"
- the family photo: "¿Qué es?" -> "¿Quiénes son?" (English "Who is in the photo?"). More than one person, so "quiénes".
- Lola in the mountains: "¡Don Lucho! ¡Ven!" -> "¡Mira! ¡Don Lucho!" (English "Look! That's Don Lucho, who looks after the refuge. Go and say hello!"). She points him out; "¡Ven!" told the child to come to her.
- the white hens: "¿Cuántas [gallina:gallinas] [blanco:blancas]?" is answered with the card "uno" shown as "una" (one hen is "una"). The card reads as it is said in the line.

### Questions for the reviewer
There are none new. Every line above was settled from dictionaries of Mexican Spanish. Least sure: "¡Achú!" (the other spelling is "¡Achís!", also said), and "la banca" for a bench in a park (certain in Mexico City and the north; "el banco" is also heard).

---

## Batch 6 (2026-11-25): the unit "En casa", the 20 new words
Twenty new cards for the kitchen and the table (`docs/UNIT_EN_CASA.md`). Only the words are listed here; the lines
the people say in the four chapters are added by the helpers who write them. The card shows the part before the "/";
the rest is what the microphone also accepts.

### Words
| Card (English) | Card shows | Also accepted by the microphone | Dictionary basis |
| --- | --- | --- | --- |
| the mom | la mamá | mamá, mami, mamita, mi mamá | "mamá" is the standard word; "mami" is the everyday Mexican form for a young child. |
| the dad | el papá | papá, papi, papito, mi papá | The same: "papá", and "papi" for a child. Written "el papá" with the accent (singular); the plural is "los papás" (also "los papás" = the parents). |
| the brother | el hermano | hermanito, mi hermano, hermano | Standard. "Hermanito" is what a big sister says to a little brother. |
| the kitchen | la cocina | cocinita, mi cocina | Standard. |
| the table | la mesa | mesita, la mesita | Standard. |
| the chair | la silla | sillita, sillas | Standard. |
| the plate | el plato | platito, platos | Standard. "Plato" is both the plate and the dish of food. |
| the glass | el vaso | vasito, vasos | Standard. In Mexico a drinking glass is "un vaso" (a wine glass is "una copa"). |
| the spoon | la cuchara | cucharita, cucharas | Standard. |
| the soup | la sopa | sopita | Standard. In Mexico "sopa" can also mean the rice or pasta course; the picture is a broth with vegetables. Said without an article after "Quiero" (a mass word: "Quiero sopa"). |
| the tortilla | la tortilla | tortillas, tortillita | In Mexico "la tortilla" is the corn (or flour) flat bread. It is not the Spanish potato omelette. |
| the beans | los frijoles | frijol, el frijol, frijolitos | "Frijol" is the Mexican word (other countries say "judías", "habichuelas", "porotos"). Plural only on the card; bare after "Quiero" ("Quiero frijoles": a plural-only word is said bare by the phrase code). |
| the rice | el arroz | arrocito | Standard. A mass word: "Quiero arroz". |
| the taco | el taco | tacos, taquito | Standard in Mexico. |
| the avocado | el aguacate | aguacates, aguacatito | "Aguacate" is the Mexican (and general) word; "palta" is South American. |
| the lime | el limón | limones, limoncito, limón verde | In Mexico "el limón" is the small green lime (what a tree in a Mexican patio grows). The yellow lemon is "el limón amarillo", and is not taught. The plural "limones" is written in the word so the card is certain. |
| I'm hungry | tengo hambre | tengo mucha hambre, hambre, tiene hambre, tengo hambrita | The set phrase is "tener hambre". "Hambre" is feminine but takes "el" in the singular; here it is never given an article. |
| I'm thirsty | tengo sed | tengo mucha sed, sed, tiene sed | "Tener sed". |
| yummy! | ¡qué rico! | qué rico, rico, qué rica, está rico, riquísimo | "¡Qué rico!" is the usual Mexican cry for tasty food (also "¡qué rica!" for a feminine dish, such as the soup). The card uses the masculine; the microphone accepts "qué rica" too. |
| eat! | come | a comer, come come, cómetelo, comer, come todo | The command to one person (tú): "come". "A comer" is also said to call people to the table. |

### Things to know
- Where each word is first said, a story line may use it with an article from the code (`la [sopa]`); the words were not typed with an article in any template.
- The plurals of the picture-and-request words ("dos platos", "dos limones", "los frijoles") come from the word's `pl` or from the code's rules; "limones" and "platos" were checked by hand.

### Questions for the reviewer
1. "El limón" for the green lime: certain for Mexico. If a child's Spanish-speaking family says "lima", the card could read "el limón / la lima"; kept as "el limón".
2. "Come" as the card for "eat!": clear to the writer. A Mexican parent might say "¡A comer!" to call the family (accepted by the microphone) and "¡Come!" to the dog or a child; both stay.
3. "¡Qué rico!": certain for food. Said by a child about something delicious; "¡qué rica!" is the feminine and is accepted.
4. Least sure: "el papá" and "la mamá" as written with an article for a child's own parents. Many Mexican families say just "Mamá" or "mi mamá"; the card uses the article so the rule for "el / la" is learned, and the microphone accepts "mamá", "mami" and "mi mamá".

## Batch 7 (2026-11-25): En casa, the rooms and the people (docs/UNIT_EN_CASA.md)
The new rooms and the two new people. The words of the unit and the story lines come in later batches.

### Names
- "La cocina" (the kitchen) and "El patio" (the back yard): the names of the two new maps, as in any Mexican home. "Patio" is the usual word in Mexico for the yard at the back of a house.
- "Papá" and "Leo" (the child's father and little brother): their names as shown in the dialogue box and on the Amigos page.

### Lines
- Papá: "¡[hola], {name}!" (English "Hi, {name}!"). A plain greeting with the card "hola".
- Leo: "¡[hola]!" (English "Hi!").
- Mamá at the new doorway before the puppy is found: "¡{name}! ¡Espera!" (English "Wait a moment! (stay with Mamá)"). The same line she already says at the front door.

### The four chapter titles (shown in Misiones once their story is written)
- "¡Tengo hambre!" ("I am hungry": "tener hambre" is the way to say it in all of Spanish).
- "Pon la mesa" ("Set the table": "poner la mesa", and "pon" is the "tú" command of "poner").
- "Los tacos de Papá" (Papá's tacos).
- "Agua de limón" (lemon water: "agua de limón" is what it is called in Mexico, made with the small green "limón").

### Questions for the reviewer
None new. Least sure: nothing; every line above is a plain greeting or a set phrase from a dictionary of Mexican Spanish.

## Batch 9: En casa, chapters 3 and 4 (content/es/hogar-story2.js)
Chapter 3, "Los tacos de Papá", and chapter 4, "Agua de limón". Words in `[brackets]` are the ones taught; the article before a word comes from the word list, not from the line.

### Chapter 3: Los tacos de Papá
- Leo: "¡Tengo hambre!" (I am hungry). Set phrase.
- Leo: "¡Soy tu hermano!" (I am your brother).
- Leo: "¡A la cocina!" (To the kitchen!).
- Papá: "¡Hola, {name}! ¡Mira!" (Hi! Look!), then "¡Mira! ¡Una tortilla!".
- Papá: "¡A la mesa!" (To the table!), and "¡Muy bien!" (Well done!).
- Papá: "¡Y los frijoles!" (And the beans!). Mexican word is "frijoles".
- Papá: "¡Un taco!".
- Papá: "¡Para Leo!" (For Leo!).
- Papá: "¡Come, Leo!" (Eat, Leo!). The "tú" command of "comer".
- Leo: "¡Qué rico!" (Yummy!). Set phrase in Mexico.
- Papá: "¡Y {dog}!" (And {dog}!), and the child's turn "{dog}... ¡Come!".
- Leo: "¡Come, {dog}!" (Eat, {dog}!).

### Chapter 4: Agua de limón
- Mamá: "¡Soy tu mamá!" (I am your mom).
- Mamá: "¡Uf! ¡Tengo sed!" (Phew! I am thirsty). "Tener sed" is the standard way to say it.
- Papá: "¡Mira! ¡Un limón!" (the lemon at the tree), "¡Mira! ¡Un aguacate!" (at the avocado tree), "¡Arroz!" (rice, no article: a mass word).
- Papá: "¡Mmm!", then "¡Agua de limón!" (the word "agua" is a card only when it is already met).
- Papá: "¡Un vaso! ¿Para quién?" (A glass! Who is it for?).
- Mamá: "¡Qué rico!" and "¡Y para la comida!" (And for lunch!).
- Papá: "¡Muy bien, {name}!" and "¡A la mesa!".
- At the table. Papá: "¡Come, {name}!". Mamá: "¡Agua de limón! ¡Qué rico!". Leo: "¡Arroz! ¡Qué rico!".

### Questions for the reviewer
- "Agua de limón": in Mexico "limón" is the small green lime, so this is the usual name for limeade. A yellow lemon would be "limón amarillo". I am fairly sure, but there is no native check.
- "Come" as the command to a person and to the dog ("¡Come, Leo!", "¡Come, {dog}!"): the "tú" form of "comer". Some families would say "¡A comer!" to call everyone; that form is in the word's alternatives for the microphone.
- "¡Soy tu mamá!" and "¡Soy tu hermano!": natural, but a child would more often say "mi mamá" about her own mother. Here the person speaks to the child, so "tu" is right.
- "Los tacos de Papá" and "Agua de limón" are the chapter titles from batch 7, unchanged.
Least sure: "¡Y para la comida!" (the Mexican "comida" means the midday meal; fine for lunch).
