---
id: 112
size: S
status: ready
touches: [src/ui/app.ts, src/ui/render-toasts.ts, src/core/prestige.ts, src/content/texts.ts]
depends: [109]
priority: normal
changelog: "En notis firar när läsåret blir ditt bästa läsår hittills."
---

# Toast när läsåret slår det bästa läsåret hittills

Från förslaget `p-best-year-toast`.

*Varför (VISION, lång loop och personliga mål):* 109 firar när läsåret passerar förra läsårets KP. Efter ett
svagare läsår är det målet lätt, och det verkliga personliga rekordet är `bestRunEarned` (det bästa läsåret
hittills, som årssammanfattningen redan jämför med). En andra, ovanligare toast ("Bästa läsåret hittills!")
i det ögonblick `runEarned` passerar `bestRunEarned` ger ett tydligt mål på lång sikt. Ingen balansändring och
inget nytt sparfält.

## Vad som ska göras
- Ren hjälpare `passedBestYear(prev, next)` i `src/core/prestige.ts` med samma regler som `passedLastYear`
  (samma läsår, från andra läsåret, aldrig när `bestRunEarned` är 0): sann bara när `prev.runEarned` är
  ≤ `bestRunEarned` och `next.runEarned` är > `bestRunEarned`.
- Toasten läggs i `renderToasts` (`src/ui/render-toasts.ts`, 110) bredvid 109-toasten. Passeras båda i samma
  rendering visas bara bästa-toasten. `prev` är null efter laddning, så en laddad sparning ger ingen toast.
- Texten läggs i `texts.ts`.

## Tester
- Enhet (`tests/112-*.test.ts`): `passedBestYear` är sann bara vid korsningen; falsk första läsåret, när
  rekordet är 0, vid läsårsbyte och när värdet redan låg över. `renderToasts` ger bara bästa-toasten när
  båda passeras samtidigt.
- e2e (`e2e/112-*.spec.ts`): en sparning strax under rekordet visar toasten efter några klick. Inga konsolfel.
