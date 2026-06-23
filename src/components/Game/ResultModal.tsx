import { Trophy, Award, Star, ThumbsUp, TrendingUp, RefreshCw, Home, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { loadStats } from '../../utils/storage';
import { t } from '../../i18n';
import type { GameMode, Difficulty } from '../../types';

interface Props {
  onPlayAgain: () => void;
  onGoToMenu?: () => void;
  provinces: import('../../types').Province[];
  districts: import('../../types').District[];
  cities: import('../../types').City[];
}

type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

const GRADE_CONFIG: Record<Grade, {
  Icon: LucideIcon;
  label: string;
  iconColor: string;
  bg: string;
  border: string;
  textGradient: string;
}> = {
  S: { Icon: Trophy,     label: 'MUKAMMAL',  iconColor: 'text-amber-300',  bg: 'from-amber-500/25  to-yellow-500/10',  border: 'border-amber-500/40',  textGradient: 'from-yellow-300 via-amber-400 to-orange-400' },
  A: { Icon: Award,      label: 'AJOYIB',    iconColor: 'text-indigo-300', bg: 'from-indigo-500/25 to-violet-500/10',  border: 'border-indigo-500/40', textGradient: 'from-indigo-300 via-violet-400 to-purple-400' },
  B: { Icon: Star,       label: 'YAXSHI',    iconColor: 'text-cyan-300',   bg: 'from-cyan-500/20   to-blue-500/10',    border: 'border-cyan-500/35',   textGradient: 'from-cyan-300   via-blue-400  to-indigo-400' },
  C: { Icon: ThumbsUp,   label: "QO'NIQARLI",iconColor: 'text-slate-300',  bg: 'from-slate-600/20  to-slate-700/10',   border: 'border-slate-500/35',  textGradient: 'from-slate-300  via-slate-400 to-slate-500' },
  D: { Icon: TrendingUp, label: 'HARAKAT',   iconColor: 'text-rose-300',   bg: 'from-rose-500/20   to-red-500/10',     border: 'border-rose-500/35',   textGradient: 'from-rose-300   via-red-400   to-orange-400' },
};

function getGrade(pct: number): Grade {
  if (pct >= 90) return 'S';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 40) return 'C';
  return 'D';
}

export function ResultModal({ onPlayAgain, onGoToMenu }: Props) {
  const { score, answers, mode, difficulty, goToMenu } = useGameStore();
  const handleMenu = () => { if (onGoToMenu) onGoToMenu(); else goToMenu(); };
  const { language } = useSettingsStore();
  const stats = loadStats();

  const correct  = answers.filter(a => a.correct).length;
  const wrong    = answers.filter(a => !a.correct).length;
  const total    = answers.length;
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade    = getGrade(pct);
  const cfg      = GRADE_CONFIG[grade];
  const { Icon } = cfg;

  const prevBest    = stats.highScores[mode as GameMode]?.[difficulty as Difficulty] ?? 0;
  const isHighScore = score > 0 && score >= prevBest;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-[#050814]">

      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-bounce-in">

        {/* Grade display */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl
            bg-gradient-to-br ${cfg.bg} border ${cfg.border}
            shadow-2xl mb-4 animate-float`}>
            <Icon size={42} className={cfg.iconColor} strokeWidth={1.5} />
          </div>

          <div className={`text-3xl font-black tracking-tight mb-2
            bg-gradient-to-r ${cfg.textGradient} bg-clip-text text-transparent`}>
            {cfg.label}
          </div>

          {isHighScore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              bg-amber-500/12 border border-amber-500/25 text-amber-300 text-xs font-bold">
              <Sparkles size={12} strokeWidth={2} />
              {t(language, 'newHighScore')}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/12 to-violet-500/8
          border border-indigo-500/20 p-6 mb-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            {t(language, 'finalScore')}
          </p>
          <p className="text-6xl font-black gradient-text tabular-nums leading-none">{score}</p>
          <p className="text-xs text-slate-600 mt-2 font-medium">pts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-3 text-center">
            <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-1" strokeWidth={2} />
            <p className="text-xl font-black text-emerald-400">{correct}</p>
            <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wide font-bold">
              {t(language, 'correctAnswers')}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-3 text-center">
            <XCircle size={18} className="text-rose-400 mx-auto mb-1" strokeWidth={2} />
            <p className="text-xl font-black text-rose-400">{wrong}</p>
            <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wide font-bold">
              {t(language, 'wrongAnswers')}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-3 text-center">
            <p className="text-lg font-black text-indigo-400 mb-1">{pct}%</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-wide font-bold">
              {t(language, 'accuracy')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden group
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-glow hover:shadow-glow-lg
              active:scale-[.98] transition-all duration-200"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <RefreshCw size={17} strokeWidth={2.5} />
              <span>{t(language, 'playAgain')}</span>
            </span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
          </button>

          <button
            onClick={handleMenu}
            className="w-full py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-200
              border border-slate-700/50 hover:border-indigo-500/30
              hover:bg-indigo-500/8 transition-all duration-200
              flex items-center justify-center gap-2"
          >
            <Home size={15} strokeWidth={2} />
            <span>{t(language, 'mainMenu')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
