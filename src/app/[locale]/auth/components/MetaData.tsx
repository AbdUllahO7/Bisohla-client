import Head from 'next/head';
import { useLocale } from 'next-intl';

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
    social_links: {
      facebook_url: string;
      instagram_url: string;
      twitter_url: string;
      linkedin_url: string;
      youtube_url: string;
      [key: string]: string;
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

// Types for different page configurations
type PageType = 'auth' | 'login' | 'register' | 'forgot-password' | 'home' | 'cars' | 'car-detail' | 'profile' | 'contact';

interface MetadataConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
  canonical?: string;
  customMeta?: Array<{ name?: string; property?: string; content: string; httpEquiv?: string; }>;
}

interface MetadataProviderProps {
  pageType: PageType;
  customConfig?: Partial<MetadataConfig>;
  structuredData?: Record<string, any>;
  apiSettings?: ApiSettings | null; // Add settings prop
  children?: React.ReactNode;
}

// Default business info
const DEFAULT_INFO = {
  siteName: { en: 'Bishola', ar: 'بسهولة' },
  url: 'https://bishola.com',
  phone: '+966-XXX-XXXX',
  email: 'support@bishola.com',
  logo: 'https://bishola.com/logo-bishola.png',
  socialMedia: {
    facebook: 'https://facebook.com/bishola',
    twitter: 'https://twitter.com/bishola',
    instagram: 'https://instagram.com/bishola',
    linkedin: 'https://linkedin.com/company/bishola'
  }
};

// Default metadata configurations for different page types
const getDefaultMetadata = (
  pageType: PageType, 
  locale: string, 
  apiSettings?: ApiSettings | null
): MetadataConfig => {
  // Get locale-specific settings from API
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  const seoSettings = localeData?.seo_settings?.home_page;
  
  // Get site name from API or use default
  const siteName = localeData?.general?.site_info?.site_name || DEFAULT_INFO.siteName[locale as 'en' | 'ar'];
  
  // Use API SEO settings if available for home page
  if (pageType === 'home' && seoSettings?.meta_title) {
    return {
      title: seoSettings.meta_title,
      description: seoSettings.meta_description || (locale === 'ar' 
        ? 'استأجر أو اشتري سيارتك المثالية مع بسهولة. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع.'
        : 'Rent or buy your perfect car with Bishola. Premium car rental services and quality used cars for sale. Find the best deals on vehicles.'),
      keywords: seoSettings.meta_keywords || (locale === 'ar'
        ? 'تأجير السيارات, بيع السيارات, استئجار سيارة, شراء السيارات, تأجير المركبات, مبيعات السيارات'
        : 'car rental, car sales, rent a car, buy cars, vehicle rental, auto sales, cars for sale, car marketplace'),
      ogImage: seoSettings.og_image || 'https://bishola.com/home-og-image.jpg',
    };
  }
  
  const metadataConfigs: Record<PageType, { en: MetadataConfig; ar: MetadataConfig }> = {
    auth: {
      en: {
        title: `Authentication - ${siteName}`,
        description: `Access your ${siteName} account to rent cars, buy vehicles, and manage your automotive needs securely.`,
        keywords: `${siteName.toLowerCase()} login, car rental account, vehicle sales login, automotive platform`,
        noIndex: true,
      },
      ar: {
        title: `المصادقة - ${siteName}`,
        description: `ادخل إلى حساب ${siteName} لتأجير السيارات وشراء المركبات وإدارة احتياجاتك من السيارات بأمان.`,
        keywords: `تسجيل دخول ${siteName}, حساب تأجير السيارات, تسجيل دخول مبيعات المركبات, منصة السيارات`,
        noIndex: true,
      }
    },
    login: {
      en: {
        title: `Login - ${siteName}`,
        description: `Sign in to your ${siteName} account to access car rental and sales services.`,
        keywords: 'login, sign in, account, car rental login',
        noIndex: true,
      },
      ar: {
        title: `تسجيل الدخول - ${siteName}`,
        description: `سجل دخولك إلى حساب ${siteName} للوصول إلى خدمات تأجير وبيع السيارات.`,
        keywords: 'تسجيل الدخول, دخول, حساب, تسجيل دخول تأجير السيارات',
        noIndex: true,
      }
    },
    register: {
      en: {
        title: `Create Account - ${siteName}`,
        description: `Join ${siteName} today! Create your account to rent cars, buy vehicles, and list your cars for sale.`,
        keywords: 'create account, sign up, register',
        noIndex: true,
      },
      ar: {
        title: `إنشاء حساب - ${siteName}`,
        description: `انضم إلى ${siteName} اليوم! أنشئ حسابك لتأجير السيارات وشراء المركبات وإدراج سياراتك للبيع.`,
        keywords: 'إنشاء حساب, التسجيل, تسجيل',
        noIndex: true,
      }
    },
    'forgot-password': {
      en: {
        title: `Reset Password - ${siteName}`,
        description: `Reset your password securely to regain access to your ${siteName} account.`,
        keywords: 'reset password, forgot password, account recovery',
        noIndex: true,
      },
      ar: {
        title: `إعادة تعيين كلمة المرور - ${siteName}`,
        description: `أعد تعيين كلمة المرور بأمان لاستعادة الوصول إلى حساب ${siteName}.`,
        keywords: 'إعادة تعيين كلمة المرور, نسيان كلمة المرور, استرداد الحساب',
        noIndex: true,
      }
    },
    home: {
      en: {
        title: `${siteName} - Car Rental & Car Sales Platform`,
        description: `Rent or buy your perfect car with ${siteName}. Premium car rental services and quality used cars for sale. Find the best deals on vehicles.`,
        keywords: 'car rental, car sales, rent a car, buy cars, vehicle rental, auto sales, cars for sale, car marketplace',
        ogImage: 'https://bishola.com/home-og-image.jpg',
      },
      ar: {
        title: `${siteName} - منصة تأجير وبيع السيارات`,
        description: `استأجر أو اشتري سيارتك المثالية مع ${siteName}. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع.`,
        keywords: 'تأجير السيارات, بيع السيارات, استئجار سيارة, شراء السيارات, تأجير المركبات, مبيعات السيارات',
        ogImage: 'https://bishola.com/home-og-image.jpg',
      }
    },
    cars: {
      en: {
        title: `Browse Cars - ${siteName}`,
        description: 'Explore our extensive collection of cars for sale and rent. Find your perfect vehicle with advanced filters and detailed listings.',
        keywords: 'browse cars, car listings, vehicles for sale, cars for rent, car search, auto marketplace',
        ogImage: 'https://bishola.com/cars-og-image.jpg',
      },
      ar: {
        title: `تصفح السيارات - ${siteName}`,
        description: 'اكتشف مجموعتنا الواسعة من السيارات للبيع والإيجار. اعثر على سيارتك المثالية مع المرشحات المتقدمة والقوائم المفصلة.',
        keywords: 'تصفح السيارات, قوائم السيارات, مركبات للبيع, سيارات للإيجار, البحث عن السيارات',
        ogImage: 'https://bishola.com/cars-og-image.jpg',
      }
    },
    'car-detail': {
      en: {
        title: `Car Details - ${siteName}`,
        description: 'View detailed information about this vehicle including specifications, pricing, and contact details.',
        keywords: 'car details, vehicle information, car specifications, auto details',
        ogImage: 'https://bishola.com/car-detail-og-image.jpg',
      },
      ar: {
        title: `تفاصيل السيارة - ${siteName}`,
        description: 'اعرض معلومات مفصلة عن هذه المركبة بما في ذلك المواصفات والأسعار وتفاصيل الاتصال.',
        keywords: 'تفاصيل السيارة, معلومات المركبة, مواصفات السيارة, تفاصيل السيارات',
        ogImage: 'https://bishola.com/car-detail-og-image.jpg',
      }
    },
    profile: {
      en: {
        title: `My Profile - ${siteName}`,
        description: `Manage your ${siteName} account, view your listings, and update your profile information.`,
        keywords: 'user profile, account settings, my listings, profile management',
        noIndex: true,
      },
      ar: {
        title: `ملفي الشخصي - ${siteName}`,
        description: `إدارة حساب ${siteName} الخاص بك، واعرض قوائمك، وقم بتحديث معلومات ملفك الشخصي.`,
        keywords: 'الملف الشخصي, إعدادات الحساب, قوائمي, إدارة الملف الشخصي',
        noIndex: true,
      }
    },
    contact: {
      en: {
        title: `Contact Us - ${siteName}`,
        description: `Get in touch with ${siteName} support team. We are here to help with your car rental and sales needs.`,
        keywords: 'contact, customer support, help center, contact information',
        ogImage: 'https://bishola.com/contact-og-image.jpg',
      },
      ar: {
        title: `اتصل بنا - ${siteName}`,
        description: `تواصل مع فريق دعم ${siteName}. نحن هنا لمساعدتك في احتياجات تأجير وبيع السيارات.`,
        keywords: 'اتصل, دعم العملاء, مركز المساعدة, معلومات الاتصال',
        ogImage: 'https://bishola.com/contact-og-image.jpg',
      }
    }
  };

  return metadataConfigs[pageType]?.[locale as 'en' | 'ar'] || metadataConfigs[pageType]?.en || metadataConfigs.home.en;
};

// Generate structured data based on page type
const generateStructuredData = (
  pageType: PageType, 
  locale: string, 
  metadata: MetadataConfig, 
  apiSettings?: ApiSettings | null,
  customData?: Record<string, any>
) => {
  // Get data from API or use defaults
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  const siteName = localeData?.general?.site_info?.site_name || DEFAULT_INFO.siteName[locale as 'en' | 'ar'];
  const siteDescription = localeData?.general?.site_info?.site_description || 
    (locale === 'ar' ? 'منصة تأجير وبيع السيارات الرائدة' : 'Leading car rental and sales platform');
  const logo = localeData?.general?.appearance?.logo || DEFAULT_INFO.logo;
  const email = localeData?.general?.contact_info?.email || DEFAULT_INFO.email;
  const phone = localeData?.general?.contact_info?.phone || DEFAULT_INFO.phone;
  
  // Get social media links from API or defaults
  const socialLinks = localeData?.general?.social_links;
  const sameAsLinks = [
    socialLinks?.facebook_url || DEFAULT_INFO.socialMedia.facebook,
    socialLinks?.twitter_url || DEFAULT_INFO.socialMedia.twitter,
    socialLinks?.instagram_url || DEFAULT_INFO.socialMedia.instagram,
    socialLinks?.linkedin_url || DEFAULT_INFO.socialMedia.linkedin,
  ].filter(link => link && link !== ''); // Filter out empty links
  
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": metadata.title,
    "url": `${DEFAULT_INFO.url}/${locale}/${pageType}`,
    "inLanguage": locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": siteName,
      "url": DEFAULT_INFO.url,
      "description": siteDescription,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${DEFAULT_INFO.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    "mainEntity": {
      "@type": "Organization",
      "name": siteName,
      "url": DEFAULT_INFO.url,
      "logo": logo,
      "sameAs": sameAsLinks,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English"],
        "telephone": phone,
        "email": email
      }
    }
  };

  // Add page-specific structured data
  if (pageType === 'home') {
    baseStructuredData.mainEntity = {
      ...baseStructuredData.mainEntity,
      "@type": "AutoDealer",
      "name": siteName,
    };
  }

  return customData ? { ...baseStructuredData, ...customData } : baseStructuredData;
};

const MetadataProvider: React.FC<MetadataProviderProps> = ({ 
  pageType, 
  customConfig, 
  structuredData: customStructuredData,
  apiSettings, // Accept settings from usePublicSettings hook
  children 
}) => {
  const locale = useLocale();
  
  // Get default metadata and merge with custom config
  const defaultMetadata = getDefaultMetadata(pageType, locale, apiSettings);
  const metadata: MetadataConfig = { ...defaultMetadata, ...customConfig };
  
  // Generate structured data with API settings
  const structuredData = generateStructuredData(pageType, locale, metadata, apiSettings, customStructuredData);
  
  // Get site name, logo, and other info from API or defaults
  const localeData = apiSettings?.data?.[locale as 'ar' | 'en'];
  const siteName = localeData?.general?.site_info?.site_name || DEFAULT_INFO.siteName[locale as 'en' | 'ar'];
  const favicon = localeData?.general?.appearance?.favicon;
  const primaryColor = localeData?.general?.appearance?.primary_color || '#2C3C39';
  
  return (
    <>
      {/* Meta Tags */}
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="robots" content={metadata.noIndex ? "noindex, nofollow" : "index, follow"} />
        <meta name="author" content={`${siteName} Team`} />
        <meta name="generator" content="Next.js" />
        
        {/* Favicon from API */}
        {favicon && <link rel="icon" href={favicon} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={metadata.canonical || `${DEFAULT_INFO.url}/${locale}/${pageType}`} />
        
        {/* Language Alternates */}
        <link rel="alternate" hrefLang="en" href={`${DEFAULT_INFO.url}/en/${pageType}`} />
        <link rel="alternate" hrefLang="ar" href={`${DEFAULT_INFO.url}/ar/${pageType}`} />
        <link rel="alternate" hrefLang="x-default" href={`${DEFAULT_INFO.url}/en/${pageType}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${DEFAULT_INFO.url}/${locale}/${pageType}`} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={locale === 'ar' ? 'ar_SA' : 'en_US'} />
        <meta property="og:image" content={metadata.ogImage || `${DEFAULT_INFO.url}/default-og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={metadata.title} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.twitterImage || metadata.ogImage || `${DEFAULT_INFO.url}/default-twitter-image.jpg`} />
        <meta name="twitter:site" content="@bishola" />
        <meta name="twitter:creator" content="@bishola" />
        
        {/* App-specific with theme color from API */}
        <meta name="application-name" content={siteName} />
        <meta name="theme-color" content={primaryColor} />
        <meta name="msapplication-TileColor" content={primaryColor} />
        
        {/* Security Headers */}
        {metadata.noIndex && (
          <>
            <meta httpEquiv="X-Frame-Options" content="DENY" />
            <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
            <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
          </>
        )}
        
        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={DEFAULT_INFO.url} />
        
        {/* Custom Meta Tags */}
        {metadata.customMeta?.map((meta, index) => (
          <meta
            key={index}
            {...(meta.name && { name: meta.name })}
            {...(meta.property && { property: meta.property })}
            {...(meta.httpEquiv && { httpEquiv: meta.httpEquiv })}
            content={meta.content}
          />
        ))}
      </Head>

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

export default MetadataProvider;