import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { CUSTOMERS } from '../src/content/registry';
import { runKpForMerits } from '../src/core';

// Task 037: kommun customers signed during the first school year give a clearly felt bonus,
// and the prestige divisor compensates so the first prestige stays at 30-90 min (see sim).
describe('037 stronger kommun customers', () => {
  const firstPrestigeKp = runKpForMerits(2).toNumber(); // the sim bot prestiges at 2 merits

  it('every kommun signed before the first prestige gives about +10 % production', () => {
    const early = CUSTOMERS.filter((c) => c.kind === 'kommun' && c.atRunKp < firstPrestigeKp);
    expect(early.length).toBeGreaterThanOrEqual(3);
    for (const c of early) {
      expect(c.effect.kind).toBe('prodPct');
      if (c.effect.kind === 'prodPct') expect(c.effect.pct).toBeGreaterThanOrEqual(10);
    }
  });

  it('later kommuner are never weaker than earlier ones', () => {
    const pcts = CUSTOMERS.filter((c) => c.effect.kind === 'prodPct')
      .sort((a, b) => a.atRunKp - b.atRunKp)
      .map((c) => (c.effect.kind === 'prodPct' ? c.effect.pct : 0));
    for (let i = 1; i < pcts.length; i++) expect(pcts[i]!).toBeGreaterThanOrEqual(pcts[i - 1]!);
  });

  it('prestige divisor was raised to compensate', () => {
    expect(BALANCE.prestige.divisor).toBe(1e9);
  });
});
