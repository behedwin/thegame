import type { AchievementDef } from '../types';

export default {
  id: 'jourhavande',
  order: 260,
  name: 'Jourhavande integratör',
  desc: 'Lös 10 slumpevent i rad. Telefonen ligger numera under kudden.',
  condition: { kind: 'eventStreak', n: 10 },
} satisfies AchievementDef;
