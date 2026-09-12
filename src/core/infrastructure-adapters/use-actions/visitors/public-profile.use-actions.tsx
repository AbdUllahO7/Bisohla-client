'use client';

import {
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
} from '@/core/entities/api/success.response';
import { useLocaleQuery } from '../common/use-locale-query';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { TopSellerSummaryDto } from '@/core/entities/models/public-profile/top-seller.dto';
import {
  getPublicUserCarListings,
  getUserProfileInfo,
  getTopSellers,
  getSellers,
} from '../../actions/visitors/public-profile.actions';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { QueryParams } from '@/core/entities/api/api';

export const useGetUserInfo = (id: number) =>
  useLocaleQuery<ApiResponse<PublicProfileData>>({
    queryKey: ['user-public', id],
    queryFn: async () => await getUserProfileInfo(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetSellerById = useGetUserInfo;

export const useGetPublicUserCarListings = (
  id: number,
  enabled = true,
  params: QueryParams = {},
) =>
  useLocaleQuery<PaginatedResponse<SelectCarListingDto>>({
    queryKey: ['public-user-car-listings', id, params],
    queryFn: async () => await getPublicUserCarListings(id, params),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetTopSellers = (
  maxCount = 10,
  minListings = 0,
  enabled = true,
) =>
  useLocaleQuery<ApiResponse<TopSellerSummaryDto[]>>({
    queryKey: ['top-sellers', maxCount, minListings],
    queryFn: async () => await getTopSellers(maxCount, minListings),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetSellers = (
  page = 1,
  pageSize = 20,
  searchTerm = '',
  enabled = true,
) =>
  useLocaleQuery<ApiResponse<PaginationInfo<TopSellerSummaryDto>>>({
    queryKey: ['sellers-directory', page, pageSize, searchTerm],
    queryFn: async () => await getSellers(page, pageSize, searchTerm),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

