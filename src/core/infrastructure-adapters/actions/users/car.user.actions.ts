'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import {
  CreateFavoriteCarListingDto,
  ToggleFavoriteCarListingDto,
  ToggleFavoriteResponse,
  UserFavoriteCarListing,
} from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { getInjection } from '@/di/container';

export const getCarFavorites = async (
  params: QueryParams,
): Promise<PaginatedResponse<UserFavoriteCarListing>> => {
  const carListingController = getInjection('ICarUserController');
  const res = await carListingController.getCarFavorites(params);
  return res;
};

export const addCarListingToFavorites = async (
  dto: CreateFavoriteCarListingDto,
): Promise<ApiResponse<UserFavoriteCarListing>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.addCarListingToFavorites(dto);

  return res;
};

export const removeCarListingFromFavorites = async (
  id: number,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.removeCarListingFromFavorites(id);

  return res;
};

export const toggleCarListingFavorite = async (
  dto: ToggleFavoriteCarListingDto,
): Promise<ApiResponse<ToggleFavoriteResponse>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.toggleCarListingFavorite(dto);

  return res;
};

export const checkIsCarListingFavorite = async (
  carListingId: number,
): Promise<ApiResponse<boolean>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.checkIsCarListingFavorite(
    carListingId,
  );

  return res;
};

export const createCarListing = async (
  createCarListingDto: CreateCarListingDto,
): Promise<ApiResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarUserController');
  const res = await carListingController.addCarListing(createCarListingDto);

  return res;
};

export const updateCarListing = async (
  id: number,
  dto: UpdateCarListingDto,
): Promise<ApiResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.editCarListing(id, dto);

  return res;
};

export const deleteCarListing = async (
  id: number,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.deleteCarListing(id);

  return res;
};

export const getMyCarListings = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.getMyCars(params);

  return res;
};
