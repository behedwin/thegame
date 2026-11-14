import type { AchievementDef } from '../types';

export default {
  id: 'nytt-lasar',
  order: 180,
  name: 'Nya läsår, nya rutiner',
  desc: 'Starta ditt första nya läsår.',
  condition: { kind: 'prestiges', n: 1 },
} satisfies AchievementDef;
