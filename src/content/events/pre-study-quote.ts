import type { EventDef } from '../types';

export default {
  id: 'pre-study-quote',
  title: 'Förstudie inför förstudien',
  claimText: 'Du tackar nej och gör jobbet själv medan offerten skrivs.',
  weight: 0.5,
  effect: { kind: 'clickMult', mult: 4, durationMs: 20_000 },
} satisfies EventDef;
