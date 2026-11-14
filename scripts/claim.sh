#!/usr/bin/env bash
# Claim a task for this worker run.
# Usage: scripts/claim.sh <task-id> <run-id>
#
# Creates branch claude/task-<id> from origin/main with one commit adding
# tasks/claims/<id>.md and pushes it WITHOUT force. The remote branch is the lock:
# if someone else pushed it first, the push is rejected and we exit 1.
# On success the worker is left on the new branch.
set -euo pipefail

id="${1:-}"
run="${2:-}"
if [[ -z "$id" || -z "$run" ]]; then
  echo "usage: scripts/claim.sh <task-id> <run-id>" >&2
  exit 2
fi
branch="claude/task-$id"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "claim: working tree is not clean" >&2
  exit 1
fi

git fetch --quiet origin main

task="$(git ls-tree --name-only origin/main tasks/ | grep -E "^tasks/${id}-[^/]*\.md$" | head -n 1 || true)"
if [[ -z "$task" ]]; then
  echo "claim: task $id not found in origin/main:tasks/" >&2
  exit 1
fi
if ! git show "origin/main:$task" | grep -qE '^status:[[:space:]]*ready[[:space:]]*$'; then
  echo "claim: task $id is not ready" >&2
  exit 1
fi
if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  echo "claim: $branch already exists on origin (already claimed)" >&2
  exit 1
fi
if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo "claim: local branch $branch exists; delete it first (git branch -D $branch)" >&2
  exit 1
fi

start_ref="$(git symbolic-ref --quiet --short HEAD || git rev-parse HEAD)"
git switch --quiet -c "$branch" origin/main

mkdir -p tasks/claims
cat > "tasks/claims/$id.md" <<EOF
---
id: $id
run: $run
claimed_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
---
Claimed by worker run $run. Remove this file before opening the PR.
EOF
git add "tasks/claims/$id.md"
git commit --quiet -m "Claim task $id (run $run)"

# Never --force: a rejected push means another worker owns the task.
if ! git push --quiet origin "$branch" 2>/dev/null; then
  echo "claim: push rejected, task $id is already claimed" >&2
  git switch --quiet "$start_ref" 2>/dev/null || git switch --quiet --detach "$start_ref"
  git branch --quiet -D "$branch"
  exit 1
fi

echo "claimed $id on $branch (run $run)"
