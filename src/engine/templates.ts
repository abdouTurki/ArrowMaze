import { DIRS, DIR_KEYS } from './geom.js';
import type { Cell, Direction, Piece } from '../types.js';

export interface Template {
  cells: Cell[];
  dir: Direction;
}

/**
 * Templates for short pieces (1-3 cells): straights of length 1..3 and L-shapes
 * of length 3 (one bend), all 4 rotations each. Tip is at relative (0, 0).
 * Longer / more exotic shapes come from randomWalkPiece().
 */
export function generateTemplates(): Template[] {
  const tpl: Template[] = [];
  for (const dir of DIR_KEYS) {
    const { dx, dy } = DIRS[dir];
    for (const L of [1, 2, 3]) {
      const cells: Cell[] = [];
      for (let i = L - 1; i >= 0; i--) {
        cells.push({ x: -i * dx, y: -i * dy });
      }
      tpl.push({ cells, dir });
    }
    const perps = [
      { px: -dy, py: dx },
      { px: dy, py: -dx },
    ];
    for (const p of perps) {
      const cells: Cell[] = [
        { x: -dx + p.px, y: -dy + p.py },
        { x: -dx, y: -dy },
        { x: 0, y: 0 },
      ];
      tpl.push({ cells, dir });
    }
  }
  return tpl;
}

export const TEMPLATES: readonly Template[] = generateTemplates();

export function piecesFromTemplateAtTip(tpl: Template, tx: number, ty: number): Piece {
  return {
    cells: tpl.cells.map((c) => ({ x: c.x + tx, y: c.y + ty })),
    tip: { x: tx, y: ty },
    dir: tpl.dir,
  };
}
