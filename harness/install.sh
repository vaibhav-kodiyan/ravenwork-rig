#!/usr/bin/env sh
# Materialize the pinned Tier 1 harness into this repo.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
SOURCE=${HARNESS_SOURCE:-$ROOT}

exec node "$SOURCE/scripts/materialize-harness.js" \
  --source "$SOURCE" \
  --target "$ROOT" \
  --manifest "$ROOT/harness/manifest.json" \
  "$@"
