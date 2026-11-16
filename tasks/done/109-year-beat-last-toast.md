---
id: 109
size: S
status: done
touches: [src/ui/app.ts, src/core/prestige.ts, src/content/texts.ts]
depends: [106]
priority: normal
changelog: "En notis firar när läsåret passerar förra läsårets KP."
---

# Toast när läsåret slår förra läsårets KP

Från förslaget `p-year-beat-last-toast`.

*Varför (VISION, lång loop och personliga mål):* 106 visar förra läsårets KP i statistiken, men spelaren
måste själv öppna den för att se när målet passeras. En kort toast ("Nytt rekord: du har passerat förra
läsårets KP!") i det ögonblick `runEarned` går förbi `lastYearEarned` gör det personliga målet till en
belöning mitt i läsåret. Ingen balansändring och inget nytt sparfält.

## Vad som ska göras
- Ren hjälpare `passedLastYear(prev, next)` i `src/core/prestige.ts`: sann bara när `prev.runEarned` är
  ≤ `lastYearEarned` och `next.runEarned` är > `lastYearEarned`, inom samma läsår (`prestiges` lika), från
  andra läsåret (`prestiges > 0`) och aldrig om `lastYearEarned` är 0.
- I `src/ui/app.ts` jämförs tillståndet mellan två renderingar (samma mönster som navets nivåtoast, 092)
  och toasten visas med `toast(..., 'good')`. Den visas inte direkt efter laddning av en sparning.
- Texten läggs i `texts.ts`.

## Tester
- Enhet (`tests/109-*.test.ts`): `passedLastYear` ger true bara vid korsningen; false första läsåret, false
  när `lastYearEarned` är 0, false vid läsårsbyte och false när värdet redan låg över.
- e2e (`e2e/109-*.spec.ts`): en sparning strax under förra läsårets KP visar toasten efter några klick. Inga
  konsolfel.
