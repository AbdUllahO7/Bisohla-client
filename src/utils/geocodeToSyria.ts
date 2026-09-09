/**
 * Maps the free-text governorate/city strings returned by the backend
 * reverse-geocode endpoint (Google's administrative_area_level_1 / locality,
 * in either locale) onto the canonical Syria enum values used by the listing
 * pickers.
 *
 * Ported from the mobile app's geocodeToSyria.ts — keeping the matching logic
 * single-sourced and consistent between web and mobile.
 *
 * Best-effort: an unmatched value returns null, so the picker leaves that
 * field empty for the user to set manually rather than guessing wrong.
 */

import {
  SyriaGovernorate,
  SyriaCity,
  SyriaGovernorate_ARABIC_NAMES,
  SyriaCity_ARABIC_NAMES,
  SyriaGovernorate_TO_CITIES,
  normalizeGovernorate,
  normalizeCity,
} from '@/core/entities/enums/syria.enums';

// Suffixes Google appends that we strip before comparing (both locales).
const NOISE = /\b(governorate|province|district|subdistrict|region|city|rural)\b/gi;
const AR_NOISE = /(محافظة|منطقة|ناحية|مدينة|ريف)/g;

/**
 * Normalises a place string for comparison: lowercases, strips Arabic
 * diacritics + tatweel, unifies Arabic letter variants (alif/ya/ta-marbuta),
 * removes administrative noise words, and collapses non-alphanumeric separators
 * so "Al-Hasakah", "al hasakah" and "الحسكة" compare cleanly — and so Google's
 * "محافظة ادلب" (bare alif) matches the enum's "إدلب" (hamza alif).
 */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(AR_NOISE, ' ')
    .replace(NOISE, ' ')
    .replace(/[ً-ٟـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[أإآٱ]/g, 'ا') // unify alif variants → bare alif
    .replace(/ى/g, 'ي') // alif maqsura → ya
    .replace(/ة/g, 'ه') // ta marbuta → ha
    .replace(/ؤ/g, 'و') // hamza-on-waw → waw
    .replace(/ئ/g, 'ي') // hamza-on-ya → ya
    .replace(/[^a-z0-9؀-ۿ]+/g, '') // keep latin + arabic letters only
    .trim();
}

/** Returns the matching enum value from `candidates`, or null. */
function matchAgainst(
  raw: string | null | undefined,
  candidates: Array<{ value: string; aliases: string[] }>,
): string | null {
  if (!raw) return null;
  const target = normalise(raw);
  if (!target) return null;

  // Exact normalised match first.
  for (const c of candidates) {
    if (c.aliases.some((a) => a === target)) return c.value;
  }
  // Then containment either direction (handles "rif dimashq" ⊃ "dimashq" etc.).
  for (const c of candidates) {
    if (c.aliases.some((a) => a.length >= 3 && (target.includes(a) || a.includes(target)))) {
      return c.value;
    }
  }
  return null;
}

function governorateCandidates(): Array<{ value: string; aliases: string[] }> {
  return Object.values(SyriaGovernorate).map((gov) => ({
    value: gov,
    aliases: [normalise(gov), normalise(SyriaGovernorate_ARABIC_NAMES[gov] ?? '')].filter(Boolean),
  }));
}

function cityCandidates(cities: SyriaCity[]): Array<{ value: string; aliases: string[] }> {
  return cities.map((city) => ({
    value: city,
    aliases: [normalise(city), normalise(SyriaCity_ARABIC_NAMES[city] ?? '')].filter(Boolean),
  }));
}

/** Match a free-text governorate to a SyriaGovernorate value (or null). */
export function matchGovernorate(raw: string | null | undefined): SyriaGovernorate | null {
  return matchAgainst(raw, governorateCandidates()) as SyriaGovernorate | null;
}

/**
 * Match a free-text city to a SyriaCity value. Scoped to the resolved
 * governorate's cities first (disambiguates names shared across governorates),
 * then falls back to every city.
 */
export function matchCity(
  raw: string | null | undefined,
  governorate: SyriaGovernorate | null,
): SyriaCity | null {
  if (!raw) return null;
  const scoped = governorate ? (SyriaGovernorate_TO_CITIES[governorate] ?? []) : [];
  if (scoped.length > 0) {
    const inScope = matchAgainst(raw, cityCandidates(scoped));
    if (inScope) return inScope as SyriaCity;
  }
  const allCities = (Object.values(SyriaGovernorate_TO_CITIES) as SyriaCity[][]).flat();
  return matchAgainst(raw, cityCandidates(allCities)) as SyriaCity | null;
}

/**
 * Haversine distance in kilometres between two lat/lng points.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Approximate centre coordinates for each Syria city.
 * Used as a fallback when the geocoded city string doesn't match any enum value
 * — we find the nearest city by straight-line distance so the field is never
 * left blank.
 */
const CITY_COORDS: Partial<Record<SyriaCity, [number, number]>> = {
  [SyriaCity.DAMASCUS]: [33.5138, 36.2765],
  [SyriaCity.DOUMA]: [33.5706, 36.4044],
  [SyriaCity.HARASTA]: [33.5631, 36.3781],
  [SyriaCity.DARAYYA]: [33.4557, 36.2377],
  [SyriaCity.KAFR_SOUSA]: [33.4886, 36.2667],
  [SyriaCity.JARAMANA]: [33.4922, 36.3425],
  [SyriaCity.MEZZEH]: [33.5018, 36.2547],
  [SyriaCity.ALEPPO]: [36.2021, 37.1343],
  [SyriaCity.MANBIJ]: [36.5167, 37.9456],
  [SyriaCity.AL_BAB]: [36.3683, 37.5197],
  [SyriaCity.AZAZ]: [36.5892, 37.0519],
  [SyriaCity.AFRIN]: [36.5117, 36.8686],
  [SyriaCity.JARABLUS]: [36.8181, 38.0125],
  [SyriaCity.KOBANI]: [36.8917, 38.3536],
  [SyriaCity.HOMS]: [34.7324, 36.7137],
  [SyriaCity.PALMYRA]: [34.5519, 38.2666],
  [SyriaCity.AL_RASTAN]: [34.9267, 36.7328],
  [SyriaCity.TALKALAKH]: [34.6989, 36.2589],
  [SyriaCity.AL_QUSAYR]: [34.5092, 36.5808],
  [SyriaCity.HAMA]: [35.1317, 36.7512],
  [SyriaCity.SALAMIYAH]: [35.0103, 37.0528],
  [SyriaCity.MASYAF]: [35.0653, 36.3411],
  [SyriaCity.MUHARDA]: [35.2514, 36.5742],
  [SyriaCity.LATAKIA]: [35.5317, 35.7908],
  [SyriaCity.JABLEH]: [35.3614, 35.9261],
  [SyriaCity.QARDAHA]: [35.4578, 36.0592],
  [SyriaCity.AL_HAFFA]: [35.6014, 36.0506],
  [SyriaCity.KASAB]: [35.9286, 35.9903],
  [SyriaCity.IDLIB]: [35.9306, 36.6339],
  [SyriaCity.MAARRAT_AL_NUMAN]: [35.6492, 36.6744],
  [SyriaCity.ARIHA]: [35.7997, 36.5936],
  [SyriaCity.JISR_AL_SHUGHUR]: [35.8194, 36.3178],
  [SyriaCity.SARAQEB]: [35.8639, 36.7539],
  [SyriaCity.KHAN_SHAYKHUN]: [35.4378, 36.6528],
  [SyriaCity.KAFRANBEL]: [35.6139, 36.5836],
  [SyriaCity.BINNISH]: [35.9556, 36.7111],
  [SyriaCity.SALQIN]: [36.1378, 36.4528],
  [SyriaCity.HAREM]: [36.2044, 36.5178],
  [SyriaCity.DARKUSH]: [35.9878, 36.3986],
  [SyriaCity.SARMADA]: [36.1839, 36.7278],
  [SyriaCity.AL_DANA]: [36.2167, 36.7667],
  [SyriaCity.MAARAT_MISRIN]: [36.0125, 36.6719],
  [SyriaCity.AL_HASAKAH]: [36.5011, 40.7503],
  [SyriaCity.QAMISHLI]: [37.0494, 41.2272],
  [SyriaCity.AMUDA]: [37.0806, 40.9236],
  [SyriaCity.DEIR_EZ_ZOR]: [35.3357, 40.1408],
  [SyriaCity.AL_MAYADIN]: [35.0175, 40.4553],
  [SyriaCity.AL_BUKAMAL]: [34.4539, 40.9189],
  [SyriaCity.TARTUS]: [34.8922, 35.8861],
  [SyriaCity.BANIYAS]: [35.1761, 35.9417],
  [SyriaCity.SAFITA]: [34.8219, 36.1189],
  [SyriaCity.DURAYKISH]: [34.8967, 36.1389],
  [SyriaCity.RAQQA]: [35.9533, 39.0169],
  [SyriaCity.AL_THAWRAH]: [35.8361, 38.5469],
  [SyriaCity.TELL_ABYAD]: [36.6969, 38.9556],
  [SyriaCity.DARAA]: [32.6189, 36.1021],
  [SyriaCity.NAWA]: [32.8853, 36.0469],
  [SyriaCity.IZRA]: [32.8719, 36.2489],
  [SyriaCity.AL_SANAMAYN]: [33.0722, 36.1819],
  [SyriaCity.AS_SUWAYDA]: [32.7086, 36.5661],
  [SyriaCity.SALKHAD]: [32.4886, 36.7092],
  [SyriaCity.SHAHBA]: [32.8556, 36.6289],
  [SyriaCity.QUNEITRA]: [33.1261, 35.8239],
  [SyriaCity.AL_TALL]: [33.6108, 36.3092],
  [SyriaCity.YABROUD]: [33.9711, 36.6586],
  [SyriaCity.QATANA]: [33.4367, 36.0803],
  [SyriaCity.ZABADANI]: [33.7239, 36.1003],
  [SyriaCity.AN_NABK]: [34.0253, 36.7264],
  };

/**
 * Returns the nearest city (within the given governorate) to the given
 * coordinates. Falls back to the first city in the governorate's list if no
 * coordinates are known.
 */
export function getNearestSyriaCity(
  lat: number,
  lng: number,
  governorate: SyriaGovernorate,
): SyriaCity | null {
  const cities = SyriaGovernorate_TO_CITIES[governorate];
  if (!cities || cities.length === 0) return null;

  let best: SyriaCity | null = null;
  let bestDist = Infinity;

  for (const city of cities) {
    const coords = CITY_COORDS[city];
    if (!coords) continue;
    const dist = haversineKm(lat, lng, coords[0], coords[1]);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }

  // If we have no coords for any city in the list, just return the first one.
  return best ?? cities[0];
}

const GOVERNORATE_CENTRES: Record<SyriaGovernorate, [number, number]> = {
  [SyriaGovernorate.DAMASCUS]: [33.5138, 36.2765],
  [SyriaGovernorate.DAMASCUS_COUNTRYSIDE]: [33.5631, 36.3781],
  [SyriaGovernorate.ALEPPO]: [36.2021, 37.1343],
  [SyriaGovernorate.HOMS]: [34.7324, 36.7137],
  [SyriaGovernorate.HAMA]: [35.1317, 36.7512],
  [SyriaGovernorate.LATAKIA]: [35.5317, 35.7908],
  [SyriaGovernorate.IDLIB]: [35.9306, 36.6339],
  [SyriaGovernorate.TARTUS]: [34.8922, 35.8861],
  [SyriaGovernorate.RAQQA]: [35.9533, 39.0169],
  [SyriaGovernorate.DEIR_EZ_ZOR]: [35.3357, 40.1408],
  [SyriaGovernorate.AL_HASAKAH]: [36.5011, 40.7503],
  [SyriaGovernorate.DARAA]: [32.6189, 36.1021],
  [SyriaGovernorate.AS_SUWAYDA]: [32.7086, 36.5661],
  [SyriaGovernorate.QUNEITRA]: [33.1261, 35.8239],
};

/**
 * Returns the nearest Syria governorate based on coordinate distance.
 */
export function getNearestSyriaGovernorate(lat: number, lng: number): SyriaGovernorate {
  let best: SyriaGovernorate = SyriaGovernorate.DAMASCUS;
  let bestDist = Infinity;

  for (const [gov, coords] of Object.entries(GOVERNORATE_CENTRES) as [SyriaGovernorate, [number, number]][]) {
    const dist = haversineKm(lat, lng, coords[0], coords[1]);
    if (dist < bestDist) {
      bestDist = dist;
      best = gov;
    }
  }

  return best;
}

/**
 * Master city resolver for Syrian governorates:
 * 1. Direct valid enum check within the governorate
 * 2. normalizeCity (arabic / latin normalization)
 * 3. matchCity (free-text fuzzy matching)
 * 4. Coordinate-based nearest-city lookup
 * 5. Default fallback to the governorate's primary city
 */
export function resolveCityValue(
  raw: any,
  gov: string | null | undefined,
  lat?: number | null,
  lng?: number | null,
): string {
  if (!gov) return '';
  const govEnum = (normalizeGovernorate(gov) || matchGovernorate(gov) || gov) as SyriaGovernorate;
  if (!govEnum) return '';
  const validCities = SyriaGovernorate_TO_CITIES[govEnum] || [];
  const validCityStrings = validCities as string[];

  // 1. Direct valid enum value check
  if (raw && validCityStrings.includes(String(raw))) {
    return String(raw);
  }

  // 2. normalizeCity check (only accept if result is a valid city for this governorate)
  const fromNormalize = normalizeCity(raw, govEnum);
  if (fromNormalize && validCityStrings.includes(fromNormalize)) {
    return fromNormalize;
  }

  // 3. matchCity check (free-text Arabic & English alias matching)
  const fromMatch = matchCity(typeof raw === 'string' ? raw : String(raw || ''), govEnum);
  if (fromMatch && validCityStrings.includes(fromMatch)) {
    return fromMatch;
  }

  // 4. Nearest city by coordinates if lat/lng available
  const numLat = lat != null && !isNaN(Number(lat)) ? Number(lat) : null;
  const numLng = lng != null && !isNaN(Number(lng)) ? Number(lng) : null;
  if (numLat != null && numLng != null) {
    const nearest = getNearestSyriaCity(numLat, numLng, govEnum);
    if (nearest && validCityStrings.includes(nearest)) {
      return nearest;
    }
  }

  // 5. Final fallback to the governorate's capital / primary city so city is NEVER blank when governorate is selected
  if (validCities.length > 0) {
    return validCities[0];
  }

  return '';
}


