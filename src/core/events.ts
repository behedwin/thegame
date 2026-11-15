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

/** A new event. If the previous one was never solved (it ran out), the streak starts over (069). */
export function spawnEvent(state: GameState, event: EventDef): GameState {
  return {
    ...state,
    activeEvent: { id: event.id, expiresAtMs: state.timeMs + BALANCE.events.visibleMs },
    eventStreak: state.eventOpen ? 0 : state.eventStreak,
    eventOpen: true,
  };
}

/** Extra effect share for an event solved with `streak` events already solved in a row (069). */
export function eventStreakBonus(streak: number): number {
  const { min, step, cap } = BALANCE.events.streak;
  return streak < min ? 0 : Math.min(cap, (streak - min + 1) * step);
}

/** The event's effect with the current streak bonus: a bigger lump, or a buff with a bigger extra part. */
export function eventEffect(state: GameState, event: EventDef): EventEffect {
  const b = eventStreakBonus(state.eventStreak);
  const e = event.effect;
  if (b === 0) return e;
  if (e.kind === 'lump') return { ...e, seconds: e.seconds * (1 + b), minKp: e.minKp * (1 + b) };
  return { ...e, mult: Math.round((1 + (e.mult - 1) * (1 + b)) * 1000) / 1000 };
}

/** The event as it would be given now (streak bonus included); the same object when there is no bonus. */
export function boostedEvent(state: GameState, event: EventDef): EventDef {
  const effect = eventEffect(state, event);
  return effect === event.effect ? event : { ...event, effect };
}

/** The streak to show on the event card, or 0 while it is below BALANCE.events.streak.min (069). */
export function shownEventStreak(state: GameState): number {
  return state.eventStreak >= BALANCE.events.streak.min ? state.eventStreak : 0;
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
  const given = boostedEvent(state, event);
  const next: GameState = {
    ...state,
    activeEvent: null,
    nextEventAtMs: state.timeMs + eventCooldownMs(state),
    eventsClaimed: state.eventsClaimed + 1,
    eventStreak: state.eventStreak + 1,
    eventOpen: false,
  };
  const r = applyEffect(next, event.id, given.effect);
  // The returned event carries the boosted effect, so the receipt shows what was actually given.
  return { state: r.state, event: given, granted: r.granted };
}

export type EffectPreview =
  | { kind: 'lump'; kp: Decimal }
  | { kind: 'prodMult' | 'clickMult'; mult: number; durationMs: number };

/** What an effect would give right now. applyEffect uses it, so preview and outcome never differ. */
export function previewEffect(state: GameState, e: EventEffect): EffectPreview {
  if (e.kind === 'lump') return { kind: 'lump', kp: Decimal.max(baseKps(state).mul(e.seconds), e.minKp) };
  return { kind: e.kind, mult: e.mult, durationMs: e.durationMs };
}

/** Apply an event/ticket effect: a lump of KP now, or a buff (replacing one from the same source). */
export function applyEffect(state: GameState, source: string, e: EventEffect): { state: GameState; granted: Decimal } {
  const p = previewEffect(state, e);
  if (p.kind === 'lump') return { state: earn(state, p.kp), granted: p.kp };
  const buffs = state.buffs.filter((b) => b.source !== source);
  buffs.push({ source, kind: p.kind, mult: p.mult, untilMs: state.timeMs + p.durationMs });
  return { state: { ...state, buffs }, granted: new Decimal(0) };
}
