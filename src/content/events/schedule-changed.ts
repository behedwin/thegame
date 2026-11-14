import type { EventDef } from '../types';

export default {
  id: 'schedule-changed',
  title: 'Schemat ändrades igen',
  claimText: 'Tredje gången den här veckan. Du synkar om allt med rutinerad hand. Klick ×3 i 30 s!',
  weight: 1,
  effect: { kind: 'clickMult', mult: 3, durationMs: 30_000 },
} satisfies EventDef;
