#!/usr/bin/env bash
# Create (or update) the PR for a worker or idea branch. Called by .github/workflows/auto-pr.yml
# when a commit whose message contains [ready] is pushed to claude/task-<id> or claude/idea-<slug>.
#
# Env: BRANCH, REPO (owner/name), HEAD_MSG (head commit message),
#      BASE (default main), DRY_RUN=1 to only print what would happen.
# Idempotent: an existing open PR for the branch is updated, never duplicated.
#
# claude/task-<id>:
#   Title "<id>: <first heading of the task file>", body = the task's journal file.
#   Label: blocked (task status blocked) > conflict ([conflict] in HEAD_MSG) > needs-review (size L) > automerge.
# claude/idea-<slug> (idea intake, see CLAUDE.md):
#   Title "Idé: <heading of the first new task>", body = list of new tasks + changed files.
#   Label: automerge only if every changed file is under tasks/, otherwise needs-review
#   (conflict if [conflict] is in HEAD_MSG).
#
# If the branch is behind BASE (BASE is not an ancestor of HEAD), the PR branch is updated right
# away with `gh pr update-branch`. If that fails, the PR is labelled conflict (disables auto-merge).
set -euo pipefail

: "${BRANCH:?BRANCH is required}"
: "${REPO:?REPO is required}"
BASE="${BASE:-main}"
HEAD_MSG="${HEAD_MSG:-}"

# Frontmatter field from a task file: field <file> <key>
field() { awk -v k="$2" 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} index($0, k":")==1 {sub("^" k ":[ \t]*", ""); print; exit}' "$1"; }
heading_of() { grep -m 1 -E '^# ' "$1" | sed -E 's/^# +//' || true; }

body_file="$(mktemp)"

case "$BRANCH" in
  claude/task-?*)
    mode="task"
    id="${BRANCH#claude/task-}"
    task="$(ls tasks/done/"$id"-*.md tasks/"$id"-*.md 2>/dev/null | head -n 1 || true)"
    if [[ -z "$task" ]]; then
      echo "auto-pr: no task file for $id in tasks/ or tasks/done/" >&2
      exit 1
    fi
    size="$(field "$task" size)"
    status="$(field "$task" status)"
    heading="$(heading_of "$task")"
    title="$id: ${heading:-Task $id}"

    # Prefer the journal file added on this branch; fall back to the newest one for the id.
    journal="$(git diff --name-only --diff-filter=A "origin/$BASE...HEAD" -- journal/ 2>/dev/null | grep -E -- "-$id\.md$" | sort | tail -n 1 || true)"
    [[ -z "$journal" ]] && journal="$(ls journal/*-"$id".md 2>/dev/null | sort | tail -n 1 || true)"
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
    echo "auto-pr: mode=task id=$id size=$size status=$status label=$label journal=${journal:-none}"
    ;;

  claude/idea-?*)
    mode="idea"
    slug="${BRANCH#claude/idea-}"
    changed="$(git diff --name-only "origin/$BASE...HEAD")"
    new_tasks="$(git diff --name-only --diff-filter=A "origin/$BASE...HEAD" -- tasks/ | grep -E '^tasks/[0-9]{3}-[^/]*\.md$' | sort || true)"

    first="$(printf '%s\n' "$new_tasks" | head -n 1)"
    count="$(printf '%s\n' "$new_tasks" | grep -c . || true)"
    if [[ -n "$first" ]]; then
      title="Idé: $(heading_of "$first")"
      (( count > 1 )) && title="$title (+$((count - 1)) uppgifter)"
    else
      title="Idé: $slug"
    fi

    {
      echo "Idéintag från \`$BRANCH\`."
      echo
      echo "## Nya uppgifter"
      if [[ -n "$new_tasks" ]]; then
        while read -r f; do
          [[ -z "$f" ]] && continue
          prio="$(field "$f" priority)"
          printf -- '- `%s` · %s · prio %s · depends [%s]: %s\n' \
            "$(field "$f" id)" "$(field "$f" size)" "${prio:-normal}" \
            "$(field "$f" depends | tr -d '[]')" "$(heading_of "$f")"
        done <<< "$new_tasks"
      else
        echo "_Inga nya uppgiftsfiler._"
      fi
      echo
      echo "## Ändrade filer"
      while read -r f; do [[ -n "$f" ]] && printf -- '- `%s`\n' "$f"; done <<< "$changed"
      printf '\n---\nSkapad av auto-pr.yml från `%s`.\n' "$BRANCH"
    } > "$body_file"

    outside="$(printf '%s\n' "$changed" | grep -v -E '^tasks/' | grep -c . || true)"
    if [[ "$HEAD_MSG" == *"[conflict]"* ]]; then
      label="conflict"
    elif [[ -n "$changed" && "$outside" == "0" ]]; then
      label="automerge"
    else
      label="needs-review"
    fi
    echo "auto-pr: mode=idea slug=$slug new_tasks=$count changed_outside_tasks=$outside label=$label"
    ;;

  *)
    echo "auto-pr: $BRANCH is not a claude/task-<id> or claude/idea-<slug> branch" >&2
    exit 1
    ;;
esac

echo "auto-pr: title=$title"

behind=0
if git rev-parse --verify --quiet "origin/$BASE" >/dev/null && ! git merge-base --is-ancestor "origin/$BASE" HEAD; then
  behind=1
fi
echo "auto-pr: behind_$BASE=$behind"

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

if (( behind )) && [[ "$label" != "conflict" ]]; then
  pr="$(gh pr list -R "$REPO" --head "$BRANCH" --state open --json number --jq '.[0].number // empty')"
  echo "auto-pr: $BRANCH is behind $BASE; updating PR #$pr"
  if ! gh pr update-branch "$pr" -R "$REPO"; then
    echo "auto-pr: could not update PR #$pr automatically; labelling conflict"
    gh pr edit "$pr" -R "$REPO" --add-label conflict || true
  fi
fi
