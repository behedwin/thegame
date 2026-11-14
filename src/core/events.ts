// Random events. Randomness is injected as rng(): number in [0, 1).
import { BALANCE } from '../content/balance';
import { byId, EVENTS, type EventDef, type EventEffect } from '../content/registry';
import { baseKps, eventCooldownMs } from './rules';
import { Decimal, earn, type GameState } from './state';

export type Rng = () => number;

/** Deterministic seeded PRNG (mulberry32). Used by the sim and tests. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const getEvent = byId(EVENTS);

/**
 * Roll for a new event. Meant to be called every BALANCE.events.rollIntervalMs of game time.
 * Returns null if an event is active, on cooldown, or the roll fails.
 */
export function rollEvent(state: GameState, rng: Rng): EventDef | null {
  if (state.activeEvent || state.timeMs < state.nextEventAtMs) return null;
  if (rng() >= BALANCE.events.chancePerRoll) return null;
  const total = EVENTS.reduce((s, e) => s + e.weight, 0);
  let pick = rng() * total;
  for (const e of EVENTS) {
    pick -= e.weight;
    if (pick < 0) return e;
  }
  return EVENTS[EVENTS.length - 1] ?? null;
}

export function spawnEvent(state: GameState, event: EventDef): GameState {
  return { ...state, activeEvent: { id: event.id, expiresAtMs: state.timeMs + BALANCE.events.visibleMs } };
}

export interface ClaimResult {
  state: GameState;
  event: EventDef | null;
  /** KP granted immediately (lump events). */
  granted: Decimal;
}

/** Player tapped the active event. */
export function claimEvent(state: GameState): ClaimResult {
  const active = state.activeEvent;
  const event = active ? getEvent(active.id) : undefined;
  if (!active || !event || active.expiresAtMs <= state.timeMs) {
    return { state, event: null, granted: new Decimal(0) };
  }
  const next: GameState = {
    ...state,
    activeEvent: null,
    nextEventAtMs: state.timeMs + eventCooldownMs(state),
    eventsClaimed: state.eventsClaimed + 1,
  };
  const r = applyEffect(next, event.id, event.effect);
  return { state: r.state, event, granted: r.granted };
}

/** Apply an event/ticket effect: a lump of KP now, or a buff (replacing one from the same source). */
export function applyEffect(state: GameState, source: string, e: EventEffect): { state: GameState; granted: Decimal } {
  if (e.kind === 'lump') {
    const granted = Decimal.max(baseKps(state).mul(e.seconds), e.minKp);
    return { state: earn(state, granted), granted };
  }
  const buffs = state.buffs.filter((b) => b.source !== source);
  buffs.push({ source, kind: e.kind, mult: e.mult, untilMs: state.timeMs + e.durationMs });
  return { state: { ...state, buffs }, granted: new Decimal(0) };
}
