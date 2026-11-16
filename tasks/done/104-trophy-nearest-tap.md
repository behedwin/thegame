---
id: 104
size: S
status: done
priority: normal
changelog: "Tryck på trofén under \"Nästan där\" så hittar du den i listan."
touches: [src/ui/achievements.ts, src/ui/style.css]
depends: [077]
---

# Troféfliken: tryck på "Nästan där" för att hitta trofén i listan

Från förslaget `p-trophy-nearest-tap`.

*Varför (VISION, retention; tydliga nära mål):* 077 lyfter fram den närmaste trofén överst, men samma trofé
ligger också längre ner i listan bland de andra. Ett tryck på det markerade kortet scrollar till trofén i
listan och blinkar den kort (samma `flash`-klass som köpkorten, via `flashClass` i `src/ui/celebrate.ts`),
så att spelaren ser var den hör hemma och vilka troféer som ligger runt den. Ingen balansändring.

## Vad som ska göras
- Kortet `achievement-nearest` (`src/ui/achievements.ts`) har redan `data-id`. Gör det tryckbart (även med
  tangentbord: `role="button"`, `tabindex="0"`, Enter/mellanslag) och låt trycket hitta kortet i listan med
  samma `data-id`, scrolla det till synligt läge (`scrollIntoView({ block: 'center' })`) och blinka det.
- Ge listkorten `data-id` om de saknar det. Eventuell markör (t.ex. `cursor: pointer`) läggs i `style.css`.

## Tester
- e2e (`e2e/104-*.spec.ts`, 390×844): med en sparning där en trofé är närmast, tryck på
  `achievement-nearest` och kontrollera att rätt kort i listan är synligt i vyn och får `flash`. Inga
  konsolfel.
