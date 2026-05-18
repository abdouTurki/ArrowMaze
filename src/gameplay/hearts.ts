import { state, savePersisted } from '../state.js';
import { GRID_W, GRID_H } from '../engine/geom.js';
import { heartsEl } from '../dom.js';
import { haptic } from '../haptic.js';
import { stopTimer } from './timer.js';
import { renderHearts } from '../render/hud.js';

let onLostAllLives: (() => void) | null = null;
export function setOnLostAllLives(fn: () => void): void {
  onLostAllLives = fn;
}

export function loseLife(): void {
  if (state.gameOver) return;
  const idx = state.lives - 1;
  state.lives = Math.max(0, state.lives - 1);
  state.flawlessStreak = 0;
  const hs = heartsEl.querySelectorAll('.heart');
  const heartEl = hs[idx];
  if (heartEl) {
    heartEl.classList.add('losing');
    setTimeout(() => {
      heartEl.classList.remove('losing');
      heartEl.classList.add('lost');
    }, 550);
  }
  haptic(40);
  if (state.lives === 0) {
    state.gameOver = true;
    stopTimer();
    state.failTimeout = window.setTimeout(() => {
      state.failTimeout = null;
      if (onLostAllLives) onLostAllLives();
    }, 720);
  }
}

export function addHeart(): void {
  if (state.lives >= 3) return;
  state.lives++;
  renderHearts();
  const hs = heartsEl.querySelectorAll('.heart');
  const h = hs[state.lives - 1];
  if (h) {
    h.classList.add('losing');
    setTimeout(() => h.classList.remove('losing'), 350);
  }
  savePersisted();
}

export function bestKey(): string {
  return `${GRID_W}x${GRID_H}`;
}
