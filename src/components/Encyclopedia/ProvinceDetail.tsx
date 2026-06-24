import { motion } from 'framer-motion';
import {
  ChevronLeft, MapPin, Users, Maximize2, CalendarDays,
  LayoutGrid, Lightbulb, Building2, Play,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { t } from '../../i18n';
import type { Province } from '../../types';

interface Props {
  province: Province;
  onBack: () => void;
  onPlay: () => void;
}

function fmtNumber(n: number, lang: string): string {
  return n.toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ');
}

export function ProvinceDetail({ province, onBack, onPlay }: Props) {
  const { language } = useSettingsStore();
  const cap = language.charAt(0).toUpperCase() + language.slice(1);

  const name    = province[`name${cap}` as 'nameUz'];
  const capital = province[`capital${cap}` as 'capitalUz'];
  const fact    = (province[`funFact${cap}` as 'funFactUz'] ?? province.funFactUz) as string | undefined;
  const cities  = (province[`majorCities${cap}` as 'majorCitiesUz'] ?? province.majorCitiesUz) as string[] | undefined;

  const stats: { Icon: typeof Users; label: string; value: string }[] = [
    { Icon: Users,        label: t(language, 'population'),     value: province.population ? fmtNumber(province.population, language) : '—' },
    { Icon: Maximize2,    label: t(language, 'area'),           value: province.area ? `${fmtNumber(province.area, language)} ${t(language, 'km2')}` : '—' },
    { Icon: MapPin,       label: t(language, 'capital'),        value: capital },
    { Icon: CalendarDays, label: t(language, 'founded'),        value: province.founded ? `${province.founded} ${t(language, 'year')}`.trim() : '—' },
    { Icon: LayoutGrid,   label: t(language, 'districtsCount'), value: province.districts ? String(province.districts) : '—' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-200 mb-5 transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
        {t(language, 'backToList')}
      </button>

      {/* Hero */}
      <div
        className="relative rounded-3xl overflow-hidden border border-slate-700/40 p-6 mb-5"
        style={{ background: `linear-gradient(135deg, ${province.color}22, ${province.color}08)` }}
      >
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: province.color }}
          >
            <MapPin size={26} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{name}</h2>
            <p className="text-sm text-slate-300/80 flex items-center gap-1.5 mt-1">
              <Building2 size={13} strokeWidth={2} />
              {t(language, 'capital')}: {capital}
            </p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4">
            <Icon size={16} className="text-indigo-400 mb-2" strokeWidth={2} />
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">{label}</p>
            <p className="text-base font-black text-slate-100 tabular-nums mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Fun fact */}
      {fact && (
        <div className="rounded-2xl bg-amber-500/8 border border-amber-500/20 p-4 mb-5">
          <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1.5">
            <Lightbulb size={13} strokeWidth={2} />
            {t(language, 'funFact')}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{fact}</p>
        </div>
      )}

      {/* Major cities */}
      {cities && cities.length > 0 && (
        <div className="mb-6">
          <p className="section-label">{t(language, 'majorCities')}</p>
          <div className="flex flex-wrap gap-2">
            {cities.map(c => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/60 border border-slate-700/40 text-slate-300 flex items-center gap-1.5"
              >
                <Building2 size={11} strokeWidth={2} className="text-indigo-400" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-2xl font-black text-base text-white relative overflow-hidden group
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          shadow-glow hover:shadow-glow-lg active:scale-[.98] transition-all duration-200"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Play size={17} strokeWidth={2.5} className="fill-white" />
          {t(language, 'findOnMap')}
        </span>
        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
      </button>
    </motion.div>
  );
}
