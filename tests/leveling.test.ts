import { describe, it, expect } from 'vitest';
import { getLevelGrid, getBandLabel, computeStars, getParTimeMs } from '../src/leveling.js';

describe('getLevelGrid', () => {
  it('starts at 4x6 on level 1', () => {
    expect(getLevelGrid(1)).toMatchObject({ w: 4, h: 6, band: 'tiny' });
  });

  it('matches the documented per-level table for levels 1-10', () => {
    expect(getLevelGrid(1)).toMatchObject({ w: 4, h: 6 });
    expect(getLevelGrid(2)).toMatchObject({ w: 4, h: 7 });
    expect(getLevelGrid(3)).toMatchObject({ w: 5, h: 7 });
    expect(getLevelGrid(4)).toMatchObject({ w: 5, h: 8 });
    expect(getLevelGrid(5)).toMatchObject({ w: 6, h: 8 });
    expect(getLevelGrid(6)).toMatchObject({ w: 6, h: 9 });
    expect(getLevelGrid(7)).toMatchObject({ w: 7, h: 9 });
    expect(getLevelGrid(8)).toMatchObject({ w: 7, h: 10 });
    expect(getLevelGrid(9)).toMatchObject({ w: 8, h: 10 });
    expect(getLevelGrid(10)).toMatchObject({ w: 8, h: 11 });
  });

  it('every non-capped level grows by exactly +1 in exactly one dimension', () => {
    let prev = getLevelGrid(1);
    for (let l = 2; l <= 36; l++) {
      const g = getLevelGrid(l);
      const dw = g.w - prev.w;
      const dh = g.h - prev.h;
      expect(dw + dh, `level ${l} grew by ${dw}+${dh}`).toBe(1);
      expect(dw === 0 || dh === 0).toBe(true);
      prev = g;
    }
  });

  it('total cell count strictly increases until the cap', () => {
    let lastCells = 0;
    for (let l = 1; l <= 36; l++) {
      const g = getLevelGrid(l);
      const cells = g.w * g.h;
      expect(cells, `level ${l} did not grow`).toBeGreaterThan(lastCells);
      lastCells = cells;
    }
  });

  it('width caps at 18 by level 29', () => {
    expect(getLevelGrid(29).w).toBe(18);
    for (let l = 29; l <= 100; l++) {
      expect(getLevelGrid(l).w).toBeLessThanOrEqual(18);
    }
  });

  it('hits the 18x27 cap at level 36 and stays there', () => {
    expect(getLevelGrid(36)).toMatchObject({ w: 18, h: 27 });
    for (const l of [37, 50, 100, 500]) {
      expect(getLevelGrid(l)).toMatchObject({ w: 18, h: 27 });
    }
  });

  it('bands cover the expected level ranges', () => {
    expect(getLevelGrid(1).band).toBe('tiny');
    expect(getLevelGrid(6).band).toBe('tiny'); // w=6
    expect(getLevelGrid(7).band).toBe('easy'); // w=7
    expect(getLevelGrid(12).band).toBe('easy'); // w=9
    expect(getLevelGrid(13).band).toBe('medium'); // w=10
    expect(getLevelGrid(18).band).toBe('medium'); // w=12
    expect(getLevelGrid(19).band).toBe('hard'); // w=13
    expect(getLevelGrid(24).band).toBe('hard'); // w=15
    expect(getLevelGrid(25).band).toBe('xl'); // w=16
    expect(getLevelGrid(100).band).toBe('xl');
  });

  it('every 10th level is flagged as a boss', () => {
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
