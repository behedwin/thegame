import type { AchievementDef } from '../types';

export default {
  id: 'nattlig-ro',
  order: 160,
  name: 'Nattlig ro',
  desc: 'Nå 100 000 KP/s utan buffar.',
  condition: { kind: 'kps', kp: 1e5 },
} satisfies AchievementDef;
