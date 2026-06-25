export type Language = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStrategy = 'seterra' | 'worldgeo';
export type GameMode =
  | 'provinces' | 'districts' | 'capitals' | 'cities'
  | 'mountains' | 'rivers' | 'historical' | 'attractions' | 'reservoirs' | 'forests';
export type GameStatus = 'menu' | 'playing' | 'results';
export type AnswerFeedback = 'correct' | 'wrong' | null;

export interface Province {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  capitalUz: string;
  capitalRu: string;
  capitalEn: string;
  capitalCoords: [number, number]; // [lng, lat]
  color: string;
  order: number;
  // Enriched (optional) — populated from provinces.json
  area?: number;
  population?: number;
  founded?: number;
  districts?: number;
  funFactUz?: string;
  funFactRu?: string;
  funFactEn?: string;
  majorCitiesUz?: string[];
  majorCitiesRu?: string[];
  majorCitiesEn?: string[];
}

// Province guaranteed to carry enrichment fields.
export interface ProvinceEnriched extends Province {
  area: number;
  population: number;
  founded: number;
  districts: number;
  funFactUz: string;
  majorCitiesUz: string[];
}

export interface District {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  provinceId: string;
  center: [number, number]; // [lng, lat]
}

export interface City {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  province: string;
  coords: [number, number]; // [lng, lat]
  isCapital: boolean;
  isCountryCapital: boolean;
  pop: number;
}

// Generic geographic feature (mountains, rivers, historical places, etc.)
export interface GeoFeature {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  provinceId: string;
  lat: number;
  lng: number;
  descUz?: string;
}

export interface Question {
  id: string;
  type: GameMode;
  targetId: string;
  targetNameUz: string;
  targetNameRu: string;
  targetNameEn: string;
  provinceId?: string;
  coords?: [number, number]; // [lng, lat]
  correctDistrictId?: string;
  correctProvinceId?: string;
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  timeUsed: number;
  pointsEarned: number;
  distanceKm?: number;
  attempts?: number;
}

export interface GameStats {
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  highScores: Partial<Record<GameMode, Partial<Record<Difficulty, number>>>>;
  totalTimePlayed: number;
  lastPlayed: string;
  streak: number;
  bestStreak: number;
}

export interface GeoDistrictFeature {
  type: 'Feature';
  id: string;
  properties: {
    id: string;
    nameEn: string;
    nameUz: string;
    nameRu: string;
    provinceId: string;
    center: [number, number];
  };
  geometry: GeoJSON.Geometry;
}

export interface GeoDistrictCollection {
  type: 'FeatureCollection';
  features: GeoDistrictFeature[];
}
