import { describe, it, expect, beforeEach } from 'vitest';
import { setGeometry } from '../src/engine/geom.js';
import { buildBlockerDAG, dagHasCycle, findAnyCycle } from '../src/engine/dag.js';
import type { Piece } from '../src/types.js';

describe('DAG cycle detection', () => {
  beforeEach(() => {
    setGeometry(10, 10);
  });

  it('acyclic layout reports no cycle', () => {
    // Two side-by-side pieces facing OUTWARD (away from each other).
    //   piece A: cells (0,0)-(1,0), tip (0,0) facing left  → escape goes left, off-board
    //   piece B: cells (2,0)-(3,0), tip (3,0) facing right → escape goes right, off-board
    // Neither blocks the other.
    const a: Piece = {
      cells: [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ],
      tip: { x: 0, y: 0 },
      dir: 'left',
    };
    const b: Piece = {
      cells: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      tip: { x: 3, y: 0 },
      dir: 'right',
    };
    const dag = buildBlockerDAG([a, b]);
    expect(dagHasCycle(dag)).toBe(false);
    expect(findAnyCycle(dag)).toBeNull();
  });

  it('two pieces blocking each other report a cycle', () => {
    // Two pieces facing INTO each other; each blocks the other's escape.
    const a: Piece = {
      cells: [{ x: 0, y: 0 }],
      tip: { x: 0, y: 0 },
      dir: 'right',
    };
    const b: Piece = {
      cells: [{ x: 2, y: 0 }],
      tip: { x: 2, y: 0 },
      dir: 'left',
    };
    const dag = buildBlockerDAG([a, b]);
    expect(dagHasCycle(dag)).toBe(true);
    const cycle = findAnyCycle(dag);
    expect(cycle).not.toBeNull();
    expect(cycle!.length).toBeGreaterThan(0);
  });

  it('single isolated piece is acyclic', () => {
    const a: Piece = {
      cells: [{ x: 0, y: 0 }],
      tip: { x: 0, y: 0 },
      dir: 'right',
    };
    const dag = buildBlockerDAG([a]);
    expect(dagHasCycle(dag)).toBe(false);
    expect(findAnyCycle(dag)).toBeNull();
  });

  it('linear blocker chain A→B→C is acyclic', () => {
    // A at (0,0) facing right, blocked by B at (2,0)
    // B at (2,0) facing right, blocked by C at (4,0)
    // C at (4,0) facing right, off-board
    const a: Piece = { cells: [{ x: 0, y: 0 }], tip: { x: 0, y: 0 }, dir: 'right' };
    const b: Piece = { cells: [{ x: 2, y: 0 }], tip: { x: 2, y: 0 }, dir: 'right' };
    const c: Piece = { cells: [{ x: 4, y: 0 }], tip: { x: 4, y: 0 }, dir: 'right' };
    const dag = buildBlockerDAG([a, b, c]);
    expect(dagHasCycle(dag)).toBe(false);
    expect(findAnyCycle(dag)).toBeNull();
  });
});
