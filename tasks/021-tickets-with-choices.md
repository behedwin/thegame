---
id: 021
size: L
status: ready
touches: [src/content/tickets/, src/content/types.ts, src/content/registry.ts, src/content/balance.ts, src/content/texts.ts, src/core/, src/save/, src/ui/, sim/]
depends: []
priority: normal
---

# Ärenden med val (inkorgen)

Spelet ska inte bara vara grind och väntan. När spelaren öppnar appen ska det finnas **beslut att fatta**
som underhåller, inte bara siffror som tickar. Inför en inkorg med **ärenden**: korta, roliga
supportärenden från kunder och leverantörer där spelaren väljer mellan 2–3 svar med olika avvägningar.

*Varför (VISION):* mellanloopen ("något nytt inom räckhåll var 30–60:e sekund") och "att komma tillbaka ska
kännas som en belöning". Ärenden ger något att göra direkt vid öppning utan snabbtappande
(icke-mål: "inget krav på snabbtappande").

## Innehåll och regler
- Ny innehållstyp `TicketDef` i `src/content/types.ts`, en fil per ärende i `src/content/tickets/`, och
  hittas av registret med `import.meta.glob` som de andra typerna. Fält ungefär: `id`, `from` (system- eller
  kund-id som måste finnas i content), `title`, `text` och `choices` (2–3 st med `label`, `outcome` och
  `effect`). Effekterna återanvänder `EventEffect` (`prodMult`, `clickMult`, `lump`). Nya effekttyper bara om
  det behövs, och då med ett beslut i `decisions/`.
- **Valen är avvägningar, inte rätt/fel:** t.ex. KP nu mot buff över tid, eller klick mot produktion. Inget
  val ska dominera ett annat i sim. Minst ett val per ärende får gärna vara det roliga "boka ett möte".
- **Inga mörka mönster:** ärenden går aldrig ut, ignorerade ärenden straffas inte, inga nedräkningar och
  inga notiser. Inkorgen har ett tak (t.ex. 3) och slutar fylla på när den är full.
- Nya ärenden kommer i speltid (intervall i `balance.ts`). Vid offline fylls inkorgen upp till taket, så att
  det finns något att välja när man öppnar appen. Välkomstdialogen nämner antalet olästa ärenden.
- Fyra startärenden i denna uppgift (fler kommer i 022), t.ex. "Kunden vill ha CSV med semikolon" och
  "Leverantören har bytt fältnamn utan att säga till".

## Kärna och sparformat
- Ren logik i `src/core/tickets.ts` (eller liknande): ta emot nya ärenden (rng injiceras), svara på ett
  ärende (`answerTicket(state, ticketId, choiceIndex)`) och offline-påfyllnad. Muterar aldrig indata.
- Nya fält i state (inkorg, nästa ärendetid, antal besvarade). Höj `SAVE_VERSION` och lägg till en
  migrering i `MIGRATIONS` med tester.

## UI
- Inkorgsknapp med räknare (diskret, ingen röd brådska) och en dialog med ärendet och stora valknappar.
  Svaret visas som toast med `outcome`. Mobilen först och porträttläge.

## Sim
- Botten svarar på ärenden (slumpat val med seed). Rapportera i `sim-report.json`: antal ärenden per 3 h,
  utfall per val, och **längsta tid utan något att göra** (inget köpbart och inget obesvarat ärende).
- Lägg till en grindkontroll för det nya måttet med en gräns som sim visar är rimlig (förslag ≤ 5 min över
  hela 3 h). Det skärper grindarna och får inte försvaga någon befintlig kontroll. Motivera gränsen i
  `decisions/`.
- Sim före och efter i journalen (balansändring).

## Tester
- Enhetstester för ärendelogiken: ta emot, tak, svara (varje effekttyp), offline-påfyllnad, determinism med
  samma seed och att indata inte muteras.
- Content-validering: varje ärende har 2–3 val, `from` pekar på ett befintligt system eller en befintlig
  kund, och all text är icke-tom.
- Migreringstest från föregående `SAVE_VERSION`.
- e2e: ett ärende kan öppnas och besvaras, och resultatet finns kvar efter omladdning.
