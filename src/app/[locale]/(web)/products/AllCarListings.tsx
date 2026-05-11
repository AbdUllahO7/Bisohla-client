'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { useLocale, useTranslations } from 'next-intl';
import { useListings } from '@/core/infrastructure-adapters/use-actions/visitors/listing.visitor.use-actions';
import Pagination from '@/components/shared/Pagination';
import { QueryParams } from '@/core/entities/api/api';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import AllCarListingsSkeleton from '@/components/web/design/AllCarListingsSkeleton';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';
import { RentProductCard } from '@/components/web/design/RentProductCard';
import { RentProductListCard } from '@/components/web/design/rent-product-list-product';
import { useFilters } from '@/providers/filters.provider';
import { useToast } from '@/hooks/use-toast';
import CarAlertModal from '@/components/web/ProductsPage/CarAlertModal';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { getGovernorateOptions, getCityOptions } from '@/components/web/ProductsPage/addProducts/StepOne/utils';
import { useAdSlot } from '@/hooks/use-ad-slot';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';

interface AllCarListingsProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
  queryParams?: QueryParams;
  onTotalItemsChange?: (totalItems: number) => void;
}

const AllCarListings: React.FC<AllCarListingsProps> = ({
  pageSize = 16,
  showTitle = false,
  queryParams: externalQueryParams,
  onTotalItemsChange,
}) => {
  const t = useTranslations('productsPage');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteStatuses, setFavoriteStatuses] = useState<
    Record<number, boolean>
  >({});
  const [isMobile, setIsMobile] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const session = useSession();
  const { filters, listingTypes } = useFilters();
  const currentListingType = useMemo(() => 
    listingTypes.find(t => t.id === filters.listingTypeId),
  [listingTypes, filters.listingTypeId]);
  const categoryName = currentListingType?.name || 'Products';
  const categoryIcon = currentListingType?.iconUrl || '🛍️';
  const { toast } = useToast();
  const { adsData, isLoadingAds } = useAdSlot('all-car-listining-space');

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
  const queryParams: QueryParams = useMemo(
    () => ({
      userId: session.user?.id,
      pageSize,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
      ...externalQueryParams, // This will override defaults with provider values
      page: currentPage,
    }),
    [currentPage, pageSize, externalQueryParams, session.user?.id],
  );

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
    JSON.stringify(externalQueryParams?.filterGroups),
    JSON.stringify(externalQueryParams?.where),
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

  // Fetch listings with pagination and filters
  const { data, isLoading, error } = useListings(filters.listingTypeId, queryParams);
  // Extract car listings array safely
  const carListings = useMemo(() => {
    const apiData = data as any;
    if (!apiData) return [];

    let listings: Array<any> = [];
    
    // The response structure from handleResponse (src/core/lib/api.ts) 
    // puts the actual API result in the 'data' field.
    // Based on the provided example, apiData.data contains { data: [], currentPage: 1, ... }
    if (apiData.data && Array.isArray(apiData.data.data)) {
      listings = apiData.data.data;
    } else if (Array.isArray(apiData.data)) {
      listings = apiData.data;
    } else if (Array.isArray(apiData)) {
      listings = apiData;
    }

    // Normalize each listing to ensure consistent DTO structure
    return listings.map(item => normalizeListingToCarDto(item, locale));
  }, [data, locale]);

  // Sync favorite statuses from backend data when it changes
  useEffect(() => {
    if (carListings.length > 0) {
      setFavoriteStatuses((prev) => {
        const newStatuses = { ...prev };
        let changed = false;
        
        carListings.forEach((item) => {
          if (item.id && prev[item.id] === undefined) {
            newStatuses[item.id] = !!item.isFavorite;
            changed = true;
          }
        });
        
        return changed ? newStatuses : prev;
      });
    }
  }, [carListings]);

  // Get pagination information
  const paginationInfo = useMemo(() => {
    const apiData = data as any;
    if (!apiData) return { currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false, totalItems: 0 };

    // Structure 1: apiData.data = { currentPage, totalPages, data: [] }
    if (apiData.data && typeof apiData.data === 'object' && 'currentPage' in apiData.data) {
      const p = apiData.data;
      return {
        currentPage: p.currentPage || 1,
        totalPages: p.totalPages || 1,
        hasNextPage: p.hasNextPage || false,
        hasPreviousPage: p.hasPreviousPage || false,
        totalItems: p.totalItems || 0,
      };
    }

    // Structure 2: apiData = { currentPage, totalPages, data: [] }
    if (apiData.currentPage !== undefined) {
      return {
        currentPage: apiData.currentPage,
        totalPages: apiData.totalPages || 1,
        hasNextPage: apiData.hasNextPage || false,
        hasPreviousPage: apiData.hasPreviousPage || false,
        totalItems: apiData.totalItems || 0,
      };
    }

    // Fallback
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
      behavior: 'smooth',
    });
  }, []);


  // Render car listing component based on screen size
  const renderCarListing = useCallback(
    (card: any, index: number) => {
      const isFavorite =
        favoriteStatuses[card.id] !== undefined
          ? favoriteStatuses[card.id]
          : !!card.isFavorite;

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
        return (
          <RentProductCard
            key={card.id || index}
            car={card}
            onFavoriteToggle={handleFavoriteToggle}
          />
        );
      }
    },
    [isMobile, favoriteStatuses, handleFavoriteToggle, t],
  );

  return (
    <Box className="mb-5 mt-5 w-full">
      <Box variant="column" className="w-full">
        <Box className="w-full flex justify-between items-center mb-4">
          {showTitle ? (
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
              {t('allCars.title', { defaultValue: `All ${categoryName}` })}
            </Text>
          ) : <div />}

          {isAuthenticated && (
            <Button
              onClick={() => setIsAlertModalOpen(true)}
              className="bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:opacity-90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t('allCars.createAlert')}
            </Button>
          )}
        </Box>

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
          <Box className="w-full py-12 text-center" variant="center">
            <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
              {/* Empty state illustration */}
              <div className="relative">
                <div className="text-7xl opacity-30">
                  {categoryName.toLowerCase().includes('car') ? (
                    '🚗'
                  ) : categoryIcon.startsWith('http') ? (
                    <img src={categoryIcon} alt={categoryName} className="w-20 h-20 object-contain mx-auto opacity-50" />
                  ) : (
                    categoryIcon
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Bell className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Text className="text-xl font-bold text-gray-700">
                  {t('allCars.noResults')}
                </Text>
                <Text className="text-gray-500 text-sm leading-relaxed">
                  {t('allCars.noResultsMessage')}
                </Text>
              </div>

              {isAuthenticated && (
                <div className="bg-gradient-to-br from-[#198341]/5 to-[#ABDE3B]/10 border border-[#198341]/20 rounded-2xl p-6 w-full space-y-3">
                  <p className="text-sm font-semibold text-[#198341]">
                    {isArabic
                      ? `🔔 هل تريد أن تُعلَم عندما تتوفر ${categoryName} مطابقة؟`
                      : `🔔 Want to be notified when matching ${categoryName.toLowerCase()} items are listed?`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isArabic
                      ? `سنُرسل لك تنبيهاً فور توفّر إعلانات تناسب بحثك`
                      : `We'll notify you as soon as items matching your search are available`}
                  </p>
                  <Button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    {isArabic ? 'أخبرني عند التوفر' : 'Notify Me'}
                  </Button>
                </div>
              )}
            </div>
          </Box>
        )}

        {!isLoading && !error && carListings.length > 0 && (
          <>
            {isMobile ? (
              <Box className="w-full flex-col">
                {carListings.map((card, index) => (
                  <React.Fragment key={index}>
                    {renderCarListing(card, index)}

                    {/* Insert Ad after every 8 listings */}
                    {(index + 1) % 8 === 0 && (() => {
                      const currentAdIndex = (adsData && adsData.length > 0) ? (currentPage - 1) % adsData.length : 0;

                      return (
                        <AdsSectionProduct
                          adIndex={currentAdIndex}
                          adsData={adsData}
                          isLoadingAds={isLoadingAds}
                        />
                      );
                    })()}
                  </React.Fragment>
                ))}
              </Box>
            ) : (
              <Box
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
                variant="center"
              >
                {carListings.map((card, index) => (
                  <React.Fragment key={index}>
                    {renderCarListing(card, index)}

                    {/* Insert Ad after every 8 listings */}
                    {(index + 1) % 8 === 0 && (() => {
                      const currentAdIndex = (adsData && adsData.length > 0) ? (currentPage - 1) % adsData.length : 0;

                      return (
                        <div className="col-span-full">
                          <AdsSectionProduct 
                            adIndex={currentAdIndex}
                            adsData={adsData}
                            isLoadingAds={isLoadingAds}
                          />
                        </div>
                      );
                    })()}
                  </React.Fragment>
                ))}
              </Box>
            )}

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

      {/* Car Alert Modal — pre-fill with active search filters */}
      <CarAlertModal
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
        listingTypeId={filters.listingTypeId}
        initialData={{
          makeId: filters.selectedBrands[0] ? Number(filters.selectedBrands[0]) : 0,
          modelId: filters.model ? Number(filters.model) : 0,
          trimId: filters.trim ? Number(filters.trim) : 0,
          minPrice: filters.minPrice ? Number(filters.minPrice) : 0,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : 0,
          governorate: filters.governorate || '',
          city: filters.city || '',
        }}
        governorateOptions={getGovernorateOptions(isArabic)}
        getCityOptions={(gov) => getCityOptions(gov, isArabic)}
        isArabic={isArabic}
        t={t}
      />
    </Box>
  );
};

export default AllCarListings;
