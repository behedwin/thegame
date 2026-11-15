// Task 066: textbook licences unlock in school year 12.
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, SYSTEMS } from '../src/content/registry';
import { createInitialState, getAutomation, isUnlocked, nextUnlock, unlocksInYear, type GameState } from '../src/core';

const inYear = (year: number): GameState => ({ ...createInitialState(0), prestiges: year - 1 });
const licenses = () => getAutomation('licenses')!;

describe('licenses (066)', () => {
  it('exists with unlockYear 12 and four milestone names', () => {
    const a = licenses();
    expect(a).toBeDefined();
    expect(a.unlockYear).toBe(12);
    expect(a.milestoneNames).toHaveLength(4);
  });

  it('is locked in year 11 and unlocked in year 12', () => {
    expect(isUnlocked(inYear(11), licenses())).toBe(false);
    expect(isUnlocked(inYear(12), licenses())).toBe(true);
  });

  it('is the next unlock from year 9 on', () => {
    expect(nextUnlock(inYear(9))).toMatchObject({ year: 12 });
    expect(nextUnlock(inYear(11))!.defs.map((a) => a.id)).toEqual(['licenses']);
    expect(unlocksInYear(12).map((a) => a.id)).toEqual(['licenses']);
  });

  it('comes after gradetransfer and connects existing, distinct systems', () => {
    const a = licenses();
    const g = getAutomation('gradetransfer')!;
    expect(a.order).toBeGreaterThan(g.order);
    const sorted = [...AUTOMATIONS].sort((x, y) => x.order - y.order);
    expect(sorted.at(-1)!.id).toBe('licenses');
    const systems = new Set(SYSTEMS.map((s) => s.id));
    expect(systems.has(a.from) && systems.has(a.to)).toBe(true);
    expect(a.from).not.toBe(a.to);
  });
});
