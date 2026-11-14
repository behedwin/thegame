import { describe, expect, it } from 'vitest';
import { CONFETTI_MS, MAX_CONFETTI, effectsFor, spawnConfetti, stepConfetti } from '../src/ui/celebrate';

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('confetti physics', () => {
  it('never spawns more particles than the cap', () => {
    expect(spawnConfetti(500, 100, 100, seeded(1))).toHaveLength(MAX_CONFETTI);
    expect(spawnConfetti(30, 100, 100, seeded(1))).toHaveLength(30);
  });

  it('every particle dies or leaves the screen within the time limit', () => {
    for (const seed of [1, 2, 3, 42, 999]) {
      let bits = spawnConfetti(MAX_CONFETTI, 180, 300, seeded(seed));
      let t = 0;
      while (bits.length && t < CONFETTI_MS + 100) {
        bits = stepConfetti(bits, 16, 640);
        t += 16;
      }
      expect(bits).toEqual([]);
      expect(t).toBeLessThanOrEqual(CONFETTI_MS + 16);
    }
  });

  it('falls under gravity and does not mutate its input', () => {
    const bits = spawnConfetti(10, 100, 100, seeded(7));
    const copy = structuredClone(bits);
    const next = stepConfetti(bits, 100, 10_000);
    expect(bits).toEqual(copy);
    next.forEach((b, i) => expect(b.vy).toBeGreaterThan(bits[i]!.vy));
  });

  it('is deterministic with injected randomness', () => {
    expect(spawnConfetti(20, 0, 0, seeded(5))).toEqual(spawnConfetti(20, 0, 0, seeded(5)));
  });
});

describe('celebration → effect mapping', () => {
  it('maps each celebration to its effects', () => {
    expect(effectsFor('buy')).toEqual(['press', 'burst']);
    expect(effectsFor('bulkBuy')).toEqual(['press', 'bigBurst']);
    expect(effectsFor('milestone')).toEqual(['sheen', 'stamp', 'confetti']);
    expect(effectsFor('customer')).toEqual(['stamp', 'shake']);
    expect(effectsFor('prestige')).toEqual(['overlay', 'zoom']);
  });

  it('reduced motion drops confetti, shake, zoom and bursts but keeps the moments', () => {
    expect(effectsFor('milestone', true)).toEqual(['sheen', 'stamp']);
    expect(effectsFor('customer', true)).toEqual(['stamp']);
    expect(effectsFor('prestige', true)).toEqual(['overlay']);
    expect(effectsFor('buy', true)).toEqual(['press']);
  });
});
