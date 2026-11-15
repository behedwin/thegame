import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, EVENTS } from '../src/content/registry';
import { createInitialState, type GameState } from '../src/core';
import { eventCardText } from '../src/ui/effects';

const fresh = (): GameState => createInitialState(0);
const producing = (): GameState => ({ ...fresh(), timeMs: 10_000, automations: { [AUTOMATIONS[0]!.id]: 10 } });
const event = (id: string) => EVENTS.find((e) => e.id === id)!;

describe('event card effect line (task 047)', () => {
  it('shows a lump event as KP right away, with the minimum when nothing is produced', () => {
    const { line, label } = eventCardText(fresh(), event('classes-renamed'));
    expect(line).toBe('+15 KP direkt');
    expect(label).toBe("Någon döpte om alla klasser till 'Test'. +15 KP direkt. Tryck för att lösa!");
  });

  it('shows a temporary bonus with an estimate once there is production', () => {
    const { line, label } = eventCardText(producing(), event('friday-update'));
    expect(line).toMatch(/^Produktion ×2 i 60 s · ≈ \+[\d\s,]+ KP$/);
    expect(label).toContain(line);
    expect(label.startsWith('Leverantören släppte en uppdatering på en fredag. ')).toBe(true);
  });

  it('leaves out the estimate before anything is produced', () => {
    expect(eventCardText(fresh(), event('friday-update')).line).toBe('Produktion ×2 i 60 s');
  });
});
