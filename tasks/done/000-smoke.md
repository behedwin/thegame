---
id: 000
size: S
status: done
touches: [journal/]
depends: []
changelog: false
---

# Smoke-test av worker-flödet

Verifierar hela kedjan innan schemat aktiveras: lås (`claim.sh`), ett andra försök att ta låset ska ge exit 1,
`[ready]`-push → `auto-pr.yml` skapar en PR med etiketten `automerge` → CI (`gates`) → auto-merge (squash) →
grenen raderas → Pages deployar.

Workern rör bara `journal/`: den skriver en journalfil med vad som verifierades. Ingen spelkod ändras.
