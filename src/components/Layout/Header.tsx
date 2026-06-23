import { Map, BarChart3, Home } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { LanguageSelector } from '../UI/LanguageSelector';
import { ThemeToggle } from '../UI/ThemeToggle';
import type { AppView } from '../../App';

interface Props {
  view: AppView;
  onViewChange: (v: AppView) => void;
}

export function Header({ view, onViewChange }: Props) {
  const { status, goToMenu } = useGameStore();

  const handleLogoClick = () => {
    if (view !== 'landing') {
      if (status === 'playing') goToMenu();
      onViewChange('landing');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6
      bg-[#050814]/85 backdrop-blur-xl border-b border-slate-800/60">

      {/* Logo */}
      <button onClick={handleLogoClick} className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
          flex items-center justify-center shadow-glow-sm
          group-hover:scale-105 group-hover:shadow-glow transition-all duration-200 shrink-0">
          <Map size={17} className="text-white" strokeWidth={2.2} />
        </div>
        <span className="font-black text-lg tracking-tight hidden sm:block">
          <span className="gradient-text">GeoO</span>
          <span className="text-slate-300">'yin</span>
        </span>
      </button>

      {/* Centre nav */}
      <nav className="flex items-center gap-0.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 p-1
        backdrop-blur-sm">
        <button
          onClick={() => onViewChange('landing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            transition-all duration-200
            ${view === 'landing'
              ? 'bg-white/8 text-white border border-white/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}
        >
          <Home size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">Bosh sahifa</span>
        </button>
        <button
          onClick={() => onViewChange('game')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            transition-all duration-200
            ${view === 'game'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}
        >
          <Map size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">O'yin</span>
        </button>
        <button
          onClick={() => onViewChange('demographics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
            transition-all duration-200
            ${view === 'demographics'
              ? 'bg-cyan-600/25 text-cyan-300 border border-cyan-500/25'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}
        >
          <BarChart3 size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">Demografiya</span>
        </button>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
