// Random clickable events. They appear, wait a while and disappear if ignored.
export type EventEffect =
  | { kind: 'prodMult'; mult: number; durationMs: number }
  | { kind: 'clickMult'; mult: number; durationMs: number }
  | { kind: 'lump'; seconds: number; minKp: number };

export interface EventDef {
  id: string;
  title: string;
  /** Shown after the player taps the event. */
  claimText: string;
  weight: number;
  effect: EventEffect;
}

export const EVENTS: readonly EventDef[] = [
  {
    id: 'passwords',
    title: 'Alla elevlösenord har gått ut!',
    claimText: 'Du skrev ett skript som återställde 1 337 lösenord. Produktion ×3 i 30 s!',
    weight: 1,
    effect: { kind: 'prodMult', mult: 3, durationMs: 30_000 },
  },
];
