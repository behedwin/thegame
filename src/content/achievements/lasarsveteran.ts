import type { AchievementDef } from '../types';

export default {
  id: 'lasarsveteran',
  order: 190,
  name: 'Läsårsveteran',
  desc: 'Starta 5 nya läsår. Du har sett allt. Nästan.',
  condition: { kind: 'prestiges', n: 5 },
} satisfies AchievementDef;
