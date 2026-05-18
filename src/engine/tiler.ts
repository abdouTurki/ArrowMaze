import { GRID_W, GRID_H, MAX_WALK, cellKey, shuffle } from './geom.js';
import { TEMPLATES, piecesFromTemplateAtTip } from './templates.js';
import { escapePathOwnClear, pieceOptions } from './escape.js';
import { buildBlockerDAG, dagHasCycle } from './dag.js';
import { randomWalkPiece } from './randomWalk.js';
import type { Cell, Layout, Piece } from '../types.js';

/**
 * Build a solid rectangle silhouette of width x height as a row-major string
 * array. Each '#' cell must be covered by exactly one piece.
 */
export function makeRectangleRows(w: number, h: number): string[] {
  const rows: string[] = [];
  const row = '#'.repeat(w);
  for (let y = 0; y < h; y++) rows.push(row);
  return rows;
}

/** Tile a silhouette. Returns an ordered list of placed pieces, or null. */
export function tileSilhouette(rows: string[]): Layout | null {
  const filled = new Set<string>();
  const baseList: Cell[] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (rows[y][x] === '#') {
        filled.add(cellKey(x, y));
        baseList.push({ x, y });
      }
    }
  }
  const big = baseList.length > 250;
  const attempts = big ? 50 : 30;
  const deadlineMs = big ? 200 : 200;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const cellList = shuffle(baseList.slice());
    const placedCells = new Set<string>();
    const placed: Piece[] = [];
    const deadline = Date.now() + deadlineMs;
    const result = tileBacktrack(cellList, filled, placedCells, placed, 0, deadline);
    if (result) return result;
  }
  return null;
}

/**
 * Backtracking tiler. Picks the first uncovered cell (scan order) and tries
 * placements that cover it. Order is randomized per call for variety.
 */
export function tileBacktrack(
  cellList: Cell[],
  filled: Set<string>,
  placedCells: Set<string>,
  placed: Piece[],
  startIdx: number,
  deadline: number,
): Layout | null {
  if (Date.now() > deadline) return null;
  let i = startIdx;
  while (i < cellList.length && placedCells.has(cellKey(cellList[i].x, cellList[i].y))) i++;
  if (i === cellList.length) return [...placed];
  const C = cellList[i];

  const candidates: Piece[] = [];

  for (const tpl of TEMPLATES) {
    for (const tc of tpl.cells) {
      const tx = C.x - tc.x;
      const ty = C.y - tc.y;
      const piece = piecesFromTemplateAtTip(tpl, tx, ty);
      let ok = true;
      for (const c of piece.cells) {
        if (!filled.has(cellKey(c.x, c.y))) {
          ok = false;
          break;
        }
        if (placedCells.has(cellKey(c.x, c.y))) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      if (!escapePathOwnClear(piece)) continue;
      candidates.push(piece);
    }
  }

  const RANDOM_WALK_TRIES = MAX_WALK >= 14 ? 70 : 40;
  const sigs = new Set<string>();
  for (const c of candidates) {
    sigs.add(
      c.cells
        .map((cc) => `${cc.x},${cc.y}`)
        .sort()
        .join('|') + `:${c.tip.x},${c.tip.y}:${c.dir}`,
    );
  }
  for (let k = 0; k < RANDOM_WALK_TRIES; k++) {
    const L = 2 + Math.floor(Math.random() * (MAX_WALK - 1));
    const walk = randomWalkPiece(C, L, filled, placedCells);
    if (!walk) continue;
    for (const opt of pieceOptions(walk)) {
      const sig =
        opt.cells
          .map((cc) => `${cc.x},${cc.y}`)
          .sort()
          .join('|') + `:${opt.tip.x},${opt.tip.y}:${opt.dir}`;
      if (sigs.has(sig)) continue;
      sigs.add(sig);
      candidates.push(opt);
    }
  }

  shuffle(candidates);
  candidates.sort((a, b) => {
    const aOne = a.cells.length === 1 ? 1 : 0;
    const bOne = b.cells.length === 1 ? 1 : 0;
    return aOne - bOne;
  });

  const MAX_CANDIDATES = 80;
  const tries = candidates.slice(0, MAX_CANDIDATES);

  for (const piece of tries) {
    if (Date.now() > deadline) return null;
    piece.id = placed.length;
    for (const c of piece.cells) placedCells.add(cellKey(c.x, c.y));
    placed.push(piece);
    if (!dagHasCycle(buildBlockerDAG(placed))) {
      const r = tileBacktrack(cellList, filled, placedCells, placed, i + 1, deadline);
      if (r) return r;
    }
    placed.pop();
    for (const c of piece.cells) placedCells.delete(cellKey(c.x, c.y));
  }
  return null;
}
