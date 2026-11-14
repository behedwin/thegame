import type { CustomerDef } from '../types';

export default {
  id: 'regionstadens-utbildningsforvaltning',
  name: 'Regionstadens utbildningsförvaltning',
  kind: 'kommun',
  atRunKp: 60_000_000,
  effect: { kind: 'prodPct', pct: 3 },
} satisfies CustomerDef;
