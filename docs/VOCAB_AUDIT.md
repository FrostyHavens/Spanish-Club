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
One full tap playthrough (tools/playflow.js), 2026-10-09, over 5 play sessions on successive days (about 15 minutes each; the game saved, closed and continued the next day): every Round A and Round B errand, the animal party and the diploma, then free play (greeting everyone, Canelo, page puzzles) on the days left. Speaking: 35% of mic questions answered by voice (42 answers + 4 gold cards); 12% of picture-card questions got one wrong tap first (18); page puzzles solved when their sparkle was on screen within 8 tiles: 9 (campo, colores, sonidos, animales); seed 7. Game time 49:41 (49.7 min) with a child's pace added for reading, listening, thinking and looking; 0 evening(s) at home.

## Measured targets
From `docs/LEARNING_DESIGN.md`. *Before*: the game before the redesign (one long run).

| Measure | Before | Target | Now | |
| --- | --- | --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 | 13 | **FAIL** |
| New words in the first 15-minute session | 65 | ≤ 8 | 31 | **FAIL** |
| Words first met on a notebook page | 43 | 0 | 0 | PASS |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) | 9:33 (20% ≤ 3:00) | **FAIL** |
| Words never actively retrieved | 30 | 0 | 17: adios, comoestas, porfavor, platano, casa, panaderia, biblioteca, carta, diez, blanco, rosa, banco, … (+5) | **FAIL** |
| Words retrieved only with a cue | 2 | 0 | 0 | PASS |
| Median active retrievals per word | 1 | ≥ 5 | 2 | **FAIL** |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% | 71% | **FAIL** |
| Prompts that review older words | low | 40–60% | 65% (207 prompts) | **FAIL** |
| Words introduced as a wrong answer first | 18 | 0 | 24: gracias, no, cuatro, cinco, manzana, uvas, pan, pelota, biblioteca, carta, leche, agua, … (+12) | **FAIL** |

Words by stage at the end: unmet 27, met 17, known 6, remembered 9, solid 19.

## Headline numbers
| | |
| --- | --- |
| Words in the game | 78 |
| Met / remembered (gold) by the end | 51 / 28 (never met: 27, of them shown somewhere: 22) |
| Met via | answer 47, co 3, tap 1 |
| Active retrievals of met words (picked right + said) | 160 (130 picked, 30 said); 0% cued (the answer could be matched in the prompt's text or picture) |
| Median time from meeting to first use (of the words used) | 6:09 |
| Median encounters per word (distinct moments) | 8 (min 1, max 58) |
| Median active retrievals per word | 2 |
| Most new words in any 5 minutes | 13 |

![Words met and learned over game time](vocab-timeline.svg)

## Problems (measured)
- **Bursts** (5+ new words within 30 s): 1. 4:27 5 words via answer in El mercado (`mercado`) (1 used within 5 min).
- **Notebook pages as the first meeting**: 0 words; 0 of them not used within 5 minutes: none.
- **Overload moments** (more than 8 new words in 5 minutes): 3. 0:12: 13 (hola, buenosdias, adios, si, no, bien, comoestas, gracias, manzana, tres, platano, dos, … (+1)); 6:17: 12 (rojo, pelota, azul, sientate, perro, agua, banco, ven, cabra, pan, panaderia, carta); 24:19: 10 (gato, gira, amarillo, triste, rosa, blanco, mariposa, cuac, croac, bee).
- **Never actively retrieved** (never picked right or said): 17: adios, comoestas, porfavor, platano, casa, panaderia, biblioteca, carta, diez, blanco, rosa, banco, granja, gallina, cabra, triste, cansado.
- **Only cued retrievals** (every pick had the answer in the prompt's text or picture, never said): 0: none.
- **Met once and never again** (one moment only): 1: diez. Three moments or fewer: 3.
- **Long gaps** (more than 15 min between two meetings): 12: gallina 25.6m, manzana 24.1m, queso 21.5m, uno 19.1m, dos 19.1m, amarillo 18.6m, rojo 18.3m, azul 18.3m, verde 18.3m, comoestas 17.3m, bien 17.3m, mariposa 15.3m.
- **Not recalled after the errand that introduced it**: 20: adios, comoestas, porfavor, platano, casa, panaderia, biblioteca, carta, diez, leche, queso, blanco, rosa, banco, granja, gallina, cabra, gira, triste, cansado.
- **Learned without its own puzzle** (learned by answering another word, or by no question at all): 0: none.
- **Learned, then never met again**: 4: uno, pan, verde, gira.
- **Faded out** (not met in the last 30 minutes of play): 4: platano, panaderia, carta, banco.
- **Never learned**: 23: adios, comoestas, porfavor, dos, tres, platano, casa, panaderia, biblioteca, carta, diez, blanco, rosa, banco, granja, gallina, cabra, miau, cuac, croac, bee, triste, cansado. **Never met**: 27: cuatro, cinco, naranja, uvas, escuela, parque, seis, siete, ocho, nueve, galleta, negro, cafe, arbol, flor, fuente, puerta, ventana, pez, conejo, pato, rana, caballo, guau, pio, hueso, cama.

## Per errand (and other contexts)
Each moment (an "episode": from a tap until the child can walk again) is given to the errand whose progress it changed; greetings, side jobs, pages, Canelo's training and tap-anything are their own rows. *New*: words met for the first time there. *Reviewed*: words met before it started that came back in it (how many of them were actively used there).

| Context | Ran (start-done) | New words | Learned there | Reviewed (used) | Active uses | Cued | Wrong |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mamá's intro | 0:02-0:29 | 3: hola, buenosdias, adios | 0 | 0 (0) | 0 | 0 | 1 |
| other | 0:29-49:33 | 0 | 8 | 2 (0) | 20 | 0 | 0 |
| Saludos (`saludos`) | 1:30-2:43 (1.2m) | 3: bien, comoestas, gracias | 0 | 4 (2) | 3 | 0 | 0 |
| greetings | 2:59-49:33 | 0 | 3 | 7 (3) | 39 | 0 | 3 |
| La carta (`carta`) | 3:07-10:58 (7.9m) | 3: pan, panaderia, carta | 1 | 4 (1) | 1 | 0 | 0 |
| La pelota roja (`pelota`) | 3:26-6:32 (3.1m) | 3: rojo, pelota, azul | 1 | 3 (2) | 4 | 0 | 1 |
| exploring (tap-anything) | 3:32-47:10 | 1: pajaro | 0 | 0 (0) | 0 | 0 | 0 |
| El mercado (`mercado`) | 3:59-5:08 (1.2m) | 7: si, no, manzana, tres, platano, dos, porfavor | 0 | 3 (1) | 2 | 0 | 0 |
| Canelo becomes yours | 7:03-7:22 | 1: sientate | 0 | 1 (0) | 0 | 0 | 0 |
| ¿Dónde está Canelo? (`canelo`) | 7:27-11:48 (4.4m) | 5: perro, banco, ven, cabra, feliz | 1 | 5 (1) | 4 | 0 | 2 |
| shops & presents | 8:22-47:57 | 1: agua | 2 | 7 (1) | 6 | 0 | 0 |
| El día de campo (`picnic`) | 12:27-20:22 (7.9m) | 4: huevo, queso, uno, leche | 4 | 13 (4) | 9 | 0 | 2 |
| Tomás está cansado (`cansado`) | 13:30-18:04 (4.6m) | 4: cansado, casa, granja, biblioteca | 1 | 10 (3) | 3 | 0 | 1 |
| El show de perros (`show`) | 13:49-25:26 (11.6m) | 2: gato, amarillo | 3 | 11 (4) | 8 | 0 | 1 |
| teaching Canelo | 13:56-43:14 | 3: pata, salta, gira | 4 | 4 (2) | 9 | 0 | 0 |
| hearts | 16:22-46:01 | 0 | 0 | 3 (0) | 0 | 0 | 0 |
| finding a page | 18:24-42:45 | 0 | 4 | 8 (8) | 16 | 0 | 0 |
| side jobs | 21:13-30:54 | 0 | 0 | 4 (0) | 0 | 0 | 0 |
| ¿Qué dicen? (`sonidos`) | 25:59-29:53 (3.9m) | 4: cuac, croac, bee, miau | 0 | 6 (2) | 2 | 0 | 1 |
| Las flores de Lucía (`flores`) | 26:33-27:52 (1.3m) | 4: triste, rosa, blanco, mariposa | 3 | 12 (3) | 5 | 0 | 1 |
| ¿Cuántos animales? (`cuenta`) | 31:57-40:52 (8.9m) | 1: diez | 1 | 6 (4) | 8 | 0 | 3 |
| La fiesta de los animales (`fiestab`) | 32:11-39:32 (7.4m) | 2: verde, gallina | 4 | 21 (12) | 21 | 0 | 2 |

## Per session (one a day)
| Session | Date | Game time | New words met | Remembered | Picked right | Said | Wrong | Prompts (review) | Older words used | Errands finished |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-9 | 0:00-15:03 | 31 | 7 | 24 | 12 | 6 | 57 (21%) | 0 | saludos, mercado, pelota, carta, canelo |
| 2 | 2026-10-10 | 15:03-30:10 | 16 | 13 | 38 | 14 | 4 | 64 (63%) | 17 | cansado, picnic, show, flores, sonidos |
| 3 | 2026-10-11 | 30:10-43:24 | 4 | 5 | 42 | 12 | 8 | 56 (95%) | 26 | fiestab, cuenta |
| 4 | 2026-10-12 | 43:24-46:41 | 0 | 2 | 13 | 2 | 0 | 15 (100%) | 10 | - |
| 5 | 2026-10-13 | 46:41-49:41 | 0 | 1 | 13 | 2 | 0 | 15 (100%) | 10 | - |

## Timeline (5-minute steps)
`#` = one new word met in that step.

| Time | New | Learned | Uses | Met / learned so far | New words | What was going on |
| --- | --- | --- | --- | --- | --- | --- |
| 0:00 | ############# 13 | 1 | 8 | 13 / 1 | hola, adios, buenosdias, comoestas, bien, gracias, porfavor, si, no, dos, tres, manzana, platano | Mamá's intro, mercado, saludos, greetings, carta, pelota, exploring (tap-anything) |
| 5:00 | ######## 8 | 3 | 12 | 21 / 4 | rojo, azul, pelota, agua, banco, perro, sientate, ven | mercado, exploring (tap-anything), pelota, greetings, Canelo becomes yours, canelo, shops & presents |
| 10:00 | ########## 10 | 3 | 9 | 31 / 7 | uno, pan, casa, panaderia, carta, queso, huevo, cabra, feliz, cansado | canelo, exploring (tap-anything), greetings, carta, shops & presents, picnic, cansado, show, teaching Canelo |
| 15:00 | ### 3 | 4 | 17 | 34 / 11 | biblioteca, leche, granja | picnic, cansado, shops & presents, greetings, hearts, finding a page |
| 20:00 | #### 4 | 5 | 17 | 38 / 16 | gato, salta, pata, gira | picnic, shops & presents, side jobs, greetings, teaching Canelo, show |
| 25:00 | ######### 9 | 4 | 14 | 47 / 20 | amarillo, blanco, rosa, mariposa, miau, cuac, croac, bee, triste | show, finding a page, greetings, flores, sonidos |
| 30:00 | . 0 | 1 | 24 | 47 / 21 |  | shops & presents, greetings, side jobs, cuenta, fiestab |
| 35:00 | ### 3 | 1 | 15 | 50 / 22 | verde, pajaro, gallina | fiestab, exploring (tap-anything), cuenta, finding a page |
| 40:00 | # 1 | 5 | 21 | 51 / 27 | diez | cuenta, shops & presents, greetings, finding a page, teaching Canelo |
| 45:00 | . 0 | 1 | 23 | 51 / 28 |  | greetings, shops & presents, hearts, exploring (tap-anything) |

## Per word
*Met*: game time and how it was met (the word model). *To use*: time from then to its first active use. *Moments*: distinct episodes it appeared in. *Exp*: passive exposures (shown, heard, on a page, named by a tap, on a card). *Act*: picked right + said (cued picks). *Gap*: average / longest time between moments. *Errands*: errands it appeared in. *Sess*: sessions it appeared in. *Recalled*: used again after the errand that introduced it.

| Word | Met | How | Where | To use | Moments | Exp | Act (said, cued) | Wrong | Gap avg / max | Last | Errands | Sess | Learned (by) | Recalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hola *hola* | 0:12 | answer | intro | 1:44 | 44 | 108 | 27 (10, 0) | 0 | 1.1m / 6.3m | 49:33 | 6 | 5 | 8:00 (answer) | yes |
| buenosdias *buenos días* | 0:17 | answer | intro | 1:52 | 18 | 54 | 16 (1, 0) | 0 | 2.8m / 13.0m | 47:48 | 2 | 5 | 18:50 (answer) | yes |
| adios *adiós* | 0:29 | answer | intro | never | 46 | 58 | 0 (0, 0) | 1 | 1.1m / 7.0m | 49:27 | 3 | 5 | no | no |
| si *sí* | 0:54 | answer | mercado | 5:23 | 30 | 55 | 14 (3, 0) | 0 | 1.5m / 7.5m | 45:17 | 11 | 4 | 13:46 (answer) | yes |
| no *no* | 0:58 | answer | mercado | 4:36 | 34 | 45 | 3 (1, 0) | 2 | 1.4m / 6.1m | 47:53 | 10 | 5 | 5:46 (answer) | yes |
| bien *bien* | 1:21 | answer | saludos | 1:04 | 5 | 11 | 4 (0, 0) | 0 | 6.2m / 17.3m | 26:18 | 1 | 2 | 4:12 (answer) | yes |
| comoestas *¿cómo estás?* | 1:21 | co | saludos | never | 8 | 17 | 0 (0, 0) | 0 | 6.8m / 17.3m | 49:07 | 1 | 5 | no | no |
| gracias *gracias* | 1:29 | answer | saludos | 3:29 | 58 | 106 | 3 (2, 0) | 3 | 0.9m / 6.5m | 49:33 | 9 | 5 | 10:39 (answer) | yes |
| manzana *la manzana* | 4:27 | answer | mercado | 12:14 | 18 | 52 | 2 (0, 0) | 1 | 2.8m / 24.1m | 48:11 | 5 | 5 | 17:05 (answer) | yes |
| tres *tres* | 4:32 | answer | mercado | 35:32 | 12 | 32 | 1 (0, 0) | 1 | 3.5m / 9.6m | 40:44 | 6 | 3 | no | yes |
| platano *el plátano* | 4:41 | answer | mercado | never | 5 | 14 | 0 (0, 0) | 0 | 3.9m / 11.6m | 16:36 | 1 | 2 | no | no |
| dos *dos* | 4:46 | answer | mercado | 0:22 | 9 | 28 | 2 (0, 0) | 0 | 4.8m / 19.1m | 40:44 | 4 | 2 | no | yes |
| porfavor *por favor* | 4:53 | answer | mercado | never | 5 | 10 | 0 (0, 0) | 0 | 5.8m / 11.6m | 26:28 | 3 | 2 | no | no |
| rojo *rojo / roja* | 6:17 | co | pelota | 18:50 | 15 | 35 | 5 (0, 0) | 1 | 3.3m / 18.3m | 49:33 | 4 | 5 | 25:49 (answer) | yes |
| pelota *la pelota* | 6:26 | answer | pelota | 2:59 | 25 | 49 | 5 (0, 0) | 0 | 2.1m / 8.4m | 49:33 | 4 | 5 | 34:41 (answer) | yes |
| azul *azul* | 6:32 | answer | pelota | 18:22 | 8 | 17 | 5 (2, 0) | 0 | 5.8m / 18.3m | 46:19 | 4 | 4 | 25:49 (answer) | yes |
| sientate *siéntate* | 7:19 | answer | canelo-dog | 6:42 | 10 | 27 | 4 (0, 0) | 1 | 3.5m / 14.1m | 39:06 | 3 | 3 | 14:09 (answer) | yes |
| perro *el perro* | 7:32 | answer | canelo | 0:40 | 11 | 20 | 7 (1, 0) | 0 | 4.0m / 13.1m | 47:22 | 3 | 5 | 9:07 (answer) | yes |
| agua *el agua* | 8:30 | answer | shop | 2:52 | 25 | 44 | 7 (1, 0) | 0 | 1.5m / 5.4m | 43:06 | 3 | 3 | 16:05 (answer) | yes |
| banco *el banco* | 8:44 | answer | canelo | never | 2 | 6 | 0 (0, 0) | 0 | 0.4m / 0.4m | 8:44 | 1 | 1 | no | no |
| ven *ven* | 9:56 | answer | canelo | 11:47 | 12 | 25 | 4 (1, 0) | 0 | 3.0m / 13.7m | 42:56 | 3 | 3 | 22:08 (answer) | yes |
| cabra *la cabra* | 10:03 | answer | canelo | never | 4 | 16 | 0 (0, 0) | 0 | 10.1m / 13.7m | 40:17 | 4 | 3 | no | no |
| pan *el pan* | 10:31 | answer | carta | 8:29 | 17 | 30 | 3 (1, 0) | 1 | 1.8m / 9.4m | 37:43 | 5 | 3 | 37:37 (answer) | yes |
| panaderia *la panadería* | 10:58 | answer | carta | never | 5 | 7 | 0 (0, 0) | 0 | 3.8m / 7.1m | 18:20 | 2 | 2 | no | no |
| carta *la carta* | 10:58 | co | carta | never | 12 | 35 | 0 (0, 0) | 0 | 1.6m / 4.1m | 17:57 | 3 | 2 | no | no |
| feliz *feliz* | 11:44 | answer | canelo | 6:19 | 8 | 18 | 3 (1, 0) | 0 | 4.0m / 11.7m | 39:29 | 6 | 3 | 27:48 (answer) | yes |
| huevo *el huevo* | 12:39 | answer | picnic | 5:58 | 8 | 27 | 4 (0, 0) | 0 | 2.6m / 9.4m | 30:54 | 1 | 3 | 20:02 (answer) | yes |
| queso *el queso* | 12:55 | answer | picnic | 5:41 | 9 | 21 | 2 (1, 0) | 0 | 4.4m / 21.5m | 47:53 | 2 | 5 | 19:51 (answer) | no |
| uno *uno* | 13:03 | answer | picnic | 27:15 | 13 | 33 | 5 (0, 0) | 1 | 3.2m / 19.1m | 40:44 | 4 | 2 | 40:22 (answer) | yes |
| cansado *cansado / cansada* | 13:23 | answer | cansado | never | 6 | 11 | 0 (0, 0) | 0 | 5.5m / 11.7m | 39:21 | 4 | 3 | no | no |
| casa *la casa* | 14:44 | answer | cansado | never | 11 | 15 | 0 (0, 0) | 0 | 3.1m / 9.7m | 31:06 | 4 | 3 | no | no |
| leche *la leche* | 15:20 | answer | picnic | 3:16 | 9 | 18 | 2 (0, 0) | 2 | 2.7m / 10.7m | 30:19 | 1 | 3 | 20:10 (answer) | no |
| granja *la granja* | 15:41 | answer | cansado | never | 13 | 30 | 0 (0, 0) | 0 | 2.4m / 10.8m | 38:17 | 4 | 3 | no | no |
| biblioteca *la biblioteca* | 17:42 | answer | cansado | never | 7 | 11 | 0 (0, 0) | 0 | 5.2m / 12.4m | 42:02 | 3 | 3 | no | no |
| pata *dame la pata* | 22:50 | answer | tricks | 0:20 | 8 | 25 | 4 (0, 0) | 0 | 4.2m / 14.2m | 42:56 | 2 | 3 | 23:10 (answer) | yes |
| salta *salta* | 23:27 | answer | tricks | 0:25 | 7 | 23 | 4 (3, 0) | 0 | 5.5m / 13.8m | 43:06 | 3 | 3 | 23:52 (answer) | yes |
| gato *el gato* | 24:19 | answer | show | 5:15 | 9 | 19 | 4 (0, 0) | 1 | 5.0m / 14.7m | 47:23 | 3 | 5 | 42:45 (answer) | yes |
| gira *gira* | 24:30 | answer | tricks | 18:33 | 3 | 12 | 2 (2, 0) | 0 | 9.3m / 14.4m | 43:14 | 1 | 2 | 43:14 (answer) | no |
| amarillo *amarillo / amarilla* | 25:23 | answer | show | 0:25 | 12 | 23 | 6 (0, 0) | 1 | 3.7m / 18.6m | 47:01 | 4 | 5 | 27:25 (answer) | yes |
| triste *triste* | 26:27 | answer | flores | never | 6 | 9 | 0 (0, 0) | 0 | 5.5m / 11.7m | 39:21 | 4 | 3 | no | no |
| rosa *rosa* | 26:48 | answer | flores | never | 5 | 11 | 0 (0, 0) | 0 | 3.7m / 7.2m | 27:20 | 2 | 2 | no | no |
| blanco *blanco / blanca* | 27:02 | answer | flores | never | 4 | 6 | 0 (0, 0) | 0 | 3.3m / 9.1m | 36:25 | 2 | 2 | no | no |
| mariposa *la mariposa* | 27:19 | answer | flores | 15:26 | 5 | 12 | 3 (0, 0) | 0 | 5.0m / 15.3m | 47:23 | 1 | 4 | 43:45 (answer) | yes |
| cuac *cuac* | 28:17 | answer | sonidos | 8:45 | 6 | 11 | 1 (0, 0) | 0 | 1.9m / 7.2m | 37:29 | 2 | 2 | no | yes |
| croac *croac* | 28:37 | answer | sonidos | 8:25 | 5 | 7 | 1 (0, 0) | 0 | 2.2m / 7.2m | 37:02 | 1 | 2 | no | yes |
| bee *bee* | 29:05 | answer | sonidos | 7:57 | 5 | 9 | 1 (0, 0) | 0 | 6.7m / 13.3m | 37:02 | 3 | 3 | no | yes |
| miau *miau* | 29:44 | answer | sonidos | 7:19 | 4 | 7 | 1 (0, 0) | 0 | 4.2m / 7.2m | 37:02 | 2 | 2 | no | yes |
| pajaro *el pájaro* | 35:27 | tap | explore | 7:18 | 7 | 11 | 3 (0, 0) | 0 | 3.3m / 8.2m | 47:22 | 2 | 4 | 43:45 (answer) | yes |
| verde *verde* | 36:46 | answer | fiestab | 9:33 | 6 | 10 | 2 (0, 0) | 0 | 8.2m / 18.3m | 47:01 | 3 | 5 | 47:01 (answer) | yes |
| gallina *la gallina* | 38:17 | answer | fiestab | never | 4 | 8 | 0 (0, 0) | 0 | 10.0m / 25.6m | 40:05 | 4 | 2 | no | no |
| diez *diez* | 40:51 | answer | cuenta | never | 1 | 4 | 0 (0, 0) | 0 | - | 40:51 | 1 | 1 | no | no |
| cuatro | never | | | | 0 | 0 | 0 | | | | | | | |
| cinco | never | | | | 0 | 0 | 0 | | | | | | | |
| naranja | never | | | | 0 | 0 | 0 | | | | | | | |
| uvas | never | | | | 0 | 0 | 0 | | | | | | | |
| escuela | never | | | | 0 | 0 | 0 | | | | | | | |
| parque | never | | | | 0 | 0 | 0 | | | | | | | |
| seis | never | | | | 0 | 0 | 0 | | | | | | | |
| siete | never | | | | 0 | 0 | 0 | | | | | | | |
| ocho | never | | | | 0 | 0 | 0 | | | | | | | |
| nueve | never | | | | 0 | 0 | 0 | | | | | | | |
| galleta | never | | | | 0 | 0 | 0 | | | | | | | |
| negro | never | | | | 0 | 0 | 0 | | | | | | | |
| cafe | never | | | | 0 | 0 | 0 | | | | | | | |
| arbol | never | | | | 0 | 0 | 0 | | | | | | | |
| flor | never | | | | 0 | 0 | 0 | | | | | | | |
| fuente | never | | | | 0 | 0 | 0 | | | | | | | |
| puerta | never | | | | 0 | 0 | 0 | | | | | | | |
| ventana | never | | | | 0 | 0 | 0 | | | | | | | |
| pez | never | | | | 0 | 0 | 0 | | | | | | | |
| conejo | never | | | | 0 | 0 | 0 | | | | | | | |
| pato | never | | | | 0 | 0 | 0 | | | | | | | |
| rana | never | | | | 0 | 0 | 0 | | | | | | | |
| caballo | never | | | | 0 | 0 | 0 | | | | | | | |
| guau | never | | | | 0 | 0 | 0 | | | | | | | |
| pio | never | | | | 0 | 0 | 0 | | | | | | | |
| hueso | never | | | | 0 | 0 | 0 | | | | | | | |
| cama | never | | | | 0 | 0 | 0 | | | | | | | |

## How it is measured
- `src/vocablog.js` (dev only, off unless a test sets `G.vocabLog = []`; never saved) logs every word event with the game time, map, speaker and episode: *meet* (the word model: met, and how), *prompt* (a question whose answer it is: intro / new / review, its stage, the cards shown, cued), *retrieval* (an active use credited to the model: said, cued, card mode, first try, stage before and after), *stage*, *shown* (a dialogue line, a prompt, a picture, the bag, a banner), *heard* (the voice), *tapped-object*, *choice-shown* (ans: it was the answer), *recognized*, *wrong*, *picked*, *said*, *learned*, and *session* (a new session or day).
- A word is *new* when it is met (stage 1); being shown or heard before that does not count (an unmet word appears as its picture only). *Active uses* are the model's retrievals of a met word; the answer that met it is its puzzle, not a use. *First use*: the first retrieval at least 20 s after meeting. *Cued*: the answer could be found by matching the prompt (its picture over the question and on its card, or its word written in both). *Review prompts*: questions about a word met in an earlier session or 5+ minutes earlier (or asked by `G.review`, or a page puzzle).
- An *episode* lasts until the child is free to walk again; what changed in the save meanwhile (an errand started or finished, its flags, Canelo's tricks, a side job, the bag) says which errand it belonged to. *Errands/episodes a word is in*: the contexts it came up in after it was met.
- Time is the game's own frames (60 a second: walking, animations, the typewriter) plus a child's pace on top: ~1 s + 0.09 s a letter to listen to a line, ~1.5 s + 0.07 s a letter + 0.6 s a card to think at a question, 3 s for a gold card, 2 s for errand and badge cards, 5 s to look at the notebook, 12 s for a page puzzle, 2 s more to say an answer, and 2.5 s to look around before each tap on the map. The bot never wanders, replays lines or opens the notebook on its own, so a real child takes longer and meets more words by tapping around.
- Sessions: about 15 minutes each (the session ends at the next free moment on the map), each on the next calendar day (G.debug.dayShift): once-a-day greetings, side jobs and say-it-back stars come back each day, and the word model's day-based reviews fall due. Bursts: 5+ meetings within 30 s. Overload: more than 8 meetings within 5 minutes.
- Re-run: `NODE_PATH=$(npm root -g) node tools/vocab-audit.js` (`--quick` runs the game 3x faster, `--strict` exits 1 when a target fails, `--days 5 --session 15`; `--from <dump.json>` re-analyses a saved run in a second).
<!-- AUDIT:END -->
