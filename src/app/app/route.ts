import { NextRequest, NextResponse } from 'next/server';

import { getPublicSettings } from '@/core/infrastructure-adapters/actions/settings/settings.actions';

/**
 * `GET /app` — the single shareable download link.
 *
 * Routes the visitor to the correct store and, on mobile, opens the NATIVE
 * store app (App Store / Google Play app) rather than the in-browser store
 * page. Desktop / unknown devices fall back to the public Links page.
 *
 * Store URLs are read from backend settings (`app_settings.app_info`, served at
 * `/settings/public`) so an admin can change them without a release; the
 * constants below are only used if settings are unreachable.
 */

const FALLBACK_APP_STORE_URL =
  'https://apps.apple.com/tr/app/bishola/id6751427088';
const FALLBACK_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.bishola.app&hl=en';
const FALLBACK_IOS_APP_ID = '6751427088';
const FALLBACK_ANDROID_PACKAGE = 'com.bishola.app';

interface AppInfo {
  app_store_url?: string;
  play_store_url?: string;
  bundle_id?: string;
}

const readAppInfo = async (): Promise<AppInfo> => {
  try {
    const res = await getPublicSettings();
    const byLocale = (res as { data?: Record<string, any> })?.data;
    const appInfo =
      byLocale?.ar?.app_settings?.app_info ||
      byLocale?.en?.app_settings?.app_info;
    return (appInfo as AppInfo) || {};
  } catch {
    return {};
  }
};

const parseIosAppId = (appStoreUrl: string): string => {
  const match = appStoreUrl.match(/id(\d+)/);
  return match?.[1] ?? FALLBACK_IOS_APP_ID;
};

/**
 * Minimal HTML that jumps to the native store app immediately and, if that
 * scheme can't be handled (store app disabled / removed), falls back to the
 * https store URL after a short delay.
 */
const nativeRedirectHtml = (nativeUrl: string, webFallbackUrl: string): string => {
  const native = JSON.stringify(nativeUrl);
  const web = JSON.stringify(webFallbackUrl);
  return `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>Bishola</title></head><body>` +
    `<script>(function(){var n=${native},w=${web};` +
    `window.location.replace(n);` +
    `setTimeout(function(){window.location.replace(w);},1200);})();</script>` +
    `<noscript><a href=${web}>Continue to the store</a></noscript>` +
    `</body></html>`;
};

const htmlResponse = (body: string): Response =>
  new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

export async function GET(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  const appInfo = await readAppInfo();

  if (isIOS) {
    const appStoreUrl = appInfo.app_store_url || FALLBACK_APP_STORE_URL;
    const iosAppId = parseIosAppId(appStoreUrl);
    const nativeUrl = `itms-apps://apps.apple.com/app/id${iosAppId}`;
    return htmlResponse(nativeRedirectHtml(nativeUrl, appStoreUrl));
  }

  if (isAndroid) {
    const playStoreUrl = appInfo.play_store_url || FALLBACK_PLAY_STORE_URL;
    const androidPackage = appInfo.bundle_id || FALLBACK_ANDROID_PACKAGE;
    const nativeUrl = `market://details?id=${androidPackage}`;
    return htmlResponse(nativeRedirectHtml(nativeUrl, playStoreUrl));
  }

  // Desktop / other / bots → the existing public Links page.
  const acceptLanguage = req.headers.get('accept-language') || '';
  const locale = acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'ar';
  // Honor the public host when behind a proxy (Cloudflare / ngrok) so the
  // redirect targets the external origin, not the internal localhost.
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : req.nextUrl.origin;
  return NextResponse.redirect(new URL(`/${locale}/Links`, origin));
}
