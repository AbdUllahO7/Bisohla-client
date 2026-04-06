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
import { useAdSlot } from '@/hooks/use-ad-slot';

import { motion } from 'framer-motion';

const RentProduct = () => {
  const t = useTranslations('homePage');
  const session = useSession();
  const { adsData, isLoadingAds } = useAdSlot('rent-page-ad-section');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

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

        {/* Display Rental Cards */}
        {!isLoading && !error && rentListings.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[90%] xs:w-[90%] lg:w-full mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {(() => {
                const items: any[] = [];
                let adIndexCounter = 0;
                
                rentListings.forEach((product: any, index: number) => {
                  items.push({ type: 'product', data: product, originalIndex: index });
                  
                  let showAd = false;
                  let baseAdIndex = -1;

                  if (adsData.length === 0) {
                      if (index === 3) { showAd = true; baseAdIndex = 0; }
                  } else if (adsData.length === 1) {
                      if (index === 3) { showAd = true; baseAdIndex = 0; }
                  } else {
                      if (index === 1) { showAd = true; baseAdIndex = 0; }
                      else if (index === 3) { showAd = true; baseAdIndex = 1; }
                      else if (index === 5) { showAd = true; baseAdIndex = 2; }
                      else if (index === 7) { showAd = true; baseAdIndex = 3; }
                  }

                  if (showAd) {
                     items.push({ type: 'ad', baseAdIndex });
                     adIndexCounter = Math.max(adIndexCounter, baseAdIndex + 1);
                  }
                });

                while (adIndexCounter < adsData.length) {
                  items.push({ type: 'ad', baseAdIndex: adIndexCounter });
                  adIndexCounter++;
                }

                return items.map((item, i) => {
                  if (item.type === 'product') {
                    return (
                      <motion.div 
                        key={`product-${item.data.id || item.originalIndex}`}
                        className="w-full"
                        variants={itemVariants}
                      >
                        <RentProductCard
                          car={item.data}
                          priceWord={t('latestOffers.price')}
                        />
                      </motion.div>
                    );
                  } else {
                    const currentAdIndex = (item.baseAdIndex >= 0 && adsData.length > 0) ? item.baseAdIndex % adsData.length : item.baseAdIndex;
                    return (
                      <motion.div 
                        key={`ad-slot-${item.baseAdIndex}-${i}`}
                        className="w-full h-[370px] rounded-lg overflow-hidden"
                        variants={itemVariants}
                      >
                        <AdSpace
                          name="rent-page-ad-section"
                          className="w-full h-full"
                          fallbackContent={<CardAds isRent={true} />}
                          isClosable={false}
                          adsData={adsData}
                          isLoadingAds={isLoadingAds}
                          adIndex={currentAdIndex}
                        />
                      </motion.div>
                    );
                  }
                });
            })()}
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default RentProduct;

