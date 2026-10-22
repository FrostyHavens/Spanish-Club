# Learning design: how words reach the child

This is the redesign that follows `LEARNING_RESEARCH.md` (what the evidence says) and `VOCAB_AUDIT.md` (what the
game did before). The short version of the audit: the old game showed 65 of its 78 words in the first 15 minutes,
43 of them on notebook pages, then asked for most words once or never. This design fixes that while keeping the
spirit of *Tunic*: you start knowing almost nothing, meaning comes from pictures, actions and context, and every new
word should feel like a small puzzle you solved, not a dictionary entry you were handed.

> **2026-10 (Sprint 2, items 2.1-2.4 and 2.9 of `docs/AUDIT_2026-10.md`): the memory engine rebuilt.** Review gaps in
> calendar days up to 150 days, a forgotten word really drops back, honest stages from the switch date, the most overdue
> word for its gap reviewed first, and **review-first pacing** for the open world: new words and phrases there arrive
> only while 5 or fewer words are due, about 2.5 a play day in year 1 (1.8 in year 2, 1.5 after), more only with nothing
> due, never more than 8 in a calendar day. The story's chapters always introduce their words. On a busy day an
> open-world new thing is still seen and heard (and goes in the album), a due word is reviewed instead, and the new word
> waits in a small queue (the dog's warm-up introduces it once there's room, or the next time she meets it). The rules
> below and `src/words.js`'s header have the details; the note that follows is history.

> **2026-10-17, the open world: no daily word limit.** The parent asked for freedom to explore, so the new-word budget
> no longer gates anything (no "6 a day / 8 a date", no "soon", no "busy" review days that hold the story back;
> `G.budget.canIntro` is always true and `G.chapters.gate` only checks the chapter before and morning / evening). The
> rules below still hold *inside* every activity: one unknown at a time, the new word used again within a minute or two
> (Canelo's "?" does it by itself), 3-5 new words an errand, spaced review in the world. What changed is that a child
> who plays a lot in one day now meets more words that day; the review engine and the cards adapt as before. The audit's
> "most new words in 5 minutes" and "first session" targets are now design guidance for content, not enforced by a
> gate (`docs/WORLD_PLAN.md`).

## Principles
1. **Few things at once.** A new word only arrives when the child can use it right away. At most 3–5 new words per
   errand (no daily cap since the open world: the pacing lives in each activity). Fixed phrases (*dame la pata*, *buenos días*) count as
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
| 0 | unmet | — | its picture + a faint blank in speech (Tunic's "unreadable" text); no card yet |
| 1 | met | its introduction puzzle | picture + blue word; a card with a seed |
| 2 | known | picked right without a cue | picture + blue word; its plant at least a sprout |
| 3 | remembered | a recall-type right answer (word-only choices, a page match, said, a grown-up's check, a recall from memory) on a **later calendar day** than it was met | picture + gold word; a gold card, in flower |
| 4 | solid | **recalled from memory** on 2 later calendar days at least 2 days apart: said before any written cue, picked from picture-only cards on a later day than it was last used, or a grown-up's check | picture + gold word; two flowers (a third, gold, with use) |

(Since 2026-10, from the day the new code first ran on a save (`G.state.wm.v2`). Before it, gold came the same day and
solid from any 3 first-try answers over 2 days; what was earned then stays, and a card never shrinks. Never toward a
stage: cued picks, listen-and-do taps, a page puzzle's forced last pair, or a right answer the day the word was missed.)

Behind the stage sits a Leitner box (1–8) with a due time in **calendar days** (a night at home in the same sitting
moves nothing): a word answered right when due moves up a box: same session → next day → +3 days → +7 → +16 → +35 →
+75 → +150. A miss sends it back to box 2 (from box 4 or more) or box 1 and it comes back in 1.5 minutes; a right
answer that same day can't lift it above box 2, so it climbs again from the next day. When time is short, the review
asks the words most overdue for their gap first (days late divided by the box's gap). Stars (at most one per word per
day, from first-try answers) are only counted now, never shown.

**Cards that grow** (2026-10-11, `src/cards.js`): a 7-year-old doesn't care about stars, so the visible progress is
on the word itself. Each word met is a card whose plant grows every time it's used (say 5, pick 2, find 2, page match
2, carry / give / tap 1, the passive ones at most once per 30 s), popping up where it happened. The plant is capped and
floored by the stage above, so it never tells the child more than the model knows: no flower before stage 3. The
picture is now always beside a word in speech (the playtest: words and pictures must be seen together); the Tunic rule
is kept by the blank: an unmet word still can't be read. A question's own choices in its prompt are heard, not shown,
so showing pictures everywhere gives no answer away; the recall cards (word-only, picture-only) are unchanged.

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
Target: at least 40% of all prompts review older words. (It was 40–60%; with ≤ 5 new words per chapter and ≥ 5 spaced retrievals per word, review naturally lands around 70–80%, which is what the research asks for.)

## The notebook
Early on there is no notebook, just the cards; it opens at 15 met words as their organizer (`src/cards.js`).
The notebook is no longer handed out in pages. A word is written into it at the moment it's introduced, and its
topic page appears when the first word of the topic does. Pages show the words' stages (blue/gold, the card's plant). Hidden
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
| Prompts that review older words | low | ≥ 40% |
| Words introduced as a wrong answer first | 18 | 0 |

## Build order
1. Engine: word model and stages, review engine, adaptive questions, introduction helpers, the new notebook, page
   puzzles, new-word budget, audit extended to several days with these targets as pass/fail.
2. Curriculum: the word order and per-errand budget (`docs/CURRICULUM.md`), vocabulary moved to `content/es/`,
   every errand and the intro rewritten around introduction puzzles.
3. Review in the world: greetings, favores, Canelo, palabra del día.
4. Measure and tune until the targets pass; full tests; ship.

See `DEVLOG.md` for what was actually built and why.
