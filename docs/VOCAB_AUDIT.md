# Vocabulary flow audit

How the words of Club de Español reach a child, measured by `tools/vocab-audit.js`: the playthrough's own taps over several play sessions on successive days, paced like a child, speaking about a third of the answers (method at the end). Everything below the AUDIT marker is generated, starting with the **measured targets** of `docs/LEARNING_DESIGN.md` (PASS / FAIL).

**Re-run:** `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 15 minutes; `--quick`: the game runs 3x faster, about 6 minutes; `--strict`: exit 1 when a target fails; options `--days 5 --session 15 --speak 0.35 --wrong 0.12 --pages 8 --seed 7`; `--from <dump.json>` re-analyses a saved run). It rewrites only the part between the AUDIT markers.

**Status (chapters 1-10, 2026-10-09):** chapters 1-10 replace the opening, the Round A errands and two Round B errands; every measured target passes for the words of chapters 1-10 on their own (the *Chapters 1-10 on their own* table below; `--strict-chapters`). The whole-run table still fails where the older errands after chapter 10 take over (they are rewritten as chapters 11-21 next). Overload and the 5-minute count are measured inside one session (a night in between is not 5 minutes of play).

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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 14 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): every Round A and Round B errand, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (95 answers + 5 gold cards); 12% of picture-card questions got one wrong tap first (34); page puzzles solved when their sparkle was on screen within 8 tiles: 20 (saludos, mascota, colores, numeros, sonidos); seed 7. Game time 107:33 (107.5 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:16 (98% ≤ 3:00) | PASS |
| Words never actively retrieved | 30 | 0 | 1: gallina | **FAIL** |
| Words retrieved only with a cue | 2 | 0 | 1: leche | **FAIL** |
| Median active retrievals per word | 1 | ≥ 5 | 5 | PASS |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 93% | PASS |
| Prompts that review older words | low | 40–60% | 72% (411 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 5: pez, naranja, queso, cuatro, cinco | **FAIL** |

### Chapters 1-10 on their own
The same targets for the 34 words of the chapters written so far, up to the moment the last of them was done (51:02). After them the older errands still run, meeting their words in bulk: they are what chapters 11-21 replace.

| Measure | Target | Now | |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 0 | 0 | PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:11 (100% ≤ 3:00) | PASS |
| Words never actively retrieved | 0 | 0 | PASS |
| Words retrieved only with a cue | 0 | 0 | PASS |
| Median active retrievals per word | ≥ 5 | 6 | PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 100% | PASS |
| Prompts that review older words | 40–60% | 55% (190 prompts) | PASS |
| Words introduced as a wrong answer first | 0 | 0 | PASS |

Words by stage at the end: unmet 17, met 4, known 3, remembered 7, solid 42.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 56 / 49 (never met: 17, of them shown somewhere: 15) |
| Met via | answer 22, show 19, find 9, overheard 3, watch 3 |
| Active retrievals of met words (picked right + said) | 364 (283 picked, 81 said); 0% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:16 |
| Median encounters per word (distinct moments) | 15.5 (min 2, max 60) |
| Median active retrievals per word | 5 |
| Most new words in any 5 minutes | 5 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 0. .
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 0. .
- **Never actively retrieved** (never picked right or said): 1: gallina.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 0: none.
- **Met once and never again** (one moment only): 0: none. Three moments or fewer: 3.
- **Long gaps** (more than 15 min between two meetings): 31: banco 46.1m, platano 38.9m, queso 37.5m, ven 37.3m, escuela 32.7m, miau 32.4m, guau 31.0m, bien 29.5m, cansado 29.5m, comoestas 29.1m, cama 29.0m, hueso 28.9m, sientate 28.6m, adios 28.3m, croac 27.0m, rosa 25.2m, cuac 24.8m, salta 24.0m, pata 23.8m, gira 23.5m, carta 23.1m, gato 23.0m, rojo 22.6m, triste 22.5m, parque 22.5m, … (+6).
- **Not recalled after the errand that introduced it**: 7: buenasnoches, queso, leche, verde, gallina, carta, triste.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 2: croac, diez.
- **Faded out** (not met in the last 30 minutes of play): 1: manzana.
- **Never learned**: 7: buenasnoches, mariposa, platano, leche, verde, gallina, triste. **Never met**: 17: busca, conejo, rana, pajaro, pez, naranja, galleta, panaderia, biblioteca, flor, arbol, cuatro, cinco, seis, siete, ocho, nueve.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-2:08 (2.1m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| hearts | 1:45-37:53 | 2: bien, comoestas | 3 | 4 (2) | 15 | 0 | 3 |
| El gato de la cerca (`c2`) | 5:13-7:16 (2.1m) | 0 | 2 | 4 (2) | 3 | 0 | 0 |
| exploring (tap-anything) | 5:33-105:03 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 5:36-105:33 | 7: gato, miau, rojo, parque, granja, cabra, escuela | 21 | 4 (4) | 107 | 0 | 6 |
| ¡Buenos días, Canelo! (`c3`) | 7:57-9:45 (1.8m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 8:06-74:12 | 5: hueso, sientate, pata, salta, gira | 2 | 6 (1) | 8 | 0 | 1 |
| greetings | 13:12-103:29 | 0 | 18 | 8 (6) | 71 | 0 | 7 |
| El juego de Don Pepe (`c4`) | 13:19-15:00 (1.7m) | 3: si, no, manzana | 4 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:50-104:43 | 0 | 11 | 9 (9) | 20 | 0 | 0 |
| La pelota roja (`c5`) | 16:24-18:02 (1.6m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 0 |
| Pan para los patos (`c6`) | 22:11-25:35 (3.4m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 23:21-99:29 | 7: pato, cuac, banco, fuente, carta, casa, caballo | 7 | 14 (8) | 35 | 0 | 2 |
| side jobs | 26:02-98:53 | 0 | 0 | 7 (1) | 1 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 27:23-32:40 (5.3m) | 0 | 1 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 33:42-38:18 (4.6m) | 0 | 1 | 3 (1) | 1 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 41:31-43:01 (1.5m) | 3: agua, buenasnoches, cama | 2 | 9 (1) | 6 | 0 | 2 |
| Tomás está cansado (`c10`) | 45:08-51:02 (5.9m) | 2: cansado, adios | 2 | 9 (3) | 6 | 0 | 2 |
| El mercado (`mercado`) | 54:29-56:20 (1.9m) | 4: tres, platano, dos, porfavor | 0 | 7 (2) | 3 | 0 | 0 |
| El día de campo (`picnic`) | 59:22-63:41 (4.3m) | 4: huevo, queso, uno, leche | 2 | 14 (4) | 9 | 1 | 0 |
| El show de perros (`show`) | 66:09-69:10 (3.0m) | 2: azul, amarillo | 1 | 14 (5) | 8 | 0 | 1 |
| ¿Qué dicen? (`sonidos`) | 72:09-77:21 (5.2m) | 1: croac | 3 | 10 (5) | 5 | 0 | 1 |
| Las flores de Lucía (`flores`) | 80:33-82:22 (1.8m) | 5: triste, rosa, blanco, mariposa, feliz | 0 | 11 (2) | 4 | 0 | 1 |
| ¿Cuántos animales? (`cuenta`) | 87:32-96:45 (9.2m) | 1: diez | 1 | 9 (4) | 8 | 0 | 1 |
| La fiesta de los animales (`fiestab`) | 100:15-107:28 (7.2m) | 2: verde, gallina | 0 | 26 (13) | 22 | 0 | 5 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-7:40 | 6 | 5 | 10 | 7 | 3 | 20 (30%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 7:40-15:42 | 6 | 6 | 16 | 4 | 3 | 26 (27%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 15:42-26:19 | 6 | 6 | 19 | 11 | 1 | 34 (50%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 26:19-32:57 | 5 | 4 | 30 | 3 | 1 | 34 (74%) | 9 | c7 |
| 5 | 2026-10-13 | 32:57-42:29 | 6 | 3 | 18 | 11 | 4 | 32 (50%) | 11 | c8 |
| 6 | 2026-10-13 | 42:29-44:20 | 0 | 2 | 6 | 2 | 1 | 8 (100%) | 6 | c9 |
| 7 | 2026-10-14 | 44:20-53:16 | 6 | 5 | 29 | 9 | 4 | 42 (74%) | 18 | c10 |
| 8 | 2026-10-15 | 53:16-58:38 | 4 | 1 | 17 | 5 | 0 | 24 (79%) | 13 | mercado |
| 9 | 2026-10-16 | 58:38-65:37 | 4 | 5 | 19 | 13 | 1 | 33 (76%) | 16 | picnic |
| 10 | 2026-10-17 | 65:37-71:40 | 4 | 1 | 20 | 6 | 4 | 29 (76%) | 13 | show |
| 11 | 2026-10-18 | 71:40-78:31 | 1 | 3 | 17 | 2 | 1 | 20 (95%) | 15 | sonidos |
| 12 | 2026-10-19 | 78:31-85:09 | 5 | 1 | 16 | 9 | 2 | 28 (82%) | 15 | flores |
| 13 | 2026-10-20 | 85:09-98:03 | 1 | 4 | 20 | 5 | 2 | 25 (96%) | 17 | cuenta |
| 14 | 2026-10-21 | 98:03-107:33 | 2 | 3 | 46 | 8 | 7 | 56 (96%) | 32 | fiestab |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 2 | 7 | 4 / 2 | hola, ven, perro, guau | c1, Canelo becomes yours, hearts |
| 5:00 | ##### 5 | 5 | 15 | 9 / 7 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 3 | 12 | 12 / 10 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 3 | 16 | 14 / 13 | pelota, rojo | hearts, finding a page, greetings, c5 |
| 20:00 | #### 4 | 4 | 12 | 18 / 17 | gracias, cuac, pan, pato | greetings, c6, exploring (tap-anything), shops & presents |
| 25:00 | ### 3 | 0 | 22 | 21 / 17 | parque, banco, fuente | c6, exploring (tap-anything), side jobs, finding a page, greetings, hearts, shops & presents |
| 30:00 | ##### 5 | 4 | 21 | 26 / 21 | comoestas, cabra, granja, escuela, bien | greetings, hearts, c7, c8 |
| 35:00 | . 0 | 3 | 17 | 26 / 24 |  | hearts, greetings, exploring (tap-anything), c8 |
| 40:00 | ### 3 | 2 | 12 | 29 / 26 | buenasnoches, cama, agua | c9, shops & presents, greetings |
| 45:00 | #### 4 | 2 | 25 | 33 / 28 | caballo, carta, casa, cansado | greetings, c10, shops & presents, exploring (tap-anything) |
| 50:00 | ## 2 | 3 | 19 | 35 / 31 | adios, pata | shops & presents, c10, greetings, teaching Canelo, exploring (tap-anything), mercado |
| 55:00 | ##### 5 | 2 | 15 | 40 / 33 | porfavor, huevo, platano, dos, tres | shops & presents, mercado, greetings, picnic |
| 60:00 | ### 3 | 4 | 22 | 43 / 37 | queso, leche, uno | greetings, picnic, shops & presents, side jobs |
| 65:00 | #### 4 | 1 | 20 | 47 / 38 | salta, gira, azul, amarillo | exploring (tap-anything), greetings, show, teaching Canelo, shops & presents |
| 70:00 | . 0 | 2 | 17 | 47 / 40 |  | shops & presents, greetings, side jobs, exploring (tap-anything), teaching Canelo |
| 75:00 | # 1 | 1 | 18 | 48 / 41 | croac | exploring (tap-anything), sonidos, shops & presents, greetings, side jobs |
| 80:00 | ##### 5 | 1 | 16 | 53 / 42 | mariposa, blanco, rosa, feliz, triste | shops & presents, greetings, flores |
| 85:00 | . 0 | 4 | 16 | 53 / 46 |  | shops & presents, greetings, side jobs, cuenta, exploring (tap-anything), finding a page |
| 90:00 | . 0 | 0 | 0 | 53 / 46 |  | exploring (tap-anything), cuenta |
| 95:00 | # 1 | 1 | 20 | 54 / 47 | diez | exploring (tap-anything), cuenta, shops & presents, greetings, side jobs, finding a page |
| 100:00 | # 1 | 2 | 34 | 55 / 49 | verde | greetings, fiestab, finding a page |
| 105:00 | # 1 | 0 | 8 | 56 / 49 | gallina | exploring (tap-anything), fiestab |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:13 | show | c1 | 0:26 | 60 | 118 | 33 (11, 0) | 2 | 1.7m / 11.5m | 103:36 | 7 | 13 | 5:44 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 29 | 80 | 9 (1, 0) | 2 | 3.0m / 17.9m | 84:06 | 5 | 9 | 7:08 (answer) | yes |
| guau *guau* | 0:33 | show | canelo-dog | 1:18 | 21 | 55 | 5 (0, 0) | 2 | 5.2m / 31.0m | 104:42 | 3 | 8 | 1:50 (answer) | yes |
| ven *ven* | 1:06 | watch | canelo-dog | 1:01 | 29 | 52 | 14 (5, 0) | 2 | 3.8m / 37.3m | 107:04 | 8 | 9 | 1:24 (answer) | yes |
| gato *el gato* | 6:02 | show | other | 0:54 | 24 | 64 | 6 (2, 0) | 1 | 3.4m / 23.0m | 84:11 | 4 | 9 | 6:56 (answer) | yes |
| miau *miau* | 6:09 | show | other | 1:20 | 16 | 29 | 4 (0, 0) | 0 | 6.6m / 32.4m | 104:43 | 3 | 7 | 77:07 (answer) | yes |
| buenosdias *buenos días* | 8:03 | show | c3 | 1:15 | 45 | 62 | 26 (8, 0) | 1 | 2.2m / 11.5m | 103:12 | 2 | 13 | 9:40 (answer) | yes |
| hueso *el hueso* | 8:17 | show | tricks | 0:24 | 30 | 62 | 9 (1, 0) | 2 | 3.4m / 28.9m | 106:47 | 7 | 11 | 14:51 (answer) | yes |
| sientate *siéntate* | 8:31 | watch | tricks | 0:21 | 29 | 54 | 13 (1, 0) | 1 | 3.5m / 28.6m | 106:45 | 4 | 10 | 9:01 (answer) | yes |
| si *sí* | 13:25 | show | c4 | 0:25 | 45 | 90 | 23 (10, 0) | 1 | 2.2m / 11.4m | 103:45 | 9 | 13 | 13:50 (answer) | yes |
| no *no* | 13:32 | show | c4 | 0:26 | 50 | 86 | 11 (1, 0) | 1 | 1.8m / 11.4m | 103:37 | 11 | 12 | 13:58 (answer) | yes |
| manzana *la manzana* | 14:19 | show | c4 | 1:08 | 18 | 49 | 5 (0, 0) | 0 | 2.8m / 13.7m | 62:21 | 4 | 6 | 15:27 (answer) | yes |
| pelota *la pelota* | 16:37 | show | c5 | 1:18 | 37 | 78 | 12 (2, 0) | 1 | 2.5m / 12.8m | 106:43 | 7 | 12 | 17:55 (answer) | yes |
| rojo *rojo / roja* | 17:29 | find | other | 1:11 | 15 | 36 | 6 (2, 0) | 1 | 6.2m / 22.6m | 104:11 | 4 | 6 | 18:40 (answer) | yes |
| pan *el pan* | 22:16 | show | c6 | 1:39 | 38 | 69 | 6 (2, 0) | 1 | 2.2m / 11.8m | 105:17 | 4 | 12 | 23:55 (answer) | yes |
| gracias *gracias* | 22:24 | overheard | c6 | 1:47 | 44 | 77 | 10 (2, 0) | 4 | 2.1m / 12.5m | 103:34 | 11 | 12 | 24:11 (answer) | yes |
| pato *el pato* | 23:28 | show | shop | 1:11 | 26 | 57 | 4 (1, 0) | 2 | 3.3m / 20.8m | 106:00 | 4 | 6 | 24:39 (answer) | yes |
| cuac *cuac* | 23:38 | show | shop | 1:17 | 21 | 41 | 4 (1, 0) | 0 | 4.1m / 24.8m | 105:10 | 2 | 7 | 24:55 (answer) | yes |
| parque *el parque* | 28:03 | find | other | 1:58 | 22 | 34 | 4 (1, 0) | 0 | 3.9m / 22.5m | 86:58 | 4 | 9 | 30:02 (answer) | yes |
| banco *el banco* | 28:43 | find | shop | 2:29 | 11 | 16 | 4 (0, 0) | 1 | 7.4m / 46.1m | 102:42 | 1 | 4 | 31:12 (answer) | yes |
| fuente *la fuente* | 29:30 | find | shop | 2:25 | 23 | 47 | 6 (0, 0) | 0 | 3.3m / 12.7m | 102:47 | 3 | 10 | 31:56 (answer) | yes |
| granja *la granja* | 30:33 | find | other | 1:55 | 24 | 48 | 3 (0, 0) | 0 | 3.3m / 13.1m | 106:02 | 4 | 9 | 32:28 (answer) | yes |
| cabra *la cabra* | 30:57 | show | other | 0:31 | 10 | 26 | 3 (0, 0) | 0 | 7.8m / 19.6m | 101:06 | 3 | 7 | 50:08 (answer) | yes |
| escuela *la escuela* | 34:23 | find | other | 2:34 | 19 | 27 | 4 (0, 0) | 0 | 3.9m / 32.7m | 103:22 | 2 | 5 | 36:56 (answer) | yes |
| bien *bien* | 34:49 | overheard | hearts | 1:00 | 13 | 43 | 7 (2, 0) | 1 | 5.6m / 29.5m | 101:59 | 3 | 5 | 35:49 (answer) | yes |
| comoestas *¿cómo estás?* | 34:55 | overheard | hearts | 0:44 | 11 | 24 | 8 (1, 0) | 0 | 6.4m / 29.1m | 99:15 | 2 | 5 | 37:43 (answer) | yes |
| agua *el agua* | 41:37 | show | c9 | 1:16 | 27 | 59 | 16 (8, 0) | 2 | 2.4m / 12.7m | 105:15 | 5 | 10 | 42:53 (answer) | yes |
| buenasnoches *buenas noches* | 41:55 | show | c9 | 0:24 | 28 | 32 | 1 (0, 0) | 0 | 2.3m / 11.5m | 103:12 | 1 | 10 | no | no |
| cama *la cama* | 42:01 | find | c9 | 0:37 | 8 | 19 | 6 (2, 0) | 1 | 9.3m / 29.0m | 106:58 | 3 | 7 | 42:38 (answer) | yes |
| cansado *cansado / cansada* | 45:18 | show | c10 | 1:20 | 10 | 19 | 3 (0, 0) | 0 | 6.9m / 29.5m | 107:20 | 3 | 4 | 80:18 (answer) | yes |
| carta *la carta* | 47:04 | show | shop | 0:32 | 8 | 23 | 2 (1, 0) | 1 | 8.1m / 23.1m | 103:26 | 0 | 4 | 49:21 (answer) | no |
| casa *la casa* | 47:24 | find | shop | 1:06 | 25 | 36 | 5 (1, 0) | 0 | 4.0m / 18.9m | 97:11 | 2 | 12 | 48:30 (answer) | yes |
| caballo *el caballo* | 49:51 | show | shop | 1:26 | 9 | 24 | 3 (0, 0) | 0 | 6.9m / 20.4m | 104:51 | 3 | 4 | 51:17 (answer) | yes |
| adios *adiós* | 50:57 | watch | c10 | 1:12 | 15 | 33 | 6 (0, 0) | 1 | 5.8m / 28.3m | 103:29 | 6 | 6 | 52:08 (answer) | yes |
| pata *dame la pata* | 51:56 | answer | tricks | 1:08 | 13 | 34 | 8 (1, 0) | 0 | 6.6m / 23.8m | 106:58 | 2 | 7 | 57:24 (answer) | yes |
| tres *tres* | 55:33 | answer | mercado | 1:26 | 16 | 39 | 5 (3, 0) | 0 | 3.0m / 8.1m | 99:45 | 3 | 7 | 60:24 (answer) | yes |
| platano *el plátano* | 55:42 | answer | mercado | 2:01 | 6 | 17 | 2 (0, 0) | 0 | 9.2m / 38.9m | 100:42 | 1 | 3 | no | yes |
| dos *dos* | 55:47 | answer | mercado | 0:33 | 17 | 40 | 5 (0, 0) | 1 | 2.8m / 8.4m | 99:45 | 2 | 7 | 59:13 (answer) | yes |
| porfavor *por favor* | 55:57 | answer | mercado | 2:29 | 8 | 17 | 5 (0, 0) | 0 | 4.6m / 10.1m | 86:33 | 2 | 5 | 60:01 (answer) | yes |
| huevo *el huevo* | 59:38 | answer | picnic | 1:12 | 17 | 59 | 8 (1, 0) | 0 | 2.5m / 12.3m | 98:53 | 1 | 6 | 63:17 (answer) | yes |
| queso *el queso* | 60:33 | answer | picnic | 1:19 | 10 | 29 | 2 (1, 0) | 1 | 5.1m / 37.5m | 100:40 | 1 | 3 | 63:08 (answer) | no |
| uno *uno* | 60:41 | answer | picnic | 2:01 | 17 | 41 | 9 (1, 0) | 0 | 2.4m / 8.4m | 99:45 | 2 | 6 | 72:56 (answer) | yes |
| leche *la leche* | 61:36 | answer | picnic | 1:53 | 8 | 14 | 1 (1, 1) | 0 | 5.7m / 12.7m | 99:20 | 1 | 6 | no | no |
| salta *salta* | 66:58 | answer | tricks | 0:26 | 8 | 26 | 6 (2, 0) | 0 | 5.8m / 24.0m | 107:04 | 2 | 4 | 68:53 (answer) | yes |
| gira *gira* | 68:09 | answer | tricks | 1:15 | 7 | 24 | 6 (1, 0) | 0 | 6.4m / 23.5m | 107:09 | 2 | 4 | 74:01 (answer) | yes |
| azul *azul* | 68:31 | answer | show | 1:45 | 10 | 18 | 4 (0, 0) | 0 | 4.1m / 13.2m | 105:29 | 3 | 4 | 88:34 (answer) | yes |
| amarillo *amarillo / amarilla* | 69:07 | answer | show | 2:00 | 13 | 21 | 5 (1, 0) | 1 | 3.0m / 13.2m | 105:29 | 3 | 4 | 88:35 (answer) | yes |
| croac *croac* | 76:16 | answer | sonidos | 1:19 | 4 | 8 | 2 (1, 0) | 0 | 9.4m / 27.0m | 104:43 | 1 | 2 | 104:43 (answer) | yes |
| triste *triste* | 80:27 | answer | flores | 1:39 | 5 | 10 | 1 (1, 0) | 0 | 6.7m / 22.5m | 107:20 | 2 | 2 | no | no |
| rosa *rosado / rosada* | 80:50 | answer | flores | 1:54 | 13 | 25 | 4 (0, 0) | 0 | 7.3m / 25.2m | 101:48 | 4 | 7 | 86:04 (answer) | yes |
| blanco *blanco / blanca* | 81:11 | answer | flores | 2:17 | 6 | 14 | 3 (0, 0) | 0 | 4.7m / 13.2m | 104:20 | 2 | 3 | 88:35 (answer) | yes |
| mariposa *la mariposa* | 81:36 | answer | flores | 2:37 | 2 | 7 | 1 (0, 0) | 0 | 2.6m / 2.6m | 84:13 | 1 | 1 | no | yes |
| feliz *feliz* | 82:22 | answer | flores | 2:36 | 7 | 18 | 3 (1, 0) | 0 | 7.3m / 14.7m | 107:25 | 4 | 5 | 102:04 (answer) | yes |
| diez *diez* | 96:44 | answer | cuenta | 1:08 | 3 | 9 | 2 (0, 0) | 0 | 1.5m / 1.7m | 99:45 | 1 | 2 | 99:45 (answer) | yes |
| verde *verde* | 104:25 | answer | fiestab | 1:09 | 2 | 5 | 1 (0, 0) | 0 | 1.2m / 1.2m | 105:33 | 1 | 1 | no | no |
| gallina *la gallina* | 106:02 | answer | fiestab | never | 4 | 8 | 0 (0, 0) | 0 | 15.4m / 19.2m | 106:02 | 3 | 4 | no | no |
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
