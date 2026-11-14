import type { MeritDef } from '../types';

export default {
  id: 'templates',
  order: 40,
  name: 'Färdiga mallar',
  desc: 'Börja varje läsår med 5 CSV-importer per nivå.',
  baseCost: 3,
  costGrowth: 2,
  maxLevel: 5,
  effect: { kind: 'startAutomation', id: 'csv', count: 5 },
} satisfies MeritDef;
