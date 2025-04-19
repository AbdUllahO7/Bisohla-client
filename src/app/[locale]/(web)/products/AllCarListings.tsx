'use client';
import React, { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import Pagination from '@/components/Pagination';
import { Filter, FilterGroup, QueryParams } from '@/core/entities/api/api';

// Import types

interface AllCarListingsProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
  queryParams?: QueryParams;
}

const AllCarListings: React.FC<AllCarListingsProps> = ({ 
  pageSize = 8, 
  showTitle = false, 
  container = true,
  queryParams: initialQueryParams 
}) => {
  const t = useTranslations('homePage');
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    ...initialQueryParams
  });
  
  // Update from URL parameters or props
  useEffect(() => {
    if (initialQueryParams) {
      setQueryParams({
        ...queryParams,
        ...initialQueryParams,
        page: currentPage
      });
    } else if (searchParams) {
      // Build filters from URL search params
      const filters: Filter[] = [];
      const filterGroups: FilterGroup[] = [];
      
      // Check for make/model/trim filters
      const make = searchParams.get('make');
      if (make) {
        filters.push({
          field: 'makeId',
          operator: 'eq',
          value: make
        });
      }
      
      const model = searchParams.get('model');
      if (model) {
        filters.push({
          field: 'modelId',
          operator: 'eq',
          value: model
        });
      }
      
      const trim = searchParams.get('trim');
      if (trim) {
        filters.push({
          field: 'trimId',
          operator: 'eq',
          value: trim
        });
      }
      
      const year = searchParams.get('year');
      if (year) {
        filters.push({
          field: 'details.year',
          operator: 'eq',
          value: year
        });
      }
      
      // Location filters
      const governorate = searchParams.get('governorate');
      if (governorate) {
        filters.push({
          field: 'governorate',
          operator: 'eq',
          value: governorate
        });
      }
      
      const city = searchParams.get('city');
      if (city) {
        filters.push({
          field: 'city',
          operator: 'eq',
          value: city
        });
      }
      
      // Car details filters
      const transmission = searchParams.get('transmission');
      if (transmission) {
        filters.push({
          field: 'details.transmission',
          operator: 'eq',
          value: transmission
        });
      }
      
      const fuelType = searchParams.get('fuelType');
      if (fuelType) {
        filters.push({
          field: 'details.fuelType',
          operator: 'eq',
          value: fuelType
        });
      }
      
      const bodyType = searchParams.get('bodyType');
      if (bodyType) {
        filters.push({
          field: 'details.bodyType',
          operator: 'eq',
          value: bodyType
        });
      }
      
      // Price range filters
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      
      if (minPrice || maxPrice) {
        const priceFilters: Filter[] = [];
        
        if (minPrice) {
          priceFilters.push({
            field: 'price',
            operator: 'gte',
            value: parseInt(minPrice, 10)
          });
        }
        
        if (maxPrice) {
          priceFilters.push({
            field: 'price',
            operator: 'lte',
            value: parseInt(maxPrice, 10)
          });
        }
        
        if (priceFilters.length > 0) {
          filterGroups.push({
            operator: 'and',
            filters: priceFilters
          });
        }
      }
      
      const currency = searchParams.get('currency');
      if (currency) {
        filters.push({
          field: 'currency',
          operator: 'eq',
          value: currency
        });
      }
      
      // Search term
      const search = searchParams.get('search');
      
      // Apply all filters to the query params
      setQueryParams({
        page: currentPage,
        pageSize: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        searchTerm: search || undefined,
        where: filters.length > 0 ? filters : undefined,
        filterGroups: filterGroups.length > 0 ? filterGroups : undefined
      });
    }
  }, [initialQueryParams, searchParams, currentPage, pageSize]);
  
  // Fetch all car listings with pagination and filters
  const { data, isLoading, error } = useCarListings(queryParams);
  
  // Extract car listings array safely
  const carListings = React.useMemo(() => {
    const apiData = data as any;
    
    // Check if data.data is an array of listings
    if (Array.isArray(apiData?.data)) {
      return apiData.data;
    }
    // Check if data.data.data is an array of listings (nested structure)
    else if (apiData?.data && 'data' in apiData.data && Array.isArray(apiData.data.data)) {
      return apiData.data.data;
    }
    return [];
  }, [data]);
  
  // Get pagination information
  const paginationInfo = React.useMemo(() => {
    const apiData = data as any;
    
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
      const nestedData = apiData.data;
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

  // Handle filter changes from Filter component
  const handleFilterChange = (newQueryParams: QueryParams): void => {
    setCurrentPage(1); // Reset to first page when filters change
    setQueryParams({
      ...newQueryParams,
      page: 1,
      pageSize: pageSize
    });
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
                    imageSrc={card.images?.find((img) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc || ''}
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