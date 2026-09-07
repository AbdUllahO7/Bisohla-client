'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { TopSellerSummaryDto } from '@/core/entities/models/public-profile/top-seller.dto';
import { getReq } from '@/core/lib/api';

export const getUserProfileInfo = async (
  id: number,
): Promise<ApiResponse<PublicProfileData>> => {
  const result = await getReq({
    url: '/public/profile/v2/' + id,
  });

  return result;
};

export const getPublicUserCarListings = async (
  id: number,
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarListingDto>> => {
  const result = await getReq({
    url: `/public/profile/v2/${id}/listings`,
    params,
  });

  return result;
};

/**
 * Fetches the top sellers list from GET /public/profile/v2/top-sellers.
 * Results are cached server-side; each seller has id, name, profileUrl and listingsCount.
 *
 * @param maxCount  - maximum rows to return (backend cap = 50, default = 10)
 * @param minListings - only sellers with > minListings public listings are included
 */
export const getTopSellers = async (
  maxCount?: number,
  minListings?: number,
): Promise<ApiResponse<TopSellerSummaryDto[]>> => {
  const params: Record<string, any> = {};
  if (maxCount != null) params.maxCount = maxCount;
  if (minListings != null) params.minListings = minListings;

  const result = await getReq({
    url: '/public/profile/v2/top-sellers',
    params: Object.keys(params).length > 0 ? params : undefined,
  });

  return result;
};

/**
 * Fetches the paginated sellers directory from GET /public/profile/v2/sellers.
 * Results are cached server-side; supports case-insensitive name search.
 *
 * @param page - current page (default 1)
 * @param pageSize - page size (default 20, max 50)
 * @param searchTerm - optional substring match on seller name
 */
export const getSellers = async (
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
): Promise<ApiResponse<PaginationInfo<TopSellerSummaryDto>>> => {
  const params: Record<string, any> = {
    page: Math.max(1, page),
    pageSize: Math.min(50, Math.max(1, pageSize)),
  };
  if (searchTerm && searchTerm.trim()) {
    params.searchTerm = searchTerm.trim();
  }

  const result = await getReq({
    url: '/public/profile/v2/sellers',
    params,
  });

  return result;
};

export const getSellerById = getUserProfileInfo;

