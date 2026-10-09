# Vocabulary flow audit

How the words of Club de Español reach a child, measured by `tools/vocab-audit.js`: the playthrough's own taps over several play sessions on successive days, paced like a child, speaking about a third of the answers (method at the end). Everything below the AUDIT marker is generated, starting with the **measured targets** of `docs/LEARNING_DESIGN.md` (PASS / FAIL).

**Re-run:** `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 15 minutes; `--quick`: the game runs 3x faster, about 6 minutes; `--strict`: exit 1 when a target fails; options `--days 5 --session 15 --speak 0.35 --wrong 0.12 --pages 8 --seed 7`; `--from <dump.json>` re-analyses a saved run). It rewrites only the part between the AUDIT markers.

**Status (engine step, 2026-10-09):** the word model, adaptive questions, introductions, page puzzles and the multi-day audit are in; the content is still the old one, so most targets fail (the generated part below). The hand-written findings that follow are from the run **before the redesign** (one long session, the old seen/learned model) and are what the redesign answers.

## Findings (before the redesign)

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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 14 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): every Round A and Round B errand, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (78 answers + 7 gold cards); 12% of picture-card questions got one wrong tap first (44); page puzzles solved when their sparkle was on screen within 8 tiles: 15 (saludos, mascota, colores); seed 7. Game time 82:54 (82.9 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 6 | **FAIL** |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 2:26 (52% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 30 | 0 | 7: mariposa, croac, rosa, verde, gallina, triste, diez | **FAIL** |
| Words retrieved only with a cue | 2 | 0 | 1: leche | **FAIL** |
| Median active retrievals per word | 1 | ≥ 5 | 4 | **FAIL** |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 86% | **FAIL** |
| Prompts that review older words | low | 40–60% | 67% (371 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 5: pez, naranja, queso, uno, cuatro | **FAIL** |

### Chapters 1-10 on their own
The same targets for the 34 words of the chapters written so far, up to the moment the last of them was done (38:26). After them the older errands still run, meeting their words in bulk: they are what chapters 11-21 replace.

| Measure | Target | Now | |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 6 | **FAIL** |
| New words in the first 15-minute session | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 0 | 0 | PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:40 (68% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 0 | 0 | PASS |
| Words retrieved only with a cue | 0 | 0 | PASS |
| Median active retrievals per word | ≥ 5 | 6 | PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 97% | PASS |
| Prompts that review older words | 40–60% | 47% (175 prompts) | PASS |
| Words introduced as a wrong answer first | 0 | 0 | PASS |

Words by stage at the end: unmet 17, met 9, known 5, remembered 8, solid 34.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 56 / 42 (never met: 17, of them shown somewhere: 16) |
| Met via | answer 22, show 19, find 9, overheard 3, watch 3 |
| Active retrievals of met words (picked right + said) | 324 (253 picked, 71 said); 1% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 2:02 |
| Median encounters per word (distinct moments) | 12.5 (min 1, max 55) |
| Median active retrievals per word | 4 |
| Most new words in any 5 minutes | 6 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 0. .
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 0. .
- **Never actively retrieved** (never picked right or said): 7: mariposa, croac, rosa, verde, gallina, triste, diez.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 1: leche.
- **Met once and never again** (one moment only): 2: mariposa, verde. Three moments or fewer: 4.
- **Long gaps** (more than 15 min between two meetings): 22: carta 38.7m, miau 27.4m, cuac 27.4m, gato 27.1m, adios 26.5m, guau 24.6m, gallina 23.8m, rosa 23.4m, pata 21.8m, caballo 20.9m, hueso 20.4m, cama 19.5m, escuela 19.5m, pato 19.3m, comoestas 19.1m, bien 17.9m, cansado 17.9m, queso 17.6m, cabra 16.7m, manzana 16.0m, sientate 15.8m, ven 15.0m.
- **Not recalled after the errand that introduced it**: 9: mariposa, croac, leche, rosa, verde, gallina, carta, triste, diez.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 1: banco.
- **Faded out** (not met in the last 30 minutes of play): 1: banco.
- **Never learned**: 14: porfavor, mariposa, miau, croac, platano, queso, leche, rosa, verde, caballo, gallina, feliz, triste, diez. **Never met**: 17: busca, conejo, rana, pajaro, pez, naranja, galleta, panaderia, biblioteca, flor, arbol, cuatro, cinco, seis, siete, ocho, nueve.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-1:52 (1.8m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| El gato de la cerca (`c2`) | 1:56-3:52 (1.9m) | 0 | 1 | 4 (2) | 3 | 0 | 1 |
| exploring (tap-anything) | 2:13-80:30 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 2:16-75:28 | 7: gato, miau, rojo, parque, granja, cabra, escuela | 14 | 4 (4) | 69 | 0 | 1 |
| ¡Buenos días, Canelo! (`c3`) | 4:26-6:09 (1.7m) | 1: buenosdias | 0 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 4:36-70:47 | 5: hueso, sientate, pata, salta, gira | 3 | 6 (1) | 8 | 0 | 2 |
| greetings | 6:26-79:14 | 0 | 17 | 9 (6) | 75 | 0 | 12 |
| El juego de Don Pepe (`c4`) | 6:39-8:13 (1.6m) | 3: si, no, manzana | 4 | 7 (3) | 11 | 0 | 1 |
| finding a page | 8:40-78:05 | 0 | 8 | 7 (7) | 12 | 0 | 0 |
| La pelota roja (`c5`) | 9:14-10:44 (1.5m) | 1: pelota | 1 | 8 (3) | 7 | 0 | 2 |
| Pan para los patos (`c6`) | 11:25-14:29 (3.1m) | 2: pan, gracias | 1 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 12:27-74:00 | 7: pato, cuac, banco, fuente, carta, casa, caballo | 6 | 14 (8) | 35 | 0 | 9 |
| side jobs | 14:57-74:24 | 0 | 0 | 7 (1) | 1 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 16:21-21:35 (5.2m) | 0 | 2 | 4 (1) | 4 | 0 | 1 |
| hearts | 16:49-56:49 | 2: bien, comoestas | 1 | 13 (3) | 17 | 0 | 2 |
| La escuela de Luna (`c8`) | 22:38-26:38 (4.0m) | 0 | 2 | 5 (1) | 2 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 29:51-31:07 (1.3m) | 3: agua, cama, buenasnoches | 1 | 8 (1) | 5 | 0 | 3 |
| Tomás está cansado (`c10`) | 32:48-38:26 (5.6m) | 2: cansado, adios | 1 | 9 (3) | 6 | 0 | 1 |
| El mercado (`mercado`) | 40:37-42:25 (1.8m) | 4: tres, platano, dos, porfavor | 0 | 6 (2) | 3 | 0 | 1 |
| El día de campo (`picnic`) | 44:15-47:54 (3.7m) | 4: queso, uno, huevo, leche | 1 | 14 (4) | 9 | 3 | 1 |
| El show de perros (`show`) | 50:07-53:14 (3.1m) | 2: azul, amarillo | 1 | 14 (5) | 8 | 0 | 2 |
| ¿Qué dicen? (`sonidos`) | 57:59-61:09 (3.2m) | 1: croac | 2 | 10 (5) | 5 | 0 | 1 |
| Las flores de Lucía (`flores`) | 64:06-65:27 (1.4m) | 5: triste, blanco, rosa, mariposa, feliz | 0 | 10 (2) | 4 | 0 | 0 |
| ¿Cuántos animales? (`cuenta`) | 68:38-72:57 (4.3m) | 1: diez | 1 | 8 (4) | 8 | 0 | 1 |
| La fiesta de los animales (`fiestab`) | 75:56-82:50 (6.9m) | 2: verde, gallina | 0 | 25 (13) | 22 | 0 | 2 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-4:06 | 6 | 4 | 11 | 4 | 3 | 18 (0%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 4:06-8:31 | 6 | 5 | 13 | 5 | 2 | 24 (8%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 8:31-15:14 | 6 | 3 | 24 | 3 | 4 | 32 (47%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 15:14-21:53 | 5 | 6 | 24 | 7 | 2 | 32 (72%) | 9 | c7 |
| 5 | 2026-10-13 | 21:53-30:47 | 6 | 3 | 23 | 5 | 4 | 32 (47%) | 11 | c8 |
| 6 | 2026-10-13 | 30:47-32:08 | 0 | 1 | 2 | 1 | 1 | 3 (100%) | 2 | c9 |
| 7 | 2026-10-14 | 32:08-39:23 | 6 | 3 | 26 | 7 | 6 | 37 (70%) | 18 | c10 |
| 8 | 2026-10-15 | 39:23-43:34 | 4 | 4 | 11 | 3 | 2 | 18 (72%) | 9 | mercado |
| 9 | 2026-10-16 | 43:34-49:24 | 4 | 0 | 19 | 5 | 4 | 26 (69%) | 12 | picnic |
| 10 | 2026-10-17 | 49:24-57:08 | 4 | 4 | 16 | 15 | 5 | 35 (80%) | 22 | show |
| 11 | 2026-10-18 | 57:08-62:03 | 1 | 1 | 18 | 2 | 2 | 20 (95%) | 18 | sonidos |
| 12 | 2026-10-19 | 62:03-66:41 | 5 | 0 | 15 | 4 | 2 | 24 (79%) | 15 | flores |
| 13 | 2026-10-20 | 66:41-73:22 | 1 | 4 | 17 | 4 | 1 | 22 (95%) | 13 | cuenta |
| 14 | 2026-10-21 | 73:22-82:54 | 2 | 4 | 34 | 13 | 6 | 48 (96%) | 23 | fiestab |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | ######## 8 | 4 | 14 | 8 / 4 | hola, buenosdias, ven, hueso, perro, gato, guau, miau | c1, Canelo becomes yours, c2, exploring (tap-anything), c3, teaching Canelo |
| 5:00 | ##### 5 | 5 | 26 | 13 / 9 | si, no, sientate, pelota, manzana | teaching Canelo, c3, greetings, c4, finding a page, c5 |
| 10:00 | ##### 5 | 3 | 17 | 18 / 12 | gracias, cuac, pan, rojo, pato | c5, greetings, c6, exploring (tap-anything), shops & presents, side jobs |
| 15:00 | #### 4 | 4 | 26 | 22 / 16 | parque, granja, banco, fuente | side jobs, finding a page, greetings, hearts, shops & presents |
| 20:00 | #### 4 | 3 | 21 | 26 / 19 | comoestas, cabra, escuela, bien | c7, greetings, c8, hearts |
| 25:00 | # 1 | 2 | 10 | 27 / 21 | agua | hearts, greetings, c8, c9 |
| 30:00 | ##### 5 | 2 | 20 | 32 / 23 | buenasnoches, cama, carta, casa, cansado | c9, shops & presents, greetings, c10, exploring (tap-anything) |
| 35:00 | ### 3 | 2 | 19 | 35 / 25 | adios, pata, caballo | shops & presents, greetings, c10, teaching Canelo |
| 40:00 | #### 4 | 4 | 21 | 39 / 29 | porfavor, platano, dos, tres | greetings, mercado, shops & presents, picnic |
| 45:00 | #### 4 | 0 | 16 | 43 / 29 | huevo, queso, leche, uno | greetings, picnic, shops & presents, exploring (tap-anything), side jobs, show |
| 50:00 | #### 4 | 4 | 20 | 47 / 33 | salta, gira, azul, amarillo | show, teaching Canelo, greetings, shops & presents, side jobs |
| 55:00 | . 0 | 0 | 20 | 47 / 33 |  | greetings, hearts, shops & presents, exploring (tap-anything), side jobs, sonidos |
| 60:00 | ##### 5 | 1 | 20 | 52 / 34 | mariposa, croac, blanco, rosa, triste | sonidos, shops & presents, greetings, side jobs, exploring (tap-anything), flores |
| 65:00 | # 1 | 2 | 15 | 53 / 36 | feliz | flores, shops & presents, greetings, side jobs, cuenta, exploring (tap-anything) |
| 70:00 | # 1 | 2 | 21 | 54 / 38 | diez | cuenta, teaching Canelo, shops & presents, greetings, side jobs |
| 75:00 | . 0 | 4 | 30 | 54 / 42 |  | greetings, fiestab, finding a page |
| 80:00 | ## 2 | 0 | 8 | 56 / 42 | verde, gallina | fiestab, exploring (tap-anything) |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:13 | show | c1 | 0:26 | 55 | 111 | 29 (12, 0) | 4 | 1.5m / 6.0m | 79:19 | 8 | 13 | 2:21 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 29 | 76 | 9 (2, 0) | 1 | 2.2m / 14.8m | 61:09 | 8 | 8 | 16:14 (answer) | yes |
| guau *guau* | 0:33 | show | canelo-dog | 2:05 | 19 | 52 | 3 (1, 0) | 1 | 3.4m / 24.6m | 61:00 | 3 | 7 | 2:37 (answer) | yes |
| ven *ven* | 1:06 | watch | canelo-dog | 0:46 | 30 | 51 | 16 (5, 0) | 4 | 2.8m / 15.0m | 81:51 | 9 | 9 | 1:25 (answer) | yes |
| gato *el gato* | 2:47 | show | other | 0:53 | 21 | 59 | 5 (0, 0) | 1 | 2.9m / 27.1m | 61:00 | 4 | 7 | 3:41 (answer) | yes |
| miau *miau* | 2:56 | show | other | 14:36 | 16 | 27 | 2 (0, 0) | 0 | 3.9m / 27.4m | 60:58 | 2 | 7 | no | yes |
| buenosdias *buenos días* | 4:32 | show | c3 | 1:37 | 47 | 64 | 29 (2, 0) | 0 | 1.6m / 5.8m | 79:02 | 2 | 13 | 6:35 (answer) | yes |
| hueso *el hueso* | 4:49 | show | tricks | 0:21 | 25 | 53 | 7 (0, 0) | 1 | 3.2m / 20.4m | 81:53 | 7 | 9 | 8:07 (answer) | yes |
| sientate *siéntate* | 5:02 | watch | tricks | 0:30 | 23 | 47 | 12 (4, 0) | 0 | 3.5m / 15.8m | 82:22 | 4 | 8 | 5:32 (answer) | yes |
| si *sí* | 6:45 | show | c4 | 0:25 | 45 | 90 | 22 (8, 0) | 2 | 1.7m / 8.2m | 79:28 | 9 | 13 | 7:10 (answer) | yes |
| no *no* | 6:52 | show | c4 | 0:26 | 46 | 80 | 8 (1, 0) | 3 | 1.6m / 6.4m | 79:20 | 11 | 12 | 7:18 (answer) | yes |
| manzana *la manzana* | 7:41 | show | c4 | 18:22 | 15 | 52 | 7 (1, 0) | 1 | 4.8m / 16.0m | 74:19 | 3 | 8 | 40:54 (answer) | yes |
| pelota *la pelota* | 9:29 | show | c5 | 1:12 | 35 | 74 | 9 (1, 0) | 3 | 2.1m / 7.8m | 82:03 | 8 | 11 | 15:59 (answer) | yes |
| rojo *rojo / roja* | 10:17 | find | other | 7:59 | 11 | 32 | 7 (1, 0) | 0 | 7.0m / 14.0m | 79:59 | 3 | 7 | 18:16 (answer) | yes |
| pan *el pan* | 11:31 | show | c6 | 1:28 | 41 | 71 | 6 (0, 0) | 5 | 1.7m / 6.3m | 80:41 | 4 | 12 | 12:59 (answer) | yes |
| gracias *gracias* | 11:38 | overheard | c6 | 1:44 | 43 | 75 | 10 (0, 0) | 0 | 1.7m / 7.5m | 79:14 | 11 | 12 | 14:25 (answer) | yes |
| pato *el pato* | 12:32 | show | shop | 1:11 | 25 | 57 | 4 (0, 0) | 2 | 2.9m / 19.3m | 81:09 | 4 | 8 | 13:43 (answer) | yes |
| cuac *cuac* | 12:38 | show | shop | 39:15 | 16 | 35 | 3 (2, 0) | 1 | 4.5m / 27.4m | 80:36 | 2 | 7 | 51:53 (answer) | yes |
| parque *el parque* | 17:06 | find | other | 2:02 | 23 | 35 | 3 (0, 0) | 0 | 3.5m / 14.9m | 79:09 | 5 | 10 | 19:08 (answer) | yes |
| banco *el banco* | 17:47 | find | shop | 3:27 | 6 | 10 | 3 (1, 0) | 0 | 5.0m / 12.7m | 42:52 | 1 | 3 | 42:52 (answer) | yes |
| fuente *la fuente* | 18:38 | find | shop | 2:26 | 19 | 37 | 3 (2, 0) | 1 | 3.1m / 10.2m | 73:34 | 4 | 10 | 21:04 (answer) | yes |
| granja *la granja* | 19:35 | find | other | 1:44 | 23 | 44 | 3 (1, 0) | 0 | 2.8m / 10.2m | 81:14 | 4 | 8 | 21:20 (answer) | yes |
| cabra *la cabra* | 20:03 | show | other | 0:22 | 8 | 24 | 3 (1, 0) | 0 | 8.1m / 16.7m | 76:51 | 3 | 6 | 37:30 (answer) | yes |
| escuela *la escuela* | 23:17 | find | other | 3:30 | 17 | 23 | 4 (0, 0) | 0 | 3.3m / 19.5m | 75:28 | 2 | 5 | 26:46 (answer) | yes |
| bien *bien* | 23:40 | overheard | hearts | 1:02 | 9 | 41 | 8 (3, 0) | 1 | 4.1m / 17.9m | 56:20 | 2 | 3 | 24:42 (answer) | yes |
| comoestas *¿cómo estás?* | 23:46 | overheard | hearts | 0:46 | 10 | 22 | 7 (2, 0) | 1 | 5.9m / 19.1m | 76:20 | 1 | 6 | 25:04 (answer) | yes |
| agua *el agua* | 29:59 | show | c9 | 1:00 | 30 | 60 | 16 (6, 0) | 2 | 1.8m / 5.9m | 82:03 | 5 | 10 | 30:59 (answer) | yes |
| cama *la cama* | 30:17 | find | c9 | 26:04 | 11 | 23 | 6 (0, 0) | 1 | 4.4m / 19.5m | 74:53 | 1 | 7 | 61:40 (answer) | yes |
| buenasnoches *buenas noches* | 30:31 | show | c9 | 4:07 | 33 | 44 | 7 (0, 0) | 2 | 1.5m / 5.8m | 79:02 | 1 | 10 | 34:38 (answer) | yes |
| cansado *cansado / cansada* | 33:02 | show | c10 | 23:23 | 8 | 18 | 3 (0, 0) | 0 | 7.1m / 17.9m | 82:41 | 3 | 4 | 78:31 (answer) | yes |
| carta *la carta* | 34:12 | show | shop | 0:52 | 6 | 21 | 2 (1, 0) | 0 | 9.0m / 38.7m | 79:09 | 0 | 3 | 36:36 (answer) | no |
| casa *la casa* | 34:47 | find | shop | 5:41 | 24 | 31 | 5 (2, 0) | 0 | 3.2m / 11.3m | 74:36 | 2 | 13 | 40:29 (answer) | yes |
| caballo *el caballo* | 37:08 | show | shop | 39:50 | 7 | 20 | 2 (0, 0) | 0 | 7.2m / 20.9m | 80:16 | 3 | 4 | no | yes |
| adios *adiós* | 38:20 | watch | c10 | 1:49 | 14 | 30 | 5 (0, 0) | 0 | 5.2m / 26.5m | 79:14 | 6 | 7 | 40:09 (answer) | yes |
| pata *dame la pata* | 39:08 | answer | tricks | 10:49 | 11 | 34 | 8 (4, 0) | 1 | 6.5m / 21.8m | 82:14 | 2 | 7 | 50:21 (answer) | yes |
| tres *tres* | 41:50 | answer | mercado | 2:16 | 13 | 34 | 3 (0, 0) | 2 | 2.9m / 9.5m | 75:42 | 4 | 7 | 67:26 (answer) | yes |
| platano *el plátano* | 41:55 | answer | mercado | 3:05 | 5 | 18 | 2 (1, 0) | 0 | 4.0m / 11.5m | 56:41 | 1 | 3 | no | yes |
| dos *dos* | 42:02 | answer | mercado | 0:23 | 12 | 34 | 4 (0, 0) | 1 | 2.9m / 9.5m | 72:50 | 3 | 5 | 68:25 (answer) | yes |
| porfavor *por favor* | 42:08 | answer | mercado | 14:32 | 5 | 12 | 2 (0, 0) | 0 | 8.9m / 14.5m | 76:27 | 2 | 4 | no | yes |
| queso *el queso* | 45:09 | answer | picnic | 2:27 | 10 | 29 | 2 (1, 1) | 0 | 3.7m / 17.6m | 74:14 | 1 | 4 | no | yes |
| uno *uno* | 45:15 | answer | picnic | 13:22 | 16 | 38 | 7 (2, 0) | 1 | 2.3m / 9.5m | 75:47 | 3 | 6 | 72:27 (answer) | yes |
| huevo *el huevo* | 45:53 | answer | picnic | 1:48 | 16 | 58 | 7 (1, 1) | 0 | 2.0m / 6.3m | 74:24 | 1 | 6 | 54:24 (answer) | yes |
| leche *la leche* | 46:26 | answer | picnic | 1:20 | 8 | 17 | 1 (0, 1) | 1 | 4.2m / 6.0m | 73:34 | 1 | 6 | no | no |
| salta *salta* | 50:57 | answer | tricks | 0:26 | 7 | 24 | 6 (1, 0) | 0 | 5.3m / 11.1m | 82:22 | 2 | 4 | 53:01 (answer) | yes |
| gira *gira* | 52:17 | answer | tricks | 18:21 | 6 | 22 | 5 (2, 0) | 1 | 5.9m / 14.2m | 82:31 | 1 | 3 | 70:46 (answer) | yes |
| azul *azul* | 52:39 | answer | show | 11:15 | 8 | 16 | 3 (0, 0) | 0 | 3.9m / 12.5m | 79:54 | 3 | 3 | 78:05 (answer) | yes |
| amarillo *amarillo / amarilla* | 53:12 | answer | show | 11:51 | 7 | 13 | 3 (0, 0) | 0 | 4.4m / 12.5m | 79:59 | 3 | 3 | 78:04 (answer) | yes |
| croac *croac* | 60:05 | answer | sonidos | never | 2 | 3 | 0 (0, 0) | 0 | 0.9m / 0.9m | 60:50 | 1 | 1 | no | no |
| triste *triste* | 64:00 | answer | flores | never | 4 | 7 | 0 (0, 0) | 0 | 6.3m / 13.1m | 82:41 | 2 | 2 | no | no |
| blanco *blanco / blanca* | 64:21 | answer | flores | 13:12 | 6 | 12 | 2 (0, 0) | 0 | 3.1m / 13.0m | 79:54 | 2 | 2 | 78:04 (answer) | yes |
| rosa *rosado / rosada* | 64:35 | answer | flores | never | 8 | 14 | 0 (0, 0) | 0 | 8.2m / 23.4m | 64:57 | 4 | 5 | no | no |
| mariposa *la mariposa* | 64:56 | answer | flores | never | 1 | 4 | 0 (0, 0) | 0 | - | 64:56 | 1 | 1 | no | no |
| feliz *feliz* | 65:26 | answer | flores | 17:20 | 5 | 12 | 1 (0, 0) | 0 | 8.7m / 13.1m | 82:46 | 4 | 4 | no | yes |
| diez *diez* | 72:56 | answer | cuenta | never | 2 | 5 | 0 (0, 0) | 0 | 2.9m / 2.9m | 75:42 | 1 | 2 | no | no |
| verde *verde* | 80:08 | answer | fiestab | never | 1 | 2 | 0 (0, 0) | 0 | - | 80:08 | 1 | 1 | no | no |
| gallina *la gallina* | 81:13 | answer | fiestab | never | 4 | 8 | 0 (0, 0) | 0 | 11.8m / 23.8m | 81:14 | 3 | 3 | no | no |
| busca | never | | | | 0 | 0 | 0 | | | | | | | |
| conejo | never | | | | 0 | 0 | 0 | | | | | | | |
| rana | never | | | | 0 | 0 | 0 | | | | | | | |
| pajaro | never | | | | 0 | 0 | 0 | | | | | | | |
| pez | never | | | | 0 | 0 | 0 | | | | | | | |
| naranja | never | | | | 0 | 0 | 0 | | | | | | | |
| galleta | never | | | | 0 | 0 | 0 | | | | | | | |
| panaderia | never | | | | 0 | 0 | 0 | | | | | | | |
| biblioteca | never | | | | 0 | 0 | 0 | | | | | | | |
| flor | never | | | | 0 | 0 | 0 | | | | | | | |
| arbol | never | | | | 0 | 0 | 0 | | | | | | | |
| cuatro | never | | | | 0 | 0 | 0 | | | | | | | |
| cinco | never | | | | 0 | 0 | 0 | | | | | | | |
| seis | never | | | | 0 | 0 | 0 | | | | | | | |
| siete | never | | | | 0 | 0 | 0 | | | | | | | |
| ocho | never | | | | 0 | 0 | 0 | | | | | | | |
| nueve | never | | | | 0 | 0 | 0 | | | | | | | |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event with the game time, map, speaker and episode: *meet* (the word model: met, and how), *prompt* (a question whose answer it is: intro / new / review, its stage, the cards shown, cued), *retrieval* (an active use credited to the model: said, cued, card mode, first try, stage before and after), *stage*, *shown* (a dialogue line, a prompt, a picture, the bag, a banner), *heard* (the voice), *tapped-object*, *choice-shown* (ans: it was the answer), *recognized*, *wrong*, *picked*, *said*, *learned*, and *session* (a new session or day).
- A word is *new* when it is met (stage 1); being shown or heard before that does not count (an unmet word appears as its picture only). *Active uses* are the model's retrievals of a met word; the answer that met it is its puzzle, not a use. *First use*: the first retrieval at least 20 s after meeting. *Cued*: the answer could be found by matching the prompt (its picture over the question and on its card, or its word written in both). *Review prompts*: questions about a word met in an earlier session or 5+ minutes earlier (or asked by `G.review`, or a page puzzle).
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, Canelo's tricks, a side job, the bag) says which errand it belonged to. *Errands/episodes a word is in*: the contexts it came up in after it was met.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line, ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a gold card, 2 s for errand and badge cards, 5 s to look at the notebook, 12 s for a page puzzle, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around.
- Sessions: about 15 minutes each (the session ends at the next free moment on the map), each on the next calendar day (G.debug.dayShift): once-a-day greetings, side jobs and say-it-back stars come back each day, and the word model's day-based reviews fall due. Bursts: 5+ meetings within 30 s. Overload: more than 8 meetings within 5 minutes.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (`--quick` runs the game 3x faster, `--strict` exits 1 when a target fails, `--days 5 --session 15`; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
