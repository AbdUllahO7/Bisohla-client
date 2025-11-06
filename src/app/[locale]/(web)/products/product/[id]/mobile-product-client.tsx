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

  console.log('🎬 [MOBILE] MobileProductClient rendered', { 
    carId: carData?.id, 
    carTitle: carData?.title,
    isAuthenticated,
    locale 
  });

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

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData?.isFavorite ?? false,
  );

  // 📊 TRACKING 1: Track basic page view count on mount (once per visit)
  useEffect(() => {
    console.log('🔍 client [MOBILE] TRACKING 1 Effect running', { 
      hasCarId: !!carData?.id, 
      carId: carData?.id,
      hasTrackedView,
      incrementViewCountReady: !!incrementViewCount
    });

    if (carData?.id && !hasTrackedView) {
      console.log('🚀 [MOBILE] Sending view count request...', { carListingId: carData.id });
      incrementViewCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [MOBILE] View count tracked');
            setHasTrackedView(true);
          },
          onError: (error) => {
            console.error('❌ [MOBILE] Failed to track view count:', error);
            setHasTrackedView(true);
          },
        }
      );

      // Start tracking view duration
      setViewStartTime(Date.now());
      console.log('⏱️ [MOBILE] View duration timer started');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData?.id, hasTrackedView]);

  // 📊 TRACKING 2: Track details viewed count on mount (once per visit)
  // This tracks when a user actually visits and views the product details page
  useEffect(() => {
    console.log('🔍 [MOBILE] TRACKING 2 Effect running', { 
      hasCarId: !!carData?.id, 
      carId: carData?.id,
      hasTrackedDetailsViewed,
      incrementDetailsViewedCountReady: !!incrementDetailsViewedCount
    });

    if (carData?.id && !hasTrackedDetailsViewed) {
      console.log('🚀 [MOBILE] Sending details viewed count request...', { carListingId: carData.id });
      incrementDetailsViewedCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [MOBILE] Details viewed count tracked');
            setHasTrackedDetailsViewed(true);
          },
          onError: (error) => {
            console.error('❌ [MOBILE] Failed to track details viewed count:', error);
            setHasTrackedDetailsViewed(true);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData?.id, hasTrackedDetailsViewed]);

  // 📊 TRACKING 3: Track view duration periodically and on unmount
  useEffect(() => {
    console.log('🔍 [MOBILE] TRACKING 3 Effect running', { 
      hasViewStartTime: !!viewStartTime, 
      viewStartTime,
      hasCarId: !!carData?.id,
      carId: carData?.id,
      updateViewDurationReady: !!updateViewDuration
    });

    if (!viewStartTime || !carData?.id) {
      console.log('⚠️ [MOBILE] View duration tracking skipped - missing data');
      return;
    }

    console.log('✅ [MOBILE] View duration tracking started');

    // Send duration every 30 seconds
    const interval = setInterval(() => {
      const durationInSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
      if (durationInSeconds > 0) {
        console.log('🚀 [MOBILE] Sending view duration update request...', { 
          carListingId: carData.id, 
          durationInSeconds 
        });
        updateViewDuration.mutate(
          { carListingId: carData.id, durationInSeconds },
          {
            onSuccess: () => {
              console.log(`✅ [MOBILE] View duration updated: ${durationInSeconds}s`);
              // 🔄 Reset timer to 0 after sending request
              setViewStartTime(Date.now());
              console.log('🔄 [MOBILE] Timer reset to 0, starting again...');
            },
            onError: (error) => {
              console.error('❌ [MOBILE] Failed to update view duration:', error);
            },
          }
        );
      }
    }, 30000); // Every 30 seconds

    // Send final duration on unmount
    return () => {
      console.log('🧹 [MOBILE] View duration cleanup running');
      clearInterval(interval);

      const finalDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      if (finalDuration > 0) {
        console.log('🚀 [MOBILE] Sending final view duration request...', { 
          carListingId: carData.id, 
          durationInSeconds: finalDuration 
        });
        updateViewDuration.mutate({
          carListingId: carData.id,
          durationInSeconds: finalDuration,
        });
        console.log(`✅ [MOBILE] Final view duration: ${finalDuration}s`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStartTime, carData?.id]);

  // 🔄 RESET: Reset all tracking states on unmount
  useEffect(() => {
    return () => {
      console.log('🔄 [MOBILE] Resetting all tracking states on unmount');
      setHasTrackedView(false);
      setHasTrackedContact(false);
      setHasTrackedDetailsViewed(false);
      setViewStartTime(null);
    };
  }, []);

  // 📊 TRACKING 4: Track contact button clicks
  const handleContactClick = () => {
    console.log('🔍 [MOBILE] Contact button clicked', { 
      hasCarId: !!carData?.id,
      carId: carData?.id,
      hasTrackedContact,
      incrementContactCountReady: !!incrementContactCount
    });

    if (carData?.id && !hasTrackedContact) {
      console.log('🚀 [MOBILE] Sending contact count request...', { carListingId: carData.id });
      incrementContactCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [MOBILE] Contact count tracked');
            setHasTrackedContact(true);
          },
          onError: (error) => {
            console.error('❌ [MOBILE] Failed to track contact count:', error);
            setHasTrackedContact(true);
          },
        }
      );
    } else {
      console.log('⚠️ [MOBILE] Contact click not tracked', {
        reason: !carData?.id ? 'No car ID' : 'Already tracked'
      });
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