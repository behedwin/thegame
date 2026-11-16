---
id: p-merit-total-effect
size: S
status: proposed
touches: [src/ui/shop.ts, src/content/texts.ts]
depends: [081]
---

# Meritkortet visar samlad effekt

*Varför (VISION, "tydligt" och lång loop):* Meritkorten visar nivå och pris, men raden under titeln är tom.
Efter några läsår vet spelaren inte vad meriterna faktiskt ger tillsammans ("Nivå 4/10" säger inte "+20 %
produktion"). En kort rad med den samlade effekten på nuvarande nivå (t.ex. "Nu: +20 % produktion") gör det
lättare att välja nästa merit och känns som belöning för de läsår man har spelat. Ingen balansändring.

Gör så här: fyll `card-sub` för `kind: 'merits'` i `ShopList.update` med en text från `texts.ts` per
effekttyp (`prodPct`, `clickPct`, `offlineEffPct`, `eventCooldownPct`, prisrabatt, `startAutomation`). Tom
rad på nivå 0.

## Tester
- Enhet: texten för varje effekttyp vid nivå 0, 1 och max.
- e2e (390×844): en merit på nivå 2 visar rätt samlad effekt i Läsår-fliken.
