import type { EventDef } from '../types';

export default {
  id: 'pre-study-quote',
  title: 'Konsultoffert: förstudie inför förstudien',
  claimText: 'Du tackar nej och gör jobbet själv medan offerten skrivs. Klick ×4 i 20 s!',
  weight: 1,
  effect: { kind: 'clickMult', mult: 4, durationMs: 20_000 },
} satisfies EventDef;
