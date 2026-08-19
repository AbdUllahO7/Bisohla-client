'use client';

const TOUR_STORAGE_PREFIX = '@bishola/tour_seen_';

export type TourEffectiveVersion = number | string;

const getSeenKey = (tourKey: string, version: TourEffectiveVersion = '1.0'): string => {
  return `${TOUR_STORAGE_PREFIX}${tourKey}_v${version}`;
};

export const hasSeenTour = (tourKey: string, version: TourEffectiveVersion = '1.0'): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(getSeenKey(tourKey, version)) === 'true';
  } catch {
    return false;
  }
};

export const markTourSeen = (tourKey: string, version: TourEffectiveVersion = '1.0'): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getSeenKey(tourKey, version), 'true');
  } catch {
    // Non-critical
  }
};

export const resetTour = (tourKey: string, version: TourEffectiveVersion = '1.0'): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getSeenKey(tourKey, version));
  } catch {
    // Non-critical
  }
};

export const resetAllTours = (): void => {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(TOUR_STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Non-critical
  }
};
