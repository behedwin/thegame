# Simgrinden kör seeds parallellt

## Beslut
`npm run sim` delar de 200 seedsen på flera barnprocesser (en per kärna, högst 8; `--jobs 1` kör seriellt),
slår ihop resultaten i seed-ordning och bedömer dem exakt som förut. Grinden är oförändrad: samma seeds,
samma 3 h, samma gränser och samma `sim-report.json`.

## Motivering
2026-11-15 tog simmen 344 s av CI:s drygt 7 minuter per PR, och efter buggen i 053 nära 18 av 20 minuter.
Den körde seriellt på en kärna, trots att GitHubs maskiner har 4. Varje PR som ligger efter main kör om CI,
så tiden multipliceras när flera PR:er väntar.

Verifierat lokalt: seriellt 195 s, parallellt 39 s (8 jobb), och `sim-report.json` byte för byte identisk.
Alla grindar lokalt: 220 s → 63 s.

## Alternativ som valdes bort
- Färre seeds eller kortare simtid: gör grinden svagare (HÅRT STOPP).
- Dela CI i flera jobb (sim och e2e parallellt): mer komplext, och statuskontrollen `gates` måste byggas om.
  Kan göras senare om det behövs.
- Optimera boten: risk att simresultaten ändras. Parallellisering ger mer och ändrar ingenting.
