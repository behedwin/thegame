---
id: p-best-year-toast
size: S
status: proposed
touches: [src/ui/app.ts, src/core/prestige.ts, src/content/texts.ts]
depends: [109]
---

# Toast när läsåret slår det bästa läsåret hittills

*Varför (VISION, lång loop och personliga mål):* 109 firar när läsåret passerar förra läsårets KP. Efter ett
svagare läsår är det målet lätt, och det verkliga personliga rekordet är `bestRunEarned` (det bästa läsåret
hittills, som årssammanfattningen redan jämför med). En andra, ovanligare toast ("Bästa läsåret hittills!")
i det ögonblick `runEarned` passerar `bestRunEarned` ger ett tydligt mål på lång sikt. Visas den i samma
rendering som 109-toasten räcker den ena (bästa-toasten vinner). Ingen balansändring och inget nytt sparfält.

## Vad som ska göras
- Ren hjälpare `passedBestYear(prev, next)` i `src/core/prestige.ts` med samma regler som `passedLastYear`
  (samma läsår, från andra läsåret, aldrig när rekordet är 0).
- Toasten i `src/ui/app.ts` bredvid 109-toasten, aldrig direkt efter laddning.

## Tester
- Enhet: sann bara vid korsningen; falsk första läsåret, vid läsårsbyte och när värdet redan låg över.
- e2e: en sparning strax under rekordet visar toasten efter några klick, och bara den ena toasten.
