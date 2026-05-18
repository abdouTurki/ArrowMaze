import { state } from '../state.js';
import { DIRS, GRID_H, GRID_W, cellKey, inBounds } from '../engine/geom.js';
import { sfxRelease, sfxBad, sfxErase } from '../audio/sfx.js';
import { redrawPieceWithCells } from '../render/board.js';
import { dismissTutorial } from '../render/tutorial.js';
import { updateHUD } from '../render/hud.js';
import { loseLife } from './hearts.js';
import type { Cell, Piece } from '../types.js';

export function liveCellSet(): Set<string> {
  const s = new Set<string>();
  state.pieces.forEach((p) => {
    if (p.gone) return;
    p.cells.forEach((c) => s.add(cellKey(c.x, c.y)));
  });
  return s;
}

export function pathIsClear(piece: Piece): boolean {
  const { dx, dy } = DIRS[piece.dir];
  const live = liveCellSet();
  piece.cells.forEach((c) => live.delete(cellKey(c.x, c.y)));
  let cx = piece.tip.x + dx;
  let cy = piece.tip.y + dy;
  while (inBounds(cx, cy)) {
    if (live.has(cellKey(cx, cy))) return false;
    cx += dx;
    cy += dy;
  }
  return true;
}

let onWinCheck: (() => void) | null = null;
export function setOnWinCheck(fn: () => void): void {
  onWinCheck = fn;
}

export function handlePieceClick(piece: Piece): void {
  dismissTutorial();
  if (state.erasing) eraseArrow(piece);
  else tryRelease(piece);
}

export function tryRelease(piece: Piece): void {
  if (state.gameOver) return;
  if (piece.gone || piece.releasing) return;
  state.moves++;
  if (!pathIsClear(piece)) {
    sfxBad();
    piece.el?.classList.add('shake');
    setTimeout(() => piece.el?.classList.remove('shake'), 440);
    loseLife();
    updateHUD();
    return;
  }
  sfxRelease();
  piece.gone = true;
  piece.releasing = true;
  piece.el?.classList.add('releasing');

  const { dx, dy } = DIRS[piece.dir];
  const pathCells: Cell[] = [...piece.cells];
  let cx = piece.tip.x + dx;
  let cy = piece.tip.y + dy;
  let extension = 0;
  while (extension < Math.max(GRID_W, GRID_H) + 2) {
    pathCells.push({ x: cx, y: cy });
    cx += dx;
    cy += dy;
    extension++;
  }

  animateSnakeWalk(piece, pathCells);
  updateHUD();
}

function animateSnakeWalk(piece: Piece, pathCells: Cell[]): void {
  const myToken = state.levelToken;
  const N = piece.cells.length;
  const total = pathCells.length;
  const steps = total - N;
  const cellMs = 45;
  const startTime = performance.now();
  let lastDrawn = -1;

  function frame(now: number): void {
    if (state.levelToken !== myToken) return;
    const elapsed = now - startTime;
    const t = Math.min(steps, Math.floor(elapsed / cellMs));
    if (elapsed >= steps * cellMs) {
      if (piece.el && piece.el.parentNode) {
        piece.el.parentNode.removeChild(piece.el);
      }
      if (onWinCheck) onWinCheck();
      return;
    }
    if (t !== lastDrawn) {
      lastDrawn = t;
      const newCells = pathCells.slice(t, t + N);
      redrawPieceWithCells(piece, newCells);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function eraseArrow(piece: Piece): void {
  if (piece.gone || piece.releasing) return;
  sfxErase();
  piece.gone = true;
  piece.releasing = true;
  state.erasersLeft--;
  state.erasing = false;
  if (piece.el) {
    piece.el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    piece.el.style.opacity = '0';
    piece.el.style.transform = 'scale(0.7)';
    piece.el.style.transformOrigin = 'center';
  }
  setTimeout(() => {
    if (piece.el && piece.el.parentNode) piece.el.parentNode.removeChild(piece.el);
    if (onWinCheck) onWinCheck();
  }, 360);
  updateHUD();
}
