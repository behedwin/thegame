// Task 010: refactor #2. Strengthens coverage of code added since refactor #1
// (achievements, seasons, save v2) without changing behaviour.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, SEASONS } from '../src/content/registry';
import {
  applyOffline,
  checkAchievements,
  click,
  createInitialState,
  Decimal,
  kpPerClick,
  kpPerSecond,
  prestige,
  setCalendar,
  tick,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';

const fresh = () => createInitialState(1_000);

/** Deep-freeze-ish snapshot so mutations of the input are detected. */
const snap = (s: GameState) => serialize(s) + JSON.stringify({ calendar: s.calendar ?? null, a: s.achievements });

describe('core purity (whole src/core)', () => {
  it('no core file reads the wall clock or Math.random, or touches the DOM', () => {
    const dir = join(__dirname, '../src/core');
    for (const f of readdirSync(dir)) {
      const src = readFileSync(join(dir, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(src, f).not.toMatch(/\bnew Date\b|\bDate\.now\b|Math\.random|\bdocument\b|\bwindow\b/);
      expect(src, f).not.toMatch(/from '\.\.\/ui|from '\.\.\/save/);
    }
  });

  it('setCalendar, checkAchievements and applyOffline never mutate their input', () => {
    const s: GameState = { ...fresh(), clicks: 10_000, totalEarned: new Decimal(1e9), calendar: { month: 6, day: 10 } };
    const before = snap(s);
    setCalendar(s, { month: 1, day: 1 });
    setCalendar(s, null);
    checkAchievements(s);
    applyOffline(s, 1_000 + 3_600_000);
    expect(snap(s)).toBe(before);
  });
});

describe('content ordering', () => {
  it('achievements and seasons come sorted by order with unique ids', () => {
    for (const list of [ACHIEVEMENTS, SEASONS]) {
      const orders = list.map((x) => x.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(new Set(list.map((x) => x.id)).size).toBe(list.length);
    }
  });
});

describe('achievements across transitions', () => {
  it('a raw v1 save loads with none, and the first tick unlocks what already holds', () => {
    const v1 = JSON.stringify({ version: 1, kp: '0', totalEarned: '1e12', clicks: 5000, lastSeenMs: 0 });
    const loaded = deserialize(v1, 0);
    expect(loaded.achievements).toEqual([]);
    const after = tick(loaded, 16);
    expect(after.achievements.length).toBeGreaterThan(0);
    // Unlock order follows content order.
    const order = ACHIEVEMENTS.map((a) => a.id).filter((id) => after.achievements.includes(id));
    expect(after.achievements).toEqual(order);
  });

  it('unlocks are idempotent: checking twice changes nothing', () => {
    const s = checkAchievements({ ...fresh(), clicks: 100_000 });
    expect(checkAchievements(s)).toBe(s);
  });

  it('applyOffline keeps achievements and the calendar', () => {
    const s: GameState = { ...fresh(), automations: { csv: 3 }, achievements: ['forsta-csv'], calendar: { month: 6, day: 10 } };
    const { state } = applyOffline(s, s.lastSeenMs + 60_000);
    expect(state.achievements).toEqual(['forsta-csv']);
    expect(state.calendar).toEqual({ month: 6, day: 10 });
  });

  it('prestige without a calendar yields null (never undefined leaking a stale day)', () => {
    const s: GameState = { ...fresh(), runEarned: new Decimal(1e15), totalEarned: new Decimal(1e15) };
    const p = prestige(s);
    expect(p).not.toBe(s);
    expect(p.calendar).toBeNull();
  });
});

describe('season multipliers stack with the rest', () => {
  it('every season changes exactly one of production or clicks', () => {
    const base: GameState = { ...fresh(), automations: { csv: 10 } };
    const kps0 = kpPerSecond(base);
    const kpc0 = kpPerClick({ ...base, automations: {} });
    for (const s of SEASONS) {
      const inside = setCalendar(base, s.start);
      const kpsRatio = kpPerSecond(inside).div(kps0).toNumber();
      const kpcRatio = kpPerClick({ ...inside, automations: {} }).div(kpc0).toNumber();
      if (s.effect.kind === 'prodMult') {
        expect(kpsRatio, s.id).toBeCloseTo(s.effect.mult, 10);
        expect(kpcRatio, s.id).toBeCloseTo(1, 10);
      } else {
        expect(kpcRatio, s.id).toBeCloseTo(s.effect.mult, 10);
        expect(kpsRatio, s.id).toBeCloseTo(1, 10);
      }
    }
  });

  it('click earns with season and achievement bonuses but leaves the calendar alone', () => {
    const clickSeason = SEASONS.find((s) => s.effect.kind === 'clickMult');
    expect(clickSeason).toBeDefined();
    const s = setCalendar(fresh(), clickSeason!.start);
    const after = click(s);
    expect(after.calendar).toEqual(s.calendar);
    expect(after.kp.gt(click(fresh()).kp)).toBe(true);
  });
});
