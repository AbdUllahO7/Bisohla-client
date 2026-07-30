'use server';

import { postAuthReq, patchAuthReq, getAuthReq, deleteAuthReq, putAuthReq } from '@/core/lib/api';
import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { CreateListingDto, UpdateListingDto } from '@/core/entities/models/listings/create-listing.dto';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { QueryParams } from '@/core/entities/api/api';
import { UserFavoriteListing, ToggleFavoriteListingDto, ToggleFavoriteListingResponse, CreateFavoriteListingDto } from '@/core/entities/models/listings/users-favorites-listings.zod.dto';

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
  params?: QueryParams,
): Promise<ApiResponse<ListingDto>> => {
  const res = await getAuthReq<QueryParams, ListingDto>({
    url: `/my-listings/${id}`,
    params,
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

/**
 * Get listing favorites
 */
export const getListingFavorites = async (
  params: QueryParams,
): Promise<PaginatedResponse<UserFavoriteListing>> => {
  const cleanParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 20,
  };
  const res = await getAuthReq<QueryParams, any>({
    url: '/listing-favorites',
    params: cleanParams,
  });
  return res as PaginatedResponse<UserFavoriteListing>;
};

/**
 * Get listing favorite by id
 */
export const getListingFavoriteById = async (
  id: number,
): Promise<ApiResponse<UserFavoriteListing>> => {
  const res = await getAuthReq<Record<string, unknown>, UserFavoriteListing>({
    url: `/listing-favorites/${id}`,
  });
  return res;
};

/**
 * Toggle listing favorite
 */
export const toggleListingFavorite = async (
  dto: ToggleFavoriteListingDto,
): Promise<ApiResponse<ToggleFavoriteListingResponse>> => {
  const res = await postAuthReq<ToggleFavoriteListingDto, ToggleFavoriteListingResponse>({
    url: '/listing-favorites/toggle',
    body: dto,
  });
  return res;
};

/**
 * Add listing to favorites
 */
export const createListingFavorite = async (
  dto: CreateFavoriteListingDto,
): Promise<ApiResponse<UserFavoriteListing>> => {
  const res = await postAuthReq<CreateFavoriteListingDto, UserFavoriteListing>({
    url: '/listing-favorites',
    body: dto,
  });
  return res;
};

/**
 * Get listing statistics via GET /my-listings/{id}/statistics
 */
export const getListingStatistics = async (
  id: number,
): Promise<ApiResponse<any>> => {
  const res = await getAuthReq<Record<string, unknown>, any>({
    url: `/my-listings/${id}/statistics`,
  });
  return res;
};
