# Dev log

A running record of what changed in Club de Español and why. Newest first.

## 2026-10-09 — Learning redesign begins
- Researched how young children learn vocabulary (`docs/LEARNING_RESEARCH.md`).
- Built a word-flow audit (`tools/vocab-audit.js`, `src/vocablog.js`) and measured the game (`docs/VOCAB_AUDIT.md`):
  65 of 78 words arrived in the first 15 minutes (43 on notebook pages), 30 words were never actively used, and the
  median word was used once.
- Wrote the redesign (`docs/LEARNING_DESIGN.md`): a few new words at a time, each introduced as a one-unknown puzzle,
  a word-strength model with spaced review woven into the world, a notebook that fills as you learn, and measured
  targets the audit checks.
