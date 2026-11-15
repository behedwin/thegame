---
id: p-streak-broken-toast
size: S
status: proposed
touches: [src/core/events.ts, src/ui/, src/content/texts.ts]
depends: [069]
---

# Kort notis när en eventsvit bryts

*Varför (VISION, retention):* eventsviten (069) nollställs tyst när ett event rinner ut. Spelaren märker det
först när "Svit N 🔥" saknas på nästa kort. En kort, vänlig toast ("Sviten bröts vid 5 – ny chans snart!")
när en svit på minst `BALANCE.events.streak.min` bryts gör förlusten begriplig och lockar till att vara med
nästa gång, utan straff eller balansändring.

Gör så här: en ren hjälpfunktion i `src/core/events.ts`, t.ex. `brokenStreak(before, after): number`, som ger
den bortfallna sviten (0 om ingen synlig svit bröts). UI-lagret jämför tillstånden före och efter tick och visar
toasten med text från `texts.ts`. Ingen toast för sviter under minimum.

## Tester
- Enhet: `brokenStreak` för svit under och över minimum, löst event (ingen bruten svit) och ingen mutation.
- e2e: valfritt, med ett sparat spel med svit 4 och ett event som rinner ut.
