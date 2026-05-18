import { DIRS, DIR_KEYS, cellKey, shuffle } from './geom.js';
import type { Cell, Direction, Piece } from '../types.js';

/**
 * Random-walk piece generator. Generates a snake-shaped piece: any connected
 * sequence of cells where each cell is adjacent (4-neighbor) to the next, with
 * no self-overlap. The tip can be EITHER end of the walk; we choose randomly.
 * The tip's `dir` is determined by the direction from tip-1 to tip.
 */
export function randomWalkPiece(
  C: Cell,
  length: number,
  filled: Set<string>,
  placedCells: Set<string>,
): Piece | null {
  if (length < 1) return null;
  if (length === 1) {
    const dir = DIR_KEYS[Math.floor(Math.random() * 4)];
    return { cells: [{ x: C.x, y: C.y }], tip: { x: C.x, y: C.y }, dir };
  }

  const cPos = Math.floor(Math.random() * length);
  const used = new Set<string>();
  used.add(cellKey(C.x, C.y));
  const walk: Cell[] = new Array(length);
  walk[cPos] = { x: C.x, y: C.y };

  // Walk forward (cPos+1, cPos+2, ...)
  let cur: Cell = walk[cPos];
  let prev: Direction | null = null;
  for (let i = cPos + 1; i < length; i++) {
    const dirs = shuffle([...DIR_KEYS]);
    let placed = false;
    for (const d of dirs) {
      if (prev && DIRS[d].dx === -DIRS[prev].dx && DIRS[d].dy === -DIRS[prev].dy) continue;
      const nx = cur.x + DIRS[d].dx;
      const ny = cur.y + DIRS[d].dy;
      const k = cellKey(nx, ny);
      if (!filled.has(k)) continue;
      if (placedCells.has(k)) continue;
      if (used.has(k)) continue;
      walk[i] = { x: nx, y: ny };
      used.add(k);
      cur = walk[i];
      prev = d;
      placed = true;
      break;
    }
    if (!placed) return null;
  }

  // Walk backward (cPos-1, cPos-2, ...)
  cur = walk[cPos];
  prev = null;
  for (let i = cPos - 1; i >= 0; i--) {
    const dirs = shuffle([...DIR_KEYS]);
    let placed = false;
    for (const d of dirs) {
      if (prev && DIRS[d].dx === -DIRS[prev].dx && DIRS[d].dy === -DIRS[prev].dy) continue;
      const nx = cur.x + DIRS[d].dx;
      const ny = cur.y + DIRS[d].dy;
      const k = cellKey(nx, ny);
      if (!filled.has(k)) continue;
      if (placedCells.has(k)) continue;
      if (used.has(k)) continue;
      walk[i] = { x: nx, y: ny };
      used.add(k);
      cur = walk[i];
      prev = d;
      placed = true;
      break;
    }
    if (!placed) return null;
  }

  const tipAtEnd = Math.random() < 0.5;
  let tipIdx, prevIdx;
  if (tipAtEnd) {
    tipIdx = length - 1;
    prevIdx = length - 2;
  } else {
    tipIdx = 0;
    prevIdx = 1;
  }
  const tip = walk[tipIdx];
  const beforeTip = walk[prevIdx];
  const ddx = tip.x - beforeTip.x;
  const ddy = tip.y - beforeTip.y;
  let dir: Direction | null = null;
  for (const k of DIR_KEYS) {
    if (DIRS[k].dx === ddx && DIRS[k].dy === ddy) {
      dir = k;
      break;
    }
  }
  if (!dir) return null;

  const cells = tipAtEnd ? walk.slice() : walk.slice().reverse();
  return { cells, tip: { x: tip.x, y: tip.y }, dir };
}
