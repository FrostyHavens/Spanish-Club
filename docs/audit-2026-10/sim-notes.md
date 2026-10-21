*Kept as evidence for docs/AUDIT_2026-10.md and docs/ROADMAP_3_YEARS.md (copied 2026-10-21 from the audit's working files). Paths under /tmp point to a temporary folder that will not survive; the simulation is now tools/sim-3year.js and its output is sim-output.txt here.*

I ran the simulation: plain Node, about 4 minutes, 4 seeds per point. At 15 minutes a day she can sustainably take in about **1.5–2 new items per play day**. That is roughly **360–480 items a year** on a realistic calendar, or **1,100–1,450 over three years**, about 6–8 times the game's current 186. About 930–1,350 of those would still be recallable at the end. The current pace of about 5 new items a play day is fine only because the content runs out after about 186 items; if new content kept arriving that fast, most of it would be forgotten.

**Files**
- Script: `/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad/audit2/model/sim.js` (run `node sim.js`; `--quick` is faster; `--calib` prints one word's path through the memory model)
- Full output with every table: `/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad/audit2/model/out-full.txt`
- Raw numbers: `/tmp/claude-0/-home-user-Spanish-Club/56c6d0c5-5673-5d69-87f4-ad0ff9c7afaf/scratchpad/audit2/model/results.json`

## Bottom line
- **Sustainable intake:** 1.5–2 new items per play day (about 7–9 a week). "Items" counts words, phrases and grammar patterns. Across all the variations I tried, the range is 1–3 per play day.
- **Three-year total:** about 1,100–1,450 items met. At the 2-a-day rate that is about 1,080 words, 250 phrases and 100 patterns, with about 1,200 still recallable. That is roughly a beginner (A1) vocabulary, nearing the next level (A2), which is often put at 1,000–1,500 words.
- **Year 1 can take more** if the game always does reviews first and then fills the leftover practice time with new items: about 610 items in year 1, 420 in year 2 and 370 in year 3. This gave the most items remembered (1,352 of 1,409 at month 36).
- **Today's content runs out fast.** All 186 items are met within about 40 play days (about 8–9 weeks), and the engine handles that amount easily: all 186 are still recallable at month 36.
- **Keeping today's pace is the main risk.** At 3 new items a day for three years she meets 2,173 items but recalls only 816. The parent dashboard would still show 70–75% retention (inside its 70–80% target) and 2,153 words as "solid".

## What the game's review model does, from reading the code
1. **The longest review gap is 8 days** (`BOX_DAYS = [0,0,1,2,4,8]`). A well-known word comes back every 8 days forever, so the review load grows with every word added. At 1.5 new items a day, the list of words due for review reaches about 900 by year 3, and 97% of it is never reached.
   - The game still works because well-learned words survive being skipped, at least under this memory model.
   - If the game kept every review on schedule before adding new words, these intervals would top out at about 190 items, or about 370 if every practice moment could pick a due word.
2. **A missed word loses nothing.** It drops a box, but the re-ask 90 seconds later moves it straight back up, so a forgotten box-5 word just returns in 8 days again.
3. **"Solid" is easy to reach and never goes back.** The two same-day follow-ups count toward it, so a word becomes "solid" if she answers it right the next day. Stages never go down, so the dashboard's known/remembered/solid counts end up close to "met".
4. **Retention is measured only on words the game chooses to ask.** It can't see words nobody asks about anymore.
5. **The review engine picks only about 15 due words a session** (dog warm-up 3–4, greetings, favours, the seek hider, Luna's palabra del día). Everything else is quests asking their own zone's words.

## Assumptions

| Item | Value |
|---|---|
| Session | One 15-minute session per play day. Practice share 55% (8.25 min); 40% and 70% also tested. The rest is story and exploring. |
| Time costs | 10 s per question (6–15 tested); 45 s per introduction puzzle (30–60 tested) plus the 2 follow-ups, so about 75 s per new item. Phrases cost 1.4–1.5× and patterns 1.5–2×. |
| Item mix (words / phrases / patterns) | Year 1: 85/12/3. Year 2: 75/18/7. Year 3: 65/23/12. |
| Calendar ("realistic") | Weekdays 90%, weekends 60%, a 6-week summer break at 15%, 2 weeks in winter at 30%, a 3–7 day gap about every 60 days. That gives 241 play days a year (4.6 a week, 60 hours). Ideal, steady and patchy calendars were also run. |
| Memory | Power-law forgetting: next-day recall 69% (76% once 3-card guessing is counted). Spaced successes strengthen a word a lot; repeats the same day add almost nothing. A miss cuts the word's memory strength to 40%. Guess rate 1/3 on taps; 35% of answers spoken. Item difficulty varies. Calibration: under the game's intervals recall climbs to 0.97–0.98, so the 8-day reviews are mostly wasted; with longer intervals it holds at about 0.85. |
| Game rules modelled | The real box intervals, follow-ups, miss/re-ask/slipping rules, stage rules and the dashboard's retention formula. About 15 engine-picked reviews a session; quests ask words from the newest zone or one revisited zone (20 items per zone). |
| Engines compared | **game** = as built. **ladder** = game plus boxes at 16/32/64/128 days. **proposed** = longer intervals, misses that really drop a word back, and quests that ask due words first. |
| Measures | **Recallable** = expected number she would recall now without answer choices. **Durable** = still at least 80% likely after 30 more days with no practice. **Kept** = recallable ÷ met. |
| "Sustainable" | Open world (no gate on new words): at least 80% kept at month 36 and at least 75% retention in months 25–36. Review-first: in year 3, at least 85% of the target still gets introduced on normal play days. |

## Sustainable intake (realistic calendar)
Each cell: new items per play day → items per year; items met → recallable at month 36.

| Engine | 40% practice | 55% practice | 70% practice |
|---|---|---|---|
| Game as built, open world | 1.25 → 302/yr; 905 → 744 | **1.5 → 362/yr; 1,086 → 932** | 1.75 → 422/yr; 1,267 → 1,093 |
| Game + longer intervals only | 1.5; 1,086 → 903 | 2; 1,449 → 1,162 | 2.25; 1,629 → 1,342 |
| Proposed, open world | 1.25; 905 → 821 | **2 → 483/yr; 1,449 → 1,183** | 2.5; 1,811 → 1,486 |
| Proposed, reviews first then fill with new items | 447 / 319 / 275 per year; 1,042 → 998 | **612 / 423 / 374; 1,409 → 1,352** | 783 / 538 / 480; 1,800 → 1,730 |

## Items over time (realistic calendar, 55% practice)
Each cell: met / recallable.

| Run | Month 6 | Month 12 | Month 24 | Month 36 | Retention, months 25–36 |
|---|---|---|---|---|---|
| Proposed, reviews first then fill | 375 / 351 | 612 / 569 | 1,035 / 984 | 1,409 / 1,352 (1,320 durable) | 89% |
| Proposed, open world, 2 a day | 264 / 251 | 482 / 452 | 953 / 858 | 1,449 / 1,183 (1,148 durable) | 87% |
| Game as built, 1.5 a day | 197 / 192 | 361 / 341 | 715 / 646 | 1,086 / 932 (802 durable) | 87% |
| Game as built, 3 a day | 395 / 325 | 722 / 485 | 1,430 / 692 | 2,173 / 816 (286 durable; 2,153 shown as "solid") | 72% |

Higher rates in the as-built open world fall apart quickly: 4 a day leaves 13% kept, 5 a day leaves 3%.

## Daily practice minutes per play day (budget 8.25 minutes)

| Run | Months 1–3 | Months 13–18 | Months 31–36 |
|---|---|---|---|
| Proposed, reviews first then fill | review 4.4 + new 3.9 min (3.2 new a day; 22 due) | 5.8 + 2.5 (2.0 a day; 36 due) | 6.7 + 1.6 (1.2 a day; 72 due) |
| Proposed, open world, 2 a day | 2.5 + 2.4 (13 due) | 5.2 + 2.5 (39 due) | 5.7 + 2.7 (250 due, 224 left over: saturated) |
| Game as built, 1.5 a day | 2.0 + 1.8 (14 due) | 4.8 + 1.9 (350 due) | 5.2 + 2.0 (898 due, 875 never reached) |

Reviews alone grow to about 35–45% of every session by year 2.

## Effect of breaks
| Run (summer 2027 / 2028) | Recallable lost over the break | Retention: 10 days before → first 5 days back | Due on the first day back |
|---|---|---|---|
| Proposed, reviews first then fill | 7% / 4% | 87→84% / 89→86% | 148 / 206 |
| Game as built, 1.5 a day | 5% / 6% | 92→87% / 90→86% | 250 / 618 |
| Game as built, 3 a day | 13% / 13% | 80→71% / 77→66% | 530 / 1,253 |
| Proposed, open world, harsher forgetting curve | 9% / 6% | 90→82% / 85→86% | 122 / 252 |

The calendar mostly changes how many items a year, not the per-day rate. Recallable at month 36 for proposed / as built: ideal 1,819 / 1,365; steady 1,507 / 1,172; realistic 1,183 / 932; patchy 719 / 628.

## Sensitivity
Proposed open-world rate (items per play day) and recallable at month 36, then the same for the game as built.

| Variant | Proposed | Game as built |
|---|---|---|
| Base | 2 / 1,183 | 1.5 / 932 |
| 6 s per question / 15 s | 2.5 / 1,662 · 1.25 / 816 | 2 / 1,219 · 1.25 / 753 |
| 40% practice / 70% | 1.25 / 821 · 2.5 / 1,486 | 1.25 / 744 · 1.75 / 1,093 |
| 10-minute / 20-minute sessions | 1.25 / 789 · 2.5 / 1,548 | 1 / 646 · 2 / 1,192 |
| Practice density matched to the vocab audit (70% practice, 8 s, about 5 prompts/min) | 3 / 1,769 | 2 / 1,222 |
| Introduction 30 s / 60 s | 2 / 1,267 · 1.75 / 1,084 | 1.75 / 1,024 · 1.5 / 905 |
| Harsher forgetting curve | 1.75 / 1,112 | 1.25 / 773 |
| Pessimistic memory | 1.5 / 904 | **0.75 / 491** |
| Optimistic memory | 2 / 1,266 | 1.75 / 1,081 |
| All words, no phrases / phrase-heavy mix | 2.25 / 1,351 · 1.75 / 1,105 | 1.75 / 1,065 · 1.5 / 906 |
| Review engine reaches 8 / 30 due words a session | (not applicable) | 873 / 1,059 recallable |

Question time, practice share and session length matter most. Memory pessimism hurts the as-built engine about twice as much as the proposed one. The longer intervals alone give about +25% recallable and +43% durable.

## What this means for the content buildout (realistic calendar, 55% practice)
- **Items per year:** 360 (as built) to 480 (proposed), or about 610 / 420 / 370 with reviews first. That is about 1,100–1,450 over three years. On other calendars: ideal 550–730 a year, steady 460–610, patchy 220–300.
- **Themed areas:** 18–24 a year at 20 items each, or 14–19 at 25; about 55–70 in total. These can be new zones or new units inside existing ones, such as buildings, events or characters.
- **Pacing:** a 20-item area has to hold about 10–13 play days (2.5–3.3 hours) of play. At today's pace one lasts about 4 play days.
- **Authored first-play content:** 2.5–3.5 minutes per item (from the Villa Sol audit and the README's errand times). That is 15–28 hours a year, out of 60 hours of play a year (25–47%); today's game has about 8–11 hours of it.
- **Repeatable systems:** they have to fill the other 53–75% of play time. A typical session at the sustainable rate is about 2.5 minutes meeting new items, 4–6 minutes reviewing and 6.75 minutes of story and exploring.
- **Engine changes to make before scaling content:**
  - longer intervals (16/32/64/128 days);
  - misses that really drop a word back, and a re-ask that doesn't restore the box;
  - quests that ask due words first;
  - "review first, then new" pacing that slows new words without locking any area;
  - dashboard measures that show forgotten words: words not used in 30 or 60 days, and an estimate of how many met words she still recalls;
  - "solid" that can decay.

## Limits of the model
- Words she only hears in dialogue or on signs are not counted, so the estimates are on the low side.
- Phrases reusing words she already knows, and interference between similar words, are not modelled.
- Motivation and boredom are not modelled; running out of new content is the likely real failure mode.
- Her learning will probably speed up between ages 7 and 10; the model keeps it constant.
- The memory settings are borrowed from adult flashcard research and tuned to the game's 70–80% retention target; they are not measured on her. Once real play data exists, they should be re-fitted to the Learning page's retention numbers.