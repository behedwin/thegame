import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { createInitialState, progress, type GameState } from '../src/core';
import { trophyGroups } from '../src/ui/achievements';

const fresh = (): GameState => createInitialState(0);
/** State with the given counters where every trophy already met counts as taken, as in a real game. */
const real = (over: Partial<GameState>): GameState => {
  const s = { ...fresh(), ...over };
  return { ...s, achievements: ACHIEVEMENTS.filter((a) => share(s, a.id) >= 1).map((a) => a.id) };
};
const share = (s: GameState, id: string): number => {
  const p = progress(s, ACHIEVEMENTS.find((a) => a.id === id)!.condition);
  return p ? p.have / p.need : -1;
};

describe('trophyGroups sorts locked trophies by progress (121)', () => {
  it('puts the closest countable trophy first', () => {
    const s = real({ eventsClaimed: 24 });
    const g = trophyGroups(s);
    expect(g.locked[0]!.def.id).toBe('brandkaren');
  });

  it('orders locked trophies by share done, highest first, counterless last', () => {
    const s = { ...fresh(), eventsClaimed: 24, clicks: 3000, bestEventStreak: 2 };
    const shares = trophyGroups(s).locked.map((t) => share(s, t.def.id));
    for (let i = 1; i < shares.length; i++) expect(shares[i]!).toBeLessThanOrEqual(shares[i - 1]!);
    expect(shares).toContain(-1);
    expect(shares[shares.length - 1]).toBe(-1);
  });

  it('keeps registry order among ties', () => {
    const s = { ...fresh(), clicks: 1 };
    const locked = trophyGroups(s).locked.map((t) => t.def.id);
    const reg = ACHIEVEMENTS.map((a) => a.id);
    const groups = new Map<number, string[]>();
    for (const id of locked) groups.set(share(s, id), [...(groups.get(share(s, id)) ?? []), id]);
    for (const ids of groups.values()) expect(ids).toEqual(reg.filter((id) => ids.includes(id)));
  });

  it('leaves the taken group in registry order', () => {
    const some = ACHIEVEMENTS.filter((_, i) => i % 3 === 0).map((a) => a.id);
    const g = trophyGroups({ ...fresh(), achievements: some, eventsClaimed: 24 });
    expect(g.taken.map((t) => t.def.id)).toEqual(some);
  });

  it('does not change the progress labels', () => {
    const g = trophyGroups(real({ eventsClaimed: 24 }));
    expect(g.locked[0]!.label).toContain('24');
  });
});
