# Adding content

## Where the Spanish lives
Everything Spanish that isn't dialogue is in `content/es/words.js` (`G.content.es`, copied into `G.data` by `src/data.js`):
the words, topics, number lists, notebook pages and where their puzzles sit (`pagePlaces`), and the chapter table
(`chapters`: id, title, giver, session, new words, badge icon and colour, `when: 'morning' | 'evening'`). The story of
chapters 1-10 is `content/es/story-c01-c10.js`, of 11-21 `content/es/story-c11-c21.js`. Pictures stay in `src/icons.js`. `index.html` loads `content/es/words.js`
before `src/data.js`, and the story files after `src/chapters.js`. The plan for all 21 chapters is `docs/CURRICULUM.md`.

## A zone of the open world (`docs/WORLD_PLAN.md`)
Villa Sol is the middle of a world of zones (La playa, El bosque, El parque de juegos, La casa de los abuelos, La
montaña), each reached on foot by a path map from an edge of town, or by bus once visited. A zone is ONE content file,
`content/es/zone-<id>.js` (loaded by `index.html` after `src/zones.js`), plus its maps in `tools/mapgen.py`, its words
in `content/es/words.js` (pictures in `src/icons.js`) and its animals (`G.animals.addKind`). The file registers its maps
(`G.maps.<id>`: exits with `G.zones.edge(...)`, `posts`, `dogSpots`, `animals`, `npcs` with `G.zones.lola`,
`G.zones.nico`, `G.mapKit.canelo`), its things to pick up (`G.carry.SOURCES`), its hiding places (`G.seek.SPOTS`), its
favours (`G.favores.OFFERS`), its zone (`G.zones.add({ id, name, icon, music, pos, maps, path, bus, entry, animals,
habitat, rare })`) and its story as its own quest line (`G.chapters.add({ id, line: '<zone>', ... })` and
`G.chapters.script(...)`: never waiting for Villa Sol's chapters). The full pattern, step by step, with the rules (any
zone can be visited first: only universal words or the zone's own, introduced there), is "How to build a zone" in
`docs/WORLD_PLAN.md`. Every zone is built (La playa, El bosque, El parque de juegos, La casa de los abuelos, La montaña:
`content/es/zone-playa.js` is the worked example, `content/es/zone-bosque.js` adds climbing / shy / glowing animals,
night, a cave and a cabin inside, dog trails and swimming, with generic animal moves, side quests on map places, a zone task for the guide and a zone
demo; `content/es/zone-juegos.js` adds action words the child says and someone DOES (`G.juegos.act / .all / .tpr /
.choose`: the player, the kids and the dog animated from `G.frame`), rides on the playground, marching ants and a hopping
cricket, a dog's jumping course and a little mini-game (bubbles to tap); `content/es/zone-abuelos.js` adds a house you go into (two maps, people inside or out by a chapter's `cond`), clothes the child wears on every map (`G.abuelos.wear`, a cosmetic over `G.st.playerSpec`), body actions (`G.abuelos.act`: touch, wash, clap) and full-screen moments (the mirror, the family photo); `content/es/zone-montana.js` adds weather that changes (`G.montana.weather / setWeather`, drawn over the map; the child says the weather she wants), the cold (shivering without warm clothes; `gorro`, `bufanda`, `guantes` join the clothes you wear: the sprite engine's `head: 'beanie'`, `scarf`, `gloves`), rides drawn by the zone (a sled, skating), a dog's spot act of its own (`tunel`) and new animal moves (`peek`, `cling`, `soar`); see "Framework additions" in
`docs/WORLD_PLAN.md`): keep their ids, path maps and bus stops.

The dog's name: write `{dog}` (like `{name}`) wherever the dog is named in a line, a prompt or an English help line; the
child names him in the opener (`G.dogName()`, default *Canelo*). Never write *Canelo* in a string.

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
   A page puzzle matches four words (a page of three, like *La huerta*, matches three). A word id that is already a
   picture's name used as a plain string (`'zanahoria'`) makes every such use that word: fine when that's what you want
   (the carrots became *la zanahoria* everywhere), otherwise pick another id (`elsol`, `cubetaarena`).
4. For listen-and-do, give a noun its plural (`pl`) and put it on a person's board (`G.requests.SPECS`, below), with
   the colours it really comes in (`cols`: Abuelo's corn yellow or white) and its picture taking `w.col`.

## Writing dialogue
Write dialogue as `T('Spanish', 'English')`. The English only shows with the parents' option on, so the Spanish has to work alone:
- Keep it to a few words. Let pictures and actions carry the meaning.
- Mark vocabulary words with `[id]`, or `[id:shown form]` for a plural or other form: `'[tres] [manzana:manzanas], ¿[porfavor]?'`. How it's drawn follows the word model (`src/words.js`): a word the child hasn't **met** is only its picture (the voice still says it), a met word is its picture plus the blue word, a known word just the blue word, a remembered one the gold word. Appearing in a line (or on a card, in the bag, on a banner) never meets a word: only an introduction does (below).
- Plain words (grammar, names) are fine. They're understood from context.
- Write `{name}` for the player's name and `{boy form/girl form}` for words that change with the character's gender: `'¡Bienvenid{o/a}, {name}!'`, `'Eres un{/a} gran carter{o/a}.'` These work in dialogue, questions and the English text.

## The word model (`src/words.js`, `docs/LEARNING_DESIGN.md`)
Each word has a stage: 0 unmet, 1 met, 2 known (picked right without a cue), 3 remembered (recalled from a picture or a sound with word-only cards, matched on a page puzzle, or said: gold), 4 solid (remembered again on a later day). Behind it a Leitner box decides when it comes back: a just-met word after 1.5 and 6 minutes of play, then the next day, +2, +4, +8 days; a miss brings it back in 1.5 minutes. (Stars, one per word per day for a first try, are still counted for the diploma but never shown to the child: what the child sees is the word's card growing, below.)
```js
G.words.stage(id)      // 0..4      G.st.seen(id) = met, G.st.knows(id) = gold (remembered+)
G.words.due(id)        // it should come back now
G.review.due(3, { topic: 'comida', exclude: ['pan'] })  // the words due now, most urgent first
G.budget.canIntro(2)   // room for 2 new words now? (≤ 5 per 5 min, ≤ 6 a session; { hard: true }: 8)
```

## Word cards that grow (`src/cards.js`)
Every met word is a card (its picture, its word, a plant in a pot). The child's progress is that plant, never stars
(`docs/PLAYTEST_NOTES.md`, 2026-10-11). Using a word grows its card, and the card pops up right where it happened:
```js
G.cards.grow('manzana', 'carry', { x, y })  // 'say' 5 (the most), 'pick' 2, 'find' 2, 'match' 2, 'carry' / 'give' / 'tap' 1
                                           // (these three at most once per word per 30 s); x, y: screen px, else the last tap
G.cards.at(x, y)                           // where the next growth pops up (the mic, the card picked)
G.cards.show('perro', { fresh: true })     // a card pops up and flies into the deck without growing (G.intro.note does this)
G.cards.pts(id) / G.cards.level(id)        // the plant: 0 seed, 1 sprout, 2 leaves, 3 bud, 4 flower, 5-6 more flowers
```
Most of it is already wired: a right answer (`G.words.answerRight`, not when said), saying a word (`G.st.said`, i.e.
`G.mic.award`), a page match, picking a thing up (`G.carry`), giving it, `G.world.name` (a tap names a met thing; pass
`grow: 'find'` for a find, `false` for none), a found-again find-it. New content gets it for free; call `grow` only for a
new kind of use. The plant agrees with the word model: no flower before the word is remembered (stage 3, gold), a
known word at least a sprout, a remembered one a flower, a solid one two. The deck is the map's corner button; the
kid menu shows the cards first; the book (the notebook) opens at `G.cards.BOOK_AT` (15) met words, with a small
celebration, and `G.findPage` before that pops the page's cards instead of opening the notebook.

## Picture and word together (`src/ui.js`, `src/learn.js`)
Every `[id]` in a line is drawn with its picture: met, picture + blue word; remembered, picture + gold word; not met,
picture + a faint blank (it can't be read before its puzzle). In a question, a choice that also appears in the prompt
is drawn as a speaker (heard, not shown) automatically, so writing `¿Dónde está el [gato]?` with the cat among the
choices is fine; the right card, once picked, shows its picture and its word. Word-only and picture-only cards stay as
`G.ask` chooses them (that's the recall), so write questions as before.

## Ghost-hand demos (`src/demo.js`)
The first time each action comes up, a see-through hand does it once (saved in `G.state.flags.demo`): `answer` (a
question's cards: it glides over them and taps one at random, never the answer), `mic` (taps it, a mouth talks),
`canelo`, `pickup`, `give`, `putdown` (taps the player), `puzzle` (drags a word up between the pictures), `seek` (taps a
peeking animal). A new kind is a detector in `onQuestion` / `onMap` returning steps `{x, y, move, act: 'tap' | 'down' |
'up' | 'talk', hold}` and a name in `G.demo.KINDS`. It never takes input and the child's own tap stops it; tests that
don't want it call `G.demo.skip()`.

## Introducing a word (`src/intro.js`)
A word is met in a little puzzle with **one unknown**, among words the child already knows, and is confirmed at once: its new card pops up and flies into the deck (the small celebration, `src/cards.js`) and is said again. Inside a talk script:
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
- New words come with chapters and zone activities, listed in the chapter's `words`. **There is no daily word limit any
  more** (2026-10-17, the open world: nothing waits on a word count; `G.budget.canIntro` is always true): pace inside the
  activity instead, at most 3-5 new words in one errand, one unknown per puzzle. Fixed phrases (*dame la pata*) count as one word.
- A side job, a shop or a greeting only asks words that are met: give it a chapter to wait for (`chDone('c6')` in errands.js), and keep unmet words out of its choices (`q()` in errands.js drops them).
- Every new word arrives as a one-unknown puzzle (`G.intro.*`) and is used for real 1-3 minutes later: `G.review.due()` lists just-met words first, so the next person can ask one (`G.review.ask`). If nothing in the story uses it by then, Canelo gets a "?" bubble a minute after it was met: tapping him asks it (`G.chapters.nudge()`), so a chapter only needs its own second use when the story calls for one.
- At most one unknown word per line or question; everything else known, a picture, or acted out.
- Words come back: about 10 meetings, 5+ of them active (picked or said), over several errands and days. Ask `G.review.due()` in greetings, favours, Canelo, the shops.
- Run `tools/vocab-audit.js` after changing content: its *Measured targets* table must pass (`--strict`), and the *Chapters 1-10 on their own* table too (`--strict-chapters`).

## A chapter (`src/chapters.js`, `content/es/story-*.js`)
The story is one path of chapters in a fixed order (`G.data.chapters`). A chapter opens when the one before is done
and today's new words allow it, and then plays as a list of **beats**:
```js
G.chapters.script('c11', [
  { who: 'rosa', part: 'gallina', run: function* (f, c) { ... } },              // talk to Rosa (a bubble with the chapter's picture)
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

**Gating** (`G.chapters.gate(id)`): the chapter before (in its line) must be done; there is no word budget any more
(with 10 or more words still only met, Luna, or Mamá before chapter 8, offers a review with a notebook bubble,
`G.chapters.review`, but nothing waits for it); `when: 'morning'` chapters
open only as the first chapter of a session, `when: 'evening'` ones only in the evening at home (day.js runs their
`evening: 'dusk' | 'dawn'` beats). A chapter that has started can always be finished. All 21 chapters are written
(`content/es/story-c01-c10.js`, `content/es/story-c11-c21.js`); a new one goes in the table in `content/es/words.js`
and a `G.chapters.script(...)` call in a content file loaded in `index.html` after those, and the badges, Misiones
and the gating follow by themselves.

**Pictures that keep a question cue-free** (`src/icons.js`; any `show`, card `img` or `sayShow` picture):
- `{ icon: 'platano', count: 3 }` a heap of three bananas to count ("¿Cuántos?": never the number's own picture);
  `{ list: ['pan', 'queso', ...] }` a heap of different things (Rosa's basket, the animals counted so far).
- `{ icon: 'pata', sign: true }` a picture sign on a little wooden post (Sofía's and Luna's trick signs). Ask with
  `display: 'text'` once the trick is known, so the child goes from the sign to the word (story-c11-c21.js `fromSign`).

**Canelo and the animals in a chapter**: `G.pet.play('sniff')` and a walk to a tile is *¡busca!* (story-c11-c21.js
`busca(f, x, y)`). An animal of `G.animals` can be moved: `a.follow = k` (it trots along your trail, k-th in line: the
animals called with *¡ven!* in chapter 19), `a.go = [x, y, speed]` (world px: it trots there, then stays), `a.pin =
[x, y]` (it stays put: a hen to tap for a find-it). `opts.follows(who, c)` makes a townsperson tag along for a while
(Nico's sound game), `opts.after(f, c)` plays once the chapter's badge is shown (the diploma). A request bubble
(`bubble: 'huevo'`) shows the thing's picture while its word is new and a "?" once it is known; without one (or with
`bubble: true`) the person shows the chapter's own picture (its `icon` in the table), never a bare "!".

**The guide finds the way by itself** (`src/guide.js`): while the child is free to walk, a yellow arrow bounces over the
beat's person, place, animal or door (at the screen's edge, with a little picture, when it's off screen; on the right
door when it's on another map), and Canelo trots that way when the child stands about. Nothing to write for it: it reads
the beat's trigger, `G.intro.find` puzzles and `beat.hint`. Mark hint targets `secret: true` when going straight to
them would give a puzzle's answer away (who says "¡miau!", which bush has the red ball): then every place to choose from
gets a small white arrow instead (when the hint gives one place, Canelo, the cat and a duck nearby are added as the
other choices), and the hand stays away. A find-it with `pics` is a choice too. Never send the child somewhere with
words only ("¡Al parque!"): the next beat's trigger is what the arrow points at, so it must be where the line sends them.

## Review in the world (`src/favores.js`)
- **Favores**: from chapter 7, up to three townsfolk a day have a "?" bubble and ask about one known word that is due
  (`G.review.next`), the way their life shows it: Tomás and Gómez send you to a place named by its word only (arriving
  asks its name), Nico asks you to find an animal and tap it, Pepe / Marta / Rosa / Luna have a heap to count, Lucía
  and Sofía a flower or a ribbon (*¿De qué color?*), Nico an animal's sound, Mamá and Lucía a face (*¿Cómo está?*),
  and the shopkeepers one of their things (*¿Qué es?*, sometimes it goes in your bag as a present). A new kind is an
  entry in `OFFERS` (who, kind, the pool of words) and a generator in `KIND`. Listen-and-do favours (an ear in the
  bubble: a tray of pictures, or things to bring) are below, in *Listen and do*.
- **Palabra del día**: from chapter 8, once a day, Profesora Luna holds up a picture of a due word: say it or pick
  its word from four.
- **Inés's library**: from chapter 16 she offers one notebook page puzzle that is ready, once a day.
- The morning greeting and its due word are in `src/hearts.js` (`H.POOLS`). The order of a townsperson's talk is
  their greeting, the story, then a present they'd like, the day's favour, the shop (`src/maps.js`, `src/errands.js`).

## Measured and reviewed by itself (`src/history.js`, `src/warmup.js`, `src/dashboard.js`)
- **Recorded by the model.** Every answer that reaches the word model (`G.ask`, `G.review.ask`, `G.words.answerRight` /
  `answerWrong`, `G.st.said`, the mic) also goes into the learning history (`G.hist`, the grown-ups' Learning page): a
  pick, a recall (`mode: 'text'` word-only cards, `'match'` a page puzzle), said aloud (`said: true`), a miss, with the days
  since the word was last met or used. Content never calls `G.hist`: a new kind of practice is counted by giving its
  answer to the model, with `cued: true` when the answer could be found by matching (it never counts as retention).
  `credit: false` leaves both alone (only a word said aloud still counts as said).
- **Slipping words.** A word missed 3 times is met again instead of asked again: `G.review.ask` does it by itself
  (`G.intro.again`: held up and named, then hear it and pick its picture among two known ones), once, and the word stays
  *slipping* until it's right on the first try twice. A question written by hand for a due word does the same:
  ```js
  if (G.words.needsReintro(id)) yield* G.intro.again(id, { who: 'luna' }); else yield* G.ask({ ... });
  ```
- **The dog's warm-up** (`G.warmup`) brings 3-4 due words once a day, the first time the child is free to walk. It
  never starts during a story beat, a find-it puzzle, the opener, the bus or the evening; anything else that mustn't be
  interrupted holds it back. It asks met words that have a picture (`G.iconDrawn`), in the strongest form their stage
  allows; a topic can have its own way to ask:
  ```js
  G.warmup.HOLDS.push(f => f.mapId === 'playa' && !!G.state.flags.myRace);   // not while this is true
  G.warmup.FORMS.tiempo = function* (id, extra) {   // a topic's own question; return true if right on the first try
    const ch = G.wordChoices(id, ['nieve', 'nube', 'lluvia', 'viento'], 3);
    return yield* G.ask(Object.assign({ prompt: '¿Qué tiempo hace?', choices: ch.choices, answer: ch.answer,
      layout: 'cards', review: true }, extra));      // keep `extra`: the skip button and the dog's cards over the question
  };
  G.warmup.start(f, ['perro', 'casa']);   // now, with these words (a story moment, tests)    G.warmup.skipToday()
  G.warmup.wait(f);                       // why it can't start now ('story', 'find', 'busy', 'held'...) or null
  ```
- **The Learning page** shows each word on its place's tab: its notebook page's place (`pagePlaces`,
  `G.zones.ofWord`), so a new word needs its page. *Tonight's question* comes from templates in `src/dashboard.js`
  (`TPL`: `[name, id => ({es, en, ans: {es, en}, words}) | null]`, and the tables `SOUND`, `HOME`, `COLOR`, `ACT`,
  `WEATHER`): `words` lists every word the question and its answer use, and it only shows once the child has met them
  all; a new zone's animals, colours and places can join the tables.

## Phrases: say it to get it (`src/phrases.js`, `docs/LEARNING_PLAN_2.md` Phase 2)
A phrase is a frame with a slot for a word she knows (*Quiero ___* + *el helado* = *Quiero un helado*). The six
patterns are in `content/es/words.js` (`C.phrases`, in `C.phraseOrder`): `f_llamo`, `f_quiero`, `f_porfavor`,
`f_donde`, `f_gusta`, `f_tengo`, each `{ es: 'Quiero ___', en, say: 'quiero / yo quiero / quisiera / me das'` (every
way the mic accepts the frame), `art: 'un'` (the slot's article: *Quiero un helado*, *¿Dónde está el gato?*; `C.mass`
words take none: *Quiero pan*), `plural`, `prompt`, `reply`, `icon`, `anySlot` (any word goes: a name), `polite` (the
frame is "por favor", heard anywhere)`}`. A phrase is an item of the word model (stages, boxes, slipping, history, its
card), so nothing else is needed to count it.

**A phrase moment** is one call in a talk script. It returns null when phrases are off or the pattern can't be
introduced right now (one was introduced in the last 4 minutes of play, or a word of the moment is brand new): the
script then does what it did before, so write the old way after it:
```js
const got = yield* G.phrase.quiero('pepe', ['manzana', 'pan'], {   // "¿Qué quieres?": these words' cards, any of them
  cancel: true,                                                      // a way out (the back button)
  onGet: function* (k, res) {                                        // they do it: k is the slot she asked for
    G.errands.bag.add(['manzana', 'pan'][k]);
    yield G.say(['¡Aquí tienes!'], { who: 'pepe', portrait: G.portraitOf('pepe'), name: G.nameOf('pepe') });
  } });
if (!got) { /* the old way: G.choose / G.ask / just give it */ }
yield* G.phrase.tengo('rosa', 'flor', { onGet: give });   // "¿Qué tienes?": the one she holds is right (two others)
yield* G.phrase.donde('nico', ['gato', 'perro'], show);     // "¿Dónde está el gato?": any of them
yield* G.phrase.request('f_gusta', { who: 'lola', slots: ['oso', 'pato', 'rana'], free: true,
  prompt: '¿Qué animal te gusta?', en: 'Say "Me gusta el..."', onGet });   // any pattern
```
- `onGet(k, res)` runs once she has asked (the whole phrase, the key word alone, the slot + "por favor", or built with
  taps); then, after the key word alone, she is invited to say the whole thing (one try, never in the way). `res.how` is
  `'full'`, `'key'`, `'polite'` or `'built'`; `res.again` when she said it whole after the invitation; `{cancel: true}`
  when she backed out.
- Slots: a word id (met, with a picture), `{ name: true }` (her name), `{ face: 'nico', es: 'Nico' }`, or a thing that
  isn't a word yet: `{ id: 'pay', es: 'el pay', icon: 'pay', alt: 'pay / pai / pastel' }` (heard, never counted).
  `free: true`: any slot is right; `answer: i`: only that one (the others wobble). `more: [ids]`: heard too, without a
  card (Lola's question: any album animal). `show: id`: a picture held up over the question.
- The first time a pattern comes up anywhere, `G.phrase.ready` (inside `request`) shows the two friends modelling it and
  "¡Ahora tú!"; a pattern missed 3 times is modelled again (the key word alone is neutral for the phrase: neither right
  nor a miss; the slot word keeps its credit).
- The mic's matching is `G.speech.matchPhrase(frameId, slotTargets, alternatives)`. A new way to say a frame goes in its
  `say`; add a line to the must-pass (or must-fail) list in `tools/test-phrases.js`.
- Tests keep phrases off unless they ask: `open(browser, name, touch, { phrases: true })` (`tools/harness.js`) or
  `PHRASES=1`; `drive()` plays a request through (taps the frame card and a word card) and taps through a modelling strip.

## Listen and do (`src/requests.js`, `src/listen.js`, `docs/LEARNING_PLAN_2.md` Phase 3)
A friend asks for something out loud ("Dame dos flores amarillas.", "Toca el perro grande.", "¿Cuántas conchas hay?"),
written with no pictures for its words, and she does it on a tray of pictures (a tap, or counting into a basket) or, for
a world request, picks the things up on the map and brings them. Requests are made by `G.requests` from the words she
knows (stage 2+), so content only says **who asks about what**: a person's **board** in `G.requests.SPECS` (a zone file
can add one):
```js
G.requests.SPECS.rosa = { things: {             // Rosa's farm: each thing (a word id) and what can vary
  huevo: { count: 1 },                          // counted: "Dame tres huevos.", "¿Cuántos huevos hay?"
  flor: { cols: ['rojo', 'amarillo', 'blanco'], count: 1 },   // its colours (colour word ids): "Dame la flor amarilla."
  gallina: { sizes: 1, animal: 1 },             // big and small: "Toca la gallina grande."
} };
G.requests.SPECS.lola = { carry: 1, places: { playa: { concha: { cols: [...], count: 1 } }, bosque: {...} } };
// carry: 1  a world request (the things appear on the map around them; 1-3 of a kind: the hands hold three)
// places    a board per zone (the board of the place she's in; none elsewhere)
// a thing:  cols (colours), sizes: 1 (big and small: "el hongo grande"), count: 1 (numbers), animal: 1 (Toca... /
//           ¿Dónde está...? instead of Dame)
```
- **Then offer it as a favour**: `G.favores.OFFERS.push(['rosa', 'listen', null, () => cond])` (two requests on the
  tray, a star and a heart) or `'carry'` (a world request); the 4th entry is an optional condition (a zone visited, a
  chapter done). The day's due word of the board picks it; listen and carry favours are two a day at most, in all (an
  ear in the bubble). The kinds are plugged into `src/favores.js` by `src/listen.js` (`FV.KIND / BUBBLE / ON / REMIND /
  TARGETS / PICK / OFF / GROUP / CAP`): a new kind of favour plugs in the same way.
- **In a talk script**, a round on a board: `yield* G.listen.round(G.requests.spec('rosa'), { who: 'rosa', focus: 'huevo',
  n: 2 })`; one request: `const req = G.requests.make(spec, { focus, tpl: 'col' }); const res = yield* G.listen.run(req,
  { who: 'rosa' })` (`res.ok`, `res.first`; `null` from `make` when she doesn't know enough of the board yet: do
  something else).
- **The grammar is the word's**: the gender from its article in `es` (*la manzana*; *los guantes* is plural-only), the
  plural from its `pl` if the rules would get it wrong (they know *peces, lápices, ratones, jóvenes, colibríes, los
  lunes, estrellas de mar*), a feminine noun with "el" in `G.requests.FEM_EL` (*el águila*, *un águila*), a colour's
  feminine after the slash (*rojo / roja*); *uno* is *un* / *una* before a noun (its `alt` lets the mic hear *una*). A new sentence shape: add it to
  the must-pass list in `tools/test-listen.js`.
- **A coloured thing needs a picture that takes a colour**: its icon reads `w.col` (`src/icons.js`: *manzana*,
  *platano*, *concha*, *hoja*, *flor*, *gorro*...). Big and small are drawn by the tray (twice the size).
- **What counts**: the tray is built so each word is needed (a word is *tested* only when a picture differs from the
  right one in that word alone); each tested word gets one 'listen' retrieval per request (`answerRight(id, {mode:
  'listen'})`, history letter **L**, l after a miss; it never makes a word gold); a wrong answer is a miss only of the
  word whose detail was wrong. Content never credits by hand.
- Tests keep listen-and-do off unless they ask: `open(browser, name, touch, { listen: true })` (`tools/harness.js`) or
  `LISTEN=1`; `drive()` does each request right (taps the right picture, counts into the basket, taps the right number).

## Side jobs, presents and the shops (`src/errands.js`)
1. A side job is a place in `SPOTS`: `{ id, map, at: [x, y], icon: () => picture or null when inactive, run: function* (f) {...} }`
   (a picture bubble over the tile; a tap walks there and runs it; `quiet: true` draws no bubble, `nohint()` keeps the
   hint hand away). Open it with the chapter that teaches its words (`chDone('c11')`), finish it with `jobStar(f, id, x, y)`
   (once a day) and add it to `E.JOBS` / `E.JOB_ICON` for Misiones (in the grown-ups menu).
2. Things to carry go in the bag, which is the child's hands (`src/carry.js`: held up over their head, shown in the
   corner): `G.errands.bag.add('carta', { q: 'c10', to: 'casa' })` / `take(...)`. A chapter's things carry `q` (they
   can't be put down or given away by a tap); things without `q` are the child's own: one kind at a time (a stack of up
   to three), given as presents (`G.hearts.LIKES`) or to Canelo. Adding a free thing of another kind puts what the child
   held down beside them (nothing is lost).
3. The older errands (`D.quests` in `src/data.js`: the market, the picnic, the show...) never open now; they only show
   their badges in older games that earned them.

(No saving code needed: the game saves itself after every conversation. Code that changes `G.state` outside one, say on a timer, calls `G.st.autosave()`, or `G.st.saveNow()` to write at once.) A character's `alert: () => ...` returns `true` for a "!" bubble, a word id to show its picture, or a goal like `[['manzana', 3]]` to show what they want.

## A thing to pick up and carry (`src/carry.js`)
Children asked for it ("I want to be able to pick up stuff"): things lie about, a tap walks you there and picks it up,
you hold it up over your head, and you give it to Canelo or to someone by tapping them.
- **Where things are**: an entry in `G.carry.SOURCES`:
  ```js
  { id: 'manzana1', map: 'villa', at: [12, 19], item: 'manzana', every: 150, tree: [12, 18] }, // back 150 s of play after it's picked
  { id: 'hueso', map: 'casa', at: [6, 5], item: 'hueso', every: 'day' },                       // a new one every morning
  { id: 'pelota', map: 'villa', at: [7, 19], item: 'pelota', col: 'azul', every: 60, unique: true }, // one ball: back when it's nowhere
  { id: 'carta', map: 'villa', at: [21, 14], item: 'carta', every: 'day', when: () => G.chapters.done('c10') },
  ```
  `col` is a colour word (its picture is drawn in that colour); `hidden: true` when the tile itself shows it (the barn's
  basket of apples); `tree` draws apples on that tree tile. Keep sources off chapter places, find-its, page sparkles,
  side-job spots and hide-and-seek spots, on ground you can walk next to.
- **The word**: picking it up says its name in the word bubble with its picture (`G.world.name`): a met word is
  picture + word (a light encounter, the say-it-back mic), an unmet one its picture and "?" and is never met this way
  (the budget is untouched). A thing with no word (the stick, `palo`) is a toy: give it a picture in `src/icons.js`
  (`DRAW`) and nothing else. Never add a word just to make something carryable: words come with chapters.
- **What Canelo does with it**: `G.carry.DOG[id]` = `'fetch'` (thrown from your hands, he brings it back), `'eat'`,
  `'drink'`; anything else he sniffs and gives back. **Who likes it**: `G.hearts.LIKES` (their bubble shows it while you
  hold it; they take it for a heart); anyone else looks at it and says who would love it, with that friend's face.
- **Putting down**: a tap on yourself, or on the thing in the corner, puts it down in front of you; it stays there
  (saved in `G.state.bag.ground`) until picked up again.
- **A story step that is really "bring it"** is best a carry: put the chapter's thing in the hands
  (`G.errands.bag.add('manzana', { q: 'c4' })`), give the person a `who:` beat with `bubble: 'manzana'` (their bubble
  shows it, the guide's arrow goes to them), and keep the question in that beat (chapter 4: Don Pepe's apple for Rosa).

## The day's play: never a dead end (`G.carry.plan`, `src/guide.js`)
When the story has nothing for now (between chapters, today's new words used up, a chapter that opens in the morning or
in the evening), the guide still points at something: favours, hide-and-seek, Canelo's "?", side jobs and presents
first, then the day's play: what you hold goes to whoever would love it today (or Canelo, or the ducks); empty-handed,
today's next play from `G.carry.ORDER` (fetch with the ball, an apple for Luna or Gómez, a flower for Mamá, Rosa or
Lucía, the bone for Canelo, a stick, an egg for Rosa, Tomás's letter, bread from Marta for the ducks, a page puzzle), in
an order that turns each day; when they're all done, the next goal turns (`G.carry.more`: a trick for Canelo, petting him, food or water, another round of hide-and-seek, the ball for Nico, fetch; the one played least today first). A new play is an entry
in `G.carry.PLAYS` (`id: f => ({ why, map, at, icon } | { why, who } | null)`) and in `ORDER`. Every play must be
word-safe (no new word, nothing that waits for a word that isn't met) and end in something a child enjoys (a heart, the
dog's joy). The next chapter's giver meanwhile sleeps under a moon ("z z": after the night) or shows the moon alone
(tonight); at sunset the arrow goes home, and at home to the bed (a tap on it is good night).

## A notebook page
Add it to `C.pages` / `C.pageOrder` in `content/es/words.js` (its topic in `C.topics`), at most 9 words (10 for the numbers, drawn in four columns). A word is written in the notebook the moment it's met, and a topic's page shows once its first word is. To put a **page puzzle** in the world, place the page's sparkle in `C.pagePlaces` (`map: { 'x,y': 'pageId' }`): it shows once 4 of the page's words are known (stage 2) and were met in an earlier session; solving it (matching 4 pictures to their words) grows each word's card and counts as a review; it comes back on a later day when 2+ of its words are due again (`G.pages.ready(id)`).

## Maps
Edit `tools/mapgen.py` and run `python3 tools/mapgen.py` to regenerate `src/mapdata.js`. Tile codes are listed in `G.TERRAIN` in `src/tiles.js`. Doors (`D`, `K`) become exits in `src/maps.js`.
- **Every door opens** (docs/PLAYTEST_NOTES.md: a closed door is a disappointment). `tools/test-barn.js` fails for a
  `D` / `K` tile in town that isn't an exit. A door that can't be used *just now* says why before the player steps
  back off it, in the exit's `run` (return `false` to stay): a person's line (`stepBack(f, dir)` in `src/maps.js`, then
  `say(...)`, like Mamá's *¿Y el perro?* while chapter 1's puppy is hiding), or a chapter's `door:` beat. Never a
  silent refusal.
- **The barn** (`G.maps.granja`, the `granja` grid in mapgen.py): its own tiles are `z` (straw floor), `V` / `C`
  (plank wall / with a window), `H` (square hay bales), `E` (nest boxes with a perch on top), `U` (the trough), `m` (a
  milk can), `A` (a basket of apples); fences (`F`) and barrels (`k`) work indoors too. A map's `poke(f, x, y)`
  (true = handled) answers A or a tap on a thing without a word (the hay rustles) instead of "...".

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
3. Give it a home in a map definition: `animals: [{ kind: 'id', n: 2, area: 'tag' }]`, where `tag` is a `[x, y, w, h]` area added in `tools/mapgen.py` (`t.pos['tag'] = [...]`). `tint: 1` gives it its second look (`TINT` in animals.js: the white hen, the cream horse); `perch: 6` sits one on each tile of the area, pinned, its feet 6 px down the tile (the barn's hens on their perch). The ground animals walk on is `LAND` (grass, paths, the plaza, the barn's straw).
Tapping it then does the rest: its reaction, the word bubble with its sound, the album (`G.state.album[id]`) and say-it-back. An animal drawn elsewhere (like the birds in ambient.js) calls `G.animals.tap(id, x, y)` when tapped.

## Hide-and-seek (`src/seek.js`)
Once a day (when no chapter is going on) Nico's magnifying-glass bubble starts *¿Dónde están?*: two or three animals
whose words are **met** hide (`G.seek.KINDS`; one in the barn when it fits), peeking out, and the child taps them: a
star, the name (the say-it-back mic), a review question when the word is due. Nothing is introduced, so the budget is
untouched. A hiding place is an entry in `G.seek.SPOTS`:
```js
{ id: 'tejado', map: 'villa', at: [30, 4], how: 'sit', y: 9, kinds: ['gato'], place: 'panaderia' },     // sitting on top, all of it showing
{ id: 'paja', map: 'villa', at: [45, 4], how: 'over', cut: 6, dx: 2, kinds: ['gallina', 'conejo'], place: 'granja' }, // behind it: peeks over a line cut px down the tile
```
`place` is the picture Nico holds up as a hint; Canelo's trail of paw prints (after ~15 s with nothing found) leads to
the nearest one. A hiding animal's own self on the map is away meanwhile (`G.seek.hides(f, a)`, read by animals.js and
the cat's `hid` in ambient.js). Keep spots off chapter places, page sparkles and side-job tiles, and check new ones by
screenshot (`tools/test-barn.js` shoots each one it finds).

## Hearts, greetings and Canelo (`src/hearts.js`, `src/pet.js`)
- A townsperson's talk starts with `yield* hello('id')` (maps.js): their once-a-day voice greeting (from chapter 3 on; the right one for the time of day, *buenos días* early in a session, *buenas noches* after sunset, else *hola*, each once it's met; then one word that's due from that person's pool, `G.hearts.POOLS`) and any 3- or 5-heart surprise. Use `say(who, ...)` so their hearts show over the portrait.
- Hearts: `G.hearts.add(npc, n, why)` (`'greet'`, `'gift'`, `'care'`, `'errand'`, `'trick'`), then `yield* G.hearts.milestones(npc)`. `finishQuest(id)` already gives the giver +2. A new town person needs adding to `G.hearts.TOWN` (and `LIKES`, `POOLS`); a zone's new person to `G.hearts.ZONE` (`npc: '<zone>'`), `LIKES` and `POOLS` (their zone's words): `src/connect.js` then wraps their talk (the greeting after their zone's chapter 1, a letter for them, a present's bubble) and gives them a 3-heart secret (a rare animal of their place), and the Amigos page lists them on their place's tab.
- Tomás's letters (`G.post`, `src/connect.js`): a zone's new person can receive letters by joining `G.post.FROM` (`npc: '<the town friend who writes to them>'`); delivering is automatic in their talk.
- A 3-heart secret of your own: `G.hearts.secrets.rosa = function* () { ... }`.
- Canelo: `G.pet.knows('salta')`; `yield* G.pet.command('salta')` asks "¡Dile a Canelo!" and he does it; `yield* G.pet.play('fetch')` for any of his animations (`sit come paw jump spin sniff huh eat drink fetch pet dance wake`). His six tricks are taught by chapters 1, 3, 14, 16 and 17 (set `G.pet.state().tricks[id] = 3` after the third try). A new trick: its word (with a picture) in `content/es/words.js`, an entry in `G.pet.TRICKS` (`{id, by, anim, story: true}`), an animation case in `pose()`, and room in the menu's top row (`rect(k)`).
- The album's gold star: `G.album.count('pato')`.
- Who likes what as a present: `G.hearts.LIKES` (errands.js offers it when you carry it).

## A new screen
Most play is on an iPad, so every screen works with taps as well as keys:
- Read taps with `G.tapIn(x, y, w, h)` (this frame's tap, in game pixels). Touch targets are at least 20×20 game pixels.
- A screen that waits for A also goes on with a tap; one that waits for B shows a back or close button (`G.iconBtn(ctx, 'back', x, y)` drawn, `G.btnHit(x, y)` tested).
- Spoken lines get the speaker button (`G.speakerBtn`), same as C.
- A screen that the test harness should simply close when it pops up mid-drive (like the pet menu) returns its close button from `closeXY()` and is listed in `Game.drive` in `tools/harness.js`.
- Give the screen `hintXY()` returning `[x, y]` if a stuck child should be shown where to tap (the hand in `src/hint.js`). Never point at a right answer. On the map the hand follows the guide's goal (`src/guide.js`).
- Children don't open menus to find out what to do: the kid's menu is only the notebook and the album, as pictures. Anything a child needs to do next belongs on the map (a bubble, the guide's arrow), not in a menu; overviews for grown-ups (Misiones) go in the grown-ups menu.
- Never only words for "not now": a person whose thing comes later shows it (a moon bubble, "z z", the sleeping picture held up), and the guide points at something to do meanwhile.
- Ripples, bursts and confetti come from `G.fx` (`src/fx.js`); they're drawn above every screen, so a screen doesn't draw its own.

## Language checklist
- Use Mexican / Latin American Spanish: *presiona* (not *pulsa*), *ustedes* (not *vosotros*), *carro* (not *coche*), *jugo* (not *zumo*), *computadora* (not *ordenador*).
- Keep sentences short and in the present tense.
- The player picks boy or girl, so adjectives about the player should use `{o/a}`, never a fixed form.
- Introduce every new word with a puzzle (`G.intro.*`) and ask it again soon after (`G.review`).
- After adding words or an errand, run `tools/vocab-audit.js --quick --strict` and check `docs/VOCAB_AUDIT.md`: the measured targets should pass; every new word should be used (picked or said) soon after it's met and come back in later errands and days.
