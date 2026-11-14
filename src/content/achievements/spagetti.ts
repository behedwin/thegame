import type { AchievementDef } from '../types';

export default {
  id: 'spagetti',
  order: 90,
  name: 'Spagettiarkitektur',
  desc: 'Äg 300 integrationer samtidigt.',
  condition: { kind: 'automationsTotal', n: 300 },
} satisfies AchievementDef;
