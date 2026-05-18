import { state } from '../state.js';

export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function tickTimer(): void {
  if (state.gameOver || !state.levelStartedAt) return;
  const elapsed = Math.floor((Date.now() - state.levelStartedAt) / 1000);
  const el = document.getElementById('timerText');
  if (el) el.textContent = formatTime(elapsed);
}

export function startTimer(): void {
  stopTimer();
  state.levelStartedAt = Date.now();
  const el = document.getElementById('timerText');
  if (el) el.textContent = '0s';
  state.timerInterval = window.setInterval(tickTimer, 1000);
}

export function stopTimer(): void {
  if (state.timerInterval !== null) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

let pausedAt = 0;
export function installVisibilityPauseHandler(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.timerInterval !== null) {
        pausedAt = Date.now();
        stopTimer();
      }
    } else if (pausedAt && !state.gameOver && state.levelStartedAt) {
      state.levelStartedAt += Date.now() - pausedAt;
      pausedAt = 0;
      state.timerInterval = window.setInterval(tickTimer, 1000);
    }
  });
}
