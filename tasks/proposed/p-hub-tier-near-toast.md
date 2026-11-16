---
id: p-hub-tier-near-toast
size: S
status: proposed
touches: [src/ui/app.ts, src/content/texts.ts]
depends: [092]
---

# Toast när navet nästan når nästa nivå

*Varför (VISION, "ett nytt delmål inom räckhåll"):* 092 visar en tunn mätare mot navets nästa nivå, men bara i
den kompakta remsan. En kort toast ("Nästan Regionnav! 90 %") när mätaren passerar 90 % gör spelaren uppmärksam
på att ett delmål är nära och lockar till ett köp till. Ingen balansändring.

## Vad som ska göras
- Ren hjälpfunktion som avgör om framsteget just passerade 0,9 (före < 0,9, efter ≥ 0,9, samma nivå), så att
  toasten visas en gång per nivå och inte vid laddning av en sparning.
- Text i `texts.ts` med nästa nivås namn.

## Tester
- Enhet: sann bara vid passagen, falsk vid nivåbyte, falsk på högsta nivån.
- e2e (390×844): inga konsolfel; toasten visas inte direkt efter laddning.
