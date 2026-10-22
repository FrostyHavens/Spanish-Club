# Spanish review: lines for a native speaker to check

The game is written in Mexican Spanish for a 7-year-old who is just starting. Its lines are written in AI coding
sessions, so a native speaker checks them before they reach her. This file lists the lines that changed, in batches.

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
- Spelling of accepted forms: pececito, ericito, buhíto.
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
