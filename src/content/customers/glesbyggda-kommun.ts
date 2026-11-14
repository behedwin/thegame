import type { CustomerDef } from '../types';

export default {
  id: 'glesbyggda-kommun',
  name: 'Flyttruna kommun',
  kind: 'kommun',
  atRunKp: 80_000,
  effect: { kind: 'prodPct', pct: 2 },
} satisfies CustomerDef;
