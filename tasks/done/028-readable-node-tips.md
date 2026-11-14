---
id: 028
size: S
status: done
touches: [src/ui/network.ts, src/ui/style.css, src/ui/app.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Läsbar text när man trycker på ett system i nätverkskartan

Ägarens idé: texten som visas när man trycker på ett företag eller en leverantör i synkbilden (t.ex.
`Edsovo: "Eleven finns. Troligen."`) är svår att läsa. Den kan hamna ovanpå noderna, och den försvinner
innan man hinner läsa den.

*Orsak i koden:* `showTip` i `src/ui/network.ts` skriver texten som ett `<text>`-element överst i SVG:n
(`y: 14`, 10 px kursiv, `--muted`). Där ligger den ovanpå den översta nodraden, så den skymmer namnen och
skyms själv. Den tonas bort efter fasta `TIP_MS = 4000` oavsett textens längd.

*Varför (VISION):* "snygg, lugn och tydlig grafik", och humorn i systemens taglines ska faktiskt gå att läsa.
Det gäller särskilt på mobil, där texten blir mycket liten.

## Vad som ska göras
- **Placering:** texten får aldrig överlappa noder, linjer eller navet. Flytta den ut ur nodytan, till
  exempel som en HTML-rad direkt under kartan (mellan KÄLLSYSTEM/MÅLSYSTEM och kundraden) eller som en
  pratbubbla som placeras på den sida av noden där det finns plats, inom kartans kanter. Välj den
  enklaste lösningen som garanterat inte överlappar, och skriv beslutet i `decisions/`.
- **Läsbarhet:** minst samma storlek som övrig brödtext (≈ 13–14 px på mobil), god kontrast mot bakgrunden
  (inte `--muted` på mörkt) och en diskret bakgrund eller kant så att texten skiljer sig från kartan.
  Systemnamnet kan gärna vara i fetstil och taglinen i kursiv.
- **Visningstid:** skala med textens längd, t.ex. `max(6 s, 2,5 s + 60 ms/tecken)`, med tak runt 12 s. Lägg
  beräkningen i en ren, exporterad funktion (`tipDurationMs(text)`). Ett nytt tryck på samma nod stänger
  texten, ett tryck på en annan nod byter text och startar om tiden, och ett tryck utanför kartan stänger.
  Texten ska inte heller försvinna medan fingret/pekaren vilar på den.
- **Tillgänglighet:** behållaren får `aria-live="polite"` så att skärmläsare läser upp den. Under
  reduced motion visas den utan intoning.
- **Layoutstabilitet:** att texten visas eller döljs får inte flytta flikarna eller köplistan (reservera
  höjden, eller lägg den som overlay utanför nodytan).
- Eventuella nya UI-texter (t.ex. en `aria-label`) läggs i `texts.ts`.

## Gränser
- Ren presentation. Ingen balansändring, och sim ska vara oförändrad (ange före och efter i journalen).
- Krockar med 027 (samma filer), så de körs inte parallellt. Det är avsiktligt.
- Håll tillägget runt ≤ 60 rader i `src/`.

## Tester
- Enhet (`tests/028-*.test.ts`): `tipDurationMs` ger minst 6 s, växer med längden, har ett tak och hanterar
  en tom sträng.
- e2e (`e2e/028-*.spec.ts`): tryck på en nod och kontrollera att texten syns, att dess `boundingBox` inte
  skär någon `.net-node` eller navet, och att den fortfarande syns efter 5 s. Ett andra tryck på samma nod
  döljer den. Flikarnas position är densamma före och efter att texten visas. Inga konsolfel. Spara en
  skärmdump i mobilstorlek till `e2e-output/`.
