import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { UPGRADES } from '../src/content/registry';
import { T } from '../src/content/texts';
import { anyUpgradeAffordable, createInitialState } from '../src/core';

describe('anyUpgradeAffordable (task 093)', () => {
  it('is false without KP', () => {
    expect(anyUpgradeAffordable(createInitialState(0))).toBe(false);
  });

  it('is true when a new upgrade is affordable', () => {
    const s = { ...createInitialState(0), kp: new Decimal(1e6) };
    expect(anyUpgradeAffordable(s)).toBe(true);
  });

  it('ignores upgrades that are already bought', () => {
    const upgrades = Object.fromEntries(UPGRADES.map((u) => [u.id, 1]));
    const s = { ...createInitialState(0), kp: new Decimal(1e30), upgrades };
    expect(anyUpgradeAffordable(s)).toBe(false);
  });

  it('is true only via the unbought upgrade when others are owned', () => {
    const [first, ...rest] = [...UPGRADES].sort((a, b) => a.baseCost - b.baseCost);
    const upgrades = Object.fromEntries(rest.map((u) => [u.id, 1]));
    const s = { ...createInitialState(0), kp: new Decimal(first!.baseCost), upgrades };
    expect(anyUpgradeAffordable(s)).toBe(true);
    expect(anyUpgradeAffordable({ ...s, kp: new Decimal(first!.baseCost - 1) })).toBe(false);
  });

  it('does not mutate state', () => {
    const s = { ...createInitialState(0), kp: new Decimal(1e6) };
    const before = JSON.stringify(s);
    anyUpgradeAffordable(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('has a screen reader label', () => {
    expect(T.a11y.upgradeDot).toBeTruthy();
  });
});
