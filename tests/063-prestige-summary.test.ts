import { describe, expect, it } from 'vitest';
import { createInitialState, Decimal, pendingMerits, prestige, yearSummary, type GameState } from '../src/core';

function late(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(0),
    runEarned: new Decimal('4e9'),
    totalEarned: new Decimal('4e9'),
    automations: { csv: 5, sftp: 2 },
    bestRunEarned: new Decimal('1e9'),
    ...overrides,
  };
}

describe('063 yearSummary', () => {
  it('reports KP, customers, integrations and merits for the year before prestige', () => {
    const s = late();
    const sum = yearSummary(s);
    expect(sum.kpEarned.eq(s.runEarned)).toBe(true);
    expect(sum.kpEarned).toBeInstanceOf(Decimal);
    expect(sum.customers).toBeGreaterThan(0);
    expect(sum.integrations).toBe(7);
    expect(sum.merits.eq(pendingMerits(s))).toBe(true);
    expect(sum.merits).toBeInstanceOf(Decimal);
  });

  it('flags the best year only when this year beats the previous best', () => {
    expect(yearSummary(late()).bestYear).toBe(true);
    expect(yearSummary(late({ bestRunEarned: new Decimal('4e9') })).bestYear).toBe(false);
    expect(yearSummary(late({ bestRunEarned: new Decimal('5e9') })).bestYear).toBe(false);
  });

  it('counts nothing for a fresh year and does not mutate its input', () => {
    const s = late();
    const before = JSON.stringify(s);
    yearSummary(s);
    expect(JSON.stringify(s)).toBe(before);
    const fresh = yearSummary(prestige(s));
    expect(fresh.kpEarned.eq(0)).toBe(true);
    expect(fresh.customers).toBe(0);
    expect(fresh.merits.eq(0)).toBe(true);
    expect(fresh.bestYear).toBe(false);
  });
});
