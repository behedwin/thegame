---
id: 001
size: S
status: done
touches: [src/core/bulk.ts, src/ui/shop.ts, src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: []
---

# Köp ×1 / ×10 / MAX

En väljare ovanför listorna (Integrationer och Uppgraderingar) för köp ×1, ×10 eller MAX. Visa totalkostnad
och antal på knappen.

- Ny ren kärnmodul `src/core/bulk.ts`: `costOfMany(state, id, n)`, `maxAffordable(state, id)` och
  `buyMany(state, id, n)`. Testa mot den geometriska summan.
- *Varför:* standard i genren och färre tryck (docs/RESEARCH.md, UI/UX).
