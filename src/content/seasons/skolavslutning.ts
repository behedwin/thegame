import type { SeasonDef } from '../types';

export default {
  id: 'skolavslutning',
  order: 4,
  name: 'Skolavslutning',
  desc: 'Betyg ska överföras, konton stängas och sommarlovet väntar. ×1,5 produktion.',
  start: { month: 6, day: 5 },
  end: { month: 6, day: 20 },
  effect: { kind: 'prodMult', mult: 1.5 },
} satisfies SeasonDef;
