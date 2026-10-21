*Kept as evidence for docs/AUDIT_2026-10.md and docs/ROADMAP_3_YEARS.md (copied 2026-10-21 from the audit's working files). Paths under /tmp point to a temporary folder that will not survive; the simulation is now tools/sim-3year.js and its output is sim-output.txt here.*

# Research: how Club de Español should grow from age 7 to 10

*Scope: long-term engagement, child development from 7 to 10, safe AI conversation, family co-play, scaling content, and keeping the build sustainable. I also checked the repo (read-only) where it bears on the recommendations; those notes are marked "Repo". Statements marked "inference" are my own reasoning, not findings from a source.*

## 0. The answer in ten lines

1. **Time budget.** 15 min/day for 3 years is 16,425 minutes, about **274 hours**. With realistic attendance (5 days a week, 48 weeks a year) it is **about 180 hours**. That is close to a good elementary Spanish program (FLES: Foreign Language in the Elementary School). States set FLES end goals at **ACTFL Novice Mid to Novice High** after 2-3 years at about 90 min/week, and Oklahoma expects about 365 hours to reach Novice High [54]. Adults need 600-750 hours for working proficiency (FSI) [53]. ACTFL is the American Council on the Teaching of Foreign Languages; its scale runs Novice, Intermediate, Advanced.
   - **A realistic end goal at age 10:** Novice High in listening and speaking about familiar topics, Novice High to Intermediate Low in reading, and **about 800-1,200 words she understands plus 150-250 set phrases**. Spanish students learning English in primary school sit within the 1,000-most-common-words level [55]. Today's game (about 180 words and 6 patterns) covers roughly the first year.
2. **What carries 3 years.** Not a stream of one-off content but **systems that renew themselves**:
   - a real-calendar seasonal cycle that comes back every year (Animal Crossing, Stardew) [1][4];
   - a collection with more layers (Pokédex) [5];
   - an open building or decorating space (Minecraft creative mode) [6];
   - a family layer (co-play) [41][42].
3. **The game has to grow up with her.** Children drop "babyish" things early [19]. Reading enjoyment falls sharply at 9 [17]. Children start to love riddles and double meanings from about 7 [18].
   - Inference: let **Canelo grow from puppy to adult dog**.
   - Move from pictures toward reading: Spanish spelling is easy to sound out [16].
   - Shift the tone toward humour, mysteries and her own goals.
4. **Arc for the end goal (inference):** explorer (7-8), then reader and helper (8-9), then storyteller and guide (9-10). It ends in a **"Gran Viaje"**: a trip with grown-up Canelo to a Mexican town for a festival, where she uses everything she has learned. After it the club is hers to lead: she teaches a parent or cousin, which uses the protégé effect [48].
5. **AI conversation: yes, but late, bounded, and never required.**
   - The best-supported version is a **scripted NPC (non-player character) that asks questions during a story**. It matched a human partner for 3-6-year-olds' comprehension [21] and needs no large language model (LLM).
   - When a live LLM is added (around ages 9-10, parent-enabled): keep it to game topics only, give it a word list, check its output, keep a transcript for the parent, and fall back to scripted lines on any failure. Never make it a "companion" [27][28][29][30].
   - Cost is negligible: about $2-3 a year on Claude Haiku 5.5 [40]. The real costs are privacy, a small server to hold the API key, and safety maintenance.
6. **Recognising children's speech is unreliable.** Error rates are several times higher for children than adults [25], and higher again for a learner's accent. Open voice-to-LLM chat will mishear often, so always keep tap or choice fallbacks.
7. **Family features have strong evidence.** Joint play helps learning [41][45], and what parents *do* matters more than their attitudes [44]. Build the family join code to work **asynchronously** first [42]: postcards using a menu of Spanish phrases (Club Penguin "Ultimate Safe Chat") [46], trades, and visits. No free text and no strangers [20].
8. **Content pipeline.**
   - Plain-text content files, as now.
   - Automated "content contract" tests (extend `tools/vocab-audit.js` and `tools/audit-intuitive.js`).
   - Templates that change items, amounts and places, which players read as variety [50].
   - An LLM drafts, the parent selects and edits (Ubisoft Ghostwriter pattern) [49].
   - A human always reviews before release [51], with a native speaker checking es-MX.
9. **Sustainability risks to fix before new content (Repo):**
   - **All progress lives only in Safari `localStorage`** (`src/core.js:240-242`, `src/state.js:90-96`).
   - There is no web app manifest, no persistent-storage request, and no export.
   - Safari deletes script-written storage after 7 days of browsing without visiting the site; apps added to the Home Screen are exempt [59].
   - Three years of progress needs a "save code" export and import, plus Add to Home Screen. The save code is also the first step toward the family code.
10. **Guardrails to keep (Repo-confirmed):**
    - No streaks or guilt: grep found no streak or "missed you" mechanics.
    - No stars shown, no daily caps, no locks.
    - Manipulative design such as a sad pet, invented time pressure, or lures to keep playing is common in children's apps [10]. Canelo must **never be sad that she was away**.

---

## 1. Long-term engagement: what keeps children playing for years

### Lessons from the reference games

| Game | What sustains play | Evidence and notes | What it means for Club de Español |
| --- | --- | --- | --- |
| **Animal Crossing: NH** | Real-time clock; seasonal events tied to real dates; always-available activities (crafting, island design) | Events checked the real date. A developer said the aim was to experience events "alongside friends and family" [1]. Always-available activities reduced the urge to cheat the clock [2]. Free updates for about 20 months, a "final" 2.0 in Nov 2021, then still an update 3.0 in Jan 2026 [3] | A **real-date seasonal calendar** shared with family. Seasonal content is built once and comes back every year: it pays off three times |
| **Stardew Valley** | Four 28-day seasons. Crops, foraging and fish change by season. Low stakes: "nothing missed forever". Players set their own goals [4] | Reviews, not studies | Seasons change *what is available* (animals, items, festivals), not what is allowed. **Nothing missed forever**: an event animal returns next year |
| **Pokémon** | Completing the collection ("one of each"), identity, sharing with friends [5] | Motives shift with age: 5-7 care about **quantity**, 7-11 about **value**, social reasons take over around 11 (Nebraska study via ICv2, secondhand). Japanese schoolchildren pick favourites as "cool, strong, cute" [5] | Give the album depth: rare forms, seasonal visitors, a "research level" per animal earned with Spanish facts (inference), favourites, family trades |
| **Minecraft** | Building in creative mode; social play | 53% of 6-8s and 68% of 9-12s play (survey of 753 Australian parents). Parents' top benefit was creativity. Free, uninstructed play gave the most creative results [6] | An **open building and decorating space** (Canelo's house, her garden, her own stand): placing things means naming them. It never runs out of content |
| **Toca Boca** | "Toys, not games": no rules, no instructions [7] | Critique: some children find it aimless [7] | Mix it: a sandbox plus light goals, which is what playtests asked for |
| **Prodigy** | RPG wrapper, membership | Its effectiveness claims are mostly company-published, one without a control group [8]. A coalition of 22 groups filed an FTC complaint over pressure to buy Premium [8] | Never put rewards behind pressure; keep learning claims honest on the parent dashboard |
| **Duolingo** | Streaks | Company A/B test: separating the daily goal from the streak raised day-14 retention by 3.3% [9]. A case study argues streaks build dependence on the app rather than a habit [9] | Use a gentle **"what's new today"** cue, not a streak. A warm-up already exists |

### Cross-cutting findings
- **Novelty fades in weeks.** A 3-year study of a gamified system saw high activity at launch, a drop a few weeks later, and lasting engagement only once the activity was meaningful [12]. Plan structural changes (new systems or verbs), not only more of the same.
- **Choice and competence predict enjoyment and continued play** (self-determination theory; Ryan, Rigby & Przybylski 2006, adult samples) [13].
- **Expected tangible rewards can undercut intrinsic motivation** (Deci, Koestner & Ryan meta-analysis). The size of the effect is disputed (Cameron & Pierce) [11]. The game already removed stars, which is good. Keep rewards as surprises or information ("your card flowered"), not payment.
- **Avoid manipulative design.** In apps used by 160 children aged 3-5, only 20% had no manipulative features. The features included pressure from on-screen characters the child is attached to, invented time pressure, and lures to keep playing [10]. Limited-time events with permanent loss would be invented time pressure; "Canelo is sad you left" would be character pressure.

### Recommended cadence for a parent-built game (inference)
- **Yearly cycle, built once and reused 3 times:**
  - 4 seasons: visual changes, plus seasonal animals and items.
  - About 6 recurring Mexican calendar events: Día de Reyes (Jan 6), Día del Niño (Apr 30), summer, Independence Day (Sep 16), Día de Muertos (Nov 1-2), Las Posadas (Dec 16-24) [58].
  - Each year adds one new item or animal to each event.
  - This is culture teaching as well as engagement.
- **Monthly small drop:** a new animal or rare form, a set of Tomás letters, a riddle pack, a new favour type. Mostly templated (section 5).
- **Quarterly or twice-yearly chapter:** a new story arc or region. Over 3 years that is about 3 new regions plus the finale. Cap it there for sustainability.
- **The no-FOMO rule:** an event's exclusive items come back the next year. Anything missed can be bought later or found with Lola. FOMO is "fear of missing out".

---

## 2. How she changes from 7 to 10, and what that means

| Area | 7-8 | 9-10 | Design implication |
| --- | --- | --- | --- |
| **Thinking** | Concrete operations: logic works on things she can see and handle; abstraction is hard [14] | Better planning, categorising, multi-step problems [14] | Grammar as concrete patterns (pictures, sorting games) at 7-8. At 9-10, short explicit pattern hints ("-o / -a") and multi-step quests and mysteries |
| **Reading** | Still "learning to read" in English [15] | "Reading to learn" from about grade 4; the fourth-grade slump hits when texts get harder [15] | **Spanish decoding is fast**: children reading transparent spellings like Spanish read accurately within about a year, and English is more than twice as slow [16]. From about 8, add Spanish phonics (letters and sounds, signs, labels). At 9-10, short Spanish texts: letters, comics, signs |
| **Reading motivation** | 57% of 8-year-olds read for fun 5-7 days a week [17] | **Drops to 35% at 9**; "love reading" falls from 40% to 28% [17] | In-game reading must be **funny, short and chosen**: 52-70% of children want books that make them laugh, and favourite books are self-chosen [17] |
| **Humour** | Riddles and double meanings from about 7 [18] | Riddle understanding deepens through 11: sound-based, then word parts, then sentence structure, then idioms [18] | *Adivinanzas* (riddles), a big tradition in Mexican children's culture (inference). At 8-9, puns using words she knows; at 10, idioms (*¡Qué padre!*) |
| **Image of herself** | Happy with "cute" | Children leave little-kid toys earlier ("kids are getting older younger"; NPD industry data from the 1990s) [19] | **Age the game up**: Canelo grows from puppy to young dog to adult dog (inference). Cooler outfits, adventure and mystery tone, less baby talk, a darker or "cool" UI option |
| **Autonomy** | Likes guided choices | Wants her own goals and spaces [13] | A personal house or garden, picking projects, a goal board she writes herself, her own nicknames for animals |
| **Social** | Plays alongside family | Gaming becomes time with friends, siblings and family (Ofcom). 36% of 8-17s who game online have played with strangers (2021) [20] | A closed **family circle** only. Things she can **show off**: photos, a town tour, her album |
| **Collecting** | Values quantity | Values rarity and value, then social trading by about 11 [5] | Rarity tiers, variants, trades with family |

### Where the game could go, year by year (inference, built on the above)

| Year | Child | Her role in the game | Spanish target | New systems |
| --- | --- | --- | --- | --- |
| **1** (7-8) | Explorer | Meets the world, collects, helps | About 300-400 words understood; single words, then set phrases; listen-and-do | Polish; seasons and events; save code; album depth; building and decorating; family postcards |
| **2** (8-9) | Reader and helper | Runs errands with choices, reads signs and letters, trains Canelo with Spanish commands (teaches through movement) | About 600-800 words; 2-3-word phrases she builds; starts decoding Spanish | Phonics and a reading layer (signs, Tomás's letters in Spanish, comics); riddles; small mysteries; trades; a templated favour generator |
| **3** (9-10) | Storyteller and guide | Solves mysteries, plays scenes (market, directions, restaurant), teaches a parent or cousin, hosts the festival | About 1,000+ words understood, 300-500 she uses; short conversations; reads short texts | NPC conversation scenes (scripted first, then a bounded LLM with parent opt-in); "teach the grown-up" mode; **El Gran Viaje** finale; the club as a leadership role |

**Why a finale:** a defined end point (a trip, a festival she hosts, a "diploma") marks a natural graduation at about 10. The world stays open afterwards, as Stardew does after its main goals [4]. Leading the club (teaching a parent, cousin or younger child) draws on the protégé effect: students worked harder learning for an agent they taught [48]. A follow-up found weaker links, so treat it as motivation, not a guarantee [48].

---

## 3. Conversation practice: AI dialogue, done safely

### Evidence that conversation partners help
- **Dialogue-based systems help adult learners (meta-analyses):**
  - Bibauw et al. 2022: d = 0.59 on L2 proficiency [22].
  - Hou & Min 2025, speaking specifically: g = 0.61 across 16 studies. The kind of system, **how constrained its meanings are**, and whether it uses speech or text all changed the size of the effect. Corrective feedback did not [23].
  - A 2024 meta-analysis in *Review of Educational Research*: g ≈ 0.48 across 28 studies [24]. I matched this from a repository record, so verify the citation.
  - Almost all of this is adults or teenagers. **I found no controlled trial of LLM chatbots improving young children's L2 speaking.**
- **Children's direct evidence favours *dialogic questioning* during stories:**
  - Xu et al. (CHI 2021): a conversational agent asking questions during reading gave 3-6-year-olds the same comprehension benefit as a human partner [21].
  - Wang et al. (CHI 2021): similar result. Children were *more intelligible* to the agent, but their talk to the adult was richer and more varied [21].
  - These agents were essentially scripted question-askers, not open chatbots. That kind can be built today with no LLM.
- **Human-written NPC dialogue still wins:**
  - Players preferred Disco Elysium's original writing over GPT-4 dialogue grounded in game state [26].
  - Keeping LLM-generated NPC dialogue true to the game world is still unsolved [26].
  - Tighter prompt constraints made quest NPCs stable but less believable [26].

### Risks, rules and the industry direction
- **Safety outcomes:**
  - Common Sense Media: AI companion apps pose "unacceptable" risks and should not be used by anyone under 18.
  - Its AI-toy tests (accounts set to ages 6-13): more than a quarter of outputs were inappropriate (self-harm, drugs), with emotional-attachment design and voice data collection [27].
- **Regulators and companies:**
  - FTC 6(b) inquiry (Sep 2025) into AI companions and children [28].
  - Character.AI ended open-ended chat for under-18s (Nov 2025) [30].
  - California SB 243 (in force Jan 2026) requires disclosure, break reminders for minors and crisis protocols. It **excludes chatbots in video games limited to game topics that cannot discuss mental health, self-harm or sexual content** [29]. Read secondhand; check the bill text.
  - Inference: the design that falls outside the companion-chatbot law is also the right design for her.
- **Provider policy:** Anthropic allows API use in products for minors only with safeguards: age checks, moderation and filtering, monitoring, educational guidance, AI disclosure, and COPPA compliance [31].
- **Model behaviour:** child-safety benchmarks show large variation between models and prompts. Telling the model the user is a child improved safe responses by 9-47%, and explicit age instructions by a further 10-30% (KIDBench) [32].
- **Privacy:**
  - The COPPA amendments took effect Jun 23, 2025, with compliance by Apr 22, 2026: separate consent for disclosure, limits on how long data is kept, third-party safeguards [33].
  - FTC 2017 voice policy: audio may be used without parental consent only as a **stand-in for typed text, deleted immediately**, and never used for identification [34].
  - COPPA targets commercial operators. A family project is probably not one (not legal advice), but these are the right standards.
  - **Repo note:** the existing microphone feature uses Safari's Web Speech API, which appears to send audio to Apple's servers [35]. Say so on the parent dashboard.
- **Speech recognition for children:**
  - Whisper's error rate on read speech: about 3% for adults versus about 25% for children; 11-18% for children generally and up to 35% for kindergarteners [25].
  - Fine-tuning helps (13.9% to 9.1%) but is out of reach for a web game [25].
  - Implication: free spoken chat will often mishear a 7-8-year-old learner. Recognise against an expected set of answers, accept near-misses, and always offer taps.

### Where the model could run (as of Oct 2026)

| Option | Works on iPad Safari? | Notes |
| --- | --- | --- |
| **Cloud API through a small proxy** (needed: the API key can't sit in a GitHub Pages file) | Yes | Cheapest and most capable. Claude Haiku 5.5 is $0.10/$0.50 per million tokens (cached price list 2026-10-06) [40]. Estimate: 20 turns/day at about 3k input and 60 output tokens per turn is about **$0.007/day, about $2.50/year**. Sonnet 5.5 ($2/$10) is about $48/year. Cost is not the constraint |
| **Chrome built-in Prompt API (Gemini Nano)** | No (Chrome desktop) | Status unclear (origin trial vs stable); reports of an automatic multi-GB model download [36] |
| **WebLLM via WebGPU** | iPadOS 26+ | Small models (0.6-1B) are 335-700 MB downloads needing 1-2 GB of memory. No iPad benchmarks found. Spanish quality and child safety of tiny models unproven [37] |
| **Apple Foundation Models (on-device ~3B)** | Native apps only | Free, offline, supports Spanish, guided (structured) output [38]. Would need a native wrapper app. Worth revisiting if the game ever ships as an app |

**Don't depend on the cloud:** Embodied's Moxie robot (marketed for ages 5-10) stopped working when the company's cloud closed in Dec 2024, and children said tearful goodbyes [39]. AI must be an **add-on that fails gracefully**. The game works fully offline without it.

### Recommended path (inference, matched to the evidence)
1. **Step 0, now (7-8): no LLM.** Scripted dialogic NPCs ask questions in story and favour scenes. Answers are recognised from an expected set (the phrase system already does this), with taps as fallback. This is the best-evidenced form for young children [21].
2. **Step 1 (8-9): the LLM only as an offline authoring assistant.** It drafts NPC line variants, riddles and letters within a word list. The parent selects and edits (section 5). No child data leaves the device.
3. **Step 2 (9-10, parent opt-in): "bounded NPC" scenes.**
   - Scenes: market, lost dog, directions, festival planning.
   - Pipeline: Safari speech-to-text, a tiny proxy, the model with a fixed system prompt, structured JSON output (`{line_es, line_en_hint, words_used, intent}`).
   - The system prompt states: child aged 9; es-MX; replies of 12 words or fewer; only the scene's topic; never ask personal information; redirect off-topic, health or self-harm themes to the scene or to "ask a grown-up".
   - Server-side checks: blocked topics, and **a word-list check against her known words plus at most one new word**. Any failure falls back to a scripted line.
   - 3-6 exchanges per scene. No audio kept. Transcript shown on the parent dashboard. On-screen note that the character is pretend and played by a computer.
   - Never framed as a friend who misses her [27][29][31][32][34].
4. **Step 3 (10+): freer role-play only with a parent beside her.** A "family scene" where the parent plays a second character.

---

## 4. Family and co-play features

### Evidence
- **Joint media engagement (JME)**, Takeuchi & Stevens 2011: shared attention to media in real time is a strong resource for learning, and designers should make it easy for people to interact around media [41].
- **Animal Crossing families (27 families, CSCW 2022):** the game largely meets the conditions for productive joint play. The authors add three:
  - **varied, flexible play styles**;
  - **support for family members playing at different times and paces**;
  - **scaffolding for emotional interaction**.

  Their design suggestions: persistent shared spaces and flexible in-game progress [42].
- **Family Story Play** (Nokia, Sesame Workshop): video-call reading with grandparents gave longer, higher-quality remote interactions and encouraged question-asking reading styles [43]. It was a small concept study.
- **Parent involvement in L2:** a meta-analysis found small-to-moderate effects of the home literacy environment on children's English as a second language. **What parents do mattered more than what they believe** [44]. Parents with limited L2 skill can help when given tools and coaching (Bilfam project) [44].
- **AAP:** encourages co-viewing and co-playing as part of a family media plan [45].
- **Asymmetric co-op:** Super Mario Odyssey's Cappy mode gives a less skilled second player a safe, helpful role [47]. Inference: invert it here. The child is the expert and the parent is the beginner who needs her help (protégé effect [48]).

### Design for the "family join code" (inference)
1. **Phase 0, no server: save codes.**
   - Export and import the whole save as a code or QR. This is also the backup fix in section 6.
   - A "family postcard code": a short code that carries a postcard, typed or scanned on another device.
2. **Phase 1, small sync service, asynchronous first:**
   - A random family code links devices (child iPad, parent phone, grandparent). No names, emails or personal information. Only game data is stored.
   - Features:
     - **Spanish phrase-menu postcards**, chosen from phrases she has learned (Club Penguin's Ultimate Safe Chat used only pre-written phrases [46]). Safe and a learning exercise at the same time.
     - Gifts and **album trades**.
     - **Visit my town**: a read-only tour of her house and garden.
     - A **weekly family challenge**: "find 3 animals at the beach and send Abuela a photo".
     - **Grown-up homework**: the parent's phone gets 3 words or phrases she learned this week, with audio, to use at dinner. This acts on the parent-*behaviour* finding [44].
3. **Phase 2, real-time co-play on the same device:**
   - A "Familia" button adds a second player: a parent avatar who only follows, carries and asks.
   - The child answers in Spanish, and the parent's lines are written so the child must translate or teach.
   - Story reading with a grandparent over video, with page-turn sync [43].
4. **Rules:** family circle only, no strangers [20], no free-text chat, parent controls on the dashboard, nothing that urges her to play more [10].

---

## 5. Scaling content without burning out the builder

### Templated and procedural content
- **Players read surface variation as variety.** One fixed quest structure with randomised amounts, items and places was judged "different and varied" by 67 testers [50]. Grammar-based generators reduce repetition compared with random choice [50]. How generated content affects player experience is still understudied [50].
- Inference, applied to this game. Templates for:
  - favours ("bring N of item X to person P");
  - hide-and-seek (zone, hiding spots, animals);
  - letters (sender, receiver, topic, word slots);
  - listen-and-do;
  - riddles ("*Tengo cuatro patas y digo guau*": "I have four legs and say woof").
- Each template takes **word-list slots** fed by the word-strength model, so generated content automatically reviews due words. That turns the spaced-review scheduler into a content generator.

### LLM-assisted authoring with human review
- Ubisoft's Ghostwriter pattern: the LLM drafts *barks* (short incidental lines); writers pick between two options and polish. It is **not used for core story or lore** [49].
- Reviews of AI-generated educational content conclude that a **final expert check is essential**. An AI reviewer can screen but agrees poorly with experts unless fine-tuned [51].
- Pipeline (inference):
  1. The parent writes a brief: scene, characters, allowed words, at most one new word.
  2. A batch LLM call generates 10-20 variants (the Batch API is half price; costs are tiny anyway [40]).
  3. Automated checks:
     - words only from the allowed list;
     - length;
     - es-MX forms and alternatives (*medusa / aguamala*);
     - every `{dog}` placeholder resolves;
     - the speech voice pronounces it;
     - the "one new word at a time" and "first use soon after meeting" rules.
  4. The parent picks and edits. A native-speaker family member checks a sample monthly.
  5. Commit. The existing test harness runs.
- **Never let the LLM write the core story** [26][49].

### Content files and tooling
- Keep content as **plain text that writers can edit and that works with version control**. That was Yarn Spinner's founding lesson (Night in the Woods), and it hit limits with deeply nested logic [52]. The game's `content/es/*.js` data files already follow this.
- Inference: turn the design rules in `docs/CURRICULUM.md` §6 and `docs/WORLD_PLAN.md` into **content contract tests** in `tools/`:
  - zone activities use only universal words plus that zone's own words;
  - every new word gets N encounters within M days;
  - word ids don't clash with icon names.

  `tools/vocab-audit.js` and `tools/audit-intuitive.js` are the starting points.
- **Localisation:** the engine/content split (`src/` vs `content/es/`) already allows a second language pack. Inference: a reverse **English-for-Spanish-speakers** pack would let a Spanish-speaking cousin co-play, each learning the other's language. Mark regional variants per word (`alt`).

### Rough content budget (inference, for planning)
- 16,425 minutes over 3 years. A healthy mix is about ⅓ first-time authored content, ⅓ repeatable systems (collections, seek, favours, building, templated minigames) and ⅓ review (warm-up, spaced). That means **about 90 hours of first-time authored play, about 30 hours a year, about 35 minutes of new authored content a week**.
- That is too much to hand-write. The answer is leverage:
  - **Seasonal events** built once run 3 times. For example, 6 events × 3 sessions is 18 sessions built and 54 played.
  - **Templates** turn one authored pattern into many sessions.
  - **LLM drafts** cut writing time.
  - **Family features** make repeated play social.

### Review schedule over 3 years
- Bahrick et al. 1993: 13 relearning sessions spaced **56 days** apart gave retention after 1-5 years comparable to 26 sessions 14 days apart [56]. Inference: the word-strength model should keep pushing review intervals out to months for strong words, so old words stay alive cheaply.
- Little is known about children forgetting a classroom-only language, and Schmid argues classroom-only learners are especially at risk [57]. A finale at 10 should hand off to something ongoing: monthly family scenes, and a light "keep it alive" mode.

---

## 6. Sustainability (no monetisation, but it has to last 3 years)

1. **Make the save durable first (Repo finding).**
   - Problem: all progress is in `localStorage` only. No web app manifest, no `navigator.storage.persist()`, no export or backup was found. Safari deletes script-written storage after 7 days of browsing without touching the site; apps added to the Home Screen keep their own counter [59].
   - Fix:
     - (a) a web app manifest and "Add to Home Screen" instructions on the parent page;
     - (b) request persistent storage where the browser supports it;
     - (c) **save code export and import** with a monthly reminder on the parent dashboard;
     - (d) later, optional sync via the family code.
2. **No hard dependency on any cloud service or AI** [39]. GitHub Pages and a static build already meet this. Keep it that way, with any server as an optional add-on.
3. **A pace the builder can sustain:** a quarterly chapter, monthly templated drops, a yearly calendar built once (section 1). Avoid a live-service treadmill. Animal Crossing itself moved to rare, large updates after its first period [3].
4. **Count the parent's time as the budget.** Inference: about 1-2 hours a week of review and selection, with the LLM-assisted pipeline doing the drafting, is a realistic steady state.
5. **Keep the dashboard honest.** Don't overclaim learning, as Prodigy's company-sponsored efficacy claims did [8]. Show recall measures, as `src/dashboard.js` already does.

---

## Sources
1. VGC, Animal Crossing events require an online connection (developer's "friends and family" rationale): https://www.videogameschronicle.com/news/animal-crossing-events-require-online-connection/
2. iMore, Animal Crossing NH time travel and always-available activities: https://www.imore.com/will-animal-crossing-new-horizons-have-time-travel
3. Nintendo Life, AC:NH final free update (2.0, and 3.0 in Jan 2026): https://www.nintendolife.com/guides/animal-crossing-new-horizons-everything-in-the-final-free-update ; Animal Crossing World: https://animalcrossingworld.com/2021/10/no-more-animal-crossing-new-horizons-major-updates-or-dlc-after-november-nintendo-confirms-to-ign/
4. Stardew Valley Wiki, Seasons: https://stardewvalleywiki.com/Season ; review: https://notes.hamatti.org/Gaming/Video-games/Reviews/Stardew-Valley
5. Kidscreen, Why kids and collecting go hand in hand: https://kidscreen.com/?p=88585 ; ICv2 (Univ. of Nebraska collecting motives): https://icv2.com/print/article/18663 ; Kyoto Univ.: https://repository.kulib.kyoto-u.ac.jp/dspace/handle/2433/139640?mode=full
6. Mavoa, Digital Futures Commission (Minecraft parent survey): https://digitalfuturescommission.org.uk/?p=1858 ; Iowa State Minecraft creativity study: https://www.newswise.com/articles/minecraft-a-gamechanger-for-children-s-learning
7. Kill Screen, Toca Boca "toy not game": https://www.killscreen.com/secret-smart-kids-entertainment-give-them-toy-not-game/ ; Tampere PlayLab review: https://blogs.tuni.fi/playlab/game-reviews/toca-boca-world-a-whole-new-level-of-dollhouse/
8. Prodigy research page: https://www.prodigygame.com/research ; Prodigy perseverance analysis (no control group): https://prodigygame.com/blog/prodigy-math-perseverance ; Fairplay FTC complaint: https://fairplayforkids.org/feb-19-2021-advocates-to-ftc-prodigy-math-game-preys-on-kids-and-families/ ; EdWeek: https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02
9. Duolingo, Improving the streak: https://blog.duolingo.com/improving-the-streak ; https://making.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals ; case-study critique: https://www.wr-publishing.org/index.php/ijmat/article/view/908
10. Radesky et al. 2022, JAMA Network Open, manipulative design in children's apps: https://pmc.ncbi.nlm.nih.gov/articles/PMC9206186/
11. Deci, Koestner & Ryan 2001, RER: https://journals.sagepub.com/doi/10.3102/00346543071001001 ; overjustification overview: https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/overjustification-effect
12. Tsay et al., novelty effect in gamified learning: https://gala.gre.ac.uk/id/eprint/25375 ; https://researchportal.beds.ac.uk/en/publications/overcoming-the-novelty-effect-in-online-gamified-learning-systems-5/
13. Ryan, Rigby & Przybylski 2006, The motivational pull of video games: https://doi.org/10.1007/s11031-006-9051-8
14. Concrete operational stage: https://courses.lumenlearning.com/suny-fmcc-childhood-psychology/chapter/cognitive-development-3/ ; Scholastic, cognitive development 8-10: https://www.scholastic.com/parents/resources/article/stages-milestones/cognitive-development-8-10-year-olds
15. Colorín Colorado, Chall and the fourth-grade slump: https://www.colorincolorado.org/node/56304
16. Seymour, Aro & Erskine 2003, Foundation literacy in European orthographies: https://discovery.dundee.ac.uk/en/publications/foundation-literacy-acquisition-in-european-orthographies/
17. SLJ on the Scholastic Kids & Family Reading Report (drop at age 9): https://slj.com/story/scholastic-survey-reveals-large-drop-in-reading-between-ages-8-and-9 ; key findings: https://www.scholastic.com/content/corp-home/kids-and-family-reading-report/key-findings.html
18. McGhee, children's riddles: https://www.laughterremedy.com/2011/02/childrens-riddles-first-sign-of-an-adult-sense-of-humor/ ; riddle comprehension ages 6-11: https://pmc.ncbi.nlm.nih.gov/articles/PMC8360189
19. Kidscreen, Age compression: https://kidscreen.com/?p=12748 ; Getting Older Younger: https://emerald.com/insight/content/doi/10.1108/eb027619/full/html
20. Ofcom, Growing Up Gaming: https://www.ofcom.org.uk/siteassets/resources/documents/online-safety/research-statistics-and-data/protecting-children/grow-up-gaming-summary/growing-up-gaming-research-summary.pdf
21. Xu et al., conversational agents for dialogic reading: https://escholarship.org/uc/item/21q977wg ; Wang et al. CHI 2021: https://researcher.draco.res.ibm.com/publications/same-benefits-different-communication-patterns-comparing-childrens-reading-with-a-conversational-agent-vs-a-human-partner
22. Bibauw et al. 2022, Dialogue systems for language learning, meta-analysis: https://www.lltjournal.org/item-detail/1035
23. Hou & Min 2025, dialogue-based CALL for L2 speaking (three-level meta-analysis): https://www.cambridge.org/core/product/31847710516602398819C5E594038E7B
24. 2024 chatbot meta-analysis (RER; repository record, verify): https://hub.hku.hk/handle/10722/355065
25. Kid-Whisper: https://arxiv.org/abs/2309.07927v3 ; The Learning Agency, child speech recognition gap: https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap-evidence-limitations-and-paths-forward/
26. GPT-4 Disco Elysium dialogue study (Findings EMNLP 2023): https://preview.aclanthology.org/fix_video/2023.findings-emnlp.151.pdf ; KNUDGE: https://aclanthology.org/2024.emnlp-main.520 ; LLMs and Games survey: https://arxiv.org/pdf/2402.18659 ; Symbolically Scaffolded Play: https://arxiv.org/html/2510.25820v1
27. Common Sense on AI companions: https://www.wbay.com/2025/05/01/report-ai-companions-arent-safe-children ; AI toys: https://www.commonsensemedia.org/research/ai-toys ; https://www.thedeepview.com/articles/report-finds-safety-gaps-in-children-s-ai-toys
28. FTC 6(b) inquiry into AI companions: https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions
29. Skadden on California SB 243: https://www.skadden.com/insights/publications/2025/10/new-california-companion-chatbot-law ; Daily Journal (video-game exclusion): https://dailyjournal.com/articles/389118-sb-243-new-safety-rules-for-ai-companion-chatbots
30. Character.AI ends under-18 open-ended chat: https://abc7news.com/post/characterai-is-banning-minors-interacting-chatbots/18090030/
31. Anthropic, guidelines for organisations serving minors: https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors
32. ChildSafe: https://arxiv.org/abs/2510.05484v1 ; MinorBench: https://mlanthology.org/iclrw/2025/khoo2025iclrw-minorbench ; SproutBench: https://arxiv.org/pdf/2508.11009 ; KIDBench (listing, verify): https://awesomepapers.io/speech-audio/papers/2605.25510
33. White & Case on the COPPA amendments: https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know ; Jones Day: https://jonesday.com/en/insights/2025/05/ftc-finalizes-amendments-to-coppa--rule
34. FTC 2017 COPPA policy on voice recordings: https://www.ftc.gov/system/files/documents/public_statements/1266473/coppa_policy_statement_audiorecordings.pdf
35. Addpipe on Safari speech recognition and SpeechAnalyzer: https://blog.addpipe.com/apple-speechanalyzer-api/ ; Apple developer forum: https://developer.apple.com/forums/thread/690575
36. Gemini Nano / Chrome built-in AI (secondary, status unclear): https://pasqualepillitteri.it/en/news/3145/gemini-nano-chrome-built-in-ai-client-side-en
37. WebLLM: https://blog.mlc.ai/2024/06/13/webllm-a-high-performance-in-browser-llm-inference-engine ; WebGPU in iOS 26: https://appdevelopermagazine.com/webgpu-in-ios-26/
38. InfoQ, Apple Foundation Models: https://www.infoq.com/news/2025/07/apple-foundation-models-ios26
39. The Register, Moxie cloud lessons: https://theregister.com/2024/12/16/moxie_cloud_services_lessons/ ; OECD AI incident: https://oecd.ai/en/incidents/2024-12-09-ab89
40. Anthropic API pricing (Haiku 5.5 $0.10/$0.50, Sonnet 5.5 $2/$10 per million tokens; price list cached 2026-10-06): https://www.anthropic.com/pricing
41. Takeuchi & Stevens 2011, The New Coviewing: https://joanganzcooneycenter.org/wp-content/uploads/2011/12/jgc_coviewing_desktop.pdf ; KQED MindShift: https://www.kqed.org/mindshift/18279/with-media-parents-and-kids-learn-more-together
42. Martinez et al. CSCW 2022, families playing Animal Crossing: https://doi.org/10.1145/3512947 ; Pearce et al. 2022: https://pmc.ncbi.nlm.nih.gov/articles/PMC9209879
43. Family Story Play (Sesame Workshop and Nokia): https://joanganzcooneycenter.org/press/sesame-street-and-nokia-research-center-explore-story-time-for-the-21st-century/ ; https://current.org/2009/10/storyplay-connects-children-and-far-away-family-for-literacy-play
44. Home literacy environment and ESL meta-analysis (UCL): https://discovery.ucl.ac.uk/id/eprint/10144115/ ; Bilfam: https://iris.uniroma1.it/handle/11573/642902
45. AAP / HealthyChildren on co-viewing and co-playing: https://www.healthychildren.org/English/family-life/Media/Pages/Why-Co-Viewing-Is-Important-Tips-to-Share-Screen-Time-With-Your-Kids.aspx
46. Club Penguin Safe Chat: https://techsavvymama.com/2013/05/club-penguin-teaches-safe-social-networkin.html ; https://moviemom.com/keeping-children-safe-online-club-penguin/
47. Nintendo Life, Super Mario Odyssey review (Cappy co-op): https://www.nintendolife.com/reviews/nintendo-switch/super_mario_odyssey
48. Chase et al. 2009, Teachable Agents and the Protégé Effect: https://purl.stanford.edu/zm369yx3532 ; Lund follow-up: https://www.lucs.lu.se/fileadmin/user_upload/project/lucs/ETG-pub/etg2018-conference-AIED-poster.pdf
49. Ubisoft Ghostwriter: https://news.ubisoft.com/en-gb/article/7Cm07zbBGy4Xml6WgYi25d/the-convergence-of-ai-and-creativity-introducing-ghostwriter ; Game Developer: https://www.gamedeveloper.com/marketing/here-are-more-details-on-ubisoft-s-narrative-ai-tools-from-gdc-2023
50. AAU thesis (perceived quest variety): https://projekter.aau.dk/projekter/files/260078489/MED10_Master_Thesis_Report.pdf ; SBGames grammar-based quests: https://sol.sbc.org.br/index.php/sbgames/article/view/45420 ; Kreminski 2023: https://www.pcgworkshop.com/archive/kreminski2023generator.pdf
51. Asan Medical Center, expert review of AI-generated educational content: https://news-en.amc.seoul.kr/news/eng/detail.do?cntId=3283 ; DeanLLM: https://arxiv.org/pdf/2508.05952
52. Game Developer, Yarn Spinner deep dive: https://www.gamedeveloper.com/programming/deep-dive-yarn-spinner
53. FSI language categories and hours (secondary): https://legalclarity.org/state-department-languages-fsi-training-and-proficiency-levels/
54. Delaware FLES proficiency targets: https://education.delaware.gov/legacy/wp-content/uploads/sites/4/2024/06/delaware_wl_proficiency_targets_non-immersion.pdf ; Oklahoma: https://legacy.sde.ok.gov/sde/sites/ok.gov.sde/files/2015%20World%20Languages%20Standards.pdf ; Ohio: https://education.ohio.gov/Topics/Learning-in-Ohio/World-Languages-and-Cultures/Proficiency-Levels/Proficiency-Targets
55. Jiménez Catalán & Terrazas Gallego (young learners' vocabulary): https://publicaciones.unirioja.es/ojs/index.php/jes/article/download/127/107 ; Alexiou & Vagenas: https://rpltl.eap.gr/images/2023/08_Alexiou___Vagenas.pdf
56. Bahrick et al. 1993, Maintenance of foreign language vocabulary and the spacing effect: https://digitalcommons.fiu.edu/psychology_fac/50
57. Schmid, The final frontier (L2 attrition): https://www.cambridge.org/core/journals/language-teaching/article/final-frontier-why-we-have-been-ignoring-second-language-attrition-and-why-it-is-time-we-stopped/B7065D862C3B5E039757FA7C90C2C4F4
58. Holidays in Mexico: https://mexicorelocationguide.com/holidays-in-mexico/ ; Christmas in Mexico: https://www.whychristmas.com/cultures/mexico
59. Safari 7-day storage cap: https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519 ; The Register: https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/ ; WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=211775

**Repo files referenced (read-only):**
- `/home/user/Spanish-Club/src/core.js` (lines 240-242, localStorage)
- `/home/user/Spanish-Club/src/state.js` (lines 90-96, save slots)
- `/home/user/Spanish-Club/src/words.js` (line 67, day counter; no real-date seasons)
- `/home/user/Spanish-Club/src/dashboard.js`
- `/home/user/Spanish-Club/tools/vocab-audit.js`
- `/home/user/Spanish-Club/tools/audit-intuitive.js`