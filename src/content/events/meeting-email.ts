import type { EventDef } from '../types';

export default {
  id: 'meeting-email',
  title: 'Rektorn har bokat ett möte som kunde varit ett mejl',
  claimText: 'Du har laptopen öppen under hela mötet och hinner jobba ikapp. Klick ×5 i 20 s!',
  weight: 1,
  effect: { kind: 'clickMult', mult: 5, durationMs: 20_000 },
} satisfies EventDef;
