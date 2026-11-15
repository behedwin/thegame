---
id: p-compact-expand-button
size: S
status: proposed
touches: [src/ui/hero.ts, src/ui/style.css, src/content/texts.ts]
depends: [060]
---

# Knapp för att fälla ut den kompakta kartan

Efter 057 fälls kartan ut när man trycker på remsan, men det går bara med finger eller mus: remsan är ingen
knapp, så den nås inte med tangentbord eller skärmläsare, och bara en `title` antyder att den går att trycka
på. Lägg en liten, tydlig knapp (t.ex. en pil, `aria-label` från `T.heroExpand`) i remsans hörn som bara
syns i kompakt läge och gör samma sak som ett tryck på remsan. Logiken finns samlad i `HeroSize` i
`src/ui/hero.ts` (060).

*Varför (VISION, "tydligt"):* spelaren ska se att kartan går att få tillbaka, och spelet ska gå att använda
utan pekskärm.

Tester: e2e (390×844) att knappen syns och kan fokuseras i kompakt läge, att Enter fäller ut kartan och
skrollar listan till toppen, och att knappen är dold i stort läge.
