'use client';

import { useState } from 'react';
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
import { useLocale } from 'next-intl';

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
  const currentLocale = useLocale();
  const carData = carDataRes.data;

  if (!carData) {
    return (
      <Box variant="center" className="min-h-screen">
        <Text variant="p">No car data available</Text>
      </Box>
    );
  }

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData.isFavorite ?? false,
  );

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
        {/* Super simple breadcrumb usage! */}
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
              productName={carData.title}
              price={carData.price?.toString() || ''}
              currency={carData.currency}
              ContactNumber={carData.contactNumber?.toString()}
              isLoading={false}
              productId={carData.id}
              isMarkedFavorite={favoriteStatus}
              isAuthenticated={isAuthenticated}
              onFavoriteToggle={handleFavoriteToggle}
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
    </div>
  );
};

export default MobileProductClient;
