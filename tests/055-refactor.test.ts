// Refactor #11 (055): one path through core for what a new school year brings (051-053),
// plus stronger tests for prestige, goal, focus and save round trips.
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, CHAPTERS, FOCUSES } from '../src/content/registry';
import {
  chapterFor,
  connectedMunicipalities,
  createInitialState,
  Decimal,
  DEFAULT_FOCUS,
  focusesForYear,
  prestige,
  runKpForMerits,
  schoolYear,
  unlocksInYear,
  yearStart,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';

const ready = (prestiges: number, focus = DEFAULT_FOCUS): GameState => ({
  ...createInitialState(0),
  prestiges,
  focus,
  runEarned: runKpForMerits(5),
  totalEarned: runKpForMerits(5).mul(3),
});

describe('yearStart: what a new school year brings, from one place', () => {
  it('bundles chapter, unlocked integration types and focus options for every year', () => {
    for (let year = 1; year <= 12; year++) {
      const s = yearStart(year);
      expect(s.year).toBe(year);
      expect(s.chapter).toBe(chapterFor(year));
      expect(s.unlocked.map((a) => a.id)).toEqual(unlocksInYear(year).map((a) => a.id));
      expect(s.focuses.map((f) => f.id)).toEqual(focusesForYear(year).map((f) => f.id));
    }
  });

  it('offers no focus choice in school year 1 and a real one later', () => {
    expect(yearStart(1).focuses.length).toBeLessThan(2);
    expect(yearStart(2).focuses.length).toBeGreaterThanOrEqual(2);
  });

  it('every unlocking year and every chapter is reachable through it', () => {
    const years = new Set(AUTOMATIONS.map((a) => a.unlockYear ?? 1).filter((y) => y > 1));
    for (const y of years) expect(yearStart(y).unlocked.length).toBeGreaterThan(0);
    for (const c of CHAPTERS) expect(yearStart(c.order).chapter?.id).toBe(c.id);
  });

  it('matches the state right after a prestige', () => {
    const after = prestige(ready(2, FOCUSES.at(-1)!.id));
    expect(schoolYear(after)).toBe(4);
    expect(after.focus).toBe(DEFAULT_FOCUS);
    expect(yearStart(schoolYear(after)).year).toBe(4);
  });
});

describe('prestige keeps the long loop', () => {
  it('never lowers connected municipalities', () => {
    let s = ready(0);
    for (let i = 0; i < 12; i++) {
      const next = prestige({ ...s, runEarned: runKpForMerits(5) });
      expect(connectedMunicipalities(next)).toBeGreaterThanOrEqual(connectedMunicipalities(s));
      s = next;
    }
    expect(s.prestiges).toBe(12);
  });

  it('does not mutate its input', () => {
    const s = ready(3, 'budget');
    const copy = serialize(s);
    prestige(s);
    expect(serialize(s)).toBe(copy);
  });
});

describe('save round trip of the 051-053 state', () => {
  it('keeps school year and focus, and drops unknown focus ids', () => {
    const s = ready(4, FOCUSES.find((f) => f.id !== DEFAULT_FOCUS)!.id);
    const back = deserialize(serialize(s), 0);
    expect(back.prestiges).toBe(4);
    expect(back.focus).toBe(s.focus);
    expect(deserialize(serialize({ ...s, focus: 'finns-inte' }), 0).focus).toBe(DEFAULT_FOCUS);
  });

  it('a new game starts in the default focus', () => {
    expect(createInitialState(0).focus).toBe(DEFAULT_FOCUS);
    expect(new Decimal(0).eq(createInitialState(0).merits)).toBe(true);
  });
});
