import type { UpgradeDef } from '../types';
export default {
  id: 'board', order: 30,
  name: 'Interaktiv tavla',
  desc: 'Fungerar efter tre omstarter. Varje klick ger även 3 % av KP/s.',
  baseCost: 3000, costGrowth: 12, maxLevel: 5,
  effect: { kind: 'clickKpsShare', share: 0.03 },
} satisfies UpgradeDef;
