'use server';

import { postAuthReq, patchAuthReq, getAuthReq, deleteAuthReq, putAuthReq } from '@/core/lib/api';
import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { CreateListingDto, UpdateListingDto } from '@/core/entities/models/listings/create-listing.dto';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { QueryParams } from '@/core/entities/api/api';

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
 * Update an existing listing via PUT /my-listings/{id}
 */
export const updateListing = async (
  id: number,
  dto: UpdateListingDto,
): Promise<ApiResponse<ListingDto>> => {
  const res = await putAuthReq<UpdateListingDto, ListingDto>({
    url: `/my-listings/${id}`,
    body: dto,
  });
  return res;
};

/**
 * Get user's listings via GET /my-listings
 */
export const getMyListings = async (
  params: QueryParams,
): Promise<PaginatedResponse<ListingDto>> => {
  const res = await getAuthReq<QueryParams, any>({
    url: '/my-listings',
    params,
  });
  return res as PaginatedResponse<ListingDto>;
};

/**
 * Get listing by ID via GET /my-listings/{id}
 */
export const getListingById = async (
  id: number,
): Promise<ApiResponse<ListingDto>> => {
  const res = await getAuthReq<Record<string, unknown>, ListingDto>({
    url: `/my-listings/${id}`,
  });
  return res;
};

/**
 * Delete a listing via DELETE /my-listings/{id}
 */
export const deleteListing = async (
  id: number,
): Promise<ApiResponse<Record<string, unknown>>> => {
  const res = await deleteAuthReq<Record<string, unknown>, Record<string, unknown>>({
    url: `/my-listings/${id}`,
  });
  return res;
};
