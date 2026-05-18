import { state, savePersisted } from '../state.js';
import { AD_REWARDS, SHOP_PRICES } from '../config.js';
import { sfxHint, sfxCoin } from '../audio/sfx.js';
import { haptic } from '../haptic.js';
import { refreshTopBar, bumpCoinPill } from '../render/hud.js';
import { showToast } from '../render/toast.js';
import { renderPieces } from '../render/board.js';
import { showPrompt } from '../meta/prompt.js';
import { showRewardedAd } from '../meta/ads.js';
import { pathIsClear, eraseArrow } from './play.js';

export function updateHintBtn(): void {
  const btn = document.getElementById('hintBtn') as HTMLButtonElement;
  const badge = document.getElementById('hintBadge')!;
  if (!state.unlocks.hint) {
    btn.classList.add('locked');
    badge.classList.add('zero');
    btn.disabled = true;
    return;
  }
  btn.classList.remove('locked');
  badge.textContent = String(state.hintsLeft);
  badge.classList.toggle('zero', state.hintsLeft <= 0);
  btn.disabled = state.gameOver;
}

export function hint(): void {
  if (state.gameOver) return;
  if (state.hintsLeft <= 0) {
    showPrompt({
      title: 'Out of hints',
      text: 'Watch an ad or spend coins to get more hints.',
      icon: '🔍',
      choices: [
        {
          kind: 'ad',
          label: 'Watch an ad',
          cost: '+' + AD_REWARDS.hint,
          onPick: (): void => {
            showRewardedAd('Get ' + AD_REWARDS.hint + ' hints', () => {
              state.hintsLeft += AD_REWARDS.hint;
              updateHintBtn();
              showToast({ title: 'Hints added', icon: '🔍', reward: AD_REWARDS.hint });
            });
          },
        },
        {
          kind: 'coin',
          label: '+1 hint',
          cost: SHOP_PRICES.hint,
          disabled: state.coins < SHOP_PRICES.hint,
          onPick: (): void => {
            if (state.coins < SHOP_PRICES.hint) return;
            state.coins -= SHOP_PRICES.hint;
            state.spentCoinsTotal += SHOP_PRICES.hint;
            state.hintsLeft++;
            savePersisted();
            refreshTopBar();
            sfxCoin();
            bumpCoinPill();
            updateHintBtn();
          },
        },
      ],
    });
    return;
  }
  const movable = state.pieces.find((p) => !p.gone && pathIsClear(p));
  if (!movable) return;
  sfxHint();
  haptic(15);
  state.hintsLeft--;
  state.usedHintThisLevel = true;
  updateHintBtn();
  movable.el?.classList.add('hint');
  setTimeout(() => movable.el?.classList.remove('hint'), 1100);
}

export function updateEraserBtn(): void {
  const btn = document.getElementById('eraserBtn') as HTMLButtonElement;
  const badge = document.getElementById('eraserBadge')!;
  if (!state.unlocks.eraser) {
    btn.classList.add('locked');
    badge.classList.add('zero');
    btn.disabled = true;
    return;
  }
  btn.classList.remove('locked');
  badge.textContent = String(state.erasersLeft);
  badge.classList.toggle('zero', state.erasersLeft <= 0);
  btn.disabled = state.gameOver;
  btn.classList.toggle('active', state.erasing);
}

export function toggleEraser(): void {
  if (state.gameOver) return;
  if (state.erasersLeft <= 0) {
    showPrompt({
      title: 'Out of erasers',
      text: 'Watch an ad or spend coins to get more erasers.',
      icon: '✎',
      choices: [
        {
          kind: 'ad',
          label: 'Watch an ad',
          cost: '+' + AD_REWARDS.eraser,
          onPick: (): void => {
            showRewardedAd('Get ' + AD_REWARDS.eraser + ' eraser', () => {
              state.erasersLeft += AD_REWARDS.eraser;
              updateEraserBtn();
              showToast({ title: 'Eraser added', icon: '✎', reward: AD_REWARDS.eraser });
            });
          },
        },
        {
          kind: 'coin',
          label: '+1 eraser',
          cost: SHOP_PRICES.eraser,
          disabled: state.coins < SHOP_PRICES.eraser,
          onPick: (): void => {
            if (state.coins < SHOP_PRICES.eraser) return;
            state.coins -= SHOP_PRICES.eraser;
            state.spentCoinsTotal += SHOP_PRICES.eraser;
            state.erasersLeft++;
            savePersisted();
            refreshTopBar();
            sfxCoin();
            bumpCoinPill();
            updateEraserBtn();
          },
        },
      ],
    });
    return;
  }
  state.erasing = !state.erasing;
  updateEraserBtn();
}

export function toggleGrid(): void {
  state.gridOn = !state.gridOn;
  document.getElementById('gridBtn')?.classList.toggle('active', state.gridOn);
  renderPieces();
  savePersisted();
}

// Re-export for tools.ts callers
export { eraseArrow };
