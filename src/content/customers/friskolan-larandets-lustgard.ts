import type { CustomerDef } from '../types';

export default {
  id: 'friskolan-larandets-lustgard',
  name: 'Friskolan Lärandets Lustgård',
  kind: 'friskola',
  atRunKp: 50,
  effect: { kind: 'clickPct', pct: 10 },
} satisfies CustomerDef;
