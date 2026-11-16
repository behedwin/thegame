import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  automationCostFactor, canBuyMerit, createInitialState, Decimal, discountFactor, isMaxed, prestige, yearSummary, type GameState,
} from '../src/core';
import { deserialize, migrate, SAVE_VERSION, serialize } from '../src/save/format';
import { meritEffectText } from '../src/ui/shop';

const ready = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  runEarned: new Decimal('4e9'),
  totalEarned: new Decimal('4e9'),
  ...over,
});

describe('discountFactor shared by core and the merit card (task 085)', () => {
  it('is 1 at level 0 and shrinks multiplicatively per level', () => {
    expect(discountFactor(5, 0)).toBe(1);
    expect(discountFactor(5, 1)).toBeCloseTo(0.95, 12);
    expect(discountFactor(5, 2)).toBeCloseTo(0.9025, 12);
  });

  it('stays in (0, 1] at every real discount merit level', () => {
    for (const m of MERITS) {
      if (m.effect.kind !== 'autoDiscountPct') continue;
      for (let lvl = 0; lvl <= m.maxLevel; lvl++) {
        const f = discountFactor(m.effect.pct, lvl);
        expect(f).toBeGreaterThan(0);
        expect(f).toBeLessThanOrEqual(1);
      }
    }
  });

  it('automationCostFactor equals the card text for each real discount merit at max level', () => {
    for (const m of MERITS) {
      if (m.effect.kind !== 'autoDiscountPct') continue;
      const s = { ...createInitialState(0), meritUpgrades: { [m.id]: m.maxLevel } };
      const pct = Math.round((1 - automationCostFactor(s)) * 1000) / 10;
      expect(meritEffectText(m, m.maxLevel)).toContain(String(pct).replace('.', ','));
    }
  });
});

describe('isMaxed and canBuyMerit edge cases (task 085)', () => {
  it('is false for an unknown id', () => {
    expect(isMaxed(createInitialState(0), 'no-such-thing')).toBe(false);
    expect(canBuyMerit({ ...createInitialState(0), merits: new Decimal('1e300') }, 'no-such-thing')).toBe(false);
  });

  it('a merit at max level is maxed and cannot be bought, however rich', () => {
    for (const m of MERITS) {
      const s = { ...createInitialState(0), merits: new Decimal('1e300'), meritUpgrades: { [m.id]: m.maxLevel } };
      expect(isMaxed(s, m.id)).toBe(true);
      expect(canBuyMerit(s, m.id)).toBe(false);
      expect(isMaxed({ ...s, meritUpgrades: { [m.id]: m.maxLevel - 1 } }, m.id)).toBe(false);
    }
  });
});

describe('KP compared with last school year, edge cases (task 085)', () => {
  it('is null in the first year and when last year earned nothing', () => {
    expect(yearSummary(ready()).kpDiffPct).toBeNull();
    expect(yearSummary(ready({ prestiges: 2, lastYearEarned: new Decimal(0) })).kpDiffPct).toBeNull();
  });

  it('is −100 when nothing was earned this year', () => {
    expect(yearSummary(ready({ prestiges: 1, runEarned: new Decimal(0), lastYearEarned: new Decimal(50) })).kpDiffPct).toBe(-100);
  });

  it('is null instead of Infinity for a change too big for a number', () => {
    const s = ready({ prestiges: 1, runEarned: new Decimal('1e400'), lastYearEarned: new Decimal(1) });
    expect(yearSummary(s).kpDiffPct).toBeNull();
  });

  it('last year is always the year just finished across several prestiges', () => {
    const y1 = prestige(ready({ runEarned: new Decimal('4e9') }));
    const y2 = prestige({ ...y1, runEarned: new Decimal('6e9') });
    expect(y2.lastYearEarned.toString()).toBe(new Decimal('6e9').toString());
    expect(yearSummary({ ...y2, runEarned: new Decimal('3e9') }).kpDiffPct).toBe(-50);
  });

  it('formats signed diffs with decimals and keeps the sign', () => {
    expect(T.prestige.summaryPct(12.5)).toBe(' (+12,5 %)');
    expect(T.prestige.summaryPct(-0.5)).toBe(' (−0,5 %)');
    expect(T.prestige.summaryDiff(1000)).toBe(' (+1000)');
  });
});

describe('save migrations reach a valid state from every old version (task 085)', () => {
  it('each version from 1 up migrates to SAVE_VERSION and loads with last year at 0', () => {
    for (let v = 1; v < SAVE_VERSION; v++) {
      expect(migrate({ version: v }).version).toBe(SAVE_VERSION);
      const s = deserialize(JSON.stringify({ version: v }), 1_000);
      expect(s.lastYearEarned.eq(0)).toBe(true);
      expect(s.lastYearEvents).toBe(0);
      expect(s.lastYearTickets).toBe(0);
    }
  });

  it('a v15 save keeps its other fields through the v16 migration', () => {
    const raw = { version: 15, kp: '123', prestiges: 3, lastYearEvents: 4, lastYearTickets: 7 };
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.kp.toString()).toBe('123');
    expect(s).toMatchObject({ prestiges: 3, lastYearEvents: 4, lastYearTickets: 7 });
    expect(s.lastYearEarned.eq(0)).toBe(true);
  });

  it('lastYearEarned round-trips huge values and falls back to 0 on garbage', () => {
    const s = { ...createInitialState(0), lastYearEarned: new Decimal('1e5000') };
    expect(deserialize(serialize(s), 0).lastYearEarned.toString()).toBe(new Decimal('1e5000').toString());
    const bad = JSON.stringify({ ...JSON.parse(serialize(s)), lastYearEarned: 'oops' });
    expect(deserialize(bad, 0).lastYearEarned.eq(0)).toBe(true);
  });
});
