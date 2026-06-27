import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, ExternalLink, Play, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { motion } from 'framer-motion';

interface TourCity {
  key: string;
  cityId: number;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export const TOUR_CITIES: TourCity[] = [
  { key: 'tashkent',   cityId: 1,  nameUz: 'Toshkent',   nameRu: 'Ташкент',   nameEn: 'Tashkent',   lat: 41.30, lng: 69.25 },
  { key: 'margilan',   cityId: 8,  nameUz: "Marg'ilon",  nameRu: 'Маргилан',  nameEn: 'Margilan',   lat: 40.47, lng: 71.72 },
  { key: 'bukhara',    cityId: 8,  nameUz: 'Buxoro',     nameRu: 'Бухара',    nameEn: 'Bukhara',    lat: 39.78, lng: 64.42 },
  { key: 'khiva',      cityId: 10, nameUz: 'Xiva',       nameRu: 'Хива',      nameEn: 'Khiva',      lat: 41.38, lng: 60.36 },
  { key: 'kokand',     cityId: 12, nameUz: "Qo'qon",     nameRu: 'Коканд',    nameEn: "Ko'qon",     lat: 40.53, lng: 70.94 },
  { key: 'namangan',   cityId: 13, nameUz: 'Namangan',   nameRu: 'Наманган',  nameEn: 'Namangan',   lat: 41.00, lng: 71.67 },
  { key: 'termez',     cityId: 14, nameUz: 'Termiz',     nameRu: 'Термез',    nameEn: 'Termez',     lat: 37.22, lng: 67.27 },
  { key: 'andijan',    cityId: 17, nameUz: 'Andijon',    nameRu: 'Андижан',   nameEn: 'Andijan',    lat: 40.78, lng: 72.34 },
  { key: 'jizzakh',    cityId: 18, nameUz: 'Jizzax',     nameRu: 'Джизак',    nameEn: 'Jizzakh',    lat: 40.12, lng: 67.83 },
  { key: 'shahrisabz', cityId: 19, nameUz: 'Shahrisabz', nameRu: 'Шахрисабз', nameEn: 'Shahrisabz', lat: 39.06, lng: 66.83 },
  { key: 'urgench',    cityId: 20, nameUz: 'Urganch',    nameRu: 'Ургенч',    nameEn: 'Urgench',    lat: 41.55, lng: 60.64 },
  { key: 'nukus',      cityId: 21, nameUz: 'Nukus',      nameRu: 'Нукус',     nameEn: 'Nukus',      lat: 42.45, lng: 59.62 },
  { key: 'samarkand',  cityId: 23, nameUz: 'Samarqand',  nameRu: 'Самарканд', nameEn: 'Samarkand',  lat: 39.65, lng: 66.97 },
];

const LANG_CODE: Record<string, string> = { uz: 'uzb', ru: 'rus', en: 'eng' };

function makeIcon(selected: boolean) {
  const bg = selected ? '#7c3aed' : '#4f46e5';
  const border = selected ? '#c4b5fd' : 'rgba(255,255,255,0.4)';
  const scale = selected ? 'scale(1.25)' : 'scale(1)';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};color:#fff;font-size:8px;font-weight:900;
      font-family:system-ui,sans-serif;padding:3px 6px;border-radius:10px;
      border:1.5px solid ${border};white-space:nowrap;
      box-shadow:0 2px 12px rgba(99,102,241,0.6);
      transform:${scale};transition:transform 0.15s;
    ">360°</div>`,
    iconSize: [34, 18],
    iconAnchor: [17, 9],
  });
}

interface MapPanelProps {
  selected: string | null;
  onSelect: (key: string) => void;
  theme: string;
}
function MapPanel({ selected, onSelect, theme }: MapPanelProps) {
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={[40.5, 64.5]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer url={tileUrl} attribution="&copy; OSM &copy; CARTO" subdomains="abcd" />
      {TOUR_CITIES.map(city => (
        <Marker
          key={city.key}
          position={[city.lat, city.lng]}
          icon={makeIcon(selected === city.key)}
          eventHandlers={{ click: () => onSelect(city.key) }}
        />
      ))}
    </MapContainer>
  );
}

export function Tour360View() {
  const { language, theme } = useSettingsStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const cap = language.charAt(0).toUpperCase() + language.slice(1);
  const nameKey = `name${cap}` as 'nameUz';
  const langCode = LANG_CODE[language] ?? 'uzb';

  const selectedCity = selected ? TOUR_CITIES.find(c => c.key === selected) ?? null : null;
  const tourUrl = selectedCity
    ? `https://uzbekistan360.uz/${langCode}?city=${selectedCity.cityId}`
    : null;

  const handleSelect = useCallback((key: string) => {
    setSelected(key);
    setLoading(true);
    setIframeKey(k => k + 1);
  }, []);

  useEffect(() => { setLoading(true); setIframeKey(k => k + 1); }, [tourUrl]);

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 pt-16 flex flex-col">

      {/* Page header bar */}
      <div className="px-4 md:px-8 py-5 border-b border-slate-800/60 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/30
            flex items-center justify-center shrink-0">
            <Globe size={22} className="text-violet-400" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black">
              <span className="text-violet-400">360°</span>
              <span className="text-white ml-1.5">Virtual Sayohat</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              O'zbekiston shaharlarini 360° formatda kashf eting
            </p>
          </div>
          {selectedCity && tourUrl && (
            <a
              href={tourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl
                bg-violet-600/20 border border-violet-500/30 text-violet-300
                hover:bg-violet-600/30 transition-colors text-xs font-semibold"
            >
              <ExternalLink size={13} strokeWidth={2} />
              Brauzerda ochish
            </a>
          )}
        </div>
      </div>

      {/* Main: left sidebar + right content */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────── */}
        <aside className="lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col
          border-b lg:border-b-0 lg:border-r border-slate-800/60 overflow-hidden">

          {/* Mini map */}
          <div className="h-[200px] lg:h-[260px] flex-shrink-0 border-b border-slate-800/60">
            <MapPanel selected={selected} onSelect={handleSelect} theme={theme} />
          </div>

          {/* City list */}
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold px-2 pt-2 pb-1.5">
              Shaharlar ({TOUR_CITIES.length})
            </p>
            <div className="space-y-0.5">
              {TOUR_CITIES.map((city, i) => (
                <motion.button
                  key={city.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => handleSelect(city.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold
                    flex items-center gap-3 transition-all duration-150
                    ${selected === city.key
                      ? 'bg-violet-600/20 border border-violet-500/30 text-violet-200'
                      : 'hover:bg-slate-800/50 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                    ${selected === city.key ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    360
                  </div>
                  <span className="flex-1 truncate">{city[nameKey]}</span>
                  {selected === city.key
                    ? <Play size={12} className="text-violet-400 shrink-0 fill-violet-400" strokeWidth={0} />
                    : <ChevronRight size={12} className="text-slate-700 shrink-0" strokeWidth={2} />
                  }
                </motion.button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right: iframe / welcome ───────────────────────── */}
        <main className="flex-1 relative overflow-hidden bg-[#060a18]">
          {selectedCity && tourUrl ? (
            <>
              {/* Loading spinner */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#060a18]">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">
                      {selectedCity[nameKey]} yuklanmoqda…
                    </p>
                  </div>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={tourUrl}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                allow="fullscreen; gyroscope; accelerometer; autoplay; vr"
                title={`360° — ${selectedCity[nameKey]}`}
              />

              {/* City name overlay chip */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2
                px-3 py-1.5 rounded-xl bg-[#050814]/80 backdrop-blur-sm
                border border-slate-700/50 pointer-events-none">
                <div className="w-4 h-4 rounded bg-violet-500/20 flex items-center justify-center">
                  <span className="text-[7px] font-black text-violet-400">360</span>
                </div>
                <span className="text-xs font-bold text-slate-200">{selectedCity[nameKey]}</span>
              </div>
            </>
          ) : (
            /* Welcome state */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-violet-500/10 border border-violet-500/20
                  flex items-center justify-center">
                  <Globe size={40} className="text-violet-400/50" strokeWidth={1} />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-violet-600
                  flex items-center justify-center text-[9px] font-black text-white border-2 border-[#060a18]">
                  360
                </div>
              </div>

              <div>
                <p className="text-xl font-black text-slate-200 mb-2">
                  Shaharni tanlang
                </p>
                <p className="text-sm text-slate-600 max-w-xs">
                  Chap paneldagi ro'yxatdan yoki xaritadagi markerdan shaharni bosing
                </p>
              </div>

              {/* Quick pick grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-md w-full">
                {TOUR_CITIES.slice(0, 8).map(city => (
                  <button
                    key={city.key}
                    onClick={() => handleSelect(city.key)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40
                      text-xs text-slate-400 hover:text-violet-300 hover:border-violet-500/30
                      hover:bg-violet-500/10 transition-all duration-150 font-medium"
                  >
                    {city[nameKey]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
