import { VIEW_W, VIEW_H } from '../engine/geom.js';
import { boardEl } from '../dom.js';
import { CONFETTI_COLORS } from '../config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Wave celebration: grid dots pop outward from board center; two glow rings
 * expand over the same window. Triggered the instant the last piece exits.
 */
export function playWinWave(): void {
  const dots = Array.from(boardEl.querySelectorAll('.grid-layer circle'));
  const cx = VIEW_W / 2;
  const cy = VIEW_H / 2;
  if (dots.length) {
    let maxD = 0;
    const dist = dots.map((dot) => {
      const dx = parseFloat(dot.getAttribute('cx')!) - cx;
      const dy = parseFloat(dot.getAttribute('cy')!) - cy;
      const d = Math.hypot(dx, dy);
      if (d > maxD) maxD = d;
      return d;
    });
    const WAVE_MS = 360;
    dots.forEach((dot, i) => {
      (dot as SVGCircleElement).style.animationDelay = `${
        maxD === 0 ? 0 : (dist[i] / maxD) * WAVE_MS
      }ms`;
    });
    const gridLayer = boardEl.querySelector('.grid-layer');
    if (gridLayer) gridLayer.classList.add('win-wave');
  }
  const rMax = Math.hypot(VIEW_W, VIEW_H) / 2 + 40;
  spawnWinRing(cx, cy, rMax, '#fde68a', 0, 720);
  spawnWinRing(cx, cy, rMax, '#5a6cff', 120, 820);
}

export function spawnWinRing(
  cx: number,
  cy: number,
  rMax: number,
  color: string,
  delayMs: number,
  durMs: number,
): void {
  setTimeout(() => {
    const ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('cx', String(cx));
    ring.setAttribute('cy', String(cy));
    ring.setAttribute('r', '0');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', color);
    ring.setAttribute('stroke-width', '7');
    ring.setAttribute('opacity', '0.55');
    ring.style.pointerEvents = 'none';
    boardEl.appendChild(ring);
    let start = 0;
    requestAnimationFrame(function step(t) {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / durMs);
      const ease = 1 - Math.pow(1 - k, 3);
      ring.setAttribute('r', String(rMax * ease));
      ring.setAttribute('opacity', String((1 - k) * 0.55));
      ring.setAttribute('stroke-width', String(7 * (1 - k * 0.75)));
      if (k < 1) requestAnimationFrame(step);
      else ring.remove();
    });
  }, delayMs);
}

export function spawnConfetti(host: HTMLElement): void {
  host.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    c.style.animationDelay = `${Math.random() * 0.4}s`;
    c.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(c);
  }
}
