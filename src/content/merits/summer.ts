import type { MeritDef } from '../types';

export default {
  id: 'summer',
  order: 30,
  name: 'Längre sommarlov',
  desc: 'Systemen jobbar medan du badar. +2 h offlinetak per nivå.',
  baseCost: 2,
  costGrowth: 2,
  maxLevel: 8,
  effect: { kind: 'offlineHours', hours: 2 },
} satisfies MeritDef;
