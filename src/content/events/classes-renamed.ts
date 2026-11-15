import type { EventDef } from '../types';

export default {
  id: 'classes-renamed',
  title: "Någon döpte om alla klasser till 'Test'",
  claimText: "Du återställde 'Test', 'Test (1)' och 'Test – kopia' till riktiga klassnamn.",
  weight: 1,
  effect: { kind: 'lump', seconds: 45, minKp: 15 },
} satisfies EventDef;
