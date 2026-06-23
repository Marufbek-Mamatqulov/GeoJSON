import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GameMode } from '../../types';

interface ModeStyle {
  gradient: string;
  glow: string;
  iconBg: string;
  iconGlow: string;
  textColor: string;
}

const MODE_STYLES: Record<GameMode, ModeStyle> = {
  provinces: {
    gradient:  'from-indigo-600/25 via-blue-600/10 to-indigo-600/5',
    glow:      'border-indigo-500/60 shadow-[0_0_28px_rgba(99,102,241,.25)]',
    iconBg:    'from-indigo-500 to-blue-600',
    iconGlow:  'shadow-[0_4px_18px_rgba(99,102,241,.6)]',
    textColor: 'text-indigo-300',
  },
  districts: {
    gradient:  'from-violet-600/25 via-purple-600/10 to-violet-600/5',
    glow:      'border-violet-500/60 shadow-[0_0_28px_rgba(139,92,246,.25)]',
    iconBg:    'from-violet-500 to-purple-600',
    iconGlow:  'shadow-[0_4px_18px_rgba(139,92,246,.6)]',
    textColor: 'text-violet-300',
  },
  capitals: {
    gradient:  'from-amber-600/25 via-orange-600/10 to-amber-600/5',
    glow:      'border-amber-500/60 shadow-[0_0_28px_rgba(245,158,11,.25)]',
    iconBg:    'from-amber-400 to-orange-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(245,158,11,.6)]',
    textColor: 'text-amber-300',
  },
  cities: {
    gradient:  'from-cyan-600/25 via-teal-600/10 to-cyan-600/5',
    glow:      'border-cyan-500/60 shadow-[0_0_28px_rgba(6,182,212,.25)]',
    iconBg:    'from-cyan-500 to-teal-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(6,182,212,.6)]',
    textColor: 'text-cyan-300',
  },
  mountains: {
    gradient:  'from-slate-500/25 via-zinc-600/10 to-slate-600/5',
    glow:      'border-slate-400/60 shadow-[0_0_28px_rgba(148,163,184,.25)]',
    iconBg:    'from-slate-400 to-zinc-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(148,163,184,.5)]',
    textColor: 'text-slate-300',
  },
  rivers: {
    gradient:  'from-sky-600/25 via-blue-600/10 to-sky-600/5',
    glow:      'border-sky-500/60 shadow-[0_0_28px_rgba(14,165,233,.25)]',
    iconBg:    'from-sky-400 to-blue-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(14,165,233,.6)]',
    textColor: 'text-sky-300',
  },
  historical: {
    gradient:  'from-orange-600/25 via-amber-600/10 to-orange-600/5',
    glow:      'border-orange-500/60 shadow-[0_0_28px_rgba(249,115,22,.25)]',
    iconBg:    'from-orange-400 to-amber-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(249,115,22,.6)]',
    textColor: 'text-orange-300',
  },
  attractions: {
    gradient:  'from-pink-600/25 via-rose-600/10 to-pink-600/5',
    glow:      'border-pink-500/60 shadow-[0_0_28px_rgba(236,72,153,.25)]',
    iconBg:    'from-pink-500 to-rose-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(236,72,153,.6)]',
    textColor: 'text-pink-300',
  },
  reservoirs: {
    gradient:  'from-teal-600/25 via-cyan-600/10 to-teal-600/5',
    glow:      'border-teal-500/60 shadow-[0_0_28px_rgba(20,184,166,.25)]',
    iconBg:    'from-teal-400 to-cyan-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(20,184,166,.6)]',
    textColor: 'text-teal-300',
  },
  forests: {
    gradient:  'from-emerald-600/25 via-green-600/10 to-emerald-600/5',
    glow:      'border-emerald-500/60 shadow-[0_0_28px_rgba(16,185,129,.25)]',
    iconBg:    'from-emerald-400 to-green-500',
    iconGlow:  'shadow-[0_4px_18px_rgba(16,185,129,.6)]',
    textColor: 'text-emerald-300',
  },
};

interface Props {
  mode: GameMode;
  Icon: LucideIcon;
  title: string;
  active: boolean;
  onClick: () => void;
}

export function ModeCard({ mode, Icon, title, active, onClick }: Props) {
  const s = MODE_STYLES[mode];

  return (
    <button
      onClick={onClick}
      className={`relative w-full flex flex-col items-center justify-center gap-3 p-4 pt-5 pb-4
        rounded-2xl border-2 transition-all duration-300 group overflow-hidden
        ${active
          ? `bg-gradient-to-b ${s.gradient} ${s.glow} scale-[1.02]`
          : 'border-slate-700/40 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600/60 hover:scale-[1.01]'
        }`}
    >
      {/* Shimmer on active */}
      {active && <div className="absolute inset-0 shimmer pointer-events-none" />}

      {/* Icon box */}
      <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${s.iconBg}
        flex items-center justify-center
        transition-all duration-300
        ${active ? `${s.iconGlow} scale-110` : 'shadow-lg group-hover:scale-105 group-hover:shadow-xl'}`}>
        <Icon size={22} className="text-white" strokeWidth={2} />

        {/* Active checkmark badge */}
        {active && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
            bg-white flex items-center justify-center
            shadow-[0_2px_8px_rgba(0,0,0,.3)]">
            <Check size={11} className={s.textColor.replace('text-', 'text-')} strokeWidth={3.5} />
          </span>
        )}
      </div>

      {/* Title */}
      <p className={`text-[11px] font-black text-center leading-tight tracking-wide uppercase
        transition-colors duration-200
        ${active ? s.textColor : 'text-slate-400 group-hover:text-slate-200'}`}>
        {title}
      </p>
    </button>
  );
}
