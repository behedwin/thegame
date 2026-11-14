import type { SeasonDef } from '../types';

export default {
  id: 'hostlov',
  order: 2,
  name: 'Höstlov',
  desc: 'Skolorna står tomma och ingen ändrar något. Integrationerna går ostört: ×1,25 produktion.',
  start: { month: 10, day: 26 },
  end: { month: 11, day: 3 },
  effect: { kind: 'prodMult', mult: 1.25 },
} satisfies SeasonDef;
