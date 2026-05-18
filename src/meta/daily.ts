import { state } from '../state.js';
import { DAILY_GRID } from '../config.js';
import { dailySeed, mulberry32, todayKey } from '../engine/prng.js';
import { applyGridSizeToDOM } from '../render/board.js';
import { showToast } from '../render/toast.js';
import { refillEnergyFromClock, spendEnergy, showOutOfEnergyPrompt } from './energy.js';
import { loadLevel } from '../gameplay/level.js';

export function dailyAvailable(): boolean {
  return state.lastDailyDate !== todayKey();
}

export function startDailyChallenge(): void {
  if (!dailyAvailable()) {
    showToast({
      title: "Today's daily is done!",
      sub: 'Come back tomorrow.',
      icon: '☀',
    });
    return;
  }
  refillEnergyFromClock();
  if (state.energy <= 0) {
    showOutOfEnergyPrompt(startDailyChallenge);
    return;
  }
  spendEnergy();
  state.dailyMode = true;
  applyGridSizeToDOM(DAILY_GRID.w, DAILY_GRID.h);
  const realRandom = Math.random;
  Math.random = mulberry32(dailySeed());
  loadLevel(1);
  setTimeout(() => {
    Math.random = realRandom;
  }, 80);
  updateDailyBadge();
}

export function exitDailyMode(): void {
  state.dailyMode = false;
  updateDailyBadge();
  loadLevel(state.currentLevel);
}

export function retryDaily(): void {
  const realRandom = Math.random;
  Math.random = mulberry32(dailySeed());
  loadLevel(state.currentLevel);
  setTimeout(() => {
    Math.random = realRandom;
  }, 80);
}

export function updateDailyBadge(): void {
  const btn = document.getElementById('dailyBtn');
  const streakEl = document.getElementById('dailyStreak') as HTMLElement | null;
  if (!btn) return;
  btn.classList.toggle('available', dailyAvailable() && !state.dailyMode);
  if (streakEl) {
    if (state.streak > 0) {
      streakEl.style.display = 'inline-block';
      streakEl.textContent = String(state.streak);
    } else {
      streakEl.style.display = 'none';
    }
  }
}
