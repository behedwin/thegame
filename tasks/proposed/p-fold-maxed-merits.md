---
id: p-fold-maxed-merits
size: S
status: proposed
touches: [src/ui/shop.ts, src/ui/prestige.ts, src/ui/style.css]
depends: [073]
---

# Maxade meriter samlas längst ned

073 fäller ihop maxade uppgraderingar i raden "Klara (n)". Meritbutiken i Läsår-fliken har samma problem efter
några läsår: maxade meriter ligger kvar nedtonade mellan dem man kan köpa. Använd samma `splitMaxed` och
fold-rad för `kind: 'merits'`.

*Varför (VISION, "mobilen först", "tydligt"):* mindre skrollande i den långa loopen, och det man kan köpa står först.

## Tester
- Enhet: oförändrad `splitMaxed` täcker sorteringen; lägg till ett fall för meriter om logiken skiljer sig.
- e2e (390×844): med en maxad merit syns "Klara (1)" i Läsår-fliken; tryck visar och döljer kortet.
