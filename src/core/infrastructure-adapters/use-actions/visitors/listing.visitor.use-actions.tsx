'use client';

import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { searchListings, getFeaturedListings, getTrendingListings } from '../../actions/visitors/listing.visitor.actions';
import { useLocaleQuery } from '../common/use-locale-query';

export const useListings = (listingTypeId: number, params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<ListingDto>>({
    queryKey: ['listings-visitor-search', listingTypeId, params],
    queryFn: async () => await searchListings(listingTypeId, params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingTypeId,
  });

export const useFeaturedListings = (page?: number, pageSize?: number) =>
  useLocaleQuery<PaginatedResponse<ListingDto>>({
    queryKey: ['listings-visitor-featured', page, pageSize],
    queryFn: async () => await getFeaturedListings(page, pageSize),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useTrendingListings = (page?: number, pageSize?: number) =>
  useLocaleQuery<PaginatedResponse<ListingDto>>({
    queryKey: ['listings-visitor-trending', page, pageSize],
    queryFn: async () => await getTrendingListings(page, pageSize),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
