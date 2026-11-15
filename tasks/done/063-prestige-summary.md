---
id: 063
size: S
status: done
touches: [src/core/prestige.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: []
priority: normal
changelog: "När du startar ett nytt läsår får du en kort återblick på läsåret som gick."
---

# Läsårssammanfattning vid "Nytt läsår"

Från förslaget `p-prestige-summary`.

När spelaren startar ett nytt läsår försvinner allt från körningen utan någon återblick. Visa en kort
sammanfattning i bekräftelsedialogen för "Nytt läsår" (före knapparna): KP det här läsåret (`runEarned`),
antal kunder som har skrivits på (`signedCustomers`), antal integrationer som ägs och hur många Meriter som
delas ut (`pendingMerits`). Är läsåret det bästa hittills (jämför med `bestRunEarned`) visas en extra rad,
t.ex. "Ditt bästa läsår hittills!".

Lägg en ren funktion `yearSummary(state)` i `src/core/prestige.ts` som returnerar talen (Decimal för valutor),
och låt `src/ui/prestige.ts` bara formatera dem med texter från `texts.ts`. Inga nya sparfält: räknare per
läsår för event och ärenden finns inte, och de tas inte med här.

*Varför (VISION, lång loop):* prestige är spelets stora ögonblick. En återblick gör läsåret till ett kapitel
och knyter an till kapitlen från 052, i spelets varma och torra ton.

## Tester
- Enhet (`tests/063-*.test.ts`): `yearSummary` räknas från tillståndet före prestige och ger rätt KP, kunder,
  integrationer och Meriter; flaggan för bästa läsår är sann bara när `runEarned` > `bestRunEarned`; indata
  muteras inte.
- E2e (`e2e/063-*.spec.ts`): bekräftelsedialogen visar sammanfattningen, och efter bekräftelse och omladdning
  syns den inte. Inga konsolfel.
