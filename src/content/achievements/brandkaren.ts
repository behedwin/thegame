import type { AchievementDef } from '../types';

export default {
  id: 'brandkaren',
  order: 50,
  name: 'Brandkåren',
  desc: 'Lös 25 slumpevent.',
  condition: { kind: 'eventsClaimed', n: 25 },
} satisfies AchievementDef;
