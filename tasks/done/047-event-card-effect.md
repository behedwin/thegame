---
id: 047
size: S
status: done
touches: [src/ui/event-card.ts, src/ui/effects.ts, src/ui/style.css, src/content/texts.ts]
depends: []
priority: normal
---

# Visa vad eventet ger på eventkortet

Från förslaget `p-event-card-effect`.

Eventkortet (`src/ui/event-card.ts`) visar i dag bara rubriken och "Tryck!". Lägg till en diskret rad med
eventets effekt från `effectLine` i `src/ui/effects.ts` (samma rad som under ärendevalen sedan 043/045), t.ex.
"Produktion ×2 i 60 s · ≈ +1 200 KP" eller "+45 KP direkt". Raden räknas ut när kortet skapas och tas med i
kortets `aria-label`.

*Varför (VISION, "tydligt" och korta sessioner):* spelaren hinner se vad trycket är värt innan tiden går ut,
och eventen talar samma språk som inkorgen och HUD:en.

## Gränser
- Ingen balansändring och inget nytt sparfält. Simmen ska vara oförändrad.
- Kortet får inte bli högre än att det ryms på 360 px bredd utan ful radbrytning (mindre text, `muted`).

## Tester
- Enhet (`tests/047-*.test.ts`): radens text för ett event med klumpsumma och för ett med tillfällig bonus.
- E2e (`e2e/047-*.spec.ts`, 360 px): tvinga fram ett event, se att effektraden syns på kortet och att kortet
  inte är bredare än skärmen. Spara en skärmdump.
