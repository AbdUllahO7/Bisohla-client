'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import React from 'react';
import { RentProductCard } from '../design/RentProductCard';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import SectionHeader from '@/components/SectionHeader';
import { Car } from 'lucide-react';
import AdSpace from '@/components/ads/AdSpace';
import CardAds from '../design/CardAds';

const RentProduct = () => {
  const t = useTranslations('homePage');
  const session = useSession();

  // Fetch rental car listings data with filter for listingType = 'for_rent'
  const { data, isLoading, error } = useCarListings({
    userId: session.user?.id,
    filterGroups: [
      {
        operator: 'and',
        filters: [
          {
            field: 'listingType',
            operator: 'eq',
            value: 'for_rent',
          },
        ],
      },
    ],
    // Also keep the where filter for compatibility
    where: [
      {
        field: 'listingType',
        operator: 'eq',
        value: 'for_rent',
      },
    ],
  });

  // Extract and limit rental car listings (no side effects in useMemo)
  const rentListings = React.useMemo(() => {
    const listings = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
        ? data.data.data
        : [];

    return listings.slice(0, 9);
  }, [data]);

  return (
    <Box variant="container" className="mb-10">
      <Box variant="column">
        <SectionHeader
          title={t('rentProduct.title')}
          icon={Car}
          showMoreText={t('rentProduct.showMore')}
          showMoreLink="/products"
        />
        {/* Show loading state */}
        {isLoading && <ProductSkeleton showTitle={false} />}

        {/* Show error state */}
        {error && (
          <Box className="w-full py-4" variant="center">
            <Text className="text-red-500">Failed to load rental listings</Text>
          </Box>
        )}

        {/* Show empty state */}
        {/*  {!isLoading && !error && rentListings.length === 0 && (
                    <Box className="w-full py-4" variant="center">
                        <Text>No rental listings available</Text>
                    </Box>
                )} */}

        {/* Display Rental Cards */}
        {!isLoading && !error && rentListings.length > 0 && (
          <Box
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[90%] xs:w-[90%] lg:w-full"
            variant="center"
          >
            {rentListings.map((product, index) => (
              <React.Fragment key={product.id || index}>
                {/* Card wrapper with fixed dimensions */}
                <div className="w-full">
                  <RentProductCard
                    car={product}
                    priceWord={t('latestOffers.price')}
                  />
                </div>
                {index === 3 && (
                  <div className="w-full h-[370px] rounded-lg overflow-hidden">
                    <AdSpace
                      name="rent-page-ad-section"
                      className="w-full h-full"
                      fallbackContent={<CardAds isRent={true} />}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RentProduct;
