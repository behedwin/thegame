import { describe, expect, it } from 'vitest';
import { splitMaxed } from '../src/ui/shop';

describe('073 splitMaxed', () => {
  it('moves maxed ids last and keeps the order otherwise', () => {
    const maxed = new Set(['b', 'd']);
    expect(splitMaxed(['a', 'b', 'c', 'd', 'e'], (id) => maxed.has(id))).toEqual({
      open: ['a', 'c', 'e'],
      done: ['b', 'd'],
    });
  });

  it('keeps everything open when nothing is maxed', () => {
    expect(splitMaxed(['a', 'b'], () => false)).toEqual({ open: ['a', 'b'], done: [] });
  });

  it('handles a fully maxed list', () => {
    expect(splitMaxed(['a', 'b'], () => true)).toEqual({ open: [], done: ['a', 'b'] });
  });
});
