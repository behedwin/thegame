---
id: p-merit-next-level
size: S
status: proposed
touches: [src/ui/shop.ts, src/content/texts.ts]
depends: [082]
---

# Meritkortet visar vad nästa nivå ger

*Varför (VISION, "tydligt" och lång loop):* sedan 082 visar meritkortet "Nu: +100 % produktion". När
spelaren har stjärnor att lägga är frågan i stället "vad får jag för nästa köp?". Särskilt Ramavtal (avtagande
rabatt) och Nätverkskontakter (tak på 75 %) ger mindre än beskrivningen antyder på höga nivåer. En rad
"Nästa: +150 %" i det utfällda kortet (tryck på texten, som 058) gör valet ärligt. Ingen balansändring.

## Vad som ska göras
- Återanvänd `meritEffectText(def, lvl + 1)` från `src/ui/shop.ts` och visa "Nästa: …" i `card-desc` när
  kortet är utfällt och meriten inte är maxad.
- Texterna i `texts.ts`.

## Tester
- Enhet: nästa-texten för Ramavtal på nivå 9 och Nätverkskontakter nära taket.
- e2e (390×844): utfällt meritkort visar "Nästa: …"; maxat kort visar ingen sådan rad.
