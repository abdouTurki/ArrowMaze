import { state, savePersisted } from '../state.js';
import { DIFFICULTIES } from '../config.js';
import { applyGridSizeToDOM } from '../render/board.js';
import { tryStartLevel } from '../gameplay/level.js';
import type { DifficultyKey } from '../types.js';

const overlay = (): HTMLElement => document.getElementById('diffOverlay')!;

export function showDiffModal(): void {
  document.querySelectorAll<HTMLElement>('.diff-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.diff === state.currentDifficulty);
  });
  overlay().classList.add('show');
}

export function hideDiffModal(): void {
  overlay().classList.remove('show');
}

export function chooseDifficulty(diffKey: string): void {
  if (!(DIFFICULTIES as Record<string, unknown>)[diffKey]) return;
  const key = diffKey as DifficultyKey;
  const isSame = key === state.currentDifficulty;
  state.currentDifficulty = key;
  const d = DIFFICULTIES[key];
  applyGridSizeToDOM(d.w, d.h);
  savePersisted();
  hideDiffModal();
  tryStartLevel(isSame ? state.currentLevel : 1);
}
