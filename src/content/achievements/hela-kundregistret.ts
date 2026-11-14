import type { AchievementDef } from '../types';

export default {
  id: 'hela-kundregistret',
  order: 120,
  name: 'Hela kundregistret',
  desc: 'Få alla 10 kunder att skriva på under ett läsår.',
  condition: { kind: 'customers', n: 10 },
} satisfies AchievementDef;
