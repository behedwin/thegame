import type { AchievementDef } from '../types';

export default {
  id: 'obruten-kedja',
  order: 250,
  name: 'Obruten kedja',
  desc: 'Lös 5 slumpevent i rad. Ingen hann ens skicka ett påminnelsemejl.',
  condition: { kind: 'eventStreak', n: 5 },
} satisfies AchievementDef;
