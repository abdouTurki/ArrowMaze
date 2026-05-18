import { describe, it, expect } from 'vitest';
import { getLevelGrid, getBandLabel, computeStars, getParTimeMs } from '../src/leveling.js';

describe('getLevelGrid', () => {
  it('levels 1-9 are easy (8x12)', () => {
    for (const l of [1, 2, 5, 9]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(8);
      expect(g.h).toBe(12);
      expect(g.band).toBe('easy');
    }
  });

  it('levels 10-19 are medium (11x17)', () => {
    for (const l of [10, 11, 15, 19]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(11);
      expect(g.h).toBe(17);
      expect(g.band).toBe('medium');
    }
  });

  it('levels 20-29 are hard (14x22)', () => {
    for (const l of [20, 25, 29]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(14);
      expect(g.h).toBe(22);
      expect(g.band).toBe('hard');
    }
  });

  it('levels 30+ are XL (17x27)', () => {
    for (const l of [30, 47, 100]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(17);
      expect(g.h).toBe(27);
      expect(g.band).toBe('xl');
    }
  });

  it('every 10th level is a boss', () => {
    for (const l of [10, 20, 30, 40, 50, 100]) {
      expect(getLevelGrid(l).isBoss).toBe(true);
    }
  });

  it('non-multiples-of-10 are not bosses', () => {
    for (const l of [1, 5, 11, 19, 21, 29, 31, 99]) {
      expect(getLevelGrid(l).isBoss).toBe(false);
    }
  });
});

describe('getBandLabel', () => {
  it('returns human-readable labels', () => {
    expect(getBandLabel('easy')).toBe('Easy');
    expect(getBandLabel('medium')).toBe('Medium');
    expect(getBandLabel('hard')).toBe('Hard');
    expect(getBandLabel('xl')).toBe('XL');
  });
});

describe('getParTimeMs', () => {
  it('scales linearly with piece count', () => {
    expect(getParTimeMs(10)).toBe(20000);
    expect(getParTimeMs(45)).toBe(90000);
    expect(getParTimeMs(70)).toBe(140000);
  });
});

describe('computeStars', () => {
  it('returns 0 for a not-cleared run', () => {
    expect(computeStars(false, false, 1000, 10)).toBe(0);
    expect(computeStars(false, true, 1000, 10)).toBe(0);
  });

  it('returns 1 for a clear that used a hint', () => {
    expect(computeStars(true, true, 1000, 10)).toBe(1);
    // hint used disqualifies the time bonus too
    expect(computeStars(true, true, 1, 10)).toBe(1);
  });

  it('returns 2 for a clear without a hint but over par time', () => {
    const par = getParTimeMs(10); // 20000ms
    expect(computeStars(true, false, par + 1000, 10)).toBe(2);
    expect(computeStars(true, false, 999999, 10)).toBe(2);
  });

  it('returns 3 for a clear without a hint and under par time', () => {
    const par = getParTimeMs(10); // 20000ms
    expect(computeStars(true, false, par - 1, 10)).toBe(3);
    expect(computeStars(true, false, 1000, 10)).toBe(3);
    expect(computeStars(true, false, par, 10)).toBe(3); // equal is allowed
  });

  it('durationMs <= 0 does not earn the time star', () => {
    expect(computeStars(true, false, 0, 10)).toBe(2);
    expect(computeStars(true, false, -1, 10)).toBe(2);
  });
});
