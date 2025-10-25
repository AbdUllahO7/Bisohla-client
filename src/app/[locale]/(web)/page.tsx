import Box from '@/components/box/box';
import AdsSection from '@/components/web/Home/AdsSection';
import FAQ from '@/components/web/Home/FAQ';

import Hero from '@/components/web/Home/Hero';
import LatestOffers from '@/components/web/Home/LatestOffers';
import RentCar from '@/components/web/Home/RentProduct';
import SpaceAds from '@/components/web/Home/SpaceAds';
import WorldOfCar from '@/components/web/Home/WorldOfProduct';
import { Locale } from '@/i18n/routing';
import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper';

// Generate metadata based on locale and settings
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  try {
    // Use settings-based metadata generation
    return await generateSettingsBasedMetadata('home');
  } catch (error) {
    console.error(
      'Error generating settings-based metadata, falling back to default:',
      error,
    );

    // Fallback to hardcoded metadata if settings fail
    const metadataContent = {
      en: {
        title: 'Bishola - Car Rental & Car Sales',
        description:
          'Rent or buy your perfect car with Bishola. Premium car rental services and quality used cars for sale. Find the best deals on vehicles in your area.',
        keywords:
          'car rental, car sales, rent a car, buy cars, vehicle rental, auto sales, cars for sale, car marketplace',
      },
      ar: {
        title: 'بسهولة - تأجير وبيع السيارات',
        description:
          'استأجر أو اشتري سيارتك المثالية مع بسهولة. خدمات تأجير السيارات المميزة والسيارات المستعملة عالية الجودة للبيع. اعثر على أفضل العروض للمركبات في منطقتك.',
        keywords:
          'تأجير السيارات, بيع السيارات, استئجار سيارة, شراء السيارات, تأجير المركبات, مبيعات السيارات, سيارات للبيع, سوق السيارات',
      },
    };

    const content = metadataContent[locale as Locale] || metadataContent.en;

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
            url: 'https://bishola.com/og-image.jpg',
            width: 1200,
            height: 630,
            alt:
              locale === 'ar'
                ? 'بسهولة - تأجير وبيع السيارات'
                : 'Bishola - Car Rental & Sales',
          },
        ],
      },
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: content.title,
        description: content.description,
        images: ['https://bishola.com/twitter-image.jpg'],
        creator: '@bishola',
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
          en: 'https://bishola.com/en',
          ar: 'https://bishola.com/ar',
        },
      },

      // App-specific metadata
      applicationName: 'Bishola',
      category: 'automotive',
      classification: 'Car Rental and Sales Platform',

      // Additional SEO
      other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
      },
    };
  }
}

const WebPage = async () => {
  return (
    <AnimatedPageWrapper>
      <Box variant="column" className="gap-10 w-full bg-background">
        <Hero />
        <LatestOffers />
        <AdsSection />
        <WorldOfCar />
        <RentCar />
        <SpaceAds />
        <FAQ />
      </Box>
    </AnimatedPageWrapper>
  );
};

export default WebPage;
