export type Band = 'tiny' | 'easy' | 'medium' | 'hard' | 'xl';

export interface LevelGrid {
  w: number;
  h: number;
  band: Band;
  isBoss: boolean;
}

const START_W = 4;
const START_H = 6;
const MAX_W = 18;
const MAX_H = 27;
/** Cells added to one dimension per level (alternating w / h). */
const CELLS_PER_STEP = 3;

/**
 * Grid size for a given level number. Each level adds CELLS_PER_STEP cells
 * to one dimension — alternating height (odd-stepped levels) and width
 * (even-stepped levels) — so every level is meaningfully bigger than the
 * previous one. When width caps at 18, the overflow redirects to height;
 * once both cap (level 13+), grids stay at 18×27.
 *
 *   L1   4×6           L11  18×22 (w cap, overflow → h)
 *   L2   4×9   (h+3)   L12  18×25 (h+3)
 *   L3   7×9   (w+3)   L13  18×27 (cap)
 *   L4   7×12  (h+3)   L14+ 18×27
 *   L5   10×12 (w+3)
 *   L6   10×15 (h+3)
 *   L7   13×15 (w+3)
 *   L8   13×18 (h+3)
 *   L9   16×18 (w+3)
 *   L10  16×21 (h+3)  [boss]
 *
 * Every 10th level is a boss — visually flagged on the map.
 */
export function getLevelGrid(level: number): LevelGrid {
  const step = Math.max(0, level - 1);
  let w = START_W + Math.floor(step / 2) * CELLS_PER_STEP;
  let h = START_H + Math.ceil(step / 2) * CELLS_PER_STEP;
  if (w > MAX_W) {
    h += w - MAX_W;
    w = MAX_W;
  }
  h = Math.min(MAX_H, h);
  const isBoss = level > 0 && level % 10 === 0;
  return { w, h, band: getBand(w), isBoss };
}

function getBand(w: number): Band {
  if (w <= 6) return 'tiny';
  if (w <= 9) return 'easy';
  if (w <= 12) return 'medium';
  if (w <= 15) return 'hard';
  return 'xl';
}

export function getBandLabel(band: Band): string {
  switch (band) {
    case 'tiny':
      return 'Tiny';
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    case 'xl':
      return 'XL';
  }
}

/** 3-star par time: ~2 seconds per piece. Tuned to be challenging-but-achievable. */
export function getParTimeMs(pieceCount: number): number {
  return pieceCount * 2000;
}

/**
 * Compute star rating (0–3) for a finished run.
 *   1 star  — cleared the level
 *   2 stars — cleared without using a hint
 *   3 stars — cleared without a hint AND under par time
 */
export function computeStars(
  cleared: boolean,
  usedHint: boolean,
  durationMs: number,
  pieceCount: number,
): number {
  if (!cleared) return 0;
  let stars = 1;
  if (!usedHint) stars++;
  if (!usedHint && durationMs > 0 && durationMs <= getParTimeMs(pieceCount)) stars++;
  return stars;
}
