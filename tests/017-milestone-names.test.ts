import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS } from '../src/content/registry';
import { milestoneName } from '../src/core';

describe('named milestones', () => {
  it('every automation names each milestone (non-empty, at most one per milestone)', () => {
    for (const a of AUTOMATIONS) {
      expect(a.milestoneNames, a.id).toBeDefined();
      expect(a.milestoneNames!.length, a.id).toBe(BALANCE.milestones.length);
      for (const n of a.milestoneNames!) expect(n.trim().length, a.id).toBeGreaterThan(0);
    }
  });

  it('names are unique across automations', () => {
    const all = AUTOMATIONS.flatMap((a) => a.milestoneNames ?? []);
    expect(new Set(all).size).toBe(all.length);
  });

  it('milestoneName returns the name of the latest reached milestone', () => {
    const def = { ...AUTOMATIONS[0]!, milestoneNames: ['A', 'B'] };
    const [m1, m2, m3] = BALANCE.milestones as [number, number, number];
    expect(milestoneName(def, 0)).toBeNull();
    expect(milestoneName(def, m1 - 1)).toBeNull();
    expect(milestoneName(def, m1)).toBe('A');
    expect(milestoneName(def, m2)).toBe('B');
    // No name defined for the third milestone: field is optional, so fall back to null.
    expect(milestoneName(def, m3)).toBeNull();
    expect(milestoneName({ ...def, milestoneNames: undefined }, m1)).toBeNull();
  });
});
