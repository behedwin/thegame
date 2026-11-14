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
  milestoneNames: [
    'Bäcken rinner nu mest nedför',
    'Flödet har fått en karta',
    'Inga fler mystiska dubbletter',
    'Synken hinner före lunchrasten',
  ],
} satisfies AutomationDef;
