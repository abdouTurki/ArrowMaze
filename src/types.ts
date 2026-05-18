export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  x: number;
  y: number;
}

export interface Piece {
  cells: Cell[];
  tip: Cell;
  dir: Direction;
  id?: number;
  gone?: boolean;
  releasing?: boolean;
  el?: SVGGElement;
}

export type Layout = Piece[];

export interface PieceOption {
  cells: Cell[];
  tip: Cell;
  dir: Direction;
}

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  reward: number;
}

export interface AchievementUnlock {
  unlockedAt: number;
}

export type Achievements = Record<string, AchievementUnlock>;

export interface Settings {
  bgm: boolean;
  sfx: boolean;
  sensitivity: number;
}

export interface Unlocks {
  hint: boolean;
  eraser: boolean;
}

export interface SeenTips {
  hint: boolean;
  eraser: boolean;
}

export interface ShopPrices {
  hint: number;
  eraser: number;
  heart: number;
  energy: number;
}

export interface AdRewards {
  revive: number;
  doubleCoins: number;
  hint: number;
  eraser: number;
  energy: number;
}

export type StreakBonus = Record<number, number>;

export interface PersistedState {
  bestScores: Record<string, number>;
  currentLevel: number;
  maxLevelUnlocked: number;
  levelStars: Record<number, number>;
  settings: Settings;
  coins: number;
  energy: number;
  unlocks: Unlocks;
  gridOn: boolean;
  firstPlay: boolean;
  lastEnergyAt: number;
  achievements: Achievements;
  streak: number;
  lastDailyDate: string;
  seenTips: SeenTips;
  levelsCleared: number;
  flawlessStreak: number;
  spentCoinsTotal: number;
}

export interface RuntimeState {
  pieces: Piece[];
  moves: number;
  lives: number;
  gameOver: boolean;
  failTimeout: number | null;
  levelToken: number;
  hintsLeft: number;
  erasersLeft: number;
  dailyMode: boolean;
  levelStartTimeMs: number;
  usedHintThisLevel: boolean;
  revivedThisLevel: boolean;
  doubledRewardThisWin: boolean;
  erasing: boolean;
  levelStartedAt: number;
  timerInterval: number | null;
}

export type GameState = PersistedState & RuntimeState;

export interface WinContext {
  won: boolean;
  flawless: boolean;
  durationMs: number;
  usedHint: boolean;
}

export interface ToastOpts {
  title: string;
  sub?: string;
  reward?: number;
  icon?: string;
}

export interface PromptOpts {
  title: string;
  message: string;
  adLabel: string;
  coinCost: number;
  onAd: () => void;
  onCoin: () => void;
}
