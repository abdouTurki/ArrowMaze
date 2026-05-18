import { state } from '../state.js';
import {
  coinEl,
  energyEl,
  energyTimerEl,
  heartsEl,
  progressDoneEl,
  progressTotalEl,
} from '../dom.js';
import { MAX_ENERGY, ENERGY_REFILL_MS } from '../config.js';
import { refillEnergyFromClock } from '../meta/energy.js';

export function refreshTopBar(): void {
  coinEl.textContent = String(state.coins);
  energyEl.textContent = String(state.energy);
  updateEnergyTimer();
}

export function updateEnergyTimer(): void {
  if (!energyTimerEl) return;
  refillEnergyFromClock();
  if (state.energy >= MAX_ENERGY) {
    energyTimerEl.textContent = 'Full';
    energyTimerEl.classList.add('full');
    return;
  }
  energyTimerEl.classList.remove('full');
  const remain = Math.max(0, ENERGY_REFILL_MS - (Date.now() - state.lastEnergyAt));
  const m = Math.floor(remain / 60000);
  const s = Math.floor((remain % 60000) / 1000);
  energyTimerEl.textContent = `+1 in ${m}:${String(s).padStart(2, '0')}`;
}

export function updateHUD(): void {
  const total = state.pieces.length;
  const left = state.pieces.filter((p) => !p.gone).length;
  progressDoneEl.textContent = String(total - left);
  progressTotalEl.textContent = String(total);
}

export function renderHearts(): void {
  const hs = heartsEl.querySelectorAll('.heart');
  hs.forEach((h, i) => {
    h.classList.remove('losing', 'lost');
    if (i >= state.lives) h.classList.add('lost');
  });
}

export function bumpCoinPill(): void {
  const pill = document.getElementById('coinPill');
  if (!pill) return;
  pill.classList.remove('coin-bump');
  void pill.offsetWidth;
  pill.classList.add('coin-bump');
}
