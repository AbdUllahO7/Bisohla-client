'use client';
import Box from '@/components/box/box';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { ProductCardListView } from '@/components/web/design/ProductCardListView';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useMyCarListings } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import type { QueryParams } from '@/core/entities/api/api';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import MyProductsFilter from '@/components/dashboard/Products/MyProductsFilter';
import { EnhancedProductCardItem } from '@/components/web/design/ProductCardItemEnhanced';

// View mode type
type ViewMode = 'grid' | 'list';

const UserProductPage = () => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const session = useSession();

  // State management
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<number, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const pageSize = 12; // Increased for better pagination

  const [filterParams, setFilterParams] = useState<QueryParams>({
    page: 1,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  // Fetch user's car listings using the hook
  const { data, isLoading, error, refetch } = useMyCarListings({
    userId: session?.user?.id,
    page: filterParams.page || 1,
    pageSize: filterParams.pageSize || pageSize,
    sortBy: filterParams.sortBy || 'createdAt',
    sortDirection: filterParams.sortDirection || 'desc',
    filterGroups: filterParams.filterGroups,
    searchKey: filterParams.searchKey, // Add this
    searchTerm: filterParams.searchTerm, // Add this
  });
  useEffect(() => {
    console.log("useEffect");
    refetch();
  }, []); 
  // Handle filter changes from the simple filter component
  const handleFilterChange = useCallback((params: QueryParams) => {
    setFilterParams({
      ...params,
      page: 1, // Reset to first page when filters change
      pageSize: pageSize,
    });
    setCurrentPage(1);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Handle favorite status updates
  const handleFavoriteToggle = useCallback(
    (productId: number, isFavorite: boolean) => {
      setFavoriteStatuses((prev) => ({
        ...prev,
        [productId]: isFavorite,
      }));
    },
    [],
  );

  // Handle successful deletion
  const handleDelete = useCallback(
    (productId: number) => {
      // Refresh the listings to remove the deleted item
      refetch();
    },
    [refetch],
  );

  // Handle page change from pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilterParams((prev) => ({
      ...prev,
      page: page,
    }));
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Reset page when filters change
  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      page: currentPage,
    }));
  }, [currentPage]);

  // Prepare car listings for display
  const carListings = useMemo(() => {
    let listings: any[] = [];

    // Handle nested data structure if needed
    if (Array.isArray(data?.data)) {
      listings = data.data;
    } else if (Array.isArray(data?.data?.data)) {
      listings = data.data.data;
    }

    // Initialize favorite statuses from backend data if not already set
    const newFavoriteStatuses: Record<number, boolean> = {};
    listings.forEach((item) => {
      if (item.id && favoriteStatuses[item.id] === undefined) {
        newFavoriteStatuses[item.id] = !!item.isFavorite;
      }
    });

    // Update favorite statuses if we have new ones
    if (Object.keys(newFavoriteStatuses).length > 0) {
      setFavoriteStatuses((prev) => ({ ...prev, ...newFavoriteStatuses }));
    }

    return listings;
  }, [data, favoriteStatuses]);

  // Extract pagination metadata from response
  const paginationMeta = useMemo(() => {
    interface PaginationMeta {
      currentPage?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      totalItems?: number;
    }
    const meta = (data?.data || data || {}) as PaginationMeta;
    return {
      currentPage: meta.currentPage || currentPage,
      totalPages: meta.totalPages || 1,
      hasNextPage: meta.hasNextPage || false,
      hasPreviousPage: meta.hasPreviousPage || false,
      totalItems: meta.totalItems || carListings.length,
    };
  }, [data, currentPage, carListings.length]);

  return (
    <div className="space-y-6" dir={direction}>
      {/* Simple Filter Component */}
      <MyProductsFilter
        onChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
        totalItems={paginationMeta.totalItems}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Loading state */}
      {isLoading && (
        <ProductSkeleton
          count={viewMode === 'grid' ? 12 : 6}
          showTitle={false}
        />
      )}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              <Car className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                {direction === 'ltr'
                  ? 'Failed to Load Cars'
                  : 'فشل في تحميل السيارات'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {direction === 'ltr'
                  ? "We couldn't load your car listings. Please try again."
                  : 'لم نتمكن من تحميل قوائم سياراتك. يرجى المحاولة مرة أخرى.'}
              </p>
              <button
                onClick={handleRefresh}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {direction === 'ltr' ? 'Try Again' : 'حاول مرة أخرى'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && carListings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {direction === 'ltr' ? 'No Cars Yet' : 'لا توجد سيارات بعد'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {direction === 'ltr'
                ? "You haven't created any car listings yet. Add your first car to get started!"
                : 'لم تقم بإنشاء أي قوائم سيارات بعد. أضف سيارتك الأولى للبدء!'}
            </p>
            <Link href="/products/AddProducts">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                {direction === 'ltr' ? 'Add New Car' : 'إضافة سيارة جديدة'}
              </button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Display products */}
      {!isLoading && !error && carListings.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }
        >
          {carListings.map((car) => {
            // Get favorite status from local state or fallback to backend data
            const isFavorite =
              favoriteStatuses[car.id] !== undefined
                ? favoriteStatuses[car.id]
                : !!car.isFavorite;

            if (viewMode === 'list') {
              // Use the new ProductCardListView for list mode
              return (
                <ProductCardListView
                  key={car.id}
                  carListing={car}
                  isMarkedFavorite={isFavorite}
                  onFavoriteToggle={handleFavoriteToggle}
                  showFavorites={false} // Don't show favorites in user's own listings
                  profile={true}
                  onDelete={handleDelete}
                  isAuthenticated={true}
                  isMine={true}
                />
              );
            }

            // Grid view - use existing ProductCardItem
            return (
              <EnhancedProductCardItem
                key={car.id}
                title={car.title}
                marka={car.make?.name || ''}
                price={car.price || 0}
                type={car.listingType}
                imageSrc={
                  car.images?.find((img: { isPrimary: any }) => img.isPrimary)
                    ?.url ||
                  car.images?.[0]?.url ||
                  '/placeholder-car.jpg'
                }
                ProductId={car.id}
                priceWord={t('latestOffers.price')}
                isFavorites={false}
                isMarkedFavorite={isFavorite}
                onFavoriteToggle={handleFavoriteToggle}
                isAuthenticated={true}
                onDelete={handleDelete}
                profile={true}
              />
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {!isLoading &&
        !error &&
        carListings.length > 0 &&
        paginationMeta.totalPages > 1 && (
          <Pagination
            currentPage={paginationMeta.currentPage}
            totalPages={paginationMeta.totalPages}
            hasNextPage={paginationMeta.hasNextPage}
            hasPreviousPage={paginationMeta.hasPreviousPage}
            totalItems={paginationMeta.totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            showItemsInfo={true}
            className="mt-8"
          />
        )}
    </div>
  );
};

export default UserProductPage;
