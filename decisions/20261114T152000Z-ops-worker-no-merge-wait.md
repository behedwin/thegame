# Workers väntar inte in CI eller merge

## Beslut
Steg 8 i worker-protokollet (CLAUDE.md) slutar när PR:en finns med rätt etikett och påslagen auto-merge.
Workern väntar inte på CI eller merge. Den använder inte `Monitor`, bakgrundstimers eller väntan på att
grenen raderas, och hela steg 8 tar högst 10 minuter.

## Motivering
2026-11-14 satt Worker B (uppgift 016, PR #31) kvar efter `[ready]`-pushen och bevakade i upp till 15
minuter om grenen raderades. Under tiden mergades en annan PR (#32) till main. Med strikt grenskydd måste
#31 då uppdateras och köra om hela CI (sim ≈ 1,5–2,5 min). Sessionen låg därför öppen i över 14 minuter
utan att göra något, och den krockade med nästa schemalagda körning. Ägaren upplevde det som att ett
autojobb hade fastnat.

Mergen sköts redan automatiskt: GitHubs auto-merge, `automerge.yml` (enable och unstick efter varje push
till main och var 15:e minut) och städaren för röd CI. Att workern väntar ger alltså ingen säkerhet, bara
långa körningar.

## Alternativ som valdes bort
- Kortare bevakning (t.ex. 5 min): löser inte grundproblemet, eftersom en merge till main när som helst
  startar om CI.
- Ta bort steg 8 helt: då upptäcks inte en PR som saknar etikett eller auto-merge.
