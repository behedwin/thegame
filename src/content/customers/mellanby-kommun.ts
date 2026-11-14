import type { CustomerDef } from '../types';

export default {
  id: 'mellanby-kommun',
  name: 'Mellanby kommun',
  kind: 'kommun',
  atRunKp: 1000,
  effect: { kind: 'prodPct', pct: 2 },
} satisfies CustomerDef;
