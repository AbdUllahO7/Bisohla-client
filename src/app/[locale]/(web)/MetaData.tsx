import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

// Types for different page configurations
type WebPageType = 'home' | 'cars' | 'car-detail' | 'profile' | 'contact' | 'about' | 'rent' | 'sale' | 'search' | 'user-profile';

// API Settings Types
interface ApiSettings {
  success: boolean;
  data: {
    ar: LocaleSettings;
    en: LocaleSettings;
  };
}

interface LocaleSettings {
  general: {
    site_info: {
      site_name: string;
      site_description: string;
      copyright_message: string;
    };
    contact_info: {
      email: string;
      phone: string;
      address: string;
    };
    appearance: {
      logo: string;
      favicon: string;
      primary_color: string;
      secondary_color: string;
    };
    localization: {
      default_lang: string;
      timezone: string;
      date_format: string;
      date_time_format: string;
      time_format: string;
    };
    social_links: {
      facebook_url: string;
      facebook_image: string;
      instagram_url: string;
      instagram_image: string;
      tiktok_url: string;
      tiktok_image: string;
      youtube_url: string;
      youtube_image: string;
      snapchat_url: string;
      snapchat_image: string;
      twitter_url: string;
      twitter_image: string;
      linkedin_url: string;
      linkedin_image: string;
      pinterest_url: string;
      pinterest_image: string;
      telegram_url: string;
      telegram_image: string;
      whatsapp_url: string;
      whatsapp_image: string;
    };
  };
  app_settings: {
    app_info: {
      app_name: string;
      app_description: string;
      bundle_id: string;
      play_store_url: string;
      app_store_url: string;
    };
  };
  seo_settings: {
    home_page: {
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
      og_title: string;
      og_description: string;
      og_image: string;
      og_image_alt: string;
      twitter_title: string;
      twitter_description: string;
      twitter_image: string;
      canonical_url: string;
      focus_keyword: string;
    };
  };
}

interface WebMetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
  canonical?: string;
  customMeta?: Array<{ name?: string; property?: string; content: string; httpEquiv?: string; }>;
}

interface BusinessInfo {
  name: {
    en: string;
    ar: string;
  };
  url: string;
  phone: string;
  email: string;
  salesEmail: string;
  address: {
    street: string;
    city: { en: string; ar: string };
    region: { en: string; ar: string };
    postalCode: string;
    country: string;
  };
  coordinates: {
    latitude: string;
    longitude: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  businessHours: {
    weekdays: { opens: string; closes: string };
    friday: { opens: string; closes: string };
  };
}

// Default business information
const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: {
    en: 'Bishola',
    ar: 'بسهولة'
  },
  url: 'https://bishola.com',
  phone: '+90-538-9370863',
  email: 'support@bishola.com',
  salesEmail: 'sales@bishola.com',
  address: {
    street: 'Your Street Address',
    city: { en: 'Damascus', ar: 'دمشق' },
    region: { en: 'Damascus', ar: 'دمشق' },
    postalCode: '12345',
    country: 'SY'
  },
  coordinates: {
    latitude: '24.7136',
    longitude: '46.6753'
  },
  socialMedia: {
    facebook: 'https://facebook.com/bishola',
    twitter: 'https://twitter.com/bishola',
    instagram: 'https://instagram.com/bishola',
    linkedin: 'https://linkedin.com/company/bishola',
    youtube: 'https://youtube.com/bishola'
  },
  businessHours: {
    weekdays: { opens: '09:00', closes: '18:00' },
    friday: { opens: '14:00', closes: '18:00' }
  }
};

// No need to fetch - settings will be passed from usePublicSettings() hook

// Merge API settings with business info
function mergeSettingsWithBusinessInfo(
  apiSettings: ApiSettings | null | undefined,
  locale: string,
  customBusinessInfo?: Partial<BusinessInfo>
): BusinessInfo {
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  
  // Extract social media links from API
  const socialMedia = localeData ? {
    facebook: localeData.general.social_links.facebook_url || DEFAULT_BUSINESS_INFO.socialMedia.facebook,
    twitter: localeData.general.social_links.twitter_url || DEFAULT_BUSINESS_INFO.socialMedia.twitter,
    instagram: localeData.general.social_links.instagram_url || DEFAULT_BUSINESS_INFO.socialMedia.instagram,
    linkedin: localeData.general.social_links.linkedin_url || DEFAULT_BUSINESS_INFO.socialMedia.linkedin,
    youtube: localeData.general.social_links.youtube_url || DEFAULT_BUSINESS_INFO.socialMedia.youtube,
  } : DEFAULT_BUSINESS_INFO.socialMedia;

  // Build merged business info
  const mergedInfo: BusinessInfo = {
    name: {
      en: apiSettings?.data?.en?.general?.site_info?.site_name || DEFAULT_BUSINESS_INFO.name.en,
      ar: apiSettings?.data?.ar?.general?.site_info?.site_name || DEFAULT_BUSINESS_INFO.name.ar,
    },
    url: customBusinessInfo?.url || DEFAULT_BUSINESS_INFO.url,
    phone: localeData?.general?.contact_info?.phone || customBusinessInfo?.phone || DEFAULT_BUSINESS_INFO.phone,
    email: localeData?.general?.contact_info?.email || customBusinessInfo?.email || DEFAULT_BUSINESS_INFO.email,
    salesEmail: customBusinessInfo?.salesEmail || DEFAULT_BUSINESS_INFO.salesEmail,
    address: {
      street: localeData?.general?.contact_info?.address || customBusinessInfo?.address?.street || DEFAULT_BUSINESS_INFO.address.street,
      city: customBusinessInfo?.address?.city || DEFAULT_BUSINESS_INFO.address.city,
      region: customBusinessInfo?.address?.region || DEFAULT_BUSINESS_INFO.address.region,
      postalCode: customBusinessInfo?.address?.postalCode || DEFAULT_BUSINESS_INFO.address.postalCode,
      country: customBusinessInfo?.address?.country || DEFAULT_BUSINESS_INFO.address.country,
    },
    coordinates: customBusinessInfo?.coordinates || DEFAULT_BUSINESS_INFO.coordinates,
    socialMedia: {
      ...socialMedia,
      ...customBusinessInfo?.socialMedia
    },
    businessHours: customBusinessInfo?.businessHours || DEFAULT_BUSINESS_INFO.businessHours,
  };

  return mergedInfo;
}

// Generate metadata for web pages
export async function generateWebMetadata(
  pageType: WebPageType = 'home',
  customConfig?: WebMetadataConfig,
  businessInfo?: Partial<BusinessInfo>,
  apiSettings?: ApiSettings | null // Add settings parameter
): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("homePage");
  
  // Use passed settings instead of fetching
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  
  // Merge API settings with business info
  const mergedBusinessInfo = mergeSettingsWithBusinessInfo(apiSettings, locale, businessInfo);
  
  // Get SEO settings from API or use defaults
  const seoSettings = localeData?.seo_settings?.home_page;
  
  // Enhanced metadata based on locale and API settings
  const siteTitle = mergedBusinessInfo.name[locale as 'en' | 'ar'] || mergedBusinessInfo.name.en;
  const siteName = localeData?.general?.site_info?.site_description || 
    (locale === 'ar' 
      ? `${mergedBusinessInfo.name.ar} - تأجير وبيع السيارات` 
      : `${mergedBusinessInfo.name.en} - Car Rental & Sales`);
  
  // Use SEO settings from API if available, otherwise use custom config or translations
  const metaTitle = seoSettings?.meta_title || customConfig?.title || t("metadata.title");
  const metaDescription = seoSettings?.meta_description || customConfig?.description || t("metadata.description");
  const ogTitle = seoSettings?.og_title || metaTitle;
  const ogDescription = seoSettings?.og_description || metaDescription;
  const ogImage = seoSettings?.og_image || customConfig?.ogImage || `${mergedBusinessInfo.url}/og-${pageType}-image.jpg`;
  const twitterImage = seoSettings?.twitter_image || customConfig?.twitterImage || ogImage;
  
  // Parse keywords from API (comma-separated string) or use custom keywords
  let keywords: string[] = [];
  if (seoSettings?.meta_keywords) {
    keywords = seoSettings.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
  } else if (customConfig?.keywords) {
    keywords = customConfig.keywords;
  } else {
    keywords = getDefaultKeywords(pageType, locale);
  }
  
  // Default metadata configurations for different page types
  function getDefaultKeywords(pageType: WebPageType, locale: string): string[] {
    const keywordSets: Record<WebPageType, string[]> = {
      home: locale === 'ar' 
        ? ['تأجير السيارات', 'بيع السيارات', 'استئجار سيارة', 'شراء السيارات', 'تأجير المركبات', 'مبيعات السيارات', 'سيارات للبيع', 'سوق السيارات', 'بسهولة']
        : ['car rental', 'car sales', 'rent a car', 'buy cars', 'vehicle rental', 'auto sales', 'cars for sale', 'car marketplace', 'bishola'],
      cars: locale === 'ar'
        ? ['تصفح السيارات', 'قوائم السيارات', 'مركبات للبيع', 'سيارات للإيجار', 'البحث عن السيارات']
        : ['browse cars', 'car listings', 'vehicles for sale', 'cars for rent', 'car search'],
      'car-detail': locale === 'ar'
        ? ['تفاصيل السيارة', 'مواصفات السيارة', 'معلومات المركبة', 'سعر السيارة', 'صور السيارة']
        : ['car details', 'vehicle specifications', 'car info', 'car price', 'vehicle images'],
      rent: locale === 'ar'
        ? ['تأجير السيارات', 'استئجار المركبات', 'إيجار السيارات', 'تأجير يومي', 'تأجير شهري']
        : ['car rental', 'vehicle rental', 'daily rental', 'monthly rental', 'rent a car'],
      sale: locale === 'ar'
        ? ['بيع السيارات', 'شراء المركبات', 'سيارات للبيع', 'مبيعات السيارات']
        : ['car sales', 'buy cars', 'cars for sale', 'vehicle sales'],
      profile: locale === 'ar'
        ? ['الملف الشخصي', 'حساب المستخدم', 'إعدادات الحساب', 'معلومات المستخدم']
        : ['user profile', 'account settings', 'user account', 'profile settings'],
      'user-profile': locale === 'ar'
        ? ['ملف شخصي عام', 'بائع سيارات', 'إعلانات السيارات', 'مستخدم', 'الملف العام']
        : ['public profile', 'car seller', 'car listings', 'user profile', 'seller profile'],
      contact: locale === 'ar'
        ? ['اتصل بنا', 'دعم العملاء', 'خدمة العملاء', 'معلومات الاتصال']
        : ['contact us', 'customer support', 'customer service', 'contact information'],
      about: locale === 'ar'
        ? ['عن الشركة', 'من نحن', 'تاريخ الشركة', 'رؤية الشركة']
        : ['about us', 'company info', 'our story', 'company vision'],
      search: locale === 'ar'
        ? ['البحث عن السيارات', 'نتائج البحث', 'تصفية السيارات', 'العثور على السيارات']
        : ['car search', 'search results', 'filter cars', 'find cars']
    };
    
    return keywordSets[pageType] || keywordSets.home;
  }

  // Use canonical URL from SEO settings or generate default
  const canonicalUrl = seoSettings?.canonical_url || 
    customConfig?.canonical || 
    `${mergedBusinessInfo.url}/${locale}${pageType !== 'home' ? `/${pageType}` : ''}`;

  // Get logo and favicon from API appearance settings
  const logoUrl = localeData?.general?.appearance?.logo || `${mergedBusinessInfo.url}/logo-bishola.png`;
  const faviconUrl = localeData?.general?.appearance?.favicon || '/favicon.ico';

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: metaTitle,
    },
    description: metaDescription,
    keywords: keywords,
    
    authors: [{ name: `${mergedBusinessInfo.name.en} Team` }],
    creator: mergedBusinessInfo.name.en,
    publisher: mergedBusinessInfo.name.en,
    
    // Open Graph for social media sharing
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: canonicalUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoSettings?.og_image_alt || metaTitle,
        },
        {
          url: logoUrl,
          width: 800,
          height: 600,
          alt: siteTitle,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: seoSettings?.twitter_title || ogTitle,
      description: seoSettings?.twitter_description || ogDescription,
      images: [twitterImage],
      creator: '@bishola',
      site: '@bishola',
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
      canonical: canonicalUrl,
      languages: {
        'en': `${mergedBusinessInfo.url}/en${pageType !== 'home' ? `/${pageType}` : ''}`,
        'ar': `${mergedBusinessInfo.url}/ar${pageType !== 'home' ? `/${pageType}` : ''}`,
        'x-default': `${mergedBusinessInfo.url}/en${pageType !== 'home' ? `/${pageType}` : ''}`,
      },
    },
    
    // App-specific metadata
    applicationName: siteTitle,
    category: 'automotive',
    classification: 'Car Rental and Sales Platform',
    
    // Icons (favicon configuration from API)
    icons: {
      icon: [
        { url: faviconUrl },
        { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: faviconUrl,
    },
    
    // Verification tags (add your actual verification codes)
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    
    // Additional SEO and PWA
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteTitle,
      'format-detection': 'telephone=no',
      ...(customConfig?.customMeta?.reduce((acc, meta) => {
        if (meta.name) acc[meta.name] = meta.content;
        return acc;
      }, {} as Record<string, string>) || {}),
    },
    
    // Manifest for PWA
    manifest: '/manifest.json',
  };
}

// Generate structured data for web pages
export async function generateWebStructuredData(
  pageType: WebPageType = 'home',
  businessInfo?: Partial<BusinessInfo>,
  customData?: Record<string, any>,
  apiSettings?: ApiSettings | null // Add settings parameter
) {
  const locale = await getLocale();
  const t = await getTranslations("homePage");
  
  // Use passed settings instead of fetching
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  
  // Merge API settings with business info
  const mergedBusinessInfo = mergeSettingsWithBusinessInfo(apiSettings, locale, businessInfo);
  
  // Get logo from API
  const logoUrl = localeData?.general?.appearance?.logo || `${mergedBusinessInfo.url}/logo-bishola.png`;
  
  // Get site description from API
  const siteDescription = localeData?.general?.site_info?.site_description || t("metadata.description");
  
  const structuredData: {
    "@context": string;
    "@graph": any[];
  } = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${mergedBusinessInfo.url}/#organization`,
        "name": mergedBusinessInfo.name[locale as 'en' | 'ar'] || mergedBusinessInfo.name.en,
        "url": mergedBusinessInfo.url,
        "logo": {
          "@type": "ImageObject",
          "url": logoUrl,
          "width": 300,
          "height": 100
        },
        "sameAs": Object.values(mergedBusinessInfo.socialMedia).filter(url => url && url !== ''),
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": mergedBusinessInfo.phone,
            "email": mergedBusinessInfo.email,
            "availableLanguage": ["Arabic", "English"],
            "areaServed": mergedBusinessInfo.address.country
          },
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "telephone": mergedBusinessInfo.phone,
            "email": mergedBusinessInfo.salesEmail,
            "availableLanguage": ["Arabic", "English"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": mergedBusinessInfo.address.street,
          "addressLocality": mergedBusinessInfo.address.city[locale as 'en' | 'ar'] || mergedBusinessInfo.address.city.en,
          "addressRegion": mergedBusinessInfo.address.region[locale as 'en' | 'ar'] || mergedBusinessInfo.address.region.en,
          "postalCode": mergedBusinessInfo.address.postalCode,
          "addressCountry": mergedBusinessInfo.address.country
        }
      },
      {
        "@type": "WebSite",
        "@id": `${mergedBusinessInfo.url}/#website`,
        "url": mergedBusinessInfo.url,
        "name": mergedBusinessInfo.name[locale as 'en' | 'ar'] || mergedBusinessInfo.name.en,
        "description": siteDescription,
        "publisher": {
          "@id": `${mergedBusinessInfo.url}/#organization`
        },
        "inLanguage": locale,
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${mergedBusinessInfo.url}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "AutoDealer",
        "@id": `${mergedBusinessInfo.url}/#autodealer`,
        "name": mergedBusinessInfo.name[locale as 'en' | 'ar'] || mergedBusinessInfo.name.en,
        "image": logoUrl,
        "description": siteDescription,
        "url": mergedBusinessInfo.url,
        "telephone": mergedBusinessInfo.phone,
        "address": {
          "@id": `${mergedBusinessInfo.url}/#address`
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": mergedBusinessInfo.coordinates.latitude,
          "longitude": mergedBusinessInfo.coordinates.longitude
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday", 
              "Wednesday",
              "Thursday",
              "Sunday"
            ],
            "opens": mergedBusinessInfo.businessHours.weekdays.opens,
            "closes": mergedBusinessInfo.businessHours.weekdays.closes
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Friday",
            "opens": mergedBusinessInfo.businessHours.friday.opens,
            "closes": mergedBusinessInfo.businessHours.friday.closes
          }
        ],
        "priceRange": "$",
        "currenciesAccepted": "SAR",
        "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"]
      }
    ]
  };

  // Add custom structured data if provided
  if (customData) {
    structuredData["@graph"].push(customData);
  }

  return structuredData;
}

interface CustomStructuredData {
  "@type": string;
  "@id"?: string;
  [key: string]: any;
}

// React component for adding structured data
interface WebMetadataProviderProps {
  pageType?: WebPageType;
  customConfig?: WebMetadataConfig;
  businessInfo?: Partial<BusinessInfo>;
  customData?: CustomStructuredData | CustomStructuredData[];
  customStructuredData?: Record<string, any>;
  apiSettings?: ApiSettings | null; // Add settings parameter
  children?: React.ReactNode;
}

export const WebMetadataProvider: React.FC<WebMetadataProviderProps> = async ({ 
  pageType = 'home',
  businessInfo,
  customStructuredData,
  apiSettings, // Accept settings
  children 
}) => {
  const structuredData = await generateWebStructuredData(pageType, businessInfo, customStructuredData, apiSettings);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />
      {children}
    </>
  );
};

export default WebMetadataProvider;