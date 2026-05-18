/**
 * Cached references to DOM elements that exist in the static markup of
 * index.html. Modules loaded via <script type="module"> are deferred, so the
 * DOM is parsed before this module runs — these getElementById calls are safe.
 */

export const boardEl = document.getElementById('board') as unknown as SVGSVGElement;
export const progressDoneEl = document.getElementById('progressDone')!;
export const progressTotalEl = document.getElementById('progressTotal')!;
export const levelEl = document.getElementById('levelNum')!;
export const heartsEl = document.getElementById('hearts')!;
export const overlay = document.getElementById('overlay')!;
export const coinEl = document.getElementById('coinCount')!;
export const energyEl = document.getElementById('energyCount')!;
export const energyTimerEl = document.getElementById('energyTimer')!;
