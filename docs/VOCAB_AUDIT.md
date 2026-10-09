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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 14 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): every Round A and Round B errand, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (82 answers + 7 gold cards); 12% of picture-card questions got one wrong tap first (38); page puzzles solved when their sparkle was on screen within 8 tiles: 16 (saludos, mascota); seed 7. Game time 104:07 (104.1 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:22 (71% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 30 | 0 | 3: croac, blanco, gallina | **FAIL** |
| Words retrieved only with a cue | 2 | 0 | 1: leche | **FAIL** |
| Median active retrievals per word | 1 | ≥ 5 | 4 | **FAIL** |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 86% | **FAIL** |
| Prompts that review older words | low | 40–60% | 69% (379 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 5: pez, naranja, queso, uno, cinco | **FAIL** |

### Chapters 1-10 on their own
The same targets for the 34 words of the chapters written so far, up to the moment the last of them was done (49:26). After them the older errands still run, meeting their words in bulk: they are what chapters 11-21 replace.

| Measure | Target | Now | |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 0 | 0 | PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:16 (74% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 0 | 0 | PASS |
| Words retrieved only with a cue | 0 | 0 | PASS |
| Median active retrievals per word | ≥ 5 | 5.5 | PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 94% | PASS |
| Prompts that review older words | 40–60% | 52% (180 prompts) | PASS |
| Words introduced as a wrong answer first | 0 | 0 | PASS |

Words by stage at the end: unmet 17, met 8, known 6, remembered 5, solid 37.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 56 / 42 (never met: 17, of them shown somewhere: 16) |
| Met via | answer 22, show 19, find 9, overheard 3, watch 3 |
| Active retrievals of met words (picked right + said) | 332 (266 picked, 66 said); 1% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:17 |
| Median encounters per word (distinct moments) | 14 (min 2, max 58) |
| Median active retrievals per word | 4 |
| Most new words in any 5 minutes | 5 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 0. .
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 0. .
- **Never actively retrieved** (never picked right or said): 3: croac, blanco, gallina.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 1: leche.
- **Met once and never again** (one moment only): 0: none. Three moments or fewer: 4.
- **Long gaps** (more than 15 min between two meetings): 36: manzana 39.7m, queso 38.7m, gira 38.0m, cuac 36.3m, escuela 32.9m, gato 31.1m, ven 29.8m, miau 29.2m, adios 27.2m, cansado 26.9m, guau 26.2m, bien 26.0m, sientate 25.5m, cabra 24.7m, caballo 24.6m, azul 24.4m, rosa 24.2m, gallina 23.9m, blanco 23.7m, pato 23.7m, feliz 23.4m, triste 23.4m, pata 22.6m, parque 22.0m, cama 21.9m, … (+11).
- **Not recalled after the errand that introduced it**: 8: buenasnoches, croac, leche, blanco, verde, gallina, carta, triste.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 3: miau, azul, amarillo.
- **Faded out** (not met in the last 30 minutes of play): 7: hueso, guau, miau, croac, platano, carta, banco.
- **Never learned**: 14: buenasnoches, gira, mariposa, croac, platano, queso, leche, blanco, rosa, verde, gallina, feliz, triste, diez. **Never met**: 17: busca, conejo, rana, pajaro, pez, naranja, galleta, panaderia, biblioteca, flor, arbol, cuatro, cinco, seis, siete, ocho, nueve.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-1:52 (1.8m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| El gato de la cerca (`c2`) | 5:13-7:09 (1.9m) | 0 | 1 | 4 (2) | 3 | 0 | 1 |
| exploring (tap-anything) | 5:29-101:51 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 5:32-102:45 | 7: gato, miau, rojo, parque, granja, cabra, escuela | 14 | 4 (4) | 91 | 0 | 8 |
| ¡Buenos días, Canelo! (`c3`) | 7:43-9:43 (2.0m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 7:53-64:24 | 5: hueso, sientate, pata, salta, gira | 2 | 6 (1) | 6 | 0 | 1 |
| hearts | 9:04-37:03 | 2: bien, comoestas | 3 | 8 (2) | 15 | 0 | 2 |
| greetings | 12:59-100:13 | 0 | 17 | 9 (6) | 71 | 0 | 6 |
| El juego de Don Pepe (`c4`) | 13:05-14:45 (1.7m) | 3: si, no, manzana | 3 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:12-26:24 | 0 | 5 | 7 (7) | 8 | 0 | 0 |
| La pelota roja (`c5`) | 15:45-17:20 (1.6m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 1 |
| Pan para los patos (`c6`) | 21:41-24:54 (3.2m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 22:41-94:10 | 7: pato, cuac, banco, fuente, carta, casa, caballo | 6 | 14 (8) | 34 | 0 | 4 |
| side jobs | 25:22-94:35 | 0 | 0 | 7 (1) | 1 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 26:50-32:00 (5.2m) | 0 | 2 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 33:03-37:22 (4.3m) | 0 | 2 | 5 (1) | 2 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 40:35-41:47 (1.2m) | 3: agua, cama, buenasnoches | 1 | 9 (1) | 5 | 0 | 1 |
| Tomás está cansado (`c10`) | 43:35-49:26 (5.8m) | 2: cansado, adios | 2 | 9 (3) | 6 | 0 | 0 |
| El mercado (`mercado`) | 52:02-54:03 (2.0m) | 4: tres, platano, dos, porfavor | 0 | 6 (2) | 3 | 0 | 1 |
| El día de campo (`picnic`) | 56:07-59:54 (3.8m) | 4: huevo, queso, uno, leche | 1 | 14 (4) | 9 | 2 | 4 |
| El show de perros (`show`) | 62:18-65:22 (3.1m) | 2: azul, amarillo | 1 | 15 (5) | 8 | 0 | 1 |
| ¿Qué dicen? (`sonidos`) | 68:23-72:31 (4.1m) | 1: croac | 3 | 10 (5) | 5 | 0 | 1 |
| Las flores de Lucía (`flores`) | 75:33-77:07 (1.6m) | 5: triste, rosa, blanco, mariposa, feliz | 0 | 11 (2) | 4 | 0 | 1 |
| ¿Cuántos animales? (`cuenta`) | 80:47-97:01 (16.2m) | 1: diez | 1 | 9 (4) | 8 | 0 | 2 |
| La fiesta de los animales (`fiestab`) | 97:17-104:02 (6.8m) | 2: verde, gallina | 3 | 24 (12) | 21 | 0 | 2 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-7:24 | 6 | 4 | 11 | 4 | 3 | 18 (22%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 7:24-15:04 | 6 | 5 | 14 | 6 | 2 | 25 (24%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 15:04-25:39 | 6 | 5 | 24 | 6 | 3 | 34 (50%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 25:39-32:18 | 5 | 5 | 28 | 5 | 1 | 33 (73%) | 9 | c7 |
| 5 | 2026-10-13 | 32:18-41:33 | 6 | 4 | 19 | 10 | 3 | 32 (47%) | 11 | c8 |
| 6 | 2026-10-13 | 41:33-42:48 | 0 | 1 | 2 | 1 | 0 | 3 (100%) | 2 | c9 |
| 7 | 2026-10-14 | 42:48-50:50 | 6 | 5 | 25 | 11 | 4 | 40 (73%) | 18 | c10 |
| 8 | 2026-10-15 | 50:50-55:21 | 4 | 0 | 11 | 6 | 2 | 19 (74%) | 9 | mercado |
| 9 | 2026-10-16 | 55:21-61:44 | 4 | 3 | 24 | 4 | 5 | 32 (75%) | 15 | picnic |
| 10 | 2026-10-17 | 61:44-67:54 | 4 | 4 | 20 | 7 | 4 | 29 (76%) | 14 | show |
| 11 | 2026-10-18 | 67:54-73:30 | 1 | 2 | 17 | 4 | 2 | 21 (95%) | 19 | sonidos |
| 12 | 2026-10-19 | 73:30-78:34 | 5 | 2 | 20 | 4 | 1 | 26 (81%) | 15 | flores |
| 13 | 2026-10-20 | 78:34-93:42 | 0 | 0 | 10 | 2 | 1 | 12 (100%) | 10 | - |
| 14 | 2026-10-21 | 93:42-104:07 | 3 | 2 | 41 | 12 | 7 | 55 (95%) | 25 | cuenta, fiestab |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 1 | 6 | 4 / 1 | hola, ven, perro, guau | c1, Canelo becomes yours |
| 5:00 | ##### 5 | 5 | 14 | 9 / 6 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 3 | 12 | 12 / 9 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 1 | 14 | 14 / 10 | pelota, rojo | finding a page, greetings, c5 |
| 20:00 | #### 4 | 4 | 14 | 18 / 14 | gracias, cuac, pan, pato | hearts, greetings, c6, exploring (tap-anything), shops & presents |
| 25:00 | #### 4 | 2 | 24 | 22 / 16 | parque, granja, banco, fuente | exploring (tap-anything), side jobs, finding a page, greetings, hearts, shops & presents |
| 30:00 | #### 4 | 3 | 20 | 26 / 19 | comoestas, cabra, escuela, bien | c7, greetings, c8, hearts |
| 35:00 | . 0 | 4 | 14 | 26 / 23 |  | greetings, hearts, c8 |
| 40:00 | #### 4 | 1 | 13 | 30 / 24 | buenasnoches, cama, agua, cansado | exploring (tap-anything), c9, shops & presents, greetings, c10 |
| 45:00 | #### 4 | 4 | 26 | 34 / 28 | adios, caballo, carta, casa | shops & presents, exploring (tap-anything), greetings, c10 |
| 50:00 | ##### 5 | 1 | 17 | 39 / 29 | porfavor, pata, platano, dos, tres | greetings, teaching Canelo, shops & presents, mercado |
| 55:00 | #### 4 | 3 | 22 | 43 / 32 | huevo, queso, leche, uno | greetings, picnic, shops & presents |
| 60:00 | ### 3 | 2 | 18 | 46 / 34 | salta, gira, azul | exploring (tap-anything), shops & presents, side jobs, greetings, show, teaching Canelo |
| 65:00 | # 1 | 3 | 23 | 47 / 37 | amarillo | show, shops & presents, greetings, side jobs, exploring (tap-anything) |
| 70:00 | # 1 | 2 | 18 | 48 / 39 | croac | sonidos, shops & presents, greetings, side jobs |
| 75:00 | ##### 5 | 1 | 21 | 53 / 40 | mariposa, blanco, rosa, feliz, triste | greetings, flores, shops & presents, side jobs |
| 80:00 | . 0 | 0 | 4 | 53 / 40 |  | shops & presents, greetings, cuenta, exploring (tap-anything) |
| 85:00 | . 0 | 0 | 0 | 53 / 40 |  | exploring (tap-anything) |
| 90:00 | . 0 | 0 | 3 | 53 / 40 |  | exploring (tap-anything), cuenta, shops & presents, greetings, side jobs |
| 95:00 | # 1 | 0 | 34 | 54 / 40 | diez | greetings, cuenta, fiestab |
| 100:00 | ## 2 | 2 | 15 | 56 / 42 | verde, gallina | greetings, fiestab, exploring (tap-anything) |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:13 | show | c1 | 0:26 | 58 | 113 | 31 (2, 0) | 1 | 1.8m / 13.8m | 100:21 | 8 | 13 | 5:37 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 28 | 78 | 9 (2, 0) | 3 | 2.9m / 15.6m | 77:26 | 6 | 9 | 26:43 (answer) | yes |
| guau *guau* | 0:33 | show | canelo-dog | 5:21 | 22 | 53 | 3 (1, 0) | 0 | 3.4m / 26.2m | 72:25 | 3 | 7 | 5:54 (answer) | yes |
| ven *ven* | 1:06 | watch | canelo-dog | 0:46 | 29 | 54 | 15 (1, 0) | 2 | 3.7m / 29.8m | 103:35 | 9 | 9 | 1:25 (answer) | yes |
| gato *el gato* | 6:04 | show | other | 0:54 | 21 | 61 | 6 (1, 0) | 1 | 3.6m / 31.1m | 77:26 | 4 | 8 | 6:58 (answer) | yes |
| miau *miau* | 6:12 | show | other | 21:39 | 12 | 22 | 2 (1, 0) | 0 | 6.0m / 29.2m | 72:19 | 3 | 6 | 72:19 (answer) | yes |
| buenosdias *buenos días* | 7:49 | show | c3 | 1:23 | 42 | 60 | 25 (7, 0) | 1 | 2.3m / 13.8m | 100:03 | 2 | 13 | 9:38 (answer) | yes |
| hueso *el hueso* | 8:06 | show | tricks | 0:21 | 30 | 60 | 8 (1, 0) | 2 | 2.2m / 12.8m | 73:08 | 6 | 9 | 14:36 (answer) | yes |
| sientate *siéntate* | 8:20 | watch | tricks | 0:30 | 21 | 48 | 13 (4, 0) | 1 | 4.8m / 25.5m | 103:35 | 3 | 9 | 8:50 (answer) | yes |
| si *sí* | 13:11 | show | c4 | 0:25 | 47 | 93 | 24 (4, 0) | 0 | 2.0m / 13.9m | 100:26 | 9 | 13 | 13:35 (answer) | yes |
| no *no* | 13:21 | show | c4 | 0:22 | 49 | 83 | 10 (0, 0) | 7 | 1.8m / 13.9m | 100:22 | 11 | 12 | 13:43 (answer) | yes |
| manzana *la manzana* | 14:06 | show | c4 | 22:37 | 17 | 49 | 5 (1, 0) | 1 | 5.2m / 39.7m | 97:59 | 4 | 8 | 36:43 (answer) | yes |
| pelota *la pelota* | 15:59 | show | c5 | 1:14 | 33 | 69 | 9 (0, 0) | 2 | 2.7m / 15.1m | 103:21 | 8 | 11 | 17:13 (answer) | yes |
| rojo *rojo / roja* | 16:50 | find | other | 4:18 | 14 | 38 | 6 (1, 0) | 1 | 6.5m / 20.7m | 101:22 | 4 | 6 | 21:07 (answer) | yes |
| pan *el pan* | 21:47 | show | c6 | 1:35 | 39 | 68 | 6 (2, 0) | 1 | 2.1m / 14.2m | 102:02 | 4 | 12 | 58:26 (answer) | yes |
| gracias *gracias* | 21:55 | overheard | c6 | 1:44 | 46 | 81 | 13 (0, 0) | 1 | 1.9m / 15.1m | 100:19 | 11 | 12 | 23:39 (answer) | yes |
| pato *el pato* | 22:50 | show | shop | 1:13 | 21 | 52 | 4 (2, 0) | 0 | 4.0m / 23.7m | 102:30 | 4 | 6 | 24:03 (answer) | yes |
| cuac *cuac* | 22:56 | show | shop | 1:19 | 10 | 28 | 3 (1, 0) | 0 | 8.8m / 36.3m | 101:57 | 2 | 5 | 24:15 (answer) | yes |
| parque *el parque* | 27:28 | find | other | 1:53 | 26 | 41 | 4 (0, 0) | 1 | 3.8m / 22.0m | 99:19 | 5 | 10 | 29:21 (answer) | yes |
| banco *el banco* | 28:08 | find | shop | 3:36 | 6 | 11 | 3 (1, 0) | 0 | 5.3m / 13.0m | 54:33 | 1 | 3 | 31:43 (answer) | yes |
| fuente *la fuente* | 28:51 | find | shop | 2:43 | 18 | 35 | 3 (2, 0) | 0 | 3.0m / 10.3m | 79:55 | 4 | 9 | 31:34 (answer) | yes |
| granja *la granja* | 29:49 | find | other | 1:09 | 26 | 46 | 4 (2, 0) | 2 | 2.9m / 15.4m | 102:35 | 4 | 10 | 30:57 (answer) | yes |
| cabra *la cabra* | 30:19 | show | other | 0:21 | 11 | 27 | 3 (0, 0) | 1 | 6.9m / 24.7m | 98:43 | 3 | 6 | 48:34 (answer) | yes |
| escuela *la escuela* | 33:43 | find | other | 3:48 | 17 | 22 | 4 (1, 0) | 0 | 4.1m / 32.9m | 99:14 | 2 | 4 | 37:31 (answer) | yes |
| bien *bien* | 34:06 | overheard | hearts | 1:02 | 14 | 45 | 8 (2, 0) | 0 | 3.6m / 26.0m | 80:34 | 3 | 4 | 35:08 (answer) | yes |
| comoestas *¿cómo estás?* | 34:15 | overheard | hearts | 0:46 | 13 | 29 | 11 (4, 0) | 0 | 5.3m / 17.9m | 97:44 | 1 | 7 | 35:36 (answer) | yes |
| agua *el agua* | 40:42 | show | c9 | 1:01 | 25 | 58 | 15 (4, 0) | 1 | 2.6m / 21.6m | 103:14 | 5 | 10 | 41:43 (answer) | yes |
| cama *la cama* | 40:59 | find | c9 | 5:46 | 10 | 20 | 5 (1, 0) | 0 | 6.0m / 21.9m | 95:03 | 2 | 7 | 46:45 (answer) | yes |
| buenasnoches *buenas noches* | 41:15 | show | c9 | never | 25 | 30 | 1 (0, 0) | 3 | 2.5m / 13.8m | 100:03 | 1 | 10 | no | no |
| cansado *cansado / cansada* | 43:50 | show | c10 | 1:30 | 8 | 17 | 3 (1, 0) | 0 | 8.6m / 26.9m | 103:54 | 3 | 3 | 75:14 (answer) | yes |
| carta *la carta* | 45:37 | show | shop | 0:30 | 4 | 19 | 2 (1, 0) | 0 | 1.0m / 1.6m | 48:44 | 0 | 1 | 47:46 (answer) | no |
| casa *la casa* | 45:54 | find | shop | 6:01 | 25 | 33 | 5 (1, 0) | 0 | 4.1m / 18.5m | 99:14 | 3 | 13 | 67:30 (answer) | yes |
| caballo *el caballo* | 48:17 | show | shop | 1:24 | 9 | 24 | 3 (0, 0) | 0 | 6.7m / 24.6m | 101:39 | 3 | 3 | 49:41 (answer) | yes |
| adios *adiós* | 49:20 | watch | c10 | 1:12 | 15 | 33 | 6 (0, 0) | 1 | 5.6m / 27.2m | 100:13 | 6 | 7 | 50:32 (answer) | yes |
| pata *dame la pata* | 50:20 | answer | tricks | 11:52 | 10 | 31 | 8 (2, 0) | 0 | 8.4m / 22.6m | 103:33 | 2 | 6 | 62:35 (answer) | yes |
| tres *tres* | 53:15 | answer | mercado | 2:45 | 15 | 38 | 4 (3, 0) | 0 | 3.3m / 12.5m | 98:25 | 4 | 7 | 69:38 (answer) | yes |
| platano *el plátano* | 53:20 | answer | mercado | 3:40 | 5 | 15 | 1 (0, 0) | 0 | 1.4m / 3.0m | 57:31 | 1 | 2 | no | yes |
| dos *dos* | 53:28 | answer | mercado | 0:34 | 14 | 36 | 4 (3, 0) | 1 | 3.4m / 11.6m | 96:53 | 3 | 7 | 67:03 (answer) | yes |
| porfavor *por favor* | 53:38 | answer | mercado | 1:15 | 8 | 17 | 5 (0, 0) | 0 | 3.3m / 9.6m | 75:27 | 2 | 5 | 56:44 (answer) | yes |
| huevo *el huevo* | 56:22 | answer | picnic | 1:14 | 16 | 59 | 8 (1, 0) | 0 | 2.6m / 14.7m | 94:35 | 1 | 6 | 59:31 (answer) | yes |
| queso *el queso* | 57:05 | answer | picnic | 2:18 | 10 | 27 | 2 (1, 1) | 0 | 5.1m / 38.7m | 98:07 | 1 | 3 | no | yes |
| uno *uno* | 57:10 | answer | picnic | 1:43 | 18 | 40 | 7 (1, 0) | 0 | 2.7m / 11.0m | 98:25 | 3 | 7 | 74:15 (answer) | yes |
| leche *la leche* | 57:56 | answer | picnic | 1:48 | 8 | 16 | 1 (0, 1) | 1 | 6.0m / 18.1m | 97:59 | 1 | 6 | no | no |
| salta *salta* | 63:08 | answer | tricks | 0:24 | 9 | 28 | 7 (2, 0) | 0 | 5.1m / 17.0m | 103:43 | 2 | 4 | 63:32 (answer) | yes |
| gira *gira* | 64:21 | answer | tricks | 1:13 | 4 | 13 | 1 (0, 0) | 0 | 13.1m / 38.0m | 103:28 | 2 | 2 | no | yes |
| azul *azul* | 64:47 | answer | show | 35:27 | 5 | 14 | 2 (0, 0) | 0 | 9.1m / 24.4m | 101:22 | 3 | 3 | 101:06 (answer) | yes |
| amarillo *amarillo / amarilla* | 65:19 | answer | show | 1:13 | 7 | 13 | 3 (1, 0) | 1 | 6.0m / 17.9m | 101:18 | 3 | 3 | 101:18 (answer) | yes |
| croac *croac* | 71:34 | answer | sonidos | never | 2 | 3 | 0 (0, 0) | 0 | 0.8m / 0.8m | 72:10 | 1 | 1 | no | no |
| triste *triste* | 75:27 | answer | flores | 1:22 | 6 | 11 | 1 (0, 0) | 0 | 5.7m / 23.4m | 103:54 | 2 | 3 | no | no |
| rosa *rosado / rosada* | 75:48 | answer | flores | 18:42 | 11 | 19 | 1 (0, 0) | 1 | 8.9m / 24.2m | 102:43 | 4 | 6 | no | yes |
| blanco *blanco / blanca* | 76:02 | answer | flores | never | 6 | 8 | 0 (0, 0) | 0 | 5.4m / 23.7m | 102:39 | 2 | 2 | no | no |
| mariposa *la mariposa* | 76:25 | answer | flores | 1:09 | 2 | 7 | 1 (1, 0) | 0 | 1.2m / 1.2m | 77:34 | 1 | 1 | no | yes |
| feliz *feliz* | 77:07 | answer | flores | 1:07 | 6 | 15 | 2 (0, 0) | 0 | 8.8m / 23.4m | 103:59 | 4 | 5 | no | yes |
| diez *diez* | 97:01 | answer | cuenta | 1:29 | 2 | 7 | 1 (0, 0) | 0 | 1.5m / 1.5m | 98:30 | 1 | 1 | no | yes |
| verde *verde* | 101:30 | answer | fiestab | 1:15 | 2 | 5 | 1 (0, 0) | 0 | 1.3m / 1.3m | 102:45 | 1 | 1 | no | no |
| gallina *la gallina* | 102:34 | answer | fiestab | never | 5 | 9 | 0 (0, 0) | 0 | 11.5m / 23.9m | 102:35 | 3 | 3 | no | no |
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
