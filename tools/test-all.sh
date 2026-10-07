#!/bin/sh
# Runs the smoke test, then every tools/test-*.js in turn, stopping at the first failure.
#   sh tools/test-all.sh [screenshot dir]
set -e
cd "$(dirname "$0")/.."
NODE_PATH=$(npm root -g); export NODE_PATH
node tools/smoke.js "$@"
for t in tools/test-*.js; do
  [ -e "$t" ] || continue
  echo; echo "== $t"
  node "$t" "$@"
done
echo; echo "ALL PASS"
