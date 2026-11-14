#!/usr/bin/env bash
# List stale task claims: origin/claude/task-* branches whose last commit is older
# than N hours (default 2) and that have no open PR.
#
# Usage: scripts/stale-claims.sh [--release] [--hours N]
#
# With a logged-in `gh`: branches without an open PR are listed as STALE, and
# --release deletes them on origin (frees the lock).
# Without `gh` (or not logged in): old branches are only listed, marked
# "PR-status okänd", and are NEVER deleted, even with --release.
set -euo pipefail

release=0
hours=2
while [[ $# -gt 0 ]]; do
  case "$1" in
    --release) release=1 ;;
    --hours) hours="${2:?--hours needs a value}"; shift ;;
    *) echo "usage: scripts/stale-claims.sh [--release] [--hours N]" >&2; exit 2 ;;
  esac
  shift
done

git fetch --quiet --prune origin

have_gh=0
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  have_gh=1
fi

now="$(date +%s)"
limit=$((hours * 3600))
count=0

while read -r ref ts; do
  [[ -z "${ref:-}" ]] && continue
  branch="${ref#origin/}"
  age=$((now - ts))
  (( age >= limit )) || continue
  age_h="$((age / 3600))h$(((age % 3600) / 60))m"

  if (( have_gh )); then
    open="$(gh pr list --head "$branch" --state open --json number --jq 'length')"
    if [[ "$open" != "0" ]]; then
      continue # has an open PR: not stale
    fi
    count=$((count + 1))
    echo "STALE  $branch  age=$age_h  no open PR"
    if (( release )); then
      git push --quiet origin --delete "$branch" && echo "       released (branch deleted on origin)"
    fi
  else
    count=$((count + 1))
    echo "OLD    $branch  age=$age_h  PR-status okänd (gh saknas eller är inte inloggat; raderas inte)"
  fi
done < <(git for-each-ref --format='%(refname:short) %(committerdate:unix)' 'refs/remotes/origin/claude/task-*')

if (( count == 0 )); then
  echo "no stale claims (limit ${hours}h)"
fi
