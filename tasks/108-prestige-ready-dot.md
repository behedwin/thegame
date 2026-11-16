---
id: 108
size: S
status: ready
touches: [src/ui/tab-dots.ts, src/content/texts.ts]
depends: [105]
priority: normal
changelog: "Fliken Läsår får en prick när du kan starta ett nytt läsår."
---

# Prick på fliken Läsår när ett nytt läsår kan startas

Från förslaget `p-prestige-ready-dot`.

*Varför (VISION, retention; tydliga nära mål):* fliken Läsår får i dag bara en prick när en merit går att köpa
(089). Första gången prestige blir möjlig (efter 30–90 min enligt simmen) märks det bara om spelaren själv
öppnar fliken. Låt pricken också visas när `canPrestige(state)` är sant (minst 1 merit väntar) och spelaren
är på en annan flik, med en egen skärmläsartext (t.ex. "Nytt läsår kan startas") i `T.a11y`. Det är en
ändring i `tabDots` (`src/ui/tab-dots.ts`). Ingen balansändring och inget nytt sparfält.

Skälet (`why`) är meritskälet när en merit går att köpa, annars den nya texten.

## Tester
- Enhet (`tests/108-*.test.ts`): `tabDots` ger prick på `prestige` när `canPrestige` är sant och fliken inte
  är öppen, aldrig på den öppna fliken, och skälet är den nya texten när ingen merit går att köpa.
