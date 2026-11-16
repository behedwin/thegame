import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState } from '../src/core';
import { anyMeritAffordable } from '../src/ui/app';

describe('anyMeritAffordable (task 089)', () => {
  it('is false without merits', () => {
    expect(anyMeritAffordable(createInitialState(0))).toBe(false);
  });

  it('is true with merits and an unmaxed merit upgrade', () => {
    const s = { ...createInitialState(0), merits: new Decimal(1e6) };
    expect(anyMeritAffordable(s)).toBe(true);
  });

  it('is false when every merit upgrade is maxed', () => {
    const meritUpgrades = Object.fromEntries(MERITS.map((m) => [m.id, m.maxLevel]));
    const s = { ...createInitialState(0), merits: new Decimal(1e30), meritUpgrades };
    expect(anyMeritAffordable(s)).toBe(false);
  });

  it('has a screen reader label', () => {
    expect(T.a11y.meritDot).toBeTruthy();
  });
});
