# Påfyllningen får dela L-förslag och skriva nya förslag

## Beslut
När förslagen inte räcker till 3 uppgifter vid en påfyllning (CLAUDE.md, "Påfyllning av kön", steg 6) får
workern först dela ett L-förslag i en första S/M-del och sedan skriva upp till 3 nya förslag utifrån
VISION.md och `docs/RESEARCH.md`, och flytta in dem som uppfyller kraven. Notis till ägaren skickas bara
om inget alls gick att lägga in. Workers uppmanas också att lämna ett förslag per uppgift.

## Motivering
2026-11-15 fanns 8 förslag kvar, men bara 3–4 av dem fick flyttas in. Resten var L (upphandlingar,
berättelse och slut) eller rörde Android. Workers hade bara lagt till 2 förslag på ungefär 20 uppgifter.
Kön skulle alltså ha tagit slut inom ungefär ett halvt dygn och sedan stått still tills ägaren kom med
idéer, vilket ägaren uttryckligen inte vill ("kommer mina jobb lösa det när det är slut?").

De två L-förslagen är kärnan i VISION (lång loop, och slutmålet "Hela Sverige på en standard"). Att bygga
dem stegvis i små, automergade delar ger spelet riktning i stället för att det stannar.

## Alternativ som valdes bort
- Bara notis (som tidigare): kön stannar.
- Låta workers implementera L direkt: ger `needs-review`-PR:er som spärrar kön (se
  `20261114T180000Z-ops-no-l-tasks-in-queue.md`).
- Obegränsat idéflöde: ägaren tappar överblicken. Med högst 3 nya förslag och 3 uppgifter per påfyllning
  går takten att följa, och ägaren styr fortfarande med "Ny idé (prio)".
