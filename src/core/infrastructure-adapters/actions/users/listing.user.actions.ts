'use server';

import { postAuthReq, patchAuthReq } from '@/core/lib/api';
import { ApiResponse } from '@/core/entities/api/success.response';
import { CreateListingDto, UpdateListingDto } from '@/core/entities/models/listings/create-listing.dto';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';

/**
 * Create a new listing via POST /my-listings
 */
export const createListing = async (
  dto: CreateListingDto,
): Promise<ApiResponse<ListingDto>> => {
  const res = await postAuthReq<CreateListingDto, ListingDto>({
    url: '/my-listings',
    body: dto,
  });
  return res;
};

/**
 * Update an existing listing via PATCH /my-listings/{id}
 */
export const updateListing = async (
  id: number,
  dto: UpdateListingDto,
): Promise<ApiResponse<ListingDto>> => {
  const res = await patchAuthReq<UpdateListingDto, ListingDto>({
    url: `/my-listings/${id}`,
    body: dto,
  });
  return res;
};
