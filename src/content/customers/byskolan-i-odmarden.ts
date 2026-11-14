import type { CustomerDef } from '../types';

export default {
  id: 'byskolan-i-odmarden',
  name: 'Byskolan i Ödmården',
  kind: 'friskola',
  atRunKp: 10_000,
  effect: { kind: 'clickPct', pct: 10 },
} satisfies CustomerDef;
