import type { UpgradeDef } from '../types';
export default {
  id: 'logs', order: 50,
  name: 'Felloggar som någon läser',
  desc: 'Revolutionerande. Alla automationer ×1,5.',
  baseCost: 25_000, costGrowth: 20, maxLevel: 4,
  effect: { kind: 'autoMult', targets: 'all', mult: 1.5 },
} satisfies UpgradeDef;
