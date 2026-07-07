#!/usr/bin/env bash
# Tear down the review harness: run the net-zero gate first, and only clean up
# .pr-review/ if it passes. On a failed gate this deliberately leaves the
# worktree and diff in place so the failure can be inspected.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

"$ROOT/scripts/verify-net-zero.sh"

git worktree remove --force .pr-review/worktree || true
rm -rf .pr-review

echo "finalize-review: gate passed, .pr-review/ removed."
