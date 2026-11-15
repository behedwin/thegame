---
id: 038
size: S
status: ready
priority: normal
touches: [src/ui/style.css, src/ui/settings.ts]
depends: [032]
---

# Stil för sparningsfältet i inställningarna

Från förslaget `p-save-text-style`.

Textfältet för export och import (032) har webbläsarens standardstil: vit bakgrund och svart monospace. Det
sticker ut i den mörka dialogen.

*Varför (VISION, "tydligt"):* fältet ska se ut som resten av spelet och vara lätt att markera på en telefon.

## Vad som ska göras
- Ge `[data-testid="save-text"]` (eller en klass) mörk bakgrund, ljus text, rundade hörn som knapparna,
  radbrytning var som helst (`word-break: break-all`) och synlig fokusmarkering. Flytta gärna den inline
  `style: 'width:100%'` i `settings.ts` till CSS.
- Ingen ändring i logik eller texter.

## Tester
- e2e: skärmdump av inställningarna efter export. Fältet har samma bakgrund som dialogkorten och ingen
  horisontell scroll vid 390 px bredd.
