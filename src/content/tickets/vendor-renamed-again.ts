import type { TicketDef } from '../types';

export default {
  id: 'vendor-renamed-again',
  from: 'utbildningsmoln',
  title: 'Leverantören har bytt namn igen',
  text: 'Nytt namn, ny logga och nya fältnamn. "elev" heter nu "lärande_individ_entitet". Supporten svarar med det gamla namnet.',
  choices: [
    {
      label: 'Byt namn i alla mappningar',
      outcome: 'Sök och ersätt, 4 000 träffar. Synken lyser grönt igen.',
      effect: { kind: 'lump', seconds: 18, minKp: 15 },
    },
    {
      label: 'Lägg in ett alias som klarar nästa namnbyte',
      outcome: 'Nästa gång de byter namn märker ingen något.',
      effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
    },
  ],
} satisfies TicketDef;
