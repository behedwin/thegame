import type { AchievementDef } from '../types';

export default {
  id: 'standigt-forbattra',
  order: 100,
  name: 'Ständiga förbättringar',
  desc: 'Köp 25 uppgraderingsnivåer under ett läsår.',
  condition: { kind: 'upgradesTotal', n: 25 },
} satisfies AchievementDef;
