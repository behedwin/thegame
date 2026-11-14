import type { AutomationDef } from '../types';

export default {
  id: 'flow',
  order: 30,
  name: 'Flödessynk',
  desc: 'Data flödar som en bäck. Ibland uppför.',
  baseCost: 2000,
  kps: 25,
  from: 'vanlikum',
  to: 'mikromjuk',
} satisfies AutomationDef;
