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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 18 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): all 21 chapters, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (226 answers + 14 gold cards); 12% of picture-card questions got one wrong tap first (74); page puzzles solved when their sparkle was on screen within 8 tiles: 46 (saludos, mascota, numeros, colores, comida, animales, cosas, sonidos, granja); seed 7. Game time 167:38 (167.6 min) with a child's pace added for reading, listening, thinking and looking; 1 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 5 | PASS |
| New words in the first 15-minute session | 65 | ≤ 8 | 6 | PASS |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 1:10 (100% ≤ 3:00) | PASS |
| Words never actively retrieved | 30 | 0 | 0 | PASS |
| Words retrieved only with a cue | 2 | 0 | 0 | PASS |
| Median active retrievals per word | 1 | ≥ 5 | 10 | PASS |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 100% | PASS |
| Prompts that review older words | low | 40–60% | 76% (898 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 0 | PASS |

Review share in detail: 74% of the prompts are words met on an earlier day; 184 of the 898 prompts are page-puzzle matches (4 per puzzle).

Words by stage at the end: unmet 0, met 0, known 0, remembered 0, solid 73.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 73 |
| Met / remembered (gold) by the end | 73 / 73 (never met: 0, of them shown somewhere: 0) |
| Met via | show 45, find 17, watch 7, overheard 4 |
| Active retrievals of met words (picked right + said) | 846 (636 picked, 210 said); 0% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 1:10 |
| Median encounters per word (distinct moments) | 25 (min 6, max 113) |
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
- **Long gaps** (more than 15 min between two meetings): 41: arbol 99.5m, comoestas 64.2m, pata 58.6m, platano 42.0m, hueso 40.7m, caballo 38.3m, guau 37.3m, miau 37.3m, cama 34.8m, adios 34.6m, rosa 34.1m, porfavor 33.5m, panaderia 33.2m, gallina 32.8m, flor 32.5m, cuac 29.5m, sientate 28.3m, bien 28.3m, gato 25.4m, queso 23.3m, blanco 21.9m, cabra 21.9m, parque 21.8m, dos 21.6m, banco 21.5m, … (+16).
- **Not recalled after the errand that introduced it**: 0: none.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 0: none.
- **Faded out** (not met in the last 30 minutes of play): 0: none.
- **Never learned**: 0: none. **Never met**: 0.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ¡Un perro! (`c1`) | 0:03-1:56 (1.9m) | 1: hola | 0 | 0 (0) | 1 | 0 | 0 |
| Canelo becomes yours | 0:18-1:23 | 3: perro, guau, ven | 1 | 1 (1) | 5 | 0 | 1 |
| hearts | 1:36-156:30 | 2: bien, comoestas | 2 | 4 (2) | 38 | 1 | 3 |
| El gato de la cerca (`c2`) | 5:11-7:02 (1.8m) | 0 | 2 | 4 (2) | 3 | 0 | 0 |
| exploring (tap-anything) | 5:30-140:55 | 0 | 0 | 0 (0) | 0 | 0 | 0 |
| other | 5:32-163:35 | 23: gato, miau, rojo, parque, granja, cabra, escuela, gallina, huevo, uno, dos, blanco, panaderia, biblioteca, arbol, conejo, rana, croac, verde, pajaro, pez, siete, ocho | 49 | 4 (4) | 302 | 0 | 21 |
| ¡Buenos días, Canelo! (`c3`) | 7:42-9:25 (1.7m) | 1: buenosdias | 1 | 2 (0) | 1 | 0 | 0 |
| teaching Canelo | 7:51-107:10 | 3: hueso, sientate, busca | 4 | 6 (1) | 16 | 0 | 1 |
| greetings | 12:59-163:23 | 0 | 25 | 9 (6) | 162 | 0 | 20 |
| El juego de Don Pepe (`c4`) | 13:06-14:41 (1.6m) | 3: si, no, manzana | 4 | 7 (3) | 11 | 0 | 1 |
| finding a page | 15:32-140:36 | 0 | 12 | 11 (11) | 36 | 0 | 0 |
| La pelota roja (`c5`) | 16:05-17:34 (1.5m) | 1: pelota | 2 | 8 (3) | 7 | 0 | 0 |
| Pan para los patos (`c6`) | 21:49-24:58 (3.1m) | 2: pan, gracias | 0 | 4 (0) | 3 | 0 | 0 |
| shops & presents | 22:54-160:26 | 20: pato, cuac, banco, fuente, carta, casa, caballo, platano, naranja, porfavor, tres, cuatro, queso, leche, galleta, azul, feliz, rosa, amarillo, mariposa | 12 | 15 (9) | 118 | 1 | 10 |
| side jobs | 25:24-160:49 | 0 | 1 | 7 (1) | 3 | 0 | 0 |
| ¿Dónde está Canelo? (`c7`) | 26:42-31:46 (5.1m) | 0 | 1 | 4 (1) | 4 | 0 | 0 |
| La escuela de Luna (`c8`) | 37:03-41:03 (4.0m) | 0 | 0 | 3 (1) | 1 | 0 | 0 |
| ¡Buenas noches, Canelo! (`c9`) | 44:26-45:43 (1.3m) | 3: agua, buenasnoches, cama | 2 | 9 (1) | 6 | 0 | 1 |
| Tomás está cansado (`c10`) | 49:54-56:57 (7.0m) | 2: cansado, adios | 0 | 9 (3) | 6 | 0 | 1 |
| Los huevos de Rosa (`c11`) | 59:40-62:16 (2.6m) | 0 | 0 | 4 (2) | 2 | 0 | 0 |
| El mercado de Mamá (`c12`) | 68:28-72:59 (4.5m) | 0 | 2 | 13 (5) | 8 | 0 | 1 |
| El día de campo (`c13`) | 74:25-82:16 (7.9m) | 2: cinco, seis | 1 | 18 (10) | 15 | 0 | 2 |
| El show de perros (`c14`) | 85:29-92:55 (7.4m) | 2: pata, salta | 2 | 12 (6) | 10 | 0 | 3 |
| Las flores de Lucía (`c15`) | 95:47-99:54 (4.1m) | 2: triste, flor | 2 | 15 (5) | 7 | 0 | 0 |
| Las páginas perdidas (`c16`) | 102:52-109:39 (6.8m) | 0 | 0 | 4 (0) | 2 | 0 | 1 |
| ¿Qué dicen? (`c17`) | 112:43-120:21 (7.6m) | 1: gira | 3 | 18 (6) | 11 | 0 | 2 |
| ¿Cuántos animales? (`c18`) | 127:05-131:50 (4.7m) | 0 | 2 | 14 (5) | 8 | 0 | 0 |
| ¡Todos a la granja! (`c19`) | 137:38-144:19 (6.7m) | 2: nueve, diez | 0 | 29 (18) | 22 | 0 | 4 |
| Preparamos la fiesta (`c20`) | 146:04-157:16 (11.2m) | 0 | 0 | 13 (7) | 7 | 0 | 1 |
| La fiesta de los animales (`c21`) | 163:23-167:34 (4.2m) | 0 | 0 | 54 (30) | 31 | 0 | 1 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-7:25 | 6 | 5 | 10 | 7 | 3 | 20 (20%) | 0 | c1, c2 |
| 2 | 2026-10-10 | 7:25-15:24 | 6 | 6 | 16 | 4 | 3 | 26 (19%) | 2 | c3, c4 |
| 3 | 2026-10-11 | 15:24-25:40 | 6 | 6 | 19 | 11 | 1 | 34 (44%) | 7 | c5, c6 |
| 4 | 2026-10-12 | 25:40-34:16 | 5 | 4 | 40 | 5 | 1 | 46 (74%) | 16 | c7 |
| 5 | 2026-10-13 | 34:16-45:21 | 6 | 2 | 32 | 14 | 6 | 48 (65%) | 18 | c8 |
| 6 | 2026-10-13 | 45:21-47:59 | 0 | 5 | 11 | 1 | 0 | 12 (100%) | 10 | c9 |
| 7 | 2026-10-14 | 47:59-58:10 | 5 | 5 | 31 | 17 | 3 | 51 (71%) | 22 | c10 |
| 8 | 2026-10-15 | 58:10-65:38 | 5 | 5 | 28 | 10 | 2 | 38 (63%) | 16 | c11 |
| 9 | 2026-10-16 | 65:38-73:32 | 5 | 4 | 31 | 13 | 4 | 47 (64%) | 20 | c12 |
| 10 | 2026-10-17 | 73:32-84:07 | 5 | 6 | 44 | 14 | 7 | 61 (77%) | 27 | c13 |
| 11 | 2026-10-18 | 84:07-94:29 | 5 | 4 | 42 | 16 | 7 | 62 (71%) | 27 | c14 |
| 12 | 2026-10-19 | 94:29-102:28 | 5 | 7 | 33 | 12 | 2 | 46 (70%) | 23 | c15 |
| 13 | 2026-10-20 | 102:28-112:18 | 4 | 3 | 43 | 14 | 5 | 55 (78%) | 31 | c16 |
| 14 | 2026-10-21 | 112:18-122:15 | 5 | 5 | 46 | 16 | 6 | 67 (76%) | 34 | c17 |
| 15 | 2026-10-22 | 122:15-133:21 | 3 | 4 | 50 | 17 | 5 | 69 (87%) | 40 | c18 |
| 16 | 2026-10-23 | 133:21-148:30 | 2 | 1 | 61 | 25 | 6 | 87 (94%) | 49 | c19 |
| 17 | 2026-10-24 | 148:30-157:57 | 0 | 1 | 51 | 13 | 9 | 64 (100%) | 40 | c20 |
| 18 | 2026-10-25 | 157:57-167:38 | 0 | 0 | 48 | 17 | 4 | 65 (100%) | 48 | c21 |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | #### 4 | 2 | 7 | 4 / 2 | hola, ven, perro, guau | c1, Canelo becomes yours, hearts |
| 5:00 | ##### 5 | 5 | 15 | 9 / 7 | buenosdias, hueso, sientate, gato, miau | c2, exploring (tap-anything), c3, teaching Canelo, hearts |
| 10:00 | ### 3 | 3 | 12 | 12 / 10 | si, no, manzana | greetings, c4 |
| 15:00 | ## 2 | 3 | 16 | 14 / 13 | pelota, rojo | hearts, finding a page, greetings, c5 |
| 20:00 | #### 4 | 4 | 13 | 18 / 17 | gracias, cuac, pan, pato | greetings, c6, exploring (tap-anything), shops & presents |
| 25:00 | #### 4 | 1 | 25 | 22 / 18 | parque, granja, banco, fuente | exploring (tap-anything), side jobs, finding a page, greetings, hearts, shops & presents |
| 30:00 | # 1 | 3 | 23 | 23 / 21 | cabra | c7, greetings, shops & presents, exploring (tap-anything), side jobs |
| 35:00 | ### 3 | 2 | 30 | 26 / 23 | comoestas, escuela, bien | greetings, shops & presents, c8, hearts |
| 40:00 | ### 3 | 0 | 10 | 29 / 23 | buenasnoches, cama, agua | greetings, hearts, c8, shops & presents, exploring (tap-anything), side jobs, c9 |
| 45:00 | . 0 | 6 | 28 | 29 / 29 |  | c9, exploring (tap-anything), shops & presents, greetings, c10 |
| 50:00 | ### 3 | 2 | 23 | 32 / 31 | carta, casa, cansado | c10, shops & presents, greetings, hearts |
| 55:00 | ## 2 | 3 | 22 | 34 / 34 | adios, caballo | shops & presents, c10, greetings, c11 |
| 60:00 | ##### 5 | 4 | 23 | 39 / 38 | huevo, blanco, gallina, uno, dos | c11, shops & presents, side jobs, greetings, hearts |
| 65:00 | ### 3 | 1 | 24 | 42 / 39 | porfavor, platano, naranja | shops & presents, greetings, side jobs, c12 |
| 70:00 | ## 2 | 3 | 27 | 44 / 42 | tres, cuatro | shops & presents, greetings, c12, c13 |
| 75:00 | ### 3 | 3 | 29 | 47 / 45 | queso, leche, panaderia | shops & presents, finding a page, greetings, side jobs, exploring (tap-anything) |
| 80:00 | ## 2 | 3 | 29 | 49 / 48 | cinco, seis | shops & presents, c13, greetings |
| 85:00 | ### 3 | 3 | 23 | 52 / 51 | pata, salta, galleta | greetings, c14, exploring (tap-anything), shops & presents, side jobs |
| 90:00 | ## 2 | 1 | 29 | 54 / 52 | azul, feliz | shops & presents, greetings, c14 |
| 95:00 | ##### 5 | 5 | 27 | 59 / 57 | mariposa, rosa, amarillo, flor, triste | shops & presents, greetings, c15, side jobs |
| 100:00 | # 1 | 2 | 26 | 60 / 59 | biblioteca | exploring (tap-anything), greetings, c16, shops & presents, side jobs |
| 105:00 | ### 3 | 3 | 33 | 63 / 62 | busca, conejo, arbol | finding a page, teaching Canelo, greetings, hearts, exploring (tap-anything), c16 |
| 110:00 | #### 4 | 2 | 27 | 67 / 64 | rana, pajaro, croac, verde | finding a page, greetings, c17 |
| 115:00 | # 1 | 2 | 32 | 68 / 66 | gira | shops & presents, finding a page, greetings, side jobs, exploring (tap-anything), c17 |
| 120:00 | . 0 | 2 | 26 | 68 / 68 |  | c17, greetings, hearts, exploring (tap-anything), shops & presents |
| 125:00 | # 1 | 1 | 33 | 69 / 69 | pez | greetings, side jobs, c18, exploring (tap-anything) |
| 130:00 | ## 2 | 2 | 34 | 71 / 71 | siete, ocho | exploring (tap-anything), c18, greetings, finding a page, shops & presents |
| 135:00 | . 0 | 0 | 23 | 71 / 71 |  | greetings, shops & presents, side jobs, c19 |
| 140:00 | ## 2 | 0 | 32 | 73 / 71 | nueve, diez | finding a page, exploring (tap-anything), c19, greetings, hearts |
| 145:00 | . 0 | 2 | 29 | 73 / 73 |  | greetings, c20, shops & presents |
| 150:00 | . 0 | 0 | 38 | 73 / 73 |  | greetings, shops & presents, side jobs |
| 155:00 | . 0 | 0 | 27 | 73 / 73 |  | greetings, hearts, c20, shops & presents |
| 160:00 | . 0 | 0 | 29 | 73 / 73 |  | shops & presents, greetings, side jobs, c21 |
| 165:00 | . 0 | 0 | 22 | 73 / 73 |  | c21 |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:11 | show | c1 | 0:24 | 113 | 174 | 83 (22, 0) | 2 | 1.5m / 6.6m | 163:18 | 9 | 17 | 5:40 (answer) | yes |
| perro *el perro* | 0:18 | find | canelo-dog | 0:21 | 48 | 107 | 15 (2, 0) | 2 | 3.5m / 17.5m | 166:23 | 7 | 15 | 6:55 (answer) | yes |
| guau *guau* | 0:29 | show | canelo-dog | 1:12 | 34 | 68 | 8 (1, 0) | 2 | 5.0m / 37.3m | 166:32 | 4 | 13 | 1:40 (answer) | yes |
| ven *ven* | 1:00 | watch | canelo-dog | 0:56 | 45 | 74 | 21 (8, 0) | 2 | 3.7m / 17.9m | 167:28 | 11 | 14 | 1:17 (answer) | yes |
| gato *el gato* | 5:57 | show | other | 0:48 | 42 | 86 | 10 (3, 0) | 0 | 3.9m / 25.4m | 166:10 | 6 | 13 | 6:45 (answer) | yes |
| miau *miau* | 6:03 | show | other | 1:11 | 24 | 45 | 7 (3, 0) | 1 | 7.0m / 37.3m | 166:32 | 3 | 12 | 48:25 (answer) | yes |
| buenosdias *buenos días* | 7:47 | show | c3 | 1:11 | 96 | 116 | 28 (7, 0) | 3 | 1.7m / 10.5m | 167:18 | 4 | 17 | 9:21 (answer) | yes |
| hueso *el hueso* | 8:02 | show | tricks | 0:23 | 37 | 72 | 12 (1, 0) | 2 | 4.4m / 40.7m | 165:52 | 9 | 14 | 14:33 (answer) | yes |
| sientate *siéntate* | 8:15 | watch | tricks | 0:28 | 28 | 58 | 17 (3, 0) | 1 | 5.8m / 28.3m | 165:43 | 4 | 13 | 8:43 (answer) | yes |
| si *sí* | 13:12 | show | c4 | 0:23 | 71 | 109 | 25 (7, 0) | 1 | 2.2m / 8.9m | 161:15 | 9 | 18 | 13:35 (answer) | yes |
| no *no* | 13:18 | show | c4 | 0:24 | 56 | 94 | 12 (1, 0) | 1 | 2.7m / 11.2m | 160:45 | 11 | 17 | 13:42 (answer) | yes |
| manzana *la manzana* | 14:03 | show | c4 | 1:08 | 31 | 81 | 11 (3, 0) | 0 | 5.0m / 20.1m | 164:33 | 5 | 15 | 15:10 (answer) | yes |
| pelota *la pelota* | 16:17 | show | c5 | 1:10 | 54 | 94 | 11 (3, 0) | 3 | 2.7m / 11.0m | 162:04 | 8 | 16 | 17:27 (answer) | yes |
| rojo *rojo / roja* | 17:05 | find | other | 1:10 | 30 | 58 | 13 (4, 0) | 0 | 5.1m / 17.8m | 164:19 | 2 | 15 | 18:15 (answer) | yes |
| pan *el pan* | 21:54 | show | c6 | 1:32 | 72 | 131 | 12 (4, 0) | 4 | 2.0m / 8.4m | 165:52 | 6 | 16 | 23:26 (answer) | yes |
| gracias *gracias* | 22:01 | overheard | c6 | 1:41 | 68 | 134 | 14 (1, 0) | 3 | 2.2m / 10.1m | 162:53 | 11 | 17 | 23:42 (answer) | yes |
| pato *el pato* | 23:01 | show | shop | 1:05 | 38 | 84 | 9 (3, 0) | 2 | 3.8m / 17.0m | 166:47 | 5 | 13 | 24:06 (answer) | yes |
| cuac *cuac* | 23:09 | show | shop | 1:11 | 26 | 57 | 8 (3, 0) | 0 | 5.3m / 29.5m | 154:29 | 1 | 9 | 24:20 (answer) | yes |
| parque *el parque* | 27:21 | find | other | 1:53 | 37 | 60 | 9 (2, 0) | 1 | 3.9m / 21.8m | 146:44 | 6 | 13 | 29:14 (answer) | yes |
| banco *el banco* | 27:59 | find | shop | 2:22 | 32 | 43 | 10 (3, 0) | 2 | 4.4m / 21.5m | 165:35 | 4 | 11 | 30:21 (answer) | yes |
| fuente *la fuente* | 28:44 | find | shop | 2:19 | 43 | 71 | 9 (2, 0) | 0 | 3.3m / 14.6m | 165:35 | 6 | 15 | 31:04 (answer) | yes |
| granja *la granja* | 29:43 | find | other | 1:52 | 44 | 66 | 6 (2, 0) | 5 | 3.1m / 15.1m | 163:30 | 7 | 15 | 31:35 (answer) | yes |
| cabra *la cabra* | 30:06 | show | other | 0:30 | 28 | 57 | 12 (4, 0) | 0 | 5.0m / 21.9m | 166:11 | 2 | 13 | 47:17 (answer) | yes |
| escuela *la escuela* | 37:29 | find | other | 1:06 | 47 | 58 | 6 (2, 0) | 2 | 2.8m / 13.0m | 164:09 | 5 | 13 | 38:35 (answer) | yes |
| bien *bien* | 37:57 | overheard | hearts | 1:18 | 26 | 69 | 13 (5, 0) | 4 | 5.0m / 28.3m | 163:23 | 4 | 12 | 39:14 (answer) | yes |
| comoestas *¿cómo estás?* | 38:05 | overheard | hearts | 1:01 | 18 | 32 | 13 (1, 0) | 0 | 7.6m / 64.2m | 167:01 | 5 | 9 | 46:32 (answer) | yes |
| agua *el agua* | 44:34 | show | c9 | 1:05 | 33 | 72 | 22 (6, 0) | 0 | 3.8m / 11.4m | 167:28 | 6 | 14 | 45:38 (answer) | yes |
| buenasnoches *buenas noches* | 44:52 | show | c9 | 1:40 | 81 | 94 | 8 (0, 0) | 8 | 1.5m / 5.8m | 167:22 | 3 | 14 | 46:32 (answer) | yes |
| cama *la cama* | 44:58 | find | c9 | 0:28 | 12 | 24 | 9 (0, 0) | 1 | 11.1m / 34.8m | 167:33 | 3 | 9 | 45:25 (answer) | yes |
| cansado *cansado / cansada* | 50:05 | show | c10 | 1:09 | 30 | 54 | 12 (6, 0) | 2 | 4.0m / 10.8m | 167:28 | 7 | 12 | 55:10 (answer) | yes |
| carta *la carta* | 51:34 | show | shop | 1:13 | 25 | 66 | 9 (1, 0) | 0 | 5.4m / 19.2m | 163:35 | 2 | 10 | 53:08 (answer) | yes |
| casa *la casa* | 52:57 | find | shop | 1:06 | 40 | 59 | 8 (2, 0) | 0 | 4.2m / 18.5m | 164:09 | 6 | 17 | 54:03 (answer) | yes |
| caballo *el caballo* | 55:45 | show | shop | 1:23 | 16 | 42 | 10 (3, 0) | 1 | 7.3m / 38.3m | 164:25 | 2 | 9 | 57:07 (answer) | yes |
| adios *adiós* | 56:49 | watch | c10 | 1:10 | 19 | 50 | 10 (3, 0) | 0 | 8.1m / 34.6m | 167:18 | 9 | 12 | 58:55 (answer) | yes |
| gallina *la gallina* | 60:03 | show | other | 1:49 | 27 | 52 | 10 (4, 0) | 0 | 4.1m / 32.8m | 166:16 | 3 | 9 | 61:52 (answer) | yes |
| huevo *el huevo* | 60:11 | show | other | 1:00 | 42 | 125 | 19 (3, 0) | 1 | 2.5m / 14.9m | 160:49 | 2 | 11 | 61:11 (answer) | yes |
| uno *uno* | 60:28 | find | other | 0:29 | 26 | 58 | 12 (2, 0) | 1 | 4.1m / 12.4m | 162:49 | 3 | 11 | 61:31 (answer) | yes |
| dos *dos* | 60:34 | find | other | 2:02 | 23 | 62 | 11 (1, 0) | 2 | 3.9m / 21.6m | 145:43 | 3 | 8 | 60:45 (answer) | yes |
| blanco *blanco / blanca* | 61:18 | find | other | 2:16 | 21 | 43 | 9 (3, 0) | 0 | 5.2m / 21.9m | 164:20 | 2 | 10 | 67:33 (answer) | yes |
| platano *el plátano* | 69:33 | show | shop | 1:45 | 7 | 38 | 8 (4, 1) | 0 | 15.9m / 42.0m | 164:46 | 2 | 5 | 72:31 (answer) | yes |
| naranja *la naranja* | 69:38 | show | shop | 0:28 | 11 | 36 | 7 (2, 0) | 0 | 9.5m / 21.2m | 164:41 | 2 | 8 | 72:42 (answer) | yes |
| porfavor *por favor* | 69:55 | overheard | shop | 2:13 | 17 | 37 | 11 (0, 0) | 0 | 7.8m / 33.5m | 160:09 | 2 | 10 | 75:11 (answer) | yes |
| tres *tres* | 70:01 | show | shop | 0:25 | 23 | 58 | 17 (4, 0) | 1 | 4.2m / 12.2m | 162:53 | 3 | 9 | 70:39 (answer) | yes |
| cuatro *cuatro* | 70:20 | show | shop | 2:58 | 23 | 49 | 12 (5, 0) | 1 | 3.8m / 12.9m | 153:31 | 4 | 9 | 75:39 (answer) | yes |
| panaderia *la panadería* | 76:44 | find | other | 0:25 | 27 | 33 | 6 (3, 0) | 0 | 5.5m / 33.2m | 164:09 | 5 | 10 | 83:45 (answer) | yes |
| queso *el queso* | 78:18 | show | shop | 1:08 | 17 | 39 | 9 (1, 0) | 1 | 5.6m / 23.3m | 164:52 | 3 | 8 | 79:26 (answer) | yes |
| leche *la leche* | 79:53 | show | shop | 1:30 | 27 | 50 | 9 (3, 0) | 0 | 3.5m / 10.9m | 164:47 | 2 | 9 | 89:22 (answer) | yes |
| cinco *cinco* | 80:49 | show | c13 | 0:57 | 20 | 41 | 12 (1, 0) | 0 | 4.3m / 11.9m | 162:49 | 4 | 9 | 81:46 (answer) | yes |
| seis *seis* | 81:36 | show | c13 | 1:08 | 20 | 43 | 11 (4, 0) | 2 | 4.1m / 13.8m | 159:47 | 5 | 9 | 82:44 (answer) | yes |
| pata *dame la pata* | 86:09 | watch | c14 | 1:11 | 13 | 33 | 10 (3, 0) | 0 | 11.5m / 58.6m | 165:24 | 3 | 8 | 86:23 (answer) | yes |
| salta *salta* | 86:37 | watch | c14 | 1:40 | 12 | 29 | 9 (3, 0) | 0 | 7.1m / 18.4m | 165:14 | 4 | 8 | 86:55 (answer) | yes |
| galleta *la galleta* | 89:34 | show | shop | 0:52 | 15 | 33 | 9 (2, 0) | 1 | 5.6m / 19.9m | 165:57 | 3 | 8 | 90:53 (answer) | yes |
| azul *azul* | 91:04 | show | shop | 0:26 | 18 | 34 | 7 (1, 0) | 2 | 4.3m / 19.4m | 164:15 | 2 | 8 | 95:38 (answer) | yes |
| feliz *feliz* | 91:36 | show | shop | 1:39 | 21 | 45 | 13 (3, 0) | 0 | 3.8m / 11.4m | 167:23 | 5 | 8 | 99:36 (answer) | yes |
| triste *triste* | 96:05 | show | c15 | 1:11 | 15 | 26 | 6 (1, 0) | 1 | 5.1m / 14.2m | 167:23 | 4 | 7 | 99:45 (answer) | yes |
| flor *la flor* | 96:16 | show | c15 | 1:50 | 26 | 57 | 10 (3, 0) | 0 | 5.3m / 32.5m | 154:56 | 2 | 12 | 98:05 (answer) | yes |
| rosa *rosado / rosada* | 96:54 | find | shop | 2:13 | 21 | 32 | 10 (1, 0) | 0 | 7.5m / 34.1m | 164:20 | 5 | 11 | 99:06 (answer) | yes |
| amarillo *amarillo / amarilla* | 98:35 | find | shop | 1:37 | 15 | 28 | 9 (3, 0) | 1 | 4.7m / 19.5m | 164:24 | 2 | 7 | 100:12 (answer) | yes |
| mariposa *la mariposa* | 98:44 | show | shop | 2:31 | 14 | 28 | 10 (2, 0) | 1 | 5.2m / 20.3m | 166:47 | 2 | 6 | 101:15 (answer) | yes |
| biblioteca *la biblioteca* | 104:17 | find | other | 1:09 | 26 | 39 | 12 (0, 0) | 0 | 2.4m / 9.1m | 164:15 | 3 | 6 | 108:20 (answer) | yes |
| busca *busca* | 106:01 | watch | tricks | 1:02 | 11 | 26 | 9 (3, 0) | 0 | 5.9m / 11.2m | 165:31 | 3 | 6 | 107:03 (answer) | yes |
| arbol *el árbol* | 107:14 | find | other | 1:55 | 17 | 28 | 10 (4, 0) | 0 | 10.0m / 99.5m | 165:42 | 2 | 6 | 109:09 (answer) | yes |
| conejo *el conejo* | 107:23 | show | other | 1:20 | 26 | 46 | 10 (1, 1) | 2 | 2.4m / 9.1m | 166:53 | 3 | 6 | 113:05 (answer) | yes |
| rana *la rana* | 113:43 | show | other | 1:09 | 18 | 53 | 9 (1, 0) | 0 | 3.1m / 14.0m | 166:47 | 3 | 5 | 114:52 (answer) | yes |
| croac *croac* | 113:49 | show | other | 1:51 | 11 | 24 | 9 (4, 0) | 0 | 5.4m / 12.1m | 166:37 | 2 | 5 | 115:40 (answer) | yes |
| verde *verde* | 113:55 | show | other | 0:42 | 10 | 20 | 6 (1, 0) | 0 | 5.6m / 17.8m | 164:15 | 2 | 5 | 123:12 (answer) | yes |
| pajaro *el pájaro* | 114:15 | show | other | 2:37 | 17 | 36 | 8 (2, 0) | 1 | 5.4m / 20.7m | 166:43 | 2 | 7 | 118:49 (answer) | yes |
| gira *gira* | 119:43 | watch | c17 | 1:31 | 8 | 24 | 9 (4, 0) | 1 | 6.5m / 10.9m | 165:43 | 3 | 5 | 120:01 (answer) | yes |
| pez *el pez* | 127:43 | show | other | 1:13 | 13 | 27 | 6 (2, 0) | 0 | 3.2m / 11.1m | 166:43 | 2 | 4 | 128:56 (answer) | yes |
| siete *siete* | 130:14 | show | other | 1:23 | 7 | 23 | 5 (2, 0) | 0 | 3.7m / 8.8m | 152:24 | 2 | 3 | 131:37 (answer) | yes |
| ocho *ocho* | 130:47 | show | other | 0:42 | 9 | 27 | 6 (1, 0) | 0 | 4.5m / 14.8m | 166:53 | 3 | 4 | 131:45 (answer) | yes |
| nueve *nueve* | 142:47 | show | c19 | 0:23 | 6 | 17 | 4 (1, 0) | 0 | 4.8m / 7.5m | 166:53 | 2 | 3 | 147:32 (answer) | yes |
| diez *diez* | 143:02 | show | c19 | 0:35 | 7 | 16 | 5 (1, 0) | 0 | 4.0m / 7.8m | 167:01 | 2 | 3 | 149:37 (answer) | yes |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event with the game time, map, speaker and episode: *meet* (the word model: met, and how), *prompt* (a question whose answer it is: intro / new / review, its stage, the cards shown, cued), *retrieval* (an active use credited to the model: said, cued, card mode, first try, stage before and after), *stage*, *shown* (a dialogue line, a prompt, a picture, the bag, a banner), *heard* (the voice), *tapped-object*, *choice-shown* (ans: it was the answer), *recognized*, *wrong*, *picked*, *said*, *learned*, and *session* (a new session or day).
- A word is *new* when it is met (stage 1); being shown or heard before that does not count (an unmet word appears as its picture only). *Active uses* are the model's retrievals of a met word; the answer that met it is its puzzle, not a use. *First use*: the first retrieval at least 20 s after meeting. *Cued*: the answer could be found by matching the prompt (its picture over the question and on its card, or its word written in both). *Review prompts*: questions about a word met in an earlier session or 5+ minutes earlier (or asked by `G.review`, or a page puzzle).
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, Canelo's tricks, a side job, the bag) says which errand it belonged to. *Errands/episodes a word is in*: the contexts it came up in after it was met.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line, ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a gold card, 2 s for errand and badge cards, 5 s to look at the notebook, 12 s for a page puzzle, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around.
- Sessions: about 15 minutes each (the session ends at the next free moment on the map), each on the next calendar day (G.debug.dayShift): once-a-day greetings, side jobs and say-it-back stars come back each day, and the word model's day-based reviews fall due. Bursts: 5+ meetings within 30 s. Overload: more than 8 meetings within 5 minutes.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (`--quick` runs the game 3x faster, `--strict` exits 1 when a target fails, `--days 5 --session 15`; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
