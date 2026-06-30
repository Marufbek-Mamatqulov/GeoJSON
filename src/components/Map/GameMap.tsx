import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useGame } from '../../hooks/useGame';
import type {
  GeoDistrictCollection, GeoDistrictFeature,
  GeoProvinceCollection, GeoProvinceFeature,
  Province, City, GameMode,
} from '../../types';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TARGET_ICON = L.divIcon({
  className: '',
  html: `<div style="animation:bounce 1s ease-in-out infinite alternate;filter:drop-shadow(0 2px 8px rgba(99,102,241,.7))">
    <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#6366f1" stroke="#fff" stroke-width="1.2"/>
      <circle cx="12" cy="9" r="2.8" fill="#fff"/>
    </svg>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

// Province-click modes use the dissolved province polygons (no district borders)
const PROVINCE_CLICK_MODES: GameMode[] = [
  'provinces', 'capitals',
  'mountains', 'rivers', 'historical', 'attractions', 'reservoirs', 'forests',
];

function isCityDistrictFeature(feature: GeoDistrictFeature): boolean {
  const { nameEn, nameUz, nameRu } = feature.properties;
  return nameEn.toLowerCase().includes(' city') || nameEn.toLowerCase().endsWith(' city')
    || nameUz.toLowerCase().includes('shahri') || nameRu.toLowerCase().includes('г.');
}

interface Props {
  geoData: GeoDistrictCollection;
  provinceGeoData: GeoProvinceCollection;
  provinces: Province[];
  cities: City[];
}

function MapInit() {
  const map = useMap();
  useEffect(() => { map.setView([41.0, 64.0], 6); }, [map]);
  return null;
}

interface ClickHandlerProps {
  active: boolean;
  onLocationClick: (lat: number, lng: number) => void;
  feedbackActive: boolean;
  playing: boolean;
}
function LocationClickHandler({ active, onLocationClick, feedbackActive, playing }: ClickHandlerProps) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (feedbackActive || !playing) return;
      onLocationClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, active, feedbackActive, playing, onLocationClick]);
  return null;
}

// ── Province-mode layer (dissolved province polygons) ────────────────────────

interface ProvLayerProps {
  data: GeoProvinceCollection;
  provColors: Record<string, string>;
  provMap: Record<string, Province>;
  revealedMap: Record<string, 'found_1' | 'found_2' | 'found_3' | 'missed'>;
  highlightCorrectId: string | null;
  highlightWrongId: string | null;
  questionAttempts: number;
  feedback: string | null;
  status: string;
  gameStrategy: string;
  onProvinceClick: (f: GeoDistrictFeature) => void;
}

function ProvinceLayer({
  data, provColors, provMap, revealedMap,
  highlightCorrectId, highlightWrongId, questionAttempts,
  feedback, status, gameStrategy, onProvinceClick,
}: ProvLayerProps) {
  const geoRef = useRef<L.GeoJSON | null>(null);
  const { language: lang, showLabels: labels } = useSettingsStore();

  const styleFeature = useCallback((f?: GeoProvinceFeature): PathOptions => {
    if (!f) return {};
    const { provinceId } = f.properties;

    const revealed = revealedMap[provinceId];
    if (revealed === 'found_1')
      return { fillColor: '#22c55e', color: '#16a34a', weight: 2, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'found_2')
      return { fillColor: '#3b82f6', color: '#2563eb', weight: 2, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'found_3')
      return { fillColor: '#eab308', color: '#ca8a04', weight: 2, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'missed')
      return { fillColor: '#ef4444', color: '#dc2626', weight: 2, fillOpacity: 0.80, opacity: 1 };

    if (highlightCorrectId && provinceId === highlightCorrectId)
      return { fillColor: '#22c55e', color: '#16a34a', weight: 2, fillOpacity: 0.88, opacity: 1 };
    if (highlightWrongId && provinceId === highlightWrongId) {
      const isRed = questionAttempts >= 2;
      return isRed
        ? { fillColor: '#ef4444', color: '#dc2626', weight: 2, fillOpacity: 0.72, opacity: 1 }
        : { fillColor: '#eab308', color: '#ca8a04', weight: 2, fillOpacity: 0.72, opacity: 1 };
    }

    if (gameStrategy === 'seterra') {
      return { fillColor: '#f8fafc', color: '#475569', weight: 1.5, fillOpacity: 0.92, opacity: 1 };
    }
    const base = provColors[provinceId] ?? '#94a3b8';
    return { fillColor: base, color: '#ffffff', weight: 1.5, fillOpacity: 0.80, opacity: 1 };
  }, [revealedMap, highlightCorrectId, highlightWrongId, questionAttempts, provColors, gameStrategy]);

  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.eachLayer(layer => {
      const f = (layer as L.GeoJSON & { feature?: GeoProvinceFeature }).feature;
      if (f && 'setStyle' in layer)
        (layer as L.Path).setStyle(styleFeature(f as GeoProvinceFeature));
    });
  }, [styleFeature]);

  const onEach = useCallback((feature: GeoProvinceFeature, layer: Layer) => {
    const path = layer as L.Path;
    path.on({
      mouseover: () => {
        if (feedback) return;
        const nameKey = `name${lang[0].toUpperCase()}${lang.slice(1)}` as 'nameUz';
        const displayName = provMap[feature.properties.provinceId]?.[nameKey] ?? feature.properties.provinceId;
        if (labels) {
          path.bindTooltip(
            `<span style="font-size:13px;font-weight:600">${displayName}</span>`,
            { permanent: false, sticky: true, className: 'geo-tooltip' }
          ).openTooltip();
        }
        const { gameStrategy: gs } = useSettingsStore.getState();
        path.setStyle(
          gs === 'seterra'
            ? { fillOpacity: 0.68, fillColor: '#e2e8f0', color: '#1e293b', weight: 2 }
            : { fillOpacity: 0.95, weight: 2 }
        );
      },
      mouseout: () => {
        path.closeTooltip();
        path.setStyle(styleFeature(feature));
      },
      click: (e: LeafletMouseEvent) => {
        if (feedback || status !== 'playing') return;
        L.DomEvent.stopPropagation(e);
        // Adapt province feature to the shape handleProvinceClick expects
        onProvinceClick(feature as unknown as GeoDistrictFeature);
      },
    });
  }, [feedback, status, lang, labels, provMap, styleFeature, onProvinceClick]);

  return (
    <GeoJSON
      key={`prov-${highlightCorrectId ?? ''}-${highlightWrongId ?? ''}-${gameStrategy}`}
      data={data as GeoJSON.GeoJsonObject}
      style={f => styleFeature(f as GeoProvinceFeature)}
      onEachFeature={(f, l) => onEach(f as GeoProvinceFeature, l)}
      ref={geoRef}
    />
  );
}

// ── District-mode layer ──────────────────────────────────────────────────────

interface DistLayerProps {
  data: GeoDistrictCollection;
  provColors: Record<string, string>;
  revealedMap: Record<string, 'found_1' | 'found_2' | 'found_3' | 'missed'>;
  highlightCorrectId: string | null;
  highlightWrongId: string | null;
  feedback: string | null;
  status: string;
  onDistrictClick: (f: GeoDistrictFeature) => void;
}

function DistrictLayer({
  data, revealedMap, highlightCorrectId, highlightWrongId,
  feedback, status, onDistrictClick,
}: DistLayerProps) {
  const geoRef = useRef<L.GeoJSON | null>(null);
  const { language: lang, showLabels: labels } = useSettingsStore();

  const styleFeature = useCallback((f?: GeoDistrictFeature): PathOptions => {
    if (!f) return {};
    if (isCityDistrictFeature(f))
      return { fillColor: 'transparent', color: 'transparent', weight: 0, fillOpacity: 0, opacity: 0 };

    const { id } = f.properties;
    const revealed = revealedMap[id];
    if (revealed === 'found_1')
      return { fillColor: '#22c55e', color: '#16a34a', weight: 1.5, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'found_2')
      return { fillColor: '#3b82f6', color: '#2563eb', weight: 1.5, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'found_3')
      return { fillColor: '#eab308', color: '#ca8a04', weight: 1.5, fillOpacity: 0.85, opacity: 1 };
    if (revealed === 'missed')
      return { fillColor: '#ef4444', color: '#dc2626', weight: 1.5, fillOpacity: 0.80, opacity: 1 };

    if (highlightCorrectId && id === highlightCorrectId)
      return { fillColor: '#22c55e', color: '#16a34a', weight: 2, fillOpacity: 0.85, opacity: 1 };
    if (highlightWrongId && id === highlightWrongId)
      return { fillColor: '#ef4444', color: '#dc2626', weight: 2, fillOpacity: 0.65, opacity: 1 };

    // Always white with visible borders for districts
    return { fillColor: '#f8fafc', color: '#475569', weight: 1, fillOpacity: 0.92, opacity: 1 };
  }, [revealedMap, highlightCorrectId, highlightWrongId]);

  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.eachLayer(layer => {
      const f = (layer as L.GeoJSON & { feature?: GeoDistrictFeature }).feature;
      if (f && 'setStyle' in layer)
        (layer as L.Path).setStyle(styleFeature(f as GeoDistrictFeature));
    });
  }, [styleFeature]);

  const onEach = useCallback((feature: GeoDistrictFeature, layer: Layer) => {
    if (isCityDistrictFeature(feature)) return;
    const path = layer as L.Path;
    path.on({
      mouseover: () => {
        if (feedback) return;
        const { language: l, showLabels: lbl } = useSettingsStore.getState();
        const nameKey = `name${l[0].toUpperCase()}${l.slice(1)}` as 'nameUz';
        if (lbl) {
          path.bindTooltip(
            `<span style="font-size:13px;font-weight:600">${feature.properties[nameKey]}</span>`,
            { permanent: false, sticky: true, className: 'geo-tooltip' }
          ).openTooltip();
        }
        path.setStyle({ fillOpacity: 0.70, fillColor: '#e2e8f0', color: '#1e293b', weight: 2 });
      },
      mouseout: () => {
        path.closeTooltip();
        path.setStyle(styleFeature(feature));
      },
      click: (e: LeafletMouseEvent) => {
        if (feedback || status !== 'playing') return;
        L.DomEvent.stopPropagation(e);
        onDistrictClick(feature);
      },
    });
  }, [feedback, status, lang, labels, styleFeature, onDistrictClick]);

  return (
    <GeoJSON
      key={`dist-${highlightCorrectId ?? ''}-${highlightWrongId ?? ''}`}
      data={data as GeoJSON.GeoJsonObject}
      style={f => styleFeature(f as GeoDistrictFeature)}
      onEachFeature={(f, l) => onEach(f as GeoDistrictFeature, l)}
      ref={geoRef}
    />
  );
}

// ── Cities background layer ──────────────────────────────────────────────────

function CitiesBackgroundLayer({ data, provColors }: { data: GeoDistrictCollection; provColors: Record<string, string> }) {
  const styleFeature = useCallback((f?: GeoDistrictFeature): PathOptions => {
    if (!f) return {};
    const base = provColors[f.properties.provinceId] ?? '#94a3b8';
    return { fillColor: base, color: '#ffffff', weight: 0.5, fillOpacity: 0.30, opacity: 0.6 };
  }, [provColors]);

  return (
    <GeoJSON
      key="cities-bg"
      data={data as GeoJSON.GeoJsonObject}
      style={f => styleFeature(f as GeoDistrictFeature)}
    />
  );
}

// ── Main GameMap ─────────────────────────────────────────────────────────────

export function GameMap({ geoData, provinceGeoData, provinces, cities }: Props) {
  const {
    mode, questions, currentIndex,
    highlightCorrectId, highlightWrongId,
    feedback, status, revealedMap, questionAttempts,
  } = useGameStore();
  const { theme, gameStrategy, showHint } = useSettingsStore();
  const { handleProvinceClick, handleDistrictClick, handleLocationClick } = useGame();

  const provColors = useMemo(
    () => Object.fromEntries(provinces.map(p => [p.id, p.color])),
    [provinces],
  );

  const provMap = useMemo(
    () => Object.fromEntries(provinces.map(p => [p.id, p])),
    [provinces],
  );

  const q = questions[currentIndex];

  const targetCoords = useMemo(() => {
    if (!q?.coords) return null;
    return { lat: q.coords[1], lng: q.coords[0] };
  }, [q]);

  const isProvClickMode = PROVINCE_CLICK_MODES.includes(mode);

  // ── City dot markers ────────────────────────────────────────────────────────
  const cityMarkers = useMemo(() => {
    if (mode !== 'cities') return null;
    const dotColor = theme === 'dark' ? '#34d399' : '#059669';
    return cities.map(city => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${dotColor};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      return <Marker key={city.id} position={[city.coords[1], city.coords[0]]} icon={icon} />;
    });
  }, [mode, cities, theme]);

  // ── Tiles ───────────────────────────────────────────────────────────────────
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <MapContainer
      center={[41.0, 64.0]}
      zoom={6}
      className="w-full h-full"
      style={{ background: theme === 'dark' ? '#050814' : '#e2e8f0' }}
    >
      <TileLayer url={tileUrl} attribution={tileAttr} subdomains="abcd" maxZoom={19} />
      <MapInit />

      <LocationClickHandler
        active={mode === 'capitals' || mode === 'cities'}
        onLocationClick={handleLocationClick}
        feedbackActive={feedback !== null}
        playing={status === 'playing'}
      />

      {/* Province click modes: show dissolved province polygons (no district borders) */}
      {isProvClickMode && (
        <ProvinceLayer
          data={provinceGeoData}
          provColors={provColors}
          provMap={provMap}
          revealedMap={revealedMap}
          highlightCorrectId={highlightCorrectId}
          highlightWrongId={highlightWrongId}
          questionAttempts={questionAttempts}
          feedback={feedback}
          status={status}
          gameStrategy={gameStrategy}
          onProvinceClick={handleProvinceClick}
        />
      )}

      {/* District mode: show individual district polygons */}
      {mode === 'districts' && (
        <DistrictLayer
          data={geoData}
          provColors={provColors}
          revealedMap={revealedMap}
          highlightCorrectId={highlightCorrectId}
          highlightWrongId={highlightWrongId}
          feedback={feedback}
          status={status}
          onDistrictClick={handleDistrictClick}
        />
      )}

      {/* Cities mode: province-colored background */}
      {mode === 'cities' && (
        <CitiesBackgroundLayer data={geoData} provColors={provColors} />
      )}

      {/* Target pin: only for location modes (capitals/cities); wrong → only if showHint is on */}
      {(mode === 'capitals' || mode === 'cities') && targetCoords && feedback &&
        (feedback === 'correct' || showHint) && (
        <Marker position={[targetCoords.lat, targetCoords.lng]} icon={TARGET_ICON} />
      )}

      {(mode === 'capitals' || mode === 'cities') && targetCoords && feedback &&
        (feedback === 'correct' || showHint) && (
        <Circle
          center={[targetCoords.lat, targetCoords.lng]}
          radius={feedback === 'correct' ? 15000 : 50000}
          pathOptions={{
            color:       feedback === 'correct' ? '#22c55e' : '#ef4444',
            fillColor:   feedback === 'correct' ? '#22c55e' : '#ef4444',
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}

      {cityMarkers}
    </MapContainer>
  );
}
