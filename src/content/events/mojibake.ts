import type { EventDef } from '../types';

export default {
  id: 'mojibake',
  title: 'Å, Ä och Ö blev Ã¥Ã¤Ã¶',
  claimText: 'Du hittade teckenkodningen och räddade hela alfabetet.',
  weight: 1,
  effect: { kind: 'prodMult', mult: 2, durationMs: 60_000 },
} satisfies EventDef;
