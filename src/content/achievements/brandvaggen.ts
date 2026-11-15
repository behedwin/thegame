import type { AchievementDef } from '../types';

export default {
  id: 'brandvaggen',
  order: 270,
  name: 'Den mänskliga brandväggen',
  desc: 'Lös 20 slumpevent i rad. Inget incidentärende har överlevt mötet med dig.',
  condition: { kind: 'eventStreak', n: 20 },
} satisfies AchievementDef;
