export type Language = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'provinces' | 'districts' | 'capitals' | 'cities';
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

export interface Question {
  id: string;
  type: GameMode;
  targetId: string;       // province id or district id or city id
  targetNameUz: string;
  targetNameRu: string;
  targetNameEn: string;
  provinceId?: string;    // for districts: which province it belongs to
  coords?: [number, number]; // for location modes (capitals, cities)
  correctDistrictId?: string; // for district mode
  correctProvinceId?: string; // for province mode
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  timeUsed: number;
  pointsEarned: number;
  distanceKm?: number;
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
