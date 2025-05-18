'use server';

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

import { getInjection } from '@/di/container';

export const getCarListings = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarListings(params);

  return res;
};

export const getCarMakes = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarMakeDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarMakes(params);

  return res;
};

export const getCarModels = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarModelDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarModels(params);

  return res;
};

export const getCarTrims = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarTrimDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarTrims(params);

  return res;
};

export const getCarFeatures = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectFeatureDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarFetures(params);

  return res;
};

export const getCarListingById = async (
  params: QueryParams,
): Promise<ApiResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarListingById(params);

  return res;
};

export const getPublicFilterFacets = async (
  params: QueryParams,
): Promise<ApiResponse<FacetCount[]>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.getPublicFilterFacets(params);

  return res;
};
