import { state } from '../state.js';
import { showToast } from '../render/toast.js';

export async function shareWin(): Promise<void> {
  const wrong = state.moves - state.pieces.length;
  const flair = wrong === 0 ? ' with a flawless run' : '';
  const what = state.dailyMode ? "today's daily" : `level ${state.currentLevel}`;
  const text = `I just cleared ${what} in UNJAM${flair}! 🎯`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'UNJAM — Arrow Tangle', text });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast({ title: 'Copied to clipboard', icon: '✓' });
    }
  } catch {
    /* user cancelled or unsupported */
  }
}
