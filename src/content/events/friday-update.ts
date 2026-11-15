import type { EventDef } from '../types';

export default {
  id: 'friday-update',
  title: 'Leverantören släppte en uppdatering på en fredag',
  claimText: 'Klockan 16.55. Du lagade det före hemgång, och allt går snabbare än före uppdateringen.',
  weight: 0.5,
  effect: { kind: 'prodMult', mult: 2, durationMs: 60_000 },
} satisfies EventDef;
