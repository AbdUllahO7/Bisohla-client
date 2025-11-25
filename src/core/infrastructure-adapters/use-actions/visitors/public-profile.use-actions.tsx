'use client';

import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import { useLocaleQuery } from '../common/use-locale-query';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import {
  getPublicUserCarListings,
  getUserProfileInfo,
} from '../../actions/visitors/public-profile.actions';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { QueryParams } from '@/core/entities/api/api';

export const useGetUserInfo = (id: number) =>
  useLocaleQuery<ApiResponse<PublicProfileData>>({
    queryKey: ['user-public', id],
    queryFn: async () => await getUserProfileInfo(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
