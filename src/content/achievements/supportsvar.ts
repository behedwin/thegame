import type { AchievementDef } from '../types';

export default {
  id: 'supportsvar',
  order: 210,
  name: 'Har du provat att starta om?',
  desc: 'Svara på 10 ärenden i inkorgen.',
  condition: { kind: 'ticketsAnswered', n: 10 },
} satisfies AchievementDef;
