'use client';

import { useEffect, useState } from 'react';
import { cacheListing } from '@/utils/offline-favorites-manager';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
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

const MobileProductClient = ({
  carDataRes,
  rawListing,
  attributeSections,
  isAuthenticated,
  isProfileView,
}: ProductClientProps) => {
  const carData = carDataRes.data;

  const { quickSpecs, sections: detailSections } = splitQuickSpecs(attributeSections);
  const infoRows = useProductInfoRows(rawListing);

  // Use the custom statistics hook
  const { handleContactClick, handleShareClick, isSharePending } = useProductStatistics({
    carId: carData?.id,
    carUserId: carData?.user?.id,
    componentType: 'mobile',
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
    return (
      <Box variant="center" className="min-h-screen">
        <Text variant="p">No listing data available</Text>
      </Box>
    );
  }

  // Handle favorite toggle from child component
  const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(isFavorite);
  };

  // Breadcrumb — use listing type name for non-car types
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
      <div className="md:hidden w-full mb-3 bg-white dark:bg-zinc-950 my-4">
        <Box variant="container" className="py-3">
          <Box variant="column" className="w-full gap-3">
            {/* Action Buttons - Full Width */}
            <ProductHeader
              saveStatus={carData.saveStatus as any}
              productName={carData.title}
              price={carData.price?.toString() || ''}
              currency={carData.currency}
              ContactNumber={carData.contactNumber?.toString()}
            contactAvailable={carData.contactAvailable}
              isLoading={false}
              productId={rawListing?.id || carData.id}
              isMarkedFavorite={favoriteStatus}
              isAuthenticated={isAuthenticated}
              onFavoriteToggle={handleFavoriteToggle}
              onContactClick={handleContactClick}
              user={carData.user}
            />
          </Box>
        </Box>
      </div>

      {/* Mobile: Basic Info Cards */}
      <div className="md:hidden w-full mb-4">
        <Box variant="container">
          <AttributeGrid rows={quickSpecs} />
        </Box>
      </div>

      {/* Mobile: Product Info Card */}
      {infoRows.length > 0 && (
        <div className="md:hidden w-full mb-4">
          <Box variant="container">
            <ProductInfo isLoading={false} rows={infoRows} />
          </Box>
        </div>
      )}

      {/* Mobile: Installment Plans Summary */}
      {carData.installmentsAvailable && Array.isArray(carData.installmentPlans) && carData.installmentPlans.length > 0 && carData.saveStatus !== 'sold' && (
        <div className="md:hidden w-full mb-4">
          <Box variant="container">
            <InstallmentsSummaryRow
              plans={carData.installmentPlans}
              currency={carData.currency || 'USD'}
            />
          </Box>
        </div>
      )}

      {/* Mobile: Tabs Section */}
      <div className="md:hidden w-full mb-20">
        <Box variant="container">
          <TabsSection
            data={carDataRes}
            isLoading={false}
            attributeSections={detailSections}
            listingTypeSlug={rawListing?.listingType?.slug}
          />
        </Box>
      </div>

      {/* Desktop: Original Layout (kept for safety, hidden on mobile) */}
      <div className="hidden md:block">
        <div className="w-full mb-3 bg-white dark:bg-zinc-950">
          <Box variant="container">
            <ProductHeader
              productName={carData.title}
              ContactNumber={carData.contactNumber?.toString()}
            contactAvailable={carData.contactAvailable}
              isLoading={false}
              productId={rawListing?.id || carData.id}
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
            <AttributeGrid rows={quickSpecs} />
          </Box>

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
                <ProductImages
                  isLoading={false}
                  images={carData.images || []}
                />
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
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton
        productTitle={carData.title}
        onShare={handleShareClick}
        isSharePending={isSharePending}
      />
    </div>
  );
};

export default MobileProductClient;
