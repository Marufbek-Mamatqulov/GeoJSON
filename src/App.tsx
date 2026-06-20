import { useEffect, useState, useCallback } from 'react';
import { Map } from 'lucide-react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { Header } from './components/Layout/Header';
import { MainMenu } from './components/Menu/MainMenu';
import { GameMap } from './components/Map/GameMap';
import { GamePanel } from './components/Game/GamePanel';
import { ResultModal } from './components/Game/ResultModal';
import { DemographicsView } from './components/Demographics/DemographicsView';
import {
  buildProvinceQuestions, buildDistrictQuestions,
  buildCapitalQuestions, buildCityQuestions,
} from './utils/gameLogic';
import type { Province, District, City, GeoDistrictCollection } from './types';

type AppView = 'game' | 'demographics';

export default function App() {
  const { status, startGame, mode, difficulty } = useGameStore();
  const { theme } = useSettingsStore();

  const [view, setView] = useState<AppView>('game');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [geoData, setGeoData] = useState<GeoDistrictCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    Promise.all([
      fetch('data/provinces.json').then(r => r.json()),
      fetch('data/districts.geojson').then(r => r.json()),
      fetch('data/cities.json').then(r => r.json()),
    ]).then(([prov, geo, city]) => {
      setProvinces(prov);
      setGeoData(geo);
      const dists: District[] = (geo as GeoDistrictCollection).features.map(f => ({
        id: f.properties.id,
        nameUz: f.properties.nameUz,
        nameRu: f.properties.nameRu,
        nameEn: f.properties.nameEn,
        provinceId: f.properties.provinceId,
        center: f.properties.center,
      }));
      setDistricts(dists);
      setCities(city);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!provinces.length || !districts.length) return;
    let qs;
    if (mode === 'provinces')       qs = buildProvinceQuestions(provinces);
    else if (mode === 'districts')  qs = buildDistrictQuestions(districts, provinces);
    else if (mode === 'capitals')   qs = buildCapitalQuestions(provinces);
    else                            qs = buildCityQuestions(cities);
    startGame(mode, difficulty, qs);
  }, [mode, difficulty, provinces, districts, cities, startGame]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050814]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Map size={18} className="text-indigo-400" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Ma'lumotlar yuklanmoqda…
          </p>
        </div>
      </div>
    );
  }

  // Demographics view (separate from game flow)
  if (view === 'demographics' && geoData) {
    return (
      <div className="min-h-screen bg-[#050814] text-slate-100">
        <Header view={view} onViewChange={setView} />
        <DemographicsView geoData={geoData} provinces={provinces} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100">
      <Header view={view} onViewChange={setView} />

      {status === 'menu' && (
        <MainMenu provinces={provinces} districts={districts} cities={cities} />
      )}

      {status === 'playing' && geoData && (
        <div className="flex flex-col md:flex-row h-screen pt-16">
          <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800/60 game-panel md:h-full overflow-hidden">
            <GamePanel provinces={provinces} />
          </aside>
          <main className="flex-1 relative">
            <GameMap geoData={geoData} provinces={provinces} cities={cities} />
          </main>
        </div>
      )}

      {status === 'results' && (
        <ResultModal
          onPlayAgain={handlePlayAgain}
          provinces={provinces}
          districts={districts}
          cities={cities}
        />
      )}
    </div>
  );
}
