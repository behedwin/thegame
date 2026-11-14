import type { MeritDef } from '../types';

export default {
  id: 'nightly',
  order: 70,
  name: 'Nattkörningar',
  desc: 'Batchjobben går medan skolan sover. +10 % KP när du är borta per nivå.',
  baseCost: 2,
  costGrowth: 2,
  maxLevel: 5,
  effect: { kind: 'offlineEffPct', pct: 10 },
} satisfies MeritDef;
