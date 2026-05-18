import { state, savePersisted } from '../state.js';
import { spawnConfetti } from '../render/winWave.js';

export function showUnlockModal(kind: 'hint' | 'eraser', onClaim: () => void): void {
  const unlockOverlay = document.getElementById('unlockOverlay')!;
  const titleEl = document.getElementById('unlockTitle')!;
  const iconEl = document.getElementById('unlockIcon')!;
  const textEl = document.getElementById('unlockText')!;
  if (kind === 'hint') {
    titleEl.textContent = 'HINT';
    iconEl.textContent = '🔍';
    textEl.textContent = 'Show an arrow that can exit safely!';
  } else {
    titleEl.textContent = 'ERASER';
    iconEl.textContent = '✎';
    textEl.textContent = 'Tap an arrow to remove it for free.';
  }
  spawnConfetti(document.getElementById('unlockConfetti')!);
  unlockOverlay.classList.add('show');
  const claimBtn = document.getElementById('unlockClaim') as HTMLButtonElement;
  claimBtn.onclick = (): void => {
    if (kind === 'hint') state.unlocks.hint = true;
    else state.unlocks.eraser = true;
    savePersisted();
    unlockOverlay.classList.remove('show');
    onClaim();
  };
}
