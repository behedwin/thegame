import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { canPrestige, createInitialState, runKpForMerits, type GameState } from '../src/core';
import { TABS, tabDots, type Tab } from '../src/ui/tab-dots';

const fresh = (): GameState => createInitialState(0);
const ready = (): GameState => ({ ...fresh(), runEarned: runKpForMerits(5) });
const prestigeDot = (s: GameState, tab: Tab) => tabDots(s, tab, 0).find((d) => d.tab === 'prestige')!;

describe('prestige-ready tab dot (108)', () => {
  it('has a screen reader label', () => {
    expect(T.a11y.prestigeReadyDot).toBeTruthy();
    expect(T.a11y.prestigeReadyDot).not.toBe(T.a11y.meritDot);
  });

  it('shows no dot when a new school year cannot start', () => {
    expect(canPrestige(fresh())).toBe(false);
    expect(prestigeDot(fresh(), 'automations').dot).toBe(false);
  });

  it('shows the dot away from the tab when a new school year can start', () => {
    const s = ready();
    expect(canPrestige(s)).toBe(true);
    for (const t of TABS.filter((t) => t !== 'prestige')) expect(prestigeDot(s, t).dot).toBe(true);
  });

  it('never shows the dot on the open prestige tab', () => {
    expect(prestigeDot(ready(), 'prestige').dot).toBe(false);
  });

  it('uses the new reason when no merit is affordable', () => {
    expect(prestigeDot(ready(), 'upgrades').why).toBe(T.a11y.prestigeReadyDot);
  });

  it('keeps the merit reason when a merit is affordable', () => {
    const s = { ...ready(), merits: new Decimal(1e6) };
    expect(prestigeDot(s, 'upgrades').why).toBe(T.a11y.meritDot);
  });
});
