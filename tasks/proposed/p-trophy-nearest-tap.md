---
id: p-trophy-nearest-tap
size: S
status: proposed
touches: [src/ui/achievements.ts, src/ui/style.css]
depends: [077]
---

# Troféfliken: tryck på "Nästan där" för att hitta trofén i listan

*Varför (VISION, retention; tydliga nära mål):* 077 lyfter fram den närmaste trofén överst, men samma trofé
ligger också längre ner i listan bland de andra. Ett tryck på det markerade kortet scrollar till trofén i
listan och blinkar den kort (samma `flash`-klass som köpkorten), så att spelaren ser var den hör hemma och
vilka troféer som ligger runt den. Ingen balansändring.

## Tester
- e2e: tryck på `achievement-nearest` och kontrollera att rätt kort i listan är synligt och får `flash`.
