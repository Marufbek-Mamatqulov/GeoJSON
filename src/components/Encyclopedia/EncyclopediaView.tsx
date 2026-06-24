import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, MapPin, Users, Maximize2, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { ProvinceDetail } from './ProvinceDetail';
import { t } from '../../i18n';
import type { Province } from '../../types';

interface Props {
  provinces: Province[];
  onPlayProvince: (province: Province) => void;
}

function fmtNumber(n: number, lang: string): string {
  return n.toLocaleString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ');
}

export function EncyclopediaView({ provinces, onPlayProvince }: Props) {
  const { language } = useSettingsStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cap = language.charAt(0).toUpperCase() + language.slice(1);
  const nk = `name${cap}` as 'nameUz';
  const ck = `capital${cap}` as 'capitalUz';

  const sorted = useMemo(
    () => [...provinces].sort((a, b) => a.order - b.order),
    [provinces],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(p =>
      p[nk].toLowerCase().includes(q) || p[ck].toLowerCase().includes(q),
    );
  }, [sorted, query, nk, ck]);

  const selected = selectedId ? provinces.find(p => p.id === selectedId) ?? null : null;

  return (
    <div className="relative min-h-screen pt-16 px-4 pb-12 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto pt-8">
        {selected ? (
          <ProvinceDetail
            province={selected}
            onBack={() => setSelectedId(null)}
            onPlay={() => onPlayProvince(selected)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} className="text-indigo-400" strokeWidth={1.6} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1.5">
                <span className="gradient-text">{t(language, 'encyclopedia')}</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">{t(language, 'encyclopediaSubtitle')}</p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-7">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" strokeWidth={2} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t(language, 'searchProvince')}
                  aria-label={t(language, 'searchProvince')}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium
                    bg-slate-800/50 border border-slate-700/40 text-slate-200 placeholder:text-slate-600
                    focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-12">{t(language, 'noResults')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedId(p.id)}
                    className="group text-left rounded-2xl border border-slate-700/40 bg-slate-800/40 hover:bg-slate-800/70
                      hover:border-slate-600/60 p-4 transition-all duration-200 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                      style={{ background: p.color }}
                    />
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: p.color }}>
                          <MapPin size={16} className="text-white" strokeWidth={2.2} />
                        </span>
                        <div>
                          <p className="font-black text-sm text-slate-100 leading-tight">{p[nk]}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p[ck]}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2.5} />
                    </div>

                    <div className="relative flex items-center gap-4 mt-3.5 text-[11px] text-slate-400 font-medium">
                      {p.population != null && (
                        <span className="flex items-center gap-1">
                          <Users size={11} strokeWidth={2} className="text-indigo-400" />
                          {fmtNumber(p.population, language)}
                        </span>
                      )}
                      {p.area != null && (
                        <span className="flex items-center gap-1">
                          <Maximize2 size={11} strokeWidth={2} className="text-cyan-400" />
                          {fmtNumber(p.area, language)} {t(language, 'km2')}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
