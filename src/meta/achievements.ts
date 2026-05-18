import { state, savePersisted } from '../state.js';
import { ACHIEVEMENTS } from '../config.js';
import { refreshTopBar, bumpCoinPill } from '../render/hud.js';
import { showToast } from '../render/toast.js';
import { haptic } from '../haptic.js';
import type { WinContext } from '../types.js';

export function unlockAchievement(id: string): void {
  if (state.achievements[id]) return;
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (!def) return;
  state.achievements[id] = { unlockedAt: Date.now() };
  state.coins += def.reward;
  savePersisted();
  refreshTopBar();
  bumpCoinPill();
  showToast({ title: def.name, sub: 'Achievement unlocked', reward: def.reward, icon: def.icon });
  haptic([10, 40, 80]);
}

export function checkAchievements(ctx: Partial<WinContext>): void {
  if (ctx && ctx.won) {
    unlockAchievement('firstWin');
    if (ctx.flawless) unlockAchievement('flawless');
    if (state.flawlessStreak >= 3) unlockAchievement('flawless3');
    if (ctx.durationMs && ctx.durationMs > 0 && ctx.durationMs < 30000)
      unlockAchievement('speedDemon');
    if (!ctx.usedHint) unlockAchievement('noHints');
    if (state.levelsCleared >= 100) unlockAchievement('centurion');
  }
  if (state.currentLevel >= 10) unlockAchievement('level10');
  if (state.currentLevel >= 25) unlockAchievement('level25');
  if (state.currentLevel >= 50) unlockAchievement('level50');
  if (state.streak >= 3) unlockAchievement('streak3');
  if (state.streak >= 7) unlockAchievement('streak7');
  if (state.spentCoinsTotal >= 100) unlockAchievement('bigSpender');
}

export function renderAchievementsList(): void {
  const list = document.getElementById('achList');
  if (!list) return;
  list.innerHTML = '';
  ACHIEVEMENTS.forEach((def) => {
    const unlocked = !!state.achievements[def.id];
    const row = document.createElement('div');
    row.className = 'ach-row ' + (unlocked ? 'unlocked' : 'locked');
    row.innerHTML = `
      <div class="ach-icon">${def.icon}</div>
      <div class="ach-meta">
        <div class="ach-name">${def.name}</div>
        <div class="ach-desc">${def.desc}</div>
      </div>
      <div class="ach-reward">+${def.reward}</div>
    `;
    list.appendChild(row);
  });
}
