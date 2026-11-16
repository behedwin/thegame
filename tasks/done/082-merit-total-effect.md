---
id: 082
size: S
status: done
priority: normal
changelog: "Meritkorten visar vad meriten ger dig just nu."
touches: [src/ui/shop.ts, src/content/texts.ts, src/ui/style.css]
depends: []
---

# Meritkortet visar samlad effekt

Från förslaget `p-merit-total-effect`.

*Varför (VISION, "tydligt" och lång loop):* meritkorten visar nivå och pris, men raden under titeln
(`card-sub`) är tom. Efter några läsår vet spelaren inte vad meriterna faktiskt ger tillsammans
("Nivå 4/10" säger inte "+20 % produktion"). En kort rad med den samlade effekten på nuvarande nivå
(t.ex. "Nu: +20 % produktion") gör det lättare att välja nästa merit och känns som en belöning för de
läsår man har spelat. Ingen balansändring.

## Vad som ska göras
- Fyll `card-sub` för `kind: 'merits'` i `ShopList.update` (`src/ui/shop.ts`) med en text per effekttyp
  i `MeritEffect`: `prodPct`, `clickPct`, `offlineHours`, `startAutomation`, `autoDiscountPct`
  (multiplikativ: räkna ut den faktiska rabatten), `eventCooldownPct` (respektera taket om det finns i
  core) och `offlineEffPct`. Texterna i `texts.ts`.
- Lägg gärna textfunktionen som en ren, exporterad hjälpare så att den kan enhetstestas.
- Tom rad på nivå 0. Maxade meriter (081) visar också sin effekt.

## Tester
- Enhet (`tests/082-*.test.ts`): texten för varje effekttyp vid nivå 0, 1 och max.
- e2e (`e2e/082-*.spec.ts`, 390×844): en merit på nivå 2 visar rätt samlad effekt i Läsår-fliken.
