'use server';

import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse, ApiResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { getInjection } from '@/di/container';

export const searchListings = async (
  listingTypeId: number,
  params: QueryParams
): Promise<PaginatedResponse<ListingDto>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.searchListings(listingTypeId, params);
};

export const getFeaturedListings = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<ListingDto>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getFeaturedListings(undefined, { page, pageSize });
};

export const getTrendingListings = async (
  page?: number,
  pageSize?: number
): Promise<PaginatedResponse<ListingDto>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getTrendingListings({ page, pageSize });
};

export const getListingBySlug = async (slug: string): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getListingBySlug(slug);
};

export const getListingById = async (id: number): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getListingById(id);
};
