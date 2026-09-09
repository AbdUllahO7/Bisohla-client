import {
  matchGovernorate,
  matchCity,
  getNearestSyriaCity,
  getNearestSyriaGovernorate,
  resolveCityValue,
} from './geocodeToSyria';
import {
  SyriaGovernorate,
  SyriaCity,
  normalizeGovernorate,
} from '@/core/entities/enums/syria.enums';
import { BACKEND_URL } from '@/core/lib/web/constants';

export interface ReverseGeocodeResult {
  governorate: SyriaGovernorate | null;
  city: SyriaCity | null;
  /** Raw street-level address string from Google, or null. */
  address: string | null;
}

/**
 * Calls the backend /geo/reverse-geocode and returns matched Syria enum values.
 * - governorate: matched to SyriaGovernorate enum (with nearest coordinate fallback)
 * - city: matched to SyriaCity enum (with nearest coordinate fallback within governorate)
 * - address: raw address string from Google (or null)
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  locale: 'ar' | 'en' = 'ar',
): Promise<ReverseGeocodeResult> {
  let rawGovernorate: string | null = null;
  let rawCity: string | null = null;
  let rawAddress: string | null = null;

  try {
    const res = await fetch(`${BACKEND_URL}/geo/reverse-geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lng, locale }),
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      const payload = json?.data ?? json;
      rawGovernorate = payload?.governorate ?? null;
      rawCity = payload?.city ?? null;
      rawAddress = payload?.address ?? payload?.formattedAddress ?? null;
    }
  } catch (err) {
    console.warn('Backend reverse-geocode fetch failed, falling back to coordinate resolver:', err);
  }

  // 1. Resolve governorate from backend response or coordinate distance
  let governorate = (matchGovernorate(rawGovernorate) || normalizeGovernorate(rawGovernorate)) as SyriaGovernorate | null;
  if (!governorate && lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    governorate = getNearestSyriaGovernorate(lat, lng);
  }

  // 2. Resolve city from backend response or coordinate distance within governorate
  let city = (resolveCityValue(rawCity, governorate || '', lat, lng) || null) as SyriaCity | null;
  if (!city && governorate && lat != null && lng != null) {
    city = getNearestSyriaCity(lat, lng, governorate);
  }

  return { governorate, city, address: rawAddress };
}
