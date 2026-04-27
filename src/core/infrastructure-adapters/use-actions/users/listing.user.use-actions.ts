'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiResponse, PaginatedResponse, SuccessResponseWithNoContent } from '@/core/entities/api/success.response';
import { QueryParams } from '@/core/entities/api/api';
import { useLocaleQuery } from '../common/use-locale-query';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import {
  getMyListings,
  getListingById,
  deleteListing,
  createListing,
  updateListing
} from '../../actions/users/listing.user.actions';
import { CreateListingDto, UpdateListingDto } from '@/core/entities/models/listings/create-listing.dto';

/**
 * Hook to get current user's listings
 */
export const useMyListings = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<ListingDto>>({
    queryKey: ['my-listings', params],
    queryFn: async () => await getMyListings(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

/**
 * Hook to get a specific listing by ID
 */
export const useGetListingById = (id: number) =>
  useLocaleQuery<ApiResponse<ListingDto>>({
    queryKey: ['my-listing-by-id', id],
    queryFn: async () => await getListingById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

/**
 * Hook to delete a listing
 */
export const useDeleteListing = () =>
  useMutation<ApiResponse<Record<string, unknown>>, Error, { id: number }>({
    mutationFn: async ({ id }) => await deleteListing(id),
  });

/**
 * Hook to create a new listing
 */
export const useCreateListing = () =>
  useMutation<ApiResponse<ListingDto>, Error, CreateListingDto>({
    mutationFn: async (dto) => await createListing(dto),
  });

/**
 * Hook to update an existing listing
 */
export const useUpdateListing = () =>
  useMutation<ApiResponse<ListingDto>, Error, { id: number; data: UpdateListingDto }>({
    mutationFn: async ({ id, data }) => await updateListing(id, data),
  });
