import { applyOption, pieceOptions } from './escape.js';
import { buildBlockerDAG, findAnyCycle } from './dag.js';
import type { Layout, PieceOption } from '../types.js';

/**
 * Randomly reassign each piece's tip direction. Tries multiple random
 * initial draws; on each, runs a greedy best-flip repair loop. Returns
 * true on success, leaves the layout in its last attempted state otherwise.
 */
export function randomizeDirections(layout: Layout): boolean {
  const opts: PieceOption[][] = layout.map((p) => pieceOptions(p));
  const DRAWS = 6;
  for (let draw = 0; draw < DRAWS; draw++) {
    for (let i = 0; i < layout.length; i++) {
      const o = opts[i];
      if (o.length === 0) continue;
      applyOption(layout[i], o[Math.floor(Math.random() * o.length)]);
    }
    if (repairCycles(layout, opts, 250)) return true;
  }
  return false;
}

export function repairCycles(
  layout: Layout,
  opts: PieceOption[][],
  maxSteps: number,
): boolean {
  for (let step = 0; step < maxSteps; step++) {
    const cycle = findAnyCycle(buildBlockerDAG(layout));
    if (!cycle) return true;
    let bestPiece = null;
    let bestOpt: PieceOption | null = null;
    let bestScore: number = cycle.length;
    for (const piece of cycle) {
      const idx = layout.indexOf(piece);
      const choices = opts[idx];
      if (choices.length < 2) continue;
      const orig = { cells: piece.cells, tip: piece.tip, dir: piece.dir };
      const curDir = piece.dir;
      for (const opt of choices) {
        if (opt.dir === curDir && opt.cells === orig.cells) continue;
        applyOption(piece, opt);
        const nc = findAnyCycle(buildBlockerDAG(layout));
        const score = nc ? nc.length : -1;
        if (score < bestScore) {
          bestScore = score;
          bestPiece = piece;
          bestOpt = opt;
        }
        piece.cells = orig.cells;
        piece.tip = orig.tip;
        piece.dir = orig.dir;
      }
    }
    if (bestPiece && bestOpt) {
      applyOption(bestPiece, bestOpt);
      if (bestScore === -1) return true;
    } else {
      return false;
    }
  }
  return false;
}
