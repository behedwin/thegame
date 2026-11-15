import type { TicketDef } from '../types';

export default {
  id: 'renamed-fields',
  from: 'skolmjuk',
  title: 'Leverantören har bytt fältnamn utan att säga till',
  text: "I natt blev 'personnummer' till 'persNr_v2_FINAL'. Ingen release note. Synken är röd.",
  choices: [
    { label: 'Mappa om allt i natt', effect: { kind: 'lump', seconds: 20, minKp: 15 },
      outcome: 'Kaffe, en lång natt och en grön synk.' },
    { label: 'Bygg ett mappningslager som klarar nästa gång också', effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
      outcome: 'Nästa gång de byter namn märker ingen något.' },
    { label: 'Boka ett möte med leverantören', effect: { kind: 'clickMult', mult: 1.5, durationMs: 60_000 },
      outcome: 'De lovar en release note "framöver". Du synkar för hand under tiden.' },
  ],
} satisfies TicketDef;
