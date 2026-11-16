import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { anyNewAutomationAffordable, createInitialState } from '../src/core';

describe('anyNewAutomationAffordable (task 097)', () => {
  it('is false without KP', () => {
    expect(anyNewAutomationAffordable(createInitialState(0))).toBe(false);
  });

  it('is true when a new unlocked automation is affordable', () => {
    const s = { ...createInitialState(0), kp: new Decimal(1e6) };
    expect(anyNewAutomationAffordable(s)).toBe(true);
  });

  it('is false when every affordable unlocked automation is already owned', () => {
    const automations = Object.fromEntries(AUTOMATIONS.filter((a) => !a.unlockYear || a.unlockYear <= 1).map((a) => [a.id, 1]));
    const s = { ...createInitialState(0), kp: new Decimal(1e60), automations };
    expect(anyNewAutomationAffordable(s)).toBe(false);
  });

  it('ignores automations that are still locked', () => {
    const locked = AUTOMATIONS.filter((a) => (a.unlockYear ?? 1) > 1);
    expect(locked.length).toBeGreaterThan(0);
    const automations = Object.fromEntries(AUTOMATIONS.filter((a) => (a.unlockYear ?? 1) <= 1).map((a) => [a.id, 1]));
    const s = { ...createInitialState(0), kp: new Decimal(1e60), automations };
    expect(anyNewAutomationAffordable(s)).toBe(false);
    // Once the year unlocks them, they count.
    expect(anyNewAutomationAffordable({ ...s, prestiges: 99 })).toBe(true);
  });

  it('does not mutate state', () => {
    const s = { ...createInitialState(0), kp: new Decimal(1e6) };
    const before = JSON.stringify(s);
    anyNewAutomationAffordable(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('has a screen reader label', () => {
    expect(T.a11y.automationDot).toBeTruthy();
  });
});
