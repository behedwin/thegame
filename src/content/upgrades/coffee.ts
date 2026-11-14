import type { UpgradeDef } from '../types';

export default {
  id: 'coffee',
  order: 10,
  name: 'Extra kaffebryggare',
  desc: 'Kortare kö till kaffet. +1 KP per klick.',
  baseCost: 10,
  costGrowth: 4,
  maxLevel: 10,
  effect: { kind: 'clickAdd', amount: 1 },
} satisfies UpgradeDef;
