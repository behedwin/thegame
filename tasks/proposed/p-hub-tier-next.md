---
id: p-hub-tier-next
size: S
status: proposed
touches: [src/ui/network.ts, src/ui/app.ts, src/content/texts.ts]
depends: [084]
---

# Navets nästa nivå syns i tipset

Navets nivå (Skolnav … Datahjärta) syns nu både på kartan och i den kompakta remsan (084), men spelaren vet
inte vad som krävs för nästa nivå. Visa i navets aria-label och i ett kort tips vid tryck-och-håll på
nivåetiketten hur många KP/s som behövs till nästa nivå (gränserna följer `hubTier()`: 10, 1 000, 100 000 …
KP/s), t.ex. "Kommunnav – nästa: Regionnav vid 1 000 KP/s". På högsta nivån står bara namnet.

*Varför (VISION, "ett nytt delmål inom räckhåll"):* ett synligt nästa steg ger ett kort mål mellan köpen.

## Tester
- Unit: en ren funktion `nextHubTierKps(tier)` ger rätt gräns och `null` på högsta nivån.
- e2e (390×844): texten matchar nivån för en sparning med känd KP/s. Inga konsolfel.
