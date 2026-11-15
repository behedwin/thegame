import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, FOCUSES } from '../src/content/registry';
import { checkAchievements, createInitialState, DEFAULT_FOCUS, isMet, progress, type GameState } from '../src/core';
import { prestige } from '../src/core/prestige';
import { runKpForMerits } from '../src/core/rules';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = () => createInitialState(1_000);
const played = (ids: string[]): GameState => ({ ...fresh(), focusesPlayed: ids });
/** A state that can do "Nytt läsår" with the given focus running. */
const ready = (focus: string, focusesPlayed: string[] = []): GameState => {
  const s = fresh();
  const kp = runKpForMerits(5);
  return { ...s, focus, focusesPlayed, runEarned: kp, totalEarned: kp };
};
const nonDefault = FOCUSES.filter((f) => f.id !== DEFAULT_FOCUS).map((f) => f.id);

describe('focusesPlayed in prestige()', () => {
  it('starts empty', () => {
    expect(fresh().focusesPlayed).toEqual([]);
  });

  it('records the focus that just ended, once', () => {
    const after = prestige(ready('cloud'));
    expect(after.prestiges).toBe(1);
    expect(after.focusesPlayed).toEqual(['cloud']);
    expect(prestige(ready('cloud', ['cloud'])).focusesPlayed).toEqual(['cloud']);
    expect(prestige(ready('budget', ['cloud'])).focusesPlayed).toEqual(['cloud', 'budget']);
  });

  it('does not record the default focus', () => {
    expect(prestige(ready(DEFAULT_FOCUS)).focusesPlayed).toEqual([]);
  });

  it('does not mutate its input', () => {
    const before = ready('budget', ['cloud']);
    const list = before.focusesPlayed;
    prestige(before);
    expect(before.focusesPlayed).toBe(list);
    expect(list).toEqual(['cloud']);
  });
});

describe('focusesPlayed condition', () => {
  const c = { kind: 'focusesPlayed', n: 2 } as const;
  it('holds at exactly n', () => {
    expect(isMet(played(['cloud']), c)).toBe(false);
    expect(isMet(played(['cloud', 'budget']), c)).toBe(true);
    expect(progress(played(['cloud']), c)).toEqual({ have: 1, need: 2 });
  });
});

describe('focus trophies', () => {
  const trophies = ACHIEVEMENTS.filter((a) => a.condition.kind === 'focusesPlayed');
  const need = (id: string) => {
    const c = trophies.find((a) => a.id === id)!.condition;
    return c.kind === 'focusesPlayed' ? c.n : -1;
  };

  it('adds two trophies: 2 focuses and every non-default focus', () => {
    expect(trophies.map((a) => a.id).sort()).toEqual(['forsoksverksamhet', 'provat-allt']);
    expect(need('forsoksverksamhet')).toBe(2);
    expect(need('provat-allt')).toBe(nonDefault.length);
    for (const a of trophies) expect(a.desc).toMatch(/inriktning/);
  });

  it('unlocks them as focuses are played', () => {
    expect(checkAchievements(played(nonDefault.slice(0, 1))).achievements).not.toContain('forsoksverksamhet');
    const two = checkAchievements(played(nonDefault.slice(0, 2))).achievements;
    expect(two).toContain('forsoksverksamhet');
    expect(two).not.toContain('provat-allt');
    expect(checkAchievements(played(nonDefault)).achievements).toContain('provat-allt');
  });
});

describe('save v11', () => {
  it('migrates old saves to an empty list', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(11);
    const out = migrate({ version: 10 }, MIGRATIONS, 11);
    expect(out).toMatchObject({ version: 11, focusesPlayed: [] });
  });

  it('round-trips and drops unknown or duplicate ids', () => {
    const s = played(['cloud', 'budget']);
    expect(deserialize(serialize(s), 2_000).focusesPlayed).toEqual(['cloud', 'budget']);
    const raw = JSON.parse(serialize(s));
    raw.focusesPlayed = ['cloud', 'cloud', 'nope', 3, DEFAULT_FOCUS];
    expect(deserialize(JSON.stringify(raw), 2_000).focusesPlayed).toEqual(['cloud']);
  });
});
