import type { EventDef } from '../types';

export default {
  id: 'passwords',
  title: 'Alla elevlösenord har gått ut!',
  claimText: 'Du skrev ett skript som återställde 1 337 lösenord.',
  weight: 1,
  effect: { kind: 'prodMult', mult: 3, durationMs: 30_000 },
} satisfies EventDef;
