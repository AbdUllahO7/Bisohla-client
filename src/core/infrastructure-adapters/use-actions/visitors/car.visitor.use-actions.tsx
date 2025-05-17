'use client'; // TODO: remove this if you use it in react native

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';

import {
  FacetCount,
  SelectCarListingDto,
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
  SelectFeatureDto,
} from '@/core/entities/models/cars/cars.dto';

import {
  getCarFeatures,
  getCarListingById,
  getCarListings,
  getCarMakes,
  getCarModels,
  getCarTrims,
  getPublicFilterFacets,
} from '../../actions/visitors/car.visitor.actions';
import { useLocaleQuery } from '../common/use-locale-query';

export const useCarListings = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectCarListingDto>>({
    queryKey: ['visitors-car-listings', params],
    queryFn: async () => await getCarListings(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCarListingById = (params: QueryParams) =>
  useLocaleQuery<ApiResponse<SelectCarListingDto>>({
    queryKey: ['visitors-car-listings', { params }],
    queryFn: async () => await getCarListingById(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCarMakes = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectCarMakeDto>>({
    queryKey: ['visitors-car-listings', params],
    queryFn: async () => await getCarMakes(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });

export const useCarModels = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectCarModelDto>>({
    queryKey: ['visitors-car-listings', params],
    queryFn: async () => await getCarModels(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });

export const useCarTrims = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectCarTrimDto>>({
    queryKey: ['visitors-car-listings', params],
    queryFn: async () => await getCarTrims(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });

export const useCarFeatrues = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectFeatureDto>>({
    queryKey: ['visitors-car-features', params],
    queryFn: async () => await getCarFeatures(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });

export const useGetPublicFilterFacets = (params: QueryParams) =>
  useLocaleQuery<ApiResponse<FacetCount[]>>({
    queryKey: ['public-filter-facets', params],
    queryFn: async () => await getPublicFilterFacets(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });
