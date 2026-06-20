import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Theme, Difficulty } from '../types';

interface SettingsState {
  language: Language;
  theme: Theme;
  difficulty: Difficulty;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setDifficulty: (diff: Difficulty) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'uz',
      theme: 'dark',
      difficulty: 'medium',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setDifficulty: (difficulty) => set({ difficulty }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    { name: 'geo-settings' }
  )
);
