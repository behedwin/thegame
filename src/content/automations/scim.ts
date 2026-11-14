import type { AutomationDef } from '../types';

export default {
  id: 'scim',
  order: 60,
  name: 'SCIM-provisionering',
  desc: 'Konton skapas automatiskt. Och tas bort automatiskt. Ibland i den ordningen.',
  baseCost: 7_000_000,
  kps: 12_000,
  from: 'passiv',
  to: 'itsforgetting',
  milestoneNames: [
    'Konton skapas före de tas bort',
    'Sommarlovsrensningen frågar först',
    'Klassbyten hanteras utan supportärende',
    'Ingen elev har två konton längre',
  ],
} satisfies AutomationDef;
