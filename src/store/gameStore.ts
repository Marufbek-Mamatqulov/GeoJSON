import { create } from 'zustand';
import type {
  GameMode, GameStatus, Difficulty, Question, AnswerResult, AnswerFeedback,
} from '../types';

interface GameState {
  status: GameStatus;
  mode: GameMode;
  difficulty: Difficulty;
  scopeProvinceId: string | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  lives: number;
  timeLeft: number;
  answers: AnswerResult[];
  feedback: AnswerFeedback;
  highlightCorrectId: string | null;
  highlightWrongId: string | null;
  showStats: boolean;
  currentStreak: number;

  // Seterra/WorldGeo strategy state
  questionAttempts: number;
  revealedMap: Record<string, 'correct' | 'missed'>;

  startGame: (mode: GameMode, difficulty: Difficulty, questions: Question[], scopeProvinceId?: string | null) => void;
  nextQuestion: () => void;
  addAnswer: (result: AnswerResult) => void;
  setFeedback: (feedback: AnswerFeedback, correctId?: string, wrongId?: string) => void;
  clearFeedback: () => void;
  setTimeLeft: (t: number) => void;
  tickTimer: () => void;
  loseLife: () => void;
  endGame: () => void;
  goToMenu: () => void;
  setShowStats: (v: boolean) => void;
  addAttempt: () => void;
  revealRegion: (id: string, type: 'correct' | 'missed') => void;
}

const TIME: Record<Difficulty, number> = { easy: 45, medium: 30, hard: 15 };

export const useGameStore = create<GameState>((set, get) => ({
  status: 'menu',
  mode: 'provinces',
  difficulty: 'medium',
  scopeProvinceId: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  lives: Number.POSITIVE_INFINITY,
  timeLeft: 30,
  answers: [],
  feedback: null,
  highlightCorrectId: null,
  highlightWrongId: null,
  showStats: false,
  currentStreak: 0,
  questionAttempts: 0,
  revealedMap: {},

  startGame: (mode, difficulty, questions, scopeProvinceId = null) => set({
    status: 'playing',
    mode,
    difficulty,
    scopeProvinceId,
    questions,
    currentIndex: 0,
    score: 0,
    lives: Number.POSITIVE_INFINITY,
    timeLeft: TIME[difficulty],
    answers: [],
    feedback: null,
    highlightCorrectId: null,
    highlightWrongId: null,
    currentStreak: 0,
    questionAttempts: 0,
    revealedMap: {},
  }),

  nextQuestion: () => {
    const { currentIndex, questions, difficulty } = get();
    if (currentIndex + 1 >= questions.length) {
      set({ status: 'results' });
    } else {
      set({
        currentIndex: currentIndex + 1,
        timeLeft: TIME[difficulty],
        feedback: null,
        highlightCorrectId: null,
        highlightWrongId: null,
        questionAttempts: 0,
      });
    }
  },

  addAnswer: (result) => set((s) => ({
    answers: [...s.answers, result],
    score: Math.max(0, s.score + result.pointsEarned),
    currentStreak: result.correct ? s.currentStreak + 1 : 0,
  })),

  setFeedback: (feedback, correctId, wrongId) => set({
    feedback,
    highlightCorrectId: correctId ?? null,
    highlightWrongId: wrongId ?? null,
  }),

  clearFeedback: () => set({
    feedback: null,
    highlightCorrectId: null,
    highlightWrongId: null,
  }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),

  tickTimer: () => {
    const { timeLeft } = get();
    if (timeLeft > 0) set({ timeLeft: timeLeft - 1 });
  },

  loseLife: () => {},

  endGame: () => set({ status: 'results' }),
  goToMenu: () => set({
    status: 'menu',
    scopeProvinceId: null,
    feedback: null,
    highlightCorrectId: null,
    highlightWrongId: null,
    questionAttempts: 0,
    revealedMap: {},
  }),
  setShowStats: (showStats) => set({ showStats }),

  addAttempt: () => set((s) => ({ questionAttempts: s.questionAttempts + 1 })),
  revealRegion: (id, type) => set((s) => ({
    revealedMap: { ...s.revealedMap, [id]: type },
  })),
}));
