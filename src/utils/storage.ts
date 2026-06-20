import type { GameStats, GameMode, Difficulty } from '../types';

const KEY = 'geo-stats';

const defaultStats = (): GameStats => ({
  gamesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  highScores: {},
  totalTimePlayed: 0,
  lastPlayed: '',
  streak: 0,
  bestStreak: 0,
});

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // ignore quota errors
  }
}

export function updateStats(
  score: number,
  correct: number,
  wrong: number,
  timeSec: number,
  mode: GameMode,
  difficulty: Difficulty,
  streak: number,
): GameStats {
  const stats = loadStats();
  stats.gamesPlayed += 1;
  stats.totalCorrect += correct;
  stats.totalWrong += wrong;
  stats.totalTimePlayed += timeSec;
  stats.lastPlayed = new Date().toISOString();

  if (!stats.highScores[mode]) stats.highScores[mode] = {};
  const modeScores = stats.highScores[mode]!;
  if ((modeScores[difficulty] ?? 0) < score) {
    modeScores[difficulty] = score;
  }

  if (streak > (stats.bestStreak ?? 0)) {
    stats.bestStreak = streak;
  }

  saveStats(stats);
  return stats;
}

export function clearStats(): void {
  localStorage.removeItem(KEY);
}
