import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setGeometry, cellKey, DIRS } from '../src/engine/geom.js';
import { randomWalkPiece } from '../src/engine/randomWalk.js';
import { mulberry32 } from '../src/engine/prng.js';

const realRandom = Math.random;

describe('randomWalkPiece', () => {
  beforeEach(() => {
    setGeometry(10, 10);
    Math.random = mulberry32(42);
  });
  afterEach(() => {
    Math.random = realRandom;
  });

  it('returns a single-cell piece when length=1', () => {
    const filled = new Set<string>();
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) filled.add(cellKey(x, y));
    const piece = randomWalkPiece({ x: 5, y: 5 }, 1, filled, new Set());
    expect(piece).not.toBeNull();
    expect(piece!.cells).toHaveLength(1);
    expect(piece!.cells[0]).toEqual({ x: 5, y: 5 });
    expect(piece!.tip).toEqual({ x: 5, y: 5 });
  });

  it('returns null for length < 1', () => {
    const filled = new Set<string>();
    expect(randomWalkPiece({ x: 0, y: 0 }, 0, filled, new Set())).toBeNull();
    expect(randomWalkPiece({ x: 0, y: 0 }, -3, filled, new Set())).toBeNull();
  });

  it('produces a 4-cell connected walk with the seed cell included', () => {
    const filled = new Set<string>();
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) filled.add(cellKey(x, y));
    const piece = randomWalkPiece({ x: 5, y: 5 }, 4, filled, new Set());
    expect(piece).not.toBeNull();
    expect(piece!.cells).toHaveLength(4);
    const containsSeed = piece!.cells.some((c) => c.x === 5 && c.y === 5);
    expect(containsSeed).toBe(true);
    // Adjacent check
    for (let i = 0; i < piece!.cells.length - 1; i++) {
      const a = piece!.cells[i];
      const b = piece!.cells[i + 1];
      const dist = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      expect(dist, `cells[${i}] and [${i + 1}] not adjacent`).toBe(1);
    }
  });

  it('walk has no duplicate cells', () => {
    const filled = new Set<string>();
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) filled.add(cellKey(x, y));
    for (let seed = 1; seed <= 20; seed++) {
      Math.random = mulberry32(seed);
      const piece = randomWalkPiece({ x: 5, y: 5 }, 5, filled, new Set());
      if (!piece) continue;
      const seen = new Set<string>();
      for (const c of piece.cells) {
        const k = cellKey(c.x, c.y);
        expect(seen.has(k)).toBe(false);
        seen.add(k);
      }
    }
  });

  it('tip direction matches the step from cells[N-2] to cells[N-1]', () => {
    const filled = new Set<string>();
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++) filled.add(cellKey(x, y));
    for (let seed = 1; seed <= 10; seed++) {
      Math.random = mulberry32(seed);
      const piece = randomWalkPiece({ x: 5, y: 5 }, 4, filled, new Set());
      if (!piece) continue;
      const N = piece.cells.length;
      const tip = piece.cells[N - 1];
      const before = piece.cells[N - 2];
      const ddx = tip.x - before.x;
      const ddy = tip.y - before.y;
      expect(DIRS[piece.dir].dx).toBe(ddx);
      expect(DIRS[piece.dir].dy).toBe(ddy);
      expect(piece.tip).toEqual(tip);
    }
  });

  it('returns null when walk cannot find unobstructed neighbors', () => {
    // Pinhole grid: only the seed cell is filled. A 2-cell walk is impossible.
    const filled = new Set<string>();
    filled.add(cellKey(0, 0));
    const piece = randomWalkPiece({ x: 0, y: 0 }, 2, filled, new Set());
    expect(piece).toBeNull();
  });
});
