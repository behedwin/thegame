import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/content/registry';
import { claimEvent, getEvent, spawnEvent } from '../src/core/events';
import { createInitialState } from '../src/core/state';

const NEW_IDS = ['meeting-email', 'reading-service-down', 'mojibake', 'schedule-changed', 'classes-renamed'];

describe('002 more random events', () => {
  it('registers all five new events', () => {
    for (const id of NEW_IDS) expect(getEvent(id), id).toBeDefined();
    expect(EVENTS.length).toBeGreaterThanOrEqual(6);
  });

  it('event ids are unique', () => {
    const ids = EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('effects match the task spec', () => {
    expect(getEvent('meeting-email')!.effect).toEqual({ kind: 'clickMult', mult: 5, durationMs: 20_000 });
    expect(getEvent('reading-service-down')!.effect.kind).toBe('lump');
    expect(getEvent('mojibake')!.effect).toEqual({ kind: 'prodMult', mult: 2, durationMs: 60_000 });
  });

  it('every new event can be spawned and claimed', () => {
    for (const id of NEW_IDS) {
      const s0 = createInitialState(0);
      const r = claimEvent(spawnEvent(s0, getEvent(id)!));
      expect(r.event?.id).toBe(id);
      expect(r.state.eventsClaimed).toBe(s0.eventsClaimed + 1);
      if (r.event!.effect.kind === 'lump') expect(r.granted.gt(0)).toBe(true);
      else expect(r.state.buffs.some((b) => b.source === id)).toBe(true);
    }
  });
});
