import { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, UserMinus, TrendingUp,
  ChevronLeft, ChevronRight, AlertCircle,
  Map, MapPin, BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemographicsMap, getMetricValue } from './DemographicsMap';
import { useSettingsStore } from '../../store/settingsStore';
import type { GeoDistrictCollection, Province } from '../../types';
import type { DemographicsData, DemoMetric, DemoGranularity, DemoYearEntry } from '../../types/demographics';

interface Props {
  geoData: GeoDistrictCollection;
  provinces: Province[];
}

// ── Metric config ─────────────────────────────────────────────────────────────

const METRICS: {
  id: DemoMetric;
  Icon: LucideIcon;
  labelUz: string; labelRu: string; labelEn: string;
  color: string; bg: string; border: string;
}[] = [
  { id: 'population', Icon: Users,     labelUz: 'Aholi',         labelRu: 'Население',  labelEn: 'Population',  color: 'text-indigo-300', bg: 'from-indigo-600/20 to-violet-600/10', border: 'border-indigo-500/40' },
  { id: 'births',     Icon: UserPlus,  labelUz: "Tug'ilganlar",  labelRu: 'Рождения',   labelEn: 'Births',      color: 'text-emerald-300', bg: 'from-emerald-600/20 to-teal-600/10',  border: 'border-emerald-500/40' },
  { id: 'deaths',     Icon: UserMinus, labelUz: 'Vafotlar',      labelRu: 'Смерти',     labelEn: 'Deaths',      color: 'text-rose-300',    bg: 'from-rose-600/20 to-red-600/10',      border: 'border-rose-500/40' },
  { id: 'growth',     Icon: TrendingUp,labelUz: 'Tabiiy o\'sish',labelRu: 'Прирост',    labelEn: 'Nat. Growth', color: 'text-cyan-300',    bg: 'from-cyan-600/20 to-blue-600/10',     border: 'border-cyan-500/40' },
];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPop(v: number | null): string {
  if (v == null) return '—';
  // population is in thousands
  if (v >= 1000) return `${(v / 1000).toFixed(2)} mln`;
  return `${v.toFixed(0)} ming`;
}

function fmtCount(v: number | null): string {
  if (v == null) return '—';
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `${(Math.abs(v) / 1000).toFixed(0)}K`;
  return v.toLocaleString();
}

function fmtMetric(val: number | null, metric: DemoMetric): string {
  if (val == null) return '—';
  if (metric === 'population') return fmtPop(val);
  return (val > 0 && metric === 'growth' ? '+' : '') + fmtCount(val);
}

// Simple SVG sparkline from an array of values (normalised to 0-1)
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 120, H = 28;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DemographicsView({ geoData, provinces }: Props) {
  const { language } = useSettingsStore();
  const [demoData, setDemoData] = useState<DemographicsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [metric, setMetric]     = useState<DemoMetric>('population');
  const [year, setYear]         = useState<number>(2023);
  const [granularity, setGranularity] = useState<DemoGranularity>('provinces');
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');

  // Province lookup
  const provMap = useMemo(() => Object.fromEntries(provinces.map(p => [p.id, p])), [provinces]);
  const nameKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}` as 'nameUz';

  // Load demographics data
  useEffect(() => {
    fetch('data/demographics.json')
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then((d: DemographicsData) => {
        setDemoData(d);
        const last = d.meta.years[d.meta.years.length - 2] ?? d.meta.years[d.meta.years.length - 1];
        setYear(last);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentMetric = METRICS.find(m => m.id === metric)!;
  const years = demoData?.meta.years ?? [];

  // Get national data for selected year
  const nationalEntry: DemoYearEntry | undefined = demoData?.national[String(year)];

  // Get selected region data
  const selectedEntry: DemoYearEntry | undefined = useMemo(() => {
    if (!demoData || !selectedId) return undefined;
    const y = String(year);
    return granularity === 'provinces'
      ? demoData.provinces[selectedId]?.[y]
      : demoData.districts[selectedId]?.[y];
  }, [demoData, selectedId, year, granularity]);

  // Sparkline: last 6 years of data for selected region
  const sparkData = useMemo(() => {
    if (!demoData || !selectedId) return [];
    const store = granularity === 'provinces'
      ? demoData.provinces[selectedId]
      : demoData.districts[selectedId];
    if (!store) return [];
    return years.slice(-6).map(y => getMetricValue(store[String(y)], metric) ?? 0);
  }, [demoData, selectedId, year, granularity, metric, years]);

  const handleSelect = (id: string, name: string) => {
    setSelectedId(id);
    if (granularity === 'provinces') {
      setSelectedName(provMap[id]?.[nameKey] ?? name);
    } else {
      setSelectedName(name);
    }
  };

  // ── Loading / no-data states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen pt-16 flex items-center justify-center bg-[#050814]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Demografik ma'lumotlar yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  if (!demoData) {
    return (
      <div className="h-screen pt-16 flex items-center justify-center bg-[#050814]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/25
            flex items-center justify-center mx-auto">
            <AlertCircle size={28} className="text-amber-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-slate-200 font-black text-lg">Ma'lumotlar topilmadi</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Demografik ma'lumotlarni yuklash uchun terminalda quyidagi amrni bajaring:
          </p>
          <code className="block bg-slate-800/80 border border-slate-700/50 text-indigo-300
            px-4 py-3 rounded-xl text-sm font-mono">
            npm run process-demographics
          </code>
          <p className="text-slate-600 text-xs">
            Bu amr SIAT serveridan ma'lumotlarni yuklab, qayta ishlaydi (~30 soniya)
          </p>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row h-screen pt-16 bg-[#050814]">

      {/* ── Left Panel ── */}
      <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col
        border-b md:border-b-0 md:border-r border-slate-800/60
        bg-[#080c1c] overflow-y-auto">

        {/* Header */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20
              flex items-center justify-center">
              <BarChart3 size={14} className="text-indigo-400" strokeWidth={2} />
            </div>
            <h2 className="text-sm font-black text-white">Demografiya</h2>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">
            O'zbekiston • SIAT ma'lumotlari
          </p>
        </div>

        {/* Metric selector */}
        <div className="p-4 border-b border-slate-800/60">
          <p className="section-label mb-2">Ko'rsatkich</p>
          <div className="grid grid-cols-2 gap-1.5">
            {METRICS.map(m => {
              const active = metric === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id)}
                  className={`relative flex flex-col items-start gap-1 p-3 rounded-2xl border-2 text-left
                    transition-all duration-200 overflow-hidden
                    ${active
                      ? `bg-gradient-to-br ${m.bg} ${m.border}`
                      : 'border-slate-700/40 bg-slate-800/30 hover:border-slate-600/60'}`}
                >
                  <m.Icon size={16} className={active ? m.color : 'text-slate-500'} strokeWidth={2} />
                  <span className={`text-[11px] font-bold leading-tight ${active ? m.color : 'text-slate-400'}`}>
                    {language === 'uz' ? m.labelUz : language === 'ru' ? m.labelRu : m.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Granularity */}
        <div className="p-4 border-b border-slate-800/60">
          <p className="section-label mb-2">Daraja</p>
          <div className="flex rounded-xl overflow-hidden border border-slate-700/50 p-0.5 bg-slate-800/40">
            {(['provinces', 'districts'] as DemoGranularity[]).map(g => (
              <button
                key={g}
                onClick={() => { setGranularity(g); setSelectedId(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                  text-xs font-bold transition-all duration-200
                  ${granularity === g
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'}`}
              >
                {g === 'provinces'
                  ? <><Map size={12} strokeWidth={2} /><span>Viloyatlar</span></>
                  : <><MapPin size={12} strokeWidth={2} /><span>Tumanlar</span></>}
              </button>
            ))}
          </div>
        </div>

        {/* Year slider */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Yil</p>
            <span className="text-xl font-black gradient-text tabular-nums">{year}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear(y => Math.max(years[0], y - 1))}
              disabled={year <= years[0]}
              className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/50
                flex items-center justify-center hover:border-indigo-500/30 hover:bg-indigo-500/10
                disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={14} className="text-slate-400" strokeWidth={2.5} />
            </button>
            <input
              type="range"
              min={years[0]}
              max={years[years.length - 1]}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-slate-700/60 rounded-full
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,.6)]"
            />
            <button
              onClick={() => setYear(y => Math.min(years[years.length - 1], y + 1))}
              disabled={year >= years[years.length - 1]}
              className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/50
                flex items-center justify-center hover:border-indigo-500/30 hover:bg-indigo-500/10
                disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={14} className="text-slate-400" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-slate-700 font-medium">
            <span>{years[0]}</span>
            <span>{years[years.length - 1]}</span>
          </div>
        </div>

        {/* National stats */}
        <div className="p-4 border-b border-slate-800/60">
          <p className="section-label mb-2">O'zbekiston jami</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Aholi', val: fmtPop(nationalEntry?.population ?? null), color: 'text-indigo-300' },
              { label: "Tug'ildi", val: fmtCount(nationalEntry?.births ?? null), color: 'text-emerald-300' },
              { label: 'Vafot', val: fmtCount(nationalEntry?.deaths ?? null), color: 'text-rose-300' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-slate-800/50 border border-slate-700/40 p-2 text-center">
                <p className={`text-sm font-black ${s.color} tabular-nums leading-none`}>{s.val}</p>
                <p className="text-[9px] text-slate-600 mt-1 font-bold uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected region info */}
        <div className="p-4 flex-1">
          {!selectedId ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800/60 border border-slate-700/40
                flex items-center justify-center mx-auto">
                <MapPin size={18} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-slate-600 text-xs font-medium">
                Batafsil ma'lumot uchun<br />xaritadan mintaqa tanlang
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-0.5">
                    {granularity === 'provinces' ? 'Viloyat' : 'Tuman'}
                  </p>
                  <p className="text-sm font-black text-white leading-tight">{selectedName}</p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none mt-0.5"
                >×</button>
              </div>

              {/* Metric cards */}
              <div className="space-y-1.5">
                {[
                  { label: 'Aholi',      val: fmtPop(selectedEntry?.population ?? null),    color: 'text-indigo-300',  bg: 'bg-indigo-500/8'  },
                  { label: "Tug'ilganlar", val: fmtCount(selectedEntry?.births ?? null),     color: 'text-emerald-300', bg: 'bg-emerald-500/8' },
                  { label: 'Vafotlar',   val: fmtCount(selectedEntry?.deaths ?? null),       color: 'text-rose-300',    bg: 'bg-rose-500/8'    },
                  {
                    label: 'Tabiiy o\'sish',
                    val: selectedEntry?.births != null && selectedEntry?.deaths != null
                      ? `+${fmtCount(selectedEntry.births - selectedEntry.deaths)}`
                      : '—',
                    color: 'text-cyan-300',
                    bg: 'bg-cyan-500/8',
                  },
                ].map(s => (
                  <div key={s.label}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl ${s.bg}
                      border border-slate-700/30`}>
                    <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
                    <span className={`text-sm font-black ${s.color} tabular-nums`}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Sparkline trend */}
              {sparkData.some(v => v > 0) && (
                <div className="pt-1">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide mb-1.5">
                    So'nggi {Math.min(sparkData.length, 6)} yil
                  </p>
                  <Sparkline
                    values={sparkData}
                    color={currentMetric.color.replace('text-', '#').replace('indigo-300', '818cf8').replace('emerald-300', '6ee7b7').replace('rose-300', 'fda4af').replace('cyan-300', '67e8f9')}
                  />
                </div>
              )}

              <p className="text-[9px] text-slate-700 text-center pt-1">
                Manba: SIAT • {demoData.meta.lastUpdated}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Map ── */}
      <main className="flex-1 relative min-h-[400px] md:h-full">
        <DemographicsMap
          geoData={geoData}
          demoData={demoData}
          metric={metric}
          year={year}
          granularity={granularity}
          selectedId={selectedId}
          onSelect={handleSelect}
          provinces={provinces}
        />
      </main>
    </div>
  );
}
