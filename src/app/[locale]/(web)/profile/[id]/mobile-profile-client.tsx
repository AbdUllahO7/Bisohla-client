'use client';

import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import ProfileHeader from '@/components/web/ProfilePage/ProfileHeader';
import ProfileStats from '@/components/web/ProfilePage/ProfileStats';
import MyProductsFilter from '@/components/dashboard/Products/MyProductsFilter';
import { ApiResponse } from '@/core/entities/api/success.response';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { useGetPublicUserCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ProductCardListView } from '@/components/web/design/ProductCardListView';
import { getInjection } from '@/di/container';
import type { QueryParams } from '@/core/entities/api/api';
import type { ViewMode } from '@/core/entities/models/cars/filter-types';
import Pagination from '@/components/shared/Pagination';
import { ProfileCarCard } from './profile-car-card';
import FloatingProfileShareButton from './FloatingProfileShareButton';

interface MobileProfileClientProps {
  profileDataRes: ApiResponse<PublicProfileData>;
  isAuthenticated: boolean;
  locale: string;
  isOwnProfile: boolean;
  userId: number;
}

const MobileProfileClient = ({
  profileDataRes,
  isOwnProfile,
  userId,
}: MobileProfileClientProps) => {
  const profileData = profileDataRes.data;
  const t = useTranslations('publicProfile');
  const breadcrumbT = useTranslations('breadcrumb');

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [listingTypeId, setListingTypeId] = useState<number | undefined>(undefined);
  const [listingTypes, setListingTypes] = useState<any[]>([]);
  const pageSize = 12;

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
      (params as any).listingTypeId = listingTypeId;
    }
    
    const currentStr = JSON.stringify(params);
    if (lastParamsStr.current !== currentStr) {
      lastParamsStr.current = currentStr;
      return params;
    }
    return JSON.parse(lastParamsStr.current) as QueryParams;
  }, [filterParams, listingTypeId, currentPage]);

  // Fetch user's listings with filters
  const { data: carListingsData, isLoading: isLoadingListings, refetch } =
    useGetPublicUserCarListings(userId, true, combinedQueryParams);

  // Force refetch when query params change to ensure real-time updates
  useEffect(() => {
    if (refetch) refetch();
  }, [combinedQueryParams, refetch]);

  // Handle filter changes
  const handleFilterChange = useCallback((params: QueryParams) => {
    setFilterParams({
      ...params,
      page: 1, // Reset to first page when filters change
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
  }, [pageSize]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Handle page change from pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (refetch) refetch();
  }, [refetch]);

  // Extract pagination metadata from response
  const paginationMeta = useMemo(() => {
    interface PaginationMeta {
      currentPage?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      totalItems?: number;
    }
    const meta = (carListingsData?.data || carListingsData || {}) as PaginationMeta;
    return {
      currentPage: meta.currentPage || currentPage,
      totalPages: meta.totalPages || 1,
      hasNextPage: meta.hasNextPage || false,
      hasPreviousPage: meta.hasPreviousPage || false,
      totalItems: meta.totalItems || 0,
    };
  }, [carListingsData, currentPage]);

  if (!profileData) {
    return (
      <Box variant="center" className="min-h-screen">
        <Text variant="p">{t('noData')}</Text>
      </Box>
    );
  }

  // Define breadcrumb items
  const breadcrumbItems = [
    {
      label: profileData.name,
    },
  ];

  return (
    <div className="bg-background w-full min-h-screen pb-5">
      <Box className="w-full mb-4 py-5 px-8">
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

      <Box className="w-full px-4 flex flex-col gap-4">
        {/* Profile Header */}
        <Box className="w-full mb-4">
          <ProfileHeader
            profile={profileData}
            isLoading={false}
            isOwnProfile={isOwnProfile}
          />
        </Box>

        {/* Profile Stats */}
        <Box className="w-full mb-4">
          <ProfileStats profile={profileData} isLoading={false} />
        </Box>

        {/* Car Listings Section */}
        <div className="w-full">
          {/* Section Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
              <Text variant="h4" className="font-bold text-[#2C3C39]">
                {t('listings.title')}
              </Text>
            </div>
          </div>

          {/* Filter Component */}
          <div className="mb-4">
            <MyProductsFilter
              onChange={handleFilterChange}
              onListingTypeChange={handleListingTypeChange}
              listingTypeId={listingTypeId}
              listingTypes={listingTypes}
              onViewModeChange={handleViewModeChange}
              viewMode={viewMode}
              totalItems={paginationMeta.totalItems}
              isLoading={isLoadingListings}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Listings Grid */}
          {isLoadingListings ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'
                  : 'space-y-3 w-full'
              }
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="bg-white border-none rounded-xl overflow-hidden shadow-md"
                >
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : carListingsData?.data?.data &&
            carListingsData.data.data.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'
                  : 'space-y-3 w-full'
              }
            >
              {carListingsData.data.data.map((car, index) => {
                if (viewMode === 'list') {
                  return (
                    <ProductCardListView
                      key={car.id}
                      carListing={car}
                      isMarkedFavorite={car.isFavorite}
                      onFavoriteToggle={() => {}}
                      showFavorites={false}
                      profile={true}
                      isAuthenticated={isAuthenticated}
                      isMine={isOwnProfile}
                    />
                  );
                }
                return (
                  <div key={index} className="col-span-1">
                    <ProfileCarCard car={car} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <Text variant="p" className="text-gray-500">
                {t('listings.noListings')}
              </Text>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingListings &&
            carListingsData?.data?.data &&
            carListingsData.data.data.length > 0 &&
            paginationMeta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={paginationMeta.currentPage}
                  totalPages={paginationMeta.totalPages}
                  hasNextPage={paginationMeta.hasNextPage}
                  hasPreviousPage={paginationMeta.hasPreviousPage}
                  totalItems={paginationMeta.totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  showItemsInfo={true}
                  className="mt-4"
                />
              </div>
            )}
        </div>
      </Box>
      <FloatingProfileShareButton profileName={profileData.name} />
    </div>
  );
};

export default MobileProfileClient;
