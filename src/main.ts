import { state, loadPersisted } from './state.js';
import { MAX_ENERGY } from './config.js';
import { setPieceClickHandler } from './render/board.js';
import { refreshTopBar, updateEnergyTimer } from './render/hud.js';
import { handlePieceClick, setOnWinCheck } from './gameplay/play.js';
import { setOnLostAllLives } from './gameplay/hearts.js';
import { hint, toggleEraser, toggleGrid } from './gameplay/tools.js';
import { loadLevel, tryStartLevel } from './gameplay/level.js';
import { checkWin, showFailModal } from './gameplay/win.js';
import { installVisibilityPauseHandler } from './gameplay/timer.js';
import { openShop, closeShop } from './meta/shop.js';
import { showSettings, wireSettings } from './meta/settings.js';
import {
  startDailyChallenge,
  retryDaily,
  exitDailyMode,
  updateDailyBadge,
} from './meta/daily.js';
import { renderAchievementsList } from './meta/achievements.js';
import { showOutOfEnergyPrompt } from './meta/energy.js';
import { showUnlockModal } from './meta/unlock.js';
import { shareWin } from './meta/share.js';
import { handleResetProgress } from './meta/reset.js';
import { openLevelMap, closeLevelMap } from './meta/levelMap.js';

loadPersisted();

// Wire up cross-module callbacks (broken cycles).
setPieceClickHandler(handlePieceClick);
setOnWinCheck(checkWin);
setOnLostAllLives(showFailModal);

// Energy refill ticker — keeps the "+1 in MM:SS" label live.
setInterval(updateEnergyTimer, 1000);

installVisibilityPauseHandler();

// ----- Wire DOM events -----
document.getElementById('diffBtn')!.addEventListener('click', showSettings);
document.getElementById('hintBtn')!.addEventListener('click', hint);
document.getElementById('eraserBtn')!.addEventListener('click', toggleEraser);
document.getElementById('gridBtn')!.addEventListener('click', toggleGrid);
document.getElementById('newBtn')!.addEventListener('click', () => {
  state.dailyMode = false;
  tryStartLevel(state.currentLevel + 1);
});
document.getElementById('mapBtn')!.addEventListener('click', openLevelMap);

wireSettings();

document.getElementById('modalReset')!.addEventListener('click', () => {
  document.getElementById('overlay')!.classList.remove('show');
  if (state.dailyMode) {
    retryDaily();
    return;
  }
  tryStartLevel(state.currentLevel);
});
document.getElementById('modalNext')!.addEventListener('click', () => {
  document.getElementById('overlay')!.classList.remove('show');
  if (state.dailyMode && state.lives > 0) {
    exitDailyMode();
    return;
  }
  if (state.lives === 0) {
    if (state.dailyMode) {
      retryDaily();
      return;
    }
    tryStartLevel(state.currentLevel);
    return;
  }
  if (state.currentLevel === 1 && !state.unlocks.hint) {
    showUnlockModal('hint', () => tryStartLevel(state.currentLevel + 1));
    return;
  }
  if (state.currentLevel === 2 && !state.unlocks.eraser) {
    showUnlockModal('eraser', () => tryStartLevel(state.currentLevel + 1));
    return;
  }
  tryStartLevel(state.currentLevel + 1);
});

document.getElementById('coinPill')!.addEventListener('click', openShop);
document.getElementById('energyPill')!.addEventListener('click', () => {
  if (state.energy < MAX_ENERGY) showOutOfEnergyPrompt(null);
  else openShop();
});
document.getElementById('shopClose')!.addEventListener('click', closeShop);
const shopOverlay = document.getElementById('shopOverlay')!;
shopOverlay.addEventListener('click', (e) => {
  if (e.target === shopOverlay) closeShop();
});
document.getElementById('dailyBtn')!.addEventListener('click', startDailyChallenge);
document.getElementById('achievementsBtn')!.addEventListener('click', () => {
  renderAchievementsList();
  document.getElementById('achievementsOverlay')!.classList.add('show');
});
document.getElementById('achievementsClose')!.addEventListener('click', () => {
  document.getElementById('achievementsOverlay')!.classList.remove('show');
});
const achOverlay = document.getElementById('achievementsOverlay')!;
achOverlay.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).id === 'achievementsOverlay')
    (e.currentTarget as HTMLElement).classList.remove('show');
});

// Level map close + outside-click dismiss
document.getElementById('levelMapClose')!.addEventListener('click', closeLevelMap);
const mapOverlay = document.getElementById('levelMapOverlay')!;
mapOverlay.addEventListener('click', (e) => {
  if (e.target === mapOverlay) closeLevelMap();
});

document.getElementById('resetProgressBtn')!.addEventListener('click', handleResetProgress);
document.getElementById('modalShare')!.addEventListener('click', shareWin);
const promptOverlay = document.getElementById('promptOverlay')!;
promptOverlay.addEventListener('click', (e) => {
  if (e.target === promptOverlay) promptOverlay.classList.remove('show');
});

// ----- Boot -----
refreshTopBar();
updateDailyBadge();
if (state.gridOn) document.getElementById('gridBtn')!.classList.add('active');
loadLevel(state.currentLevel);
