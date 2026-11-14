import type { AchievementDef } from '../types';

export default {
  id: 'forsta-csv',
  order: 10,
  name: 'Första CSV:n',
  desc: 'Köp din första CSV-import.',
  condition: { kind: 'automation', id: 'csv', n: 1 },
} satisfies AchievementDef;
