import type { MeritDef } from '../types';

export default {
  id: 'shortcuts',
  order: 20,
  name: 'Kortkommandon',
  desc: 'Kopiera, klistra in, befordran. +100 % KP per klick per nivå.',
  baseCost: 1,
  costGrowth: 1.5,
  maxLevel: 100,
  effect: { kind: 'clickPct', pct: 100 },
} satisfies MeritDef;
