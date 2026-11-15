import type { CustomerDef } from '../types';

export default {
  id: 'regionstadens-utbildningsforvaltning',
  name: 'Götebörs grundskoleförvaltning',
  kind: 'kommun',
  atRunKp: 60_000_000,
  effect: { kind: 'prodPct', pct: 10 },
} satisfies CustomerDef;
