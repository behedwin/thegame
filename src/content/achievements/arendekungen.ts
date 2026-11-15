import type { AchievementDef } from '../types';

export default {
  id: 'arendekungen',
  order: 220,
  name: 'Ärendekungen',
  desc: 'Svara på 100 ärenden i inkorgen. Inkorgen tackar, på sitt sätt.',
  condition: { kind: 'ticketsAnswered', n: 100 },
} satisfies AchievementDef;
