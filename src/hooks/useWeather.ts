import { useState, useEffect } from 'react';

export interface WeatherData {
  temp: number;
  code: number;
  windKmh: number;
  humidity: number;
}

export function useWeather(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setWeather(null);
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m` +
      `&wind_speed_unit=kmh&timezone=auto`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        const c = d.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          code: c.weathercode as number,
          windKmh: Math.round(c.wind_speed_10m),
          humidity: c.relative_humidity_2m as number,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading };
}

export function wmoDescription(code: number, lang: string): string {
  const idx =
    code === 0 ? 0 :
    code <= 2  ? 1 :
    code === 3 ? 2 :
    code <= 48 ? 3 :
    code <= 57 ? 4 :
    code <= 67 ? 5 :
    code <= 77 ? 6 :
    code <= 82 ? 5 :
    7;

  const labels: Record<string, string[]> = {
    uz: ["Serob", "Asosan serob", "Bulutli", "Tuman", "Chayqalib yomg'ir", "Yomg'ir", "Qor", "Momaqaldiroq"],
    ru: ["Ясно", "В основном ясно", "Облачно", "Туман", "Морось", "Дождь", "Снег", "Гроза"],
    en: ["Clear", "Mostly clear", "Cloudy", "Fog", "Drizzle", "Rain", "Snow", "Thunderstorm"],
  };

  return (labels[lang] ?? labels.en)[idx];
}

export function wmoIcon(code: number): string {
  if (code === 0) return 'sun';
  if (code <= 2)  return 'sun-cloud';
  if (code === 3) return 'cloud';
  if (code <= 48) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  return 'storm';
}
