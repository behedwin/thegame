---
id: 062
size: S
status: done
touches: [src/ui/network.ts, src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: []
priority: normal
changelog: "Systemen syns även i den krympta kartan, så att man ser vart datan flödar."
---

# Systemen försvinner i den krympta kartan (rättelse efter 057 och 059)

Ägarens idé (en bugg, med en skärmdump): när man skrollar och animationen blir mindre försvinner
systemrutorna som flödet strömmar från och till.

*Varför (VISION: "en huvudskärm med nätverkskartan (källsystem → ditt nav → målsystem) som växer när
imperiet växer", "snygg, lugn och tydlig grafik"):* kartans hela poäng är att data flyttas *mellan*
system. Utan noder strömmar paketen ut ur ingenting, och det ser trasigt ut.

## Orsak (undersökt i idéintaget)
- 059 dolde noderna i kompakt läge (`.hero.compact .net-node { visibility: hidden; }` i `style.css`), så
  att de inte skulle synas som tomma rutor när texten döljs.
- Kartan ritas som en SVG med fast `viewBox` (`network.ts`). I den 96 px höga remsan skalas hela kartan ner
  till en liten yta i mitten, och bredden till höger om SYNKA används inte.

## Vad som ska göras
- **Noderna syns i kompakt läge**, men i en kompakt form som inte ser tom ut. Till exempel små fyllda
  "chips" med systemets initialer eller förkortning (2–3 tecken, t.ex. "SM" eller "SS"), eller fyllda
  pastillformer i systemets färg. Inga tomma ramar. Källsystem till vänster och målsystem till höger, som
  i stort läge.
- **Kartan använder remsans bredd:** i kompakt läge fyller kartan ytan till höger om SYNKA, med källor
  längst till vänster, navet i mitten och mål längst till höger. Det kan till exempel göras med en egen
  `viewBox` eller layout för kompakt läge, eller `preserveAspectRatio="none"` för linjerna kombinerat med
  noder som inte förvrängs. Datapaketen ska synligt gå från en nod via navet till en nod.
- **Läsbarhet:** text i noderna är minst 10 px på 390 px bredd och klipps inte. Får inte alla noder plats
  visas de som syns mest (de med flest ägda integrationer), plus en diskret "+3".
- Om en initial eller förkortning behövs per system: härled den i UI-lagret ur namnet (t.ex. första
  bokstaven i de två första orden). Ändra inga innehållsfiler och skriv inga originalnamn.
- Stort läge ser ut som i dag. Övergången mellan lägena är mjuk och respekterar `prefers-reduced-motion`.
- Batterisparet (049) och nodtipsen (028, bara i stort läge) fungerar som förut.

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.
- Krocka inte med 061 (eventkortets placering i kompakt läge): eventkortet ska fortfarande kunna ligga över
  eller under remsan.

## Tester
- Enhet (`tests/062-*.test.ts`): förkortningsfunktionen (två ord ger två initialer, ett ord ger två
  bokstäver, specialtecken hanteras) och urvalet av noder när alla inte får plats.
- e2e (`e2e/062-*.spec.ts`, viewport 390×844): seeda en sparning med flera system upplåsta och skrolla till
  kompakt läge. Minst en källnod och en målnod är synliga (`visibility` inte hidden, rektangel inom
  remsan) och har synligt innehåll (text eller fyllning). Kartans bredd är minst 70 % av remsans bredd
  till höger om SYNKA. Spara en skärmdump. Inga konsolfel.
