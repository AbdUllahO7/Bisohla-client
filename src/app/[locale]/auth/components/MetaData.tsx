import Head from 'next/head';
import { useLocale } from 'next-intl';

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
  children?: React.ReactNode;
}

// Default metadata configurations for different page types
const getDefaultMetadata = (pageType: PageType, locale: string): MetadataConfig => {
  const metadataConfigs: Record<PageType, { en: MetadataConfig; ar: MetadataConfig }> = {
    auth: {
      en: {
        title: 'Authentication - Bishola',
        description: 'Access your Bishola account to rent cars, buy vehicles, and manage your automotive needs securely.',
        keywords: 'bishola login, car rental account, vehicle sales login, automotive platform',
        noIndex: true,
      },
      ar: {
        title: 'المصادقة - بسهولة',
        description: 'ادخل إلى حساب بسهولة لتأجير السيارات وشراء المركبات وإدارة احتياجاتك من السيارات بأمان.',
        keywords: 'تسجيل دخول بسهولة, حساب تأجير السيارات, تسجيل دخول مبيعات المركبات, منصة السيارات',
        noIndex: true,
      }
    },
    login: {
      en: {
        title: 'Login - Bishola',
        description: 'Sign in to your Bishola account to access car rental and sales services.',
        keywords: 'login, sign in, bishola account, car rental login',
        noIndex: true,
      },
      ar: {
        title: 'تسجيل الدخول - بسهولة',
        description: 'سجل دخولك إلى حساب بسهولة للوصول إلى خدمات تأجير وبيع السيارات.',
        keywords: 'تسجيل الدخول, دخول, حساب بسهولة, تسجيل دخول تأجير السيارات',
        noIndex: true,
      }
    },
    register: {
      en: {
        title: 'Create Account - Bishola',
        description: 'Join Bishola today! Create your account to rent cars, buy vehicles, and list your cars for sale.',
        keywords: 'create account, sign up, join bishola, register',
        noIndex: true,
      },
      ar: {
        title: 'إنشاء حساب - بسهولة',
        description: 'انضم إلى بسهولة اليوم! أنشئ حسابك لتأجير السيارات وشراء المركبات وإدراج سياراتك للبيع.',
        keywords: 'إنشاء حساب, التسجيل, انضم بسهولة, تسجيل',
        noIndex: true,
      }
    },
    'forgot-password': {
      en: {
        title: 'Reset Password - Bishola',
        description: 'Reset your password securely to regain access to your Bishola account.',
        keywords: 'reset password, forgot password, account recovery, bishola',
        noIndex: true,
      },
      ar: {
        title: 'إعادة تعيين كلمة المرور - بسهولة',
        description: 'أعد تعيين كلمة المرور بأمان لاستعادة الوصول إلى حساب بسهولة.',
        keywords: 'إعادة تعيين كلمة المرور, نسيان كلمة المرور, استرداد الحساب, بسهولة',
        noIndex: true,
      }
    },
    home: {
      en: {
        title: 'Bishola - Car Rental & Car Sales Platform',
        description: 'Rent or buy your perfect car with Bishola. Premium car rental services and quality used cars for sale. Find the best deals on vehicles.',
        keywords: 'car rental, car sales, rent a car, buy cars, vehicle rental, auto sales, cars for sale, car marketplace',
        ogImage: 'https://bishola.com/home-og-image.jpg',
      },
      ar: {
        title: 'بسهولة - منصة تأجير وبيع السيارات',
        description: 'استأجر أو اشتري سيارتك المثالية مع بسهولة. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع.',
        keywords: 'تأجير السيارات, بيع السيارات, استئجار سيارة, شراء السيارات, تأجير المركبات, مبيعات السيارات',
        ogImage: 'https://bishola.com/home-og-image.jpg',
      }
    },
    cars: {
      en: {
        title: 'Browse Cars - Bishola',
        description: 'Explore our extensive collection of cars for sale and rent. Find your perfect vehicle with advanced filters and detailed listings.',
        keywords: 'browse cars, car listings, vehicles for sale, cars for rent, car search, auto marketplace',
        ogImage: 'https://bishola.com/cars-og-image.jpg',
      },
      ar: {
        title: 'تصفح السيارات - بسهولة',
        description: 'اكتشف مجموعتنا الواسعة من السيارات للبيع والإيجار. اعثر على سيارتك المثالية مع المرشحات المتقدمة والقوائم المفصلة.',
        keywords: 'تصفح السيارات, قوائم السيارات, مركبات للبيع, سيارات للإيجار, البحث عن السيارات',
        ogImage: 'https://bishola.com/cars-og-image.jpg',
      }
    },
    'car-detail': {
      en: {
        title: 'Car Details - Bishola',
        description: 'View detailed information about this vehicle including specifications, pricing, and contact details.',
        keywords: 'car details, vehicle information, car specifications, auto details',
        ogImage: 'https://bishola.com/car-detail-og-image.jpg',
      },
      ar: {
        title: 'تفاصيل السيارة - بسهولة',
        description: 'اعرض معلومات مفصلة عن هذه المركبة بما في ذلك المواصفات والأسعار وتفاصيل الاتصال.',
        keywords: 'تفاصيل السيارة, معلومات المركبة, مواصفات السيارة, تفاصيل السيارات',
        ogImage: 'https://bishola.com/car-detail-og-image.jpg',
      }
    },
    profile: {
      en: {
        title: 'My Profile - Bishola',
        description: 'Manage your Bishola account, view your listings, and update your profile information.',
        keywords: 'user profile, account settings, my listings, profile management',
        noIndex: true,
      },
      ar: {
        title: 'ملفي الشخصي - بسهولة',
        description: 'إدارة حساب بسهولة الخاص بك، واعرض قوائمك، وقم بتحديث معلومات ملفك الشخصي.',
        keywords: 'الملف الشخصي, إعدادات الحساب, قوائمي, إدارة الملف الشخصي',
        noIndex: true,
      }
    },
    contact: {
      en: {
        title: 'Contact Us - Bishola',
        description: 'Get in touch with Bishola support team. We are here to help with your car rental and sales needs.',
        keywords: 'contact bishola, customer support, help center, contact information',
        ogImage: 'https://bishola.com/contact-og-image.jpg',
      },
      ar: {
        title: 'اتصل بنا - بسهولة',
        description: 'تواصل مع فريق دعم بسهولة. نحن هنا لمساعدتك في احتياجات تأجير وبيع السيارات.',
        keywords: 'اتصل ببسهولة, دعم العملاء, مركز المساعدة, معلومات الاتصال',
        ogImage: 'https://bishola.com/contact-og-image.jpg',
      }
    }
  };

  return metadataConfigs[pageType]?.[locale as 'en' | 'ar'] || metadataConfigs[pageType]?.en || metadataConfigs.home.en;
};

// Generate structured data based on page type
const generateStructuredData = (pageType: PageType, locale: string, metadata: MetadataConfig, customData?: Record<string, any>) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": metadata.title,
    // "description": metadata.description, // Removed as it is not valid for this schema type
    "url": `https://bishola.com/${locale}/${pageType}`,
    "inLanguage": locale,
    "isPartOf": {
      "@type": "WebSite",
      "name": locale === 'ar' ? 'بسهولة' : 'Bishola',
      "url": "https://bishola.com",
      "description": locale === 'ar' 
        ? 'منصة تأجير وبيع السيارات الرائدة' 
        : 'Leading car rental and sales platform',
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://bishola.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    "mainEntity": {
      "@type": "Organization",
      "name": locale === 'ar' ? 'بسهولة' : 'Bishola',
      "url": "https://bishola.com",
      "logo": "https://bishola.com/logo-bishola.png",
      "sameAs": [
        "https://facebook.com/bishola",
        "https://twitter.com/bishola",
        "https://instagram.com/bishola",
        "https://linkedin.com/company/bishola"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English"],
        "telephone": "+966-XXX-XXXX", // Add your phone number
        "email": "support@bishola.com"
      }
    }
  };

  // Add page-specific structured data
  if (pageType === 'home') {
    baseStructuredData.mainEntity = {
      ...baseStructuredData.mainEntity,
      "@type": "AutoDealer",
      "name": locale === 'ar' ? 'بسهولة' : 'Bishola',
    };
  }

  return customData ? { ...baseStructuredData, ...customData } : baseStructuredData;
};

const MetadataProvider: React.FC<MetadataProviderProps> = ({ 
  pageType, 
  customConfig, 
  structuredData: customStructuredData,
  children 
}) => {
  const locale = useLocale();
  
  // Get default metadata and merge with custom config
  const defaultMetadata = getDefaultMetadata(pageType, locale);
  const metadata: MetadataConfig = { ...defaultMetadata, ...customConfig };
  
  // Generate structured data
  const structuredData = generateStructuredData(pageType, locale, metadata, customStructuredData);
  
  return (
    <>
      {/* Meta Tags */}
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="robots" content={metadata.noIndex ? "noindex, nofollow" : "index, follow"} />
        <meta name="author" content="Bishola Team" />
        <meta name="generator" content="Next.js" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={metadata.canonical || `https://bishola.com/${locale}/${pageType}`} />
        
        {/* Language Alternates */}
        <link rel="alternate" hrefLang="en" href={`https://bishola.com/en/${pageType}`} />
        <link rel="alternate" hrefLang="ar" href={`https://bishola.com/ar/${pageType}`} />
        <link rel="alternate" hrefLang="x-default" href={`https://bishola.com/en/${pageType}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://bishola.com/${locale}/${pageType}`} />
        <meta property="og:site_name" content={locale === 'ar' ? 'بسهولة' : 'Bishola'} />
        <meta property="og:locale" content={locale === 'ar' ? 'ar_SA' : 'en_US'} />
        <meta property="og:image" content={metadata.ogImage || 'https://bishola.com/default-og-image.jpg'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={metadata.title} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.twitterImage || metadata.ogImage || 'https://bishola.com/default-twitter-image.jpg'} />
        <meta name="twitter:site" content="@bishola" />
        <meta name="twitter:creator" content="@bishola" />
        
        {/* App-specific */}
        <meta name="application-name" content={locale === 'ar' ? 'بسهولة' : 'Bishola'} />
        <meta name="theme-color" content="#2C3C39" />
        <meta name="msapplication-TileColor" content="#2C3C39" />
        
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
        <link rel="dns-prefetch" href="https://bishola.com" />
        
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