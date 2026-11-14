import type { AchievementDef } from '../types';

export default {
  id: 'datahavet',
  order: 140,
  name: 'Datahavet',
  desc: 'Tjäna 100 miljarder KP totalt.',
  condition: { kind: 'totalEarned', kp: 1e11 },
} satisfies AchievementDef;
