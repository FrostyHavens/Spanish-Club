# Club de Español

A 16-bit-style educational game for kids aged about 8 to 12 who are learning Spanish. There is no combat. You explore the sunny town of **Villa Sol**, talk with the townsfolk in Spanish and run errands for them. Every new word you learn goes into your notebook, with a picture.

It uses the same hand-drawn-in-code engine as *Embers of Aldmere*: pixel tiles, chibi map sprites, anime portraits and the FM-synth music.

## Play
- Open `dist/club-de-espanol.html` in any modern browser. It's a single file and works offline.
- Or open `index.html`, which loads the scripts from `src/`. Use this one when editing.

**Controls**
| Key | Action |
| --- | --- |
| Arrows / WASD | walk, choose |
| Z / Enter / Space | talk, search, OK |
| X / Esc | menu, back |
| **C (hold)** | **show the English translation** |
| M | sound on/off |

On phones and tablets, on-screen buttons appear.

## How it teaches
- **Mostly Spanish.** All dialogue, questions and answers are in Spanish. Holding **C** shows the English for whatever is on screen. *Opciones → Inglés siempre* keeps the English always visible, for younger players.
- **New-word cards.** Each new word pops up with a big picture, the Spanish word (nouns include *el/la*) and a small English gloss.
- **Pictures over translation.** Many questions show pictures, like "¿Cuál es la manzana?", or dice faces for numbers, so kids link the word to the meaning rather than to English.
- **Gentle retries.** A wrong answer gets "¡Casi! Inténtalo otra vez." and that choice is greyed out, so every question can be finished. Getting it right on the first try earns a ★.
- **Cuaderno (notebook).** Every word you've learned, by topic, with its picture, English, and up to three stars. Press A on a word to hear it.
- **Spoken Spanish (North American).** If the device has a Spanish voice, lines and words are read aloud. The game picks a Mexican voice first, then US Spanish, then other Latin American voices, and uses Spain's only if nothing else is installed. *Opciones* shows which voice is in use; you can turn speech off there.
- **Latin American wording.** The text uses Mexican/Latin American Spanish (for example *presiona*, not *pulsa*).
- **"!" bubbles** float over anyone who has something for you, so kids always know where to go next.

## Content (version 1)
| Errand | Who | Teaches |
| --- | --- | --- |
| Intro | Mamá | buenos días, adiós |
| Saludos: greet 3 people | Profesora Luna | hola, ¿cómo estás?, bien, gracias, la escuela |
| El mercado: 3 apples and 2 bananas | Abuela Rosa, Don Pepe | uno–cinco, la manzana, el plátano, la naranja, las uvas, por favor, la casa |
| La pelota roja: find the red ball | Sofía | rojo, azul, verde, amarillo, el parque |
| La carta: deliver a letter | Tomás, Marta, Inés | la carta, la panadería, el pan, la biblioteca |
| La fiesta: 5-question review and a diploma | Profesora Luna | review |

That's 27 words in 5 topics, with 5 badges and a diploma at the end. Progress is saved in the browser (*menu → Guardar*).

## Project layout
- **Engine (shared with Embers of Aldmere):** `src/core.js`, `src/gfx.js` (bitmap font, with Spanish letters added), `src/ui.js` (dialogue with English help, menus), `src/audio.js`, `src/music.js`, `src/tiles.js`, `src/sprites.js`
- **Learning:** `src/data.js` (vocabulary, topics, errands, characters), `src/icons.js` (word pictures), `src/learn.js` (word cards, picture choices, retries, badges), `src/state.js` (progress, save)
- **Game:** `src/field.js` (exploring), `src/menus.js` (Cuaderno, Misiones, Guardar, Opciones), `src/maps.js` (townsfolk and errands), `src/story.js` (opening, party, diploma), `src/main.js` (title)
- **Maps:** `tools/mapgen.py` generates `src/mapdata.js`
- **Build:** `python3 tools/build.py` rebuilds the single-file `dist/` version

See `docs/CONTENT.md` for how to add words, characters and errands.
