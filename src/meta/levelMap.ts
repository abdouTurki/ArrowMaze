import { state } from '../state.js';
import { getLevelGrid, getBandLabel } from '../leveling.js';
import { tryStartLevel } from '../gameplay/level.js';

const overlay = (): HTMLElement => document.getElementById('levelMapOverlay')!;

export function openLevelMap(): void {
  renderLevelMap();
  overlay().classList.add('show');
}

export function closeLevelMap(): void {
  overlay().classList.remove('show');
}

/**
 * Render the grid of level cards. Shows up to maxLevelUnlocked+6 levels
 * (preview the next bosses/tier transitions) so the player sees what's coming.
 */
export function renderLevelMap(): void {
  const list = document.getElementById('levelMapList');
  const summary = document.getElementById('levelMapSummary');
  if (!list) return;
  list.innerHTML = '';
  // Always show at least 50 levels (or further if the player has progressed).
  // Locked levels appear with a 🔒 so the player can see what's coming.
  const lastShown = Math.max(state.maxLevelUnlocked + 10, 50);
  const totalStars = Object.values(state.levelStars).reduce((a, b) => a + b, 0);
  if (summary) {
    summary.textContent = `Unlocked: ${state.maxLevelUnlocked}  ·  Stars: ${totalStars}`;
  }

  for (let lvl = 1; lvl <= lastShown; lvl++) {
    const grid = getLevelGrid(lvl);
    const stars = state.levelStars[lvl] || 0;
    const isUnlocked = lvl <= state.maxLevelUnlocked;
    const isCurrent = lvl === state.currentLevel;
    const isNext = lvl === state.maxLevelUnlocked && stars === 0;

    const card = document.createElement('button');
    card.className = 'lvl-card';
    if (grid.isBoss) card.classList.add('boss');
    if (!isUnlocked) card.classList.add('locked');
    if (isCurrent) card.classList.add('current');
    if (isNext) card.classList.add('next');
    card.classList.add(`band-${grid.band}`);
    card.disabled = !isUnlocked;

    const starStr = [0, 1, 2].map((i) => (i < stars ? '★' : '☆')).join('');
    card.innerHTML = `
      <div class="lvl-num">${grid.isBoss ? '👑' : ''}${lvl}</div>
      <div class="lvl-band">${getBandLabel(grid.band)}</div>
      <div class="lvl-stars">${isUnlocked ? starStr : '🔒'}</div>
    `;
    card.addEventListener('click', () => {
      if (!isUnlocked) return;
      closeLevelMap();
      tryStartLevel(lvl);
    });
    list.appendChild(card);
  }
}
