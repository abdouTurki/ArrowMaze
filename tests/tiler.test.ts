import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setGeometry, cellKey } from '../src/engine/geom.js';
import { tileSilhouette, makeRectangleRows } from '../src/engine/tiler.js';
import { buildBlockerDAG, dagHasCycle } from '../src/engine/dag.js';
import { escapePathOwnClear } from '../src/engine/escape.js';
import { mulberry32 } from '../src/engine/prng.js';
import { DIFFICULTIES } from '../src/config.js';
import type { DifficultyKey } from '../src/types.js';

const realRandom = Math.random;

function withSeed<T>(seed: number, fn: () => T): T {
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = realRandom;
  }
}

describe('tileSilhouette', () => {
  beforeEach(() => {
    setGeometry(8, 12);
  });
  afterEach(() => {
    Math.random = realRandom;
  });

  it('produces a non-null layout for easy 8x12', () => {
    const layout = withSeed(1, () => tileSilhouette(makeRectangleRows(8, 12)));
    expect(layout).not.toBeNull();
    expect(layout!.length).toBeGreaterThan(0);
  });

  const difficulties: DifficultyKey[] = ['easy', 'medium', 'hard'];
  for (const key of difficulties) {
    const { w, h } = DIFFICULTIES[key];
    describe(`difficulty ${key} (${w}x${h})`, () => {
      it('layout is always acyclic over 30 seeded runs', () => {
        let failures = 0;
        for (let seed = 1; seed <= 30; seed++) {
          setGeometry(w, h);
          const layout = withSeed(seed, () => tileSilhouette(makeRectangleRows(w, h)));
          if (!layout) {
            failures++;
            continue;
          }
          const dag = buildBlockerDAG(layout);
          if (dagHasCycle(dag)) {
            throw new Error(`Cycle in layout for seed=${seed} on ${key}`);
          }
        }
        expect(failures).toBeLessThan(3);
      });

      it('every cell is covered exactly once over 10 seeded runs', () => {
        for (let seed = 100; seed < 110; seed++) {
          setGeometry(w, h);
          const layout = withSeed(seed, () => tileSilhouette(makeRectangleRows(w, h)));
          if (!layout) continue;
          const seen = new Set<string>();
          let total = 0;
          for (const p of layout) {
            for (const c of p.cells) {
              const k = cellKey(c.x, c.y);
              expect(seen.has(k), `Duplicate cell ${k} (seed=${seed})`).toBe(false);
              seen.add(k);
              total++;
              expect(c.x).toBeGreaterThanOrEqual(0);
              expect(c.x).toBeLessThan(w);
              expect(c.y).toBeGreaterThanOrEqual(0);
              expect(c.y).toBeLessThan(h);
            }
          }
          expect(total).toBe(w * h);
        }
      });

      it('every piece has its tip in its own cells over 10 seeded runs', () => {
        for (let seed = 200; seed < 210; seed++) {
          setGeometry(w, h);
          const layout = withSeed(seed, () => tileSilhouette(makeRectangleRows(w, h)));
          if (!layout) continue;
          for (const p of layout) {
            const tipInCells = p.cells.some((c) => c.x === p.tip.x && c.y === p.tip.y);
            expect(tipInCells, `Tip not in cells (seed=${seed})`).toBe(true);
          }
        }
      });

      it('every piece passes escapePathOwnClear over 10 seeded runs', () => {
        for (let seed = 300; seed < 310; seed++) {
          setGeometry(w, h);
          const layout = withSeed(seed, () => tileSilhouette(makeRectangleRows(w, h)));
          if (!layout) continue;
          for (const p of layout) {
            expect(
              escapePathOwnClear(p),
              `Own-body escape blocked (seed=${seed})`,
            ).toBe(true);
          }
        }
      });
    });
  }
});
