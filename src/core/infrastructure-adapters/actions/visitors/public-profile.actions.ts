'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { getReq } from '@/core/lib/api';

export const getUserProfileInfo = async (
  id: number,
): Promise<ApiResponse<PublicProfileData>> => {
  const result = await getReq({
    url: '/public/profile/' + id,
  });

  return result;
};

export const getPublicUserCarListings = async (
  id: number,
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarListingDto>> => {
  const result = await getReq({
    url: `/public/profile/${id}/car-listings`,
    params,
  });

  return result;
};
