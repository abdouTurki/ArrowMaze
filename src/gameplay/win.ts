import { state, savePersisted } from '../state.js';
import { STREAK_BONUS, REVIVE_COST } from '../config.js';
import { overlay } from '../dom.js';
import { sfxWin, sfxFail, sfxCoin } from '../audio/sfx.js';
import { haptic } from '../haptic.js';
import { playWinWave, spawnConfetti } from '../render/winWave.js';
import { refreshTopBar, bumpCoinPill, renderHearts } from '../render/hud.js';
import { showToast } from '../render/toast.js';
import { todayKey } from '../engine/prng.js';
import { stopTimer, startTimer } from './timer.js';
import { bestKey } from './hearts.js';
import { checkAchievements } from '../meta/achievements.js';
import { showRewardedAd } from '../meta/ads.js';

export function checkWin(): void {
  if (state.pieces.filter((p) => !p.gone).length !== 0) return;
  if (state.failTimeout !== null) {
    clearTimeout(state.failTimeout);
    state.failTimeout = null;
  }
  state.gameOver = true;
  stopTimer();
  const par = state.pieces.length;
  const wrong = state.moves - par;
  const flawless = wrong === 0;
  const key = bestKey();
  const prev = state.bestScores[key];
  const isNewBest = prev == null || state.moves < prev;
  if (isNewBest) state.bestScores[key] = state.moves;
  const reward = 10 + (flawless ? 5 : 0);
  state.coins += reward;
  state.levelsCleared++;
  state.flawlessStreak = flawless ? state.flawlessStreak + 1 : 0;
  const durationMs = state.levelStartTimeMs ? Date.now() - state.levelStartTimeMs : 0;

  if (state.dailyMode) {
    const today = todayKey();
    if (state.lastDailyDate) {
      const last = new Date(state.lastDailyDate);
      const t = new Date(today);
      const diffDays = Math.round((t.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
      state.streak = diffDays === 1 ? state.streak + 1 : 1;
    } else {
      state.streak = 1;
    }
    state.lastDailyDate = today;
    const bonus = STREAK_BONUS[state.streak];
    if (bonus) {
      state.coins += bonus;
      showToast({
        title: state.streak + '-day streak!',
        sub: 'Bonus reward',
        reward: bonus,
        icon: '☀',
      });
    }
  }
  refreshTopBar();
  bumpCoinPill();
  sfxWin();
  haptic([20, 40, 60, 40, 80]);
  savePersisted();
  playWinWave();
  checkAchievements({
    won: true,
    flawless,
    durationMs,
    usedHint: state.usedHintThisLevel,
  });
  setTimeout(() => showWinModal(isNewBest, reward), 900);
}

export function showWinModal(isNewBest: boolean, reward: number): void {
  const modal = document.getElementById('modal')!;
  modal.classList.remove('fail');
  modal.classList.add('win');
  modal.classList.toggle('daily', state.dailyMode);
  document.getElementById('modalBadge')!.textContent = state.dailyMode ? '☀' : '😄';
  const lvlLabel = document.getElementById('modalLevelLabel')!;
  lvlLabel.style.display = '';
  lvlLabel.textContent = state.dailyMode ? 'Daily Challenge' : `Level ${state.currentLevel}`;
  document.getElementById('modalTitle')!.textContent = state.dailyMode
    ? 'DAILY CLEARED!'
    : 'COMPLETED!';
  (document.getElementById('modalNewBest') as HTMLElement).style.display =
    isNewBest && !state.dailyMode ? 'inline-block' : 'none';
  const par = state.pieces.length;
  const wrong = state.moves - par;
  document.getElementById('modalText')!.textContent =
    wrong === 0
      ? 'Flawless run — no wrong moves.'
      : `${wrong} wrong ${wrong === 1 ? 'move' : 'moves'} — try again for a perfect run.`;
  document.getElementById('modalMoves')!.textContent = String(state.moves);
  document.getElementById('modalPar')!.textContent = String(par);
  document.getElementById('modalLives')!.textContent = String(state.lives);
  const rewardWrap = document.getElementById('modalReward') as HTMLElement;
  if (reward > 0) {
    rewardWrap.style.display = '';
    document.getElementById('modalRewardAmount')!.textContent = String(reward);
  } else {
    rewardWrap.style.display = 'none';
  }
  const extras = document.getElementById('modalExtras')!;
  extras.innerHTML = '';
  if (reward > 0 && !state.doubledRewardThisWin) {
    const btn = document.createElement('button');
    btn.className = 'choice ad';
    btn.innerHTML = `<span>Double your reward</span><span class="chip">+${reward}</span>`;
    btn.addEventListener('click', () => {
      showRewardedAd('Watch to double your reward', () => {
        state.coins += reward;
        state.doubledRewardThisWin = true;
        savePersisted();
        refreshTopBar();
        bumpCoinPill();
        sfxCoin();
        showToast({ title: 'Doubled!', icon: '💰', reward });
        btn.remove();
      });
    });
    extras.appendChild(btn);
    extras.style.display = '';
  } else {
    extras.style.display = 'none';
  }
  if (state.dailyMode) {
    const row = document.createElement('div');
    row.className = 'streak-row';
    for (let i = 1; i <= 7; i++) {
      const pip = document.createElement('div');
      pip.className = 'streak-pip' + (i <= state.streak ? ' lit' : '');
      pip.textContent = String(i);
      row.appendChild(pip);
    }
    extras.appendChild(row);
    extras.style.display = '';
  }
  document.getElementById('modalNext')!.textContent = state.dailyMode ? 'Back to game' : 'Continue';
  (document.getElementById('modalShare') as HTMLElement).style.display = '';
  spawnConfetti(document.getElementById('modalConfetti')!);
  overlay.classList.add('show');
}

export function showFailModal(): void {
  sfxFail();
  haptic([60, 40, 60]);
  const modal = document.getElementById('modal')!;
  modal.classList.remove('win', 'daily');
  modal.classList.add('fail');
  document.getElementById('modalBadge')!.textContent = '✕';
  (document.getElementById('modalLevelLabel') as HTMLElement).style.display = 'none';
  document.getElementById('modalTitle')!.textContent = 'Out of lives';
  (document.getElementById('modalNewBest') as HTMLElement).style.display = 'none';
  (document.getElementById('modalReward') as HTMLElement).style.display = 'none';
  document.getElementById('modalText')!.textContent =
    'The puzzle is still solvable — try a different release order.';
  document.getElementById('modalMoves')!.textContent = String(state.moves);
  document.getElementById('modalPar')!.textContent = String(state.pieces.length);
  document.getElementById('modalLives')!.textContent = '0';
  const extras = document.getElementById('modalExtras')!;
  extras.innerHTML = '';
  if (!state.revivedThisLevel) {
    const adBtn = document.createElement('button');
    adBtn.className = 'choice ad';
    adBtn.innerHTML = `<span>Revive — keep playing</span><span class="chip">Watch ad</span>`;
    adBtn.addEventListener('click', () => {
      showRewardedAd('Revive with full lives', () => revivePlayer());
    });
    extras.appendChild(adBtn);
    const canAfford = state.coins >= REVIVE_COST;
    const coinBtn = document.createElement('button');
    coinBtn.className = 'choice coin';
    coinBtn.disabled = !canAfford;
    coinBtn.innerHTML = `<span>Revive with coins</span><span class="chip">${REVIVE_COST}</span>`;
    coinBtn.addEventListener('click', () => {
      if (!canAfford) return;
      state.coins -= REVIVE_COST;
      state.spentCoinsTotal += REVIVE_COST;
      savePersisted();
      refreshTopBar();
      sfxCoin();
      bumpCoinPill();
      revivePlayer();
    });
    extras.appendChild(coinBtn);
    extras.style.display = '';
  } else {
    extras.style.display = 'none';
  }
  (document.getElementById('modalShare') as HTMLElement).style.display = 'none';
  document.getElementById('modalNext')!.textContent = 'Try again';
  document.getElementById('modalConfetti')!.innerHTML = '';
  overlay.classList.add('show');
}

export function revivePlayer(): void {
  state.revivedThisLevel = true;
  state.lives = 3;
  state.gameOver = false;
  renderHearts();
  overlay.classList.remove('show');
  startTimer();
  showToast({ title: 'Revived!', icon: '♥' });
}
