import { VIEW_W, PAD } from '../config.js';
import type { Direction } from '../types.js';

export { VIEW_W, PAD };

export const DIRS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const DIR_KEYS: Direction[] = ['up', 'down', 'left', 'right'];

export let GRID_W = 14;
export let GRID_H = 22;
export let VIEW_H = 1000;
export let CELL = (VIEW_W - 2 * PAD) / GRID_W;
export let STROKE = CELL * 0.22;
export let HEAD_LEN = CELL * 0.55;
export let HEAD_HALF = CELL * 0.32;
export let MAX_WALK = 10;

export function setGeometry(w: number, h: number): void {
  GRID_W = w;
  GRID_H = h;
  CELL = (VIEW_W - 2 * PAD) / GRID_W;
  VIEW_H = 2 * PAD + CELL * GRID_H;
  STROKE = CELL * 0.22;
  HEAD_LEN = CELL * 0.55;
  HEAD_HALF = CELL * 0.32;
  // Cap walk length to the grid — a 4×6 board can't host a 10-step walk.
  const maxDim = Math.max(w, h);
  const cap = maxDim >= 20 ? 18 : maxDim >= 14 ? 14 : 10;
  MAX_WALK = Math.max(3, Math.min(cap, maxDim - 1));
}

export const inBounds = (x: number, y: number): boolean =>
  x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;

export const cellKey = (x: number, y: number): string => `${x},${y}`;

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cellCenter(x: number, y: number): { cx: number; cy: number } {
  return { cx: PAD + x * CELL + CELL / 2, cy: PAD + y * CELL + CELL / 2 };
}

setGeometry(GRID_W, GRID_H);
