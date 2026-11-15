import type { TicketDef } from '../types';

export default {
  id: 'csv-semicolon',
  from: 'mellanby-kommun',
  title: 'Kunden vill ha CSV med semikolon',
  text: 'Hej! Vårt kalkylprogram öppnar filen som en enda lång kolumn. Kan ni byta komma mot semikolon? Gärna i går.',
  choices: [
    {
      label: 'Byt avgränsare i hela flödet',
      outcome: 'Semikolon överallt. Kalkylprogrammet är nöjt, och flödet går lite smidigare.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Skicka ett vänligt mejl med instruktioner',
      outcome: '"Data → Text till kolumner." Kunden tackar och skickar en kaka.',
      effect: { kind: 'lump', seconds: 15, minKp: 10 },
    },
    {
      label: 'Boka ett möte om avgränsare',
      outcome: 'Mötet slutar i en arbetsgrupp. Du får mycket gjort under tiden.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
    },
  ],
} satisfies TicketDef;
