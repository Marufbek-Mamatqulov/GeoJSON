import { Map } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { LanguageSelector } from '../UI/LanguageSelector';
import { ThemeToggle } from '../UI/ThemeToggle';

export function Header() {
  const { status, goToMenu } = useGameStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6
      bg-[#050814]/90 backdrop-blur-xl border-b border-slate-800/60">

      <button
        onClick={status !== 'menu' ? goToMenu : undefined}
        className="flex items-center gap-3 group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
          flex items-center justify-center shadow-glow-sm
          group-hover:scale-105 transition-transform duration-200 shrink-0">
          <Map size={17} className="text-white" strokeWidth={2.2} />
        </div>
        <span className="font-black text-lg tracking-tight hidden sm:block">
          <span className="gradient-text">GeoO</span>
          <span className="text-slate-300">'yin</span>
        </span>
      </button>

      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
