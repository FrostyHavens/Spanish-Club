# Adding content

## Where the Spanish lives
Everything Spanish that isn't dialogue is in `content/es/words.js` (`G.content.es`, copied into `G.data` by `src/data.js`):
the words, topics, number lists, notebook pages and where their puzzles sit (`pagePlaces`), and the chapter table
(`chapters`: id, title, giver, session, new words, badge icon and colour, `when: 'morning' | 'evening'`). The story of
chapters 1-10 is `content/es/story-c01-c10.js`. Pictures stay in `src/icons.js`. `index.html` loads `content/es/words.js`
before `src/data.js`, and the story files after `src/chapters.js`. The plan for all 21 chapters is `docs/CURRICULUM.md`.

## A new word
1. Add it to `C.words` in `content/es/words.js`:
   ```js
   perro: { es: 'el perro', en: 'the dog', topic: 'animales', icon: 'perro' },
   ```
   Add `alt: 'perrito / perrita'` for other forms the mic should accept.
   Include the article (*el/la/los/las*) for nouns. Adjectives that change form can show both, like `'rojo / roja'`. Speech and answer labels use the part before the `/`.
2. Add a picture to `DRAW` in `src/icons.js` (tools/test-roundb-world.js fails for a word without one). Each picture is a 16×16 function that paints with `p.disc`, `p.ell`, `p.rect`, `p.tri` and `p.shade`; the dark outline is added automatically. A word without a picture gets a plain placeholder tile.
3. Put it on its notebook page (`C.pages`, in the order the chapters meet it); for a new topic, add it to `C.topics`
   and `C.topicOrder` too. Then add it to its chapter's `words` in `C.chapters` (the budget counts those).

## Writing dialogue
Write dialogue as `T('Spanish', 'English')`. The English only shows with the parents' option on, so the Spanish has to work alone:
- Keep it to a few words. Let pictures and actions carry the meaning.
- Mark vocabulary words with `[id]`, or `[id:shown form]` for a plural or other form: `'[tres] [manzana:manzanas], ¿[porfavor]?'`. How it's drawn follows the word model (`src/words.js`): a word the child hasn't **met** is only its picture (the voice still says it), a met word is its picture plus the blue word, a known word just the blue word, a remembered one the gold word. Appearing in a line (or on a card, in the bag, on a banner) never meets a word: only an introduction does (below).
- Plain words (grammar, names) are fine. They're understood from context.
- Write `{name}` for the player's name and `{boy form/girl form}` for words that change with the character's gender: `'¡Bienvenid{o/a}, {name}!'`, `'Eres un{/a} gran carter{o/a}.'` These work in dialogue, questions and the English text.

## The word model (`src/words.js`, `docs/LEARNING_DESIGN.md`)
Each word has a stage: 0 unmet, 1 met, 2 known (picked right without a cue), 3 remembered (recalled from a picture or a sound with word-only cards, matched on a page puzzle, or said: gold), 4 solid (remembered again on a later day). Behind it a Leitner box decides when it comes back: a just-met word after 1.5 and 6 minutes of play, then the next day, +2, +4, +8 days; a miss brings it back in 1.5 minutes. Stars: one per word per day, for a first try.
```js
G.words.stage(id)      // 0..4      G.st.seen(id) = met, G.st.knows(id) = gold (remembered+)
G.words.due(id)        // it should come back now
G.review.due(3, { topic: 'comida', exclude: ['pan'] })  // the words due now, most urgent first
G.budget.canIntro(2)   // room for 2 new words now? (≤ 5 per 5 min, ≤ 6 a session; { hard: true }: 8)
```

## Introducing a word (`src/intro.js`)
A word is met in a little puzzle with **one unknown**, among words the child already knows, and is confirmed at once: it flies into the notebook (the small celebration) and is said again. Inside a talk script:
```js
if (!G.budget.canIntro(1)) { yield* say('pepe', T('¡Mañana!', 'Tomorrow!')); return; } // too many new words just now
yield* G.intro.show('pelota', { who: 'sofia', prompt: '¡Mira! ¡Mi [pelota]!' });   // held up and named, then
     // "¿Qué es?": the new word written among 2 known words as pictures (known: ['casa', 'hola'] to choose them)
yield* G.intro.watch('salta', { who: 'sofia', act: function* () { yield* G.pet.trick('salta'); } }); // see it, then do it
yield* G.intro.listen('cuac', { who: 'nico', answer: 'pato', sound: () => G.audio.sfx('pop') });  // hear it, pick its picture
yield* G.intro.find('pelota', { who: 'sofia', map: 'villa', at: [12, 15], wrong: [[10, 15], [14, 16]] });
     // returns at once; the child walks to the right thing and taps it. G.intro.found('pelota'), G.intro.seeking('sofia')
     // (for her thought bubble: alert: () => G.intro.seeking('sofia') || ...)
G.intro.meet('pelota', 'my-puzzle');   // your own puzzle: meet it (and the small celebration)
```
A question whose answer the child hasn't met also meets it when it's picked (`G.ask`), but use the helpers: they make the one-unknown puzzle for you.

## Asking (`G.ask`)
A word is learned by **using** it. Inside a talk script (a generator in `src/maps.js` or `src/errands.js`):
```js
yield* G.ask({                                  // repeats until right; returns true if right first try
  prompt: '¿Qué quieres?',
  ...G.wordChoices('perro', ['perro', 'gato', 'pez'], 3),   // distractors: words already met, when there are enough
  layout: 'cards',                              // 'cards' = picture cards, 'list' = menu
  who: 'luna',
});
yield* G.siNo('¿[perro]?', true, { show: 'perro' });   // a sí/no question about a picture
yield* G.review.ask('perro', { who: 'luna' });         // a review question for a met word, fit for its stage
```
- The **answer** is what the question practises: the word model records it (a retrieval; a miss on a wrong first pick). `learn: [...]` only *meets* the other words listed (no credit). `credit: false` leaves the model alone.
- The cards follow the answer's stage unless you say otherwise: met -> picture + word cards (if the prompt says the answer, it is heard, not shown: a little speaker); known -> word-only cards under its picture (`show`), or picture cards when the prompt says it; remembered -> its picture and word cards (say it!), or hear it and pick its picture. To force a look: `display: 'both' | 'text' | 'pic'`, or `{ word, text: true }` / `pic: true` / `look: '...'` on a choice; `mask: [ids]` hides words of the prompt (heard only).
- A right answer that could be found by **matching** (the answer's picture over the question and on its card, or its word written in the prompt and on its card) is *cued*: it counts, but never moves the word on. Write prompts that need the meaning: *¿Qué quieres?*, *¿Qué es?* with the picture and word cards, *¿Dónde está el [perro]?* with picture cards.
- An unmet word on a card is drawn as its picture only (never its word) unless it's the answer, and stays unmet. Avoid unmet distractors anyway: a word should never be seen first as a wrong answer.
- A word that reaches stage 3 gets the big *¡Palabra de oro!* card by itself (`G.learnWords(ids)` shows it for gold words that haven't had it; `{ force: true }` makes them gold first, for tests).

**Speaking.** Every `G.ask` question whose answer is a `{ word }` gets the kids' mic button automatically (when the grown-ups' *Speaking (mic)* switch is on and the browser can listen). What the child says is matched against every choice: its `label` if it has one, plus every form in the word's `es` (`'rojo / roja'`, with or without the article). So keep the choices of one question sounding different from each other (*tres* / *dos* is fine; two words that differ by one sound in a short word are not). Add `noMic: true` to a question to leave the mic off, e.g. when the answer is a picture with no word to say. Plain `G.choose` menus (no `answer`) never get a mic.

## Rules for new words
- New words come with chapters: at most 6 a day (8 a calendar date), listed in the chapter's `words` so the gate can count them before it opens. Outside a chapter, check `G.budget.canIntro(n)` and defer when it's false (the person says *¡Mañana!*). Fixed phrases (*dame la pata*) count as one word.
- A side job, a shop or a greeting only asks words that are met: give it a chapter to wait for (`chDone('c6')` in errands.js), and keep unmet words out of its choices (`q()` in errands.js drops them).
- Every new word arrives as a one-unknown puzzle (`G.intro.*`) and is used for real 1-3 minutes later: `G.review.due()` lists just-met words first, so the next person can ask one (`G.review.ask`).
- At most one unknown word per line or question; everything else known, a picture, or acted out.
- Words come back: about 10 meetings, 5+ of them active (picked or said), over several errands and days. Ask `G.review.due()` in greetings, favours, Canelo, the shops.
- Run `tools/vocab-audit.js` after changing content: its *Measured targets* table must pass (`--strict`), and the *Chapters 1-10 on their own* table too (`--strict-chapters`).

## A chapter (`src/chapters.js`, `content/es/story-*.js`)
The story is one path of chapters in a fixed order (`G.data.chapters`). A chapter opens when the one before is done
and today's new words allow it, and then plays as a list of **beats**:
```js
G.chapters.script('c11', [
  { who: 'rosa', part: 'gallina', run: function* (f, c) { ... } },              // talk to Rosa (her "!" bubble)
  { spot: { map: 'villa', at: [1, 7], icon: 'huevo' }, run: function* (f, c) { ... } }, // a place with a picture bubble
  { tap: 'gallina', run: function* (f, c) { ... } },                               // tap an animal of that kind
  { auto: 'villa', when: c => G.intro.found('huevo'), run: function* (f, c) { ... } }, // by itself, when free
  { door: 'casa', run: function* (f, c) { ... } },                                 // walking out of the house
], { stage(f, c) { /* put people where the chapter needs them */ } });
```
A beat's `run` is a scene (the map is locked); when it returns the chapter moves on (saved), `return false` stays on
the beat. `c.data` is the chapter's own saved object. `part` icons are the steps Misiones ticks off. The first beat is
the giver's: its bubble shows once the chapter may start (`G.chapters.gate(id)` is null), or a sun coming up when it
opens tomorrow. Inside a run, write with the helpers in `G.chapters.K` (`say`, `tell`, `ask`, `siNo`, `dog(f)`,
`walk`, `place`, `bark`, `heart`, `confetti`...) and introduce every new word with `G.intro.*` (below). The header of
`src/chapters.js` lists every trigger and option; `content/es/story-c01-c10.js` has ten worked examples.

**Gating** (`G.chapters.gate(id)`): the chapter before must be done; its new words must fit today's budget (6 a day, 8
a calendar date); no new chapter while 10 or more words are still only met (a review day: Luna, or Mamá before chapter 8, shows a notebook bubble and asks the oldest of them, `G.chapters.review`); `when: 'morning'` chapters
open only as the first chapter of a session, `when: 'evening'` ones only in the evening at home (day.js runs their
`evening: 'dusk' | 'dawn'` beats). A chapter that has started can always be finished. Chapters without a script
(`'unwritten'`) are skipped by nothing: the older errands run after the last written chapter
(`G.chapters.tailGate()`), one new one a day. To add chapters 11-21: write `content/es/story-c11-c21.js` (or one file
per few chapters) with `G.chapters.script(...)` calls, load it in `index.html` after `story-c01-c10.js`, and the
badges, Misiones and the gating follow by themselves. When a chapter replaces an older errand, map it in
`G.chapters.migrate()` (old saves) and drop the errand from `G.data.tailOrder`.

## An older errand (`src/errands.js`)
These run after the last written chapter (`G.data.tailOrder`), until the chapters that replace them are written.
1. Its entry in `D.quests` (with `icon` and `col` for its badge) and `D.tailOrder` (data.js), and its unlock rule in `UNLOCK`.
2. `START[id]` (the giver's first talk: ends with `newQuest(id)`), `STEP[id](who, f)` (a generator returning true when it handled that person: an errand step), `REMIND[id](who)` (what the giver says meanwhile), `ALERT[id](who)` (their bubble for a step) and `OFFER_ICON[id]` (the giver's bubble while it's waiting to start). Keep its progress in `fl(id)` (saved in `G.state.flags`), finish with `finishQuest(id)`.
3. Places to go are `SPOTS`: `{ id, map, at: [x, y], icon: () => picture or null when inactive, run: function* (f) {...} }` (a picture bubble over the tile; a tap walks there and runs it; `quiet: true` draws no bubble, `nohint()` keeps the hint hand away).
4. Things to carry go in the bag: `B.add('carta', { q: id, to: 'casa' })` / `B.take(...)`; things without `q` can be given as presents.
5. `parts(id)` lists its steps for Misiones. Every question is a `q(who, prompt, en, answer, pool)` (picture cards with the mic).

(No saving code needed: the game saves itself after every conversation. Code that changes `G.state` outside one, say on a timer, calls `G.st.autosave()`, or `G.st.saveNow()` to write at once.) A character's `alert: () => ...` returns `true` for a "!" bubble, a word id to show its picture, or a goal like `[['manzana', 3]]` to show what they want.

## A notebook page
Add it to `C.pages` / `C.pageOrder` in `content/es/words.js` (its topic in `C.topics`), at most 9 words (10 for the numbers, drawn in four columns). A word is written in the notebook the moment it's met, and a topic's page shows once its first word is. To put a **page puzzle** in the world, place the page's sparkle in `C.pagePlaces` (`map: { 'x,y': 'pageId' }`): it shows once 4 of the page's words are known (stage 2) and were met in an earlier session; solving it (matching 4 pictures to their words) gives a star and counts as a review; it comes back on a later day when 2+ of its words are due again (`G.pages.ready(id)`).

## Maps
Edit `tools/mapgen.py` and run `python3 tools/mapgen.py` to regenerate `src/mapdata.js`. Tile codes are listed in `G.TERRAIN` in `src/tiles.js`. Doors (`D`, `K`) become exits in `src/maps.js`.

## A living map (`src/ambient.js`)
- `ambient: { birds: 8, butterflies: 5, cat: [x, y] }` in a map definition adds birds (on grass, paths and the plaza; they fly off when you come close or tap them, and come back later), butterflies over flower tiles (`o`) and a cat on a fence post.
- Everyone turns to look at the player within 2 tiles, and holds still for a moment while you come over. Add `noLook: true` to a character to stop that.
- `route: [[x, y, dir, wait], ...]` walks a character along the roads from stop to stop, pausing `wait` frames facing `dir` (Tomás's mail round). Talking stops them.
- `follow: () => flag` makes a character tag along behind the player while it's true, as a ghost that never blocks (Canelo, once you've talked to him: `G.state.flags.canelo`).

## A tappable thing (`src/world.js`)
A map with `things` in its definition names its things when tapped (and with A facing them). Tile codes with a word are in `G.world.TILES` (`T`/`f` árbol, `o` flor, `l` fuente, `w` agua, `J` banco, `N` ventana, `D` puerta, `j` cama). In the map definition:
```js
things: {
  tiles: { k: 'barril' },               // more tile words (or a code: null to take one away)
  areas: { granja: 'granja' },          // a G.MAPDATA pos tag holding [x, y, w, h] (from mapgen's t.pos[...]): its roof and walls
  at: { '41,4': 'puerta' },             // one tile; wins over everything
},
```
`things: {}` just uses the default tiles. The word needs a picture and a page like any word. People, doors, pages, a chapter's places and find-it spots on a tile always win over its word. From code: `G.world.name('flor', worldX, worldY, { cry: '...' })` shows the bubble and speaks; a word not met yet is only its picture and a "?" (it is met in its chapter, never by a tap: `G.world.introOnTap` is off), a met word offers the say-it-back mic (one star per word per day; a cued use). The same goes for animals: an animal whose word isn't met is a "?" in the album, with only its cry.

## A new animal (`src/animals.js`)
1. The word (and a sound word if it has one) in `content/es/words.js`, with pictures. Tapping it shows only its picture and a "?" until a chapter introduces its word.
2. `G.animals.KINDS.id = { word, sound, cry: '¡...!' }`, its pixel frames in `SPR` (rows of letters, facing right, the same size every frame), a `CRY` sound and a case in `tick()` / `frameOf()` for its behaviour.
3. Give it a home in a map definition: `animals: [{ kind: 'id', n: 2, area: 'tag' }]`, where `tag` is a `[x, y, w, h]` area added in `tools/mapgen.py` (`t.pos['tag'] = [...]`).
Tapping it then does the rest: its reaction, the word bubble with its sound, the album (`G.state.album[id]`) and say-it-back. An animal drawn elsewhere (like the birds in ambient.js) calls `G.animals.tap(id, x, y)` when tapped.

## Hearts, greetings and Canelo (`src/hearts.js`, `src/pet.js`)
- A townsperson's talk starts with `yield* hello('id')` (maps.js): their once-a-day voice greeting (from chapter 3 on; the right one for the time of day, *buenos días* early in a session, *buenas noches* after sunset, else *hola*, each once it's met; then one word that's due from that person's pool, `G.hearts.POOLS`) and any 3- or 5-heart surprise. Use `say(who, ...)` so their hearts show over the portrait.
- Hearts: `G.hearts.add(npc, n, why)` (`'greet'`, `'gift'`, `'care'`, `'errand'`, `'trick'`), then `yield* G.hearts.milestones(npc)`. `finishQuest(id)` already gives the giver +2. A new person needs adding to `G.hearts.WHO` (and `LIKES`).
- A 3-heart secret of your own: `G.hearts.secrets.rosa = function* () { ... }`.
- Canelo: `G.pet.knows('salta')`; `yield* G.pet.command('salta')` asks "¡Dile a Canelo!" and he does it; `yield* G.pet.play('fetch')` for any of his animations. A new trick: its word (with a picture) in `content/es/words.js`, an entry in `G.pet.TRICKS` (`{id, by, anim}`; `story: true` for a trick a chapter teaches), and an animation case in `pose()`.
- The album's gold star: `G.album.count('pato')`.
- Who likes what as a present: `G.hearts.LIKES` (errands.js offers it when you carry it).

## A new screen
Most play is on an iPad, so every screen works with taps as well as keys:
- Read taps with `G.tapIn(x, y, w, h)` (this frame's tap, in game pixels). Touch targets are at least 20×20 game pixels.
- A screen that waits for A also goes on with a tap; one that waits for B shows a back or close button (`G.iconBtn(ctx, 'back', x, y)` drawn, `G.btnHit(x, y)` tested).
- Spoken lines get the speaker button (`G.speakerBtn`), same as C.
- A screen that the test harness should simply close when it pops up mid-drive (like the pet menu) returns its close button from `closeXY()` and is listed in `Game.drive` in `tools/harness.js`.
- Give the screen `hintXY()` returning `[x, y]` if a stuck child should be shown where to tap (the hand in `src/hint.js`). Never point at a right answer.
- Ripples, bursts and confetti come from `G.fx` (`src/fx.js`); they're drawn above every screen, so a screen doesn't draw its own.

## Language checklist
- Use Mexican / Latin American Spanish: *presiona* (not *pulsa*), *ustedes* (not *vosotros*), *carro* (not *coche*), *jugo* (not *zumo*), *computadora* (not *ordenador*).
- Keep sentences short and in the present tense.
- The player picks boy or girl, so adjectives about the player should use `{o/a}`, never a fixed form.
- Introduce every new word with a puzzle (`G.intro.*`) and ask it again soon after (`G.review`).
- After adding words or an errand, run `tools/vocab-audit.js --quick --strict` and check `docs/VOCAB_AUDIT.md`: the measured targets should pass; every new word should be used (picked or said) soon after it's met and come back in later errands and days.
