import { useRef, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSettingsStore } from '../../store/settingsStore';
import type { GeoDistrictCollection, Province } from '../../types';
import type { DemoMetric, DemoGranularity, DemographicsData, DemoYearEntry } from '../../types/demographics';

interface Props {
  geoData: GeoDistrictCollection;
  demoData: DemographicsData;
  metric: DemoMetric;
  year: number;
  granularity: DemoGranularity;
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
  provinces: Province[];
}

// ── Color scales ──────────────────────────────────────────────────────────────

const SCALES: Record<DemoMetric, [string, string, string]> = {
  population: ['#1e1b4b', '#4f46e5', '#a5b4fc'],
  births:     ['#052e16', '#059669', '#6ee7b7'],
  deaths:     ['#4c0519', '#e11d48', '#fda4af'],
  growth:     ['#1e1b4b', '#0891b2', '#67e8f9'],
};

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return `#${[
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function getColor(t: number, metric: DemoMetric): string {
  const [lo, mid, hi] = SCALES[metric];
  if (t <= 0.5) return lerpColor(lo, mid, t * 2);
  return lerpColor(mid, hi, (t - 0.5) * 2);
}

// ── Metric value helper (exported so DemographicsView can reuse) ──────────────

export function getMetricValue(entry: DemoYearEntry | undefined, metric: DemoMetric): number | null {
  if (!entry) return null;
  switch (metric) {
    case 'population': return entry.population ?? null;
    case 'births':     return entry.births ?? null;
    case 'deaths':     return entry.deaths ?? null;
    case 'growth':
      if (entry.births == null || entry.deaths == null) return null;
      return entry.births - entry.deaths;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function DemographicsMap({
  geoData, demoData, metric, year, granularity, selectedId, onSelect, provinces,
}: Props) {
  const { theme } = useSettingsStore();
  const geoRef  = useRef<L.GeoJSON | null>(null);
  const yearStr = String(year);

  // Province name lookup
  const provMap = useMemo(
    () => Object.fromEntries(provinces.map(p => [p.id, p])),
    [provinces]
  );

  // valueMap: lookupId → metric value
  const valueMap = useMemo<Map<string, number | null>>(() => {
    const map = new Map<string, number | null>();
    const store = granularity === 'provinces' ? demoData.provinces : demoData.districts;
    for (const [id, yearData] of Object.entries(store)) {
      map.set(id, getMetricValue(yearData[yearStr], metric));
    }
    return map;
  }, [demoData, metric, yearStr, granularity]);

  // min/max for normalisation
  const [minVal, maxVal] = useMemo(() => {
    const vals = [...valueMap.values()].filter((v): v is number => v != null && v > 0);
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
  }, [valueMap]);

  // Style function (recreated whenever dependencies change)
  const styleFeature = useCallback((feature: GeoJSON.Feature | undefined): L.PathOptions => {
    const isDark = document.documentElement.classList.contains('dark');
    const noDataFill = isDark ? '#1e293b' : '#e2e8f0';
    const strokeBase  = isDark ? '#0f172a' : '#94a3b8';
    const strokeSel   = isDark ? '#ffffff' : '#0f172a';
    if (!feature) return { fillColor: noDataFill, color: strokeBase, weight: 0.5, fillOpacity: 0.6 };
    const props = (feature as any).properties;
    const lookupId = granularity === 'provinces' ? props.provinceId : props.id;
    const val = valueMap.get(lookupId) ?? null;
    const isSel = granularity === 'provinces'
      ? props.provinceId === selectedId
      : props.id === selectedId;

    const fillColor = (val != null && maxVal > minVal)
      ? getColor((val - minVal) / (maxVal - minVal), metric)
      : noDataFill;

    return {
      fillColor,
      fillOpacity: val != null ? 0.88 : 0.2,
      color:  isSel ? strokeSel : strokeBase,
      weight: isSel ? 2 : 0.4,
      opacity: 1,
    };
  }, [valueMap, minVal, maxVal, metric, granularity, selectedId]);

  // Keep a ref to the latest styleFeature so Leaflet handlers always see current version
  const styleFnRef = useRef(styleFeature);
  useEffect(() => { styleFnRef.current = styleFeature; }, [styleFeature]);

  // Re-style all features when metric/year/granularity/selection changes
  useEffect(() => {
    geoRef.current?.setStyle(f => styleFnRef.current(f));
  }, [styleFeature]);

  // Keep live refs for other values accessed in Leaflet handlers
  const liveRef = useRef({ granularity, onSelect, provMap, selectedId });
  useEffect(() => {
    liveRef.current = { granularity, onSelect, provMap, selectedId };
  }, [granularity, onSelect, provMap, selectedId]);

  // onEachFeature — set up once; reads from liveRef/styleFnRef for freshness
  const onEachFeature = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    const props = (feature as any).properties;

    layer.on({
      mouseover(e: L.LeafletMouseEvent) {
        const l = e.target as L.Path;
        l.setStyle({ weight: 2, color: '#6366f1', fillOpacity: 0.97 });
        l.bringToFront();
      },
      mouseout(e: L.LeafletMouseEvent) {
        const l = e.target as L.Path;
        l.setStyle(styleFnRef.current(feature));
      },
      click() {
        const { granularity: g, onSelect: cb, provMap: pm } = liveRef.current;
        const id   = g === 'provinces' ? props.provinceId : props.id;
        const name = g === 'provinces'
          ? (pm[props.provinceId]?.nameUz ?? props.nameUz ?? id)
          : (props.nameUz ?? props.nameEn ?? id);
        cb(id, name);
      },
    });

    const displayName = props.nameUz || props.nameEn || '';
    layer.bindTooltip(displayName, {
      permanent: false,
      sticky: true,
      className: 'demo-tooltip',
    });
  }, []); // intentionally empty deps — uses refs for freshness

  // Legend stops
  const legendStops = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map(t => getColor(t, metric)),
    [metric]
  );

  const fmtLegend = (v: number): string => {
    if (metric === 'population') {
      return v >= 1000 ? `${(v / 1000).toFixed(1)}M` : `${Math.round(v)}K`;
    }
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1000)      return `${Math.round(v / 1000)}K`;
    return String(Math.round(v));
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[41.2, 64.5]}
        zoom={6}
        minZoom={5}
        maxZoom={10}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={theme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'}
          opacity={theme === 'dark' ? 0.35 : 0.55}
        />

        <GeoJSON
          key="demo-layer"
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
          ref={(layer: unknown) => {
            if (layer) geoRef.current = layer as L.GeoJSON;
          }}
        />
      </MapContainer>

      {/* Color scale legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500]
        bg-[#080c1c]/90 backdrop-blur-sm border border-slate-700/50
        rounded-2xl px-4 py-2.5 flex items-center gap-3 pointer-events-none">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide whitespace-nowrap">
          {fmtLegend(minVal)}
        </span>
        <div
          className="w-28 h-2.5 rounded-full"
          style={{ background: `linear-gradient(to right, ${legendStops.join(', ')})` }}
        />
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide whitespace-nowrap">
          {fmtLegend(maxVal)}
        </span>
      </div>

      <style>{`
        .demo-tooltip {
          background: #0a0e1f !important;
          border: 1px solid rgba(99,102,241,.35) !important;
          color: #e2e8f0 !important;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,.5) !important;
        }
        .demo-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
}
