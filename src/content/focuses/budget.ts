import { BALANCE } from '../balance';
import type { FocusDef } from '../types';

const F = BALANCE.focus.budget;

export default {
  id: 'budget',
  order: 3,
  name: 'Budgetår',
  desc: 'Sparbeting från nämnden. Allt blir billigare att köpa, men ingen jobbar övertid.',
  unlockYear: 2,
  effects: [
    { kind: 'costMult', targets: 'all', mult: F.cost },
    { kind: 'prodMult', mult: F.prod },
  ],
} satisfies FocusDef;
