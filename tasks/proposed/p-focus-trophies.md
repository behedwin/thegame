---
id: p-focus-trophies
size: M
status: proposed
touches: [src/content/types.ts, src/core/achievements.ts, src/core/focus.ts, src/core/state.ts, src/save/, src/content/achievements/]
depends: [053]
---

# Troféer för läsårets inriktning

053 gav ett val vid varje nytt läsår, men inget minns vilka inriktningar spelaren har prövat. Spara de
inriktningar som har spelats ett helt läsår (nytt fält `focusesPlayed: string[]`, fylls i av `prestige()`
med den inriktning som just avslutades), och lägg till ett villkor `{ kind: 'focusesPlayed'; n }` i
`AchievementCondition` med två troféer som nya filer, t.ex. "Försöksverksamhet" (2 olika) och
"Har provat allt" (alla icke-standardinriktningar).

*Varför (VISION, lång loop; `docs/RESEARCH.md`, "Prestige ska ge både kraft och en ny regel"):* troféerna
ger en anledning att pröva varje inriktning minst en gång i stället för att fastna i samma val.

## Tester
- Enhet: `prestige()` lägger till den avslutade inriktningen en gång (inte Vanligt läsår), villkoret
  uppfylls vid exakt n, och indata muteras inte.
- Migrering: ny `SAVE_VERSION`, gamla sparningar får `focusesPlayed: []`.
- Content-validering av de nya troféerna. Kontrollera att e2e som räknar troféer inte hårdkodar antalet.
