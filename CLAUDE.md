# Club de Español

A 2D pixel-art open-world game that teaches Spanish to one child: the owner's daughter, age 7. She reads English
well and knows little Spanish. She plays about 15 minutes a day on an **old iPad (iPadOS 15, Safari 15.6)** with
taps and the es-MX microphone. Her parent also tests on Windows Chrome. The game is meant to last until she is 10.

**`main` is the live game** (GitHub Pages: https://frostyhavens.github.io/Spanish-Club/). Her real save lives in her
iPad's browser storage. Work happens on `claude/zen-sagan-mr8xwf`; `main` only moves forward when a release is ready.

## Layout

- `src/` the engine and `content/es/` the Spanish content: plain JavaScript, no build step, one global `G`, each
  file an IIFE. A 320x224 canvas. All art and sound are made in code.
- `tools/` tests and audits (Playwright driving the real page). `docs/` plans and notes. `DEVLOG.md` what changed.
- Start with `docs/NEXT_ACTIONS.md` (what to do next), then `docs/AUDIT_2026-10.md` section 5 (the polish plan)
  and `docs/ROADMAP_3_YEARS.md` (the three-year plan). `docs/CONTENT.md` and `docs/WORLD_PLAN.md` explain how to
  add content. `docs/CURRICULUM.md`, `ROUND_B_PLAN.md` and `VOCAB_AUDIT.md` are history.

## Commands

- One test: `NODE_PATH=$(npm root -g) node tools/test-<name>.js` (also `tools/smoke.js`).
- All tests: `bash tools/test-lanes.sh 2` (about an hour; a log per file and a summary). `sh tools/test-all.sh`
  runs them one by one and stops at the first failure (about two hours).
- Tests are timing-sensitive under load. Run at most 2 browsers at once on this 4-core machine, and run a failed
  file again by itself before treating the failure as real.
- Playwright and Chromium are already installed. **Never run `playwright install`.**
- Build: `python3 tools/build.py`. It stamps `index.html` and writes `dist/club-de-espanol.html`. Run it once,
  just before a release, never in a helper's work branch (it makes merge conflicts).
- Learning audit (a bot plays six days): `node tools/learning-audit.js --write-docs` (15-20 minutes).
- Three-year simulation: `node tools/sim-3year.js --checks` (no browser).

## Rules of the house

**For the child**
- Taps always work. Nothing needs reading. There is never a dead end: the arrow always leads somewhere.
- Nothing marks her wrong. A wrong pick shows the right one; the speech recognizer never counts against her.
- No menus she must use, and no Spanish-only instructions: `TT(spanish, english)` gives both.
- No streaks, no guilt, no "we missed you", no time pressure.
- At most 3 questions before something happens on the map. One new thing at a time. Reviews come before new words.
- Cards never shrink. The dog's warm-up runs once a day. El / la are learned by ear, with no colour-coding.

**Her save must survive every release.** A save from any earlier release must open and carry on. Ids of words,
chapters, people and places never change. If a change alters what a saved value means, write the upgrade and a test.

**Safari 15.** No regex lookbehind, no `toSorted` / `toReversed` / `with`, no class static blocks, no
`OffscreenCanvas`. The microphone must start inside the real tap. Chromium tests do not prove Safari. The iPad is
slow: nothing may scan every word, chapter or hiding place once a frame.

**Spanish.** Mexican Spanish. Articles come from `G.requests.the` and friends, never typed by hand in a template.
Every new or changed Spanish line goes into `docs/SPANISH_REVIEW.md`. There is no native-speaker reviewer, so
prefer forms you can back with a dictionary of Mexican Spanish, and say so when unsure.

**Writing.** Documents and DEVLOG entries are for the parent: plain words, short sentences, no jargon.
Code comments say why. No model names in code or docs. Helpers write plain commit messages with no attribution lines.

## Releasing

1. Everything merged on the work branch; `python3 tools/build.py`; commit.
2. `bash tools/test-lanes.sh 2` passes on that commit (re-run a failure by itself first).
3. A `DEVLOG.md` entry and status lines in `docs/NEXT_ACTIONS.md`.
4. Tag `release-YYYY-MM-DD`, then fast-forward `main` to the commit. Pages publishes by itself.
There is no CI and no beta copy yet. Do not open pull requests unless asked.

## If you are a helper working in a git worktree

- Your worktree may start behind the work branch. First run `git merge --ff-only claude/zen-sagan-mr8xwf`.
- Stay inside the files your brief names. Other helpers are editing other files at the same time.
- Commit your work in your worktree with a short plain message, early and often. Do not push, do not touch
  `main`, do not run `tools/build.py`, and do not edit `index.html` unless you add a new script file.
- Run the tests your brief names, one browser at a time. Finish with: what you changed (files), what you ran and
  the result, anything you found but did not fix, and your branch name.
