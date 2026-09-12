'use client';

import { useEffect, useState } from 'react';
import { cacheListing } from '@/utils/offline-favorites-manager';
import Box from '@/components/ui/box';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';
import AttributeGrid from '@/components/web/ProductsPage/product/AttributeGrid';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo/ProductInfo';
import { useProductInfoRows } from '@/components/web/ProductsPage/product/ProductInfo/useProductInfoRows';
import { splitQuickSpecs, type DisplaySection } from '@/lib/listing-attributes/attribute-sections/attribute-sections';
import InstallmentsSummaryRow from '@/components/web/ProductsPage/product/InstallmentsSummaryRow';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericListingDto } from '@/core/entities/models/listings/generic-listing.dto';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { useProductStatistics } from '@/hooks/use-product-statistics';
import FloatingShareButton from './FloatingShareButton';

interface ProductClientProps {
  carDataRes: ApiResponse<SelectCarListingDto>;
  rawListing?: GenericListingDto | null;
  /** Schema-driven read model built server-side (see `buildListingAttributeSections`). */
  attributeSections: DisplaySection[];
  isAuthenticated: boolean;
  locale: string;
  isProfileView: boolean;
}

const ProductClient = ({ carDataRes, rawListing, attributeSections, isAuthenticated }: ProductClientProps) => {
  const carData = carDataRes.data;

  const { quickSpecs, sections: detailSections } = splitQuickSpecs(attributeSections);
  const infoRows = useProductInfoRows(rawListing);

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
        const normalizedItems = storedItems.map((item: any) =>
          typeof item === 'number' ? { id: item, typeId: 1 } : item
        );

        const newItem = { id: carData.id, typeId: (carData as any).listingTypeId || rawListing?.listingTypeId || 1 };
        const updatedItems = [
          newItem,
          ...normalizedItems.filter((item: any) => item.id !== carData.id),
        ].slice(0, 10);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Failed to update recently viewed:', error);
      }

      // Cache listing details for offline favorites lookup
      try {
        const imageSrc = carData.primaryImage || carData.images?.find((img: any) => img.isPrimary)?.url || carData.images?.[0]?.url || '/placeholder-car.jpg';
        cacheListing({
          id: carData.id,
          title: carData.title || '',
          price: Number(carData.price) || 0,
          listingOfferType: carData.listingOfferType || 'for_sale',
          makeName: carData.make?.name || '',
          imageSrc,
          slug: carData.slug || '',
        });
      } catch (err) {
        console.error('Failed to cache listing for offline support:', err);
      }
    }
  }, [carData, rawListing]);

  // Persist current category for back-button navigation
  useEffect(() => {
    const typeId = carData?.listingTypeId || (carData as any).listingTypeId || rawListing?.listingTypeId;
    if (typeId && typeof window !== 'undefined') {
      sessionStorage.setItem('lastListingTypeId', String(typeId));
    }
  }, [carData?.listingTypeId, rawListing?.listingTypeId]);

  const [favoriteStatus, setFavoriteStatus] = useState(
    carData?.isFavorite ?? false,
  );

  if (!carData) {
    return <>no listing data</>;
  }

  // Handle favorite toggle from child component
  const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(isFavorite);
  };

  // Define breadcrumb items — use listing type name for non-car types
  const listingTypeName = rawListing?.listingType?.name || 'Products';
  const breadcrumbItems = [
    {
      label: listingTypeName,
      arLabel: listingTypeName,
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
      <div className="sticky top-[95px] z-50 w-full mb-3 bg-white dark:bg-zinc-950 shadow-md">
        <Box variant="container">
          <ProductHeader
            saveStatus={carData.saveStatus as any}
            productName={carData.title}
            ContactNumber={carData.contactNumber?.toString()}
            contactAvailable={carData.contactAvailable}
            price={carData.price?.toString() || ''}
            currency={carData.currency}
            isLoading={false}
            productId={rawListing?.id || carData.id}
            isMarkedFavorite={favoriteStatus}
            isAuthenticated={isAuthenticated}
            onFavoriteToggle={handleFavoriteToggle}
            onContactClick={handleContactClick}
            user={carData.user}
          />
        </Box>
      </div>

      <Box variant="container">
        {/* Quick specs — first filled attributes of the schema's first section */}
        <Box className="mt-1 w-full mb-3">
          <AttributeGrid rows={quickSpecs} />
        </Box>

        {/* Installment Plans Summary */}
        {carData.installmentsAvailable && Array.isArray(carData.installmentPlans) && carData.installmentPlans.length > 0 && carData.saveStatus !== 'sold' && (
          <div className="w-full mb-3">
            <InstallmentsSummaryRow
              plans={carData.installmentPlans}
              currency={carData.currency || 'USD'}
            />
          </div>
        )}

        {/* Images and Info Section */}
        <Box className="w-full">
          <Box
            variant="row"
            className="w-full gap-4 items-start justify-start md:flex-wrap xs:flex-wrap xs:justify-center"
          >
            {infoRows.length > 0 && (
              <Box className="xs:w-[90%] lg:w-fit">
                <ProductInfo isLoading={false} rows={infoRows} />
              </Box>
            )}

            <Box className="lg:flex-1 xs:w-full">
              <ProductImages isLoading={false} images={carData.images || []} />
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="lg:w-full xs:w-[90%] mt-5">
          <TabsSection
            data={carDataRes}
            isLoading={false}
            attributeSections={detailSections}
            listingTypeSlug={rawListing?.listingType?.slug}
          />
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
        onShare={handleShareClick}
        isSharePending={isSharePending}
      />
    </div>
  );
};

export default ProductClient;
