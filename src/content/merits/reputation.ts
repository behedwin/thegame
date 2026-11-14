import type { MeritDef } from '../types';

export default {
  id: 'reputation',
  order: 10,
  name: 'Branschrykte',
  desc: 'Folk på mässor nickar igenkännande. +50 % produktion per nivå.',
  baseCost: 1,
  costGrowth: 1.6,
  maxLevel: 100,
  effect: { kind: 'prodPct', pct: 50 },
} satisfies MeritDef;
