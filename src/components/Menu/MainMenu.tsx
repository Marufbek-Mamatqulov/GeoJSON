import { useState } from 'react';
import {
  Globe, Map, MapPin, Building2,
  Mountain, Waves, Clock, Star, Droplets, Trees,
  Leaf, Zap, Flame, Play, BarChart3, ChevronLeft,
  Target, Layers, Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ModeCard } from './ModeCard';
import { StatsModal } from '../Stats/StatsModal';
import { t } from '../../i18n';
import type { GameMode, Difficulty, Province, District, City, GeoFeature, Question, GameStrategy } from '../../types';

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
  buildQuestions: (mode: GameMode, scopeProvinceId?: string | null, countLimit?: number | null) => Question[];
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

const STRATEGIES: { id: GameStrategy; Icon: LucideIcon; color: string; ring: string; bg: string }[] = [
  { id: 'seterra',  Icon: Target, color: 'text-indigo-400', ring: 'border-indigo-500/50 shadow-[0_0_14px_rgba(99,102,241,.25)]', bg: 'from-indigo-600/20 to-violet-600/10' },
  { id: 'worldgeo', Icon: Layers, color: 'text-cyan-400',   ring: 'border-cyan-500/50   shadow-[0_0_14px_rgba(6,182,212,.25)]',   bg: 'from-cyan-600/20   to-teal-600/10' },
];

const COUNTS = [10, 15, 20, null] as const;
type CountOption = 10 | 15 | 20 | null;

export function MainMenu({ provinces, buildQuestions, onBackToLanding }: Props) {
  const { startGame, setShowStats, showStats } = useGameStore();
  const { language, difficulty, setDifficulty, gameStrategy, setGameStrategy, showLabels, setShowLabels } = useSettingsStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>('provinces');
  const [districtScope, setDistrictScope] = useState<string>('');
  const [cityScope, setCityScope] = useState<string>('');
  const [countLimit, setCountLimit] = useState<CountOption>(15);

  const needsScope = selectedMode === 'districts' || selectedMode === 'cities';
  const scope = selectedMode === 'districts' ? districtScope : cityScope;
  const isScoped = !!scope;

  const provinceLabel = (province: Province) => {
    if (language === 'ru') return province.nameRu;
    if (language === 'en') return province.nameEn;
    return province.nameUz;
  };

  const handleStart = () => {
    const scopeProvinceId = needsScope ? (scope || null) : null;
    const limit = isScoped ? null : countLimit; // Province-scoped = show all
    startGame(selectedMode, difficulty, buildQuestions(selectedMode, scopeProvinceId, limit), scopeProvinceId);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 md:px-8 pb-10 md:pb-16 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[380px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative text-center mb-7 md:mb-9 animate-fade-in">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10
          border border-indigo-500/25 flex items-center justify-center mx-auto mb-4 animate-float">
          <Globe className="w-[30px] h-[30px] md:w-9 md:h-9 text-indigo-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-1.5 leading-none">
          <span className="gradient-text">GeoO</span>
          <span className="text-slate-200">'yin</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium">{t(language, 'tagline')}</p>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl space-y-4 md:space-y-5 animate-slide-up">

        {/* Mode selection */}
        <section>
          <p className="section-label md:text-sm mb-3">{t(language, 'chooseMode')}</p>
          <div className="space-y-4 md:space-y-5">
            {CATEGORIES.map(cat => (
              <div key={cat.labelKey}>
                <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.18em] mb-2 md:mb-3 px-0.5 ${cat.color}`}>
                  — {t(language, cat.labelKey)} —
                </p>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
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

        {/* Scope + Count (districts / cities) */}
        {needsScope && (
          <section className="space-y-2 md:space-y-3">
            <p className="section-label md:text-sm mb-2">{t(language, 'scopeLabel' as Parameters<typeof t>[1])}</p>
            <select
              value={scope}
              onChange={(e) => {
                if (selectedMode === 'districts') setDistrictScope(e.target.value);
                else setCityScope(e.target.value);
              }}
              className="w-full rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 md:py-4 text-sm md:text-base text-slate-100 outline-none focus:border-indigo-500/50"
            >
              <option value="">{t(language, 'scopeAll' as Parameters<typeof t>[1])}</option>
              {provinces
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((province) => (
                  <option key={province.id} value={province.id}>
                    {provinceLabel(province)}
                  </option>
                ))}
            </select>

            {/* Count selector — only when nationwide */}
            {!isScoped && (
              <div>
                <p className="section-label md:text-sm mb-2">{t(language, 'countLabel' as Parameters<typeof t>[1])}</p>
                <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                  {COUNTS.map((c) => {
                    const label = c === null
                      ? t(language, 'count_all' as Parameters<typeof t>[1])
                      : t(language, `count_${c}` as Parameters<typeof t>[1]);
                    return (
                      <button
                        key={String(c)}
                        onClick={() => setCountLimit(c)}
                        className={`py-2.5 md:py-3.5 rounded-xl text-xs md:text-sm font-bold border-2 transition-all duration-200 ${
                          countLimit === c
                            ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300'
                            : 'border-slate-700/40 bg-slate-800/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/60'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Game strategy */}
        <section>
          <p className="section-label md:text-sm mb-2">{t(language, 'strategyLabel' as Parameters<typeof t>[1])}</p>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {STRATEGIES.map(({ id, Icon, color, ring, bg }) => {
              const active = gameStrategy === id;
              const titleKey = `strategy_${id}` as Parameters<typeof t>[1];
              const descKey  = `strategy_${id}_desc` as Parameters<typeof t>[1];
              return (
                <button
                  key={id}
                  onClick={() => setGameStrategy(id)}
                  className={`relative p-3.5 md:p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group ${
                    active
                      ? `bg-gradient-to-br ${bg} ${ring}`
                      : 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                  }`}
                >
                  {active && <div className="absolute inset-0 shimmer pointer-events-none" />}
                  <div className={`flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2`}>
                    <Icon className={`w-[15px] h-[15px] md:w-4 md:h-4 ${active ? color : 'text-slate-500 group-hover:text-slate-300'}`} strokeWidth={2} />
                    <span className={`font-black text-xs md:text-sm ${active ? color : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {t(language, titleKey)}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-slate-600 leading-tight">{t(language, descKey)}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Labels toggle */}
        <section>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`w-full flex items-center justify-between px-4 py-3 md:py-4 rounded-2xl border-2
              transition-all duration-200 ${
                showLabels
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-700/40 bg-slate-800/40 text-slate-500'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
              <span className="text-sm md:text-base font-bold">
                {language === 'ru' ? 'Показывать названия на карте' : language === 'en' ? 'Show map labels' : "Xaritada nomlarni ko'rsatish"}
              </span>
            </div>
            {/* Toggle pill */}
            <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative transition-colors duration-200 ${
              showLabels ? 'bg-indigo-500' : 'bg-slate-700'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                showLabels ? 'translate-x-5 md:translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </section>

        {/* Difficulty */}
        <section>
          <p className="section-label md:text-sm">{t(language, 'chooseDifficulty')}</p>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {DIFFS.map((d) => {
              const cfg = DIFF_CONFIG[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`relative p-3.5 md:p-5 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden group ${
                    active
                      ? `bg-gradient-to-br ${cfg.bg} ${cfg.ring}`
                      : 'border-slate-700/40 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                  }`}
                >
                  {active && <div className="absolute inset-0 shimmer pointer-events-none" />}
                  <div className={`flex justify-center mb-1.5 md:mb-2 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <cfg.Icon
                      className={`w-5 h-5 md:w-6 md:h-6 ${active ? cfg.iconColor : 'text-slate-500 group-hover:text-slate-300'}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className={`font-black text-sm md:text-base ${active ? cfg.color : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {t(language, d as Parameters<typeof t>[1])}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-600 mt-0.5 leading-tight">
                    {t(language, `${d}_desc` as Parameters<typeof t>[1])}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="space-y-2.5 md:space-y-3 pt-1">
          <button
            onClick={handleStart}
            className="w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg text-white relative overflow-hidden group
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-glow hover:shadow-glow-lg
              active:scale-[.98] transition-all duration-200"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Play className="w-[18px] h-[18px] md:w-5 md:h-5 fill-white" strokeWidth={2.5} />
              <span>{t(language, 'start')}</span>
            </span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="w-full py-3 md:py-4 rounded-2xl font-bold text-sm md:text-base text-slate-400 hover:text-slate-200
              border border-slate-700/50 hover:border-indigo-500/30
              hover:bg-indigo-500/8 transition-all duration-200
              flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
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
