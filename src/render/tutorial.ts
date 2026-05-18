import { CELL, DIRS, cellCenter } from '../engine/geom.js';
import { boardEl } from '../dom.js';
import { state, savePersisted } from '../state.js';
import type { Piece } from '../types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function maybeShowTutorialPointer(canRelease: (p: Piece) => boolean): void {
  if (!state.firstPlay || state.currentLevel !== 1) return;
  const target = state.pieces.find((p) => !p.gone && canRelease(p));
  if (!target) return;
  const tip = cellCenter(target.tip.x, target.tip.y);
  const d = DIRS[target.dir];
  const fx = tip.cx + d.dx * CELL * 0.7;
  const fy = tip.cy + d.dy * CELL * 0.7;
  const f = document.createElementNS(SVG_NS, 'text');
  f.setAttribute('class', 'tut-finger');
  f.setAttribute('x', String(fx));
  f.setAttribute('y', String(fy));
  f.setAttribute('text-anchor', 'middle');
  f.setAttribute('dominant-baseline', 'middle');
  f.setAttribute('font-size', String(CELL * 1.4));
  f.textContent = '👆';
  boardEl.appendChild(f);
}

export function dismissTutorial(): void {
  if (!state.firstPlay) return;
  state.firstPlay = false;
  savePersisted();
  const f = boardEl.querySelector('.tut-finger');
  if (f) f.remove();
}
