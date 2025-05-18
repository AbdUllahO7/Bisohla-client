'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import Pagination from '@/components/Pagination';
import { Filter, FilterGroup, QueryParams } from '@/core/entities/api/api';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import AllCarListingsSkeleton from '@/components/web/design/AllCarListingsSkeleton';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';
import { RentProductCard } from '@/components/web/design/RentProductCard';

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
  container = true,
  queryParams: initialQueryParams,
  onTotalItemsChange 
}) => {
  const t = useTranslations('homePage');
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({});
    const session = useSession();
  const [queryParams, setQueryParams] = useState<QueryParams>({
    userId : session.user?.id,
    page: 1,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    ...initialQueryParams
  });

  // Verify authentication status on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authResponse = await checkAuth();
        setIsAuthenticated(authResponse.success);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };
    
    verifyAuth();
  }, []);

  // Handle favorite status update from child component
  const handleFavoriteToggle = useCallback((productId: number, isFavorite: boolean) => {
    setFavoriteStatuses(prev => ({
      ...prev,
      [productId]: isFavorite
    }));
  }, []);

  // Update from URL parameters or props
  useEffect(() => {
    if (initialQueryParams) {
      setQueryParams({
        ...queryParams,
        ...initialQueryParams,
        page: currentPage,
        userId : session.user?.id,
        });
    } else if (searchParams) {
      const filters: Filter[] = [];
      const filterGroups: FilterGroup[] = [];
      
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
      
      const currency = searchParams.get('currency');
      if (currency) {
        filters.push({
          field: 'currency',
          operator: 'eq',
          value: currency
        });
      }
      
      const detailFilters: Filter[] = [];
      
      const minYear = searchParams.get('minYear');
      const maxYear = searchParams.get('maxYear');
      
      if (minYear) {
        detailFilters.push({
          field: 'details.year',
          operator: 'gte',
          value: parseInt(minYear, 10)
        });
      }
      
      if (maxYear) {
        detailFilters.push({
          field: 'details.year',
          operator: 'lte',
          value: parseInt(maxYear, 10)
        });
      }
      
      const transmission = searchParams.get('transmission');
      if (transmission) {
        detailFilters.push({
          field: 'details.transmission',
          operator: 'eq',
          value: transmission
        });
      }
      
      const fuelType = searchParams.get('fuelType');
      if (fuelType) {
        detailFilters.push({
          field: 'details.fuelType',
          operator: 'eq',
          value: fuelType
        });
      }
      
      const bodyType = searchParams.get('bodyType');
      if (bodyType) {
        detailFilters.push({
          field: 'details.bodyType',
          operator: 'eq',
          value: bodyType
        });
      }
      
      if (detailFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: detailFilters
        });
      }
      
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
      
      const search = searchParams.get('search');
      const sortBy = searchParams.get('sortBy');
      const sortDirection = searchParams.get('sortDirection');
      
      setQueryParams({
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortBy || 'createdAt',
        sortDirection: sortDirection as 'asc' | 'desc' || 'desc',
        searchTerm: search || undefined,
        where: filters.length > 0 ? filters : undefined,
        filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
        userId: session.user?.id
      });
    }
  }, [initialQueryParams, searchParams, currentPage, pageSize, session.user?.id]);
  
  // Fetch all car listings with pagination and filters
  const { data, isLoading, error } = useCarListings(queryParams);
  
  // Extract car listings array safely
  const carListings = React.useMemo(() => {
    const apiData = data as any;
    
    let listings: Array<any> = [];
    if (Array.isArray(apiData?.data)) {
      listings = apiData.data;
    }
    else if (apiData?.data && 'data' in apiData.data && Array.isArray(apiData.data.data)) {
      listings = apiData.data.data;
    }
    
    // Initialize favorite statuses from backend data if not already set
    const newFavoriteStatuses: Record<number, boolean> = {};
    listings.forEach(item => {
      if (item.id && favoriteStatuses[item.id] === undefined) {
        newFavoriteStatuses[item.id] = !!item.isFavorite;
      }
    });
    
    if (Object.keys(newFavoriteStatuses).length > 0) {
      setFavoriteStatuses(prev => ({...prev, ...newFavoriteStatuses}));
    }
    
    return listings;
  }, [data, favoriteStatuses]);

  // Get pagination information
  const paginationInfo = React.useMemo(() => {
    const apiData = data as any;
    
    if (apiData?.currentPage !== undefined) {
      return {
        currentPage: apiData.currentPage,
        totalPages: apiData.totalPages || 1,
        hasNextPage: apiData.hasNextPage || false,
        hasPreviousPage: apiData.hasPreviousPage || false,
        totalItems: apiData.totalItems || 0
      };
    }
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
    else if (apiData?.meta) {
      return {
        currentPage: apiData.meta.currentPage || 1,
        totalPages: apiData.meta.totalPages || 1,
        hasNextPage: (apiData.meta.currentPage || 1) < (apiData.meta.totalPages || 1),
        hasPreviousPage: (apiData.meta.currentPage || 1) > 1,
        totalItems: apiData.meta.total || 0
      };
    }
    
    return {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: carListings.length
    };
  }, [data, carListings]);
  
  useEffect(() => {
    if (onTotalItemsChange && !isLoading) {
      onTotalItemsChange(paginationInfo.totalItems);
    }
  }, [paginationInfo.totalItems, onTotalItemsChange, isLoading]);
  
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Box variant={container ? "container" : "center"} className="mb-5 mt-5">
      <Box variant="column" className='w-full'>
        {showTitle && (
          <Box variant="column" className="mb-4">
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
              {t('allCars.title', { defaultValue: 'All Cars' })}
            </Text>
          </Box>
        )}
        
        {isLoading && <div className='w-full'>
          <AllCarListingsSkeleton
            pageSize={pageSize}
            showTitle={showTitle}
          /> 
        </div>}
        
        {error && (
          <Box className="w-full py-4" variant="center">
            <Text className="text-red-500">Failed to load car listings</Text>
          </Box>
        )}
        
        {!isLoading && !error && carListings.length === 0 && (
          <Box className="w-full py-4" variant="center">
            <Text>No car listings available</Text>
          </Box>
        )}
        
        {!isLoading && !error && carListings.length > 0 && (
          <>
            <Box 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
              variant="center"
            >
              {carListings.map((card: { id: number; details : any; title: string; make: { name: any; }; marka: any; price: Number; listingType: string | undefined; images: any[]; imageSrc: any; gaz: any; type: any; isFavorite?: boolean }, index: any) => {
                const isFavorite = favoriteStatuses[card.id] !== undefined 
                  ? favoriteStatuses[card.id] 
                  : !!card.isFavorite;
                
                return (
                  <React.Fragment key={card.id || index}>
                    <RentProductCard
                      title={card.title}
                      marka={card.make?.name || card.marka || ''}
                      price={card.price.toString()}
                      type={card.listingType}
                      imageSrc={card.images?.find((img) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc || ''}
                      ProductId={card.id}
                      priceWord={t('latestOffers.price')}
                      isMarkedFavorite={isFavorite}
                      onFavoriteToggle={handleFavoriteToggle}
                      details={card.details || []}
                    />
                  </React.Fragment>
                );
              })}
            </Box>

            <AdsSectionProduct />
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