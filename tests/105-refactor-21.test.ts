import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { yearClock } from '../src/ui/prestige';
import { statRows } from '../src/ui/stats';
import { seenTrophies, TABS, tabDots, type Tab } from '../src/ui/tab-dots';

const fresh = (): GameState => createInitialState(0);
const ids = (n: number) => ACHIEVEMENTS.slice(0, n).map((a) => a.id);
const dotOn = (s: GameState, tab: Tab, seen: number) => tabDots(s, tab, seen).filter((d) => d.dot).map((d) => d.tab);

describe('tab dots (105, from 089/093/097/101)', () => {
  it('has one entry per tab, each with a screen reader reason', () => {
    const dots = tabDots(fresh(), 'automations', 0);
    expect(dots.map((d) => d.tab).sort()).toEqual([...TABS].sort());
    for (const d of dots) expect(d.why).toBeTruthy();
  });

  it('shows nothing on a fresh game', () => {
    expect(dotOn(fresh(), 'automations', 0)).toEqual([]);
  });

  it('never shows a dot on the open tab', () => {
    const rich = { ...fresh(), kp: new Decimal(1e60), merits: new Decimal(1e30), achievements: ids(3) };
    for (const t of TABS) expect(dotOn(rich, t, 0)).not.toContain(t);
  });

  it('shows the shop dots away from their tab while something is affordable', () => {
    const s = { ...fresh(), kp: new Decimal(1e6) };
    expect(dotOn(s, 'achievements', 0)).toEqual(expect.arrayContaining(['upgrades', 'automations']));
  });

  it('shows the trophy dot only for unseen trophies', () => {
    const s = { ...fresh(), achievements: ids(2) };
    expect(dotOn(s, 'automations', 1)).toContain('achievements');
    expect(dotOn(s, 'automations', 2)).not.toContain('achievements');
  });

  it('does not mutate state', () => {
    const s = { ...fresh(), kp: new Decimal(1e6), achievements: ids(1) };
    const before = JSON.stringify(s);
    tabDots(s, 'upgrades', 0);
    seenTrophies(s, 'achievements', 0);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('seenTrophies (105, from 101)', () => {
  const s = { ...fresh(), achievements: ids(3) };
  it('keeps the seen count away from the tab', () => expect(seenTrophies(s, 'automations', 1)).toBe(1));
  it('marks everything seen on the trophy tab', () => expect(seenTrophies(s, 'achievements', 1)).toBe(3));
  it('follows the count down after a wipe or import', () => expect(seenTrophies(s, 'upgrades', 5)).toBe(3));
});

describe('yearClock (105, from 094/102)', () => {
  it('shows only the running time without a record', () => {
    expect(yearClock({ ...fresh(), timeMs: 45_000 })).toEqual({ text: 'Läsåret: 45 s', onPace: false });
  });

  it('is on pace while under the record', () => {
    const s = { ...fresh(), prestiges: 1, yearStartMs: 60_000, timeMs: 60_000 + 18 * 60_000, fastestYearMs: 25 * 60_000 };
    expect(yearClock(s)).toEqual({ text: 'Läsåret: 18 min (rekord 25 min) · rekordtakt', onPace: true });
  });

  it('is off pace at or over the record', () => {
    const s = { ...fresh(), prestiges: 1, timeMs: 25 * 60_000, fastestYearMs: 25 * 60_000 };
    expect(yearClock(s)).toEqual({ text: 'Läsåret: 25 min (rekord 25 min)', onPace: false });
  });

  it('never goes negative if the year start is ahead of the clock', () => {
    expect(yearClock({ ...fresh(), yearStartMs: 10_000, timeMs: 0 }).text).toBe(T.prestige.yearClock('0 s', null));
  });
});

describe('statRows (105)', () => {
  const labels = (s: GameState) => statRows(s).map((r) => r.label);

  it('hides the fastest year until one is finished', () => {
    expect(labels(fresh())).not.toContain(T.stats.fastestYear);
    expect(labels({ ...fresh(), fastestYearMs: 20 * 60_000 })).toContain(T.stats.fastestYear);
  });

  it('has a unique label and a non-empty value on every row', () => {
    const rows = statRows({ ...fresh(), fastestYearMs: 1000, prestiges: 2 });
    expect(new Set(rows.map((r) => r.label)).size).toBe(rows.length);
    for (const r of rows) expect(r.value).not.toBe('');
  });

  it('counts the school year from one', () => {
    const v = (s: GameState) => statRows(s).find((r) => r.label === T.stats.schoolYears)?.value;
    expect(v(fresh())).toBe('1');
    expect(v({ ...fresh(), prestiges: 2 })).toBe('3');
  });

  it('shows trophies out of the total', () => {
    const v = statRows({ ...fresh(), achievements: ids(2) }).find((r) => r.label === T.stats.achievements)?.value;
    expect(v).toBe(T.stats.of(2, ACHIEVEMENTS.length));
  });
});
