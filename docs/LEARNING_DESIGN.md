# Learning design: how words reach the child

This is the redesign that follows `LEARNING_RESEARCH.md` (what the evidence says) and `VOCAB_AUDIT.md` (what the
game did before). The short version of the audit: the old game showed 65 of its 78 words in the first 15 minutes,
43 of them on notebook pages, then asked for most words once or never. This design fixes that while keeping the
spirit of *Tunic*: you start knowing almost nothing, meaning comes from pictures, actions and context, and every new
word should feel like a small puzzle you solved, not a dictionary entry you were handed.

## Principles
1. **Few things at once.** A new word only arrives when the child can use it right away. At most 3–5 new words per
   errand, about 6 per 15-minute session, never more than 8. Fixed phrases (*dame la pata*, *buenos días*) count as
   one word.
2. **Every new word is a puzzle with one unknown.** A word is introduced among things the child already knows, so
   they can work it out (by elimination, by watching, by trying) — then it is confirmed right away.
3. **Understanding moves the game.** The word is how you open the gate, find the thing, make Canelo jump — not a
   quiz in front of the fun.
4. **Words come back.** Each word needs about 10 meaningful encounters, at least 5 of them active (the child picks
   it or says it), spread over several errands and several days. A built-in review engine decides which known words
   come back, and the world asks for them naturally.
5. **Recognize, then recall, then say.** Questions get harder as a word gets stronger: picture + word cards first,
   then word-only cards, then hear-it-pick-the-picture, then say it.
6. **Nothing is a dead end and nothing is a test.** Wrong answers get immediate, gentle feedback (the right picture
   and its sound), and the word comes back a minute later. Taps always work; the mic is a bonus.

## The word model
Each word has a strength the game keeps per save (`G.state.words[id]`), replacing the old seen/learned flag:

| Stage | Name | How you get there | How it looks |
| --- | --- | --- | --- |
| 0 | unmet | — | shown only as its picture in speech (Tunic's "unreadable" text) |
| 1 | met | its introduction puzzle | picture + blue word |
| 2 | known | picked right without a cue | blue word, 1 star |
| 3 | remembered | recalled from a picture/sound with word-only choices, or said | gold word, 2 stars |
| 4 | solid | remembered again on a later day (3 first-try answers over ≥2 days) | gold word, 3 stars |

Behind the stage sits a small Leitner box (1–5) with a due time measured in sessions/days: a word answered right
moves up a box and is due later (same session → next day → +2 days → +4 → +8); a miss drops it a box and it comes
back within 1–3 minutes. Stars: at most one per word per day, from first-try answers.

## How words are introduced (the puzzle patterns)
- **Show and name** — someone holds up or points at a thing and says it; then *¿Qué es?* with the new word and two
  known ones. Confirmation: the thing glows, the name is said again.
- **Watch and do** (actions, commands) — Mamá says *¡siéntate!* and Canelo sits; then the child says it and Canelo
  sits for them.
- **Find it** — someone needs a thing ("¿Y mi [pelota]?") and the child must work out which of a few things in the
  world it is; walking to the right one is the answer.
- **Listen and point** — a sound or a word is heard; the child taps the animal or object it belongs to.
- **Overheard** — two townsfolk talk; the child hears a word used, then is asked to use it.

Every introduction is followed by the word's first real use within 1–3 minutes, and again 5–10 minutes later.

## Review in the world (not drills)
The review engine (`G.review.due(n, filter)`) picks words that are due. The world asks for them:
- **Morning greetings** — each person greets you and asks one due word in context (Don Pepe holds up a fruit:
  *¿Qué es?*; Lucía points at a flower: *¿De qué color?*).
- **Favores** — small daily requests with known words ("¿Me traes una [flor]?", "¿Dónde está el [gato]?").
- **Canelo** — asks for due pet words and tricks.
- **Page puzzles** — notebook pages found in the world are now picture-word matching puzzles over words you've met
  (4 pictures, 4 words), not word dumps.
- **Luna's palabra del día** — one due word, said aloud for a speaking star.
Target: 40–60% of all prompts review older words.

## The notebook
The notebook is no longer handed out in pages. A word is written into it at the moment it's introduced, and its
topic page appears when the first word of the topic does. Pages show the words' stages (blue/gold, stars). Hidden
page sparkles in the world become page puzzles that review the page's words.

## Measured targets (checked by `tools/vocab-audit.js`, multi-day run)
| Measure | Before | Target |
| --- | --- | --- |
| Most new words in any 5 minutes | 40 | ≤ 5 |
| New words in the first 15-minute session | 65 | ≤ 8 |
| Words first met on a notebook page | 43 | 0 |
| Median time from meeting to first use | 6:50 | ≤ 1:30 (90% ≤ 3:00) |
| Words never actively retrieved | 30 | 0 |
| Words retrieved only with a cue | 2 | 0 |
| Median active retrievals per word | 1 | ≥ 5 |
| Words in ≥ 3 different errands/episodes | — | ≥ 90% |
| Prompts that review older words | low | 40–60% |
| Words introduced as a wrong answer first | 18 | 0 |

## Build order
1. Engine: word model and stages, review engine, adaptive questions, introduction helpers, the new notebook, page
   puzzles, new-word budget, audit extended to several days with these targets as pass/fail.
2. Curriculum: the word order and per-errand budget (`docs/CURRICULUM.md`), vocabulary moved to `content/es/`,
   every errand and the intro rewritten around introduction puzzles.
3. Review in the world: greetings, favores, Canelo, palabra del día.
4. Measure and tune until the targets pass; full tests; ship.

See `DEVLOG.md` for what was actually built and why.
