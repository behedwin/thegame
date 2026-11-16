import type { AchievementDef } from '../types';

export default {
  id: 'expresskorning',
  order: 280,
  name: 'Expresskörning',
  desc: 'Bli klar med ett läsår på högst 15 minuter. Ingen hann ens boka ett uppstartsmöte.',
  condition: { kind: 'fastestYear', maxMs: 15 * 60_000 },
} satisfies AchievementDef;
