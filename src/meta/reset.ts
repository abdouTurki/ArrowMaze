import { STORAGE_KEY, LEGACY_KEY } from '../state.js';

let armed = false;

export function handleResetProgress(): void {
  const btn = document.getElementById('resetProgressBtn');
  if (!btn) return;
  if (!armed) {
    armed = true;
    btn.classList.add('armed');
    btn.textContent = 'Tap again to confirm';
    setTimeout(() => {
      armed = false;
      btn.classList.remove('armed');
      btn.textContent = 'Reset Progress';
    }, 4000);
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* localStorage unavailable */
  }
  location.reload();
}
