import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getPublicSettings } from '@/core/infrastructure-adapters/actions/settings/settings.actions';
import {
  GeneralSettings,
  SEOSettings,
  AppSettings,
  PageSEOData,
} from '@/core/entities/models/settings/settings.dto';
import { APP_URL } from '@/core/lib/web/constants';

// Type for different page configurations
type WebPageType =
  | 'home'
  | 'products'
  | 'product_detail'
  | 'auth'
  | 'profile'
  | 'privacy_policy';

// Local types for extracted data
type GlobalSEOData = NonNullable<SEOSettings['global_seo']>;
type SiteInfoData = {
  site_name?: string;
  site_description?: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
};

interface SettingsMetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
  canonical?: string;
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
    httpEquiv?: string;
  }>;
}

// Default fallback values when settings are empty
const DEFAULT_FALLBACKS = {
  siteName: {
    en: 'Bishola',
    ar: 'بسهولة',
  },
  siteDescription: {
    en: 'Rent or buy your perfect car with Bishola. Premium car rental services and quality used cars for sale.',
    ar: 'استأجر أو اشتري سيارتك المثالية مع بسهولة. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع.',
  },
  baseUrl: APP_URL,
  logo: '/assets/images/logo/bishola.png',
  defaultOgImage: '/og-image.jpg',
  defaultTwitterImage: '/twitter-image.jpg',
  phone: '+90-538-9370863',
  email: 'support@bishola.com',
  twitterHandle: '@bishola',
  keywords: {
    en: [
      'car rental',
      'car sales',
      'rent a car',
      'buy cars',
      'vehicle rental',
      'auto sales',
      'cars for sale',
      'car marketplace',
      'bishola',
    ],
    ar: [
      'تأجير السيارات',
      'بيع السيارات',
      'استئجار سيارة',
      'شراء السيارات',
      'تأجير المركبات',
      'مبيعات السيارات',
      'سيارات للبيع',
      'سوق السيارات',
      'بسهولة',
    ],
  },
};

/**
 * Fetch settings data from the backend
 */
async function fetchSettingsData(locale: string) {
  try {
    const settingsResponse = await getPublicSettings();

    if (!settingsResponse.success || !settingsResponse.data) {
      console.warn('⚠️ Settings API returned no data, using fallbacks');
      return null;
    }
    return settingsResponse.data[locale] || null;
  } catch (error) {
    console.error('❌ Error fetching settings for metadata:', {
      error: error instanceof Error ? error.message : error,
      locale,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Get fallback value with locale support
 */
function getFallback(
  fallbackObj: { en: string; ar: string },
  locale: string,
): string {
  return fallbackObj[locale as 'en' | 'ar'] || fallbackObj.en;
}

/**
 * Extract SEO data from settings with fallbacks
 */
function extractSEOData(
  settings: any,
  pageType: WebPageType,
  locale: string,
): {
  general: GeneralSettings;
  seo: SEOSettings;
  app: AppSettings;
  pageSEO: PageSEOData;
  globalSEO: GlobalSEOData;
  siteInfo: SiteInfoData;
} {
  const general = settings?.general || {};
  const seoSettings = settings?.seo_settings || {};
  const appSettings = settings?.app_settings || {};

  // Map page types to SEO settings keys
  const seoPageMap: Record<WebPageType, string> = {
    home: 'home_page',
    products: 'products_page',
    product_detail: 'product_detail_page',
    auth: 'auth_pages',
    profile: 'user_profile_pages',
    privacy_policy: 'privacy_policy',
  };

  const seoPageKey = seoPageMap[pageType];
  const pageSEO = seoSettings[seoPageKey] || {};
  const globalSEO = seoSettings.global_seo || {};

  // Extract site info with fallbacks
  const siteInfo: SiteInfoData = {
    site_name:
      general.site_info?.site_name ||
      getFallback(DEFAULT_FALLBACKS.siteName, locale),
    site_description:
      general.site_info?.site_description ||
      getFallback(DEFAULT_FALLBACKS.siteDescription, locale),
    logo: general.appearance?.logo || DEFAULT_FALLBACKS.logo,
    favicon: general.appearance?.favicon || '/favicon.ico',
    primary_color: general.appearance?.primary_color || '#2C3C39',
    secondary_color: general.appearance?.secondary_color || '#10b981',
  };



  return {
    general,
    seo: seoSettings,
    app: appSettings,
    pageSEO,
    globalSEO,
    siteInfo,
  };
}

/**
 * Generate comprehensive metadata using settings
 */
export async function generateSettingsBasedMetadata(
  pageType: WebPageType = 'home',
  customConfig?: SettingsMetadataConfig,
): Promise<Metadata> {
  const locale = await getLocale();
  const settings = await fetchSettingsData(locale);

  const { general, seo, app, pageSEO, globalSEO, siteInfo } = extractSEOData(
    settings,
    pageType,
    locale,
  );

  // Build title with fallbacks
  const pageTitle =
    customConfig?.title || pageSEO.meta_title || siteInfo.site_name;

  const pageDescription =
    customConfig?.description ||
    pageSEO.meta_description ||
    siteInfo.site_description;

  const pageKeywords =
    customConfig?.keywords ||
    (pageSEO.meta_keywords
      ? pageSEO.meta_keywords.split(',').map((k) => k.trim())
      : null) ||
    DEFAULT_FALLBACKS.keywords[locale as 'en' | 'ar'];

  // Build canonical URL
  const baseUrl = globalSEO.canonical_base_url || DEFAULT_FALLBACKS.baseUrl;
  const canonical =
    customConfig?.canonical ||
    pageSEO.canonical_url ||
    `${baseUrl}/${locale}${
      pageType !== 'home' ? `/${pageType.replace('_', '-')}` : ''
    }`;

  // OG and Twitter images
  const ogImage =
    customConfig?.ogImage ||
    pageSEO.og_image ||
    globalSEO.default_og_image ||
    `${baseUrl}${DEFAULT_FALLBACKS.defaultOgImage}`;

  const twitterImage =
    customConfig?.twitterImage ||
    pageSEO.twitter_image ||
    globalSEO.default_twitter_image ||
    ogImage ||
    `${baseUrl}${DEFAULT_FALLBACKS.defaultTwitterImage}`;

  return {
    title: {
      template: `%s | ${siteInfo.site_name}`,
      default: pageTitle || 'page title',
    },
    description: pageDescription,
    keywords: pageKeywords,

    authors: [{ name: `${siteInfo.site_name} Team` }],
    creator: siteInfo.site_name,
    publisher: siteInfo.site_name,

    // Open Graph for social media sharing
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: canonical,
      title: pageSEO.og_title || pageTitle,
      description: pageSEO.og_description || pageDescription,
      siteName: siteInfo.site_name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageSEO.og_image_alt || pageTitle,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: (globalSEO.twitter_card_type as any) || 'summary_large_image',
      title: pageSEO.twitter_title || pageTitle,
      description: pageSEO.twitter_description || pageDescription,
      images: [twitterImage],
      creator: globalSEO.twitter_handle || DEFAULT_FALLBACKS.twitterHandle,
      site: globalSEO.twitter_handle || DEFAULT_FALLBACKS.twitterHandle,
    },

    // Additional metadata
    robots: {
      index: !customConfig?.noIndex,
      follow: !customConfig?.noIndex,
      googleBot: {
        index: !customConfig?.noIndex,
        follow: !customConfig?.noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Language alternates for SEO
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en${
          pageType !== 'home' ? `/${pageType.replace('_', '-')}` : ''
        }`,
        ar: `${baseUrl}/ar${
          pageType !== 'home' ? `/${pageType.replace('_', '-')}` : ''
        }`,
        'x-default': `${baseUrl}/en${
          pageType !== 'home' ? `/${pageType.replace('_', '-')}` : ''
        }`,
      },
    },

    // App-specific metadata
    applicationName: siteInfo.site_name,
    category: 'automotive',
    classification: 'Car Rental and Sales Platform',

    // Icons (favicon configuration)
    icons: {
      icon: [
        { url: siteInfo.favicon || '/favicon.ico' }, // Settings favicon first
        {
          url: '/icon-16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/icon-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/apple-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      shortcut: siteInfo.favicon || '/favicon.ico',
    },

    // Verification tags from settings
    verification: {
      google: globalSEO.google_site_verification || undefined,
      me: globalSEO.google_site_verification || undefined,
    },

    // Additional SEO and PWA
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteInfo.site_name || 'Bishola',
      'format-detection': 'telephone=no',
      'theme-color': siteInfo.primary_color || '#2C3C39',
      'msapplication-TileColor': siteInfo.primary_color || '#2C3C39',
      ...(customConfig?.customMeta?.reduce((acc, meta) => {
        if (meta.name) acc[meta.name] = meta.content;
        return acc;
      }, {} as Record<string, string>) || {}),
    },

    // Manifest for PWA
    manifest: '/manifest.json',
  };
}

/**
 * Generate structured data using settings
 */
export async function generateSettingsBasedStructuredData(
  pageType: WebPageType = 'home',
  customData?: Record<string, any>,
) {
  const locale = await getLocale();
  const settings = await fetchSettingsData(locale);

  const { general, seo, app, pageSEO, globalSEO, siteInfo } = extractSEOData(
    settings,
    pageType,
    locale,
  );

  const baseUrl = globalSEO.canonical_base_url || DEFAULT_FALLBACKS.baseUrl;
  const organizationName = globalSEO.organization_name || siteInfo.site_name;
  const contactEmail = general.contact_info?.email || DEFAULT_FALLBACKS.email;
  const contactPhone = general.contact_info?.phone || DEFAULT_FALLBACKS.phone;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: organizationName,
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: globalSEO.organization_logo || siteInfo.logo,
          width: 300,
          height: 100,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: contactPhone,
            email: contactEmail,
            availableLanguage: ['Arabic', 'English'],
          },
        ],
        address: general.contact_info?.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: general.contact_info.address,
            }
          : undefined,
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: siteInfo.site_name,
        description: siteInfo.site_description,
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        inLanguage: locale,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
    ].filter(Boolean), // Remove undefined entries
  };

  // Add custom structured data if provided
  // if (customData) {
  //   structuredData['@graph'].push(customData);
  // }

  return structuredData;
}

/**
 * Extract analytics IDs from settings
 */
export async function getAnalyticsConfig() {
  const locale = await getLocale();
  const settings = await fetchSettingsData(locale);

  const globalSEO = settings?.seo_settings?.global_seo || {};

  return {
    googleAnalyticsId: globalSEO.google_analytics_id,
    googleTagManagerId: globalSEO.google_tag_manager_id,
    facebookPixelId: globalSEO.facebook_pixel_id,
    facebookAppId: globalSEO.facebook_app_id,
  };
}

/**
 * Generate metadata for dynamic product pages
 * Uses actual product data as primary content, settings as fallback for global config
 */
export async function generateProductMetadata(
  productData: {
    title: string;
    description: string;
    images?: string[];
    keywords?: string[];
    canonical?: string;
  },
  customConfig?: SettingsMetadataConfig,
): Promise<Metadata> {
  const locale = await getLocale();
  const settings = await fetchSettingsData(locale);

  const { general, seo, app, pageSEO, globalSEO, siteInfo } = extractSEOData(
    settings,
    'product_detail',
    locale,
  );

  // Use product data as primary, settings as fallback for global config
  const baseUrl = globalSEO.canonical_base_url || DEFAULT_FALLBACKS.baseUrl;
  const siteName =
    siteInfo.site_name || getFallback(DEFAULT_FALLBACKS.siteName, locale);

  // Use product-specific data for main metadata
  const pageTitle = productData.title;
  const pageDescription = productData.description;
  const pageKeywords =
    productData.keywords || DEFAULT_FALLBACKS.keywords[locale as 'en' | 'ar'];

  // Use settings for global SEO configuration and fallback images
  const ogImage =
    productData.images?.[0] ||
    globalSEO.default_og_image ||
    `${baseUrl}${DEFAULT_FALLBACKS.defaultOgImage}`;

  const twitterImage =
    productData.images?.[0] || globalSEO.default_twitter_image || ogImage;

  const canonical = productData.canonical || `${baseUrl}/${locale}/products/`;

  return {
    title: {
      template: `%s | ${siteName}`,
      default: pageTitle,
    },
    description: pageDescription,
    keywords: pageKeywords,

    authors: [{ name: `${siteName} Team` }],
    creator: siteName,
    publisher: siteName,

    // Open Graph for social media sharing - use product data
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: canonical,
      title: pageTitle, // Use product title directly
      description: pageDescription, // Use product description directly
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },

    // Twitter Card - use product data
    twitter: {
      card: (globalSEO.twitter_card_type as any) || 'summary_large_image',
      title: pageTitle, // Use product title directly
      description: pageDescription, // Use product description directly
      images: [twitterImage],
      creator: globalSEO.twitter_handle || DEFAULT_FALLBACKS.twitterHandle,
      site: globalSEO.twitter_handle || DEFAULT_FALLBACKS.twitterHandle,
    },

    // Additional metadata from settings
    robots: {
      index: !customConfig?.noIndex,
      follow: !customConfig?.noIndex,
      googleBot: {
        index: !customConfig?.noIndex,
        follow: !customConfig?.noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Language alternates for SEO
    alternates: {
      canonical,
      languages: {
        en: `${baseUrl}/en/products/`,
        ar: `${baseUrl}/ar/products/`,
        'x-default': `${baseUrl}/en/products/`,
      },
    },

    // App-specific metadata
    applicationName: siteName,
    category: 'automotive',
    classification: 'Car Rental and Sales Platform',

    // Icons from settings
    icons: {
      icon: [
        { url: siteInfo.favicon || '/favicon.ico' }, // Settings favicon first
        {
          url: '/icon-16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/icon-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/apple-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      shortcut: siteInfo.favicon || '/favicon.ico',
    },

    // Verification tags from settings
    verification: {
      google: globalSEO.google_site_verification || undefined,
    },

    // Additional SEO and PWA
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteName,
      'format-detection': 'telephone=no',
      'theme-color': siteInfo.primary_color || '#2C3C39',
      'msapplication-TileColor': siteInfo.primary_color || '#2C3C39',
      ...(customConfig?.customMeta?.reduce((acc, meta) => {
        if (meta.name) acc[meta.name] = meta.content;
        return acc;
      }, {} as Record<string, string>) || {}),
    },

    // Manifest for PWA
    manifest: '/manifest.json',
  };
}

/**
 * Page type mapping helper
 */
export function getPageType(pathname: string): WebPageType {
  if (pathname === '/' || pathname.endsWith('/')) return 'home';
  if (pathname.includes('/products/') && !pathname.includes('/products?'))
    return 'product_detail';
  if (pathname.includes('/products')) return 'products';
  if (pathname.includes('/auth/')) return 'auth';
  if (pathname.includes('/userProfile/')) return 'profile';
  if (pathname.includes('/privacy')) return 'privacy_policy';
  return 'home';
}
