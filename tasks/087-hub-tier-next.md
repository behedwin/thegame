---
id: 087
size: S
status: ready
priority: normal
changelog: "Navet visar hur mycket KP/s som behövs till nästa nivå."
touches: [src/ui/network.ts, src/ui/app.ts, src/ui/hero.ts, src/content/texts.ts]
depends: [085]
---

# Navets nästa nivå syns i tipset

Från förslaget `p-hub-tier-next`.

Navets nivå (Skolnav … Datahjärta) syns både på kartan och i den kompakta remsan (084), men spelaren vet
inte vad som krävs för nästa nivå. Visa i navets aria-label och i ett kort tips vid tryck på
nivåetiketten hur många KP/s som behövs till nästa nivå (gränserna följer `hubTier()` i
`src/ui/network.ts`: 10, 1 000, 100 000, 10 000 000 KP/s), t.ex. "Kommunnav – nästa: Regionnav vid
1 000 KP/s". På högsta nivån står bara namnet.

*Varför (VISION, "ett nytt delmål inom räckhåll"):* ett synligt nästa steg ger ett kort mål mellan köpen.

## Tester
- Enhet (`tests/087-*.test.ts`): en ren funktion `nextHubTierKps(tier)` ger rätt gräns, stämmer med
  `hubTier()` (gränsen ger nästa nivå, strax under ger nuvarande) och ger `null` på högsta nivån.
- e2e (`e2e/087-*.spec.ts`, 390×844): texten matchar nivån för en sparning med känd KP/s. Inga konsolfel.
