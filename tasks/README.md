# tasks/: uppgiftskön

Kön är ersättningen för BACKLOG.md. Den är byggd för flera autonoma workers som arbetar parallellt.

| Plats | Innehåll | Tillåten status |
|---|---|---|
| `tasks/NNN-slug.md` | Kön. `priority: high` före `normal`, sedan **lägst NNN först**. | `ready`, `blocked` |
| `tasks/done/NNN-slug.md` | Klara uppgifter (flyttas hit i samma PR som implementationen). | `done` |
| `tasks/proposed/p-slug.md` | Förslag som inte är godkända än. | `proposed` |
| `tasks/claims/<id>.md` | Lås. Finns **bara på grenen** `claude/task-<id>` och får aldrig nå main. | – |

## Frontmatter
```yaml
---
id: 007                 # tre siffror (förslag: p-<slug>), samma som filnamnets början
size: M                 # S (< 1 h) | M (en körning) | L (flera körningar, mergas aldrig automatiskt)
status: ready           # ready | blocked | done | proposed
touches: [src/ui/app.ts, src/content/events/]   # filer, eller kataloger som slutar med /
depends: [005]          # id:n som måste ligga i tasks/done/
kind: refactor          # valfri: feature (standard) | refactor
priority: normal        # valfri: high | normal (standard). high väljs före normal
---
# Rubrik

Beskrivning och motivering.
```

- `touches` styr parallelliteten. Två uppgifter vars `touches` överlappar (samma fil, eller en katalog som
  innehåller den andra) körs aldrig samtidigt. Var hellre för bred än för smal.
- Utöver `touches` får en worker alltid röra: nya testfiler (`tests/<id>-*.test.ts`, `e2e/<id>-*.spec.ts`),
  `journal/`, `decisions/`, sin egen uppgiftsfil och högst 1 ny fil i `tasks/proposed/`.
- Var femte uppgift är en refaktoreringsuppgift (005, 010, 015 …) med `kind: refactor`. Med `depends`
  fungerar den som en spärr: den väntar in de fyra uppgifterna före sig, och de fyra efter väntar in den. En
  refaktoreringsuppgift räknar `blocked` beroenden som klara, så att en blockerad uppgift inte stoppar kön.
- `blocked`: lägg till en sektion `## Blockerad` med orsak (grindfel ×3, HÅRT STOPP osv.).

## Verktyg
- `npm run tasks:check`: validerar allt ovan. Ingår i CI och i `npm run gates`.
- `node scripts/next-task.mjs`: listar valbara uppgifter i ordning (efter `git fetch --prune`).
  `--queue` visar hela kön med placering.
- `scripts/claim.sh <id> <run-id>`: tar låset.
- `scripts/stale-claims.sh [--release]`: listar döda lås och kan frigöra dem.

## Godkänna förslag
Ägaren, eller en worker för `[S]`-förslag, flyttar `tasks/proposed/p-slug.md` till `tasks/NNN-slug.md` med
nästa lediga NNN och sätter `status: ready`. Dubbletter av id stoppas av `tasks:check`.
