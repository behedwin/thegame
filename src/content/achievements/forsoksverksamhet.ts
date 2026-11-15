import type { AchievementDef } from '../types';

export default {
  id: 'forsoksverksamhet',
  order: 230,
  name: 'Försöksverksamhet',
  desc: 'Spela 2 olika inriktningar ett helt läsår. Det kallas pilot så länge ingen frågar.',
  condition: { kind: 'focusesPlayed', n: 2 },
} satisfies AchievementDef;
