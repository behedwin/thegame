---
id: 039
size: S
status: done
priority: normal
touches: [src/core/state.ts, src/core/actions.ts, src/core/bulk.ts, src/save/, src/ui/stats.ts, src/content/texts.ts]
depends: []
---

# Rekord på statistiksidan

Från förslaget `p-lifetime-records`.

Lägg till "Bästa läsår (KP)" och "Köp totalt" på statistiksidan (013). Det är nya livstidsfält som ska
överleva `prestige()`, så de kräver en migrering (`SAVE_VERSION` 6 → 7, ny post i `MIGRATIONS`; befintliga
sparningar startar med `bestRunEarned` = max av nuvarande `runEarned` och 0, och `purchases` = 0). Valutan är
`Decimal`, antalet köp ett heltal.

*Varför (VISION, lång loop):* fler långsiktiga mål för spelare som har kört många läsår, utan att balansen
påverkas.

## Tester
- Migreringen v6 → v7 (och att en gammal sparning laddas utan fel).
- `prestige()` behåller fälten och uppdaterar bästa läsår om det just avslutade var bättre.
- Bulk-köp räknar rätt antal köp.
- Raderna syns i `statRows`.
- Sim-siffrorna ska vara oförändrade.
