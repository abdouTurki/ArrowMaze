import { state, savePersisted } from '../state.js';
import { MAX_ENERGY, ENERGY_REFILL_MS, AD_REWARDS, SHOP_PRICES } from '../config.js';
import { showPrompt } from './prompt.js';
import { showRewardedAd } from './ads.js';
import { showToast } from '../render/toast.js';
import { sfxCoin } from '../audio/sfx.js';

export function refillEnergyFromClock(): void {
  if (state.energy >= MAX_ENERGY) {
    state.lastEnergyAt = Date.now();
    return;
  }
  const now = Date.now();
  const gained = Math.floor((now - state.lastEnergyAt) / ENERGY_REFILL_MS);
  if (gained > 0) {
    state.energy = Math.min(MAX_ENERGY, state.energy + gained);
    state.lastEnergyAt =
      state.energy >= MAX_ENERGY ? now : state.lastEnergyAt + gained * ENERGY_REFILL_MS;
    savePersisted();
  }
}

export function spendEnergy(): boolean {
  refillEnergyFromClock();
  if (state.energy <= 0) return false;
  const wasFull = state.energy === MAX_ENERGY;
  state.energy--;
  if (wasFull) state.lastEnergyAt = Date.now();
  savePersisted();
  return true;
}

export function grantEnergy(n: number): void {
  refillEnergyFromClock();
  state.energy = Math.min(MAX_ENERGY, state.energy + n);
  if (state.energy >= MAX_ENERGY) state.lastEnergyAt = Date.now();
  savePersisted();
}

export function showOutOfEnergyPrompt(retry: (() => void) | null): void {
  showPrompt({
    title: 'Out of energy',
    text: 'Wait for the refill timer, watch an ad, or spend coins to keep playing.',
    icon: '⚡',
    choices: [
      {
        kind: 'ad',
        label: 'Watch an ad',
        cost: '+' + AD_REWARDS.energy,
        onPick: (): void => {
          showRewardedAd('Get ' + AD_REWARDS.energy + ' energy', () => {
            grantEnergy(AD_REWARDS.energy);
            showToast({ title: 'Energy refilled', icon: '⚡', reward: AD_REWARDS.energy });
            if (retry) retry();
          });
        },
      },
      {
        kind: 'coin',
        label: 'Refill from coins',
        cost: SHOP_PRICES.energy,
        disabled: state.coins < SHOP_PRICES.energy,
        onPick: (): void => {
          if (state.coins < SHOP_PRICES.energy) return;
          state.coins -= SHOP_PRICES.energy;
          state.spentCoinsTotal += SHOP_PRICES.energy;
          grantEnergy(MAX_ENERGY);
          savePersisted();
          sfxCoin();
          if (retry) retry();
        },
      },
    ],
  });
}
