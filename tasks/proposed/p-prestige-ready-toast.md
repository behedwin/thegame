---
id: p-prestige-ready-toast
size: S
status: proposed
touches: [src/ui/app.ts, src/content/texts.ts]
depends: [108]
---

# Toast första gången ett nytt läsår kan startas

*Varför (VISION, retention; tydliga nära mål och lång loop):* Sedan 108 får fliken Läsår en prick när ett
nytt läsår kan startas, men pricken är diskret. Första gången under ett läsår som `canPrestige` blir sant kan
en kort toast visas, t.ex. "Nytt läsår kan startas! Du får 1 merit.", så att spelaren förstår att den långa
loopen har öppnat sig. Visa den bara en gång per läsår (övergången falskt → sant, hålls i minnet i UI:t,
inget nytt sparfält) och aldrig på fliken Läsår. Ingen falsk brådska: texten säger inget om att det är bråttom.

## Tester
- Enhet: en ren hjälpfunktion som ger toasten vid övergången falskt → sant och inte igen samma läsår.
- e2e behövs inte.
