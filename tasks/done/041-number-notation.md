---
id: 041
size: S
status: done
priority: normal
touches: [src/ui/format.ts, src/ui/settings.ts, src/ui/app.ts, src/core/state.ts, src/save/, src/content/texts.ts]
depends: [040]
---

# Talformat i inställningar

Från förslaget `p-number-notation`.

Lägg till ett val i inställningsdialogen: svenska förkortningar (i dag, standard: "1,23 M", "4,56 md") eller
vetenskaplig notation ("1,23e6"). Valet sparas i `settings` (ny nyckel, `SAVE_VERSION` höjs med en migrering
som sätter standardvärdet). `fmt()` i `src/ui/format.ts` får formatet som parameter eller läser en
modulvariabel som UI:t sätter; `src/core/` ska inte känna till formatet utöver själva inställningsfältet. Tal
under 1e6 visas likadant i båda lägena.

*Varför (VISION, "tydligt"):* avancerade spelare föredrar notation, nya spelare förkortningar.

## Tester
- `fmt` i båda lägena (gränsfall runt 1e6, stora exponenter, negativa tal).
- Migreringen sätter standardvärdet och gamla sparningar laddas.
- E2E: byt läge i inställningarna, se att KP-visningen ändras och att valet finns kvar efter omladdning.
