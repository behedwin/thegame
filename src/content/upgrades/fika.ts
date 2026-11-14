import type { UpgradeDef } from '../types';

export default {
  id: 'fika',
  order: 20,
  name: 'Fika i personalrummet',
  desc: 'Kanelbullen är strategisk. KP per klick ×2.',
  baseCost: 400,
  costGrowth: 25,
  maxLevel: 4,
  effect: { kind: 'clickMult', mult: 2 },
} satisfies UpgradeDef;
