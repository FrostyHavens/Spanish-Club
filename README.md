# Club de Español

A 16-bit-style educational game for kids aged about 7 to 12 who are learning Spanish. There is no combat. You explore the sunny town of **Villa Sol**, talk with the townsfolk in Spanish and run errands for them. Every new word you learn goes into your notebook, with a picture.

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
| V | the mic: say the answer out loud |
| hold Space | talk while the mic button is showing: hold, say it, let go (otherwise Space is OK) |

On phones and tablets, just tap: tap a spot to walk there, tap people to talk to them (and doors, signs or a sparkle to go or look there), tap a picture card to answer, tap the speaker to hear a line again, and the notebook button in the corner opens the menu. Every screen can be played with taps or with the keys.

**Saving is automatic.** The game saves by itself all the time (new words, pages, errands, every finished conversation, a new map, every 15 seconds and when the tablet goes to sleep). Tap the title to play: the first time it goes straight to making a character; after that *¿Quién juega?* shows three save slots (face, name, words learned, stars). Tap a card to continue, or *+ Nuevo* to start another child's game. To delete a slot, hold its little trash can for 3 seconds, then choose ✓.

**Grown-ups menu:** hold the gear for 2 seconds (in the map's menu next to Cuaderno and Misiones, or on the title; a ring fills while you hold; on a keyboard, move onto it and hold Z). It has Music / Sounds / Voice volume, Choose voice, English help, on-screen buttons (a D-pad with A/B/C, off unless you turn it on; remembered per device), **Speaking (mic)** (on by default where the browser can listen; greyed *not available* where it can't; remembered per device; off = no mic buttons anywhere and the game plays exactly as before), a microphone test (tap a word, tap the mic, say it, and see everything the device heard and whether it would pass; *Share log* opens the iPad share sheet, or *Copy log* copies it), controls and tips, and Back to title. There is no Save button: saving is automatic.

## How it teaches (like *Tunic*: you start knowing almost nothing)
- **No translations.** Characters speak short, simple Spanish. Meaning comes from pictures, context and what people do. (Grown-ups can turn on *English help* in the grown-ups menu.)
- **Words grow from pictures.** A word you haven't met yet is only its picture in a sentence (like *Tunic*'s unreadable text; the voice still says it). Once met it's its picture plus the word in blue (🍎 *manzana*); once you know it (picked right without a hint), just the blue word; once you remember it, the word turns **gold**. Sentences get more readable as you learn (`src/words.js`, `docs/LEARNING_DESIGN.md`).
- **Learning by doing.** A word is *met* in a little puzzle with one unknown (someone holds a thing up and names it, then *¿Qué es?* among words you know; watch it happen then do it; hear it and point; find the thing someone needs), and it flies into the notebook. Then it comes back: a minute or two later, later that day, the next day, two days later... (a small Leitner system), each time in a harder way: picture and word cards, then word cards under its picture, then listening for it or saying it. Remembering it turns it gold, with a big *¡Palabra de oro!* card.
- **Gentle mistakes.** A wrong choice wobbles and greys out with a soft boop, with no lecture, so every question can be finished. A right answer pops with a chime; getting it right on the first try earns a ★ that flies up to the corner.
- **A notebook you fill in.** The Cuaderno starts empty; each word is written in the moment it's met, and a topic's page appears with its first word. Words are blue, or gold once remembered, with 0-3 stars (known, remembered, solid); tap one to hear it. The sparkles around town are **page puzzles**: match 4 pictures of a page's words with their words (tap a picture then its word, or drag) for a star. A sparkle waits until you've met 4 words of its page, and comes back on a later day when its words are due again.
- **Requests in pictures.** People who need something show it in a thought bubble (🍎🍎🍎 🍌🍌, a red ball, a letter going to the bakery). New errands appear as a picture card, and *Misiones* is all pictures. Doors have picture signs.
- **Make your character.** A new game starts by choosing **niño** or **niña**, then skin tone, hairstyle (6), hair color and outfit color, with a live preview of the walking sprite and portrait. A dice button picks a random look. Then **type your name** (keyboard, or the on-screen letter grid with Ñ and accents for touch screens); characters call you by it.
- **Spanish that matches you.** Townsfolk use the boy or girl form of words for the character you chose: *¡Bienvenido!* or *¡Bienvenida!*, *¡Qué listo!* or *¡Qué lista!*, *Eres un gran cartero* or *Eres una gran cartera*.
- **Spoken Spanish.** Lines and words are read aloud with a North American voice when the device has one (Mexico first, then the US, then other Latin American voices). Press **C** to hear the current line again. *Choose voice* in the grown-ups menu picks a different voice.
- **Separate volumes.** The grown-ups menu has sliders (0–10) for **Music**, **Sounds** and **Voice**: tap a level or slide a finger along it (left/right on a keyboard); Voice at 0 turns speech off. They're saved on the device, separately from game saves, like the voice, English help and on-screen buttons. M still mutes everything.
- **Speaking for bonus stars.** Questions whose answer is a word have a big pink mic button in the bottom-right corner. Tap it (or press V, or hold Space while you talk and let go when done), and it turns blue and listens (green once it hears a voice); say the answer. Saying the right one counts as choosing it, plus a **speaking star**: the card glows blue, *¡Bien dicho!*, a sparkly sound, and a star with sound waves flies to the corner. Saying one of the other choices is just like tapping it (it greys out, gently). Nothing heard, or a word that isn't one of the choices: a listening ear and *¡Otra vez!*, with no penalty. Close is good enough (the same matching as the mic test), and there is no grammar checking. Tapping always works, even while it listens, so speaking never blocks anything. The *¡Palabra nueva!* card has the mic too: say the new word for one more speaking star. The Cuaderno shows a little mic on words said out loud, the *Hoy* card draws speaking stars with sound waves, and the diploma counts them. If the device blocks the mic (or Dictation is off), the mic buttons disappear for the rest of the session; turning *Speaking (mic)* on again in the grown-ups menu brings them back.
- **A hand shows where to tap.** No controls screen: if a child does nothing for a few seconds, a little hand taps where to go next (the puppy's hiding place, the door, the nearest person with a bubble, a line waiting to go on). Any touch or key hides it. On a keyboard, a strip shows Z / X / C once after chapter 1.
- **The end of the day.** After about 18 minutes of play the sun sets over Villa Sol and a moon bubble floats over home. Going home then: Mamá says *¡Buenas noches!*, a *Hoy* card shows the words learned and stars earned today, night falls, and a new morning starts with *¡Buenos días!* Nothing is forced; staying out to play is fine.

## The story in chapters (plan: `docs/CURRICULUM.md`)
The game is one story in 21 short chapters, played in order over about three weeks of 15-minute sessions. Each brings
0-5 new words, each met in a little puzzle with one unknown and used again within a few minutes; most of every later
chapter is older words coming back in the things people need. A new chapter opens when the last is done and the day
still has room for new words (about 6 a day; a review day when many words are still new); otherwise its giver shows a
sun coming up: *¡Mañana!* Misiones shows the chapter going on with its steps, or the next. When a new word hasn't come
back by itself a minute later, Canelo shows a "?": tap him and say or pick it.
1. **¡Un perro!** Mamá says *hola*; a puppy bursts through the door, hides under the table, barks *guau*, and comes when you say *¡ven!*: Canelo is yours.
2. **El gato de la cerca.** Canelo chases a butterfly to the park; Nico, his cat (*gato*, *miau*) and a sound game.
3. **¡Buenos días, Canelo!** *buenos días*, a bone (*hueso*) and Canelo learns *¡siéntate!*
4. **El juego de Don Pepe.** *sí* and *no* about Canelo and the cat, and an apple (*manzana*) for Abuela Rosa.
5. **La pelota roja.** Sofía's ball (*pelota*); the red one (*rojo*) is lost in the bushes.
6. **Pan para los patos.** Bread (*pan*), *gracias*, and feeding the ducks (*pato*, *cuac*) with Nico.
7. **¿Dónde está Canelo?** He runs off; the neighbours point the way: the park, a bench, the fountain, the farm, and a goat.
8. **La escuela de Luna.** Profesora Luna's school: ask three friends *¿cómo estás?* — *bien*.
9. **¡Buenas noches, Canelo!** The first evening: water (*agua*), his bed (*cama*), *buenas noches*.
10. **Tomás está cansado.** The tired mailman: three letters (*carta*), Rosa's house (*casa*), a horse (*caballo*) eats one, *adiós*.
11. **Los huevos de Rosa.** Her hens (*gallina*), eggs (*huevo*), a nest with *uno* and one with *dos*, the white hen (*blanco*); a hen runs off and comes back on *¡ven!*
12. **El mercado de Mamá.** Mamá's list at Don Pepe's: bananas and oranges (*plátano*, *naranja*), *por favor*, *tres*, *cuatro*.
13. **El día de campo.** Rosa's picnic: the bakery (*panadería*), cheese (*queso*), milk from the goat (*leche*), five things in the basket (*cinco*), six plates (*seis*) on a blanket in the park.
14. **El show de perros.** Sofía teaches Canelo *¡dame la pata!* and *¡salta!*; cookies (*galleta*); Luna judges from picture signs; a blue ribbon (*azul*); Sofía is *feliz*.
15. **Las flores de Lucía.** Lucía is *triste*: a pink and a yellow flower (*flor*, *rosado*, *amarillo*) for her mom, a butterfly (*mariposa*) on Canelo's nose.
16. **Las páginas perdidas.** The wind blows your notebook's cards into the park; Canelo learns *¡busca!* and sniffs them out; one is up a tree (*árbol*), a rabbit (*conejo*) sits on the last; Inés's library (*biblioteca*).
17. **¿Qué dicen?** Nico's sound game around town: a green frog (*rana*, *croac*, *verde*), a bird (*pájaro*), and Canelo learns *¡gira!*
18. **¿Cuántos animales?** Count the town's animals with Luna: a fish (*pez*), *siete*, *ocho*.
19. **¡Todos a la granja!** Call every animal with *¡ven!*: they follow you to the farm in a parade; the horse and the goat make *nueve* and *diez*.
20. **Preparamos la fiesta.** Invitations, food, ribbons, flowers and a rehearsal all over town (no new words).
21. **La fiesta de los animales.** The party at the barn: Canelo's show, the animals' song, a group photo and the diploma.

## Every day in town: review in the world
- **Greetings**: the first talk of the day with someone starts with their greeting (a sun, a moon or a wave: *buenos días*, *buenas noches*, *hola*), then one word that's due, asked the way their life shows it.
- **Favores**: up to three townsfolk a day have a "?" bubble and a small favour about a word you know: take a letter to a place named only by its word, find an animal, count a heap of their things, say a colour, a sound, a face, a thing (a star and a heart).
- **La palabra del día**: Profesora Luna holds up one picture a day: say its word.
- **Canelo**: six tricks, each from his chapter (*ven*, *siéntate*, *dame la pata*, *salta*, *busca*, *gira*); say them at his menu. His "?" brings back a word met a minute ago.
- **Page puzzles**: sparkles around town, and from chapter 16 Inés's library, match a notebook page's pictures with their words.
- **Side jobs** (a star each, once a day): feed the ducks, the hens' egg for Rosa, Canelo's water, pet the horse, wake the sleepy cat; after chapter 15, a flower a day as a present. **Presents**: someone who likes what you carry shows it in their bubble.
- **¿Dónde están? (hide-and-seek)**: once a day Nico (a magnifying glass over his head) hides two or three animals you know around town and in the barn: on a fence post, on the bakery roof, behind your house, in the trees, behind hay bales and barrels. They peek out (an ear, a comb, a tail); tap one to find it: a star, its name (say it back!) and a question when it's due. Nico shows a picture of the place as a hint, and Canelo sniffs out a trail of paw prints.
- **The barn**: its door opens. Inside: the cream horse in her stall, hens on the perch over their nest boxes, hay bales that rustle, a trough, a milk can, apples, and the *¿Qué dicen?* page puzzle. Every door in town opens; one that can't just yet says why (Mamá: *¿Y el perro?*).
- **The animals and the album**, **hearts** with everyone (stickers at 3, a photo at 5), the **evening at home** with the *Hoy* card, and the **diploma** at the end.

## Content
73 words on 11 notebook pages (`content/es/words.js`), taught by the 21 chapters (`content/es/story-c01-c10.js`,
`content/es/story-c11-c21.js`). Progress saves itself in the browser, in three save slots; saves from before the
chapters (and from part 1, when chapters 11-21 were still the older errands) load with their errands mapped onto the
chapters.

## Project layout
- **Engine (shared with Embers of Aldmere):** `src/core.js`, `src/gfx.js` (bitmap font, with Spanish letters added), `src/ui.js` (dialogue with English help, menus), `src/audio.js`, `src/music.js`, `src/tiles.js`, `src/sprites.js`
- **Juice:** `src/fx.js`, a particle layer drawn over every screen: tap ripples, star bursts for right answers, the first-try star flying to the corner counter, confetti for new words and badges, dust when you start walking
- **Spanish content:** `content/es/words.js` (words, topics, notebook pages and their places, the chapter table), `content/es/story-c01-c10.js` (chapters 1-10), `content/es/story-c11-c21.js` (chapters 11-21)
- **Story:** `src/chapters.js` (the chapters: beats, the daily gate, Misiones, older saves)
- **Learning:** `src/data.js` (errands, characters; the Spanish from `content/es`), `src/icons.js` (word pictures), `src/words.js` (the word model: stages, Leitner boxes over sessions and days, the review engine `G.review`, the new-word budget `G.budget`), `src/intro.js` (meeting words: `G.intro.show / watch / listen / find`, review questions, page puzzles), `src/learn.js` (questions whose cards adapt to how well the answer is known, the gold-word card, errand cards, badges), `src/state.js` (save slots and autosave; the older word helpers wrap the model). Picture-words in dialogue are drawn by the rich text in `src/ui.js`.
- **Game:** `src/field.js` (exploring), `src/ambient.js` (the living town: birds, butterflies, a cat, Canelo tagging along, people who look at you, Tomás's mail round), `src/animals.js` (Round B animals and the album records), `src/world.js` (tap anything, the word bubble, say it back), `src/pet.js` (Canelo: tricks, care, the pet menu, his bed), `src/hearts.js` (hearts, voice greetings, stickers and photos), `src/album.js` (the animal album and the Amigos page), `src/errands.js` (the bag, presents, shops, side jobs and flowers), `src/favores.js` (review in the world: favores, the palabra del día, Inés's pages), `src/seek.js` (Nico's hide-and-seek), `src/menus.js` (Cuaderno, Misiones, Animales, the grown-ups menu), `src/maps.js` (townsfolk and errands), `src/story.js` (opening, party, diploma), `src/main.js` (title, save slots)
- **Speaking:** `src/speech.js` listens for a Spanish word with the browser's speech recognition and scores what it heard (`G.speech.listen`, `G.speech.match`, and `G.speech.gestureTap`, which starts the mic inside the real tap as iOS Safari requires); `src/mic.js` is the kids' mic button and the speaking stars (`G.MicBtn`, `G.mic`), used by the questions and the new-word card in `src/learn.js`; `src/mictest.js` is the grown-ups' microphone test (`G.micTest()`), which shows what the device heard and logs whether the game's voice still works after the mic. On iPad it needs Safari with Dictation turned on (*Settings → General → Keyboard → Enable Dictation*). The save keeps how many times each word was said (`words[id].said`; older saves just start at 0).
- **Maps:** `tools/mapgen.py` generates `src/mapdata.js`
- **Hints and the day:** `src/hint.js` (the tapping hand, the key strip), `src/day.js` (the session clock, the sunset, the evening at home and the *Hoy* card); `tools/test-hints-day.js` tests both
- **Build:** `python3 tools/build.py` rebuilds the single-file `dist/` version and stamps each script in `index.html` with a hash of its contents (`src/x.js?v=…`), so a plain refresh of the play link always gets the newest game. Run it after every change in `src/`.
- **Smoke test:** `NODE_PATH=$(npm root -g) node tools/smoke.js [screenshot dir]` plays the opening with taps on an iPad-sized touch screen and with the keyboard on a desktop (needs Playwright with Chromium installed globally). `tools/test-saves.js` tests save slots, autosave and the grown-ups menu, `tools/test-fx.js` the particles and answer pops, `tools/test-ambient.js` the living town, `tools/test-roundb-world.js` the Round B words, pictures, animals, tap-anything and say-it-back, `tools/test-roundb-pet.js` Canelo's tricks (by voice with a fake recognizer and by tap), care, hearts and the album, `tools/test-chapters.js` chapters 1-10 start to finish over several days (taps and some speaking, the daily gate, a reload mid-chapter, older saves), `tools/test-chapters2.js` chapters 11-21 to the diploma by taps (each chapter's words, the budget, the tricks, favores and the palabra del día on the way, a part-1 save), `tools/test-barn.js` the barn (in and out, its things before and after their words are met), hide-and-seek and the doors (each one opens or says why; chapter 7 at the barn), `tools/test-review.js` favores, the palabra del día, the greeting's due word, Inés's pages, side jobs, shops, presents and flowers, and `tools/test-playthrough.js` plays the whole game with taps over several days (new game, all 21 chapters, the diploma, with a reload in the middle and an evening at home); `NODE_PATH=$(npm root -g) sh tools/test-all.sh [screenshot dir]` runs every test
- **Vocabulary audit (dev only):** `src/vocablog.js` logs every time a word reaches the child (met, prompted, retrieved, shown, heard, tapped, a card, picked, said, a stage up) when a test sets `G.vocabLog = []`; it is off and never saved otherwise. `NODE_PATH=$(npm root -g) node tools/vocab-audit.js [--quick] [--strict]` plays the whole game over several days (15-minute sessions on successive dates: the playthrough's own moves, `tools/playflow.js`, at a child's pace, sometimes speaking with a fake recognizer, then free play) and writes `docs/VOCAB_AUDIT.md` and `docs/vocab-timeline.svg`: the design's measured targets (PASS / FAIL), per word, per errand, per session, and the problems (bursts, overload, words never used or never seen again)
- **Speech test:** `NODE_PATH=$(npm root -g) node tools/test-speech.js [screenshot dir]` checks the word matching in plain Node and drives the mic test with a fake recognizer; `tools/test-speaking.js` plays questions and new-word cards by voice with the fake recognizer (right, wrong, silence, errors, V, holding Space, the grown-ups' switch, no recognizer, saving)
- **Word model test:** `NODE_PATH=$(npm root -g) node tools/test-words.js` checks the stages, the Leitner boxes over days (a moved clock and date), stars, old saves, the review order, the new-word budget, questions adapting to the answer's stage, the introductions, the notebook, page puzzles and tap-anything.

See `docs/CONTENT.md` for how to add words, characters and errands.
