# decisions/: beslut med motivering

Ersätter DECISIONS.md. Varje nytt beslut, eller grupp av beslut från samma körning, blir en egen fil:
`decisions/<ISO-tid>-<task-id>-<slug>.md` (UTC i grundformat, t.ex. `20261114T153000Z-008-app-plugin.md`).
En fil per körning gör att parallella workers aldrig får konflikter.

Varje beslut har rubrik, beslut, motivering och (vid behov) alternativ som valdes bort.

**Nya dependencies** måste alltid ha ett beslut här: paket, version, varför, och vilka alternativ som fanns.

Läs filerna i namnordning (= tidsordning). Ett senare beslut kan ersätta ett tidigare: skriv då "Ersätter
<fil>, D-nr".
