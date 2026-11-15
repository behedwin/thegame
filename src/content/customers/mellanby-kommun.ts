import type { CustomerDef } from '../types';

export default {
  id: 'mellanby-kommun',
  name: 'Linjeköpings kommun',
  kind: 'kommun',
  atRunKp: 1000,
  effect: { kind: 'prodPct', pct: 10 },
} satisfies CustomerDef;
