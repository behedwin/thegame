import type { CustomerDef } from '../types';

export default {
  id: 'byskolan-i-odmarden',
  name: 'Byskolan som föräldrarna räddade',
  kind: 'friskola',
  atRunKp: 10_000,
  effect: { kind: 'clickPct', pct: 10 },
} satisfies CustomerDef;
