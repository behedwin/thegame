import type { AchievementDef } from '../types';

export default {
  id: 'flodet',
  order: 170,
  name: 'Flödet',
  desc: 'Nå 10 miljoner KP/s utan buffar.',
  condition: { kind: 'kps', kp: 1e7 },
} satisfies AchievementDef;
