---
id: 042
size: S
status: ready
priority: normal
touches: [src/content/balance.ts]
depends: [040]
---

# Mer marginal till golvet för första prestige

Från förslaget `p-prestige-floor-margin`.

Efter task 037 ligger första prestige på min 31,2 / p50 41,9 / p95 48,2 / max 53,5 min i simmen (gräns
30 min). Varje ny tidig produktionsbonus riskerar att knuffa ner minimum under golvet, och en höjning av
`prestige.divisor` har liten effekt på minimum (se journalen för 037: 1e9 behövdes för att alla seeds skulle
klara 30 min). Undersök i stället en spak som påverkar de första 10 minuterna, t.ex.
`automationCostGrowth` (i dag 1.15) eller `baseClick`, så att minimum hamnar runt 32–33 min utan att p50
passerar 45 min och utan att första köpet (≤ 15 s) eller första automationen (≤ 90 s) bryts.

*Varför (VISION, respekt för spelarens tid):* ett stabilt läsår på 30–45 min, så att nytt innehåll inte
kräver en balansräddning varje gång.

## Tester
- Sim före och efter (från `sim-report.json`) i journalen och PR:en: alla grindar gröna, minimum ≥ 32 min.
- Uppdatera befintliga tester som låser de ändrade balansvärdena.
