import type { TicketDef } from '../types';

export default {
  id: 'forgot-password',
  from: 'friskolan-larandets-lustgard',
  title: 'Rektorn har glömt sitt lösenord igen',
  text: 'Det är tredje gången den här veckan. Lösenordet var "Sommar2024!" och nu funkar det inte längre.',
  choices: [
    {
      label: 'Återställ det, igen',
      outcome: 'Nytt lösenord: "Vinter2025!". Rektorn är glad. Du får en klump KP.',
      effect: { kind: 'lump', seconds: 12, minKp: 10 },
    },
    {
      label: 'Inför lösenordsfri inloggning',
      outcome: 'Ingen behöver minnas något längre. Supporten blir tyst. Produktion ×2 i 15 s.',
      effect: { kind: 'prodMult', mult: 2, durationMs: 15_000 },
    },
  ],
} satisfies TicketDef;
