#!/usr/bin/env bash
# Set up .pr-review/ for the review harness: a detached-HEAD worktree, a
# diff.patch, and a pr-meta.env that verify-net-zero.sh / finalize-review.sh
# read afterward. Works for either a GitHub PR (arg1 = PR URL) or the current
# local branch (arg1 empty) — the rest of the harness never re-branches on
# "PR vs local", it just reads pr-meta.env.
#
# Usage: scripts/pr-context.sh [<pr-url>]
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

PR_ARG="${1:-}"
PR_REVIEW_DIR="$ROOT/.pr-review"

slugify() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

# Repo default branch: prefer the remote's symbolic HEAD, fall back to a local
# main/master so this also works in a synthetic repo with no origin.
default_branch() {
  local ref
  ref="$(git symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null || true)"
  if [ -n "$ref" ]; then
    echo "${ref#origin/}"
    return
  fi
  for candidate in main master; do
    if git show-ref --verify --quiet "refs/heads/${candidate}"; then
      echo "$candidate"
      return
    fi
  done
  echo main
}

base_ref_for() {
  local branch="$1"
  if git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
    echo "origin/${branch}"
  else
    echo "$branch"
  fi
}

if [ -n "$PR_ARG" ]; then
  # Accept a full GitHub PR URL or the owner/repo/<n> (or owner/repo#<n>) shorthand.
  if [[ "$PR_ARG" =~ github\.com/([^/]+)/([^/]+)/pull/([0-9]+) ]]; then
    OWNER="${BASH_REMATCH[1]}"; REPO="${BASH_REMATCH[2]}"; PR_NUM="${BASH_REMATCH[3]}"
  elif [[ "$PR_ARG" =~ ^([^/]+)/([^/]+)[/\#]([0-9]+)$ ]]; then
    OWNER="${BASH_REMATCH[1]}"; REPO="${BASH_REMATCH[2]}"; PR_NUM="${BASH_REMATCH[3]}"
  else
    echo "pr-context: not a recognized PR reference: $PR_ARG" >&2
    exit 1
  fi

  git fetch origin "pull/${PR_NUM}/head"
  HEAD_SHA="$(git rev-parse FETCH_HEAD)"
  BASE_BRANCH="$(gh pr view "$PR_NUM" --repo "${OWNER}/${REPO}" --json baseRefName -q .baseRefName)"
  git fetch origin "$BASE_BRANCH"
  BASE_SHA="$(git rev-parse FETCH_HEAD)"
  SOURCE=pr
  REPORT="pr-${PR_NUM}-review.md"
else
  if [ -n "$(git status --porcelain)" ]; then
    echo "commit first" >&2
    exit 1
  fi
  HEAD_SHA="$(git rev-parse HEAD)"
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  BASE_SHA="$(git merge-base HEAD "$(base_ref_for "$(default_branch)")")"
  SOURCE=branch
  REPORT="branch-$(slugify "$BRANCH")-review.md"
fi

rm -rf "$PR_REVIEW_DIR/worktree"
mkdir -p "$PR_REVIEW_DIR"
git worktree add --detach "$PR_REVIEW_DIR/worktree" "$HEAD_SHA"

git diff -W "${BASE_SHA}...${HEAD_SHA}" > "$PR_REVIEW_DIR/diff.patch"

cat > "$PR_REVIEW_DIR/pr-meta.env" <<EOF
HEAD_SHA=${HEAD_SHA}
BASE_SHA=${BASE_SHA}
SOURCE=${SOURCE}
REPORT=${REPORT}
EOF

echo "pr-context: worktree ready at ${PR_REVIEW_DIR}/worktree (source=${SOURCE}, report=${REPORT})"
