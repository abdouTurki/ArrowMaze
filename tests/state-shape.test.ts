import { describe, it, expect, beforeEach } from 'vitest';

class MemoryStorage {
  private store: Record<string, string> = {};
  getItem(k: string): string | null {
    return this.store[k] ?? null;
  }
  setItem(k: string, v: string): void {
    this.store[k] = String(v);
  }
  removeItem(k: string): void {
    delete this.store[k];
  }
  clear(): void {
    this.store = {};
  }
}
(globalThis as unknown as { localStorage?: MemoryStorage }).localStorage = new MemoryStorage();

const { state, loadPersisted, savePersisted, STORAGE_KEY } = await import('../src/state.js');

const EXPECTED_PERSISTED_KEYS = [
  'bestScores',
  'currentLevel',
  'maxLevelUnlocked',
  'levelStars',
  'settings',
  'coins',
  'energy',
  'unlocks',
  'gridOn',
  'lastEnergyAt',
  'achievements',
  'streak',
  'lastDailyDate',
  'seenTips',
  'levelsCleared',
  'flawlessStreak',
  'spentCoinsTotal',
  'firstPlay',
] as const;

describe('state-shape', () => {
  beforeEach(() => {
    (globalThis.localStorage as unknown as MemoryStorage).clear();
  });

  it('savePersisted writes exactly the documented 18 keys in the documented order', () => {
    state.bestScores = { '14x22': 12 };
    state.currentLevel = 7;
    state.maxLevelUnlocked = 8;
    state.levelStars = { 1: 3, 2: 2, 7: 1 };
    state.settings = { bgm: false, sfx: true, sensitivity: 50 };
    state.coins = 142;
    state.energy = 3;
    state.unlocks = { hint: true, eraser: false };
    state.gridOn = true;
    state.lastEnergyAt = 1700000000000;
    state.achievements = { firstWin: { unlockedAt: 1700000000001 } };
    state.streak = 2;
    state.lastDailyDate = '2026-05-18';
    state.seenTips = { hint: true, eraser: false };
    state.levelsCleared = 9;
    state.flawlessStreak = 1;
    state.spentCoinsTotal = 25;

    savePersisted();
    const raw = (globalThis.localStorage as unknown as MemoryStorage).getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(Object.keys(parsed)).toEqual([...EXPECTED_PERSISTED_KEYS]);
  });

  it('save then load round-trip produces equivalent state', () => {
    state.bestScores = { '8x12': 5, '14x22': 21 };
    state.currentLevel = 12;
    state.maxLevelUnlocked = 13;
    state.levelStars = { 1: 3, 2: 3, 3: 2, 12: 1 };
    state.settings = { bgm: true, sfx: false, sensitivity: 80 };
    state.coins = 333;
    state.energy = 0;
    state.unlocks = { hint: true, eraser: true };
    state.gridOn = false;
    state.lastEnergyAt = 1700000123456;
    state.achievements = {
      firstWin: { unlockedAt: 1 },
      level10: { unlockedAt: 2 },
    };
    state.streak = 7;
    state.lastDailyDate = '2026-01-01';
    state.seenTips = { hint: true, eraser: true };
    state.levelsCleared = 50;
    state.flawlessStreak = 4;
    state.spentCoinsTotal = 200;

    savePersisted();
    const snapshot = JSON.stringify({
      bestScores: state.bestScores,
      currentLevel: state.currentLevel,
      maxLevelUnlocked: state.maxLevelUnlocked,
      levelStars: state.levelStars,
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
    });

    state.coins = 0;
    state.currentLevel = 1;
    state.maxLevelUnlocked = 1;
    state.levelStars = {};
    state.unlocks = { hint: false, eraser: false };

    loadPersisted();
    const reloaded = JSON.stringify({
      bestScores: state.bestScores,
      currentLevel: state.currentLevel,
      maxLevelUnlocked: state.maxLevelUnlocked,
      levelStars: state.levelStars,
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
    });
    expect(reloaded).toBe(snapshot);
  });

  it('legacy v7 save (with `difficulty` key) loads cleanly with migration', () => {
    const legacy = {
      bestScores: { '8x12': 3 },
      currentLevel: 4,
      difficulty: 'easy',
      settings: { bgm: false, sfx: true, sensitivity: 50 },
      coins: 50,
      energy: 5,
      unlocks: { hint: false, eraser: false },
      gridOn: true,
      lastEnergyAt: 1700000000000,
      achievements: {},
      streak: 0,
      lastDailyDate: '',
      seenTips: { hint: false, eraser: false },
      levelsCleared: 3,
      flawlessStreak: 0,
      spentCoinsTotal: 0,
      firstPlay: false,
    };
    (globalThis.localStorage as unknown as MemoryStorage).setItem(
      'arrowmaze.v7.state',
      JSON.stringify(legacy),
    );
    state.currentLevel = 1;
    state.maxLevelUnlocked = 1;
    state.levelStars = {};
    loadPersisted();
    expect(state.currentLevel).toBe(4);
    expect(state.bestScores).toEqual({ '8x12': 3 });
    // Migration: pre-Tier1 saves get maxLevelUnlocked = currentLevel.
    expect(state.maxLevelUnlocked).toBe(4);
    expect(state.levelStars).toEqual({});
  });

  it('savePersisted writes firstPlay: false even when state.firstPlay is true', () => {
    state.firstPlay = true;
    savePersisted();
    const raw = (globalThis.localStorage as unknown as MemoryStorage).getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.firstPlay).toBe(false);
  });

  it('unknown localStorage gracefully no-ops via try/catch', () => {
    const saved = globalThis.localStorage;
    (globalThis as unknown as { localStorage?: MemoryStorage }).localStorage = undefined;
    expect(() => savePersisted()).not.toThrow();
    expect(() => loadPersisted()).not.toThrow();
    globalThis.localStorage = saved;
  });

  it('first-time load (no save) leaves maxLevelUnlocked at default 1', () => {
    state.maxLevelUnlocked = 1;
    loadPersisted();
    expect(state.maxLevelUnlocked).toBe(1);
  });
});
