import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { canPrestige, createInitialState, type GameState } from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { renderToasts } from '../src/ui/render-toasts';
import { seenTrophies, tabDots, type Tab } from '../src/ui/tab-dots';

const fresh = (): GameState => createInitialState(0);
const year = (earned: number, last = 1000): GameState => ({
  ...fresh(),
  prestiges: 1,
  runEarned: new Decimal(earned),
  lastYearEarned: new Decimal(last),
});

describe('renderToasts (110, from 087/109)', () => {
  it('shows nothing without a change', () => {
    expect(renderToasts(year(500), year(600), null)).toEqual([]);
  });

  it("never toasts last year's KP on the first render", () => {
    expect(renderToasts(null, year(2000), null)).toEqual([]);
  });

  it("toasts when this year passes last year's KP", () => {
    expect(renderToasts(year(900), year(1001), null)).toEqual([T.toastBeatLastYear]);
  });

  it('toasts a new hub tier, also on the first render', () => {
    expect(renderToasts(null, fresh(), 1)).toEqual([T.hubTierUp(T.hubTiers[1]!)]);
  });

  it('shows the year toast before the hub tier toast', () => {
    expect(renderToasts(year(900), year(1001), 2)).toEqual([T.toastBeatLastYear, T.hubTierUp(T.hubTiers[2]!)]);
  });

  it('does not mutate state', () => {
    const [a, b] = [year(900), year(1001)];
    const snap = [serialize(a), serialize(b)];
    renderToasts(a, b, 1);
    expect([serialize(a), serialize(b)]).toEqual(snap);
  });
});

describe('tab dots (110, from 105/108)', () => {
  const dot = (s: GameState, tab: Tab, t: Tab) => tabDots(s, tab, 0).find((d) => d.tab === t)!;

  it('shows the school-year dot for an affordable merit even when no new year can start', () => {
    const s = { ...fresh(), merits: new Decimal(1e6) };
    expect(canPrestige(s)).toBe(false);
    expect(dot(s, 'upgrades', 'prestige')).toMatchObject({ dot: true, why: T.a11y.meritDot });
  });

  it('keeps a reason even when there is no dot', () => {
    for (const d of tabDots(fresh(), 'automations', 0)) {
      expect(d.dot).toBe(false);
      expect(d.why).toBeTruthy();
    }
  });

  it('hides the trophy dot after a wipe lowers the count below the seen one', () => {
    const s = { ...fresh(), achievements: ACHIEVEMENTS.slice(0, 1).map((a) => a.id) };
    const seen = seenTrophies(s, 'upgrades', 4);
    expect(seen).toBe(1);
    expect(tabDots(s, 'upgrades', seen).find((d) => d.tab === 'achievements')!.dot).toBe(false);
  });
});

describe('year streak base in saves (110, from 107)', () => {
  const raw = (patch: Record<string, unknown>) => JSON.stringify({ ...JSON.parse(serialize(fresh())), ...patch });

  it('loads a v19 save without the field as zero', () => {
    const s = JSON.parse(serialize({ ...fresh(), eventStreak: 3 }));
    delete s.yearStreakBase;
    expect(deserialize(JSON.stringify({ ...s, version: 19 }), 0)).toMatchObject({ eventStreak: 3, yearStreakBase: 0 });
  });

  it('treats a broken value as zero', () => {
    for (const bad of [-2, 'x', null, 1.5e400]) {
      expect(deserialize(raw({ eventStreak: 3, yearStreakBase: bad }), 0).yearStreakBase).toBeLessThanOrEqual(3);
      expect(deserialize(raw({ eventStreak: 3, yearStreakBase: bad }), 0).yearStreakBase).toBeGreaterThanOrEqual(0);
    }
  });
});
