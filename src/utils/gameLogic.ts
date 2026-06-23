import type { Difficulty, Province, District, City, Question, GameMode, GeoFeature } from '../types';

// ── Distance ──────────────────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Scoring ───────────────────────────────────────────────────────────────
const BASE: Record<Difficulty, number> = { easy: 100, medium: 150, hard: 200 };

export function calcPolygonScore(
  correct: boolean,
  timeLeft: number,
  totalTime: number,
  difficulty: Difficulty,
): number {
  if (!correct) return 0;
  const base = BASE[difficulty];
  const timeBonus = Math.round((timeLeft / totalTime) * 50);
  return base + timeBonus;
}

export function calcProximityScore(
  distanceKm: number,
  timeLeft: number,
  totalTime: number,
  difficulty: Difficulty,
): number {
  const base = BASE[difficulty];
  const timeBonus = Math.round((timeLeft / totalTime) * 50);
  let factor = 0;
  if (distanceKm < 15)  factor = 1.0;
  else if (distanceKm < 40)  factor = 0.8;
  else if (distanceKm < 80)  factor = 0.5;
  else if (distanceKm < 150) factor = 0.25;
  return Math.round((base + timeBonus) * factor);
}

export function isProximityCorrect(distanceKm: number, difficulty: Difficulty): boolean {
  const thresholds: Record<Difficulty, number> = { easy: 80, medium: 50, hard: 30 };
  return distanceKm < thresholds[difficulty];
}

// ── Question generation ───────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COUNT = 15;

export function buildProvinceQuestions(provinces: Province[]): Question[] {
  return shuffle(provinces).slice(0, COUNT).map((p, i) => ({
    id: `q-${i}`,
    type: 'provinces' as GameMode,
    targetId: p.id,
    targetNameUz: p.nameUz,
    targetNameRu: p.nameRu,
    targetNameEn: p.nameEn,
    correctProvinceId: p.id,
  }));
}

export function buildDistrictQuestions(districts: District[], provinces: Province[]): Question[] {
  const provMap = Object.fromEntries(provinces.map(p => [p.id, p]));
  return shuffle(districts).slice(0, COUNT).map((d, i) => ({
    id: `q-${i}`,
    type: 'districts' as GameMode,
    targetId: d.id,
    targetNameUz: d.nameUz,
    targetNameRu: d.nameRu,
    targetNameEn: d.nameEn,
    provinceId: d.provinceId,
    coords: d.center,
    correctDistrictId: d.id,
    correctProvinceId: d.provinceId,
    ...(provMap[d.provinceId] && {
      _provinceNameUz: provMap[d.provinceId].nameUz,
      _provinceNameRu: provMap[d.provinceId].nameRu,
      _provinceNameEn: provMap[d.provinceId].nameEn,
    }),
  }));
}

export function buildCapitalQuestions(provinces: Province[]): Question[] {
  return shuffle(provinces).slice(0, COUNT).map((p, i) => ({
    id: `q-${i}`,
    type: 'capitals' as GameMode,
    targetId: p.id,
    targetNameUz: p.nameUz,
    targetNameRu: p.nameRu,
    targetNameEn: p.nameEn,
    coords: p.capitalCoords,
    correctProvinceId: p.id,
  }));
}

export function buildCityQuestions(cities: City[]): Question[] {
  return shuffle(cities).slice(0, COUNT).map((c, i) => ({
    id: `q-${i}`,
    type: 'cities' as GameMode,
    targetId: c.id,
    targetNameUz: c.nameUz,
    targetNameRu: c.nameRu,
    targetNameEn: c.nameEn,
    coords: c.coords,
  }));
}

// Unified builder for province-click geo-feature modes:
// mountains, rivers, historical, attractions, reservoirs, forests
export function buildGeoFeatureQuestions(features: GeoFeature[], mode: GameMode): Question[] {
  return shuffle(features).slice(0, COUNT).map((f, i) => ({
    id: `q-${i}`,
    type: mode,
    targetId: f.id,
    targetNameUz: f.nameUz,
    targetNameRu: f.nameRu,
    targetNameEn: f.nameEn,
    correctProvinceId: f.provinceId,
  }));
}

export function formatTime(seconds: number, lang: string): string {
  if (seconds < 60) return `${seconds} ${lang === 'en' ? 'sec' : lang === 'ru' ? 'сек' : 'son'}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const TOTAL_TIME: Record<Difficulty, number> = { easy: 45, medium: 30, hard: 15 };
