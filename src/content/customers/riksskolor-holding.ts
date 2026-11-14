import type { CustomerDef } from '../types';

export default {
  id: 'riksskolor-holding',
  name: 'Kunskapsskålen Holding',
  kind: 'koncern',
  atRunKp: 400_000_000,
  effect: { kind: 'prodMult', mult: 1.5 },
} satisfies CustomerDef;
