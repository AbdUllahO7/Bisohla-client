'use client';
import React from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { useLocale, useTranslations } from 'next-intl';
import { useListings } from '@/core/infrastructure-adapters/use-actions/visitors/listing.visitor.use-actions';
import { useSession } from '@/hooks/auth/use-session';
import SectionHeader from '@/components/shared/SectionHeader';
import { CarFrontIcon } from 'lucide-react';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import ProductSkeleton from '../../design/ProductSkeletonItem';
import { RentProductCard } from '../../design/RentProductCard';
import CardAds from '../../design/CardAds';
import { logger } from '@/lib/logger';
import AdSpace from '@/components/ads/AdSpace';
import { useAdSlot } from '@/hooks/use-ad-slot';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';

export interface SimilarAdsProps {
  count?: number; // Optional count of cards to display
  showTitle?: boolean; // Control the visibility of the title and "Show More" link
  container?: boolean;
  title?: string;
  car: SelectCarListingDto;
}

const SimilarAds: React.FC<SimilarAdsProps> = ({
  count,
  title,
  showTitle = true,
  container = true,
  car,
}) => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const session = useSession();
  const { adsData, isLoadingAds, allowPlaceholders, dismissable, rotationStrategy } = useAdSlot('sale-page-ads-section');

  const filterGroups = React.useMemo(() => {
    const groups: any[] = [
      {
        operator: 'and',
        filters: [
          {
            field: 'id',
            operator: 'neq',
            value: car.id,
          },
          {
            field: 'listingOfferType',
            operator: 'eq',
            value: (car.listingType || car.listingOfferType || 'for_sale') as string,
          },
        ],
      },
    ];

    const makeId = Number(car.makeId || car.make?.id || 0);
    if (makeId > 0) {
      groups.push({
        operator: 'and',
        filters: [
          {
            field: 'attrs.make',
            operator: 'eq',
            value: makeId,
          },
        ],
      });
    }

    return groups;
  }, [car]);

  // Fetch listings data dynamically based on the listing type (e.g. Cars, etc.)
  const { data, isLoading, error } = useListings(car.listingTypeId || 1, {
    page: 1,
    pageSize: count || 9,
    userId: session?.user?.id,
    include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
    filterGroups,
  });

  logger.log('SimilarAds generic listings data:', data);

  // Extract and limit car listings (no side effects in useMemo)
  const carListings = React.useMemo(() => {
    const apiData = data as any;
    if (!apiData) return [];

    let listings: any[] = [];
    if (apiData.data && Array.isArray(apiData.data.data)) {
      listings = apiData.data.data;
    } else if (Array.isArray(apiData.data)) {
      listings = apiData.data;
    } else if (Array.isArray(apiData)) {
      listings = apiData;
    }

    // Normalize each listing to ensure consistent DTO structure for RentProductCard
    const normalized = listings.map((item: any) => normalizeListingToCarDto(item, locale));
    const limit = count || 9;
    return normalized.slice(0, limit);
  }, [data, count, locale]);

  return (
    <div className="relative overflow-hidden py-16 w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large Gradient Orbs */}

        <div
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-float"
          style={{
            background:
              'radial-gradient(circle, rgba(171, 222, 59, 0.3) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        ></div>
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-20 animate-float"
          style={{
            background:
              'radial-gradient(circle, rgba(44, 60, 57, 0.2) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        ></div>

        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#198341 1px, transparent 1px), linear-gradient(90deg, #198341 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>

        {/* Animated Dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse"></div>
        <div
          className="absolute top-40 right-1/3 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-32 left-1/2 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      {/* Content with Glass Effect */}
      <Box
        variant={`${container ? 'container' : 'center'}`}
        className="relative z-10"
      >
        <Box variant="column" className="w-full">
          {showTitle && (
            <div className="relative">
              {/* Glow Effect Behind Header */}
              <div
                className="absolute -top-10 left-0 right-0 h-40 opacity-30 blur-3xl -z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(171, 222, 59, 0.4) 0%, transparent 70%)',
                }}
              ></div>

              <SectionHeader
                title={title ? title : t('latestOffers.title')}
                icon={CarFrontIcon}
                showMoreLink={`/products?listingTypeId=${car.listingTypeId || 1}&listingOfferType=${car.listingType || car.listingOfferType || 'for_sale'}`}
                showMoreText={t('latestOffers.showMore')}
              />
            </div>
          )}

          {/* Show loading skeleton */}
          {isLoading && (
            <ProductSkeleton count={count || 8} showTitle={false} />
          )}

          {/* Show error state */}
          {error && (
            <Box
              className="w-full py-8 px-6 rounded-2xl backdrop-blur-sm"
              variant="center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 0, 0, 0.2)',
              }}
            >
              <Text className="text-red-500 font-semibold">
                Failed to load car listings
              </Text>
            </Box>
          )}

          {/* Show empty state */}
          {!isLoading && !error && carListings.length === 0 && (
            <Box
              className="w-full py-12 px-6 rounded-2xl backdrop-blur-sm"
              variant="center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(171, 222, 59, 0.05) 0%, rgba(25, 131, 65, 0.05) 100%)',
                border: '2px dashed rgba(25, 131, 65, 0.3)',
              }}
            >
              <div className="text-center">
                <CarFrontIcon
                  className="w-16 h-16 mx-auto mb-4 opacity-30 text-[#198341] dark:text-[#ABDE3B]"
                />
                <Text className="text-gray-500 dark:text-zinc-400 text-lg">
                  No car listings available
                </Text>
              </div>
            </Box>
          )}

          {/* Display actual cards when data is loaded */}
          {!isLoading && !error && carListings.length > 0 && (
            <Box
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showTitle ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
                } gap-6 sm:w-[90%] xs:w-[90%] lg:w-full`}
              variant="center"
            >
              {(() => {
                const items: any[] = [];
                let adIndexCounter = 0;
                const showPlaceholder = allowPlaceholders !== true;
                
                carListings.forEach((card: any, index: number) => {
                  items.push({ type: 'product', data: card, originalIndex: index });
                  
                  let showAd = false;
                  let baseAdIndex = -1;

                  if (adsData.length === 0) {
                      if (showPlaceholder && index === 1) { showAd = true; baseAdIndex = 0; }
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

                if (showPlaceholder || adsData.length > 0) {
                  const targetAdsLimit = Math.max(adsData.length, showPlaceholder ? 1 : 0);
                  while (adIndexCounter < targetAdsLimit) {
                    items.push({ type: 'ad', baseAdIndex: adIndexCounter });
                    adIndexCounter++;
                  }
                }

                return items.map((item, i) => {
                  if (item.type === 'product') {
                    return (
                      <React.Fragment key={`product-${item.data.id || item.originalIndex}`}>
                        {/* Card with Fade-in Animation */}
                        <div
                          className="animate-fadeInUp h-full w-full flex flex-col"
                          style={{
                            animationDelay: `${item.originalIndex * 0.1}s`,
                            animationFillMode: 'both',
                          }}
                        >
                          <RentProductCard
                            car={item.data}
                            priceWord={t('latestOffers.price')}
                          />
                        </div>
                      </React.Fragment>
                    );
                  } else {
                    const currentAdIndex = (item.baseAdIndex >= 0 && adsData.length > 0) ? item.baseAdIndex % adsData.length : item.baseAdIndex;
                    return (
                      <AdSpace 
                        key={`ad-slot-${item.baseAdIndex}-${i}`}
                        name="sale-page-ads-section" 
                        isClosable={false}
                        fallbackContent={<CardAds isRent={false} />}
                        adsData={adsData}
                        isLoadingAds={isLoadingAds}
                        adIndex={currentAdIndex}
                        allowPlaceholders={allowPlaceholders}
                        dismissable={dismissable}
                        rotationStrategy={rotationStrategy}
                        wrapperClassName="w-full h-full min-h-[395px] animate-fadeInUp flex flex-col items-stretch"
                        layout="card"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          animationFillMode: 'both',
                        }}
                      />
                    );
                  }
                });
              })()}
            </Box>
          )}
        </Box>
      </Box>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.05);
          }
          50% {
            transform: translate(-15px, -40px) scale(0.95);
          }
          75% {
            transform: translate(-25px, -15px) scale(1.02);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
          opacity: 0;
        }

        /* Pulse animation for dots */
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SimilarAds;
