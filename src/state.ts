import { HINTS_PER_LEVEL, ERASERS_PER_LEVEL, MAX_ENERGY, DIFFICULTIES } from './config.js';
import type { DifficultyKey, GameState, PersistedState } from './types.js';

export const STORAGE_KEY = 'arrowmaze.v7.state';
export const LEGACY_KEY = 'arrowmaze.v6.state';

export const state: GameState = {
  bestScores: {},
  currentLevel: 1,
  currentDifficulty: null,
  settings: { bgm: false, sfx: true, sensitivity: 50 },
  coins: 0,
  energy: MAX_ENERGY,
  unlocks: { hint: false, eraser: false },
  gridOn: true,
  firstPlay: true,
  lastEnergyAt: Date.now(),
  achievements: {},
  streak: 0,
  lastDailyDate: '',
  seenTips: { hint: false, eraser: false },
  levelsCleared: 0,
  flawlessStreak: 0,
  spentCoinsTotal: 0,

  pieces: [],
  moves: 0,
  lives: 3,
  gameOver: false,
  failTimeout: null,
  levelToken: 0,
  hintsLeft: HINTS_PER_LEVEL,
  erasersLeft: ERASERS_PER_LEVEL,
  dailyMode: false,
  levelStartTimeMs: 0,
  usedHintThisLevel: false,
  revivedThisLevel: false,
  doubledRewardThisWin: false,
  erasing: false,
  levelStartedAt: 0,
  timerInterval: null,
};

interface RawPersisted {
  bestScores?: Record<string, number>;
  currentLevel?: number;
  difficulty?: string;
  settings?: Partial<PersistedState['settings']>;
  coins?: number;
  energy?: number;
  unlocks?: Partial<PersistedState['unlocks']>;
  gridOn?: boolean;
  firstPlay?: boolean;
  lastEnergyAt?: number;
  achievements?: PersistedState['achievements'];
  streak?: number;
  lastDailyDate?: string;
  seenTips?: Partial<PersistedState['seenTips']>;
  levelsCleared?: number;
  flawlessStreak?: number;
  spentCoinsTotal?: number;
}

export function loadPersisted(): void {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  } catch {
    /* localStorage unavailable */
  }
  if (!raw) return;
  let p: RawPersisted = {};
  try {
    p = JSON.parse(raw) as RawPersisted;
  } catch {
    return;
  }

  if (p.bestScores) state.bestScores = p.bestScores;
  if (typeof p.currentLevel === 'number') state.currentLevel = p.currentLevel;
  if (p.difficulty && (DIFFICULTIES as Record<string, unknown>)[p.difficulty]) {
    state.currentDifficulty = p.difficulty as DifficultyKey;
  }
  state.settings = Object.assign({ bgm: false, sfx: true, sensitivity: 50 }, p.settings || {});
  if (typeof p.coins === 'number') state.coins = p.coins;
  state.energy = p.energy != null ? p.energy : MAX_ENERGY;
  state.unlocks = Object.assign({ hint: false, eraser: false }, p.unlocks || {});
  state.gridOn = p.gridOn != null ? p.gridOn : true;
  state.firstPlay = p.firstPlay == null;
  state.lastEnergyAt = p.lastEnergyAt || Date.now();
  state.achievements = p.achievements || {};
  state.streak = p.streak || 0;
  state.lastDailyDate = p.lastDailyDate || '';
  state.seenTips = Object.assign({ hint: false, eraser: false }, p.seenTips || {});
  state.levelsCleared = p.levelsCleared || 0;
  state.flawlessStreak = p.flawlessStreak || 0;
  state.spentCoinsTotal = p.spentCoinsTotal || 0;
}

/**
 * Persist game state. The JSON shape MUST stay byte-identical to v7 — players
 * have saves under `arrowmaze.v7.state`. The state-shape test asserts this.
 */
export function savePersisted(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bestScores: state.bestScores,
        currentLevel: state.currentLevel,
        difficulty: state.currentDifficulty,
        settings: state.settings,
        coins: state.coins,
        energy: state.energy,
        unlocks: state.unlocks,
        gridOn: state.gridOn,
        lastEnergyAt: state.lastEnergyAt,
        achievements: state.achievements,
        streak: state.streak,
        lastDailyDate: state.lastDailyDate,
        seenTips: state.seenTips,
        levelsCleared: state.levelsCleared,
        flawlessStreak: state.flawlessStreak,
        spentCoinsTotal: state.spentCoinsTotal,
        firstPlay: false,
      }),
    );
  } catch {
    /* localStorage unavailable */
  }
}
