#!/bin/bash
# Runs the smoke test and every tools/test-*.js in LANES lanes side by side, and does not stop at a failure:
# every file gets its own log and a line in the summary, so one run shows every failure and how long each file took.
#   bash tools/test-lanes.sh [lanes: 2] [log dir] [only: a pattern, e.g. 'zone|day']
# SKIP=<pattern> leaves files out (SKIP=resplit: the old-saves test takes about 2.5 hours; run it by itself beside the lanes).
# The longest files start first, one at the head of each lane. Exit code: 0 when every file passed.
# Several tests are timing-sensitive under load: keep to 2 lanes on a 4-core machine, and run a failed file again
# by itself before treating the failure as real.
cd "$(dirname "$0")/.." || exit 2
LANES=${1:-2}
LOGS=${2:-${SPANISH_CLUB_OUT:-${TMPDIR:-/tmp}}/spanish-club-tests}
ONLY=${3:-.}
NODE_PATH=$(npm root -g); export NODE_PATH
rm -rf "$LOGS"; mkdir -p "$LOGS"
LONG="tools/test-resplit.js tools/test-playthrough.js tools/test-chains.js tools/test-chapters2.js tools/test-live.js"
FILES=""
for t in $LONG; do [ -e "$t" ] && FILES="$FILES $t"; done
for t in tools/smoke.js tools/test-*.js; do
  case " $LONG " in *" $t "*) ;; *) FILES="$FILES $t" ;; esac
done
FILES=$(for t in $FILES; do echo "$t"; done | grep -E "$ONLY" | grep -vE "${SKIP:-^$}")
lane() { # lane <k>: every LANES-th file, starting at the k-th
  local k=$1 i=0 t name t0 rc
  for t in $FILES; do
    if [ $((i % LANES)) -eq "$k" ]; then
      name=$(basename "$t" .js); t0=$(date +%s)
      node "$t" "$LOGS/shots-$k" > "$LOGS/$name.log" 2>&1; rc=$?
      echo "$name rc=$rc sec=$(( $(date +%s) - t0 )) ok=$(grep -c '^  ok ' "$LOGS/$name.log") fail=$(grep -c '^  FAIL ' "$LOGS/$name.log") lane=$k" >> "$LOGS/summary.txt"
    fi
    i=$((i + 1))
  done
}
T0=$(date +%s)
for k in $(seq 0 $((LANES - 1))); do lane "$k" & done
wait
echo "== $(wc -l < "$LOGS/summary.txt") files in $(( ($(date +%s) - T0) / 60 )) min, $LANES lanes; logs in $LOGS"
sort -t= -k3 -n -r "$LOGS/summary.txt" | head -5 | sed 's/^/   slowest: /'
if grep -v ' rc=0 ' "$LOGS/summary.txt" > "$LOGS/failed.txt"; then
  echo "FAILED:"; sed 's/^/   /' "$LOGS/failed.txt"
  echo "(run each again by itself: NODE_PATH=\$(npm root -g) node tools/<name>.js)"
  exit 1
fi
echo "ALL PASS"
