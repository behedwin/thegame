// Bulk buying (×1 / ×10 / MAX). Pure: never mutates the input state.
import { BALANCE } from '../content/balance';
import { automationBaseCost, getAutomation, getUpgrade } from './rules';
import { Decimal, level, type GameState } from './state';
import { isUnlocked } from './unlocks';

export type BulkMode = 1 | 10 | 'max';
export const BULK_MODES: readonly BulkMode[] = [1, 10, 'max'];

interface Curve {
  base: number;
  growth: number;
  owned: number;
  /** Units that may still be bought (Infinity for automations). */
  remaining: number;
}

/** A locked automation (051) cannot be bought, so it has no buyable units. */
const locked = (state: GameState, id: string): boolean => {
  const auto = getAutomation(id);
  return auto !== undefined && !isUnlocked(state, auto);
};

function curve(state: GameState, id: string): Curve | null {
  const auto = getAutomation(id);
  if (auto) {
    return { base: automationBaseCost(state, auto), growth: BALANCE.automationCostGrowth, owned: level(state.automations, id), remaining: Infinity };
  }
  const up = getUpgrade(id);
  if (up) {
    const owned = level(state.upgrades, id);
    return { base: up.baseCost, growth: up.costGrowth, owned, remaining: Math.max(0, up.maxLevel - owned) };
  }
  return null;
}

function rawSum(c: Curve, n: number): Decimal {
  const first = new Decimal(c.base).mul(Decimal.pow(c.growth, c.owned));
  // n = 1 exactly, so a single buy costs the same as costOf() (the geometric formula drifts).
  if (n === 1) return first;
  if (c.growth === 1) return first.mul(n);
  return first.mul(Decimal.pow(c.growth, n).sub(1)).div(c.growth - 1);
}

/**
 * Total cost of the next n units: the geometric sum base·r^owned·(r^n − 1)/(r − 1), rounded up.
 * For n = 1 this equals costOf(); for larger n it is at most n − 1 KP cheaper than single buys.
 */
export function costOfMany(state: GameState, id: string, n: number): Decimal {
  const c = curve(state, id);
  if (!c) throw new Error(`Unknown item: ${id}`);
  if (!(n > 0)) return new Decimal(0);
  return rawSum(c, Math.floor(n)).ceil();
}

/** Largest n such that costOfMany(state, id, n) ≤ kp, capped by max level. */
export function maxAffordable(state: GameState, id: string): number {
  const c = curve(state, id);
  if (!c || c.remaining === 0 || locked(state, id)) return 0;
  const first = new Decimal(c.base).mul(Decimal.pow(c.growth, c.owned));
  if (state.kp.lt(first.ceil())) return 0;
  let n: number;
  if (c.growth === 1) n = Math.floor(state.kp.div(first).toNumber());
  else {
    const ratio = state.kp.mul(c.growth - 1).div(first).add(1);
    n = Math.floor(ratio.log10() / Math.log10(c.growth));
  }
  if (!Number.isFinite(n) || n < 0) n = 0;
  n = Math.min(n, c.remaining);
  // Correct floating-point drift around the boundary.
  while (n > 0 && costOfMany(state, id, n).gt(state.kp)) n--;
  while (n < c.remaining && costOfMany(state, id, n + 1).lte(state.kp)) n++;
  return n;
}

/** Number of units a mode means right now. ×10 is clamped to remaining levels; MAX is at least 1. */
export function resolveBulk(state: GameState, id: string, mode: BulkMode): number {
  const c = curve(state, id);
  const remaining = c ? c.remaining : 0;
  if (mode === 'max') return Math.max(1, Math.min(maxAffordable(state, id), remaining || 1));
  return Math.max(1, Math.min(mode, remaining || 1));
}

/** Buy exactly n units/levels, or nothing (same state) if not possible. */
export function buyMany(state: GameState, id: string, n: number): GameState {
  const c = curve(state, id);
  if (!c || !(n >= 1) || !Number.isInteger(n) || n > c.remaining || locked(state, id)) return state;
  const cost = costOfMany(state, id, n);
  if (state.kp.lt(cost)) return state;
  const kp = state.kp.sub(cost);
  const purchases = state.purchases + n;
  if (getAutomation(id)) {
    return { ...state, kp, purchases, automations: { ...state.automations, [id]: c.owned + n } };
  }
  return { ...state, kp, purchases, upgrades: { ...state.upgrades, [id]: c.owned + n } };
}
