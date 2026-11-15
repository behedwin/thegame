---
id: 077
size: S
status: done
priority: normal
changelog: "Troféfliken lyfter fram den trofé du är närmast."
touches: [src/ui/achievements.ts, src/ui/style.css, src/content/texts.ts]
depends: [067]
---

# Troféfliken: lyft fram den trofé som är närmast

Sedan 067 visar låsta troféer "7 av 10", men de ligger i innehållsordning och den som nästan är klar kan
ligga långt ner i listan. Visa ett markerat "Nästan där"-kort överst: den låsta trofé som har högst
`have / need` enligt `progress` från `src/core/achievements.ts`. Etiketten kommer från `texts.ts`. Ingen
markering när inga räknebara troféer är låsta. Urvalet görs i en ren, exporterad hjälpfunktion i
`src/ui/achievements.ts` (ingen ändring i `src/core/`).

*Varför (VISION, retention):* ett tydligt nära mål varje gång spelaren öppnar fliken, utan balansändring.

## Tester
- Enhet: urvalet väljer högst andel, ignorerar tagna troféer och villkor utan räknare, och ger inget när
  inga räknebara troféer är låsta.
- e2e: med ett sparat spel ligger rätt trofé överst med etiketten.

Från förslaget `p-trophy-sort-nearest`.
