import { describe, expect, it } from 'vitest';
import { COMPACT_AT, heroMode } from '../src/ui/fx';

const ROOM = 1000; // plenty of list to scroll
const SHRINK = 150;

describe('057 heroMode', () => {
  it('starts big at the top and goes compact past the threshold', () => {
    expect(heroMode(0, 'big', ROOM, SHRINK)).toBe('big');
    expect(heroMode(COMPACT_AT, 'big', ROOM, SHRINK)).toBe('big');
    expect(heroMode(COMPACT_AT + 1, 'big', ROOM, SHRINK)).toBe('compact');
  });

  it('stays compact until the list is back at the very top (hysteresis)', () => {
    for (const top of [1, 5, COMPACT_AT, COMPACT_AT + 1, 400]) expect(heroMode(top, 'compact', ROOM, SHRINK)).toBe('compact');
    expect(heroMode(0, 'compact', ROOM, SHRINK)).toBe('big');
  });

  it('does not flip back and forth while scrolling around the threshold', () => {
    let mode: 'big' | 'compact' = 'big';
    let flips = 0;
    for (const top of [10, 20, 26, 22, 25, 23, 30, 24, 26, 2, 1, 3]) {
      const next = heroMode(top, mode, ROOM, SHRINK);
      if (next !== mode) flips++;
      mode = next;
    }
    expect(flips).toBe(1);
    expect(mode).toBe('compact');
  });

  it('stays big when the list is too short to remain scrolled after shrinking', () => {
    // Shrinking the map grows the list by SHRINK px; with little to scroll it would snap to the top and bounce back.
    expect(heroMode(60, 'big', SHRINK + COMPACT_AT, SHRINK)).toBe('big');
    expect(heroMode(60, 'big', SHRINK + COMPACT_AT + 1, SHRINK)).toBe('compact');
  });
});
