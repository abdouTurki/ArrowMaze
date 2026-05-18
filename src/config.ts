import type {
  AchievementDef,
  AdRewards,
  Difficulty,
  DifficultyKey,
  ShopPrices,
  StreakBonus,
} from './types.js';

export const DIFFICULTIES: Record<DifficultyKey, Difficulty> = {
  easy: { w: 8, h: 12, label: 'Easy' },
  medium: { w: 11, h: 17, label: 'Medium' },
  hard: { w: 14, h: 22, label: 'Hard' },
};

export const HINTS_PER_LEVEL = 2;
export const ERASERS_PER_LEVEL = 1;
export const MAX_ENERGY = 5;
export const ENERGY_REFILL_MS = 8 * 60 * 1000;

export const SHOP_PRICES: ShopPrices = {
  hint: 25,
  eraser: 30,
  heart: 40,
  energy: 50,
};

export const REVIVE_COST = 30;

export const AD_REWARDS: AdRewards = {
  revive: 1,
  doubleCoins: 2,
  hint: 2,
  eraser: 1,
  energy: MAX_ENERGY,
};

export const STREAK_BONUS: StreakBonus = {
  3: 50,
  7: 200,
  14: 500,
};

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'firstWin', icon: '🎯', name: 'First Steps', desc: 'Clear your first level.', reward: 10 },
  { id: 'flawless', icon: '✨', name: 'Flawless', desc: 'Clear a level with no wrong moves.', reward: 20 },
  { id: 'flawless3', icon: '🔥', name: 'On Fire', desc: '3 flawless wins in a row.', reward: 50 },
  { id: 'speedDemon', icon: '⚡', name: 'Speed Demon', desc: 'Clear a level under 30 seconds.', reward: 30 },
  { id: 'noHints', icon: '🧠', name: 'Pure Mind', desc: 'Clear a level without using a hint.', reward: 15 },
  { id: 'level10', icon: '🥉', name: 'Level 10', desc: 'Reach level 10.', reward: 50 },
  { id: 'level25', icon: '🥈', name: 'Level 25', desc: 'Reach level 25.', reward: 100 },
  { id: 'level50', icon: '🥇', name: 'Level 50', desc: 'Reach level 50.', reward: 200 },
  { id: 'centurion', icon: '💯', name: 'Centurion', desc: 'Clear 100 levels total.', reward: 500 },
  { id: 'streak3', icon: '☀', name: 'Three in a Row', desc: '3-day daily streak.', reward: 50 },
  { id: 'streak7', icon: '🌟', name: 'Week Warrior', desc: '7-day daily streak.', reward: 200 },
  { id: 'bigSpender', icon: '💰', name: 'Big Spender', desc: 'Spend 100+ coins.', reward: 25 },
];

export const CONFETTI_COLORS = [
  '#22c55e',
  '#f59e0b',
  '#5a6cff',
  '#ff5b8a',
  '#fde68a',
  '#27c499',
  '#ff5b5b',
];

export const VIEW_W = 1000;
export const PAD = 30;
