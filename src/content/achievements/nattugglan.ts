import type { AchievementDef } from '../types';

export default {
  id: 'nattugglan',
  order: 70,
  name: 'Nattugglan',
  desc: 'Äg 150 nattliga synkar. Någon måste ju vara vaken.',
  condition: { kind: 'automation', id: 'nightly', n: 150 },
} satisfies AchievementDef;
