---
id: p-prestige-ready-dot
size: S
status: proposed
touches: [src/ui/tab-dots.ts, src/content/texts.ts]
depends: [105]
---

# Prick på fliken Läsår när ett nytt läsår kan startas

*Varför (VISION, retention; tydliga nära mål):* fliken Läsår får i dag bara en prick när en merit går att köpa
(089). Första gången prestige blir möjlig (efter 30–90 min enligt simmen) märks det bara om spelaren själv
öppnar fliken. Låt pricken också visas när `canPrestige(state)` är sant och spelaren är på en annan flik, med
en egen skärmläsartext (t.ex. "Nytt läsår kan startas"). Efter 105 är det en rad i `tabDots`
(`src/ui/tab-dots.ts`). Ingen balansändring och inget nytt sparfält.

## Tester
- Enhet: `tabDots` ger prick på `prestige` när `canPrestige` är sant och fliken inte är öppen, aldrig på den
  öppna fliken, och skälet är den nya texten när ingen merit går att köpa.
