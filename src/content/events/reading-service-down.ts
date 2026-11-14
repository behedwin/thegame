import type { EventDef } from '../types';

export default {
  id: 'reading-service-down',
  title: 'Utläsningstjänsten är nere!',
  claimText: 'Du startade om den genom att dra ur sladden och sätta i den igen. Alla är imponerade. Du får en klump KP!',
  weight: 1,
  effect: { kind: 'lump', seconds: 60, minKp: 20 },
} satisfies EventDef;
