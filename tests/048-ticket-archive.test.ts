import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, Decimal, type GameState } from '../src/core';
import { fmt } from '../src/ui/format';
import { inboxArchiveLine } from '../src/ui/inbox';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState, label: string) => statRows(s).find((r) => r.label === label)?.value;

describe('ticket archive', () => {
  it('stats show answered tickets right after events', () => {
    const labels = statRows(fresh()).map((r) => r.label);
    expect(labels.indexOf(T.stats.tickets)).toBe(labels.indexOf(T.stats.events) + 1);
    expect(value(fresh(), T.stats.tickets)).toBe('0');
    expect(value({ ...fresh(), ticketsAnswered: 1234 }, T.stats.tickets)).toBe(fmt(new Decimal(1234)));
  });

  it('inbox archive line: none for 0, singular for 1, plural otherwise', () => {
    expect(inboxArchiveLine(fresh())).toBeNull();
    expect(inboxArchiveLine({ ...fresh(), ticketsAnswered: 1 })).toBe('Du har löst 1 ärende. Skolorna tackar.');
    expect(inboxArchiveLine({ ...fresh(), ticketsAnswered: 12 })).toBe('Du har löst 12 ärenden. Skolorna tackar.');
  });
});
