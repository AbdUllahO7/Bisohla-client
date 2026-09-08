export const COOKIE_CONSENT_NAME = 'bishola_consent';

export interface CookieConsentCategories {
  necessary: number;
  preferences: number;
  analytics: number;
  marketing: number;
}

export interface CookieConsentPayload {
  v: number;
  id: string;
  ts: number;
  pol: number; // cookie-policy version
  cat: CookieConsentCategories;
}

export const DEFAULT_CONSENT_CATEGORIES: CookieConsentCategories = {
  necessary: 1,
  preferences: 0,
  analytics: 0,
  marketing: 0,
};

export const ALL_ACCEPTED_CATEGORIES: CookieConsentCategories = {
  necessary: 1,
  preferences: 1,
  analytics: 1,
  marketing: 1,
};

function base64UrlEncode(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(base64)));
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function parseConsentCookie(cookieValue: string | undefined): CookieConsentPayload | null {
  if (!cookieValue) return null;
  try {
    const jsonStr = base64UrlDecode(cookieValue);
    const parsed = JSON.parse(jsonStr) as CookieConsentPayload;
    if (parsed && typeof parsed.v === 'number' && parsed.cat) {
      return parsed;
    }
  } catch {
    // If decoding or JSON parsing fails, treat as null
  }
  return null;
}

export function getClientConsentCookie(): CookieConsentPayload | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_CONSENT_NAME}=([^;]*)`));
  if (!match) return null;
  return parseConsentCookie(match[2]);
}

export function setClientConsentCookie(payload: CookieConsentPayload): void {
  if (typeof document === 'undefined') return;
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${COOKIE_CONSENT_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

export function generateConsentPayload(
  categories: CookieConsentCategories,
  policyVersion = 1,
  existingId?: string,
): CookieConsentPayload {
  const id =
    existingId ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15));

  return {
    v: 1,
    id,
    ts: Math.floor(Date.now() / 1000),
    pol: policyVersion,
    cat: {
      necessary: 1,
      preferences: categories.preferences ? 1 : 0,
      analytics: categories.analytics ? 1 : 0,
      marketing: categories.marketing ? 1 : 0,
    },
  };
}
