'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import Pagination from '@/components/Pagination';
import { QueryParams } from '@/core/entities/api/api';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import AllCarListingsSkeleton from '@/components/web/design/AllCarListingsSkeleton';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';
import { RentProductCard } from '@/components/web/design/RentProductCard';
import { RentProductListCard } from '@/components/web/design/rent-product-list-product';

interface AllCarListingsProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
  queryParams?: QueryParams;
  onTotalItemsChange?: (totalItems: number) => void;
}

const AllCarListings: React.FC<AllCarListingsProps> = ({
  pageSize = 8,
  showTitle = false,
  queryParams: externalQueryParams,
  onTotalItemsChange,
}) => {
  const t = useTranslations('productsPage');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const session = useSession();

  // Check for mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Build final query params with current page - USE USEMEMO
  const queryParams: QueryParams = useMemo(() => ({
    userId: session.user?.id,
    pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    ...externalQueryParams, // This will override defaults with provider values
    page: currentPage,
  }), [currentPage, pageSize, externalQueryParams, session.user?.id]);

  // Verify authentication status on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authResponse = await checkAuth();
        setIsAuthenticated(authResponse.success);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Reset to page 1 when filters change (except when page itself changes)
  useEffect(() => {
    if (externalQueryParams) {
      setCurrentPage(1);
    }
  }, [
    externalQueryParams?.filterGroups,
    externalQueryParams?.where,
    externalQueryParams?.searchTerm,
    externalQueryParams?.sortBy,
    externalQueryParams?.sortDirection,
  ]);

  // Handle favorite status update from child component
  const handleFavoriteToggle = useCallback(
    (productId: number, isFavorite: boolean) => {
      setFavoriteStatuses((prev) => ({
        ...prev,
        [productId]: isFavorite,
      }));
    },
    [],
  );

  // Fetch all car listings with pagination and filters
  const { data, isLoading, error } = useCarListings(queryParams);
  // Extract car listings array safely
  const carListings = useMemo(() => {
    const apiData = data as any;

    let listings: Array<any> = [];
    if (Array.isArray(apiData?.data)) {
      listings = apiData.data;
    } else if (
      apiData?.data &&
      'data' in apiData.data &&
      Array.isArray(apiData.data.data)
    ) {
      listings = apiData.data.data;
    }

    // Initialize favorite statuses from backend data if not already set
    const newFavoriteStatuses: Record<number, boolean> = {};
    listings.forEach((item) => {
      if (item.id && favoriteStatuses[item.id] === undefined) {
        newFavoriteStatuses[item.id] = !!item.isFavorite;
      }
    });

    if (Object.keys(newFavoriteStatuses).length > 0) {
      setFavoriteStatuses((prev) => ({ ...prev, ...newFavoriteStatuses }));
    }

    return listings;
  }, [data, favoriteStatuses]);

  // Get pagination information
  const paginationInfo = useMemo(() => {
    const apiData = data as any;

    if (apiData?.currentPage !== undefined) {
      return {
        currentPage: apiData.currentPage,
        totalPages: apiData.totalPages || 1,
        hasNextPage: apiData.hasNextPage || false,
        hasPreviousPage: apiData.hasPreviousPage || false,
        totalItems: apiData.totalItems || 0,
      };
    } else if (
      apiData?.data &&
      typeof apiData.data === 'object' &&
      !Array.isArray(apiData.data) &&
      'currentPage' in apiData.data
    ) {
      const nestedData = apiData.data;
      return {
        currentPage: nestedData.currentPage,
        totalPages: nestedData.totalPages || 1,
        hasNextPage: nestedData.hasNextPage || false,
        hasPreviousPage: nestedData.hasPreviousPage || false,
        totalItems: nestedData.totalItems || 0,
      };
    } else if (apiData?.meta) {
      return {
        currentPage: apiData.meta.currentPage || 1,
        totalPages: apiData.meta.totalPages || 1,
        hasNextPage:
          (apiData.meta.currentPage || 1) < (apiData.meta.totalPages || 1),
        hasPreviousPage: (apiData.meta.currentPage || 1) > 1,
        totalItems: apiData.meta.total || 0,
      };
    }

    return {
      currentPage: currentPage,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: carListings.length,
    };
  }, [data, carListings.length, currentPage]);

  // Update total items for parent component
  useEffect(() => {
    if (onTotalItemsChange && !isLoading) {
      onTotalItemsChange(paginationInfo.totalItems);
    }
  }, [paginationInfo.totalItems, onTotalItemsChange, isLoading]);

  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage(page);
    
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Render car listing component based on screen size
  const renderCarListing = useCallback((card: any, index: number) => {
    const isFavorite =
      favoriteStatuses[card.id] !== undefined
        ? favoriteStatuses[card.id]
        : !!card.isFavorite;

    const commonProps = {
      title: card.title,
      marka: card.make?.name || card.marka || '',
      price: card.price.toString(),
      type: card.listingType,
      imageSrc:
        card.images?.find((img: any) => img.isPrimary)?.url ||
        card.images?.[0]?.url ||
        card.imageSrc ||
        '',
      ProductId: card.id,
      priceWord: t('latestOffers.price'),
      isMarkedFavorite: isFavorite,
      onFavoriteToggle: handleFavoriteToggle,
      details: card.details || [],
    };

    if (isMobile) {
      return (
        <RentProductListCard
          key={card.id || index}
          car={card}
          isMarkedFavorite={isFavorite}
          onFavoriteToggle={handleFavoriteToggle}
          priceWord={t('latestOffers.price')}
        />
      );
    } else {
      return <RentProductCard key={card.id || index} {...commonProps} />;
    }
  }, [isMobile, favoriteStatuses, handleFavoriteToggle, t]);

  return (
    <Box className="mb-5 mt-5 w-full">
      <Box variant="column" className="w-full">
        {showTitle && (
          <Box variant="column" className="mb-4">
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
              {t('allCars.title', { defaultValue: 'All Cars' })}
            </Text>
          </Box>
        )}

        {isLoading && (
          <div className="w-full">
            <AllCarListingsSkeleton pageSize={pageSize} showTitle={showTitle} />
          </div>
        )}

        {error && (
          <Box className="w-full py-4" variant="center">
            <Text className="text-red-500">{t('allCars.error')}</Text>
          </Box>
        )}

        {!isLoading && !error && carListings.length === 0 && (
          <Box className="w-full py-8 text-center" variant="center">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl opacity-50">🚗</div>
              <Text className="text-xl font-semibold text-gray-600">
                {t('allCars.noResults')}
              </Text>
              <Text className="text-gray-500">
                {t('allCars.noResultsMessage')}
              </Text>
            </div>
          </Box>
        )}

        {!isLoading && !error && carListings.length > 0 && (
          <>
            {isMobile ? (
              <Box className="w-full flex-col">
                {carListings.map((card, index) =>
                  renderCarListing(card, index),
                )}
              </Box>
            ) : (
              <Box
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                variant="center"
              >
                {carListings.map((card, index) =>
                  renderCarListing(card, index),
                )}
              </Box>
            )}

            <AdsSectionProduct />

            {paginationInfo.totalPages > 1 && (
              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                hasNextPage={paginationInfo.hasNextPage}
                hasPreviousPage={paginationInfo.hasPreviousPage}
                totalItems={paginationInfo.totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                showItemsInfo={true}
                className="mt-4"
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AllCarListings;