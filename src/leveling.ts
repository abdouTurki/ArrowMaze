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

/**
 * Grid size for a given level number. Each level adds exactly one cell to
 * one dimension — alternating height and width — so every level is
 * genuinely bigger than the previous one. When width caps at 18, the
 * overflow is redirected to height. Once both cap (level 36+), grids
 * stay at 18×27.
 *
 *   L1   4×6    L11  9×11   L21  14×16   L31  18×22
 *   L2   4×7    L12  9×12   L22  14×17   L32  18×23
 *   L3   5×7    L13  10×12  L23  15×17   L33  18×24
 *   L4   5×8    L14  10×13  L24  15×18   L34  18×25
 *   L5   6×8    L15  11×13  L25  16×18   L35  18×26
 *   L6   6×9    L16  11×14  L26  16×19   L36  18×27 (cap)
 *   L7   7×9    L17  12×14  L27  17×19   L37+ 18×27
 *   L8   7×10   L18  12×15  L28  17×20
 *   L9   8×10   L19  13×15  L29  18×20
 *   L10  8×11   L20  13×16  L30  18×21
 *
 * 36 distinct grid sizes before the cap. Every 10th level is a boss —
 * visually flagged on the map.
 */
export function getLevelGrid(level: number): LevelGrid {
  const step = Math.max(0, level - 1);
  let w = START_W + Math.floor(step / 2);
  let h = START_H + Math.ceil(step / 2);
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
