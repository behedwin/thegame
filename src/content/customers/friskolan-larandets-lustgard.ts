import type { CustomerDef } from '../types';

export default {
  id: 'friskolan-larandets-lustgard',
  name: 'Valldorfskolan Solgläntan',
  kind: 'friskola',
  atRunKp: 50,
  effect: { kind: 'clickPct', pct: 10 },
} satisfies CustomerDef;
