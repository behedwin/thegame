import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { T } from '../src/content/texts';
import {
  applyMorningChoice,
  applyOffline,
  createInitialState,
  Decimal,
  kpPerClick,
  MORNING_CHOICES,
  mulberry32,
  tick,
  type GameState,
} from '../src/core';

function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o);
    for (const v of Object.values(o)) if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  }
  return o;
}

/** A game with one automation, away for two hours, offline earnings already credited. */
function cameBack(inbox: string[] = []) {
  const s: GameState = { ...createInitialState(0), automations: { csv: 5 }, lastSeenMs: 0, inbox };
  return applyOffline(s, 2 * 3_600_000);
}

describe('034 morning choice', () => {
  it('every choice gives at least the base offline earnings', () => {
    const r = cameBack();
    expect(r.earned.gt(0)).toBe(true);
    for (const c of MORNING_CHOICES) {
      const s = applyMorningChoice(r.state, c, r.earned, mulberry32(1));
      expect(s.kp.gte(r.state.kp), c).toBe(true);
      expect(s.runEarned.gte(r.state.runEarned), c).toBe(true);
    }
  });

  it('coffee multiplies the offline earnings', () => {
    const r = cameBack();
    const before = r.state.kp.sub(r.earned);
    const s = applyMorningChoice(r.state, 'coffee', r.earned, mulberry32(1));
    const expected = before.add(r.earned.mul(BALANCE.morning.coffeeMult));
    expect(s.kp.sub(expected).abs().lt(1e-6)).toBe(true);
  });

  it('inbox adds one ticket, but never beyond the cap', () => {
    const one = applyMorningChoice(cameBack().state, 'inbox', new Decimal(0), mulberry32(2));
    expect(one.inbox).toHaveLength(1);
    const full = cameBack(['a', 'b', 'c'].slice(0, BALANCE.tickets.cap));
    const same = applyMorningChoice(full.state, 'inbox', full.earned, mulberry32(2));
    expect(same.inbox).toHaveLength(BALANCE.tickets.cap);
    expect(same.kp.eq(full.state.kp)).toBe(true);
  });

  it('standup doubles clicks and wears off after two minutes', () => {
    const r = cameBack();
    const base = kpPerClick(r.state);
    const s = applyMorningChoice(r.state, 'standup', r.earned, mulberry32(1));
    expect(kpPerClick(s).div(base).toNumber()).toBeCloseTo(BALANCE.morning.standupMult);
    expect(BALANCE.morning.standupMs).toBe(120_000);
    const almost = tick(s, BALANCE.morning.standupMs - 1_000);
    expect(kpPerClick(almost).gt(kpPerClick(r.state))).toBe(true);
    const later = tick(almost, 2_000);
    expect(later.buffs.some((b) => b.source === 'morning')).toBe(false);
  });

  it('does not mutate its input', () => {
    const r = cameBack();
    const frozen = deepFreeze(r.state);
    for (const c of MORNING_CHOICES) expect(() => applyMorningChoice(frozen, c, r.earned, mulberry32(1))).not.toThrow();
  });

  it('has a Swedish label for every choice', () => {
    for (const c of MORNING_CHOICES) expect(T.morning[c].length).toBeGreaterThan(3);
  });
});
