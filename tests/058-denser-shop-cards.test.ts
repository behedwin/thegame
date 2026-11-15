import { describe, expect, it } from 'vitest';
import { QUOTE_NEAR_PCT, showMilestoneQuote } from '../src/ui/shop';

// Milestones are 25, 50, 100 and 250 (BALANCE.milestones).
describe('058 showMilestoneQuote', () => {
  it('shows the quote when the next milestone is near', () => {
    expect(QUOTE_NEAR_PCT).toBe(80);
    expect(showMilestoneQuote(45, false)).toBe(true); // 80 % of the way 25 → 50
    expect(showMilestoneQuote(49, false)).toBe(true);
    expect(showMilestoneQuote(240, false)).toBe(true);
  });

  it('hides the quote when the next milestone is far away', () => {
    expect(showMilestoneQuote(25, false)).toBe(false);
    expect(showMilestoneQuote(30, false)).toBe(false);
    expect(showMilestoneQuote(44, false)).toBe(false);
    expect(showMilestoneQuote(120, false)).toBe(false);
  });

  it('shows the quote right after a purchase, even far from the next milestone', () => {
    expect(showMilestoneQuote(30, true)).toBe(true);
    expect(showMilestoneQuote(50, true)).toBe(true);
  });

  it('never shows a quote when every milestone is reached', () => {
    expect(showMilestoneQuote(250, false)).toBe(false);
    expect(showMilestoneQuote(400, true)).toBe(false);
  });

  it('has nothing to show before the first milestone', () => {
    // Near 25 the progress is high, but no milestone name exists yet; the card shows an empty quote then.
    expect(showMilestoneQuote(0, false)).toBe(false);
  });
});
