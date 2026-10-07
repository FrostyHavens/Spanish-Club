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

**Saving is automatic.** The game saves by itself all the time (new words, pages, errands, every finished conversation, a new map, every 15 seconds and when the tablet goes to sleep). Tap the title to play: the first time it goes straight to making a character; after that *¿Quién juega?* shows three save slots (face, name, words learned, stars). Tap a card to continue, or *+ Nuevo* to start another child's game. To delete a slot, hold its little trash can for 3 seconds, then choose ✓.

**Grown-ups menu:** hold the gear for 2 seconds (in the menu, or on the title; on a keyboard, move onto it and hold Z). It has Music / Sounds / Voice volume, Choose voice, English help, on-screen buttons (a D-pad with A/B/C), a microphone test, controls and tips, and Back to title.

## How it teaches (like *Tunic*: you start knowing almost nothing)
- **No translations.** Characters speak short, simple Spanish. Meaning comes from pictures, context and what people do. (Grown-ups can turn on *English help* in the grown-ups menu.)
- **Words grow from pictures.** A vocabulary word you haven't learned yet appears as its picture next to the Spanish, shown in blue: 🍎 *manzana*. Once you've used it correctly, the picture drops away and the word turns **gold**. Sentences get more readable as you learn.
- **Learning by doing.** Seeing a word only marks it as *seen*. It counts as *learned* when you use it: answering Mamá's "¡Hola!", telling Don Pepe which fruit you want, or saying "sí" or "no" when someone holds up a picture. Then a "¡Palabra nueva!" card celebrates it.
- **Gentle mistakes.** A wrong choice wobbles and greys out with a soft boop, with no lecture, so every question can be finished. A right answer pops with a chime; getting it right on the first try earns a ★ that flies up to the corner.
- **A notebook you fill in.** The Cuaderno starts empty. Its five picture pages are hidden around town (look for the sparkle) and handed out by people. Each word shows `? ? ?` until it's seen, blue once seen, and gold with stars once learned.
- **Requests in pictures.** People who need something show it in a thought bubble (🍎🍎🍎 🍌🍌, a red ball, a letter going to the bakery). New errands appear as a picture card, and *Misiones* is all pictures. Doors have picture signs.
- **Make your character.** A new game starts by choosing **niño** or **niña**, then skin tone, hairstyle (6), hair color and outfit color, with a live preview of the walking sprite and portrait. A dice button picks a random look. Then **type your name** (keyboard, or the on-screen letter grid with Ñ and accents for touch screens); characters call you by it. The controls are then shown as pictures.
- **Spanish that matches you.** Townsfolk use the boy or girl form of words for the character you chose: *¡Bienvenido!* or *¡Bienvenida!*, *¡Qué listo!* or *¡Qué lista!*, *Eres un gran cartero* or *Eres una gran cartera*.
- **Spoken Spanish.** Lines and words are read aloud with a North American voice when the device has one (Mexico first, then the US, then other Latin American voices). Press **C** to hear the current line again. *Choose voice* in the grown-ups menu picks a different voice.
- **Separate volumes.** The grown-ups menu has sliders (0–10) for **Music**, **Sounds** and **Voice**: tap a level or slide a finger along it (left/right on a keyboard); Voice at 0 turns speech off. They're saved on the device, separately from game saves, like the voice, English help and on-screen buttons. M still mutes everything.
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

That's 30 words in 5 topics, with 5 notebook pages, 5 badges and a diploma. Progress saves itself in the browser, in three save slots.

## Project layout
- **Engine (shared with Embers of Aldmere):** `src/core.js`, `src/gfx.js` (bitmap font, with Spanish letters added), `src/ui.js` (dialogue with English help, menus), `src/audio.js`, `src/music.js`, `src/tiles.js`, `src/sprites.js`
- **Juice:** `src/fx.js`, a particle layer drawn over every screen: tap ripples, star bursts for right answers, the first-try star flying to the corner counter, confetti for new words and badges, dust when you start walking
- **Learning:** `src/data.js` (vocabulary, notebook pages, errands, characters), `src/icons.js` (word pictures), `src/learn.js` (picture questions, learning by doing, word cards, errand cards, badges), `src/state.js` (seen/learned words, pages, save slots and autosave). Picture-words in dialogue are drawn by the rich text in `src/ui.js`.
- **Game:** `src/field.js` (exploring), `src/ambient.js` (the living town: birds, butterflies, a cat, Canelo tagging along, people who look at you, Tomás's mail round), `src/menus.js` (Cuaderno, Misiones, the grown-ups menu), `src/maps.js` (townsfolk and errands), `src/story.js` (opening, party, diploma), `src/main.js` (title, save slots)
- **Speaking (being tested):** `src/speech.js` listens for a Spanish word with the browser's speech recognition and scores what it heard (`G.speech.listen`, `G.speech.match`); `src/mictest.js` is the grown-ups' microphone test (`G.micTest()`), which shows what the device heard and logs whether the game's voice still works after the mic. On iPad it needs Safari with Dictation turned on (*Settings → General → Keyboard → Enable Dictation*).
- **Maps:** `tools/mapgen.py` generates `src/mapdata.js`
- **Build:** `python3 tools/build.py` rebuilds the single-file `dist/` version
- **Smoke test:** `NODE_PATH=$(npm root -g) node tools/smoke.js [screenshot dir]` plays the opening with taps on an iPad-sized touch screen and with the keyboard on a desktop (needs Playwright with Chromium installed globally). `tools/test-saves.js` tests save slots, autosave and the grown-ups menu; `sh tools/test-all.sh` runs every test
- **Speech test:** `NODE_PATH=$(npm root -g) node tools/test-speech.js [screenshot dir]` checks the word matching in plain Node and drives the mic test with a fake recognizer

See `docs/CONTENT.md` for how to add words, characters and errands.
