import { describe, expect, it } from 'vitest';
import { FOCUSES } from '../src/content/registry';
import { T } from '../src/content/texts';
import { DEFAULT_FOCUS, isUntriedFocus } from '../src/core';

describe('072 untried focus badge', () => {
  it('never marks the default focus', () => {
    expect(isUntriedFocus(DEFAULT_FOCUS, [])).toBe(false);
  });

  it('marks focuses missing from focusesPlayed', () => {
    expect(isUntriedFocus('cloud', [])).toBe(true);
    expect(isUntriedFocus('budget', ['cloud'])).toBe(true);
  });

  it('does not mark played focuses, and none when all are played', () => {
    expect(isUntriedFocus('cloud', ['cloud'])).toBe(false);
    const all = FOCUSES.map((f) => f.id).filter((id) => id !== DEFAULT_FOCUS);
    expect(FOCUSES.filter((f) => isUntriedFocus(f.id, all))).toEqual([]);
  });

  it('has a Swedish label', () => {
    expect(T.focus.untried).toBe('Inte provad');
  });
});
