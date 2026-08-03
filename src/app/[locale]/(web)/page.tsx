import Box from '@/components/ui/box';
import AdsSection from '@/components/web/Home/AdsSection';
import FAQ from '@/components/web/Home/FAQ';

import Hero from '@/components/web/Home/Hero';
import SpaceAds from '@/components/web/Home/SpaceAds';
import WorldOfCar from '@/components/web/Home/WorldOfProduct';
import { Locale } from '@/i18n/routing';
import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import AnimatedPageWrapper from '@/components/shared/AnimatedPageWrapper';
import NewsSection from '@/components/web/Home/NewsSection';
import RecentlyViewed from '@/components/web/Home/RecentlyViewed';
import { getInjection } from '@/di/container';
import DynamicListingSection from '@/components/web/Home/DynamicListingSection';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import TopSellersSection from '@/components/web/Home/TopSellersSection';
import { getTopSellers } from '@/core/infrastructure-adapters/actions/visitors/public-profile.actions';

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
  const listingTypesRepo = getInjection('IListingTypesRepo');
  const listingsVisitorRepo = getInjection('IListingsVisitorRepo');

  // Fetch initial independent resources in parallel
  const [listingTypesRes, locale, t, trendingRes, featuredRes, topSellersRes] =
    await Promise.all([
      listingTypesRepo.getListingTypes(),
      getLocale(),
      getTranslations('homePage'),
      listingsVisitorRepo.getTrendingListings({
        pageSize: 10,
        include:
          'attributeValues.attribute,images,user,listingType,listingTypeVersion',
      }),
      listingsVisitorRepo.getFeaturedListings(undefined, {
        pageSize: 10,
        include:
          'attributeValues.attribute,images,user,listingType,listingTypeVersion',
      }),
      getTopSellers(10, 1),
    ]);

  const listingTypes = (listingTypesRes.data?.data || []).sort(
    (a: any, b: any) => {
      const orderA = !a.order ? Infinity : Number(a.order);
      const orderB = !b.order ? Infinity : Number(b.order);
      if (orderA === orderB) return 0;
      return orderA - orderB;
    },
  );

  const trendingListings = (trendingRes.data?.data || []).map((item) =>
    normalizeListingToCarDto(item, locale),
  );

  const featuredListings = (featuredRes.data?.data || []).map((item) =>
    normalizeListingToCarDto(item, locale),
  );

  const topSellers = topSellersRes.data ?? [];

  // Build queries array for per-type listings to run concurrently
  const typeQueries: {
    type: any;
    title: string;
    adSlotName?: string;
    listingOfferType?: string;
    promise: Promise<any>;
  }[] = [];

  for (const type of listingTypes) {
    if (type.slug === 'cars') {
      typeQueries.push({
        type,
        title: `${type.name} - ${locale === 'ar' ? 'للبيع' : 'For Sale'}`,
        adSlotName: 'lateset-offers-card',
        listingOfferType: 'for_sale',
        promise: listingsVisitorRepo.searchListings(type.id, {
          pageSize: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          where: [
            {
              field: 'listingOfferType',
              operator: 'eq',
              value: 'for_sale',
            },
          ],
          include:
            'attributeValues.attribute,images,user,listingType,listingTypeVersion',
        }),
      });

      typeQueries.push({
        type,
        title: `${type.name} - ${locale === 'ar' ? 'للإيجار' : 'For Rent'}`,
        adSlotName: 'home page rent section ad',
        listingOfferType: 'for_rent',
        promise: listingsVisitorRepo.searchListings(type.id, {
          pageSize: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          where: [
            {
              field: 'listingOfferType',
              operator: 'eq',
              value: 'for_rent',
            },
          ],
          include:
            'attributeValues.attribute,images,user,listingType,listingTypeVersion',
        }),
      });
    } else {
      typeQueries.push({
        type,
        title: type.name,
        promise: listingsVisitorRepo.searchListings(type.id, {
          pageSize: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          include:
            'attributeValues.attribute,images,user,listingType,listingTypeVersion',
        }),
      });
    }
  }

  // Fetch all per-type listings in parallel
  const typeResults = await Promise.all(typeQueries.map((q) => q.promise));

  const typeFeaturedListings = typeQueries.map((query, index) => {
    const res = typeResults[index];
    return {
      type: query.type,
      title: query.title,
      listings: (res.data?.data || []).map((item: any) =>
        normalizeListingToCarDto(item, locale),
      ),
      adSlotName: query.adSlotName,
      listingOfferType: query.listingOfferType,
    };
  });

  return (
    <AnimatedPageWrapper>
      <Box variant="column" className="gap-10 w-full bg-background">
        <Hero />

        {/* Global Featured Section */}
        <DynamicListingSection
          listings={featuredListings}
          title={t('featuredListings')}
          iconName="star"
          adSlotName="home page featured section ad"
        />

        {/* Dynamic Sections per Listing Type */}
        {typeFeaturedListings.map(({ type, listings, title, adSlotName, listingOfferType }, index) => (
          <DynamicListingSection
            key={`${type.id}-${index}`}
            listings={listings}
            title={title}
            showMoreLink={`/products?listingTypeId=${type.id}${listingOfferType ? `&listingOfferType=${listingOfferType}` : ''}`}
            adSlotName={adSlotName}
          />
        ))}

        {/* Trending Section */}
        <DynamicListingSection
          listings={trendingListings}
          title={t('trendingListings')}
          iconName="trending"
          adSlotName="home page trending section ad"
        />

       
               {/* Top Sellers Section */}
        <TopSellersSection sellers={topSellers} />

        <AdsSection />
        <WorldOfCar />
        <SpaceAds />
        <NewsSection />
        <RecentlyViewed />
        <FAQ />
      </Box>
    </AnimatedPageWrapper>
  );
};

export default WebPage;
