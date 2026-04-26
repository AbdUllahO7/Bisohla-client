'use client';

import { useEffect, useState } from 'react';
import Box from '@/components/box/box';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';
import { useProductStatistics } from '@/hooks/use-product-statistics';
import FloatingShareButton from './FloatingShareButton';

interface ProductClientProps {
  carDataRes: ApiResponse<SelectCarListingDto>;
  isAuthenticated: boolean;
  locale: string;
  isProfileView: boolean;
}

const ProductClient = ({ carDataRes, isAuthenticated }: ProductClientProps) => {
  const carData = carDataRes.data;
  // Use the custom statistics hook
  const { handleContactClick, handleShareClick, isSharePending } =
    useProductStatistics({
      carId: carData?.id,
      carUserId: carData?.user?.id,
      componentType: 'desktop',
    });

  // Track recently viewed products
  useEffect(() => {
    if (carData?.id) {
      const STORAGE_KEY = 'bishola-recently-viewed';
      try {
        const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Handle both old (number) and new ({id, typeId}) formats
        const normalizedItems = storedItems.map((item: any) => 
          typeof item === 'number' ? { id: item, typeId: 1 } : item
        );
        
        const newItem = { id: carData.id, typeId: (carData as any).listingTypeId || 1 };
        const updatedItems = [
          newItem,
          ...normalizedItems.filter((item: any) => item.id !== carData.id),
        ].slice(0, 10);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Failed to update recently viewed:', error);
      }
    }
  }, [carData?.id]);

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData?.isFavorite ?? false,
  );

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
            user={carData.user}
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
        productTitle={carData.title}
        productPrice={
          carData.price
            ? `${carData.price} ${carData.currency || ''}`
            : undefined
        }
        productMake={carData.make?.name}
        productModel={carData.model?.name}
        productYear={carData.details?.year?.toString()}
        onShare={handleShareClick}
        isSharePending={isSharePending}
      />
    </div>
  );
};

export default ProductClient;
