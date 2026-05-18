import { state } from './state.js';

export function haptic(pattern: number | number[]): void {
  if (!state.settings.sfx) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported */
    }
  }
}
