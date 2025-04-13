'use client';
import React, { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';

import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import Pagination from '@/components/Pagination';




const AllCarListings: React.FC<AllCarListingsProps> = ({ 
  pageSize = 8, 
  showTitle = false, 
  container = true 
}) => {
  const t = useTranslations('homePage');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Fetch all car listings with pagination
  const { data, isLoading, error } = useCarListings({
    page: currentPage,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Extract car listings array safely
  const carListings = React.useMemo<CarListing[]>(() => {
    const apiData = data as ApiResponse | undefined;
    
    // Check if data.data is an array of listings
    if (Array.isArray(apiData?.data)) {
      return apiData.data as CarListing[];
    }
    // Check if data.data.data is an array of listings (nested structure)
    else if (apiData?.data && 'data' in apiData.data && Array.isArray((apiData.data as any).data)) {
      return (apiData.data as any).data as CarListing[];
    }
    return [];
  }, [data]);
  
  // Get pagination information
  const paginationInfo = React.useMemo<PaginationInfo>(() => {
    const apiData = data as ApiResponse | undefined;
    
    // Check direct properties first
    if (apiData?.currentPage !== undefined) {
      return {
        currentPage: apiData.currentPage,
        totalPages: apiData.totalPages || 1,
        hasNextPage: apiData.hasNextPage || false,
        hasPreviousPage: apiData.hasPreviousPage || false,
        totalItems: apiData.totalItems || 0
      };
    }
    // Then check if pagination info is nested in data
    else if (apiData?.data && typeof apiData.data === 'object' && !Array.isArray(apiData.data) && 'currentPage' in apiData.data) {
      const nestedData = apiData.data as any;
      return {
        currentPage: nestedData.currentPage,
        totalPages: nestedData.totalPages || 1,
        hasNextPage: nestedData.hasNextPage || false,
        hasPreviousPage: nestedData.hasPreviousPage || false,
        totalItems: nestedData.totalItems || 0
      };
    }
    // Finally check for meta data structure
    else if (apiData?.meta) {
      return {
        currentPage: apiData.meta.currentPage || 1,
        totalPages: apiData.meta.totalPages || 1,
        hasNextPage: (apiData.meta.currentPage || 1) < (apiData.meta.totalPages || 1),
        hasPreviousPage: (apiData.meta.currentPage || 1) > 1,
        totalItems: apiData.meta.total || 0
      };
    }
    
    // Default values
    return {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: carListings.length
    };
  }, [data, carListings]);
  
  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // You could also implement scrolling to top here if needed
    window.scrollTo(0, 0);
  };
  
  return (
    <Box variant={container ? "container" : "center"} className="mb-5">
      <Box variant="column">
        {showTitle && (
          <Box variant="column" className="mb-4">
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
              {t('allCars.title', { defaultValue: 'All Cars' })}
            </Text>
          </Box>
        )}
        
        {/* Show loading skeleton */}
        {isLoading && <ProductSkeleton count={pageSize} showTitle={false} />}
        
        {/* Show error state */}
        {error && (
          <Box className="w-full py-4" variant="center">
            <Text className="text-red-500">Failed to load car listings</Text>
          </Box>
        )}
        
        {/* Show empty state */}
        {!isLoading && !error && carListings.length === 0 && (
          <Box className="w-full py-4" variant="center">
            <Text>No car listings available</Text>
          </Box>
        )}
        
        {/* Display Cards */}
        {!isLoading && !error && carListings.length > 0 && (
          <>
            <Box 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
              variant="center"
            >
              {carListings.map((card, index) => (
                <React.Fragment key={card.id || index}>
                  <ProductCardItem
                    title={card.title}
                    marka={card.make?.name || card.marka || ''}
                    price={card.price}
                    type={card.listingType}
                    imageSrc={card.images?.find((img: CarImage) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc || ''}
                    ProductId={card.id}
                    priceWord={t('latestOffers.price')}
                    isFavorites={true}
                    details={card.gaz ? {
                      gaz: card.gaz,
                      type: card.type || ''
                    } : undefined}
                  />
                </React.Fragment>
              ))}
            </Box>
            
            {/* Use the reusable Pagination component */}
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default AllCarListings;