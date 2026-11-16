---
id: 101
size: S
status: ready
priority: normal
changelog: "Fliken Troféer får en prick när du har låst upp en ny trofé."
touches: [src/ui/app.ts, src/content/texts.ts]
depends: [097]
---

# Prick på fliken Troféer när en ny trofé har låsts upp

Från förslaget `p-trophy-tab-dot`.

*Varför (VISION, "tydligt" och retention):* 089, 093 och 097 har gett prickar på Läsår, Uppgraderingar och
Integrationer. Troféer låses upp i bakgrunden och visas bara som en kort toast, som är lätt att missa. En prick
på Troféer tills spelaren öppnar fliken gör en ny trofé till en liten belöning att gå och titta på.

Gör så här: håll i `app.ts` reda på hur många troféer som fanns senast fliken var öppen (bara i minnet, inget
nytt sparfält; vid laddning räknas alla befintliga som sedda). Använd `setTabDot('achievements', …)` när
`state.achievements.length` är större. Skärmläsartext i `T.a11y`. Ingen balansändring.

## Tester
- e2e (390×844): en sparning som är nära en trofé får pricken när trofén låses upp och tappar den efter
  klick på fliken. Ingen prick direkt efter laddning. Inga konsolfel.
