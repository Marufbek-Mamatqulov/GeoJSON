'use strict';
// Downloads births, deaths, population data from SIAT and saves to public/data/demographics.json
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const OUT = path.join(__dirname, '..', 'public', 'data', 'demographics.json');
const GEO = path.join(__dirname, '..', 'public', 'data', 'districts.geojson');

// SIAT MHOBT 4-digit code → our province ID
const PROVINCE_MAP = {
  '1703': 'andijan',
  '1706': 'bukhara',
  '1708': 'jizzakh',
  '1710': 'kashkadarya',
  '1712': 'navoi',
  '1714': 'namangan',
  '1718': 'samarkand',
  '1722': 'surkhandarya',
  '1724': 'syrdarya',
  '1726': 'tashkent-city',   // 1726 = Toshkent shahri
  '1727': 'tashkent',        // 1727 = Toshkent viloyati
  '1730': 'fergana',
  '1733': 'khorezm',
  '1735': 'karakalpakstan',
};

const SUFFIX_RE = /\s+(district|tumani|тумани|tuman|shahri|шаҳри|шахри|city|viloyati|вилояти|region|republic|respublikasi|республикаси|г\.|gorod|okrugi|shahar)\s*\.?$/i;
const PREFIX_RE = /^(г\.|город\s+)/i;

// ── Network helpers ──────────────────────────────────────────────────────────

function getJson(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 StatBot/1.0' } }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirects > 0) {
        res.resume();
        return getJson(res.headers.location, redirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch (e) { reject(new Error(`JSON parse error from ${url}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60_000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ── Name extraction & cleaning ───────────────────────────────────────────────

function getKlass(row) {
  // SIAT format: separate Klassifikator_en, Klassifikator_ru, Klassifikator fields
  return row.Klassifikator_en || row.Klassifikator || row.Klassifikator_ru || row.Klassifikator_uzc || '';
}

function cleanName(raw) {
  return raw.replace(SUFFIX_RE, '').replace(PREFIX_RE, '').trim().toLowerCase();
}

// ── District index from our geojson ─────────────────────────────────────────

function buildDistrictIndex() {
  process.stdout.write('  Building district index from districts.geojson … ');
  const geo = JSON.parse(fs.readFileSync(GEO, 'utf8'));
  const idx = new Map(); // cleanedName → feature.properties.id
  for (const f of geo.features) {
    const { id, nameEn, nameRu, nameUz } = f.properties;
    [nameEn, nameRu, nameUz].filter(Boolean).forEach(n => {
      const key = cleanName(n);
      if (key && !idx.has(key)) idx.set(key, id);
    });
  }
  console.log(`${idx.size} names indexed`);
  return idx;
}

// ── Parse a SIAT JSON dataset ────────────────────────────────────────────────

function parseDataset(raw) {
  // Top-level is an Array of { metadata, data } — find the element with data
  const container = Array.isArray(raw)
    ? raw.find(item => Array.isArray(item.data))
    : raw;
  const rows = container?.data || raw.data || raw.Data || raw.items || [];
  const result = {};
  for (const row of rows) {
    const code = String(row.Code ?? row.code ?? '').trim();
    if (!code) continue;
    const name = getKlass(row);
    const years = {};
    for (const [k, v] of Object.entries(row)) {
      if (/^\d{4}$/.test(k)) {
        const n = parseFloat(v);
        if (Number.isFinite(n) && n >= 0) years[k] = n;
      }
    }
    if (Object.keys(years).length > 0) result[code] = { name, years };
  }
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━ Downloading SIAT demographics data ━━\n');

  let popDs, birthsDs, deathsDs;
  try {
    [popDs, birthsDs, deathsDs] = await Promise.all([
      getJson('https://api.siat.stat.uz/media/uploads/sdmx/sdmx_data_246.json').then(r => { console.log('  ✓ Population (sdmx_data_246)'); return r; }),
      getJson('https://api.siat.stat.uz/media/uploads/sdmx/sdmx_data_223.json').then(r => { console.log('  ✓ Births     (sdmx_data_223)'); return r; }),
      getJson('https://api.siat.stat.uz/media/uploads/sdmx/sdmx_data_226.json').then(r => { console.log('  ✓ Deaths     (sdmx_data_226)'); return r; }),
    ]);
  } catch (err) {
    console.error('\n✗ Download failed:', err.message);
    process.exit(1);
  }

  const pop    = parseDataset(popDs);
  const births = parseDataset(birthsDs);
  const deaths = parseDataset(deathsDs);

  // Collect all years present across every dataset
  const allYears = new Set();
  [pop, births, deaths].forEach(ds =>
    Object.values(ds).forEach(({ years }) => Object.keys(years).forEach(y => allYears.add(Number(y))))
  );
  const yearList = [...allYears].sort((a, b) => a - b);
  console.log(`\n  Years: ${yearList[0]}–${yearList[yearList.length - 1]}`);

  const distIdx = buildDistrictIndex();

  // ── Merge all codes into unified structure ──────────────────────────────
  const national  = {};
  const provinces = {};
  const districts = {};
  let distMatch = 0, distMiss = 0;

  const allCodes = new Set([...Object.keys(pop), ...Object.keys(births), ...Object.keys(deaths)]);

  for (const code of allCodes) {
    // Build per-year merged entry
    const yearData = {};
    for (const year of yearList) {
      const y = String(year);
      const entry = {};
      if (pop[code]?.years[y]    != null) entry.population = pop[code].years[y];
      if (births[code]?.years[y] != null) entry.births     = births[code].years[y];
      if (deaths[code]?.years[y] != null) entry.deaths     = deaths[code].years[y];
      if (Object.keys(entry).length > 0) yearData[y] = entry;
    }
    if (Object.keys(yearData).length === 0) continue;

    if (code === '1700') {
      Object.assign(national, yearData);
    } else if (code.length === 4 && PROVINCE_MAP[code]) {
      provinces[PROVINCE_MAP[code]] = yearData;
    } else if (code.length === 7) {
      // Try to match by name from any dataset that has a name
      const rawName = (pop[code] || births[code] || deaths[code])?.name || '';
      if (!rawName) { distMiss++; continue; }

      const cleaned = cleanName(rawName);
      let did = distIdx.get(cleaned);

      // Fallback: try stripping common alternate suffixes
      if (!did) {
        const alt = cleaned.replace(/\s*(tuman|shahar|shahr|г)$/, '').trim();
        did = distIdx.get(alt);
      }

      if (did) { districts[did] = yearData; distMatch++; }
      else       distMiss++;
    }
    // Skip 3-digit or other codes (city sub-districts, etc.)
  }

  console.log(`\n  Provinces mapped : ${Object.keys(provinces).length} / 14`);
  console.log(`  Districts matched: ${distMatch} (unmatched: ${distMiss})`);

  // ── Write output ────────────────────────────────────────────────────────
  const output = {
    meta: {
      lastUpdated: new Date().toISOString().split('T')[0],
      years: yearList,
      units: {
        population: 'ming kishi (thousand persons) — yil boshiga',
        births:     'kishi (persons) — yillik',
        deaths:     'kishi (persons) — yillik',
      },
      sources: {
        population: 'SIAT sdmx_data_246',
        births:     'SIAT sdmx_data_223',
        deaths:     'SIAT sdmx_data_226',
      },
    },
    national,
    provinces,
    districts,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✓ Saved → ${path.relative(process.cwd(), OUT)}\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
