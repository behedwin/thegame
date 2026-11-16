---
id: p-year-clock-pace
size: S
status: proposed
touches: [src/ui/prestige.ts, src/content/texts.ts, src/ui/style.css]
depends: [094]
---

# Läsårsklockan visar när du ligger på rekordtakt

*Varför (VISION, retention; personliga mål):* 094 visar "Läsåret: 18 min (rekord 25 min)" på fliken Läsår.
Det märks inte direkt om man ligger före eller efter rekordet. Om raden färgas grön och får ett kort tillägg
som "· rekordtakt" medan tiden är under rekordet, blir jakten tydlig. När tiden passerar rekordet går den
tillbaka till grått. Ingen ny valuta, inget straff och ingen balansändring.

Gör så här: i `renderClock` sätter du en klass (`on-pace`) när `fastestYearMs > 0` och
`yearDurationMs(state) < fastestYearMs`. Tillägget läggs i `texts.ts` och färgen (`var(--good)` eller
motsvarande) i `style.css`.

## Tester
- Enhet: textfunktionen med och utan rekordtakt.
- e2e: med en sparning under rekordet har raden klassen `on-pace`, och med en sparning över rekordet saknas den.
  Inga konsolfel.
