# Inga L-uppgifter i kön

## Beslut
Idéintaget skapar bara uppgifter av storlek S eller M. En idé som skulle bli L delas upp. Samma sak gäller
förslag i `tasks/proposed/` som flyttas till kön. Regeln för hur PR:er av storlek L hanteras
(`needs-review`, ägaren mergar) är oförändrad, men sådana PR:er ska inte längre uppstå.

## Motivering
2026-11-14 stod kön still. Uppgift 021 (L) blev klar som PR #39 med `needs-review` och väntade på ägaren.
Dess `touches` (`src/core/`, `src/ui/`, `src/content/texts.ts`, `src/save/` m.fl.) överlappade alla
uppgifter som var `ready`. Varje worker-körning slutade därför med "no eligible task", fast CI var grön.
Ägaren upplevde att "något är låst". PR:en granskades och mergades manuellt, och då rullade kön igen.

Med uppgifter på högst M mergas varje PR automatiskt när CI är grön. Grenlåset släpper då av sig själv.

## Alternativ som valdes bort
- Auto-merge även för L: tar bort den enda mänskliga granskningen av de största ändringarna.
- Låta `next-task` strunta i lås från `needs-review`-grenar: ger parallella ändringar i samma filer och
  därmed merge-konflikter.
- Smalare `touches` för L: CLAUDE.md säger att `touches` hellre ska vara för breda än för smala, och en
  stor uppgift rör i praktiken många filer.
