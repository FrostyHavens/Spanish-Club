# Next actions (22 November 2026)

One list of what to do next, in order, drawn from the polish plan (`docs/AUDIT_2026-10.md` section 5), the
three-year roadmap (`docs/ROADMAP_3_YEARS.md`) and a fresh read of the code. It replaces hunting through those
documents for "what is left".

**How this was checked.** Seven reviewers read the repository, one area each, and a last one looked for gaps. They
read code and documents only: **no tests were run and nothing was measured on her iPad.** Anything marked
*(unchecked)* was read from the code but not reproduced in a browser.

**Sizes** are the audit's: **S** = hours to a day, **M** = a few days, **L** = a week or more.

---

## Status on 23 November 2026

**Built on the work branch and tested, ready to release** (see the DEVLOG entry of 22 November): her save survives
the re-split chapters; reviews are spread after a break; speed for the old iPad with a speed test; readable cards;
night on every outdoor map; the day's clock over a reload; a full proofread of the Spanish with its fixes; and the
two waiting Sprint 3 items (shorter chains, Mexican names).

**What we learned from you:** she has about 52 stars, which is her second sitting; she has been away a few weeks;
her iPad stops at iPadOS 15; no native speaker can check the Spanish.

**Done from the list below:** all of Step 1; from Step 2 the small fixes (clock, night-walk card, night maps,
sound), the "tarjetas" and "Huellas" lines and the welcome-back rule (2.6); from Step 3 speed (3.1), the save part
of safe releases, and readable cards (3.5).

**Next, in order:**
1. Free play carries language, and the arrow leads to animals she has not met (Step 2, items 2.1-2.4).
2. Favours and listen-and-do before Villa Sol chapter 7 (2.5).
3. Reviews keep up with reviews due (3.7): the bot does 18-22 a day while more fall due.
4. The rest of safe releases (a beta copy with its own save, held-back units), the missing tests, content rules as
   tests (3.2-3.4), and the 21 error paths that still miss the Problem log.
5. Then the road to new content (Step 4).

**For you:** check her saved game is still on the iPad and make a backup; after she plays, read the speed line on
her Learning page and share the page's text; and if you know why she stopped after two sittings, say so.

The rest of this page is the list as written on 22 November, kept for its detail.

---

## Where things stand

- **Her game has not changed since 22 October.** The play link serves `main`, which holds Sprints 1 and 2.
- **Two finished Sprint 3 items are waiting on the work branch** (`claude/zen-sagan-mr8xwf`, 8 commits ahead of
  `main`): shorter question chains (3.1) and the Mexican names (3.10). They are **not safe to publish as they are**;
  Step 1 below says why.
- **The rest of Sprint 3 and all of Sprint 4 are not started.** The half-built free-play work was lost when the
  cloud machine was replaced, and nothing of it can be recovered.
- **She is probably at or near the end of first-time content.** She started about 9-11 October, and the audit
  expected the arrow-led story to run out between mid-November and mid-December. Nobody has read her real numbers
  yet.
- **The winter break starts about 20 December**, four weeks away.

**The gate** is the set of polish items that must be done before the first new unit of content. Of its 28 items:

| State | Count | Which |
|---|---|---|
| Built and live | 21 | Sprint 1 (all 12) and Sprint 2 (2.1-2.6, 2.8, 2.9, 2.12) |
| Built, not published | 1 | 3.1 shorter chains |
| Partly built | 2 | 4.4 missing tests, 4.8 content rules as tests |
| Not started | 4 | 3.2 free play, 3.3 readable cards, 4.1 speed, 4.10 safe releases |

The gate also asks for a start on 4.2 (cleaner hooks for new places), which has not begun.

Two caveats on "built and live":
- **Sprint 1 has three checks still open:** the backup has never been restored on a second device, the "arrow
  alone finishes every place" test covers less than the plan asked, and some errors still miss the Problem log.
- **Sprint 2 misses two of its own targets on the last measurement:** reviews done (70) trail reviews due (110),
  and 8-11 reviews are left waiting at the end of a sitting against a target of 5.

---

## For you this week (no building needed)

1. **Back up her game on the iPad and restore it on the Windows PC.** Grown-ups menu, Back up, keep the dated
   file. This is the one check that protects her progress, and it has never been tried on two devices.
2. **Share her Learning page.** Learning page, Share, and paste the text into the next build session. If "words
   met" is about 150 or more, she has run out of arrow-led content. Every date below is a guess until this is read.
3. **Find the iPad's model** (Settings, General, About) and whether it offers an update past iPadOS 15. Safari
   15.6 suggests an older iPad. If so, the speed work moves up the list.
4. **Send `docs/SPANISH_REVIEW.md` to your native speaker** and note how long it takes to come back. Batches 1
   and 2 are already in her game unchecked. The turnaround sets the release date of every future unit. (Step 1
   tidies the file into one page of questions first; send it after that if you prefer.)
5. **Two quick checks on her iPad:**
   - Lock the iPad for a minute in the middle of a game, unlock it and tap the map. Do the music and tap sounds
     come back? The code suggests they may stay silent *(unchecked)*.
   - Run the Microphone test with her, each of the 12 words twice, and share the log. Nobody has measured how
     well the iPad hears her voice.
6. **Four decisions:**
   - **Publish the new names now or after the native speaker answers?** Publishing changes names she already
     knows (Profesora Luna becomes Maestra Luna, Abuela Rosa becomes Doña Rosa, rosado becomes rosa). You may
     want to tell her.
   - **Should units follow her school year** (roadmap question 11)? It sets the order of the Year 1 word list.
   - **What budget is there** for a tutor, native checks, art, music or a recorded voice (question 5)? It decides
     what a unit's pictures, songs and voice are made of.
   - **The first new unit's theme.** The proposal is "En casa: la familia y la comida", in her existing home.

---

## Step 1. Publish what is built, safely

About one build session. Nothing here is new to her, but it makes every later release safe.

| # | Action | Size | Why |
|---|---|---|---|
| 1.1 | **Make a mid-chapter save survive the release.** The save records her place in a chapter as a step number. The branch re-split 19 of 36 chapters, so an old step number now points at a different step. In chapter 6 it points past the end, and that story line would stop for good *(unchecked)*. Fix: a chapter whose step is past the end finishes itself; a started chapter remembers which version of its script it began on, and restarts cleanly if the script changed. Test every changed chapter at every old step. (`src/chapters.js`, `tools/test-chapters.js`) | M | She often stops mid-chapter. A stuck story on her real save is the worst thing a release can do. |
| 1.2 | **Review the Sprint 3 changes independently**, as Sprints 1 and 2 were. Press on: a greeting that is now said and not asked (is a due word still asked that day?), and a phrase that waits while a favour waits (can it wait forever?). | S | The two earlier reviews found 30 real problems the tests had passed. |
| 1.3 | **Rebuild.** `index.html` still carries old version stamps for 19 scripts, and the single-file game still says "Profesora". Run `python3 tools/build.py`. | S | Without it her browser can mix cached old scripts with new ones. |
| 1.4 | **Run the full tests on the exact commit to publish** and record the result, including the longest question chain per chapter from `tools/test-chains.js`. | M | No test pass is recorded for the branch. |
| 1.5 | **Re-run the learning audit and keep its report in the repo.** The last report went to a temporary folder and is lost. Make it print all eight Sprint 2 targets as pass or fail, and split practice into due words, new words and words that were not due. (`tools/learning-audit.js --write-docs`) | S | Free play is judged against a number that is a month stale. |
| 1.6 | **Write up Sprint 3 so far**: a DEVLOG entry and a status line in the audit. | S | The documents stop at Sprint 2. |
| 1.7 | **Tidy the Spanish review file** into one page of questions with room to answer, then the line tables. Merge the two questions about "rosa". | S | The reviewer is a volunteer; a clear page gets answers. |
| 1.8 | **Add a `CLAUDE.md` handoff note** at the top of the repo: what the game is, the commands, how to publish, the house rules, which documents are current. | S | A new build session today has to rediscover all of it from 5,900 lines of documents. |
| 1.9 | **Remove the temporary-folder path hard-coded in three tools** (`tools/harness.js`, `learning-audit.js`, `vocab-audit.js`). | S | It is how the audit report was lost. |
| 1.10 | **Tag the release and publish**, with your go-ahead. Add a quick pre-publish check: the build is fresh, every script parses, the single file starts. | S | A tag is the way back if a release goes wrong. |

---

## Step 2. A bridge release before the break

Aim: on her iPad before about 20 December. This gives her new things without waiting for new Spanish to be
written and checked, because it surfaces words and animals already in the game.

| # | Action | Size | Why |
|---|---|---|---|
| 2.1 | **Decide what free play asks once nothing is due.** The target is 3 practice moments a minute. That target can be met by repeating words that are not due, which the memory system ignores. Write the rule down first: due words, then held-back new words, then which others. | S | The target can be hit in a way that teaches her nothing. |
| 2.2 | **Free play carries language** (plan item 3.2). Rebuild in this order: one shared helper for a single practice moment; fetch as a spoken request ("¡Trae la pelota azul!"); "¿Quién es?" on every hide-and-seek find; one moment per dog spot; one on an animal tap; one each for petting, feeding and gifts. Met words only, and never more than one question between map actions. (`src/carry.js`, `seek.js`, `zones.js`, `animals.js`, `pet.js`) | M | Free play is most of her sitting and has 1.5 practice moments a minute. Due reviews alone close about a third of the gap, so spoken requests have to do the rest. |
| 2.3 | **The arrow leads to animals she has not met** (3.9), with hints for the morning and sunshine animals. | M | The arrow's path meets only 156 of 180 words and 27 of 50 album animals. The rest is about two weeks of new things at her pace. |
| 2.4 | **One cue per target** (3.6). The same files as 2.2. | M | Two arrows or hints at once confuse her about what to do. |
| 2.5 | **Favours and listen-and-do start without Villa Sol chapter 7.** Today a child who explores first never gets them. (`src/favores.js`) | M | They are the game's best listening practice. |
| 2.6 | **Measure the first days back from a break.** Add a "skip 16 days" option to the learning audit, read what she would meet on her return, then decide a welcome-back rule with you. | M | No rule exists. She could come back to a wall of reviews and nothing new. |
| 2.7 | **Small fixes that ride along:** | S each | |
| | - A word held back by pacing is taught on the first free day. Today it can be dropped unseen. (`src/warmup.js`) | | |
| | - The day's clock survives a page reload. Today a reload at minute 8 gives a 20-minute day. (`src/day.js`) | | |
| | - Words met on the night walk appear on a ¡Hoy! card. | | |
| | - Night is drawn on every outdoor map; the sleeping bear shows (3.7). | | |
| | - Sound wakes after the iPad was locked. (`src/audio.js`) | | |
| | - The 21 error paths that only reach the console go to the Problem log. | | |
| | - "cartas" becomes "tarjetas" for the notebook's cards in chapter 16; "Huellas" is plain text. | | |

---

## Step 3. Finish the gate

These must be done before the first new unit goes live. Some can overlap with Step 4's documents.

| # | Action | Size | Why |
|---|---|---|---|
| 3.1 | **Speed, test first** (4.1). A test that fails over 16 ms a frame on a machine slowed 4 times, with three cases: today's maps, three times the content, and a 1,000-word save. Then the fix: look chapters up by name, work out "what is going on" once a frame, stop rescanning every word each frame. (`src/chapters.js`, `seek.js`, `guide.js`, `words.js`) | M | Walking was 30-42 ms a frame at the audit. Since Sprint 2 the cost also grows with her word count. |
| 3.2 | **Safe releases** (4.10). A beta copy with its own save, held-back units that open by her pace or a date, and a tested way back to the previous release. | M | Every GitHub Pages site of one account shares browser storage. A beta opened on her iPad today would read and write her real save. |
| 3.3 | **The missing tests** (4.4). Save size after a simulated year, and "the single-file game starts". Both can run without a browser, in about a second. | S | By simulation a 2,000-word save is about twice the planned limit. |
| 3.4 | **Content rules as tests** (4.8), and rebuild the tool that measures how long a place lasts. | M | Every new unit has to pass the same rules without a person checking them. |
| 3.5 | **Readable cards** (3.3). 74 labels are squeezed. Wrapping at spaces fixes one of them, so this needs a font or card-size decision. | M | She reads the cards; squeezed text is the game's main reading surface. |
| 3.6 | **A start on cleaner hooks** (4.2), only for the functions every new place touches. | L | The builder's guide still teaches stacking wrappers; each new place adds more. |
| 3.7 | **Reviews keep up with reviews due.** Re-measure after Step 2. If still behind: a second dog review moment, most overdue word first in free play, one new item a day while more than 10 wait. | S | A backlog that never clears means words slide past their review date every day. |

---

## Step 4. The road to new content

The documents (4.1, 4.2, 4.6) can be written while Steps 2 and 3 are built.

| # | Action | Size | Who | Notes |
|---|---|---|---|---|
| 4.1 | **Write the Year 1 word list**: about 425 new items in about 21 units. First 40-60 items by early December. | M | You and the builder | Today's gaps: family (4 words), home (2), everyday verbs (none), days, school things. Add Mexican animals; do not remove the three non-Mexican ones she has already met. |
| 4.2 | **Design the unit kit**: what every 20-item unit contains, sized to unfold over 8-13 play days. | M | You and the builder | Today a place is used up in 2-3 play days. |
| 4.3 | **Let a unit add a sentence pattern** without hand-wiring. | M | Builder | Each of today's 6 patterns is wired by hand. |
| 4.4 | **A native-speaker check per unit**, tied to release. | S | You and the reviewer | |
| 4.5 | **Build one pilot unit end to end** and record what it cost in hours. | L | You and the builder | Built held back, checked, tried on the beta, then opened. Earliest realistic date: the first week of January 2027. |
| 4.6 | **Lay out the Year 1 calendar** of seasons and festivals. | M | You and the builder | Las Posadas 2026 is too close; it returns next December. Aim first for Día de Reyes on 6 January, which reuses "la carta" and "los zapatos". |
| 4.7 | **Order the repeatable systems** on one page: favours that level up, friendship past 5 hearts, album depth, decorating her room, letters and sounds. | S | You and the builder | About 62% of three years of play has to come from systems built once. No action covered this before. |
| 4.8 | **Re-fit the three-year simulation**, in two parts. Now: to the memory engine as built. Mid-January: to her real numbers. | M | Builder, then you | Her detailed history covers 60 play days, which runs out in mid-January. Keep the weekly backups. |
| 4.9 | **Run the first year check by hand in January**: 20 pictures to name, 20 words to point at, three requests, a story retell. | S | You | The only outside measure of whether the game's own numbers are true. |

---

## Can wait

These can run beside the first new content.

- **Looks and sound** (Sprint 3): music that resumes after doors and jingles (3.4); sound effects, including the
  missing bounce (3.5); the phrase demo's face (3.8); "turn your tablet" (3.11); places that look like themselves
  (3.12); first impressions (3.13).
- **Engineering** (Sprint 4): a faster test runner and a test clock (4.3); smaller saves and Safari's real storage
  limit (4.5); a home-screen app that works offline (4.6); menus that stop redrawing the map (4.7); dead code
  (4.9).
- **Testing reach:** run a few tests in a Safari-like browser, since all 1,600 checks run in Chrome's engine; a
  small automatic check on GitHub.
- **Learning page:** use the real number of choices when judging a guess; keep the mid-sitting dog moment in the
  history; counters for say-it-first (asked, said right, heard something else, nothing heard).
- **Waiting on an answer:** split the "caliente" card into calor and caliente (native speaker); teach 2-3 colours
  and the numbers 1-3 early in every place (your call); a press held longer than 0.8 seconds does nothing (watch
  one sitting first).
- **Housekeeping:** the restore-undo copy never expires; `docs/CURRICULUM.md`, `CONTENT.md`, `WORLD_PLAN.md` and
  the README disagree with the code in places; an old branch from 5-6 October is still on GitHub.

---

## Your open questions

From `docs/ROADMAP_3_YEARS.md` section 4. Questions 1-4 and 12 are answered.

| # | Question | Blocks |
|---|---|---|
| 5 | What budget is there (tutor, native checks, art, music, recorded voice)? | The unit kit |
| 6 | AI conversation at 9-10: yes, later or never? | Nothing yet |
| 7 | Who is in the family circle, and on which devices? | Which relatives the family unit names |
| 8 | Does she also play on Windows? | How saves move |
| 9 | Will siblings or cousins play too? | Save slots |
| 10 | Is a home-screen app OK? | Offline play |
| 11 | Should topics follow her school year? | The order of the Year 1 list |
| 13 | Mexican Spanish only? | The calendar |
| 14 | Which iPad model? (The version is known: Safari 15.6.) | How urgent speed is |
| 15 | Is a 15-minute day with sunset at 12-13 minutes right? | The day's length |

New, from the roadmap's "decide early" list: **voice** (the device's, or a recorded native voice for songs and
stories), **pictures** (drawn in code, or commissioned) and **music** (composed in code, or commissioned).

---

## Dates

| When | What |
|---|---|
| 22 October | Last change to her game |
| Now to mid-December | First-time content probably runs out |
| About 20 December | Winter break starts; a fresh backup before it |
| 6 January 2027 | Día de Reyes, the first dated event to aim for |
| First week of January | Earliest realistic date for the pilot unit |
| Mid-January | Three months of play: re-fit the simulation; her 60-day history window fills |
