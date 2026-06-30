/**
 * Generates public/data/provinces-geo.geojson by dissolving district polygons
 * into province-level polygons using polygon-clipping.
 * Run: node scripts/generateProvinceGeo.cjs
 */
const fs = require('fs');
const pc = require('polygon-clipping');

const geo = JSON.parse(fs.readFileSync('public/data/districts.geojson', 'utf-8'));

// Group features by provinceId
const byProvince = {};
geo.features.forEach(f => {
  const { provinceId } = f.properties;
  if (!byProvince[provinceId]) byProvince[provinceId] = [];
  byProvince[provinceId].push(f);
});

// Convert each feature's geometry to MultiPolygon format expected by polygon-clipping
function toMultiPoly(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return null;
}

const provinceFeatures = [];

for (const [provinceId, features] of Object.entries(byProvince)) {
  const polys = features.map(f => toMultiPoly(f.geometry)).filter(Boolean);
  if (polys.length === 0) continue;

  let unionResult;
  try {
    unionResult = pc.union(...polys);
  } catch (e) {
    console.warn(`Union failed for ${provinceId}, falling back to first polygon:`, e.message);
    unionResult = polys[0];
  }

  const geometry = unionResult.length === 1
    ? { type: 'Polygon', coordinates: unionResult[0] }
    : { type: 'MultiPolygon', coordinates: unionResult };

  provinceFeatures.push({
    type: 'Feature',
    properties: { id: provinceId, provinceId },
    geometry,
  });

  console.log(`✓ ${provinceId}: ${features.length} districts → ${unionResult.length} polygon(s)`);
}

const result = {
  type: 'FeatureCollection',
  features: provinceFeatures,
};

fs.writeFileSync('public/data/provinces-geo.geojson', JSON.stringify(result));
console.log(`\nSaved ${provinceFeatures.length} province polygons to public/data/provinces-geo.geojson`);
