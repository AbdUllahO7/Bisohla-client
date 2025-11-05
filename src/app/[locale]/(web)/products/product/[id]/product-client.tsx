'use client';

import { useState, useEffect } from 'react';
import Box from '@/components/box/box';
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

const ProductClient = ({
  carDataRes,
  isAuthenticated,
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

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData?.isFavorite ?? false,
  );

  // 📊 TRACKING 1: Track basic page view count on mount (once per visit)
  useEffect(() => {
    if (carData?.id && !hasTrackedView) {
      console.log('🚀 [DESKTOP] Sending view count request...', { carListingId: carData.id });
      incrementViewCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [DESKTOP] View count tracked');
            setHasTrackedView(true);
          },
          onError: (error) => {
            console.error('❌ [DESKTOP] Failed to track view count:', error);
            setHasTrackedView(true);
          },
        }
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
      console.log('🚀 [DESKTOP] Sending details viewed count request...', { carListingId: carData.id });
      incrementDetailsViewedCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [DESKTOP] Details viewed count tracked');
            setHasTrackedDetailsViewed(true);
          },
          onError: (error) => {
            console.error('❌ [DESKTOP] Failed to track details viewed count:', error);
            setHasTrackedDetailsViewed(true);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData?.id, hasTrackedDetailsViewed]);

  // 📊 TRACKING 3: Track view duration periodically and on unmount
  useEffect(() => {
    if (!viewStartTime || !carData?.id) return;

    // Send duration every 30 seconds
    const interval = setInterval(() => {
      const durationInSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
      if (durationInSeconds > 0) {
        console.log('🚀 [DESKTOP] Sending view duration update request...', { 
          carListingId: carData.id, 
          durationInSeconds 
        });
        updateViewDuration.mutate(
          { carListingId: carData.id, durationInSeconds },
          {
            onSuccess: () => {
              console.log(`✅ [DESKTOP] View duration updated: ${durationInSeconds}s`);
              // 🔄 Reset timer to 0 after sending request
              setViewStartTime(Date.now());
              console.log('🔄 [DESKTOP] Timer reset to 0, starting again...');
            },
            onError: (error) => {
              console.error('❌ [DESKTOP] Failed to update view duration:', error);
            },
          }
        );
      }
    }, 30000);

    // Send final duration on unmount
    return () => {
      clearInterval(interval);

      const finalDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      if (finalDuration > 0) {
        console.log('🚀 [DESKTOP] Sending final view duration request...', { 
          carListingId: carData.id, 
          durationInSeconds: finalDuration 
        });
        updateViewDuration.mutate({
          carListingId: carData.id,
          durationInSeconds: finalDuration,
        });
        console.log(`✅ [DESKTOP] Final view duration: ${finalDuration}s`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStartTime, carData?.id]);

  // 🔄 RESET: Reset all tracking states on unmount
  useEffect(() => {
    return () => {
      console.log('🔄 [DESKTOP] Resetting all tracking states on unmount');
      setHasTrackedView(false);
      setHasTrackedContact(false);
      setHasTrackedDetailsViewed(false);
      setViewStartTime(null);
    };
  }, []);

  // 📊 TRACKING 4: Track contact button clicks
  const handleContactClick = () => {
    if (carData?.id && !hasTrackedContact) {
      console.log('🚀 [DESKTOP] Sending contact count request...', { carListingId: carData.id });
      incrementContactCount.mutate(
        { carListingId: carData.id },
        {
          onSuccess: () => {
            console.log('✅ [DESKTOP] Contact count tracked');
            setHasTrackedContact(true);
          },
          onError: (error) => {
            console.error('❌ [DESKTOP] Failed to track contact count:', error);
            setHasTrackedContact(true);
          },
        }
      );
    }
  };

  if (!carData) {
    return <>no car data</>;
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
    <div className="bg-background w-full mb-5 mt-5 hidden md:block">
      <Box variant="container" className="w-full mb-2">
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

      {/* Sticky Product Header */}
      <div className="sticky top-[95px] z-50 w-full mb-3 bg-white shadow-md">
        <Box variant="container">
          <ProductHeader
            saveStatus={carData.saveStatus}
            productName={carData.title}
            ContactNumber={carData.contactNumber?.toString()}
            price={carData.price?.toString() || ''}
            currency={carData.currency}
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
                currency={carData.currency}
                adsNumber={carData.id?.toString() || ''}
                adsDate={carData.publishedAt?.toString() || ''}
              />
            </Box>

            <Box className="lg:flex-1 xs:w-full">
              <ProductImages isLoading={false} images={carData.images || []} />
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="lg:w-full xs:w-[90%] mt-5">
          <TabsSection data={carDataRes} isLoading={false} />
        </Box>
      </Box>

      {/* Floating Share Button with enhanced data */}
      <FloatingShareButton
        carListingId={carData.id}
        productTitle={carData.title}
        productPrice={carData.price ? `${carData.price} ${carData.currency || ''}` : undefined}
        productMake={carData.make?.name}
        productModel={carData.model?.name}
        productYear={carData.details?.year?.toString()}
      />
    </div>
  );
};

export default ProductClient;
