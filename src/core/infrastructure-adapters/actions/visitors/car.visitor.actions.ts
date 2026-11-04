'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  BodyTypeCategoryCount,
  FacetCount,
  GovernorateCategoryCount,
  SelectCarListingDto,
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
  SelectFeatureDto,
} from '@/core/entities/models/cars/cars.dto';
import { getReq } from '@/core/lib/api';
import { catchClientRequest } from '@/core/lib/error';

import { getInjection } from '@/di/container';

export const getCarListings = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarVisitorController');

  const res = await carListingController.findCarListings(params);

  return res;
};

export const getBodyTypeCategoryCounts = async (
  listingTypeId: number = 1,
): Promise<ApiResponse<any>> => {
  try {
    const numericListingTypeId = Number(listingTypeId) || 1;
    const res = await getReq({
      url: `/listings-visitor/${numericListingTypeId}/category-counts`,
      next: {
        revalidate: 180,
      },
    });

    // If backend returns populated category counts for body_type, return it
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      const hasBodyTypeCounts = res.data.some(
        (attr: any) =>
          (attr.attributeSlug === 'body_type' || attr.slug === 'body_type') &&
          Array.isArray(attr.counts) &&
          attr.counts.length > 0,
      );
      if (hasBodyTypeCounts) {
        return res as ApiResponse<any>;
      }
    }

    // Fallback: For Cars (listingTypeId 1), fetch counts from public filter facets
    if (numericListingTypeId === 1) {
      const facetsRes = await getPublicFilterFacets({});
      if (facetsRes?.data && Array.isArray(facetsRes.data) && facetsRes.data.length > 0) {
        const bodyTypeFacets = facetsRes.data
          .filter(
            (f: any) =>
              f.field === 'details.bodyType' ||
              f.field === 'bodyType' ||
              f.field === 'attrs.body_type',
          )
          .map((f: any) => ({
            value: String(f.value).toLowerCase(),
            count: Number(f.count) || 0,
          }));

        if (bodyTypeFacets.length > 0) {
          return {
            success: true,
            message: 'Operation successful',
            data: [
              {
                attributeSlug: 'body_type',
                counts: bodyTypeFacets,
              },
            ],
          } as ApiResponse<any>;
        }
      }
    }

    return res as ApiResponse<any>;
  } catch (error) {
    return catchClientRequest(error);
  }
};

export const getCityCounts = async (): Promise<
  ApiResponse<GovernorateCategoryCount[]>
> => {
  try {
    const res = await getReq({
      url: '/car-listings-visitor/governorate-category-counts',
    });

    return res as ApiResponse<GovernorateCategoryCount[]>;
  } catch (error) {
    return catchClientRequest(error);
  }
};

export const getCarMakes = async (
  params: QueryParams & { selectedCarMakes?: number[] },
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
