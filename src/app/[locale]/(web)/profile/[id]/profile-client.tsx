'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';
import ProfileHeader from '@/components/web/ProfilePage/ProfileHeader';
import ProfileStats from '@/components/web/ProfilePage/ProfileStats';
import PublicProfileFilter from '@/components/web/ProfilePage/PublicProfileFilter';
import { ApiResponse } from '@/core/entities/api/success.response';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { useGetPublicUserCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState, useCallback, useMemo } from 'react';
import type { QueryParams } from '@/core/entities/api/api';
import type { ViewMode } from '@/core/entities/models/cars/filter-types';
import Pagination from '@/components/Pagination';
import { ProfileCarCard } from './profile-car-card';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';

interface ProfileClientProps {
  profileDataRes: ApiResponse<PublicProfileData>;
  isAuthenticated: boolean;
  locale: string;
  isOwnProfile: boolean;
  userId: number;
}

const ProfileClient = ({
  profileDataRes,
  isOwnProfile,
  userId,
}: ProfileClientProps) => {
  const profileData = profileDataRes.data;
  const t = useTranslations('publicProfile');
  const breadcrumbT = useTranslations('breadcrumb');

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [filterParams, setFilterParams] = useState<QueryParams>({
    page: 1,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  // Fetch user's car listings with filters
  const { data: carListingsData, isLoading: isLoadingListings } =
    useGetPublicUserCarListings(userId, true, {
      page: filterParams.page || 1,
      pageSize: filterParams.pageSize || pageSize,
      sortBy: filterParams.sortBy || 'createdAt',
      sortDirection: filterParams.sortDirection || 'desc',
      filterGroups: filterParams.filterGroups,
      searchKey: filterParams.searchKey,
      searchTerm: filterParams.searchTerm,
    });

  // Handle filter changes
  const handleFilterChange = useCallback((params: QueryParams) => {
    setFilterParams({
      ...params,
      page: 1, // Reset to first page when filters change
      pageSize: pageSize,
    });
    setCurrentPage(1);
  }, []);

  // Handle page change from pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setFilterParams((prev) => ({
      ...prev,
      page: page,
    }));
  }, []);

  // Extract pagination metadata from response
  const paginationMeta = useMemo(() => {
    interface PaginationMeta {
      currentPage?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      totalItems?: number;
    }
    const meta = (carListingsData?.data || {}) as PaginationMeta;
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
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
              <Text variant="h3" className="font-bold text-[#2C3C39]">
                {t('listings.title')}
              </Text>
            </div>
          </div>

          {/* Filter Component */}
          <PublicProfileFilter
            onChange={handleFilterChange}
            totalItems={paginationMeta.totalItems}
            isLoading={isLoadingListings}
          />

          {/* Listings Grid */}
          {isLoadingListings ? (
            <div
              className={
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full'
              }
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="bg-white border-none rounded-xl overflow-hidden shadow-md"
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
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full'
              }
            >
              {carListingsData.data.data.map((car, index) => {
                return (
                  // <>
                  //   {/* Insert Ad after every 8 listings */}
                  //   {(index + 1) % 8 === 0 && (
                  //     <div className="col-span-4">
                  //       <AdsSectionProduct />
                  //     </div>
                  //   )}
                  //   <ProfileCarCard car={car} />
                  // </>
                  <div key={index} className="col-span-1">
                    <ProfileCarCard car={car} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-md w-full">
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
    </div>
  );
};

export default ProfileClient;
