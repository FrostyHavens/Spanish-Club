# Dev log

A running record of what changed in Club de Español and why. Newest first.

## 2026-10-09 — Learning redesign, step 1: the engine
Built the content-agnostic engine of `docs/LEARNING_DESIGN.md`; the curriculum and errands come next, on top of it.
- **Word model** (`src/words.js`): stages 0-4 (unmet, met, known, remembered, solid) with a Leitner box behind each word.
  Just-met words come back after 1.5 and 6 minutes of play, then the next day, +2, +4, +8 days; a miss drops a box and
  comes back in 1.5 minutes; massed repeats don't move the box. Sessions (a load, a new game, a new morning) and days (a
  new date or a new morning) are counted in the save (`G.state.wm`), with a play clock day.js ticks. One star per word
  per day. Old saves migrate (learned -> known, or remembered when answered twice or said; seen -> met; all due now).
  `G.st.seen / knows / learn / practiced` are thin wrappers (seen = met, knows = gold).
- **Rendering**: an unmet `[id]` is only its picture (Tunic-style) and nothing meets a word by showing it (lines, cards,
  the bag, banners). Met: picture + blue word; known: blue word; remembered: gold.
- **Questions adapt** (`G.ask`, learn.js): the cards follow the answer's stage (picture + word, word only under its
  picture, picture only with the word heard: a speaker in the prompt). A right answer that could be found by matching
  the prompt is *cued* and never moves a word on. `learn:` only meets co-listed words. Distractors come from met words.
  The big card is now *¡Palabra de oro!*, for reaching stage 3; meeting a word gets a small celebration (it flies into
  the notebook).
- **Introductions** (`src/intro.js`): `G.intro.show / watch / listen / find` (one-unknown puzzles, find-it on the map),
  `G.review.due / next / ask`, `G.budget.canIntro` (<= 5 per 5 min, 6 a session, 8 hard).
- **Notebook**: words are written in when met, a topic page appears with its first word, stages and stars show, tap to
  hear. The sparkles are **page puzzles** (match 4 met words' pictures to their words, a star, a review), waiting for 4
  met words and coming back on a later day when the words are due.
- **Tap-anything** meets an unmet word when the budget allows (else a picture and "?"); saying a word back is a cued use.
- **Audit** (`tools/vocab-audit.js`): plays several 15-minute sessions on successive dates (the playthrough, then free
  play), checks the design's measured targets (PASS / FAIL, `--strict`), `--quick` runs the game 3x faster.
- Tests: `tools/test-words.js` (new); existing tests updated where the expected behaviour changed (words met instead of
  learned, the gold card only for remembered words, page puzzles instead of found pages, the save's new keys).
- Old content still runs: Pepe's sí/no, the errands and Canelo work, but few words get proper introductions yet, so most
  targets fail until the curriculum step rewrites the content.

## 2026-10-09 — Learning redesign begins
- Researched how young children learn vocabulary (`docs/LEARNING_RESEARCH.md`).
- Built a word-flow audit (`tools/vocab-audit.js`, `src/vocablog.js`) and measured the game (`docs/VOCAB_AUDIT.md`):
  65 of 78 words arrived in the first 15 minutes (43 on notebook pages), 30 words were never actively used, and the
  median word was used once.
- Wrote the redesign (`docs/LEARNING_DESIGN.md`): a few new words at a time, each introduced as a one-unknown puzzle,
  a word-strength model with spaced review woven into the world, a notebook that fills as you learn, and measured
  targets the audit checks.
