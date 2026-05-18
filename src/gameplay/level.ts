import { state, savePersisted } from '../state.js';
import { HINTS_PER_LEVEL, ERASERS_PER_LEVEL } from '../config.js';
import { GRID_H, GRID_W, VIEW_H, VIEW_W } from '../engine/geom.js';
import { tileSilhouette, makeRectangleRows } from '../engine/tiler.js';
import { boardEl, levelEl } from '../dom.js';
import { renderPieces } from '../render/board.js';
import { renderHearts, updateHUD } from '../render/hud.js';
import { maybeShowTutorialPointer } from '../render/tutorial.js';
import { maybeShowToolTip } from '../render/toast.js';
import { refillEnergyFromClock, spendEnergy, showOutOfEnergyPrompt } from '../meta/energy.js';
import { startTimer } from './timer.js';
import { updateHintBtn, updateEraserBtn } from './tools.js';
import { pathIsClear } from './play.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function showLoading(): void {
  boardEl.innerHTML = '';
  const txt = document.createElementNS(SVG_NS, 'text');
  txt.setAttribute('x', String(VIEW_W / 2));
  txt.setAttribute('y', String(VIEW_H / 2));
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('fill', '#8a90a3');
  txt.setAttribute('font-size', '28');
  txt.setAttribute('font-weight', '800');
  txt.style.letterSpacing = '0.15em';
  txt.textContent = 'GENERATING…';
  boardEl.appendChild(txt);
}

/**
 * Load a level. The silhouette is always a portrait rectangle of GRID_W ×
 * GRID_H; variety comes from the random tiling, not from picking shapes.
 */
export function loadLevel(level: number): void {
  if (level < 1) level = 1;
  if (!state.dailyMode) state.currentLevel = level;
  state.levelToken++;
  if (state.failTimeout !== null) {
    clearTimeout(state.failTimeout);
    state.failTimeout = null;
  }
  state.pieces = [];
  state.moves = 0;
  state.lives = 3;
  state.gameOver = false;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.erasersLeft = ERASERS_PER_LEVEL;
  state.erasing = false;
  state.usedHintThisLevel = false;
  state.revivedThisLevel = false;
  state.doubledRewardThisWin = false;
  state.levelStartTimeMs = Date.now();
  renderHearts();
  updateHintBtn();
  updateEraserBtn();

  showLoading();
  const myToken = state.levelToken;
  const rows = makeRectangleRows(GRID_W, GRID_H);
  setTimeout(() => {
    if (state.levelToken !== myToken) return;
    let layout = tileSilhouette(rows);
    for (let attempt = 0; attempt < 3 && !layout; attempt++) {
      layout = tileSilhouette(rows);
    }
    if (state.levelToken !== myToken) return;
    if (!layout) {
      boardEl.innerHTML = '';
      const txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('x', String(VIEW_W / 2));
      txt.setAttribute('y', String(VIEW_H / 2));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#8a90a3');
      txt.setAttribute('font-size', '36');
      txt.textContent = 'Could not generate puzzle — press New';
      boardEl.appendChild(txt);
      return;
    }
    state.pieces = layout.map((p, i) => ({
      id: i,
      cells: p.cells,
      tip: p.tip,
      dir: p.dir,
      gone: false,
    }));

    levelEl.textContent = state.dailyMode ? '☀' : String(level);
    savePersisted();
    renderPieces();
    maybeShowTutorialPointer(pathIsClear);
    updateHUD();
    startTimer();
    if (state.unlocks.hint && !state.seenTips.hint)
      setTimeout(() => maybeShowToolTip('hint'), 1400);
    else if (state.unlocks.eraser && !state.seenTips.eraser)
      setTimeout(() => maybeShowToolTip('eraser'), 1400);
  }, 16);
}

/** Energy gate: use instead of loadLevel for player-initiated plays. */
export function tryStartLevel(level: number): boolean {
  refillEnergyFromClock();
  if (state.energy <= 0) {
    showOutOfEnergyPrompt(() => tryStartLevel(level));
    return false;
  }
  spendEnergy();
  loadLevel(level);
  return true;
}
