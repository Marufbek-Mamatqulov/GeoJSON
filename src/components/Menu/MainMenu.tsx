import { useState } from 'react';
import {
  Globe, Map, MapPin, Landmark, Building2,
  Mountain, Waves, Clock, Star, Droplets, Trees,
  Leaf, Zap, Flame, Play, BarChart3, ChevronLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ModeCard } from './ModeCard';
import { StatsModal } from '../Stats/StatsModal';
import { t } from '../../i18n';
import type { GameMode, Difficulty, Province, District, City, GeoFeature, Question } from '../../types';

interface Props {
  provinces: Province[];
  districts: District[];
  cities: City[];
  mountains: GeoFeature[];
  rivers: GeoFeature[];
  historical: GeoFeature[];
  attractions: GeoFeature[];
  reservoirs: GeoFeature[];
  forests: GeoFeature[];
  buildQuestions: (mode: GameMode) => Question[];
  onBackToLanding: () => void;
}

interface ModeEntry { id: GameMode; Icon: LucideIcon }

const CATEGORIES: { labelKey: Parameters<typeof t>[1]; color: string; modes: ModeEntry[] }[] = [
  {
    labelKey: 'cat_geography',
    color: 'text-indigo-400',
    modes: [
      { id: 'provinces', Icon: Map       },
      { id: 'districts', Icon: MapPin    },
      { id: 'capitals',  Icon: Landmark  },
      { id: 'cities',    Icon: Building2 },
    ],
  },
  {
    labelKey: 'cat_nature',
    color: 'text-emerald-400',
    modes: [
      { id: 'mountains',  Icon: Mountain  },
      { id: 'rivers',     Icon: Waves     },
      { id: 'reservoirs', Icon: Droplets  },
      { id: 'forests',    Icon: Trees     },
    ],
  },
  {
    labelKey: 'cat_culture',
    color: 'text-amber-400',
    modes: [
      { id: 'historical',  Icon: Clock },
      { id: 'attractions', Icon: Star  },
    ],
  },
];

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];

const DIFF_CONFIG: Record<Difficulty, {
  Icon: LucideIcon;
  color: string;
  ring: string;
  bg: string;
  iconColor: string;
}> = {
  easy:   { Icon: Leaf,  color: 'text-emerald-400', iconColor: 'text-emerald-400', ring: 'border-emerald-500/50 shadow-[0_0_14px_rgba(16,185,129,.25)]', bg: 'from-emerald-600/20 to-teal-600/10' },
  medium: { Icon: Zap,   color: 'text-amber-400',   iconColor: 'text-amber-400',   ring: 'border-amber-500/50  shadow-[0_0_14px_rgba(245,158,11,.25)]',  bg: 'from-amber-600/20  to-orange-600/10' },
  hard:   { Icon: Flame, color: 'text-rose-400',    iconColor: 'text-rose-400',    ring: 'border-rose-500/50   shadow-[0_0_14px_rgba(244,63,94,.25)]',   bg: 'from-rose-600/20   to-red-600/10' },
};

export function MainMenu({ buildQuestions, onBackToLanding }: Props) {
  const { startGame, setShowStats, showStats } = useGameStore();
  const { language, difficulty, setDifficulty } = useSettingsStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>('provinces');

  const handleStart = () => {
    startGame(selectedMode, difficulty, buildQuestions(selectedMode));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 pb-10 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[380px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative text-center mb-7 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10
          border border-indigo-500/25 flex items-center justify-center mx-auto mb-4 animate-float">
          <Globe size={30} className="text-indigo-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1.5 leading-none">
          <span className="gradient-text">GeoO</span>
          <span className="text-slate-200">'yin</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">{t(language, 'tagline')}</p>

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-2.5 py-1 rounded-full border text-xs font-semibold bg-indigo-500/10 border-indigo-500/25 text-indigo-300">15 savol</span>
          <span className="px-2.5 py-1 rounded-full border text-xs font-semibold bg-violet-500/10 border-violet-500/25 text-violet-300">3 til</span>
          <span className="px-2.5 py-1 rounded-full border text-xs font-semibold bg-cyan-500/10 border-cyan-500/25 text-cyan-300">208 tuman</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md space-y-4 animate-slide-up">

        {/* Mode selection — 2-column grid per category */}
        <section>
          <p className="section-label mb-3">{t(language, 'chooseMode')}</p>
          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <div key={cat.labelKey}>
                {/* Category label */}
                <p className={`text-[9px] font-black uppercase tracking-[0.18em] mb-2 px-0.5 ${cat.color}`}>
                  — {t(language, cat.labelKey)} —
                </p>

                {/* 2-column grid */}
                <div className="grid grid-cols-2 gap-2">
                  {cat.modes.map(({ id, Icon }) => (
                    <ModeCard
                      key={id}
                      mode={id}
                      Icon={Icon}
                      title={t(language, `mode_${id}` as Parameters<typeof t>[1])}
                      active={selectedMode === id}
                      onClick={() => setSelectedMode(id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <p className="section-label">{t(language, 'chooseDifficulty')}</p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFS.map((d) => {
              const cfg = DIFF_CONFIG[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`relative p-3.5 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden group ${
                    active
                      ? `bg-gradient-to-br ${cfg.bg} ${cfg.ring}`
                      : 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                  }`}
                >
                  {active && <div className="absolute inset-0 shimmer pointer-events-none" />}
                  <div className={`flex justify-center mb-1.5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <cfg.Icon
                      size={20}
                      className={active ? cfg.iconColor : 'text-slate-500 group-hover:text-slate-300'}
                      strokeWidth={2}
                    />
                  </div>
                  <div className={`font-black text-sm ${active ? cfg.color : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {t(language, d as Parameters<typeof t>[1])}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                    {t(language, `${d}_desc` as Parameters<typeof t>[1])}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden group
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-glow hover:shadow-glow-lg
              active:scale-[.98] transition-all duration-200"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Play size={18} strokeWidth={2.5} className="fill-white" />
              <span>{t(language, 'start')}</span>
            </span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="w-full py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-200
              border border-slate-700/50 hover:border-indigo-500/30
              hover:bg-indigo-500/8 transition-all duration-200
              flex items-center justify-center gap-2"
          >
            <BarChart3 size={16} strokeWidth={2} />
            <span>{t(language, 'stats')}</span>
          </button>

          <button
            onClick={onBackToLanding}
            className="w-full py-2 rounded-2xl font-medium text-xs text-slate-600 hover:text-slate-400
              flex items-center justify-center gap-1.5 transition-colors duration-200"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
