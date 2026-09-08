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
import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ProductCardListView } from '@/components/web/design/ProductCardListView';
import { getInjection } from '@/di/container';
import type { QueryParams } from '@/core/entities/api/api';
import type { ViewMode } from '@/core/entities/models/cars/filter-types';
import Pagination from '@/components/shared/Pagination';
import { RentProductCard } from '@/components/web/design/RentProductCard';
import FloatingProfileShareButton from './FloatingProfileShareButton';

interface ProfileClientProps {
  profileDataRes: ApiResponse<PublicProfileData>;
  isAuthenticated: boolean;
  locale: string;
  isOwnProfile: boolean;
  userId: number;
}

const ProfileClient = ({
  profileDataRes,
  isAuthenticated,
  locale,
  isOwnProfile,
  userId,
}: ProfileClientProps) => {
  const profileData = profileDataRes.data;
  const t = useTranslations('publicProfile');

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
      <Box variant="center" className="min-h-screen w-full">
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
    <div className="bg-background w-full min-h-screen mb-5 mt-5">
      <Box variant="container" className="w-full mb-8 mt-8">
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

      <Box variant="container">
        {/* Profile Header */}
        <Box className="w-full mb-6">
          <ProfileHeader
            profile={profileData}
            isLoading={false}
            isOwnProfile={isOwnProfile}
          />
        </Box>

        {/* Profile Stats */}
        <Box className="w-full mb-6">
          <ProfileStats profile={profileData} isLoading={false} />
        </Box>

        {/* Car Listings Section */}
        <Box className="w-full flex flex-col gap-2">
          {/* Section Header */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
              <Text variant="h3" className="font-bold text-[#2C3C39] dark:text-white">
                {t('listings.title')}
              </Text>
            </div>
          </div>

          {/* Listing Type Filter Chips (§6.4) */}
          {profileData.countsByListingType && profileData.countsByListingType.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
              <button
                type="button"
                onClick={() => handleListingTypeChange(undefined)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  listingTypeId === undefined
                    ? 'bg-[#198341] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{t('type_chip_all', { defaultValue: 'All' })}</span>
                <span className="opacity-80 text-[11px]">({profileData.totalListings})</span>
              </button>

              {profileData.countsByListingType.map((ct) => {
                const typeObj = listingTypes.find((lt) => lt.id === ct.listingTypeId);
                const typeName =
                  typeObj?.nameTranslations?.[locale] ||
                  typeObj?.name ||
                  `Type #${ct.listingTypeId}`;
                const isSelected = listingTypeId === ct.listingTypeId;

                return (
                  <button
                    key={ct.listingTypeId}
                    type="button"
                    onClick={() => handleListingTypeChange(ct.listingTypeId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#198341] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{typeName}</span>
                    <span className="opacity-80 text-[11px]">({ct.count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Filter Component */}
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

          {/* Listings Grid */}
          {isLoadingListings ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full'
                  : 'space-y-4 w-full'
              }
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="bg-white dark:bg-zinc-900 border-none rounded-xl overflow-hidden shadow-md"
                >
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : carListingsData?.data?.data &&
            carListingsData.data.data.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full'
                  : 'space-y-4 w-full'
              }
            >
              {carListingsData.data.data.map((car, index) => {
                if (viewMode === 'list') {
                  return (
                    <ProductCardListView
                      key={car.id}
                      carListing={car}
                      isMarkedFavorite={!!car.isFavorite}
                      onFavoriteToggle={() => {}}
                      showFavorites={!isOwnProfile}
                      profile={true}
                      isAuthenticated={isAuthenticated}
                      isMine={isOwnProfile}
                    />
                  );
                }
                return (
                  <div key={index} className="col-span-1">
                    <RentProductCard car={car} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center shadow-md w-full">
              <Text variant="p" className="text-gray-500 dark:text-zinc-400">
                {t('listings.noListings')}
              </Text>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingListings &&
            carListingsData?.data?.data &&
            carListingsData.data.data.length > 0 &&
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
        </Box>
      </Box>
      <FloatingProfileShareButton profileName={profileData.name} />
    </div>
  );
};

export default ProfileClient;
