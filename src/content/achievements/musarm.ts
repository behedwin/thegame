import type { AchievementDef } from '../types';

export default {
  id: 'musarm',
  order: 40,
  name: 'Musarm',
  desc: 'Synka manuellt 25 000 gånger. Ta en paus och sträck på dig.',
  condition: { kind: 'clicks', n: 25_000 },
} satisfies AchievementDef;
