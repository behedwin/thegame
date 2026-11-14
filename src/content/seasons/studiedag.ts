import type { SeasonDef } from '../types';

export default {
  id: 'studiedag',
  order: 1,
  name: 'Studiedag',
  desc: 'Uppstartsdagar! Alla vill ha sina nya klasslistor nu. Manuell synk ger ×2 KP/klick.',
  start: { month: 8, day: 10 },
  end: { month: 8, day: 20 },
  effect: { kind: 'clickMult', mult: 2 },
} satisfies SeasonDef;
