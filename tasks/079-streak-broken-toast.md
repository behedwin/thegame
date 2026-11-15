---
id: 079
size: S
status: ready
priority: normal
changelog: "En kort notis säger till när din eventsvit bryts."
touches: [src/core/events.ts, src/ui/, src/content/texts.ts]
depends: [069]
---

# Kort notis när en eventsvit bryts

Eventsviten (069) nollställs tyst när ett event rinner ut. Spelaren märker det först när "Svit N 🔥" saknas på
nästa kort. En kort, vänlig toast ("Sviten bröts vid 5 – ny chans snart!") när en synlig svit (minst
`BALANCE.events.streak.min`) bryts gör förlusten begriplig och lockar till att vara med nästa gång.

*Varför (VISION, retention och "tydligt"):* spelaren ska förstå vad som hände, utan straff och utan
balansändring.

## Vad som ska göras
- En ren hjälpfunktion i `src/core/events.ts`, t.ex. `brokenStreak(before, after): number`, som ger den
  bortfallna sviten (0 om ingen synlig svit bröts).
- UI-lagret jämför tillstånden före och efter tick och visar toasten med text från `texts.ts`. Ingen toast
  för sviter under minimum. Använd den toast som redan finns i UI:t.

## Tester
- Enhet: `brokenStreak` för svit under och över minimum, löst event (ingen bruten svit), ingen förändring och
  ingen mutation av indata.
- e2e (valfritt): ett sparat spel med svit 4 eller mer och ett event som rinner ut visar toasten.

Från förslaget `p-streak-broken-toast`.
