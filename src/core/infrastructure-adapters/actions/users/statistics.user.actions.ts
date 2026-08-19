'use server';

import { getAuthReq } from '@/core/lib/api';
import { ApiResponse } from '@/core/entities/api/success.response';
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

/**
 * Get user's aggregate statistics via GET /my-listing-statistics
 */
export const getMyListingStats = async (): Promise<ApiResponse<UserStatisticsOverview>> => {
  return await getAuthReq<Record<string, unknown>, UserStatisticsOverview>({
    url: '/my-listing-statistics',
  });
};

/**
 * Get user's statistics highlights via GET /my-listing-statistics/highlights
 */
export const getMyListingHighlights = async (): Promise<ApiResponse<UserStatisticsHighlights>> => {
  return await getAuthReq<Record<string, unknown>, UserStatisticsHighlights>({
    url: '/my-listing-statistics/highlights',
  });
};

/**
 * Get single listing statistics via GET /my-listings/:id/statistics
 */
export const getSingleListingStats = async (
  listingId: number,
): Promise<ApiResponse<ListingStatisticsData>> => {
  return await getAuthReq<Record<string, unknown>, ListingStatisticsData>({
    url: `/my-listings/${listingId}/statistics`,
  });
};

/**
 * Get user aggregate views trends via GET /my-listing-statistics/trends/views
 */
export const getMyViewsTrends = async (
  filters?: TrendsFilter,
): Promise<ApiResponse<ViewsTrendResponse>> => {
  return await getAuthReq<TrendsFilter, ViewsTrendResponse>({
    url: '/my-listing-statistics/trends/views',
    params: filters,
  });
};

/**
 * Get user aggregate contacts trends via GET /my-listing-statistics/trends/contacts
 */
export const getMyContactsTrends = async (
  filters?: TrendsFilter,
): Promise<ApiResponse<ContactsTrendResponse>> => {
  return await getAuthReq<TrendsFilter, ContactsTrendResponse>({
    url: '/my-listing-statistics/trends/contacts',
    params: filters,
  });
};

/**
 * Get user aggregate shares trends via GET /my-listing-statistics/trends/shares
 */
export const getMySharesTrends = async (
  filters?: TrendsFilter,
): Promise<ApiResponse<SharesTrendResponse>> => {
  return await getAuthReq<TrendsFilter, SharesTrendResponse>({
    url: '/my-listing-statistics/trends/shares',
    params: filters,
  });
};

/**
 * Get user aggregate details viewed trends via GET /my-listing-statistics/trends/details-viewed
 */
export const getMyDetailsViewedTrends = async (
  filters?: TrendsFilter,
): Promise<ApiResponse<DetailsViewedTrendResponse>> => {
  return await getAuthReq<TrendsFilter, DetailsViewedTrendResponse>({
    url: '/my-listing-statistics/trends/details-viewed',
    params: filters,
  });
};

/**
 * Get user aggregate view duration trends via GET /my-listing-statistics/trends/duration
 */
export const getMyDurationTrends = async (
  filters?: TrendsFilter,
): Promise<ApiResponse<DurationTrendResponse>> => {
  return await getAuthReq<TrendsFilter, DurationTrendResponse>({
    url: '/my-listing-statistics/trends/duration',
    params: filters,
  });
};

/**
 * Get single listing views trends via GET /my-listings/:id/statistics/trends/views
 */
export const getListingViewsTrends = async (
  listingId: number,
  filters?: ListingTrendsFilter,
): Promise<ApiResponse<ViewsTrendResponse>> => {
  return await getAuthReq<ListingTrendsFilter, ViewsTrendResponse>({
    url: `/my-listings/${listingId}/statistics/trends/views`,
    params: filters,
  });
};

/**
 * Get single listing contacts trends via GET /my-listings/:id/statistics/trends/contacts
 */
export const getListingContactsTrends = async (
  listingId: number,
  filters?: ListingTrendsFilter,
): Promise<ApiResponse<ContactsTrendResponse>> => {
  return await getAuthReq<ListingTrendsFilter, ContactsTrendResponse>({
    url: `/my-listings/${listingId}/statistics/trends/contacts`,
    params: filters,
  });
};

/**
 * Get single listing shares trends via GET /my-listings/:id/statistics/trends/shares
 */
export const getListingSharesTrends = async (
  listingId: number,
  filters?: ListingTrendsFilter,
): Promise<ApiResponse<SharesTrendResponse>> => {
  return await getAuthReq<ListingTrendsFilter, SharesTrendResponse>({
    url: `/my-listings/${listingId}/statistics/trends/shares`,
    params: filters,
  });
};

/**
 * Get single listing details viewed trends via GET /my-listings/:id/statistics/trends/details-viewed
 */
export const getListingDetailsViewedTrends = async (
  listingId: number,
  filters?: ListingTrendsFilter,
): Promise<ApiResponse<DetailsViewedTrendResponse>> => {
  return await getAuthReq<ListingTrendsFilter, DetailsViewedTrendResponse>({
    url: `/my-listings/${listingId}/statistics/trends/details-viewed`,
    params: filters,
  });
};

/**
 * Get single listing view duration trends via GET /my-listings/:id/statistics/trends/duration
 */
export const getListingDurationTrends = async (
  listingId: number,
  filters?: ListingTrendsFilter,
): Promise<ApiResponse<DurationTrendResponse>> => {
  return await getAuthReq<ListingTrendsFilter, DurationTrendResponse>({
    url: `/my-listings/${listingId}/statistics/trends/duration`,
    params: filters,
  });
};
