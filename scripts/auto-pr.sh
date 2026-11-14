#!/usr/bin/env bash
# Create (or update) the PR for a worker branch. Called by .github/workflows/auto-pr.yml
# when a commit whose message contains [ready] is pushed to claude/task-<id>.
#
# Env: BRANCH (claude/task-<id>), REPO (owner/name), HEAD_MSG (head commit message),
#      BASE (default main), DRY_RUN=1 to only print what would happen.
# Idempotent: an existing open PR for the branch is updated, never duplicated.
#
# Title: "<id>: <first heading of the task file>"; body: the journal file for the task.
# Label: blocked (task status blocked) > conflict ([conflict] in HEAD_MSG) > needs-review (size L) > automerge.
set -euo pipefail

: "${BRANCH:?BRANCH is required}"
: "${REPO:?REPO is required}"
BASE="${BASE:-main}"
HEAD_MSG="${HEAD_MSG:-}"
id="${BRANCH#claude/task-}"
if [[ "$id" == "$BRANCH" || -z "$id" ]]; then
  echo "auto-pr: $BRANCH is not a claude/task-<id> branch" >&2
  exit 1
fi

task="$(ls tasks/done/"$id"-*.md tasks/"$id"-*.md 2>/dev/null | head -n 1 || true)"
if [[ -z "$task" ]]; then
  echo "auto-pr: no task file for $id in tasks/ or tasks/done/" >&2
  exit 1
fi

field() { awk -v k="$1" 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} index($0, k":")==1 {sub("^" k ":[ \t]*", ""); print; exit}' "$task"; }
size="$(field size)"
status="$(field status)"
heading="$(grep -m 1 -E '^# ' "$task" | sed -E 's/^# +//' || true)"
title="$id: ${heading:-Task $id}"

# Prefer the journal file added on this branch; fall back to the newest one for the id.
journal="$(git diff --name-only --diff-filter=A "origin/$BASE...HEAD" -- journal/ 2>/dev/null | grep -E -- "-$id\.md$" | sort | tail -n 1 || true)"
[[ -z "$journal" ]] && journal="$(ls journal/*-"$id".md 2>/dev/null | sort | tail -n 1 || true)"

body_file="$(mktemp)"
{
  if [[ -n "$journal" && -f "$journal" ]]; then
    cat "$journal"
  else
    echo "_Ingen journalfil hittades för uppgift $id._"
  fi
  printf '\n---\nUppgift: `%s` · storlek %s · status %s\nSkapad av auto-pr.yml från `%s`.\n' "$task" "${size:-?}" "${status:-?}" "$BRANCH"
} > "$body_file"

if [[ "$status" == "blocked" ]]; then
  label="blocked"
elif [[ "$HEAD_MSG" == *"[conflict]"* ]]; then
  label="conflict"
elif [[ "$size" == "L" ]]; then
  label="needs-review"
else
  label="automerge"
fi

echo "auto-pr: id=$id size=$size status=$status label=$label journal=${journal:-none}"
echo "auto-pr: title=$title"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "--- body ---"
  cat "$body_file"
  exit 0
fi

existing="$(gh pr list -R "$REPO" --head "$BRANCH" --state open --json number --jq '.[0].number // empty')"
if [[ -n "$existing" ]]; then
  echo "auto-pr: PR #$existing already exists; updating title, body and labels"
  gh pr edit "$existing" -R "$REPO" --title "$title" --body-file "$body_file" --add-label "$label"
  for other in automerge needs-review; do
    [[ "$other" != "$label" ]] && gh pr edit "$existing" -R "$REPO" --remove-label "$other" >/dev/null 2>&1 || true
  done
else
  gh pr create -R "$REPO" --base "$BASE" --head "$BRANCH" --title "$title" --body-file "$body_file" --label "$label"
fi
