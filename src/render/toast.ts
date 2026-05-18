import { state, savePersisted } from '../state.js';
import type { ToastOpts } from '../types.js';

export function showToast(opts: ToastOpts): void {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast';
  const icon = opts.icon || '★';
  const sub = opts.sub ? `<div class="toast-sub">${opts.sub}</div>` : '';
  const reward = opts.reward ? `<div class="toast-reward">+${opts.reward}</div>` : '';
  el.innerHTML = `<div class="toast-icon">${icon}</div><div><div class="toast-title">${opts.title}</div>${sub}</div>${reward}`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

export function maybeShowToolTip(kind: 'hint' | 'eraser'): void {
  if (state.seenTips[kind]) return;
  const btn = document.getElementById(kind + 'Btn') as HTMLButtonElement | null;
  if (!btn || btn.disabled) return;
  document.querySelectorAll('.tip-bubble').forEach((b) => b.remove());
  const tip = document.createElement('div');
  tip.className = 'tip-bubble';
  tip.textContent =
    kind === 'hint'
      ? 'Tap to highlight an arrow that can exit safely.'
      : 'Tap, then choose an arrow to remove it for free.';
  document.body.appendChild(tip);
  const r = btn.getBoundingClientRect();
  tip.style.left = r.left + window.scrollX - 24 + 'px';
  tip.style.top = r.top + window.scrollY - tip.offsetHeight - 12 + 'px';
  const dismiss = (): void => {
    state.seenTips[kind] = true;
    savePersisted();
    tip.remove();
    document.removeEventListener('click', dismiss, true);
  };
  setTimeout(() => document.addEventListener('click', dismiss, true), 50);
  setTimeout(dismiss, 6000);
}
