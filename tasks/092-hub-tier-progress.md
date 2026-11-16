---
id: 092
size: S
status: ready
priority: normal
changelog: "En mätare visar hur nära navet är sin nästa nivå."
touches: [src/ui/network.ts, src/ui/app.ts, src/ui/style.css]
depends: [087, 090]
---

# Mätare mot navets nästa nivå

Från förslaget `p-hub-tier-progress`.

*Varför (VISION, "ett nytt delmål inom räckhåll"):* med 087 vet spelaren vilken KP/s som krävs till nästa
navnivå, men inte hur nära den är. En tunn mätare under nivånamnet i den kompakta remsan visar framstegen på
en log-skala mellan nuvarande och nästa gräns. Det ger ett kort mål att se fyllas mellan köpen. Ingen
balansändring.

## Vad som ska göras
- En ren `hubTierProgress(kps)` i `src/ui/network.ts` som ger 0..1 (log10 mellan nuvarande och nästa gräns,
  1 på högsta nivån). Den bygger på `nextHubTierKps`.
- Rita mätaren med en CSS-variabel (`--tier-progress`) på `.hub-tier` i `app.ts`/`style.css`.

## Tester
- Enhet (`tests/092-*.test.ts`): 0 vid gränsen, 0,5 mitt i (log-skala), strax under 1 före nästa gräns, 1 på
  toppen och aldrig NaN vid 0 KP/s.
- e2e (`e2e/092-*.spec.ts`, 390×844): mätaren syns i remsan och har en bredd mellan 0 och 100 %. Inga
  konsolfel.
