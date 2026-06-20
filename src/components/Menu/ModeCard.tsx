import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GameMode } from '../../types';

const MODE_STYLES: Record<GameMode, { gradient: string; glow: string; iconBg: string }> = {
  provinces: {
    gradient: 'from-indigo-600/20 to-blue-600/10',
    glow:     'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,.2)]',
    iconBg:   'bg-gradient-to-br from-indigo-500 to-blue-600',
  },
  districts: {
    gradient: 'from-violet-600/20 to-purple-600/10',
    glow:     'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,.2)]',
    iconBg:   'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  capitals: {
    gradient: 'from-amber-600/20 to-orange-600/10',
    glow:     'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,.2)]',
    iconBg:   'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  cities: {
    gradient: 'from-cyan-600/20 to-teal-600/10',
    glow:     'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,.2)]',
    iconBg:   'bg-gradient-to-br from-cyan-500 to-teal-500',
  },
};

interface Props {
  mode: GameMode;
  Icon: LucideIcon;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

export function ModeCard({ mode, Icon, title, desc, active, onClick }: Props) {
  const s = MODE_STYLES[mode];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
        active
          ? `bg-gradient-to-br ${s.gradient} ${s.glow}`
          : 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
      }`}
    >
      {active && <div className="absolute inset-0 shimmer pointer-events-none" />}

      <div className="relative flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0 shadow-lg
          transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
          <Icon size={18} className="text-white" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm leading-tight ${
            active ? 'text-white' : 'text-slate-300 group-hover:text-white'
          }`}>
            {title}
          </p>
          <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5 leading-snug truncate">
            {desc}
          </p>
        </div>

        {active && (
          <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}
