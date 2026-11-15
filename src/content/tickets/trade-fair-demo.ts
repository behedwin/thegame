import type { TicketDef } from '../types';

export default {
  id: 'trade-fair-demo',
  from: 'mellanby-kommun',
  title: 'Mässan',
  text: 'Vi har varit på mässa. Med oss hem: en goodiebag med en stressboll och minnet av en demo som aldrig startade.',
  choices: [
    { label: 'Använd stressbollen', effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
      outcome: 'Den fungerar bättre än demon. Du klickar lugnt och metodiskt.' },
    { label: 'Be om en ny demo', effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
      outcome: 'Den startar! Den visar en exportknapp. Kunden är nöjd ändå.' },
    { label: 'Ät upp godiset i påsen', effect: { kind: 'lump', seconds: 12, minKp: 10 },
      outcome: 'Socker, energi och en klump KP. Mässan var värd det.' },
  ],
} satisfies TicketDef;
