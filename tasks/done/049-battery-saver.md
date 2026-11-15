---
id: 049
size: S
status: done
touches: [src/ui/network.ts, src/ui/app.ts]
depends: []
priority: normal
---

# Batterispar: pausa nätverksanimationen när den inte syns

Från förslaget `p-battery-saver`. Halva förslaget finns redan: `NetworkView.frame` ritar högst 30 bilder
per sekund, och `requestAnimationFrame` pausar när appen ligger i bakgrunden. Kvar är fallet där appen är
öppen men nätverksbilden (hero-ytan) inte syns, t.ex. när spelaren har scrollat ner i butiken på en låg
telefon eller har en dialog öppen över den.

- Använd en `IntersectionObserver` på nätverksytan. När den inte syns hoppar `frame` över att flytta och
  skapa paket (inga DOM-ändringar). Spelets `tick` och sparning påverkas inte.
- När ytan syns igen fortsätter animationen där den var, utan en skur av paket som "kommer ikapp".
- Saknas `IntersectionObserver` (gamla webbvyer) beter sig allt som i dag.

*Varför (VISION, mobil och korta sessioner):* idle-spel står ofta öppna länge, och en animation som ingen
ser ska inte dra batteri.

## Gränser
- Ingen ändring i `src/core/`, ingen balansändring och inget nytt sparfält. Simmen är oförändrad.

## Tester
- Enhet (`tests/049-*.test.ts`, jsdom eller ren hjälpfunktion): `frame` lägger inte till paket när ytan är
  markerad som dold, och den samlar inte upp tid som släpps ut på en gång när ytan syns igen.
- E2e (`e2e/049-*.spec.ts`): scrolla bort nätverksytan, vänta, och kontrollera att antalet `.packet` inte
  ändras. Scrolla tillbaka och se att paket rör sig igen. Inga konsolfel.
