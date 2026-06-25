import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Theme, Difficulty, GameStrategy } from '../types';

interface SettingsState {
  language: Language;
  theme: Theme;
  difficulty: Difficulty;
  gameStrategy: GameStrategy;
  showLabels: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setDifficulty: (diff: Difficulty) => void;
  setGameStrategy: (s: GameStrategy) => void;
  setShowLabels: (v: boolean) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'uz',
      theme: 'dark',
      difficulty: 'medium',
      gameStrategy: 'seterra',
      showLabels: true,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setGameStrategy: (gameStrategy) => set({ gameStrategy }),
      setShowLabels: (showLabels) => set({ showLabels }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'geo-settings' }
  )
);
