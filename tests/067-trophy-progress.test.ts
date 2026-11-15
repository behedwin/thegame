import { describe, expect, it } from 'vitest';
import type { AchievementCondition } from '../src/content/types';
import { createInitialState, progress, type GameState } from '../src/core';

const base = (): GameState => ({
  ...createInitialState(1_000),
  clicks: 7,
  eventsClaimed: 3,
  ticketsAnswered: 4,
  prestiges: 2,
  automations: { csv: 5, nightly: 2 },
  upgrades: {},
});

describe('progress', () => {
  it('counts each countable condition', () => {
    const s = base();
    const cases: [AchievementCondition, number][] = [
      [{ kind: 'clicks', n: 10 }, 7],
      [{ kind: 'eventsClaimed', n: 25 }, 3],
      [{ kind: 'ticketsAnswered', n: 100 }, 4],
      [{ kind: 'prestiges', n: 5 }, 2],
      [{ kind: 'automation', id: 'csv', n: 150 }, 5],
      [{ kind: 'automation', id: 'scim', n: 1 }, 0],
      [{ kind: 'automationsTotal', n: 300 }, 7],
      [{ kind: 'upgradesTotal', n: 25 }, 0],
      [{ kind: 'customers', n: 10 }, 0],
    ];
    for (const [c, have] of cases) {
      expect(progress(s, c), c.kind).toEqual({ have, need: 'n' in c ? c.n : 0 });
    }
  });

  it('caps at need', () => {
    expect(progress({ ...base(), clicks: 50 }, { kind: 'clicks', n: 10 })).toEqual({ have: 10, need: 10 });
  });

  it('is null for conditions without a counter', () => {
    expect(progress(base(), { kind: 'totalEarned', kp: 1e9 })).toBeNull();
    expect(progress(base(), { kind: 'kps', kp: 1e5 })).toBeNull();
  });

  it('does not mutate its input', () => {
    const s = base();
    const snap = JSON.stringify(s);
    progress(s, { kind: 'automationsTotal', n: 300 });
    expect(JSON.stringify(s)).toBe(snap);
  });
});

describe('progress text', () => {
  it('groups digits the Swedish way', async () => {
    const { T } = await import('../src/content/texts');
    expect(T.achievements.progress(7, 10)).toBe('7 av 10');
    expect(T.achievements.progress(1234, 25_000)).toBe('1\u00a0234 av 25\u00a0000');
  });
});
