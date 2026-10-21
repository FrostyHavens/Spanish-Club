# Learning plan 2: measure, phrases, listen-and-do

Engagement is working (a 7-year-old named her dog and found the bear in the cave). This plan improves how well and
how fast she learns. It builds on `LEARNING_DESIGN.md` (the word model: stages, Leitner boxes, review) and
`WORLD_PLAN.md` (Villa Sol and five zones, 180 words). Decisions made with the parent are marked **[decided]**.

**Status of the plan (2026-10-21): all three phases are built.** Phase 1 (measure and review: the learning history,
the dog's warm-up, slipping words, the grown-ups' Learning page), Phase 2 (phrases, "say it to get it": six patterns,
the big mic and the builder; the key word alone is neutral for the phrase) and Phase 3 (listen and do: a request maker
from the words she knows, the tray scene, favours in every place, world requests to bring, one in the dog's warm-up).
Each has an "as built" section below with what changed on the way. What's left to watch is "How we'll know it works"
(the Learning page shows it), and the open questions at the end of Phase 3.

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
  the way. **The key word alone is neutral for the phrase [decided, after Phase 2]**: no miss and no right (only an
  encounter), the word in the slot still gets its credit, and the invitation stays; the whole phrase said after the
  invitation is an echo in the history (E: just read aloud for her, never a retention test). (It used to be a miss of
  the phrase, and three of them modelled the pattern again; a phrase slipping from an older save still is.) The frame
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

## Phase 3: listen and do: **built** (2026-10-21; DEVLOG)
1. A request maker from words she already knows (stage 2+): number + thing ("Dame tres conchas"), colour + thing
   ("Trae la manzana roja"), size + animal ("Toca el perro grande"), later two details ("Dame dos flores amarillas"),
   with correct agreement. No picture hints; a wrong pick shows and says the right one.
2. In the world: favours, the daily warm-up, requests between zones.

**As built** (`src/requests.js` `G.requests`, `src/listen.js` `G.listen` and the scene `ListenDo`; `tools/test-listen.js`),
and what changed on the way:
- **The request maker** builds every request only from words at stage 2+ (the thing, the colour, the size, the number;
  "por favor" at the end once it's known too); the rest is grammar, always right: articles by gender (el / la / los /
  las / un / una; *el águila*, *un águila* for the feminine nouns with "el"), plurals (the word's own `pl`, else the
  rules: *conchas, flores, peces, lápices, ratones, jóvenes, árboles, colibríes, los lunes, estrellas de mar*), colour
  and size agreement (*roja, rojos, rojas; amarilla; blancos; rosadas; azules; verdes; pequeñas; grandes*), *un / una*
  for one. Templates: **num** "Dame tres conchas." (count into a basket), **col** "Dame la manzana roja.", **size**
  "Toca el perro grande." / "¿Dónde está el oso pequeño?" / "Dame el hongo grande.", **howmany** "¿Cuántas conchas
  hay?" (her answer is the number: **said with the mic** or tapped), and two details: **numcol** "Dame dos flores
  amarillas.", **numsize** "Dame tres hongos pequeños.", **howmany2** "¿Cuántas conchas azules hay?" / "¿Cuántos osos
  pequeños hay?". The word that's due comes first (the review engine's), and counting *one* is rare (it's easy).
- **The ramp**: one detail until she gets **4 right on the first try** (any requests), then two details are mixed in
  (about 60%); two two-detail misses in a row step back to one detail, and two more first-try rights bring them back
  (`G.state.hist.ld`).
- **The tray tests every word it credits.** A word is *tested* only when a picture on the tray differs from the right
  one in that word alone (a red and a green apple test *roja*; a red apple and a red flower test *manzana*; a pile is
  always bigger than the number asked); a word the tray doesn't need (all apples: *manzana*) is only heard. So the
  credit is honest: **one 'listen' retrieval per tested word per request** (the first answer; not one per shell
  counted), in the model (`answerRight(id, {mode: 'listen'})`: it moves the box like a pick; it can't make a word gold,
  which stays for recalling the form or saying it) and in the history as a new letter, **L** (l after a miss; it counts
  as practice, and for retention when it's the word's first event on a day it comes back). A wrong first answer is a
  miss only for the word whose detail was wrong (*la manzana roja* → the green apple: *rojo* m, *manzana* L). A
  "¿Cuántas?" right: the thing and detail L, the number S (said) or R (its word tapped: a recall); wrong: a miss of
  the number.
- **The scene** (`ListenDo`): the friend's face and the request at the top, **spoken** as it opens, **written with no
  pictures for its words** (`G.richLayout(..., {noPic})`: plain blue or gold text; a TextBox takes `noPic` too), a
  speaker to hear it again (a ring pulses on it until she has; a tap on the words works too), and a wooden tray of 3-6
  pictures with no labels (a big one is twice the little one's size, standing on the same ground). Tap the right one:
  it flies to the friend, who lights up, hearts, "¡Gracias!" (said), and the tested words' cards grow (from the bottom
  of the screen, so the request stays in sight). Counting: each tap on a pile puts one thing in the **basket** (no
  counting voice: that would give the number away); an arrow goes up from the basket to the friend; a tap on the
  basket (or the friend) gives it. Wrong, gently: what she did wobbles and greys out, then **the right one glows and is
  said** ("¡La manzana roja!"); a wrong count goes back to the piles and the right number is counted into the basket
  out loud ("Una... Dos... ¡Dos moras!"); a wrong number: the right pictures glow one by one, counted, and the right
  card glows. Then one more try (she gives it: they're happy) or the go-on arrow: never blocked. The number cards say
  *una* for a feminine thing. Ghost hands the first time (`listen`: the speaker, then over the pictures to one that
  isn't the answer; `listencount`: a pile, then the basket); the mic demo on a "¿Cuántas?".
- **Favours** (`src/favores.js` gained pluggable kinds: `FV.KIND / BUBBLE / ON / REMIND / TARGETS / PICK / OFF / GROUP /
  CAP`): an **ear** in the bubble; **at most two a day** in all (listen + carry); a due word of the person's board picks
  the day's. *listen* (two requests on the tray, then a star and a heart): **Don Pepe** (fruit by colour and number:
  apples red / green / yellow, green and yellow bananas, oranges), **Nico** (Villa Sol's animals big and small, how
  many), **Doña Lupe** (blackberries, acorns, mushrooms big and small, leaves by colour), **Elena** (the forest's
  animals big and small), **Abuelo** (his garden: carrots to count, yellow or white corn, red or green tomatoes; his apples
  and eggs, and his animals), **Mateo** (clouds, the sun and
  snowmen big and small, the cap, scarf and mittens by colour). *carry* (a world request): **Lola** wherever she is
  (shells on the beach, leaves in the forest, apples at the grandparents'; none in the park or the mountain) and
  **Lucía** (flowers, after her chapter): she says "¡Mira! ¡Escucha!", the things appear around her on the map **one per
  tile, in little clusters** (so they can be counted: the right ones, more than asked, and others), then the request
  (a TextBox, `noPic`). She picks them up (three at most of a kind: world requests ask for 1-3) and brings them; the
  outermost talk of every person (wrapped after all the content loads) checks what she holds before anything else (a
  present, Lola's shell collection), unless the story has something for them. Right: they take them, a star and a
  heart. Wrong: "¡Casi!", the right ones held up as a picture and said ("¡Dos conchas rosadas!"), one more try; the
  second try ends it kindly either way. Talking to them without the thing: the request again. The guide's hint (after
  a while: a favour's word is being remembered) is every pile still lying about, never only the right one; holding
  the thing, the friend.
- **The dog's warm-up** brings one request once she knows enough (`G.warmup.LD`, before a due phrase; the dog's own
  board is his ball by colour, bones to count, and every board above): "Dame dos huesos." / "Toca el pato grande."
  It never brings the warm-up by itself (it still needs two due words).
- **The grown-ups**: the Overview has a "Listen & do" line (requests, % right first try, today), and Share a sentence;
  the warm-up line says "N words and a request".
- **Requests between zones** (Lola asking in the forest for something from the beach) were left for later: a world
  request is always about the place you're in.
- Listen and do is **off in the tests unless they ask** (`{listen: true}` in the harness, or `LISTEN=1`; `drive()` does
  each request right); with it off, every favour and warm-up is exactly as before.
- **Open questions for the parent**: is two favours a day + one in the warm-up the right amount? Should listen-and-do
  ever make a word gold (now only recalling or saying it does)? ~~Vegetable words for Abuelo's garden?~~ **[decided]** la zanahoria, el
  elote, el jitomate: added (DEVLOG 2026-10-21, La huerta).

## How we'll know it works
- Retention after a day or more: 70-80% first try.
- More than a third of practice spoken aloud.
- Several phrases said aloud per session.
- The parent checks agree with the dashboard.
- Practice moments per minute stay high (audit tool), with the fun intact.
