import type { CustomerDef } from '../types';

export default {
  id: 'hela-mellansverige-nastan',
  name: 'Region Västra Nästangötaland',
  kind: 'kommun',
  atRunKp: 3_000_000_000,
  effect: { kind: 'prodPct', pct: 50 },
} satisfies CustomerDef;
