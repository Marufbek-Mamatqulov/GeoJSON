import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50
        hover:bg-slate-700/80 hover:border-indigo-500/40
        flex items-center justify-center
        transition-all duration-200 hover:scale-105"
    >
      {theme === 'dark'
        ? <Sun size={17} className="text-amber-400" strokeWidth={2} />
        : <Moon size={17} className="text-indigo-400" strokeWidth={2} />}
    </button>
  );
}
