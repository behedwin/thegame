---
id: p-event-card-effect
size: S
status: proposed
touches: [src/ui/event-card.ts, src/ui/effects.ts, src/ui/style.css, src/content/texts.ts]
depends: []
---

# Visa vad eventet ger på eventkortet

Eventkortet säger i dag bara rubrik och "Tryck!". Lägg till en diskret rad med effekten från `effectLine`
(samma som under ärendevalen sedan 043/045), t.ex. "Produktion ×2 i 60 s · ≈ +1 200 KP" eller "+45 KP direkt".

*Varför (VISION, "tydligt" och korta sessioner):* Spelaren hinner se vad trycket är värt innan tiden går ut,
och eventen talar samma språk som inkorgen och HUD:en. Ingen balansändring och inget nytt sparfält.

Tester: enhet för radens text (lump och buff), e2e (360 px) att raden syns på kortet utan att kortet radbryts
fult, och skärmdump.
