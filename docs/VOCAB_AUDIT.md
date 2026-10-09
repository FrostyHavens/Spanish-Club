# Vocabulary flow audit

How the words of Club de Español reach a child over one full playthrough, measured by `tools/vocab-audit.js` (the playthrough's own taps, paced like a child, speaking about a third of the answers; method at the end). Everything below the AUDIT marker is generated; this findings section is written by hand from the run of 2026-10-09 (seed 7, 41 game minutes, 3 sessions of 15 minutes, 2 evenings at home).

**Re-run:** `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 20 minutes; options `--speak 0.35 --wrong 0.12 --pages 8 --seed 7`; `--from <dump.json>` re-analyses a saved run). It rewrites only the part between the AUDIT markers.

## Findings

In one sentence: **the game shows almost all of its words in the first quarter of an hour, then asks the child to use only some of them, mostly once.** All 78 words were met, but 29 (37%) were still not learned when the diploma came up, 30 were never picked or said even once, and the median word was actively used once in 41 minutes.

### The top problems, ranked

1. **Almost everything arrives in the first 15 minutes, half of it as notebook dumps.** 65 of the 78 words are met in session 1 (40 in the first 5 minutes; 15 in Mamá's 34-second intro alone), against 11 in session 2 and 2 in session 3. 43 words are first met on a notebook page, and the pages come in 4-9 word blocks: *Los animales* (6 new words at 0:54), *Los números* (5 at 1:12), *En el pueblo* (7 at 1:23), *Mi perro* (7 at 9:00). 33 of the 43 page words were not used within 5 minutes; from *Los animales* and *En el pueblo*, none were, and only 2 of the 7 *En el pueblo* words were ever used at all. The later sessions are the opposite problem: 13 new words in 26 minutes, while the errands there (picnic, count, sounds, flowers, party) are the richest in questions.
2. **Whole groups of words are never asked for, so they can never be learned by tapping.** 30 words were never picked as a right answer nor said, and 29 never turned gold: five of the seven *En el pueblo* things (árbol, flor, fuente, puerta, ventana), six farm and park animals (pájaro, pez, conejo, pato, rana, caballo; they are tapped, counted and listened to, but every question about them has a number or a sound as its answer), the numbers *seis-nueve* (Luna counts them herself; only *diez* is asked), *cuatro* and *cinco*, *naranja* and *uvas*, *escuela* and *parque*, *negro* and *café*, *guau*, *pío*, *galleta*, *hueso*, *cama* and *gira*. Their only way to gold is the say-it-back mic after a tap (which this bot does not use) or Canelo's menu, so a child who doesn't speak, or speaks rarely, ends the game with a third of the notebook blue.
3. **One use per word, then it is gone: no spaced retrieval.** Median active retrievals per word: 1 (19 words exactly 1, only 12 words 5 or more), and the retrievals pile onto a few words: *sí* 15, *hola* 13, then *buenos días*, *perro*, *ven*, *uno*, *dame la pata* 6 each. 38 words were never used again after the errand that introduced them; 8 words were learned and then never met again at all (verde, biblioteca, diez, banco, mariposa, gallina, miau, bee); 27 words had a gap of more than 15 minutes between two meetings (uvas 34 min, galleta 26, mariposa 25, pájaro 25, árbol 24). The only cross-errand review is the voice greeting (hola / buenos días / bien), the party's ribbons (colours) and Canelo's tricks.
4. **Words wait a long time between being met and being used.** Median time from first meeting to first use: 7.6 minutes (quartiles 1.8 / 7.6 / 14.1 min), against CONTENT.md's "make every new word appear in a question soon after it's taught". This is mostly the page dumps of problem 1 (pages are found long before the errand that uses their words: *Los números* at 1:12, numbers 6-10 asked at 28:00).
5. **Words are introduced as wrong answers before they are taught.** 18 words are met first as a distractor card: *uvas* and *carta* in Mamá's very first question, then pan, biblioteca, diez, leche, agua, pato, gallina, caballo, cabra, cuac, croac, feliz, triste, cansado. The card shows the picture and the blue word, so it is an exposure, but as the thing *not* to pick; *uvas* is never the answer anywhere (0 uses in the whole game).
6. **Many "right answers" are matching, not remembering.** 30 of the 105 tapped right answers had the answer in the prompt itself: its text (`¡[hola]!` -> hola, `¡[adios]!` -> adiós) or its picture (every "¡Dile a Canelo!" shows the trick's own picture above the cards). 43 of the 105 had the answer's picture on its card (the word was still blue). *adiós* and *gira* were only ever retrieved that way.
7. **Some words turn gold without their own puzzle.** `learn:` lists more than the answer: *¿cómo estás?* is learned by answering *bien*, *rojo* by answering *sí* to a red ball, *carta* by answering *panadería*. *¿cómo estás?* and *carta* were then never picked or said in the whole game, yet show as learned in the notebook and on the diploma.
8. **Overload moments.** Two windows with more than 8 new words in 5 minutes: 0:02 (40 words: the intro, the *Saludos* page and the pages near home) and 9:02 (21 words: Canelo arrives with *Mi perro*'s 7, then the lost-Canelo errand adds pato, parque, guau, the bakery's food, feliz, triste, cansado...). Seven bursts of 5+ new words within 30 seconds.
9. **Smaller things.** *seis, siete, ocho, nueve, diez, negro, café, ventana, pío* each appear in one moment only. *banco, ventana, pío* are not met in the last 30 minutes. The errands differ a lot in their teaching: the party re-uses 31 older words (14 actively), the picnic 24 (8), while *Saludos* and *El mercado* are over in under two minutes and nothing later re-asks naranja, uvas, cuatro or cinco.

### What would help (suggestions, not done here)
- Spread the pages out: tie each page to the errand that uses it (Luna's count hands over *Más números*; the picnic gives *El día de campo*), and follow every page with 2-3 questions on its words.
- Make every word an answer at least twice in different errands: "¿Qué es?" on the animals in Luna's count before the number, Nico's game asking "¿Quién dice cuac?" (el pato), Lucía's flowers asking for *la flor*, a step at the fountain / door / window, Luna counting 6-9 *with* the child.
- A light review: the daily greeting and the shops could ask for a word that is due (seen but not learned, or not used for 10+ minutes) instead of hola / buenos días every time.
- Distractors from words already met; `learn` only the word that was answered (or ask the co-learned word next).
- Use this audit after content changes: words with 0 active uses, page-first words without a question within 5 minutes and 5-minute windows with more than 8 new words are the numbers to watch.

### Limits of this measurement
- One bot, one seed. It goes straight to the next thing the hint hand would show, picks up a page sparkle only when it is on screen within 8 tiles (7 pages that way, plus *Saludos* and *Mi perro*, which are handed over; *La comida*, *El pueblo*, *¿Qué dicen?* (the barn door, where an errand step keeps winning the tap), *Más números* and *Así me siento* were not found, so their words came from dialogue and questions), never opens the notebook by itself, never replays lines and never says a tapped word back (the say-it-back mic would teach the tap-anything words). A real child is slower and more random, so real times are longer (the README expects 5-10 minutes per errand; here the eight Round B errands took 1.5-9 minutes each, the picnic 25 minutes because it was left open).
- Speaking: 34 question answers and 9 new-word cards were said out loud by a fake recognizer (35% of mic questions); 15 wrong taps were made on purpose (12% of card questions).
- The whole run is one calendar day, so the once-a-day greetings and say-it-back stars happen once per person / word; over several real days greetings repeat.

<!-- AUDIT:BEGIN (generated by tools/vocab-audit.js; edit outside these markers) -->
## Run
One full tap playthrough (tools/playflow.js), 2026-10-09: every Round A and Round B errand, the animal party and the diploma. Speaking: 35% of mic questions answered by voice (34 answers + 9 new-word cards); 12% of picture-card questions got one wrong tap first (15); notebook-page sparkles picked up when on screen within 8 tiles (9 of 14 pages found in all: saludos, animales, numeros, cosas, colores, mascota, campo, colores2, granja); seed 7. Game time 41:15 (41.2 min) with a child's pace added for reading, listening, thinking and looking; 3 sessions of 15 min; 2 evening(s) at home.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 78 |
| Met at least once / learned by the end | 78 / 49 |
| First met via | page 43, choice-shown 18, dialogue 11, question 2, picture 1, banner 1, heard 1, tapped-object 1 |
| Active retrievals (picked right + said) | 148 (105 picked, 43 said); 29% of the picks were cued (the answer was in the prompt's text or picture) |
| Median time from first meeting to first use | 6:50 |
| Median encounters per word (distinct moments) | 6 (min 1, max 33) |
| Median active retrievals per word | 1 |
| Most new words in any 5 minutes | 40 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 7. 0:02 15 words via banner/dialogue/choice-shown/question/page in Mamá's intro (7 used within 5 min); 0:52 11 words via page in finding a page (1 used within 5 min); 1:23 9 words via page/picture/dialogue in finding a page, El mercado (`mercado`) (1 used within 5 min); 4:10 5 words via dialogue/page in La carta (`carta`), finding a page (1 used within 5 min); 9:02 8 words via page/choice-shown in Canelo becomes yours, ¿Dónde está Canelo? (`canelo`) (2 used within 5 min); 10:05 5 words via dialogue/choice-shown in ¿Dónde está Canelo? (`canelo`), shops & presents (2 used within 5 min); 28:11 5 words via dialogue/choice-shown in ¿Cuántos animales? (`cuenta`) (1 used within 5 min).
- **Notebook pages as the first meeting**: 43 words; 33 of them not used within 5 minutes: comoestas, porfavor, uno, dos, cuatro, cinco, rojo, verde, amarillo, huevo, galleta, blanco, negro, cafe, arbol, flor, fuente, banco, puerta, ventana, granja, perro, gato, pajaro, mariposa, pez, conejo, rana, hueso, cama, salta, pata, gira.
- **Overload moments** (more than 8 new words in 5 minutes): 2. 0:02: 40 (casa, hola, manzana, pelota, buenosdias, uvas, carta, adios, comoestas, bien, gracias, porfavor, … (+28)); 9:02: 21 (hueso, cama, sientate, ven, salta, pata, gira, pato, parque, guau, pan, leche, … (+9)).
- **Never actively retrieved** (never picked right or said): 30: comoestas, cuatro, cinco, naranja, uvas, escuela, parque, carta, seis, siete, ocho, nueve, galleta, negro, cafe, arbol, flor, fuente, puerta, ventana, pajaro, pez, conejo, pato, rana, caballo, guau, pio, hueso, cama.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 2: adios, gira.
- **Met once and never again** (one moment only): 9: seis, siete, ocho, nueve, diez, negro, cafe, ventana, pio. Three moments or fewer: 15.
- **Long gaps** (more than 15 min between two meetings): 27: uvas 34.4m, galleta 25.7m, mariposa 24.8m, pajaro 24.7m, arbol 24.4m, porfavor 22.9m, cuatro 21.8m, cinco 20.6m, ven 19.6m, huevo 19.2m, salta 18.8m, leche 18.6m, pata 18.4m, sientate 18.4m, hueso 18.4m, cama 18.3m, conejo 18.2m, parque 17.9m, escuela 17.6m, queso 17.1m, pez 16.7m, pato 16.7m, pelota 16.5m, platano 16.2m, verde 16.2m, … (+2).
- **Not recalled after the errand that introduced it**: 38: adios, comoestas, cuatro, cinco, platano, naranja, uvas, escuela, parque, panaderia, carta, seis, siete, ocho, nueve, diez, galleta, negro, cafe, rosa, arbol, flor, fuente, puerta, ventana, pajaro, pez, conejo, pato, rana, caballo, cabra, guau, pio, cuac, croac, hueso, cama.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 3: comoestas (co-learned with bien), rojo (co-learned with si), carta (co-learned with panaderia).
- **Learned, then never met again**: 8: verde, biblioteca, diez, banco, mariposa, gallina, miau, bee.
- **Faded out** (not met in the last 30 minutes of play): 3: banco, ventana, pio.
- **Never learned**: 29: cuatro, cinco, naranja, uvas, escuela, parque, seis, siete, ocho, nueve, galleta, negro, cafe, arbol, flor, fuente, puerta, ventana, pajaro, pez, conejo, pato, rana, caballo, guau, pio, hueso, cama, gira. **Never met**: 0.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mamá's intro | 0:02-0:36 | 15: casa, hola, manzana, pelota, buenosdias, uvas, carta, adios, comoestas, bien, gracias, porfavor, si, no, escuela | 3 | 0 (0) | 3 | 3 | 1 |
| finding a page | 0:52-26:04 | 29: perro, gato, pajaro, mariposa, pez, conejo, uno, dos, tres, cuatro, cinco, arbol, flor, fuente, banco, puerta, ventana, granja, rojo, azul, verde, amarillo, queso, huevo, galleta, blanco, negro, cafe, rana | 0 | 1 (0) | 0 | 0 | 0 |
| other | 2:02-39:58 | 0 | 0 | 2 (0) | 0 | 0 | 0 |
| Saludos (`saludos`) | 2:30-3:44 (1.2m) | 0 | 3 | 12 (4) | 5 | 0 | 0 |
| exploring (tap-anything) | 2:58-36:45 | 1: pio | 0 | 4 (0) | 0 | 0 | 0 |
| greetings | 4:01-25:02 | 0 | 0 | 7 (3) | 11 | 6 | 2 |
| La carta (`carta`) | 4:13-13:44 (9.5m) | 2: panaderia, biblioteca | 3 | 7 (1) | 3 | 0 | 0 |
| La pelota roja (`pelota`) | 4:44-8:28 (3.7m) | 0 | 3 | 11 (4) | 7 | 0 | 0 |
| El mercado (`mercado`) | 5:21-6:54 (1.6m) | 2: naranja, platano | 7 | 14 (7) | 11 | 0 | 0 |
| Canelo becomes yours | 8:59-9:18 | 7: hueso, cama, sientate, ven, salta, pata, gira | 0 | 1 (0) | 1 | 1 | 0 |
| ¿Dónde está Canelo? (`canelo`) | 9:22-14:40 (5.3m) | 10: pato, guau, parque, bee, cabra, gallina, caballo, triste, feliz, cansado | 4 | 17 (4) | 11 | 1 | 0 |
| shops & presents | 10:13-23:08 | 3: pan, leche, agua | 1 | 7 (1) | 3 | 0 | 0 |
| teaching Canelo | 12:04-19:28 | 0 | 3 | 9 (5) | 12 | 8 | 3 |
| El día de campo (`picnic`) | 15:36-41:08 (25.5m) | 1: rosa | 4 | 24 (8) | 13 | 2 | 1 |
| Tomás está cansado (`cansado`) | 16:30-24:31 (8.0m) | 0 | 4 | 18 (7) | 8 | 0 | 0 |
| El show de perros (`show`) | 16:51-20:24 (3.5m) | 1: miau | 3 | 20 (8) | 10 | 4 | 1 |
| the evening at home | 20:39-39:32 | 0 | 0 | 4 (1) | 2 | 1 | 0 |
| ¿Cuántos animales? (`cuenta`) | 25:15-28:27 (3.2m) | 5: seis, siete, ocho, nueve, diez | 1 | 14 (4) | 9 | 0 | 2 |
| ¿Qué dicen? (`sonidos`) | 28:52-33:12 (4.3m) | 2: cuac, croac | 4 | 12 (4) | 7 | 0 | 0 |
| Las flores de Lucía (`flores`) | 29:19-30:49 (1.5m) | 0 | 4 | 19 (7) | 9 | 0 | 0 |
| La fiesta de los animales (`fiestab`) | 33:48-38:51 (5.1m) | 0 | 2 | 31 (14) | 23 | 4 | 5 |

## Per 15-minute session
| Session | Game time | New words (from pages) | Learned | Picked right | Said | Wrong | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0:00-15:00 | 65 (39) | 25 | 38 | 16 | 4 | 0 | saludos, mercado, pelota, carta, canelo |
| 2 | 15:00-30:00 | 11 (4) | 17 | 38 | 13 | 5 | 27 | show, cansado, cuenta |
| 3 | 30:00-41:15 | 2 (0) | 7 | 29 | 14 | 6 | 24 | flores, sonidos, fiestab, picnic |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | ######################################## 40 | 8 | 12 | 40 / 8 | hola, adios, buenosdias, comoestas, bien, gracias, porfavor, si, no, uno, dos, tres, cuatro, cinco, manzana, platano, naranja, uvas, rojo, azul, verde, amarillo, pelota, casa, escuela, panaderia, carta, arbol, flor, fuente, banco, puerta, ventana, granja, perro, gato, pajaro, mariposa, pez, conejo | Mamá's intro, finding a page, mercado, saludos, exploring (tap-anything), greetings, carta, pelota |
| 5:00 | ######### 9 | 9 | 23 | 49 / 17 | pato, pio, hueso, cama, sientate, ven, salta, pata, gira | greetings, mercado, exploring (tap-anything), pelota, Canelo becomes yours, canelo |
| 10:00 | ################ 16 | 8 | 19 | 65 / 25 | pan, parque, biblioteca, leche, queso, huevo, agua, galleta, gallina, caballo, cabra, guau, bee, feliz, triste, cansado | canelo, shops & presents, greetings, teaching Canelo, exploring (tap-anything), finding a page, carta |
| 15:00 | ## 2 | 7 | 23 | 67 / 32 | rosa, miau | teaching Canelo, exploring (tap-anything), picnic, cansado, show, greetings |
| 20:00 | ### 3 | 6 | 14 | 70 / 38 | blanco, negro, cafe | show, the evening at home, cansado, picnic, finding a page, shops & presents, greetings |
| 25:00 | ###### 6 | 4 | 14 | 76 / 42 | seis, siete, ocho, nueve, diez, rana | greetings, cuenta, exploring (tap-anything), finding a page, flores |
| 30:00 | ## 2 | 5 | 19 | 78 / 47 | cuac, croac | flores, sonidos, fiestab, exploring (tap-anything) |
| 35:00 | . 0 | 2 | 17 | 78 / 49 |  | fiestab, exploring (tap-anything), the evening at home |
| 40:00 | . 0 | 0 | 7 | 78 / 49 |  | picnic |

## Per word
*First*: game time and how it first reached the child. *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | First | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| casa *la casa* | 0:02 | banner | intro | 21:21 | 17 | 28 | 1 (0, 0) | 0 | 2.5m / 8.2m | 39:20 | 7 | 3 | 21:23 (answer) | yes |
| hola *hola* | 0:02 | dialogue | intro | 0:09 | 25 | 70 | 13 (3, 6) | 0 | 1.7m / 8.9m | 40:09 | 6 | 3 | 0:12 (answer) | yes |
| manzana *la manzana* | 0:06 | choice-shown | intro | 5:39 | 10 | 27 | 3 (0, 0) | 1 | 2.6m / 7.7m | 23:32 | 5 | 2 | 5:45 (answer) | yes |
| pelota *la pelota* | 0:06 | choice-shown | intro | 8:04 | 14 | 31 | 2 (1, 0) | 1 | 2.9m / 16.5m | 38:03 | 4 | 3 | 8:11 (said) | yes |
| buenosdias *buenos días* | 0:16 | question | intro | 0:04 | 7 | 22 | 6 (3, 3) | 0 | 6.5m / 15.6m | 39:32 | 2 | 3 | 0:21 (answer) | yes |
| uvas *las uvas* | 0:16 | choice-shown | intro | never | 4 | 8 | 0 (0, 0) | 1 | 13.3m / 34.4m | 40:07 | 2 | 2 | no | no |
| carta *la carta* | 0:16 | choice-shown | intro | never | 11 | 33 | 0 (0, 0) | 0 | 2.4m / 5.0m | 24:24 | 3 | 2 | 13:37 (co-learned with panaderia) | no |
| adios *adiós* | 0:24 | page | intro | 0:11 | 24 | 34 | 1 (0, 1) | 3 | 1.7m / 5.4m | 39:28 | 4 | 3 | 0:36 (answer) | no |
| comoestas *¿cómo estás?* | 0:24 | page | intro | never | 6 | 12 | 0 (0, 0) | 0 | 4.9m / 14.1m | 24:56 | 1 | 2 | 2:14 (co-learned with bien) | no |
| bien *bien* | 0:24 | page | intro | 1:49 | 6 | 11 | 5 (1, 0) | 0 | 4.9m / 14.1m | 25:02 | 1 | 2 | 2:14 (said) | yes |
| gracias *gracias* | 0:24 | page | intro | 2:01 | 33 | 52 | 4 (0, 0) | 0 | 1.3m / 6.3m | 41:08 | 10 | 3 | 2:26 (answer) | yes |
| porfavor *por favor* | 0:24 | page | intro | 6:07 | 5 | 9 | 1 (1, 0) | 0 | 7.2m / 22.9m | 29:14 | 3 | 2 | 6:32 (said) | yes |
| si *sí* | 0:24 | page | intro | 1:12 | 27 | 51 | 15 (5, 0) | 0 | 1.4m / 8.4m | 35:44 | 11 | 3 | 1:37 (answer) | yes |
| no *no* | 0:24 | page | intro | 1:20 | 27 | 38 | 4 (0, 0) | 1 | 1.5m / 8.2m | 40:09 | 9 | 3 | 1:45 (answer) | yes |
| escuela *la escuela* | 0:30 | dialogue | intro | never | 9 | 11 | 0 (0, 0) | 0 | 4.1m / 17.6m | 33:38 | 2 | 3 | no | no |
| perro *el perro* | 0:52 | page | page | 8:36 | 9 | 14 | 6 (2, 0) | 0 | 4.0m / 13.6m | 33:11 | 3 | 3 | 9:28 (answer) | yes |
| gato *el gato* | 0:52 | page | page | 18:18 | 7 | 14 | 2 (0, 0) | 0 | 5.3m / 13.6m | 33:04 | 3 | 3 | 19:11 (answer) | yes |
| pajaro *el pájaro* | 0:52 | page | page | never | 4 | 5 | 0 (0, 0) | 1 | 12.2m / 24.7m | 37:30 | 2 | 2 | no | no |
| mariposa *la mariposa* | 0:52 | page | page | 29:23 | 3 | 7 | 1 (0, 0) | 0 | 14.7m / 24.8m | 30:20 | 1 | 3 | 30:16 (answer) | yes |
| pez *el pez* | 0:52 | page | page | never | 6 | 8 | 0 (0, 0) | 0 | 5.9m / 16.7m | 30:11 | 3 | 3 | no | no |
| conejo *el conejo* | 0:52 | page | page | never | 4 | 6 | 0 (0, 0) | 0 | 10.6m / 18.2m | 32:42 | 3 | 3 | no | no |
| uno *uno* | 1:14 | page | page | 14:45 | 14 | 32 | 6 (1, 0) | 0 | 2.0m / 9.4m | 28:11 | 4 | 2 | 15:59 (answer) | yes |
| dos *dos* | 1:14 | page | page | 5:03 | 10 | 28 | 4 (1, 0) | 1 | 2.9m / 9.4m | 28:11 | 4 | 2 | 6:17 (answer) | yes |
| tres *tres* | 1:14 | page | page | 4:40 | 12 | 28 | 2 (0, 0) | 0 | 2.7m / 10.1m | 30:33 | 6 | 3 | 5:54 (answer) | yes |
| cuatro *cuatro* | 1:14 | page | page | never | 3 | 9 | 0 (0, 0) | 0 | 13.2m / 21.8m | 28:11 | 2 | 2 | no | no |
| cinco *cinco* | 1:14 | page | page | never | 6 | 10 | 0 (0, 0) | 1 | 6.9m / 20.6m | 35:44 | 3 | 3 | no | no |
| arbol *el árbol* | 1:23 | page | page | never | 4 | 6 | 0 (0, 0) | 0 | 11.2m / 24.4m | 34:55 | 1 | 2 | no | no |
| flor *la flor* | 1:23 | page | page | never | 13 | 29 | 0 (0, 0) | 0 | 3.0m / 14.2m | 36:52 | 3 | 3 | no | no |
| fuente *la fuente* | 1:23 | page | page | never | 7 | 12 | 0 (0, 0) | 0 | 2.5m / 8.8m | 16:07 | 2 | 2 | no | no |
| banco *el banco* | 1:23 | page | page | 9:10 | 3 | 7 | 1 (0, 0) | 0 | 4.5m / 8.7m | 10:38 | 1 | 1 | 10:34 (answer) | yes |
| puerta *la puerta* | 1:23 | page | page | never | 2 | 3 | 0 (0, 0) | 0 | 10.1m / 10.1m | 11:29 | 1 | 1 | no | no |
| ventana *la ventana* | 1:23 | page | page | never | 1 | 1 | 0 (0, 0) | 0 | - | 1:23 | 0 | 1 | no | no |
| granja *la granja* | 1:23 | page | page | 21:15 | 14 | 31 | 1 (0, 0) | 0 | 2.8m / 10.1m | 37:36 | 4 | 3 | 22:39 (answer) | yes |
| naranja *la naranja* | 1:41 | picture | mercado | never | 4 | 9 | 0 (0, 0) | 0 | 7.1m / 10.1m | 23:03 | 2 | 2 | no | no |
| platano *el plátano* | 1:49 | dialogue | mercado | 4:16 | 5 | 14 | 2 (2, 0) | 0 | 5.3m / 16.2m | 23:03 | 1 | 2 | 6:06 (said) | no |
| panaderia *la panadería* | 4:10 | dialogue | carta | 9:26 | 5 | 7 | 1 (0, 0) | 0 | 9.0m / 16.0m | 39:58 | 2 | 3 | 13:37 (answer) | no |
| rojo *rojo / roja* | 4:26 | page | page | 15:40 | 10 | 22 | 2 (1, 0) | 0 | 3.5m / 11.5m | 36:17 | 4 | 3 | 7:55 (co-learned with si) | yes |
| azul *azul* | 4:26 | page | page | 3:56 | 8 | 13 | 4 (3, 0) | 1 | 4.5m / 11.5m | 36:17 | 4 | 3 | 8:22 (said) | yes |
| verde *verde* | 4:26 | page | page | 31:56 | 5 | 12 | 1 (0, 0) | 1 | 7.9m / 16.2m | 36:22 | 3 | 3 | 36:22 (answer) | yes |
| amarillo *amarillo / amarilla* | 4:26 | page | page | 15:52 | 7 | 11 | 3 (1, 0) | 0 | 5.3m / 12.0m | 36:16 | 4 | 3 | 20:18 (answer) | yes |
| pio *pío* | 5:27 | tapped-object | explore | never | 1 | 3 | 0 (0, 0) | 0 | - | 5:27 | 0 | 1 | no | no |
| hueso *el hueso* | 9:02 | page | canelo-dog | never | 4 | 6 | 0 (0, 0) | 0 | 9.7m / 18.4m | 38:09 | 2 | 3 | no | no |
| cama *la cama* | 9:02 | page | canelo-dog | never | 5 | 5 | 0 (0, 0) | 0 | 7.3m / 18.3m | 38:25 | 2 | 3 | no | no |
| sientate *siéntate* | 9:02 | page | canelo-dog | 0:13 | 7 | 28 | 5 (1, 4) | 1 | 4.8m / 18.4m | 38:25 | 2 | 3 | 12:24 (answer) | yes |
| ven *ven* | 9:02 | page | canelo-dog | 2:48 | 8 | 21 | 6 (1, 5) | 2 | 4.2m / 19.6m | 38:15 | 3 | 3 | 17:18 (answer) | yes |
| salta *salta* | 9:02 | page | canelo-dog | 9:22 | 9 | 27 | 5 (1, 4) | 0 | 3.7m / 18.8m | 38:30 | 3 | 3 | 18:49 (answer) | yes |
| pata *dame la pata* | 9:02 | page | canelo-dog | 8:33 | 8 | 26 | 6 (2, 4) | 0 | 4.2m / 18.4m | 38:23 | 2 | 3 | 18:02 (answer) | yes |
| gira *gira* | 9:02 | page | canelo-dog | 10:23 | 9 | 17 | 1 (0, 1) | 0 | 1.3m / 3.1m | 19:28 | 2 | 2 | no | yes |
| pato *el pato* | 9:23 | choice-shown | canelo | never | 8 | 16 | 0 (0, 0) | 0 | 4.0m / 16.7m | 37:26 | 4 | 3 | no | no |
| parque *el parque* | 10:05 | dialogue | canelo | never | 6 | 10 | 0 (0, 0) | 0 | 6.1m / 17.9m | 40:31 | 5 | 3 | no | no |
| guau *guau* | 10:05 | dialogue | canelo | never | 6 | 27 | 0 (0, 0) | 0 | 4.6m / 14.9m | 33:04 | 2 | 3 | no | no |
| pan *el pan* | 10:13 | choice-shown | shop | 2:58 | 13 | 25 | 4 (2, 1) | 0 | 2.5m / 13.0m | 40:58 | 5 | 3 | 13:12 (said) | yes |
| leche *la leche* | 10:13 | choice-shown | shop | 11:57 | 7 | 16 | 2 (1, 1) | 0 | 5.1m / 18.6m | 40:58 | 1 | 3 | 22:11 (said) | yes |
| agua *el agua* | 10:13 | choice-shown | shop | 0:04 | 15 | 29 | 5 (1, 0) | 0 | 2.2m / 14.4m | 41:05 | 3 | 3 | 10:18 (answer) | yes |
| bee *bee* | 11:51 | dialogue | canelo | 20:29 | 4 | 7 | 1 (0, 0) | 0 | 6.8m / 10.2m | 32:21 | 3 | 3 | 32:21 (answer) | yes |
| gallina *la gallina* | 11:52 | choice-shown | canelo | 25:40 | 5 | 9 | 1 (0, 0) | 0 | 6.4m / 9.9m | 37:33 | 4 | 3 | 37:33 (answer) | yes |
| caballo *el caballo* | 11:52 | choice-shown | canelo | never | 8 | 20 | 0 (0, 0) | 0 | 3.5m / 10.9m | 36:33 | 4 | 3 | no | no |
| cabra *la cabra* | 11:52 | choice-shown | canelo | 0:04 | 5 | 17 | 1 (0, 0) | 0 | 5.1m / 10.2m | 32:15 | 4 | 3 | 11:56 (answer) | no |
| queso *el queso* | 12:47 | page | page | 3:03 | 6 | 14 | 2 (2, 0) | 0 | 5.6m / 17.1m | 40:44 | 2 | 3 | 15:51 (said) | yes |
| huevo *el huevo* | 12:47 | page | page | 8:48 | 4 | 10 | 2 (1, 0) | 0 | 9.3m / 19.2m | 40:52 | 1 | 3 | 21:36 (answer) | yes |
| galleta *la galleta* | 12:47 | page | page | never | 4 | 6 | 0 (0, 0) | 0 | 9.4m / 25.7m | 41:05 | 2 | 2 | no | no |
| biblioteca *la biblioteca* | 13:32 | choice-shown | carta | 10:31 | 5 | 7 | 2 (1, 0) | 0 | 2.6m / 4.8m | 24:09 | 2 | 2 | 24:04 (answer) | yes |
| feliz *feliz* | 14:24 | choice-shown | canelo | 0:05 | 8 | 17 | 5 (2, 0) | 0 | 3.8m / 8.0m | 41:08 | 6 | 3 | 14:30 (answer) | yes |
| triste *triste* | 14:24 | choice-shown | canelo | 14:45 | 6 | 9 | 1 (0, 0) | 0 | 4.9m / 8.1m | 38:40 | 4 | 3 | 29:10 (answer) | yes |
| cansado *cansado / cansada* | 14:24 | choice-shown | canelo | 1:57 | 6 | 11 | 1 (0, 0) | 0 | 4.9m / 8.1m | 38:40 | 4 | 3 | 16:21 (answer) | yes |
| rosa *rosa* | 15:28 | heard | picnic | 14:07 | 6 | 12 | 1 (0, 0) | 0 | 5.0m / 10.7m | 40:58 | 2 | 2 | 29:36 (answer) | no |
| miau *miau* | 19:06 | question | show | 13:50 | 3 | 5 | 2 (2, 0) | 0 | 6.9m / 12.2m | 33:02 | 2 | 2 | 32:56 (said) | yes |
| blanco *blanco / blanca* | 22:22 | page | page | 7:33 | 5 | 7 | 1 (1, 0) | 0 | 3.5m / 6.9m | 36:10 | 2 | 2 | 29:56 (said) | yes |
| negro *negro / negra* | 22:22 | page | page | never | 1 | 1 | 0 (0, 0) | 0 | - | 22:22 | 0 | 1 | no | no |
| cafe *café* | 22:22 | page | page | never | 1 | 1 | 0 (0, 0) | 0 | - | 22:22 | 0 | 1 | no | no |
| rana *la rana* | 26:04 | page | page | never | 3 | 9 | 0 (0, 0) | 0 | 2.8m / 3.8m | 31:46 | 2 | 2 | no | no |
| seis *seis* | 28:11 | dialogue | cuenta | never | 1 | 3 | 0 (0, 0) | 0 | - | 28:17 | 1 | 1 | no | no |
| siete *siete* | 28:11 | dialogue | cuenta | never | 1 | 2 | 0 (0, 0) | 0 | - | 28:11 | 1 | 1 | no | no |
| ocho *ocho* | 28:11 | dialogue | cuenta | never | 1 | 3 | 0 (0, 0) | 0 | - | 28:17 | 1 | 1 | no | no |
| nueve *nueve* | 28:11 | dialogue | cuenta | never | 1 | 2 | 0 (0, 0) | 0 | - | 28:11 | 1 | 1 | no | no |
| diez *diez* | 28:17 | choice-shown | cuenta | 0:05 | 1 | 4 | 1 (0, 0) | 0 | - | 28:26 | 1 | 1 | 28:23 (answer) | no |
| cuac *cuac* | 31:18 | choice-shown | sonidos | 0:05 | 5 | 9 | 1 (0, 0) | 0 | 1.4m / 4.1m | 36:51 | 2 | 1 | 31:24 (answer) | no |
| croac *croac* | 31:18 | choice-shown | sonidos | 0:33 | 4 | 5 | 1 (0, 0) | 0 | 0.5m / 0.5m | 32:48 | 1 | 1 | 31:52 (answer) | no |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event: *shown* (in a dialogue line, a question prompt, a question's picture, the bag, a map banner), *heard* (spoken by the voice), *seen-first*, *page* (on a notebook page just found), *tapped-object* (tap-anything, an animal and its sound, the animal count), *choice-shown*, *recognized* (picked right by tap), *wrong*, *picked* (a free choice), *said* (said out loud and matched) and *learned*, with the game time, map, speaker and the episode.
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, a page, Canelo's tricks, a side job, the bag) says which errand it belonged to.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line (the voice reads at 0.85), ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a new-word card, 2 s for errand and badge cards, 5 s to look at a new notebook page, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around; the sunset (18 min) runs on this clock.
- Greetings (and say-it-back stars) come once per person per calendar day, and the whole run happens on one calendar day, so they are under-counted compared with play over several days.
- *Cued*: the right answer was in the prompt's own text (`¡[hola]!` -> hola) or the prompt's picture was the answer itself (Canelo's "¡Dile a Canelo!" shows the trick). *Active uses* count picks of the right answer by tap and answers said out loud; a free pick in a shop or Canelo's menu is not counted.
- Bursts: 5+ first meetings within 30 s. Overload: more than 8 first meetings within 5 minutes. Sessions: every 15 minutes of game time.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 20 minutes; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
