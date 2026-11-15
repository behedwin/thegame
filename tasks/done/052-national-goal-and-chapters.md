---
id: 052
size: M
status: done
touches: [src/content/chapters/, src/content/registry.ts, src/content/types.ts, src/content/balance.ts, src/content/texts.ts, src/core/, src/ui/hud.ts, src/ui/prestige.ts, src/ui/celebrate.ts, src/ui/style.css, tasks/proposed/p-story-and-ending.md]
depends: []
priority: normal
---

# Målet "Hela Sverige på en standard" och ett kapitel per läsår

Ägarens idé: efter en stund blir spelet repetitivt, och man har för lite att se fram emot. Första delen
av förslaget `p-story-and-ending`.

*Varför (VISION, respekt för spelarens tid: "det ska finnas ett slutmål och en berättelse ('Hela Sverige på
en standard')"; `docs/RESEARCH.md`: "synliga mål", "berättelse och satir (Universal Paperclips)"):*
slutmålet i VISION finns inte i spelet. Efter några läsår vet spelaren inte vart spelet är på väg, och
det gör att varje läsår känns likadant.

## Vad som ska göras
- **Ett långsiktigt mål som syns:** "Anslutna kommuner: 37 av 290". Antalet räknas fram deterministiskt i
  `src/core/` ur livstidsintjäning och läsår (t.ex. logaritmiskt mot `totalEarned`, så att varje läsår ger
  en tydlig bit). Tänk på takten: målet ska vara nära efter ungefär 10–15 läsår, aldrig gå bakåt och
  aldrig passera 290. Konstanterna ligger i `balance.ts`. Visa målet diskret i HUD:en eller prestigefliken,
  med en tunn förloppsindikator. Nästa läsår visar hur mycket närmare målet man kommer ("+12 kommuner").
- **Ett kapitel per läsår:** en innehållsfil per läsår i `src/content/chapters/` (läsår 1–10), där
  filnamnet är id:t och `order` är läsåret, och registret hittar dem med `import.meta.glob`. Varje kapitel
  är en rubrik och 2–3 korta meningar i spelets torra, varma ton: en liten satirisk berättelse om hur
  standarden sprider sig och hur systemen gör motstånd ("Läsår 4: Västra kommunförbundet vill ha en
  egen variant av standarden. Den heter Standarden."). Kapitlet visas i firandet när ett nytt läsår
  börjar och kan läsas igen i prestigefliken. Parodinamn, inga riktiga varumärken och inga verkliga
  personer.
- **Förslaget uppdateras:** `tasks/proposed/p-story-and-ending.md` beskriver bara det som återstår:
  slutscenen när 290 nås och valfria utmaningar efteråt.

## Gränser
- Ingen balansändring av ekonomin, och simmen är oförändrad. Målet är bara visning och läser befintliga
  värden.
- Inget nytt sparfält om allt räknas fram. Om "senast visade kapitel" behövs sparas det med en höjning av
  `SAVE_VERSION` och en migrering.

## Tester
- Enhet (`tests/052-*.test.ts`): målet är monotont (fler läsår eller mer intjäning ger aldrig färre
  kommuner), ligger inom 0–290, är 0 vid nytt spel och ger rimliga värden för läsår 1, 5 och 10 med
  sim-liknande intjäning. Indata muteras inte.
- Content-validering: kapitel 1–10 finns, med unika `order`, ingen tom text och texter på svenska.
- e2e (`e2e/052-*.spec.ts`): seeda en sparning nära prestige, gör Nytt läsår och verifiera att kapitlet
  visas och att antalet anslutna kommuner har ökat. Spara en skärmdump i mobilstorlek. Inga konsolfel.
