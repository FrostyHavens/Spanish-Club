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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 14 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): every Round A and Round B errand, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (80 answers + 10 gold cards); 12% of picture-card questions got one wrong tap first (40); page puzzles solved when their sparkle was on screen within 8 tiles: 15 (saludos, mascota, colores); seed 7. Game time 127:17 (127.3 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:18 (75% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 30 | 0 | 2: croac, gallina | **FAIL** |
| Words retrieved only with a cue | 2 | 0 | 0 | PASS |
| Median active retrievals per word | 1 | ≥ 5 | 4 | **FAIL** |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 86% | **FAIL** |
| Prompts that review older words | low | 40–60% | 70% (381 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 5: pez, naranja, queso, uno, cinco | **FAIL** |

### Chapters 1-10 on their own
The same targets for the 34 words of the chapters written so far, up to the moment the last of them was done (49:26). After them the older errands still run, meeting their words in bulk: they are what chapters 11-21 replace.

| Measure | Target | Now | |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 0 | 0 | PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:12 (82% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 0 | 0 | PASS |
| Words retrieved only with a cue | 0 | 0 | PASS |
| Median active retrievals per word | ≥ 5 | 5.5 | PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 94% | PASS |
| Prompts that review older words | 40–60% | 52% (181 prompts) | PASS |
| Words introduced as a wrong answer first | 0 | 0 | PASS |

Words by stage at the end: unmet 17, met 6, known 5, remembered 5, solid 40.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 56 / 45 (never met: 17, of them shown somewhere: 15) |
| Met via | answer 22, show 19, find 9, overheard 3, watch 3 |
| Active retrievals of met words (picked right + said) | 334 (268 picked, 66 said); 1% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:17 |
| Median encounters per word (distinct moments) | 14 (min 2, max 59) |
| Median active retrievals per word | 4 |
| Most new words in any 5 minutes | 5 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 0. .
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 0. .
- **Never actively retrieved** (never picked right or said): 2: croac, gallina.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 0: none.
- **Met once and never again** (one moment only): 0: none. Three moments or fewer: 4.
- **Long gaps** (more than 15 min between two meetings): 42: ven 61.1m, mariposa 58.9m, carta 57.5m, cama 57.5m, cuac 51.7m, gallina 44.4m, cansado 38.9m, blanco 37.2m, rojo 36.5m, bien 35.8m, porfavor 35.5m, escuela 34.6m, miau 30.9m, pata 30.5m, sientate 30.4m, salta 30.4m, gira 30.4m, gato 30.3m, guau 29.4m, feliz 28.2m, triste 28.2m, agua 28.0m, leche 28.0m, fuente 28.0m, adios 27.3m, … (+17).
- **Not recalled after the errand that introduced it**: 7: buenasnoches, croac, queso, leche, verde, gallina, triste.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 3: miau, queso, feliz.
- **Faded out** (not met in the last 30 minutes of play): 12: comoestas, hueso, perro, gato, mariposa, guau, miau, croac, manzana, platano, queso, banco.
- **Never learned**: 11: buenasnoches, porfavor, mariposa, croac, platano, leche, blanco, verde, gallina, triste, diez. **Never met**: 17: busca, conejo, rana, pajaro, pez, naranja, galleta, panaderia, biblioteca, flor, arbol, cuatro, cinco, seis, siete, ocho, nueve.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-1:53 (1.8m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| El gato de la cerca (`c2`) | 5:13-7:11 (2.0m) | 0 | 1 | 4 (2) | 3 | 0 | 1 |
| exploring (tap-anything) | 5:29-124:51 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 5:32-125:49 | 7: gato, miau, rojo, parque, granja, cabra, escuela | 15 | 4 (4) | 85 | 0 | 8 |
| ¡Buenos días, Canelo! (`c3`) | 7:45-9:45 (2.0m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 7:55-66:03 | 5: hueso, sientate, pata, salta, gira | 1 | 6 (1) | 6 | 0 | 2 |
| hearts | 9:06-37:03 | 2: bien, comoestas | 3 | 8 (2) | 15 | 0 | 2 |
| greetings | 13:01-123:20 | 0 | 19 | 9 (6) | 75 | 0 | 8 |
| El juego de Don Pepe (`c4`) | 13:06-14:47 (1.7m) | 3: si, no, manzana | 3 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:13-122:59 | 0 | 8 | 7 (7) | 12 | 0 | 0 |
| La pelota roja (`c5`) | 15:46-17:20 (1.6m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 1 |
| Pan para los patos (`c6`) | 21:35-24:47 (3.2m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 22:34-112:06 | 7: pato, cuac, banco, fuente, carta, casa, caballo | 7 | 14 (8) | 33 | 0 | 3 |
| side jobs | 25:15-112:32 | 0 | 0 | 7 (1) | 1 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 26:43-32:00 (5.3m) | 0 | 2 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 33:03-37:25 (4.4m) | 0 | 2 | 5 (1) | 2 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 40:38-42:05 (1.5m) | 3: agua, buenasnoches, cama | 2 | 9 (1) | 6 | 0 | 1 |
| Tomás está cansado (`c10`) | 43:44-49:26 (5.7m) | 2: cansado, adios | 1 | 9 (3) | 6 | 0 | 1 |
| El mercado (`mercado`) | 52:56-54:53 (2.0m) | 4: tres, platano, dos, porfavor | 0 | 7 (2) | 3 | 0 | 2 |
| El día de campo (`picnic`) | 57:08-61:28 (4.3m) | 4: queso, uno, huevo, leche | 1 | 14 (4) | 9 | 2 | 2 |
| El show de perros (`show`) | 63:56-67:00 (3.1m) | 2: azul, amarillo | 0 | 15 (5) | 8 | 0 | 3 |
| ¿Qué dicen? (`sonidos`) | 69:53-95:40 (25.8m) | 1: croac | 2 | 10 (5) | 5 | 0 | 0 |
| Las flores de Lucía (`flores`) | 85:11-88:08 (2.9m) | 5: triste, rosa, blanco, mariposa, feliz | 1 | 11 (2) | 4 | 0 | 0 |
| ¿Cuántos animales? (`cuenta`) | 99:00-119:41 (20.7m) | 1: diez | 1 | 9 (4) | 8 | 0 | 1 |
| La fiesta de los animales (`fiestab`) | 119:56-127:12 (7.3m) | 2: verde, gallina | 2 | 25 (12) | 21 | 0 | 3 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-7:26 | 6 | 4 | 11 | 4 | 3 | 18 (22%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 7:26-15:05 | 6 | 5 | 14 | 6 | 2 | 25 (24%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 15:05-25:32 | 6 | 5 | 24 | 6 | 3 | 34 (50%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 25:32-32:18 | 5 | 5 | 28 | 5 | 1 | 33 (73%) | 9 | c7 |
| 5 | 2026-10-13 | 32:18-41:36 | 6 | 4 | 20 | 10 | 3 | 32 (47%) | 11 | c8 |
| 6 | 2026-10-13 | 41:36-43:03 | 0 | 2 | 3 | 1 | 0 | 4 (100%) | 3 | c9 |
| 7 | 2026-10-14 | 43:03-51:45 | 6 | 5 | 31 | 6 | 5 | 41 (73%) | 18 | c10 |
| 8 | 2026-10-15 | 51:45-56:25 | 4 | 1 | 15 | 6 | 3 | 23 (78%) | 14 | mercado |
| 9 | 2026-10-16 | 56:25-63:24 | 4 | 3 | 22 | 8 | 4 | 33 (76%) | 15 | picnic |
| 10 | 2026-10-17 | 63:24-69:22 | 4 | 4 | 20 | 7 | 3 | 29 (76%) | 12 | show |
| 11 | 2026-10-18 | 69:22-84:30 | 0 | 1 | 7 | 3 | 2 | 10 (100%) | 9 | - |
| 12 | 2026-10-19 | 84:30-96:41 | 6 | 3 | 20 | 4 | 2 | 30 (80%) | 17 | flores, sonidos |
| 13 | 2026-10-20 | 96:41-111:48 | 0 | 0 | 10 | 2 | 2 | 12 (100%) | 10 | - |
| 14 | 2026-10-21 | 111:48-127:17 | 3 | 3 | 43 | 12 | 7 | 57 (95%) | 25 | cuenta, fiestab |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 1 | 6 | 4 / 1 | hola, ven, perro, guau | c1, Canelo becomes yours |
| 5:00 | ##### 5 | 5 | 14 | 9 / 6 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 3 | 12 | 12 / 9 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 2 | 15 | 14 / 11 | pelota, rojo | finding a page, greetings, c5, hearts |
| 20:00 | #### 4 | 3 | 13 | 18 / 14 | gracias, cuac, pan, pato | greetings, c6, exploring (tap-anything), shops & presents, hearts |
| 25:00 | #### 4 | 2 | 24 | 22 / 16 | parque, granja, banco, fuente | exploring (tap-anything), side jobs, finding a page, greetings, hearts, shops & presents |
| 30:00 | #### 4 | 3 | 20 | 26 / 19 | comoestas, cabra, escuela, bien | c7, greetings, c8, hearts |
| 35:00 | . 0 | 4 | 14 | 26 / 23 |  | greetings, hearts, c8 |
| 40:00 | #### 4 | 2 | 14 | 30 / 25 | buenasnoches, cama, agua, cansado | c9, shops & presents, greetings, c10 |
| 45:00 | #### 4 | 4 | 25 | 34 / 29 | adios, caballo, carta, casa | shops & presents, exploring (tap-anything), greetings, c10 |
| 50:00 | ##### 5 | 1 | 16 | 39 / 30 | porfavor, pata, platano, dos, tres | greetings, teaching Canelo, shops & presents, mercado |
| 55:00 | #### 4 | 2 | 22 | 43 / 32 | huevo, queso, leche, uno | greetings, shops & presents, exploring (tap-anything), picnic |
| 60:00 | # 1 | 2 | 19 | 44 / 34 | salta | greetings, picnic, shops & presents, side jobs, show, teaching Canelo |
| 65:00 | ### 3 | 4 | 22 | 47 / 38 | gira, azul, amarillo | show, greetings, teaching Canelo, shops & presents, side jobs, exploring (tap-anything) |
| 70:00 | . 0 | 1 | 8 | 47 / 39 |  | shops & presents, exploring (tap-anything), greetings, side jobs |
| 75:00 | . 0 | 0 | 0 | 47 / 39 |  | exploring (tap-anything) |
| 80:00 | . 0 | 0 | 2 | 47 / 39 |  | exploring (tap-anything), greetings |
| 85:00 | ##### 5 | 1 | 8 | 52 / 40 | mariposa, blanco, rosa, feliz, triste | flores, greetings, shops & presents |
| 90:00 | # 1 | 1 | 6 | 53 / 41 | croac | shops & presents, greetings, side jobs, exploring (tap-anything), sonidos |
| 95:00 | . 0 | 1 | 20 | 53 / 42 |  | sonidos, shops & presents, greetings, side jobs, cuenta |
| 100:00 | . 0 | 0 | 0 | 53 / 42 |  | cuenta, exploring (tap-anything) |
| 105:00 | . 0 | 0 | 0 | 53 / 42 |  | exploring (tap-anything) |
| 110:00 | . 0 | 0 | 3 | 53 / 42 |  | exploring (tap-anything), shops & presents, greetings, side jobs |
| 115:00 | # 1 | 0 | 11 | 54 / 42 | diez | exploring (tap-anything), cuenta, greetings, fiestab |
| 120:00 | # 1 | 2 | 33 | 55 / 44 | verde | greetings, fiestab, finding a page, exploring (tap-anything) |
| 125:00 | # 1 | 1 | 7 | 56 / 45 | gallina | fiestab |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:13 | show | c1 | 0:26 | 59 | 117 | 34 (1, 0) | 3 | 2.1m / 13.8m | 123:26 | 8 | 13 | 5:37 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 31 | 80 | 9 (2, 0) | 0 | 3.2m / 19.4m | 95:39 | 7 | 8 | 26:36 (answer) | yes |
| guau *guau* | 0:33 | show | canelo-dog | 5:21 | 20 | 53 | 3 (1, 0) | 2 | 5.0m / 29.4m | 95:34 | 3 | 7 | 5:54 (answer) | yes |
| ven *ven* | 1:06 | watch | canelo-dog | 0:45 | 29 | 49 | 14 (2, 0) | 1 | 4.5m / 61.1m | 126:25 | 8 | 9 | 1:25 (answer) | yes |
| gato *el gato* | 6:04 | show | other | 0:22 | 24 | 63 | 6 (2, 0) | 1 | 3.9m / 30.3m | 95:34 | 4 | 7 | 7:00 (answer) | yes |
| miau *miau* | 6:12 | show | other | 21:35 | 16 | 26 | 2 (0, 0) | 1 | 5.9m / 30.9m | 95:32 | 3 | 7 | 95:25 (answer) | yes |
| buenosdias *buenos días* | 7:51 | show | c3 | 1:23 | 47 | 66 | 27 (6, 0) | 1 | 2.5m / 13.8m | 123:04 | 2 | 13 | 9:41 (answer) | yes |
| hueso *el hueso* | 8:08 | show | tricks | 0:21 | 26 | 56 | 8 (1, 0) | 2 | 2.3m / 7.0m | 66:09 | 6 | 9 | 14:38 (answer) | yes |
| sientate *siéntate* | 8:22 | watch | tricks | 0:30 | 20 | 46 | 13 (4, 0) | 0 | 6.2m / 30.4m | 126:41 | 4 | 9 | 8:52 (answer) | yes |
| si *sí* | 13:12 | show | c4 | 0:24 | 48 | 92 | 22 (4, 0) | 0 | 2.5m / 14.1m | 123:30 | 9 | 13 | 13:37 (answer) | yes |
| no *no* | 13:23 | show | c4 | 0:22 | 49 | 82 | 9 (0, 0) | 5 | 2.3m / 14.1m | 123:26 | 11 | 12 | 13:45 (answer) | yes |
| manzana *la manzana* | 14:07 | show | c4 | 22:35 | 14 | 48 | 5 (3, 0) | 2 | 3.5m / 14.2m | 60:02 | 4 | 6 | 36:43 (answer) | yes |
| pelota *la pelota* | 16:01 | show | c5 | 1:12 | 33 | 75 | 9 (0, 0) | 3 | 3.5m / 19.2m | 126:41 | 8 | 11 | 17:13 (answer) | yes |
| rojo *rojo / roja* | 16:50 | find | other | 1:08 | 16 | 39 | 7 (1, 0) | 0 | 7.2m / 36.5m | 124:20 | 4 | 6 | 17:58 (answer) | yes |
| pan *el pan* | 21:40 | show | c6 | 1:35 | 37 | 65 | 6 (3, 0) | 0 | 2.9m / 19.2m | 125:06 | 4 | 12 | 59:54 (answer) | yes |
| gracias *gracias* | 21:48 | overheard | c6 | 1:44 | 43 | 76 | 11 (3, 0) | 1 | 2.6m / 16.6m | 123:20 | 11 | 11 | 23:32 (answer) | yes |
| pato *el pato* | 22:43 | show | shop | 1:13 | 22 | 54 | 4 (2, 0) | 0 | 4.9m / 24.5m | 125:33 | 4 | 7 | 23:56 (answer) | yes |
| cuac *cuac* | 22:50 | show | shop | 1:19 | 12 | 31 | 4 (1, 0) | 0 | 9.3m / 51.7m | 124:57 | 2 | 5 | 24:08 (answer) | yes |
| parque *el parque* | 27:24 | find | other | 1:53 | 23 | 35 | 4 (0, 0) | 2 | 5.1m / 27.3m | 118:18 | 5 | 9 | 29:17 (answer) | yes |
| banco *el banco* | 28:04 | find | shop | 3:39 | 8 | 13 | 3 (1, 0) | 0 | 3.9m / 10.4m | 55:17 | 1 | 4 | 31:43 (answer) | yes |
| fuente *la fuente* | 28:48 | find | shop | 2:47 | 18 | 34 | 3 (1, 0) | 0 | 4.1m / 28.0m | 98:05 | 4 | 9 | 31:34 (answer) | yes |
| granja *la granja* | 29:45 | find | other | 1:12 | 25 | 47 | 4 (1, 0) | 1 | 4.0m / 19.9m | 125:38 | 4 | 9 | 30:57 (answer) | yes |
| cabra *la cabra* | 30:16 | show | other | 0:21 | 11 | 27 | 3 (0, 0) | 0 | 9.2m / 25.1m | 122:22 | 3 | 8 | 48:38 (answer) | yes |
| escuela *la escuela* | 33:43 | find | other | 3:50 | 19 | 24 | 4 (1, 0) | 0 | 4.9m / 34.6m | 121:16 | 2 | 6 | 37:33 (answer) | yes |
| bien *bien* | 34:06 | overheard | hearts | 1:02 | 14 | 44 | 8 (2, 0) | 0 | 5.0m / 35.8m | 98:51 | 3 | 4 | 35:08 (answer) | yes |
| comoestas *¿cómo estás?* | 34:15 | overheard | hearts | 0:46 | 9 | 22 | 8 (3, 0) | 0 | 4.5m / 12.6m | 70:31 | 1 | 5 | 35:37 (answer) | yes |
| agua *el agua* | 40:44 | show | c9 | 1:13 | 27 | 60 | 14 (3, 0) | 4 | 3.2m / 28.0m | 124:58 | 5 | 9 | 41:58 (answer) | yes |
| buenasnoches *buenas noches* | 41:05 | show | c9 | 0:21 | 28 | 33 | 1 (0, 0) | 5 | 3.0m / 13.8m | 123:09 | 1 | 10 | no | no |
| cama *la cama* | 41:11 | find | c9 | 0:30 | 9 | 19 | 5 (0, 0) | 1 | 10.7m / 57.5m | 126:17 | 3 | 6 | 41:41 (answer) | yes |
| cansado *cansado / cansada* | 43:58 | show | c10 | 1:19 | 8 | 17 | 3 (0, 0) | 0 | 11.9m / 38.9m | 126:57 | 3 | 3 | 45:17 (answer) | yes |
| carta *la carta* | 45:40 | show | shop | 0:34 | 7 | 23 | 3 (1, 0) | 0 | 12.6m / 57.5m | 121:20 | 0 | 3 | 47:47 (answer) | yes |
| casa *la casa* | 45:57 | find | shop | 6:54 | 22 | 33 | 5 (1, 0) | 0 | 4.7m / 27.3m | 98:51 | 3 | 11 | 62:41 (answer) | yes |
| caballo *el caballo* | 48:17 | show | shop | 1:24 | 8 | 23 | 3 (0, 0) | 0 | 10.9m / 25.1m | 124:39 | 3 | 4 | 49:41 (answer) | yes |
| adios *adiós* | 49:21 | watch | c10 | 1:14 | 16 | 36 | 7 (0, 0) | 0 | 6.8m / 27.3m | 123:20 | 6 | 8 | 50:34 (answer) | yes |
| pata *dame la pata* | 50:22 | answer | tricks | 1:12 | 13 | 35 | 9 (3, 0) | 0 | 8.3m / 30.5m | 126:40 | 2 | 7 | 56:03 (answer) | yes |
| tres *tres* | 54:09 | answer | mercado | 2:54 | 15 | 38 | 4 (1, 0) | 1 | 4.9m / 18.7m | 121:00 | 4 | 7 | 71:14 (answer) | yes |
| platano *el plátano* | 54:16 | answer | mercado | 3:11 | 4 | 14 | 1 (0, 0) | 0 | 1.5m / 2.6m | 57:26 | 1 | 2 | no | yes |
| dos *dos* | 54:24 | answer | mercado | 0:28 | 14 | 37 | 4 (1, 0) | 0 | 5.1m / 19.2m | 119:31 | 3 | 7 | 68:08 (answer) | yes |
| porfavor *por favor* | 54:33 | answer | mercado | 1:09 | 5 | 12 | 2 (0, 0) | 0 | 16.9m / 35.5m | 120:40 | 2 | 3 | no | yes |
| queso *el queso* | 57:32 | answer | picnic | 1:09 | 11 | 31 | 2 (2, 0) | 1 | 0.8m / 3.5m | 61:19 | 1 | 2 | 61:02 (answer) | no |
| uno *uno* | 57:36 | answer | picnic | 1:52 | 17 | 39 | 7 (3, 0) | 0 | 4.2m / 19.2m | 121:00 | 3 | 7 | 90:22 (answer) | yes |
| huevo *el huevo* | 58:29 | answer | picnic | 2:44 | 17 | 56 | 7 (3, 1) | 0 | 3.5m / 18.6m | 112:32 | 1 | 6 | 67:49 (answer) | yes |
| leche *la leche* | 59:13 | answer | picnic | 1:16 | 7 | 17 | 2 (0, 1) | 1 | 6.8m / 28.0m | 98:06 | 1 | 4 | no | no |
| salta *salta* | 64:53 | answer | tricks | 0:22 | 7 | 23 | 6 (0, 0) | 0 | 10.4m / 30.4m | 126:46 | 2 | 3 | 69:00 (answer) | yes |
| gira *gira* | 66:00 | answer | tricks | 1:11 | 5 | 16 | 3 (0, 0) | 0 | 15.1m / 30.4m | 126:27 | 1 | 3 | 69:00 (answer) | yes |
| azul *azul* | 66:24 | answer | show | 55:28 | 8 | 15 | 3 (0, 0) | 0 | 8.3m / 26.7m | 124:20 | 3 | 3 | 122:59 (answer) | yes |
| amarillo *amarillo / amarilla* | 66:57 | answer | show | 1:28 | 11 | 20 | 4 (0, 0) | 1 | 5.9m / 26.3m | 125:42 | 3 | 3 | 86:07 (answer) | yes |
| triste *triste* | 85:05 | answer | flores | 2:47 | 6 | 11 | 1 (0, 0) | 0 | 8.4m / 28.2m | 126:57 | 2 | 3 | no | no |
| rosa *rosado / rosada* | 85:25 | answer | flores | 27:02 | 11 | 20 | 2 (1, 0) | 1 | 11.2m / 26.3m | 125:46 | 4 | 6 | 122:59 (answer) | yes |
| blanco *blanco / blanca* | 85:39 | answer | flores | 37:40 | 5 | 10 | 1 (1, 0) | 0 | 9.8m / 37.2m | 124:26 | 2 | 2 | no | yes |
| mariposa *la mariposa* | 86:00 | answer | flores | 3:50 | 3 | 8 | 1 (0, 0) | 0 | 31.3m / 58.9m | 89:50 | 1 | 2 | no | yes |
| feliz *feliz* | 88:07 | answer | flores | 4:23 | 6 | 16 | 2 (1, 0) | 0 | 13.1m / 28.2m | 127:05 | 4 | 5 | 127:05 (answer) | yes |
| croac *croac* | 94:33 | answer | sonidos | never | 2 | 3 | 0 (0, 0) | 0 | 0.9m / 0.9m | 95:19 | 1 | 1 | no | no |
| diez *diez* | 119:40 | answer | cuenta | 1:24 | 2 | 7 | 1 (0, 0) | 0 | 1.5m / 1.5m | 121:05 | 1 | 1 | no | yes |
| verde *verde* | 124:31 | answer | fiestab | 1:18 | 2 | 5 | 1 (0, 0) | 0 | 1.3m / 1.3m | 125:49 | 1 | 1 | no | no |
| gallina *la gallina* | 125:38 | answer | fiestab | never | 5 | 9 | 0 (0, 0) | 0 | 16.8m / 44.4m | 125:38 | 3 | 3 | no | no |
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
