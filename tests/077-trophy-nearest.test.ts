import { describe, expect, it } from 'vitest';
import type { AchievementDef } from '../src/content/types';
import { createInitialState, nearestAchievement, type GameState } from '../src/core';

const def = (id: string, condition: AchievementDef['condition']): AchievementDef =>
  ({ id, order: 0, name: id, desc: id, condition }) as AchievementDef;

const state = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(1_000),
  clicks: 8,
  eventsClaimed: 3,
  ticketsAnswered: 90,
  ...over,
});

describe('nearestAchievement', () => {
  it('picks the locked trophy with the highest have / need', () => {
    const list = [
      def('clicks', { kind: 'clicks', n: 100 }), // 8 %
      def('tickets', { kind: 'ticketsAnswered', n: 100 }), // 90 %
      def('events', { kind: 'eventsClaimed', n: 4 }), // 75 %
    ];
    expect(nearestAchievement(state(), list)).toEqual({ def: list[1], have: 90, need: 100 });
  });

  it('ignores taken trophies and conditions without a counter', () => {
    const list = [
      def('kp', { kind: 'totalEarned', kp: 1 }),
      def('kps', { kind: 'kps', kp: 1e12 }),
      def('tickets', { kind: 'ticketsAnswered', n: 100 }),
      def('events', { kind: 'eventsClaimed', n: 4 }),
    ];
    const got = nearestAchievement(state({ achievements: ['tickets'] }), list);
    expect(got?.def.id).toBe('events');
  });

  it('keeps content order on ties', () => {
    const list = [def('a', { kind: 'eventsClaimed', n: 6 }), def('b', { kind: 'clicks', n: 16 })];
    expect(nearestAchievement(state(), list)?.def.id).toBe('a');
  });

  it('gives nothing when no countable trophy is locked or started', () => {
    const list = [def('kp', { kind: 'totalEarned', kp: 1e30 }), def('tickets', { kind: 'ticketsAnswered', n: 100 })];
    expect(nearestAchievement(state({ achievements: ['tickets'] }), list)).toBeNull();
    expect(nearestAchievement(state({ clicks: 0 }), [def('c', { kind: 'clicks', n: 10 })])).toBeNull();
    expect(nearestAchievement(state(), [])).toBeNull();
  });

  it('uses the real trophy list by default', () => {
    const got = nearestAchievement(state());
    expect(got).not.toBeNull();
    expect(got!.have).toBeLessThan(got!.need);
  });
});
