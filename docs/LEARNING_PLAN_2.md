# Learning plan 2: measure, phrases, listen-and-do

Engagement is working (a 7-year-old named her dog and found the bear in the cave). This plan improves how well and
how fast she learns. It builds on `LEARNING_DESIGN.md` (the word model: stages, Leitner boxes, review) and
`WORLD_PLAN.md` (Villa Sol and five zones, 177 words). Decisions made with the parent are marked **[decided]**.

## Phase 1: measure and review: **built** (2026-10-21; DEVLOG)
1. **Learning history in the save** (compact, on the device only, no audio): per day, minutes played, words met, and
   every retrieval: recognized (picked), recalled (word-only cards, page match), said aloud, missed; with the gap since
   the word's previous encounter, so retention after a day or more can be computed.
2. **The dog's warm-up, once a day on the first play [decided]**: the first time she is free to walk each day, the dog
   trots up carrying something; 3-4 due words (most overdue first, from earlier days and other zones); say it (or tap);
   cards grow, the dog celebrates; about a minute; skippable.
3. **Slipping words**: a word missed 3 times gets a fresh one-unknown introduction instead of the same question.
4. **Parent dashboard** (grown-ups menu, a "Learning" row): overview (days, minutes, words met / known / remembered /
   solid, share of practice spoken); **retention** (first-try accuracy when a word comes back after a day or more);
   words by zone (strength bar, said-aloud mark, last seen, slipping flag); **the parent check**: 10 words to ask her
   away from the game, mixed strong and slipping, the parent taps check or cross and the answers count as practice
   **[decided: in the dashboard]**; **tonight's question**: one line for dinner from today's words; share as text.

**As built** (`src/history.js` `G.hist`, `src/warmup.js` `G.warmup`, `words.js` slipping + `G.intro.again`,
`src/dashboard.js` `G.dashboard`; `tools/test-learning.js`), and what changed on the way:
- **The gap** is the whole days since the word was last *met or actively used* (picked, recalled, said, missed,
  checked): a line that merely shows a word doesn't reset it (questions show their own answer). Older saves have no
  history; a word's last day is estimated from its star / first-try / met dates, so its first answer after the update
  already counts.
- **Compact format**: per day, per word, `[gap, events]` with one letter per retrieval (P pick, R recall, S said, K a cued
  pick, E said right after hearing it, m miss, C / c the grown-up's check; capital = first try). One gap per word and
  day loses nothing (later events that day have a gap of 0). 60 days in detail, older days folded into totals.
- **Retention** counts the first event of a word on a day it comes back after 1+ days, right on the first try; the
  grown-ups' checks, cued picks and echoes never count (they would flatter it). *Said aloud* = said events over all
  practice events (checks apart). Minutes stop after 3 minutes without a touch and don't count the grown-ups' screens.
- **The warm-up's form** follows the answer-card rules: a known word (stage 2+) is held up with a **big mic beside it**
  and word-only cards (recall: say it or tap its word); a word only met is heard and picked among picture-and-word cards
  (recognition); a slipping word is met again instead. Distractors come from the word's topic and never sound like it
  (the mic hears all three). Order: earlier days first, then the most overdue past its box's interval, other places, a
  slipping word; never two forms of one word. It waits for story beats (a chapter's beat that starts by itself goes
  first), find-it puzzles, the opener, the bus, the evening, and `G.warmup.HOLDS`; with fewer than 2 due words it
  doesn't come that day. The skip button is two arrows (no words). The tests keep it off unless they ask
  (`{warmup: true}` in the harness, or `WARMUP=1`).
- **Slipping**: 3 misses in a row, *or 3 within 10 minutes of play* (rights between them don't save it); met again once;
  slipping until right on the first try twice (not cued, not an echo).
- **The Learning page** has five tabs (Overview, Retention, Words, Check, Tonight) and Share (the share sheet, else the
  clipboard, else a box to copy from). The check: Right / Not yet / Skip / Stop; half the words need it (slipping, due,
  only met), half are strong; a right is a recall in the model (known -> remembered, up a box), a not yet a miss; the
  last 12 checks are kept. Tonight's question is built only from words she has met (its word, and the answer's word
  when it has one: *guau*, a colour, a place, the weather).
- **How we'll know** (below) is now on the page: retention (Retention tab), the share spoken (Overview), and the
  parent's check next to the game's retention.

## Phase 2: phrases, "say it to get it": **built** (2026-10-21; DEVLOG)
1. Phrases are collectible cards too (speech-bubble mark), with the same strength model and growth.
2. Six patterns, introduced one at a time across the world: **Me llamo ___** (meeting each new friend: she says her
   name), **Quiero ___** (shops, cookies, ice cream), **¿Dónde está ___?** (a hint from Nico, a missing animal),
   **Me gusta ___** (Lola asks her favourite animal; pinned in the album), **Tengo ___** (what she carries, letters),
   **___, por favor** (a bonus on requests).
3. Saying the phrase makes it happen. **Saying only the key word still works, then the pattern is shown and she is
   invited to say the whole phrase for a bigger card boost [decided]**. Lenient matching: un/una, el/la, word order.
4. A tap fallback: build the sentence from a pattern card and a word card; it is read back.
5. Grammar by exposure only: people reply with the correct form. **No colour-coding of el/la: by ear [decided]**
   (colour already means a word's stage: blue met, gold remembered).

**As built** (`src/phrases.js` `G.phrase`, `G.speech.matchPhrase` in `src/speech.js`, the patterns in
`content/es/words.js` `C.phrases`; `tools/test-phrases.js`), and what changed on the way:
- **A phrase is an item of the word model**: ids `f_llamo`, `f_quiero`, `f_porfavor`, `f_donde`, `f_gusta`, `f_tengo`;
  the same record, stages, boxes, slipping and history as a word (kept apart in `G.state.phrases.r`, with the pattern
  introductions, the names exchanged, her favourite animal and the friends' questions). Its card has a speech-bubble mark,
  the frame as its label and the word it was last said with as its picture; it grows like a word card (said whole: the
  most, +8; built with taps: +3). A *Frases* tab in the deck and in the grown-ups' Words tab, a *Frases* page in the
  notebook, a "Phrases" line on the Overview (met, said aloud in all and today) and in Share.
- **The request** (`PhraseAsk`): the person's question at the top, her face and her **speech bubble** (the frame's words
  and an empty slot), a **big mic** beside it, and below a frame card and a card per word (the word's picture; its word
  too while it's only met). Saying the whole phrase: both the phrase's card and the word's card grow, they do it.
  **Only the key word: they still do it**, then her bubble shows the whole sentence (frame card + word card) and she is
  invited to say it: one try, a bonus if she does (the phrase's card and +3 on the word's), a go-on button, never in
  the way; the key word alone is a miss of the phrase in the model (3 of them: the pattern is modelled again). The frame
  alone lights it up with "¿...?" over the slot; a wrong thing (Tengo: not what she holds) wobbles and greys out; nothing
  heard: ¡Otra vez!. **The builder** (taps): the frame card and a word card fly into her bubble, the sentence is read
  aloud; it counts as built (productive, but it can't make a phrase gold: only saying it does).
- **Lenient matching** (`G.speech.matchPhrase(frameId, slotTargets, alternatives)` -> `{frame, slot, full, polite,
  score, heard}`): the frame anywhere, the slot in the rest, articles optional and either gender, accents, case, ¿¡, word
  order, the mishearings the word mic forgives, the frames' other forms (quisiera, yo quiero, me das; mi nombre es; dónde
  están; me gustan, me encanta; yo tengo, te traigo), "por favor" anywhere. 49 must-pass / must-fail cases in the test.
- **One pattern at a time**: the first time a pattern comes up, two friends (Lola and Nico, or the person there) model it
  twice in a comic strip (the bubble, what happens: the bread flies over, the place the cat hides, a heart), then
  "¡Ahora tú!" with a mic; never two within 4 minutes of play, never with a word met in the last minute; wherever it
  comes up first (order-independent). Saved in `G.state.phrases.intro`.
- **Where she says them**: *Me llamo* when she first talks with each zone's people and Lola (they say their name first;
  Lola then skips her "¡Soy Lola!"), and with each Villa Sol friend after their next greeting; anything after "me llamo"
  counts (a misheard name is fine); the tap card is her portrait and name. *Quiero* at Marta's and Don Pepe's shops,
  Doña Nieves's ice creams, Abuela's cookies, Don Lucho's hot chocolate (once a day) and Lupe's pie (the pie isn't a
  word: heard, never counted). *___, por favor* is introduced on a Quiero request once Quiero is known; after that "por
  favor" on any request grows its card, "¡Qué amable!" and a heart for the person. *¿Dónde está?* is Nico's
  hide-and-seek hint (he shows the hiding place). *Me gusta*: Lola, once she has three album animals, asks her
  favourite (a heart bubble; "¿Qué animal te gusta?"): the animal gets a heart pin in the album and Lola's friend card
  shows it; friends sometimes ask about food or colours after their greeting (once a day in the whole world, a friend
  once a week). *Tengo*: a present she carries ("¿Qué tienes?" with three things: the one she holds is right) and the
  letters (delivering Tomás's mail, a letter back to Tomás: "Tengo una carta"). The dog's warm-up can bring one due
  phrase (last).
- **Visual first**: the frame is always a picture-sentence; ghost hands show the big mic (a mouth says it) and, a few
  seconds later or without a mic, the builder; no Spanish-only instructions (the prompts are questions with pictures;
  *English help* has the line in English). No el / la colour: people say it right.
- Phrases are off in the tests unless they ask (`{phrases: true}` in the harness, or `PHRASES=1`), and with phrases off
  every moment does exactly what it did before.

## Phase 3: listen and do
1. A request maker from words she already knows (stage 2+): number + thing ("Dame tres conchas"), colour + thing
   ("Trae la manzana roja"), size + animal ("Toca el perro grande"), later two details ("Dame dos flores amarillas"),
   with correct agreement. No picture hints; a wrong pick shows and says the right one.
2. In the world: favours, the daily warm-up, requests between zones.

## How we'll know it works
- Retention after a day or more: 70-80% first try.
- More than a third of practice spoken aloud.
- Several phrases said aloud per session.
- The parent checks agree with the dashboard.
- Practice moments per minute stay high (audit tool), with the fun intact.
