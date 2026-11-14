import type { CustomerDef } from '../types';

export default {
  id: 'glesbyggda-kommun',
  name: 'Glesbyggda kommun',
  kind: 'kommun',
  atRunKp: 80_000,
  effect: { kind: 'prodPct', pct: 3 },
} satisfies CustomerDef;
