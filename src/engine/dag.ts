import { DIRS, cellKey, inBounds } from './geom.js';
import type { Layout, Piece } from '../types.js';

export type BlockerDAG = Map<Piece, Set<Piece>>;

/**
 * Build the blocker DAG for a tiled layout: piece B is "blocked by" A iff
 * A has a cell on B's escape path. The puzzle is solvable iff this DAG
 * is acyclic — releasing in topological order always works.
 */
export function buildBlockerDAG(layout: Layout): BlockerDAG {
  const cellToPiece = new Map<string, Piece>();
  for (const p of layout) for (const c of p.cells) cellToPiece.set(cellKey(c.x, c.y), p);
  const blockers: BlockerDAG = new Map();
  for (const b of layout) {
    const set = new Set<Piece>();
    const { dx, dy } = DIRS[b.dir];
    let cx = b.tip.x + dx;
    let cy = b.tip.y + dy;
    while (inBounds(cx, cy)) {
      const a = cellToPiece.get(cellKey(cx, cy));
      if (a && a !== b) set.add(a);
      cx += dx;
      cy += dy;
    }
    blockers.set(b, set);
  }
  return blockers;
}

export function dagHasCycle(blockers: BlockerDAG): boolean {
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const state = new Map<Piece, number>();
  for (const p of blockers.keys()) state.set(p, WHITE);
  function dfs(p: Piece): boolean {
    state.set(p, GRAY);
    for (const blocker of blockers.get(p)!) {
      const s = state.get(blocker);
      if (s === GRAY) return true;
      if (s === WHITE && dfs(blocker)) return true;
    }
    state.set(p, BLACK);
    return false;
  }
  for (const p of blockers.keys()) {
    if (state.get(p) === WHITE && dfs(p)) return true;
  }
  return false;
}

/** Find any cycle in the blocker DAG; returns its pieces as an array, or null. */
export function findAnyCycle(blockers: BlockerDAG): Piece[] | null {
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const state = new Map<Piece, number>();
  const stack: Piece[] = [];
  for (const p of blockers.keys()) state.set(p, WHITE);
  let cycleFound: Piece[] | null = null;
  function dfs(p: Piece): void {
    state.set(p, GRAY);
    stack.push(p);
    for (const b of blockers.get(p)!) {
      if (cycleFound) return;
      const s = state.get(b);
      if (s === GRAY) {
        const idx = stack.indexOf(b);
        cycleFound = stack.slice(idx);
        return;
      }
      if (s === WHITE) dfs(b);
    }
    state.set(p, BLACK);
    stack.pop();
  }
  for (const p of blockers.keys()) {
    if (state.get(p) === WHITE && !cycleFound) dfs(p);
    if (cycleFound) break;
  }
  return cycleFound;
}
