// Task 056: "Nytt sedan sist" after an update: last seen version in the save and the news filter.
import { describe, expect, it } from 'vitest';
import { build } from 'virtual:changelog';
import { createInitialState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { newsSince } from '../src/ui/changelog';

const list = [
  { id: '060', title: 'Sextio', date: '2026-11-20' },
  { id: '058', title: 'Femtioåtta', date: '2026-11-19' },
  { id: '056', title: 'Femtiosex', date: '2026-11-18' },
  { id: '041', title: 'Fyrtioett' },
];

describe('newsSince', () => {
  it('keeps only entries after the last seen version', () => {
    expect(newsSince(list, 56, 60).map((e) => e.id)).toEqual(['060', '058']);
    expect(newsSince(list, 40, 60).map((e) => e.id)).toEqual(['060', '058', '056', '041']);
  });

  it('shows nothing when the player is up to date', () => {
    expect(newsSince(list, 60, 60)).toEqual([]);
    expect(newsSince(list, 61, 60)).toEqual([]);
  });

  it('shows nothing when the last seen version is unknown (new game or migrated save)', () => {
    expect(newsSince(list, 0, 60)).toEqual([]);
  });
});

describe('lastSeenVersion in the save', () => {
  it('a new game starts with an unknown version, so it shows no news', () => {
    const s = createInitialState(0);
    expect(s.lastSeenVersion).toBe(0);
    expect(newsSince(list, s.lastSeenVersion, 60)).toEqual([]);
  });

  it('round-trips through serialize/deserialize', () => {
    const s = { ...createInitialState(0), lastSeenVersion: 54 };
    expect(deserialize(serialize(s), 0).lastSeenVersion).toBe(54);
  });

  it('migration v9 → v10 marks the version as unknown, which the app treats as the current one', () => {
    const old = { version: 9, kp: '5', focus: 'normal' };
    const m = migrate(old, MIGRATIONS, 10);
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(10);
    expect(m.version).toBe(10);
    expect(m.lastSeenVersion).toBe(0);
    expect(newsSince(list, Number(m.lastSeenVersion), 60)).toEqual([]);
  });

  it('broken values fall back to unknown', () => {
    for (const bad of [-3, 'x', null, 1.5, Infinity]) {
      const raw = JSON.parse(serialize(createInitialState(0)));
      expect(deserialize(JSON.stringify({ ...raw, lastSeenVersion: bad }), 0).lastSeenVersion).toBe(0);
    }
  });

  it('the build number is a positive version number', () => {
    expect(build).toBeGreaterThan(0);
  });
});
