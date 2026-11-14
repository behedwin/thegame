import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SEASONS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  activeSeason,
  automationKps,
  baseKps,
  click,
  createInitialState,
  Decimal,
  inSeason,
  isValidDay,
  kpPerClick,
  prestige,
  seasonClickMult,
  seasonProdMult,
  setCalendar,
  tick,
  type GameState,
} from '../src/core';
import { AUTOMATIONS } from '../src/content/registry';
import { deserialize, serialize } from '../src/save/format';

const fresh = (): GameState => ({ ...createInitialState(1_000_000), automations: { csv: 10 } });
const on = (month: number, day: number, s: GameState = fresh()) => setCalendar(s, { month, day });

describe('season content', () => {
  it('has the four school-year seasons', () => {
    expect(SEASONS.map((s) => s.id)).toEqual(['studiedag', 'hostlov', 'nationella-prov', 'skolavslutning']);
  });

  it('windows are valid days, names and texts are set, effects are modest boosts', () => {
    for (const s of SEASONS) {
      expect(isValidDay(s.start), s.id).toBe(true);
      expect(isValidDay(s.end), s.id).toBe(true);
      expect(s.name.length, s.id).toBeGreaterThan(0);
      expect(s.desc.length, s.id).toBeGreaterThan(0);
      expect(s.effect.mult, s.id).toBeGreaterThan(1);
      expect(s.effect.mult, s.id).toBeLessThanOrEqual(2);
      expect(T.season.banner(s)).toContain(s.name);
    }
  });

  it('windows do not overlap', () => {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        if (!isValidDay({ month: m, day: d })) continue;
        expect(SEASONS.filter((s) => inSeason(s, { month: m, day: d })).length, `${m}/${d}`).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('inSeason / isValidDay', () => {
  const win = { start: { month: 10, day: 26 }, end: { month: 11, day: 3 } };
  it('is inclusive at both ends', () => {
    expect(inSeason(win, { month: 10, day: 25 })).toBe(false);
    expect(inSeason(win, { month: 10, day: 26 })).toBe(true);
    expect(inSeason(win, { month: 10, day: 31 })).toBe(true);
    expect(inSeason(win, { month: 11, day: 3 })).toBe(true);
    expect(inSeason(win, { month: 11, day: 4 })).toBe(false);
  });

  it('supports windows that wrap over New Year', () => {
    const jul = { start: { month: 12, day: 20 }, end: { month: 1, day: 6 } };
    expect(inSeason(jul, { month: 12, day: 24 })).toBe(true);
    expect(inSeason(jul, { month: 1, day: 1 })).toBe(true);
    expect(inSeason(jul, { month: 1, day: 7 })).toBe(false);
    expect(inSeason(jul, { month: 6, day: 1 })).toBe(false);
  });

  it('validates days', () => {
    expect(isValidDay({ month: 2, day: 29 })).toBe(true);
    expect(isValidDay({ month: 2, day: 30 })).toBe(false);
    expect(isValidDay({ month: 4, day: 31 })).toBe(false);
    expect(isValidDay({ month: 13, day: 1 })).toBe(false);
    expect(isValidDay({ month: 0, day: 1 })).toBe(false);
    expect(isValidDay({ month: 1.5, day: 1 })).toBe(false);
  });
});

describe('setCalendar', () => {
  it('stores a valid day without mutating the input', () => {
    const s = fresh();
    const snap = JSON.stringify(s);
    const next = setCalendar(s, { month: 6, day: 10 });
    expect(next.calendar).toEqual({ month: 6, day: 10 });
    expect(JSON.stringify(s)).toBe(snap);
  });

  it('returns the same object when the day is unchanged', () => {
    const s = on(6, 10);
    expect(setCalendar(s, { month: 6, day: 10 })).toBe(s);
    expect(setCalendar(fresh(), null).calendar ?? null).toBeNull();
  });

  it('clears the calendar on invalid input', () => {
    expect(setCalendar(on(6, 10), { month: 2, day: 31 }).calendar).toBeNull();
  });
});

describe('season effects', () => {
  it('no calendar (sim, tests) means no season and no bonus', () => {
    const s = fresh();
    expect(activeSeason(s)).toBeNull();
    expect(seasonProdMult(s)).toBe(1);
    expect(seasonClickMult(s)).toBe(1);
  });

  it('outside every window gives no bonus', () => {
    const s = on(11, 14);
    expect(activeSeason(s)).toBeNull();
    expect(baseKps(s).eq(baseKps(fresh()))).toBe(true);
    expect(kpPerClick(s).eq(kpPerClick(fresh()))).toBe(true);
  });

  it('Skolavslutning boosts production ×1.5, not clicks', () => {
    const s = on(6, 10);
    expect(activeSeason(s)?.id).toBe('skolavslutning');
    expect(baseKps(s).div(baseKps(fresh())).toNumber()).toBeCloseTo(1.5);
    const csv = AUTOMATIONS.find((a) => a.id === 'csv')!;
    expect(automationKps(s, csv).div(automationKps(fresh(), csv)).toNumber()).toBeCloseTo(1.5);
    const noAuto = { ...s, automations: {} };
    expect(kpPerClick(noAuto).eq(kpPerClick({ ...fresh(), automations: {} }))).toBe(true);
  });

  it('Höstlov boosts production ×1.25 (also over the month boundary)', () => {
    expect(activeSeason(on(11, 2))?.id).toBe('hostlov');
    expect(seasonProdMult(on(10, 28))).toBeCloseTo(1.25);
  });

  it('Studiedag and Nationella prov double clicks', () => {
    for (const [m, d, id] of [[8, 15, 'studiedag'], [4, 20, 'nationella-prov']] as const) {
      const s = { ...on(m, d), automations: {} };
      expect(activeSeason(s)?.id).toBe(id);
      expect(kpPerClick(s).toNumber()).toBeCloseTo(kpPerClick({ ...fresh(), automations: {} }).toNumber() * 2);
      expect(click(s).kp.toNumber()).toBeCloseTo(2);
    }
  });

  it('tick earns with the season bonus and keeps the calendar', () => {
    const s = on(6, 10);
    const t = tick(s, 1000);
    expect(t.calendar).toEqual({ month: 6, day: 10 });
    expect(t.kp.toNumber()).toBeCloseTo(baseKps(fresh()).mul(1.5).toNumber());
  });

  it('a new school year keeps the calendar', () => {
    const s = { ...on(6, 10), runEarned: new Decimal(1e9) };
    const p = prestige(s);
    expect(p.prestiges).toBe(1);
    expect(p.calendar).toEqual({ month: 6, day: 10 });
  });
});

describe('save', () => {
  it('the calendar is not saved (re-injected at start), save version unchanged', () => {
    const text = serialize(on(6, 10));
    expect(JSON.parse(text).calendar).toBeUndefined();
    expect(deserialize(text, 2_000_000).calendar ?? null).toBeNull();
  });
});

describe('purity', () => {
  it('core seasons never read the wall clock', () => {
    const src = readFileSync('src/core/seasons.ts', 'utf8');
    expect(src).not.toMatch(/\bDate\b|Math\.random/);
  });
});
