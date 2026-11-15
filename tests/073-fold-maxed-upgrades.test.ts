import { describe, expect, it } from 'vitest';
import { UPGRADES } from '../src/content/registry';
import { createInitialState, splitMaxed, type GameState } from '../src/core';

const [a, b, c, d, e] = UPGRADES.map((u) => u.id) as [string, string, string, string, string];
const maxedState = (...ids: string[]): GameState => {
  const s = createInitialState(0);
  return { ...s, upgrades: Object.fromEntries(ids.map((id) => [id, UPGRADES.find((u) => u.id === id)!.maxLevel])) };
};

describe('073 splitMaxed', () => {
  it('moves maxed ids last and keeps the order otherwise', () => {
    expect(splitMaxed(maxedState(b, d), [a, b, c, d, e])).toEqual({ open: [a, c, e], done: [b, d] });
  });

  it('keeps everything open when nothing is maxed', () => {
    expect(splitMaxed(maxedState(), [a, b])).toEqual({ open: [a, b], done: [] });
  });

  it('handles a fully maxed list', () => {
    expect(splitMaxed(maxedState(a, b), [a, b])).toEqual({ open: [], done: [a, b] });
  });
});
