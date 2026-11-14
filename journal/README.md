# journal/: en fil per körning

Filnamn: `journal/<ISO-tid>-<task-id>.md`, där ISO-tiden är UTC i grundformat utan kolon (giltigt på Windows),
t.ex. `journal/20261114T153000Z-002.md`. Ta fram tiden med `date -u +%Y%m%dT%H%M%SZ`.

Eftersom varje körning skriver en egen fil uppstår inga merge-konflikter mellan parallella workers.

## Mall
```markdown
# Körning <datum> – task <id>: <rubrik>

- Run-id: <run-id>
- PR: <länk eller "ingen">
- Utfall: klar | blockerad | konflikt | avbruten

## Gjort
## Problem
## Pacing (sim före → efter)   <!-- obligatoriskt vid balansändring -->
## Nästa steg / förslag
```
