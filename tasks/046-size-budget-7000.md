---
id: 046
size: S
status: ready
touches: [scripts/size-check.mjs, CLAUDE.md]
depends: []
priority: normal
---

# Höj storleksbudgeten för src/ till 7 000 rader

Ägarens idé och beslut (2026-11-15): höj storleksgrinden från 5 000 till 7 000 rader.

**Ägaren har godkänt detta.** Att höja gränsen gör en kvalitetsgrind svagare och är därför ett HÅRT STOPP
i CLAUDE.md. Ägaren har själv bett om ändringen genom idéintaget ("lägg in idé i idéflöde att höja budget
till 7000"). Det här är alltså inget HÅRT STOPP för den worker som gör uppgiften. Ändra **bara** gränsen
för storleksgrinden. Alla andra grindar och krav ska vara exakt som förut.

*Varför (VISION, nytt innehåll löpande):* `src/` har legat på 4 950–4 999 av 5 000 rader i flera uppgifter
(4 997 när idén lades in). Budgeten räknar även innehållsfilerna i `src/content/` (ett ärende eller event
är 10–25 rader), så nytt innehåll äter samma budget som logiken. Workers har fått lägga hela uppgifter på
att trycka ihop kod (t.ex. 036) i stället för att bygga spelet, och varje feature riskerar att bli hafsig
för att den ska få plats. Med 7 000 rader finns marginal igen, medan taket fortfarande hindrar att koden
sväller. Refaktoreringsuppgifterna var femte id finns kvar.

## Vad som ska göras
- `scripts/size-check.mjs`: `LIMIT = 7000`. Lägg en kommentar som hänvisar till beslutsfilen.
- `CLAUDE.md`, under Kvalitetsgrindar: "`src/` ≤ 5 000 rader" → "`src/` ≤ 7 000 rader". Rör inget annat i
  CLAUDE.md.
- `decisions/<tid>-046-size-budget.md`: beslutet (ägarens, 2026-11-15), motiveringen ovan och vilka
  alternativ som valdes bort. Ett alternativ var att undanta `src/content/` och behålla 5 000 för
  logiken. Det valdes bort eftersom ägaren valde en höjning. Ändra inga gamla beslut som nämner 5 000.
- Ingen kod i `src/` ändras.

## Tester
- `npm run size-check` visar `/ 7000` och passerar.
- `npm run gates` är gröna i övrigt (oförändrade).
