import type { TicketDef } from '../types';

export default {
  id: 'trade-fair-demo',
  from: 'mellanby-kommun',
  title: 'Mässan',
  text: 'Vi har varit på mässa. Med oss hem: en goodiebag med en stressboll och minnet av en demo som aldrig startade.',
  choices: [
    {
      label: 'Använd stressbollen',
      outcome: 'Den fungerar bättre än demon. Du klickar lugnt och metodiskt. KP/klick ×2 i 30 s.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
    },
    {
      label: 'Be om en ny demo',
      outcome: 'Den startar! Den visar en exportknapp. Kunden är nöjd ändå. Produktion ×1,5 i 30 s.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Ät upp godiset i påsen',
      outcome: 'Socker, energi och en klump KP. Mässan var värd det.',
      effect: { kind: 'lump', seconds: 12, minKp: 10 },
    },
  ],
} satisfies TicketDef;
