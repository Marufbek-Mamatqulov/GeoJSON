import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Layer, PathOptions, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useGame } from '../../hooks/useGame';
import type { GeoDistrictCollection, GeoDistrictFeature, Province, City, GameMode } from '../../types';

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

export function GameMap({ geoData, provinces, cities }: Props) {
  const {
    mode, questions, currentIndex,
    highlightCorrectId, highlightWrongId,
    feedback, status, revealedMap, questionAttempts,
  } = useGameStore();
  const { theme, gameStrategy } = useSettingsStore();
  const { handleProvinceClick, handleDistrictClick, handleLocationClick } = useGame();
  const geoRef = useRef<L.GeoJSON | null>(null);

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

  // ── Polygon style ──────────────────────────────────────────────────────────
  const featureStyle = useCallback((feature?: GeoDistrictFeature): PathOptions => {
    if (!feature) return {};
    const { id, provinceId } = feature.properties;

    if (isProvClickMode) {
      // Revealed (correct find or auto-reveal)
      const revealed = revealedMap[provinceId];
      if (revealed === 'correct')
        return { fillColor: '#22c55e', color: '#16a34a', weight: 1, fillOpacity: 0.75, opacity: 1 };
      if (revealed === 'missed')
        return { fillColor: '#f59e0b', color: '#d97706', weight: 1, fillOpacity: 0.65, opacity: 1 };

      // Feedback highlight
      if (highlightCorrectId && provinceId === highlightCorrectId)
        return { fillColor: '#22c55e', color: '#16a34a', weight: 0, fillOpacity: 0.75, opacity: 1 };
      if (highlightWrongId && id === highlightWrongId) {
        const isRed = questionAttempts >= 2;
        return isRed
          ? { fillColor: '#ef4444', color: '#dc2626', weight: 0, fillOpacity: 0.65, opacity: 1 }
          : { fillColor: '#eab308', color: '#ca8a04', weight: 0, fillOpacity: 0.65, opacity: 1 };
      }

      if (gameStrategy === 'seterra') {
        // Neutral gray — provinces not yet found
        return { fillColor: '#334155', color: '#334155', weight: 0, fillOpacity: 0.45, opacity: 1 };
      }
      // WorldGeo — province colors always shown
      const base = provColors[provinceId] ?? '#94a3b8';
      return { fillColor: base, color: base, weight: 0, fillOpacity: 0.6, opacity: 1 };
    }

    if (mode === 'districts') {
      if (isCityDistrictFeature(feature))
        return { fillColor: 'transparent', color: 'transparent', weight: 0, fillOpacity: 0, opacity: 0 };

      const revealed = revealedMap[id];
      if (revealed === 'correct')
        return { fillColor: '#22c55e', color: '#16a34a', weight: 2.5, fillOpacity: 0.75, opacity: 1 };
      if (revealed === 'missed')
        return { fillColor: '#f59e0b', color: '#d97706', weight: 2, fillOpacity: 0.65, opacity: 1 };

      if (highlightCorrectId && id === highlightCorrectId)
        return { fillColor: '#22c55e', color: '#16a34a', weight: 2.5, fillOpacity: 0.75, opacity: 1 };
      if (highlightWrongId && id === highlightWrongId) {
        const isRed = questionAttempts >= 2;
        return isRed
          ? { fillColor: '#ef4444', color: '#dc2626', weight: 2, fillOpacity: 0.65, opacity: 1 }
          : { fillColor: '#eab308', color: '#ca8a04', weight: 2, fillOpacity: 0.65, opacity: 1 };
      }

      if (gameStrategy === 'seterra') {
        return { fillColor: '#334155', color: '#475569', weight: 0.8, fillOpacity: 0.35, opacity: 0.6 };
      }
      const base = provColors[provinceId] ?? '#94a3b8';
      return { fillColor: base, color: '#fff', weight: 0.8, fillOpacity: 0.45, opacity: 0.7 };
    }

    // cities mode
    if (highlightCorrectId && provinceId === highlightCorrectId)
      return { fillColor: '#22c55e', color: '#16a34a', weight: 2, fillOpacity: 0.5, opacity: 1 };
    const base = provColors[provinceId] ?? '#94a3b8';
    return { fillColor: base, color: '#fff', weight: 0.8, fillOpacity: 0.3, opacity: 0.6 };
  }, [mode, isProvClickMode, highlightCorrectId, highlightWrongId, provColors, revealedMap, questionAttempts, gameStrategy]);

  // Re-style without full GeoJSON remount
  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.eachLayer((layer) => {
      const f = (layer as L.GeoJSON & { feature?: GeoDistrictFeature }).feature;
      if (f && 'setStyle' in layer) (layer as L.Path).setStyle(featureStyle(f as GeoDistrictFeature));
    });
  }, [featureStyle]);

  // ── Per-feature events ──────────────────────────────────────────────────
  const onEachFeature = useCallback((feature: GeoDistrictFeature, layer: Layer) => {
    const path = layer as L.Path;

    path.on({
      mouseover: () => {
        if (mode === 'districts' && isCityDistrictFeature(feature)) return;
        if (feedback) return;
        const { language: lang, showLabels: labels } = useSettingsStore.getState();
        const nameKey = `name${lang[0].toUpperCase()}${lang.slice(1)}` as 'nameUz';
        const displayName = isProvClickMode
          ? (provMap[feature.properties.provinceId]?.[nameKey] ?? feature.properties[nameKey])
          : feature.properties[nameKey];
        if (labels) {
          path.bindTooltip(
            `<span style="font-size:13px;font-weight:600">${displayName}</span>`,
            { permanent: false, sticky: true, className: 'geo-tooltip' }
          ).openTooltip();
        }

        if (isProvClickMode) {
          // Highlight ENTIRE province — no individual district borders shown
          const pId = feature.properties.provinceId;
          geoRef.current?.eachLayer((l) => {
            const f2 = (l as L.GeoJSON & { feature?: GeoDistrictFeature }).feature;
            if (f2?.properties.provinceId === pId && 'setStyle' in l) {
              (l as L.Path).setStyle({ fillOpacity: 0.85, weight: 0 });
            }
          });
        } else {
          path.setStyle({ fillOpacity: 0.8, weight: 2 });
        }
      },
      mouseout: () => {
        if (mode === 'districts' && isCityDistrictFeature(feature)) return;
        path.closeTooltip();
        if (isProvClickMode) {
          const pId = feature.properties.provinceId;
          geoRef.current?.eachLayer((l) => {
            const f2 = (l as L.GeoJSON & { feature?: GeoDistrictFeature }).feature;
            if (f2?.properties.provinceId === pId && 'setStyle' in l) {
              (l as L.Path).setStyle(featureStyle(f2 as GeoDistrictFeature));
            }
          });
        } else {
          path.setStyle(featureStyle(feature));
        }
      },
      click: (e: LeafletMouseEvent) => {
        if (mode === 'districts' && isCityDistrictFeature(feature)) return;
        if (feedback || status !== 'playing') return;
        L.DomEvent.stopPropagation(e);
        if (isProvClickMode) handleProvinceClick(feature);
        else if (mode === 'districts') handleDistrictClick(feature);
      },
    });
  }, [mode, isProvClickMode, feedback, status, featureStyle, provMap, handleProvinceClick, handleDistrictClick]);

  // ── City dot markers ──────────────────────────────────────────────────────
  const cityMarkers = useMemo(() => {
    if (mode !== 'cities') return null;
    const dotColor = theme === 'dark' ? '#34d399' : '#059669';
    return cities.map(city => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:8px;height:8px;border-radius:50%;background:${dotColor};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [8, 8], iconAnchor: [4, 4],
      });
      return <Marker key={city.id} position={[city.coords[1], city.coords[0]]} icon={icon} />;
    });
  }, [mode, cities, theme]);

  // ── Tiles ──────────────────────────────────────────────────────────────────
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

      <GeoJSON
        key={`${mode}-${currentIndex}-${highlightCorrectId ?? ''}-${highlightWrongId ?? ''}-${gameStrategy}`}
        data={geoData as GeoJSON.GeoJsonObject}
        style={(f) => featureStyle(f as GeoDistrictFeature)}
        onEachFeature={(f, l) => onEachFeature(f as GeoDistrictFeature, l)}
        ref={geoRef}
      />

      {targetCoords && feedback && (
        <Marker position={[targetCoords.lat, targetCoords.lng]} icon={TARGET_ICON} />
      )}

      {targetCoords && feedback && (
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
