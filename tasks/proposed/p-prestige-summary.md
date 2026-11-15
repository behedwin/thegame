---
id: p-prestige-summary
size: S
status: proposed
touches: [src/ui/prestige.ts, src/content/texts.ts]
depends: [050]
---

# Läsårssammanfattning vid "Nytt läsår"

När spelaren startar ett nytt läsår försvinner allt från körningen utan någon återblick. Visa en kort
sammanfattning i bekräftelsen eller direkt efteråt: KP det här läsåret, antal kunder, lösta ärenden och event
under läsåret och hur många Meriter som delas ut. `src/core/prestige.ts` (050) samlar nu allt som återställs
och behålls, så sammanfattningen kan byggas på det i stället för att gissa i UI:t.

*Varför (VISION, lång loop):* prestige är spelets stora ögonblick. En återblick gör läsåret till ett kapitel
och ger en naturlig plats för 052 (mål och kapitel).

## Tester
- Enhet: sammanfattningsraderna räknas från tillståndet före prestige och visar rätt tal.
- E2e: prestige visar sammanfattningen, och efter omladdning är den borta.
