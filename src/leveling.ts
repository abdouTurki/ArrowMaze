export type Band = 'easy' | 'medium' | 'hard' | 'xl';

export interface LevelGrid {
  w: number;
  h: number;
  band: Band;
  isBoss: boolean;
}

/**
 * Grid size for a given level number. Difficulty scales with level:
 *   1–9   easy   (8×12)
 *   10–19 medium (11×17)
 *   20–29 hard   (14×22)
 *   30+   XL     (17×27)
 * Every 10th level (10, 20, 30, …) is a boss — visually flagged on the map.
 */
export function getLevelGrid(level: number): LevelGrid {
  const isBoss = level > 0 && level % 10 === 0;
  if (level <= 9) return { w: 8, h: 12, band: 'easy', isBoss };
  if (level <= 19) return { w: 11, h: 17, band: 'medium', isBoss };
  if (level <= 29) return { w: 14, h: 22, band: 'hard', isBoss };
  return { w: 17, h: 27, band: 'xl', isBoss };
}

export function getBandLabel(band: Band): string {
  switch (band) {
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
