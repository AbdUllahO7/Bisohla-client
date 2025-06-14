import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

// Types for different page configurations
type WebPageType = 'home' | 'cars' | 'car-detail' | 'profile' | 'contact' | 'about' | 'rent' | 'sale' | 'search';

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

// Generate metadata for web pages
export async function generateWebMetadata(
  pageType: WebPageType = 'home',
  customConfig?: WebMetadataConfig,
  businessInfo?: {
    name?: { en: string; ar: string };
    url?: string;
    phone?: string;
    email?: string;
    salesEmail?: string;
    address?: {
      street?: string;
      city?: { en: string; ar: string };
      region?: { en: string; ar: string };
      postalCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude?: string;
      longitude?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    businessHours?: {
      weekdays?: { opens: string; closes: string };
      friday?: { opens: string; closes: string };
    };
  }
): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("homePage");
  
  // Merge default business info with custom config
  const mergedBusinessInfo = {
    name: businessInfo?.name || DEFAULT_BUSINESS_INFO.name,
    url: businessInfo?.url || DEFAULT_BUSINESS_INFO.url,
    phone: businessInfo?.phone || DEFAULT_BUSINESS_INFO.phone,
    email: businessInfo?.email || DEFAULT_BUSINESS_INFO.email,
    salesEmail: businessInfo?.salesEmail || DEFAULT_BUSINESS_INFO.salesEmail,
    address: {
      ...DEFAULT_BUSINESS_INFO.address,
      ...businessInfo?.address
    },
    coordinates: {
      ...DEFAULT_BUSINESS_INFO.coordinates,
      ...businessInfo?.coordinates
    },
    socialMedia: {
      ...DEFAULT_BUSINESS_INFO.socialMedia,
      ...businessInfo?.socialMedia
    },
    businessHours: {
      ...DEFAULT_BUSINESS_INFO.businessHours,
      ...businessInfo?.businessHours
    }
  };
  
  // Enhanced metadata based on locale
  const siteTitle = mergedBusinessInfo.name[locale as 'en' | 'ar'] || mergedBusinessInfo.name.en;
  const siteName = locale === 'ar' 
    ? `${mergedBusinessInfo.name.ar} - تأجير وبيع السيارات` 
    : `${mergedBusinessInfo.name.en} - Car Rental & Sales`;
  
  // Default metadata configurations for different page types
// Default metadata configurations for different page types
  const getDefaultKeywords = (pageType: WebPageType): string[] => {
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
  };

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: customConfig?.title || t("metadata.title"),
    },
    description: customConfig?.description || t("metadata.description"),
    keywords: customConfig?.keywords || getDefaultKeywords(pageType),
    
    authors: [{ name: `${mergedBusinessInfo.name.en} Team` }],
    creator: mergedBusinessInfo.name.en,
    publisher: mergedBusinessInfo.name.en,
    
    // Open Graph for social media sharing
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: customConfig?.canonical || `${mergedBusinessInfo.url}/${locale}${pageType !== 'home' ? `/${pageType}` : ''}`,
      title: customConfig?.title || t("metadata.title"),
      description: customConfig?.description || t("metadata.description"),
      siteName: siteName,
      images: [
        {
          url: customConfig?.ogImage || `${mergedBusinessInfo.url}/og-${pageType}-image.jpg`,
          width: 1200,
          height: 630,
          alt: customConfig?.title || t("metadata.title"),
        },
        {
          url: `${mergedBusinessInfo.url}/og-logo.jpg`,
          width: 800,
          height: 600,
          alt: siteTitle,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: customConfig?.title || t("metadata.title"),
      description: customConfig?.description || t("metadata.description"),
      images: [customConfig?.twitterImage || customConfig?.ogImage || `${mergedBusinessInfo.url}/twitter-${pageType}-image.jpg`],
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
      canonical: customConfig?.canonical || `${mergedBusinessInfo.url}/${locale}${pageType !== 'home' ? `/${pageType}` : ''}`,
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
    
    // Icons (favicon configuration)
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
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
  businessInfo?: {
    name?: { en: string; ar: string };
    url?: string;
    phone?: string;
    email?: string;
    salesEmail?: string;
    address?: {
      street?: string;
      city?: { en: string; ar: string };
      region?: { en: string; ar: string };
      postalCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude?: string;
      longitude?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    businessHours?: {
      weekdays?: { opens: string; closes: string };
      friday?: { opens: string; closes: string };
    };
  },
  customData?: Record<string, any>
) {
  const locale = await getLocale();
  const t = await getTranslations("homePage");
  
  // Merge default business info with custom config
  const mergedBusinessInfo = {
    name: businessInfo?.name || DEFAULT_BUSINESS_INFO.name,
    url: businessInfo?.url || DEFAULT_BUSINESS_INFO.url,
    phone: businessInfo?.phone || DEFAULT_BUSINESS_INFO.phone,
    email: businessInfo?.email || DEFAULT_BUSINESS_INFO.email,
    salesEmail: businessInfo?.salesEmail || DEFAULT_BUSINESS_INFO.salesEmail,
    address: {
      ...DEFAULT_BUSINESS_INFO.address,
      ...businessInfo?.address
    },
    coordinates: {
      ...DEFAULT_BUSINESS_INFO.coordinates,
      ...businessInfo?.coordinates
    },
    socialMedia: {
      ...DEFAULT_BUSINESS_INFO.socialMedia,
      ...businessInfo?.socialMedia
    },
    businessHours: {
      ...DEFAULT_BUSINESS_INFO.businessHours,
      ...businessInfo?.businessHours
    }
  };
  
   const structuredData: {
    "@context": string;
    "@graph": any[]; // Use any[] to allow flexible structured data
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
          "url": `${mergedBusinessInfo.url}/logo-bishola.png`,
          "width": 300,
          "height": 100
        },
        "sameAs": Object.values(mergedBusinessInfo.socialMedia),
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
        "description": t("metadata.description"),
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
        "image": `${mergedBusinessInfo.url}/logo-bishola.png`,
        "description": t("metadata.description"),
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
  businessInfo?: {
    name?: { en: string; ar: string };
    url?: string;
    phone?: string;
    email?: string;
    salesEmail?: string;
    address?: {
      street?: string;
      city?: { en: string; ar: string };
      region?: { en: string; ar: string };
      postalCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude?: string;
      longitude?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    businessHours?: {
      weekdays?: { opens: string; closes: string };
      friday?: { opens: string; closes: string };
    };
  };
    customData?: CustomStructuredData | CustomStructuredData[] // Updated type
  customStructuredData?: Record<string, any>;
  children?: React.ReactNode;
}

export const WebMetadataProvider: React.FC<WebMetadataProviderProps> = async ({ 
  pageType = 'home',
  businessInfo,
  customStructuredData,
  children 
}) => {
  const structuredData = await generateWebStructuredData(pageType, businessInfo, customStructuredData);

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