import type { EventDef } from '../types';

export default {
  id: 'promised-integration',
  title: 'Säljaren lovade en integration som inte finns',
  claimText: 'Kunden har redan skrivit på. Du bygger den på en kväll och skickar en faktura.',
  weight: 0.5,
  effect: { kind: 'lump', seconds: 45, minKp: 20 },
} satisfies EventDef;
