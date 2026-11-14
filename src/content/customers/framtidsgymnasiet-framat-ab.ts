import type { CustomerDef } from '../types';

export default {
  id: 'framtidsgymnasiet-framat-ab',
  name: 'Framtidsgymnasiet Framåt AB',
  kind: 'friskola',
  atRunKp: 400_000,
  effect: { kind: 'clickPct', pct: 25 },
} satisfies CustomerDef;
