# Club de Español: the three-year roadmap (the answers first)

*Written 2026-10-21, and revised the same day after two independent reviews re-checked its numbers. The question: if
she plays 15 minutes a day for the next three years (age 7 to 10), what should she be able to do at the end, how much
content does that take, and where does the game go? This file answers those questions. It is not yet a content plan;
that comes after you have read this (section 5). The state of the game today, and the polish to do before building
anything new, are in `docs/AUDIT_2026-10.md`.*

*Sources: six audits of the game, two research reports (realistic Spanish targets for children; how games and children
change from 7 to 10), and a 3-year simulation of learning and forgetting run on the game's own review rules. The
reports, the audits' findings, key screenshots and the simulation's output are in `docs/audit-2026-10/`; the
simulation is `tools/sim-3year.js` (`node tools/sim-3year.js --checks` reprints the cases quoted here in a few
seconds). The main published sources are listed in section 7, and words with a special meaning are explained in
section 6.*

---

## The answers on one page

| Question | Answer |
| --- | --- |
| **How much play is "15 minutes a day for 3 years"?** | **274 hours** if she plays every single day, as you asked. **About 181 hours** on a realistic calendar (4-5 days a week, summer and holidays mostly off), about a third less. This plan is sized for the realistic calendar (the "planning case") and gives the every-day numbers beside it where they differ. |
| **What can she do at the end?** | **Planning case:** a beginner moving from **"Novice Mid" to "Novice High"** on the US scale, about **A1** on the European one (Cambridge "Movers", working toward "Flyers"). She understands **about 900-1,200 words** and can say **about 450-650**. She follows spoken instructions and short illustrated stories, answers and asks simple questions about herself and her world, and reads short illustrated texts. With about 10 minutes a week of real conversation she can also hold a short chat and retell a picture story. **If she plays every day:** Novice High, A1 solid with A2 in listening and reading in places, about 1,200-1,500 words understood and 600-900 said. Either way it is not fluent conversation. |
| **How fast can she take in new things?** | About **1.5-2.5 new items per play day** (an item is a word, a set phrase, a sentence pattern or a verb form), more in year 1 and fewer later. Central estimate: **about 1,400 items over three years** on the planning calendar (about 2,200 if she plays every day). The range is wide, **about 700-1,800**, and depends mostly on how much of each session is practice. The 1,400 needs three things from the polish plan: the fixed memory engine, **review-first pacing**, and about **3 practice moments a minute everywhere** (free play gives 1.6 today; at that density it is about 700). |
| **How much content is that?** | Planning case: about **1,000 words, 225 set phrases, 85 sentence patterns and 105 verb forms**. Today the game has 180 words and 6 phrase patterns (186 items), **about 13%** of that. |
| **How much must the game grow?** | First-time content (new places, chapters, stories, songs, scenes) has to grow from **about 7 hours today to about 68 hours** in the planning case (about **9 times**), or **about 107 hours** if she plays every day (about 14 times). The other ~60% of play time comes from **repeatable systems** (review, generated favours and requests, seasonal events, the album, decorating, family play), built once and then levelled up. Every unit also needs art, sound and voice, sized in 2.8. |
| **How often does new content have to arrive?** | With review-first pacing, today's content lasts about her first 3 months. After that, one new **unit** (about 20 new items: a place or event that unfolds over about 2 weeks) every **2 weeks in year 1, 2.5 weeks in year 2 and 3 weeks in year 3**: about **61 units**. If she plays every day: every 1-2 weeks, about 100 units. Build in steps, a few months ahead of her measured pace, not the whole list up front. |
| **Where does the game go?** | From **words → phrases → sentences and questions → stories and conversation**. Year 1: explorer (new places, seasons, Mexican festivals, letters and sounds). Year 2: reader and helper (reading, riddles, mysteries, verbs, a family circle). Year 3: storyteller and guide (conversation scenes, retelling, an optional carefully limited AI character, and a finale trip, *El Gran Viaje*). Canelo grows up with her. |
| **What must happen first?** | The polish gate in the audit (section 5), especially: no arrow loops; a **backup for her save, before the winter break**; a memory engine with review gaps of months; **review-first pacing** (new items only when reviews are under control); **more practice in free play**; correct Spanish in code-built lines; an engine that doesn't slow down as content grows. Today's engine can keep only about 190-370 items properly on schedule, and loses most of what she meets at today's pace of about 5 new items a day (even at 3 a day it keeps under 40%). |

---

## 1. The end goal: what she can do at age 10

### 1.1 The level, and how it depends on how often she plays
Most per-hour figures in the research come from teenagers and adults. Studies of children who start a language at
school (the Barcelona Age Factor project) found that younger starters progress **more slowly per hour** at first;
those studies show the direction, not a size. So the levels below lean on **child benchmarks**: US elementary-school
programmes (FLES) and Cambridge's young-learner exams and word lists. Adult rates are treated as an upper bound. (The
research writer estimated that adult rates should be discounted by about 30-50% for a 7-9-year-old. That is a
judgement, not a study result, and no number here applies it.)

The research's year-by-year targets assume about 80, 160 and 240 hours, close to the every-day calendar. For the
other calendars they are scaled to the hours, using the research's own ratios: about 5-6.5 words understood and
2.5-3.5 words said per hour of play.

| How often she plays | Hours by age 10 | Likely level at 10 | Words understood | Words she can say | Model upper bound: items recallable at the end* |
| --- | --- | --- | --- | --- | --- |
| Every day, no breaks (your premise) | 274 | Novice High; A1 solid, A2 in listening and reading in places (Cambridge Flyers band) | 1,200-1,500 | 600-900 | 1,730-2,080 |
| Steady (about 6 days a week) | 229 | Novice High, just; A1 (Movers → Flyers) | 1,100-1,400 | 550-850 | 1,210-1,750 |
| **Realistic (about 4-5 days a week; the planning case)** | **181** | **Novice Mid → Novice High; A1 (Movers; Flyers is a stretch)** | **900-1,200** | **450-650** | **930-1,350** |
| Patchy (about 3 days a week) | 110 | Novice Mid; parts of A1 (Starters → Movers) | 550-700 | 250-400 | 550-830 |

\* *From the 3-year simulation with the fixed engine and review-first pacing. The low end is a steady pace; the high
end fills every spare practice minute with new items. "Recallable" is the model's estimate of items (words, phrases,
patterns, verb forms) she could recall without answer choices, using memory settings from adult flashcard research.
Treat it as an **optimistic upper bound** for deciding how much content to have ready, not as a forecast. Why it runs
above the research ranges is explained in 2.2.*

*What the levels mean in kid terms (from the US language-teaching scale, ACTFL):* **Novice Mid** = words and memorized
phrases about very familiar things. **Novice High** = phrases and simple sentences; handles short exchanges by asking
and answering simple questions. **Intermediate Low** (the next step) = makes up simple sentences of her own. For
comparison, US elementary programmes with 90 minutes a week (about 54 hours a year) aim for Novice Mid after 2 years
and Novice High after about 4 (Delaware's targets).

### 1.2 What she can do (can-do statements)
The game can practise listening, reading and saying words and sentences, but it can't hold a real conversation or
grade her speaking. So the speaking goals are split: what the game alone can get her to, and what about 10 minutes a
week of real Spanish conversation (or playing every day) adds.

| Skill | With the game alone (planning case, ~181 h) | With ~10 minutes a week of real conversation, or playing every day |
| --- | --- | --- |
| **Listening** | follows 2-step spoken instructions ("Trae la pelota azul"); understands a 2-3-minute illustrated story told with words she knows; understands questions about herself (name, age, family, likes) | follows 2-3-step instructions ("Trae la pelota azul y dásela a Abuela"); 3-5-minute stories; the gist of new stories built from known words; questions at near-normal speed |
| **Speaking** | introduces herself, her family and her dog; says what she likes, wants, has and needs ("Tengo hambre") and where things are, in short sentences; answers who / what / where / how many questions; gets through short scripted exchanges in game scenes; says the I / you / he-she present forms of about 25 common verbs and the I / he-she past forms of about 15, with mistakes | also asks questions back in a 2-3-minute exchange on familiar topics; retells a 4-6-sentence picture story using some past forms (*fue, comió, se cayó*); gets through an everyday scene (buying at a market, asking the way), with mistakes |
| **Reading** | reads any regular Spanish word aloud (this should be quick: Spanish spelling is regular; it hasn't been measured directly for children who already read English); reads signs, letters, captions and short illustrated texts (50-300 words) | reads simple graded readers (300-1,000 words) on her own |
| **Writing** | builds captions and postcards from words she picks; types short sentences | writes short sentences and a postcard on her own |
| **Words and grammar** | understands about 900-1,200 words and says about 450-650; 40-60 sentence patterns; present tense with *I / you / he-she* (we and they understood); *ir a* + verb for plans; understands the past in stories and says common past forms for *I* and *he/she*; *ser* and *estar* in common chunks (mistakes expected) | 1,200-1,500 understood, 600-900 said; 60-80 patterns; present tense across persons; the past of about 20 common verbs |
| **Culture** | the Mexican year (Día de Reyes, Día del Niño, Independencia, Día de Muertos, Las Posadas), everyday Mexican foods, Mexican animals and places | the same, plus telling someone about them |

**Year-end checkpoints** (for the Learning page). Planning calendar first; the every-day calendar, which is close to
what the research assumed, in brackets.

| | End of year 1 (age 8) | End of year 2 (age 9) | End of year 3 (age 10) |
| --- | --- | --- | --- |
| Hours of play | 60 [91] | 119 [183] | 181 [274] |
| Level | Novice Low → Mid; toward Cambridge Starters [Novice Mid, Starters] | Novice Mid; Starters → Movers [Novice Mid → High, Movers] | Novice Mid → High; A1, Movers, Flyers a stretch [Novice High, Flyers band] |
| Words understood | 300-400 [400-550] | 600-750 [800-1,000] | 900-1,200 [1,200-1,500] |
| Words she can say | 150-250 [200-300] | 300-450 [400-550] | 450-650 [600-900] |
| Sentence patterns and set phrases | 10-15 patterns and about 30-40 set expressions [15-20 and about 40] | 25-35 patterns [35-50] | 40-60 patterns [60-80] |
| Listening | one request with 1-2 details; 30-60-second picture stories | 2-step instructions; 1-2-minute stories [2-3 steps; 2-3 minutes] | 2-step instructions; 2-3-minute stories [3 steps; short stories and simple cartoons for learners] |
| Speaking | words and memorized phrases; swaps a word in a pattern | swaps 1-2 words in a pattern; a short scripted exchange | short sentences on familiar topics; with conversation practice, a 2-3-minute chat and a picture-story retell |
| Reading | sounds out regular words; reads captions | reads simple sentences and short texts (50-150 words) | short illustrated texts [graded readers]; builds and types short sentences |

**A year-end check you can run** (about 15 minutes, once a year; the Learning page can prepare it):
1. **Picture recall:** 20 pictures of words she has met, one at a time. She says the word, with no choices. Count
   the right ones.
2. **Picture recognition:** 20 spoken words; she points to the right picture among 4.
3. **Following a request:** three spoken requests of 1, 2 and 3 steps ("Trae la pelota azul y dásela a papá").
4. **Story retell:** a 4-6-picture story; she tells it in Spanish. Note how many sentences, and any past forms.
5. **A 2-minute chat:** name, age, family, what she likes, what she did today.
Compare the results with the year's row above, and note them on the Learning page.

### 1.3 What she will *not* have, and why that's honest
- Fluent free conversation, cartoons for native speakers at full speed, or accurate grammar across tenses.
  Even children in full immersion schools understand far more than they can say accurately.
- **Real conversation with a person is the one ingredient the game can't supply.** The research's "stretch" targets
  assume about 10 minutes a week of it (a parent with the game's prompts, a grandparent, a tutor). The evidence that
  live interaction helps children learning a foreign language is moderate rather than strong: few studies cover
  children learning it outside a country where it is spoken. How often she plays is the biggest lever the model can
  measure: from about 550 items on a patchy calendar to about 2,000 every day.

### 1.4 How sure we are
- **Medium for year 1, medium-low for year 3.** The children's evidence is solid on direction: Cambridge's young
  learner word lists, US school outcomes, children learning in chunks first, and understanding running ahead of
  speaking. The per-hour numbers mostly come from adults.
- **The content estimate depends most on how much of each session is practice.** The simulation assumes 55% of each
  session is questions, requests and "say it" moments (about 3.3 a minute). Story play today gives about 5 a minute,
  but free play only 1.6, and the forest days 0.5-0.6. With review-first pacing, the model gives about **700 items**
  at today's free-play density, about **1,000** at 40% practice, about **1,400** at 55% and about **1,800** at 70%.
  Polish item 3.1 (shorter quiz chains) lowers story density, so 3.2 (language in free play) has to make it up. The
  open-world audit (audit 2.12) measures this, and the gate requires 3 or more moments a minute.
- **The memory settings come from adult flashcard research.** The model's "recallable" numbers are therefore an upper
  bound. **After about 3 months of her real play, the Learning page's numbers should be used to re-fit them**, and the
  targets re-checked.
- **No independent study of a children's language app measuring speaking or long-term memory was found.** The research
  could read only search abstracts and snippets (the full papers couldn't be fetched), so this means "none found", not
  "none exists".
- **Speech recognition is unreliable for young learners:** in one study of a modern recogniser (Whisper), it got about
  1 word in 4 wrong on non-native children's *read* speech, and about 1 in 3 on open answers. Safari's recogniser on
  her iPad hasn't been measured. So the game can encourage speaking, but it can't grade it.

### 1.5 The game's own ending
A defined finish at about 10 gives three years a shape:
- **El Gran Viaje**: she and grown-up Canelo travel to a Mexican town for a festival, and use everything she has
  learned: the market, asking the way, helping plan the festival, telling new friends about her adventures.
- **Then the club is hers to lead.** A "teach the grown-up" mode, where a parent or cousin plays the beginner who
  needs her help (in one study, students worked harder learning for a character they taught; a follow-up found weaker
  links, so treat it as motivation, not a guarantee), plus a light **keep-it-alive mode**: a few minutes a week of
  review, the yearly festivals, and monthly family scenes. The world stays open afterwards.

---

## 2. The content math

### 2.1 How much time three years really is
| Calendar | Play days a year | Play days in 3 years | Hours a year | Hours in 3 years |
| --- | --- | --- | --- | --- |
| Every day (your premise) | 365 | 1,096 | 91 | **274** |
| Steady: weekdays 95%, weekends 75%, 3 weeks off | ~305 | ~916 | 76 | 229 |
| **Realistic (planning case): weekdays 90%, weekends 60%, summer mostly off, 2 weeks at winter break, a short gap every ~2 months** | **~241** | **~725** | **60** | **181** |
| Patchy: about 3 days a week, long summer | ~147 | ~441 | 37 | 110 |

**The plan is sized for the realistic calendar, which is about a third less play than your premise.** That is
deliberate: few families manage every day for three years, and content built ahead of her pace is wasted or overloads
her memory. Where the every-day calendar changes the answer, it is shown too (2.3, 2.5). About 1.5 minutes of each
session goes to getting going and the dog's warm-up.

### 2.2 How fast she can take in new things
The simulation played three years of 15-minute sessions with forgetting, the game's review rules, about 10 seconds
per question and 55% of each session spent practising (the rest is story and exploring). Planning calendar:

| Review engine and pacing | New items per play day | Met in 3 years | Model: recallable at the end | What today's Learning page would show |
| --- | --- | --- | --- | --- |
| As built (longest gap 8 days), slow pace | 1.5 | 1,086 | 932 (802 durable) | 87% retention |
| As built, 3 a day | 3 | 2,173 | 816 (286 durable) | 72% retention and 2,153 words "solid": inside its target |
| As built, **today's measured pace** (about 5 a day) | 5 | 3,621 | **121 (3%)** | 24% retention by year 3 |
| Fixed engine (gaps up to months, real lapses, quests ask due items), open world with no pacing | 2 | 1,449 | 1,183 (1,148 durable), but by year 3 about 224 overdue reviews are still waiting at the end of each session | 87% |
| **Fixed engine + review-first pacing** (the plan) | **~2.5 / 1.8 / 1.5** (years 1 / 2 / 3) | **1,409** | **1,352** (1,320 durable) | 89% |
| Same, with the audit's gaps (1, 3, 7 ... 150 days, item 2.1) | ~2.7 / 1.9 / 1.7 | 1,525 | 1,444 | 87% |

How much the plan's row depends on the practice share and on her memory (fixed engine, review-first pacing):

| What changes | Met in 3 years | Model: recallable |
| --- | --- | --- |
| Practice 27% of the session (today's free play: about 1.6 moments a minute) | 711 | 682 |
| Practice 40% (about 2.4 a minute) | 1,042 | 998 |
| **Practice 55% (about 3.3 a minute; the plan)** | **1,409** | **1,352** |
| Practice 70% (about 4.2 a minute; story play today is above this) | 1,800 | 1,730 |
| Weaker memory (forgets faster at first, strengthens more slowly) | 1,139 | 1,075 |

**What "recallable" means, and why it runs above the research targets.** It is the model's expected number of items
she could recall without answer choices. At 1,352 it is about twice the research's "words she can say" for 181 hours
(450-650), because: the memory settings come from adult flashcard studies; it counts phrases, patterns and verb forms
as well as words; it assumes 55% practice at 10 seconds a question; it doesn't model mix-ups between similar words,
boredom or off days; and recalling a word on a picture card is easier than using it in conversation. **Use it to decide
how much content to have ready, and the research ranges (1.1) to judge her progress.**

**Takeaways.**
1. **About 1,400 items is a central estimate, not a ceiling.** The range is about 700-1,800, and the 1,400 holds only
   if three things work: the fixed engine (audit 2.1-2.5), review-first pacing (audit 2.9), and about 3 practice
   moments a minute everywhere (audit 3.2). Size the content in steps and re-check after the 3-month re-fit.
2. **The engine fixes let her take in more at a sustainable pace:** about a quarter more recallable items (1,183 vs
   932) and about 40% more durable ones (1,148 vs 802). Review-first pacing then stops the backlog from piling up.
3. **Going faster means meeting more and keeping fewer**, and today's Learning page hides it: at 3 a day it would show
   retention inside its 70-80% target and almost every word "solid" while most are forgotten. That's why the honest
   Learning page is a polish item, not an extra.

### 2.3 What she needs, year by year
The mix shifts from words toward phrases, patterns and verbs as she grows.

**How grammar is counted.** A verb's base form (*comer*) is a word. A sentence pattern (*Quiero ___*, *¿Dónde
está ___?*) or a question form is one pattern item. Each verb form she has to **say** (*como, comes, come*; *comí,
comió*) is its own item, because it has to be remembered separately. Forms she only needs to understand (*comemos,
comen*, most past forms in stories) come with stories and aren't counted. The model's runs with a more phrase-heavy mix
give about 5-7% fewer recallable items, well inside the range.

| | Year 1 (7→8) | Year 2 (8→9) | Year 3 (9→10) | 3 years |
| --- | --- | --- | --- | --- |
| Play days | ~241 | ~236 | ~248 | ~725 |
| New items per play day | ~2.5 | ~1.8 | ~1.5 | ~1.9 |
| **New items** (days × rate) | **~610** | **~420** | **~370** | **~1,400** |
| Words (including verbs' base forms) | ~520 | ~280 | ~200 | **~1,000** |
| Set phrases (*¿Cómo te llamas?*, *Tengo hambre*, *¡Qué padre!*) | ~75 | ~75 | ~75 | **~225** |
| Sentence patterns and question forms | ~20 | ~30 | ~35 | **~85** |
| Verb forms she says | 0 | ~45 (I / you / he-she, ~15 verbs) | ~60 (~10 more verbs; I / he-she past of ~15) | **~105** |
| Words taught by the end of the year | ~520 | ~800 | ~1,000 | |
| **Expected:** words understood (research, planning calendar) | 300-400 | 600-750 | 900-1,200 | |
| If she plays every day: new items | ~950 | ~685 | ~540 | ~2,180 |

**The build list is the supply; the expected row is what to judge her by.** The build list follows the model's
upper bound, so the game never runs dry while review-first pacing slows new items to her real pace. The taught list
(about 1,000 words) sits in the middle of the 900-1,200 target. The top of that range relies on words she picks up
from stories and signs without being tested, which nobody has measured, so treat it as a bonus. The same applies to
set phrases: up to about 75 are ready in year 1, and she will probably know 30-40 of them by its end.

### 2.4 What a 15-minute session looks like
Planning calendar, fixed engine, review-first pacing:

| | Months 1-3 | Months 13-18 | Months 31-36 |
| --- | --- | --- | --- |
| Reviewing things she knows | 4.4 min | 5.8 min | 6.7 min |
| Meeting new things | 3.9 min (about 3 a day) | 2.5 min (about 2) | 1.6 min (about 1) |
| Story, exploring, the dog | 6.75 min | 6.75 min | 6.75 min |
| **Reviews done each day** | **~21** | **~27** | **~32** |
| Due at the start of the session (includes leftovers) | ~22 | ~36 | ~72 |
| Left over at the end of the session | ~1 | ~9 | ~40 |

The leftovers come mostly from breaks: on the every-day calendar there are none, and with the audit's longer gaps
(item 2.1) year 3's leftover drops to about 30. They clear within about a week of play after the summer. Reviews grow
to 35-45% of every session by year 2. That only works if, from year 2 on, **one sentence, story question or request
reviews 3-5 items at once**, instead of one word per card.

**Five "reviews a day" numbers, and which one to plan with:**

| Number | What it means |
| --- | --- |
| 22 a day at 180 words; 114 a day at 1,000 words (year 3; 125 once steady) | Reviews falling due with today's 8-day top gap **if she never forgot**: the best case for the engine as built (the audit's word-model check) |
| 6-10 a day at 1,000 words | The same best case, with gaps up to 150 days |
| **About 21 → 27 → 32 done a day** | **What the fixed engine with review-first pacing actually does, with forgetting (the table above). Plan with this one.** |
| About 900 by year 3 (as built) | **Not a daily rate:** the pile of overdue words the as-built engine never reaches, because it does only about 23 reviews a day |
| About 224 left over at the end of each session by year 3 (fixed engine, no pacing) | The same kind of pile when new words keep arriving whatever the backlog; review-first pacing prevents it |

### 2.5 First-time content versus repeatable systems: the arithmetic
**First-time content** is anything she plays once: a new place, a chapter, a story to read, a song, a scene.
**Repeatable systems** are built once and give fresh play every day: review, generated favours and requests,
hide-and-seek, the album, decorating, seasonal events, family play.

**How long today's content lasts depends on how it's timed.** Two audits timed it differently:
- The **content audit** timed everything new from start to "used up": the story, the walking, side quests, favours,
  hide-and-seek, pages and album taps. That is about 7.4 hours for a real child (range 6-10), or 4-6 weeks of daily
  play. A chapter's "window" (the chapter plus the walking and side play around it) is about 7.5 child-minutes.
- The **child's-eye audit** timed only the story scenes on the arrow's path: about 2.7 minutes for a Villa Sol
  chapter, about 9 for a zone's three chapters, about 1.7-2 hours for all 36. With the "tomorrow" gates, a child could
  finish the stories alone in 2-4 weeks.

They agree once scenes are separated from everything else: the scenes are about 2 of the 7.4 hours. **The plan uses
the content audit's measure**, because a unit has to fill her whole session, not just its scenes.

| Step | Arithmetic | Result |
| --- | --- | --- |
| New items still to build | ~1,400 − 186 already in the game | **~1,215** |
| First-time play each new item needs | today: 7.4 h × 60 ÷ 186 items = 2.4 min (1.9-3.2 over the 6-10 h range); planning range 2.5-3.5 | **~3 min** |
| First-time play to build | 1,215 × 3 min | **~61 h** (range 51-71 h) |
| First-time play over 3 years | 61 h new + 7.4 h today | **~68 h = 38%** of 181 h |
| Repeatable systems and review | 181 h − 68 h | **~113 h = 62%** |
| Growth in first-time content | 68 h ÷ 7.4 h | **~9 times today** |

**If she plays every day**, the same arithmetic gives:

| | Planning calendar (181 h) | Every day (274 h) |
| --- | --- | --- |
| New items over 3 years (model, review-first) | ~1,400 | ~2,180 |
| Still to build beyond today's 186 | ~1,215 | ~1,990 |
| New first-time play to build (× 3 min) | ~61 h | ~100 h |
| All first-time play, with today's 7.4 h | ~68 h (38% of play) | ~107 h (39%) |
| Growth over today | ~9× | ~14× |
| 20-item units | ~61 | ~100 |
| A new unit every (years 1 / 2 / 3) | ~2 / 2.5 / 3 weeks | ~1 / 1.5 / 2 weeks |

If she plays every day and only the planning-case content exists, it runs out around month 20. Building in steps
ahead of her measured pace (section 5) handles either case.

**Year by year (planning calendar):**

| | Year 1 | Year 2 | Year 3 | 3 years |
| --- | --- | --- | --- | --- |
| Play hours | 60 | 59 | 62 | 181 |
| New items to build | ~425 (610 − 186) | ~420 | ~370 | ~1,215 |
| New first-time play to build (× 3 min) | ~21 h | ~21 h | ~18.5 h | ~61 h |
| All first-time play, with today's 7.4 h in year 1 | ~28 h (47%) | ~21 h (36%) | ~18.5 h (30%) | ~68 h (38%) |
| Repeatable systems and review | ~32 h | ~38 h | ~43.5 h | ~113 h |
| **20-item units to build** | ~21 | ~21 | ~19 | **~61** |
| Play days one unit has to last (20 ÷ items a day) | ~8 | ~11 | ~13 | |
| So a new unit every | ~2 weeks (after today's content runs out, around month 3-4) | ~2.5 weeks | ~3 weeks | |

*Note: the content audit's "14-28 times today" figure compared every-day play (274 hours) with bot time. Comparing a
real child with a real child gives about 9 times on the planning calendar and about 14 times every day.*

**The shape of a unit has to change.** Today a zone has about 21 words and about 30 minutes of first-time play, and
she uses it up in 2-3 play days. A unit needs about **60 minutes of first-time play for 20 items, spread over 8-13
play days**: a place or event that *unfolds*, with a new beat each day, rather than a place she finishes in a sitting.

**A suggested split of the first-time hours by kind** (for sizing, not yet a plan). Every kind of content carries new
items at about one per 3 minutes:

| Kind of first-time content | Today | Year 1 new | Year 2 new | Year 3 new | Total new | New items it carries | Roughly |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Places and their quests (new areas, buildings, one new region a year) | ~2.7 h (the five zones, including their 15 chapters) | 10 h | 6 h | 3 h | **19 h** | ~380 | 35-40 pieces the size of today's zones, mostly areas inside a few regions |
| Story chapters and mysteries | ~3.9 h (Villa Sol's 21 chapters with the play between them) | 5 h | 4 h | 3.5 h | **12.5 h** | ~250 | ~100 chapters at about 7.5 minutes each, counted the way Villa Sol's are (the scenes, about 3 minutes, plus the walking, finds and side play around them) |
| Seasonal events on real dates (first time through) | 0 | 3 h | 1.5 h | 1.5 h | **6 h** | ~120 | 4 seasons + ~6 Mexican festivals, built in year 1, a new layer each later year |
| Illustrated stories and reading | 0 | 1 h | 5 h | 5.5 h | **11.5 h** | ~230 | ~90-140 short stories (5-8 min each with their questions), each bringing about 2 new words among known ones |
| Songs, rhymes, riddles (*adivinanzas*) | 0 | 1 h | 1.5 h | 1 h | **3.5 h** | ~70 | ~40-60 songs, rhymes and riddle packs |
| Conversation scenes | 0 | 0.5 h | 2.5 h | 4 h | **7 h** | ~140 | ~50-80 scenes (market, directions, lost dog, festival planning), each bringing about 2 new phrases |
| Warm-ups and album taps | ~0.8 h | | | | | | |
| **Total** | **~7.4 h** | **~20.5 h** | **~20.5 h** | **~18.5 h** | **~60 h** | **~1,190** | |

Stories and scenes mostly recombine words she knows. If they bring only about 1 new item each instead of 2, they still
count as first-time play, but the places, chapters and events must carry about 190 more items: about 10 more hours of
them, so first-time play would be about 78 hours.

**The repeatable systems that must fill ~113 hours:**

| System | Today | What it has to become |
| --- | --- | --- |
| Review (the dog's warm-up and cards) | 2-3 words and a phrase once a day | Sized by how much is due (4-8 cards); any word from any place; saying it from memory first; a second short moment mid-session |
| Favours and errands | 36 fixed offers over the same words | Templates filled with due items that level up: one detail → two details → whole sentences → questions back |
| Listen-and-do | 9 boards, 57 of 180 words | Every place; verbs and body; 2-3-step instructions by year 2 |
| Hide-and-seek and the album | 43 spots, 50 animals | Silhouettes of animals she hasn't found; "¿Quién es?" (say it); rare forms, seasonal visitors, an animal fact level per animal |
| Tomás's letters | One picture letter a day | Read in Spanish from year 2; replies she builds |
| Seasonal calendar | None (the game has no real dates) | 4 seasons + ~6 festivals on real dates; nothing missed for good (it comes back next year) |
| Building and decorating | Her own house exists | Her room, garden and Canelo's house: placing a thing means naming it |
| Riddles and songs | None | A riddle generator from words she knows; songs replayed with actions |
| Family | Dashboard and "tonight's question" | Postcards from a menu of phrases she knows, trades, visits, "grown-up homework" (3 words for dinner) |
| Conversation | None | Scripted scenes that recombine lines she knows; later, optionally, a carefully limited AI character (3.5) |

### 2.6 So how much must the game grow?
| | Today (measured) | Three-year goal (planning case) | Growth |
| --- | --- | --- | --- |
| Words | 180 | ~1,000 | **5.5×** |
| Set phrases | (greetings, counted as words) | ~225 | new |
| Sentence patterns | 6 phrase patterns | ~85 | ~14× |
| Verb forms she says | 0 | ~105 | new |
| All items | 186 | ~1,400 (every day: ~2,200) | **7.5×** (every day: ~12×) |
| First-time play (real child) | **~7.4 h** (4.8 h at bot pace; range 6-10 h) | **~68 h** (every day: ~107 h) | **~9×** (every day: ~14×) |
| 20-item units | ~9 (Villa Sol ≈ 4, five zones) | ~70 (every day: ~110) | +61 (every day: +100) |
| Story chapters | 36 | ~140 | +~100 |
| Illustrated stories to read | 0 | ~90-140 | new |
| Seasonal events | 0 | ~10 on the yearly calendar (4 seasons + ~6 festivals) | new |
| Conversation scenes | 0 | ~50-80 | new |
| Practice moments per minute | story ~5, free play ~1.6 | 3 or more everywhere | system change |
| Items the review engine can carry | about 190-370 on schedule (it still holds about 930 at a slow 1.5 a day, but far fewer stay durable, and it falls apart above about 2-3 a day or with weaker memory) | about 1,000-1,450 (model; depends on the practice share) | engine fix and pacing (audit 2.1-2.5, 2.9) |

### 2.7 What makes this buildable
- **Writing speed is not the limit.** The whole game was built in about 16 days (5-21 October), and the five zones in
  one day (17 October), in AI coding sessions.
- **Checking is the limit.** Quickly built lines produced 37 wrong Spanish outputs and two guide loops that 1,630 tests
  missed. So every unit goes through the content-rule tests, the open-world learning audit and the content-time
  measure (audit 2.12, 4.8), plus a native-speaker check.
- **Her pace sets the release schedule, not the build pace.** A unit released early gets eaten in two days and
  overloads her memory. Section 3.11 describes how a finished unit waits until she is ready.
- **Leverage:**
  - seasonal events built once and played three times;
  - templates fed by the words she has due;
  - first drafts of lines, riddles and letters from AI, which you pick and edit (never for the core story);
  - a native speaker spot-checks a sample each month.
- **Your time is the real budget.** An estimate per unit, to be re-checked after the pilot unit:

| Step | Who | Estimate per unit |
| --- | --- | --- |
| A brief: what the unit teaches, its place or event, its daily beats | you, with the builder | ~30 min |
| Build: code, lines, pictures, tests | the builder (AI coding sessions today) | not your time |
| Read the new lines; pick among drafts | you | 30-60 min |
| Native-speaker check of the new lines | a native Mexican-Spanish speaker | 20-40 min of their time |
| Automated checks: content rules, open-world audit, content-time | the builder | not your time |
| Playtest with her and note what she does | you | 30-60 min |
| Look at the Learning page's pace numbers | you | ~15 min |
| **Your total** | | **about 2-3.5 hours per unit**, so about 1-1.5 hours a week at one unit every 2-3 weeks, more during the polish gate and the pilot |

### 2.8 Production: pictures, places, music and voice
The item counts above are only the learning side. Each unit also needs things that take real time to make:

| What a 20-item unit needs | Today | Per unit (rough) | Decide early |
| --- | --- | --- | --- |
| Pictures for new words (16-pixel icons) | drawn in code (`src/icons.js`) | ~15-20 icons | — |
| A place: ground tiles and an interior | one tavern room kit reused for almost every building | 1 area or building, reusing its region's kit; a new tile and room kit once per region (about one a year, a large job) | One interior kit per kind of building (home, school, shop, market) |
| Characters | pixel sprites | 1-3 new people or animals | — |
| Story illustrations (years 2-3) | none | about 3 short stories, a few pictures each | Pixel scenes built from the game's own sprites and tiles (cheapest and consistent) or commissioned art |
| Music | 7 loops borrowed from an earlier RPG | none per unit; one theme per region and season, plus the themes in audit 3.4 | Commission or compose a small original set |
| Songs and rhymes | none; the device's voice can't sing | 1-2 | A recorded native voice for songs, or spoken rhymes over music |
| Spoken lines | the device's text-to-speech (Mexican Spanish) | all new lines | Keep text-to-speech for lines; consider a recorded native voice for read-aloud stories and songs |
| Sound effects | a small set (audit 3.5) | a few | — |
| Checks and playtest | tests and audits | the automated checks, a native-speaker check, one playtest with her | — |

**Pilot one unit end to end** (section 5) and measure the real build time, checking time and your time before
committing to a unit every 2-3 weeks. The size of each new system is in 3.9.

---

## 3. Where the game evolves

### 3.1 The arc
| | **Year 1 (age 7→8): explorer** | **Year 2 (8→9): reader and helper** | **Year 3 (9→10): storyteller and guide** |
| --- | --- | --- | --- |
| Her role | Meets the world, collects, helps | Runs errands with choices, reads signs and letters, trains Canelo with commands | Solves mysteries, plays scenes, teaches a grown-up, hosts the festival |
| Language step | Words → set phrases and one-slot sentence patterns (*Quiero ___*) | Phrases → sentences and questions: two slots (*Quiero dos manzanas rojas*), verbs for I / you / he-she, *ir a* + verb, negation | Sentences → stories and conversation: the past in stories, retelling, short back-and-forth talk |
| Canelo | Puppy | Young dog (learns tricks on Spanish commands) | Grown dog, her travel companion |
| World | Today's six places deepened; a **home and family** area (mamá, papá, meals: tortilla, frijoles, sopa; *tengo hambre*); **Luna's school** (numbers 11-20, more colours, school things); 4 seasons and ~6 Mexican festivals | One new region (for example a market town by a river: food, money, numbers, directions); a library and reading corners; signs and comics around the world | One or two new regions (for example a city and the coast); **El Gran Viaje** finale |
| New systems | Engine fixes; review everywhere; decorating; album depth; letters and sounds; save code and family postcards | Reading layer; riddles; small mysteries; a family circle (trades, visits, grown-up homework); characters who ask her questions during stories | Conversation scenes; an optional, parent-enabled AI character (3.5); retelling; writing postcards; "teach the grown-up" |
| Learning page | Honest recall; first year-end check (1.2) | Reading level; phrases and questions; family conversation prompts | Conversation transcripts (if AI is on); final check against outside yardsticks |
| Tone | Cute, discovery | Funnier: riddles, puns with known words, mysteries | Cooler: adventure, her own goals, a "grown-up" look option; less baby talk |

**Why the tone matters.** Reading for fun drops sharply at age 9 (in one US survey, 57% of 8-year-olds read for fun
most days, against 35% of 9-year-olds), children drop "babyish" things early, and riddles and wordplay become a
delight from about 7. A game that stays a puppy game will lose a 9-year-old.

### 3.2 Year 1 in more detail (age 7→8)
- **Words.** Fill the everyday gaps first: family, food, home, body, numbers 11-20, more colours, daily verbs.
  Rebalance away from rare animals (28% of today's words are animals). Swap non-Mexican animals (hedgehog, marmot,
  llama) for Mexican ones (armadillo, coyote, teporingo).
- **Phrases.** About 20 sentence patterns (*Me llamo, Quiero, Me gusta, Tengo, ¿Dónde está?, Hay, ¿Cuántos?*,
  commands such as *dame, toca, mira, ven*) and up to about 75 set phrases ready (she'll likely know 30-40 of them by
  the end of the year).
- **Letters and sounds** (phonics): the 5 pure vowels, ñ, ll/y, j/g, silent h, qu/gu, rr. She already reads English
  and Spanish spelling is regular, so this should be cheap. It turns every sign and letter into reading practice.
- **The calendar.** 4 seasons that change what's around (animals, items), and festivals on their real dates: Día de
  Reyes (6 Jan), Día del Niño (30 Apr), summer, Independencia (16 Sep), Día de Muertos (1-2 Nov), Las Posadas (16-24
  Dec). Built once, they come back every year with one new thing each.
- **Systems.** Review everywhere, decorating (placing things means naming them), more album depth, a backup code
  that doubles as the start of family postcards.

### 3.3 Year 2 in more detail (age 8→9)
- **Verbs and questions.** The present tense of common verbs inside sentence patterns, with the I / you / he-she forms
  of about 15 verbs said (2.3); negation; who / what / where / how many / how / why; *ir a* for plans; *mi / tu / su*;
  *más ... que*; days, time and weather. The past only *heard*, in stories.
- **Reading becomes the cheapest input.** Illustrated read-aloud stories with quick explanations of new words, and
  questions. Small studies of young learners suggest stories teach words when new words are briefly explained, and
  barely at all when they are just read. Asking questions during the story is our own design choice, supported by
  first-language studies (3.5). Also Tomás's letters in Spanish, signs, short comics, and riddles.
- **Small mysteries.** "Who took the tamales?": multi-step goals, clues in sentences.
- **Canelo's training.** Spanish commands that make him act (learning through movement).
- **A family circle** (3.6).

### 3.4 Year 3 in more detail (age 9→10)
- **Stories in the past.** She hears them, answers questions, and retells with picture prompts. Past forms
  understood in stories, with the I and he/she forms of about 15 common verbs said (about 20 if she plays every day);
  the imperfect understood (*había una vez, era, estaba*); daily-routine chunks (*me levanto*).
- **Conversation scenes.** Market, asking the way, a lost dog, planning the festival: 3-6 turns, scripted first.
- **Reading and writing.** Short illustrated texts and the first graded readers (300-1,000 words); writing postcards
  and captions.
- **The finale and the hand-over.** El Gran Viaje, then she leads the club (1.5).

### 3.5 Talking with characters, and AI, carefully
Two different things are easy to mix up:
- **AI used to build the game.** The game is already written in AI coding sessions, checked by tests, by you and,
  from now on, by a native speaker. That continues, and can include drafting lines, riddles and letters in bulk.
- **AI inside the game**, which she would talk to. That is what this section is about.

The research supports **characters who ask questions during stories**. In two studies, children aged 3-6 understood
stories as well with a scripted question-asking agent as with a human partner, though their talk with the adult was
richer. Those studies were in the children's **first language**; it hasn't been tested for learning a second one. So
it's a design reason, not proof that it works for Spanish. It needs no AI. Open AI chat for children has real,
documented risks, and regulators are watching it closely.

| Step | When | What | Why |
| --- | --- | --- | --- |
| 0 | Now (7-8) | Scripted characters ask questions in stories and favours. Her answers are matched against expected answers (the phrase system already does this), with taps always available | The best-supported form for young children; no AI needed |
| 1 | Year 2 | AI drafts line variants, riddles and letters from a word list, behind the scenes; you pick and edit. No child data leaves the iPad | More content with a human check |
| 2 | Year 3, only if you switch it on | **A bounded AI character** in set scenes (market, directions, festival) | Practice responding, which scripted scenes can't fully give |
| 3 | 10+ | Freer role-play only with a parent beside her, playing a second character | Family scene, not a companion |

**Rules for step 2 (all of them):**
- Only the scene's topic.
- Replies of 12 words or fewer, in Mexican Spanish.
- Words she knows plus at most one new one, checked by code before she sees it.
- Never asks for personal information. Steers off-topic, health or upsetting subjects back to the scene or to "ask a
  grown-up".
- Never presented as a friend who misses her. A clear note that the character is pretend and played by a computer.
- 3-6 exchanges per scene. No audio kept. You can read every transcript on the Learning page.
- If anything fails, a scripted line plays instead.

Model costs would be a few dollars a year (the research report's estimate; check current prices). The real costs are
a small server to hold the key, privacy, and upkeep.

The game must keep working **fully without it**: a children's robot (Moxie) stopped working when its company's cloud
shut down. The AI can only ever be an add-on.

### 3.6 Family play
Joint play helps learning, and what parents *do* matters more than what they believe. So it's worth designing for:
- **Phase 0 (no server).**
  - A save code to back up and restore (it's also the fix for the save risk, audit 1.7).
  - A "postcard code" she can send to a grandparent.
  - "Grown-up homework": the Learning page gives you 3 words or phrases from her week, with audio, to use at dinner.
- **Phase 1 (a small sync service, family only).**
  - A family code links her iPad, your phone and a grandparent's.
  - Postcards built from a menu of Spanish phrases she knows: no free text and no strangers (the old Club Penguin
    "safe chat" idea).
  - Album trades, visits to her town, and a weekly family challenge.
- **Phase 2 (same device).** A "Familia" button adds a grown-up character who only follows, carries and asks. She is
  the expert, and the grown-up's lines are written so she has to translate or teach.

### 3.7 Reading and writing
- **Year 1:** letters and sounds, captions, single words, signs.
- **Year 2:** sentences and 50-150-word texts: letters, comics, riddles, labels in rooms (the school gets a
  blackboard; the bakery gets labelled bread).
- **Year 3:** short illustrated texts and the first graded readers of 300-1,000 words; she writes captions, postcards
  and short replies to Tomás. She picks words first, then types with the on-screen keyboard the name screen already
  has.

### 3.8 School-subject crossovers (optional, if you want them tied to her grade)
| Subject | In the game |
| --- | --- |
| Science | Album animals and their habitats, what they eat, day/night animals; weather and seasons; the garden (plants, growing); life cycles (tortuguitas hatching) |
| Math | Counting to 20, then 100; money at the market; measuring in recipes; telling time for the day's plan |
| Geography | The bus map becomes a map of Mexico for the Gran Viaje; regions, landmarks |
| Social studies and culture | The festival calendar; foods; family words; community helpers |
| Art and music | Songs with actions, colours and mixing, decorating her room |

### 3.9 How the game's systems must change
**Size:** S = small (hours to a day), M = medium (a few days), L = large (a week or more), as in the audit.

| System | Today | Needs to become | Size |
| --- | --- | --- | --- |
| Memory model | Words in boxes with gaps up to 8 days; stages reached in minutes | **Items** (words, phrases, patterns, verb forms) with gaps up to months; honest stages; saying from memory first; review-first pacing; **one sentence reviews several items at once** | the audit's Sprint 2, then M for several items per sentence |
| Phrases and grammar | 6 sentence patterns with one slot | Patterns with 1 slot → 2 slots → verb forms → question forms → past forms. Taught as chunks first, then pulled apart (that's how children do it) | M |
| Dialogue | 1-3-word lines; up to 11 questions in one talk, 8 in a row in chapter 20 | Still one unknown per line, but turns grow to 2-3 sentences; characters ask *her* questions; at most 3 questions before something happens | M (with audit 3.1) |
| Speaking | Choice cards with the word written | Picture first, say it, cards as a fallback; whole sentences later; never graded on grammar or accent, never marked wrong by the recogniser; taps and your checks always count too | M (audit 2.6) |
| Daily activities | ~30 fixed kinds over the same words | Generators fed by due items that level up with her | M per generator |
| Time | A day counter; no real dates | Real-date seasons and festivals, with nothing missed for good | M, plus each event's content |
| Reading layer | Words on cards and signs | A reader for illustrated stories with tap-to-hear, quick explanations of new words and questions; letters, comics, labels | L |
| Building and decorating | Her house exists | Her room, garden and Canelo's house; placing a thing means naming it | L |
| Learning page | Retention that can't see forgetting | Recall vs recognition; reviews done vs due; "not seen in 30/60 days"; the year-end check (1.2) and an outside yardstick (Cambridge word bands, a picture vocabulary check); conversation prompts for you; a "welcome back" review after breaks | M (audit 2.8), then S per addition |
| Family | Dashboard and "tonight's question" | Phase 0 (save code, postcard code); Phase 1 (family sync server); Phase 2 (a grown-up character on the same iPad) | Phase 0 S-M; Phase 1 L plus a server to look after; Phase 2 M |
| Conversation | None | Scripted scenes (3-6 turns), later the optional AI character (3.5) | M for scripted scenes; L plus a server for AI |
| Content tooling | Tests per feature; a vocab audit of Villa Sol | A **unit kit** (what every unit contains, section 5); content-rule tests; the open-world learning audit; a content-time measure; AI drafts that you choose from; a monthly native-speaker check; a simple word-list file you can edit without code (friends' names, school topics) | M (audit 2.12, 4.8), S for the word list |
| Engine | Layers of wrappers; per-frame recomputation; one Safari save; everything in one 2.1 MB download | Explicit handler lists; a per-frame snapshot of "what's going on"; compact saves; a backup code; a home-screen app that works offline; **each region's content loaded when she goes there**, with a download budget (the Spanish content is about 580 KB today; 9 times that in one file would slow the first start on an older iPad) | the audit's Sprint 4, then M for loading by region |
| Releases | Every push to `main` reaches her at once | A beta copy, tagged releases, units that wait to be unlocked, a way back (3.11) | S (audit 4.10) |

### 3.10 What stays the same
- **Canelo** is the heart of it. He grows up with her, and is **never sad that she was away**.
- **The album (Pokédex)** and **exploring** with no locks: the things she loves.
- **Picture and word together**, **one unknown at a time**, **taps always work**, **never a dead end**.
- **No streaks, no guilt, no stars as payment**, and no fear of missing out (everything comes back next year).
- **15 minutes is a complete day**, with an evening and a "look what you learned".
- **Mexican Spanish**, checked by a native speaker.
- **It works offline with no server.** Every online feature is an extra.

### 3.11 Releases: how new content reaches her
`main` is the game she plays every day, so today every change reaches her the moment it is pushed. Over three years
that needs a little structure:
- **A beta copy** of the game (a second published copy) where new units are playtested and audited before release.
- **Small releases**, each tagged, with a one-line "what's new" for you.
- **Units that wait.** A finished unit sits in the game, locked, until review-first pacing says she's ready for new
  items or its date comes round (a festival). That is what makes "her pace sets the release schedule" real, and it
  lets units be built ahead in batches.
- **A way back.** If a release breaks something, the previous tagged release can go back up. Before each release,
  check that a save from the new version still opens in the previous one, so going back never costs her progress.

### 3.12 Data and privacy
| Data | Where it lives | Who can see it | Notes |
| --- | --- | --- | --- |
| Her save (her name, the dog's name, words, history, album) | The browser's storage on each device (iPad and Windows are separate) | Only that device | Back it up (audit 1.7) |
| A backup file or code | Wherever you send it through the share sheet (Files, email, Messages) | Whoever receives it | It carries her first name and learning history: keep it in your own storage |
| Her voice, for the mic | On the iPad, Safari's speech recognition **may** send audio to Apple, depending on the iPadOS version (check on hers); in Chrome on Windows, recognition runs on Google's servers | Apple or Google | The game keeps no audio. The Learning page should say where speech goes (audit 2.8) |
| Spoken lines (text-to-speech) | The device's voices; on Windows, Google's online voices receive the text (not her voice) | Google, for those voices | Prefer the voices installed on the computer (audit 4.6) |
| Mic and error logs | On the device | You, when you press "share" | — |
| Family sync (Phase 1, optional) | A small server | The family circle | Game data only, a random family code, no names or emails |
| AI character (year 3, optional) | Her recognised words go to the AI provider through a small server | You (transcripts) | Only if you switch it on; no audio kept |

---

## 4. Risks and open questions

### 4.1 The main risks
| Risk | Why it's real | What reduces it |
| --- | --- | --- |
| **The world feels finished** | Measured: first-time content runs out after 4-6 weeks of daily play today (6-10 weeks at 4-5 days a week) | One unit every 2-3 weeks; events on real dates; generators; family play |
| **Building faster than she can learn**, with a dashboard that hides it | Today she meets about 5 new items a play day. At that pace for three years the engine as built would keep about 121 of 3,621 (3%); even 3 a day gives 2,173 met and 816 kept, while the page shows 72% and "solid" | Review-first pacing (audit 2.9, in the gate); the honest Learning page; re-fit to her data after 3 months |
| **Practice thins out as the world grows** | Free play gives 1.6 practice moments a minute today; the 1,400-item estimate assumes about 3.3 | Language in free play (audit 3.2); the open-world audit checks every unit |
| **Losing her save** | One Safari storage box, no backup, silent failures; Safari deletes it after 7 days of Safari use without a visit, and the planning calendar has a 2-week winter break and a 6-week summer | Backup and restore before the winter break (audit 1.7); until then, open the game every few days during breaks; then a home-screen app before the first summer |
| **The engine can't carry the content** | 3× content gave about 2 fps in a desktop browser slowed 4x (to be checked on her iPad); layered wrappers | Audit Sprint 4 before new zones; loading by region |
| **Production can't keep up** | Each unit needs pictures, places, sometimes songs and voice, not just lines (2.8) | Reuse kits per region; decide voice and illustration early; pilot one unit and measure |
| **A release breaks her game** | Every push reaches her at once | A beta copy, units that wait, a way back (3.11) |
| **She outgrows it** | Children drop "babyish" things early; reading for fun dips at 9 | Canelo grows up; humour, mysteries, her own goals; a cooler look |
| **Speaking stays thin** | No real conversation partner; recognisers miss about 1 word in 4 on young learners' read speech and about 1 in 3 on open answers; Safari's hasn't been measured | Say-it-first practice; your prompts; family scenes; optional tutor time |
| **AI goes wrong** | Documented safety and privacy problems with AI chat for children | Late, limited, parent-enabled, transcripts, always optional |
| **Breaks** (summer) | Speaking from memory fades first; younger children may forget faster | A "welcome back" mode; long review gaps keep old words cheap; strong learning in year 1 |
| **Spanish quality at scale** | 37 wrong outputs came from quickly built code lines | Articles taken from the word; template tests; a native-speaker check |
| **Your time** | Every unit needs choosing, checking and playtesting | About 2-3.5 hours per unit (an estimate, 2.7), with the pipeline doing the drafting |
| **The evidence is mostly adult** | Per-hour rates come from teens and adults; the model's memory settings too | Year-end checks (1.2); re-fit the model to her data; adjust the targets to her |
| **The builder changes** | The game is built in AI coding sessions; three years is a long time | Keep the docs (README, DEVLOG, the plans, this roadmap), the tests and content-rule tests, and the simulation tool up to date, so any builder can pick it up |

### 4.2 Questions only you can answer
1. **How many days a week will she really play?** This sets 110-274 hours, and the end level with it.
2. **Could someone speak Spanish with her for about 10 minutes a week** (you with the game's prompts, a grandparent,
   a tutor)? It is what the research's "stretch" targets assume, and the one thing the game can't supply.
3. **Who builds the game for three years?** Today it is built in AI coding sessions. Is that the plan throughout, and
   who decides what goes in?
4. **Is there a native Mexican-Spanish speaker** who can check new lines about once a month, and at what cost? The
   plan depends on it ("¡Qué caliente!" shows why).
5. **What budget is there**, if any, for a tutor, native-speaker checks, a small server, commissioned art, music or a
   recorded voice?
6. **AI conversation at 9-10: yes, later, or never?** If yes: is a small server with transcripts acceptable?
7. **Who belongs in the family circle**, and on which devices?
8. **Does she play on Windows as well as the iPad?** The two have separate saves today; backup and restore can move
   her game between them.
9. **Will siblings or cousins play too?** (Save size and slots.)
10. **Is a home-screen app OK?** It means moving her save over with a backup code.
11. **Should topics follow her school year** (science, math)?
12. **Should the game finish at 10** (El Gran Viaje, then a keep-it-alive mode), or keep growing toward 12 (the README
    says 7-12)?
13. **Mexican Spanish only?** (Today: es-MX voices, recognition and words.)
14. **Which iPad model and iPadOS version does she use?** This sets how much speed headroom we need and where her
    voice goes.
15. **Is a 15-minute "day" with sunset at about 12-13 minutes right**, or are her sittings longer?

### 4.3 Your answers so far (2026-10-21)
| # | Answer | What it changes |
| --- | --- | --- |
| 1 | **5 days a week** | This confirms the planning calendar (about 181 hours; sections 1.1 and 2.1). The content math, the year-by-year build list and the pace (1.5-2.5 new items a play day) stay as written. |
| 2 | **Yes: she has a real-life Spanish club** | The right-hand column of the can-do table (section 1.2) becomes the realistic target, not a stretch: asking questions back, retelling a short picture story, everyday scenes. The game should feed the club: words and phrases she can use there (greetings, introducing herself, likes, family), and the Learning page can show "words to try at Spanish club". |
| 3 | **The same way as now** (AI coding sessions, you decide what goes in) | No change: units are built in sessions, checked by the tests and the native-speaker pass, and released in small steps (audit 4.10). |
| 4 | **Yes, a native Mexican-Spanish speaker can check lines** | Every new unit's lines go through a monthly check before release. Sprint 1's Spanish fixes (audit 1.9) come with a before → after list for them to check first. |
| 12 | **Finish at 10** | The end goal stays El Gran Viaje at 10, then a keep-it-alive mode (new festivals on real dates, the album, the club). Nothing is planned for 10-12. |

Still open: 5 (budget), 6 (AI conversation), 7 (family circle), 8 (Windows play), 9 (siblings), 10 (home-screen
app), 11 (school topics), 13 (Mexican Spanish only), 14 (iPad model), 15 (sitting length). Sprint 1 goes ahead with
sunset at about 12-13 minutes (15), Mexican Spanish only (13), and backup and restore that also moves a game between
the iPad and Windows (8, 10).

---

## 5. What we'd plan next
- **Do the polish gate first** (`docs/AUDIT_2026-10.md` section 5, roughly 6-9 weeks): Sprint 1 now in small weekly
  releases, backup before the winter break, then the learning-engine and pacing items, the quiz-chain and free-play
  items, speed, and safe releases, before any new unit is built.
- **Find out where she is.** Read her Learning page (words met, chapters done) and run the iPad checklist in the
  audit.
- **Write the Year 1 item list** (about 520 words, up to 75 set phrases, about 20 sentence patterns). Sources: the
  Cambridge young-learner word bands, the Instituto Cervantes A1 list and Mexican children's word lists. Fill the gaps
  (family, food, home, numbers, verbs) and rebalance the animals.
- **Design the unit kit**: what a 20-item unit contains (a place or event that unfolds over about 2 weeks, its daily
  beats, its listen board, its story chapter, a song or riddle, its album entries, its review hooks, its pictures and
  sounds). **Pilot it on one unit** and measure it with the content-time and open-world audits, plus the real build,
  checking and parent time.
- **Build in steps, not all at once:** keep a few months of units ready ahead of her measured pace, and let finished
  units wait in the game until she's ready (3.11).
- **Lay out the Year 1 calendar**: 4 seasons and about 6 festivals on real dates, built once.
- **Answer the rest of the questions in 4.2** (4.3 has the answers so far), especially budget, AI,
  the family circle, Windows play and the iPad model.
- **After 3 months of her real play**, re-fit the simulation's memory settings to her Learning-page numbers
  (`tools/sim-3year.js`) and re-check the pace (1.5-2.5 items a day) and the size of the build list before committing
  to Year 2.

---

## 6. Words used in this file
| Word | Meaning |
| --- | --- |
| Item | One thing to learn and remember: a word, a set phrase, a sentence pattern or a verb form |
| Set phrase / chunk | A phrase learned whole, such as *¿Cómo te llamas?* or *Tengo hambre* |
| Sentence pattern | A sentence with a slot, such as *Quiero ___* ("I want ___"); the game calls its 6 of them phrase patterns |
| Verb form | One form of a verb, such as *como* (I eat) or *comió* (he/she ate) |
| Present / past (preterite, imperfect) | Verb tenses. The preterite tells what happened (*comió*); the imperfect sets the scene (*había una vez*, *era*) |
| *Ser* and *estar* | Spanish's two verbs for "to be" (*es grande*, *está cansado*); learners mix them up for years |
| Unit | About 20 new items in a place or event that unfolds over about 2 weeks of play |
| Unit kit | The checklist of what every unit contains |
| Beat | One step of a unit's or chapter's story |
| First-time content | Anything she plays once (a place, a chapter, a story, a song, a scene) |
| Repeatable systems | Activities built once that give fresh play every day (review, favours, hide-and-seek, events) |
| Practice share | The part of a session spent answering questions, requests and "say it" moments |
| Review-first pacing | New items arrive only when the reviews due are under control |
| Backlog | Reviews that fell due but weren't done |
| Recallable (model) | The simulation's estimate of items she could recall without choices; an optimistic upper bound |
| Durable (model) | Items the model expects she would still recall a month later with no practice |
| Graded reader | A short book written for learners, using a limited set of words |
| ACTFL Novice Mid / High | Levels on the US language-teaching scale (1.1) |
| CEFR A1 / A2 | The European scale's first two levels: A1 is a beginner who handles simple, familiar exchanges; A2 handles routine everyday ones |
| Cambridge Starters / Movers / Flyers | Cambridge's English exams for children, roughly below A1, A1 and A2; their word lists are a guide to pace |
| FLES | Foreign-language programmes in US elementary schools |
| Barcelona Age Factor project | Studies of about 2,000 learners in Spain comparing children and adults learning English at school |
| Planning case | The realistic calendar (about 181 hours) this plan is sized for |
| Sprint | A batch of related fixes in the audit's polish plan |

---

## 7. Sources
The research could read only search abstracts and snippets (full papers couldn't be fetched), so check a source
before relying on a specific number. The full reports, with every source, are in `docs/audit-2026-10/research-targets.md`
and `docs/audit-2026-10/research-growth.md`.

- Cambridge guided learning hours: https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours
- Cambridge young learners' word lists (2018 revision): https://www.cambridgeenglish.org/Images/461823-young-learners-revision-publication.pdf
- National Spanish Exam, hours and proficiency: https://nationalspanishexam.org/wp-content/uploads/2023/12/NSE_Instructional_Hours_and_Proficiency_updated_2023.pdf
- Delaware elementary language proficiency targets: https://education.delaware.gov/legacy/wp-content/uploads/sites/4/2026/02/Delaware-WL-Proficiency-Targets-Non-Immersion-ACCESSIBLE-121825.pdf
- ACTFL research brief on proficiency levels: https://www.actfl.org/research/research-briefs/proficiency-levels-for-k16
- Muñoz 2006, the Barcelona Age Factor project: https://talkbank.org/slabank/access/0docs/munoz2006.pdf
- Myles, Hooper & Mitchell, children learning in chunks: https://www.essex.ac.uk/-/media/documents/departments/langling/myles-elct-15.pdf
- Seymour, Aro & Erskine 2003, learning to read in European spellings: https://bpspsychub.onlinelibrary.wiley.com/doi/10.1348/000712603321661859
- Stories and vocabulary in young learners: Lin 2014, https://nccur.lib.nccu.edu.tw/handle/140.119/49893 ; Winn, https://jalt-publications.org/articles/26646-questioning-efficacy-reading-storybooks-very-young-japanese-efl-learners-vocabulary
- Children reading with a question-asking agent (Xu et al.; Wang et al.): https://escholarship.org/uc/item/21q977wg ; https://researcher.draco.res.ibm.com/publications/same-benefits-different-communication-patterns-comparing-childrens-reading-with-a-conversational-agent-vs-a-human-partner
- Interaction and children (Philp, Oliver & Mackey 2008): https://lwc1.benjamins.com/catalog/lllt.23.toc ; Kuhl 2003 (infants, live vs recorded): https://ilabs.uw.edu/wp-content/uploads/kuhl_2003_pnas_1532872100.pdf
- Speech recognition for non-native children: https://arxiv.org/pdf/2306.16710 ; https://arxiv.org/pdf/2306.04190
- Long-term memory for school Spanish (Bahrick 1984): https://pubmed.ncbi.nlm.nih.gov/6242406/ ; spaced maintenance (Bahrick et al. 1993): https://digitalcommons.fiu.edu/psychology_fac/50
- Reading for fun by age (Scholastic report): https://slj.com/story/scholastic-survey-reveals-large-drop-in-reading-between-ages-8-and-9
- The protégé effect (Chase et al. 2009): https://purl.stanford.edu/zm369yx3532 ; follow-up: https://www.lucs.lu.se/fileadmin/user_upload/project/lucs/ETG-pub/etg2018-conference-AIED-poster.pdf
- Manipulative design in children's apps (Radesky et al. 2022): https://pmc.ncbi.nlm.nih.gov/articles/PMC9206186/
- Safari's 7-day storage limit: https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519
- Safari speech recognition and Apple's servers: https://blog.addpipe.com/apple-speechanalyzer-api/
- Moxie, the robot that stopped with its cloud: https://theregister.com/2024/12/16/moxie_cloud_services_lessons/
