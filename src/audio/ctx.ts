/// <reference types="vite/client" />

let audioCtx: AudioContext | null = null;
let arrowBuffers: AudioBuffer[] = [];
let loadStarted = false;

export function getAudio(): AudioContext | null {
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
      if (!loadStarted) {
        loadStarted = true;
        void loadArrowSounds(audioCtx);
      }
    }
  }
  return audioCtx;
}

export function getArrowBuffers(): AudioBuffer[] {
  return arrowBuffers;
}

async function loadArrowSounds(ctx: AudioContext): Promise<void> {
  if (arrowBuffers.length) return;
  try {
    const base = import.meta.env.BASE_URL || './';
    const resp = await fetch(`${base}sounds/arrow1.mp3`);
    const data = await resp.arrayBuffer();
    const forward = await ctx.decodeAudioData(data);
    const reversed = ctx.createBuffer(
      forward.numberOfChannels,
      forward.length,
      forward.sampleRate,
    );
    for (let ch = 0; ch < forward.numberOfChannels; ch++) {
      const src = forward.getChannelData(ch);
      const dst = reversed.getChannelData(ch);
      for (let i = 0, n = src.length; i < n; i++) dst[i] = src[n - 1 - i];
    }
    arrowBuffers = [forward, reversed];
  } catch (e) {
    console.warn('arrow sound load failed:', e);
  }
}
