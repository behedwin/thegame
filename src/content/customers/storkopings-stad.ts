import type { CustomerDef } from '../types';

export default {
  id: 'storkopings-stad',
  name: 'Storköpings stad',
  kind: 'kommun',
  atRunKp: 2_000_000,
  effect: { kind: 'prodPct', pct: 3 },
} satisfies CustomerDef;
