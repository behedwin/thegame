import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { buy, createInitialState, Decimal, prestige, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { buyMany } from '../src/core/bulk';
import { fmt } from '../src/ui/format';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState, label: string) => statRows(s).find((r) => r.label === label)?.value;
const rich = (s: GameState, kp: number): GameState => ({ ...s, kp: new Decimal(kp), runEarned: new Decimal(kp), totalEarned: new Decimal(kp) });

describe('039 lifetime records', () => {
  it('a new game starts with no best year and no purchases', () => {
    const s = fresh();
    expect(s.bestRunEarned.eq(0)).toBe(true);
    expect(s.purchases).toBe(0);
  });

  it('buying counts purchases; bulk buys count every unit', () => {
    let s = rich(fresh(), 1e12);
    s = buy(s, 'csv');
    expect(s.purchases).toBe(1);
    s = buyMany(s, 'csv', 10);
    expect(s.purchases).toBe(11);
  });

  it('a failed buy does not count', () => {
    const s = buy(fresh(), 'csv');
    expect(s.purchases).toBe(0);
  });

  it('prestige keeps both fields and raises the best year only when beaten', () => {
    let s: GameState = { ...rich(fresh(), 1e9), purchases: 7 };
    s = prestige(s);
    expect(s.purchases).toBe(7);
    expect(s.bestRunEarned.eq(1e9)).toBe(true);
    s = prestige({ ...s, runEarned: new Decimal(5e8), kp: new Decimal(5e8) });
    expect(s.bestRunEarned.eq(1e9)).toBe(true);
    s = prestige({ ...s, runEarned: new Decimal(1e10), kp: new Decimal(1e10) });
    expect(s.bestRunEarned.eq(1e10)).toBe(true);
  });

  it('stats rows show best year (including the running year) and purchases', () => {
    const s: GameState = { ...fresh(), bestRunEarned: new Decimal(1000), runEarned: new Decimal(50), purchases: 1234 };
    expect(value(s, T.stats.bestYear)).toBe(`${fmt(1000)} KP`);
    expect(value(s, T.stats.purchases)).toBe(fmt(1234));
    expect(value({ ...s, runEarned: new Decimal(2000) }, T.stats.bestYear)).toBe(`${fmt(2000)} KP`);
  });

  it('migrates v6 saves: best year from the current year, no purchases', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(7);
    const m = migrate({ version: 6, runEarned: '12345' }, MIGRATIONS, 7);
    expect(m.bestRunEarned).toBe('12345');
    expect(m.purchases).toBe(0);
    const bad = migrate({ version: 6, runEarned: 'garbage' }, MIGRATIONS, 7);
    expect(bad.bestRunEarned).toBe('0');
  });

  it('an old v6 save loads without errors', () => {
    const v6 = { ...JSON.parse(serialize(rich(fresh(), 777))), version: 6 };
    delete v6.bestRunEarned;
    delete v6.purchases;
    const s = deserialize(JSON.stringify(v6), 1_000_000);
    expect(s.bestRunEarned.eq(777)).toBe(true);
    expect(s.purchases).toBe(0);
  });

  it('round-trips through the save format', () => {
    const s: GameState = { ...fresh(), bestRunEarned: new Decimal('1e50'), purchases: 99 };
    const back = deserialize(serialize(s), 1_000_000);
    expect(back.bestRunEarned.eq(s.bestRunEarned)).toBe(true);
    expect(back.purchases).toBe(99);
  });
});
