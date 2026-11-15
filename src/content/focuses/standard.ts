import { BALANCE } from '../balance';
import type { FocusDef } from '../types';

const F = BALANCE.focus.standard;

export default {
  id: 'standard',
  order: 5,
  name: 'Standardiseringsår',
  desc: 'Alla ska göra likadant. Det tar tid att komma överens, men när det väl sitter så sitter det.',
  unlockYear: 6,
  effects: [
    { kind: 'milestoneMult', mult: F.milestone },
    { kind: 'costMult', targets: 'automations', mult: F.autoCost },
  ],
} satisfies FocusDef;
