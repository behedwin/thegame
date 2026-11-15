---
id: p-trophy-sort-nearest
size: S
status: proposed
touches: [src/ui/achievements.ts, src/content/texts.ts]
depends: [067]
---

# Troféfliken: lyft fram den trofé som är närmast

*Varför (VISION, retention):* sedan 067 visar låsta troféer "7 av 10", men de ligger i innehållsordning och
den som nästan är klar kan ligga långt ner i listan. Ett markerat "Nästan där"-kort överst (den låsta trofé
med högst `have / need`) ger ett tydligt nära mål varje gång spelaren öppnar fliken, utan balansändring.

Gör så här: välj kortet i `src/ui/achievements.ts` med `progress` från `src/core/achievements.ts` och visa det
först med en etikett från `texts.ts`. Ingen markering när inga räknebara troféer är låsta.

## Tester
- Enhet: urvalet (ren hjälpfunktion) väljer högst andel, ignorerar tagna och villkor utan räknare.
- e2e: med ett sparat spel ligger rätt trofé överst med etiketten.
