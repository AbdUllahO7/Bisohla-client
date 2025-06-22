import GlobalProvider from '@/providers/global.provider';
import '../../globals.css';
import { initConfigs } from '@/config';
import { Locale, routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import NextTopLoader from 'nextjs-toploader';
import { Cairo } from 'next/font/google';
import type { Metadata } from 'next';

const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Generate metadata based on locale
export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const { locale } = await params;
  
  const metadataContent = {
    
    en: {
      title: 'Bishola - Car Rental & Car Sales',
      description: 'Rent or buy your perfect car with Bishola. Premium car rental services and quality used cars for sale. Find the best deals on vehicles in your area.',
      keywords: 'car rental, car sales, rent a car, buy cars, vehicle rental, auto sales, cars for sale, car marketplace',
    },
    ar: {
      title: 'بسهولة - تأجير وبيع السيارات',
      description: 'استأجر أو اشتري سيارتك المثالية مع بسهولة. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع. اعثر على أفضل العروض للمركبات في منطقتك.',
      keywords: 'تأجير السيارات, بيع السيارات, استئجار سيارة, شراء السيارات, تأجير المركبات, مبيعات السيارات, سيارات للبيع, سوق السيارات',
    }
  };

  const content = metadataContent[locale] || metadataContent.en;

  return {
    icons: {
      icon: '/favicon.ico',

    },
    title: {
      template: `%s | ${locale === 'ar' ? 'بسهولة' : 'Bishola'}`,
      default: content.title,
    },
    description: content.description,
    keywords: content.keywords.split(', '),
    authors: [{ name: 'Bishola Team' }],
    creator: 'Bishola',
    publisher: 'Bishola',
    
    // Open Graph for social media sharing
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      url: 'https://bishola.com',
      title: content.title,
      description: content.description,
      siteName: locale === 'ar' ? 'بسهولة' : 'Bishola',
      images: [
        {
          url: 'https://bishola.com/og-image.jpg', // Add your actual image URL
          width: 1200,
          height: 630,
          alt: locale === 'ar' ? 'بسهولة - تأجير وبيع السيارات' : 'Bishola - Car Rental & Sales',
        },
      ],
    },
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: ['https://bishola.com/twitter-image.jpg'], // Add your actual image URL
      creator: '@bishola', // Add your Twitter handle if you have one
    },
    
    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Language alternates for SEO
    alternates: {
      canonical: `https://bishola.com/${locale}`,
      languages: {
        'en': 'https://bishola.com/en',
        'ar': 'https://bishola.com/ar',
      },
    },
    
    // App-specific metadata
    applicationName: 'Bishola',
    category: 'automotive',
    classification: 'Car Rental and Sales Platform',
    
    // Verification tags (add your actual verification codes)
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    
    // Additional SEO
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  initConfigs();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <head>
        {/* Additional custom meta tags */}
        <meta name="theme-color" content="#2C3C39" />
        <meta name="msapplication-TileColor" content="#2C3C39" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico?v=2" />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`bg-white text-primary ${cairo.className}`}>
        <NextIntlClientProvider messages={messages}>
          <GlobalProvider>
            <NextTopLoader color="#2C3C39" height={4} showSpinner={false} />
            {children}
          </GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}