import type { AchievementDef } from '../types';

export default {
  id: 'provisionerad',
  order: 80,
  name: 'Provisionerad',
  desc: 'Köp din första SCIM-provisionering.',
  condition: { kind: 'automation', id: 'scim', n: 1 },
} satisfies AchievementDef;
