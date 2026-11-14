import type { TicketDef } from '../types';

export default {
  id: 'renamed-fields',
  from: 'skolmjuk',
  title: 'Leverantören har bytt fältnamn utan att säga till',
  text: "I natt blev 'personnummer' till 'persNr_v2_FINAL'. Ingen release note. Synken är röd.",
  choices: [
    {
      label: 'Mappa om allt i natt',
      outcome: 'Kaffe, en lång natt och en grön synk. Du får en klump KP.',
      effect: { kind: 'lump', seconds: 20, minKp: 15 },
    },
    {
      label: 'Bygg ett mappningslager som klarar nästa gång också',
      outcome: 'Nästa gång de byter namn märker ingen något. Produktion ×1,25 i 60 s.',
      effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
    },
    {
      label: 'Boka ett möte med leverantören',
      outcome: 'De lovar en release note "framöver". Du synkar för hand under tiden. KP/klick ×1,5 i 60 s.',
      effect: { kind: 'clickMult', mult: 1.5, durationMs: 60_000 },
    },
  ],
} satisfies TicketDef;
