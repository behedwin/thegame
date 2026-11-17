import type { EventDef } from '../types';

export default {
  id: 'meeting-email',
  title: 'Möte som kunde varit ett mejl',
  claimText: 'Du har laptopen öppen under hela mötet och hinner jobba ikapp.',
  weight: 1,
  effect: { kind: 'clickMult', mult: 5, durationMs: 20_000 },
} satisfies EventDef;
