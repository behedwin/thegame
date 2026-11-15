---
id: 061
size: S
status: done
touches: [src/ui/app.ts, src/ui/event-card.ts, src/ui/style.css, src/content/texts.ts]
depends: [059]
priority: normal
changelog: "Eventkortet hamnar rätt även när kartan är krympt."
---

# Eventkortet hamnar vid sidan av i den krympta kartan (rättelse efter 057)

Ägarens idé (en bugg, med en skärmdump): popupen för event hamnar vid sidan nu, och det känns som en bugg.

*Varför (VISION, "överraskning: klickbara slumpevent", "snygg, lugn och tydlig grafik"):* event är en av
de roligaste stunderna i spelet och har en tidsgräns. I kompakt läge (057), där man är när man köper,
ska eventet vara tydligt och se avsiktligt ut. Det ska inte ligga snett över kartan.

## Orsak (undersökt i idéintaget)
- `style.css`: `.hero.compact .event-slot { left: 84px; justify-content: flex-end; }` trycker kortet mot
  högerkanten, ovanpå den krympta kartan och delvis utanför remsan.
- `app.ts` sätter `title="Tryck för att visa hela kartan"` på `.hero` i kompakt läge. På datorn visas då
  webbläsarens tooltip, och den hamnar ovanpå eventkortet.

## Vad som ska göras
- **Placering i kompakt läge:** eventkortet centreras och fyller remsans bredd till höger om SYNKA, eller
  läggs som en banderoll direkt under remsan (ovanför kundraden och flikarna). Välj det som ser lugnast ut
  i 390 px bredd, och skriv ett beslut i `decisions/`. Kortet får aldrig gå utanför skärmens kanter och
  aldrig täcka SYNKA eller flikarna. Texten får radbrytas men inte klippas mitt i ett ord.
- **Stort läge** ser ut som i dag (centrerat överst i kartan).
- **Byte av läge medan ett event visas:** kortet följer med utan att blinka eller börja om sin
  intro-animation, och tidsindikatorn (`event-timer`) fortsätter.
- **Ingen `title`-tooltip på hjälteytan.** Behåll en tillgänglig etikett (`aria-label` på en knapp eller
  ett osynligt element) för "Tryck för att visa hela kartan", men utan webbläsarens tooltip.
- `prefers-reduced-motion` fungerar som förut.

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.
- Bygg på 059:s ändringar av det kompakta läget. Gör ingen parallell variant.

## Tester
- e2e (`e2e/061-*.spec.ts`, viewport 390×844 och 1280×800):
  - Seeda en sparning med ett aktivt event och skrolla till kompakt läge. Eventkortets rektangel ligger helt
    inom viewporten, överlappar inte SYNKA-knappen eller flikarna och är horisontellt centrerad inom sin
    yta (±8 px).
  - Ett tryck på kortet löser eventet.
  - Byt till stort läge medan eventet visas: kortet finns kvar och är centrerat.
  - `.hero` har inget `title`-attribut i något läge.
  - Spara skärmdumpar av båda lägena med event. Inga konsolfel.
