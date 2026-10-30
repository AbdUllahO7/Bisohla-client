/**
 * Utility to parse notification deeplinks.
 * Handles both absolute URLs and relative paths, stripping the language segment
 * so Next-Intl router can preserve the user's current UI locale.
 */
export function parseNotificationDeeplink(deeplink: unknown): {
  isInternal: boolean;
  internalPath: string;
  fullUrl: string;
} | null {
  if (!deeplink || typeof deeplink !== 'string') return null;
  const trimmed = deeplink.trim();
  if (!trimmed) return null;

  try {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://bishola.com';
    const parsed = new URL(trimmed, origin);

    const isCurrentHost =
      typeof window !== 'undefined'
        ? parsed.origin === window.location.origin ||
          parsed.hostname === window.location.hostname ||
          parsed.hostname.endsWith('bishola.com')
        : parsed.hostname.endsWith('bishola.com') ||
          parsed.hostname === 'localhost';

    if (isCurrentHost) {
      // Strip leading locale (/en or /ar) so next-intl router can apply current UI locale
      const strippedPath =
        parsed.pathname.replace(/^\/(?:en|ar)(?=\/|$)/, '') || '/';
      const internalPath = strippedPath + parsed.search + parsed.hash;

      return {
        isInternal: true,
        internalPath,
        fullUrl: parsed.href,
      };
    }

    return {
      isInternal: false,
      internalPath: '',
      fullUrl: parsed.href,
    };
  } catch {
    return null;
  }
}

