'use client';

import { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';
import {
  useIncrementContactCount,
  useIncrementViewCount,
  useIncrementDetailsViewedCount,
  useUpdateViewDuration,
} from '@/hooks/use-carStatistics';
import FloatingShareButton from './FloatingShareButton';

interface ProductClientProps {
  carDataRes: ApiResponse<SelectCarListingDto>;
  isAuthenticated: boolean;
  locale: string;
  isProfileView: boolean;
}

const MobileProductClient = ({
  carDataRes,
  isAuthenticated,
  locale,
  isProfileView,
}: ProductClientProps) => {
  const carData = carDataRes.data;

  // Statistics tracking hooks
  const incrementViewCount = useIncrementViewCount();
  const incrementContactCount = useIncrementContactCount();
  const incrementDetailsViewedCount = useIncrementDetailsViewedCount();
  const updateViewDuration = useUpdateViewDuration();

  // State management for tracking
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedContact, setHasTrackedContact] = useState(false);
  const [hasTrackedDetailsViewed, setHasTrackedDetailsViewed] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [totalViewDuration, setTotalViewDuration] = useState(0); // Track total accumulated duration in seconds

  const MAX_TRACKING_DURATION = 600; // 10 minutes in seconds

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData?.isFavorite ?? false,
  );

  // 📊 TRACKING 1: Track basic page view count on mount (once per visit)
  useEffect(() => {
    if (carData?.id && !hasTrackedView) {
      incrementViewCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            setHasTrackedView(true);
          },
          onError: (error) => {
            setHasTrackedView(true);
          },
        },
      );

      // Start tracking view duration
      setViewStartTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData?.id, hasTrackedView]);

  // 📊 TRACKING 2: Track details viewed count on mount (once per visit)
  // This tracks when a user actually visits and views the product details page
  useEffect(() => {
    if (carData?.id && !hasTrackedDetailsViewed) {
      incrementDetailsViewedCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            setHasTrackedDetailsViewed(true);
          },
          onError: (error) => {
            setHasTrackedDetailsViewed(true);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData?.id, hasTrackedDetailsViewed]);

  // 📊 TRACKING 3: Track view duration periodically and on unmount
  useEffect(() => {
    if (!viewStartTime || !carData?.id) {
      return;
    }

    // Send duration every 30 seconds
    const interval = setInterval(() => {
      // Check if we've already reached max tracking duration
      if (totalViewDuration >= MAX_TRACKING_DURATION) {
        console.log(
          '✅ [MOBILE] Max tracking duration reached (10 minutes), stopping requests',
        );
        return;
      }

      const durationInSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
      if (durationInSeconds > 0) {
        // Calculate new total duration
        const newTotalDuration = totalViewDuration + durationInSeconds;

        // Only send if we haven't exceeded the max duration
        if (newTotalDuration <= MAX_TRACKING_DURATION) {
          updateViewDuration.mutate(
            { carListingId: carData.id, durationInSeconds },
            {
              onSuccess: () => {
                // Update total accumulated duration
                setTotalViewDuration(newTotalDuration);
                // Reset timer to 0 after sending request
                setViewStartTime(Date.now());
                console.log(
                  `📊 [MOBILE] Updated view duration. Total: ${newTotalDuration}s / ${MAX_TRACKING_DURATION}s`,
                );
              },
              onError: (error) => {
                console.error(
                  '❌ [MOBILE] Failed to update view duration:',
                  error,
                );
                // Still update total duration even on error to prevent infinite retries
                setTotalViewDuration(newTotalDuration);
                setViewStartTime(Date.now());
              },
            },
          );
        } else {
          console.log(
            `🛑 [MOBILE] Reached max duration (${newTotalDuration}s). No more requests will be sent.`,
          );
          setTotalViewDuration(MAX_TRACKING_DURATION);
        }
      }
    }, 30000); // Every 30 seconds

    // Send final duration on unmount
    return () => {
      clearInterval(interval);

      // Only send final duration if we haven't reached max duration
      if (totalViewDuration < MAX_TRACKING_DURATION) {
        const finalDuration = Math.floor((Date.now() - viewStartTime) / 1000);
        if (finalDuration > 0) {
          const newTotalDuration = totalViewDuration + finalDuration;

          // Cap at max duration
          const cappedDuration = Math.min(
            finalDuration,
            MAX_TRACKING_DURATION - totalViewDuration,
          );

          if (cappedDuration > 0) {
            updateViewDuration.mutate({
              carListingId: carData.id,
              durationInSeconds: cappedDuration,
            });
            console.log(
              `📊 [MOBILE] Final duration sent: ${cappedDuration}s. Total: ${newTotalDuration}s`,
            );
          }
        }
      } else {
        console.log(
          '✅ [MOBILE] Max duration already reached, skipping final duration update',
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStartTime, carData?.id, totalViewDuration]);

  // 🔄 RESET: Reset all tracking states on unmount
  useEffect(() => {
    return () => {
      setHasTrackedView(false);
      setHasTrackedContact(false);
      setHasTrackedDetailsViewed(false);
      setViewStartTime(null);
      setTotalViewDuration(0);
    };
  }, []);

  // 📊 TRACKING 4: Track contact button clicks
  const handleContactClick = () => {
    if (carData?.id && !hasTrackedContact) {
      incrementContactCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            setHasTrackedContact(true);
          },
          onError: (error) => {
            console.error('❌ [MOBILE] Failed to track contact count:', error);
            setHasTrackedContact(true);
          },
        },
      );
    }
  };

  if (!carData) {
    return (
      <Box variant="center" className="min-h-screen">
        <Text variant="p">No car data available</Text>
      </Box>
    );
  }

  // Handle favorite toggle from child component
  const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(isFavorite);
  };

  // Define breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Cars',
      arLabel: 'السيارات',
      href: '/products',
    },
    {
      label: carData.title,
    },
  ];

  return (
    <div className="bg-background w-full min-h-screen md:hidden">
      <Box className="w-full mb-2 py-5 px-8">
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

      {/* Mobile: Images First - Full Width */}
      <div className="md:hidden w-full mb-6">
        <ProductImages isLoading={false} images={carData.images || []} />
      </div>

      {/* Mobile: Title and Actions Header */}
      <div className="md:hidden w-full mb-3 bg-white my-4">
        <Box variant="container" className="py-3">
          <Box variant="column" className="w-full gap-3">
            {/* Action Buttons - Full Width */}
            <ProductHeader
              saveStatus={carData.saveStatus}
              productName={carData.title}
              price={carData.price?.toString() || ''}
              currency={carData.currency}
              ContactNumber={carData.contactNumber?.toString()}
              isLoading={false}
              productId={carData.id}
              isMarkedFavorite={favoriteStatus}
              isAuthenticated={isAuthenticated}
              onFavoriteToggle={handleFavoriteToggle}
              onContactClick={handleContactClick}
              user={carData.user}
            />
          </Box>
        </Box>
      </div>

      {/* Mobile: Basic Info Cards - Horizontal Scroll */}
      <div className="md:hidden w-full mb-4">
        <Box variant="container">
          <ProductBasicInfo
            isLoading={false}
            carType={carData.make?.name || ''}
            model={carData.model?.name || ''}
            controlType={carData.details?.transmission || ''}
            distance={carData.details?.mileage?.toString() || ''}
            modelYear={carData.details?.year?.toString() || ''}
            gaz={carData.details?.fuelType || ''}
            bodyType={carData.details?.bodyType || ''}
          />
        </Box>
      </div>

      {/* Mobile: Car Info in Card */}
      <div className="md:hidden w-full mb-4">
        <Box variant="container">
          <ProductInfo
            isLoading={false}
            carType={carData.make?.name || ''}
            model={carData.model?.name || ''}
            controlType={carData.details?.transmission || ''}
            distance={carData.details?.mileage?.toString() || ''}
            modelYear={carData.details?.year?.toString() || ''}
            gaz={carData.details?.fuelType || ''}
            price={carData.price?.toString() || ''}
            currency={carData.currency}
            adsNumber={carData.id?.toString() || ''}
            adsDate={carData.publishedAt?.toString() || ''}
          />
        </Box>
      </div>

      {/* Mobile: Tabs Section */}
      <div className="md:hidden w-full mb-20">
        <Box variant="container">
          <TabsSection data={carDataRes} isLoading={false} />
        </Box>
      </div>

      {/* Desktop: Original Layout */}
      <div className="hidden md:block">
        <div className="w-full mb-3 bg-white">
          <Box variant="container">
            <ProductHeader
              productName={carData.title}
              ContactNumber={carData.contactNumber?.toString()}
              isLoading={false}
              productId={carData.id}
              isMarkedFavorite={favoriteStatus}
              isAuthenticated={isAuthenticated}
              onFavoriteToggle={handleFavoriteToggle}
              onContactClick={handleContactClick}
            />
          </Box>
        </div>

        <Box variant="container">
          {/* Product Details Section */}
          <Box className="mt-1 w-full mb-3">
            <ProductBasicInfo
              isLoading={false}
              carType={carData.make?.name || ''}
              model={carData.model?.name || ''}
              controlType={carData.details?.transmission || ''}
              distance={carData.details?.mileage?.toString() || ''}
              modelYear={carData.details?.year?.toString() || ''}
              gaz={carData.details?.fuelType || ''}
              bodyType={carData.details?.bodyType || ''}
            />
          </Box>

          {/* Images and Info Section */}
          <Box className="w-full">
            <Box
              variant="row"
              className="w-full gap-4 items-start justify-start md:flex-wrap xs:flex-wrap xs:justify-center"
            >
              <Box className="xs:w-[90%] lg:w-fit">
                <ProductInfo
                  isLoading={false}
                  carType={carData.make?.name || ''}
                  model={carData.model?.name || ''}
                  controlType={carData.details?.transmission || ''}
                  distance={carData.details?.mileage?.toString() || ''}
                  modelYear={carData.details?.year?.toString() || ''}
                  gaz={carData.details?.fuelType || ''}
                  price={carData.price?.toString() || ''}
                  adsNumber={carData.id?.toString() || ''}
                  adsDate={carData.publishedAt?.toString() || ''}
                />
              </Box>

              <Box className="lg:flex-1 xs:w-full">
                <ProductImages
                  isLoading={false}
                  images={carData.images || []}
                />
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Box className="lg:w-full xs:w-[90%] mt-5">
            <TabsSection data={carDataRes} isLoading={false} />
          </Box>
        </Box>
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton
        carListingId={carData.id}
        productTitle={carData.title}
      />
    </div>
  );
};

export default MobileProductClient;
