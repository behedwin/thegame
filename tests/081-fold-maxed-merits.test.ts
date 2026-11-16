import { describe, expect, it } from 'vitest';
import { MERITS, UPGRADES } from '../src/content/registry';
import { canBuy, createInitialState, isMaxed, splitMaxed, type GameState } from '../src/core';

const [m1, m2, m3] = MERITS.map((m) => m.id) as [string, string, string];
const maxOf = (id: string): number => MERITS.find((m) => m.id === id)!.maxLevel;
const withMerits = (levels: Record<string, number>): GameState => ({ ...createInitialState(0), meritUpgrades: levels });

describe('081 maxed merits', () => {
  it('counts a merit as maxed only at its maxLevel', () => {
    expect(isMaxed(withMerits({ [m1]: maxOf(m1) }), m1)).toBe(true);
    expect(isMaxed(withMerits({ [m1]: maxOf(m1) - 1 }), m1)).toBe(false);
    expect(isMaxed(withMerits({}), m1)).toBe(false);
  });

  it('moves maxed merits to done and keeps the order', () => {
    const s = withMerits({ [m2]: maxOf(m2), [m3]: 1 });
    expect(splitMaxed(s, [m1, m2, m3])).toEqual({ open: [m1, m3], done: [m2] });
  });

  it('still sorts upgrades as before', () => {
    const [a, b] = UPGRADES.map((u) => u.id) as [string, string];
    const s = { ...withMerits({ [m1]: maxOf(m1) }), upgrades: { [b]: UPGRADES[1]!.maxLevel } };
    expect(splitMaxed(s, [a, b, m1])).toEqual({ open: [a], done: [b, m1] });
  });

  it('does not let merits leak into regular purchases', () => {
    const s = { ...withMerits({}), kp: createInitialState(0).kp.add(1e30) };
    expect(canBuy(s, m1)).toBe(false);
  });
});
