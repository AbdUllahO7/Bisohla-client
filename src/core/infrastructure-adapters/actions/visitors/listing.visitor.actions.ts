'use server';

import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse, ApiResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { RevealContactDto } from '@/core/entities/models/listings/reveal-contact.dto';
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

export const getListingBySlug = async (slug: string, params?: QueryParams): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getListingBySlug(slug, params);
};

export const getListingById = async (id: number, params?: QueryParams): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getListingById(id, params);
};

/**
 * Fetch a seller's number for one listing, when the listing came back with
 * `contactNumber: null` but `contactAvailable: true`.
 *
 * A Server Action rather than a GET Route Handler on purpose: a GET route would
 * be fired by Next `<Link>` prefetch on hover and spend the visitor's limited
 * daily reveals before they ever clicked. `listingId` must be the NUMERIC id —
 * the product route also accepts a slug, which this endpoint does not.
 */
export const revealListingContact = async (
  listingId: number
): Promise<ApiResponse<RevealContactDto>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.revealContact(listingId);
};

export const getMapListingsAction = async (params: {
  bbox: string;
  typeId?: number;
  offerType?: string;
  where?: any;
  filterGroups?: any;
}): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getMapListings(params);
};

export const getListingCardAction = async (slug: string): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getListingCard(slug);
};

export const getGovernorateCountsAction = async (): Promise<ApiResponse<any>> => {
  const repo = getInjection('IListingsVisitorRepo');
  return await repo.getGovernorateCounts();
};

