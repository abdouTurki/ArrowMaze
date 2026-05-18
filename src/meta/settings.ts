import { state, savePersisted } from '../state.js';

const settingsOverlay = (): HTMLElement => document.getElementById('settingsOverlay')!;

export function showSettings(): void {
  applySettingsToUI();
  settingsOverlay().classList.add('show');
}

export function hideSettings(): void {
  settingsOverlay().classList.remove('show');
}

export function applySettingsToUI(): void {
  (document.getElementById('bgmToggle') as HTMLInputElement).checked = state.settings.bgm;
  (document.getElementById('sfxToggle') as HTMLInputElement).checked = state.settings.sfx;
  const slider = document.getElementById('sensitivitySlider') as HTMLInputElement;
  slider.value = String(state.settings.sensitivity);
  slider.style.background = `linear-gradient(to right, var(--good) 0 ${state.settings.sensitivity}%, #d0d3e0 ${state.settings.sensitivity}% 100%)`;
}

export function wireSettings(): void {
  document.getElementById('settingsClose')!.addEventListener('click', hideSettings);
  settingsOverlay().addEventListener('click', (e) => {
    if (e.target === settingsOverlay()) hideSettings();
  });
  document.getElementById('bgmToggle')!.addEventListener('change', (e) => {
    state.settings.bgm = (e.target as HTMLInputElement).checked;
    savePersisted();
  });
  document.getElementById('sfxToggle')!.addEventListener('change', (e) => {
    state.settings.sfx = (e.target as HTMLInputElement).checked;
    savePersisted();
  });
  const slider = document.getElementById('sensitivitySlider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const s = e.target as HTMLInputElement;
      state.settings.sensitivity = +s.value;
      s.style.background = `linear-gradient(to right, var(--good) 0 ${state.settings.sensitivity}%, #d0d3e0 ${state.settings.sensitivity}% 100%)`;
      savePersisted();
    });
  }
}
