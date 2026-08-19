'use client';

import { ApiResponse } from '@/core/entities/api/success.response';
import { useLocaleQuery } from '../common/use-locale-query';
import {
  ListingStatisticsData,
  UserStatisticsOverview,
  UserStatisticsHighlights,
  ViewsTrendResponse,
  ContactsTrendResponse,
  SharesTrendResponse,
  DetailsViewedTrendResponse,
  DurationTrendResponse,
  TrendsFilter,
  ListingTrendsFilter,
} from '@/core/entities/models/statistics/statistics.dto';
import {
  getMyListingStats,
  getMyListingHighlights,
  getSingleListingStats,
  getMyViewsTrends,
  getMyContactsTrends,
  getMySharesTrends,
  getMyDetailsViewedTrends,
  getMyDurationTrends,
  getListingViewsTrends,
  getListingContactsTrends,
  getListingSharesTrends,
  getListingDetailsViewedTrends,
  getListingDurationTrends,
} from '../../actions/users/statistics.user.actions';

/**
 * Hook to get current user's aggregate statistics
 */
export const useGetMyListingStats = () =>
  useLocaleQuery<ApiResponse<UserStatisticsOverview>>({
    queryKey: ['my-listing-statistics'],
    queryFn: async () => await getMyListingStats(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

/**
 * Hook to get current user's statistics highlights
 */
export const useGetMyListingHighlights = () =>
  useLocaleQuery<ApiResponse<UserStatisticsHighlights>>({
    queryKey: ['my-listing-statistics-highlights'],
    queryFn: async () => await getMyListingHighlights(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

/**
 * Hook to get single listing statistics
 */
export const useGetSingleListingStats = (listingId: number) =>
  useLocaleQuery<ApiResponse<ListingStatisticsData>>({
    queryKey: ['my-listing-statistics', listingId],
    queryFn: async () => await getSingleListingStats(listingId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });

/**
 * Hooks for Surface A (User Aggregate Trends)
 */
export const useGetMyViewsTrends = (filters?: TrendsFilter) =>
  useLocaleQuery<ApiResponse<ViewsTrendResponse>>({
    queryKey: ['my-trends-views', filters],
    queryFn: async () => await getMyViewsTrends(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetMyContactsTrends = (filters?: TrendsFilter) =>
  useLocaleQuery<ApiResponse<ContactsTrendResponse>>({
    queryKey: ['my-trends-contacts', filters],
    queryFn: async () => await getMyContactsTrends(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetMySharesTrends = (filters?: TrendsFilter) =>
  useLocaleQuery<ApiResponse<SharesTrendResponse>>({
    queryKey: ['my-trends-shares', filters],
    queryFn: async () => await getMySharesTrends(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetMyDetailsViewedTrends = (filters?: TrendsFilter) =>
  useLocaleQuery<ApiResponse<DetailsViewedTrendResponse>>({
    queryKey: ['my-trends-details-viewed', filters],
    queryFn: async () => await getMyDetailsViewedTrends(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useGetMyDurationTrends = (filters?: TrendsFilter) =>
  useLocaleQuery<ApiResponse<DurationTrendResponse>>({
    queryKey: ['my-trends-duration', filters],
    queryFn: async () => await getMyDurationTrends(filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

/**
 * Hooks for Surface B (Per-Listing Trends)
 */
export const useGetListingViewsTrends = (listingId: number, filters?: ListingTrendsFilter) =>
  useLocaleQuery<ApiResponse<ViewsTrendResponse>>({
    queryKey: ['listing-trends-views', listingId, filters],
    queryFn: async () => await getListingViewsTrends(listingId, filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });

export const useGetListingContactsTrends = (listingId: number, filters?: ListingTrendsFilter) =>
  useLocaleQuery<ApiResponse<ContactsTrendResponse>>({
    queryKey: ['listing-trends-contacts', listingId, filters],
    queryFn: async () => await getListingContactsTrends(listingId, filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });

export const useGetListingSharesTrends = (listingId: number, filters?: ListingTrendsFilter) =>
  useLocaleQuery<ApiResponse<SharesTrendResponse>>({
    queryKey: ['listing-trends-shares', listingId, filters],
    queryFn: async () => await getListingSharesTrends(listingId, filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });

export const useGetListingDetailsViewedTrends = (listingId: number, filters?: ListingTrendsFilter) =>
  useLocaleQuery<ApiResponse<DetailsViewedTrendResponse>>({
    queryKey: ['listing-trends-details-viewed', listingId, filters],
    queryFn: async () => await getListingDetailsViewedTrends(listingId, filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });

export const useGetListingDurationTrends = (listingId: number, filters?: ListingTrendsFilter) =>
  useLocaleQuery<ApiResponse<DurationTrendResponse>>({
    queryKey: ['listing-trends-duration', listingId, filters],
    queryFn: async () => await getListingDurationTrends(listingId, filters),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!listingId,
  });
