/**
 * Persistent state and eligibility engine for the "Rate Bishola" module.
 * Mirrors bishola-app-v2 ratingStorage.ts for web clients (using localStorage).
 */

const STORAGE_KEY = 'bishola-ratings';
const DAY_MS = 86_400_000;

export type RatePromptAction = 'publish' | 'contact' | 'favorite' | 'manual';

export interface RatingPromptSettings {
  enabled?: boolean;
  min_app_opens?: number;
  min_days_since_install?: number;
  cooldown_days?: number;
  max_prompts?: number;
  nth_favorite?: number;
  after_publish?: boolean;
  after_contact?: boolean;
  after_favorite?: boolean;
}

export interface RatingState {
  firstSeenAt: number;
  appOpenCount: number;
  favoriteCount: number;
  lastPromptedAt: number;
  promptCount: number;
  hasRated: boolean;
  dismissedAt: number;
  ratingValue?: number;
}

const DEFAULT_STATE: RatingState = {
  firstSeenAt: 0,
  appOpenCount: 0,
  favoriteCount: 0,
  lastPromptedAt: 0,
  promptCount: 0,
  hasRated: false,
  dismissedAt: 0,
};

export const getRatingState = (): RatingState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
};

const saveRatingState = (state: RatingState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-critical persistence
  }
};

/** Stamp first-launch time once, then bump the app-open counter. */
export const recordAppOpen = (now = Date.now()): void => {
  const current = getRatingState();
  const firstSeenAt = current.firstSeenAt === 0 ? now : current.firstSeenAt;
  saveRatingState({
    ...current,
    firstSeenAt,
    appOpenCount: current.appOpenCount + 1,
  });
};

/** Bump the lifetime favorite counter and return the new value. */
export const incrementFavoriteCount = (): number => {
  const current = getRatingState();
  const next = current.favoriteCount + 1;
  saveRatingState({
    ...current,
    favoriteCount: next,
  });
  return next;
};

/** Record that the prompt was shown (resets cooldown, advances prompt cap). */
export const recordPromptShown = (now = Date.now()): void => {
  const current = getRatingState();
  saveRatingState({
    ...current,
    lastPromptedAt: now,
    promptCount: current.promptCount + 1,
  });
};

/** Mark user as having rated (suppresses all future automatic prompts). */
export const recordRated = (ratingValue?: number): void => {
  const current = getRatingState();
  saveRatingState({
    ...current,
    hasRated: true,
    ratingValue: ratingValue ?? current.ratingValue,
  });
};

/** Record a "Not now" dismissal. */
export const recordDismissed = (now = Date.now()): void => {
  const current = getRatingState();
  saveRatingState({
    ...current,
    dismissedAt: now,
  });
};

/**
 * Pure eligibility check for action-triggered prompts.
 */
export const isEligible = (
  action: RatePromptAction,
  settings: RatingPromptSettings | null = null,
  now = Date.now(),
): boolean => {
  if (action === 'manual') return true;
  if (settings && settings.enabled === false) return false;

  const state = getRatingState();
  if (state.hasRated) return false;

  const actionEnabled =
    action === 'publish'
      ? settings?.after_publish !== false
      : action === 'contact'
      ? settings?.after_contact !== false
      : settings?.after_favorite !== false;
  if (!actionEnabled) return false;

  const minAppOpens = settings?.min_app_opens ?? 2;
  if (state.appOpenCount < minAppOpens) return false;

  if (state.firstSeenAt === 0) return false;
  const minDays = settings?.min_days_since_install ?? 0;
  if (now - state.firstSeenAt < minDays * DAY_MS) return false;

  const cooldownDays = settings?.cooldown_days ?? 3;
  if (state.lastPromptedAt > 0 && now - state.lastPromptedAt < cooldownDays * DAY_MS) {
    return false;
  }

  const maxPrompts = settings?.max_prompts ?? 3;
  if (maxPrompts > 0 && state.promptCount >= maxPrompts) return false;

  if (action === 'favorite') {
    const nth = settings?.nth_favorite ?? 3;
    if (nth <= 0) return false;
    if (state.favoriteCount === 0 || state.favoriteCount % nth !== 0) return false;
  }

  return true;
};
