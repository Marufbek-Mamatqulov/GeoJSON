import { useEffect, useState, useCallback } from 'react';
import { Map } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { Header } from './components/Layout/Header';
import { LandingPage } from './components/Landing/LandingPage';
import { MainMenu } from './components/Menu/MainMenu';
import { GameMap } from './components/Map/GameMap';
import { GamePanel } from './components/Game/GamePanel';
import { ResultModal } from './components/Game/ResultModal';
import { DemographicsView } from './components/Demographics/DemographicsView';
import { EncyclopediaView } from './components/Encyclopedia/EncyclopediaView';
import { Tour360View } from './components/Tour360/Tour360View';
import { ChatBot } from './components/Chat/ChatBot';
import {
  buildProvinceQuestions, buildDistrictQuestions,
  buildCapitalQuestions, buildCityQuestions,
  buildGeoFeatureQuestions,
} from './utils/gameLogic';
import type { Province, District, City, GeoDistrictCollection, GeoProvinceCollection, GeoFeature, GameMode } from './types';

export type AppView = 'landing' | 'game' | 'demographics' | 'encyclopedia' | 'tour360';

export default function App() {
  const { status, startGame, mode, difficulty, goToMenu } = useGameStore();
  const { theme } = useSettingsStore();

  const [view, setView] = useState<AppView>('landing');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [geoData, setGeoData] = useState<GeoDistrictCollection | null>(null);
  const [provinceGeoData, setProvinceGeoData] = useState<GeoProvinceCollection | null>(null);
  const [loading, setLoading] = useState(true);

  // Extra geo-feature data
  const [mountains,    setMountains]    = useState<GeoFeature[]>([]);
  const [rivers,       setRivers]       = useState<GeoFeature[]>([]);
  const [historical,   setHistorical]   = useState<GeoFeature[]>([]);
  const [attractions,  setAttractions]  = useState<GeoFeature[]>([]);
  const [reservoirs,   setReservoirs]   = useState<GeoFeature[]>([]);
  const [forests,      setForests]      = useState<GeoFeature[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    Promise.all([
      fetch('data/provinces.json').then(r => r.json()),
      fetch('data/districts.geojson').then(r => r.json()),
      fetch('data/provinces-geo.geojson').then(r => r.json()),
      fetch('data/cities.json').then(r => r.json()),
      fetch('data/mountains.json').then(r => r.json()),
      fetch('data/rivers.json').then(r => r.json()),
      fetch('data/historical.json').then(r => r.json()),
      fetch('data/attractions.json').then(r => r.json()),
      fetch('data/reservoirs.json').then(r => r.json()),
      fetch('data/forests.json').then(r => r.json()),
    ]).then(([prov, geo, provGeo, city, mtn, riv, hist, attr, res, for_]) => {
      setProvinces(prov);
      setGeoData(geo);
      setProvinceGeoData(provGeo);
      const dists: District[] = (geo as GeoDistrictCollection).features.map(f => ({
        id:         f.properties.id,
        nameUz:     f.properties.nameUz,
        nameRu:     f.properties.nameRu,
        nameEn:     f.properties.nameEn,
        provinceId: f.properties.provinceId,
        center:     f.properties.center,
      }));
      setDistricts(dists);
      setCities(city);
      setMountains(mtn);
      setRivers(riv);
      setHistorical(hist);
      setAttractions(attr);
      setReservoirs(res);
      setForests(for_);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const buildQuestions = useCallback((m: GameMode, scopeProvinceId?: string | null, countLimit?: number | null) => {
    if (m === 'provinces')   return buildProvinceQuestions(provinces);
    if (m === 'districts')   return buildDistrictQuestions(districts, provinces, scopeProvinceId, countLimit);
    if (m === 'capitals')    return buildCapitalQuestions(provinces);
    if (m === 'cities')      return buildCityQuestions(cities, scopeProvinceId, countLimit);
    if (m === 'mountains')   return buildGeoFeatureQuestions(mountains, m);
    if (m === 'rivers')      return buildGeoFeatureQuestions(rivers, m);
    if (m === 'historical')  return buildGeoFeatureQuestions(historical, m);
    if (m === 'attractions') return buildGeoFeatureQuestions(attractions, m);
    if (m === 'reservoirs')  return buildGeoFeatureQuestions(reservoirs, m);
    if (m === 'forests')     return buildGeoFeatureQuestions(forests, m);
    return buildProvinceQuestions(provinces);
  }, [provinces, districts, cities, mountains, rivers, historical, attractions, reservoirs, forests]);

  const handlePlayAgain = useCallback(() => {
    if (!provinces.length) return;
    const { scopeProvinceId } = useGameStore.getState();
    startGame(mode, difficulty, buildQuestions(mode, scopeProvinceId), scopeProvinceId);
  }, [mode, difficulty, buildQuestions, provinces, startGame]);

  const handleGoToMenu = () => { goToMenu(); setView('game'); };

  const handleRetryWrong = useCallback(() => {
    const { answers, questions, mode: m, difficulty: diff, scopeProvinceId } = useGameStore.getState();
    const wrongIds = new Set(answers.filter(a => !a.correct).map(a => a.questionId));
    const wrongQuestions = questions
      .filter(q => wrongIds.has(q.id))
      .map((q, i) => ({ ...q, id: `retry-${i}` }));
    if (wrongQuestions.length === 0) return;
    startGame(m, diff, wrongQuestions, scopeProvinceId);
  }, [startGame]);

  const handlePlayProvinceFromEncyclopedia = useCallback(() => {
    if (!provinces.length) return;
    startGame('provinces', difficulty, buildQuestions('provinces'));
    setView('game');
  }, [provinces, difficulty, buildQuestions, startGame]);

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

  if (view === 'landing') {
    return (
      <>
        <Header view={view} onViewChange={setView} />
        <LandingPage
          onPlay={() => setView('game')}
          onDemographics={() => setView('demographics')}
          onEncyclopedia={() => setView('encyclopedia')}
        />
        <ChatBot />
        <Analytics />
      </>
    );
  }

  if (view === 'demographics' && geoData) {
    return (
      <div className="min-h-screen bg-[#050814] text-slate-100">
        <Header view={view} onViewChange={setView} />
        <DemographicsView geoData={geoData} provinces={provinces} />
        <ChatBot />
        <Analytics />
      </div>
    );
  }

  if (view === 'encyclopedia') {
    return (
      <div className="min-h-screen bg-[#050814] text-slate-100">
        <Header view={view} onViewChange={setView} />
        <EncyclopediaView
          provinces={provinces}
          onPlayProvince={handlePlayProvinceFromEncyclopedia}
        />
        <ChatBot />
        <Analytics />
      </div>
    );
  }

  if (view === 'tour360') {
    return (
      <div className="min-h-screen bg-[#050814] text-slate-100">
        <Header view={view} onViewChange={setView} />
        <Tour360View />
        <ChatBot />
        <Analytics />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100">
      <Header view={view} onViewChange={setView} />

      {status === 'menu' && (
        <MainMenu
          provinces={provinces}
          districts={districts}
          cities={cities}
          mountains={mountains}
          rivers={rivers}
          historical={historical}
          attractions={attractions}
          reservoirs={reservoirs}
          forests={forests}
          buildQuestions={buildQuestions}
          onBackToLanding={() => setView('landing')}
        />
      )}

      {status === 'playing' && geoData && provinceGeoData && (
        <div className="flex flex-col md:flex-row h-screen pt-16">
          <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r
            border-slate-800/60 game-panel md:h-full overflow-hidden">
            <GamePanel provinces={provinces} />
          </aside>
          <main className="flex-1 relative">
            <GameMap geoData={geoData} provinceGeoData={provinceGeoData} provinces={provinces} cities={cities} />
          </main>
        </div>
      )}

      {status === 'results' && (
        <ResultModal
          onPlayAgain={handlePlayAgain}
          onGoToMenu={handleGoToMenu}
          onRetryWrong={handleRetryWrong}
          provinces={provinces}
          districts={districts}
          cities={cities}
        />
      )}

      <ChatBot />
      <Analytics />
    </div>
  );
}
