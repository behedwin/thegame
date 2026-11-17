---
id: 118
size: S
status: done
touches: [src/ui/achievements.ts, src/content/texts.ts, src/ui/style.css]
depends: [113]
priority: normal
changelog: "Tagna troféer kan fällas ihop, så att de som är kvar att ta syns bättre."
---

# Troféfliken: fäll ihop gruppen "Tagna"

Från förslaget `p-trophy-taken-collapse`.

*Varför (VISION, retention; tydliga nära mål):* sedan 113 ligger tagna troféer sist under "Tagna". När
spelaren har tagit många blir listan ändå lång att scrolla. Låt rubriken "Tagna" vara en knapp som fäller
ihop och ut gruppen, med antal (t.ex. "Tagna (12)"), ihopfälld som standard. Valet behöver inte sparas
men ska överleva att listan byggs om (`render` bygger om när en räknare ändras). Ingen balansändring.

## Vad som ska göras
- Rubriken blir en `button` med `aria-expanded`. Texten med antal läggs i `texts.ts`.
- "Nästan där"-kortet (104) pekar alltid på en låst trofé och ska fortsätta att hitta sitt kort.

## Tester
- `e2e/118-*.spec.ts` (390×844): gruppen är ihopfälld vid start, ett tryck på rubriken visar korten och ett
  nytt tryck döljer dem. "Nästan där" hittar fortfarande sitt kort. Inga konsolfel.
