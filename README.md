# Club de Español

A 16-bit-style educational game for kids aged about 8 to 12 who are learning Spanish. There is no combat. You explore the sunny town of **Villa Sol**, talk with the townsfolk in Spanish and run errands for them. Every new word you learn goes into your notebook, with a picture.

It uses the same hand-drawn-in-code engine as *Embers of Aldmere*: pixel tiles, chibi map sprites, anime portraits and the FM-synth music.

## Play
- **Play online: https://frostyhavens.github.io/Spanish-Club/** (updates automatically when `main` changes).
- Open `dist/club-de-espanol.html` in any modern browser. It's a single file and works offline.
- Or open `index.html`, which loads the scripts from `src/`. Use this one when editing.

**Controls**
| Key | Action |
| --- | --- |
| Arrows / WASD | walk, choose |
| Z / Enter / Space | talk, search, OK |
| X / Esc | menu, back |
| C | hear the line again |
| M | sound on/off |

On phones and tablets, just tap: tap a spot to walk there, tap people to talk to them (and doors, signs or a sparkle to go or look there), tap a picture card to answer, tap the speaker to hear a line again, and the notebook button in the corner opens the menu. Every screen can be played with taps or with the keys.

## How it teaches (like *Tunic*: you start knowing almost nothing)
- **No translations.** Characters speak short, simple Spanish. Meaning comes from pictures, context and what people do. (Grown-ups can turn on English in *Opciones → Inglés (padres)*.)
- **Words grow from pictures.** A vocabulary word you haven't learned yet appears as its picture next to the Spanish, shown in blue: 🍎 *manzana*. Once you've used it correctly, the picture drops away and the word turns **gold**. Sentences get more readable as you learn.
- **Learning by doing.** Seeing a word only marks it as *seen*. It counts as *learned* when you use it: answering Mamá's "¡Hola!", telling Don Pepe which fruit you want, or saying "sí" or "no" when someone holds up a picture. Then a "¡Palabra nueva!" card celebrates it.
- **Gentle mistakes.** A wrong choice shakes and greys out, with no lecture, so every question can be finished. Getting it right on the first try earns a ★.
- **A notebook you fill in.** The Cuaderno starts empty. Its five picture pages are hidden around town (look for the sparkle) and handed out by people. Each word shows `? ? ?` until it's seen, blue once seen, and gold with stars once learned.
- **Requests in pictures.** People who need something show it in a thought bubble (🍎🍎🍎 🍌🍌, a red ball, a letter going to the bakery). New errands appear as a picture card, and *Misiones* is all pictures. Doors have picture signs.
- **Make your character.** A new game starts by choosing **niño** or **niña**, then skin tone, hairstyle (6), hair color and outfit color, with a live preview of the walking sprite and portrait. A dice button picks a random look. Then **type your name** (keyboard, or the on-screen letter grid with Ñ and accents for touch screens); characters call you by it. The controls are then shown as pictures.
- **Spanish that matches you.** Townsfolk use the boy or girl form of words for the character you chose: *¡Bienvenido!* or *¡Bienvenida!*, *¡Qué listo!* or *¡Qué lista!*, *Eres un gran cartero* or *Eres una gran cartera*.
- **Spoken Spanish.** Lines and words are read aloud with a North American voice when the device has one (Mexico first, then the US, then other Latin American voices). Press **C** to hear the current line again. *Opciones → Elegir voz* picks a different voice.
- **Separate volumes.** *Opciones* has sliders (0–10) for **Música**, **Sonidos** and **Voz**. Use left/right to adjust; Voz at 0 turns speech off. They're saved on the device, separately from game saves. M still mutes everything.
- **Repaso.** After the party, Profesora Luna offers a replayable review that focuses on words you've seen but not yet learned.

## Content (version 1)
| Errand | Who | Words used |
| --- | --- | --- |
| Morning at home | Mamá | hola, buenos días, adiós, plus the *Saludos* page |
| Saludos: greet 3 people | Profesora Luna, Sr. Gómez, Lucía, Nico | ¿cómo estás?, bien, gracias |
| El mercado: 3 apples and 2 bananas | Abuela Rosa, Don Pepe | sí, no, manzana, plátano, tres, dos, por favor |
| La pelota roja: find the red ball | Sofía | rojo (through sí/no), pelota, azul |
| La carta: deliver a letter | Tomás, Marta, Inés | carta, panadería, pan |
| La fiesta: review game and diploma | Profesora Luna | words seen but not yet learned |

That's 30 words in 5 topics, with 5 notebook pages, 5 badges and a diploma. Progress is saved in the browser (*menu → Guardar*).

## Project layout
- **Engine (shared with Embers of Aldmere):** `src/core.js`, `src/gfx.js` (bitmap font, with Spanish letters added), `src/ui.js` (dialogue with English help, menus), `src/audio.js`, `src/music.js`, `src/tiles.js`, `src/sprites.js`
- **Learning:** `src/data.js` (vocabulary, notebook pages, errands, characters), `src/icons.js` (word pictures), `src/learn.js` (picture questions, learning by doing, word cards, errand cards, badges), `src/state.js` (seen/learned words, pages, save). Picture-words in dialogue are drawn by the rich text in `src/ui.js`.
- **Game:** `src/field.js` (exploring), `src/menus.js` (Cuaderno, Misiones, Guardar, Opciones), `src/maps.js` (townsfolk and errands), `src/story.js` (opening, party, diploma), `src/main.js` (title)
- **Maps:** `tools/mapgen.py` generates `src/mapdata.js`
- **Build:** `python3 tools/build.py` rebuilds the single-file `dist/` version
- **Smoke test:** `NODE_PATH=$(npm root -g) node tools/smoke.js [screenshot dir]` plays the opening with taps on an iPad-sized touch screen and with the keyboard on a desktop (needs Playwright with Chromium installed globally)

See `docs/CONTENT.md` for how to add words, characters and errands.
