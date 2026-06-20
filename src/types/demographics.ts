export type DemoMetric = 'population' | 'births' | 'deaths' | 'growth';
export type DemoGranularity = 'provinces' | 'districts';

export interface DemoYearEntry {
  population?: number; // thousand persons
  births?: number;     // persons
  deaths?: number;     // persons
}

export interface DemographicsData {
  meta: {
    lastUpdated: string;
    years: number[];
    units: { population: string; births: string; deaths: string };
    sources: { population: string; births: string; deaths: string };
  };
  national: Record<string, DemoYearEntry>;
  provinces: Record<string, Record<string, DemoYearEntry>>;
  districts: Record<string, Record<string, DemoYearEntry>>;
}
