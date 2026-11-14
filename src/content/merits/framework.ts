import type { MeritDef } from '../types';

export default {
  id: 'framework',
  order: 50,
  name: 'Ramavtal',
  desc: 'Upphandlingen är redan klar. Integrationer kostar 5 % mindre per nivå.',
  baseCost: 2,
  costGrowth: 1.8,
  maxLevel: 10,
  effect: { kind: 'autoDiscountPct', pct: 5 },
} satisfies MeritDef;
