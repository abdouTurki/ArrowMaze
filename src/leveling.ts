export type Band = 'tiny' | 'easy' | 'medium' | 'hard' | 'xl';

export interface LevelGrid {
  w: number;
  h: number;
  band: Band;
  isBoss: boolean;
}

const MIN_W = 4;
const MAX_W = 18;
const MAX_H = 28;
const LEVELS_PER_STEP = 5;

/**
 * Grid size for a given level number. Smooth ramp: 1 column added every 5
 * levels (height tracks at 1.5×); caps at 18×28. Every 10th level is a boss
 * (visually flagged on the map).
 *
 *   L1–5    4×6   (tiny tutorial scale)
 *   L6–10   5×8
 *   L11–15  6×9
 *   L16–20  7×11
 *   L21–25  8×12  (≈ old "easy")
 *   L26–30  9×14
 *   L31–35  10×15
 *   L36–40  11×17 (≈ old "medium")
 *   L41–45  12×18
 *   L46–50  13×20
 *   L51–55  14×21 (≈ old "hard")
 *   L56–60  15×23
 *   L61–65  16×24
 *   L66–70  17×26
 *   L71+    18×27 (cap)
 *
 * ~70 levels of clear progression before the cap.
 */
export function getLevelGrid(level: number): LevelGrid {
  const w = Math.min(MAX_W, MIN_W + Math.floor((level - 1) / LEVELS_PER_STEP));
  const h = Math.min(MAX_H, Math.round(w * 1.5));
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
