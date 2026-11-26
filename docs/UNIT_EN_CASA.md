# New unit: En casa (at home)

Written 25 November 2026. This is the first unit of new content since the open world, and the pilot for how every
later unit is built. It is written for the parent first; the last part is the build plan for the helpers.

## Why this unit

- The game teaches 181 words today. Almost a third are animals. The everyday words a child uses most are missing:
  family has four words, the home has two, meals have none of the dishes she eats, and "I'm hungry" does not exist.
- She is at about 52 stars, near the start. A new place far away would not reach her for months. Home is where every
  play day starts, so this unit is in front of her the next time she opens the game.
- It gives the game something it does not have yet: a small thing that is new each day for about two weeks, instead
  of a place that is used up in two or three sittings.

## What she finds

Her house gets two new rooms.

- **La cocina (the kitchen)**, through a doorway from the room she wakes up in. **Papá** cooks here. He is new.
- **El patio (the back yard)**, through the kitchen's back door: a lime tree, an avocado tree, a small vegetable
  bed, a clothes line, and a spot where the dog digs. Her little brother **Leo** plays here. He is new too.

Nothing in the room she knows moves: her bed, Mamá, the table and the front door stay where they are.

## The 20 words

| Group | Words |
| --- | --- |
| Family | la mamá, el papá, el hermano |
| The kitchen | la cocina, la mesa, la silla, el plato, el vaso, la cuchara |
| Food | la sopa, la tortilla, los frijoles, el arroz, el taco, el aguacate, el limón |
| Said at the table | tengo hambre, tengo sed, ¡qué rico!, come |

All are everyday Mexican Spanish. "El limón" is the small green one, as in Mexico. "Come" is what you tell someone
(or the dog) to do: eat. Each word gets its own picture and a place in her notebook.

## The story: four short chapters

Each chapter brings five words, one at a time, and something happens on the map after every two or three questions.
A chapter opens only when her reviews have room for it, so the four spread over at least four play days, usually more.

1. **¡Tengo hambre!** Papá is cooking and the whole house smells of it. She meets Papá and the kitchen, says she is
   hungry, tastes the soup and says ¡qué rico! *(el papá, la cocina, tengo hambre, la sopa, ¡qué rico!)*
2. **Pon la mesa.** Papá asks her to set the table. She carries each thing from the shelf to the table.
   *(la mesa, la silla, el plato, el vaso, la cuchara)*
3. **Los tacos de Papá.** Leo is hungry too. She builds a taco step by step and tells Leo, and the dog, to eat.
   *(el hermano, la tortilla, los frijoles, el taco, come)*
4. **Agua de limón.** Mamá comes in thirsty. She picks limes and an avocado in the patio, and the family sits down
   together. *(la mamá, tengo sed, el limón, el aguacate, el arroz)*

The first chapter opens once the puppy has been found (chapter 1 of the town's story), so the very first minutes of
the game stay as they are. It never waits for anything else in town.

## What stays to do every day afterwards

- **¿Qué hay de comer?** Once a day Papá's pot has a bubble. He asks what she wants ("Quiero..."), she sets what is
  missing on the table by listening ("Dame dos platos", "el vaso azul"), and the family eats. It only uses words she
  has met, and it prefers the ones that are due for review.
- **Leo** asks a small favour some days: find something in the patio, count the limes, tell him "¡Come!".
- **The patio** has limes and avocados to pick and give, and the dog's digging spot.
- Papá and Leo have hearts, a greeting a day and a present they like, like everyone in town.

## What it does not do

- It adds no new animals. The balance needs everyday words.
- It does not touch her saved game. Every id that exists today stays the same; the unit only adds new ones.
- It has no native-speaker check, like the rest of the game. Every new line goes into `docs/SPANISH_REVIEW.md` with
  the dictionary form it rests on, and two readers proofread it.

## After this unit

- **Día de Reyes (6 January).** A small festival in the same kitchen: a letter to the Reyes, shoes by the door, the
  rosca on the table. It reuses la carta and los zapatos and adds three or four words. To be built in December, once
  this unit is live.
- Then the next unit from the roadmap: Luna's school (numbers 11 to 20, school things, more colours).

---

## Build plan (for the helpers)

**Ids** (never change once released). Words: `lamama`, `elpapa`, `hermano`, `cocina`, `mesa`, `silla`, `plato`,
`vaso`, `cuchara`, `sopa`, `tortilla`, `frijoles`, `arroz`, `taco`, `aguacate`, `limon`, `hambre`, `sed`, `rico`,
`come`. People: `papa`, `leo`. Maps: `cocina`, `patio`. Quest line: `hogar`; chapters `hogar1` .. `hogar4`.
Topics and notebook pages: `cocina` (cocina, mesa, silla, plato, vaso, cuchara), `acomer` (sopa, tortilla, frijoles,
arroz, taco, aguacate, limon, come, rico); `lamama`, `elpapa`, `hermano` join the page `familia`; `hambre` and `sed`
join the page of `sentir`.

**Words as written** (`es`): `la mamá` (alt `mamá / mami`), `el papá` (alt `papá / papi`), `el hermano` (alt
`hermanito`), `la cocina`, `la mesa`, `la silla`, `el plato`, `el vaso`, `la cuchara`, `la sopa`, `la tortilla`,
`los frijoles` (plural only), `el arroz` (mass), `el taco`, `el aguacate`, `el limón` (pl `limones`), `tengo hambre`,
`tengo sed`, `¡qué rico!` (alt `qué rico / rico / qué rica`), `come`. Mass words (no article in "Quiero ..."):
sopa and arroz. `los frijoles` is plural only, which the phrases already say bare ("Quiero frijoles").

**Rules that matter here**
- Order-independent: the unit may rely only on `hola` and its own words. Any other word (`agua`, `si`, `no`,
  `gracias`, numbers, colours) is used only when `G.words.met(id)`, and the scene works without it.
- One unknown per puzzle (`G.intro.*`), used again within a minute or two. At most 3 questions before something
  happens on the map (`tools/test-chains.js` fails on 4).
- Never type an article in a template: `G.requests.the` and friends. `{dog}` for the dog, `{name}` for her.
- The casa map: every existing coordinate, tile and person stays. Only a doorway is added.
- Safari 15 rules and the speed rule in `CLAUDE.md`. No per-frame scans.
- Every new or changed Spanish line goes into `docs/SPANISH_REVIEW.md`.

**Stages**
1. Foundation, two helpers side by side:
   - *Words and pictures*: `content/es/words.js`, `src/icons.js` (20 pictures, plus `papa` and `leo` portraits if
     icons hold them), tests that list words.
   - *Rooms and people*: `tools/mapgen.py` / `src/mapdata.js`, `src/tiles.js` (new tiles), the people (`G.data.npcs`,
     sprites), `content/es/hogar.js` (maps, exits, things, carry sources, the dog's spot, hearts registration, the
     four chapters added to the table with empty scripts), `index.html` (new script tags).
2. Content, three helpers side by side, one file each: `content/es/hogar-story1.js` (chapters 1 and 2),
   `content/es/hogar-story2.js` (chapters 3 and 4), `content/es/hogar-play.js` (the daily meal, the listen board,
   Leo's favours, the day's plays).
3. Tests and checks: `tools/test-hogar.js` (the story by taps, one unknown at a time, the daily meal, a save from
   today's release opening with the new rooms), the vocabulary audit, the Spanish proofread by two readers, screens
   looked at one by one.
4. Release: build, the full test set, the old-saves test, DEVLOG, then the play link.
