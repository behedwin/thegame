import type { AchievementDef } from '../types';

export default {
  id: 'tiotusen-losenord',
  order: 30,
  name: '10 000 lösenord',
  desc: 'Synka manuellt 10 000 gånger. Ungefär lika många lösenord har återställts i år.',
  condition: { kind: 'clicks', n: 10_000 },
} satisfies AchievementDef;
