import {
  CELL,
  DIRS,
  GRID_H,
  GRID_W,
  HEAD_HALF,
  HEAD_LEN,
  PAD,
  STROKE,
  VIEW_H,
  VIEW_W,
  cellCenter,
  setGeometry,
} from '../engine/geom.js';
import { boardEl } from '../dom.js';
import { state } from '../state.js';
import type { Cell, Piece } from '../types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

let pieceClickHandler: ((p: Piece) => void) | null = null;
export function setPieceClickHandler(fn: (p: Piece) => void): void {
  pieceClickHandler = fn;
}

export function applyGridSizeToDOM(w: number, h: number): void {
  setGeometry(w, h);
  boardEl.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
  document.documentElement.style.setProperty('--board-w', String(w));
  document.documentElement.style.setProperty('--board-h', String(h));
}

export function renderGrid(): void {
  if (!state.gridOn) return;
  const grid = document.createElementNS(SVG_NS, 'g');
  grid.setAttribute('class', 'grid-layer');
  grid.setAttribute('fill', '#c5cad9');
  const r = Math.max(1.5, CELL * 0.07);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', String(PAD + x * CELL + CELL / 2));
      dot.setAttribute('cy', String(PAD + y * CELL + CELL / 2));
      dot.setAttribute('r', String(r));
      grid.appendChild(dot);
    }
  }
  boardEl.appendChild(grid);
}

export function renderPieces(): void {
  boardEl.innerHTML = '';
  renderGrid();
  state.pieces.forEach((p) => drawPiece(p));
}

export function drawPiece(p: Piece): void {
  const g = document.createElementNS(SVG_NS, 'g');
  g.classList.add('arrow-piece');
  if (p.id != null) g.dataset.id = String(p.id);

  const cells = p.cells;
  const N = cells.length;
  const { dx, dy } = DIRS[p.dir];

  const pts: [number, number][] = [];
  for (let i = 0; i < N - 1; i++) {
    const { cx, cy } = cellCenter(cells[i].x, cells[i].y);
    pts.push([cx, cy]);
  }
  const tipCenter = cellCenter(p.tip.x, p.tip.y);
  if (N === 1) {
    const back = CELL * 0.45;
    pts.push([tipCenter.cx - dx * back, tipCenter.cy - dy * back]);
  }
  const stopShort = CELL * 0.1;
  pts.push([tipCenter.cx - dx * stopShort, tipCenter.cy - dy * stopShort]);
  const pointsStr = pts.map((pt) => `${pt[0]},${pt[1]}`).join(' ');

  const hit = document.createElementNS(SVG_NS, 'polyline');
  hit.setAttribute('points', pointsStr);
  hit.setAttribute('stroke', 'transparent');
  hit.setAttribute('stroke-width', String(Math.max(STROKE * 2.4, CELL * 0.85)));
  hit.setAttribute('stroke-linecap', 'round');
  hit.setAttribute('stroke-linejoin', 'round');
  hit.setAttribute('fill', 'none');
  hit.setAttribute('pointer-events', 'stroke');
  g.appendChild(hit);

  const polyline = document.createElementNS(SVG_NS, 'polyline');
  polyline.setAttribute('class', 'body');
  polyline.setAttribute('points', pointsStr);
  polyline.setAttribute('stroke-width', String(STROKE));
  g.appendChild(polyline);

  const lastX = pts[pts.length - 1][0];
  const lastY = pts[pts.length - 1][1];
  const apexX = lastX + dx * HEAD_LEN;
  const apexY = lastY + dy * HEAD_LEN;
  const px = -dy,
    py = dx;
  const b1x = lastX + px * HEAD_HALF;
  const b1y = lastY + py * HEAD_HALF;
  const b2x = lastX - px * HEAD_HALF;
  const b2y = lastY - py * HEAD_HALF;

  const head = document.createElementNS(SVG_NS, 'polygon');
  head.setAttribute('class', 'head');
  head.setAttribute('points', `${apexX},${apexY} ${b1x},${b1y} ${b2x},${b2y}`);
  head.setAttribute('stroke-width', '1');
  g.appendChild(head);

  g.addEventListener('click', () => {
    if (pieceClickHandler) pieceClickHandler(p);
  });
  boardEl.appendChild(g);
  p.el = g;
}

export function redrawPieceWithCells(piece: Piece, newCells: Cell[]): void {
  const N = newCells.length;
  if (!piece.el) return;
  if (N === 0) {
    piece.el.style.opacity = '0';
    return;
  }
  const { dx, dy } = DIRS[piece.dir];

  const pts: [number, number][] = [];
  for (let i = 0; i < N - 1; i++) {
    const { cx, cy } = cellCenter(newCells[i].x, newCells[i].y);
    pts.push([cx, cy]);
  }
  const tipCenter = cellCenter(newCells[N - 1].x, newCells[N - 1].y);
  if (N === 1) {
    const back = CELL * 0.45;
    pts.push([tipCenter.cx - dx * back, tipCenter.cy - dy * back]);
  }
  const stopShort = CELL * 0.1;
  pts.push([tipCenter.cx - dx * stopShort, tipCenter.cy - dy * stopShort]);

  const polyline = piece.el.querySelector('.body');
  polyline?.setAttribute('points', pts.map((p) => `${p[0]},${p[1]}`).join(' '));

  const lastX = pts[pts.length - 1][0];
  const lastY = pts[pts.length - 1][1];
  const apexX = lastX + dx * HEAD_LEN;
  const apexY = lastY + dy * HEAD_LEN;
  const px = -dy,
    py = dx;
  const b1x = lastX + px * HEAD_HALF;
  const b1y = lastY + py * HEAD_HALF;
  const b2x = lastX - px * HEAD_HALF;
  const b2y = lastY - py * HEAD_HALF;
  const head = piece.el.querySelector('.head');
  head?.setAttribute('points', `${apexX},${apexY} ${b1x},${b1y} ${b2x},${b2y}`);
}
