import { DIRS, DIR_KEYS, cellKey, inBounds } from './geom.js';
import type { Piece, PieceOption } from '../types.js';

/**
 * Placement-time escape check: piece must not face its own body, and must
 * not face previously-placed pieces. The placedCells check biases tip
 * directions, but it's also what makes tiles reliably acyclic.
 */
export function escapePathPlacedClear(piece: Piece, placedCells: Set<string>): boolean {
  const { dx, dy } = DIRS[piece.dir];
  const own = new Set(piece.cells.map((c) => cellKey(c.x, c.y)));
  let cx = piece.tip.x + dx;
  let cy = piece.tip.y + dy;
  while (inBounds(cx, cy)) {
    const k = cellKey(cx, cy);
    if (own.has(k)) return false;
    if (placedCells.has(k)) return false;
    cx += dx;
    cy += dy;
  }
  return true;
}

/** Own-body-only escape check, used after flipping a piece's direction. */
export function escapePathOwnClear(piece: Piece | PieceOption): boolean {
  const { dx, dy } = DIRS[piece.dir];
  const own = new Set(piece.cells.map((c) => cellKey(c.x, c.y)));
  let cx = piece.tip.x + dx;
  let cy = piece.tip.y + dy;
  while (inBounds(cx, cy)) {
    if (own.has(cellKey(cx, cy))) return false;
    cx += dx;
    cy += dy;
  }
  return true;
}

/**
 * Compute every valid (cells, tip, dir) option for a piece. Each piece
 * has up to 2 endpoint choices (tip at end A or end B). 1-cell pieces
 * have 4 choices (any direction). Options that put own body in front of
 * tip are filtered out.
 */
export function pieceOptions(piece: Piece): PieceOption[] {
  const cells = piece.cells;
  const N = cells.length;
  const opts: PieceOption[] = [];
  if (N === 1) {
    for (const k of DIR_KEYS) {
      opts.push({ cells: cells.slice(), tip: cells[0], dir: k });
    }
    return opts;
  }
  const dxA = cells[N - 1].x - cells[N - 2].x;
  const dyA = cells[N - 1].y - cells[N - 2].y;
  let dirA = null;
  for (const k of DIR_KEYS) {
    if (DIRS[k].dx === dxA && DIRS[k].dy === dyA) {
      dirA = k;
      break;
    }
  }
  if (dirA) {
    const o: PieceOption = { cells: cells.slice(), tip: cells[N - 1], dir: dirA };
    if (escapePathOwnClear(o)) opts.push(o);
  }
  const dxB = cells[0].x - cells[1].x;
  const dyB = cells[0].y - cells[1].y;
  let dirB = null;
  for (const k of DIR_KEYS) {
    if (DIRS[k].dx === dxB && DIRS[k].dy === dyB) {
      dirB = k;
      break;
    }
  }
  if (dirB) {
    const o: PieceOption = { cells: cells.slice().reverse(), tip: cells[0], dir: dirB };
    if (escapePathOwnClear(o)) opts.push(o);
  }
  return opts;
}

export function applyOption(piece: Piece, opt: PieceOption): void {
  piece.cells = opt.cells;
  piece.tip = opt.tip;
  piece.dir = opt.dir;
}
