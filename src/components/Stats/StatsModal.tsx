import { useState } from 'react';
import {
  BarChart3, X, Gamepad2, Target, Flame,
  CheckCircle2, XCircle, Clock, Trash2,
  Map, MapPin, Landmark, Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { loadStats, clearStats } from '../../utils/storage';
import { useSettingsStore } from '../../store/settingsStore';
import { t } from '../../i18n';
import type { GameMode, Difficulty } from '../../types';

interface Props { onClose: () => void }

const MODES: GameMode[] = ['provinces', 'districts', 'capitals', 'cities'];
const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];

const MODE_ICONS: Record<GameMode, LucideIcon> = {
  provinces: Map, districts: MapPin, capitals: Landmark, cities: Building2,
};

const DIFF_LABELS: Record<Difficulty, { label: string; cls: string }> = {
  easy:   { label: 'O',  cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  medium: { label: "O'", cls: 'bg-amber-500/15   text-amber-300   border-amber-500/25'  },
  hard:   { label: 'Q',  cls: 'bg-rose-500/15    text-rose-300    border-rose-500/25'   },
};

function fmtTime(secs: number, lang: string) {
  if (secs < 60) return `${secs}s`;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}${lang === 'en' ? 'h' : lang === 'ru' ? 'ч' : 'soat'} ${m}${lang === 'en' ? 'm' : lang === 'ru' ? 'м' : 'daq'}`;
  return `${m}${lang === 'en' ? 'm' : lang === 'ru' ? 'м' : 'daq'}`;
}

export function StatsModal({ onClose }: Props) {
  const { language } = useSettingsStore();
  const [stats, setStats] = useState(loadStats);

  const total = stats.totalCorrect + stats.totalWrong;
  const acc   = total > 0 ? Math.round((stats.totalCorrect / total) * 100) : 0;

  const handleClear = () => {
    clearStats();
    setStats(loadStats());
  };

  const statItems: { label: string; value: string | number; Icon: LucideIcon; color: string }[] = [
    { label: t(language, 'gamesPlayed'),  value: stats.gamesPlayed,  Icon: Gamepad2,    color: 'text-indigo-400' },
    { label: t(language, 'accuracy'),     value: `${acc}%`,           Icon: Target,      color: 'text-violet-400' },
    { label: t(language, 'bestStreak'),   value: stats.bestStreak,    Icon: Flame,       color: 'text-amber-400' },
    { label: t(language, 'totalCorrect'), value: stats.totalCorrect,  Icon: CheckCircle2,color: 'text-emerald-400' },
    { label: t(language, 'totalWrong'),   value: stats.totalWrong,    Icon: XCircle,     color: 'text-rose-400' },
    { label: t(language, 'totalTime'),    value: fmtTime(stats.totalTimePlayed, language), Icon: Clock, color: 'text-cyan-400' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4
      bg-black/70 backdrop-blur-sm animate-fade-in">

      <div className="w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl overflow-hidden
        bg-[#0a0e1f] border border-slate-700/50 shadow-2xl shadow-black/60 animate-bounce-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20
              flex items-center justify-center">
              <BarChart3 size={15} className="text-indigo-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-none">
                {t(language, 'statsTitle')}
              </h2>
              {stats.gamesPlayed > 0 && (
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {stats.gamesPlayed} {t(language, 'gamesPlayed').toLowerCase()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/50
              hover:border-rose-500/35 hover:bg-rose-500/10
              flex items-center justify-center transition-all duration-200 group"
          >
            <X size={14} className="text-slate-400 group-hover:text-rose-400" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {stats.gamesPlayed === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40
                flex items-center justify-center mx-auto">
                <Gamepad2 size={24} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-slate-500 text-sm">{t(language, 'noStats')}</p>
            </div>
          ) : (
            <>
              {/* Overview */}
              <div className="grid grid-cols-3 gap-2">
                {statItems.map(({ label, value, Icon, color }) => (
                  <div key={label}
                    className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-3 text-center">
                    <Icon size={15} className={`${color} mx-auto mb-1.5`} strokeWidth={2} />
                    <p className={`text-lg font-black ${color} tabular-nums leading-none`}>{value}</p>
                    <p className="text-[9px] text-slate-600 mt-1 leading-tight font-bold uppercase tracking-wide">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* High Scores */}
              {MODES.some(m => {
                const ms = stats.highScores[m];
                return ms && Math.max(...DIFFS.map(d => ms[d] ?? 0)) > 0;
              }) && (
                <div>
                  <p className="section-label">{t(language, 'bestScore')}</p>
                  <div className="space-y-2">
                    {MODES.map(mode => {
                      const ms = stats.highScores[mode];
                      if (!ms) return null;
                      const best = Math.max(...DIFFS.map(d => ms[d] ?? 0));
                      if (best === 0) return null;
                      const ModeIcon = MODE_ICONS[mode];

                      return (
                        <div key={mode}
                          className="flex items-center justify-between rounded-2xl
                            bg-slate-800/40 border border-slate-700/40 px-4 py-3">
                          <span className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                            <ModeIcon size={14} strokeWidth={2} className="text-indigo-400" />
                            {t(language, `mode_${mode}` as Parameters<typeof t>[1])}
                          </span>
                          <div className="flex gap-1.5">
                            {DIFFS.map(d => ms[d] ? (
                              <span key={d}
                                className={`text-xs px-2 py-0.5 rounded-full border font-bold ${DIFF_LABELS[d].cls}`}>
                                {ms[d]}
                              </span>
                            ) : null)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clear */}
              <button
                onClick={handleClear}
                className="w-full py-2.5 rounded-2xl text-sm font-bold
                  text-rose-400/70 hover:text-rose-300
                  border border-rose-500/15 hover:border-rose-500/35 hover:bg-rose-500/8
                  flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Trash2 size={14} strokeWidth={2} />
                {t(language, 'clearStats')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
