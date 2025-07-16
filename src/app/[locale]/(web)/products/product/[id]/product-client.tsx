'use client';

import { useState } from 'react';
import Box from '@/components/box/box';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';

interface ProductClientProps {
  carDataRes: ApiResponse<SelectCarListingDto>;
  isAuthenticated: boolean;
  locale: string;
  isProfileView: boolean;
}

const ProductClient = ({
  carDataRes,
  isAuthenticated,
  locale,
  isProfileView,
}: ProductClientProps) => {
  const carData = carDataRes.data;

  if (!carData) {
    return <>no car data</>;
  }

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData.isFavorite ?? false,
  );

  // Handle favorite toggle from child component
  const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(isFavorite);
  };

  // Define breadcrumb items - much cleaner!
  const breadcrumbItems = [
    {
      label: 'Cars',
      arLabel: 'السيارات',
      href: '/products',
    },
    {
      label: carData.title,
      // No href for the last item (current page)
    },
  ];

  return (
    <div className="bg-background w-full pb-10">
      <Box variant="container" className="w-full mb-2 pt-5">
        {/* Super simple breadcrumb usage! */}
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

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
              <ProductImages isLoading={false} images={carData.images || []} />
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="lg:w-full xs:w-[90%] mt-5">
          <TabsSection data={carDataRes} isLoading={false} />
        </Box>
      </Box>
    </div>
  );
};

export default ProductClient;
