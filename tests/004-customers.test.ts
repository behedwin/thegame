import { describe, expect, it } from 'vitest';
import { CUSTOMERS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  automationKps,
  baseKps,
  createInitialState,
  customerClickMult,
  customerProdMult,
  customersSigned,
  Decimal,
  kpPerClick,
  signedCustomers,
  type GameState,
} from '../src/core';
import { AUTOMATIONS } from '../src/content/registry';

const fresh = () => createInitialState(1_000_000);
const withRun = (s: GameState, kp: number): GameState => ({ ...s, runEarned: new Decimal(kp) });

describe('customer content', () => {
  it('every kind has the matching effect type', () => {
    const expected = { kommun: 'prodPct', friskola: 'clickPct', koncern: 'prodMult' } as const;
    for (const c of CUSTOMERS) expect(c.effect.kind, c.id).toBe(expected[c.kind]);
  });

  it('effects are positive and finite', () => {
    for (const c of CUSTOMERS) {
      const e = c.effect;
      const v = e.kind === 'prodMult' ? e.mult : e.pct;
      expect(Number.isFinite(v) && v > 0, c.id).toBe(true);
      if (e.kind === 'prodMult') expect(e.mult).toBeGreaterThan(1);
    }
  });

  it('has at least one customer of each kind', () => {
    for (const k of ['kommun', 'friskola', 'koncern'] as const) expect(CUSTOMERS.some((c) => c.kind === k), k).toBe(true);
  });

  it('every effect has a Swedish description', () => {
    for (const c of CUSTOMERS) expect(T.customerEffect(c.effect).length, c.id).toBeGreaterThan(0);
  });
});

describe('customer effects', () => {
  it('no customers: neutral multipliers', () => {
    const s = fresh();
    expect(signedCustomers(s)).toEqual([]);
    expect(customerProdMult(s)).toBe(1);
    expect(customerClickMult(s)).toBe(1);
  });

  it('signs customers in threshold order', () => {
    const s = withRun(fresh(), CUSTOMERS[2]!.atRunKp);
    expect(signedCustomers(s).map((c) => c.id)).toEqual(CUSTOMERS.slice(0, 3).map((c) => c.id));
    expect(customersSigned(s)).toBe(3);
  });

  it('kommun pct adds up, koncern multiplies production', () => {
    const s = withRun(fresh(), Number.MAX_VALUE);
    let pct = 0;
    let mult = 1;
    for (const c of CUSTOMERS) {
      if (c.effect.kind === 'prodPct') pct += c.effect.pct;
      if (c.effect.kind === 'prodMult') mult *= c.effect.mult;
    }
    expect(customerProdMult(s)).toBeCloseTo((1 + pct / 100) * mult, 9);
  });

  it('friskola pct raises KP per click', () => {
    const s = withRun(fresh(), Number.MAX_VALUE);
    let pct = 0;
    for (const c of CUSTOMERS) if (c.effect.kind === 'clickPct') pct += c.effect.pct;
    expect(customerClickMult(s)).toBeCloseTo(1 + pct / 100, 9);
    expect(kpPerClick(s).toNumber()).toBeCloseTo(customerClickMult(s), 9);
  });

  it('production bonus applies to automations and offline base KP/s', () => {
    const base = { ...fresh(), automations: { [AUTOMATIONS[0]!.id]: 10 } };
    const rich = withRun(base, Number.MAX_VALUE);
    const ratio = automationKps(rich, AUTOMATIONS[0]!).div(automationKps(base, AUTOMATIONS[0]!)).toNumber();
    expect(ratio).toBeCloseTo(customerProdMult(rich), 9);
    expect(baseKps(rich).div(baseKps(base)).toNumber()).toBeCloseTo(customerProdMult(rich), 9);
  });

  it('does not mutate state', () => {
    const s = withRun(fresh(), 1e12);
    const snap = JSON.stringify(s);
    customerProdMult(s);
    customerClickMult(s);
    signedCustomers(s);
    expect(JSON.stringify(s)).toBe(snap);
  });
});
