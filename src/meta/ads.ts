let adInterval: number | null = null;

/**
 * Rewarded ad stub. To plug a real network: replace the body with the SDK's
 * "show rewarded video" call, and invoke onReward() in its onComplete callback.
 */
export function showRewardedAd(label: string, onReward: () => void): void {
  const adOverlay = document.getElementById('adOverlay')!;
  document.getElementById('adTitle')!.textContent = label || 'Watch to earn your reward';
  document.getElementById('adSub')!.textContent =
    'Placeholder ad — plug your network SDK in here.';
  const fill = document.getElementById('adProgress')!;
  const skipBtn = document.getElementById('adSkip') as HTMLButtonElement;
  fill.style.width = '0%';
  skipBtn.disabled = true;
  skipBtn.innerHTML = 'Skip in <span id="adSkipIn">5</span>s';
  skipBtn.onclick = null;
  adOverlay.classList.add('show');
  const started = Date.now();
  const DUR = 5000;
  if (adInterval !== null) clearInterval(adInterval);
  adInterval = window.setInterval(() => {
    const elapsed = Date.now() - started;
    const k = Math.min(1, elapsed / DUR);
    fill.style.width = k * 100 + '%';
    const countEl = document.getElementById('adSkipIn');
    if (countEl) countEl.textContent = String(Math.max(0, Math.ceil((DUR - elapsed) / 1000)));
    if (k >= 1) {
      if (adInterval !== null) clearInterval(adInterval);
      adInterval = null;
      skipBtn.disabled = false;
      skipBtn.textContent = 'Claim reward';
      skipBtn.onclick = (): void => {
        adOverlay.classList.remove('show');
        skipBtn.onclick = null;
        if (onReward) onReward();
      };
    }
  }, 100);
}
