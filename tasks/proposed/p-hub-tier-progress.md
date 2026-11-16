---
id: p-hub-tier-progress
size: S
status: proposed
touches: [src/ui/network.ts, src/ui/app.ts, src/ui/style.css]
depends: [087]
---

# Mätare mot navets nästa nivå

*Varför (VISION, "ett nytt delmål inom räckhåll"):* Med 087 vet spelaren vilken KP/s som krävs till nästa
navnivå, men inte hur nära den är. En tunn mätare under nivånamnet i den kompakta remsan (och en svag båge
runt navet på stora kartan) visar framstegen på en log-skala mellan nuvarande och nästa gräns. Det ger ett
kort mål att se fyllas mellan köpen. Ingen balansändring.

## Vad som ska göras
- En ren `hubTierProgress(kps)` i `network.ts` som ger 0..1 (log10 mellan nuvarande och nästa gräns, 1 på
  Datahjärta). Den bygger på `nextHubTierKps`.
- Rita mätaren med en CSS-variabel (`--tier-progress`) på `.hub-tier` i `app.ts`/`style.css`.

## Tester
- Enhet: 0 vid gränsen, 0,5 mitt i (log-skala), strax under 1 före nästa gräns, 1 på toppen, aldrig NaN vid 0 KP/s.
- e2e (390×844): mätaren syns i remsan och har en bredd mellan 0 och 100 %. Inga konsolfel.
