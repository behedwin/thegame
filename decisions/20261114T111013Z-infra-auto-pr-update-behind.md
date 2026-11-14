# Beslut: auto-pr uppdaterar grenar som ligger efter (2026-11-14)

**D36 – `auto-pr.sh` uppdaterar PR-grenen direkt om den ligger efter main**
`update-behind` i `automerge.yml` körs bara vid push till main. En PR som skapas efter att main har rört sig
(med strict branch protection) kunde därför bli stående tills nästa merge, till exempel hela natten om kön
stannar. Nu kontrollerar `auto-pr.sh` med `git merge-base --is-ancestor origin/main HEAD` (lokalt och
deterministiskt, utan att vänta på GitHubs `mergeStateStatus`) och kör `gh pr update-branch` direkt. Går det
inte sätts `conflict`, vilket stänger av auto-merge. Uppdateringen görs med `AUTOMERGE_TOKEN` och startar CI.
Merge-commiten saknar `[ready]` och startar därför inte auto-pr igen (ingen loop).
