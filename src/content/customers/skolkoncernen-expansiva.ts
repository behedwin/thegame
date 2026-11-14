import type { CustomerDef } from '../types';

export default {
  id: 'skolkoncernen-expansiva',
  name: 'Skolkoncernen Expansiva',
  kind: 'koncern',
  atRunKp: 10_000_000,
  effect: { kind: 'prodMult', mult: 1.03 },
} satisfies CustomerDef;
