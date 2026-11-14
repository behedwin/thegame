---
id: p-prestige-floor-margin
size: S
status: proposed
touches: [src/content/balance.ts]
depends: []
---
# Mer marginal till golvet för första prestige

Efter task 006 (achievements) ligger första prestige på min 30,55 min i simmen (gräns 30 min, tidigare
30,85). Varje ny tidig produktionsbonus (säsongsevent, kunder, nya uppgraderingar) riskerar att knuffa ner
den under golvet. En höjning av `prestige.divisor` hade nästan ingen effekt på minimum (4,5e7 gav
29,6 → 29,67 min). Undersök i stället en spak som påverkar de första 10 minuterna, t.ex.
`automationCostGrowth` eller `baseClick`, så att minimum hamnar runt 32 min utan att p50 passerar 45 min.
Motivera med sim-siffror före och efter.
