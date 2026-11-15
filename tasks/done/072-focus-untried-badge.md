---
id: 072
size: S
status: done
priority: normal
changelog: "Vid nytt läsår ser du vilka inriktningar du inte har provat än."
touches: [src/ui/prestige.ts, src/content/texts.ts]
depends: [068]
---

# Inriktningsvalet: märk inriktningar som inte är provade

*Varför (VISION, lång loop; retention):* sedan 068 minns spelet vilka inriktningar som har spelats ett helt
läsår (`focusesPlayed`), och två troféer belönar att pröva dem. Men i valet vid "Nytt läsår" syns inte vilka
som återstår, så spelaren måste komma ihåg det själv. En liten etikett "Inte provad" på de icke-standard-
inriktningar som saknas i `focusesPlayed` gör nästa mål synligt i precis det ögonblick valet görs, utan
balansändring.

Gör så här: i fokusvalet i `src/ui/prestige.ts`, lägg en etikett från `texts.ts` på varje val vars id inte
finns i `state.focusesPlayed` (aldrig på "Vanligt läsår"). Ingen etikett när alla är provade.

## Tester
- Enhet: en ren hjälpfunktion som avgör om en inriktning är oprovad (standardinriktningen aldrig).
- e2e: med ett sparat spel där `cloud` är provad har bara de andra valen etiketten.

Från förslaget `p-focus-untried-badge`.
