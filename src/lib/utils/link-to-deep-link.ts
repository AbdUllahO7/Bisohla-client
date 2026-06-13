export interface DeepLinkMappingResult {
  /** The mobile deep link */
  deepLink: string | null;
  /** Original web URL */
  webUrl: string;
  /** Whether mapping was successful */
  success: boolean;
  /** Extracted parameters */
  params?: Record<string, any>;
}

export interface DeepLinkMapperConfig {
  /** Mobile app scheme (e.g., 'bishola') */
  appScheme: string;
}

/**
 * Convert a web URL to a mobile deep link.
 *
 * This is a deliberate PASS-THROUGH: it strips the locale prefix and re-emits
 * the same path + query string under the app scheme — e.g.
 *   https://bishola.com/ar/products/product/123?foo=bar
 *     -> bishola://products/product/123?foo=bar
 *
 * It intentionally does NOT translate paths to specific screen names. The
 * bishola-app-v2 app owns all routing via its deep-link registry
 * (buildLinkingConfig + *.deepLinks.ts), so the same path the OS hands the app
 * via Universal/App Links also drives the custom-scheme links produced here.
 *
 * Why a custom scheme (bishola://) instead of just reusing the https URL: the
 * banner runs while the user is already in the browser on bishola.com, and that
 * is the one case where iOS/Android will NOT hand a same-domain, script-driven
 * navigation off to the app via Universal/App Links. The bishola:// scheme is
 * the only reliable in-browser -> app jump. The scheme is the only difference
 * from a plain https link; the path (and therefore the routing) is identical.
 */
export function mapWebUrlToDeepLink(
  webUrl: string,
  config: DeepLinkMapperConfig,
): DeepLinkMappingResult {
  try {
    const url = new URL(webUrl);

    // Strip the locale prefix (e.g. /en, /ar) and any leading slash so the
    // remainder lines up 1:1 with the app's registered deep-link patterns.
    const path = url.pathname
      .replace(/^\/(en|ar)(?=\/|$)/, '')
      .replace(/^\/+/, '');

    const deepLink = `${config.appScheme}://${path}${url.search}`;

    return {
      deepLink,
      webUrl,
      success: true,
    };
  } catch {
    // URL parsing failed — fall back to the app's home screen.
    return {
      deepLink: `${config.appScheme}://`,
      webUrl,
      success: false,
    };
  }
}
