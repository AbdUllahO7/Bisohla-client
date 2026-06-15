'use client';
import { ProductCardListView } from '@/components/web/design/ProductCardListView';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMyListings } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import type { QueryParams } from '@/core/entities/api/api';
import Pagination from '@/components/shared/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Plus} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import MyProductsFilter from '@/components/dashboard/Products/MyProductsFilter';
import { EnhancedProductCardItem } from '@/components/web/design/ProductCardItemEnhanced';
import { SaveStatus } from '../../../../core/entities/enums/cars.enums';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import { getInjection } from '@/di/container';

// View mode type
type ViewMode = 'grid' | 'list';

const UserProductPage = () => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // State management
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<number, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [listingTypeId, setListingTypeId] = useState<number | undefined>(undefined);
  const [listingTypes, setListingTypes] = useState<any[]>([]);
  const pageSize = 12; // Increased for better pagination

  // Fetch listing types for selection
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const response = await controller.getListingTypes(1, 100);
        if (response.success && response.data) {
          setListingTypes(response.data.data.filter((t: any) => t.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch listing types", error);
      }
    };
    fetchTypes();
  }, []);

  const [filterParams, setFilterParams] = useState<QueryParams>({
    page: 1,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const lastParamsStr = useRef<string>('');
  const combinedQueryParams = useMemo(() => {
    const params: QueryParams = {
      ...filterParams,
      page: currentPage,
      filterGroups: filterParams.filterGroups ? JSON.parse(JSON.stringify(filterParams.filterGroups)) : undefined,
      where: filterParams.where ? JSON.parse(JSON.stringify(filterParams.where)) : undefined,
    };
    
    if (listingTypeId) {
      // Keep listingTypeId as a top-level param as it's common for many endpoints
      (params as any).listingTypeId = listingTypeId;
    }
    
    const currentStr = JSON.stringify(params);
    if (lastParamsStr.current !== currentStr) {
      lastParamsStr.current = currentStr;
      return params;
    }
    return JSON.parse(lastParamsStr.current) as QueryParams;
  }, [filterParams, listingTypeId, currentPage]);

  // Fetch user's listings using the generic hook
  const { data, isLoading, error, refetch } = useMyListings(combinedQueryParams);

  // Force refetch when query params change to ensure real-time updates
  useEffect(() => {
    refetch();
  }, [combinedQueryParams, refetch]);

  // Handle filter changes from the simple filter component
  const handleFilterChange = useCallback((params: QueryParams) => {
    setFilterParams({
      ...params,
      page: 1,
      pageSize: pageSize,
    });
    setCurrentPage(1);

    // Synchronize listingTypeId from the filter component's where array
    const typeFilter = params.where?.find((f) => f.field === 'listingTypeId');
    if (typeFilter && typeFilter.value !== listingTypeId) {
      setListingTypeId(Number(typeFilter.value));
    }
  }, [listingTypeId, pageSize]);

  const handleListingTypeChange = useCallback((id: number | undefined) => {
    setListingTypeId(id);
    setFilterParams({
      page: 1,
      pageSize: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'desc',
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
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Reset to page 1 when filters change like AllCarListings.tsx
  useEffect(() => {
    if (filterParams) {
      setCurrentPage(1);
    }
  }, [
    JSON.stringify(filterParams?.filterGroups),
    JSON.stringify(filterParams?.where),
    filterParams?.searchTerm,
    filterParams?.sortBy,
    filterParams?.sortDirection,
  ]);

  // Prepare listings for display
  const listings = useMemo(() => {
    let rawListings: any[] = [];

    // Handle nested data structure if needed
    if (Array.isArray(data?.data)) {
      rawListings = data.data;
    } else if (Array.isArray(data?.data?.data)) {
      rawListings = data.data.data;
    }

    // Initialize favorite statuses from backend data if not already set
    const newFavoriteStatuses: Record<number, boolean> = {};
    rawListings.forEach((item) => {
      if (item.id && favoriteStatuses[item.id] === undefined) {
        newFavoriteStatuses[item.id] = !!item.isFavorite;
      }
    });

    // Update favorite statuses if we have new ones
    if (Object.keys(newFavoriteStatuses).length > 0) {
      setFavoriteStatuses((prev) => ({ ...prev, ...newFavoriteStatuses }));
    }

    // Normalize each listing to ensure consistent DTO structure (fixes image display and other inconsistencies)
    return rawListings.map(item => normalizeListingToCarDto(item, locale));
  }, [data, favoriteStatuses, locale]);

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
      totalItems: meta.totalItems || listings.length,
    };
  }, [data, currentPage, listings.length]);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6" dir={direction}>
    

      {/* Simple Filter Component */}
      <MyProductsFilter
        onChange={handleFilterChange}
        onListingTypeChange={handleListingTypeChange}
        listingTypeId={listingTypeId}
        listingTypes={listingTypes}
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
                  ? 'Failed to Load Products'
                  : 'فشل في تحميل الإعلانات'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {direction === 'ltr'
                  ? "We couldn't load your listings. Please try again."
                  : 'لم نتمكن من تحميل إعلاناتك. يرجى المحاولة مرة أخرى.'}
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
      {!isLoading && !error && listings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {direction === 'ltr' ? 'No Listings Yet' : 'لا توجد إعلانات بعد'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {direction === 'ltr'
                ? "You haven't created any listings yet. Add your first item to get started!"
                : 'لم تقم بإنشاء أي إعلانات بعد. أضف إعلانك الأول للبدء!'}
            </p>
            <Link href="/products/AddProducts">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                {direction === 'ltr' ? 'Add New Listing' : 'إضافة إعلان جديد'}
              </button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Display products */}
      {!isLoading && !error && listings.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
          }
        >
          {listings.map((item) => {
            // Get favorite status from local state or fallback to backend data
            const isFavorite =
              favoriteStatuses[item.id] !== undefined
                ? favoriteStatuses[item.id]
                : !!item.isFavorite;

            if (viewMode === 'list') {
              // Use the new ProductCardListView for list mode
              return (
                <ProductCardListView
                  key={item.id}
                  carListing={item}
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
                key={item.id}
                title={item.title}
                marka={item.make?.name || ''}
                price={item.price || 0}
                type={item.listingType}
                carStatus={item.status}
                saveStatus={item.saveStatus as SaveStatus}
                imageSrc={
                  item.primaryImage ||
                  item.images?.find((img: { isPrimary: any }) => img.isPrimary)
                    ?.url ||
                  item.images?.[0]?.url ||
                  '/placeholder-listing.jpg'
                }
                ProductId={item.id}
                priceWord={t('latestOffers.price')}
                isFavorites={false}
                isMarkedFavorite={isFavorite}
                onFavoriteToggle={handleFavoriteToggle}
                isAuthenticated={true}
                onDelete={handleDelete}
                profile={true}
                isMine={true}

              />
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {!isLoading &&
        !error &&
        listings.length > 0 &&
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
