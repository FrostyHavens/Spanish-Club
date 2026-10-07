# Adding content

## A new word
1. Add it to `D.words` in `src/data.js`:
   ```js
   perro: { es: 'el perro', en: 'the dog', topic: 'animales', icon: 'perro' },
   ```
   Include the article (*el/la/los/las*) for nouns. Adjectives that change form can show both, like `'rojo / roja'`. Speech and answer labels use the part before the `/`.
2. Add a picture to `DRAW` in `src/icons.js`. Each picture is a 16×16 function that paints with `p.disc`, `p.ell`, `p.rect`, `p.tri` and `p.shade`; the dark outline is added automatically. A word without a picture gets a plain placeholder tile.
3. For a new topic, add it to `D.topics` and `D.topicOrder` so it shows up in the Cuaderno.

## Writing dialogue
Write dialogue as `T('Spanish', 'English')`. The English only shows with the parents' option on, so the Spanish has to work alone:
- Keep it to a few words. Let pictures and actions carry the meaning.
- Mark vocabulary words with `[id]`, or `[id:shown form]` for a plural or other form: `'[tres] [manzana:manzanas], ¿[porfavor]?'`. An unlearned word draws its picture beside it in blue; a learned word is gold.
- Plain words (grammar, names) are fine. They're understood from context.
- Write `{name}` for the player's name and `{boy form/girl form}` for words that change with the character's gender: `'¡Bienvenid{o/a}, {name}!'`, `'Eres un{/a} gran carter{o/a}.'` These work in dialogue, questions and the English text.

## Teaching = asking
A word is learned by **using** it, never by being told. Inside a talk script (a generator in `src/maps.js`):
```js
yield* G.ask({                                  // repeats until right; returns true if right first try
  prompt: '¿Qué quieres?',
  ...G.wordChoices('perro', ['perro', 'gato', 'pez'], 3),
  layout: 'cards',                              // 'cards' = picture cards, 'list' = menu
  learn: 'perro', who: 'luna',                  // learned (and celebrated) when answered correctly
});
yield* G.siNo('¿[perro]?', true, { show: 'perro' });   // a sí/no question about a picture
```
Choice options are `{ word: id }`, drawn as picture plus blue word until learned. Add `text: true` to show only the word (a recall test) or `pic: true` to show only the picture.

Use a word in a sentence or on a notebook page first (that marks it *seen*), then ask about it soon after.

## A notebook page
Add it to `D.pages` / `D.pageOrder` in `src/data.js`, then place it with `pages: { 'x,y': 'pageId' }` in a map definition. The tile sparkles until it's found by searching it.

## A new errand
1. Add it to `D.quests` and `D.questOrder` in `src/data.js`.
2. In `src/maps.js`, give someone a talk script that calls `newQuest('id')`. Track progress in `G.state.flags`, then call `finishQuest('id')` to award the badge. (No saving code needed: the game saves itself after every conversation. Code that changes `G.state` outside one, say on a timer, calls `G.st.autosave()`, or `G.st.saveNow()` to write at once.) Add a badge colour and icon in `BADGE_COL` / `BADGE_ICON` in `src/learn.js`.
3. Give the character an `alert: () => ...` function. Return `true` for a "!" bubble, a word id to show its picture, or a goal like `[['manzana', 3]]` to show what they want.
4. Open the errand with `newQuest('id')`, which shows the picture card for its `goal`.

## Maps
Edit `tools/mapgen.py` and run `python3 tools/mapgen.py` to regenerate `src/mapdata.js`. Tile codes are listed in `G.TERRAIN` in `src/tiles.js`. Doors (`D`, `K`) become exits in `src/maps.js`.

## A living map (`src/ambient.js`)
- `ambient: { birds: 8, butterflies: 5, cat: [x, y] }` in a map definition adds birds (on grass, paths and the plaza; they fly off when you come close or tap them, and come back later), butterflies over flower tiles (`o`) and a cat on a fence post.
- Everyone turns to look at the player within 2 tiles, and holds still for a moment while you come over. Add `noLook: true` to a character to stop that.
- `route: [[x, y, dir, wait], ...]` walks a character along the roads from stop to stop, pausing `wait` frames facing `dir` (Tomás's mail round). Talking stops them.
- `follow: () => flag` makes a character tag along behind the player while it's true, as a ghost that never blocks (Canelo, once you've talked to him: `G.state.flags.canelo`).

## A new screen
Most play is on an iPad, so every screen works with taps as well as keys:
- Read taps with `G.tapIn(x, y, w, h)` (this frame's tap, in game pixels). Touch targets are at least 20×20 game pixels.
- A screen that waits for A also goes on with a tap; one that waits for B shows a back or close button (`G.iconBtn(ctx, 'back', x, y)` drawn, `G.btnHit(x, y)` tested).
- Spoken lines get the speaker button (`G.speakerBtn`), same as C.
- Give the screen `hintXY()` returning `[x, y]` if a stuck child should be shown where to tap (the hand in `src/hint.js`). Never point at a right answer.
- Ripples, bursts and confetti come from `G.fx` (`src/fx.js`); they're drawn above every screen, so a screen doesn't draw its own.

## Language checklist
- Use Mexican / Latin American Spanish: *presiona* (not *pulsa*), *ustedes* (not *vosotros*), *carro* (not *coche*), *jugo* (not *zumo*), *computadora* (not *ordenador*).
- Keep sentences short and in the present tense.
- The player picks boy or girl, so adjectives about the player should use `{o/a}`, never a fixed form.
- Make every new word appear in a question soon after it's taught.
