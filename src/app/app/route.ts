import { NextRequest, NextResponse } from 'next/server';

import { getPublicSettings } from '@/core/infrastructure-adapters/actions/settings/settings.actions';

/**
 * `GET /app` — the single shareable download & landing link.
 *
 * Provides full Open Graph & Twitter Card SEO metadata for social media
 * crawlers (Facebook, WhatsApp, Telegram, Twitter, LinkedIn, Applebot, etc.)
 * so link previews unfurl correctly with title, description, and image instead of 404.
 *
 * For human visitors:
 * - Mobile iOS / Android: opens native store app with fallback to web store URL.
 * - Desktop: redirects to localized links page (`/${locale}/Links`).
 */

const FALLBACK_APP_STORE_URL =
  'https://apps.apple.com/tr/app/bishola/id6751427088';
const FALLBACK_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.bishola.app&hl=en';
const FALLBACK_IOS_APP_ID = '6751427088';
const FALLBACK_ANDROID_PACKAGE = 'com.bishola.app';

const BOT_UA_PATTERN =
  /bot|facebookexternalhit|whatsapp|telegram|twitter|slack|discord|linkedin|applebot|bingbot|google|crawler|spider|skype|embedly|quora|outbrain|pinterest|vkShare/i;

const isBotUserAgent = (ua: string): boolean => BOT_UA_PATTERN.test(ua);

interface AppInfo {
  app_store_url?: string;
  play_store_url?: string;
  bundle_id?: string;
}

interface PageMeta {
  siteName: string;
  title: string;
  description: string;
  ogImage: string;
}

const DEFAULT_META: Record<'ar' | 'en', PageMeta> = {
  ar: {
    siteName: 'بسهولة',
    title: 'تطبيقات بسهولة | حمل تطبيق Bishola',
    description:
      'حمل تطبيق بسهولة للآيفون والأندرويد لاستئجار وشراء السيارات بكل سهولة ورسائل مباشرة وخيارات متنوعة.',
    ogImage: '/assets/images/logo/bisholaLogo2.jpg',
  },
  en: {
    siteName: 'Bishola',
    title: 'Bishola App | Download Bishola Mobile Application',
    description:
      'Download Bishola app for iOS and Android to rent or buy your perfect car with ease.',
    ogImage: '/assets/images/logo/bisholaLogo2.jpg',
  },
};

const readSettingsAndMeta = async (locale: 'ar' | 'en') => {
  try {
    const res = await getPublicSettings();
    const dataByLocale = (res as { data?: Record<string, any> })?.data;
    const currentData =
      dataByLocale?.[locale] || dataByLocale?.ar || dataByLocale?.en;

    const appInfo: AppInfo =
      dataByLocale?.ar?.app_settings?.app_info ||
      dataByLocale?.en?.app_settings?.app_info ||
      {};

    const siteName =
      currentData?.general?.site_info?.site_name ||
      DEFAULT_META[locale].siteName;
    const linksSeo = currentData?.seo_settings?.links_page || {};
    const globalSeo = currentData?.seo_settings?.global_seo || {};

    const title =
      linksSeo.og_title ||
      linksSeo.meta_title ||
      DEFAULT_META[locale].title;
    const description =
      linksSeo.og_description ||
      linksSeo.meta_description ||
      DEFAULT_META[locale].description;
    const ogImage =
      linksSeo.og_image ||
      globalSeo.default_og_image ||
      DEFAULT_META[locale].ogImage;

    return {
      appInfo,
      meta: {
        siteName,
        title,
        description,
        ogImage,
      },
    };
  } catch {
    return {
      appInfo: {},
      meta: DEFAULT_META[locale],
    };
  }
};

const parseIosAppId = (appStoreUrl: string): string => {
  const match = appStoreUrl.match(/id(\d+)/);
  return match?.[1] ?? FALLBACK_IOS_APP_ID;
};

const renderAppHtml = ({
  locale,
  meta,
  origin,
  canonicalUrl,
  iosAppId,
  androidPackage,
  redirectScript,
  webFallbackUrl,
}: {
  locale: 'ar' | 'en';
  meta: PageMeta;
  origin: string;
  canonicalUrl: string;
  iosAppId: string;
  androidPackage: string;
  redirectScript?: string;
  webFallbackUrl: string;
}): string => {
  const isRTL = locale === 'ar';

  let fullOgImageUrl = meta.ogImage;
  if (
    !fullOgImageUrl.startsWith('http://') &&
    !fullOgImageUrl.startsWith('https://')
  ) {
    fullOgImageUrl = `${origin}${fullOgImageUrl.startsWith('/') ? '' : '/'}${fullOgImageUrl}`;
  }

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeSiteName = escapeHtml(meta.siteName);
  const safeOgImage = escapeHtml(fullOgImageUrl);
  const safeCanonical = escapeHtml(canonicalUrl);

  return `<!doctype html>
<html lang="${locale}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle} | ${safeSiteName}</title>
  <meta name="description" content="${safeDesc}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeOgImage}">
  <meta property="og:image:secure_url" content="${safeOgImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:site_name" content="${safeSiteName}">
  <meta property="og:locale" content="${locale === 'ar' ? 'ar_SA' : 'en_US'}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeCanonical}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeOgImage}">

  <!-- Smart App Banners -->
  <meta name="apple-itunes-app" content="app-id=${iosAppId}">
  <meta name="google-play-app" content="app-id=${androidPackage}">

  <!-- Icons & Canonical -->
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/images/logo/bisholaLogo2.jpg">
  <link rel="canonical" href="${safeCanonical}">
  ${redirectScript ? `<script>${redirectScript}</script>` : ''}
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #2C3C39; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .container { max-width: 480px; width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .logo { width: 96px; height: 96px; border-radius: 50%; border: 3px solid #ABDE3B; margin: 0 auto 24px; object-fit: cover; }
    h1 { font-size: 24px; color: #ABDE3B; margin: 0 0 12px; }
    p { font-size: 16px; color: #d1d5db; margin: 0 0 32px; line-height: 1.5; }
    .btn { display: block; width: 100%; padding: 14px; margin-bottom: 12px; background: #198341; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 12px; transition: background 0.2s; box-sizing: border-box; }
    .btn:hover { background: #ABDE3B; color: #2C3C39; }
  </style>
</head>
<body>
  <div class="container">
    <img src="/assets/images/logo/bisholaLogo2.jpg" alt="${safeSiteName}" class="logo">
    <h1>${safeTitle}</h1>
    <p>${safeDesc}</p>
    <a href="${webFallbackUrl}" class="btn">${isRTL ? 'الانتقال إلى المتجر' : 'Continue to store'}</a>
  </div>
</body>
</html>`;
};

const htmlResponse = (body: string): Response =>
  new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });

export async function GET(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  const langParam =
    req.nextUrl.searchParams.get('lang') ||
    req.nextUrl.searchParams.get('locale');
  const acceptLanguage = req.headers.get('accept-language') || '';
  const locale: 'ar' | 'en' =
    langParam === 'en' ||
    (langParam !== 'ar' && acceptLanguage.toLowerCase().startsWith('en'))
      ? 'en'
      : 'ar';

  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : req.nextUrl.origin;
  const canonicalUrl = `${origin}/app`;

  const { appInfo, meta } = await readSettingsAndMeta(locale);

  const appStoreUrl = appInfo.app_store_url || FALLBACK_APP_STORE_URL;
  const playStoreUrl = appInfo.play_store_url || FALLBACK_PLAY_STORE_URL;
  const iosAppId = parseIosAppId(appStoreUrl);
  const androidPackage = appInfo.bundle_id || FALLBACK_ANDROID_PACKAGE;

  // 1. Social Media / Search Crawlers (Bots): return 200 HTML with rich OpenGraph tags
  if (isBotUserAgent(ua)) {
    return htmlResponse(
      renderAppHtml({
        locale,
        meta,
        origin,
        canonicalUrl,
        iosAppId,
        androidPackage,
        webFallbackUrl: `/${locale}/Links`,
      }),
    );
  }

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // 2. Mobile Human Users: return HTML with OpenGraph tags + auto-jump JS script
  if (isIOS) {
    const nativeUrl = `itms-apps://apps.apple.com/app/id${iosAppId}`;
    const redirectScript = `(function(){var n=${JSON.stringify(nativeUrl)},w=${JSON.stringify(appStoreUrl)};window.location.replace(n);setTimeout(function(){window.location.replace(w);},1200);})();`;
    return htmlResponse(
      renderAppHtml({
        locale,
        meta,
        origin,
        canonicalUrl,
        iosAppId,
        androidPackage,
        redirectScript,
        webFallbackUrl: appStoreUrl,
      }),
    );
  }

  if (isAndroid) {
    const nativeUrl = `market://details?id=${androidPackage}`;
    const redirectScript = `(function(){var n=${JSON.stringify(nativeUrl)},w=${JSON.stringify(playStoreUrl)};window.location.replace(n);setTimeout(function(){window.location.replace(w);},1200);})();`;
    return htmlResponse(
      renderAppHtml({
        locale,
        meta,
        origin,
        canonicalUrl,
        iosAppId,
        androidPackage,
        redirectScript,
        webFallbackUrl: playStoreUrl,
      }),
    );
  }

  // 3. Desktop Human Users: redirect to the public Links landing page
  return NextResponse.redirect(new URL(`/${locale}/Links`, origin));
}

