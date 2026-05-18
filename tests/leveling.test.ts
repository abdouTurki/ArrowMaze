import { describe, it, expect } from 'vitest';
import { getLevelGrid, getBandLabel, computeStars, getParTimeMs } from '../src/leveling.js';

describe('getLevelGrid', () => {
  it('levels 1-5 are tiny (4x6)', () => {
    for (const l of [1, 2, 3, 4, 5]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(4);
      expect(g.h).toBe(6);
      expect(g.band).toBe('tiny');
    }
  });

  it('levels 6-10 step to 5x8', () => {
    for (const l of [6, 7, 8, 9, 10]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(5);
      expect(g.h).toBe(8);
      expect(g.band).toBe('tiny');
    }
  });

  it('levels 11-15 step to 6x9', () => {
    expect(getLevelGrid(11)).toMatchObject({ w: 6, h: 9, band: 'tiny' });
    expect(getLevelGrid(15)).toMatchObject({ w: 6, h: 9, band: 'tiny' });
  });

  it('levels 16-20 step to 7x11 (easy band starts)', () => {
    expect(getLevelGrid(16)).toMatchObject({ w: 7, h: 11, band: 'easy' });
    expect(getLevelGrid(20)).toMatchObject({ w: 7, h: 11, band: 'easy' });
  });

  it('level 21-25 is 8x12 (old "easy" size)', () => {
    expect(getLevelGrid(21)).toMatchObject({ w: 8, h: 12, band: 'easy' });
    expect(getLevelGrid(25)).toMatchObject({ w: 8, h: 12, band: 'easy' });
  });

  it('level 36-40 is 11x17 (old "medium" size)', () => {
    expect(getLevelGrid(36)).toMatchObject({ w: 11, h: 17, band: 'medium' });
    expect(getLevelGrid(40)).toMatchObject({ w: 11, h: 17, band: 'medium' });
  });

  it('level 51-55 is 14x21 (≈ old "hard" size)', () => {
    expect(getLevelGrid(51)).toMatchObject({ w: 14, h: 21, band: 'hard' });
    expect(getLevelGrid(55)).toMatchObject({ w: 14, h: 21, band: 'hard' });
  });

  it('level 71+ caps at 18x27 (xl)', () => {
    for (const l of [71, 100, 500]) {
      const g = getLevelGrid(l);
      expect(g.w).toBe(18);
      expect(g.h).toBe(27);
      expect(g.band).toBe('xl');
    }
  });

  it('grid grows monotonically with level', () => {
    let lastW = 0;
    for (let l = 1; l <= 80; l++) {
      const g = getLevelGrid(l);
      expect(g.w).toBeGreaterThanOrEqual(lastW);
      lastW = g.w;
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
  it('returns human-readable labels for all 5 bands', () => {
    expect(getBandLabel('tiny')).toBe('Tiny');
    expect(getBandLabel('easy')).toBe('Easy');
    expect(getBandLabel('medium')).toBe('Medium');
    expect(getBandLabel('hard')).toBe('Hard');
    expect(getBandLabel('xl')).toBe('XL');
  });
});

describe('getParTimeMs', () => {
  it('scales linearly with piece count', () => {
    expect(getParTimeMs(6)).toBe(12000);
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
    expect(computeStars(true, true, 1, 10)).toBe(1);
  });

  it('returns 2 for a clear without a hint but over par time', () => {
    const par = getParTimeMs(10);
    expect(computeStars(true, false, par + 1000, 10)).toBe(2);
    expect(computeStars(true, false, 999999, 10)).toBe(2);
  });

  it('returns 3 for a clear without a hint and under par time', () => {
    const par = getParTimeMs(10);
    expect(computeStars(true, false, par - 1, 10)).toBe(3);
    expect(computeStars(true, false, 1000, 10)).toBe(3);
    expect(computeStars(true, false, par, 10)).toBe(3);
  });

  it('durationMs <= 0 does not earn the time star', () => {
    expect(computeStars(true, false, 0, 10)).toBe(2);
    expect(computeStars(true, false, -1, 10)).toBe(2);
  });
});
