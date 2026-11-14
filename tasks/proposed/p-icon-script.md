---
id: p-icon-script
size: S
status: proposed
touches: [scripts/, package.json]
depends: []
---

# Skript som renderar om ikonerna

Lägg in `scripts/gen-icons.mjs` som utgår från en geometri och skriver `public/icon.svg`, Androids
vektorförgrund och alla PNG:er (webb 192/512/maskable och `mipmap-*`) med den Playwright som redan finns som
dev-beroende. Lägg till `npm run icons`.

*Varför:* i 007 renderades PNG:erna en gång utanför repot, eftersom `scripts/` låg utanför `touches`. Med ett
committat skript går det att ändra motivet utan att SVG, vektor och PNG glider isär.

Tester: skriptet körs i en temporär katalog, och storlekarna och färgerna stämmer med `tests/007-icon.test.ts`.
