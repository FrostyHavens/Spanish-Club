# Vocabulary flow audit

How the words of Club de Español reach a child, measured by `tools/vocab-audit.js`: the playthrough's own taps over several play sessions on successive days, paced like a child, speaking about a third of the answers (method at the end). Everything below the AUDIT marker is generated, starting with the **measured targets** of `docs/LEARNING_DESIGN.md` (PASS / FAIL).

**Re-run:** `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 15 minutes; `--quick`: the game runs 3x faster, about 6 minutes; `--strict`: exit 1 when a target fails; options `--days 5 --session 15 --speak 0.35 --wrong 0.12 --pages 8 --seed 7`; `--from <dump.json>` re-analyses a saved run). It rewrites only the part between the AUDIT markers.

**Status (all 21 chapters, 2026-10-09):** chapters 11-21 replace the older errands, and favores, Luna's *palabra del día* and Inés's daily page puzzle join the greetings, Canelo and the page puzzles as review in the world. Nine of the ten targets pass on the whole run (17 sessions, every chapter, the diploma); the review share is above its band:

| Measure (whole run) | Target | Part 1 (chapters 1-10, then the older errands) | Now (chapters 1-21) |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 5 PASS | 5 PASS |
| New words in the first 15-minute session | ≤ 8 | 6 PASS | 6 PASS |
| Words first met on a notebook page | 0 | 0 PASS | 0 PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:16 (98%) PASS | 1:12 (97%) PASS |
| Words never actively retrieved | 0 | 1 (gallina) FAIL | 0 PASS |
| Words retrieved only with a cue | 0 | 1 (leche) FAIL | 0 PASS |
| Median active retrievals per word | ≥ 5 | 5 PASS | 10 PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 93% PASS | 100% PASS |
| Prompts that review older words | 40–60% | 72% (411 prompts) FAIL | 80% (884 prompts) FAIL |
| Words introduced as a wrong answer first | 0 | 5 (pez, naranja, queso, cuatro, cinco) FAIL | 0 PASS |

*Why the review share stays high, and why it was left there.* The target counts a prompt as review when its word was met in an earlier session **or 5+ minutes ago**, over the whole run. Only 180 of the 884 prompts are a word's introduction or its first minutes (73 words, about 2.5 each); a 40-60% share would allow at most ~270 reviews in all, i.e. under 4 spaced retrievals per word, below this same table's ≥ 5 (now 10). The curriculum itself plans 43-100% review per chapter from chapter 10 on (median about 70%, `CURRICULUM.md` §4), and the research behind the design asks for spaced, not massed, practice. Read the curriculum's way (a word met on an earlier *day*), the share is 74%, and 180 of the reviews are page-puzzle matches. Lowering it would mean either cutting the spaced reviews that make the other targets pass or adding massed repeats of each new word within its first five minutes; neither helps a 7-year-old. A target that fits the curriculum would be "at least 40% of prompts review older words" (passing at 80%).

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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 17 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): all 21 chapters, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (197 answers + 13 gold cards); 12% of picture-card questions got one wrong tap first (79); page puzzles solved when their sparkle was on screen within 8 tiles: 45 (saludos, mascota, numeros, colores, comida, animales, cosas, sonidos, granja); seed 7. Game time 169:14 (169.2 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:12 (97% ≤ 3:00) | PASS |
| Words never actively retrieved | 30 | 0 | 0 | PASS |
| Words retrieved only with a cue | 2 | 0 | 0 | PASS |
| Median active retrievals per word | 1 | ≥ 5 | 10 | PASS |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 100% | PASS |
| Prompts that review older words | low | 40–60% | 80% (884 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 0 | PASS |

Review share in detail: 74% of the prompts are words met on an earlier day; 180 of the 884 prompts are page-puzzle matches (4 per puzzle).

Words by stage at the end: unmet 0, met 0, known 0, remembered 1, solid 72.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 73 / 73 (never met: 0, of them shown somewhere: 0) |
| Met via | show 45, find 17, watch 7, overheard 4 |
| Active retrievals of met words (picked right + said) | 832 (649 picked, 183 said); 0% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:12 |
| Median encounters per word (distinct moments) | 22 (min 5, max 114) |
| Median active retrievals per word | 10 |
| Most new words in any 5 minutes | 5 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 0. .
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 0. .
- **Never actively retrieved** (never picked right or said): 0: none.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 0: none.
- **Met once and never again** (one moment only): 0: none. Three moments or fewer: 0.
- **Long gaps** (more than 15 min between two meetings): 51: arbol 104.8m, pata 60.4m, comoestas 58.2m, pez 43.6m, pato 37.6m, adios 36.2m, rosa 35.4m, sientate 35.1m, rojo 33.6m, porfavor 30.7m, naranja 26.5m, platano 24.8m, hueso 24.2m, caballo 23.9m, panaderia 23.9m, flor 23.4m, cama 23.0m, parque 22.6m, carta 22.5m, ven 22.2m, amarillo 22.1m, banco 21.7m, queso 21.6m, guau 21.3m, miau 21.3m, … (+26).
- **Not recalled after the errand that introduced it**: 0: none.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 0: none.
- **Faded out** (not met in the last 30 minutes of play): 0: none.
- **Never learned**: 0: none. **Never met**: 0.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-2:07 (2.1m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| hearts | 1:45-163:58 | 2: bien, comoestas | 6 | 4 (2) | 39 | 0 | 5 |
| El gato de la cerca (`c2`) | 5:12-7:16 (2.1m) | 0 | 2 | 4 (2) | 3 | 0 | 0 |
| exploring (tap-anything) | 5:32-149:21 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 5:35-165:11 | 23: gato, miau, rojo, parque, granja, cabra, escuela, gallina, huevo, uno, dos, blanco, panaderia, biblioteca, arbol, conejo, rana, croac, verde, pajaro, pez, siete, ocho | 47 | 4 (4) | 297 | 0 | 25 |
| ¡Buenos días, Canelo! (`c3`) | 7:58-9:46 (1.8m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 8:07-112:06 | 3: hueso, sientate, busca | 5 | 6 (1) | 16 | 0 | 1 |
| greetings | 13:13-164:49 | 0 | 25 | 9 (6) | 155 | 0 | 14 |
| El juego de Don Pepe (`c4`) | 13:20-15:01 (1.7m) | 3: si, no, manzana | 4 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:51-149:41 | 0 | 12 | 11 (11) | 36 | 0 | 0 |
| La pelota roja (`c5`) | 16:25-18:00 (1.6m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 0 |
| Pan para los patos (`c6`) | 22:11-25:43 (3.5m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 23:22-163:31 | 20: pato, cuac, banco, fuente, carta, casa, caballo, platano, naranja, porfavor, tres, cuatro, queso, leche, galleta, azul, feliz, rosa, amarillo, mariposa | 8 | 15 (9) | 114 | 1 | 11 |
| side jobs | 26:11-159:33 | 0 | 1 | 7 (1) | 3 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 27:31-32:56 (5.4m) | 0 | 1 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 38:23-42:57 (4.6m) | 0 | 0 | 3 (1) | 1 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 46:10-47:30 (1.3m) | 3: agua, buenasnoches, cama | 1 | 9 (1) | 6 | 0 | 1 |
| Tomás está cansado (`c10`) | 51:21-58:59 (7.6m) | 2: cansado, adios | 2 | 9 (3) | 6 | 0 | 0 |
| Los huevos de Rosa (`c11`) | 61:10-63:56 (2.8m) | 0 | 0 | 4 (2) | 2 | 0 | 0 |
| El mercado de Mamá (`c12`) | 70:10-75:16 (5.1m) | 0 | 3 | 13 (5) | 8 | 0 | 0 |
| El día de campo (`c13`) | 77:28-84:12 (6.7m) | 2: cinco, seis | 1 | 18 (10) | 15 | 0 | 3 |
| El show de perros (`c14`) | 88:13-96:10 (8.0m) | 2: pata, salta | 2 | 15 (7) | 11 | 0 | 3 |
| Las flores de Lucía (`c15`) | 98:49-101:48 (3.0m) | 2: triste, flor | 1 | 15 (5) | 7 | 0 | 0 |
| Las páginas perdidas (`c16`) | 107:39-117:09 (9.5m) | 0 | 0 | 4 (0) | 2 | 0 | 0 |
| ¿Qué dicen? (`c17`) | 119:15-125:03 (5.8m) | 1: gira | 1 | 18 (6) | 11 | 0 | 4 |
| ¿Cuántos animales? (`c18`) | 134:30-140:27 (6.0m) | 0 | 1 | 14 (5) | 8 | 0 | 2 |
| ¡Todos a la granja! (`c19`) | 146:36-153:04 (6.5m) | 2: nueve, diez | 0 | 29 (18) | 22 | 0 | 2 |
| Preparamos la fiesta (`c20`) | 153:31-164:51 (11.3m) | 0 | 0 | 13 (7) | 7 | 0 | 2 |
| La fiesta de los animales (`c21`) | 164:57-169:09 (4.2m) | 0 | 0 | 54 (30) | 31 | 0 | 4 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-7:40 | 6 | 5 | 10 | 7 | 3 | 20 (30%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 7:40-15:43 | 6 | 6 | 16 | 4 | 3 | 26 (27%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 15:43-26:28 | 6 | 6 | 20 | 11 | 1 | 35 (51%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 26:28-35:36 | 5 | 4 | 40 | 5 | 1 | 46 (80%) | 16 | c7 |
| 5 | 2026-10-13 | 35:36-47:11 | 6 | 3 | 30 | 12 | 7 | 44 (64%) | 15 | c8 |
| 6 | 2026-10-13 | 47:11-50:46 | 0 | 5 | 14 | 2 | 0 | 16 (100%) | 13 | c9 |
| 7 | 2026-10-14 | 50:46-60:18 | 5 | 4 | 32 | 14 | 1 | 48 (79%) | 20 | c10 |
| 8 | 2026-10-15 | 60:18-67:21 | 5 | 3 | 30 | 7 | 5 | 39 (72%) | 18 | c11 |
| 9 | 2026-10-16 | 67:21-75:43 | 5 | 6 | 32 | 10 | 3 | 46 (72%) | 19 | c12 |
| 10 | 2026-10-17 | 75:43-86:32 | 5 | 6 | 42 | 13 | 7 | 59 (80%) | 27 | c13 |
| 11 | 2026-10-18 | 86:32-96:50 | 5 | 4 | 50 | 10 | 9 | 64 (77%) | 30 | c14 |
| 12 | 2026-10-19 | 96:50-106:25 | 5 | 7 | 36 | 11 | 3 | 49 (82%) | 26 | c15 |
| 13 | 2026-10-20 | 106:25-117:58 | 4 | 4 | 47 | 18 | 1 | 63 (86%) | 37 | c16 |
| 14 | 2026-10-21 | 117:58-128:57 | 5 | 3 | 54 | 14 | 8 | 72 (82%) | 36 | c17 |
| 15 | 2026-10-22 | 128:57-140:48 | 3 | 5 | 53 | 16 | 6 | 70 (89%) | 39 | c18 |
| 16 | 2026-10-23 | 140:48-155:58 | 2 | 1 | 65 | 25 | 7 | 91 (95%) | 54 | c19 |
| 17 | 2026-10-24 | 155:58-169:14 | 0 | 1 | 78 | 18 | 14 | 96 (100%) | 54 | c20, c21 |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 2 | 7 | 4 / 2 | hola, ven, perro, guau | c1, Canelo becomes yours, hearts |
| 5:00 | ##### 5 | 5 | 15 | 9 / 7 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 3 | 12 | 12 / 10 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 3 | 16 | 14 / 13 | pelota, rojo | hearts, finding a page, greetings, c5 |
| 20:00 | #### 4 | 3 | 12 | 18 / 16 | gracias, cuac, pan, pato | greetings, c6, exploring (tap-anything), shops & presents |
| 25:00 | ### 3 | 1 | 22 | 21 / 17 | parque, banco, fuente | c6, exploring (tap-anything), side jobs, finding a page, greetings, hearts, shops & presents |
| 30:00 | ## 2 | 4 | 25 | 23 / 21 | cabra, granja | greetings, hearts, c7, shops & presents |
| 35:00 | ### 3 | 0 | 21 | 26 / 21 | comoestas, escuela, bien | exploring (tap-anything), side jobs, greetings, shops & presents, hearts, c8 |
| 40:00 | . 0 | 3 | 17 | 26 / 24 |  | greetings, hearts, c8 |
| 45:00 | ### 3 | 5 | 16 | 29 / 29 | buenasnoches, cama, agua | c9, shops & presents, greetings |
| 50:00 | ### 3 | 1 | 25 | 32 / 30 | carta, casa, cansado | greetings, shops & presents, exploring (tap-anything), side jobs, c10, hearts |
| 55:00 | ## 2 | 2 | 21 | 34 / 32 | adios, caballo | shops & presents, exploring (tap-anything), greetings, c10 |
| 60:00 | ##### 5 | 4 | 26 | 39 / 36 | huevo, blanco, gallina, uno, dos | greetings, c11, shops & presents, side jobs |
| 65:00 | . 0 | 1 | 26 | 39 / 37 |  | shops & presents, greetings, hearts, side jobs |
| 70:00 | ##### 5 | 5 | 24 | 44 / 42 | porfavor, platano, naranja, tres, cuatro | greetings, c12, shops & presents |
| 75:00 | # 1 | 1 | 27 | 45 / 43 | panaderia | c12, greetings, shops & presents, finding a page, exploring (tap-anything), c13, side jobs |
| 80:00 | #### 4 | 4 | 27 | 49 / 47 | queso, leche, cinco, seis | shops & presents, exploring (tap-anything), c13, greetings |
| 85:00 | ## 2 | 3 | 26 | 51 / 50 | pata, salta | greetings, shops & presents, c14 |
| 90:00 | ### 3 | 1 | 26 | 54 / 51 | galleta, azul, feliz | greetings, shops & presents, side jobs, exploring (tap-anything) |
| 95:00 | ### 3 | 2 | 29 | 57 / 53 | rosa, flor, triste | shops & presents, greetings, c14, c15 |
| 100:00 | ## 2 | 5 | 21 | 59 / 58 | mariposa, amarillo | shops & presents, c15, greetings, side jobs |
| 105:00 | # 1 | 1 | 31 | 60 / 59 | biblioteca | greetings, shops & presents, c16, side jobs, finding a page |
| 110:00 | ### 3 | 3 | 24 | 63 / 62 | busca, conejo, arbol | exploring (tap-anything), teaching Canelo, greetings |
| 115:00 | . 0 | 1 | 32 | 63 / 63 |  | greetings, hearts, exploring (tap-anything), c16, finding a page, c17, shops & presents |
| 120:00 | ##### 5 | 3 | 25 | 68 / 66 | gira, rana, pajaro, croac, verde | greetings, hearts, exploring (tap-anything), c17 |
| 125:00 | . 0 | 2 | 35 | 68 / 68 |  | c17, finding a page, greetings, shops & presents, side jobs, hearts |
| 130:00 | . 0 | 0 | 31 | 68 / 68 |  | greetings, shops & presents, side jobs, exploring (tap-anything), hearts, c18 |
| 135:00 | ### 3 | 2 | 24 | 71 / 70 | pez, siete, ocho | exploring (tap-anything), c18 |
| 140:00 | . 0 | 1 | 34 | 71 / 71 |  | c18, shops & presents, greetings, exploring (tap-anything), side jobs |
| 145:00 | . 0 | 0 | 24 | 71 / 71 |  | greetings, finding a page, c19, exploring (tap-anything) |
| 150:00 | ## 2 | 0 | 32 | 73 / 71 | nueve, diez | c19, c20, shops & presents |
| 155:00 | . 0 | 2 | 33 | 73 / 73 |  | shops & presents, greetings, side jobs |
| 160:00 | . 0 | 0 | 34 | 73 / 73 |  | greetings, shops & presents, hearts, c20, c21 |
| 165:00 | . 0 | 0 | 32 | 73 / 73 |  | c21 |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:12 | show | c1 | 0:26 | 114 | 174 | 77 (18, 0) | 3 | 1.5m / 7.5m | 164:41 | 9 | 17 | 5:44 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 53 | 116 | 17 (1, 0) | 2 | 3.2m / 18.7m | 167:51 | 7 | 15 | 7:09 (answer) | yes |
| guau *guau* | 0:32 | show | canelo-dog | 1:18 | 33 | 67 | 9 (1, 0) | 2 | 5.2m / 21.3m | 168:06 | 4 | 15 | 1:50 (answer) | yes |
| ven *ven* | 1:05 | watch | canelo-dog | 1:01 | 50 | 78 | 21 (9, 0) | 1 | 3.4m / 22.2m | 169:04 | 11 | 13 | 1:24 (answer) | yes |
| gato *el gato* | 6:02 | show | other | 0:55 | 52 | 101 | 14 (5, 0) | 2 | 3.2m / 19.5m | 167:40 | 6 | 16 | 6:57 (answer) | yes |
| miau *miau* | 6:09 | show | other | 1:21 | 29 | 49 | 7 (3, 0) | 3 | 5.8m / 21.3m | 168:01 | 3 | 14 | 48:50 (answer) | yes |
| buenosdias *buenos días* | 8:03 | show | c3 | 1:15 | 87 | 105 | 27 (6, 0) | 4 | 1.9m / 11.0m | 168:53 | 4 | 16 | 9:41 (answer) | yes |
| hueso *el hueso* | 8:18 | show | tricks | 0:24 | 36 | 73 | 14 (1, 0) | 2 | 4.5m / 24.2m | 167:21 | 9 | 15 | 14:52 (answer) | yes |
| sientate *siéntate* | 8:32 | watch | tricks | 0:21 | 27 | 55 | 15 (2, 0) | 2 | 6.1m / 35.1m | 167:11 | 4 | 10 | 9:02 (answer) | yes |
| si *sí* | 13:26 | show | c4 | 0:25 | 77 | 118 | 27 (7, 0) | 2 | 2.0m / 12.0m | 160:20 | 9 | 17 | 13:51 (answer) | yes |
| no *no* | 13:33 | show | c4 | 0:26 | 55 | 94 | 13 (1, 0) | 0 | 2.7m / 18.3m | 160:15 | 11 | 15 | 13:59 (answer) | yes |
| manzana *la manzana* | 14:20 | show | c4 | 1:08 | 33 | 85 | 15 (4, 0) | 0 | 4.7m / 18.9m | 166:11 | 6 | 15 | 15:28 (answer) | yes |
| pelota *la pelota* | 16:38 | show | c5 | 1:15 | 41 | 82 | 9 (3, 0) | 2 | 3.6m / 18.4m | 159:15 | 8 | 14 | 17:53 (answer) | yes |
| rojo *rojo / roja* | 17:30 | find | other | 1:12 | 30 | 53 | 10 (2, 0) | 1 | 5.1m / 33.6m | 165:58 | 2 | 12 | 18:42 (answer) | yes |
| pan *el pan* | 22:17 | show | c6 | 1:39 | 64 | 124 | 12 (1, 0) | 4 | 2.3m / 7.4m | 167:21 | 6 | 15 | 23:55 (answer) | yes |
| gracias *gracias* | 22:24 | overheard | c6 | 1:47 | 65 | 129 | 15 (1, 0) | 2 | 2.3m / 8.9m | 160:21 | 11 | 16 | 24:12 (answer) | yes |
| pato *el pato* | 23:29 | show | shop | 1:09 | 35 | 84 | 11 (5, 0) | 4 | 4.2m / 37.6m | 168:19 | 5 | 12 | 24:38 (answer) | yes |
| cuac *cuac* | 23:38 | show | shop | 1:38 | 21 | 48 | 7 (2, 0) | 0 | 6.9m / 21.3m | 162:18 | 1 | 12 | 25:17 (answer) | yes |
| parque *el parque* | 28:12 | find | other | 2:02 | 39 | 56 | 7 (4, 0) | 2 | 4.2m / 22.6m | 163:26 | 7 | 15 | 30:14 (answer) | yes |
| banco *el banco* | 28:52 | find | shop | 2:33 | 30 | 44 | 11 (1, 0) | 2 | 4.8m / 21.7m | 167:06 | 4 | 11 | 31:25 (answer) | yes |
| fuente *la fuente* | 29:40 | find | shop | 2:29 | 45 | 75 | 11 (3, 0) | 1 | 3.1m / 15.2m | 167:06 | 5 | 14 | 32:08 (answer) | yes |
| granja *la granja* | 30:45 | find | other | 1:55 | 38 | 57 | 6 (0, 0) | 1 | 3.6m / 17.8m | 165:11 | 8 | 14 | 32:41 (answer) | yes |
| cabra *la cabra* | 31:09 | show | other | 0:31 | 29 | 51 | 8 (1, 0) | 1 | 4.8m / 19.1m | 167:41 | 2 | 12 | 49:28 (answer) | yes |
| escuela *la escuela* | 38:59 | find | other | 1:08 | 39 | 51 | 6 (3, 0) | 0 | 3.3m / 17.3m | 165:44 | 5 | 12 | 40:08 (answer) | yes |
| bien *bien* | 39:29 | overheard | hearts | 1:24 | 22 | 64 | 10 (4, 0) | 2 | 5.9m / 19.6m | 163:12 | 4 | 10 | 40:53 (answer) | yes |
| comoestas *¿cómo estás?* | 39:39 | overheard | hearts | 1:05 | 20 | 36 | 13 (1, 0) | 1 | 6.8m / 58.2m | 168:33 | 5 | 9 | 42:28 (answer) | yes |
| agua *el agua* | 46:16 | show | c9 | 1:13 | 31 | 70 | 18 (5, 0) | 0 | 4.0m / 12.8m | 169:04 | 6 | 13 | 48:34 (answer) | yes |
| buenasnoches *buenas noches* | 46:35 | show | c9 | 0:26 | 77 | 90 | 9 (1, 0) | 1 | 1.6m / 7.5m | 168:58 | 3 | 13 | 48:20 (answer) | yes |
| cama *la cama* | 46:41 | find | c9 | 0:35 | 13 | 27 | 11 (1, 0) | 0 | 10.2m / 23.0m | 169:09 | 3 | 10 | 47:16 (answer) | yes |
| cansado *cansado / cansada* | 51:32 | show | c10 | 1:11 | 24 | 47 | 11 (3, 0) | 2 | 5.1m / 18.8m | 169:03 | 7 | 10 | 52:42 (answer) | yes |
| carta *la carta* | 53:13 | show | shop | 1:42 | 20 | 60 | 8 (2, 0) | 1 | 6.5m / 22.5m | 160:15 | 2 | 9 | 55:10 (answer) | yes |
| casa *la casa* | 54:58 | find | shop | 1:10 | 43 | 60 | 7 (2, 0) | 0 | 3.9m / 19.0m | 165:44 | 7 | 15 | 56:08 (answer) | yes |
| caballo *el caballo* | 57:40 | show | shop | 1:32 | 18 | 44 | 10 (2, 0) | 0 | 6.5m / 23.9m | 166:06 | 2 | 9 | 67:48 (answer) | yes |
| adios *adiós* | 58:54 | watch | c10 | 1:07 | 21 | 54 | 11 (1, 0) | 0 | 7.3m / 36.2m | 168:53 | 8 | 12 | 60:01 (answer) | yes |
| gallina *la gallina* | 61:28 | show | other | 1:56 | 29 | 52 | 10 (1, 0) | 0 | 3.8m / 20.7m | 167:46 | 3 | 8 | 63:24 (answer) | yes |
| huevo *el huevo* | 61:33 | show | other | 1:10 | 35 | 112 | 16 (5, 0) | 1 | 2.9m / 16.1m | 159:33 | 2 | 10 | 62:43 (answer) | yes |
| uno *uno* | 61:52 | find | other | 0:38 | 25 | 55 | 13 (2, 0) | 2 | 4.0m / 13.9m | 157:32 | 3 | 10 | 76:42 (answer) | yes |
| dos *dos* | 62:00 | find | other | 0:20 | 27 | 63 | 12 (4, 0) | 1 | 4.0m / 15.0m | 164:41 | 3 | 9 | 62:20 (answer) | yes |
| blanco *blanco / blanca* | 62:51 | find | other | 1:17 | 24 | 43 | 9 (2, 0) | 1 | 4.5m / 17.9m | 165:58 | 2 | 10 | 80:41 (answer) | yes |
| platano *el plátano* | 71:04 | show | shop | 1:34 | 14 | 49 | 10 (3, 1) | 0 | 7.3m / 24.8m | 166:22 | 2 | 7 | 74:45 (answer) | yes |
| naranja *la naranja* | 71:10 | show | shop | 0:27 | 13 | 35 | 6 (1, 0) | 0 | 7.9m / 26.5m | 166:17 | 2 | 8 | 74:54 (answer) | yes |
| porfavor *por favor* | 71:22 | overheard | shop | 0:20 | 16 | 36 | 10 (1, 0) | 0 | 8.0m / 30.7m | 157:12 | 2 | 9 | 73:58 (answer) | yes |
| tres *tres* | 71:32 | show | shop | 0:23 | 22 | 53 | 14 (2, 0) | 3 | 4.3m / 10.8m | 160:46 | 3 | 9 | 72:06 (answer) | yes |
| cuatro *cuatro* | 71:48 | show | shop | 1:39 | 26 | 52 | 13 (0, 0) | 2 | 3.6m / 14.5m | 160:51 | 4 | 8 | 73:27 (answer) | yes |
| panaderia *la panadería* | 78:26 | find | other | 0:42 | 30 | 37 | 7 (3, 0) | 1 | 5.0m / 23.9m | 165:44 | 5 | 11 | 86:09 (answer) | yes |
| queso *el queso* | 80:00 | show | shop | 1:12 | 17 | 40 | 8 (1, 0) | 1 | 5.5m / 21.6m | 166:28 | 3 | 8 | 81:12 (answer) | yes |
| leche *la leche* | 81:41 | show | shop | 1:34 | 21 | 42 | 7 (1, 0) | 2 | 4.4m / 10.9m | 166:22 | 2 | 8 | 92:50 (answer) | yes |
| cinco *cinco* | 82:40 | show | c13 | 0:58 | 21 | 43 | 15 (3, 0) | 1 | 3.9m / 11.6m | 160:46 | 4 | 8 | 83:38 (answer) | yes |
| seis *seis* | 83:25 | show | c13 | 1:08 | 21 | 42 | 9 (3, 0) | 1 | 3.8m / 12.9m | 158:54 | 5 | 8 | 84:32 (answer) | yes |
| pata *dame la pata* | 88:55 | watch | c14 | 1:08 | 16 | 39 | 12 (2, 0) | 0 | 9.2m / 60.4m | 166:57 | 3 | 7 | 89:13 (answer) | yes |
| salta *salta* | 89:29 | watch | c14 | 1:28 | 14 | 32 | 10 (1, 0) | 1 | 5.9m / 19.6m | 166:52 | 4 | 7 | 89:42 (answer) | yes |
| galleta *la galleta* | 92:59 | show | shop | 0:39 | 11 | 27 | 8 (1, 0) | 0 | 7.8m / 19.6m | 167:26 | 3 | 7 | 105:56 (answer) | yes |
| azul *azul* | 94:13 | show | shop | 0:27 | 16 | 33 | 8 (2, 0) | 0 | 4.8m / 20.2m | 165:53 | 2 | 6 | 98:45 (answer) | yes |
| feliz *feliz* | 94:47 | show | shop | 1:44 | 17 | 36 | 9 (5, 0) | 0 | 4.6m / 15.9m | 168:58 | 4 | 6 | 96:31 (answer) | yes |
| triste *triste* | 99:00 | show | c15 | 1:09 | 14 | 31 | 10 (2, 0) | 1 | 5.4m / 15.9m | 168:58 | 4 | 5 | 100:09 (answer) | yes |
| flor *la flor* | 99:11 | show | c15 | 2:00 | 27 | 53 | 8 (1, 0) | 1 | 5.4m / 23.4m | 162:49 | 2 | 12 | 103:29 (answer) | yes |
| rosa *rosado / rosada* | 99:52 | find | shop | 2:15 | 19 | 33 | 11 (4, 0) | 1 | 8.4m / 35.4m | 166:03 | 5 | 10 | 102:07 (answer) | yes |
| amarillo *amarillo / amarilla* | 100:33 | find | shop | 2:13 | 13 | 27 | 9 (1, 0) | 1 | 5.5m / 22.1m | 166:05 | 2 | 5 | 102:46 (answer) | yes |
| mariposa *la mariposa* | 100:43 | show | shop | 3:07 | 16 | 31 | 11 (3, 0) | 0 | 4.5m / 11.8m | 168:18 | 2 | 6 | 103:50 (answer) | yes |
| biblioteca *la biblioteca* | 109:35 | find | other | 3:32 | 21 | 33 | 9 (2, 0) | 0 | 2.9m / 12.1m | 165:53 | 3 | 5 | 113:06 (answer) | yes |
| busca *busca* | 110:53 | watch | tricks | 1:05 | 10 | 24 | 9 (1, 0) | 0 | 6.2m / 19.0m | 167:02 | 3 | 5 | 111:58 (answer) | yes |
| arbol *el árbol* | 112:10 | find | other | 1:39 | 15 | 25 | 8 (2, 0) | 0 | 11.5m / 104.8m | 167:10 | 2 | 6 | 113:49 (answer) | yes |
| conejo *el conejo* | 112:17 | show | other | 2:39 | 21 | 41 | 9 (4, 0) | 2 | 2.8m / 9.5m | 168:28 | 3 | 5 | 116:22 (answer) | yes |
| rana *la rana* | 120:43 | show | other | 1:17 | 18 | 53 | 9 (2, 0) | 3 | 2.8m / 12.6m | 168:19 | 3 | 4 | 122:00 (answer) | yes |
| croac *croac* | 120:49 | show | other | 1:50 | 12 | 26 | 8 (2, 0) | 0 | 4.4m / 16.5m | 168:08 | 2 | 4 | 122:39 (answer) | yes |
| verde *verde* | 120:56 | show | other | 0:42 | 8 | 19 | 5 (2, 0) | 1 | 6.4m / 15.7m | 165:53 | 2 | 4 | 129:25 (answer) | yes |
| pajaro *el pájaro* | 121:15 | show | other | 2:08 | 14 | 29 | 6 (0, 0) | 1 | 3.6m / 19.0m | 168:14 | 2 | 4 | 129:46 (answer) | yes |
| gira *gira* | 124:29 | watch | c17 | 1:41 | 8 | 23 | 9 (1, 0) | 0 | 6.0m / 10.2m | 167:11 | 3 | 4 | 124:42 (answer) | yes |
| pez *el pez* | 135:14 | show | other | 1:23 | 14 | 30 | 7 (1, 0) | 0 | 5.9m / 43.6m | 168:14 | 2 | 4 | 136:38 (answer) | yes |
| siete *siete* | 137:59 | show | other | 1:09 | 11 | 29 | 7 (2, 0) | 0 | 2.7m / 9.5m | 164:41 | 2 | 3 | 139:08 (answer) | yes |
| ocho *ocho* | 138:37 | show | other | 1:33 | 10 | 28 | 6 (0, 0) | 0 | 3.3m / 9.8m | 168:28 | 3 | 3 | 140:23 (answer) | yes |
| nueve *nueve* | 151:28 | show | c19 | 0:23 | 5 | 15 | 3 (1, 0) | 1 | 4.3m / 9.8m | 168:28 | 2 | 2 | 155:05 (answer) | yes |
| diez *diez* | 151:46 | show | c19 | 0:40 | 6 | 14 | 5 (3, 0) | 0 | 3.4m / 7.3m | 168:33 | 2 | 2 | 156:53 (answer) | yes |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event with the game time, map, speaker and episode: *meet* (the word model: met, and how), *prompt* (a question whose answer it is: intro / new / review, its stage, the cards shown, cued), *retrieval* (an active use credited to the model: said, cued, card mode, first try, stage before and after), *stage*, *shown* (a dialogue line, a prompt, a picture, the bag, a banner), *heard* (the voice), *tapped-object*, *choice-shown* (ans: it was the answer), *recognized*, *wrong*, *picked*, *said*, *learned*, and *session* (a new session or day).
- A word is *new* when it is met (stage 1); being shown or heard before that does not count (an unmet word appears as its picture only). *Active uses* are the model's retrievals of a met word; the answer that met it is its puzzle, not a use. *First use*: the first retrieval at least 20 s after meeting. *Cued*: the answer could be found by matching the prompt (its picture over the question and on its card, or its word written in both). *Review prompts*: questions about a word met in an earlier session or 5+ minutes earlier (or asked by `G.review`, or a page puzzle).
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, Canelo's tricks, a side job, the bag) says which errand it belonged to. *Errands/episodes a word is in*: the contexts it came up in after it was met.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line, ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a gold card, 2 s for errand and badge cards, 5 s to look at the notebook, 12 s for a page puzzle, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around.
- Sessions: about 15 minutes each (the session ends at the next free moment on the map), each on the next calendar day (G.debug.dayShift): once-a-day greetings, side jobs and say-it-back stars come back each day, and the word model's day-based reviews fall due. Bursts: 5+ meetings within 30 s. Overload: more than 8 meetings within 5 minutes.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (`--quick` runs the game 3x faster, `--strict` exits 1 when a target fails, `--days 5 --session 15`; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
