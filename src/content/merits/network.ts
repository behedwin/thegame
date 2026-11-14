import type { MeritDef } from '../types';

export default {
  id: 'network',
  order: 60,
  name: 'Nätverkskontakter',
  desc: 'Någon känner alltid någon på förvaltningen. Event kommer 10 % tätare per nivå.',
  baseCost: 2,
  costGrowth: 2,
  maxLevel: 5,
  effect: { kind: 'eventCooldownPct', pct: 10 },
} satisfies MeritDef;
