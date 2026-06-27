import { motion } from 'framer-motion';
import {
  ChevronLeft, MapPin, Users, Maximize2, CalendarDays,
  LayoutGrid, Lightbulb, Building2, Play,
  Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets,
  Thermometer, CloudFog, Zap, ExternalLink, Globe, BookOpen,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { t } from '../../i18n';
import type { Province } from '../../types';
import { useWeather, wmoDescription, wmoIcon } from '../../hooks/useWeather';
import { useWikipedia } from '../../hooks/useWikipedia';

interface Props {
  province: Province;
  onBack: () => void;
  onPlay: () => void;
}

function fmtNumber(n: number, lang: string): string {
  return n.toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ');
}

// Province ID → uzbekistan360.uz city ID (verified from uzbekistan360.uz)
const UZ360_IDS: Record<string, number> = {
  'tashkent-city': 1,
  tashkent:        1,
  fergana:         8,   // Marg'ilon
  bukhara:         8,   // Buxoro
  khorezm:         10,  // Xiva
  namangan:        13,
  surkhandarya:    14,  // Termiz
  andijan:         17,
  jizzakh:         18,
  kashkadarya:     19,  // Shahrisabz
  karakalpakstan:  21,  // Nukus
  samarkand:       23,
};

const UZ360_CITY_NAMES: Record<string, { uz: string; ru: string; en: string }> = {
  'tashkent-city': { uz: 'Toshkent',   ru: 'Ташкент',   en: 'Tashkent' },
  tashkent:        { uz: 'Toshkent',   ru: 'Ташкент',   en: 'Tashkent' },
  fergana:         { uz: "Marg'ilon",  ru: 'Маргилан',  en: 'Margilan' },
  bukhara:         { uz: 'Buxoro',     ru: 'Бухара',    en: 'Bukhara' },
  khorezm:         { uz: 'Xiva',       ru: 'Хива',      en: 'Khiva' },
  namangan:        { uz: 'Namangan',   ru: 'Наманган',  en: 'Namangan' },
  surkhandarya:    { uz: 'Termiz',     ru: 'Термез',    en: 'Termez' },
  andijan:         { uz: 'Andijon',    ru: 'Андижан',   en: 'Andijan' },
  jizzakh:         { uz: 'Jizzax',     ru: 'Джизак',    en: 'Jizzakh' },
  kashkadarya:     { uz: 'Shahrisabz', ru: 'Шахрисабз', en: 'Shahrisabz' },
  karakalpakstan:  { uz: 'Nukus',      ru: 'Нукус',     en: 'Nukus' },
  samarkand:       { uz: 'Samarqand',  ru: 'Самарканд', en: 'Samarkand' },
};

const UZ360_LANG: Record<string, string> = { uz: 'uzb', ru: 'rus', en: 'eng' };

function WeatherIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const props = { size, strokeWidth: 1.8 };
  switch (icon) {
    case 'sun':       return <Sun {...props} className="text-amber-400" />;
    case 'sun-cloud': return <Sun {...props} className="text-amber-300" />;
    case 'cloud':     return <Cloud {...props} className="text-slate-400" />;
    case 'fog':       return <CloudFog {...props} className="text-slate-400" />;
    case 'rain':      return <CloudRain {...props} className="text-cyan-400" />;
    case 'snow':      return <CloudSnow {...props} className="text-sky-300" />;
    case 'storm':     return <Zap {...props} className="text-yellow-400" />;
    default:          return <Cloud {...props} className="text-slate-400" />;
  }
}

export function ProvinceDetail({ province, onBack, onPlay }: Props) {
  const { language } = useSettingsStore();
  const cap = language.charAt(0).toUpperCase() + language.slice(1);

  const name    = province[`name${cap}` as 'nameUz'];
  const capital = province[`capital${cap}` as 'capitalUz'];
  const fact    = (province[`funFact${cap}` as 'funFactUz'] ?? province.funFactUz) as string | undefined;
  const cities  = (province[`majorCities${cap}` as 'majorCitiesUz'] ?? province.majorCitiesUz) as string[] | undefined;

  // [lng, lat] → Open-Meteo needs lat, lng
  const [lng, lat] = province.capitalCoords;
  const { weather, loading: weatherLoading } = useWeather(lat, lng);
  const wiki = useWikipedia(province.id, language);

  const tour360Id   = UZ360_IDS[province.id];
  const tour360City = UZ360_CITY_NAMES[province.id];
  const tour360Lang = UZ360_LANG[language] ?? 'uzb';
  const tour360Url  = tour360Id
    ? `https://uzbekistan360.uz/${tour360Lang}?city=${tour360Id}`
    : null;

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

      {/* Hero — with Wikipedia image background if available */}
      <div
        className="relative rounded-3xl overflow-hidden border border-slate-700/40 mb-5"
        style={{ background: `linear-gradient(135deg, ${province.color}22, ${province.color}08)` }}
      >
        {wiki?.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
            style={{ backgroundImage: `url(${wiki.image})` }}
          />
        )}
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="relative flex items-center gap-4 p-6">
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

      {/* Wikipedia description */}
      {wiki?.extract && (
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-4 mb-5">
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2">
            <BookOpen size={12} strokeWidth={2} />
            {t(language, 'wikiDesc')}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{wiki.extract}</p>
          {wiki.pageUrl && (
            <a
              href={wiki.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
            >
              <ExternalLink size={10} strokeWidth={2} />
              Wikipedia
            </a>
          )}
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-1.5">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4">
            <Icon size={16} className="text-indigo-400 mb-2" strokeWidth={2} />
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">{label}</p>
            <p className="text-base font-black text-slate-100 tabular-nums mt-0.5">{value}</p>
          </div>
        ))}
      </div>
      {/* Source badge */}
      <p className="text-[10px] text-slate-600 flex items-center gap-1 mb-5 pl-1">
        <Globe size={9} strokeWidth={2} />
        {t(language, 'sourceLabel')}: stat.uz, 2025
      </p>

      {/* Weather widget */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 mb-5">
        <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-3">
          <Thermometer size={12} strokeWidth={2} />
          {t(language, 'currentWeather')} — {capital}
        </p>
        {weatherLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-cyan-400 animate-spin" />
            {t(language, 'loading')}
          </div>
        ) : weather ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <WeatherIcon icon={wmoIcon(weather.code)} size={28} />
              <span className="text-3xl font-black text-white tabular-nums">{weather.temp}°C</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 font-medium">
                {wmoDescription(weather.code, language)}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Wind size={11} strokeWidth={2} className="text-slate-400" />
                  {weather.windKmh} {t(language, 'kmh')}
                </span>
                <span className="flex items-center gap-1">
                  <Droplets size={11} strokeWidth={2} className="text-cyan-400" />
                  {weather.humidity}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t(language, 'weatherUnavailable')}</p>
        )}
        <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
          <Globe size={9} strokeWidth={2} />
          {t(language, 'sourceLabel')}: open-meteo.com
        </p>
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
        <div className="mb-5">
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

      {/* 360° Virtual Tour */}
      {tour360Url && tour360City && (
        <a
          href={tour360Url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/5
            hover:from-violet-500/20 hover:border-violet-500/50 p-4 mb-5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                <Globe size={12} strokeWidth={2} />
                {t(language, 'virtualTour')}
              </p>
              <p className="text-sm font-bold text-slate-100">
                {tour360City[language as keyof typeof tour360City] ?? tour360City.en}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t(language, 'virtualTourDesc')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center
              group-hover:bg-violet-500/30 transition-colors shrink-0">
              <ExternalLink size={16} className="text-violet-400" strokeWidth={2} />
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1">
            <Globe size={9} strokeWidth={2} />
            {t(language, 'sourceLabel')}: uzbekistan360.uz
          </p>
        </a>
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
