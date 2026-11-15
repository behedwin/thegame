import type { AchievementDef } from '../types';

// n = every focus except "Vanligt läsår" in src/content/focuses/ (checked in tests/068).
export default {
  id: 'provat-allt',
  order: 240,
  name: 'Har provat allt',
  desc: 'Spela varje inriktning ett helt läsår. Nu vet du varför det blev som det blev.',
  condition: { kind: 'focusesPlayed', n: 4 },
} satisfies AchievementDef;
