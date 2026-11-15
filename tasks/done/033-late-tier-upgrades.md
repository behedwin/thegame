---
id: 033
size: S
status: done
touches: [src/content/upgrades/, src/content/balance.ts]
depends: []
priority: normal
---

# Uppgraderingar för de senare integrationstyperna

Från förslaget `p-late-tier-upgrades` (flyttat till kön automatiskt när kön var tom).

*Varför (VISION, mellanloopen):* sent i första läsåret finns i dag inga nya uppgraderingar att sikta på,
bara fler automationer. Det finns uppgraderingar med `autoMult` för `csv`/`nightly` (`mapping.ts`) och
`flow`/`api`, men inga för `sftp`, `scim`, `ss12001api` och `lti`.

## Vad som ska göras
- Två nya uppgraderingar med `autoMult` ×2, en fil var i `src/content/upgrades/`: en för `sftp` + `scim`
  och en för `ss12001api` + `lti`. Samma stil som `mapping.ts`: torr parodihumor på svenska, `order` efter
  de befintliga och `maxLevel` 3.
- Kostnaderna sätts så att de dyker upp när motsvarande automationer brukar köpas.
- Balansera med sim: första prestige ska ligga kvar inom 30–90 min och med god marginal till golvet. Justera
  vid behov `balance.ts`.

## Tester
- Content-valideringen täcker de nya filerna. Lägg till ett enhetstest (`tests/033-*.test.ts`) som
  verifierar att uppgraderingarna fördubblar rätt automationers produktion och inga andras.
- Journalen anger sim-siffror före och efter från `sim-report.json`.
