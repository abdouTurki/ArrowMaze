import { state, savePersisted } from '../state.js';
import { SHOP_PRICES, MAX_ENERGY } from '../config.js';
import { sfxCoin } from '../audio/sfx.js';
import { haptic } from '../haptic.js';
import { refreshTopBar, bumpCoinPill } from '../render/hud.js';
import { addHeart } from '../gameplay/hearts.js';
import { updateHintBtn, updateEraserBtn } from '../gameplay/tools.js';
import { grantEnergy, refillEnergyFromClock } from './energy.js';
import { checkAchievements } from './achievements.js';

export function openShop(): void {
  refillEnergyFromClock();
  const shopOverlay = document.getElementById('shopOverlay')!;
  document.getElementById('shopBalance')!.textContent = String(state.coins);
  renderShop();
  shopOverlay.classList.add('show');
}

export function closeShop(): void {
  document.getElementById('shopOverlay')!.classList.remove('show');
}

export function renderShop(): void {
  const list = document.getElementById('shopList');
  if (!list) return;
  list.innerHTML = '';
  const playing = !state.gameOver && state.pieces.length > 0;
  const items: Array<{
    id: string;
    icon: string;
    name: string;
    sub: string;
    price: number;
    available: boolean;
    apply: () => void;
  }> = [
    {
      id: 'hint',
      icon: '🔍',
      name: '+1 Hint',
      sub: 'Highlight a movable arrow',
      price: SHOP_PRICES.hint,
      available: state.unlocks.hint && playing,
      apply: (): void => {
        state.hintsLeft++;
        updateHintBtn();
      },
    },
    {
      id: 'eraser',
      icon: '✎',
      name: '+1 Eraser',
      sub: 'Remove an arrow for free',
      price: SHOP_PRICES.eraser,
      available: state.unlocks.eraser && playing,
      apply: (): void => {
        state.erasersLeft++;
        updateEraserBtn();
      },
    },
    {
      id: 'heart',
      icon: '♥',
      name: '+1 Heart',
      sub: 'Restore a life this run',
      price: SHOP_PRICES.heart,
      available: playing && state.lives < 3,
      apply: (): void => addHeart(),
    },
    {
      id: 'energy',
      icon: '⚡',
      name: 'Refill Energy',
      sub: `Fill back to ${MAX_ENERGY}`,
      price: SHOP_PRICES.energy,
      available: state.energy < MAX_ENERGY,
      apply: (): void => grantEnergy(MAX_ENERGY),
    },
  ];
  items.forEach((item) => {
    const can = item.available && state.coins >= item.price;
    const btn = document.createElement('button');
    btn.className = 'shop-item';
    btn.disabled = !item.available || !can;
    btn.innerHTML = `
      <div class="shop-icon">${item.icon}</div>
      <div class="shop-meta">
        <div class="shop-name">${item.name}</div>
        <div class="shop-sub">${item.sub}</div>
      </div>
      <div class="shop-price ${can ? '' : 'cant'}">${item.price}</div>
    `;
    btn.addEventListener('click', () => {
      if (!can) return;
      state.coins -= item.price;
      state.spentCoinsTotal += item.price;
      item.apply();
      savePersisted();
      refreshTopBar();
      bumpCoinPill();
      sfxCoin();
      haptic(15);
      document.getElementById('shopBalance')!.textContent = String(state.coins);
      renderShop();
      checkAchievements({});
    });
    list.appendChild(btn);
  });
}
