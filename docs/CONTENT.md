# Adding content

## A new word
1. Add it to `D.words` in `src/data.js`:
   ```js
   perro: { es: 'el perro', en: 'the dog', topic: 'animales', icon: 'perro' },
   ```
   Include the article (*el/la/los/las*) for nouns. Adjectives that change form can show both, like `'rojo / roja'`. Speech and answer labels use the part before the `/`.
2. Add a picture to `DRAW` in `src/icons.js`. Each picture is a 16×16 function that paints with `p.disc`, `p.ell`, `p.rect`, `p.tri` and `p.shade`; the dark outline is added automatically. A word without a picture gets a plain placeholder tile.
3. For a new topic, add it to `D.topics` and `D.topicOrder` so it shows up in the Cuaderno.

## Teaching and asking
Inside any talk script (a generator in `src/maps.js`):
```js
yield G.teach(['perro', 'gato']);              // new-word cards (words already known are skipped)
yield* G.ask({                                 // repeats until right; returns true if right first try
  prompt: '¿Cuál es el perro?', en: 'Which one is the dog?',
  ...G.wordChoices('perro', ['perro', 'gato', 'pez'], 3, { noLabel: true }),
  layout: 'cards',                             // 'cards' = pictures in a row, 'list' = text menu
  word: 'perro', who: 'luna',
});
```
Write dialogue as `T('Spanish', 'English')`. Players see the Spanish and hold C for the English.

## A new errand
1. Add it to `D.quests` and `D.questOrder` in `src/data.js`.
2. In `src/maps.js`, give someone a talk script that calls `newQuest('id')`. Track progress in `G.state.flags`, then call `finishQuest('id')` to award the badge. Add a badge colour and icon in `BADGE_COL` / `BADGE_ICON` in `src/learn.js`.
3. Give the character an `alert: () => ...` function so a "!" bubble appears when they have something for the player.

## Maps
Edit `tools/mapgen.py` and run `python3 tools/mapgen.py` to regenerate `src/mapdata.js`. Tile codes are listed in `G.TERRAIN` in `src/tiles.js`. Doors (`D`, `K`) become exits in `src/maps.js`.

## Language checklist
- Use Mexican / Latin American Spanish: *presiona* (not *pulsa*), *ustedes* (not *vosotros*), *carro* (not *coche*), *jugo* (not *zumo*), *computadora* (not *ordenador*).
- Keep sentences short and in the present tense.
- The player, Alex, has no stated gender. Avoid adjectives that would assign one (for example, use "¡Te damos la bienvenida!" instead of "¡Bienvenido!"), or show both forms ("¿Listo? ¿Lista?").
- Make every new word appear in a question soon after it's taught.
