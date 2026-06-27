import { useState, useEffect } from 'react';

export interface WikiSummary {
  extract: string;
  image?: string;
  pageUrl: string;
}

// Province ID → Wikipedia article title per language
const WIKI_TITLES: Record<string, { uz: string; ru: string; en: string }> = {
  karakalpakstan: { uz: "Qoraqalpog'iston Respublikasi", ru: 'Каракалпакстан', en: 'Karakalpakstan' },
  khorezm:        { uz: 'Xorazm viloyati',               ru: 'Хорезмская область',       en: 'Khorezm Region' },
  bukhara:        { uz: 'Buxoro viloyati',                ru: 'Бухарская область',        en: 'Bukhara Region' },
  navoi:          { uz: 'Navoiy viloyati',                ru: 'Навоийская область',       en: 'Navoiy Region' },
  samarkand:      { uz: 'Samarqand viloyati',             ru: 'Самаркандская область',    en: 'Samarkand Region' },
  kashkadarya:    { uz: 'Qashqadaryo viloyati',           ru: 'Кашкадарьинская область',  en: 'Kashkadarya Region' },
  surkhandarya:   { uz: 'Surxondaryo viloyati',           ru: 'Сурхандарьинская область', en: 'Surxondaryo Region' },
  jizzakh:        { uz: 'Jizzax viloyati',                ru: 'Джизакская область',       en: 'Jizzakh Region' },
  syrdarya:       { uz: 'Sirdaryo viloyati',              ru: 'Сырдарьинская область',    en: 'Sirdaryo Region' },
  tashkent:       { uz: 'Toshkent viloyati',              ru: 'Ташкентская область',      en: 'Tashkent Region' },
  'tashkent-city':{ uz: 'Toshkent',                      ru: 'Ташкент',                  en: 'Tashkent' },
  namangan:       { uz: 'Namangan viloyati',              ru: 'Наманганская область',     en: 'Namangan Region' },
  fergana:        { uz: "Farg'ona viloyati",              ru: 'Ферганская область',       en: 'Fergana Region' },
  andijan:        { uz: 'Andijon viloyati',               ru: 'Андижанская область',      en: 'Andijan Region' },
};

export function getWikiTitle(provinceId: string, lang: string): string | null {
  const entry = WIKI_TITLES[provinceId];
  if (!entry) return null;
  return entry[lang as keyof typeof entry] ?? entry.en;
}

export function useWikipedia(provinceId: string, lang: string) {
  const [data, setData] = useState<WikiSummary | null>(null);

  useEffect(() => {
    setData(null);
    const title = getWikiTitle(provinceId, lang);
    if (!title) return;

    // Try current language, fall back to English
    const langs = lang === 'en' ? ['en'] : [lang, 'en'];

    let cancelled = false;

    async function fetchSummary() {
      for (const l of langs) {
        try {
          const r = await fetch(
            `https://${l}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              getWikiTitle(provinceId, l) ?? title!
            )}`
          );
          if (!r.ok) continue;
          const d = await r.json();
          if (cancelled) return;
          if (d.extract && d.extract.length > 30) {
            setData({
              extract: d.extract,
              image: d.thumbnail?.source,
              pageUrl: d.content_urls?.desktop?.page ?? '',
            });
            return;
          }
        } catch {
          // continue
        }
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [provinceId, lang]);

  return data;
}
