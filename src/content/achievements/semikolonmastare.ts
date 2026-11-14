import type { AchievementDef } from '../types';

export default {
  id: 'semikolonmastare',
  order: 60,
  name: 'Semikolonmästare',
  desc: 'Äg 150 CSV-importer. Komma eller semikolon? Ja.',
  condition: { kind: 'automation', id: 'csv', n: 150 },
} satisfies AchievementDef;
