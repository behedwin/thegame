import type { AchievementDef } from '../types';

export default {
  id: 'datasjon',
  order: 130,
  name: 'Datasjön',
  desc: 'Tjäna 1 miljard KP totalt.',
  condition: { kind: 'totalEarned', kp: 1e9 },
} satisfies AchievementDef;
