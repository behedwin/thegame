import type { AchievementDef } from '../types';

export default {
  id: 'tio-lasar',
  order: 200,
  name: 'Tio läsår senare',
  desc: 'Starta 10 nya läsår. Fortfarande samma schemaexport.',
  condition: { kind: 'prestiges', n: 10 },
} satisfies AchievementDef;
