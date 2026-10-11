# Vocabulary flow audit

How the words of Club de Español reach a child, measured by `tools/vocab-audit.js`: the playthrough's own taps over several play sessions on successive days, paced like a child, speaking about a third of the answers (method at the end). Everything below the AUDIT marker is generated, starting with the **measured targets** of `docs/LEARNING_DESIGN.md` (PASS / FAIL).

**Re-run:** `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (about 15 minutes; `--quick`: the game runs 3x faster, about 6 minutes; `--strict`: exit 1 when a target fails; options `--days 5 --session 15 --speak 0.35 --wrong 0.12 --pages 8 --seed 7`; `--from <dump.json>` re-analyses a saved run). It rewrites only the part between the AUDIT markers.

**Status (all 21 chapters, 2026-10-09):** chapters 11-21 replace the older errands, and favores, Luna's *palabra del día* and Inés's daily page puzzle join the greetings, Canelo and the page puzzles as review in the world. Nine of the ten targets pass on the whole run (the full-speed run below: 18 sessions, every chapter, the diploma; the `--quick` run agreed, with 80% review); the review share is above its band:

| Measure (whole run) | Target | Part 1 (chapters 1-10, then the older errands) | Now (chapters 1-21) |
| --- | --- | --- | --- |
| Most new words in any 5 minutes | ≤ 5 | 5 PASS | 5 PASS |
| New words in the first 15-minute session | ≤ 8 | 6 PASS | 6 PASS |
| Words first met on a notebook page | 0 | 0 PASS | 0 PASS |
| Median time from meeting to first use | ≤ 1:30 (90% ≤ 3:00) | 1:16 (98%) PASS | 1:10 (100%) PASS |
| Words never actively retrieved | 0 | 1 (gallina) FAIL | 0 PASS |
| Words retrieved only with a cue | 0 | 1 (leche) FAIL | 0 PASS |
| Median active retrievals per word | ≥ 5 | 5 PASS | 10 PASS |
| Words in ≥ 3 different errands/episodes | ≥ 90% | 93% PASS | 100% PASS |
| Prompts that review older words | 40–60% | 72% (411 prompts) FAIL | 76% (898 prompts) FAIL |
| Words introduced as a wrong answer first | 0 | 5 (pez, naranja, queso, cuatro, cinco) FAIL | 0 PASS |

*Why the review share stays high, and why it was left there.* The target counts a prompt as review when its word was met in an earlier session **or 5+ minutes ago**, over the whole run. Only 219 of the 898 prompts are a word's introduction or its first minutes (73 words, about 3 each); a 40-60% share would allow at most ~330 reviews in all, i.e. under 5 spaced retrievals per word, below this same table's ≥ 5 (now 10). The curriculum itself plans 43-100% review per chapter from chapter 10 on (median about 70%, `CURRICULUM.md` §4), and the research behind the design asks for spaced, not massed, practice. Read the curriculum's way (a word met on an earlier *day*), the share is 74%, and 184 of the reviews are page-puzzle matches. Lowering it would mean either cutting the spaced reviews that make the other targets pass or adding massed repeats of each new word within its first five minutes; neither helps a 7-year-old. A target that fits the curriculum would be "at least 40% of prompts review older words" (passing at 76%).

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
One full tap playthrough (tools/playflow.js), 2026-10-11, over 18 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): all 21 chapters, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (217 answers + 18 gold cards); 12% of picture-card questions got one wrong tap first (78); page puzzles solved when their sparkle was on screen within 8 tiles: 49 (saludos, mascota, numeros, colores, comida, animales, cosas, sonidos, granja); seed 7. Game time 180:49 (180.8 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:12 (99% ≤ 3:00) | PASS |
| Words never actively retrieved | 30 | 0 | 0 | PASS |
| Words retrieved only with a cue | 2 | 0 | 0 | PASS |
| Median active retrievals per word | 1 | ≥ 5 | 10 | PASS |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 100% | PASS |
| Prompts that review older words | low | ≥ 40% | 77% (935 prompts) | PASS |
| Words introduced as a wrong answer first | 18 | 0 | 0 | PASS |

Review share in detail: 76% of the prompts are words met on an earlier day; 196 of the 935 prompts are page-puzzle matches (4 per puzzle).

Words by stage at the end: unmet 0, met 0, known 0, remembered 0, solid 73.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 73 / 73 (never met: 0, of them shown somewhere: 0) |
| Met via | show 45, find 17, watch 7, overheard 4 |
| Active retrievals of met words (picked right + said) | 883 (680 picked, 203 said); 0% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:12 |
| Median encounters per word (distinct moments) | 26 (min 6, max 122) |
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
- **Long gaps** (more than 15 min between two meetings): 51: arbol 106.2m, pata 62.1m, biblioteca 47.2m, manzana 42.7m, naranja 41.8m, sientate 40.0m, caballo 39.4m, porfavor 39.3m, comoestas 39.0m, gallina 38.8m, rosa 36.8m, adios 35.4m, platano 34.1m, cama 32.3m, hueso 31.9m, gato 30.3m, dos 29.8m, miau 27.7m, perro 26.3m, blanco 25.9m, queso 25.9m, guau 25.3m, rojo 25.2m, mariposa 24.7m, banco 24.1m, … (+26).
- **Not recalled after the errand that introduced it**: 0: none.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 0: none.
- **Faded out** (not met in the last 30 minutes of play): 1: bien.
- **Never learned**: 0: none. **Never met**: 0.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-2:06 (2.0m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:22-1:31 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| hearts | 1:44-163:11 | 2: bien, comoestas | 8 | 4 (2) | 39 | 0 | 4 |
| El gato de la cerca (`c2`) | 5:13-7:16 (2.0m) | 0 | 2 | 4 (2) | 3 | 0 | 0 |
| exploring (tap-anything) | 5:32-174:34 | 0 | 0 | 0 (0) | 1 | 0 | 0 |
| other | 5:35-176:46 | 23: gato, miau, rojo, parque, granja, cabra, escuela, gallina, huevo, uno, dos, blanco, panaderia, biblioteca, arbol, conejo, rana, croac, verde, pajaro, pez, siete, ocho | 49 | 4 (4) | 311 | 0 | 19 |
| ¡Buenos días, Canelo! (`c3`) | 7:57-9:45 (1.8m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 8:06-113:31 | 3: hueso, sientate, busca | 4 | 6 (1) | 16 | 0 | 1 |
| greetings | 13:12-176:30 | 0 | 26 | 9 (6) | 171 | 0 | 20 |
| El juego de Don Pepe (`c4`) | 13:19-15:10 (1.8m) | 3: si, no, manzana | 4 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:37-151:45 | 0 | 10 | 11 (11) | 36 | 0 | 0 |
| La pelota roja (`c5`) | 16:11-17:46 (1.6m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 0 |
| Pan para los patos (`c6`) | 21:57-25:28 (3.5m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 23:07-175:08 | 20: pato, cuac, banco, fuente, carta, casa, caballo, platano, naranja, porfavor, tres, cuatro, queso, leche, galleta, azul, feliz, rosa, amarillo, mariposa | 8 | 15 (9) | 134 | 1 | 16 |
| side jobs | 26:08-174:30 | 0 | 1 | 8 (2) | 5 | 0 | 1 |
| ¿Dónde está Canelo? (`c7`) | 27:46-32:54 (5.1m) | 0 | 1 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 37:42-42:00 (4.3m) | 0 | 0 | 3 (1) | 1 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 45:23-46:56 (1.5m) | 3: agua, buenasnoches, cama | 2 | 9 (1) | 6 | 0 | 0 |
| Tomás está cansado (`c10`) | 51:25-57:56 (6.5m) | 2: cansado, adios | 1 | 9 (3) | 6 | 0 | 2 |
| Los huevos de Rosa (`c11`) | 62:02-64:51 (2.8m) | 0 | 0 | 4 (2) | 2 | 0 | 1 |
| El mercado de Mamá (`c12`) | 73:40-77:13 (3.6m) | 0 | 2 | 10 (4) | 7 | 0 | 0 |
| El día de campo (`c13`) | 79:35-86:42 (7.1m) | 2: cinco, seis | 1 | 18 (10) | 15 | 0 | 1 |
| El show de perros (`c14`) | 90:07-98:48 (8.7m) | 2: pata, salta | 2 | 12 (6) | 10 | 0 | 2 |
| Las flores de Lucía (`c15`) | 101:00-104:14 (3.2m) | 2: triste, flor | 1 | 14 (5) | 7 | 0 | 2 |
| Las páginas perdidas (`c16`) | 108:46-119:19 (10.5m) | 0 | 0 | 4 (0) | 2 | 0 | 0 |
| ¿Qué dicen? (`c17`) | 121:16-128:26 (7.2m) | 1: gira | 1 | 18 (6) | 11 | 0 | 1 |
| ¿Cuántos animales? (`c18`) | 135:24-141:54 (6.5m) | 0 | 1 | 14 (5) | 8 | 0 | 0 |
| ¡Todos a la granja! (`c19`) | 148:29-155:05 (6.6m) | 2: nueve, diez | 0 | 29 (18) | 22 | 0 | 2 |
| Preparamos la fiesta (`c20`) | 157:16-169:51 (12.6m) | 0 | 0 | 13 (7) | 7 | 0 | 2 |
| La fiesta de los animales (`c21`) | 176:30-180:45 (4.2m) | 0 | 0 | 54 (30) | 31 | 0 | 2 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-11 | 0:00-7:40 | 6 | 5 | 10 | 7 | 3 | 20 (20%) | 0 | c1, c2 |
| 2 | 2026-10-12 | 7:40-15:28 | 6 | 5 | 15 | 5 | 3 | 26 (23%) | 2 | c3, c4 |
| 3 | 2026-10-13 | 15:28-26:25 | 6 | 6 | 20 | 11 | 1 | 35 (43%) | 7 | c5, c6 |
| 4 | 2026-10-14 | 26:25-34:52 | 5 | 5 | 33 | 5 | 1 | 39 (67%) | 12 | c7 |
| 5 | 2026-10-15 | 34:52-46:22 | 6 | 2 | 31 | 11 | 7 | 45 (62%) | 18 | c8 |
| 6 | 2026-10-15 | 46:22-50:00 | 0 | 4 | 13 | 4 | 0 | 17 (100%) | 12 | c9 |
| 7 | 2026-10-16 | 50:00-59:37 | 5 | 5 | 35 | 11 | 4 | 50 (72%) | 22 | c10 |
| 8 | 2026-10-17 | 59:37-68:12 | 5 | 4 | 28 | 10 | 5 | 39 (64%) | 16 | c11 |
| 9 | 2026-10-18 | 68:12-77:41 | 5 | 5 | 37 | 12 | 6 | 53 (72%) | 24 | c12 |
| 10 | 2026-10-19 | 77:41-88:35 | 5 | 7 | 46 | 14 | 8 | 62 (76%) | 28 | c13 |
| 11 | 2026-10-20 | 88:35-99:27 | 5 | 4 | 47 | 15 | 6 | 65 (75%) | 27 | c14 |
| 12 | 2026-10-21 | 99:27-108:06 | 5 | 6 | 40 | 7 | 3 | 50 (72%) | 25 | c15 |
| 13 | 2026-10-22 | 108:06-120:08 | 4 | 5 | 48 | 18 | 2 | 64 (83%) | 33 | c16 |
| 14 | 2026-10-23 | 120:08-131:28 | 5 | 2 | 52 | 17 | 5 | 71 (77%) | 36 | c17 |
| 15 | 2026-10-24 | 131:28-143:06 | 3 | 5 | 54 | 13 | 6 | 70 (86%) | 38 | c18 |
| 16 | 2026-10-25 | 143:06-158:14 | 2 | 2 | 64 | 25 | 9 | 90 (94%) | 54 | c19 |
| 17 | 2026-10-26 | 158:14-171:00 | 0 | 1 | 55 | 20 | 5 | 75 (100%) | 44 | c20 |
| 18 | 2026-10-27 | 171:00-180:49 | 0 | 0 | 52 | 12 | 4 | 64 (100%) | 44 | c21 |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 2 | 7 | 4 / 2 | hola, ven, perro, guau | c1, Canelo becomes yours, hearts |
| 5:00 | ##### 5 | 5 | 15 | 9 / 7 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 2 | 12 | 12 / 9 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 3 | 16 | 14 / 12 | pelota, rojo | c4, finding a page, greetings, c5, hearts |
| 20:00 | #### 4 | 3 | 12 | 18 / 15 | gracias, cuac, pan, pato | greetings, c6, exploring (tap-anything), shops & presents |
| 25:00 | ### 3 | 1 | 22 | 21 / 16 | parque, banco, fuente | c6, side jobs, greetings, finding a page, hearts, shops & presents |
| 30:00 | ## 2 | 5 | 19 | 23 / 21 | cabra, granja | greetings, hearts, c7, shops & presents, exploring (tap-anything), side jobs |
| 35:00 | ### 3 | 2 | 22 | 26 / 23 | comoestas, escuela, bien | greetings, shops & presents, c8, hearts |
| 40:00 | . 0 | 0 | 16 | 26 / 23 |  | greetings, hearts, c8, shops & presents, exploring (tap-anything), side jobs |
| 45:00 | ### 3 | 4 | 20 | 29 / 27 | buenasnoches, cama, agua | c9, greetings, hearts, shops & presents |
| 50:00 | ### 3 | 1 | 28 | 32 / 28 | carta, casa, cansado | greetings, exploring (tap-anything), shops & presents, c10, side jobs |
| 55:00 | ## 2 | 4 | 18 | 34 / 32 | adios, caballo | greetings, shops & presents, hearts, c10, exploring (tap-anything), side jobs |
| 60:00 | ##### 5 | 4 | 28 | 39 / 36 | huevo, blanco, gallina, uno, dos | greetings, shops & presents, hearts, c11 |
| 65:00 | . 0 | 1 | 21 | 39 / 37 |  | shops & presents, side jobs, hearts, greetings |
| 70:00 | ## 2 | 2 | 22 | 41 / 39 | platano, naranja | shops & presents, greetings, side jobs, c12 |
| 75:00 | ### 3 | 4 | 29 | 44 / 43 | porfavor, tres, cuatro | shops & presents, c12, greetings, c13 |
| 80:00 | ### 3 | 3 | 26 | 47 / 46 | queso, leche, panaderia | shops & presents, side jobs, greetings, finding a page, exploring (tap-anything) |
| 85:00 | ## 2 | 2 | 29 | 49 / 48 | cinco, seis | c13, greetings, shops & presents |
| 90:00 | ## 2 | 2 | 23 | 51 / 50 | pata, salta | greetings, c14, exploring (tap-anything), shops & presents, side jobs |
| 95:00 | ### 3 | 2 | 28 | 54 / 52 | galleta, azul, feliz | greetings, shops & presents, c14 |
| 100:00 | ##### 5 | 4 | 29 | 59 / 56 | mariposa, rosa, amarillo, flor, triste | shops & presents, greetings, c15 |
| 105:00 | . 0 | 2 | 25 | 59 / 58 |  | shops & presents, greetings, side jobs, c16 |
| 110:00 | #### 4 | 2 | 27 | 63 / 60 | busca, conejo, biblioteca, arbol | shops & presents, greetings, finding a page, exploring (tap-anything), teaching Canelo |
| 115:00 | . 0 | 3 | 29 | 63 / 63 |  | greetings, shops & presents, hearts, exploring (tap-anything), c16, finding a page |
| 120:00 | #### 4 | 0 | 34 | 67 / 63 | rana, pajaro, croac, verde | finding a page, greetings, c17, shops & presents, exploring (tap-anything), side jobs |
| 125:00 | # 1 | 2 | 26 | 68 / 65 | gira | c17, greetings, hearts |
| 130:00 | . 0 | 3 | 29 | 68 / 68 |  | greetings, shops & presents, side jobs |
| 135:00 | ### 3 | 1 | 28 | 71 / 69 | pez, siete, ocho | greetings, c18 |
| 140:00 | . 0 | 2 | 31 | 71 / 71 |  | greetings, c18, finding a page, shops & presents |
| 145:00 | . 0 | 0 | 26 | 71 / 71 |  | shops & presents, greetings, side jobs, c19 |
| 150:00 | ## 2 | 0 | 30 | 73 / 71 | nueve, diez | exploring (tap-anything), finding a page, c19 |
| 155:00 | . 0 | 2 | 28 | 73 / 73 |  | c19, greetings, hearts, shops & presents, c20 |
| 160:00 | . 0 | 0 | 27 | 73 / 73 |  | greetings, shops & presents, exploring (tap-anything), side jobs, hearts |
| 165:00 | . 0 | 0 | 33 | 73 / 73 |  | shops & presents, greetings, c20 |
| 170:00 | . 0 | 0 | 28 | 73 / 73 |  | exploring (tap-anything), greetings, shops & presents, side jobs |
| 175:00 | . 0 | 0 | 33 | 73 / 73 |  | shops & presents, greetings, c21 |
| 180:00 | . 0 | 0 | 7 | 73 / 73 |  | c21 |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:13 | show | c1 | 0:26 | 122 | 176 | 85 (25, 0) | 5 | 1.5m / 5.6m | 176:25 | 9 | 18 | 5:43 (answer) | yes |
| perro *el perro* | 0:22 | find | canelo-dog | 0:22 | 50 | 109 | 17 (4, 0) | 3 | 3.6m / 26.3m | 179:28 | 7 | 15 | 7:08 (answer) | yes |
| guau *guau* | 0:33 | show | canelo-dog | 1:16 | 33 | 70 | 8 (2, 0) | 4 | 5.6m / 25.3m | 179:38 | 4 | 13 | 1:49 (answer) | yes |
| ven *ven* | 1:06 | watch | canelo-dog | 0:59 | 47 | 80 | 23 (6, 0) | 2 | 3.9m / 16.8m | 180:35 | 10 | 16 | 1:25 (answer) | yes |
| gato *el gato* | 6:01 | show | other | 0:55 | 46 | 91 | 11 (2, 0) | 1 | 3.8m / 30.3m | 179:17 | 6 | 13 | 6:56 (answer) | yes |
| miau *miau* | 6:08 | show | other | 1:21 | 24 | 47 | 8 (2, 0) | 0 | 7.5m / 27.7m | 179:38 | 4 | 12 | 50:23 (answer) | yes |
| buenosdias *buenos días* | 8:03 | show | c3 | 1:15 | 103 | 122 | 29 (4, 0) | 6 | 1.7m / 8.2m | 180:27 | 4 | 17 | 9:41 (answer) | yes |
| hueso *el hueso* | 8:17 | show | tricks | 0:24 | 39 | 73 | 11 (2, 0) | 4 | 4.5m / 31.9m | 178:52 | 9 | 16 | 15:04 (answer) | yes |
| sientate *siéntate* | 8:31 | watch | tricks | 0:21 | 32 | 60 | 17 (2, 0) | 2 | 5.5m / 40.0m | 178:46 | 5 | 15 | 9:01 (answer) | yes |
| si *sí* | 13:26 | show | c4 | 0:24 | 70 | 108 | 26 (6, 0) | 2 | 2.4m / 10.6m | 174:30 | 9 | 17 | 13:50 (answer) | yes |
| no *no* | 13:32 | show | c4 | 0:26 | 53 | 92 | 13 (2, 0) | 4 | 3.1m / 14.8m | 174:26 | 11 | 17 | 13:58 (answer) | yes |
| manzana *la manzana* | 14:19 | show | c4 | 0:26 | 31 | 70 | 10 (2, 0) | 3 | 5.4m / 42.7m | 177:45 | 6 | 13 | 56:16 (answer) | yes |
| pelota *la pelota* | 16:24 | show | c5 | 1:15 | 47 | 88 | 11 (3, 0) | 0 | 3.4m / 14.9m | 174:14 | 8 | 16 | 17:39 (answer) | yes |
| rojo *rojo / roja* | 17:16 | find | other | 1:12 | 29 | 52 | 11 (1, 0) | 0 | 5.7m / 25.2m | 177:33 | 2 | 15 | 18:28 (answer) | yes |
| pan *el pan* | 22:03 | show | c6 | 1:39 | 87 | 156 | 18 (5, 0) | 5 | 1.8m / 9.7m | 178:52 | 6 | 16 | 23:41 (answer) | yes |
| gracias *gracias* | 22:10 | overheard | c6 | 1:48 | 68 | 134 | 17 (3, 0) | 2 | 2.4m / 13.5m | 174:30 | 11 | 17 | 23:58 (answer) | yes |
| pato *el pato* | 23:15 | show | shop | 1:09 | 39 | 93 | 13 (2, 0) | 4 | 4.1m / 24.1m | 179:57 | 5 | 13 | 24:24 (answer) | yes |
| cuac *cuac* | 23:24 | show | shop | 1:37 | 27 | 66 | 9 (1, 0) | 0 | 5.7m / 21.4m | 172:28 | 1 | 13 | 25:01 (answer) | yes |
| parque *el parque* | 28:24 | find | other | 1:48 | 32 | 50 | 7 (4, 0) | 0 | 4.9m / 22.9m | 158:46 | 5 | 14 | 30:12 (answer) | yes |
| banco *el banco* | 28:50 | find | shop | 2:36 | 31 | 43 | 10 (1, 0) | 1 | 5.0m / 24.1m | 178:41 | 3 | 13 | 31:26 (answer) | yes |
| fuente *la fuente* | 29:38 | find | shop | 2:29 | 57 | 98 | 9 (3, 0) | 1 | 2.7m / 12.8m | 178:41 | 6 | 15 | 32:06 (answer) | yes |
| granja *la granja* | 30:44 | find | other | 1:55 | 41 | 63 | 7 (1, 0) | 0 | 3.7m / 18.6m | 176:30 | 5 | 14 | 32:39 (answer) | yes |
| cabra *la cabra* | 31:08 | show | other | 0:30 | 36 | 59 | 8 (4, 0) | 0 | 4.2m / 15.4m | 179:18 | 3 | 14 | 33:36 (answer) | yes |
| escuela *la escuela* | 38:25 | find | other | 1:10 | 42 | 56 | 6 (1, 0) | 1 | 3.4m / 16.1m | 177:19 | 4 | 13 | 39:34 (answer) | yes |
| bien *bien* | 38:51 | overheard | hearts | 1:03 | 23 | 65 | 13 (1, 0) | 4 | 4.3m / 23.2m | 133:30 | 4 | 10 | 39:55 (answer) | yes |
| comoestas *¿cómo estás?* | 38:59 | overheard | hearts | 0:49 | 16 | 28 | 11 (2, 0) | 0 | 9.4m / 39.0m | 180:08 | 5 | 10 | 48:00 (answer) | yes |
| agua *el agua* | 45:29 | show | c9 | 1:22 | 51 | 107 | 35 (10, 0) | 0 | 2.6m / 11.5m | 180:35 | 6 | 14 | 46:51 (answer) | yes |
| buenasnoches *buenas noches* | 45:50 | show | c9 | 0:22 | 88 | 101 | 9 (1, 0) | 6 | 1.5m / 6.5m | 180:30 | 3 | 14 | 48:00 (answer) | yes |
| cama *la cama* | 45:56 | find | c9 | 0:32 | 18 | 34 | 13 (3, 0) | 0 | 7.9m / 32.3m | 180:44 | 3 | 11 | 46:28 (answer) | yes |
| cansado *cansado / cansada* | 51:35 | show | c10 | 1:09 | 29 | 58 | 15 (2, 0) | 1 | 4.6m / 20.5m | 180:35 | 7 | 12 | 69:59 (answer) | yes |
| carta *la carta* | 53:02 | show | shop | 1:06 | 26 | 68 | 7 (2, 0) | 1 | 5.5m / 17.4m | 173:35 | 1 | 12 | 56:00 (answer) | yes |
| casa *la casa* | 53:53 | find | shop | 1:09 | 42 | 63 | 9 (6, 0) | 0 | 4.3m / 19.3m | 177:19 | 5 | 17 | 55:02 (answer) | yes |
| caballo *el caballo* | 56:49 | show | shop | 1:18 | 13 | 38 | 9 (2, 0) | 0 | 10.1m / 39.4m | 177:39 | 2 | 8 | 58:07 (answer) | yes |
| adios *adiós* | 57:49 | watch | c10 | 1:13 | 20 | 51 | 10 (1, 0) | 0 | 8.3m / 35.4m | 180:23 | 9 | 11 | 60:44 (answer) | yes |
| gallina *la gallina* | 62:22 | show | other | 2:06 | 27 | 55 | 11 (4, 0) | 0 | 4.5m / 38.8m | 179:23 | 3 | 8 | 70:52 (answer) | yes |
| huevo *el huevo* | 62:31 | show | other | 1:06 | 41 | 124 | 18 (4, 0) | 1 | 2.9m / 12.8m | 176:46 | 2 | 11 | 63:37 (answer) | yes |
| uno *uno* | 62:48 | find | other | 0:33 | 27 | 57 | 10 (3, 0) | 1 | 3.7m / 16.2m | 159:46 | 3 | 9 | 64:06 (answer) | yes |
| dos *dos* | 62:54 | find | other | 2:22 | 21 | 56 | 11 (4, 0) | 0 | 4.5m / 29.8m | 154:30 | 3 | 7 | 63:09 (answer) | yes |
| blanco *blanco / blanca* | 63:48 | find | other | 2:13 | 25 | 43 | 8 (2, 0) | 0 | 4.7m / 25.9m | 177:34 | 2 | 10 | 71:48 (answer) | yes |
| platano *el plátano* | 74:38 | show | shop | 1:47 | 13 | 51 | 12 (3, 1) | 0 | 8.6m / 34.1m | 177:55 | 2 | 8 | 76:46 (answer) | yes |
| naranja *la naranja* | 74:47 | show | shop | 0:25 | 12 | 33 | 5 (0, 0) | 0 | 9.4m / 41.8m | 177:50 | 2 | 5 | 76:58 (answer) | yes |
| porfavor *por favor* | 75:01 | overheard | shop | 0:20 | 16 | 35 | 9 (3, 0) | 0 | 9.2m / 39.3m | 173:35 | 2 | 10 | 78:32 (answer) | yes |
| tres *tres* | 75:07 | show | shop | 0:28 | 26 | 59 | 15 (2, 0) | 3 | 3.9m / 15.1m | 173:13 | 3 | 9 | 78:51 (answer) | yes |
| cuatro *cuatro* | 75:27 | show | shop | 1:59 | 26 | 55 | 15 (2, 0) | 1 | 3.9m / 17.9m | 174:01 | 4 | 9 | 82:05 (answer) | yes |
| panaderia *la panadería* | 80:47 | find | other | 1:32 | 30 | 41 | 9 (3, 0) | 0 | 5.4m / 21.2m | 177:19 | 5 | 13 | 82:19 (answer) | yes |
| queso *el queso* | 82:37 | show | shop | 1:06 | 19 | 43 | 10 (1, 0) | 3 | 5.4m / 25.9m | 178:01 | 3 | 8 | 83:43 (answer) | yes |
| leche *la leche* | 84:05 | show | shop | 1:41 | 35 | 58 | 8 (4, 0) | 0 | 2.9m / 9.7m | 177:56 | 2 | 9 | 116:53 (answer) | yes |
| cinco *cinco* | 85:13 | show | c13 | 1:00 | 19 | 39 | 11 (2, 0) | 0 | 5.1m / 17.9m | 176:30 | 4 | 8 | 86:13 (answer) | yes |
| seis *seis* | 86:00 | show | c13 | 1:08 | 18 | 38 | 9 (3, 0) | 0 | 5.3m / 17.9m | 176:25 | 5 | 8 | 87:07 (answer) | yes |
| pata *dame la pata* | 90:46 | watch | c14 | 1:16 | 13 | 35 | 11 (2, 0) | 0 | 12.5m / 62.1m | 178:32 | 3 | 8 | 91:00 (answer) | yes |
| salta *salta* | 91:21 | watch | c14 | 1:31 | 14 | 31 | 10 (2, 0) | 0 | 6.7m / 15.0m | 178:25 | 4 | 8 | 91:38 (answer) | yes |
| galleta *la galleta* | 95:18 | show | shop | 0:42 | 13 | 34 | 10 (3, 0) | 0 | 7.3m / 17.3m | 179:01 | 3 | 6 | 96:31 (answer) | yes |
| azul *azul* | 96:46 | show | shop | 0:27 | 17 | 33 | 8 (2, 0) | 1 | 5.1m / 23.8m | 177:29 | 2 | 8 | 100:52 (answer) | yes |
| feliz *feliz* | 97:20 | show | shop | 1:48 | 16 | 34 | 8 (4, 0) | 1 | 5.5m / 20.5m | 180:30 | 5 | 8 | 99:08 (answer) | yes |
| triste *triste* | 101:18 | show | c15 | 1:19 | 12 | 26 | 7 (0, 0) | 0 | 7.2m / 23.0m | 180:30 | 4 | 6 | 104:04 (answer) | yes |
| flor *la flor* | 101:31 | show | c15 | 0:28 | 26 | 53 | 9 (2, 0) | 1 | 6.0m / 23.7m | 174:00 | 2 | 13 | 105:43 (answer) | yes |
| rosa *rosado / rosada* | 102:22 | find | shop | 1:09 | 22 | 36 | 13 (1, 0) | 0 | 7.8m / 36.8m | 177:34 | 5 | 11 | 103:31 (answer) | yes |
| amarillo *amarillo / amarilla* | 102:57 | find | shop | 1:28 | 15 | 29 | 10 (1, 0) | 0 | 5.3m / 23.9m | 177:38 | 2 | 6 | 104:25 (answer) | yes |
| mariposa *la mariposa* | 103:03 | show | shop | 2:03 | 12 | 26 | 10 (2, 0) | 0 | 6.9m / 24.7m | 179:57 | 2 | 6 | 105:06 (answer) | yes |
| biblioteca *la biblioteca* | 111:03 | find | other | 3:28 | 28 | 36 | 8 (2, 0) | 0 | 4.3m / 47.2m | 177:29 | 3 | 7 | 114:31 (answer) | yes |
| busca *busca* | 112:15 | watch | tricks | 0:24 | 12 | 27 | 10 (4, 0) | 0 | 6.0m / 13.9m | 178:37 | 3 | 6 | 113:23 (answer) | yes |
| arbol *el árbol* | 113:35 | find | other | 1:44 | 17 | 30 | 11 (4, 0) | 1 | 10.8m / 106.2m | 178:46 | 2 | 7 | 115:19 (answer) | yes |
| conejo *el conejo* | 113:43 | show | other | 2:21 | 18 | 37 | 8 (2, 0) | 1 | 3.9m / 11.5m | 180:03 | 3 | 6 | 118:33 (answer) | yes |
| rana *la rana* | 124:04 | show | other | 1:12 | 18 | 53 | 9 (0, 0) | 2 | 3.2m / 17.3m | 179:57 | 3 | 5 | 125:16 (answer) | yes |
| croac *croac* | 124:11 | show | other | 1:56 | 13 | 30 | 11 (3, 0) | 0 | 4.8m / 12.9m | 179:43 | 2 | 5 | 132:43 (answer) | yes |
| verde *verde* | 124:17 | show | other | 0:49 | 10 | 21 | 7 (1, 0) | 0 | 5.9m / 23.8m | 177:29 | 2 | 5 | 132:17 (answer) | yes |
| pajaro *el pájaro* | 124:39 | show | other | 2:13 | 14 | 30 | 7 (0, 0) | 0 | 4.2m / 11.7m | 179:52 | 2 | 5 | 131:55 (answer) | yes |
| gira *gira* | 127:49 | watch | c17 | 1:41 | 10 | 28 | 11 (3, 0) | 0 | 5.6m / 13.7m | 178:46 | 3 | 5 | 128:06 (answer) | yes |
| pez *el pez* | 136:11 | show | other | 0:21 | 11 | 23 | 5 (1, 0) | 0 | 4.3m / 11.9m | 179:52 | 2 | 4 | 143:55 (answer) | yes |
| siete *siete* | 138:46 | show | other | 1:11 | 10 | 28 | 7 (2, 0) | 0 | 3.1m / 8.3m | 166:28 | 2 | 3 | 139:56 (answer) | yes |
| ocho *ocho* | 139:21 | show | other | 1:17 | 12 | 32 | 7 (1, 0) | 0 | 3.7m / 8.4m | 180:03 | 3 | 4 | 141:36 (answer) | yes |
| nueve *nueve* | 153:35 | show | c19 | 1:51 | 7 | 19 | 5 (2, 0) | 0 | 4.4m / 7.1m | 180:03 | 2 | 3 | 155:27 (answer) | yes |
| diez *diez* | 153:49 | show | c19 | 0:35 | 6 | 15 | 5 (1, 0) | 0 | 5.3m / 8.8m | 180:08 | 2 | 3 | 158:41 (answer) | yes |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event with the game time, map, speaker and episode: *meet* (the word model: met, and how), *prompt* (a question whose answer it is: intro / new / review, its stage, the cards shown, cued), *retrieval* (an active use credited to the model: said, cued, card mode, first try, stage before and after), *stage*, *shown* (a dialogue line, a prompt, a picture, the bag, a banner), *heard* (the voice), *tapped-object*, *choice-shown* (ans: it was the answer), *recognized*, *wrong*, *picked*, *said*, *learned*, and *session* (a new session or day).
- A word is *new* when it is met (stage 1); being shown or heard before that does not count (an unmet word appears as its picture only). *Active uses* are the model's retrievals of a met word; the answer that met it is its puzzle, not a use. *First use*: the first retrieval at least 20 s after meeting. *Cued*: the answer could be found by matching the prompt (its picture over the question and on its card, or its word written in both). *Review prompts*: questions about a word met in an earlier session or 5+ minutes earlier (or asked by `G.review`, or a page puzzle).
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, Canelo's tricks, a side job, the bag) says which errand it belonged to. *Errands/episodes a word is in*: the contexts it came up in after it was met.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line, ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a gold card, 2 s for errand and badge cards, 5 s to look at the notebook, 12 s for a page puzzle, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around.
- Sessions: about 15 minutes each (the session ends at the next free moment on the map), each on the next calendar day (G.debug.dayShift): once-a-day greetings, side jobs and say-it-back stars come back each day, and the word model's day-based reviews fall due. Bursts: 5+ meetings within 30 s. Overload: more than 8 meetings within 5 minutes.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (`--quick` runs the game 3x faster, `--strict` exits 1 when a target fails, `--days 5 --session 15`; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
