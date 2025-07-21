// components/dashboard/UserFavoritesEnhanced.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserFavoriteCarListing } from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { ListingType } from '@/core/entities/enums/cars.enums';
import { CarDetails } from '@/core/entities/models/cars/cars.dto';
import { useSession } from '@/hooks/auth/use-session';
import { useDirection } from '@/hooks/use-direction';
import {
  Heart,
  Car,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCarFavorites } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import { QueryParams } from '@/core/entities/api/api';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { ProductCardListView } from '@/components/web/design/ProductCardListView';

// Define a type for the transformed favorite listings
interface FavoriteListing {
  id: number;
  title: string;
  marka: string;
  price: number;
  type: ListingType;
  imageSrc: string;
  details: CarDetails;
}

// View mode type
type ViewMode = 'grid' | 'list';

// Filter type for listing types
type FilterType = 'all' | 'for_sale' | 'for_rent';

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserFavoritesEnhanced = () => {
  const t = useTranslations('UserProfile.favorites');
  const direction = useDirection();
  const session = useSession();

  // State for filters, UI, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<number, boolean>
  >({});

  const pageSize = 12; // Items per page

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build query params for the API
  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = {
      userId: session?.user?.id,
      page: currentPage,
      pageSize: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    // Add search if provided (use debounced value)
    if (debouncedSearchQuery.trim()) {
      // For car listings search, we might want to search in multiple fields
      params.filterGroups = [
        {
          operator: 'or',
          filters: [
            {
              field: 'carListing.title',
              operator: 'like',
              value: `%${debouncedSearchQuery.trim()}%`,
            },
            {
              field: 'carListing.make.name',
              operator: 'like',
              value: `%${debouncedSearchQuery.trim()}%`,
            },
          ],
        },
      ];
    }

    // Add filter for listing type
    if (filterType !== 'all') {
      const typeFilter = {
        field: 'carListing.listingType',
        operator: 'eq' as const,
        value: filterType,
      };

      if (params.filterGroups) {
        // If we already have search filters, add type filter with AND
        params.filterGroups.push({
          operator: 'and',
          filters: [typeFilter],
        });
      } else {
        // If no search, just add type filter
        params.where = [typeFilter];
      }
    }

    return params;
  }, [session?.user?.id, debouncedSearchQuery, filterType, currentPage]);

  // Use the query hook with proper dependency tracking
  const { data, isLoading, error, refetch, isRefetching } =
    useGetCarFavorites(queryParams);

  // Force refetch when search or filter changes (additional safeguard)
  useEffect(() => {
    refetch();
  }, [debouncedSearchQuery, filterType, refetch]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterType]);

  // Function to safely check if an image is primary
  const isPrimaryImage = (
    img: any,
  ): img is { isPrimary: boolean; url: string } => {
    return img && typeof img === 'object' && 'isPrimary' in img && 'url' in img;
  };

  // Type guard for nullable transformed favorites
  const isValidFavoriteListing = (
    item: FavoriteListing | null,
  ): item is FavoriteListing => {
    return item !== null;
  };

  console.log(queryParams);

  // Transform favorites data for display
  const favoriteListings = useMemo(() => {
    if (!data?.data?.data) return [];

    const transformedListings = data.data.data
      .map((favorite) => {
        const listing = favorite.carListing;
        if (!listing) return null;

        // Safely find primary image or first image
        let imageSrc = '/placeholder-car.jpg';
        if (listing.images && Array.isArray(listing.images)) {
          const primaryImage = listing.images.find(
            (img) => isPrimaryImage(img) && img.isPrimary,
          );
          if (primaryImage && 'url' in primaryImage) {
            imageSrc = primaryImage.url;
          } else if (listing.images.length > 0 && 'url' in listing.images[0]) {
            imageSrc = listing.images[0].url;
          }
        }

        return {
          id: listing.id,
          title: listing.title,
          marka: listing.make?.name || '',
          price: listing.price || 0,
          type: listing.listingType as ListingType,
          imageSrc,
          details: listing.details || ({} as CarDetails),
        } as FavoriteListing;
      })
      .filter(isValidFavoriteListing);

    return transformedListings;
  }, [data?.data?.data]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (!data?.data) return null;

    return {
      currentPage: data.data.currentPage || currentPage,
      totalPages: data.data.totalPages || 1,
      totalItems: data.data.totalItems || 0,
      hasNextPage: data.data.hasNextPage || false,
      hasPreviousPage: data.data.hasPreviousPage || false,
    };
  }, [data?.data, currentPage]);

  // Initialize favorite statuses
  useEffect(() => {
    if (favoriteListings.length > 0) {
      const newFavoriteStatuses: Record<number, boolean> = {};
      favoriteListings.forEach((listing) => {
        newFavoriteStatuses[listing.id] = true;
      });
      setFavoriteStatuses(newFavoriteStatuses);
    }
  }, [favoriteListings]);

  // Handler for when a favorite is toggled
  const handleFavoriteToggle = useCallback(
    (productId: number, isFavorite: boolean) => {
      // Update favorite statuses
      setFavoriteStatuses((prev) => ({
        ...prev,
        [productId]: isFavorite,
      }));

      // If removed from favorites, refetch to update the list
      if (!isFavorite) {
        setTimeout(() => {
          refetch();
        }, 500); // Small delay to allow the API to process the change
      }
    },
    [refetch],
  );

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (paginationInfo?.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (paginationInfo?.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-8 w-8 text-rose-500" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('description')}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {paginationInfo?.totalItems || 0} {t('itemsCount')}
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rtl:pl-3 rtl:pr-9"
                />
              </div>

              {/* Filter */}
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  <SelectItem value="for_sale">
                    {t('filters.forSale')}
                  </SelectItem>
                  <SelectItem value="for_rent">
                    {t('filters.forRent')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading state */}
      {isLoading && <ProductSkeleton count={12} showTitle={false} />}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              {t('error.title')}
            </h3>
            <p className="text-muted-foreground mb-4">{t('error.message')}</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t('error.retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && favoriteListings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('empty.message')}
            </p>
            <Button asChild>
              <a href="/products">
                <Car className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('empty.browseButton')}
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display favorites */}
      {!isLoading && !error && favoriteListings.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-4'
          }
        >
          {favoriteListings.map((card) => {
            const isFavorite =
              favoriteStatuses[card.id] !== undefined
                ? favoriteStatuses[card.id]
                : true;

            // For list view, we need to reconstruct the carListing object
            if (viewMode === 'list') {
              // Transform the FavoriteListing back to SelectCarListingDto format
              const carListingData = {
                id: card.id,
                title: card.title,
                price: card.price,
                listingType: card.type,
                images: [{ url: card.imageSrc, isPrimary: true }],
                make: { name: card.marka },
                model: { name: '' }, // You might want to add model to FavoriteListing if available
                details: card.details,
                // Add other required fields with reasonable defaults
                description: '',
                currency: 'SYP',
                userId: 0,
                makeId: 0,
                modelId: 0,
                status: 'active',
                isFeatured: false,
                isTrend: false,
                saveStatus: 'published',
                governorate: 'Damascus',
                city: 'Damascus',
                address: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                features: [],
                trim: null,
                trimId: null,
                rentType: null,
                contactNumber: null,
                damages: [],
              } as any; // Type assertion since we're providing minimal data

              return (
                <ProductCardListView
                  key={card.id}
                  carListing={carListingData}
                  isMarkedFavorite={isFavorite}
                  onFavoriteToggle={handleFavoriteToggle}
                  showFavorites={true}
                  profile={true}
                />
              );
            }

            // Grid view - keep existing ProductCardItem
            return (
              <div key={card.id}>
                <ProductCardItem
                  title={card.title}
                  marka={card.marka}
                  price={card.price}
                  type={card.type}
                  imageSrc={card.imageSrc}
                  ProductId={card.id}
                  priceWord={t('priceLabel')}
                  isFavorites={true}
                  isMarkedFavorite={isFavorite}
                  onFavoriteToggle={handleFavoriteToggle}
                  profile={true}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading &&
        !error &&
        paginationInfo &&
        paginationInfo.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Page info */}
                <div className="text-sm text-muted-foreground">
                  {t('pagination.showing')}{' '}
                  {(paginationInfo.currentPage - 1) * pageSize + 1}{' '}
                  {t('pagination.to')}{' '}
                  {Math.min(
                    paginationInfo.currentPage * pageSize,
                    paginationInfo.totalItems,
                  )}{' '}
                  {t('pagination.of')} {paginationInfo.totalItems}{' '}
                  {t('pagination.results')}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!paginationInfo.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('pagination.previous')}
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, paginationInfo.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        const isCurrentPage =
                          page === paginationInfo.currentPage;

                        return (
                          <Button
                            key={page}
                            variant={isCurrentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      },
                    )}

                    {paginationInfo.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(paginationInfo.totalPages)
                          }
                          className="w-10"
                        >
                          {paginationInfo.totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!paginationInfo.hasNextPage}
                  >
                    {t('pagination.next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Refresh Indicator */}
      {isRefetching && !isLoading && (
        <div className="fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-50">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t('refreshing')}</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserFavoritesEnhanced;
