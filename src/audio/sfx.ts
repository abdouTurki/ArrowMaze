import { state } from '../state.js';
import { haptic } from '../haptic.js';
import { getAudio, getArrowBuffers } from './ctx.js';

export function playArrowBuffer(): boolean {
  if (!state.settings.sfx) return false;
  const ctx = getAudio();
  const buffers = getArrowBuffers();
  if (!ctx || !buffers.length) return false;
  if (ctx.state === 'suspended') void ctx.resume();
  const idx = Math.floor(Math.random() * buffers.length);
  const buf = buffers[idx];
  const source = ctx.createBufferSource();
  source.buffer = buf;
  const baseRate = idx === 0 ? 1.15 : 0.78;
  source.playbackRate.value = baseRate * (0.92 + Math.random() * 0.16);
  const gain = ctx.createGain();
  gain.gain.value = 0.55;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return true;
}

export function playTone(
  freq: number,
  durMs = 110,
  type: OscillatorType = 'sine',
  vol = 0.12,
): void {
  if (!state.settings.sfx) return;
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + durMs / 1000 + 0.02);
}

export function sfxRelease(): void {
  haptic(8);
  if (playArrowBuffer()) return;
  playTone(720, 90, 'sine', 0.1);
}

export function sfxBad(): void {
  haptic(30);
  playTone(220, 80, 'square', 0.08);
  setTimeout(() => playTone(180, 120, 'square', 0.07), 70);
}

export function sfxErase(): void {
  playTone(420, 140, 'triangle', 0.1);
}

export function sfxHint(): void {
  playTone(880, 70, 'sine', 0.08);
  setTimeout(() => playTone(1175, 100, 'sine', 0.08), 75);
}

export function sfxWin(): void {
  playTone(523, 110, 'sine', 0.1);
  setTimeout(() => playTone(659, 110, 'sine', 0.1), 120);
  setTimeout(() => playTone(784, 160, 'sine', 0.1), 240);
  setTimeout(() => playTone(1047, 220, 'sine', 0.1), 410);
}

export function sfxFail(): void {
  playTone(330, 140, 'sawtooth', 0.1);
  setTimeout(() => playTone(220, 220, 'sawtooth', 0.1), 130);
}

export function sfxCoin(): void {
  playTone(988, 60, 'sine', 0.08);
  setTimeout(() => playTone(1318, 100, 'sine', 0.08), 60);
}
