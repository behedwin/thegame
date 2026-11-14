import type { AchievementDef } from '../types';

export default {
  id: 'biljonen',
  order: 150,
  name: 'Ingen vet var all data tog vägen',
  desc: 'Tjäna 1 biljon KP totalt.',
  condition: { kind: 'totalEarned', kp: 1e12 },
} satisfies AchievementDef;
