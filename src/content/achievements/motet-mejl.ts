import type { AchievementDef } from '../types';

export default {
  id: 'motet-mejl',
  order: 20,
  name: 'Mötet som kunde varit ett mejl',
  desc: 'Lös ditt första slumpevent.',
  condition: { kind: 'eventsClaimed', n: 1 },
} satisfies AchievementDef;
