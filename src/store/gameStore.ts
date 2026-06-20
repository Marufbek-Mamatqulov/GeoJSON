import { create } from 'zustand';
import type {
  GameMode, GameStatus, Difficulty, Question, AnswerResult, AnswerFeedback,
} from '../types';

interface GameState {
  status: GameStatus;
  mode: GameMode;
  difficulty: Difficulty;
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

  startGame: (mode: GameMode, difficulty: Difficulty, questions: Question[]) => void;
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
}

const LIVES: Record<Difficulty, number> = { easy: 5, medium: 3, hard: 2 };
const TIME: Record<Difficulty, number> = { easy: 45, medium: 30, hard: 15 };

export const useGameStore = create<GameState>((set, get) => ({
  status: 'menu',
  mode: 'provinces',
  difficulty: 'medium',
  questions: [],
  currentIndex: 0,
  score: 0,
  lives: 3,
  timeLeft: 30,
  answers: [],
  feedback: null,
  highlightCorrectId: null,
  highlightWrongId: null,
  showStats: false,
  currentStreak: 0,

  startGame: (mode, difficulty, questions) => set({
    status: 'playing',
    mode,
    difficulty,
    questions,
    currentIndex: 0,
    score: 0,
    lives: LIVES[difficulty],
    timeLeft: TIME[difficulty],
    answers: [],
    feedback: null,
    highlightCorrectId: null,
    highlightWrongId: null,
    currentStreak: 0,
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

  loseLife: () => {
    const { lives } = get();
    if (lives <= 1) {
      set({ lives: 0, status: 'results' });
    } else {
      set({ lives: lives - 1 });
    }
  },

  endGame: () => set({ status: 'results' }),
  goToMenu: () => set({ status: 'menu', feedback: null, highlightCorrectId: null, highlightWrongId: null }),
  setShowStats: (showStats) => set({ showStats }),
}));
