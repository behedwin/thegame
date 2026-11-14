import type { AchievementDef } from '../types';

export default {
  id: 'kundmagneten',
  order: 110,
  name: 'Kundmagneten',
  desc: 'Få 8 kunder att skriva på under ett läsår.',
  condition: { kind: 'customers', n: 8 },
} satisfies AchievementDef;
