import { state } from '../state.js';
import { DIFFICULTIES } from '../config.js';
import { dailySeed, mulberry32, todayKey } from '../engine/prng.js';
import { applyGridSizeToDOM } from '../render/board.js';
import { showToast } from '../render/toast.js';
import { refillEnergyFromClock, spendEnergy, showOutOfEnergyPrompt } from './energy.js';
import { loadLevel } from '../gameplay/level.js';
import type { DifficultyKey } from '../types.js';

let savedDifficulty: DifficultyKey | null = null;

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
  savedDifficulty = state.currentDifficulty;
  const d = DIFFICULTIES.medium;
  applyGridSizeToDOM(d.w, d.h);
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
  if (savedDifficulty && (DIFFICULTIES as Record<string, unknown>)[savedDifficulty]) {
    const d = DIFFICULTIES[savedDifficulty];
    if (savedDifficulty !== state.currentDifficulty) {
      state.currentDifficulty = savedDifficulty;
      applyGridSizeToDOM(d.w, d.h);
    }
  }
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
